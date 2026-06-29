import { PageHeader } from "@/components/common/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ProfilePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Profil"
        description="Manajemen profil minimal: nama lengkap, email, dan avatar opsional."
      />
      <Card>
        <CardHeader>
          <CardTitle>Profil pengguna</CardTitle>
          <CardDescription>Form edit profil akan dihubungkan setelah auth aktif.</CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">Belum ada session aktif.</CardContent>
      </Card>
    </div>
  );
}
