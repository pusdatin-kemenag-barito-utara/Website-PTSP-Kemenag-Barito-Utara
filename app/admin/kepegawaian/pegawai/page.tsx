import { requireAuth } from "@/lib/auth";
import { getPegawaiListAction } from "@/lib/actions/admin/kepegawaian";
import { db } from "@/lib/db";
import { dataCutiPegawai } from "@/lib/db/schema";
import { asc } from "drizzle-orm";
import { KepegawaianTabs } from "@/components/admin/kepegawaian/kepegawaian-tabs";

export default async function ManajemenKepegawaianPage() {
  await requireAuth();

  const [{ data: pegawaiList, error }, dataCuti] = await Promise.all([
    getPegawaiListAction(),
    db.query.dataCutiPegawai.findMany({
      orderBy: [asc(dataCutiPegawai.no)],
      with: { rekapCutiTahunan: true },
    }),
  ]);

  return (
    <KepegawaianTabs
      pegawaiData={pegawaiList || []}
      pegawaiError={error || null}
      dataCuti={dataCuti}
    />
  );
}
