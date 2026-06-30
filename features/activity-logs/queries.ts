import "server-only";

import type { ActivityLogItem } from "@/features/activity-logs/types";
import { assertGroupMember } from "@/features/permissions/server";
import { getAuthenticatedBackend } from "@/features/shared/server";

export async function getGroupActivityLogs(groupId: string, limit = 50): Promise<ActivityLogItem[]> {
  const { supabase, user } = await getAuthenticatedBackend();
  await assertGroupMember(supabase, groupId, user.id);

  const { data: logs, error: logsError } = await supabase
    .from("activity_logs")
    .select("id, group_id, project_id, task_id, user_id, action, description, metadata, created_at")
    .eq("group_id", groupId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (logsError) {
    throw new Error(logsError.message);
  }

  const userIds = Array.from(new Set((logs ?? []).map((log) => log.user_id)));
  const { data: profiles, error: profilesError } = userIds.length
    ? await supabase.from("profiles").select("user_id, full_name").in("user_id", userIds)
    : { data: [], error: null };

  if (profilesError) {
    throw new Error(profilesError.message);
  }

  const profileByUserId = new Map(
    (profiles ?? []).map((profile) => [profile.user_id, profile.full_name as string])
  );

  return (logs ?? []).map((log) => ({
    id: log.id,
    groupId: log.group_id,
    projectId: log.project_id,
    taskId: log.task_id,
    userId: log.user_id,
    userName: profileByUserId.get(log.user_id) ?? "Pengguna CircleTask",
    action: log.action,
    description: log.description,
    metadata: (log.metadata ?? {}) as Record<string, unknown>,
    createdAt: log.created_at,
  }));
}

