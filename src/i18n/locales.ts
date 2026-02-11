// ============================================
// LANGUAGE CONFIGURATION
// ============================================
// Based on your main app's i18n setup

export const languages = {
	en: 'English',
	es: 'Español',
	fr: 'Français',
	de: 'Deutsch',
	ja: '日本語',
	ko: '한국어',
	'zh-CN': '简体中文',
	'zh-TW': '繁體中文',
	'pt-BR': 'Português',
	ru: 'Русский',
	he: 'עברית',
	ar: 'العربية',
	hi: 'हिन्दी',
} as const;

export type LanguageCode = keyof typeof languages;

// Default language (fallback)
export const defaultLang: LanguageCode = 'en';

// Languages that use Right-to-Left text direction
export const rtlLanguages: LanguageCode[] = ['he', 'ar'];

// Map language codes to locale codes (for schema.org)
export const languageToLocale: Record<LanguageCode, string> = {
	en: 'en-US',
	es: 'es-ES',
	fr: 'fr-FR',
	de: 'de-DE',
	ja: 'ja-JP',
	ko: 'ko-KR',
	'zh-CN': 'zh-CN',
	'zh-TW': 'zh-TW',
	'pt-BR': 'pt-BR',
	ru: 'ru-RU',
	he: 'he-IL',
	ar: 'ar-SA',
	hi: 'hi-IN',
};

// URL path prefixes (empty string for default language)
export function getLanguagePath(lang: LanguageCode): string {
	return lang === defaultLang ? '' : `/${lang}`;
}

// Check if a language code is valid
export function isValidLanguage(lang: string): lang is LanguageCode {
	return lang in languages;
}

// Get text direction for a language
export function getTextDirection(lang: LanguageCode): 'ltr' | 'rtl' {
	return rtlLanguages.includes(lang) ? 'rtl' : 'ltr';
}
