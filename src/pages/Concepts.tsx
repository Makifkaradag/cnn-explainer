import type { ReactNode } from 'react';
import { ActivationPlot } from '@/components/ActivationVisualizer';
import { KernelEditor } from '@/components/KernelEditor';
import { ChevronIcon } from '@/components/ui/Icons';
import { Formula, Tag } from '@/components/ui/display';
import { makeKernel } from '@/data/kernels';
import { ACTIVATION_NAMES } from '@/lib/activations';
import { convolutionStep } from '@/lib/convolution';
import { poolingStep } from '@/lib/pooling';
import { softmax } from '@/lib/softmax';
import { fmt } from '@/lib/tensor';

const v = (s: string) => <span className="math">{s}</span>;

// Small worked examples, computed with the same library functions the app uses.
const PATCH = [
  [0.1, 0.5, 0.9],
  [0.0, 0.6, 1.0],
  [0.2, 0.4, 0.8],
];
const VERTICAL = makeKernel('vertical', 3);
const CONV_EXAMPLE = convolutionStep(PATCH, VERTICAL, 0, 0);
const POOL_INPUT = [
  [1, 3],
  [4, 2],
];
const POOL_EXAMPLE = poolingStep(POOL_INPUT, 0, 0, { size: 2, mode: 'max' });
const LOGITS = [2.0, 1.0, 0.1];
const PROBS = softmax(LOGITS);

function Section({
  title,
  formula,
  children,
  open = false,
}: {
  title: string;
  formula: ReactNode;
  children: ReactNode;
  open?: boolean;
}) {
  return (
    <details open={open} className="group rounded-xl border border-line bg-surface open:bg-surface">
      <summary className="flex cursor-pointer list-none items-center gap-3 px-5 py-4 [&::-webkit-details-marker]:hidden">
        <ChevronIcon className="size-4 text-ink-3 transition group-open:rotate-90" />
        <span className="font-semibold">{title}</span>
        <span className="ml-auto hidden font-serif text-ink-2 italic sm:block">{formula}</span>
      </summary>
      <div className="flex flex-col gap-4 border-t border-line px-5 py-5 text-sm leading-relaxed text-ink-2">
        {children}
      </div>
    </details>
  );
}

function MiniGrid({
  n,
  cell = 12,
  marks = [],
  tint = [],
  ring = 0,
}: {
  n: number;
  cell?: number;
  marks?: [number, number][];
  tint?: [number, number][];
  ring?: number;
}) {
  const has = (list: [number, number][], r: number, c: number) =>
    list.some(([a, b]) => a === r && b === c);
  return (
    <svg
      width={n * cell + 2}
      height={n * cell + 2}
      viewBox={`-1 -1 ${n * cell + 2} ${n * cell + 2}`}
      aria-hidden="true"
    >
      {Array.from({ length: n }, (_, r) =>
        Array.from({ length: n }, (_, c) => {
          const isRing = ring > 0 && (r < ring || c < ring || r >= n - ring || c >= n - ring);
          return (
            <rect
              key={`${r}-${c}`}
              x={c * cell}
              y={r * cell}
              width={cell}
              height={cell}
              className={
                has(marks, r, c)
                  ? 'fill-accent-soft stroke-accent'
                  : has(tint, r, c)
                    ? 'fill-pos/40 stroke-line-strong'
                    : isRing
                      ? 'fill-surface-3 stroke-line'
                      : 'fill-surface-2 stroke-line-strong'
              }
              strokeWidth={1}
            />
          );
        }),
      )}
    </svg>
  );
}

const block = (r0: number, c0: number, size: number): [number, number][] =>
  Array.from({ length: size * size }, (_, i) => [r0 + Math.floor(i / size), c0 + (i % size)]);

const GLOSSARY: { term: string; text: ReactNode; visual: ReactNode }[] = [
  {
    term: 'Receptive field',
    text: 'The region of the input image that can influence one neuron. It grows with every conv and pooling layer.',
    visual: (
      <div className="flex items-center gap-2">
        <MiniGrid n={5} cell={9} marks={block(1, 1, 3)} />
        <span className="text-ink-3">→</span>
        <MiniGrid n={3} cell={9} marks={[[1, 1]]} />
      </div>
    ),
  },
  {
    term: 'Stride',
    text: 'How many pixels the kernel moves between positions. Stride 2 roughly halves the output size.',
    visual: (
      <MiniGrid
        n={6}
        cell={9}
        marks={block(0, 0, 3)}
        tint={block(0, 3, 3).filter(([, c]) => c > 2)}
      />
    ),
  },
  {
    term: 'Padding',
    text: 'Zeros added around the border so the kernel can also be centred on edge pixels. Padding 1 with a 3×3 kernel keeps the size.',
    visual: <MiniGrid n={6} cell={9} ring={1} />,
  },
  {
    term: 'Channels',
    text: 'The depth of a tensor. A colour image has 3 (R, G, B); a conv layer with 8 filters outputs 8.',
    visual: (
      <svg width="60" height="54" aria-hidden="true">
        {['#ef4444', '#22c55e', '#3b82f6'].map((c, i) => (
          <rect
            key={c}
            x={i * 8}
            y={16 - i * 8}
            width="36"
            height="36"
            rx="3"
            fill={c}
            fillOpacity="0.35"
            stroke={c}
          />
        ))}
      </svg>
    ),
  },
  {
    term: 'Feature map',
    text: 'The output of one filter: a grid showing where (and how strongly) the filter’s pattern occurs.',
    visual: (
      <MiniGrid
        n={5}
        cell={9}
        tint={[
          [0, 2],
          [1, 2],
          [2, 2],
          [3, 2],
          [4, 2],
        ]}
      />
    ),
  },
  {
    term: 'Parameters',
    text: (
      <>
        Numbers the network learns. A conv layer has ({v('k')}·{v('k')}·{v('C')}
        <sub>in</sub> + 1)·{v('C')}
        <sub>out</sub> of them — 80 for 8 filters of 3×3 on a grayscale image.
      </>
    ),
    visual: <span className="font-mono text-lg text-ink">(3·3·1+1)·8 = 80</span>,
  },
  {
    term: 'Weights',
    text: 'The values inside kernels and dense layers. Training adjusts them to reduce the loss.',
    visual: (
      <div className="w-20">
        <KernelEditor kernel={makeKernel('diagonal', 3)} readOnly />
      </div>
    ),
  },
  {
    term: 'Bias',
    text: 'One extra learnable number per filter or neuron, added after the weighted sum. It shifts when the neuron “fires”.',
    visual: <span className="font-serif text-lg text-ink italic">Σ w·x + b</span>,
  },
  {
    term: 'Activation',
    text: 'A non-linear function applied element-wise (ReLU, sigmoid, tanh…). Without it, stacked layers collapse into one linear map.',
    visual: <ActivationPlot name="relu" showLabel={false} className="w-24" />,
  },
  {
    term: 'Logits',
    text: 'The raw, unnormalised class scores from the last Dense layer, before softmax. They can be any real number.',
    visual: (
      <svg width="70" height="48" aria-hidden="true">
        <line x1="0" x2="70" y1="30" y2="30" className="stroke-line-strong" />
        {[18, -8, 8, -14].map((h, i) => (
          <rect
            key={i}
            x={6 + i * 16}
            y={h > 0 ? 30 - h : 30}
            width="10"
            height={Math.abs(h)}
            className={h > 0 ? 'fill-pos' : 'fill-neg'}
          />
        ))}
      </svg>
    ),
  },
];

export function Concepts() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <header className="mb-10 flex flex-col gap-3">
        <span className="font-mono text-xs text-ink-3">Under the hood</span>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">The math, briefly</h1>
        <p className="max-w-2xl font-serif text-lg leading-relaxed text-ink-2">
          Four formulas carry most of a CNN. Expand each one for a worked example — the numbers are
          computed by the same code that runs the visualisations.
        </p>
      </header>

      <div className="flex flex-col gap-3">
        <Section title="Convolution" formula="y(i,j) = Σₘ Σₙ x(i+m, j+n) · K(m,n)" open>
          <Formula>
            {v('y')}({v('i')},{v('j')}) = Σ<sub>{v('m')}</sub> Σ<sub>{v('n')}</sub> {v('x')}(
            {v('i')}+{v('m')}, {v('j')}+{v('n')}) · {v('K')}({v('m')},{v('n')}) + {v('b')}
          </Formula>
          <p>
            Place the kernel {v('K')} at position ({v('i')}, {v('j')}), multiply each pixel by the
            weight on top of it and sum. Deep learning libraries (and this app) do not flip the
            kernel, so strictly speaking this is <em>cross-correlation</em>; since the weights are
            learned, the distinction does not matter in practice.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <div className="w-28">
              <KernelEditor kernel={PATCH} readOnly />
              <div className="mt-1 text-center text-xs text-ink-3">image patch</div>
            </div>
            <span className="text-xl text-ink-3">⊙</span>
            <div className="w-28">
              <KernelEditor kernel={VERTICAL} readOnly />
              <div className="mt-1 text-center text-xs text-ink-3">vertical-edge kernel</div>
            </div>
            <span className="text-xl text-ink-3">→</span>
            <div className="font-mono text-xs leading-relaxed">
              {CONV_EXAMPLE.products
                .flat()
                .map((p) => fmt(p))
                .join(' + ')
                .replace(/\+ -/g, '− ')}
              <div className="mt-1 text-base text-ink">= {fmt(CONV_EXAMPLE.sum, 2)}</div>
            </div>
          </div>
          <p>
            Output size per axis: <span className="font-mono text-ink">⌊(n + 2p − k) / s⌋ + 1</span>{' '}
            for input size {v('n')}, padding {v('p')}, kernel size {v('k')} and stride {v('s')}.
          </p>
        </Section>

        <Section title="ReLU" formula="f(x) = max(0, x)">
          <Formula>
            {v('f')}({v('x')}) = max(0, {v('x')})
          </Formula>
          <div className="grid gap-4 sm:grid-cols-[200px_1fr] sm:items-center">
            <ActivationPlot name="relu" x={-1.2} />
            <p>
              Applied independently to every value. Cheap to compute and its gradient is simply 1
              for positive inputs and 0 otherwise, which helps deep networks train. Other
              activations in this app: sigmoid 1/(1+e<sup>−x</sup>), tanh, and leaky ReLU (0.1·x for
              negatives).
            </p>
          </div>
        </Section>

        <Section title="Pooling" formula="MaxPool(X) = max(Xᵢⱼ)">
          <Formula>
            MaxPool({v('X')}) = max
            <sub>
              {v('i')},{v('j')} ∈ window
            </sub>{' '}
            {v('X')}
            <sub>{v('ij')}</sub>
          </Formula>
          <div className="flex flex-wrap items-center gap-4">
            <div className="w-20">
              <KernelEditor kernel={POOL_INPUT} readOnly />
            </div>
            <span className="font-mono text-xs">
              max(1, 3, 4, 2) = <span className="text-ink">{POOL_EXAMPLE.result}</span> · avg ={' '}
              <span className="text-ink">
                {poolingStep(POOL_INPUT, 0, 0, { size: 2, mode: 'avg' }).result}
              </span>
            </span>
          </div>
          <p>
            No weights: pooling is a fixed summary of each window. A 2×2 window with stride 2 halves
            width and height and keeps the channel count. It gives a little robustness to small
            shifts of the input.
          </p>
        </Section>

        <Section title="Softmax" formula="softmax(zᵢ) = exp(zᵢ) / Σⱼ exp(zⱼ)">
          <Formula>
            softmax({v('z')}
            <sub>{v('i')}</sub>) = exp({v('z')}
            <sub>{v('i')}</sub>) / Σ<sub>{v('j')}</sub> exp({v('z')}
            <sub>{v('j')}</sub>)
          </Formula>
          <p className="font-mono text-xs">
            z = [{LOGITS.join(', ')}] → p = [{PROBS.map((p) => p.toFixed(3)).join(', ')}] (sum ={' '}
            {PROBS.reduce((a, b) => a + b, 0).toFixed(3)})
          </p>
          <p>
            In practice max({v('z')}) is subtracted from every logit first; it cancels out in the
            fraction but stops exp() from overflowing. Training minimises the cross-entropy loss
            −log {v('p')}
            <sub>correct</sub>.
          </p>
        </Section>
      </div>

      <section className="mt-16">
        <h2 className="mb-1 text-2xl font-semibold tracking-tight">Glossary</h2>
        <p className="mb-6 text-ink-2">
          The vocabulary you will meet in every CNN paper and tutorial.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          {GLOSSARY.map((g) => (
            <div
              key={g.term}
              className="flex items-center gap-4 rounded-xl border border-line bg-surface p-4"
            >
              <div className="flex w-24 shrink-0 items-center justify-center">{g.visual}</div>
              <div>
                <div className="font-medium">{g.term}</div>
                <p className="mt-0.5 text-sm leading-relaxed text-ink-2">{g.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-16">
        <h2 className="mb-1 text-2xl font-semibold tracking-tight">Activation functions</h2>
        <p className="mb-6 text-ink-2">Each plotted for x from −3 to 3.</p>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {ACTIVATION_NAMES.map((n) => (
            <div key={n} className="rounded-xl border border-line bg-surface p-3">
              <ActivationPlot name={n} />
            </div>
          ))}
        </div>
      </section>

      <section className="mt-16 rounded-xl border border-line p-5">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <h2 className="font-semibold">Educational limitations</h2>
          <Tag kind="simulated" />
        </div>
        <ul className="flex list-disc flex-col gap-1.5 pl-5 text-sm leading-relaxed text-ink-2">
          <li>
            The demo network is tiny (≈2.9k parameters) and works on 28×28 grayscale images with 4
            classes.
          </li>
          <li>
            First-layer filters are hand-picked and second-layer filters are random; only the Dense
            layer is trained.
          </li>
          <li>
            Real CNNs learn all filters, use many more layers and channels, and add tricks such as
            batch normalisation.
          </li>
          <li>
            Hierarchy and “what a layer detects” pictures are intuitions, not guarantees about any
            particular trained model.
          </li>
        </ul>
      </section>
    </div>
  );
}
