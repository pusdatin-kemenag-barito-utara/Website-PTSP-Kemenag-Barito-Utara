import { LaporanManagerClient } from "@/components/admin/kepegawaian/laporan";

interface ELaporanKinerjaViewProps {
  initialData?: any[];
  masterOptions?: any[];
  profile?: any;
  result?: { error?: string; data?: any[]; isPemimpin?: boolean };
}

export function ELaporanKinerjaView({
  initialData,
  masterOptions = [],
  profile,
  result,
}: ELaporanKinerjaViewProps) {
  // Support either direct initialData or legacy result wrapper
  const data = initialData || result?.data || [];
  const error = result?.error;

  return (
    <div className="w-full pb-6">
      {error ? (
        <div className="bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 p-4 rounded-2xl border border-red-200 dark:border-red-900/50 text-sm font-semibold mb-4">
          {error}
        </div>
      ) : null}

      <LaporanManagerClient
        initialData={data}
        masterOptions={masterOptions}
        profile={profile}
      />
    </div>
  );
}

export default ELaporanKinerjaView;
