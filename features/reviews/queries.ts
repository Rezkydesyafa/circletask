import "server-only";

import type { TaskPriority } from "@/types/domain";
import type {
  ReviewTaskItem,
  TaskReassignmentHistoryItem,
  TaskReviewHistoryItem,
} from "@/features/reviews/types";
import { assertGroupLeader, assertGroupMember, getTaskForAccess } from "@/features/permissions/server";
import { getAuthenticatedBackend } from "@/features/shared/server";

export async function getPendingReviewTasks(groupId: string): Promise<ReviewTaskItem[]> {
  const { supabase, user } = await getAuthenticatedBackend();
  await assertGroupLeader(supabase, groupId, user.id);

  const { data: tasks, error: tasksError } = await supabase
    .from("tasks")
    .select("id, group_id, project_id, title, assigned_to, priority, weight, deadline, updated_at")
    .eq("group_id", groupId)
    .eq("status", "submit_review")
    .order("updated_at", { ascending: true });

  if (tasksError) {
    throw new Error(tasksError.message);
  }

  const taskRows = tasks ?? [];
  const assigneeIds = Array.from(new Set(taskRows.map((task) => task.assigned_to)));
  const taskIds = taskRows.map((task) => task.id);
  const [{ data: profiles, error: profilesError }, { data: evidences, error: evidencesError }] =
    await Promise.all([
      assigneeIds.length
        ? supabase.from("profiles").select("user_id, full_name").in("user_id", assigneeIds)
        : Promise.resolve({ data: [], error: null }),
      taskIds.length
        ? supabase.from("task_evidences").select("task_id").in("task_id", taskIds)
        : Promise.resolve({ data: [], error: null }),
    ]);

  if (profilesError) {
    throw new Error(profilesError.message);
  }

  if (evidencesError) {
    throw new Error(evidencesError.message);
  }

  const profileByUserId = new Map(
    (profiles ?? []).map((profile) => [profile.user_id, profile.full_name as string])
  );
  const evidenceCountByTaskId = new Map<string, number>();

  for (const evidence of evidences ?? []) {
    evidenceCountByTaskId.set(evidence.task_id, (evidenceCountByTaskId.get(evidence.task_id) ?? 0) + 1);
  }

  return taskRows.map((task) => ({
    id: task.id,
    groupId: task.group_id,
    projectId: task.project_id,
    title: task.title,
    assignedTo: task.assigned_to,
    assigneeName: profileByUserId.get(task.assigned_to) ?? "Pengguna CircleTask",
    priority: task.priority as TaskPriority,
    weight: Number(task.weight),
    deadline: task.deadline,
    evidenceCount: evidenceCountByTaskId.get(task.id) ?? 0,
    updatedAt: task.updated_at,
  }));
}

async function getProfileNames(userIds: string[]) {
  const { supabase } = await getAuthenticatedBackend();

  if (userIds.length === 0) {
    return new Map<string, string>();
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("user_id, full_name")
    .in("user_id", Array.from(new Set(userIds)));

  if (error) {
    throw new Error(error.message);
  }

  return new Map((data ?? []).map((profile) => [profile.user_id, profile.full_name as string]));
}

export async function getTaskReviewHistory(taskId: string): Promise<TaskReviewHistoryItem[]> {
  const { supabase, user } = await getAuthenticatedBackend();
  const task = await getTaskForAccess(supabase, taskId);
  await assertGroupMember(supabase, task.group_id, user.id);

  const { data, error } = await supabase
    .from("task_reviews")
    .select("id, task_id, reviewed_by, review_status, review_note, created_at")
    .eq("task_id", taskId)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  const rows = data ?? [];
  const profileNames = await getProfileNames(rows.map((review) => review.reviewed_by));

  return rows.map((review) => ({
    id: review.id,
    taskId: review.task_id,
    reviewedBy: review.reviewed_by,
    reviewerName: profileNames.get(review.reviewed_by) ?? "Pengguna CircleTask",
    reviewStatus: review.review_status as "approved" | "revision" | "rejected",
    reviewNote: review.review_note,
    createdAt: review.created_at,
  }));
}

export async function getTaskReassignmentHistory(
  taskId: string
): Promise<TaskReassignmentHistoryItem[]> {
  const { supabase, user } = await getAuthenticatedBackend();
  const task = await getTaskForAccess(supabase, taskId);
  await assertGroupMember(supabase, task.group_id, user.id);

  const { data, error } = await supabase
    .from("task_reassignments")
    .select("id, task_id, from_user_id, to_user_id, reassigned_by, reason, created_at")
    .eq("task_id", taskId)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  const rows = data ?? [];
  const profileNames = await getProfileNames(
    rows.flatMap((reassignment) => [
      reassignment.from_user_id,
      reassignment.to_user_id,
      reassignment.reassigned_by,
    ])
  );

  return rows.map((reassignment) => ({
    id: reassignment.id,
    taskId: reassignment.task_id,
    fromUserId: reassignment.from_user_id,
    fromUserName: profileNames.get(reassignment.from_user_id) ?? "Pengguna CircleTask",
    toUserId: reassignment.to_user_id,
    toUserName: profileNames.get(reassignment.to_user_id) ?? "Pengguna CircleTask",
    reassignedBy: reassignment.reassigned_by,
    reassignedByName: profileNames.get(reassignment.reassigned_by) ?? "Pengguna CircleTask",
    reason: reassignment.reason,
    createdAt: reassignment.created_at,
  }));
}
