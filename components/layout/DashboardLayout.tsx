"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";

export function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isGroupWorkspace = /^\/groups\/(?!create$|join$)[^/]+/.test(pathname);

  if (isGroupWorkspace) {
    return (
      <div className="min-h-screen w-screen overflow-hidden bg-page-bg p-3 text-text-primary md:p-5">
        {children}
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-screen overflow-hidden bg-surface-main text-text-primary">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Navbar />
        <main className="flex min-h-0 flex-1 overflow-hidden">{children}</main>
      </div>
    </div>
  );
}
