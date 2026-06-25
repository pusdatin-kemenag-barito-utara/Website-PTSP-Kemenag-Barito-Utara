import { getCurrentUser } from "@/lib/auth";
import { getLaporanKinerjaAction } from "@/lib/actions/pegawai/e-lk";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Edit, Eye, Clock, CheckCircle2, XCircle, FileText, Link as LinkIcon, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";

export default async function RiwayatLkhPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const { data: riwayat } = await getLaporanKinerjaAction(user.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Riwayat & Bukti E-LK Harian</h1>
        <p className="text-slate-500 mt-1">Lihat seluruh riwayat laporan kinerja harian beserta status dan buktinya.</p>
      </div>

      <div className="border border-slate-200 shadow-sm overflow-hidden bg-white rounded-3xl">
        <div className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50/80 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 font-bold">Tanggal</th>
                  <th className="px-6 py-4 font-bold w-1/3">Kegiatan & Hasil</th>
                  <th className="px-6 py-4 font-bold text-center">Bukti</th>
                  <th className="px-6 py-4 font-bold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {riwayat && riwayat.length > 0 ? (
                  riwayat.map((lkh) => (
                    <tr key={lkh.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-700">
                        {format(new Date(lkh.tanggal), "d MMM yyyy", { locale: id })}
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-slate-800 mb-1">{lkh.kegiatanTugasJabatan}</p>
                        <p className="text-xs text-slate-500">Hasil: {lkh.hasil}</p>
                        {lkh.komentarPimpinan && (
                          <div className="mt-2 p-2 bg-amber-50 border border-amber-100 rounded-md text-xs text-amber-800">
                            <strong>Catatan Pimpinan:</strong> {lkh.komentarPimpinan}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {lkh.buktiDukungUrl ? (
                          <a href={lkh.buktiDukungUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-full hover:bg-blue-100 transition-colors">
                            <LinkIcon className="h-3.5 w-3.5" /> Lihat Bukti
                          </a>
                        ) : (
                          <span className="text-xs text-slate-400 italic">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/pegawai/e-lk/isi?id=${lkh.id}`}>
                            <Button size="sm" variant="outline" className="h-8 px-2 text-blue-600 border-blue-200 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center text-slate-500">
                        <FileText className="h-10 w-10 text-slate-300 mb-3" />
                        <p className="font-medium text-slate-700 mb-1">Belum Ada Riwayat LKH</p>
                        <p className="text-sm">Anda belum mengisi laporan kinerja harian.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
