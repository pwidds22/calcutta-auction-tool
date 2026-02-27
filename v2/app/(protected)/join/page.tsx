import { JoinSessionForm } from '@/components/live/join-session-form';

interface JoinPageProps {
  searchParams: Promise<{ code?: string }>;
}

export default async function JoinPage({ searchParams }: JoinPageProps) {
  const params = await searchParams;
  const prefillCode = params.code?.toUpperCase().trim().slice(0, 6) ?? '';

  return (
    <div className="container mx-auto max-w-md px-4 py-16">
      <JoinSessionForm prefillCode={prefillCode} />
    </div>
  );
}
