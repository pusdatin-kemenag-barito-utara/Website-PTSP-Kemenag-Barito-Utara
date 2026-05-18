import Link from "next/link";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PageBannerProps {
  title: string;
  description?: string;
  breadcrumb?: BreadcrumbItem[];
  eyebrow?: string;
}

function ChevronRightIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-3.5 w-3.5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

function SparkIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3z" />
    </svg>
  );
}

export default function PageBanner({
  title,
  description,
  breadcrumb = [],
  eyebrow = "Layanan Informasi Publik",
}: PageBannerProps) {
  return (
    <section className="relative isolate overflow-hidden border-b border-white/10 bg-[linear-gradient(135deg,#052033_0%,#0b3b46_52%,#0e5f55_100%)] text-white">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.18),transparent_24%),radial-gradient(circle_at_left,rgba(16,185,129,0.20),transparent_30%),radial-gradient(circle_at_bottom,rgba(255,255,255,0.08),transparent_30%)]" />
      <div className="absolute inset-0 -z-10 opacity-20 bg-[linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:28px_28px]" />

      <div className="w-full px-6 py-10 sm:px-10 md:py-14 lg:px-16 lg:py-16 xl:px-20">
        {breadcrumb.length > 0 ? (
          <nav
            aria-label="Breadcrumb"
            className="mb-5 flex flex-wrap items-center gap-2 text-sm text-white/75"
          >
            {breadcrumb.map((item, index) => {
              const isLast = index === breadcrumb.length - 1;

              return (
                <div
                  key={`${item.label}-${index}`}
                  className="flex items-center gap-2"
                >
                  {index > 0 ? <ChevronRightIcon /> : null}

                  {item.href && !isLast ? (
                    <Link
                      href={item.href}
                      className="rounded-lg px-1 py-0.5 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <span className={isLast ? "font-semibold text-white" : ""}>
                      {item.label}
                    </span>
                  )}
                </div>
              );
            })}
          </nav>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_260px] lg:items-end">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-white/90 backdrop-blur">
              <SparkIcon />
              <span>{eyebrow}</span>
            </div>

            <h1 className="mt-4 text-3xl font-bold leading-[1.12] tracking-tight text-white md:text-5xl lg:text-6xl">
              {title}
            </h1>

            {description ? (
              <p className="mt-4 max-w-3xl text-base leading-7 text-white/80 md:text-lg">
                {description}
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
