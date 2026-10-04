import type { ConvWeights, Matrix, Tensor3 } from '@/types';
import { zeros } from './tensor';

export interface ConvOptions {
  stride?: number;
  padding?: number;
  bias?: number;
}

/** Output size of a convolution along one axis: ⌊(n + 2p − k) / s⌋ + 1. */
export function convOutputSize(inputSize: number, kernelSize: number, stride = 1, padding = 0) {
  return Math.max(0, Math.floor((inputSize + 2 * padding - kernelSize) / stride) + 1);
}

export interface ConvStep {
  /** Top-left corner of the window, in un-padded input coordinates (may be negative). */
  top: number;
  left: number;
  /** Input values under the kernel (zeros where the window hangs over the padding). */
  patch: Matrix;
  /** True where the patch value comes from zero padding rather than the image. */
  isPadding: boolean[][];
  /** Element-wise products patch × kernel. */
  products: Matrix;
  /** Sum of the products (before bias). */
  sum: number;
  /** sum + bias — the value written into the feature map. */
  output: number;
}

/**
 * The full calculation for a single output pixel. Like every deep-learning library,
 * this is technically a cross-correlation: the kernel is not flipped.
 */
export function convolutionStep(
  input: Matrix,
  kernel: Matrix,
  outRow: number,
  outCol: number,
  { stride = 1, padding = 0, bias = 0 }: ConvOptions = {},
): ConvStep {
  const k = kernel.length;
  const rows = input.length;
  const cols = input[0]?.length ?? 0;
  const top = outRow * stride - padding;
  const left = outCol * stride - padding;
  const patch = zeros(k, k);
  const products = zeros(k, k);
  const isPadding = Array.from({ length: k }, () => new Array<boolean>(k).fill(false));
  let sum = 0;
  for (let m = 0; m < k; m++) {
    for (let n = 0; n < k; n++) {
      const r = top + m;
      const c = left + n;
      const inside = r >= 0 && r < rows && c >= 0 && c < cols;
      const x = inside ? input[r][c] : 0;
      patch[m][n] = x;
      isPadding[m][n] = !inside;
      products[m][n] = x * kernel[m][n];
      sum += products[m][n];
    }
  }
  return { top, left, patch, isPadding, products, sum, output: sum + bias };
}

/** 2-D convolution (cross-correlation) of a single-channel input with one kernel. */
export function convolve2d(input: Matrix, kernel: Matrix, options: ConvOptions = {}): Matrix {
  const { stride = 1, padding = 0, bias = 0 } = options;
  const k = kernel.length;
  const rows = input.length;
  const cols = input[0]?.length ?? 0;
  const outRows = convOutputSize(rows, k, stride, padding);
  const outCols = convOutputSize(cols, k, stride, padding);
  const out = zeros(outRows, outCols);
  for (let i = 0; i < outRows; i++) {
    for (let j = 0; j < outCols; j++) {
      let sum = bias;
      const top = i * stride - padding;
      const left = j * stride - padding;
      for (let m = 0; m < k; m++) {
        const r = top + m;
        if (r < 0 || r >= rows) continue;
        const inRow = input[r];
        const kRow = kernel[m];
        for (let n = 0; n < k; n++) {
          const c = left + n;
          if (c >= 0 && c < cols) sum += inRow[c] * kRow[n];
        }
      }
      out[i][j] = sum;
    }
  }
  return out;
}

/**
 * Multi-channel convolution, as in a Conv2D layer: every output channel sums the
 * convolutions of *all* input channels with its own 3-D filter, then adds a bias.
 */
export function conv2d(
  input: Tensor3,
  weights: ConvWeights,
  biases: number[],
  options: Omit<ConvOptions, 'bias'> = {},
): Tensor3 {
  return weights.map((filter, o) => {
    const maps = filter.map((kernel, c) => convolve2d(input[c], kernel, options));
    const out = zeros(maps[0]?.length ?? 0, maps[0]?.[0]?.length ?? 0, biases[o] ?? 0);
    for (const map of maps) {
      for (let r = 0; r < map.length; r++) {
        for (let q = 0; q < map[r].length; q++) out[r][q] += map[r][q];
      }
    }
    return out;
  });
}

/** Learnable parameters of a Conv2D layer: k·k·C_in weights per filter plus one bias each. */
export function convParamCount(kernelSize: number, inChannels: number, outChannels: number) {
  return (kernelSize * kernelSize * inChannels + 1) * outChannels;
}
