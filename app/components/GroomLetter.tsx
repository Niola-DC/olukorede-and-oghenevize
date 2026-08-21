"use client";

import { useEffect, useState } from "react";
import Reveal from "./Reveal";

const PREVIEW =
  "I didn’t really know if crying on my wedding day was going to be my thing…";

const LETTER_PARAGRAPHS = [
  "I didn’t really know if crying on my wedding day was going to be my thing. But on Thursday, after I recited my vows and saw you tearing up, I instantly became emotional and started tearing up too.",
  "I didn’t want to suppress it or act like a hard guy. I just wanted to freely express what I was feeling. I’ve looked forward to this day for so long—the day I finally become your husband.",
  "The moment was beautiful. I just had to let the joyful tears out.",
];

// Kept out of the initial render on purpose: the full letter only exists
// inside the modal, so a guest who never clicks "Read his letter" never
// pays for it — Our Story stays a scan, not a read.
export default function GroomLetter() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  return (
    <>
      <Reveal direction="up" className="mx-auto mt-16 max-w-md text-center md:mt-20">
        <div aria-hidden="true" className="mx-auto mb-7 flex flex-col items-center">
          <span className="h-10 w-px bg-line" />
          <span className="my-2 h-1.5 w-1.5 rounded-full bg-gold" />
          <p className="eyebrow">Wedding Day</p>
          <svg width="46" height="30" viewBox="0 0 46 30" fill="none" className="mt-2 text-tan">
            <path
              d="M23 0C23 13 3 9 3 22C3 25.5 6.5 28.5 10.5 29"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </div>

        <button
          type="button"
          onClick={() => setOpen(true)}
          className="relative w-full overflow-hidden border border-ink bg-cream-deep px-7 py-9 text-left shadow-[0_10px_28px_rgba(28,26,23,0.12)] transition-transform duration-300 hover:-translate-y-0.5 sm:px-10"
        >
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(169,130,90,0.1),transparent_65%)]"
          />
          <p className="eyebrow relative mb-3 text-center">A Note From the Groom</p>
          <p className="relative text-center font-display text-lg italic leading-snug text-ink/85 sm:text-xl">
            &ldquo;{PREVIEW}&rdquo;
          </p>
          <span className="relative mt-5 flex items-center justify-center gap-2 text-xs uppercase tracking-[0.22em] text-tan-deep">
            Read his letter <span aria-hidden="true">&rarr;</span>
          </span>
        </button>
      </Reveal>

      <Reveal direction="up" className="mx-auto mt-14 max-w-md text-center md:mt-16">
        <p className="font-display text-xl italic leading-snug text-ink/85 sm:text-2xl">
          &ldquo;The moment was beautiful. I just had to let the joyful tears
          out.&rdquo;
        </p>
        <p className="eyebrow mt-3">
          &mdash; Olukorede, to his bride <span aria-hidden="true">❤️</span>
        </p>
      </Reveal>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/75 px-4 py-10 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="A note from the groom"
            onClick={(e) => e.stopPropagation()}
            className="relative max-h-full w-full max-w-lg overflow-y-auto border border-ink bg-cream-deep px-7 py-10 shadow-[0_24px_70px_rgba(0,0,0,0.4)] sm:px-12 sm:py-14"
          >
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(169,130,90,0.12),transparent_60%)]"
            />
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close letter"
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center border border-ink/25 text-ink/60 transition-colors hover:border-ink hover:text-ink"
            >
              &#10005;
            </button>

            <p className="eyebrow relative mb-7 text-center">A Note From the Groom</p>
            <div className="relative space-y-4 font-display text-base italic leading-relaxed text-ink/85 sm:text-lg">
              <p>My love,</p>
              {LETTER_PARAGRAPHS.map((paragraph, i) => (
                <p key={i}>
                  {paragraph}
                  {i === LETTER_PARAGRAPHS.length - 1 ? (
                    <span aria-hidden="true"> ❤️</span>
                  ) : null}
                </p>
              ))}
            </div>
            <p className="relative mt-7 text-right font-display text-lg italic text-ink/85">
              &mdash; Olukorede
            </p>
          </div>
        </div>
      )}
    </>
  );
}
