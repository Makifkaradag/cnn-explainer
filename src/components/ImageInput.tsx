import { type ChangeEvent, type DragEvent, useRef, useState } from 'react';
import { useImage } from '@/context/image';
import { EXAMPLE_IMAGES } from '@/data/examples';
import { sourceLabel, useT } from '@/i18n/context';
import { cx } from '@/lib/cx';
import { imageToMatrix, loadImage } from '@/lib/image';
import { fmt } from '@/lib/tensor';
import { DrawPad } from './DrawPad';
import { type GridCell, PixelGrid } from './PixelGrid';
import { Button, Segmented } from './ui/controls';
import { Caption, Card } from './ui/display';
import { ResetIcon, UploadIcon } from './ui/Icons';

type Mode = 'examples' | 'draw' | 'upload';

/** Thumbnail buttons for the built-in examples. Shared with the Playground. */
export function ExamplePicker({ size = 'md' }: { size?: 'sm' | 'md' }) {
  const { source, setExample } = useImage();
  const t = useT();
  return (
    <div className="flex flex-wrap gap-2">
      {EXAMPLE_IMAGES.map((ex) => {
        const active = source.kind === 'example' && source.id === ex.id;
        return (
          <button
            key={ex.id}
            type="button"
            onClick={() => setExample(ex.id)}
            aria-pressed={active}
            title={t.examples[ex.id]}
            className={cx(
              'flex cursor-pointer flex-col items-center gap-1 rounded-lg border p-1.5 transition',
              active ? 'border-accent bg-accent-soft' : 'border-line hover:border-line-strong',
            )}
          >
            <PixelGrid
              data={ex.matrix}
              scale="gray"
              cellSize={size === 'sm' ? 1.5 : 2}
              className="ring-0"
            />
            {size === 'md' && <span className="text-[11px] text-ink-2">{t.examples[ex.id]}</span>}
          </button>
        );
      })}
    </div>
  );
}

function Uploader() {
  const { source, setImage } = useImage();
  const t = useT();
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError(t.input.notImage);
      return;
    }
    try {
      const { image, url } = await loadImage(file);
      const { matrix, inverted } = imageToMatrix(image, image.naturalWidth, image.naturalHeight);
      if (source.kind === 'upload') URL.revokeObjectURL(source.previewUrl);
      setImage(matrix, { kind: 'upload', label: file.name, previewUrl: url, inverted });
      setError(null);
    } catch {
      setError(t.input.loadError);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div
        onDragOver={(e: DragEvent) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e: DragEvent) => {
          e.preventDefault();
          setDragging(false);
          void handleFile(e.dataTransfer.files[0]);
        }}
        className={cx(
          'flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-4 py-8 text-center transition',
          dragging ? 'border-accent bg-accent-soft' : 'border-line',
        )}
      >
        <UploadIcon className="size-6 text-ink-3" />
        <div className="text-sm text-ink-2">{t.input.drop}</div>
        <Button size="sm" variant="primary" onClick={() => inputRef.current?.click()}>
          {t.input.chooseFile}
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e: ChangeEvent<HTMLInputElement>) => {
            void handleFile(e.target.files?.[0]);
            e.target.value = '';
          }}
        />
      </div>
      {error && <p className="text-xs text-warn">{error}</p>}
      <p className="text-xs leading-relaxed text-ink-3">{t.input.privacy}</p>
    </div>
  );
}

/** Chapter 1: choose, draw or upload the input image and inspect its pixel values. */
export function ImageInput() {
  const { image, source, setImage, reset } = useImage();
  const t = useT();
  const [mode, setMode] = useState<Mode>(
    source.kind === 'drawing' ? 'draw' : source.kind === 'upload' ? 'upload' : 'examples',
  );
  const [hover, setHover] = useState<GridCell | null>(null);
  const focus = hover ?? { row: 14, col: 14 };
  const zoom = Array.from({ length: 5 }, (_, i) =>
    Array.from({ length: 5 }, (_, j) => image[focus.row + i - 2]?.[focus.col + j - 2] ?? NaN),
  );

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)]">
      <Card
        title={t.input.chooseTitle}
        aside={
          <Button size="sm" variant="ghost" onClick={reset} icon={<ResetIcon />}>
            {t.common.reset}
          </Button>
        }
      >
        <div className="flex flex-col gap-4 p-4">
          <Segmented
            aria-label={t.input.sourceLabel}
            value={mode}
            onChange={setMode}
            options={[
              { value: 'examples', label: t.common.examples },
              { value: 'draw', label: t.common.draw },
              { value: 'upload', label: t.common.upload },
            ]}
          />
          {mode === 'examples' && <ExamplePicker />}
          {mode === 'draw' && (
            <DrawPad
              initial={source.kind === 'drawing' ? image : undefined}
              onCommit={(m) => setImage(m, { kind: 'drawing', label: t.common.yourDrawing })}
            />
          )}
          {mode === 'upload' && <Uploader />}
        </div>
      </Card>

      <Card
        title={t.input.seesTitle}
        aside={<span className="text-xs text-ink-3">{sourceLabel(source, t)}</span>}
      >
        <div className="grid gap-5 p-4 sm:grid-cols-[auto_minmax(0,1fr)]">
          {source.kind === 'upload' && (
            <div className="sm:col-span-2 flex items-center gap-4">
              <img
                src={source.previewUrl}
                alt={t.input.original}
                className="size-24 rounded-md object-cover ring-1 ring-line"
              />
              <div className="text-xs leading-relaxed text-ink-2">
                <div className="font-medium text-ink">{t.input.originalToGray}</div>
                gray = 0.299·R + 0.587·G + 0.114·B
                {source.inverted && <div className="text-ink-3">{t.input.inverted}</div>}
              </div>
            </div>
          )}
          <div>
            <Caption shape={[28, 28, 1]}>{t.input.grayscale}</Caption>
            <PixelGrid
              data={image}
              scale="gray"
              cellSize={10}
              onHover={setHover}
              highlights={hover ? [{ ...hover, tone: 'accent' }] : []}
              label={t.input.gridLabel}
            />
          </div>
          <div className="flex min-w-0 flex-col gap-3">
            <div>
              <Caption>{t.input.zoom}</Caption>
              <div className="grid w-full max-w-[220px] grid-cols-5 gap-0.5">
                {zoom.flatMap((row, i) =>
                  row.map((v, j) => {
                    const center = i === 2 && j === 2;
                    const g = Number.isNaN(v) ? null : Math.round(v * 255);
                    return (
                      <div
                        key={`${i}-${j}`}
                        className={cx(
                          'flex aspect-square items-center justify-center rounded-[3px] font-mono text-[10px] ring-1 ring-line',
                          center && 'ring-2 ring-accent',
                        )}
                        style={
                          g == null
                            ? undefined
                            : {
                                background: `rgb(${g} ${g} ${g})`,
                                color: g > 140 ? '#18181b' : '#fafafa',
                              }
                        }
                      >
                        {g == null ? '' : fmt(v, 2)}
                      </div>
                    );
                  }),
                )}
              </div>
            </div>
            <div className="rounded-lg bg-surface-2 px-3 py-2 font-mono text-xs leading-relaxed text-ink-2">
              pixel[{focus.row}, {focus.col}] ={' '}
              <span className="text-ink">{fmt(image[focus.row][focus.col], 3)}</span>
              <br />≈ {Math.round(image[focus.row][focus.col] * 255)} / 255
            </div>
            <p className="text-xs leading-relaxed text-ink-3">
              {hover ? t.input.pixelHint : t.input.hoverHint}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
