let maintenanceCache: { isMaintenance: boolean; expiresAt: number } | null = null;

/**
 * Memeriksa apakah aplikasi PTSP sedang dalam mode pemeliharaan (maintenance)
 * yang dikendalikan secara terpusat oleh Pusdatin Kemenag Barito Utara.
 */
export async function checkMaintenanceStatus(): Promise<boolean> {
  const now = Date.now();
  // Di mode DEV gunakan cache singkat (2 detik) agar perubahan status di Pusdatin langsung terbaca server
  const cacheDuration = import.meta.env.DEV ? 2000 : 15000;

  if (maintenanceCache && now < maintenanceCache.expiresAt) {
    return maintenanceCache.isMaintenance;
  }

  // 1. Cek langsung ke database Supabase kemenag_pusdatin.satellite_apps (ground truth tercepat tanpa CDN cache)
  try {
    const { createAdminClient } = await import("@/lib/supabase/admin");
    const supabase = createAdminClient();
    const { data } = await supabase
      .schema("kemenag_pusdatin" as any)
      .from("satellite_apps")
      .select("status")
      .eq("id", "ptsp-kemenag")
      .single();

    if (data && data.status) {
      const isMaintenance = data.status === "maintenance";
      maintenanceCache = { isMaintenance, expiresAt: now + cacheDuration };
      return isMaintenance;
    }
  } catch (error) {
    // Lanjutkan ke HTTP fallback jika direct query gagal
  }

  // 2. Fallback: Cek ke REST API public Pusdatin
  try {
    const pusdatinUrl =
      import.meta.env.PUBLIC_PUSDATIN_URL ||
      process.env.PUBLIC_PUSDATIN_URL ||
      "https://pusdatin.kemenag-baritoutara.com";
    const appId = "ptsp-kemenag";
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

    const response = await fetch(
      `${pusdatinUrl}/api/public/apps/${appId}/status`,
      { signal: controller.signal, cache: "no-store" },
    );
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      const isMaintenance = data?.status === "maintenance";
      maintenanceCache = { isMaintenance, expiresAt: now + cacheDuration };
      return isMaintenance;
    }
  } catch (error) {
    // Abaikan
  }

  maintenanceCache = { isMaintenance: false, expiresAt: now + 3000 };
  return false;
}
