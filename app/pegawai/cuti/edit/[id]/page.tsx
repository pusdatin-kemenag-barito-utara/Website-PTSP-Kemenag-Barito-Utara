import { db } from "@/lib/db";
import { pengajuanCuti } from "@/lib/db/schema/kepegawaian";
import { eq, and } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import EditCutiClient from "@/app/pegawai/cuti/edit/[id]/client-page";

export const metadata = {
  title: "Edit Cuti | PTSP Kemenag Barito Utara",
};

export default async function EditCutiPage(props: {
  params: Promise<{ id: string }>;
}) {
  const params = await props.params;
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login/pegawai");
  }

  const cuti = await db.query.pengajuanCuti.findFirst({
    where: and(
      eq(pengajuanCuti.id, params.id),
      eq(pengajuanCuti.userId, user.id),
    ),
  });

  if (!cuti || cuti.status !== "pending") {
    redirect("/pegawai/cuti");
  }

  return <EditCutiClient cuti={cuti} />;
}
