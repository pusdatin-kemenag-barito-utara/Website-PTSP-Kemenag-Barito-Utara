import Link from "next/link";
import { FileClock, ShieldCheck, ArrowRight } from "lucide-react";

export function TrackFeatures() {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      <div className="rounded-[2rem] bg-white p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-slate-100 transition-all hover:-translate-y-1 hover:shadow-xl">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-[#1f4bb7]">
          <FileClock className="h-7 w-7" />
        </div>
        <h3 className="text-lg font-bold text-slate-900">Status Real-time</h3>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          Pantau progres permohonan Anda detik demi detik secara langsung tanpa
          perlu repot datang ke kantor Kemenag.
        </p>
      </div>
      <div className="rounded-[2rem] bg-white p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-slate-100 transition-all hover:-translate-y-1 hover:shadow-xl">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
          <ShieldCheck className="h-7 w-7" />
        </div>
        <h3 className="text-lg font-bold text-slate-900">100% Transparan</h3>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          Setiap perubahan status dan riwayat tindakan dicatat dengan transparan
          sehingga Anda selalu mendapat kepastian layanan.
        </p>
      </div>
      <div className="rounded-[2rem] bg-white p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-slate-100 transition-all hover:-translate-y-1 hover:shadow-xl">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
          <ArrowRight className="h-7 w-7" />
        </div>
        <h3 className="text-lg font-bold text-slate-900">Butuh Bantuan?</h3>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          Jika Anda mengalami kendala saat mengajukan atau melacak permohonan,
          tim bantuan kami siap membantu Anda.
        </p>
        <Link
          href="/kontak"
          className="mt-4 inline-flex font-bold text-emerald-600 hover:text-emerald-700"
        >
          Hubungi CS Kami
        </Link>
      </div>
    </div>
  );
}
