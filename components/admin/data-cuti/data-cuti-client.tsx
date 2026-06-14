"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, Plus, Pencil, Eye, FileDown } from "lucide-react";
import { deleteDataCutiAction } from "@/lib/actions/admin/data-cuti";
import { toast } from "sonner";
import { DataCutiForm } from "./data-cuti-form";
import { DataCutiPagination } from "./data-cuti-pagination";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface RekapCuti {
  id: string;
  tahunTarget: number;
  sisaCutiLalu: number | null;
  cutiTahun1: number | null;
  cutiTahun2: number | null;
  jumlahCuti: number | null;
  sisaCuti: number | null;
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

  // Sinkronkan data saat initialData berubah dari server (via router.refresh)
  useEffect(() => {
    setData(initialData);
  }, [initialData]);

  const filtered = data.filter(
    (p) =>
      p.nama.toLowerCase().includes(search.toLowerCase()) ||
      (p.nip && p.nip.includes(search)),
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

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama atau NIP..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded-xl border border-slate-200">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="text-left px-4 py-3 font-semibold text-slate-700 w-12">No</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-700">Nama</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-700">NIP</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-700">Unit Kerja</th>
              <th className="text-center px-4 py-3 font-semibold text-slate-700">{currentYear - 2}</th>
              <th className="text-center px-4 py-3 font-semibold text-slate-700">{currentYear - 1}</th>
              <th className="text-center px-4 py-3 font-semibold text-slate-700">{currentYear}</th>
              <th className="text-center px-4 py-3 font-semibold text-slate-700">Jumlah Cuti</th>
              <th className="text-center px-4 py-3 font-semibold text-slate-700">Sisa Cuti</th>
              <th className="text-center px-4 py-3 font-semibold text-slate-700 w-24">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-12 text-slate-500">
                  {search ? "Pencarian tidak ditemukan." : "Belum ada data cuti pegawai."}
                </td>
              </tr>
            ) : (
              paginatedData.map((p) => {
                const currentRekap = p.rekapCutiTahunan.find((r) => r.tahunTarget === currentYear);
                const n1Rekap = p.rekapCutiTahunan.find((r) => r.tahunTarget === currentYear - 1);
                const n2Rekap = p.rekapCutiTahunan.find((r) => r.tahunTarget === currentYear - 2);

                const displayCutiTahun2 = currentRekap?.cutiTahun2 !== null && currentRekap?.cutiTahun2 !== undefined
                  ? currentRekap.cutiTahun2
                  : (n2Rekap ? Math.min(n2Rekap.sisaCuti || 0, 6) : 0);

                const displayCutiTahun1 = currentRekap?.cutiTahun1 !== null && currentRekap?.cutiTahun1 !== undefined
                  ? currentRekap.cutiTahun1
                  : (n1Rekap ? Math.min(n1Rekap.sisaCuti || 0, 6) : 0);

                const displayHakBerjalan = currentRekap?.jumlahCuti !== null && currentRekap?.jumlahCuti !== undefined
                  ? currentRekap.jumlahCuti - (currentRekap.cutiTahun1 || 0) - (currentRekap.cutiTahun2 || 0)
                  : 12; // Default hak berjalan untuk tahun baru

                const displayJumlahCuti = currentRekap?.jumlahCuti !== null && currentRekap?.jumlahCuti !== undefined
                  ? currentRekap.jumlahCuti
                  : displayHakBerjalan + displayCutiTahun1 + displayCutiTahun2;

                const displaySisaCuti = currentRekap?.sisaCuti !== null && currentRekap?.sisaCuti !== undefined
                  ? currentRekap.sisaCuti
                  : displayJumlahCuti; // Jika belum ada rekap tahun ini, sisa = jumlah (karena belum ada cuti diambil)

                return (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 text-slate-500">{p.no || "-"}</td>
                    <td className="px-4 py-3 font-medium text-slate-800">{p.nama}</td>
                    <td className="px-4 py-3 text-slate-600 font-mono text-xs">{p.nip || "-"}</td>
                    <td className="px-4 py-3 max-w-xs">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-medium text-slate-700 truncate">{p.unitKerja || "-"}</span>
                        <span className="text-xs text-slate-500 truncate" title={p.jabatan || undefined}>{p.jabatan || "-"}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center text-slate-700">{displayCutiTahun2}</td>
                    <td className="px-4 py-3 text-center text-slate-700">{displayCutiTahun1}</td>
                    <td className="px-4 py-3 text-center text-slate-700">{displayHakBerjalan}</td>
                    <td className="px-4 py-3 text-center font-semibold text-slate-800">{displayJumlahCuti}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        displaySisaCuti > 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                      }`}>
                        {displaySisaCuti}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => setEditingPegawai(p)}
                          className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-md transition-colors"
                          title="Edit Data & Cuti"
                        >
                          <Pencil className="w-4 h-4" />
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

      <Dialog open={!!editingPegawai} onOpenChange={(open) => !open && setEditingPegawai(null)}>
        <DialogContent className="max-w-[90vw] w-full">
          <DialogHeader>
            <DialogTitle>Edit Pegawai</DialogTitle>
          </DialogHeader>
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
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
