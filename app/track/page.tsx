import { createAdminClient } from "@/lib/supabase/admin";
import { getDrivePreviewUrl } from "@/lib/google-drive";

import { TrackHero } from "@/components/track/track-hero";
import { TrackStatusCard } from "@/components/track/track-status-card";
import { TrackActivityLogs } from "@/components/track/track-activity-logs";
import { TrackNotFound } from "@/components/track/track-not-found";
import { TrackFeatures } from "@/components/track/track-features";
export default async function TrackPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; kode?: string }>;
}) {
  const params = await searchParams;
  const q = params.q || params.kode || "";
  const admin = createAdminClient();

  let result: any = null;
  let generatedUrl: string | null = null;

  async function getSignedUrl(bucket: string, path?: string | null) {
    if (!path) return null;
    if (path === "EXPIRED") return "EXPIRED";

    // Handle Google Drive links
    if (path.startsWith("gdrive:")) {
      const fileId = path.replace("gdrive:", "");
      return getDrivePreviewUrl(fileId);
    }

    const { data } = await admin.storage
      .from(bucket)
      .createSignedUrl(path, 3600);
    return data?.signedUrl || null;
  }

  if (q.trim()) {
    const { data } = await admin
      .from("service_requests")
      .select(
        `
        id,
        request_number,
        status,
        created_at,
        submitted_at,
        approved_at,
        completed_at,
        rejection_reason,
        revision_note,
        services (name),
        service_items (name),
        generated_documents (*),
        activity_logs (*)
      `,
      )
      .eq("request_number", q.trim())
      .maybeSingle();

    result = data;

    if (
      result &&
      result.generated_documents &&
      result.generated_documents.length > 0
    ) {
      const doc = result.generated_documents[0];
      generatedUrl = await getSignedUrl("generated-documents", doc.file_path);
    }
  }

  return (
    <div className="w-full overflow-hidden">
      <TrackHero q={q} />

      {/* Main Content Area */}
      <section className="relative -mt-16 mb-24 px-6 sm:px-10 lg:px-12">
        <div className="mx-auto w-full max-w-5xl">
          {q.trim() ? (
            result ? (
              <div className="space-y-6">
                <TrackStatusCard result={result} generatedUrl={generatedUrl} />
                <TrackActivityLogs logs={result.activity_logs} />
              </div>
            ) : (
              <TrackNotFound q={q} />
            )
          ) : (
            <TrackFeatures />
          )}
        </div>
      </section>
    </div>
  );
}
