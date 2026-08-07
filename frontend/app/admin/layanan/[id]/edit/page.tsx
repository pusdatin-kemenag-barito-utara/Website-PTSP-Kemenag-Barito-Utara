import { notFound } from "next/navigation";
import { requirePermission } from "@/lib/auth";
import { isSuperAdmin, getAdminSpecificRole } from "@/lib/constants";
import { fetchAPI } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { EditServiceForm } from "@/components/admin/layanan/edit-service-form";

export default async function EditServicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const profile = await requirePermission("layanan");
  const { id } = await params;

  let service: any = null;
  try {
    const res = await fetchAPI<any>("/services");
    if (res && res.data && Array.isArray(res.data)) {
      service = res.data.find((s: any) => String(s.id) === String(id));
    }
  } catch (err) {
    console.error("Failed to fetch service detail from Golang API:", err);
  }

  if (!service) {
    notFound();
  }

  const isSuper = isSuperAdmin(profile.email);
  const specificRole = getAdminSpecificRole(profile.email, profile.role ?? "");
  const isGeneralAdmin = specificRole === "admin_ptsp";

  if (!isSuper && !isGeneralAdmin && service.roleOwner !== specificRole) {
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
