'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { joinSession } from '@/actions/session';
import { Users, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export function JoinSessionForm() {
  const router = useRouter();
  const [joinCode, setJoinCode] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim()) {
      setError('Enter a join code');
      return;
    }
    if (!displayName.trim()) {
      setError('Enter your display name');
      return;
    }

    setLoading(true);
    setError(null);

    const result = await joinSession(joinCode.trim(), displayName.trim());

    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else if (result.sessionId) {
      router.push(`/live/${result.sessionId}`);
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
        <h1 className="mt-3 text-xl font-bold text-white">Join Auction</h1>
        <p className="mt-1 text-sm text-white/40">
          Enter the code shared by your commissioner.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Join code */}
        <div>
          <label className="block text-sm font-medium text-white/60 mb-1.5">
            Join Code
          </label>
          <input
            type="text"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
            placeholder="ABC123"
            maxLength={6}
            className="h-12 w-full rounded-md border border-white/10 bg-white/[0.04] px-4 text-center text-lg font-mono font-bold tracking-widest text-white placeholder:text-white/20 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
          />
        </div>

        {/* Display name */}
        <div>
          <label className="block text-sm font-medium text-white/60 mb-1.5">
            Your Display Name
          </label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="e.g. Mike"
            className="h-10 w-full rounded-md border border-white/10 bg-white/[0.04] px-3 text-sm text-white placeholder:text-white/20 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
          />
        </div>

        {error && (
          <p className="rounded-md bg-red-500/10 px-3 py-2 text-sm text-red-400">
            {error}
          </p>
        )}

        <Button
          type="submit"
          disabled={loading || joinCode.length < 6}
          className="w-full gap-2 bg-emerald-600 text-white hover:bg-emerald-700"
        >
          <Users className="size-4" />
          {loading ? 'Joining...' : 'Join Auction'}
        </Button>
      </form>
    </div>
  );
}
