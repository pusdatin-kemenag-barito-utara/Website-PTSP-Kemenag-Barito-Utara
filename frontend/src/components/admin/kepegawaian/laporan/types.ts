export interface LaporanKinerjaItem {
  id: string;
  userId: string;
  pegawaiNama: string;
  pegawaiNip: string;
  pegawaiJabatan: string;
  pegawaiUnitKerja: string;
  pegawaiAvatar?: string | null;
  tanggal: string;
  waktuPelaksanaan?: string | null;
  kegiatanTugasJabatan: string;
  hasil: string;
  buktiDukungUrl?: string | null;
  status: "pending" | "approved" | "revision" | string;
  komentarPimpinan?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LaporanFilterState {
  search: string;
  unitKerja: string;
  status: string;
  month: number;
  year: number;
  date: string;
}

export interface PegawaiRekapSummary {
  userId: string;
  nama: string;
  nip: string;
  jabatan: string;
  unitKerja: string;
  avatarUrl?: string | null;
  totalLkh: number;
  approvedCount: number;
  pendingCount: number;
  revisionCount: number;
  distinctDays: number;
  lastActiveDate?: string;
}
