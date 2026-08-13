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

const PEJABAT_NIPS = [
  "197809042007101005", // Sony
  "198110082005011002", // Handayani
  "197101231998031004", // Bakti
  "197304062005011008", // Supian
  "198002022005011008", // Almubasir
  "197011032003121002", // Hasan
  "198210022009011011", // Wandi
  "197311212001121001"  // Arbaja
];

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
  const isPejabat = superAdmin || PEJABAT_NIPS.includes(nip);

  try {
    // 1. Fetch data rekap cuti pegawai berdasarkan NIP
    let sisaCuti = 12;
    if (nip) {
      const resRekap = await fetchAPI<any>(`/pegawai/cuti?nip=${encodeURIComponent(nip)}`);
      if (resRekap?.data?.sisaCuti !== undefined) {
        sisaCuti = resRekap.data.sisaCuti;
      }
    }

    // 2. Fetch riwayat pengajuan cuti pegawai berdasarkan user_id
    let recentCuti: RecentCutiItem[] = [];
    let totalPengajuanCuti = 0;
    let pengajuanPending = 0;
    let pengajuanDisetujuiBulanIni = 0;

    const resList = await fetchAPI<any>(`/pegawai/cuti?user_id=${encodeURIComponent(user.id)}`);
    const items = Array.isArray(resList?.data) ? resList.data : [];

    totalPengajuanCuti = items.length;

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    recentCuti = items.map((item: any) => {
      const status = item.status || "pending";
      if (status === "pending" || status === "submitted" || status === "draft") {
        pengajuanPending++;
      }

      const itemDate = item.created_at ? new Date(item.created_at) : new Date();
      if (
        (status === "approved" || status === "approved_kepala") &&
        itemDate.getMonth() === currentMonth &&
        itemDate.getFullYear() === currentYear
      ) {
        pengajuanDisetujuiBulanIni++;
      }

      return {
        id: item.id || "",
        jenisCuti: item.jenis_cuti || item.jenisCuti || "Cuti Tahunan",
        tanggalMulai: item.tanggal_mulai || item.tanggalMulai || "",
        tanggalSelesai: item.tanggal_selesai || item.tanggalSelesai || "",
        status: status,
        statusAtasan: item.status_atasan || "pending",
        statusKepala: item.status_kepala || "pending",
        createdAt: itemDate,
      };
    });

    // 3. Jika akun adalah Pejabat, hitung pending approval untuk atasan & kepala
    let pendingAtasanCount = 0;
    let pendingKepalaCount = 0;
    if (isPejabat) {
      try {
        const resAll = await fetchAPI<any>(`/pegawai/cuti`);
        const allItems = Array.isArray(resAll?.data) ? resAll.data : [];
        pendingAtasanCount = allItems.filter(
          (i: any) => i.status_atasan === "pending" && i.status !== "rejected"
        ).length;
        pendingKepalaCount = allItems.filter(
          (i: any) => i.status_atasan === "approved" && i.status_kepala === "pending"
        ).length;
      } catch (e) {}
    }

    return {
      sisaCuti,
      totalPengajuanCuti,
      pengajuanPending,
      pengajuanDisetujuiBulanIni,
      recentCuti,
      isPejabat,
      isKepalaKantor: superAdmin,
      pendingAtasanCount,
      pendingKepalaCount,
    };
  } catch (err) {
    console.error("Error getPegawaiDashboardData:", err);
    return defaultData;
  }
}
