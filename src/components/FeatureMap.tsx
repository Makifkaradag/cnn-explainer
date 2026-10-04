import type { ReactNode } from 'react';
import { cx } from '@/lib/cx';
import type { ColorScale } from '@/lib/colors';
import { maxAbs } from '@/lib/tensor';
import type { Matrix, Tensor3 } from '@/types';
import { PixelGrid } from './PixelGrid';

interface FeatureMapProps {
  data: Matrix;
  title?: ReactNode;
  cellSize?: number;
  scale?: ColorScale;
  range?: number;
  active?: boolean;
  onClick?: () => void;
  className?: string;
}

/** A single labelled feature-map thumbnail, optionally clickable. */
export function FeatureMap({
  data,
  title,
  cellSize = 4,
  scale = 'diverging',
  range,
  active,
  onClick,
  className,
}: FeatureMapProps) {
  const body = (
    <>
      <PixelGrid data={data} scale={scale} range={range} cellSize={cellSize} className="mx-auto" />
      {title != null && (
        <div className="mt-1.5 truncate text-center text-[11px] leading-tight text-ink-3">
          {title}
        </div>
      )}
    </>
  );
  if (!onClick) return <figure className={cx('min-w-0', className)}>{body}</figure>;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cx(
        'min-w-0 cursor-pointer rounded-lg p-1.5 transition',
        active ? 'bg-accent-soft ring-2 ring-accent' : 'hover:bg-surface-2',
        className,
      )}
    >
      {body}
    </button>
  );
}

interface FeatureMapStackProps {
  maps: Tensor3;
  cellSize?: number;
  /** Show at most this many channels. */
  limit?: number;
  /** Show a "+N more" label when channels are hidden. */
  showOverflow?: boolean;
  labels?: (index: number) => ReactNode;
  /** Use one colour range for all maps so their strengths are comparable. */
  sharedRange?: boolean;
  selected?: number;
  onSelect?: (index: number) => void;
  className?: string;
}

/** A grid of channel thumbnails for a whole tensor. */
export function FeatureMapStack({
  maps,
  cellSize = 3,
  limit = maps.length,
  showOverflow = true,
  labels = (i) => `#${i + 1}`,
  sharedRange = true,
  selected,
  onSelect,
  className,
}: FeatureMapStackProps) {
  const range = sharedRange ? maxAbs(maps) : undefined;
  const shown = maps.slice(0, limit);
  return (
    <div className={cx('flex flex-wrap gap-1.5', className)}>
      {shown.map((m, i) => (
        <FeatureMap
          key={i}
          data={m}
          cellSize={cellSize}
          range={range}
          title={labels(i)}
          active={selected === i}
          onClick={onSelect ? () => onSelect(i) : undefined}
        />
      ))}
      {showOverflow && maps.length > shown.length && (
        <div className="flex items-center px-2 font-mono text-xs text-ink-3">
          +{maps.length - shown.length} more
        </div>
      )}
    </div>
  );
}
