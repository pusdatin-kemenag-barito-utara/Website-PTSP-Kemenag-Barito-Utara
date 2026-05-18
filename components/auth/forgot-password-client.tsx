"use client";

import { useState } from "react";
import { m, AnimatePresence } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { RoleSelection } from "@/components/auth/role-selection";
import { PemohonResetForm } from "@/components/auth/pemohon-reset-form";
import { PetugasResetForm } from "@/components/auth/petugas-reset-form";

type Role = "user" | "admin" | null;

export function ForgotPasswordClient() {
  const [role, setRole] = useState<Role>(null);

  const resetAll = () => {
    setRole(null);
  };

  return (
    <div className="w-full max-w-lg mx-auto">
      <AnimatePresence mode="wait">
        {!role ? (
          <RoleSelection setRole={setRole} />
        ) : (
          <m.div
            key="form-flow"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="relative overflow-hidden rounded-[2.5rem] bg-white/95 shadow-[0_30px_70px_-15px_rgba(0,0,0,0.5)] backdrop-blur-xl ring-1 ring-white/20"
          >
            {/* Form Header Line */}
            <div className="absolute left-0 top-0 h-2 w-full bg-gradient-to-r from-[#0f8a54] via-[#14b870] to-[#0f8a54]" />

            <div className="p-8 pt-10">
              <div className="flex items-center justify-between mb-8">
                <button
                  onClick={resetAll}
                  className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-[#0f8a54] transition-colors"
                >
                  <ArrowLeft className="h-3.5 w-3.5" /> Kembali
                </button>
                <span className="text-[10px] font-black uppercase tracking-widest text-[#0f8a54] bg-emerald-50 px-3 py-1 rounded-full">
                  {role === "user" ? "Pemohon" : "Petugas"}
                </span>
              </div>

              {role === "user" ? <PemohonResetForm /> : <PetugasResetForm />}
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}
