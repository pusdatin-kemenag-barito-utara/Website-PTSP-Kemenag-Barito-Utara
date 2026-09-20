import Link from "@/lib/next-compat/link";
import { RegisterForm } from "@/components/auth/register-form";
import { UserPlus2, ArrowLeft } from "lucide-react";
import Image from "@/lib/next-compat/image";
import { AuthCardMotion, AuthBgMotionPemohon, AuthPageSwipeMotion } from "@/components/auth/auth-motion-wrapper";

export function RegisterView({ callbackUrl }: { callbackUrl?: string }) {
  return (
    <div className="relative flex min-h-screen lg:h-screen w-full bg-slate-50 overflow-hidden">
      <AuthPageSwipeMotion direction="right">
        {/* Desktop Back Button */}
        <Link
          href="/"
          className="hidden lg:flex absolute top-6 right-6 z-50 items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white rounded-full text-xs font-bold shadow-lg transition-all hover:translate-x-0.5"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Kembali ke PTSP
        </Link>

        {/* Left Panel: Register Form */}
        <div className="flex-1 flex flex-col items-center justify-center p-3 sm:p-6 relative w-full lg:h-full lg:overflow-hidden">
          {/* Mobile background (only visible when right panel is hidden) */}
          <div className="absolute inset-0 z-0 lg:hidden">
            <Image
              src="/kantor-kemenag.webp"
              alt="Kantor Kemenag"
              fill
              sizes="100vw"
              className="object-cover object-center grayscale opacity-30"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-emerald-950/90 to-slate-900/95" />
          </div>

          {/* Mobile Header & Back Button */}
          <div className="lg:hidden absolute top-0 left-0 w-full p-4 flex justify-between items-center z-50">
            <Link
              href="/"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 text-white rounded-full text-xs font-semibold shadow-md transition-all active:scale-95"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Kembali
            </Link>
          </div>

          <AuthCardMotion className="relative z-10 w-full max-w-[400px] my-auto">
            <div className="overflow-hidden rounded-2xl sm:rounded-3xl bg-white shadow-xl ring-1 ring-slate-200/70">
              {/* Header area */}
              <div className="px-5 sm:px-6 pt-4 sm:pt-5 pb-1 text-center">
                <div className="lg:hidden mx-auto mb-1.5 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 shadow-2xs">
                  <UserPlus2 className="h-5 w-5 ml-0.5" />
                </div>

                <p className="mb-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                  Layanan Masyarakat
                </p>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                  Buat Akun Pemohon
                </h2>
                <p className="mt-0.5 text-xs font-medium text-slate-500">
                  Lengkapi data diri Anda di bawah ini.
                </p>
              </div>

              {/* Form area */}
              <div className="px-5 sm:px-6 pb-4 pt-1">
                <RegisterForm callbackUrl={callbackUrl} />

                <div className="mt-2.5 pt-2.5 border-t border-slate-100 text-center">
                  <p className="text-xs text-slate-500 font-medium">
                    Sudah punya akun?{" "}
                    <Link
                      href={`/login/masyarakat${callbackUrl ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : ""}`}
                      className="font-bold text-emerald-700 hover:text-emerald-800 hover:underline transition-colors"
                    >
                      Masuk di sini
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </AuthCardMotion>
        </div>

        {/* Right Panel: Branding & Background (Hidden on mobile) */}
        <div className="relative hidden lg:flex lg:w-1/2 flex-col justify-between p-8 xl:p-12 text-right items-end lg:h-full">
          <div className="absolute inset-0 z-0">
            <Image
              src="/kantor-kemenag.webp"
              alt="Kantor Kemenag Barito Utara"
              fill
              sizes="50vw"
              priority
              className="object-cover object-center grayscale"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-[#059669]/95 via-[#047857]/90 to-[#064e3b]/95" />
            <AuthBgMotionPemohon />
          </div>

          <div className="relative z-10 flex flex-col items-end my-auto">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-emerald-700 shadow-xl mb-6">
              <UserPlus2 className="h-7 w-7 ml-0.5" />
            </div>
            <h1 className="text-3xl lg:text-4xl font-black tracking-tight text-white mb-4 leading-tight">
              Daftar <br />
              <span className="text-emerald-300">Akun Baru</span>
            </h1>
            <p className="text-sm lg:text-base text-emerald-50 font-medium max-w-md leading-relaxed">
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