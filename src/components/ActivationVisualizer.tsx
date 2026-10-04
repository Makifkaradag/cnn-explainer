import { ACTIVATIONS } from '@/lib/activations';
import { cx } from '@/lib/cx';
import { fmt } from '@/lib/tensor';
import type { ActivationName } from '@/types';

interface ActivationPlotProps {
  name: ActivationName;
  /** Optional input value to mark on the curve. */
  x?: number | null;
  /** Domain plotted on the x-axis: [−domain, domain]. */
  domain?: number;
  className?: string;
  showLabel?: boolean;
}

const W = 240;
const H = 160;
const PAD = 14;

/** SVG plot of an activation function, with an optional highlighted point. */
export function ActivationPlot({
  name,
  x,
  domain = 3,
  className,
  showLabel = true,
}: ActivationPlotProps) {
  const info = ACTIVATIONS[name];
  const [yMin, yMax] = name === 'relu' || name === 'leakyRelu' ? [-1, domain] : info.plotRange;
  const sx = (v: number) => PAD + ((v + domain) / (2 * domain)) * (W - 2 * PAD);
  const sy = (v: number) => H - PAD - ((v - yMin) / (yMax - yMin)) * (H - 2 * PAD);

  const points: string[] = [];
  for (let i = 0; i <= 120; i++) {
    const v = -domain + (2 * domain * i) / 120;
    points.push(`${sx(v).toFixed(1)},${sy(info.fn(v)).toFixed(1)}`);
  }

  const marker = x == null ? null : Math.max(-domain, Math.min(domain, x));
  const markerY = marker == null ? 0 : info.fn(marker);

  return (
    <figure className={cx('min-w-0', className)}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        role="img"
        aria-label={`${info.label}: ${info.formula}`}
      >
        {/* axes */}
        <line
          x1={PAD}
          x2={W - PAD}
          y1={sy(0)}
          y2={sy(0)}
          className="stroke-line-strong"
          strokeWidth={1}
        />
        <line
          x1={sx(0)}
          x2={sx(0)}
          y1={PAD}
          y2={H - PAD}
          className="stroke-line-strong"
          strokeWidth={1}
        />
        {[-domain, domain].map((t) => (
          <text
            key={t}
            x={sx(t)}
            y={sy(0) + 12}
            textAnchor={t < 0 ? 'start' : 'end'}
            className="fill-ink-3 font-mono text-[9px]"
          >
            {t}
          </text>
        ))}
        <text x={sx(0) + 4} y={PAD + 6} className="fill-ink-3 font-mono text-[9px]">
          {fmt(yMax, 1)}
        </text>
        <polyline
          points={points.join(' ')}
          fill="none"
          className="stroke-ink"
          strokeWidth={2}
          strokeLinejoin="round"
        />
        {marker != null && (
          <g>
            <line
              x1={sx(marker)}
              x2={sx(marker)}
              y1={sy(0)}
              y2={sy(markerY)}
              className="stroke-accent"
              strokeDasharray="3 3"
            />
            <line
              x1={sx(0)}
              x2={sx(marker)}
              y1={sy(markerY)}
              y2={sy(markerY)}
              className="stroke-accent"
              strokeDasharray="3 3"
            />
            <circle
              cx={sx(marker)}
              cy={sy(markerY)}
              r={4.5}
              className="fill-accent stroke-surface transition-all duration-150"
              strokeWidth={2}
            />
          </g>
        )}
      </svg>
      {showLabel && (
        <figcaption className="mt-1 flex items-baseline justify-between gap-2 text-xs">
          <span className="font-medium text-ink">{info.label}</span>
          <span className="font-serif text-ink-2 italic">{info.formula}</span>
        </figcaption>
      )}
    </figure>
  );
}
