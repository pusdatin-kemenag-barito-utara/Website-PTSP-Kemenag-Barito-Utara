import type { Metadata } from "next";
import Link from "next/link";
import { LoginFormByRole } from "@/components/auth/login-form-by-role";
import { UserCircle2, ArrowLeft } from "lucide-react";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Masuk Pemohon",
  description:
    "Masuk ke portal layanan PTSP Kemenag Barito Utara untuk masyarakat umum.",
};

export default function LoginPemohonPage() {
  return (
    <div className="relative flex min-h-[calc(100dvh-72px)] md:min-h-[calc(100dvh-80px)] items-center justify-center py-10 px-4 sm:px-6 lg:px-8">
      {/* Background with pattern/image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/kantor-kemenag.jpg"
          alt="Kantor Kemenag Barito Utara"
          fill
          className="object-cover object-center opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#1f4bb7]/95 via-[#1a3fa3]/95 to-[#0d2d8a]/95" />
        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      {/* Card container */}
      <div className="relative z-10 w-full max-w-[480px]">
        <div className="overflow-hidden rounded-3xl bg-white shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] ring-1 ring-slate-200/50">
          
          {/* Header area */}
          <div className="relative bg-slate-50 px-8 pt-10 pb-8 text-center">
            {/* Decoration */}
            <div className="absolute left-0 top-0 h-1.5 w-full bg-gradient-to-r from-[#1f4bb7] to-[#2b67f0]" />
            
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100/50 text-[#1f4bb7] ring-8 ring-white">
              <UserCircle2 className="h-8 w-8" />
            </div>
            
            <p className="mb-2 text-[10.5px] font-black uppercase tracking-[0.2em] text-[#1f4bb7]">
              Layanan Masyarakat
            </p>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
              Masuk Pemohon
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Silakan masuk menggunakan nomor WhatsApp Anda yang telah terdaftar.
            </p>
          </div>

          {/* Form area */}
          <div className="px-8 py-8">
            <LoginFormByRole mode="pemohon" />
            
            <div className="mt-8 flex flex-col gap-3">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-3 font-semibold text-slate-400">Belum punya akun?</span>
                </div>
              </div>
              
              <Link
                href="/register"
                className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-600 transition-colors hover:border-[#1f4bb7] hover:text-[#1f4bb7] hover:bg-blue-50/50"
              >
                Buat Akun Pemohon Baru
              </Link>
            </div>
          </div>
          
          {/* Footer links */}
          <div className="bg-slate-50 px-8 py-5 text-center text-sm border-t border-slate-100">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-sm font-medium text-slate-500">
              <Link href="/forgot-password" className="hover:text-[#1f4bb7] hover:underline transition-colors">
                Lupa password?
              </Link>
              <Link href="/login/petugas" className="flex items-center gap-1.5 hover:text-[#0f8a54] transition-colors">
                Masuk sebagai Petugas <ArrowLeft className="h-3.5 w-3.5 rotate-180" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
