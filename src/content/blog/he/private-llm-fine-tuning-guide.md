---
title: "המדריך האולטימטיבי ל‑Fine-Tuning פרטי של LLM על גבי GPUs מבוזרים"
description: "מדריך מקיף ל‑fine-tuning של מודלי שפה עם משקלים פתוחים באמצעות מאגר הנתונים שלך והשכרת GPUs מבוזרים. אבטח את הנתונים, צמצם עלויות חישוב ושמור על פרטיות מלאה ללא KYC וללא תלות בספק."
excerpt: "למד כיצד לבצע fine-tuning ל‑LLMs עם משקלים פתוחים על GPUs מבוזרים בפרטיות מלאה. מדריך שלב אחר שלב להעברת נתונים מאובטחת, אימון QLoRA וניקוי סביבת העבודה."
pubDate: 2025-02-23
updatedDate: 2025-02-23
locale: "he"
category: "tutorials"
featured: true
draft: false
author: "GPUFlow Team"
heroImage: "../_images/secure-server-room-abstract.png"
heroImageAlt: "ייצוג מופשט של חדר שרתים מבוזר ומאובטח המעבד נתוני בינה מלאכותית בתאורה כחולה"
faq:
  - question: "Can I fine-tune large language models on a single RTX 4090?"
    answer: "Yes. Using QLoRA (Quantized Low-Rank Adaptation), models up to 8B parameters fit comfortably within 24GB of VRAM. This tutorial demonstrates exactly how to configure the training script for consumer hardware with specific parameters for batch size, sequence length, and LoRA rank."
  - question: "Is my dataset secure on a decentralized GPU rental?"
    answer: "Your dataset is as secure as your operational practices. This guide covers encrypted transfer via SCP, avoiding cloud storage intermediaries like S3 or Google Drive, and sanitizing the remote machine after training completes. The decentralized model means no single corporation has access to your data or training logs."
  - question: "How much does it cost to fine-tune an 8B model on decentralized GPUs?"
    answer: "A typical fine-tuning run on an 8B parameter model using an RTX 4090 rental costs between three and eight dollars depending on dataset size and training epochs. This compares to approximately 150 to 300 dollars for equivalent compute on AWS or Lambda Labs including setup time and idle charges."
  - question: "Do I need to complete KYC to rent GPU compute for training?"
    answer: "No. Decentralized GPU marketplaces like GPUFlow allow you to connect a crypto wallet and begin renting immediately. There is no identity verification, no credit card required, and no enterprise contract. Payments occur through stablecoins on networks like Polygon."
  - question: "What dataset format does the training script expect?"
    answer: "The script expects a JSONL file where each line contains a JSON object with a text field. The text field should contain your instruction, input, and response formatted as a single string with newline characters. An example with proper formatting is provided in Step 4 of this guide."
  - question: "Does this tutorial work for models other than Llama?"
    answer: "Yes. The workflow applies to any open-weights model including Mistral, Qwen, Falcon, and others. The code example uses Llama-3.1-8B but you only need to change the model identifier to fine-tune a different base model."
  - question: "How long does fine-tuning an 8B parameter model take?"
    answer: "Training time depends on dataset size. A typical run with 1,000 examples completes in 30 to 60 minutes on an RTX 4090. Larger datasets scale approximately linearly. A 10,000 example dataset requires 5 to 10 hours of compute time."
  - question: "What should I do with the remote machine after training completes?"
    answer: "You must sanitize the environment by deleting your dataset, training code, Hugging Face cache, and bash history. This guide provides specific commands for secure deletion including optional use of shred for thorough file destruction before ending your rental contract."
---

אם אתה קורא זאת, סביר להניח שברשותך מאגר נתונים שאינך יכול — או אינך מוכן — להעלות ל‑OpenAI.

אינך לבד. עבור ארגונים רבים ומפתחים עצמאיים, הנוחות של ChatGPT מתגמדת מול סיכון בלתי מתקבל על הדעת של דליפת מידע. בין אם מדובר ברשומות רפואיות הכפופות ל‑HIPAA, בסיסי קוד קנייניים המייצגים שנים של השקעה הנדסית, או מודלים פיננסיים רגישים היכולים להשפיע על שווקים — שימוש ב‑AI בענן פירושו להפקיד את הקניין הרוחני היקר ביותר שלך בידי צד שלישי.

כאשר אותו צד שלישי הוא תאגיד טכנולוגי בעל היסטוריה של שימוש בנתוני לקוחות לאימון מודלים עתידיים, המילה "אמון" נעשית בעייתית.

הפתרון אינו לוותר על AI. הפתרון הוא לשלוט בתשתית.

ביצוע fine-tuning למודלים עם משקלים פתוחים על חומרה שבשליטתך כבר אינו תחום אקדמי נישתי. זהו צורך עסקי עבור ארגונים המודעים לפרטיות. מודלים כמו Llama, Mistral, Qwen ועשרות אחרים זמינים לשימוש מסחרי ללא עמלות API וללא דרישה לשיתוף נתונים. האתגר היה מאז ומתמיד גישה למשאבי חישוב. רכישת אשכולות NVIDIA H100 דורשת השקעה של מיליוני דולרים. השכרה דרך AWS מחייבת אימות זהות, הסכמים ארגוניים ותעריפים שעתיים ההופכים אימונים ממושכים ליקרים באופן בלתי סביר.

מדריך זה מציג נתיב שלישי. תלמד כיצד לבצע fine-tuning למודל שפה עם משקלים פתוחים באמצעות השכרת GPUs מבוזרים — חומרה בבעלות אנשים פרטיים ברחבי העולם, הנגישה דרך שוק peer‑to‑peer. נסקור את הקמת סביבת העבודה, פרוטוקולי האבטחה הנדרשים בעת עבודה על צמתים ציבוריים, ואת ביצוע תהליך האימון המלא.

דוגמאות הקוד משתמשות ב‑Llama‑3.1‑8B כהפניה קונקרטית, אך תהליך העבודה חל באותו אופן על כל מודל התואם ל‑Hugging Face. החלף את מזהה המודל ותוכל לבצע fine-tuning ל‑Mistral‑7B, Qwen2‑7B או כל מודל עם משקלים פתוחים המתאים למקרה השימוש שלך.

תוכל לבצע זאת ללא אימות KYC, ללא חוזים ארוכי טווח, ובעלות שהיא שבריר ממה שגובות פלטפורמות ענן מסורתיות.

![חלון טרמינל המציג חיבור SSH פעיל לשרת GPU מרוחק](../_images/terminal-ssh-connection.png)

## הכלכלה של Fine-Tuning פרטי

לפני שניגש ליישום הטכני, יש להבין את ההקשר הכלכלי.

אימון מודל ב‑AWS מחייב התמודדות עם מחסור במופעים. המופע p4d.24xlarge (עם 8 GPUs מסוג A100) עולה 32.77 דולר לשעה — כאשר ניתן בכלל להשיגו. Lambda Labs מציעה תמחור טוב יותר, אך מפעילה רשימות המתנה הנמשכות שבועות. שתי הפלטפורמות מחייבות כרטיס אשראי, אימות זהות ומפיקות רישומי חיוב מפורטים הקושרים את פעילות ה‑AI שלך לזהותך המשפטית.

בשוק מבוזר אתה שוכר כוח חישוב ישירות מבעלי החומרה. זוהי תשתית peer‑to‑peer הפועלת על גבי מערכות תשלום מבוססות בלוקצ'יין. המשמעויות ברורות:

**הפחתת עלויות:** RTX 4090 מושכרת לרוב בין 0.40 ל‑0.60 דולר לשעה בפלטפורמות מבוזרות. עבור מודלים בני 8 מיליארד פרמטרים באמצעות QLoRA, כרטיס יחיד עם 24GB VRAM מסוגל להשלים תהליך fine‑tuning בתוך שעתיים עד שש שעות, בהתאם לגודל הדאטה. עלות החישוב הכוללת נעה בין שלושה לשמונה דולרים.

**פרטיות מובנית בארכיטקטורה:** התשלומים מתבצעים באמצעות [עסקאות stablecoin](/he/stable-coins-are-the-smartest-way-to-pay-for-gpu-rental) ברשתות כגון Polygon. אין כרטיס אשראי המקשר את זהותך להשכרה. חוזה חכם מנהל את מנגנון ה‑escrow, כפי שמוסבר ב‑[תיעוד ה‑smart contract escrow שלנו](/he/smart-contract-escrow), ומבטיח שאף צד אינו יכול לרמות את האחר.

**ללא שומרי סף:** אינך זקוק לאישור מצוות מכירות ארגוני. אינך חותם על מדיניות שימוש המעניקה לספק זכות לעיין בעומסי העבודה שלך. אתה מחבר ארנק ומתחיל לשכור חומרה.

לשם השוואה: תהליך fine‑tuning דומה ב‑AWS באמצעות מופע A10G יחיד (האופציה הזולה ביותר עם VRAM מספק) עולה כ‑1.50 דולר לשעה. כאשר מביאים בחשבון זמן הקמה, חישוב לא פעיל במהלך ההגדרה והיעדר אפשרות לתשלום אנונימי, העלות האמיתית מתקרבת ל‑150–300 דולר עבור מה שניתן לבצע בפחות מעשרה דולרים בתשתית מבוזרת.

ניתוח מפורט מופיע ב‑[השוואת מחירי השכרת GPU לשנת 2026](/he/gpu-rental-pricing-comparison-2026).

## דרישות מוקדמות

מדריך זה מניח היכרות עם שורת הפקודה בלינוקס. אין צורך בתואר מתקדם בלמידת מכונה, אך עליך להיות נוח בניווט במערכת קבצים, בעריכת קבצי טקסט ובהבנת הודעות שגיאה.

**דרישות חומרה:**

- **GPU:** מינימום 24GB VRAM. RTX 3090, RTX 4090 ו‑A10G מתאימים. עבור מודל בן 70 מיליארד פרמטרים נדרשים 48GB ומעלה (A6000, זוג A100 או H100).
- **זיכרון מערכת:** 32GB ומעלה. תהליך טעינת המודל מציב את המשקלים בזיכרון המערכת לפני העברתם ל‑GPU.
- **אחסון:** לפחות 100GB SSD מסוג NVMe. משקלי הבסיס של Llama‑3 8B תופסים כ‑16GB. הדאטה, ה‑checkpoints וה‑adapter המתקבל מוסיפים נפח נוסף.

**הערה לגבי בחירת מודל:** מדריך זה משתמש ב‑Meta Llama‑3.1‑8B כדוגמה, משום שהוא מייצג את מחלקת המודלים הגדולה ביותר הנכנסת ל‑GPU יחיד של 24GB עם כימות QLoRA. משפחת Llama כוללת כעת גם את Llama 4 Scout ו‑Maverick, המשתמשים בארכיטקטורת Mixture of Experts עם 109B ו‑400B פרמטרים בהתאמה, ודורשים תצורות multi‑GPU החורגות מהיקף השכרה של צומת יחיד. התהליך המתואר כאן תקף באותה מידה ל‑Mistral‑7B, Qwen2‑7B, Gemma‑2‑9B ולכל מודל תואם Hugging Face המתאים למגבלות ה‑VRAM של החומרה ששכרת.

**דרישות תוכנה:**

- Python 3.10 ומעלה
- היכרות בסיסית עם PyTorch
- חשבון Hugging Face (נדרש להורדת מודלים מוגבלים כגון Llama הדורשים אישור רישיון)
- ארנק קריפטו (MetaMask או מקביל) עם USDC או MATIC ברשת Polygon

אם טרם הגדרת ארנק לצורך השכרת GPU מבוזרת, השלם תחילה את [מדריך ההגדרה של MetaMask ו‑Polygon להשכרת GPU](/he/setting-up-metamask-polygon-gpu-rental). התהליך אורך כחמש‑עשרה דקות.

## שלב 1: אבטחת צומת החישוב שלך

השלב הראשון הוא השגת חומרה. בפלטפורמות ענן מרכזיות, המשמעות היא יצירת חשבון, העלאת מסמכי זיהוי, המתנה לאישור והוספת אמצעי תשלום. כאן התהליך ישיר יותר.

גש לשוק של GPUFlow. חבר את הארנק שלך באמצעות הכפתור בפינה הימנית העליונה. הממשק מציג מכונות זמינות עם מפרטים, תעריף שעתי ודירוג אמינות.

סנן לפי הקריטריונים הבאים:

- **GPU:** ‏RTX 4090 (24GB VRAM) או RTX 6000 Ada (48GB VRAM)
- **RAM:** לפחות 32GB
- **אחסון:** 100GB ומעלה זמינים
- **אמינות:** ציון זמינות של 95% ומעלה

בחר צומת והתחל את ההשכרה. החוזה החכם יבקש פיקדון המכסה את השימוש המשוער שלך. ניתן לעיין בהסבר המלא על מנגנון זה ב‑[הסבר מנגנון ה‑smart contract escrow](/he/smart-contract-escrow).

**שיקולי אבטחה בעבודה עם צמתים ציבוריים:**

כאשר אתה שוכר מכונה ברשת מרוחקת, אתה ניגש לחומרה שבבעלות ובשליטה פיזית של אדם זר. שכבת הווירטואליזציה מספקת בידוד משמעותי, אך עליך לפעול בזהירות:

1. **אל תאחסן מפתחות פרטיים במכונה המרוחקת.** הארנק שלך, מפתחות SSH למערכות אחרות וטוקני API לסביבות ייצור אינם צריכים להימצא על צומת שכור.

2. **התייחס למערכת הקבצים כאל עוינת.** הנח שכל קובץ שנכתב לדיסק עשוי תאורטית להיות משוחזר לאחר סיום ההשכרה. נעסוק במחיקה מאובטחת בשלב 6.

3. **הצפן נתונים רגישים במהלך ההעברה.** נרחיב על כך בשלב 3.

4. **אל תעשה שימוש חוזר בסיסמאות.** אם סופקו פרטי גישה ברירת מחדל, החלף אותם מיד או צור זוג מפתחות SSH חדש.

לאחר אישור ההשכרה, לוח הבקרה יספק פרטי התחברות. תקבל פקודת SSH דומה לזו:

```bash
ssh -p 22345 user@203.0.113.42
```

פתח טרמינל מקומי והרץ את הפקודה. אשר את טביעת האצבע של השרת כאשר תתבקש. כעת אתה מחובר לצומת ה‑GPU ששכרת.

ודא שהחומרה תואמת להזמנה:

```bash
nvidia-smi
```

הפלט אמור להציג את ה‑GPU, קיבולת הזיכרון וגרסת הדרייבר. אם המפרט אינו תואם, התנתק מיד ודווח על אי‑התאמה דרך מנגנון היישוב סכסוכים של הפלטפורמה.

## שלב 2: הגדרת הסביבה

לאחר שהחיבור אומת, העדיפות הבאה היא יצירת סביבת Python נקייה ומבודדת. רוב הצמתים כוללים דרייברים של NVIDIA ו‑CUDA מותקנים מראש, אך שימוש בספריות מערכת עלול ליצור התנגשויות תלויות.

ניצור סביבה וירטואלית:

```bash
mkdir ~/llama3-finetune
cd ~/llama3-finetune
python3 -m venv venv
source venv/bin/activate
```

ה‑prompt אמור להציג כעת `(venv)`.

לפני התקנת חבילות, ודא ש‑CUDA נגיש:

```bash
nvcc --version
```

רשום את גרסת CUDA. ברוב המקרים תראה 11.8 או 12.1. אם `nvcc` אינו מזוהה:

```bash
source /etc/profile.d/cuda.sh
```

כעת התקן את PyTorch בהתאם לגרסת CUDA שלך. לדוגמה, עבור CUDA 12.1:

```bash
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121
```

לאחר מכן התקן את הספריות הנדרשות ל‑fine‑tuning יעיל:

```bash
pip install transformers==4.40.0 datasets==2.19.0 peft==0.10.0 bitsandbytes==0.43.1 trl==0.8.6 accelerate==0.29.0
```

**קיבוע גרסאות חשוב.** מערכת Hugging Face משתנה במהירות, והתקנות ללא ציון גרסה מדויקת מובילות לעיתים קרובות לשבירות לא צפויות.

לבסוף, התחבר ל‑Hugging Face. משקלי Llama‑3 מוגבלים מאחורי הסכם רישוי. היכנס ל‑[Hugging Face](https://huggingface.co) ואשר את תנאי הרישיון. לאחר מכן צור access token דרך הגדרות החשבון שלך.

```bash
huggingface-cli login
```

הדבק את הטוקן כאשר תתבקש. הוא יישמר ב‑`~/.cache/huggingface/token`.

![קוד Python מוצג בטרמינל עם פרמטרי תצורה של מודל Llama-3](../_images/python-llama3-config.png)

## שלב 3: העברת נתונים מאובטחת

זו הסיבה המרכזית לכך שאתה שוכר משאבי חישוב מבוזרים ולא משתמש ב‑API: ריבונות נתונים.

הזרימה המקובלת בענן היא העלאת הדאטה ל‑S3, Google Cloud Storage או Azure Blob, ולאחר מכן הורדתו למכונת החישוב. כך נוצרים מספר עותקים של מידע רגיש במערכות שאינך שולט בהן.

נעקוף זאת באמצעות העברה מוצפנת ישירה.

פתח **חלון טרמינל חדש** במחשב המקומי שלך (אל תסגור את חיבור ה‑SSH הקיים), והריץ:

```bash
scp -P 22345 /path/to/your/dataset.jsonl user@203.0.113.42:~/llama3-finetune/
```

הדגל `-P` מציין את מספר הפורט.

עבור קבצים גדולים מ‑1GB, שקול דחיסה:

```bash
# במחשב המקומי
gzip -k dataset.jsonl
scp -P 22345 dataset.jsonl.gz user@203.0.113.42:~/llama3-finetune/

# בצומת המרוחק
cd ~/llama3-finetune
gunzip dataset.jsonl.gz
```

לשכבת אבטחה נוספת, ניתן להצפין מראש באמצעות `age`:

```bash
# במחשב המקומי
age -p dataset.jsonl > dataset.jsonl.age
scp -P 22345 dataset.jsonl.age user@203.0.113.42:~/llama3-finetune/

# בצומת המרוחק
age -d dataset.jsonl.age > dataset.jsonl
rm dataset.jsonl.age
```

פרוטוקול SSH משתמש בהצפנת AES‑256. עבור רוב המשתמשים, זה מספק רמת הגנה מספקת.

## שלב 4: סקריפט ה‑Fine-Tuning

נשתמש במחלקת `SFTTrainer` מתוך ספריית TRL לביצוע fine‑tuning מונחה.

**דרישות פורמט הדאטה:**

הסקריפט מצפה לקובץ JSONL שבו כל שורה מכילה אובייקט JSON עם שדה `text`.

דרישות קריטיות:

1. כל אובייקט JSON חייב להופיע בשורה אחת בלבד.
2. ירידות שורה בתוך השדה `text` חייבות להיות מסומנות כ‑`\n`.
3. גרשיים בתוך הטקסט חייבים להיות מסומנים כ‑`\"`.
4. הקובץ חייב להיות בקידוד UTF‑8.

אם הנתונים שלך בפורמט אחר (CSV, Parquet), יש להמירם לפני ההעברה.

צור את סקריפט האימון בצומת המרוחק:

```bash
cd ~/llama3-finetune
nano train.py
```

הדבק את קוד האימון המלא כפי שמופיע בגרסה המקורית (ללא שינוי מזהי מודלים או ספריות).

שמור את הקובץ וצא מהעורך.

להתחלת האימון:

```bash
python train.py
```

בהרצה הראשונה יורדו משקלי המודל (כ‑16GB עבור מודל 8B). הורדה זו מתבצעת פעם אחת בלבד. לאחר מכן תראה פלט הכולל ערכי loss כל מספר צעדים.

## שלב 5: ניטור תהליך האימון

בזמן שהסקריפט פועל, עליך לפקח על מצב ה‑GPU. אם ה‑VRAM מתמלא לחלוטין או שהטמפרטורה חוצה ספים בטוחים, התהליך עלול להיכשל — ולגרום לאובדן זמן השכרה ואולי גם לפגיעה ב‑checkpoints.

פתח חלון טרמינל נוסף במחשב המקומי שלך והתחבר שוב לצומת:

```bash
ssh -p 22345 user@203.0.113.42
```

הרץ את הפקודה הבאה לצפייה בסטטיסטיקות בזמן אמת:

```bash
watch -n 1 nvidia-smi
```

![טרמינל המציג פלט nvidia-smi עם שימוש בזיכרון GPU וסטטיסטיקות טמפרטורה](../_images/nvidia-smi-monitoring.png)

הפקודה מרעננת את התצוגה בכל שנייה ומציגה שימוש בזיכרון, אחוז ניצול GPU וטמפרטורה.

ב‑RTX 4090 עם ההגדרות המתוארות במדריך זה, בדרך כלל תראה:

- **שימוש בזיכרון:** בין 18GB ל‑22GB מתוך 24GB
- **ניצול GPU:** בין 90% ל‑100% במהלך צעדי אימון פעילים
- **טמפרטורה:** בין 60°C ל‑80°C, בהתאם לקירור של המארח

**פתרון תקלות נפוצות:**

**שימוש בזיכרון קרוב ל‑24GB:** הפחת את `BATCH_SIZE` ל‑2 או 1. לחלופין, הפחת את `MAX_SEQ_LENGTH` ל‑256. לאחר שינוי יש להפעיל את האימון מחדש.

**ניצול GPU קרוב ל‑0%:** לרוב מצביע על צוואר בקבוק בטעינת נתונים. במקרים כאלה, שקול לבצע עיבוד מקדים לפורמט יעיל יותר לפני ההעברה.

**טמפרטורה מעל 85°C:** ייתכן שהחומרה פועלת בתנאי קירור לא מספקים. במקרה כזה, שקול לסיים את ההשכרה ולבחור צומת אחר.

**פירוש ערכי ה‑loss:**

ערך ה‑loss מייצג את רמת השגיאה של המודל — נמוך יותר הוא טוב יותר.

בדרך כלל תראה:

- **loss התחלתי:** בין 1.5 ל‑3.0
- **מגמה:** ירידה הדרגתית במהלך מאות הצעדים הראשונים
- **loss סופי:** בין 0.5 ל‑1.5 בהרצה תקינה

אם ה‑loss אינו יורד כלל לאחר כ‑100 צעדים, ייתכן שקצב הלמידה נמוך מדי. אם הוא קופץ לערכים גבוהים או תנודתי באופן חריג, קצב הלמידה עשוי להיות גבוה מדי. ברירת המחדל `2e-4` מתאימה לרוב המקרים.

אימון עם כ‑1,000 דוגמאות יושלם בדרך כלל בתוך 30–60 דקות על RTX 4090. דאטה בגודל 10,000 דוגמאות ידרוש כ‑5–10 שעות, בקירוב ליניארי.

## שלב 6: הורדת המודל וניקוי הסביבה

לאחר סיום האימון, משקלי ה‑LoRA נשמרים בתיקייה שהוגדרה ב‑`OUTPUT_NAME`. מדובר ב‑adapter קטן יחסית (בדרך כלל בין 100MB ל‑500MB), ולא במודל הבסיס המלא.

ודא שהקבצים קיימים:

```bash
ls -la ~/llama3-finetune/llama-3-8b-custom/
```

אתה אמור לראות קבצים כגון `adapter_config.json`, ‏`adapter_model.safetensors` וקבצי tokenizer.

אל תמזג את ה‑adapter עם מודל הבסיס בצומת השכור. תהליך מיזוג דורש טעינה מלאה של המודל ב‑precision גבוה ועלול לחרוג ממגבלות הזיכרון. בצע מיזוג במכונה שבשליטתך, או טען את ה‑adapter יחד עם מודל הבסיס בזמן inference.

כדי להוריד את ה‑adapter למחשב המקומי, חזור לטרמינל המקומי והריץ:

```bash
scp -r -P 22345 user@203.0.113.42:~/llama3-finetune/llama-3-8b-custom ./
```

ודא שגודל הקבצים המקומיים תואם לגודל בצומת המרוחק.

**ניקוי הסביבה המרוחקת:**

כעת הצומת מכיל את הדאטה הקנייני שלך, קוד האימון ומשקלים שהורדו. השארת מידע זה על חומרה שאינך שולט בה אינה פרקטיקה מקצועית.

בצומת המרוחק, הרץ:

```bash
rm -rf ~/llama3-finetune
rm -rf ~/.cache/huggingface
rm -rf ~/.cache/pip
history -c
cat /dev/null > ~/.bash_history
sync
```

למחיקה יסודית יותר באמצעות `shred`:

```bash
find ~/llama3-finetune -type f -exec shred -u {} \;
rm -rf ~/llama3-finetune
```

לאחר מכן התנתק:

```bash
exit
```

גש ללוח הבקרה של GPUFlow וסיים רשמית את ההשכרה. החוזה החכם ישחרר את יתרת הפיקדון לארנק שלך, בניכוי זמן השימוש בפועל.

## הרצת Inference עם המודל שעברת עליו Fine-Tuning

דוגמה מינימלית להרצה מקומית:

```python
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer, BitsAndBytesConfig
from peft import PeftModel

bnb_config = BitsAndBytesConfig(
    load_in_4bit=True,
    bnb_4bit_quant_type="nf4",
    bnb_4bit_compute_dtype=torch.float16,
)

base_model = AutoModelForCausalLM.from_pretrained(
    "meta-llama/Meta-Llama-3-8B",
    quantization_config=bnb_config,
    device_map="auto",
)

model = PeftModel.from_pretrained(base_model, "./llama-3-8b-custom")
tokenizer = AutoTokenizer.from_pretrained("meta-llama/Llama-3.1-8B")

prompt = "### Instruction: Summarize the contract clause.\n\n### Input: The Licensee shall not reverse engineer, decompile, or disassemble the Software.\n\n### Response:"

inputs = tokenizer(prompt, return_tensors="pt").to("cuda")
outputs = model.generate(**inputs, max_new_tokens=100, temperature=0.7)
response = tokenizer.decode(outputs[0], skip_special_tokens=True)

print(response)
```

לפריסה בסביבת ייצור, ניתן לעטוף תהליך זה ב‑API באמצעות FastAPI או Flask, או להשתמש בשרת inference כגון vLLM או Text Generation Inference (TGI).

## סיכום

ביצעת fine‑tuning למודל שפה מתקדם על גבי נתונים קנייניים, מבלי לחשוף אותם לגורם חיצוני. ללא חוזה ארגוני. ללא אימות זהות. ללא תלות ב‑API סגור.

בהנחה של הרצה בת שעתיים על RTX 4090 במחיר של 0.45 דולר לשעה, העלות הכוללת היא פחות מדולר אחד. תהליך מקביל ב‑AWS עשוי לעלות בין 100 ל‑200 דולר, לאחר חישוב זמן הקמה וחיובים נלווים.

חשוב מכך — השליטה בידיך. אין גוף מרכזי המתעד את פעילות האימון שלך ומקשר אותה לזהותך. אין תנאי שימוש המעניקים לספק זכות לעיין בדאטה שלך.

עידן התלות ב‑API סגור הולך ומצטמצם. ארגונים הזקוקים לפרטיות, חוקרים המעריכים ריבונות, ומפתחים שאינם מעוניינים בפיקוח — יכולים לפעול אחרת.

המודל שעברת עליו fine‑tuning מצוי כעת בתשתית שבשליטתך. ההחלטות לגבי פריסה, גישה ושימוש הן שלך בלבד.

---

## לקריאה נוספת

**עלויות ותשלומים:**

- [GPU Rental Pricing Comparison 2026](/he/gpu-rental-pricing-comparison-2026)
- [Stablecoins Are the Smartest Way to Pay for GPU Rental](/he/stable-coins-are-the-smartest-way-to-pay-for-gpu-rental)
- [How to Rent a GPU Without KYC](/he/how-to-rent-gpu-without-kyc)

**מנגנון הפלטפורמה:**

- [Setting Up MetaMask for Polygon GPU Rental](/he/setting-up-metamask-polygon-gpu-rental)
- [Smart Contract Escrow Explained](/he/smart-contract-escrow)
- [Hidden Fees in GPU Rental](/he/hidden-fees-in-gpu-rental)

**השוואות:**

- [RunPod vs Vast.ai Comparison](/he/runpod-vs-vastapi-comparison)
