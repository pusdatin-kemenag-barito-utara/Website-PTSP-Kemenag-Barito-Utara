import { invokeAction } from "@/lib/actions/runtime";

export async function getEmailByPhoneAction(...args: any[]) {
  return invokeAction("auth/login-helper", "getEmailByPhoneAction", args);
}

export async function verifyTurnstileAction(...args: any[]) {
  return invokeAction("auth/login-helper", "verifyTurnstileAction", args);
}

export async function handlePegawaiLoginAction(...args: any[]) {
  return invokeAction("auth/login-helper", "handlePegawaiLoginAction", args);
}

