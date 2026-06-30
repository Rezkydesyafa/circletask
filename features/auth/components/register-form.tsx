"use client";

import Link from "next/link";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState, useTransition } from "react";
import { Eye } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { registerAction } from "@/features/auth/actions";
import { registerSchema, type RegisterInput } from "@/features/auth/schemas";

export function RegisterForm() {
  const router = useRouter();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      terms: false,
      avatarUrl: "",
    },
  });

  const inputClassName =
    "h-auto rounded-none border-0 border-b border-gray-300 bg-transparent px-0 py-2 text-sm text-[#111111] ring-offset-0 placeholder:text-gray-400 focus-visible:border-[#111111] focus-visible:ring-0 focus-visible:ring-offset-0";

  const onSubmit = form.handleSubmit((values) => {
    setSuccessMessage(null);
    form.clearErrors("root");

    startTransition(async () => {
      const result = await registerAction(values);

      if (result.status === "error") {
        form.setError("root", {
          message: result.message ?? "Registrasi gagal.",
        });

        for (const [field, messages] of Object.entries(result.fieldErrors ?? {})) {
          if (messages?.[0]) {
            form.setError(field as keyof RegisterInput, { message: messages[0] });
          }
        }

        return;
      }

      if (result.message) {
        setSuccessMessage(result.message);
      }

      if (result.redirectTo) {
        router.push(result.redirectTo as Route);
        router.refresh();
      }
    });
  });

  return (
    <>
      <form className="space-y-6" onSubmit={onSubmit}>
      <input type="hidden" {...form.register("avatarUrl")} />

      <div>
        <Label className="mb-1 block text-xs font-medium text-gray-500" htmlFor="fullName">
          Nama Lengkap
        </Label>
        <Input
          className={inputClassName}
          id="fullName"
          placeholder="Masukkan nama lengkap"
          autoComplete="name"
          {...form.register("fullName")}
        />
        {form.formState.errors.fullName ? (
          <p className="text-sm text-destructive">{form.formState.errors.fullName.message}</p>
        ) : null}
      </div>

      <div>
        <Label className="mb-1 block text-xs font-medium text-gray-500" htmlFor="email">
          Email
        </Label>
        <Input
          className={inputClassName}
          id="email"
          type="email"
          placeholder="email@contoh.com"
          autoComplete="email"
          {...form.register("email")}
        />
        {form.formState.errors.email ? (
          <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
        ) : null}
      </div>

      <div className="relative">
        <Label className="mb-1 block text-xs font-medium text-gray-500" htmlFor="password">
          Password
        </Label>
        <Input
          className={`${inputClassName} pr-10`}
          id="password"
          type="password"
          placeholder="********"
          autoComplete="new-password"
          {...form.register("password")}
        />
        <button
          className="absolute right-0 top-6 text-gray-400 transition-colors hover:text-gray-600 focus:outline-none"
          type="button"
        >
          <Eye className="h-5 w-5" />
        </button>
        {form.formState.errors.password ? (
          <p className="text-sm text-destructive">{form.formState.errors.password.message}</p>
        ) : null}
      </div>

      <div className="relative">
        <Label className="mb-1 block text-xs font-medium text-gray-500" htmlFor="confirmPassword">
          Konfirmasi Password
        </Label>
        <Input
          className={`${inputClassName} pr-10`}
          id="confirmPassword"
          type="password"
          placeholder="********"
          autoComplete="new-password"
          {...form.register("confirmPassword")}
        />
        {form.formState.errors.confirmPassword ? (
          <p className="text-sm text-destructive">
            {form.formState.errors.confirmPassword.message}
          </p>
        ) : null}
      </div>

      <div className="mt-4 flex items-start">
        <input
          className="mt-0.5 h-4 w-4 rounded border-gray-300 text-[#111111] focus:ring-[#111111]"
          id="terms"
          type="checkbox"
          {...form.register("terms")}
        />
        <label className="ml-2 block text-xs leading-5 text-gray-600" htmlFor="terms">
          Saya setuju dengan{" "}
          <Link className="text-[#111111] hover:underline" href="#">
            syarat dan ketentuan
          </Link>
        </label>
      </div>
      {form.formState.errors.terms ? (
        <p className="text-sm text-destructive">{form.formState.errors.terms.message}</p>
      ) : null}

      {form.formState.errors.root ? (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {form.formState.errors.root.message}
        </div>
      ) : null}

      {successMessage ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          {successMessage}
        </div>
      ) : null}

      <div className="pt-4">
        <Button
          className="h-auto w-full rounded-full border border-transparent bg-[#111111] px-4 py-3 text-sm font-medium text-white shadow-sm transition-colors hover:bg-gray-800 focus-visible:ring-[#111111]"
          disabled={isPending}
          type="submit"
        >
          {isPending ? "Memproses..." : "Daftar"}
        </Button>
      </div>
    </form>

      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white px-2 text-xs text-gray-400">atau</span>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <Button
          className="h-auto w-full rounded-full border border-gray-200 bg-[#f7f3f2] px-4 py-3 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-100 focus-visible:ring-gray-200"
          type="button"
          variant="outline"
        >
          <svg
            className="mr-2 h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Daftar dengan Google
        </Button>
      </div>

      <div className="mt-8 text-center text-xs text-gray-500">
        Sudah punya akun?{" "}
        <Link href="/login" className="font-semibold text-[#111111] hover:underline">
          Masuk
        </Link>
      </div>
    </>
  );
}
