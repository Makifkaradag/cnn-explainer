import { type KeyboardEvent, useMemo, useState } from 'react';
import { useImage } from '@/context/image';
import { type KernelPresetId, makeKernel, presetLabel } from '@/data/kernels';
import { activate } from '@/lib/activations';
import { convolve2d } from '@/lib/convolution';
import { cx } from '@/lib/cx';
import { fmt, maxAbs } from '@/lib/tensor';
import { ActivationPlot } from './ActivationVisualizer';
import { type GridCell, PixelGrid } from './PixelGrid';
import { Button, Field, Segmented } from './ui/controls';
import { Caption, Card, Formula } from './ui/display';

const KERNELS: KernelPresetId[] = ['vertical', 'horizontal', 'diagonal', 'edge'];

function findExtreme(m: number[][], sign: 1 | -1): GridCell {
  let best = { row: 0, col: 0 };
  m.forEach((row, r) =>
    row.forEach((v, c) => {
      if (v * sign > m[best.row][best.col] * sign) best = { row: r, col: c };
    }),
  );
  return best;
}

/** Chapter 4: ReLU applied element-wise to a real feature map. */
export function ReLUVisualizer() {
  const { image } = useImage();
  const [kernelId, setKernelId] = useState<KernelPresetId>('vertical');
  const [picked, setPicked] = useState<GridCell | null>(null);

  const before = useMemo(() => convolve2d(image, makeKernel(kernelId, 3)), [image, kernelId]);
  const after = useMemo(() => activate(before, 'relu'), [before]);
  const range = maxAbs(before);
  const size = before.length;
  const cell = picked ?? findExtreme(before, -1);
  const x = before[cell.row][cell.col];
  const y = after[cell.row][cell.col];
  const negatives = before.flat().filter((v) => v < 0).length;

  const move = (dr: number, dc: number) =>
    setPicked({
      row: Math.max(0, Math.min(size - 1, cell.row + dr)),
      col: Math.max(0, Math.min(size - 1, cell.col + dc)),
    });

  const onKey = (e: KeyboardEvent) => {
    const delta: Record<string, [number, number]> = {
      ArrowUp: [-1, 0],
      ArrowDown: [1, 0],
      ArrowLeft: [0, -1],
      ArrowRight: [0, 1],
    };
    const d = delta[e.key];
    if (d) {
      e.preventDefault();
      move(...d);
    }
  };

  const highlight = [{ ...cell, tone: 'accent' as const }];
  const verdict = x < 0 ? 'negative → 0' : x > 0 ? 'positive → unchanged' : 'zero stays zero';

  return (
    <Card>
      <div className="flex flex-wrap items-end gap-4 border-b border-line p-4">
        <Field label="Feature map from kernel">
          <Segmented
            aria-label="Kernel"
            value={kernelId}
            onChange={(id) => {
              setKernelId(id);
              setPicked(null);
            }}
            options={KERNELS.map((id) => ({ value: id, label: presetLabel(id) }))}
          />
        </Field>
        <div className="flex gap-2">
          <Button size="sm" onClick={() => setPicked(findExtreme(before, -1))}>
            Most negative
          </Button>
          <Button size="sm" onClick={() => setPicked(findExtreme(before, 1))}>
            Most positive
          </Button>
        </div>
      </div>

      <div
        tabIndex={0}
        onKeyDown={onKey}
        className="grid gap-6 p-4 outline-none lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,0.9fr)]"
        aria-label="Use arrow keys to move the highlighted pixel"
      >
        <div className="min-w-0">
          <Caption shape={[size, size]}>Before ReLU</Caption>
          <PixelGrid
            data={before}
            range={range}
            cellSize={11}
            highlights={highlight}
            onHover={(c) => c && setPicked(c)}
            onSelect={setPicked}
          />
        </div>
        <div className="min-w-0">
          <Caption shape={[size, size]}>After ReLU</Caption>
          <PixelGrid
            data={after}
            range={range}
            cellSize={11}
            highlights={highlight}
            onHover={(c) => c && setPicked(c)}
            onSelect={setPicked}
          />
        </div>
        <div className="flex min-w-0 flex-col gap-4">
          <ActivationPlot name="relu" x={x} domain={Math.max(1, Math.ceil(range))} />
          <Formula className="text-[15px]">
            max(0, <span className={cx(x < 0 ? 'text-neg' : 'text-pos')}>{fmt(x, 2)}</span>) ={' '}
            <span className="font-semibold">{fmt(y, 2)}</span>
          </Formula>
          <div className="flex items-center justify-between gap-2 text-sm">
            <span
              className={cx(
                'rounded-md px-2 py-0.5 text-xs font-medium',
                x < 0 ? 'bg-neg/15 text-neg' : 'bg-pos/15 text-pos',
              )}
            >
              {verdict}
            </span>
            <div className="grid grid-cols-3 gap-1" aria-label="Move highlighted pixel">
              <span />
              <Button size="sm" onClick={() => move(-1, 0)} aria-label="Up">
                ↑
              </Button>
              <span />
              <Button size="sm" onClick={() => move(0, -1)} aria-label="Left">
                ←
              </Button>
              <Button size="sm" onClick={() => move(1, 0)} aria-label="Down">
                ↓
              </Button>
              <Button size="sm" onClick={() => move(0, 1)} aria-label="Right">
                →
              </Button>
            </div>
          </div>
          <p className="text-xs leading-relaxed text-ink-3">
            <span className="font-mono text-ink-2">{negatives}</span> of {size * size} values were
            negative and became 0. Hover, click or use the arrow keys to inspect any pixel.
          </p>
        </div>
      </div>
    </Card>
  );
}
