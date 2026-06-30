import Image from "next/image";

import { RegisterForm } from "@/features/auth/components/register-form";

export default function RegisterPage() {
  return (
    <main
      className="flex h-screen w-screen overflow-hidden items-center justify-center bg-gray-100 p-4 md:p-8 text-[#111111]"
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
    >
      <section className="flex h-full max-h-[850px] w-full max-w-[1040px] flex-col gap-6 rounded-[40px] bg-[#fdf8f8] p-4 shadow-xl md:flex-row md:p-6">
        <div className="relative hidden h-full w-1/2 overflow-hidden rounded-[32px] bg-[#f0f4f8] md:block">
          <Image
            alt="Proof Upload Illustration"
            className="h-full w-full object-cover"
            fill
            priority
            sizes="(min-width: 768px) 50vw, 0px"
            src="/stitch-assets/proof-upload.png"
          />
        </div>

        <div className="flex h-full w-full flex-col overflow-y-auto px-4 py-4 md:w-1/2 md:px-8 lg:px-12 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <div className="mx-auto flex min-h-full w-full max-w-[340px] flex-col justify-center py-4">
            <div className="mb-8 flex shrink-0 items-center justify-center gap-2 text-[#111111]">
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M8 12h8" />
              </svg>
              <span className="text-lg font-bold">CircleTask</span>
            </div>

            <div className="mb-8 shrink-0 text-center">
              <h1 className="mb-2 text-[26px] font-bold leading-tight text-[#111111]">Buat Akun Baru</h1>
              <p className="text-xs text-[#5c5f6a]">Mulai kelola tugas kelompok dengan CircleTask.</p>
            </div>

            <div className="shrink-0 pb-4">
              <RegisterForm />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
