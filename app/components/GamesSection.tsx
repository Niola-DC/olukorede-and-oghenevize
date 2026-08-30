"use client";

import Image from "next/image";
import dynamic from "next/dynamic";
import { useState } from "react";
import bouquetImg from "../assets/images/game/bouquet-token.png";
import ringImg from "../assets/images/game/ring.png";
import Reveal from "./Reveal";
import { Drum } from "lucide-react";

// Both games are sizeable client bundles (Web Audio, confetti, their own
// image sets) sitting behind a closed accordion, so they're split out and
// only fetched the first time a guest opens that tile — then kept mounted
// so the open/close animation still has something to reveal.
const gameLoading = () => (
  <div className="px-5 py-14 text-center text-sm italic text-ink/50">Loading&hellip;</div>
);
const BouquetToss = dynamic(() => import("./BouquetToss"), { ssr: false, loading: gameLoading });
const MemoryGame = dynamic(() => import("./MemoryGame"), { ssr: false, loading: gameLoading });

type GameKey = "toss" | "match";

export default function GamesSection() {
  const [active, setActive] = useState<GameKey | null>(null);
  const [mounted, setMounted] = useState<Record<GameKey, boolean>>({
    toss: false,
    match: false,
  });

  function toggle(key: GameKey) {
    setMounted((prev) => (prev[key] ? prev : { ...prev, [key]: true }));
    setActive((prev) => (prev === key ? null : key));
  }

  return (
    <section id="games" className="bg-cream px-4 py-20 md:px-12 md:py-28">
      {/* Deliberately not styled like the other section headers (no eyebrow
          label, no formal heading) — this is meant to read as a spontaneous
          aside dropped into the page, not another chaptered section. */}
      <Reveal direction="up" className="mx-auto max-w-2xl text-center">
        <p className="font-display text-lg italic text-ink/60 sm:text-xl">
          A little something for our guests&hellip;
        </p>
        <p className="mt-2 flex items-center justify-center gap-2 font-display text-3xl italic leading-tight sm:text-4xl">
          <Drum aria-hidden="true" className="h-7 w-7 shrink-0 text-tan-deep sm:h-8 sm:w-8" />
          Can you keep up with the rhythm?
        </p>
        <p className="mt-3 text-xs uppercase tracking-[0.2em] text-tan-deep">
          Tap a card below to play
        </p>
      </Reveal>

      <div className="mx-auto mt-12 max-w-4xl">
        <div className="grid grid-cols-2 border border-ink">
          <Reveal direction="left">
            <button
              type="button"
              onClick={() => toggle("toss")}
              aria-expanded={active === "toss"}
              aria-controls="panel-toss"
              className="game-tile relative flex h-full w-full flex-col gap-1 overflow-hidden border-r border-ink px-4 py-6 text-left sm:px-8 sm:py-7"
            >
              <Image
                src={bouquetImg}
                alt=""
                fill
                sizes="(min-width: 640px) 50vw, 100vw"
                className="object-cover"
                priority={false}
              />
              <span aria-hidden="true" className="game-tile-glass" />
              <span className="game-tile-content">
                <span className="game-tile-cta eyebrow mb-1 block text-tan-deep">
                  Tap to Play
                </span>
                <span className="block font-display text-lg italic leading-tight [text-shadow:0_1px_12px_rgba(255,255,255,0.6)] sm:text-2xl">
                  Toss the Bouquet
                </span>
                <span className="mt-1 block text-sm text-ink/70">
                  Tap a spot, then watch it fly
                </span>
              </span>
            </button>
          </Reveal>

          <Reveal direction="right">
            <button
              type="button"
              onClick={() => toggle("match")}
              aria-expanded={active === "match"}
              aria-controls="panel-match"
              className="game-tile relative flex h-full w-full flex-col gap-1 overflow-hidden px-4 py-6 text-left sm:px-8 sm:py-7"
            >
              <Image
                src={ringImg}
                alt=""
                fill
                sizes="(min-width: 640px) 50vw, 100vw"
                className="object-cover"
                priority={false}
              />
              <span aria-hidden="true" className="game-tile-glass" />
              <span className="game-tile-content">
                <span className="game-tile-cta eyebrow mb-1 block text-tan-deep">
                  Tap to Play
                </span>
                <span className="block font-display text-lg italic leading-tight [text-shadow:0_1px_12px_rgba(255,255,255,0.6)] sm:text-2xl">
                  Find the Match
                </span>
                <span className="mt-1 block text-sm text-ink/70">
                  Flip two cards, find every pair
                </span>
              </span>
            </button>
          </Reveal>
        </div>

        <div id="panel-toss" className="game-accordion-panel" data-open={active === "toss"}>
          <div className="game-accordion-inner">
            <div className="game-accordion-content">
              {mounted.toss && <BouquetToss />}
            </div>
          </div>
        </div>

        <div id="panel-match" className="game-accordion-panel" data-open={active === "match"}>
          <div className="game-accordion-inner">
            <div className="game-accordion-content">
              {mounted.match && <MemoryGame active={active === "match"} />}
            </div>
          </div>
        </div>
      </div>

      {/* The bridge into the Program section — this is why Games now sits
          right before it in page.tsx, so the "↓" actually leads somewhere. */}
      <Reveal direction="up" className="mx-auto mt-16 max-w-2xl text-center">
        <p className="font-display text-lg italic text-ink/60 sm:text-xl">
          Okay, now that you&rsquo;ve warmed up&hellip;
        </p>
        <p className="mt-2 font-display text-2xl italic leading-tight sm:text-3xl">
          Here&rsquo;s what to expect on the big day <span aria-hidden="true">↓</span>
        </p>
      </Reveal>
    </section>
  );
}
