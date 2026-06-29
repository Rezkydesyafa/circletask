import Link from "next/link";

import { Button } from "@/components/ui/button";

export function DashboardHeader() {
  return (
    <header className="flex h-16 items-center justify-between border-b bg-background px-4 lg:px-6">
      <div className="lg:hidden">
        <Link href="/dashboard" className="text-base font-semibold">
          CircleTask
        </Link>
      </div>
      <div className="hidden text-sm text-muted-foreground lg:block">
        Task management kelompok berbasis bukti kerja
      </div>
      <Button asChild variant="outline" size="sm">
        <Link href="/profile">Profil</Link>
      </Button>
    </header>
  );
}
