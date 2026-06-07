import Link from "next/link";
import { RegisterForm } from "@/components/auth/register-form";
import { UserPlus2, ArrowLeft } from "lucide-react";
import Image from "next/image";
import { AuthCardMotion, AuthBgMotionPemohon } from "@/components/auth/auth-motion-wrapper";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { callbackUrl } = await searchParams;

  return (
    <div className="relative flex min-h-[calc(100dvh-72px)] md:min-h-[calc(100dvh-84px)] items-center justify-center py-10 pb-20 px-4 sm:px-6 lg:px-8">
      {/* Background with pattern/image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/kantor-kemenag.jpg"
          alt="Kantor Kemenag Barito Utara"
          fill
          className="object-cover object-center opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#059669]/95 via-[#047857]/95 to-[#064e3b]/95" />
        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        <AuthBgMotionPemohon />
      </div>

      {/* Card container */}
      <AuthCardMotion className="relative z-10 w-full max-w-[600px]">
        <div className="overflow-hidden rounded-3xl bg-white shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] ring-1 ring-slate-200/50">
          
          {/* Header area */}
          <div className="relative bg-slate-50 px-8 pt-6 pb-4 text-center">
            {/* Decoration */}
            <div className="absolute left-0 top-0 h-1.5 w-full bg-gradient-to-r from-[#059669] to-[#10b981]" />
            
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100/50 text-[#059669] ring-8 ring-white">
              <UserPlus2 className="h-8 w-8 ml-1" />
            </div>
            
            <p className="mb-2 text-[10.5px] font-black uppercase tracking-[0.2em] text-[#059669]">
              Layanan Masyarakat
            </p>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
              Buat Akun Pemohon
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Daftarkan diri Anda untuk mengakses layanan administrasi PTSP online secara mudah dan cepat.
            </p>
          </div>

          {/* Form area */}
          <div className="px-8 py-4">
            <RegisterForm callbackUrl={callbackUrl as string} />
          </div>
          
          {/* Footer links */}
          <div className="bg-slate-50 px-8 py-3 text-center text-sm border-t border-slate-100">
            <p className="text-slate-500 font-medium">
              Sudah memiliki akun?{" "}
              <Link
                href={`/login/pemohon${callbackUrl ? `?callbackUrl=${encodeURIComponent(callbackUrl as string)}` : ""}`}
                className="text-[#059669] hover:underline font-bold transition-colors"
              >
                Masuk di sini
              </Link>
            </p>
          </div>
        </div>
      </AuthCardMotion>
    </div>
  );
}
