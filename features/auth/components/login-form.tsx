"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useTransition } from "react";
import { Eye } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginAction } from "@/features/auth/actions";
import { loginSchema, type LoginInput } from "@/features/auth/schemas";

type LoginFormProps = {
  nextPath?: string;
};

export function LoginForm({ nextPath }: LoginFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      nextPath,
    },
  });

  const inputClassName =
    "h-auto rounded-none border-0 border-b border-gray-300 bg-transparent px-0 py-2 pb-2 text-sm text-[#111111] ring-offset-0 placeholder:text-gray-400 focus-visible:border-[#111111] focus-visible:ring-0 focus-visible:ring-offset-0";

  const onSubmit = form.handleSubmit((values) => {
    form.clearErrors("root");

    startTransition(async () => {
      const result = await loginAction(values);

      if (result.status === "error") {
        form.setError("root", {
          message: result.message ?? "Login gagal.",
        });

        if (result.fieldErrors?.email?.[0]) {
          form.setError("email", { message: result.fieldErrors.email[0] });
        }

        if (result.fieldErrors?.password?.[0]) {
          form.setError("password", { message: result.fieldErrors.password[0] });
        }

        return;
      }

      router.push(result.redirectTo ?? "/dashboard");
      router.refresh();
    });
  });

  return (
    <form className="space-y-6" onSubmit={onSubmit}>
      <input type="hidden" {...form.register("nextPath")} />

      <div className="relative">
        <Label className="mb-1 block text-xs font-medium text-gray-500" htmlFor="email">
          Email
        </Label>
        <Input
          className={inputClassName}
          id="email"
          type="email"
          placeholder="contoh@email.com"
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
        <div className="relative">
          <Input
            className={`${inputClassName} pr-10`}
            id="password"
            type="password"
            placeholder="Masukkan password"
            autoComplete="current-password"
            {...form.register("password")}
          />
          <button
            className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-gray-600 focus:outline-none"
            type="button"
          >
            <Eye className="h-5 w-5" />
          </button>
        </div>
        {form.formState.errors.password ? (
          <p className="text-sm text-destructive">{form.formState.errors.password.message}</p>
        ) : null}
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center">
          <input
            className="h-4 w-4 rounded border-gray-300 text-[#111111] focus:ring-[#111111]"
            defaultChecked
            id="remember-me"
            name="remember-me"
            type="checkbox"
          />
          <label className="ml-2 block text-xs text-gray-600" htmlFor="remember-me">
            Ingat saya
          </label>
        </div>
        <div className="text-xs">
          <Link className="text-gray-400 transition-colors hover:text-[#111111]" href="#">
            Lupa password?
          </Link>
        </div>
      </div>

      {form.formState.errors.root ? (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {form.formState.errors.root.message}
        </div>
      ) : null}

      <Button
        className="mt-8 h-auto w-full rounded-full border border-transparent bg-[#111111] px-4 py-3.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-black focus-visible:ring-[#111111]"
        disabled={isPending}
        type="submit"
      >
        {isPending ? "Memproses..." : "Masuk"}
      </Button>

      <Button
        className="mt-4 h-auto w-full rounded-full border border-gray-200 bg-[#f7f3f2] px-4 py-3.5 text-sm font-semibold text-[#111111] shadow-sm transition-all hover:bg-gray-100 focus-visible:ring-gray-200"
        type="button"
        variant="outline"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M22.56 12.25C22.56 11.47 22.49 10.73 22.36 10.02H12V14.23H17.92C17.66 15.6 16.89 16.74 15.76 17.51V20.21H19.33C21.41 18.29 22.56 15.53 22.56 12.25Z"
            fill="#4285F4"
          />
          <path
            d="M12 23C14.97 23 17.46 22.02 19.33 20.21L15.76 17.51C14.75 18.19 13.48 18.6 12 18.6C9.13 18.6 6.7 16.66 5.82 14.07H2.14V16.92C4.01 20.63 7.84 23 12 23Z"
            fill="#34A853"
          />
          <path
            d="M5.82 14.07C5.59 13.39 5.46 12.67 5.46 11.93C5.46 11.19 5.59 10.47 5.82 9.79V6.94H2.14C1.38 8.46 0.94 10.15 0.94 11.93C0.94 13.71 1.38 15.4 2.14 16.92L5.82 14.07Z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38C13.62 5.38 15.06 5.94 16.2 7.02L19.4 3.82C17.46 2.01 14.97 1 12 1C7.84 1 4.01 3.37 2.14 7.08L5.82 9.93C6.7 7.34 9.13 5.38 12 5.38Z"
            fill="#EA4335"
          />
        </svg>
        Masuk dengan Google
      </Button>

      <p className="mt-8 text-center text-xs text-gray-500">
        Belum punya akun?{" "}
        <Link href="/register" className="font-semibold text-[#111111] hover:underline">
          Daftar
        </Link>
      </p>
    </form>
  );
}
