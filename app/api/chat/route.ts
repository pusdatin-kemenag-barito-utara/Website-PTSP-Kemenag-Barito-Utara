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
    const mistralKey = process.env.MISTRAL_API_KEY;
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
            signal: AbortSignal.timeout(8000),
          },
        );

        if (groqRes.ok) {
          const groqData = await groqRes.json();
          const answer = groqData.choices?.[0]?.message?.content;
          if (answer) return NextResponse.json({ content: answer });
        } else {
          console.warn("Groq status not OK:", groqRes.status, await groqRes.text());
        }
      } catch (e) {
        console.warn("Groq AI Engine failed, trying Gemini...", e);
      }
    }

    // ─── ENGINE 2: GOOGLE GEMINI API ──────────────────────────────────────
    if (geminiKey) {
      for (const model of ["gemini-2.0-flash", "gemini-1.5-flash"]) {
        try {
          const geminiRes = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`,
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
              signal: AbortSignal.timeout(8000),
            },
          );

          if (geminiRes.ok) {
            const geminiData = await geminiRes.json();
            const answer = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
            if (answer) return NextResponse.json({ content: answer });
          } else {
            console.warn(`Gemini (${model}) status not OK:`, geminiRes.status, await geminiRes.text());
          }
        } catch (e) {
          console.warn(`Gemini (${model}) failed...`, e);
        }
      }
    }

    // ─── ENGINE 3: MISTRAL AI API ─────────────────────────────────────────
    if (mistralKey) {
      try {
        const mistralRes = await fetch(
          "https://api.mistral.ai/v1/chat/completions",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${mistralKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "mistral-small-latest",
              messages: formattedMessages,
              temperature: 0.7,
              max_tokens: 800,
            }),
            signal: AbortSignal.timeout(8000),
          },
        );

        if (mistralRes.ok) {
          const mistralData = await mistralRes.json();
          const answer = mistralData.choices?.[0]?.message?.content;
          if (answer) return NextResponse.json({ content: answer });
        } else {
          console.warn("Mistral status not OK:", mistralRes.status, await mistralRes.text());
        }
      } catch (e) {
        console.warn("Mistral AI Engine failed...", e);
      }
    }

    // ─── ENGINE 4: OPENROUTER ─────────────────────────────────────────────
    if (openrouterKey) {
      const models = [
        "google/gemini-2.0-flash-exp:free",
        "meta-llama/llama-3.3-70b-instruct:free",
        "deepseek/deepseek-r1:free",
      ];
      for (const model of models) {
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
                model: model,
                messages: formattedMessages,
                temperature: 0.7,
              }),
              signal: AbortSignal.timeout(8000),
            },
          );

          if (orRes.ok) {
            const orData = await orRes.json();
            const answer = orData.choices?.[0]?.message?.content;
            if (answer) return NextResponse.json({ content: answer });
          } else {
            console.warn(`OpenRouter (${model}) status not OK:`, orRes.status, await orRes.text());
          }
        } catch (e) {
          console.warn(`OpenRouter (${model}) failed...`, e);
        }
      }
    }

    // ─── LOCAL KNOWLEDGE FALLBACK (Jika semua API Key offline / limit) ──────
    const lastUserMsg = messages[messages.length - 1]?.content?.toLowerCase() || "";
    let fallbackText = "Halo Bapak/Ibu, salam dari PTSP Kemenag Barito Utara! Ada yang bisa kami bantu mengenai pendaftaran layanan, syarat dokumen, atau informasi keagamaan?";

    if (lastUserMsg.includes("nikah") || lastUserMsg.includes("kawin")) {
      fallbackText = "Untuk pendaftaran nikah dapat diakses melalui portal SIMKAH (simkah4.kemenag.go.id). Syarat umum meliputi formulir N1, N2, N4, FC KTP, KK, Akta Nikah/Cerai/Kematian (jika ada), serta foto 2x3 & 4x6 latar biru. Seluruh layanan PTSP gratis!";
    } else if (lastUserMsg.includes("halal") || lastUserMsg.includes("sertifikat")) {
      fallbackText = "Pendaftaran Sertifikasi Halal Gratis (SEHATI) dapat diajukan melalui portal ptsp.halal.go.id BPJPH. Persyaratan utama melampirkan NIB dan dokumen data usaha.";
    } else if (lastUserMsg.includes("ijazah") || lastUserMsg.includes("legalisir")) {
      fallbackText = "Untuk legalisir ijazah/STTB, silakan membawa Ijazah asli beserta fotokopi maksimal 5 lembar ke Kantor Kemenag Barito Utara pada jam kerja.";
    } else if (lastUserMsg.includes("pimpinan") || lastUserMsg.includes("kepala") || lastUserMsg.includes("pejabat")) {
      fallbackText = "Kepala Kantor Kemenag Barito Utara saat ini dijabat oleh H. Arbaja, S.Ag., M.A.P, dan Kasubbag TU dijabat oleh Sony Anwari Husni, S.Pd.";
    } else if (lastUserMsg.includes("kontak") || lastUserMsg.includes("alamat") || lastUserMsg.includes("wa")) {
      fallbackText = "Kantor Kemenag Barito Utara berlokasi di Jl. Ahmad Yani No. 126, Muara Teweh. WhatsApp Resmi SI-ATAK: 0851-1749-1212. Jam kerja: Senin-Kamis 07.30-16.00 WIB & Jumat 07.30-16.30 WIB.";
    }

    return NextResponse.json({ content: fallbackText });
  } catch (error: any) {
    console.error("PTSP AI Route Error:", error);
    return NextResponse.json({
      content: "Halo Bapak/Ibu, selamat datang di Portal PTSP Kemenag Barito Utara! Silakan ajukan pertanyaan atau hubungi WhatsApp Call Center SI-ATAK di 0851-1749-1212 untuk informasi lebih lanjut."
    });
  }
}

