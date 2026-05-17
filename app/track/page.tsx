import { getPublicRequestStatus } from "@/lib/actions/public/public-track";
import { RealtimeSync } from "@/components/ui/realtime-sync";

// Local Components
import { TrackHeader } from "./_components/track-header";
import { TrackSearchForm } from "./_components/track-search-form";
import { TrackEmptyState } from "./_components/track-empty-state";
import { TrackErrorState } from "./_components/track-error-state";
import { TrackResultCard } from "./_components/track-result-card";

export default async function TrackPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const result = q ? await getPublicRequestStatus(q) : null;

  return (
    <main className="min-h-screen bg-slate-50 pt-32 pb-20">
      <RealtimeSync />
      <div className="mx-auto max-w-4xl px-6">
        <TrackHeader />
        
        <TrackSearchForm initialQuery={q} />

        {/* Result Section */}
        {!q ? (
          <TrackEmptyState />
        ) : result?.error ? (
          <TrackErrorState message={result.error} />
        ) : result?.data ? (
          <TrackResultCard data={result.data} />
        ) : null}
      </div>
    </main>
  );
}
