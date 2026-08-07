import { Search, CheckCircle2, Clock, FileCheck2, ChevronRight } from "lucide-react";

export function HomeTrackSection() {
  return (
    <section className="py-20 md:py-32 relative overflow-hidden">
      <div className="mx-auto w-full px-6 sm:px-10 lg:px-20 xl:px-24">
        <div className="relative overflow-hidden rounded-[3rem] bg-gradient-to-br from-[#064e3b] via-[#059669] to-[#047857] p-8 md:p-16 lg:p-24 shadow-[0_30px_100px_-20px_rgba(4,120,87,0.3)]">
          {/* Subtle Grid Overlay */}
          <div
            className="absolute inset-0 opacity-[0.1]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 2px 2px, rgba(255,255,255,1) 1px, transparent 0)",
              backgroundSize: "32px 32px",
            }}
          />
          
          {/* Animated Glow Elements */}
          <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-emerald-400/20 blur-[120px] animate-pulse" />
          <div className="pointer-events-none absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-emerald-300/10 blur-[100px]" />

          <div className="relative z-10 grid items-center gap-16 lg:grid-cols-[1fr_auto]">
            <div className="max-w-2xl">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-5 py-2 backdrop-blur-md">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-[10px] font-black text-white/90 uppercase tracking-[0.2em]">
                  Lacak Permohonan
                </span>
              </div>
              
              <h2 className="text-4xl font-black text-white md:text-5xl lg:text-6xl tracking-tight leading-[1.1]">
                Pantau <span className="text-emerald-300">Status</span> <br className="hidden md:block" /> Layanan Anda
              </h2>
              
              <p className="mt-6 text-base text-emerald-50/70 md:text-lg font-medium leading-relaxed">
                Masukkan nomor pendaftaran Anda untuk mendapatkan pembaruan status pemrosesan dokumen secara instan dan real-time.
              </p>

              <form
                action="/track"
                method="get"
                className="mt-10 group relative flex flex-col gap-4 sm:flex-row sm:items-center"
              >
                <div className="relative flex-1">
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 flex items-center gap-3">
                    <Search className="h-5 w-5 text-white/50 group-focus-within:text-emerald-300 transition-colors duration-300" />
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black text-emerald-300 select-none tracking-tight">
                        PTSP-{new Date().getFullYear()}-
                      </span>
                      <div className="h-3 w-[1.5px] bg-white/20 rounded-full" />
                    </div>
                  </div>
                  <input
                    type="text"
                    name="q"
                    autoComplete="off"
                    placeholder="000123"
                    className="w-full rounded-[1.5rem] border border-white/10 bg-white/10 py-5 pl-[9.8rem] pr-6 text-base font-black text-white placeholder-white/20 backdrop-blur-xl transition-all duration-300 focus:border-emerald-300/50 focus:bg-white/15 focus:outline-none focus:ring-4 focus:ring-emerald-500/10"
                  />
                </div>
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-3 rounded-[1.5rem] bg-white px-10 py-5 text-[15px] font-black text-[#064e3b] shadow-[0_15px_30px_-5px_rgba(255,255,255,0.2)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_-5px_rgba(255,255,255,0.3)] hover:bg-emerald-50 active:scale-95 sm:flex-shrink-0"
                >
                  Cari Sekarang
                  <ChevronRight className="h-4 w-4" />
                </button>
              </form>

              <div className="mt-8 flex flex-wrap gap-4">
                {[
                  {
                    icon: CheckCircle2,
                    text: "Sistem Terpusat",
                    color: "bg-emerald-400/10 text-emerald-300",
                  },
                  {
                    icon: Clock,
                    text: "Update 24/7",
                    color: "bg-emerald-400/10 text-emerald-300",
                  },
                  {
                    icon: FileCheck2,
                    text: "Output Digital",
                    color: "bg-emerald-400/10 text-emerald-300",
                  },
                ].map(({ icon: Icon, text, color }) => (
                  <span
                    key={text}
                    className={`inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2 text-[11px] font-black uppercase tracking-wider ${color} backdrop-blur-sm transition-all duration-300 hover:bg-white/5`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {text}
                  </span>
                ))}
              </div>
            </div>

            {/* Premium Vertical Status Visual */}
            <div className="hidden xl:flex flex-col gap-6 relative p-8 rounded-[2.5rem] bg-white/5 border border-white/10 backdrop-blur-xl">
              <div className="absolute left-[39px] top-12 bottom-12 w-0.5 bg-gradient-to-b from-emerald-400/40 via-emerald-400/20 to-transparent" />
              
              {[
                { step: "Verifikasi Berkas", status: "done", time: "Selesai" },
                { step: "Proses Validasi", status: "active", time: "Sedang Berjalan" },
                { step: "Penerbitan SK", status: "pending", time: "Antrian" },
              ].map(({ step, status, time }, i) => (
                <div
                  key={step}
                  className="flex items-start gap-4 relative z-10 group"
                >
                  <div
                    className={`mt-1 h-6 w-6 flex-shrink-0 rounded-full border-4 border-[#064e3b] shadow-lg transition-all duration-500 ${
                      status === "done"
                        ? "bg-emerald-400 shadow-emerald-400/40"
                        : status === "active"
                          ? "bg-emerald-300 animate-pulse shadow-emerald-300/40"
                          : "bg-white/20 border-white/10"
                    }`}
                  />
                  <div className="flex flex-col">
                    <span
                      className={`text-sm font-black transition-colors duration-300 ${status === "pending" ? "text-white/30" : "text-white"}`}
                    >
                      {step}
                    </span>
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${status === "active" ? "text-emerald-200" : status === "done" ? "text-emerald-300" : "text-white/20"}`}>
                      {time}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
