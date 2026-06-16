import { requireAuth, getCurrentProfile } from "@/lib/auth";
import { db } from "@/lib/db";
import { pengajuanCuti } from "@/lib/db/schema/kepegawaian";
import { profiles } from "@/lib/db/schema/auth";
import { eq, desc } from "drizzle-orm";
import PageBanner from "@/components/common/PageBanner";
import { CutiApprovalDashboard } from "@/app/pegawai/cuti/persetujuan/client-dashboard";
import { getPejabatList } from "@/lib/actions/admin/pejabat-actions";
import { AutoRefresh } from "@/components/ui/auto-refresh";

// NIP Kepala Kantor Kemenag Barito Utara
const KEPALA_KANTOR_NIP = "197311212001121001";

export const dynamic = "force-dynamic";

export default async function PersetujuanCutiPage() {
  await requireAuth();

  const currentUser = await getCurrentProfile();
  
  // Mengambil semua pengajuan cuti
  const allRequests = await db
    .select({
      id: pengajuanCuti.id,
      jenisCuti: pengajuanCuti.jenisCuti,
      tanggalMulai: pengajuanCuti.tanggalMulai,
      tanggalSelesai: pengajuanCuti.tanggalSelesai,
      alasan: pengajuanCuti.alasan,
      unitKerja: pengajuanCuti.unitKerja,
      jenisPegawai: pengajuanCuti.jenisPegawai,
      masaKerjaTahun: pengajuanCuti.masaKerjaTahun,
      masaKerjaBulan: pengajuanCuti.masaKerjaBulan,
      noHp: pengajuanCuti.noHp,
      alamatCuti: pengajuanCuti.alamatCuti,
      tanggalPilihan: pengajuanCuti.tanggalPilihan,
      namaPemohon: profiles.fullName,
      nipPemohon: profiles.email,
      jabatanPemohon: profiles.unitKerja,
      createdAt: pengajuanCuti.createdAt,
      statusAtasan: pengajuanCuti.statusAtasan,
      statusKepala: pengajuanCuti.statusKepala,
      statusAkhir: pengajuanCuti.status,
      ttdPemohon: pengajuanCuti.ttdPemohon,
      ttdAtasan: pengajuanCuti.ttdAtasan,
      catatanAtasan: pengajuanCuti.catatanAtasan,
      catatanKepala: pengajuanCuti.catatanKepala,
    })
    .from(pengajuanCuti)
    .innerJoin(profiles, eq(pengajuanCuti.userId, profiles.id))
    .orderBy(desc(pengajuanCuti.createdAt));

  const currentYear = new Date().getFullYear();

  const formattedRequests = await Promise.all(allRequests.map(async (r) => {
    const nip = r.nipPemohon?.split("@")[0] || "";
    let sisaCuti, cutiTahun1, cutiTahun2, hakBerjalan;

    if (nip) {
      const { dataCutiPegawai, rekapCutiTahunan } = await import("@/lib/db/schema/kepegawaian");
      const { eq, and } = await import("drizzle-orm");

      const pegawaiData = await db.query.dataCutiPegawai.findFirst({
        where: eq(dataCutiPegawai.nip, nip),
      });

      if (pegawaiData) {
        const rekap = await db.query.rekapCutiTahunan.findFirst({
          where: and(
            eq(rekapCutiTahunan.pegawaiId, pegawaiData.id),
            eq(rekapCutiTahunan.tahunTarget, currentYear)
          ),
        });

        if (rekap) {
          cutiTahun2 = rekap.cutiTahun2 ?? undefined;
          cutiTahun1 = rekap.cutiTahun1 ?? undefined;
          const jumlahCuti = rekap.jumlahCuti ?? null;
          hakBerjalan = jumlahCuti !== null && cutiTahun1 !== undefined && cutiTahun2 !== undefined
            ? jumlahCuti - cutiTahun1 - cutiTahun2
            : (rekap.sisaCuti !== null && cutiTahun1 !== undefined && cutiTahun2 !== undefined)
              ? rekap.sisaCuti - cutiTahun1 - cutiTahun2
              : undefined;
          sisaCuti = rekap.sisaCuti ?? undefined;
        }
      }
    }

    return {
      ...r,
      nipPemohon: nip,
      sisaCuti,
      cutiTahun1,
      cutiTahun2,
      hakBerjalan,
    };
  }));

  // Filter antrean
  const pendingAtasan = formattedRequests.filter((r) => r.statusAtasan === "pending" && r.statusAkhir !== "rejected");
  const pendingKepala = formattedRequests.filter(
    (r) =>
      r.statusAtasan !== "pending" &&
      r.statusKepala === "pending" &&
      r.statusAkhir !== "rejected" &&
      r.statusAkhir !== "approved"
  );
  const riwayat = formattedRequests.filter(
    (r) => r.statusAtasan !== "pending" || r.statusAkhir === "approved" || r.statusAkhir === "rejected"
  );

  const pejabatRes = await getPejabatList();
  const pejabatList = pejabatRes.success ? pejabatRes.data || [] : [];

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      <PageBanner 
        title="Persetujuan Cuti" 
        description="Kelola antrean persetujuan cuti pegawai untuk Atasan Langsung dan Kepala Kantor."
      />
      
      <CutiApprovalDashboard 
        pendingAtasan={pendingAtasan} 
        pendingKepala={pendingKepala} 
        riwayat={riwayat}
        currentProfile={{
          nama: currentUser?.fullName || "Admin",
          nip: currentUser?.email?.split("@")[0] || "",
          role: currentUser?.role || "admin_ptsp",
          isKepalaKantor: currentUser?.email?.split("@")[0] === KEPALA_KANTOR_NIP || currentUser?.role === "kepala_kantor" || currentUser?.role === "super_admin",
        }}
        pejabatList={pejabatList}
      />
      <AutoRefresh intervalMs={20000} />
    </div>
  );
}
