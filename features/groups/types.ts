import type { GroupRole } from "@/types/domain";

export type GroupListItem = {
  id: string;
  name: string;
  description: string | null;
  joinCode: string;
  ownerId: string;
  role: GroupRole;
  joinedAt: string;
  createdAt: string;
  updatedAt: string;
};

export type GroupMemberItem = {
  userId: string;
  role: GroupRole;
  joinedAt: string;
  fullName: string;
  email: string;
  avatarUrl: string | null;
};

export type GroupDashboardSummary = {
  group: GroupListItem;
  memberCount: number;
  projectCount: number;
  taskCount: number;
  approvedTaskCount: number;
  pendingReviewCount: number;
  overdueTaskCount: number;
  nearestDeadlineTask: {
    id: string;
    projectId: string;
    title: string;
    deadline: string;
  } | null;
};
