---
title: "किराये के GPU पर LLM की निजी fine-tuning: एक व्यावहारिक guide"
description: "fine-tuning कब RAG या prompting से बेहतर है, मॉडल के साइज़ के हिसाब से QLoRA की VRAM, TRL, Unsloth और Axolotl, किराये के GPU पर डेटा निजी रखना, ख़र्च और serving।"
excerpt: "8B open मॉडल की QLoRA fine-tuning एक किराये के 24 GB GPU पर हो जाती है और हर run लगभग $0.35 से $0.83 का पड़ता है। पैसा देने से पहले जाँच लें कि fine-tuning सही टूल है, और तय कर लें कि किसी और की मशीन पर आपका डेटा आपका कैसे रहेगा।"
pubDate: 2025-02-23
updatedDate: 2026-09-30
locale: "hi"
category: "tutorials"
featured: false
draft: false
author: "GPUFlow Team"
heroImage: "../_images/private-llm-fine-tuning-guide-hero.png"
heroImageAlt: "किराये के GPU server पर एक निजी dataset से language मॉडल की fine-tuning का चित्र"
faq:
  - question: "7B या 8B मॉडल की fine-tuning के लिए कितनी VRAM चाहिए?"
    answer: "Unsloth की requirements table के मुताबिक़ QLoRA के साथ 7B मॉडल को लगभग 5 GB और 8B मॉडल को 6 GB चाहिए; सादा 16-bit LoRA लगभग 19 GB और 22 GB लेता है। असली runs को लंबे sequences और बड़े batches के लिए गुंजाइश चाहिए, इसलिए RTX 3090 या 4090 जैसा 24 GB कार्ड आराम वाला विकल्प है।"
  - question: "fine-tuning करूँ या RAG इस्तेमाल करूँ?"
    answer: "जब मॉडल को आपके documents के तथ्य चाहिए, ख़ासकर बदलते रहने वाले तथ्य, तो RAG इस्तेमाल करें। Ovadia et al. की 2024 की एक study में ज्ञान जोड़ने के मामले में RAG हर बार unsupervised fine-tuning से बेहतर रहा। fine-tuning तब करें जब आपको एक जैसा format, tone या किसी सीमित काम का ऐसा व्यवहार चाहिए जो prompting भरोसे से न दे पाए।"
  - question: "किराये के GPU पर LLM की fine-tuning में कितना ख़र्च आता है?"
    answer: "2,000 examples वाले 8B मॉडल का QLoRA run setup मिलाकर घंटे भर से थोड़ा ज़्यादा लेता है, यानी $0.31/घंटा वाले Vast.ai RTX 4090 पर लगभग $0.35 या RunPod की $0.74/घंटा list price पर $0.83 (सितंबर 2026)। 20,000 examples वाला run लगभग चार घंटे लेता है, यानी $1.24 से $2.97।"
  - question: "क्या GPU host मेरा training डेटा देख सकता है?"
    answer: "hardware host का है, इसलिए मानकर चलें कि देख सकता है। container isolation आपको दूसरे किरायेदारों से बचाता है, मशीन के मालिक से नहीं। संवेदनशील डेटा के लिए जाँचे-परखे datacenter hosts (Vast.ai Secure Cloud, RunPod Secure Cloud) लें, अपलोड से पहले निजी डेटा हटाएँ, और काम ख़त्म होते ही instance delete करें।"
  - question: "LoRA और QLoRA में क्या फ़र्क़ है?"
    answer: "LoRA base मॉडल को जस का तस रखता है और छोटे adapter matrices train करता है। QLoRA भी यही करता है, लेकिन जस के तस base मॉडल को 4-bit NF4 precision में load करता है, जिससे मूल paper में 65B मॉडल की fine-tuning एक 48 GB GPU पर हो पाई।"
  - question: "क्या मैं GPUFlow पर fine-tuning कर सकता हूँ या अपना मॉडल अपलोड कर सकता हूँ?"
    answer: "नहीं। GPUFlow सिर्फ़ inference के लिए है: आप उन मॉडल के लिए OpenAI-compatible chat API किराये पर लेते हैं जो providers ने अपनी मशीनों पर, आमतौर पर Ollama से, इंस्टॉल किए हैं। वहाँ न shell है, न फ़ाइल access, इसलिए आप वहाँ train नहीं कर सकते और अपना मॉडल अपलोड नहीं कर सकते।"
---

किराये के एक 24 GB GPU पर QLoRA से आप 8B open-weights मॉडल को अपने डेटा पर fine-tune कर सकते हैं, और एक आम run एक डॉलर से कम का पड़ता है। कठिन सवाल पहले आते हैं: क्या fine-tuning सही इलाज है भी (तथ्यों के लिए आमतौर पर retrieval जीतता है), और किसी और की मशीन पर आपका डेटा निजी कैसे रहेगा।

यह guide दोनों को कवर करती है, फिर मॉडल के साइज़ के हिसाब से ज़रूरी VRAM, मौजूदा टूल, एक चलने वाली training script, ख़र्च का पूरा हिसाब और नतीजे को serve करने का तरीका। सब कुछ सितंबर 2026 में जाँचा गया; स्रोत आख़िर में हैं।

## fine-tuning, RAG या बेहतर prompts

fine-tuning बदलती है कि मॉडल कैसा व्यवहार करता है। उसे तथ्य सिखाने का यह ख़राब तरीका है। Ovadia et al. ने ज्ञान जोड़ने के लिए दोनों की तुलना की और पाया कि RAG unsupervised fine-tuning से "लगातार बेहतर" रहता है, "training में देखे गए मौजूदा ज्ञान और पूरी तरह नए ज्ञान, दोनों के लिए"। उनका निष्कर्ष: LLMs fine-tuning से नए तथ्य मुश्किल से सीखते हैं।

इसलिए कुछ भी किराये पर लेने से पहले यह tree देखें:

<figure>
<svg viewBox="0 0 720 420" role="img" aria-labelledby="d1-title" xmlns="http://www.w3.org/2000/svg" font-family="system-ui, sans-serif" font-size="15">
<title id="d1-title">retrieval, बेहतर prompts, fine-tuning या बड़े मॉडल में से चुनने के लिए decision tree</title>
<defs><marker id="d1-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#64748b"/></marker></defs>
<rect width="720" height="420" fill="#ffffff"/>
<rect x="60" y="15" width="280" height="40" rx="8" fill="#1e1b4b"/>
<text x="200" y="40" text-anchor="middle" fill="#ffffff">जवाब काफ़ी अच्छे नहीं हैं</text>
<line x1="200" y1="55" x2="200" y2="83" stroke="#64748b" stroke-width="2" marker-end="url(#d1-arrow)"/>
<rect x="20" y="85" width="360" height="50" rx="8" fill="#ffffff" stroke="#f97316" stroke-width="2"/>
<text x="200" y="115" text-anchor="middle" fill="#1e1b4b">तथ्य ग़ायब हैं, या डेटा बदलता रहता है?</text>
<rect x="440" y="80" width="260" height="60" rx="10" fill="#f0fdf4" stroke="#16a34a" stroke-width="2"/>
<text x="570" y="105" text-anchor="middle" fill="#1e1b4b" font-weight="600">RAG इस्तेमाल करें</text>
<text x="570" y="126" text-anchor="middle" fill="#64748b" font-size="13">हर अनुरोध पर अपने documents खोजें</text>
<line x1="380" y1="110" x2="438" y2="110" stroke="#64748b" stroke-width="2" marker-end="url(#d1-arrow)"/>
<text x="409" y="102" text-anchor="middle" fill="#16a34a" font-size="13">हाँ</text>
<line x1="200" y1="135" x2="200" y2="173" stroke="#64748b" stroke-width="2" marker-end="url(#d1-arrow)"/>
<text x="215" y="160" fill="#64748b" font-size="13">नहीं</text>
<rect x="20" y="175" width="360" height="50" rx="8" fill="#ffffff" stroke="#f97316" stroke-width="2"/>
<text x="200" y="205" text-anchor="middle" fill="#1e1b4b">निर्देश और उदाहरणों से ठीक हो जाता है?</text>
<rect x="440" y="170" width="260" height="60" rx="10" fill="#f0fdf4" stroke="#16a34a" stroke-width="2"/>
<text x="570" y="195" text-anchor="middle" fill="#1e1b4b" font-weight="600">prompt सुधारें</text>
<text x="570" y="216" text-anchor="middle" fill="#64748b" font-size="13">system prompt, few-shot उदाहरण</text>
<line x1="380" y1="200" x2="438" y2="200" stroke="#64748b" stroke-width="2" marker-end="url(#d1-arrow)"/>
<text x="409" y="192" text-anchor="middle" fill="#16a34a" font-size="13">हाँ</text>
<line x1="200" y1="225" x2="200" y2="263" stroke="#64748b" stroke-width="2" marker-end="url(#d1-arrow)"/>
<text x="215" y="250" fill="#64748b" font-size="13">नहीं</text>
<rect x="20" y="265" width="360" height="50" rx="8" fill="#ffffff" stroke="#f97316" stroke-width="2"/>
<text x="200" y="295" text-anchor="middle" fill="#1e1b4b">तय format, tone या हुनर चाहिए?</text>
<rect x="440" y="260" width="260" height="60" rx="10" fill="#eef2ff" stroke="#6366f1" stroke-width="2"/>
<text x="570" y="285" text-anchor="middle" fill="#1e1b4b" font-weight="600">QLoRA से fine-tune करें</text>
<text x="570" y="306" text-anchor="middle" fill="#64748b" font-size="13">सैकड़ों अच्छे उदाहरण</text>
<line x1="380" y1="290" x2="438" y2="290" stroke="#64748b" stroke-width="2" marker-end="url(#d1-arrow)"/>
<text x="409" y="282" text-anchor="middle" fill="#16a34a" font-size="13">हाँ</text>
<line x1="200" y1="315" x2="200" y2="353" stroke="#64748b" stroke-width="2" marker-end="url(#d1-arrow)"/>
<text x="215" y="340" fill="#64748b" font-size="13">नहीं</text>
<rect x="60" y="355" width="280" height="50" rx="10" fill="#f8fafc" stroke="#64748b" stroke-width="2"/>
<text x="200" y="385" text-anchor="middle" fill="#1e1b4b">बड़ा base मॉडल आज़माएँ</text>
<text x="570" y="370" text-anchor="middle" fill="#64748b" font-size="13">RAG और fine-tuning साथ अच्छे चलते हैं:</text>
<text x="570" y="390" text-anchor="middle" fill="#64748b" font-size="13">व्यवहार tune करें, तथ्य खोजकर लाएँ</text>
</svg>
<figcaption>"मॉडल हमारी चीज़ें नहीं जानता" वाली ज़्यादातर समस्याएँ असल में retrieval की समस्याएँ हैं। fine-tuning अपना ख़र्च तब वसूलती है जब आपको हर बार एक ही व्यवहार चाहिए: एक JSON schema, कंपनी की लेखन शैली, एक classification scheme।</figcaption>
</figure>

fine-tuning की अच्छी वजहें:

- **सख़्त output format।** हर call पर fields को आपके schema में निकालना, हर prompt में पन्ने भर निर्देश डाले बिना।
- **शैली और tone।** ऐसे support जवाब जो आपकी टीम जैसे लगें, या तय ढाँचे वाली reports।
- **छोटे मॉडल से एक सीमित काम।** tune किया 8B मॉडल किसी एक काम के लिए बड़े general मॉडल की जगह ले सकता है, जो सस्ते hardware पर serve करते समय मायने रखता है।
- **छोटे prompts।** weights में सीखा व्यवहार हर अनुरोध में दोहराना नहीं पड़ता।

## LoRA और QLoRA

पूरी fine-tuning हर weight अपडेट करती है, इसलिए GPU को मॉडल के ऊपर उन सबके gradients और optimizer state भी रखने पड़ते हैं। LoRA base मॉडल को जस का तस रखता है और उसकी layers के बगल में छोटे low-rank matrices train करता है; मूल paper के मुताबिक़ Adam के साथ GPT-3 175B की पूरी fine-tuning के मुक़ाबले trainable parameters 10,000 गुना और GPU मेमोरी 3 गुना कम हुई।

QLoRA एक क़दम आगे जाता है: जस का तस base मॉडल 4-bit NF4 precision में load होता है, और सिर्फ़ adapters 16-bit में train होते हैं। Dettmers et al. ने इससे एक 48 GB GPU पर 65B मॉडल की fine-tuning की, "पूरी 16-bit finetuning जितनी task performance बनाए रखते हुए"। paper ने तीन चीज़ें जोड़ीं जिन्हें टूल आज भी इस्तेमाल करते हैं: NF4 data type, quantization constants का double quantization, और memory के अचानक उछाल को सँभालने वाले paged optimizers।

दोनों का नतीजा एक adapter है, कुछ tensors वाला एक फ़ोल्डर, जिसे आप बिना बदले base मॉडल के ऊपर लगाते हैं। आप इसे अलग रख सकते हैं या weights में merge कर सकते हैं। image मॉडल भी यही तरीका अपनाते हैं: एक [Stable Diffusion LoRA](/hi/stable-diffusion-lora-training-under-10-dollars/) किराये के एक 24 GB कार्ड पर $10 से काफ़ी कम में train हो जाता है।

## कितनी VRAM चाहिए

Unsloth मॉडल के साइज़ के हिसाब से fine-tuning की न्यूनतम VRAM की एक table प्रकाशित करता है। ये उसके आँकड़े हैं, उसकी memory optimizations के साथ; सादी Hugging Face training को ज़्यादा चाहिए, और लंबे sequences या बड़े batches हर पंक्ति को ऊपर ले जाते हैं।

| मॉडल साइज़ | QLoRA (4-bit) | LoRA (16-bit) | किराये का कार्ड जिसमें QLoRA आराम से चले |
| --- | --- | --- | --- |
| 3B | 3.5 GB | 8 GB | कोई भी 12 GB+ कार्ड |
| 8B | 6 GB | 22 GB | RTX 3090 / 4090 (24 GB) |
| 14B | 8.5 GB | 33 GB | RTX 3090 / 4090 (24 GB) |
| 32B | 26 GB | 76 GB | 48 GB कार्ड (RTX A6000, A40, L40S) |
| 70B | 41 GB | 164 GB | 80 GB कार्ड (A100, H100) |

<figure>
<svg viewBox="0 0 720 320" role="img" aria-labelledby="d2-title" xmlns="http://www.w3.org/2000/svg" font-family="system-ui, sans-serif" font-size="15">
<title id="d2-title">8B, 14B, 32B और 70B मॉडल की fine-tuning के लिए QLoRA और 16-bit LoRA में न्यूनतम VRAM का bar chart, 24, 48 और 80 GB कार्ड के मुक़ाबले</title>
<rect width="720" height="320" fill="#ffffff"/>
<rect x="200" y="12" width="14" height="14" fill="#6366f1"/>
<text x="220" y="24" fill="#1e1b4b" font-size="13">QLoRA 4-bit</text>
<rect x="320" y="12" width="14" height="14" fill="#eef2ff" stroke="#6366f1" stroke-width="1.5"/>
<text x="340" y="24" fill="#1e1b4b" font-size="13">LoRA 16-bit</text>
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
<text x="420" y="306" text-anchor="middle" fill="#64748b" font-size="13">न्यूनतम VRAM, GB में (Unsloth की requirements table)</text>
</svg>
<figcaption>यहाँ किराये के consumer कार्ड QLoRA की वजह से ही काम के हैं: 14B तक 24 GB कार्ड में आराम से आ जाता है, 32B को 48 GB कार्ड चाहिए, और 70B को 80 GB वाला। 4-bit loading के बिना 8B भी 24 GB में मुश्किल से आता है।</figcaption>
</figure>

मेरा default RTX 4090 पर 8B या 14B मॉडल है। यह सबसे सस्ता किराये का कार्ड है जिसमें 2,048-token sequences और ठीक-ठाक batch की जगह बचती है, और इस range के मॉडल बाद में serve करना आसान है। जिस VRAM पर आप मॉडल serve करेंगे, उसके हिसाब से base मॉडल चुनने के लिए [आपके GPU की VRAM में कौन-से AI मॉडल आते हैं](/hi/which-ai-models-fit-your-gpu-vram/) देखें।

## टूल चुनें: TRL, Unsloth या Axolotl

तीनों open source हैं और तीनों LoRA और QLoRA करते हैं।

| टूल | इस्तेमाल कैसे होता है | ख़ूबी | ध्यान रखें |
| --- | --- | --- | --- |
| Hugging Face TRL + PEFT | Python (`SFTTrainer`) | reference implementation; उसी API पर DPO, GRPO और बहुत कुछ | उसी run पर Unsloth से ज़्यादा memory लेता है |
| Unsloth | Python, या Unsloth Studio web UI | 2x तेज़ और 70% कम VRAM का दावा; सीधे GGUF में export | Studio UI AGPL-3.0 है (core Apache 2.0) |
| Axolotl | एक YAML फ़ाइल, `axolotl train config.yml` | Multi-GPU (FSDP, DeepSpeed), कई recipes | Python 3.11+ और PyTorch 2.11+ चाहिए |

सितंबर 2026 तक TRL वर्ज़न 1.14 और PEFT 0.21 पर है। Unsloth को Python 3.11 से 3.13 और CUDA capability 7.0 या नए वाला NVIDIA GPU चाहिए (V100, T4, RTX 20 series और ऊपर)। Axolotl Python 3.12 और PyTorch 2.12.1 की सलाह देता है।

अगर आप हर लाइन समझना चाहते हैं तो TRL लें, VRAM कम है या एक call में GGUF export चाहिए तो Unsloth, और अगर अलग-अलग settings के साथ runs दोहराने हैं या कई GPUs पर जाना है तो Axolotl। नीचे की script TRL इस्तेमाल करती है, क्योंकि हर हिस्सा दिखाने का यह सबसे छोटा रास्ता है।

## डेटा तैयार करें

TRL का `SFTTrainer` बातचीत को उसी रूप में पढ़ता है जैसा chat API अनुरोध होता है। `train.jsonl` में हर लाइन पर एक JSON object:

```json
{"messages": [{"role": "system", "content": "Extract the invoice fields as JSON."}, {"role": "user", "content": "Invoice 4471 from Norden AB, due 12 March, total 1,250 EUR"}, {"role": "assistant", "content": "{\"invoice_id\": \"4471\", \"supplier\": \"Norden AB\", \"due\": \"2026-03-12\", \"total\": 1250, \"currency\": \"EUR\"}"}]}
```

व्यावहारिक नियम:

- **गिनती से ज़्यादा गुणवत्ता।** कुछ सौ से कुछ हज़ार एक जैसे, सही examples दसियों हज़ार गड़बड़ examples से बेहतर हैं। डेटा की हर ग़लती ऐसा व्यवहार है जिसे सिखाने का आप पैसा दे रहे हैं।
- **production जैसा रखें।** वही system prompt और input format इस्तेमाल करें जो आपका application असल में भेजेगा।
- **5 से 10% अलग रखें।** कुछ examples ऐसे रखें जिन पर मॉडल कभी train न हो, ताकि base मॉडल और tune किए मॉडल की आमने-सामने तुलना कर सकें।
- **जो ज़रूरी नहीं, हटा दें।** नाम, emails, खाता नंबर और IDs शायद ही मॉडल को format सीखने में मदद करते हैं। डेटा आपके कंप्यूटर से निकलने से पहले उनकी जगह असली जैसे placeholders रखें।

आख़िरी नियम सिर्फ़ किराये की मशीन के बारे में नहीं है। Carlini et al. ने GPT-2 से training के सैकड़ों sequences शब्दशः निकाल लिए, जिनमें नाम, फ़ोन नंबर और email पते थे, और इनमें से कुछ training के सिर्फ़ एक document में थे। fine-tune किया मॉडल जिस पर train हुआ है, उसे बाद में इस्तेमाल करने वाले किसी को भी दोहरा सकता है।

## किराये की मशीन पर डेटा निजी रखें

GPU मार्केटप्लेस पर कंप्यूटर किसी और का होता है। Vast.ai इसे सीधे कहता है: "clients unprivileged Docker containers में अलग रखे जाते हैं और उनकी पहुँच सिर्फ़ अपने डेटा तक होती है", और "provider की सुरक्षा में काफ़ी फ़र्क़ होता है"। यह अलगाव आपको दूसरे किरायेदारों से बचाता है। उस व्यक्ति से नहीं जिसके पास host तक physical पहुँच और root है।

निजी डेटा के लिए:

1. **जाँचा-परखा datacenter host चुनें।** Vast.ai के Secure Cloud providers "ISO 27001 certification और Tier 3/4 datacenter मानकों वाले जाँचे-परखे datacenters" हैं, और Vast संवेदनशील काम के लिए इन्हीं की सलाह देता है। RunPod का Secure Cloud T3/T4 data centers में चलता है; उसका Community Cloud आपको अलग-अलग providers से जोड़ता है। datacenter tiers प्रति घंटा महँगे हैं, और यहाँ उनकी क़ीमत वसूल है।
2. **सिर्फ़ साफ़ किया हुआ dataset अपलोड करें,** SSH से (`rsync -avP` या `scp`)। रास्ते में उसे किसी public bucket या shared link पर न रखें।
3. **logging local रखें।** TRL 1.14 में `report_to` का default `"none"` है, इसलिए जब तक आप चालू न करें, कुछ भी किसी experiment tracker पर नहीं जाता। निजी डेटा पर train हुए adapter के साथ `push_to_hub` न चलाएँ।
4. **नतीजे निकालें, फिर instance delete करें।** adapter और evaluation outputs डाउनलोड करें, अगर token इस्तेमाल किया था तो Hugging Face से logout करें (`hf auth logout`), और instance और हर volume delete करें। Vast.ai पर storage का बिल बनता है और वह तब तक रहता है जब तक instance delete न हो, सिर्फ़ रोकने से नहीं।

container के अंदर फ़ाइलें मिटाने से यह पक्का नहीं होता कि host की डिस्क साफ़ हो गई, इसलिए असली सुरक्षा क़दम 1 और 2 हैं: तय करें कि hardware किसके पास है, और उसे जितना कम हो सके, भेजें। ज़्यादा ब्योरा [public GPU node पर dataset कैसे सुरक्षित रखें](/hi/how-to-secure-dataset-on-public-gpu-node/) में है। अगर [आपकी policy किसी तीसरे पक्ष के hardware की इजाज़त नहीं देती](/hi/why-corporate-policies-banning-chatgpt/), तो यही script आपके अपने 24 GB कार्ड पर चलती है।

## Train करें: TRL के साथ QLoRA script

RTX 3090 या 4090 वाली किराये की Linux मशीन पर:

```bash
python -m venv venv && source venv/bin/activate
pip install torch trl peft bitsandbytes datasets
```

फिर `train.py`, TRL के PEFT docs के QLoRA pattern के मुताबिक़। Qwen3-8B Apache 2.0 है और gated नहीं है, इसलिए Hugging Face token की ज़रूरत नहीं:

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

जो फ़ैसले मायने रखते हैं:

- **`learning_rate=2e-4`।** TRL के docs QLoRA के लिए सामान्य fine-tuning rate का लगभग 10 गुना सुझाते हैं। अगर training loss गिरते हुए evaluation loss बढ़े, तो मॉडल overfit हो रहा है: epochs घटाएँ।
- **`r=16`, `target_modules="all-linear"`।** हर linear layer पर adapters, वही setup जो Unsloth के benchmarks इस्तेमाल करते हैं। format और शैली के लिए rank 16 काफ़ी है; मुश्किल कामों के लिए बढ़ाएँ।
- **`max_length=2048`।** इससे लंबे examples काट दिए जाते हैं। अपने डेटा की token लंबाई जाँचें; लंबी सीमा को ज़्यादा VRAM चाहिए।
- **effective batch 16** (4 × 4 accumulation steps)। memory ख़त्म हो तो `per_device_train_batch_size` घटाएँ और accumulation बढ़ाएँ, ताकि गुणनफल वही रहे।

मशीन बंद करने से पहले अलग रखे examples base मॉडल और tune किए मॉडल दोनों से चलाएँ और तुलना करें। यही एक test है जो बताता है कि पैसे से कुछ हुआ या नहीं।

## ख़र्च कितना है

training का समय = कुल tokens ÷ throughput। hosting कंपनी GigaGPU ने RTX 4090 पर QLoRA के साथ Llama 3.1 8B के लिए लगभग 3,500 training tokens प्रति सेकंड का मापा हुआ आँकड़ा प्रकाशित किया। Qwen3-8B के लिए भी मिलती-जुलती दर मानें तो:

**छोटा run:** 2,000 examples × 600 tokens × 3 epochs = 36 लाख (3.6 million) tokens। 3,600,000 ÷ 3,500 = 1,029 सेकंड, लगभग 17 मिनट।

| चरण | समय |
| --- | --- |
| environment सेट करना | 10 मिनट |
| Qwen3-8B डाउनलोड करना (16.4 GB weights) और डेटा अपलोड करना | 10 मिनट |
| Training | 17 मिनट |
| अलग रखे डेटा पर base और tune किए मॉडल की तुलना | 15 मिनट |
| Merge, export, डाउनलोड, instance delete करना | 15 मिनट |
| **कुल** | **67 मिनट (1.12 घंटे)** |

- Vast.ai RTX 4090, $0.31/घंटा: 1.12 × $0.31 = **$0.35**
- RunPod RTX 4090, $0.74/घंटा (pricing पेज की list price): 1.12 × $0.74 = **$0.83**

**बड़ा run:** 20,000 examples × 1,000 tokens × 2 epochs = 4 करोड़ (40 million) tokens ÷ 3,500 = 11,429 सेकंड, लगभग 3.2 घंटे। उसी 50 मिनट के अतिरिक्त समय के साथ 4.0 घंटे: Vast.ai पर **$1.24** या RunPod पर **$2.97**।

32B मॉडल के लिए सितंबर 2026 में RunPod पर 48 GB कार्ड $0.49/घंटा (A40), $0.53/घंटा (RTX A6000) और $1.09/घंटा (L40S) पर हैं। इन कार्ड पर 32B QLoRA का कोई प्रकाशित throughput मेरे पास नहीं है, इसलिए 50 steps चलाएँ, log से step time पढ़ें, और लंबे run में उतरने से पहले यही गुणा करें।

कीमतें सितंबर 2026 की हैं, RunPod के pricing पेज से और Vast.ai के लिए getdeploying.com के tracker से। Secure/datacenter tiers सबसे सस्ते community offers से महँगे हैं। बड़ी तस्वीर [GPU किराये की कीमतों की तुलना](/hi/gpu-rental-pricing-comparison-2026/) में है।

## नतीजे को serve करें

आपके पास दो विकल्प हैं: adapter को अलग रखें, या मॉडल में merge करें।

**vLLM के साथ अलग रखें।** vLLM LoRA adapters को base मॉडल के साथ load करता है और अपने OpenAI-compatible server पर हर एक को एक मॉडल नाम के रूप में दिखाता है:

```bash
vllm serve Qwen/Qwen3-8B --enable-lora --lora-modules invoices=./out/adapter
```

इसके बाद clients `"model": "invoices"` भेजते हैं। कई adapters एक GPU पर एक ही base मॉडल साझा कर सकते हैं।

**merge करें और Ollama में चलाएँ।** adapter को full-precision weights में merge करें, llama.cpp से GGUF में बदलें, quantize करें, और import करें:

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

Unsloth merge और GGUF export एक call में करता है (`model.save_pretrained_gguf("dir", tokenizer, quantization_method="q4_k_m")`)। उसके docs चेतावनी देते हैं कि export के बाद ख़राब जवाबों की सबसे आम वजह ग़लत chat template है: उसी template से serve करें जिससे train किया था। Ollama, vLLM और TGI के बीच के फ़ायदे-नुक़सान [हमारे RTX 4090 inference benchmark](/hi/ollama-vs-vllm-vs-tgi-rtx-4090-benchmark/) में हैं।

### GPUFlow कहाँ फ़िट होता है

GPUFlow training नहीं कर सकता: वह provider के GPU पर एक OpenAI-compatible API किराये पर देता है, बिना shell, SSH या फ़ाइल access के। वह आपका fine-tune किया मॉडल serve भी नहीं कर सकता। किरायेदार मॉडल अपलोड नहीं कर सकते; वही मॉडल मिलते हैं जो हर provider ने (आमतौर पर Ollama से) इंस्टॉल किए हैं, जैसे `qwen2.5:7b` या `llama3.1:8b`।

वह इस सबसे पहले वाले क़दम में मदद कर सकता है: कुछ cents में यह जाँचना कि अच्छे prompt के साथ कोई तैयार open मॉडल पहले से काम कर देता है या नहीं, जो decision tree का सबसे सस्ता नतीजा है। इसके लिए test डेटा इस्तेमाल करें, वह निजी डेटा नहीं जिसके बारे में यह guide है: किराये के दौरान prompts और जवाब provider की मशीन से सादे टेक्स्ट में होकर गुज़रते हैं। यह कैसे काम करता है, [API quickstart](https://docs.gpuflow.app/hi/renters/api-quickstart/) में है, और [ऐप्स में key का इस्तेमाल](/hi/use-openai-compatible-api-key-in-apps/) इसे मौजूदा टूल से जोड़ना बताता है।

## स्रोत

सभी की जाँच सितंबर 2026 में की गई।

- Papers: [Hu et al., LoRA](https://arxiv.org/abs/2106.09685); [Dettmers et al., QLoRA](https://arxiv.org/abs/2305.14314); [Ovadia et al., Fine-Tuning or Retrieval?](https://arxiv.org/abs/2312.05934); [Carlini et al., Extracting Training Data from Large Language Models](https://arxiv.org/abs/2012.07805)
- Hugging Face TRL: [SFT Trainer](https://huggingface.co/docs/trl/sft_trainer), [PEFT integration और QLoRA](https://huggingface.co/docs/trl/peft_integration)
- Unsloth: [requirements और VRAM table](https://unsloth.ai/docs/get-started/fine-tuning-for-beginners/unsloth-requirements.md), [benchmarks](https://unsloth.ai/docs/basics/unsloth-benchmarks.md), [GGUF में save करना](https://unsloth.ai/docs/basics/inference-and-deployment/saving-to-gguf.md), [GitHub](https://github.com/unslothai/unsloth)
- [GitHub पर Axolotl](https://github.com/axolotl-ai-cloud/axolotl)
- मॉडल: [Qwen3-8B model card](https://huggingface.co/Qwen/Qwen3-8B)
- Training throughput: [GigaGPU, RTX 4090 पर fine-tuning](https://gigagpu.com/rtx-4090-fine-tuning-guide/)
- Hosts और सुरक्षा: [Vast.ai security FAQ](https://docs.vast.ai/documentation/reference/faq/security), [Vast.ai pricing](https://docs.vast.ai/guides/instances/pricing.md), [RunPod Pods का परिचय](https://docs.runpod.io/pods/overview)
- कीमतें: [RunPod pricing](https://www.runpod.io/pricing), getdeploying.com पर [Vast.ai](https://getdeploying.com/vast-ai) और [RTX 4090](https://getdeploying.com/reference/cloud-gpu/nvidia-rtx-4090)
- Serving: [vLLM LoRA adapters](https://docs.vllm.ai/en/latest/features/lora.html), [llama.cpp quantize](https://github.com/ggml-org/llama.cpp/blob/master/tools/quantize/README.md), [Ollama import](https://docs.ollama.com/import)
- GPUFlow: [API quickstart](https://docs.gpuflow.app/hi/renters/api-quickstart/)
