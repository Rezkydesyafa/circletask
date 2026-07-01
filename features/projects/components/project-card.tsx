import type { Route } from "next";
import Link from "next/link";

import type { ProjectListItem } from "@/features/projects/types";
import { cn } from "@/lib/utils";

export function ProjectCard({ project }: { project: ProjectListItem }) {
  const deadline = getDeadlineLabel(project.deadline);
  const toneClass = getProjectToneClass(project.id);

  return (
    <article className={cn("flex min-h-[260px] flex-col rounded-[28px] border border-border-subtle p-5 shadow-sm transition-transform hover:-translate-y-1", toneClass)}>
      <div className="mb-5 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="line-clamp-2 font-heading-md text-heading-sm text-primary">{project.title}</h3>
          <p className="mt-2 line-clamp-2 font-body-sm text-body-sm text-text-secondary">
            {project.description ?? "Project CircleTask untuk pembagian task kelompok."}
          </p>
        </div>
        <span
          className={cn(
            "shrink-0 rounded-full px-3 py-1 font-label text-label",
            project.status === "active" ? "bg-primary text-on-primary" : "bg-surface-card text-text-secondary"
          )}
        >
          {project.status === "active" ? "Aktif" : project.status}
        </span>
      </div>

      <div className="mt-auto rounded-[20px] bg-white/80 p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <span className="font-label text-label text-text-soft">Progress</span>
          <span className="font-heading-sm text-heading-sm text-primary">{project.progress}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-surface-container-high">
          <div className="h-full rounded-full bg-primary" style={{ width: `${project.progress}%` }} />
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 font-body-sm text-body-sm text-text-secondary">
          <span className="inline-flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px]">task_alt</span>
            {project.approvedTaskCount}/{project.taskCount} task
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px]">schedule</span>
            {deadline}
          </span>
        </div>
      </div>

      <Link
        className="mt-4 inline-flex h-11 items-center justify-center rounded-full bg-primary font-button text-button text-on-primary shadow-sm transition-colors hover:bg-inverse-surface"
        href={`/groups/${project.groupId}/projects/${project.id}` as Route}
      >
        Buka Project
      </Link>
    </article>
  );
}

export function ProjectMiniProgress({ project }: { project: ProjectListItem }) {
  return (
    <Link
      className="block rounded-[20px] border border-border-subtle bg-surface-card p-4 transition-colors hover:bg-surface-container-low"
      href={`/groups/${project.groupId}/projects/${project.id}` as Route}
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <span className="truncate font-button text-button text-text-primary">{project.title}</span>
        <span className="font-label text-label text-text-soft">{project.progress}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-surface-container-high">
        <div className="h-full rounded-full bg-primary" style={{ width: `${project.progress}%` }} />
      </div>
    </Link>
  );
}

function getProjectToneClass(projectId: string) {
  const tones = ["bg-pastel-blue", "bg-pastel-yellow", "bg-pastel-lavender", "bg-pastel-pink"] as const;
  const charCode = projectId.charCodeAt(projectId.length - 1) || 0;

  return tones[charCode % tones.length];
}

export function getDeadlineLabel(value: string) {
  const deadline = new Date(value);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  deadline.setHours(0, 0, 0, 0);

  const diffDays = Math.ceil((deadline.getTime() - today.getTime()) / 86_400_000);

  if (diffDays < 0) {
    return `Lewat ${Math.abs(diffDays)} hari`;
  }

  if (diffDays === 0) {
    return "Deadline hari ini";
  }

  if (diffDays === 1) {
    return "Deadline besok";
  }

  return `Deadline ${diffDays} hari lagi`;
}
