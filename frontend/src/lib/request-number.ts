export async function generateRequestNumber(
  serviceName: string,
  year?: number
): Promise<string> {
  const currentYear = year ?? new Date().getFullYear();
  const randomStr = Math.floor(100000 + Math.random() * 900000);
  return `PUB-PTSP-${currentYear}-${randomStr}`;
}

export async function recycleRequestNumber(_requestNumber: string): Promise<void> {
  return;
}
