import Link from "next/link";
import { ArrowRight, BadgeCheck, ShieldCheck, UserRound } from "lucide-react";

export default function LoginSelectorPage() {
  return (
    <div className="flex min-h-[calc(100vh-84px)] items-center justify-center p-6 sm:p-10 lg:p-12 relative overflow-hidden bg-gradient-to-br from-[#022c22] via-[#064e3b] to-[#047857]">
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

      <div className="relative z-10 w-full max-w-5xl">
        <div className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 backdrop-blur-md mb-4 shadow-sm">
            <BadgeCheck className="h-4 w-4 text-[#5eeaa5]" />
            <span className="text-xs font-bold uppercase tracking-wider text-white">
              Portal PTSP Kemenag
            </span>
          </div>
          <h1 className="text-4xl font-black text-white sm:text-5xl drop-shadow-sm">
            Pilih Jenis Login
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-emerald-100/90 sm:text-lg">
            Silakan masuk sesuai dengan peran Anda untuk melanjutkan. Pastikan
            Anda memilih portal yang tepat.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:gap-8">
          {/* Card Pemohon */}
          <Link
            href="/login/pemohon"
            className="group relative overflow-hidden rounded-[2rem] border border-white/15 bg-white/10 p-8 backdrop-blur-xl transition-all duration-300 hover:-translate-y-2 hover:bg-white/20 hover:shadow-[0_20px_50px_rgba(0,0,0,0.2)] hover:border-white/30"
          >
            <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[#5eeaa5]/20 blur-3xl transition-opacity group-hover:opacity-100 opacity-50" />

            <div className="relative z-10">
              <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0f8a54] to-[#0d7a4b] text-white shadow-lg shadow-green-900/30">
                <UserRound className="h-7 w-7" />
              </div>
              <h2 className="text-2xl font-black text-white">Login Pemohon</h2>
              <p className="mt-3 text-sm leading-relaxed text-emerald-50/80">
                Untuk masyarakat atau pemohon yang ingin membuat pengajuan
                layanan, melacak status, dan mengunduh dokumen hasil.
              </p>

              <ul className="mt-6 space-y-3">
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

          {/* Card Petugas */}
          <Link
            href="/login/petugas"
            className="group relative overflow-hidden rounded-[2rem] border border-white/15 bg-white/10 p-8 backdrop-blur-xl transition-all duration-300 hover:-translate-y-2 hover:bg-white/20 hover:shadow-[0_20px_50px_rgba(0,0,0,0.2)] hover:border-white/30"
          >
            <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[#f0c040]/20 blur-3xl transition-opacity group-hover:opacity-100 opacity-50" />

            <div className="relative z-10">
              <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#059669] to-[#10b981] text-white shadow-lg shadow-emerald-900/30">
                <ShieldCheck className="h-7 w-7" />
              </div>
              <h2 className="text-2xl font-black text-white">Login Petugas</h2>
              <p className="mt-3 text-sm leading-relaxed text-emerald-50/80">
                Untuk petugas internal dalam mengelola katalog layanan,
                memverifikasi berkas, dan memproses pengajuan masuk.
              </p>

              <ul className="mt-6 space-y-3">
                <li className="flex items-center gap-3 text-sm font-medium text-white/90">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10">
                    <ShieldCheck className="h-3.5 w-3.5 text-[#f0c040]" />
                  </div>
                  Verifikasi validasi data
                </li>
                <li className="flex items-center gap-3 text-sm font-medium text-white/90">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10">
                    <ShieldCheck className="h-3.5 w-3.5 text-[#f0c040]" />
                  </div>
                  Manajemen status layanan
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
        </div>

        <div className="mt-10 mx-auto max-w-xl text-center rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
          <p className="text-sm font-medium text-emerald-100">
            Belum punya akun pemohon?{" "}
            <Link
              href="/register"
              className="font-bold text-white underline decoration-white/30 underline-offset-4 transition-colors hover:text-[#5eeaa5] hover:decoration-[#5eeaa5]"
            >
              Daftar Sekarang
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
