import { type CSSProperties, useState } from 'react';
import { useTheme } from '@/context/theme';
import { css, textOn, valueColor } from '@/lib/colors';
import { cx } from '@/lib/cx';
import { fmt, maxAbs } from '@/lib/tensor';
import type { Matrix } from '@/types';
import type { GridCell } from './PixelGrid';

/** Text input that lets you type intermediate states like "-" or "0." before committing. */
function NumberCell({
  value,
  onCommit,
  className,
  style,
  label,
  onFocus,
}: {
  value: number;
  onCommit: (v: number) => void;
  className?: string;
  style?: CSSProperties;
  label: string;
  onFocus?: () => void;
}) {
  const [draft, setDraft] = useState<string | null>(null);
  return (
    <input
      inputMode="decimal"
      aria-label={label}
      value={draft ?? fmt(value, 2)}
      onFocus={(e) => {
        setDraft(fmt(value, 3));
        e.target.select();
        onFocus?.();
      }}
      onChange={(e) => {
        setDraft(e.target.value);
        const n = Number(e.target.value);
        if (e.target.value.trim() !== '' && Number.isFinite(n))
          onCommit(Math.max(-99, Math.min(99, n)));
      }}
      onBlur={() => setDraft(null)}
      onKeyDown={(e) => {
        if (e.key === 'Enter') e.currentTarget.blur();
      }}
      className={cx(
        'w-full min-w-0 rounded-md text-center font-mono text-[13px] tabular-nums transition outline-none focus:ring-2 focus:ring-accent',
        className,
      )}
      style={style}
    />
  );
}

interface KernelEditorProps {
  /** Display only — no inputs. */
  readOnly?: boolean;
  kernel: Matrix;
  onChange?: (kernel: Matrix) => void;
  highlight?: GridCell | null;
  onHoverCell?: (cell: GridCell | null) => void;
  bias?: number;
  onBiasChange?: (bias: number) => void;
}

/** Editable kernel weights, tinted blue (negative) → orange (positive). */
export function KernelEditor({
  kernel,
  onChange,
  highlight,
  onHoverCell,
  bias,
  onBiasChange,
  readOnly = false,
}: KernelEditorProps) {
  const { theme } = useTheme();
  const k = kernel.length;
  const range = Math.max(maxAbs(kernel), 1e-6);

  const setCell = (r: number, c: number, v: number) =>
    onChange?.(kernel.map((row, i) => row.map((x, j) => (i === r && j === c ? v : x))));

  return (
    <div className="flex flex-col gap-2">
      <div
        className="grid gap-1"
        style={{ gridTemplateColumns: `repeat(${k}, minmax(0, 1fr))`, maxWidth: k * 52 }}
        onMouseLeave={() => onHoverCell?.(null)}
      >
        {kernel.flatMap((row, r) =>
          row.map((v, c) => {
            const color = valueColor(v, 'diverging', range, theme);
            const active = highlight?.row === r && highlight?.col === c;
            if (readOnly) {
              return (
                <div
                  key={`${r}-${c}`}
                  className="flex h-10 items-center justify-center rounded-md border border-line font-mono text-[13px] tabular-nums"
                  style={{ background: css(color), color: textOn(color) }}
                >
                  {fmt(v, 2)}
                </div>
              );
            }
            return (
              <div key={`${r}-${c}`} onMouseEnter={() => onHoverCell?.({ row: r, col: c })}>
                <NumberCell
                  label={`Kernel weight row ${r + 1} column ${c + 1}`}
                  value={v}
                  onCommit={(n) => setCell(r, c, n)}
                  className={cx(
                    'h-10 border',
                    active ? 'border-accent ring-2 ring-accent' : 'border-line',
                  )}
                  style={{ background: css(color), color: textOn(color) }}
                />
              </div>
            );
          }),
        )}
      </div>
      {onBiasChange && bias !== undefined && (
        <label className="flex items-center gap-2 text-xs text-ink-2">
          <span>
            bias <span className="math">b</span>
          </span>
          <div className="w-16">
            <NumberCell
              label="Bias"
              value={bias}
              onCommit={onBiasChange}
              className="h-8 border border-line bg-surface text-ink"
            />
          </div>
        </label>
      )}
    </div>
  );
}
