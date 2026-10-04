import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';
import { useForward } from '@/hooks/useNetwork';
import { useT } from '@/i18n/context';
import { cx } from '@/lib/cx';
import { LAYERS, type LayerSpec, TOTAL_PARAMS } from '@/lib/network';
import { formatShape } from '@/lib/tensor';
import { tensorFor } from '@/lib/views';
import { TensorView } from './TensorView';
import { ShapeChip, Tag } from './ui/display';
import { ArrowRightIcon } from './ui/Icons';

/** Small glyph whose size reflects the tensor's spatial size and depth. */
export function LayerGlyph({ layer, active }: { layer: LayerSpec; active: boolean }) {
  const stroke = active ? 'border-accent bg-accent-soft' : 'border-ink-3/60 bg-surface';
  if (layer.shapeOut.length === 3) {
    const [h, , c] = layer.shapeOut;
    const side = 14 + h * 1.5;
    const layers = Math.min(c, 5);
    return (
      <div
        className="relative"
        style={{ width: side + (layers - 1) * 4, height: side + (layers - 1) * 4 }}
      >
        {Array.from({ length: layers }, (_, i) => (
          <div
            key={i}
            className={cx('absolute rounded-[3px] border transition-colors', stroke)}
            style={{ width: side, height: side, left: i * 4, top: (layers - 1 - i) * 4 }}
          />
        ))}
      </div>
    );
  }
  if (layer.kind === 'flatten') {
    return <div className={cx('h-16 w-2.5 rounded-sm border transition-colors', stroke)} />;
  }
  return (
    <div className="flex flex-col gap-1">
      {Array.from({ length: 4 }, (_, i) => (
        <div
          key={i}
          className={cx(
            'border transition-colors',
            layer.kind === 'softmax' ? 'h-2.5 rounded-sm' : 'size-3 rounded-full',
            stroke,
          )}
          style={layer.kind === 'softmax' ? { width: [22, 10, 6, 4][i] } : undefined}
        />
      ))}
    </div>
  );
}

/** Chapter 6: the full architecture as a clickable diagram with a layer inspector. */
export function CNNArchitecture() {
  const result = useForward();
  const t = useT();
  const [selected, setSelected] = useState(1);
  const layer = LAYERS[selected];
  const prev = LAYERS[Math.max(0, selected - 1)];
  const text = t.arch.layers[layer.id];
  const nameOf = (l: LayerSpec) => (l.id === 'input' ? t.common.input : l.name);

  return (
    <div className="flex flex-col gap-4">
      <div className="overflow-x-auto rounded-xl border border-line bg-surface">
        <div className="flex min-w-max items-end gap-1 px-4 pt-6 pb-4">
          {LAYERS.map((l, i) => {
            const active = i === selected;
            return (
              <div key={`${l.id}`} className="flex items-end">
                {i > 0 && <ArrowRightIcon className="mb-11 shrink-0 text-ink-3/60" />}
                <button
                  type="button"
                  onClick={() => setSelected(i)}
                  aria-pressed={active}
                  className={cx(
                    'group flex cursor-pointer flex-col items-center gap-2 rounded-lg px-2 py-2 transition',
                    active ? 'bg-surface-2' : 'hover:bg-surface-2',
                  )}
                >
                  <div className="flex h-24 items-end justify-center">
                    <LayerGlyph layer={l} active={active} />
                  </div>
                  <div className={cx('text-xs font-medium', active ? 'text-accent' : 'text-ink')}>
                    {nameOf(l)}
                  </div>
                  <div className="font-mono text-[10px] text-ink-3">{formatShape(l.shapeOut)}</div>
                </button>
              </div>
            );
          })}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line px-4 py-2 text-xs text-ink-3">
          <span>{t.arch.hint}</span>
          <span className="font-mono">{t.arch.total(TOTAL_PARAMS.toLocaleString(t.htmlLang))}</span>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={selected}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.2 }}
          className="rounded-xl border border-line bg-surface"
        >
          <div className="flex flex-wrap items-center gap-3 border-b border-line px-4 py-3">
            <div className="font-semibold">{nameOf(layer)}</div>
            <div className="text-sm text-ink-2">{text.op}</div>
            <div className="ml-auto flex items-center gap-2">
              <ShapeChip shape={layer.shapeIn} />
              <ArrowRightIcon className="text-ink-3" />
              <ShapeChip shape={layer.shapeOut} className="bg-accent-soft text-ink" />
            </div>
          </div>
          <div className="grid gap-6 p-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)_minmax(0,1fr)]">
            <div className="min-w-0">
              <div className="mb-2 text-xs font-medium text-ink-2">
                {t.arch.enters} · {formatShape(layer.shapeIn)}
              </div>
              {selected === 0 ? (
                <p className="text-sm text-ink-3">{t.arch.rawImage}</p>
              ) : (
                <TensorView tensor={tensorFor(result, prev)} compact />
              )}
            </div>
            <div className="flex flex-col gap-3 text-sm leading-relaxed text-ink-2">
              <div className="text-xs font-medium text-ink-2">{t.arch.does}</div>
              <p>{text.explain}</p>
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="rounded-md bg-surface-2 px-2 py-1 font-mono">
                  {t.common.parameters(layer.params.toLocaleString(t.htmlLang))}
                </span>
                {layer.kind === 'conv' && <Tag kind="simulated">{t.arch.notLearned}</Tag>}
                {layer.kind === 'dense' && <Tag kind="computed">{t.arch.trainedHere}</Tag>}
              </div>
            </div>
            <div className="min-w-0">
              <div className="mb-2 text-xs font-medium text-ink-2">
                {t.arch.comesOut} · {formatShape(layer.shapeOut)}
              </div>
              <TensorView tensor={tensorFor(result, layer)} compact />
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
