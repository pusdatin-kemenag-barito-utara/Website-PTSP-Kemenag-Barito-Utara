import { fetchAPI } from "@/lib/api";

export async function getSisaCutiByNip(nip: string) {
  if (!nip) return { n: "0", n1: "0", n2: "0" };

  try {
    const res = await fetchAPI<any>(
      `/pegawai/cuti?nip=${encodeURIComponent(nip)}`,
    );
    if (res && res.data) {
      const data = res.data;
      return {
        n: String(data.sisaCuti ?? 0),
        n1: String(data.cutiTahun1 ?? 0),
        n2: String(data.cutiTahun2 ?? 0),
      };
    }
  } catch (error) {
    console.error("Gagal mengambil data sisa cuti:", error);
  }

  return { n: "0", n1: "0", n2: "0" };
}
