'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  startAuction,
  presentTeam,
  openBidding,
  closeBidding,
  sellTeam,
  skipTeam,
  undoLastSale,
  pauseAuction,
} from '@/actions/bidding';
import { Play, Gavel, XCircle, SkipForward, Undo2, Pause } from 'lucide-react';

interface BiddingControlsProps {
  sessionId: string;
  auctionStatus: string;
  biddingStatus: string;
  currentHighestBid: number;
  currentHighestBidderName: string | null;
  hasSoldTeams: boolean;
  currentTeamIdx: number | null;
}

export function BiddingControls({
  sessionId,
  auctionStatus,
  biddingStatus,
  currentHighestBid,
  currentHighestBidderName,
  hasSoldTeams,
  currentTeamIdx,
}: BiddingControlsProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handle = async (
    action: () => Promise<{ error?: string; success?: boolean }>,
    key: string
  ) => {
    setLoading(key);
    setError(null);
    const result = await action();
    if (result.error) setError(result.error);
    setLoading(null);
  };

  if (auctionStatus === 'completed') {
    return (
      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-6 text-center">
        <p className="text-sm font-medium text-white/60">Auction Complete</p>
      </div>
    );
  }

  if (auctionStatus === 'lobby' || auctionStatus === 'paused') {
    return (
      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
        <Button
          onClick={() => handle(() => startAuction(sessionId), 'start')}
          disabled={loading === 'start'}
          className="w-full gap-2 bg-emerald-600 text-white hover:bg-emerald-700"
        >
          <Play className="size-4" />
          {auctionStatus === 'paused' ? 'Resume Auction' : 'Start Auction'}
        </Button>
        {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
      </div>
    );
  }

  // Active auction — controls depend on bidding status
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 space-y-3">
      {/* Primary action row */}
      <div className="flex gap-2">
        {biddingStatus === 'waiting' && (
          <>
            <Button
              onClick={() => handle(() => openBidding(sessionId), 'open')}
              disabled={loading === 'open'}
              className="flex-1 gap-2 bg-emerald-600 text-white hover:bg-emerald-700"
            >
              <Gavel className="size-4" />
              Open Bidding
            </Button>
            <Button
              onClick={() => handle(() => skipTeam(sessionId), 'skip')}
              disabled={loading === 'skip'}
              variant="outline"
              className="gap-1.5 border-white/10 text-white/60 hover:bg-white/[0.06]"
            >
              <SkipForward className="size-3.5" />
              Skip
            </Button>
          </>
        )}

        {biddingStatus === 'open' && (
          <>
            <Button
              onClick={() => handle(() => closeBidding(sessionId), 'close')}
              disabled={loading === 'close'}
              className="flex-1 gap-2 bg-amber-600 text-white hover:bg-amber-700"
            >
              <XCircle className="size-4" />
              Close Bidding
            </Button>
            <Button
              onClick={() => handle(() => skipTeam(sessionId), 'skip')}
              disabled={loading === 'skip'}
              variant="outline"
              className="gap-1.5 border-white/10 text-white/60 hover:bg-white/[0.06]"
            >
              <SkipForward className="size-3.5" />
              Skip
            </Button>
          </>
        )}

        {biddingStatus === 'closed' && (
          <>
            {currentHighestBid > 0 ? (
              <Button
                onClick={() => handle(() => sellTeam(sessionId), 'sell')}
                disabled={loading === 'sell'}
                className="flex-1 gap-2 bg-emerald-600 text-white hover:bg-emerald-700"
              >
                <Gavel className="size-4" />
                Sell to {currentHighestBidderName} for $
                {currentHighestBid.toLocaleString()}
              </Button>
            ) : (
              <Button
                onClick={() => handle(() => skipTeam(sessionId), 'skip')}
                disabled={loading === 'skip'}
                className="flex-1 gap-2 bg-white/[0.06] text-white/60 hover:bg-white/[0.1]"
              >
                <SkipForward className="size-3.5" />
                No bids — Skip
              </Button>
            )}
          </>
        )}
      </div>

      {/* Secondary actions */}
      <div className="flex gap-2">
        {hasSoldTeams && (
          <Button
            onClick={() => handle(() => undoLastSale(sessionId), 'undo')}
            disabled={loading === 'undo'}
            variant="outline"
            size="sm"
            className="gap-1.5 border-white/10 text-white/40 hover:bg-white/[0.06] hover:text-white/60"
          >
            <Undo2 className="size-3" />
            Undo Last Sale
          </Button>
        )}
        <Button
          onClick={() => handle(() => pauseAuction(sessionId), 'pause')}
          disabled={loading === 'pause'}
          variant="outline"
          size="sm"
          className="gap-1.5 border-white/10 text-white/40 hover:bg-white/[0.06] hover:text-white/60"
        >
          <Pause className="size-3" />
          Pause
        </Button>
      </div>

      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
