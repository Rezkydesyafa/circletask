export type ContributionTaskSource = {
  taskId: string;
  title: string;
  assignedTo: string;
  weight: number;
  approvedAt: string | null;
  deadline: string;
  revisionCount: number;
  deadlinePenaltyRate: number;
  revisionPenaltyRate: number;
  finalScore: number;
};

export type MemberContribution = {
  userId: string;
  fullName: string;
  email: string;
  avatarUrl: string | null;
  rawScore: number;
  finalScore: number;
  percentage: number;
  taskCount: number;
  tasks: ContributionTaskSource[];
};

export type GroupContributionSummary = {
  groupId: string;
  totalScore: number;
  members: MemberContribution[];
};

