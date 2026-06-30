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
      className="flex min-h-screen items-stretch justify-center bg-white text-[#111111]"
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
    >
      <section className="flex w-full flex-col md:flex-row">
        <div className="relative hidden w-1/2 overflow-hidden bg-[#eaf4eb] md:block">
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
              <h1 className="mb-2 text-3xl font-bold text-[#111111]">
                Selamat Datang Kembali!
              </h1>
              <p className="text-sm text-[#5c5f6a]">Masuk untuk melanjutkan tugas kelompokmu</p>
            </div>

            <LoginForm nextPath={searchParams?.next} />
          </div>
        </div>
      </section>
    </main>
  );
}
