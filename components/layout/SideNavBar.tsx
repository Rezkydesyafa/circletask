import Link from "next/link";

export function SideNavBar() {
  return (
    <nav className="w-[84px] h-full rounded-l-[32px] bg-shell-bg dark:bg-tertiary-container flex flex-col items-center py-shell-padding space-y-6 border-r border-border-subtle shrink-0">
      <div aria-label="CircleTask Workspace Avatar" className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary font-display text-heading-sm text-on-primary shadow-md">CT</div>
      
      <Link href="/dashboard" className="bg-primary dark:bg-primary-fixed text-on-primary dark:text-on-primary-fixed rounded-full w-12 h-12 flex items-center justify-center scale-95 active:scale-90 transition-transform">
        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>dashboard</span>
      </Link>
      
      <Link href="/groups" className="text-on-primary-container dark:text-on-primary-container w-12 h-12 flex items-center justify-center hover:bg-primary hover:text-on-primary rounded-full transition-colors scale-95 active:scale-90 transition-transform">
        <span className="material-symbols-outlined">group</span>
      </Link>
      
      <Link href="#" className="text-on-primary-container dark:text-on-primary-container w-12 h-12 flex items-center justify-center hover:bg-primary hover:text-on-primary rounded-full transition-colors scale-95 active:scale-90 transition-transform">
        <span className="material-symbols-outlined">task_alt</span>
      </Link>
      
      <Link href="#" className="text-on-primary-container dark:text-on-primary-container w-12 h-12 flex items-center justify-center hover:bg-primary hover:text-on-primary rounded-full transition-colors scale-95 active:scale-90 transition-transform">
        <span className="material-symbols-outlined">handshake</span>
      </Link>
      
      <Link href="#" className="text-on-primary-container dark:text-on-primary-container w-12 h-12 flex items-center justify-center hover:bg-primary hover:text-on-primary rounded-full transition-colors scale-95 active:scale-90 transition-transform">
        <span className="material-symbols-outlined">analytics</span>
      </Link>
      
      <Link href="#" className="text-on-primary-container dark:text-on-primary-container w-12 h-12 flex items-center justify-center hover:bg-primary hover:text-on-primary rounded-full transition-colors scale-95 active:scale-90 transition-transform">
        <span className="material-symbols-outlined">bar_chart</span>
      </Link>
      
      <div className="flex-grow"></div>
      
      <Link href="#" className="text-on-primary-container dark:text-on-primary-container w-12 h-12 flex items-center justify-center hover:bg-primary hover:text-on-primary rounded-full transition-colors scale-95 active:scale-90 transition-transform mt-auto">
        <span className="material-symbols-outlined">settings</span>
      </Link>
    </nav>
  );
}
