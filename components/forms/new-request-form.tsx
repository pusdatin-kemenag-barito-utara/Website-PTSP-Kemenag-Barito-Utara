"use client";

import { useMemo, useState, useEffect, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { RequestServiceSelection } from "./request-service-selection";
import { RequestFormFields } from "./request-form-fields";
import { RequestRequirementUpload } from "./request-requirement-upload";
import { RealtimeSync } from "@/components/ui/realtime-sync";

type Catalog = any[];

export function NewRequestForm({ catalog }: { catalog: Catalog }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Ambil serviceId dari URL jika ada
  const urlServiceItemId = searchParams.get("serviceId");

  const [serviceId, setServiceId] = useState<string>("");
  const [serviceItemId, setServiceItemId] = useState<string>("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [requirementFiles, setRequirementFiles] = useState<Record<string, File>>({});

  // Inisialisasi pilihan berdasarkan URL atau default
  useEffect(() => {
    if (urlServiceItemId && catalog.length > 0) {
      // Cari service yang memiliki item dengan ID dari URL
      for (const service of catalog) {
        const item = service.service_items?.find((i: any) => String(i.id) === urlServiceItemId);
        if (item) {
          setServiceId(String(service.id));
          setServiceItemId(urlServiceItemId);
          return;
        }
      }
    }

    // Default jika tidak ada di URL
    if (!urlServiceItemId && catalog.length > 0) {
      setServiceId("");
      setServiceItemId("");
    }
  }, [urlServiceItemId, catalog]);

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
    if (!isConfirmed) {
      toast.error("Konfirmasi Diperlukan", {
        description: "Silakan centang kotak konfirmasi sebelum mengirim.",
      });
      return;
    }

    setError("");
    setLoading(true);

    const formData = new FormData(event.currentTarget);

    // Override original files with optimized/compressed files
    Object.entries(requirementFiles).forEach(([id, file]) => {
      formData.set(`requirement_${id}`, file);
    });

    const response = await fetch("/api/requests", {
      method: "POST",
      body: formData,
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
      <RealtimeSync />

      <input type="hidden" name="service_id" value={serviceId} />
      <input type="hidden" name="service_item_id" value={serviceItemId} />

      <RequestServiceSelection
        catalog={catalog}
        serviceId={serviceId}
        serviceItemId={serviceItemId}
        onServiceChange={handleServiceChange}
        onItemChange={setServiceItemId}
      />

      {serviceId && serviceItemId && selectedItem ? (
        <div className="space-y-5 sm:space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <RequestFormFields fields={selectedItem.service_form_fields ?? []} />

          <RequestRequirementUpload
            requirements={selectedItem.service_requirements ?? []}
            onFilesChange={setRequirementFiles}
          />
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 py-12 text-center text-slate-500">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
          </div>
          <p className="text-sm font-medium">Langkah 2 & 3 akan muncul di sini</p>
          <p className="text-xs text-slate-400 mt-1">Silakan selesaikan Langkah 1 terlebih dahulu.</p>
        </div>
      )}

      <div className="flex flex-col gap-4 pt-4">
        {error && (
          <p className="rounded-xl bg-red-50 p-4 text-sm font-medium text-red-600">
            {error}
          </p>
        )}

        <div 
          className={`group flex cursor-pointer items-start gap-4 rounded-2xl border-2 p-5 transition-all duration-300 ${
            isConfirmed 
              ? "border-emerald-500 bg-emerald-50/50 shadow-sm" 
              : "border-slate-200 bg-white hover:border-emerald-300"
          }`}
          onClick={() => setIsConfirmed(!isConfirmed)}
        >
          <div className="relative mt-1 flex h-5 w-5 shrink-0 items-center justify-center">
            <input
              type="checkbox"
              id="confirm-data"
              checked={isConfirmed}
              onChange={(e) => setIsConfirmed(e.target.checked)}
              className="peer h-5 w-5 cursor-pointer appearance-none rounded border-2 border-slate-300 bg-white transition-all checked:border-emerald-500 checked:bg-emerald-500"
            />
            {isConfirmed && (
              <svg
                className="pointer-events-none absolute h-3.5 w-3.5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
          </div>
          <div className="flex flex-col gap-1 select-none">
            <label
              htmlFor="confirm-data"
              className={`text-sm font-bold leading-none transition-colors cursor-pointer ${
                isConfirmed ? "text-emerald-900" : "text-slate-700"
              }`}
            >
              Saya menyatakan data sudah sesuai
            </label>
            <p className="text-xs text-slate-500 leading-relaxed">
              Pastikan semua dokumen dan informasi yang Anda masukkan sudah benar sebelum dikirim.
            </p>
          </div>
        </div>

        <Button
          type="submit"
          className={`h-14 w-full rounded-2xl text-base font-bold transition-all duration-300 ${
            isConfirmed 
              ? "bg-gradient-to-r from-[#059669] to-[#047857] text-white shadow-xl shadow-emerald-500/20 hover:shadow-emerald-500/40 active:scale-[0.98]" 
              : "bg-slate-100 text-slate-400 cursor-not-allowed"
          }`}
          disabled={loading || !isConfirmed}
        >
          {loading ? "Sedang Mengirim..." : "Kirim Pengajuan Sekarang"}
        </Button>
      </div>
    </form>
  );
}
