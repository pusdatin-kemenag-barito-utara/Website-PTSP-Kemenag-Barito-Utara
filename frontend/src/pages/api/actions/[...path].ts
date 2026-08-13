import type { APIRoute } from "astro";
import { runWithContext } from "@/lib/request-context";
import { RedirectSignal, NotFoundSignal } from "@/lib/next-compat/navigation";
import * as modAdminFields from "@/actions-handlers/admin/admin-fields";
import * as modAdminItems from "@/actions-handlers/admin/admin-items";
import * as modAdminMaster from "@/actions-handlers/admin/admin-master";
import * as modAdminProfile from "@/actions-handlers/admin/admin-profile";
import * as modAdminRequests from "@/actions-handlers/admin/admin-requests";
import * as modAdminRequirements from "@/actions-handlers/admin/admin-requirements";
import * as modAdminUsers from "@/actions-handlers/admin/admin-users";
import * as modAdminVisitations from "@/actions-handlers/admin/admin-visitations";
import * as modDataCuti from "@/actions-handlers/admin/data-cuti";
import * as modKepegawaian from "@/actions-handlers/admin/kepegawaian";
import * as modMasterOptions from "@/actions-handlers/admin/master-options-actions";
import * as modPejabat from "@/actions-handlers/admin/pejabat-actions";
import * as modAuth from "@/actions-handlers/auth/auth";
import * as modCompleteProfile from "@/actions-handlers/auth/complete-profile";
import * as modLoginAudit from "@/actions-handlers/auth/login-audit";
import * as modLoginHelper from "@/actions-handlers/auth/login-helper";
import * as modLoginLockout from "@/actions-handlers/auth/login-lockout";
import * as modRegisterPemohon from "@/actions-handlers/auth/register-pemohon";
import * as modRegisterPetugas from "@/actions-handlers/auth/register-petugas";
import * as modResetPassword from "@/actions-handlers/auth/reset-password";
import * as modSignOut from "@/actions-handlers/auth/sign-out";
import * as modCutiApproval from "@/actions-handlers/pegawai/cuti-approval";
import * as modCuti from "@/actions-handlers/pegawai/cuti";
import * as modELk from "@/actions-handlers/pegawai/e-lk";
import * as modProfile from "@/actions-handlers/pegawai/profile";
import * as modRequests from "@/actions-handlers/pegawai/requests";
import * as modCheckLeave from "@/actions-handlers/public/check-leave";
import * as modPublicTrack from "@/actions-handlers/public/public-track";
import * as modCleanup from "@/actions-handlers/system/cleanup";
import * as modExport from "@/actions-handlers/system/export";
import * as modMaintenance from "@/actions-handlers/system/maintenance";
import * as modUser from "@/actions-handlers/user/user";

const MODULES: Record<string, Record<string, unknown>> = {
  "admin/admin-fields": modAdminFields,
  "admin/admin-items": modAdminItems,
  "admin/admin-master": modAdminMaster,
  "admin/admin-profile": modAdminProfile,
  "admin/admin-requests": modAdminRequests,
  "admin/admin-requirements": modAdminRequirements,
  "admin/admin-users": modAdminUsers,
  "admin/admin-visitations": modAdminVisitations,
  "admin/data-cuti": modDataCuti,
  "admin/kepegawaian": modKepegawaian,
  "admin/master-options-actions": modMasterOptions,
  "admin/pejabat-actions": modPejabat,
  "auth/auth": modAuth,
  "auth/complete-profile": modCompleteProfile,
  "auth/login-audit": modLoginAudit,
  "auth/login-helper": modLoginHelper,
  "auth/login-lockout": modLoginLockout,
  "auth/register-pemohon": modRegisterPemohon,
  "auth/register-petugas": modRegisterPetugas,
  "auth/reset-password": modResetPassword,
  "auth/sign-out": modSignOut,
  "pegawai/cuti-approval": modCutiApproval,
  "pegawai/cuti": modCuti,
  "pegawai/e-lk": modELk,
  "pegawai/profile": modProfile,
  "pegawai/requests": modRequests,
  "public/check-leave": modCheckLeave,
  "public/public-track": modPublicTrack,
  "system/cleanup": modCleanup,
  "system/export": modExport,
  "system/maintenance": modMaintenance,
  "user/user": modUser,
};

const META_KEYS = ["__fn", "__plainArgs"];

export const POST: APIRoute = async (ctx) => {
  const { request, params, cookies, url, locals } = ctx;
  const segs = Array.isArray(params.path) ? params.path : params.path ? [params.path] : [];
  const key = segs.join("/");
  const mod = MODULES[key];
  if (!mod) {
    return Response.json({ error: "Aksi tidak ditemukan." }, { status: 404 });
  }

  const contentType = request.headers.get("content-type") || "";
  let fnName = "";
  let args: unknown[] = [];

  if (contentType.includes("multipart/form-data")) {
    const form = await request.formData();
    fnName = (form.get("__fn") as string) || "";
    let plain: unknown[] = [];
    try {
      plain = JSON.parse((form.get("__plainArgs") as string) || "[]");
    } catch {
      plain = [];
    }
    const fd = new FormData();
    form.forEach((value, name) => {
      if (!META_KEYS.includes(name)) fd.append(name, value);
    });
    args = [...plain, fd];
  } else {
    const body = await request.json().catch(() => ({}));
    fnName = (body as any)?.fn || "";
    args = Array.isArray((body as any)?.args) ? (body as any).args : [];
  }

  const handler = mod[fnName];
  if (typeof handler !== "function") {
    return Response.json(
      { error: `Fungsi ${fnName} tidak ditemukan.` },
      { status: 404 },
    );
  }

  try {
    const result = await runWithContext(
      {
        cookies,
        request,
        url,
        origin: url.origin,
        locals,
      },
      async () => {
        return await (handler as (...a: unknown[]) => unknown)(...args, { cookies, request, url, locals });
      },
    );
    return Response.json({ data: result });
  } catch (e) {
    if (e instanceof RedirectSignal) {
      return Response.json({ __redirect: e.path });
    }
    if (e instanceof NotFoundSignal) {
      return Response.json({ __notFound: true });
    }
    const message = e instanceof Error ? e.message : "Terjadi kesalahan di server.";
    return Response.json({ error: message }, { status: 400 });
  }
};