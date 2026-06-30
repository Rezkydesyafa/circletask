import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

type ActivityMetadata = Record<string, string | number | boolean | null>;

type CreateActivityLogInput = {
  groupId: string;
  projectId?: string | null;
  taskId?: string | null;
  userId: string;
  action: string;
  description?: string | null;
  metadata?: ActivityMetadata;
};

export async function createActivityLog(
  supabase: SupabaseClient,
  {
    groupId,
    projectId = null,
    taskId = null,
    userId,
    action,
    description = null,
    metadata = {},
  }: CreateActivityLogInput
) {
  const { error } = await supabase.from("activity_logs").insert({
    group_id: groupId,
    project_id: projectId,
    task_id: taskId,
    user_id: userId,
    action,
    description,
    metadata,
  });

  if (error) {
    throw new Error(error.message);
  }
}

