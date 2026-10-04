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

export type TagKind = 'computed' | 'simulated' | 'illustrative';

const TAGS: Record<TagKind, { label: string; title: string; className: string; dot: string }> = {
  computed: {
    label: 'Real computation',
    title: 'These numbers are produced by the actual math implemented in this app.',
    className: 'border-ok/30 text-ok',
    dot: 'bg-ok',
  },
  simulated: {
    label: 'Simplified simulation',
    title: 'Real math on a deliberately tiny, simplified network — not a production CNN.',
    className: 'border-warn/30 text-warn',
    dot: 'bg-warn',
  },
  illustrative: {
    label: 'Illustrative',
    title: 'A conceptual picture to build intuition. Not computed by a trained network.',
    className: 'border-accent/30 text-accent',
    dot: 'bg-accent',
  },
};

/** Labels whether a visual shows real math, a simplified simulation, or an illustration. */
export function Tag({ kind, children }: { kind: TagKind; children?: ReactNode }) {
  const t = TAGS[kind];
  return (
    <span
      title={t.title}
      className={cx(
        'inline-flex h-6 shrink-0 items-center gap-1.5 self-start rounded-full border px-2 text-[11px] font-medium whitespace-nowrap',
        t.className,
      )}
    >
      <span className={cx('size-1.5 rounded-full', t.dot)} />
      {children ?? t.label}
    </span>
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
