import { NextResponse } from "next/server";
import { fetchAPI } from "@/lib/api";

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") || "";
    let dataObj: any = {};

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      dataObj = {
        name: formData.get("name"),
        phone: formData.get("phone"),
        category: formData.get("category"),
        serviceType: formData.get("serviceType"),
        isAnonymous: formData.get("isAnonymous") === "true",
        content: formData.get("content"),
        incidentDate: formData.get("incidentDate") || undefined,
        incidentLocation: formData.get("incidentLocation") || undefined,
        turnstileToken: formData.get("turnstileToken"),
      };
    } else {
      dataObj = await request.json();
    }

    const result = await fetchAPI("/feedbacks", {
      method: "POST",
      body: JSON.stringify(dataObj),
    });

    return NextResponse.json(result);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Gagal menyimpan pengaduan.";
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
