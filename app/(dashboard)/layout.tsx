import type { ReactNode } from "react";

import { AppSidebar } from "@/components/layout/app-sidebar";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { MobileNav } from "@/components/layout/mobile-nav";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardHeader />
        <main className="flex-1 px-4 py-6 pb-20 lg:px-6 lg:pb-6">{children}</main>
      </div>
      <MobileNav />
    </div>
  );
}
