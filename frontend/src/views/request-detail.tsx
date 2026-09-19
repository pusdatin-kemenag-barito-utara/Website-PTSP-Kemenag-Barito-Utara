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

      <div className="grid gap-5 md:gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-5 md:space-y-6">
          <RequestDetailsCard
            revisionNote={request.revisionNote || request.revision_note}
            rejectionReason={request.rejectionReason || request.rejection_reason}
          />

          <RequestAnswersCard
            requestId={request.id}
            answers={(request.serviceRequestAnswers && request.serviceRequestAnswers.length > 0)
              ? request.serviceRequestAnswers
              : (request.answers ?? request.service_request_answers ?? [])}
            documents={request.serviceRequestDocuments ?? request.documents ?? []}
            status={request.status}
          />

          <RequestDocumentsCard
            documents={request.serviceRequestDocuments ?? request.documents ?? []}
            signedUrlMap={signedUrlMap}
          />
        </div>

        <div className="space-y-5 md:space-y-6">
          <OutputDocumentCard generatedUrl={generatedUrl || null} />

          <RevisionSection
            request={request}
            requirements={requirements}
          />

          <ActivityLogsCard activityLogs={request.activityLogs ?? request.activity_logs ?? []} />
        </div>
      </div>
    </div>
  );
}

export default RequestDetailView;