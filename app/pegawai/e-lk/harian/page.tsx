import { getCurrentUser } from "@/lib/auth";
import { getLaporanKinerjaAction } from "@/lib/actions/pegawai/e-lk";
import { ElkhHarianClient } from "./_components/elkh-harian-client";

export default async function ElkhHarianPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  // Get recent 5 LKH
  const { data: recentLkh } = await getLaporanKinerjaAction(user.id, 5);

  return <ElkhHarianClient recentLkh={recentLkh || []} />;
}
