import { Field } from "@/components/ui/field";
import { Select } from "@/components/ui/select";
import { Layers } from "lucide-react";

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
  const selectedService = catalog.find((s) => String(s.id) === serviceId);

  return (
    <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm transition-all duration-300 hover:shadow-md">
      <div className="absolute top-0 left-0 h-1.5 w-full bg-gradient-to-r from-[#059669] to-[#0f8a54]" />
      
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
          <Select
            value={serviceId}
            onChange={(e) => onServiceChange(e.target.value)}
            className="h-12 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
          >
            <option value="" disabled>
              -- Pilih Layanan --
            </option>
            {catalog.map((service) => (
              <option key={service.id} value={service.id}>
                {service.name}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Pilih Item Layanan" required>
          <Select
            name="service_item_select"
            value={serviceItemId}
            onChange={(e) => onItemChange(e.target.value)}
            disabled={!serviceId}
            className={`h-12 transition-colors ${!serviceId ? 'bg-slate-100 opacity-60 cursor-not-allowed' : 'bg-slate-50 border-slate-200 focus:bg-white'}`}
          >
            <option value="" disabled>
              -- Pilih Item Layanan --
            </option>
            {(selectedService?.service_items ?? []).map((item: any) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </Select>
        </Field>
      </div>
    </section>
  );
}
