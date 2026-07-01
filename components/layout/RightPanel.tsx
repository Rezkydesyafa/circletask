export function RightPanel() {
  return (
    <aside className="w-[320px] bg-surface-card border-l border-border-subtle p-6 flex flex-col shrink-0 overflow-y-auto">
      <h2 className="font-heading-sm text-heading-sm text-text-primary mb-6">Prioritas Hari Ini</h2>
      <ul className="space-y-4">
        {/* List Item 1 */}
        <li className="p-4 rounded-[18px] bg-surface-container-low border border-border-subtle hover:bg-surface-container transition-colors cursor-pointer">
          <div className="flex justify-between items-start mb-2">
            <span className="bg-pastel-blue text-primary font-label text-label px-2 py-0.5 rounded-md">In Progress</span>
            <span className="font-label text-label text-error">Hari ini</span>
          </div>
          <p className="font-body text-body text-text-primary font-semibold leading-tight">Upload bukti desain dashboard</p>
          <p className="font-body-sm text-body-sm text-text-soft mt-1">UI Design</p>
        </li>
        {/* List Item 2 */}
        <li className="p-4 rounded-[18px] bg-surface-container-low border border-border-subtle hover:bg-surface-container transition-colors cursor-pointer">
          <div className="flex justify-between items-start mb-2">
            <span className="bg-pastel-yellow text-primary font-label text-label px-2 py-0.5 rounded-md">Submit Review</span>
            <span className="font-label text-label text-text-secondary">Besok</span>
          </div>
          <p className="font-body text-body text-text-primary font-semibold leading-tight">Review task ERD Database</p>
          <p className="font-body-sm text-body-sm text-text-soft mt-1">AI Praktikum</p>
        </li>
        {/* List Item 3 */}
        <li className="p-4 rounded-[18px] bg-surface-container-low border border-border-subtle hover:bg-surface-container transition-colors cursor-pointer">
          <div className="flex justify-between items-start mb-2">
            <span className="bg-pastel-pink text-primary font-label text-label px-2 py-0.5 rounded-md">Revisi</span>
            <span className="font-label text-label text-text-secondary">2 hari lagi</span>
          </div>
          <p className="font-body text-body text-text-primary font-semibold leading-tight">Revisi diagram use case</p>
          <p className="font-body-sm text-body-sm text-text-soft mt-1">Enterprise Architecture</p>
        </li>
      </ul>
      
      <div className="mt-auto pt-6 border-t border-border-subtle">
        <p className="font-body-sm text-body-sm text-text-soft text-center italic">
          &quot;Satu akun bisa menjadi ketua di satu kelompok dan anggota di kelompok lain.&quot;
        </p>
      </div>
    </aside>
  );
}
