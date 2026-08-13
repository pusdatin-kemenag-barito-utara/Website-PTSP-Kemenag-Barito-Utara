import { invokeAction } from "@/lib/actions/runtime";

export async function getPublicRequestStatus(...args: any[]) {
  return invokeAction("public/public-track", "getPublicRequestStatus", args);
}

