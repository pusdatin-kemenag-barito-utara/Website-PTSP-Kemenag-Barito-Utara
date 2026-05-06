"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { compressImageToUnder } from "@/lib/image-compression";
import { RequestServiceSelection } from "./request-service-selection";
import { RequestFormFields } from "./request-form-fields";
import { RequestRequirementUpload } from "./request-requirement-upload";

type Catalog = any[];

export function NewRequestForm({ catalog }: { catalog: Catalog }) {
  const router = useRouter();
  const [serviceId, setServiceId] = useState<string>(
    String(catalog[0]?.id ?? ""),
  );
  const [serviceItemId, setServiceItemId] = useState<string>(
    String(catalog[0]?.service_items?.[0]?.id ?? ""),
  );
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const selectedService = useMemo(
    () => catalog.find((service) => String(service.id) === serviceId),
    [catalog, serviceId],
  );

  const selectedItem = useMemo(
    () =>
      selectedService?.service_items?.find(
        (item: any) => String(item.id) === serviceItemId,
      ),
    [selectedService, serviceItemId],
  );

  const handleServiceChange = (value: string) => {
    setServiceId(value);
    const nextService = catalog.find((service) => String(service.id) === value);
    setServiceItemId(String(nextService?.service_items?.[0]?.id ?? ""));
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    const rawFormData = new FormData(event.currentTarget);
    const finalFormData = new FormData();

    const entries = Array.from(rawFormData.entries());

    // Kompresi semua file gambar secara paralel
    await Promise.all(
      entries.map(async ([key, value]) => {
        if (
          value instanceof File &&
          value.size > 0 &&
          value.type.startsWith("image/")
        ) {
          // Kompres file agar ukurannya diusahakan di bawah 100kb
          const compressedFile = await compressImageToUnder(value, 100);
          finalFormData.append(key, compressedFile);
        } else {
          finalFormData.append(key, value);
        }
      }),
    );

    const response = await fetch("/api/requests", {
      method: "POST",
      body: finalFormData,
    });

    const result = await response.json().catch(() => ({}));
    setLoading(false);

    if (!response.ok) {
      setError(result.error || "Gagal membuat pengajuan.");
      toast.error("Gagal", {
        description:
          result.error || "Terjadi kesalahan saat membuat pengajuan.",
      });
      return;
    }

    toast.success("Berhasil!", {
      description: "Pengajuan Anda telah berhasil dikirim.",
    });

    router.push(`/dashboard/pengajuan/${result.id}`);
    router.refresh();
  };

  if (!catalog.length) {
    return <p className="text-sm text-slate-500">Belum ada layanan aktif.</p>;
  }

  return (
    <form className="space-y-5 sm:space-y-6" onSubmit={onSubmit}>
      <input type="hidden" name="service_id" value={serviceId} />
      <input type="hidden" name="service_item_id" value={serviceItemId} />

      <RequestServiceSelection
        catalog={catalog}
        serviceId={serviceId}
        serviceItemId={serviceItemId}
        onServiceChange={handleServiceChange}
        onItemChange={setServiceItemId}
      />

      <RequestFormFields fields={selectedItem?.service_form_fields ?? []} />

      <RequestRequirementUpload
        requirements={selectedItem?.service_requirements ?? []}
      />

      <div className="flex flex-col gap-3 pt-4">
        {error && (
          <p className="rounded-xl bg-red-50 p-4 text-sm font-medium text-red-600">
            {error}
          </p>
        )}
        <Button
          type="submit"
          className="h-14 w-full rounded-2xl bg-gradient-to-r from-[#1f4bb7] to-[#2557c9] text-base font-bold shadow-xl shadow-blue-500/20 transition-all hover:shadow-blue-500/40 active:scale-[0.98]"
          disabled={loading}
        >
          {loading ? "Sedang Mengirim..." : "Kirim Pengajuan Sekarang"}
        </Button>
        <p className="text-center text-xs font-medium text-slate-400">
          Dengan mengklik tombol di atas, Anda menyatakan bahwa data yang diisi
          adalah benar dan valid.
        </p>
      </div>
    </form>
  );
}
