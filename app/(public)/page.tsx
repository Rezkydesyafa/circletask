import Link from "next/link";
import { CheckCircle2, FileText, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const highlights = [
  {
    title: "Bukti kerja",
    description: "Task tidak berhenti di checklist. Anggota perlu upload bukti sebelum submit review.",
    icon: CheckCircle2,
  },
  {
    title: "Validasi ketua",
    description: "Ketua approve, minta revisi, atau reassign task sesuai alur MVP.",
    icon: ShieldCheck,
  },
  {
    title: "Laporan kontribusi",
    description: "Kontribusi dihitung dari task approved atau done, lalu diexport ke PDF.",
    icon: FileText,
  },
];

export default function LandingPage() {
  return (
    <main className="min-h-screen">
      <section className="container grid min-h-screen gap-10 py-10 lg:grid-cols-[1fr_440px] lg:items-center">
        <div className="space-y-8">
          <div className="space-y-5">
            <div className="inline-flex rounded-md border bg-card px-3 py-1 text-sm font-medium text-muted-foreground">
              Manajemen tugas kelompok berbasis bukti kerja
            </div>
            <div className="space-y-4">
              <h1 className="max-w-3xl text-4xl font-semibold tracking-normal sm:text-5xl">
                CircleTask
              </h1>
              <p className="max-w-2xl text-base leading-7 text-muted-foreground">
                Bantu ketua dan anggota kelompok membagi task, upload bukti pekerjaan, validasi
                hasil, mencatat activity log, dan membuat laporan kontribusi PDF.
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/register">Mulai register</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/login">Login</Link>
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Alur MVP</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {highlights.map((item) => {
              const Icon = item.icon;

              return (
                <div key={item.title} className="flex gap-3 rounded-md border bg-background p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <h2 className="text-sm font-semibold">{item.title}</h2>
                    <p className="text-sm leading-6 text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
