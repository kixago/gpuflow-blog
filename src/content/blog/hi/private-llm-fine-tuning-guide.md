---
title: "किराए के GPU पर प्राइवेट LLM Fine-Tuning: पूरी गाइड"
description: "अपने डेटासेट से किराए के GPU पर open-weights लैंग्वेज मॉडल को fine-tune करने का पूरा ट्यूटोरियल। अपना डेटा सुरक्षित रखें, compute का खर्च घटाएँ और vendor lock-in से बचें।"
excerpt: "किराए के GPU पर open-weights LLM को fine-tune करना सीखें, वह भी अपने डेटा पर पूरा नियंत्रण रखते हुए। सुरक्षित डेटा ट्रांसफर, QLoRA ट्रेनिंग और मशीन की सफ़ाई तक, हर स्टेप के निर्देश।"
pubDate: 2025-02-23
updatedDate: 2026-09-29
locale: "hi"
category: "tutorials"
featured: false
draft: false
author: "GPUFlow Team"
heroImage: "../_images/secure-server-room-abstract.png"
heroImageAlt: "नीली रोशनी में AI डेटा प्रोसेस करते एक सुरक्षित सर्वर रूम का abstract चित्र"
faq:
  - question: "क्या एक RTX 4090 पर बड़े लैंग्वेज मॉडल fine-tune किए जा सकते हैं?"
    answer: "हाँ। QLoRA (Quantized Low-Rank Adaptation) की मदद से 8B पैरामीटर तक के मॉडल 24GB VRAM में आराम से आ जाते हैं। यह ट्यूटोरियल बताता है कि consumer हार्डवेयर के लिए ट्रेनिंग स्क्रिप्ट को कैसे कॉन्फ़िगर करें, जिसमें batch size, sequence length और LoRA rank के सटीक पैरामीटर दिए गए हैं।"
  - question: "क्या किराए के GPU पर मेरा डेटासेट सुरक्षित है?"
    answer: "आपका डेटासेट उतना ही सुरक्षित है, जितनी सावधानी से आप काम करते हैं। यह गाइड SCP से एन्क्रिप्टेड ट्रांसफर, S3 या Google Drive जैसे बीच के क्लाउड स्टोरेज से बचने और ट्रेनिंग के बाद रिमोट मशीन को साफ़ करने के तरीके बताती है। याद रखें कि मशीन किसी और की है, इसलिए रेंटल खत्म करने से पहले सब कुछ डिलीट कर दें।"
  - question: "किराए के GPU पर 8B मॉडल को fine-tune करने में कितना खर्च आता है?"
    answer: "किराए के RTX 4090 पर 8B पैरामीटर वाले मॉडल का एक सामान्य fine-tuning रन, डेटासेट के साइज़ और ट्रेनिंग epochs के हिसाब से, तीन से आठ डॉलर के बीच पड़ता है।"
  - question: "क्या ट्रेनिंग के लिए GPU किराए पर लेने के लिए पहचान सत्यापित करनी पड़ती है?"
    answer: "आमतौर पर नहीं। Vast.ai और RunPod जैसे मार्केटप्लेस ईमेल पता और prepaid क्रेडिट माँगते हैं, पहचान के दस्तावेज़ नहीं। RunPod सिर्फ़ पहले crypto पेमेंट से पहले KYC माँगता है। AWS पर नए अकाउंट का GPU quota शून्य से शुरू होता है, जिसके लिए आपको अनुरोध करना पड़ता है।"
  - question: "ट्रेनिंग स्क्रिप्ट किस फ़ॉर्मेट में डेटासेट चाहती है?"
    answer: "स्क्रिप्ट एक JSONL फ़ाइल चाहती है, जिसकी हर लाइन में text फ़ील्ड वाला एक JSON ऑब्जेक्ट हो। text फ़ील्ड में आपका instruction, input और response newline characters के साथ एक ही string के रूप में होना चाहिए। सही फ़ॉर्मेटिंग का उदाहरण इस गाइड के स्टेप 4 में दिया गया है।"
  - question: "क्या यह ट्यूटोरियल Llama के अलावा दूसरे मॉडलों पर भी काम करता है?"
    answer: "हाँ। यह workflow Mistral, Qwen, Falcon समेत किसी भी open-weights मॉडल पर लागू होता है। कोड उदाहरण में Llama-3.1-8B इस्तेमाल हुआ है, लेकिन दूसरे base मॉडल को fine-tune करने के लिए आपको सिर्फ़ मॉडल identifier बदलना होगा।"
  - question: "8B पैरामीटर वाले मॉडल को fine-tune करने में कितना समय लगता है?"
    answer: "ट्रेनिंग का समय डेटासेट के साइज़ पर निर्भर करता है। RTX 4090 पर 1,000 उदाहरणों वाला एक सामान्य रन 30 से 60 मिनट में पूरा हो जाता है। बड़े डेटासेट में समय लगभग उसी अनुपात में बढ़ता है। 10,000 उदाहरणों वाले डेटासेट को 5 से 10 घंटे का compute चाहिए।"
  - question: "ट्रेनिंग पूरी होने के बाद रिमोट मशीन का क्या करें?"
    answer: "आपको मशीन साफ़ करनी होगी: अपना डेटासेट, ट्रेनिंग कोड, Hugging Face cache और bash history डिलीट करें। यह गाइड सुरक्षित डिलीशन के लिए सटीक कमांड देती है, जिनमें रेंटल खत्म करने से पहले फ़ाइलों को पूरी तरह मिटाने के लिए shred का वैकल्पिक इस्तेमाल भी शामिल है।"
---

अगर आप यह पढ़ रहे हैं, तो शायद आपके पास ऐसा डेटासेट है जिसे आप OpenAI पर अपलोड नहीं कर सकते, या करना नहीं चाहते।

आप अकेले नहीं हैं। कई कंपनियों और स्वतंत्र डेवलपर्स के लिए ChatGPT की सुविधा से बड़ा जोखिम डेटा लीक होने का है, और यह जोखिम उन्हें मंज़ूर नहीं। चाहे आप HIPAA के दायरे में आने वाले मेडिकल रिकॉर्ड संभाल रहे हों, सालों की इंजीनियरिंग मेहनत से बने proprietary codebase, या ऐसे संवेदनशील financial models जो बाज़ार को हिला सकते हैं, क्लाउड AI इस्तेमाल करने का मतलब अक्सर अपनी सबसे कीमती intellectual property किसी तीसरे पक्ष के भरोसे छोड़ देना होता है।

और जब वह तीसरा पक्ष कोई बड़ी टेक कंपनी हो, जिसका ग्राहकों के डेटा से भविष्य के मॉडल ट्रेन करने का इतिहास रहा हो, तो "भरोसा" एक असहज शब्द बन जाता है।

इसका हल AI को छोड़ देना नहीं है। हल है infrastructure को अपने हाथ में रखना।

अपने नियंत्रण वाले हार्डवेयर पर open-weights मॉडल को fine-tune करना अब सिर्फ़ अकादमिक शौक नहीं रहा। प्राइवेसी को गंभीरता से लेने वाले संगठनों के लिए यह एक कारोबारी ज़रूरत है। Llama, Mistral, Qwen और दर्जनों दूसरे मॉडल कमर्शियल इस्तेमाल के लिए उपलब्ध हैं, बिना API फ़ीस और बिना डेटा शेयर करने की शर्त के। असली चुनौती हमेशा compute तक पहुँच की रही है। NVIDIA H100 क्लस्टर खरीदने में करोड़ों का पूँजीगत खर्च लगता है। AWS से किराए पर लेने के लिए पहचान सत्यापन, enterprise agreements चाहिए, और घंटे के रेट इतने ऊँचे हैं कि लंबे ट्रेनिंग रन बेहद महँगे पड़ते हैं।

यह गाइड एक तीसरा रास्ता दिखाती है। आप सीखेंगे कि मार्केटप्लेस से किराए पर लिए गए GPU पर, जो अक्सर दुनिया भर के आम लोगों का हार्डवेयर होता है, एक open-weights लैंग्वेज मॉडल को कैसे fine-tune करें। हम environment setup, पब्लिक नोड पर काम करते समय सुरक्षा के नियम और पूरी ट्रेनिंग प्रक्रिया कवर करेंगे।

कोड उदाहरणों में ठोस reference के तौर पर Llama-3.1-8B इस्तेमाल किया गया है, लेकिन यही workflow किसी भी Hugging Face-compatible मॉडल पर ठीक उसी तरह काम करता है। मॉडल identifier बदलिए और आप Mistral-7B, Qwen2-7B या अपनी ज़रूरत के हिसाब से कोई भी open-weights मॉडल fine-tune कर सकते हैं।

यह सब आप बिना किसी लंबे कॉन्ट्रैक्ट के और पारंपरिक क्लाउड प्रोवाइडर्स के खर्च के एक छोटे से हिस्से में कर पाएँगे।

![रिमोट GPU सर्वर से सक्रिय SSH कनेक्शन दिखाती टर्मिनल विंडो](../_images/terminal-ssh-connection.png)

## प्राइवेट Fine-Tuning का अर्थशास्त्र

तकनीकी हिस्से में जाने से पहले, खर्च की तस्वीर साफ़ कर लेते हैं।

AWS पर मॉडल ट्रेन करने का मतलब है बड़े instances और quota के अनुरोध। p4d.24xlarge instance (8x A100 GPUs) की कीमत $32.77 प्रति घंटा है, और नए AWS अकाउंट का GPU quota शून्य से शुरू होता है।

GPU मार्केटप्लेस पर आप compute सीधे हार्डवेयर के मालिकों से किराए पर लेते हैं। इसके नतीजे बड़े हैं:

**खर्च में कमी:** मार्केटप्लेस पर एक RTX 4090 लगभग $0.30 से $0.46 प्रति घंटे में मिल जाता है (सितंबर 2026)। QLoRA के साथ 8B पैरामीटर वाले मॉडल के लिए, 24GB VRAM वाला एक 4090 डेटासेट के साइज़ के हिसाब से दो से छह घंटे में fine-tuning रन पूरा कर देता है। आपका कुल compute खर्च तीन से आठ डॉलर के बीच रहता है।

**आपका डेटा एक ही मशीन पर रहता है:** आप डेटासेट को SSH से सीधे किराए की मशीन पर कॉपी करते हैं, ट्रेन करते हैं, नतीजा डाउनलोड करते हैं और सब कुछ डिलीट कर देते हैं। न कोई storage bucket, न कोई तीसरी कॉपी।

**कोई gatekeeper नहीं:** आपको किसी क्लाउड प्रोवाइडर की enterprise sales टीम की मंज़ूरी या quota बढ़वाने की ज़रूरत नहीं। आप prepaid क्रेडिट डालते हैं और हार्डवेयर किराए पर ले लेते हैं।

तुलना के लिए: AWS पर एक A10G (g5.xlarge, 24GB VRAM वाला सबसे सस्ता विकल्प) us-east-1 में लगभग $1.01 प्रति घंटा पड़ता है। इसमें quota का अनुरोध, setup का समय और environment कॉन्फ़िगर करते समय बेकार चलता compute जोड़ दें, तो पहले रन की असली लागत मार्केटप्लेस के कुछ डॉलर से कहीं ज़्यादा हो जाती है।

यह हिसाब-किताब हमारे [GPU रेंटल कीमतों की तुलना](/hi/gpu-rental-pricing-comparison-2026/) और [GPU किराए पर लेने की असली लागत](/hi/hidden-fees-in-gpu-rental/) लेखों में विस्तार से दिया गया है।

## ज़रूरी तैयारी

यह ट्यूटोरियल मानकर चलता है कि आप Linux कमांड लाइन से परिचित हैं। आपको मशीन लर्निंग में डिग्री की ज़रूरत नहीं, लेकिन फ़ाइल सिस्टम में घूमना, टेक्स्ट फ़ाइलें एडिट करना और error messages समझना आना चाहिए।

**हार्डवेयर की ज़रूरतें:**

- **GPU:** कम से कम 24GB VRAM। RTX 3090, RTX 4090 और A10G, तीनों चलेंगे। 70B पैरामीटर वाले मॉडल के लिए 48GB या उससे ज़्यादा चाहिए (A6000, दो A100 या H100)।
- **सिस्टम RAM:** 32GB या उससे ज़्यादा। मॉडल लोड होते समय weights GPU में जाने से पहले सिस्टम मेमोरी में रखे जाते हैं।
- **स्टोरेज:** 100GB या उससे ज़्यादा NVMe SSD स्पेस। Llama-3 8B के base weights लगभग 16GB लेते हैं। डेटासेट, checkpoints और output adapter के लिए अलग से जगह चाहिए।

**मॉडल चुनने पर एक बात:** यह ट्यूटोरियल उदाहरण के तौर पर Meta का Llama-3.1-8B
इस्तेमाल करता है, क्योंकि यह उस श्रेणी का सबसे बड़ा मॉडल है जो QLoRA quantization के
साथ एक 24GB GPU पर आ जाता है। Llama परिवार में अब Llama 4 Scout और Maverick भी हैं,
लेकिन ये Mixture of Experts आर्किटेक्चर पर बने हैं, जिनमें कुल 109B और 400B पैरामीटर
हैं। इन्हें multi-GPU कॉन्फ़िगरेशन चाहिए, जो एक single-node रेंटल के दायरे से बाहर है।
यहाँ बताया गया workflow Mistral-7B, Qwen2-7B, Gemma-2-9B और किसी भी दूसरे
Hugging Face-compatible मॉडल पर उतना ही लागू होता है, बशर्ते वह आपके किराए के
हार्डवेयर की VRAM में समा जाए।

**सॉफ़्टवेयर की ज़रूरतें:**

- Python 3.10 या उसके बाद का वर्शन
- PyTorch की बुनियादी जानकारी
- एक Hugging Face अकाउंट (Llama जैसे gated मॉडल डाउनलोड करने के लिए ज़रूरी, जिनके लिए लाइसेंस स्वीकार करना पड़ता है)
- किसी ऐसे GPU मार्केटप्लेस पर prepaid क्रेडिट वाला अकाउंट जो SSH access के साथ पूरी मशीन किराए पर देता हो, जैसे Vast.ai, RunPod या TensorDock

तय नहीं कर पा रहे कि कौन सा चुनें? पढ़ें [GPU किराए पर लेने के लिए क्या चाहिए](/hi/what-you-need-to-rent-a-gpu/) और [GPUFlow vs Vast.ai vs RunPod vs SaladCloud](/hi/gpuflow-vs-vast-ai-vs-runpod/)। ध्यान दें कि GPUFlow खुद इस ट्यूटोरियल के लिए सही नहीं है: यह API के ज़रिए AI मॉडल्स का access किराए पर देता है, ऐसी मशीन नहीं जिसमें आप लॉग इन कर सकें।

## स्टेप 1: अपना Compute नोड सुरक्षित करना

पहला कदम है हार्डवेयर हासिल करना। बड़े क्लाउड प्लेटफ़ॉर्म पर इसके लिए अकाउंट बनाना, GPU quota का अनुरोध करना और मंज़ूरी का इंतज़ार करना पड़ता है। मार्केटप्लेस पर यह प्रक्रिया कहीं ज़्यादा सीधी है।

अपनी पसंद का मार्केटप्लेस खोलें और कुछ क्रेडिट डालें। इंटरफ़ेस में उपलब्ध मशीनें उनकी specifications, घंटे के रेट और reliability score के साथ दिखती हैं।

इन खूबियों वाली मशीनें फ़िल्टर करें:

- **GPU:** RTX 4090 (24GB VRAM) या RTX 6000 Ada (48GB VRAM)
- **RAM:** कम से कम 32GB
- **स्टोरेज:** 100GB+ उपलब्ध
- **Reliability:** 95% या उससे ज़्यादा uptime score

मशीन चुनें और रेंटल शुरू करें। ऐसी image चुनें जिसमें CUDA और PyTorch पहले से इंस्टॉल हों; इससे setup का समय बचता है, और setup के समय का भी बिल बनता है।

**पब्लिक नोड पर सुरक्षा से जुड़ी बातें:**

जब आप किसी भी रिमोट नेटवर्क पर मशीन किराए पर लेते हैं, तो आप ऐसे हार्डवेयर का इस्तेमाल कर रहे होते हैं जिसका मालिक और जिस पर भौतिक नियंत्रण किसी अजनबी का है। Virtualization layer अच्छा-ख़ासा isolation देती है, फिर भी आपको सावधानी से काम करना चाहिए:

1. **रिमोट मशीन पर private keys न रखें।** दूसरे सिस्टम्स की SSH keys, क्लाउड credentials और production सेवाओं के API tokens कभी भी रेंटल नोड पर नहीं होने चाहिए।

2. **फ़ाइल सिस्टम को असुरक्षित मानकर चलें।** यह मानें कि डिस्क पर लिखी गई कोई भी चीज़ आपके डिस्कनेक्ट होने के बाद होस्ट सैद्धांतिक रूप से वापस निकाल सकता है। सुरक्षित डिलीशन के तरीके हम स्टेप 6 में देखेंगे।

3. **ट्रांसफर के दौरान संवेदनशील डेटा एन्क्रिप्ट करें।** इस पर हम स्टेप 3 में बात करेंगे।

4. **पासवर्ड दोबारा इस्तेमाल न करें।** अगर रेंटल इंटरफ़ेस default credentials देता है, तो उन्हें तुरंत बदलें या नई SSH key pair बनाएँ।

रेंटल कन्फ़र्म होने के बाद dashboard पर कनेक्शन की जानकारी मिलती है। आपको कुछ इस तरह की SSH कमांड मिलेगी:

```bash
ssh -p 22345 user@203.0.113.42
```

अपना लोकल टर्मिनल खोलें और यह कमांड चलाएँ। पूछे जाने पर host key fingerprint स्वीकार करें। अब आप अपने किराए के GPU नोड से जुड़ चुके हैं।

जाँच लें कि हार्डवेयर आपके ऑर्डर से मेल खाता है:

```bash
nvidia-smi
```

Output में आपका किराए का GPU, उसकी मेमोरी क्षमता और इंस्टॉल ड्राइवर का वर्शन दिखना चाहिए। अगर GPU नहीं दिखता या specifications ऑर्डर से अलग हैं, तो तुरंत डिस्कनेक्ट करें और मार्केटप्लेस के support को इसकी जानकारी दें।

## स्टेप 2: Environment कॉन्फ़िगर करना

SSH कनेक्शन की पुष्टि हो जाने के बाद, अगला काम है एक साफ़ Python environment बनाना। ज़्यादातर रेंटल नोड्स पर NVIDIA ड्राइवर और CUDA toolkit पहले से इंस्टॉल होते हैं, लेकिन होस्ट के सिस्टम-लेवल Python packages पर निर्भर रहने से dependency conflicts होते हैं, जिन्हें debug करने में घंटों लग जाते हैं।

Reproducibility और स्थिरता के लिए हम एक अलग virtual environment बनाएँगे।

अपना workspace बनाने के लिए ये कमांड चलाएँ:

```bash
mkdir ~/llama3-finetune
cd ~/llama3-finetune
python3 -m venv venv
source venv/bin/activate
```

अब आपके टर्मिनल prompt में `(venv)` दिखना चाहिए, यानी virtual environment सक्रिय है। आगे के सभी package इसी डायरेक्टरी में इंस्टॉल होंगे और होस्ट सिस्टम पर कोई असर नहीं पड़ेगा।

Python packages इंस्टॉल करने से पहले जाँच लें कि CUDA toolkit उपलब्ध है:

```bash
nvcc --version
```

CUDA का वर्शन नंबर नोट कर लें। PyTorch के साथ compatibility पक्की करने के लिए इसकी ज़रूरत पड़ेगी। ज़्यादातर रेंटल नोड्स CUDA 11.8 या 12.1 चलाते हैं। अगर `nvcc` नहीं मिलता, तो हो सकता है CUDA toolkit आपके PATH में न हो। आमतौर पर सही environment फ़ाइल को source करने से यह ठीक हो जाता है:

```bash
source /etc/profile.d/cuda.sh
```

अगर यह फ़ाइल मौजूद नहीं है, तो अपने नोड के कॉन्फ़िगरेशन के लिए मार्केटप्लेस का documentation देखें।

अब PyTorch ecosystem इंस्टॉल करें। नीचे दी गई कमांड CUDA 12.1 सपोर्ट के साथ PyTorch इंस्टॉल करती है। अगर आपके नोड पर CUDA का कोई दूसरा वर्शन है, तो उसके हिसाब से suffix बदल लें:

```bash
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121
```

इसके बाद efficient fine-tuning के लिए ज़रूरी libraries इंस्टॉल करें। हम Hugging Face ecosystem के साथ quantization के लिए bitsandbytes और parameter-efficient ट्रेनिंग के लिए PEFT इस्तेमाल कर रहे हैं:

```bash
pip install transformers==4.40.0 datasets==2.19.0 peft==0.10.0 bitsandbytes==0.43.1 trl==0.8.6 accelerate==0.29.0
```

**वर्शन पिन करना ज़रूरी है।** ऊपर दिए गए वर्शन इस लेख को लिखते समय टेस्ट किए गए हैं और एक-दूसरे के साथ काम करते हैं। Hugging Face ecosystem तेज़ी से बदलता है, और बिना पिन किए इंस्टॉलेशन में अक्सर breaking changes आ जाते हैं। अगर आपको import errors या अजीब व्यवहार दिखे, तो सबसे संभावित कारण वर्शन का मेल न खाना है।

आख़िर में Hugging Face के साथ authenticate करें। Llama-3 के weights एक लाइसेंस agreement के पीछे gated हैं, जिसके लिए Hugging Face अकाउंट चाहिए। [Meta Llama-3 repository](https://huggingface.co) पर जाएँ और लाइसेंस की शर्तें स्वीकार करें। फिर अपने Hugging Face settings पेज से एक access token बनाएँ।

Authentication कमांड चलाएँ:

```bash
huggingface-cli login
```

पूछे जाने पर अपना access token पेस्ट करें। Token `~/.cache/huggingface/token` में सेव होता है। अब आप gated मॉडल के weights सीधे रेंटल नोड पर डाउनलोड कर सकते हैं।

![टर्मिनल में Llama-3 मॉडल के कॉन्फ़िगरेशन पैरामीटर दिखाता Python कोड](../_images/python-llama3-config.png)

## स्टेप 3: सुरक्षित डेटा ट्रांसफर

यह हिस्सा उस मुख्य वजह से जुड़ा है जिसके लिए आप API कॉल करने के बजाय मशीन किराए पर ले रहे हैं: डेटा पर आपका अपना अधिकार।

क्लाउड के आम workflow में आप अपना डेटासेट किसी storage bucket (S3, Google Cloud Storage, Azure Blob) पर अपलोड करते हैं और फिर उसे compute instance पर डाउनलोड करते हैं। इससे आपके संवेदनशील डेटा की कई कॉपियाँ ऐसे सिस्टम्स पर बन जाती हैं जिन पर आपका नियंत्रण नहीं है। Storage प्रोवाइडर के पास access होता है। Compute प्रोवाइडर के पास access होता है। दोनों आपकी गतिविधि के logs रखते हैं।

हम सीधे एन्क्रिप्टेड ट्रांसफर से इस पूरी प्रक्रिया को दरकिनार करेंगे।

SSH प्रोटोकॉल में `scp` (Secure Copy Protocol) शामिल है, जो फ़ाइलों को उसी एन्क्रिप्टेड चैनल से भेजता है जिससे आप टर्मिनल access करते हैं। आपका डेटा किसी बीच के स्टोरेज को छुए बिना सीधे आपकी लोकल मशीन से रेंटल नोड पर पहुँचता है।

अपने **लोकल कंप्यूटर** पर एक **नई टर्मिनल विंडो** खोलें। रेंटल नोड वाला मौजूदा SSH session बंद न करें। अपनी फ़ाइल का असली path और कनेक्शन की जानकारी डालकर यह कमांड चलाएँ:

```bash
scp -P 22345 /path/to/your/dataset.jsonl user@203.0.113.42:~/llama3-finetune/
```

`-P` फ़्लैग port नंबर बताता है (ध्यान दें कि यह capital P है, जबकि ssh में lowercase `-p` होता है)। बड़े डेटासेट के ट्रांसफर में कई मिनट लग सकते हैं। आपको progress दिखेगी कि कितने bytes ट्रांसफर हो चुके हैं।

**1GB से बड़े डेटासेट के लिए** ट्रांसफर से पहले compress करने पर विचार करें:

```bash
# On your local machine
gzip -k dataset.jsonl
scp -P 22345 dataset.jsonl.gz user@203.0.113.42:~/llama3-finetune/

# Then on the remote node
cd ~/llama3-finetune
gunzip dataset.jsonl.gz
```

**सुरक्षा के अतिरिक्त उपाय:**

अगर आपके खतरे के आकलन में sophisticated हमलावर भी शामिल हैं, तो ट्रांसफर से पहले GPG या age से डेटासेट को एन्क्रिप्ट कर सकते हैं। इससे सुरक्षा की एक और परत जुड़ती है: अगर किसी तरह ट्रांसफर बीच में पकड़ भी लिया जाए, तो भी सामग्री पढ़ी नहीं जा सकेगी।

```bash
# On your local machine (using age encryption)
age -p dataset.jsonl > dataset.jsonl.age
scp -P 22345 dataset.jsonl.age user@203.0.113.42:~/llama3-finetune/

# On the remote node
age -d dataset.jsonl.age > dataset.jsonl
rm dataset.jsonl.age
```

ज़्यादातर यूज़र्स के लिए सामान्य SCP ट्रांसफर काफ़ी सुरक्षा देता है। SSH प्रोटोकॉल AES-256 एन्क्रिप्शन इस्तेमाल करता है। Host key verification से man-in-the-middle हमले रुकते हैं। आपका डेटा किसी third-party स्टोरेज सिस्टम से होकर नहीं गुज़रता।

## स्टेप 4: Fine-Tuning स्क्रिप्ट

Supervised fine-tuning के लिए हम TRL (Transformer Reinforcement Learning) library की `SFTTrainer` class इस्तेमाल करेंगे। यह library काफ़ी जटिलता छिपा देती है, फिर भी production workloads के लिए कॉन्फ़िगर करने लायक बनी रहती है।

ट्रेनिंग स्क्रिप्ट लिखने से पहले समझ लें कि डेटासेट किस फ़ॉर्मेट में होना चाहिए।

**डेटासेट फ़ॉर्मेट की ज़रूरतें:**

स्क्रिप्ट एक JSONL फ़ाइल (JSON Lines) चाहती है, जिसकी हर लाइन में `text` फ़ील्ड वाला एक वैध JSON ऑब्जेक्ट हो। `text` फ़ील्ड में आपका पूरा ट्रेनिंग उदाहरण एक ही string के रूप में होना चाहिए।

सही फ़ॉर्मेट वाली तीन लाइनों का उदाहरण:

```json
{"text": "### Instruction: Summarize the following legal clause in plain English.\n\n### Input: Party A shall indemnify, defend, and hold harmless Party B from any claims, damages, or expenses arising from Party A's negligence or willful misconduct.\n\n### Response: Party A agrees to protect Party B from any legal claims or costs that result from Party A's mistakes or intentional wrongdoing."}
{"text": "### Instruction: Extract the key financial metrics from this earnings report.\n\n### Input: Q3 revenue reached $4.2B, up 12% YoY. Operating margin improved to 23.5% from 21.2%. Free cash flow was $890M.\n\n### Response: Revenue: $4.2 billion (12% year-over-year growth). Operating margin: 23.5% (up from 21.2%). Free cash flow: $890 million."}
{"text": "### Instruction: Identify potential HIPAA violations in this process description.\n\n### Input: Patient records are emailed to the billing department as PDF attachments. The billing staff prints these for manual review and shreds them after processing.\n\n### Response: Potential violations include: unencrypted email transmission of PHI, physical documents that may be visible to unauthorized personnel during processing, and lack of documented chain of custody. Recommend encrypted file transfer and on-screen review only."}
```

**फ़ॉर्मेटिंग से जुड़ी ज़रूरी बातें:**

1. हर JSON ऑब्जेक्ट ठीक एक लाइन में होना चाहिए। Multi-line JSON नहीं चलेगा।
2. `text` फ़ील्ड के अंदर newlines को `\n` के रूप में escape करना होगा।
3. टेक्स्ट के अंदर के quotation marks को `\"` के रूप में escape करना होगा।
4. फ़ाइल UTF-8 encoding में होनी चाहिए।

अगर आपका मूल डेटा किसी और फ़ॉर्मेट में है (CSV, Parquet, या instruction/response के अलग-अलग कॉलम), तो ट्रांसफर से पहले उसे इस ढाँचे में बदलना होगा। Python की `json` library escaping अपने आप कर देती है:

```python
import json

with open('dataset.jsonl', 'w') as f:
    for example in your_data:
        text = f"### Instruction: {example['instruction']}\n\n### Input: {example['input']}\n\n### Response: {example['output']}"
        f.write(json.dumps({"text": text}) + '\n')
```

डेटासेट तैयार होने के बाद, रिमोट नोड पर ट्रेनिंग स्क्रिप्ट बनाएँ:

```bash
cd ~/llama3-finetune
nano train.py
```

नीचे दिया गया कॉन्फ़िगरेशन पेस्ट करें। यह स्क्रिप्ट QLoRA से 8B पैरामीटर वाले मॉडल को 24GB GPU की मेमोरी सीमा के अंदर fine-tune करती है। उदाहरण में Llama-3.1-8B है, लेकिन MODEL_NAME वेरिएबल बदलकर आप कोई भी compatible मॉडल इस्तेमाल कर सकते हैं:

```python
import torch
from datasets import load_dataset
from transformers import (
    AutoModelForCausalLM,
    AutoTokenizer,
    BitsAndBytesConfig,
    TrainingArguments,
)
from peft import LoraConfig
from trl import SFTTrainer

# ============================================
# CONFIGURATION - Modify these values as needed
# ============================================

# Base model identifier on Hugging Face
# Change this to fine-tune a different model (e.g., "mistralai/Mistral-7B-v0.1")
MODEL_NAME = "meta-llama/Llama-3.1-8B"

# Name for your fine-tuned adapter
OUTPUT_NAME = "llama-3-8b-custom"

# Path to your dataset
DATASET_PATH = "dataset.jsonl"

# Training hyperparameters
NUM_EPOCHS = 1
BATCH_SIZE = 4
LEARNING_RATE = 2e-4
MAX_SEQ_LENGTH = 512

# LoRA hyperparameters
LORA_RANK = 16
LORA_ALPHA = 16
LORA_DROPOUT = 0.05

# ============================================
# QUANTIZATION CONFIGURATION
# ============================================

bnb_config = BitsAndBytesConfig(
    load_in_4bit=True,
    bnb_4bit_quant_type="nf4",
    bnb_4bit_compute_dtype=torch.float16,
    bnb_4bit_use_double_quant=True,
)

# ============================================
# MODEL LOADING
# ============================================

print("Loading base model...")
model = AutoModelForCausalLM.from_pretrained(
    MODEL_NAME,
    quantization_config=bnb_config,
    device_map="auto",
    trust_remote_code=True,
)
model.config.use_cache = False

print("Loading tokenizer...")
tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME, trust_remote_code=True)
tokenizer.pad_token = tokenizer.eos_token
tokenizer.padding_side = "right"

# ============================================
# DATASET LOADING
# ============================================

print(f"Loading dataset from {DATASET_PATH}...")
dataset = load_dataset("json", data_files=DATASET_PATH, split="train")
print(f"Dataset contains {len(dataset)} examples")

# ============================================
# LORA CONFIGURATION
# ============================================

peft_config = LoraConfig(
    r=LORA_RANK,
    lora_alpha=LORA_ALPHA,
    lora_dropout=LORA_DROPOUT,
    bias="none",
    task_type="CAUSAL_LM",
    target_modules=["q_proj", "k_proj", "v_proj", "o_proj"],
)

# ============================================
# TRAINING ARGUMENTS
# ============================================

training_args = TrainingArguments(
    output_dir="./results",
    num_train_epochs=NUM_EPOCHS,
    per_device_train_batch_size=BATCH_SIZE,
    gradient_accumulation_steps=1,
    learning_rate=LEARNING_RATE,
    weight_decay=0.001,
    fp16=True,
    logging_steps=10,
    save_steps=100,
    save_total_limit=3,
    optim="paged_adamw_32bit",
    lr_scheduler_type="cosine",
    warmup_ratio=0.03,
    report_to="none",
)

# ============================================
# TRAINER INITIALIZATION AND EXECUTION
# ============================================

print("Initializing trainer...")
trainer = SFTTrainer(
    model=model,
    train_dataset=dataset,
    peft_config=peft_config,
    dataset_text_field="text",
    max_seq_length=MAX_SEQ_LENGTH,
    tokenizer=tokenizer,
    args=training_args,
)

print("Starting training...")
trainer.train()

print(f"Saving adapter to {OUTPUT_NAME}...")
trainer.model.save_pretrained(OUTPUT_NAME)
tokenizer.save_pretrained(OUTPUT_NAME)

print("Training complete.")
```

`Ctrl+O` से फ़ाइल सेव करें, फिर `Ctrl+X` से बाहर निकलें।

**मुख्य पैरामीटर समझें:**

- **LORA_RANK (r=16):** Fine-tuned adapter कितना कुछ सीख सकता है, यह इससे तय होता है। ज़्यादा मान से मॉडल ज़्यादा सीखता है, लेकिन मेमोरी भी ज़्यादा लगती है। आमतौर पर 8 से 64 के बीच के मान रखे जाते हैं।

- **LORA_ALPHA (16):** LoRA weights का scaling factor। एक आम नियम है कि इसे rank के बराबर रखा जाए।

- **MAX_SEQ_LENGTH (512):** ट्रेनिंग उदाहरणों की अधिकतम token लंबाई। लंबे sequences को ज़्यादा मेमोरी चाहिए। OOM errors आएँ, तो सबसे पहले यही मान घटाएँ।

- **BATCH_SIZE (4):** एक साथ प्रोसेस होने वाले उदाहरणों की संख्या। मेमोरी कम पड़े, तो इसे 2 या 1 कर दें।

- **target_modules:** वे layers जिनमें LoRA adapters जोड़े जाते हैं। Llama-3 के लिए attention projection layers (q, k, v, o) सबसे अच्छे नतीजे देती हैं।

ट्रेनिंग शुरू करने के लिए चलाएँ:

```bash
python train.py
```

स्क्रिप्ट पहले base मॉडल के weights डाउनलोड करेगी (8B मॉडल के लिए लगभग 16GB)। यह सिर्फ़ एक बार होता है; अगली बार cache किए गए weights इस्तेमाल होते हैं। लोडिंग पूरी होने के बाद आपको ट्रेनिंग की progress दिखेगी, जिसमें हर 10 steps पर loss का मान प्रिंट होगा।

## स्टेप 5: ट्रेनिंग रन पर नज़र रखना

ट्रेनिंग स्क्रिप्ट चलते समय आपको GPU की हालत पर नज़र रखनी चाहिए। अगर VRAM भर जाए या तापमान सुरक्षित सीमा से ऊपर चला जाए, तो प्रोसेस crash हो जाएगा। इससे आपका checkpoint खराब हो सकता है और रेंटल का समय बेकार जाएगा।

अपनी लोकल मशीन पर दूसरी टर्मिनल विंडो खोलें और रेंटल नोड से एक और SSH कनेक्शन बनाएँ:

```bash
ssh -p 22345 user@203.0.113.42
```

GPU के real-time आँकड़े देखने के लिए यह कमांड चलाएँ:

```bash
watch -n 1 nvidia-smi
```

![GPU मेमोरी उपयोग और तापमान के आँकड़ों के साथ nvidia-smi का output दिखाता टर्मिनल](../_images/nvidia-smi-monitoring.png)

यह हर सेकंड रिफ़्रेश होकर मेमोरी का उपयोग, GPU utilization का प्रतिशत और तापमान दिखाता है। इस गाइड के कॉन्फ़िगरेशन के साथ RTX 4090 पर आपको ये मान दिखने चाहिए:

- **मेमोरी उपयोग:** उपलब्ध 24GB में से 18GB से 22GB
- **GPU utilization:** सक्रिय ट्रेनिंग steps के दौरान 90% से 100%
- **तापमान:** होस्ट के cooling सिस्टम के हिसाब से 60°C से 80°C

**आम समस्याओं का समाधान:**

**मेमोरी 24GB के करीब:** अगर मेमोरी लगातार सीमा को छू रही है, तो ट्रेनिंग स्क्रिप्ट में `BATCH_SIZE` को 2 या 1 कर दें। या फिर `MAX_SEQ_LENGTH` को 256 कर दें। दोनों में से कोई भी बदलाव करने पर ट्रेनिंग रन दोबारा शुरू करना होगा।

**GPU utilization लगभग 0%:** यह आमतौर पर डेटा लोडिंग में bottleneck का संकेत है। CPU इतनी तेज़ी से GPU को उदाहरण नहीं दे पा रहा। NVMe वाले नोड्स पर ऐसा कम होता है, लेकिन बहुत बड़े डेटासेट के साथ हो सकता है। ट्रांसफर से पहले डेटासेट को किसी ज़्यादा efficient फ़ॉर्मेट (Arrow/Parquet) में बदलने पर विचार करें।

**तापमान 85°C से ऊपर:** कुछ होस्ट GPUs को कम हवादार cabinets में चलाते हैं। लगातार ऊँचे तापमान से thermal throttling हो सकती है, जिससे ट्रेनिंग धीमी पड़ जाती है। अगर तापमान बार-बार 85°C से ऊपर जाता है, तो रेंटल बंद करके कोई दूसरा नोड चुनने पर विचार करें। हार्डवेयर खराब होना होस्ट की समस्या है, लेकिन बर्बाद हुआ समय और खराब checkpoints आपका नुकसान हैं।

**Loss curve को समझना:**

आपकी ट्रेनिंग स्क्रिप्ट हर 10 steps पर loss का मान दिखाती है। यह संख्या बताती है कि मॉडल की predictions कितनी "गलत" हैं, यानी जितना कम उतना बेहतर। आपको यह दिखना चाहिए:

- **शुरुआती loss:** डेटासेट के हिसाब से आमतौर पर 1.5 से 3.0 के बीच
- **रुझान:** पहले कुछ सौ steps में लगातार गिरावट
- **आख़िरी loss:** अच्छे से कॉन्फ़िगर किए गए रन में आमतौर पर 0.5 से 1.5 के बीच

अगर loss शुरू से ही अटका रहे (100 steps के बाद भी कोई गिरावट नहीं), तो शायद learning rate बहुत कम है। अगर loss बहुत ऊपर-नीचे हो या बढ़ने लगे, तो learning rate बहुत ज़्यादा है। Default मान `2e-4` ज़्यादातर डेटासेट के लिए ठीक काम करता है, लेकिन कभी-कभी इसे बदलना पड़ सकता है।

अगर loss आराम से घटते-घटते अचानक बहुत ऊँचे मान (10+) पर उछल जाए, तो शायद आपके डेटासेट में गलत फ़ॉर्मेट वाले उदाहरण हैं। ट्रेनिंग रोकें, अपनी JSONL फ़ाइल में encoding errors या गलत तरीके से escape किए गए characters देखें, और फिर से शुरू करें।

RTX 4090 पर 1,000 उदाहरणों वाला एक सामान्य fine-tuning रन 30 से 60 मिनट में पूरा हो जाता है। बड़े डेटासेट में समय लगभग उसी अनुपात में बढ़ता है: 10,000 उदाहरणों को 5 से 10 घंटे लगते हैं।

## स्टेप 6: मॉडल वापस लाना और मशीन साफ़ करना

ट्रेनिंग पूरी होने पर आपके fine-tuned weights, `OUTPUT_NAME` में बताई गई डायरेक्टरी में LoRA adapter के रूप में मौजूद होते हैं। पूरे 16GB के base मॉडल की तुलना में यह adapter छोटा होता है, आमतौर पर 100MB से 500MB।

पहले जाँच लें कि adapter की फ़ाइलें मौजूद हैं:

```bash
ls -la ~/llama3-finetune/llama-3-8b-custom/
```

आपको `adapter_config.json`, `adapter_model.safetensors` और tokenizer की फ़ाइलें दिखनी चाहिए।

**रेंटल नोड पर adapter को merge न करें।** Merge करने से LoRA weights base मॉडल के साथ मिलकर एक स्वतंत्र fine-tuned मॉडल बन जाते हैं। इसके लिए पूरे 16-bit base मॉडल को मेमोरी में लोड करना पड़ता है, जो 24GB कार्ड की उपलब्ध VRAM से ज़्यादा हो सकता है। Merge अपने लोकल infrastructure पर करें, या inference के समय बस adapter को base मॉडल के साथ लोड करें। PEFT library यह आसानी से संभाल लेती है:

```python
from peft import PeftModel
from transformers import AutoModelForCausalLM

base_model = AutoModelForCausalLM.from_pretrained(
    "meta-llama/Llama-3.1-8B",
    device_map="auto",
)
model = PeftModel.from_pretrained(base_model, "./llama-3-8b-custom")
```

Adapter डाउनलोड करने के लिए अपने **लोकल टर्मिनल** पर लौटें (SSH session पर नहीं) और चलाएँ:

```bash
scp -r -P 22345 user@203.0.113.42:~/llama3-finetune/llama-3-8b-custom ./
```

`-r` फ़्लैग पूरी डायरेक्टरी को recursively कॉपी करता है। लोकल फ़ाइलों का साइज़ रिमोट फ़ाइलों से मिलाकर पक्का करें कि ट्रांसफर ठीक से पूरा हुआ।

**रिमोट मशीन की सफ़ाई:**

यही स्टेप पेशेवरों को शौकिया लोगों से अलग करता है। अब आपके रेंटल नोड पर आपका proprietary डेटासेट, ट्रेनिंग कोड और cache किए गए मॉडल weights मौजूद हैं। यह सब ऐसी मशीन पर छोड़ देना, जिस पर आपका नियंत्रण नहीं, बुनियादी operational security का उल्लंघन है।

रेंटल नोड वाले SSH session पर लौटें और ये कमांड चलाएँ:

```bash
# Remove your working directory and all contents
rm -rf ~/llama3-finetune

# Clear the Hugging Face cache (contains downloaded model weights)
rm -rf ~/.cache/huggingface

# Clear Python package cache
rm -rf ~/.cache/pip

# Clear bash history
history -c
cat /dev/null > ~/.bash_history

# Clear any potential swap residue (may require sudo depending on node config)
sync
```

अगर नोड पर `shred` उपलब्ध है और आप और पक्का करना चाहते हैं कि डिलीट की गई फ़ाइलें वापस न निकाली जा सकें:

```bash
# Secure deletion (slower but more thorough)
find ~/llama3-finetune -type f -exec shred -u {} \;
rm -rf ~/llama3-finetune
```

SSH session से डिस्कनेक्ट करें:

```bash
exit
```

मार्केटप्लेस के dashboard पर वापस जाएँ और रेंटल बंद करें, साथ में कोई storage volume हो तो उसे भी, ताकि उसका पैसा कटना बंद हो जाए।

## अपने Fine-Tuned मॉडल से Inference चलाना

Adapter लोकल मशीन पर डाउनलोड हो जाने के बाद, आप किसी क्लाउड पर निर्भर हुए बिना inference चला सकते हैं। यह रहा एक छोटा सा उदाहरण:

```python
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer, BitsAndBytesConfig
from peft import PeftModel

# Quantization config (same as training)
bnb_config = BitsAndBytesConfig(
    load_in_4bit=True,
    bnb_4bit_quant_type="nf4",
    bnb_4bit_compute_dtype=torch.float16,
)

# Load base model
base_model = AutoModelForCausalLM.from_pretrained(
    "meta-llama/Llama-3.1-8B",
    quantization_config=bnb_config,
    device_map="auto",
)

# Load your fine-tuned adapter
model = PeftModel.from_pretrained(base_model, "./llama-3-8b-custom")

# Load tokenizer
tokenizer = AutoTokenizer.from_pretrained("meta-llama/Llama-3.1-8B")

# Generate a response
prompt = "### Instruction: Summarize the contract clause.\n\n### Input: The Licensee shall not reverse engineer, decompile, or disassemble the Software.\n\n### Response:"

inputs = tokenizer(prompt, return_tensors="pt").to("cuda")
outputs = model.generate(**inputs, max_new_tokens=100, temperature=0.7)
response = tokenizer.decode(outputs[0], skip_special_tokens=True)

print(response)
```

Production deployment के लिए इसे FastAPI या Flask से API में लपेटने पर विचार करें, या vLLM या Text Generation Inference (TGI) जैसे inference servers से deploy करें। इनकी तुलना हमने [RTX 4090 पर Ollama vs vLLM vs TGI](/hi/ollama-vs-vllm-vs-tgi-rtx-4090-benchmark/) में की है।

## निष्कर्ष

आपने proprietary डेटा पर एक Large Language Model को fine-tune कर लिया, और उस डेटा को कम से कम समय के लिए सिर्फ़ एक मशीन पर रखा। यह सब आपने बिना किसी enterprise कॉन्ट्रैक्ट पर साइन किए और बिना किसी टेक कंपनी को अपनी intellectual property तक पहुँच दिए किया।

RTX 4090 पर $0.45 प्रति घंटे की दर से दो घंटे का ट्रेनिंग रन मानें, तो पूरी प्रक्रिया का कुल खर्च नब्बे सेंट रहा। AWS पर एक A10G लगभग $1.01 प्रति घंटा पड़ता है, इसलिए वहाँ भी रन अपने आप में महँगा नहीं है। फ़र्क quota के अनुरोध और setup का है।

इससे भी ज़रूरी बात यह है कि आपका डेटासेट कभी किसी storage सेवा से होकर नहीं गुज़रा, और काम पूरा होते ही किराए की मशीन से डिलीट कर दिया गया।

Closed-source APIs पर निर्भरता का दौर खत्म हो रहा है। जिन संगठनों को प्राइवेसी चाहिए, जो रिसर्चर अपनी स्वतंत्रता को महत्व देते हैं, और जो डेवलपर नियंत्रण चाहते हैं, उनके पास अब एक विकल्प है। किराए के GPU infrastructure, खर्च और डेटा को वापस उनके हाथ में दे देते हैं।

आपका fine-tuned मॉडल अब ऐसे हार्डवेयर पर है जिस पर आपका नियंत्रण है। इसे कैसे deploy करना है, कौन इसे access कर सकता है और यह किन कामों में आएगा, ये फ़ैसले सिर्फ़ आपके हैं।

---

## आगे क्या पढ़ें

इस गाइड में प्राइवेट LLM fine-tuning का मुख्य workflow कवर किया गया। नीचे दिए गए लेख इससे जुड़े विषयों को और गहराई से समझाते हैं:

**खर्च को समझना:**

- [GPU रेंटल कीमतों की तुलना 2026](/hi/gpu-rental-pricing-comparison-2026/) — मार्केटप्लेस और बड़े क्लाउड प्रोवाइडर्स के खर्च का विश्लेषण
- [GPU किराए पर लेने की असली लागत](/hi/hidden-fees-in-gpu-rental/) — खर्च के वे पहलू जो pricing पेज पर नहीं दिखते

**शुरुआत करना:**

- [2026 में GPU किराए पर लेने के लिए क्या चाहिए](/hi/what-you-need-to-rent-a-gpu/) — हर प्लेटफ़ॉर्म पर साइन-अप, सत्यापन और पेमेंट
- [पब्लिक GPU नोड पर अपना डेटासेट कैसे सुरक्षित रखें](/hi/how-to-secure-dataset-on-public-gpu-node/) — ट्रेनिंग से पहले, दौरान और बाद में सुरक्षा के तरीके

**विकल्पों की तुलना:**

- [RunPod vs Vast.ai तुलना](/hi/runpod-vs-vastapi-comparison/) — दो सबसे बड़े मार्केटप्लेस में क्या फ़र्क है
- [GPUFlow vs Vast.ai vs RunPod vs SaladCloud](/hi/gpuflow-vs-vast-ai-vs-runpod/) — मशीन, कंटेनर और API keys की तुलना
