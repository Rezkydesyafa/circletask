import { differenceInCalendarDays } from "date-fns";

import type { ContributionTaskSource } from "@/features/contributions/types";

export type ContributionCalculationTask = {
  id: string;
  title: string;
  assignedTo: string;
  weight: number | string;
  deadline: string;
  approvedAt: string | null;
};

export function getDeadlinePenaltyRate(deadline: string, approvedAt: string | null) {
  if (!approvedAt) {
    return 0;
  }

  const lateDays = differenceInCalendarDays(new Date(approvedAt), new Date(deadline));

  if (lateDays > 2) {
    return 0.2;
  }

  if (lateDays > 0) {
    return 0.1;
  }

  return 0;
}

export function getRevisionPenaltyRate(revisionCount: number) {
  return revisionCount > 2 ? 0.1 : 0;
}

export function calculateTaskContribution(
  task: ContributionCalculationTask,
  revisionCount: number
): ContributionTaskSource {
  const weight = Number(task.weight);
  const deadlinePenaltyRate = getDeadlinePenaltyRate(task.deadline, task.approvedAt);
  const revisionPenaltyRate = getRevisionPenaltyRate(revisionCount);
  const totalPenaltyRate = Math.min(deadlinePenaltyRate + revisionPenaltyRate, 0.9);
  const finalScore = Number((weight * (1 - totalPenaltyRate)).toFixed(2));

  return {
    taskId: task.id,
    title: task.title,
    assignedTo: task.assignedTo,
    weight,
    approvedAt: task.approvedAt,
    deadline: task.deadline,
    revisionCount,
    deadlinePenaltyRate,
    revisionPenaltyRate,
    finalScore,
  };
}

