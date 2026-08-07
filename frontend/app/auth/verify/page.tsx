"use client";
import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Loader2 } from "lucide-react";

function VerifyContent() {
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const verify = async () => {
      const token_hash = searchParams.get("token");
      const type = searchParams.get("type") as any;
      const next = searchParams.get("next") || "/dashboard";

      if (!token_hash || type !== "magiclink") {
        setError("Link autentikasi tidak valid atau sudah kadaluarsa.");
        return;
      }

      try {
        const supabase = createClient();
        const { error } = await supabase.auth.verifyOtp({
          token_hash,
          type,
        });

        if (error) {
          setError("Gagal memverifikasi: " + error.message);
        } else {
          router.push(next);
        }
      } catch (err: any) {
        setError("Terjadi kesalahan sistem: " + err.message);
      }
    };
    verify();
  }, [router, searchParams]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center space-y-4">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-slate-900">Autentikasi Gagal</h2>
        <p className="text-slate-500 max-w-sm">{error}</p>
        <button 
          onClick={() => router.push("/")}
          className="mt-4 px-6 py-2 bg-[#10b981] text-white rounded-full font-medium hover:bg-[#059669] transition-colors"
        >
          Kembali ke Beranda
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center space-y-4">
      <Loader2 className="w-12 h-12 text-[#10b981] animate-spin" />
      <h2 className="text-xl font-bold text-slate-900">Memverifikasi Sesi...</h2>
      <p className="text-slate-500">Mohon tunggu sebentar, Anda sedang diarahkan.</p>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-10 h-10 text-[#10b981] animate-spin" />
      </div>
    }>
      <VerifyContent />
    </Suspense>
  );
}
