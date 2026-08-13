import { createAdminClient } from "@/lib/supabase/admin";

export class AuthService {
  /**
   * Register a new applicant (Pemohon) via Supabase Auth Admin
   */
  static async registerPemohon(data: any) {
    const { fullName, phone, address, password } = data;
    const admin = createAdminClient();

    if (!password || password.length < 6) {
      throw new Error("Password minimal 6 karakter.");
    }

    const digits = phone.replace(/\D/g, "");
    const internalEmail = `p${digits}@ptsp.id`;

    const { data: authUser, error: authError } = await admin.auth.admin.createUser({
      email: internalEmail,
      password: password,
      email_confirm: true,
      user_metadata: { full_name: fullName, phone, address, role: "user" },
    });

    if (authError || !authUser.user) throw new Error(authError?.message || "Gagal membuat akun.");
    return authUser.user;
  }

  /**
   * Register a new staff member (Petugas) via Supabase Auth Admin
   */
  static async registerPetugas(data: any) {
    const { fullName, phone, address, password, role } = data;
    const admin = createAdminClient();

    if (!password || password.length < 6) {
      throw new Error("Password minimal 6 karakter.");
    }

    const digits = phone.replace(/\D/g, "");
    const internalEmail = `staff_${digits}@ptsp.id`;

    const { data: authUser, error: authError } = await admin.auth.admin.createUser({
      email: internalEmail,
      password: password,
      email_confirm: true,
      user_metadata: { full_name: fullName, phone, address, role },
    });

    if (authError || !authUser.user) throw new Error(authError?.message || "Gagal membuat akun.");
    return authUser.user;
  }
}
