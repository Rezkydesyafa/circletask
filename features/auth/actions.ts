"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { hasSupabaseEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { ensureUserProfile } from "@/features/auth/profile";
import {
  loginSchema,
  passwordResetRequestSchema,
  registerSchema,
  updatePasswordSchema,
  updateProfileSchema,
  type LoginInput,
  type PasswordResetRequestInput,
  type RegisterInput,
  type UpdatePasswordInput,
  type UpdateProfileInput,
} from "@/features/auth/schemas";

type AuthActionResult = {
  status: "success" | "error";
  message?: string;
  redirectTo?: string;
  fieldErrors?: Partial<
    Record<
      | keyof RegisterInput
      | keyof LoginInput
      | keyof PasswordResetRequestInput
      | keyof UpdateProfileInput
      | keyof UpdatePasswordInput,
      string[]
    >
  >;
};

const FALLBACK_ERROR_MESSAGE = "Terjadi kesalahan. Coba lagi beberapa saat.";

function getSafeRedirectPath(path?: string) {
  if (!path || !path.startsWith("/") || path.startsWith("//")) {
    return "/dashboard";
  }

  if (path.startsWith("/login") || path.startsWith("/register")) {
    return "/dashboard";
  }

  return path;
}

function getConfigError(): AuthActionResult {
  return {
    status: "error",
    message:
      "Supabase belum dikonfigurasi. Isi NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_ANON_KEY di .env.local.",
  };
}

export async function registerAction(input: RegisterInput): Promise<AuthActionResult> {
  const parsedInput = registerSchema.safeParse(input);

  if (!parsedInput.success) {
    return {
      status: "error",
      message: "Periksa kembali data registrasi.",
      fieldErrors: parsedInput.error.flatten().fieldErrors,
    };
  }

  if (!hasSupabaseEnv()) {
    return getConfigError();
  }

  const { fullName, email, password, avatarUrl } = parsedInput.data;
  const supabase = createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/login`,
      data: {
        full_name: fullName,
        avatar_url: avatarUrl ?? null,
      },
    },
  });

  if (error) {
    return {
      status: "error",
      message: error.message || FALLBACK_ERROR_MESSAGE,
    };
  }

  if (data.user && data.session) {
    try {
      await ensureUserProfile(supabase, data.user, {
        fullName,
        email,
        avatarUrl: avatarUrl ?? null,
      });
    } catch (profileError) {
      return {
        status: "error",
        message:
          profileError instanceof Error ? profileError.message : "Gagal membuat profil pengguna.",
      };
    }

    return {
      status: "success",
      message: "Registrasi berhasil.",
      redirectTo: "/dashboard",
    };
  }

  return {
    status: "success",
    message:
      "Registrasi berhasil. Jika email confirmation aktif di Supabase, cek email lalu login setelah akun terverifikasi.",
  };
}

export async function loginAction(input: LoginInput): Promise<AuthActionResult> {
  const parsedInput = loginSchema.safeParse(input);

  if (!parsedInput.success) {
    return {
      status: "error",
      message: "Periksa kembali data login.",
      fieldErrors: parsedInput.error.flatten().fieldErrors,
    };
  }

  if (!hasSupabaseEnv()) {
    return getConfigError();
  }

  const { email, password, nextPath } = parsedInput.data;
  const supabase = createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return {
      status: "error",
      message: error.message || "Email atau password tidak sesuai.",
    };
  }

  if (data.user) {
    try {
      await ensureUserProfile(supabase, data.user);
    } catch (profileError) {
      return {
        status: "error",
        message:
          profileError instanceof Error ? profileError.message : "Gagal menyinkronkan profil pengguna.",
      };
    }
  }

  return {
    status: "success",
    message: "Login berhasil.",
    redirectTo: getSafeRedirectPath(nextPath),
  };
}

export async function requestPasswordResetAction(
  input: PasswordResetRequestInput
): Promise<AuthActionResult> {
  const parsedInput = passwordResetRequestSchema.safeParse(input);

  if (!parsedInput.success) {
    return {
      status: "error",
      message: "Periksa kembali email.",
      fieldErrors: parsedInput.error.flatten().fieldErrors,
    };
  }

  if (!hasSupabaseEnv()) {
    return getConfigError();
  }

  const supabase = createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(parsedInput.data.email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/login`,
  });

  if (error) {
    return {
      status: "error",
      message: error.message || "Gagal mengirim email reset password.",
    };
  }

  return {
    status: "success",
    message: "Jika email terdaftar, instruksi reset password akan dikirim.",
  };
}

export async function updateProfileAction(input: UpdateProfileInput): Promise<AuthActionResult> {
  const parsedInput = updateProfileSchema.safeParse(input);

  if (!parsedInput.success) {
    return {
      status: "error",
      message: "Periksa kembali data profil.",
      fieldErrors: parsedInput.error.flatten().fieldErrors,
    };
  }

  if (!hasSupabaseEnv()) {
    return getConfigError();
  }

  const supabase = createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      status: "error",
      message: "Sesi login tidak ditemukan. Silakan login ulang.",
    };
  }

  const { fullName, avatarUrl } = parsedInput.data;
  const { error: authUpdateError } = await supabase.auth.updateUser({
    data: {
      full_name: fullName,
      avatar_url: avatarUrl ?? null,
    },
  });

  if (authUpdateError) {
    return {
      status: "error",
      message: authUpdateError.message || "Gagal memperbarui metadata profil.",
    };
  }

  try {
    await ensureUserProfile(supabase, user, {
      fullName,
      avatarUrl: avatarUrl ?? null,
    });
  } catch (profileError) {
    return {
      status: "error",
      message:
        profileError instanceof Error ? profileError.message : "Gagal memperbarui profil pengguna.",
    };
  }

  revalidatePath("/profile");

  return {
    status: "success",
    message: "Profil berhasil diperbarui.",
  };
}

export async function updatePasswordAction(input: UpdatePasswordInput): Promise<AuthActionResult> {
  const parsedInput = updatePasswordSchema.safeParse(input);

  if (!parsedInput.success) {
    return {
      status: "error",
      message: "Periksa kembali password baru.",
      fieldErrors: parsedInput.error.flatten().fieldErrors,
    };
  }

  if (!hasSupabaseEnv()) {
    return getConfigError();
  }

  const supabase = createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      status: "error",
      message: "Sesi reset password tidak ditemukan. Buka ulang link recovery dari email.",
    };
  }

  const { error } = await supabase.auth.updateUser({
    password: parsedInput.data.password,
  });

  if (error) {
    return {
      status: "error",
      message: error.message || "Gagal memperbarui password.",
    };
  }

  return {
    status: "success",
    message: "Password berhasil diperbarui. Silakan login kembali.",
    redirectTo: "/login",
  };
}

export async function logoutAction() {
  if (hasSupabaseEnv()) {
    const supabase = createClient();
    await supabase.auth.signOut();
  }

  redirect("/login");
}
