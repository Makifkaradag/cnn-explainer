import { describe, expect, it } from 'vitest';
import { makeKernel } from '@/data/kernels';
import { EXAMPLE_IMAGES } from '@/data/examples';
import { ACTIVATIONS, activate } from './activations';
import { conv2d, convOutputSize, convParamCount, convolutionStep, convolve2d } from './convolution';
import { pool2d, poolOutputSize, poolingStep } from './pooling';
import { argmax, crossEntropy, softmax } from './softmax';
import { flatten, padMatrix } from './tensor';

const input = [
  [1, 2, 3, 0],
  [4, 5, 6, 1],
  [7, 8, 9, 2],
  [0, 1, 2, 3],
];

describe('convolution', () => {
  it('computes output sizes with stride and padding', () => {
    expect(convOutputSize(28, 3)).toBe(26);
    expect(convOutputSize(28, 3, 1, 1)).toBe(28);
    expect(convOutputSize(28, 3, 2, 0)).toBe(13);
    expect(convOutputSize(13, 3)).toBe(11);
    expect(convOutputSize(5, 5, 1, 2)).toBe(5);
  });

  it('matches a hand-computed cross-correlation', () => {
    const kernel = [
      [1, 0, -1],
      [1, 0, -1],
      [1, 0, -1],
    ];
    // (0,0): (1+4+7) − (3+6+9) = −6    (0,1): (2+5+8) − (0+1+2) = 12
    // (1,0): (4+7+0) − (6+9+2) = −6    (1,1): (5+8+1) − (1+2+3) = 8
    expect(convolve2d(input, kernel)).toEqual([
      [-6, 12],
      [-6, 8],
    ]);
  });

  it('applies bias, stride and zero padding', () => {
    const ones = [
      [1, 1],
      [1, 1],
    ];
    expect(convolve2d(input, ones, { stride: 2 })).toEqual([
      [12, 10],
      [16, 16],
    ]);
    const padded = convolve2d(input, makeKernel('identity', 3), { padding: 1, bias: 0.5 });
    expect(padded).toEqual(input.map((row) => row.map((v) => v + 0.5)));
  });

  it('reports every intermediate value of a single step', () => {
    const kernel = makeKernel('vertical', 3);
    const step = convolutionStep(input, kernel, 0, 0, { padding: 1, bias: 1 });
    expect(step.top).toBe(-1);
    expect(step.isPadding[0]).toEqual([true, true, true]);
    expect(step.patch[1]).toEqual([0, 1, 2]);
    expect(step.sum).toBe(step.products.flat().reduce((a, b) => a + b, 0));
    expect(step.output).toBe(step.sum + 1);
    expect(step.sum).toBe(convolve2d(input, kernel, { padding: 1 })[0][0]);
  });

  it('sums over input channels in a multi-channel conv', () => {
    const k = [[[1]], [[2]]];
    const out = conv2d([input, input], [k], [1]);
    expect(out[0][0][0]).toBe(1 * 1 + 1 * 2 + 1);
    expect(convParamCount(3, 8, 16)).toBe(1168);
  });

  it('builds textbook 3×3 kernels', () => {
    expect(makeKernel('vertical', 3)).toEqual([
      [-1, 0, 1],
      [-2, 0, 2],
      [-1, 0, 1],
    ]);
    expect(makeKernel('sharpen', 3)).toEqual([
      [0, -1, 0],
      [-1, 5, -1],
      [0, -1, 0],
    ]);
    const blur5 = makeKernel('blur', 5)
      .flat()
      .reduce((a, b) => a + b, 0);
    expect(blur5).toBeCloseTo(1);
  });
});

describe('pooling', () => {
  it('max-pools 2×2 with stride 2', () => {
    expect(pool2d(input, { size: 2, mode: 'max' })).toEqual([
      [5, 6],
      [8, 9],
    ]);
  });

  it('average-pools', () => {
    expect(pool2d(input, { size: 2, mode: 'avg' })).toEqual([
      [3, 2.5],
      [4, 4],
    ]);
  });

  it('drops incomplete windows and locates the max', () => {
    expect(poolOutputSize(11, 2, 2)).toBe(5);
    expect(poolOutputSize(26, 2, 2)).toBe(13);
    const step = poolingStep(input, 1, 1, { size: 2, mode: 'max' });
    expect(step.argmax).toEqual([0, 0]);
    expect(step.result).toBe(9);
  });
});

describe('activations', () => {
  it('implements ReLU, Leaky ReLU, sigmoid and tanh', () => {
    expect(activate([[-2, 0, 3]], 'relu')).toEqual([[0, 0, 3]]);
    expect(ACTIVATIONS.leakyRelu.fn(-2)).toBeCloseTo(-0.2);
    expect(ACTIVATIONS.sigmoid.fn(0)).toBe(0.5);
    expect(ACTIVATIONS.sigmoid.fn(4)).toBeCloseTo(0.982, 3);
    expect(ACTIVATIONS.tanh.fn(1)).toBeCloseTo(0.7616, 4);
  });
});

describe('softmax', () => {
  it('produces a probability distribution', () => {
    const p = softmax([2, 1, 0.1]);
    expect(p.reduce((a, b) => a + b, 0)).toBeCloseTo(1);
    expect(p[0]).toBeCloseTo(0.659, 3);
    expect(argmax(p)).toBe(0);
  });

  it('is stable for large logits and shift-invariant', () => {
    expect(softmax([1000, 1000])).toEqual([0.5, 0.5]);
    const a = softmax([1, 2, 3]);
    const b = softmax([101, 102, 103]);
    a.forEach((v, i) => expect(v).toBeCloseTo(b[i]));
  });

  it('computes cross-entropy', () => {
    expect(crossEntropy([0.25, 0.75], 1)).toBeCloseTo(-Math.log(0.75));
  });
});

describe('tensor helpers', () => {
  it('pads and flattens', () => {
    expect(padMatrix([[1]], 1)).toEqual([
      [0, 0, 0],
      [0, 1, 0],
      [0, 0, 0],
    ]);
    expect(flatten([[[1, 2]], [[3, 4]]])).toEqual([1, 2, 3, 4]);
  });

  it('ships 28×28 examples in [0, 1]', () => {
    for (const ex of EXAMPLE_IMAGES) {
      expect(ex.matrix).toHaveLength(28);
      expect(
        ex.matrix.every((row) => row.length === 28 && row.every((v) => v >= 0 && v <= 1)),
      ).toBe(true);
    }
  });
});
