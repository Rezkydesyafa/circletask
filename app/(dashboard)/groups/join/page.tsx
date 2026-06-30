"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function JoinGroupPage() {
  const router = useRouter();
  const [joinCode, setJoinCode] = useState("CT-AI24");
  const [isCodeValid, setIsCodeValid] = useState(false);

  const handleCheckCode = () => {
    // Mock validation logic
    if (joinCode.trim().length > 0) {
      setIsCodeValid(true);
    } else {
      setIsCodeValid(false);
    }
  };

  return (
    <div className="flex flex-col w-full max-w-7xl mx-auto pb-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="font-heading-lg text-heading-lg text-text-primary mb-2">Gabung Kelompok</h1>
        <p className="font-body text-text-secondary mt-2">
          Masukkan kode undangan dari ketua kelompok untuk mulai mengerjakan task.
        </p>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-section-gap">
        {/* Left Column: Join Form (Span 5) */}
        <div className="lg:col-span-5 flex flex-col gap-card-gap">
          {/* Join Form Card */}
          <div className="bg-surface-card rounded-[24px] p-6 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.05)] border border-border-subtle">
            <label className="block font-label text-text-primary mb-2" htmlFor="joinCode">
              Kode Join
            </label>
            <div className="relative mb-2">
              <input
                id="joinCode"
                type="text"
                placeholder="Contoh: CT-AI24"
                value={joinCode}
                onChange={(e) => {
                  setJoinCode(e.target.value);
                  setIsCodeValid(false); // Reset validation when user types
                }}
                className="w-full px-4 py-3 bg-surface-container-low border border-border-subtle rounded-xl font-body text-text-primary focus:outline-none focus:ring-2 focus:ring-primary transition-shadow uppercase font-bold tracking-wider"
              />
              {isCodeValid && (
                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-mint-strong">
                  check_circle
                </span>
              )}
            </div>
            <p className="font-body-sm text-text-soft mb-8 flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">info</span>
              Minta kode ini dari ketua kelompok.
            </p>

            <div className="flex flex-col gap-3">
              <button 
                type="button"
                className="w-full py-3 bg-primary text-on-primary font-button rounded-full hover:opacity-90 transition-opacity"
              >
                Gabung Kelompok
              </button>
              <button 
                type="button"
                onClick={handleCheckCode}
                className="w-full py-3 bg-white text-text-primary border border-border-subtle font-button rounded-full hover:bg-surface-container-low transition-colors"
              >
                Cek Kode
              </button>
            </div>
          </div>

          {/* Step Guide Small Cards */}
          <div className="grid grid-cols-1 gap-3 mt-4">
            <div className={`bg-surface-card rounded-xl p-4 flex items-center gap-4 border ${isCodeValid ? 'border-border-subtle opacity-50' : 'border-border-subtle border-l-4 border-l-primary shadow-sm'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-label ${isCodeValid ? 'bg-surface-container text-text-primary' : 'bg-primary text-on-primary'}`}>
                1
              </div>
              <span className={`font-body text-text-primary ${isCodeValid ? '' : 'font-bold'}`}>Masukkan kode</span>
              {isCodeValid && <span className="material-symbols-outlined ml-auto text-mint-strong">check</span>}
            </div>

            <div className={`bg-surface-card rounded-xl p-4 flex items-center gap-4 border ${isCodeValid ? 'border-border-subtle border-l-4 border-l-primary shadow-sm' : 'border-border-subtle opacity-50'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-label ${isCodeValid ? 'bg-primary text-on-primary' : 'bg-surface-container text-text-primary'}`}>
                2
              </div>
              <span className={`font-body text-text-primary ${isCodeValid ? 'font-bold' : ''}`}>Gabung ke kelompok</span>
            </div>

            <div className="bg-surface-card rounded-xl p-4 flex items-center gap-4 border border-border-subtle opacity-50">
              <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center font-label text-text-primary">
                3
              </div>
              <span className="font-body text-text-primary">Kerjakan task</span>
            </div>
          </div>
        </div>

        {/* Right Column: Validation Preview (Span 7) */}
        <div className="lg:col-span-7 flex flex-col gap-card-gap">
          {isCodeValid ? (
            /* Validation Success Card (Glassmorphism) */
            <div className="relative bg-pastel-blue rounded-[24px] p-6 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.05)] border border-pastel-blue/50 overflow-hidden">
              {/* Abstract graphic element */}
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/30 rounded-full blur-2xl"></div>

              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                    <span className="material-symbols-outlined text-primary">verified</span>
                  </div>
                  <h3 className="font-heading-sm text-text-primary">Kelompok ditemukan</h3>
                </div>

                <div className="bg-white/80 backdrop-blur-md rounded-xl p-5 border border-white mb-6">
                  <h4 className="font-heading-sm text-text-primary mb-1">Enterprise Architecture</h4>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="px-2 py-1 bg-mint-strong/50 text-secondary rounded text-[11px] font-bold uppercase tracking-wide">
                      Aktif
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="font-label text-text-soft mb-1">Ketua Kelompok</p>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full overflow-hidden bg-surface-container">
                          <img 
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDhXcXxdoNm1CD0lpQTrUa_QjDlnvyzOJbK3nSAp-ifKWwJjlR1mq6GJfrLwJpt3iNfziT6cQSyKYolKEcKoZiC6PekJTL35qX2DfAYeaDd_bsPF7NjZN85w-4qYjdLpvoTYJhmgG_wdJoiXsrzvJpKUHc4oMyT_UVoaKg7scsCKHpLYfhKuFFgPcVZgTr9lO6LF11MP8k2t04TbOZ3UPTbCsmbe0N5PvJjBduWcjRnihdqLPCCTkkSKEXHacmTCH5YDAjuZt3IZ-d_"
                            alt="Ketua"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <span className="font-body text-text-primary">Annette Black</span>
                      </div>
                    </div>
                    <div>
                      <p className="font-label text-text-soft mb-1">Statistik</p>
                      <p className="font-body text-text-primary">5 Anggota • 2 Project</p>
                    </div>
                  </div>
                </div>

                {/* Role Info Card Nested */}
                <div className="bg-white rounded-xl p-5 border border-border-subtle flex items-start gap-4">
                  <div className="mt-1">
                    <span className="px-3 py-1 bg-pastel-lavender text-text-primary rounded-full font-label border border-pastel-lavender/50">
                      Anggota
                    </span>
                  </div>
                  <div>
                    <h5 className="font-label text-text-primary text-base mb-1">Kamu akan bergabung sebagai Anggota</h5>
                    <p className="font-body-sm text-text-secondary leading-relaxed">
                      Sebagai anggota, kamu bisa melihat project, mengerjakan task, upload bukti, submit review, dan melihat kontribusi sendiri.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Empty State for Validation */
            <div className="h-full bg-surface-container-low rounded-[24px] border border-border-subtle border-dashed flex flex-col items-center justify-center p-8 text-center min-h-[300px]">
              <div className="w-16 h-16 bg-surface-container rounded-full flex items-center justify-center mb-4 text-text-soft">
                <span className="material-symbols-outlined text-[32px]">search</span>
              </div>
              <h3 className="font-heading-sm text-text-primary mb-2">Belum Ada Kelompok</h3>
              <p className="font-body-sm text-text-secondary max-w-sm">
                Masukkan kode join dan klik "Cek Kode" untuk melihat detail kelompok sebelum bergabung.
              </p>
            </div>
          )}

          {/* Helper Note */}
          <div className="mt-auto pt-4 flex items-start gap-2 text-text-soft">
            <span className="material-symbols-outlined text-[18px]">lightbulb</span>
            <p className="font-body-sm">
              Satu akun tetap bisa menjadi ketua di kelompok lain. Role ditentukan per workspace.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Action Row */}
      <div className="mt-12 pt-6 border-t border-border-subtle flex flex-col sm:flex-row justify-end gap-4">
        <button 
          onClick={() => router.back()}
          className="px-6 py-3 bg-white text-text-primary border border-border-subtle font-button rounded-full hover:bg-surface-container-low transition-colors"
        >
          Kembali ke Dashboard
        </button>
        {/* Duplicate CTA for emphasis at page bottom */}
        <button className="px-8 py-3 bg-primary text-on-primary font-button rounded-full hover:bg-tertiary-container transition-colors shadow-md">
          Gabung Kelompok
        </button>
      </div>

      {/* Mockup Error States (Visual Only for reference as requested) */}
      <div className="mt-16 opacity-40">
        <h6 className="font-label text-text-secondary mb-4 uppercase tracking-wider">Error States Preview</h6>
        <div className="flex gap-4 flex-wrap">
          <div className="px-4 py-2 bg-error-container text-on-error-container rounded-lg font-body-sm border border-error/20 flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px]">error</span> Kode tidak valid
          </div>
          <div className="px-4 py-2 bg-pastel-yellow/50 text-text-primary rounded-lg font-body-sm border border-pastel-yellow flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px]">warning</span> Kamu sudah tergabung di kelompok ini
          </div>
          <div className="px-4 py-2 bg-surface-container-high text-text-secondary rounded-lg font-body-sm border border-border-subtle flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px]">block</span> Kode sudah tidak aktif
          </div>
        </div>
      </div>
    </div>
  );
}
