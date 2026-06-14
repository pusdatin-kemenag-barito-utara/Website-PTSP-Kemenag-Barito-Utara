import { Inbox } from "lucide-react";
import { PageHeader } from "@/components/admin/page-header";
import { SuratMasukManager } from "@/components/admin/persuratan/surat-masuk-manager";
import { requirePermission } from "@/lib/auth";
import { getSuratMasukAction } from "@/lib/actions/admin/admin-persuratan";

export const metadata = {
  title: "Surat Masuk | Admin PTSP",
  description: "Kelola data surat masuk Kemenag Barito Utara",
};

export default async function SuratMasukPage() {
  await requirePermission("surat_masuk");
  const result = await getSuratMasukAction();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tata Naskah: Surat Masuk"
        description="Pencatatan dan pengelolaan arsip surat yang masuk ke sistem."
        icon={Inbox}
        externalLink="https://docs.google.com/spreadsheets/d/1C8OanScMPs45xNcWHfEldzOjVGLcKQiSL8TZdrxryg8/edit?gid=0#gid=0"
      />
      <SuratMasukManager
        initialData={result.data ?? []}
        initialTotal={result.total ?? 0}
      />
    </div>
  );
}
