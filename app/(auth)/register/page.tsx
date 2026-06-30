import Image from "next/image";

import { RegisterForm } from "@/features/auth/components/register-form";

export default function RegisterPage() {
  return (
    <main
      className="flex min-h-screen items-center justify-center bg-gray-100 p-4 md:p-8 text-[#111111]"
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
    >
      <section className="flex h-full min-h-[600px] w-full max-w-[1040px] flex-col gap-6 rounded-[40px] bg-[#fdf8f8] p-4 shadow-xl md:flex-row md:p-6">
        <div className="relative hidden w-1/2 overflow-hidden rounded-[32px] bg-[#f0f4f8] md:block">
          <Image
            alt="Abstract 3D shapes including spheres, flowers, and donuts in pastel colors"
            className="h-full w-full object-cover"
            fill
            priority
            sizes="(min-width: 768px) 50vw, 0px"
            src="/stitch-assets/register-illustration.png"
            style={{ objectFit: "cover", objectPosition: "left" }}
          />
        </div>

        <div className="flex w-full flex-col justify-center px-4 py-6 md:w-1/2 md:px-8 lg:px-12">
          <div className="mx-auto w-full max-w-[340px]">
            <div className="mb-6 flex items-center justify-center gap-2 text-[#111111]">
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

            <div className="mb-5 text-center">
              <h1 className="mb-2 text-[26px] font-bold leading-tight text-[#111111]">Buat Akun Baru</h1>
              <p className="text-xs text-[#5c5f6a]">Mulai kelola tugas kelompok dengan CircleTask.</p>
            </div>

            <RegisterForm />
          </div>
        </div>
      </section>
    </main>
  );
}
