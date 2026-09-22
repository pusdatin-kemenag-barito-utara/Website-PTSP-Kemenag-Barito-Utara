#!/usr/bin/env bash
set -e

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

echo "================================================================"
echo "  BUILD APK RILIS PTSP SI ATAK KEMENAG BARITO UTARA"
echo "================================================================"
echo ""
echo "Pilih format build APK yang diinginkan:"
echo "  [1] Universal APK (Dapat diinstal di semua jenis HP Android, ~40-45 MB)"
echo "  [2] ARM64 Optimized APK (Super ramping ~15-20 MB, untuk 95%+ HP modern) [RECOMMENDED]"
echo ""
read -p "Pilihan Anda (1 atau 2, default: 2): " CHOICE

if [ -z "$CHOICE" ] || [ "$CHOICE" == "2" ]; then
    echo ""
    echo "[1/3] Memulai build ARM64 Optimized APK (Release - Ukuran Kecil)..."
    cd mobile
    flutter build apk --release --split-per-abi --obfuscate --split-debug-info=build/app/outputs/symbols --strip
    SOURCE_APK="build/app/outputs/flutter-apk/app-arm64-v8a-release.apk"
else
    echo ""
    echo "[1/3] Memulai build Universal APK (Release)..."
    cd mobile
    flutter build apk --release --obfuscate --split-debug-info=build/app/outputs/symbols --strip
    SOURCE_APK="build/app/outputs/flutter-apk/app-release.apk"
fi

echo ""
echo "[2/3] Memeriksa berkas hasil build..."
if [ ! -f "$SOURCE_APK" ]; then
    echo "[ERROR] Berkas APK tidak ditemukan di $SOURCE_APK!"
    exit 1
fi

echo ""
echo "[3/3] Menyalin berkas APK ke menu Download Web Portal Frontend..."
TARGET_DIR="../frontend/public/downloads"
mkdir -p "$TARGET_DIR"
TARGET_FILE="$TARGET_DIR/ptsp-kemenag.apk"

cp -f "$SOURCE_APK" "$TARGET_FILE"

echo ""
echo "================================================================"
echo " BERHASIL! Berkas APK telah terpasang di sistem download web:"
echo " Tujuan: $TARGET_FILE"
echo ""
ls -lh "$TARGET_FILE" | awk '{print " Ukuran File: " $5}'
echo ""
echo " Pengunjung web sekarang dapat mengunduh langsung melalui menu"
echo " 'Unduh Aplikasi Android (APK)' di header website."
echo "================================================================"
