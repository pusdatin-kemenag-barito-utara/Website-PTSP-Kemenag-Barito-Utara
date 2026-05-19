import { Send } from "lucide-react";
import { PageHeader } from "@/components/admin/page-header";
import { SuratKeluarManager } from "@/components/admin/persuratan/surat-keluar-manager";
import { requirePermission } from "@/lib/auth";

export const metadata = {
  title: "Surat Keluar | Admin PTSP",
  description: "Kelola data surat keluar Kemenag Barito Utara",
};

export default async function SuratKeluarPage() {
  await requirePermission("surat_keluar");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tata Naskah: Surat Keluar"
        description="Pencatatan dan pengelolaan arsip surat yang dikirim keluar."
        icon={Send}
        externalLink="https://docs.google.com/spreadsheets/d/1C8OanScMPs45xNcWHfEldzOjVGLcKQiSL8TZdrxryg8/edit?gid=57740679#gid=57740679"
      />
      <SuratKeluarManager />
    </div>
  );
}
