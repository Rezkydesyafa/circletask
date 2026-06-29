import Link from "next/link";
import { Home, Users } from "lucide-react";

export function MobileNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-2 border-t bg-background lg:hidden">
      <Link
        href="/dashboard"
        className="flex h-14 items-center justify-center gap-2 text-sm font-medium text-muted-foreground"
      >
        <Home className="h-4 w-4" />
        Dashboard
      </Link>
      <Link
        href="/groups"
        className="flex h-14 items-center justify-center gap-2 text-sm font-medium text-muted-foreground"
      >
        <Users className="h-4 w-4" />
        Kelompok
      </Link>
    </nav>
  );
}
