import { useCallback, useMemo, useState, useEffect } from "react";

export class RedirectSignal extends Error {
  constructor(public path: string) {
    super(`Redirect ke ${path}`);
    this.name = "RedirectSignal";
  }
}

export class NotFoundSignal extends Error {
  constructor() {
    super("Halaman tidak ditemukan");
    this.name = "NotFoundSignal";
  }
}

export function redirect(path: string, _status?: number): never {
  throw new RedirectSignal(path);
}

export function notFound(): never {
  throw new NotFoundSignal();
}

export function permanentRedirect(path: string): never {
  throw new RedirectSignal(path);
}

export interface RouterInstance {
  back: () => void;
  forward: () => void;
  refresh: () => void;
  push: (href: string, options?: any) => void;
  replace: (href: string, options?: any) => void;
  prefetch: (href: string, options?: any) => void;
  pathname: string | null;
  query: Record<string, string | string[] | undefined>;
}

export function useRouter(): RouterInstance {
  const push = useCallback((href: string) => {
    if (typeof window !== "undefined") window.location.assign(href);
  }, []);
  const replace = useCallback((href: string) => {
    if (typeof window !== "undefined") window.location.replace(href);
  }, []);
  const refresh = useCallback(() => {
    if (typeof window !== "undefined") window.location.reload();
  }, []);
  const back = useCallback(() => {
    if (typeof window !== "undefined") window.history.back();
  }, []);
  const forward = useCallback(() => {
    if (typeof window !== "undefined") window.history.forward();
  }, []);
  const prefetch = useCallback(() => {}, []);

  return useMemo(
    () => ({
      back,
      forward,
      refresh,
      push,
      replace,
      prefetch,
      pathname:
        typeof window !== "undefined" ? window.location.pathname : null,
      query: {},
    }),
    [back, forward, refresh, push, replace, prefetch],
  );
}

export function usePathname(): string {
  const [pathname, setPathname] = useState("");
  useEffect(() => {
    setPathname(window.location.pathname);
  }, []);
  return pathname;
}

export function useSearchParams(): URLSearchParams {
  const [params, setParams] = useState<URLSearchParams>(
    () => new URLSearchParams(),
  );
  useEffect(() => {
    setParams(new URLSearchParams(window.location.search));
  }, []);
  return params;
}

export function useParams<
  T extends Record<string, string | undefined> = Record<string, string>,
>(): T {
  const [params, setParams] = useState<T>({} as T);
  useEffect(() => {
    const segments = window.location.pathname.split("/").filter(Boolean);
    const obj: Record<string, string> = {};
    segments.forEach((seg, i) => {
      if (seg.startsWith("[") && seg.endsWith("]")) {
        obj[seg.slice(1, -1)] = segments[i];
      }
      if (i > 0 && segments[i - 1].startsWith("[") && segments[i - 1].endsWith("]")) {
        obj[segments[i - 1].slice(1, -1)] = seg;
      }
    });
    setParams(obj as T);
  }, []);
  return params;
}

export function useSelectedLayoutSegment(): string | null {
  const pathname = usePathname();
  return pathname ? pathname.split("/").filter(Boolean)[0] ?? null : null;
}