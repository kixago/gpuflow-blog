import { getCollection, type CollectionEntry } from 'astro:content';
import type { LanguageCode } from '../i18n/locales';

export type Post = CollectionEntry<'blog'>;

// Post ids are "<lang>/<slug>".
export const slugOf = (post: Post) => post.id.split('/').slice(1).join('/');
export const postPath = (post: Post) => `/${post.id}/`;

export const publishedPosts = () => getCollection('blog', ({ data }) => !data.draft);

export const newestFirst = (a: Post, b: Post) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf();

// Language code -> absolute URL, for every language this slug exists in.
export function translationsOf(posts: Post[], slug: string, site: URL) {
  const out: Partial<Record<LanguageCode, string>> = {};
  for (const p of posts) {
    if (slugOf(p) === slug) out[p.data.locale as LanguageCode] = new URL(postPath(p), site).toString();
  }
  return out;
}

// schema.org JSON-LD, safe to put inside <script>.
export const jsonLd = (data: unknown) =>
  JSON.stringify(data).replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026');
