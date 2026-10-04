import type { Matrix, PoolMode, Tensor3 } from '@/types';
import { zeros } from './tensor';

export interface PoolOptions {
  size: number;
  stride?: number;
  mode: PoolMode;
}

/** Output size of a pooling layer along one axis (no padding): ⌊(n − size) / stride⌋ + 1. */
export function poolOutputSize(inputSize: number, size: number, stride = size) {
  return Math.max(0, Math.floor((inputSize - size) / stride) + 1);
}

export interface PoolStep {
  top: number;
  left: number;
  values: Matrix;
  result: number;
  /** Position of the maximum inside the window (also reported for average pooling). */
  argmax: [row: number, col: number];
}

export function poolingStep(
  input: Matrix,
  outRow: number,
  outCol: number,
  options: PoolOptions,
): PoolStep {
  const { size, mode } = options;
  const stride = options.stride ?? size;
  const top = outRow * stride;
  const left = outCol * stride;
  const values = zeros(size, size);
  let max = -Infinity;
  let sum = 0;
  let argmax: [number, number] = [0, 0];
  for (let m = 0; m < size; m++) {
    for (let n = 0; n < size; n++) {
      const v = input[top + m]?.[left + n] ?? 0;
      values[m][n] = v;
      sum += v;
      if (v > max) {
        max = v;
        argmax = [m, n];
      }
    }
  }
  return { top, left, values, argmax, result: mode === 'max' ? max : sum / (size * size) };
}

export function pool2d(input: Matrix, options: PoolOptions): Matrix {
  const stride = options.stride ?? options.size;
  const rows = poolOutputSize(input.length, options.size, stride);
  const cols = poolOutputSize(input[0]?.length ?? 0, options.size, stride);
  const out = zeros(rows, cols);
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) out[i][j] = poolingStep(input, i, j, options).result;
  }
  return out;
}

/** Pooling acts on every channel independently — the channel count never changes. */
export function poolTensor(input: Tensor3, options: PoolOptions): Tensor3 {
  return input.map((channel) => pool2d(channel, options));
}
