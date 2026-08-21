import Image from "next/image";
import couple from "../assets/images/white/IMG-20260820-WA0026 (1).jpg";
import { tornEdgeClipPath } from "../lib/torn-edge";
import Countdown from "./Countdown";
import Reveal from "./Reveal";
import SmoothScrollLink from "./SmoothScrollLink";

const TORN_EDGE = tornEdgeClipPath(5);

export default function CountdownSection() {
  return (
    <section id="countdown" className="relative bg-cream">
      {/* Three crops of the same photo, concentrically centered: a wide
          establishing frame behind, a medium crop, and a sharp close crop
          on top. The back layer runs the full width of the screen — it's
          the "edges" of the composition — while the two crops on top of it
          stay proportional and centered. Depth comes from scale and a touch
          of tonal recession on the back two layers, not borders or blur. */}
      {/* Moved here from Hero — sits directly above the stack, borders
          ending right where the picture begins, no gap. */}
      <div className="relative z-10 grid grid-cols-3 divide-x divide-line border-t border-line text-center">
        <Reveal direction="left" className="px-4 py-6">
          <p className="eyebrow mb-1">Date</p>
          <p className="text-sm md:text-base">22nd August 2026</p>
        </Reveal>
        <Reveal direction="up" className="px-4 py-6">
          <p className="eyebrow mb-1">Time</p>
          <p className="text-sm md:text-base">2:00 PM</p>
        </Reveal>
        <Reveal direction="right" className="px-4 py-6">
          <p className="eyebrow mb-1">Details</p>
          <SmoothScrollLink href="#program" className="text-sm underline underline-offset-4 md:text-base">
            Wedding Program
          </SmoothScrollLink>
        </Reveal>
      </div>

      <Reveal direction="up" className="relative aspect-[4/3] w-full sm:aspect-[16/9] md:aspect-[21/9]">
        <div className="absolute inset-0">
          <Image
            src={couple}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-[50%_38%] brightness-[82%] saturate-[85%]"
          />
        </div>

        {/* mid: +30% over its previous size, and a taller aspect ratio
            (was 5/4, landscape) so it reads considerably taller than the
            front layer instead of nearly matching its height */}
        <div className="absolute inset-0 m-auto aspect-[7/8] w-[44%] shadow-[0_10px_26px_rgba(28,26,23,0.22)] sm:w-[36%] md:w-[31%]">
          <Image
            src={couple}
            alt=""
            fill
            sizes="(min-width: 48rem) 31vw, (min-width: 40rem) 36vw, 44vw"
            className="object-cover object-[50%_34%] brightness-[92%] saturate-[92%]"
          />
        </div>

        {/* front: +20% over its previous size */}
        <div className="absolute inset-0 m-auto aspect-[3/4] w-[23%] shadow-[0_20px_44px_rgba(28,26,23,0.3)] sm:w-[19%] md:w-[17%]">
          <Image
            src={couple}
            alt="Olukorede and Oghenevize"
            fill
            sizes="(min-width: 48rem) 17vw, (min-width: 40rem) 19vw, 23vw"
            className="object-cover object-[50%_26%]"
          />
        </div>

        {/* -bottom-px (rather than bottom-0) so the cream fill overlaps
            the container's true edge by a hair — aspect-ratio boxes
            round to fractional pixels, and bottom-0 alone leaves a
            sub-pixel sliver of photo visible as a hairline under the
            scallop. */}
        <div
          className="absolute inset-x-0 -bottom-px h-8 bg-cream md:h-12"
          style={{ clipPath: TORN_EDGE }}
        />
      </Reveal>

      <Reveal direction="up" className="mx-auto max-w-4xl px-6 py-16 text-center md:py-24">
        <p className="eyebrow mb-4">The Countdown Begins</p>
        <h2 className="font-display text-3xl italic leading-tight sm:text-4xl md:text-5xl">
          Until Our Ìgbéyàwó
        </h2>

        <div className="mx-auto mt-14 max-w-2xl">
          <Countdown />
        </div>

        <p className="mt-14 text-sm uppercase tracking-[0.22em] text-ink/60">
          22 August 2026 &nbsp;&middot;&nbsp; 2:00 PM
        </p>
      </Reveal>
    </section>
  );
}
