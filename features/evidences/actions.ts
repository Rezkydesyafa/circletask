"use server";

import { randomUUID } from "node:crypto";

import { revalidatePath } from "next/cache";

import { createActivityLog } from "@/features/activity-logs/log";
import {
  assertAssignedUser,
  assertGroupMember,
  getGroupRole,
  getTaskForAccess,
} from "@/features/permissions/server";
import type { ActionResult } from "@/features/shared/action-result";
import { getZodFieldErrors } from "@/features/shared/action-result";
import { getAuthenticatedBackend, getErrorMessage } from "@/features/shared/server";
import {
  getTaskEvidencePath,
  TASK_EVIDENCE_BUCKET,
} from "@/lib/upload";
import {
  createEvidenceUploadTargetSchema,
  evidenceIdSchema,
  externalEvidenceSchema,
  fileEvidenceMetadataSchema,
  replaceFileEvidenceMetadataSchema,
  type CreateEvidenceUploadTargetInput,
  type EvidenceIdInput,
  type ExternalEvidenceInput,
  type FileEvidenceMetadataInput,
  type ReplaceFileEvidenceMetadataInput,
} from "@/features/evidences/schemas";
import { countTaskEvidences } from "@/features/evidences/queries";

type EvidenceMutationResult = {
  id: string;
};

type EvidenceUploadTargetResult = {
  path: string;
  signedUrl: string;
  token: string;
};

type EvidenceMutationRecord = {
  id: string;
  task_id: string;
  uploaded_by: string;
  evidence_type: "file" | "link";
  file_path: string | null;
  file_name: string | null;
};

async function ensureEvidenceCapacity(taskId: string) {
  const evidenceCount = await countTaskEvidences(taskId);

  if (evidenceCount >= 3) {
    throw new Error("Maksimal 3 bukti pekerjaan per task.");
  }
}

function assertEvidencePathMatchesTask(filePath: string, groupId: string, projectId: string, taskId: string) {
  const expectedPrefix = `${groupId}/${projectId}/${taskId}/`;

  if (!filePath.startsWith(expectedPrefix) || filePath.includes("..")) {
    throw new Error("Path bukti pekerjaan tidak valid.");
  }
}

function revalidateEvidencePages(groupId: string, projectId: string, taskId: string) {
  revalidatePath(`/groups/${groupId}`);
  revalidatePath(`/groups/${groupId}/projects/${projectId}`);
  revalidatePath(`/groups/${groupId}/projects/${projectId}/tasks`);
  revalidatePath(`/groups/${groupId}/projects/${projectId}/tasks/${taskId}`);
}

async function getEvidenceForMutation(supabase: Awaited<ReturnType<typeof getAuthenticatedBackend>>["supabase"], evidenceId: string) {
  const { data, error } = await supabase
    .from("task_evidences")
    .select("id, task_id, uploaded_by, evidence_type, file_path, file_name")
    .eq("id", evidenceId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error("Bukti pekerjaan tidak ditemukan.");
  }

  return data as EvidenceMutationRecord;
}

async function assertCanMutateEvidence(
  supabase: Awaited<ReturnType<typeof getAuthenticatedBackend>>["supabase"],
  evidence: EvidenceMutationRecord,
  currentUserId: string,
  groupId: string
) {
  const role = await getGroupRole(supabase, groupId, currentUserId);

  if (role !== "leader" && evidence.uploaded_by !== currentUserId) {
    throw new Error("Bukti hanya bisa dikelola oleh uploader atau ketua kelompok.");
  }
}

async function removeStorageObjectIfExists(
  supabase: Awaited<ReturnType<typeof getAuthenticatedBackend>>["supabase"],
  filePath: string | null
) {
  if (!filePath) {
    return;
  }

  const { error } = await supabase.storage.from(TASK_EVIDENCE_BUCKET).remove([filePath]);

  if (error) {
    throw new Error(error.message);
  }
}

async function cleanupUploadedObjectAfterMetadataFailure(
  supabase: Awaited<ReturnType<typeof getAuthenticatedBackend>>["supabase"],
  filePath: string | null
) {
  try {
    await removeStorageObjectIfExists(supabase, filePath);
  } catch {
    // Metadata errors should remain the primary failure returned to the caller.
  }
}

function sanitizeFilename(filename: string) {
  const [rawName, ...extensionParts] = filename.trim().split(".");
  const extension = extensionParts.pop()?.toLowerCase();
  const safeName = rawName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);

  return `${safeName || "evidence"}-${randomUUID()}${extension ? `.${extension}` : ""}`;
}

export async function createEvidenceUploadTargetAction(
  input: CreateEvidenceUploadTargetInput
): Promise<ActionResult<EvidenceUploadTargetResult>> {
  const parsedInput = createEvidenceUploadTargetSchema.safeParse(input);

  if (!parsedInput.success) {
    return {
      ok: false,
      message: "Periksa kembali data file.",
      fieldErrors: getZodFieldErrors(parsedInput.error),
    };
  }

  try {
    const { supabase, user } = await getAuthenticatedBackend();
    const task = await getTaskForAccess(supabase, parsedInput.data.taskId);
    await assertGroupMember(supabase, task.group_id, user.id);
    assertAssignedUser(task, user.id);
    await ensureEvidenceCapacity(task.id);

    const path = getTaskEvidencePath({
      groupId: task.group_id,
      projectId: task.project_id,
      taskId: task.id,
      filename: sanitizeFilename(parsedInput.data.fileName),
    });
    const { data, error } = await supabase.storage
      .from(TASK_EVIDENCE_BUCKET)
      .createSignedUploadUrl(path);

    if (error) {
      throw new Error(error.message);
    }

    return {
      ok: true,
      data: {
        path: data.path,
        signedUrl: data.signedUrl,
        token: data.token,
      },
      message: "Upload target berhasil dibuat.",
    };
  } catch (error) {
    return {
      ok: false,
      message: getErrorMessage(error, "Gagal membuat upload target."),
    };
  }
}

export async function addExternalEvidenceAction(
  input: ExternalEvidenceInput
): Promise<ActionResult<EvidenceMutationResult>> {
  const parsedInput = externalEvidenceSchema.safeParse(input);

  if (!parsedInput.success) {
    return {
      ok: false,
      message: "Periksa kembali data bukti.",
      fieldErrors: getZodFieldErrors(parsedInput.error),
    };
  }

  try {
    const { supabase, user } = await getAuthenticatedBackend();
    const task = await getTaskForAccess(supabase, parsedInput.data.taskId);
    await assertGroupMember(supabase, task.group_id, user.id);
    assertAssignedUser(task, user.id);
    await ensureEvidenceCapacity(task.id);

    const evidenceId = randomUUID();
    const { error } = await supabase.from("task_evidences").insert({
      id: evidenceId,
      task_id: task.id,
      uploaded_by: user.id,
      evidence_type: "link",
      external_url: parsedInput.data.externalUrl,
      note: parsedInput.data.note,
    });

    if (error) {
      throw new Error(error.message);
    }

    await createActivityLog(supabase, {
      groupId: task.group_id,
      projectId: task.project_id,
      taskId: task.id,
      userId: user.id,
      action: "task.evidence_uploaded",
      description: "Link bukti pekerjaan ditambahkan",
      metadata: { evidence_id: evidenceId, evidence_type: "link" },
    });

    revalidateEvidencePages(task.group_id, task.project_id, task.id);

    return {
      ok: true,
      data: { id: evidenceId },
      message: "Link bukti berhasil ditambahkan.",
    };
  } catch (error) {
    return {
      ok: false,
      message: getErrorMessage(error, "Gagal menambahkan bukti."),
    };
  }
}

export async function deleteEvidenceAction(
  input: EvidenceIdInput
): Promise<ActionResult<EvidenceMutationResult>> {
  const parsedInput = evidenceIdSchema.safeParse(input);

  if (!parsedInput.success) {
    return {
      ok: false,
      message: "Evidence ID tidak valid.",
      fieldErrors: getZodFieldErrors(parsedInput.error),
    };
  }

  try {
    const { supabase, user } = await getAuthenticatedBackend();
    const evidence = await getEvidenceForMutation(supabase, parsedInput.data.evidenceId);
    const task = await getTaskForAccess(supabase, evidence.task_id);
    await assertGroupMember(supabase, task.group_id, user.id);
    await assertCanMutateEvidence(supabase, evidence, user.id, task.group_id);

    const { error } = await supabase.from("task_evidences").delete().eq("id", evidence.id);

    if (error) {
      throw new Error(error.message);
    }

    await removeStorageObjectIfExists(supabase, evidence.file_path);

    await createActivityLog(supabase, {
      groupId: task.group_id,
      projectId: task.project_id,
      taskId: task.id,
      userId: user.id,
      action: "task.evidence_deleted",
      description: "Bukti pekerjaan dihapus",
      metadata: { evidence_id: evidence.id, evidence_type: evidence.evidence_type },
    });

    revalidateEvidencePages(task.group_id, task.project_id, task.id);

    return {
      ok: true,
      data: { id: evidence.id },
      message: "Bukti pekerjaan berhasil dihapus.",
    };
  } catch (error) {
    return {
      ok: false,
      message: getErrorMessage(error, "Gagal menghapus bukti pekerjaan."),
    };
  }
}

export async function replaceFileEvidenceMetadataAction(
  input: ReplaceFileEvidenceMetadataInput
): Promise<ActionResult<EvidenceMutationResult>> {
  const parsedInput = replaceFileEvidenceMetadataSchema.safeParse(input);

  if (!parsedInput.success) {
    return {
      ok: false,
      message: "Periksa kembali metadata file pengganti.",
      fieldErrors: getZodFieldErrors(parsedInput.error),
    };
  }

  try {
    const { supabase, user } = await getAuthenticatedBackend();
    const evidence = await getEvidenceForMutation(supabase, parsedInput.data.evidenceId);
    const task = await getTaskForAccess(supabase, evidence.task_id);
    await assertGroupMember(supabase, task.group_id, user.id);
    await assertCanMutateEvidence(supabase, evidence, user.id, task.group_id);
    assertEvidencePathMatchesTask(parsedInput.data.filePath, task.group_id, task.project_id, task.id);

    if (parsedInput.data.taskId !== task.id) {
      throw new Error("Task ID tidak sesuai dengan bukti yang diganti.");
    }

    const { error } = await supabase
      .from("task_evidences")
      .update({
        evidence_type: "file",
        file_path: parsedInput.data.filePath,
        external_url: null,
        file_name: parsedInput.data.fileName,
        file_size: parsedInput.data.fileSize,
        note: parsedInput.data.note,
      })
      .eq("id", evidence.id);

    if (error) {
      await cleanupUploadedObjectAfterMetadataFailure(supabase, parsedInput.data.filePath);
      throw new Error(error.message);
    }

    if (evidence.file_path && evidence.file_path !== parsedInput.data.filePath) {
      await removeStorageObjectIfExists(supabase, evidence.file_path);
    }

    await createActivityLog(supabase, {
      groupId: task.group_id,
      projectId: task.project_id,
      taskId: task.id,
      userId: user.id,
      action: "task.evidence_replaced",
      description: "File bukti pekerjaan diganti",
      metadata: { evidence_id: evidence.id, file_name: parsedInput.data.fileName },
    });

    revalidateEvidencePages(task.group_id, task.project_id, task.id);

    return {
      ok: true,
      data: { id: evidence.id },
      message: "Bukti pekerjaan berhasil diganti.",
    };
  } catch (error) {
    return {
      ok: false,
      message: getErrorMessage(error, "Gagal mengganti bukti pekerjaan."),
    };
  }
}

export async function createFileEvidenceMetadataAction(
  input: FileEvidenceMetadataInput
): Promise<ActionResult<EvidenceMutationResult>> {
  const parsedInput = fileEvidenceMetadataSchema.safeParse(input);

  if (!parsedInput.success) {
    return {
      ok: false,
      message: "Periksa kembali metadata file.",
      fieldErrors: getZodFieldErrors(parsedInput.error),
    };
  }

  try {
    const { supabase, user } = await getAuthenticatedBackend();
    const task = await getTaskForAccess(supabase, parsedInput.data.taskId);
    await assertGroupMember(supabase, task.group_id, user.id);
    assertAssignedUser(task, user.id);
    assertEvidencePathMatchesTask(parsedInput.data.filePath, task.group_id, task.project_id, task.id);
    await ensureEvidenceCapacity(task.id);

    const evidenceId = randomUUID();
    const { error } = await supabase.from("task_evidences").insert({
      id: evidenceId,
      task_id: task.id,
      uploaded_by: user.id,
      evidence_type: "file",
      file_path: parsedInput.data.filePath,
      file_name: parsedInput.data.fileName,
      file_size: parsedInput.data.fileSize,
      note: parsedInput.data.note,
    });

    if (error) {
      await cleanupUploadedObjectAfterMetadataFailure(supabase, parsedInput.data.filePath);
      throw new Error(error.message);
    }

    await createActivityLog(supabase, {
      groupId: task.group_id,
      projectId: task.project_id,
      taskId: task.id,
      userId: user.id,
      action: "task.evidence_uploaded",
      description: "File bukti pekerjaan ditambahkan",
      metadata: {
        evidence_id: evidenceId,
        evidence_type: "file",
        file_name: parsedInput.data.fileName,
      },
    });

    revalidateEvidencePages(task.group_id, task.project_id, task.id);

    return {
      ok: true,
      data: { id: evidenceId },
      message: "Metadata file bukti berhasil disimpan.",
    };
  } catch (error) {
    return {
      ok: false,
      message: getErrorMessage(error, "Gagal menyimpan metadata bukti."),
    };
  }
}
