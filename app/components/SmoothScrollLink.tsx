"use client";

import type { AnchorHTMLAttributes, MouseEvent } from "react";

type Props = AnchorHTMLAttributes<HTMLAnchorElement> & { href: `#${string}` };

// Scoped to just these nav/CTA links rather than a global `scroll-smooth` on
// <html> — that global setting also animates incidental scroll adjustments
// (e.g. the page shrinking when the Gallery drawer collapses), which reads
// as the page unexpectedly scrolling into the next section.
export default function SmoothScrollLink({ href, onClick, children, ...rest }: Props) {
  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    const target = document.getElementById(href.slice(1));
    if (target) {
      event.preventDefault();
      target.scrollIntoView({ behavior: "smooth" });
      history.pushState(null, "", href);
    }
    onClick?.(event);
  }

  return (
    <a href={href} onClick={handleClick} {...rest}>
      {children}
    </a>
  );
}
