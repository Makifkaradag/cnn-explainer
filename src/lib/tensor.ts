import type { Matrix, Range, Tensor3 } from '@/types';

export function zeros(rows: number, cols: number, value = 0): Matrix {
  return Array.from({ length: rows }, () => new Array<number>(cols).fill(value));
}

export function mapMatrix(
  m: Matrix,
  fn: (value: number, row: number, col: number) => number,
): Matrix {
  return m.map((row, r) => row.map((v, c) => fn(v, r, c)));
}

export function cloneMatrix(m: Matrix): Matrix {
  return m.map((row) => row.slice());
}

/** Surround a matrix with `padding` rows/cols of `value` (zero padding by default). */
export function padMatrix(m: Matrix, padding: number, value = 0): Matrix {
  if (padding <= 0) return cloneMatrix(m);
  const rows = m.length;
  const cols = m[0]?.length ?? 0;
  const out = zeros(rows + 2 * padding, cols + 2 * padding, value);
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) out[r + padding][c + padding] = m[r][c];
  }
  return out;
}

function isMatrix(value: Matrix | Tensor3): value is Matrix {
  return value.length === 0 || !Array.isArray(value[0]?.[0]);
}

export function matrixRange(m: Matrix | Tensor3): Range {
  let min = Infinity;
  let max = -Infinity;
  const visit = (row: number[]) => {
    for (const v of row) {
      if (v < min) min = v;
      if (v > max) max = v;
    }
  };
  if (isMatrix(m)) m.forEach(visit);
  else m.forEach((channel) => channel.forEach(visit));
  return min === Infinity ? { min: 0, max: 0 } : { min, max };
}

/** Largest absolute value — handy for symmetric (diverging) colour scales. */
export function maxAbs(m: Matrix | Tensor3): number {
  const { min, max } = matrixRange(m);
  return Math.max(Math.abs(min), Math.abs(max));
}

/** Flatten channels-first: all of channel 0 row by row, then channel 1, ... */
export function flatten(t: Tensor3): number[] {
  const out: number[] = [];
  for (const channel of t) for (const row of channel) for (const v of row) out.push(v);
  return out;
}

/** Shape in the familiar H×W×C order used by Keras / TensorFlow summaries. */
export function tensorShape(t: Tensor3): [height: number, width: number, channels: number] {
  return [t[0]?.length ?? 0, t[0]?.[0]?.length ?? 0, t.length];
}

export function formatShape(shape: readonly number[]): string {
  return shape.join('×');
}

export function round(value: number, digits = 2): number {
  const f = 10 ** digits;
  return Math.round(value * f) / f;
}

/** Compact number formatting for cell labels: 0.5 → "0.5", -1.234 → "-1.23", 12.6 → "12.6". */
export function fmt(value: number, digits = 2): string {
  if (!Number.isFinite(value)) return String(value);
  if (Math.abs(value) < 10 ** -digits / 2) return '0';
  if (Math.abs(value) >= 100) return value.toFixed(0);
  if (Math.abs(value) >= 10) return String(round(value, 1));
  return String(round(value, digits));
}
