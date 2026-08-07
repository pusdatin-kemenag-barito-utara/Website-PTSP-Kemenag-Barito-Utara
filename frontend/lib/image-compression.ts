import imageCompression from "browser-image-compression";

export async function compressImageToUnder(file: File, maxSizeKb: number = 800): Promise<File> {
  // Hanya proses file gambar (png, jpg, jpeg, webp)
  if (!file.type.startsWith('image/')) {
    return file;
  }

  // Jika ukuran file sudah kecil (< target), kembalikan langsung
  if (file.size < maxSizeKb * 1024) {
    return file;
  }

  const options = {
    maxSizeMB: maxSizeKb / 1024,
    maxWidthOrHeight: 2048,
    useWebWorker: true,
    initialQuality: 0.8,
  };

  try {
    const compressedFile = await imageCompression(file, options);
    
    // Kembalikan file baru dengan nama asli
    return new File([compressedFile], file.name, {
      type: file.type,
      lastModified: Date.now(),
    });
  } catch (error) {
    console.error("Image compression error:", error);
    return file; // Kembali ke file asli jika gagal
  }
}
