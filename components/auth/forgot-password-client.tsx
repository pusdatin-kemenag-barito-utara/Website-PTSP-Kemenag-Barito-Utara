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
            className="bg-white rounded-3xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] border border-slate-100 overflow-hidden"
          >
            {/* Form Header */}
            <div
              className={`h-1.5 w-full ${
                role === "user" ? "bg-emerald-500" : "bg-[#059669]"
              }`}
            />

            <div className="p-8">
              <button
                onClick={resetAll}
                className="mb-6 flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Kembali
              </button>

              {role === "user" ? <PemohonResetForm /> : <PetugasResetForm />}
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}
