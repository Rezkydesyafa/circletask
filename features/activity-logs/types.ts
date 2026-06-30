export type ActivityLogItem = {
  id: string;
  groupId: string;
  projectId: string | null;
  taskId: string | null;
  userId: string;
  userName: string;
  action: string;
  description: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
};

