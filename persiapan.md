# Panduan Persiapan & Setup Laptop Baru

## PTSP Kemenag Barito Utara — Mobile (Flutter) & Monorepo

Panduan lengkap ini dibuat untuk memandu instalasi dan konfigurasi dari laptop yang masih **polos / baru** agar dapat langsung menjalankan aplikasi mobile Flutter (dengan emulator Android realtime), Backend Golang, dan Frontend Astro.

---

## 1. Daftar Software yang Wajib Diinstal

Unduh dan pasang software berikut sesuai urutan:

| No  | Software                 | Kegunaan                                    | Link Unduhan Resmi                                                                                   |
| --- | ------------------------ | ------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| 1   | **Git for Windows**      | Version control & terminal Git Bash         | [git-scm.com/download/win](https://git-scm.com/download/win)                                         |
| 2   | **Flutter SDK (Stable)** | Framework aplikasi mobile & Dart SDK        | [docs.flutter.dev/get-started/install/windows](https://docs.flutter.dev/get-started/install/windows) |
| 3   | **Android Studio**       | Android SDK, Command-line Tools, & Emulator | [developer.android.com/studio](https://developer.android.com/studio)                                 |
| 4   | **VS Code**              | Code Editor utama                           | [code.visualstudio.com](https://code.visualstudio.com/)                                              |
| 5   | **Go (Golang v1.22+)**   | Menjalankan Backend REST API                | [go.dev/dl](https://go.dev/dl/)                                                                      |
| 6   | **Node.js (v20+ LTS)**   | Menjalankan Frontend Web Astro              | [nodejs.org](https://nodejs.org/)                                                                    |

---

## 2. Langkah-Langkah Instalasi Detail

### Langkah 1: Install Git for Windows

1. Jalankan installer Git, gunakan pengaturan **default** sampai selesai.
2. Buka terminal (Git Bash atau PowerShell), konfigurasikan identitas Git Anda:
   ```bash
   git config --global user.name "Nama Anda"
   git config --global user.email "emailanda@example.com"
   ```

---

### Langkah 2: Install Flutter SDK & Setting PATH

1. Unduh file `.zip` Flutter SDK dari web resmi (misal `flutter_windows_3.x.x-stable.zip`).
2. **PENTING**: Ekstrak zip tersebut ke folder yang pendek dan **tanpa spasi / tanpa hak Administrator khusus**, sangat disarankan ke:
   ```
   C:\src\flutter
   ```
   _(JANGAN taruh di `C:\Program Files\` karena akan terkena batasan izin sistem Windows)._
3. Daftarkan Flutter ke **Environment Variables (PATH)**:
   - Tekan tombol **Windows**, ketik **"env"**, lalu pilih **Edit the system environment variables**.
   - Klik tombol **Environment Variables...** di kanan bawah.
   - Pada bagian **User variables** (atau **System variables**), cari baris bernama `Path`, lalu klik **Edit**.
   - Klik **New**, lalu masukkan:
     ```
     C:\src\flutter\bin
     ```
   - Klik **OK** di semua jendela untuk menyimpan.
4. Buka terminal baru, verifikasi dengan mengetik:
   ```bash
   flutter --version
   ```

---

### Langkah 3: Install Android Studio & Komponen SDK

1. Pasang Android Studio menggunakan wizard instalasi standar.
2. Buka Android Studio, pada menu pembuka klik **More Actions** (atau icon gear) > **SDK Manager**.
3. Di tab **SDK Platforms**:
   - Centang versi Android terbaru, minimal: **Android 14 (API 34)** atau **Android 15 (API 35)**.
4. Di tab **SDK Tools** (_Sangat Krusial!_):
   - Centang **Android SDK Build-Tools**
   - Centang **Android SDK Command-line Tools (latest)** _(Wajib untuk Flutter!)_
   - Centang **Android Emulator**
   - Centang **Android SDK Platform-Tools**
   - Klik **Apply** lalu **OK** untuk mengunduh semua komponen.

---

### Langkah 4: Buat Virtual Device (Android Emulator)

1. Di Android Studio, klik **Virtual Device Manager** (Device Manager).
2. Klik tombol **+ Create Device** (atau icon panah/tambah).
3. Pilih perangkat dengan Google Play store: contoh **Pixel 7** atau **Pixel 8**. Klik **Next**.
4. Pilih System Image: pilih **UpsideDownCake (API 34)** atau **VanillaIceCream (API 35)** bertipe **x86_64** (klik download jika belum ada). Klik **Next**.
5. Beri nama emulator (misal `Pixel 7 API 34`), lalu klik **Finish**.
6. Coba klik icon tombol **Play (segitiga)** di sebelah emulator untuk memastikannya menyala normal di layar laptop.
   > **Catatan:** Jika emulator gagal jalan, pastikan fitur **Virtualization (VT-x / AMD-V)** sudah aktif di BIOS laptop Anda.

---

### Langkah 5: Setujui Lisensi Android

Buka terminal baru (PowerShell atau Git Bash), lalu jalankan perintah berikut untuk menyetujui semua lisensi SDK:

```bash
flutter doctor --android-licenses
```

Ketik **`y`** dan tekan **Enter** pada setiap konfirmasi lisensi yang muncul.

Setelah itu jalankan:

```bash
flutter doctor
```

Pastikan centang hijau muncul pada:

- [✓] Flutter
- [✓] Android toolchain
- [✓] Chrome / Web
- [✓] Connected device

---

### Langkah 6: Ekstensi yang Perlu Diinstal di VS Code

Buka VS Code, buka menu **Extensions** (`Ctrl + Shift + X`), lalu cari dan install:

1. **Flutter** (by Dart Code) — otomatis mengikutsertakan ekstensi Dart.
2. **Dart** (by Dart Code)
3. **Go** (by Go Team at Google)
4. **Astro** (by Astro)
5. **Tailwind CSS IntelliSense**

---

## 3. Menjalankan Project di Laptop Baru

### Langkah 1: Clone Repository

Buka folder tempat Anda biasa menyimpan project (misal `D:\CODING\`), lalu clone repo ini:

```bash
git clone https://github.com/pusdatin-kemenag-barito-utara/Website-PTSP-Kemenag-Barito-Utara.git ptsp-kemenag
cd ptsp-kemenag
```

_(Atau jika sudah di-clone sebelumnya, cukup jalankan `git pull origin main`)._

---

### Langkah 2: Menjalankan Aplikasi Mobile Flutter (Realtime di Emulator)

1. Buka folder `ptsp-kemenag` di VS Code.
2. Buka terminal di VS Code, masuk ke direktori mobile:
   ```bash
   cd mobile
   flutter pub get
   ```
3. Nyalakan Emulator Android Anda (bisa lewat Android Studio atau klik device selector di pojok kanan bawah VS Code).
4. Jalankan aplikasi ke emulator:
   ```bash
   flutter run
   ```
   _Tips Realtime Development:_
   - Tekan **`r`** di terminal untuk **Hot Reload** (perubahan kode langsung tampil seketika tanpa restart).
   - Tekan **`R`** untuk **Hot Restart**.
   - Tekan **`q`** untuk berhenti.

---

### Langkah 3: Menjalankan Backend Golang (Zero Hardcode via Infisical)

Aplikasi mobile terhubung ke backend Golang pada port `8080`. Seluruh kredensial (PostgreSQL Supabase, API Keys) diinjeksi langsung dari Infisical Cloud tanpa file `.env` di lokal:

```bash
cd backend
infisical run --env=prod --path=/ptsp-kemenag -- go run .
```

_(Di emulator Android, localhost laptop diakses secara otomatis melalui IP internal `10.0.2.2:8080`)._

---

### Langkah 4: Menjalankan Frontend Astro (Zero Hardcode via Infisical)

```bash
cd frontend
npm install
infisical run --env=prod --path=/ptsp-kemenag -- npm run dev
```

Akses web portal di browser via `http://localhost:4321`.

---

## 4. Troubleshooting Singkat

1. **Muncul pesan "Waiting for another flutter command to release the startup lock..."**:
   - Jika ini terjadi di Windows, buka PowerShell dan jalankan:
     ```powershell
     Stop-Process -Name dart, flutter -Force -ErrorAction SilentlyContinue
     Remove-Item "C:\src\flutter\bin\cache\*.lock" -Force -ErrorAction SilentlyContinue
     ```
2. **Gradle download lama saat pertama kali `flutter run`**:
   - Saat pertama kali menjalankan project Flutter di laptop baru, Gradle akan mengunduh wrapper (~150MB) dan plugin pendukung ke folder user. Cukup tunggu hingga selesai (hanya 1x di awal).
3. **Aplikasi di Emulator tidak bisa akses Backend**:
   - Pastikan backend Golang sudah aktif berjalan di port `8080`.
   - Android Emulator menggunakan alamat `10.0.2.2` untuk menghubungi `localhost` laptop induk (ini sudah diatur di `mobile/lib/core/constants/api_endpoints.dart`).
