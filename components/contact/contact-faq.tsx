"use client";

import { useState } from "react";
import { HelpCircle, ChevronDown } from "lucide-react";
import { m, AnimatePresence } from "framer-motion";

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
  const [openIndex, setOpenIndex] = useState<number | null>(0);

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
      
      <div className="grid gap-4 md:grid-cols-2 items-start">
        {faqItems.map((item, idx) => {
          const isOpen = openIndex === idx;
          
          return (
            <div
              key={item.q}
              className={`group rounded-2xl border transition-colors cursor-pointer ${
                isOpen
                  ? "border-[#059669]/30 bg-[#059669]/5"
                  : "border-slate-100 bg-slate-50/50 hover:border-[#059669]/20 hover:bg-[#059669]/5"
              }`}
              onClick={() => setOpenIndex(isOpen ? null : idx)}
            >
              <div className="flex items-start gap-3 p-5">
                <span
                  className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-black transition-colors ${
                    isOpen
                      ? "bg-[#059669] text-white"
                      : "bg-[#059669]/10 text-[#059669]"
                  }`}
                >
                  {String(idx + 1).padStart(2, "0")}
                </span>
                
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <p
                      className={`text-sm font-bold transition-colors pt-0.5 ${
                        isOpen
                          ? "text-[#059669]"
                          : "text-slate-900 group-hover:text-[#059669]"
                      }`}
                    >
                      {item.q}
                    </p>
                    <ChevronDown
                      className={`h-4 w-4 shrink-0 mt-1 transition-transform duration-300 ${
                        isOpen ? "rotate-180 text-[#059669]" : "text-slate-400"
                      }`}
                    />
                  </div>
                  
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <m.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <p className="mt-3 text-sm leading-relaxed text-slate-600 pb-1">
                          {item.a}
                        </p>
                      </m.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
