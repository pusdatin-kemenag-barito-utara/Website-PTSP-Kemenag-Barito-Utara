import { tryGetRequestContext } from "@/lib/request-context";

export async function headers(): Promise<Headers> {
  const ctx = tryGetRequestContext();
  if (ctx) return ctx.request.headers;
  return new Headers();
}