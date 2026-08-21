"use client";

import Image, { type StaticImageData } from "next/image";
import { useEffect, useRef, useState } from "react";
import drumImg from "../assets/images/game/drum.jpg";
import coralImg from "../assets/images/game/coral-token.png";
import asoOkeImg from "../assets/images/game/aso_oke.png";
import iroBubaImg from "../assets/images/game/iro_buba.png";
import ringImg from "../assets/images/game/ring.png";
import geleImg from "../assets/images/game/gele.png";
import fan from "../assets/images/game/fan.jpg";

import accessoriesImg from "../assets/images/game/accessories.png";
import { Bell, BellOff, Diamond, ListRestart, RotateCw } from "lucide-react";

type Pair = { label: string; image?: StaticImageData; emoji?: string };

// "Hand Fan" has no clean photo — the only source available was a
// watermarked stock preview — so it falls back to an emoji face like the
// rest would if a photo were missing. Swap in a real photo any time by
// adding `image: fanImg` here.
const PAIRS: Pair[] = [
  { label: "Talking Drum", image: drumImg },
  { label: "Coral Beads", image: coralImg },
  { label: "Aso-Oke", image: asoOkeImg },
  { label: "Iro & Buba", image: iroBubaImg },
  { label: "Hand Fan", image: fan },
  { label: "Ring", image: ringImg },
  { label: "Gele", image: geleImg },
  { label: "Accessories", image: accessoriesImg },
];

type CardData = { uid: number; pairIndex: number };

function unshuffledDeck(): CardData[] {
  const deck: CardData[] = [];
  PAIRS.forEach((_, pairIndex) => {
    deck.push({ uid: pairIndex * 2, pairIndex });
    deck.push({ uid: pairIndex * 2 + 1, pairIndex });
  });
  return deck;
}

// Random shuffle — must only ever run client-side (see the mount effect
// below). Card fronts carry real image src/text in the DOM even while
// flipped away, so a shuffle that differs between server and client render
// is a genuine hydration mismatch, not just an invisible one.
function buildDeck(): CardData[] {
  const deck = unshuffledDeck();
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m < 10 ? "0" : ""}${m}:${s < 10 ? "0" : ""}${s}`;
}

// A tiny built-in Web Audio chime — no external sound files.
function useChime() {
  const ctxRef = useRef<AudioContext | null>(null);
  function getCtx() {
    if (!ctxRef.current) {
      const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (Ctx) ctxRef.current = new Ctx();
    }
    return ctxRef.current;
  }
  return function chime(freqs: number[], duration: number, enabled: boolean) {
    if (!enabled) return;
    const ctx = getCtx();
    if (!ctx) return;
    if (ctx.state === "suspended") ctx.resume();
    const now = ctx.currentTime;
    freqs.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.14, now + 0.02 + i * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration + i * 0.06);
      osc.connect(gain).connect(ctx.destination);
      osc.start(now + i * 0.06);
      osc.stop(now + duration + i * 0.06 + 0.05);
    });
  };
}

const CONFETTI_COLORS = ["#b08d2e", "#d3ab52", "#a9825a", "#c9a876", "#f7f3ec"];

export default function MemoryGame({ active }: { active: boolean }) {
  const [cards, setCards] = useState<CardData[]>(() => unshuffledDeck());
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<Set<number>>(new Set());
  const [moves, setMoves] = useState(0);
  const [lock, setLock] = useState(false);
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [soundOn, setSoundOn] = useState(true);

  const startTimeRef = useRef<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mismatchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const chime = useChime();

  // Real shuffle happens once, after hydration, so the first client paint
  // matches the server-rendered (deterministic) card order exactly.
  useEffect(() => {
    setCards(buildDeck());
  }, []);

  useEffect(
    () => () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (mismatchTimeoutRef.current) clearTimeout(mismatchTimeoutRef.current);
    },
    []
  );

  function startTimerIfNeeded() {
    if (startTimeRef.current) return;
    startTimeRef.current = Date.now();
    intervalRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - (startTimeRef.current as number)) / 1000));
    }, 1000);
  }

  function stopTimer() {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = null;
  }

  function resetGame() {
    stopTimer();
    if (mismatchTimeoutRef.current) clearTimeout(mismatchTimeoutRef.current);
    setCards(buildDeck());
    setFlipped([]);
    setMatched(new Set());
    setMoves(0);
    setLock(false);
    setFinished(false);
    setElapsed(0);
    startTimeRef.current = null;
  }

  function handleCardClick(index: number) {
    if (!started || lock) return;
    if (flipped.includes(index) || matched.has(cards[index].pairIndex)) return;

    startTimerIfNeeded();
    chime([420], 0.12, soundOn);

    if (flipped.length === 0) {
      setFlipped([index]);
      return;
    }

    const nextFlipped = [flipped[0], index];
    setFlipped(nextFlipped);
    setLock(true);
    setMoves((m) => m + 1);

    const first = cards[nextFlipped[0]];
    const second = cards[nextFlipped[1]];

    if (first.pairIndex === second.pairIndex) {
      chime([523.25, 659.25, 784.0], 0.35, soundOn);
      const newMatched = new Set(matched);
      newMatched.add(first.pairIndex);
      setMatched(newMatched);
      setFlipped([]);
      setLock(false);
      if (newMatched.size === PAIRS.length) {
        setTimeout(() => {
          stopTimer();
          chime([523.25, 659.25, 784.0, 1046.5], 0.5, soundOn);
          setFinished(true);
        }, 500);
      }
    } else {
      chime([220, 180], 0.18, soundOn);
      mismatchTimeoutRef.current = setTimeout(() => {
        setFlipped([]);
        setLock(false);
      }, 700);
    }
  }

  return (
    <div className="px-5 py-9 sm:px-9 sm:py-10">
      <p className="mx-auto max-w-md text-center text-sm leading-relaxed text-ink/70">
        Flip two cards at a time and match every treasure from the ceremony
        &mdash; from the talking drum to the wedding gele.
      </p>

      <div className="mx-auto mt-8 max-w-xl">
        <div className="flex items-stretch justify-center gap-3 sm:gap-4">
          <div className="flex-1 border border-line bg-cream-deep/60 px-1 py-3 text-center">
            <p className="tabular-nums font-display text-xl">{moves}</p>
            <p className="eyebrow mt-0.5 text-[10px]">Moves</p>
          </div>
          <div className="flex-1 border border-line bg-cream-deep/60 px-1 py-3 text-center">
            <p className="tabular-nums font-display text-xl">
              {matched.size}/{PAIRS.length}
            </p>
            <p className="eyebrow mt-0.5 text-[10px]">Matches</p>
          </div>
          <div className="flex-1 border border-line bg-cream-deep/60 px-1 py-3 text-center">
            <p className="tabular-nums font-display text-xl">{formatTime(elapsed)}</p>
            <p className="eyebrow mt-0.5 text-[10px]">Time</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSoundOn((s) => !s)}
              aria-pressed={soundOn}
              aria-label="Toggle sound"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-line text-lg text-ink transition-colors hover:border-ink"
            >
              {soundOn ?<Bell size={15}/> : <BellOff size={15} />}
            </button>
            <button
              onClick={() => {
                resetGame();
                setStarted(true);
              }}
              aria-label="Restart game"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-line text-lg text-ink transition-colors hover:border-ink"
            >
             <RotateCw size={15}/>
            </button>
          </div>
        </div>

        <div
          className="relative mt-8 grid grid-cols-4 gap-2 sm:gap-3"
          style={{ perspective: "900px" }}
          aria-label="Memory game board"
        >
          {cards.map((card, index) => {
            const pair = PAIRS[card.pairIndex];
            const isFlipped = flipped.includes(index);
            const isMatched = matched.has(card.pairIndex);
            return (
              <button
                key={card.uid}
                type="button"
                onClick={() => handleCardClick(index)}
                disabled={isMatched}
                aria-label={
                  isMatched
                    ? `${pair.label} card, matched`
                    : isFlipped
                      ? `${pair.label} card, face up`
                      : `Card ${index + 1}, face down`
                }
                className={`flip-card aspect-[3/4] cursor-pointer border-none bg-transparent p-0 ${
                  isFlipped || isMatched ? "is-flipped" : ""
                } ${isMatched ? "is-matched" : ""}`}
              >
                <span
                  aria-hidden="true"
                  className="flip-face flex items-center justify-center border border-gold/70 bg-gradient-to-br from-tan-deep via-tan to-tan-deep shadow-[0_8px_16px_-10px_rgba(28,26,23,0.45)]"
                >
                  <span className="text-lg text-cream/80 sm:text-xl">&#10022;</span>
                </span>
                <span
                  className={`flip-face flip-face-front flex flex-col items-center justify-center gap-1 border p-1.5 text-center ${
                    isMatched
                      ? "border-gold bg-gradient-to-br from-cream to-cream-deep"
                      : "border-gold/70 bg-cream"
                  }`}
                >
                  {pair.image ? (
                    <span className="relative block w-full flex-1 overflow-hidden">
                      <Image
                        src={pair.image}
                        alt=""
                        fill
                        sizes="120px"
                        className="object-contain"
                      />
                    </span>
                  ) : (
                    <span className="text-2xl sm:text-3xl">{pair.emoji}</span>
                  )}
                  <span
                    className={`text-[9px] font-medium uppercase tracking-[0.06em] sm:text-[10px] ${
                      isMatched ? "text-gold" : "text-ink/70"
                    }`}
                  >
                    {pair.label}
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        {active && !started && (
          <div className="fixed inset-0 z-40 flex items-center justify-center bg-ink/55 p-5 backdrop-blur-sm">
            <div className="w-full max-w-sm border border-line bg-cream px-8 py-9 text-center shadow-[0_20px_60px_-20px_rgba(28,26,23,0.45)] sm:px-10">
              <p className="text-2xl flex justify-center"><Diamond/></p>
              <h3 className="mt-2 font-display text-2xl italic">Ready to Play?</h3>
              <p className="mt-2 text-sm text-ink/70">
                Match all {PAIRS.length} pairs of traditional wedding treasures
                in as few moves as you can.
              </p>
              <div className="mt-5 flex flex-wrap justify-center gap-1.5">
                {PAIRS.map((p) => (
                  <span
                    key={p.label}
                    className="border border-line px-2.5 py-1 text-xs text-ink/70"
                  >
                    {p.label}
                  </span>
                ))}
              </div>
              <button
                onClick={() => setStarted(true)}
                className="mt-7 border border-ink px-7 py-3.5 text-xs uppercase tracking-[0.22em] text-ink transition-colors hover:bg-ink hover:text-cream"
              >
                Start Game
              </button>
            </div>
          </div>
        )}

        {active && finished && (
          <div className="fixed inset-0 z-40 flex items-center justify-center bg-ink/55 p-5 backdrop-blur-sm">
            <div className="relative w-full max-w-sm overflow-hidden border border-line bg-cream px-8 py-9 text-center shadow-[0_20px_60px_-20px_rgba(28,26,23,0.45)] sm:px-10">
              {Array.from({ length: 26 }).map((_, i) => (
                <span
                  key={i}
                  aria-hidden="true"
                  className="pointer-events-none absolute top-[-12px] h-3 w-2 rounded-[1px] opacity-90"
                  style={{
                    left: `${5 + Math.random() * 90}%`,
                    background: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
                    animation: `confetti-fall ${1.4 + Math.random() * 1.1}s linear forwards`,
                    animationDelay: `${Math.random() * 0.4}s`,
                  }}
                />
              ))}
              <p className="text-2xl">&#127882;</p>
              <h3 className="mt-2 font-display text-2xl italic">All Matched!</h3>
              <p className="mt-2 text-sm text-ink/70">
                You found every pair. Sweet as coral beads.
              </p>
              <div className="mt-5 flex justify-center gap-8">
                <div>
                  <p className="tabular-nums font-display text-2xl text-gold">{moves}</p>
                  <p className="eyebrow mt-0.5 text-[10px]">Moves</p>
                </div>
                <div>
                  <p className="tabular-nums font-display text-2xl text-gold">
                    {formatTime(elapsed)}
                  </p>
                  <p className="eyebrow mt-0.5 text-[10px]">Time</p>
                </div>
              </div>
              <button
                onClick={() => {
                  resetGame();
                  setStarted(true);
                }}
                className="mt-7 border border-ink px-7 py-3.5 text-xs uppercase tracking-[0.22em] text-ink transition-colors hover:bg-ink hover:text-cream"
              >
                Play Again
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
