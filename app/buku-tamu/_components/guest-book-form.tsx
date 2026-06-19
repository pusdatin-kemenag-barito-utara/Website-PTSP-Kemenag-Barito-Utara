"use client";

import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { Calendar, Building2, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, Variants } from "framer-motion";
import { GuestEntry } from "./types";
import { ModernSelect } from "@/components/ui/modern-select";
import { ModernDatePicker } from "@/components/ui/modern-date-picker";
import {
  LoginTurnstile,
  TurnstileRef,
} from "@/components/auth/_components/login-turnstile";

const OFFICER_OPTIONS = [
  "Kepala Kantor",
  "Kasubag Tata Usaha",
  "Kasi Pendidikan Madrasah (Penmad)",
  "Kasi Pendidikan Agama Islam (PAI)",
  "Kasi Pendidikan Diniyah & Pondok Pesantren (PD Pontren)",
  "Kasi Bimbingan Masyarakat Islam",
  "Kasi Bimbingan Masyarakat Kristen & Katolik",
  "Penyelenggara Zakat dan Wakaf",
  "Penyelenggara Hindu",
  "Humas / Petugas PTSP",
  "Unit Lainnya (Bisa Tulis Manual)",
];

const capitalizeEachWord = (text: string) => {
  return text.replace(/\b\w/g, (char) => char.toUpperCase());
};

interface GuestBookFormProps {
  onSuccess: (newEntry: GuestEntry) => void;
  isManualMode?: boolean;
}

export default function GuestBookForm({
  onSuccess,
  isManualMode = false,
}: GuestBookFormProps) {
  const [submitting, setSubmitting] = useState(false);
  const [guestName, setGuestName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [institutionType, setInstitutionType] = useState("Pribadi");
  const [institutionName, setInstitutionName] = useState("");
  const [intendedOfficerSelect, setIntendedOfficerSelect] = useState("");
  const [customOfficer, setCustomOfficer] = useState("");
  const [purpose, setPurpose] = useState("");

  // Manual Date State
  const [manualDate, setManualDate] = useState(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  });

  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const turnstileRef = useRef<TurnstileRef>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const intendedOfficer =
      intendedOfficerSelect === "Unit Lainnya (Bisa Tulis Manual)"
        ? customOfficer
        : intendedOfficerSelect;

    if (
      !guestName ||
      !whatsapp ||
      !institutionType ||
      !intendedOfficer ||
      !purpose ||
      (isManualMode && !manualDate)
    ) {
      toast.error("Formulir Belum Lengkap", {
        description: "Silakan isi semua bidang wajib (bertanda bintang).",
      });
      return;
    }

    // Skip turnstile verification if admin in manual mode? Actually we don't know who is using the form.
    // If it's a public form, Turnstile is still required.
    if (!turnstileToken) {
      toast.error("Verifikasi Keamanan Diperlukan", {
        description:
          "Silakan tunggu hingga verifikasi Cloudflare Turnstile selesai.",
      });
      return;
    }

    const cleanWhatsapp = whatsapp === "-" ? "-" : whatsapp.replace(/\D/g, "");
    if (cleanWhatsapp !== "-" && cleanWhatsapp.length < 9) {
      toast.error("Nomor WhatsApp Tidak Valid", {
        description:
          "Silakan masukkan nomor WhatsApp yang benar atau tanda strip (-) jika dikosongkan.",
      });
      return;
    }

    setSubmitting(true);

    try {
      const finalVisitDate = isManualMode
        ? new Date(`${manualDate}T00:00:00`).toISOString()
        : new Date().toISOString();

      const response = await fetch("/api/buku-tamu", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guestName,
          whatsapp: cleanWhatsapp,
          institutionType,
          institutionName: institutionName || null,
          intendedOfficer,
          purpose,
          visitDate: finalVisitDate,
          turnstileToken,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.data?.id) {
        throw new Error(result.error || "Gagal menyimpan data.");
      }

      toast.success("Terima Kasih!", {
        description: "Data kunjungan Anda telah berhasil dicatat.",
      });

      const newEntry: GuestEntry = {
        id: result.data.id,
        guestName,
        whatsapp: cleanWhatsapp,
        institutionType,
        institutionName: institutionName || null,
        intendedOfficer,
        purpose,
        visitDate: finalVisitDate,
      };

      setGuestName("");
      setWhatsapp("");
      setInstitutionType("Pribadi");
      setInstitutionName("");
      setIntendedOfficerSelect("");
      setCustomOfficer("");
      setPurpose("");
      setTurnstileToken(null);
      turnstileRef.current?.reset();

      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, "0");
      const day = String(today.getDate()).padStart(2, "0");
      setManualDate(`${year}-${month}-${day}`);

      onSuccess(newEntry);
    } catch (err: unknown) {
      toast.error("Gagal Mengirim", {
        description: err instanceof Error ? err.message : "Terjadi kesalahan saat menyimpan data.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="w-full"
    >
      <motion.div variants={itemVariants} className="mb-8 text-center">
        <h2 className="text-2xl font-bold tracking-tight text-slate-800 md:text-3xl">
          Formulir Kunjungan Tamu
        </h2>
        <p className="mt-2 text-sm text-slate-500 md:text-base">
          Silakan lengkapi data kunjungan Anda agar kami dapat memberikan
          pelayanan terbaik.
        </p>
      </motion.div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 sm:grid-cols-2">
          {!isManualMode ? (
            <motion.div variants={itemVariants} className="flex flex-col gap-1.5 sm:col-span-2">
              <label className="text-sm font-semibold text-slate-700">
                Tanggal Kunjungan{" "}
                <span className="text-xs text-slate-400">
                  (Otomatis Hari Ini)
                </span>
              </label>
              <div className="w-full rounded-xl border border-emerald-200/60 bg-emerald-50/30 px-4 py-3 text-sm text-emerald-800 shadow-inner flex items-center gap-2">
                <Calendar className="h-4.5 w-4.5 text-emerald-600 animate-pulse" />
                <span className="font-bold">
                  {new Date().toLocaleDateString("id-ID", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>
            </motion.div>
          ) : (
            <motion.div variants={itemVariants} className="flex flex-col gap-1.5 sm:col-span-2">
              <label className="text-sm font-semibold text-slate-700">
                Tanggal Kunjungan <span className="text-red-500">*</span>
              </label>
              <ModernDatePicker
                value={manualDate}
                onChange={(val) => setManualDate(val)}
                required
              />
            </motion.div>
          )}

          <motion.div variants={itemVariants} className="flex flex-col gap-1.5">
            <label
              htmlFor="guestName"
              className="text-sm font-semibold text-slate-700"
            >
              Nama Lengkap <span className="text-red-500">*</span>
            </label>
            <input
              id="guestName"
              type="text"
              required
              value={guestName}
              onChange={(e) => setGuestName(capitalizeEachWord(e.target.value))}
              placeholder="Contoh: Muhammad Nazilah"
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 shadow-sm transition-all focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </motion.div>

          <motion.div variants={itemVariants} className="flex flex-col gap-1.5">
            <label
              htmlFor="whatsapp"
              className="text-sm font-semibold text-slate-700"
            >
              Nomor WhatsApp <span className="text-red-500">*</span>
            </label>
            <input
              id="whatsapp"
              type="tel"
              required
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value.replace(/[^\d-]/g, ""))}
              placeholder="Contoh: 081234567890"
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 shadow-sm transition-all focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
            <p className="text-xs text-slate-400">
              Format angka saja (misal: 0812xxx).
            </p>
          </motion.div>

          <motion.div variants={itemVariants} className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-slate-700">
              Jenis Instansi <span className="text-red-500">*</span>
            </label>
            <ModernSelect
              options={[
                { value: "Pribadi", label: "Pribadi / Perorangan" },
                { value: "Pemerintah", label: "Lembaga Pemerintah" },
                { value: "Swasta", label: "Perusahaan Swasta" },
                { value: "Ormas", label: "Organisasi Masyarakat (Ormas)" },
                { value: "Lainnya", label: "Lainnya" },
              ]}
              value={institutionType}
              onChange={(val) => setInstitutionType(val)}
              icon={Building2}
              placeholder="Pilih Jenis Instansi"
              required
            />
          </motion.div>

          <motion.div variants={itemVariants} className="flex flex-col gap-1.5">
            <label
              htmlFor="institutionName"
              className="text-sm font-semibold text-slate-700"
            >
              Nama Instansi{" "}
              <span className="text-xs text-slate-400">(Opsional)</span>
            </label>
            <input
              id="institutionName"
              type="text"
              value={institutionName}
              onChange={(e) => setInstitutionName(capitalizeEachWord(e.target.value))}
              placeholder="Contoh: KUA Teweh Tengah / Dinas Pendidikan Barito Utara / Instansi Lainnya"
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 shadow-sm transition-all focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </motion.div>
        </div>

        <motion.div variants={itemVariants} className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-slate-700">
            Pejabat / Pegawai yang Dituju{" "}
            <span className="text-red-500">*</span>
          </label>
          <ModernSelect
            options={OFFICER_OPTIONS}
            value={intendedOfficerSelect}
            onChange={(val) => {
              setIntendedOfficerSelect(val);
              if (val !== "Unit Lainnya (Bisa Tulis Manual)") {
                setCustomOfficer("");
              }
            }}
            icon={UserCheck}
            placeholder="Pilih Pejabat / Pegawai"
            searchPlaceholder="Cari nama pejabat/pegawai..."
            enableSearch={true}
            required
          />
        </motion.div>

        {intendedOfficerSelect === "Unit Lainnya (Bisa Tulis Manual)" && (
          <motion.div variants={itemVariants} className="flex flex-col gap-1.5">
            <label
              htmlFor="customOfficer"
              className="text-sm font-semibold text-slate-700"
            >
              Nama Unit / Pejabat yang Dituju{" "}
              <span className="text-red-500">*</span>
            </label>
            <input
              id="customOfficer"
              type="text"
              required
              value={customOfficer}
              onChange={(e) => setCustomOfficer(capitalizeEachWord(e.target.value))}
              placeholder="Tulis nama unit / pegawai lainnya..."
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 shadow-sm transition-all focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </motion.div>
        )}

        <motion.div variants={itemVariants} className="flex flex-col gap-1.5">
          <label
            htmlFor="purpose"
            className="text-sm font-semibold text-slate-700"
          >
            Maksud & Tujuan Kunjungan <span className="text-red-500">*</span>
          </label>
          <textarea
            id="purpose"
            required
            rows={4}
            value={purpose}
            onChange={(e) => setPurpose(capitalizeEachWord(e.target.value))}
            placeholder="Jelaskan secara singkat keperluan kedatangan Anda..."
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 shadow-sm transition-all focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </motion.div>

        <motion.div variants={itemVariants} className="pt-2">
          <LoginTurnstile
            mounted={mounted}
            ref={turnstileRef}
            onTokenChange={setTurnstileToken}
          />
        </motion.div>

        <motion.div variants={itemVariants} className="flex justify-center pt-2">
          <Button
            type="submit"
            disabled={submitting}
            className="w-full sm:w-auto px-8 py-3 text-sm font-semibold bg-[#00897b] hover:bg-[#00796b] text-white rounded-xl shadow-md transition-all hover:scale-105 active:scale-95"
          >
            {submitting ? "Menyimpan Data..." : "Kirim & Catat Kunjungan"}
          </Button>
        </motion.div>
      </form>
    </motion.div>
  );
}
