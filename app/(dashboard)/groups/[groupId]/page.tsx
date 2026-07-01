import type { Route } from "next";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { getGroupContributionSummary } from "@/features/contributions/queries";
import { GroupHero, MetricCard, SectionCard } from "@/features/groups/components/group-ui";
import { GroupShell } from "@/features/groups/components/group-shell";
import { getGroupDashboardSummary } from "@/features/groups/queries";
import { ProjectMiniProgress } from "@/features/projects/components/project-card";
import { getGroupProjects } from "@/features/projects/queries";
import { hasSupabaseEnv } from "@/lib/env";

export const dynamic = "force-dynamic";

type GroupDashboardPageProps = {
  params: {
    groupId: string;
  };
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
  }).format(new Date(value));
}

export default async function GroupDashboardPage({ params }: GroupDashboardPageProps) {
  if (!hasSupabaseEnv()) {
    return <GroupFallback title="Dashboard Kelompok" message="Supabase belum dikonfigurasi." />;
  }

  try {
    const [summary, projects, contribution] = await Promise.all([
      getGroupDashboardSummary(params.groupId),
      getGroupProjects(params.groupId),
      getGroupContributionSummary(params.groupId),
    ]);
    const progress =
      summary.taskCount === 0 ? 0 : Math.round((summary.approvedTaskCount / summary.taskCount) * 100);
    const contributionTaskCount = contribution.members.reduce(
      (total, member) => total + member.taskCount,
      0
    );

    return (
      <GroupShell group={summary.group}>
        <GroupHero
          title="Dashboard Kelompok"
          subtitle={summary.group.name}
          description="Pantau progress, task, kontribusi, dan aktivitas kelompok."
          actions={
            <>
              <span className="inline-flex h-9 items-center rounded-full bg-primary px-4 font-label text-label text-on-primary">
                {summary.group.role === "leader" ? "Ketua" : "Anggota"}
              </span>
              {summary.group.role === "leader" ? (
                <Button asChild className="rounded-full bg-primary px-5 text-on-primary">
                  <Link href={`/groups/${params.groupId}/projects/new` as Route}>Buat Project</Link>
                </Button>
              ) : null}
            </>
          }
        />

        <div className="grid grid-cols-1 gap-section-gap xl:grid-cols-12">
          <div className="space-y-section-gap xl:col-span-8">
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              <MetricCard icon="folder" label="Project" tone="blue" value={summary.projectCount} />
              <MetricCard icon="task_alt" label="Task" tone="lavender" value={summary.taskCount} />
              <MetricCard icon="rate_review" label="Review" tone="yellow" value={summary.pendingReviewCount} />
              <MetricCard icon="trending_up" label="Progress" tone="green" value={`${progress}%`} />
            </div>

            <div className="grid grid-cols-1 gap-section-gap md:grid-cols-2">
              <SectionCard>
                <div className="mb-6 flex items-center justify-between gap-3">
                  <h3 className="font-heading-sm text-heading-sm text-text-primary">Task Menunggu Review</h3>
                  <span className="rounded-md bg-pastel-yellow px-2 py-1 font-label text-label text-primary">
                    {summary.pendingReviewCount} Task
                  </span>
                </div>
                {summary.pendingReviewCount > 0 ? (
                  <div className="space-y-3">
                    <ReviewPreviewItem
                      title="Task siap divalidasi"
                      meta={`${summary.pendingReviewCount} task perlu keputusan ketua`}
                    />
                    <Button asChild className="mt-4 rounded-full bg-primary text-on-primary">
                      <Link href={`/groups/${params.groupId}/review` as Route}>Buka Review</Link>
                    </Button>
                  </div>
                ) : (
                  <EmptyBlock
                    icon="rate_review"
                    title="Belum ada review"
                    description="Task yang disubmit anggota akan muncul di sini."
                  />
                )}
              </SectionCard>

              <SectionCard title="Progress Project">
                {projects.length > 0 ? (
                  <div className="space-y-4">
                    {projects.slice(0, 4).map((project) => (
                      <ProjectMiniProgress key={project.id} project={project} />
                    ))}
                  </div>
                ) : (
                  <EmptyBlock
                    icon="view_kanban"
                    title="Belum ada project"
                    description="Ketua bisa mulai membuat project pertama untuk kelompok ini."
                  />
                )}
              </SectionCard>
            </div>
          </div>

          <aside className="flex flex-col gap-section-gap xl:col-span-4">
            <SectionCard className="border-pastel-lavender bg-pastel-lavender/45" title="Aksi Cepat">
              <div className="grid grid-cols-2 gap-3">
                <QuickAction
                  disabled={summary.group.role !== "leader"}
                  href={`/groups/${params.groupId}/projects/new` as Route}
                  icon="add"
                  label="Buat Project"
                />
                <QuickAction
                  href={`/groups/${params.groupId}/projects` as Route}
                  icon="view_kanban"
                  label="Project"
                />
                <QuickAction
                  disabled={summary.group.role !== "leader"}
                  href={`/groups/${params.groupId}/review` as Route}
                  icon="rate_review"
                  label="Review"
                />
                <QuickAction
                  href={`/groups/${params.groupId}/contribution` as Route}
                  icon="leaderboard"
                  label="Kontribusi"
                />
              </div>
            </SectionCard>

            <SectionCard title="Kontribusi Anggota">
              {contributionTaskCount > 0 ? (
                <div className="space-y-4">
                  {contribution.members.slice(0, 5).map((member) => (
                    <ContributionPreviewRow
                      key={member.userId}
                      name={member.fullName}
                      percentage={member.percentage}
                    />
                  ))}
                  <Button asChild className="mt-2 w-full rounded-full bg-primary text-on-primary">
                    <Link href={`/groups/${params.groupId}/contribution` as Route}>Lihat Detail</Link>
                  </Button>
                </div>
              ) : (
                <EmptyBlock
                  icon="leaderboard"
                  title="Belum ada kontribusi"
                  description="Kontribusi muncul setelah task approved atau done."
                />
              )}
            </SectionCard>

            <SectionCard title="Info Kelompok">
              <div className="space-y-4">
                <InfoItem label="Anggota" value={String(summary.memberCount)} />
                <InfoItem
                  label="Kode join"
                  value={summary.group.role === "leader" ? summary.group.joinCode : "Hanya ketua"}
                />
                <InfoItem
                  label="Deadline terdekat"
                  value={
                    summary.nearestDeadlineTask
                      ? `${summary.nearestDeadlineTask.title} - ${formatDate(summary.nearestDeadlineTask.deadline)}`
                      : "Belum ada task aktif"
                  }
                />
              </div>
            </SectionCard>
          </aside>
        </div>
      </GroupShell>
    );
  } catch (error) {
    return (
      <GroupFallback
        title="Dashboard Kelompok"
        message={error instanceof Error ? error.message : "Dashboard kelompok belum bisa dimuat."}
      />
    );
  }
}

function ReviewPreviewItem({ meta, title }: { meta: string; title: string }) {
  return (
    <div className="group flex items-center justify-between gap-4 rounded-[20px] border border-border-subtle bg-surface-container-low p-4">
      <div className="min-w-0">
        <p className="font-button text-button text-text-primary">{title}</p>
        <p className="mt-1 font-body-sm text-body-sm text-text-soft">{meta}</p>
      </div>
      <span className="material-symbols-outlined text-text-soft transition-colors group-hover:text-primary">
        arrow_forward
      </span>
    </div>
  );
}

function QuickAction({
  disabled = false,
  href,
  icon,
  label,
}: {
  disabled?: boolean;
  href: Route;
  icon: string;
  label: string;
}) {
  if (disabled) {
    return (
      <div className="flex min-h-[104px] flex-col items-center justify-center rounded-[16px] border border-dashed border-border-subtle bg-surface-card/70 text-text-soft">
        <span className="material-symbols-outlined mb-2 text-[24px]">{icon}</span>
        <span className="font-button text-button text-center">{label}</span>
      </div>
    );
  }

  return (
    <Link
      className="group flex min-h-[104px] flex-col items-center justify-center rounded-[16px] bg-surface-card text-text-primary shadow-sm transition-all hover:shadow-md"
      href={href}
    >
      <span className="material-symbols-outlined mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-pastel-blue text-[24px] text-primary transition-transform group-hover:scale-110">
        {icon}
      </span>
      <span className="font-button text-button text-center">{label}</span>
    </Link>
  );
}

function ContributionPreviewRow({
  name,
  percentage,
}: {
  name: string;
  percentage: number;
}) {
  const roundedPercentage = Math.round(percentage);

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-pastel-yellow font-label text-label text-primary">
            {name.slice(0, 2).toUpperCase()}
          </div>
          <span className="truncate font-button text-button text-text-primary">{name}</span>
        </div>
        <span className="font-label text-label text-text-secondary">{roundedPercentage}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-surface-dim">
        <div className="h-full rounded-full bg-primary" style={{ width: `${roundedPercentage}%` }} />
      </div>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-surface-container-low px-4 py-3">
      <p className="font-label text-label uppercase tracking-wider text-text-soft">{label}</p>
      <p className="mt-2 font-body text-body text-text-primary">{value}</p>
    </div>
  );
}

function EmptyBlock({ description, icon, title }: { description: string; icon: string; title: string }) {
  return (
    <div className="flex min-h-[180px] flex-col items-center justify-center rounded-[22px] border border-dashed border-border-subtle bg-surface-container-low p-6 text-center">
      <span className="material-symbols-outlined mb-3 text-[32px] text-text-soft">{icon}</span>
      <p className="font-heading-sm text-heading-sm text-text-primary">{title}</p>
      <p className="mt-2 max-w-sm font-body-sm text-body-sm text-text-secondary">{description}</p>
    </div>
  );
}

function GroupFallback({ message, title }: { message: string; title: string }) {
  return (
    <div className="h-full w-full overflow-y-auto p-6">
      <GroupHero
        title={title}
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
