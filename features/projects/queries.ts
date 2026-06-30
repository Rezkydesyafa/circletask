import "server-only";

import type { TaskStatus } from "@/types/domain";
import type { ProjectDetail, ProjectListItem } from "@/features/projects/types";
import { assertGroupMember } from "@/features/permissions/server";
import { getAuthenticatedBackend } from "@/features/shared/server";

type ProjectRow = {
  id: string;
  group_id: string;
  title: string;
  description: string | null;
  deadline: string;
  status: string;
  created_by: string;
  created_at: string;
  updated_at: string;
};

type TaskSummaryRow = {
  id: string;
  project_id: string;
  status: TaskStatus;
};

function getProgress(taskCount: number, approvedTaskCount: number) {
  if (taskCount === 0) {
    return 0;
  }

  return Math.round((approvedTaskCount / taskCount) * 100);
}

function mapProject(row: ProjectRow, tasks: TaskSummaryRow[]): ProjectListItem {
  const projectTasks = tasks.filter((task) => task.project_id === row.id);
  const approvedTaskCount = projectTasks.filter(
    (task) => task.status === "approved" || task.status === "done"
  ).length;

  return {
    id: row.id,
    groupId: row.group_id,
    title: row.title,
    description: row.description,
    deadline: row.deadline,
    status: row.status,
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    taskCount: projectTasks.length,
    approvedTaskCount,
    progress: getProgress(projectTasks.length, approvedTaskCount),
  };
}

export async function getGroupProjects(groupId: string): Promise<ProjectListItem[]> {
  const { supabase, user } = await getAuthenticatedBackend();
  await assertGroupMember(supabase, groupId, user.id);

  const [{ data: projects, error: projectsError }, { data: tasks, error: tasksError }] =
    await Promise.all([
      supabase
        .from("projects")
        .select("id, group_id, title, description, deadline, status, created_by, created_at, updated_at")
        .eq("group_id", groupId)
        .order("created_at", { ascending: false }),
      supabase.from("tasks").select("id, project_id, status").eq("group_id", groupId),
    ]);

  if (projectsError) {
    throw new Error(projectsError.message);
  }

  if (tasksError) {
    throw new Error(tasksError.message);
  }

  return ((projects ?? []) as ProjectRow[]).map((project) =>
    mapProject(project, (tasks ?? []) as TaskSummaryRow[])
  );
}

export async function getProjectDetail(groupId: string, projectId: string): Promise<ProjectDetail> {
  const { supabase, user } = await getAuthenticatedBackend();
  await assertGroupMember(supabase, groupId, user.id);

  const [{ data: project, error: projectError }, { data: tasks, error: tasksError }] =
    await Promise.all([
      supabase
        .from("projects")
        .select("id, group_id, title, description, deadline, status, created_by, created_at, updated_at")
        .eq("group_id", groupId)
        .eq("id", projectId)
        .single(),
      supabase.from("tasks").select("id, project_id, status").eq("group_id", groupId).eq("project_id", projectId),
    ]);

  if (projectError) {
    throw new Error(projectError.message);
  }

  if (tasksError) {
    throw new Error(tasksError.message);
  }

  const taskRows = (tasks ?? []) as TaskSummaryRow[];
  const baseProject = mapProject(project as ProjectRow, taskRows);

  return {
    ...baseProject,
    todoTaskCount: taskRows.filter((task) => task.status === "todo").length,
    inProgressTaskCount: taskRows.filter((task) => task.status === "in_progress").length,
    pendingReviewTaskCount: taskRows.filter((task) => task.status === "submit_review").length,
    revisionTaskCount: taskRows.filter((task) => task.status === "revision").length,
  };
}

