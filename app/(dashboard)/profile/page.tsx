import { redirect } from "next/navigation";

import { PageHeader } from "@/components/common/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ensureUserProfile } from "@/features/auth/profile";
import { hasSupabaseEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

function formatProfileDate(value?: string | null) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default async function ProfilePage() {
  if (!hasSupabaseEnv()) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Profil"
          description="Manajemen profil minimal: nama lengkap, email, dan avatar opsional."
        />
        <Card>
          <CardHeader>
            <CardTitle>Supabase belum dikonfigurasi</CardTitle>
            <CardDescription>
              Isi environment Supabase sebelum memakai register, login, dan profil.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Tambahkan `NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_ANON_KEY` ke `.env.local`.
          </CardContent>
        </Card>
      </div>
    );
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  await ensureUserProfile(supabase, user);

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, email, avatar_url, created_at")
    .eq("user_id", user.id)
    .maybeSingle();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Profil"
        description="Manajemen profil minimal: nama lengkap, email, dan avatar opsional."
      />
      <Card>
        <CardHeader>
          <CardTitle>Profil pengguna</CardTitle>
          <CardDescription>Data dasar pengguna untuk alur MVP CircleTask.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 text-sm sm:grid-cols-2">
          <div className="space-y-1">
            <p className="text-muted-foreground">Nama lengkap</p>
            <p className="font-medium text-foreground">{profile?.full_name ?? "-"}</p>
          </div>
          <div className="space-y-1">
            <p className="text-muted-foreground">Email</p>
            <p className="font-medium text-foreground">{profile?.email ?? user.email ?? "-"}</p>
          </div>
          <div className="space-y-1">
            <p className="text-muted-foreground">Avatar URL</p>
            <p className="break-all font-medium text-foreground">{profile?.avatar_url ?? "-"}</p>
          </div>
          <div className="space-y-1">
            <p className="text-muted-foreground">Profil dibuat</p>
            <p className="font-medium text-foreground">{formatProfileDate(profile?.created_at)}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
