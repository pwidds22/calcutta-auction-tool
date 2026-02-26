import Link from 'next/link';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { getAllPosts } from '@/lib/blog';
import { Calendar, Clock, Tag } from 'lucide-react';

export const metadata = {
  title: 'Blog | Calcutta Edge',
  description:
    'Calcutta auction strategy, tips, and guides. Learn how to host better auctions and win your pool.',
};

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 py-12">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Blog
          </h1>
          <p className="mt-3 text-base text-white/50">
            Strategy guides, auction tips, and platform updates.
          </p>
        </div>

        {posts.length === 0 ? (
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-12 text-center">
            <p className="text-sm text-white/40">
              Posts coming soon. Check back before March Madness!
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {posts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group block rounded-xl border border-white/[0.06] bg-white/[0.02] p-6 transition-all hover:border-emerald-500/20 hover:bg-white/[0.04]"
              >
                {/* Tags */}
                {post.tags.length > 0 && (
                  <div className="mb-2 flex flex-wrap gap-1.5">
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400"
                      >
                        <Tag className="size-2.5" />
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <h2 className="text-lg font-semibold text-white group-hover:text-emerald-400 transition-colors">
                  {post.title}
                </h2>
                <p className="mt-1.5 text-sm text-white/40 line-clamp-2">
                  {post.description}
                </p>

                {/* Meta */}
                <div className="mt-3 flex items-center gap-4 text-xs text-white/30">
                  <span className="flex items-center gap-1">
                    <Calendar className="size-3" />
                    {new Date(post.date + 'T00:00:00').toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="size-3" />
                    {post.readingTime}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
