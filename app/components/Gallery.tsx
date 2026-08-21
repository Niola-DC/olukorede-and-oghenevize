"use client";

import Image, { type StaticImageData } from "next/image";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Reveal from "./Reveal";

import brideLeaning from "../assets/images/bride/20260820_104714.jpg";
import brideLaugh from "../assets/images/bride/20260820_104552.jpg";
import brideWalk from "../assets/images/bride/20260820_104558.jpg";
import brideKneeling from "../assets/images/bride/20260820_104709.jpg";
import brideBackBW from "../assets/images/bride/20260820_104541.jpg";
import brideStairs from "../assets/images/white/IMG-20260820-WA0024.jpg";
import groomPortrait from "../assets/images/groom/20260820_105006.jpg";
import groomCandid from "../assets/images/white/20260820_101514.jpg";
import coupleRings from "../assets/images/white/20260820_104003.jpg";
import coupleEmbraceBW from "../assets/images/black&white/20260820_105428.jpg";
import coupleSigning from "../assets/images/black&white/20260820_094508.jpg";
import coupleLaugh from "../assets/images/yellow/20260820_103821.jpg";
import coupleTraditionalGreen from "../assets/images/engagement/20260728_142639.jpg";
import couplePattern from "../assets/images/engagement/20260728_150411.jpg";

type PhotoItem = {
  type: "photo";
  src: StaticImageData;
  alt: string;
  aspect: string;
};

type QuoteItem = {
  type: "quote";
  quote: string;
  name: string;
  relation: string;
};

type Item = PhotoItem | QuoteItem;

// Quotes are always separated by at least two photos (see the interleave
// below) so the masonry never strands two text cards back to back — with
// CSS columns filling one column top-to-bottom before the next, adjacent
// quotes in this array tend to land stacked together at a column's end.
const QUOTES: QuoteItem[] = [
  {
    type: "quote",
    quote:
      "I’ve never seen two people build a home out of laughter the way they do — you feel it the second you walk in.",
    name: "Desire",
    relation: " Chief Bridesmaid",
  },
  {
    type: "quote",
    quote:
      "He talks about her like she invented sunlight. I’ve stopped being surprised by it.",
    name: "Mairo",
    relation: "Best Man",
  },
  {
    type: "quote",
    quote:
      "He is so gentle with her, and more than anything, he’s her best friend.",
    name: "Eniola",
    relation: "Bride's Sister",
  },
//   {
//     type: "quote",
//     quote:
//       "Marriage isn’t about finding a perfect person. It’s about finding someone and deciding you’re perfect for each other. Seeing the two of you together has made me understand that.",
//     name: "Gaddiel Ighodaro",
//     relation: "Friend",
//   },
  {
    type: "quote",
    quote:
      "Olu has always been a beautiful soul and I’m genuinely happy I get to witness this chapter of her life with someone who loves and cares for her.",
    name: "Mosun",
    relation: "Close Friend",
  },
  {
    type: "quote",
    quote:
      "I’ve had the privilege of witnessing part of your journey, and you truly deserve this joy. I’m honoured to witness this beautiful chapter of your lives.",
    name: "Divine Chidiebere",
    relation: "Close Friend",
  },
 {
    type: "quote",
    quote:
      "Watching you both reminds me that love can truly be done right. Thank you for showing what patience, self-control, and intentional love look like.",
    name: "Osaze Ighodaro",
    relation: "Close Friend",
  },
];

const PHOTOS: PhotoItem[] = [
  {
    type: "photo",
    src: brideLeaning,
    alt: "Oghenevize leaning against her bouquet, veil catching the breeze",
    aspect: "aspect-[3/4]",
  },
  {
    type: "photo",
    src: coupleEmbraceBW,
    alt: "Olukorede and Oghenevize forehead to forehead, in black and white",
    aspect: "aspect-[4/5]",
  },
  {
    type: "photo",
    src: coupleLaugh,
    alt: "The couple laughing together, holding a bright bouquet",
    aspect: "aspect-square",
  },
  {
    type: "photo",
    src: coupleRings,
    alt: "Olukorede and Oghenevize showing off their rings, laughing",
    aspect: "aspect-square",
  },
  {
    type: "photo",
    src: brideLaugh,
    alt: "Oghenevize laughing with her bouquet held close",
    aspect: "aspect-[4/5]",
  },
  {
    type: "photo",
    src: groomPortrait,
    alt: "Olukorede in his cream suit, hands clasped",
    aspect: "aspect-[3/4]",
  },
  {
    type: "photo",
    src: coupleTraditionalGreen,
    alt: "The couple in traditional green attire, cheek to cheek",
    aspect: "aspect-[3/4]",
  },
  {
    type: "photo",
    src: brideStairs,
    alt: "Oghenevize seated on a staircase, her veil pooling around her",
    aspect: "aspect-[2/3]",
  },
  {
    type: "photo",
    src: coupleSigning,
    alt: "Olukorede and Oghenevize seated together, signing the register",
    aspect: "aspect-[4/3]",
  },
  {
    type: "photo",
    src: brideWalk,
    alt: "Oghenevize glancing back over her shoulder, mid-walk",
    aspect: "aspect-[3/4]",
  },
  {
    type: "photo",
    src: groomCandid,
    alt: "Olukorede in conversation, a candid moment",
    aspect: "aspect-[3/4]",
  },
  {
    type: "photo",
    src: couplePattern,
    alt: "Olukorede and Oghenevize in matching monochrome prints",
    aspect: "aspect-square",
  },
  {
    type: "photo",
    src: brideKneeling,
    alt: "Oghenevize kneeling on the pavement, bouquet raised beside her face",
    aspect: "aspect-[3/4]",
  },
  {
    type: "photo",
    src: brideBackBW,
    alt: "Oghenevize glancing back mid-stride, veil trailing behind her, in black and white",
    aspect: "aspect-[2/3]",
  },
];

// One quote, then two photos, repeated — always ends on a photo. Filters out
// undefined slots so QUOTES outgrowing PHOTOS (each quote needs two) trims
// the last quote's photo pairing instead of crashing the page.
const ITEMS: Item[] = QUOTES.flatMap((quote, i) => [
  quote,
  PHOTOS[i * 2],
  PHOTOS[i * 2 + 1],
]).filter((item): item is Item => item !== undefined);

// Matches the .gallery-drawer-content clip-path transition in globals.css —
// closing waits this long before collapsing the panel.
const CONTENT_SLIDE_MS = 400;

export default function Gallery() {
  // Three pieces of state instead of one, so closing can happen in two
  // beats: the drawer front slides down over the content first (panel
  // still full height, nothing below it moves), then — only once that's
  // covered — the panel itself snaps shut instantly. Doing both at once
  // was the earlier bug: animating the panel's height directly drags
  // everything below it up the page for the whole transition, which reads
  // as the page scrolling.
  const [open, setOpen] = useState(true); // user-facing: label, aria-expanded
  const [expanded, setExpanded] = useState(true); // drives the panel's actual height
  const [contentShown, setContentShown] = useState(true); // drives the content's slide-shut

  const buttonRef = useRef<HTMLButtonElement>(null);
  const anchorTopRef = useRef<number | null>(null);
  const closeTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current !== null) window.clearTimeout(closeTimeoutRef.current);
    };
  }, []);

  function captureAnchor() {
    anchorTopRef.current = buttonRef.current?.getBoundingClientRect().top ?? null;
  }

  function handleToggle() {
    if (closeTimeoutRef.current !== null) {
      window.clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }

    const opening = !open;
    setOpen(opening);

    if (opening) {
      captureAnchor();
      setContentShown(true);
      setExpanded(true);
      return;
    }

    setContentShown(false);
    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      captureAnchor();
      setExpanded(false);
    } else {
      closeTimeoutRef.current = window.setTimeout(() => {
        captureAnchor();
        setExpanded(false);
        closeTimeoutRef.current = null;
      }, CONTENT_SLIDE_MS);
    }
  }

  // Re-anchors on `expanded` (the panel's real height), not `open` — that's
  // the state whose change actually reflows the rest of the page.
  useLayoutEffect(() => {
    const before = anchorTopRef.current;
    anchorTopRef.current = null;
    if (before === null || !buttonRef.current) return;
    const after = buttonRef.current.getBoundingClientRect().top;
    if (after !== before) {
      window.scrollBy(0, after - before);
    }
  }, [expanded]);

  return (
    <section id="gallery" className="bg-cream px-4 py-14 md:px-12 md:py-28">
      <Reveal direction="up" className="mx-auto max-w-2xl text-center">
        <p className="eyebrow mb-4">In Frame</p>
        <h2 className="font-display text-4xl italic leading-tight sm:text-5xl">
          The Gallery
        </h2>
        <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-ink/70">
          A few frames of the two of us, and a few words from the people
          who&rsquo;ve watched this love take shape.
        </p>
      </Reveal>

      <Reveal direction="up">
        <div
          id="gallery-panel"
          className="gallery-drawer-panel mx-auto mt-12 max-w-6xl"
          data-open={expanded}
        >
          <div className="gallery-drawer-inner">
            <div
              className="gallery-drawer-content columns-2 gap-3 sm:columns-3 md:gap-4 lg:columns-4"
              data-shown={contentShown}
            >
              {ITEMS.map((item, i) =>
                item.type === "photo" ? (
                  <div
                    key={i}
                    className={`relative mb-3 w-full overflow-hidden break-inside-avoid bg-cream-deep md:mb-4 ${item.aspect}`}
                  >
                    <Image
                      src={item.src}
                      alt={item.alt}
                      fill
                      sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div
                    key={i}
                    className="mb-3 flex w-full break-inside-avoid flex-col items-center justify-center border border-line bg-cream-deep/60 px-5 py-7 text-center md:mb-4"
                  >
                    <span aria-hidden className="font-display text-3xl italic leading-none text-gold/50">
                      &ldquo;
                    </span>
                    <p className="mt-1 font-display text-sm italic leading-snug text-ink/85 sm:text-base">
                      {item.quote}
                    </p>
                    <p className="eyebrow mt-3 text-[10px] text-tan-deep">
                      &mdash; {item.name}, {item.relation}
                    </p>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </Reveal>

      <Reveal direction="up" className="mx-auto mt-14 flex max-w-6xl flex-col items-center">
        <div className="w-full border-t border-ink" />
        {/* The handle sits outside the button, not inside it — the button
            needs overflow-hidden to clip its own background photo, which
            was silently clipping the handle's upward poke along with it. */}
        <div className="relative">
          <button
            ref={buttonRef}
            type="button"
            onClick={handleToggle}
            aria-expanded={open}
            aria-controls="gallery-panel"
            className={`group relative -mt-px flex flex-col items-center overflow-hidden border border-t-0 px-10 pb-4 pt-6 transition-colors duration-300 ${
              open
                ? "border-white/10 shadow-[0_8px_40px_rgba(0,0,0,0.35)]"
                : "border-ink"
            }`}
          >
            <Image
              src={open ? coupleEmbraceBW : coupleLaugh}
              alt=""
              fill
              sizes="20rem"
              className="object-cover"
            />
            {/* Shelved: a dark glass pane over the photo, the same treatment
                as the Program section's frosted card. Open: the same light
                frosted-glass tile as "Toss the Bouquet". */}
            <span
              aria-hidden="true"
              className={`absolute inset-0 ${
                open
                  ? "bg-ink/80 backdrop-blur-md group-hover:bg-ink/70"
                  : "bg-cream-deep/85 backdrop-blur-[6px] backdrop-saturate-[1.05] group-hover:bg-cream-deep/70"
              }`}
            />
            <span className="eyebrow relative">
              {open ? "Shelve the Gallery" : "Open the Gallery"}
            </span>
          </button>
          <span
            aria-hidden
            className={`pointer-events-none absolute -top-5 left-1/2 flex h-10 w-10 -translate-x-1/2 items-center justify-center rounded-full border border-ink bg-cream shadow-[0_2px_8px_rgba(28,26,23,0.25)] transition-transform duration-500 ${
              open ? "rotate-0" : "rotate-180"
            }`}
          >
            <svg width="18" height="12" viewBox="0 0 18 12" fill="none" aria-hidden="true">
              <path
                d="M1.5 10L9 2L16.5 10"
                stroke="currentColor"
                strokeWidth="2.25"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </div>
        <p className="mt-3 text-xs italic text-ink/50">
          {open
            ? "Slide the drawer shut when you’re through browsing"
            : "Pull the drawer back out any time"}
        </p>
      </Reveal>
    </section>
  );
}
