/** Deterministic contour line geometry for the hero art. No randomness, so builds are stable. */

type P = [number, number];
const r1 = (n: number) => Math.round(n * 10) / 10;

/** Smooth closed path through points (Catmull-Rom converted to cubic curves). */
export function closedPath(pts: P[]): string {
  const n = pts.length;
  let d = `M${r1(pts[0][0])} ${r1(pts[0][1])}`;
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n];
    const p1 = pts[i];
    const p2 = pts[(i + 1) % n];
    const p3 = pts[(i + 2) % n];
    const c1: P = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2: P = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += `C${r1(c1[0])} ${r1(c1[1])} ${r1(c2[0])} ${r1(c2[1])} ${r1(p2[0])} ${r1(p2[1])}`;
  }
  return d + 'Z';
}

type Harmonic = [amp: number, freq: number, phase: number];

export function blob(cx: number, cy: number, rx: number, ry: number, harmonics: Harmonic[], steps = 44): string {
  const pts: P[] = [];
  for (let i = 0; i < steps; i++) {
    const t = (i / steps) * Math.PI * 2;
    const wobble = 1 + harmonics.reduce((s, [a, f, p]) => s + a * Math.sin(f * t + p), 0);
    pts.push([cx + Math.cos(t) * rx * wobble, cy + Math.sin(t) * ry * wobble]);
  }
  return closedPath(pts);
}

export interface Ring {
  d: string;
  /** Every fourth ring is an index contour, drawn heavier like on a topo map. */
  index: boolean;
}

export function summitRings(cx: number, cy: number, count: number): Ring[] {
  return Array.from({ length: count }, (_, k) => {
    const R = 16 + k * 36 + k * k * 1.6;
    return {
      index: k % 4 === 3,
      d: blob(cx, cy, R * 1.3, R * 0.78, [
        [0.09, 2, 0.6 + k * 0.05],
        [0.06, 3, 1.9 - k * 0.04],
        [0.035, 5, 0.3 + k * 0.09],
      ]),
    };
  });
}

export function lakeShape(): string {
  return blob(470, 668, 700, 112, [
    [0.05, 3, 0.4],
    [0.03, 5, 1.2],
  ]);
}

/** Inner outlines of the lake, scaled in toward its center. */
export function lakeOutlines(): string[] {
  return [0.9, 0.78, 0.66].map((s, i) =>
    blob(470, 668, 700 * s, 112 * s, [
      [0.05, 3, 0.4 + i * 0.2],
      [0.03, 5, 1.2 + i * 0.3],
    ]),
  );
}

/** A horizontal wave line that repeats every `period` units, used for ripples. */
export function wave(x0: number, x1: number, y: number, amp: number, period: number): string {
  const half = period / 2;
  const n = Math.ceil((x1 - x0) / half) - 1;
  let d = `M${x0} ${y}q${half / 2} ${-amp} ${half} 0`;
  for (let i = 0; i < n; i++) d += `t${half} 0`;
  return d;
}
