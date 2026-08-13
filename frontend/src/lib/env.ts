type EnvLike = Record<string, string | undefined>;

function readEnv(name: string): string | undefined {
  const meta = (import.meta as any).env as EnvLike | undefined;
  const fromMeta = meta?.[name];
  if (fromMeta) return fromMeta;
  return process.env[name];
}

export function getEnv(name: string) {
  const value = readEnv(name);
  if (!value) {
    throw new Error(`Environment variable ${name} belum diisi`);
  }
  return value;
}

export function getPublicEnv(name: string): string {
  return readEnv(name) ?? "";
}

export const isServer = typeof window === "undefined";