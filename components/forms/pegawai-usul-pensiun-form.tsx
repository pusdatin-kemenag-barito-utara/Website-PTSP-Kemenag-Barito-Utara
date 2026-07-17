"use client";

import { useMemo, useState, useEffect, type FormEvent, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Calendar, Send, FileText } from "lucide-react";
import { RequestRequirementUpload } from "./request-requirement-upload";
import { RealtimeSync } from "@/components/ui/realtime-sync";
import { ModernSelect } from "@/components/ui/modern-select";
import { ModernDatePicker } from "@/components/ui/modern-date-picker";

import { UNIT_KERJA_OPTIONS, HARDCODED_PENSIUN_REQUIREMENTS } from "@/lib/constants";

type Catalog = any[];

interface PegawaiUsulPensiunFormProps {
  catalog: Catalog;
  profile: any;
  redirectPathPrefix?: string;
  lockedServiceId?: string;
}

const JENIS_PENSIUN_OPTIONS = [
  { value: "Pensiun BUP", label: "Pensiun BUP (Batas Usia Pensiun)" },
  { value: "Pensiun Janda/Duda", label: "Pensiun Janda/Duda" },
  { value: "Pensiun Dini (APS)", label: "Pensiun Dini (Atas Permintaan Sendiri)" },
  { value: "Pensiun Uzur/Sakit", label: "Pensiun Uzur/Sakit" },
];

const GOLONGAN_MAP: Record<string, string> = {
  "I/a": "Juru Muda/I.a",
  "I/b": "Juru Muda Tingkat I/I.b",
  "I/c": "Juru/I.c",
  "I/d": "Juru Tingkat I/I.d",
  "II/a": "Pengatur Muda/II.a",
  "II/b": "Pengatur Muda Tingkat I/II.b",
  "II/c": "Pengatur/II.c",
  "II/d": "Pengatur Tingkat I/II.d",
  "III/a": "Penata Muda/III.a",
  "III/b": "Penata Muda Tingkat I/III.b",
  "III/c": "Penata/III.c",
  "III/d": "Penata Tingkat I/III.d",
  "IV/a": "Pembina/IV.a",
  "IV/b": "Pembina Tingkat I/IV.b",
  "IV/c": "Pembina Utama Muda/IV.c",
  "IV/d": "Pembina Utama Madya/IV.d",
  "IV/e": "Pembina Utama/IV.e",
};

export function PegawaiUsulPensiunForm({
  catalog,
  profile,
  redirectPathPrefix = "/pegawai/layanan/riwayat",
  lockedServiceId,
}: PegawaiUsulPensiunFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlServiceItemId = searchParams.get("serviceId");

  const formRef = useRef<HTMLFormElement>(null);

  // Find the locked service
  const lockedService = useMemo(
    () => lockedServiceId ? catalog.find((s: any) => String(s.id) === lockedServiceId) : null,
    [catalog, lockedServiceId]
  );

  const [serviceId, setServiceId] = useState<string>(lockedServiceId || "");
  const [serviceItemId, setServiceItemId] = useState<string>("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [requirementFiles, setRequirementFiles] = useState<Record<string, File>>({});

  // Form State
  const [jenisPensiun, setJenisPensiun] = useState("");
  const [tmtPensiun, setTmtPensiun] = useState("");
  const [golonganTerakhir, setGolonganTerakhir] = useState(
    profile?.golongan ? (GOLONGAN_MAP[profile.golongan] || profile.golongan) : ""
  );
  const [jabatanTerakhir, setJabatanTerakhir] = useState(profile?.jabatan || "");
  const [unitKerja, setUnitKerja] = useState(profile?.unitKerja || "");
  const [nip, setNip] = useState(
    profile?.nip || (profile?.email?.includes('@') ? profile.email.split('@')[0].replace(/\D/g, '') : "")
  );
  const [noHp, setNoHp] = useState(profile?.phone || "");

  useEffect(() => {
    setRequirementFiles({});
  }, [serviceItemId]);

  // Auto-select first item when service is locked
  useEffect(() => {
    if (lockedServiceId && catalog.length > 0) {
      const service = catalog.find((s: any) => String(s.id) === lockedServiceId);
      if (service?.serviceItems?.length > 0) {
        setServiceId(lockedServiceId);
        if (urlServiceItemId) {
          const exists = service.serviceItems.find((i: any) => String(i.id) === urlServiceItemId);
          if (exists) {
            setServiceItemId(urlServiceItemId);
            return;
          }
        }
        setServiceItemId(String(service.serviceItems[0].id));
      }
    }
  }, [urlServiceItemId, catalog, lockedServiceId]);

  const selectedService = useMemo(
    () => catalog.find((service: any) => String(service.id) === serviceId),
    [catalog, serviceId]
  );

  const selectedItem = useMemo(
    () =>
      selectedService?.serviceItems?.find(
        (item: any) => String(item.id) === serviceItemId
      ),
    [selectedService, serviceItemId]
  );

  const validateForm = () => {
    if (!formRef.current) return false;
    
    if (!formRef.current.checkValidity()) {
      formRef.current.reportValidity();
      return false;
    }

    if (!jenisPensiun) {
      toast.error("Validasi Gagal", { description: "Jenis Pensiun wajib dipilih." });
      return false;
    }
    if (!unitKerja) {
      toast.error("Validasi Gagal", { description: "Unit Kerja wajib dipilih." });
      return false;
    }

    if (HARDCODED_PENSIUN_REQUIREMENTS) {
      for (const req of HARDCODED_PENSIUN_REQUIREMENTS) {
        if (req.isRequired && !requirementFiles[req.id]) {
          toast.error("Validasi Gagal", {
            description: `Dokumen "${req.documentName}" wajib diunggah.`,
          });
          return false;
        }
      }
    }

    return true;
  };

  const onSubmit = async (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    setIsConfirmOpen(false);
    setError("");
    setLoading(true);

    const formData = new FormData(formRef.current!);
    
    // Add custom fields
    formData.append("jenisPensiun", jenisPensiun);
    formData.append("tmtPensiun", tmtPensiun);
    formData.append("golonganTerakhir", golonganTerakhir);
    formData.append("jabatanTerakhir", jabatanTerakhir);
    formData.append("unitKerja", unitKerja);
    formData.append("nip", nip);
    formData.append("noHp", noHp);
    formData.append("namaLengkap", profile?.fullName || "");
    
    Object.entries(requirementFiles).forEach(([id, file]) => {
      formData.set(`requirement_${id}`, file);
    });

    try {
      const response = await fetch("/api/requests", {
        method: "POST",
        body: formData,
      });

      const result = await response.json().catch(() => ({}));
      setLoading(false);

      if (!response.ok) {
        setError(result.error || "Gagal membuat pengajuan.");
        toast.error("Gagal", {
          description: result.error || "Terjadi kesalahan saat membuat pengajuan.",
        });
        return;
      }

      toast.success("Berhasil!", {
        description: "Pengajuan Usul Pensiun berhasil dikirim.",
      });
      router.push(`${redirectPathPrefix}`);
      router.refresh();
    } catch (err) {
      setLoading(false);
      setError("Terjadi kesalahan koneksi.");
    }
  };

  if (!catalog.length) {
    return <p className="text-sm text-slate-500">Belum ada layanan aktif.</p>;
  }

  return (
    <form ref={formRef} onSubmit={(e) => e.preventDefault()} className="w-full">
      <RealtimeSync />

      <input type="hidden" name="serviceId" value={serviceId} />
      <input type="hidden" name="serviceItemId" value={serviceItemId} />

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm">
        <div className="bg-[#059669] px-6 py-4 sm:px-8 sm:py-5 relative overflow-hidden text-white rounded-t-3xl">
          <div className="relative z-10 flex items-center gap-3">
            <div className="h-9 w-9 shrink-0 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <Calendar className="h-4 w-4 text-white" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold tracking-tight leading-tight">
                Formulir Pengajuan Usul Pensiun
              </h1>
              <p className="text-emerald-100 text-xs mt-0.5 leading-relaxed hidden sm:block">
                Lengkapi data dengan teliti sebelum mengirimkan permohonan pensiun.
              </p>
            </div>
          </div>
          <div className="absolute right-0 top-0 w-40 h-40 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
          <div className="absolute left-0 bottom-0 w-32 h-32 bg-black/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
        </div>

        {lockedService ? (
          <div className="p-6 sm:p-8 space-y-6 sm:space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
              
              {/* Jenis Pensiun */}
              <div className="space-y-1.5 sm:col-span-2 md:col-span-1">
                <label className="text-xs font-semibold text-slate-600">Jenis Pensiun <span className="text-rose-500">*</span></label>
                <div className="relative z-30">
                  <ModernSelect
                    value={jenisPensiun}
                    onChange={setJenisPensiun}
                    options={JENIS_PENSIUN_OPTIONS}
                    placeholder="-- Pilih Jenis Pensiun --"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600">Nama Lengkap</label>
                <input type="text" readOnly value={profile?.fullName || "-"} className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 text-sm focus:outline-none" />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600">NIP <span className="text-rose-500">*</span></label>
                <input 
                  type="text" 
                  value={nip} 
                  required
                  onChange={(e) => setNip(e.target.value.replace(/\D/g, ''))}
                  placeholder="Masukkan NIP"
                  className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400" 
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600">TMT Pensiun <span className="text-rose-500">*</span></label>
                <div className="relative z-30">
                  <ModernDatePicker
                    value={tmtPensiun}
                    onChange={setTmtPensiun}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600">Golongan Terakhir <span className="text-rose-500">*</span></label>
                <input 
                  type="text" 
                  value={golonganTerakhir} 
                  required
                  onChange={(e) => setGolonganTerakhir(e.target.value)}
                  placeholder="Contoh: Penata Muda/III.b"
                  className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400" 
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600">Jabatan Terakhir <span className="text-rose-500">*</span></label>
                <input 
                  type="text" 
                  value={jabatanTerakhir} 
                  required
                  onChange={(e) => setJabatanTerakhir(e.target.value)}
                  placeholder="Jabatan"
                  className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400" 
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600">Unit Kerja <span className="text-rose-500">*</span></label>
                <div className="relative z-20">
                  <ModernSelect
                    value={unitKerja}
                    onChange={setUnitKerja}
                    options={UNIT_KERJA_OPTIONS}
                    placeholder="-- Pilih Unit Kerja --"
                    enableSearch
                    searchPlaceholder="Cari unit kerja..."
                  />
                </div>
              </div>
              
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600">No. HP / WhatsApp <span className="text-rose-500">*</span></label>
                <input 
                  type="text" 
                  value={noHp} 
                  required
                  onChange={(e) => setNoHp(e.target.value.replace(/\D/g, ''))}
                  placeholder="Nomor HP aktif"
                  className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400" 
                />
              </div>
              
              <div className="sm:col-span-2 mt-4 space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="border-t border-slate-100 pt-6">
                  <h2 className="text-sm font-bold text-slate-800 mb-4">Dokumen Persyaratan</h2>
                  <RequestRequirementUpload
                    requirements={HARDCODED_PENSIUN_REQUIREMENTS}
                    onFilesChange={setRequirementFiles}
                    hideHeader={true}
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-sm font-medium">
                {error}
              </div>
            )}

            <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-end gap-3">
              <button
                type="button"
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl border border-transparent bg-rose-500 text-white font-semibold text-sm hover:bg-rose-600 transition-colors shadow-md shadow-rose-500/20"
                onClick={() => router.push("/pegawai/layanan/ajukan")}
              >
                Batal
              </button>
              
              <button
                type="button"
                disabled={loading || !selectedItem}
                onClick={() => {
                  if (validateForm()) setIsConfirmOpen(true);
                }}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#059669] text-white font-semibold text-sm hover:bg-[#047857] transition-colors shadow-lg shadow-emerald-900/20 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                <Send className="h-4 w-4" />
                {loading ? "Mengirim..." : `Kirim Pengajuan Usul Pensiun`}
              </button>
            </div>
          </div>
        ) : (
          <div className="p-8 sm:p-10 text-center">
            <p className="text-slate-500">Service tidak ditemukan atau terkunci.</p>
          </div>
        )}
      </div>

      {isConfirmOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-50 mx-auto mb-4">
              <Send className="h-6 w-6 text-emerald-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 text-center mb-1">Konfirmasi Pengajuan</h3>
            <p className="text-sm text-slate-500 text-center mb-6 leading-relaxed">
              Pastikan semua data pensiun sudah benar.<br />Pengajuan yang sudah dikirim tidak bisa dibatalkan secara langsung.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => setIsConfirmOpen(false)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-colors"
              >
                Cek Kembali
              </button>
              <button
                type="button"
                onClick={() => onSubmit()}
                disabled={loading}
                className="flex-1 px-4 py-2.5 rounded-xl bg-[#059669] text-white font-bold text-sm hover:bg-[#047857] transition-colors shadow-lg shadow-emerald-900/20 disabled:opacity-70 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
              >
                <Send className="h-4 w-4" />
                {loading ? "Mengirim..." : "Ya, Kirim Sekarang"}
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
