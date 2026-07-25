import Link from "next/link";
import {
  ShieldAlert,
  ExternalLink,
  ArrowRight,
  Search,
  HelpCircle,
  Mail,
  MapPin,
} from "lucide-react";

export function ContactChannels() {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Kanal Pengaduan */}
      <div className="rounded-[2rem] bg-white dark:bg-slate-900 p-8 shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-none border border-slate-100 dark:border-slate-800 transition-colors duration-300">
        <div className="flex items-center gap-3 mb-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-100/50 dark:border-rose-900/50">
            <ShieldAlert className="h-6 w-6 text-rose-600 dark:text-rose-400" />
          </div>
          <h2 className="text-xl font-black text-slate-900 dark:text-slate-100">Kanal Pengaduan</h2>
        </div>
        <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400 mb-6">
          Untuk pelaporan dugaan pelanggaran layanan atau penyimpangan prosedur,
          gunakan kanal resmi Whistle Blowing System (WBS) Kementerian Agama.
        </p>
        <div className="rounded-2xl border border-amber-200/60 dark:border-amber-900/40 bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-950/40 dark:to-amber-900/30 p-5">
          <p className="font-bold text-amber-900 dark:text-amber-200 text-sm">
            Whistle Blowing System (WBS)
          </p>
          <p className="mt-1 text-xs text-amber-800/80 dark:text-amber-300/80">
            Laporan Anda akan dijaga kerahasiaannya dan diproses sesuai
            mekanisme yang berlaku.
          </p>
          <a
            href="https://wbs.kemenag.go.id"
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-amber-600 hover:bg-amber-700 dark:bg-amber-600 text-white px-4 py-2.5 text-xs font-bold transition-all hover:-translate-y-0.5 shadow-md"
          >
            Buka WBS Kemenag
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>

      {/* Lokasi Kantor */}
      <div className="rounded-[2rem] bg-white dark:bg-slate-900 p-8 shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-none border border-slate-100 dark:border-slate-800 flex flex-col transition-colors duration-300">
        <div className="flex items-center gap-3 mb-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-100/50 dark:border-emerald-900/50">
            <MapPin className="h-6 w-6 text-[#059669] dark:text-emerald-400" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Lokasi Kantor</h3>
            <h2 className="text-xl font-black text-slate-900 dark:text-slate-100 leading-tight">Temukan kami di peta</h2>
          </div>
        </div>
        <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400 mb-6">
          Gunakan peta di bawah ini untuk melihat lokasi kantor, lalu buka petunjuk arah jika ingin datang langsung.
        </p>
        
        {/* Google Maps Embed */}
        <div className="w-full h-[250px] rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 mb-6 shrink-0 relative bg-slate-50 dark:bg-slate-950">
          <iframe 
            src="https://www.google.com/maps?q=Kantor+Kementerian+Agama+Kabupaten+Barito+Utara&t=&z=16&ie=UTF8&iwloc=&output=embed" 
            width="100%" 
            height="100%" 
            style={{ border: 0 }} 
            allowFullScreen 
            loading="lazy" 
            referrerPolicy="no-referrer-when-downgrade"
            title="Peta Lokasi Kantor Kemenag Barito Utara"
            className="absolute inset-0"
          ></iframe>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 mt-auto">
          <a
            href="https://www.google.com/maps/dir/?api=1&destination=Kantor+Kemenag+Barito+Utara"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-[#059669] dark:bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white transition-all hover:bg-[#047857] dark:hover:bg-emerald-500 hover:-translate-y-0.5 shadow-md hover:shadow-lg"
          >
            Petunjuk Arah
          </a>
          <a
            href="https://www.google.com/maps/search/?api=1&query=Kantor+Kemenag+Barito+Utara"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-5 py-2.5 text-sm font-bold text-slate-700 dark:text-slate-200 transition-all hover:bg-slate-50 dark:hover:bg-slate-700 hover:-translate-y-0.5"
          >
            Buka di Google Maps
          </a>
        </div>
      </div>
    </div>
  );
}
