import { fetchAPI } from "@/lib/api";

export async function getHomeVideos() {
  try {
    const res = await fetchAPI<{ success: boolean; videos?: any[]; totalCount?: number }>("/videos", {
      cache: "no-store",
    });
    if (res && Array.isArray(res.videos) && res.videos.length > 0) {
      return { videos: res.videos, totalCount: res.totalCount || res.videos.length };
    }
  } catch (error) {
    console.error("Error fetching home videos:", error);
  }

  // Fallback video profil resmi jika tabel/API belum terisi
  return {
    videos: [
      {
        id: "1",
        title: "Profil Kantor Kementerian Agama Kabupaten Barito Utara",
        youtubeId: "5N8O8jQ8b_0",
        createdAt: new Date().toISOString(),
      },
      {
        id: "2",
        title: "Pelayanan Terpadu Satu Pintu (Si ATAK) Kemenag Barito Utara",
        youtubeId: "dQw4w9WgXcQ",
        createdAt: new Date().toISOString(),
      },
    ],
    totalCount: 2,
  };
}

export async function getPublicServices() {
  try {
    const res = await fetchAPI<{ success: boolean; data: any[] }>("/services", { cache: "no-store" });
    const data = res.data || [];
    // Hanya tampilkan layanan utama yang AKTIF (is_active !== false)
    const activeServices = data.filter((s: any) => (s.is_active !== undefined ? s.is_active : s.isActive) !== false);
    const publicServices = activeServices.filter((s: any) => s.category === "public" || s.category === "umum" || !s.category);
    return publicServices;
  } catch (error) {
    console.error("Error fetching public services:", error);
    return [];
  }
}

export async function getEmployeeServices() {
  try {
    const res = await fetchAPI<{ success: boolean; data: any[] }>("/services", { cache: "no-store" });
    const data = res.data || [];
    const activeServices = data.filter((s: any) => (s.is_active !== undefined ? s.is_active : s.isActive) !== false);
    return activeServices.filter((s: any) => s.category === "asn");
  } catch (error) {
    console.error("Error fetching employee services:", error);
    return [];
  }
}

export async function getServiceBySlug(slug: string) {
  try {
    const res = await fetchAPI<{ success: boolean; data: any }>(`/services/${slug}`);
    return res.data || null;
  } catch (error) {
    console.error("Error fetching service by slug:", error);
    return null;
  }
}

export async function getPublicServiceCatalog() {
  return getPublicServices();
}

export async function getServiceCatalog() {
  try {
    const res = await fetchAPI<{ success: boolean; data: any[] }>("/services");
    return res.data || [];
  } catch (error) {
    console.error("Error fetching service catalog:", error);
    return [];
  }
}
