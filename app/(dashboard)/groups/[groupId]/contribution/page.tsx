import Link from "next/link";

import { Button } from "@/components/ui/button";
import { getGroupContributionSummary } from "@/features/contributions/queries";
import { GroupHero, MetricCard, SectionCard } from "@/features/groups/components/group-ui";
import { GroupShell } from "@/features/groups/components/group-shell";
import { getGroupById } from "@/features/groups/queries";
import { hasSupabaseEnv } from "@/lib/env";

export const dynamic = "force-dynamic";

type ContributionPageProps = {
  params: {
    groupId: string;
  };
};

export default async function ContributionPage({ params }: ContributionPageProps) {
  if (!hasSupabaseEnv()) {
    return <ContributionFallback message="Supabase belum dikonfigurasi." />;
  }

  try {
    const [group, contribution] = await Promise.all([
      getGroupById(params.groupId),
      getGroupContributionSummary(params.groupId),
    ]);
    const topMember = contribution.members[0];

    return (
      <GroupShell group={group}>
        <GroupHero
          eyebrow={group.name}
          title="Kontribusi Anggota"
          description="Skor kontribusi dihitung dari task approved atau done sesuai aturan PRD."
        />

        <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <MetricCard icon="scoreboard" label="Total Skor" tone="blue" value={contribution.totalScore} />
          <MetricCard icon="groups" label="Anggota" tone="lavender" value={contribution.members.length} />
          <MetricCard icon="task_alt" label="Task Dinilai" tone="green" value={contribution.members.reduce((total, member) => total + member.taskCount, 0)} />
          <MetricCard icon="emoji_events" label="Tertinggi" tone="yellow" value={topMember ? `${topMember.percentage}%` : "0%"} />
        </div>

        <SectionCard title="Tabel Kontribusi">
          {contribution.members.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left">
                <thead>
                  <tr className="border-b border-border-subtle font-label text-label uppercase tracking-wider text-text-soft">
                    <th className="py-3 pr-4">Anggota</th>
                    <th className="py-3 pr-4">Task</th>
                    <th className="py-3 pr-4">Skor Awal</th>
                    <th className="py-3 pr-4">Skor Final</th>
                    <th className="py-3 pr-4">Persentase</th>
                  </tr>
                </thead>
                <tbody>
                  {contribution.members.map((member) => (
                    <tr className="border-b border-border-subtle last:border-b-0" key={member.userId}>
                      <td className="py-4 pr-4">
                        <p className="font-button text-button text-text-primary">{member.fullName}</p>
                        <p className="font-body-sm text-body-sm text-text-soft">{member.email}</p>
                      </td>
                      <td className="py-4 pr-4 font-body text-body text-text-primary">{member.taskCount}</td>
                      <td className="py-4 pr-4 font-body text-body text-text-primary">{member.rawScore}</td>
                      <td className="py-4 pr-4 font-body text-body text-text-primary">{member.finalScore}</td>
                      <td className="py-4 pr-4">
                        <span className="rounded-full bg-pastel-blue px-3 py-1 font-label text-label text-primary">
                          {member.percentage}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex min-h-[260px] flex-col items-center justify-center text-center">
              <span className="material-symbols-outlined mb-4 text-[42px] text-text-soft">leaderboard</span>
              <h2 className="font-heading-sm text-heading-sm text-text-primary">Belum ada kontribusi</h2>
              <p className="mt-2 max-w-md font-body text-body text-text-secondary">
                Kontribusi akan muncul setelah task berstatus approved atau done.
              </p>
            </div>
          )}
        </SectionCard>
      </GroupShell>
    );
  } catch (error) {
    return (
      <ContributionFallback
        message={error instanceof Error ? error.message : "Kontribusi belum bisa dimuat."}
      />
    );
  }
}

function ContributionFallback({ message }: { message: string }) {
  return (
    <div className="h-full w-full overflow-y-auto p-6">
      <GroupHero
        title="Kontribusi Anggota"
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
