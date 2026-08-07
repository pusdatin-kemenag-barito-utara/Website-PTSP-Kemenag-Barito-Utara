import { fetchAPI } from "@/lib/api";

export async function getHomeVideos() {
  return { videos: [], totalCount: 0 };
}

export async function getPublicServices() {
  try {
    const res = await fetchAPI<{ success: boolean; data: any[] }>("/services");
    const data = res.data || [];
    const publicServices = data.filter((s: any) => s.category === "public" || s.category === "umum");
    return publicServices.length > 0 ? publicServices : data;
  } catch (error) {
    console.error("Error fetching public services:", error);
    return [];
  }
}

export async function getEmployeeServices() {
  try {
    const res = await fetchAPI<{ success: boolean; data: any[] }>("/services");
    const data = res.data || [];
    return data.filter((s: any) => s.category === "asn");
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
