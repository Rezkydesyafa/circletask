import Link from "next/link";

import { Button } from "@/components/ui/button";
import { getGroupActivityLogs } from "@/features/activity-logs/queries";
import { GroupHero, SectionCard } from "@/features/groups/components/group-ui";
import { GroupShell } from "@/features/groups/components/group-shell";
import { getGroupById } from "@/features/groups/queries";
import { hasSupabaseEnv } from "@/lib/env";

export const dynamic = "force-dynamic";

type ActivityPageProps = {
  params: {
    groupId: string;
  };
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default async function ActivityPage({ params }: ActivityPageProps) {
  if (!hasSupabaseEnv()) {
    return <ActivityFallback message="Supabase belum dikonfigurasi." />;
  }

  try {
    const [group, activities] = await Promise.all([
      getGroupById(params.groupId),
      getGroupActivityLogs(params.groupId, 50),
    ]);

    return (
      <GroupShell group={group}>
        <GroupHero
          eyebrow={group.name}
          title="Riwayat Aktivitas"
          description="Semua aksi penting kelompok dicatat untuk transparansi kerja."
        />

        <SectionCard title="Timeline Aktivitas">
          {activities.length > 0 ? (
            <div className="space-y-4">
              {activities.map((activity) => (
                <article className="flex gap-4 rounded-[22px] bg-surface-container-low p-4" key={activity.id}>
                  <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-on-primary">
                    <span className="material-symbols-outlined text-[20px]">history</span>
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-button text-button text-text-primary">{activity.description ?? activity.action}</h2>
                      <span className="rounded-full bg-surface-card px-2.5 py-1 font-label text-label text-text-soft">
                        {activity.action}
                      </span>
                    </div>
                    <p className="mt-1 font-body-sm text-body-sm text-text-secondary">
                      {activity.userName} - {formatDate(activity.createdAt)}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="flex min-h-[300px] flex-col items-center justify-center text-center">
              <span className="material-symbols-outlined mb-4 text-[42px] text-text-soft">history</span>
              <h2 className="font-heading-sm text-heading-sm text-text-primary">Belum ada aktivitas</h2>
              <p className="mt-2 max-w-md font-body text-body text-text-secondary">
                Activity log akan terisi saat project, task, bukti, review, atau laporan diproses.
              </p>
            </div>
          )}
        </SectionCard>
      </GroupShell>
    );
  } catch (error) {
    return (
      <ActivityFallback
        message={error instanceof Error ? error.message : "Activity log belum bisa dimuat."}
      />
    );
  }
}

function ActivityFallback({ message }: { message: string }) {
  return (
    <div className="h-full w-full overflow-y-auto p-6">
      <GroupHero
        title="Riwayat Aktivitas"
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
