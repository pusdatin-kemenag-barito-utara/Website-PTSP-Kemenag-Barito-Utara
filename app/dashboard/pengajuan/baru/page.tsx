import { Card } from "@/components/ui/card";
import { NewRequestForm } from "@/components/forms/new-request-form";
import { getServiceCatalog } from "@/lib/queries";
import { requireAuth } from "@/lib/auth";

export default async function NewRequestPage() {
  await requireAuth();
  const catalog = await getServiceCatalog();

  return (
    <div className="space-y-4 md:space-y-6">
      <NewRequestForm catalog={catalog} />
    </div>
  );
}
