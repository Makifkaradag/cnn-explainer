import { motion } from 'motion/react';
import { type ReactNode, useEffect, useState } from 'react';
import { useForward } from '@/hooks/useNetwork';
import { cx } from '@/lib/cx';
import { CLASS_NAMES } from '@/lib/network';
import { argmax } from '@/lib/softmax';
import { formatShape, maxAbs } from '@/lib/tensor';
import { wrapVector } from '@/lib/views';
import type { Tensor3 } from '@/types';
import { PixelGrid } from './PixelGrid';

function Stack({ maps, cell }: { maps: Tensor3; cell: number }) {
  const range = maxAbs(maps);
  const shown = [maps[4], maps[2], maps[0]].filter(Boolean);
  return (
    <div
      className="relative"
      style={{ width: maps[0].length * cell + 12, height: maps[0].length * cell + 12 }}
    >
      {shown.map((m, i) => (
        <div key={i} className="absolute" style={{ left: i * 6, top: 12 - i * 6 }}>
          <PixelGrid data={m} range={range} cellSize={cell} className="shadow-sm" />
        </div>
      ))}
    </div>
  );
}

interface Stage {
  label: string;
  shape: number[];
  visual: ReactNode;
}

/** The animated "image → prediction" strip on the home page, computed live. */
export function PipelineHero() {
  const r = useForward();
  const [active, setActive] = useState(0);
  const winner = argmax(r.probs);

  const stages: Stage[] = [
    {
      label: 'Input',
      shape: [28, 28, 1],
      visual: <PixelGrid data={r.input} scale="gray" cellSize={2.6} />,
    },
    { label: 'Conv', shape: [26, 26, 8], visual: <Stack maps={r.conv1} cell={2.1} /> },
    { label: 'ReLU', shape: [26, 26, 8], visual: <Stack maps={r.act1} cell={2.1} /> },
    { label: 'Pool', shape: [13, 13, 8], visual: <Stack maps={r.pool1} cell={3.4} /> },
    { label: 'Conv', shape: [11, 11, 16], visual: <Stack maps={r.conv2} cell={4} /> },
    { label: 'ReLU', shape: [11, 11, 16], visual: <Stack maps={r.act2} cell={4} /> },
    { label: 'Pool', shape: [5, 5, 16], visual: <Stack maps={r.pool2} cell={8} /> },
    {
      label: 'Flatten',
      shape: [400],
      visual: <PixelGrid data={wrapVector(r.flat, 16)} cellSize={2.6} />,
    },
    {
      label: 'Dense',
      shape: [4],
      visual: (
        <div className="flex flex-col gap-1.5">
          {r.logits.map((z, i) => (
            <div key={i} className="flex items-center gap-1">
              <span
                className={cx(
                  'size-3 rounded-full border',
                  z >= 0 ? 'border-pos bg-pos/40' : 'border-neg bg-neg/30',
                )}
                style={{
                  opacity:
                    0.4 +
                    0.6 * Math.min(1, Math.abs(z) / Math.max(...r.logits.map(Math.abs), 1e-9)),
                }}
              />
            </div>
          ))}
        </div>
      ),
    },
    {
      label: 'Softmax',
      shape: [4],
      visual: (
        <div className="flex w-20 flex-col gap-1">
          {r.probs.map((p, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <span
                className={cx(
                  'w-9 truncate text-[9px]',
                  i === winner ? 'font-semibold text-ink' : 'text-ink-3',
                )}
              >
                {CLASS_NAMES[i]}
              </span>
              <div className="h-2 flex-1 rounded-sm bg-surface-2">
                <div
                  className={cx(
                    'h-full rounded-sm transition-[width] duration-500',
                    i === winner ? 'bg-accent' : 'bg-ink/50',
                  )}
                  style={{ width: `${p * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      ),
    },
  ];

  useEffect(() => {
    const id = window.setInterval(() => setActive((a) => (a + 1) % stages.length), 900);
    return () => window.clearInterval(id);
  }, [stages.length]);

  return (
    <div className="grid grid-cols-2 gap-2 min-[480px]:grid-cols-5 lg:grid-cols-10">
      {stages.map((s, i) => {
        const on = i === active;
        const passed = i <= active;
        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + i * 0.06, duration: 0.4 }}
            className={cx(
              'relative flex flex-col items-center gap-2 rounded-xl border bg-surface px-1.5 pt-3 pb-2 transition-colors duration-300',
              on ? 'border-accent shadow-[0_0_0_3px_var(--accent-soft)]' : 'border-line',
            )}
          >
            <div
              className={cx(
                'flex h-[84px] items-center justify-center transition-opacity duration-300',
                passed ? 'opacity-100' : 'opacity-45',
              )}
            >
              {s.visual}
            </div>
            <div className="text-center">
              <div className={cx('text-xs font-medium', on ? 'text-accent' : 'text-ink')}>
                {s.label}
              </div>
              <div className="font-mono text-[10px] text-ink-3">{formatShape(s.shape)}</div>
            </div>
            {i < stages.length - 1 && (
              <div className="absolute top-1/2 -right-2 z-10 hidden size-2 -translate-y-1/2 rounded-full bg-line-strong lg:block" />
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
