import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { RequestService } from "@/lib/services/request-service";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const serviceIdInput = formData.get("serviceId") as string;
  const serviceItemIdInput = formData.get("serviceItemId") as string;

  if (!serviceIdInput || !serviceItemIdInput) {
    return NextResponse.json(
      { error: "Layanan tidak valid." },
      { status: 400 },
    );
  }

  const serviceId = BigInt(serviceIdInput);
  const serviceItemId = BigInt(serviceItemIdInput);

  try {
    const result = await RequestService.createByApplicant({
      userId: user.id,
      serviceId,
      serviceItemId,
      formData,
    });

    return NextResponse.json({ id: result.id.toString() }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating request:", error);
    if (error.code === "23505") {
      return NextResponse.json(
        {
          error:
            "Terjadi gangguan sinkronisasi nomor pengajuan. Silakan coba klik Kirim kembali.",
        },
        { status: 409 },
      );
    }
    return NextResponse.json(
      { error: error.message || "Gagal membuat pengajuan." },
      { status: 500 },
    );
  }
}
