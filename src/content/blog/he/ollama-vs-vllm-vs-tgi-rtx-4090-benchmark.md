---
title: "Ollama מול vLLM מול TGI על RTX 4090: מה הבנצ'מרקים מראים"
description: "Ollama, ‏vLLM ו-TGI של Hugging Face למודל 8B על RTX 4090: תפוקה תחת עומס ממקורות מצוטטים, VRAM, קוונטיזציה, APIs בסגנון OpenAI ומצב התחזוקה של TGI."
excerpt: "בבקשה אחת בכל פעם, המנועים רצים בערך באותה מהירות על RTX 4090. עם הרבה משתמשים במקביל, vLLM מתרחק הרבה קדימה. ‏TGI נמצא עכשיו במצב תחזוקה. מספרים שפורסמו, מקורות, ובמה לבחור."
pubDate: 2026-02-25
updatedDate: 2026-09-30
locale: "he"
category: "benchmarks"
featured: false
draft: false
author: "GPUFlow Team"
heroImage: "../_images/rtx4090-inference-benchmark-hero.png"
heroImageAlt: "בנצ'מרק הסקה על GPU מסוג RTX 4090 מוצג בטרמינל עם מדדי ביצועים"
faq:
  - question: "האם vLLM מהיר יותר מ-Ollama על RTX 4090?"
    answer: "רק כשהרבה בקשות רצות במקביל. בבדיקה של ComputingForGeeks מספטמבר 2026 עם Qwen2.5-7B ב-4 ביט, שניהם ייצרו כ-174 טוקנים לשנייה בבקשה אחת על RTX 4090. עם 64 בקשות במקביל, vLLM הגיע ל-6,623 טוקנים לשנייה בסך הכול ו-Ollama ל-2,018."
  - question: "האם TGI של Hugging Face עדיין מתוחזק?"
    answer: "רק בקטנה. התיעוד של TGI אומר שהוא במצב תחזוקה ומקבל רק תיקוני באגים קטנים ושינויים בתיעוד, ומאגר ה-GitHub הועבר לארכיון לקריאה בלבד ב-21 במרץ 2026. ‏Hugging Face ממליצה במקומו על vLLM או SGLang, או על llama.cpp ו-MLX לשימוש מקומי."
  - question: "כמה VRAM ‏vLLM תופס למודל 8B?"
    answer: "כברירת מחדל vLLM תופס 90% מזיכרון ה-GPU ‏(gpu-memory-utilization 0.9), כ-21.6 GB על RTX 4090 של 24 GB, בלי קשר לגודל המודל. מה שהמשקלים לא צריכים הופך ל-KV cache לבקשות מקבילות."
  - question: "האם Ollama יכול לשרת כמה משתמשים במקביל?"
    answer: "כן, אבל ברירת המחדל היא בקשה אחת בכל פעם לכל מודל (OLLAMA_NUM_PARALLEL=1). אפשר להעלות את זה, וכל חריץ מקבילי מוסיף זיכרון הקשר משלו. בנצ'מרקים שפורסמו מראים ש-Ollama מתרחב פחות טוב מ-vLLM תחת מקביליות גבוהה."
  - question: "האם ל-Ollama, ‏vLLM ו-TGI יש APIs תואמי OpenAI?"
    answer: "כן. שלושתם מגישים /v1/chat/completions. ‏Ollama ו-vLLM מגישים גם completions, ‏embeddings ואת ה-Responses API; ה-Messages API של TGI, שתואם OpenAI, קיים מאז גרסה 1.4.0."
  - question: "אפשר להריץ Llama 3.1 8B ב-FP16 על GPU של 24 GB?"
    answer: "כן. ‏8.03 מיליארד פרמטרים ב-2 בייטים כל אחד הם כ-16.1 GB של משקלים, וזה נכנס ב-24 GB עם מקום ל-KV cache צנוע. רוב מי שמגיש מודל על כרטיס צרכני אחד משתמש במשקלים של 4 או 8 ביט כדי להשאיר יותר מקום להקשר ולמשתמשים מקבילים."
---

על RTX 4090 יחיד שמגיש מודל של 7B–8B, ‏Ollama ו-vLLM רצים בערך באותה מהירות כשיש בקשה אחת בכל פעם. הפער נפתח כשהרבה בקשות מגיעות יחד: בבדיקה שפורסמה בספטמבר 2026 עם 64 בקשות מקבילות, vLLM הפיק בערך פי שלושה מהתפוקה הכוללת של Ollama. ‏TGI של Hugging Face עדיין עובד, אבל הוא במצב תחזוקה מאז שהמאגר שלו הועבר לארכיון במרץ 2026, ו-Hugging Face עצמה מפנה היום אנשים ל-vLLM ול-SGLang.

אז הבחירה מסתכמת בשאלה כמה אנשים פונים למודל בו-זמנית. משתמש אחד, סקריפט, או כלי פנימי קטן: ‏Ollama, כי הוא דורש הכי פחות עבודה. ‏API ציבורי או משימות אצווה עם הרבה בקשות באוויר: ‏vLLM. פריסה חדשה על TGI: לא הייתי מתחיל כזו.

## מאיפה המספרים מגיעים

גרסה קודמת של הדף הזה הציגה נתוני תפוקה, השהיה ו-VRAM כאילו הם מדידות שלנו על RTX 4090. לא הצלחנו לקשר אותם להרצה שאפשר לשחזר או למקור שפורסם, אז הסרנו אותם. סיבה אחת לספק: נתוני ה-FP16 הישנים לזרם יחיד היו מעל מה שרוחב הפס של הזיכרון של RTX 4090 מאפשר (ראו את הסעיף הבא).

כל מספר בהמשך מיוחס עכשיו למי שפרסם אותו, עם החומרה והמודל שהוא השתמש בהם. איפה שאף אחד לא פרסם השוואה נקייה על RTX 4090 ‏(TGI, למשל), אני אומר את זה במקום למלא את החור.

המקורות העיקריים:

- **ComputingForGeeks, ‏18 בספטמבר 2026.** ‏Ollama, ‏vLLM ו-llama.cpp על RTX 4090, ‏L40S ו-RTX 5090. מודל: Qwen2.5-7B-Instruct, ‏AWQ ‏4 ביט ל-vLLM ו-GGUF Q4_K_M ל-Ollama ול-llama.cpp. פרומפט קבוע של 512 טוקנים, temperature 0, עד 256 טוקני פלט, הקשר של 4,096 טוקנים לכל חריץ, 64 חריצים מקבילים.
- **Red Hat Developer, ‏8 באוגוסט 2025.** ‏Ollama 0.9.2 מול vLLM 0.9.1 על A100 40 GB אחד, ‏Llama 3.1 8B Instruct ב-FP16, ‏1 עד 256 משתמשים מקבילים, נמדד עם GuideLLM.
- **BentoML, ‏5 ביוני 2024.** ‏vLLM 0.4.2, ‏TGI 2.0.4 ואחרים על A100 80 GB עם Llama 3 8B Instruct.
- **טבלת התוצאות של llama.cpp ל-CUDA.** מהירות בזרם יחיד ל-Llama 2 7B Q4_0 על הרבה כרטיסים, כולל RTX 4090.

רק הראשון רץ על RTX 4090 עם כל המנועים שהפוסט הזה עוסק בהם, חוץ מ-TGI. האחרים מראים את אותו דפוס על כרטיסים של מרכזי נתונים.

## בקשה אחת: הכרטיס קובע את התקרה

כש-GPU מייצר טוקנים לבקשה יחידה, הוא צריך לקרוא מהזיכרון כל משקל של המודל בשביל כל טוקן. לכן רוחב הפס של הזיכרון, ולא המנוע, קובע את הגבול העליון.

ל-RTX 4090 יש 24 GB של GDDR6X ב-1,008 GB/s. ל-Llama 3.1 8B יש 8.03 מיליארד פרמטרים.

- ב-FP16, זה 8.03 × 2 בייטים ≈ 16.1 GB של משקלים. ‏1,008 ÷ 16.1 ≈ **63 טוקנים לשנייה**, לכל היותר, לבקשה אחת.
- תג ברירת המחדל של Ollama, ‏`llama3.1:8b`, הוא Q4_K_M, הורדה של 4.9 GB. ‏1,008 ÷ 4.9 ≈ **205 טוקנים לשנייה**, לכל היותר.

מנועים אמיתיים נוחתים מתחת לתקרות האלה. טבלת התוצאות של llama.cpp מראה RTX 4090 שמייצר 186 טוקנים לשנייה עם Llama 2 7B ב-Q4_0 ‏(189 עם flash attention). ‏ComputingForGeeks מדדו כ-174 טוקנים לשנייה לבקשה אחת עם Qwen2.5-7B ב-4 ביט, ומצאו ש-vLLM, ‏llama.cpp ו-Ollama "בערך" זהים על ה-4090. (על ה-L40S וה-RTX 5090, גרסת ה-Ollama שלהם פענחה בערך בחצי מהמהירות של llama.cpp, אז בדקו את הכרטיס והגרסה שלכם.)

למשתמש אחד בכל פעם, בחרו מנוע לפי נוחות, ובחרו קוונטיזציה לפי מהירות. מעבר מ-FP16 ל-4 ביט בערך משלש את התקרה. החלפת מנוע כמעט לא מזיזה אותה.

## הרבה בקשות: ה-batching מכריע

כשהרבה בקשות באוויר, ה-GPU יכול לקרוא את המשקלים פעם אחת ולהשתמש בהם לאצווה שלמה של בקשות. עכשיו מה שקובע הוא כמה טוב המנוע מקבץ בקשות ואיך הוא מנהל את ה-KV cache ‏(הזיכרון של כל בקשה לגבי השיחה עד עכשיו).

<figure>
<svg viewBox="0 0 720 310" role="img" aria-labelledby="d1-title" xmlns="http://www.w3.org/2000/svg" font-family="system-ui, sans-serif" font-size="15">
<title id="d1-title">גרף עמודות של התפוקה הכוללת על RTX 4090 עם 64 בקשות מקבילות: vLLM ‏6,623, ‏llama.cpp ‏2,391, ‏Ollama ‏2,018 טוקנים לשנייה</title>
<text x="160" y="63" text-anchor="end" fill="#1e1b4b">vLLM (AWQ)</text>
<rect x="170" y="40" width="454" height="36" fill="#6366f1"/>
<text x="632" y="63" fill="#1e1b4b">6,623</text>
<text x="160" y="123" text-anchor="end" fill="#1e1b4b">llama.cpp</text>
<rect x="170" y="100" width="164" height="36" fill="#a5b4fc"/>
<text x="342" y="123" fill="#1e1b4b">2,391</text>
<text x="160" y="183" text-anchor="end" fill="#1e1b4b">Ollama</text>
<rect x="170" y="160" width="138" height="36" fill="#a5b4fc"/>
<text x="316" y="183" fill="#1e1b4b">2,018</text>
<line x1="170" y1="210" x2="650" y2="210" stroke="#64748b" stroke-width="1.5"/>
<line x1="170" y1="30" x2="170" y2="210" stroke="#64748b" stroke-width="1.5"/>
<line x1="307" y1="210" x2="307" y2="216" stroke="#64748b" stroke-width="1.5"/>
<line x1="444" y1="210" x2="444" y2="216" stroke="#64748b" stroke-width="1.5"/>
<line x1="581" y1="210" x2="581" y2="216" stroke="#64748b" stroke-width="1.5"/>
<text x="170" y="232" text-anchor="middle" fill="#64748b" font-size="13">0</text>
<text x="307" y="232" text-anchor="middle" fill="#64748b" font-size="13">2,000</text>
<text x="444" y="232" text-anchor="middle" fill="#64748b" font-size="13">4,000</text>
<text x="581" y="232" text-anchor="middle" fill="#64748b" font-size="13">6,000</text>
<text x="410" y="256" text-anchor="middle" fill="#64748b" font-size="13" direction="rtl">סך טוקני הפלט לשנייה, 64 בקשות במקביל</text>
<text x="360" y="290" text-anchor="middle" fill="#1e1b4b" font-size="14" direction="rtl">בקשה אחת בכל פעם: כ-174 טוקנים לשנייה בכל השלושה</text>
</svg>
<figcaption>RTX 4090, ‏Qwen2.5-7B-Instruct ב-4 ביט (AWQ ל-vLLM, ‏GGUF Q4_K_M לאחרים), 64 בקשות מקבילות. המספרים מ-ComputingForGeeks, ספטמבר 2026; העמודות בקנה מידה. ‏TGI לא היה חלק מהבדיקה הזו.</figcaption>
</figure>

על ה-RTX 4090, ‏vLLM הגיש 6,623 טוקנים לשנייה בסך הכול על פני 64 בקשות, השרת של llama.cpp ‏2,391, ו-Ollama ‏2,018. ‏Ollama הוגדר כאן בהגינות: ‏`OLLAMA_NUM_PARALLEL=64`, ‏`num_ctx 4096` ו-flash attention מופעל. ‏vLLM רץ עם `--quantization awq_marlin --max-model-len 4096 --gpu-memory-utilization 0.90`. הכותבים דיווחו גם על זמן עד הטוקן הראשון של כ-8 עד 12 ms ל-llama.cpp ו-16 עד 25 ms ל-vLLM, כש-Ollama הכי גבוה על ה-L40S וה-RTX 5090.

הבדיקה של Red Hat על A100 מצביעה לאותו כיוון עם משקלי FP16. ‏vLLM הגיע לשיא של 793 טוקנים לשנייה; ‏Ollama בהגדרות ברירת המחדל הגיע ל-41. אחרי שהעלו את מגבלת המקביליות של Ollama ל-32, "הערך היציב הגבוה ביותר", הוא עדיין לא השתווה ל-vLLM באף רמת מקביליות. הזמן שלו עד הטוקן הראשון "עלה באופן דרמטי עם יותר משתמשים", וההשהיה בין טוקנים הראתה "קפיצות עצומות" בעומס השיא.

שתי הסתייגויות לפני שאתם מצטטים את זה למישהו. ראשית, ההשוואה של ComputingForGeeks לא לגמרי זהה בתנאים: ‏vLLM הריץ משקלי AWQ, האחרים GGUF, והגרסאות שונות. שנית, אלה סכומים על פני כל הבקשות. כל אחד מ-64 המשתמשים רואה כ-6,623 ÷ 64 ≈ 103 טוקנים לשנייה ב-vLLM, שזה עדיין שמיש מאוד, וכ-2,018 ÷ 64 ≈ 32 ב-Ollama.

## איפה TGI עומד

Text Generation Inference היה שרת הייצור של Hugging Face, עם continuous batching, ‏Flash Attention ו-Paged Attention, ‏tensor parallelism, מדדי Prometheus ו-tracing עם OpenTelemetry. מבחינה טכנית הוא היה באותה ליגה כמו vLLM.

המצב שלו השתנה. התיעוד של TGI נפתח עכשיו כך: "text-generation-inference נמצא עכשיו במצב תחזוקה. מעתה נקבל pull requests לתיקוני באגים קטנים, שיפורי תיעוד ומשימות תחזוקה קלות." הוא ממליץ על "vllm, ‏SGLang, וכן מנועים מקומיים עם תאימות הדדית כמו llama.cpp או MLX". מאגר ה-GitHub הועבר לארכיון והפך לקריאה בלבד ב-21 במרץ 2026.

לא מצאתי בנצ'מרק עדכני שפורסם של TGI על RTX 4090. ההשוואה האמינה הקרובה ביותר היא של BentoML על A100 80 GB מיוני 2024: עם Llama 3 8B, ‏vLLM הגיע ל-"2300-2500 טוקנים לשנייה, בדומה ל-TGI", ול-vLLM היה הזמן הטוב ביותר עד הטוקן הראשון בכל רמת מקביליות שהם בדקו. זה היה לפני שנתיים והרבה גרסאות של שני המנועים, אז התייחסו לזה כהיסטוריה.

אם TGI כבר מריץ את תעבורת הייצור שלכם, הוא ימשיך לעבוד. בפריסה חדשה הייתם בוחרים שרת שלא יקבל ארכיטקטורות מודלים חדשות או עבודה על ביצועים. על RTX 4090 אחד, vLLM מכסה את כל מה ש-TGI עשה.

## VRAM על כרטיס של 24 GB

המנועים מתייחסים לזיכרון בצורה שונה מאוד, וזה משפיע על מה עוד יכול לחלוק את הכרטיס.

**vLLM תופס את רוב הכרטיס מראש.** ברירת המחדל של `--gpu-memory-utilization` היא 0.9, כך שעל RTX 4090 של 24 GB הוא תופס כ-21.6 GB בעלייה, בלי קשר לגודל המודל. כל מה שהמשקלים לא משתמשים בו הופך ל-KV cache. עם Llama 3.1 8B ב-FP16 ‏(כ-16.1 GB), נשארים בערך 5.5 GB ל-KV cache, לאקטיבציות ול-CUDA graphs, וזה מגביל את אורך ההקשר ואת מספר הבקשות שנכנסות במקביל. עם משקלי AWQ ב-4 ביט (הגרסה של ComputingForGeeks הייתה כ-5.6 GB), רוב ה-21.6 GB הולכים ל-KV cache, וכך הוא מחזיק 64 בקשות. אל תצפו להריץ לידו תוכנה נוספת על ה-GPU אלא אם תורידו את השבר הזה.

**Ollama מקצה לפי מודל ולפי הקשר.** מודל `llama3.1:8b` ב-Q4_K_M הוא 4.9 GB, ועוד KV cache לחלון ההקשר שלו. ‏Ollama בוחר את ההקשר ברירת המחדל לפי ה-VRAM שלכם: 4k מתחת ל-24 GiB, ‏32k בין 24 ל-48 GiB, ו-256k מ-48 GiB ומעלה. ‏RTX 4090 יושב בדיוק על קו ה-24 GiB ‏(nvidia-smi מדווח קצת פחות מ-24 GiB), אז בדקו עם `ollama ps` איזה הקשר קיבלתם בפועל, או קבעו אותו בעצמכם. חריצים מקבילים מכפילים את זה: הדוגמה בתיעוד היא ש"הקשר של 2K עם 4 בקשות מקבילות ייצור הקשר של 8K והקצאת זיכרון נוספת". אם הזיכרון צפוף, קוונטיזציה של ה-KV cache עוזרת: ‏`q8_0` משתמש בערך בחצי מהזיכרון של ברירת המחדל `f16`, ו-`q4_0` בערך ברבע. ‏Ollama יכול גם להחזיק עד שלושה מודלים טעונים לכל GPU כברירת מחדל, אם הם נכנסים, וזה מתאים לכרטיס שמחליף בין מודלים. לשאלה אילו מודלים נכנסים מלכתחילה לכרטיסים של 8, ‏12, ‏16 ו-24 GB, ראו [אילו מודלי AI נכנסים ל-VRAM של ה-GPU שלכם](/he/which-ai-models-fit-your-gpu-vram/).

**TGI** גם מקצה מראש בשביל continuous batching, כמו vLLM. לא מצאתי נתון VRAM עדכני שאפשר לצטט למודל 8B על 4090, אז לא אתן כזה.

## קוונטיזציה ופורמטים של מודלים

| | Ollama | vLLM | TGI |
| --- | --- | --- | --- |
| **פורמט עיקרי** | ‏GGUF ‏(למשל Q4_K_M) | ‏safetensors של Hugging Face | ‏safetensors של Hugging Face |
| **אפשרויות 4 ביט** | גרסאות Q4 של GGUF | AWQ, GPTQ, bitsandbytes, INT4 W4A16 | AWQ, GPTQ, Marlin, EXL2, bitsandbytes NF4/FP4 |
| **8 ביט / FP8** | GGUF Q8_0 | ‏FP8 W8A8 על Ada ‏(RTX 4090) ו-Hopper; ‏INT8 | ‏bitsandbytes ‏8 ביט, EETQ, fp8 |
| **GGUF** | מובנה | נתמך | לא מופיע |
| **קוונטיזציה של KV cache** | q8_0, q4_0 | כן | לא נבדק כאן |

ה-RTX 4090 הוא כרטיס Ada ‏(SM 8.9), כך שמסלול ה-FP8 של vLLM עובד עליו. משקלי FP8 תופסים חצי מהזיכרון של FP16: כ-8 GB למודל 8B, דרך ביניים בין FP16 ל-4 ביט על 4090 אחד.

ספריית המודלים של Ollama מגיעה עם תגי GGUF שכבר עברו קוונטיזציה, כך שכמעט לא חושבים על זה: ‏`ollama pull llama3.1:8b` מביא לכם Q4_K_M. עם vLLM בוחרים checkpoint שכבר עבר קוונטיזציה מ-Hugging Face או מעבירים דגל קוונטיזציה בעצמכם.

## שרתים תואמי OpenAI והתקנה

שלושתם נותנים API של HTTP בסגנון OpenAI, כך שה-SDKs של OpenAI ורוב כלי הצ'אט עובדים אחרי החלפת ה-base URL.

| | Ollama | vLLM | TGI |
| --- | --- | --- | --- |
| **כתובת ברירת מחדל** | `localhost:11434/v1` | `localhost:8000/v1` | פורט 80 בקונטיינר (בדרך כלל ממופה ל-8080) |
| **Chat completions** | כן | כן | כן (Messages API, מאז 1.4.0) |
| **נקודות קצה אחרות של OpenAI** | completions, models, embeddings, responses | completions, embeddings, responses, audio | לא נבדק כאן |
| **התקנה** | סקריפט אחד | חבילת pip | ‏image של Docker |

הרצת מודל 8B, לפי התיעוד של כל פרויקט:

```bash
# Ollama
curl -fsSL https://ollama.com/install.sh | sh
ollama pull llama3.1:8b

# vLLM (Llama 3.1 is gated: accept the license on Hugging Face and set HF_TOKEN)
pip install vllm
vllm serve meta-llama/Llama-3.1-8B-Instruct

# TGI
docker run --gpus all --shm-size 1g -p 8080:80 -v $PWD/data:/data \
  ghcr.io/huggingface/text-generation-inference:3.3.5 \
  --model-id meta-llama/Llama-3.1-8B-Instruct
```

Ollama דורש הכי פחות עבודה, ובפער. הוא מטפל בהורדות, בקבצים אחרי קוונטיזציה, בטעינה ובפריקה, ועובד אותו דבר על לפטופ ועל שרת שכור. לשכבת ה-OpenAI של Ollama יש חורים: אין `logprobs` או `tool_choice` ב-chat completions, ותמונות חייבות להיות ב-base64 ולא ככתובות URL. ‏vLLM צריך סביבת CUDA ו-Python תקינה ועוד דגלים לכוונון, אבל זה המנוע ש-Hugging Face ממליצה עליו היום במקום TGI. ‏TGI קל אם אתם כבר מריצים Docker, עם הסתייגות התחזוקה שלמעלה.

## איזה מנוע לאיזו עבודה

**Ollama** לאדם אחד, לסקריפט, לעוזר קוד, לכלי פנימי עם קומץ משתמשים, או למכונה שמחליפה בין כמה מודלים. ההתקנה לוקחת דקות, והמהירות בבקשה אחת על 4090 טובה כמו של כל מנוע אחר.

**vLLM** כשהרבה בקשות מגיעות באותו זמן: ‏API ציבורי, מוצר צ'אט מרובה משתמשים, או משימות אצווה שאפשר להריץ 32 או 64 בכל פעם. המספרים שפורסמו מראים בערך פי שלושה מהתפוקה הכוללת של Ollama על RTX 4090 עם 64 בקשות מקבילות, והרבה יותר על A100. יש לו גם את התמיכה הרחבה ביותר בקוונטיזציה וב-API.

**TGI** רק אם הוא כבר רץ אצלכם. לעבודה חדשה, העצה של Hugging Face עצמה היא vLLM או SGLang.

כשמשכירים לפי שעה, העלות נגזרת מהתפוקה. קחו מיליון טוקני פלט על RTX 4090 ב-$0.31 לשעה, המחיר הזול ביותר לפי דרישה ב-Vast.ai ש-getdeploying.com הציג בספטמבר 2026, עם המספרים של ComputingForGeeks:

- בקשה אחת בכל פעם, 174 טוקנים לשנייה: ‏1,000,000 ÷ 174 ≈ 5,750 ש' ≈ 1.6 שעות ≈ **$0.50**.
- 64 במקביל על Ollama, ‏2,018 טוקנים לשנייה: ≈ 496 ש' ≈ **$0.04**.
- 64 במקביל על vLLM, ‏6,623 טוקנים לשנייה: ≈ 151 ש' ≈ **$0.01**.

זה בהנחה שה-GPU עסוק כל הזמן. אם אף פעם אין לכם יותר מבקשה אחת באוויר, batching לא נותן לכם כלום ובחירת המנוע לא משנה את החשבון. אם יש לכם תור של עבודה, היא משנה אותו בסדר גודל. אותו היגיון, בהשוואה ל-APIs לפי טוקן, נמצא ב[GPU לפי שעה או API לפי טוקן](/he/hourly-gpu-vs-per-token-api/).

## איפה GPUFlow נכנס

תוכנית ההתקנה לספקים של GPUFlow מתקינה Ollama כברירת מחדל, והסוכן של GPUFlow מעביר אליו בקשות, כך שעמודת Ollama שלמעלה היא בדרך כלל זו שרלוונטית שם. אתם שוכרים מפתח API תואם OpenAI ‏(`https://gpuflow.app/v1`, עם `/v1/chat/completions` ו-`/v1/models`, עם תמיכה ב-streaming) למודל על ה-GPU של הספק. אתם משלמים על זמן, לפי שנייה עם מינימום של דקה, לא לפי טוקן.

מה שאי אפשר לעשות ב-GPUFlow: לבחור את המנוע, לשנות את ההגדרות שלו, או להריץ קוד משלכם. אין SSH או shell. כדי לשחזר את הבנצ'מרקים שלמעלה או להריץ vLLM בעצמכם, שכרו מכונה שאפשר להתחבר אליה ב-Vast.ai או ב-RunPod ‏([איך הן משתוות](/he/runpod-vs-vastapi-comparison/)). כדי להשתמש במודל שמוגש ב-Ollama מאפליקציה בלי להתקין כלום, ראו את [השוק של GPUFlow](https://gpuflow.app/he/marketplace) ו[איך להשתמש במפתח בכלים נפוצים](/he/use-openai-compatible-api-key-in-apps/).

אם עשיתם fine-tuning למודל משלכם ואתם מחליטים איך להגיש אותו, [המדריך ל-fine-tuning של LLM פרטי](/he/private-llm-fine-tuning-guide/) מכסה את השלב שלפני זה.

## מקורות

כולם נבדקו בספטמבר 2026.

- ‏Ollama מול vLLM מול llama.cpp על RTX 4090, ‏L40S ו-RTX 5090: [ComputingForGeeks](https://computingforgeeks.com/ollama-vs-vllm-vs-llama-cpp/) ‏(18 בספטמבר 2026)
- ‏Ollama מול vLLM על A100 40 GB: [Red Hat Developer](https://developers.redhat.com/articles/2025/08/08/ollama-vs-vllm-deep-dive-performance-benchmarking) ‏(8 באוגוסט 2025)
- ‏vLLM, ‏TGI ואחרים על A100 80 GB: [BentoML, בנצ'מרק של שרתי הסקה ל-LLM](https://www.bentoml.com/blog/benchmarking-llm-inference-backends) ‏(5 ביוני 2024)
- טבלת התוצאות של llama.cpp ל-CUDA: [github.com/ggml-org/llama.cpp/discussions/15013](https://github.com/ggml-org/llama.cpp/discussions/15013)
- הזיכרון ורוחב הפס של RTX 4090: [הסקירה של TechPowerUp](https://www.techpowerup.com/review/nvidia-geforce-rtx-4090-founders-edition/)
- הפרמטרים והרישיון של Llama 3.1 8B: [כרטיס המודל ב-Hugging Face](https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct)
- Ollama: [שאלות נפוצות (בקשות מקבילות, KV cache)](https://docs.ollama.com/faq), [אורך הקשר](https://docs.ollama.com/context-length), [תאימות ל-OpenAI](https://docs.ollama.com/api/openai-compatibility), [התג llama3.1:8b](https://ollama.com/library/llama3.1:8b)
- vLLM: [שרת תואם OpenAI](https://docs.vllm.ai/en/latest/serving/online_serving/openai_compatible_server/), [קוונטיזציה](https://docs.vllm.ai/en/latest/features/quantization/index.html), [ארגומנטים של המנוע (gpu-memory-utilization)](https://docs.vllm.ai/en/v0.6.4/models/engine_args.html)
- TGI: [תיעוד והודעת התחזוקה](https://huggingface.co/docs/text-generation-inference/en/index), [מאגר GitHub ‏(בארכיון)](https://github.com/huggingface/text-generation-inference), [Messages API](https://huggingface.co/docs/text-generation-inference/en/messages_api), [קוונטיזציה](https://huggingface.co/docs/text-generation-inference/en/conceptual/quantization)
- מחיר השכרת RTX 4090: [getdeploying.com](https://getdeploying.com/reference/cloud-gpu/nvidia-rtx-4090)
- GPUFlow: [התחלה מהירה עם ה-API](https://docs.gpuflow.app/he/renters/api-quickstart/), [צעדים ראשונים לספקים](https://docs.gpuflow.app/he/providers/getting-started/)
