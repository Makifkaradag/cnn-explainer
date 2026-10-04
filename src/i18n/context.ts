import { createContext, useContext } from 'react';
import type { ImageSource } from '@/context/image';
import { en, type Dictionary } from './en';

export type Lang = 'en' | 'tr';

export interface I18nValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: Dictionary;
}

export const I18nContext = createContext<I18nValue>({ lang: 'en', setLang: () => {}, t: en });

export const useI18n = () => useContext(I18nContext);
export const useT = () => useContext(I18nContext).t;

export const LANG_STORAGE_KEY = 'cnn-explainer-lang';

/** Display name of the current input in the active language. */
export function sourceLabel(source: ImageSource, t: Dictionary): string {
  if (source.kind === 'example') return t.examples[source.id] ?? source.label;
  if (source.kind === 'drawing') return t.common.yourDrawing;
  return source.label;
}
