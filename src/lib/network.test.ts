import { describe, expect, it } from 'vitest';
import { EXAMPLE_IMAGES, getExample } from '@/data/examples';
import { CLASS_NAMES, LAYERS, TOTAL_PARAMS, forward } from './network';
import { argmax } from './softmax';
import { tensorShape } from './tensor';
import { generateDataset, getTrainedModel, initDense, trainStep, evaluate } from './training';
import { createRng } from './random';

describe('tiny CNN', () => {
  const model = getTrainedModel();

  it('produces the documented tensor shapes', () => {
    const r = forward(getExample('circle').matrix, model.dense);
    expect(tensorShape(r.conv1)).toEqual([26, 26, 8]);
    expect(tensorShape(r.pool1)).toEqual([13, 13, 8]);
    expect(tensorShape(r.conv2)).toEqual([11, 11, 16]);
    expect(tensorShape(r.pool2)).toEqual([5, 5, 16]);
    expect(r.flat).toHaveLength(400);
    expect(r.probs.reduce((a, b) => a + b, 0)).toBeCloseTo(1);
    for (const layer of LAYERS) {
      if (
        layer.kind === 'input' ||
        layer.kind === 'flatten' ||
        layer.kind === 'dense' ||
        layer.kind === 'softmax'
      )
        continue;
      expect(tensorShape(r[layer.id] as number[][][])).toEqual(layer.shapeOut);
    }
    expect(TOTAL_PARAMS).toBe(80 + 1168 + 1604);
  });

  it('learns to classify the synthetic shapes', () => {
    expect(model.trainAccuracy).toBeGreaterThan(0.9);
    expect(model.validationAccuracy).toBeGreaterThan(0.8);
  });

  it('recognises the built-in shape examples', () => {
    for (const id of ['circle', 'square', 'triangle', 'cross']) {
      const r = forward(getExample(id).matrix, model.dense);
      expect(CLASS_NAMES[argmax(r.probs)].toLowerCase()).toBe(id);
    }
  });

  it('keeps logits within the softmax slider range for all examples', () => {
    for (const ex of EXAMPLE_IMAGES) {
      const r = forward(ex.matrix, model.dense);
      for (const z of r.logits) expect(Math.abs(z)).toBeLessThan(15);
    }
  });

  it('reduces the loss with gradient descent', () => {
    const data = generateDataset(8, 4, 5);
    let params = initDense(400, 4, createRng(3));
    const before = evaluate(params, data.train).loss;
    for (let i = 0; i < 50; i++) params = trainStep(params, data.train, 1).params;
    expect(evaluate(params, data.train).loss).toBeLessThan(before * 0.5);
  });
});
