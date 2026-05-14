/**
 * Utilitas PDF Compression sederhana.
 * Mengembalikan file asli sesuai permintaan user (Non-Kompresi).
 */
export async function compressPdfToUnder(
  file: File,
  _maxSizeKb: number = 1024
): Promise<File> {
  // Langsung kembalikan file asli tanpa diproses
  return file;
}
