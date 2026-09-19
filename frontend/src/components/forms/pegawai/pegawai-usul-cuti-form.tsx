import { getClientApiBase, getClientAuthToken, getSessionUserId } from "@/lib/client-api";
import { useMemo, useState, useEffect, type FormEvent } from "react";
import { useRouter, useSearchParams } from "@/lib/next-compat/navigation";
import { toast } from "sonner";
import { Calendar, FileText, Send, ScrollText, ChevronDown } from "lucide-react";
import { RequestServiceSelection } from "../masyarakat/request-service-selection";
import { RequestFormFields } from "../masyarakat/request-form-fields";
import { RequestRequirementUpload } from "../masyarakat/request-requirement-upload";
import { PegawaiRequestConfirmation } from "../_components/pegawai-request-confirmation";
import { RealtimeSync } from "@/components/ui/realtime-sync";
import { DraftCutiModal } from "@/components/ui/draft-cuti-modal";
import { ModernSelect } from "@/components/ui/modern-select";
import { ModernMultiDatePicker } from "@/components/ui/modern-multi-date-picker";

const MASA_KERJA_TAHUN_OPTIONS = Array.from({ length: 41 }, (_, i) => ({ value: String(i), label: `${i} Tahun` }));
const MASA_KERJA_BULAN_OPTIONS = Array.from({ length: 12 }, (_, i) => ({ value: String(i), label: `${i} Bulan` }));

import { UNIT_KERJA_OPTIONS } from "@/lib/constants";
import { getSisaCutiByNip } from "@/lib/actions/pegawai/cuti";
import { fetchAPI } from "@/lib/api";
import Image from "@/lib/next-compat/image";
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
  const [jenisPegawai, setJenisPegawai] = useState<"PNS" | "PPPK">("PNS");
  const [jabatan, setJabatan] = useState(profile?.jabatan || "");
  const [masaKerjaTahun, setMasaKerjaTahun] = useState(profile?.masaKerjaTahun || "0");
  const [masaKerjaBulan, setMasaKerjaBulan] = useState(profile?.masaKerjaBulan || "0");

  const [alasanCutiText, setAlasanCutiText] = useState("");
  const [alamatCuti, setAlamatCuti] = useState("");
  const [selectedCutiDates, setSelectedCutiDates] = useState("");
  const [tanggalMulai, setTanggalMulai] = useState("");
  const [tanggalSelesai, setTanggalSelesai] = useState("");

  const [selectedAtasanId, setSelectedAtasanId] = useState("");
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
  const [unitKerjaOptions, setUnitKerjaOptions] = useState<string[]>([]);

  useEffect(() => {
    fetchAPI<any>("/master-options")
      .then((res) => {
        if (res?.success && Array.isArray(res?.data)) {
          const uks = res.data
            .filter((o: any) => o.category === "unit_kerja" && o.is_active !== false)
            .sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0))
            .map((o: any) => o.label || o.value);
          if (uks.length > 0) setUnitKerjaOptions(uks);
        }
      })
      .catch(() => {});
  }, []);

  const [isDraftModalOpen, setIsDraftModalOpen] = useState(false);

  // Auto-fill atasan & pejabat berwenang berdasarkan unit kerja pegawai
  useEffect(() => {
    if (!unitKerja || pejabatList.length === 0) return;

    // Normalize string perbandingan unit kerja
    const norm = (s: string) => s.toLowerCase().trim();
    const userUk = norm(unitKerja);

    const kakankemenag = pejabatList.find((p) => 
      p.tipePejabat && p.tipePejabat.toLowerCase() === "pejabat berwenang"
    );
    const kasubagTu = pejabatList.find((p) => 
      p.jabatan && p.jabatan.toLowerCase().includes("tata usaha")
    );

    const atasanMatches = pejabatList.filter((p) => p.unitKerja && norm(p.unitKerja) === userUk);

    if (atasanMatches.length > 0) {
      // Pilih Atasan Langsung dari Unit Kerja tersebut
      const head = atasanMatches.find((p) => p.tipePejabat && p.tipePejabat.toLowerCase() === "atasan langsung") || atasanMatches[0];

      setSelectedAtasanId(head.nip);
      setAtasanLangsungNama(head.nama);
      setAtasanLangsungNip(head.nip);
      setAtasanLangsungJabatan(head.jabatan);
    } else {
      // Tidak ada atasan langsung untuk unit kerja yang dipilih (misal Pejabat Utama)
      setSelectedAtasanId("");
      setAtasanLangsungNama("");
      setAtasanLangsungNip("");
      setAtasanLangsungJabatan("");
    }

    // Pejabat Berwenang Memberikan Cuti (selalu Kepala Kantor Kemenag / Arbaja)
    if (kakankemenag) {
      setPejabatCutiNama(kakankemenag.nama);
      setPejabatCutiNip(kakankemenag.nip);
      setPejabatCutiJabatan(kakankemenag.jabatan);
    } else if (pejabatList.length > 0) {
      // Fallback in case "Pejabat Berwenang" is missing (should not happen)
      setPejabatCutiNama(pejabatList[0].nama);
      setPejabatCutiNip(pejabatList[0].nip);
      setPejabatCutiJabatan(pejabatList[0].jabatan);
    }
  }, [unitKerja, pejabatList]);

  // Auto-select first item when service is locked
  useEffect(() => {
    if (lockedServiceId && catalog.length > 0) {
      const service = catalog.find((s: any) => String(s.id) === lockedServiceId);
      const items = service?.items || service?.serviceItems || [];
      if (items.length > 0) {
        setServiceId(lockedServiceId);
        // Priority check URL query item
        if (urlServiceItemId) {
          const exists = items.find((i: any) => String(i.id) === urlServiceItemId);
          if (exists) {
            setServiceItemId(urlServiceItemId);
            return;
          }
        }
        setServiceItemId(String(items[0].id));
      }
    }
  }, [urlServiceItemId, catalog, lockedServiceId]);

  // Hitung durasi hari cuti berdasarkan tanggal yang dipilih pada multi-date picker
  useEffect(() => {
    if (selectedCutiDates) {
      const datesArray = selectedCutiDates.split(",").filter(Boolean).sort();
      if (datesArray.length > 0) {
        setTanggalMulai(datesArray[0]);
        setTanggalSelesai(datesArray[datesArray.length - 1]);
        setDurasiHari(datesArray.length);
      } else {
        setTanggalMulai("");
        setTanggalSelesai("");
        setDurasiHari(0);
      }
    } else {
      setTanggalMulai("");
      setTanggalSelesai("");
      setDurasiHari(0);
    }
  }, [selectedCutiDates]);

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
      (selectedService?.items || selectedService?.serviceItems)?.find(
        (item: any) => String(item.id) === serviceItemId
      ),
    [selectedService, serviceItemId]
  );

  const handleServiceChange = (id: string) => {
    setServiceId(id);
    const service = catalog.find((item: any) => String(item.id) === id);
    const items = service?.items || service?.serviceItems || [];
    setServiceItemId(items?.[0]?.id ? String(items[0].id) : "");
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
      const userId = await getSessionUserId();
      if (!userId) {
        setLoading(false);
        setError("Silakan login terlebih dahulu untuk mengajukan permohonan.");
        toast.error("Belum Login", {
          description: "Silakan login terlebih dahulu untuk mengajukan permohonan.",
        });
        return;
      }

      // Map field IDs to field labels/names
      const formFields = (selectedItem?.formFields || selectedItem?.form_fields || selectedItem?.serviceFormFields) ?? [];
      const fieldMap = new Map<string, any>();
      formFields.forEach((f: any) => {
        fieldMap.set(String(f.id), f);
        if (f.name) fieldMap.set(String(f.name), f);
      });

      const answers: {
        field_id?: number;
        fieldId?: number;
        field_name: string;
        fieldName: string;
        field_value: string;
        fieldValue: string;
      }[] = [];

      formData.forEach((value, key) => {
        if (
          key === "serviceId" ||
          key === "serviceItemId" ||
          key.startsWith("requirement_") ||
          key === "service_id_select" ||
          key === "service_item_select"
        )
          return;
        if (typeof value !== "string") return;

        const rawKey = key.startsWith("answer_") ? key.replace("answer_", "") : key;
        const matchedField = fieldMap.get(rawKey);
        const resolvedName = matchedField ? (matchedField.label || matchedField.name || rawKey) : rawKey;
        const resolvedId = matchedField?.id ? Number(matchedField.id) : (!isNaN(Number(rawKey)) ? Number(rawKey) : undefined);

        answers.push({
          field_id: resolvedId,
          fieldId: resolvedId,
          field_name: resolvedName,
          fieldName: resolvedName,
          field_value: value,
          fieldValue: value,
        });
      });

      const createRes = await fetch(`${getClientApiBase()}/requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          serviceId: Number(serviceId),
          serviceItemId: Number(serviceItemId),
          answers,
        }),
      });

      const result = await createRes.json().catch(() => ({}));
      setLoading(false);

      if (!createRes.ok || !result.id) {
        setError(result.error || "Gagal membuat pengajuan.");
        toast.error("Gagal", {
          description: result.error || "Terjadi kesalahan saat membuat pengajuan.",
        });
        return;
      }

      const token = getClientAuthToken();
      const uploads = Object.entries(requirementFiles).map(async ([reqId, file]) => {
        const uploadForm = new FormData();
        uploadForm.append("document", file, file.name);
        uploadForm.append("requirementId", reqId);
        uploadForm.append("category", "umum");
        await fetch(`${getClientApiBase()}/requests/${result.id}/documents`, {
          method: "POST",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          body: uploadForm,
        });
      });
      await Promise.all(uploads);

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

      <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {!lockedService && (
          <div className="bg-[#059669] px-4 py-4 sm:px-8 sm:py-5 relative text-white">
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
          <div className="bg-[#059669] px-4 py-4 sm:px-8 sm:py-5 relative text-white">
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 shrink-0 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
                  <Calendar className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h1 className="text-sm sm:text-lg font-bold tracking-tight leading-tight">
                    Formulir Pengajuan Cuti ASN
                  </h1>
                  <p className="text-emerald-100 text-[10px] sm:text-xs mt-0.5 leading-relaxed hidden sm:block">
                    Isi formulir cuti sesuai ketentuan Perka BKN No. 24 Tahun 2017.
                  </p>
                </div>
              </div>

              {/* Tombol Cetak Draft Cuti */}
              <button
                type="button"
                onClick={() => setIsDraftModalOpen(true)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 sm:py-2 mt-1 sm:mt-0 rounded-xl bg-white hover:bg-emerald-50 text-emerald-700 text-xs font-bold transition-all shadow-md hover:shadow-lg active:scale-95 cursor-pointer shrink-0 group"
              >
                <ScrollText className="h-4 w-4 text-emerald-600 group-hover:scale-110 transition-transform" />
                <span>Pratinjau / Cetak Blangko</span>
              </button>
            </div>
            <div className="absolute right-0 top-0 w-40 h-40 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
            <div className="absolute left-0 bottom-0 w-32 h-32 bg-black/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
          </div>
        )}

        <div className="p-4 sm:p-8 space-y-5 sm:space-y-8">
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
          {lockedService && (lockedService.items || lockedService.serviceItems)?.length > 1 && (
            <div className="space-y-1.5 bg-slate-50/80 p-3 sm:p-5 rounded-xl sm:rounded-2xl border border-slate-200/80">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Pilih Jenis {lockedService.name} <span className="text-rose-500">*</span>
              </label>
              <ModernSelect
                value={serviceItemId}
                onChange={setServiceItemId}
                options={(lockedService.items || lockedService.serviceItems).map((item: any) => ({
                  value: String(item.id),
                  label: item.name
                }))}
                placeholder={`Pilih Jenis ${lockedService.name}...`}
                enableSearch={false}
              />
            </div>
          )}

          {/* INFO CARD UNTUK SERVICE TERKUNCI TANPA PILIHAN GANDA */}
          {lockedService && (lockedService.items || lockedService.serviceItems)?.length === 1 && (
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

              {/* INFORMASI PEGAWAI & CUTI */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
                {/* Status Kepegawaian (PNS / PPPK) */}
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-600 block">
                    Status Kepegawaian <span className="text-rose-500">*</span>
                  </label>
                  <ModernSelect
                    value={jenisPegawai}
                    onChange={(val) => setJenisPegawai(val as "PNS" | "PPPK")}
                    options={[
                      { value: "PNS", label: "PNS (Pegawai Negeri Sipil)" },
                      { value: "PPPK", label: "PPPK (Pegawai Pemerintah dengan Perjanjian Kerja)" }
                    ]}
                    enableSearch={false}
                  />
                  <input type="hidden" name="jenisPegawai" value={jenisPegawai} />
                </div>

                {/* Jabatan Pegawai */}
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-600">
                    Jabatan Pegawai <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="jabatan"
                    required
                    value={jabatan}
                    onChange={(e) => setJabatan(e.target.value)}
                    placeholder="Contoh: Analis Kepegawaian Ahli Muda / Pengelola Keuangan"
                    className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  />
                </div>

                {/* Masa Kerja (Tahun & Bulan) */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600">
                    Masa Kerja (Tahun) <span className="text-rose-500">*</span>
                  </label>
                  <ModernSelect
                    options={MASA_KERJA_TAHUN_OPTIONS}
                    value={masaKerjaTahun}
                    onChange={setMasaKerjaTahun}
                    placeholder="Pilih Tahun"
                    enableSearch={true}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600">
                    Masa Kerja (Bulan) <span className="text-rose-500">*</span>
                  </label>
                  <ModernSelect
                    options={MASA_KERJA_BULAN_OPTIONS}
                    value={masaKerjaBulan}
                    onChange={setMasaKerjaBulan}
                    placeholder="Pilih Bulan"
                    enableSearch={true}
                  />
                </div>

                {/* Tanggal Mulai & Selesai Cuti (Combined Multi-Date Picker) */}
                <div className="space-y-1.5 sm:col-span-2">
                  <ModernMultiDatePicker
                    label="Pilih Tanggal Cuti (Bisa lebih dari 1 hari)"
                    required
                    value={selectedCutiDates}
                    onChange={setSelectedCutiDates}
                    placeholder="Klik untuk memilih tanggal..."
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

                {/* No HP & Unit Kerja */}
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

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600">
                    Unit Kerja <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative z-20">
                    <ModernSelect
                      value={unitKerja}
                      onChange={setUnitKerja}
                      options={unitKerjaOptions.length > 0 ? unitKerjaOptions : UNIT_KERJA_OPTIONS}
                      placeholder="-- Pilih Unit Kerja --"
                      enableSearch
                      searchPlaceholder="Cari unit kerja..."
                    />
                  </div>
                  <p className="text-[10px] text-slate-500 italic mt-1">
                    * Atasan Langsung akan ditentukan secara otomatis berdasarkan Unit Kerja yang Anda pilih.
                  </p>
                </div>
              </div>

              {/* ATASAN LANGSUNG & PEJABAT BERWENANG */}
              <div className="border-t border-slate-100 pt-6 space-y-4">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Atasan Langsung & Pejabat Berwenang
                </h3>

                <div className={`grid grid-cols-1 ${pejabatList.some(p => p.unitKerja && p.unitKerja.toLowerCase().trim() === unitKerja.toLowerCase().trim()) ? "sm:grid-cols-2" : ""} gap-4`}>
                  {/* Pemilihan Atasan Langsung Berdasarkan Unit Kerja */}
                  {pejabatList.some(p => p.unitKerja && p.unitKerja.toLowerCase().trim() === unitKerja.toLowerCase().trim()) && (
                    <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 sm:space-y-3">
                      <span className="text-[11px] sm:text-xs font-bold text-slate-800 block">Atasan Langsung</span>
                      <div className="space-y-2">
                        <input
                          type="text"
                          placeholder="Nama Atasan Langsung"
                          value={atasanLangsungNama}
                          readOnly
                          className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-slate-100 text-xs text-slate-600 focus:outline-none cursor-not-allowed"
                        />
                        <input
                          type="text"
                          placeholder="NIP Atasan Langsung"
                          value={atasanLangsungNip}
                          readOnly
                          className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-slate-100 text-xs text-slate-600 focus:outline-none cursor-not-allowed"
                        />
                        <input
                          type="text"
                          placeholder="Jabatan Atasan Langsung"
                          value={atasanLangsungJabatan}
                          readOnly
                          className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-slate-100 text-xs text-slate-600 focus:outline-none cursor-not-allowed"
                        />
                      </div>
                    </div>
                  )}

                  {/* Pejabat Berwenang Memberikan Cuti */}
                  <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 sm:space-y-3">
                    <span className="text-[11px] sm:text-xs font-bold text-slate-800 block">Pejabat Berwenang Memberikan Cuti</span>
                    <div className="space-y-2">
                      <input
                        type="text"
                        placeholder="Nama Pejabat Cuti"
                        value={pejabatCutiNama}
                        readOnly
                        className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-slate-100 text-xs text-slate-600 focus:outline-none cursor-not-allowed"
                      />
                      <input
                        type="text"
                        placeholder="NIP Pejabat Cuti"
                        value={pejabatCutiNip}
                        readOnly
                        className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-slate-100 text-xs text-slate-600 focus:outline-none cursor-not-allowed"
                      />
                      <input
                        type="text"
                        placeholder="Jabatan Pejabat Cuti"
                        value={pejabatCutiJabatan}
                        readOnly
                        className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-slate-100 text-xs text-slate-600 focus:outline-none cursor-not-allowed"
                      />
                    </div>
                  </div>
                </div>
              </div>

            </div>
          ) : (
            <RequestFormFields fields={selectedItem?.formFields || selectedItem?.form_fields || selectedItem?.fields || []} profile={profile} />
          )}

          {/* DOKUMEN PERSYARATAN UPLOAD */}
          {selectedItem?.requirements?.length && !selectedItem?.name?.toLowerCase().includes("tahunan") ? (
            <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="border-t border-slate-100 pt-6">
                <RequestRequirementUpload
                  requirements={selectedItem.requirements.filter((req: any) => {
                    const name = req.name || req.documentName || req.document_name || "";
                    return !name.toLowerCase().includes("formulir");
                  }).slice(0, 1)}
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
            jabatan: jabatan || profile?.jabatan || "",
            unitKerja: unitKerja || profile?.unitKerja || "",
            masaKerjaTahun: masaKerjaTahun || "0",
            masaKerjaBulan: masaKerjaBulan || "0",
            jenisPegawai: jenisPegawai,
            jenisCuti: selectedItem?.name || "Cuti Tahunan",
            alasan: alasanCutiText || "[Alasan Cuti]",
            alamatCuti: alamatCuti || "[Alamat Cuti]",
            tanggalMulai,
            tanggalSelesai,
            noHp: noHpAktif,
            atasanLangsungNama,
            atasanLangsungNip,
            pejabatBerwenangNama: pejabatCutiNama,
            pejabatBerwenangNip: pejabatCutiNip,
            signature: profile?.signature || "TTE_VERIFIED",
          }}
        />
      )}
    </form>
  );
}
