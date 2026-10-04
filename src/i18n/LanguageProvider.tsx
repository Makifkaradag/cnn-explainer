import { type ReactNode, useEffect, useMemo, useState } from 'react';
import { I18nContext, LANG_STORAGE_KEY, type Lang } from './context';
import { en } from './en';
import { tr } from './tr';

const DICTIONARIES = { en, tr };

function initialLang(): Lang {
  try {
    const saved = localStorage.getItem(LANG_STORAGE_KEY);
    if (saved === 'en' || saved === 'tr') return saved;
  } catch {
    // Storage may be unavailable; fall back to the browser language.
  }
  return navigator.language?.toLowerCase().startsWith('tr') ? 'tr' : 'en';
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(initialLang);

  useEffect(() => {
    document.documentElement.lang = lang;
    try {
      localStorage.setItem(LANG_STORAGE_KEY, lang);
    } catch {
      // Not persisted this time; the choice still applies to the current visit.
    }
  }, [lang]);

  const value = useMemo(() => ({ lang, setLang, t: DICTIONARIES[lang] }), [lang]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}
