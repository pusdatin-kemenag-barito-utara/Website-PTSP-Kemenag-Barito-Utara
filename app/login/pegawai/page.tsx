import Link from "next/link";
import { LoginFormByRole } from "@/components/auth/login-form-by-role";
import { UserCircle2, ArrowLeft } from "lucide-react";
import Image from "next/image";
import { AuthCardMotion, AuthBgMotionPetugas } from "@/components/auth/auth-motion-wrapper";

export default async function LoginPegawaiPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { callbackUrl, nip } = await searchParams;

  return (
    <div className="relative flex min-h-[calc(100dvh-72px)] md:min-h-[calc(100dvh-80px)] items-center justify-center py-10 pb-20 px-4 sm:px-6 lg:px-8">
      {/* Background with pattern/image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/kantor-kemenag.jpg"
          alt="Kantor Kemenag Barito Utara"
          fill
          priority
          className="object-cover object-center opacity-20 grayscale"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#047857]/95 via-[#059669]/95 to-[#064e3b]/95" />
        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        <AuthBgMotionPetugas />
      </div>

      {/* Card container */}
      <AuthCardMotion className="relative z-10 w-full max-w-[480px]">
        <div className="overflow-hidden rounded-[2.5rem] bg-white/95 shadow-[0_30px_70px_-15px_rgba(0,0,0,0.5)] backdrop-blur-xl ring-1 ring-white/20">
          {/* Header area */}
          <div className="relative bg-gradient-to-b from-slate-50/80 to-white px-8 pt-12 pb-8 text-center">
            {/* Decoration */}
            <div className="absolute left-0 top-0 h-2 w-full bg-gradient-to-r from-[#047857] via-[#059669] to-[#047857]" />

            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-white text-[#047857] shadow-xl shadow-emerald-500/10 ring-1 ring-slate-100 transition-transform hover:scale-110 duration-500">
              <UserCircle2 className="h-10 w-10" />
            </div>

            <p className="mb-2 text-[11px] font-black uppercase tracking-[0.3em] text-[#047857]">
              Portal Pegawai
            </p>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 drop-shadow-sm">
              Masuk Pegawai
            </h1>
            <p className="mt-3 text-sm font-medium text-slate-500 leading-relaxed">
              Silakan masuk menggunakan NIP Anda untuk mengakses sistem pegawai.
            </p>
          </div>

          {/* Form area */}
          <div className="px-8 pb-6">
            <LoginFormByRole
              mode="pegawai"
              callbackUrl={callbackUrl as string}
              nip={nip as string}
            />
          </div>

          {/* Footer links */}
          <div className="bg-slate-50/50 px-8 py-4 text-center border-t border-slate-50">
            <div className="flex items-center justify-center text-xs font-bold uppercase tracking-wider text-slate-400">
              <Link
                href={`/login/pemohon${callbackUrl ? `?callbackUrl=${encodeURIComponent(callbackUrl as string)}` : ""}`}
                className="flex items-center gap-2 hover:text-[#059669] transition-all hover:-translate-x-1"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Kembali
              </Link>
            </div>
          </div>
        </div>
      </AuthCardMotion>
    </div>
  );
}
