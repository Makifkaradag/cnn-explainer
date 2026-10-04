/**
 * A deliberately tiny CNN used throughout the app:
 *
 *   28×28×1 → Conv 3×3 (8) → act → MaxPool 2 → Conv 3×3 (16) → act → MaxPool 2 → Flatten (400)
 *           → Dense (4) → Softmax
 *
 * Honesty notes (also surfaced in the UI):
 * - Conv layer 1 uses hand-designed edge filters, chosen so the feature maps are easy to read.
 * - Conv layer 2 uses random (seeded, He-initialised) weights that are never trained.
 * - Only the final Dense layer is trained — in the browser, on synthetic shape drawings.
 * A real CNN learns *all* of these weights with backpropagation.
 */
import { makeKernel } from '@/data/kernels';
import type { ActivationName, ConvWeights, Matrix, PoolMode, Tensor3 } from '@/types';
import { activateTensor } from './activations';
import { conv2d, convParamCount } from './convolution';
import { poolTensor } from './pooling';
import { createRng, gaussian } from './random';
import { softmax } from './softmax';
import { flatten } from './tensor';

export const CLASS_NAMES = ['Circle', 'Square', 'Triangle', 'Cross'] as const;
export const INPUT_SIZE = 28;

export interface NamedFilter {
  name: string;
  kernel: Matrix;
}

const neg = (m: Matrix) => m.map((row) => row.map((v) => -v + 0));

export const CONV1_FILTERS: NamedFilter[] = [
  { name: 'Vertical edge (dark → light)', kernel: makeKernel('vertical', 3) },
  { name: 'Vertical edge (light → dark)', kernel: neg(makeKernel('vertical', 3)) },
  { name: 'Horizontal edge (dark → light)', kernel: makeKernel('horizontal', 3) },
  { name: 'Horizontal edge (light → dark)', kernel: neg(makeKernel('horizontal', 3)) },
  { name: 'Diagonal edge ↘', kernel: makeKernel('diagonal', 3) },
  { name: 'Diagonal edge ↗', kernel: makeKernel('antiDiagonal', 3) },
  { name: 'Outline (Laplacian)', kernel: makeKernel('edge', 3) },
  { name: 'Blur (local average)', kernel: makeKernel('blur', 3) },
];

const CONV2_FILTERS = 16;

function randomConvWeights(outC: number, inC: number, k: number, seed: number): ConvWeights {
  const rng = createRng(seed);
  const std = Math.sqrt(2 / (inC * k * k)); // He initialisation
  return Array.from({ length: outC }, () =>
    Array.from({ length: inC }, () =>
      Array.from({ length: k }, () => Array.from({ length: k }, () => gaussian(rng) * std)),
    ),
  );
}

export const CONV2_WEIGHTS = randomConvWeights(CONV2_FILTERS, CONV1_FILTERS.length, 3, 7);

export interface NetworkOptions {
  activation?: ActivationName;
  poolMode?: PoolMode;
  /** Replaces filter #1 of the first conv layer with a user-chosen 3×3 kernel. */
  customKernel?: Matrix;
}

export interface FeatureResult {
  input: Matrix;
  conv1: Tensor3;
  act1: Tensor3;
  pool1: Tensor3;
  conv2: Tensor3;
  act2: Tensor3;
  pool2: Tensor3;
  flat: number[];
}

export interface ForwardResult extends FeatureResult {
  logits: number[];
  probs: number[];
}

export function conv1Weights(customKernel?: Matrix): ConvWeights {
  return CONV1_FILTERS.map((f, i) => [i === 0 && customKernel ? customKernel : f.kernel]);
}

/** Everything up to (and including) Flatten. */
export function extractFeatures(image: Matrix, options: NetworkOptions = {}): FeatureResult {
  const { activation = 'relu', poolMode = 'max', customKernel } = options;
  const pool = { size: 2, stride: 2, mode: poolMode } as const;
  const conv1 = conv2d(
    [image],
    conv1Weights(customKernel),
    new Array(CONV1_FILTERS.length).fill(0),
  );
  const act1 = activateTensor(conv1, activation);
  const pool1 = poolTensor(act1, pool);
  const conv2 = conv2d(pool1, CONV2_WEIGHTS, new Array(CONV2_FILTERS).fill(0));
  const act2 = activateTensor(conv2, activation);
  const pool2 = poolTensor(act2, pool);
  return { input: image, conv1, act1, pool1, conv2, act2, pool2, flat: flatten(pool2) };
}

export interface DenseParams {
  /** weights[class][feature] */
  W: number[][];
  b: number[];
}

export function denseForward({ W, b }: DenseParams, x: number[]): number[] {
  return W.map((row, k) => {
    let z = b[k];
    for (let i = 0; i < row.length; i++) z += row[i] * x[i];
    return z;
  });
}

export function forward(
  image: Matrix,
  dense: DenseParams,
  options: NetworkOptions = {},
): ForwardResult {
  const features = extractFeatures(image, options);
  const logits = denseForward(dense, features.flat);
  return { ...features, logits, probs: softmax(logits) };
}

export type LayerKind = 'input' | 'conv' | 'activation' | 'pool' | 'flatten' | 'dense' | 'softmax';

export interface LayerSpec {
  id: keyof ForwardResult;
  name: string;
  kind: LayerKind;
  shapeIn: number[];
  shapeOut: number[];
  params: number;
  /** One-line description of the operation. */
  op: string;
  /** Short explanation shown in the architecture inspector. */
  explain: string;
}

const C1 = CONV1_FILTERS.length;
const C2 = CONV2_FILTERS;

export const LAYERS: LayerSpec[] = [
  {
    id: 'input',
    name: 'Input',
    kind: 'input',
    shapeIn: [28, 28, 1],
    shapeOut: [28, 28, 1],
    params: 0,
    op: 'Grayscale image',
    explain:
      'A 28×28 grid of brightness values in [0, 1]. One channel because the image is grayscale (a colour image would have 3).',
  },
  {
    id: 'conv1',
    name: 'Conv2D',
    kind: 'conv',
    shapeIn: [28, 28, 1],
    shapeOut: [26, 26, C1],
    params: convParamCount(3, 1, C1),
    op: `${C1} filters · 3×3 · stride 1 · no padding`,
    explain: `Each of the ${C1} filters slides over the image and produces its own feature map. Without padding, a 3×3 window fits 26 times across 28 pixels.`,
  },
  {
    id: 'act1',
    name: 'ReLU',
    kind: 'activation',
    shapeIn: [26, 26, C1],
    shapeOut: [26, 26, C1],
    params: 0,
    op: 'max(0, x) element-wise',
    explain:
      'Applied to every value independently, so the shape is unchanged. Negative responses are clipped to 0.',
  },
  {
    id: 'pool1',
    name: 'MaxPool',
    kind: 'pool',
    shapeIn: [26, 26, C1],
    shapeOut: [13, 13, C1],
    params: 0,
    op: '2×2 window · stride 2',
    explain:
      'Keeps the strongest response in each 2×2 block, halving width and height. Each channel is pooled separately.',
  },
  {
    id: 'conv2',
    name: 'Conv2D',
    kind: 'conv',
    shapeIn: [13, 13, C1],
    shapeOut: [11, 11, C2],
    params: convParamCount(3, C1, C2),
    op: `${C2} filters · 3×3×${C1} · stride 1`,
    explain: `Every filter now spans all ${C1} input channels (3×3×${C1} weights), so it can combine edges into more complex patterns.`,
  },
  {
    id: 'act2',
    name: 'ReLU',
    kind: 'activation',
    shapeIn: [11, 11, C2],
    shapeOut: [11, 11, C2],
    params: 0,
    op: 'max(0, x) element-wise',
    explain:
      'Same non-linearity as before. Without it, stacked convolutions would collapse into a single linear operation.',
  },
  {
    id: 'pool2',
    name: 'MaxPool',
    kind: 'pool',
    shapeIn: [11, 11, C2],
    shapeOut: [5, 5, C2],
    params: 0,
    op: '2×2 window · stride 2',
    explain:
      '11 is odd, so the last row and column do not fit a full window and are dropped: ⌊(11 − 2) / 2⌋ + 1 = 5.',
  },
  {
    id: 'flat',
    name: 'Flatten',
    kind: 'flatten',
    shapeIn: [5, 5, C2],
    shapeOut: [5 * 5 * C2],
    params: 0,
    op: 'Reshape to a vector',
    explain: `No computation — the ${C2} maps of 5×5 are laid out end to end as a list of ${5 * 5 * C2} numbers.`,
  },
  {
    id: 'logits',
    name: 'Dense',
    kind: 'dense',
    shapeIn: [5 * 5 * C2],
    shapeOut: [CLASS_NAMES.length],
    params: (5 * 5 * C2 + 1) * CLASS_NAMES.length,
    op: `${CLASS_NAMES.length} neurons, fully connected`,
    explain: `Each output neuron computes a weighted sum of all ${5 * 5 * C2} inputs plus a bias. The results are called logits.`,
  },
  {
    id: 'probs',
    name: 'Softmax',
    kind: 'softmax',
    shapeIn: [CLASS_NAMES.length],
    shapeOut: [CLASS_NAMES.length],
    params: 0,
    op: 'exp(zᵢ) / Σ exp(zⱼ)',
    explain: 'Turns the logits into probabilities that are positive and sum to 1.',
  },
];

export const TOTAL_PARAMS = LAYERS.reduce((sum, l) => sum + l.params, 0);
