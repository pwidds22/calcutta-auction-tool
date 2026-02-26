import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import readingTime from 'reading-time';

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date: string;
  author: string;
  tags: string[];
  readingTime: string;
  content: string;
  published: boolean;
}

export interface BlogPostMeta {
  slug: string;
  title: string;
  description: string;
  date: string;
  author: string;
  tags: string[];
  readingTime: string;
  published: boolean;
}

const BLOG_DIR = path.join(process.cwd(), 'content', 'blog');

export function getAllPosts(): BlogPostMeta[] {
  if (!fs.existsSync(BLOG_DIR)) return [];

  const files = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith('.mdx'));

  const posts = files
    .map((file) => {
      const slug = file.replace(/\.mdx$/, '');
      const raw = fs.readFileSync(path.join(BLOG_DIR, file), 'utf-8');
      const { data, content } = matter(raw);
      const stats = readingTime(content);

      return {
        slug,
        title: (data.title as string) ?? slug,
        description: (data.description as string) ?? '',
        date: (data.date as string) ?? '',
        author: (data.author as string) ?? 'Calcutta Edge',
        tags: (data.tags as string[]) ?? [],
        readingTime: stats.text,
        published: data.published !== false,
      };
    })
    .filter((p) => p.published)
    .sort((a, b) => b.date.localeCompare(a.date));

  return posts;
}

export function getPostBySlug(slug: string): BlogPost | null {
  const filePath = path.join(BLOG_DIR, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return null;

  const raw = fs.readFileSync(filePath, 'utf-8');
  const { data, content } = matter(raw);
  const stats = readingTime(content);

  const post: BlogPost = {
    slug,
    title: (data.title as string) ?? slug,
    description: (data.description as string) ?? '',
    date: (data.date as string) ?? '',
    author: (data.author as string) ?? 'Calcutta Edge',
    tags: (data.tags as string[]) ?? [],
    readingTime: stats.text,
    content,
    published: data.published !== false,
  };

  if (!post.published) return null;
  return post;
}

export function getAllSlugs(): string[] {
  if (!fs.existsSync(BLOG_DIR)) return [];
  return fs
    .readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith('.mdx'))
    .map((f) => f.replace(/\.mdx$/, ''));
}
