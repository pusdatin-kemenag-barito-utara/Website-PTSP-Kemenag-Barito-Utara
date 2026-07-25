import "dotenv/config";
import { config } from "dotenv";
config({ path: ".env.local" });

import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "@/lib/db/schema";
import { serviceItems, serviceFormFields, serviceRequirements } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

const pool = new Pool({
  connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL,
});

const db = drizzle(pool, { schema });

// Helper to generate fields & requirements for all service items across all departments
function generateDetailsForItem(item: any) {
  const name = item.name.toLowerCase();
  const slug = item.slug.toLowerCase();

  // Standard fields based on service context
  let fields: Array<{ label: string; name: string; type: string; placeholder: string; isRequired: boolean; options?: string }> = [];
  let reqs: Array<{ documentName: string; description: string; isRequired: boolean; allowedExtensions: string; maxFileSizeMb: number }> = [];

  // 1. Legalisir / Pengesahan / Duplikat
  if (name.includes("legalisir") || name.includes("pengesahan") || name.includes("duplikat")) {
    fields = [
      { label: "Nomor Dokumen / Surat", name: "nomor_dokumen", type: "text", placeholder: "Contoh: 102/Kd.15/2024", isRequired: true },
      { label: "Tanggal Dokumen Penerbitan", name: "tanggal_dokumen", type: "date", placeholder: "Pilih tanggal dokumen diterbitkan", isRequired: true },
      { label: "Jumlah Lembar Berkas", name: "jumlah_lembar", type: "number", placeholder: "Contoh: 5", isRequired: true },
      { label: "Alasan / Keperluan Pengajuan", name: "keperluan", type: "text", placeholder: "Contoh: Pemberkasan Kenaikan Pangkat / Administrasi", isRequired: true },
    ];
    reqs = [
      { documentName: "Scan Dokumen Asli", description: "Scan berkas asli berwarna yang akan dilegalisir.", isRequired: true, allowedExtensions: "pdf,jpg,jpeg,png", maxFileSizeMb: 5 },
      { documentName: "Scan Kartu Identitas Pemohon (KTP)", description: "Scan KTP pemohon yang masih berlaku.", isRequired: true, allowedExtensions: "pdf,jpg,jpeg,png", maxFileSizeMb: 2 },
    ];
  }
  // 2. Rekomendasi / Surat Keterangan / Pengantar / Permohonan Izin / Operasional / Pendirian
  else if (name.includes("rekomendasi") || name.includes("izin") || name.includes("operasional") || name.includes("pendirian") || name.includes("tanda daftar")) {
    fields = [
      { label: "Nama Lembaga / Yayasan / Instansi Pemohon", name: "nama_lembaga", type: "text", placeholder: "Contoh: Yayasan Al-Hikmah Barito Utara", isRequired: true },
      { label: "Alamat Lengkap Lembaga", name: "alamat_lembaga", type: "textarea", placeholder: "Masukkan jalan, RT/RW, desa/kelurahan, dan kecamatan...", isRequired: true },
      { label: "Nama Penanggung Jawab / Pimpinan", name: "nama_pimpinan", type: "text", placeholder: "Contoh: H. Ahmad Subardjo, S.Pd.I", isRequired: true },
      { label: "Nomor Kontak / WhatsApp Pimpinan", name: "no_wa_pimpinan", type: "text", placeholder: "Contoh: 081234567890", isRequired: true },
      { label: "Tujuan Pengajuan Permohonan", name: "tujuan_permohonan", type: "textarea", placeholder: "Jelaskan latar belakang dan tujuan permohonan...", isRequired: true },
    ];
    reqs = [
      { documentName: "Surat Permohonan Resmi Lembaga", description: "Surat permohonan bertanda tangan pimpinan dan stempel stempel lembaga.", isRequired: true, allowedExtensions: "pdf", maxFileSizeMb: 5 },
      { documentName: "Scan Akta Notaris & SK Kemenkumham", description: "Dokumen legalitas badan hukum / yayasan pengelola.", isRequired: true, allowedExtensions: "pdf", maxFileSizeMb: 10 },
      { documentName: "Proposal Permohonan Kelayakan", description: "Proposal lengkap yang memuat gambaran umum, sarana prasarana, dan struktur pengurus.", isRequired: true, allowedExtensions: "pdf,docx", maxFileSizeMb: 10 },
    ];
  }
  // 3. Mutasi / Beasiswa / Sertifikasi / Simpatika / Data Siswa / Guru / Bantuan
  else if (name.includes("mutasi") || name.includes("siswa") || name.includes("santri") || name.includes("bantuan") || name.includes("beasiswa") || name.includes("sertifikasi") || name.includes("simpatika") || name.includes("ijazah")) {
    fields = [
      { label: "Nama Lengkap Perorangan / Siswa / Guru", name: "nama_lengkap", type: "text", placeholder: "Contoh: Muhammad Rizky", isRequired: true },
      { label: "NIK / NIP / NISN / NPK", name: "nomor_induk", type: "text", placeholder: "Contoh: 6305012903020001", isRequired: true },
      { label: "Nama Asal Sekolah / Madrasah / Satker", name: "nama_satker_asal", type: "text", placeholder: "Contoh: MAN 1 Barito Utara", isRequired: true },
      { label: "Tahun Ajaran / Angkatan", name: "tahun_ajaran", type: "text", placeholder: "Contoh: 2024/2025", isRequired: true },
    ];
    reqs = [
      { documentName: "Surat Pengantar dari Kepala Madrasah / Satker", description: "Surat pengantar resmi dari pimpinan satuan kerja.", isRequired: true, allowedExtensions: "pdf", maxFileSizeMb: 5 },
      { documentName: "Berkas Lampiran Pendukung (Kartu Keluarga / SK / Rapor)", description: "Lampiran dokumen sesuai syarat layanan yang diajukan.", isRequired: true, allowedExtensions: "pdf,jpg,jpeg,png", maxFileSizeMb: 5 },
    ];
  }
  // 4. Bimbingan / Perkawinan / Rumah Ibadah / Rumah Ibadat / Keagamaan (Kristen, Katolik, Hindu, Buddha, Zakat, Wakaf)
  else if (name.includes("rumah ibadat") || name.includes("pernikahan") || name.includes("pemberkatan") || name.includes("zakat") || name.includes("wakaf") || name.includes("bimbingan") || name.includes("penyuluh") || name.includes("haji") || name.includes("umrah")) {
    fields = [
      { label: "Nama Rumah Ibadat / Lembaga Keagamaan / Pengurus", name: "nama_pengurus_lembaga", type: "text", placeholder: "Contoh: Pengurus Gereja / Pura / Majelis / Nazhir", isRequired: true },
      { label: "Alamat / Lokasi Kegiatan Keagamaan", name: "lokasi_kegiatan", type: "textarea", placeholder: "Masukkan lokasi alamat lengkap...", isRequired: true },
      { label: "Nama Pemohon / Perwakilan", name: "nama_pemohon", type: "text", placeholder: "Contoh: Yohanes Prasetyo", isRequired: true },
      { label: "Nomor Telepon / WhatsApp", name: "kontak_pemohon", type: "text", placeholder: "Contoh: 081298765432", isRequired: true },
    ];
    reqs = [
      { documentName: "Surat Pengantar Permohonan dari Pengurus / Majelis", description: "Surat permohonan resmi dari pengurus rumah ibadat / majelis agama.", isRequired: true, allowedExtensions: "pdf", maxFileSizeMb: 5 },
      { documentName: "Scan Kartu Identitas Pemohon (KTP)", description: "Kartu identitas pemohon atau penanggung jawab.", isRequired: true, allowedExtensions: "pdf,jpg,jpeg,png", maxFileSizeMb: 2 },
      { documentName: "Dokumen Pembentukan / Struktur Pengurus / Tanah Sertifikat", description: "Dokumen bukti pengurusan atau kepemilikan / ikrar.", isRequired: false, allowedExtensions: "pdf,docx,jpg,png", maxFileSizeMb: 10 },
    ];
  }
  // 5. Default General Form (Untuk layanan lainnya yang belum terkategori secara spesifik)
  else {
    fields = [
      { label: "Nama Pemohon / Penanggung Jawab", name: "nama_pemohon_umum", type: "text", placeholder: "Contoh: Budi Santoso", isRequired: true },
      { label: "Nomor Kontak / WhatsApp", name: "kontak_pemohon_umum", type: "text", placeholder: "Contoh: 081234567890", isRequired: true },
      { label: "Nomor Surat Pengantar / Berkas", name: "nomor_surat_pengantar", type: "text", placeholder: "Contoh: 050/Ket/2024", isRequired: true },
      { label: "Deskripsi Keperluan / Uraian Permohonan", name: "uraian_permohonan", type: "textarea", placeholder: "Jelaskan rincian maksud permohonan secara lengkap...", isRequired: true },
    ];
    reqs = [
      { documentName: "Surat Permohonan / Pengantar Resmi", description: "Surat pengantar atau permohonan tertulis yang ditujukan kepada Kepala Kantor.", isRequired: true, allowedExtensions: "pdf", maxFileSizeMb: 5 },
      { documentName: "Scan KTP / Kartu Identitas Pemohon", description: "KTP pemohon yang masih berlaku.", isRequired: true, allowedExtensions: "pdf,jpg,jpeg,png", maxFileSizeMb: 2 },
    ];
  }

  return { fields, reqs };
}

async function seedAllServiceItems() {
  console.log("🚀 Starting Bulk Seeding Form Fields & Requirements for ALL 41 Service Items...");

  const allItems = await db.query.serviceItems.findMany();

  if (!allItems || allItems.length === 0) {
    console.error("❌ No service items found in database!");
    process.exit(1);
  }

  console.log(`📦 Found total ${allItems.length} service items in database.`);

  let totalFieldsCount = 0;
  let totalReqsCount = 0;

  for (const item of allItems) {
    const { fields, reqs } = generateDetailsForItem(item);

    // Cek apakah item sudah memiliki form fields
    const existingFields = await db.query.serviceFormFields.findMany({
      where: eq(serviceFormFields.serviceItemId, item.id),
    });

    if (!existingFields || existingFields.length === 0) {
      let fieldSort = 0;
      for (const f of fields) {
        await db.insert(serviceFormFields).values({
          serviceItemId: item.id,
          label: f.label,
          name: f.name,
          type: f.type,
          placeholder: f.placeholder || "",
          isRequired: f.isRequired,
          options: f.options || null,
          sortOrder: fieldSort++,
        });
      }
      totalFieldsCount += fields.length;
    }

    // Cek apakah item sudah memiliki requirements
    const existingReqs = await db.query.serviceRequirements.findMany({
      where: eq(serviceRequirements.serviceItemId, item.id),
    });

    if (!existingReqs || existingReqs.length === 0) {
      let reqSort = 0;
      for (const r of reqs) {
        await db.insert(serviceRequirements).values({
          serviceItemId: item.id,
          documentName: r.documentName,
          description: r.description,
          isRequired: r.isRequired,
          allowedExtensions: r.allowedExtensions,
          maxFileSizeMb: r.maxFileSizeMb,
          sortOrder: reqSort++,
        });
      }
      totalReqsCount += reqs.length;
    }

    console.log(`   ✅ [${item.name}] (ID: ${item.id}) -> ${fields.length} Fields, ${reqs.length} Requirements`);
  }

  console.log(`\n🎉 BULK SEEDING SUCCESSFUL!`);
  console.log(`   📊 Total Processed Items: ${allItems.length}`);
  console.log(`   📝 Total Created Form Fields: ${totalFieldsCount}`);
  console.log(`   📁 Total Created Document Requirements: ${totalReqsCount}`);

  process.exit(0);
}

seedAllServiceItems().catch((err) => {
  console.error("❌ Error running bulk seed script:", err);
  process.exit(1);
});
