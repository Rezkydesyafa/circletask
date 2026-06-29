import { FolderKanban, ListChecks, Timer, Users } from "lucide-react";

import { EmptyState } from "@/components/common/empty-state";
import { PageHeader } from "@/components/common/page-header";
import { StatCard } from "@/components/common/stat-card";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Ringkasan kelompok, project, task, review, deadline, dan kontribusi akan tampil di sini setelah fitur MVP mulai diimplementasikan."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Kelompok" value="0" description="Belum ada kelompok" icon={<Users className="h-4 w-4" />} />
        <StatCard title="Project" value="0" description="Belum ada project" icon={<FolderKanban className="h-4 w-4" />} />
        <StatCard title="Task" value="0" description="Belum ada task" icon={<ListChecks className="h-4 w-4" />} />
        <StatCard title="Review" value="0" description="Belum ada review" icon={<Timer className="h-4 w-4" />} />
      </div>

      <EmptyState
        title="Setup dashboard siap"
        description="Sprint berikutnya dapat mulai menambahkan flow buat kelompok, join kelompok, project, task, bukti kerja, review, dan kontribusi."
        action={<Button disabled>Buat kelompok</Button>}
      />
    </div>
  );
}
