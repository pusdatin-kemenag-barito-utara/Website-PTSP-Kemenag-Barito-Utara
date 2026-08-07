import { NextResponse } from "next/server";
import { fetchAPI } from "@/lib/api";

export async function GET() {
  try {
    const res = await fetchAPI<any>("/health");
    return NextResponse.json(res);
  } catch (error) {
    return NextResponse.json({ status: "error", message: "Golang backend unavailable" }, { status: 500 });
  }
}
