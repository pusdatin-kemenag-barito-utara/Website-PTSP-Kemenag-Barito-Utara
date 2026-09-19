import { useRef, useState } from "react";
import { useRouter } from "@/lib/next-compat/navigation";
import { Card } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { updateRequestStatusAction } from "@/lib/actions/admin/admin-requests";
import { DeleteRequestButton } from "@/components/admin/delete-request-button";
import { MessageSquare, User, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { ModernSelect } from "@/components/ui/modern-select";

export function ReviewActionCard({
  request,
  adminProfile,
}: {
  request: any;
  adminProfile: any;
}) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    setIsPending(true);
    try {
      const result = await updateRequestStatusAction(formData);
      if (result.success) {
        toast.success(result.message || "Keputusan berhasil disimpan");
        formRef.current?.reset();
        router.refresh();
      } else {
        toast.error(result.error || "Gagal menyimpan keputusan");
      }
    } catch (error: any) {
      toast.error("Terjadi kesalahan sistem: " + error.message);
    } finally {
      setIsPending(false);
    }
  };

  const statusOptions = [
    { value: "under_review", label: "Sedang Ditinjau" },
    { value: "revision_required", label: "Perlu Revisi Dokumen" },
    { value: "rejected", label: "Tolak Pengajuan" },
    { value: "approved", label: "Setujui Pengajuan" },
    { value: "completed", label: "Selesaikan Layanan" },
    { value: "spam", label: "Tandai Spam" },
  ];

  return (
    <Card title="Tindak Lanjut & Keputusan" icon={MessageSquare}>
      <form ref={formRef} action={handleSubmit} className="space-y-3.5">
        <input type="hidden" name="requestId" value={request.id} />
        <div className="space-y-3">
          <Field label="Status Keputusan">
            <ModernSelect
              name="status"
              defaultValue={request.status}
              size="sm"
              options={statusOptions}
              triggerClassName="h-9 rounded-lg text-xs font-semibold text-slate-700"
            />
          </Field>

          <Field label="Petugas Peninjau">
            <div className="relative flex items-center">
              <User className="absolute left-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                disabled
                value={adminProfile.fullName || adminProfile.email}
                className="w-full h-9 rounded-lg border border-slate-200 bg-slate-50 pl-8 pr-3 text-xs font-medium text-slate-600 cursor-not-allowed outline-none"
              />
            </div>
          </Field>

          <Field
            label="Catatan Review (Opsional)"
            hint="Alasan penolakan, instruksi revisi, atau catatan"
          >
            <Textarea
              name="notes"
              className="min-h-[75px] rounded-lg border-slate-300 focus:border-[#059669] focus:ring-[#059669]/20 text-xs shadow-2xs"
              placeholder="Tuliskan catatan verifikasi..."
            />
          </Field>
        </div>

        <Button
          disabled={isPending}
          className="w-full h-9.5 rounded-lg text-xs font-bold bg-[#059669] hover:bg-[#047857] hover:shadow-sm transition-all active:scale-[0.98] disabled:opacity-70 text-white"
        >
          {isPending ? (
            <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
          ) : (
            <MessageSquare className="h-3.5 w-3.5 mr-1.5" />
          )}
          {isPending ? "Menyimpan..." : "Simpan Keputusan"}
        </Button>
      </form>

      <div className="mt-5 pt-3.5 border-t border-slate-100">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">
          Tindakan Berbahaya
        </p>
        <DeleteRequestButton
          requestId={request.id}
          redirectUrl={`/admin/pengajuan?type=${request.services?.category === "asn" ? "asn" : "public"}`}
        />
      </div>
    </Card>
  );
}
