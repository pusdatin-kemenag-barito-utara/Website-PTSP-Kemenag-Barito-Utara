import type { APIRoute } from "astro";
import { getMaintenanceDetails, syncMaintenanceFromPusdatin } from "@/lib/maintenance";

export const GET: APIRoute = async () => {
  const details = await getMaintenanceDetails();
  return new Response(
    JSON.stringify({
      success: true,
      data: details,
      timestamp: new Date().toISOString(),
    }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
      },
    }
  );
};

export const POST: APIRoute = async () => {
  const updated = await syncMaintenanceFromPusdatin();
  return new Response(
    JSON.stringify({
      success: true,
      message: "Status maintenance berhasil disinkronkan langsung dari tabel kemenag_pusdatin.satellite_apps.",
      data: updated,
      timestamp: new Date().toISOString(),
    }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
      },
    }
  );
};
