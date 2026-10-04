/**
 * Colour scales for drawing matrices on <canvas>. Values mirror the CSS tokens in index.css.
 *  - gray:      image intensities, 0 → black, 1 → white
 *  - diverging: feature maps, negative → blue, 0 → background, positive → orange
 */
export type RGB = [number, number, number];
export type Theme = 'light' | 'dark';
export type ColorScale = 'gray' | 'diverging';

interface Palette {
  neutral: RGB;
  empty: RGB;
  padding: RGB;
  pos: RGB;
  neg: RGB;
  grid: string;
}

export const PALETTES: Record<Theme, Palette> = {
  light: {
    neutral: [250, 250, 248],
    empty: [239, 239, 236],
    padding: [228, 228, 224],
    pos: [234, 88, 12],
    neg: [37, 99, 235],
    grid: 'rgba(0,0,0,0.07)',
  },
  dark: {
    neutral: [24, 24, 28],
    empty: [32, 32, 37],
    padding: [44, 44, 51],
    pos: [251, 146, 60],
    neg: [96, 165, 250],
    grid: 'rgba(255,255,255,0.06)',
  },
};

const mix = (a: RGB, b: RGB, t: number): RGB => [
  Math.round(a[0] + (b[0] - a[0]) * t),
  Math.round(a[1] + (b[1] - a[1]) * t),
  Math.round(a[2] + (b[2] - a[2]) * t),
];

/**
 * @param range for `gray`: the value mapped to white (black is 0);
 *              for `diverging`: the absolute value mapped to full colour.
 */
export function valueColor(value: number, scale: ColorScale, range: number, theme: Theme): RGB {
  const palette = PALETTES[theme];
  const safe = range > 1e-9 ? range : 1;
  if (scale === 'gray') {
    const g = Math.round(255 * Math.max(0, Math.min(1, value / safe)));
    return [g, g, g];
  }
  const t = Math.max(-1, Math.min(1, value / safe));
  // A mild gamma keeps small-but-nonzero responses visible.
  return mix(palette.neutral, t >= 0 ? palette.pos : palette.neg, Math.abs(t) ** 0.75);
}

export const css = ([r, g, b]: RGB, alpha = 1) =>
  alpha === 1 ? `rgb(${r} ${g} ${b})` : `rgb(${r} ${g} ${b} / ${alpha})`;

/** Black or white text, whichever reads better on the given background. */
export function textOn([r, g, b]: RGB): string {
  return 0.299 * r + 0.587 * g + 0.114 * b > 150 ? '#18181b' : '#fafafa';
}
