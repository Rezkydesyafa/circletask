"use server";

import { randomUUID } from "node:crypto";

import { revalidatePath } from "next/cache";

import { createActivityLog } from "@/features/activity-logs/log";
import { countTaskEvidences } from "@/features/evidences/queries";
import {
  assertAssignedUser,
  assertGroupLeader,
  assertGroupMember,
  assertUserIsGroupMember,
  getTaskForAccess,
} from "@/features/permissions/server";
import type { ActionResult } from "@/features/shared/action-result";
import { getZodFieldErrors } from "@/features/shared/action-result";
import { getAuthenticatedBackend, getErrorMessage } from "@/features/shared/server";
import { assertTaskStatusTransition } from "@/features/tasks/state-machine";
import {
  approveTaskSchema,
  reassignTaskSchema,
  requestRevisionSchema,
  submitReviewSchema,
  type ApproveTaskInput,
  type ReassignTaskInput,
  type RequestRevisionInput,
  type SubmitReviewInput,
} from "@/features/reviews/schemas";

type ReviewMutationResult = {
  id: string;
};

function revalidateReviewPages(groupId: string, projectId: string, taskId: string) {
  revalidatePath("/dashboard");
  revalidatePath(`/groups/${groupId}`);
  revalidatePath(`/groups/${groupId}/review`);
  revalidatePath(`/groups/${groupId}/contribution`);
  revalidatePath(`/groups/${groupId}/projects/${projectId}`);
  revalidatePath(`/groups/${groupId}/projects/${projectId}/tasks`);
  revalidatePath(`/groups/${groupId}/projects/${projectId}/tasks/${taskId}`);
}

export async function submitTaskReviewAction(
  input: SubmitReviewInput
): Promise<ActionResult<ReviewMutationResult>> {
  const parsedInput = submitReviewSchema.safeParse(input);

  if (!parsedInput.success) {
    return {
      ok: false,
      message: "Task ID tidak valid.",
      fieldErrors: getZodFieldErrors(parsedInput.error),
    };
  }

  try {
    const { supabase, user } = await getAuthenticatedBackend();
    const task = await getTaskForAccess(supabase, parsedInput.data.taskId);
    await assertGroupMember(supabase, task.group_id, user.id);
    assertAssignedUser(task, user.id);

    assertTaskStatusTransition({
      from: task.status,
      to: "submit_review",
      actor: "assigned_member",
    });

    const evidenceCount = await countTaskEvidences(task.id);

    if (evidenceCount < 1) {
      throw new Error("Task tidak bisa submit review tanpa bukti pekerjaan.");
    }

    const { error } = await supabase
      .from("tasks")
      .update({ status: "submit_review" })
      .eq("id", task.id);

    if (error) {
      throw new Error(error.message);
    }

    await createActivityLog(supabase, {
      groupId: task.group_id,
      projectId: task.project_id,
      taskId: task.id,
      userId: user.id,
      action: "task.submitted_review",
      description: "Task diajukan untuk review ketua",
      metadata: { evidence_count: evidenceCount },
    });

    revalidateReviewPages(task.group_id, task.project_id, task.id);

    return {
      ok: true,
      data: { id: task.id },
      message: "Task berhasil diajukan untuk review.",
    };
  } catch (error) {
    return {
      ok: false,
      message: getErrorMessage(error, "Gagal submit review."),
    };
  }
}

export async function approveTaskAction(input: ApproveTaskInput): Promise<ActionResult<ReviewMutationResult>> {
  const parsedInput = approveTaskSchema.safeParse(input);

  if (!parsedInput.success) {
    return {
      ok: false,
      message: "Task ID tidak valid.",
      fieldErrors: getZodFieldErrors(parsedInput.error),
    };
  }

  try {
    const { supabase, user } = await getAuthenticatedBackend();
    const task = await getTaskForAccess(supabase, parsedInput.data.taskId);
    await assertGroupLeader(supabase, task.group_id, user.id);

    assertTaskStatusTransition({ from: task.status, to: "approved", actor: "leader" });

    const reviewId = randomUUID();
    const approvedAt = new Date().toISOString();
    const { error: reviewError } = await supabase.from("task_reviews").insert({
      id: reviewId,
      task_id: task.id,
      reviewed_by: user.id,
      review_status: "approved",
    });

    if (reviewError) {
      throw new Error(reviewError.message);
    }

    const { error: taskError } = await supabase
      .from("tasks")
      .update({
        status: "approved",
        approved_by: user.id,
        approved_at: approvedAt,
      })
      .eq("id", task.id);

    if (taskError) {
      throw new Error(taskError.message);
    }

    await createActivityLog(supabase, {
      groupId: task.group_id,
      projectId: task.project_id,
      taskId: task.id,
      userId: user.id,
      action: "task.approved",
      description: "Task disetujui ketua",
      metadata: { review_id: reviewId, approved_at: approvedAt },
    });

    revalidateReviewPages(task.group_id, task.project_id, task.id);

    return {
      ok: true,
      data: { id: reviewId },
      message: "Task berhasil diapprove.",
    };
  } catch (error) {
    return {
      ok: false,
      message: getErrorMessage(error, "Gagal approve task."),
    };
  }
}

export async function requestRevisionAction(
  input: RequestRevisionInput
): Promise<ActionResult<ReviewMutationResult>> {
  const parsedInput = requestRevisionSchema.safeParse(input);

  if (!parsedInput.success) {
    return {
      ok: false,
      message: "Periksa kembali catatan revisi.",
      fieldErrors: getZodFieldErrors(parsedInput.error),
    };
  }

  try {
    const { supabase, user } = await getAuthenticatedBackend();
    const task = await getTaskForAccess(supabase, parsedInput.data.taskId);
    await assertGroupLeader(supabase, task.group_id, user.id);

    assertTaskStatusTransition({ from: task.status, to: "revision", actor: "leader" });

    const reviewId = randomUUID();
    const { error: reviewError } = await supabase.from("task_reviews").insert({
      id: reviewId,
      task_id: task.id,
      reviewed_by: user.id,
      review_status: "revision",
      review_note: parsedInput.data.reviewNote,
    });

    if (reviewError) {
      throw new Error(reviewError.message);
    }

    const { error: taskError } = await supabase
      .from("tasks")
      .update({
        status: "revision",
        approved_by: null,
        approved_at: null,
      })
      .eq("id", task.id);

    if (taskError) {
      throw new Error(taskError.message);
    }

    await createActivityLog(supabase, {
      groupId: task.group_id,
      projectId: task.project_id,
      taskId: task.id,
      userId: user.id,
      action: "task.revision_requested",
      description: "Ketua meminta revisi task",
      metadata: { review_id: reviewId },
    });

    revalidateReviewPages(task.group_id, task.project_id, task.id);

    return {
      ok: true,
      data: { id: reviewId },
      message: "Revisi task berhasil diminta.",
    };
  } catch (error) {
    return {
      ok: false,
      message: getErrorMessage(error, "Gagal meminta revisi."),
    };
  }
}

export async function reassignTaskAction(input: ReassignTaskInput): Promise<ActionResult<ReviewMutationResult>> {
  const parsedInput = reassignTaskSchema.safeParse(input);

  if (!parsedInput.success) {
    return {
      ok: false,
      message: "Periksa kembali data reassign.",
      fieldErrors: getZodFieldErrors(parsedInput.error),
    };
  }

  try {
    const { supabase, user } = await getAuthenticatedBackend();
    const task = await getTaskForAccess(supabase, parsedInput.data.taskId);
    await assertGroupLeader(supabase, task.group_id, user.id);
    await assertUserIsGroupMember(supabase, task.group_id, parsedInput.data.toUserId);

    if (task.assigned_to === parsedInput.data.toUserId) {
      throw new Error("Task sudah diassign ke anggota tersebut.");
    }

    const reassignmentId = randomUUID();
    const { error: reassignmentError } = await supabase.from("task_reassignments").insert({
      id: reassignmentId,
      task_id: task.id,
      from_user_id: task.assigned_to,
      to_user_id: parsedInput.data.toUserId,
      reassigned_by: user.id,
      reason: parsedInput.data.reason,
    });

    if (reassignmentError) {
      throw new Error(reassignmentError.message);
    }

    const { error: taskError } = await supabase
      .from("tasks")
      .update({
        assigned_to: parsedInput.data.toUserId,
        status: "todo",
        approved_by: null,
        approved_at: null,
      })
      .eq("id", task.id);

    if (taskError) {
      throw new Error(taskError.message);
    }

    await createActivityLog(supabase, {
      groupId: task.group_id,
      projectId: task.project_id,
      taskId: task.id,
      userId: user.id,
      action: "task.reassigned",
      description: "Task dipindahkan ke anggota lain",
      metadata: {
        reassignment_id: reassignmentId,
        from_user_id: task.assigned_to,
        to_user_id: parsedInput.data.toUserId,
      },
    });

    revalidateReviewPages(task.group_id, task.project_id, task.id);

    return {
      ok: true,
      data: { id: reassignmentId },
      message: "Task berhasil direassign.",
    };
  } catch (error) {
    return {
      ok: false,
      message: getErrorMessage(error, "Gagal reassign task."),
    };
  }
}
