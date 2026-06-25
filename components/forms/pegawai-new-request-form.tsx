"use client";

import { useMemo, useState, useEffect, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Calendar, FileText, Send, ScrollText, ChevronDown } from "lucide-react";
import { RequestServiceSelection } from "./request-service-selection";
import { RequestFormFields } from "./request-form-fields";
import { RequestRequirementUpload } from "./request-requirement-upload";
import { RequestConfirmation } from "./_components/request-confirmation";
import { RealtimeSync } from "@/components/ui/realtime-sync";
import { DraftCutiModal } from "@/components/ui/draft-cuti-modal";
import { ModernSelect } from "@/components/ui/modern-select";

import { UNIT_KERJA_OPTIONS } from "@/lib/constants";
import { getSisaCutiByNip } from "@/lib/actions/pegawai/cuti";
import Image from "next/image";
import { useRef } from "react";

type Catalog = any[];

interface PegawaiNewRequestFormProps {
  catalog: Catalog;
  profile: any;
  redirectPathPrefix?: string;
  lockedServiceId?: string;
  sisaCutiData?: { n: string; n1: string; n2: string };
  pejabatList?: any[];
}

export function PegawaiNewRequestForm({
  catalog,
  profile,
  redirectPathPrefix = "/pegawai/layanan/riwayat",
  lockedServiceId,
  sisaCutiData,
  pejabatList = [],
}: PegawaiNewRequestFormProps) {
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
  const [isConfirmed, setIsConfirmed] = useState(true);
  const [requirementFiles, setRequirementFiles] = useState<Record<string, File>>({});
  const [isDraftOpen, setIsDraftOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  // Extra fields for Cuti form (locked service mode)
  const [jenisPegawai, setJenisPegawai] = useState<"PNS" | "PPPK">("PNS");
  const [sisaCutiN, setSisaCutiN] = useState(sisaCutiData?.n || "");
  const [sisaCutiN1, setSisaCutiN1] = useState(sisaCutiData?.n1 || "");
  const [sisaCutiN2, setSisaCutiN2] = useState(sisaCutiData?.n2 || "");
  const [unitKerja, setUnitKerja] = useState(profile?.unitKerja || "");
  const [nip, setNip] = useState(
    profile?.nip || (profile?.email?.includes('@') ? profile.email.split('@')[0].replace(/\D/g, '') : "")
  );

  // Update sisa cuti if nip changes
  useEffect(() => {
    if (nip) {
      const fetchCuti = async () => {
        const res = await getSisaCutiByNip(nip);
        setSisaCutiN(res.n);
        setSisaCutiN1(res.n1);
        setSisaCutiN2(res.n2);
      };
      fetchCuti();
    }
  }, [nip]);

  const getDraftData = () => {
    if (!formRef.current || !selectedItem) return {} as any;
    const formData = new FormData(formRef.current);
    
    // Helper to extract value by label keyword
    const getValueByLabel = (keywords: string[], matchAll = false) => {
      const field = selectedItem.serviceFormFields?.find((f: any) => {
        const lowerLabel = f.label.toLowerCase();
        return matchAll
          ? keywords.every(k => lowerLabel.includes(k.toLowerCase()))
          : keywords.some(k => lowerLabel.includes(k.toLowerCase()));
      });
      if (!field) return "";
      return formData.get(`answer_${field.id}`) as string || "";
    };

    const jenisCutiFromForm = lockedServiceId && selectedItem 
      ? selectedItem.name 
      : getValueByLabel(["jenis cuti"]);
      
    const alasan = getValueByLabel(["alasan"]);
    
    // Attempt to extract tanggal
    let tanggalMulai = "";
    let tanggalSelesai = "";
    
    const dateField = selectedItem.serviceFormFields?.find((f: any) => f.type === "date" && f.label.toLowerCase().includes("tanggal"));
    if (dateField) {
      const rawDate = formData.get(`answer_${dateField.id}`) as string || "";
      if (rawDate.includes(",")) {
        const dates = rawDate.split(",");
        tanggalMulai = dates[0] || "";
        tanggalSelesai = dates[dates.length - 1] || "";
      } else {
        tanggalMulai = rawDate;
        tanggalSelesai = rawDate;
      }
    }

    const alamatCutiFromForm = getValueByLabel(["alamat"]);

    return {
      nama: profile?.fullName || "",
      nip: nip || "",
      jabatan: profile?.jabatan || "",
      unitKerja: unitKerja || "",
      masaKerjaTahun: getValueByLabel(["masa kerja", "tahun"], true) || "0",
      masaKerjaBulan: getValueByLabel(["masa kerja", "bulan"], true) || "0",
      jenisPegawai,
      jenisCuti: jenisCutiFromForm,
      alasan,
      tanggalMulai,
      tanggalSelesai,
      alamatCuti: alamatCutiFromForm,
      noHp: getValueByLabel(["whatsapp", "hp"]) || profile?.phone || "",
      hakBerjalan: Number(sisaCutiN || "0"),
      cutiTahun1: Number(sisaCutiN1 || "0"),
      cutiTahun2: Number(sisaCutiN2 || "0"),
      signature: "TTE_VERIFIED",
      tanggalPilihan: "",
    } as any;
  };

  useEffect(() => {
    setRequirementFiles({});
  }, [serviceItemId]);

  useEffect(() => {
    setRequirementFiles({});
  }, [serviceItemId]);

  // Auto-select first item when service is locked (e.g. Cuti ASN)
  useEffect(() => {
    if (lockedServiceId && catalog.length > 0) {
      const service = catalog.find((s: any) => String(s.id) === lockedServiceId);
      if (service?.serviceItems?.length > 0) {
        setServiceId(lockedServiceId);
        // Auto-pick from urlServiceItemId or first item
        if (urlServiceItemId) {
          const exists = service.serviceItems.find((i: any) => String(i.id) === urlServiceItemId);
          if (exists) {
            setServiceItemId(urlServiceItemId);
            return;
          }
        }
        setServiceItemId(String(service.serviceItems[0].id));
      }
      return;
    }
    if (urlServiceItemId && catalog.length > 0) {
      for (const service of catalog) {
        const item = service.serviceItems?.find(
          (i: any) => String(i.id) === urlServiceItemId
        );
        if (item) {
          setServiceId(String(service.id));
          setServiceItemId(urlServiceItemId);
          return;
        }
      }
    }
    if (!urlServiceItemId && catalog.length > 0 && !lockedServiceId) {
      setServiceId("");
      setServiceItemId("");
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
    
    // 1. Validasi native HTML bawaan (untuk input dinamis dari RequestFormFields)
    if (!formRef.current.checkValidity()) {
      formRef.current.reportValidity();
      return false;
    }

    // 2. Validasi field custom
    if (!nip) {
      toast.error("Validasi Gagal", { description: "NIP wajib diisi." });
      return false;
    }
    if (!unitKerja) {
      toast.error("Validasi Gagal", { description: "Unit Kerja wajib dipilih." });
      return false;
    }

    // 3. Validasi dokumen persyaratan yang wajib
    if (selectedItem?.serviceRequirements) {
      for (const req of selectedItem.serviceRequirements) {
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
        description: "Pengajuan Anda telah berhasil dikirim.",
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

      {/* Main Container */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm">
        {/* Green Hero Header */}
        <div className="bg-[#059669] px-6 py-4 sm:px-8 sm:py-5 relative overflow-hidden text-white rounded-t-3xl">
          <div className="relative z-10 flex items-center gap-3">
            <div className="h-9 w-9 shrink-0 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <Calendar className="h-4 w-4 text-white" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold tracking-tight leading-tight">
                Formulir Pengajuan {selectedItem ? selectedItem.name : "Layanan"}
              </h1>
              <p className="text-emerald-100 text-xs mt-0.5 leading-relaxed hidden sm:block">
                Silakan lengkapi data di bawah ini dengan benar sebelum mengirimkan permohonan.
              </p>
            </div>
          </div>
          {/* Decorative shapes */}
          <div className="absolute right-0 top-0 w-40 h-40 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
          <div className="absolute left-0 bottom-0 w-32 h-32 bg-black/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
        </div>

        {/* When service is locked (e.g. Cuti ASN): show jenis cuti tabs directly */}
        {lockedService ? (
          <div className="p-6 sm:p-8 space-y-8">
            {/* Jenis Cuti Tabs */}
            <div>
              <h2 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-xs font-black">1</span>
                Pilih Jenis Cuti
              </h2>
              <div className="relative max-w-sm">
                <ModernSelect
                  value={serviceItemId}
                  onChange={(val) => setServiceItemId(val)}
                  options={(lockedService.serviceItems || []).map((item: any) => ({
                    value: String(item.id),
                    label: item.name
                  }))}
                  placeholder="-- Pilih Jenis Cuti --"
                />
              </div>
            </div>

            {/* Data Pegawai Section */}
            <div>
              <h2 className="text-sm font-bold text-slate-800 mb-5 flex items-center gap-2 border-b border-slate-100 pb-4">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-xs font-black">2</span>
                Data Pegawai
              </h2>

              {/* Jenis Pegawai (PNS/PPPK) */}
              <div className="mb-5">
                <label className="text-xs font-semibold text-slate-600 block mb-2">Jenis Pegawai <span className="text-rose-500">*</span></label>
                <div className="flex gap-3">
                  {(["PNS", "PPPK"] as const).map((jenis) => (
                    <button
                      key={jenis}
                      type="button"
                      onClick={() => setJenisPegawai(jenis)}
                      className={`flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 text-sm font-bold transition-all ${
                        jenisPegawai === jenis
                          ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                          : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"
                      }`}
                    >
                      <span className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ${
                        jenisPegawai === jenis ? "border-emerald-500" : "border-slate-300"
                      }`}>
                        {jenisPegawai === jenis && <span className="h-2 w-2 rounded-full bg-emerald-500" />}
                      </span>
                      {jenis}
                    </button>
                  ))}
                </div>
                {jenisPegawai === "PPPK" && (
                  <p className="text-xs text-amber-600 mt-2 font-medium">⚠ Format surat cuti PPPK akan digunakan untuk draft.</p>
                )}
              </div>

              {/* Hidden inputs untuk submit */}
              <input type="hidden" name="cuti_jenis_pegawai" value={jenisPegawai} />
              <input type="hidden" name="cuti_sisa_n" value={sisaCutiN} />
              <input type="hidden" name="cuti_sisa_n1" value={sisaCutiN1} />
              <input type="hidden" name="cuti_sisa_n2" value={sisaCutiN2} />
              <input type="hidden" name="unitKerja" value={unitKerja} />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                    placeholder="Masukkan NIP Anda"
                    className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent" 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600">Jabatan</label>
                  <input type="text" readOnly value={profile?.jabatan || "-"} className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 text-sm focus:outline-none" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600">Unit Kerja <span className="text-rose-500">*</span></label>
                  <div className="relative z-50">
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
                
                {/* Sisa Cuti */}
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-600">Sisa Hak Cuti</label>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="space-y-1">
                      <label className="text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-wide block text-center">N</label>
                      <input
                        type="number"
                        readOnly
                        placeholder="0"
                        value={sisaCutiN}
                        className="w-full h-9 px-1 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 text-sm focus:outline-none text-center font-bold"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-wide block text-center">N-1</label>
                      <input
                        type="number"
                        readOnly
                        placeholder="0"
                        value={sisaCutiN1}
                        className="w-full h-9 px-1 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 text-sm focus:outline-none text-center font-bold"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-wide block text-center">N-2</label>
                      <input
                        type="number"
                        readOnly
                        placeholder="0"
                        value={sisaCutiN2}
                        className="w-full h-9 px-1 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 text-sm focus:outline-none text-center font-bold"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Dynamic Form Fields (only when item selected) */}
            {selectedItem && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
                <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-4">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-xs font-black">3</span>
                  Detail Pengajuan {selectedItem.name}
                </h2>
                <RequestFormFields fields={selectedItem.serviceFormFields ?? []} />
                <RequestRequirementUpload
                  requirements={selectedItem.serviceRequirements ?? []}
                  onFilesChange={setRequirementFiles}
                />
              </div>
            )}



            {/* Error message */}
            {error && (
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-sm font-medium">
                {error}
              </div>
            )}

            {/* Footer Buttons */}
            <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-end gap-3">
              <button
                type="button"
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl border border-transparent bg-rose-500 text-white font-semibold text-sm hover:bg-rose-600 transition-colors shadow-md shadow-rose-500/20"
                onClick={() => router.push("/pegawai/layanan/ajukan")}
              >
                Batal
              </button>
              {selectedItem && (
                <button
                  type="button"
                  onClick={() => setIsDraftOpen(true)}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl border-2 border-slate-200 text-slate-900 font-bold text-sm hover:border-slate-300 transition-colors"
                >
                  <FileText className="inline-block mr-2 h-4 w-4" />
                  Lihat Draft Surat
                </button>
              )}
              <button
                type="button"
                disabled={loading || !selectedItem}
                onClick={() => {
                  if (validateForm()) setIsConfirmOpen(true);
                }}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#059669] text-white font-semibold text-sm hover:bg-[#047857] transition-colors shadow-lg shadow-emerald-900/20 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                <Send className="h-4 w-4" />
                {loading ? "Mengirim..." : `Kirim Pengajuan ${selectedItem?.name || "Cuti"}`}
              </button>
            </div>
          </div>
        ) : !selectedItem ? (
          <div className="p-8 sm:p-10">
            <h2 className="text-sm font-bold text-slate-800 mb-4">Pilih Layanan</h2>
            <RequestServiceSelection
              catalog={catalog}
              serviceId={serviceId}
              serviceItemId={serviceItemId}
              onServiceChange={(val) => {
                setServiceId(val);
                const nextService = catalog.find((s: any) => String(s.id) === val);
                setServiceItemId(String(nextService?.serviceItems?.[0]?.id ?? ""));
              }}
              onItemChange={setServiceItemId}
            />
          </div>
        ) : (
          <div className="p-8 sm:p-10 space-y-10">
            
            {/* Section: Data Pegawai (Read Only) */}
            <div>
              <h2 className="text-sm font-bold text-slate-800 mb-6 flex items-center gap-2 border-b border-slate-100 pb-4">
                Data Pegawai
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600">Nama Lengkap</label>
                  <input type="text" readOnly value={profile?.fullName || "-"} className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 text-sm focus:outline-none" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600">NIP</label>
                  <input type="text" readOnly value={profile?.nip || "-"} className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 text-sm focus:outline-none" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600">Jabatan</label>
                  <input type="text" readOnly value={profile?.jabatan || "-"} className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 text-sm focus:outline-none" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600">Unit Kerja</label>
                  <input type="text" readOnly value={profile?.unitKerja || "-"} className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 text-sm focus:outline-none" />
                </div>
              </div>
            </div>

            {/* Section: Detail Pengajuan (Dynamic Forms) */}
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2 border-b border-slate-100 pb-4">
                <ScrollText className="h-5 w-5 text-emerald-600" />
                Detail Pengajuan {selectedService?.name}
              </h2>
              <div className="space-y-6">
                <RequestFormFields fields={selectedItem.serviceFormFields ?? []} />
                <RequestRequirementUpload
                  requirements={selectedItem.serviceRequirements ?? []}
                  onFilesChange={setRequirementFiles}
                />
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-sm font-medium">
                {error}
              </div>
            )}

            {/* Footer Buttons */}
            <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-end gap-3">
              <button
                type="button"
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl border border-transparent bg-rose-500 text-white font-semibold text-sm hover:bg-rose-600 transition-colors shadow-md shadow-rose-500/20"
                onClick={() => router.push("/pegawai/layanan/ajukan")}
              >
                Batal
              </button>
              {selectedService?.name?.toLowerCase().includes("cuti") && (
                <button
                  type="button"
                  onClick={() => setIsDraftOpen(true)}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl border-2 border-slate-200 text-slate-900 font-bold text-sm hover:border-slate-300 transition-colors"
                >
                  <FileText className="inline-block mr-2 h-4 w-4" />
                  Lihat Draft
                </button>
              )}
              <button
                type="button"
                disabled={loading}
                onClick={() => {
                  if (validateForm()) setIsConfirmOpen(true);
                }}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#059669] text-white font-semibold text-sm hover:bg-[#047857] transition-colors shadow-lg shadow-emerald-900/20 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                <Send className="h-4 w-4" />
                {loading ? "Mengirim..." : `Kirim Pengajuan ${selectedService?.name || ""}`}
              </button>
            </div>
          </div>
        )}
      </div>

      {isDraftOpen && (
        <DraftCutiModal
          isOpen={isDraftOpen}
          onClose={() => setIsDraftOpen(false)}
          data={getDraftData()}
          pejabatList={pejabatList}
        />
      )}

      {/* Confirmation Modal */}
      {isConfirmOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-50 mx-auto mb-4">
              <Send className="h-6 w-6 text-emerald-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 text-center mb-1">Konfirmasi Pengajuan</h3>
            <p className="text-sm text-slate-500 text-center mb-6 leading-relaxed">
              Pastikan semua data sudah benar.<br />Pengajuan yang sudah dikirim tidak bisa dibatalkan secara langsung.
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

