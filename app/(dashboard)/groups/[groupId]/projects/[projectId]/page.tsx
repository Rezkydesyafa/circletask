import type { Route } from "next";
import Link from "next/link";

import { PriorityBadge } from "@/components/common/priority-badge";
import { StatusBadge } from "@/components/common/status-badge";
import { Button } from "@/components/ui/button";
import { EmptyPanel, FilterPill, GroupHero, MetricCard, SectionCard } from "@/features/groups/components/group-ui";
import { GroupShell } from "@/features/groups/components/group-shell";
import { getGroupById } from "@/features/groups/queries";
import { getDeadlineLabel } from "@/features/projects/components/project-card";
import { getProjectDetail } from "@/features/projects/queries";
import { getProjectTasks } from "@/features/tasks/queries";
import { hasSupabaseEnv } from "@/lib/env";

export const dynamic = "force-dynamic";

type ProjectDetailPageProps = {
  params: {
    groupId: string;
    projectId: string;
  };
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
  }).format(new Date(value));
}

export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  if (!hasSupabaseEnv()) {
    return <ProjectDetailFallback message="Supabase belum dikonfigurasi." />;
  }

  try {
    const [group, project, tasks] = await Promise.all([
      getGroupById(params.groupId),
      getProjectDetail(params.groupId, params.projectId),
      getProjectTasks(params.groupId, params.projectId),
    ]);

    return (
      <GroupShell group={group}>
        <GroupHero
          eyebrow={group.name}
          title={project.title}
          description={project.description ?? "Detail progress project dan task kelompok."}
          actions={
            <>
              <Button asChild className="rounded-full" variant="outline">
                <Link href={`/groups/${params.groupId}/projects` as Route}>Semua Project</Link>
              </Button>
              {group.role === "leader" ? (
                <Button className="rounded-full bg-primary text-on-primary" disabled>
                  Buat Task
                </Button>
              ) : null}
            </>
          }
        />

        <SectionCard className="mb-6 overflow-hidden bg-surface-card">
          <div className="relative">
            <div className="absolute -right-10 -top-12 h-40 w-40 rounded-full bg-pastel-blue/50" />
            <div className="relative z-10 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div className="min-w-0">
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-surface-container-low px-3 py-1 font-label text-label text-text-secondary">
                    {group.name}
                  </span>
                  <span className="rounded-full bg-primary px-3 py-1 font-label text-label text-on-primary">
                    {project.status === "active" ? "Aktif" : project.status}
                  </span>
                  <span className="rounded-full bg-pastel-yellow px-3 py-1 font-label text-label text-primary">
                    {getDeadlineLabel(project.deadline)}
                  </span>
                </div>
                <h2 className="font-heading-md text-heading-md text-text-primary">{project.title}</h2>
                <p className="mt-2 max-w-2xl font-body text-body text-text-secondary">
                  {project.description ?? "Detail progress project dan task kelompok."}
                </p>
              </div>
              <div className="w-full max-w-sm">
                <div className="mb-2 flex items-center justify-between font-label text-label uppercase tracking-wider text-text-secondary">
                  <span>Progress Project</span>
                  <span className="text-primary">{project.progress}%</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full border border-border-subtle bg-shell-bg">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${project.progress}%` }} />
                </div>
              </div>
            </div>
          </div>
        </SectionCard>

        <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
          <MetricCard icon="task_alt" label="Total Task" tone="blue" value={project.taskCount} />
          <MetricCard icon="verified" label="Selesai" tone="green" value={project.approvedTaskCount} />
          <MetricCard icon="rate_review" label="Review" tone="yellow" value={project.pendingReviewTaskCount} />
          <MetricCard icon="error" label="Revision" tone="lavender" value={project.revisionTaskCount} />
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <SectionCard>
            <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <h3 className="font-heading-sm text-heading-sm text-primary">Daftar Task</h3>
              <div className="flex gap-2 overflow-x-auto pb-1">
                <FilterPill active label="Semua" />
                <FilterPill label="To Do" />
                <FilterPill label="In Progress" />
                <FilterPill label="Submit Review" />
              </div>
            </div>
            {tasks.length > 0 ? (
              <div className="space-y-3">
                {tasks.map((task) => (
                  <TaskRow
                    assignee={task.assigneeName}
                    deadline={formatDate(task.deadline)}
                    key={task.id}
                    priority={task.priority}
                    status={task.status}
                    title={task.title}
                    weight={task.weight}
                  />
                ))}
              </div>
            ) : (
              <EmptyPanel
                description="Task akan tampil di sini setelah ketua membuat pembagian pekerjaan."
                icon="task_alt"
                title="Belum ada task"
              />
            )}
          </SectionCard>

          <aside className="space-y-6">
            <SectionCard title="Ringkasan Project">
              <div className="mb-5 rounded-[22px] bg-pastel-blue p-5">
                <div className="mb-2 flex items-center justify-between font-label text-label text-text-secondary">
                  <span>Progress</span>
                  <span>{project.progress}%</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-white/70">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${project.progress}%` }} />
                </div>
              </div>
              <div className="space-y-4">
                <SummaryLine label="To Do" value={project.todoTaskCount} />
                <SummaryLine label="In Progress" value={project.inProgressTaskCount} />
                <SummaryLine label="Submit Review" value={project.pendingReviewTaskCount} />
                <SummaryLine label="Revision" value={project.revisionTaskCount} />
              </div>
            </SectionCard>

            <SectionCard title="Deadline Terdekat">
              <div className="rounded-xl border border-error-container/30 bg-error-container/10 p-4">
                <p className="font-heading-sm text-heading-sm text-text-primary">{formatDate(project.deadline)}</p>
                <p className="mt-2 font-body-sm text-body-sm text-text-secondary">{getDeadlineLabel(project.deadline)}</p>
              </div>
            </SectionCard>

            <SectionCard title="Aktivitas Project">
              <div className="flex min-h-[180px] flex-col justify-center border-l border-border-subtle pl-4">
                <p className="font-body-sm text-body-sm text-text-secondary">
                  Aktivitas detail akan muncul dari activity log task/project setelah workflow task berjalan.
                </p>
              </div>
            </SectionCard>
          </aside>
        </div>
      </GroupShell>
    );
  } catch (error) {
    return (
      <ProjectDetailFallback
        message={error instanceof Error ? error.message : "Detail project belum bisa dimuat."}
      />
    );
  }
}

function TaskRow({
  assignee,
  deadline,
  priority,
  status,
  title,
  weight,
}: {
  assignee: string;
  deadline: string;
  priority: "low" | "medium" | "high";
  status: "todo" | "in_progress" | "submit_review" | "revision" | "approved" | "done";
  title: string;
  weight: number;
}) {
  const isDone = status === "approved" || status === "done";

  return (
    <article className="group flex items-start gap-4 rounded-xl border border-border-subtle bg-surface-main p-4 shadow-sm transition-all hover:border-text-soft/30 hover:bg-shell-bg">
      <span
        className={[
          "material-symbols-outlined mt-1 text-[22px]",
          isDone ? "text-primary" : "text-pastel-blue",
        ].join(" ")}
        style={isDone ? { fontVariationSettings: "'FILL' 1" } : undefined}
      >
        {isDone ? "check_circle" : "radio_button_unchecked"}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0">
            <h4 className="font-button text-button text-text-primary">{title}</h4>
            <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 font-body-sm text-body-sm text-text-soft">
              <span>{assignee}</span>
              <span>{deadline}</span>
              <span>{weight} pts</span>
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <PriorityBadge priority={priority} />
            <StatusBadge status={status} />
          </div>
        </div>
      </div>
    </article>
  );
}

function SummaryLine({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-surface-container-low px-4 py-3">
      <span className="font-body-sm text-body-sm text-text-secondary">{label}</span>
      <span className="font-heading-sm text-heading-sm text-text-primary">{value}</span>
    </div>
  );
}

function ProjectDetailFallback({ message }: { message: string }) {
  return (
    <div className="h-full w-full overflow-y-auto p-6">
      <GroupHero
        title="Detail Project"
        description={message}
        actions={
          <Button asChild variant="outline">
            <Link href="/groups">Kembali ke Kelompok</Link>
          </Button>
        }
      />
    </div>
  );
}
