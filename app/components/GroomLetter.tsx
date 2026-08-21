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

// Two deliberately mismatched deckle-edge silhouettes (fixed points, not
// runtime randomness — this renders on the server, so anything seeded from
// Math.random() would mismatch on hydration) for a torn-parchment look: the
// front sheet is the readable card, the back sheet is a second scrap peeking
// out from behind it, like the letter was torn from a larger page.
const FRONT_TORN_CLIP =
  "polygon(0% 2.51%,8.33% 0.06%,16.67% 0.69%,25.00% 3.34%,33.33% 1.65%,41.67% 3.49%,50.00% 0.20%,58.33% 0.52%,66.67% 0.06%,75.00% 0.13%,83.33% 1.86%,91.67% 0.82%,100% 3.11%,99.01% 8.33%,99.26% 16.67%,98.96% 25.00%,99.63% 33.33%,97.61% 41.67%,99.96% 50.00%,98.29% 58.33%,99.33% 66.67%,96.55% 75.00%,99.90% 83.33%,99.80% 91.67%,99.29% 100%,91.67% 99.54%,83.33% 97.41%,75.00% 98.12%,66.67% 98.97%,58.33% 99.98%,50.00% 98.98%,41.67% 100.00%,33.33% 98.41%,25.00% 99.64%,16.67% 99.43%,8.33% 99.57%,0% 97.15%,0.81% 91.67%,0.55% 83.33%,2.03% 75.00%,2.14% 66.67%,3.56% 58.33%,0.52% 50.00%,3.55% 41.67%,3.76% 33.33%,3.02% 25.00%,0.64% 16.67%,2.09% 8.33%)";
const BACK_TORN_CLIP =
  "polygon(0% 0.26%,8.33% 1.92%,16.67% 2.60%,25.00% 0.09%,33.33% 2.94%,41.67% 0.04%,50.00% 0.81%,58.33% 0.41%,66.67% 2.68%,75.00% 0.09%,83.33% 0.87%,91.67% 2.95%,100% 1.65%,99.29% 8.33%,99.50% 16.67%,99.60% 25.00%,99.44% 33.33%,98.99% 41.67%,99.97% 50.00%,96.69% 58.33%,99.52% 66.67%,99.60% 75.00%,99.35% 83.33%,96.62% 91.67%,97.12% 100%,91.67% 97.61%,83.33% 99.89%,75.00% 96.72%,66.67% 97.04%,58.33% 99.34%,50.00% 99.87%,41.67% 99.52%,33.33% 99.32%,25.00% 99.28%,16.67% 99.73%,8.33% 99.85%,0% 98.02%,3.38% 91.67%,0.11% 83.33%,0.32% 75.00%,0.80% 66.67%,2.63% 58.33%,2.54% 50.00%,0.38% 41.67%,0.70% 33.33%,0.28% 25.00%,0.98% 16.67%,0.79% 8.33%)";

const PARCHMENT_BG =
  "radial-gradient(circle at 75% 80%, rgba(120,80,40,0.16), transparent 45%), radial-gradient(circle at 15% 88%, rgba(120,80,40,0.12), transparent 40%), radial-gradient(circle at 42% 28%, #f2e2b8 0%, #e7d09e 42%, #d3b47f 75%, #b8925c 100%)";

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
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#140d06]/80 px-4 py-10 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div className="relative w-full max-w-lg" style={{ transform: "rotate(-0.6deg)" }}>
            {/* a second torn scrap peeking out from behind, like this page
                was pulled from a larger sheet */}
            <div
              aria-hidden="true"
              className="absolute inset-0 -z-10 bg-[#9c774c]"
              style={{ clipPath: BACK_TORN_CLIP, transform: "translate(10px,14px) rotate(1.1deg)" }}
            />
            <div
              role="dialog"
              aria-modal="true"
              aria-label="A note from the groom"
              onClick={(e) => e.stopPropagation()}
              className="relative max-h-[85vh] w-full overflow-y-auto px-8 py-12 sm:px-12 sm:py-16"
              style={{
                clipPath: FRONT_TORN_CLIP,
                background: PARCHMENT_BG,
                filter: "drop-shadow(0 22px 45px rgba(20,13,6,0.5))",
              }}
            >
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close letter"
                className="absolute right-6 top-5 flex h-8 w-8 items-center justify-center border border-[#6b4e2e]/40 text-[#6b4e2e]/70 transition-colors hover:border-[#6b4e2e] hover:text-[#6b4e2e]"
              >
                &#10005;
              </button>

              <p className="mb-7 text-center text-xs uppercase tracking-[0.28em] text-[#7a5a34]">
                A Note From the Groom
              </p>
              <div className="space-y-4 font-display text-base italic leading-relaxed text-[#4a3520] sm:text-lg">
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
              <p className="mt-7 text-right font-display text-lg italic text-[#4a3520]">
                &mdash; Olukorede
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
