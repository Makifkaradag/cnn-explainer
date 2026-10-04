import { motion } from 'motion/react';
import { Link } from 'react-router';
import { ExamplePicker } from '@/components/ImageInput';
import { PipelineHero } from '@/components/PipelineHero';
import { ButtonLink } from '@/components/ui/controls';
import { ArrowRightIcon } from '@/components/ui/Icons';
import { useForward } from '@/hooks/useNetwork';
import { CHAPTERS } from '@/data/chapters';
import { useT } from '@/i18n/context';
import { argmax } from '@/lib/softmax';

export function Home() {
  const { probs } = useForward();
  const t = useT();
  const top = argmax(probs);

  return (
    <div>
      <section className="mx-auto max-w-7xl px-4 pt-16 pb-12 sm:px-6 sm:pt-24">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl"
        >
          <div className="mb-5 font-mono text-xs tracking-wide text-ink-3">{t.home.eyebrow}</div>
          <h1 className="text-5xl font-semibold tracking-tight sm:text-6xl">CNN Explainer</h1>
          <p className="mt-5 max-w-2xl font-serif text-xl leading-relaxed text-ink-2 sm:text-[22px]">
            {t.home.subtitle}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink to="/explore" variant="primary" iconAfter={<ArrowRightIcon />}>
              {t.home.start}
            </ButtonLink>
            <ButtonLink to="/playground">{t.home.playground}</ButtonLink>
          </div>
        </motion.div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="rounded-2xl border border-line bg-surface-2/50 p-3 sm:p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 px-1">
            <div className="text-sm text-ink-2">
              {t.home.pipelineIntro} <span className="font-medium text-ink">{t.classes[top]}</span>{' '}
              <span className="font-mono text-ink-3">({(probs[top] * 100).toFixed(0)}%)</span>
            </div>
          </div>
          <PipelineHero />
          <div className="mt-5 flex flex-col gap-2 px-1 sm:flex-row sm:items-center sm:gap-4">
            <span className="text-xs text-ink-3">{t.home.tryAnother}</span>
            <ExamplePicker size="sm" />
          </div>
        </div>
      </section>

      <section className="mx-auto mt-24 max-w-7xl px-4 sm:px-6">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">{t.home.chaptersTitle}</h2>
            <p className="mt-1 text-ink-2">{t.home.chaptersSub}</p>
          </div>
          <Link to="/explore" className="hidden text-sm text-ink-2 hover:text-ink sm:block">
            {t.home.readFromStart}
          </Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {CHAPTERS.map((id, i) => (
            <Link
              key={id}
              to={`/explore?c=${id}`}
              className="group flex h-full flex-col gap-1 rounded-xl border border-line bg-surface p-4 transition hover:border-line-strong hover:bg-surface-2"
            >
              <span className="font-mono text-[11px] text-ink-3">
                {String(i + 1).padStart(2, '0')}
              </span>
              <span className="font-medium">{t.chapters[id].title}</span>
              <span className="text-sm text-ink-3">{t.chapters[id].short}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-16 grid max-w-7xl gap-3 px-4 sm:px-6 md:grid-cols-3">
        {t.home.pages.map((p) => (
          <Link
            key={p.to}
            to={p.to}
            className="group flex flex-col gap-2 rounded-xl border border-line bg-surface p-5 transition hover:border-line-strong"
          >
            <div className="flex items-center justify-between font-semibold">
              {p.title}
              <ArrowRightIcon className="text-ink-3 transition group-hover:translate-x-0.5 group-hover:text-ink" />
            </div>
            <p className="text-sm leading-relaxed text-ink-2">{p.text}</p>
          </Link>
        ))}
      </section>

      <section className="mx-auto mt-16 max-w-7xl px-4 sm:px-6">
        <div className="grid gap-4 rounded-2xl border border-line p-6 md:grid-cols-[1fr_2fr]">
          <h2 className="font-semibold">{t.home.honestyTitle}</h2>
          <div className="flex flex-col gap-3 text-sm leading-relaxed text-ink-2">
            <p>{t.home.honestyReal}</p>
            <p>{t.home.honestySim}</p>
          </div>
        </div>
      </section>
    </div>
  );
}
