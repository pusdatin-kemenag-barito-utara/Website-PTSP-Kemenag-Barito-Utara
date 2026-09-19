import { PenggunaClient, type PenggunaTab } from "@/components/admin/pengguna/pengguna-client";

interface PenggunaViewProps {
  initialTab?: PenggunaTab;
  initialPetugas?: any[];
  initialPegawai?: any[];
  initialPemohon?: any[];
  initialStats?: any;
  initialUsers?: any[];
  currentEmail?: string;
}

export function PenggunaView({
  initialTab = "petugas",
  initialPetugas = [],
  initialPegawai = [],
  initialPemohon = [],
  initialStats,
  initialUsers = [],
  currentEmail,
}: PenggunaViewProps) {
  return (
    <div className="pb-6">
      <PenggunaClient
        initialTab={initialTab}
        initialPetugas={initialPetugas}
        initialPegawai={initialPegawai}
        initialPemohon={initialPemohon}
        initialStats={initialStats}
        initialUsers={initialUsers}
        currentEmail={currentEmail}
      />
    </div>
  );
}

export default PenggunaView;
