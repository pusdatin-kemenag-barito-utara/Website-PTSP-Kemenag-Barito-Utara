import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";

const FAQ_ITEMS = [
  {
    q: "Apa itu PTSP Kemenag?",
    a: "PTSP (Pelayanan Terpadu Satu Pintu) adalah layanan terintegrasi untuk memudahkan masyarakat mengurus berbagai kebutuhan layanan Kementerian Agama secara cepat, transparan, dan terdokumentasi.",
  },
  {
    q: "Bagaimana cara mendaftar akun baru?",
    a: "Klik menu daftar, isi data akun secara lengkap, lalu verifikasi email/nomor yang digunakan. Setelah itu Anda bisa login dan membuat pengajuan layanan.",
  },
  {
    q: "Apa syarat dokumen yang dikirim?",
    a: "Setiap item layanan memiliki syarat dokumen berbeda. Periksa bagian persyaratan saat memilih item layanan. Pastikan format file dan ukuran sesuai ketentuan.",
  },
  {
    q: "Bagaimana cara melacak status layanan?",
    a: "Anda bisa memantau status di Dashboard > Riwayat Pengajuan atau melalui halaman pelacakan dengan nomor pengajuan yang sudah diterbitkan sistem.",
  },
];

export function DashboardFaq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="ptsp-card overflow-hidden">
      <div className="h-1 w-full bg-linear-to-r from-[#059669] via-[#34d399] to-[#10b981]" />
      <div className="p-4 sm:p-5">
        <div className="mb-4 flex items-center gap-2">
          <HelpCircle className="h-5 w-5 text-[#059669]" />
          <h2 className="text-xl font-bold text-slate-900">FAQ Singkat</h2>
        </div>

        <div className="space-y-2">
          {FAQ_ITEMS.map((item, index) => {
            const isOpen = openIndex === index;

            return (
              <div
                key={item.q}
                className="overflow-hidden rounded-xl border border-slate-200 bg-white"
              >
                <button
                  type="button"
                  className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  aria-expanded={isOpen}
                >
                  <span className="text-sm font-semibold text-slate-800 sm:text-base">
                    {item.q}
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 text-[#059669] transition-transform duration-300 ${
                      isOpen ? "rotate-180" : "rotate-0"
                    }`}
                  />
                </button>

                <div
                  className={`grid transition-all duration-300 ease-out ${
                    isOpen
                      ? "grid-rows-[1fr] opacity-100"
                      : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="border-t border-slate-100 bg-slate-50 px-4 py-3 text-sm leading-relaxed text-slate-600">
                      {item.a}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
