import { ActionCard } from "@/components/dashboard/ActionCard";
import { GroupCard } from "@/components/dashboard/GroupCard";
import { PriorityPanel } from "@/components/dashboard/PriorityPanel";
import type { PriorityItemData } from "@/components/dashboard/PriorityItem";
import { StatCard } from "@/components/dashboard/StatCard";

const actionCards = [
  {
    title: "Buat Kelompok",
    description: "Mulai kelompok baru dan otomatis menjadi ketua.",
    icon: "group_add",
    buttonLabel: "Buat Sekarang",
    toneClassName: "bg-[#DDF3EA]",
    buttonVariant: "primary" as const,
    href: "/groups/create" as const,
  },
  {
    title: "Gabung Kelompok",
    description: "Masukkan kode undangan dari ketua kelompok.",
    icon: "qr_code",
    buttonLabel: "Gabung",
    toneClassName: "bg-pastel-lavender",
    buttonVariant: "secondary" as const,
    href: "/groups/join" as const,
  },
];

const stats = [
  { label: "Total Kelompok", value: "4" },
  { label: "Task Saya", value: "12" },
  { label: "Deadline Dekat", value: "3", tone: "danger" as const },
  { label: "Menunggu Review", value: "2" },
];

const groups = [
  {
    title: "Kelompok AI Praktikum",
    role: "Ketua" as const,
    progress: 72,
    taskLabel: "18 task",
    deadlineLabel: "3 hari lagi",
    actionLabel: "Buka Kelompok",
    toneClassName: "bg-[#DDF3EA]",
    progressClassName: "bg-secondary",
    metricClassName: "text-secondary",
    roleVariant: "dark" as const,
  },
  {
    title: "Kelompok Enterprise Architecture",
    role: "Anggota" as const,
    progress: 48,
    taskLabel: "Task saya 4",
    deadlineLabel: "Besok",
    actionLabel: "Lihat Task",
    toneClassName: "bg-pastel-pink",
    progressClassName: "bg-primary/50",
    metricClassName: "text-primary/70",
    roleVariant: "lavender" as const,
  },
  {
    title: "Kelompok Machine Learning",
    role: "Ketua" as const,
    progress: 61,
    taskLabel: "14 task",
    deadlineLabel: "5 hari lagi",
    actionLabel: "Buka Kelompok",
    toneClassName: "bg-pastel-yellow",
    progressClassName: "bg-primary/50",
    metricClassName: "text-primary/70",
    roleVariant: "dark" as const,
  },
  {
    title: "Kelompok UI Design",
    role: "Anggota" as const,
    progress: 35,
    taskLabel: "Task saya 2",
    deadlineLabel: "Hari ini",
    deadlineTone: "danger" as const,
    actionLabel: "Kerjakan",
    toneClassName: "bg-pastel-lavender",
    progressClassName: "bg-primary/50",
    metricClassName: "text-primary/70",
    roleVariant: "white" as const,
  },
];

const priorityItems: PriorityItemData[] = [
  {
    status: "In Progress",
    statusClassName: "bg-pastel-blue",
    dueLabel: "Hari ini",
    dueTone: "danger",
    title: "Upload bukti desain dashboard",
    groupName: "UI Design",
  },
  {
    status: "Submit Review",
    statusClassName: "bg-pastel-yellow",
    dueLabel: "Besok",
    title: "Review task ERD Database",
    groupName: "AI Praktikum",
  },
  {
    status: "Revisi",
    statusClassName: "bg-pastel-pink",
    dueLabel: "2 hari lagi",
    title: "Revisi diagram use case",
    groupName: "Enterprise Architecture",
  },
];

export default function DashboardPage() {
  return (
    <div className="flex min-h-0 w-full flex-1 bg-surface-main">
      <section className="flex min-w-0 flex-1 flex-col gap-section-gap overflow-y-auto p-4 md:p-page-padding md:pr-section-gap">
        <header>
          <h1 className="font-heading-lg text-heading-lg text-text-primary">
            Selamat datang kembali
          </h1>
          <p className="mt-1 font-body text-body text-text-secondary">
            Pilih kelompok yang ingin kamu kerjakan hari ini.
          </p>
        </header>

        <section className="grid grid-cols-1 gap-card-gap md:grid-cols-2">
          {actionCards.map((card) => (
            <ActionCard {...card} key={card.title} />
          ))}
        </section>

        <section className="grid grid-cols-2 gap-card-gap xl:flex">
          {stats.map((stat) => (
            <StatCard {...stat} key={stat.label} />
          ))}
        </section>

        <section className="flex flex-1 flex-col pb-8">
          <h2 className="mb-4 font-heading-sm text-heading-sm text-text-primary">Kelompok Saya</h2>
          <div className="grid grid-cols-1 gap-card-gap lg:grid-cols-2">
            {groups.map((group) => (
              <GroupCard {...group} key={group.title} />
            ))}
          </div>
        </section>
      </section>

      <PriorityPanel items={priorityItems} />
    </div>
  );
}
