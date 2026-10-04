import { type PointerEvent, useEffect, useRef, useState } from 'react';
import { useTheme } from '@/context/theme';
import { type ColorScale, css, PALETTES, textOn, valueColor } from '@/lib/colors';
import { cx } from '@/lib/cx';
import { fmt, maxAbs } from '@/lib/tensor';
import type { Matrix } from '@/types';

export interface GridCell {
  row: number;
  col: number;
}

export interface Highlight extends GridCell {
  rows?: number;
  cols?: number;
  /** accent: magenta outline + tint · ink: neutral outline · fill: tint only */
  tone?: 'accent' | 'ink' | 'fill';
}

export interface PixelGridProps {
  data: Matrix;
  scale?: ColorScale;
  /** gray: value drawn as white (default 1). diverging: |value| drawn at full colour (default: auto). */
  range?: number;
  /** Preferred on-screen size of one cell in CSS px. The grid shrinks to fit narrow screens. */
  cellSize?: number;
  /** Print the value inside each cell when cells are large enough to read. */
  showValues?: boolean;
  /** Only the first `revealed` cells (row-major) are drawn; the rest look empty. */
  revealed?: number;
  /** Width of an outer ring drawn as zero padding. */
  paddingRing?: number;
  highlights?: Highlight[];
  /** Animate highlight movement (turn off for very fast playback). */
  smooth?: boolean;
  onHover?: (cell: GridCell | null) => void;
  onSelect?: (cell: GridCell) => void;
  className?: string;
  label?: string;
}

const MIN_CELL_FOR_VALUES = 22;

/** Draws a matrix on a crisp, DPR-aware canvas with an HTML overlay for highlights. */
export function PixelGrid({
  data,
  scale = 'diverging',
  range,
  cellSize = 12,
  showValues = false,
  revealed,
  paddingRing = 0,
  highlights = [],
  smooth = true,
  onHover,
  onSelect,
  className,
  label,
}: PixelGridProps) {
  const { theme } = useTheme();
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lastHover = useRef<string | null>(null);
  const [width, setWidth] = useState(0);
  const rows = data.length;
  const cols = data[0]?.length ?? 0;

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !width || !rows || !cols) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 3);
    const W = Math.round(width * dpr);
    const H = Math.round(((width * rows) / cols) * dpr);
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const palette = PALETTES[theme];
    const r = range ?? (scale === 'gray' ? 1 : maxAbs(data));
    const cw = W / cols;
    const ch = H / rows;
    const cellCss = width / cols;
    const drawValues = showValues && cellCss >= MIN_CELL_FOR_VALUES;
    const limit = revealed ?? Infinity;
    ctx.clearRect(0, 0, W, H);
    if (drawValues) {
      ctx.font = `500 ${Math.min(cellCss * 0.3, 11) * dpr}px "JetBrains Mono", monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
    }

    for (let i = 0; i < rows; i++) {
      const y0 = Math.round(i * ch);
      const y1 = Math.round((i + 1) * ch);
      for (let j = 0; j < cols; j++) {
        const x0 = Math.round(j * cw);
        const x1 = Math.round((j + 1) * cw);
        const isPad =
          paddingRing > 0 &&
          (i < paddingRing ||
            j < paddingRing ||
            i >= rows - paddingRing ||
            j >= cols - paddingRing);
        const shown = i * cols + j < limit;
        const color = isPad
          ? palette.padding
          : shown
            ? valueColor(data[i][j], scale, r, theme)
            : palette.empty;
        ctx.fillStyle = css(color);
        ctx.fillRect(x0, y0, x1 - x0, y1 - y0);
        if (isPad && cellCss >= 8) {
          ctx.strokeStyle = palette.grid;
          ctx.lineWidth = dpr;
          ctx.beginPath();
          ctx.moveTo(x0 + 2 * dpr, y1 - 2 * dpr);
          ctx.lineTo(x1 - 2 * dpr, y0 + 2 * dpr);
          ctx.stroke();
        }
        if (drawValues && shown && !isPad) {
          ctx.fillStyle = textOn(color);
          ctx.fillText(fmt(data[i][j], 1), (x0 + x1) / 2, (y0 + y1) / 2 + 0.5 * dpr);
        }
      }
    }

    if (cellCss >= 6) {
      ctx.strokeStyle = palette.grid;
      ctx.lineWidth = Math.max(1, dpr * 0.75);
      ctx.beginPath();
      for (let j = 1; j < cols; j++) {
        const x = Math.round(j * cw) + 0.5;
        ctx.moveTo(x, 0);
        ctx.lineTo(x, H);
      }
      for (let i = 1; i < rows; i++) {
        const y = Math.round(i * ch) + 0.5;
        ctx.moveTo(0, y);
        ctx.lineTo(W, y);
      }
      ctx.stroke();
    }
  }, [data, width, rows, cols, theme, range, scale, showValues, revealed, paddingRing]);

  const cellAt = (e: PointerEvent<HTMLDivElement>): GridCell | null => {
    const rect = e.currentTarget.getBoundingClientRect();
    const col = Math.floor(((e.clientX - rect.left) / rect.width) * cols);
    const row = Math.floor(((e.clientY - rect.top) / rect.height) * rows);
    if (row < 0 || col < 0 || row >= rows || col >= cols) return null;
    return { row, col };
  };

  const emitHover = (cell: GridCell | null) => {
    const key = cell ? `${cell.row},${cell.col}` : null;
    if (key === lastHover.current) return;
    lastHover.current = key;
    onHover?.(cell);
  };

  const interactive = Boolean(onHover || onSelect);

  return (
    <div
      ref={wrapRef}
      role="img"
      aria-label={label ?? `${rows} by ${cols} grid`}
      className={cx(
        'relative max-w-full touch-none overflow-hidden rounded-[3px] ring-1 ring-line',
        interactive && 'cursor-crosshair',
        className,
      )}
      style={{ width: cols * cellSize, aspectRatio: `${cols} / ${rows}` }}
      onPointerMove={interactive ? (e) => emitHover(cellAt(e)) : undefined}
      onPointerLeave={interactive ? () => emitHover(null) : undefined}
      onPointerDown={
        interactive
          ? (e) => {
              const cell = cellAt(e);
              if (!cell) return;
              emitHover(cell);
              onSelect?.(cell);
            }
          : undefined
      }
    >
      <canvas ref={canvasRef} className="block size-full" />
      {highlights.map((h, i) => (
        <div
          key={i}
          className={cx(
            'pointer-events-none absolute',
            smooth && 'transition-[left,top,width,height] duration-150 ease-out',
            h.tone === 'ink'
              ? 'outline-2 -outline-offset-1 outline-ink'
              : h.tone === 'fill'
                ? 'bg-accent-soft'
                : 'bg-accent-soft outline-2 -outline-offset-1 outline-accent',
          )}
          style={{
            left: `${(h.col / cols) * 100}%`,
            top: `${(h.row / rows) * 100}%`,
            width: `${((h.cols ?? 1) / cols) * 100}%`,
            height: `${((h.rows ?? 1) / rows) * 100}%`,
          }}
        />
      ))}
    </div>
  );
}
