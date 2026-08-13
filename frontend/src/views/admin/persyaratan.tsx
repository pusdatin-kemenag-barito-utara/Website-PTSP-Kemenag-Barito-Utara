import { FileText } from "lucide-react";
import { PageHeader } from "@/components/admin/page-header";
import { PersyaratanClient } from "@/components/admin/persyaratan/persyaratan-client";

export function PersyaratanView({
  allRequirements,
  allItems,
}: {
  allRequirements: any[];
  allItems: any[];
}) {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Kelola Persyaratan"
        description="Atur dokumen persyaratan yang harus diunggah untuk tiap item layanan."
        icon={FileText}
      />
      <PersyaratanClient
        initialRequirements={allRequirements}
        items={allItems}
      />
    </div>
  );
}

export default PersyaratanView;
