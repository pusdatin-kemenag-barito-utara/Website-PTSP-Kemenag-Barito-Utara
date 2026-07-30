"use client";

import { useEffect } from "react";

export default function EPengaduanPage() {
  useEffect(() => {
    window.open("https://pengaduan.kemenag-baritoutara.com", "_blank");
    window.history.back();
  }, []);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-slate-600">
      <p className="text-lg font-medium">Mengarahkan ke halaman E-Pengaduan di tab baru...</p>
      <a
        href="https://pengaduan.kemenag-baritoutara.com"
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 text-emerald-600 font-semibold underline"
      >
        Klik di sini jika tab tidak terbuka secara otomatis
      </a>
    </div>
  );
}

