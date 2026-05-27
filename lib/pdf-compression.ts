/**
 * Utilitas PDF Compression — saat ini hanya pass-through.
 * TODO: Implementasi kompresi PDF menggunakan library seperti pdf-lib.
 */
export async function compressPdfToUnder(
  file: File,
  _maxSizeKb: number = 1024
): Promise<File> {
  return file;
}
