import { motion } from 'motion/react';
import type { ReactNode } from 'react';

interface ChapterProps {
  id: string;
  number: number;
  title: string;
  lede: ReactNode;
  children: ReactNode;
}

/** One numbered section of the Explore article. */
export function Chapter({ id, number, title, lede, children }: ChapterProps) {
  return (
    <section id={id} className="scroll-mt-20">
      <motion.header
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.4 }}
        className="mb-5 flex flex-col gap-2"
      >
        <span className="font-mono text-xs text-ink-3">{String(number).padStart(2, '0')}</span>
        <h2 className="text-2xl font-semibold tracking-tight sm:text-[28px]">{title}</h2>
        <p className="max-w-2xl font-serif text-[17px] leading-relaxed text-ink-2">{lede}</p>
      </motion.header>
      {children}
    </section>
  );
}
