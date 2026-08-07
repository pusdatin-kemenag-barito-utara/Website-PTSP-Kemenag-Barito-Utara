import { getCurrentUser, getCurrentProfile } from "@/lib/auth";
import { isSuperAdmin } from "@/lib/constants";
import { fetchAPI } from "@/lib/api";

export interface RecentCutiItem {
  id: string;
  jenisCuti: string;
  tanggalMulai: string;
  tanggalSelesai: string;
  status: string;
  statusAtasan: string;
  statusKepala: string;
  createdAt: Date;
}

export interface PegawaiDashboardData {
  sisaCuti: number | null;
  totalPengajuanCuti: number;
  pengajuanPending: number;
  pengajuanDisetujuiBulanIni: number;
  recentCuti: RecentCutiItem[];
  isPejabat: boolean;
  isKepalaKantor: boolean;
  pendingAtasanCount: number;
  pendingKepalaCount: number;
}

export async function getPegawaiDashboardData(): Promise<PegawaiDashboardData> {
  const user = await getCurrentUser();
  const profile = await getCurrentProfile();

  const defaultData: PegawaiDashboardData = {
    sisaCuti: null,
    totalPengajuanCuti: 0,
    pengajuanPending: 0,
    pengajuanDisetujuiBulanIni: 0,
    recentCuti: [],
    isPejabat: false,
    isKepalaKantor: false,
    pendingAtasanCount: 0,
    pendingKepalaCount: 0,
  };

  if (!user || !profile) return defaultData;

  const nip = profile.email ? profile.email.split("@")[0] : "";
  const superAdmin = isSuperAdmin(profile.email);

  try {
    const res = await fetchAPI<any>(`/pegawai/cuti?nip=${encodeURIComponent(nip)}`);
    const cutiData = res?.data || {};

    return {
      ...defaultData,
      sisaCuti: cutiData.sisaCuti ?? 12,
      isPejabat: superAdmin,
    };
  } catch (err) {
    console.error("Error getPegawaiDashboardData:", err);
    return defaultData;
  }
}
