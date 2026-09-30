---
title: "למה חברות אוסרות על ChatGPT בעבודה ובמה הן משתמשות במקום"
description: "חברות מגבילות אפליקציות צ'אט AI ציבוריות כי עובדים מדביקים בהן נתונים שאין לחברה חוזה לשתף. המקרים האמיתיים, הרגולציה ב-2026 וחלופות שעובדות."
excerpt: "רוב האיסורים של חברות על ChatGPT עוסקים בחוזים ובהגדרות ברירת מחדל. מה השתבש בסמסונג, מה התוכניות העסקיות מבטיחות היום, ולאן הפרומפט שלכם הולך בכל אפשרות."
pubDate: 2026-02-26
updatedDate: 2026-09-30
locale: "he"
category: "case-studies"
featured: false
draft: false
author: "GPUFlow Team"
heroImage: "../_images/corporate-ai-policy-restriction.png"
heroImageAlt: "סביבת משרד תאגידית עם סמלי מנעול דיגיטליים מעל מסכי מחשב, שמייצגים הגבלות גישה ל-AI"
faq:
  - question: "למה חברות אוסרות על עובדים להשתמש ב-ChatGPT?"
    answer: "כי עובדים מדביקים נתונים של החברה ושל לקוחות לחשבון פרטי שאין לחברה חוזה איתו. בתוכניות הפרטיות של ChatGPT, ברירת המחדל מאפשרת ל-OpenAI להשתמש בתוכן כדי לשפר את המודלים שלה, ואין הסכם לעיבוד נתונים (DPA) או הסכם Business Associate לפי HIPAA שמכסה את החברה."
  - question: "האם ChatGPT Enterprise מתאמן על נתוני החברה?"
    answer: "לא כברירת מחדל. בדף הפרטיות הארגוני של OpenAI כתוב שהיא לא מתאמנת על נתונים מ-ChatGPT Enterprise, ‏Business, ‏Edu או מה-API אלא אם הלקוח בוחר בכך, והוא מציין ביקורות SOC 2 Type 2 ושליטה של מנהלי המערכת במשך שמירת הנתונים ב-Enterprise."
  - question: "אילו חברות הגבילו את ChatGPT?"
    answer: "סמסונג הגבילה AI גנרטיבי במחשבי החברה ב-2023, אחרי דיווחים על דליפות של קוד מקור ונתונים פנימיים. באותה שנה דווח שגם Apple, ‏JPMorgan, ‏Bank of America, ‏Citi, ‏Deutsche Bank, ‏Goldman Sachs, ‏Wells Fargo, ‏Walmart ו-Verizon הגבילו אותו."
  - question: "האם מותר לפי GDPR להכניס נתוני לקוחות ל-ChatGPT?"
    answer: "רק עם בסיס חוקי וחוזה עם מעבד נתונים שעומד בסעיף 28 של GDPR. תוכנית עסקית עם הסכם לעיבוד נתונים יכולה לעמוד בזה; חשבון אישי של עובד לא יכול, כי לחברה אין חוזה עם הספק על החשבון הזה."
  - question: "ממתי חלים הכללים לסיכון גבוה של ה-EU AI Act?"
    answer: "אחרי תיקון ה-AI Omnibus, שנכנס לתוקף ב-27 ביולי 2026, הכללים לסיכון גבוה חלים על מערכות עצמאיות כמו סינון קורות חיים מ-2 בדצמבר 2027, ועל AI במוצרים מפוקחים מ-2 באוגוסט 2028. חובות השקיפות לפי סעיף 50 חלות מאז 2 באוגוסט 2026."
  - question: "אפשר להשתמש ב-GPUFlow לנתונים חסויים של החברה?"
    answer: "לא. ב-GPUFlow המודל רץ על המחשב של הספק עצמו, כך שהפרומפטים והתשובות עוברים דרך המכונה הזו כטקסט גלוי. התנאים אוסרים על ספקים לתעד אותם, אבל זה כלל חוזי ולא חסימה טכנית, אז השתמשו בו רק לנתונים שהייתם יכולים לשתף עם אדם זר."
---

רוב החברות ש"אוסרות על ChatGPT" לא מתנגדות ל-AI. הן מתנגדות לכך שעובדים מדביקים נתונים של החברה לחשבון פרטי שאין לחברה חוזה איתו, ושבו, כברירת מחדל, הספק רשאי להשתמש בהם כדי לשפר את המודלים שלו. הפתרון הרגיל הוא כלי מאושר: תוכנית עסקית עם תנאים שאוסרים אימון ומגבילים שמירת נתונים, endpoint של מודל בתוך חשבון הענן של החברה, או מודל open-weights על חומרה שהחברה מפעילה. כשהחוזה הנכון קיים, הכלים הציבוריים בסדר גמור להרבה עבודה.

בהמשך: מה באמת קרה במקרים שכולם מצטטים, אילו כללים חלים ב-2026, מה אומרים היום התנאים העסקיים של כל ספק, ולאן הטקסט שלכם הולך בכל אפשרות. הכול נבדק מול מקורות ראשוניים בספטמבר 2026; הם מופיעים בסוף.

## מה קרה בסמסונג ובבנקים

סמסונג היא המקרה שכולם מצטטים. בתחילת 2023, חטיבת המוליכים למחצה שלה התירה למהנדסים להשתמש ב-ChatGPT. כלי תקשורת קוריאניים דיווחו אז על שלושה מקרים נפרדים: עובדים הדביקו קוד מקור כדי לתקן באגים, השתמשו בכלי כדי לכתוב פרוטוקולים של ישיבות, והזינו נתוני מדידה של ציוד ונתוני תפוקה. סמסונג לא אישרה את הפרטים באותו זמן. בסוף אפריל 2023, מזכר הודיע לעובדים באחת החטיבות הגדולות שלה ש-AI גנרטיבי מוגבל זמנית במחשבי החברה. בסקר פנימי חודש קודם לכן, 65% מהמשיבים אמרו שהם מודאגים מסיכוני האבטחה.

לפי ה-Wall Street Journal, ‏Apple הגבילה את ChatGPT ואת GitHub Copilot במאי 2023, מחשש שמידע חסוי יגיע למפתחים שמאמנים מודלים על נתוני משתמשים. באותם דיווחים הופיעו גם JPMorgan, ‏Bank of America, ‏Citi, ‏Deutsche Bank, ‏Goldman Sachs, ‏Wells Fargo, ‏Walmart ו-Verizon כחברות שהגבילו את ChatGPT.

שני דברים במקרים האלה קל לפספס.

ראשית, אף אחד לא נפרץ. הנתונים הגיעו בדיוק לאן שהעובד שלח אותם. הדאגה הייתה ממה שקורה אחר כך: מי שומר אותם, לכמה זמן, האם הם מאמנים מודל, והאם בית משפט יכול לחייב את הספק למסור אותם.

שנית, האיסורים לא נשארו איסורים. ‏JPMorgan בנתה פלטפורמה פנימית משלה, LLM Suite, שנותנת לעובדים גישה למודלי שפה גדולים "בסביבה מאובטחת". היא הושקה בקיץ 2024 והגיעה ל-200,000 משתמשים רשומים תוך שמונה חודשים. זה המסלול הטיפוסי: חוסמים את האפליקציה הצרכנית, ואז נותנים לאנשים משהו מאושר.

## מה הסיכון באמת

כשעובד משתמש בחשבון צרכני אישי, ארבע בעיות נפרדות מצטברות.

**אימון כברירת מחדל.** ב-ChatGPT Free, ‏Plus ו-Pro, מותר להשתמש בתוכן כדי לשפר את המודלים של OpenAI, אלא אם המשתמש מכבה את "Improve the model for everyone" ב-Data controls. אם המשתמש לוחץ על אגודל למעלה או למטה, ייתכן שייעשה שימוש בשיחה כולה גם אחרי שביטל את ההסכמה. בתוכניות הצרכניות של Claude של Anthropic, שיחות משמשות לאימון אם המשתמש מאפשר שיפור מודל. כלומר, השאלה אם קוד המקור שלכם יגיע לסט אימון תלויה בהגדרה אחת בחשבון של מישהו אחר.

**שמירת נתונים שאתם לא שולטים בה.** נתונים עסקיים בפלטפורמה של OpenAI נמחקים תוך 30 יום מרגע שהמשתמש מוחק אותם, "אלא אם אנחנו מחויבים על פי חוק לשמור אותם". הסעיף האחרון הזה אמיתי. בתביעה של הניו יורק טיימס, צו של בית משפט מיוני 2025 עד 26 בספטמבר 2025 חייב את OpenAI לשמור תוכן של ChatGPT הצרכני ושל ה-API הרגיל שאחרת היה נמחק. לקוחות ChatGPT Enterprise, ‏Edu ולקוחות API עם zero data retention לא היו כלולים בו.

**אין חוזה.** מבחינה משפטית זו הבעיה החשובה ביותר. לפי GDPR, חברה שמאפשרת לספק לעבד מידע אישי חייבת להשתמש במעבד שנותן "ערובות מספקות", וחייב להיות לה חוזה מחייב איתו (סעיף 28). ספק שירותי בריאות צריך הסכם Business Associate ‏(BAA). לחשבון אישי של עובד אין אף אחד מהם, כך שההפרה קורית ברגע ההדבקה, בין אם משהו דולף בסוף ובין אם לא.

**אין תיעוד.** חברות בתחומים מפוקחים חייבות לפקח על תקשורת עסקית ולשמור אותה בארכיון. שיחה בחשבון אישי נמצאת מחוץ לכל ארכיון שמחלקת הציות מפעילה.

## הכללים שחלים ב-2026

### ‏GDPR

מידע אישי של לקוחות או עובדים באיחוד האירופי בתוך פרומפט הוא עיבוד. הוא צריך בסיס חוקי, חוזה עם מעבד לפי סעיף 28, ונתיב חוקי לכל העברה אל מחוץ לאיחוד. לספקים אמריקאיים, ה-EU-US Data Privacy Framework עדיין בתוקף: בית הדין הכללי של האיחוד דחה את העתירה של Latombe ב-3 בספטמבר 2025 (תיק T-553/23). ערעור תלוי ועומד בבית הדין לצדק בתיק C-703/25 P, אז כדאי לעקוב.

רגולטורים כבר פעלו נגד שירותי צ'אט ישירות. ה-Garante האיטלקי חסם זמנית את ChatGPT בסוף מרץ 2023, ובדצמבר 2024 הטיל על OpenAI קנס של €15 מיליון על עיבוד מידע אישי לאימון ChatGPT בלי בסיס חוקי מתאים, אי-דיווח על פרצה ממרץ 2023, שקיפות חלשה והיעדר אימות גיל. ‏OpenAI כינתה את הקנס לא מידתי ואמרה שתערער.

### ‏HIPAA

כל שירות שמקבל, מאחסן או מעביר מידע רפואי מוגן אלקטרוני עבור גוף מכוסה הוא Business Associate וצריך BAA חתום. משרד הבריאות האמריקאי (HHS) מבהיר שספק ענן שמחזיק רק נתונים מוצפנים ואין לו מפתח הוא עדיין Business Associate. ‏OpenAI אומרת שהיא יכולה לחתום על BAA ל-API שלה. לחשבון ChatGPT אישי של רופא אין BAA בכלל.

### שירותים פיננסיים

ה-Regulatory Notice 24-09 של FINRA ‏(27 ביוני 2024) קובע שהכללים שלה חלים על AI גנרטיבי "בדיוק כמו שהם חלים כשחברות חברות משתמשות בכל טכנולוגיה או כלי אחרים". פיקוח, תקשורת עם הציבור ושמירת רשומות, כולם עדיין חלים. רוב ההגבלות של הבנקים ב-2023 נבעו בדיוק מזה.

### ‏EU AI Act

ה-AI Act נכנס לתוקף ב-1 באוגוסט 2024. האיסורים על פרקטיקות אסורות וחובת האוריינות ב-AI חלים מ-2 בפברואר 2025, והחובות לספקי מודלי AI לשימוש כללי מ-2 באוגוסט 2025. תיקון ה-AI Omnibus, ‏Regulation (EU) 2026/1744, פורסם ב-24 ביולי 2026 ונכנס לתוקף ב-27 ביולי 2026. הוא הזיז את מועדי הסיכון הגבוה: 2 בדצמבר 2027 למערכות עצמאיות בסיכון גבוה, כולל AI שמשמש בגיוס עובדים כמו מיון קורות חיים, ו-2 באוגוסט 2028 ל-AI שמובנה במוצרים מפוקחים. חובות השקיפות לפי סעיף 50 נכנסו לתוקף כמתוכנן ב-2 באוגוסט 2026, וחובת האוריינות ב-AI רוככה לנקיטת צעדים כדי "לתמוך" בה.

לחברה שמשתמשת בעוזר צ'אט כדי לנסח מיילים, ה-AI Act מוסיף מעט. אם אותו עוזר מתחיל לדרג מועמדים לעבודה, אתם מפעילים מערכת בסיכון גבוה, והמועד של דצמבר 2027 חל עליכם.

## מה התוכניות העסקיות מבטיחות

כל ספק גדול מוכר היום שכבה עסקית עם ברירות מחדל שונות מהאפליקציה הצרכנית. הטבלה מסכמת את מה שכתוב בדף של כל ספק, נכון לספטמבר 2026.

| שירות | מתאמן על הנתונים שלכם כברירת מחדל? | שמירת נתונים ושליטה | הערות ציות |
| --- | --- | --- | --- |
| ‏ChatGPT Free, Plus, Pro | ייתכן, אלא אם המשתמש מבטל | לפי חשבון משתמש | אין חוזה עם החברה |
| ‏ChatGPT Business, Enterprise, Edu | לא | מנהלי ה-workspace קובעים את משך השמירה | ‏SOC 2 Type 2 ל-Enterprise ול-Business |
| ‏OpenAI API | לא | נמחק אחרי 30 יום; zero data retention לשימושים שעומדים בתנאים | ‏BAA זמין |
| ‏Claude Team, Enterprise, API | לא | משוב עשוי להישמר עד 5 שנים; בעלי החשבון יכולים לכבות משוב | תנאים מסחריים |
| ‏Microsoft 365 Copilot ו-Copilot Chat | לא, לא משמש לאימון מודלי יסוד | מדיניות השמירה, התוויות והביקורת שלכם חלות | ‏DPA, ‏EU Data Boundary (לא כולל מודלים של Anthropic) |
| ‏Gemini ב-Google Workspace | לא משמש לאימון מחוץ לדומיין שלכם בלי רשות | בקרות ה-Workspace הקיימות חלות | תמיכה ב-HIPAA, ‏FedRAMP High |

ה-endpoints של מודלים בתוך העננים הגדולים הולכים רחוק יותר. ‏Microsoft אומרת שפרומפטים ותשובות של מודלים ש-Azure מוכרת ב-Microsoft Foundry "אינם זמינים ל-OpenAI או לספקים אחרים" ומעובדים בתוך האזור הגיאוגרפי שבחרתם, אלא אם בחרתם פריסה מסוג Global או DataZone. ב-Amazon Bedrock, המודלים רצים בחשבונות פריסה שלספקי המודלים אין גישה אליהם, כך שהם אף פעם לא רואים את הפרומפטים או את התשובות שלכם.

מה שתוכנית עסקית לא משנה: הטקסט עדיין יושב על השרתים של הספק כל עוד תנאי השמירה מאפשרים, וצו של בית משפט עדיין יכול להגיע אליו. זה אותו אמון שאתם כבר נותנים לספקי המייל והמסמכים שלכם. לרוב העבודה הפנימית זו עסקה סבירה. לסודות מסחריים, לנתונים מפוקחים בלי BAA, או לחומר שחוזה עם לקוח אוסר לשלוח למעבדי משנה, ייתכן שלא.

## לאן הפרומפט שלכם הולך בכל אפשרות

הדרך הכנה להשוות אפשרויות היא לעקוב אחרי פרומפט אחד ולשאול מי יכול לקרוא אותו.

<figure>
<svg viewBox="0 0 720 470" role="img" aria-labelledby="d1-title" xmlns="http://www.w3.org/2000/svg" font-family="system-ui, sans-serif" font-size="15">
<title id="d1-title">לאן הפרומפט של עובד הולך בחמש תצורות AI שונות, ומה מגן עליו בכל אחת</title>
<rect x="0" y="0" width="720" height="470" fill="#ffffff"/>
<text x="325" y="30" text-anchor="middle" fill="#64748b" direction="rtl">לאן הטקסט הולך</text>
<text x="475" y="30" fill="#64748b" text-anchor="end" direction="rtl">מה מגן עליו</text>
<rect x="20" y="200" width="140" height="70" rx="10" fill="#eef2ff" stroke="#6366f1" stroke-width="2"/>
<text x="90" y="231" text-anchor="middle" fill="#1e1b4b" direction="rtl">הפרומפט</text>
<text x="90" y="252" text-anchor="middle" fill="#1e1b4b" direction="rtl">של העובד</text>
<line x1="160" y1="235" x2="200" y2="80" stroke="#6366f1" stroke-width="2"/>
<line x1="160" y1="235" x2="200" y2="160" stroke="#6366f1" stroke-width="2"/>
<line x1="160" y1="235" x2="200" y2="240" stroke="#6366f1" stroke-width="2"/>
<line x1="160" y1="235" x2="200" y2="320" stroke="#6366f1" stroke-width="2"/>
<line x1="160" y1="235" x2="200" y2="400" stroke="#6366f1" stroke-width="2"/>
<rect x="200" y="50" width="250" height="60" rx="10" fill="#ffffff" stroke="#f97316" stroke-width="2"/>
<text x="325" y="76" text-anchor="middle" fill="#1e1b4b" direction="rtl">אפליקציית צ'אט צרכנית</text>
<text x="325" y="97" text-anchor="middle" fill="#64748b" font-size="13" direction="rtl">חשבון Free, ‏Plus או Pro אישי</text>
<text x="475" y="76" fill="#1e1b4b" font-size="14" text-anchor="end" direction="rtl">אימון מותר כברירת מחדל</text>
<text x="475" y="97" fill="#1e1b4b" font-size="14" text-anchor="end" direction="rtl">אין חוזה עם החברה שלכם</text>
<rect x="200" y="130" width="250" height="60" rx="10" fill="#eef2ff" stroke="#6366f1" stroke-width="2"/>
<text x="325" y="156" text-anchor="middle" fill="#1e1b4b" direction="rtl">תוכנית עסקית של ספק AI</text>
<text x="325" y="177" text-anchor="middle" fill="#64748b" font-size="13" direction="rtl">שרתי הספק, חשבון של החברה</text>
<text x="475" y="156" fill="#1e1b4b" font-size="14" text-anchor="end" direction="rtl">בלי אימון כברירת מחדל</text>
<text x="475" y="177" fill="#1e1b4b" font-size="14" text-anchor="end" direction="rtl">‏DPA, שליטה בשמירת נתונים</text>
<rect x="200" y="210" width="250" height="60" rx="10" fill="#eef2ff" stroke="#6366f1" stroke-width="2"/>
<text x="325" y="236" text-anchor="middle" fill="#1e1b4b" direction="rtl">‏endpoint של מודל בענן שלכם</text>
<text x="325" y="257" text-anchor="middle" fill="#64748b" font-size="13">Azure Foundry, Amazon Bedrock</text>
<text x="475" y="236" fill="#1e1b4b" font-size="14" text-anchor="end" direction="rtl">ה-tenant והאזור שלכם</text>
<text x="475" y="257" fill="#1e1b4b" font-size="14" text-anchor="end" direction="rtl">יצרן המודל לא רואה אותו</text>
<rect x="200" y="290" width="250" height="60" rx="10" fill="#ffffff" stroke="#16a34a" stroke-width="2"/>
<text x="325" y="316" text-anchor="middle" fill="#1e1b4b" direction="rtl">השרתים שלכם</text>
<text x="325" y="337" text-anchor="middle" fill="#64748b" font-size="13" direction="rtl">מודל open-weights, ברשת שלכם</text>
<text x="475" y="316" fill="#1e1b4b" font-size="14" text-anchor="end" direction="rtl">שום דבר לא יוצא מהרשת</text>
<text x="475" y="337" fill="#1e1b4b" font-size="14" text-anchor="end" direction="rtl">אתם מתפעלים ומעדכנים הכול</text>
<rect x="200" y="370" width="250" height="60" rx="10" fill="#ffffff" stroke="#f97316" stroke-width="2"/>
<text x="325" y="396" text-anchor="middle" fill="#1e1b4b" direction="rtl">‏GPU בשוק השכרה (GPUFlow)</text>
<text x="325" y="417" text-anchor="middle" fill="#64748b" font-size="13" direction="rtl">המחשב של הספק עצמו</text>
<text x="475" y="396" fill="#1e1b4b" font-size="14" text-anchor="end" direction="rtl">טקסט גלוי על המכונה הזו</text>
<text x="475" y="417" fill="#1e1b4b" font-size="14" text-anchor="end" direction="rtl">התנאים אוסרים לתעד אותו</text>
<text x="360" y="458" text-anchor="middle" fill="#64748b" font-size="13" direction="rtl">כתום: רק לנתונים ציבוריים. ירוק: לכל מה שמחלקת ה-IT שלכם רשאית להחזיק.</text>
</svg>
<figcaption>אותו פרומפט, חמישה יעדים. רק האפשרות של אירוח עצמי משאירה אותו בתוך הרשת שלכם; התוכנית העסקית וה-endpoint בענן שומרים עליו תחת חוזה שהחברה שלכם חתמה עליו.</figcaption>
</figure>

## להריץ מודלי open-weights בעצמכם

האפשרות החזקה ביותר לנתונים חסויים היא גם זו שדורשת הכי הרבה עבודה: להוריד מודל open-weights ‏(Llama, ‏Qwen, ‏Mistral, ‏Gemma ואחרים) ולהריץ אותו על מכונות בתוך הרשת שלכם. הפרומפטים לא יוצאים אף פעם. אתם בוחרים מה נרשם בלוג ולכמה זמן, וזה מקל לעמוד בדרישות שמירת רשומות ובכללי השמירה של GDPR, ואף סעיף שמירה או צו בית משפט של מישהו אחר לא נוגע בנתונים.

אבל העלויות אמיתיות. עכשיו אתם מתפעלים שירות הסקה: ‏GPUs, מנוע כמו Ollama או vLLM, אימות, לוגים, עדכונים ומישהו בכוננות. ומודל של 8B או 14B שנכנס לכרטיס של תחנת עבודה אחת חלש יותר ממודל חזית בהסקה ארוכה. בדרך כלל הוא מספיק טוב לסיווג, לחילוץ שדות, לסיכום מסמכים פנימיים ולניסוח טקסט שגרתי. בדקו אותו על המשימות שלכם לפני שאתם מחליטים. [מבחן הביצועים Ollama מול vLLM מול TGI](/he/ollama-vs-vllm-vs-tgi-rtx-4090-benchmark/) שלנו עוסק בבחירת מנוע, ו[המדריך ל-fine-tuning פרטי ל-LLM](/he/private-llm-fine-tuning-guide/) עוסק בהתאמת מודל למסמכים שלכם.

יש דרך אמצע שהרבה חברות בוחרות: להריץ את המודל הפתוח על instances של GPU בתוך חשבון הענן שכבר יש לכם. ספק הענן הוא אז מעבד תחת DPA שכבר ניהלתם עליו משא ומתן לכל השאר, ואף ספק מודלים לא מעורב בכלל.

## איפה GPUs שכורים ו-GPUFlow נכנסים לתמונה

שווקי GPU הם הקצה הזול של השוק, והם שייכים להשוואה הזו רק עם תווית ברורה.

‏GPUFlow היא אחד מהם. אתם שוכרים GPU למספר שעות ומקבלים מפתח API תואם OpenAI למודל הפתוח שהספק מריץ עליו, בדרך כלל דרך Ollama. המודל רץ על המחשב של הספק עצמו. המשמעות היא שהפרומפטים שלכם והתשובות עוברים דרך המכונה הזו כטקסט גלוי בזמן שההשכרה רצה. תנאי השימוש של GPUFlow אוסרים על ספקים לתעד, לקרוא, לשמור או לשתף בקשות או תשובות של שוכרים, ו-GPUFlow עצמה לא שומרת את הטקסט. אבל לספק יש הרשאות root על המכונה, והאיסור על תיעוד נאכף בחוזה; שום דבר טכני לא מונע אותו.

לכן GPUFlow היא **לא** התשובה לנתונים מפוקחים או חסויים. אל תשלחו אליה רשומות לקוחות, מידע רפואי, קוד מקור שחשוב לכם, או כל דבר שחוזה עם לקוח מגביל. התיעוד שלנו אומר את זה בצורה בוטה יותר: אל תשלחו סיסמאות, מספרי כרטיסים או סודות אחרים שלא הייתם משתפים עם אדם זר.

איפה שהיא כן מתאימה: לנסות מודל פתוח על חומרה אמיתית לפני שקונים כרטיס, להריץ פרומפטים על נתונים ציבוריים או סינתטיים, ולבנות ולבדוק אפליקציה מול API תואם OpenAI לפני שמפנים אותה לשרת שלכם. מכונות community cloud בשווקים אחרים מעלות את אותה שאלה לגבי כל מה שמעלים אליהן; [איך לאבטח דאטהסט על צומת GPU ציבורי](/he/how-to-secure-dataset-on-public-gpu-node/) עוסק בצד הזה.

## מדיניות שאנשים באמת יקיימו

איסור גורף בלי חלופה בעיקר מעביר את השימוש לטלפונים אישיים, שם אתם רואים עוד פחות. מה שעובד טוב יותר קצר מספיק כדי לזכור אותו:

| סוג נתונים | דוגמאות | כלים מותרים |
| --- | --- | --- |
| ציבורי | מסמכים שפורסמו, טקסטים שיווקיים | כל כלי מאושר, כולל אפליקציות צרכניות |
| פנימי | נהלים, ויקי פנימי, קוד לא רגיש | תוכניות עסקיות עם DPA ואימון כבוי |
| חסוי | נתוני לקוחות, סודות מסחריים, תנאי עסקאות | ‏endpoint בענן בתוך ה-tenant שלכם, או אירוח עצמי |
| מפוקח | מידע רפואי, נתוני כרטיסי אשראי, מידע אישי בהיקף גדול | אירוח עצמי, או ספק עם ההסכם הספציפי (BAA, ‏DPA) |

ואז עשו את החלקים הלא זוהרים:

1. קנו תוכנית עסקית אחת או endpoint בענן אחד והפכו אותו לברירת המחדל, עם single sign-on כדי שחשבונות ייסגרו כשאנשים עוזבים.
2. הגדירו את משך שמירת הנתונים לתקופה הקצרה ביותר שעומדת בחובות שמירת הרשומות שלכם, ווודאו במסוף הניהול שהאימון כבוי.
3. חסמו אתרי צ'אט AI צרכניים במכשירים מנוהלים רק אחרי שהכלי המאושר עובד.
4. נהלו רשימה של שימושי AI. כל דבר שנוגע בגיוס, באשראי או בהחלטות דומות צריך בדיקה נפרדת לפני דצמבר 2027.
5. תגידו לאנשים מה לעשות במקום, לא רק מה לא לעשות. המזכר של סמסונג הגיע אחרי שהנתונים כבר יצאו.

לצד העלויות השוטפות של אירוח עצמי מול שירותים לפי טוקן, ראו [GPU לפי שעה או API לפי טוקן?](/he/hourly-gpu-vs-per-token-api/).

## מקורות

- ההגבלה והסקר בסמסונג: ‏[CNBC, ‏2 במאי 2023](https://www.cnbc.com/2023/05/02/samsung-bans-use-of-ai-like-chatgpt-for-staff-after-misuse-of-chatbot.html); פרטי המקרים: ‏[The Register, ‏2 במאי 2023](https://www.theregister.com/2023/05/02/samsung_generative_ai_ban/)
- Apple וחברות אחרות: ‏[TechCrunch, ‏19 במאי 2023](https://techcrunch.com/2023/05/19/apple-reportedly-limits-internal-use-of-ai-powered-tools-like-chatgpt-and-github-copilot/)
- ‏LLM Suite של JPMorgan: ‏[בלוג הטכנולוגיה של JPMorganChase, ‏3 ביוני 2025](https://www.jpmorganchase.com/about/technology/blog/llmsuite-ab-award)
- התנאים העסקיים של OpenAI: ‏[Enterprise privacy](https://openai.com/enterprise-privacy/); הגדרות אימון לצרכנים: ‏[How your data is used to improve model performance](https://help.openai.com/en/articles/5722486-how-your-data-is-used-to-improve-model-performance)
- צו השימור בתביעת הניו יורק טיימס: ‏[OpenAI, התגובה לדרישות הנתונים של NYT](https://openai.com/index/response-to-nyt-data-demands/)
- Anthropic: ‏[נתונים מסחריים ואימון](https://privacy.claude.com/en/articles/7996868-is-my-data-used-for-model-training), [נתוני צרכנים ואימון](https://privacy.claude.com/en/articles/10023580-is-my-data-used-for-model-training)
- Microsoft: ‏[הגנה על נתונים ארגוניים ב-Microsoft 365 Copilot וב-Copilot Chat](https://learn.microsoft.com/en-us/copilot/microsoft-365/enterprise-data-protection), [נתונים, פרטיות ואבטחה במודלי Foundry ש-Azure מוכרת](https://learn.microsoft.com/en-us/azure/ai-foundry/responsible-ai/openai/data-privacy)
- Google: ‏[מרכז הפרטיות של AI גנרטיבי ב-Google Workspace](https://knowledge.workspace.google.com/admin/generative-ai/generative-ai-in-google-workspace-privacy-hub)
- AWS: ‏[הגנה על נתונים ב-Amazon Bedrock](https://docs.aws.amazon.com/bedrock/latest/userguide/data-protection.html)
- סעיף 28 של GDPR: ‏[gdpr-info.eu](https://gdpr-info.eu/art-28-gdpr/)
- פסק הדין על ה-Data Privacy Framework: ‏[Jones Day, ספטמבר 2025](https://www.jonesday.com/en/insights/2025/09/eu-general-court-upholds-euus-data-privacy-framework); הערעור: ‏[Digital Policy Alert](https://digitalpolicyalert.org/event/35459-latombe-filed-appeal-against-general-court-dismissal-of-challenge-to-european-unionunited-states-data-protection-framework-adequacy-decision-in-latombe-v-commission)
- הקנס של ה-Garante: ‏[The Hacker News, דצמבר 2024](https://thehackernews.com/2024/12/italy-fines-openai-15-million-for.html)
- ‏HIPAA וספקי ענן: ‏[HHS, הנחיות בנושא HIPAA ומחשוב ענן](https://www.hhs.gov/hipaa/for-professionals/special-topics/health-information-technology/cloud-computing/index.html)
- FINRA: ‏[Regulatory Notice 24-09](https://www.finra.org/rules-guidance/notices/24-09)
- ‏EU AI Act: ‏[הנציבות האירופית, AI Act](https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai); ה-Omnibus: ‏[White & Case, ה-EU AI Omnibus נכנס לתוקף](https://www.whitecase.com/insight-alert/eu-ai-omnibus-enters-force-amending-ai-act)
- GPUFlow: ‏[מדריך התחלה מהירה ל-API](https://docs.gpuflow.app/he/renters/api-quickstart/), [למה שוכרים יכולים ולא יכולים להגיע](https://docs.gpuflow.app/he/providers/security/), [תנאי שימוש](https://gpuflow.app/he/terms), [מדיניות פרטיות](https://gpuflow.app/he/privacy)

כולם נבדקו בספטמבר 2026.
