import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const fileUrl = searchParams.get("url");

  if (!fileUrl) {
    return new NextResponse("URL file tidak boleh kosong", { status: 400 });
  }

  try {
    const res = await fetch(fileUrl, {
      headers: {
        Accept: "application/pdf,image/*,*/*",
      },
    });

    if (!res.ok) {
      return new NextResponse(`Gagal mengambil dokumen (${res.status})`, {
        status: res.status,
      });
    }

    const contentType =
      res.headers.get("content-type") || "application/pdf";
    const arrayBuffer = await res.arrayBuffer();

    return new NextResponse(arrayBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": "inline",
        "Cache-Control": "public, max-age=3600",
        "X-Frame-Options": "SAMEORIGIN",
      },
    });
  } catch (error: any) {
    console.error("View Document Proxy Error:", error);
    return new NextResponse("Terjadi kesalahan saat memproses dokumen", {
      status: 500,
    });
  }
}
