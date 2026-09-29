import { defaultLang, type LanguageCode } from "./locales";

import en from "./ui-strings/en.json";
import es from "./ui-strings/es.json";
import fr from "./ui-strings/fr.json";
import de from "./ui-strings/de.json";
import ja from "./ui-strings/ja.json";
import ko from "./ui-strings/ko.json";
import zhCN from "./ui-strings/zh_cn.json";
import zhTW from "./ui-strings/zh_tw.json";
import ptBR from "./ui-strings/pt_br.json";
import ru from "./ui-strings/ru.json";
import he from "./ui-strings/he.json";
import ar from "./ui-strings/ar.json";
import hi from "./ui-strings/hi.json";

export const ui: Record<LanguageCode, Record<string, string>> = {
  en,
  es,
  fr,
  de,
  ja,
  ko,
  zh_cn: zhCN,
  zh_tw: zhTW,
  pt_br: ptBR,
  ru,
  he,
  ar,
  hi,
};

export type UiKey = keyof typeof en;

export function useTranslations(lang: LanguageCode = defaultLang) {
  return (key: UiKey): string => ui[lang]?.[key] || ui[defaultLang][key] || key;
}
