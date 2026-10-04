import { useMemo } from 'react';
import { useImage } from '@/context/image';
import { forward, type NetworkOptions } from '@/lib/network';
import { getTrainedModel } from '@/lib/training';
import type { Matrix } from '@/types';

/** Runs the tiny CNN on the shared input image (or a given one), memoised on its inputs. */
export function useForward(
  { activation = 'relu', poolMode = 'max', customKernel }: NetworkOptions = {},
  imageOverride?: Matrix,
) {
  const { image: shared } = useImage();
  const image = imageOverride ?? shared;
  return useMemo(
    () => forward(image, getTrainedModel().dense, { activation, poolMode, customKernel }),
    [image, activation, poolMode, customKernel],
  );
}
