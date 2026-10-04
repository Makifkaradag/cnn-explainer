import { type PointerEvent, useRef, useState } from 'react';
import { cloneMatrix, zeros } from '@/lib/tensor';
import type { Matrix } from '@/types';
import { Button, Segmented } from './ui/controls';
import { EraserIcon, PencilIcon, ResetIcon } from './ui/Icons';
import { PixelGrid } from './PixelGrid';

const SIZE = 28;

/** Soft round brush: full intensity in the middle, fading to 0 at the radius. */
function paint(m: Matrix, x: number, y: number, radius: number, erase: boolean) {
  const r0 = Math.max(0, Math.floor(y - radius - 1));
  const r1 = Math.min(SIZE - 1, Math.ceil(y + radius + 1));
  const c0 = Math.max(0, Math.floor(x - radius - 1));
  const c1 = Math.min(SIZE - 1, Math.ceil(x + radius + 1));
  for (let r = r0; r <= r1; r++) {
    for (let c = c0; c <= c1; c++) {
      const d = Math.hypot(c + 0.5 - x, r + 0.5 - y);
      const v = Math.max(0, Math.min(1, radius + 0.5 - d));
      if (v <= 0) continue;
      m[r][c] = erase ? Math.min(m[r][c], 1 - v) : Math.max(m[r][c], v);
    }
  }
}

interface DrawPadProps {
  /** Drawing to continue from (e.g. when returning to the tab). */
  initial?: Matrix;
  onCommit: (image: Matrix) => void;
}

/** A 28×28 drawing surface. Each finished stroke is committed as the new input image. */
export function DrawPad({ initial, onCommit }: DrawPadProps) {
  const [image, setImage] = useState<Matrix>(() =>
    initial ? cloneMatrix(initial) : zeros(SIZE, SIZE),
  );
  const [tool, setTool] = useState<'brush' | 'eraser'>('brush');
  const [brush, setBrush] = useState(1.3);
  const drawing = useRef(false);
  const last = useRef<[number, number] | null>(null);

  const toGrid = (e: PointerEvent<HTMLDivElement>): [number, number] => {
    const rect = e.currentTarget.getBoundingClientRect();
    return [
      ((e.clientX - rect.left) / rect.width) * SIZE,
      ((e.clientY - rect.top) / rect.height) * SIZE,
    ];
  };

  const strokeTo = (point: [number, number]) => {
    const from = last.current ?? point;
    last.current = point;
    setImage((prev) => {
      const next = cloneMatrix(prev);
      // Interpolate so fast strokes stay continuous.
      const steps = Math.max(
        1,
        Math.ceil(Math.hypot(point[0] - from[0], point[1] - from[1]) / 0.4),
      );
      for (let s = 1; s <= steps; s++) {
        const t = s / steps;
        paint(
          next,
          from[0] + (point[0] - from[0]) * t,
          from[1] + (point[1] - from[1]) * t,
          brush,
          tool === 'eraser',
        );
      }
      return next;
    });
  };

  const end = () => {
    if (!drawing.current) return;
    drawing.current = false;
    last.current = null;
    onCommit(image);
  };

  const clear = () => {
    const blank = zeros(SIZE, SIZE);
    setImage(blank);
    onCommit(blank);
  };

  return (
    <div className="flex flex-col gap-3">
      <div
        className="w-full max-w-[280px] cursor-crosshair touch-none"
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          drawing.current = true;
          last.current = null;
          strokeTo(toGrid(e));
        }}
        onPointerMove={(e) => drawing.current && strokeTo(toGrid(e))}
        onPointerUp={end}
        onPointerCancel={end}
      >
        <PixelGrid data={image} scale="gray" cellSize={10} label="Drawing canvas" />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Segmented
          aria-label="Drawing tool"
          value={tool}
          onChange={setTool}
          options={[
            {
              value: 'brush',
              label: (
                <span className="flex items-center gap-1">
                  <PencilIcon /> Brush
                </span>
              ),
            },
            {
              value: 'eraser',
              label: (
                <span className="flex items-center gap-1">
                  <EraserIcon /> Eraser
                </span>
              ),
            },
          ]}
        />
        <Segmented
          aria-label="Brush size"
          value={brush}
          onChange={setBrush}
          options={[
            { value: 0.9, label: 'Thin' },
            { value: 1.3, label: 'Medium' },
            { value: 2, label: 'Thick' },
          ]}
        />
        <Button size="sm" onClick={clear} icon={<ResetIcon />}>
          Clear
        </Button>
      </div>
      <p className="text-xs text-ink-3">
        Draw a circle, square, triangle or cross — the tiny model only knows these four.
      </p>
    </div>
  );
}
