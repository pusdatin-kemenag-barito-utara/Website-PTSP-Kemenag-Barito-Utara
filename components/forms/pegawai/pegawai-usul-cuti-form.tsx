"use client";

import { useMemo, useState, useEffect, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Calendar, FileText, Send, ScrollText, ChevronDown } from "lucide-react";
import { RequestServiceSelection } from "../request-service-selection";
import { RequestFormFields } from "../request-form-fields";
import { RequestRequirementUpload } from "../request-requirement-upload";
import { PegawaiRequestConfirmation } from "../_components/pegawai-request-confirmation";
import { RealtimeSync } from "@/components/ui/realtime-sync";
import { DraftCutiModal } from "@/components/ui/draft-cuti-modal";
import { ModernSelect } from "@/components/ui/modern-select";

import { UNIT_KERJA_OPTIONS } from "@/lib/constants";
import { getSisaCutiByNip } from "@/lib/actions/pegawai/cuti";
import Image from "next/image";
import { useRef } from "react";

type Catalog = any[];

interface PegawaiUsulCutiFormProps {
  catalog: Catalog;
  profile: any;
  redirectPathPrefix?: string;
  lockedServiceId?: string;
  sisaCutiData?: { n: string; n1: string; n2: string };
  pejabatList?: Array<{
    tipePejabat: string | null;
    unitKerja: string | null;
    nama: string;
    nip: string;
    jabatan: string;
  }>;
}

export function PegawaiUsulCutiForm({
  catalog,
  profile,
  redirectPathPrefix = "/pegawai/layanan/riwayat",
  lockedServiceId,
  sisaCutiData,
  pejabatList = [],
}: PegawaiUsulCutiFormProps) {
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

  // Custom Cuti State
  const [alamatCuti, setAlamatCuti] = useState("");
  const [alasanCutiText, setAlasanCutiText] = useState("");
  const [tanggalMulai, setTanggalMulai] = useState("");
  const [tanggalSelesai, setTanggalSelesai] = useState("");

  const [atasanLangsungNip, setAtasanLangsungNip] = useState("");
  const [atasanLangsungNama, setAtasanLangsungNama] = useState("");
  const [atasanLangsungJabatan, setAtasanLangsungJabatan] = useState("");

  const [pejabatCutiNip, setPejabatCutiNip] = useState("");
  const [pejabatCutiNama, setPejabatCutiNama] = useState("");
  const [pejabatCutiJabatan, setPejabatCutiJabatan] = useState("");

  const [durasiHari, setDurasiHari] = useState<number>(0);
  const [sisaN, setSisaN] = useState<string>(sisaCutiData?.n || "0");
  const [sisaN1, setSisaN1] = useState<string>(sisaCutiData?.n1 || "0");
  const [sisaN2, setSisaN2] = useState<string>(sisaCutiData?.n2 || "0");

  const [noHpAktif, setNoHpAktif] = useState(profile?.phone || "");
  const [unitKerja, setUnitKerja] = useState(profile?.unitKerja || "");

  const [isDraftModalOpen, setIsDraftModalOpen] = useState(false);

  // Auto-fill atasan & pejabat berwenang berdasarkan unit kerja pegawai
  useEffect(() => {
    if (!unitKerja || pejabatList.length === 0) return;

    // Normalize string perbandingan unit kerja
    const norm = (s: string) => s.toLowerCase().trim();
    const userUk = norm(unitKerja);

    // Filter pejabat untuk unit kerja yang sama (Atasan Langsung)
    const atasanMatches = pejabatList.filter((p) => p.unitKerja && norm(p.unitKerja) === userUk);

    if (atasanMatches.length > 0) {
      // Prioritaskan Kasubag TU / Kepala KUA / Kepala Madrasah jika ada
      const head = atasanMatches.find(
        (p) =>
          p.tipePejabat === "kasubag_tu" ||
          p.jabatan.toLowerCase().includes("kepala kua") ||
          p.jabatan.toLowerCase().includes("kepala madrasah") ||
          p.jabatan.toLowerCase().includes("kepala min") ||
          p.jabatan.toLowerCase().includes("kepala mtsn") ||
          p.jabatan.toLowerCase().includes("kepala man")
      ) || atasanMatches[0];

      setAtasanLangsungNama(head.nama);
      setAtasanLangsungNip(head.nip);
      setAtasanLangsungJabatan(head.jabatan);
    }

    // Pejabat Berwenang Memberikan Cuti (biasanya Kepala Kantor Kemenag)
    const kakankemenag = pejabatList.find((p) => p.tipePejabat === "kepala_kantor");
    if (kakankemenag) {
      setPejabatCutiNama(kakankemenag.nama);
      setPejabatCutiNip(kakankemenag.nip);
      setPejabatCutiJabatan(kakankemenag.jabatan);
    } else {
      // Fallback ke pejabat tingkat tertinggi jika Kepala Kantor tidak diset khusus
      const anyHead = pejabatList.find((p) => p.tipePejabat === "kasubag_tu") || pejabatList[0];
      if (anyHead) {
        setPejabatCutiNama(anyHead.nama);
        setPejabatCutiNip(anyHead.nip);
        setPejabatCutiJabatan(anyHead.jabatan);
      }
    }
  }, [unitKerja, pejabatList]);

  // Auto-select first item when service is locked
  useEffect(() => {
    if (lockedServiceId && catalog.length > 0) {
      const service = catalog.find((s: any) => String(s.id) === lockedServiceId);
      if (service?.serviceItems?.length > 0) {
        setServiceId(lockedServiceId);
        // Priority check URL query item
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

  // Hitung durasi hari kerja (Excluding Sabtu & Minggu)
  useEffect(() => {
    if (tanggalMulai && tanggalSelesai) {
      const start = new Date(tanggalMulai);
      const end = new Date(tanggalSelesai);
      if (start <= end) {
        let count = 0;
        const cur = new Date(start);
        while (cur <= end) {
          const day = cur.getDay();
          if (day !== 0 && day !== 6) count++;
          cur.setDate(cur.getDate() + 1);
        }
        setDurasiHari(count);
      } else {
        setDurasiHari(0);
      }
    } else {
      setDurasiHari(0);
    }
  }, [tanggalMulai, tanggalSelesai]);

  const [requirementFiles, setRequirementFiles] = useState<Record<string, File>>({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);

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

  const handleServiceChange = (id: string) => {
    setServiceId(id);
    const service = catalog.find((item: any) => String(item.id) === id);
    setServiceItemId(service?.serviceItems?.[0]?.id ? String(service.serviceItems[0].id) : "");
  };

  const validateForm = () => {
    if (!formRef.current) return false;
    
    if (!formRef.current.checkValidity()) {
      formRef.current.reportValidity();
      return false;
    }

    if (!selectedService || !selectedItem) {
      toast.error("Validasi Gagal", { description: "Silakan pilih jenis layanan terlebih dahulu." });
      return false;
    }

    if (isCutiService) {
      if (!tanggalMulai || !tanggalSelesai) {
        toast.error("Validasi Gagal", { description: "Tanggal mulai dan selesai cuti wajib diisi." });
        return false;
      }
      if (new Date(tanggalMulai) > new Date(tanggalSelesai)) {
        toast.error("Validasi Gagal", { description: "Tanggal selesai tidak boleh lebih awal dari tanggal mulai." });
        return false;
      }
      if (!alasanCutiText.trim()) {
        toast.error("Validasi Gagal", { description: "Alasan cuti wajib diisi." });
        return false;
      }
      if (!alamatCuti.trim()) {
        toast.error("Validasi Gagal", { description: "Alamat selama menjalankan cuti wajib diisi." });
        return false;
      }
    }

    if (selectedItem.requirements?.length) {
      for (const req of selectedItem.requirements) {
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

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validateForm()) return;

    setError("");
    setLoading(true);

    const formData = new FormData(formRef.current!);
    
    if (isCutiService) {
      formData.append("alasanCuti", alasanCutiText);
      formData.append("alamatCuti", alamatCuti);
      formData.append("tanggalMulaiCuti", tanggalMulai);
      formData.append("tanggalSelesaiCuti", tanggalSelesai);
      formData.append("lamaCutiHari", String(durasiHari));
      formData.append("atasanLangsungNip", atasanLangsungNip);
      formData.append("atasanLangsungNama", atasanLangsungNama);
      formData.append("atasanLangsungJabatan", atasanLangsungJabatan);
      formData.append("pejabatCutiNip", pejabatCutiNip);
      formData.append("pejabatCutiNama", pejabatCutiNama);
      formData.append("pejabatCutiJabatan", pejabatCutiJabatan);
      formData.append("sisaCutiN", sisaN);
      formData.append("sisaCutiN1", sisaN1);
      formData.append("sisaCutiN2", sisaN2);
      formData.append("noHpAktif", noHpAktif);
      formData.append("unitKerja", unitKerja);
    }

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

      toast.success("Pengajuan Cuti Berhasil Dikirim!", {
        description: `Nomor Tiket: ${result.requestNumber || result.id}\nPengajuan Cuti Anda telah masuk ke sistem dan menunggu verifikasi atasan.`,
        duration: 3500,
      });
      router.push(`${redirectPathPrefix}`);
      router.refresh();
    } catch (err) {
      setLoading(false);
      setError("Terjadi kesalahan koneksi.");
    }
  };

  const isCutiService = selectedService?.name?.toLowerCase().includes("cuti");

  if (!catalog.length) {
    return <p className="text-sm text-slate-500">Belum ada layanan aktif.</p>;
  }

  return (
    <form ref={formRef} onSubmit={onSubmit} className="w-full">
      <RealtimeSync />

      <input type="hidden" name="serviceId" value={serviceId} />
      <input type="hidden" name="serviceItemId" value={serviceItemId} />

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm">
        {!lockedService && (
          <div className="bg-[#059669] px-6 py-4 sm:px-8 sm:py-5 relative overflow-hidden text-white rounded-t-3xl">
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 shrink-0 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
                  <Calendar className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h1 className="text-base sm:text-lg font-bold tracking-tight leading-tight">
                    Formulir Layanan Pegawai / ASN
                  </h1>
                  <p className="text-emerald-100 text-xs mt-0.5 leading-relaxed hidden sm:block">
                    Ajukan permohonan layanan internal kepegawaian secara digital.
                  </p>
                </div>
              </div>
            </div>
            <div className="absolute right-0 top-0 w-40 h-40 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
            <div className="absolute left-0 bottom-0 w-32 h-32 bg-black/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
          </div>
        )}

        {lockedService && isCutiService && (
          <div className="bg-[#059669] px-6 py-4 sm:px-8 sm:py-5 relative overflow-hidden text-white rounded-t-3xl">
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 shrink-0 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
                  <Calendar className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h1 className="text-base sm:text-lg font-bold tracking-tight leading-tight">
                    Formulir Pengajuan Cuti ASN
                  </h1>
                  <p className="text-emerald-100 text-xs mt-0.5 leading-relaxed hidden sm:block">
                    Isi formulir cuti sesuai ketentuan Perka BKN No. 24 Tahun 2017.
                  </p>
                </div>
              </div>

              {/* Tombol Cetak Draft Cuti */}
              <button
                type="button"
                onClick={() => setIsDraftModalOpen(true)}
                className="self-start sm:self-auto inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/15 hover:bg-white/25 backdrop-blur-md text-white text-xs font-bold transition-all border border-white/20 shadow-xs active:scale-95 cursor-pointer shrink-0"
              >
                <ScrollText className="h-4 w-4 text-emerald-200" />
                <span>Pratinjau / Cetak Blangko Cuti</span>
              </button>
            </div>
            <div className="absolute right-0 top-0 w-40 h-40 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
            <div className="absolute left-0 bottom-0 w-32 h-32 bg-black/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
          </div>
        )}

        <div className="p-6 sm:p-8 space-y-6 sm:space-y-8">
          {/* TAB / SERVIS SELECTION - Hide if locked */}
          {!lockedServiceId && (
            <RequestServiceSelection
              catalog={catalog}
              serviceId={serviceId}
              serviceItemId={serviceItemId}
              onServiceChange={handleServiceChange}
              onItemChange={setServiceItemId}
            />
          )}

          {/* Sub-Pilihan Jenis Cuti (Item Layanan) jika Service dikunci */}
          {lockedService && lockedService.serviceItems?.length > 1 && (
            <div className="space-y-3 bg-slate-50/80 p-4 sm:p-5 rounded-2xl border border-slate-200/80">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Pilih Jenis {lockedService.name} <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                {lockedService.serviceItems.map((item: any) => {
                  const isSelected = String(item.id) === serviceItemId;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setServiceItemId(String(item.id))}
                      className={`px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left flex items-center justify-between border ${
                        isSelected
                          ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                          : "bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-100/50"
                      }`}
                    >
                      <span className="truncate">{item.name}</span>
                      {isSelected && <span className="h-2 w-2 rounded-full bg-white shrink-0 ml-1.5" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* INFO CARD UNTUK SERVICE TERKUNCI TANPA PILIHAN GANDA */}
          {lockedService && lockedService.serviceItems?.length === 1 && (
            <div className="bg-emerald-50/50 border border-emerald-200/60 rounded-2xl p-4 flex items-center gap-3 text-emerald-900">
              <div className="h-8 w-8 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
                <FileText className="h-4 w-4 text-emerald-700" />
              </div>
              <div>
                <p className="text-xs font-bold">{selectedItem?.name || lockedService.name}</p>
                <p className="text-[11px] text-emerald-700/80 leading-snug">
                  {selectedItem?.description || "Formulir usulan resmi kepegawaian Kementerian Agama."}
                </p>
              </div>
            </div>
          )}

          {/* FORM FIELDS - Custom khusus Cuti atau General */}
          {isCutiService ? (
            <div className="space-y-6">

              {/* GRID FORM CUTI */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
                {/* Tanggal Mulai Cuti */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600">
                    Tanggal Mulai Cuti <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={tanggalMulai}
                    onChange={(e) => setTanggalMulai(e.target.value)}
                    className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  />
                </div>

                {/* Tanggal Selesai Cuti */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600">
                    Tanggal Selesai Cuti <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={tanggalSelesai}
                    onChange={(e) => setTanggalSelesai(e.target.value)}
                    className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  />
                </div>

                {/* Lama Cuti (Otomatis) */}
                <div className="space-y-1.5 sm:col-span-2">
                  <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100 flex items-center justify-between text-xs">
                    <span className="font-medium text-emerald-800">Lama Cuti (Hari Kerja/Efektif):</span>
                    <span className="font-bold text-emerald-700 text-sm">{durasiHari} Hari</span>
                  </div>
                </div>

                {/* Alasan Cuti */}
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-600">
                    Alasan Cuti <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={2}
                    value={alasanCutiText}
                    onChange={(e) => setAlasanCutiText(e.target.value)}
                    placeholder="Tuliskan alasan pengajuan cuti secara rinci..."
                    className="w-full p-3.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  />
                </div>

                {/* Alamat Selama Cuti */}
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-600">
                    Alamat Selama Menjalankan Cuti <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={alamatCuti}
                    onChange={(e) => setAlamatCuti(e.target.value)}
                    placeholder="Jl. Contoh No. 12, Muara Teweh, Kalteng"
                    className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  />
                </div>

                {/* Unit Kerja & No HP */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600">
                    Unit Kerja <span className="text-rose-500">*</span>
                  </label>
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
                  <label className="text-xs font-semibold text-slate-600">
                    No. HP / WhatsApp (Aktif) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={noHpAktif}
                    onChange={(e) => setNoHpAktif(e.target.value.replace(/\D/g, ""))}
                    placeholder="08123456789"
                    className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  />
                </div>
              </div>

              {/* ATASAN LANGSUNG & PEJABAT BERWENANG */}
              <div className="border-t border-slate-100 pt-6 space-y-4">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Atasan Langsung & Pejabat Berwenang
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Atasan Langsung */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                    <span className="text-xs font-bold text-slate-800 block">Atasan Langsung</span>
                    <div className="space-y-2">
                      <input
                        type="text"
                        placeholder="Nama Atasan Langsung"
                        value={atasanLangsungNama}
                        onChange={(e) => setAtasanLangsungNama(e.target.value)}
                        className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                      />
                      <input
                        type="text"
                        placeholder="NIP Atasan Langsung"
                        value={atasanLangsungNip}
                        onChange={(e) => setAtasanLangsungNip(e.target.value)}
                        className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                      />
                      <input
                        type="text"
                        placeholder="Jabatan Atasan Langsung"
                        value={atasanLangsungJabatan}
                        onChange={(e) => setAtasanLangsungJabatan(e.target.value)}
                        className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                      />
                    </div>
                  </div>

                  {/* Pejabat Berwenang Memberikan Cuti */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                    <span className="text-xs font-bold text-slate-800 block">Pejabat Berwenang Memberikan Cuti</span>
                    <div className="space-y-2">
                      <input
                        type="text"
                        placeholder="Nama Pejabat Cuti"
                        value={pejabatCutiNama}
                        onChange={(e) => setPejabatCutiNama(e.target.value)}
                        className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                      />
                      <input
                        type="text"
                        placeholder="NIP Pejabat Cuti"
                        value={pejabatCutiNip}
                        onChange={(e) => setPejabatCutiNip(e.target.value)}
                        className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                      />
                      <input
                        type="text"
                        placeholder="Jabatan Pejabat Cuti"
                        value={pejabatCutiJabatan}
                        onChange={(e) => setPejabatCutiJabatan(e.target.value)}
                        className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                      />
                    </div>
                  </div>
                </div>
              </div>

            </div>
          ) : (
            <RequestFormFields fields={selectedItem?.fields || []} profile={profile} />
          )}

          {/* DOKUMEN PERSYARATAN UPLOAD */}
          {selectedItem?.requirements?.length ? (
            <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="border-t border-slate-100 pt-6">
                <RequestRequirementUpload
                  requirements={selectedItem.requirements}
                  onFilesChange={setRequirementFiles}
                />
              </div>
            </div>
          ) : null}

          {/* CHECKBOX KONFIRMASI & TOMBOL SUBMIT */}
          {selectedService && selectedItem && (
            <PegawaiRequestConfirmation
              isConfirmed={isConfirmed}
              onConfirmChange={setIsConfirmed}
              loading={loading}
              error={error}
            />
          )}
        </div>
      </div>

      {/* MODAL PRINT DRAFT BLANGKO CUTI */}
      {isDraftModalOpen && (
        <DraftCutiModal
          isOpen={isDraftModalOpen}
          onClose={() => setIsDraftModalOpen(false)}
          data={{
            nama: profile?.fullName || "",
            nip: profile?.nip || (profile?.email?.includes('@') ? profile.email.split('@')[0].replace(/\D/g, '') : ""),
            jabatan: profile?.jabatan || "",
            unitKerja: unitKerja || profile?.unitKerja || "",
            masaKerjaTahun: profile?.masaKerjaTahun || "0",
            masaKerjaBulan: profile?.masaKerjaBulan || "0",
            jenisCuti: selectedItem?.name || "Cuti Tahunan",
            alasan: alasanCutiText || "[Alasan Cuti]",
            alamatCuti: alamatCuti || "[Alamat Cuti]",
            tanggalMulai,
            tanggalSelesai,
            noHp: noHpAktif,
            signature: profile?.signature || "",
          }}
        />
      )}
    </form>
  );
}
