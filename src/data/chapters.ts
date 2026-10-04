/** Table of contents for the Explore page (also used for the chapter cards on Home). */
export const CHAPTERS = [
  { id: 'input', title: 'The input image', short: 'Pixels as numbers' },
  { id: 'convolution', title: 'Convolution', short: 'A kernel slides over the image' },
  { id: 'feature-maps', title: 'Feature maps', short: 'Different filters, different patterns' },
  { id: 'relu', title: 'ReLU activation', short: 'Keep the positives' },
  { id: 'pooling', title: 'Pooling', short: 'Shrink, keep the strongest' },
  { id: 'architecture', title: 'A complete CNN', short: 'Layer by layer, shape by shape' },
  { id: 'hierarchy', title: 'Feature hierarchy', short: 'From edges to objects' },
  { id: 'dense', title: 'Flatten & Dense', short: 'From maps to a vector to scores' },
  { id: 'softmax', title: 'Softmax prediction', short: 'Scores become probabilities' },
  { id: 'experiments', title: 'What happens if…?', short: 'Change everything, watch it update' },
] as const;

export type ChapterId = (typeof CHAPTERS)[number]['id'];
