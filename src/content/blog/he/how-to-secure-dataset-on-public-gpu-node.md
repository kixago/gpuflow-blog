---
title: "איך לאבטח את הדאטהסט שלכם על צומת GPU שכור או ציבורי"
description: "המארח של GPU שכור יכול לקרוא כל מה שהעבודה שלכם מפענחת. מה פותרים הצפנה, Secure Cloud ו-confidential computing על H100, ואיך לנקות אחרי העבודה."
excerpt: "לשכור GPU פירושו שלמישהו אחר יש root על המכונה שמחזיקה את הנתונים שלכם. מודל האיומים, מה כל הגנה מכסה באמת, ושגרת ניקוי שעובדת על דיסקים מודרניים."
pubDate: 2026-02-26
updatedDate: 2026-09-30
locale: "he"
category: "guides"
featured: false
draft: false
author: "GPUFlow Team"
authorUrl: "https://gpuflow.app"
heroImage: "../_images/secure-server-room-abstract.png"
heroImageAlt: "סביבת שרתים מאובטחת מופשטת שמייצגת עיבוד מוגן של נתוני AI"
faq:
  - question: "האם המארח של GPU שכור יכול לראות את הנתונים שלי?"
    answer: "מבחינה טכנית, כן. למארח יש root על המכונה הפיזית, והנתונים שלכם חייבים להיות מפוענחים בזיכרון כדי לאמן או להריץ מודל. רק confidential computing, כמו confidential VMs עם H100 ב-Azure או ב-Google Cloud, מוציא את המארח מהתמונה."
  - question: "האם shred מוחק קבצים בצורה מאובטחת ב-instance של GPU בענן?"
    answer: "לא באופן אמין. לפי המדריך של GNU shred, הוא עובד רק אם מערכת הקבצים והחומרה דורסות את הנתונים במקום, ומערכות קבצים עם journaling או copy-on-write, ‏snapshots ו-SSDs לא מבטיחים את זה. הצפינו את הנתונים לפני שהם מגיעים לדיסק, ובמקום זה השמידו את ה-instance."
  - question: "מה ההבדל בין RunPod Secure Cloud ל-Community Cloud?"
    answer: "לפי התיעוד של RunPod, ‏Secure Cloud רץ בדאטה סנטרים ברמת T3/T4 ומתאים לפרודקשן ולנתונים רגישים, ו-Community Cloud מורכב מספקים עצמאיים (peer-to-peer) עם אמינות משתנה. ‏RunPod כבר לא מקבלת מארחים חדשים ל-Community Cloud."
  - question: "אילו GPUs בענן תומכים ב-confidential computing?"
    answer: "נכון לספטמבר 2026, ‏Azure מציעה confidential VMs מסדרת NCCads H100 v5 עם GPU אחד מסוג H100 NVL על AMD SEV-SNP, ו-Google Cloud מציעה a3-highgpu-1g חסוי (H100 אחד, ‏Intel TDX) ו-G4 ‏(RTX PRO 6000, ‏AMD SEV). כרטיסי GeForce ביתיים לא מופיעים ברשימות האלה."
  - question: "האם בטוח לשים מידע אישי על GPU שכור לפי GDPR?"
    answer: "רק אם הספק הוא מעבד נתונים עם חוזה שעומד בסעיף 28 של GDPR, ועם נתיב העברה חוקי אם המכונה נמצאת מחוץ לאיחוד האירופי. לרוב המארחים העצמאיים אין איתכם חוזה כזה, אז הסירו קודם את פרטי הזיהוי מהנתונים או השתמשו בספק בדאטה סנטר שחותם על DPA."
  - question: "אפשר לאמן מודל או לעשות לו fine-tuning ב-GPUFlow?"
    answer: "לא. ‏GPUFlow מיועדת להסקה בלבד: אתם מקבלים מפתח API תואם OpenAI למודל שרץ על המחשב של ספק, בלי SSH, בלי shell ובלי גישה לקבצים. הפרומפטים מגיעים למחשב הזה כטקסט גלוי, אז אל תשלחו דרכו רשומות חסויות."
---

כששוכרים GPU, למישהו אחר יש root על המכונה שמחזיקה את הנתונים שלכם. הצפנה מגנה על הדאטהסט בדרך לשם ובזמן שהוא יושב על הדיסק, אבל עבודת האימון שלכם צריכה לפענח אותו בזיכרון כדי להשתמש בו, ובנקודה הזו מארח נחוש יכול לקרוא אותו. אז ההחלטות האמיתיות הן במי אתם בוטחים (דאטה סנטר שעבר בדיקה או שרת ביתי אנונימי), כמה מעט נתונים אתם שולחים, והאם אתם צריכים confidential computing, שהיא האפשרות היחידה שמוציאה את מפעיל המארח משרשרת האמון.

המדריך הזה עוסק במכונות שמתחברים אליהן, כמו instances ב-Vast.ai או ב-RunPod. הוא עובר על מודל האיומים, על מה שכל הגנה מכסה, ועל שגרת ניקוי שמחזיקה מעמד באחסון מודרני. המקורות בסוף; הכול נבדק בספטמבר 2026.

## מודל האיומים

התחילו בלקרוא בשם למי שיכול להגיע לנתונים ואיך. ב-instance של GPU שכור יש שבעה נתיבים מציאותיים.

<figure>
<svg viewBox="0 0 720 430" role="img" aria-labelledby="d1-title" xmlns="http://www.w3.org/2000/svg" font-family="system-ui, sans-serif" font-size="15">
<title id="d1-title">מודל איומים לדאטהסט על instance של GPU שכור: שבעה נתיבים לנתונים וההגנה העיקרית מפני כל אחד</title>
<rect x="0" y="0" width="720" height="430" fill="#ffffff"/>
<line x1="220" y1="75" x2="240" y2="170" stroke="#e2e8f0" stroke-width="2"/>
<line x1="220" y1="220" x2="240" y2="215" stroke="#e2e8f0" stroke-width="2"/>
<line x1="220" y1="365" x2="240" y2="270" stroke="#e2e8f0" stroke-width="2"/>
<line x1="500" y1="75" x2="480" y2="170" stroke="#e2e8f0" stroke-width="2"/>
<line x1="500" y1="220" x2="480" y2="215" stroke="#e2e8f0" stroke-width="2"/>
<line x1="500" y1="365" x2="480" y2="270" stroke="#e2e8f0" stroke-width="2"/>
<line x1="360" y1="330" x2="360" y2="290" stroke="#e2e8f0" stroke-width="2"/>
<rect x="240" y="140" width="240" height="150" rx="12" fill="#eef2ff" stroke="#6366f1" stroke-width="2"/>
<text x="360" y="170" text-anchor="middle" fill="#1e1b4b" font-weight="bold" direction="rtl">ה-instance השכור שלכם</text>
<text x="360" y="205" text-anchor="middle" fill="#1e1b4b" direction="rtl">דאטהסט</text>
<text x="360" y="235" text-anchor="middle" fill="#1e1b4b" direction="rtl">משקלים ו-checkpoints</text>
<text x="360" y="265" text-anchor="middle" fill="#1e1b4b" direction="rtl">טוקנים ומפתחות</text>
<rect x="20" y="40" width="200" height="70" rx="10" fill="#ffffff" stroke="#f97316" stroke-width="2"/>
<text x="120" y="68" text-anchor="middle" fill="#1e1b4b" direction="rtl">מפעיל המארח</text>
<text x="120" y="92" text-anchor="middle" fill="#64748b" font-size="13" direction="rtl">פתרון: מארח שנבדק, או CC</text>
<rect x="20" y="185" width="200" height="70" rx="10" fill="#ffffff" stroke="#f97316" stroke-width="2"/>
<text x="120" y="213" text-anchor="middle" fill="#1e1b4b" direction="rtl">נתיב הרשת</text>
<text x="120" y="237" text-anchor="middle" fill="#64748b" font-size="12" direction="rtl">פתרון: SSH, בלי פורטים פתוחים</text>
<rect x="20" y="330" width="200" height="70" rx="10" fill="#ffffff" stroke="#f97316" stroke-width="2"/>
<text x="120" y="358" text-anchor="middle" fill="#1e1b4b" direction="rtl">שאריות בדיסק</text>
<text x="120" y="382" text-anchor="middle" fill="#64748b" font-size="13" direction="rtl">פתרון: הצפנה, ואז השמדה</text>
<rect x="500" y="40" width="200" height="70" rx="10" fill="#ffffff" stroke="#f97316" stroke-width="2"/>
<text x="600" y="68" text-anchor="middle" fill="#1e1b4b" direction="rtl">פלטפורמת השוק</text>
<text x="600" y="92" text-anchor="middle" fill="#64748b" font-size="13" direction="rtl">פתרון: חוזה ו-DPA</text>
<rect x="500" y="185" width="200" height="70" rx="10" fill="#ffffff" stroke="#f97316" stroke-width="2"/>
<text x="600" y="213" text-anchor="middle" fill="#1e1b4b" direction="rtl">שוכרים אחרים</text>
<text x="600" y="237" text-anchor="middle" fill="#64748b" font-size="13" direction="rtl">פתרון: VM או מכונה שלמה</text>
<rect x="500" y="330" width="200" height="70" rx="10" fill="#ffffff" stroke="#f97316" stroke-width="2"/>
<text x="600" y="358" text-anchor="middle" fill="#1e1b4b" direction="rtl">‏snapshots ו-volumes</text>
<text x="600" y="382" text-anchor="middle" fill="#64748b" font-size="13" direction="rtl">פתרון: בלי עותקים קבועים</text>
<rect x="260" y="330" width="200" height="70" rx="10" fill="#ffffff" stroke="#f97316" stroke-width="2"/>
<text x="360" y="358" text-anchor="middle" fill="#1e1b4b" direction="rtl">מה שאתם השארתם</text>
<text x="360" y="382" text-anchor="middle" fill="#64748b" font-size="12" direction="rtl">פתרון: טוקנים מוגבלים ומתחלפים</text>
</svg>
<figcaption>כל מה שיש על ה-instance חשוף למפעיל המארח בזמן שהעבודה רצה. את שאר הנתיבים סוגרת היגיינה רגילה; הנתיב הזה דורש מארח שאתם בוטחים בו או confidential computing.</figcaption>
</figure>

**מפעיל המארח.** מי שמחזיק במכונה הפיזית הוא root עליה. בשוק קונטיינרים כמו Vast.ai, לקוחות רצים בקונטיינרים של Docker ללא הרשאות מיוחדות, וזה מבודד אתכם משוכרים אחרים אבל לא מהמארח: ‏root על המארח יכול לקרוא את הקבצים ואת הזיכרון של קונטיינר. ככה קונטיינרים עובדים בכל פלטפורמה.

**נתיב הרשת.** נתונים שעוברים מהלפטופ או מה-bucket שלכם אל הצומת. זה הנתיב הכי קל לסגור.

**פלטפורמת השוק.** החברה שבינכם לבין המארח מחזיקה את החשבון שלכם, את מפתחות ה-SSH שלכם ואת מה שהלוגים שלה שומרים. מה מותר לה לעשות איתם קבוע בתנאי השימוש שלה, ולכן הסעיף על חוזים בהמשך חשוב.

**שאריות בדיסק.** קבצים שמחקתם עלולים לשרוד על הדיסק אחרי ההשכרה, שם השוכר הבא או המארח יכולים למצוא אותם.

**‏snapshots ו-volumes קבועים.** עותקים שביקשתם (network volume, ‏instance עצור) או שהמארח יצר (גיבויים) חיים יותר זמן מהעבודה.

**שוכרים אחרים.** לקוחות אחרים על אותה מכונה. עם בידוד VM או מכונה שלמה רק לכם, הסיכון הזה קטן, אבל ב-GPUs היו כאן באגים אמיתיים. ‏LeftoverLocals ‏(CVE-2023-4969) אפשר לתהליך אחד לקרוא את הזיכרון המקומי של GPU של תהליך אחר בחלק מה-GPUs של Apple, ‏AMD ו-Qualcomm; ‏Trail of Bits שחזרו כ-181 MB לכל שאילתת LLM על AMD Radeon RX 7900 XT, מספיק כדי לבנות מחדש את התשובה של המודל. ‏Trail of Bits לא מצאו סימן לבעיה ב-GPUs של NVIDIA, ‏ARM או Intel.

**מה שאתם השארתם.** טוקן של Hugging Face, מפתחות ענן או מפתח SSH פרטי שנשארו על הצומת. בפועל, כך מתחילות רוב הדליפות.

## מה הצפנה מכסה, ומה היא לא יכולה

להצפנה יש שלושה תפקידים, ו-GPU שכור מאפשר לכם לבצע שניים מהם בעצמכם.

**בתעבורה:** קל. השתמשו ב-SSH ‏(`scp`, ‏`sftp`, ‏`rsync -e ssh`) או ב-HTTPS מ-bucket. ‏Vast.ai מציינת שחיבורי SSH וה-API שלה מוצפנים. לעולם אל תשתמשו בקישורי HTTP רגילים או בשירותי שיתוף קבצים בלי אימות.

**במנוחה:** הצפינו לפני ההעלאה, כך שהקובץ על הדיסק של המארח חסר תועלת בלי המפתח. [age](https://github.com/FiloSottile/age) הוא הכלי הפשוט ביותר לזה:

```bash
# on your own machine
tar -cf - train/ | age -p > train.tar.age
scp -P 22345 train.tar.age user@203.0.113.42:/workspace/
```

על הצומת, פענחו ישירות לזיכרון כדי שהטקסט הגלוי לא ייגע בדיסק אף פעם:

```bash
mkdir -p /dev/shm/train
age -d /workspace/train.tar.age | tar -xf - -C /dev/shm/train
```

‏`age -d` מבקש את ה-passphrase בטרמינל, כך שהמפתח אף פעם לא נכתב לצומת. ‏`/dev/shm` היא מערכת קבצים שיושבת ב-RAM; בדקו קודם את הגודל שלה עם `df -h /dev/shm`, כי בהגדרות של קונטיינרים היא הרבה פעמים קטנה. אם הנתונים לא נכנסים ל-RAM, תצטרכו עותק מפוענח על הדיסק, ואז הסעיף על ניקוי בהמשך חשוב עוד יותר.

הצפנת דיסק מלאה עם LUKS היא התשובה הרגילה בשרתים שלכם, אבל בדרך כלל אי אפשר להגדיר dm-crypt בתוך קונטיינר ללא הרשאות מיוחדות, והמארח ממילא היה מחזיק את המפתח הפעיל.

**בשימוש:** כאן הפער. כדי לאמן, ה-GPU צריך טנזורים בטקסט גלוי, וגם זיכרון ה-CPU שמזין אותו מחזיק טקסט גלוי. כל מי שיש לו root על המארח יכול, עקרונית, לשפוך את הזיכרון הזה. הצפנה במנוחה לא עושה כלום מול מארח עוין בזמן אמת. רק confidential computing מבוסס חומרה מטפל בזה.

## ‏Secure Cloud או Community Cloud

מכיוון שהמארח הוא הסיכון היחיד שהיגיינה לא יכולה להסיר, בחירת המארח היא ההחלטה הגדולה ביותר שלכם. שני השווקים הגדולים מפצלים את ההיצע שלהם בדיוק מהסיבה הזו.

| אפשרות | מי מפעיל את החומרה | מה הפלטפורמה אומרת |
| --- | --- | --- |
| RunPod Secure Cloud | דאטה סנטרים ברמת T3/T4 | ל"פרודקשן, נתונים רגישים" |
| RunPod Community Cloud | ספקים עצמאיים (peer-to-peer) | ל"עומסי עבודה רגישים לעלות"; לא מתקבלים מארחים חדשים |
| Vast.ai Secure Cloud | דאטה סנטרים שעברו בדיקה | ‏ISO 27001, תקני Tier 3/4, אבטחה פיזית מאומתת |
| מארחים אחרים ב-Vast.ai | מדאטה סנטרים ועד אנשים פרטיים | למארחים פרטיים "ייתכנו אמצעי אבטחה פחות פורמליים" |

העצה של Vast.ai עצמה לנתונים רגישים היא להשתמש רק בספקי Secure Cloud, להצפין נתונים במנוחה, לא להשאיר פרטי גישה על ה-instances ולהשתמש בניהול מפתחות חיצוני. זה תואם את מה שהייתי אומר לכל אחד.

שתי מגבלות חלות גם בדאטה סנטר מוסמך. ראשית, ISO 27001 מסמיך את התהליכים של המפעיל; הוא לא יכול לשלול איש פנים לא ישר. שנית, מארח שמעבד בשבילכם מידע אישי הוא מעבד נתונים לפי GDPR, וסעיף 28 מצפה לחוזה שמכסה את זה, בזמן שהשוק יושב בינכם לבין המארח. קראו עם איזו חברה אתם חותמים בפועל ומה היא מבטיחה לגבי המארחים שלה.

לעבודה רגישה באמת, השלב הבא הוא instance של GPU בחשבון אצל ספק ענן גדול שכבר יש לכם איתו DPA ואולי BAA, מה שמוציא אתכם מתחום השווקים ועולה יותר לשעה. [השוואת מחירי השכרת GPU](/he/gpu-rental-pricing-comparison-2026/) שלנו מראה את טווחי המחירים.

## ‏confidential computing על GPUs מסוג H100

‏confidential computing ‏(CC) היא הטכנולוגיה היחידה כאן שתוכננה להגן על נתונים מפני מפעיל המארח בזמן שהעבודה רצה. ב-GPUs לדאטה סנטר מדורות Hopper ו-Blackwell של NVIDIA, ההגדרה עובדת כך:

- העבודה רצה ב-confidential VM ‏(CVM) שנשען על AMD SEV-SNP או Intel TDX ב-CPU. התכנון של NVIDIA מניח שה-hypervisor ומערכת ההפעלה של המארח עלולים להיות פרוצים; מפעיל עם גישה ל-hypervisor "או אפילו למערכת עצמה" לא אמור להיות מסוגל לקרוא את הזיכרון של ה-CVM.
- לפני השימוש, ה-VM בודק שה-GPU אמיתי ונמצא במצב CC עם תעודת מכשיר חתומה, שאפשר לאמת מול שירות האימות מרחוק של NVIDIA ‏(NRAS).
- נתונים, command buffers ו-kernels של CUDA שעוברים ב-PCIe מוצפנים וחתומים, ועוברים דרך bounce buffer מוצפן בזיכרון משותף.

‏NVIDIA הפכה CC על GPU יחיד עם H100 לזמין לכלל הלקוחות עם CUDA 12.4 באפריל 2024. איפה אפשר באמת לשכור את זה, נכון לספטמבר 2026:

| ענן | ‏instance | GPU | ‏TEE ב-CPU |
| --- | --- | --- | --- |
| Azure | NCCads H100 v5 | ‏1 × H100 NVL, ‏94 GB | ‏AMD SEV-SNP ‏(EPYC Genoa) |
| Google Cloud | ‏a3-highgpu-1g, ‏Confidential VM | ‏1 × H100 | Intel TDX |
| Google Cloud | ‏g4-standard-48, ‏Confidential VM | RTX PRO 6000 | AMD SEV |

כדאי להכיר את המגבלות לפני שבונים על זה:

- **‏GPU אחד ל-VM.** בסדרה של Azure יש GPU אחד, וה-VMs החסויים עם GPU של Google לא תומכים באשכולות מרובי צמתים. הרצות אימון גדולות על כמה GPUs לא באות בחשבון.
- **הקצאה.** ב-Google Cloud, ‏A3 High חסוי רץ רק כ-Spot או כ-flex-start ולא תומך בהזמנות מראש (reservations).
- **מהירות העברה.** הסקירה הטכנית של NVIDIA מ-2023 העמידה את רוחב הפס מה-CPU ל-GPU במצב CC על כ-4 GB/s, מוגבל על ידי ההצפנה ב-CPU. טעינת checkpoint של 16 GB לוקחת לכן כ-16 ÷ 4 = ‏4 שניות של העברה נטו, בסדר גמור להסקה, אבל pipeline נתונים שמזרים הרבה גיגה-בייטים בכל צעד ירגיש את זה. גרסאות דרייבר מאוחרות יותר מציינות שיפורי ביצועים, אז מדדו את העבודה שלכם.
- **זיכרון ה-GPU לא מוצפן.** ‏NVIDIA משאירה את ה-HBM שעל המארז בטקסט גלוי, בנימוק שכלי תקיפה פיזיים נפוצים לא יכולים להגיע אליו.
- **לא בשווקים.** כרטיסי GeForce הביתיים, הנפוצים אצל מארחי הקהילה ב-Vast.ai וב-RunPod, לא מופיעים באף אחת מרשימות התמיכה האלה.

‏CC משנה במי אתם צריכים לבטוח: בחומרה ובאימות של NVIDIA, ביצרן ה-CPU וב-image של ה-VM שלכם, במקום בצוות של המארח. לנתונים מפוקחים שבהם התשובה "המנהלים של ספק הענן לא יכולים לקרוא אותם" חשובה, זו האפשרות היחידה על חומרה שכורה שמביאה אתכם לשם.

## לפני העבודה ובמהלכה

### לצמצם לפני ההעלאה

ההגנה הזולה ביותר היא נתונים שאף פעם לא יוצאים מהמחשב שלכם. לפני ההעברה:

- הסירו עמודות שהמודל לא צריך, במיוחד שמות, כתובות מייל, מספרי חשבון והערות בטקסט חופשי.
- החליפו מזהים ישירים בטוקנים אקראיים, והשאירו את טבלת ההמרה בבית.
- קצצו את הקורפוס למה שהשיטה צריכה. ‏fine-tuning עם LoRA או QLoRA מכוונן קבוצה קטנה של משקלים נוספים, ולעתים רחוקות צריך בשבילו מסד נתונים שלם של פרודקשן; [המדריך שלנו ל-fine-tuning](/he/private-llm-fine-tuning-guide/) עובר על הגדרה מציאותית.
- זכרו שמשקלי מודל נושאים מידע. מודל שעבר fine-tuning על טקסט רגיש יכול לחזור על חלקים ממנו, אז התייחסו גם ל-adapter כאל רגיש.

נתונים שהוסרו מהם פרטי הזיהוי הם גם מה שגורם לרוב השאלות המשפטיות בהמשך להיעלם.

### פרטי גישה ורשת על הצומת

הניחו שכל מה שאתם שמים על הצומת יכול להיות מועתק.

- השתמשו בטוקן fine-grained של Hugging Face עם הרשאת קריאה ל-repo האחד שאתם צריכים, ובטלו אותו כשהעבודה מסתיימת.
- לעולם אל תעתיקו למכונה שכורה את מפתח ה-SSH הפרטי הראשי שלכם, פרטי root של הענן או סיסמאות של מסד הנתונים בפרודקשן. אם העבודה חייבת לכתוב תוצאות ל-bucket, צרו מפתח שיכול לכתוב רק ל-prefix אחד ופג תוך יום.
- משכו את התוצאות חזרה דרך SSH, במקום לדחוף אותן מהצומת עם מפתחות ארוכי טווח.
- בדקו מה מאזין עם `ss -tulnp`. קשרו את Jupyter, ‏TensorBoard ושרתי הסקה ל-`127.0.0.1` והגיעו אליהם דרך מנהרת SSH ‏(`ssh -L 8888:127.0.0.1:8888 ...`) במקום לחשוף פורט ציבורי.

## ניקוי ששורד דיסקים מודרניים

העצה הרגילה היא להריץ `shred` על הדאטהסט כשמסיימים. זה לא עושה מה שאנשים חושבים. המדריך של GNU coreutils אומר ש-`shred` מסתמך על כך שמערכת הקבצים והחומרה דורסות נתונים במקום, ומפרט את המקרים שבהם זה נכשל: מערכות קבצים עם journaling ומבוססות log כמו ext4 במצב `data=journal`, ‏Btrfs, ‏XFS ו-ZFS, ‏RAID, מערכות קבצים עם snapshots, מערכות קבצים דחוסות, ו-SSDs, שמנגנון ה-wear levelling שלהם כותב נתונים חדשים למקום אחר. צומת GPU שכור הוא כנראה כמה מאלה בבת אחת.

מה שעובד במקום:

1. **להפוך את העותק שעל הדיסק לחסר ערך.** אם רק הארכיון שהוצפן עם age נגע בדיסק, מספיק למחוק אותו; בלי ה-passphrase הוא רעש. המדריך של NIST לסניטציה של מדיה (SP 800-88 Rev. 2, ספטמבר 2025) מתייחס לרעיון הזה, cryptographic erase, כטכניקה סטנדרטית.
2. **להשמיד, לא לעצור.** ב-Vast.ai, עצירת instance משמרת את הנתונים שלו (וממשיכה לחייב על אחסון); השמדה שלו "מוחקת לצמיתות את ה-instance ואת כל הנתונים". ב-RunPod, ה-container disk מתנקה כש-pod נעצר, ה-volume של `/workspace` שורד עצירות ונמחק ב-terminate, ו-network volume שורד הכול עד שאתם מוחקים אותו.
3. **למחוק network volumes שיצרתם.** הם שורדים את ה-pods בכוונה.
4. **לבטל את מה שהשתמשתם בו.** טוקן של Hugging Face, מפתחות bucket, ולהסיר כל מפתח SSH ציבורי חד-פעמי שהוספתם לשוק בשביל העבודה הזו.

איך המארח מוחק דיסקים בין שוכרים זה לא משהו שתיעוד השווקים שקראתי מתאר. תכננו כאילו זה לא קורה, ושלב 1 מכסה אתכם בכל מקרה.

## חוזים ורגולציה

הבקרות הטכניות חשובות פחות מעובדה משפטית אחת: שמים נתונים על מכונה של מישהו, והוא הופך לצד להם.

- **GDPR.** מארח GPU שמעבד בשבילכם מידע אישי הוא מעבד נתונים. סעיף 28 דורש מעבד שנותן "ערובות מספקות" וחוזה מחייב. מארח עצמאי שמעולם לא חתמתם איתו על כלום לא עומד בזה, והמכונה עשויה להיות מחוץ לאיחוד. הסירו פרטי זיהוי, או השתמשו בספק שחותם על DPA.
- **HIPAA.** לפי HHS, ספק ענן שמאחסן מידע רפואי אלקטרוני הוא Business Associate גם אם הנתונים מוצפנים ואין לו מפתח. הצפנת רשומות רפואיות לפני שליחתן למארח שלא נבדק לא מבטלת את הצורך ב-BAA.
- **החוזים של הלקוחות שלכם.** הרבה הסכמים ארגוניים מגבילים מעבדי משנה ומיקום נתונים. בדקו אותם לפני ההעלאה הראשונה. החשיפה המשפטית גדולה הרבה פעמים מהטכנית.

הפוסט הנלווה על [למה חברות מגבילות כלי AI ציבוריים](/he/why-corporate-policies-banning-chatgpt/) עוסק באותם כללים מהצד של הצ'אט.

## הסקה ב-GPUFlow: עסקה אחרת

‏GPUFlow היא לא מקום לשים בו דאטהסט. זה שוק להסקה: אתם שוכרים GPU לפי שעה ומקבלים מפתח API תואם OpenAI ‏(base URL ‏`https://gpuflow.app/v1`) למודל הפתוח שספק מריץ (בדרך כלל עם Ollama) על המחשב שלו. אין SSH, אין shell ואין גישה לקבצים, ואי אפשר לאמן או לעשות fine-tuning. שום דבר שאתם מעלים לא יושב על הדיסק של הספק, כי אי אפשר להעלות כלום.

זה מסיר את הבעיות של דיסק ופרטי גישה שבמדריך הזה. זה לא מסיר את בעיית המארח. כל פרומפט וכל תשובה עוברים דרך המכונה של הספק כטקסט גלוי בזמן שההשכרה רצה. תנאי השימוש של GPUFlow אוסרים על ספקים לתעד, לקרוא, לשמור או לשתף אותם, ו-GPUFlow עצמה לא שומרת את הטקסט, אבל לספק יש root על המכונה, כך שהכלל נאכף רק בחוזה. אם תריצו דרכה דאטהסט, רשומה אחת בכל פרומפט, כל רשומה תגיע למחשב הזה.

אז השתמשו בה לנתונים ציבוריים, סינתטיים או כאלה שהוסרו מהם פרטי הזיהוי כראוי, ולבדיקת מודל פתוח או אפליקציה מול API בסגנון OpenAI. השאירו רשומות מפוקחות וחסויות על החומרה שלכם, אצל ספק שיש לכם חוזה איתו, או ב-confidential VM. [מדריך ההתחלה המהירה ל-API](https://docs.gpuflow.app/he/renters/api-quickstart/) אומר את אותו דבר בשורה אחת: אל תשלחו סיסמאות, מספרי כרטיסים או סודות אחרים שלא הייתם משתפים עם אדם זר. אותו הסדר מהצד של הספק מתואר ב[האם בטוח להשכיר את ה-GPU שלכם](/he/is-it-safe-to-rent-out-your-gpu/).

## רשימת בדיקה

לפני:

- קבעו את סוג הנתונים. נתונים מפוקחים או חסויים של לקוחות הולכים לספק עם חוזה או ל-confidential VM, לא למארח קהילתי.
- צמצמו והסירו פרטי זיהוי.
- הצפינו עם age; השאירו את ה-passphrase מחוץ לצומת.

במהלך:

- פענחו ל-`/dev/shm` אם זה נכנס.
- רק טוקנים מוגבלים וקצרי חיים.
- שירותים שקשורים ל-localhost, ונגישים דרך מנהרות SSH.

אחרי:

- משכו תוצאות דרך SSH; התייחסו למשקלים שעברו fine-tuning כאל רגישים.
- השמידו את ה-instance ואת כל ה-network volumes.
- בטלו טוקנים ומפתחות חד-פעמיים.

## מקורות

- בידוד קונטיינרים ו-Secure Cloud ב-Vast.ai: ‏[Vast.ai Security FAQ](https://docs.vast.ai/guides/reference/faq/security); עצירה מול השמדה: ‏[ניהול instances](https://docs.vast.ai/guides/instances/manage-instances)
- ‏Secure Cloud מול Community Cloud ב-RunPod: ‏[בחירת Pod](https://docs.runpod.io/pods/choose-a-pod); שמירת אחסון: ‏[סוגי אחסון](https://docs.runpod.io/pods/storage/types)
- LeftoverLocals: ‏[Trail of Bits, ינואר 2024](https://blog.trailofbits.com/2024/01/16/leftoverlocals-listening-to-llm-responses-through-leaked-gpu-local-memory/)
- age: ‏[github.com/FiloSottile/age](https://github.com/FiloSottile/age)
- המגבלות של shred: ‏[המדריך של GNU coreutils, ‏shred invocation](https://www.gnu.org/software/coreutils/manual/html_node/shred-invocation.html)
- ‏NIST SP 800-88 Rev. 2: ‏[ההודעה של NIST, ספטמבר 2025](https://www.nist.gov/news-events/news/2025/09/guidelines-media-sanitization-nist-publishes-sp-800-88r2)
- התכנון של confidential computing ב-H100: ‏[NVIDIA, Confidential Computing on H100 GPUs for Secure and Trustworthy AI](https://developer.nvidia.com/blog/confidential-computing-on-h100-gpus-for-secure-and-trustworthy-ai/); זמינות כללית: ‏[NVIDIA, אפריל 2024](https://developer.nvidia.com/blog/announcing-confidential-computing-general-access-on-nvidia-h100-tensor-core-gpus/)
- Azure: ‏[סדרת NCCads H100 v5](https://learn.microsoft.com/en-us/azure/virtual-machines/sizes/gpu-accelerated/nccadsh100v5-series)
- Google Cloud: ‏[תצורות נתמכות של Confidential VM](https://docs.cloud.google.com/confidential-computing/confidential-vm/docs/supported-configurations), [יצירת Confidential VM עם GPU](https://docs.cloud.google.com/confidential-computing/confidential-vm/docs/create-a-confidential-vm-instance-with-gpu)
- סעיף 28 של GDPR: ‏[gdpr-info.eu](https://gdpr-info.eu/art-28-gdpr/)
- ‏HIPAA וספקי ענן: ‏[HHS, הנחיות בנושא HIPAA ומחשוב ענן](https://www.hhs.gov/hipaa/for-professionals/special-topics/health-information-technology/cloud-computing/index.html)
- GPUFlow: ‏[מדריך התחלה מהירה ל-API](https://docs.gpuflow.app/he/renters/api-quickstart/), [למה שוכרים יכולים ולא יכולים להגיע](https://docs.gpuflow.app/he/providers/security/), [תנאי שימוש](https://gpuflow.app/he/terms), [מדיניות פרטיות](https://gpuflow.app/he/privacy)

כולם נבדקו בספטמבר 2026.
