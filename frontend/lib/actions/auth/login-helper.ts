"use server";

import { verifyTurnstileToken } from "@/lib/turnstile";
import { fetchAPI } from "@/lib/api";
import { createAdminClient } from "@/lib/supabase/admin";

export async function getEmailByPhoneAction(phone: string) {
  if (!phone) throw new Error("Nomor WhatsApp wajib diisi.");

  const cleanPhone = phone.replace(/\D/g, "");
  const altPhone = cleanPhone.startsWith("0") 
    ? "62" + cleanPhone.slice(1) 
    : (cleanPhone.startsWith("62") ? "0" + cleanPhone.slice(2) : cleanPhone);

  try {
    const res = await fetchAPI<any>(`/admin/search?q=${encodeURIComponent(cleanPhone)}`);
    let profilesList = res?.data?.profiles || res?.profiles || [];

    if (profilesList.length === 0 && altPhone) {
      const resAlt = await fetchAPI<any>(`/admin/search?q=${encodeURIComponent(altPhone)}`);
      profilesList = resAlt?.data?.profiles || resAlt?.profiles || [];
    }

    if (profilesList.length > 0 && profilesList[0].email) {
      return { email: profilesList[0].email };
    }

    // Fallback pseudo-email jika user mendaftar menggunakan nomor WA
    return { email: `${cleanPhone}@pemohon.ptsp` };
  } catch (err) {
    console.error("getEmailByPhoneAction error:", err);
    return { error: "Terjadi kesalahan saat mencari akun WhatsApp." };
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

  try {
    const res = await fetchAPI<any>(`/admin/search?q=${encodeURIComponent(nip)}`);
    const profilesList = res?.data?.profiles || res?.profiles || [];
    if (profilesList.length > 0) {
      return { email: pseudoEmail };
    }
  } catch (err) {
    console.error("handlePegawaiLoginAction search error:", err);
  }

  if (password !== defaultPassword) {
    return { 
      error: "NIP atau password yang Anda masukkan salah. Silakan periksa kembali." 
    };
  }

  // Auto-Register via Supabase Admin Client
  try {
    const adminClient = createAdminClient();

    const { data: newAuthUser, error: createError } = await adminClient.auth.admin.createUser({
      email: pseudoEmail,
      password: defaultPassword,
      email_confirm: true,
      user_metadata: {
        full_name: `Pegawai ${nip}`,
        nip: nip,
        role: "pegawai",
      }
    });

    if (createError) {
      console.error("Auto-register pegawai error:", createError);
      return { error: "Gagal membuat akun pegawai otomatis: " + createError.message };
    }

    if (newAuthUser?.user) {
      try {
        await fetchAPI(`/admin/users/${newAuthUser.user.id}`, {
          method: "PATCH",
          body: JSON.stringify({
            role: "pegawai",
            permissions: ["e_laporan_kinerja"],
          }),
        });
      } catch (updateErr) {
        console.error("Gagal update role pegawai:", updateErr);
      }
    }

    return { email: pseudoEmail };
  } catch (err) {
    console.error("Auto-register system error:", err);
    return { error: "Sistem gagal melakukan pendaftaran otomatis." };
  }
}
