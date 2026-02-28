'use client';

import { useRef, useState, useCallback, useEffect } from 'react';

export interface TimerState {
  isRunning: boolean;
  remainingMs: number;
  totalMs: number;
}

interface UseTimerOptions {
  onExpire: () => void;
  isCommissioner: boolean;
}

export function useTimer({ onExpire, isCommissioner }: UseTimerOptions) {
  const [state, setState] = useState<TimerState>({
    isRunning: false,
    remainingMs: 0,
    totalMs: 0,
  });

  const endsAtRef = useRef<number | null>(null);
  const totalMsRef = useRef<number>(0);
  const rafRef = useRef<number | null>(null);
  const expiredRef = useRef<boolean>(false);
  const onExpireRef = useRef(onExpire);
  onExpireRef.current = onExpire;

  const tick = useCallback(() => {
    if (endsAtRef.current === null) return;

    const remaining = Math.max(0, endsAtRef.current - Date.now());
    setState({
      isRunning: remaining > 0,
      remainingMs: remaining,
      totalMs: totalMsRef.current,
    });

    if (remaining <= 0) {
      // Timer expired
      if (!expiredRef.current && isCommissioner) {
        expiredRef.current = true;
        onExpireRef.current();
      }
      endsAtRef.current = null;
      return;
    }

    rafRef.current = requestAnimationFrame(tick);
  }, [isCommissioner]);

  const start = useCallback(
    (endsAt: string, durationMs: number) => {
      // Guard against zero/negative duration (prevents divide-by-zero in progress bar)
      if (durationMs <= 0) return;

      // Cancel any existing timer
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }

      endsAtRef.current = new Date(endsAt).getTime();
      totalMsRef.current = durationMs;
      expiredRef.current = false;

      setState({
        isRunning: true,
        remainingMs: Math.max(0, endsAtRef.current - Date.now()),
        totalMs: durationMs,
      });

      rafRef.current = requestAnimationFrame(tick);
    },
    [tick]
  );

  const reset = useCallback(
    (endsAt: string, durationMs: number) => {
      // Same as start but semantically distinct (new bid came in)
      start(endsAt, durationMs);
    },
    [start]
  );

  const stop = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    endsAtRef.current = null;
    expiredRef.current = false;
    setState({ isRunning: false, remainingMs: 0, totalMs: 0 });
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  return { state, start, reset, stop };
}
