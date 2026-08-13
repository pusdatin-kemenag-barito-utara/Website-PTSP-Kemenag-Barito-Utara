# PTSP Kemenag Barito Utara — Agent Guide

## Gambaran Umum Proyek

Aplikasi PTSP (Pelayanan Terpadu Satu Pintu) Kemenag Barito Utara adalah sistem pelayanan publik digital berbasis web yang terdiri dari dua komponen terpisah:

1. **Frontend** — Astro v7 (berjalan di port `4321` atau `3000`)
2. **Backend** — Golang Fiber REST API (berjalan di port `8080`)

Database PostgreSQL dikelola sepenuhnya oleh Supabase (cloud). **Tidak ada ORM** — seluruh query ditulis native SQL langsung via `pgx/v5`.

---

## Struktur Monorepo

```
ptsp-kemenag/
├── frontend/          # Astro App (v7, file-based routing)
│   ├── src/
│   │   ├── pages/     # Routes & Pages (.astro atau .tsx)
│   │   ├── components/# UI Components
│   ├── lib/
│   │   ├── actions/   # Server Actions (admin/, auth/, pegawai/, public/, system/, user/)
│   │   ├── api.ts     # fetchAPI() — HTTP client ke backend Golang
│   │   ├── auth.ts    # Auth helpers (requireAuth, requireAdmin, requirePermission, dll)
│   │   ├── constants.ts
│   │   ├── audit.ts
│   │   ├── supabase/  # Supabase clients (client.ts, server.ts, admin.ts, middleware.ts)
│   │   └── utils.ts
│   └── proxy.ts       # Edge Middleware (CSRF, rate limit, session refresh, CSP headers)
│
└── backend/           # Golang Fiber REST API
    ├── main.go
    └── internal/
        ├── config/        # Env config loader
        ├── database/      # pgxpool setup
        ├── handler/       # HTTP handlers + router.go
        ├── middleware/     # Fiber middleware (CORS, logger, compress)
        ├── models/        # Struct models (request/response)
        ├── repository/    # Native SQL queries (pgx/v5)
        └── service/       # Business logic layer
```

---

## Commands

| Command             | Keterangan                                           |
| ------------------- | ---------------------------------------------------- |
| `npm run dev`       | Jalankan frontend (Astro) di port 3000 / 4321        |
| `npm run build`     | Build produksi Astro                                 |
| `npm run typecheck` | `tsc --noEmit` — jalankan sebelum selesai task       |
| `air` / `go run .`  | Jalankan backend Golang (dari folder `backend/`)     |
| `go build ./...`    | Build & verifikasi backend Golang                    |

> **CRITICAL**: JANGAN jalankan command apapun sendiri. Minta user untuk menjalankannya di terminal.

---

## Arsitektur Frontend (Astro)

- **Framework**: Astro v7, React 19, TypeScript, Tailwind CSS v4
- **Routing**: File-based routing di `src/pages/`
- **Tidak ada Drizzle ORM** — frontend TIDAK boleh terhubung langsung ke PostgreSQL
- **Semua data fetching** dilakukan via `fetchAPI()` dari `lib/api.ts` yang memanggil Backend Golang
- **Auth**: Supabase Auth (JWT). Session dikelola oleh `proxy.ts` edge middleware via `updateSession`
- **Supabase clients**:
  - `lib/supabase/client.ts` → browser client
  - `lib/supabase/server.ts` → server component client
  - `lib/supabase/admin.ts` → service_role key, bypass RLS (hanya untuk storage upload)
  - `lib/supabase/middleware.ts` → session refresh helper
- **Auth helpers** (`lib/auth.ts`): `getCurrentUser`, `getCurrentProfile`, `requireAuth`, `requireAdmin`, `hasPermission`, `requirePermission`
- **Roles** (`lib/constants.ts`): `SUPER_ADMIN_EMAIL` (hardcoded), `ADMIN_ROLES`, `getRoleLabel()`, `isSuperAdmin()`, `isAdminRole()`
- **Edge Middleware**: `proxy.ts` (named export `proxy` + `config` matcher) — JANGAN rename ke `middleware.ts`
- **Navigasi**: Gunakan tag `<a>` biasa atau `window.location.href` untuk navigasi antar halaman Astro. Komponen `<ClientRouter />` digunakan untuk view transitions.

### Server Actions (`lib/actions/`)

Semua server actions hanya boleh:
1. Memanggil `fetchAPI()` ke backend Golang
2. Memanggil Supabase Auth via `createAdminClient()` (untuk operasi auth seperti update password)
3. Memanggil Supabase Storage via `createAdminClient()` (untuk upload file/avatar)
4. **TIDAK BOLEH** import `@/lib/db`, `@/lib/db/schema`, atau paket Drizzle apapun

---

## Arsitektur Backend (Golang)

- **Framework**: Fiber v2 (HTTP), berjalan di port `8080`
- **Database**: PostgreSQL via `pgx/v5` connection pool (`pgxpool`)
- **Schema database**: `kemenag_ptsp` — **selalu gunakan prefix schema** di setiap query SQL
- **Hot reload**: `air` (`.air.toml` di root backend)
- **Compression**: Fiber `compress` middleware aktif (Gzip/Brotli)
- **CORS**: dikonfigurasi di middleware untuk menerima request dari frontend

### Clean Architecture (4 Layer)

```
Handler → Service → Repository → Database (pgx)
```

| Layer      | Folder          | Tanggung Jawab                              |
| ---------- | --------------- | ------------------------------------------- |
| Handler    | `internal/handler/`    | Parse request, validasi input, return JSON |
| Service    | `internal/service/`    | Business logic, caching in-memory          |
| Repository | `internal/repository/` | Query SQL native (pgx/v5)                  |
| Models     | `internal/models/`     | Struct Go (request, response, entity)      |

### API Routes (base: `/api` dan `/api/v1`)

| Method | Endpoint                            | Keterangan                     |
| ------ | ----------------------------------- | ------------------------------ |
| GET    | `/api/health`                       | Health check                   |
| GET    | `/api/services`                     | Daftar semua layanan           |
| GET    | `/api/services/:slug`               | Detail layanan by slug         |
| GET    | `/api/master-options`               | Master data dropdown           |
| GET    | `/api/guest-book`                   | Daftar buku tamu               |
| POST   | `/api/guest-book`                   | Tambah buku tamu               |
| GET    | `/api/appointments`                 | Daftar janji temu              |
| POST   | `/api/appointments`                 | Buat janji temu                |
| GET    | `/api/requests/track/:number`       | Lacak status permohonan        |
| GET    | `/api/pegawai/cuti`                 | Cek data cuti pegawai by NIP   |
| POST   | `/api/pegawai/cuti`                 | Buat pengajuan cuti            |
| GET    | `/api/admin/...`                    | Semua endpoint admin           |

### Query SQL — Aturan Wajib

1. **Selalu gunakan prefix schema** `kemenag_ptsp.` pada setiap nama tabel, contoh:
   ```sql
   -- BENAR
   SELECT * FROM kemenag_ptsp.ptsp_data_cuti_pegawai WHERE nip = $1
   -- SALAH
   SELECT * FROM ptsp_data_cuti_pegawai WHERE nip = $1
   ```
2. Gunakan `$1, $2, ...` untuk parameterized query (bukan format string)
3. Selalu `defer rows.Close()` setelah `Query()`

---

## Auth & Access Control

- Super admin ditentukan oleh **email**, bukan DB role → `SUPER_ADMIN_EMAIL` di `lib/constants.ts`
- DB enum `app_role`: `user`, `admin_ptsp`, `kepala_kantor`, `kasubag_tu`, `super_admin`
- `requireAdmin()` memvalidasi `isAdminRole(role)` ATAU `isSuperAdmin(email)`
- Akun admin baru harus `isVerified: true` sebelum bisa akses panel admin
- **Sign-out**: gunakan `signOutAction()` dari `lib/actions/auth/sign-out.ts` (server-side)
  - JANGAN gunakan `supabase.auth.signOut()` dari client

---

## Storage (Supabase)

- Bucket avatar: `avatars` (publik, max 2MB, format: jpg/png/webp)
- Upload avatar: wajib via `createAdminClient()` (service_role, bypass RLS)
- Bucket dokumen: `request-documents`, `generated-documents`
- Akses upload avatar dibatasi untuk role: `super_admin`, `admin_ptsp`, `kepala_kantor`, `kasubag_tu`

---

## Hal yang DILARANG KERAS

1. **JANGAN** import `@/lib/db`, `drizzle-orm`, atau apapun dari `lib/db/schema` di frontend
2. **JANGAN** query PostgreSQL langsung dari komponen Astro/React di frontend
3. **JANGAN** jalankan command terminal sendiri (npm run dev, go build, dll) — minta user
4. **JANGAN** rename `proxy.ts` atau export `proxy`-nya
5. **JANGAN** query DB dari client-side code — gunakan server actions atau API routes
6. **JANGAN** lupa schema prefix `kemenag_ptsp.` di setiap query SQL backend Golang
7. **JANGAN** hapus atau modifikasi `proxy.ts` — ini adalah edge middleware utama

---

## Library & Tools Penting

| Library               | Kegunaan                                      |
| --------------------- | --------------------------------------------- |
| `sonner`              | Toast notifications (frontend)                |
| `react-easy-crop`     | Avatar cropping (frontend)                    |
| `lucide-react`        | Icon library (frontend)                       |
| `Cloudflare Turnstile`| Bot protection login/register form            |
| `fiber/v2`            | HTTP framework (backend)                      |
| `pgx/v5`              | PostgreSQL driver (backend, tanpa ORM)         |
| `air`                 | Hot reload untuk backend Golang               |

---

## Alur Penambahan Fitur Baru

### Frontend (Astro)
1. Buat/edit page di `frontend/src/pages/`
2. Panggil API Golang via `fetchAPI()` dari `frontend/lib/api.ts` atau endpoint yang sesuai
3. Gunakan `requirePermission()` atau `requireAdmin()` untuk proteksi halaman admin
4. Gunakan `revalidatePath()` setelah mutasi data

### Backend (Golang)
1. Tambah struct model di `internal/models/`
2. Tambah method query di `internal/repository/` (gunakan prefix schema `kemenag_ptsp.`)
3. Tambah business logic di `internal/service/`
4. Tambah handler di `internal/handler/`
5. Daftarkan route baru di `internal/handler/router.go`
6. Minta user jalankan `go build ./...` untuk verifikasi

### Perubahan Skema Database
- Gunakan **SQL migration manual** via Supabase SQL editor atau `supabase-utama-vps` MCP
- **TIDAK ADA** `drizzle-kit push` atau `drizzle-kit generate` — Drizzle sudah dihapus sepenuhnya
