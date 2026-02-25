import { JoinSessionForm } from '@/components/live/join-session-form';

export default function JoinPage() {
  return (
    <div className="container mx-auto max-w-md px-4 py-16">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-white">Join an Auction</h1>
        <p className="mt-1 text-sm text-white/40">
          Enter the 6-character code shared by your commissioner to join a live auction.
        </p>
      </div>
      <JoinSessionForm />
    </div>
  );
}
