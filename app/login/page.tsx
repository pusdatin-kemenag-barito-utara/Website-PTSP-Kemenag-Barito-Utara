import Link from "next/link";
import { ArrowRight, BadgeCheck, ShieldCheck, UserRound, Briefcase, ArrowLeft } from "lucide-react";
import {
  MotionDiv,
  fadeUpVariants,
  staggerContainerVariants,
  springPopVariants,
} from "@/components/common/MotionDiv";

export default async function LoginSelectorPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { callbackUrl } = await searchParams;
  const cbQuery = callbackUrl
    ? `?callbackUrl=${encodeURIComponent(callbackUrl as string)}`
    : "";

  return (
    <div className="flex min-h-[calc(100vh-84px)] items-center justify-center px-4 py-16 sm:p-10 lg:p-12 relative overflow-hidden bg-gradient-to-br from-[#022c22] via-[#064e3b] to-[#047857]">
      <Link
        href="/"
        className="absolute top-4 left-4 md:top-10 md:left-10 z-50 group flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-emerald-50 backdrop-blur-md transition-all hover:bg-white/10 hover:text-white"
      >
        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
        Kembali ke Beranda
      </Link>
      
      {/* Background Effects */}
      <div
        className="absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
      <div className="pointer-events-none absolute -left-20 -top-20 h-96 w-96 rounded-full bg-[#059669]/40 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-20 -right-20 h-96 w-96 rounded-full bg-[#5eeaa5]/20 blur-[120px]" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/5 blur-[120px]" />

      <MotionDiv 
        variants={staggerContainerVariants}
        initial="hidden"
        animate="show"
        className="relative z-10 w-full max-w-5xl mt-12 md:mt-0"
      >
        <MotionDiv variants={fadeUpVariants} className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 backdrop-blur-md mb-4 shadow-sm">
            <BadgeCheck className="h-4 w-4 text-[#5eeaa5]" />
            <span className="text-xs font-bold uppercase tracking-wider text-white">
              Portal PTSP SI ATAK
            </span>
          </div>
          <h1 className="text-4xl font-black text-white sm:text-5xl drop-shadow-sm">
            Pilih Jenis Login
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-emerald-100/90 sm:text-lg">
            Silakan masuk sesuai dengan peran Anda untuk melanjutkan. Pastikan
            Anda memilih portal yang tepat.
          </p>
        </MotionDiv>

        <div className="grid gap-6 md:grid-cols-2 lg:gap-8">
          {/* Card Pemohon */}
          <MotionDiv variants={springPopVariants} className="h-full">
            <Link
              href={`/login/pemohon${cbQuery}`}
              className="group relative h-full flex flex-col overflow-hidden rounded-[2rem] border border-white/15 bg-white/10 p-8 backdrop-blur-xl transition-all duration-300 hover:-translate-y-2 hover:bg-white/20 hover:shadow-[0_20px_50px_rgba(0,0,0,0.2)] hover:border-white/30"
            >
              <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[#5eeaa5]/20 blur-3xl transition-opacity group-hover:opacity-100 opacity-50" />

              <div className="relative z-10 flex flex-col h-full">
                <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0f8a54] to-[#0d7a4b] text-white shadow-lg shadow-green-900/30">
                  <UserRound className="h-7 w-7" />
                </div>
                <h2 className="text-2xl font-black text-white">
                  Login Pemohon
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-emerald-50/80">
                  Untuk masyarakat atau pemohon yang ingin membuat pengajuan
                  layanan, melacak status, dan mengunduh dokumen hasil.
                </p>

                <ul className="mt-6 space-y-3 flex-grow">
                  <li className="flex items-center gap-3 text-sm font-medium text-white/90">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10">
                      <ShieldCheck className="h-3.5 w-3.5 text-[#5eeaa5]" />
                    </div>
                    Ajukan layanan online
                  </li>
                  <li className="flex items-center gap-3 text-sm font-medium text-white/90">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10">
                      <ShieldCheck className="h-3.5 w-3.5 text-[#5eeaa5]" />
                    </div>
                    Pantau progres pengajuan
                  </li>
                </ul>

                <div className="mt-8 flex items-center justify-between border-t border-white/15 pt-6">
                  <span className="text-sm font-bold text-white transition-colors group-hover:text-[#5eeaa5]">
                    Masuk Sekarang
                  </span>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-all group-hover:bg-[#5eeaa5] group-hover:text-slate-900 group-hover:translate-x-2">
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </div>
              </div>
            </Link>
          </MotionDiv>

          {/* Card Pegawai */}
          <MotionDiv variants={springPopVariants} className="h-full">
            <Link
              href={`/login/pegawai${cbQuery}`}
              className="group relative h-full flex flex-col overflow-hidden rounded-[2rem] border border-white/15 bg-white/10 p-8 backdrop-blur-xl transition-all duration-300 hover:-translate-y-2 hover:bg-white/20 hover:shadow-[0_20px_50px_rgba(0,0,0,0.2)] hover:border-white/30"
            >
              <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[#f0c040]/20 blur-3xl transition-opacity group-hover:opacity-100 opacity-50" />

              <div className="relative z-10 flex flex-col h-full">
                <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#059669] to-[#10b981] text-white shadow-lg shadow-emerald-900/30">
                  <Briefcase className="h-7 w-7" />
                </div>
                <h2 className="text-2xl font-black text-white">
                  Login Pegawai
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-emerald-50/80">
                  Untuk pegawai atau ASN internal yang ingin membuat pengajuan layanan khusus kepegawaian, melacak status, dan mengunduh dokumen hasil.
                </p>

                <ul className="mt-6 space-y-3 flex-grow">
                  <li className="flex items-center gap-3 text-sm font-medium text-white/90">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10">
                      <BadgeCheck className="h-3.5 w-3.5 text-[#f0c040]" />
                    </div>
                    Ajukan layanan kepegawaian
                  </li>
                  <li className="flex items-center gap-3 text-sm font-medium text-white/90">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10">
                      <BadgeCheck className="h-3.5 w-3.5 text-[#f0c040]" />
                    </div>
                    Pantau progres pengajuan ASN
                  </li>
                </ul>

                <div className="mt-8 flex items-center justify-between border-t border-white/15 pt-6">
                  <span className="text-sm font-bold text-white transition-colors group-hover:text-[#f0c040]">
                    Masuk Sekarang
                  </span>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-all group-hover:bg-[#f0c040] group-hover:text-slate-900 group-hover:translate-x-2">
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </div>
              </div>
            </Link>
          </MotionDiv>
        </div>

        <MotionDiv
          variants={fadeUpVariants}
          className="mt-10 mx-auto max-w-xl text-center rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm"
        >
          <p className="text-sm font-medium text-emerald-100">
            Belum punya akun pemohon?{" "}
            <Link
              href={`/register${cbQuery}`}
              className="relative font-bold text-white transition-colors hover:text-[#5eeaa5] after:absolute after:left-0 after:bottom-[-2px] after:h-[2px] after:w-full after:origin-bottom-right after:scale-x-0 after:bg-[#5eeaa5] after:transition-transform after:duration-300 hover:after:origin-bottom-left hover:after:scale-x-100"
            >
              Daftar Sekarang
            </Link>
          </p>
        </MotionDiv>
      </MotionDiv>
    </div>
  );
}
