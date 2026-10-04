import { useMemo, useState } from 'react';
import { useImage } from '@/context/image';
import {
  KERNEL_PRESETS,
  KERNEL_SIZES,
  type KernelPresetId,
  makeKernel,
  presetLabel,
} from '@/data/kernels';
import { ACTIVATION_NAMES, ACTIVATIONS, activate } from '@/lib/activations';
import { convOutputSize, convolve2d, convParamCount } from '@/lib/convolution';
import { pool2d, poolOutputSize } from '@/lib/pooling';
import { formatShape, maxAbs } from '@/lib/tensor';
import type { ActivationName, PoolMode } from '@/types';
import { ActivationPlot } from './ActivationVisualizer';
import { KernelEditor } from './KernelEditor';
import { PixelGrid } from './PixelGrid';
import { Field, Segmented, Select, Slider } from './ui/controls';
import { Card, ShapeChip } from './ui/display';
import { ArrowRightIcon } from './ui/Icons';

const MAX_FILTERS = 6;

/** Chapter 10: change any hyper-parameter and watch shapes and feature maps update instantly. */
export function ExperimentPanel() {
  const { image } = useImage();
  const [kernelId, setKernelId] = useState<KernelPresetId>('edge');
  const [size, setSize] = useState(3);
  const [stride, setStride] = useState(1);
  const [padding, setPadding] = useState(0);
  const [activation, setActivation] = useState<ActivationName>('relu');
  const [poolMode, setPoolMode] = useState<PoolMode>('max');
  const [poolSize, setPoolSize] = useState(2);
  const [filters, setFilters] = useState(3);

  const bank = useMemo(
    () =>
      [
        kernelId,
        ...KERNEL_PRESETS.map((p) => p.id).filter((id) => id !== kernelId && id !== 'identity'),
      ].slice(0, filters),
    [kernelId, filters],
  );

  const convSize = convOutputSize(28, size, stride, padding);
  const poolOut = poolOutputSize(convSize, poolSize, poolSize);

  const rows = useMemo(
    () =>
      bank.map((id) => {
        const kernel = makeKernel(id, size);
        const conv = convolve2d(image, kernel, { stride, padding });
        const act = activate(conv, activation);
        const pooled = poolOut > 0 ? pool2d(act, { size: poolSize, mode: poolMode }) : [];
        return { id, kernel, conv, act, pooled };
      }),
    [bank, image, size, stride, padding, activation, poolMode, poolSize, poolOut],
  );
  const convRange = maxAbs(rows.map((r) => r.conv));
  const actRange = maxAbs(rows.map((r) => r.act));
  const cell = Math.max(2.5, Math.min(6, 150 / Math.max(convSize, 1)));

  const flow: { label: string; shape: number[] }[] = [
    { label: 'Input', shape: [28, 28, 1] },
    {
      label: `Conv ${size}×${size} · s${stride} · p${padding}`,
      shape: [convSize, convSize, filters],
    },
    { label: ACTIVATIONS[activation].label, shape: [convSize, convSize, filters] },
    {
      label: `${poolMode === 'max' ? 'MaxPool' : 'AvgPool'} ${poolSize}×${poolSize}`,
      shape: [poolOut, poolOut, filters],
    },
  ];

  return (
    <Card>
      <div className="grid lg:grid-cols-[260px_minmax(0,1fr)]">
        <div className="flex flex-col gap-4 border-b border-line p-4 lg:border-r lg:border-b-0">
          <Field label="First kernel">
            <Select<KernelPresetId>
              aria-label="Kernel"
              value={kernelId}
              onChange={setKernelId}
              options={KERNEL_PRESETS.map((p) => ({ value: p.id, label: p.label }))}
            />
          </Field>
          <Field label="Kernel size">
            <Segmented
              aria-label="Kernel size"
              value={size}
              onChange={setSize}
              options={KERNEL_SIZES.map((s) => ({ value: s, label: `${s}×${s}` }))}
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Stride">
              <Segmented
                aria-label="Stride"
                value={stride}
                onChange={setStride}
                options={[1, 2, 3].map((s) => ({ value: s, label: String(s) }))}
              />
            </Field>
            <Field label="Padding">
              <Segmented
                aria-label="Padding"
                value={padding}
                onChange={setPadding}
                options={[0, 1, 2].map((s) => ({ value: s, label: String(s) }))}
              />
            </Field>
          </div>
          <Field label="Activation">
            <Select<ActivationName>
              aria-label="Activation"
              value={activation}
              onChange={setActivation}
              options={ACTIVATION_NAMES.map((n) => ({ value: n, label: ACTIVATIONS[n].label }))}
            />
          </Field>
          <ActivationPlot name={activation} domain={3} />
          <div className="grid grid-cols-2 gap-3">
            <Field label="Pooling">
              <Segmented
                aria-label="Pooling type"
                value={poolMode}
                onChange={setPoolMode}
                options={[
                  { value: 'max', label: 'Max' },
                  { value: 'avg', label: 'Avg' },
                ]}
              />
            </Field>
            <Field label="Pool size">
              <Segmented
                aria-label="Pool size"
                value={poolSize}
                onChange={setPoolSize}
                options={[2, 3].map((s) => ({ value: s, label: `${s}×${s}` }))}
              />
            </Field>
          </div>
          <Slider
            label="Number of filters"
            value={filters}
            min={1}
            max={MAX_FILTERS}
            onChange={setFilters}
          />
        </div>

        <div className="flex min-w-0 flex-col gap-4 p-4">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {flow.map((f, i) => (
              <span key={f.label} className="flex items-center gap-2">
                {i > 0 && <ArrowRightIcon className="text-ink-3" />}
                <span className="text-ink-2">{f.label}</span>
                <ShapeChip
                  shape={f.shape}
                  className={i === flow.length - 1 ? 'bg-accent-soft text-ink' : undefined}
                />
              </span>
            ))}
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-1 font-mono text-xs text-ink-3">
            <span>
              conv output: ⌊(28 + 2·{padding} − {size}) / {stride}⌋ + 1 = {convSize}
            </span>
            <span>
              parameters: ({size}·{size}·1 + 1) · {filters} = {convParamCount(size, 1, filters)}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-separate border-spacing-y-2 text-left text-xs">
              <thead className="text-ink-3">
                <tr>
                  <th className="pr-3 font-medium">Filter</th>
                  <th className="pr-3 font-medium">Conv · {formatShape([convSize, convSize])}</th>
                  <th className="pr-3 font-medium">{ACTIVATIONS[activation].label}</th>
                  <th className="font-medium">Pool · {formatShape([poolOut, poolOut])}</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="align-top">
                    <td className="pr-3">
                      <div className="mb-1 whitespace-nowrap text-ink-2">{presetLabel(r.id)}</div>
                      <div className={size === 3 ? 'w-24' : 'w-32'}>
                        <KernelEditor kernel={r.kernel} readOnly />
                      </div>
                    </td>
                    <td className="pr-3">
                      <PixelGrid data={r.conv} range={convRange} cellSize={cell} />
                    </td>
                    <td className="pr-3">
                      <PixelGrid data={r.act} range={actRange} cellSize={cell} />
                    </td>
                    <td>
                      {poolOut > 0 ? (
                        <PixelGrid data={r.pooled} range={actRange} cellSize={cell} />
                      ) : (
                        <span className="text-warn">Too small to pool</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs leading-relaxed text-ink-3">
            Try: stride 2 (output shrinks by half) · padding 1 with a 3×3 kernel (“same” size) ·
            Sigmoid (no negatives, everything shifts towards 0.5) · average vs. max pooling. All
            outputs are recomputed live from the current input image.
          </p>
        </div>
      </div>
    </Card>
  );
}
