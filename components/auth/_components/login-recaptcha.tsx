"use client";

import ReCAPTCHA from "react-google-recaptcha";
import { ShieldCheck } from "lucide-react";
import { Field } from "@/components/ui/field";
import { RefObject } from "react";

interface LoginRecaptchaProps {
  mounted: boolean;
  recaptchaRef: RefObject<ReCAPTCHA | null>;
  recaptchaToken: string | null;
  onTokenChange: (token: string | null) => void;
}

export function LoginRecaptcha({
  mounted,
  recaptchaRef,
  recaptchaToken,
  onTokenChange,
}: LoginRecaptchaProps) {
  return (
    <Field label="Verifikasi Keamanan" required>
      <div className="relative group overflow-hidden rounded-[1.5rem] border border-slate-100 bg-slate-50/50 p-4 transition-all hover:border-emerald-200 hover:bg-emerald-50/30">
        <div className="relative flex min-h-[78px] items-center justify-center">
          {mounted ? (
            <ReCAPTCHA
              ref={recaptchaRef}
              sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || ""}
              onChange={onTokenChange}
              onExpired={() => onTokenChange(null)}
              className="scale-[0.85] sm:scale-95 origin-center drop-shadow-sm"
            />
          ) : (
            <div className="h-[78px] w-full animate-pulse rounded-xl bg-slate-100" />
          )}
        </div>

        {recaptchaToken && (
          <div className="mt-2 flex items-center justify-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-emerald-600 animate-in fade-in zoom-in-95 duration-500">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Terverifikasi</span>
          </div>
        )}
      </div>
    </Field>
  );
}
