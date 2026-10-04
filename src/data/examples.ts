import { Raster } from '@/lib/raster';
import type { Matrix } from '@/types';

export interface ExampleImage {
  id: string;
  label: string;
  matrix: Matrix;
}

function draw(fn: (r: Raster) => void): Matrix {
  const raster = new Raster(28);
  fn(raster);
  return raster.data;
}

/** Built-in 28×28 grayscale examples, drawn procedurally so the repo ships no binary assets. */
export const EXAMPLE_IMAGES: ExampleImage[] = [
  {
    id: 'circle',
    label: 'Circle',
    matrix: draw((r) => r.circle(14, 14, 8.5, 2.6)),
  },
  {
    id: 'square',
    label: 'Square',
    matrix: draw((r) =>
      r.polyline(
        [
          [7, 7],
          [21, 7],
          [21, 21],
          [7, 21],
        ],
        2.6,
        true,
      ),
    ),
  },
  {
    id: 'triangle',
    label: 'Triangle',
    matrix: draw((r) =>
      r.polyline(
        [
          [14, 5.5],
          [22.5, 21.5],
          [5.5, 21.5],
        ],
        2.6,
        true,
      ),
    ),
  },
  {
    id: 'cross',
    label: 'Cross',
    matrix: draw((r) => r.line([14, 5], [14, 23], 2.8).line([5, 14], [23, 14], 2.8)),
  },
  {
    id: 'seven',
    label: 'Digit 7',
    matrix: draw((r) =>
      r
        .polyline(
          [
            [7.5, 6.5],
            [20.5, 6.5],
            [12, 22.5],
          ],
          2.8,
        )
        .line([11, 14.5], [18, 14.5], 2.2),
    ),
  },
  {
    id: 'smiley',
    label: 'Smiley',
    matrix: draw((r) =>
      r
        .circle(14, 14, 10, 1.8)
        .fillCircle(10.5, 11, 1.5)
        .fillCircle(17.5, 11, 1.5)
        .arc(14, 14, 5.5, 0.45, Math.PI - 0.45, 1.8),
    ),
  },
  {
    id: 'stripes',
    label: 'Stripes',
    matrix: draw((r) => {
      for (const x of [6, 11, 16, 21]) r.line([x + 0.5, 5], [x + 0.5, 23], 2.2);
    }),
  },
];

export const DEFAULT_EXAMPLE_ID = 'triangle';

export function getExample(id: string): ExampleImage {
  return EXAMPLE_IMAGES.find((e) => e.id === id) ?? EXAMPLE_IMAGES[0];
}
