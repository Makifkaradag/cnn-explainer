import type { Matrix } from '@/types';
import { zeros } from './tensor';

type Point = [x: number, y: number];

function distanceToSegment(px: number, py: number, [ax, ay]: Point, [bx, by]: Point): number {
  const dx = bx - ax;
  const dy = by - ay;
  const len2 = dx * dx + dy * dy;
  const t = len2 === 0 ? 0 : Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / len2));
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
}

/**
 * A tiny anti-aliased rasteriser that draws bright strokes on a dark square grid,
 * like an MNIST digit. Coordinates are in pixels; (0, 0) is the top-left corner.
 */
export class Raster {
  readonly data: Matrix;

  constructor(readonly size = 28) {
    this.data = zeros(size, size);
  }

  /** Paints every pixel whose centre lies within `width / 2` of the shape (soft 1px edge). */
  private stamp(distance: (x: number, y: number) => number, width: number): this {
    for (let r = 0; r < this.size; r++) {
      for (let c = 0; c < this.size; c++) {
        const v = Math.max(0, Math.min(1, width / 2 + 0.5 - distance(c + 0.5, r + 0.5)));
        if (v > this.data[r][c]) this.data[r][c] = v;
      }
    }
    return this;
  }

  line(a: Point, b: Point, width: number) {
    return this.stamp((x, y) => distanceToSegment(x, y, a, b), width);
  }

  polyline(points: Point[], width: number, closed = false) {
    const segments = closed ? points.length : points.length - 1;
    return this.stamp((x, y) => {
      let best = Infinity;
      for (let i = 0; i < segments; i++) {
        best = Math.min(best, distanceToSegment(x, y, points[i], points[(i + 1) % points.length]));
      }
      return best;
    }, width);
  }

  circle(cx: number, cy: number, radius: number, width: number) {
    return this.stamp((x, y) => Math.abs(Math.hypot(x - cx, y - cy) - radius), width);
  }

  fillCircle(cx: number, cy: number, radius: number) {
    return this.stamp((x, y) => Math.max(0, Math.hypot(x - cx, y - cy) - radius), 0);
  }

  /** Arc from `start` to `end` (radians, clockwise on screen because y points down). */
  arc(cx: number, cy: number, radius: number, start: number, end: number, width: number) {
    const endpoints: Point[] = [start, end].map((a) => [
      cx + radius * Math.cos(a),
      cy + radius * Math.sin(a),
    ]);
    return this.stamp((x, y) => {
      let angle = Math.atan2(y - cy, x - cx);
      if (angle < start) angle += 2 * Math.PI;
      if (angle <= end) return Math.abs(Math.hypot(x - cx, y - cy) - radius);
      return Math.min(...endpoints.map(([ex, ey]) => Math.hypot(x - ex, y - ey)));
    }, width);
  }
}

export function rotate([x, y]: Point, [cx, cy]: Point, angle: number): Point {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  return [cx + (x - cx) * cos - (y - cy) * sin, cy + (x - cx) * sin + (y - cy) * cos];
}

export type { Point };
