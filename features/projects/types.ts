export type ProjectListItem = {
  id: string;
  groupId: string;
  title: string;
  description: string | null;
  deadline: string;
  status: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  taskCount: number;
  approvedTaskCount: number;
  progress: number;
};

export type ProjectDetail = ProjectListItem & {
  todoTaskCount: number;
  inProgressTaskCount: number;
  pendingReviewTaskCount: number;
  revisionTaskCount: number;
};

