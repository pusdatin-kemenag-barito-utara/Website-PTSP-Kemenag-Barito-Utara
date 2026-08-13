import { tryGetRequestContext } from "@/lib/request-context";

export interface ActionResultEnvelope {
  data?: unknown;
  error?: string;
  __redirect?: string;
  __notFound?: boolean;
}

function getOrigin(): string {
  if (typeof window !== "undefined") return window.location.origin;
  const ctx = tryGetRequestContext();
  if (ctx) return ctx.url.origin;
  return "";
}

function handleEnvelope<T>(env: ActionResultEnvelope, res: Response): T {
  if (env.__redirect) {
    if (typeof window !== "undefined") window.location.href = env.__redirect;
    return undefined as T;
  }
  if (env.__notFound) {
    if (typeof window !== "undefined") window.location.href = "/404";
    return undefined as T;
  }
  if (!res.ok || env.error) {
    throw new Error(env.error || "Gagal menjalankan aksi di server.");
  }
  return env.data as T;
}

export async function invokeAction<T = any>(
  path: string,
  fn: string,
  args: unknown[],
): Promise<T> {
  const origin = getOrigin();
  if (!origin) {
    throw new Error("Aksi hanya bisa dijalankan di dalam konteks aplikasi.");
  }

  const hasFormData = args.some((a) => a instanceof FormData);

  if (hasFormData) {
    const form = args.find((a) => a instanceof FormData) as FormData;
    const plainArgs = args.filter((a) => !(a instanceof FormData));
    const body = new FormData();
    body.append("__fn", fn);
    body.append("__plainArgs", JSON.stringify(plainArgs));
    form.forEach((value, key) => body.append(key, value));

    const headers: Record<string, string> = {};
    if (typeof document !== "undefined") {
      const match = document.cookie.split("; ").find((row) => row.startsWith("ptsp-auth-access-token="));
      if (match) {
        headers["Authorization"] = `Bearer ${decodeURIComponent(match.split("=")[1] ?? "")}`;
      }
    }

    const res = await fetch(`${origin}/api/actions/${path}`, {
      method: "POST",
      credentials: "include",
      headers,
      body,
    });
    const env = (await res.json().catch(() => ({}))) as ActionResultEnvelope;
    return handleEnvelope<T>(env, res);
  }

  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (typeof document !== "undefined") {
    const match = document.cookie.split("; ").find((row) => row.startsWith("ptsp-auth-access-token="));
    if (match) {
      headers["Authorization"] = `Bearer ${decodeURIComponent(match.split("=")[1] ?? "")}`;
    }
  }

  const res = await fetch(`${origin}/api/actions/${path}`, {
    method: "POST",
    credentials: "include",
    headers,
    body: JSON.stringify({ fn, args }),
  });
  const env = (await res.json().catch(() => ({}))) as ActionResultEnvelope;
  return handleEnvelope<T>(env, res);
}