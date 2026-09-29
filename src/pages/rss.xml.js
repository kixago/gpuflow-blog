import rss from "@astrojs/rss";
import { SITE_DESCRIPTION, SITE_TITLE } from "../consts";
import { publishedPosts, postPath, newestFirst } from "../lib/posts";

// The English feed. Other languages have their own at /<lang>/rss.xml.
export async function GET(context) {
  const posts = (await publishedPosts()).filter((p) => p.data.locale === "en").sort(newestFirst);
  return rss({
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    site: context.site,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.pubDate,
      link: postPath(post),
    })),
  });
}
