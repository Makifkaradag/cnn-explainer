import type { ReactNode } from 'react';
import { ActivationPlot } from '@/components/ActivationVisualizer';
import { KernelEditor } from '@/components/KernelEditor';
import { ChevronIcon } from '@/components/ui/Icons';
import { Formula } from '@/components/ui/display';
import { makeKernel } from '@/data/kernels';
import { useT } from '@/i18n/context';
import type { Dictionary } from '@/i18n/en';
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

type TermKey = keyof Dictionary['concepts']['terms'];

// Visuals for the glossary; the words come from the active dictionary.
const GLOSSARY_VISUALS: Record<TermKey, ReactNode> = {
  rf: (
    <div className="flex items-center gap-2">
      <MiniGrid n={5} cell={9} marks={block(1, 1, 3)} />
      <span className="text-ink-3">→</span>
      <MiniGrid n={3} cell={9} marks={[[1, 1]]} />
    </div>
  ),
  stride: (
    <MiniGrid
      n={6}
      cell={9}
      marks={block(0, 0, 3)}
      tint={block(0, 3, 3).filter(([, c]) => c > 2)}
    />
  ),
  padding: <MiniGrid n={6} cell={9} ring={1} />,
  channels: (
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
  fmap: (
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
  params: <span className="font-mono text-lg text-ink">(3·3·1+1)·8 = 80</span>,
  weights: (
    <div className="w-20">
      <KernelEditor kernel={makeKernel('diagonal', 3)} readOnly />
    </div>
  ),
  bias: <span className="font-serif text-lg text-ink italic">Σ w·x + b</span>,
  activation: <ActivationPlot name="relu" showLabel={false} className="w-24" />,
  logits: (
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
};

export function Concepts() {
  const t = useT();
  const c = t.concepts;
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <header className="mb-10 flex flex-col gap-3">
        <span className="font-mono text-xs text-ink-3">{c.eyebrow}</span>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{c.title}</h1>
        <p className="max-w-2xl font-serif text-lg leading-relaxed text-ink-2">{c.intro}</p>
      </header>

      <div className="flex flex-col gap-3">
        <Section title={c.convTitle} formula="y(i,j) = Σₘ Σₙ x(i+m, j+n) · K(m,n)" open>
          <Formula>
            {v('y')}({v('i')},{v('j')}) = Σ<sub>{v('m')}</sub> Σ<sub>{v('n')}</sub> {v('x')}(
            {v('i')}+{v('m')}, {v('j')}+{v('n')}) · {v('K')}({v('m')},{v('n')}) + {v('b')}
          </Formula>
          <p>{c.convText}</p>
          <div className="flex flex-wrap items-center gap-4">
            <div className="w-28">
              <KernelEditor kernel={PATCH} readOnly />
              <div className="mt-1 text-center text-xs text-ink-3">{c.patch}</div>
            </div>
            <span className="text-xl text-ink-3">⊙</span>
            <div className="w-28">
              <KernelEditor kernel={VERTICAL} readOnly />
              <div className="mt-1 text-center text-xs text-ink-3">{c.verticalKernel}</div>
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
            {c.outputSize('')}
            <span className="font-mono text-ink">⌊(n + 2p − k) / s⌋ + 1</span>, {c.outputSizeVars}
          </p>
        </Section>

        <Section title="ReLU" formula="f(x) = max(0, x)">
          <Formula>
            {v('f')}({v('x')}) = max(0, {v('x')})
          </Formula>
          <div className="grid gap-4 sm:grid-cols-[200px_1fr] sm:items-center">
            <ActivationPlot name="relu" x={-1.2} />
            <p>{c.reluText}</p>
          </div>
        </Section>

        <Section title={c.poolTitle} formula="MaxPool(X) = max(Xᵢⱼ)">
          <Formula>
            MaxPool({v('X')}) = max
            <sub>
              {v('i')},{v('j')} ∈ {c.window}
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
          <p>{c.poolText}</p>
        </Section>

        <Section title="Softmax" formula="softmax(zᵢ) = exp(zᵢ) / Σⱼ exp(zⱼ)">
          <Formula>
            softmax({v('z')}
            <sub>{v('i')}</sub>) = exp({v('z')}
            <sub>{v('i')}</sub>) / Σ<sub>{v('j')}</sub> exp({v('z')}
            <sub>{v('j')}</sub>)
          </Formula>
          <p className="font-mono text-xs">
            z = [{LOGITS.join(', ')}] → p = [{PROBS.map((p) => p.toFixed(3)).join(', ')}] ({c.sum} ={' '}
            {PROBS.reduce((a, b) => a + b, 0).toFixed(3)})
          </p>
          <p>{c.softmaxText}</p>
        </Section>
      </div>

      <section className="mt-16">
        <h2 className="mb-1 text-2xl font-semibold tracking-tight">{c.glossary}</h2>
        <p className="mb-6 text-ink-2">{c.glossarySub}</p>
        <div className="grid gap-3 sm:grid-cols-2">
          {(Object.keys(GLOSSARY_VISUALS) as TermKey[]).map((key) => (
            <div
              key={key}
              className="flex items-center gap-4 rounded-xl border border-line bg-surface p-4"
            >
              <div className="flex w-24 shrink-0 items-center justify-center">
                {GLOSSARY_VISUALS[key]}
              </div>
              <div>
                <div className="font-medium">{c.terms[key].term}</div>
                <p className="mt-0.5 text-sm leading-relaxed text-ink-2">{c.terms[key].text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-16">
        <h2 className="mb-1 text-2xl font-semibold tracking-tight">{c.actTitle}</h2>
        <p className="mb-6 text-ink-2">{c.actSub}</p>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {ACTIVATION_NAMES.map((n) => (
            <div key={n} className="rounded-xl border border-line bg-surface p-3">
              <ActivationPlot name={n} />
            </div>
          ))}
        </div>
      </section>

      <section className="mt-16 rounded-xl border border-line p-5">
        <h2 className="mb-2 font-semibold">{c.limitsTitle}</h2>
        <ul className="flex list-disc flex-col gap-1.5 pl-5 text-sm leading-relaxed text-ink-2">
          {c.limits.map((l) => (
            <li key={l}>{l}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}
