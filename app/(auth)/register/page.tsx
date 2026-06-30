import Image from "next/image";

import { RegisterForm } from "@/features/auth/components/register-form";

export default function RegisterPage() {
  return (
    <main
      className="flex min-h-screen items-stretch justify-center bg-white text-[#111111]"
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
    >
      <section className="flex w-full flex-col md:flex-row">
        <div className="relative hidden w-1/2 overflow-hidden bg-[#f0f4f8] md:block">
          <Image
            alt="Abstract 3D shapes including spheres, flowers, and donuts in pastel colors"
            className="h-full w-full object-cover"
            fill
            priority
            sizes="(min-width: 768px) 50vw, 0px"
            src="/stitch-assets/register-illustration.png"
          />
        </div>

        <div className="flex w-full flex-col justify-center px-6 py-12 sm:px-12 md:w-1/2 lg:px-24 xl:px-32">
          <div className="mx-auto w-full max-w-md">
            <div className="mb-12 flex items-center justify-center gap-2 text-[#111111]">
              <svg
                className="h-6 w-6"
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
              <span className="text-xl font-bold">CircleTask</span>
            </div>

            <div className="mb-10 text-center">
              <h1 className="mb-2 text-3xl font-bold text-[#111111]">Buat Akun Baru</h1>
              <p className="text-sm text-[#5c5f6a]">Mulai kelola tugas kelompok dengan CircleTask.</p>
            </div>

            <RegisterForm />
          </div>
        </div>
      </section>
    </main>
  );
}
