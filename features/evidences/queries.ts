import "server-only";

import { TASK_EVIDENCE_BUCKET } from "@/lib/upload";
import type { TaskEvidenceItem } from "@/features/evidences/types";
import { assertGroupMember, getTaskForAccess } from "@/features/permissions/server";
import { getAuthenticatedBackend } from "@/features/shared/server";

export async function countTaskEvidences(taskId: string) {
  const { supabase } = await getAuthenticatedBackend();
  const { count, error } = await supabase
    .from("task_evidences")
    .select("id", { count: "exact", head: true })
    .eq("task_id", taskId);

  if (error) {
    throw new Error(error.message);
  }

  return count ?? 0;
}

export async function getTaskEvidences(taskId: string): Promise<TaskEvidenceItem[]> {
  const { supabase, user } = await getAuthenticatedBackend();
  const task = await getTaskForAccess(supabase, taskId);
  await assertGroupMember(supabase, task.group_id, user.id);

  const { data, error } = await supabase
    .from("task_evidences")
    .select("id, task_id, uploaded_by, evidence_type, file_path, external_url, file_name, file_size, note, created_at")
    .eq("task_id", taskId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const evidenceRows = data ?? [];
  const uploaderIds = Array.from(new Set(evidenceRows.map((evidence) => evidence.uploaded_by)));
  const { data: profiles, error: profilesError } = uploaderIds.length
    ? await supabase.from("profiles").select("user_id, full_name").in("user_id", uploaderIds)
    : { data: [], error: null };

  if (profilesError) {
    throw new Error(profilesError.message);
  }

  const profileByUserId = new Map(
    (profiles ?? []).map((profile) => [profile.user_id, profile.full_name as string])
  );

  return Promise.all(
    evidenceRows.map(async (evidence) => {
      let signedUrl: string | null = null;

      if (evidence.evidence_type === "file" && evidence.file_path) {
        const { data: signedUrlData, error: signedUrlError } = await supabase.storage
          .from(TASK_EVIDENCE_BUCKET)
          .createSignedUrl(evidence.file_path, 60 * 10);

        if (signedUrlError) {
          throw new Error(signedUrlError.message);
        }

        signedUrl = signedUrlData.signedUrl;
      }

      return {
        id: evidence.id,
        taskId: evidence.task_id,
        uploadedBy: evidence.uploaded_by,
        uploaderName: profileByUserId.get(evidence.uploaded_by) ?? "Pengguna CircleTask",
        evidenceType: evidence.evidence_type as "file" | "link",
        filePath: evidence.file_path,
        fileName: evidence.file_name,
        fileSize: evidence.file_size,
        externalUrl: evidence.external_url,
        signedUrl,
        note: evidence.note,
        createdAt: evidence.created_at,
      };
    })
  );
}

