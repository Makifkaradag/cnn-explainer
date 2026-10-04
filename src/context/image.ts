import { createContext, useContext } from 'react';
import { DEFAULT_EXAMPLE_ID, getExample } from '@/data/examples';
import type { Matrix } from '@/types';

export type ImageSource =
  | { kind: 'example'; id: string; label: string }
  | { kind: 'upload'; label: string; previewUrl: string; inverted: boolean }
  | { kind: 'drawing'; label: string };

export interface ImageContextValue {
  /** The current 28×28 grayscale input in [0, 1], shared by every visualisation. */
  image: Matrix;
  source: ImageSource;
  setExample: (id: string) => void;
  setImage: (image: Matrix, source: ImageSource) => void;
  reset: () => void;
}

const fallback = getExample(DEFAULT_EXAMPLE_ID);

export const ImageContext = createContext<ImageContextValue>({
  image: fallback.matrix,
  source: { kind: 'example', id: fallback.id, label: fallback.label },
  setExample: () => {},
  setImage: () => {},
  reset: () => {},
});

export const useImage = () => useContext(ImageContext);
