import { Suspense, useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router';
import { REPO_URL } from '@/config';
import { useTheme } from '@/context/theme';
import { type Lang, useI18n, useT } from '@/i18n/context';
import { cx } from '@/lib/cx';
import { CloseIcon, GithubIcon, MenuIcon, MoonIcon, SunIcon } from '../ui/Icons';

export function Logo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <rect width="32" height="32" rx="7" className="fill-ink" />
      {[0, 1, 2].flatMap((r) =>
        [0, 1, 2].map((c) => {
          const last = r === 2 && c === 2;
          const op = [1, 0.55, 0.25, 0.55, 1, 0.55, 0.25, 0.55][r * 3 + c] ?? 1;
          return (
            <rect
              key={`${r}${c}`}
              x={6 + c * 7.5}
              y={6 + r * 7.5}
              width="5"
              height="5"
              rx="1"
              className={last ? 'fill-pos' : 'fill-bg'}
              opacity={last ? 1 : op}
            />
          );
        }),
      )}
    </svg>
  );
}

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const t = useT();
  const label = theme === 'dark' ? t.nav.toLight : t.nav.toDark;
  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="flex size-9 cursor-pointer items-center justify-center rounded-lg text-ink-2 transition hover:bg-surface-2 hover:text-ink"
      aria-label={label}
      title={label}
    >
      {theme === 'dark' ? (
        <SunIcon className="size-[18px]" />
      ) : (
        <MoonIcon className="size-[18px]" />
      )}
    </button>
  );
}

const LANGS: { value: Lang; label: string; name: string }[] = [
  { value: 'en', label: 'EN', name: 'English' },
  { value: 'tr', label: 'TR', name: 'Türkçe' },
];

function LanguageSwitch() {
  const { lang, setLang, t } = useI18n();
  return (
    <div
      role="radiogroup"
      aria-label={t.nav.language}
      className="flex items-center rounded-lg border border-line bg-surface-2 p-0.5"
    >
      {LANGS.map((l) => {
        const active = l.value === lang;
        return (
          <button
            key={l.value}
            type="button"
            role="radio"
            aria-checked={active}
            title={l.name}
            lang={l.value}
            onClick={() => setLang(l.value)}
            className={cx(
              'h-7 cursor-pointer rounded-md px-2 font-mono text-[11px] font-medium transition',
              active
                ? 'bg-surface text-ink shadow-sm ring-1 ring-line'
                : 'text-ink-3 hover:text-ink',
            )}
          >
            {l.label}
          </button>
        );
      })}
    </div>
  );
}

function Header() {
  const t = useT();
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const [lastPath, setLastPath] = useState(pathname);
  // Close the mobile menu whenever the route changes.
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  const nav = [
    { to: '/explore', label: t.nav.explore },
    { to: '/playground', label: t.nav.playground },
    { to: '/training', label: t.nav.training },
    { to: '/concepts', label: t.nav.concepts },
  ];

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    cx(
      'rounded-lg px-3 py-1.5 text-sm transition',
      isActive ? 'bg-surface-2 text-ink font-medium' : 'text-ink-2 hover:text-ink',
    );

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/85 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-4 px-4 sm:px-6">
        <Link to="/" className="flex shrink-0 items-center gap-2.5 font-semibold tracking-tight">
          <Logo className="size-7" />
          <span className="hidden min-[400px]:inline">CNN Explainer</span>
        </Link>
        <nav className="ml-4 hidden items-center gap-1 md:flex">
          {nav.map((n) => (
            <NavLink key={n.to} to={n.to} className={linkClass}>
              {n.label}
            </NavLink>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-1">
          <LanguageSwitch />
          <a
            href={REPO_URL}
            target="_blank"
            rel="noreferrer"
            className="flex size-9 items-center justify-center rounded-lg text-ink-2 transition hover:bg-surface-2 hover:text-ink"
            aria-label={t.nav.github}
            title={t.nav.github}
          >
            <GithubIcon className="size-[18px]" />
          </a>
          <ThemeToggle />
          <button
            type="button"
            className="flex size-9 cursor-pointer items-center justify-center rounded-lg text-ink-2 md:hidden"
            onClick={() => setOpen((o) => !o)}
            aria-label={t.nav.menu}
            aria-expanded={open}
          >
            {open ? <CloseIcon className="size-5" /> : <MenuIcon className="size-5" />}
          </button>
        </div>
      </div>
      {open && (
        <nav className="flex flex-col gap-1 border-t border-line px-4 py-3 md:hidden">
          {nav.map((n) => (
            <NavLink key={n.to} to={n.to} className={linkClass}>
              {n.label}
            </NavLink>
          ))}
        </nav>
      )}
    </header>
  );
}

function Footer() {
  const t = useT();
  return (
    <footer className="mt-24 border-t border-line">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-8 text-sm text-ink-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex items-center gap-2">
          <Logo className="size-5" />
          <span>{t.footer.tagline}</span>
        </div>
        <div className="max-w-xl text-xs leading-relaxed">{t.footer.note}</div>
      </div>
    </footer>
  );
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);
  return null;
}

export function Layout() {
  const t = useT();
  return (
    <div className="flex min-h-screen flex-col">
      <ScrollToTop />
      <Header />
      <main className="flex-1">
        <Suspense
          fallback={
            <div className="mx-auto max-w-7xl px-6 py-24 text-sm text-ink-3">
              {t.common.loading}
            </div>
          }
        >
          <Outlet />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
