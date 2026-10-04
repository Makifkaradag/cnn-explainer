import { TrainingSimulator } from '@/components/TrainingSimulator';
import { useT } from '@/i18n/context';

export function Training() {
  const t = useT();
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <header className="mb-8 flex flex-col gap-3">
        <span className="font-mono text-xs text-ink-3">{t.training.eyebrow}</span>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{t.training.title}</h1>
        <p className="max-w-2xl font-serif text-lg leading-relaxed text-ink-2">
          {t.training.intro}
        </p>
      </header>
      <TrainingSimulator />
    </div>
  );
}
