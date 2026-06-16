"use client";

import { useState } from "react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { FileDown, Upload, FileText, CheckCircle2, AlertCircle, Clock, Edit } from "lucide-react";
import { AdminCutiUploadModal } from "./cuti-upload-modal";
import { AdminCutiEditModal } from "./admin-cuti-edit-modal";

export function AdminCutiTable({ data }: { data: any[] }) {
  const [selectedUploadCuti, setSelectedUploadCuti] = useState<{ id: string; nama: string; noHp?: string } | null>(null);
  const [selectedEditCuti, setSelectedEditCuti] = useState<any | null>(null);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Selesai
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200">
            <AlertCircle className="w-3.5 h-3.5" />
            Ditolak
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3.5 h-3.5" />
            Diproses
          </span>
        );
    }
  };

  const getApprovalStatus = (atasan: string, kepala: string) => {
    if (atasan === "pending") return "Menunggu Atasan";
    if (atasan === "rejected") return "Ditolak Atasan";
    if (kepala === "pending") return "Menunggu Kepala";
    if (kepala === "rejected") return "Ditolak Kepala";
    return "Disetujui Pimpinan";
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-500 bg-slate-50 border-b border-slate-200 uppercase">
            <tr>
              <th className="px-6 py-4">Tgl Pengajuan</th>
              <th className="px-6 py-4">Pemohon</th>
              <th className="px-6 py-4">Jenis Cuti</th>
              <th className="px-6 py-4">Persetujuan</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                  <div className="flex flex-col items-center justify-center">
                    <FileText className="w-12 h-12 text-slate-300 mb-3" />
                    <p className="text-base font-medium text-slate-600">Tidak ada pengajuan cuti</p>
                    <p className="text-sm">Belum ada pegawai yang mengajukan cuti saat ini.</p>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    {format(new Date(item.createdAt), "dd MMM yyyy", { locale: id })}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-900">{item.pemohon?.nama || "Tidak ada nama"}</div>
                    <div className="text-xs text-slate-500">NIP: {item.pemohon?.nip || item.pemohon?.email?.split('@')[0] || "-"}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-900">{item.jenisCuti}</div>
                    <div className="text-xs text-slate-500">
                      {format(new Date(item.tanggalMulai), "dd/MM/yy")} - {format(new Date(item.tanggalSelesai), "dd/MM/yy")}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-1 rounded border border-slate-200">
                      {getApprovalStatus(item.statusAtasan, item.statusKepala)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(item.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center space-x-2">
                    {/* Upload Surat: tampil jika kepala sudah approved tapi belum ada dokumen */}
                    {(item.statusKepala === "approved" || item.status === "approved") && !item.dokumenUrl ? (
                      <Button
                        size="sm"
                        className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                        onClick={() => setSelectedUploadCuti({ id: item.id, nama: item.pemohon?.nama || "Pegawai", noHp: item.noHp })}
                        title="Kirim Surat Cuti ke Pegawai"
                      >
                        <Upload className="w-4 h-4 mr-1.5" />
                        Kirim Surat
                      </Button>
                    ) : item.dokumenUrl ? (
                      <a
                        href={item.dokumenUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                        title="Unduh Surat Cuti"
                      >
                        <FileDown className="w-4 h-4" />
                        Surat
                      </a>
                    ) : (
                      <span className="text-xs text-slate-400 italic">Menunggu</span>
                    )}

                    <Button
                      size="sm"
                      variant="outline"
                      className="text-slate-600 border-slate-300 hover:bg-slate-100"
                      onClick={() => setSelectedEditCuti(item)}
                      title="Edit / Hapus Pengajuan"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <AdminCutiUploadModal
        isOpen={!!selectedUploadCuti}
        onClose={() => setSelectedUploadCuti(null)}
        cutiId={selectedUploadCuti?.id || ""}
        cutiName={selectedUploadCuti?.nama || ""}
        noHp={selectedUploadCuti?.noHp}
      />

      <AdminCutiEditModal
        isOpen={!!selectedEditCuti}
        onClose={() => setSelectedEditCuti(null)}
        cutiData={selectedEditCuti}
      />
    </div>
  );
}
