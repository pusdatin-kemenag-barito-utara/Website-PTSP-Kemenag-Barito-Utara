"use client";

import { useMemo, useState, useEffect, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { RequestServiceSelection } from "./request-service-selection";
import { RequestFormFields } from "./request-form-fields";
import { RequestRequirementUpload } from "./request-requirement-upload";
import { RealtimeSync } from "@/components/ui/realtime-sync";

// Local Components
import { RequestConfirmation } from "./_components/request-confirmation";

type Catalog = any[];

export function NewRequestForm({ catalog }: { catalog: Catalog }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlServiceItemId = searchParams.get("serviceId");

  const [serviceId, setServiceId] = useState<string>("");
  const [serviceItemId, setServiceItemId] = useState<string>("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [requirementFiles, setRequirementFiles] = useState<Record<string, File>>({});

  useEffect(() => {
    if (urlServiceItemId && catalog.length > 0) {
      for (const service of catalog) {
        const item = service.serviceItems?.find((i: any) => String(i.id) === urlServiceItemId);
        if (item) {
          setServiceId(String(service.id));
          setServiceItemId(urlServiceItemId);
          return;
        }
      }
    }
    if (!urlServiceItemId && catalog.length > 0) {
      setServiceId("");
      setServiceItemId("");
    }
  }, [urlServiceItemId, catalog]);

  const selectedService = useMemo(
    () => catalog.find((service: any) => String(service.id) === serviceId),
    [catalog, serviceId],
  );

  const selectedItem = useMemo(
    () => selectedService?.serviceItems?.find((item: any) => String(item.id) === serviceItemId),
    [selectedService, serviceItemId],
  );

  const handleServiceChange = (value: string) => {
    setServiceId(value);
    const nextService = catalog.find((service: any) => String(service.id) === value);
    setServiceItemId(String(nextService?.serviceItems?.[0]?.id ?? ""));
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isConfirmed) {
      toast.error("Konfirmasi Diperlukan", { description: "Silakan centang kotak konfirmasi sebelum mengirim." });
      return;
    }

    setError("");
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    Object.entries(requirementFiles).forEach(([id, file]) => {
      formData.set(`requirement_${id}`, file);
    });

    try {
      const response = await fetch("/api/requests", {
        method: "POST",
        body: formData,
      });

      const result = await response.json().catch(() => ({}));
      setLoading(false);

      if (!response.ok) {
        setError(result.error || "Gagal membuat pengajuan.");
        toast.error("Gagal", { description: result.error || "Terjadi kesalahan saat membuat pengajuan." });
        return;
      }

      toast.success("Berhasil!", { description: "Pengajuan Anda telah berhasil dikirim." });
      router.push(`/dashboard/pengajuan/${result.id}`);
      router.refresh();
    } catch (err) {
      setLoading(false);
      setError("Terjadi kesalahan koneksi.");
    }
  };

  if (!catalog.length) {
    return <p className="text-sm text-slate-500">Belum ada layanan aktif.</p>;
  }

  return (
    <form className="space-y-5 sm:space-y-6" onSubmit={onSubmit}>
      <RealtimeSync />

      <input type="hidden" name="serviceId" value={serviceId} />
      <input type="hidden" name="serviceItemId" value={serviceItemId} />

      <RequestServiceSelection
        catalog={catalog}
        serviceId={serviceId}
        serviceItemId={serviceItemId}
        onServiceChange={handleServiceChange}
        onItemChange={setServiceItemId}
      />

      {serviceId && serviceItemId && selectedItem ? (
        <div className="space-y-5 sm:space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <RequestFormFields fields={selectedItem.serviceFormFields ?? []} />

          <RequestRequirementUpload
            requirements={selectedItem.serviceRequirements ?? []}
            onFilesChange={setRequirementFiles}
          />
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 py-12 text-center text-slate-500">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
          </div>
          <p className="text-sm font-medium">Langkah 2 & 3 akan muncul di sini</p>
          <p className="text-xs text-slate-400 mt-1">Silakan selesaikan Langkah 1 terlebih dahulu.</p>
        </div>
      )}

      <RequestConfirmation
        isConfirmed={isConfirmed}
        onConfirmChange={setIsConfirmed}
        loading={loading}
        error={error}
      />
    </form>
  );
}
