---
title: "किराये के GPU पर $10 से कम में Stable Diffusion LoRA training"
description: "किराये के RTX 4090 पर $10 से काफ़ी कम में SDXL या Flux LoRA train करें: VRAM के हिसाब से GPU चुनना, captions, sd-scripts और ai-toolkit की settings, और पूरा ख़र्च का हिसाब।"
excerpt: "सितंबर 2026 में किराये के RTX 4090 पर एक SDXL LoRA run का ख़र्च लगभग $0.35 से $0.80 है। कौन-सा GPU लें, तस्वीरें और captions कैसे तैयार करें, training की पूरी command, और पैसा असल में कहाँ जाता है, सब यहाँ है।"
pubDate: 2026-02-11
updatedDate: 2026-09-30
locale: "hi"
category: "tutorials"
featured: false
draft: false
author: "GPUFlow Team"
heroImage: "../_images/stable-diffusion-lora-training-guide.jpg"
heroImageAlt: "एक बड़े monitor के आसपास खड़े लोगों का चित्र, जिस पर LoRA network का diagram है, पास में एक server rack और एक panel जो दो training epochs की sample तस्वीरों की तुलना करता है"
faq:
  - question: "किराये के GPU पर LoRA train करने में कितना ख़र्च आता है?"
    answer: "सितंबर 2026 में RTX 4090 Vast.ai पर लगभग $0.31 प्रति घंटा और RunPod के pricing पेज पर $0.74 प्रति घंटा था। setup और testing मिलाकर लगभग 65 मिनट का SDXL LoRA session इसलिए मोटे तौर पर $0.34 से $0.80 का पड़ता है।"
  - question: "SDXL LoRA train करने के लिए कितनी VRAM चाहिए?"
    answer: "sd-scripts के docs कहते हैं कि SDXL LoRA training 8 GB GPU मेमोरी में हो सकती है, और 10 GB की सलाह है, बशर्ते आप सिर्फ़ U-Net train करें, latents और text encoder outputs cache करें और gradient checkpointing इस्तेमाल करें। RTX 3090 या 4090 जैसे 24 GB कार्ड पर आप मेमोरी से जूझे बिना 1024x1024 पर train कर सकते हैं।"
  - question: "क्या RTX 4090 पर Flux LoRA train हो सकता है?"
    answer: "हाँ। ai-toolkit में FLUX.1 के example configs हैं जिनके नाम में ही 24 GB कार्ड लिखा है, और sd-scripts block swapping के साथ FLUX.1 के लिए 8 GB तक की settings देता है। Black Forest Labs की अपनी guide कहती है कि RTX 4090 पर 1,800 steps का FLUX.2 [klein] LoRA run एक घंटे से कम लेता है।"
  - question: "LoRA train करने के लिए कितनी तस्वीरें चाहिए?"
    answer: "एक character, चीज़ या style के लिए 15 से 40 अच्छी तस्वीरें आम तौर पर काफ़ी हैं; Black Forest Labs FLUX.2 [klein] के लिए एक जैसे look वाली 15 से 40 तस्वीरें सुझाता है। बड़ी गिनती से ज़्यादा ज़रूरी है कि तस्वीरें साफ़, अलग-अलग और अच्छे captions वाली हों।"
  - question: "LoRA training के लिए कौन बेहतर है: kohya_ss, OneTrainer या ai-toolkit?"
    answer: "तीनों काम करते हैं। kohya का sd-scripts command-line का मानक है और kohya_ss उसके ऊपर web UI लगाता है; OneTrainer में desktop UI और built-in captioning है; ai-toolkit में web UI, RunPod का official template और FLUX.2 व Qwen-Image जैसे नए मॉडल का जल्दी support है।"
  - question: "क्या मैं GPUFlow पर LoRA train कर सकता हूँ?"
    answer: "नहीं। GPUFlow provider के GPU पर एक OpenAI-compatible chat API किराये पर देता है, बिना shell, SSH या फ़ाइल access के, इसलिए वहाँ training script नहीं चल सकती। ऐसा प्लेटफ़ॉर्म लें जो आपको मशीन किराये पर दे, जैसे Vast.ai या RunPod।"
---

SDXL या किसी छोटे Flux मॉडल का LoRA किराये के GPU पर $10 से काफ़ी कम में train हो जाता है। सितंबर 2026 में RTX 4090 का किराया Vast.ai पर लगभग $0.31 प्रति घंटा और RunPod पर $0.74 प्रति घंटा है, और setup व testing मिलाकर एक SDXL LoRA session घंटे भर से थोड़ा ज़्यादा लेता है। यानी हर कोशिश $0.34 से $0.80 की, और $10 में दर्जन भर कोशिशें।

मुश्किल पैसा नहीं है। मुश्किल हैं तस्वीरें, captions और यह जानना कि कब रुकना है। यह guide इन सबको कवर करती है, ऐसी commands के साथ जिन्हें आप सीधे paste कर सकते हैं। कीमतें और टूल के वर्ज़न सितंबर 2026 में जाँचे गए; स्रोत आख़िर में हैं।

## पाँच चरणों में पूरा काम

<figure>
<svg viewBox="0 0 720 250" role="img" aria-labelledby="d1-title" xmlns="http://www.w3.org/2000/svg" font-family="system-ui, sans-serif" font-size="15">
<title id="d1-title">LoRA training का क्रम: dataset, captions, train, test, इस्तेमाल, और नतीजा ग़लत हो तो वापस dataset पर</title>
<defs><marker id="d1-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#6366f1"/></marker></defs>
<rect width="720" height="250" fill="#ffffff"/>
<line x1="20" y1="40" x2="280" y2="40" stroke="#16a34a" stroke-width="2"/>
<text x="150" y="30" text-anchor="middle" fill="#16a34a" font-size="13">मुफ़्त: आपके अपने PC पर</text>
<line x1="300" y1="40" x2="560" y2="40" stroke="#f97316" stroke-width="2"/>
<text x="430" y="30" text-anchor="middle" fill="#f97316" font-size="13">बिल बनता है: किराये के GPU पर</text>
<rect x="20" y="60" width="120" height="70" rx="10" fill="#eef2ff" stroke="#6366f1" stroke-width="2"/>
<text x="80" y="90" text-anchor="middle" fill="#1e1b4b" font-weight="600">Dataset</text>
<text x="80" y="112" text-anchor="middle" fill="#64748b" font-size="13">15–40 तस्वीरें</text>
<rect x="160" y="60" width="120" height="70" rx="10" fill="#eef2ff" stroke="#6366f1" stroke-width="2"/>
<text x="220" y="90" text-anchor="middle" fill="#1e1b4b" font-weight="600">Captions</text>
<text x="220" y="112" text-anchor="middle" fill="#64748b" font-size="13">हर एक की .txt</text>
<rect x="300" y="60" width="120" height="70" rx="10" fill="#eef2ff" stroke="#6366f1" stroke-width="2"/>
<text x="360" y="90" text-anchor="middle" fill="#1e1b4b" font-weight="600">Train</text>
<text x="360" y="112" text-anchor="middle" fill="#64748b" font-size="13">sd-scripts</text>
<rect x="440" y="60" width="120" height="70" rx="10" fill="#eef2ff" stroke="#6366f1" stroke-width="2"/>
<text x="500" y="90" text-anchor="middle" fill="#1e1b4b" font-weight="600">Test</text>
<text x="500" y="112" text-anchor="middle" fill="#64748b" font-size="13">sample grid</text>
<rect x="580" y="60" width="120" height="70" rx="10" fill="#eef2ff" stroke="#6366f1" stroke-width="2"/>
<text x="640" y="90" text-anchor="middle" fill="#1e1b4b" font-weight="600">इस्तेमाल</text>
<text x="640" y="112" text-anchor="middle" fill="#64748b" font-size="13">ComfyUI, Forge</text>
<line x1="140" y1="95" x2="158" y2="95" stroke="#6366f1" stroke-width="2" marker-end="url(#d1-arrow)"/>
<line x1="280" y1="95" x2="298" y2="95" stroke="#6366f1" stroke-width="2" marker-end="url(#d1-arrow)"/>
<line x1="420" y1="95" x2="438" y2="95" stroke="#6366f1" stroke-width="2" marker-end="url(#d1-arrow)"/>
<line x1="560" y1="95" x2="578" y2="95" stroke="#6366f1" stroke-width="2" marker-end="url(#d1-arrow)"/>
<path d="M500,130 L500,180 L80,180 L80,134" fill="none" stroke="#f97316" stroke-width="2" stroke-dasharray="6 4" marker-end="url(#d1-arrow)"/>
<text x="290" y="205" text-anchor="middle" fill="#1e1b4b" font-size="13">नतीजा ठीक नहीं? तस्वीरें या captions सुधारें, फिर दोबारा train करें</text>
<text x="360" y="235" text-anchor="middle" fill="#64748b" font-size="13">ज़्यादातर quality पहले दो बॉक्स से आती है, और उनका कोई ख़र्च नहीं</text>
</svg>
<figcaption>किराये पर लेने से पहले dataset और captions तैयार कर लें। GPU का बिल सिर्फ़ training और testing का बनता है, और ख़राब नतीजा आपको आमतौर पर settings पर नहीं, तस्वीरों पर वापस भेजता है।</figcaption>
</figure>

## LoRA क्या है और सस्ता क्यों है

LoRA (Low-Rank Adaptation) base मॉडल को जस का तस रखता है और उसकी कुछ layers के बगल में दो छोटे matrices train करता है। मूल paper के मुताबिक़ GPT-3 175B की पूरी fine-tuning के मुक़ाबले trainable parameters 10,000 गुना और GPU मेमोरी 3 गुना कम हो गई। image मॉडल में भी यही होता है: SDXL का base checkpoint 6.9 GB की फ़ाइल है, जबकि आपका train किया LoRA एक छोटी अलग फ़ाइल है, जिसे आप उसके ऊपर मनचाही strength पर load करते हैं।

इसीलिए एक consumer GPU काफ़ी है, और एक run दिनों नहीं, दसियों मिनट लेता है।

## VRAM के हिसाब से GPU चुनें

आप क्या train कर सकते हैं, यह VRAM तय करती है। run में कितने billed मिनट लगेंगे, यह speed तय करती है, इसलिए प्रति घंटा महँगा पर तेज़ कार्ड प्रति run लगभग उतने का ही पड़ सकता है।

| मॉडल family | docs में न्यूनतम | आराम से | टिप्पणी |
| --- | --- | --- | --- |
| SD 1.5 | 8 GB | 12 GB+ | 512x512 पर train, सबसे सस्ता और तेज़ |
| SDXL | 8 GB (10 GB की सलाह) | 24 GB | सिर्फ़ U-Net, latents और text encoder outputs cache |
| FLUX.1 [dev] (12B) | भारी block swapping के साथ 8 GB | 24 GB | sd-scripts 24, 16, 12, 10 और 8 GB की settings देता है |
| FLUX.2 [klein] 4B/9B | बताया नहीं गया | 24 GB | BFL: लगभग 13 GB bf16 weights, LoRA run 24 GB से कम में |

कम VRAM वाली settings काम करती हैं, पर धीमी हैं। sd-scripts FLUX.1 को 8 से 16 GB में transformer blocks को GPU और system RAM के बीच swap करके फ़िट करता है, और हर swap में वह समय लगता है जिसका आप पैसा देते हैं। किराये की मशीन पर 24 GB कार्ड समझदारी वाला default है: RTX 3090 या 4090। RTX 5090 (32 GB) भी चलता है, लेकिन sd-scripts बताता है कि उसके लिए CUDA 12.8 या 12.9 के साथ PyTorch 2.8.0 चाहिए, इसलिए देख लें कि आपके template में इतना नया stack है।

![सफ़ेद शेल्फ़ पर खड़ा तीन पंखों वाला ASUS TUF ग्राफ़िक्स कार्ड](../_images/test-hero.jpg)

datacenter कार्ड तेज़ हैं, लेकिन RunPod A100 80 GB $1.59 प्रति घंटा में देता है, जो 4090 के दोगुने से ज़्यादा है। 20 या 30 तस्वीरों के LoRA के लिए अतिरिक्त speed शायद ही यह फ़र्क़ पूरा करती है; ये बड़े datasets या पूरी fine-tuning के लिए ज़्यादा ठीक हैं।

## कहाँ किराये पर लें, और ख़र्च कितना

आपको ऐसा प्लेटफ़ॉर्म चाहिए जो मशीन दे: shell या Jupyter notebook, डिस्क, और फ़ाइलें अंदर-बाहर कॉपी करने का तरीका। इस तरह के काम के लिए Vast.ai और RunPod सबसे आम विकल्प हैं।

| GPU | VRAM | Vast.ai (से शुरू) | RunPod pricing पेज | RunPod का सबसे सस्ता दर्ज |
| --- | --- | --- | --- | --- |
| RTX 3090 | 24 GB | लगभग $0.11–0.13/घंटा | $0.50/घंटा | $0.22/घंटा |
| RTX 4090 | 24 GB | लगभग $0.31–0.33/घंटा | $0.74/घंटा | $0.34/घंटा |
| RTX 5090 | 32 GB | लगभग $0.41–0.47/घंटा | $0.99/घंटा | $0.69/घंटा |

कीमतें सितंबर 2026 की हैं। "Vast.ai (से शुरू)" और "RunPod का सबसे सस्ता दर्ज" getdeploying.com के price tracker से हैं; बीच वाला कॉलम RunPod का अपना pricing पेज है। Vast.ai पर host अपनी कीमत ख़ुद तय करते हैं, इसलिए आपको दिखने वाले offers जगह और reliability score के हिसाब से अलग होंगे।

दोनों प्रति सेकंड बिल करते हैं। अतिरिक्त शुल्क अलग हैं, और एक घंटे के काम में ये प्रति घंटा दर से जितना लगता है उससे ज़्यादा मायने रखते हैं:

- **Vast.ai** storage का पैसा "जब तक आपका instance मौजूद है, चाहे वह चल रहा हो या नहीं" लेता है, और bandwidth का पैसा प्रति byte, हर host की तय दर पर। महँगी bandwidth वाले host पर 7 GB का base मॉडल डाउनलोड करना जुड़ता जाता है। instance को सिर्फ़ रोकें नहीं, delete करें।
- **RunPod** चालू रहते container disk का $0.10 प्रति GB प्रति माह लेता है, रुकने के बाद उसका कुछ नहीं, और रुकी हुई volume disk का $0.20 प्रति GB प्रति माह। अंदर या बाहर जाने वाले डेटा का वह पैसा नहीं लेता।

दोनों पर तैयार templates हैं। ai-toolkit का author एक official RunPod template रखता है, और kohya_ss का README RunPod को supported setup बताता है। template से billed समय पर PyTorch इंस्टॉल करने के दस या ज़्यादा मिनट बचते हैं। कीमतों की बड़ी तुलना के लिए [GPUFlow vs Vast.ai vs RunPod vs SaladCloud](/hi/gpuflow-vs-vast-ai-vs-runpod/) और [GPU किराये की छिपी लागत](/hi/hidden-fees-in-gpu-rental/) देखें।

## dataset और captions तैयार करें

यह सब कुछ भी किराये पर लेने से पहले अपने कंप्यूटर पर करें।

### तस्वीरें

- **गिनती।** एक इंसान, चीज़ या style के लिए 15 से 40 तस्वीरें। Black Forest Labs FLUX.2 [klein] के लिए "एक जैसे look वाली 15–40 तस्वीरें" सुझाता है। अगर अतिरिक्त तस्वीरें कमज़ोर हैं, तो ज़्यादा बेहतर नहीं है।
- **एकरूपता और विविधता।** हर तस्वीर में concept दिखना चाहिए। बाक़ी सब बदलना चाहिए: angle, रोशनी, background, framing। अगर आपके product की हर फ़ोटो एक ही सफ़ेद मेज़ पर है, तो LoRA मेज़ सीख लेगा।
- **quality।** साफ़, ठीक exposure, कोई watermark या ऊपर लिखा टेक्स्ट नहीं। LoRA noise और JPEG blocks को भी उतनी ही वफ़ादारी से सीखता है जितना बाक़ी सब।
- **resolution।** SDXL और Flux के लिए छोटी side पर कम से कम 1024 pixels, SD 1.5 के लिए 512। वर्गाकार crop की ज़रूरत नहीं: bucketing चालू हो तो sd-scripts तस्वीरों को aspect ratio के हिसाब से समूहों में बाँटता है।

### Captions

हर तस्वीर के साथ उसी नाम की एक text फ़ाइल होती है (`photo01.jpg`, `photo01.txt`)। caption मॉडल को बताता है कि कौन-सी बात शब्दों से पहले ही समझाई जा चुकी है, ताकि LoRA वह सीखे जो नहीं समझाई गई। सबसे पहले एक दुर्लभ trigger word रखें, फिर वह सब लिखें जिसे आप बदलने लायक़ रखना चाहते हैं:

```text
zxq_mug, a ceramic coffee mug on a wooden desk, morning light from the left, shallow depth of field
```

दो टूल आपके लिए पहला draft लिख देंगे:

- **WD14 tagger**, जो sd-scripts में शामिल है, comma से अलग tags बनाता है। anime-style मॉडल और tags पर train हुए SDXL fine-tunes के लिए अच्छा है:

  ```bash
  python finetune/tag_images_by_wd14_tagger.py --onnx \
    --repo_id SmilingWolf/wd-swinv2-tagger-v3 --batch_size 4 /workspace/dataset/img
  ```

- **JoyCaption**, diffusion मॉडल की training के लिए बना एक open (Apache 2.0) captioning मॉडल, सामान्य भाषा में वाक्य लिखता है, जो Flux के लिए tags से बेहतर हैं। उसका README कहता है कि bf16 में उसे लगभग 17 GB VRAM चाहिए, और छोटे कार्ड के लिए 8-bit और 4-bit वर्ज़न हैं।

OneTrainer में भी BLIP, BLIP2 और WD-1.4 के साथ built-in captioning है। draft कोई भी लिखे, हर caption पढ़ें और सुधारें। पूरे project का सबसे क़ीमती आधा घंटा यही है।

## trainer चुनें

चार टूल लगभग सबकी ज़रूरत पूरी करते हैं। सभी मुफ़्त और open source हैं।

| टूल | Interface | मॉडल (सितंबर 2026) | किसके लिए ठीक |
| --- | --- | --- | --- |
| kohya-ss/sd-scripts | Command line | SD 1.x/2.x, SDXL, SD3/3.5, FLUX.1, Lumina, HunyuanImage-2.1, Anima | दोहराए जा सकने वाले runs, पूरा नियंत्रण |
| bmaltais/kohya_ss | sd-scripts के ऊपर web UI | sd-scripts जैसे ही | flags याद किए बिना sd-scripts |
| Nerogar/OneTrainer | Desktop UI और CLI | SD 1.5 से 3.5, SDXL, FLUX.1, FLUX.2, Chroma, Qwen Image और अन्य | built-in captioning और masking |
| ostris/ai-toolkit | Web UI और YAML configs | SD 1.5, SDXL, FLUX.1, FLUX.2, Qwen-Image, Wan video और अन्य | Flux और नए मॉडल, RunPod template |

sd-scripts वर्ज़न 0.11.1 (जून 2026) पर है, Python 3.10 के साथ टेस्ट हुआ है और उसे PyTorch 2.6.0 या नया चाहिए। ai-toolkit Python 3.12 की सलाह देता है और फ़िलहाल CUDA 13.0 के लिए बना PyTorch 2.13.0 इंस्टॉल करता है। OneTrainer को Python 3.10 से 3.13 चाहिए।

मैं SDXL के लिए sd-scripts इस्तेमाल करता हूँ, क्योंकि command line ही पूरा configuration है, जिससे runs दोहराना और उनकी तुलना करना आसान होता है, और Flux के लिए ai-toolkit।

## sd-scripts से SDXL LoRA train करें

NVIDIA driver वाले नए Linux instance पर setup कुछ commands का है:

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

तस्वीरों और `.txt` captions वाला अपना फ़ोल्डर `scp`, `rsync` या प्लेटफ़ॉर्म के file browser से `/workspace/dataset/img` में कॉपी करें। फिर `/workspace/dataset.toml` में dataset का ब्योरा लिखें:

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

और training शुरू करें:

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

`prompts.txt` में हर लाइन पर एक test prompt होता है, size, seed और steps के लिए sd-scripts के inline options के साथ:

```text
zxq_mug, a ceramic coffee mug on a kitchen counter --w 1024 --h 1024 --d 42 --s 28
zxq_mug, a ceramic coffee mug held by a hiker on a mountain top --w 1024 --h 1024 --d 42 --s 28
```

### settings क्या करती हैं

- **Steps।** तस्वीरें × repeats × epochs ÷ batch size। 25 तस्वीरों के साथ: 25 × 10 × 8 = 2,000 steps।
- **`network_dim` 16, `network_alpha` 8।** LoRA की क्षमता। एक चीज़ या चेहरे के लिए 16 काफ़ी है; style के लिए कभी-कभी 32 चाहिए। ऊँची rank जल्दी overfit होती है और फ़ाइल बड़ी बनाती है।
- **`--network_train_unet_only`।** यहाँ ज़रूरी है: text encoders को train करते हुए sd-scripts उनके outputs cache करने से मना कर देता है, और उसके docs वैसे भी SDXL LoRAs के लिए सिर्फ़ U-Net training को "highly recommended" बताते हैं।
- **caching और gradient checkpointing।** यही SDXL को 8 से 10 GB में फ़िट करते हैं। caching से caption shuffling और caption dropout भी बंद हो जाते हैं, इसीलिए वे dataset फ़ाइल में नहीं हैं।
- **AdamW8bit के साथ `learning_rate` 1e-4।** sd-scripts के अपने SDXL LoRA उदाहरण का मान। अगर चार epochs के बाद samples मुश्किल से बदलें, तो 2e-4 आज़माएँ। अगर वे आपकी training तस्वीरों की नक़ल बनने लगें, तो इसे घटाएँ या पहले रुकें।
- **हर 2 epochs पर checkpoint।** आपको epochs 2, 4, 6 और 8 की फ़ाइलें मिलेंगी, और आप सबसे अच्छी चुनेंगे। सबसे अच्छा LoRA अक्सर आख़िरी नहीं होता।

### कितना समय लगता है

kohya_ss के एक issue thread में यूज़र्स ने RTX 4090 पर gradient checkpointing के साथ, 1024x1024 और batch size 1 पर SDXL LoRA training के लिए लगभग 1.1 से 1.4 iterations प्रति सेकंड बताए। इस speed पर 2,000 steps में 24 से 30 मिनट लगते हैं, और latents cache करने के कुछ मिनट अलग। वही thread यह भी दिखाता है कि जब कार्ड की VRAM ख़त्म होकर shared memory में चली जाती है तो हालत कितनी बिगड़ती है: हर step में 50 सेकंड या ज़्यादा। अगर आपकी speed अपेक्षित range से बहुत नीचे है, तो settings को दोष देने से पहले `nvidia-smi` देखें।

## ai-toolkit से Flux और नए मॉडल

Flux के लिए ai-toolkit सबसे आसान रास्ता है। किराये की मशीन पर:

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

या `cd ui && npm run build_and_start` से web UI चलाएँ और port 8675 खोलें। अगर server तक दूसरे लोग पहुँच सकते हैं, तो README की सलाह के मुताबिक़ पहले `AI_TOOLKIT_AUTH` में password सेट करें।

Flux मॉडल चुनने से पहले licenses के बारे में दो बातें जान लें:

- **FLUX.1 [dev]** Hugging Face पर gated है। आप FLUX.1 [dev] Non-Commercial License स्वीकार करते हैं और उसे डाउनलोड करने के लिए Hugging Face read token इस्तेमाल करते हैं। उसका model card कहता है कि बनाए गए outputs commercial काम में इस्तेमाल हो सकते हैं; weights और आपका LoRA non-commercial license के तहत आते हैं।
- **FLUX.2 [klein] 4B** Apache 2.0 है और gated नहीं है। 9B वर्ज़न FLUX Non-Commercial License पर है।

Black Forest Labs ने जून 2026 में ai-toolkit से FLUX.2 [klein] LoRAs train करने की guide प्रकाशित की: RTX 4090 पर 1,800 steps का run "एक घंटे से कम लेता है", और वे लगभग 750 से 1,500 steps के checkpoints देखने की सलाह देते हैं। FLUX.1 [dev] के लिए, जो klein 4B से तीन गुना बड़ा है, मुझे इतना ठोस प्रकाशित समय नहीं मिला; ज़्यादा समय का बजट रखें और पहला run ख़ुद मापें।

## पैसा देना बंद करने से पहले LoRA टेस्ट करें

मशीन चालू रहते ही हर सेव हुए epoch की sample तस्वीरें देखें। ये आपको मुफ़्त में बताती हैं कि LoRA ने concept सीखा या नहीं, और overfit होना कब शुरू हुआ। फिर पसंद के checkpoints डाउनलोड करें:

```bash
rsync -avP user@your-instance:/workspace/output/*.safetensors ./loras/
```

घर पर फ़ाइल को ComfyUI के `models/loras` फ़ोल्डर या Forge के `models/Lora` में रखें, और तय seeds के साथ टेस्ट करें:

- **Strength।** 0.6, 0.8 और 1.0 आज़माएँ। कुछ LoRA 1.0 से नीचे सबसे अच्छे दिखते हैं।
- **लचीलापन।** trigger को ऐसे दृश्यों में रखें जो आपके डेटा में नहीं थे। पहाड़ पर mug, painting में चेहरा। अगर यह सिर्फ़ training तस्वीरों जैसे दृश्यों में काम करता है, तो overfit है: पहले का epoch लें या repeats घटाएँ।
- **रिसाव।** trigger word के बिना generate करें। अगर concept फिर भी दिख जाए, तो आपके captions ने तस्वीर का काफ़ी हिस्सा नहीं बताया।

नतीजा ग़लत हो तो इलाज आमतौर पर dataset में होता है: कुछ कमज़ोर तस्वीरें हटाना, या ऐसे captions जो उन चीज़ों का नाम लें जिन्हें आप बदलने लायक़ रखना चाहते हैं। learning rate बदलना दूसरा क़दम है, पहला नहीं।

## ख़र्च का पूरा हिसाब

एक SDXL LoRA, 25 तस्वीरें, 2,000 steps, RTX 4090 पर:

| चरण | समय |
| --- | --- |
| template से शुरू करना, sd-scripts इंस्टॉल करना | 10 मिनट |
| SDXL base डाउनलोड, dataset अपलोड, cache | 10 मिनट |
| Training (1.1 से 1.4 it/s पर 2,000 steps) | 30 मिनट |
| samples देखना, checkpoints डाउनलोड करना, instance delete करना | 15 मिनट |
| **कुल** | **65 मिनट (1.08 घंटे)** |

- Vast.ai पर $0.31/घंटा: 1.08 × $0.31 = **$0.34**, साथ में storage और host की bandwidth दर।
- RunPod पर $0.74/घंटा: 1.08 × $0.74 = **$0.80**। उस घंटे के लिए 50 GB container disk जोड़ती है 50 × $0.10 ÷ 730 घंटे = 1 cent से कम।

एक घंटे की training और 30 मिनट के setup व testing वाला FLUX.2 [klein] LoRA RunPod पर 1.5 × $0.74 = **$1.11** का पड़ता है, या Vast.ai पर 1.5 × $0.31 = **$0.47** का।

<figure>
<svg viewBox="0 0 720 300" role="img" aria-labelledby="d2-title" xmlns="http://www.w3.org/2000/svg" font-family="system-ui, sans-serif" font-size="15">
<title id="d2-title">किराये के RTX 4090 पर LoRA training के ख़र्च का bar chart, 10 डॉलर के बजट के मुक़ाबले</title>
<rect width="720" height="300" fill="#ffffff"/>
<line x1="230" y1="40" x2="230" y2="250" stroke="#e2e8f0" stroke-width="1"/>
<line x1="322" y1="40" x2="322" y2="250" stroke="#e2e8f0" stroke-width="1"/>
<line x1="414" y1="40" x2="414" y2="250" stroke="#e2e8f0" stroke-width="1"/>
<line x1="506" y1="40" x2="506" y2="250" stroke="#e2e8f0" stroke-width="1"/>
<line x1="598" y1="40" x2="598" y2="250" stroke="#e2e8f0" stroke-width="1"/>
<line x1="690" y1="30" x2="690" y2="250" stroke="#f97316" stroke-width="2" stroke-dasharray="6 4"/>
<text x="698" y="22" text-anchor="end" fill="#f97316" font-size="13">$10 का बजट</text>
<text x="220" y="75" text-anchor="end" fill="#1e1b4b">SDXL, Vast.ai</text>
<rect x="230" y="58" width="15.6" height="26" fill="#16a34a"/>
<text x="253" y="76" fill="#1e1b4b" font-size="13">$0.34</text>
<text x="220" y="125" text-anchor="end" fill="#1e1b4b">SDXL, RunPod</text>
<rect x="230" y="108" width="36.8" height="26" fill="#6366f1"/>
<text x="275" y="126" fill="#1e1b4b" font-size="13">$0.80</text>
<text x="220" y="175" text-anchor="end" fill="#1e1b4b">FLUX.2 klein, RunPod</text>
<rect x="230" y="158" width="51.1" height="26" fill="#6366f1"/>
<text x="289" y="176" fill="#1e1b4b" font-size="13">$1.11</text>
<text x="220" y="225" text-anchor="end" fill="#1e1b4b">5 SDXL runs, RunPod</text>
<rect x="230" y="208" width="184.5" height="26" fill="#6366f1"/>
<text x="422" y="226" fill="#1e1b4b" font-size="13">$4.01</text>
<line x1="230" y1="250" x2="690" y2="250" stroke="#64748b" stroke-width="1"/>
<text x="230" y="270" text-anchor="middle" fill="#64748b" font-size="13">$0</text>
<text x="322" y="270" text-anchor="middle" fill="#64748b" font-size="13">$2</text>
<text x="414" y="270" text-anchor="middle" fill="#64748b" font-size="13">$4</text>
<text x="506" y="270" text-anchor="middle" fill="#64748b" font-size="13">$6</text>
<text x="598" y="270" text-anchor="middle" fill="#64748b" font-size="13">$8</text>
<text x="690" y="270" text-anchor="middle" fill="#64748b" font-size="13">$10</text>
<text x="460" y="292" text-anchor="middle" fill="#64748b" font-size="13">RTX 4090 पर प्रति session ख़र्च, सितंबर 2026 की कीमतें</text>
</svg>
<figcaption>RunPod की list price पर पाँच अलग SDXL कोशिशें भी $10 से काफ़ी नीचे रहती हैं। $0.74 प्रति घंटा पर $10 में RTX 4090 के 13.5 घंटे मिलते हैं; $0.31 पर लगभग 32 घंटे।</figcaption>
</figure>

$10 का बजट असल में training से शायद ही बिगड़ता है। बिगाड़ता है रात भर चालू छूटा instance (12 घंटे × $0.74 = $8.88), storage का पैसा देता रुका हुआ Vast.ai instance, या billed समय पर तस्वीरों के captions लिखने में लगा एक घंटा। प्रति सेकंड बिलिंग तभी फ़ायदा देती है जब काम ख़त्म होते ही आप मशीन delete कर दें।

## GPUFlow कहाँ फ़िट होता है

इस काम में नहीं होता। GPUFlow एक language मॉडल तक पहुँच किराये पर देता है, जिसे provider अपने GPU पर (आमतौर पर Ollama से) चलाता है, एक OpenAI-compatible API key के ज़रिए। वहाँ न shell है, न SSH, न फ़ाइल access, इसलिए आप trainer इंस्टॉल नहीं कर सकते, तस्वीरें अपलोड नहीं कर सकते और LoRA डाउनलोड नहीं कर सकते। वह chat मॉडल चलाता है, image मॉडल नहीं। training Vast.ai, RunPod या ऐसे किसी प्लेटफ़ॉर्म पर करें जो आपको मशीन किराये पर दे।

अगर आप तस्वीरों की जगह टेक्स्ट पर काम कर रहे हैं, तो किराये पर लो, train करो, delete करो वाला यही तरीका language मॉडल पर भी लागू होता है: [किराये के GPU पर LLM की निजी fine-tuning](/hi/private-llm-fine-tuning-guide/) देखें।

## स्रोत

सभी की जाँच सितंबर 2026 में की गई।

- LoRA paper: [Hu et al., LoRA: Low-Rank Adaptation of Large Language Models](https://arxiv.org/abs/2106.09685)
- sd-scripts: [README और releases](https://github.com/kohya-ss/sd-scripts), [SDXL LoRA training](https://github.com/kohya-ss/sd-scripts/blob/main/docs/sdxl_train_network.md), [SDXL notes और VRAM](https://github.com/kohya-ss/sd-scripts/blob/main/docs/train_SDXL-en.md), [dataset config](https://github.com/kohya-ss/sd-scripts/blob/main/docs/config_README-en.md), [FLUX.1 LoRA training](https://github.com/kohya-ss/sd-scripts/blob/main/docs/flux_train_network.md), [WD14 tagger](https://github.com/kohya-ss/sd-scripts/blob/main/docs/wd14_tagger_README-en.md)
- [bmaltais/kohya_ss](https://github.com/bmaltais/kohya_ss), [Nerogar/OneTrainer](https://github.com/Nerogar/OneTrainer), [ostris/ai-toolkit](https://github.com/ostris/ai-toolkit), [JoyCaption](https://github.com/fpgaminer/joycaption)
- SDXL पर 4090 की speed: [kohya_ss issue #1288](https://github.com/bmaltais/kohya_ss/issues/1288)
- Black Forest Labs: [FLUX.2 [klein] को 60 मिनट से कम में LoRA से fine-tune करें](https://huggingface.co/blog/black-forest-labs/flux-2-klein-lora), model cards: [FLUX.1 [dev]](https://huggingface.co/black-forest-labs/FLUX.1-dev), [FLUX.2 [klein] 4B](https://huggingface.co/black-forest-labs/FLUX.2-klein-base-4B), [FLUX.2 [klein] 9B](https://huggingface.co/black-forest-labs/FLUX.2-klein-base-9B)
- [Stable Diffusion XL base 1.0 model card](https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0)
- कीमतें: [RunPod pricing](https://www.runpod.io/pricing), [RunPod pod pricing और storage](https://docs.runpod.io/pods/pricing), [Vast.ai pricing](https://docs.vast.ai/guides/instances/pricing.md), getdeploying.com पर [RTX 3090](https://getdeploying.com/reference/cloud-gpu/nvidia-rtx-3090), [RTX 4090](https://getdeploying.com/reference/cloud-gpu/nvidia-rtx-4090), [RTX 5090](https://getdeploying.com/reference/cloud-gpu/nvidia-rtx-5090) और [Vast.ai](https://getdeploying.com/vast-ai)
- GPUFlow: [API quickstart](https://docs.gpuflow.app/hi/renters/api-quickstart/)
