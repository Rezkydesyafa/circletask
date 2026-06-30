import "server-only";

import type { TaskPriority, TaskStatus } from "@/types/domain";
import type { TaskBoard, TaskCommentItem, TaskDetail, TaskListItem } from "@/features/tasks/types";
import { assertGroupMember, assertProjectInGroup, getTaskForAccess } from "@/features/permissions/server";
import { getAuthenticatedBackend } from "@/features/shared/server";

type TaskRow = {
  id: string;
  group_id: string;
  project_id: string;
  title: string;
  description: string | null;
  assigned_to: string;
  status: TaskStatus;
  priority: TaskPriority;
  weight: number | string;
  deadline: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  approved_by: string | null;
  approved_at: string | null;
};

function mapProfileName(profile?: { full_name: string } | null) {
  return profile?.full_name ?? "Pengguna CircleTask";
}

async function getProfileMap(userIds: string[]) {
  const { supabase } = await getAuthenticatedBackend();

  if (userIds.length === 0) {
    return new Map<string, { full_name: string; email: string; avatar_url: string | null }>();
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("user_id, full_name, email, avatar_url")
    .in("user_id", Array.from(new Set(userIds)));

  if (error) {
    throw new Error(error.message);
  }

  return new Map(
    (data ?? []).map((profile) => [
      profile.user_id,
      {
        full_name: profile.full_name as string,
        email: profile.email as string,
        avatar_url: profile.avatar_url as string | null,
      },
    ])
  );
}

function mapTask(row: TaskRow, profileMap: Map<string, { full_name: string }>): TaskListItem {
  return {
    id: row.id,
    groupId: row.group_id,
    projectId: row.project_id,
    title: row.title,
    description: row.description,
    assignedTo: row.assigned_to,
    assigneeName: mapProfileName(profileMap.get(row.assigned_to)),
    status: row.status,
    priority: row.priority,
    weight: Number(row.weight),
    deadline: row.deadline,
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    approvedBy: row.approved_by,
    approvedAt: row.approved_at,
  };
}

export async function getProjectTasks(groupId: string, projectId: string): Promise<TaskListItem[]> {
  const { supabase, user } = await getAuthenticatedBackend();
  await assertGroupMember(supabase, groupId, user.id);
  await assertProjectInGroup(supabase, projectId, groupId);

  const { data, error } = await supabase
    .from("tasks")
    .select(
      "id, group_id, project_id, title, description, assigned_to, status, priority, weight, deadline, created_by, created_at, updated_at, approved_by, approved_at"
    )
    .eq("group_id", groupId)
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const taskRows = (data ?? []) as TaskRow[];
  const profileMap = await getProfileMap(taskRows.map((task) => task.assigned_to));

  return taskRows.map((task) => mapTask(task, profileMap));
}

export async function getProjectTaskBoard(groupId: string, projectId: string): Promise<TaskBoard> {
  const tasks = await getProjectTasks(groupId, projectId);
  const board: TaskBoard = {
    todo: [],
    in_progress: [],
    submit_review: [],
    revision: [],
    approved: [],
    done: [],
  };

  for (const task of tasks) {
    board[task.status].push(task);
  }

  return board;
}

export async function getTaskDetail(taskId: string): Promise<TaskDetail> {
  const { supabase, user } = await getAuthenticatedBackend();
  const taskAccess = await getTaskForAccess(supabase, taskId);
  await assertGroupMember(supabase, taskAccess.group_id, user.id);

  const [{ data: task, error: taskError }, { data: comments, error: commentsError }] =
    await Promise.all([
      supabase
        .from("tasks")
        .select(
          "id, group_id, project_id, title, description, assigned_to, status, priority, weight, deadline, created_by, created_at, updated_at, approved_by, approved_at"
        )
        .eq("id", taskId)
        .single(),
      supabase
        .from("task_comments")
        .select("id, task_id, user_id, comment, created_at")
        .eq("task_id", taskId)
        .order("created_at", { ascending: true }),
    ]);

  if (taskError) {
    throw new Error(taskError.message);
  }

  if (commentsError) {
    throw new Error(commentsError.message);
  }

  const commentRows = (comments ?? []) as {
    id: string;
    task_id: string;
    user_id: string;
    comment: string;
    created_at: string;
  }[];
  const profileMap = await getProfileMap([
    (task as TaskRow).assigned_to,
    ...commentRows.map((comment) => comment.user_id),
  ]);
  const mappedTask = mapTask(task as TaskRow, profileMap);
  const mappedComments: TaskCommentItem[] = commentRows.map((comment) => ({
    id: comment.id,
    taskId: comment.task_id,
    userId: comment.user_id,
    fullName: mapProfileName(profileMap.get(comment.user_id)),
    comment: comment.comment,
    createdAt: comment.created_at,
  }));

  return {
    ...mappedTask,
    comments: mappedComments,
  };
}
