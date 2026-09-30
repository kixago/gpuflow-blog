---
title: "אימון LoRA ל-Stable Diffusion בפחות מ-$10 על GPU שכור"
description: "אימון LoRA ל-SDXL או ל-Flux על RTX 4090 שכור בהרבה פחות מ-$10: בחירת GPU לפי VRAM, כיתובים, הגדרות ל-sd-scripts ול-ai-toolkit וחישוב עלות מלא."
excerpt: "הרצה אחת של LoRA ל-SDXL על RTX 4090 שכור עולה בערך $0.35 עד $0.80 בספטמבר 2026. איזה GPU לבחור, איך להכין את התמונות ולכתוב להן כיתובים, פקודת האימון המדויקת, ולאן הכסף הולך בפועל."
pubDate: 2026-02-11
updatedDate: 2026-09-30
locale: "he"
category: "tutorials"
featured: false
draft: false
author: "GPUFlow Team"
heroImage: "../_images/stable-diffusion-lora-training-guide.jpg"
heroImageAlt: "איור של אנשים סביב מסך גדול שמציג תרשים של רשת LoRA, ליד ארון שרתים ולוח שמשווה תמונות לדוגמה משני epochs של אימון"
faq:
  - question: "כמה עולה לאמן LoRA על GPU שכור?"
    answer: "בספטמבר 2026 אפשר היה לשכור RTX 4090 בכ-$0.31 לשעה ב-Vast.ai וב-$0.74 לשעה לפי דף התמחור של RunPod. סשן אימון של LoRA ל-SDXL, כ-65 דקות כולל הקמה ובדיקה, עולה לכן בערך $0.34 עד $0.80."
  - question: "כמה VRAM צריך כדי לאמן LoRA ל-SDXL?"
    answer: "לפי התיעוד של sd-scripts, אפשר לאמן LoRA ל-SDXL עם 8 GB של זיכרון GPU, ומומלץ 10 GB, אם מאמנים רק את ה-U-Net, שומרים ב-cache את ה-latents ואת הפלטים של ה-text encoder ומשתמשים ב-gradient checkpointing. כרטיס של 24 GB כמו RTX 3090 או 4090 מאפשר לאמן ב-1024x1024 בלי להיאבק במגבלות זיכרון."
  - question: "אפשר לאמן LoRA ל-Flux על RTX 4090?"
    answer: "כן. ai-toolkit מגיע עם קובצי הגדרות לדוגמה ל-FLUX.1 שנקראים על שם כרטיסים של 24 GB, ו-sd-scripts מפרט הגדרות ל-FLUX.1 עד 8 GB בעזרת block swapping. במדריך של Black Forest Labs עצמה כתוב שהרצת LoRA של 1,800 צעדים ל-FLUX.2 [klein] על RTX 4090 לוקחת פחות משעה."
  - question: "כמה תמונות צריך כדי לאמן LoRA?"
    answer: "לדמות, לחפץ או לסגנון אחד, הטווח המקובל הוא 15 עד 40 תמונות טובות; Black Forest Labs ממליצה על 15 עד 40 תמונות בעלות מראה אחיד ל-FLUX.2 [klein]. תמונות חדות, מגוונות ועם כיתובים טובים חשובות יותר מכמות גדולה."
  - question: "מה עדיף לאימון LoRA: kohya_ss, ‏OneTrainer או ai-toolkit?"
    answer: "שלושתם עובדים. sd-scripts של kohya הוא כלי הייחוס לשורת הפקודה, ו-kohya_ss מוסיף מעליו ממשק web; ל-OneTrainer יש ממשק דסקטופ ויצירת כיתובים מובנית; ל-ai-toolkit יש ממשק web, תבנית רשמית ל-RunPod ותמיכה מוקדמת במודלים חדשים כמו FLUX.2 ו-Qwen-Image."
  - question: "אפשר לאמן LoRA ב-GPUFlow?"
    answer: "לא. GPUFlow משכירה API צ'אט תואם OpenAI על GPU של ספק, בלי shell, בלי SSH ובלי גישה לקבצים, כך שאי אפשר להריץ שם סקריפט אימון. השתמשו בפלטפורמה שמשכירה לכם את המכונה, כמו Vast.ai או RunPod."
---

אימון LoRA ל-SDXL או למודל Flux קטן על GPU שכור עולה הרבה פחות מ-$10. בספטמבר 2026 אפשר לשכור RTX 4090 בכ-$0.31 לשעה ב-Vast.ai וב-$0.74 לשעה ב-RunPod, וסשן אחד של LoRA ל-SDXL, כולל הקמה ובדיקה, לוקח קצת יותר משעה. זה $0.34 עד $0.80 לניסיון, כך שתקציב של $10 מספיק לתריסר ניסיונות.

הכסף הוא לא החלק הקשה. התמונות, הכיתובים והידיעה מתי לעצור, הם כן. המדריך הזה מכסה את כל אלה, עם פקודות שאפשר להדביק. המחירים וגרסאות הכלים נבדקו בספטמבר 2026; המקורות בסוף.

## תהליך העבודה בחמישה שלבים

<figure>
<svg viewBox="0 0 720 250" role="img" aria-labelledby="d1-title" xmlns="http://www.w3.org/2000/svg" font-family="system-ui, sans-serif" font-size="15">
<title id="d1-title">תהליך אימון LoRA: דאטהסט, כיתובים, אימון, בדיקה ושימוש, עם חזרה לדאטהסט כשהתוצאות לא טובות</title>
<defs><marker id="d1-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#6366f1"/></marker></defs>
<rect width="720" height="250" fill="#ffffff"/>
<line x1="20" y1="40" x2="280" y2="40" stroke="#16a34a" stroke-width="2"/>
<text x="150" y="30" text-anchor="middle" fill="#16a34a" font-size="13" direction="rtl">חינם: על המחשב שלכם</text>
<line x1="300" y1="40" x2="560" y2="40" stroke="#f97316" stroke-width="2"/>
<text x="430" y="30" text-anchor="middle" fill="#f97316" font-size="13" direction="rtl">בתשלום: על ה-GPU השכור</text>
<rect x="20" y="60" width="120" height="70" rx="10" fill="#eef2ff" stroke="#6366f1" stroke-width="2"/>
<text x="80" y="90" text-anchor="middle" fill="#1e1b4b" font-weight="600" direction="rtl">דאטהסט</text>
<text x="80" y="112" text-anchor="middle" fill="#64748b" font-size="13" direction="rtl">15–40 תמונות</text>
<rect x="160" y="60" width="120" height="70" rx="10" fill="#eef2ff" stroke="#6366f1" stroke-width="2"/>
<text x="220" y="90" text-anchor="middle" fill="#1e1b4b" font-weight="600" direction="rtl">כיתובים</text>
<text x="220" y="112" text-anchor="middle" fill="#64748b" font-size="13" direction="rtl">‏.txt לכל תמונה</text>
<rect x="300" y="60" width="120" height="70" rx="10" fill="#eef2ff" stroke="#6366f1" stroke-width="2"/>
<text x="360" y="90" text-anchor="middle" fill="#1e1b4b" font-weight="600" direction="rtl">אימון</text>
<text x="360" y="112" text-anchor="middle" fill="#64748b" font-size="13">sd-scripts</text>
<rect x="440" y="60" width="120" height="70" rx="10" fill="#eef2ff" stroke="#6366f1" stroke-width="2"/>
<text x="500" y="90" text-anchor="middle" fill="#1e1b4b" font-weight="600" direction="rtl">בדיקה</text>
<text x="500" y="112" text-anchor="middle" fill="#64748b" font-size="13" direction="rtl">רשת דוגמאות</text>
<rect x="580" y="60" width="120" height="70" rx="10" fill="#eef2ff" stroke="#6366f1" stroke-width="2"/>
<text x="640" y="90" text-anchor="middle" fill="#1e1b4b" font-weight="600" direction="rtl">שימוש</text>
<text x="640" y="112" text-anchor="middle" fill="#64748b" font-size="13">ComfyUI, Forge</text>
<line x1="140" y1="95" x2="158" y2="95" stroke="#6366f1" stroke-width="2" marker-end="url(#d1-arrow)"/>
<line x1="280" y1="95" x2="298" y2="95" stroke="#6366f1" stroke-width="2" marker-end="url(#d1-arrow)"/>
<line x1="420" y1="95" x2="438" y2="95" stroke="#6366f1" stroke-width="2" marker-end="url(#d1-arrow)"/>
<line x1="560" y1="95" x2="578" y2="95" stroke="#6366f1" stroke-width="2" marker-end="url(#d1-arrow)"/>
<path d="M500,130 L500,180 L80,180 L80,134" fill="none" stroke="#f97316" stroke-width="2" stroke-dasharray="6 4" marker-end="url(#d1-arrow)"/>
<text x="290" y="205" text-anchor="middle" fill="#1e1b4b" font-size="13" direction="rtl">לא יצא טוב? תקנו את התמונות או את הכיתובים ואמנו שוב</text>
<text x="360" y="235" text-anchor="middle" fill="#64748b" font-size="13" direction="rtl">רוב האיכות מגיעה משתי התיבות הראשונות, שלא עולות כלום</text>
</svg>
<figcaption>הכינו את הדאטהסט ואת הכיתובים לפני שאתם שוכרים. ה-GPU מחויב רק על אימון ובדיקה, ותוצאה גרועה בדרך כלל מחזירה אתכם לתמונות, לא להגדרות.</figcaption>
</figure>

## מה זה LoRA ולמה זה זול

‏LoRA ‏(Low-Rank Adaptation) מקפיא את מודל הבסיס ומאמן שתי מטריצות קטנות לצד חלק מהשכבות שלו. המאמר המקורי דיווח על הקטנה של מספר הפרמטרים שמאומנים פי 10,000 ושל זיכרון ה-GPU פי 3, בהשוואה ל-fine-tuning מלא של GPT-3 175B. מודלי תמונה עובדים באותו אופן: ה-checkpoint של SDXL base הוא קובץ של 6.9 GB, וה-LoRA שאתם מאמנים הוא קובץ נפרד וקטן שטוענים מעליו בכל עוצמה שרוצים.

לכן GPU ביתי אחד מספיק, ולכן הרצה לוקחת עשרות דקות ולא ימים.

## בחירת GPU לפי VRAM

ה-VRAM קובע מה אפשר לאמן. המהירות קובעת כמה דקות בתשלום ההרצה תיקח, כך שכרטיס מהיר יותר שעולה יותר לשעה יכול לצאת בערך באותו מחיר להרצה.

| משפחת מודלים | מינימום מתועד | בנוחות | הערות |
| --- | --- | --- | --- |
| SD 1.5 | 8 GB | 12 GB ומעלה | מאמן ב-512x512, הכי זול והכי מהיר |
| SDXL | ‏8 GB ‏(מומלץ 10 GB) | 24 GB | רק U-Net, ‏latents ופלטי text encoder ב-cache |
| ‏FLUX.1 [dev] ‏(12B) | ‏8 GB עם block swapping כבד | 24 GB | ‏sd-scripts מפרט הגדרות ל-24, 16, 12, 10 ו-8 GB |
| FLUX.2 [klein] 4B/9B | לא צוין | 24 GB | ‏BFL: כ-13 GB של משקלים ב-bf16, הרצת LoRA נכנסת מתחת ל-24 GB |

ההגדרות ל-VRAM נמוך עובדות, אבל הן איטיות. החלפת בלוקים של ה-transformer בין ה-GPU לזיכרון המערכת היא הדרך שבה sd-scripts מכניס את FLUX.1 ל-8 עד 16 GB, וכל החלפה עולה זמן שאתם משלמים עליו. על מכונה שכורה, כרטיס של 24 GB הוא ברירת המחדל ההגיונית: RTX 3090 או 4090. גם RTX 5090 ‏(32 GB) עובד, אבל sd-scripts מציין שהוא צריך PyTorch 2.8.0 עם CUDA 12.8 או 12.9, אז בדקו שהתבנית שלכם מגיעה עם גרסאות עדכניות מספיק.

![כרטיס מסך ASUS TUF עם שלושה מאווררים, עומד על מדף לבן](../_images/test-hero.jpg)

כרטיסי דאטה סנטר מהירים יותר, אבל RunPod מציגה A100 80 GB ב-$1.59 לשעה, יותר מכפול מ-4090. ל-LoRA על 20 או 30 תמונות, המהירות הנוספת כמעט אף פעם לא מכסה את ההפרש; הם הגיוניים יותר לדאטהסטים גדולים או ל-fine-tuning מלא.

## איפה לשכור, וכמה זה עולה

צריך פלטפורמה שנותנת לכם מכונה: shell או מחברת Jupyter, דיסק ודרך להעתיק קבצים פנימה והחוצה. ‏Vast.ai ו-RunPod הן שתי הבחירות הנפוצות ביותר לעבודה כזו.

| GPU | VRAM | ‏Vast.ai (החל מ-) | דף התמחור של RunPod | הזול ביותר שנמדד ב-RunPod |
| --- | --- | --- | --- | --- |
| RTX 3090 | 24 GB | כ-$0.11–0.13 לשעה | ‏$0.50 לשעה | ‏$0.22 לשעה |
| RTX 4090 | 24 GB | כ-$0.31–0.33 לשעה | ‏$0.74 לשעה | ‏$0.34 לשעה |
| RTX 5090 | 32 GB | כ-$0.41–0.47 לשעה | ‏$0.99 לשעה | ‏$0.69 לשעה |

המחירים נכונים לספטמבר 2026. העמודות "Vast.ai (החל מ-)" ו"הזול ביותר שנמדד ב-RunPod" לקוחות ממעקב המחירים של getdeploying.com; העמודה האמצעית היא דף התמחור של RunPod עצמה. ב-Vast.ai המארחים קובעים את המחירים בעצמם, כך שההצעות שתראו ישתנו לפי מיקום וציון אמינות.

שתיהן מחייבות לפי שנייה. התוספות שונות, והן משפיעות על עבודה של שעה יותר ממה שהמחיר לשעה רומז:

- **Vast.ai** גובה על אחסון "כל עוד ה-instance שלכם קיים, בלי קשר למצב הריצה", וגובה על רוחב פס לפי בייט, בתעריף שכל מארח קובע. הורדה של מודל בסיס של 7 GB אצל מארח עם רוחב פס יקר מצטברת. מחקו את ה-instance, אל תסתפקו בעצירה שלו.
- **RunPod** גובה $0.10 ל-GB לחודש על container disk בזמן ריצה, כלום אחרי שעוצרים, ו-$0.20 ל-GB לחודש על volume disk עצור. היא לא גובה על העברת נתונים פנימה או החוצה.

לשתיהן יש תבניות מוכנות. המפתח של ai-toolkit מתחזק תבנית רשמית ל-RunPod, וה-README של kohya_ss מציין את RunPod כסביבה נתמכת. תבנית חוסכת עשר דקות או יותר של התקנת PyTorch על זמן בתשלום. להשוואת מחירים רחבה יותר, ראו [GPUFlow מול Vast.ai מול RunPod מול SaladCloud](/he/gpuflow-vs-vast-ai-vs-runpod/) ו[העלות האמיתית של השכרת GPU](/he/hidden-fees-in-gpu-rental/).

## הכנת הדאטהסט והכיתובים

את כל זה עושים על המחשב שלכם, לפני ששוכרים משהו.

### תמונות

- **כמות.** ‏15 עד 40 תמונות לאדם, לחפץ או לסגנון אחד. ‏Black Forest Labs ממליצה על "15–40 תמונות בעלות מראה אחיד" ל-FLUX.2 [klein]. יותר זה לא טוב יותר אם התמונות הנוספות חלשות יותר.
- **עקביות וגיוון.** כל תמונה חייבת להראות את הקונספט. כל השאר צריך להשתנות: זווית, תאורה, רקע, קומפוזיציה. אם כל תמונה של המוצר שלכם מצולמת על אותו שולחן לבן, ה-LoRA ילמד את השולחן.
- **איכות.** חדות, חשיפה נכונה, בלי סימני מים ובלי טקסט על התמונה. ה-LoRA לומד רעש ובלוקים של JPEG באותה נאמנות שהוא לומד כל דבר אחר.
- **רזולוציה.** לפחות 1024 פיקסלים בצלע הקצרה ל-SDXL ול-Flux, ו-512 ל-SD 1.5. לא צריך לחתוך לריבועים: כש-bucketing מופעל, ‏sd-scripts מקבץ תמונות לפי יחס רוחב-גובה.

### כיתובים

כל תמונה מקבלת קובץ טקסט באותו שם (`photo01.jpg`, ‏`photo01.txt`). הכיתוב אומר למודל מה כבר מוסבר במילים, כדי שה-LoRA ילמד את מה שלא. שימו מילת טריגר נדירה בהתחלה, ואחריה תארו כל מה שאתם רוצים שיישאר ניתן לשינוי:

```text
zxq_mug, a ceramic coffee mug on a wooden desk, morning light from the left, shallow depth of field
```

שני כלים יכתבו לכם טיוטה ראשונה:

- **WD14 tagger**, שכלול ב-sd-scripts, מייצר תגיות מופרדות בפסיקים. מתאים למודלים בסגנון אנימה ולמודלי SDXL שעברו fine-tuning על תגיות:

  ```bash
  python finetune/tag_images_by_wd14_tagger.py --onnx \
    --repo_id SmilingWolf/wd-swinv2-tagger-v3 --batch_size 4 /workspace/dataset/img
  ```

- **JoyCaption**, מודל כיתוב פתוח (Apache 2.0) שנבנה לאימון מודלי דיפוזיה, כותב משפטים בשפה טבעית, שמתאימים ל-Flux יותר מתגיות. לפי ה-README שלו הוא צריך כ-17 GB של VRAM ב-bf16, ויש לו גרסאות 8-bit ו-4-bit לכרטיסים קטנים יותר.

גם ל-OneTrainer יש יצירת כיתובים מובנית עם BLIP, ‏BLIP2 ו-WD-1.4. לא משנה מי כתב את הטיוטה, קראו כל כיתוב ותקנו אותו. זו חצי השעה הכי משתלמת בכל הפרויקט.

## בחירת כלי אימון

ארבעה כלים מכסים כמעט את כולם. כולם חינמיים וקוד פתוח.

| כלי | ממשק | מודלים (ספטמבר 2026) | מתאים ל- |
| --- | --- | --- | --- |
| kohya-ss/sd-scripts | שורת פקודה | SD 1.x/2.x, SDXL, SD3/3.5, FLUX.1, Lumina, HunyuanImage-2.1, Anima | הרצות שאפשר לשחזר, שליטה מלאה |
| bmaltais/kohya_ss | ממשק web מעל sd-scripts | כמו sd-scripts | ‏sd-scripts בלי לשנן דגלים |
| Nerogar/OneTrainer | ממשק דסקטופ ו-CLI | ‏SD 1.5 עד 3.5, SDXL, FLUX.1, FLUX.2, Chroma, Qwen Image ועוד | יצירת כיתובים ומסכות מובנית |
| ostris/ai-toolkit | ממשק web וקובצי הגדרות YAML | ‏SD 1.5, SDXL, FLUX.1, FLUX.2, Qwen-Image, וידאו של Wan ועוד | ‏Flux ומודלים חדשים יותר, תבנית ל-RunPod |

‏sd-scripts נמצא בגרסה 0.11.1 (יוני 2026), נבדק עם Python 3.10 ודורש PyTorch 2.6.0 ומעלה. ‏ai-toolkit ממליץ על Python 3.12 וכרגע מתקין PyTorch 2.13.0 שנבנה ל-CUDA 13.0. ‏OneTrainer צריך Python 3.10 עד 3.13.

אני משתמש ב-sd-scripts ל-SDXL כי שורת הפקודה היא כל ההגדרות, וזה הופך הרצות לקלות לשחזור ולהשוואה, וב-ai-toolkit ל-Flux.

## אימון LoRA ל-SDXL עם sd-scripts

על instance חדש של Linux עם דרייבר של NVIDIA, ההקמה היא כמה פקודות:

```bash
git clone https://github.com/kohya-ss/sd-scripts.git
cd sd-scripts
python -m venv venv && source venv/bin/activate
pip install torch==2.6.0 torchvision==0.21.0 --index-url https://download.pytorch.org/whl/cu124
pip install --upgrade -r requirements.txt
accelerate config default --mixed_precision bf16

# SDXL base model (not gated, CreativeML Open RAIL++-M license)
hf download stabilityai/stable-diffusion-xl-base-1.0 sd_xl_base_1.0.safetensors \
  --local-dir /workspace/models
```

העתיקו את תיקיית התמונות וכיתובי ה-`.txt` אל `/workspace/dataset/img` עם `scp`, ‏`rsync` או דפדפן הקבצים של הפלטפורמה. אחר כך תארו את הדאטהסט ב-`/workspace/dataset.toml`:

```toml
[general]
caption_extension = ".txt"
enable_bucket = true

[[datasets]]
resolution = 1024
batch_size = 1

  [[datasets.subsets]]
  image_dir = "/workspace/dataset/img"
  num_repeats = 10
```

והתחילו את האימון:

```bash
accelerate launch --num_cpu_threads_per_process 1 sdxl_train_network.py \
  --pretrained_model_name_or_path=/workspace/models/sd_xl_base_1.0.safetensors \
  --dataset_config=/workspace/dataset.toml \
  --output_dir=/workspace/output --output_name=zxq_mug \
  --save_model_as=safetensors \
  --network_module=networks.lora --network_dim=16 --network_alpha=8 \
  --network_train_unet_only \
  --optimizer_type=AdamW8bit --learning_rate=1e-4 \
  --lr_scheduler=constant_with_warmup --lr_warmup_steps=100 \
  --max_train_epochs=8 --save_every_n_epochs=2 \
  --mixed_precision=bf16 --save_precision=bf16 \
  --cache_latents --cache_latents_to_disk --cache_text_encoder_outputs \
  --gradient_checkpointing --sdpa --seed=42 \
  --sample_prompts=/workspace/prompts.txt --sample_every_n_epochs=2
```

‏`prompts.txt` מכיל פרומפט בדיקה אחד בכל שורה, עם האפשרויות של sd-scripts בתוך השורה לגודל, ל-seed ולמספר הצעדים:

```text
zxq_mug, a ceramic coffee mug on a kitchen counter --w 1024 --h 1024 --d 42 --s 28
zxq_mug, a ceramic coffee mug held by a hiker on a mountain top --w 1024 --h 1024 --d 42 --s 28
```

### מה ההגדרות עושות

- **צעדים.** תמונות × חזרות × epochs ÷ גודל batch. עם 25 תמונות: ‏25 × 10 × 8 = 2,000 צעדים.
- **`network_dim` ‏16, ‏`network_alpha` ‏8.** הקיבולת של ה-LoRA. ‏16 זה די והותר לחפץ אחד או לפנים; סגנונות צריכים לפעמים 32. דרגות גבוהות יותר נכנסות מהר יותר ל-overfitting ויוצרות קבצים גדולים יותר.
- **`--network_train_unet_only`.** חובה כאן: ‏sd-scripts מסרב לשמור ב-cache את הפלטים של ה-text encoders ובמקביל לאמן אותם, והתיעוד שלו ממילא מגדיר אימון של U-Net בלבד כ"מומלץ מאוד" ל-LoRA של SDXL.
- **‏cache ו-gradient checkpointing.** אלה מה שמכניס את SDXL ל-8 עד 10 GB. ה-cache גם מבטל ערבוב כיתובים ו-caption dropout, ולכן הם לא מופיעים בקובץ הדאטהסט.
- **`learning_rate` ‏1e-4 עם AdamW8bit.** הערך מהדוגמה של sd-scripts עצמו ל-LoRA של SDXL. אם הדוגמאות כמעט לא משתנות אחרי ארבעה epochs, נסו 2e-4. אם הן הופכות להעתקים של תמונות האימון, הורידו את הערך או עצרו מוקדם יותר.
- **‏checkpoints כל 2 epochs.** תקבלו קבצים ל-epochs ‏2, 4, 6 ו-8, ותבחרו את הטוב ביותר. ה-LoRA הטוב ביותר הוא הרבה פעמים לא האחרון.

### כמה זמן זה לוקח

משתמשים בשרשור issue של kohya_ss דיווחו על כ-1.1 עד 1.4 איטרציות לשנייה באימון LoRA ל-SDXL ב-1024x1024, ‏batch size 1, על RTX 4090 עם gradient checkpointing. במהירות הזו 2,000 צעדים לוקחים 24 עד 30 דקות, ועוד כמה דקות ל-cache של ה-latents. אותו שרשור מראה כמה רע זה נגמר כשלכרטיס נגמר ה-VRAM והוא גולש לזיכרון משותף: ‏50 שניות ויותר לצעד. אם המהירות שלכם רחוקה מהטווח הצפוי, בדקו את `nvidia-smi` לפני שאתם מאשימים את ההגדרות.

## ‏Flux ומודלים חדשים יותר עם ai-toolkit

ל-Flux, ‏ai-toolkit הוא הדרך הקלה ביותר. על מכונה שכורה:

```bash
git clone https://github.com/ostris/ai-toolkit.git
cd ai-toolkit
python3 -m venv venv && source venv/bin/activate
pip3 install --no-cache-dir torch==2.13.0 torchvision==0.28.0 torchaudio==2.11.0 \
  --index-url https://download.pytorch.org/whl/cu130
pip3 install -r requirements.txt
cp config/examples/train_lora_flux_24gb.yaml config/zxq_mug.yml
# edit the dataset path, trigger word and steps, then:
python run.py config/zxq_mug.yml
```

או הפעילו את ממשק ה-web עם `cd ui && npm run build_and_start` ופתחו את פורט 8675. על שרת שאנשים אחרים יכולים להגיע אליו, הגדירו קודם סיסמה ב-`AI_TOOLKIT_AUTH`, כמו שה-README ממליץ.

שני דברים שכדאי לדעת על רישיונות לפני שבוחרים מודל Flux:

- **FLUX.1 [dev]** חסום ב-Hugging Face. מקבלים את FLUX.1 [dev] Non-Commercial License ומשתמשים בטוקן קריאה של Hugging Face כדי להוריד אותו. לפי כרטיס המודל, מותר להשתמש בתמונות שנוצרו למטרות מסחריות; המשקלים וה-LoRA שלכם כפופים לרישיון הלא-מסחרי.
- **FLUX.2 [klein] 4B** ברישיון Apache 2.0 ולא חסום. גרסת ה-9B משתמשת ב-FLUX Non-Commercial License.

‏Black Forest Labs פרסמה ביוני 2026 מדריך לאימון LoRA ל-FLUX.2 [klein] עם ai-toolkit: הרצה של 1,800 צעדים על RTX 4090 "לוקחת פחות משעה", והם ממליצים לבחון checkpoints סביב צעדים 750 עד 1,500. לא מצאתי מדידה מפורסמת ומבוססת באותה מידה ל-FLUX.1 [dev], שגדול פי שלושה מ-klein 4B; תקצבו יותר זמן ומדדו את ההרצה הראשונה.

## לבדוק את ה-LoRA לפני שמפסיקים לשלם

הסתכלו על תמונות הדוגמה מכל epoch שנשמר כל עוד המכונה עוד רצה. הן מראות לכם, בחינם, אם ה-LoRA למד את הקונספט ומתי הוא התחיל להיכנס ל-overfitting. אחר כך הורידו את ה-checkpoints שמצאו חן בעיניכם:

```bash
rsync -avP user@your-instance:/workspace/output/*.safetensors ./loras/
```

בבית, שימו את הקובץ בתיקייה `models/loras` של ComfyUI או `models/Lora` של Forge, ובדקו עם seeds קבועים:

- **עוצמה.** נסו 0.6, ‏0.8 ו-1.0. חלק מה-LoRAs נראים הכי טוב מתחת ל-1.0.
- **גמישות.** שימו את הטריגר בסצנות שלא היו בנתונים שלכם. ספל על פסגת הר, פנים בציור. אם זה עובד רק בסצנות שדומות לתמונות האימון, יש overfitting: קחו epoch מוקדם יותר או פחות חזרות.
- **דליפה.** צרו תמונות בלי מילת הטריגר. אם הקונספט מופיע בכל זאת, הכיתובים שלכם לא תיארו מספיק מהתמונה.

כשהתוצאה לא טובה, התיקון בדרך כלל בדאטהסט: להוציא כמה תמונות חלשות, או לכתוב כיתובים שמציינים את מה שאתם רוצים שישתנה. שינוי ה-learning rate הוא הדבר השני לנסות, לא הראשון.

## חישוב העלות

‏LoRA אחד ל-SDXL, ‏25 תמונות, ‏2,000 צעדים, על RTX 4090:

| שלב | זמן |
| --- | --- |
| התחלה מתבנית, התקנת sd-scripts | 10 דק' |
| הורדת SDXL base, העלאת הדאטהסט, cache | 10 דק' |
| אימון (2,000 צעדים ב-1.1 עד 1.4 it/s) | 30 דק' |
| מעבר על הדוגמאות, הורדת checkpoints, מחיקת ה-instance | 15 דק' |
| **סך הכול** | **65 דק' (1.08 שעות)** |

- ‏Vast.ai ב-$0.31 לשעה: ‏1.08 × $0.31 = **$0.34**, ועוד אחסון ותעריף רוחב הפס של המארח.
- ‏RunPod ב-$0.74 לשעה: ‏1.08 × $0.74 = **$0.80**. ‏container disk של 50 GB לאותה שעה מוסיף 50 × $0.10 ÷ 730 שעות = פחות מסנט.

‏LoRA ל-FLUX.2 [klein] עם שעת אימון וחצי שעה של הקמה ובדיקה עולה 1.5 × $0.74 = **$1.11** ב-RunPod, או 1.5 × $0.31 = **$0.47** ב-Vast.ai.

<figure>
<svg viewBox="0 0 720 300" role="img" aria-labelledby="d2-title" xmlns="http://www.w3.org/2000/svg" font-family="system-ui, sans-serif" font-size="15">
<title id="d2-title">גרף עמודות של עלויות אימון LoRA על RTX 4090 שכור בהשוואה לתקציב של 10 דולר</title>
<rect width="720" height="300" fill="#ffffff"/>
<line x1="230" y1="40" x2="230" y2="250" stroke="#e2e8f0" stroke-width="1"/>
<line x1="322" y1="40" x2="322" y2="250" stroke="#e2e8f0" stroke-width="1"/>
<line x1="414" y1="40" x2="414" y2="250" stroke="#e2e8f0" stroke-width="1"/>
<line x1="506" y1="40" x2="506" y2="250" stroke="#e2e8f0" stroke-width="1"/>
<line x1="598" y1="40" x2="598" y2="250" stroke="#e2e8f0" stroke-width="1"/>
<line x1="690" y1="30" x2="690" y2="250" stroke="#f97316" stroke-width="2" stroke-dasharray="6 4"/>
<text x="698" y="22" text-anchor="start" fill="#f97316" font-size="13" direction="rtl">תקציב $10</text>
<text x="220" y="75" text-anchor="end" fill="#1e1b4b">SDXL, Vast.ai</text>
<rect x="230" y="58" width="15.6" height="26" fill="#16a34a"/>
<text x="253" y="76" fill="#1e1b4b" font-size="13">$0.34</text>
<text x="220" y="125" text-anchor="end" fill="#1e1b4b">SDXL, RunPod</text>
<rect x="230" y="108" width="36.8" height="26" fill="#6366f1"/>
<text x="275" y="126" fill="#1e1b4b" font-size="13">$0.80</text>
<text x="220" y="175" text-anchor="end" fill="#1e1b4b">FLUX.2 klein, RunPod</text>
<rect x="230" y="158" width="51.1" height="26" fill="#6366f1"/>
<text x="289" y="176" fill="#1e1b4b" font-size="13">$1.11</text>
<text x="220" y="225" text-anchor="start" fill="#1e1b4b" direction="rtl">5 הרצות SDXL, ‏RunPod</text>
<rect x="230" y="208" width="184.5" height="26" fill="#6366f1"/>
<text x="422" y="226" fill="#1e1b4b" font-size="13">$4.01</text>
<line x1="230" y1="250" x2="690" y2="250" stroke="#64748b" stroke-width="1"/>
<text x="230" y="270" text-anchor="middle" fill="#64748b" font-size="13">$0</text>
<text x="322" y="270" text-anchor="middle" fill="#64748b" font-size="13">$2</text>
<text x="414" y="270" text-anchor="middle" fill="#64748b" font-size="13">$4</text>
<text x="506" y="270" text-anchor="middle" fill="#64748b" font-size="13">$6</text>
<text x="598" y="270" text-anchor="middle" fill="#64748b" font-size="13">$8</text>
<text x="690" y="270" text-anchor="middle" fill="#64748b" font-size="13">$10</text>
<text x="460" y="292" text-anchor="middle" fill="#64748b" font-size="13" direction="rtl">עלות לסשן על RTX 4090, מחירי ספטמבר 2026</text>
</svg>
<figcaption>גם חמישה ניסיונות נפרדים של SDXL במחיר המחירון של RunPod נשארים הרבה מתחת ל-$10. ב-$0.74 לשעה, ‏$10 קונים 13.5 שעות של RTX 4090; ב-$0.31, כ-32 שעות.</figcaption>
</figure>

מה שבאמת מפוצץ תקציב של $10 הוא כמעט אף פעם לא האימון. זה instance שנשאר פועל כל הלילה (12 שעות ב-$0.74 הן $8.88), ‏instance עצור ב-Vast.ai שעדיין משלם על אחסון, או שעה של כתיבת כיתובים על זמן בתשלום. חיוב לפי שנייה עוזר רק אם מוחקים את המכונה כשמסיימים.

## איפה GPUFlow נכנסת לתמונה

היא לא נכנסת, לא לעבודה הזו. ‏GPUFlow משכירה גישה למודל שפה שספק מגיש (בדרך כלל עם Ollama) על ה-GPU שלו, דרך מפתח API תואם OpenAI. אין shell, אין SSH ואין גישה לקבצים, כך שאי אפשר להתקין כלי אימון, להעלות תמונות או להוריד LoRA. היא גם מגישה מודלי צ'אט, לא מודלי תמונה. תאמנו ב-Vast.ai, ב-RunPod או בפלטפורמה דומה שמשכירה לכם את המכונה.

אם אתם עובדים עם טקסט ולא עם תמונות, אותה גישה של לשכור, לאמן ולמחוק מתאימה גם למודלי שפה: ראו [fine-tuning פרטי ל-LLM על GPU שכור](/he/private-llm-fine-tuning-guide/).

## מקורות

כולם נבדקו בספטמבר 2026.

- המאמר על LoRA: ‏[Hu et al., LoRA: Low-Rank Adaptation of Large Language Models](https://arxiv.org/abs/2106.09685)
- sd-scripts: ‏[README וגרסאות](https://github.com/kohya-ss/sd-scripts), [אימון LoRA ל-SDXL](https://github.com/kohya-ss/sd-scripts/blob/main/docs/sdxl_train_network.md), [הערות על SDXL ו-VRAM](https://github.com/kohya-ss/sd-scripts/blob/main/docs/train_SDXL-en.md), [הגדרות דאטהסט](https://github.com/kohya-ss/sd-scripts/blob/main/docs/config_README-en.md), [אימון LoRA ל-FLUX.1](https://github.com/kohya-ss/sd-scripts/blob/main/docs/flux_train_network.md), [WD14 tagger](https://github.com/kohya-ss/sd-scripts/blob/main/docs/wd14_tagger_README-en.md)
- [bmaltais/kohya_ss](https://github.com/bmaltais/kohya_ss), [Nerogar/OneTrainer](https://github.com/Nerogar/OneTrainer), [ostris/ai-toolkit](https://github.com/ostris/ai-toolkit), [JoyCaption](https://github.com/fpgaminer/joycaption)
- מהירויות SDXL על 4090: ‏[kohya_ss issue #1288](https://github.com/bmaltais/kohya_ss/issues/1288)
- Black Forest Labs: ‏[Fine-tune FLUX.2 [klein] with a LoRA under 60 minutes](https://huggingface.co/blog/black-forest-labs/flux-2-klein-lora), כרטיסי המודל של [FLUX.1 [dev]](https://huggingface.co/black-forest-labs/FLUX.1-dev), ‏[FLUX.2 [klein] 4B](https://huggingface.co/black-forest-labs/FLUX.2-klein-base-4B), ‏[FLUX.2 [klein] 9B](https://huggingface.co/black-forest-labs/FLUX.2-klein-base-9B)
- [כרטיס המודל של Stable Diffusion XL base 1.0](https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0)
- מחירים: ‏[התמחור של RunPod](https://www.runpod.io/pricing), [תמחור pods ואחסון ב-RunPod](https://docs.runpod.io/pods/pricing), [התמחור של Vast.ai](https://docs.vast.ai/guides/instances/pricing.md), ‏getdeploying.com עבור [RTX 3090](https://getdeploying.com/reference/cloud-gpu/nvidia-rtx-3090), ‏[RTX 4090](https://getdeploying.com/reference/cloud-gpu/nvidia-rtx-4090), ‏[RTX 5090](https://getdeploying.com/reference/cloud-gpu/nvidia-rtx-5090) ו-[Vast.ai](https://getdeploying.com/vast-ai)
- GPUFlow: ‏[מדריך התחלה מהירה ל-API](https://docs.gpuflow.app/he/renters/api-quickstart/)
