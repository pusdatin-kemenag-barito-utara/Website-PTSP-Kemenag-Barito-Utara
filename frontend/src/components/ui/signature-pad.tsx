import { useEffect } from "react";
import QRCode from "react-qr-code";
import { ShieldCheck } from "lucide-react";

interface SignaturePadProps {
  onSave?: (base64: string) => void;
  className?: string;
  nip?: string;
  nama?: string;
}

import { motion as m } from "framer-motion";

export function SignaturePad({ onSave, className = "", nip = "", nama = "" }: SignaturePadProps) {
  useEffect(() => {
    // Secara otomatis menyimpan data TTE (Tanda Tangan Elektronik)
    if (onSave && nip) {
      onSave(`TTE_VERIFIED:${nip}:${nama}`);
    }
  }, [nip, nama, onSave]);

  if (!nip) {
    return (
      <div className={`w-full h-48 bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center ${className}`}>
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400 text-sm font-medium">Menunggu NIP diisi...</p>
        </div>
      </div>
    );
  }

  return (
    <m.div 
      initial={{ opacity: 0, scale: 0.95, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className={`relative flex flex-col gap-2 ${className}`}
    >
      <div className="w-full bg-emerald-50/50 border border-emerald-200 rounded-xl overflow-hidden relative transition-colors p-3 sm:p-4 flex flex-col items-center justify-center gap-2 hover:border-emerald-300">
        
        {/* Dekorasi Background */}
        <div className="absolute top-0 right-0 -mt-6 -mr-6 w-20 h-20 sm:w-24 sm:h-24 bg-emerald-500/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-0 left-0 -mb-6 -ml-6 w-20 h-20 sm:w-24 sm:h-24 bg-emerald-500/10 rounded-full blur-xl"></div>

        <div className="relative bg-white p-2 rounded-xl shadow-sm border border-emerald-100 group transition-transform hover:scale-105">
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 mx-auto">
            <QRCode 
              value={`TTE-KEMENAG-BARUT-${nip}-${nama}`} 
              size={96} 
              level="H" 
              fgColor="#047857" 
              style={{ width: "100%", height: "100%" }}
              className="rounded-lg"
            />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="bg-white p-1 rounded-full shadow-sm">
                <img src="/kemenag.svg" alt="Kemenag" className="w-4 h-4 sm:w-5 sm:h-5 object-contain" />
              </div>
            </div>
          </div>
        </div>
        
        <div className="text-center relative z-10 w-full px-1">
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 shrink-0" />
            <p className="text-emerald-700 font-black text-[11px] sm:text-[12px] tracking-tight leading-tight">Tanda Tangan Valid</p>
          </div>
          <p className="text-emerald-600/80 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider mb-2">PTSP Kemenag Barut</p>
          
          <div className="inline-flex items-center justify-center gap-1.5 bg-white px-2 py-1 rounded-lg border border-slate-200/60 shadow-sm max-w-full">
            <span className="text-slate-400 text-[9px] sm:text-[10px] font-semibold shrink-0">NIP</span>
            <span className="text-slate-700 text-[10px] sm:text-[11px] font-bold truncate">{nip}</span>
          </div>
        </div>
      </div>
    </m.div>
  );
}
