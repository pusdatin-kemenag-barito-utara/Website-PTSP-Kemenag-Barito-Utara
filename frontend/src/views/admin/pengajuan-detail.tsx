import Link from "@/lib/next-compat/link";

import { FormAnswersCard } from "@/components/admin/pengajuan/form-answers-card";
import { RequestDocumentsCard } from "@/components/admin/pengajuan/request-documents-card";
import { ReviewActionCard } from "@/components/admin/pengajuan/review-action-card";
import { HistoryTimelineCard } from "@/components/admin/pengajuan/history-timeline-card";
import { ArrowLeft } from "lucide-react";

import { RealtimeSync } from "@/components/ui/realtime-sync";

// Local Components
import { AdminDetailHeader } from "@/pages/admin/pengajuan/[id]/_components/admin-detail-header";
import { AdminDetailInfoGrid } from "@/pages/admin/pengajuan/[id]/_components/admin-detail-info-grid";

export function AdminRequestDetailView({
  request,
  adminProfile,
  cutiData,
  pejabatList,
  signedUrlMap,
  backUrl,
}: {
  request: any;
  adminProfile: any;
  cutiData: any;
  pejabatList: any[];
  signedUrlMap: Record<string, string | null>;
  backUrl: string;
}) {
  const signedUrlMapInstance = new Map(Object.entries(signedUrlMap));

  return (
    <div className="space-y-6 pb-12">
      <RealtimeSync />
      {/* Back link */}
      <Link
        href={backUrl}
        className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-[#059669] transition-all hover:-translate-x-1"
      >
        <ArrowLeft className="h-4 w-4" />
        Kembali ke daftar pengajuan
      </Link>

      <AdminDetailHeader request={request} cutiData={cutiData} pejabatList={pejabatList} />
      <AdminDetailInfoGrid request={request} />

      {/* Main Content Layout */}
      <div className="grid gap-6 lg:grid-cols-12 mt-6 w-full min-w-0">
        {/* Left Column - Forms & Documents */}
        <div className="space-y-6 lg:col-span-7 min-w-0 w-full overflow-hidden">
          <FormAnswersCard request={request} />
          <RequestDocumentsCard request={request} signedUrlMap={signedUrlMapInstance} />
        </div>

        {/* Right Column - Actions & Logs */}
        <div className="space-y-6 lg:col-span-5 min-w-0 w-full overflow-hidden">
          <ReviewActionCard request={request} adminProfile={adminProfile} />
          <HistoryTimelineCard request={request} />
        </div>
      </div>
    </div>
  );
}

export default AdminRequestDetailView;
