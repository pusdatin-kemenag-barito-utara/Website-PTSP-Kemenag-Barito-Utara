import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, UserCircle2 } from "lucide-react";
import Image from "next/image";
import { AuthCardMotion, AuthBgMotionPemohon, AuthPageSwipeMotion } from "@/components/auth/auth-motion-wrapper";
import { PemohonResetForm } from "@/components/auth/pemohon-reset-form";

export const metadata: Metadata = {
  title: "Lupa Password Pemohon",
  description:
    "Pemulihan password untuk pemohon layanan PTSP Kemenag Barito Utara.",
};

export default async function ForgotPasswordPemohonPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const callbackUrl = searchParams?.callbackUrl;
  const cbQuery = callbackUrl ? `?callbackUrl=${encodeURIComponent(callbackUrl as string)}` : "";

  return (
    <div className="relative flex min-h-screen w-full bg-slate-50 overflow-hidden">
      <AuthPageSwipeMotion direction="left">
      {/* Desktop Back Button */}
      <Link 
        href={`/forgot-password${cbQuery}`}
        className="hidden lg:flex absolute top-8 left-8 z-50 items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white rounded-full text-sm font-bold shadow-xl transition-all hover:-translate-x-1"
      >
        <ArrowLeft className="h-4 w-4" />
        Kembali
      </Link>

      {/* Left Panel: Branding & Background (Hidden on mobile) */}
      <div className="relative hidden lg:flex lg:w-1/2 flex-col justify-between p-12 pt-24">
        <div className="absolute inset-0 z-0">
          <Image
            src="/kantor-kemenag.jpg"
            alt="Kantor Kemenag Barito Utara"
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
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
            Pemulihan <br />
            <span className="text-teal-300">Password</span>
          </h1>
          <p className="text-lg text-teal-50 font-medium max-w-md leading-relaxed">
            Verifikasi nomor WhatsApp terdaftar Anda untuk mengatur ulang kata sandi dan kembali mengakses portal layanan.
          </p>
        </div>

        <div className="relative z-10 text-teal-100/70 text-xs font-medium tracking-wide">
          &copy; {new Date().getFullYear()} PTSP Kantor Kementerian Agama Kab. Barito Utara
        </div>
      </div>

      {/* Right Panel: Login Form */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 lg:p-12 relative w-full">
        {/* Mobile background (only visible when left panel is hidden) */}
        <div className="absolute inset-0 z-0 lg:hidden">
           <Image
            src="/kantor-kemenag.jpg"
            alt="Kantor Kemenag"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center grayscale opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-teal-950/90 to-slate-900/95" />
        </div>

        {/* Mobile Header & Back Button */}
        <div className="lg:hidden absolute top-0 left-0 w-full p-4 sm:p-6 flex justify-between items-center z-50">
          <Link 
            href={`/forgot-password${cbQuery}`}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 text-white rounded-full text-xs font-semibold shadow-lg transition-all active:scale-95"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Kembali
          </Link>
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
                Lupa Password
              </h2>
            </div>

            {/* Form area */}
            <div className="px-6 sm:px-8 pb-5 sm:pb-6">
              <PemohonResetForm />
              
              <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col gap-2">
                <div className="relative mb-2">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-slate-200" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-3 font-semibold text-slate-400">Atau</span>
                  </div>
                </div>
                
                <Link
                  href={`/login/pemohon${cbQuery}`}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-slate-200 bg-white px-4 py-2.5 sm:py-3 text-[13px] sm:text-sm font-bold text-slate-600 transition-colors hover:border-teal-500 hover:text-teal-600 hover:bg-teal-50/50"
                >
                  Kembali ke Halaman Login
                </Link>
              </div>
            </div>
          </div>
        </AuthCardMotion>
      </div>
      </AuthPageSwipeMotion>
    </div>
  );
}
