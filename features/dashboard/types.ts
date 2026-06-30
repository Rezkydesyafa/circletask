export type DashboardOverview = {
  groupCount: number;
  projectCount: number;
  taskCount: number;
  approvedTaskCount: number;
  pendingReviewCount: number;
  overdueTaskCount: number;
  nearestDeadlineTask: {
    id: string;
    groupId: string;
    projectId: string;
    title: string;
    deadline: string;
  } | null;
};

