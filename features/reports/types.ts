import type { ActivityLogItem } from "@/features/activity-logs/types";
import type { GroupContributionSummary } from "@/features/contributions/types";
import type { GroupListItem, GroupMemberItem } from "@/features/groups/types";
import type { ProjectListItem } from "@/features/projects/types";
import type { TaskEvidenceItem } from "@/features/evidences/types";
import type { TaskListItem } from "@/features/tasks/types";

export type ReportReassignmentItem = {
  id: string;
  taskId: string;
  fromUserId: string;
  toUserId: string;
  reassignedBy: string;
  reason: string;
  createdAt: string;
};

export type ReportPreviewData = {
  group: GroupListItem;
  members: GroupMemberItem[];
  projects: ProjectListItem[];
  tasks: TaskListItem[];
  evidences: TaskEvidenceItem[];
  reassignments: ReportReassignmentItem[];
  activities: ActivityLogItem[];
  contribution: GroupContributionSummary;
};

