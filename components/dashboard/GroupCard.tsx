import { cn } from "@/lib/utils";

type GroupCardProps = {
  title: string;
  role: "Ketua" | "Anggota";
  progress: number;
  taskLabel: string;
  deadlineLabel: string;
  deadlineTone?: "default" | "danger";
  actionLabel: string;
  toneClassName: string;
  progressClassName: string;
  metricClassName: string;
  roleVariant?: "dark" | "lavender" | "white";
};

const roleClassNames: Record<NonNullable<GroupCardProps["roleVariant"]>, string> = {
  dark: "bg-primary text-on-primary",
  lavender: "border border-white/80 bg-pastel-lavender text-text-primary",
  white: "border border-white bg-white text-text-primary",
};

export function GroupCard({
  title,
  role,
  progress,
  taskLabel,
  deadlineLabel,
  deadlineTone = "default",
  actionLabel,
  toneClassName,
  progressClassName,
  metricClassName,
  roleVariant = "dark",
}: GroupCardProps) {
  return (
    <article
      className={cn(
        "flex min-h-[230px] flex-col rounded-[24px] border border-white/50 p-5 shadow-[0_4px_20px_rgba(0,0,0,0.02)]",
        toneClassName
      )}
    >
      <div className="mb-4 flex items-start justify-between gap-4">
        <h4 className="line-clamp-2 font-heading-sm text-heading-sm text-text-primary">{title}</h4>
        <span
          className={cn(
            "shrink-0 rounded-full px-3 py-1 font-label text-label",
            roleClassNames[roleVariant]
          )}
        >
          {role}
        </span>
      </div>

      <div className="mb-4">
        <div className={cn("mb-1 flex justify-between font-label text-label", metricClassName)}>
          <span>Progress</span>
          <span>{progress}%</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/60">
          <div className={cn("h-full rounded-full", progressClassName)} style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className={cn("mt-auto flex items-center justify-between font-body-sm text-body-sm", metricClassName)}>
        <div className="flex items-center gap-1">
          <span className="material-symbols-outlined text-[16px]">task_alt</span>
          <span>{taskLabel}</span>
        </div>
        <div className={cn("flex items-center gap-1", deadlineTone === "danger" ? "text-error" : undefined)}>
          <span className="material-symbols-outlined text-[16px]">
            {deadlineTone === "danger" ? "error" : "timer"}
          </span>
          <span>{deadlineLabel}</span>
        </div>
      </div>

      <button
        className="mt-4 w-full rounded-full border border-white/80 bg-surface-card py-2 font-button text-button text-primary transition-colors hover:bg-white"
        type="button"
      >
        {actionLabel}
      </button>
    </article>
  );
}
