import type { Route } from "next";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { EmptyPanel, FilterPill, GroupHero } from "@/features/groups/components/group-ui";
import { GroupShell } from "@/features/groups/components/group-shell";
import { getGroupById } from "@/features/groups/queries";
import { ProjectCard } from "@/features/projects/components/project-card";
import { getGroupProjects } from "@/features/projects/queries";
import { hasSupabaseEnv } from "@/lib/env";

export const dynamic = "force-dynamic";

type GroupProjectsPageProps = {
  params: {
    groupId: string;
  };
};

export default async function GroupProjectsPage({ params }: GroupProjectsPageProps) {
  if (!hasSupabaseEnv()) {
    return <ProjectsFallback message="Supabase belum dikonfigurasi." />;
  }

  try {
    const [group, projects] = await Promise.all([
      getGroupById(params.groupId),
      getGroupProjects(params.groupId),
    ]);

    return (
      <GroupShell group={group}>
        <GroupHero
          title="Project Kelompok"
          description="Kelola project besar dan pantau progress task di dalamnya."
          actions={
            group.role === "leader" ? (
              <Button asChild className="rounded-full bg-primary px-6 text-on-primary">
                <Link className="inline-flex items-center gap-2" href={`/groups/${params.groupId}/projects/new` as Route}>
                  <span className="material-symbols-outlined text-[18px]">add</span>
                  Buat Project
                </Link>
              </Button>
            ) : null
          }
        />

        <div className="mb-8 flex flex-wrap gap-3">
          <FilterPill active label="Semua" />
          <FilterPill label="Aktif" />
          <FilterPill label="Selesai" />
          <FilterPill label="Overdue" />
        </div>

        {projects.length > 0 ? (
          <section className="grid grid-cols-1 gap-5 lg:grid-cols-2 2xl:grid-cols-3">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </section>
        ) : (
          <EmptyPanel
            action={
              group.role === "leader" ? (
              <Button asChild className="mt-6 rounded-full bg-primary text-on-primary">
                <Link href={`/groups/${params.groupId}/projects/new` as Route}>Buat Project</Link>
              </Button>
              ) : null
            }
            description="Ketua bisa membuat project pertama, lalu memecahnya menjadi task untuk anggota."
            icon="view_kanban"
            title="Belum ada project"
          />
        )}
      </GroupShell>
    );
  } catch (error) {
    return (
      <ProjectsFallback
        message={error instanceof Error ? error.message : "Daftar project belum bisa dimuat."}
      />
    );
  }
}

function ProjectsFallback({ message }: { message: string }) {
  return (
    <div className="h-full w-full overflow-y-auto p-6">
      <GroupHero
        title="Project Kelompok"
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
