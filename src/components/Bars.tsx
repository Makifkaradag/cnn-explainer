import { cx } from '@/lib/cx';
import { fmt } from '@/lib/tensor';

interface BarsProps {
  labels: readonly string[];
  values: number[];
  /** probability: 0–1 bars with percentages. signed: bars grow left/right from zero. */
  kind?: 'probability' | 'signed';
  highlight?: number;
  onHover?: (index: number | null) => void;
  className?: string;
}

/** Horizontal bar list used for logits and class probabilities. */
export function Bars({
  labels,
  values,
  kind = 'probability',
  highlight,
  onHover,
  className,
}: BarsProps) {
  const maxAbs = Math.max(1e-9, ...values.map(Math.abs));
  return (
    <div className={cx('flex flex-col gap-1.5', className)} onMouseLeave={() => onHover?.(null)}>
      {values.map((v, i) => {
        const active = highlight === i;
        return (
          <div
            key={labels[i]}
            className={cx(
              'grid grid-cols-[4.5rem_minmax(0,1fr)_3.5rem] items-center gap-2 text-xs',
              onHover && 'cursor-default',
            )}
            onMouseEnter={() => onHover?.(i)}
          >
            <span className={cx('truncate', active ? 'font-semibold text-ink' : 'text-ink-2')}>
              {labels[i]}
            </span>
            <div className="relative h-4 overflow-hidden rounded-sm bg-surface-2">
              {kind === 'probability' ? (
                <div
                  className={cx(
                    'h-full rounded-sm transition-[width] duration-300',
                    active ? 'bg-accent' : 'bg-ink/70',
                  )}
                  style={{ width: `${Math.max(0, Math.min(1, v)) * 100}%` }}
                />
              ) : (
                <>
                  <div className="absolute inset-y-0 left-1/2 w-px bg-line-strong" />
                  <div
                    className={cx(
                      'absolute inset-y-0 transition-all duration-300',
                      v >= 0 ? 'bg-pos' : 'bg-neg',
                    )}
                    style={
                      v >= 0
                        ? { left: '50%', width: `${(v / maxAbs) * 50}%` }
                        : { right: '50%', width: `${(-v / maxAbs) * 50}%` }
                    }
                  />
                </>
              )}
            </div>
            <span className="text-right font-mono text-ink tabular-nums">
              {kind === 'probability' ? `${(v * 100).toFixed(1)}%` : fmt(v, 2)}
            </span>
          </div>
        );
      })}
    </div>
  );
}
