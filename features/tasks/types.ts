import type { TaskPriority, TaskStatus } from "@/types/domain";

export type TaskListItem = {
  id: string;
  groupId: string;
  projectId: string;
  title: string;
  description: string | null;
  assignedTo: string;
  assigneeName: string;
  status: TaskStatus;
  priority: TaskPriority;
  weight: number;
  deadline: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  approvedBy: string | null;
  approvedAt: string | null;
};

export type TaskCommentItem = {
  id: string;
  taskId: string;
  userId: string;
  fullName: string;
  comment: string;
  createdAt: string;
};

export type TaskDetail = TaskListItem & {
  comments: TaskCommentItem[];
};

export type TaskBoard = Record<TaskStatus, TaskListItem[]>;
