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
import { cx } from '@/lib/cx';

function useActiveChapter() {
  const [active, setActive] = useState<string>(CHAPTERS[0].id);
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
    CHAPTERS.forEach((c) => {
      const el = document.getElementById(c.id);
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
  return (
    <aside className="sticky top-20 hidden max-h-[calc(100vh-6rem)] w-56 shrink-0 flex-col gap-6 overflow-y-auto xl:flex">
      <div className="flex items-center gap-3 rounded-xl border border-line bg-surface p-2.5">
        <PixelGrid data={image} scale="gray" cellSize={1.6} className="ring-0" />
        <div className="min-w-0 text-xs">
          <div className="text-ink-3">Current input</div>
          <div className="truncate font-medium">{source.label}</div>
          <button
            type="button"
            onClick={() => scrollTo('input')}
            className="cursor-pointer text-accent hover:underline"
          >
            change
          </button>
        </div>
      </div>
      <nav className="flex flex-col gap-0.5" aria-label="Chapters">
        {CHAPTERS.map((c, i) => (
          <button
            key={c.id}
            type="button"
            onClick={() => scrollTo(c.id)}
            className={cx(
              'flex cursor-pointer items-baseline gap-2.5 rounded-md px-2 py-1.5 text-left text-[13px] transition',
              active === c.id ? 'bg-surface-2 font-medium text-ink' : 'text-ink-3 hover:text-ink',
            )}
          >
            <span className="font-mono text-[10px] opacity-70">
              {String(i + 1).padStart(2, '0')}
            </span>
            {c.title}
          </button>
        ))}
      </nav>
    </aside>
  );
}

export function Explore() {
  const active = useActiveChapter();
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
          <div className="font-mono text-xs text-ink-3">Explore</div>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Inside a Convolutional Neural Network
          </h1>
          <p className="max-w-2xl font-serif text-lg leading-relaxed text-ink-2">
            Follow one image through every stage of a small CNN. Every visual below is computed live
            from the image you choose — change it, and everything updates.
          </p>
        </header>

        <Chapter
          id="input"
          number={1}
          title="The input image"
          tags={['computed']}
          lede="To a computer, a grayscale image is just a grid of numbers. Ours is 28×28 = 784 brightness values between 0 (black) and 1 (white)."
        >
          <ImageInput />
        </Chapter>

        <Chapter
          id="convolution"
          number={2}
          title="Convolution"
          tags={['computed']}
          lede="A small grid of weights — the kernel — slides across the image. At each position it multiplies the pixels under it by its weights and adds everything up. That single number becomes one pixel of the output."
        >
          <ConvolutionVisualizer />
        </Chapter>

        <Chapter
          id="feature-maps"
          number={3}
          title="Feature maps"
          tags={['computed']}
          lede="The output of a convolution is called a feature map: bright where the kernel's pattern appears in the image. A layer uses many kernels at once, so it produces a stack of feature maps."
        >
          <FeatureMapExplorer />
        </Chapter>

        <Chapter
          id="relu"
          number={4}
          title="ReLU activation"
          tags={['computed']}
          lede="After convolution, an activation function is applied to every value. ReLU is the most common: negative values become 0, positive values pass through. This non-linearity is what lets stacked layers learn more than a single linear filter could."
        >
          <ReLUVisualizer />
        </Chapter>

        <Chapter
          id="pooling"
          number={5}
          title="Pooling"
          tags={['computed']}
          lede="Pooling shrinks a feature map by summarising small windows. Max pooling keeps the strongest response in each window, so the next layer works on fewer numbers and becomes less sensitive to small shifts."
        >
          <PoolingVisualizer />
        </Chapter>

        <Chapter
          id="architecture"
          number={6}
          title="A complete CNN"
          tags={['computed', 'simulated']}
          lede="Real networks stack these operations. Here is the small CNN used throughout this app — click any layer to see what goes in, what happens, and what comes out."
        >
          <CNNArchitecture />
        </Chapter>

        <Chapter
          id="hierarchy"
          number={7}
          title="Feature hierarchy"
          tags={['computed', 'illustrative']}
          lede="Each layer builds on the one before it. Deeper neurons see a larger part of the image and can respond to more complex combinations of simpler features."
        >
          <FeatureHierarchy />
        </Chapter>

        <Chapter
          id="dense"
          number={8}
          title="Flatten & Dense"
          tags={['computed', 'simulated']}
          lede="To make a decision, the final feature maps are unrolled into one long vector. A fully connected (Dense) layer then gives each class a score — a weighted sum of all the features."
        >
          <div className="flex flex-col gap-6">
            <FlattenVisualizer />
            <DenseVisualizer />
          </div>
        </Chapter>

        <Chapter
          id="softmax"
          number={9}
          title="Softmax prediction"
          tags={['computed', 'simulated']}
          lede="The class scores (logits) can be any number. Softmax turns them into probabilities: positive, and summing to 1. Drag the sliders to see how it reacts."
        >
          <SoftmaxVisualizer />
        </Chapter>

        <Chapter
          id="experiments"
          number={10}
          title="What happens if…?"
          tags={['computed']}
          lede="Change the kernel, stride, padding, activation, pooling or the number of filters, and see the feature maps and tensor shapes update immediately."
        >
          <ExperimentPanel />
        </Chapter>

        <div className="flex flex-col items-start gap-4 rounded-2xl border border-line bg-surface p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="font-semibold">Run the whole pipeline yourself</div>
            <p className="text-sm text-ink-2">
              Step through every layer, or watch the network learn.
            </p>
          </div>
          <div className="flex gap-2">
            <ButtonLink to="/playground" variant="primary" iconAfter={<ArrowRightIcon />}>
              CNN Playground
            </ButtonLink>
            <ButtonLink to="/training">Training</ButtonLink>
          </div>
        </div>
      </div>
    </div>
  );
}
