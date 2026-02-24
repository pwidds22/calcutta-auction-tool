'use client';

import { Copy, Check, Wifi, WifiOff } from 'lucide-react';
import { useState } from 'react';

interface AuctionStatusBarProps {
  sessionName: string;
  joinCode: string;
  isConnected: boolean;
  onlineCount: number;
  auctionStatus: string;
}

export function AuctionStatusBar({
  sessionName,
  joinCode,
  isConnected,
  onlineCount,
  auctionStatus,
}: AuctionStatusBarProps) {
  const [copied, setCopied] = useState(false);

  const copyCode = async () => {
    await navigator.clipboard.writeText(joinCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const statusColors: Record<string, string> = {
    lobby: 'bg-amber-500/10 text-amber-400',
    active: 'bg-emerald-500/10 text-emerald-400',
    paused: 'bg-amber-500/10 text-amber-400',
    completed: 'bg-white/[0.06] text-white/50',
  };

  return (
    <div className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-white/[0.02] px-4 py-2.5">
      <div className="flex items-center gap-3">
        <h1 className="text-sm font-semibold text-white">{sessionName}</h1>
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${statusColors[auctionStatus] ?? statusColors.lobby}`}
        >
          {auctionStatus}
        </span>
      </div>

      <div className="flex items-center gap-4">
        {/* Join code */}
        <button
          onClick={copyCode}
          className="flex items-center gap-1.5 rounded-md bg-white/[0.06] px-2.5 py-1 text-xs font-mono text-white/70 transition-colors hover:bg-white/[0.1] hover:text-white"
        >
          Code: <span className="font-bold text-white">{joinCode}</span>
          {copied ? (
            <Check className="size-3 text-emerald-400" />
          ) : (
            <Copy className="size-3" />
          )}
        </button>

        {/* Online count */}
        <span className="text-xs text-white/40">{onlineCount} online</span>

        {/* Connection indicator */}
        {isConnected ? (
          <Wifi className="size-3.5 text-emerald-400" />
        ) : (
          <WifiOff className="size-3.5 text-red-400" />
        )}
      </div>
    </div>
  );
}
