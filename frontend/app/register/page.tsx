import type { Metadata } from "next";
import Link from "next/link";
import { RegisterForm } from "@/components/auth/register-form";
import { UserPlus2, ArrowLeft } from "lucide-react";
import Image from "next/image";
import { AuthCardMotion, AuthBgMotionPemohon, AuthPageSwipeMotion } from "@/components/auth/auth-motion-wrapper";

export const metadata: Metadata = {
  title: "Buat Akun Pemohon",
  description: "Daftarkan diri Anda untuk mengakses layanan administrasi PTSP online.",
};

export default async function RegisterPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const callbackUrl = searchParams?.callbackUrl;

  return (
    <div className="relative flex min-h-screen w-full bg-slate-50 overflow-hidden">
      <AuthPageSwipeMotion direction="right">
      
      {/* Desktop Back Button */}
      <Link 
        href="/"
        className="hidden lg:flex absolute top-8 right-8 z-50 items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white rounded-full text-sm font-bold shadow-xl transition-all hover:translate-x-1"
      >
        <ArrowLeft className="h-4 w-4" />
        Kembali ke PTSP
      </Link>

      {/* Left Panel: Register Form */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 lg:p-12 relative w-full">
        {/* Mobile background (only visible when right panel is hidden) */}
        <div className="absolute inset-0 z-0 lg:hidden">
           <Image
            src="/kantor-kemenag.jpg"
            alt="Kantor Kemenag"
            fill
            sizes="100vw"
            className="object-cover object-center grayscale opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-emerald-950/90 to-slate-900/95" />
        </div>

        {/* Mobile Header & Back Button */}
        <div className="lg:hidden absolute top-0 left-0 w-full p-4 sm:p-6 flex justify-between items-center z-50">
          <Link 
            href="/"
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 text-white rounded-full text-xs font-semibold shadow-lg transition-all active:scale-95"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Kembali
          </Link>
        </div>

        <AuthCardMotion className="relative z-10 w-full max-w-[420px] mt-12 sm:mt-0">
          <div className="overflow-hidden rounded-3xl sm:rounded-[2.5rem] bg-white shadow-2xl ring-1 ring-slate-200/50">
            {/* Header area */}
            <div className="px-6 sm:px-8 pt-5 sm:pt-6 pb-2 text-center">
              <div className="lg:hidden mx-auto mb-2 flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl sm:rounded-3xl bg-emerald-50 text-emerald-600 shadow-inner">
                <UserPlus2 className="h-6 w-6 sm:h-7 sm:w-7 ml-1" />
              </div>
              
              <p className="mb-1 text-[10px] sm:text-[11px] font-black uppercase tracking-[0.25em] text-[#059669]">
                Layanan Masyarakat
              </p>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
                Buat Akun Pemohon
              </h2>
              <p className="mt-1 text-xs sm:text-sm font-medium text-slate-500">
                Lengkapi data diri Anda di bawah ini.
              </p>
            </div>

            {/* Form area */}
            <div className="px-6 sm:px-8 pb-4 sm:pb-5">
              <RegisterForm callbackUrl={callbackUrl as string} />
              
              <div className="mt-3 pt-3 border-t border-slate-100 flex flex-col gap-1.5">
                <div className="relative mb-2">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-slate-200" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-3 font-semibold text-slate-400">Sudah punya akun?</span>
                  </div>
                </div>
                
                <Link
                  href={`/login/masyarakat${callbackUrl ? `?callbackUrl=${encodeURIComponent(callbackUrl as string)}` : ""}`}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-slate-200 bg-white px-4 py-2 sm:py-2.5 text-[13px] sm:text-sm font-bold text-slate-600 transition-colors hover:border-emerald-500 hover:text-[#059669] hover:bg-emerald-50/50"
                >
                  Masuk ke Akun Anda
                </Link>
              </div>
            </div>
          </div>
        </AuthCardMotion>
      </div>

      {/* Right Panel: Branding & Background (Hidden on mobile) */}
      <div className="relative hidden lg:flex lg:w-1/2 flex-col justify-between p-12 pt-24 text-right items-end">
        <div className="absolute inset-0 z-0">
          <Image
            src="/kantor-kemenag.jpg"
            alt="Kantor Kemenag Barito Utara"
            fill
            sizes="50vw"
            priority
            className="object-cover object-center grayscale"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-[#059669]/95 via-[#047857]/90 to-[#064e3b]/95" />
          <AuthBgMotionPemohon />
        </div>

        <div className="relative z-10 flex flex-col items-end">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-[#059669] shadow-xl mb-8">
            <UserPlus2 className="h-8 w-8 ml-1" />
          </div>
          <h1 className="text-4xl lg:text-5xl font-black tracking-tight text-white mb-6 leading-tight">
            Daftar <br />
            <span className="text-emerald-300">Akun Baru</span>
          </h1>
          <p className="text-lg text-emerald-50 font-medium max-w-md leading-relaxed">
            Dapatkan akses penuh ke layanan administrasi PTSP Kemenag Barito Utara dengan mendaftarkan diri Anda.
          </p>
        </div>

        <div className="relative z-10 text-emerald-100/70 text-xs font-medium tracking-wide">
          &copy; {new Date().getFullYear()} PTSP Kantor Kementerian Agama Kab. Barito Utara
        </div>
      </div>

      </AuthPageSwipeMotion>
    </div>
  );
}
