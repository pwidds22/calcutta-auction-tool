'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { createSession } from '@/actions/session';
import type { TournamentConfig, PayoutRules } from '@/lib/tournaments/types';
import {
  BID_INCREMENT_PRESETS,
  type BidIncrementPreset,
  type SessionSettings,
} from '@/lib/auction/live/types';
import { ArrowLeft, Gavel, Timer, DollarSign } from 'lucide-react';
import Link from 'next/link';

interface CreateSessionFormProps {
  tournaments: TournamentConfig[];
}

export function CreateSessionForm({ tournaments }: CreateSessionFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeTournament = tournaments.find((t) => t.isActive) ?? tournaments[0];

  const [name, setName] = useState('');
  const [tournamentId, setTournamentId] = useState(activeTournament?.id ?? '');
  const [potSize, setPotSize] = useState('10000');

  // Bid increment preset
  const [bidPreset, setBidPreset] = useState<BidIncrementPreset>('medium');

  // Timer settings
  const [timerEnabled, setTimerEnabled] = useState(false);
  const [initialDuration, setInitialDuration] = useState('20');
  const [resetDuration, setResetDuration] = useState('8');

  const selectedTournament = tournaments.find((t) => t.id === tournamentId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Give your auction a name');
      return;
    }
    if (!selectedTournament) {
      setError('Select a tournament');
      return;
    }

    setLoading(true);
    setError(null);

    const payoutRules = selectedTournament.defaultPayoutRules as PayoutRules;

    const settings: SessionSettings = {
      bidIncrements: [...BID_INCREMENT_PRESETS[bidPreset].values],
      timer: {
        enabled: timerEnabled,
        initialDurationSec: Math.max(5, Math.min(120, Number(initialDuration) || 20)),
        resetDurationSec: Math.max(3, Math.min(30, Number(resetDuration) || 8)),
      },
    };

    const result = await createSession({
      tournamentId,
      name: name.trim(),
      payoutRules,
      estimatedPotSize: Number(potSize) || 10000,
      settings,
    });

    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else if (result.sessionId) {
      router.push(`/host/${result.sessionId}`);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/host"
          className="inline-flex items-center gap-1.5 text-sm text-white/40 hover:text-white/60 transition-colors"
        >
          <ArrowLeft className="size-3.5" />
          Back to dashboard
        </Link>
        <h1 className="mt-3 text-xl font-bold text-white">
          Create Live Auction
        </h1>
        <p className="mt-1 text-sm text-white/40">
          Set up your pool, invite participants, and run the auction live.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Auction name */}
        <div>
          <label className="block text-sm font-medium text-white/60 mb-1.5">
            Auction Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder='e.g. "Office March Madness 2026"'
            className="h-10 w-full rounded-md border border-white/10 bg-white/[0.04] px-3 text-sm text-white placeholder:text-white/20 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
          />
        </div>

        {/* Tournament */}
        <div>
          <label className="block text-sm font-medium text-white/60 mb-1.5">
            Tournament
          </label>
          <select
            value={tournamentId}
            onChange={(e) => setTournamentId(e.target.value)}
            className="h-10 w-full rounded-md border border-white/10 bg-white/[0.04] px-3 text-sm text-white focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
          >
            {tournaments.map((t) => (
              <option key={t.id} value={t.id} className="bg-zinc-900">
                {t.name}
              </option>
            ))}
          </select>
        </div>

        {/* Estimated pot size */}
        <div>
          <label className="block text-sm font-medium text-white/60 mb-1.5">
            Estimated Pot Size
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-white/40">
              $
            </span>
            <input
              type="number"
              value={potSize}
              onChange={(e) => setPotSize(e.target.value)}
              className="h-10 w-full rounded-md border border-white/10 bg-white/[0.04] pl-7 pr-3 text-sm text-white placeholder:text-white/20 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
            />
          </div>
          <p className="mt-1 text-xs text-white/30">
            This is just an estimate — the real pot size is calculated from actual sales.
          </p>
        </div>

        {/* Bid Increments */}
        <div>
          <label className="block text-sm font-medium text-white/60 mb-1.5">
            <DollarSign className="inline size-3.5 mr-1" />
            Quick Bid Buttons
          </label>
          <p className="text-xs text-white/30 mb-2">
            Shortcuts participants tap to raise the bid quickly.
          </p>
          <div className="grid grid-cols-3 gap-2">
            {(Object.entries(BID_INCREMENT_PRESETS) as [BidIncrementPreset, typeof BID_INCREMENT_PRESETS[BidIncrementPreset]][]).map(
              ([key, preset]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setBidPreset(key)}
                  className={`rounded-md border px-3 py-2 text-left transition-colors ${
                    bidPreset === key
                      ? 'border-emerald-500/50 bg-emerald-500/10 text-white'
                      : 'border-white/10 bg-white/[0.02] text-white/50 hover:border-white/20 hover:text-white/70'
                  }`}
                >
                  <div className="text-xs font-medium">{preset.label}</div>
                  <div className="text-[10px] opacity-60">{preset.description}</div>
                </button>
              )
            )}
          </div>
          <p className="mt-1.5 text-xs text-white/30">
            Buttons shown: {BID_INCREMENT_PRESETS[bidPreset].values.map((v) => `+$${v}`).join(', ')}
          </p>
        </div>

        {/* Bidding Timer */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-white/60 mb-1.5">
            <Timer className="size-3.5" />
            Bidding Timer
          </label>
          <button
            type="button"
            onClick={() => setTimerEnabled(!timerEnabled)}
            className={`flex w-full items-center justify-between rounded-md border px-3 py-2.5 transition-colors ${
              timerEnabled
                ? 'border-emerald-500/50 bg-emerald-500/10 text-white'
                : 'border-white/10 bg-white/[0.02] text-white/50 hover:border-white/20'
            }`}
          >
            <span className="text-sm">
              {timerEnabled ? 'Countdown timer enabled' : 'No timer (manual close)'}
            </span>
            <div
              className={`h-5 w-9 rounded-full p-0.5 transition-colors ${
                timerEnabled ? 'bg-emerald-500' : 'bg-white/20'
              }`}
            >
              <div
                className={`size-4 rounded-full bg-white transition-transform ${
                  timerEnabled ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </div>
          </button>

          {timerEnabled && (
            <div className="mt-2 grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-white/40 mb-1">
                  Initial countdown
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={initialDuration}
                    onChange={(e) => setInitialDuration(e.target.value)}
                    min={5}
                    max={120}
                    className="h-9 w-full rounded-md border border-white/10 bg-white/[0.04] px-3 pr-8 text-sm text-white focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-white/30">
                    sec
                  </span>
                </div>
              </div>
              <div>
                <label className="block text-xs text-white/40 mb-1">
                  Reset on new bid
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={resetDuration}
                    onChange={(e) => setResetDuration(e.target.value)}
                    min={3}
                    max={30}
                    className="h-9 w-full rounded-md border border-white/10 bg-white/[0.04] px-3 pr-8 text-sm text-white focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-white/30">
                    sec
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {error && (
          <p className="rounded-md bg-red-500/10 px-3 py-2 text-sm text-red-400">
            {error}
          </p>
        )}

        <Button
          type="submit"
          disabled={loading}
          className="w-full gap-2 bg-emerald-600 text-white hover:bg-emerald-700"
        >
          <Gavel className="size-4" />
          {loading ? 'Creating...' : 'Create Auction'}
        </Button>
      </form>
    </div>
  );
}
