import { cn } from "@/lib/utils";

export type PriorityItemData = {
  title: string;
  groupName: string;
  status: string;
  dueLabel: string;
  statusClassName: string;
  dueTone?: "default" | "danger";
};

type PriorityItemProps = {
  item: PriorityItemData;
};

export function PriorityItem({ item }: PriorityItemProps) {
  return (
    <li className="cursor-pointer rounded-[18px] border border-border-subtle bg-surface-container-low p-4 transition-colors hover:bg-surface-container">
      <div className="mb-2 flex items-start justify-between gap-3">
        <span className={cn("rounded-md px-2 py-0.5 font-label text-label text-primary", item.statusClassName)}>
          {item.status}
        </span>
        <span
          className={cn(
            "shrink-0 font-label text-label",
            item.dueTone === "danger" ? "text-error" : "text-text-secondary"
          )}
        >
          {item.dueLabel}
        </span>
      </div>
      <p className="font-body text-body font-semibold leading-tight text-text-primary">{item.title}</p>
      <p className="mt-1 font-body-sm text-body-sm text-text-soft">{item.groupName}</p>
    </li>
  );
}
