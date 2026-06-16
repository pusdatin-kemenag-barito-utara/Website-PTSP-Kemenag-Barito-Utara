import { db } from "@/lib/db";
import { pengajuanCuti, dataCutiPegawai, rekapCutiTahunan } from "@/lib/db/schema/kepegawaian";
import { eq, and, desc } from "drizzle-orm";
import { getCurrentUser, getCurrentProfile } from "@/lib/auth";
import { redirect } from "next/navigation";
import { PegawaiRiwayatCutiClient } from "@/components/pegawai/cuti/pegawai-riwayat-cuti-client";
import { getPejabatList } from "@/lib/actions/admin/pejabat-actions";
import { getPegawaiProfileAction } from "@/lib/actions/pegawai/cuti";

export const metadata = {
  title: "Riwayat Cuti | PTSP Kemenag Barito Utara",
};

export default async function RiwayatCutiPage() {
  const user = await getCurrentUser();
  const profile = await getCurrentProfile();
  if (!user) {
    redirect("/login/pegawai");
  }

  const riwayatCuti = await db.query.pengajuanCuti.findMany({
    where: eq(pengajuanCuti.userId, user.id),
    orderBy: [desc(pengajuanCuti.createdAt)],
  });

  const pejabatRes = await getPejabatList();
  const pejabatList = pejabatRes.success && pejabatRes.data ? pejabatRes.data : [];

  const actionProfile = await getPegawaiProfileAction();

  return (
    <div className="w-full mx-auto p-3 sm:p-6">
      <PegawaiRiwayatCutiClient
        items={riwayatCuti.map((c) => ({
          id: c.id,
          jenisCuti: c.jenisCuti,
          tanggalMulai: c.tanggalMulai,
          tanggalSelesai: c.tanggalSelesai,
          tanggalPilihan: c.tanggalPilihan,
          alasan: c.alasan,
          status: c.status,
          statusAtasan: c.statusAtasan,
          statusKepala: c.statusKepala,
          catatanAtasan: c.catatanAtasan,
          catatanKepala: c.catatanKepala,
          unitKerja: c.unitKerja,
          createdAt: c.createdAt,
          masaKerjaTahun: c.masaKerjaTahun,
          masaKerjaBulan: c.masaKerjaBulan,
          noHp: c.noHp,
          alamatCuti: c.alamatCuti,
          jenisPegawai: c.jenisPegawai,
          ttdPemohon: c.ttdPemohon,
          ttdAtasan: c.ttdAtasan,
          ttdKepala: c.ttdKepala,
          dokumenUrl: c.dokumenUrl,
          editCount: c.editCount,
        }))}
        profile={
          actionProfile
            ? {
                fullName: actionProfile.nama,
                email: profile?.email || null,
                unitKerja: actionProfile.unitKerja,
                nip: actionProfile.nip,
                jabatan: actionProfile.jabatan,
                sisaCuti: actionProfile.sisaCuti,
                cutiTahun2: actionProfile.cutiTahun2,
                cutiTahun1: actionProfile.cutiTahun1,
                hakBerjalan: actionProfile.hakBerjalan,
                jumlahCuti: actionProfile.jumlahCuti,
                totalDiambil: actionProfile.totalDiambil,
                cutiAlasanPenting: actionProfile.cutiAlasanPenting,
                cutiBesar: actionProfile.cutiBesar,
                cutiBersalin: actionProfile.cutiBersalin,
                cutiSakit: actionProfile.cutiSakit,
              }
            : null
        }
        pejabatList={pejabatList}
      />
    </div>
  );
}
