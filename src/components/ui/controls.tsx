import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Link } from 'react-router';
import { cx } from '@/lib/cx';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: 'sm' | 'md';
  icon?: ReactNode;
}

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-ink text-bg hover:opacity-90 border border-transparent',
  secondary: 'bg-surface text-ink border border-line hover:border-line-strong hover:bg-surface-2',
  ghost: 'text-ink-2 hover:text-ink hover:bg-surface-2 border border-transparent',
};

function buttonClasses(
  variant: ButtonVariant,
  size: 'sm' | 'md',
  iconOnly: boolean,
  className?: string,
) {
  return cx(
    'inline-flex shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-lg font-medium whitespace-nowrap transition select-none disabled:pointer-events-none disabled:opacity-40',
    size === 'sm' ? 'h-8 px-2.5 text-[13px]' : 'h-10 px-4 text-sm',
    iconOnly && (size === 'sm' ? 'w-8 px-0' : 'w-10 px-0'),
    variants[variant],
    className,
  );
}

export function Button({
  variant = 'secondary',
  size = 'md',
  icon,
  className,
  children,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button type={type} className={buttonClasses(variant, size, !children, className)} {...props}>
      {icon && <span className="text-[1.1em]">{icon}</span>}
      {children}
    </button>
  );
}

/** A router link that looks like a Button. */
export function ButtonLink({
  to,
  variant = 'secondary',
  size = 'md',
  icon,
  iconAfter,
  className,
  children,
}: {
  to: string;
  variant?: ButtonVariant;
  size?: 'sm' | 'md';
  icon?: ReactNode;
  iconAfter?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Link to={to} className={buttonClasses(variant, size, false, className)}>
      {icon && <span className="text-[1.1em]">{icon}</span>}
      {children}
      {iconAfter && <span className="text-[1.1em]">{iconAfter}</span>}
    </Link>
  );
}

export interface Option<T> {
  value: T;
  label: ReactNode;
  title?: string;
}

interface SegmentedProps<T> {
  value: T;
  options: Option<T>[];
  onChange: (value: T) => void;
  size?: 'sm' | 'md';
  className?: string;
  'aria-label'?: string;
}

export function Segmented<T extends string | number>({
  value,
  options,
  onChange,
  size = 'sm',
  className,
  ...rest
}: SegmentedProps<T>) {
  return (
    <div
      role="radiogroup"
      aria-label={rest['aria-label']}
      className={cx(
        'inline-flex max-w-full self-start overflow-x-auto rounded-lg border border-line bg-surface-2 p-0.5',
        className,
      )}
    >
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={String(o.value)}
            type="button"
            role="radio"
            aria-checked={active}
            title={o.title}
            onClick={() => onChange(o.value)}
            className={cx(
              'cursor-pointer rounded-md font-medium whitespace-nowrap transition',
              size === 'sm' ? 'h-7 px-2.5 text-xs' : 'h-8 px-3 text-sm',
              active
                ? 'bg-surface text-ink shadow-sm ring-1 ring-line'
                : 'text-ink-3 hover:text-ink',
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

export function Field({
  label,
  hint,
  children,
  className,
}: {
  label: ReactNode;
  hint?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cx('flex max-w-full min-w-0 flex-col gap-1.5', className)}>
      <div className="flex items-baseline justify-between gap-2 text-xs">
        <span className="font-medium text-ink-2">{label}</span>
        {hint != null && <span className="font-mono text-ink-3">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

interface SliderProps {
  label: ReactNode;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  format?: (value: number) => string;
  className?: string;
}

export function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  format,
  className,
}: SliderProps) {
  return (
    <Field label={label} hint={format ? format(value) : value} className={className}>
      <input
        type="range"
        className="range"
        min={min}
        max={max}
        step={step}
        value={value}
        aria-label={typeof label === 'string' ? label : undefined}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </Field>
  );
}

interface SelectProps<T extends string> {
  value: T;
  options: Option<T>[];
  onChange: (value: T) => void;
  className?: string;
  'aria-label'?: string;
}

export function Select<T extends string>({
  value,
  options,
  onChange,
  className,
  ...rest
}: SelectProps<T>) {
  return (
    <div className={cx('relative', className)}>
      <select
        value={value}
        aria-label={rest['aria-label']}
        onChange={(e) => onChange(e.target.value as T)}
        className="h-9 w-full cursor-pointer appearance-none rounded-lg border border-line bg-surface pr-8 pl-3 text-sm text-ink transition hover:border-line-strong"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {typeof o.label === 'string' ? o.label : o.value}
          </option>
        ))}
      </select>
      <svg
        className="pointer-events-none absolute top-1/2 right-2.5 size-4 -translate-y-1/2 text-ink-3"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        aria-hidden="true"
      >
        <path d="M6 9l6 6 6-6" />
      </svg>
    </div>
  );
}
