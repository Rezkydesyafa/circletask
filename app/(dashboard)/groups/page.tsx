import type { Route } from "next";
import type { ReactNode } from "react";
import Link from "next/link";

import { EmptyState } from "@/components/common/empty-state";
import { Button } from "@/components/ui/button";
import { getUserGroups } from "@/features/groups/queries";
import type { GroupListItem } from "@/features/groups/types";
import { hasSupabaseEnv } from "@/lib/env";

export const dynamic = "force-dynamic";

function getRoleLabel(role: GroupListItem["role"]) {
  return role === "leader" ? "Ketua" : "Anggota";
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
  }).format(new Date(value));
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default async function GroupsPage() {
  if (!hasSupabaseEnv()) {
    return (
      <div className="h-full w-full overflow-y-auto p-6 md:p-page-padding">
        <GroupsHero
          title="Kelompok"
          description="Hubungkan Supabase untuk melihat, membuat, dan join kelompok."
          actions={
            <Button asChild className="rounded-full">
              <Link href="/dashboard">Kembali ke Dashboard</Link>
            </Button>
          }
        />
        <div className="rounded-[28px] border border-border-subtle bg-surface-card p-6">
          <h2 className="font-heading-sm text-heading-sm text-text-primary">Supabase belum dikonfigurasi</h2>
          <p className="mt-2 font-body text-body text-text-secondary">
            Isi `NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_ANON_KEY` di `.env.local`.
          </p>
        </div>
      </div>
    );
  }

  let groups: GroupListItem[] = [];
  let errorMessage: string | null = null;

  try {
    groups = await getUserGroups();
  } catch (error) {
    errorMessage = error instanceof Error ? error.message : "Gagal memuat daftar kelompok.";
  }

  return (
    <div className="h-full w-full overflow-y-auto p-6 md:p-page-padding">
      <GroupsHero
        title="Kelompok"
        description="Pilih workspace kelompok untuk masuk ke dashboard, project, anggota, dan laporan."
        actions={
          <>
            <Button asChild className="rounded-full" variant="outline">
              <Link href="/groups/join">Gabung</Link>
            </Button>
            <Button asChild className="rounded-full bg-primary text-on-primary">
              <Link href="/groups/create">Buat Kelompok</Link>
            </Button>
          </>
        }
      />

      {errorMessage ? (
        <div className="rounded-[28px] border border-border-subtle bg-surface-card p-6">
          <h2 className="font-heading-sm text-heading-sm text-text-primary">Daftar kelompok belum bisa dimuat</h2>
          <p className="mt-2 font-body text-body text-text-secondary">{errorMessage}</p>
        </div>
      ) : groups.length === 0 ? (
        <div className="rounded-[28px] border border-border-subtle bg-surface-card p-6">
          <EmptyState
            title="Belum ada kelompok"
            description="Buat kelompok baru sebagai ketua atau gabung memakai kode dari ketua kelompok."
            action={
              <div className="flex flex-wrap justify-center gap-2">
                <Button asChild className="rounded-full bg-primary text-on-primary">
                  <Link href="/groups/create">Buat Kelompok</Link>
                </Button>
                <Button asChild className="rounded-full" variant="outline">
                  <Link href="/groups/join">Gabung Kelompok</Link>
                </Button>
              </div>
            }
          />
        </div>
      ) : (
        <>
          <div className="mb-5 grid grid-cols-1 gap-4 md:grid-cols-3">
            <SummaryCard icon="groups" label="Workspace" value={groups.length} />
            <SummaryCard
              icon="admin_panel_settings"
              label="Sebagai Ketua"
              value={groups.filter((group) => group.role === "leader").length}
            />
            <SummaryCard
              icon="person"
              label="Sebagai Anggota"
              value={groups.filter((group) => group.role === "member").length}
            />
          </div>

          <section className="grid grid-cols-1 gap-5 lg:grid-cols-2 2xl:grid-cols-3">
            {groups.map((group) => (
              <GroupWorkspaceCard group={group} key={group.id} />
            ))}
          </section>
        </>
      )}
    </div>
  );
}

function GroupsHero({
  actions,
  description,
  title,
}: {
  actions?: ReactNode;
  description: string;
  title: string;
}) {
  return (
    <header className="mb-6 flex flex-col gap-4 rounded-[28px] border border-border-subtle bg-surface-card p-6 shadow-[0_18px_45px_-28px_rgba(0,0,0,0.35)] md:flex-row md:items-center md:justify-between">
      <div>
        <p className="mb-2 font-label text-label uppercase tracking-wider text-text-soft">CircleTask Workspace</p>
        <h1 className="font-heading-lg text-heading-lg text-text-primary">{title}</h1>
        <p className="mt-2 max-w-2xl font-body text-body text-text-secondary">{description}</p>
      </div>
      {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
    </header>
  );
}

function SummaryCard({ icon, label, value }: { icon: string; label: string; value: number }) {
  return (
    <div className="rounded-[24px] border border-border-subtle bg-surface-card p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <p className="font-label text-label uppercase tracking-wider text-text-soft">{label}</p>
        <span className="material-symbols-outlined flex h-10 w-10 items-center justify-center rounded-full bg-pastel-blue text-[20px] text-primary">
          {icon}
        </span>
      </div>
      <p className="font-display text-[34px] font-bold leading-none text-text-primary">{value}</p>
    </div>
  );
}

function GroupWorkspaceCard({ group }: { group: GroupListItem }) {
  const isLeader = group.role === "leader";

  return (
    <article className="flex min-h-[290px] flex-col rounded-[28px] border border-border-subtle bg-pastel-blue p-5 shadow-sm transition-transform hover:-translate-y-1">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div className="flex min-w-0 gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary font-heading-sm text-sm text-on-primary">
            {getInitials(group.name)}
          </div>
          <div className="min-w-0">
            <h2 className="line-clamp-2 font-heading-md text-heading-sm text-primary">{group.name}</h2>
            <p className="mt-2 line-clamp-2 font-body-sm text-body-sm text-text-secondary">
              {group.description ?? "Belum ada deskripsi kelompok."}
            </p>
          </div>
        </div>
        <span className="shrink-0 rounded-full bg-white px-3 py-1 font-label text-label text-primary">
          {getRoleLabel(group.role)}
        </span>
      </div>

      <div className="mt-auto rounded-[22px] bg-white/85 p-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-surface-container-low p-3">
            <p className="font-label text-label text-text-soft">Bergabung</p>
            <p className="mt-1 font-body-sm text-body-sm font-semibold text-text-primary">
              {formatDate(group.joinedAt || group.createdAt)}
            </p>
          </div>
          <div className="rounded-2xl bg-surface-container-low p-3">
            <p className="font-label text-label text-text-soft">Kode Join</p>
            <p className="mt-1 font-mono text-sm font-bold text-text-primary">
              {isLeader ? group.joinCode : "Ketua saja"}
            </p>
          </div>
        </div>
      </div>

      <Link
        className="mt-4 inline-flex h-12 items-center justify-center rounded-full bg-primary font-button text-button text-on-primary shadow-md transition-colors hover:bg-inverse-surface"
        href={`/groups/${group.id}` as Route}
      >
        Buka Dashboard Kelompok
      </Link>
    </article>
  );
}
