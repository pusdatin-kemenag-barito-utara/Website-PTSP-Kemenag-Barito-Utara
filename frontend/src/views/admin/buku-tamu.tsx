import { BookOpen } from "lucide-react";
import { PageHeader } from "@/components/admin/page-header";
import { BukuTamuClient } from "@/components/admin/buku-tamu/buku-tamu-client";

export function BukuTamuView({
  entries,
  allowManualGuestBookDate,
}: {
  entries: any[];
  allowManualGuestBookDate: boolean;
}) {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Monitoring Buku Tamu"
        description="Pantau dan kelola riwayat kunjungan tamu digital di PTSP Kemenag Barito Utara."
        icon={BookOpen}
      />
      <BukuTamuClient initialEntries={entries} initialAllowManual={allowManualGuestBookDate} />
    </div>
  );
}

export default BukuTamuView;
