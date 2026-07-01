import type { Route } from "next";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { GroupHero, SectionCard } from "@/features/groups/components/group-ui";
import { GroupShell } from "@/features/groups/components/group-shell";
import { getGroupById } from "@/features/groups/queries";
import { CreateProjectForm } from "@/features/projects/components/create-project-form";
import { hasSupabaseEnv } from "@/lib/env";

export const dynamic = "force-dynamic";

type NewProjectPageProps = {
  params: {
    groupId: string;
  };
};

export default async function NewProjectPage({ params }: NewProjectPageProps) {
  if (!hasSupabaseEnv()) {
    return <NewProjectFallback message="Supabase belum dikonfigurasi." />;
  }

  try {
    const group = await getGroupById(params.groupId);

    return (
      <GroupShell group={group}>
        <GroupHero
          eyebrow={group.name}
          title="Buat Project Baru"
          description="Buat project besar, lalu pecah menjadi beberapa task berbasis bukti kerja."
          actions={
            <Button asChild className="rounded-full" variant="outline">
              <Link href={`/groups/${params.groupId}/projects` as Route}>Kembali</Link>
            </Button>
          }
        />

        {group.role === "leader" ? (
          <CreateProjectForm groupId={params.groupId} />
        ) : (
          <SectionCard>
            <div className="flex min-h-[300px] flex-col items-center justify-center text-center">
              <span className="material-symbols-outlined mb-4 text-[42px] text-text-soft">lock</span>
              <h2 className="font-heading-sm text-heading-sm text-text-primary">Akses ketua diperlukan</h2>
              <p className="mt-2 max-w-md font-body text-body text-text-secondary">
                Hanya ketua kelompok yang bisa membuat project baru sesuai aturan MVP.
              </p>
            </div>
          </SectionCard>
        )}
      </GroupShell>
    );
  } catch (error) {
    return (
      <NewProjectFallback
        message={error instanceof Error ? error.message : "Halaman buat project belum bisa dimuat."}
      />
    );
  }
}

function NewProjectFallback({ message }: { message: string }) {
  return (
    <div className="h-full w-full overflow-y-auto p-6">
      <GroupHero
        title="Buat Project Baru"
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
