import type { ReactNode } from 'react';
import { cx } from '@/lib/cx';
import { formatShape } from '@/lib/tensor';

export function Card({
  children,
  className,
  title,
  aside,
}: {
  children: ReactNode;
  className?: string;
  title?: ReactNode;
  aside?: ReactNode;
}) {
  return (
    <div className={cx('rounded-xl border border-line bg-surface', className)}>
      {(title || aside) && (
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-4 py-2.5">
          <div className="text-[13px] font-semibold text-ink">{title}</div>
          {aside}
        </div>
      )}
      {children}
    </div>
  );
}

export function Note({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cx(
        'rounded-lg border border-dashed border-line-strong px-3.5 py-2.5 text-[13px] leading-relaxed text-ink-2',
        className,
      )}
    >
      {children}
    </div>
  );
}

export function ShapeChip({ shape, className }: { shape: readonly number[]; className?: string }) {
  return (
    <span
      className={cx(
        'inline-flex h-6 items-center rounded-md bg-surface-2 px-1.5 font-mono text-[11px] text-ink-2',
        className,
      )}
    >
      {formatShape(shape)}
    </span>
  );
}

export function Stat({
  label,
  value,
  sub,
  className,
}: {
  label: ReactNode;
  value: ReactNode;
  sub?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cx('rounded-lg border border-line bg-surface px-3 py-2', className)}>
      <div className="text-[11px] font-medium tracking-wide text-ink-3 uppercase">{label}</div>
      <div className="mt-0.5 font-mono text-lg text-ink tabular-nums">{value}</div>
      {sub && <div className="text-[11px] text-ink-3">{sub}</div>}
    </div>
  );
}

/** A small caption above a visual, e.g. "Input · 28×28". */
export function Caption({ children, shape }: { children: ReactNode; shape?: readonly number[] }) {
  return (
    <div className="mb-2 flex items-center justify-between gap-2">
      <span className="text-xs font-medium text-ink-2">{children}</span>
      {shape && <ShapeChip shape={shape} />}
    </div>
  );
}

export function Formula({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cx(
        'overflow-x-auto rounded-lg bg-surface-2 px-4 py-3 text-center font-serif text-[17px] whitespace-nowrap text-ink',
        className,
      )}
    >
      {children}
    </div>
  );
}
