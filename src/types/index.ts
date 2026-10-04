/** A 2-D grid of numbers, indexed as `m[row][col]`. */
export type Matrix = number[][];

/** A stack of 2-D feature maps in channels-first layout: `t[channel][row][col]`. */
export type Tensor3 = Matrix[];

/** Convolution weights for one layer: `w[outChannel][inChannel][row][col]`. */
export type ConvWeights = number[][][][];

export type PoolMode = 'max' | 'avg';

export type ActivationName = 'relu' | 'leakyRelu' | 'sigmoid' | 'tanh';

export interface Range {
  min: number;
  max: number;
}
