import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "CircleTask",
  description: "Task management kelompok berbasis bukti kerja.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="id">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL,GRAD,opsz@400,0,0,24&display=swap" rel="stylesheet" />
      </head>
      <body className="m-0 min-h-screen overflow-x-hidden bg-page-bg p-0 font-body text-body">
        {children}
      </body>
    </html>
  );
}
