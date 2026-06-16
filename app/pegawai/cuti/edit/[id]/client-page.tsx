"use client";

import { useState, useEffect, useRef } from "react";
import {
  updatePengajuanCutiAction,
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
import { UNIT_KERJA_OPTIONS } from "@/lib/constants";
import { getPejabatList } from "@/lib/actions/admin/pejabat-actions";

const JENIS_CUTI_OPTIONS = [
  "Cuti Tahunan",
  "Cuti Besar",
  "Cuti Sakit",
  "Cuti Bersalin",
  "Cuti Alasan Penting",
  "Cuti Di Luar Tanggungan Negara",
];

const TAHUN_OPTIONS = Array.from({ length: 41 }, (_, i) => ({
  value: String(i).padStart(2, "0"),
  label: `${String(i).padStart(2, "0")} Tahun`,
}));

const BULAN_OPTIONS = Array.from({ length: 12 }, (_, i) => ({
  value: String(i + 1).padStart(2, "0"),
  label: `${String(i + 1).padStart(2, "0")} Bulan`,
}));

const JENIS_PEGAWAI_OPTIONS = [
  { value: "PNS", label: "PNS" },
  { value: "PPPK", label: "PPPK" },
];

export default function EditCutiClient({ cuti }: { cuti: any }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [signature, setSignature] = useState(cuti.ttdPemohon || "");
  const [tanggalPilihan, setTanggalPilihan] = useState<string[]>(
    cuti.tanggalPilihan ? cuti.tanggalPilihan.split(",") : [],
  );
  const [jenisCuti, setJenisCuti] = useState(cuti.jenisCuti || "");
  const [noHp, setNoHp] = useState(cuti.noHp || "");
  const [masaKerjaTahun, setMasaKerjaTahun] = useState(
    cuti.masaKerjaTahun || "",
  );
  const [masaKerjaBulan, setMasaKerjaBulan] = useState(
    cuti.masaKerjaBulan || "",
  );
  const [unitKerja, setUnitKerja] = useState(cuti.unitKerja || "");
  const [alamatCuti, setAlamatCuti] = useState(cuti.alamatCuti || "");
  const [alasan, setAlasan] = useState(cuti.alasan || "");
  const [jenisPegawai, setJenisPegawai] = useState(cuti.jenisPegawai || "");
  const [isDraftOpen, setIsDraftOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    setFile(null);
  }, [jenisCuti]);

  const isJenisCutiChanged = jenisCuti !== (cuti.jenisCuti || "");
  const currentDokumenUrl = isJenisCutiChanged ? null : cuti.dokumenUrl;

  const isChanged =
    signature !== (cuti.ttdPemohon || "") ||
    tanggalPilihan.join(",") !== (cuti.tanggalPilihan || "") ||
    isJenisCutiChanged ||
    noHp !== (cuti.noHp || "") ||
    masaKerjaTahun !== (cuti.masaKerjaTahun || "") ||
    masaKerjaBulan !== (cuti.masaKerjaBulan || "") ||
    unitKerja !== (cuti.unitKerja || "") ||
    alamatCuti !== (cuti.alamatCuti || "") ||
    alasan !== (cuti.alasan || "") ||
    jenisPegawai !== (cuti.jenisPegawai || "") ||
    file !== null;

  const toTitleCase = (str: string) => {
    return str.replace(/\b\w/g, (char) => char.toUpperCase());
  };

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

  const [profile, setProfile] = useState({
    nama: "",
    nip: "",
    jabatan: "",
    sisaCuti: null as number | null,
    cutiTahun2: null as number | null,
    cutiTahun1: null as number | null,
    hakBerjalan: null as number | null,
    jumlahCuti: null as number | null,
    totalDiambil: 0,
    cutiAlasanPenting: null as number | null,
    cutiBesar: null as number | null,
    cutiBersalin: null as number | null,
    cutiSakit: null as number | null,
  });

  const [pejabatList, setPejabatList] = useState<any[]>([]);

  useEffect(() => {
    async function loadProfile() {
      const data = await getPegawaiProfileAction();
      if (data) {
        setProfile({
          nama: data.nama,
          nip: data.nip,
          jabatan: data.jabatan,
          sisaCuti: data.sisaCuti ?? null,
          cutiTahun2: data.cutiTahun2 ?? null,
          cutiTahun1: data.cutiTahun1 ?? null,
          hakBerjalan: data.hakBerjalan ?? null,
          jumlahCuti: data.jumlahCuti ?? null,
          totalDiambil: data.totalDiambil ?? 0,
          cutiAlasanPenting: data.cutiAlasanPenting ?? null,
          cutiBesar: data.cutiBesar ?? null,
          cutiBersalin: data.cutiBersalin ?? null,
          cutiSakit: data.cutiSakit ?? null,
        });
        if (!unitKerja) setUnitKerja(data.unitKerja);
      }

      const pejabatRes = await getPejabatList();
      if (pejabatRes.success) {
        setPejabatList(pejabatRes.data || []);
      }
    }
    loadProfile();
  }, []);

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!signature) {
      toast.error("Silakan berikan tanda tangan Anda terlebih dahulu.");
      return;
    }

    if (showDocumentUpload && documentRequired && !file && !currentDokumenUrl) {
      toast.error("Silakan upload dokumen pendukung yang diwajibkan.");
      return;
    }

    setIsConfirmOpen(true);
  };

  const handleConfirmSubmit = async () => {
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

    const result = await updatePengajuanCutiAction(cuti.id, formData);

    setLoading(false);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Pengajuan cuti berhasil diperbarui!");
      router.push("/pegawai/cuti");
      router.refresh();
    }
  };

  return (
    <div className="w-full max-w-full mx-auto p-4 sm:p-6 lg:p-8">
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-gradient-to-br from-amber-600 via-amber-700 to-amber-900 px-6 py-8 sm:px-10 sm:py-12 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-amber-400 opacity-20 rounded-full blur-3xl mix-blend-screen"></div>
          <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-48 h-48 bg-amber-500 opacity-20 rounded-full blur-2xl mix-blend-screen"></div>

          <div className="relative z-10">
            <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-white/10 rounded-2xl mb-4 sm:mb-6 backdrop-blur-md border border-white/20 shadow-xl">
              <CalendarRange className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight mb-2 sm:mb-3 drop-shadow-md">
              Edit Pengajuan Cuti
            </h1>
            <p className="text-amber-50/90 text-sm sm:text-base font-medium leading-relaxed max-w-lg">
              Silakan perbarui data di bawah ini untuk mengubah permohonan cuti
              Anda.
            </p>
          </div>
        </div>

        <div className="p-4 sm:p-10">
          <form
            ref={formRef}
            onSubmit={handleFormSubmit}
            className="space-y-6 sm:space-y-8"
          >
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
                  <Input
                    name="nama"
                    value={profile.nama}
                    readOnly
                    className="bg-slate-100 font-medium text-slate-500 cursor-not-allowed"
                  />
                </Field>
                <Field label="NIP">
                  <Input
                    name="nip"
                    value={profile.nip}
                    readOnly
                    className="bg-slate-100 font-medium text-slate-500 cursor-not-allowed"
                  />
                </Field>
                <Field label="Jabatan">
                  <Input
                    name="jabatan"
                    defaultValue={profile.jabatan}
                    placeholder="Masukkan jabatan Anda"
                    className="bg-slate-50 font-medium"
                  />
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
                    options={JENIS_CUTI_OPTIONS}
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
                  name="tanggalPilihanDummy"
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
                    placeholder="Contoh: Jl. Ahmad Yani No. 10, Muara Teweh..."
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
                  required={documentRequired && !currentDokumenUrl}
                  hint={documentHint}
                >
                  <div className="relative flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 hover:bg-slate-100 hover:border-emerald-400 transition-colors cursor-pointer overflow-hidden group">
                    <input
                      type="file"
                      required={documentRequired && !currentDokumenUrl && !file}
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
                    {file || currentDokumenUrl ? (
                      <div className="flex flex-col items-center justify-center w-full h-full relative">
                        <div className="flex flex-col items-center text-emerald-600">
                          <FileText className="w-8 h-8 mb-2" />
                          <p className="text-sm font-semibold truncate max-w-[200px]">
                            {file ? file.name : "Dokumen Saat Ini"}
                          </p>
                          {file ? (
                            <p className="text-xs text-slate-500 mb-3">
                              {(file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          ) : (
                            <div className="mb-3"></div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            className="text-xs font-semibold bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-lg hover:bg-emerald-200 transition-colors flex items-center gap-1 z-20 relative"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              const fileUrl = file
                                ? URL.createObjectURL(file)
                                : currentDokumenUrl!;
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
                onClick={() => {
                  router.push("/pegawai/cuti");
                }}
                className="w-full sm:w-auto h-12 px-6 border-2 border-slate-200 text-slate-900 hover:border-slate-300 font-bold rounded-xl transition-all active:scale-95"
              >
                Batal
              </Button>
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
                disabled={loading || !isChanged}
                className="w-full sm:w-auto h-12 px-8 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-lg shadow-amber-600/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-5 w-5" />
                    Perbarui Cuti
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
          unitKerja: unitKerja,
          masaKerjaTahun: masaKerjaTahun,
          masaKerjaBulan: masaKerjaBulan,
          jenisPegawai: jenisPegawai,
          jenisCuti: jenisCuti,
          alasan: alasan,
          tanggalMulai:
            tanggalPilihan.length > 0 ? [...tanggalPilihan].sort()[0] : "",
          tanggalSelesai:
            tanggalPilihan.length > 0
              ? [...tanggalPilihan].sort()[tanggalPilihan.length - 1]
              : "",
          tanggalPilihan: tanggalPilihan.join(","),
          alamatCuti: alamatCuti,
          noHp: noHp,
          signature: signature,
          sisaCuti: profile.sisaCuti ?? undefined,
          cutiTahun2: profile.cutiTahun2 ?? undefined,
          cutiTahun1: profile.cutiTahun1 ?? undefined,
          hakBerjalan: profile.hakBerjalan ?? undefined,
          jumlahCuti: profile.jumlahCuti ?? undefined,
          totalDiambil: profile.totalDiambil ?? 0,
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
        title="Konfirmasi Perubahan"
        description="Apakah Anda yakin ingin memperbarui data pengajuan cuti ini? Data yang baru akan menggantikan data yang lama."
        onConfirm={handleConfirmSubmit}
        loading={loading}
        confirmText="Ya, Perbarui Cuti"
        cancelText="Batal"
        variant="warning"
      />
    </div>
  );
}
