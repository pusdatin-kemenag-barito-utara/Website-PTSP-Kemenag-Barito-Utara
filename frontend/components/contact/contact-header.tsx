import { MessageCircle, Sparkles } from "lucide-react";

export function ContactHeader() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#064e3b] via-[#059669] to-[#047857] pt-24 pb-40 md:pt-32 md:pb-52 shadow-[0_20px_50px_-20px_rgba(4,120,87,0.4)]">
      {/* Subtle Grid & Glow */}
      <div
        className="absolute inset-0 opacity-[0.1]"
        style={{
          backgroundImage: "radial-gradient(circle at 2px 2px, rgba(255,255,255,1) 1px, transparent 0)",
          backgroundSize: "40px 40px",
        }}
      />
      <div className="pointer-events-none absolute -left-20 -top-20 h-96 w-96 rounded-full bg-white/10 blur-[120px] animate-pulse" />
      <div className="pointer-events-none absolute -bottom-20 -right-20 h-80 w-80 rounded-full bg-[#5eeaa5]/20 blur-[100px]" />

      <div className="relative z-10 mx-auto w-full px-6 sm:px-10 lg:px-20 xl:px-24 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-5 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-white shadow-lg backdrop-blur-md mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <MessageCircle className="h-4 w-4 text-[#5eeaa5]" />
          Layanan Bantuan & Support
        </div>
        
        <h1 className="text-4xl font-black leading-[1.1] text-white sm:text-6xl md:text-7xl tracking-tight mb-6">
          Hubungi <span className="text-emerald-300">Tim Kami</span>
        </h1>
        
        <p className="max-w-3xl text-base leading-relaxed text-emerald-50/80 sm:text-xl font-medium mx-auto px-4">
          Silakan hubungi kami untuk pertanyaan terkait pengajuan layanan, dokumen persyaratan, atau kendala teknis pada portal PTSP. Kami siap melayani Anda sepenuh hati.
        </p>
      </div>
    </section>
  );
}
