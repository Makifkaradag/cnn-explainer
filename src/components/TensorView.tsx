import { useT } from '@/i18n/context';
import { type TensorValue, wrapVector } from '@/lib/views';
import { Bars } from './Bars';
import { FeatureMapStack } from './FeatureMap';
import { PixelGrid } from './PixelGrid';

/** Picks a sensible visual for any intermediate value of the network. */
export function TensorView({
  tensor,
  compact = false,
}: {
  tensor: TensorValue;
  compact?: boolean;
}) {
  const t = useT();
  switch (tensor.kind) {
    case 'image':
      return <PixelGrid data={tensor.value} scale="gray" cellSize={compact ? 5 : 8} />;
    case 'maps': {
      const h = tensor.value[0]?.length ?? 1;
      const cell = Math.max(2, Math.min(8, Math.round((compact ? 56 : 80) / h)));
      return <FeatureMapStack maps={tensor.value} cellSize={cell} limit={compact ? 8 : 16} />;
    }
    case 'vector':
      return (
        <div>
          <PixelGrid data={wrapVector(tensor.value, 25)} cellSize={compact ? 6 : 9} />
          <div className="mt-1 text-[11px] text-ink-3">
            {tensor.value.length} numbers, wrapped 25 per row (one row = one 5×5 map)
          </div>
        </div>
      );
    case 'logits':
      return <Bars labels={t.classes} values={tensor.value} kind="signed" />;
    case 'probs':
      return <Bars labels={t.classes} values={tensor.value} />;
  }
}
