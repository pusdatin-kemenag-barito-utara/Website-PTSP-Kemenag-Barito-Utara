import { Field } from "@/components/ui/field";
import { ModernSelect } from "@/components/ui/modern-select";
import { Layers, FileText } from "lucide-react";

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

  const serviceOptions = catalog.map((service: any) => ({
    value: String(service.id),
    label: service.name,
  }));

  const itemOptions = (selectedService?.serviceItems ?? []).map((item: any) => ({
    value: String(item.id),
    label: item.name,
  }));

  return (
    <section className="relative rounded-2xl sm:rounded-3xl border border-slate-200 bg-white p-4 sm:p-8 shadow-sm transition-all duration-300 hover:shadow-md">
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#059669] to-[#0f8a54] rounded-t-2xl sm:rounded-t-3xl" />

      <div className="mb-6 flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-[#059669] ring-1 ring-emerald-100/50">
          <Layers className="h-6 w-6" />
        </div>
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">
            Langkah 1
          </div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            Pilih Layanan
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Tentukan unit layanan dan jenis item yang ingin Anda ajukan.
          </p>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Pilih Unit Layanan" required>
          <ModernSelect
            name="service_id_select"
            options={serviceOptions}
            value={serviceId}
            onChange={onServiceChange}
            placeholder="Pilih Unit Layanan..."
            searchPlaceholder="Cari layanan..."
            icon={Layers}
            enableSearch={serviceOptions.length > 5}
          />
        </Field>

        <Field label="Pilih Item Layanan" required>
          <div className={!serviceId ? "opacity-50 pointer-events-none" : ""}>
            <ModernSelect
              name="service_item_select"
              options={itemOptions}
              value={serviceItemId}
              onChange={onItemChange}
              placeholder={serviceId ? "Pilih Item Layanan..." : "Pilih unit layanan dulu"}
              searchPlaceholder="Cari item layanan..."
              icon={FileText}
              enableSearch={itemOptions.length > 5}
            />
          </div>
        </Field>
      </div>
    </section>
  );
}
