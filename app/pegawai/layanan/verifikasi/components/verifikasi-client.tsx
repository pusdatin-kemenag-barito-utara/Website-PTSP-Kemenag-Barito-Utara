"use client";

import { useState } from "react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Eye, CheckCircle2, Clock, XCircle, AlertCircle } from "lucide-react";
import VerifikasiModal from "@/app/pegawai/layanan/verifikasi/components/verifikasi-modal";

export default function VerifikasiClient({
  initialData,
  atasanProfile,
  pejabatList = [],
}: {
  initialData: any[];
  atasanProfile?: any;
  pejabatList?: any[];
}) {
  const [data, setData] = useState<any[]>(initialData);
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200"><CheckCircle2 className="w-3 h-3 mr-1" /> Disetujui</Badge>;
      case "rejected":
        return <Badge className="bg-red-50 text-red-700 border-red-200"><XCircle className="w-3 h-3 mr-1" /> Ditolak</Badge>;
      case "changes":
        return <Badge className="bg-amber-50 text-amber-700 border-amber-200"><AlertCircle className="w-3 h-3 mr-1" /> Perbaikan</Badge>;
      case "delayed":
        return <Badge className="bg-blue-50 text-blue-700 border-blue-200"><Clock className="w-3 h-3 mr-1" /> Ditangguhkan</Badge>;
      default:
        return <Badge className="bg-slate-50 text-slate-700 border-slate-200"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>;
    }
  };

  const handleUpdate = (updatedItem: any) => {
    setData((prev) => 
      prev.map((item) => item.id === updatedItem.id ? { ...item, statusAtasan: updatedItem.statusAtasan } : item)
    );
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-100 text-slate-500">
            <tr>
              <th className="px-6 py-4 font-medium">Tanggal Pengajuan</th>
              <th className="px-6 py-4 font-medium">Nama Pemohon</th>
              <th className="px-6 py-4 font-medium">Jenis Cuti</th>
              <th className="px-6 py-4 font-medium">Status Verifikasi</th>
              <th className="px-6 py-4 font-medium text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <FileText className="w-8 h-8 text-slate-300" />
                    <p>Belum ada pengajuan cuti di unit kerja ini.</p>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 text-slate-600">
                    {format(new Date(item.createdAt), "dd MMM yyyy", { locale: id })}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-900">{item.user?.fullName}</div>
                    <div className="text-xs text-slate-500 font-mono">{item.user?.nip}</div>
                  </td>
                  <td className="px-6 py-4 text-slate-700 font-medium">
                    {item.jenisCuti}
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(item.statusAtasan)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => setSelectedRequest(item)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg text-xs font-medium transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Verifikasi
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {selectedRequest && (
        <VerifikasiModal
          request={selectedRequest}
          onClose={() => setSelectedRequest(null)}
          onUpdate={handleUpdate}
          atasanProfile={atasanProfile}
          pejabatList={pejabatList}
        />
      )}
    </div>
  );
}
