---
title: "الضبط الدقيق لنموذج لغوي بشكل خاص على GPU مستأجر: دليل عملي"
description: "متى يتفوق الضبط الدقيق على RAG أو تحسين الموجّهات، واحتياجات QLoRA من VRAM حسب حجم النموذج، وTRL وUnsloth وAxolotl، وحماية بياناتك على GPU مستأجر، والتكلفة والتشغيل."
excerpt: "الضبط الدقيق بـ QLoRA لنموذج مفتوح بحجم 8B يتسع في GPU مستأجر واحد بذاكرة 24 GB، ويكلّف نحو $0.35 إلى $0.83 للجولة. قبل أن تدفع، تأكد أن الضبط الدقيق هو الأداة الصحيحة، وخطّط لكيفية بقاء بياناتك ملكك على جهاز يملكه غيرك."
pubDate: 2025-02-23
updatedDate: 2026-09-30
locale: "ar"
category: "tutorials"
featured: false
draft: false
author: "GPUFlow Team"
heroImage: "../_images/private-llm-fine-tuning-guide-hero.png"
heroImageAlt: "رسم لمجموعة بيانات خاصة تُستخدم في الضبط الدقيق لنموذج لغوي على خادم GPU مستأجر"
faq:
  - question: "كم أحتاج من VRAM للضبط الدقيق لنموذج بحجم 7B أو 8B؟"
    answer: "مع QLoRA، يذكر جدول متطلبات Unsloth نحو 5 GB لنموذج 7B و6 GB لنموذج 8B؛ أما LoRA العادية بدقة 16 بت فتحتاج إلى نحو 19 GB و22 GB. الجولات الحقيقية تحتاج إلى هامش للتسلسلات الأطول والدفعات الأكبر، فبطاقة 24 GB مثل RTX 3090 أو 4090 هي الخيار المريح."
  - question: "هل أستخدم الضبط الدقيق أم RAG؟"
    answer: "استخدم RAG عندما يحتاج النموذج إلى معلومات من مستنداتك، خصوصاً المعلومات التي تتغير. وجدت دراسة لـ Ovadia وآخرين في 2024 أن RAG تفوّق باستمرار على الضبط الدقيق غير الموجَّه في إضافة المعرفة. استخدم الضبط الدقيق عندما تحتاج إلى صيغة أو نبرة ثابتة، أو إلى سلوك في مهمة محددة لا يستطيع الموجّه وحده إنتاجه بموثوقية."
  - question: "كم يكلّف الضبط الدقيق لنموذج لغوي على GPU مستأجر؟"
    answer: "جولة QLoRA على نموذج 8B بـ 2,000 مثال تستغرق أكثر من ساعة بقليل بما فيها الإعداد، أي نحو $0.35 على RTX 4090 من Vast.ai بسعر $0.31 في الساعة، أو $0.83 بسعر RunPod المعلن $0.74 في الساعة (سبتمبر 2026). وجولة بـ 20,000 مثال تستغرق نحو أربع ساعات، أي من $1.24 إلى $2.97."
  - question: "هل يستطيع مضيف GPU رؤية بيانات التدريب الخاصة بي؟"
    answer: "المضيف يملك العتاد، فافترض أنه يستطيع. عزل الحاويات يحميك من المستأجرين الآخرين، لا من مالك الجهاز. استخدم مضيفين من مراكز بيانات خضعت للتدقيق (Vast.ai Secure Cloud، RunPod Secure Cloud) للبيانات الحساسة، واحذف البيانات الشخصية قبل الرفع، واحذف المثيل عند الانتهاء."
  - question: "ما الفرق بين LoRA وQLoRA؟"
    answer: "تجمّد LoRA النموذج الأساسي وتدرّب مصفوفات محوّلات (adapters) صغيرة. وQLoRA تفعل الشيء نفسه لكنها تحمّل النموذج الأساسي المجمَّد بدقة NF4 ذات 4 بت، ما خفّض الذاكرة بما يكفي للضبط الدقيق لنموذج 65B على GPU واحد بذاكرة 48 GB في الورقة الأصلية."
  - question: "هل يمكنني إجراء ضبط دقيق أو رفع نموذجي على GPUFlow؟"
    answer: "لا. GPUFlow للاستدلال فقط: تستأجر واجهة API للمحادثة متوافقة مع OpenAI لنماذج ثبّتها المزوّدون على أجهزتهم، عادةً باستخدام Ollama. لا يوجد سطر أوامر ولا وصول إلى الملفات، فلا يمكنك التدريب عليه ولا رفع نموذجك الخاص."
---

تستطيع إجراء ضبط دقيق لنموذج مفتوح الأوزان بحجم 8B على بياناتك باستخدام QLoRA على GPU مستأجر واحد بذاكرة 24 GB، والجولة المعتادة تكلّف أقل من دولار. الأسئلة الأصعب تأتي أولاً: هل الضبط الدقيق هو الحل الصحيح أصلاً (للمعلومات، الاسترجاع يفوز عادةً)، وكيف تبقى بياناتك خاصة على جهاز يملكه غيرك.

يتناول هذا الدليل الأمرين، ثم VRAM الذي تحتاج إليه حسب حجم النموذج، والأدوات الحالية، وسكربت تدريب يعمل، وحساباً فعلياً للتكلفة، وطريقة تشغيل النتيجة. راجعنا كل شيء في سبتمبر 2026، والمصادر في آخر المقال.

## الضبط الدقيق أم RAG أم موجّهات أفضل

الضبط الدقيق يغيّر طريقة تصرّف النموذج. وهو طريقة سيئة لتعليمه المعلومات. قارن Ovadia وآخرون بين الأسلوبين في حقن المعرفة، ووجدوا أن RAG "يتفوق باستمرار" على الضبط الدقيق غير الموجَّه، "سواء في المعرفة الموجودة التي مرّت أثناء التدريب أو في المعرفة الجديدة كلياً". وخلاصتهم: النماذج اللغوية الكبيرة تجد صعوبة في تعلّم معلومات جديدة عبر الضبط الدقيق.

لذا امشِ في هذه الشجرة قبل أن تستأجر أي شيء:

<figure>
<svg viewBox="0 0 720 420" role="img" aria-labelledby="d1-title" xmlns="http://www.w3.org/2000/svg" font-family="system-ui, sans-serif" font-size="15">
<title id="d1-title">شجرة قرار للاختيار بين الاسترجاع وتحسين الموجّهات والضبط الدقيق ونموذج أكبر</title>
<defs><marker id="d1-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#64748b"/></marker></defs>
<rect width="720" height="420" fill="#ffffff"/>
<rect x="60" y="15" width="280" height="40" rx="8" fill="#1e1b4b"/>
<text x="200" y="40" text-anchor="middle" fill="#ffffff" direction="rtl">الإجابات ليست جيدة بما يكفي</text>
<line x1="200" y1="55" x2="200" y2="83" stroke="#64748b" stroke-width="2" marker-end="url(#d1-arrow)"/>
<rect x="20" y="85" width="360" height="50" rx="8" fill="#ffffff" stroke="#f97316" stroke-width="2"/>
<text x="200" y="115" text-anchor="middle" fill="#1e1b4b" direction="rtl">معلومات ناقصة، أو بيانات تتغير؟</text>
<rect x="440" y="80" width="260" height="60" rx="10" fill="#f0fdf4" stroke="#16a34a" stroke-width="2"/>
<text x="570" y="105" text-anchor="middle" fill="#1e1b4b" font-weight="600" direction="rtl">استخدم RAG</text>
<text x="570" y="126" text-anchor="middle" fill="#64748b" font-size="13" direction="rtl">ابحث في مستنداتك مع كل طلب</text>
<line x1="380" y1="110" x2="438" y2="110" stroke="#64748b" stroke-width="2" marker-end="url(#d1-arrow)"/>
<text x="409" y="102" text-anchor="middle" fill="#16a34a" font-size="13" direction="rtl">نعم</text>
<line x1="200" y1="135" x2="200" y2="173" stroke="#64748b" stroke-width="2" marker-end="url(#d1-arrow)"/>
<text x="215" y="160" fill="#64748b" font-size="13" text-anchor="end" direction="rtl">لا</text>
<rect x="20" y="175" width="360" height="50" rx="8" fill="#ffffff" stroke="#f97316" stroke-width="2"/>
<text x="200" y="205" text-anchor="middle" fill="#1e1b4b" direction="rtl">هل تحلّها التعليمات والأمثلة؟</text>
<rect x="440" y="170" width="260" height="60" rx="10" fill="#f0fdf4" stroke="#16a34a" stroke-width="2"/>
<text x="570" y="195" text-anchor="middle" fill="#1e1b4b" font-weight="600" direction="rtl">حسّن الموجّه</text>
<text x="570" y="216" text-anchor="middle" fill="#64748b" font-size="13" direction="rtl">موجّه النظام وأمثلة few-shot</text>
<line x1="380" y1="200" x2="438" y2="200" stroke="#64748b" stroke-width="2" marker-end="url(#d1-arrow)"/>
<text x="409" y="192" text-anchor="middle" fill="#16a34a" font-size="13" direction="rtl">نعم</text>
<line x1="200" y1="225" x2="200" y2="263" stroke="#64748b" stroke-width="2" marker-end="url(#d1-arrow)"/>
<text x="215" y="250" fill="#64748b" font-size="13" text-anchor="end" direction="rtl">لا</text>
<rect x="20" y="265" width="360" height="50" rx="8" fill="#ffffff" stroke="#f97316" stroke-width="2"/>
<text x="200" y="295" text-anchor="middle" fill="#1e1b4b" direction="rtl">تحتاج إلى صيغة أو نبرة أو مهارة ثابتة؟</text>
<rect x="440" y="260" width="260" height="60" rx="10" fill="#eef2ff" stroke="#6366f1" stroke-width="2"/>
<text x="570" y="285" text-anchor="middle" fill="#1e1b4b" font-weight="600" direction="rtl">ضبط دقيق بـ QLoRA</text>
<text x="570" y="306" text-anchor="middle" fill="#64748b" font-size="13" direction="rtl">مئات الأمثلة الجيدة</text>
<line x1="380" y1="290" x2="438" y2="290" stroke="#64748b" stroke-width="2" marker-end="url(#d1-arrow)"/>
<text x="409" y="282" text-anchor="middle" fill="#16a34a" font-size="13" direction="rtl">نعم</text>
<line x1="200" y1="315" x2="200" y2="353" stroke="#64748b" stroke-width="2" marker-end="url(#d1-arrow)"/>
<text x="215" y="340" fill="#64748b" font-size="13" text-anchor="end" direction="rtl">لا</text>
<rect x="60" y="355" width="280" height="50" rx="10" fill="#f8fafc" stroke="#64748b" stroke-width="2"/>
<text x="200" y="385" text-anchor="middle" fill="#1e1b4b" direction="rtl">جرّب نموذجاً أساسياً أكبر</text>
<text x="570" y="370" text-anchor="middle" fill="#64748b" font-size="13" direction="rtl">RAG والضبط الدقيق يعملان معاً جيداً:</text>
<text x="570" y="390" text-anchor="middle" fill="#64748b" font-size="13" direction="rtl">اضبط السلوك، واسترجع المعلومات</text>
</svg>
<figcaption>معظم مشكلات "النموذج لا يعرف أشياءنا" هي مشكلات استرجاع. الضبط الدقيق يستحق تكلفته عندما تحتاج إلى السلوك نفسه في كل مرة: مخطط JSON، أو أسلوب كتابة خاص بالشركة، أو نظام تصنيف.</figcaption>
</figure>

أسباب وجيهة للضبط الدقيق:

- **صيغة مخرجات صارمة.** استخراج الحقول إلى المخطط الذي تريده في كل استدعاء، دون صفحة من التعليمات في كل موجّه.
- **الأسلوب والنبرة.** ردود دعم تبدو كأن فريقك كتبها، أو تقارير ببنية ثابتة.
- **مهمة محددة ينفّذها نموذج صغير.** نموذج 8B مضبوط يمكن أن يحل محل نموذج عام كبير في مهمة واحدة، وهذا مهم عندما تشغّله على عتاد رخيص.
- **موجّهات أقصر.** السلوك الذي تعلّمته الأوزان لا يحتاج إلى تكراره في كل طلب.

## LoRA وQLoRA

الضبط الدقيق الكامل يحدّث كل وزن، فيتعيّن على GPU أن يحمل التدرجات وحالة المُحسِّن (optimizer) لكل الأوزان فوق النموذج نفسه. أما LoRA فتجمّد النموذج الأساسي وتدرّب مصفوفات صغيرة منخفضة الرتبة بجانب طبقاته؛ وأفادت الورقة الأصلية بمعاملات قابلة للتدريب أقل 10,000 مرة وذاكرة GPU أقل ثلاث مرات مقارنةً بالضبط الدقيق الكامل لـ GPT-3 175B باستخدام Adam.

وQLoRA تذهب أبعد: يُحمَّل النموذج الأساسي المجمَّد بدقة NF4 ذات 4 بت، ولا تُدرَّب إلا المحوّلات بدقة 16 بت. استخدمها Dettmers وآخرون للضبط الدقيق لنموذج 65B على GPU واحد بذاكرة 48 GB "مع الحفاظ على أداء الضبط الدقيق الكامل بدقة 16 بت". وأضافت الورقة ثلاثة عناصر لا تزال الأدوات تستخدمها: نوع البيانات NF4، والتكميم المزدوج لثوابت التكميم، والمُحسِّنات المُقسَّمة إلى صفحات (paged optimizers) التي تمتص قفزات الذاكرة.

نتيجة أيٍّ منهما محوِّل (adapter)، أي مجلد فيه بضعة موتّرات (tensors)، تطبّقه فوق النموذج الأساسي دون تغييره. يمكنك إبقاؤه منفصلاً أو دمجه في الأوزان.

## كم تحتاج من VRAM

تنشر Unsloth جدولاً بالحد الأدنى من VRAM للضبط الدقيق حسب حجم النموذج. هذه أرقامها، مع تحسينات الذاكرة لديها؛ التدريب العادي عبر Hugging Face يحتاج إلى أكثر، والتسلسلات الأطول أو الدفعات الأكبر ترفع كل صف.

| حجم النموذج | QLoRA ‏(4 بت) | LoRA ‏(16 بت) | بطاقة مستأجرة تتسع لـ QLoRA بارتياح |
| --- | --- | --- | --- |
| 3B | 3.5 GB | 8 GB | أي بطاقة 12 GB فأكثر |
| 8B | 6 GB | 22 GB | RTX 3090 / 4090 ‏(24 GB) |
| 14B | 8.5 GB | 33 GB | RTX 3090 / 4090 ‏(24 GB) |
| 32B | 26 GB | 76 GB | بطاقة 48 GB ‏(RTX A6000، A40، L40S) |
| 70B | 41 GB | 164 GB | بطاقة 80 GB ‏(A100، H100) |

<figure>
<svg viewBox="0 0 720 320" role="img" aria-labelledby="d2-title" xmlns="http://www.w3.org/2000/svg" font-family="system-ui, sans-serif" font-size="15">
<title id="d2-title">مخطط أشرطة للحد الأدنى من VRAM للضبط الدقيق لنماذج 8B و14B و32B و70B باستخدام QLoRA وLoRA بدقة 16 بت، مقارنةً ببطاقات 24 و48 و80 GB</title>
<rect width="720" height="320" fill="#ffffff"/>
<rect x="200" y="12" width="14" height="14" fill="#6366f1"/>
<text x="220" y="24" fill="#1e1b4b" font-size="13" text-anchor="end" direction="rtl">QLoRA ‏4 بت</text>
<rect x="320" y="12" width="14" height="14" fill="#eef2ff" stroke="#6366f1" stroke-width="1.5"/>
<text x="340" y="24" fill="#1e1b4b" font-size="13" text-anchor="end" direction="rtl">LoRA ‏16 بت</text>
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
<text x="420" y="306" text-anchor="middle" fill="#64748b" font-size="13" direction="rtl">الحد الأدنى من VRAM بالـ GB (جدول متطلبات Unsloth)</text>
</svg>
<figcaption>QLoRA هي ما يجعل البطاقات الاستهلاكية المستأجرة مفيدة هنا: حتى 14B يتسع في بطاقة 24 GB مع هامش مريح، و32B يحتاج إلى بطاقة 48 GB، و70B إلى بطاقة 80 GB. ودون التحميل بدقة 4 بت، حتى 8B بالكاد يتسع في 24 GB.</figcaption>
</figure>

خياري الافتراضي نموذج 8B أو 14B على RTX 4090. إنها أرخص بطاقة مستأجرة تترك مساحة لتسلسلات من 2,048 توكن ودفعة معقولة، والنماذج في هذا النطاق سهلة التشغيل بعد ذلك. لاختيار نموذج أساسي حسب VRAM الذي ستشغّله عليه، راجع [أي نماذج الذكاء الاصطناعي تتسع في VRAM لديك](/ar/which-ai-models-fit-your-gpu-vram/).

## اختر أداة: TRL أو Unsloth أو Axolotl

الثلاث مفتوحة المصدر، وكلها تدعم LoRA وQLoRA.

| الأداة | طريقة الاستخدام | نقطة القوة | انتبه إلى |
| --- | --- | --- | --- |
| Hugging Face TRL + PEFT | Python ‏(`SFTTrainer`) | التطبيق المرجعي؛ DPO وGRPO وغيرها عبر الواجهة البرمجية نفسها | تستهلك ذاكرة أكثر من Unsloth في الجولة نفسها |
| Unsloth | Python، أو واجهة الويب Unsloth Studio | تدّعي سرعة مضاعفة وVRAM أقل بـ 70%؛ تصدّر إلى GGUF مباشرة | واجهة Studio بترخيص AGPL-3.0 (النواة Apache 2.0) |
| Axolotl | ملف YAML واحد، `axolotl train config.yml` | تعدد GPU ‏(FSDP، DeepSpeed)، ووصفات كثيرة | تحتاج إلى Python 3.11 فأحدث وPyTorch 2.11 فأحدث |

حتى سبتمبر 2026، TRL في الإصدار 1.14 وPEFT في 0.21. تحتاج Unsloth إلى Python من 3.11 إلى 3.13 وGPU من NVIDIA بقدرة CUDA ‏7.0 أو أحدث (V100، T4، سلسلة RTX 20 فما فوق). وتوصي Axolotl بـ Python 3.12 وPyTorch 2.12.1.

استخدم TRL إن أردت فهم كل سطر، وUnsloth إن كانت VRAM لديك محدودة أو أردت التصدير إلى GGUF باستدعاء واحد، وAxolotl إن كنت ستكرر الجولات بإعدادات مختلفة أو ستنتقل إلى عدة GPU. السكربت أدناه يستخدم TRL، لأنها أقصر طريق يُظهر كل جزء متحرك.

## جهّز البيانات

يقرأ `SFTTrainer` في TRL المحادثات بالشكل نفسه لطلب API المحادثة. كائن JSON واحد في كل سطر من `train.jsonl`:

```json
{"messages": [{"role": "system", "content": "Extract the invoice fields as JSON."}, {"role": "user", "content": "Invoice 4471 from Norden AB, due 12 March, total 1,250 EUR"}, {"role": "assistant", "content": "{\"invoice_id\": \"4471\", \"supplier\": \"Norden AB\", \"due\": \"2026-03-12\", \"total\": 1250, \"currency\": \"EUR\"}"}]}
```

قواعد عملية:

- **الجودة قبل العدد.** بضع مئات إلى بضعة آلاف من الأمثلة المتسقة والصحيحة تتفوق على عشرات الآلاف من الأمثلة المشوّشة. كل خطأ في البيانات سلوك تدفع لتعليمه.
- **طابِق بيئة الإنتاج.** استخدم موجّه النظام وصيغة المدخلات التي سيرسلها تطبيقك فعلاً.
- **احتفظ بـ 5 إلى 10% جانباً.** أبقِ أمثلة لا يتدرب عليها النموذج أبداً، لتقارن بها النموذج الأساسي والنموذج المضبوط جنباً إلى جنب.
- **احذف ما لا تحتاج إليه.** الأسماء وعناوين البريد وأرقام الحسابات والمعرّفات نادراً ما تساعد النموذج على تعلّم صيغة. استبدلها بقيم بديلة واقعية قبل أن تغادر البيانات جهازك.

القاعدة الأخيرة تتجاوز الجهاز المستأجر. استخرج Carlini وآخرون مئات التسلسلات الحرفية من بيانات تدريب GPT-2، منها أسماء وأرقام هواتف وعناوين بريد إلكتروني، وبعضها لم يظهر إلا في مستند تدريب واحد. النموذج المضبوط قد يكرر ما تدرّب عليه لأي شخص يستخدمه لاحقاً.

## حافظ على خصوصية البيانات على جهاز مستأجر

في سوق GPU، يملك الكمبيوتر شخص آخر. تقولها Vast.ai صراحة: "العملاء معزولون في حاويات Docker بلا صلاحيات مميزة، ولا يصلون إلا إلى بياناتهم"، و"أمان المزوّدين يتفاوت كثيراً". هذا العزل يحميك من المستأجرين الآخرين. ولا يحميك من الشخص الذي يملك وصولاً فعلياً إلى الجهاز وصلاحيات root على المضيف.

للبيانات الخاصة:

1. **اختر مضيفاً من مركز بيانات خضع للتدقيق.** مزوّدو Secure Cloud في Vast.ai هم "مراكز بيانات خضعت للتدقيق وحاصلة على شهادة ISO 27001 ومعايير مراكز البيانات من الفئة 3/4"، وتوصي بهم Vast للأعمال الحساسة. وتعمل Secure Cloud في RunPod في مراكز بيانات من الفئة T3/T4؛ أما Community Cloud فتوصلك بمزوّدين أفراد. فئات مراكز البيانات أغلى في الساعة، وتستحق ذلك هنا.
2. **لا ترفع إلا مجموعة البيانات المنظّفة،** عبر SSH ‏(`rsync -avP` أو `scp`). لا تضعها مؤقتاً في حاوية تخزين عامة أو رابط مشاركة في الطريق.
3. **أبقِ السجلات محلية.** في TRL 1.14 القيمة الافتراضية لـ `report_to` هي `"none"`، فلا يذهب شيء إلى أداة تتبّع التجارب ما لم تفعّلها. لا تستدعِ `push_to_hub` مع محوِّل مدرَّب على بيانات خاصة.
4. **أخرج النتائج، ثم احذف المثيل.** نزّل المحوِّل ومخرجات التقييم، وسجّل الخروج من Hugging Face ‏(`hf auth logout`) إذا استخدمت توكن، واحذف المثيل وأي وحدة تخزين. على Vast.ai يُفوتر التخزين ويُحتفظ به حتى يُحذف المثيل، لا حين يُوقف فقط.

حذف الملفات داخل حاوية لا يضمن مسح قرص المضيف، فالحماية الحقيقية هي الخطوتان 1 و2: اختر من يملك العتاد، وأرسل إليه أقل ما يمكن. مزيد من التفاصيل في [كيف تؤمّن مجموعة بياناتك على عقدة GPU عامة](/ar/how-to-secure-dataset-on-public-gpu-node/). وإذا كانت سياستك تمنع أي عتاد لطرف ثالث، فالسكربت نفسه يعمل على بطاقتك الخاصة ذات 24 GB.

## التدريب: سكربت QLoRA باستخدام TRL

على جهاز Linux مستأجر فيه RTX 3090 أو 4090:

```bash
python -m venv venv && source venv/bin/activate
pip install torch trl peft bitsandbytes datasets
```

ثم `train.py`، وفق نمط QLoRA في وثائق PEFT لدى TRL. النموذج Qwen3-8B مرخّص بـ Apache 2.0 وغير محميّ بموافقة، فلا حاجة إلى توكن Hugging Face:

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

الخيارات المهمة:

- **`learning_rate=2e-4`.** توصي وثائق TRL بنحو 10 أضعاف معدل الضبط الدقيق المعتاد مع QLoRA. إذا ارتفعت خسارة التقييم بينما تنخفض خسارة التدريب، فأنت تفرط في التعلّم (overfitting): قلّل عدد الحقب.
- **`r=16`، `target_modules="all-linear"`.** محوّلات على كل طبقة خطية، وهو الإعداد الذي تستخدمه اختبارات Unsloth المعيارية. الرتبة 16 تكفي للصيغة والأسلوب؛ ارفعها للمهام الأصعب.
- **`max_length=2048`.** الأمثلة الأطول تُقتطع. افحص أطوال بياناتك بالتوكنات؛ الحد الأطول يحتاج إلى VRAM أكثر.
- **دفعة فعلية 16** ‏(4 × 4 خطوات تراكم). إذا نفدت الذاكرة، اخفض `per_device_train_batch_size` وارفع التراكم ليبقى الناتج نفسه.

قبل أن تطفئ الجهاز، مرّر الأمثلة التي احتفظت بها جانباً عبر النموذج الأساسي والنموذج المضبوط وقارن بينهما. هذا هو الاختبار الوحيد الذي يخبرك هل أنجز المال شيئاً.

## كم يكلّف

وقت التدريب = إجمالي التوكنات ÷ الإنتاجية. نشرت GigaGPU، وهي شركة استضافة، قياساً قدره نحو 3,500 توكن تدريب في الثانية لـ Llama 3.1 8B مع QLoRA على RTX 4090. بافتراض معدل مماثل لـ Qwen3-8B:

**جولة صغيرة:** 2,000 مثال × 600 توكن × 3 حقب = 3.6 مليون توكن. ‏3,600,000 ÷ 3,500 = 1,029 ثانية، أي نحو 17 دقيقة.

| الخطوة | الوقت |
| --- | --- |
| إعداد البيئة | 10 دقائق |
| تنزيل Qwen3-8B ‏(16.4 GB من الأوزان) ورفع البيانات | 10 دقائق |
| التدريب | 17 دقيقة |
| مقارنة النموذج الأساسي والمضبوط على البيانات المحتفظ بها | 15 دقيقة |
| الدمج والتصدير والتنزيل وحذف المثيل | 15 دقيقة |
| **الإجمالي** | **67 دقيقة (1.12 ساعة)** |

- RTX 4090 على Vast.ai بسعر $0.31 في الساعة: 1.12 × $0.31 = **$0.35**
- RTX 4090 على RunPod بسعر $0.74 في الساعة (السعر المعلن في صفحة الأسعار): 1.12 × $0.74 = **$0.83**

**جولة أكبر:** 20,000 مثال × 1,000 توكن × 2 حقبة = 40 مليون توكن ÷ 3,500 = 11,429 ثانية، أي نحو 3.2 ساعة. مع 50 دقيقة من الأعباء نفسها، 4.0 ساعات: **$1.24** على Vast.ai أو **$2.97** على RunPod.

لنموذج 32B، تعرض RunPod بطاقات 48 GB بسعر $0.49 في الساعة (A40) و$0.53 في الساعة (RTX A6000) و$1.09 في الساعة (L40S) حتى سبتمبر 2026. ليس لدي رقم إنتاجية منشور لـ QLoRA على 32B بهذه البطاقات، فشغّل 50 خطوة، واقرأ زمن الخطوة من السجل، وأجرِ الضرب نفسه قبل أن تلتزم بجولة طويلة.

الأسعار أرقام سبتمبر 2026 من صفحة أسعار RunPod ومن أداة تتبّع getdeploying.com لـ Vast.ai. فئات Secure ومراكز البيانات أغلى من أرخص عروض المجتمع. الصورة الأشمل في [مقارنة أسعار استئجار GPU](/ar/gpu-rental-pricing-comparison-2026/).

## شغّل النتيجة

لديك خياران: إبقاء المحوِّل منفصلاً، أو دمجه في النموذج.

**أبقِه منفصلاً مع vLLM.** يحمّل vLLM محوّلات LoRA بجانب النموذج الأساسي ويعرض كل واحد منها كاسم نموذج على خادمه المتوافق مع OpenAI:

```bash
vllm serve Qwen/Qwen3-8B --enable-lora --lora-modules invoices=./out/adapter
```

ثم يرسل العملاء `"model": "invoices"`. ويمكن لعدة محوّلات أن تتشارك نموذجاً أساسياً واحداً على GPU واحد.

**ادمجه وشغّله في Ollama.** ادمج المحوِّل في أوزان بالدقة الكاملة، وحوّلها إلى GGUF باستخدام llama.cpp، وكمّمها، ثم استوردها:

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

تُجري Unsloth الدمج والتصدير إلى GGUF باستدعاء واحد (`model.save_pretrained_gguf("dir", tokenizer, quantization_method="q4_k_m")`). وتحذّر وثائقها من أن السبب الأكثر شيوعاً للإجابات السيئة بعد التصدير هو قالب المحادثة الخاطئ: شغّل النموذج بالقالب الذي درّبت به. والمفاضلة بين Ollama وvLLM وTGI موجودة في [اختبارنا لأداء الاستدلال على RTX 4090](/ar/ollama-vs-vllm-vs-tgi-rtx-4090-benchmark/).

### أين يقع GPUFlow من هذا

لا يستطيع GPUFlow تنفيذ التدريب: فهو يؤجّر واجهة API متوافقة مع OpenAI على GPU لدى مزوّد، دون سطر أوامر أو SSH أو وصول إلى الملفات. ولا يستطيع أيضاً تشغيل نموذجك المضبوط. لا يستطيع المستأجرون رفع نماذج؛ النماذج المعروضة هي ما ثبّته كل مزوّد (عادةً باستخدام Ollama)، مثل `qwen2.5:7b` أو `llama3.1:8b`.

ما يمكن أن يفيد فيه هو الخطوة التي تسبق هذا كله: أن تتحقق، ببضعة سنتات، هل ينجز نموذج مفتوح جاهز مع موجّه جيد المهمة أصلاً، وهي النتيجة الأرخص في شجرة القرار. استخدم لذلك بيانات اختبار، لا البيانات الخاصة التي يدور حولها هذا الدليل: الموجّهات والإجابات تمر عبر جهاز المزوّد نصاً غير مشفّر طوال مدة الاستئجار. طريقة العمل في [البدء السريع مع API](https://docs.gpuflow.app/ar/renters/api-quickstart/)، ومقال [استخدام المفتاح في التطبيقات](/ar/use-openai-compatible-api-key-in-apps/) يشرح ربطه بالأدوات الموجودة.

## المصادر

راجعناها كلها في سبتمبر 2026.

- الأوراق: [Hu وآخرون، LoRA](https://arxiv.org/abs/2106.09685)؛ [Dettmers وآخرون، QLoRA](https://arxiv.org/abs/2305.14314)؛ [Ovadia وآخرون، Fine-Tuning or Retrieval?](https://arxiv.org/abs/2312.05934)؛ [Carlini وآخرون، Extracting Training Data from Large Language Models](https://arxiv.org/abs/2012.07805)
- Hugging Face TRL: ‏[SFT Trainer](https://huggingface.co/docs/trl/sft_trainer)، [تكامل PEFT وQLoRA](https://huggingface.co/docs/trl/peft_integration)
- Unsloth: ‏[المتطلبات وجدول VRAM](https://unsloth.ai/docs/get-started/fine-tuning-for-beginners/unsloth-requirements.md)، [الاختبارات المعيارية](https://unsloth.ai/docs/basics/unsloth-benchmarks.md)، [الحفظ بصيغة GGUF](https://unsloth.ai/docs/basics/inference-and-deployment/saving-to-gguf.md)، [GitHub](https://github.com/unslothai/unsloth)
- [Axolotl على GitHub](https://github.com/axolotl-ai-cloud/axolotl)
- النموذج: [بطاقة نموذج Qwen3-8B](https://huggingface.co/Qwen/Qwen3-8B)
- إنتاجية التدريب: [GigaGPU، الضبط الدقيق على RTX 4090](https://gigagpu.com/rtx-4090-fine-tuning-guide/)
- المضيفون والأمان: [الأسئلة الشائعة عن الأمان في Vast.ai](https://docs.vast.ai/documentation/reference/faq/security)، [أسعار Vast.ai](https://docs.vast.ai/guides/instances/pricing.md)، [نظرة عامة على الـ Pods في RunPod](https://docs.runpod.io/pods/overview)
- الأسعار: [أسعار RunPod](https://www.runpod.io/pricing)، وgetdeploying.com لـ [Vast.ai](https://getdeploying.com/vast-ai) و[RTX 4090](https://getdeploying.com/reference/cloud-gpu/nvidia-rtx-4090)
- التشغيل: [محوّلات LoRA في vLLM](https://docs.vllm.ai/en/latest/features/lora.html)، [أداة quantize في llama.cpp](https://github.com/ggml-org/llama.cpp/blob/master/tools/quantize/README.md)، [الاستيراد في Ollama](https://docs.ollama.com/import)
- GPUFlow: [البدء السريع مع API](https://docs.gpuflow.app/ar/renters/api-quickstart/)
