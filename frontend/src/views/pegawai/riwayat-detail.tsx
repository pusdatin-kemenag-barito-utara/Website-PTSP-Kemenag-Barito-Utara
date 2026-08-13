import { RealtimeSync } from "@/components/ui/realtime-sync";
import { RequestHeader } from "@/pages/masyarakat/pengajuan/[id]/_components/request-header";
import { RequestDetailsCard } from "@/pages/masyarakat/pengajuan/[id]/_components/request-details-card";
import { RequestAnswersCard } from "@/pages/masyarakat/pengajuan/[id]/_components/request-answers-card";
import { RequestDocumentsCard } from "@/pages/masyarakat/pengajuan/[id]/_components/request-documents-card";
import { OutputDocumentCard } from "@/pages/masyarakat/pengajuan/[id]/_components/output-document-card";
import { RevisionSection } from "@/pages/masyarakat/pengajuan/[id]/_components/revision-section";
import { ActivityLogsCard } from "@/pages/masyarakat/pengajuan/[id]/_components/activity-logs-card";

export function RiwayatDetailView({ request }: { request: any }) {
  const signedUrlMap = new Map<string, string | null>();
  (request.documents || []).forEach((doc: any) => {
    signedUrlMap.set(doc.id, doc.filePath || doc.file_path || null);
  });

  return (
    <main className="min-h-screen bg-slate-50/50 dark:bg-slate-950 pb-20 transition-colors duration-300">
      <RealtimeSync />
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8 md:py-10">
        <div className="mx-auto max-w-5xl space-y-6">
          <RequestHeader request={request} backUrl="/pegawai/layanan/ajukan" />

          {request.status === "revision_required" && (
            <RevisionSection
              request={request}
              requirements={request.requirements || []}
            />
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <RequestDetailsCard
                revisionNote={request.revisionNote}
                rejectionReason={request.rejectionReason}
              />
              <RequestAnswersCard
                requestId={request.id}
                answers={request.answers || []}
                documents={request.documents || []}
                status={request.status}
              />
              <RequestDocumentsCard
                documents={request.documents || []}
                signedUrlMap={signedUrlMap}
              />
            </div>

            <div className="space-y-6">
              <OutputDocumentCard
                generatedUrl={request.outputDocumentUrl || null}
              />
              <ActivityLogsCard activityLogs={request.activityLogs || []} />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default RiwayatDetailView;