import { Database, ShieldAlert, History } from "lucide-react";
import { requirePermission } from "@/lib/auth";
import { PageHeader } from "@/components/admin/page-header";
import { isSuperAdmin } from "@/lib/constants";
import { redirect } from "next/navigation";
import { StorageCleanupCard } from "@/components/admin/dashboard/storage-cleanup-card";
import { StorageQuotaGrid } from "@/components/admin/dashboard/storage-quota-grid";
import { AiChatToggle } from "@/components/admin/dashboard/ai-chat-toggle";
import { Card } from "@/components/ui/card";
import { getMaintenanceStatus } from "@/lib/actions/system/maintenance";

export default async function AdminStorageMaintenancePage() {
  const profile = await requirePermission("pemeliharaan_storage");
  const maintenance = await getMaintenanceStatus();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pemeliharaan Storage"
        description="Optimasi ruang penyimpanan Cloudflare R2 dengan membersihkan berkas lama."
        icon={Database}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1 space-y-6">
          <StorageQuotaGrid />
          <StorageCleanupCard />
          <AiChatToggle initialStatus={maintenance.aiChatEnabled} />
        </div>

        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6 border-none shadow-sm bg-white rounded-2xl">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide mb-4 flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-emerald-600" />
              Kebijakan Pembersihan
            </h3>
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <p className="text-xs font-bold text-slate-700 mb-1">1. Berkas Persyaratan (User Upload)</p>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Semua berkas yang diunggah oleh pemohon (KTP, Surat Rekomendasi, dll) akan dihapus jika pengajuan sudah berstatus <span className="text-emerald-600 font-bold">COMPLETED</span> lebih dari <span className="text-slate-900 font-bold">3 Bulan</span>.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <p className="text-xs font-bold text-slate-700 mb-1">2. Dokumen Hasil (Admin Upload)</p>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Dokumen resmi yang diterbitkan oleh PTSP <span className="text-emerald-600 font-bold">TIDAK AKAN DIHAPUS</span>. Dokumen ini tetap tersimpan sebagai arsip digital instansi.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <p className="text-xs font-bold text-slate-700 mb-1">3. Data Riwayat Database</p>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Seluruh data teks (nama pemohon, jenis layanan, tanggal pengajuan) <span className="text-emerald-600 font-bold">TETAP DISIMPAN</span> di database untuk keperluan pelaporan dan audit di masa depan.
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-none shadow-sm bg-white rounded-2xl">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide mb-4 flex items-center gap-2">
              <History className="h-5 w-5 text-slate-400" />
              Catatan Penting
            </h3>
            <ul className="list-disc list-inside space-y-2 text-[11px] text-slate-500 font-medium leading-relaxed">
              <li>Pembersihan dilakukan secara permanen dan tidak dapat dibatalkan (Undo).</li>
              <li>Sistem akan menghapus file dari Cloudflare R2.</li>
              <li>Aksi pembersihan dicatat di Sistem Audit Log untuk transparansi.</li>
              <li>Gunakan fitur ini secara berkala (misal: sebulan sekali) untuk menjaga performa sistem.</li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
