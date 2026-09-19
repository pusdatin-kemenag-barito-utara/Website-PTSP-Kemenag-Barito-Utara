import { getClientApiBase, getClientAuthToken, getSessionUserId } from "@/lib/client-api";
import { useState } from "react";
import { useRouter } from "@/lib/next-compat/navigation";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { Trash2 } from "lucide-react";
import { AlertDialog } from "../ui/alert-dialog";

export function DeleteRequestButton({
  requestId,
  status,
  userId,
  variant = "solid",
  className,
}: {
  requestId: string;
  status: string;
  userId?: string;
  variant?: "solid" | "subtle";
  className?: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);

  // Only allow deletion if status is submitted, under_review, or revision_required
  const canDelete = ["submitted", "under_review", "revision_required"].includes(
    status,
  );

  if (!canDelete) return null;

  const handleDelete = async () => {
    setLoading(true);
    try {
      let effectiveUserId = userId;
      if (!effectiveUserId) {
        effectiveUserId = (await getSessionUserId()) || "";
      }
      if (!effectiveUserId) {
        throw new Error("Sesi login tidak terdeteksi. Silakan muat ulang halaman.");
      }

      const query = new URLSearchParams({ userId: effectiveUserId });
      const authToken = getClientAuthToken();
      const headers: Record<string, string> = {};
      if (authToken) {
        headers["Authorization"] = `Bearer ${authToken}`;
      }

      const response = await fetch(
        `${getClientApiBase()}/requests/${requestId}?${query}`,
        {
          method: "DELETE",
          headers,
        },
      );

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || error.message || "Gagal menghapus pengajuan.");
      }

      // Tutup dialog terlebih dahulu agar toaster terlihat
      setIsAlertOpen(false);

      toast.success("Pengajuan Berhasil Dihapus", {
        description: "Permohonan Anda telah dibatalkan dan dihapus dari sistem.",
        duration: 3000,
      });

      // Beri sedikit jeda agar toast sempat terbaca sebelum refresh
      setTimeout(() => {
        if (typeof window !== "undefined") {
          window.location.reload();
        } else {
          router.push("/masyarakat/pengajuan");
          router.refresh();
        }
      }, 1000);
    } catch (err: any) {
      // Tutup dialog agar toaster error terlihat jelas
      setIsAlertOpen(false);
      toast.error("Gagal Menghapus Pengajuan", {
        description: err.message || "Terjadi kesalahan saat menghapus pengajuan.",
        duration: 4000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        type="button"
        variant="danger"
        size="sm"
        className={
          className ||
          (variant === "solid"
            ? "h-8 sm:h-9 px-3 sm:px-3.5 gap-1.5 rounded-lg sm:rounded-xl bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold text-xs shadow-xs transition-all active:scale-95 cursor-pointer border-none"
            : "h-8 sm:h-9 px-3 gap-1.5 rounded-lg sm:rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 hover:bg-red-600 hover:text-white font-bold text-xs transition-all active:scale-95 cursor-pointer border border-red-200 dark:border-red-900/50 shadow-2xs")
        }
        onClick={() => setIsAlertOpen(true)}
        disabled={loading}
      >
        <Trash2 className="h-3.5 w-3.5 text-white" />
        <span className="text-white">{loading ? "Menghapus..." : "Hapus"}</span>
      </Button>

      <AlertDialog
        open={isAlertOpen}
        onOpenChange={setIsAlertOpen}
        title="Batalkan & Hapus Pengajuan?"
        description="Apakah Anda yakin ingin menghapus pengajuan ini? Tindakan ini akan menghapus semua data dan dokumen yang telah diunggah secara permanen. Data yang sudah dihapus tidak dapat dikembalikan."
        confirmText="Ya, Hapus Sekarang"
        cancelText="Jangan Sekarang"
        variant="danger"
        loading={loading}
        onConfirm={handleDelete}
      />
    </>
  );
}
