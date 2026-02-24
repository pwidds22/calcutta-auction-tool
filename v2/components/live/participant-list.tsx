'use client';

import { Users, Crown } from 'lucide-react';

interface ParticipantListProps {
  onlineUsers: Array<{
    userId: string;
    displayName: string;
    isCommissioner: boolean;
  }>;
}

export function ParticipantList({ onlineUsers }: ParticipantListProps) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02]">
      <div className="flex items-center gap-2 border-b border-white/[0.06] px-4 py-2.5">
        <Users className="size-3.5 text-white/40" />
        <h3 className="text-xs font-semibold uppercase tracking-wider text-white/40">
          Online ({onlineUsers.length})
        </h3>
      </div>
      <div className="max-h-40 overflow-y-auto p-2">
        {onlineUsers.length === 0 ? (
          <p className="px-2 py-3 text-center text-xs text-white/30">
            No one online yet
          </p>
        ) : (
          <div className="space-y-0.5">
            {onlineUsers.map((user) => (
              <div
                key={user.userId}
                className="flex items-center gap-2 rounded-md px-3 py-1.5"
              >
                <div className="size-1.5 rounded-full bg-emerald-400" />
                <span className="text-sm text-white/70">
                  {user.displayName}
                </span>
                {user.isCommissioner && (
                  <Crown className="size-3 text-amber-400" />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
