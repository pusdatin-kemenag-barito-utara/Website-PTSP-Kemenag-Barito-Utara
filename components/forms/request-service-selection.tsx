import { Field } from "@/components/ui/field";
import { Select } from "@/components/ui/select";

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
    <section className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5">
      <div className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-[#1f4bb7]">
          Langkah 1
        </p>
        <h2 className="mt-1 text-base font-bold text-slate-900 sm:text-lg">
          Pilih Layanan
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Tentukan unit layanan dan item layanan yang ingin diajukan.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Pilih Layanan" required>
          <Select
            value={serviceId}
            onChange={(e) => onServiceChange(e.target.value)}
          >
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
          >
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
