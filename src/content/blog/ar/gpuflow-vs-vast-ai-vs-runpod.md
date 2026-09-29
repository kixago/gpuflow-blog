---
title: "GPUFlow أم Vast.ai أم RunPod أم SaladCloud: أي منصة لاستئجار GPU تناسب عملك؟"
description: "مقارنة جنباً إلى جنب بين أربع منصات لاستئجار GPU في 2026: ما تحصل عليه فعلاً، وكيف تعمل الفوترة، والرسوم الإضافية، ووسائل الدفع، وأسعار RTX 4090 و3090، والمهام التي تناسب كل منصة."
excerpt: "تؤجّر هذه المنصات الأربع وحدات GPU بطرق مختلفة جداً. جهاز كامل، أو حاوية، أو مفتاح API: إليك ما يناسب التدريب والاستدلال والمهام الدفعية وتطوير التطبيقات."
pubDate: 2026-09-29
locale: "ar"
category: "comparisons"
featured: true
draft: false
author: "GPUFlow Team"
heroImage: "../_images/gpu-rental-platforms-compared-hero.png"
heroImageAlt: "ثلاثة أعمدة بارتفاعات مختلفة تمثّل منصات استئجار GPU"
faq:
  - question: "ما الفرق الرئيسي بين GPUFlow وVast.ai وRunPod؟"
    answer: "تؤجّر لك Vast.ai وRunPod حاوية أو جهازاً مع وصول عبر SSH أو Jupyter أو ما شابه، فتستطيع تشغيل أي برنامج. أما GPUFlow فيؤجّر لك مفتاح API متوافقاً مع OpenAI لنماذج ذكاء اصطناعي تعمل مسبقاً على GPU يملكه شخص آخر. لا تستطيع تشغيل كودك الخاص عليه، لكن لا يوجد شيء تُعدّه."
  - question: "أي منصة هي الأرخص لاستئجار RTX 4090؟"
    answer: "في سبتمبر 2026 رأينا RTX 4090 بسعر يبدأ من نحو $0.37 في الساعة على Vast.ai (بحسب getdeploying.com)، و$0.34 على RunPod Community Cloud (غير متوفرة حينها)، و$0.74 على RunPod Secure Cloud، و$0.33 على SaladCloud. على GPUFlow يحدد المزوّدون أسعارهم بأنفسهم؛ والنطاق المعتاد على مواقع التأجير بين $0.30 و$0.46."
  - question: "هل أستطيع تدريب نموذج أو ضبطه (fine-tuning) على GPUFlow؟"
    answer: "لا. يمنحك GPUFlow وصولاً إلى النماذج للمحادثة عبر API. للتدريب أو الضبط تحتاج إلى منصة تمنحك الجهاز نفسه، مثل Vast.ai أو RunPod أو TensorDock."
  - question: "أي المنصات تقبل العملات المشفرة؟"
    answer: "تقبل Vast.ai العملات المشفرة عبر BitPay وCrypto.com، وتقبلها RunPod (مع التحقق من الهوية KYC قبل أول دفعة بالعملات المشفرة)، وتقبل SaladCloud عملات USDC وUSDT وRENDER على شبكة Solana. أما GPUFlow فيقبل البطاقات عبر Stripe."
---

عبارة "استأجر GPU" تعني أشياء مختلفة على منصات مختلفة. على بعضها تحصل على حاوية كاملة تسجّل الدخول إليها. وعلى أخرى تحصل على نقطة اتصال تشغّل حاويتك نيابة عنك. وعلى GPUFlow تحصل على مفتاح API لنموذج ذكاء اصطناعي. الخيار الصحيح يعتمد على ما تحاول فعله أكثر مما يعتمد على السعر.

قارنّا أربع منصات تؤجّر وحدات GPU استهلاكية مثل RTX 3090 و4090. راجعنا كل ما هنا في سبتمبر 2026 على وثائق كل منصة وصفحات أسعارها، والمصادر في آخر المقال.

## ما تحصل عليه فعلاً

| | GPUFlow | Vast.ai | RunPod | SaladCloud |
| --- | --- | --- | --- | --- |
| **ما تستأجره** | مفتاح API لنماذج ذكاء اصطناعي على GPU واحد | حاوية على جهاز المضيف | pod (حاوية)، أو workers بلا خادم (serverless) | مجموعات حاويات على أجهزة كمبيوتر منزلية |
| **كيف تستخدمه** | API متوافق مع OpenAI: `/v1/models` و`/v1/chat/completions` | SSH وJupyter | SSH وJupyterLab وVS Code وweb proxy | API الخاص بحاويتك؛ SSH إلى المثيلات العاملة |
| **تشغيل كودك الخاص** | لا | نعم | نعم | نعم |
| **الإعداد قبل أول استخدام** | لا شيء | اختيار صورة وتنزيل نموذجك | اختيار قالب وتنزيل نموذجك | بناء حاوية ونشرها |
| **أين توجد وحدات GPU** | أجهزة المزوّدين الخاصة | من الأفراد إلى مراكز البيانات | Secure Cloud (مراكز بيانات) وCommunity Cloud | أجهزة كمبيوتر استهلاكية ("Chefs") |

## المال

| | GPUFlow | Vast.ai | RunPod | SaladCloud |
| --- | --- | --- | --- | --- |
| **الفوترة** | بالثانية، بحد أدنى دقيقة واحدة | بالثانية، دون حد أدنى | بالثانية | بالثانية |
| **رسوم التخزين** | لا يوجد | يحددها المضيف، وتُحتسب أيضاً أثناء الإيقاف | $0.10 لكل GB شهرياً؛ و$0.20 لقرص volume في pod متوقف | غير مذكورة (سعر GPU يشمل وحدات vCPU وذاكرة RAM) |
| **نقل البيانات** | لا يوجد | يحدده المضيف، ويُحتسب كل بايت | مجاني | غير مذكور |
| **للبدء** | حد أدنى للشحن $10، دون رسوم | حد أدنى للإيداع $5 | رصيد ساعة واحدة على الأقل؛ $100 للبطاقات مسبقة الدفع | الشحن من $5 |
| **الدفع** | بطاقة (Stripe) | بطاقة، BitPay، Crypto.com | بطاقة، عملات مشفرة، فواتير لما يزيد على $5,000 | بطاقة، عملات مشفرة على Solana |
| **صلاحية الرصيد** | لا تنتهي؛ ووقت الاستئجار غير المستخدم يُسترد | — | — | 12 شهراً من الشراء |

الشَّرطة تعني أننا لم نجد قاعدة بهذا الشأن في وثائق المنصة.

## أسعار البطاقات الشائعة، سبتمبر 2026

لكل GPU في الساعة، عند الطلب:

| GPU | Vast.ai | RunPod Community / Secure | SaladCloud |
| --- | --- | --- | --- |
| RTX 3090 | من نحو $0.11 – $0.12 | $0.22 / $0.50 | $0.17 |
| RTX 4090 | من نحو $0.37 | $0.34 (غير متوفرة) / $0.74 | $0.33 |
| RTX 5090 | نحو $0.43 | $0.69 (غير متوفرة) / $0.99 | $0.50 |

أسعار Vast.ai وSaladCloud مأخوذة من getdeploying.com، لأن جدول أسعار Vast نفسه لم يُحمَّل حين راجعناه. وتبيع SaladCloud أيضاً سعة بأولوية أدنى وبسعر أقل، ويمكن أن تُقاطَع. ورفعت RunPod أسعار Secure Cloud في 20 سبتمبر 2026، بينما لم تتغير أسعار Community Cloud.

على GPUFlow يحدد كل مزوّد سعره بنفسه. النطاق المعتاد على مواقع التأجير هو $0.11 – $0.31 لـ RTX 3090 و$0.30 – $0.46 لـ RTX 4090، ويُظهر نموذج الإعلان في GPUFlow للمزوّدين موقع سعرهم ضمن هذا النطاق.

تذكّر أن هذه المنتجات ليست متماثلة. حاوية بسعر $0.30 تحتاج إلى 20 دقيقة من الإعداد، ومفتاح API بسعر $0.35 يعمل فوراً، يكلّفان مبلغين مختلفين في مهمة مدتها ساعة. ويتناول مقال [التكلفة الحقيقية لاستئجار GPU](/ar/hidden-fees-in-gpu-rental/) هذه الرسوم الإضافية بالتفصيل.

## أيها يناسب عملك

### تدريب نموذج أو ضبطه

**Vast.ai أو RunPod.** تحتاج إلى البيئة كاملة: كودك وبياناتك ومكتباتك. Vast.ai أرخص عادةً؛ وRunPod لديها قوالب جاهزة أكثر وفئة مراكز بيانات. GPUFlow لا يستطيع ذلك: فهو لا يمنحك جهازاً.

### تشغيل حاويتك على نطاق واسع

**SaladCloud أو RunPod serverless.** كلاهما يشغّل حاويتك على وحدات GPU كثيرة ويتولى التوسّع. يعمل Salad على أجهزة كمبيوتر استهلاكية، لذا قد تُقاطَع المثيلات ولا يبقى التخزين المحلي؛ صمّم مهمتك على هذا الأساس. وتحتسب RunPod serverless وقت البدء ومهلة الخمول فوق وقت المعالجة.

### استدعاء نموذج مفتوح من تطبيق أو سكربت أو أداة محادثة

**GPUFlow**، إذا كان أحد المزوّدين يشغّل النموذج الذي تريده. تحصل على مفتاح متوافق مع OpenAI، فتعمل مكتبات OpenAI وLangChain وOpen WebUI ومعظم تطبيقات المحادثة بمجرد تغيير العنوان الأساسي. لا يوجد خادم تصونه، وتدفع بالثانية عن الساعات التي تحجزها. وإذا أنهيت مبكراً، يعود الباقي إلى رصيدك. [كيف تستخدم المفتاح في أدواتك](/ar/use-openai-compatible-api-key-in-apps/).

ما لا يفعله GPUFlow: embeddings، وتوليد الصور، وResponses API، وتشغيل كودك الخاص. كما أن النموذج يعمل على كمبيوتر المزوّد نفسه، فتمر موجّهاتك (prompts) عبره. لا ترسل أي شيء لن تشاركه مع شخص غريب.

### تجربة نموذج قبل شراء GPU

**أي منها.** على GPUFlow يستغرق الأمر بضع دقائق دون أي إعداد. وعلى Vast.ai أو RunPod يمكنك أيضاً اختبار إعدادات خادم الاستدلال الخاص بك. وفي الحالتين، تكلّف الساعة أقل من فنجان قهوة.

### تحتاج فقط إلى توكنات رخيصة من نموذج شائع

**ربما لا شيء من هذه.** إذا كانت واجهة API مستضافة تقدّم النموذج الذي تريده، فقد يكون التسعير بالتوكن أرخص بكثير من استئجار GPU. أجرينا الحساب في [GPU بالساعة أم API بالتوكن](/ar/hourly-gpu-vs-per-token-api/).

## إذا كان لديك GPU تريد تأجيره

| | GPUFlow | Vast.ai | Salad |
| --- | --- | --- | --- |
| **نظام التشغيل** | Linux بإصدار 64-bit مع systemd | Ubuntu | Windows 10/11 |
| **ما يستطيع المستأجرون الوصول إليه** | نماذج الذكاء الاصطناعي لديك عبر خادم الترحيل (relay) في GPUFlow. لا سطر أوامر ولا منافذ مفتوحة | حاوية على جهازك | أحمال عمل Salad |
| **حصتك** | 88% | تقول Vast إن الأسعار المعروضة أعلى عادةً بنحو 25% مما يربحه المضيفون | غير منشورة |
| **السحب** | إلى حساب مصرفي عبر Stripe، الحد الأدنى $25، و$2.50 لكل عملية سحب | Wise أو PayPal أو Stripe، الحد الأدنى $20 | PayPal وبطاقات الهدايا وغيرها |

الحساب الكامل لكل بطاقة موجود في [كم تربح من تأجير بطاقة الرسومات](/ar/how-much-can-you-earn-renting-out-your-gpu/).

## الخلاصة

- **تحتاج إلى جهاز؟** Vast.ai للسعر، وRunPod للسهولة ولخيار مراكز البيانات.
- **تحتاج إلى خدمة حاويات قابلة للتوسّع؟** SaladCloud أو RunPod serverless.
- **تحتاج إلى نموذج ذكاء اصطناعي خلف API بأسلوب OpenAI، دون أي إعداد؟** GPUFlow.
- **تحتاج إلى أرخص التوكنات من نموذج شائع؟** راجع واجهات API المستضافة بالتوكن أولاً.

## المصادر

راجعناها كلها في سبتمبر 2026.

- GPUFlow: [الاستئجار](https://docs.gpuflow.app/ar/renters/getting-started/)، [الفوترة](https://docs.gpuflow.app/ar/renters/billing/)، [API](https://docs.gpuflow.app/ar/renters/api-quickstart/)، [المزوّدون](https://docs.gpuflow.app/ar/providers/getting-started/)، [الحصول على الأرباح](https://docs.gpuflow.app/ar/providers/getting-paid/)، [نطاقات الأسعار](https://docs.gpuflow.app/ar/providers/pricing/)
- Vast.ai: [البدء السريع](https://docs.vast.ai/guides/get-started/quickstart.md)، [الأسعار](https://docs.vast.ai/guides/instances/pricing.md)، [الفوترة](https://docs.vast.ai/documentation/reference/billing)، [الاستضافة](https://docs.vast.ai/host/hosting-overview.md)، [مدفوعات المضيفين](https://docs.vast.ai/host/payment.md)، [أرباح المضيفين](https://vast.ai/article/how-much-money-can-you-earn-renting-out-your-gpu-on-vast-ai)
- RunPod: [الأسعار](https://www.runpod.io/pricing)، [أسعار pods](https://docs.runpod.io/pods/pricing)، [أسعار serverless](https://docs.runpod.io/serverless/pricing)، [الفوترة](https://docs.runpod.io/references/billing-information)، [pods](https://docs.runpod.io/pods/overview)
- تغيير أسعار RunPod Secure Cloud: [usagepricing.com](https://www.usagepricing.com/blueprint/activity/runpod-2026-09-20-secure-cloud-price-hike)
- SaladCloud: [الفوترة](https://docs.salad.com/general/explanation/billing.md)، [فوترة الحاويات](https://docs.salad.com/container-engine/explanation/billing-pricing/billing.md)، [التسعير حسب الأولوية](https://docs.salad.com/container-engine/explanation/billing-pricing/priority-pricing.md)، [SSH](https://docs.salad.com/container-engine/explanation/container-groups/ssh-and-terminal.md)، [Salad للمضيفين](https://salad.com/download/)
- الأسعار: getdeploying.com لـ [RTX 3090](https://getdeploying.com/reference/cloud-gpu/nvidia-rtx-3090) و[RTX 4090](https://getdeploying.com/reference/cloud-gpu/nvidia-rtx-4090) و[RTX 5090](https://getdeploying.com/reference/cloud-gpu/nvidia-rtx-5090) و[Vast.ai](https://getdeploying.com/vast-ai) و[Salad](https://getdeploying.com/salad)
