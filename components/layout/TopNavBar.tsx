export function TopNavBar() {
  return (
    <header className="w-full h-16 rounded-tr-[32px] bg-shell-bg dark:bg-tertiary-container flex justify-between items-center px-page-padding border-b border-border-subtle shrink-0">
      <div className="flex items-center w-1/2">
        <div className="relative w-full max-w-md focus-within:ring-2 focus-within:ring-primary rounded-[18px]">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-primary-container">search</span>
          <input 
            className="w-full bg-surface-card border border-border-subtle rounded-[18px] py-2 pl-10 pr-4 font-body text-body text-text-primary placeholder:text-text-soft focus:outline-none focus:ring-0 focus:border-border-subtle" 
            placeholder="Cari kelompok atau task..." 
            type="text" 
          />
        </div>
      </div>
      <div className="flex items-center space-x-6">
        <button className="text-primary dark:text-primary-fixed hover:opacity-80 transition-opacity">
          <span className="material-symbols-outlined">notifications</span>
        </button>
        <div className="flex items-center space-x-3 cursor-pointer hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 rounded-full bg-pastel-lavender flex items-center justify-center font-button text-button text-primary">FA</div>
          <span className="font-button text-button text-primary">Fajar Atmin</span>
        </div>
      </div>
    </header>
  );
}
