import "server-only";

import { isBefore, startOfDay } from "date-fns";

import type { TaskStatus } from "@/types/domain";
import type { DashboardOverview } from "@/features/dashboard/types";
import { getAuthenticatedBackend } from "@/features/shared/server";

type DashboardTaskRow = {
  id: string;
  group_id: string;
  project_id: string;
  title: string;
  status: TaskStatus;
  deadline: string;
};

export async function getDashboardOverview(): Promise<DashboardOverview> {
  const { supabase, user } = await getAuthenticatedBackend();
  const { data: memberships, error: membershipsError } = await supabase
    .from("group_members")
    .select("group_id")
    .eq("user_id", user.id);

  if (membershipsError) {
    throw new Error(membershipsError.message);
  }

  const groupIds = (memberships ?? []).map((membership) => membership.group_id);

  if (groupIds.length === 0) {
    return {
      groupCount: 0,
      projectCount: 0,
      taskCount: 0,
      approvedTaskCount: 0,
      pendingReviewCount: 0,
      overdueTaskCount: 0,
      nearestDeadlineTask: null,
    };
  }

  const [{ count: projectCount, error: projectError }, { data: tasks, error: taskError }] =
    await Promise.all([
      supabase.from("projects").select("id", { count: "exact", head: true }).in("group_id", groupIds),
      supabase
        .from("tasks")
        .select("id, group_id, project_id, title, status, deadline")
        .in("group_id", groupIds),
    ]);

  if (projectError) {
    throw new Error(projectError.message);
  }

  if (taskError) {
    throw new Error(taskError.message);
  }

  const taskRows = (tasks ?? []) as DashboardTaskRow[];
  const now = startOfDay(new Date());
  const activeTasks = taskRows.filter((task) => !["approved", "done"].includes(task.status));
  const nearestDeadlineTask = [...activeTasks].sort(
    (a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
  )[0];

  return {
    groupCount: groupIds.length,
    projectCount: projectCount ?? 0,
    taskCount: taskRows.length,
    approvedTaskCount: taskRows.filter((task) => task.status === "approved" || task.status === "done")
      .length,
    pendingReviewCount: taskRows.filter((task) => task.status === "submit_review").length,
    overdueTaskCount: activeTasks.filter((task) =>
      isBefore(startOfDay(new Date(task.deadline)), now)
    ).length,
    nearestDeadlineTask: nearestDeadlineTask
      ? {
          id: nearestDeadlineTask.id,
          groupId: nearestDeadlineTask.group_id,
          projectId: nearestDeadlineTask.project_id,
          title: nearestDeadlineTask.title,
          deadline: nearestDeadlineTask.deadline,
        }
      : null,
  };
}

