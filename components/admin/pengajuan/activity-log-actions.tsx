"use client";

import { useState, useTransition } from "react";
import { Trash2, Edit2, X, Check } from "lucide-react";
import { toast } from "sonner";
import { updateActivityLogAction, deleteActivityLogAction } from "@/lib/actions/admin/admin-requests";
import { AlertDialog } from "@/components/ui/alert-dialog";

export function ActivityLogActions({
  logId,
  requestId,
  initialNotes,
}: {
  logId: string;
  requestId: string;
  initialNotes: string | null;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [notes, setNotes] = useState(initialNotes || "");
  const [isPending, startTransition] = useTransition();

  const handleUpdate = () => {
    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.append("logId", logId);
        formData.append("requestId", requestId);
        formData.append("notes", notes);
        
        const result = await updateActivityLogAction(formData);
        if (result.success) {
          toast.success(result.message || "Catatan aktivitas diperbarui");
          setIsEditing(false);
        } else {
          toast.error(result.error || "Gagal memperbarui catatan");
        }
      } catch (error: any) {
        toast.error("Terjadi kesalahan sistem: " + error.message);
      }
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.append("logId", logId);
        formData.append("requestId", requestId);
        
        const result = await deleteActivityLogAction(formData);
        if (result.success) {
          toast.success(result.message || "Aktivitas dihapus");
          setShowDeleteAlert(false);
        } else {
          toast.error(result.error || "Gagal menghapus aktivitas");
        }
      } catch (error: any) {
        toast.error("Terjadi kesalahan sistem: " + error.message);
      }
    });
  };

  if (isEditing) {
    return (
      <div className="mt-2 flex gap-2 w-full">
        <input
          type="text"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="flex-1 rounded-md border border-slate-300 px-3 py-1 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          placeholder="Catatan aktivitas..."
          autoFocus
          disabled={isPending}
        />
        <button
          onClick={handleUpdate}
          disabled={isPending}
          className="rounded-md bg-emerald-500 p-1.5 text-white hover:bg-emerald-600 disabled:opacity-50"
        >
          <Check className="h-4 w-4" />
        </button>
        <button
          onClick={() => {
            setNotes(initialNotes || "");
            setIsEditing(false);
          }}
          disabled={isPending}
          className="rounded-md bg-slate-200 p-1.5 text-slate-600 hover:bg-slate-300 disabled:opacity-50"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="relative mt-1">
      {notes && (
        <p className="text-xs text-slate-500 font-medium pr-16">
          {notes}
        </p>
      )}
      {!notes && (
        <p className="text-xs text-slate-400 italic font-medium pr-16">
          Tidak ada catatan tambahan.
        </p>
      )}
      
      <div className="absolute right-0 -top-8 flex gap-1 bg-white/80 backdrop-blur-sm p-1 rounded-lg opacity-0 transition-opacity group-hover:opacity-100">
        <button
          onClick={() => setIsEditing(true)}
          className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-emerald-600"
          title="Edit Catatan"
        >
          <Edit2 className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={() => setShowDeleteAlert(true)}
          disabled={isPending}
          className="rounded-md p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50"
          title="Hapus Aktivitas"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      <AlertDialog
        open={showDeleteAlert}
        onOpenChange={setShowDeleteAlert}
        title="Hapus Riwayat?"
        description="Tindakan ini tidak dapat dibatalkan. Riwayat ini akan dihapus permanen dari sistem."
        onConfirm={handleDelete}
        loading={isPending}
        confirmText="Ya, Hapus"
        cancelText="Batal"
        variant="danger"
      />
    </div>
  );
}
