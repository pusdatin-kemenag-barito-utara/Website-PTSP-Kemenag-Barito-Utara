import { Send } from "lucide-react";
import { PageHeader } from "@/components/admin/page-header";
import { SuratKeluarManager } from "@/components/admin/persuratan/surat-keluar-manager";

export const metadata = {
  title: "Surat Keluar | Admin PTSP",
  description: "Kelola data surat keluar Kemenag Barito Utara",
};

export default function SuratKeluarPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Tata Naskah: Surat Keluar"
        description="Pencatatan dan pengelolaan arsip surat yang dikirim keluar."
        icon={Send}
      />
      <SuratKeluarManager />
    </div>
  );
}
