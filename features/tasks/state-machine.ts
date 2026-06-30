import type { TaskStatus } from "@/types/domain";

export type TaskTransitionActor = "leader" | "assigned_member" | "member";

export type TaskTransitionInput = {
  from: TaskStatus;
  to: TaskStatus;
  actor: TaskTransitionActor;
};

const assignedMemberTransitions: Partial<Record<TaskStatus, TaskStatus[]>> = {
  todo: ["in_progress"],
  in_progress: ["submit_review"],
  revision: ["in_progress", "submit_review"],
};

const leaderTransitions: Partial<Record<TaskStatus, TaskStatus[]>> = {
  submit_review: ["approved", "revision"],
  approved: ["done"],
};

export function canTransitionTaskStatus({ from, to, actor }: TaskTransitionInput) {
  if (from === to) {
    return true;
  }

  if (actor === "assigned_member") {
    return assignedMemberTransitions[from]?.includes(to) ?? false;
  }

  if (actor === "leader") {
    return leaderTransitions[from]?.includes(to) ?? false;
  }

  return false;
}

export function assertTaskStatusTransition(input: TaskTransitionInput) {
  if (!canTransitionTaskStatus(input)) {
    throw new Error(`Transisi status task ${input.from} ke ${input.to} tidak diizinkan.`);
  }
}

