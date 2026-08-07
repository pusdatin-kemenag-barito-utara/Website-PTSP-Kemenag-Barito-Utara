"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2 } from "lucide-react";
import { deleteLaporanKinerjaAction } from "@/lib/actions/pegawai/e-lk";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { AlertDialog } from "@/components/ui/alert-dialog";

export function DeleteButton({ id }: { id: string }) {
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    setLoading(true);
    try {
      const result = await deleteLaporanKinerjaAction(id);
      
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Berhasil menghapus riwayat.");
        setIsOpen(false);
        router.refresh();
      }
    } catch (error) {
      toast.error("Terjadi kesalahan sistem saat menghapus.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        size="sm"
        variant="outline"
        onClick={() => setIsOpen(true)}
        disabled={loading}
        className="h-8 px-2 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 hover:border-red-300"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
      </Button>

      <AlertDialog
        open={isOpen}
        onOpenChange={setIsOpen}
        title="Konfirmasi Hapus"
        description="Apakah Anda yakin ingin menghapus riwayat laporan kinerja harian ini? Data yang sudah dihapus tidak dapat dikembalikan."
        confirmText="Ya, Hapus"
        cancelText="Batal"
        variant="danger"
        loading={loading}
        onConfirm={handleDelete}
      />
    </>
  );
}
