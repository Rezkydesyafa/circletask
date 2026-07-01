import Link from "next/link";

import { PriorityBadge } from "@/components/common/priority-badge";
import { Button } from "@/components/ui/button";
import { GroupHero, SectionCard } from "@/features/groups/components/group-ui";
import { GroupShell } from "@/features/groups/components/group-shell";
import { getGroupById } from "@/features/groups/queries";
import { getPendingReviewTasks } from "@/features/reviews/queries";
import { hasSupabaseEnv } from "@/lib/env";

export const dynamic = "force-dynamic";

type ReviewPageProps = {
  params: {
    groupId: string;
  };
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", { dateStyle: "medium" }).format(new Date(value));
}

export default async function ReviewPage({ params }: ReviewPageProps) {
  if (!hasSupabaseEnv()) {
    return <ReviewFallback message="Supabase belum dikonfigurasi." />;
  }

  try {
    const group = await getGroupById(params.groupId);
    const tasks = group.role === "leader" ? await getPendingReviewTasks(params.groupId) : [];

    return (
      <GroupShell group={group}>
        <GroupHero
          eyebrow={group.name}
          title="Review Task"
          description="Validasi task yang sudah disubmit anggota beserta bukti pekerjaannya."
        />

        <SectionCard>
          {group.role !== "leader" ? (
            <EmptyReview title="Akses ketua diperlukan" description="Halaman review hanya untuk ketua kelompok." />
          ) : tasks.length > 0 ? (
            <div className="space-y-3">
              {tasks.map((task) => (
                <article
                  className="rounded-[22px] border border-border-subtle bg-surface-container-low p-4"
                  key={task.id}
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                      <h2 className="font-heading-sm text-heading-sm text-text-primary">{task.title}</h2>
                      <p className="mt-1 font-body-sm text-body-sm text-text-secondary">
                        Oleh {task.assigneeName} - {formatDate(task.deadline)}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <PriorityBadge priority={task.priority} />
                      <span className="rounded-full bg-pastel-blue px-3 py-1 font-label text-label text-primary">
                        {task.evidenceCount} bukti
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <EmptyReview
              title="Belum ada task review"
              description="Task yang disubmit anggota akan muncul di halaman ini."
            />
          )}
        </SectionCard>
      </GroupShell>
    );
  } catch (error) {
    return <ReviewFallback message={error instanceof Error ? error.message : "Review task belum bisa dimuat."} />;
  }
}

function EmptyReview({ description, title }: { description: string; title: string }) {
  return (
    <div className="flex min-h-[300px] flex-col items-center justify-center text-center">
      <span className="material-symbols-outlined mb-4 text-[42px] text-text-soft">rate_review</span>
      <h2 className="font-heading-sm text-heading-sm text-text-primary">{title}</h2>
      <p className="mt-2 max-w-md font-body text-body text-text-secondary">{description}</p>
    </div>
  );
}

function ReviewFallback({ message }: { message: string }) {
  return (
    <div className="h-full w-full overflow-y-auto p-6">
      <GroupHero
        title="Review Task"
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
