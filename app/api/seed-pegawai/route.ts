import { NextResponse } from "next/server";
import fs from "fs";
import { db } from "@/lib/db";
import { profiles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  try {
    const csvPath = "c:\\Users\\Asus\\Downloads\\DAFTAR JUMLAH CUTI PEGAWAI ASN KEMENAG BARUT - Copy of Kantor Kemenag Barut.csv";
    
    if (!fs.existsSync(csvPath)) {
      return NextResponse.json({ error: "File CSV tidak ditemukan" }, { status: 404 });
    }

    const fileContent = fs.readFileSync(csvPath, "utf-8");
    const lines = fileContent.split("\n");
    const adminClient = createAdminClient();

    let successCount = 0;
    let errorCount = 0;
    const errors = [];

    // Baris 0 dan 1 adalah header, data mulai dari index 2
    for (let i = 2; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // Parsing CSV sederhana, mengabaikan koma di dalam string bertanda kutip
      const cols = [];
      let current = "";
      let inQuotes = false;
      for (let char of line) {
        if (char === '"') inQuotes = !inQuotes;
        else if (char === ',' && !inQuotes) {
          cols.push(current);
          current = "";
        } else {
          current += char;
        }
      }
      cols.push(current);

      if (cols.length < 4) continue;

      const no = cols[0];
      const nama = cols[1]?.trim();
      const nip = cols[2]?.trim();
      const jabatan = cols[3]?.trim();

      if (!nip || nip.length < 10) continue; // Skip jika tidak ada NIP valid

      const pseudoEmail = `${nip}@pegawai.barut.kemenag.go.id`;
      const defaultPassword = `${nip}barut`;

      // Cek apakah user sudah ada
      const existingUser = await db.query.profiles.findFirst({
        where: eq(profiles.email, pseudoEmail)
      });

      if (existingUser) {
        // Skip
        continue;
      }

      // Buat akun baru
      const { data: authData, error: createError } = await adminClient.auth.admin.createUser({
        email: pseudoEmail,
        password: defaultPassword,
        email_confirm: true,
        user_metadata: {
          full_name: nama,
          nip: nip,
        },
      });

      if (createError) {
        errorCount++;
        errors.push(`NIP ${nip}: ${createError.message}`);
        continue;
      }

      if (authData.user) {
        try {
          await db.update(profiles).set({
            fullName: nama,
            role: "pegawai",
            unitKerja: jabatan,
            permissions: ["e_laporan_kinerja"],
          }).where(eq(profiles.id, authData.user.id));
          successCount++;
        } catch (dbErr: any) {
          errorCount++;
          errors.push(`DB NIP ${nip}: ${dbErr.message}`);
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Berhasil import ${successCount} pegawai, Gagal: ${errorCount}`,
      errors
    });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
