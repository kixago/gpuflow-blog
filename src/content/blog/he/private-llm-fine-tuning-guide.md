---
title: "איך לעשות fine-tuning פרטי ל-LLM על GPU שכור: מדריך מעשי"
description: "מתי fine-tuning עדיף על RAG או על פרומפטים, כמה VRAM צריך ל-QLoRA לפי גודל המודל, TRL, ‏Unsloth ו-Axolotl, שמירה על פרטיות הנתונים ב-GPU שכור, עלויות והגשה."
excerpt: "‏fine-tuning עם QLoRA למודל פתוח של 8B נכנס ל-GPU שכור אחד של 24 GB ועולה כ-$0.35 עד $0.83 להרצה. לפני שמשלמים, כדאי לוודא ש-fine-tuning הוא הכלי הנכון, ולתכנן איך הנתונים שלכם נשארים שלכם על מכונה של מישהו אחר."
pubDate: 2025-02-23
updatedDate: 2026-09-30
locale: "he"
category: "tutorials"
featured: false
draft: false
author: "GPUFlow Team"
heroImage: "../_images/private-llm-fine-tuning-guide-hero.png"
heroImageAlt: "איור של דאטהסט פרטי שמשמש ל-fine-tuning של מודל שפה על שרת GPU שכור"
faq:
  - question: "כמה VRAM צריך כדי לעשות fine-tuning למודל של 7B או 8B?"
    answer: "עם QLoRA, טבלת הדרישות של Unsloth מציינת כ-5 GB למודל של 7B ו-6 GB למודל של 8B; ‏LoRA רגיל ב-16 ביט צריך כ-19 GB ו-22 GB. הרצות אמיתיות צריכות מרווח לרצפים ארוכים יותר ול-batches גדולים יותר, כך שכרטיס של 24 GB כמו RTX 3090 או 4090 הוא הבחירה הנוחה."
  - question: "לעשות fine-tuning או להשתמש ב-RAG?"
    answer: "השתמשו ב-RAG כשהמודל צריך עובדות מהמסמכים שלכם, במיוחד עובדות שמשתנות. מחקר של Ovadia ועמיתיו מ-2024 מצא ש-RAG עקף בעקביות fine-tuning לא מפוקח בהוספת ידע. עשו fine-tuning כשאתם צריכים פורמט, טון או התנהגות במשימה צרה באופן עקבי, דברים שפרומפטים לא מספקים באופן אמין."
  - question: "כמה עולה fine-tuning ל-LLM על GPU שכור?"
    answer: "הרצת QLoRA על מודל של 8B עם 2,000 דוגמאות לוקחת קצת יותר משעה כולל הקמה, כלומר כ-$0.35 על RTX 4090 ב-Vast.ai ב-$0.31 לשעה, או $0.83 במחיר המחירון של RunPod, ‏$0.74 לשעה (ספטמבר 2026). הרצה של 20,000 דוגמאות לוקחת כארבע שעות, ‏$1.24 עד $2.97."
  - question: "האם המארח של ה-GPU יכול לראות את נתוני האימון שלי?"
    answer: "החומרה שלו, אז הניחו שהוא יכול. בידוד קונטיינרים מגן עליכם משוכרים אחרים, לא מבעל המכונה. לנתונים רגישים השתמשו במארחים בדאטה סנטרים שעברו בדיקה (Vast.ai Secure Cloud, ‏RunPod Secure Cloud), הסירו מידע אישי לפני ההעלאה, ומחקו את ה-instance כשאתם מסיימים."
  - question: "מה ההבדל בין LoRA ל-QLoRA?"
    answer: "‏LoRA מקפיא את מודל הבסיס ומאמן מטריצות adapter קטנות. ‏QLoRA עושה אותו דבר, אבל טוען את מודל הבסיס הקפוא בדיוק של 4 ביט NF4, מה שחסך מספיק זיכרון כדי לעשות fine-tuning למודל של 65B על GPU יחיד של 48 GB במאמר המקורי."
  - question: "אפשר לעשות fine-tuning או להעלות מודל משלי ל-GPUFlow?"
    answer: "לא. ‏GPUFlow מיועדת להסקה בלבד: אתם שוכרים API צ'אט תואם OpenAI למודלים שספקים התקינו על המכונות שלהם, בדרך כלל עם Ollama. אין shell ואין גישה לקבצים, כך שאי אפשר לאמן שם או להעלות מודל משלכם."
---

אפשר לעשות fine-tuning למודל open-weights של 8B על הנתונים שלכם עם QLoRA, על GPU שכור אחד של 24 GB, והרצה טיפוסית עולה פחות מדולר. השאלות הקשות באות קודם: האם fine-tuning הוא בכלל הפתרון הנכון (לעובדות, אחזור בדרך כלל מנצח), ואיך הנתונים שלכם נשארים פרטיים על מכונה שמישהו אחר מחזיק.

המדריך הזה מכסה את שתיהן, ואחר כך את ה-VRAM שצריך לפי גודל המודל, את הכלים הנוכחיים, סקריפט אימון שעובד, חישוב עלות ואיך להגיש את התוצאה. הכול נבדק בספטמבר 2026; המקורות בסוף.

## ‏fine-tuning, ‏RAG או פרומפטים טובים יותר

‏fine-tuning משנה את ההתנהגות של מודל. זו דרך גרועה ללמד אותו עובדות. ‏Ovadia ועמיתיו השוו בין השתיים להזרקת ידע ומצאו ש-RAG "עוקף בעקביות" fine-tuning לא מפוקח, "גם בידע קיים שנתקלו בו באימון וגם בידע חדש לגמרי". הסיכום שלהם: ל-LLMs קשה ללמוד עובדות חדשות דרך fine-tuning.

אז לפני ששוכרים משהו, עברו על העץ הזה:

<figure>
<svg viewBox="0 0 720 420" role="img" aria-labelledby="d1-title" xmlns="http://www.w3.org/2000/svg" font-family="system-ui, sans-serif" font-size="15">
<title id="d1-title">עץ החלטות לבחירה בין אחזור, פרומפטים טובים יותר, fine-tuning או מודל גדול יותר</title>
<defs><marker id="d1-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#64748b"/></marker></defs>
<rect width="720" height="420" fill="#ffffff"/>
<rect x="60" y="15" width="280" height="40" rx="8" fill="#1e1b4b"/>
<text x="200" y="40" text-anchor="middle" fill="#ffffff" direction="rtl">התשובות לא מספיק טובות</text>
<line x1="200" y1="55" x2="200" y2="83" stroke="#64748b" stroke-width="2" marker-end="url(#d1-arrow)"/>
<rect x="20" y="85" width="360" height="50" rx="8" fill="#ffffff" stroke="#f97316" stroke-width="2"/>
<text x="200" y="115" text-anchor="middle" fill="#1e1b4b" direction="rtl">חסרות עובדות, או שהנתונים משתנים?</text>
<rect x="440" y="80" width="260" height="60" rx="10" fill="#f0fdf4" stroke="#16a34a" stroke-width="2"/>
<text x="570" y="105" text-anchor="middle" fill="#1e1b4b" font-weight="600" direction="rtl">השתמשו ב-RAG</text>
<text x="570" y="126" text-anchor="middle" fill="#64748b" font-size="13" direction="rtl">חיפוש במסמכים שלכם בכל בקשה</text>
<line x1="380" y1="110" x2="438" y2="110" stroke="#64748b" stroke-width="2" marker-end="url(#d1-arrow)"/>
<text x="409" y="102" text-anchor="middle" fill="#16a34a" font-size="13" direction="rtl">כן</text>
<line x1="200" y1="135" x2="200" y2="173" stroke="#64748b" stroke-width="2" marker-end="url(#d1-arrow)"/>
<text x="215" y="160" fill="#64748b" font-size="13" text-anchor="end" direction="rtl">לא</text>
<rect x="20" y="175" width="360" height="50" rx="8" fill="#ffffff" stroke="#f97316" stroke-width="2"/>
<text x="200" y="205" text-anchor="middle" fill="#1e1b4b" direction="rtl">הוראות ודוגמאות פותרות את זה?</text>
<rect x="440" y="170" width="260" height="60" rx="10" fill="#f0fdf4" stroke="#16a34a" stroke-width="2"/>
<text x="570" y="195" text-anchor="middle" fill="#1e1b4b" font-weight="600" direction="rtl">שפרו את הפרומפט</text>
<text x="570" y="216" text-anchor="middle" fill="#64748b" font-size="13" direction="rtl">פרומפט מערכת, דוגמאות few-shot</text>
<line x1="380" y1="200" x2="438" y2="200" stroke="#64748b" stroke-width="2" marker-end="url(#d1-arrow)"/>
<text x="409" y="192" text-anchor="middle" fill="#16a34a" font-size="13" direction="rtl">כן</text>
<line x1="200" y1="225" x2="200" y2="263" stroke="#64748b" stroke-width="2" marker-end="url(#d1-arrow)"/>
<text x="215" y="250" fill="#64748b" font-size="13" text-anchor="end" direction="rtl">לא</text>
<rect x="20" y="265" width="360" height="50" rx="8" fill="#ffffff" stroke="#f97316" stroke-width="2"/>
<text x="200" y="295" text-anchor="middle" fill="#1e1b4b" direction="rtl">צריך פורמט, טון או מיומנות קבועים?</text>
<rect x="440" y="260" width="260" height="60" rx="10" fill="#eef2ff" stroke="#6366f1" stroke-width="2"/>
<text x="570" y="285" text-anchor="middle" fill="#1e1b4b" font-weight="600" direction="rtl">‏fine-tuning עם QLoRA</text>
<text x="570" y="306" text-anchor="middle" fill="#64748b" font-size="13" direction="rtl">מאות דוגמאות טובות</text>
<line x1="380" y1="290" x2="438" y2="290" stroke="#64748b" stroke-width="2" marker-end="url(#d1-arrow)"/>
<text x="409" y="282" text-anchor="middle" fill="#16a34a" font-size="13" direction="rtl">כן</text>
<line x1="200" y1="315" x2="200" y2="353" stroke="#64748b" stroke-width="2" marker-end="url(#d1-arrow)"/>
<text x="215" y="340" fill="#64748b" font-size="13" text-anchor="end" direction="rtl">לא</text>
<rect x="60" y="355" width="280" height="50" rx="10" fill="#f8fafc" stroke="#64748b" stroke-width="2"/>
<text x="200" y="385" text-anchor="middle" fill="#1e1b4b" direction="rtl">נסו מודל בסיס גדול יותר</text>
<text x="570" y="370" text-anchor="middle" fill="#64748b" font-size="13" direction="rtl">‏RAG ו-fine-tuning משתלבים היטב:</text>
<text x="570" y="390" text-anchor="middle" fill="#64748b" font-size="13" direction="rtl">מאמנים את ההתנהגות, שולפים את העובדות</text>
</svg>
<figcaption>רוב הבעיות מסוג "המודל לא מכיר את החומר שלנו" הן בעיות אחזור. ‏fine-tuning מצדיק את העלות כשצריך אותה התנהגות בכל פעם: סכמת JSON, סגנון כתיבה של הבית, שיטת סיווג.</figcaption>
</figure>

סיבות טובות ל-fine-tuning:

- **פורמט פלט קשיח.** חילוץ שדות לסכמה שלכם בכל קריאה, בלי עמוד של הוראות בכל פרומפט.
- **סגנון וטון.** תשובות תמיכה שנשמעות כמו הצוות שלכם, או דוחות במבנה קבוע.
- **משימה צרה שמודל קטן מבצע.** מודל של 8B שעבר אימון יכול להחליף מודל כללי גדול בעבודה אחת, וזה חשוב כשמגישים אותו על חומרה זולה.
- **פרומפטים קצרים יותר.** התנהגות שנלמדה במשקלים לא צריכה לחזור בכל בקשה.

## ‏LoRA ו-QLoRA

‏fine-tuning מלא מעדכן כל משקל, כך שה-GPU צריך להחזיק gradients ו-optimizer state לכולם, בנוסף למודל עצמו. ‏LoRA מקפיא את מודל הבסיס ומאמן מטריצות קטנות בדרגה נמוכה לצד השכבות שלו; המאמר המקורי דיווח על פי 10,000 פחות פרמטרים לאימון ופי 3 פחות זיכרון GPU, בהשוואה ל-fine-tuning מלא של GPT-3 175B עם Adam.

‏QLoRA הולך רחוק יותר: מודל הבסיס הקפוא נטען בדיוק של 4 ביט NF4, ורק ה-adapters מאומנים ב-16 ביט. ‏Dettmers ועמיתיו השתמשו בו כדי לעשות fine-tuning למודל של 65B על GPU יחיד של 48 GB, "תוך שמירה על הביצועים של fine-tuning מלא ב-16 ביט". המאמר הוסיף שלושה רכיבים שהכלים משתמשים בהם עד היום: סוג הנתונים NF4, קוונטיזציה כפולה של קבועי הקוונטיזציה, ו-paged optimizers שסופגים קפיצות בזיכרון.

התוצאה של שניהם היא adapter, תיקייה של כמה טנזורים, שמפעילים מעל מודל הבסיס שלא השתנה. אפשר להשאיר אותו נפרד או למזג אותו לתוך המשקלים.

## כמה VRAM צריך

‏Unsloth מפרסמת טבלה של ה-VRAM המינימלי ל-fine-tuning לפי גודל המודל. אלה המספרים שלה, עם אופטימיזציות הזיכרון שלה; אימון רגיל של Hugging Face צריך יותר, ורצפים ארוכים יותר או batches גדולים יותר מעלים כל שורה.

| גודל מודל | ‏QLoRA ‏(4 ביט) | ‏LoRA ‏(16 ביט) | כרטיס שכור שמריץ QLoRA בנוחות |
| --- | --- | --- | --- |
| 3B | 3.5 GB | 8 GB | כל כרטיס של 12 GB ומעלה |
| 8B | 6 GB | 22 GB | ‏RTX 3090 / 4090 ‏(24 GB) |
| 14B | 8.5 GB | 33 GB | ‏RTX 3090 / 4090 ‏(24 GB) |
| 32B | 26 GB | 76 GB | כרטיס של 48 GB ‏(RTX A6000, A40, L40S) |
| 70B | 41 GB | 164 GB | כרטיס של 80 GB ‏(A100, H100) |

<figure>
<svg viewBox="0 0 720 320" role="img" aria-labelledby="d2-title" xmlns="http://www.w3.org/2000/svg" font-family="system-ui, sans-serif" font-size="15">
<title id="d2-title">גרף עמודות של ה-VRAM המינימלי ל-fine-tuning של מודלים בגודל 8B, ‏14B, ‏32B ו-70B עם QLoRA ועם LoRA ב-16 ביט, מול כרטיסים של 24, 48 ו-80 GB</title>
<rect width="720" height="320" fill="#ffffff"/>
<rect x="200" y="12" width="14" height="14" fill="#6366f1"/>
<text x="220" y="24" fill="#1e1b4b" font-size="13">QLoRA 4-bit</text>
<rect x="320" y="12" width="14" height="14" fill="#eef2ff" stroke="#6366f1" stroke-width="1.5"/>
<text x="340" y="24" fill="#1e1b4b" font-size="13">LoRA 16-bit</text>
<line x1="262.1" y1="58" x2="262.1" y2="265" stroke="#f97316" stroke-width="1.5" stroke-dasharray="5 4"/>
<text x="262.1" y="52" text-anchor="middle" fill="#f97316" font-size="12">24 GB</text>
<line x1="324.2" y1="58" x2="324.2" y2="265" stroke="#f97316" stroke-width="1.5" stroke-dasharray="5 4"/>
<text x="324.2" y="52" text-anchor="middle" fill="#f97316" font-size="12">48 GB</text>
<line x1="407.1" y1="58" x2="407.1" y2="265" stroke="#f97316" stroke-width="1.5" stroke-dasharray="5 4"/>
<text x="407.1" y="52" text-anchor="middle" fill="#f97316" font-size="12">80 GB</text>
<text x="190" y="88" text-anchor="end" fill="#1e1b4b">8B</text>
<rect x="200" y="66" width="15.5" height="16" fill="#6366f1"/>
<text x="221" y="79" fill="#1e1b4b" font-size="12">6</text>
<rect x="200" y="84" width="56.9" height="16" fill="#eef2ff" stroke="#6366f1" stroke-width="1.5"/>
<text x="268" y="97" fill="#1e1b4b" font-size="12">22</text>
<text x="190" y="138" text-anchor="end" fill="#1e1b4b">14B</text>
<rect x="200" y="116" width="22" height="16" fill="#6366f1"/>
<text x="228" y="129" fill="#1e1b4b" font-size="12">8.5</text>
<rect x="200" y="134" width="85.4" height="16" fill="#eef2ff" stroke="#6366f1" stroke-width="1.5"/>
<text x="291" y="147" fill="#1e1b4b" font-size="12">33</text>
<text x="190" y="188" text-anchor="end" fill="#1e1b4b">32B</text>
<rect x="200" y="166" width="67.3" height="16" fill="#6366f1"/>
<text x="273" y="179" fill="#1e1b4b" font-size="12">26</text>
<rect x="200" y="184" width="196.7" height="16" fill="#eef2ff" stroke="#6366f1" stroke-width="1.5"/>
<text x="425" y="197" fill="#1e1b4b" font-size="12">76</text>
<text x="190" y="238" text-anchor="end" fill="#1e1b4b">70B</text>
<rect x="200" y="216" width="106.1" height="16" fill="#6366f1"/>
<text x="302" y="229" text-anchor="end" fill="#ffffff" font-size="12">41</text>
<rect x="200" y="234" width="424.5" height="16" fill="#eef2ff" stroke="#6366f1" stroke-width="1.5"/>
<text x="631" y="247" fill="#1e1b4b" font-size="12">164</text>
<line x1="200" y1="265" x2="640" y2="265" stroke="#64748b" stroke-width="1"/>
<text x="200" y="283" text-anchor="middle" fill="#64748b" font-size="12">0</text>
<text x="303.5" y="283" text-anchor="middle" fill="#64748b" font-size="12">40</text>
<text x="407.1" y="283" text-anchor="middle" fill="#64748b" font-size="12">80</text>
<text x="510.6" y="283" text-anchor="middle" fill="#64748b" font-size="12">120</text>
<text x="614.1" y="283" text-anchor="middle" fill="#64748b" font-size="12">160</text>
<text x="420" y="306" text-anchor="middle" fill="#64748b" font-size="13" direction="rtl">‏VRAM מינימלי ב-GB (טבלת הדרישות של Unsloth)</text>
</svg>
<figcaption>‏QLoRA הוא מה שהופך כרטיסים ביתיים שכורים לשימושיים כאן: עד 14B נכנס לכרטיס של 24 GB עם מקום פנוי, ‏32B צריך כרטיס של 48 GB, ו-70B כרטיס של 80 GB. בלי טעינה ב-4 ביט, אפילו 8B בקושי נכנס ל-24 GB.</figcaption>
</figure>

ברירת המחדל שלי היא מודל של 8B או 14B על RTX 4090. זה הכרטיס השכור הזול ביותר שמשאיר מקום לרצפים של 2,048 טוקנים ול-batch סביר, ומודלים בטווח הזה קלים להגשה אחר כך. לבחירת מודל בסיס לפי ה-VRAM שעליו תגישו אותו, ראו [אילו מודלי AI נכנסים ל-VRAM של ה-GPU שלכם](/he/which-ai-models-fit-your-gpu-vram/).

## בחירת כלי: ‏TRL, ‏Unsloth או Axolotl

שלושתם קוד פתוח, ושלושתם עושים LoRA ו-QLoRA.

| כלי | איך משתמשים בו | חוזקה | שימו לב |
| --- | --- | --- | --- |
| Hugging Face TRL + PEFT | ‏Python ‏(`SFTTrainer`) | מימוש הייחוס; ‏DPO, ‏GRPO ועוד באותו API | צורך יותר זיכרון מ-Unsloth באותה הרצה |
| Unsloth | ‏Python, או ממשק ה-web של Unsloth Studio | טוען למהירות כפולה ול-70% פחות VRAM; ייצוא ישיר ל-GGUF | ממשק Studio ברישיון AGPL-3.0 (הליבה ב-Apache 2.0) |
| Axolotl | קובץ YAML אחד, `axolotl train config.yml` | ריבוי GPUs ‏(FSDP, DeepSpeed), הרבה מתכונים מוכנים | דורש Python 3.11 ומעלה ו-PyTorch 2.11 ומעלה |

נכון לספטמבר 2026, ‏TRL בגרסה 1.14 ו-PEFT בגרסה 0.21. ‏Unsloth צריך Python 3.11 עד 3.13 ו-GPU של NVIDIA עם CUDA capability ‏7.0 ומעלה (V100, ‏T4, סדרת RTX 20 ומעלה). ‏Axolotl ממליץ על Python 3.12 ו-PyTorch 2.12.1.

השתמשו ב-TRL אם אתם רוצים להבין כל שורה, ב-Unsloth אם חסר לכם VRAM או שאתם רוצים ייצוא ל-GGUF בקריאה אחת, וב-Axolotl אם תחזרו על הרצות עם הגדרות שונות או תעברו לכמה GPUs. הסקריפט בהמשך משתמש ב-TRL, כי זו הדרך הקצרה ביותר שמראה כל חלק נע.

## הכנת הנתונים

‏`SFTTrainer` של TRL קורא שיחות באותו מבנה של בקשה ל-API צ'אט. אובייקט JSON אחד בכל שורה ב-`train.jsonl`:

```json
{"messages": [{"role": "system", "content": "Extract the invoice fields as JSON."}, {"role": "user", "content": "Invoice 4471 from Norden AB, due 12 March, total 1,250 EUR"}, {"role": "assistant", "content": "{\"invoice_id\": \"4471\", \"supplier\": \"Norden AB\", \"due\": \"2026-03-12\", \"total\": 1250, \"currency\": \"EUR\"}"}]}
```

כללים מעשיים:

- **איכות לפני כמות.** כמה מאות עד כמה אלפי דוגמאות עקביות ונכונות עדיפות על עשרות אלפים רועשות. כל טעות בנתונים היא התנהגות שאתם משלמים כדי ללמד.
- **התאמה לפרודקשן.** השתמשו בפרומפט המערכת ובפורמט הקלט שהאפליקציה שלכם באמת תשלח.
- **הפרישו 5 עד 10%.** שמרו דוגמאות שהמודל לא מתאמן עליהן אף פעם, כדי להשוות את מודל הבסיס ואת המודל המאומן זה לצד זה.
- **הסירו את מה שלא צריך.** שמות, כתובות מייל, מספרי חשבון ומזהים כמעט אף פעם לא עוזרים למודל ללמוד פורמט. החליפו אותם בערכים מדומים ומציאותיים לפני שהנתונים יוצאים מהמחשב שלכם.

הכלל האחרון נוגע ליותר מהמכונה השכורה. ‏Carlini ועמיתיו חילצו מ-GPT-2 מאות רצפי אימון מילה במילה, כולל שמות, מספרי טלפון וכתובות מייל, שחלקם הופיעו במסמך אימון אחד בלבד. מודל שעבר fine-tuning יכול לחזור על מה שאומן עליו בפני כל מי שישתמש בו אחר כך.

## שמירה על פרטיות הנתונים במכונה שכורה

בשוק GPU, המחשב שייך למישהו אחר. ‏Vast.ai אומרת את זה בפשטות: "לקוחות מבודדים בקונטיינרים של Docker ללא הרשאות מיוחדות, ויש להם גישה רק לנתונים שלהם", וגם "רמת האבטחה של ספקים משתנה מאוד". הבידוד הזה מגן עליכם משוכרים אחרים. הוא לא מגן עליכם מהאדם שיש לו גישה פיזית והרשאות root על המארח.

לנתונים פרטיים:

1. **בחרו מארח בדאטה סנטר שעבר בדיקה.** ספקי ה-Secure Cloud של Vast.ai הם "דאטה סנטרים שעברו בדיקה, עם הסמכת ISO 27001 ותקני דאטה סנטר Tier 3/4", ו-Vast ממליצה עליהם לעבודה רגישה. ה-Secure Cloud של RunPod רץ בדאטה סנטרים ברמת T3/T4; ה-Community Cloud שלה מחבר אתכם לספקים פרטיים. השכבות של הדאטה סנטרים עולות יותר לשעה, וכאן זה שווה את זה.
2. **העלו רק את הדאטהסט הנקי,** דרך SSH ‏(`rsync -avP` או `scp`). אל תעבירו אותו בדרך דרך bucket ציבורי או קישור משותף.
3. **השאירו את הלוגים מקומיים.** ב-TRL 1.14 ברירת המחדל של `report_to` היא `"none"`, כך ששום דבר לא נשלח לכלי מעקב ניסויים אלא אם תפעילו אותו. אל תקראו ל-`push_to_hub` עם adapter שאומן על נתונים פרטיים.
4. **הוציאו את התוצאות, ואז מחקו את ה-instance.** הורידו את ה-adapter ואת תוצאות ההערכה, התנתקו מ-Hugging Face ‏(`hf auth logout`) אם השתמשתם בטוקן, ומחקו את ה-instance ואת כל ה-volumes. ב-Vast.ai אחסון מחויב ונשמר עד שה-instance נמחק, לא רק נעצר.

מחיקת קבצים בתוך קונטיינר לא מבטיחה שהדיסק של המארח נמחק, כך שההגנה האמיתית היא שלבים 1 ו-2: לבחור מי מחזיק את החומרה, ולשלוח לו כמה שפחות. פרטים נוספים ב[איך לאבטח דאטהסט על צומת GPU ציבורי](/he/how-to-secure-dataset-on-public-gpu-node/). אם המדיניות שלכם אוסרת כל חומרה של צד שלישי, אותו סקריפט רץ על כרטיס 24 GB משלכם.

## אימון: סקריפט QLoRA עם TRL

על מכונת Linux שכורה עם RTX 3090 או 4090:

```bash
python -m venv venv && source venv/bin/activate
pip install torch trl peft bitsandbytes datasets
```

ואז `train.py`, לפי דפוס ה-QLoRA בתיעוד ה-PEFT של TRL. ‏Qwen3-8B ברישיון Apache 2.0 ולא חסום, כך שלא צריך טוקן של Hugging Face:

```python
import torch
from datasets import load_dataset
from peft import LoraConfig
from transformers import BitsAndBytesConfig
from trl import SFTConfig, SFTTrainer

dataset = load_dataset("json", data_files="train.jsonl", split="train")

bnb_config = BitsAndBytesConfig(
    load_in_4bit=True,
    bnb_4bit_quant_type="nf4",
    bnb_4bit_compute_dtype=torch.bfloat16,
    bnb_4bit_use_double_quant=True,
)

peft_config = LoraConfig(
    r=16,
    lora_alpha=32,
    lora_dropout=0.05,
    target_modules="all-linear",
    task_type="CAUSAL_LM",
)

args = SFTConfig(
    output_dir="out",
    num_train_epochs=3,
    per_device_train_batch_size=4,
    gradient_accumulation_steps=4,
    learning_rate=2e-4,
    lr_scheduler_type="cosine",
    warmup_steps=20,
    max_length=2048,
    bf16=True,
    logging_steps=10,
    save_strategy="epoch",
    model_init_kwargs={"dtype": torch.bfloat16},
)

trainer = SFTTrainer(
    model="Qwen/Qwen3-8B",
    args=args,
    train_dataset=dataset,
    quantization_config=bnb_config,
    peft_config=peft_config,
)
trainer.train()
trainer.save_model("out/adapter")
```

הבחירות שמשנות:

- **`learning_rate=2e-4`.** התיעוד של TRL ממליץ ב-QLoRA על קצב גבוה פי 10 בערך מהקצב הרגיל ל-fine-tuning. אם ה-loss על נתוני ההערכה עולה בזמן שה-loss על נתוני האימון יורד, יש overfitting: הורידו את מספר ה-epochs.
- **`r=16`, ‏`target_modules="all-linear"`.** ‏adapters על כל שכבה לינארית, ההגדרה שבה משתמשים ה-benchmarks של Unsloth. דרגה 16 מספיקה לפורמט ולסגנון; העלו אותה למשימות קשות יותר.
- **`max_length=2048`.** דוגמאות ארוכות יותר נחתכות. בדקו את אורכי הטוקנים בנתונים שלכם; מגבלה ארוכה יותר צריכה יותר VRAM.
- **‏batch אפקטיבי של 16** (4 × 4 צעדי accumulation). אם נגמר לכם הזיכרון, הורידו את `per_device_train_batch_size` והעלו את ה-accumulation כדי לשמור על המכפלה.

לפני שאתם מכבים את המכונה, הריצו את הדוגמאות שהפרשתם דרך מודל הבסיס ודרך המודל המאומן והשוו ביניהם. זו הבדיקה היחידה שתגיד לכם אם הכסף עשה משהו.

## כמה זה עולה

זמן האימון הוא סך הטוקנים ÷ תפוקה. ‏GigaGPU, חברת אירוח, פרסמה מדידה של כ-3,500 טוקני אימון לשנייה ל-Llama 3.1 8B עם QLoRA על RTX 4090. בהנחה של קצב דומה ל-Qwen3-8B:

**הרצה קטנה:** ‏2,000 דוגמאות × 600 טוקנים × 3 epochs = ‏3.6 מיליון טוקנים. ‏3,600,000 ÷ 3,500 = ‏1,029 שניות, כ-17 דקות.

| שלב | זמן |
| --- | --- |
| הקמת הסביבה | 10 דק' |
| הורדת Qwen3-8B ‏(16.4 GB של משקלים) והעלאת הנתונים | 10 דק' |
| אימון | 17 דק' |
| השוואת מודל הבסיס והמודל המאומן על הנתונים שהופרשו | 15 דק' |
| מיזוג, ייצוא, הורדה, מחיקת ה-instance | 15 דק' |
| **סך הכול** | **67 דק' (1.12 שעות)** |

- ‏RTX 4090 ב-Vast.ai ב-$0.31 לשעה: ‏1.12 × $0.31 = **$0.35**
- ‏RTX 4090 ב-RunPod ב-$0.74 לשעה (מחיר המחירון בדף התמחור): ‏1.12 × $0.74 = **$0.83**

**הרצה גדולה יותר:** ‏20,000 דוגמאות × 1,000 טוקנים × 2 epochs = ‏40 מיליון טוקנים ÷ 3,500 = ‏11,429 שניות, כ-3.2 שעות. עם 50 דקות של אותה תקורה, ‏4.0 שעות: **$1.24** ב-Vast.ai או **$2.97** ב-RunPod.

למודל של 32B, כרטיסים של 48 GB מוצגים ב-RunPod ב-$0.49 לשעה (A40), ‏$0.53 לשעה (RTX A6000) ו-$1.09 לשעה (L40S), נכון לספטמבר 2026. אין לי נתון תפוקה מפורסם ל-QLoRA של 32B על הכרטיסים האלה, אז הריצו 50 צעדים, קראו את זמן הצעד מהלוג, ועשו את אותו כפל לפני שאתם מתחייבים להרצה ארוכה.

המחירים הם הנתונים של ספטמבר 2026 מדף התמחור של RunPod וממעקב המחירים של getdeploying.com ל-Vast.ai. שכבות Secure/דאטה סנטר עולות יותר מההצעות הזולות ביותר בקהילה. התמונה הרחבה נמצאת ב[השוואת מחירי השכרת GPU](/he/gpu-rental-pricing-comparison-2026/).

## הגשת התוצאה

יש שתי אפשרויות: להשאיר את ה-adapter נפרד, או למזג אותו למודל.

**להשאיר נפרד עם vLLM.** ‏vLLM טוען adapters של LoRA לצד מודל הבסיס וחושף כל אחד מהם כשם מודל בשרת התואם OpenAI שלו:

```bash
vllm serve Qwen/Qwen3-8B --enable-lora --lora-modules invoices=./out/adapter
```

הלקוחות שולחים אז `"model": "invoices"`. כמה adapters יכולים לחלוק מודל בסיס אחד על GPU אחד.

**למזג ולהריץ ב-Ollama.** מזגו את ה-adapter למשקלים בדיוק מלא, המירו ל-GGUF עם llama.cpp, בצעו קוונטיזציה, וייבאו:

```python
import torch
from peft import AutoPeftModelForCausalLM
from transformers import AutoTokenizer

model = AutoPeftModelForCausalLM.from_pretrained("out/adapter", dtype=torch.bfloat16)
model.merge_and_unload().save_pretrained("merged")
AutoTokenizer.from_pretrained("Qwen/Qwen3-8B").save_pretrained("merged")
```

```bash
python llama.cpp/convert_hf_to_gguf.py merged --outfile invoices-bf16.gguf --outtype bf16
./llama.cpp/build/bin/llama-quantize invoices-bf16.gguf invoices-Q4_K_M.gguf Q4_K_M
echo "FROM ./invoices-Q4_K_M.gguf" > Modelfile
ollama create invoices -f Modelfile
```

‏Unsloth עושה את המיזוג ואת הייצוא ל-GGUF בקריאה אחת (`model.save_pretrained_gguf("dir", tokenizer, quantization_method="q4_k_m")`). התיעוד שלו מזהיר שהסיבה הנפוצה ביותר לתשובות גרועות אחרי ייצוא היא chat template שגוי: הגישו עם אותה תבנית שאימנתם איתה. השיקולים בין Ollama, ‏vLLM ו-TGI מפורטים ב[מבחן הביצועים שלנו להסקה על RTX 4090](/he/ollama-vs-vllm-vs-tgi-rtx-4090-benchmark/).

### איפה GPUFlow נכנסת לתמונה

‏GPUFlow לא יכולה לבצע את האימון: היא משכירה API תואם OpenAI על GPU של ספק, בלי shell, בלי SSH ובלי גישה לקבצים. היא גם לא יכולה להגיש את המודל שעבר fine-tuning. שוכרים לא יכולים להעלות מודלים; המודלים שמוצעים הם אלה שכל ספק התקין (בדרך כלל עם Ollama), כמו `qwen2.5:7b` או `llama3.1:8b`.

איפה שהיא כן יכולה לעזור הוא השלב שלפני כל זה: לבדוק, בכמה סנטים, אם מודל פתוח רגיל עם פרומפט טוב כבר עושה את העבודה, שזו התוצאה הזולה ביותר בעץ ההחלטות. השתמשו לשם כך בנתוני בדיקה, לא בנתונים הפרטיים שהמדריך הזה עוסק בהם: פרומפטים ותשובות עוברים דרך המכונה של הספק כטקסט גלוי בזמן שההשכרה רצה. איך זה עובד מוסבר ב[מדריך ההתחלה המהירה ל-API](https://docs.gpuflow.app/he/renters/api-quickstart/), ו[שימוש במפתח באפליקציות](/he/use-openai-compatible-api-key-in-apps/) מסביר איך לחבר אותו לכלים קיימים.

## מקורות

כולם נבדקו בספטמבר 2026.

- מאמרים: ‏[Hu et al., LoRA](https://arxiv.org/abs/2106.09685); ‏[Dettmers et al., QLoRA](https://arxiv.org/abs/2305.14314); ‏[Ovadia et al., Fine-Tuning or Retrieval?](https://arxiv.org/abs/2312.05934); ‏[Carlini et al., Extracting Training Data from Large Language Models](https://arxiv.org/abs/2012.07805)
- Hugging Face TRL: ‏[SFT Trainer](https://huggingface.co/docs/trl/sft_trainer), [אינטגרציה עם PEFT ו-QLoRA](https://huggingface.co/docs/trl/peft_integration)
- Unsloth: ‏[דרישות וטבלת VRAM](https://unsloth.ai/docs/get-started/fine-tuning-for-beginners/unsloth-requirements.md), [benchmarks](https://unsloth.ai/docs/basics/unsloth-benchmarks.md), [שמירה ל-GGUF](https://unsloth.ai/docs/basics/inference-and-deployment/saving-to-gguf.md), ‏[GitHub](https://github.com/unslothai/unsloth)
- [Axolotl ב-GitHub](https://github.com/axolotl-ai-cloud/axolotl)
- מודל: ‏[כרטיס המודל של Qwen3-8B](https://huggingface.co/Qwen/Qwen3-8B)
- תפוקת אימון: ‏[GigaGPU, ‏fine-tuning על RTX 4090](https://gigagpu.com/rtx-4090-fine-tuning-guide/)
- מארחים ואבטחה: ‏[שאלות נפוצות על אבטחה ב-Vast.ai](https://docs.vast.ai/documentation/reference/faq/security), [התמחור של Vast.ai](https://docs.vast.ai/guides/instances/pricing.md), [סקירת Pods של RunPod](https://docs.runpod.io/pods/overview)
- מחירים: ‏[התמחור של RunPod](https://www.runpod.io/pricing), ‏getdeploying.com עבור [Vast.ai](https://getdeploying.com/vast-ai) ו-[RTX 4090](https://getdeploying.com/reference/cloud-gpu/nvidia-rtx-4090)
- הגשה: ‏[adapters של LoRA ב-vLLM](https://docs.vllm.ai/en/latest/features/lora.html), ‏[quantize ב-llama.cpp](https://github.com/ggml-org/llama.cpp/blob/master/tools/quantize/README.md), [ייבוא ל-Ollama](https://docs.ollama.com/import)
- GPUFlow: ‏[מדריך התחלה מהירה ל-API](https://docs.gpuflow.app/he/renters/api-quickstart/)
