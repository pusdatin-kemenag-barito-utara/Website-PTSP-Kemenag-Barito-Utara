import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    success: true,
    message: "Silakan gunakan fitur Import CSV di panel admin master cuti/pegawai.",
  });
}
