import Link from "next/link";

import { Button } from "@/components/ui/button";
import { GroupHero, MetricCard, SectionCard } from "@/features/groups/components/group-ui";
import { GroupShell } from "@/features/groups/components/group-shell";
import { getGroupById } from "@/features/groups/queries";
import { ExportReportButton } from "@/features/reports/components/export-report-button";
import { getReportPreviewData } from "@/features/reports/queries";
import { hasSupabaseEnv } from "@/lib/env";

export const dynamic = "force-dynamic";

type ReportPageProps = {
  params: {
    groupId: string;
  };
};

export default async function ReportPage({ params }: ReportPageProps) {
  if (!hasSupabaseEnv()) {
    return <ReportFallback message="Supabase belum dikonfigurasi." />;
  }

  try {
    const group = await getGroupById(params.groupId);

    if (group.role !== "leader") {
      return (
        <GroupShell group={group}>
          <GroupHero
            eyebrow={group.name}
            title="Laporan Kontribusi"
            description="Preview dan export laporan hanya tersedia untuk ketua kelompok."
          />
          <SectionCard>
            <div className="flex min-h-[300px] flex-col items-center justify-center text-center">
              <span className="material-symbols-outlined mb-4 text-[42px] text-text-soft">lock</span>
              <h2 className="font-heading-sm text-heading-sm text-text-primary">Akses ketua diperlukan</h2>
              <p className="mt-2 max-w-md font-body text-body text-text-secondary">
                Anggota tetap dapat melihat kontribusi melalui halaman kontribusi.
              </p>
            </div>
          </SectionCard>
        </GroupShell>
      );
    }

    const report = await getReportPreviewData(params.groupId);

    return (
      <GroupShell group={group}>
        <GroupHero
          eyebrow={group.name}
          title="Laporan Kontribusi"
          description="Preview data laporan sebelum export PDF kontribusi kelompok."
          actions={<ExportReportButton groupId={params.groupId} />}
        />

        <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <MetricCard icon="groups" label="Anggota" tone="blue" value={report.members.length} />
          <MetricCard icon="folder" label="Project" tone="lavender" value={report.projects.length} />
          <MetricCard icon="task_alt" label="Task" tone="green" value={report.tasks.length} />
          <MetricCard icon="upload_file" label="Bukti" tone="yellow" value={report.evidences.length} />
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <SectionCard title="Preview Kontribusi">
            <div className="space-y-3">
              {report.contribution.members.map((member) => (
                <div
                  className="flex items-center justify-between rounded-[20px] bg-surface-container-low px-4 py-3"
                  key={member.userId}
                >
                  <div>
                    <p className="font-button text-button text-text-primary">{member.fullName}</p>
                    <p className="font-body-sm text-body-sm text-text-soft">
                      {member.taskCount} task - skor {member.finalScore}
                    </p>
                  </div>
                  <span className="rounded-full bg-pastel-blue px-3 py-1 font-label text-label text-primary">
                    {member.percentage}%
                  </span>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Isi Laporan">
            <ul className="space-y-3 font-body-sm text-body-sm text-text-secondary">
              <ReportItem label="Data kelompok dan anggota" />
              <ReportItem label="Daftar project dan task" />
              <ReportItem label="Bukti pekerjaan" />
              <ReportItem label="Riwayat reassign" />
              <ReportItem label="Activity log ringkas" />
              <ReportItem label="Skor kontribusi" />
            </ul>
          </SectionCard>
        </div>
      </GroupShell>
    );
  } catch (error) {
    return <ReportFallback message={error instanceof Error ? error.message : "Laporan belum bisa dimuat."} />;
  }
}

function ReportItem({ label }: { label: string }) {
  return (
    <li className="flex items-center gap-3 rounded-2xl bg-surface-container-low px-4 py-3">
      <span className="material-symbols-outlined text-[18px] text-primary">check_circle</span>
      <span>{label}</span>
    </li>
  );
}

function ReportFallback({ message }: { message: string }) {
  return (
    <div className="h-full w-full overflow-y-auto p-6">
      <GroupHero
        title="Laporan Kontribusi"
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
