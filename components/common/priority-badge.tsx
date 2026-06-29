import { Badge } from "@/components/ui/badge";
import type { TaskPriority } from "@/types/domain";

const PRIORITY_LABELS: Record<TaskPriority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

export function PriorityBadge({ priority }: { priority: TaskPriority }) {
  return <Badge variant={priority === "high" ? "default" : "outline"}>{PRIORITY_LABELS[priority]}</Badge>;
}
