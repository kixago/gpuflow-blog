---
title: "Ollama مقابل vLLM مقابل TGI على RTX 4090: ما تُظهره الاختبارات"
description: "Ollama وvLLM وHugging Face TGI لنموذج 8B على RTX 4090: الإنتاجية تحت الضغط من مصادر منشورة، والذاكرة VRAM، والتكميم، وواجهات OpenAI، وحالة صيانة TGI."
excerpt: "مع طلب واحد في كل مرة، تعمل المحركات بسرعة متقاربة على RTX 4090. ومع مستخدمين كثيرين في آن واحد، يتقدم vLLM بفارق كبير. وTGI الآن في وضع الصيانة. أرقام منشورة، ومصادرها، وما يجب أن تختار."
pubDate: 2026-02-25
updatedDate: 2026-09-30
locale: "ar"
category: "benchmarks"
featured: false
draft: false
author: "GPUFlow Team"
heroImage: "../_images/rtx4090-inference-benchmark-hero.png"
heroImageAlt: "اختبار أداء الاستدلال على GPU من نوع RTX 4090 معروض في الطرفية مع مقاييس الأداء"
faq:
  - question: "هل vLLM أسرع من Ollama على RTX 4090؟"
    answer: "فقط عندما تعمل طلبات كثيرة في آن واحد. في اختبار أجرته ComputingForGeeks في سبتمبر 2026 على Qwen2.5-7B بتكميم 4 بت، ولّد كلاهما نحو 174 توكناً في الثانية لطلب واحد على RTX 4090. ومع 64 طلباً في آن واحد، وصل vLLM إلى 6,623 توكناً في الثانية إجمالاً وOllama إلى 2,018."
  - question: "هل لا يزال Hugging Face TGI قيد الصيانة والتطوير؟"
    answer: "بالحد الأدنى فقط. تقول وثائق TGI إنه في وضع الصيانة ولا يقبل إلا إصلاحات الأخطاء الصغيرة وتعديلات الوثائق، وقد أُرشف مستودعه على GitHub للقراءة فقط في 21 مارس 2026. وتوصي Hugging Face بدلاً منه بـ vLLM أو SGLang، أو بـ llama.cpp وMLX للاستخدام المحلي."
  - question: "كم تستهلك vLLM من ذاكرة VRAM لنموذج 8B؟"
    answer: "افتراضياً يحجز vLLM ‏90% من ذاكرة GPU ‏(gpu-memory-utilization 0.9)، أي نحو 21.6 GB على RTX 4090 بذاكرة 24 GB، أياً كان حجم النموذج. وما لا تستخدمه الأوزان يصبح ذاكرة KV cache للطلبات المتزامنة."
  - question: "هل يستطيع Ollama خدمة عدة مستخدمين في آن واحد؟"
    answer: "نعم، لكن الإعداد الافتراضي طلب واحد في كل مرة لكل نموذج (OLLAMA_NUM_PARALLEL=1). يمكنك رفعه، وكل خانة متوازية تضيف ذاكرة السياق الخاصة بها. تُظهر الاختبارات المنشورة أن Ollama يتوسع أقل من vLLM تحت التزامن الكثيف."
  - question: "هل لدى Ollama وvLLM وTGI واجهات API متوافقة مع OpenAI؟"
    answer: "نعم. الثلاثة تخدم /v1/chat/completions. ويخدم Ollama وvLLM أيضاً completions وembeddings وResponses API؛ أما Messages API المتوافقة مع OpenAI في TGI فموجودة منذ الإصدار 1.4.0."
  - question: "هل يمكنني تشغيل Llama 3.1 8B بدقة FP16 على GPU بذاكرة 24 GB؟"
    answer: "نعم. 8.03 مليار معامل بواقع 2 بايت لكل منها تعني نحو 16.1 GB من الأوزان، وهذا يتسع في 24 GB مع مساحة لـ KV cache متواضعة. ومعظم من يخدمون النماذج على بطاقة استهلاكية واحدة يستخدمون أوزاناً بتكميم 4 أو 8 بت ليتركوا مساحة أكبر للسياق وللمستخدمين المتزامنين."
---

على RTX 4090 واحدة تخدم نموذجاً بحجم 7B إلى 8B، يعمل Ollama وvLLM بسرعة متقاربة مع طلب واحد في كل مرة. الفجوة تنفتح عندما تصل طلبات كثيرة معاً: في اختبار منشور في سبتمبر 2026 بـ 64 طلباً متزامناً، أنتج vLLM نحو ثلاثة أضعاف إنتاجية Ollama الإجمالية. أما Hugging Face TGI فلا يزال يعمل، لكنه في وضع الصيانة منذ أرشفة مستودعه في مارس 2026، وHugging Face نفسها توجّه الناس الآن إلى vLLM وSGLang.

فالاختيار يرجع إلى عدد من يطلبون النموذج في الوقت نفسه. مستخدم واحد، أو سكربت، أو أداة داخلية صغيرة: Ollama، لأنه الأقل جهداً. API عامة أو مهام دفعية بطلبات كثيرة قيد التنفيذ: vLLM. نشر جديد على TGI: لن أبدأه.

## من أين تأتي الأرقام

كانت نسخة سابقة من هذه الصفحة تعرض أرقاماً للإنتاجية والكمون والذاكرة VRAM مقدَّمة على أنها قياساتنا الخاصة على RTX 4090. لم نستطع إرجاعها إلى تشغيل قابل للتكرار أو إلى مصدر منشور، فحذفناها. ومن أسباب الشك: أرقام FP16 القديمة لطلب واحد كانت أعلى مما يسمح به عرض النطاق الترددي لذاكرة RTX 4090 (انظر القسم التالي).

كل رقم أدناه منسوب الآن إلى من نشره، مع العتاد والنموذج اللذين استخدمهما. وحيث لم ينشر أحد مقارنة نظيفة على RTX 4090 (كما في حالة TGI)، أقول ذلك بدلاً من ملء الفراغ.

المصادر الرئيسية:

- **ComputingForGeeks، 18 سبتمبر 2026.** Ollama وvLLM وllama.cpp على RTX 4090 وL40S وRTX 5090. النموذج: Qwen2.5-7B-Instruct، بتكميم AWQ 4 بت لـ vLLM وGGUF Q4_K_M لـ Ollama وllama.cpp. موجّه ثابت من 512 توكناً، ودرجة حرارة 0، وحتى 256 توكناً في الخرج، وسياق من 4,096 توكناً لكل خانة، و64 خانة متوازية.
- **Red Hat Developer، 8 أغسطس 2025.** Ollama 0.9.2 مقابل vLLM 0.9.1 على A100 40 GB واحدة، مع Llama 3.1 8B Instruct بدقة FP16، ومن 1 إلى 256 مستخدماً متزامناً، والقياس بأداة GuideLLM.
- **BentoML، 5 يونيو 2024.** vLLM 0.4.2 وTGI 2.0.4 وغيرهما على A100 80 GB مع Llama 3 8B Instruct.
- **لوحة نتائج llama.cpp على CUDA.** سرعة الطلب الواحد لـ Llama 2 7B Q4_0 على بطاقات كثيرة، منها RTX 4090.

الأول وحده أُجري على RTX 4090 مع كل المحركات التي يتناولها هذا المقال باستثناء TGI. والبقية تُظهر النمط نفسه على بطاقات مراكز البيانات.

## طلب واحد: البطاقة تحدد السقف

عندما تولّد GPU توكنات لطلب واحد، يجب أن تقرأ كل أوزان النموذج من الذاكرة لكل توكن. لذا فعرض النطاق الترددي للذاكرة، لا المحرك، هو ما يحدد الحد الأعلى.

لدى RTX 4090 ذاكرة GDDR6X بسعة 24 GB وعرض نطاق 1,008 GB/s. ولدى Llama 3.1 8B ‏8.03 مليار معامل.

- بدقة FP16، هذا 8.03 × 2 بايت ≈ 16.1 GB من الأوزان. 1,008 ÷ 16.1 ≈ **63 توكناً في الثانية**، كحد أقصى، لطلب واحد.
- الوسم الافتراضي `llama3.1:8b` في Ollama هو Q4_K_M، وحجم تنزيله 4.9 GB. ‏1,008 ÷ 4.9 ≈ **205 توكنات في الثانية**، كحد أقصى.

المحركات الحقيقية تقع تحت هذين السقفين. تُظهر لوحة نتائج llama.cpp أن RTX 4090 تولّد 186 توكناً في الثانية مع Llama 2 7B بتكميم Q4_0 ‏(189 مع flash attention). وقاست ComputingForGeeks نحو 174 توكناً في الثانية لطلب واحد مع Qwen2.5-7B بتكميم 4 بت، ووجدت vLLM وllama.cpp وOllama متطابقة "تقريباً" على 4090. (على L40S وRTX 5090، كانت نسخة Ollama لديهم تفك الترميز بنحو نصف سرعة llama.cpp، فتحقق من بطاقتك وإصدارك.)

لمستخدم واحد في كل مرة، اختر المحرك بحسب السهولة، واختر التكميم بحسب السرعة. الانتقال من FP16 إلى 4 بت يضاعف السقف ثلاث مرات تقريباً. أما تغيير المحرك فبالكاد يحرّكه.

## طلبات كثيرة: التجميع هو الحَكَم

مع طلبات كثيرة قيد التنفيذ، تستطيع GPU قراءة الأوزان مرة واحدة واستخدامها لدفعة كاملة من الطلبات. عندئذ يصبح المهم مدى إتقان المحرك للتجميع (batching)، وكيف يدير KV cache (ذاكرة كل طلب لما سبق من المحادثة).

<figure>
<svg viewBox="0 0 720 310" role="img" aria-labelledby="d1-title" xmlns="http://www.w3.org/2000/svg" font-family="system-ui, sans-serif" font-size="15">
<title id="d1-title">مخطط أشرطة للإنتاجية الإجمالية على RTX 4090 مع 64 طلباً متزامناً: vLLM ‏6,623، وllama.cpp ‏2,391، وOllama ‏2,018 توكناً في الثانية</title>
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
<text x="410" y="256" text-anchor="middle" fill="#64748b" font-size="13" direction="rtl">إجمالي توكنات الخرج في الثانية، 64 طلباً في آن واحد</text>
<text x="360" y="290" text-anchor="middle" fill="#1e1b4b" font-size="14" direction="rtl">طلب واحد في كل مرة: نحو 174 توكناً في الثانية على المحركات الثلاثة</text>
</svg>
<figcaption>RTX 4090، ‏Qwen2.5-7B-Instruct بتكميم 4 بت (AWQ لـ vLLM، وGGUF Q4_K_M للبقية)، 64 طلباً متزامناً. الأرقام من ComputingForGeeks، سبتمبر 2026؛ والأشرطة مرسومة بمقياس دقيق. لم يكن TGI جزءاً من هذا الاختبار.</figcaption>
</figure>

على RTX 4090، خدم vLLM ‏6,623 توكناً في الثانية إجمالاً عبر 64 طلباً، وخادم llama.cpp ‏2,391، وOllama ‏2,018. وقد أُعدّ Ollama إعداداً منصفاً لهذا الاختبار: `OLLAMA_NUM_PARALLEL=64` و`num_ctx 4096` مع تفعيل flash attention. وعمل vLLM بالإعدادات `--quantization awq_marlin --max-model-len 4096 --gpu-memory-utilization 0.90`. وذكر الكاتبون أيضاً أن زمن أول توكن كان نحو 8 إلى 12 ms لـ llama.cpp و16 إلى 25 ms لـ vLLM، وأن Ollama كان الأعلى على L40S وRTX 5090.

واختبار Red Hat على A100 يشير إلى الاتجاه نفسه بأوزان FP16. بلغت ذروة vLLM ‏793 توكناً في الثانية؛ بينما لم يحقق Ollama بالإعدادات الافتراضية سوى 41. وبعد رفع حد التوازي في Ollama إلى 32، "أعلى قيمة مستقرة"، ظل عاجزاً عن مجاراة vLLM عند أي مستوى من التزامن. "ارتفع زمن أول توكن لديه بشكل حاد مع زيادة المستخدمين"، وأظهر الكمون بين التوكنات "قفزات هائلة" عند ذروة الحمل.

تحذيران قبل أن تستشهد بهذه الأرقام أمام أحد. أولاً، مقارنة ComputingForGeeks ليست متكافئة تماماً: عمل vLLM بأوزان AWQ، والبقية بأوزان GGUF، والنسخ مختلفة. ثانياً، هذه مجاميع عبر كل الطلبات. كل واحد من المستخدمين الـ 64 يرى نحو 6,623 ÷ 64 ≈ 103 توكنات في الثانية على vLLM، وهي سرعة مريحة جداً، ونحو 2,018 ÷ 64 ≈ 32 على Ollama.

## أين يقف TGI

كان Text Generation Inference خادم الإنتاج لدى Hugging Face، مع التجميع المستمر (continuous batching)، وFlash Attention وPaged Attention، وتوازي الموترات (tensor parallelism)، ومقاييس Prometheus، وتتبع OpenTelemetry. تقنياً كان في فئة vLLM نفسها.

تغيّر وضعه. تبدأ وثائق TGI الآن بعبارة: "text-generation-inference الآن في وضع الصيانة. من الآن فصاعداً، سنقبل طلبات الدمج لإصلاحات الأخطاء الصغيرة وتحسينات الوثائق ومهام الصيانة الخفيفة." وتوصي "بـ vllm وSGLang، وكذلك المحركات المحلية المتوافقة معها مثل llama.cpp أو MLX." وقد أُرشف مستودع GitHub وجُعل للقراءة فقط في 21 مارس 2026.

لم أجد اختباراً حديثاً منشوراً لـ TGI على RTX 4090. أقرب مقارنة موثوقة هي مقارنة BentoML على A100 80 GB من يونيو 2024: مع Llama 3 8B، وصل vLLM إلى "2300-2500 توكن في الثانية، على نحو مشابه لـ TGI"، وكان لدى vLLM أفضل زمن لأول توكن عند كل مستوى تزامن اختبروه. مضى على ذلك عامان وإصدارات كثيرة للمحركين، فاعتبره تاريخاً.

إذا كان TGI يخدم حركة الإنتاج لديك الآن، فسيستمر في العمل. أما لنشر جديد، فستختار خادماً لن يحصل على معماريات نماذج جديدة ولا على تحسينات في الأداء. وعلى RTX 4090 واحدة، يغطي vLLM كل ما كان TGI يفعله.

## ذاكرة VRAM على بطاقة 24 GB

تتعامل المحركات مع الذاكرة بطرق مختلفة جداً، وهذا يؤثر فيما يمكن أن يشاركها البطاقة.

**vLLM يأخذ معظم البطاقة من البداية.** القيمة الافتراضية لـ `--gpu-memory-utilization` هي 0.9، فعلى RTX 4090 بذاكرة 24 GB يحجز نحو 21.6 GB عند التشغيل أياً كان حجم النموذج. وكل ما لا تستخدمه الأوزان يصبح KV cache. مع Llama 3.1 8B بدقة FP16 (نحو 16.1 GB)، يبقى نحو 5.5 GB لـ KV cache والتنشيطات وCUDA graphs، وهذا يحدّ من طول السياق ومن عدد الطلبات التي تتسع في آن واحد. ومع أوزان AWQ بتكميم 4 بت (كان حجم نسخة ComputingForGeeks نحو 5.6 GB)، يذهب معظم الـ 21.6 GB إلى KV cache، وبهذا يحافظ على 64 طلباً في آن واحد. لا تتوقع أن تشغّل برنامج GPU آخر بجانبه إلا إذا خفّضت تلك النسبة.

**Ollama يخصص الذاكرة لكل نموذج ولكل سياق.** نموذج `llama3.1:8b` بتكميم Q4_K_M حجمه 4.9 GB، مضافاً إليه KV cache لنافذة السياق. يختار Ollama السياق الافتراضي بحسب ذاكرة VRAM لديك: 4k تحت 24 GiB، و32k من 24 إلى 48 GiB، و256k عند 48 GiB فأكثر. تقع RTX 4090 على حد الـ 24 GiB تماماً (يُبلغ nvidia-smi عن أقل من 24 GiB بقليل)، فتحقق بـ `ollama ps` من السياق الذي حصلت عليه فعلاً، أو حدده بنفسك. والخانات المتوازية تضاعف ذلك: مثال الوثائق أن "سياقاً من 2K مع 4 طلبات متوازية سينتج سياقاً من 8K وتخصيصاً إضافياً للذاكرة". إذا كانت الذاكرة ضيقة، فتكميم KV cache يساعد: `q8_0` يستخدم نحو نصف ذاكرة `f16` الافتراضي، و`q4_0` نحو ربعها. ويستطيع Ollama أيضاً إبقاء ما يصل إلى ثلاثة نماذج محمّلة على كل GPU افتراضياً، إن اتسعت، وهذا يناسب بطاقة تتنقل بين النماذج. ولمعرفة أي النماذج تتسع أصلاً في بطاقات 8 و12 و16 و24 GB، راجع [أي نماذج الذكاء الاصطناعي تتسع في ذاكرة VRAM لديك](/ar/which-ai-models-fit-your-gpu-vram/).

**TGI** يحجز الذاكرة مسبقاً أيضاً للتجميع المستمر، مثل vLLM. لم أجد رقماً حديثاً وقابلاً للاستشهاد لذاكرة VRAM لنموذج 8B على 4090، فلن أذكر رقماً.

## التكميم وصيغ النماذج

| | Ollama | vLLM | TGI |
| --- | --- | --- | --- |
| **الصيغة الرئيسية** | GGUF (مثل Q4_K_M) | Hugging Face safetensors | Hugging Face safetensors |
| **خيارات 4 بت** | متغيرات GGUF Q4 | AWQ وGPTQ وbitsandbytes وINT4 W4A16 | AWQ وGPTQ وMarlin وEXL2 وbitsandbytes NF4/FP4 |
| **8 بت / FP8** | GGUF Q8_0 | FP8 W8A8 على Ada ‏(RTX 4090) وHopper؛ INT8 | bitsandbytes 8 بت، EETQ، ‏fp8 |
| **GGUF** | أصلي | مدعوم | غير مذكور |
| **تكميم KV cache** | q8_0، ‏q4_0 | نعم | لا نتناوله هنا |

RTX 4090 بطاقة من معمارية Ada ‏(SM 8.9)، فمسار FP8 في vLLM يعمل عليها. أوزان FP8 تأخذ نصف ذاكرة FP16: نحو 8 GB لنموذج 8B، وهي حل وسط بين FP16 و4 بت على 4090 واحدة.

مكتبة نماذج Ollama تقدم وسوم GGUF مكمّمة مسبقاً، فنادراً ما تفكر في الأمر: `ollama pull llama3.1:8b` يعطيك Q4_K_M. أما مع vLLM فتختار نقطة حفظ (checkpoint) مكمّمة مسبقاً من Hugging Face أو تمرر خيار تكميم بنفسك.

## خوادم متوافقة مع OpenAI والإعداد

الثلاثة تعطيك واجهة HTTP بأسلوب OpenAI، فتعمل حزم OpenAI SDK ومعظم أدوات المحادثة بمجرد تغيير عنوان الأساس (base URL).

| | Ollama | vLLM | TGI |
| --- | --- | --- | --- |
| **العنوان الافتراضي** | `localhost:11434/v1` | `localhost:8000/v1` | المنفذ 80 في الحاوية (يُربط غالباً بـ 8080) |
| **Chat completions** | نعم | نعم | نعم (Messages API، منذ 1.4.0) |
| **نقاط OpenAI الأخرى** | completions وmodels وembeddings وresponses | completions وembeddings وresponses وaudio | لا نتناوله هنا |
| **التثبيت** | سكربت واحد | حزمة pip | صورة Docker |

تشغيل نموذج 8B، بحسب وثائق كل مشروع:

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

Ollama هو الأقل جهداً بفارق واضح. يتولى التنزيلات والملفات المكمّمة والتحميل والإلغاء من الذاكرة، ويعمل بالطريقة نفسها على حاسوب محمول وعلى خادم مستأجر. لكن طبقة OpenAI في Ollama فيها ثغرات: لا `logprobs` ولا `tool_choice` في chat completions، ويجب أن تكون الصور بترميز base64 لا روابط. أما vLLM فيحتاج إلى بيئة CUDA وPython تعمل جيداً وإلى خيارات أكثر لضبطها، لكنه المحرك الذي توصي به Hugging Face الآن بدلاً من TGI. وTGI سهل إن كنت تستخدم Docker أصلاً، مع تحفظ الصيانة المذكور أعلاه.

## أي محرك لأي مهمة

**Ollama** لشخص واحد، أو سكربت، أو مساعد برمجة، أو أداة داخلية لعدد قليل من المستخدمين، أو جهاز يتنقل بين عدة نماذج. الإعداد يستغرق دقائق، وسرعة الطلب الواحد على 4090 لا تقل عن أي محرك آخر.

**vLLM** عندما تصل طلبات كثيرة في الوقت نفسه: API عامة، أو منتج محادثة متعدد المستخدمين، أو مهام دفعية يمكنك تشغيلها 32 أو 64 في آن واحد. تُظهر الأرقام المنشورة نحو ثلاثة أضعاف إنتاجية Ollama الإجمالية على RTX 4090 عند 64 طلباً متزامناً، وأكثر بكثير على A100. ولديه أيضاً أوسع دعم للتكميم ولواجهات API.

**TGI** فقط إن كنت تشغّله أصلاً. وللعمل الجديد، نصيحة Hugging Face نفسها هي vLLM أو SGLang.

عندما تستأجر بالساعة، تتبع التكلفة الإنتاجية. خذ مليون توكن خرج على RTX 4090 بسعر $0.31 في الساعة، وهو أرخص سعر عند الطلب على Vast.ai أدرجه getdeploying.com في سبتمبر 2026، باستخدام أرقام ComputingForGeeks:

- طلب واحد في كل مرة، 174 توكناً/ث: 1,000,000 ÷ 174 ≈ 5,750 ث ≈ 1.6 ساعة ≈ **$0.50**.
- 64 طلباً في آن واحد على Ollama، ‏2,018 توكناً/ث: ≈ 496 ث ≈ **$0.04**.
- 64 طلباً في آن واحد على vLLM، ‏6,623 توكناً/ث: ≈ 151 ث ≈ **$0.01**.

تفترض هذه الأرقام أن GPU مشغولة طوال الوقت. إذا لم يكن لديك أبداً إلا طلب واحد قيد التنفيذ، فالتجميع لا يضيف لك شيئاً واختيار المحرك لا يغيّر فاتورتك. وإذا كانت لديك قائمة انتظار من العمل، فهو يغيّرها بمرتبة عشرية كاملة. والمنطق نفسه، مقارناً بواجهات API بالتوكن، تجده في [GPU بالساعة أم API بالتوكن](/ar/hourly-gpu-vs-per-token-api/).

## أين يقع GPUFlow

يثبّت برنامج التثبيت لمزوّدي GPUFlow ‏Ollama افتراضياً، ويمرر وكيل GPUFlow الطلبات إليه، لذا فعمود Ollama أعلاه هو عادةً الذي ينطبق هناك. تستأجر مفتاح API متوافقاً مع OpenAI ‏(`https://gpuflow.app/v1`، مع `/v1/chat/completions` و`/v1/models`، ودعم البث streaming) لنموذج على GPU لدى المزوّد. تدفع مقابل الوقت، بالثانية مع حد أدنى دقيقة واحدة، لا مقابل التوكنات.

ما لا يمكنك فعله على GPUFlow: اختيار المحرك، أو تغيير إعداداته، أو تشغيل كودك الخاص. لا يوجد SSH ولا سطر أوامر. لإعادة إجراء الاختبارات أعلاه أو لتشغيل vLLM بنفسك، استأجر جهازاً يمكنك تسجيل الدخول إليه على Vast.ai أو RunPod ‏([مقارنة بينهما](/ar/runpod-vs-vastapi-comparison/)). ولاستخدام نموذج يخدمه Ollama من تطبيق دون تثبيت أي شيء، راجع [سوق GPUFlow](https://gpuflow.app/ar/marketplace) و[كيف تستخدم المفتاح في الأدوات الشائعة](/ar/use-openai-compatible-api-key-in-apps/).

وإذا كنت قد ضبطت نموذجك الخاص بدقة وتقرر كيف تخدمه، فإن [دليل الضبط الدقيق لنماذج LLM الخاصة](/ar/private-llm-fine-tuning-guide/) يتناول الخطوة التي تسبق هذه.

## المصادر

راجعناها كلها في سبتمبر 2026.

- Ollama مقابل vLLM مقابل llama.cpp على RTX 4090 وL40S وRTX 5090: [ComputingForGeeks](https://computingforgeeks.com/ollama-vs-vllm-vs-llama-cpp/) ‏(18 سبتمبر 2026)
- Ollama مقابل vLLM على A100 40 GB: [Red Hat Developer](https://developers.redhat.com/articles/2025/08/08/ollama-vs-vllm-deep-dive-performance-benchmarking) ‏(8 أغسطس 2025)
- vLLM وTGI وغيرهما على A100 80 GB: [BentoML، اختبار أداء خلفيات استدلال LLM](https://www.bentoml.com/blog/benchmarking-llm-inference-backends) ‏(5 يونيو 2024)
- لوحة نتائج llama.cpp على CUDA: [github.com/ggml-org/llama.cpp/discussions/15013](https://github.com/ggml-org/llama.cpp/discussions/15013)
- ذاكرة RTX 4090 وعرض نطاقها: [مراجعة TechPowerUp](https://www.techpowerup.com/review/nvidia-geforce-rtx-4090-founders-edition/)
- معاملات Llama 3.1 8B وترخيصه: [بطاقة النموذج على Hugging Face](https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct)
- Ollama: [الأسئلة الشائعة (الطلبات المتوازية، KV cache)](https://docs.ollama.com/faq)، [طول السياق](https://docs.ollama.com/context-length)، [التوافق مع OpenAI](https://docs.ollama.com/api/openai-compatibility)، [الوسم llama3.1:8b](https://ollama.com/library/llama3.1:8b)
- vLLM: [الخادم المتوافق مع OpenAI](https://docs.vllm.ai/en/latest/serving/online_serving/openai_compatible_server/)، [التكميم](https://docs.vllm.ai/en/latest/features/quantization/index.html)، [معاملات المحرك (gpu-memory-utilization)](https://docs.vllm.ai/en/v0.6.4/models/engine_args.html)
- TGI: [الوثائق وإشعار الصيانة](https://huggingface.co/docs/text-generation-inference/en/index)، [مستودع GitHub (مؤرشف)](https://github.com/huggingface/text-generation-inference)، [Messages API](https://huggingface.co/docs/text-generation-inference/en/messages_api)، [التكميم](https://huggingface.co/docs/text-generation-inference/en/conceptual/quantization)
- سعر استئجار RTX 4090: [getdeploying.com](https://getdeploying.com/reference/cloud-gpu/nvidia-rtx-4090)
- GPUFlow: [البدء السريع مع API](https://docs.gpuflow.app/ar/renters/api-quickstart/)، [البدء للمزوّدين](https://docs.gpuflow.app/ar/providers/getting-started/)
