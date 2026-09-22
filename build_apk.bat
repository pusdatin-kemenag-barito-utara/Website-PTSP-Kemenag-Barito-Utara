@echo off
setlocal enabledelayedexpansion
cd /d "%~dp0"

echo ================================================================
echo   BUILD APK RILIS PTSP SI ATAK KEMENAG BARITO UTARA
echo ================================================================
echo.
echo Pilih format build APK yang diinginkan:
echo   [1] Universal APK (Dapat diinstal di semua jenis HP Android, ~40-45 MB)
echo   [2] ARM64 Optimized APK (Super ramping ~15-20 MB, untuk 95%%+ HP modern) [RECOMMENDED]
echo.
set /p CHOICE="Pilihan Anda (1 atau 2, default: 2): "

if "%CHOICE%"=="" set CHOICE=2
if "%CHOICE%"=="1" goto BUILD_UNIVERSAL
if "%CHOICE%"=="2" goto BUILD_ARM64

:BUILD_UNIVERSAL
echo.
echo [1/3] Memulai build Universal APK (Release)...
cd mobile
call flutter build apk --release --obfuscate --split-debug-info=build\app\outputs\symbols --strip
set SOURCE_APK=build\app\outputs\flutter-apk\app-release.apk
goto COPY_FILE

:BUILD_ARM64
echo.
echo [1/3] Memulai build ARM64 Optimized APK (Release - Ukuran Kecil)...
cd mobile
call flutter build apk --release --split-per-abi --obfuscate --split-debug-info=build\app\outputs\symbols --strip
set SOURCE_APK=build\app\outputs\flutter-apk\app-arm64-v8a-release.apk
goto COPY_FILE

:COPY_FILE
echo.
echo [2/3] Memeriksa berkas hasil build...
if not exist "%SOURCE_APK%" (
    echo [ERROR] Berkas APK tidak ditemukan di %SOURCE_APK%!
    echo Pastikan tidak ada kesalahan kompilasi Flutter.
    cd ..
    pause
    exit /b 1
)

echo.
echo [3/3] Menyalin berkas APK ke menu Download Web Portal Frontend...
set TARGET_DIR=..\frontend\public\downloads
if not exist "%TARGET_DIR%" mkdir "%TARGET_DIR%"
set TARGET_FILE=%TARGET_DIR%\ptsp-kemenag.apk

copy /y "%SOURCE_APK%" "%TARGET_FILE%" >nul
if %ERRORLEVEL% EQU 0 (
    echo.
    echo ================================================================
    echo  BERHASIL! Berkas APK telah terpasang di sistem download web:
    echo  Tujuan: %TARGET_FILE%
    echo.
    for %%F in ("%TARGET_FILE%") do (
        set /a SIZE_MB=%%~zF/1048576
        echo  Ukuran File: !SIZE_MB! MB (%%~zF bytes)
    )
    echo.
    echo  Pengunjung web sekarang dapat mengunduh langsung melalui menu
    echo  "Unduh Aplikasi Android (APK)" di header website.
    echo ================================================================
) else (
    echo [ERROR] Gagal menyalin berkas APK ke folder frontend.
)

cd ..
echo.
pause
