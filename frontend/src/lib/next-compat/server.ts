export class NextRequest extends Request {
  public nextUrl: URL;
  public cookies: {
    get: (n: string) => string | undefined;
    getAll: (n: string) => string[];
    set: (n: string, v: string) => void;
    delete: (n: string) => void;
  };
  public geo: Record<string, string> | null = null;
  public ip: string | null = null;

  constructor(input: string | URL | Request, init?: RequestInit) {
    super(input, init);
    this.nextUrl = new URL(super.url);
    const headers = new Headers(super.headers);
    this.cookies = {
      get: (n: string) => {
        const cookie = headers.get("cookie");
        if (!cookie) return undefined;
        const match = cookie.split(";").map((c) => c.trim()).find((c) => c.startsWith(`${n}=`));
        return match ? decodeURIComponent(match.slice(n.length + 1)) : undefined;
      },
      getAll: () => [],
      set: () => undefined,
      delete: () => undefined,
    };
  }

  async json<T = unknown>(): Promise<T> {
    return (await super.json()) as T;
  }
}

export class NextResponse extends Response {
  constructor(body?: BodyInit | null, init?: ResponseInit) {
    super(body, init);
  }

  static json<T = unknown>(body: T, init?: ResponseInit): NextResponse {
    return new NextResponse(JSON.stringify(body), {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(init?.headers ? Object.fromEntries(new Headers(init.headers)) : {}),
      },
    });
  }

  static redirect(url: string | URL, init?: number | ResponseInit): NextResponse {
    let status = 307;
    let rest: ResponseInit | undefined;
    if (typeof init === "number") status = init;
    else rest = init;
    return new NextResponse(null, {
      ...rest,
      status,
      headers: {
        Location: url.toString(),
        ...(rest?.headers ? Object.fromEntries(new Headers(rest.headers)) : {}),
      },
    });
  }

  static next(init?: ResponseInit): NextResponse {
    return new NextResponse(null, init);
  }

  get cookies() {
    return {
      get: () => undefined,
      set: () => undefined,
      delete: () => undefined,
    };
  }

  cookiesSet: Array<{ name: string; value: string; options?: Record<string, unknown> }> = [];

  setCookie(name: string, value: string, options?: Record<string, unknown>) {
    this.cookiesSet.push({ name, value, options });
  }
}