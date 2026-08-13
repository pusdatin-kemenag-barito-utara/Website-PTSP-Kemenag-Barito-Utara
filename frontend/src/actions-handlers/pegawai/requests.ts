import { requireAuth } from "@/lib/auth";
import { fetchAPI } from "@/lib/api";

export async function getMyRequests() {
  const user = await requireAuth();
  if (!user) return [];

  try {
    const res = await fetchAPI<any>("/requests");
    if (res && res.data && Array.isArray(res.data)) {
      return res.data;
    }
    return [];
  } catch (error) {
    console.error("Gagal mengambil data permohonan pegawai:", error);
    return [];
  }
}
