import { motion } from 'motion/react';
import { useEffect, useMemo, useReducer, useState } from 'react';
import { CLASS_NAMES, type DenseParams, denseForward } from '@/lib/network';
import { createRng } from '@/lib/random';
import { crossEntropy, softmax } from '@/lib/softmax';
import { fmt } from '@/lib/tensor';
import {
  type Dataset,
  evaluate,
  generateDataset,
  initDense,
  type Sample,
  trainStep,
} from '@/lib/training';
import { cx } from '@/lib/cx';
import { Bars } from './Bars';
import { FeatureMapStack } from './FeatureMap';
import { LineChart } from './LineChart';
import { PixelGrid } from './PixelGrid';
import { Button, Field, Segmented } from './ui/controls';
import { Card, Note, Stat, Tag } from './ui/display';
import { PauseIcon, PlayIcon, ResetIcon, StepIcon } from './ui/Icons';

const PHASES = [
  { name: 'Forward pass', detail: 'Run the batch through the network' },
  { name: 'Prediction', detail: 'Softmax gives class probabilities' },
  { name: 'Loss', detail: 'Cross-entropy: −log p(correct class)' },
  { name: 'Backpropagation', detail: '∂loss/∂w for every weight (here: p − y times x)' },
  { name: 'Weight update', detail: 'w ← w − learning rate × gradient' },
] as const;

type Speed = 'explain' | 'normal' | 'fast';
const TICK_MS: Record<Speed, number> = { explain: 650, normal: 220, fast: 40 };
const NUM_FEATURES = 400;
const HISTORY_LIMIT = 600;
// A handful of weights whose values we track individually.
const TRACKED = [
  { k: 0, i: 37 },
  { k: 1, i: 112 },
  { k: 2, i: 205 },
  { k: 3, i: 318 },
  { k: 0, i: 260 },
  { k: 2, i: 391 },
];

interface HistoryPoint {
  loss: number;
  acc: number;
  valLoss: number;
  valAcc: number;
}

interface State {
  params: DenseParams;
  previous: DenseParams;
  gradW: number[][] | null;
  iteration: number;
  /** Index of the current phase in explain mode; −1 when phases are not shown. */
  phase: number;
  history: HistoryPoint[];
}

type Action =
  | { type: 'step'; data: Dataset; lr: number; batchSize: number }
  | { type: 'tick'; data: Dataset; lr: number; batchSize: number; explain: boolean }
  | { type: 'reset'; seed: number };

function initState(seed: number): State {
  const params = initDense(NUM_FEATURES, CLASS_NAMES.length, createRng(seed), 0.01);
  return { params, previous: params, gradW: null, iteration: 0, phase: -1, history: [] };
}

function batchAt(data: Dataset, iteration: number, batchSize: number): Sample[] {
  const n = data.train.length;
  const start = (iteration * batchSize) % n;
  return Array.from({ length: batchSize }, (_, k) => data.train[(start + k) % n]);
}

function applyStep(state: State, data: Dataset, lr: number, batchSize: number): State {
  const batch = batchAt(data, state.iteration, batchSize);
  const result = trainStep(state.params, batch, lr);
  const val = evaluate(result.params, data.validation);
  return {
    ...state,
    previous: state.params,
    params: result.params,
    gradW: result.gradW,
    iteration: state.iteration + 1,
    history: [
      ...state.history.slice(-(HISTORY_LIMIT - 1)),
      { loss: result.loss, acc: result.accuracy, valLoss: val.loss, valAcc: val.accuracy },
    ],
  };
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'reset':
      return initState(action.seed);
    case 'step':
      return { ...applyStep(state, action.data, action.lr, action.batchSize), phase: -1 };
    case 'tick': {
      if (!action.explain)
        return { ...applyStep(state, action.data, action.lr, action.batchSize), phase: -1 };
      const phase = (state.phase + 1) % PHASES.length;
      // Weights change exactly when the "Weight update" phase lights up.
      if (phase === PHASES.length - 1)
        return { ...applyStep(state, action.data, action.lr, action.batchSize), phase };
      return { ...state, phase };
    }
  }
}

/** A real (but deliberately small) training loop for the Dense layer, visualised step by step. */
export function TrainingSimulator() {
  const data = useMemo(() => generateDataset(24, 8, 11), []);
  const [seed, setSeed] = useState(1);
  const [state, dispatch] = useReducer(reducer, 1, initState);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState<Speed>('explain');
  const [lr, setLr] = useState(0.5);
  const [batchSize, setBatchSize] = useState(16);
  const [cls, setCls] = useState(0);
  const [view, setView] = useState<'weights' | 'gradient'>('weights');

  useEffect(() => {
    if (!playing) return;
    const id = window.setInterval(
      () => dispatch({ type: 'tick', data, lr, batchSize, explain: speed === 'explain' }),
      TICK_MS[speed],
    );
    return () => window.clearInterval(id);
  }, [playing, speed, data, lr, batchSize]);

  const epoch = (state.iteration * batchSize) / data.train.length;
  const last = state.history[state.history.length - 1];
  // In explain mode the batch shown is the one being processed in the current cycle.
  const shownIteration = state.phase === PHASES.length - 1 ? state.iteration - 1 : state.iteration;
  const sample = batchAt(data, Math.max(0, shownIteration), batchSize)[0];
  const sampleParams = state.phase === PHASES.length - 1 ? state.previous : state.params;
  const sampleProbs = softmax(denseForward(sampleParams, sample.x));
  const sampleLoss = crossEntropy(sampleProbs, sample.label);

  const toMaps = (row: number[]) =>
    Array.from({ length: 16 }, (_, c) =>
      Array.from({ length: 5 }, (_, r) => row.slice(c * 25 + r * 5, c * 25 + r * 5 + 5)),
    );
  const shownRow =
    view === 'weights'
      ? state.params.W[cls]
      : (state.gradW?.[cls] ?? new Array(NUM_FEATURES).fill(0));
  const maps = toMaps(shownRow);

  const reset = () => {
    setPlaying(false);
    const next = seed + 1;
    setSeed(next);
    dispatch({ type: 'reset', seed: next });
  };

  const lit = (i: number) => state.phase === i || (state.phase === -1 && playing);

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <div className="flex flex-wrap items-end gap-4 border-b border-line p-4">
          <div className="flex flex-wrap gap-2">
            <Button
              variant="primary"
              icon={playing ? <PauseIcon /> : <PlayIcon />}
              onClick={() => setPlaying((p) => !p)}
              className="w-28"
            >
              {playing ? 'Pause' : 'Train'}
            </Button>
            <Button
              icon={<StepIcon />}
              onClick={() => {
                setPlaying(false);
                dispatch({ type: 'step', data, lr, batchSize });
              }}
            >
              One step
            </Button>
            <Button variant="ghost" icon={<ResetIcon />} onClick={reset}>
              Reset
            </Button>
          </div>
          <Field label="Speed">
            <Segmented
              aria-label="Speed"
              value={speed}
              onChange={setSpeed}
              options={[
                { value: 'explain', label: 'Explain' },
                { value: 'normal', label: 'Normal' },
                { value: 'fast', label: 'Fast' },
              ]}
            />
          </Field>
          <Field label="Learning rate">
            <Segmented
              aria-label="Learning rate"
              value={lr}
              onChange={setLr}
              options={[0.1, 0.5, 1.5, 8].map((v) => ({ value: v, label: String(v) }))}
            />
          </Field>
          <Field label="Batch size">
            <Segmented
              aria-label="Batch size"
              value={batchSize}
              onChange={setBatchSize}
              options={[4, 16, 64].map((v) => ({ value: v, label: String(v) }))}
            />
          </Field>
        </div>

        {/* The training loop */}
        <div className="flex flex-wrap items-stretch gap-2 p-4">
          {PHASES.map((p, i) => (
            <div key={p.name} className="flex min-w-[150px] flex-1 items-center gap-2">
              <motion.div
                animate={{ scale: lit(i) && state.phase === i ? 1.03 : 1 }}
                className={cx(
                  'flex h-full flex-1 flex-col gap-0.5 rounded-lg border px-3 py-2 transition-colors duration-200',
                  lit(i) ? 'border-accent bg-accent-soft' : 'border-line',
                )}
              >
                <span className="font-mono text-[10px] text-ink-3">{i + 1}</span>
                <span className="text-sm font-medium">{p.name}</span>
                <span className="text-[11px] leading-snug text-ink-3">{p.detail}</span>
              </motion.div>
              {i < PHASES.length - 1 && <span className="hidden text-ink-3 xl:inline">→</span>}
            </div>
          ))}
          <div className="flex items-center px-2 text-xs text-ink-3">↺ next iteration</div>
        </div>

        <div className="grid grid-cols-2 gap-2 border-t border-line p-4 sm:grid-cols-5">
          <Stat
            label="Epoch"
            value={epoch.toFixed(2)}
            sub={`${data.train.length} training images`}
          />
          <Stat label="Iteration" value={state.iteration} sub={`batch of ${batchSize}`} />
          <Stat label="Loss" value={last ? fmt(last.loss, 3) : '—'} sub="this batch" />
          <Stat
            label="Accuracy"
            value={last ? `${(last.acc * 100).toFixed(0)}%` : '—'}
            sub="this batch"
          />
          <Stat
            label="Validation"
            value={last ? `${(last.valAcc * 100).toFixed(0)}%` : '—'}
            sub={`${data.validation.length} unseen images`}
          />
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card title="Loss" aside={<span className="text-xs text-ink-3">lower is better</span>}>
          <div className="p-4">
            <LineChart
              label="Loss over iterations"
              lastX={state.iteration}
              series={[
                { name: 'batch', values: state.history.map((h) => h.loss), color: 'var(--accent)' },
                {
                  name: 'validation',
                  values: state.history.map((h) => h.valLoss),
                  color: 'var(--ink-3)',
                  dashed: true,
                },
              ]}
            />
          </div>
        </Card>
        <Card title="Accuracy" aside={<span className="text-xs text-ink-3">higher is better</span>}>
          <div className="p-4">
            <LineChart
              label="Accuracy over iterations"
              lastX={state.iteration}
              yDomain={[0, 1]}
              format={(v) => `${Math.round(v * 100)}%`}
              series={[
                { name: 'batch', values: state.history.map((h) => h.acc), color: 'var(--accent)' },
                {
                  name: 'validation',
                  values: state.history.map((h) => h.valAcc),
                  color: 'var(--ink-3)',
                  dashed: true,
                },
              ]}
            />
          </div>
        </Card>
        <Card title="One example from the batch">
          <div className="flex gap-4 p-4">
            <PixelGrid data={sample.image} scale="gray" cellSize={3.4} className="shrink-0" />
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <div className="text-xs text-ink-2">
                true label:{' '}
                <span className="font-semibold text-ink">{CLASS_NAMES[sample.label]}</span>
              </div>
              <Bars labels={CLASS_NAMES} values={sampleProbs} highlight={sample.label} />
              <div className="font-mono text-xs text-ink-3">
                loss = −log({sampleProbs[sample.label].toFixed(3)}) ={' '}
                <span className="text-ink">{fmt(sampleLoss, 3)}</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <Card
          title="Dense-layer weights, reshaped as 16 maps of 5×5"
          aside={
            <div className="flex flex-wrap gap-2">
              <Segmented
                aria-label="Class"
                value={cls}
                onChange={setCls}
                options={CLASS_NAMES.map((n, i) => ({ value: i, label: n }))}
              />
              <Segmented
                aria-label="Show"
                value={view}
                onChange={setView}
                options={[
                  { value: 'weights', label: 'Weights' },
                  { value: 'gradient', label: 'Last gradient' },
                ]}
              />
            </div>
          }
        >
          <div className="p-4">
            <FeatureMapStack maps={maps} cellSize={9} labels={(i) => `ch ${i + 1}`} />
            <p className="mt-3 text-xs leading-relaxed text-ink-3">
              Each weight connects one flattened feature to the{' '}
              <span className="text-ink-2">{CLASS_NAMES[cls]}</span> neuron. Orange weights push the
              score up when that feature is active, blue ones push it down. Watch them sharpen as
              training proceeds.{' '}
              {view === 'gradient' &&
                'The gradient shows the direction each weight is about to move (opposite sign).'}
            </p>
          </div>
        </Card>
        <Card title="Individual weights">
          <div className="flex flex-col gap-2 p-4">
            {TRACKED.map(({ k, i }) => {
              const w = state.params.W[k][i];
              const delta = w - state.previous.W[k][i];
              const scale = Math.max(
                0.5,
                ...TRACKED.map((t) => Math.abs(state.params.W[t.k][t.i])),
              );
              return (
                <div
                  key={`${k}-${i}`}
                  className="grid grid-cols-[6.5rem_minmax(0,1fr)_4rem_3.5rem] items-center gap-2 font-mono text-xs"
                >
                  <span className="truncate text-ink-3">
                    w[{CLASS_NAMES[k].slice(0, 3).toLowerCase()}, {i}]
                  </span>
                  <div className="relative h-3 rounded-sm bg-surface-2">
                    <div className="absolute inset-y-0 left-1/2 w-px bg-line-strong" />
                    <motion.div
                      className={cx('absolute inset-y-0', w >= 0 ? 'bg-pos' : 'bg-neg')}
                      animate={
                        w >= 0
                          ? { left: '50%', width: `${(w / scale) * 50}%` }
                          : { left: `${50 + (w / scale) * 50}%`, width: `${(-w / scale) * 50}%` }
                      }
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  </div>
                  <span className="text-right text-ink tabular-nums">{fmt(w, 3)}</span>
                  <span
                    className={cx(
                      'text-right tabular-nums',
                      delta > 0 ? 'text-pos' : delta < 0 ? 'text-neg' : 'text-ink-3',
                    )}
                  >
                    {delta === 0 ? '·' : `${delta > 0 ? '+' : ''}${fmt(delta, 3)}`}
                  </span>
                </div>
              );
            })}
            <p className="mt-2 text-xs leading-relaxed text-ink-3">
              Value and the change (Δ) from the most recent update.
            </p>
          </div>
        </Card>
      </div>

      <div className="flex flex-col gap-3 md:flex-row">
        <Note className="flex-1">
          <div className="mb-1.5 flex flex-wrap gap-2">
            <Tag kind="computed">Real gradient descent</Tag>
            <Tag kind="simulated">Simplified setup</Tag>
          </div>
          The numbers above come from actual mini-batch gradient descent on softmax cross-entropy —
          nothing is faked. But only the final Dense layer (1,604 parameters) is trained, on{' '}
          {data.train.length} synthetic drawings. The convolutional filters stay frozen to keep it
          fast.
        </Note>
        <Note className="flex-1">
          In a real CNN, backpropagation keeps going: the chain rule carries the gradient back
          through the Dense layer, pooling, ReLU and every convolution, so <strong>all</strong>{' '}
          filter weights are learned from data. That usually takes many epochs over thousands of
          images, often on a GPU. Try learning rate 8 to see an unstable, jumpy loss.
        </Note>
      </div>
    </div>
  );
}
