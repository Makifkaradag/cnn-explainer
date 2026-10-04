import type { ActivationName, Matrix, Tensor3 } from '@/types';

export const LEAKY_RELU_SLOPE = 0.1;

export interface ActivationInfo {
  name: ActivationName;
  label: string;
  formula: string;
  summary: string;
  fn: (x: number) => number;
  /** y-range used when plotting the function over x ∈ [−3, 3]. */
  plotRange: [number, number];
}

export const ACTIVATIONS: Record<ActivationName, ActivationInfo> = {
  relu: {
    name: 'relu',
    label: 'ReLU',
    formula: 'f(x) = max(0, x)',
    summary: 'Negatives become 0, positives pass through unchanged.',
    fn: (x) => (x > 0 ? x : 0),
    plotRange: [-1, 3],
  },
  leakyRelu: {
    name: 'leakyRelu',
    label: 'Leaky ReLU',
    formula: `f(x) = x if x > 0, else ${LEAKY_RELU_SLOPE}x`,
    summary: 'Like ReLU, but negatives keep a small slope instead of becoming 0.',
    fn: (x) => (x > 0 ? x : LEAKY_RELU_SLOPE * x),
    plotRange: [-1, 3],
  },
  sigmoid: {
    name: 'sigmoid',
    label: 'Sigmoid',
    formula: 'f(x) = 1 / (1 + e⁻ˣ)',
    summary: 'Squashes any value into the range (0, 1).',
    fn: (x) => 1 / (1 + Math.exp(-x)),
    plotRange: [-0.25, 1.25],
  },
  tanh: {
    name: 'tanh',
    label: 'Tanh',
    formula: 'f(x) = tanh(x)',
    summary: 'Squashes any value into (−1, 1), centred at zero.',
    fn: (x) => Math.tanh(x),
    plotRange: [-1.25, 1.25],
  },
};

export const ACTIVATION_NAMES = Object.keys(ACTIVATIONS) as ActivationName[];

export const relu = ACTIVATIONS.relu.fn;

export function activate(m: Matrix, name: ActivationName): Matrix {
  const fn = ACTIVATIONS[name].fn;
  return m.map((row) => row.map(fn));
}

export function activateTensor(t: Tensor3, name: ActivationName): Tensor3 {
  return t.map((m) => activate(m, name));
}
