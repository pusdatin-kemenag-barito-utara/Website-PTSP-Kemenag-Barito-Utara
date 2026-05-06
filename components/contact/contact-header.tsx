import { MessageCircle } from "lucide-react";

export function ContactHeader() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#0d2d8a] via-[#1f4bb7] to-[#1a53c8] pt-12 pb-24 md:pt-16 md:pb-32">
      <div
        className="absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
      <div className="pointer-events-none absolute -left-20 -top-20 h-96 w-96 rounded-full bg-white/10 blur-[100px]" />
      <div className="pointer-events-none absolute -bottom-20 -right-20 h-80 w-80 rounded-full bg-[#5eeaa5]/20 blur-[100px]" />

      <div className="relative z-10 mx-auto w-full max-w-5xl px-6 sm:px-10 lg:px-12 text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-white shadow-sm backdrop-blur-md mb-4">
          <MessageCircle className="h-4 w-4 text-[#5eeaa5]" />
          Kontak PTSP
        </span>
        <h1 className="text-4xl font-black leading-tight text-white sm:text-5xl md:text-6xl drop-shadow-sm">
          Hubungi Kami
        </h1>
        <p className="mt-4 text-base leading-relaxed text-blue-100/90 sm:text-lg max-w-2xl mx-auto">
          Silakan hubungi kami untuk pertanyaan terkait pengajuan layanan,
          dokumen persyaratan, atau kendala teknis pada portal PTSP.
        </p>
      </div>
    </section>
  );
}
