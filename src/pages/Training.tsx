import { TrainingSimulator } from '@/components/TrainingSimulator';

export function Training() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <header className="mb-8 flex flex-col gap-3">
        <span className="font-mono text-xs text-ink-3">Training</span>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">How a CNN learns</h1>
        <p className="max-w-2xl font-serif text-lg leading-relaxed text-ink-2">
          Nobody writes the weights of a CNN by hand. Training repeats one loop thousands of times:
          predict, measure the error, work out how each weight contributed to it, and nudge every
          weight a little in the direction that reduces it.
        </p>
      </header>
      <TrainingSimulator />
    </div>
  );
}
