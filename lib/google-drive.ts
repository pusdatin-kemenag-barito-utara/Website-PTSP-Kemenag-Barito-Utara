/**
 * Helper untuk Google Drive Storage (Non-aktif / Standby)
 */

export async function getDriveClient() {
  return null;
}

export async function uploadToGoogleDrive(_file: File, _folderPath: string) {
  // Google Drive backup dinonaktifkan (penyimpanan utama menggunakan Cloudflare R2)
  return null;
}
