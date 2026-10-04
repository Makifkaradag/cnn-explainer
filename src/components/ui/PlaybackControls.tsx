import { useT } from '@/i18n/context';
import { Button, Segmented } from './controls';
import { PauseIcon, PlayIcon, ResetIcon, SkipIcon, StepBackIcon, StepIcon } from './Icons';

const SPEEDS = [1.5, 5, 20, 80];

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
  const t = useT();
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        variant="primary"
        size="sm"
        onClick={onToggle}
        icon={playing ? <PauseIcon /> : <PlayIcon />}
        className="w-20"
      >
        {playing ? t.common.pause : t.common.play}
      </Button>
      <Button
        size="sm"
        onClick={() => onStep(-1)}
        icon={<StepBackIcon />}
        title={t.playback.prev}
        aria-label={t.playback.prev}
      />
      <Button
        size="sm"
        onClick={() => onStep(1)}
        icon={<StepIcon />}
        title={t.playback.next}
        aria-label={t.playback.next}
      />
      <Button
        size="sm"
        onClick={onFinish}
        icon={<SkipIcon />}
        title={t.playback.finish}
        aria-label={t.playback.finish}
      />
      <Button
        size="sm"
        onClick={onReset}
        icon={<ResetIcon />}
        title={t.playback.restart}
        aria-label={t.playback.restart}
      />
      <Segmented
        aria-label={t.playback.speed}
        value={speed}
        options={SPEEDS.map((value, i) => ({ value, label: t.playback.speeds[i] }))}
        onChange={onSpeedChange}
      />
      <span className="ml-auto font-mono text-xs text-ink-3 tabular-nums">
        {t.playback.step(position + 1, total)}
      </span>
    </div>
  );
}
