import Image from "next/image";

import { RegisterForm } from "@/features/auth/components/register-form";

export default function RegisterPage() {
  return (
    <main
      className="flex min-h-screen flex-col items-center justify-center bg-[#ddd9d8] p-4 text-gray-900 antialiased"
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
    >
      <div className="mb-6 flex items-center space-x-2 rounded-full bg-white px-4 py-2 shadow-sm">
        <div className="flex h-6 w-6 items-center justify-center overflow-hidden rounded-full bg-blue-600 text-xs text-white">
          C
        </div>
        <span className="text-sm font-medium text-gray-700">CircleTask.com</span>
      </div>

      <section className="flex w-full max-w-6xl flex-col gap-8 overflow-hidden rounded-[32px] bg-white p-4 shadow-xl md:flex-row md:rounded-[40px] md:p-6">
        <div className="relative hidden min-h-[600px] overflow-hidden rounded-3xl bg-gray-100 md:block md:w-1/2">
          <Image
            alt="Abstract 3D shapes including spheres, flowers, and donuts in pastel colors"
            className="object-cover object-left"
            fill
            priority
            sizes="(min-width: 768px) 50vw, 0px"
            src="/stitch-assets/register-illustration.png"
          />
        </div>

        <div className="flex w-full flex-col justify-center px-4 py-8 md:w-1/2 md:px-12">
          <div className="mx-auto w-full max-w-md">
            <div className="mb-8 flex items-center justify-center space-x-2">
              <svg className="h-6 w-6 text-[#111111]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
              </svg>
              <span className="text-xl font-bold tracking-normal text-[#111111]">CircleTask</span>
            </div>

            <div className="mb-10 text-center">
              <h1 className="mb-2 text-3xl font-bold text-[#111111]">Buat Akun Baru</h1>
              <p className="text-sm text-gray-500">Mulai kelola tugas kelompok dengan CircleTask.</p>
            </div>

            <RegisterForm />
          </div>
        </div>
      </section>
    </main>
  );
}
