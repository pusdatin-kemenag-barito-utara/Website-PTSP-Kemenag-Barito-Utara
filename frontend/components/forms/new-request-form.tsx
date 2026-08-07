"use client";

import { useMemo, useState, useEffect, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Clock, Info } from "lucide-react";
import { RequestServiceSelection } from "./request-service-selection";
import { RequestFormFields } from "./request-form-fields";
import { RequestRequirementUpload } from "./request-requirement-upload";
import { RealtimeSync } from "@/components/ui/realtime-sync";

// Local Components
import { MasyarakatRequestConfirmation } from "./_components/masyarakat-request-confirmation";

type Catalog = any[];

export function NewRequestForm({
  catalog,
  profile,
  redirectPathPrefix = "/masyarakat/pengajuan",
}: {
  catalog: Catalog;
  profile?: any;
  redirectPathPrefix?: string;
}) {
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
    setRequirementFiles({});
  }, [serviceItemId]);

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
    setServiceItemId("");
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Validasi Dokumen Persyaratan Wajib
    const requiredDocs = (selectedItem?.serviceRequirements ?? []).filter((r: any) => r.isRequired);
    const missingDocs = requiredDocs.filter((r: any) => !requirementFiles[String(r.id)]);

    if (missingDocs.length > 0) {
      toast.error("Dokumen Belum Lengkap", {
        description: `Silakan unggah dokumen wajib: ${missingDocs.map((m: any) => m.documentName).join(", ")}.`,
      });
      return;
    }

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

      toast.success("Pengajuan Berhasil Dikirim!", {
        description: `Nomor Tiket: ${result.requestNumber || result.id}\nPengajuan Anda sedang diproses oleh petugas.`,
        duration: 3500,
      });
      router.push(`${redirectPathPrefix}/${result.id}`);
      router.refresh();
    } catch (err) {
      setLoading(false);
      setError("Terjadi kesalahan koneksi.");
    }
  };

  if (!catalog.length) {
    return <p className="text-sm text-slate-500 dark:text-slate-400">Belum ada katalog layanan aktif.</p>;
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
          {/* Service Info Badge & Description */}
          {(selectedItem.description || selectedItem.estimatedTime) && (
            <div className="flex flex-col items-center justify-center text-center gap-2.5 rounded-2xl border border-emerald-100 dark:border-emerald-950/60 bg-emerald-50/40 dark:bg-emerald-950/30 p-4 shadow-2xs transition-colors duration-300">
              {selectedItem.description && (
                <div className="flex items-center justify-center gap-2 max-w-2xl">
                  <Info className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 leading-relaxed">
                    {selectedItem.description}
                  </span>
                </div>
              )}
              {selectedItem.estimatedTime && (
                <div className="inline-flex items-center justify-center gap-1.5 font-bold text-emerald-700 dark:text-emerald-300 bg-white dark:bg-emerald-950/80 border border-emerald-200/80 dark:border-emerald-800/60 px-3.5 py-1.5 rounded-xl text-xs shadow-xs">
                  <Clock className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Estimasi Selesai: {selectedItem.estimatedTime}</span>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Isi Formulir */}
          {(selectedItem.serviceFormFields ?? []).length > 0 && (
            <section className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-2xs transition-colors duration-300">
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
                Formulir Isian Permohonan
              </h2>
              <RequestFormFields fields={selectedItem.serviceFormFields ?? []} profile={profile} />
            </section>
          )}

          <RequestRequirementUpload
            requirements={selectedItem.serviceRequirements ?? []}
            onFilesChange={setRequirementFiles}
          />

          <MasyarakatRequestConfirmation
            isConfirmed={isConfirmed}
            onConfirmChange={setIsConfirmed}
            loading={loading}
            error={error}
          />
        </div>
      ) : null}
    </form>
  );
}
