import type { Matrix } from '@/types';

export type KernelPresetId =
  | 'identity'
  | 'edge'
  | 'vertical'
  | 'horizontal'
  | 'diagonal'
  | 'antiDiagonal'
  | 'sharpen'
  | 'blur'
  | 'texture';

/** Preset order shown in menus. Display names live in the i18n dictionaries. */
export const KERNEL_PRESETS: KernelPresetId[] = [
  'edge',
  'vertical',
  'horizontal',
  'diagonal',
  'antiDiagonal',
  'sharpen',
  'blur',
  'texture',
  'identity',
];

export const KERNEL_SIZES = [3, 5] as const;

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

function build(size: number, fn: (i: number, j: number, c: number) => number): Matrix {
  const c = (size - 1) / 2;
  return Array.from({ length: size }, (_, i) =>
    Array.from({ length: size }, (_, j) => fn(i, j, c) + 0),
  );
}

/** Builds an odd-sized kernel for a preset. 3×3 versions match the textbook kernels (e.g. Sobel). */
export function makeKernel(id: KernelPresetId, size: number): Matrix {
  switch (id) {
    case 'identity':
      return build(size, (i, j, c) => (i === c && j === c ? 1 : 0));
    case 'edge':
      return build(size, (i, j, c) => (i === c && j === c ? size * size - 1 : -1));
    case 'vertical':
      // Sobel-x generalised: sign of the horizontal offset, weighted more in the middle rows.
      return build(size, (i, j, c) => Math.sign(j - c) * (Math.abs(i - c) === c ? 1 : 2));
    case 'horizontal':
      return build(size, (i, j, c) => Math.sign(i - c) * (Math.abs(j - c) === c ? 1 : 2));
    case 'diagonal':
      return build(size, (i, j) => clamp(j - i, -2, 2));
    case 'antiDiagonal':
      return build(size, (i, j) => clamp(i + j - (size - 1), -2, 2));
    case 'sharpen':
      return build(size, (i, j, c) => {
        if (i === c && j === c) return 1 + 2 * (size - 1);
        return i === c || j === c ? -1 : 0;
      });
    case 'blur':
      return build(size, () => 1 / (size * size));
    case 'texture':
      return build(size, (i, j) => ((i + j) % 2 === 0 ? 1 : -1));
  }
}
