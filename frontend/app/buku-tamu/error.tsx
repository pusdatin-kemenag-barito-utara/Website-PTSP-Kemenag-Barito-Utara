"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import PageBanner from "@/components/common/PageBanner";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Buku Tamu error:", error);
  }, [error]);

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col">
      <PageBanner
        title="Terjadi Kesalahan"
        description="Sistem Buku Tamu sedang mengalami gangguan"
      />
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle size={32} />
          </div>
          <h2 className="text-xl font-semibold text-slate-800 mb-2">
            Gagal Memuat Buku Tamu
          </h2>
          <p className="text-slate-600 mb-6">
            Kami mohon maaf atas ketidaknyamanan ini. Silakan coba muat ulang
            halaman.
          </p>
          <div className="flex gap-4 justify-center">
            <Button onClick={() => reset()} variant="default">
              Coba Lagi
            </Button>
            <Button
              onClick={() => (window.location.href = "/")}
              variant="outline"
            >
              Kembali ke Beranda
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
