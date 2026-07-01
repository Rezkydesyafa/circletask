import { cn } from "@/lib/utils";

type StatCardProps = {
  label: string;
  value: string;
  tone?: "default" | "danger";
};

export function StatCard({ label, value, tone = "default" }: StatCardProps) {
  return (
    <article className="flex min-w-[150px] flex-1 flex-col rounded-[18px] border border-border-subtle bg-surface-card p-4 shadow-[0_2px_10px_rgba(0,0,0,0.01)]">
      <span className="font-label text-label text-text-secondary">{label}</span>
      <span
        className={cn(
          "mt-1 font-heading-md text-heading-md",
          tone === "danger" ? "text-error" : "text-text-primary"
        )}
      >
        {value}
      </span>
    </article>
  );
}
