---
title: "RTX 4090 पर Ollama vs vLLM vs TGI: benchmarks क्या दिखाते हैं"
description: "RTX 4090 पर 8B मॉडल के लिए Ollama, vLLM और Hugging Face TGI: load में throughput के प्रकाशित आँकड़े, VRAM, quantization, OpenAI APIs और TGI के maintenance की स्थिति।"
excerpt: "एक बार में एक request हो तो RTX 4090 पर ये engines लगभग बराबर तेज़ चलते हैं। एक साथ कई यूज़र हों तो vLLM बहुत आगे निकल जाता है। TGI अब maintenance mode में है। प्रकाशित आँकड़े, स्रोत और क्या चुनें।"
pubDate: 2026-02-25
updatedDate: 2026-09-30
locale: "hi"
category: "benchmarks"
featured: false
draft: false
author: "GPUFlow Team"
heroImage: "../_images/rtx4090-inference-benchmark-hero.png"
heroImageAlt: "terminal पर performance metrics के साथ दिखता RTX 4090 GPU inference benchmark"
faq:
  - question: "क्या RTX 4090 पर vLLM, Ollama से तेज़ है?"
    answer: "सिर्फ़ तब जब कई requests एक साथ चल रहे हों। ComputingForGeeks के सितंबर 2026 के test में 4-bit Qwen2.5-7B के साथ RTX 4090 पर दोनों ने एक request के लिए लगभग 174 tokens प्रति सेकंड बनाए। एक साथ 64 requests पर vLLM कुल 6,623 tokens प्रति सेकंड तक पहुँचा और Ollama 2,018 तक।"
  - question: "क्या Hugging Face TGI अब भी maintain होता है?"
    answer: "बहुत थोड़ा। TGI के docs कहते हैं कि यह maintenance mode में है और सिर्फ़ छोटे bug fixes और documentation बदलाव स्वीकार करता है, और GitHub repository 21 मार्च 2026 को read-only के रूप में archive कर दी गई। Hugging Face इसकी जगह vLLM या SGLang सुझाता है, या local इस्तेमाल के लिए llama.cpp और MLX।"
  - question: "8B मॉडल के लिए vLLM कितनी VRAM इस्तेमाल करता है?"
    answer: "डिफ़ॉल्ट रूप से vLLM GPU की 90% मेमोरी ले लेता है (gpu-memory-utilization 0.9), यानी 24 GB वाले RTX 4090 पर लगभग 21.6 GB, मॉडल का size चाहे जो हो। weights जो हिस्सा इस्तेमाल नहीं करते, वह एक साथ चलने वाले requests का KV cache बन जाता है।"
  - question: "क्या Ollama एक साथ कई यूज़र्स को serve कर सकता है?"
    answer: "हाँ, लेकिन डिफ़ॉल्ट रूप से हर मॉडल पर एक बार में एक request होता है (OLLAMA_NUM_PARALLEL=1)। आप इसे बढ़ा सकते हैं, और हर parallel slot अपनी context मेमोरी जोड़ता है। प्रकाशित benchmarks दिखाते हैं कि भारी concurrency में Ollama, vLLM जितना अच्छा scale नहीं करता।"
  - question: "क्या Ollama, vLLM और TGI के पास OpenAI-compatible APIs हैं?"
    answer: "हाँ। तीनों /v1/chat/completions serve करते हैं। Ollama और vLLM completions, embeddings और Responses API भी serve करते हैं; TGI का OpenAI-compatible Messages API version 1.4.0 से मौजूद है।"
  - question: "क्या मैं 24 GB GPU पर Llama 3.1 8B को FP16 में चला सकता हूँ?"
    answer: "हाँ। 8.03 अरब parameters, हर एक 2 bytes का, यानी लगभग 16.1 GB weights, जो 24 GB में एक सामान्य KV cache की जगह के साथ आ जाते हैं। एक consumer कार्ड पर serve करने वाले ज़्यादातर लोग context और एक साथ चलने वाले यूज़र्स के लिए ज़्यादा जगह छोड़ने को 4-bit या 8-bit weights इस्तेमाल करते हैं।"
---

एक RTX 4090 पर 7B–8B मॉडल serve करते समय, एक बार में एक request के लिए Ollama और vLLM लगभग बराबर तेज़ चलते हैं। अंतर तब खुलता है जब कई requests एक साथ आते हैं: सितंबर 2026 के एक प्रकाशित test में 64 concurrent requests पर vLLM ने Ollama के कुल throughput का लगभग तीन गुना दिया। Hugging Face TGI अब भी काम करता है, लेकिन मार्च 2026 में उसकी repository archive होने के बाद से वह maintenance mode में है, और Hugging Face ख़ुद अब लोगों को vLLM और SGLang की ओर भेजता है।

तो चुनाव इस पर आकर टिकता है कि एक साथ कितने लोग मॉडल पर आते हैं। एक यूज़र, एक script, या एक छोटा internal tool: Ollama, क्योंकि उसमें सबसे कम मेहनत है। public API या ऐसे batch जॉब जिनमें कई requests एक साथ चल रहे हों: vLLM। TGI पर नया deployment: मैं शुरू नहीं करूँगा।

## आँकड़े कहाँ से आते हैं

इस पेज के पिछले version में throughput, latency और VRAM के आँकड़े हमारे अपने RTX 4090 माप के रूप में दिखाए गए थे। हम उन्हें किसी दोहराए जा सकने वाले रन या प्रकाशित स्रोत तक नहीं खोज पाए, इसलिए हमने उन्हें हटा दिया। शक की एक वजह: पुराने single-stream FP16 आँकड़े RTX 4090 की memory bandwidth की सीमा से ऊपर थे (अगला हिस्सा देखें)।

नीचे का हर आँकड़ा अब उसके प्रकाशक के नाम के साथ है, उनके इस्तेमाल किए hardware और मॉडल के साथ। जहाँ किसी ने RTX 4090 की साफ़ तुलना प्रकाशित नहीं की (जैसे TGI के लिए), वहाँ मैं ख़ाली जगह भरने के बजाय यही कहता हूँ।

मुख्य स्रोत:

- **ComputingForGeeks, 18 सितंबर 2026।** RTX 4090, L40S और RTX 5090 पर Ollama, vLLM और llama.cpp। मॉडल: Qwen2.5-7B-Instruct, vLLM के लिए AWQ 4-bit और Ollama व llama.cpp के लिए GGUF Q4_K_M। तय 512-token prompt, temperature 0, अधिकतम 256 output tokens, हर slot पर 4,096-token context, 64 parallel slots।
- **Red Hat Developer, 8 अगस्त 2025।** एक A100 40 GB पर Ollama 0.9.2 बनाम vLLM 0.9.1, FP16 में Llama 3.1 8B Instruct, 1 से 256 concurrent यूज़र, GuideLLM से मापा गया।
- **BentoML, 5 जून 2024।** A100 80 GB पर Llama 3 8B Instruct के साथ vLLM 0.4.2, TGI 2.0.4 और दूसरे।
- **llama.cpp CUDA scoreboard।** RTX 4090 समेत कई कार्डों पर Llama 2 7B Q4_0 की single-stream speed।

इनमें सिर्फ़ पहला RTX 4090 पर चलाया गया था, और उसमें TGI को छोड़कर इस पोस्ट के सारे engines हैं। बाक़ी data-center कार्डों पर वही pattern दिखाते हैं।

## एक request: कार्ड सीमा तय करता है

जब GPU एक अकेले request के लिए tokens बनाता है, तो उसे हर token के लिए मॉडल का हर weight मेमोरी से पढ़ना पड़ता है। इसलिए ऊपरी सीमा engine नहीं, memory bandwidth तय करती है।

RTX 4090 में 1,008 GB/s पर 24 GB GDDR6X है। Llama 3.1 8B में 8.03 अरब parameters हैं।

- FP16 में यह 8.03 × 2 bytes ≈ 16.1 GB weights है। 1,008 ÷ 16.1 ≈ **63 tokens प्रति सेकंड**, एक request के लिए अधिकतम।
- Ollama का डिफ़ॉल्ट `llama3.1:8b` tag Q4_K_M है, 4.9 GB का डाउनलोड। 1,008 ÷ 4.9 ≈ **205 tokens प्रति सेकंड**, अधिकतम।

असली engines इन सीमाओं से नीचे रहते हैं। llama.cpp scoreboard दिखाता है कि RTX 4090, Q4_0 वाले Llama 2 7B के साथ 186 tokens प्रति सेकंड बनाता है (flash attention के साथ 189)। ComputingForGeeks ने 4-bit Qwen2.5-7B के साथ एक request के लिए लगभग 174 tokens प्रति सेकंड मापे, और 4090 पर vLLM, llama.cpp और Ollama को "लगभग" एक जैसा पाया। (L40S और RTX 5090 पर उनका Ollama build llama.cpp की लगभग आधी speed से decode करता था, इसलिए अपना कार्ड और version जाँच लें।)

एक बार में एक यूज़र के लिए engine सुविधा देखकर चुनें, और speed के लिए quantization चुनें। FP16 से 4-bit पर जाने से सीमा लगभग तीन गुना हो जाती है। engine बदलने से मुश्किल से फ़र्क़ पड़ता है।

## कई requests: batching तय करती है

जब कई requests एक साथ चल रहे हों, तो GPU weights एक बार पढ़कर उन्हें requests के पूरे batch के लिए इस्तेमाल कर सकता है। अब मायने यह रखता है कि engine कितनी अच्छी batching करता है, और KV cache (हर request की अब तक की बातचीत की मेमोरी) को कैसे संभालता है।

<figure>
<svg viewBox="0 0 720 310" role="img" aria-labelledby="d1-title" xmlns="http://www.w3.org/2000/svg" font-family="system-ui, sans-serif" font-size="15">
<title id="d1-title">RTX 4090 पर 64 concurrent requests के साथ कुल throughput का बार चार्ट: vLLM 6,623, llama.cpp 2,391, Ollama 2,018 tokens प्रति सेकंड</title>
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
<text x="410" y="256" text-anchor="middle" fill="#64748b" font-size="13">कुल output tokens प्रति सेकंड, एक साथ 64 requests</text>
<text x="360" y="290" text-anchor="middle" fill="#1e1b4b" font-size="14">एक बार में एक request: तीनों पर लगभग 174 tokens प्रति सेकंड</text>
</svg>
<figcaption>RTX 4090, 4-bit Qwen2.5-7B-Instruct (vLLM के लिए AWQ, बाक़ी के लिए GGUF Q4_K_M), 64 concurrent requests। आँकड़े ComputingForGeeks से, सितंबर 2026; bars स्केल पर बने हैं। TGI इस test में शामिल नहीं था।</figcaption>
</figure>

RTX 4090 पर 64 requests में vLLM ने कुल 6,623 tokens प्रति सेकंड serve किए, llama.cpp के server ने 2,391 और Ollama ने 2,018। इसके लिए Ollama को ठीक से set किया गया था: `OLLAMA_NUM_PARALLEL=64`, `num_ctx 4096` और flash attention चालू। vLLM `--quantization awq_marlin --max-model-len 4096 --gpu-memory-utilization 0.90` के साथ चला। लेखकों ने time to first token भी बताया: llama.cpp के लिए लगभग 8 से 12 ms और vLLM के लिए 16 से 25 ms, और L40S व RTX 5090 पर Ollama का सबसे ज़्यादा।

Red Hat का A100 test FP16 weights के साथ उसी दिशा में इशारा करता है। vLLM का शिखर 793 tokens प्रति सेकंड था; डिफ़ॉल्ट settings पर Ollama 41 तक पहुँचा। Ollama की parallel सीमा 32 करने के बाद भी, जो "सबसे ऊँचा स्थिर मान" था, वह किसी भी concurrency स्तर पर vLLM की बराबरी नहीं कर पाया। उसका time to first token "ज़्यादा यूज़र्स के साथ तेज़ी से बढ़ा", और peak load पर inter-token latency में "भारी उछाल" दिखे।

इन्हें किसी को बताने से पहले दो सावधानियाँ। पहली, ComputingForGeeks की तुलना पूरी तरह बराबरी की नहीं है: vLLM ने AWQ weights चलाए, बाक़ी ने GGUF, और builds अलग हैं। दूसरी, ये सभी requests को मिलाकर कुल आँकड़े हैं। 64 में से हर यूज़र को vLLM पर लगभग 6,623 ÷ 64 ≈ 103 tokens प्रति सेकंड मिलते हैं, जो अब भी काफ़ी इस्तेमाल लायक है, और Ollama पर लगभग 2,018 ÷ 64 ≈ 32।

## TGI कहाँ खड़ा है

Text Generation Inference, Hugging Face का production server था, जिसमें continuous batching, Flash Attention और Paged Attention, tensor parallelism, Prometheus metrics और OpenTelemetry tracing थे। तकनीकी रूप से वह vLLM की ही श्रेणी में था।

उसकी स्थिति बदल गई है। TGI के docs अब इससे शुरू होते हैं: "text-generation-inference अब maintenance mode में है। आगे से हम छोटे bug fixes, documentation सुधार और हल्के maintenance कामों के pull requests स्वीकार करेंगे।" वे "vllm, SGLang, और साथ ही llama.cpp या MLX जैसे आपस में compatible local engines" सुझाते हैं। GitHub repository 21 मार्च 2026 को archive करके read-only कर दी गई।

मुझे RTX 4090 पर TGI का कोई हाल का प्रकाशित benchmark नहीं मिला। सबसे क़रीबी भरोसेमंद तुलना BentoML की है, जून 2024 में A100 80 GB पर: Llama 3 8B के साथ vLLM "TGI जैसे ही 2300-2500 tokens प्रति सेकंड" तक पहुँचा, और उनके परखे हर concurrency स्तर पर vLLM का time to first token सबसे अच्छा था। यह दोनों engines के लिए दो साल और कई releases पुरानी बात है, इसलिए इसे इतिहास मानें।

अगर TGI पहले से आपका production traffic चला रहा है, तो वह चलता रहेगा। नए deployment के लिए आप एक ऐसा server चुन रहे होंगे जिसे न नए मॉडल architectures मिलेंगे, न performance पर काम। एक RTX 4090 पर vLLM वह सब कवर करता है जो TGI करता था।

## 24 GB कार्ड पर VRAM

engines मेमोरी को बहुत अलग तरह से संभालते हैं, और इससे तय होता है कि कार्ड पर और क्या साथ चल सकता है।

**vLLM शुरू में ही कार्ड का ज़्यादातर हिस्सा ले लेता है।** उसका `--gpu-memory-utilization` डिफ़ॉल्ट 0.9 है, इसलिए 24 GB वाले RTX 4090 पर वह startup पर लगभग 21.6 GB ले लेता है, मॉडल का size चाहे जो हो। weights जो कुछ इस्तेमाल नहीं करते, वह सब KV cache बन जाता है। FP16 में Llama 3.1 8B (लगभग 16.1 GB) के साथ KV cache, activations और CUDA graphs के लिए लगभग 5.5 GB बचता है, जो context length और एक साथ आ सकने वाले requests की संख्या को सीमित करता है। 4-bit AWQ weights के साथ (ComputingForGeeks का build लगभग 5.6 GB था) 21.6 GB का ज़्यादातर हिस्सा KV cache में जाता है, और इसी से वह 64 requests चलाए रखता है। जब तक आप यह हिस्सा कम न करें, इसके बगल में दूसरा GPU program चलाने की उम्मीद न करें।

**Ollama हर मॉडल और हर context के हिसाब से मेमोरी लेता है।** `llama3.1:8b` Q4_K_M मॉडल 4.9 GB का है, साथ में उसकी context window का KV cache। Ollama डिफ़ॉल्ट context आपकी VRAM देखकर चुनता है: 24 GiB से कम पर 4k, 24 से 48 GiB पर 32k, 48 GiB और ऊपर पर 256k। RTX 4090 ठीक 24 GiB की रेखा पर है (nvidia-smi 24 GiB से थोड़ा कम दिखाता है), इसलिए `ollama ps` से देखें कि असल में कौन-सा context मिला, या उसे ख़ुद set करें। parallel slots इसे गुणा कर देते हैं: docs का उदाहरण है कि "4 parallel requests के साथ 2K context का नतीजा 8K context और अतिरिक्त मेमोरी allocation होगा"। अगर मेमोरी कम है, तो KV cache quantization मदद करता है: `q8_0` डिफ़ॉल्ट `f16` की लगभग आधी मेमोरी लेता है, और `q4_0` लगभग एक चौथाई। Ollama डिफ़ॉल्ट रूप से हर GPU पर तीन मॉडल तक loaded रख सकता है, अगर वे समा जाएँ, जो मॉडलों के बीच बदलते रहने वाले कार्ड के लिए ठीक है। 8, 12, 16 और 24 GB कार्डों पर कौन-से मॉडल आते ही हैं, इसके लिए [आपके GPU की VRAM में कौन-से AI मॉडल आते हैं](/hi/which-ai-models-fit-your-gpu-vram/) देखें।

**TGI** भी vLLM की तरह continuous batching के लिए पहले से मेमोरी ले लेता है। मुझे 4090 पर 8B मॉडल के लिए कोई मौजूदा, उद्धृत करने लायक VRAM आँकड़ा नहीं मिला, इसलिए मैं कोई नहीं दूँगा।

## quantization और मॉडल formats

| | Ollama | vLLM | TGI |
| --- | --- | --- | --- |
| **मुख्य format** | GGUF (जैसे Q4_K_M) | Hugging Face safetensors | Hugging Face safetensors |
| **4-bit विकल्प** | GGUF Q4 variants | AWQ, GPTQ, bitsandbytes, INT4 W4A16 | AWQ, GPTQ, Marlin, EXL2, bitsandbytes NF4/FP4 |
| **8-bit / FP8** | GGUF Q8_0 | Ada (RTX 4090) और Hopper पर FP8 W8A8; INT8 | bitsandbytes 8-bit, EETQ, fp8 |
| **GGUF** | मूल format | समर्थित | सूची में नहीं |
| **KV cache quantization** | q8_0, q4_0 | हाँ | यहाँ शामिल नहीं |

RTX 4090 एक Ada कार्ड है (SM 8.9), इसलिए उस पर vLLM का FP8 रास्ता काम करता है। FP8 weights FP16 की आधी मेमोरी लेते हैं: 8B मॉडल के लिए लगभग 8 GB, एक 4090 पर FP16 और 4-bit के बीच का रास्ता।

Ollama की model library पहले से quantize किए GGUF tags देती है, इसलिए इस पर शायद ही सोचना पड़ता है: `ollama pull llama3.1:8b` से आपको Q4_K_M मिलता है। vLLM के साथ आप Hugging Face से पहले से quantize किया checkpoint चुनते हैं या ख़ुद quantization flag देते हैं।

## OpenAI-compatible servers और setup

तीनों आपको OpenAI-style HTTP API देते हैं, इसलिए OpenAI SDKs और ज़्यादातर chat tools सिर्फ़ base URL बदलकर काम करते हैं।

| | Ollama | vLLM | TGI |
| --- | --- | --- | --- |
| **डिफ़ॉल्ट पता** | `localhost:11434/v1` | `localhost:8000/v1` | container port 80 (अक्सर 8080 पर map किया जाता है) |
| **Chat completions** | हाँ | हाँ | हाँ (Messages API, 1.4.0 से) |
| **दूसरे OpenAI endpoints** | completions, models, embeddings, responses | completions, embeddings, responses, audio | यहाँ शामिल नहीं |
| **Install** | एक script | pip package | Docker image |

हर project के docs के मुताबिक़ 8B मॉडल चलाना:

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

Ollama में सबसे कम मेहनत है, और काफ़ी अंतर से। वह डाउनलोड, quantize की हुई फ़ाइलें, load और unload सब संभालता है, और laptop व किराये के server पर एक जैसा चलता है। Ollama की OpenAI layer में कुछ कमियाँ हैं: chat completions पर `logprobs` या `tool_choice` नहीं, और images base64 में होनी चाहिए, URLs नहीं। vLLM को एक चालू CUDA और Python setup चाहिए और tune करने के लिए ज़्यादा flags, लेकिन Hugging Face अब TGI की जगह इसी engine को सुझाता है। अगर आप पहले से Docker चलाते हैं तो TGI आसान है, ऊपर वाली maintenance की चेतावनी के साथ।

## किस काम के लिए कौन-सा engine

**Ollama** एक व्यक्ति, एक script, एक coding assistant, कुछ यूज़र्स वाले internal tool, या कई मॉडलों के बीच बदलती मशीन के लिए। setup में कुछ मिनट लगते हैं, और 4090 पर single-request speed किसी से कम नहीं।

**vLLM** जब कई requests एक ही समय पर आते हों: public API, कई यूज़र्स वाला chat product, या ऐसे batch जॉब जिन्हें आप एक साथ 32 या 64 चला सकें। प्रकाशित आँकड़े RTX 4090 पर 64 concurrent requests में Ollama के कुल throughput का लगभग तीन गुना दिखाते हैं, और A100 पर इससे कहीं ज़्यादा। इसमें quantization और API का समर्थन भी सबसे व्यापक है।

**TGI** सिर्फ़ तब, जब आप उसे पहले से चला रहे हों। नए काम के लिए Hugging Face की अपनी सलाह vLLM या SGLang है।

जब आप घंटे के हिसाब से किराये पर लेते हैं, तो लागत throughput से तय होती है। ComputingForGeeks के आँकड़ों से, $0.31 प्रति घंटा वाले RTX 4090 पर (सितंबर 2026 में getdeploying.com पर दर्ज सबसे कम Vast.ai on-demand कीमत) दस लाख output tokens लें:

- एक बार में एक request, 174 tokens/s: 1,000,000 ÷ 174 ≈ 5,750 s ≈ 1.6 घंटे ≈ **$0.50**।
- Ollama पर एक साथ 64, 2,018 tokens/s: ≈ 496 s ≈ **$0.04**।
- vLLM पर एक साथ 64, 6,623 tokens/s: ≈ 151 s ≈ **$0.01**।

ये मानते हैं कि GPU पूरे समय व्यस्त है। अगर आपके पास कभी एक से ज़्यादा request एक साथ नहीं होता, तो batching से कुछ नहीं मिलता और engine के चुनाव से आपका बिल नहीं बदलता। अगर आपके पास काम की कतार है, तो यह बिल को दस गुना तक बदल देता है। प्रति token APIs से तुलना के साथ यही तर्क [घंटे के हिसाब से GPU या प्रति token API](/hi/hourly-gpu-vs-per-token-api/) में है।

## GPUFlow कहाँ फ़िट होता है

GPUFlow का provider installer डिफ़ॉल्ट रूप से Ollama set up करता है और GPUFlow एजेंट requests उसी तक पहुँचाता है, इसलिए वहाँ आमतौर पर ऊपर का Ollama वाला कॉलम लागू होता है। आप provider के GPU पर किसी मॉडल के लिए OpenAI-compatible API key किराये पर लेते हैं (`https://gpuflow.app/v1`, `/v1/chat/completions` और `/v1/models` के साथ, streaming समर्थित)। आप समय का पैसा देते हैं, 1 मिनट न्यूनतम के साथ प्रति सेकंड, प्रति token नहीं।

GPUFlow पर आप क्या नहीं कर सकते: engine चुनना, उसकी settings बदलना, या अपना code चलाना। न SSH है, न shell। ऊपर के benchmarks दोहराने या ख़ुद vLLM चलाने के लिए Vast.ai या RunPod पर ऐसी मशीन किराये पर लें जिसमें आप login कर सकें ([दोनों की तुलना](/hi/runpod-vs-vastapi-comparison/))। बिना कुछ install किए किसी app से Ollama पर चल रहा मॉडल इस्तेमाल करने के लिए [GPUFlow मार्केटप्लेस](https://gpuflow.app/hi/marketplace) और [आम tools में key कैसे इस्तेमाल करें](/hi/use-openai-compatible-api-key-in-apps/) देखें।

अगर आपने अपना मॉडल fine-tune किया है और तय कर रहे हैं कि उसे कैसे serve करें, तो [private LLM fine-tuning guide](/hi/private-llm-fine-tuning-guide/) इससे पहले वाला क़दम बताता है।

## स्रोत

सभी की जाँच सितंबर 2026 में की गई।

- RTX 4090, L40S और RTX 5090 पर Ollama vs vLLM vs llama.cpp: [ComputingForGeeks](https://computingforgeeks.com/ollama-vs-vllm-vs-llama-cpp/) (18 सितंबर 2026)
- A100 40 GB पर Ollama vs vLLM: [Red Hat Developer](https://developers.redhat.com/articles/2025/08/08/ollama-vs-vllm-deep-dive-performance-benchmarking) (8 अगस्त 2025)
- A100 80 GB पर vLLM, TGI और दूसरे: [BentoML, Benchmarking LLM Inference Backends](https://www.bentoml.com/blog/benchmarking-llm-inference-backends) (5 जून 2024)
- llama.cpp CUDA scoreboard: [github.com/ggml-org/llama.cpp/discussions/15013](https://github.com/ggml-org/llama.cpp/discussions/15013)
- RTX 4090 की मेमोरी और bandwidth: [TechPowerUp review](https://www.techpowerup.com/review/nvidia-geforce-rtx-4090-founders-edition/)
- Llama 3.1 8B के parameters और license: [Hugging Face model card](https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct)
- Ollama: [FAQ (parallel requests, KV cache)](https://docs.ollama.com/faq), [context length](https://docs.ollama.com/context-length), [OpenAI compatibility](https://docs.ollama.com/api/openai-compatibility), [llama3.1:8b tag](https://ollama.com/library/llama3.1:8b)
- vLLM: [OpenAI-compatible server](https://docs.vllm.ai/en/latest/serving/online_serving/openai_compatible_server/), [quantization](https://docs.vllm.ai/en/latest/features/quantization/index.html), [engine arguments (gpu-memory-utilization)](https://docs.vllm.ai/en/v0.6.4/models/engine_args.html)
- TGI: [docs और maintenance की सूचना](https://huggingface.co/docs/text-generation-inference/en/index), [GitHub repository (archive की गई)](https://github.com/huggingface/text-generation-inference), [Messages API](https://huggingface.co/docs/text-generation-inference/en/messages_api), [quantization](https://huggingface.co/docs/text-generation-inference/en/conceptual/quantization)
- RTX 4090 की किराये की कीमत: [getdeploying.com](https://getdeploying.com/reference/cloud-gpu/nvidia-rtx-4090)
- GPUFlow: [API quickstart](https://docs.gpuflow.app/hi/renters/api-quickstart/), [providers के लिए शुरुआत](https://docs.gpuflow.app/hi/providers/getting-started/)
