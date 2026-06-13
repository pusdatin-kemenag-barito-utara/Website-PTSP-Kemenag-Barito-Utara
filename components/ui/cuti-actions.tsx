"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PenLine, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { deletePengajuanCutiAction } from "@/lib/actions/pegawai/cuti";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertDialog } from "@/components/ui/alert-dialog";

export function CutiActions({ id, status }: { id: string; status: string }) {
  const [loading, setLoading] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const router = useRouter();

  if (status !== "pending") return null; // Hanya pending yang bisa diedit/dihapus

  const handleDelete = async () => {
    setLoading(true);
    const res = await deletePengajuanCutiAction(id);
    setLoading(false);
    
    if (res.error) {
      toast.error(res.error);
      setIsAlertOpen(false);
    } else {
      toast.success("Pengajuan cuti berhasil dihapus.");
      setIsAlertOpen(false);
      router.refresh();
    }
  };

  return (
    <>
    <div className="flex sm:flex-col flex-row items-center gap-3">
      <Link href={`/pegawai/cuti/edit/${id}`} title="Edit Pengajuan">
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-10 w-10 rounded-full text-amber-600 bg-amber-50 hover:bg-amber-100 hover:text-amber-700 transition-all shadow-sm ring-1 ring-amber-600/10 p-0"
        >
          <PenLine className="w-4.5 h-4.5" />
        </Button>
      </Link>
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={() => setIsAlertOpen(true)}
        disabled={loading}
        title="Hapus Pengajuan"
        className="h-10 w-10 rounded-full text-rose-600 bg-rose-50 hover:bg-rose-100 hover:text-rose-700 transition-all shadow-sm ring-1 ring-rose-600/10 p-0"
      >
        {loading ? <Loader2 className="w-4.5 h-4.5 animate-spin" /> : <Trash2 className="w-4.5 h-4.5" />}
      </Button>
    </div>

      <AlertDialog
        open={isAlertOpen}
        onOpenChange={setIsAlertOpen}
        title="Hapus Pengajuan Cuti"
        description="Apakah Anda yakin ingin menghapus pengajuan cuti ini? Tindakan ini tidak dapat dibatalkan dan data akan hilang secara permanen."
        onConfirm={handleDelete}
        loading={loading}
        confirmText="Ya, Hapus"
        cancelText="Batal"
        variant="danger"
      />
    </>
  );
}
