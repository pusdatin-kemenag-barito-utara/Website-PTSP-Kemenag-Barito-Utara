import { db } from "@/lib/db";
import { pengajuanCuti, dataCutiPegawai, rekapCutiTahunan } from "@/lib/db/schema/kepegawaian";
import { getCurrentUser, getCurrentProfile } from "@/lib/auth";
import { eq, and, gte, count, desc, sql } from "drizzle-orm";
import { isSuperAdmin } from "@/lib/constants";

const PEJABAT_NIPS = [
  "197809042007101005",
  "198110082005011002",
  "197101231998031004",
  "197304062005011008",
  "198002022005011008",
  "197011032003121002",
  "198210022009011011",
  "197311212001121001",
];

const KEPALA_KANTOR_NIP = "197311212001121001";

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

  const nip = profile.nip || (profile.email ? profile.email.split("@")[0] : "");
  const superAdmin = isSuperAdmin(profile.email);
  const isPejabat = superAdmin || PEJABAT_NIPS.includes(nip);
  const isKepalaKantor = superAdmin || nip === KEPALA_KANTOR_NIP || profile.role === "kepala_kantor";

  const currentYear = new Date().getFullYear();
  const firstDayOfMonth = new Date();
  firstDayOfMonth.setDate(1);
  firstDayOfMonth.setHours(0, 0, 0, 0);

  try {
    const [
      totalCount,
      pendingCount,
      approvedThisMonthCount,
      recentCutiList,
      dataPegawai,
    ] = await Promise.all([
      db.select({ value: count() })
        .from(pengajuanCuti)
        .where(eq(pengajuanCuti.userId, user.id)),

      db.select({ value: count() })
        .from(pengajuanCuti)
        .where(
          and(
            eq(pengajuanCuti.userId, user.id),
            eq(pengajuanCuti.status, "pending"),
          ),
        ),

      db.select({ value: count() })
        .from(pengajuanCuti)
        .where(
          and(
            eq(pengajuanCuti.userId, user.id),
            eq(pengajuanCuti.status, "approved"),
            gte(pengajuanCuti.createdAt, firstDayOfMonth),
          ),
        ),

      db.query.pengajuanCuti.findMany({
        where: eq(pengajuanCuti.userId, user.id),
        orderBy: [desc(pengajuanCuti.createdAt)],
        limit: 5,
        columns: {
          id: true,
          jenisCuti: true,
          tanggalMulai: true,
          tanggalSelesai: true,
          status: true,
          statusAtasan: true,
          statusKepala: true,
          createdAt: true,
        },
      }),

      db.query.dataCutiPegawai.findFirst({
        where: eq(dataCutiPegawai.nip, nip),
      }),
    ]);

    let sisaCuti: number | null = null;
    if (dataPegawai) {
      const rekap = await db.query.rekapCutiTahunan.findFirst({
        where: and(
          eq(rekapCutiTahunan.pegawaiId, dataPegawai.id),
          eq(rekapCutiTahunan.tahunTarget, currentYear),
        ),
      });
      sisaCuti = rekap?.sisaCuti ?? null;
    }

    let pendingAtasanCount = 0;
    let pendingKepalaCount = 0;

    if (isPejabat) {
      const [atasanResult, kepalaResult] = await Promise.all([
        db.select({ value: count() })
          .from(pengajuanCuti)
          .where(
            and(
              eq(pengajuanCuti.statusAtasan, "pending"),
              eq(pengajuanCuti.status, "pending"),
            ),
          ),
        db.select({ value: count() })
          .from(pengajuanCuti)
          .where(
            and(
              eq(pengajuanCuti.statusKepala, "pending"),
              eq(pengajuanCuti.statusAtasan, "approved"),
              eq(pengajuanCuti.status, "pending"),
            ),
          ),
      ]);
      pendingAtasanCount = Number(atasanResult[0]?.value ?? 0);
      pendingKepalaCount = Number(kepalaResult[0]?.value ?? 0);
    }

    return {
      sisaCuti,
      totalPengajuanCuti: Number(totalCount[0]?.value ?? 0),
      pengajuanPending: Number(pendingCount[0]?.value ?? 0),
      pengajuanDisetujuiBulanIni: Number(approvedThisMonthCount[0]?.value ?? 0),
      recentCuti: recentCutiList.map((c) => ({
        id: c.id,
        jenisCuti: c.jenisCuti,
        tanggalMulai: c.tanggalMulai,
        tanggalSelesai: c.tanggalSelesai,
        status: c.status,
        statusAtasan: c.statusAtasan,
        statusKepala: c.statusKepala,
        createdAt: c.createdAt,
      })),
      isPejabat,
      isKepalaKantor,
      pendingAtasanCount,
      pendingKepalaCount,
    };
  } catch (error) {
    console.error("getPegawaiDashboardData failed:", error);
    return defaultData;
  }
}
