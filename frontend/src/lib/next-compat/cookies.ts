import { tryGetRequestContext } from "@/lib/request-context";

export async function cookies() {
  const ctx = tryGetRequestContext();
  if (!ctx) {
    throw new Error("cookies() hanya bisa dipanggil di dalam request (middleware/pages/endpoints/actions)");
  }
  return ctx.cookies;
}