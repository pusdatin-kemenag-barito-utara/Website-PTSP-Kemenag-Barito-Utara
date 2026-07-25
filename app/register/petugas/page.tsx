import Link from "next/link";
import { RegisterPetugasForm } from "@/components/auth/register-petugas-form";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import Image from "next/image";

export default function RegisterPetugasPage() {
  return (
    <div className="relative flex min-h-[calc(100dvh-72px)] md:min-h-[calc(100dvh-80px)] items-center justify-center py-10 px-4 sm:px-6 lg:px-8">
      {/* Background with pattern/image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/kantor-kemenag.jpg"
          alt="Kantor Kemenag Barito Utara"
          fill
          sizes="100vw"
          className="object-cover object-center opacity-20 grayscale"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#0f8a54]/95 via-[#0b7446]/95 to-[#054125]/95" />
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
      <div className="relative z-10 w-full max-w-[600px]">
        <div className="overflow-hidden rounded-3xl bg-white shadow-[0_20px_60px_-15px_rgba(0,0,0,0.4)] ring-1 ring-slate-200/50">
          
          {/* Header area */}
          <div className="relative bg-slate-50 px-8 pt-10 pb-8 text-center">
            {/* Decoration */}
            <div className="absolute left-0 top-0 h-1.5 w-full bg-gradient-to-r from-[#0f8a54] to-[#14b870]" />
            
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100/50 text-[#0f8a54] ring-8 ring-white">
              <ShieldAlert className="h-8 w-8" />
            </div>
            
            <p className="mb-2 text-[10.5px] font-black uppercase tracking-[0.2em] text-[#0f8a54]">
              Portal Internal
            </p>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
              Buat Akun Petugas
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Pendaftaran akun internal hanya untuk pegawai/staff Kemenag yang berwenang.
            </p>
          </div>

          {/* Form area */}
          <div className="px-8 py-8">
            <RegisterPetugasForm />
          </div>
          
          {/* Footer links */}
          <div className="bg-slate-50 px-8 py-5 text-center text-sm border-t border-slate-100">
            <p className="text-slate-500 font-medium">
              Sudah memiliki akun petugas?{" "}
              <Link href="/login/petugas" className="text-[#0f8a54] hover:underline font-bold transition-colors">
                Masuk di sini
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
