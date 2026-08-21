import Reveal from "./Reveal";

export default function Footer() {
  return (
    <footer className="border-t border-line bg-cream px-6 py-16 text-center md:px-12 md:py-20">
      <Reveal direction="up">
        <p className="eyebrow mb-4">With Love</p>
        <p className="mx-auto max-w-md font-display text-2xl italic leading-snug sm:text-3xl">
          Thank you for being part of our story
        </p>
        <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-ink/70">
          However you find your way to us on the day, we&rsquo;re simply
          grateful you&rsquo;re coming to celebrate with us. We can&rsquo;t
          wait to welcome you, share in the joy, and dance the day away
          together.
        </p>
      </Reveal>

      <Reveal direction="up" delay={120}>
        <div className="mx-auto mt-10 h-px w-16 bg-line" />

        <p className="mt-10 font-display text-2xl italic">Olukorede &amp; Oghenevize</p>
        <p className="eyebrow mt-3">22 . 08 . 2026</p>

        <p className="mt-12 text-[11px] uppercase tracking-[0.18em] text-ink/40">
          Designed &amp; built by{" "}
          <span className="relative inline-block">
            <a
              href="https://www.linkedin.com/in/eniola-c-fanegan-a50996234/"
              className="underline underline-offset-2 hover:text-ink"
            >
              Irem
            </a>
            <span
              aria-hidden="true"
              className="credit-arrow pointer-events-none absolute -right-2 -top-10 flex flex-col items-end text-tan-deep"
            >
              <span className="mb-0.5 whitespace-nowrap font-display text-[11px] italic normal-case tracking-normal">
                click me
              </span>
              <svg width="34" height="30" viewBox="0 0 34 30" fill="none">
                <path
                  d="M28 3C32 14, 12 10, 8 24"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  fill="none"
                />
                <path
                  d="M13 21L8 24L9 16"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
              </svg>
            </span>
          </span>
        </p>
      </Reveal>
    </footer>
  );
}
