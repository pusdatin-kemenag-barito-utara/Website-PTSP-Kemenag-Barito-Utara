import type { Metadata } from "next";
import Link from "next/link";
import { LoginFormByRole } from "@/components/auth/login-form-by-role";
import { UserCircle2, ArrowLeft } from "lucide-react";
import Image from "next/image";
import {
  AuthCardMotion,
  AuthBgMotionPemohon,
  AuthPageSwipeMotion,
} from "@/components/auth/auth-motion-wrapper";

export const metadata: Metadata = {
  title: "Masuk Portal Pemohon Masyarakat",
  description:
    "Masuk ke portal layanan PTSP Kemenag Barito Utara untuk masyarakat umum.",
};

export default async function LoginMasyarakatPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const callbackUrl = searchParams?.callbackUrl;
  const error = searchParams?.error;

  return (
    <div className="relative flex min-h-screen w-full bg-slate-50 overflow-hidden">
      <AuthPageSwipeMotion direction="left">
        {/* Desktop Back Button */}
        <Link
          href="/"
          className="hidden lg:flex absolute top-8 left-8 z-50 items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white rounded-full text-sm font-bold shadow-xl transition-all hover:-translate-x-1"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke PTSP
        </Link>

        {/* Left Panel: Branding & Background (Hidden on mobile) */}
        <div className="relative hidden lg:flex lg:w-1/2 flex-col justify-between p-12 pt-24">
          <div className="absolute inset-0 z-0">
            <Image
              src="/kantor-kemenag.jpg"
              alt="Kantor Kemenag Barito Utara"
              fill
              sizes="50vw"
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
              Portal Masyarakat <br />
              <span className="text-teal-300">PTSP Kemenag</span>
            </h1>
            <p className="text-lg text-teal-50 font-medium max-w-md leading-relaxed">
              Ajukan layanan administrasi keagamaan secara online dengan cepat,
              mudah, dan transparan.
            </p>
          </div>

          <div className="relative z-10 pt-8 border-t border-teal-500/30 flex items-center justify-between text-xs text-teal-200">
            <span>
              &copy; {new Date().getFullYear()} Kantor Kemenag Kabupaten Barito
              Utara
            </span>
            <span className="font-semibold text-teal-100">
              Sistem Informasi PTSP
            </span>
          </div>
        </div>

        {/* Right Panel: Login Form */}
        <div className="flex w-full lg:w-1/2 items-center justify-center p-6 sm:p-12 lg:p-16 bg-white overflow-y-auto">
          <AuthCardMotion className="w-full max-w-md space-y-8 py-8">
            <div className="lg:hidden text-center mb-6">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-emerald-600 mb-6 transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Kembali ke PTSP
              </Link>
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 text-teal-600 shadow-md mb-3">
                <UserCircle2 className="h-7 w-7" />
              </div>
            </div>

            <div className="space-y-3 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 rounded-full bg-teal-50 border border-teal-200/80 px-3.5 py-1 text-[11px] font-black text-teal-700 uppercase tracking-widest">
                <UserCircle2 className="h-3.5 w-3.5 text-teal-600" />
                <span>Portal Layanan Masyarakat</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 leading-tight">
                Masuk ke Portal Pemohon
              </h2>
              <p className="text-sm font-medium text-slate-500">
                Gunakan Nomor WhatsApp dan Password terdaftar Anda untuk
                mengakses layanan.
              </p>
            </div>

            <LoginFormByRole
              mode="pemohon"
              callbackUrl={
                typeof callbackUrl === "string" ? callbackUrl : "/masyarakat"
              }
              initialError={typeof error === "string" ? error : ""}
            />

            <div className="border-t border-slate-100 pt-6 text-center text-xs font-semibold text-slate-500">
              Belum punya akun pemohon?{" "}
              <Link
                href="/register"
                className="text-teal-600 hover:text-teal-700 font-bold underline underline-offset-4"
              >
                Daftar Akun Baru
              </Link>
            </div>
          </AuthCardMotion>
        </div>
      </AuthPageSwipeMotion>
    </div>
  );
}
