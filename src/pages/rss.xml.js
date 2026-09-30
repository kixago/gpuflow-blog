import { SITE_DESCRIPTION, SITE_TITLE } from "../consts";
import { languageFeed } from "../lib/feed";

// The English feed. Other languages have their own at /<lang>/rss.xml.
export function GET(context) {
  return languageFeed(context, "en", SITE_TITLE, SITE_DESCRIPTION);
}
