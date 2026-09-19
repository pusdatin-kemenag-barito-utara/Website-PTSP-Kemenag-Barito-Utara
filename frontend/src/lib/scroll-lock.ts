/**
 * Utility for robust, bulletproof body scroll locking across all platforms
 * (iOS Safari, Android Chrome, mobile webviews, and desktop browsers).
 * Prevents background scrolling and rubber-banding during touch swipes.
 */

let lockCount = 0;
let savedScrollY = 0;
let previousBodyStyle: {
  position: string;
  top: string;
  left: string;
  right: string;
  width: string;
  overflow: string;
  paddingRight: string;
} | null = null;
let previousHtmlOverflow = "";

export function lockBodyScroll() {
  if (typeof window === "undefined" || typeof document === "undefined") return;

  lockCount++;
  if (lockCount === 1) {
    savedScrollY =
      window.scrollY ||
      window.pageYOffset ||
      document.documentElement.scrollTop ||
      0;

    // Calculate scrollbar width to prevent desktop layout shift
    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;

    previousBodyStyle = {
      position: document.body.style.position,
      top: document.body.style.top,
      left: document.body.style.left,
      right: document.body.style.right,
      width: document.body.style.width,
      overflow: document.body.style.overflow,
      paddingRight: document.body.style.paddingRight,
    };
    previousHtmlOverflow = document.documentElement.style.overflow;

    // Lock documentElement & body
    document.documentElement.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.top = `-${savedScrollY}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.width = "100%";
    document.body.style.overflow = "hidden";

    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }
  }
}

export function unlockBodyScroll() {
  if (typeof window === "undefined" || typeof document === "undefined") return;

  lockCount = Math.max(0, lockCount - 1);
  if (lockCount === 0 && previousBodyStyle) {
    const restoreY = savedScrollY;
    document.body.style.position = previousBodyStyle.position;
    document.body.style.top = previousBodyStyle.top;
    document.body.style.left = previousBodyStyle.left;
    document.body.style.right = previousBodyStyle.right;
    document.body.style.width = previousBodyStyle.width;
    document.body.style.overflow = previousBodyStyle.overflow;
    document.body.style.paddingRight = previousBodyStyle.paddingRight;
    document.documentElement.style.overflow = previousHtmlOverflow;

    previousBodyStyle = null;

    // Restore scroll position
    window.scrollTo(0, restoreY);
  }
}
