import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "@/lib/next-compat/navigation";
import { toast } from "sonner";
import { Loader2, Save, ArrowLeft, User, Calendar } from "lucide-react";
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
    cutiAlasanPenting: currentRekap?.cutiAlasanPenting?.toString() || (currentRekap as any)?.cuti_alasan_penting?.toString() || "",
    cutiBesar: currentRekap?.cutiBesar?.toString() || (currentRekap as any)?.cuti_besar?.toString() || "",
    cutiBersalin: currentRekap?.cutiBersalin?.toString() || (currentRekap as any)?.cuti_bersalin?.toString() || "",
    cutiSakit: currentRekap?.cutiSakit?.toString() || (currentRekap as any)?.cuti_sakit?.toString() || "",
    cutiCltn: currentRekap?.cutiCltn?.toString() || (currentRekap as any)?.cuti_cltn?.toString() || "",
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
    fd.set("cutiCltn", form.cutiCltn);
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

      {/* Pegawai profile banner */}
      <div className="bg-slate-50/80 border border-slate-200/80 px-3 py-2 rounded-lg flex items-center justify-between gap-3 mb-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="h-8 w-8 rounded-lg bg-emerald-600/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
            <User className="h-4 w-4 text-emerald-700" />
          </div>
          <div className="min-w-0">
            <h3 className="text-xs sm:text-[13px] font-bold text-slate-900 truncate leading-tight">{form.nama}</h3>
            <p className="text-[11px] text-slate-500 font-mono truncate">
              NIP: {form.nip || "-"}
            </p>
          </div>
        </div>
        <div className="text-right hidden sm:block shrink-0">
          <span className="text-xs font-semibold text-slate-700 block truncate max-w-xs leading-tight">{form.jabatan || "-"}</span>
          <span className="text-[10px] text-slate-400 block truncate max-w-xs">{form.unitKerja || "-"}</span>
        </div>
      </div>

      {/* Cuti info container */}
      <div className="space-y-2">
        {/* Hak cuti row — 5 cols */}
        <div className="bg-slate-50/70 p-2.5 rounded-xl border border-slate-200/80 space-y-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
              <h4 className="text-[11px] font-bold text-slate-800 uppercase tracking-wider">Hak & Saldo Cuti ({currentYear})</h4>
            </div>
            <span className="text-[10px] text-slate-400 font-medium">Berdasarkan Regulasi BKN</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {/* Cuti N-2 */}
            <div className="bg-white border border-slate-200/90 rounded-lg p-2 shadow-2xs">
              <div className="flex items-center justify-between mb-0.5">
                <label className="text-[10px] font-bold text-slate-600">Saldo {currentYear - 2}</label>
                <span className="text-[9px] text-slate-400 font-semibold">N-2</span>
              </div>
              <div className="relative">
                <input
                  type="number" min={0} max={6}
                  value={form.cutiTahun2}
                  onChange={(e) => {
                    let val = e.target.value;
                    if (Number(val) > 6) { val = "6"; toast.error(`Maks. saldo ${currentYear - 2}: 6 hari`); }
                    setForm((f) => ({ ...f, cutiTahun2: val }));
                  }}
                  className="w-full pl-2 pr-7 py-1 text-xs font-bold text-center border border-slate-200 rounded-md focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/15 bg-slate-50/50 text-slate-800"
                />
                <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[9px] font-semibold text-slate-400 pointer-events-none">Hari</span>
              </div>
            </div>

            {/* Cuti N-1 */}
            <div className="bg-white border border-slate-200/90 rounded-lg p-2 shadow-2xs">
              <div className="flex items-center justify-between mb-0.5">
                <label className="text-[10px] font-bold text-slate-600">Saldo {currentYear - 1}</label>
                <span className="text-[9px] text-slate-400 font-semibold">N-1</span>
              </div>
              <div className="relative">
                <input
                  type="number" min={0} max={6}
                  value={form.cutiTahun1}
                  onChange={(e) => {
                    let val = e.target.value;
                    if (Number(val) > 6) { val = "6"; toast.error(`Maks. saldo ${currentYear - 1}: 6 hari`); }
                    setForm((f) => ({ ...f, cutiTahun1: val }));
                  }}
                  className="w-full pl-2 pr-7 py-1 text-xs font-bold text-center border border-slate-200 rounded-md focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/15 bg-slate-50/50 text-slate-800"
                />
                <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[9px] font-semibold text-slate-400 pointer-events-none">Hari</span>
              </div>
            </div>

            {/* Hak berjalan */}
            <div className="bg-emerald-50/50 border border-emerald-200/80 rounded-lg p-2 shadow-2xs">
              <div className="flex items-center justify-between mb-0.5">
                <label className="text-[10px] font-bold text-emerald-800">Hak {currentYear}</label>
                <span className="text-[9px] text-emerald-600 font-semibold">N</span>
              </div>
              <div className="relative">
                <input
                  type="number" min={0} max={12}
                  value={form.hakBerjalan}
                  onChange={(e) => {
                    let val = e.target.value;
                    if (Number(val) > 12) { val = "12"; toast.error(`Maks. hak cuti berjalan: 12 hari`); }
                    setForm((f) => ({ ...f, hakBerjalan: val }));
                  }}
                  className="w-full pl-2 pr-7 py-1 text-xs font-bold text-center border border-emerald-300 rounded-md focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 bg-white text-emerald-800"
                />
                <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[9px] font-semibold text-emerald-500 pointer-events-none">Hari</span>
              </div>
            </div>

            {/* Jumlah Hak Cuti */}
            <div className="bg-white border border-slate-200/90 rounded-lg p-2 shadow-2xs">
              <div className="flex items-center justify-between mb-0.5">
                <label className="text-[10px] font-bold text-slate-600">Jumlah Hak</label>
                <span className="text-[9px] text-slate-400 font-semibold">Maks 24</span>
              </div>
              <div className="w-full py-1 px-1.5 text-xs font-bold text-center border border-slate-200 rounded-md bg-slate-50 text-slate-900 font-mono">
                {totalHak} <span className="text-[9px] font-normal text-slate-400">/24 Hari</span>
              </div>
            </div>

            {/* Sisa Akhir */}
            <div className={`border rounded-lg p-2 shadow-2xs ${
              sisaCuti < 0
                ? "bg-rose-50 border-rose-200"
                : sisaCuti === 0
                  ? "bg-amber-50 border-amber-200"
                  : "bg-emerald-50 border-emerald-200"
            }`}>
              <div className="flex items-center justify-between mb-0.5">
                <label className="text-[10px] font-bold text-slate-700">Sisa Akhir</label>
                <span className="text-[9px] font-semibold text-slate-400">Saldo</span>
              </div>
              <div className={`w-full py-1 px-1.5 text-xs font-bold text-center rounded-md font-mono ${
                sisaCuti < 0
                  ? "bg-rose-500 text-white animate-pulse"
                  : sisaCuti === 0
                    ? "bg-white text-amber-700 border border-amber-200"
                    : "bg-white text-emerald-700 border border-emerald-200"
              }`}>
                {sisaCuti} Hari
              </div>
            </div>
          </div>
        </div>

        {/* Per-bulan grid — 12 kolom 1 baris */}
        <div className="bg-white border border-slate-200/90 rounded-xl p-2.5 shadow-2xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider">Cuti Tahunan Diambil — Per Bulan ({currentYear})</span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              totalDiambil > totalHak
                ? "bg-rose-500 text-white animate-pulse"
                : totalDiambil === totalHak
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-slate-100 text-slate-700"
            }`}>
              Total Diambil: {totalDiambil} Hari
            </span>
          </div>
          <div className="grid grid-cols-6 sm:grid-cols-12 gap-1.5">
            {MONTHS.map((m, i) => (
              <div key={m} className="bg-slate-50/60 p-1 rounded-md border border-slate-100 text-center">
                <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">{m}</label>
                <input
                  type="number" min={0} max={31}
                  value={form.cutiTahunan[i] === 0 ? "" : form.cutiTahunan[i]}
                  onChange={(e) => updateMonth(i, e.target.value)}
                  className="w-full px-0.5 py-0.5 text-xs font-bold text-slate-800 bg-white border border-slate-200 rounded focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/15 transition-all text-center placeholder:text-slate-300"
                  placeholder="0"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Cuti lainnya — 5 cols */}
        <div className="bg-white border border-slate-200/90 rounded-xl p-2.5 shadow-2xs">
          <h4 className="text-[11px] font-bold text-slate-800 uppercase tracking-wider mb-1.5">Cuti Lainnya (Pilihan Tambahan)</h4>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            <div className="bg-slate-50/50 p-1.5 px-2 rounded-lg border border-slate-100">
              <label className="block text-[10px] font-semibold text-slate-600 mb-0.5 truncate" title="Cuti Alasan Penting">Alasan Penting</label>
              <div className="relative">
                <input type="number" min={0}
                  value={form.cutiAlasanPenting || "0"}
                  onChange={(e) => setForm((f) => ({ ...f, cutiAlasanPenting: e.target.value }))}
                  className="w-full pl-2 pr-7 py-1 text-xs font-semibold border border-slate-200 rounded-md focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/15 text-center bg-white"
                />
                <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[9px] font-semibold text-slate-400 pointer-events-none">Hari</span>
              </div>
            </div>
            <div className="bg-slate-50/50 p-1.5 px-2 rounded-lg border border-slate-100">
              <label className="block text-[10px] font-semibold text-slate-600 mb-0.5 truncate" title="Cuti Sakit">Sakit</label>
              <div className="relative">
                <input type="number" min={0}
                  value={form.cutiSakit || "0"}
                  onChange={(e) => setForm((f) => ({ ...f, cutiSakit: e.target.value }))}
                  className="w-full pl-2 pr-7 py-1 text-xs font-semibold border border-slate-200 rounded-md focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/15 text-center bg-white"
                />
                <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[9px] font-semibold text-slate-400 pointer-events-none">Hari</span>
              </div>
            </div>
            <div className="bg-slate-50/50 p-1.5 px-2 rounded-lg border border-slate-100">
              <label className="block text-[10px] font-semibold text-slate-600 mb-0.5 truncate" title="Cuti Bersalin / Melahirkan">Bersalin</label>
              <div className="relative">
                <input type="number" min={0} max={3} step={0.5}
                  value={form.cutiBersalin || "0"}
                  onChange={(e) => setForm((f) => ({ ...f, cutiBersalin: e.target.value }))}
                  className="w-full pl-2 pr-7 py-1 text-xs font-semibold border border-slate-200 rounded-md focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/15 text-center bg-white"
                />
                <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[9px] font-semibold text-slate-400 pointer-events-none">Bln</span>
              </div>
            </div>
            <div className="bg-slate-50/50 p-1.5 px-2 rounded-lg border border-slate-100">
              <label className="block text-[10px] font-semibold text-slate-600 mb-0.5 truncate" title="Cuti Besar">Cuti Besar</label>
              <div className="relative">
                <input type="number" min={0}
                  value={form.cutiBesar || "0"}
                  onChange={(e) => setForm((f) => ({ ...f, cutiBesar: e.target.value }))}
                  className="w-full pl-2 pr-7 py-1 text-xs font-semibold border border-slate-200 rounded-md focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/15 text-center bg-white"
                />
                <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[9px] font-semibold text-slate-400 pointer-events-none">Hari</span>
              </div>
            </div>
            <div className="bg-slate-50/50 p-1.5 px-2 rounded-lg border border-slate-100">
              <label className="block text-[10px] font-semibold text-slate-600 mb-0.5 truncate" title="Cuti di Luar Tanggungan Negara (CLTN)">
                CLTN (Luar Tanggungan)
              </label>
              <div className="relative">
                <input type="number" min={0}
                  value={form.cutiCltn || "0"}
                  onChange={(e) => setForm((f) => ({ ...f, cutiCltn: e.target.value }))}
                  className="w-full pl-2 pr-7 py-1 text-xs font-semibold border border-slate-200 rounded-md focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/15 text-center bg-white"
                />
                <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[9px] font-semibold text-slate-400 pointer-events-none">Bln</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {totalDiambil > totalHak && (
        <div className="mt-2 p-2 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs font-bold text-center animate-pulse">
          Total cuti yang diambil ({totalDiambil} hari) melebihi jumlah hak cuti tahunan ({totalHak} hari)!
        </div>
      )}

      {/* Tombol aksi — di-portal ke header modal jika portalTarget ada */}
      {portalTarget && createPortal(
        <div className="flex items-center gap-2">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-2xs"
            >
              Batal
            </button>
          )}
          <button
            type="submit"
            disabled={loading || totalDiambil > totalHak}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 disabled:opacity-50 transition-all shadow-xs"
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            {isEdit ? "Simpan Data Cuti" : "Simpan Data"}
          </button>
        </div>,
        portalTarget
      )}

      {/* Fallback: tombol bawah jika tidak ada portal (standalone page) */}
      {!actionsPortalId && (
        <div className="flex justify-end gap-2.5 pt-4 mt-4 border-t border-slate-100">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-2xs"
            >
              Batal
            </button>
          )}
          <button
            type="submit"
            disabled={loading || totalDiambil > totalHak}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 disabled:opacity-50 transition-all shadow-xs"
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            {isEdit ? "Simpan Data Cuti" : "Simpan Data"}
          </button>
        </div>
      )}
    </form>
  );
}
