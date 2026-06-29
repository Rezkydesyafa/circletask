export const TASK_STATUSES = [
  "todo",
  "in_progress",
  "submit_review",
  "revision",
  "approved",
  "done",
] as const;

export type TaskStatus = (typeof TASK_STATUSES)[number];

export const TASK_PRIORITIES = ["low", "medium", "high"] as const;

export type TaskPriority = (typeof TASK_PRIORITIES)[number];

export const GROUP_ROLES = ["leader", "member"] as const;

export type GroupRole = (typeof GROUP_ROLES)[number];

export const REVIEW_STATUSES = ["approved", "revision", "rejected"] as const;

export type ReviewStatus = (typeof REVIEW_STATUSES)[number];
