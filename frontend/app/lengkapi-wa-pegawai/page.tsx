import { Metadata } from "next";
import { requireAuth } from "@/lib/auth";
import { PegawaiLengkapiWaForm } from "@/components/auth/pegawai-lengkapi-wa-form";
import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { signOutAction } from "@/lib/actions/auth/sign-out";

export const metadata: Metadata = {
  title: "Lengkapi Profil Pegawai | PTSP Kemenag Barito Utara",
  description: "Lengkapi nomor WhatsApp profil pegawai",
};

export default async function LengkapiWaPegawaiPage() {
  const profile = await requireAuth(true); // allow incomplete profile

  if (profile.role === "user") {
    redirect("/lengkapi-profil");
  }

  // Jika sudah ada phone, redirect ke dashboard
  if (profile.phone) {
    redirect("/admin");
  }

  return (
    <div className="flex min-h-screen bg-slate-50 relative overflow-hidden">
      {/* Background Ornaments */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-[#047857]/5 to-transparent -z-10" />
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#047857]/5 blur-3xl -z-10" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-500/5 blur-3xl -z-10" />

      {/* Left Panel: Branding (Visible only on desktop) */}
      <div className="hidden lg:flex lg:flex-1 relative bg-gradient-to-br from-[#047857] via-[#059669] to-[#0f766e] flex-col justify-center items-start p-12 lg:p-24 overflow-hidden">
        {/* Desktop Back Button */}
        <div className="absolute top-8 left-8 z-50">
          <form action={signOutAction.bind(null, "/login/pegawai")}>
            <button 
              type="submit"
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 text-white rounded-full text-sm font-semibold shadow-lg transition-all active:scale-95"
            >
              <ArrowLeft className="h-4 w-4" />
              Kembali ke Login
            </button>
          </form>
        </div>

        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/kantor-kemenag.jpg"
            alt="Kantor Kemenag Barito Utara"
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover object-center grayscale opacity-10 mix-blend-overlay"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-teal-950/80 via-emerald-900/60 to-transparent" />
        </div>

        <div className="relative z-10 w-full max-w-xl">
          <div className="mb-8 p-4 bg-white/10 backdrop-blur-md rounded-2xl w-max border border-white/20 shadow-2xl">
            <div className="h-12 w-12 flex items-center justify-center bg-white rounded-xl shadow-inner">
              <span className="text-2xl font-black bg-gradient-to-br from-[#047857] to-[#0f766e] bg-clip-text text-transparent">
                P
              </span>
            </div>
          </div>
          <h1 className="text-4xl lg:text-5xl font-black text-white mb-6 leading-tight drop-shadow-lg">
            Satu Langkah Lagi
            <br />
            <span className="text-emerald-300">Menuju Dashboard</span>
          </h1>
          <p className="text-lg text-emerald-50 leading-relaxed max-w-md font-medium opacity-90 drop-shadow">
            Sistem membutuhkan nomor WhatsApp aktif Anda untuk mengamankan akun dan keperluan verifikasi Lupa Password di masa depan.
          </p>
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
            priority
            sizes="100vw"
            className="object-cover object-center grayscale opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-teal-950/90 to-slate-900/95" />
        </div>

        {/* Mobile Header & Back Button */}
        <div className="lg:hidden absolute top-0 left-0 w-full p-4 sm:p-6 flex justify-between items-center z-50">
          <form action={signOutAction.bind(null, "/login/pegawai")}>
            <button 
              type="submit"
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 text-white rounded-full text-xs font-semibold shadow-lg transition-all active:scale-95"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Kembali
            </button>
          </form>
        </div>

        <div className="relative z-10 w-full max-w-[420px] mt-12 sm:mt-0">
          <div className="overflow-hidden rounded-3xl sm:rounded-[2.5rem] bg-white shadow-2xl ring-1 ring-slate-200/50">
            <div className="p-6 sm:p-8">
              <PegawaiLengkapiWaForm />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
