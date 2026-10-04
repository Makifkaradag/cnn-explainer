import { motion } from 'motion/react';
import { useMemo, useState } from 'react';
import { useImage } from '@/context/image';
import { type KernelPresetId, makeKernel } from '@/data/kernels';
import { convolve2d } from '@/lib/convolution';
import { cx } from '@/lib/cx';
import { maxAbs } from '@/lib/tensor';
import { FeatureMap } from './FeatureMap';
import { KernelEditor } from './KernelEditor';
import { PixelGrid } from './PixelGrid';
import { Caption, Card, Note } from './ui/display';

const FILTERS: { id: KernelPresetId; name: string; finds: string }[] = [
  { id: 'vertical', name: 'Filter 1', finds: 'vertical edges' },
  { id: 'horizontal', name: 'Filter 2', finds: 'horizontal edges' },
  { id: 'diagonal', name: 'Filter 3', finds: 'diagonal edges' },
  { id: 'texture', name: 'Filter 4', finds: 'texture / corners' },
];

const Operator = ({ children }: { children: string }) => (
  <div className="flex items-center justify-center font-serif text-2xl text-ink-3 lg:pt-6">
    {children}
  </div>
);

/** Chapter 3: the same input through different filters gives different feature maps. */
export function FeatureMapExplorer() {
  const { image } = useImage();
  const [active, setActive] = useState(0);
  const maps = useMemo(
    () => FILTERS.map((f) => convolve2d(image, makeKernel(f.id, 3), { padding: 1 })),
    [image],
  );
  const range = maxAbs(maps);
  const filter = FILTERS[active];

  return (
    <Card>
      <div className="flex flex-col gap-6 p-4">
        <div className="grid items-start gap-4 lg:grid-cols-[auto_auto_auto_auto_minmax(0,1fr)]">
          <div>
            <Caption shape={[28, 28]}>Input</Caption>
            <PixelGrid data={image} scale="gray" cellSize={7} />
          </div>
          <Operator>⊛</Operator>
          <div>
            <Caption shape={[3, 3]}>{filter.name}</Caption>
            <div className="w-[150px]">
              <KernelEditor kernel={makeKernel(filter.id, 3)} readOnly />
            </div>
            <div className="mt-2 text-xs text-ink-3">looks for {filter.finds}</div>
          </div>
          <Operator>=</Operator>
          <div className="min-w-0">
            <Caption shape={[28, 28]}>Feature map</Caption>
            <motion.div
              key={active}
              initial={{ opacity: 0.3 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.35 }}
            >
              <PixelGrid data={maps[active]} range={range} cellSize={7} />
            </motion.div>
          </div>
        </div>

        <div>
          <div className="mb-2 text-xs font-medium text-ink-2">
            One input, four filters → four feature maps (click to inspect)
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {FILTERS.map((f, i) => (
              <FeatureMap
                key={f.id}
                data={maps[i]}
                range={range}
                cellSize={5}
                active={i === active}
                onClick={() => setActive(i)}
                title={
                  <span className={cx(i === active && 'text-ink')}>
                    {f.name} · {f.finds}
                  </span>
                }
              />
            ))}
          </div>
        </div>

        <Note>
          These four kernels are hand-picked textbook filters, chosen because their output is easy
          to read. A trained CNN does <em>not</em> start with them: its filter weights begin random
          and are <strong>learned through backpropagation</strong>. Early layers of trained networks
          often end up resembling edge and colour detectors, but many learned filters have no simple
          human description.
        </Note>
      </div>
    </Card>
  );
}
