import { languages } from "../../i18n/locales";
import { ui } from "../../i18n/utils";
import { SITE_TITLE } from "../../consts";
import { languageFeed } from "../../lib/feed";

export function getStaticPaths() {
  return Object.keys(languages).map((lang) => ({ params: { lang } }));
}

export function GET(context) {
  const { lang } = context.params;
  return languageFeed(context, lang, `${SITE_TITLE} (${languages[lang]})`, ui[lang]["site.description"]);
}
