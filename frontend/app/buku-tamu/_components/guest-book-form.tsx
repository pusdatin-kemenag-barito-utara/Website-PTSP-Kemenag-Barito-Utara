"use client";

import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { Calendar, Building2, UserCheck, User, Landmark, Briefcase, Users, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GuestEntry } from "./types";
import { ModernSelect } from "@/components/ui/modern-select";
import { ModernDatePicker } from "@/components/ui/modern-date-picker";
import {
  LoginTurnstile,
  TurnstileRef,
} from "@/components/auth/_components/login-turnstile";
import {
  GuestBookSuccessModal,
  GuestBookSuccessModalData,
} from "./guest-book-success-modal";

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
  onSuccess: (newEntry: GuestEntry, modalData: GuestBookSuccessModalData) => void;
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

  const [successData, setSuccessData] = useState<GuestBookSuccessModalData | null>(null);

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
    const nameTrimmed = guestName.trim();
    if (!nameTrimmed || nameTrimmed.length < 3) {
      toast.error("Nama Lengkap Tidak Valid", {
        description: "Nama lengkap minimal terdiri dari 3 karakter huruf.",
      });
      return;
    }

    if (/[0-9]/.test(nameTrimmed)) {
      toast.error("Nama Lengkap Tidak Valid", {
        description: "Nama lengkap tidak boleh mengandung angka.",
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

      const modalData: GuestBookSuccessModalData = {
        guestName,
        intendedOfficer,
        purpose,
        visitDate: finalVisitDate,
        institutionName: institutionName || null,
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

      // Trigger modal & update list di level parent client
      onSuccess(newEntry, modalData);

      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, "0");
      const day = String(today.getDate()).padStart(2, "0");
      setManualDate(`${year}-${month}-${day}`);
    } catch (err: unknown) {
      toast.error("Gagal Mengirim", {
        description: err instanceof Error ? err.message : "Terjadi kesalahan saat menyimpan data.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full">
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100 md:text-3xl">
          Formulir Kunjungan Tamu
        </h2>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 md:text-base">
          Silakan lengkapi data kunjungan Anda agar kami dapat memberikan
          pelayanan terbaik.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 sm:grid-cols-2">
          {!isManualMode ? (
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Tanggal Kunjungan{" "}
                <span className="text-xs text-slate-400 dark:text-slate-500">
                  (Otomatis Hari Ini)
                </span>
              </label>
              <div className="w-full rounded-xl border border-emerald-200/60 dark:border-emerald-900/50 bg-emerald-50/30 dark:bg-emerald-950/40 px-4 py-3 text-sm text-emerald-800 dark:text-emerald-300 shadow-inner flex items-center gap-2">
                <Calendar className="h-4.5 w-4.5 text-emerald-600 dark:text-emerald-400 animate-pulse" />
                <span className="font-bold">
                  {new Date().toLocaleDateString("id-ID", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Tanggal Kunjungan <span className="text-red-500">*</span>
              </label>
              <ModernDatePicker
                value={manualDate}
                onChange={(val) => setManualDate(val)}
                required
              />
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="guestName"
              className="text-sm font-semibold text-slate-700 dark:text-slate-300"
            >
              Nama Lengkap <span className="text-red-500">*</span>
            </label>
            <input
              id="guestName"
              type="text"
              required
              value={guestName}
              onChange={(e) => {
                // Hapus semua angka/digit dan karakter khusus yang tidak valid untuk nama
                const cleanVal = e.target.value.replace(/[0-9]/g, "");
                setGuestName(capitalizeEachWord(cleanVal));
              }}
              placeholder="Contoh: Muhammad Nazilah"
              className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 py-3 text-sm text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-sm transition-all focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="whatsapp"
              className="text-sm font-semibold text-slate-700 dark:text-slate-300"
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
              className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 py-3 text-sm text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-sm transition-all focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
            <p className="text-xs text-slate-400 dark:text-slate-500">
              Format angka saja (misal: 0812xxx).
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Jenis Instansi <span className="text-red-500">*</span>
            </label>
            <ModernSelect
              options={[
                { value: "Pribadi", label: "Pribadi / Perorangan", icon: User },
                { value: "Pemerintah", label: "Lembaga Pemerintah", icon: Landmark },
                { value: "Swasta", label: "Perusahaan Swasta", icon: Briefcase },
                { value: "Ormas", label: "Organisasi Masyarakat (Ormas)", icon: Users },
                { value: "Lainnya", label: "Lainnya", icon: HelpCircle },
              ]}
              value={institutionType}
              onChange={(val) => setInstitutionType(val)}
              icon={Building2}
              placeholder="Pilih Jenis Instansi"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="institutionName"
              className="text-sm font-semibold text-slate-700 dark:text-slate-300"
            >
              Nama Instansi{" "}
              <span className="text-xs text-slate-400 dark:text-slate-500">(Opsional)</span>
            </label>
            <input
              id="institutionName"
              type="text"
              value={institutionName}
              onChange={(e) => setInstitutionName(capitalizeEachWord(e.target.value))}
              placeholder="Contoh: KUA Teweh Tengah / Dinas Pendidikan Barito Utara / Instansi Lainnya"
              className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 py-3 text-sm text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-sm transition-all focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
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
        </div>

        {intendedOfficerSelect === "Unit Lainnya (Bisa Tulis Manual)" && (
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="customOfficer"
              className="text-sm font-semibold text-slate-700 dark:text-slate-300"
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
              className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 py-3 text-sm text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-sm transition-all focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="purpose"
            className="text-sm font-semibold text-slate-700 dark:text-slate-300"
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
            className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 py-3 text-sm text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-sm transition-all focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>

        <div className="pt-2">
          <LoginTurnstile
            mounted={mounted}
            ref={turnstileRef}
            onTokenChange={setTurnstileToken}
          />
        </div>

        <div className="flex justify-center pt-2">
          <Button
            type="submit"
            disabled={submitting}
            className="w-full sm:w-auto px-8 py-3 text-sm font-semibold bg-[#00897b] hover:bg-[#00796b] text-white rounded-xl shadow-md transition-all hover:scale-105 active:scale-95"
          >
            {submitting ? "Menyimpan Data..." : "Kirim & Catat Kunjungan"}
          </Button>
        </div>
      </form>
    </div>
  );
}
