/** Chapter order for the Explore page. Titles and text live in the i18n dictionaries. */
export const CHAPTERS = [
  'input',
  'convolution',
  'feature-maps',
  'relu',
  'pooling',
  'architecture',
  'hierarchy',
  'dense',
  'softmax',
  'experiments',
] as const;

export type ChapterId = (typeof CHAPTERS)[number];
