"use client";

import Link from "next/link";
import type { Route } from "next";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

type SidebarItem = {
  href: Route;
  icon: string;
  label: string;
};

const sidebarItems: SidebarItem[] = [
  { href: "/dashboard", icon: "dashboard", label: "Dashboard" },
  { href: "/groups", icon: "group", label: "Groups" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-[72px] shrink-0 flex-col items-center border-r border-border-subtle bg-shell-bg py-shell-padding md:w-sidebar-width">
      <Link
        aria-label="CircleTask Dashboard"
        className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary font-display text-heading-sm text-on-primary shadow-md"
        href="/dashboard"
      >
        CT
      </Link>

      <nav aria-label="Dashboard navigation" className="flex flex-1 flex-col items-center gap-4">
        {sidebarItems.map((item) => {
          const isActive =
            item.href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(item.href);

          return (
            <Link
              aria-label={item.label}
              className={cn(
                "flex h-12 w-12 items-center justify-center rounded-full transition-colors active:scale-95",
                isActive
                  ? "bg-primary text-on-primary"
                  : "text-on-primary-container hover:bg-primary hover:text-on-primary"
              )}
              href={item.href}
              key={item.label}
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
        aria-label="Settings"
        className="mt-auto flex h-12 w-12 items-center justify-center rounded-full text-on-primary-container transition-colors hover:bg-primary hover:text-on-primary active:scale-95"
        href="/profile"
        title="Settings"
      >
        <span className="material-symbols-outlined">settings</span>
      </Link>
    </aside>
  );
}
