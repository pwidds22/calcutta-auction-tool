export interface TimerSettings {
  enabled: boolean;
  initialDurationSec: number;
  resetDurationSec: number;
}

export interface SessionSettings {
  timer?: TimerSettings;
  bidIncrements?: number[];
}

export const DEFAULT_TIMER_SETTINGS: TimerSettings = {
  enabled: false,
  initialDurationSec: 20,
  resetDurationSec: 8,
};

export const DEFAULT_BID_INCREMENTS = [1, 5, 10, 25, 50, 100];

export const BID_INCREMENT_PRESETS = {
  small: { label: 'Small Stakes', description: '$1 – $25', values: [1, 2, 5, 10, 25] },
  medium: { label: 'Medium Stakes', description: '$1 – $100', values: [1, 5, 10, 25, 50, 100] },
  large: { label: 'High Stakes', description: '$5 – $500', values: [5, 25, 50, 100, 250, 500] },
} as const;

export type BidIncrementPreset = keyof typeof BID_INCREMENT_PRESETS;
