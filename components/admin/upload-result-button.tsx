"use client";

import { useState, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Upload, Loader2, FileUp } from "lucide-react";
import { toast } from "sonner";
import { uploadResultDocumentAction } from "@/lib/actions/admin/admin-requests";

export function UploadResultButton({
  requestId,
  hasFile,
}: {
  requestId: string;
  hasFile?: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (e.g. max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ukuran file terlalu besar", {
        description: "Maksimal ukuran file adalah 5MB",
      });
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    // Process upload
    const formData = new FormData();
    formData.append("requestId", requestId);
    formData.append("file", file);

    const toastId = toast.loading("Mengunggah dokumen hasil...");

    startTransition(async () => {
      try {
        const result = await uploadResultDocumentAction(formData);
        if (result.success) {
          toast.success("Dokumen Berhasil Diunggah!", {
            id: toastId,
            description: result.message || "Dokumen hasil layanan telah diperbarui.",
          });
          router.refresh();
        } else {
          toast.error("Gagal mengunggah", {
            id: toastId,
            description: result.error || "Terjadi kesalahan",
          });
        }
      } catch (error: any) {
        toast.error("Terjadi kesalahan sistem", {
          id: toastId,
          description: error.message,
        });
      } finally {
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    });
  };

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="application/pdf,image/jpeg,image/png,image/jpg"
      />
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={isPending}
        title={hasFile ? "Upload Ulang Dokumen" : "Upload Manual Dokumen"}
        className="flex items-center justify-center p-2 rounded-xl transition-all shadow-sm active:scale-95 disabled:opacity-70 disabled:pointer-events-none bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300"
      >
        {isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <FileUp className="h-4 w-4" />
        )}
      </button>
    </>
  );
}
