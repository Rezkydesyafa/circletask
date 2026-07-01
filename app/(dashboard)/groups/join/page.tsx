"use client";

import type { Route } from "next";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState, useTransition } from "react";

import { joinGroupAction } from "@/features/groups/actions";
import { joinGroupSchema, type JoinGroupInput } from "@/features/groups/schemas";
import { cn } from "@/lib/utils";

export default function JoinGroupPage() {
  const router = useRouter();
  const [isCodeValid, setIsCodeValid] = useState(true);
  const [isPending, startTransition] = useTransition();
  const form = useForm<JoinGroupInput>({
    resolver: zodResolver(joinGroupSchema),
    defaultValues: {
      joinCode: "CT-AI24",
    },
  });
  const joinCode = form.watch("joinCode") ?? "";

  const handleCheckCode = () => {
    form.clearErrors("joinCode");
    form.clearErrors("root");

    if (joinCode.trim().length < 4) {
      setIsCodeValid(false);
      form.setError("joinCode", { message: "Kode join wajib diisi minimal 4 karakter." });
      return;
    }

    setIsCodeValid(true);
  };

  const onSubmit = form.handleSubmit((values) => {
    form.clearErrors("root");

    startTransition(async () => {
      const result = await joinGroupAction(values);

      if (!result.ok) {
        form.setError("root", { message: result.message });

        if (result.fieldErrors?.joinCode?.[0]) {
          form.setError("joinCode", { message: result.fieldErrors.joinCode[0] });
        }

        return;
      }

      if (result.data?.id) {
        router.push(`/groups/${result.data.id}` as Route);
        router.refresh();
        return;
      }

      router.push("/dashboard");
      router.refresh();
    });
  });

  return (
    <div className="h-full w-full overflow-y-auto bg-surface-main p-6 md:p-page-padding">
      <div className="mx-auto flex w-full max-w-[1200px] flex-col">
        <header className="mb-8">
          <h1 className="sr-only">Gabung Kelompok</h1>
          <p className="font-body text-body text-text-secondary">
            Masukkan kode undangan dari ketua kelompok untuk mulai mengerjakan task.
          </p>
        </header>

        <div className="grid grid-cols-1 gap-section-gap lg:grid-cols-12">
          <section className="flex flex-col gap-card-gap lg:col-span-5">
            <form
              id="join-group-form"
              className="rounded-[24px] border border-border-subtle bg-surface-card p-6 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.05)]"
              onSubmit={onSubmit}
            >
              <label className="mb-2 block font-label text-label text-text-primary" htmlFor="joinCode">
                Kode Join
              </label>
              <div className="relative">
                <input
                  id="joinCode"
                  type="text"
                  placeholder="Contoh: CT-AI24"
                  className="h-12 w-full rounded-xl border border-border-subtle bg-surface-container-low px-4 pr-11 font-body text-body font-bold uppercase tracking-wider text-text-primary shadow-inner-soft transition-shadow focus:outline-none focus:ring-2 focus:ring-primary"
                  {...form.register("joinCode")}
                  value={joinCode}
                  onChange={(event) => {
                    form.setValue("joinCode", event.target.value.toUpperCase(), {
                      shouldDirty: true,
                      shouldValidate: false,
                    });
                    setIsCodeValid(false);
                  }}
                />
                {isCodeValid ? (
                  <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-[20px] text-mint-strong">
                    check_circle
                  </span>
                ) : null}
              </div>

              {form.formState.errors.joinCode ? (
                <p className="mt-2 text-sm text-destructive">{form.formState.errors.joinCode.message}</p>
              ) : (
                <p className="mt-3 flex items-center gap-1 font-body-sm text-body-sm text-text-soft">
                  <span className="material-symbols-outlined text-[16px]">info</span>
                  Minta kode ini dari ketua kelompok.
                </p>
              )}

              {form.formState.errors.root ? (
                <div className="mt-5 rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  {form.formState.errors.root.message}
                </div>
              ) : null}

              <div className="mt-8 flex flex-col gap-3">
                <button
                  type="submit"
                  disabled={isPending}
                  className="h-12 w-full rounded-full bg-primary font-button text-button text-on-primary shadow-md transition-all hover:bg-inverse-surface active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isPending ? "Menggabungkan..." : "Gabung Kelompok"}
                </button>
                <button
                  type="button"
                  onClick={handleCheckCode}
                  className="h-12 w-full rounded-full border border-border-subtle bg-surface-card font-button text-button text-text-primary transition-colors hover:bg-surface-container-low"
                >
                  Cek Kode
                </button>
              </div>
            </form>

            <div className="mt-4 grid grid-cols-1 gap-3">
              <StepItem
                checked={isCodeValid}
                index={1}
                label="Masukkan kode"
                muted={isCodeValid}
              />
              <StepItem
                active={isCodeValid}
                index={2}
                label="Gabung ke kelompok"
              />
              <StepItem
                index={3}
                label="Kerjakan task"
                muted
              />
            </div>
          </section>

          <section className="flex flex-col gap-6 lg:col-span-7">
            {isCodeValid ? (
              <div className="relative overflow-hidden rounded-[24px] bg-pastel-blue p-6 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.05)]">
                <div className="relative z-10">
                  <div className="mb-6 flex items-center gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white shadow-sm">
                      <span className="material-symbols-outlined text-[20px] text-primary">
                        verified
                      </span>
                    </div>
                    <h2 className="font-heading-sm text-body text-text-primary">Kelompok ditemukan</h2>
                  </div>

                  <div className="mb-6 rounded-xl border border-white bg-white/80 p-5 backdrop-blur-md">
                    <div className="mb-5">
                      <h3 className="font-body text-body text-text-primary">Enterprise Architecture</h3>
                      <span className="mt-2 inline-flex rounded bg-mint-strong/70 px-2 py-1 font-label text-[10px] uppercase tracking-wider text-secondary">
                        Aktif
                      </span>
                    </div>

                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                      <div>
                        <p className="mb-2 font-label text-label text-text-soft">Ketua Kelompok</p>
                        <div className="flex items-center gap-2">
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-pastel-orange text-[10px] font-bold text-primary">
                            AB
                          </div>
                          <span className="font-body-sm text-body-sm text-text-primary">Annette Black</span>
                        </div>
                      </div>
                      <div>
                        <p className="mb-2 font-label text-label text-text-soft">Statistik</p>
                        <p className="font-body-sm text-body-sm text-text-primary">
                          5 Anggota - 2 Project
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 rounded-xl border border-border-subtle bg-white p-5 sm:flex-row sm:items-start sm:gap-4">
                    <div className="shrink-0">
                      <span className="inline-flex rounded-full bg-pastel-lavender px-3 py-1 font-label text-label text-text-primary">
                        Anggota
                      </span>
                    </div>
                    <div>
                      <h3 className="mb-1 font-label text-base text-text-primary">
                        Kamu akan bergabung sebagai Anggota
                      </h3>
                      <p className="font-body-sm leading-relaxed text-text-secondary">
                        Sebagai anggota, kamu bisa melihat project, mengerjakan task, upload bukti,
                        submit review, dan melihat kontribusi sendiri.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex min-h-[320px] flex-col items-center justify-center rounded-[24px] border border-dashed border-border-subtle bg-surface-container-low p-8 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-surface-container text-text-soft">
                  <span className="material-symbols-outlined text-[32px]">search</span>
                </div>
                <h2 className="mb-2 font-heading-sm text-heading-sm text-text-primary">Belum Ada Kelompok</h2>
                <p className="max-w-sm font-body-sm text-body-sm text-text-secondary">
                  Masukkan kode join dan klik &quot;Cek Kode&quot; untuk melihat detail kelompok sebelum
                  bergabung.
                </p>
              </div>
            )}

            <div className="mt-auto flex items-start gap-3 pt-4 text-text-soft">
              <span className="material-symbols-outlined text-[18px]">lightbulb</span>
              <p className="max-w-2xl font-body-sm text-body-sm">
                Satu akun tetap bisa menjadi ketua di kelompok lain. Role ditentukan per workspace.
              </p>
            </div>
          </section>
        </div>

        <div className="mt-10 flex flex-col justify-end gap-4 border-t border-border-subtle pt-6 sm:flex-row">
          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            className="h-12 rounded-full border border-border-subtle bg-surface-card px-6 font-button text-button text-text-primary transition-colors hover:bg-surface-container-low"
          >
            Kembali ke Dashboard
          </button>
          <button
            type="submit"
            form="join-group-form"
            disabled={isPending}
            className="h-12 rounded-full bg-primary px-8 font-button text-button text-on-primary shadow-md transition-colors hover:bg-inverse-surface disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? "Menggabungkan..." : "Gabung Kelompok"}
          </button>
        </div>
      </div>
    </div>
  );
}

type StepItemProps = {
  active?: boolean;
  checked?: boolean;
  index: number;
  label: string;
  muted?: boolean;
};

function StepItem({ active = false, checked = false, index, label, muted = false }: StepItemProps) {
  return (
    <div
      className={cn(
        "flex h-[58px] items-center gap-4 rounded-xl border bg-surface-card px-4 transition-all",
        active ? "border-border-subtle border-l-4 border-l-primary shadow-sm" : "border-border-subtle",
        muted ? "opacity-45" : undefined
      )}
    >
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-label text-label",
          active ? "bg-primary text-on-primary" : "bg-surface-container text-text-primary"
        )}
      >
        {index}
      </div>
      <span className={cn("font-body text-body text-text-primary", active ? "font-bold" : undefined)}>
        {label}
      </span>
      {checked ? (
        <span className="material-symbols-outlined ml-auto text-[18px] text-mint-strong">check</span>
      ) : null}
    </div>
  );
}
