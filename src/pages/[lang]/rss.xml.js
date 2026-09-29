import rss from "@astrojs/rss";
import { languages } from "../../i18n/locales";
import { ui } from "../../i18n/utils";
import { SITE_TITLE } from "../../consts";
import { publishedPosts, postPath, newestFirst } from "../../lib/posts";

export function getStaticPaths() {
  return Object.keys(languages).map((lang) => ({ params: { lang } }));
}

export async function GET(context) {
  const { lang } = context.params;
  const posts = (await publishedPosts()).filter((p) => p.data.locale === lang).sort(newestFirst);
  return rss({
    title: `${SITE_TITLE} (${languages[lang]})`,
    description: ui[lang]["site.description"],
    site: context.site,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.pubDate,
      link: postPath(post),
    })),
  });
}
