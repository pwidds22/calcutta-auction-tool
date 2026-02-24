'use client';

import type { TimerState } from '@/lib/auction/live/use-timer';

interface TimerDisplayProps {
  timer: TimerState;
}

export function TimerDisplay({ timer }: TimerDisplayProps) {
  if (!timer.isRunning && timer.remainingMs <= 0) return null;

  const seconds = Math.ceil(timer.remainingMs / 1000);
  const progress = timer.totalMs > 0 ? timer.remainingMs / timer.totalMs : 0;

  // Color transitions: emerald > 10s, amber 5-10s, red < 5s
  let barColor = 'bg-emerald-500';
  let textColor = 'text-emerald-400';
  let pulseClass = '';

  if (seconds <= 5) {
    barColor = 'bg-red-500';
    textColor = 'text-red-400';
    pulseClass = 'animate-pulse';
  } else if (seconds <= 10) {
    barColor = 'bg-amber-500';
    textColor = 'text-amber-400';
  }

  return (
    <div className={`rounded-lg border border-white/[0.06] bg-white/[0.02] px-4 py-3 ${pulseClass}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium uppercase tracking-wider text-white/40">
          Time Remaining
        </span>
        <span className={`text-lg font-bold tabular-nums ${textColor}`}>
          {seconds}s
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-white/[0.06]">
        <div
          className={`h-full rounded-full transition-colors ${barColor}`}
          style={{ width: `${progress * 100}%` }}
        />
      </div>
    </div>
  );
}
