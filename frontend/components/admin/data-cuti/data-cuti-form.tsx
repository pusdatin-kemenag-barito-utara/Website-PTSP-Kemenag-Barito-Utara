"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
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
  actionsPortalId?: string;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

export function DataCutiForm({ initialData, onSuccess, onCancel, actionsPortalId }: Props) {
  const router = useRouter();
  const isEdit = !!initialData;
  const [loading, setLoading] = useState(false);
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (actionsPortalId) {
      setPortalTarget(document.getElementById(actionsPortalId));
    }
  }, [actionsPortalId]);

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

    fd.set("rekapId", currentRekap?.id || "");
    fd.set("tahunTarget", currentYear.toString());
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
    <form onSubmit={handleSubmit} className="flex flex-col gap-0 w-full">
      {/* Back button - Only show if not in a modal */}
      {!onCancel && (
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-3"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali
        </button>
      )}

      {/* Pegawai identity card */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-5 py-4 rounded-xl text-white shadow-md flex items-center gap-4 mb-5">
        <div className="h-11 w-11 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
          <User className="h-6 w-6 text-white" />
        </div>
        <div className="min-w-0">
          <h3 className="text-base font-bold tracking-tight truncate leading-snug">{form.nama}</h3>
          <p className="text-sm text-slate-300 font-medium truncate mt-0.5">
            {form.nip || "-"}{form.jabatan ? ` • ${form.jabatan}` : ""}
          </p>
        </div>
      </div>

      {/* Cuti info section */}
      <div className="bg-blue-50/40 px-5 py-5 rounded-xl border border-blue-100 space-y-5">
        {/* Section header */}
        <div className="flex items-center gap-2 border-b border-blue-200 pb-3">
          <Calendar className="h-5 w-5 text-blue-500 shrink-0" />
          <h3 className="text-base font-bold text-blue-800 tracking-tight">Informasi Cuti ({currentYear})</h3>
        </div>

        {/* Hak cuti row — 5 cols */}
        <div className="grid grid-cols-5 gap-3">
          {/* Cuti N-2 */}
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5">Cuti {currentYear - 2}</label>
            <div className="relative">
              <input
                type="number" min={0} max={6}
                value={form.cutiTahun2}
                onChange={(e) => {
                  let val = e.target.value;
                  if (Number(val) > 6) { val = "6"; toast.error(`Maks. ${currentYear - 2}: 6 hari`); }
                  setForm((f) => ({ ...f, cutiTahun2: val }));
                }}
                className="w-full pl-3 pr-10 py-2 text-sm font-bold text-center border border-indigo-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all bg-indigo-50/60 text-indigo-700"
              />
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-indigo-400 pointer-events-none">Hari</span>
            </div>
          </div>
          {/* Cuti N-1 */}
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5">Cuti {currentYear - 1}</label>
            <div className="relative">
              <input
                type="number" min={0} max={6}
                value={form.cutiTahun1}
                onChange={(e) => {
                  let val = e.target.value;
                  if (Number(val) > 6) { val = "6"; toast.error(`Maks. ${currentYear - 1}: 6 hari`); }
                  setForm((f) => ({ ...f, cutiTahun1: val }));
                }}
                className="w-full pl-3 pr-10 py-2 text-sm font-bold text-center border border-indigo-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all bg-indigo-50/60 text-indigo-700"
              />
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-indigo-400 pointer-events-none">Hari</span>
            </div>
          </div>
          {/* Hak berjalan */}
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5">Hak {currentYear}</label>
            <div className="relative">
              <input
                type="number" min={0} max={12}
                value={form.hakBerjalan}
                onChange={(e) => {
                  let val = e.target.value;
                  if (Number(val) > 12) { val = "12"; toast.error(`Maks. hak cuti: 12 hari`); }
                  setForm((f) => ({ ...f, hakBerjalan: val }));
                }}
                className="w-full pl-3 pr-10 py-2 text-sm font-bold text-center border border-indigo-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all bg-indigo-50/60 text-indigo-700"
              />
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-indigo-400 pointer-events-none">Hari</span>
            </div>
          </div>
          {/* Jumlah Cuti */}
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5">Jumlah Cuti</label>
            <div className="w-full px-3 py-2 text-sm border rounded-lg font-bold bg-white border-slate-200 text-slate-800">
              {totalHak} <span className="text-xs font-medium text-slate-400">(/24)</span>
            </div>
          </div>
          {/* Sisa Akhir */}
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5">Sisa Akhir</label>
            <div className={`w-full px-3 py-2 text-sm border rounded-lg font-bold ${
              sisaCuti < 0
                ? "bg-red-500 border-red-600 text-white animate-pulse"
                : sisaCuti === 0
                  ? "bg-red-50 border-red-200 text-red-700"
                  : "bg-emerald-50 border-emerald-200 text-emerald-700"
            }`}>
              {sisaCuti}
            </div>
          </div>
        </div>

        {/* Per-bulan grid — 6 kolom × 2 baris */}
        <div className="border border-blue-200 bg-white rounded-xl px-4 pt-3 pb-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-bold text-slate-700">Cuti Tahunan — Per Bulan {currentYear}</span>
            <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
              totalDiambil > totalHak
                ? "bg-red-500 text-white animate-pulse"
                : totalDiambil === totalHak
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-blue-100 text-blue-700"
            }`}>
              Total Diambil: {totalDiambil}
            </span>
          </div>
          <div className="grid grid-cols-6 gap-2">
            {MONTHS.map((m, i) => (
              <div key={m}>
                <label className="block text-xs font-semibold text-slate-500 mb-1 text-center">{m}</label>
                <div className="relative">
                  <input
                    type="number" min={0} max={31}
                    value={form.cutiTahunan[i] || ""}
                    onChange={(e) => updateMonth(i, e.target.value)}
                    className="w-full px-1 py-2 text-sm font-semibold border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all text-center"
                    placeholder="0"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cuti lainnya — 4 cols */}
        <div>
          <h3 className="text-sm font-bold text-slate-600 border-b border-blue-100 pb-2 mb-3">Cuti Lainnya (Pilihan)</h3>
          <div className="grid grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Alasan Penting</label>
              <div className="relative">
                <input type="number" min={0}
                  value={form.cutiAlasanPenting || "0"}
                  onChange={(e) => setForm((f) => ({ ...f, cutiAlasanPenting: e.target.value }))}
                  className="w-full pl-3 pr-10 py-2 text-sm font-semibold border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 text-center"
                />
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 pointer-events-none">Hari</span>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Sakit</label>
              <div className="relative">
                <input type="number" min={0}
                  value={form.cutiSakit || "0"}
                  onChange={(e) => setForm((f) => ({ ...f, cutiSakit: e.target.value }))}
                  className="w-full pl-3 pr-10 py-2 text-sm font-semibold border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 text-center"
                />
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 pointer-events-none">Hari</span>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Bersalin</label>
              <div className="relative">
                <input type="number" min={0} max={3} step={0.5}
                  value={form.cutiBersalin || "0"}
                  onChange={(e) => setForm((f) => ({ ...f, cutiBersalin: e.target.value }))}
                  className="w-full pl-3 pr-12 py-2 text-sm font-semibold border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 text-center"
                />
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 pointer-events-none">Bulan</span>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Besar</label>
              <div className="relative">
                <input type="number" min={0}
                  value={form.cutiBesar || "0"}
                  onChange={(e) => setForm((f) => ({ ...f, cutiBesar: e.target.value }))}
                  className="w-full pl-3 pr-10 py-2 text-sm font-semibold border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 text-center"
                />
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 pointer-events-none">Hari</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {totalDiambil > totalHak && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs font-bold text-center animate-pulse">
          Total cuti yang diambil melebihi jumlah hak cuti tahunan!
        </div>
      )}

      {/* Tombol aksi — di-portal ke header modal jika portalTarget ada */}
      {portalTarget && createPortal(
        <div className="flex items-center gap-3">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-5 py-2 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
            >
              Batal
            </button>
          )}
          <button
            type="submit"
            disabled={loading || totalDiambil > totalHak}
            className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-all shadow-md shadow-blue-500/20"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {isEdit ? "Simpan Data Cuti" : "Simpan Data"}
          </button>
        </div>,
        portalTarget
      )}

      {/* Fallback: tombol bawah jika tidak ada portal (standalone page) */}
      {!actionsPortalId && (
        <div className="flex justify-end gap-3 pt-4 mt-4 border-t border-slate-100">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-5 py-2 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
            >
              Batal
            </button>
          )}
          <button
            type="submit"
            disabled={loading || totalDiambil > totalHak}
            className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-all shadow-md shadow-blue-500/20"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {isEdit ? "Simpan Data Cuti" : "Simpan Data"}
          </button>
        </div>
      )}
    </form>
  );
}
