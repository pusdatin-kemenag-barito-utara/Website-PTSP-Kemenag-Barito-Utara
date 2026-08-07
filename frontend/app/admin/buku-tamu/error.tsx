"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function AdminErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Admin Buku Tamu error:", error);
  }, [error]);

  return (
    <div className="flex-1 flex items-center justify-center p-6 w-full h-[60vh]">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertCircle size={32} />
        </div>
        <h2 className="text-xl font-semibold text-slate-800 mb-2">
          Gagal Memuat Modul
        </h2>
        <p className="text-slate-600 mb-6">
          Terjadi kesalahan saat memuat data Buku Tamu. Silakan coba lagi.
        </p>
        <div className="flex gap-4 justify-center">
          <Button onClick={() => reset()} variant="default">
            Coba Lagi
          </Button>
          <Button
            onClick={() => (window.location.href = "/admin")}
            variant="outline"
          >
            Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
