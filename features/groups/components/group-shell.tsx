"use client";

import type { ReactNode } from "react";
import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";

import type { GroupListItem } from "@/features/groups/types";
import { cn } from "@/lib/utils";

type GroupShellProps = {
  children: ReactNode;
  group: GroupListItem;
};

type GroupNavItem = {
  href: Route;
  icon: string;
  label: string;
  leaderOnly?: boolean;
};

function getGroupNavItems(groupId: string): GroupNavItem[] {
  return [
    { href: `/groups/${groupId}` as Route, icon: "dashboard", label: "Dashboard" },
    { href: `/groups/${groupId}/members` as Route, icon: "groups", label: "Anggota" },
    { href: `/groups/${groupId}/projects` as Route, icon: "view_kanban", label: "Project" },
    { href: `/groups/${groupId}/review` as Route, icon: "rate_review", label: "Review", leaderOnly: true },
    { href: `/groups/${groupId}/contribution` as Route, icon: "leaderboard", label: "Kontribusi" },
    { href: `/groups/${groupId}/activity` as Route, icon: "history", label: "Aktivitas" },
    { href: `/groups/${groupId}/report` as Route, icon: "bar_chart", label: "Laporan", leaderOnly: true },
  ];
}

export function GroupShell({ children, group }: GroupShellProps) {
  const pathname = usePathname();
  const navItems = getGroupNavItems(group.id).filter(
    (item) => !item.leaderOnly || group.role === "leader"
  );

  return (
    <div className="mx-auto flex h-[calc(100vh-24px)] w-full max-w-[1440px] overflow-hidden rounded-[32px] border border-border-subtle bg-shell-bg shadow-[0_20px_40px_rgba(0,0,0,0.04)] md:h-[calc(100vh-40px)]">
      <aside className="hidden w-sidebar-width shrink-0 flex-col items-center border-r border-border-subtle bg-shell-bg py-shell-padding lg:flex">
        <Link
          aria-label="Kembali ke daftar kelompok"
          className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary font-display text-heading-sm text-on-primary shadow-md"
          href="/groups"
          title="Kelompok"
        >
          {getInitials(group.name)}
        </Link>

        <nav aria-label="Group navigation" className="flex flex-1 flex-col items-center gap-4">
          {navItems.map((item) => {
            const isActive = isActiveGroupRoute(pathname, item.href);

            return (
              <Link
                aria-label={item.label}
                className={cn(
                  "flex h-12 w-12 items-center justify-center rounded-full transition-all duration-200 active:scale-95",
                  isActive
                    ? "bg-primary text-on-primary shadow-md"
                    : "text-text-soft hover:bg-primary hover:text-on-primary"
                )}
                href={item.href}
                key={item.href}
                title={item.label}
              >
                <span
                  className="material-symbols-outlined"
                  style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
                >
                  {item.icon}
                </span>
              </Link>
            );
          })}
        </nav>

        <Link
          aria-label="Profil"
          className="mt-auto flex h-12 w-12 items-center justify-center rounded-full text-text-soft transition-colors hover:bg-primary hover:text-on-primary"
          href="/profile"
          title="Profil"
        >
          <span className="material-symbols-outlined">settings</span>
        </Link>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <GroupTopBar group={group} />
        <main className="min-h-0 flex-1 overflow-y-auto px-5 py-6 pb-28 md:px-page-padding lg:pb-8">
          {children}
        </main>
      </div>

      <nav
        className="fixed bottom-4 left-1/2 z-40 flex w-[min(92vw,520px)] -translate-x-1/2 items-center justify-between rounded-full border border-border-subtle bg-surface-card/95 px-2 py-2 shadow-[0_20px_50px_-18px_rgba(0,0,0,0.35)] backdrop-blur lg:hidden"
        aria-label="Group mobile navigation"
      >
        {navItems.slice(0, 5).map((item) => {
          const isActive = isActiveGroupRoute(pathname, item.href);

          return (
            <Link
              aria-label={item.label}
              className={cn(
                "flex h-11 min-w-11 items-center justify-center rounded-full px-3 transition-colors",
                isActive ? "bg-primary text-on-primary" : "text-text-soft hover:bg-primary hover:text-on-primary"
              )}
              href={item.href}
              key={item.href}
              title={item.label}
            >
              <span
                className="material-symbols-outlined text-[20px]"
                style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
              >
                {item.icon}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

function GroupTopBar({ group }: { group: GroupListItem }) {
  return (
    <header className="flex h-[72px] shrink-0 items-center justify-between border-b border-border-subtle bg-shell-bg px-5 md:px-page-padding">
      <div className="hidden min-w-0 flex-1 md:flex">
        <div className="relative w-full max-w-[360px] rounded-full focus-within:ring-2 focus-within:ring-primary/10">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[20px] text-text-soft">
            search
          </span>
          <input
            className="h-10 w-full rounded-full border border-border-subtle bg-surface-card pl-11 pr-4 font-body-sm text-body-sm text-text-primary placeholder:text-text-soft focus:border-primary focus:outline-none"
            placeholder="Cari project atau task..."
            type="text"
          />
        </div>
      </div>

      <div className="min-w-0 md:hidden">
        <p className="truncate font-button text-button text-text-primary">{group.name}</p>
        <p className="mt-1 font-body-sm text-body-sm text-text-soft">
          {group.role === "leader" ? "Ketua" : "Anggota"}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-3">
        <button
          className="flex h-10 w-10 items-center justify-center rounded-full text-text-secondary transition-colors hover:bg-surface-container-high hover:text-primary"
          type="button"
        >
          <span className="material-symbols-outlined text-[22px]">notifications</span>
        </button>
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-pastel-lavender font-button text-button text-primary">
          FA
        </div>
      </div>
    </header>
  );
}

function isActiveGroupRoute(pathname: string, href: string) {
  if (pathname === href) {
    return true;
  }

  if (href.endsWith("/projects")) {
    return pathname.startsWith(`${href}/`);
  }

  return false;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
