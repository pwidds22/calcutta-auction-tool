import { listTournaments } from '@/lib/tournaments/registry';
import { CreateSessionForm } from '@/components/live/create-session-form';

export default function CreateSessionPage() {
  const tournaments = listTournaments();

  return (
    <div className="container mx-auto max-w-2xl px-4 py-6">
      <CreateSessionForm tournaments={tournaments} />
    </div>
  );
}
