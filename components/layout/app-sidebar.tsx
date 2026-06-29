import Link from "next/link";
import type { Route } from "next";
import { Activity, BarChart3, FileText, FolderKanban, Home, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

const navItems: { href: Route; label: string; icon: LucideIcon }[] = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/groups", label: "Kelompok", icon: Users },
  { href: "/groups", label: "Project", icon: FolderKanban },
  { href: "/groups", label: "Kontribusi", icon: BarChart3 },
  { href: "/groups", label: "Activity", icon: Activity },
  { href: "/groups", label: "Laporan", icon: FileText },
];

export function AppSidebar({ className }: { className?: string }) {
  return (
    <aside className={cn("hidden w-64 shrink-0 border-r bg-card lg:block", className)}>
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/dashboard" className="text-lg font-semibold">
          CircleTask
        </Link>
      </div>
      <nav className="space-y-1 p-3">
        {navItems.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={`${item.href}-${item.label}`}
              href={item.href}
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
