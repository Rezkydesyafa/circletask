import { cn } from "@/lib/utils";

type LoadingStateProps = {
  label?: string;
  className?: string;
};

export function LoadingState({ label = "Memuat data", className }: LoadingStateProps) {
  return (
    <div className={cn("flex items-center gap-3 text-sm text-muted-foreground", className)}>
      <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      <span>{label}</span>
    </div>
  );
}
