# PTSP Kemenag Barito Utara — Agent Guide

## Commands
| Command | What |
|---------|------|
| `npm run dev` | next dev (turbopack) |
| `npm run build` | next build |
| `npm run typecheck` | tsc --noEmit (run before completing any task) |
| `npm run db:push` | drizzle-kit push (apply schema to Supabase) |
| `npm run db:generate` | drizzle-kit generate (create migration files) |

## Architecture

- **Next.js 16 App Router** + React 19, TypeScript, Tailwind CSS v4
- **Supabase** (Auth, PostgreSQL, Storage)
- **Drizzle ORM** with `node-postgres` Pool — schema in `lib/db/schema/` (11 files: auth, appointments, feedbacks, guest-book, logs, notifications, requests, services, enums, relations). Pool on 6543, direct on 5432.
- **Supabase clients**: `lib/supabase/client.ts` (browser), `server.ts` (server component), `admin.ts` (service_role key, bypasses RLS), `middleware.ts` (session refresh helper)
- **Edge middleware**: `proxy.ts` (named export `proxy`) — handles CSRF, rate limiting, session refresh via `updateSession`, security headers. Do NOT rename or delete.
- **Server actions** in `lib/actions/` (admin/, auth/, public/, system/, user/)
- **Auth helpers** in `lib/auth.ts`: `getCurrentUser`, `getCurrentProfile`, `requireAuth`, `requireAdmin`, `hasPermission`, `requirePermission`
- **Roles**: `lib/constants.ts` defines `SUPER_ADMIN_EMAIL` (hardcoded), `ADMIN_ROLES` (12 values), `getRoleLabel()`, `isSuperAdmin()`, `isAdminRole()`

## Auth & Access Control

- Super admin is determined by **email**, not DB role. Only `SUPER_ADMIN_EMAIL` in `lib/constants.ts` has full bypass.
- DB enum `app_role` has 5 values: `user`, `admin_ptsp`, `kepala_kantor`, `kasubag_tu`, `super_admin`. UI shows 12+ roles for registration (extended roles not yet in DB enum).
- `requireAdmin()` checks both `isAdminRole(role)` and `isSuperAdmin(email)`.
- New admin accounts require `isVerified: true` before they can access admin panel.
- **Sign-out**: use `signOutAction()` from `lib/actions/auth/sign-out.ts` (server-side). Never do `supabase.auth.signOut()` from client + `window.location.href`.

## Storage

- Avatar bucket: `avatars` (public, 2MB limit, jpg/png/webp). Upload via `createAdminClient()` (service_role, bypasses RLS).
- Document buckets: `request-documents`, `generated-documents`
- Role restriction for avatar upload: only `super_admin`, `admin_ptsp`, `kepala_kantor`, `kasubag_tu`

## Rules for Agents

1. **NEVER** run `npm run typecheck` automatically on your own. You must ask for user confirmation first and let the user run it. 0 errors required.
2. Schema changes → run `npm run db:push`. Use SQL migrations for columns outside Drizzle schema (e.g., `ALTER TABLE profiles ADD COLUMN ...`).
3. Never write to DB from client code. Use server actions or API routes.
4. For Supabase Storage operations that hit RLS, use `createAdminClient()` (service_role key) on the server.
5. `proxy.ts` is the edge middleware — named export `proxy` + `config` matcher. Don't rename to `middleware.ts` unless user confirms.
6. CSP headers in `next.config.ts` are extensive. Update them when adding external resources.
7. Server action body limit: 50mb (`next.config.ts`).
8. `sonner` for toasts, `react-easy-crop` for avatar crop, `lucide-react` for icons.
9. Cloudflare Turnstile for bot protection on login/register forms.
10. Hard navigation with `window.location.href` (turbopack disables turbolinks-equivalent).
