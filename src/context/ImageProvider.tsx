import { type ReactNode, useCallback, useMemo, useState } from 'react';
import { DEFAULT_EXAMPLE_ID, getExample } from '@/data/examples';
import type { Matrix } from '@/types';
import { ImageContext, type ImageSource } from './image';

interface State {
  image: Matrix;
  source: ImageSource;
}

function exampleState(id: string): State {
  const ex = getExample(id);
  return { image: ex.matrix, source: { kind: 'example', id: ex.id, label: ex.label } };
}

export function ImageProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(() => exampleState(DEFAULT_EXAMPLE_ID));

  const setExample = useCallback((id: string) => setState(exampleState(id)), []);
  const setImage = useCallback(
    (image: Matrix, source: ImageSource) => setState({ image, source }),
    [],
  );
  const reset = useCallback(() => setState(exampleState(DEFAULT_EXAMPLE_ID)), []);

  const value = useMemo(
    () => ({ ...state, setExample, setImage, reset }),
    [state, setExample, setImage, reset],
  );
  return <ImageContext.Provider value={value}>{children}</ImageContext.Provider>;
}
