import { Link } from 'react-router';
import { useT } from '@/i18n/context';

export function NotFound() {
  const t = useT();
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center gap-4 px-4 py-32 text-center">
      <div className="font-mono text-sm text-ink-3">404</div>
      <h1 className="text-2xl font-semibold">{t.notFound.title}</h1>
      <Link to="/" className="text-sm text-accent underline-offset-4 hover:underline">
        {t.notFound.back}
      </Link>
    </div>
  );
}
