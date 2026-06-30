import "server-only";

import type {
  ContributionTaskSource,
  GroupContributionSummary,
  MemberContribution,
} from "@/features/contributions/types";
import { calculateTaskContribution } from "@/features/contributions/calculate";
import { getGroupMembers } from "@/features/groups/queries";
import { assertGroupMember } from "@/features/permissions/server";
import { getAuthenticatedBackend } from "@/features/shared/server";

type ContributionTaskRow = {
  id: string;
  title: string;
  assigned_to: string;
  weight: number | string;
  deadline: string;
  approved_at: string | null;
};

export async function getGroupContributionSummary(groupId: string): Promise<GroupContributionSummary> {
  const { supabase, user } = await getAuthenticatedBackend();
  await assertGroupMember(supabase, groupId, user.id);

  const members = await getGroupMembers(groupId);
  const { data: tasks, error: tasksError } = await supabase
    .from("tasks")
    .select("id, title, assigned_to, weight, deadline, approved_at")
    .eq("group_id", groupId)
    .in("status", ["approved", "done"]);

  if (tasksError) {
    throw new Error(tasksError.message);
  }

  const taskRows = (tasks ?? []) as ContributionTaskRow[];
  const taskIds = taskRows.map((task) => task.id);
  const { data: reviews, error: reviewsError } = taskIds.length
    ? await supabase
        .from("task_reviews")
        .select("task_id, review_status")
        .in("task_id", taskIds)
        .eq("review_status", "revision")
    : { data: [], error: null };

  if (reviewsError) {
    throw new Error(reviewsError.message);
  }

  const revisionCountByTaskId = new Map<string, number>();

  for (const review of reviews ?? []) {
    revisionCountByTaskId.set(
      review.task_id,
      (revisionCountByTaskId.get(review.task_id) ?? 0) + 1
    );
  }

  const tasksByUserId = new Map<string, ContributionTaskSource[]>();

  for (const task of taskRows) {
    const source = calculateTaskContribution(
      {
        id: task.id,
        title: task.title,
        assignedTo: task.assigned_to,
        weight: task.weight,
        deadline: task.deadline,
        approvedAt: task.approved_at,
      },
      revisionCountByTaskId.get(task.id) ?? 0
    );
    const currentSources = tasksByUserId.get(task.assigned_to) ?? [];
    currentSources.push(source);
    tasksByUserId.set(task.assigned_to, currentSources);
  }

  const totalScore = Number(
    Array.from(tasksByUserId.values())
      .flat()
      .reduce((sum, task) => sum + task.finalScore, 0)
      .toFixed(2)
  );

  const contributionRows: MemberContribution[] = members
    .map((member) => {
      const memberTasks = tasksByUserId.get(member.userId) ?? [];
      const rawScore = Number(memberTasks.reduce((sum, task) => sum + task.weight, 0).toFixed(2));
      const finalScore = Number(memberTasks.reduce((sum, task) => sum + task.finalScore, 0).toFixed(2));

      return {
        userId: member.userId,
        fullName: member.fullName,
        email: member.email,
        avatarUrl: member.avatarUrl,
        rawScore,
        finalScore,
        percentage: totalScore > 0 ? Number(((finalScore / totalScore) * 100).toFixed(2)) : 0,
        taskCount: memberTasks.length,
        tasks: memberTasks,
      };
    })
    .sort((a, b) => b.finalScore - a.finalScore);

  return {
    groupId,
    totalScore,
    members: contributionRows,
  };
}
