import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { services as servicesTable } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { Card } from "@/components/ui/card";
import { EditServiceForm } from "@/components/admin/layanan/edit-service-form";

export default async function EditServicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;

  const service = await db.query.services.findFirst({
    where: eq(servicesTable.id, BigInt(id)),
  });

  if (!service) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Edit Layanan</h1>
        <p className="mt-2 text-slate-600">Perbarui data layanan utama.</p>
      </div>

      <Card className="overflow-hidden border-slate-200/60 shadow-sm">
        <EditServiceForm service={service} />
      </Card>
    </div>
  );
}
