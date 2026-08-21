// A smooth scalloped edge (cosine wave sampled into a clip-path polygon)
// rather than a sharp zigzag — reads as a soft rolling cut instead of a
// sawtooth. `waves` is the number of full up/down cycles across the width;
// `samplesPerWave` controls how rounded each cycle looks.
export function tornEdgeClipPath(waves: number, samplesPerWave = 12): string {
  const totalSamples = waves * samplesPerWave;
  const points: string[] = [];

  for (let i = 0; i <= totalSamples; i++) {
    const x = (i / totalSamples) * 100;
    const phase = (i / samplesPerWave) * Math.PI * 2;
    const y = (1 - Math.cos(phase)) * 50;
    points.push(`${x}% ${y}%`);
  }

  points.push("100% 100%", "0% 100%");

  return `polygon(${points.join(", ")})`;
}
