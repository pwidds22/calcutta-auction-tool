import { notFound } from 'next/navigation';
import Link from 'next/link';
import { PublicPageLayout } from '@/components/layout/public-page-layout';
import { getPostBySlug, getAllSlugs } from '@/lib/blog';
import { MdxContent } from '@/components/blog/mdx-content';
import { Calendar, Clock, ArrowLeft, Tag } from 'lucide-react';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return { title: 'Post Not Found' };

  return {
    title: `${post.title} | Calcutta Edge Blog`,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      type: 'article',
      publishedTime: post.date,
      authors: [post.author],
      tags: post.tags,
    },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  return (
    <PublicPageLayout>
      <main className="mx-auto max-w-3xl px-4 py-12">
        {/* Back link */}
        <Link
          href="/blog"
          className="mb-8 inline-flex items-center gap-1.5 text-sm text-white/40 transition-colors hover:text-white"
        >
          <ArrowLeft className="size-3.5" />
          Back to blog
        </Link>

        {/* Header */}
        <header className="mb-8">
          {post.tags.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-1.5">
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

          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            {post.title}
          </h1>

          {post.description && (
            <p className="mt-3 text-lg text-white/50">{post.description}</p>
          )}

          <div className="mt-4 flex items-center gap-4 text-sm text-white/30">
            <span>{post.author}</span>
            <span className="flex items-center gap-1">
              <Calendar className="size-3.5" />
              {new Date(post.date + 'T00:00:00').toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="size-3.5" />
              {post.readingTime}
            </span>
          </div>
        </header>

        {/* Content */}
        <article className="prose-custom">
          <MdxContent source={post.content} />
        </article>

        {/* CTA */}
        <div className="mt-16 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.03] p-6 text-center">
          <p className="text-sm font-medium text-white">
            Ready to host your Calcutta auction?
          </p>
          <p className="mt-1 text-xs text-white/40">
            Free hosting. Strategy analytics available.
          </p>
          <Link
            href="/register"
            className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-700"
          >
            Get Started Free
          </Link>
        </div>
      </main>
    </PublicPageLayout>
  );
}
