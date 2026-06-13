"use client";

import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { Building2, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, Variants } from "framer-motion";
import { ModernDatePicker } from "@/components/ui/modern-date-picker";
import { ModernTimePicker } from "@/components/ui/modern-time-picker";
import { ModernSelect } from "@/components/ui/modern-select";
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

const formatTitleCase = (text: string) => {
  return text
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export default function AppointmentForm() {
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [guestName, setGuestName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [institutionType, setInstitutionType] = useState("Pribadi");
  const [institutionName, setInstitutionName] = useState("");
  const [intendedOfficerSelect, setIntendedOfficerSelect] = useState("");
  const [customOfficer, setCustomOfficer] = useState("");
  const [purpose, setPurpose] = useState("");
  const [appointmentDate, setAppointmentDate] = useState(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  });
  const [appointmentTime, setAppointmentTime] = useState("");
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
      !intendedOfficer ||
      !purpose ||
      !appointmentDate ||
      !appointmentTime
    ) {
      toast.error("Formulir Belum Lengkap", {
        description: "Silakan isi semua bidang wajib (bertanda bintang).",
      });
      return;
    }

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
        description: "Silakan masukkan nomor WhatsApp yang benar.",
      });
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/janji-temu", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guestName,
          whatsapp: cleanWhatsapp,
          institutionType,
          institutionName: institutionName || null,
          intendedOfficer,
          purpose,
          appointmentDate,
          appointmentTime,
          turnstileToken,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Gagal mengirim data.");
      }

      toast.success("Terima Kasih!", {
        description:
          "Permintaan janji temu Anda telah berhasil dicatat. Silakan tunggu konfirmasi petugas.",
      });

      // Reset Form
      setGuestName("");
      setWhatsapp("");
      setInstitutionType("Pribadi");
      setInstitutionName("");
      setIntendedOfficerSelect("");
      setCustomOfficer("");
      setPurpose("");
      setAppointmentTime("");
      setTurnstileToken(null);
      turnstileRef.current?.reset();

      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, "0");
      const day = String(today.getDate()).padStart(2, "0");
      setAppointmentDate(`${year}-${month}-${day}`);
    } catch (err: any) {
      toast.error("Gagal Mengirim", {
        description: err.message || "Terjadi kesalahan saat menyimpan data.",
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
    <motion.form 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      onSubmit={handleSubmit} 
      className="space-y-6"
    >
      <div className="grid gap-6 sm:grid-cols-2">
        {/* Tanggal Rencana */}
        <motion.div variants={itemVariants} className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-slate-700">
            Tanggal Rencana <span className="text-red-500">*</span>
          </label>
          <ModernDatePicker
            value={appointmentDate}
            onChange={(val) => setAppointmentDate(val)}
            required
          />
        </motion.div>

        {/* Jam Bertamu */}
        <motion.div variants={itemVariants} className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-slate-700">
            Jam Bertamu <span className="text-red-500">*</span>
          </label>
          <ModernTimePicker
            value={appointmentTime}
            onChange={(val) => setAppointmentTime(val)}
            required
          />
        </motion.div>

        {/* Nama Lengkap */}
        <motion.div variants={itemVariants} className="flex flex-col gap-1.5 sm:col-span-2">
          <label
            htmlFor="guestName"
            className="text-sm font-semibold text-slate-700"
          >
            Nama Tamu <span className="text-red-500">*</span>
          </label>
          <input
            id="guestName"
            type="text"
            required
            value={guestName}
            onChange={(e) => setGuestName(formatTitleCase(e.target.value.replace(/[0-9]/g, "")))}
            placeholder="Contoh: Muhammad Nazilah"
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 shadow-sm transition-all focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </motion.div>

        {/* No WhatsApp */}
        <motion.div variants={itemVariants} className="flex flex-col gap-1.5 sm:col-span-2">
          <label
            htmlFor="whatsapp"
            className="text-sm font-semibold text-slate-700"
          >
            Nomor WhatsApp / HP <span className="text-red-500">*</span>
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
            Gunakan format angka saja (misal: 0812xxx atau 62812xxx).
          </p>
        </motion.div>

        {/* Jenis Instansi */}
        <motion.div variants={itemVariants} className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-slate-700">
            Instansi <span className="text-red-500">*</span>
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
            placeholder="Pilih Instansi"
            required
          />
        </motion.div>

        {/* Nama Instansi */}
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
            onChange={(e) => setInstitutionName(formatTitleCase(e.target.value))}
            placeholder="Contoh: KUA Teweh Tengah / Dinas Pendidikan Barito Utara / Instansi Lainnya"
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 shadow-sm transition-all focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </motion.div>
      </div>

      {/* Pejabat yang Dituju Dropdown */}
      <motion.div variants={itemVariants} className="flex flex-col gap-1.5">
        <label className="text-sm font-semibold text-slate-700">
          Ingin Bertemu <span className="text-red-500">*</span>
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
          placeholder="Pilih Petugas"
          searchPlaceholder="Cari nama petugas..."
          enableSearch={true}
          required
        />
      </motion.div>

      {/* Custom Officer Name (if Unit Lainnya selected) */}
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
            onChange={(e) => setCustomOfficer(formatTitleCase(e.target.value))}
            placeholder="Tulis nama unit / pegawai lainnya..."
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 shadow-sm transition-all focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </motion.div>
      )}

      {/* Keperluan Kunjungan */}
      <motion.div variants={itemVariants} className="flex flex-col gap-1.5">
        <label
          htmlFor="purpose"
          className="text-sm font-semibold text-slate-700"
        >
          Keperluan <span className="text-red-500">*</span>
        </label>
        <textarea
          id="purpose"
          required
          rows={4}
          value={purpose}
          onChange={(e) => setPurpose(formatTitleCase(e.target.value))}
          placeholder="Tuliskan Keperluan Anda..."
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

      {/* Submit Button */}
      <motion.div variants={itemVariants} className="flex justify-center pt-2">
        <Button
          type="submit"
          disabled={submitting}
          className="w-full sm:w-auto px-8 py-3 text-sm font-bold bg-[#1e88e5] hover:bg-[#1565c0] text-white rounded-xl shadow-md transition-all hover:scale-105 active:scale-95"
        >
          {submitting ? "Menyimpan..." : "SIMPAN"}
        </Button>
      </motion.div>
    </motion.form>
  );
}
