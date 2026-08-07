import { NextResponse } from "next/server";
import { fetchAPI } from "@/lib/api";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await fetchAPI("/appointments", {
      method: "POST",
      body: JSON.stringify(body),
    });
    return NextResponse.json(result);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Gagal membuat janji temu.";
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
