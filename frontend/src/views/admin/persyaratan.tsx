import { PersyaratanClient } from "@/components/admin/persyaratan/persyaratan-client";

export function PersyaratanView({
  allRequirements,
  allItems,
}: {
  allRequirements: any[];
  allItems: any[];
}) {
  return (
    <div className="space-y-4 pb-6">
      <PersyaratanClient
        initialRequirements={allRequirements}
        items={allItems}
      />
    </div>
  );
}

export default PersyaratanView;
