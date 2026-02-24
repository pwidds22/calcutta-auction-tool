'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Plus, Radio, Users, ArrowRight } from 'lucide-react';

interface Session {
  id: string;
  name: string;
  join_code: string;
  status: string;
  tournament_id: string;
  created_at: string;
}

interface HostDashboardProps {
  hostedSessions: Session[];
  joinedSessions: Session[];
}

const statusColors: Record<string, string> = {
  lobby: 'bg-amber-500/10 text-amber-400',
  active: 'bg-emerald-500/10 text-emerald-400',
  paused: 'bg-amber-500/10 text-amber-400',
  completed: 'bg-white/[0.06] text-white/40',
};

function SessionCard({
  session,
  isHosted,
}: {
  session: Session;
  isHosted: boolean;
}) {
  const href = isHosted ? `/host/${session.id}` : `/live/${session.id}`;

  return (
    <Link
      href={href}
      className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 transition-colors hover:bg-white/[0.04]"
    >
      <div>
        <h3 className="text-sm font-semibold text-white">{session.name}</h3>
        <div className="mt-1 flex items-center gap-2">
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-medium capitalize ${statusColors[session.status] ?? statusColors.lobby}`}
          >
            {session.status}
          </span>
          <span className="text-xs font-mono text-white/40">
            {session.join_code}
          </span>
        </div>
      </div>
      <ArrowRight className="size-4 text-white/30" />
    </Link>
  );
}

export function HostDashboard({
  hostedSessions,
  joinedSessions,
}: HostDashboardProps) {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Live Auctions</h1>
          <p className="mt-1 text-sm text-white/40">
            Host or join live Calcutta auctions
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/join">
            <Button
              variant="outline"
              className="gap-1.5 border-white/10 text-white/60 hover:bg-white/[0.06]"
            >
              <Users className="size-4" />
              Join
            </Button>
          </Link>
          <Link href="/host/create">
            <Button className="gap-1.5 bg-emerald-600 text-white hover:bg-emerald-700">
              <Plus className="size-4" />
              Create Auction
            </Button>
          </Link>
        </div>
      </div>

      {/* Hosted sessions */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Radio className="size-4 text-white/40" />
          <h2 className="text-sm font-semibold uppercase tracking-wider text-white/40">
            My Hosted Auctions
          </h2>
        </div>
        {hostedSessions.length === 0 ? (
          <div className="rounded-xl border border-dashed border-white/[0.08] py-8 text-center">
            <p className="text-sm text-white/30">
              No auctions yet — create your first one!
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {hostedSessions.map((s) => (
              <SessionCard key={s.id} session={s} isHosted />
            ))}
          </div>
        )}
      </div>

      {/* Joined sessions */}
      {joinedSessions.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Users className="size-4 text-white/40" />
            <h2 className="text-sm font-semibold uppercase tracking-wider text-white/40">
              Joined Auctions
            </h2>
          </div>
          <div className="space-y-2">
            {joinedSessions.map((s) => (
              <SessionCard key={s.id} session={s} isHosted={false} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
