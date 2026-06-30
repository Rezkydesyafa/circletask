import type { ReactNode } from "react";
import { SideNavBar } from "@/components/layout/SideNavBar";
import { TopNavBar } from "@/components/layout/TopNavBar";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="bg-shell-bg dark:bg-tertiary-container rounded-[32px] w-full h-[calc(100vh-64px)] flex overflow-hidden shadow-sm shadow-[rgba(0,0,0,0.05)] border border-border-subtle">
      <SideNavBar />
      <div className="flex flex-col flex-1 bg-surface-main rounded-tr-[32px] rounded-br-[32px] overflow-hidden">
        <TopNavBar />
        <main className="flex-1 overflow-y-auto flex">
          {children}
        </main>
      </div>
    </div>
  );
}
