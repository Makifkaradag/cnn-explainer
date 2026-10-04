import { fmt } from '@/lib/tensor';

export interface Series {
  name: string;
  values: number[];
  /** CSS colour, e.g. 'var(--accent)'. */
  color: string;
  dashed?: boolean;
}

interface LineChartProps {
  series: Series[];
  /** Fixed y-range; defaults to [0, max]. */
  yDomain?: [number, number];
  format?: (v: number) => string;
  height?: number;
  label: string;
  /** x value of the last point (when older points were dropped). */
  lastX?: number;
}

const W = 360;
const PAD = { l: 34, r: 10, t: 10, b: 20 };

/** Minimal dependency-free SVG line chart for training curves. */
export function LineChart({
  series,
  yDomain,
  format = (v) => fmt(v, 2),
  height = 150,
  label,
  lastX,
}: LineChartProps) {
  const H = height;
  const n = Math.max(2, ...series.map((s) => s.values.length));
  const all = series.flatMap((s) => s.values);
  const [y0, y1] = yDomain ?? [0, all.length ? Math.max(1e-6, ...all) * 1.05 : 1];
  const sx = (i: number) => PAD.l + (i / (n - 1)) * (W - PAD.l - PAD.r);
  const sy = (v: number) =>
    PAD.t + (1 - (Math.min(y1, Math.max(y0, v)) - y0) / (y1 - y0)) * (H - PAD.t - PAD.b);

  return (
    <figure className="min-w-0">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={label}>
        {[0, 0.5, 1].map((t) => {
          const v = y0 + t * (y1 - y0);
          return (
            <g key={t}>
              <line
                x1={PAD.l}
                x2={W - PAD.r}
                y1={sy(v)}
                y2={sy(v)}
                className="stroke-line"
                strokeWidth={1}
              />
              <text
                x={PAD.l - 6}
                y={sy(v) + 3}
                textAnchor="end"
                className="fill-ink-3 font-mono text-[9px]"
              >
                {format(v)}
              </text>
            </g>
          );
        })}
        <text x={W - PAD.r} y={H - 4} textAnchor="end" className="fill-ink-3 font-mono text-[9px]">
          iteration {lastX ?? Math.max(0, n - 1)}
        </text>
        {series.map((s) => {
          if (s.values.length === 0) return null;
          const pts = s.values.map((v, i) => `${sx(i).toFixed(1)},${sy(v).toFixed(1)}`).join(' ');
          const last = s.values.length - 1;
          return (
            <g key={s.name}>
              <polyline
                points={pts}
                fill="none"
                stroke={s.color}
                strokeWidth={1.75}
                strokeDasharray={s.dashed ? '4 3' : undefined}
                strokeLinejoin="round"
              />
              <circle cx={sx(last)} cy={sy(s.values[last])} r={3} fill={s.color} />
            </g>
          );
        })}
      </svg>
      <figcaption className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-ink-3">
        {series.map((s) => (
          <span key={s.name} className="flex items-center gap-1.5">
            <span className="inline-block h-0.5 w-4" style={{ background: s.color }} />
            {s.name}
            {s.values.length > 0 && (
              <span className="font-mono text-ink-2">{format(s.values[s.values.length - 1])}</span>
            )}
          </span>
        ))}
      </figcaption>
    </figure>
  );
}
