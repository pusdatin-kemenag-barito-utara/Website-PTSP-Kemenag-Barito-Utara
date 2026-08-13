import type { AstroCookies } from "astro";

export interface RequestContext {
  cookies: AstroCookies;
  request: Request;
  url: URL;
  origin: string;
  locals: Record<string, any>;
}

let storage: any = null;
if (typeof window === "undefined") {
  if ((globalThis as any).__ptsp_storage) {
    storage = (globalThis as any).__ptsp_storage;
  } else {
    try {
      const nodeReq = eval("require");
      const { AsyncLocalStorage } = nodeReq("async_hooks");
      storage = new AsyncLocalStorage();
      (globalThis as any).__ptsp_storage = storage;
    } catch (e) {
      // Ignore Node modules in non-Node/Browser environment
    }
  }
}

export function runWithContext<T>(
  ctx: RequestContext,
  fn: () => Promise<T>,
): Promise<T> {
  if (storage) {
    return storage.run(ctx, fn);
  }
  return fn();
}

export function getRequestContext(): RequestContext {
  const ctx = storage ? storage.getStore() : null;
  if (!ctx) {
    throw new Error("RequestContext tidak tersedia di luar request server");
  }
  return ctx;
}

export function tryGetRequestContext(): RequestContext | null {
  if (!storage) {
    try {
      const fs = eval("require")("fs");
      fs.appendFileSync("debug_auth.txt", "[DEBUG auth] storage is NULL in tryGetRequestContext!\n");
    } catch (e) {}
  }
  return storage ? storage.getStore() ?? null : null;
}

const requestMemo = new WeakMap<RequestContext, Map<string, unknown>>();

export function memoizeRequest<T>(
  key: string,
  fn: () => Promise<T>,
): () => Promise<T> {
  return async () => {
    const ctx = tryGetRequestContext();
    if (!ctx) return fn();
    let m = requestMemo.get(ctx);
    if (!m) {
      m = new Map();
      requestMemo.set(ctx, m);
    }
    if (m.has(key)) return m.get(key) as T;
    const val = await fn();
    m.set(key, val);
    return val;
  };
}