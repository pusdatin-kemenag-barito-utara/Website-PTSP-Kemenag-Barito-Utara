import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { KeyRound, AlertTriangle, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  
  // Deteksi jika link kedaluwarsa dari query param
  const isError = !!(params.error || params.error_code || params.error_description || params["error-access_denied"]);

  return (
    <div className="relative flex min-h-[calc(100dvh-72px)] md:min-h-[calc(100dvh-80px)] items-center justify-center py-10 px-4 sm:px-6 lg:px-8">
      {/* Background with pattern/image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/kantor-kemenag.jpg"
          alt="Kantor Kemenag Barito Utara"
          fill
          priority
          className="object-cover object-center opacity-20 grayscale"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#0f8a54]/95 via-[#0b7446]/95 to-[#054125]/95" />
        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      {/* Card container */}
      <div className="relative z-10 w-full max-w-[480px]">
        <div className="overflow-hidden rounded-[2.5rem] bg-white/95 shadow-[0_30px_70px_-15px_rgba(0,0,0,0.5)] backdrop-blur-xl ring-1 ring-white/20">
          {isError ? (
            /* Expired/Error View */
            <div className="relative bg-gradient-to-b from-slate-50/80 to-white px-8 pt-12 pb-10 text-center">
              <div className="absolute left-0 top-0 h-2 w-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500" />
              
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-white text-orange-500 shadow-xl shadow-orange-500/10 ring-1 ring-slate-100 transition-transform hover:scale-110 duration-500">
                <AlertTriangle className="h-10 w-10 text-orange-500" />
              </div>

              <p className="mb-2 text-[11px] font-black uppercase tracking-[0.3em] text-orange-600">
                Link Kedaluwarsa
              </p>
              <h1 className="text-3xl font-black tracking-tight text-slate-900 drop-shadow-sm">
                Atur Ulang Gagal
              </h1>
              <p className="mt-5 text-sm font-medium text-slate-500 leading-relaxed px-2">
                Link pemulihan password Anda sudah tidak valid atau telah kedaluwarsa karena batas waktu keamanan. Silakan ajukan link atur ulang yang baru.
              </p>
              
              <div className="mt-8 px-2">
                <Link href="/forgot-password" className="block w-full">
                  <Button className="w-full h-11 text-[15px] font-bold shadow-md bg-orange-600! hover:bg-orange-700! transition-all flex items-center justify-center gap-2 rounded-xl text-white">
                    <span>Minta Link Baru</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/login/petugas" className="mt-5 block text-xs font-bold text-slate-400 hover:text-[#0f8a54] transition-colors">
                  Kembali ke Halaman Login
                </Link>
              </div>
            </div>
          ) : (
            /* Form View */
            <>
              {/* Header area */}
              <div className="relative bg-gradient-to-b from-slate-50/80 to-white px-8 pt-12 pb-8 text-center">
                {/* Decoration */}
                <div className="absolute left-0 top-0 h-2 w-full bg-gradient-to-r from-[#0f8a54] via-[#14b870] to-[#0f8a54]" />

                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-white text-[#0f8a54] shadow-xl shadow-emerald-500/10 ring-1 ring-slate-100 transition-transform hover:scale-110 duration-500">
                  <KeyRound className="h-10 w-10 text-[#0f8a54]" />
                </div>

                <p className="mb-2 text-[11px] font-black uppercase tracking-[0.3em] text-[#0f8a54]">
                  Portal Keamanan
                </p>
                <h1 className="text-3xl font-black tracking-tight text-slate-900 drop-shadow-sm">
                  Password Baru
                </h1>
                <p className="mt-3 text-sm font-medium text-slate-500 leading-relaxed">
                  Masukkan password baru Anda yang aman dan mudah diingat.
                </p>
              </div>

              {/* Form area */}
              <div className="px-8 pb-10">
                <ResetPasswordForm />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
