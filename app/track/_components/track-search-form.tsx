"use client";

import { Search, Loader2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { LoginTurnstile, TurnstileRef } from "@/components/auth/_components/login-turnstile";

interface TrackSearchFormProps {
  initialQuery: string;
}

export function TrackSearchForm({ initialQuery }: TrackSearchFormProps) {
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const turnstileRef = useRef<TurnstileRef>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentYear = new Date().getFullYear();
  const displayValue = initialQuery;

  const handleSubmit = () => {
    setLoading(true);
  };

  return (
    <div className="mb-8 sm:mb-12 space-y-4 sm:space-y-6">
      <form 
        onSubmit={handleSubmit}
        className="group relative flex flex-col gap-4 sm:flex-row sm:items-center"
      >
        {/* Hidden input to pass turnstile token through native form submission */}
        <input type="hidden" name="token" value={turnstileToken || ""} />

        <div className="relative flex-1">
          {/* Input decoration container */}
          <div className="absolute -inset-0.5 rounded-[1.25rem] bg-gradient-to-r from-[#059669]/10 to-teal-600/10 opacity-0 group-focus-within:opacity-100 transition duration-500 blur-sm -z-10" />
          
          <div className="absolute left-5 top-1/2 -translate-y-1/2 flex items-center gap-3">
            <Search className="h-4.5 w-4.5 text-slate-400 group-focus-within:text-[#059669] transition-colors duration-300 shrink-0" />
          </div>
          
          <input
            type="text"
            name="q"
            defaultValue={displayValue}
            autoComplete="off"
            required
            placeholder={`Contoh: PUB-MDR-${currentYear}-000001`}
            onChange={() => {
              // Reset token on query change to force a re-challenge for security
              if (turnstileToken) {
                setTurnstileToken(null);
                turnstileRef.current?.reset();
              }
            }}
            className="w-full h-12 sm:h-16 rounded-2xl sm:rounded-[1.25rem] border border-slate-200/80 bg-white pl-11 pr-4 text-sm sm:text-base font-bold text-slate-800 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.02)] focus:border-[#059669] focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/5 transition-all duration-300 placeholder:text-slate-300 placeholder:text-xs sm:placeholder:text-sm"
          />
        </div>

        <button
          type="submit"
          disabled={loading || !turnstileToken}
          className="inline-flex h-12 sm:h-16 items-center justify-center rounded-2xl sm:rounded-[1.25rem] bg-gradient-to-r from-[#059669] to-[#047857] px-6 sm:px-8 text-sm font-bold text-white shadow-[0_10px_20px_-5px_rgba(5,150,105,0.3)] hover:shadow-[0_12px_24px_-5px_rgba(5,150,105,0.4)] hover:-translate-y-0.5 hover:from-[#047857] hover:to-[#03543f] active:scale-95 disabled:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none transition-all duration-300 shrink-0 gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Mencari...</span>
            </>
          ) : (
            <>
              <Search className="h-4 w-4" />
              <span>Cari Sekarang</span>
            </>
          )}
        </button>
      </form>

      {/* Cloudflare Turnstile Security Card */}
      <div className="flex justify-center">
        <LoginTurnstile
          mounted={mounted}
          ref={turnstileRef}
          onTokenChange={setTurnstileToken}
        />
      </div>
    </div>
  );
}
