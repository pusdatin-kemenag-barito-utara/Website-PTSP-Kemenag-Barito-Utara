# Direktori Unduhan Berkas Publik (Downloads)

Direktori ini berisi berkas statis yang dapat diunduh langsung oleh publik melalui browser, antara lain:
- `ptsp-kemenag.apk`: Berkas installer aplikasi mobile Android PTSP Kemenag Barito Utara.

## Cara Meletakkan / Memperbarui Berkas APK Rilis:
1. Jalankan build rilis di folder `mobile/`:
   ```bash
   flutter build apk --release
   ```
2. Salin berkas hasil build:
   Dari: `mobile/build/app/outputs/flutter-apk/app-release.apk`
   Ke: `frontend/public/downloads/ptsp-kemenag.apk`
