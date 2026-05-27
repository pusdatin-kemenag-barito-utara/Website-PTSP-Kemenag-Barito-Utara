
# 🛡️ AUDIT REPORT — PTSP Kemenag Barito Utara

**Tanggal:** 27 Mei 2026  
**Total Issues:** 75  
**Auditor:** OpenCode AI

---

## 🔴 CRITICAL (28 issues) — Keamanan, Logika Fondasi, Wajib Diperbaiki

### 1. **Plaintext Password Disimpan di Database & Terekspos di Admin UI**
| Item | Detail |
|------|--------|
| File | `lib/db/schema/auth.ts:93`, `components/admin/pengguna/password-cell.tsx:16-20`, `components/admin/pengguna/user-table-content.tsx:103` |
| Penjelasan | Kolom `plainPassword` menyimpan password asli (bukan hash). Password ini dikirim ke komponen React `password-cell.tsx` dan bisa dilihat oleh admin. |
| Dampak | **KRITIS** — Siapa pun dengan akses admin bisa melihat password seluruh user. Jika satu akun admin diretas, semua password user terekspos. Melanggar OWASP Top 10 dan regulasi keamanan data. |
| Rekomendasi | Hapus kolom `plainPassword`. Gunakan Supabase Auth yang sudah mengelola hash. Jangan kirim password ke frontend. |

### 2. **Cloudflare Turnstile Bisa Di-bypass Total**
| Item | Detail |
|------|--------|
| File | `lib/turnstile.ts:30` |
| Penjelasan | Jika env var `TURNSTILE_SECRET_KEY` tidak diset, kode fallback ke testing key publik `1x00000000000000000000000000000000` yang **selalu lolos** verifikasi. |
| Dampak | **KRITIS** — Seluruh proteksi CAPTCHA (login, register, buku tamu, janji temu, feedback) bisa dilewati bot. Form form rentan spam dan brute-force. |
| Rekomendasi | Wajibkan env var, atau throw error jika tidak diset di production. Jangan pakai testing key sebagai fallback. |

### 3. **Middleware Next.js Tidak Berfungsi**
| Item | Detail |
|------|--------|
| File | `proxy.ts` (tidak ada `middleware.ts` di root) |
| Penjelasan | Kode middleware ditulis di `proxy.ts`, tapi Next.js hanya membaca file `middleware.ts` di root project. Tidak ada `middleware.ts` sama sekali. |
| Dampak | **KRITIS** — Rate limiting, session update (`updateSession`), dan proteksi route tidak berjalan. Middleware benar-benar mati. |
| Rekomendasi | Pindahkan kode ke `middleware.ts` di root, atau buat `middleware.ts` yang memanggil fungsi `proxy` dari `proxy.ts`. |

### 4. **Cookie Mutation Pattern Error di Supabase SSR Middleware**
| Item | Detail |
|------|--------|
| File | `lib/supabase/middleware.ts:29-41` |
| Penjelasan | Di dalam `setAll`, `supabaseResponse` di-reassign berulang kali dengan `NextResponse.next(...)`, tapi `requestHeaders` menggunakan referensi lama. Hanya `NextResponse.next` terakhir yang dikembalikan. |
| Dampak | **TINGGI** — Auth tokens mungkin tidak ter-set dengan benar, menyebabkan session hilang, user logout tiba-tiba. |
| Rekomendasi | Ikuti pola official Supabase SSR middleware. Jangan reassign `supabaseResponse` di dalam loop. |

### 5. **Broken Import `SiteHeaderClient`**
| Item | Detail |
|------|--------|
| File | `components/layout/header.tsx:2` |
| Penjelasan | Import `import { SiteHeaderClient } from "@/components/site-header-client"`. Path file tidak cocok dengan struktur direktori (`components/site-header-client.tsx` memang ada, tapi komponen mungkin tidak eksport `SiteHeaderClient` dengan nama yang benar). |
| Dampak | **TINGGI** — Build bisa gagal. Atau runtime error saat mencoba render `SiteHeader`. |
| Rekomendasi | Fix path import atau rename komponen sesuai eksport. |

### 6. **Service Role Key Bisa Terekspos ke Client**
| Item | Detail |
|------|--------|
| File | `lib/supabase/broadcast.ts:12` |
| Penjelasan | `SUPABASE_SERVICE_ROLE_KEY` dikirim sebagai header `apikey` dalam fetch. Fungsi `emitRefreshSignal` tidak punya guard "server only". Jika di-import dari client component, key bisa bocor di Network Tab browser. |
| Dampak | **TINGGI** — Service Role Key adalah kunci super admin Supabase. Jika bocor, attacker bisa akses semua data dan user management. |
| Rekomendasi | Tambahkan `import "server-only"` atau pindahkan ke server action. |

### 7. **NaN Pagination — Crash Jika Query String Invalid**
| Item | Detail |
|------|--------|
| File | `app/admin/pengajuan/page.tsx:37` |
| Penjelasan | `Math.max(1, parseInt(page))` — jika `page` adalah `"abc"`, `parseInt("abc")` → `NaN`, dan `Math.max(1, NaN)` → `NaN`, bukan `1`. |
| Dampak | **TINGGI** — Pagination break. `NaN` sebagai offset query = results kosong atau error. User tidak bisa melihat data. |
| Rekomendasi | `const currentPage = Math.max(1, parseInt(page) || 1)` — fallback ke 1 jika NaN. |

### 8. **Infinite Subscription Loop di Realtime Sync**
| Item | Detail |
|------|--------|
| File | `components/admin/dashboard/dashboard-realtime-sync.tsx:13-56` |
| Penjelasan | `useEffect` dependency `[router, supabase]`. `createClient()` membuat instance baru tiap render, menyebabkan effect re-run terus-menerus, membuat channel subscription baru setiap kali. |
| Dampak | **TINGGI** — Koneksi Realtime membengkak tak terkendali, memory leak, eventual connection limit exhaustion. |
| Rekomendasi | Hapus `supabase` dari dependency array. Atau gunakan `useRef` untuk store supabase client. |

### 9. **Validasi Super Admin Bermasalah — Hanya Hardcoded Email yang Lolos**
| Item | Detail |
|------|--------|
| File | `lib/actions/admin/admin-users.ts:35`, `lib/auth.ts:82-88` |
| Penjelasan | `requirePermission("super_admin")` mengecek apakah string `"super_admin"` ada di array `permissions` user. Default permissions adalah `["ringkasan", "pengajuan", "dokumen_hasil"]` — tidak termasuk `"super_admin"`. Jadi hanya hardcoded email di `isSuperAdmin()` yang lolos. |
| Dampak | **TINGGI** — User dengan role `super_admin` di database TIDAK bisa mengakses fungsi admin seperti manage user, manage roles, dll. |
| Rekomendasi | `requirePermission` harus cek role user juga, bukan hanya permissions. Tambahkan `isAdminRole` atau cek langsung `profile.role === "super_admin"`. |

### 10. **Role Mapping Harcoded by Email — Tidak Scalable**
| Item | Detail |
|------|--------|
| File | `lib/constants.ts:78-89` |
| Penjelasan | `getAdminSpecificRole` hanya mencocokkan 7 email spesifik dengan role admin tertentu. Ini hardcoded dan tidak bisa diubah tanpa deploy ulang. |
| Dampak | **SEDANG** — Jika ada admin baru dengan role spesifik, harus mengubah kode dan deploy ulang. |
| Rekomendasi | Simpan mapping email-to-role di database (tabel `role_permissions` sudah ada). Jangan hardcode. |

### 11. **Registrasi Petugas Tanpa CAPTCHA/Turnstile**
| Item | Detail |
|------|--------|
| File | `components/auth/register-petugas-form.tsx` (seluruh file) |
| Penjelasan | Form registrasi petugas tidak memiliki Turnstile/CAPTCHA, berbeda dengan registrasi pemohon yang memilikinya. |
| Dampak | **TINGGI** — Bot bisa mendaftar ribuan akun petugas palsu secara otomatis, membebani proses verifikasi manual admin. |
| Rekomendasi | Tambahkan komponen `LoginTurnstile` ke form registrasi petugas. |

### 12. **Upload File Tanpa Validasi di Pembuatan Request**
| Item | Detail |
|------|--------|
| File | `lib/services/request/request-applicant.ts` — method `handleUploads` |
| Penjelasan | Method ini upload file langsung ke R2 tanpa mengecek ekstensi, ukuran, atau tipe file. Validasi hanya ada di API route document terpisah (`documents/route.ts`). |
| Dampak | **TINGGI** — User bisa upload file berbahaya (`.exe`, `.html`, dll) tanpa batasan ukuran saat membuat pengajuan baru. |
| Rekomendasi | Tambahkan validasi file sebelum upload di `handleUploads`, atau refactor menggunakan function validasi yang sama dengan `documents/route.ts`. |

### 13. **`startTransition` dengan `async` Function — Loading State Tidak Akurat**
| Item | Detail |
|------|--------|
| File | `components/admin/pengajuan/review-action-card.tsx:25-40`, `components/admin/delete-request-button.tsx:13-38` |
| Penjelasan | `startTransition` di React tidak mendukung `async` function dengan benar. `await` di dalamnya menyebabkan React kehilangan track transisi. |
| Dampak | **SEDANG** — `isPending` bisa `false` padahal request masih berjalan. User bisa klik tombol berkali-kali atau tidak melihat indikator loading. |
| Rekomendasi | Gunakan `useTransition` di luar, atau handle loading state manual dengan `useState`. |

### 14. **NEXT_REDIRECT Catch Antipattern**
| Item | Detail |
|------|--------|
| File | `components/admin/delete-request-button.tsx:28-33` |
| Penjelasan | Catch block menangkap error redirect (`NEXT_REDIRECT`) dan menganggapnya sebagai sukses. Jika redirect gagal, user melihat "Berhasil" padahal data belum tentu terhapus. |
| Dampak | **SEDANG** — False success reporting. User pikir data sudah dihapus padahal belum. |
| Rekomendasi | Jangan catch redirect. Biarkan Next.js menanganinya. Atau pisahkan action dari redirect. |

### 15. **Props Mutation via `.sort()` — React Forbidden**
| Item | Detail |
|------|--------|
| File | `components/forms/request-form-fields.tsx:23-24` |
| Penjelasan | `fields.sort((a, b) => a.sortOrder - b.sortOrder)` — method `.sort()` memutasi array asli. Di React, mutasi props adalah pelanggaran dan menyebabkan unpredictable rendering. |
| Dampak | **TINGGI** — Komponen bisa render dengan data salah, infinite loops, atau crash. |
| Rekomendasi | Gunakan `[...fields].sort(...)` atau `fields.slice().sort(...)`. |

### 16. **Dynamic Tailwind Classes — Hover Gradient Tidak Berfungsi**
| Item | Detail |
|------|--------|
| File | `components/admin/dashboard/admin-dashboard-metrics.tsx:70` |
| Penjelasan | `${item.color}` diinterpolasi runtime, tapi Tailwind JIT compiler hanya generate class yang complete string-nya ada di source code saat build. |
| Dampak | **SEDANG** — Hover gradient, icon colors, dan class dynamic lainnya tidak berfungsi. |
| Rekomendasi | Gunakan mapping object yang return complete class string. |

### 17. **Missing `.limit()` pada Database Queries**
| Item | Detail |
|------|--------|
| File | `app/buku-tamu/page.tsx:16-19`, `app/dashboard/pengajuan/page.tsx:16-29`, `app/dashboard/page.tsx:14-17` |
| Penjelasan | Query `db.select().from(guestBook)` dan `db.query.serviceRequests.findMany(...)` tanpa `.limit()`. Semua data di-fetch sekaligus. |
| Dampak | **TINGGI** — Performance degradation parah seiring pertumbuhan data. Bisa cause memory exhaustion di server jika tabel membesar (ribuan records). |
| Rekomendasi | Tambahkan `.limit()` dan implementasi pagination atau infinite scroll. |

### 18. **Empty Try/Catch di Middleware — Silent Auth Failure**
| Item | Detail |
|------|--------|
| File | `lib/supabase/middleware.ts:47-49` |
| Penjelasan | `try { await supabase.auth.getUser(); } catch (e) {}` — error di-swallow tanpa log apapun. |
| Dampak | **SEDANG** — Jika Supabase Auth bermasalah (network error, token expired), tidak ada yang tahu. Debugging jadi sangat sulit. |
| Rekomendasi | Setidaknya log error: `console.error("Auth check failed:", e)`. |

### 19. **Interval Memory Leak di File Upload**
| Item | Detail |
|------|--------|
| File | `components/forms/request-requirement-upload.tsx:80` |
| Penjelasan | `clearInterval(progressInterval)` hanya dipanggil setelah upload sukses. Jika `compressImageToUnder` throw error sebelum line 80, interval tidak dibersihkan. |
| Dampak | **SEDANG** — Interval terus berjalan selamanya, callback terus dipanggil, memory leak. |
| Rekomendasi | Clear interval di `finally` block, bukan setelah await sukses. |

### 20. **Callback URL Tidak Divalidasi — Open Redirect**
| Item | Detail |
|------|--------|
| File | `components/auth/login-form-by-role.tsx:142` |
| Penjelasan | `window.location.href = callbackUrl` tanpa validasi URL. `callbackUrl` bisa diisi `https://evil.com` oleh attacker. |
| Dampak | **TINGGI** — Open redirect vulnerability. Bisa dipakai phishing. |
| Rekomendasi | Validasi callbackUrl hanya untuk relative path. Gunakan `URL()` parser dan cek origin. |

### 21. **Reset Token Menggunakan SERVICE_ROLE_KEY Sebagai HMAC Secret**
| Item | Detail |
|------|--------|
| File | `lib/actions/auth/reset-password.ts:10` |
| Penjelasan | `const JWT_SECRET = process.env.SUPABASE_SERVICE_ROLE_KEY || "fallback_secret_for_reset"`. Jika service role key diganti (semestinya rutin), semua reset token pending menjadi invalid. Ada juga fallback string hardcoded. |
| Dampak | **SEDANG** — User tidak bisa reset password setelah key diganti. Fallback string bisa ditebak. |
| Rekomendasi | Gunakan env var terpisah untuk reset token (misal `PASSWORD_RESET_SECRET`). |

### 22. **Duplicate Field Names Auto-generated**
| Item | Detail |
|------|--------|
| File | `hooks/wizard/use-wizard-fields.ts:106-111` |
| Penjelasan | Auto-generate `name` dari label: `label.toLowerCase().replace(/[^a-z0-9]/g, "_")`. Dua label berbeda bisa menghasilkan `name` sama (contoh: "Field A" dan "field_a" → "field_a"). |
| Dampak | **SEDANG** — Form data overwrite. Field kedua menimpa field pertama saat submit. Data hilang tanpa pemberitahuan. |
| Rekomendasi | Tambahkan cek duplikat, atau gunakan format `field_{id}` sebagai name. |

### 23. **Password Strength Tidak Konsisten**
| Item | Detail |
|------|--------|
| File | `register-pemohon.ts:18`, `register-petugas.ts:19`, `register-form.tsx:128` |
| Penjelasan | Pemohon: min 6 karakter (Zod). Petugas: min 8 karakter (Zod). Tapi frontend `minLength={6}` untuk kedua form. |
| Dampak | **RENDAH** — Petugas bisa daftar dengan password 6 karakter (lolos frontend) tapi ditolak server. Atau sebaliknya. |
| Rekomendasi | Sinkronkan validasi frontend dan backend. |

### 24. **Tidak Ada CSRF Protection**
| Item | Detail |
|------|--------|
| File | Seluruh project — semua form dan API route |
| Penjelasan | Tidak ada token CSRF di form mana pun. Semua endpoint mengandalkan cookie auth. |
| Dampak | **TINGGI** — Rentan Cross-Site Request Forgery. Jika user login dan mengunjungi site jahat, attacker bisa melakukan action atas nama user. |
| Rekomendasi | Implementasikan CSRF token (misal menggunakan library seperti `csrf` atau `next-csrf`). |

### 25. **Rate Limiting Serverless-incompatible**
| Item | Detail |
|------|--------|
| File | `proxy.ts:5` — in-memory Map |
| Penjelasan | Rate limiting disimpan di Map in-memory yang akan hilang setiap cold start di Vercel. Sistem tidak efektif. |
| Dampak | **SEDANG** — Rate limiting tidak bekerja di production (serverless). Brute force login tidak terbatasi. |
| Rekomendasi | Gunakan Redis, Upstash, atau Vercel KV untuk rate limiting. |

### 26. **BigInt Serialization Issues**
| Item | Detail |
|------|--------|
| File | Multiple — `admin-visitations.ts`, `admin-requests.ts`, dll |
| Penjelasan | BigInt tidak bisa di-serialize ke JSON. Beberapa tempat pakai `.toString()`, beberapa tidak. Ada juga parsing dari string ke BigInt tanpa validasi. |
| Dampak | **SEDANG** — JSON serialization error pada response API. Data id bisa hilang atau berubah. |
| Rekomendasi | Semua response harus melalui `serializeBigInt()` atau pastikan semua BigInt di-convert. |

### 27. **Tidak Ada Rate Limit di Forgot Password**
| Item | Detail |
|------|--------|
| File | `lib/actions/auth/reset-password.ts:35-78` |
| Penjelasan | Endpoint `checkPhoneExistsAction` dan `checkEmailExistsAction` tidak memiliki rate limiting. |
| Dampak | **TINGGI** — Attacker bisa melakukan enumerasi nomor HP / email yang terdaftar dengan brute force. |
| Rekomendasi | Tambahkan rate limiting per IP. Kembalikan response seragam untuk exist dan non-exist. |

### 28. **`getAdminSpecificRole` Tidak Bisa untuk Role-based Access**
| Item | Detail |
|------|--------|
| File | `lib/constants.ts:78-89`, `app/admin/page.tsx:40-43` |
| Penjelasan | Fungsi ini hanya mencocokkan 7 email spesifik. Untuk admin dengan role seperti `admin_pendidikan_madrasah` tapi email tidak ada di list, `specificRole` tetap `admin_ptsp` (default). |
| Dampak | **SEDANG** — Filter konten berdasarkan role bisa salah. Admin non-email-hardcoded mendapat akses tidak sesuai. |
| Rekomendasi | Gunakan `profile.role` langsung, bukan mapping email. |

---

## 🟡 MEDIUM (28 issues) — Fungsionalitas & Performa

### 29. **Inkonsistensi Timestamp `withTimezone`**
| Item | Detail |
|------|--------|
| File | `lib/db/schema/notifications.ts:18-19` |
| Penjelasan | Semua tabel menggunakan `withTimezone: true`, tapi `notifications.createdAt` hanya `timestamp("created_at").defaultNow()` tanpa `withTimezone`. |
| Dampak | Data timestamp tidak konsisten antar tabel. Bisa selisih waktu jika server dan DB timezone berbeda. |

### 30. **Dua Sistem Cleanup Berbeda**
| Item | Detail |
|------|--------|
| File | `lib/services/system-service.ts` (marker `CLEANED_UP`), `app/api/cron/cleanup-documents/route.ts` (marker `EXPIRED`) |
| Penjelasan | Ada dua mekanisme cleanup file dengan marker berbeda. Bisa konflik: satu menghapus file, yang lain menganggap masih perlu di-cleanup. |
| Dampak | File bisa dihapus ganda atau tidak ter-cleanup dengan benar. |

### 31. **`visitDate` Menggunakan Timestamp — Harusnya `date`**
| Item | Detail |
|------|--------|
| File | `lib/db/schema/guest-book.ts:7` |
| Penjelasan | `visitDate` menggunakan `timestamp with timezone` padahal tujuan hanya untuk tanggal kunjungan. |
| Dampak | Kompleksitas timezone tidak perlu. Bisa masalah waktu jika user dari zona waktu berbeda. |

### 32. **Date/Time Appointment Menggunakan TEXT**
| Item | Detail |
|------|--------|
| File | `lib/db/schema/appointments.ts:7-8` |
| Penjelasan | `appointmentDate` dan `appointmentTime` sebagai `text`, bukan `date` / `time`. |
| Dampak | Tidak ada validasi format tanggal di level database. Bisa diisi string sembarangan. Tidak bisa di-sort secara natural di DB. |

### 33. **`profiles.phone` Tidak Punya Unique Constraint**
| Item | Detail |
|------|--------|
| File | `lib/db/schema/auth.ts:83` |
| Penjelasan | Kode mengecek duplikat phone manual, tapi tanpa DB-level unique constraint, race condition bisa membuat duplikat. |
| Dampak | Dua user bisa daftar dengan nomor HP sama. |

### 34. **PDF Compression Tidak Berfungsi**
| Item | Detail |
|------|--------|
| File | `lib/pdf-compression.ts:5-11` |
| Penjelasan | Fungsi `compressPdfToUnder` hanya `return file` tanpa kompresi apapun. |
| Dampak | File PDF besar tidak pernah dikompresi, pemborosan storage. |

### 35. **`generatedAt` Double Set**
| Item | Detail |
|------|--------|
| File | `lib/services/request/request-admin.ts:124-127` |
| Penjelasan | `generatedAt: new Date()` di-set manual, padahal kolom sudah punya `defaultNow()`. |
| Dampak | Tidak ada dampak negatif, hanya redundant. |

### 36. **Cron Secret Handling Inkonsisten**
| Item | Detail |
|------|--------|
| File | `app/api/cron/keep-alive/route.ts` (header), `app/api/cron/cleanup-documents/route.ts` (query param) |
| Penjelasan | Dua cron endpoint membaca secret dengan cara berbeda. Keep-alive pakai `Authorization` header, cleanup pakai query param `secret`. |
| Dampak | Vercel Cron default mengirim header. Query param bisa tercatat di log. |

### 37. **`dangerouslySetInnerHTML` untuk JSON-LD**
| Item | Detail |
|------|--------|
| File | `app/layout.tsx:132-135` |
| Penjelasan | Meskipun data JSON-LD statis dan aman, penggunaan `dangerouslySetInnerHTML` tetap di-flag oleh security scanner. |
| Dampak | Security audit flag, potential XSS jika data berubah menjadi user-controlled di masa depan. |

### 38. **Custom Toast Manual di Petugas Registration**
| Item | Detail |
|------|--------|
| File | `components/auth/register-petugas-form.tsx:68-72` |
| Penjelasan | Ada sonner `<Toaster>` di layout, tapi petugas registration bikin custom toast sendiri dengan div biasa. |
| Dampak | Inkonsistensi UI. Custom toast tidak memiliki fitur sonner (auto-dismiss, animation, dll). |

### 39. **Race Condition `generateNextId` di Persuratan**
| Item | Detail |
|------|--------|
| File | `lib/services/persuratan-service.ts:20-33` |
| Penjelasan | Generate ID dengan read all → find max → increment. Dua request concurrent bisa mendapat ID yang sama. |
| Dampak | Duplikasi nomor surat di Google Sheets. |

### 40. **`checkDuplicateNomorSurat` Logic Error**
| Item | Detail |
|------|--------|
| File | `lib/services/persuratan-service.ts:25` |
| Penjelasan | `row[0] !== excludeId` — jika `row[0]` undefined, perbandingan tetap true. Bisa flagged sebagai duplicate salah. |
| Dampak | Nomor surat unik bisa ditolak karena false positive duplicate check. |

### 41. **`reorderServicesAction` Menggunakan `number[]`**
| Item | Detail |
|------|--------|
| File | `lib/actions/admin/admin-master.ts` |
| Penjelasan | Parameter `ids` adalah `number[]`, tapi `services.id` adalah `bigint`. Cast `BigInt(ids[i])` bisa lossy untuk angka besar. |
| Dampak | Potensi data corruption jika ID melebihi Number.MAX_SAFE_INTEGER. |

### 42. **`serviceItems.slug` Unique Secara Global**
| Item | Detail |
|------|--------|
| File | `lib/db/schema/services.ts:36` |
| Penjelasan | Slug unique global, tapi seharusnya unik per service (kombinasi `serviceId + slug`). Dua layanan berbeda bisa konflik jika memiliki item dengan nama yang mirip. |
| Dampak | Tidak bisa membuat item dengan nama yang sama di service berbeda. |

### 43. **Error Handling Incomplete di Request Creation**
| Item | Detail |
|------|--------|
| File | `app/api/requests/route.ts` |
| Penjelasan | Jika `createByApplicant` berhasil membuat auth user tapi gagal insert profile, user jadi zombie (ada di Auth tapi tidak punya profile). |
| Dampak | User terdaftar tapi tidak bisa login karena profile tidak ada. |

### 44. **`requireAuth()` Tanpa Error Boundary**
| Item | Detail |
|------|--------|
| File | `app/dashboard/layout.tsx:11` |
| Penjelasan | `await requireAuth()` dipanggil tanpa try/catch di layout. Jika throw error unexpected, seluruh layout crash tanpa fallback. |
| Dampak | Halaman dashboard jadi blank/500 tanpa pesan jelas. |

### 45. **Promise.all Tanpa Error Isolation untuk Signed URLs**
| Item | Detail |
|------|--------|
| File | `app/dashboard/pengajuan/[id]/page.tsx:56-61`, `app/admin/pengajuan/[id]/page.tsx:24-35` |
| Penjelasan | Semua `getSignedUrl` dijalankan dalam `Promise.all`. Jika SATU URL gagal (network error, R2 down), SEMUA gagal. |
| Dampak | Halaman detail crash hanya karena satu file tidak bisa diakses. |

### 46. **Role Check Logika Terbalik di Admin Review**
| Item | Detail |
|------|--------|
| File | `app/admin/pengajuan/[id]/page.tsx:77` |
| Penjelasan | `dataFinal.services?.roleOwner !== specificRole` — jika `roleOwner` null, kondisi `null !== "some_role"` selalu true, menyebabkan 403 false positive. |
| Dampak | Admin legitimate bisa ditolak akses ke detail pengajuan. |

### 47. **Array Indexing Tanpa Bounds Check**
| Item | Detail |
|------|--------|
| File | `components/admin/admin-shell.tsx:147-152` |
| Penjelasan | Akses `split(" ").map((w) => w[0])` — jika `fullName` empty string, hasilnya string kosong. Initials jadi empty. |
| Dampak | Bug UI minor — tampilan inisial kosong. |

### 48. **NodeJS.Timeout Type di Browser Code**
| Item | Detail |
|------|--------|
| File | `hooks/wizard/use-wizard-requirements.ts:17`, `use-wizard-fields.ts:17`, `use-wizard-items.ts:18` |
| Penjelasan | Menggunakan tipe `NodeJS.Timeout` yang hanya ada di Node.js. Di browser, tipe sebenarnya adalah `ReturnType<typeof setTimeout>`. |
| Dampak | TypeScript compile error di environment strict. Tidak masalah di runtime. |

### 49. **`useEffect` Sync State ke Props — Anti-pattern**
| Item | Detail |
|------|--------|
| File | `hooks/use-service-wizard.ts:13-15` |
| Penjelasan | `useEffect(() => { setService(initialService); }, [initialService])` — menyebabkan flash data stale. Lebih baik derive atau key-based remount. |
| Dampak | UI flicker ketika props berubah. |

### 50. **Form Data Tidak Disanitize di Wizard**
| Item | Detail |
|------|--------|
| File | `hooks/wizard/use-wizard-requirements.ts:71-76` |
| Penjelasan | FormData dikirim tanpa sanitasi. Contoh: `documentName` bisa berisi script jika direflect di UI. |
| Dampak | Potensi XSS jika data ini dirender tanpa escaping. |

### 51. **Direct Fetch ke API Tanpa Credential Handling**
| Item | Detail |
|------|--------|
| File | `components/forms/new-request-form.tsx:81` |
| Penjelasan | `fetch("/api/requests", ...)` — meskipun same-origin mengirim cookies otomatis, eksplisit lebih aman. |
| Dampak | Rendah untuk same-origin, tapi bisa masalah jika API dipindah. |

### 52. **File Compression Gagal Total Jika Satu File Error**
| Item | Detail |
|------|--------|
| File | `components/forms/edit-request-form.tsx:61-72`, `components/forms/upload-revision-form.tsx:33-46` |
| Penjelasan | `await Promise.all(...)` untuk kompresi file. Satu file gagal, semua gagal. |
| Dampak | Submission batal total hanya karena satu file bermasalah. |

### 53. **Simulasi Progress Bar Palsu**
| Item | Detail |
|------|--------|
| File | `components/forms/request-requirement-upload.tsx:63-67` |
| Penjelasan | Progress bar menggunakan `setInterval` dengan angka tetap, bukan progress aktual upload. |
| Dampak | UX menyesatkan — progress bar tidak akurat. Bisa stuck di 85% padahal sudah selesai. |

### 54. **Preview URL Tidak Di-revoke**
| Item | Detail |
|------|--------|
| File | `components/forms/request-requirement-upload.tsx:96-99` |
| Penjelasan | `URL.createObjectURL(fileToUpload)` dibuat untuk preview tapi tidak di-revoke untuk file yang tetap diupload. |
| Dampak | Memory leak pada upload banyak file. Setiap preview menyimpan blob reference. |

### 55. **Sorted Items Tidak Di-memoize**
| Item | Detail |
|------|--------|
| File | `components/admin/layanan/service-wizard-client.tsx:26-29` |
| Penjelasan | `const sortedItems = [...items].sort(...)` dibuat ulang setiap render. |
| Dampak | Performa menurun untuk daftar item besar. |

### 56. **`revalidatePath` Terlalu Luas**
| Item | Detail |
|------|--------|
| File | `lib/actions/admin/admin-requests.ts:75-77` |
| Penjelasan | Setiap update status memanggil `revalidatePath("/")` dan `revalidatePath("/track")` yang sebenarnya tidak perlu. |
| Dampak | Cache invalidasi berlebihan, performa menurun. |

### 57. **Tidak Ada Pagination untuk Guest Book**
| Item | Detail |
|------|--------|
| File | `app/buku-tamu/page.tsx:8` |
| Penjelasan | `export const revalidate = 0` memaksa render dinamis, tapi query tetap fetch SEMUA baris tanpa pagination. |
| Dampak | Semakin banyak data, semakin lambat halaman. Memory server bisa habis. |

### 58. **Search Tidak Menggunakan FULLTEXT Index**
| Item | Detail |
|------|--------|
| File | `app/api/admin/search/route.ts` dan beberapa query lain |
| Penjelasan | Semua search menggunakan `ilike %query%` yang tidak bisa menggunakan index B-tree. |
| Dampak | Performa search menurun drastis seiring pertumbuhan data. |

### 59. **Inkonsistensi Auth Checking — getUser vs getProfile**
| Item | Detail |
|------|--------|
| File | `lib/auth.ts` vs `lib/services/request-service.ts` |
| Penjelasan | Beberapa kode pakai `getCurrentUser()` (Supabase Auth), lainnya pakai `getCurrentProfile()` (DB Profile). |
| Dampak | Auth checking tidak konsisten. Ada celah di mana user bisa lolos di satu endpoint tapi ditolak di endpoint lain. |

### 60. **Tidak Ada Transaksi untuk `reorderServices`**
| Item | Detail |
|------|--------|
| File | `lib/actions/admin/admin-master.ts` |
| Penjelasan | Reorder items, fields, dan requirements pakai transaction, tapi `reorderServices` tidak. |
| Dampak | Jika reorder gagal di tengah, sebagian data berubah sebagian tidak — inconsistent state. |

### 61. **`serializeBigInt` Tidak Dipakai Konsisten**
| Item | Detail |
|------|--------|
| File | `lib/db/index.ts:17-23` vs seluruh response API |
| Penjelasan | Helper `serializeBigInt` sudah dibuat tapi tidak dipakai di semua response. |
| Dampak | Response API masih ada BigInt yang tidak ter-serialize dengan benar. |

### 62. **`useEffect` Cleanup Revoke Object URLs Terlalu Agresif**
| Item | Detail |
|------|--------|
| File | `components/forms/request-requirement-upload.tsx:30-37` |
| Penjelasan | Cleanup menjalankan revoke semua object URLs saat `requirements` berubah. Jika parent re-render dengan array reference baru (data sama), semua upload ter-reset. |
| Dampak | File upload hilang tanpa sebab. |

### 63. **Meta Tags Tanpa Type Safety**
| Item | Detail |
|------|--------|
| File | `app/janji-temu/page.tsx:4-7` |
| Penjelasan | Metadata didefinisikan sebagai plain object tanpa type annotation. |
| Dampak | TypeScript tidak akan mendeteksi typo pada property metadata. |

### 64. **Quick Menus Filtering Logic Inkonsisten**
| Item | Detail |
|------|--------|
| File | `app/admin/page.tsx:116-121` |
| Penjelasan | Menu `item_layanan` dan `form_layanan` ngecek `allowedMenus.includes("layanan")`, tapi menu lain ngecek `allowedMenus.includes(menu.id)`. |
| Dampak | Jika user punya akses `layanan` tapi tidak punya `item_layanan`, menu item layanan tidak muncul. |

### 65. **`appRoleEnum` Includes `super_admin`**
| Item | Detail |
|------|--------|
| File | `lib/db/schema/enums.ts:10` |
| Penjelasan | Enum `app_role` memiliki `"super_admin"` yang bisa di-assign via UI. Tapi sistem menggunakan hardcoded email untuk super admin. |
| Dampak | User bisa di-set role super_admin via DB tapi tidak punya akses karena email tidak cocok. |

### 66. **Handling `generatedDocuments` Fragile**
| Item | Detail |
|------|--------|
| File | `app/dashboard/pengajuan/[id]/page.tsx:63-65`, `app/admin/pengajuan/[id]/page.tsx:108-112` |
| Penjelasan | Logika "if array, ambil index 0; else treat as object" — fragil, bisa error jika data shape berubah. |
| Dampak | Crash jika data dari database tidak sesuai ekspektasi. |

### 67. **Google Drive Error di-swallow**
| Item | Detail |
|------|--------|
| File | `lib/google-drive.ts:93-95` |
| Penjelasan | `catch` hanya `console.error` dan return `{ error }`. Caller tidak pernah cek return value. |
| Dampak | Backup ke Google Drive gagal tanpa pemberitahuan. User dan admin tidak tahu. |

### 68. **Hanya Client-side Image Compression**
| Item | Detail |
|------|--------|
| File | `lib/image-compression.ts:3` |
| Penjelasan | Fungsi `compressImageToUnder` menggunakan `browser-image-compression` yang hanya jalan di browser/library client. |
| Dampak | Kompresi tidak berfungsi di server (server actions, API routes). |

### 69. **File Extension Validation Bisa Di-bypass**
| Item | Detail |
|------|--------|
| File | `app/api/requests/[id]/documents/route.ts` — `isAllowedExtension` |
| Penjelasan | Validasi hanya cek ekstensi file. File tanpa ekstensi (contoh: `README`) bisa lolos. File dengan double ekstensi (contoh: `virus.pdf.exe`) juga bisa? Tergantung implementasi `.split(".").pop()`. |
| Dampak | Validasi keamanan tidak komprehensif. |

### 70. **`LoginForm` Tidak Terpakai**
| Item | Detail |
|------|--------|
| File | `components/auth/login-form.tsx` (seluruh file) |
| Penjelasan | Komponen `LoginForm` dibuat tapi tidak di-import oleh page mana pun. Semua halaman login menggunakan `LoginFormByRole`. |
| Dampak | Dead code, tambahan bundle size tidak perlu. |

### 71. **`new Date().getFullYear()` Langsung di JSX**
| Item | Detail |
|------|--------|
| File | `components/layout/footer.tsx:160`, `conditional-shell.tsx:38-39`, `home/track-section.tsx:49` |
| Penjelasan | `new Date()` dipanggil langsung di JSX Server Component. Jika di-cache (ISR/CDN), tahun bisa stale. |
| Dampak | Copyright tahun bisa salah jika halaman di-cache lintas tahun. |

### 72. **`any` Types di Banyak Tempat**
| Item | Detail |
|------|--------|
| File | Lebih dari 20 file |
| Penjelasan | Penggunaan `any` secara ekstensif di parameter function, callback, dan state. Contoh: `profile: any` di `lib/auth.ts:82`, `error: any` di catch blocks. |
| Dampak | Hilangnya type safety. Bug yang bisa tertangkap TypeScript jadi lolos ke runtime. |

### 73. **Type Casting `as any` di Response API**
| Item | Detail |
|------|--------|
| File | `app/api/buku-tamu/route.ts`, `app/api/janji-temu/route.ts`, dan lainnya |
| Penjelasan | `return NextResponse.json(...) as any` — digunakan untuk mengakali TypeScript. |
| Dampak | TypeScript tidak bisa memberikan type safety pada response API. |

### 74. **Import `UserService` di Bottom File**
| Item | Detail |
|------|--------|
| File | `lib/actions/auth/register-petugas.ts:93` |
| Penjelasan | Semua import di baris 1-7, tapi `import { UserService }` di baris 93 — setelah kode yang menggunakannya. |
| Dampak | Works karena JavaScript hoisting, tapi melanggar convention dan ESLint `import/first`. |

### 75. **`window.location.href` Instead of `router.push()`**
| Item | Detail |
|------|--------|
| File | `components/auth/login-form-by-role.tsx:142` |
| Penjelasan | `window.location.href = callbackUrl` menyebabkan full page reload, kehilangan state React, lebih lambat. |
| Dampak | UX lebih lambat, state React hilang. |

### 76. **`key={index}` di Beberapa List**
| Item | Detail |
|------|--------|
| File | `components/admin/dashboard/admin-dashboard-metrics.tsx:62`, `components/common/PageBanner.tsx:73` |
| Penjelasan | Menggunakan index array sebagai key React. Jika list berubah (tambah/hapus/reorder), menyebabkan React reconciliation error dan bugs rendering. |
| Dampak | Potensi bugs UI saat data berubah. |

---

## 🟢 MINOR (3 issues) — Code Quality & Best Practices

### 77. **`useDebounce` Hook Mungkin Tidak Dipakai**
| Item | Detail |
|------|--------|
| File | `hooks/use-debounce.ts` |
| Penjelasan | Hook sudah dibuat, perlu dicek apakah benar-benar digunakan atau dead code. |
| Dampak | Dead code jika tidak digunakan. |

### 78. **`revalidate = 0` on Admin Pages**
| Item | Detail |
|------|--------|
| File | `app/admin/page.tsx:34-35` |
| Penjelasan | `export const dynamic = "force-dynamic"` dan `revalidate = 0` pada admin page. Memastikan data selalu fresh tapi menonaktifkan caching. |
| Dampak | Beban server lebih tinggi. |

### 79. **`catch (error: any)` di Banyak Server Actions**
| Item | Detail |
|------|--------|
| File | Hampir semua server action file |
| Penjelasan | Error handling pattern `catch (error: any) { return { error: error.message } }` menyebabkan error internal (stack trace, koneksi DB, dll) bisa bocor ke user. |
| Dampak | Information disclosure — error internal bisa terekspos. |

---

## 📊 RINGKASAN

| Severity | Jumlah | Deskripsi |
|----------|--------|-----------|
| 🔴 Critical | 28 | Keamanan & logika fondasi — harus diperbaiki segera |
| 🟡 Medium | 48 | Fungsionalitas, performa, potensi bug |
| 🟢 Minor | 3 | Code quality, best practices |
| **Total** | **79** | |

### 🔴 Prioritas Perbaikan (Top 10)

1. **Hapus kolom `plainPassword`** — plaintext password di DB dan terekspos di UI
2. **Perbaiki middleware** — buat `middleware.ts` yang berfungsi
3. **Hapus fallback testing key Turnstile** — wajibkan env var di production
4. **Fix cookie mutation di Supabase middleware** — ikuti official pattern
5. **Fix infinite loop di Realtime Sync** — hapus `supabase` dari dependency effect
6. **Fix NaN pagination** — fallback ke 1 jika parseInt gagal
7. **Fix import `SiteHeaderClient`** — pastikan path benar
8. **Add CSRF protection** — semua form dan API rentan
9. **Add rate limiting** — ganti in-memory Map dengan Redis/Upstash
10. **Validasi callback URL** — cegah open redirect

---

*Audit dilakukan pada 27 Mei 2026 menggunakan analisis kode statis. Beberapa issue mungkin memerlukan verifikasi lebih lanjut melalui pengujian runtime.*
