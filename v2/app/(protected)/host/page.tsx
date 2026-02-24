import { getMyHostedSessions } from '@/actions/session';
import { HostDashboard } from '@/components/live/host-dashboard';

export default async function HostPage() {
  const { sessions, joined } = await getMyHostedSessions();

  return (
    <div className="container mx-auto max-w-4xl px-4 py-6">
      <HostDashboard hostedSessions={sessions} joinedSessions={joined} />
    </div>
  );
}
