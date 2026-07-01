"use client";

import type { Route } from "next";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState, useTransition } from "react";

import { createGroupAction } from "@/features/groups/actions";
import { createGroupSchema, type CreateGroupInput } from "@/features/groups/schemas";
import { cn } from "@/lib/utils";

type CreatedGroup = {
  id: string;
  joinCode?: string;
};

const colorOptions = [
  { value: "mint", className: "bg-mint-strong" },
  { value: "pink", className: "bg-pastel-pink" },
  { value: "lavender", className: "bg-pastel-lavender" },
  { value: "yellow", className: "bg-pastel-yellow" },
  { value: "blue", className: "bg-pastel-blue" },
] as const;

type ColorValue = (typeof colorOptions)[number]["value"];

const colorMap: Record<ColorValue, string> = {
  mint: "bg-mint-strong",
  pink: "bg-pastel-pink",
  lavender: "bg-pastel-lavender",
  yellow: "bg-pastel-yellow",
  blue: "bg-pastel-blue",
};

export default function CreateGroupPage() {
  const router = useRouter();
  const [courseName, setCourseName] = useState("");
  const [deadline, setDeadline] = useState("");
  const [colorTheme, setColorTheme] = useState<ColorValue>("mint");
  const [createdGroup, setCreatedGroup] = useState<CreatedGroup | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const form = useForm<CreateGroupInput>({
    resolver: zodResolver(createGroupSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const groupName = form.watch("name") ?? "";
  const joinCode = createdGroup?.joinCode ?? "CT-AI24";
  const previewTitle = groupName.trim() || "Kelompok AI Praktikum";
  const previewCourse = courseName.trim() || "Artificial Intelligence";

  const formattedDate = deadline
    ? new Date(deadline).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "TBD";

  const onSubmit = form.handleSubmit((values) => {
    form.clearErrors("root");

    startTransition(async () => {
      const result = await createGroupAction(values);

      if (!result.ok) {
        form.setError("root", { message: result.message });

        for (const [field, messages] of Object.entries(result.fieldErrors ?? {})) {
          if (messages?.[0] && (field === "name" || field === "description")) {
            form.setError(field, { message: messages[0] });
          }
        }

        return;
      }

      if (result.data) {
        setCreatedGroup(result.data);
        setIsModalOpen(true);
      }
    });
  });

  const copyJoinCode = () => {
    if (createdGroup?.joinCode && navigator.clipboard) {
      void navigator.clipboard.writeText(createdGroup.joinCode);
    }
  };

  const openCreatedGroup = () => {
    if (createdGroup?.id) {
      router.push(`/groups/${createdGroup.id}` as Route);
      router.refresh();
      return;
    }

    router.push("/dashboard");
  };

  return (
    <>
      <div className="h-full w-full overflow-y-auto bg-surface-main p-6 md:p-page-padding">
        <div className="mx-auto flex w-full max-w-[1200px] flex-col">
          <header className="mb-8">
            <h1 className="font-heading-lg text-heading-lg text-text-primary">Buat Kelompok Baru</h1>
            <p className="mt-2 max-w-2xl font-body text-body text-text-secondary">
              Buat ruang kerja kelompok, undang anggota, lalu mulai bagi task.
            </p>
          </header>

          <div className="grid grid-cols-1 gap-section-gap lg:grid-cols-12">
            <form className="flex flex-col gap-6 lg:col-span-8" onSubmit={onSubmit}>
              <section className="flex flex-col gap-6 rounded-[24px] border border-border-subtle bg-surface-card p-6 shadow-sm md:p-8">
                <div className="flex flex-col gap-2">
                  <label className="font-label text-label text-text-primary" htmlFor="group-name">
                    Nama Kelompok
                  </label>
                  <input
                    id="group-name"
                    type="text"
                    placeholder="Contoh: Kelompok AI Praktikum"
                    className="h-12 w-full rounded-[18px] border border-border-subtle bg-surface-main px-4 font-body text-body text-text-primary shadow-inner-soft transition-all placeholder:text-text-soft focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary"
                    {...form.register("name")}
                  />
                  {form.formState.errors.name ? (
                    <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
                  ) : null}
                </div>

                <div className="flex flex-col gap-2">
                  <label className="font-label text-label text-text-primary" htmlFor="group-desc">
                    Deskripsi
                  </label>
                  <textarea
                    id="group-desc"
                    rows={3}
                    placeholder="Tuliskan tujuan..."
                    className="min-h-[104px] w-full resize-none rounded-[18px] border border-border-subtle bg-surface-main p-4 font-body text-body text-text-primary shadow-inner-soft transition-all placeholder:text-text-soft focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary"
                    {...form.register("description")}
                  />
                  {form.formState.errors.description ? (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.description.message}
                    </p>
                  ) : null}
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="flex flex-col gap-2">
                    <label className="font-label text-label text-text-primary" htmlFor="course-name">
                      Mata Kuliah
                    </label>
                    <input
                      id="course-name"
                      type="text"
                      placeholder="Contoh: Artificial Intelligence"
                      value={courseName}
                      onChange={(event) => setCourseName(event.target.value)}
                      className="h-12 w-full rounded-[18px] border border-border-subtle bg-surface-main px-4 font-body text-body text-text-primary shadow-inner-soft transition-all placeholder:text-text-soft focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="font-label text-label text-text-primary" htmlFor="deadline-date">
                      Deadline Umum
                    </label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                        <span className="material-symbols-outlined text-[20px] text-text-soft">
                          calendar_today
                        </span>
                      </div>
                      <input
                        id="deadline-date"
                        type="date"
                        value={deadline}
                        onChange={(event) => setDeadline(event.target.value)}
                        className="h-12 w-full appearance-none rounded-[18px] border border-border-subtle bg-surface-main pl-11 pr-4 font-body text-body text-text-primary shadow-inner-soft transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-2 flex flex-col gap-3">
                  <label className="font-label text-label text-text-primary">Warna Kelompok</label>
                  <div className="flex gap-4">
                    {colorOptions.map((color) => (
                      <label key={color.value} className="relative cursor-pointer">
                        <input
                          type="radio"
                          name="color-theme"
                          value={color.value}
                          checked={colorTheme === color.value}
                          onChange={() => setColorTheme(color.value)}
                          className="sr-only"
                        />
                        <span
                          className={cn(
                            "block h-10 w-10 rounded-full border-2 transition-all",
                            color.className,
                            colorTheme === color.value
                              ? "border-primary ring-2 ring-primary ring-offset-2 ring-offset-surface-card"
                              : "border-transparent hover:scale-105"
                          )}
                        />
                      </label>
                    ))}
                  </div>
                </div>
              </section>

              {form.formState.errors.root ? (
                <div className="rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  {form.formState.errors.root.message}
                </div>
              ) : null}

              <section className="grid grid-cols-1 gap-6 md:grid-cols-[1fr_192px] md:items-center">
                <div className="flex items-start gap-4 rounded-[20px] border border-border-subtle bg-surface-container-low p-5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary">
                    <span className="material-symbols-outlined text-[20px] text-on-primary">
                      shield_person
                    </span>
                  </div>
                  <div>
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-tertiary px-2 py-1 font-label text-[10px] uppercase tracking-wider text-on-tertiary">
                        Ketua
                      </span>
                      <h3 className="font-heading-sm text-body text-text-primary">
                        Kamu akan menjadi Ketua Kelompok
                      </h3>
                    </div>
                    <p className="mt-1 font-body-sm text-body-sm text-text-secondary">
                      Sebagai ketua, kamu bisa membuat project, membagi task, review bukti
                      pekerjaan, reassign task, melihat kontribusi, dan export laporan.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <button
                    type="submit"
                    disabled={isPending}
                    className="flex h-12 w-full items-center justify-center rounded-full bg-primary font-button text-button text-on-primary shadow-md transition-all hover:bg-inverse-surface active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isPending ? "Menyimpan..." : "Buat Kelompok"}
                  </button>
                  <button
                    type="button"
                    onClick={() => router.push("/dashboard")}
                    className="h-12 w-full rounded-full border border-border-subtle bg-surface-card font-button text-button text-text-primary transition-all hover:bg-surface-container-low active:scale-95"
                  >
                    Batal
                  </button>
                </div>
              </section>
            </form>

            <aside className="flex flex-col gap-6 lg:col-span-4">
              <section className="flex flex-col gap-5 rounded-[24px] border border-border-subtle bg-surface-card p-6 shadow-sm">
                <h2 className="mb-2 flex items-center gap-2 font-label text-label uppercase tracking-wider text-text-secondary">
                  <span className="material-symbols-outlined text-[16px]">visibility</span>
                  Preview Tampilan
                </h2>

                <div
                  className={cn(
                    "relative overflow-hidden rounded-[20px] p-5 shadow-sm transition-colors duration-300",
                    colorMap[colorTheme]
                  )}
                >
                  <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/20 blur-xl" />
                  <div className="relative z-10 mb-6 flex items-start justify-between gap-3">
                    <div className="max-w-[150px] truncate rounded-full border border-primary/20 bg-primary/10 px-3 py-1 font-label text-[10px] font-bold uppercase tracking-wider text-primary backdrop-blur-sm">
                      {previewCourse}
                    </div>
                    <span className="shrink-0 rounded-full bg-tertiary px-2 py-1 font-label text-[10px] text-on-tertiary shadow-sm">
                      Ketua
                    </span>
                  </div>

                  <h3 className="relative z-10 mb-1 line-clamp-2 font-heading-md text-heading-md leading-tight text-primary">
                    {previewTitle}
                  </h3>

                  <p className="relative z-10 mb-6 flex items-center gap-1 font-body-sm text-body-sm text-secondary/80">
                    <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                    <span>{formattedDate}</span>
                  </p>

                  <div className="relative z-10 grid grid-cols-[1fr_auto_1fr_auto_1fr] items-center rounded-xl border border-white/50 bg-white/40 p-3 backdrop-blur-md">
                    <div className="flex flex-col">
                      <span className="mb-1 font-label text-[10px] uppercase tracking-wider text-secondary">
                        Anggota
                      </span>
                      <span className="font-heading-sm text-primary">1</span>
                    </div>
                    <div className="h-8 w-px bg-primary/20" />
                    <div className="flex flex-col text-center">
                      <span className="mb-1 font-label text-[10px] uppercase tracking-wider text-secondary">
                        Projects
                      </span>
                      <span className="font-heading-sm text-primary">0</span>
                    </div>
                    <div className="h-8 w-px bg-primary/20" />
                    <div className="flex flex-col text-right">
                      <span className="mb-1 font-label text-[10px] uppercase tracking-wider text-secondary">
                        Progress
                      </span>
                      <span className="font-heading-sm text-primary">0%</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-center rounded-xl border border-dashed border-border-subtle bg-surface-container-low p-4 text-center">
                  <p className="flex items-center gap-2 font-body-sm text-body-sm italic text-text-soft">
                    <span className="material-symbols-outlined text-[16px]">inbox</span>
                    Belum ada project...
                  </p>
                </div>
              </section>

              <section className="rounded-[24px] border border-border-subtle bg-surface-card p-6 shadow-sm">
                <h2 className="mb-1 font-heading-sm text-heading-sm text-text-primary">Kode Join</h2>
                <p className="mb-4 font-body-sm text-body-sm text-text-secondary">
                  Kode Join akan dibuat otomatis setelah kelompok disimpan.
                </p>
                <div className="flex items-center gap-2">
                  <div className="flex h-12 flex-1 items-center justify-center rounded-xl border border-dashed border-border-subtle bg-surface-container-low">
                    <span className="font-display text-[18px] tracking-widest text-text-soft opacity-50 blur-[2px]">
                      CT-AI24
                    </span>
                  </div>
                  <button
                    className="flex h-12 w-12 cursor-not-allowed items-center justify-center rounded-xl border border-border-subtle bg-surface-container text-text-soft"
                    disabled
                    type="button"
                  >
                    <span className="material-symbols-outlined">content_copy</span>
                  </button>
                </div>
              </section>
            </aside>
          </div>
        </div>
      </div>

      <div
        className={`fixed inset-0 z-50 items-center justify-center bg-primary/40 backdrop-blur-sm transition-all duration-300 ${
          isModalOpen ? "flex opacity-100" : "hidden opacity-0"
        }`}
      >
        <div
          className={`flex w-full max-w-md transform flex-col items-center rounded-[32px] bg-surface-card p-8 text-center shadow-2xl transition-transform duration-300 ${
            isModalOpen ? "scale-100" : "scale-95"
          }`}
        >
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-mint-strong shadow-sm">
            <span className="material-symbols-outlined text-[40px] text-primary">celebration</span>
          </div>
          <h2 className="mb-2 font-heading-md text-heading-md text-text-primary">Kelompok Berhasil Dibuat!</h2>
          <p className="mb-8 px-4 font-body text-body text-text-secondary">
            Bagikan kode ini kepada teman-temanmu agar mereka bisa bergabung.
          </p>

          <div className="relative mb-8 w-full rounded-[20px] border border-border-subtle bg-surface-main p-6">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full border border-border-subtle bg-surface-card px-3 font-label text-[10px] uppercase tracking-widest text-text-secondary">
              Kode Join
            </span>
            <div className="font-display text-[32px] font-bold tracking-widest text-primary">{joinCode}</div>
          </div>

          <div className="flex w-full flex-col gap-3">
            <button
              type="button"
              onClick={copyJoinCode}
              disabled={!createdGroup?.joinCode}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-full border border-border-subtle bg-surface-container-low font-button text-button text-text-primary transition-all hover:bg-surface-container-high active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span className="material-symbols-outlined text-[18px]">content_copy</span>
              Copy Code
            </button>
            <button
              type="button"
              onClick={openCreatedGroup}
              className="h-12 w-full rounded-full bg-primary font-button text-button text-on-primary shadow-md transition-all hover:bg-inverse-surface active:scale-95"
            >
              Masuk ke Dashboard Kelompok
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
