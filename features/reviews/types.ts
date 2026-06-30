import type { TaskPriority } from "@/types/domain";

export type ReviewTaskItem = {
  id: string;
  groupId: string;
  projectId: string;
  title: string;
  assignedTo: string;
  assigneeName: string;
  priority: TaskPriority;
  weight: number;
  deadline: string;
  evidenceCount: number;
  updatedAt: string;
};

export type TaskReviewHistoryItem = {
  id: string;
  taskId: string;
  reviewedBy: string;
  reviewerName: string;
  reviewStatus: "approved" | "revision" | "rejected";
  reviewNote: string | null;
  createdAt: string;
};

export type TaskReassignmentHistoryItem = {
  id: string;
  taskId: string;
  fromUserId: string;
  fromUserName: string;
  toUserId: string;
  toUserName: string;
  reassignedBy: string;
  reassignedByName: string;
  reason: string;
  createdAt: string;
};
