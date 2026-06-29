import { Badge } from "@/components/ui/badge";
import type { TaskStatus } from "@/types/domain";

const STATUS_LABELS: Record<TaskStatus, string> = {
  todo: "To Do",
  in_progress: "In Progress",
  submit_review: "Submit Review",
  revision: "Revisi",
  approved: "Approved",
  done: "Done",
};

export function StatusBadge({ status }: { status: TaskStatus }) {
  return <Badge variant="muted">{STATUS_LABELS[status]}</Badge>;
}
