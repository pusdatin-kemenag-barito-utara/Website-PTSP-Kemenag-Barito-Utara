import Image from "next/image";
import { ServerCrash, ShieldCheck } from "lucide-react";
import { getMaintenanceStatus } from "@/lib/actions/system/maintenance";
import { MotionDiv, springPopVariants, fadeUpVariants, staggerContainerVariants } from "@/components/common/MotionDiv";

export const dynamic = "force-dynamic";

export default async function MaintenancePage() {
  const status = await getMaintenanceStatus();
  
  // Custom message dari admin, atau gunakan pesan bawaan
  const message = status.message || "Kami sedang melakukan pemeliharaan berkala untuk meningkatkan kualitas layanan. Silakan kembali beberapa saat lagi.";

  return (
    <div className="relative min-h-dvh w-full flex flex-col items-center justify-between overflow-hidden bg-slate-50 font-sans">
      {/* Background Orbs & Effects */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 h-[500px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-[100%] bg-emerald-500/15 blur-[80px]" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-40 [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
      </div>

      <MotionDiv 
        variants={staggerContainerVariants}
        initial="hidden"
        animate="show"
        className="relative z-10 w-full max-w-2xl p-4 sm:p-6 lg:p-8 flex flex-col items-center text-center mt-auto mb-auto"
      >
        {/* Kemenag Branding */}
        <MotionDiv variants={fadeUpVariants} className="flex flex-col items-center mb-8 sm:mb-10">
          <div className="relative flex h-24 w-24 sm:h-28 sm:w-28 items-center justify-center rounded-3xl bg-white shadow-xl shadow-emerald-900/10 mb-6 border border-emerald-100">
            <Image
              src="/kemenag.svg"
              alt="Logo Kemenag"
              width={64}
              height={64}
              className="object-contain w-16 h-16 sm:w-20 sm:h-20"
              style={{ width: "auto", height: "auto" }}
              priority
              loading="eager"
            />
          </div>
          <h2 className="text-[12px] sm:text-[15px] font-black tracking-[0.15em] text-emerald-800 uppercase">
            Kementerian Agama Republik Indonesia
          </h2>
          <h3 className="text-[9.5px] sm:text-[12px] font-bold tracking-widest text-emerald-600/80 mt-1.5 uppercase">
            Kantor Kabupaten Barito Utara
          </h3>
        </MotionDiv>

        {/* Main Content Card */}
        <MotionDiv variants={springPopVariants} className="w-full rounded-[2rem] border border-slate-200/60 bg-white/80 p-8 sm:p-12 backdrop-blur-xl shadow-2xl shadow-emerald-900/5 relative overflow-hidden">
          {/* Subtle gradient line on top of card */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 to-teal-400" />

          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-amber-500 ring-1 ring-amber-500/20">
            <ServerCrash className="h-8 w-8" />
          </div>
          
          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight mb-4">
            Sistem Dalam Pemeliharaan
          </h1>
          
          <p className="mx-auto max-w-lg text-sm sm:text-base text-slate-600 font-medium leading-relaxed mb-8">
            {message}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <div className="flex items-center gap-2.5 rounded-full border border-slate-200 bg-slate-50 px-5 py-2.5 text-xs sm:text-sm font-bold text-slate-700 shadow-sm">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
              </span>
              Sedang Dalam Pengerjaan
            </div>
            
            <div className="flex items-center gap-2.5 rounded-full border border-slate-200 bg-slate-50 px-5 py-2.5 text-xs sm:text-sm font-bold text-slate-700 shadow-sm">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              Data Anda Tetap Aman
            </div>
          </div>
        </MotionDiv>
      </MotionDiv>

      {/* Footer info (pushed down) */}
      <MotionDiv 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.8 }}
        className="relative z-10 w-full pb-8 pt-12 text-center text-[11px] sm:text-xs font-semibold text-slate-400"
      >
        &copy; {new Date().getFullYear()} PTSP Kemenag Barito Utara. Hak Cipta Dilindungi.
      </MotionDiv>
    </div>
  );
}
