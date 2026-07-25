import "dotenv/config";
import { config } from "dotenv";
config({ path: ".env.local" });

import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "@/lib/db/schema";
import { serviceItems, serviceFormFields, serviceRequirements } from "@/lib/db/schema";
import { eq, inArray } from "drizzle-orm";

const pool = new Pool({
  connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL,
});

const db = drizzle(pool, { schema });

async function seedServiceFieldsAndReqs() {
  console.log("🚀 Starting Seeding Service Fields & Requirements for Tata Usaha Service Items...");

  // 1. Fetch all items in database
  const existingItems = await db.query.serviceItems.findMany();

  if (!existingItems || existingItems.length === 0) {
    console.error("❌ No items found in database");
    process.exit(1);
  }

  // Define comprehensive data per service item
  const seedDataMap: Record<string, {
    fields: Array<{ label: string; name: string; type: string; placeholder: string; isRequired: boolean; options?: string }>;
    reqs: Array<{ documentName: string; description: string; isRequired: boolean; allowedExtensions: string; maxFileSizeMb: number }>;
  }> = {
    "legalisir-sk": {
      fields: [
        {
          label: "Nomor SK / Surat Keputusan",
          name: "nomor_sk",
          type: "text",
          placeholder: "Contoh: 124/Kw.15.1/2/KP.07.6/05/2024",
          isRequired: true,
        },
        {
          label: "Tanggal Penerbitan SK",
          name: "tanggal_sk",
          type: "date",
          placeholder: "Pilih tanggal SK diterbitkan",
          isRequired: true,
        },
        {
          label: "Jumlah Lembar Legalisir",
          name: "jumlah_lembar",
          type: "number",
          placeholder: "Contoh: 5",
          isRequired: true,
        },
        {
          label: "Keperluan Legalisir",
          name: "keperluan",
          type: "text",
          placeholder: "Contoh: Persyaratan Pengangkatan / Pemberkasan Kenaikan Pangkat",
          isRequired: true,
        },
      ],
      reqs: [
        {
          documentName: "Scan SK / Surat Keputusan Asli",
          description: "Scan berwarna berkas SK Asli yang akan dilegalisir (bukan fotokopi).",
          isRequired: true,
          allowedExtensions: "pdf,jpg,jpeg,png",
          maxFileSizeMb: 5,
        },
        {
          documentName: "Scan Kartu Identitas (KTP/NIP)",
          description: "Kartu Tanda Penduduk atau Karpeg pemohon yang masih berlaku.",
          isRequired: true,
          allowedExtensions: "pdf,jpg,jpeg,png",
          maxFileSizeMb: 2,
        },
      ],
    },

    "pengajuan-magang-pkl-ppl": {
      fields: [
        {
          label: "Nama Instansi / Sekolah / Universitas",
          name: "nama_instansi",
          type: "text",
          placeholder: "Contoh: Universitas Islam Negeri Antasari",
          isRequired: true,
        },
        {
          label: "Jurusan / Program Studi",
          name: "jurusan",
          type: "text",
          placeholder: "Contoh: Manajemen Pendidikan Islam / Hukum Tata Negara",
          isRequired: true,
        },
        {
          label: "Jumlah Anggota Peserta",
          name: "jumlah_peserta",
          type: "number",
          placeholder: "Contoh: 3",
          isRequired: true,
        },
        {
          label: "Tanggal Mulai Pelaksanaan",
          name: "tanggal_mulai",
          type: "date",
          placeholder: "Pilih tanggal rencana mulai magang",
          isRequired: true,
        },
        {
          label: "Tanggal Selesai Pelaksanaan",
          name: "tanggal_selesai",
          type: "date",
          placeholder: "Pilih tanggal rencana selesai magang",
          isRequired: true,
        },
      ],
      reqs: [
        {
          documentName: "Surat Pengantar Magang dari Kampus/Sekolah",
          description: "Surat permohonan resmi berstempel dan ditandatangani oleh pimpinan instansi pendidikan.",
          isRequired: true,
          allowedExtensions: "pdf",
          maxFileSizeMb: 5,
        },
        {
          documentName: "Proposal Kegiatan Magang / PKL",
          description: "Proposal singkat memuat maksud, tujuan, rincian jadwal, dan daftar nama anggota peserta.",
          isRequired: true,
          allowedExtensions: "pdf,docx",
          maxFileSizeMb: 10,
        },
      ],
    },

    "permohonan-rekomendasi-penelitian": {
      fields: [
        {
          label: "Judul Penelitian / Skripsi / Tesis",
          name: "judul_penelitian",
          type: "textarea",
          placeholder: "Masukkan judul penelitian secara lengkap dan jelas...",
          isRequired: true,
        },
        {
          label: "Nama Peneliti / Mahasiswa",
          name: "nama_peneliti",
          type: "text",
          placeholder: "Contoh: Ahmad Fauzi, S.Pd",
          isRequired: true,
        },
        {
          label: "NIM / NIK / NIP Peneliti",
          name: "nim_peneliti",
          type: "text",
          placeholder: "Contoh: 2101010892",
          isRequired: true,
        },
        {
          label: "Lokasi / Objek Penelitian",
          name: "lokasi_penelitian",
          type: "select",
          options: "Kantor Kemenag Kab. Barito Utara, KUA Kecamatan, Madrasah Aliyah Negeri, Madrasah Tsanawiyah Negeri",
          placeholder: "Pilih unit objek penelitian",
          isRequired: true,
        },
      ],
      reqs: [
        {
          documentName: "Surat Izin Penelitian dari Kesbangpol / Kampus",
          description: "Surat pengantar izin penelitian dari Badan Kesbangpol atau Dekan Fakultas.",
          isRequired: true,
          allowedExtensions: "pdf",
          maxFileSizeMb: 5,
        },
        {
          documentName: "Outline / Matriks Proposal Penelitian",
          description: "Draf bab 1-3 atau instrumen wawancara/kuesioner yang akan digunakan.",
          isRequired: true,
          allowedExtensions: "pdf,doc,docx",
          maxFileSizeMb: 10,
        },
      ],
    },

    "permohonan-penggunaan-aula-ruangan": {
      fields: [
        {
          label: "Nama Acara / Kegiatan",
          name: "nama_acara",
          type: "text",
          placeholder: "Contoh: Rapat Koordinasi Tahunan Ormas Keagamaan",
          isRequired: true,
        },
        {
          label: "Pilihan Ruangan / Aula",
          name: "pilihan_ruangan",
          type: "select",
          options: "Aula Utama Kemenag, Ruang Rapat Lt. 2, Halaman Depan",
          placeholder: "Pilih lokasi fasilitas yang diajukan",
          isRequired: true,
        },
        {
          label: "Tanggal Penggunaan",
          name: "tanggal_pakai",
          type: "date",
          placeholder: "Pilih tanggal pelaksanaan acara",
          isRequired: true,
        },
        {
          label: "Estimasi Jumlah Peserta",
          name: "jumlah_peserta_acara",
          type: "number",
          placeholder: "Contoh: 50",
          isRequired: true,
        },
      ],
      reqs: [
        {
          documentName: "Surat Permohonan Pinjam Pakai Fasilitas",
          description: "Surat resmi peminjaman aula dari organisasi / lembaga pemohon.",
          isRequired: true,
          allowedExtensions: "pdf",
          maxFileSizeMb: 5,
        },
        {
          documentName: "Rundown / Susunan Acara",
          description: "Jadwal waktu mulai dan berakhirnya kegiatan.",
          isRequired: false,
          allowedExtensions: "pdf,docx,jpg,png",
          maxFileSizeMb: 3,
        },
      ],
    },

    "surat-keterangan-aktif-bekerja": {
      fields: [
        {
          label: "NIP / NIK Pegawai",
          name: "nip_pegawai",
          type: "text",
          placeholder: "Contoh: 198504122010011002",
          isRequired: true,
        },
        {
          label: "Jabatan Saat Ini",
          name: "jabatan_pegawai",
          type: "text",
          placeholder: "Contoh: Pengelola Penyelenggaraan Haji dan Umrah",
          isRequired: true,
        },
        {
          label: "Unit Kerja / Satuan Kerja",
          name: "unit_kerja",
          type: "text",
          placeholder: "Contoh: Seksi Penyelenggaraan Haji dan Umrah",
          isRequired: true,
        },
        {
          label: "Tujuan Pengajuan Surat Keterangan",
          name: "tujuan_surat",
          type: "text",
          placeholder: "Contoh: Permohonan KPR / Pembuatan Paspor / Studi Lanjut",
          isRequired: true,
        },
      ],
      reqs: [
        {
          documentName: "Scan SK Pangkat / Jabatan Terakhir",
          description: "Surat Keputusan pengangkatan pegawai atau SK kenaikan pangkat terakhir.",
          isRequired: true,
          allowedExtensions: "pdf,jpg,jpeg,png",
          maxFileSizeMb: 5,
        },
        {
          documentName: "Scan Kartu Pegawai (Karpeg/KTP)",
          description: "Kartu identitas pegawai yang bersangkutan.",
          isRequired: true,
          allowedExtensions: "pdf,jpg,jpeg,png",
          maxFileSizeMb: 2,
        },
      ],
    },

    "permohonan-narasumber": {
      fields: [
        {
          label: "Nama Acara / Seminar / Bintek",
          name: "nama_kegiatan",
          type: "text",
          placeholder: "Contoh: Sosialisasi Penguatan Moderasi Beragama",
          isRequired: true,
        },
        {
          label: "Topik / Materi Narasumber yang Diminta",
          name: "topik_materi",
          type: "textarea",
          placeholder: "Jelaskan fokus materi narasumber yang diharapkan...",
          isRequired: true,
        },
        {
          label: "Tanggal & Waktu Kegiatan",
          name: "waktu_kegiatan",
          type: "text",
          placeholder: "Contoh: Senin, 12 Agustus 2024 Pukul 09.00 WIB",
          isRequired: true,
        },
        {
          label: "Tempat Pelaksanaan Kegiatan",
          name: "tempat_kegiatan",
          type: "text",
          placeholder: "Contoh: Hotel Muara Teweh / Aula Dinas Pendidikan",
          isRequired: true,
        },
      ],
      reqs: [
        {
          documentName: "Surat Permohonan Narasumber Resmi",
          description: "Surat undangan resmi dari penyelenggara ditujukan kepada Kepala Kantor Kemenag.",
          isRequired: true,
          allowedExtensions: "pdf",
          maxFileSizeMb: 5,
        },
        {
          documentName: "Kerangka Acara / TOR (Terms of Reference)",
          description: "Lampiran TOR memuat tujuan, sasaran peserta, dan susunan acara lengkap.",
          isRequired: false,
          allowedExtensions: "pdf,docx",
          maxFileSizeMb: 5,
        },
      ],
    },
  };

  for (const item of existingItems) {
    let data = seedDataMap[item.slug];

    // Jika tidak cocok langsung via slug, coba cocokkan berdasarkan kata kunci slug/nama
    if (!data) {
      if (item.slug.includes("aula") || item.name.toLowerCase().includes("aula")) {
        data = seedDataMap["permohonan-penggunaan-aula-ruangan"];
      } else if (item.slug.includes("magang") || item.name.toLowerCase().includes("magang")) {
        data = seedDataMap["pengajuan-magang-pkl-ppl"];
      } else if (item.slug.includes("legalisir") || item.name.toLowerCase().includes("legalisir")) {
        data = seedDataMap["legalisir-sk"];
      } else if (item.slug.includes("penelitian") || item.name.toLowerCase().includes("penelitian")) {
        data = seedDataMap["permohonan-rekomendasi-penelitian"];
      } else if (item.slug.includes("aktif") || item.name.toLowerCase().includes("bekerja")) {
        data = seedDataMap["surat-keterangan-aktif-bekerja"];
      } else if (item.slug.includes("narasumber") || item.name.toLowerCase().includes("narasumber")) {
        data = seedDataMap["permohonan-narasumber"];
      }
    }

    if (!data) continue;

    console.log(`\n📌 Seeding for item: [${item.name}] (Slug: ${item.slug}, ID: ${item.id})`);

    // Clean existing fields and reqs first to ensure clean state
    await db.delete(serviceFormFields).where(eq(serviceFormFields.serviceItemId, item.id));
    await db.delete(serviceRequirements).where(eq(serviceRequirements.serviceItemId, item.id));

    // Insert Fields
    let fieldSort = 0;
    for (const f of data.fields) {
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
    console.log(`   ✅ Created ${data.fields.length} form fields`);

    // Insert Requirements
    let reqSort = 0;
    for (const r of data.reqs) {
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
    console.log(`   ✅ Created ${data.reqs.length} document requirements`);
  }

  console.log("\n🎉 Seeding finished successfully!");
  process.exit(0);
}

seedServiceFieldsAndReqs().catch((err) => {
  console.error("❌ Error running seed script:", err);
  process.exit(1);
});
