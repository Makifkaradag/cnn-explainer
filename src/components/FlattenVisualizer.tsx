import { LayoutGroup, motion } from 'motion/react';
import { useState } from 'react';
import { useTheme } from '@/context/theme';
import { useForward } from '@/hooks/useNetwork';
import { useT } from '@/i18n/context';
import { css, valueColor } from '@/lib/colors';
import { maxAbs } from '@/lib/tensor';
import { wrapVector } from '@/lib/views';
import { FeatureMapStack } from './FeatureMap';
import { PixelGrid } from './PixelGrid';
import { Button } from './ui/controls';
import { Caption, Card } from './ui/display';

const ANIMATED_CHANNELS = 3;

/** Chapter 8a: feature maps are unrolled into one long vector. */
export function FlattenVisualizer() {
  const { theme } = useTheme();
  const t = useT();
  const { pool2, flat } = useForward();
  const [flattened, setFlattened] = useState(false);
  const range = maxAbs(pool2);

  const cell = (ch: number, idx: number, v: number) => (
    <motion.div
      key={`${ch}-${idx}`}
      layoutId={`flat-${ch}-${idx}`}
      transition={{
        type: 'spring',
        stiffness: 260,
        damping: 28,
        delay: flattened ? idx * 0.006 + ch * 0.05 : 0,
      }}
      className="size-3.5 rounded-[2px] ring-1 ring-line sm:size-4"
      style={{ background: css(valueColor(v, 'diverging', range, theme)) }}
    />
  );

  return (
    <Card>
      <div className="flex flex-col gap-5 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Caption shape={flattened ? [ANIMATED_CHANNELS * 25] : [5, 5, ANIMATED_CHANNELS]}>
            {flattened ? t.flatten.vectorFirst : t.flatten.firstMaps}
          </Caption>
          <Button variant="primary" size="sm" onClick={() => setFlattened((f) => !f)}>
            {flattened ? t.flatten.unflatten : t.flatten.flatten}
          </Button>
        </div>

        <LayoutGroup>
          <div className="min-h-[110px]">
            {flattened ? (
              <div className="flex flex-wrap gap-0.5">
                {pool2
                  .slice(0, ANIMATED_CHANNELS)
                  .flatMap((m, ch) => m.flat().map((v, idx) => cell(ch, idx, v)))}
              </div>
            ) : (
              <div className="flex flex-wrap gap-6">
                {pool2.slice(0, ANIMATED_CHANNELS).map((m, ch) => (
                  <div key={ch}>
                    <div className="grid grid-cols-5 gap-0.5">
                      {m.flat().map((v, idx) => cell(ch, idx, v))}
                    </div>
                    <div className="mt-1 text-center text-[11px] text-ink-3">
                      {t.flatten.map(ch + 1)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </LayoutGroup>

        <div className="grid gap-5 border-t border-line pt-4 md:grid-cols-[auto_minmax(0,1fr)]">
          <div>
            <Caption shape={[5, 5, 16]}>{t.flatten.allMaps}</Caption>
            <FeatureMapStack
              maps={pool2}
              cellSize={4}
              labels={() => null}
              className="max-w-[260px]"
            />
          </div>
          <div className="min-w-0">
            <Caption shape={[flat.length]}>{t.flatten.vector}</Caption>
            <PixelGrid data={wrapVector(flat, 25)} cellSize={11} />
            <p className="mt-2 text-xs leading-relaxed text-ink-3">{t.flatten.note}</p>
          </div>
        </div>
      </div>
    </Card>
  );
}
