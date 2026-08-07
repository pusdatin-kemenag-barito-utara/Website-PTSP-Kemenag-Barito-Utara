export function getEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Environment variable ${name} belum diisi`);
  }
  return value;
}
