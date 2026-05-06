import { Card } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { updateRequestStatusAction } from "@/lib/actions/admin-requests";
import { DeleteRequestButton } from "@/components/admin/delete-request-button";
import { MessageSquare, User } from "lucide-react";

export function ReviewActionCard({
  request,
  adminProfile,
}: {
  request: any;
  adminProfile: any;
}) {
  return (
    <Card title="Aksi Review" icon={MessageSquare}>
      <form action={updateRequestStatusAction} className="space-y-5">
        <input type="hidden" name="request_id" value={request.id} />
        <div className="space-y-4">
          <Field label="Status Keputusan">
            <div className="relative">
              <select
                name="status"
                defaultValue={request.status}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-bold text-slate-700 shadow-sm transition-all duration-200 hover:border-slate-400 focus:border-[#1f4bb7] focus:ring-2 focus:ring-[#1f4bb7]/20 appearance-none bg-[url('data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2394a3b8%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-[length:16px] bg-[right_16px_center] bg-no-repeat pr-12 outline-none cursor-pointer"
              >
                <option value="under_review">🔄 Sedang Ditinjau</option>
                <option value="revision_required">⚠️ Perlu Revisi</option>
                <option value="rejected">❌ Ditolak</option>
                <option value="approved">✅ Disetujui</option>
                <option value="completed">🎉 Selesai</option>
              </select>
            </div>
          </Field>
          <Field label="Diproses oleh">
            <div className="relative flex items-center">
              <User className="absolute left-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                disabled
                value={adminProfile.full_name || adminProfile.email}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-3 text-sm font-bold text-slate-500 cursor-not-allowed outline-none"
              />
            </div>
          </Field>
          <Field
            label="Catatan Admin (Opsional)"
            hint="Alasan penolakan atau catatan tambahan"
          >
            <Textarea
              name="notes"
              defaultValue={
                request.revision_note || request.rejection_reason || ""
              }
              className="min-h-[100px] rounded-xl border-slate-300 focus:border-[#1f4bb7] focus:ring-[#1f4bb7]/20 text-sm shadow-sm"
              placeholder="Tuliskan catatan di sini..."
            />
          </Field>
        </div>
        <Button className="w-full h-12 rounded-xl text-sm font-bold bg-gradient-to-r from-[#1f4bb7] to-[#2557c9] hover:shadow-lg hover:shadow-blue-500/30 transition-all active:scale-[0.98]">
          <MessageSquare className="h-4 w-4 mr-2" />
          Simpan Keputusan
        </Button>
      </form>

      <div className="mt-8 pt-6 border-t border-slate-100">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">
          Zona Bahaya
        </p>
        <DeleteRequestButton requestId={request.id} />
      </div>
    </Card>
  );
}
