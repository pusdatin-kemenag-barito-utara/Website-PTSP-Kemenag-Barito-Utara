import Link from "@/lib/next-compat/link";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { ShieldCheck, AlertTriangle, ArrowRight, ArrowLeft } from "lucide-react";
import Image from "@/lib/next-compat/image";
import { Button } from "@/components/ui/button";
import { AuthCardMotion, AuthBgMotionPetugas, AuthPageSwipeMotion } from "@/components/auth/auth-motion-wrapper";

export function ResetPasswordView({ isError }: { isError: boolean }) {
  return (
    <div className="relative flex min-h-screen w-full bg-slate-50 overflow-hidden">
      <AuthPageSwipeMotion direction="left">
        {/* Desktop Back Button */}
        <Link
          href="/login/petugas"
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
            {/* Indigo/Slate theme for Petugas */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/95 via-slate-900/95 to-slate-900/95" />
            <AuthBgMotionPetugas />
          </div>

          <div className="relative z-10">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-indigo-600 shadow-xl mb-8">
              <ShieldCheck className="h-8 w-8" />
            </div>
            <h1 className="text-4xl lg:text-5xl font-black tracking-tight text-white mb-6 leading-tight">
              Atur Ulang <br />
              <span className="text-indigo-400">Password</span>
            </h1>
            <p className="text-lg text-slate-300 font-medium max-w-md leading-relaxed">
              Buat password baru yang kuat untuk mengamankan akses Anda ke portal administrasi PTSP Kemenag.
            </p>
          </div>

          <div className="relative z-10 text-slate-400 text-xs font-medium tracking-wide">
            &copy; {new Date().getFullYear()} PTSP Kantor Kementerian Agama Kab. Barito Utara
          </div>
        </div>

        {/* Right Panel: Form */}
        <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 lg:p-12 relative w-full">
          {/* Mobile background (only visible when left panel is hidden) */}
          <div className="absolute inset-0 z-0 lg:hidden">
            <Image
              src="/kantor-kemenag.jpg"
              alt="Kantor Kemenag"
              fill
              className="object-cover object-center grayscale opacity-30"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-indigo-950/90 to-slate-900/95" />
          </div>

          {/* Mobile Header & Back Button */}
          <div className="lg:hidden absolute top-0 left-0 w-full p-4 sm:p-6 flex justify-between items-center z-50">
            <Link
              href="/login/petugas"
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 text-white rounded-full text-xs font-semibold shadow-lg transition-all active:scale-95"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Kembali
            </Link>
          </div>

          <AuthCardMotion className="relative z-10 w-full max-w-[420px] mt-12 sm:mt-0">
            <div className="overflow-hidden rounded-3xl sm:rounded-[2.5rem] bg-white shadow-2xl ring-1 ring-slate-200/50">
              {isError ? (
                /* Expired/Error View */
                <div className="px-6 sm:px-8 pt-10 pb-8 text-center">
                  <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-50 text-orange-500 shadow-inner">
                    <AlertTriangle className="h-8 w-8" />
                  </div>

                  <p className="mb-2 text-[10px] font-black uppercase tracking-[0.2em] text-orange-600">
                    Link Kedaluwarsa
                  </p>
                  <h2 className="text-2xl font-black tracking-tight text-slate-900">
                    Gagal Memverifikasi
                  </h2>
                  <p className="mt-3 text-sm font-medium text-slate-500 leading-relaxed">
                    Link pemulihan password Anda sudah tidak valid atau telah kedaluwarsa karena batas waktu keamanan. Silakan ajukan link atur ulang yang baru.
                  </p>

                  <div className="mt-8">
                    <Link href="/forgot-password/petugas" className="block w-full">
                      <Button className="w-full h-12 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-xl shadow-orange-500/20 font-bold tracking-wide">
                        Minta Link Baru
                      </Button>
                    </Link>
                    <Link href="/login/petugas" className="mt-4 block text-xs font-bold text-slate-400 hover:text-indigo-600 transition-colors">
                      Kembali ke Halaman Login
                    </Link>
                  </div>
                </div>
              ) : (
                /* Form View */
                <>
                  <div className="px-6 sm:px-8 pt-10 sm:pt-12 pb-6 sm:pb-8 text-center">
                    <div className="lg:hidden mx-auto mb-5 flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-2xl sm:rounded-3xl bg-indigo-50 text-indigo-600 shadow-inner">
                      <ShieldCheck className="h-8 w-8 sm:h-10 sm:w-10" />
                    </div>

                    <p className="mb-2 text-[10px] sm:text-[11px] font-black uppercase tracking-[0.25em] text-indigo-600">
                      Akses Terbatas
                    </p>
                    <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
                      Password Baru
                    </h2>
                    <p className="mt-2 sm:mt-3 text-xs sm:text-sm font-medium text-slate-500">
                      Masukkan password baru Anda yang aman dan mudah diingat.
                    </p>
                  </div>

                  <div className="px-6 sm:px-8 pb-8 sm:pb-10">
                    <ResetPasswordForm />
                  </div>
                </>
              )}
            </div>
          </AuthCardMotion>
        </div>
      </AuthPageSwipeMotion>
    </div>
  );
}