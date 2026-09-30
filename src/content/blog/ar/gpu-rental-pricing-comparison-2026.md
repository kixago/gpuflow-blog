---
title: "أسعار استئجار GPU في 2026: AWS وGoogle Cloud وAzure وRunPod وVast"
description: "أسعار GPU بالساعة في سبتمبر 2026 على AWS وGoogle Cloud وAzure وLambda وRunPod وVast.ai وGPUFlow: من RTX 3090 إلى H100، عند الطلب وSpot، مع أمثلة محسوبة للتكلفة."
excerpt: "تكلّف وحدة H100 واحدة $11.06 في الساعة على Google Cloud وأقل من $2 على Vast.ai. هذه أسعار سبتمبر 2026 لوحدات GPU الشائعة، وما يشمله كل رقم، وتكلفة ثلاث مهام حقيقية."
pubDate: 2026-02-07
updatedDate: 2026-09-30
locale: "ar"
category: "pricing"
featured: false
draft: false
author: "GPUFlow Team"
heroImage: "../_images/gpu-rental-pricing-comparison-2026-hero.png"
heroImageAlt: "أشرطة أفقية بأطوال مختلفة تقارن أسعار استئجار GPU بالساعة لدى مزوّدي السحابة والأسواق"
faq:
  - question: "كم تكلفة استئجار H100 بالساعة في 2026؟"
    answer: "في سبتمبر 2026 كانت وحدة H100 واحدة تكلّف $6.88 في الساعة على AWS ‏(p5.4xlarge)، و$6.98 على Azure ‏(H100 NVL بذاكرة 94 GB)، ونحو $11.06 لكل GPU على جهاز A3 ذي الثماني وحدات في Google Cloud، و$3.99 على Lambda، ومن $2.69 إلى $3.49 على RunPod، وابتداءً من نحو $1.47 على Vast.ai."
  - question: "ما أرخص طريقة لاستئجار RTX 4090؟"
    answer: "السوق. في سبتمبر 2026 كانت أرخص عروض RTX 4090 عند الطلب نحو $0.31 إلى $0.33 في الساعة على Vast.ai و$0.34 على RunPod Community Cloud. أما RunPod Secure Cloud فكانت تتقاضى $0.74. ولا تؤجّر AWS وGoogle Cloud وAzure بطاقات RTX الاستهلاكية."
  - question: "كم تكلّف A100 80GB بالساعة؟"
    answer: "في سبتمبر 2026: $1.39 على RunPod Community Cloud، و$1.59 على RunPod Secure Cloud، و$2.79 لكل GPU على Lambda، و$3.67 على Azure ‏(NC24ads A100 v4)، و$5.07 على Google Cloud ‏(a2-ultragpu-1g)، و$3.43 لكل GPU على AWS، حيث يجب أن تستأجر وحدات p4de.24xlarge الثماني كلها بسعر $27.45 في الساعة."
  - question: "لماذا وحدات GPU على AWS وGoogle Cloud وAzure أغلى بكثير؟"
    answer: "مثيلات GPU لديها تأتي مع كثير من المعالجات والذاكرة وأقراص NVMe المحلية، وبعض وحدات GPU لا تُباع إلا في أجهزة من 8 وحدات. وأنت تدفع أيضاً مقابل اتفاقية مستوى الخدمة (SLA) ومقابل وجود GPU بجانب بقية حسابك السحابي. أسعار Spot والالتزامات لمدة سنة إلى 3 سنوات تسدّ جزءاً كبيراً من الفجوة."
  - question: "كيف يعمل التسعير في GPUFlow؟"
    answer: "يحدد كل مزوّد سعراً بالساعة بالدولار الأمريكي لوحدة GPU لديه. تحجز ساعات كاملة، ويُحجز المبلغ الكامل من رصيدك عند بدء الاستئجار، وتدفع بالثانية مع حد أدنى دقيقة واحدة. يعود الوقت غير المستخدم إلى رصيدك عند انتهاء الاستئجار. يحتفظ المزوّدون بـ 88% ويحتفظ GPUFlow بـ 12%."
  - question: "هل تستحق مثيلات GPU من نوع Spot العناء؟"
    answer: "للعمل الذي يمكن استئنافه من نقطة حفظ، نعم: في سبتمبر 2026 كانت H100 على AWS ‏(p5.4xlarge) بسعر $2.62 في الساعة كـ Spot مقابل $6.88 عند الطلب. أما العمل الذي لا يحتمل المقاطعة، فيضيع التوفير في أول مرة تضطر فيها إلى تشغيل المهمة مرتين."
---

في سبتمبر 2026، تكلّف وحدة H100 واحدة نحو $6.90 في الساعة على AWS أو Azure، و$11.06 لكل GPU على Google Cloud، و$3.99 على Lambda، ومن $2.69 إلى $3.49 على RunPod، وابتداءً من نحو $1.50 على Vast.ai. البطاقات الاستهلاكية لا توجد إلا في الأسواق: تكلّف RTX 4090 من $0.31 إلى $0.34 في الساعة في الطرف الأرخص، و$0.74 في فئة مراكز البيانات لدى RunPod. ولوحدة H100 نفسها، تكلّف أغلى ساعة عند الطلب نحو سبعة أضعاف ونصف أرخص ساعة.

يعرض باقي المقال مصدر كل رقم، وما يشمله السعر بالساعة، وتكلفة ثلاث مهام نموذجية من أولها إلى آخرها. كل الأسعار عند الطلب (on-demand) ما لم يُذكر غير ذلك، في مناطق أمريكية (us-east-1 على AWS، وEast US على Azure، وus-central1 على Google Cloud)، بنظام Linux، وقد راجعناها في سبتمبر 2026. الأسعار تتغير كل شهر، فاعتبرها لقطة في وقت محدد، وراجع المصدر قبل أن تنفق مالاً.

## الأسعار في لمحة

وحدات GPU لمراكز البيانات، بالدولار لكل GPU في الساعة:

| المزوّد | L4 24 GB | A10G / A10 24 GB | A100 80 GB | H100 |
| --- | --- | --- | --- | --- |
| AWS | $0.81 ‏(g6.xlarge) | $1.01 ‏(g5.xlarge، A10G) | $3.43 (في p4de بثماني وحدات فقط) | $6.88 ‏(p5.4xlarge) |
| Google Cloud | $0.71 ‏(g2-standard-4) | غير متاح | $5.07 ‏(a2-ultragpu-1g) | $11.06 ‏(A3 بثماني وحدات ÷ 8) |
| Azure | غير متاح | $3.20 ‏(NV36ads A10 v5) | $3.67 ‏(NC24ads A100 v4) | $6.98 ‏(NC40ads H100 v5، NVL بذاكرة 94 GB) |
| Lambda | غير متاح | غير متاح | $2.79 | $3.99 |
| RunPod Community / Secure | غير متاح / $0.49 | غير متاح | $1.39 / $1.59 | $2.69 / $3.49 |
| Vast.ai | من نحو $0.27 | غير متاح | من نحو $0.43 | من نحو $1.47 |

"غير متاح" تعني أننا لم نجد خياراً مطابقاً بوحدة GPU واحدة في قائمة أسعار ذلك المزوّد. البطاقات الاستهلاكية، بالدولار في الساعة:

| GPU | Vast.ai (أرخص عرض) | RunPod Community / Secure | النطاق المعتاد على مواقع الاستئجار |
| --- | --- | --- | --- |
| RTX 3090 24 GB | $0.11 – $0.13 | $0.22 / $0.50 | $0.11 – $0.31 |
| RTX 4090 24 GB | $0.31 – $0.33 | $0.34 / $0.74 | $0.30 – $0.46 |
| RTX 5090 32 GB | $0.41 – $0.47 | $0.69 / $0.99 | $0.41 – $0.69 |

لا تدرج AWS وGoogle Cloud وAzure وLambda بطاقات RTX الاستهلاكية. أرقام Vast.ai نطاقات لأن لقطتين من getdeploying.com في اليوم نفسه أعطتا حدّين أدنيين مختلفين قليلاً، وهذا يخبرك بشيء عن أسعار الأسواق. العمود الأخير هو النطاق الذي جمعه [دليل التسعير لمزوّدي GPUFlow](https://docs.gpuflow.app/ar/providers/pricing/) من Vast.ai وRunPod وSalad وSimplePod وTensorDock وHyperstack وLambda في سبتمبر 2026.

## ما يشمله السعر بالساعة

هذه الأرقام لا تشتري المنتج نفسه تماماً، وهذا أهم من الخانة العشرية الثانية.

مثيل السحابات الكبرى يضم أشياء كثيرة غير GPU. يأتي p5.4xlarge على AWS مع 16 وحدة vCPU و256 GiB من الذاكرة و3.84 TB من أقراص NVMe المحلية. ولدى NC24ads A100 v4 على Azure ‏24 وحدة vCPU و220 GiB من الذاكرة. أما NV36ads A10 v5، وهو حجم Azure الذي يعطيك A10 كاملة، ففيه 36 وحدة vCPU و440 GiB من الذاكرة وترخيص GRID لمحطات العمل الافتراضية، وهذا يفسر جزئياً لماذا يكلّف ثلاثة أضعاف ما تتقاضاه AWS مقابل بطاقة مشابهة. إذا كنت لا تحتاج إلا إلى GPU، فأنت تدفع ثمن كل ذلك على أي حال.

بعض وحدات GPU لا تأتي إلا في أجهزة كبيرة. على AWS تُباع A100 80 GB على شكل p4de.24xlarge: ثماني وحدات، $27.45 في الساعة، ولا حجم أصغر. وجهاز H100 من فئة A3 High على Google Cloud في جدولنا هو a3-highgpu-8g بثماني وحدات بسعر $88.49 في الساعة. تعرض قائمة أسعار Lambda سعراً لكل GPU، لكن مواصفات الجهاز التي تذكرها بجانب H100 ‏(208 vCPU و1,800 GiB من الذاكرة) تصف نظاماً متعدد الوحدات، فتحقق من الأحجام المتاحة فعلاً قبل أن تبني خطتك على $3.99.

أسعار الأسواق يحددها مالك الجهاز. على Vast.ai يحدد كل مضيف سعره، ويُسعَّر التخزين ونقل البيانات بشكل منفصل لكل عرض. تربط RunPod Community Cloud مزوّدين مستقلين، بينما تعمل Secure Cloud في مراكز بيانات من الفئتين Tier 3 وTier 4. وتكلّف RTX 4090 نفسها $0.34 في الأولى و$0.74 في الثانية.

ما لا يشمله السعر بالساعة (القرص، ونقل البيانات، ووقت الإعداد، ووقت الخمول) نتناوله في [التكلفة الحقيقية لاستئجار GPU](/ar/hidden-fees-in-gpu-rental/). في المهام الصغيرة قد تزيد هذه الإضافات على تكلفة وقت GPU نفسه.

## أسعار H100 جنباً إلى جنب

<figure>
<svg viewBox="0 0 720 380" role="img" aria-labelledby="d1-title" xmlns="http://www.w3.org/2000/svg" font-family="system-ui, sans-serif" font-size="15">
<title id="d1-title">مخطط أشرطة لأسعار H100 عند الطلب لكل GPU في الساعة في سبتمبر 2026، من 11.06 دولار على Google Cloud إلى 1.47 دولار على Vast.ai</title>
<rect x="0" y="0" width="720" height="380" fill="#ffffff"/>
<text x="20" y="28" fill="#1e1b4b" font-weight="600" text-anchor="end" direction="rtl">وحدة H100 واحدة، عند الطلب، بالدولار لكل GPU في الساعة</text>
<line x1="190" y1="44" x2="190" y2="316" stroke="#e2e8f0" stroke-width="1"/>
<text x="190" y="336" text-anchor="middle" fill="#64748b" font-size="13">$0</text>
<line x1="270" y1="44" x2="270" y2="316" stroke="#e2e8f0" stroke-width="1"/>
<text x="270" y="336" text-anchor="middle" fill="#64748b" font-size="13">$2</text>
<line x1="350" y1="44" x2="350" y2="316" stroke="#e2e8f0" stroke-width="1"/>
<text x="350" y="336" text-anchor="middle" fill="#64748b" font-size="13">$4</text>
<line x1="430" y1="44" x2="430" y2="316" stroke="#e2e8f0" stroke-width="1"/>
<text x="430" y="336" text-anchor="middle" fill="#64748b" font-size="13">$6</text>
<line x1="510" y1="44" x2="510" y2="316" stroke="#e2e8f0" stroke-width="1"/>
<text x="510" y="336" text-anchor="middle" fill="#64748b" font-size="13">$8</text>
<line x1="590" y1="44" x2="590" y2="316" stroke="#e2e8f0" stroke-width="1"/>
<text x="590" y="336" text-anchor="middle" fill="#64748b" font-size="13">$10</text>
<line x1="670" y1="44" x2="670" y2="316" stroke="#e2e8f0" stroke-width="1"/>
<text x="670" y="336" text-anchor="middle" fill="#64748b" font-size="13">$12</text>
<text x="180" y="69" text-anchor="end" fill="#1e1b4b">Google Cloud</text>
<rect x="190" y="50" width="442.4" height="26" rx="3" fill="#6366f1"/>
<text x="640.4" y="69" fill="#1e1b4b">$11.06</text>
<text x="180" y="107" text-anchor="end" fill="#1e1b4b">Azure (H100 NVL)</text>
<rect x="190" y="88" width="279.2" height="26" rx="3" fill="#6366f1"/>
<text x="477.2" y="107" fill="#1e1b4b">$6.98</text>
<text x="180" y="145" text-anchor="end" fill="#1e1b4b">AWS</text>
<rect x="190" y="126" width="275.2" height="26" rx="3" fill="#6366f1"/>
<text x="473.2" y="145" fill="#1e1b4b">$6.88</text>
<text x="180" y="183" text-anchor="end" fill="#1e1b4b">Lambda</text>
<rect x="190" y="164" width="159.6" height="26" rx="3" fill="#16a34a"/>
<text x="357.6" y="183" fill="#1e1b4b">$3.99</text>
<text x="180" y="221" text-anchor="end" fill="#1e1b4b">RunPod Secure</text>
<rect x="190" y="202" width="139.6" height="26" rx="3" fill="#16a34a"/>
<text x="337.6" y="221" fill="#1e1b4b">$3.49</text>
<text x="180" y="259" text-anchor="end" fill="#1e1b4b">RunPod Community</text>
<rect x="190" y="240" width="107.6" height="26" rx="3" fill="#16a34a"/>
<text x="305.6" y="259" fill="#1e1b4b">$2.69</text>
<text x="180" y="297" text-anchor="start" fill="#1e1b4b" direction="rtl">Vast.ai (الأرخص)</text>
<rect x="190" y="278" width="58.8" height="26" rx="3" fill="#16a34a"/>
<text x="256.8" y="297" fill="#1e1b4b">$1.47</text>
<line x1="190" y1="44" x2="190" y2="316" stroke="#64748b" stroke-width="1.5"/>
<rect x="190" y="352" width="14" height="14" fill="#6366f1"/>
<text x="212" y="364" fill="#64748b" font-size="13" text-anchor="end" direction="rtl">السحابات الكبرى</text>
<rect x="360" y="352" width="14" height="14" fill="#16a34a"/>
<text x="382" y="364" fill="#64748b" font-size="13" text-anchor="end" direction="rtl">سحابات GPU والأسواق</text>
</svg>
<figcaption>أسعار H100 عند الطلب لوحدة GPU واحدة، سبتمبر 2026. سعر Google Cloud هو سعر جهاز A3 ذي الثماني وحدات مقسوماً على 8. حجم Azure بوحدة واحدة يستخدم H100 NVL بذاكرة 94 GB. رقم Vast.ai هو أرخص عرض ذكره getdeploying.com في ذلك اليوم.</figcaption>
</figure>

الرسم بمقياس دقيق. هناك أمران لافتان. السحابات الثلاث الكبرى تتجمع حول $7 لكل GPU، وGoogle Cloud أعلى من ذلك بكثير في جهاز A3 ذي الثماني وحدات. والفرق بين AWS وأرخص عرض على Vast.ai يتجاوز أربعة أضعاف، لبطاقة تجري الحسابات نفسها.

ما تشتريه بالمال الإضافي حقيقي: اتفاقية مستوى خدمة (SLA)، ووثائق الامتثال، وبقية بنيتك التحتية في المكان نفسه، وعقد دعم. وما تتخلى عنه في السوق حقيقي أيضاً: قد يكون المضيف مشغّلاً صغيراً، والموثوقية تختلف من عرض إلى آخر، ولا توجد SLA. لتجربة في عطلة نهاية الأسبوع، يفوز السوق بسهولة. أما لنظام إنتاجي خاضع للتنظيم، فغالباً لا يكون السوق خياراً أصلاً.

## أسعار Spot والمثيلات القابلة للمقاطعة

كل مزوّد في هذه المقارنة يبيع السعة الفائضة بسعر أقل، مع احتمال أن يستردها.

| المثيل | عند الطلب | Spot | التوفير |
| --- | --- | --- | --- |
| AWS g6.xlarge ‏(1× L4) | $0.805 | $0.605 | 25% |
| AWS g5.xlarge ‏(1× A10G) | $1.006 | $0.469 | 53% |
| AWS p5.4xlarge ‏(1× H100) | $6.88 | $2.623 | 62% |
| Google Cloud g2-standard-4 ‏(1× L4) | $0.707 | $0.403 | 43% |
| Google Cloud a3-highgpu-8g ‏(8× H100) | $88.49 | $41.60 | 53% |
| Azure NC24ads A100 v4 ‏(1× A100 80 GB) | $3.673 | $0.679 | 82% |
| Azure NC40ads H100 v5 ‏(1× H100 NVL) | $6.98 | $1.29 | 82% |

أسعار Spot على Azure مأخوذة من واجهة أسعار التجزئة (retail price API) لديها، وقد سرت أسعار Spot لـ A100 وH100 في يوليو وأغسطس 2026. كان سعر H100 كـ Spot أقل من أرخص عرض H100 عند الطلب وجدناه في الأسواق. أسعار Spot تتغير كثيراً والتوفر غير مضمون، فاعتبر ذلك لقطة في وقت محدد.

على Vast.ai، المثيلات القابلة للمقاطعة "غالباً أرخص بـ 50% أو أكثر من المثيلات عند الطلب" بحسب وثائقها؛ وأظهر getdeploying.com عروض RTX 3090 قابلة للمقاطعة ابتداءً من $0.08. لا توفّر Spot المال إلا إذا كانت مهمتك تحفظ نقاط استئناف (checkpoints) وتستطيع المتابعة من حيث توقفت. وإلا فالمقاطعة تعني أن تدفع مرتين مقابل الساعات نفسها.

## أين يقع GPUFlow

GPUFlow سوق أيضاً، لكنه يؤجّر شيئاً أضيق. يشغّل المزوّدون نماذج ذكاء اصطناعي (عادةً عبر Ollama) على أجهزة Linux خاصة بهم، وأنت تستأجر إحدى وحدات GPU هذه بالساعة لتحصل على مفتاح API متوافق مع OpenAI ‏(عنوان الأساس `https://gpuflow.app/v1`، مع `/v1/chat/completions` و`/v1/models`). لا يوجد SSH ولا سطر أوامر ولا وصول إلى الملفات، فلا يمكنك التدريب أو الضبط الدقيق (fine-tuning) أو تشغيل كودك الخاص. أما لاستدعاء نموذج مفتوح من سكربت أو تطبيق، فأنت تتجاوز الإعداد بالكامل: النموذج مثبّت مسبقاً على جهاز المزوّد.

لا يحدد GPUFlow الأسعار، فلا يوجد سعر لـ GPUFlow نضعه في الجداول. هذه طريقة عمل التسعير بدلاً من ذلك:

- يحدد كل مزوّد سعراً بالساعة بالدولار الأمريكي لعرضه. عند تحديده، يعرض نموذج العرض موقع السعر مقارنةً بالنطاق على مواقع الاستئجار الأخرى، وما سيكسبه المزوّد بعد الرسوم.
- تحجز ساعات كاملة، من 1 إلى 168 افتراضياً. يُحجز المبلغ الكامل للساعات المحجوزة من رصيدك عند بدء الاستئجار.
- تدفع بالثانية، مع حد أدنى دقيقة واحدة، مقرّباً إلى السنت التالي (مقال [الفوترة بالثانية أم بالساعة](/ar/per-second-vs-hourly-gpu-billing/) يشرح الحساب). عندما تنهي الاستئجار مبكراً أو ينتهي الوقت، يعود الجزء غير المستخدم من المبلغ المحجوز مباشرةً إلى رصيدك.
- إذا توقف جهاز المزوّد عن الاستجابة لمدة 10 دقائق، ينتهي الاستئجار ولا تدفع إلا حتى آخر نبضة (heartbeat) من الجهاز.
- التوكنات تُحصى لكنها لا تُفوتر. ولا يوجد بند للقرص أو لنقل البيانات في الفاتورة، لأنك لا تحصل أبداً على جهاز تخزّن عليه ملفات.
- يُشترى الرصيد بالبطاقة عبر Stripe، من $10 إلى $500 في كل عملية شحن، دون رسوم. كل وحدة رصيد تساوي $0.01 ولا تنتهي صلاحيتها. يحتفظ المزوّدون بـ 88% من كل مبلغ مخصوم ويحتفظ GPUFlow بـ 12%.

![نموذج العرض في GPUFlow بسعر $0.35 في الساعة، مع شريط يقارنه بنطاق $0.30 إلى $0.46 لبطاقة RTX 4090 على مواقع الاستئجار الأخرى، وأرباح المزوّد البالغة $0.31 بعد رسوم 12%](../_images/screens/ar/provider-price-bar.png)

لمقارنة أطول بين استئجار مفتاح API واستئجار حاوية، راجع [GPUFlow مقابل Vast.ai وRunPod وSaladCloud](/ar/gpuflow-vs-vast-ai-vs-runpod/). وإذا كنت تقارن أسعار GPU بالساعة مع واجهات API بالتوكن، [فالحساب هنا](/ar/hourly-gpu-vs-per-token-api/).

## مثال محسوب 1: مهمة دفعية مدتها 3 ساعات على بطاقة 24 GB

لنفترض أنك تريد تشغيل نموذج مفتوح بحجم 7B إلى 8B على كومة من المستندات لنحو ثلاث ساعات. أي بطاقة بذاكرة 24 GB تكفي.

| الخيار | الحساب | تكلفة GPU |
| --- | --- | --- |
| Vast.ai RTX 4090 | 3 × $0.31 | $0.93 |
| RunPod Community RTX 4090 | 3 × $0.34 | $1.02 |
| Google Cloud L4 ‏(g2-standard-4) | 3 × $0.707 | $2.12 |
| RunPod Secure RTX 4090 | 3 × $0.74 | $2.22 |
| AWS L4 ‏(g6.xlarge) | 3 × $0.805 | $2.42 |
| AWS A10G ‏(g5.xlarge) | 3 × $1.006 | $3.02 |

على كل واحد من هذه الخيارات تدفع أيضاً مقابل الإعداد: تثبيت خادم استدلال وتنزيل النموذج على وقت مدفوع. عشرون دقيقة من ذلك تضيف $0.10 على بطاقة Vast.ai و$0.27 على L4 من AWS.

على GPUFlow، خذ عرضاً بسعر $0.35 في الساعة مثالاً (هذا السعر الظاهر في لقطة الشاشة لدينا، وليس عرض سعر). تحجز 3 ساعات، فيُحجز $1.05. تنتهي المهمة بعد ساعتين و10 دقائق (7,800 ثانية) فتنهي الاستئجار. المبلغ المخصوم 7,800 × 35 ÷ 3,600 = 75.8 سنتاً، مقرّباً إلى $0.76، ويعود $0.29 إلى رصيدك. هذا لا ينجح إلا إذا كان هناك مزوّد يشغّل النموذج الذي تريده.

## مثال محسوب 2: 8 ساعات من الضبط الدقيق على A100 80 GB

الضبط الدقيق يحتاج إلى جهاز تتحكم فيه، فـ GPUFlow خارج الحساب هنا.

| الخيار | الحساب | التكلفة |
| --- | --- | --- |
| Vast.ai، أرخص عرض A100 | 8 × $0.43 | $3.44 |
| RunPod Community A100 SXM | 8 × $1.39 | $11.12 |
| RunPod Secure A100 SXM | 8 × $1.59 | $12.72 |
| Lambda A100 SXM 80 GB | 8 × $2.79 | $22.32 |
| Azure NC24ads A100 v4 | 8 × $3.673 | $29.38 |
| Google Cloud a2-ultragpu-1g | 8 × $5.069 | $40.55 |
| AWS p4de.24xlarge ‏(8 وحدات GPU) | 8 × $27.45 | $219.60 |

سطر Vast.ai هو أرخص عرض A100 ذكره getdeploying.com (بطاقة SXM في جهاز بوحدتين؛ ولم يظهر حجم الذاكرة)، فتحقق من العرض قبل أن تعتمد على هذا السعر. سطر AWS ليس خطأً مطبعياً: إذا احتجت إلى A100 80 GB واحدة على AWS، فأنت تستأجر ثمانياً. وسطر Lambda يفترض حجماً يمكنك الحصول عليه فعلاً، راجع الملاحظة أعلاه.

إذا كانت حلقة التدريب لديك تحفظ نقاط استئناف كل 15 إلى 30 دقيقة، فسعر Spot على Azure البالغ $0.679 في الساعة ينزل بتكلفة هذه المهمة إلى $5.43، لكن فقط إذا حصلت على السعة.

## مثال محسوب 3: L4 تخدم على مدار الساعة

نقطة استدلال صغيرة تعمل طوال شهر من 720 ساعة:

| الخيار | الحساب | في الشهر |
| --- | --- | --- |
| Vast.ai L4، أرخص عرض | 720 × $0.27 | $194.40 |
| RunPod Secure L4 | 720 × $0.49 | $352.80 |
| AWS g6.xlarge، محجوز لسنة | 720 × $0.524 | $377.28 |
| Google Cloud g2-standard-4 | 720 × $0.707 | $509.04 |
| AWS g6.xlarge، عند الطلب | 720 × $0.805 | $579.60 |

عند هذه المدة تبدأ خصومات الالتزام بالتأثير: سعر AWS المحجوز لسنة للمثيل نفسه أقل بـ 35% من السعر عند الطلب. يبقى السوق الأرخص، لكن المضيف الواحد نقطة فشل واحدة. إذا كان للنقطة مستخدمون، فالأرجح أنك ستريد جهازين، وهذا يضاعف سطر السوق ويجعل الفجوة أصغر مما تبدو.

## كيف أختار

للتجارب، وتوليد الصور، و[تدريب LoRA](/ar/stable-diffusion-lora-training-under-10-dollars/)، وأي شيء يمكنك إعادة تشغيله: بطاقة RTX 3090 أو 4090 من سوق. الطرف الأرخص من $0.11 إلى $0.34 في الساعة، ولا شيء على السحابات الكبرى يقترب من ذلك.

لنموذج كبير يحتاج إلى A100 أو H100 ولا يخضع للتنظيم: RunPod أو Lambda أولاً، و[Vast.ai إذا كنت مستعداً للتحقق من درجة موثوقية كل مضيف](/ar/runpod-vs-vastapi-comparison/). انظر إلى أسعار Spot على Azure وGoogle Cloud قبل أن تقرر؛ ففي سبتمبر 2026 كانت منافسة على نحو مفاجئ.

للبيانات الخاضعة للتنظيم، أو لشركة تعمل أصلاً على AWS أو Azure أو Google Cloud، أو لأي شيء يحتاج إلى SLA: ابقَ على سحابتك واشترِ التزامات أو سعة Spot لتخفض السعر. دفع $7 في الساعة مقابل H100 كثيراً ما يكون أرخص من مراجعة أمنية لمورّد جديد.

لاستدعاء نموذج مفتوح من الكود دون تشغيل خادم: واجهة API. إما API بالتوكن إذا كانت هناك خدمة تستضيف النموذج الذي تريده، أو استئجار بالساعة على GPUFlow إذا أردت سعراً ثابتاً بالساعة لنموذج لدى مزوّد محدد. مقال [ما تحتاج إليه لاستئجار GPU](/ar/what-you-need-to-rent-a-gpu/) يشرح جانب الحساب.

## المصادر

- AWS: [أسعار EC2 عند الطلب](https://aws.amazon.com/ec2/pricing/on-demand/)، [مثيلات P5](https://aws.amazon.com/ec2/instance-types/p5/)، [مثيلات P4](https://aws.amazon.com/ec2/instance-types/p4/). الأسعار بالساعة مأخوذة من نسخة Vantage لقائمة أسعار AWS: [g6.xlarge](https://instances.vantage.sh/aws/ec2/g6.xlarge?region=us-east-1)، [g5.xlarge](https://instances.vantage.sh/aws/ec2/g5.xlarge?region=us-east-1)، [p5.4xlarge](https://instances.vantage.sh/aws/ec2/p5.4xlarge?region=us-east-1)، [p5.48xlarge](https://instances.vantage.sh/aws/ec2/p5.48xlarge?region=us-east-1)، [p4de.24xlarge](https://instances.vantage.sh/aws/ec2/p4de.24xlarge?region=us-east-1)
- Google Cloud: [أسعار الآلات الافتراضية المُحسّنة للمسرّعات](https://cloud.google.com/products/compute/pricing/accelerator-optimized)، [أسعار مثيلات الآلات الافتراضية](https://cloud.google.com/compute/vm-instance-pricing)
- Azure: [أسعار آلات Linux الافتراضية](https://azure.microsoft.com/en-us/pricing/details/virtual-machines/linux/)، [واجهة أسعار التجزئة في Azure](https://prices.azure.com/api/retail/prices)، الأحجام: [NC A100 v4](https://learn.microsoft.com/en-us/azure/virtual-machines/sizes/gpu-accelerated/nca100v4-series)، [NCads H100 v5](https://learn.microsoft.com/en-us/azure/virtual-machines/sizes/gpu-accelerated/ncadsh100v5-series)، [NVads A10 v5](https://learn.microsoft.com/en-us/azure/virtual-machines/sizes/gpu-accelerated/nvadsa10v5-series)
- Lambda: [الأسعار](https://lambda.ai/pricing)
- RunPod: [الأسعار](https://www.runpod.io/pricing)، [RTX 3090](https://www.runpod.io/gpu-models/rtx-3090)، [RTX 4090](https://www.runpod.io/gpu-models/rtx-4090)، [RTX 5090](https://www.runpod.io/gpu-models/rtx-5090)، [A100 SXM](https://www.runpod.io/gpu-models/a100-sxm)، [H100 SXM](https://www.runpod.io/gpu-models/h100-sxm)، [نظرة عامة على الـ Pods](https://docs.runpod.io/pods/overview)
- Vast.ai: [وثائق التسعير](https://docs.vast.ai/guides/instances/pricing.md). أسعار السوق من getdeploying.com: [Vast.ai](https://getdeploying.com/vast-ai)، [RTX 3090](https://getdeploying.com/reference/cloud-gpu/nvidia-rtx-3090)، [RTX 4090](https://getdeploying.com/reference/cloud-gpu/nvidia-rtx-4090)، [RTX 5090](https://getdeploying.com/reference/cloud-gpu/nvidia-rtx-5090)، [A100](https://getdeploying.com/reference/cloud-gpu/nvidia-a100)، [H100](https://getdeploying.com/reference/cloud-gpu/nvidia-h100)
- GPUFlow: [كيف تسعّر وحدة GPU لديك](https://docs.gpuflow.app/ar/providers/pricing/)، [الفوترة](https://docs.gpuflow.app/ar/renters/billing/)، [البدء السريع مع API](https://docs.gpuflow.app/ar/renters/api-quickstart/)، [السوق](https://gpuflow.app/ar/marketplace)

راجعناها كلها في سبتمبر 2026.
