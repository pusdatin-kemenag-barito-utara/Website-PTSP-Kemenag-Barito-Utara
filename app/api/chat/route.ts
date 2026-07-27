import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { services, serviceItems, serviceRequirements } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

const BASE_SYSTEM_PROMPT = `Anda adalah asisten virtual resmi Kemenag Kabupaten Barito Utara untuk Portal PTSP (Pelayanan Terpadu Satu Pintu).

ATURAN PENTING:
- Jawab SINGKAT, maksimal 2-3 kalimat saja.
- Gunakan bahasa Indonesia yang formal, sopan, dan ramah (Gunakan sapaan "Bapak/Ibu" atau "Saudara").
- Jika memberikan daftar persyaratan atau langkah-langkah, gunakan format list dengan tanda hubung "-" di awal setiap baris agar rapi.
- DILARANG MENGGUNAKAN simbol bintang dua (**) atau format Markdown bold. Tulis teks secara biasa tanpa simbol asterisks (**).
- Jaga jawaban agar tetap terstruktur, padat, dan jelas.
- Jika tidak tahu jawabannya atau sistem ragu, arahkan pengguna untuk menghubungi WhatsApp Call Center PTSP SI-ATAK melalui link https://wa.me/6285117491212 (nomor 0851-1749-1212).

DATA ORGANISASI & JABATAN PIMPINAN KEMENAG BARITO UTARA:

PIMPINAN PUSAT (KEMENAG RI):
- Menteri Agama Republik Indonesia: KH. Nasaruddin Umar (Dilantik 21 Oktober 2024).
- Wakil Menteri Agama: Muhammad Syafi'i.

PIMPINAN & PEJABAT STRUKTUR DAERAH (KEMENAG KABUPATEN BARITO UTARA):
- Kepala Kantor Kemenag Barito Utara: H. Arbaja, S.Ag., M.A.P
- Kepala Subbagian Tata Usaha: Sony Anwari Husni, S.Pd
- Kepala Seksi Pendidikan Madrasah: Handayani, S.Pd.I
- Kepala Seksi Pendidikan Agama Islam: H. Bakti Tawaddin, M.Pd
- Kepala Seksi Pendidikan Diniyah & Pondok Pesantren: Supian, SE
- Kepala Seksi Bimbingan Masyarakat Islam: Almubasir, S.Pd.I
- Penyelenggara Zakat & Wakaf: Hasan Fauzi, S.Ag
- Penyelenggara Hindu: Wandi, SH.AH
- Pengembang Sistem, IT & Pengelola Portal PTSP: Muhammad Nazilah, S.E. (Pegawai Kepegawaian, Sub Bagian Tata Usaha)

LAYANAN PUBLIK & PTSP SI-ATAK:
1. LAYANAN NIKAH: Pendaftaran via SIMKAH (simkah4.kemenag.go.id). Syarat umum: N1, N2, N4, FC KTP, FC KK, Akta Cerai/Kematian (jika ada), dan pas foto 2x3 & 4x6 background biru.
2. SERTIFIKASI HALAL: Melalui aplikasi SEHATI (Sertifikasi Halal Gratis) / ptsp.halal.go.id BPJPH.
3. LEGALISIR IJAZAH: Membawa Ijazah/STTB asli dan fotokopi (maksimal 5 lembar).
4. LAYANAN HAJI & UMRAH: Layanan Haji & Umrah tidak lagi di bawah Kementerian Agama. Informasi haji ditangani oleh badan/instansi yang berwenang.
5. SELURUH LAYANAN PTSP GRATIS / Rp 0 (Kecuali PNBP Nikah di luar KUA Rp 600.000 via Bank).

KONTAK DETAIL:
- Alamat: Jl. Ahmad Yani No.126, Muara Teweh, Barito Utara, Kalteng 73811.
- Telepon: (0519) 21269
- WhatsApp Resmi SI-ATAK: 0851-1749-1212
- Jam Kerja: Senin-Kamis 07.30-16.00 WIB, Jumat 07.30-16.30 WIB
- Motto: "Ikhlas Beramal"
`;

// Helper untuk membaca daftar layanan dan persyaratan dari Database Supabase/Drizzle
async function getDatabaseKnowledgeContext() {
  try {
    const activeServices = await db
      .select({
        id: services.id,
        name: services.name,
        category: services.category,
        requirementsText: services.requirementsText,
      })
      .from(services)
      .where(eq(services.isActive, true));

    const activeItems = await db
      .select({
        id: serviceItems.id,
        serviceId: serviceItems.serviceId,
        name: serviceItems.name,
        description: serviceItems.description,
        estimatedTime: serviceItems.estimatedTime,
      })
      .from(serviceItems)
      .where(eq(serviceItems.isActive, true));

    const reqs = await db
      .select({
        serviceItemId: serviceRequirements.serviceItemId,
        documentName: serviceRequirements.documentName,
        description: serviceRequirements.description,
        isRequired: serviceRequirements.isRequired,
      })
      .from(serviceRequirements);

    if (!activeServices.length && !activeItems.length) return "";

    let dbText = "\n\nKATALOG LAYANAN DARI DATABASE REAL-TIME PTSP:\n";

    for (const s of activeServices) {
      dbText += `\n- Kategori/Kategori Layanan: ${s.name}`;
      if (s.requirementsText) dbText += ` (Persyaratan umum: ${s.requirementsText})`;
      
      const items = activeItems.filter((item) => item.serviceId === s.id);
      for (const item of items) {
        dbText += `\n  * Layanan: ${item.name}`;
        if (item.estimatedTime) dbText += ` | Estimasi: ${item.estimatedTime}`;
        
        const itemReqs = reqs.filter((r) => r.serviceItemId === item.id);
        if (itemReqs.length > 0) {
          dbText += `\n    Persyaratan Dokumen:`;
          for (const r of itemReqs) {
            dbText += `\n      - ${r.documentName}${r.description ? `: ${r.description}` : ""}${r.isRequired ? " (Wajib)" : " (Opsional)"}`;
          }
        }
      }
    }

    return dbText;
  } catch (err) {
    console.warn("Gagal mengambil katalog layanan dari DB:", err);
    return "";
  }
}


export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const dbContext = await getDatabaseKnowledgeContext();
    const fullSystemPrompt = `${BASE_SYSTEM_PROMPT}${dbContext}`;

    const groqKey = process.env.GROQ_API_KEY;
    const geminiKey = process.env.GEMINI_API_KEY;
    const openrouterKey = process.env.OPENROUTER_API_KEY;

    const formattedMessages = [
      { role: "system", content: fullSystemPrompt },
      ...messages.map((m: any) => ({
        role: m.role,
        content: m.content,
      })),
    ];

    // ─── ENGINE 1: GROQ (Llama 3.3 70B) ──────────────────────────────────
    if (groqKey) {
      try {
        const groqRes = await fetch(
          "https://api.groq.com/openai/v1/chat/completions",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${groqKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "llama-3.3-70b-versatile",
              messages: formattedMessages,
              temperature: 0.7,
              max_tokens: 800,
            }),
            signal: AbortSignal.timeout(6000),
          },
        );

        if (groqRes.ok) {
          const groqData = await groqRes.json();
          const answer = groqData.choices?.[0]?.message?.content;
          if (answer) return NextResponse.json({ content: answer });
        }
      } catch (e) {
        console.warn("Groq AI Engine failed, trying Gemini...", e);
      }
    }

    // ─── ENGINE 2: GOOGLE GEMINI API (Gemini 2.0 Flash / 1.5 Flash) ─────
    if (geminiKey) {
      try {
        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: messages.map((m: any) => ({
                role: m.role === "assistant" ? "model" : "user",
                parts: [{ text: m.content }],
              })),
              systemInstruction: {
                parts: [{ text: fullSystemPrompt }],
              },
            }),
            signal: AbortSignal.timeout(6000),
          },
        );

        if (geminiRes.ok) {
          const geminiData = await geminiRes.json();
          const answer =
            geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
          if (answer) return NextResponse.json({ content: answer });
        }
      } catch (e) {
        console.warn("Gemini AI Engine failed, trying OpenRouter...", e);
      }
    }

    // ─── ENGINE 3: OPENROUTER (Llama 3.3 / Gemini Free) ──────────────────
    if (openrouterKey) {
      try {
        const appUrl =
          process.env.NEXT_PUBLIC_APP_URL ||
          "https://ptsp.kemenag-baritoutara.com";

        const orRes = await fetch(
          "https://openrouter.ai/api/v1/chat/completions",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${openrouterKey}`,
              "Content-Type": "application/json",
              "HTTP-Referer": appUrl,
              "X-Title": "PTSP Kemenag Barito Utara",
            },
            body: JSON.stringify({
              model: "meta-llama/llama-3.3-70b-instruct:free",
              messages: formattedMessages,
              temperature: 0.7,
            }),
            signal: AbortSignal.timeout(6000),
          },
        );

        if (orRes.ok) {
          const orData = await orRes.json();
          const answer = orData.choices?.[0]?.message?.content;
          if (answer) return NextResponse.json({ content: answer });
        }
      } catch (e) {
        console.warn("OpenRouter AI Engine failed...", e);
      }
    }

    throw new Error("Tidak ada engine AI yang memberikan respons.");
  } catch (error: any) {
    console.error("PTSP AI Route Error:", error);
    return NextResponse.json(
      {
        error:
          "Maaf, sistem AI sedang dalam pemeliharaan. Silakan hubungi kami via WhatsApp SI-ATAK (0851-1749-1212).",
      },
      { status: 500 },
    );
  }
}

