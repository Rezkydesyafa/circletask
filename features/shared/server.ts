import "server-only";

import { hasSupabaseEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

export class BackendError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BackendError";
  }
}

export async function getAuthenticatedBackend() {
  if (!hasSupabaseEnv()) {
    throw new BackendError(
      "Supabase belum dikonfigurasi. Isi NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_ANON_KEY di .env.local."
    );
  }

  const supabase = createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new BackendError("Sesi login tidak ditemukan. Silakan login ulang.");
  }

  return { supabase, user };
}

export function getErrorMessage(error: unknown, fallback = "Terjadi kesalahan. Coba lagi.") {
  if (error instanceof BackendError) {
    return error.message;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

