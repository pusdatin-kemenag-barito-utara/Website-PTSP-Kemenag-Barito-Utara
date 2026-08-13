import { RealtimeSync } from "@/components/ui/realtime-sync";
import { RequestHeader } from "@/pages/masyarakat/pengajuan/[id]/_components/request-header";
import { RequestDetailsCard } from "@/pages/masyarakat/pengajuan/[id]/_components/request-details-card";
import { RequestAnswersCard } from "@/pages/masyarakat/pengajuan/[id]/_components/request-answers-card";
import { RequestDocumentsCard } from "@/pages/masyarakat/pengajuan/[id]/_components/request-documents-card";
import { OutputDocumentCard } from "@/pages/masyarakat/pengajuan/[id]/_components/output-document-card";
import { RevisionSection } from "@/pages/masyarakat/pengajuan/[id]/_components/revision-section";
import { ActivityLogsCard } from "@/pages/masyarakat/pengajuan/[id]/_components/activity-logs-card";

export function RequestDetailView({
  request,
  docUrls,
  generatedUrl,
}: {
  request: any;
  docUrls: { id: string; url: string | null }[];
  generatedUrl?: string | null;
}) {
  const signedUrlMap = new Map(docUrls.map((item) => [item.id, item.url]));
  const requirements = request.requirements || [];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <RealtimeSync />

      <RequestHeader request={request} />

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6 md:space-y-8">
          <RequestDetailsCard
            revisionNote={request.revisionNote}
            rejectionReason={request.rejectionReason}
          />

          <RequestAnswersCard
            requestId={request.id}
            answers={request.serviceRequestAnswers ?? []}
            documents={request.serviceRequestDocuments ?? []}
            status={request.status}
          />

          <RequestDocumentsCard
            documents={request.serviceRequestDocuments ?? []}
            signedUrlMap={signedUrlMap}
          />
        </div>

        <div className="space-y-6 md:space-y-8">
          <OutputDocumentCard generatedUrl={generatedUrl || null} />

          <RevisionSection
            request={request}
            requirements={requirements}
          />

          <ActivityLogsCard activityLogs={request.activityLogs ?? []} />
        </div>
      </div>
    </div>
  );
}

export default RequestDetailView;