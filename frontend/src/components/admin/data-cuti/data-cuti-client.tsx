import { useState, useCallback, useEffect } from "react";
import { useRouter } from "@/lib/next-compat/navigation";
import { Search, Pencil, Trash2, Loader2, FileDown, CalendarDays } from "lucide-react";
import { deleteDataCutiAction, rolloverCutiTahunanAction } from "@/lib/actions/admin/data-cuti";
import { toast } from "sonner";
import { DataCutiForm } from "./data-cuti-form";
import { DataCutiPagination } from "./data-cuti-pagination";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface RekapCuti {
  id: string;
  tahunTarget: number;
  cutiTahun1: number | null;
  cutiTahun2: number | null;
  jumlahCuti: number | null;
  sisaCuti: number | null;
  cutiAlasanPenting?: number | null;
  cutiBesar?: number | null;
  cutiBersalin?: number | null;
  cutiSakit?: number | null;
  cutiCltn?: number | null;
}

interface PegawaiCuti {
  id: string;
  no: number | null;
  nama: string;
  nip: string | null;
  jabatan: string | null;
  unitKerja: string | null;
  rekapCutiTahunan: RekapCuti[];
}

interface Props {
  initialData: PegawaiCuti[];
}

export function DataCutiClient({ initialData }: Props) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [data, setData] = useState(initialData);
  const [editingPegawai, setEditingPegawai] = useState<PegawaiCuti | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [isRollovering, setIsRollovering] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDeletePegawai = async (id: string, nama: string) => {
    toast(`Hapus data cuti "${nama}"?`, {
      description: "Data saldo dan riwayat rekap cuti akan dihapus permanen.",
      action: {
        label: "Ya, Hapus",
        onClick: async () => {
          const toastId = toast.loading(`Sedang menghapus data cuti "${nama}"...`);
          try {
            setDeletingId(id);
            const res = await deleteDataCutiAction(id);
            toast.dismiss(toastId);
            if (res.success) {
              toast.success(res.message || "Data pegawai berhasil dihapus.");
              setData((prev) => prev.filter((item) => item.id !== id));
              router.refresh();
            } else {
              toast.error(res.error || "Gagal menghapus data pegawai.");
            }
          } catch (err) {
            toast.dismiss(toastId);
            toast.error("Terjadi kesalahan sistem saat menghapus data.");
          } finally {
            setDeletingId(null);
          }
        },
      },
      cancel: {
        label: "Batal",
        onClick: () => {},
      },
      duration: 6000,
    });
  };

  const handleExportCSV = () => {
    const currentYear = new Date().getFullYear();
    const headers = [
      "No", "Nama", "NIP", "Unit Kerja", "Jabatan",
      `Cuti ${currentYear - 2}`, `Cuti ${currentYear - 1}`, `Hak Berjalan ${currentYear}`,
      "Jumlah Cuti", "Sisa Cuti"
    ];

    const rows = filtered.map((p, index) => {
      const currentRekap = p.rekapCutiTahunan.find((r) => r.tahunTarget === currentYear);
      const n1Rekap = p.rekapCutiTahunan.find((r) => r.tahunTarget === currentYear - 1);
      const n2Rekap = p.rekapCutiTahunan.find((r) => r.tahunTarget === currentYear - 2);

      const cutiTahun2 = currentRekap?.cutiTahun2 ?? (n2Rekap ? Math.min(n2Rekap.sisaCuti || 0, 6) : 0);
      const cutiTahun1 = currentRekap?.cutiTahun1 ?? (n1Rekap ? Math.min(n1Rekap.sisaCuti || 0, 6) : 0);
      const hakBerjalan = currentRekap?.jumlahCuti !== null && currentRekap?.jumlahCuti !== undefined
        ? currentRekap.jumlahCuti - (currentRekap.cutiTahun1 || 0) - (currentRekap.cutiTahun2 || 0)
        : 12;
      const jumlahCuti = currentRekap?.jumlahCuti ?? (hakBerjalan + cutiTahun1 + cutiTahun2);
      const sisaCuti = currentRekap?.sisaCuti ?? jumlahCuti;

      return [
        p.no || index + 1,
        `"${p.nama}"`,
        `'${p.nip || ""}'`,
        `"${p.unitKerja || ""}"`,
        `"${p.jabatan || ""}"`,
        cutiTahun2,
        cutiTahun1,
        hakBerjalan,
        jumlahCuti,
        sisaCuti
      ].join(",");
    });

    const csvContent = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Rekap_Sisa_Cuti_Pegawai_${currentYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Sinkronkan data saat initialData berubah dari server (via router.refresh)
  useEffect(() => {
    setData(initialData);
  }, [initialData]);

  const filtered = (data || []).filter(
    (p) =>
      (p?.nama || "").toLowerCase().includes(search.toLowerCase()) ||
      (p?.nip && String(p.nip).includes(search)),
  );

  const totalPages = Math.ceil(filtered.length / rowsPerPage);
  const paginatedData = filtered.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage,
  );

  function getLatestRekap(rekap: RekapCuti[]): RekapCuti | undefined {
    return rekap.length ? rekap.reduce((a, b) => (a.tahunTarget > b.tahunTarget ? a : b)) : undefined;
  }

  const currentYear = new Date().getFullYear();
  const hasCurrentYear = initialData.some(p => p.rekapCutiTahunan.some(r => r.tahunTarget === currentYear));
  const hasNextYear = initialData.some(p => p.rekapCutiTahunan.some(r => r.tahunTarget === currentYear + 1));
  const targetRolloverYear = !hasCurrentYear ? currentYear : (!hasNextYear ? currentYear + 1 : null);

  const handleRollover = async () => {
    if (!targetRolloverYear) return;
    toast(`Tutup Buku Rekap Cuti ${targetRolloverYear}?`, {
      description: `Ini akan memindahkan sisa cuti N-1 dan N-2 ke tahun ${targetRolloverYear}.`,
      action: {
        label: "Ya, Proses",
        onClick: async () => {
          const toastId = toast.loading(`Sedang memproses tutup buku tahun ${targetRolloverYear}...`);
          try {
            setIsRollovering(true);
            const res = await rolloverCutiTahunanAction(targetRolloverYear);
            toast.dismiss(toastId);
            if (res.success) {
              toast.success(res.message || "Tutup buku berhasil diproses.");
              router.refresh();
            } else {
              toast.error(res.error || "Gagal melakukan tutup buku.");
            }
          } catch (err) {
            toast.dismiss(toastId);
            toast.error("Terjadi kesalahan sistem.");
          } finally {
            setIsRollovering(false);
          }
        },
      },
      cancel: {
        label: "Batal",
        onClick: () => {},
      },
      duration: 7000,
    });
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama atau NIP..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-3.5 py-2 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all shadow-2xs"
          />
        </div>
        <div className="flex items-center gap-2">
          {targetRolloverYear && (
            <button
              onClick={handleRollover}
              disabled={isRollovering}
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-200/80 rounded-xl hover:bg-amber-100 disabled:opacity-50 transition-colors shadow-2xs"
              title={`Tutup Buku & Generate Rekap ${targetRolloverYear}`}
            >
              <CalendarDays className="w-4 h-4 text-amber-600" />
              {isRollovering ? "Memproses..." : `Rekap ${targetRolloverYear}`}
            </button>
          )}
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200/80 rounded-xl hover:bg-emerald-100 transition-colors shadow-2xs"
          >
            <FileDown className="w-4 h-4 text-emerald-600" />
            Ekspor CSV
          </button>
        </div>
      </div>

      {/* Unified Table & Pagination Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-col">
        <div className="overflow-x-auto rounded-t-2xl">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50/90 border-b border-slate-200/80">
                <th className="w-12 text-center px-3 py-3.5 font-semibold text-slate-500 text-xs">No</th>
                <th className="min-w-[220px] text-left px-4 py-3.5 font-semibold text-slate-700 text-xs">Pegawai & NIP</th>
                <th className="min-w-[200px] text-left px-4 py-3.5 font-semibold text-slate-700 text-xs">Jabatan & Unit Kerja</th>
                <th className="w-20 text-center px-2 py-3 font-semibold text-slate-600 text-xs">
                  <div>{currentYear - 2}</div>
                  <div className="text-[10px] text-slate-400 font-normal">N-2 (Maks 6)</div>
                </th>
                <th className="w-20 text-center px-2 py-3 font-semibold text-slate-600 text-xs">
                  <div>{currentYear - 1}</div>
                  <div className="text-[10px] text-slate-400 font-normal">N-1 (Maks 6)</div>
                </th>
                <th className="w-24 text-center px-2 py-3 font-semibold text-emerald-800 text-xs bg-emerald-50/50">
                  <div>{currentYear}</div>
                  <div className="text-[10px] text-emerald-600 font-normal">Hak Berjalan</div>
                </th>
                <th className="w-24 text-center px-3 py-3 font-semibold text-slate-700 text-xs">
                  <div>Jumlah Hak</div>
                  <div className="text-[10px] text-slate-400 font-normal">Maks 24</div>
                </th>
                <th className="w-24 text-center px-3 py-3 font-semibold text-slate-700 text-xs">
                  <div>Sisa Cuti</div>
                  <div className="text-[10px] text-slate-400 font-normal">Saldo Akhir</div>
                </th>
                <th className="w-24 text-center px-3 py-3.5 font-semibold text-slate-700 text-xs">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-14 text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-1.5">
                      <p className="font-medium text-slate-600">
                        {search ? "Pencarian tidak ditemukan." : "Belum ada data cuti pegawai."}
                      </p>
                      {search && (
                        <p className="text-xs text-slate-400">
                          Coba gunakan kata kunci nama atau NIP lain.
                        </p>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedData.map((p) => {
                  const rekap = p.rekapCutiTahunan || [];
                  const currentRekap = rekap.find((r) => r.tahunTarget === currentYear);
                  const n1Rekap = rekap.find((r) => r.tahunTarget === currentYear - 1);
                  const n2Rekap = rekap.find((r) => r.tahunTarget === currentYear - 2);

                  const displayCutiTahun2 = currentRekap?.cutiTahun2 !== null && currentRekap?.cutiTahun2 !== undefined
                    ? currentRekap.cutiTahun2
                    : (n2Rekap ? Math.min(n2Rekap.sisaCuti || 0, 6) : 0);

                  const displayCutiTahun1 = currentRekap?.cutiTahun1 !== null && currentRekap?.cutiTahun1 !== undefined
                    ? currentRekap.cutiTahun1
                    : (n1Rekap ? Math.min(n1Rekap.sisaCuti || 0, 6) : 0);

                  const displayHakBerjalan = currentRekap?.jumlahCuti !== null && currentRekap?.jumlahCuti !== undefined
                    ? currentRekap.jumlahCuti - (currentRekap.cutiTahun1 || 0) - (currentRekap.cutiTahun2 || 0)
                    : 12;

                  const displayJumlahCuti = currentRekap?.jumlahCuti !== null && currentRekap?.jumlahCuti !== undefined
                    ? currentRekap.jumlahCuti
                    : displayHakBerjalan + displayCutiTahun1 + displayCutiTahun2;

                  const displaySisaCuti = currentRekap?.sisaCuti !== null && currentRekap?.sisaCuti !== undefined
                    ? currentRekap.sisaCuti
                    : displayJumlahCuti;

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-3 py-3 text-center text-slate-400 font-mono text-xs">{p.no || "-"}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-800 text-xs sm:text-[13px] leading-snug tracking-tight">{p.nama}</span>
                          <span className="text-[11px] text-slate-400 font-mono mt-0.5 tracking-normal">{p.nip || "-"}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 max-w-xs">
                        <div className="flex flex-col">
                          <span className="font-medium text-slate-800 text-xs line-clamp-1 leading-snug" title={p.jabatan || undefined}>
                            {p.jabatan || "-"}
                          </span>
                          <span className="text-[11px] text-slate-500 line-clamp-1 mt-0.5" title={p.unitKerja || undefined}>
                            {p.unitKerja || "-"}
                          </span>
                        </div>
                      </td>
                      <td className="px-2 py-3 text-center font-mono text-xs text-slate-700 font-semibold">{displayCutiTahun2}</td>
                      <td className="px-2 py-3 text-center font-mono text-xs text-slate-700 font-semibold">{displayCutiTahun1}</td>
                      <td className="px-2 py-3 text-center font-mono text-xs font-semibold text-emerald-700 bg-emerald-50/30">{displayHakBerjalan}</td>
                      <td className="px-3 py-3 text-center font-mono text-xs font-bold text-slate-900">{displayJumlahCuti}</td>
                      <td className="px-3 py-3 text-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold font-mono ${
                          displaySisaCuti > 0
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200/80"
                            : displaySisaCuti === 0
                              ? "bg-amber-50 text-amber-700 border border-amber-200/80"
                              : "bg-rose-50 text-rose-700 border border-rose-200"
                        }`}>
                          {displaySisaCuti}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setEditingPegawai(p)}
                            className="inline-flex items-center justify-center p-1.5 text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200/80 rounded-lg transition-all shadow-2xs hover:scale-105"
                            title="Edit Data & Saldo Cuti"
                          >
                            <Pencil className="w-3.5 h-3.5 text-amber-600" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeletePegawai(p.id, p.nama)}
                            disabled={deletingId === p.id}
                            className="inline-flex items-center justify-center p-1.5 text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200/80 rounded-lg transition-all shadow-2xs hover:scale-105 disabled:opacity-50"
                            title="Hapus Pegawai"
                          >
                            {deletingId === p.id ? (
                              <Loader2 className="w-3.5 h-3.5 text-rose-600 animate-spin" />
                            ) : (
                              <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <DataCutiPagination
          page={currentPage}
          totalPages={totalPages}
          rowsPerPage={rowsPerPage}
          totalData={filtered.length}
          onPageChange={setCurrentPage}
          onRowsPerPageChange={(rows) => {
            setRowsPerPage(rows);
            setCurrentPage(1);
          }}
        />
      </div>

      <Dialog open={!!editingPegawai} onOpenChange={(open) => !open && setEditingPegawai(null)}>
        <DialogContent className="w-full max-w-4xl lg:max-w-5xl max-h-[96vh] flex flex-col p-0 gap-0 overflow-hidden rounded-2xl border border-slate-200/90 shadow-2xl">
          {/* Header dengan judul + tombol aksi di sebelah kanan */}
          <DialogHeader className="px-6 py-3 border-b border-slate-100 shrink-0 bg-slate-50/50">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-sm sm:text-base font-bold text-slate-900">Edit Data Cuti Pegawai</DialogTitle>
                <p className="text-[11px] text-slate-500 mt-0.5">Kelola kuota, perolehan cuti tahunan & riwayat per bulan</p>
              </div>
              <div id="cuti-form-actions" className="flex items-center gap-2 mr-6" />
            </div>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto px-6 py-3.5">
            {editingPegawai && (
              <DataCutiForm
                initialData={{
                  id: editingPegawai.id,
                  no: editingPegawai.no,
                  nama: editingPegawai.nama,
                  nip: editingPegawai.nip,
                  jabatan: editingPegawai.jabatan,
                  unitKerja: editingPegawai.unitKerja,
                  rekapCutiTahunan: editingPegawai.rekapCutiTahunan,
                }}
                onSuccess={() => {
                  setEditingPegawai(null);
                  router.refresh();
                }}
                onCancel={() => setEditingPegawai(null)}
                actionsPortalId="cuti-form-actions"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
