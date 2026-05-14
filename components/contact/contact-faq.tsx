import { HelpCircle } from "lucide-react";

const faqItems = [
  {
    q: "Bagaimana cara melacak status layanan?",
    a: "Masuk ke menu Lacak Layanan lalu masukkan nomor pengajuan yang Anda terima saat mendaftar. Status akan diperbarui secara real-time.",
  },
  {
    q: "Apakah semua layanan harus melalui akun?",
    a: "Ya, untuk menjaga keamanan data pribadi dan memudahkan pelacakan histori pengajuan, seluruh pemohon wajib login terlebih dahulu.",
  },
  {
    q: "Bagaimana jika dokumen saya ditolak?",
    a: "Petugas akan memberikan catatan revisi atau alasan penolakan yang bisa Anda lihat di dashboard pemohon. Anda dapat memperbaiki dan mengirim ulang dokumen.",
  },
  {
    q: "Berapa lama proses pengajuan berlangsung?",
    a: "Durasi proses bergantung pada jenis layanan. Anda dapat memantau progres secara langsung melalui menu Lacak Layanan.",
  },
];

export function ContactFaq() {
  return (
    <div className="rounded-[2rem] bg-white p-8 sm:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-slate-100">
      <div className="flex items-center gap-3 mb-8">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#059669]/10">
          <HelpCircle className="h-6 w-6 text-[#059669]" />
        </div>
        <div>
          <h2 className="text-xl font-black text-slate-900">
            Pertanyaan Umum (FAQ)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Jawaban atas pertanyaan yang paling sering diajukan
          </p>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {faqItems.map((item, idx) => (
          <div
            key={item.q}
            className="group rounded-2xl border border-slate-100 bg-slate-50/50 p-5 transition-colors hover:border-[#059669]/20 hover:bg-[#059669]/5"
          >
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#059669]/10 text-xs font-black text-[#059669]">
                {String(idx + 1).padStart(2, "0")}
              </span>
              <div>
                <p className="text-sm font-bold text-slate-900 group-hover:text-[#059669] transition-colors">
                  {item.q}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  {item.a}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
