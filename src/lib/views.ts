import type { Matrix, Tensor3 } from '@/types';
import type { ForwardResult, LayerSpec } from './network';

export type TensorValue =
  | { kind: 'image'; value: Matrix }
  | { kind: 'maps'; value: Tensor3 }
  | { kind: 'vector'; value: number[] }
  | { kind: 'logits'; value: number[] }
  | { kind: 'probs'; value: number[] };

/** Lays a long vector out in rows so all of it fits on screen. */
export function wrapVector(v: number[], perRow: number): Matrix {
  const rows: Matrix = [];
  for (let i = 0; i < v.length; i += perRow) {
    const row = v.slice(i, i + perRow);
    while (row.length < perRow) row.push(0);
    rows.push(row);
  }
  return rows;
}

/** The value a layer outputs, tagged with how it should be drawn. */
export function tensorFor(result: ForwardResult, layer: LayerSpec): TensorValue {
  switch (layer.id) {
    case 'input':
      return { kind: 'image', value: result.input };
    case 'flat':
      return { kind: 'vector', value: result.flat };
    case 'logits':
      return { kind: 'logits', value: result.logits };
    case 'probs':
      return { kind: 'probs', value: result.probs };
    default:
      return { kind: 'maps', value: result[layer.id] as Tensor3 };
  }
}
