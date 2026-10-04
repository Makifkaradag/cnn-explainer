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
import { Card, Note, ShapeChip } from '@/components/ui/display';
import { PauseIcon, PlayIcon, ResetIcon, StepIcon } from '@/components/ui/Icons';
import { useImage } from '@/context/image';
import { KERNEL_PRESETS, type KernelPresetId, makeKernel } from '@/data/kernels';
import { useForward } from '@/hooks/useNetwork';
import { useStepper } from '@/hooks/useStepper';
import { sourceLabel, useT } from '@/i18n/context';
import { ACTIVATION_NAMES, ACTIVATIONS } from '@/lib/activations';
import { cx } from '@/lib/cx';
import { CLASS_NAMES, type ForwardResult } from '@/lib/network';
import { argmax } from '@/lib/softmax';
import { formatShape } from '@/lib/tensor';
import { wrapVector } from '@/lib/views';
import type { ActivationName, PoolMode, Tensor3 } from '@/types';

const STAGE_SHAPES = [
  [28, 28, 1],
  [26, 26, 8],
  [26, 26, 8],
  [13, 13, 8],
  [11, 11, 16],
  [11, 11, 16],
  [5, 5, 16],
  [400],
  [4],
  [4],
];

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
  const t = useT();
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
        labels={(i) =>
          compact ? null : stage <= 3 && i === 0 ? t.playground.yourFilter : `#${i + 1}`
        }
      />
    );
  }
  if (stage === 7) return <PixelGrid data={wrapVector(r.flat, 25)} cellSize={compact ? 1 : 12} />;
  if (stage === 8)
    return compact ? (
      <div className="font-mono text-[10px] text-ink-3">z</div>
    ) : (
      <Bars labels={t.classes} values={r.logits} kind="signed" />
    );
  return compact ? (
    <div className="text-[10px] font-medium">{t.classes[argmax(r.probs)]}</div>
  ) : (
    <Bars labels={t.classes} values={r.probs} highlight={argmax(r.probs)} />
  );
}

export function Playground() {
  const { image, source, setImage } = useImage();
  const t = useT();
  const tp = t.playground;
  const [inputMode, setInputMode] = useState<'examples' | 'draw'>('examples');
  const [kernelId, setKernelId] = useState<KernelPresetId>('vertical');
  const [activation, setActivation] = useState<ActivationName>('relu');
  const [poolMode, setPoolMode] = useState<PoolMode>('max');
  const [viewStage, setViewStage] = useState<number | null>(null);

  const customKernel = useMemo(() => makeKernel(kernelId, 3), [kernelId]);
  const r = useForward({ activation, poolMode, customKernel });
  const defs = tp
    .stages(ACTIVATIONS[activation].label, poolMode === 'max' ? t.common.max : t.common.average)
    .map((d, i) => ({ ...d, shape: STAGE_SHAPES[i] }));
  const run = useStepper(defs.length, 0.9);
  const shown = viewStage != null && viewStage <= run.index ? viewStage : run.index;
  const def = defs[shown];
  const nonDefault = kernelId !== 'vertical' || activation !== 'relu' || poolMode !== 'max';
  const done = run.atEnd;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <header className="mb-8 flex flex-col gap-3">
        <span className="font-mono text-xs text-ink-3">{tp.eyebrow}</span>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{tp.title}</h1>
        <p className="max-w-2xl font-serif text-lg leading-relaxed text-ink-2">{tp.intro}</p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
        <div className="flex flex-col gap-4">
          <Card
            title={tp.imageCard}
            aside={<span className="truncate text-xs text-ink-3">{sourceLabel(source, t)}</span>}
          >
            <div className="flex flex-col gap-3 p-4">
              <Segmented
                aria-label={t.input.sourceLabel}
                value={inputMode}
                onChange={setInputMode}
                options={[
                  { value: 'examples', label: t.common.examples },
                  { value: 'draw', label: t.common.draw },
                ]}
              />
              {inputMode === 'examples' ? (
                <ExamplePicker size="sm" />
              ) : (
                <DrawPad
                  initial={source.kind === 'drawing' ? image : undefined}
                  onCommit={(m) => setImage(m, { kind: 'drawing', label: t.common.yourDrawing })}
                />
              )}
            </div>
          </Card>
          <Card title={tp.settingsCard}>
            <div className="flex flex-col gap-4 p-4">
              <Field label={tp.kernelFor1}>
                <Select<KernelPresetId>
                  aria-label={t.common.kernel}
                  value={kernelId}
                  onChange={setKernelId}
                  options={KERNEL_PRESETS.map((id) => ({ value: id, label: t.kernels[id] }))}
                />
              </Field>
              <div className="w-32">
                <KernelEditor kernel={customKernel} readOnly />
              </div>
              <Field label={t.common.activation}>
                <Select<ActivationName>
                  aria-label={t.common.activation}
                  value={activation}
                  onChange={setActivation}
                  options={ACTIVATION_NAMES.map((n) => ({ value: n, label: ACTIVATIONS[n].label }))}
                />
              </Field>
              <ActivationPlot name={activation} showLabel={false} className="max-w-[220px]" />
              <Field label={t.common.pooling}>
                <Segmented
                  aria-label={t.common.pooling}
                  value={poolMode}
                  onChange={setPoolMode}
                  options={[
                    { value: 'max', label: t.common.max },
                    { value: 'avg', label: t.common.average },
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
                {tp.run}
              </Button>
              <Button
                icon={run.playing ? <PauseIcon /> : <PlayIcon />}
                onClick={() => {
                  setViewStage(null);
                  run.toggle();
                }}
              >
                {run.playing ? t.common.pause : tp.auto}
              </Button>
              <Button
                variant="ghost"
                icon={<ResetIcon />}
                onClick={() => {
                  setViewStage(null);
                  run.reset();
                }}
              >
                {t.common.reset}
              </Button>
              <span className="ml-auto font-mono text-xs text-ink-3">
                {tp.stage(run.index + 1, defs.length)}
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
                      {tp.from(formatShape(defs[shown - 1].shape))}
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
                      {tp.predicted}{' '}
                      <span className="font-semibold">{t.classes[argmax(r.probs)]}</span>{' '}
                      <span className="font-mono text-ink-3">
                        ({(Math.max(...r.probs) * 100).toFixed(1)}%)
                      </span>
                    </div>
                    {nonDefault && <Note>{tp.changedNote}</Note>}
                    <p className="text-xs leading-relaxed text-ink-3">
                      {tp.tinyNote(CLASS_NAMES.length)}
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
