import { forwardRef, type AnchorHTMLAttributes, type ReactNode } from "react";

export interface LinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> {
  href: string;
  prefetch?: boolean | null;
  replace?: boolean;
  scroll?: boolean;
  children?: ReactNode;
  legacyBehavior?: boolean;
}

export const Link = forwardRef<HTMLAnchorElement, LinkProps>(function Link(
  { href, prefetch, replace, scroll, children, onClick, target, ...rest },
  ref,
) {
  void prefetch;
  void scroll;
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e as any);
    if (e.defaultPrevented) return;
    if (target === "_blank") return;
    if (href === "#") {
      e.preventDefault();
      return;
    }
    // Biarkan browser default behavior berjalan agar Astro ViewTransitions 
    // bisa mencegat event ini dan melakukan navigasi SPA yang sangat cepat!
  };
  return (
    <a
      ref={ref}
      href={href}
      target={target}
      rel={target === "_blank" ? "noopener noreferrer" : undefined}
      onClick={handleClick}
      data-astro-history={replace ? "replace" : undefined}
      {...rest}
    >
      {children}
    </a>
  );
});

export default Link;