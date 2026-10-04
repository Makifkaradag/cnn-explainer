import { Button, Segmented } from './controls';
import { PauseIcon, PlayIcon, ResetIcon, SkipIcon, StepBackIcon, StepIcon } from './Icons';

const SPEEDS = [
  { value: 1.5, label: 'Slow' },
  { value: 5, label: 'Normal' },
  { value: 20, label: 'Fast' },
  { value: 80, label: 'Turbo' },
];

interface PlaybackControlsProps {
  playing: boolean;
  onToggle: () => void;
  onStep: (delta: number) => void;
  onReset: () => void;
  onFinish: () => void;
  speed: number;
  onSpeedChange: (speed: number) => void;
  position: number;
  total: number;
}

export function PlaybackControls({
  playing,
  onToggle,
  onStep,
  onReset,
  onFinish,
  speed,
  onSpeedChange,
  position,
  total,
}: PlaybackControlsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        variant="primary"
        size="sm"
        onClick={onToggle}
        icon={playing ? <PauseIcon /> : <PlayIcon />}
        className="w-20"
      >
        {playing ? 'Pause' : 'Play'}
      </Button>
      <Button
        size="sm"
        onClick={() => onStep(-1)}
        icon={<StepBackIcon />}
        title="Previous position"
        aria-label="Previous position"
      />
      <Button
        size="sm"
        onClick={() => onStep(1)}
        icon={<StepIcon />}
        title="Next position"
        aria-label="Next position"
      />
      <Button
        size="sm"
        onClick={onFinish}
        icon={<SkipIcon />}
        title="Compute everything"
        aria-label="Compute everything"
      />
      <Button
        size="sm"
        onClick={onReset}
        icon={<ResetIcon />}
        title="Back to start"
        aria-label="Back to start"
      />
      <Segmented
        aria-label="Animation speed"
        value={speed}
        options={SPEEDS}
        onChange={onSpeedChange}
      />
      <span className="ml-auto font-mono text-xs text-ink-3 tabular-nums">
        step {position + 1} / {total}
      </span>
    </div>
  );
}
