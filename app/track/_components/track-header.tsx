"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export function TrackHeader() {
  return (
    <div className="mb-10 text-center">
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-emerald-600 transition-colors"
      >
        <ChevronLeft className="h-4 w-4" />
        Kembali ke Beranda
      </Link>
      <h1 className="text-3xl font-black text-slate-900 md:text-4xl tracking-tight">
        Lacak <span className="text-emerald-600">Permohonan</span>
      </h1>
      <p className="mt-4 text-sm font-medium text-slate-500 max-w-lg mx-auto leading-relaxed">
        Gunakan fitur ini untuk mengetahui progres terbaru dari dokumen yang
        Anda ajukan di PTSP Kemenag Barito Utara.
      </p>
    </div>
  );
}
