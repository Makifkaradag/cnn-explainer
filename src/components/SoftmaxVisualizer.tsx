import { useState } from 'react';
import { useImage } from '@/context/image';
import { useForward } from '@/hooks/useNetwork';
import { useT } from '@/i18n/context';
import { cx } from '@/lib/cx';
import { argmax, softmax } from '@/lib/softmax';
import { fmt } from '@/lib/tensor';
import type { Matrix } from '@/types';
import { Button } from './ui/controls';
import { Card, Formula, Tag } from './ui/display';

const LIMIT = 15;
const clampLogit = (z: number) => Math.max(-LIMIT, Math.min(LIMIT, Math.round(z * 10) / 10));

/** Chapter 9: logits → probabilities, with sliders to play with the logits. */
export function SoftmaxVisualizer() {
  const { image } = useImage();
  const { logits: networkLogits } = useForward();
  const t = useT();
  // Edits belong to the image they were made for; a new image starts from the network's logits.
  const [edited, setEdited] = useState<{ image: Matrix; values: number[] } | null>(null);
  const [hovered, setHovered] = useState<number | null>(null);

  const isEdited = edited?.image === image;
  const logits = isEdited ? edited.values : networkLogits.map(clampLogit);
  const probs = softmax(logits);
  const exps = logits.map(Math.exp);
  const total = exps.reduce((a, b) => a + b, 0);
  const winner = argmax(probs);
  const focus = hovered ?? winner;

  const setLogit = (k: number, v: number) =>
    setEdited({ image, values: logits.map((z, i) => (i === k ? v : z)) });

  return (
    <Card>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-3">
        <div className="flex flex-wrap items-center gap-2">
          {isEdited ? (
            <Tag kind="illustrative">{t.softmax.edited}</Tag>
          ) : (
            <Tag kind="simulated">{t.softmax.fromModel}</Tag>
          )}
        </div>
        <div className="flex gap-2">
          <Button size="sm" onClick={() => setEdited(null)} disabled={!isEdited}>
            {t.softmax.useNetwork}
          </Button>
          <Button size="sm" onClick={() => setEdited({ image, values: logits.map(() => 0) })}>
            {t.softmax.equal}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 p-4 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <div className="flex min-w-0 flex-col gap-1" onMouseLeave={() => setHovered(null)}>
          <div className="grid grid-cols-[4.5rem_minmax(0,1fr)_3rem_minmax(0,1fr)] gap-x-3 pb-2 text-[11px] font-medium tracking-wide text-ink-3 uppercase">
            <span>{t.softmax.cls}</span>
            <span>{t.softmax.logit}</span>
            <span className="text-right normal-case">eᶻ</span>
            <span>{t.softmax.prob}</span>
          </div>
          {t.classes.map((name, k) => (
            <div
              key={name}
              onMouseEnter={() => setHovered(k)}
              className={cx(
                'grid grid-cols-[4.5rem_minmax(0,1fr)_3rem_minmax(0,1fr)] items-center gap-x-3 rounded-lg px-1 py-2 transition',
                focus === k && 'bg-surface-2',
              )}
            >
              <span
                className={cx('text-sm', k === winner ? 'font-semibold text-ink' : 'text-ink-2')}
              >
                {name}
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  className="range"
                  min={-LIMIT}
                  max={LIMIT}
                  step={0.1}
                  value={logits[k]}
                  aria-label={t.softmax.sliderLabel(name)}
                  onChange={(e) => setLogit(k, Number(e.target.value))}
                />
                <span className="w-10 text-right font-mono text-xs tabular-nums">
                  {fmt(logits[k], 1)}
                </span>
              </div>
              <span className="text-right font-mono text-xs text-ink-2 tabular-nums">
                {fmt(exps[k], 2)}
              </span>
              <div className="flex items-center gap-2">
                <div className="h-4 flex-1 overflow-hidden rounded-sm bg-surface-2">
                  <div
                    className={cx(
                      'h-full rounded-sm transition-[width] duration-200',
                      k === winner ? 'bg-accent' : 'bg-ink/60',
                    )}
                    style={{ width: `${probs[k] * 100}%` }}
                  />
                </div>
                <span className="w-12 text-right font-mono text-xs tabular-nums">
                  {(probs[k] * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          ))}
          <div className="mt-2 flex justify-between border-t border-line pt-2 font-mono text-xs text-ink-3">
            <span>Σ eᶻ = {fmt(total, 2)}</span>
            <span>Σ p = {probs.reduce((a, b) => a + b, 0).toFixed(3)}</span>
          </div>
        </div>

        <div className="flex min-w-0 flex-col gap-3">
          <Formula>
            softmax(<span className="math">z</span>
            <sub>i</sub>) ={' '}
            <span className="inline-flex flex-col items-center align-middle text-[15px] leading-tight">
              <span className="border-b border-ink-3 px-1">
                exp(<span className="math">z</span>
                <sub>i</sub>)
              </span>
              <span className="px-1">
                Σ<sub>j</sub> exp(<span className="math">z</span>
                <sub>j</sub>)
              </span>
            </span>
          </Formula>
          <div className="rounded-lg border border-line px-4 py-3 font-mono text-xs leading-relaxed text-ink-2">
            <div className="mb-1 font-sans font-medium text-ink">p({t.classes[focus]})</div>= e^
            {fmt(logits[focus], 1)} / {fmt(total, 2)}
            <br />= {fmt(exps[focus], 3)} / {fmt(total, 2)}
            <br />= <span className="text-ink">{probs[focus].toFixed(3)}</span>
          </div>
          <ul className="flex flex-col gap-1.5 text-xs leading-relaxed text-ink-3">
            {t.softmax.points.map((p) => (
              <li key={p}>• {p}</li>
            ))}
          </ul>
          <p className="text-xs leading-relaxed text-ink-3">{t.softmax.note}</p>
        </div>
      </div>
    </Card>
  );
}
