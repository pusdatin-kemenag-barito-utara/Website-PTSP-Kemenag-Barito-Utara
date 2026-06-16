"use client";

import { useState, useEffect, useRef } from "react";
import {
  createPengajuanCutiAction,
  getPegawaiProfileAction,
} from "@/lib/actions/pegawai/cuti";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { SignaturePad } from "@/components/ui/signature-pad";
import { ModernMultiDatePicker } from "@/components/ui/modern-multi-date-picker";
import { ModernSelect } from "@/components/ui/modern-select";
import { DraftCutiModal } from "@/components/ui/draft-cuti-modal";
import { AlertDialog } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import {
  Loader2,
  CalendarRange,
  Send,
  FileText,
  UploadCloud,
  Link as LinkIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { UNIT_KERJA_OPTIONS as FALLBACK_UNIT_KERJA } from "@/lib/constants";
import { getPejabatList } from "@/lib/actions/admin/pejabat-actions";
import { getMasterOptionsAction } from "@/lib/actions/admin/master-options-actions";



const TAHUN_OPTIONS = Array.from({ length: 41 }, (_, i) => ({
  value: String(i),
  label: `${i} Tahun`,
}));

const BULAN_OPTIONS = Array.from({ length: 12 }, (_, i) => ({
  value: String(i + 1),
  label: `${i + 1} Bulan`,
}));



export default function PengajuanCutiPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [signature, setSignature] = useState("");
  const [tanggalPilihan, setTanggalPilihan] = useState<string[]>([]);
  const [jenisCuti, setJenisCuti] = useState("");
  const [noHp, setNoHp] = useState("");
  const [masaKerjaTahun, setMasaKerjaTahun] = useState("");
  const [masaKerjaBulan, setMasaKerjaBulan] = useState("");
  const [unitKerja, setUnitKerja] = useState("");
  const [alamatCuti, setAlamatCuti] = useState("");
  const [alasan, setAlasan] = useState("");
  const [jenisPegawai, setJenisPegawai] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isDraftOpen, setIsDraftOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  // File tidak akan di-reset otomatis saat jenis cuti berubah
  // agar user tidak perlu mengunggah ulang jika tidak sengaja mengganti dropdown

  const showDocumentUpload =
    jenisCuti !== "" &&
    ![
      "Cuti Tahunan",
      "Cuti Alasan Penting",
      "Cuti Di Luar Tanggungan Negara",
    ].includes(jenisCuti);

  let documentHint = "Upload file pendukung (PDF, JPG, PNG) maksimal 5MB.";
  let documentRequired = false;

  if (jenisCuti === "Cuti Besar") {
    documentHint =
      "Wajib: Upload Surat Keterangan Jadwal Manasik dan Kloter Kemenag (PDF/JPG/PNG max 5MB).";
    documentRequired = true;
  } else if (jenisCuti === "Cuti Sakit" || jenisCuti === "Cuti Bersalin") {
    documentHint =
      "Wajib: Upload Surat Keterangan dari Dokter / Puskesmas / Rumah Sakit (PDF/JPG/PNG max 5MB).";
    documentRequired = true;
  }

  const toTitleCase = (str: string) => {
    return str.replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const [profile, setProfile] = useState({
    nama: "",
    nip: "",
    jabatan: "",
    isSuperAdmin: false,
    sisaCuti: null as number | null,
    cutiTahun2: null as number | null,
    cutiTahun1: null as number | null,
    hakBerjalan: null as number | null,
    jumlahCuti: null as number | null,
    cutiTahunan: [] as number[],
    totalDiambil: 0,
    cutiAlasanPenting: null as number | null,
    cutiBesar: null as number | null,
    cutiBersalin: null as number | null,
    cutiSakit: null as number | null,
  });
  const [profileLoading, setProfileLoading] = useState(true);
  const [pejabatList, setPejabatList] = useState<any[]>([]);
  const [masterOptions, setMasterOptions] = useState<{
    jenisCuti: any[];
    jenisPegawai: any[];
  }>({ jenisCuti: [], jenisPegawai: [] });

  const JENIS_CUTI_OPTIONS = masterOptions.jenisCuti.map(o => o.value);
  const JENIS_PEGAWAI_OPTIONS = masterOptions.jenisPegawai.map(o => ({ value: o.value, label: o.label }));
  const UNIT_KERJA_OPTIONS = Array.from(new Set(pejabatList.map(p => p.unitKerja).filter(Boolean))).map(val => ({ value: val, label: val }));

  const isCutiTahunanDisabled =
    profile.sisaCuti !== null && profile.sisaCuti <= 0;
  const availableJenisCuti = isCutiTahunanDisabled
    ? JENIS_CUTI_OPTIONS.filter((o) => o !== "Cuti Tahunan")
    : JENIS_CUTI_OPTIONS;

  useEffect(() => {
    if (isCutiTahunanDisabled && jenisCuti === "Cuti Tahunan") {
      setJenisCuti("");
      toast.error("Sisa cuti tahunan Anda sudah habis.");
    }
  }, [isCutiTahunanDisabled]);

  useEffect(() => {
    async function loadProfile() {
      const data = await getPegawaiProfileAction();
      if (data) {
        setProfile({
          nama: data.nama,
          nip: data.nip,
          jabatan: data.jabatan,
          isSuperAdmin: data.isSuperAdmin,
          sisaCuti: data.sisaCuti ?? null,
          cutiTahun2: data.cutiTahun2 ?? null,
          cutiTahun1: data.cutiTahun1 ?? null,
          hakBerjalan: data.hakBerjalan ?? null,
          jumlahCuti: data.jumlahCuti ?? null,
          cutiTahunan: data.cutiTahunan ?? [],
          totalDiambil: data.totalDiambil ?? 0,
          cutiAlasanPenting: data.cutiAlasanPenting ?? null,
          cutiBesar: data.cutiBesar ?? null,
          cutiBersalin: data.cutiBersalin ?? null,
          cutiSakit: data.cutiSakit ?? null,
        });
        setUnitKerja(data.unitKerja);

        // Autofill field based on profile
        if (data.jabatan) {
          if (data.jabatan.toLowerCase().includes("pppk")) {
            setJenisPegawai("PPPK");
          } else {
            setJenisPegawai("PNS");
          }
        }
      }
      
      const pejabatRes = await getPejabatList();
      if (pejabatRes.success) {
        setPejabatList(pejabatRes.data || []);
      }
      
      const optionsRes = await getMasterOptionsAction();
      if (optionsRes.success) {
        const allOps = optionsRes.data || [];
        setMasterOptions({
          jenisCuti: allOps.filter((o: any) => o.category === "jenis_cuti" && o.isActive),
          jenisPegawai: allOps.filter((o: any) => o.category === "jenis_pegawai" && o.isActive),
        });
      }
      
      setProfileLoading(false);
    }
    loadProfile();
  }, []);

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!signature) {
      toast.error("Silakan berikan tanda tangan Anda terlebih dahulu.");
      return;
    }

    if (tanggalPilihan.length === 0) {
      toast.error("Silakan pilih tanggal cuti terlebih dahulu.");
      return;
    }

    if (showDocumentUpload && documentRequired && !file) {
      toast.error("Silakan upload dokumen pendukung yang diwajibkan.");
      return;
    }

    setIsConfirmOpen(true);
  };

  const handleConfirmSubmit = async () => {
    if (loading) return;
    if (!formRef.current) return;
    setLoading(true);
    setIsConfirmOpen(false);

    const formData = new FormData(formRef.current);
    formData.append("tandaTangan", signature);
    formData.append("jenisPegawai", jenisPegawai);
    formData.append("unitKerja", unitKerja);
    formData.append("noHp", noHp);
    if (tanggalPilihan.length > 0) {
      formData.append("tanggalPilihan", tanggalPilihan.join(","));
    }

    if (file) {
      formData.append("dokumen", file);
    }

    const result = await createPengajuanCutiAction(formData);

    setLoading(false);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Pengajuan cuti berhasil dikirim!");
      router.refresh();
      router.push("/pegawai/cuti");
    }
  };

  return (
    <div className="w-full max-w-full mx-auto p-4 sm:p-6 lg:p-8">
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-900 px-6 py-8 sm:px-10 sm:py-12 text-white relative overflow-hidden">
          {/* Abstract background shapes */}
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-emerald-400 opacity-20 rounded-full blur-3xl mix-blend-screen"></div>
          <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-48 h-48 bg-emerald-500 opacity-20 rounded-full blur-2xl mix-blend-screen"></div>

          <div className="relative z-10">
            <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-white/10 rounded-2xl mb-4 sm:mb-6 backdrop-blur-md border border-white/20 shadow-xl">
              <CalendarRange className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight mb-2 sm:mb-3 drop-shadow-md">
              Formulir Pengajuan Cuti
            </h1>
            <p className="text-emerald-50/90 text-sm sm:text-base font-medium leading-relaxed max-w-lg">
              Silakan lengkapi data di bawah ini untuk mengajukan permohonan
              cuti Anda. Pastikan sisa cuti Anda mencukupi sebelum mengajukan.
            </p>
          </div>
        </div>

        <div className="p-4 sm:p-10">
          <form
            ref={formRef}
            onSubmit={handleFormSubmit}
            className="space-y-6 sm:space-y-8"
          >
            {/* Data Pegawai Section */}
            <div className="space-y-4 sm:space-y-6">
              <h3 className="text-lg font-bold text-slate-800 border-b pb-2 border-slate-100">
                Data Pegawai
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <Field label="Jenis Pegawai" required>
                  <ModernSelect
                    options={JENIS_PEGAWAI_OPTIONS}
                    value={jenisPegawai}
                    onChange={setJenisPegawai}
                    placeholder="Pilih PNS / PPPK"
                    name="jenisPegawai"
                    required
                  />
                </Field>
                <div className="hidden sm:block"></div>
                <Field label="Nama Lengkap">
                  {profileLoading ? (
                    <div className="h-10 w-full bg-slate-200 animate-pulse rounded-md border border-slate-100"></div>
                  ) : (
                    <Input
                      name="nama"
                      value={profile.nama}
                      onChange={(e) =>
                        profile.isSuperAdmin &&
                        setProfile({ ...profile, nama: e.target.value })
                      }
                      readOnly={!profile.isSuperAdmin}
                      className={
                        !profile.isSuperAdmin
                          ? "bg-slate-100 font-medium text-slate-500 cursor-not-allowed"
                          : "bg-slate-50 font-medium"
                      }
                    />
                  )}
                </Field>
                <Field label="NIP">
                  {profileLoading ? (
                    <div className="h-10 w-full bg-slate-200 animate-pulse rounded-md border border-slate-100"></div>
                  ) : (
                    <Input
                      name="nip"
                      value={profile.nip}
                      onChange={(e) =>
                        profile.isSuperAdmin &&
                        setProfile({ ...profile, nip: e.target.value })
                      }
                      readOnly={!profile.isSuperAdmin}
                      className={
                        !profile.isSuperAdmin
                          ? "bg-slate-100 font-medium text-slate-500 cursor-not-allowed"
                          : "bg-slate-50 font-medium"
                      }
                    />
                  )}
                </Field>
                <Field label="Jabatan">
                  {profileLoading ? (
                    <div className="h-10 w-full bg-slate-200 animate-pulse rounded-md border border-slate-100"></div>
                  ) : (
                    <Input
                      name="jabatan"
                      value={profile.jabatan}
                      onChange={(e) =>
                        setProfile({ ...profile, jabatan: e.target.value })
                      }
                      placeholder="Masukkan jabatan Anda"
                      className="bg-slate-50 font-medium"
                    />
                  )}
                </Field>
                <Field label="Unit Kerja">
                  <ModernSelect
                    options={UNIT_KERJA_OPTIONS}
                    value={unitKerja}
                    onChange={setUnitKerja}
                    placeholder="Pilih Unit Kerja"
                    name="unitKerja"
                    enableSearch
                  />
                </Field>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <Field label="Masa Kerja (Tahun)" required>
                  <ModernSelect
                    options={TAHUN_OPTIONS}
                    value={masaKerjaTahun}
                    onChange={setMasaKerjaTahun}
                    placeholder="Pilih Tahun"
                    name="masaKerjaTahun"
                    required
                    enableSearch
                  />
                </Field>
                <Field label="Masa Kerja (Bulan)" required>
                  <ModernSelect
                    options={BULAN_OPTIONS}
                    value={masaKerjaBulan}
                    onChange={setMasaKerjaBulan}
                    placeholder="Pilih Bulan"
                    name="masaKerjaBulan"
                    required
                    enableSearch
                  />
                </Field>
              </div>
            </div>

            {/* Cuti Section */}
            <div className="space-y-4 sm:space-y-6 pt-4">
              <h3 className="text-lg font-bold text-slate-800 border-b pb-2 border-slate-100">
                Detail Pengajuan Cuti
              </h3>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-slate-700">
                    Jenis Cuti <span className="text-red-500">*</span>
                  </label>
                  <ModernSelect
                    options={availableJenisCuti}
                    value={jenisCuti}
                    onChange={setJenisCuti}
                    placeholder="-- Pilih Jenis Cuti --"
                    name="jenisCuti"
                    required
                  />
                </div>

                <Field label="No HP / WhatsApp" required>
                  <Input
                    name="noHp"
                    value={noHp}
                    onChange={(e) => setNoHp(e.target.value.replace(/\D/g, ""))}
                    required
                    inputMode="numeric"
                    placeholder="Contoh: 08123456789"
                    className="bg-slate-50 font-medium"
                  />
                </Field>

                <ModernMultiDatePicker
                  label="Tanggal Cuti"
                  name="tanggalPilihanDummy" // Not sent directly via form, appended in handleSubmit
                  value={tanggalPilihan}
                  onChange={setTanggalPilihan}
                  required={tanggalPilihan.length === 0}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 items-start">
                <Field
                  label="Alamat Selama Menjalankan Cuti"
                  required
                  hint="Alamat lengkap tempat Anda berada selama cuti"
                >
                  <Input
                    name="alamatCuti"
                    value={alamatCuti}
                    onChange={(e) => setAlamatCuti(toTitleCase(e.target.value))}
                    required
                    placeholder="Contoh: Jl. Ahmad Yani No. 126 Muara Teweh..."
                    className="bg-slate-50 font-medium"
                  />
                </Field>

                <Field
                  label="Alasan Cuti / Keterangan"
                  required
                  hint="Tuliskan alasan lengkap pengajuan cuti Anda"
                >
                  <textarea
                    name="alasan"
                    value={alasan}
                    onChange={(e) => setAlasan(toTitleCase(e.target.value))}
                    required
                    rows={2}
                    placeholder="Contoh: Menghadiri pernikahan saudara..."
                    className="flex w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm ring-offset-white placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:bg-white focus-visible:border-emerald-500 transition-all font-medium text-slate-800 resize-none"
                  ></textarea>
                </Field>
              </div>

              {showDocumentUpload && (
                <Field
                  label="Dokumen Pendukung"
                  required={documentRequired}
                  hint={documentHint}
                >
                  <div className="relative flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 hover:bg-slate-100 hover:border-emerald-400 transition-colors cursor-pointer overflow-hidden group">
                    <input
                      type="file"
                      required={documentRequired && !file}
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          const selectedFile = e.target.files[0];
                          if (selectedFile.size > 5 * 1024 * 1024) {
                            toast.error("Ukuran file maksimal 5MB");
                            return;
                          }
                          setFile(selectedFile);
                        }
                      }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      accept=".pdf,.jpg,.jpeg,.png"
                    />
                    {file ? (
                      <div className="flex flex-col items-center justify-center w-full h-full relative">
                        <div className="flex flex-col items-center text-emerald-600">
                          <FileText className="w-8 h-8 mb-2" />
                          <p className="text-sm font-semibold truncate max-w-[200px]">
                            {file.name}
                          </p>
                          <p className="text-xs text-slate-500 mb-3">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            className="text-xs font-semibold bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-lg hover:bg-emerald-200 transition-colors flex items-center gap-1 z-20 relative"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              const fileUrl = URL.createObjectURL(file);
                              window.open(fileUrl, "_blank");
                            }}
                          >
                            <LinkIcon className="w-3 h-3" /> Lihat
                          </button>
                          <button
                            type="button"
                            className="text-xs font-semibold bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg hover:bg-slate-300 transition-colors z-20 relative"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              const input = e.currentTarget
                                .closest(".group")
                                ?.querySelector(
                                  'input[type="file"]',
                                ) as HTMLInputElement;
                              if (input) input.click();
                            }}
                          >
                            Ubah
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center text-slate-500 group-hover:text-emerald-500 transition-colors px-4 text-center">
                        <UploadCloud className="w-8 h-8 mb-2 text-slate-400 group-hover:text-emerald-400" />
                        <p className="text-sm font-medium">
                          Klik atau tarik file ke sini
                        </p>
                        <p className="text-xs mt-1 text-slate-400">
                          PDF, JPG, PNG (Max. 5MB)
                        </p>
                      </div>
                    )}
                  </div>
                </Field>
              )}

              <div className="pt-4">
                <Field
                  label="Tanda Tangan Pemohon"
                  required
                  hint="Tanda tangan elektronik diterbitkan otomatis berdasarkan NIP Anda"
                >
                  <SignaturePad
                    onSave={setSignature}
                    nip={profile.nip}
                    nama={profile.nama}
                    className="max-w-md"
                  />
                </Field>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDraftOpen(true)}
                className="w-full sm:w-auto h-12 px-6 border-2 border-slate-200 text-slate-900 hover:border-slate-300 font-bold rounded-xl transition-all active:scale-95"
              >
                <FileText className="mr-2 h-5 w-5" />
                Lihat Draft
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto h-12 px-8 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20 transition-all active:scale-95"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Mengirim Pengajuan...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-5 w-5" />
                    Kirim Pengajuan Cuti
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>

      <DraftCutiModal
        isOpen={isDraftOpen}
        onClose={() => setIsDraftOpen(false)}
        data={{
          nama: profile.nama,
          nip: profile.nip,
          jabatan: profile.jabatan,
          jenisPegawai,
          unitKerja,
          masaKerjaTahun,
          masaKerjaBulan,
          jenisCuti,
          alasan,
          tanggalPilihan: tanggalPilihan.join(","),
          tanggalMulai:
            tanggalPilihan.length > 0 ? [...tanggalPilihan].sort()[0] : "",
          tanggalSelesai:
            tanggalPilihan.length > 0
              ? [...tanggalPilihan].sort()[tanggalPilihan.length - 1]
              : "",
          alamatCuti,
          noHp,
          signature: signature,
          sisaCuti: profile.sisaCuti ?? undefined,
          cutiTahun2: profile.cutiTahun2 ?? undefined,
          cutiTahun1: profile.cutiTahun1 ?? undefined,
          hakBerjalan: profile.hakBerjalan ?? undefined,
          jumlahCuti: profile.jumlahCuti ?? undefined,
          totalDiambil: profile.totalDiambil,
          cutiAlasanPenting: profile.cutiAlasanPenting ?? undefined,
          cutiBesar: profile.cutiBesar ?? undefined,
          cutiBersalin: profile.cutiBersalin ?? undefined,
          cutiSakit: profile.cutiSakit ?? undefined,
        }}
        pejabatList={pejabatList}
      />

      <AlertDialog
        open={isConfirmOpen}
        onOpenChange={setIsConfirmOpen}
        title="Konfirmasi Pengajuan"
        description="Apakah Anda yakin ingin mengirimkan formulir pengajuan cuti ini? Pastikan semua data yang Anda isikan sudah benar."
        onConfirm={handleConfirmSubmit}
        loading={loading}
        confirmText="Ya, Ajukan Cuti"
        cancelText="Batal"
        variant="info"
      />
    </div>
  );
}
