import type { Metadata } from "next";
import Link from "next/link";
import { UserCircle2, ArrowLeft } from "lucide-react";
import Image from "next/image";
import { AuthCardMotion, AuthBgMotionPemohon, AuthPageSwipeMotion } from "@/components/auth/auth-motion-wrapper";
import { PemohonLengkapiWaForm } from "@/components/auth/pemohon-lengkapi-wa-form";

export const metadata: Metadata = {
  title: "Lengkapi Data Pemohon",
  description: "Lengkapi data profil pemohon untuk masuk ke portal layanan PTSP.",
};

export default function LengkapiWaPage() {
  return (
    <div className="relative flex min-h-screen w-full bg-slate-50 overflow-hidden">
      <AuthPageSwipeMotion direction="left">
      {/* Desktop Back Button */}
      <Link 
        href="/login/pemohon"
        className="hidden lg:flex absolute top-8 left-8 z-50 items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white rounded-full text-sm font-bold shadow-xl transition-all hover:-translate-x-1"
      >
        <ArrowLeft className="h-4 w-4" />
        Kembali ke Login
      </Link>

      {/* Left Panel: Branding & Background (Hidden on mobile) */}
      <div className="relative hidden lg:flex lg:w-1/2 flex-col justify-between p-12 pt-24">
        <div className="absolute inset-0 z-0">
          <Image
            src="/kantor-kemenag.jpg"
            alt="Kantor Kemenag Barito Utara"
            fill
            priority
            className="object-cover object-center grayscale"
          />
          {/* Teal/Ocean theme for Pemohon */}
          <div className="absolute inset-0 bg-gradient-to-br from-teal-900/95 via-cyan-900/90 to-teal-800/95" />
          <AuthBgMotionPemohon />
        </div>

        <div className="relative z-10">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-teal-600 shadow-xl mb-8">
            <UserCircle2 className="h-8 w-8" />
          </div>
          <h1 className="text-4xl lg:text-5xl font-black tracking-tight text-white mb-6 leading-tight">
            Data Belum <br />
            <span className="text-teal-300">Lengkap</span>
          </h1>
          <p className="text-lg text-teal-50 font-medium max-w-md leading-relaxed">
            Untuk melanjutkan masuk via Google, silakan lengkapi data profil Anda.
          </p>
        </div>

        <div className="relative z-10 text-teal-100/70 text-xs font-medium tracking-wide">
          &copy; {new Date().getFullYear()} PTSP Kantor Kementerian Agama Kab. Barito Utara
        </div>
      </div>

      {/* Right Panel: Form */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 lg:p-12 relative w-full">
        {/* Mobile background */}
        <div className="absolute inset-0 z-0 lg:hidden">
           <Image
            src="/kantor-kemenag.jpg"
            alt="Kantor Kemenag"
            fill
            className="object-cover object-center grayscale opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-teal-950/90 to-slate-900/95" />
        </div>

        <AuthCardMotion className="relative z-10 w-full max-w-[420px] mt-12 sm:mt-0">
          <div className="overflow-hidden rounded-3xl sm:rounded-[2.5rem] bg-white shadow-2xl ring-1 ring-slate-200/50">
            {/* Header area */}
            <div className="px-6 sm:px-8 pt-6 sm:pt-8 pb-3 sm:pb-4 text-center">
              <div className="lg:hidden mx-auto mb-3 flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl sm:rounded-3xl bg-teal-50 text-teal-600 shadow-inner">
                <UserCircle2 className="h-7 w-7 sm:h-8 sm:w-8" />
              </div>
              
              <p className="mb-1 text-[10px] sm:text-[11px] font-black uppercase tracking-[0.25em] text-teal-600">
                Layanan Masyarakat
              </p>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
                Lengkapi Profil
              </h2>
            </div>

            {/* Form area */}
            <div className="px-6 sm:px-8 pb-5 sm:pb-6">
              <PemohonLengkapiWaForm />
            </div>
          </div>
        </AuthCardMotion>
      </div>
      </AuthPageSwipeMotion>
    </div>
  );
}
