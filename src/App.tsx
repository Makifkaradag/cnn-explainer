import { lazy } from 'react';
import { HashRouter, Route, Routes } from 'react-router';
import { Layout } from './components/layout/Layout';
import { ImageProvider } from './context/ImageProvider';
import { ThemeProvider } from './context/ThemeProvider';
import { LanguageProvider } from './i18n/LanguageProvider';
import { Home } from './pages/Home';
import { NotFound } from './pages/NotFound';

// Secondary pages are split into their own chunks so the landing page loads fast.
const Explore = lazy(() => import('./pages/Explore').then((m) => ({ default: m.Explore })));
const Playground = lazy(() =>
  import('./pages/Playground').then((m) => ({ default: m.Playground })),
);
const Training = lazy(() => import('./pages/Training').then((m) => ({ default: m.Training })));
const Concepts = lazy(() => import('./pages/Concepts').then((m) => ({ default: m.Concepts })));

// HashRouter keeps deep links working on static hosts such as GitHub Pages without server rewrites.
export function App() {
  return (
    <LanguageProvider>
      <ThemeProvider>
        <ImageProvider>
          <HashRouter>
            <Routes>
              <Route element={<Layout />}>
                <Route index element={<Home />} />
                <Route path="explore" element={<Explore />} />
                <Route path="playground" element={<Playground />} />
                <Route path="training" element={<Training />} />
                <Route path="concepts" element={<Concepts />} />
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </HashRouter>
        </ImageProvider>
      </ThemeProvider>
    </LanguageProvider>
  );
}
