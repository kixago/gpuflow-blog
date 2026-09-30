---
title: "تدريب LoRA لـ Stable Diffusion بأقل من $10 على GPU مستأجر"
description: "درّب LoRA لـ SDXL أو Flux على RTX 4090 مستأجرة بأقل بكثير من $10: اختيار GPU حسب VRAM، وأوصاف الصور، وإعدادات sd-scripts وai-toolkit، وحساب فعلي للتكلفة."
excerpt: "جولة تدريب واحدة لـ LoRA على SDXL باستخدام RTX 4090 مستأجرة تكلّف نحو $0.35 إلى $0.80 في سبتمبر 2026. هنا ستجد أي GPU تختار، وكيف تجهّز الصور وتكتب أوصافها، وأمر التدريب بالضبط، وأين يذهب المال فعلاً."
pubDate: 2026-02-11
updatedDate: 2026-09-30
locale: "ar"
category: "tutorials"
featured: false
draft: false
author: "GPUFlow Team"
heroImage: "../_images/stable-diffusion-lora-training-guide.jpg"
heroImageAlt: "رسم لأشخاص حول شاشة كبيرة تعرض مخطط شبكة LoRA، بجانب خزانة خوادم ولوحة تقارن صوراً تجريبية من حقبتي تدريب مختلفتين"
faq:
  - question: "كم يكلّف تدريب LoRA على GPU مستأجر؟"
    answer: "في سبتمبر 2026 كانت RTX 4090 تُستأجر بنحو $0.31 في الساعة على Vast.ai و$0.74 في الساعة وفق صفحة أسعار RunPod. جلسة LoRA لـ SDXL مدتها نحو 65 دقيقة، بما فيها الإعداد والاختبار، تكلّف إذن ما بين $0.34 و$0.80 تقريباً."
  - question: "كم أحتاج من VRAM لتدريب LoRA لـ SDXL؟"
    answer: "تقول وثائق sd-scripts إن تدريب LoRA لـ SDXL ممكن بذاكرة GPU قدرها 8 GB، ويُنصح بـ 10 GB، إذا درّبت U-Net وحده، وخزّنت الـ latents ومخرجات مُرمِّز النص مسبقاً، واستخدمت gradient checkpointing. أما بطاقة 24 GB مثل RTX 3090 أو 4090 فتتيح لك التدريب بدقة 1024x1024 دون صراع مع حدود الذاكرة."
  - question: "هل يمكنني تدريب LoRA لـ Flux على RTX 4090؟"
    answer: "نعم. يأتي ai-toolkit بملفات إعداد نموذجية لـ FLUX.1 مسمّاة لبطاقات 24 GB، ويذكر sd-scripts إعدادات لـ FLUX.1 تنزل حتى 8 GB باستخدام تبديل الكتل (block swapping). ويقول دليل Black Forest Labs نفسه إن جولة LoRA من 1,800 خطوة لـ FLUX.2 [klein] على RTX 4090 تستغرق أقل من ساعة."
  - question: "كم صورة أحتاج لتدريب LoRA؟"
    answer: "لشخصية أو غرض أو أسلوب واحد، النطاق الشائع من 15 إلى 40 صورة جيدة؛ وتقترح Black Forest Labs من 15 إلى 40 صورة يجمعها مظهر واحد لـ FLUX.2 [klein]. الصور الحادة والمتنوعة ذات الأوصاف الجيدة أهم من العدد الكبير."
  - question: "أيها أفضل لتدريب LoRA: kohya_ss أم OneTrainer أم ai-toolkit؟"
    answer: "الثلاثة تعمل. sd-scripts من kohya هو المرجع في سطر الأوامر، وkohya_ss يضع فوقه واجهة ويب؛ ولدى OneTrainer واجهة سطح مكتب وأداة مدمجة لكتابة الأوصاف؛ ولدى ai-toolkit واجهة ويب وقالب رسمي على RunPod ودعم مبكر لنماذج جديدة مثل FLUX.2 وQwen-Image."
  - question: "هل يمكنني تدريب LoRA على GPUFlow؟"
    answer: "لا. يؤجّر GPUFlow واجهة API للمحادثة متوافقة مع OpenAI على GPU لدى مزوّد، دون سطر أوامر أو SSH أو وصول إلى الملفات، فلا يمكنك تشغيل سكربت تدريب عليه. استخدم منصة تؤجّرك الجهاز نفسه، مثل Vast.ai أو RunPod."
---

تدريب LoRA لـ SDXL أو لنموذج Flux صغير يكلّف أقل بكثير من $10 على GPU مستأجر. في سبتمبر 2026 تُستأجر RTX 4090 بنحو $0.31 في الساعة على Vast.ai و$0.74 في الساعة على RunPod، وجلسة LoRA واحدة لـ SDXL، بالإعداد والاختبار، تستغرق أكثر من ساعة بقليل. أي من $0.34 إلى $0.80 للمحاولة الواحدة، فميزانية $10 تكفي لدزينة محاولات.

المال ليس الجزء الصعب. الصعب هو الصور، والأوصاف، ومعرفة متى تتوقف. يغطي هذا الدليل ذلك كله، مع أوامر جاهزة للنسخ. راجعنا الأسعار وإصدارات الأدوات في سبتمبر 2026، والمصادر في آخر المقال.

## سير العمل في خمس خطوات

<figure>
<svg viewBox="0 0 720 250" role="img" aria-labelledby="d1-title" xmlns="http://www.w3.org/2000/svg" font-family="system-ui, sans-serif" font-size="15">
<title id="d1-title">سير عمل تدريب LoRA: مجموعة البيانات، ثم الأوصاف، ثم التدريب، ثم الاختبار، ثم الاستخدام، مع عودة إلى مجموعة البيانات عندما تكون النتائج خاطئة</title>
<defs><marker id="d1-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#6366f1"/></marker></defs>
<rect width="720" height="250" fill="#ffffff"/>
<line x1="20" y1="40" x2="280" y2="40" stroke="#16a34a" stroke-width="2"/>
<text x="150" y="30" text-anchor="middle" fill="#16a34a" font-size="13" direction="rtl">مجاناً: على جهازك</text>
<line x1="300" y1="40" x2="560" y2="40" stroke="#f97316" stroke-width="2"/>
<text x="430" y="30" text-anchor="middle" fill="#f97316" font-size="13" direction="rtl">مدفوع: على GPU المستأجر</text>
<rect x="20" y="60" width="120" height="70" rx="10" fill="#eef2ff" stroke="#6366f1" stroke-width="2"/>
<text x="80" y="90" text-anchor="middle" fill="#1e1b4b" font-weight="600" direction="rtl">البيانات</text>
<text x="80" y="112" text-anchor="middle" fill="#64748b" font-size="13" direction="rtl">15–40 صورة</text>
<rect x="160" y="60" width="120" height="70" rx="10" fill="#eef2ff" stroke="#6366f1" stroke-width="2"/>
<text x="220" y="90" text-anchor="middle" fill="#1e1b4b" font-weight="600" direction="rtl">الأوصاف</text>
<text x="220" y="112" text-anchor="middle" fill="#64748b" font-size="13" direction="rtl">ملف .txt لكلٍّ</text>
<rect x="300" y="60" width="120" height="70" rx="10" fill="#eef2ff" stroke="#6366f1" stroke-width="2"/>
<text x="360" y="90" text-anchor="middle" fill="#1e1b4b" font-weight="600" direction="rtl">التدريب</text>
<text x="360" y="112" text-anchor="middle" fill="#64748b" font-size="13">sd-scripts</text>
<rect x="440" y="60" width="120" height="70" rx="10" fill="#eef2ff" stroke="#6366f1" stroke-width="2"/>
<text x="500" y="90" text-anchor="middle" fill="#1e1b4b" font-weight="600" direction="rtl">الاختبار</text>
<text x="500" y="112" text-anchor="middle" fill="#64748b" font-size="13" direction="rtl">شبكة عينات</text>
<rect x="580" y="60" width="120" height="70" rx="10" fill="#eef2ff" stroke="#6366f1" stroke-width="2"/>
<text x="640" y="90" text-anchor="middle" fill="#1e1b4b" font-weight="600" direction="rtl">الاستخدام</text>
<text x="640" y="112" text-anchor="middle" fill="#64748b" font-size="13" direction="rtl">ComfyUI، Forge</text>
<line x1="140" y1="95" x2="158" y2="95" stroke="#6366f1" stroke-width="2" marker-end="url(#d1-arrow)"/>
<line x1="280" y1="95" x2="298" y2="95" stroke="#6366f1" stroke-width="2" marker-end="url(#d1-arrow)"/>
<line x1="420" y1="95" x2="438" y2="95" stroke="#6366f1" stroke-width="2" marker-end="url(#d1-arrow)"/>
<line x1="560" y1="95" x2="578" y2="95" stroke="#6366f1" stroke-width="2" marker-end="url(#d1-arrow)"/>
<path d="M500,130 L500,180 L80,180 L80,134" fill="none" stroke="#f97316" stroke-width="2" stroke-dasharray="6 4" marker-end="url(#d1-arrow)"/>
<text x="290" y="205" text-anchor="middle" fill="#1e1b4b" font-size="13" direction="rtl">النتيجة ليست كما تريد؟ أصلح الصور أو الأوصاف، ثم درّب من جديد</text>
<text x="360" y="235" text-anchor="middle" fill="#64748b" font-size="13" direction="rtl">معظم الجودة يأتي من المربعين الأولين، وهما لا يكلّفان شيئاً</text>
</svg>
<figcaption>جهّز البيانات والأوصاف قبل أن تستأجر. لا يُفوتر GPU إلا على التدريب والاختبار، والنتيجة السيئة تعيدك عادةً إلى الصور، لا إلى الإعدادات.</figcaption>
</figure>

## ما هي LoRA ولماذا هي رخيصة

تجمّد LoRA ‏(Low-Rank Adaptation) النموذج الأساسي وتدرّب مصفوفتين صغيرتين بجانب بعض طبقاته. أفادت الورقة الأصلية بأنها خفّضت عدد المعاملات القابلة للتدريب 10,000 مرة وذاكرة GPU ثلاث مرات مقارنةً بالضبط الدقيق الكامل لـ GPT-3 175B. ونماذج الصور تعمل بالطريقة نفسها: نقطة الحفظ الأساسية لـ SDXL ملف حجمه 6.9 GB، أما LoRA التي تدرّبها فملف صغير منفصل تحمّله فوقه بالقوة التي تريد.

لهذا تكفي بطاقة GPU استهلاكية واحدة، ولهذا تستغرق الجولة عشرات الدقائق لا أياماً.

## اختر GPU حسب VRAM

الـ VRAM يحدد ما تستطيع تدريبه. والسرعة تحدد عدد الدقائق المدفوعة التي تستغرقها الجولة، فالبطاقة الأسرع التي تكلّف أكثر في الساعة قد تكلّف في النهاية القدر نفسه تقريباً للجولة الواحدة.

| عائلة النموذج | الحد الأدنى الموثّق | المريح | ملاحظات |
| --- | --- | --- | --- |
| SD 1.5 | 8 GB | 12 GB فأكثر | يُدرَّب بدقة 512x512، الأرخص والأسرع |
| SDXL | ‏8 GB (يُنصح بـ 10 GB) | 24 GB | U-Net وحده، مع تخزين الـ latents ومخرجات مُرمِّز النص مسبقاً |
| FLUX.1 [dev] ‏(12B) | 8 GB مع تبديل مكثّف للكتل | 24 GB | يذكر sd-scripts إعدادات لـ 24 و16 و12 و10 و8 GB |
| FLUX.2 [klein] 4B/9B | غير مذكور | 24 GB | BFL: نحو 13 GB من أوزان bf16، وجولة LoRA تتسع في أقل من 24 GB |

إعدادات الـ VRAM المنخفضة تعمل، لكنها بطيئة. تبديل كتل الـ transformer بين GPU وذاكرة النظام هو الطريقة التي يُدخل بها sd-scripts نموذج FLUX.1 في 8 إلى 16 GB، وكل تبديل يكلّف وقتاً تدفع ثمنه. على جهاز مستأجر، البطاقة ذات 24 GB هي الخيار الافتراضي المعقول: RTX 3090 أو 4090. وRTX 5090 ‏(32 GB) تعمل أيضاً، لكن sd-scripts ينبّه إلى أنها تحتاج إلى PyTorch 2.8.0 مع CUDA 12.8 أو 12.9، فتأكد أن القالب الذي تستخدمه يأتي بحزمة حديثة بما يكفي.

![بطاقة رسومات ASUS TUF بثلاث مراوح، واقفة على رف أبيض](../_images/test-hero.jpg)

بطاقات مراكز البيانات أسرع، لكن RunPod تعرض A100 ‏80 GB بسعر $1.59 في الساعة، أي أكثر من ضعف 4090. في LoRA على 20 أو 30 صورة، نادراً ما تعوّض السرعة الإضافية هذا الفرق؛ هي أنسب لمجموعات البيانات الكبيرة أو للضبط الدقيق الكامل.

## أين تستأجر، وكم يكلّف

تحتاج إلى منصة تعطيك جهازاً: سطر أوامر أو دفتر Jupyter، وقرصاً، وطريقة لنسخ الملفات منه وإليه. [Vast.ai وRunPod](/ar/runpod-vs-vastapi-comparison/) هما الخياران الأكثر شيوعاً لهذا النوع من العمل.

| GPU | VRAM | ‏Vast.ai (يبدأ من) | صفحة أسعار RunPod | أرخص سعر مرصود على RunPod |
| --- | --- | --- | --- | --- |
| RTX 3090 | 24 GB | نحو $0.11–0.13 في الساعة | $0.50 في الساعة | $0.22 في الساعة |
| RTX 4090 | 24 GB | نحو $0.31–0.33 في الساعة | $0.74 في الساعة | $0.34 في الساعة |
| RTX 5090 | 32 GB | نحو $0.41–0.47 في الساعة | $0.99 في الساعة | $0.69 في الساعة |

الأسعار حتى سبتمبر 2026. عمودا "Vast.ai (يبدأ من)" و"أرخص سعر مرصود على RunPod" مأخوذان من أداة تتبّع الأسعار في getdeploying.com؛ والعمود الأوسط من صفحة أسعار RunPod نفسها. مضيفو Vast.ai يحددون أسعارهم بأنفسهم، فالعروض التي تراها ستختلف حسب الموقع ودرجة الموثوقية.

كلتا المنصتين تفوتر بالثانية. أما الإضافات فتختلف، وهي في مهمة مدتها ساعة أهم مما يوحي به السعر بالساعة:

- **Vast.ai** تتقاضى رسوم التخزين "ما دام مثيلك موجوداً، أياً كانت حالة تشغيله"، وتتقاضى رسوم نقل البيانات لكل بايت، بسعر يحدده كل مضيف. تنزيل نموذج أساسي بحجم 7 GB على مضيف سعر نقل البيانات لديه مرتفع يتراكم. احذف المثيل، ولا تكتفِ بإيقافه.
- **RunPod** تتقاضى $0.10 لكل GB شهرياً لقرص الحاوية أثناء التشغيل، ولا شيء عنه بعد الإيقاف، و$0.20 لكل GB شهرياً لقرص وحدة التخزين المتوقف. ولا تتقاضى شيئاً على البيانات الواردة أو الصادرة.

لدى المنصتين قوالب جاهزة. مطوّر ai-toolkit يحافظ على قالب رسمي على RunPod، وملف README في kohya_ss يذكر RunPod بيئةً مدعومة. القالب يوفّر عليك عشر دقائق أو أكثر من تثبيت PyTorch على وقت مدفوع. لمقارنة أسعار أوسع، راجع [GPUFlow مقابل Vast.ai وRunPod وSaladCloud](/ar/gpuflow-vs-vast-ai-vs-runpod/) و[التكاليف الخفية لاستئجار GPU](/ar/hidden-fees-in-gpu-rental/).

## جهّز مجموعة البيانات والأوصاف

افعل هذا كله على كمبيوترك قبل أن تستأجر أي شيء.

### الصور

- **العدد.** من 15 إلى 40 صورة لشخص أو غرض أو أسلوب واحد. توصي Black Forest Labs بـ "15–40 صورة يجمعها مظهر واحد" لـ FLUX.2 [klein]. الأكثر ليس أفضل إذا كانت الصور الإضافية أضعف.
- **الاتساق والتنوع.** يجب أن تُظهر كل صورة المفهوم نفسه. وكل ما عدا ذلك ينبغي أن يتنوع: الزاوية، والإضاءة، والخلفية، والتأطير. إذا كانت كل صور منتجك على الطاولة البيضاء نفسها، فستتعلم LoRA الطاولة.
- **الجودة.** صور حادة، بتعريض جيد، بلا علامات مائية أو نصوص فوقها. تتعلم LoRA الضوضاء وكتل JPEG بالأمانة نفسها التي تتعلم بها أي شيء آخر.
- **الدقة.** 1024 بكسل على الأقل في الضلع الأقصر لـ SDXL وFlux، و512 لـ SD 1.5. لا تحتاج إلى قصّ الصور إلى مربعات: مع تفعيل الـ bucketing، يجمّع sd-scripts الصور حسب نسبة الأبعاد.

### الأوصاف

لكل صورة ملف نصي بالاسم نفسه (`photo01.jpg`، `photo01.txt`). يخبر الوصف النموذج بما تفسّره الكلمات أصلاً، فتتعلم LoRA ما لا تفسّره. ضع كلمة تفعيل نادرة أولاً، ثم صِف كل ما تريده أن يبقى قابلاً للتغيير:

```text
zxq_mug, a ceramic coffee mug on a wooden desk, morning light from the left, shallow depth of field
```

أداتان تكتبان لك مسودة أولى:

- **WD14 tagger**، المضمّنة في sd-scripts، تنتج وسوماً مفصولة بفواصل. جيدة للنماذج ذات أسلوب الأنمي ولنماذج SDXL المضبوطة على الوسوم:

  ```bash
  python finetune/tag_images_by_wd14_tagger.py --onnx \
    --repo_id SmilingWolf/wd-swinv2-tagger-v3 --batch_size 4 /workspace/dataset/img
  ```

- **JoyCaption**، نموذج مفتوح (Apache 2.0) لكتابة الأوصاف صُمّم لتدريب نماذج الانتشار، يكتب جملاً بلغة طبيعية، وهي أنسب لـ Flux من الوسوم. يقول ملف README الخاص به إنه يحتاج إلى نحو 17 GB من VRAM بدقة bf16، مع نسخ 8-bit و4-bit للبطاقات الأصغر.

ولدى OneTrainer أيضاً أداة مدمجة لكتابة الأوصاف تستخدم BLIP وBLIP2 وWD-1.4. أياً كانت الأداة التي كتبت المسودة، اقرأ كل وصف وصحّحه. هذه أثمن نصف ساعة في المشروع كله.

## اختر أداة التدريب

أربع أدوات تكفي الجميع تقريباً. كلها مجانية ومفتوحة المصدر.

| الأداة | الواجهة | النماذج (سبتمبر 2026) | تناسب |
| --- | --- | --- | --- |
| kohya-ss/sd-scripts | سطر الأوامر | SD 1.x/2.x، SDXL، SD3/3.5، FLUX.1، Lumina، HunyuanImage-2.1، Anima | جولات قابلة للتكرار، تحكم كامل |
| bmaltais/kohya_ss | واجهة ويب فوق sd-scripts | مثل sd-scripts | sd-scripts دون حفظ الخيارات |
| Nerogar/OneTrainer | واجهة سطح مكتب وCLI | من SD 1.5 إلى 3.5، SDXL، FLUX.1، FLUX.2، Chroma، Qwen Image وغيرها | كتابة أوصاف وأقنعة مدمجة |
| ostris/ai-toolkit | واجهة ويب وملفات إعداد YAML | SD 1.5، SDXL، FLUX.1، FLUX.2، Qwen-Image، Wan للفيديو وغيرها | Flux والنماذج الأحدث، قالب RunPod |

sd-scripts في الإصدار 0.11.1 (يونيو 2026)، ومختبَر مع Python 3.10 ويحتاج إلى PyTorch 2.6.0 أو أحدث. ويوصي ai-toolkit بـ Python 3.12 ويثبّت حالياً PyTorch 2.13.0 المبني لـ CUDA 13.0. ويحتاج OneTrainer إلى Python من 3.10 إلى 3.13.

أستخدم sd-scripts لـ SDXL لأن سطر الأوامر هو الإعداد كله، ما يجعل الجولات سهلة التكرار والمقارنة، وai-toolkit لـ Flux.

## درّب LoRA لـ SDXL باستخدام sd-scripts

على مثيل Linux جديد فيه تعريف NVIDIA، الإعداد بضعة أوامر:

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

انسخ مجلد الصور وأوصاف `.txt` إلى `/workspace/dataset/img` باستخدام `scp` أو `rsync` أو متصفح الملفات في المنصة. ثم صِف مجموعة البيانات في `/workspace/dataset.toml`:

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

وابدأ التدريب:

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

يحتوي `prompts.txt` على موجّه اختبار واحد في كل سطر، مع خيارات sd-scripts المضمّنة للحجم والبذرة (seed) وعدد الخطوات:

```text
zxq_mug, a ceramic coffee mug on a kitchen counter --w 1024 --h 1024 --d 42 --s 28
zxq_mug, a ceramic coffee mug held by a hiker on a mountain top --w 1024 --h 1024 --d 42 --s 28
```

### ماذا تفعل الإعدادات

- **الخطوات.** الصور × التكرارات × الحقب ÷ حجم الدفعة. مع 25 صورة: 25 × 10 × 8 = 2,000 خطوة.
- **`network_dim` ‏16، و`network_alpha` ‏8.** سعة LoRA. الرقم 16 أكثر من كافٍ لغرض أو وجه واحد؛ والأساليب تحتاج أحياناً إلى 32. الرتب الأعلى تفرط في التعلّم (overfit) أسرع وتنتج ملفات أكبر.
- **`--network_train_unet_only`.** إلزامي هنا: يرفض sd-scripts تخزين مخرجات مُرمِّز النص مسبقاً إذا كان يدرّب مُرمِّزات النص في الوقت نفسه، ووثائقه تصف تدريب U-Net وحده بأنه "موصى به بشدة" لـ LoRA على SDXL على أي حال.
- **التخزين المسبق وgradient checkpointing.** هذان ما يجعل SDXL يتسع في 8 إلى 10 GB. والتخزين المسبق يعطّل أيضاً خلط الأوصاف وإسقاطها (caption shuffling وcaption dropout)، ولهذا لا يظهران في ملف مجموعة البيانات.
- **`learning_rate` ‏1e-4 مع AdamW8bit.** القيمة المستخدمة في مثال LoRA لـ SDXL في sd-scripts نفسه. إذا كادت العينات لا تتغير بعد أربع حقب، جرّب 2e-4. وإذا صارت نسخاً من صور التدريب، اخفضها أو توقف أبكر.
- **نقاط حفظ كل حقبتين.** ستحصل على ملفات للحقب 2 و4 و6 و8، وتختار أفضلها. أفضل LoRA كثيراً ما لا تكون الأخيرة.

### كم يستغرق

أفاد مستخدمون في نقاش على kohya_ss بسرعة نحو 1.1 إلى 1.4 تكرار في الثانية لتدريب LoRA لـ SDXL بدقة 1024x1024 وحجم دفعة 1، على RTX 4090 مع gradient checkpointing. بهذه السرعة تستغرق 2,000 خطوة من 24 إلى 30 دقيقة، مضافاً إليها بضع دقائق لتخزين الـ latents. ويُظهر النقاش نفسه مدى سوء الأمور عندما تنفد VRAM من البطاقة وتنتقل إلى الذاكرة المشتركة: 50 ثانية أو أكثر للخطوة. إذا كانت سرعتك أقل بكثير من النطاق المتوقع، افحص `nvidia-smi` قبل أن تلوم الإعدادات.

## Flux والنماذج الأحدث باستخدام ai-toolkit

لـ Flux، ai-toolkit هو الطريق الأسهل. على جهاز مستأجر:

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

أو شغّل واجهة الويب بـ `cd ui && npm run build_and_start` وافتح المنفذ 8675. على خادم يستطيع آخرون الوصول إليه، اضبط `AI_TOOLKIT_AUTH` على كلمة مرور أولاً، كما يوصي ملف README.

أمران تحتاج إلى معرفتهما عن التراخيص قبل أن تختار نموذج Flux:

- **FLUX.1 [dev]** محميّ بموافقة على Hugging Face. تقبل ترخيص FLUX.1 [dev] Non-Commercial License وتستخدم توكن قراءة من Hugging Face لتنزيله. تقول بطاقة النموذج إن المخرجات المولّدة يمكن استخدامها تجارياً؛ أما الأوزان وLoRA التي تدرّبها فتخضع للترخيص غير التجاري.
- **FLUX.2 [klein] 4B** مرخّص بـ Apache 2.0 وغير محميّ. أما نسخة 9B فتستخدم FLUX Non-Commercial License.

نشرت Black Forest Labs في يونيو 2026 دليلاً لتدريب LoRA لـ FLUX.2 [klein] باستخدام ai-toolkit: جولة من 1,800 خطوة على RTX 4090 "تستغرق أقل من ساعة"، ويقترحون فحص نقاط الحفظ حول الخطوات من 750 إلى 1,500. لم أجد توقيتاً منشوراً بالمتانة نفسها لـ FLUX.1 [dev]، وهو أكبر من klein 4B ثلاث مرات؛ خصّص وقتاً أطول وقِس جولتك الأولى.

## اختبر LoRA قبل أن تتوقف عن الدفع

انظر إلى الصور التجريبية من كل حقبة محفوظة والجهاز لا يزال يعمل. فهي تُظهر لك، دون تكلفة إضافية، هل تعلّمت LoRA المفهوم ومتى بدأت تفرط في التعلّم. ثم نزّل نقاط الحفظ التي أعجبتك:

```bash
rsync -avP user@your-instance:/workspace/output/*.safetensors ./loras/
```

على جهازك، ضع الملف في مجلد `models/loras` في ComfyUI أو `models/Lora` في Forge، واختبر ببذور ثابتة:

- **القوة.** جرّب 0.6 و0.8 و1.0. بعض LoRA تبدو أفضل تحت 1.0.
- **المرونة.** ضع كلمة التفعيل في مشاهد لم تكن في بياناتك. كوب على قمة جبل، وجه في لوحة زيتية. إذا لم تعمل إلا في مشاهد تشبه صور التدريب، فهي مفرطة في التعلّم: استخدم حقبة أبكر أو تكرارات أقل.
- **التسرّب.** ولّد صوراً دون كلمة التفعيل. إذا ظهر المفهوم على أي حال، فأوصافك لم تصف ما يكفي من الصورة.

عندما تكون النتيجة خاطئة، يكون الإصلاح عادةً في مجموعة البيانات: حذف بضع صور ضعيفة، أو أوصاف تسمّي الأشياء التي تريدها أن تتنوع. تغيير معدل التعلّم هو الأمر الثاني الذي تجرّبه، لا الأول.

## حساب التكلفة الفعلي

LoRA واحدة لـ SDXL، 25 صورة، 2,000 خطوة، على RTX 4090:

| الخطوة | الوقت |
| --- | --- |
| البدء من قالب وتثبيت sd-scripts | 10 دقائق |
| تنزيل SDXL الأساسي ورفع البيانات والتخزين المسبق | 10 دقائق |
| التدريب (2,000 خطوة بسرعة 1.1 إلى 1.4 تكرار/ث) | 30 دقيقة |
| فحص العينات وتنزيل نقاط الحفظ وحذف المثيل | 15 دقيقة |
| **الإجمالي** | **65 دقيقة (1.08 ساعة)** |

- Vast.ai بسعر $0.31 في الساعة: 1.08 × $0.31 = **$0.34**، مضافاً إليها التخزين وسعر نقل البيانات لدى المضيف.
- RunPod بسعر $0.74 في الساعة: 1.08 × $0.74 = **$0.80**. قرص حاوية بحجم 50 GB لتلك الساعة يضيف 50 × $0.10 ÷ 730 ساعة = أقل من سنت واحد.

LoRA لـ FLUX.2 [klein] بساعة من التدريب و30 دقيقة من الإعداد والاختبار تكلّف 1.5 × $0.74 = **$1.11** على RunPod، أو 1.5 × $0.31 = **$0.47** على Vast.ai.

<figure>
<svg viewBox="0 0 720 300" role="img" aria-labelledby="d2-title" xmlns="http://www.w3.org/2000/svg" font-family="system-ui, sans-serif" font-size="15">
<title id="d2-title">مخطط أشرطة لتكاليف تدريب LoRA على RTX 4090 مستأجرة مقارنةً بميزانية 10 دولارات</title>
<rect width="720" height="300" fill="#ffffff"/>
<line x1="230" y1="40" x2="230" y2="250" stroke="#e2e8f0" stroke-width="1"/>
<line x1="322" y1="40" x2="322" y2="250" stroke="#e2e8f0" stroke-width="1"/>
<line x1="414" y1="40" x2="414" y2="250" stroke="#e2e8f0" stroke-width="1"/>
<line x1="506" y1="40" x2="506" y2="250" stroke="#e2e8f0" stroke-width="1"/>
<line x1="598" y1="40" x2="598" y2="250" stroke="#e2e8f0" stroke-width="1"/>
<line x1="690" y1="30" x2="690" y2="250" stroke="#f97316" stroke-width="2" stroke-dasharray="6 4"/>
<text x="698" y="22" text-anchor="start" fill="#f97316" font-size="13" direction="rtl">ميزانية $10</text>
<text x="220" y="75" text-anchor="start" fill="#1e1b4b" direction="rtl">SDXL، Vast.ai</text>
<rect x="230" y="58" width="15.6" height="26" fill="#16a34a"/>
<text x="253" y="76" fill="#1e1b4b" font-size="13">$0.34</text>
<text x="220" y="125" text-anchor="start" fill="#1e1b4b" direction="rtl">SDXL، RunPod</text>
<rect x="230" y="108" width="36.8" height="26" fill="#6366f1"/>
<text x="275" y="126" fill="#1e1b4b" font-size="13">$0.80</text>
<text x="220" y="175" text-anchor="start" fill="#1e1b4b" direction="rtl">FLUX.2 klein، RunPod</text>
<rect x="230" y="158" width="51.1" height="26" fill="#6366f1"/>
<text x="289" y="176" fill="#1e1b4b" font-size="13">$1.11</text>
<text x="220" y="225" text-anchor="start" fill="#1e1b4b" direction="rtl">5 جولات SDXL، RunPod</text>
<rect x="230" y="208" width="184.5" height="26" fill="#6366f1"/>
<text x="422" y="226" fill="#1e1b4b" font-size="13">$4.01</text>
<line x1="230" y1="250" x2="690" y2="250" stroke="#64748b" stroke-width="1"/>
<text x="230" y="270" text-anchor="middle" fill="#64748b" font-size="13">$0</text>
<text x="322" y="270" text-anchor="middle" fill="#64748b" font-size="13">$2</text>
<text x="414" y="270" text-anchor="middle" fill="#64748b" font-size="13">$4</text>
<text x="506" y="270" text-anchor="middle" fill="#64748b" font-size="13">$6</text>
<text x="598" y="270" text-anchor="middle" fill="#64748b" font-size="13">$8</text>
<text x="690" y="270" text-anchor="middle" fill="#64748b" font-size="13">$10</text>
<text x="460" y="292" text-anchor="middle" fill="#64748b" font-size="13" direction="rtl">تكلفة الجلسة على RTX 4090، بأسعار سبتمبر 2026</text>
</svg>
<figcaption>حتى خمس محاولات منفصلة لـ SDXL بسعر RunPod المعلن تبقى أقل بكثير من $10. بسعر $0.74 في الساعة، تشتري $10 ‏13.5 ساعة من وقت RTX 4090؛ وبسعر $0.31، نحو 32 ساعة.</figcaption>
</figure>

ما يفجّر ميزانية $10 فعلاً نادراً ما يكون التدريب. إنه مثيل تُرك يعمل طوال الليل (12 ساعة بسعر $0.74 تساوي $8.88)، أو مثيل متوقف على Vast.ai لا يزال يدفع مقابل التخزين، أو ساعة قضيتها في كتابة أوصاف الصور على وقت مدفوع. [الفوترة بالثانية](/ar/per-second-vs-hourly-gpu-billing/) لا تفيد إلا إذا حذفت الجهاز عند الانتهاء.

## أين يقع GPUFlow من هذا

لا مكان له في هذه المهمة. يؤجّر GPUFlow الوصول إلى نموذج لغوي يشغّله مزوّد (عادةً باستخدام Ollama) على GPU الخاص به، عبر مفتاح API متوافق مع OpenAI. لا سطر أوامر، ولا SSH، ولا وصول إلى الملفات، فلا يمكنك تثبيت أداة تدريب أو رفع صور أو تنزيل LoRA. كما أنه يقدّم نماذج محادثة لا نماذج صور. درّب على Vast.ai أو RunPod أو منصة مماثلة تؤجّرك الجهاز نفسه.

إذا كنت تعمل على النصوص لا الصور، فالنهج نفسه، استأجر ثم درّب ثم احذف، ينطبق على النماذج اللغوية: راجع [الضبط الدقيق لنموذج لغوي بشكل خاص على GPU مستأجر](/ar/private-llm-fine-tuning-guide/).

## المصادر

راجعناها كلها في سبتمبر 2026.

- ورقة LoRA: [Hu وآخرون، LoRA: Low-Rank Adaptation of Large Language Models](https://arxiv.org/abs/2106.09685)
- sd-scripts: [README والإصدارات](https://github.com/kohya-ss/sd-scripts)، [تدريب LoRA لـ SDXL](https://github.com/kohya-ss/sd-scripts/blob/main/docs/sdxl_train_network.md)، [ملاحظات SDXL وVRAM](https://github.com/kohya-ss/sd-scripts/blob/main/docs/train_SDXL-en.md)، [إعداد مجموعة البيانات](https://github.com/kohya-ss/sd-scripts/blob/main/docs/config_README-en.md)، [تدريب LoRA لـ FLUX.1](https://github.com/kohya-ss/sd-scripts/blob/main/docs/flux_train_network.md)، [WD14 tagger](https://github.com/kohya-ss/sd-scripts/blob/main/docs/wd14_tagger_README-en.md)
- [bmaltais/kohya_ss](https://github.com/bmaltais/kohya_ss)، [Nerogar/OneTrainer](https://github.com/Nerogar/OneTrainer)، [ostris/ai-toolkit](https://github.com/ostris/ai-toolkit)، [JoyCaption](https://github.com/fpgaminer/joycaption)
- سرعات SDXL على 4090: [نقاش kohya_ss رقم 1288](https://github.com/bmaltais/kohya_ss/issues/1288)
- Black Forest Labs: [الضبط الدقيق لـ FLUX.2 [klein] باستخدام LoRA في أقل من 60 دقيقة](https://huggingface.co/blog/black-forest-labs/flux-2-klein-lora)، وبطاقات النماذج [FLUX.1 [dev]](https://huggingface.co/black-forest-labs/FLUX.1-dev)، [FLUX.2 [klein] 4B](https://huggingface.co/black-forest-labs/FLUX.2-klein-base-4B)، [FLUX.2 [klein] 9B](https://huggingface.co/black-forest-labs/FLUX.2-klein-base-9B)
- [بطاقة نموذج Stable Diffusion XL base 1.0](https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0)
- الأسعار: [أسعار RunPod](https://www.runpod.io/pricing)، [أسعار الـ Pods والتخزين في RunPod](https://docs.runpod.io/pods/pricing)، [أسعار Vast.ai](https://docs.vast.ai/guides/instances/pricing.md)، وgetdeploying.com لـ [RTX 3090](https://getdeploying.com/reference/cloud-gpu/nvidia-rtx-3090) و[RTX 4090](https://getdeploying.com/reference/cloud-gpu/nvidia-rtx-4090) و[RTX 5090](https://getdeploying.com/reference/cloud-gpu/nvidia-rtx-5090) و[Vast.ai](https://getdeploying.com/vast-ai)
- GPUFlow: [البدء السريع مع API](https://docs.gpuflow.app/ar/renters/api-quickstart/)
