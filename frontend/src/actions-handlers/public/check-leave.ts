import { fetchAPI } from "@/lib/api";

export async function checkLeaveAction(nip: string) {
  try {
    const res = await fetchAPI<any>(`/pegawai/cuti?nip=${encodeURIComponent(nip)}`);
    if (res && res.success && res.data) {
      return { data: res.data };
    }
    return { error: res?.error || "Data Cuti Tidak Ditemukan" };
  } catch (error: any) {
    console.error("Error in checkLeaveAction:", error);
    return {
      error: error.message || "Terjadi kesalahan saat memproses data cuti.",
    };
  }
}
