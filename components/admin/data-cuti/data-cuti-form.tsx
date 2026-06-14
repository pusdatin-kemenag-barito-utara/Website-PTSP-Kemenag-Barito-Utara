"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Save, ArrowLeft, User, Briefcase, FileText, Building2, Calendar } from "lucide-react";
import { createDataCutiAction, updateDataCutiAction } from "@/lib/actions/admin/data-cuti";

interface Props {
  initialData?: {
    id: string;
    no: number | null;
    nama: string;
    nip: string | null;
    jabatan: string | null;
    unitKerja?: string | null;
    rekapCutiTahunan?: any[];
  };
  onSuccess?: () => void;
  onCancel?: () => void;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

export function DataCutiForm({ initialData, onSuccess, onCancel }: Props) {
  const router = useRouter();
  const isEdit = !!initialData;
  const [loading, setLoading] = useState(false);

  const currentYear = new Date().getFullYear();
  const currentRekap = initialData?.rekapCutiTahunan?.find(r => r.tahunTarget === currentYear);
  const n1Record = initialData?.rekapCutiTahunan?.find((r) => r.tahunTarget === currentYear - 1);
  const n2Record = initialData?.rekapCutiTahunan?.find((r) => r.tahunTarget === currentYear - 2);

  const [form, setForm] = useState({
    no: initialData?.no?.toString() || "",
    nama: initialData?.nama || "",
    nip: initialData?.nip || "",
    jabatan: initialData?.jabatan || "",
    unitKerja: initialData?.unitKerja || "",
    
    // Rekap Data
    hakBerjalan: currentRekap?.jumlahCuti 
      ? (currentRekap.jumlahCuti - (currentRekap.cutiTahun1 || 0) - (currentRekap.cutiTahun2 || 0)).toString() 
      : "12",
    cutiTahun1: currentRekap?.cutiTahun1 !== null && currentRekap?.cutiTahun1 !== undefined 
      ? currentRekap.cutiTahun1.toString() 
      : (n1Record ? Math.min(n1Record.sisaCuti || 0, 6).toString() : ""),
    cutiTahun2: currentRekap?.cutiTahun2 !== null && currentRekap?.cutiTahun2 !== undefined 
      ? currentRekap.cutiTahun2.toString() 
      : (n2Record ? Math.min(n2Record.sisaCuti || 0, 6).toString() : ""),
    cutiTahunan: currentRekap?.cutiTahunan || Array(12).fill(0),
    cutiAlasanPenting: currentRekap?.cutiAlasanPenting?.toString() || "",
    cutiBesar: currentRekap?.cutiBesar?.toString() || "",
    cutiBersalin: currentRekap?.cutiBersalin?.toString() || "",
    cutiSakit: currentRekap?.cutiSakit?.toString() || "",
  });

  const totalHak = Number(form.hakBerjalan || 0) + Number(form.cutiTahun1 || 0) + Number(form.cutiTahun2 || 0);
  const totalDiambil = form.cutiTahunan.reduce((a: number, b: number) => a + b, 0);
  const sisaCuti = totalHak - totalDiambil;

  function updateMonth(index: number, value: string) {
    const arr = [...form.cutiTahunan];
    arr[index] = Number(value) || 0;
    setForm((f) => ({ ...f, cutiTahunan: arr }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.nama.trim()) {
      toast.error("Nama wajib diisi.");
      return;
    }

    setLoading(true);
    const fd = new FormData();
    fd.set("no", form.no);
    fd.set("nama", form.nama);
    fd.set("nip", form.nip);
    fd.set("jabatan", form.jabatan);
    fd.set("unitKerja", form.unitKerja);

    fd.set("cutiTahun1", form.cutiTahun1);
    fd.set("cutiTahun2", form.cutiTahun2);
    fd.set("jumlahCuti", totalHak.toString());
    fd.set("cutiTahunan", JSON.stringify(form.cutiTahunan));
    fd.set("cutiAlasanPenting", form.cutiAlasanPenting);
    fd.set("cutiBesar", form.cutiBesar);
    fd.set("cutiBersalin", form.cutiBersalin);
    fd.set("cutiSakit", form.cutiSakit);
    fd.set("sisaCuti", sisaCuti.toString());

    const res = isEdit
      ? await updateDataCutiAction(initialData!.id, fd)
      : await createDataCutiAction(fd);

    setLoading(false);

    if (res.success) {
      toast.success(res.message);
      if (onSuccess) {
        onSuccess();
      } else {
        router.push("/admin/kepegawaian/pegawai");
      }
    } else {
      toast.error(res.error);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 w-full">
      {/* Back button - Only show if not in a modal */}
      {!onCancel && (
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali
        </button>
      )}

      {/* Form card */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-6 max-h-[80vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-slate-800 to-slate-700 p-5 rounded-xl text-white shadow-md flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
            <User className="h-6 w-6 text-white" />
          </div>
          <div className="min-w-0">
            <h3 className="text-lg font-bold tracking-tight truncate">{form.nama}</h3>
            <p className="text-sm text-slate-300 font-medium truncate mt-0.5">
              {form.nip || "-"} {form.jabatan ? `• ${form.jabatan}` : ""}
            </p>
          </div>
        </div>

        <div className="space-y-5 bg-blue-50/30 p-5 rounded-xl border border-blue-100">
          <div className="flex items-center gap-2 border-b border-blue-200 pb-3">
            <Calendar className="h-5 w-5 text-blue-500" />
            <h3 className="text-base font-bold text-blue-800 tracking-tight">Informasi Cuti ({currentYear})</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Cuti {currentYear - 2}</label>
              <div className="relative">
                <input
                  type="number" min={0} max={6}
                  value={form.cutiTahun2}
                  onChange={(e) => {
                    let val = e.target.value;
                    if (Number(val) > 6) { val = "6"; toast.error(`Maksimal sisa cuti ${currentYear - 2} adalah 6 hari`); }
                    setForm((f) => ({ ...f, cutiTahun2: val }));
                  }}
                  className="w-full pl-3 pr-10 py-2.5 text-base font-bold text-center border border-indigo-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all bg-indigo-50/50 text-indigo-700 shadow-sm"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-indigo-400/80 pointer-events-none">Hari</span>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Cuti {currentYear - 1}</label>
              <div className="relative">
                <input
                  type="number" min={0} max={6}
                  value={form.cutiTahun1}
                  onChange={(e) => {
                    let val = e.target.value;
                    if (Number(val) > 6) { val = "6"; toast.error(`Maksimal sisa cuti ${currentYear - 1} adalah 6 hari`); }
                    setForm((f) => ({ ...f, cutiTahun1: val }));
                  }}
                  className="w-full pl-3 pr-10 py-2.5 text-base font-bold text-center border border-indigo-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all bg-indigo-50/50 text-indigo-700 shadow-sm"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-indigo-400/80 pointer-events-none">Hari</span>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Hak {currentYear}</label>
              <div className="relative">
                <input
                  type="number" min={0} max={12}
                  value={form.hakBerjalan}
                  onChange={(e) => {
                    let val = e.target.value;
                    if (Number(val) > 12) { val = "12"; toast.error(`Maksimal hak cuti ${currentYear} adalah 12 hari`); }
                    setForm((f) => ({ ...f, hakBerjalan: val }));
                  }}
                  className="w-full pl-3 pr-10 py-2.5 text-base font-bold text-center border border-indigo-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all bg-indigo-50/50 text-indigo-700 shadow-sm"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-indigo-400/80 pointer-events-none">Hari</span>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Jumlah Cuti</label>
              <div className="w-full px-3 py-2.5 text-sm border rounded-xl font-bold bg-white border-slate-200 text-slate-800 shadow-sm">
                {totalHak} <span className="text-xs font-medium text-slate-400 ml-1">(/24)</span>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Sisa Akhir</label>
              <div className={`w-full px-3 py-2.5 text-sm border rounded-xl font-bold shadow-sm ${
                sisaCuti > 0 ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-red-50 border-red-200 text-red-700"
              }`}>
                {sisaCuti}
              </div>
            </div>
          </div>

          <fieldset className="border border-blue-200 bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <legend className="text-sm font-bold text-slate-700 px-1">Cuti Tahunan (Per Bulan {currentYear})</legend>
              <span className="text-xs font-bold text-blue-700 bg-blue-100 px-3 py-1 rounded-full shadow-sm">
                Total Diambil: {totalDiambil}
              </span>
            </div>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
              {MONTHS.map((m, i) => (
                <div key={m}>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">{m}</label>
                  <div className="relative">
                    <input
                      type="number" min={0} max={31}
                      value={form.cutiTahunan[i] || ""}
                      onChange={(e) => updateMonth(i, e.target.value)}
                      className="w-full pl-2 pr-8 py-2 text-sm font-semibold border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-center"
                      placeholder="0"
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-slate-400 pointer-events-none">Hari</span>
                  </div>
                </div>
              ))}
            </div>
          </fieldset>

          <h3 className="text-sm font-bold text-slate-700 border-b border-blue-100 pb-2 mb-3 mt-4">Cuti Lainnya (Pilihan)</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Alasan Penting</label>
              <div className="relative">
                <input
                  type="number" min={0}
                  value={form.cutiAlasanPenting}
                  onChange={(e) => setForm((f) => ({ ...f, cutiAlasanPenting: e.target.value }))}
                  className="w-full pl-3 pr-12 py-2 text-sm font-semibold border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all shadow-sm text-center"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-semibold text-slate-400 pointer-events-none">Hari</span>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Sakit</label>
              <div className="relative">
                <input
                  type="number" min={0}
                  value={form.cutiSakit}
                  onChange={(e) => setForm((f) => ({ ...f, cutiSakit: e.target.value }))}
                  className="w-full pl-3 pr-12 py-2 text-sm font-semibold border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all shadow-sm text-center"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-semibold text-slate-400 pointer-events-none">Hari</span>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Bersalin</label>
              <div className="relative">
                <input
                  type="number" min={0} max={3} step={0.5}
                  value={form.cutiBersalin}
                  onChange={(e) => setForm((f) => ({ ...f, cutiBersalin: e.target.value }))}
                  className="w-full pl-3 pr-14 py-2 text-sm font-semibold border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all shadow-sm text-center"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-semibold text-slate-400 pointer-events-none">Bulan</span>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Besar</label>
              <div className="relative">
                <input
                  type="number" min={0}
                  value={form.cutiBesar}
                  onChange={(e) => setForm((f) => ({ ...f, cutiBesar: e.target.value }))}
                  className="w-full pl-3 pr-12 py-2 text-sm font-semibold border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all shadow-sm text-center"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-semibold text-slate-400 pointer-events-none">Hari</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
          >
            Batal
          </button>
        )}
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-all shadow-md shadow-blue-500/20"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {isEdit ? "Simpan Data Cuti" : "Simpan Data"}
        </button>
      </div>
    </form>
  );
}
