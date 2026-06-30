import "server-only";

import type { ReportPreviewData, ReportReassignmentItem } from "@/features/reports/types";
import { getGroupActivityLogs } from "@/features/activity-logs/queries";
import { getGroupContributionSummary } from "@/features/contributions/queries";
import { getTaskEvidences } from "@/features/evidences/queries";
import { getGroupById, getGroupMembers } from "@/features/groups/queries";
import { assertGroupLeader } from "@/features/permissions/server";
import { getGroupProjects } from "@/features/projects/queries";
import { getAuthenticatedBackend } from "@/features/shared/server";
import { getProjectTasks } from "@/features/tasks/queries";

export async function getReportPreviewData(groupId: string): Promise<ReportPreviewData> {
  const { supabase, user } = await getAuthenticatedBackend();
  await assertGroupLeader(supabase, groupId, user.id);

  const [group, members, projects, activities, contribution] = await Promise.all([
    getGroupById(groupId),
    getGroupMembers(groupId),
    getGroupProjects(groupId),
    getGroupActivityLogs(groupId, 30),
    getGroupContributionSummary(groupId),
  ]);

  const tasks = (
    await Promise.all(projects.map((project) => getProjectTasks(groupId, project.id)))
  ).flat();
  const taskIds = tasks.map((task) => task.id);
  const [evidences, reassignmentsResult] = await Promise.all([
    Promise.all(taskIds.map((taskId) => getTaskEvidences(taskId))).then((items) => items.flat()),
    taskIds.length
      ? supabase
          .from("task_reassignments")
          .select("id, task_id, from_user_id, to_user_id, reassigned_by, reason, created_at")
          .in("task_id", taskIds)
          .order("created_at", { ascending: true })
      : Promise.resolve({ data: [], error: null }),
  ]);

  if (reassignmentsResult.error) {
    throw new Error(reassignmentsResult.error.message);
  }

  const reassignments: ReportReassignmentItem[] = (reassignmentsResult.data ?? []).map(
    (reassignment) => ({
      id: reassignment.id,
      taskId: reassignment.task_id,
      fromUserId: reassignment.from_user_id,
      toUserId: reassignment.to_user_id,
      reassignedBy: reassignment.reassigned_by,
      reason: reassignment.reason,
      createdAt: reassignment.created_at,
    })
  );

  return {
    group,
    members,
    projects,
    tasks,
    evidences,
    reassignments,
    activities,
    contribution,
  };
}

