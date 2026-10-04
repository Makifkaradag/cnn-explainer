import { motion } from 'motion/react';
import { Link } from 'react-router';
import { ExamplePicker } from '@/components/ImageInput';
import { PipelineHero } from '@/components/PipelineHero';
import { ButtonLink } from '@/components/ui/controls';
import { Tag } from '@/components/ui/display';
import { ArrowRightIcon } from '@/components/ui/Icons';
import { useForward } from '@/hooks/useNetwork';
import { CHAPTERS } from '@/data/chapters';
import { CLASS_NAMES } from '@/lib/network';
import { argmax } from '@/lib/softmax';

const PAGES = [
  {
    to: '/playground',
    title: 'CNN Playground',
    text: 'Pick an image and a kernel, then run the network one layer at a time — or let it auto-play.',
  },
  {
    to: '/training',
    title: 'Training',
    text: 'Watch forward pass, loss, backpropagation and weight updates repeat until the network learns.',
  },
  {
    to: '/concepts',
    title: 'Under the hood',
    text: 'The formulas behind convolution, pooling and softmax, plus a visual glossary of CNN terms.',
  },
];

export function Home() {
  const { probs } = useForward();
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
          <div className="mb-5 font-mono text-xs tracking-wide text-ink-3">
            See inside a Convolutional Neural Network
          </div>
          <h1 className="text-5xl font-semibold tracking-tight sm:text-6xl">CNN Explainer</h1>
          <p className="mt-5 max-w-2xl font-serif text-xl leading-relaxed text-ink-2 sm:text-[22px]">
            An interactive visual journey through convolution, feature maps, pooling, and
            prediction.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink to="/explore" variant="primary" iconAfter={<ArrowRightIcon />}>
              Start Exploring
            </ButtonLink>
            <ButtonLink to="/playground">CNN Playground</ButtonLink>
          </div>
        </motion.div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="rounded-2xl border border-line bg-surface-2/50 p-3 sm:p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 px-1">
            <div className="text-sm text-ink-2">
              One image, ten steps, one prediction:{' '}
              <span className="font-medium text-ink">{CLASS_NAMES[top]}</span>{' '}
              <span className="font-mono text-ink-3">({(probs[top] * 100).toFixed(0)}%)</span>
            </div>
            <Tag kind="simulated">Live output of a tiny CNN</Tag>
          </div>
          <PipelineHero />
          <div className="mt-5 flex flex-col gap-2 px-1 sm:flex-row sm:items-center sm:gap-4">
            <span className="text-xs text-ink-3">Try another input →</span>
            <ExamplePicker size="sm" />
          </div>
        </div>
      </section>

      <section className="mx-auto mt-24 max-w-7xl px-4 sm:px-6">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Ten interactive chapters</h2>
            <p className="mt-1 text-ink-2">
              Each one turns a single idea into something you can poke at.
            </p>
          </div>
          <Link to="/explore" className="hidden text-sm text-ink-2 hover:text-ink sm:block">
            Read from the start →
          </Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {CHAPTERS.map((c, i) => (
            <Link
              key={c.id}
              to={`/explore?c=${c.id}`}
              className="group flex h-full flex-col gap-1 rounded-xl border border-line bg-surface p-4 transition hover:border-line-strong hover:bg-surface-2"
            >
              <span className="font-mono text-[11px] text-ink-3">
                {String(i + 1).padStart(2, '0')}
              </span>
              <span className="font-medium">{c.title}</span>
              <span className="text-sm text-ink-3">{c.short}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-16 grid max-w-7xl gap-3 px-4 sm:px-6 md:grid-cols-3">
        {PAGES.map((p) => (
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
        <div className="grid gap-6 rounded-2xl border border-line p-6 md:grid-cols-3">
          <div>
            <h2 className="font-semibold">What is real, and what is simplified?</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-2">
              Every visual carries a label so you always know what you are looking at.
            </p>
          </div>
          <div className="flex flex-col gap-2 text-sm text-ink-2">
            <Tag kind="computed" />
            <p className="leading-relaxed">
              Convolution, activations, pooling, flatten, dense layer and softmax are real
              implementations, computed live on your image.
            </p>
          </div>
          <div className="flex flex-col gap-2 text-sm text-ink-2">
            <div className="flex flex-wrap gap-2">
              <Tag kind="simulated" />
              <Tag kind="illustrative" />
            </div>
            <p className="leading-relaxed">
              The network is tiny: hand-picked first-layer filters, random second-layer filters, and
              a Dense layer trained in your browser on synthetic shapes. Real CNNs learn every
              filter from data.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
