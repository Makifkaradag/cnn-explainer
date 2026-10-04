/**
 * Numerically stable softmax: subtracting max(z) leaves the result unchanged
 * (it cancels in the ratio) but prevents exp() from overflowing.
 */
export function softmax(logits: number[]): number[] {
  if (logits.length === 0) return [];
  const max = Math.max(...logits);
  const exps = logits.map((z) => Math.exp(z - max));
  const total = exps.reduce((a, b) => a + b, 0);
  return exps.map((e) => e / total);
}

/** Cross-entropy loss for one example: −log(p[target]). */
export function crossEntropy(probs: number[], target: number): number {
  return -Math.log(Math.max(probs[target] ?? 0, 1e-12));
}

export function argmax(values: number[]): number {
  let best = 0;
  for (let i = 1; i < values.length; i++) if (values[i] > values[best]) best = i;
  return best;
}
