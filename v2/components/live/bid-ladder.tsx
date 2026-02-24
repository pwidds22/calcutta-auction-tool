'use client';

import type { BidEntry } from '@/lib/auction/live/use-auction-channel';

interface BidLadderProps {
  bids: BidEntry[];
  currentHighestBid: number;
  currentHighestBidderName: string | null;
}

export function BidLadder({
  bids,
  currentHighestBid,
  currentHighestBidderName,
}: BidLadderProps) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02]">
      <div className="border-b border-white/[0.06] px-4 py-2.5">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-white/40">
            Bid History
          </h3>
          {currentHighestBid > 0 && (
            <span className="text-sm font-bold text-emerald-400">
              High: ${currentHighestBid.toLocaleString()}
              {currentHighestBidderName && (
                <span className="ml-1 font-normal text-white/40">
                  ({currentHighestBidderName})
                </span>
              )}
            </span>
          )}
        </div>
      </div>

      <div className="max-h-48 overflow-y-auto p-2">
        {bids.length === 0 ? (
          <p className="px-2 py-4 text-center text-xs text-white/30">
            No bids yet
          </p>
        ) : (
          <div className="space-y-1">
            {[...bids].reverse().map((bid, i) => (
              <div
                key={`${bid.bidderId}-${bid.amount}-${i}`}
                className={`flex items-center justify-between rounded-md px-3 py-1.5 text-sm ${
                  i === 0
                    ? 'bg-emerald-500/10 text-emerald-400'
                    : 'text-white/50'
                }`}
              >
                <span className="font-medium">{bid.bidderName}</span>
                <span className="font-mono font-bold">
                  ${bid.amount.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
