export function revalidatePath(_path: string, _type?: "page" | "layout" | string) {
  // No-op: seluruh halaman Astro di-render dinamis (on-demand), tidak ada cache yang perlu di-purge.
}

export function revalidateTag(..._tags: string[]) {
  // No-op: lihat revalidatePath
}

export const unstable_cache = <T extends (...args: any[]) => Promise<any>>(
  fn: T,
  _keys?: string[],
  _opts?: { revalidate?: number | false; tags?: string[] },
): ((...args: Parameters<T>) => Promise<Awaited<ReturnType<T>>>) => fn;