import { Card } from "@/components/ui/card";
import { EditServiceForm } from "@/components/admin/layanan/edit-service-form";

export function EditServiceView({ service }: { service: any }) {
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

export default EditServiceView;
