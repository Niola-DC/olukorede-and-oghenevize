"use client";

import { useEffect, useState } from "react";
import parchmentTexture from "../assets/images/groom/parchment-texture.jpg";
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
// out from behind it, like the letter was torn from a larger page. The top
// edge is left flat on both — that's where the rolled cap attaches.
const FRONT_TORN_CLIP =
  "polygon(0% 0.00%,7.14% 0.00%,14.29% 0.00%,21.43% 0.00%,28.57% 0.00%,35.71% 0.00%,42.86% 0.00%,50.00% 0.00%,57.14% 0.00%,64.29% 0.00%,71.43% 0.00%,78.57% 0.00%,85.71% 0.00%,92.86% 0.00%,100% 0.00%,97.97% 7.14%,98.48% 14.29%,93.87% 21.43%,99.24% 28.57%,95.72% 35.71%,99.93% 42.86%,96.64% 50.00%,98.63% 57.14%,94.27% 64.29%,99.79% 71.43%,99.60% 78.57%,96.16% 85.71%,98.97% 92.86%,98.84% 100%,92.86% 99.06%,85.71% 95.44%,78.57% 96.41%,71.43% 97.90%,64.29% 96.84%,57.14% 97.91%,50.00% 99.99%,42.86% 96.80%,35.71% 99.26%,28.57% 98.83%,21.43% 99.13%,14.29% 95.41%,7.14% 97.90%,0% 95.35%,1.66% 92.86%,1.12% 85.71%,3.79% 78.57%,3.94% 71.43%,5.88% 64.29%,1.07% 57.14%,5.85% 50.00%,6.15% 42.86%,5.14% 35.71%,1.31% 28.57%,3.88% 21.43%,5.88% 14.29%,0.92% 7.14%)";
const BACK_TORN_CLIP =
  "polygon(0% 0.00%,7.14% 0.00%,14.29% 0.00%,21.43% 0.00%,28.57% 0.00%,35.71% 0.00%,42.86% 0.00%,50.00% 0.00%,57.14% 0.00%,64.29% 0.00%,71.43% 0.00%,78.57% 0.00%,85.71% 0.00%,92.86% 0.00%,100% 0.00%,98.55% 7.14%,95.43% 14.29%,99.18% 21.43%,95.28% 28.57%,97.94% 35.71%,99.94% 42.86%,94.47% 50.00%,99.02% 57.14%,99.19% 64.29%,95.01% 71.43%,94.38% 78.57%,98.61% 85.71%,94.43% 92.86%,95.30% 100%,92.86% 95.72%,85.71% 99.77%,78.57% 94.51%,71.43% 94.94%,64.29% 98.66%,57.14% 96.53%,50.00% 99.03%,42.86% 98.61%,35.71% 98.54%,28.57% 96.12%,21.43% 99.70%,14.29% 99.70%,7.14% 99.15%,0% 96.78%,5.63% 92.86%,0.22% 85.71%,0.65% 78.57%,5.43% 71.43%,4.61% 64.29%,4.49% 57.14%,0.78% 50.00%,1.42% 42.86%,0.56% 35.71%,2.00% 28.57%,1.61% 21.43%,0.39% 14.29%,1.59% 7.14%)";

// Laid over the real parchment photo with mix-blend-mode: multiply — evens
// out whichever part of the photo gets cropped in and darkens the edges,
// plus a vertical and a horizontal fold crease.
const PARCHMENT_TINT = [
  "linear-gradient(90deg, transparent calc(50% - 1px), rgba(66,40,16,0.35) 50%, transparent calc(50% + 1px))",
  "linear-gradient(180deg, transparent calc(58% - 1px), rgba(66,40,16,0.22) 58%, transparent calc(58% + 1px))",
  "radial-gradient(circle at 50% 45%, rgba(233,207,156,0.9) 0%, rgba(216,180,126,0.85) 45%, rgba(143,99,55,0.8) 100%)",
].join(", ");

// A dark, singed-looking ring hugging the inside of the torn boundary —
// box-shadow gets clipped along with everything else, so this reads as a
// burnt edge rather than a clean vignette.
const BURNT_EDGE_SHADOW =
  "inset 0 0 2px 1px rgba(43,25,10,0.55), inset 0 0 40px 16px rgba(50,28,10,0.5)";

// A short horizontal cylinder standing in for the rolled-up top of the
// scroll: a vertical gradient with alternating light/dark bands to fake the
// curvature, capped with rounded ends that overhang the sheet below it.
const ROLL_GRADIENT =
  "linear-gradient(180deg, #2c1a0c 0%, #7a5230 14%, #d9b784 32%, #9c6f42 48%, #6b4526 62%, #c9a06a 78%, #3d2612 92%, #241407 100%)";

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
          &mdash; Oghenevize, to his bride <span aria-hidden="true">❤️</span>
        </p>
      </Reveal>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#140d06]/80 px-4 py-10 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div className="relative w-full max-w-lg pt-6" style={{ transform: "rotate(-0.6deg)" }}>
            {/* the rolled-up top of the scroll: a squat cylinder overhanging
                the torn sheet on either side */}
            <div
              aria-hidden="true"
              className="absolute -left-3 -right-3 top-0 h-9 rounded-full shadow-[0_8px_16px_rgba(20,13,6,0.45)]"
              style={{ background: ROLL_GRADIENT }}
            />

            {/* a second torn scrap peeking out from behind, like this page
                was pulled from a larger sheet */}
            <div
              aria-hidden="true"
              className="absolute inset-x-0 bottom-0 top-6 -z-10 bg-[#7a5230]"
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
                boxShadow: BURNT_EDGE_SHADOW,
                filter: "drop-shadow(0 22px 45px rgba(20,13,6,0.5))",
              }}
            >
              {/* real parchment photo (CC BY 2.0, Caleb Kimbrough — credited
                  in the footer), a warm multiply tint to even out the crop,
                  then the fold creases — all behind the letter text */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0"
                style={{
                  backgroundImage: `url(${parchmentTexture.src})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0"
                style={{ background: PARCHMENT_TINT, mixBlendMode: "multiply" }}
              />

              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close letter"
                className="absolute right-6 top-5 flex h-8 w-8 items-center justify-center border border-[#6b4e2e]/40 text-[#6b4e2e]/70 transition-colors hover:border-[#6b4e2e] hover:text-[#6b4e2e]"
              >
                &#10005;
              </button>

              <p className="relative mb-7 text-center text-xs uppercase tracking-[0.28em] text-[#7a5a34]">
                A Note From the Groom
              </p>
              <div className="relative space-y-4 font-display text-base italic leading-relaxed text-[#4a3520] sm:text-lg">
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
              <p className="relative mt-7 text-right font-display text-lg italic text-[#4a3520]">
                &mdash; Oghenevize
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
