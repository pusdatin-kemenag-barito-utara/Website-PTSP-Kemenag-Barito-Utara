import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    // ─── 1 KESATUAN OTAK AI ───────────────────────────────────────────────────
    // PTSP AI mem-proxy seluruh pesannya langsung ke otak AI Website Utama.
    // Dengan ini:
    // 1. PTSP mewarisi memori/instruksi/prompt yang SAMA PERSIS dengan Website Utama.
    // 2. PTSP ikut menikmati 100 Lapis Engine AI.
    // 3. Jika ada update di Website Utama, PTSP otomatis ikut cerdas tanpa perlu coding ulang.

    // Default URL Website Utama (Bisa di-override jika ada variabel environment)
    const mainApiUrl =
      process.env.MAIN_WEBSITE_API_URL ||
      "https://baritoutara.kemenag.go.id/api/chat";

    // Informasi khusus yang di-inject dari PTSP
    const ptspContext = `
USER SEDANG BERADA DI PORTAL PTSP:
- Pengguna saat ini sedang melakukan obrolan dari dalam Website PTSP (Pelayanan Terpadu Satu Pintu) Kemenag Barito Utara.
- Arahkan pengguna untuk menggunakan fitur-fitur di dalam portal PTSP ini, seperti: Pendaftaran Layanan Online, Pelacakan Status Layanan, dan mengunduh Dokumen SOP.
- Sampaikan bahwa seluruh layanan di PTSP ini gratis (kecuali PNBP Nikah di luar KUA yang disetor langsung ke bank).
- Jika ada kendala teknis dalam menggunakan portal PTSP ini, sampaikan bahwa website ini dikelola oleh Bapak Muhammad Nazilah, S.E.
`;

    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      "https://ptsp.kemenag-baritoutara.com";

    const response = await fetch(mainApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Menambahkan referer agar OpenRouter di server utama mengetahui asalnya
        "HTTP-Referer": appUrl,
        "X-Title": "PTSP Kemenag Barut AI",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
      body: JSON.stringify({ messages, system_injection: ptspContext }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.error || "Gagal menghubungi AI pusat Kemenag Barito Utara.",
      );
    }

    // Mengembalikan jawaban dari AI Website Utama ke ChatWidget PTSP
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("PTSP AI Proxy Error:", error);
    return NextResponse.json(
      {
        error:
          "Asisten sedang sibuk atau koneksi ke server utama terputus. Detail: " + (error.message || error.toString()),
      },
      { status: 500 },
    );
  }
}
