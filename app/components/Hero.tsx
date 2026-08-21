import Image from "next/image";
import couple from "../assets/images/yellow/20260820_094508 (1).jpg";
import Reveal from "./Reveal";
import SmoothScrollLink from "./SmoothScrollLink";

export default function Hero() {
  return (
    <section className="relative flex min-h-screen flex-col overflow-hidden bg-cream">
      <span
        aria-hidden
        className="pointer-events-none absolute -bottom-[0.12em] left-1/2 -translate-x-1/2 select-none whitespace-nowrap font-display text-[26vw] italic leading-none tracking-tighter text-ink/[0.035] md:text-[20vw]"
      >
        Olukorede &amp; Oghenevize
      </span>

      <div className="relative z-20 flex items-center justify-between px-6 py-7 md:px-12 md:py-9">
        <span className="font-display text-lg italic tracking-tight">O &amp; O</span>
        <nav className="hidden gap-10 text-xs uppercase tracking-[0.22em] text-ink/70 sm:flex">
          <SmoothScrollLink href="#program" className="transition-colors hover:text-ink">
            Program
          </SmoothScrollLink>
          <SmoothScrollLink href="#countdown" className="transition-colors hover:text-ink">
            Countdown
          </SmoothScrollLink>
        </nav>
      </div>

      <div className="relative z-10 mx-auto grid w-full max-w-6xl flex-1 items-center gap-12 px-6 py-10 md:grid-cols-2 md:gap-8 md:px-12">
        <Reveal direction="left" className="order-2 md:order-1">
          <p className="eyebrow mb-6">Save the Date &mdash; 22 . 08 . 2026</p>
          <h1 className="break-words font-display text-4xl leading-[1.05] tracking-tight sm:text-5xl lg:text-7xl">
            Olukorede
            <br />
            <span className="italic text-tan-deep">&amp;</span> Oghenevize
          </h1>
          <p className="mt-7 max-w-sm text-sm leading-relaxed text-ink/70 md:text-base">
            We are joining our lives together and would be honored to have you
            with us as we celebrate the beginning of our forever.
          </p>
          <SmoothScrollLink
            href="#program"
            className="mt-9 inline-flex items-center gap-3 border border-ink px-7 py-3.5 text-xs uppercase tracking-[0.22em] text-ink transition-colors hover:bg-ink hover:text-cream"
          >
            View Wedding Program
          </SmoothScrollLink>
        </Reveal>

        <Reveal direction="right" className="order-1 md:order-2">
          <div className="relative mx-auto aspect-[4/5] w-full max-w-sm">
            <div className="absolute -right-4 -top-4 h-full w-full bg-tan md:-right-6 md:-top-6" />
            <div className="absolute -bottom-4 -left-4 h-2/3 w-2/3 bg-gold/90 md:-bottom-6 md:-left-6" />
            <div className="relative h-full w-full">
              <Image
                src={couple}
                alt="Couple on their joining day"
                fill
                priority
                sizes="(min-width: 768px) 24rem, 80vw"
                className="object-cover object-[center_20%]"
              />
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
