// Blog languages. The code is the URL prefix and the folder name under
// src/content/blog/.

export const languages = {
	en: 'English',
	es: 'Español',
	fr: 'Français',
	de: 'Deutsch',
	ja: '日本語',
	ko: '한국어',
	'zh_cn': '简体中文',
	'zh_tw': '繁體中文',
	'pt_br': 'Português',
	ru: 'Русский',
	he: 'עברית',
	ar: 'العربية',
	hi: 'हिन्दी',
} as const;

export type LanguageCode = keyof typeof languages;

export const defaultLang: LanguageCode = 'en';

export const rtlLanguages: LanguageCode[] = ['he', 'ar'];

// Region locale, for schema.org inLanguage and og:locale.
export const languageToLocale: Record<LanguageCode, string> = {
	en: 'en-US',
	es: 'es-ES',
	fr: 'fr-FR',
	de: 'de-DE',
	ja: 'ja-JP',
	ko: 'ko-KR',
	'zh_cn': 'zh-CN',
	'zh_tw': 'zh-TW',
	'pt_br': 'pt-BR',
	ru: 'ru-RU',
	he: 'he-IL',
	ar: 'ar-SA',
	hi: 'hi-IN',
};

// BCP 47 tag for <html lang> and hreflang. Also the app's URL prefix.
export function htmlLang(lang: LanguageCode): string {
	return { zh_cn: 'zh-CN', zh_tw: 'zh-TW', pt_br: 'pt-BR' }[lang as string] ?? lang;
}

export function ogLocale(lang: LanguageCode): string {
	return languageToLocale[lang].replace('-', '_');
}

export function getTextDirection(lang: LanguageCode): 'ltr' | 'rtl' {
	return rtlLanguages.includes(lang) ? 'rtl' : 'ltr';
}

export const appUrl = (lang: LanguageCode, path = '') => `https://gpuflow.app/${htmlLang(lang)}${path}`;

// Docs: English lives at the root, other languages under a lowercase prefix.
export const docsUrl = (lang: LanguageCode, path = '/') =>
	`https://docs.gpuflow.app${lang === defaultLang ? '' : `/${htmlLang(lang).toLowerCase()}`}${path}`;
