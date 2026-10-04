import type { Matrix } from '@/types';

/** Rec. 601 luma — the classic RGB → grayscale conversion. */
export const luminance = (r: number, g: number, b: number) =>
  (0.299 * r + 0.587 * g + 0.114 * b) / 255;

export function loadImage(file: File): Promise<{ image: HTMLImageElement; url: string }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => resolve({ image, url });
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Could not read this file as an image.'));
    };
    image.src = url;
  });
}

/**
 * Converts any image to a size×size grayscale matrix in [0, 1]:
 * centre-crop to a square → downsample → luminance → stretch contrast.
 * The demo network expects bright strokes on a dark background (like MNIST),
 * so images that are mostly bright are inverted.
 */
export function imageToMatrix(
  source: CanvasImageSource,
  width: number,
  height: number,
  size = 28,
): { matrix: Matrix; inverted: boolean } {
  const side = Math.min(width, height);
  const sx = (width - side) / 2;
  const sy = (height - side) / 2;

  // Downsample in two passes so large photos do not alias badly.
  const mid = document.createElement('canvas');
  mid.width = mid.height = size * 4;
  const midCtx = mid.getContext('2d')!;
  midCtx.imageSmoothingQuality = 'high';
  midCtx.drawImage(source, sx, sy, side, side, 0, 0, mid.width, mid.height);

  const small = document.createElement('canvas');
  small.width = small.height = size;
  const ctx = small.getContext('2d', { willReadFrequently: true })!;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(mid, 0, 0, size, size);
  const { data } = ctx.getImageData(0, 0, size, size);

  const values: number[] = [];
  for (let i = 0; i < data.length; i += 4) {
    // Treat transparent pixels as white paper.
    const a = data[i + 3] / 255;
    const l = luminance(data[i], data[i + 1], data[i + 2]);
    values.push(l * a + (1 - a));
  }
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  let stretched = values.map((v) => (v - min) / span);
  const mean = stretched.reduce((a, b) => a + b, 0) / stretched.length;
  const inverted = mean > 0.5;
  if (inverted) stretched = stretched.map((v) => 1 - v);

  const matrix: Matrix = [];
  for (let r = 0; r < size; r++) matrix.push(stretched.slice(r * size, (r + 1) * size));
  return { matrix, inverted };
}
