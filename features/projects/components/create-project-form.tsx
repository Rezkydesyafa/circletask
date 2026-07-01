"use client";

import type { Route } from "next";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useTransition } from "react";

import { createProjectAction } from "@/features/projects/actions";
import { createProjectSchema, type CreateProjectInput } from "@/features/projects/schemas";

type CreateProjectFormProps = {
  groupId: string;
};

export function CreateProjectForm({ groupId }: CreateProjectFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const form = useForm<CreateProjectInput>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      groupId,
      title: "",
      description: "",
      deadline: "",
    },
  });

  const title = form.watch("title");
  const description = form.watch("description");
  const deadline = form.watch("deadline");

  const onSubmit = form.handleSubmit((values) => {
    form.clearErrors("root");

    startTransition(async () => {
      const result = await createProjectAction(values);

      if (!result.ok) {
        form.setError("root", { message: result.message });

        for (const [field, messages] of Object.entries(result.fieldErrors ?? {})) {
          if (messages?.[0]) {
            form.setError(field as keyof CreateProjectInput, { message: messages[0] });
          }
        }

        return;
      }

      if (result.data?.id) {
        router.push(`/groups/${groupId}/projects/${result.data.id}` as Route);
        router.refresh();
        return;
      }

      router.push(`/groups/${groupId}/projects` as Route);
      router.refresh();
    });
  });

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
      <form
        className="rounded-[28px] border border-border-subtle bg-surface-card p-6 shadow-sm"
        onSubmit={onSubmit}
      >
        <input type="hidden" {...form.register("groupId")} />

        <div className="grid gap-5">
          <FieldError message={form.formState.errors.root?.message} />

          <div>
            <label className="mb-2 block font-label text-label text-text-secondary" htmlFor="title">
              Nama Project
            </label>
            <input
              id="title"
              className="h-12 w-full rounded-2xl border border-border-subtle bg-surface-container-low px-4 font-body text-body text-text-primary outline-none transition-shadow focus:ring-2 focus:ring-primary"
              placeholder="Contoh: Website CircleTask"
              {...form.register("title")}
            />
            <FieldError message={form.formState.errors.title?.message} />
          </div>

          <div>
            <label className="mb-2 block font-label text-label text-text-secondary" htmlFor="description">
              Deskripsi Project
            </label>
            <textarea
              id="description"
              className="min-h-[150px] w-full resize-none rounded-2xl border border-border-subtle bg-surface-container-low px-4 py-3 font-body text-body text-text-primary outline-none transition-shadow focus:ring-2 focus:ring-primary"
              placeholder="Tuliskan tujuan project dan output yang harus dikumpulkan."
              {...form.register("description")}
            />
            <FieldError message={form.formState.errors.description?.message} />
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block font-label text-label text-text-secondary" htmlFor="deadline">
                Deadline Project
              </label>
              <input
                id="deadline"
                className="h-12 w-full rounded-2xl border border-border-subtle bg-surface-container-low px-4 font-body text-body text-text-primary outline-none transition-shadow focus:ring-2 focus:ring-primary"
                type="date"
                {...form.register("deadline")}
              />
              <FieldError message={form.formState.errors.deadline?.message} />
            </div>

            <div>
              <label className="mb-2 block font-label text-label text-text-secondary" htmlFor="category">
                Kategori Project
              </label>
              <input
                id="category"
                className="h-12 w-full rounded-2xl border border-border-subtle bg-surface-container-low px-4 font-body text-body text-text-primary outline-none"
                disabled
                value="Tugas Kelompok"
              />
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            className="h-12 rounded-full border border-border-subtle bg-surface-card px-6 font-button text-button text-text-primary transition-colors hover:bg-surface-container-low"
            onClick={() => router.push(`/groups/${groupId}/projects` as Route)}
            type="button"
          >
            Batal
          </button>
          <button
            className="h-12 rounded-full bg-primary px-7 font-button text-button text-on-primary shadow-md transition-colors hover:bg-inverse-surface disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isPending}
            type="submit"
          >
            {isPending ? "Menyimpan..." : "Buat Project"}
          </button>
        </div>
      </form>

      <aside className="rounded-[28px] border border-border-subtle bg-pastel-blue p-6 shadow-sm">
        <p className="mb-4 font-label text-label uppercase tracking-wider text-text-secondary">Preview Project</p>
        <div className="rounded-[24px] bg-white/85 p-5">
          <div className="mb-5 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="truncate font-heading-sm text-heading-sm text-text-primary">
                {title || "Judul Project Baru"}
              </h2>
              <p className="mt-2 line-clamp-3 font-body-sm text-body-sm text-text-secondary">
                {description || "Preview deskripsi project akan tampil di sini."}
              </p>
            </div>
            <span className="rounded-full bg-primary px-3 py-1 font-label text-label text-on-primary">
              Aktif
            </span>
          </div>
          <div className="rounded-2xl bg-surface-container-low p-4">
            <div className="mb-2 flex justify-between font-label text-label text-text-soft">
              <span>Progress</span>
              <span>0%</span>
            </div>
            <div className="h-2 rounded-full bg-surface-container-high" />
          </div>
          <p className="mt-4 flex items-center gap-2 font-body-sm text-body-sm text-text-secondary">
            <span className="material-symbols-outlined text-[16px]">event</span>
            {deadline ? `Deadline ${deadline}` : "Deadline belum dipilih"}
          </p>
        </div>
      </aside>
    </div>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className="mt-2 font-body-sm text-body-sm text-destructive">{message}</p>;
}
