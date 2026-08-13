import { invokeAction } from "@/lib/actions/runtime";

export async function checkLeaveAction(...args: any[]) {
  return invokeAction("public/check-leave", "checkLeaveAction", args);
}

