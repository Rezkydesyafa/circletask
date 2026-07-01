import Link from "next/link";

import { Button } from "@/components/ui/button";
import { getGroupContributionSummary } from "@/features/contributions/queries";
import { FilterPill, GroupHero, MemberCard, SectionCard } from "@/features/groups/components/group-ui";
import { GroupShell } from "@/features/groups/components/group-shell";
import { getGroupById, getGroupMembers } from "@/features/groups/queries";
import { hasSupabaseEnv } from "@/lib/env";

export const dynamic = "force-dynamic";

type GroupMembersPageProps = {
  params: {
    groupId: string;
  };
};

export default async function GroupMembersPage({ params }: GroupMembersPageProps) {
  if (!hasSupabaseEnv()) {
    return <MembersFallback message="Supabase belum dikonfigurasi." />;
  }

  try {
    const [group, members, contribution] = await Promise.all([
      getGroupById(params.groupId),
      getGroupMembers(params.groupId),
      getGroupContributionSummary(params.groupId),
    ]);
    const leaderCount = members.filter((member) => member.role === "leader").length;
    const memberCount = members.filter((member) => member.role === "member").length;
    const activeCount = members.length;
    const averageContribution =
      contribution.members.length > 0
        ? Math.round(
            contribution.members.reduce((total, member) => total + member.percentage, 0) /
              contribution.members.length
          )
        : 0;
    const contributionByUserId = new Map(
      contribution.members.map((member) => [member.userId, member])
    );

    return (
      <GroupShell group={group}>
        <GroupHero
          title="Anggota Kelompok"
          description="Lihat anggota, role, status aktivitas, dan kontribusi ringkas."
        />

        <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
          <div className="flex flex-col gap-6">
            <div className="flex flex-wrap gap-3">
              <FilterPill active label="Semua" />
              <FilterPill label="Ketua" />
              <FilterPill label="Anggota" />
              <FilterPill label="Aktif" />
              <FilterPill label="Kurang Aktif" />
            </div>

            <section className="grid grid-cols-1 gap-card-gap md:grid-cols-2">
              {members.map((member) => (
                <MemberCard
                  contribution={contributionByUserId.get(member.userId)}
                  key={member.userId}
                  member={member}
                />
              ))}
            </section>
          </div>

          <aside className="flex flex-col gap-6">
            <SectionCard title="Ringkasan Tim">
              <div className="space-y-5">
                <SummaryRow label="Total Anggota" value={members.length} />
                <SummaryRow label="Ketua" value={leaderCount} />
                <SummaryRow label="Anggota" value={memberCount} />
                <SummaryRow label="Aktif" value={activeCount} />
                <div className="flex items-center justify-between pt-2">
                  <span className="font-body text-body text-text-secondary">Rata-rata Kontribusi</span>
                  <span className="rounded-full bg-pastel-blue px-3 py-1.5 font-label text-label text-primary">
                    {averageContribution}%
                  </span>
                </div>
              </div>
            </SectionCard>

            <SectionCard title="Kode Join">
              <p className="rounded-2xl bg-surface-container-low px-4 py-3 font-mono text-xl font-bold tracking-widest text-text-primary">
                {group.role === "leader" ? group.joinCode : "Hanya ketua"}
              </p>
              <p className="mt-4 font-body-sm text-body-sm text-text-secondary">
                Bagikan kode ini ke anggota kelompok. User yang join otomatis menjadi anggota.
              </p>
              {group.role === "leader" ? (
                <Button className="mt-5 w-full rounded-full bg-primary text-on-primary" disabled>
                  Tambah Anggota
                </Button>
              ) : null}
            </SectionCard>
          </aside>
        </div>
      </GroupShell>
    );
  } catch (error) {
    return (
      <MembersFallback
        message={error instanceof Error ? error.message : "Daftar anggota belum bisa dimuat."}
      />
    );
  }
}

function SummaryRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between border-b border-border-subtle pb-4 last:border-b-0">
      <span className="font-body text-body text-text-secondary">{label}</span>
      <span className="font-heading-sm text-heading-sm text-primary">{value}</span>
    </div>
  );
}

function MembersFallback({ message }: { message: string }) {
  return (
    <div className="h-full w-full overflow-y-auto p-6">
      <GroupHero
        title="Anggota Kelompok"
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
