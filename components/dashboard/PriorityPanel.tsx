import { PriorityItem, type PriorityItemData } from "@/components/dashboard/PriorityItem";

type PriorityPanelProps = {
  items: PriorityItemData[];
};

export function PriorityPanel({ items }: PriorityPanelProps) {
  return (
    <aside className="hidden h-full w-[320px] shrink-0 flex-col overflow-y-auto border-l border-border-subtle bg-surface-card p-6 xl:flex">
      <h2 className="mb-6 font-heading-sm text-heading-sm text-text-primary">Prioritas Hari Ini</h2>
      <ul className="space-y-4">
        {items.map((item) => (
          <PriorityItem item={item} key={`${item.groupName}-${item.title}`} />
        ))}
      </ul>

      <div className="mt-auto border-t border-border-subtle pt-6">
        <p className="text-center font-body-sm text-body-sm italic text-text-soft">
          &quot;Satu akun bisa menjadi ketua di satu kelompok dan anggota di kelompok lain.&quot;
        </p>
      </div>
    </aside>
  );
}
