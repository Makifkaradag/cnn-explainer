import { motion } from 'motion/react';
import { useMemo, useState } from 'react';
import { useImage } from '@/context/image';
import { type KernelPresetId, makeKernel } from '@/data/kernels';
import { useT } from '@/i18n/context';
import { convolve2d } from '@/lib/convolution';
import { cx } from '@/lib/cx';
import { maxAbs } from '@/lib/tensor';
import { FeatureMap } from './FeatureMap';
import { KernelEditor } from './KernelEditor';
import { PixelGrid } from './PixelGrid';
import { Caption, Card, Note } from './ui/display';

const FILTERS: KernelPresetId[] = ['vertical', 'horizontal', 'diagonal', 'texture'];

const Operator = ({ children }: { children: string }) => (
  <div className="flex items-center justify-center font-serif text-2xl text-ink-3 lg:pt-6">
    {children}
  </div>
);

/** Chapter 3: the same input through different filters gives different feature maps. */
export function FeatureMapExplorer() {
  const { image } = useImage();
  const t = useT();
  const [active, setActive] = useState(0);
  const maps = useMemo(
    () => FILTERS.map((id) => convolve2d(image, makeKernel(id, 3), { padding: 1 })),
    [image],
  );
  const range = maxAbs(maps);
  const name = (i: number) => t.fmaps.filter(i + 1);

  return (
    <Card>
      <div className="flex flex-col gap-6 p-4">
        <div className="grid items-start gap-4 lg:grid-cols-[auto_auto_auto_auto_minmax(0,1fr)]">
          <div>
            <Caption shape={[28, 28]}>{t.common.input}</Caption>
            <PixelGrid data={image} scale="gray" cellSize={7} />
          </div>
          <Operator>⊛</Operator>
          <div>
            <Caption shape={[3, 3]}>{name(active)}</Caption>
            <div className="w-[150px]">
              <KernelEditor kernel={makeKernel(FILTERS[active], 3)} readOnly />
            </div>
            <div className="mt-2 text-xs text-ink-3">{t.fmaps.looksFor(t.fmaps.finds[active])}</div>
          </div>
          <Operator>=</Operator>
          <div className="min-w-0">
            <Caption shape={[28, 28]}>{t.common.featureMap}</Caption>
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
          <div className="mb-2 text-xs font-medium text-ink-2">{t.fmaps.gallery}</div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {FILTERS.map((id, i) => (
              <FeatureMap
                key={id}
                data={maps[i]}
                range={range}
                cellSize={5}
                active={i === active}
                onClick={() => setActive(i)}
                title={
                  <span className={cx(i === active && 'text-ink')}>
                    {name(i)} · {t.fmaps.finds[i]}
                  </span>
                }
              />
            ))}
          </div>
        </div>

        <Note>{t.fmaps.note}</Note>
      </div>
    </Card>
  );
}
