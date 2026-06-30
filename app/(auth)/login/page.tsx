import Image from "next/image";

import { LoginForm } from "@/features/auth/components/login-form";

type LoginPageProps = {
  searchParams?: {
    next?: string;
  };
};

export default function LoginPage({ searchParams }: LoginPageProps) {
  return (
    <main
      className="flex min-h-screen items-center justify-center bg-[#e5e5e5] p-6 text-[#111111]"
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
    >
      <section className="flex h-full max-h-[800px] w-full max-w-5xl flex-col gap-8 overflow-hidden rounded-[40px] bg-[#fdf8f8] p-4 shadow-2xl md:flex-row md:p-6">
        <div className="relative hidden w-1/2 overflow-hidden rounded-[32px] bg-gray-100 md:block">
          <Image
            alt="3D abstract shapes"
            className="h-full w-full object-cover"
            fill
            priority
            sizes="(min-width: 768px) 50vw, 0px"
            src="/stitch-assets/login-illustration.png"
            style={{ filter: "hue-rotate(45deg) saturate(1.2)" }}
          />
        </div>

        <div className="flex w-full flex-col justify-center px-4 py-8 md:w-1/2 md:px-12">
          <div className="mb-10 flex items-center justify-center gap-2 text-[#111111]">
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

          <div className="mb-10 text-center">
            <h1 className="mb-2 text-3xl font-bold text-[#111111]">
              Selamat Datang Kembali!
            </h1>
            <p className="text-sm text-[#5c5f6a]">Masuk untuk melanjutkan tugas kelompokmu</p>
          </div>

          <LoginForm nextPath={searchParams?.next} />
        </div>
      </section>
    </main>
  );
}
