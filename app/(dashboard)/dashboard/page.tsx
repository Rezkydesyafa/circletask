import { RightPanel } from "@/components/layout/RightPanel";

export default function DashboardPage() {
  return (
    <>
      <div className="flex-1 p-page-padding pr-section-gap flex flex-col space-y-section-gap overflow-y-auto">
        <header>
          <h1 className="font-heading-lg text-heading-lg text-text-primary">Selamat datang kembali</h1>
          <p className="font-body text-body text-text-secondary mt-1">Pilih kelompok yang ingin kamu kerjakan hari ini.</p>
        </header>

        {/* Quick Action Cards */}
        <section className="grid grid-cols-2 gap-card-gap">
          <div className="bg-[#DDF3EA] rounded-[24px] p-6 flex flex-col justify-between shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-white/50 relative overflow-hidden group hover:-translate-y-1 transition-transform">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/30 rounded-bl-[100px] -mr-8 -mt-8"></div>
            <div>
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-secondary">group_add</span>
              </div>
              <h3 className="font-heading-sm text-heading-sm text-text-primary">Buat Kelompok</h3>
              <p className="font-body-sm text-body-sm text-text-secondary mt-1 pr-12">Mulai kelompok baru dan otomatis menjadi ketua.</p>
            </div>
            <button className="mt-6 bg-primary text-on-primary font-button text-button py-2.5 px-5 rounded-full w-fit hover:bg-tertiary-container transition-colors">Buat Sekarang</button>
          </div>

          <div className="bg-pastel-lavender rounded-[24px] p-6 flex flex-col justify-between shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-white/50 relative overflow-hidden group hover:-translate-y-1 transition-transform">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/40 rounded-bl-[100px] -mr-8 -mt-8"></div>
            <div>
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-primary">qr_code</span>
              </div>
              <h3 className="font-heading-sm text-heading-sm text-text-primary">Gabung Kelompok</h3>
              <p className="font-body-sm text-body-sm text-text-secondary mt-1 pr-12">Masukkan kode undangan dari ketua kelompok.</p>
            </div>
            <button className="mt-6 bg-surface-card border border-border-subtle text-primary font-button text-button py-2.5 px-5 rounded-full w-fit hover:bg-surface-container-low transition-colors">Gabung</button>
          </div>
        </section>

        {/* Stats Row */}
        <section className="flex space-x-card-gap">
          <div className="flex-1 bg-surface-card rounded-[18px] p-4 flex flex-col border border-border-subtle shadow-[0_2px_10px_rgba(0,0,0,0.01)]">
            <span className="font-label text-label text-text-secondary">Total Kelompok</span>
            <span className="font-heading-md text-heading-md text-text-primary mt-1">4</span>
          </div>
          <div className="flex-1 bg-surface-card rounded-[18px] p-4 flex flex-col border border-border-subtle shadow-[0_2px_10px_rgba(0,0,0,0.01)]">
            <span className="font-label text-label text-text-secondary">Task Saya</span>
            <span className="font-heading-md text-heading-md text-text-primary mt-1">12</span>
          </div>
          <div className="flex-1 bg-surface-card rounded-[18px] p-4 flex flex-col border border-border-subtle shadow-[0_2px_10px_rgba(0,0,0,0.01)]">
            <span className="font-label text-label text-text-secondary">Deadline Dekat</span>
            <span className="font-heading-md text-heading-md text-error mt-1">3</span>
          </div>
          <div className="flex-1 bg-surface-card rounded-[18px] p-4 flex flex-col border border-border-subtle shadow-[0_2px_10px_rgba(0,0,0,0.01)]">
            <span className="font-label text-label text-text-secondary">Menunggu Review</span>
            <span className="font-heading-md text-heading-md text-text-primary mt-1">2</span>
          </div>
        </section>

        {/* Kelompok Saya Section */}
        <section className="flex-1 flex flex-col pb-8">
          <h2 className="font-heading-sm text-heading-sm text-text-primary mb-4">Kelompok Saya</h2>
          <div className="grid grid-cols-2 gap-card-gap">
            {/* Card 1 */}
            <div className="bg-[#DDF3EA] rounded-[24px] p-5 flex flex-col border border-white/50 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
              <div className="flex justify-between items-start mb-4">
                <h4 className="font-heading-sm text-heading-sm text-text-primary line-clamp-2">Kelompok AI Praktikum</h4>
                <span className="bg-primary text-on-primary font-label text-label px-3 py-1 rounded-full shrink-0">Ketua</span>
              </div>
              <div className="mb-4">
                <div className="flex justify-between font-label text-label text-secondary mb-1">
                  <span>Progress</span>
                  <span>72%</span>
                </div>
                <div className="w-full bg-white/60 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-secondary h-full rounded-full" style={{ width: "72%" }}></div>
                </div>
              </div>
              <div className="flex justify-between items-center mt-auto text-body-sm font-body-sm text-secondary">
                <div className="flex items-center space-x-1"><span className="material-symbols-outlined text-[16px]">task_alt</span><span>18 task</span></div>
                <div className="flex items-center space-x-1"><span className="material-symbols-outlined text-[16px]">timer</span><span>3 hari lagi</span></div>
              </div>
              <button className="mt-4 w-full bg-surface-card border border-white/80 text-primary font-button text-button py-2 rounded-full hover:bg-white transition-colors">Buka Kelompok</button>
            </div>

            {/* Card 2 */}
            <div className="bg-pastel-pink rounded-[24px] p-5 flex flex-col border border-white/50 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
              <div className="flex justify-between items-start mb-4">
                <h4 className="font-heading-sm text-heading-sm text-text-primary line-clamp-2">Kelompok Enterprise Architecture</h4>
                <span className="bg-pastel-lavender text-text-primary border border-white/80 font-label text-label px-3 py-1 rounded-full shrink-0">Anggota</span>
              </div>
              <div className="mb-4">
                <div className="flex justify-between font-label text-label text-primary/70 mb-1">
                  <span>Progress</span>
                  <span>48%</span>
                </div>
                <div className="w-full bg-white/60 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-primary/50 h-full rounded-full" style={{ width: "48%" }}></div>
                </div>
              </div>
              <div className="flex justify-between items-center mt-auto text-body-sm font-body-sm text-primary/70">
                <div className="flex items-center space-x-1"><span className="material-symbols-outlined text-[16px]">task_alt</span><span>Task saya 4</span></div>
                <div className="flex items-center space-x-1"><span className="material-symbols-outlined text-[16px]">event</span><span>Besok</span></div>
              </div>
              <button className="mt-4 w-full bg-surface-card border border-white/80 text-primary font-button text-button py-2 rounded-full hover:bg-white transition-colors">Lihat Task</button>
            </div>

            {/* Card 3 */}
            <div className="bg-pastel-yellow rounded-[24px] p-5 flex flex-col border border-white/50 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
              <div className="flex justify-between items-start mb-4">
                <h4 className="font-heading-sm text-heading-sm text-text-primary line-clamp-2">Kelompok Machine Learning</h4>
                <span className="bg-primary text-on-primary font-label text-label px-3 py-1 rounded-full shrink-0">Ketua</span>
              </div>
              <div className="mb-4">
                <div className="flex justify-between font-label text-label text-primary/70 mb-1">
                  <span>Progress</span>
                  <span>61%</span>
                </div>
                <div className="w-full bg-white/60 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-primary/50 h-full rounded-full" style={{ width: "61%" }}></div>
                </div>
              </div>
              <div className="flex justify-between items-center mt-auto text-body-sm font-body-sm text-primary/70">
                <div className="flex items-center space-x-1"><span className="material-symbols-outlined text-[16px]">task_alt</span><span>14 task</span></div>
                <div className="flex items-center space-x-1"><span className="material-symbols-outlined text-[16px]">timer</span><span>5 hari lagi</span></div>
              </div>
              <button className="mt-4 w-full bg-surface-card border border-white/80 text-primary font-button text-button py-2 rounded-full hover:bg-white transition-colors">Buka Kelompok</button>
            </div>

            {/* Card 4 */}
            <div className="bg-pastel-lavender rounded-[24px] p-5 flex flex-col border border-white/50 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
              <div className="flex justify-between items-start mb-4">
                <h4 className="font-heading-sm text-heading-sm text-text-primary line-clamp-2">Kelompok UI Design</h4>
                <span className="bg-white text-text-primary border border-white font-label text-label px-3 py-1 rounded-full shrink-0">Anggota</span>
              </div>
              <div className="mb-4">
                <div className="flex justify-between font-label text-label text-primary/70 mb-1">
                  <span>Progress</span>
                  <span>35%</span>
                </div>
                <div className="w-full bg-white/60 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-primary/50 h-full rounded-full" style={{ width: "35%" }}></div>
                </div>
              </div>
              <div className="flex justify-between items-center mt-auto text-body-sm font-body-sm text-primary/70">
                <div className="flex items-center space-x-1"><span className="material-symbols-outlined text-[16px]">task_alt</span><span>Task saya 2</span></div>
                <div className="flex items-center space-x-1 text-error"><span className="material-symbols-outlined text-[16px]">error</span><span>Hari ini</span></div>
              </div>
              <button className="mt-4 w-full bg-surface-card border border-white/80 text-primary font-button text-button py-2 rounded-full hover:bg-white transition-colors">Kerjakan</button>
            </div>
          </div>
        </section>
      </div>

      <RightPanel />
    </>
  );
}
