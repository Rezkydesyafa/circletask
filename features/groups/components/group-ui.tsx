import type { ReactNode } from "react";

import type { MemberContribution } from "@/features/contributions/types";
import type { GroupMemberItem } from "@/features/groups/types";
import { cn } from "@/lib/utils";

type GroupHeroProps = {
  description?: string | null;
  eyebrow?: string;
  subtitle?: string | null;
  title: string;
  actions?: ReactNode;
};

type MetricCardProps = {
  icon: string;
  label: string;
  tone?: "blue" | "green" | "lavender" | "yellow";
  value: string | number;
};

export function GroupHero({ actions, description, eyebrow, subtitle, title }: GroupHeroProps) {
  return (
    <header className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="min-w-0">
        {eyebrow ? (
          <p className="mb-2 font-label text-label uppercase tracking-wider text-text-soft">{eyebrow}</p>
        ) : null}
        <h1 className="font-heading-lg text-heading-lg text-text-primary">{title}</h1>
        {subtitle ? (
          <h2 className="mt-1 font-heading-md text-heading-md text-text-secondary">{subtitle}</h2>
        ) : null}
        {description ? (
          <p className="mt-2 max-w-2xl font-body text-body text-text-secondary">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap gap-3">{actions}</div> : null}
    </header>
  );
}

export function MetricCard({ icon, label, tone = "blue", value }: MetricCardProps) {
  const toneClass = {
    blue: "bg-pastel-blue/55",
    green: "bg-mint-strong/45",
    lavender: "bg-pastel-lavender/55",
    yellow: "bg-pastel-yellow/55",
  }[tone];

  return (
    <div className={cn("flex flex-col gap-2 rounded-[24px] border border-border-subtle p-6 shadow-[0_8px_30px_rgba(0,0,0,0.03)]", toneClass)}>
      <div className="flex items-center justify-between">
        <span className="material-symbols-outlined text-primary">{icon}</span>
        <span className="font-label text-label uppercase tracking-wider text-text-soft">{label}</span>
      </div>
      <p className="font-display text-[34px] font-bold leading-none text-text-primary">{value}</p>
    </div>
  );
}

export function SectionCard({
  children,
  className,
  title,
}: {
  children: ReactNode;
  className?: string;
  title?: string;
}) {
  return (
    <section className={cn("rounded-[28px] border border-border-subtle bg-surface-card p-6 shadow-sm", className)}>
      {title ? <h2 className="mb-5 font-heading-sm text-heading-sm text-text-primary">{title}</h2> : null}
      {children}
    </section>
  );
}

export function FilterPill({ active = false, label }: { active?: boolean; label: string }) {
  return (
    <button
      className={cn(
        "rounded-full px-5 py-2.5 font-label text-label transition-colors",
        active
          ? "bg-primary text-on-primary shadow-sm"
          : "border border-border-subtle bg-surface-card text-text-secondary hover:bg-surface-container-high hover:text-primary"
      )}
      type="button"
    >
      {label}
    </button>
  );
}

export function EmptyPanel({
  action,
  description,
  icon,
  title,
}: {
  action?: ReactNode;
  description: string;
  icon: string;
  title: string;
}) {
  return (
    <div className="flex min-h-[260px] flex-col items-center justify-center rounded-[28px] border border-dashed border-border-subtle bg-surface-container-low p-8 text-center">
      <span className="material-symbols-outlined mb-4 text-[42px] text-text-soft">{icon}</span>
      <h2 className="font-heading-sm text-heading-sm text-text-primary">{title}</h2>
      <p className="mt-2 max-w-md font-body text-body text-text-secondary">{description}</p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}

export function MemberCard({
  contribution,
  member,
}: {
  contribution?: MemberContribution;
  member: GroupMemberItem;
}) {
  const contributionPercentage = contribution ? `${Math.round(contribution.percentage)}%` : "0%";
  const taskCount = contribution?.taskCount ?? 0;

  return (
    <article className="group relative overflow-hidden rounded-[24px] border border-border-subtle bg-surface-card p-6 shadow-[0_8px_30px_rgba(0,0,0,0.03)] transition-colors hover:border-primary/30">
      <div className="absolute right-0 top-0 h-32 w-32 rounded-bl-[100px] bg-pastel-yellow opacity-35" />
      <div className="relative z-10 mb-4 flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 border-surface-main bg-pastel-yellow font-heading-sm text-sm text-primary">
            {getInitials(member.fullName)}
          </div>
          <div className="min-w-0">
            <h3 className="truncate font-heading-sm text-heading-sm text-text-primary">{member.fullName}</h3>
            <p className="truncate font-body-sm text-body-sm text-text-soft">{member.email}</p>
          </div>
        </div>
        <span
          className={cn(
            "rounded-full px-3 py-1.5 font-label text-label",
            member.role === "leader"
              ? "bg-primary text-on-primary"
              : "bg-pastel-lavender text-text-primary"
          )}
        >
          {member.role === "leader" ? "Ketua" : "Anggota"}
        </span>
      </div>

      <div className="relative z-10 mb-6 grid grid-cols-4 gap-2 border-y border-border-subtle py-4">
        <MemberStat label="Role" value={member.role === "leader" ? "Ketua" : "Anggota"} />
        <MemberStat label="Task" value={String(taskCount)} />
        <MemberStat label="Skor" value={String(contribution?.finalScore ?? 0)} />
        <MemberStat label="Kontribusi" value={contributionPercentage} />
      </div>

      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-2 text-primary">
          <span className="material-symbols-outlined text-[18px]">check_circle</span>
          <span className="font-label text-label">Aktif</span>
        </div>
        <button
          className="rounded-full bg-surface-container-high px-4 py-2 font-button text-button text-primary transition-colors hover:bg-surface-container-highest"
          type="button"
        >
          Detail
        </button>
      </div>
    </article>
  );
}

function MemberStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 text-center">
      <p className="truncate font-heading-sm text-[15px] font-bold leading-tight text-text-primary">{value}</p>
      <p className="font-body-sm text-body-sm text-text-soft">{label}</p>
    </div>
  );
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
