import sharp from "sharp";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.resolve(__dirname, "../public");

async function convert() {
  const images = [
    { input: "kantor-kemenag-hd.jpg", output: "kantor-kemenag-hd.webp", quality: 82 },
    { input: "kantor-kemenag.jpg", output: "kantor-kemenag.webp", quality: 82 },
    { input: "pejabat.png", output: "pejabat.webp", quality: 85 },
  ];

  for (const img of images) {
    const inPath = path.join(publicDir, img.input);
    const outPath = path.join(publicDir, img.output);

    if (!fs.existsSync(inPath)) {
      console.warn(`⚠️ File tidak ditemukan: ${inPath}`);
      continue;
    }

    const beforeSize = (fs.statSync(inPath).size / 1024).toFixed(1);
    console.log(`Mengonversi ${img.input} (${beforeSize} KB)...`);

    await sharp(inPath)
      .webp({ quality: img.quality })
      .toFile(outPath);

    const afterSize = (fs.statSync(outPath).size / 1024).toFixed(1);
    const reduction = (
      ((fs.statSync(inPath).size - fs.statSync(outPath).size) /
        fs.statSync(inPath).size) *
      100
    ).toFixed(1);

    console.log(
      `✅ Sukses: ${img.output} (${afterSize} KB) — Berhasil hemat ${reduction}%!`
    );
  }
}

convert().catch((err) => {
  console.error("Gagal mengonversi gambar:", err);
  process.exit(1);
});
