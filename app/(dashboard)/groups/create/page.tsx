"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function CreateGroupPage() {
  const router = useRouter();
  
  const [groupName, setGroupName] = useState("");
  const [courseName, setCourseName] = useState("");
  const [deadline, setDeadline] = useState("");
  const [colorTheme, setColorTheme] = useState("mint");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const colorMap: Record<string, string> = {
    mint: "bg-mint-strong",
    pink: "bg-pastel-pink",
    lavender: "bg-pastel-lavender",
    yellow: "bg-pastel-yellow",
    blue: "bg-pastel-blue",
  };

  const formattedDate = deadline
    ? new Date(deadline).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "TBD";

  const handleCreate = () => {
    setIsModalOpen(true);
  };

  return (
    <>
      <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto pb-8">
        {/* Page Header */}
        <div>
          <h1 className="font-heading-lg text-heading-lg text-text-primary mb-2">Buat Kelompok Baru</h1>
          <p className="font-body text-body text-text-secondary max-w-2xl">Buat ruang kerja kelompok, undang anggota, lalu mulai bagi task.</p>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-section-gap">
          {/* Left Column: Main Form Area */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            {/* Form Card */}
            <div className="bg-surface-card rounded-[24px] p-8 border border-border-subtle shadow-sm flex flex-col gap-6">
              {/* Nama Kelompok */}
              <div className="flex flex-col gap-2">
                <label className="font-label text-label text-text-primary" htmlFor="group-name">Nama Kelompok</label>
                <input
                  id="group-name"
                  type="text"
                  placeholder="Contoh: Kelompok AI Praktikum"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  className="w-full h-12 bg-surface-main border border-border-subtle rounded-[18px] px-4 font-body text-body text-text-primary placeholder:text-text-soft focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-inner-soft"
                />
              </div>

              {/* Deskripsi */}
              <div className="flex flex-col gap-2">
                <label className="font-label text-label text-text-primary" htmlFor="group-desc">Deskripsi</label>
                <textarea
                  id="group-desc"
                  rows={3}
                  placeholder="Tuliskan tujuan..."
                  className="w-full bg-surface-main border border-border-subtle rounded-[18px] p-4 font-body text-body text-text-primary placeholder:text-text-soft focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-inner-soft resize-none"
                />
              </div>

              {/* Mata Kuliah & Deadline Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="font-label text-label text-text-primary" htmlFor="course-name">Mata Kuliah</label>
                  <input
                    id="course-name"
                    type="text"
                    placeholder="Contoh: Artificial Intelligence"
                    value={courseName}
                    onChange={(e) => setCourseName(e.target.value)}
                    className="w-full h-12 bg-surface-main border border-border-subtle rounded-[18px] px-4 font-body text-body text-text-primary placeholder:text-text-soft focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-inner-soft"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-label text-label text-text-primary" htmlFor="deadline-date">Deadline Umum</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <span className="material-symbols-outlined text-text-soft text-[20px]">calendar_today</span>
                    </div>
                    <input
                      id="deadline-date"
                      type="date"
                      value={deadline}
                      onChange={(e) => setDeadline(e.target.value)}
                      className="w-full h-12 bg-surface-main border border-border-subtle rounded-[18px] pl-11 pr-4 font-body text-body text-text-primary text-text-soft focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-inner-soft"
                    />
                  </div>
                </div>
              </div>

              {/* Warna Kelompok */}
              <div className="flex flex-col gap-3 mt-2">
                <label className="font-label text-label text-text-primary">Warna Kelompok</label>
                <div className="flex gap-4">
                  {Object.keys(colorMap).map((color) => (
                    <label key={color} className="relative cursor-pointer group">
                      <input
                        type="radio"
                        name="color-theme"
                        value={color}
                        checked={colorTheme === color}
                        onChange={() => setColorTheme(color)}
                        className="peer sr-only"
                      />
                      <div className={`w-10 h-10 rounded-full ${colorMap[color]} border-2 border-transparent peer-checked:border-primary peer-checked:ring-2 peer-checked:ring-offset-2 peer-checked:ring-${colorMap[color]} transition-all flex items-center justify-center`}>
                        <span className="material-symbols-outlined text-primary text-sm opacity-0 peer-checked:opacity-100 transition-opacity font-bold">check</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Role Info Card & CTA Row */}
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="flex-1 bg-surface-container-low rounded-[20px] p-5 border border-border-subtle flex gap-4 items-start">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-on-primary text-[20px]">shield_person</span>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-label text-[10px] uppercase tracking-wider bg-tertiary text-on-tertiary px-2 py-1 rounded-full">Ketua</span>
                    <h3 className="font-heading-sm text-body text-text-primary">Kamu akan menjadi Ketua Kelompok</h3>
                  </div>
                  <p className="font-body-sm text-body-sm text-text-secondary mt-1">
                    Sebagai ketua, kamu bisa membuat project, membagi task, review bukti pekerjaan, reassign task, melihat kontribusi, dan export laporan.
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-3 shrink-0 md:w-48 mt-4 md:mt-0 self-end">
                <button
                  type="button"
                  onClick={handleCreate}
                  className="w-full h-12 bg-primary text-on-primary font-button text-button rounded-full hover:bg-inverse-surface active:scale-95 transition-all shadow-md flex justify-center items-center gap-2"
                >
                  Buat Kelompok
                </button>
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="w-full h-12 bg-surface-card text-text-primary border border-border-subtle font-button text-button rounded-full hover:bg-surface-container-low active:scale-95 transition-all"
                >
                  Batal
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Preview & Join Code */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="bg-surface-card rounded-[24px] p-6 border border-border-subtle shadow-sm flex flex-col gap-5 sticky top-0">
              <h3 className="font-label text-label text-text-secondary uppercase tracking-wider mb-2 flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px]">visibility</span>
                Preview Tampilan
              </h3>

              <div className={`${colorMap[colorTheme]} rounded-[20px] p-5 shadow-sm transition-colors duration-300 relative overflow-hidden`}>
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/20 rounded-full blur-xl"></div>
                
                <div className="flex justify-between items-start mb-6 relative z-10">
                  <div className="bg-primary/10 text-primary px-3 py-1 rounded-full font-label text-[10px] uppercase tracking-wider font-bold backdrop-blur-sm border border-primary/20">
                    {courseName || "Mata Kuliah"}
                  </div>
                  <span className="font-label text-[10px] bg-tertiary text-on-tertiary px-2 py-1 rounded-full shadow-sm">Ketua</span>
                </div>
                
                <h4 className="font-heading-md text-heading-md text-primary mb-1 relative z-10 leading-tight">
                  {groupName || "Nama Kelompok"}
                </h4>
                
                <p className="font-body-sm text-body-sm text-secondary/80 mb-6 relative z-10 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                  <span>{formattedDate}</span>
                </p>
                
                <div className="flex justify-between items-center relative z-10 p-3 bg-white/40 backdrop-blur-md rounded-xl border border-white/50">
                  <div className="flex flex-col">
                    <span className="font-label text-[10px] text-secondary uppercase tracking-wider mb-1">Anggota</span>
                    <span className="font-heading-sm text-primary">1</span>
                  </div>
                  <div className="w-px h-8 bg-primary/20"></div>
                  <div className="flex flex-col">
                    <span className="font-label text-[10px] text-secondary uppercase tracking-wider mb-1">Projects</span>
                    <span className="font-heading-sm text-primary">0</span>
                  </div>
                  <div className="w-px h-8 bg-primary/20"></div>
                  <div className="flex flex-col">
                    <span className="font-label text-[10px] text-secondary uppercase tracking-wider mb-1">Progress</span>
                    <span className="font-heading-sm text-primary">0%</span>
                  </div>
                </div>
              </div>

              <div className="bg-surface-container-low rounded-xl p-4 border border-border-subtle border-dashed flex items-center justify-center text-center">
                <p className="font-body-sm text-text-soft text-body-sm italic flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px]">inbox</span>
                  Belum ada project...
                </p>
              </div>
            </div>

            <div className="bg-surface-card rounded-[24px] p-6 border border-border-subtle shadow-sm">
              <h3 className="font-heading-sm text-heading-sm text-text-primary mb-1">Kode Join</h3>
              <p className="font-body-sm text-body-sm text-text-secondary mb-4">Kode Join akan dibuat otomatis setelah kelompok disimpan.</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-surface-container-low border border-border-subtle border-dashed rounded-xl h-12 flex items-center justify-center">
                  <span className="font-display text-[18px] text-text-soft opacity-50 tracking-widest blur-[2px]">CT-AI24</span>
                </div>
                <button className="w-12 h-12 bg-surface-container rounded-xl flex items-center justify-center text-text-soft cursor-not-allowed border border-border-subtle" disabled>
                  <span className="material-symbols-outlined">content_copy</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Success Modal Overlay */}
      <div 
        className={`fixed inset-0 bg-primary/40 backdrop-blur-sm z-50 items-center justify-center transition-all duration-300 ${isModalOpen ? "opacity-100 flex" : "opacity-0 hidden"}`}
      >
        <div className={`bg-surface-card w-full max-w-md rounded-[32px] p-8 shadow-2xl flex flex-col items-center text-center transform transition-transform duration-300 ${isModalOpen ? "scale-100" : "scale-95"}`}>
          <div className="w-20 h-20 bg-mint-strong rounded-full flex items-center justify-center mb-6 shadow-sm">
            <span className="material-symbols-outlined text-primary text-[40px]">celebration</span>
          </div>
          <h2 className="font-heading-md text-heading-md text-text-primary mb-2">Kelompok Berhasil Dibuat!</h2>
          <p className="font-body text-body text-text-secondary mb-8 px-4">Bagikan kode ini kepada teman-temanmu agar mereka bisa bergabung.</p>
          
          <div className="w-full bg-surface-main border border-border-subtle rounded-[20px] p-6 mb-8 relative">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-surface-card px-3 font-label text-[10px] uppercase tracking-widest text-text-secondary rounded-full border border-border-subtle">Kode Join</span>
            <div className="font-display text-[32px] text-primary tracking-widest font-bold">CT-AI24</div>
          </div>
          
          <div className="w-full flex flex-col gap-3">
            <button type="button" className="w-full h-12 bg-surface-container-low text-text-primary border border-border-subtle font-button text-button rounded-full hover:bg-surface-container-high active:scale-95 transition-all flex justify-center items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">content_copy</span>
              Copy Code
            </button>
            <button 
              type="button" 
              onClick={() => setIsModalOpen(false)}
              className="w-full h-12 bg-primary text-on-primary font-button text-button rounded-full hover:bg-inverse-surface active:scale-95 transition-all shadow-md"
            >
              Masuk ke Dashboard Kelompok
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
