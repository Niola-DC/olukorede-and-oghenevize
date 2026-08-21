"use client";

import { useEffect, useRef } from "react";

type ProgramEvent = { start: string; end: string; title: string; subtitle?: string };

// Hosted on Cloudinary rather than bundled in the repo (it's an 83MB 4K
// clip). The source file is HEVC-encoded, which Chrome/Firefox can't play
// in a <video> tag on most platforms — f_auto,vc_auto has Cloudinary
// transcode to whatever codec the requesting browser actually supports.
const BACKGROUND_VIDEO_URL =
  "https://res.cloudinary.com/r1hwlwtb/video/upload/f_auto,vc_auto/no_parking.mp4";

const WEDDING_DATE = "2026-08-22";

const EVENTS: ProgramEvent[] = [
  { start: "14:00", end: "14:15", title: "Grand Arrival of Guests", subtitle: "Welcome music, ushering, and seating" },
  { start: "14:15", end: "14:20", title: "Entrance of the Bride’s Family", subtitle: "Led in with music and celebration" },
  { start: "14:20", end: "14:25", title: "Entrance of the Groom’s Family" },
  { start: "14:25", end: "14:30", title: "Grand Entrance of the Couple", subtitle: "Couple’s dance-in" },
  { start: "14:30", end: "14:33", title: "Opening Prayer", subtitle: "Mr. Otumba" },
  { start: "14:33", end: "14:38", title: "Chairman’s Opening Remarks & Welcome Address", subtitle: "Mr. Ransom Obi" },
  { start: "14:38", end: "14:45", title: "Cake Cutting Ceremony", subtitle: "Couple’s First Assignment" },
  { start: "14:45", end: "14:50", title: "Gele & Necktie Challenge" },
  { start: "14:50", end: "14:55", title: "First Dance of the Couple" },
  { start: "14:55", end: "15:00", title: "Audience Scavenger Hunt" },
  { start: "15:00", end: "15:05", title: "Audience Dance with the Couple" },
  { start: "15:05", end: "15:10", title: "Presentation of Gifts" },
  { start: "15:10", end: "15:15", title: "“Grab the Bottle” Challenge" },
  { start: "15:15", end: "15:30", title: "“How Well Do You Know The Couple?”", subtitle: "Audience Response" },
  { start: "15:30", end: "15:35", title: "Vote of Thanks / Groom’s Response" },
  { start: "15:35", end: "15:40", title: "Chairman’s Closing Remarks" },
  { start: "15:40", end: "15:45", title: "Closing Prayer", subtitle: "Mr. Adewuyi" },
  { start: "15:45", end: "23:59", title: "Reception", subtitle: "Dance! Dance!! Dance!!!" },
];

const LAST_INDEX = EVENTS.length - 1;

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

function toLabel(mins: number): string {
  const rounded = Math.round(mins);
  const h = Math.floor(rounded / 60);
  const m = rounded % 60;
  const ampm = h >= 12 ? "PM" : "AM";
  let h12 = h % 12;
  if (h12 === 0) h12 = 12;
  return `${h12}:${String(m).padStart(2, "0")} ${ampm}`;
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function dateKeyOf(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

type Status = "past" | "active" | "upcoming";

// The finale ("Reception") has no real end time — it just runs until the
// night winds down, so it blooms fully the instant it starts rather than
// crawling toward 100% over eight hours.
function statusFor(index: number, mins: number): { status: Status; progress: number } {
  const ev = EVENTS[index];
  const s = toMinutes(ev.start);
  if (index === LAST_INDEX) {
    return mins >= s ? { status: "past", progress: 100 } : { status: "upcoming", progress: 0 };
  }
  const e = toMinutes(ev.end);
  if (mins >= e) return { status: "past", progress: 100 };
  if (mins >= s) {
    const pct = ((mins - s) / (e - s)) * 100;
    return { status: "active", progress: Math.max(0, Math.min(100, pct)) };
  }
  return { status: "upcoming", progress: 0 };
}

// How far the heart has traveled down the root, from 0 (not yet planted) to
// 1 (fully bloomed). Each event occupies one equal-length stretch of the
// root regardless of its real duration, so a 3-minute prayer and a
// 15-minute Q&A move the heart the same visual distance.
function eventFraction(mins: number): number {
  const n = EVENTS.length;
  const first = toMinutes(EVENTS[0].start);
  if (mins <= first) return 0;
  if (mins >= toMinutes(EVENTS[LAST_INDEX].start)) return 1;
  for (let i = 0; i < n; i++) {
    const s = toMinutes(EVENTS[i].start);
    const e = toMinutes(EVENTS[i].end);
    if (mins < e) {
      const f = Math.max(0, Math.min(1, (mins - s) / (e - s)));
      return (i + f) / n;
    }
  }
  return 1;
}

type DayPhase = "before" | "before-today" | "during" | "after";

function computeState(): { phase: DayPhase; minutes: number; days: number } {
  const now = new Date();
  const todayKey = dateKeyOf(now);
  const minutesNow = now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60;
  const startMin = toMinutes(EVENTS[0].start);

  if (todayKey < WEDDING_DATE) {
    const wedding = new Date(WEDDING_DATE + "T00:00:00");
    const today = new Date(todayKey + "T00:00:00");
    const days = Math.round((wedding.getTime() - today.getTime()) / 86400000);
    return { phase: "before", minutes: 0, days };
  }
  if (todayKey > WEDDING_DATE) return { phase: "after", minutes: 1440, days: 0 };
  if (minutesNow < startMin) return { phase: "before-today", minutes: minutesNow, days: 0 };
  return { phase: "during", minutes: minutesNow, days: 0 };
}

function statusLineFor(state: ReturnType<typeof computeState>): string {
  if (state.phase === "before") {
    return `${state.days} ${state.days === 1 ? "day" : "days"} until the roots take hold`;
  }
  if (state.phase === "before-today") return "The garden is ready — planting begins at 2:00 PM";
  if (state.phase === "after") return "Forever bloomed — thank you for celebrating with us";

  const mins = state.minutes;
  let current: ProgramEvent | null = null;
  let next: ProgramEvent | null = null;
  for (let i = 0; i < EVENTS.length; i++) {
    const s = toMinutes(EVENTS[i].start);
    if (s <= mins) current = EVENTS[i];
    else {
      next = EVENTS[i];
      break;
    }
  }
  if (current && next) return `Now: ${current.title} · next, ${next.title} at ${toLabel(toMinutes(next.start))}`;
  if (current) return `Now: ${current.title}`;
  return "The garden is ready — planting begins at 2:00 PM";
}

// Deterministic pseudo-random value from an index, so the root's hand-grown
// wobble is identical on every render — no reliance on Math.random().
function seeded(i: number): number {
  const x = Math.sin(i * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

type Pt = { x: number; y: number };

function bezierPoint(p0: Pt, p1: Pt, p2: Pt, t: number): Pt {
  const mt = 1 - t;
  return {
    x: mt * mt * p0.x + 2 * mt * t * p1.x + t * t * p2.x,
    y: mt * mt * p0.y + 2 * mt * t * p1.y + t * t * p2.y,
  };
}

// Overshoot easing for the one-time entrance bloom pop — a bud that snaps
// open past full size before settling, like the SVG prototype's
// cubic-bezier(0.34, 1.56, 0.64, 1) transition.
function easeOutBack(x: number): number {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  const t = Math.max(0, Math.min(1, x));
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}

// Lightened for a dark, earthen background — the same wood/gold family as
// the rest of the site's palette, just bumped up in value so it still reads
// against near-black soil instead of the cream page.
const COLOR = {
  bark: "#c9a876", // tan, dormant wood
  barkHair: "#e4cfa8", // pale tan, fine root hairs
  gold: "#c79a3a",
  goldBright: "#f0c568",
  ink: "#f5efe4",
};

export default function Program() {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const statusRef = useRef<HTMLParagraphElement>(null);
  const labelRefs = useRef<HTMLDivElement[]>([]);

  // The background video only loads once the section is actually about to
  // scroll into view (and pauses again once it scrolls away) — it's a large
  // file, so nothing should fetch it just because the guest opened the page.
  useEffect(() => {
    const section = sectionRef.current;
    const video = videoRef.current;
    if (!section || !video) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let loaded = false;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (!loaded) {
            loaded = true;
            video.src = BACKGROUND_VIDEO_URL;
            video.load();
          }
          video.play().catch(() => {});
        } else if (loaded) {
          video.pause();
        }
      },
      { rootMargin: "400px 0px" }
    );
    io.observe(section);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    if (!stage || !canvas) return;
    const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
    if (!ctx) return;

    // ---------------- geometry (computed once; page doesn't resize the event list) ----------------
    const CW = 900;
    const topY = 160;
    const rowHeight = 178;
    const bottomMargin = 250;
    const n = EVENTS.length;
    const bottomY = topY + (n - 1) * rowHeight;
    const CH = bottomY + bottomMargin;
    const midX = CW / 2;

    canvas.width = CW;
    canvas.height = CH;

    // Trunk: a hand-wobbled polyline from the seed down to the last event,
    // sampled densely enough that quadratic interpolation along it looks smooth.
    const steps = n * 14;
    const trunkPts: (Pt & { t: number })[] = [];
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const y = topY + t * (bottomY - topY);
      const wobble =
        Math.sin(t * Math.PI * (n * 0.32) + 1.1) * 20 +
        Math.sin(t * Math.PI * (n * 0.78) + 3.4) * 8 +
        (seeded(i) - 0.5) * 9;
      trunkPts.push({ x: midX + wobble, y, t });
    }
    function trunkPointAt(t: number): Pt {
      const idx = Math.max(0, Math.min(1, t)) * (trunkPts.length - 1);
      const i0 = Math.floor(idx);
      const i1 = Math.min(trunkPts.length - 1, i0 + 1);
      const f = idx - i0;
      const a = trunkPts[i0];
      const b = trunkPts[i1];
      return { x: a.x + (b.x - a.x) * f, y: a.y + (b.y - a.y) * f };
    }

    // A short hair-root springing off a parent curve at fraction `ht` — reused
    // for the primary branches' tips and again, smaller, for each fork's tip.
    function makeTendrils(
      origin: Pt,
      ctrl: Pt,
      end: Pt,
      angle: number,
      side: number,
      seedBase: number,
      count: number,
      scale = 1
    ) {
      return Array.from({ length: count }, (_, h) => {
        const ht = 0.42 + h * (0.5 / count) + seeded(seedBase + h) * 0.08;
        const bp = bezierPoint(origin, ctrl, end, ht);
        const hlen = (14 + seeded(seedBase + h + 5) * 14) * scale;
        const hAngle = angle + side * (h % 2 === 0 ? 0.7 : -0.5) - (h % 2 === 0 ? 0 : 0.2);
        return {
          from: bp,
          to: { x: bp.x + Math.sin(hAngle) * hlen * side, y: bp.y + Math.cos(hAngle) * hlen * 0.5 },
        };
      });
    }

    // On tablets and up the root has a much wider lane to fill (see the 55vw
    // stage below), so the primary branches reach noticeably further out —
    // on a phone they stay shorter to avoid crowding the narrow column.
    const isWide = typeof window !== "undefined" && window.innerWidth >= 768;

    // Branches sit at an equal index-fraction down the trunk (not a raw time
    // fraction) so the finale's open-ended eight hours don't stretch the
    // whole illustration — every event gets the same amount of root.
    const branches = EVENTS.map((ev, i) => {
      const t = i / (n - 1);
      const origin = trunkPointAt(t);
      const side = i % 2 === 0 ? -1 : 1;
      const lenBase = (isWide ? 250 : 150) + (i % 3) * 20;
      const len = lenBase + seeded(i + 3) * 28;
      const angle = ((50 + seeded(i + 9) * 16) * Math.PI) / 180;
      const dx = Math.sin(angle) * len * side;
      const dy = Math.cos(angle) * len * 0.46;
      const end = { x: origin.x + dx, y: origin.y + dy };
      const ctrl = { x: origin.x + dx * 0.55 + side * 14, y: origin.y + dy * 0.3 };

      const tendrilCount = 2 + (i % 2);
      const tendrils = makeTendrils(origin, ctrl, end, angle, side, i * 7, tendrilCount);

      // Secondary forks — 1–2 smaller roots splitting off the primary branch
      // partway along its length, the way a real lateral root keeps dividing
      // as it runs. This is what reads as "realistic" rather than a single
      // bare line reaching out to each label.
      const forkCount = 1 + (i % 2);
      const forks = Array.from({ length: forkCount }, (_, f) => {
        const ft = 0.3 + f * 0.3 + seeded(i * 31 + f) * 0.1;
        const fOrigin = bezierPoint(origin, ctrl, end, ft);
        const fLen = len * (0.4 + seeded(i * 37 + f) * 0.16);
        const fAngle = angle + (f % 2 === 0 ? 1 : -1) * (0.4 + seeded(i * 41 + f) * 0.3);
        const fdx = Math.sin(fAngle) * fLen * side;
        const fdy = Math.cos(fAngle) * fLen * 0.5;
        const fEnd = { x: fOrigin.x + fdx, y: fOrigin.y + fdy };
        const fCtrl = { x: fOrigin.x + fdx * 0.5 + side * 8, y: fOrigin.y + fdy * 0.3 };
        const fTendrils = makeTendrils(fOrigin, fCtrl, fEnd, fAngle, side, i * 53 + f * 11, 2, 0.7);
        return { origin: fOrigin, ctrl: fCtrl, end: fEnd, tendrils: fTendrils };
      });

      const dirLen = Math.hypot(dx, dy) || 1;
      const labelPos = { x: end.x + (dx / dirLen) * 40, y: end.y + (dy / dirLen) * 40 };

      return { origin, ctrl, end, side, tendrils, forks, labelPos, t };
    });

    // A handful of fine hair-roots off the trunk itself, between branches,
    // so the spine reads as a living root rather than a wire with beads.
    const trunkHairs = Array.from({ length: n * 2 }, (_, i) => {
      const t = (i + 0.5) / (n * 2);
      const p = trunkPointAt(t);
      const side = i % 2 === 0 ? -1 : 1;
      const len = 9 + seeded(i + 200) * 10;
      const angle = 0.9 + seeded(i + 300) * 0.5;
      return {
        from: p,
        to: { x: p.x + Math.sin(angle) * len * side, y: p.y + Math.cos(angle) * len * 0.6 },
        t,
      };
    });

    // ---------------- stroke helpers ----------------
    function strokeTapered(pts: Pt[], w0: number, w1: number, color: string, glow?: string) {
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      if (glow) {
        ctx.shadowColor = glow;
        ctx.shadowBlur = 9;
      }
      ctx.strokeStyle = color;
      for (let i = 0; i < pts.length - 1; i++) {
        const t = i / (pts.length - 1);
        ctx.lineWidth = w0 + (w1 - w0) * t;
        ctx.beginPath();
        ctx.moveTo(pts[i].x, pts[i].y);
        ctx.lineTo(pts[i + 1].x, pts[i + 1].y);
        ctx.stroke();
      }
      ctx.shadowBlur = 0;
    }

    function tapedBezierPts(p0: Pt, p1: Pt, p2: Pt, samples: number, tMax = 1): Pt[] {
      const pts: Pt[] = [];
      for (let i = 0; i <= samples; i++) pts.push(bezierPoint(p0, p1, p2, (i / samples) * tMax));
      return pts;
    }

    function drawBud(x: number, y: number, side: number) {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate((side * Math.PI) / 10);
      ctx.beginPath();
      ctx.ellipse(0, 0, 4, 6.5, 0, 0, Math.PI * 2);
      ctx.fillStyle = COLOR.bark;
      ctx.globalAlpha = 0.65;
      ctx.fill();
      ctx.restore();
    }

    function drawBloom(x: number, y: number, scale = 1) {
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(scale, scale);
      const r = 12;
      for (let p = 0; p < 5; p++) {
        ctx.save();
        ctx.rotate((p / 5) * Math.PI * 2 + seeded(p + 40) * 0.3);
        ctx.beginPath();
        ctx.ellipse(0, -r * 0.6, r * 0.4, r * 0.62, 0, 0, Math.PI * 2);
        ctx.fillStyle = COLOR.bark;
        ctx.fill();
        ctx.restore();
      }
      ctx.beginPath();
      ctx.arc(0, 0, 4, 0, Math.PI * 2);
      ctx.fillStyle = COLOR.gold;
      ctx.shadowColor = COLOR.goldBright;
      ctx.shadowBlur = 8;
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.restore();
    }

    function drawSprout(x: number, y: number) {
      ctx.save();
      ctx.translate(x, y);
      ctx.strokeStyle = COLOR.bark;
      ctx.lineWidth = 2.4;
      ctx.lineCap = "round";
      [-1, 1].forEach((side) => {
        ctx.beginPath();
        ctx.moveTo(0, 10);
        ctx.quadraticCurveTo(side * 9, 4, side * 3, -9);
        ctx.stroke();
        ctx.beginPath();
        ctx.ellipse(side * 6.5, -1, 7, 3.6, side * -0.55, 0, Math.PI * 2);
        ctx.fillStyle = COLOR.barkHair;
        ctx.fill();
      });
      ctx.restore();
    }

    function drawHeart(x: number, y: number, scale: number, glow: boolean) {
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(scale, scale);
      const s = 10;
      ctx.beginPath();
      ctx.moveTo(0, s * 0.35);
      ctx.bezierCurveTo(0, -s * 0.4, -s, -s * 0.4, -s, s * 0.15);
      ctx.bezierCurveTo(-s, s * 0.7, 0, s * 1.05, 0, s * 1.35);
      ctx.bezierCurveTo(0, s * 1.05, s, s * 0.7, s, s * 0.15);
      ctx.bezierCurveTo(s, -s * 0.4, 0, -s * 0.4, 0, s * 0.35);
      if (glow) {
        ctx.shadowColor = COLOR.goldBright;
        ctx.shadowBlur = 18;
      }
      ctx.fillStyle = COLOR.gold;
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.restore();
    }

    // ---------------- labels (plain DOM, updated imperatively) ----------------
    stage.querySelectorAll(".root-label").forEach((el) => el.remove());
    labelRefs.current = branches.map((b, i) => {
      const el = document.createElement("div");
      el.className =
        "root-label pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 text-center transition-opacity duration-500";
      el.style.width = "clamp(112px, 30vw, 172px)";
      el.style.left = `${(b.labelPos.x / CW) * 100}%`;
      el.style.top = `${(b.labelPos.y / CH) * 100}%`;
      el.style.opacity = "0";
      el.innerHTML = `
        <div class="root-label-name font-display text-[15px] leading-snug sm:text-base transition-colors duration-500 text-[#f5efe4]/45">${EVENTS[i].title}</div>
        <div class="root-label-time mt-0.5 text-[10.5px] uppercase tracking-[0.14em] transition-colors duration-500 text-[#c9a876]/70">${toLabel(toMinutes(EVENTS[i].start))}</div>
      `;
      stage.appendChild(el);
      return el;
    });

    const reduceMotion =
      typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // One-time entrance: the root draws itself in from the seed down to the
    // base before the live countdown-driven coloring below takes over, same
    // structure and pacing as the "Root Bloom Prototype" concept, just
    // re-timed to this trunk's actual length and event count instead of a
    // fixed six-segment demo. Skipped entirely under reduced motion, same as
    // every other animation on this site.
    let introDone = reduceMotion;
    const introStart = performance.now();
    const introDurationMs = 1800 + n * 70;
    const branchSpanFrac = 500 / introDurationMs;
    const bloomSpanFrac = 400 / introDurationMs;
    const totalIntroMs = introDurationMs + 1200;

    let pulsePhase = 0;

    function draw() {
      const state = computeState();
      if (statusRef.current) statusRef.current.textContent = statusLineFor(state);
      const mins = state.phase === "before" ? -1 : state.minutes;
      const progress = state.phase === "after" ? 1 : Math.max(0, eventFraction(mins));

      // Entrance sweep: 0 (seed only) to 1 (trunk fully grown-in). `rawT`
      // keeps counting past 1 so the last branch — which only starts once
      // the trunk reaches it — still has room to grow its own stem and bloom.
      let growth = 1;
      let rawT = 1;
      if (!introDone) {
        const elapsed = performance.now() - introStart;
        rawT = elapsed / introDurationMs;
        growth = Math.max(0, Math.min(1, rawT));
        if (elapsed >= totalIntroMs) introDone = true;
      }
      const branchGrowT = branches.map((b) =>
        introDone ? 1 : Math.max(0, Math.min(1, (rawT - b.t) / branchSpanFrac))
      );
      const branchBloomT = branches.map((b) =>
        introDone ? 1 : Math.max(0, Math.min(1, (rawT - b.t - branchSpanFrac * 0.7) / bloomSpanFrac))
      );

      ctx.clearRect(0, 0, CW, CH);

      // base (ungrown) trunk, drawn only as far as the entrance has reached
      const trunkDrawPts = introDone ? trunkPts : trunkPts.filter((p) => p.t <= growth);
      strokeTapered(trunkDrawPts, 36, 22, "rgba(201,168,118,0.55)");

      // base (dormant) branches + their forks + hair roots + buds — each
      // sprouts only once the trunk sweep reaches its anchor point
      branches.forEach((b, i) => {
        const gt = branchGrowT[i];
        if (gt <= 0) return;
        strokeTapered(tapedBezierPts(b.origin, b.ctrl, b.end, 16, gt), 13, 5, "rgba(201,168,118,0.48)");
        if (gt < 1) return;
        b.tendrils.forEach((tn) => {
          ctx.beginPath();
          ctx.moveTo(tn.from.x, tn.from.y);
          ctx.lineTo(tn.to.x, tn.to.y);
          ctx.lineWidth = 1.6;
          ctx.strokeStyle = "rgba(228,207,168,0.5)";
          ctx.lineCap = "round";
          ctx.stroke();
        });
        b.forks.forEach((fk) => {
          strokeTapered(tapedBezierPts(fk.origin, fk.ctrl, fk.end, 12), 5, 1.8, "rgba(201,168,118,0.4)");
          fk.tendrils.forEach((tn) => {
            ctx.beginPath();
            ctx.moveTo(tn.from.x, tn.from.y);
            ctx.lineTo(tn.to.x, tn.to.y);
            ctx.lineWidth = 1.2;
            ctx.strokeStyle = "rgba(228,207,168,0.45)";
            ctx.lineCap = "round";
            ctx.stroke();
          });
        });
        drawBud(b.end.x, b.end.y, b.side);
      });
      trunkHairs.forEach((h) => {
        if (h.t > growth) return;
        ctx.beginPath();
        ctx.moveTo(h.from.x, h.from.y);
        ctx.lineTo(h.to.x, h.to.y);
        ctx.lineWidth = 1.4;
        ctx.strokeStyle = "rgba(228,207,168,0.42)";
        ctx.lineCap = "round";
        ctx.stroke();
      });

      // grown (gold) trunk overlay, up to current progress — but never ahead
      // of the entrance sweep, so an already-past event doesn't flash gold
      // before the root has structurally grown down to it
      const visTrunkProgress = introDone ? progress : Math.min(progress, growth);
      const goldPts = trunkPts.filter((p) => p.t <= visTrunkProgress);
      if (goldPts.length > 1) {
        strokeTapered(goldPts, 36, 22 + (36 - 22) * (1 - goldPts[goldPts.length - 1].t), COLOR.gold, COLOR.goldBright);
      }

      // grown branches + open blooms, per the real per-event status — held
      // back until the entrance sweep has structurally reached that branch
      EVENTS.forEach((_, i) => {
        const { status } = statusFor(i, mins);
        if (status === "upcoming") return;
        if (branchGrowT[i] < 1) return;
        const b = branches[i];
        strokeTapered(tapedBezierPts(b.origin, b.ctrl, b.end, 16), 13.5, 5.5, COLOR.gold, "rgba(199,154,58,0.4)");
        b.tendrils.forEach((tn) => {
          ctx.beginPath();
          ctx.moveTo(tn.from.x, tn.from.y);
          ctx.lineTo(tn.to.x, tn.to.y);
          ctx.lineWidth = 1.8;
          ctx.strokeStyle = COLOR.goldBright;
          ctx.lineCap = "round";
          ctx.stroke();
        });
        b.forks.forEach((fk) => {
          strokeTapered(tapedBezierPts(fk.origin, fk.ctrl, fk.end, 12), 5.5, 2, COLOR.gold, "rgba(199,154,58,0.3)");
          fk.tendrils.forEach((tn) => {
            ctx.beginPath();
            ctx.moveTo(tn.from.x, tn.from.y);
            ctx.lineTo(tn.to.x, tn.to.y);
            ctx.lineWidth = 1.4;
            ctx.strokeStyle = COLOR.goldBright;
            ctx.lineCap = "round";
            ctx.stroke();
          });
        });
        const scale = introDone
          ? status === "active"
            ? 1.08
            : 1
          : easeOutBack(Math.max(branchBloomT[i], 0.35));
        drawBloom(b.end.x, b.end.y, scale);
      });

      const seedPt = trunkPointAt(0);
      const sproutScale = introDone ? 1 : easeOutBack(Math.min(1, rawT / 0.1));
      drawSprout(seedPt.x, seedPt.y - 14 * sproutScale);

      if (progress > 0 && (introDone || growth >= progress)) {
        const hp = trunkPointAt(progress);
        const scale = reduceMotion ? 1 : 1 + Math.sin(pulsePhase) * 0.08;
        drawHeart(hp.x, hp.y, scale, true);
      }

      if (progress >= 1 - 1e-6 && growth >= 1) {
        drawBloom(midX, bottomY + 34, 1.7);
      }

      // labels — fade in as the entrance sweep reaches each branch, then
      // stay tied to that event's real past/active/upcoming status
      branches.forEach((_, i) => {
        const el = labelRefs.current[i];
        if (!el) return;
        el.style.opacity = branchGrowT[i] > 0 ? "1" : "0";
        const { status } = statusFor(i, mins);
        const nameEl = el.querySelector(".root-label-name") as HTMLElement;
        const timeEl = el.querySelector(".root-label-time") as HTMLElement;
        if (status === "past") {
          nameEl.className = "root-label-name font-display text-[15px] leading-snug sm:text-base transition-colors duration-500 text-[#f5efe4]/90";
          timeEl.className = "root-label-time mt-0.5 text-[10.5px] uppercase tracking-[0.14em] transition-colors duration-500 text-[#f0c568]";
        } else if (status === "active") {
          nameEl.className = "root-label-name font-display text-[15px] leading-snug sm:text-base transition-colors duration-500 text-[#f0c568]";
          timeEl.className = "root-label-time mt-0.5 text-[10.5px] uppercase tracking-[0.14em] transition-colors duration-500 text-[#f0c568]";
        } else {
          nameEl.className = "root-label-name font-display text-[15px] leading-snug sm:text-base transition-colors duration-500 text-[#f5efe4]/45";
          timeEl.className = "root-label-time mt-0.5 text-[10.5px] uppercase tracking-[0.14em] transition-colors duration-500 text-[#c9a876]/70";
        }
      });
    }

    draw();

    let raf = 0;
    let interval: ReturnType<typeof setInterval> | undefined;
    if (reduceMotion) {
      interval = setInterval(draw, 1000);
    } else {
      const tick = () => {
        pulsePhase += 0.045;
        draw();
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    }

    return () => {
      if (raf) cancelAnimationFrame(raf);
      if (interval) clearInterval(interval);
      stage.querySelectorAll(".root-label").forEach((el) => el.remove());
    };
  }, []);

  return (
    <section
      id="program"
      ref={sectionRef}
      className="relative overflow-hidden bg-[#0e0a06] px-6 py-20 md:px-12 md:py-28"
    >
      <video
        ref={videoRef}
        muted
        loop
        playsInline
        preload="none"
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover opacity-70"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(8,6,4,0.88) 0%, rgba(14,10,6,0.72) 42%, rgba(8,6,4,0.9) 100%)",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(120% 55% at 50% 0%, rgba(255,255,255,0.07), transparent 65%)" }}
      />

      <div className="relative z-10">
        <div className="mx-auto max-w-2xl">
          <div className="mx-auto max-w-lg rounded-3xl border border-white/10 bg-white/[0.05] px-6 py-9 shadow-[0_8px_40px_rgba(0,0,0,0.35)] backdrop-blur-md sm:px-10 sm:py-10">
            <p className="eyebrow mb-4 text-center">22 August 2026</p>
            <h2 className="text-center font-display text-4xl italic leading-tight text-[#f5efe4] sm:text-5xl">
              Reception Program
            </h2>
            <p className="mt-3 text-center text-sm italic text-[#f5efe4]/55">
              Every root remembers where it began
            </p>
            <p
              ref={statusRef}
              className="mx-auto mt-6 min-h-[1.5em] max-w-md text-center font-display text-base italic text-[#f5efe4]/80"
            >
              &nbsp;
            </p>
          </div>
        </div>

        {/* Wider than the text column on its own — the root is the centerpiece,
            so on tablets and up it's given its own generous lane (55% of the
            section, evenly margined) rather than being boxed to reading width. */}
        <div ref={stageRef} className="relative mx-auto mt-10 w-full leading-none md:w-[55vw]">
          <canvas ref={canvasRef} className="block w-full" aria-hidden="true" />
        </div>

        <div className="mx-auto max-w-2xl">
          <p className="mt-8 text-center text-sm text-[#f5efe4]/55">
            Schedule subject to slight changes on the day &mdash; thank you for
            celebrating with us.
          </p>
        </div>
      </div>
    </section>
  );
}
