import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";

const FAQ_ITEMS = [
  {
    q: "Apa itu PTSP Kemenag?",
    a: "PTSP Kemenag adalah layanan terpadu satu pintu untuk mempermudah masyarakat mengakses berbagai layanan Kementerian Agama secara online, cepat, dan transparan.",
  },
  {
    q: "Bagaimana cara mendaftar akun baru?",
    a: "Pilih menu Daftar, isi data akun dengan lengkap, lalu lakukan verifikasi. Setelah aktif, Anda dapat login dan mengajukan layanan.",
  },
  {
    q: "Apa syarat dokumen yang dikirim?",
    a: "Syarat dokumen mengikuti item layanan yang dipilih. Pastikan format file dan ukuran maksimum sesuai ketentuan pada form pengajuan.",
  },
  {
    q: "Bagaimana cara melacak status layanan?",
    a: "Gunakan halaman Lacak Permohonan dengan kode pelacakan atau pantau langsung dari dashboard pada menu riwayat pengajuan.",
  },
];

export function SiteHomeFaq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {FAQ_ITEMS.map((item, index) => {
        const isOpen = openIndex === index;

        return (
          <div
            key={item.q}
            className={`group overflow-hidden rounded-[1.5rem] border transition-all duration-500 ${
              isOpen
                ? "border-emerald-200 bg-white shadow-[0_20px_50px_-12px_rgba(16,185,129,0.15)] scale-[1.02] z-10"
                : "border-slate-100 bg-white/50 hover:border-emerald-100 hover:bg-white hover:shadow-xl hover:shadow-emerald-500/5"
            }`}
          >
            <button
              type="button"
              className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
              onClick={() => setOpenIndex(isOpen ? null : index)}
              aria-expanded={isOpen}
            >
              <span className="flex items-center gap-4">
                <span
                  className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl transition-all duration-500 ${
                    isOpen 
                      ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 rotate-6" 
                      : "bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100"
                  }`}
                >
                  <HelpCircle className="h-5 w-5" />
                </span>
                <span className={`text-[13px] sm:text-[15px] font-black transition-colors duration-300 ${isOpen ? "text-emerald-900" : "text-slate-700"}`}>
                  {item.q}
                </span>
              </span>
              <div className={`flex h-6 w-6 items-center justify-center rounded-full transition-all duration-500 ${isOpen ? "bg-emerald-50 rotate-180" : "bg-slate-50"}`}>
                <ChevronDown
                  className={`h-4 w-4 transition-colors duration-300 ${
                    isOpen ? "text-emerald-600" : "text-slate-400"
                  }`}
                />
              </div>
            </button>

            <div
              className={`grid transition-all duration-500 ease-in-out ${
                isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
              }`}
            >
              <div className="overflow-hidden">
                <div className="border-t border-slate-50 bg-gradient-to-br from-emerald-50/30 to-white px-6 py-5">
                  <p className="text-[13px] sm:text-sm leading-relaxed text-slate-500 font-medium">
                    {item.a}
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
