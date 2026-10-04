import { AnimatePresence, motion } from 'motion/react';
import { useMemo, useState } from 'react';
import { ActivationPlot } from '@/components/ActivationVisualizer';
import { Bars } from '@/components/Bars';
import { DrawPad } from '@/components/DrawPad';
import { FeatureMapStack } from '@/components/FeatureMap';
import { ExamplePicker } from '@/components/ImageInput';
import { KernelEditor } from '@/components/KernelEditor';
import { PixelGrid } from '@/components/PixelGrid';
import { Button, Field, Segmented, Select } from '@/components/ui/controls';
import { Card, Note, ShapeChip, Tag } from '@/components/ui/display';
import { PauseIcon, PlayIcon, ResetIcon, StepIcon } from '@/components/ui/Icons';
import { useImage } from '@/context/image';
import { KERNEL_PRESETS, type KernelPresetId, makeKernel } from '@/data/kernels';
import { useForward } from '@/hooks/useNetwork';
import { useStepper } from '@/hooks/useStepper';
import { ACTIVATION_NAMES, ACTIVATIONS } from '@/lib/activations';
import { cx } from '@/lib/cx';
import { CLASS_NAMES, type ForwardResult } from '@/lib/network';
import { argmax } from '@/lib/softmax';
import { formatShape } from '@/lib/tensor';
import { wrapVector } from '@/lib/views';
import type { ActivationName, PoolMode, Tensor3 } from '@/types';

interface StageDef {
  title: string;
  shape: number[];
  explain: string;
}

function stages(activation: string, pool: string): StageDef[] {
  return [
    {
      title: 'Input',
      shape: [28, 28, 1],
      explain: 'The grayscale image: 784 numbers between 0 and 1.',
    },
    {
      title: 'Convolution',
      shape: [26, 26, 8],
      explain:
        'Eight 3×3 filters slide over the image. Filter #1 is the kernel you picked; the other seven are fixed edge filters.',
    },
    {
      title: activation,
      shape: [26, 26, 8],
      explain: `${activation} is applied to every value of every feature map. The shape does not change.`,
    },
    {
      title: `${pool} pool`,
      shape: [13, 13, 8],
      explain: 'Each 2×2 block is reduced to one value, halving width and height.',
    },
    {
      title: 'Convolution 2',
      shape: [11, 11, 16],
      explain:
        'Sixteen filters, each spanning all 8 input maps (3×3×8 weights), combine the first-layer features.',
    },
    {
      title: `${activation} 2`,
      shape: [11, 11, 16],
      explain: 'The same activation again, element-wise.',
    },
    {
      title: `${pool} pool 2`,
      shape: [5, 5, 16],
      explain:
        '11×11 → 5×5. The last row and column do not fill a complete window and are dropped.',
    },
    {
      title: 'Flatten',
      shape: [400],
      explain: 'The 16 maps of 5×5 are unrolled into a single vector of 400 numbers.',
    },
    {
      title: 'Dense',
      shape: [4],
      explain:
        'Four neurons, one per class. Each is a weighted sum of all 400 inputs plus a bias: the logits.',
    },
    {
      title: 'Prediction',
      shape: [4],
      explain: 'Softmax turns the logits into probabilities that sum to 1.',
    },
  ];
}

function mapsOf(r: ForwardResult, stage: number): Tensor3 | null {
  return [null, r.conv1, r.act1, r.pool1, r.conv2, r.act2, r.pool2][stage] ?? null;
}

function StageVisual({
  r,
  stage,
  compact = false,
}: {
  r: ForwardResult;
  stage: number;
  compact?: boolean;
}) {
  const maps = mapsOf(r, stage);
  if (stage === 0) return <PixelGrid data={r.input} scale="gray" cellSize={compact ? 1.6 : 10} />;
  if (maps) {
    const h = maps[0].length;
    const cell = compact ? Math.max(1.2, 22 / h) : Math.max(3, Math.min(14, 110 / h));
    return (
      <FeatureMapStack
        maps={maps}
        cellSize={cell}
        limit={compact ? 1 : 16}
        showOverflow={!compact}
        labels={(i) => (compact ? null : stage <= 3 && i === 0 ? 'your filter' : `#${i + 1}`)}
      />
    );
  }
  if (stage === 7) return <PixelGrid data={wrapVector(r.flat, 25)} cellSize={compact ? 1 : 12} />;
  if (stage === 8)
    return compact ? (
      <div className="font-mono text-[10px] text-ink-3">z</div>
    ) : (
      <Bars labels={CLASS_NAMES} values={r.logits} kind="signed" />
    );
  return compact ? (
    <div className="text-[10px] font-medium">{CLASS_NAMES[argmax(r.probs)]}</div>
  ) : (
    <Bars labels={CLASS_NAMES} values={r.probs} highlight={argmax(r.probs)} />
  );
}

export function Playground() {
  const { image, source, setImage } = useImage();
  const [inputMode, setInputMode] = useState<'examples' | 'draw'>('examples');
  const [kernelId, setKernelId] = useState<KernelPresetId>('vertical');
  const [activation, setActivation] = useState<ActivationName>('relu');
  const [poolMode, setPoolMode] = useState<PoolMode>('max');
  const [viewStage, setViewStage] = useState<number | null>(null);

  const customKernel = useMemo(() => makeKernel(kernelId, 3), [kernelId]);
  const r = useForward({ activation, poolMode, customKernel });
  const defs = stages(ACTIVATIONS[activation].label, poolMode === 'max' ? 'Max' : 'Avg');
  const run = useStepper(defs.length, 0.9);
  const shown = viewStage != null && viewStage <= run.index ? viewStage : run.index;
  const def = defs[shown];
  const nonDefault = kernelId !== 'vertical' || activation !== 'relu' || poolMode !== 'max';
  const done = run.atEnd;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <header className="mb-8 flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-mono text-xs text-ink-3">Playground</span>
          <Tag kind="computed" />
          <Tag kind="simulated" />
        </div>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">CNN Playground</h1>
        <p className="max-w-2xl font-serif text-lg leading-relaxed text-ink-2">
          Configure the first layer, then push your image through the network one stage at a time.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
        <div className="flex flex-col gap-4">
          <Card
            title="1 · Image"
            aside={<span className="truncate text-xs text-ink-3">{source.label}</span>}
          >
            <div className="flex flex-col gap-3 p-4">
              <Segmented
                aria-label="Input source"
                value={inputMode}
                onChange={setInputMode}
                options={[
                  { value: 'examples', label: 'Examples' },
                  { value: 'draw', label: 'Draw' },
                ]}
              />
              {inputMode === 'examples' ? (
                <ExamplePicker size="sm" />
              ) : (
                <DrawPad
                  initial={source.kind === 'drawing' ? image : undefined}
                  onCommit={(m) => setImage(m, { kind: 'drawing', label: 'Your drawing' })}
                />
              )}
            </div>
          </Card>
          <Card title="2 · Layer settings">
            <div className="flex flex-col gap-4 p-4">
              <Field label="Kernel for filter #1">
                <Select<KernelPresetId>
                  aria-label="Kernel"
                  value={kernelId}
                  onChange={setKernelId}
                  options={KERNEL_PRESETS.map((p) => ({ value: p.id, label: p.label }))}
                />
              </Field>
              <div className="w-32">
                <KernelEditor kernel={customKernel} readOnly />
              </div>
              <Field label="Activation">
                <Select<ActivationName>
                  aria-label="Activation"
                  value={activation}
                  onChange={setActivation}
                  options={ACTIVATION_NAMES.map((n) => ({ value: n, label: ACTIVATIONS[n].label }))}
                />
              </Field>
              <ActivationPlot name={activation} showLabel={false} className="max-w-[220px]" />
              <Field label="Pooling">
                <Segmented
                  aria-label="Pooling"
                  value={poolMode}
                  onChange={setPoolMode}
                  options={[
                    { value: 'max', label: 'Max' },
                    { value: 'avg', label: 'Average' },
                  ]}
                />
              </Field>
            </div>
          </Card>
        </div>

        <div className="flex min-w-0 flex-col gap-4">
          <Card>
            <div className="flex flex-wrap items-center gap-2 border-b border-line p-4">
              <Button
                variant="primary"
                icon={<StepIcon />}
                disabled={done}
                onClick={() => {
                  setViewStage(null);
                  run.step(1);
                }}
              >
                Run step-by-step
              </Button>
              <Button
                icon={run.playing ? <PauseIcon /> : <PlayIcon />}
                onClick={() => {
                  setViewStage(null);
                  run.toggle();
                }}
              >
                {run.playing ? 'Pause' : 'Auto play'}
              </Button>
              <Button
                variant="ghost"
                icon={<ResetIcon />}
                onClick={() => {
                  setViewStage(null);
                  run.reset();
                }}
              >
                Reset
              </Button>
              <span className="ml-auto font-mono text-xs text-ink-3">
                stage {run.index + 1} / {defs.length}
              </span>
            </div>

            <ol className="flex gap-1 overflow-x-auto px-4 pt-4 pb-1">
              {defs.map((d, i) => {
                const reached = i <= run.index;
                return (
                  <li key={i} className="min-w-[72px] flex-1">
                    <button
                      type="button"
                      disabled={!reached}
                      onClick={() => setViewStage(i)}
                      className={cx(
                        'flex w-full cursor-pointer flex-col items-start gap-1 rounded-md px-1.5 py-1 text-left transition disabled:cursor-default',
                        i === shown ? 'bg-accent-soft' : reached && 'hover:bg-surface-2',
                      )}
                    >
                      <span
                        className={cx(
                          'h-1 w-full rounded-full transition-colors duration-300',
                          reached ? (i === shown ? 'bg-accent' : 'bg-ink/70') : 'bg-surface-3',
                        )}
                      />
                      <span
                        className={cx('truncate text-[11px]', reached ? 'text-ink' : 'text-ink-3')}
                      >
                        {d.title}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>

            <AnimatePresence mode="wait">
              <motion.div
                key={shown}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="flex flex-col gap-4 p-4"
              >
                <div className="flex flex-wrap items-baseline gap-3">
                  <h2 className="text-xl font-semibold">{def.title}</h2>
                  <ShapeChip shape={def.shape} />
                  {shown > 0 && (
                    <span className="text-xs text-ink-3">
                      from {formatShape(defs[shown - 1].shape)}
                    </span>
                  )}
                </div>
                <p className="max-w-2xl text-sm leading-relaxed text-ink-2">{def.explain}</p>
                <div className={cx('min-h-[200px]', shown >= 8 && 'max-w-md')}>
                  <StageVisual r={r} stage={shown} />
                </div>
                {shown === defs.length - 1 && (
                  <div className="flex flex-col gap-3">
                    <div className="text-sm">
                      Predicted:{' '}
                      <span className="font-semibold">{CLASS_NAMES[argmax(r.probs)]}</span>{' '}
                      <span className="font-mono text-ink-3">
                        ({(Math.max(...r.probs) * 100).toFixed(1)}%)
                      </span>
                    </div>
                    {nonDefault && (
                      <Note>
                        You changed the first layer. The Dense layer was trained on features from
                        the default settings (vertical edge kernel, ReLU, max pooling), so it now
                        sees inputs it was never trained on and the prediction may get worse. A real
                        network would be retrained after such a change.
                      </Note>
                    )}
                    <p className="text-xs leading-relaxed text-ink-3">
                      This prediction comes from a tiny simulated CNN that only knows{' '}
                      {CLASS_NAMES.length} synthetic shape classes — anything else (like a smiley)
                      is still forced into one of them.
                    </p>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </Card>

          <div className="flex gap-2 overflow-x-auto pb-1">
            {defs.map((d, i) => (
              <button
                key={i}
                type="button"
                disabled={i > run.index}
                onClick={() => setViewStage(i)}
                className={cx(
                  'flex h-[74px] min-w-[74px] cursor-pointer flex-col items-center justify-between rounded-lg border p-1.5 transition disabled:cursor-default disabled:opacity-30',
                  i === shown ? 'border-accent' : 'border-line hover:border-line-strong',
                )}
              >
                <div className="flex flex-1 items-center">
                  {i <= run.index ? <StageVisual r={r} stage={i} compact /> : null}
                </div>
                <span className="text-[10px] text-ink-3">{d.title}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
