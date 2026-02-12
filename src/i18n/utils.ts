import { languages, defaultLang, type LanguageCode } from './locales';

// Import all UI strings
import en from './ui-strings/en.json';
import es from './ui-strings/es.json';
import fr from './ui-strings/fr.json';
import de from './ui-strings/de.json';
import ja from './ui-strings/ja.json';
import ko from './ui-strings/ko.json';
import zhCN from './ui-strings/zh_cn.json';
import zhTW from './ui-strings/zh_tw.json';
import ptBR from './ui-strings/pt_br.json';
import ru from './ui-strings/ru.json';
import he from './ui-strings/he.json';
import ar from './ui-strings/ar.json';
import hi from './ui-strings/hi.json';

const ui = {
	en,
	es,
	fr,
	de,
	ja,
	ko,
	'zh_cn': zhCN,
	'zh_tw': zhTW,
	'pt_br': ptBR,
	ru,
	he,
	ar,
	hi,
} as const;

// Get translation for a key
export function useTranslations(lang: LanguageCode = defaultLang) {
	return function t(key: keyof (typeof ui)[typeof defaultLang]): string {
		const translation = ui[lang]?.[key] || ui[defaultLang][key];
		return translation || key;
	};
}

// Get language from URL path
export function getLangFromUrl(url: URL): LanguageCode {
	const [, lang] = url.pathname.split('/');
	if (lang && lang in languages) {
		return lang as LanguageCode;
	}
	return defaultLang;
}

// Build alternate language URLs for hreflang
export function getAlternateLanguageUrls(
	baseUrl: string,
	pathname: string
): Array<{ lang: LanguageCode; url: string }> {
	// Remove any existing language prefix
	const cleanPath = pathname
		.replace(/^\/(en|es|fr|de|ja|ko|zh_cn|zh_tw|pt_br|ru|he|ar|hi)\//, '/');

	return Object.keys(languages).map((lang) => {
		const langCode = lang as LanguageCode;
		const langPath = langCode === defaultLang ? '' : `/${langCode}`;
		return {
			lang: langCode,
			url: `${baseUrl}${langPath}${cleanPath}`,
		};
	});
}
