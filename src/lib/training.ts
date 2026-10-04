/**
 * Training utilities for the final Dense layer of the tiny CNN.
 * This is genuine mini-batch gradient descent on softmax cross-entropy; the convolutional
 * layers stay frozen, which keeps it fast enough to run live in the browser.
 */
import type { Matrix } from '@/types';
import { CLASS_NAMES, type DenseParams, denseForward, extractFeatures } from './network';
import { createRng, gaussian, shuffle, uniform } from './random';
import { Raster, rotate, type Point } from './raster';
import { argmax, crossEntropy, softmax } from './softmax';

export interface Sample {
  image: Matrix;
  label: number;
  /** Flattened pool2 features, already divided by the dataset feature scale. */
  x: number[];
}

/** Draws one randomised training example of the given class. */
export function drawShape(label: number, rng: () => number): Matrix {
  const raster = new Raster(28);
  const cx = 14 + uniform(rng, -2.5, 2.5);
  const cy = 14 + uniform(rng, -2.5, 2.5);
  const r = uniform(rng, 6, 9.5);
  const width = uniform(rng, 1.8, 3.2);
  const angle = uniform(rng, -0.3, 0.3);
  const c: Point = [cx, cy];
  const at = (dx: number, dy: number) => rotate([cx + dx, cy + dy], c, angle);
  switch (CLASS_NAMES[label]) {
    case 'Circle':
      raster.circle(cx, cy, r, width);
      break;
    case 'Square':
      raster.polyline([at(-r, -r), at(r, -r), at(r, r), at(-r, r)], width, true);
      break;
    case 'Triangle': {
      const R = r * 1.2;
      const pts = [-90, 30, 150].map((deg) => {
        const a = (deg * Math.PI) / 180;
        return at(R * Math.cos(a), R * Math.sin(a) + r * 0.15);
      });
      raster.polyline(pts, width, true);
      break;
    }
    case 'Cross': {
      const L = r * 1.1;
      raster.line(at(0, -L), at(0, L), width).line(at(-L, 0), at(L, 0), width);
      break;
    }
  }
  return raster.data.map((row) =>
    row.map((v) => Math.min(1, Math.max(0, v + gaussian(rng) * 0.03))),
  );
}

export interface Dataset {
  train: Sample[];
  validation: Sample[];
  /** Raw features are divided by this so they sit roughly in [0, 1]. */
  featureScale: number;
}

export function generateDataset(trainPerClass: number, valPerClass: number, seed: number): Dataset {
  const rng = createRng(seed);
  const raw: { image: Matrix; label: number; flat: number[] }[] = [];
  for (let i = 0; i < trainPerClass + valPerClass; i++) {
    for (let label = 0; label < CLASS_NAMES.length; label++) {
      const image = drawShape(label, rng);
      raw.push({ image, label, flat: extractFeatures(image).flat });
    }
  }
  let featureScale = 0;
  for (const s of raw) for (const v of s.flat) if (v > featureScale) featureScale = v;
  featureScale ||= 1;
  const samples = raw.map(({ image, label, flat }) => ({
    image,
    label,
    x: flat.map((v) => v / featureScale),
  }));
  const split = trainPerClass * CLASS_NAMES.length;
  return {
    train: shuffle(samples.slice(0, split), rng),
    validation: samples.slice(split),
    featureScale,
  };
}

export function initDense(nIn: number, nOut: number, rng: () => number, std = 0.01): DenseParams {
  return {
    W: Array.from({ length: nOut }, () => Array.from({ length: nIn }, () => gaussian(rng) * std)),
    b: new Array(nOut).fill(0),
  };
}

export interface StepResult {
  params: DenseParams;
  loss: number;
  accuracy: number;
  /** Gradient of the loss w.r.t. W, averaged over the batch. */
  gradW: number[][];
}

/**
 * One gradient-descent step. For softmax + cross-entropy the gradient of the loss
 * with respect to the logits is simply (p − y), which makes backprop here very short.
 */
export function trainStep(
  params: DenseParams,
  batch: Sample[],
  learningRate: number,
  l2 = 1e-4,
): StepResult {
  const nOut = params.W.length;
  const nIn = params.W[0].length;
  const gradW = Array.from({ length: nOut }, () => new Array<number>(nIn).fill(0));
  const gradB = new Array<number>(nOut).fill(0);
  let loss = 0;
  let correct = 0;
  for (const { x, label } of batch) {
    const probs = softmax(denseForward(params, x));
    loss += crossEntropy(probs, label);
    if (argmax(probs) === label) correct++;
    for (let k = 0; k < nOut; k++) {
      const delta = probs[k] - (k === label ? 1 : 0);
      gradB[k] += delta;
      const row = gradW[k];
      for (let i = 0; i < nIn; i++) row[i] += delta * x[i];
    }
  }
  const n = batch.length;
  for (let k = 0; k < nOut; k++) {
    gradB[k] /= n;
    for (let i = 0; i < nIn; i++) gradW[k][i] = gradW[k][i] / n + l2 * params.W[k][i];
  }
  return {
    params: {
      W: params.W.map((row, k) => row.map((w, i) => w - learningRate * gradW[k][i])),
      b: params.b.map((b, k) => b - learningRate * gradB[k]),
    },
    loss: loss / n,
    accuracy: correct / n,
    gradW,
  };
}

export function evaluate(params: DenseParams, samples: Sample[]) {
  let loss = 0;
  let correct = 0;
  for (const { x, label } of samples) {
    const probs = softmax(denseForward(params, x));
    loss += crossEntropy(probs, label);
    if (argmax(probs) === label) correct++;
  }
  return { loss: loss / samples.length, accuracy: correct / samples.length };
}

export interface TrainedModel {
  dense: DenseParams;
  trainAccuracy: number;
  validationAccuracy: number;
}

let cached: TrainedModel | null = null;

/**
 * Fits the Dense layer once (deterministically) and caches it. The learned weights are
 * divided by the feature scale so the model accepts raw (unscaled) flattened features.
 */
export function getTrainedModel(): TrainedModel {
  if (cached) return cached;
  const data = generateDataset(30, 10, 2024);
  let params = initDense(data.train[0].x.length, CLASS_NAMES.length, createRng(1));
  for (let i = 0; i < 400; i++) params = trainStep(params, data.train, 1.5).params;
  cached = {
    dense: {
      W: params.W.map((row) => row.map((w) => w / data.featureScale)),
      b: params.b.slice(),
    },
    trainAccuracy: evaluate(params, data.train).accuracy,
    validationAccuracy: evaluate(params, data.validation).accuracy,
  };
  return cached;
}
