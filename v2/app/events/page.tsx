import { listTournamentsWithTeams } from '@/lib/tournaments/registry';
import { TournamentCard } from '@/components/events/tournament-card';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';

export const metadata = {
  title: 'Events & Tournaments | Calcutta Edge',
  description:
    'Browse upcoming Calcutta auction tournaments — March Madness, The Masters, Kentucky Derby, NFL Playoffs, and more. Host your auction for free.',
};

export default function EventsPage() {
  const tournaments = listTournamentsWithTeams();

  // Sort: active first, then by start date ascending
  const sorted = [...tournaments].sort((a, b) => {
    if (a.config.isActive && !b.config.isActive) return -1;
    if (!a.config.isActive && b.config.isActive) return 1;
    return a.config.startDate.localeCompare(b.config.startDate);
  });

  const active = sorted.filter((t) => t.config.isActive);
  const upcoming = sorted.filter((t) => !t.config.isActive);

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 py-12">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Events & Tournaments
          </h1>
          <p className="mt-3 text-base text-white/50">
            Pick a tournament, host your Calcutta auction for free, and unlock strategy analytics to dominate your pool.
          </p>
        </div>

        {/* Active tournaments */}
        {active.length > 0 && (
          <section className="mb-12">
            <div className="mb-4 flex items-center gap-3">
              <h2 className="text-lg font-semibold text-white">Live Now</h2>
              <span className="relative flex size-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex size-2.5 rounded-full bg-emerald-500" />
              </span>
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              {active.map((t) => (
                <TournamentCard
                  key={t.config.id}
                  config={t.config}
                  teamCount={t.teams.length}
                  isActive
                />
              ))}
            </div>
          </section>
        )}

        {/* Upcoming tournaments */}
        {upcoming.length > 0 && (
          <section>
            <h2 className="mb-4 text-lg font-semibold text-white">
              Upcoming Tournaments
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {upcoming.map((t) => (
                <TournamentCard
                  key={t.config.id}
                  config={t.config}
                  teamCount={t.teams.length}
                />
              ))}
            </div>
          </section>
        )}

        {/* Coming soon CTA */}
        <section className="mt-16 text-center">
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-6 py-8">
            <h3 className="text-lg font-semibold text-white">
              Don&apos;t see your tournament?
            </h3>
            <p className="mt-2 text-sm text-white/40">
              We&apos;re adding new events every season. Need a custom Calcutta for your group?
            </p>
            <a
              href="mailto:support@calcuttaedge.com"
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-700"
            >
              Contact Us
            </a>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
