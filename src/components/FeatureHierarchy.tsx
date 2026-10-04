import { motion } from 'motion/react';
import { useMemo, useState } from 'react';
import { useImage } from '@/context/image';
import { useForward } from '@/hooks/useNetwork';
import { cx } from '@/lib/cx';
import { Raster } from '@/lib/raster';
import { maxAbs } from '@/lib/tensor';
import type { Matrix } from '@/types';
import { FeatureMap } from './FeatureMap';
import { PixelGrid } from './PixelGrid';
import { Tag, type TagKind } from './ui/display';

function glyph(fn: (r: Raster) => void): Matrix {
  const r = new Raster(16);
  fn(r);
  return r.data;
}

// Hand-drawn icons that stand in for what deeper layers *might* respond to.
const PARTS = [
  {
    name: 'corner',
    m: glyph((r) =>
      r.polyline(
        [
          [3, 13],
          [3, 3],
          [13, 3],
        ],
        2,
      ),
    ),
  },
  { name: 'curve', m: glyph((r) => r.arc(13, 13, 9, Math.PI, 1.5 * Math.PI, 2)) },
  { name: 'junction', m: glyph((r) => r.line([2, 8], [14, 8], 2).line([8, 8], [8, 14], 2)) },
  { name: 'line end', m: glyph((r) => r.line([2, 8], [9, 8], 2).fillCircle(9, 8, 1.5)) },
  { name: 'parallel', m: glyph((r) => r.line([4, 2], [4, 14], 2).line([11, 2], [11, 14], 2)) },
  { name: 'ring', m: glyph((r) => r.circle(8, 8, 4, 2)) },
];

const WHOLES = [
  { name: 'round object', m: glyph((r) => r.circle(8, 8, 5.5, 2)) },
  {
    name: 'box-like',
    m: glyph((r) =>
      r.polyline(
        [
          [3, 3],
          [13, 3],
          [13, 13],
          [3, 13],
        ],
        2,
        true,
      ),
    ),
  },
  {
    name: 'pointed',
    m: glyph((r) =>
      r.polyline(
        [
          [8, 2.5],
          [13.5, 13],
          [2.5, 13],
        ],
        2,
        true,
      ),
    ),
  },
  {
    name: 'face-like',
    m: glyph((r) =>
      r
        .circle(8, 8, 6.5, 1.4)
        .fillCircle(5.8, 6.5, 1)
        .fillCircle(10.2, 6.5, 1)
        .arc(8, 8, 3.5, 0.5, Math.PI - 0.5, 1.3),
    ),
  },
];

interface Level {
  title: string;
  subtitle: string;
  rf: number;
  rfNote: string;
  tag: TagKind;
  tagText: string;
}

const LEVELS: Level[] = [
  {
    title: 'Layer 1',
    subtitle: 'Edges',
    rf: 3,
    rfNote: 'sees 3×3 pixels',
    tag: 'computed',
    tagText: 'Computed by this app',
  },
  {
    title: 'Layer 2',
    subtitle: 'Textures / simple shapes',
    rf: 8,
    rfNote: 'sees 8×8 pixels',
    tag: 'computed',
    tagText: 'Computed (random filters)',
  },
  {
    title: 'Layer 3',
    subtitle: 'Parts / patterns',
    rf: 18,
    rfNote: '≈18×18 in a deeper net',
    tag: 'illustrative',
    tagText: 'Illustrative',
  },
  {
    title: 'Layer 4',
    subtitle: 'Higher-level structures',
    rf: 28,
    rfNote: 'the whole image',
    tag: 'illustrative',
    tagText: 'Illustrative',
  },
];

/** Chapter 7: an intuition for hierarchical features and growing receptive fields. */
export function FeatureHierarchy() {
  const { image } = useImage();
  const result = useForward();
  const [hovered, setHovered] = useState(0);

  const layer1 = useMemo(() => [0, 2, 4, 6].map((i) => result.act1[i]), [result]);
  // Show the conv-2 channels that respond most strongly to this image.
  const layer2 = useMemo(() => {
    const strength = result.act2.map((m, i) => ({ i, s: m.flat().reduce((a, b) => a + b, 0) }));
    return strength
      .sort((a, b) => b.s - a.s)
      .slice(0, 4)
      .map(({ i }) => ({ i, m: result.act2[i] }));
  }, [result]);
  const r1 = maxAbs(layer1);
  const r2 = maxAbs(layer2.map((x) => x.m));

  const rf = LEVELS[hovered].rf;
  const offset = Math.max(0, Math.round(14 - rf / 2));

  return (
    <div className="grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)]">
      <div className="flex flex-col gap-3 rounded-xl border border-line bg-surface p-4">
        <div className="text-xs font-medium text-ink-2">Receptive field</div>
        <PixelGrid
          data={image}
          scale="gray"
          cellSize={6.5}
          highlights={[
            { row: offset, col: offset, rows: Math.min(28, rf), cols: Math.min(28, rf) },
          ]}
        />
        <p className="text-xs leading-relaxed text-ink-3">
          The highlighted area is how much of the input one neuron in{' '}
          <span className="text-ink-2">{LEVELS[hovered].title}</span> can “see” —{' '}
          {LEVELS[hovered].rfNote}. Stacking convolutions and pooling makes it grow.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {LEVELS.map((level, li) => (
          <motion.div
            key={level.title}
            initial={{ opacity: 0, x: -12 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ delay: li * 0.12, duration: 0.4 }}
            onMouseEnter={() => setHovered(li)}
            onFocus={() => setHovered(li)}
            tabIndex={0}
            className={cx(
              'grid items-center gap-4 rounded-xl border bg-surface p-3 transition sm:grid-cols-[150px_minmax(0,1fr)]',
              hovered === li ? 'border-accent/60' : 'border-line',
            )}
          >
            <div>
              <div className="text-xs text-ink-3">{level.title}</div>
              <div className="font-semibold">{level.subtitle}</div>
              <div className="mt-1.5">
                <Tag kind={level.tag}>{level.tagText}</Tag>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {li === 0 &&
                layer1.map((m, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: li * 0.12 + i * 0.06 }}
                  >
                    <FeatureMap
                      data={m}
                      range={r1}
                      cellSize={2.6}
                      title={['vertical', 'horizontal', 'diagonal', 'outline'][i]}
                    />
                  </motion.div>
                ))}
              {li === 1 &&
                layer2.map(({ i, m }, k) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: li * 0.12 + k * 0.06 }}
                  >
                    <FeatureMap data={m} range={r2} cellSize={6} title={`channel ${i + 1}`} />
                  </motion.div>
                ))}
              {(li === 2 ? PARTS : li === 3 ? WHOLES : []).map((g, k) => (
                <motion.div
                  key={g.name}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: li * 0.12 + k * 0.06 }}
                >
                  <FeatureMap data={g.m} range={1} cellSize={4.2} title={g.name} />
                </motion.div>
              ))}
            </div>
          </motion.div>
        ))}
        <p className="text-xs leading-relaxed text-ink-3">
          This is an intuitive picture of hierarchical feature learning, not a guarantee. Layers 1–2
          are real outputs of this app's tiny network; layers 3–4 are drawings. Studies of trained
          CNNs often find a similar progression from simple to complex features, but what each layer
          learns depends on the data, architecture and training.
        </p>
      </div>
    </div>
  );
}
