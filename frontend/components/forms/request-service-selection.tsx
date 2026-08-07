import { Field } from "@/components/ui/field";
import { ModernSelect } from "@/components/ui/modern-select";
import { Layers, FileText, Clock, FileCheck2 } from "lucide-react";

export function RequestServiceSelection({
  catalog,
  serviceId,
  serviceItemId,
  onServiceChange,
  onItemChange,
}: {
  catalog: any[];
  serviceId: string;
  serviceItemId: string;
  onServiceChange: (value: string) => void;
  onItemChange: (value: string) => void;
}) {
  const selectedService = catalog.find((s: any) => String(s.id) === serviceId);
  const selectedItem = selectedService?.serviceItems?.find(
    (i: any) => String(i.id) === serviceItemId
  );

  const serviceOptions = catalog.map((service: any) => ({
    value: String(service.id),
    label: service.name,
  }));

  const itemOptions = (selectedService?.serviceItems ?? []).map((item: any) => ({
    value: String(item.id),
    label: item.name,
  }));

  return (
    <section className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-2xs transition-all duration-300">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Unit / Seksi Penyelenggara" required>
          <ModernSelect
            name="service_id_select"
            options={serviceOptions}
            value={serviceId}
            onChange={onServiceChange}
            placeholder="Pilih Unit Layanan..."
            searchPlaceholder="Cari unit..."
            icon={Layers}
            enableSearch={serviceOptions.length > 5}
          />
        </Field>

        <Field label="Jenis Permohonan" required>
          <div className={!serviceId ? "opacity-50 pointer-events-none" : ""}>
            <ModernSelect
              name="service_item_select"
              options={itemOptions}
              value={serviceItemId}
              onChange={onItemChange}
              placeholder={serviceId ? "Pilih Jenis Layanan..." : "Pilih unit terlebih dahulu"}
              searchPlaceholder="Cari jenis permohonan..."
              icon={FileText}
              enableSearch={itemOptions.length > 5}
            />
          </div>
        </Field>
      </div>
    </section>
  );
}
