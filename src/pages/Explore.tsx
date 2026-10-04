import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router';
import { CNNArchitecture } from '@/components/CNNArchitecture';
import { ConvolutionVisualizer } from '@/components/ConvolutionVisualizer';
import { DenseVisualizer } from '@/components/DenseVisualizer';
import { ExperimentPanel } from '@/components/ExperimentPanel';
import { FeatureHierarchy } from '@/components/FeatureHierarchy';
import { FeatureMapExplorer } from '@/components/FeatureMapExplorer';
import { FlattenVisualizer } from '@/components/FlattenVisualizer';
import { ImageInput } from '@/components/ImageInput';
import { Chapter } from '@/components/layout/Chapter';
import { PixelGrid } from '@/components/PixelGrid';
import { PoolingVisualizer } from '@/components/PoolingVisualizer';
import { ReLUVisualizer } from '@/components/ReLUVisualizer';
import { SoftmaxVisualizer } from '@/components/SoftmaxVisualizer';
import { ButtonLink } from '@/components/ui/controls';
import { ArrowRightIcon } from '@/components/ui/Icons';
import { useImage } from '@/context/image';
import { CHAPTERS } from '@/data/chapters';
import { sourceLabel, useT } from '@/i18n/context';
import { cx } from '@/lib/cx';

function useActiveChapter() {
  const [active, setActive] = useState<string>(CHAPTERS[0]);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: '-20% 0px -70% 0px' },
    );
    CHAPTERS.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);
  return active;
}

const scrollTo = (id: string) =>
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });

function Sidebar({ active }: { active: string }) {
  const { image, source } = useImage();
  const t = useT();
  return (
    <aside className="sticky top-20 hidden max-h-[calc(100vh-6rem)] w-56 shrink-0 flex-col gap-6 overflow-y-auto xl:flex">
      <div className="flex items-center gap-3 rounded-xl border border-line bg-surface p-2.5">
        <PixelGrid data={image} scale="gray" cellSize={1.6} className="ring-0" />
        <div className="min-w-0 text-xs">
          <div className="text-ink-3">{t.explore.currentInput}</div>
          <div className="truncate font-medium">{sourceLabel(source, t)}</div>
          <button
            type="button"
            onClick={() => scrollTo('input')}
            className="cursor-pointer text-accent hover:underline"
          >
            {t.explore.change}
          </button>
        </div>
      </div>
      <nav className="flex flex-col gap-0.5" aria-label={t.explore.chaptersNav}>
        {CHAPTERS.map((id, i) => (
          <button
            key={id}
            type="button"
            onClick={() => scrollTo(id)}
            className={cx(
              'flex cursor-pointer items-baseline gap-2.5 rounded-md px-2 py-1.5 text-left text-[13px] transition',
              active === id ? 'bg-surface-2 font-medium text-ink' : 'text-ink-3 hover:text-ink',
            )}
          >
            <span className="font-mono text-[10px] opacity-70">
              {String(i + 1).padStart(2, '0')}
            </span>
            {t.chapters[id].title}
          </button>
        ))}
      </nav>
    </aside>
  );
}

export function Explore() {
  const active = useActiveChapter();
  const t = useT();
  const [params] = useSearchParams();
  const target = params.get('c');

  useEffect(() => {
    if (!target) return;
    const id = window.setTimeout(() => scrollTo(target), 80);
    return () => window.clearTimeout(id);
  }, [target]);

  return (
    <div className="mx-auto flex max-w-7xl gap-10 px-4 py-10 sm:px-6">
      <Sidebar active={active} />
      <div className="flex min-w-0 flex-1 flex-col gap-24">
        <header className="flex flex-col gap-3">
          <div className="font-mono text-xs text-ink-3">{t.explore.eyebrow}</div>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{t.explore.title}</h1>
          <p className="max-w-2xl font-serif text-lg leading-relaxed text-ink-2">
            {t.explore.intro}
          </p>
        </header>

        <Chapter
          id="input"
          number={1}
          title={t.chapters['input'].title}
          lede={t.chapters['input'].lede}
        >
          <ImageInput />
        </Chapter>

        <Chapter
          id="convolution"
          number={2}
          title={t.chapters['convolution'].title}
          lede={t.chapters['convolution'].lede}
        >
          <ConvolutionVisualizer />
        </Chapter>

        <Chapter
          id="feature-maps"
          number={3}
          title={t.chapters['feature-maps'].title}
          lede={t.chapters['feature-maps'].lede}
        >
          <FeatureMapExplorer />
        </Chapter>

        <Chapter
          id="relu"
          number={4}
          title={t.chapters['relu'].title}
          lede={t.chapters['relu'].lede}
        >
          <ReLUVisualizer />
        </Chapter>

        <Chapter
          id="pooling"
          number={5}
          title={t.chapters['pooling'].title}
          lede={t.chapters['pooling'].lede}
        >
          <PoolingVisualizer />
        </Chapter>

        <Chapter
          id="architecture"
          number={6}
          title={t.chapters['architecture'].title}
          lede={t.chapters['architecture'].lede}
        >
          <CNNArchitecture />
        </Chapter>

        <Chapter
          id="hierarchy"
          number={7}
          title={t.chapters['hierarchy'].title}
          lede={t.chapters['hierarchy'].lede}
        >
          <FeatureHierarchy />
        </Chapter>

        <Chapter
          id="dense"
          number={8}
          title={t.chapters['dense'].title}
          lede={t.chapters['dense'].lede}
        >
          <div className="flex flex-col gap-6">
            <FlattenVisualizer />
            <DenseVisualizer />
          </div>
        </Chapter>

        <Chapter
          id="softmax"
          number={9}
          title={t.chapters['softmax'].title}
          lede={t.chapters['softmax'].lede}
        >
          <SoftmaxVisualizer />
        </Chapter>

        <Chapter
          id="experiments"
          number={10}
          title={t.chapters['experiments'].title}
          lede={t.chapters['experiments'].lede}
        >
          <ExperimentPanel />
        </Chapter>

        <div className="flex flex-col items-start gap-4 rounded-2xl border border-line bg-surface p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="font-semibold">{t.explore.ctaTitle}</div>
            <p className="text-sm text-ink-2">{t.explore.ctaText}</p>
          </div>
          <div className="flex gap-2">
            <ButtonLink to="/playground" variant="primary" iconAfter={<ArrowRightIcon />}>
              {t.explore.ctaPlayground}
            </ButtonLink>
            <ButtonLink to="/training">{t.explore.ctaTraining}</ButtonLink>
          </div>
        </div>
      </div>
    </div>
  );
}
