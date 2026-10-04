import { useMemo, useState } from 'react';
import { useTheme } from '@/context/theme';
import { useForward } from '@/hooks/useNetwork';
import { css, valueColor } from '@/lib/colors';
import { cx } from '@/lib/cx';
import { CLASS_NAMES } from '@/lib/network';
import { fmt } from '@/lib/tensor';
import { getTrainedModel } from '@/lib/training';
import { Card } from './ui/display';

const SHOWN_INPUTS = 12;
const W = 560;
const H = 380;
const X_IN = 92;
const X_OUT = 440;

type Focus = { side: 'in'; index: number } | { side: 'out'; index: number } | null;

/** Chapter 8b: a fully connected layer, drawn with a representative subset of connections. */
export function DenseVisualizer() {
  const { theme } = useTheme();
  const { flat, logits } = useForward();
  const { W: weights, b } = getTrainedModel().dense;
  const [focus, setFocus] = useState<Focus>({
    side: 'out',
    index: logits.indexOf(Math.max(...logits)),
  });

  // Show the inputs with the strongest activations — those that matter most for this image.
  const inputs = useMemo(
    () =>
      flat
        .map((v, i) => ({ v, i }))
        .sort((a, b) => b.v - a.v)
        .slice(0, SHOWN_INPUTS)
        .sort((a, b) => a.i - b.i),
    [flat],
  );
  const maxW = Math.max(...inputs.flatMap(({ i }) => weights.map((row) => Math.abs(row[i]))), 1e-9);
  const maxX = Math.max(...inputs.map((x) => x.v), 1e-9);
  const yIn = (k: number) => 20 + (k * (H - 64)) / (SHOWN_INPUTS - 1);
  const yOut = (k: number) => 70 + (k * (H - 140)) / (CLASS_NAMES.length - 1);

  const isLit = (inIdx: number, outIdx: number) =>
    !focus || (focus.side === 'in' ? focus.index === inIdx : focus.index === outIdx);

  // Breakdown of a logit over *all* 400 inputs, not just the drawn ones.
  const breakdown = useMemo(() => {
    if (focus?.side !== 'out') return null;
    const k = focus.index;
    const terms = flat.map((x, i) => ({ i, x, w: weights[k][i], c: x * weights[k][i] }));
    const top = [...terms].sort((a, c) => Math.abs(c.c) - Math.abs(a.c)).slice(0, 5);
    const rest = terms.reduce((s, t) => s + t.c, 0) - top.reduce((s, t) => s + t.c, 0);
    return { k, top, rest };
  }, [focus, flat, weights]);

  return (
    <Card>
      <div className="grid gap-4 p-4 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <div className="min-w-0">
          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="w-full"
            role="img"
            aria-label="Dense layer connections"
          >
            {inputs.flatMap(({ i }, a) =>
              CLASS_NAMES.map((_, k) => {
                const w = weights[k][i];
                const lit = isLit(i, k);
                return (
                  <line
                    key={`${i}-${k}`}
                    x1={X_IN + 14}
                    y1={yIn(a)}
                    x2={X_OUT - 16}
                    y2={yOut(k)}
                    stroke={w >= 0 ? 'var(--pos)' : 'var(--neg)'}
                    strokeWidth={0.6 + (3.4 * Math.abs(w)) / maxW}
                    strokeOpacity={lit ? 0.85 : 0.07}
                    className="transition-[stroke-opacity] duration-200"
                  />
                );
              }),
            )}
            {inputs.map(({ i, v }, a) => {
              const active = focus?.side === 'in' && focus.index === i;
              return (
                <g
                  key={i}
                  onMouseEnter={() => setFocus({ side: 'in', index: i })}
                  className="cursor-pointer"
                >
                  <rect
                    x={X_IN - 12}
                    y={yIn(a) - 10}
                    width={26}
                    height={20}
                    rx={4}
                    fill={css(valueColor(v, 'diverging', maxX, theme))}
                    className={cx(active ? 'stroke-accent' : 'stroke-line-strong')}
                    strokeWidth={active ? 2 : 1}
                  />
                  <text
                    x={X_IN - 20}
                    y={yIn(a) + 4}
                    textAnchor="end"
                    className="fill-ink-2 font-mono text-[11px]"
                  >
                    x{i}
                  </text>
                </g>
              );
            })}
            <text x={X_IN - 4} y={H - 12} textAnchor="middle" className="fill-ink-3 text-[11px]">
              ⋮ 388 more inputs
            </text>
            {CLASS_NAMES.map((name, k) => {
              const active = focus?.side === 'out' && focus.index === k;
              return (
                <g
                  key={name}
                  onMouseEnter={() => setFocus({ side: 'out', index: k })}
                  className="cursor-pointer"
                >
                  <circle
                    cx={X_OUT}
                    cy={yOut(k)}
                    r={16}
                    className={cx(
                      active ? 'fill-accent-soft stroke-accent' : 'fill-surface stroke-ink-3',
                    )}
                    strokeWidth={active ? 2.5 : 1.5}
                  />
                  <text x={X_OUT + 26} y={yOut(k) - 2} className="fill-ink text-[13px] font-medium">
                    {name}
                  </text>
                  <text
                    x={X_OUT + 26}
                    y={yOut(k) + 14}
                    className="fill-ink-3 font-mono text-[11px]"
                  >
                    z = {fmt(logits[k], 2)}
                  </text>
                </g>
              );
            })}
          </svg>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-3">
            <span>
              <span className="text-pos">━</span> positive weight ·{' '}
              <span className="text-neg">━</span> negative weight · thickness = |w|
            </span>
            <span>
              Showing the {SHOWN_INPUTS} most active of 400 inputs ({SHOWN_INPUTS * 4} of 1,600
              weights).
            </span>
          </div>
        </div>

        <div className="flex min-w-0 flex-col gap-3 text-sm">
          <div className="rounded-lg bg-surface-2 px-4 py-3 text-center font-serif text-[16px]">
            <span className="math">z</span>
            <sub>k</sub> = <span className="math">b</span>
            <sub>k</sub> + Σ<sub>i</sub> <span className="math">w</span>
            <sub>k,i</sub> · <span className="math">x</span>
            <sub>i</sub>
          </div>
          {breakdown ? (
            <div className="flex flex-col gap-1.5 font-mono text-xs">
              <div className="mb-1 font-sans text-xs font-medium text-ink-2">
                How the {CLASS_NAMES[breakdown.k]} logit adds up (all 400 inputs)
              </div>
              <Row label="bias" value={b[breakdown.k]} />
              {breakdown.top.map((t) => (
                <Row key={t.i} label={`w·x${t.i} = ${fmt(t.w, 2)}·${fmt(t.x, 2)}`} value={t.c} />
              ))}
              <Row label="395 other terms" value={breakdown.rest} />
              <div className="mt-1 flex justify-between border-t border-line pt-1.5 text-[13px] text-ink">
                <span>z = </span>
                <span>{fmt(logits[breakdown.k], 3)}</span>
              </div>
            </div>
          ) : (
            focus?.side === 'in' && (
              <div className="flex flex-col gap-1.5 font-mono text-xs">
                <div className="mb-1 font-sans text-xs font-medium text-ink-2">
                  Input x{focus.index} = {fmt(flat[focus.index], 3)} feeds every neuron
                </div>
                {CLASS_NAMES.map((name, k) => (
                  <Row
                    key={name}
                    label={`${name}: w = ${fmt(weights[k][focus.index], 3)}`}
                    value={weights[k][focus.index] * flat[focus.index]}
                  />
                ))}
              </div>
            )
          )}
          <p className="text-xs leading-relaxed text-ink-3">
            Hover a neuron or an input. Every output neuron is connected to all 400 inputs — that is
            what “fully connected” means. These weights were trained in your browser on synthetic
            shapes.
          </p>
        </div>
      </div>
    </Card>
  );
}

function Row({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="truncate text-ink-3">{label}</span>
      <span className={cx('tabular-nums', value >= 0 ? 'text-pos' : 'text-neg')}>
        {value >= 0 ? '+' : ''}
        {fmt(value, 3)}
      </span>
    </div>
  );
}
