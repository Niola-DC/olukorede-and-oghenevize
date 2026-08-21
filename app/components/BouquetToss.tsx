"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import bouquetImg from "../assets/images/game/bouquet-token.png";

type Player = { id: number; left: string; bottom: string };

const PLAYERS: Player[] = [
  { id: 1, left: "8%", bottom: "16%" },
  { id: 2, left: "27%", bottom: "40%" },
  { id: 3, left: "48%", bottom: "14%" },
  { id: 4, left: "68%", bottom: "38%" },
  { id: 5, left: "86%", bottom: "16%" },
];

const RULES = [
  { step: "Step 01", title: "Claim your spot", body: "Tap a guest marker on the court to enter the toss." },
  { step: "Step 02", title: "Start the toss", body: "Once contenders are set, press start the toss." },
  { step: "Step 03", title: "Watch it fly", body: "The bouquet arcs across the court in real time." },
  { step: "Step 04", title: "Catch your future", body: "One lucky guest catches the bouquet — and the tradition." },
];

export default function BouquetToss() {
  const [claimed, setClaimed] = useState<Set<number>>(new Set());
  const [started, setStarted] = useState(false);
  const [winnerId, setWinnerId] = useState<number | null>(null);
  const [showHint, setShowHint] = useState(false);

  const courtRef = useRef<HTMLDivElement>(null);
  const bouquetRef = useRef<HTMLDivElement>(null);
  const playerRefs = useRef<Map<number, HTMLButtonElement>>(new Map());
  const rafRef = useRef<number>(0);

  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  function toggleClaim(id: number) {
    if (started) return;
    setShowHint(false);
    setClaimed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function startToss() {
    if (started) return;
    if (claimed.size === 0) {
      setShowHint(true);
      return;
    }
    const court = courtRef.current;
    const bouquetEl = bouquetRef.current;
    if (!court || !bouquetEl) return;

    const candidates = Array.from(claimed);
    const target = candidates[Math.floor(Math.random() * candidates.length)];
    const targetEl = playerRefs.current.get(target);
    if (!targetEl) return;

    setStarted(true);

    const courtRect = court.getBoundingClientRect();
    const targetRect = targetEl.getBoundingClientRect();
    const startX = courtRect.width * 0.5;
    const startY = courtRect.height * 0.1;
    const endX = targetRect.left - courtRect.left + targetRect.width / 2;
    const endY = targetRect.top - courtRect.top + targetRect.height / 2;
    const arcHeight = Math.min(170, courtRect.height * 0.4);
    const spin = 320 + Math.random() * 260 * (Math.random() < 0.5 ? -1 : 1);

    bouquetEl.style.opacity = "1";
    const duration = 1000;
    const t0 = performance.now();

    function frame(now: number) {
      const raw = Math.min(1, (now - t0) / duration);
      // easeInOutQuad — quick launch, gentle catch
      const t = raw < 0.5 ? 2 * raw * raw : 1 - Math.pow(-2 * raw + 2, 2) / 2;
      const x = startX + (endX - startX) * t;
      const y = startY + (endY - startY) * t - arcHeight * Math.sin(Math.PI * t);
      const rot = spin * t;
      const scale = 1 + 0.18 * Math.sin(Math.PI * t);
      bouquetEl.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%) rotate(${rot}deg) scale(${scale})`;
      if (raw < 1) {
        rafRef.current = requestAnimationFrame(frame);
      } else {
        setWinnerId(target);
      }
    }
    rafRef.current = requestAnimationFrame(frame);
  }

  function playAgain() {
    cancelAnimationFrame(rafRef.current);
    setStarted(false);
    setWinnerId(null);
    setClaimed(new Set());
    setShowHint(false);
    if (bouquetRef.current) {
      bouquetRef.current.style.opacity = "0";
      bouquetRef.current.style.transform = "";
    }
    playerRefs.current.forEach((el) => {
      el.style.borderColor = "";
    });
  }

  return (
    <div className="px-5 py-9 sm:px-9 sm:py-10">
      <p className="mx-auto max-w-md text-center text-sm leading-relaxed text-ink/70">
        Choose your spot, then catch the bouquet before anyone else. The bride
        has one throw — may the luckiest guest win.
      </p>

      <div className="mx-auto mt-8 grid max-w-2xl grid-cols-3 divide-x divide-line border-y border-line text-center">
        <div className="px-4 py-6">
          <p className="font-display text-2xl italic text-tan-deep">05</p>
          <p className="eyebrow mt-1">Guests</p>
        </div>
        <div className="px-4 py-6">
          <p className="font-display text-2xl italic text-tan-deep">01</p>
          <p className="eyebrow mt-1">Throw</p>
        </div>
        <div className="px-4 py-6">
          <p className="font-display text-2xl italic text-tan-deep">&#8734;</p>
          <p className="eyebrow mt-1">Luck</p>
        </div>
      </div>

      <div className="mx-auto mt-16 max-w-3xl">
        <p className="eyebrow mb-8 text-center">How to Play</p>
        <ol className="grid gap-x-10 gap-y-8 sm:grid-cols-2">
          {RULES.map((r, i) => (
            <li key={r.step} className={`border-t border-line pt-5 ${i < 2 ? "sm:border-t-0 sm:pt-0" : ""}`}>
              <p className="eyebrow mb-2 text-gold">{r.step}</p>
              <p className="font-display text-lg">{r.title}</p>
              <p className="mt-1 text-sm text-ink/60">{r.body}</p>
            </li>
          ))}
        </ol>
      </div>

      <div className="mx-auto mt-20 max-w-4xl">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="eyebrow mb-2">The Moment</p>
            <h3 className="font-display text-2xl italic sm:text-3xl">Who catches the bouquet?</h3>
          </div>
          <div className="flex flex-wrap items-center gap-6">
            <p className="eyebrow text-right">
              Contestants <span className="text-gold">{claimed.size}</span>
              <br />
              Winner <span className="text-gold">{winnerId ? `Guest 0${winnerId}` : "—"}</span>
            </p>
            {!started ? (
              <button
                onClick={startToss}
                className="border border-ink px-7 py-3.5 text-xs uppercase tracking-[0.22em] text-ink transition-colors hover:bg-ink hover:text-cream"
              >
                Start the Toss
              </button>
            ) : (
              <button
                onClick={playAgain}
                className="border border-gold px-7 py-3.5 text-xs uppercase tracking-[0.22em] text-gold transition-colors hover:bg-gold hover:text-cream"
              >
                Play Again
              </button>
            )}
          </div>
        </div>

        {showHint && (
          <p className="mt-4 text-center text-sm italic text-ink/60">
            Claim at least one spot on the court before starting the toss.
          </p>
        )}

        <div ref={courtRef} className="relative mt-8 h-[420px] border border-line sm:h-[460px]">
          {PLAYERS.map((p) => {
            const isClaimed = claimed.has(p.id);
            return (
              <button
                key={p.id}
                ref={(el) => {
                  if (el) playerRefs.current.set(p.id, el);
                }}
                onClick={() => toggleClaim(p.id)}
                aria-pressed={isClaimed}
                disabled={started}
                className={`absolute flex h-16 w-16 -translate-x-1/2 translate-y-1/2 flex-col items-center justify-center gap-1 border transition-colors duration-300 ${
                  isClaimed
                    ? "border-gold bg-gold text-cream"
                    : "border-ink/50 bg-cream text-ink hover:border-ink"
                }`}
                style={{ left: p.left, bottom: p.bottom }}
              >
                <span aria-hidden="true" className="text-lg leading-none">
                  &#10022;
                </span>
                <span className="text-[9px] uppercase tracking-[0.1em]">Guest 0{p.id}</span>
              </button>
            );
          })}

          <div
            ref={bouquetRef}
            aria-hidden="true"
            className="pointer-events-none absolute left-0 top-0 z-20 w-16 opacity-0 drop-shadow-[0_6px_10px_rgba(0,0,0,0.25)] sm:w-20"
          >
            <Image src={bouquetImg} alt="" className="h-auto w-full" priority={false} />
          </div>

          {winnerId && (
            <div className="absolute left-1/2 top-1/2 z-30 min-w-[260px] -translate-x-1/2 -translate-y-1/2 border border-ink bg-cream px-9 py-8 text-center shadow-[0_12px_40px_rgba(0,0,0,0.25)]">
              <div className="mx-auto mb-3 w-14">
                <Image src={bouquetImg} alt="" className="h-auto w-full" />
              </div>
              <p className="eyebrow">The bouquet has landed</p>
              <p className="mt-2 font-display text-3xl italic text-gold">Guest 0{winnerId}</p>
              <button
                onClick={playAgain}
                className="mt-6 border border-ink px-6 py-3 text-xs uppercase tracking-[0.2em] text-ink transition-colors hover:bg-ink hover:text-cream"
              >
                Play Again
              </button>
            </div>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-ink/50">
          Any number of guests may join the court &mdash; the bouquet lands on
          exactly one contender, chosen at random.
        </p>
      </div>
    </div>
  );
}
