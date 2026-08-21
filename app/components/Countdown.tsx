"use client";

import { useEffect, useState } from "react";

const WEDDING_DATE = new Date(2026, 7, 22, 14, 0, 0);

type TimeLeft = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

function getTimeLeft(): TimeLeft {
  const diff = Math.max(0, WEDDING_DATE.getTime() - Date.now());
  const totalSeconds = Math.floor(diff / 1000);

  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  };
}

const UNITS: { key: keyof TimeLeft; label: string }[] = [
  { key: "days", label: "Days" },
  { key: "hours", label: "Hours" },
  { key: "minutes", label: "Minutes" },
  { key: "seconds", label: "Seconds" },
];

export default function Countdown() {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);

  useEffect(() => {
    setTimeLeft(getTimeLeft());
    const id = setInterval(() => setTimeLeft(getTimeLeft()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="grid grid-cols-4 divide-x divide-line">
      {UNITS.map(({ key, label }) => (
        <div key={key} className="px-2 text-center md:px-6">
          <p className="tabular-nums font-display text-4xl leading-none text-ink sm:text-5xl md:text-6xl">
            {timeLeft ? String(timeLeft[key]).padStart(2, "0") : "--"}
          </p>
          <p className="eyebrow mt-3">{label}</p>
        </div>
      ))}
    </div>
  );
}
