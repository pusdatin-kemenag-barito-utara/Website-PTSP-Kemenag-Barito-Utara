"use server";

import { db } from "@/lib/db";
import { profiles, profilesPemohon } from "@/lib/db/schema";
import { eq, or } from "drizzle-orm";
import { verifyTurnstileToken } from "@/lib/turnstile";

export async function getEmailByPhoneAction(phone: string) {
  if (!phone) throw new Error("Nomor WhatsApp wajib diisi.");

  const digits = phone.replace(/\D/g, "");
  const formats = [digits, `0${digits}`, `62${digits}`];

  try {
    const rows = await db
      .select({ email: profiles.email })
      .from(profiles)
      .innerJoin(profilesPemohon, eq(profiles.id, profilesPemohon.profileId))
      .where(or(...formats.map((f) => eq(profilesPemohon.noHp, f))))
      .limit(1);

    const profile = rows[0];

    if (!profile) {
      return {
        error: "Nomor WhatsApp tidak ditemukan. Pastikan sudah terdaftar.",
      };
    }

    return { email: profile.email };
  } catch (err) {
    console.error("getEmailByPhoneAction query error:", err);
    return { error: "Sistem belum siap atau terjadi kesalahan saat mencari akun." };
  }
}

export async function verifyTurnstileAction(token: string) {
  if (!token)
    return { success: false, error: "Token keamanan tidak ditemukan." };

  try {
    const success = await verifyTurnstileToken(token);
    return { success };
  } catch (err) {
    console.error("Turnstile verify error:", err);
    return { success: false, error: "Gagal memverifikasi keamanan." };
  }
}

export async function handlePegawaiLoginAction(nip: string, password?: string, token?: string) {
  if (!nip) return { error: "NIP wajib diisi." };
  
  if (!token) return { error: "Verifikasi keamanan (Turnstile) wajib diisi." };
  const verifyRes = await verifyTurnstileToken(token);
  if (!verifyRes) return { error: "Gagal memverifikasi keamanan. Silakan coba lagi." };
  
  const pseudoEmail = `${nip}@kemenag.go.id`;
  const defaultPassword = "12345barut";

  let profile;
  try {
    // Cek apakah akun sudah pernah dibuat
    profile = await db.query.profiles.findFirst({
      where: eq(profiles.email, pseudoEmail),
      columns: { email: true },
    });
  } catch (err) {
    console.error("handlePegawaiLoginAction query error:", err);
    return { error: "Sistem belum siap atau terjadi kesalahan saat mencari akun pegawai." };
  }

  if (profile) {
    // Jika sudah ada, kembalikan email agar frontend bisa login dengan signInWithPassword
    return { email: pseudoEmail };
  }

  // Jika belum ada, kita jalankan mekanisme Auto-Register
  // Syarat: password yang dimasukkan harus sesuai default "NIP+barut"
  if (password !== defaultPassword) {
    return { 
      error: "Akun Anda belum terdaftar. Untuk login pertama kali, password harus sesuai NIP+barut." 
    };
  }

  // Lakukan auto-register
  try {
    const { createAdminClient } = await import("@/lib/supabase/admin");
    const adminClient = createAdminClient();

    const { data: newAuthUser, error: createError } = await adminClient.auth.admin.createUser({
      email: pseudoEmail,
      password: defaultPassword,
      email_confirm: true,
      user_metadata: {
        full_name: `Pegawai ${nip}`,
        nip: nip
      }
    });

    if (createError) {
      console.error("Auto-register pegawai error:", createError);
      return { error: "Gagal membuat akun pegawai otomatis: " + createError.message };
    }

    if (newAuthUser?.user) {
      // Tunggu sebentar untuk memastikan trigger berjalan (PostgreSQL trigger is synchronous but just to be safe if connection pool races)
      // Update role dan permission khusus pegawai
      try {
        await db.update(profiles).set({
          role: "pegawai",
          permissions: ["e_laporan_kinerja"]
        }).where(eq(profiles.id, newAuthUser.user.id));
      } catch (updateErr) {
        console.error("Gagal update role pegawai:", updateErr);
      }
    }

    // Pembuatan sukses, kembalikan email
    return { email: pseudoEmail };
  } catch (err) {
    console.error("Auto-register system error:", err);
    return { error: "Sistem gagal melakukan pendaftaran otomatis." };
  }
}
