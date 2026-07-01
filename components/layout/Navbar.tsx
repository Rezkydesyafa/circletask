import Link from "next/link";

export function Navbar() {
  return (
    <header className="flex h-16 w-full shrink-0 items-center justify-between border-b border-border-subtle bg-shell-bg px-4 md:px-page-padding">
      <div className="flex min-w-0 flex-1 items-center">
        <div className="relative w-full max-w-md rounded-[18px] focus-within:ring-2 focus-within:ring-primary">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-primary-container">
            search
          </span>
          <input
            className="w-full rounded-[18px] border border-border-subtle bg-surface-card py-2 pl-10 pr-4 font-body text-body text-text-primary placeholder:text-text-soft focus:border-border-subtle focus:outline-none focus:ring-0"
            placeholder="Cari kelompok atau task..."
            type="text"
          />
        </div>
      </div>

      <div className="ml-4 flex items-center gap-3 md:gap-6">
        <button className="text-primary transition-opacity hover:opacity-80" type="button">
          <span className="material-symbols-outlined">notifications</span>
        </button>
        <Link
          className="flex items-center gap-3 transition-opacity hover:opacity-80"
          href="/profile"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-pastel-lavender font-button text-button text-primary">
            FA
          </div>
          <span className="hidden font-button text-button text-primary sm:inline">Fajar Atmin</span>
        </Link>
      </div>
    </header>
  );
}
