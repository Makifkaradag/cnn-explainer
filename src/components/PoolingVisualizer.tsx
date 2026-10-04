import { motion } from 'motion/react';
import { useMemo, useState } from 'react';
import { useImage } from '@/context/image';
import { useTheme } from '@/context/theme';
import { makeKernel } from '@/data/kernels';
import { useStepper } from '@/hooks/useStepper';
import { activate } from '@/lib/activations';
import { css, textOn, valueColor } from '@/lib/colors';
import { convolve2d } from '@/lib/convolution';
import { cx } from '@/lib/cx';
import { pool2d, poolingStep, poolOutputSize } from '@/lib/pooling';
import { fmt, maxAbs } from '@/lib/tensor';
import type { PoolMode } from '@/types';
import { PixelGrid } from './PixelGrid';
import { Field, Segmented } from './ui/controls';
import { Caption, Card } from './ui/display';
import { ArrowDownIcon } from './ui/Icons';
import { PlaybackControls } from './ui/PlaybackControls';

/** Chapter 5: a pooling window summarises each block of a feature map. */
export function PoolingVisualizer() {
  const { image } = useImage();
  const { theme } = useTheme();
  const [mode, setMode] = useState<PoolMode>('max');
  const [size, setSize] = useState(2);
  const [stride, setStride] = useState(2);
  const [speed, setSpeed] = useState(5);

  const input = useMemo(
    () => activate(convolve2d(image, makeKernel('vertical', 3)), 'relu'),
    [image],
  );
  const n = input.length;
  const out = poolOutputSize(n, size, stride);
  const output = useMemo(() => pool2d(input, { size, stride, mode }), [input, size, stride, mode]);
  const stepper = useStepper(out * out, speed);
  const i = Math.floor(stepper.index / out);
  const j = stepper.index % out;
  const step = poolingStep(input, i, j, { size, stride, mode });
  const range = maxAbs(input);
  const cellSize = 11;

  const resultColor = valueColor(step.result, 'diverging', range, theme);

  return (
    <Card>
      <div className="flex flex-col gap-4 border-b border-line p-4">
        <div className="flex flex-wrap gap-4">
          <Field label="Pooling type">
            <Segmented
              aria-label="Pooling type"
              value={mode}
              onChange={setMode}
              options={[
                { value: 'max', label: 'Max pooling' },
                { value: 'avg', label: 'Average pooling' },
              ]}
            />
          </Field>
          <Field label="Window">
            <Segmented
              aria-label="Window size"
              value={size}
              onChange={setSize}
              options={[2, 3].map((s) => ({ value: s, label: `${s}×${s}` }))}
            />
          </Field>
          <Field label="Stride">
            <Segmented
              aria-label="Stride"
              value={stride}
              onChange={setStride}
              options={[1, 2, 3].map((s) => ({ value: s, label: String(s) }))}
            />
          </Field>
        </div>
        <PlaybackControls
          playing={stepper.playing}
          onToggle={stepper.toggle}
          onStep={stepper.step}
          onReset={stepper.reset}
          onFinish={stepper.finish}
          speed={speed}
          onSpeedChange={setSpeed}
          position={stepper.index}
          total={out * out}
        />
      </div>

      <div className="grid gap-6 p-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.6fr)_minmax(0,1fr)]">
        <div className="min-w-0">
          <Caption shape={[n, n]}>Input feature map (after ReLU)</Caption>
          <PixelGrid
            data={input}
            range={range}
            cellSize={cellSize}
            highlights={[{ row: step.top, col: step.left, rows: size, cols: size }]}
            smooth={speed <= 20}
            onSelect={({ row, col }) => {
              const r = Math.min(out - 1, Math.floor(row / stride));
              const c = Math.min(out - 1, Math.floor(col / stride));
              stepper.goTo(r * out + c);
            }}
          />
        </div>

        <div className="flex flex-col items-center gap-3 lg:pt-8">
          <div className="text-xs font-medium text-ink-2">
            Current {size}×{size} region
          </div>
          <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${size}, 3.25rem)` }}>
            {step.values.flatMap((row, m) =>
              row.map((v, c) => {
                const color = valueColor(v, 'diverging', range, theme);
                const isMax = mode === 'max' && step.argmax[0] === m && step.argmax[1] === c;
                return (
                  <div
                    key={`${m}-${c}`}
                    className={cx(
                      'flex aspect-square items-center justify-center rounded-md font-mono text-xs tabular-nums transition',
                      isMax ? 'ring-2 ring-accent' : 'ring-1 ring-line',
                      mode === 'max' && !isMax && 'opacity-50',
                    )}
                    style={{ background: css(color), color: textOn(color) }}
                  >
                    {fmt(v, 2)}
                  </div>
                );
              }),
            )}
          </div>
          <ArrowDownIcon className="text-ink-3" />
          <div className="text-center font-mono text-xs text-ink-2">
            {mode === 'max' ? 'max(…)' : `sum / ${size * size}`}
          </div>
          <motion.div
            key={stepper.index + mode}
            initial={speed <= 5 ? { scale: 0.7, opacity: 0 } : false}
            animate={{ scale: 1, opacity: 1 }}
            className="flex size-14 items-center justify-center rounded-lg font-mono text-sm font-medium ring-2 ring-accent"
            style={{ background: css(resultColor), color: textOn(resultColor) }}
          >
            {fmt(step.result, 2)}
          </motion.div>
        </div>

        <div className="min-w-0">
          <Caption shape={[out, out]}>Output (pooled)</Caption>
          <PixelGrid
            data={output}
            range={range}
            cellSize={cellSize}
            revealed={stepper.index + 1}
            highlights={[{ row: i, col: j }]}
            smooth={speed <= 20}
            onSelect={({ row, col }) => stepper.goTo(row * out + col)}
          />
        </div>
      </div>

      <div className="grid gap-3 border-t border-line p-4 text-sm sm:grid-cols-3">
        <div>
          <div className="font-mono text-ink">
            {n}×{n} → {out}×{out}
          </div>
          <div className="text-xs text-ink-3">
            ⌊({n} − {size}) / {stride}⌋ + 1 = {out}
          </div>
        </div>
        <div>
          <div className="font-mono text-ink">
            {n * n} → {out * out} values
          </div>
          <div className="text-xs text-ink-3">
            {((n * n) / Math.max(1, out * out)).toFixed(1)}× fewer numbers for the next layer
          </div>
        </div>
        <div className="text-xs leading-relaxed text-ink-2">
          {mode === 'max'
            ? 'Max pooling keeps only the strongest response in each window: “was the pattern present here?” — not exactly where.'
            : 'Average pooling keeps the mean response of each window, which smooths the map.'}{' '}
          It has no learnable weights.
        </div>
      </div>
    </Card>
  );
}
