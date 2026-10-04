import { AnimatePresence, motion } from 'motion/react';
import { useMemo, useState } from 'react';
import { useImage } from '@/context/image';
import { useTheme } from '@/context/theme';
import { KERNEL_PRESETS, KERNEL_SIZES, type KernelPresetId, makeKernel } from '@/data/kernels';
import { useStepper } from '@/hooks/useStepper';
import { css, textOn, valueColor } from '@/lib/colors';
import { convOutputSize, convolutionStep, convolve2d } from '@/lib/convolution';
import { cx } from '@/lib/cx';
import { fmt, maxAbs, padMatrix } from '@/lib/tensor';
import type { Matrix } from '@/types';
import { KernelEditor } from './KernelEditor';
import { type GridCell, type Highlight, PixelGrid } from './PixelGrid';
import { Field, Segmented, Select } from './ui/controls';
import { Caption, Card } from './ui/display';
import { ArrowRightIcon } from './ui/Icons';
import { PlaybackControls } from './ui/PlaybackControls';

type PresetChoice = KernelPresetId | 'custom';

/** Chapter 2: the kernel slides over the image; every multiply-and-add is shown. */
export function ConvolutionVisualizer() {
  const { image } = useImage();
  const { theme } = useTheme();
  const [preset, setPreset] = useState<PresetChoice>('vertical');
  const [kernel, setKernel] = useState<Matrix>(() => makeKernel('vertical', 3));
  const [stride, setStride] = useState(1);
  const [padding, setPadding] = useState(0);
  const [bias, setBias] = useState(0);
  const [speed, setSpeed] = useState(5);
  const [focusCell, setFocusCell] = useState<GridCell | null>(null);

  const k = kernel.length;
  const outRows = convOutputSize(image.length, k, stride, padding);
  const outCols = convOutputSize(image[0].length, k, stride, padding);
  const total = outRows * outCols;
  const stepper = useStepper(total, speed);
  const i = Math.floor(stepper.index / outCols);
  const j = stepper.index % outCols;

  const padded = useMemo(() => padMatrix(image, padding), [image, padding]);
  const output = useMemo(
    () => convolve2d(image, kernel, { stride, padding, bias }),
    [image, kernel, stride, padding, bias],
  );
  const outRange = maxAbs(output);
  const step = convolutionStep(image, kernel, i, j, { stride, padding, bias });
  // Stagger the arithmetic when it can be followed: slow playback, or manual stepping.
  const detailed = speed <= 1.5 || (!stepper.playing && speed <= 5);
  const animateCells = speed <= 5;

  const choosePreset = (id: PresetChoice, size = k) => {
    setPreset(id);
    if (id !== 'custom') setKernel(makeKernel(id, size));
  };

  const changeSize = (size: number) => {
    setKernel(preset === 'custom' ? makeKernel('identity', size) : makeKernel(preset, size));
    if (preset === 'custom') setPreset('identity');
  };

  // Clicking the input centres the kernel on that pixel (as close as the stride allows).
  const selectInput = ({ row, col }: GridCell) => {
    const r = Math.round((row - (k - 1) / 2) / stride);
    const c = Math.round((col - (k - 1) / 2) / stride);
    stepper.goTo(
      Math.max(0, Math.min(outRows - 1, r)) * outCols + Math.max(0, Math.min(outCols - 1, c)),
    );
  };

  const windowTop = i * stride;
  const windowLeft = j * stride;
  const inputHighlights: Highlight[] = [{ row: windowTop, col: windowLeft, rows: k, cols: k }];
  if (focusCell)
    inputHighlights.push({
      row: windowTop + focusCell.row,
      col: windowLeft + focusCell.col,
      tone: 'ink',
    });

  const sizeFormula = `⌊(${image.length} + 2·${padding} − ${k}) / ${stride}⌋ + 1 = ${outRows}`;

  return (
    <Card>
      <div className="flex flex-col gap-4 border-b border-line p-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1.4fr_auto_auto_auto]">
          <Field label="Kernel">
            <Select<PresetChoice>
              aria-label="Kernel preset"
              value={preset}
              onChange={(id) => choosePreset(id)}
              options={[
                ...KERNEL_PRESETS.map((p) => ({ value: p.id as PresetChoice, label: p.label })),
                { value: 'custom', label: 'Custom (edited)' },
              ]}
            />
          </Field>
          <Field label="Kernel size">
            <Segmented
              aria-label="Kernel size"
              value={k}
              onChange={changeSize}
              options={KERNEL_SIZES.map((s) => ({ value: s, label: `${s}×${s}` }))}
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
          <Field label="Padding">
            <Segmented
              aria-label="Padding"
              value={padding}
              onChange={setPadding}
              options={[0, 1, 2].map((p) => ({ value: p, label: String(p) }))}
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
          total={total}
        />
      </div>

      <div className="grid gap-6 p-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)_minmax(0,1fr)]">
        {/* 1. Input with the sliding window */}
        <div className="min-w-0">
          <Caption shape={[image.length + 2 * padding, image.length + 2 * padding]}>
            Input{padding > 0 && <span className="text-ink-3"> + {padding}px zero padding</span>}
          </Caption>
          <PixelGrid
            data={padded}
            scale="gray"
            cellSize={11}
            paddingRing={padding}
            highlights={inputHighlights}
            smooth={speed <= 20}
            onSelect={selectInput}
            label="Input image with the kernel window"
          />
          <p className="mt-2 text-xs text-ink-3">Click anywhere to move the kernel there.</p>
        </div>

        {/* 2. Kernel and the arithmetic for the current position */}
        <div className="flex min-w-0 flex-col gap-4">
          <div>
            <Caption shape={[k, k]}>Kernel weights · editable</Caption>
            <KernelEditor
              kernel={kernel}
              onChange={(next) => {
                setKernel(next);
                setPreset('custom');
              }}
              highlight={focusCell}
              onHoverCell={setFocusCell}
              bias={bias}
              onBiasChange={setBias}
            />
          </div>
          <div>
            <Caption>
              Position ({i}, {j}) · input × weight
            </Caption>
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.div
                key={animateCells ? `${stepper.index}-${k}` : 'static'}
                className="grid gap-1"
                style={{ gridTemplateColumns: `repeat(${k}, minmax(0, 1fr))`, maxWidth: k * 64 }}
                initial="hidden"
                animate="show"
                variants={{ show: { transition: { staggerChildren: detailed ? 0.025 : 0 } } }}
                onMouseLeave={() => setFocusCell(null)}
              >
                {step.products.flatMap((row, m) =>
                  row.map((p, n) => {
                    const color = valueColor(p, 'diverging', Math.max(outRange / 3, 1e-6), theme);
                    const active = focusCell?.row === m && focusCell?.col === n;
                    return (
                      <motion.div
                        key={`${m}-${n}`}
                        variants={{ hidden: { opacity: 0, y: 4 }, show: { opacity: 1, y: 0 } }}
                        transition={{ duration: detailed ? 0.18 : 0 }}
                        onMouseEnter={() => setFocusCell({ row: m, col: n })}
                        className={cx(
                          'flex aspect-[1.25] flex-col items-center justify-center rounded-md border font-mono leading-tight tabular-nums',
                          active ? 'border-accent ring-1 ring-accent' : 'border-line',
                          k > 3 ? 'text-[9px]' : 'text-[11px]',
                        )}
                        style={{ background: css(color), color: textOn(color) }}
                      >
                        <span className="opacity-75">
                          {step.isPadding[m][n] ? 'pad' : fmt(step.patch[m][n], 2)}×
                          {fmt(kernel[m][n], 2)}
                        </span>
                        <span className="font-medium">{fmt(p, 2)}</span>
                      </motion.div>
                    );
                  }),
                )}
              </motion.div>
            </AnimatePresence>
          </div>
          <div className="flex flex-wrap items-center gap-2 rounded-lg bg-surface-2 px-3 py-2.5 font-mono text-[13px] text-ink-2">
            <span>
              Σ = <span className="text-ink">{fmt(step.sum, 3)}</span>
            </span>
            {bias !== 0 && <span>+ b ({fmt(bias, 2)})</span>}
            <ArrowRightIcon className="text-ink-3" />
            <motion.span
              key={`${stepper.index}-${fmt(step.output, 3)}`}
              initial={detailed ? { scale: 0.6, opacity: 0 } : false}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                delay: detailed ? k * k * 0.025 : 0,
                type: 'spring',
                stiffness: 400,
                damping: 22,
              }}
              className="rounded-md px-2 py-0.5 font-medium ring-2 ring-accent"
              style={(() => {
                const c = valueColor(step.output, 'diverging', outRange, theme);
                return { background: css(c), color: textOn(c) };
              })()}
            >
              {fmt(step.output, 3)}
            </motion.span>
          </div>
        </div>

        {/* 3. The feature map filling in */}
        <div className="min-w-0">
          <Caption shape={[outRows, outCols]}>Output feature map</Caption>
          <PixelGrid
            data={output}
            scale="diverging"
            range={outRange}
            cellSize={11}
            revealed={stepper.index + 1}
            highlights={[{ row: i, col: j, tone: 'accent' }]}
            smooth={speed <= 20}
            onSelect={({ row, col }) => stepper.goTo(row * outCols + col)}
            label="Output feature map"
          />
          <div className="mt-3 flex flex-col gap-2 text-xs text-ink-3">
            <div className="flex items-center gap-2">
              <span
                className="h-2.5 w-14 rounded-sm"
                style={{
                  background: 'linear-gradient(90deg, var(--neg), var(--surface-2), var(--pos))',
                }}
              />
              <span>negative · 0 · positive</span>
            </div>
            <div>
              Output size: <span className="font-mono text-ink-2">{sizeFormula}</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
