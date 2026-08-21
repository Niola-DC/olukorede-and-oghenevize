import Image from "next/image";
import moment from "../assets/images/white/20260820_110133.jpg";
import Reveal from "./Reveal";

type Note = {
  label: string;
  text: string;
  rotate: string;
  tapeRotate: string;
  desktopPosition: string;
  direction: "left" | "right";
};

const NOTES: Note[] = [
  {
    label: "His Side — 2015",
    text: "“For me, it started in 2015 at the Kingdom Hall.”",
    rotate: "-rotate-2",
    tapeRotate: "-rotate-6",
    desktopPosition: "md:left-0 md:top-6",
    direction: "left",
  },
  {
    label: "Her Side — 2019",
    text: "“For me, it was 2019, after hearing so much about him from Mairo, his brother.”",
    rotate: "rotate-2",
    tapeRotate: "rotate-6",
    desktopPosition: "md:right-0 md:bottom-6",
    direction: "right",
  },
];

export default function OurStory() {
  return (
    <section id="story" className="bg-cream px-6 py-14 md:px-12 md:py-28">
      <Reveal direction="up" className="mx-auto max-w-2xl text-center">
        <p className="eyebrow mb-4">The Beginning</p>
        <h2 className="font-display text-4xl italic leading-tight sm:text-5xl">
          Our Story
        </h2>
        <p className="mt-3 font-display text-lg italic text-ink/60">
          How We Met
        </p>
      </Reveal>

      <div className="relative mx-auto mt-16 max-w-3xl md:mt-24 md:min-h-[30rem]">
        <Reveal direction="up" className="relative mx-auto aspect-[4/5] w-full max-w-sm">
          <div className="absolute -right-4 -top-4 h-full w-full bg-tan md:-right-6 md:-top-6" />
          <div className="relative h-full w-full">
            <Image
              src={moment}
              alt="Olukorede lifting Oghenevize into a kiss"
              fill
              sizes="(min-width: 768px) 24rem, 80vw"
              className="object-cover object-[50%_30%]"
            />
          </div>
        </Reveal>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 md:mt-0 md:block md:gap-0">
          {NOTES.map((note) => (
            <Reveal
              key={note.label}
              direction={note.direction}
              className={`relative border border-ink bg-cream-deep px-6 py-5 shadow-[0_10px_24px_rgba(28,26,23,0.12)] md:absolute md:w-64 ${note.rotate} ${note.desktopPosition}`}
            >
              <span
                aria-hidden
                className={`absolute -top-3 left-1/2 h-5 w-14 -translate-x-1/2 bg-tan/70 ${note.tapeRotate}`}
              />
              <p className="eyebrow mb-2">{note.label}</p>
              <p className="font-display text-base italic leading-snug text-ink/85">
                {note.text}
              </p>
            </Reveal>
          ))}
        </div>
      </div>

      <Reveal direction="up" className="mx-auto mt-16 max-w-md text-center md:mt-20">
        <p className="font-display text-xl italic leading-snug text-ink/85 sm:text-2xl">
          We stayed friends for three years. And somehow, those two
          timelines eventually met. <span aria-hidden="true">❤️</span>
        </p>
      </Reveal>
    </section>
  );
}
