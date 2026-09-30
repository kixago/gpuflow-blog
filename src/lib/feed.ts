import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getImage } from 'astro:assets';
import { languageToLocale, type LanguageCode } from '../i18n/locales';
import { newestFirst, postPath, publishedPosts } from './posts';

// One RSS feed per language. Besides the posts it carries what feed readers
// and news apps look for: the feed's language, its own URL, when it last
// changed, and each post's cover image as a 1200px JPEG.
export async function languageFeed(
  context: APIContext,
  lang: LanguageCode,
  title: string,
  description: string,
) {
  const site = context.site!;
  const posts = (await publishedPosts()).filter((p) => p.data.locale === lang).sort(newestFirst);
  const changed = Math.max(0, ...posts.map((p) => (p.data.updatedDate ?? p.data.pubDate).valueOf()));

  const items = await Promise.all(
    posts.map(async (post) => {
      let customData = '';
      if (post.data.heroImage) {
        const img = await getImage({ src: post.data.heroImage, width: 1200, format: 'jpeg' });
        const { width, height } = img.attributes;
        customData = `<media:content url="${new URL(img.src, site)}" medium="image" type="image/jpeg" width="${width}" height="${height}"/>`;
      }
      return {
        title: post.data.title,
        description: post.data.description,
        pubDate: post.data.pubDate,
        link: postPath(post),
        categories: [post.data.category],
        customData,
      };
    }),
  );

  return rss({
    title,
    description,
    site,
    xmlns: { atom: 'http://www.w3.org/2005/Atom', media: 'http://search.yahoo.com/mrss/' },
    customData:
      `<language>${languageToLocale[lang].toLowerCase()}</language>` +
      (changed ? `<lastBuildDate>${new Date(changed).toUTCString()}</lastBuildDate>` : '') +
      `<atom:link href="${new URL(context.url.pathname, site)}" rel="self" type="application/rss+xml"/>`,
    items,
  });
}
