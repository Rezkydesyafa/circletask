import { EmptyState } from "@/components/common/empty-state";
import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";

export default function GroupsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Kelompok"
        description="Daftar kelompok user akan tampil di sini setelah flow create dan join kelompok dibuat."
      />
      <EmptyState
        title="Belum ada kelompok"
        description="Gunakan Sprint 2 untuk menghubungkan halaman ini ke Supabase dan join code."
        action={<Button disabled>Buat kelompok</Button>}
      />
    </div>
  );
}
