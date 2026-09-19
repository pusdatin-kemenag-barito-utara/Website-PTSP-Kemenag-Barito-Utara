import imageCompression from "browser-image-compression";

export async function compressImageToUnder(file: File, maxSizeKb: number = 1000): Promise<File> {
  // Hanya proses file gambar (png, jpg, jpeg, webp)
  if (!file.type || !file.type.startsWith("image/")) {
    return file;
  }

  // Jika ukuran file sudah kecil (< target), kembalikan langsung
  if (file.size <= maxSizeKb * 1024) {
    return file;
  }

  const options = {
    maxSizeMB: maxSizeKb / 1024,
    maxWidthOrHeight: 1920,
    useWebWorker: false, // Aman dan stabil di semua browser & Vite
    initialQuality: 0.82,
  };

  try {
    // Beri batas waktu maksimal 3 detik, jika lebih lama gunakan file asli agar tidak menggantung
    const timeoutPromise = new Promise<File>((resolve) => {
      setTimeout(() => resolve(file), 3000);
    });

    const compressionPromise = (async () => {
      const compressedFile = await imageCompression(file, options);
      return new File([compressedFile], file.name, {
        type: file.type || "image/jpeg",
        lastModified: Date.now(),
      });
    })();

    return await Promise.race([compressionPromise, timeoutPromise]);
  } catch (error) {
    console.warn("Image compression skipped, using original file:", error);
    return file;
  }
}
