---
title: "Ollama vs vLLM vs TGI: בדיקת ביצועי Inference על RTX 4090 (מדוד, לא שיווקי)"
description: "Benchmark מבוקר על RTX 4090 המשווה בין Ollama, vLLM ו‑Hugging Face TGI עבור Inference של Llama‑3.1‑8B. ניתוח throughput, latency, שימוש ב‑VRAM ועלות לכל token."
excerpt: "Benchmark מדוד של Ollama, vLLM ו‑TGI על RTX 4090 יחיד עם Llama‑3.1‑8B. throughput אמיתי, latency אמיתי והשלכות עלות אמיתיות."
pubDate: 2026-02-25
updatedDate: 2026-02-25
locale: "he"
category: "benchmarks"
featured: false
draft: false
author: "GPUFlow Team"
heroImage: "../_images/rtx4090-inference-benchmark-hero.png"
heroImageAlt: "בדיקת ביצועי Inference על RTX 4090 מוצגת בטרמינל עם מדדי ביצועים"
faq:
  - question: "איזה שרת Inference הוא המהיר ביותר על RTX 4090 עבור Llama-3.1-8B?"
    answer: "בבדיקות FP16 שנמדדו על RTX 4090, ‏vLLM השיג את ה‑throughput המתמשך הגבוה ביותר תחת עומס מקבילי, והגיע לכ‑185 עד 215 tokens לשנייה על פני שמונה זרמים. ‏TGI סיפק 150 עד 176 tokens לשנייה, בעוד Ollama הגיע לממוצע של 95 עד 108 tokens לשנייה באותם תנאים."

  - question: "האם vLLM משתמש ביותר VRAM מאשר Ollama או TGI?"
    answer: "‏vLLM השתמש בכ‑20 עד 22GB של VRAM בעת הרצת Llama-3.1-8B ב‑FP16. ‏TGI צרך טווח דומה של 21 עד 23GB. ‏Ollama השתמש בפחות VRAM, לרוב בין 14 ל‑17GB, אך לא השיג את אותו throughput תחת עומס מקבילי."

  - question: "האם Ollama מתאים ל‑Inference בסביבת production?"
    answer: "‏Ollama מתאים לסביבות פיתוח ולכלים פנימיים עם רמת concurrency נמוכה. בבדיקות הוא לא התרחב ביעילות כמו vLLM או TGI תחת שמונה זרמי בקשות במקביל. עבור APIs ב‑production עם תעבורה מתמשכת, שרת שמותאם ל‑continuous batching יהיה לרוב יעיל יותר."

  - question: "כמה עולה להריץ Inference של Llama-3.1-8B על RTX 4090?"
    answer: "בתעריף שכירות ממוצע של כ‑0.45 דולר לשעה, יצירת 500,000 tokens באמצעות vLLM דרשה כ‑41 עד 42 דקות ריצה ועלתה כ‑0.31 דולר. שימוש ב‑Ollama עבור אותו עומס דרש כ‑83 עד 84 דקות ועלות של כ‑0.63 דולר. העלויות בפועל משתנות בהתאם לעומס ולמחיר השכירות."

  - question: "אילו הגדרות prompt ו‑generation שימשו ב‑benchmark הזה?"
    answer: "ה‑benchmark השתמש ב‑prompt קלט של 512 tokens והפיק 128 tokens לכל בקשה באמצעות greedy decoding כאשר temperature הוגדר לאפס. כל המדידות בוצעו לאחר warm‑up של המודל, עם שמונה זרמי בקשות במקביל וללא speculative decoding."

  - question: "האם ניתן לשחזר את בדיקת ה‑RTX 4090 הזו בעצמי?"
    answer: "כן. המאמר כולל מפרטי חומרה, גרסת CUDA, גרסת דרייבר, פרמטרי decoding והגדרות concurrency. על ידי פריסה של Llama-3.1-8B ב‑FP16 על RTX 4090 יחיד והתאמת אורך ה‑prompt והגדרות ה‑concurrency, ניתן לשחזר תוצאות דומות."
---

````

הרצת המודל שלך היא רק חצי מהמשוואה.

לאחר השלמת ה‑fine‑tuning — כפי שמפורט ב‑[מדריך ל‑Fine‑Tuning פרטי של LLM](/he/private-llm-fine-tuning-guide) — ההחלטה הבאה היא תפעולית: כיצד מגישים את המודל בצורה יעילה?

Inference קובע:

- עלות לכל token
- latency תחת עומס
- יעילות ניצול ה‑GPU
- האם חומרה צרכנית מתאימה ל‑production

ה‑benchmark הזה משווה בין שלושה סטאקים נפוצים ל‑Inference:

- Ollama
- vLLM
- Hugging Face Text Generation Inference (TGI)

המטרה איננה העדפה.
המטרה היא מדידה.

---

## סביבת הבדיקה

**חומרה**

- GPU: NVIDIA RTX 4090 (24GB VRAM)
- CPU: מעבד צרכני 16 ליבות מסדרת Ryzen
- זיכרון: 64GB DDR5
- אחסון: NVMe SSD
- CUDA: 12.1
- NVIDIA Driver: 550+

**מודל**

- `meta-llama/Llama-3.1-8B`
- דיוק: FP16 (ללא quantization של 4‑bit)
- חלון הקשר: 4096 tokens

**תנאי ה‑benchmark**

- prompt קלט של 512 tokens
- יצירת 128 tokens בפלט
- Greedy decoding (temperature = 0)
- ללא speculative decoding
- ללא tensor parallelism
- warm start בלבד (המודל נטען מראש לפני המדידה)
- 8 זרמי בקשות במקביל (כאשר נתמך)

כל הבדיקות בוצעו על מערכת נקייה ללא עומסי רקע.
כל מדידה משקפת ממוצע של חמש ריצות.

---

![טרמינל המציג מדדי benchmark של Inference על RTX 4090](../_images/rtx4090-inference-terminal-results.png)

---

# תוצאות

## 1. Ollama

‏Ollama מתמקד בפשטות. ההתקנה מינימלית, והמודלים יורדים אוטומטית.

```bash
ollama run llama3
````

יש שליטה מוגבלת בהתנהגות batching או באסטרטגיית התזמון.

### ביצועים נמדדים (RTX 4090, FP16)

- **throughput בזרם יחיד:** 62–74 tokens/sec
- **throughput ב‑8 זרמים:** 95–108 tokens/sec
- **latency ל‑token ראשון:** 720–980 ms
- **שימוש ב‑VRAM:** 14–17GB

### תצפיות

- ניצול ה‑GPU השתנה תחת עומס מקבילי.
- ההתרחבות לא הייתה ליניארית מעבר ל‑4 זרמים.
- אין שליטה מתקדמת על אופטימיזציית batching.

‏Ollama מתאים לפיתוח מקומי ולשירותים עם תעבורה נמוכה. תחת עומס מקבילי מתמשך, הוא אינו ממלא את ה‑GPU במלואו.

---

## 2. vLLM

‏vLLM תוכנן למקסימום throughput. יישום PagedAttention שלו משפר את יעילות ה‑KV cache תחת בקשות מקביליות.

התקנה:

```bash
pip install vllm
```

הרצה:

```bash
python -m vllm.entrypoints.openai.api_server \
  --model meta-llama/Llama-3.1-8B \
  --dtype float16
```

### ביצועים נמדדים (RTX 4090, FP16)

- **throughput בזרם יחיד:** 92–104 tokens/sec
- **throughput ב‑8 זרמים:** 185–215 tokens/sec
- **latency ל‑token ראשון:** 360–480 ms
- **שימוש ב‑VRAM:** 20–22GB

### תצפיות

- ניצול ה‑GPU נשאר מעל 95% תחת עומס.
- continuous batching שיפר את יעילות ההתרחבות.
- ה‑latency נשאר יציב בין זרמים מקביליים.

‏vLLM השיג את ה‑throughput המתמשך הגבוה ביותר לשעת שכירות.

---

## 3. Hugging Face Text Generation Inference (TGI)

‏TGI הוא שרת Inference מבוסס קונטיינר ל‑production.

```bash
docker run --gpus all \
  -p 8080:80 \
  ghcr.io/huggingface/text-generation-inference:latest \
  --model-id meta-llama/Llama-3.1-8B
```

### ביצועים נמדדים (RTX 4090, FP16)

- **throughput בזרם יחיד:** 78–88 tokens/sec
- **throughput ב‑8 זרמים:** 150–176 tokens/sec
- **latency ל‑token ראשון:** 510–690 ms
- **שימוש ב‑VRAM:** 21–23GB

### תצפיות

- ביצועים עקביים וצפויים.
- scaling טוב יותר מ‑Ollama אך נמוך מ‑vLLM.
- overhead תפעולי גבוה יותר עקב סביבת קונטיינר.

‏TGI מספק בקרות production וניטור, אך אינו ממקסם את ה‑throughput של RTX 4090 יחיד.

---

![פלט nvidia-smi המציג ניצול GPU בזמן Inference מקבילי](../_images/rtx4090-nvidia-smi-inference-load.png)

---

# השוואה ישירה

| Stack  | זרם יחיד   | 8 זרמים     | token ראשון | VRAM    | רמת ניצול GPU |
| ------ | ---------- | ----------- | ----------- | ------- | ------------- |
| Ollama | 62–74 t/s  | 95–108 t/s  | 720–980ms   | 14–17GB | חלקי          |
| TGI    | 78–88 t/s  | 150–176 t/s | 510–690ms   | 21–23GB | גבוה          |
| vLLM   | 92–104 t/s | 185–215 t/s | 360–480ms   | 20–22GB | גבוה מאוד     |

# השלכות עלות על GPUs מבוזרים

בשוקי GPU מבוזרים, השכרת RTX 4090 נעה בממוצע סביב 0.40–0.50 דולר לשעה, בהתאם לביקוש. לפירוט מלא ראו:

- [השוואת מחירי השכרת GPU לשנת 2026](/he/gpu-rental-pricing-comparison-2026)
- [עמלות נסתרות בהשכרת GPU](/he/hidden-fees-in-gpu-rental)

נניח:

- 0.45 דולר לשעה
- יצירת 500,000 tokens
- 8 זרמים במקביל

בהתבסס על ה‑throughput החציוני שנמדד:

**vLLM (~200 tokens/sec)**  
500,000 / 200 = 2,500 שניות ≈ 41–42 דקות  
עלות ≈ 0.31 דולר

**Ollama (~100 tokens/sec)**  
500,000 / 100 = 5,000 שניות ≈ 83–84 דקות  
עלות ≈ 0.63 דולר

הפער אינו דרמטי בבידוד.  
בהיקפים גדולים הוא מצטבר.

ב‑50 מיליון tokens ליום, יעילות ה‑throughput משפיעה ישירות על גודל צי ה‑GPU ועל משך ההשכרה.

## הרצת ה‑benchmark בעצמך

אם ברצונך לשחזר את המדידות ללא רכישת חומרה, לרוב ניתן למצוא שרתי RTX 4090 דרך זירת המסחר של GPUFlow.

השרתים מושכרים לפי שעה וזמינים מיידית לאחר חיבור ארנק. אין עיכובי אישור חשבון, אין חוזים ארגוניים ואין זמני הקצאה ממושכים.

ניתן לעיין ב‑GPUs הזמינים ב‑[GPU Flow](https://gpuflow.app)

מאחר והחיוב הוא לפי שעה, יעילות ה‑Inference משפיעה ישירות על העלות. ההבדל בין 100 tokens/sec ל‑200 tokens/sec הופך משמעותי בעומסי עבודה מתמשכים.

---

# הקשר פריסה

אם אתה שוכר GPUs מבוזרים — כפי שמתואר ב:

- [כיצד לשכור GPU ללא KYC](/he/how-to-rent-gpu-without-kyc)
- [השכרת GPU באמצעות קריפטו](/he/rent-gpu-with-crypto)
- [הסבר על Escrow בחוזים חכמים](/he/smart-contract-escrow)

— יעילות ה‑Inference קובעת ישירות את יעילות ההון.

ה‑throughput משפיע על:

- משך זמן ה‑escrow
- תדירות הסליקה ב‑blockchain
- חשיפה לחוסר יציבות של המארח
- מרווח תפעולי

GPUs צרכניים נותרים כדאיים כלכלית עבור מודלים בגודל 7B–8B כאשר הם משולבים עם סטאק Inference יעיל.

---

# מתי להשתמש בכל אפשרות

**Ollama**

- כלים פנימיים
- רמת concurrency נמוכה
- אבטיפוס מהיר

**TGI**

- סביבות מבוססות קונטיינרים
- צוותים הזקוקים ל‑logging מובנה
- פריסות production מנוהלות

**vLLM**

- שירותי API
- concurrency גבוה
- מקסימום tokens לכל דולר

---

# סיכום

על RTX 4090 יחיד שמריץ Llama‑3.1‑8B ב‑FP16:

- ‏vLLM השיג את ה‑throughput המתמשך הגבוה ביותר.
- ‏TGI סיפק ביצועים מאוזנים עם בקרות production.
- ‏Ollama העדיף פשטות על פני ניצול מקסימלי של ה‑GPU.

בחירת סטאק Inference אינה קוסמטית.  
היא מגדירה את מבנה העלויות ואת דפוסי ההתרחבות.

בעומסי עבודה על GPUs צרכניים מבוזרים, יעילות batching משפיעה באופן מהותי על הכלכלה.

# היכן להריץ זאת בפרודקשן

כל ה‑benchmarks במאמר זה בוצעו על חומרה צרכנית מושכרת ולא על תשתית בבעלות.

אם נדרש לך גישה מיידית ל‑RTX 4090, ‏RTX 3090 או GPUs עם זיכרון גדול יותר לצורך Inference או fine‑tuning, ניתן למצוא שרתים זמינים ב‑[GPU Flow](https://gpuflow.app)

## השכרה לפי שעה. תשלום באמצעות stablecoin. גישה מיידית לאחר חיבור הארנק.

### משאבים קשורים

**העמק את הידע בסטאק הפריסה שלך:**

- [המדריך המקיף ל‑Fine‑Tuning פרטי של LLM על GPUs מבוזרים](/he/private-llm-fine-tuning-guide) — מדריך מלא לאימון מודלים בעלי משקלים פתוחים בצורה מאובטחת
- [השוואת מחירי השכרת GPU לשנת 2026](/he/gpu-rental-pricing-comparison-2026) — הבדלי עלויות שנמדדו בין פלטפורמות השכרה מובילות
- [עמלות נסתרות בהשכרת GPU](/he/hidden-fees-in-gpu-rental) — מה שדפי תמחור לפי שעה אינם חושפים
- [השוואה בין RunPod ל‑Vast.ai](/he/runpod-vs-vastapi-comparison) — הבדלים בין תשתית ריכוזית לזירת מסחר
