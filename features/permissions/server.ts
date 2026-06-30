import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import type { GroupRole, TaskStatus } from "@/types/domain";
import { BackendError } from "@/features/shared/server";

export type TaskAccessRecord = {
  id: string;
  group_id: string;
  project_id: string;
  title: string;
  assigned_to: string;
  status: TaskStatus;
  deadline: string;
  weight: number;
  approved_by: string | null;
  approved_at: string | null;
};

export async function getGroupRole(
  supabase: SupabaseClient,
  groupId: string,
  userId: string
): Promise<GroupRole | null> {
  const { data, error } = await supabase
    .from("group_members")
    .select("role")
    .eq("group_id", groupId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw new BackendError(error.message);
  }

  return (data?.role as GroupRole | undefined) ?? null;
}

export async function assertGroupMember(
  supabase: SupabaseClient,
  groupId: string,
  userId: string
): Promise<GroupRole> {
  const role = await getGroupRole(supabase, groupId, userId);

  if (!role) {
    throw new BackendError("User bukan anggota kelompok ini.");
  }

  return role;
}

export async function assertGroupLeader(
  supabase: SupabaseClient,
  groupId: string,
  userId: string
) {
  const role = await assertGroupMember(supabase, groupId, userId);

  if (role !== "leader") {
    throw new BackendError("Aksi ini hanya bisa dilakukan ketua kelompok.");
  }
}

export async function assertProjectInGroup(
  supabase: SupabaseClient,
  projectId: string,
  groupId: string
) {
  const { data, error } = await supabase
    .from("projects")
    .select("id, group_id")
    .eq("id", projectId)
    .eq("group_id", groupId)
    .maybeSingle();

  if (error) {
    throw new BackendError(error.message);
  }

  if (!data) {
    throw new BackendError("Project tidak ditemukan di kelompok ini.");
  }
}

export async function assertUserIsGroupMember(
  supabase: SupabaseClient,
  groupId: string,
  userId: string
) {
  const role = await getGroupRole(supabase, groupId, userId);

  if (!role) {
    throw new BackendError("Assigned user harus anggota kelompok.");
  }
}

export async function getTaskForAccess(
  supabase: SupabaseClient,
  taskId: string
): Promise<TaskAccessRecord> {
  const { data, error } = await supabase
    .from("tasks")
    .select("id, group_id, project_id, title, assigned_to, status, deadline, weight, approved_by, approved_at")
    .eq("id", taskId)
    .maybeSingle();

  if (error) {
    throw new BackendError(error.message);
  }

  if (!data) {
    throw new BackendError("Task tidak ditemukan.");
  }

  return {
    id: data.id,
    group_id: data.group_id,
    project_id: data.project_id,
    title: data.title,
    assigned_to: data.assigned_to,
    status: data.status as TaskStatus,
    deadline: data.deadline,
    weight: Number(data.weight),
    approved_by: data.approved_by,
    approved_at: data.approved_at,
  };
}

export function assertAssignedUser(task: TaskAccessRecord, userId: string) {
  if (task.assigned_to !== userId) {
    throw new BackendError("Aksi ini hanya bisa dilakukan anggota yang ditugaskan.");
  }
}

