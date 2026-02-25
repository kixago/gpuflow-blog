---
title: "विकेन्द्रीकृत GPUs पर निजी LLM Fine-Tuning के लिए अंतिम मार्गदर्शिका"
description: "अपने स्वयं के डेटासेट का उपयोग करते हुए विकेन्द्रीकृत GPU रेंटल के माध्यम से ओपन-वेट्स भाषा मॉडलों का fine-tuning करने के लिए एक व्यापक ट्यूटोरियल। अपने डेटा को सुरक्षित रखें, कंप्यूट लागत घटाएँ और बिना KYC या वेंडर लॉक‑इन के पूर्ण गोपनीयता बनाए रखें।"
excerpt: "जानें कि विकेन्द्रीकृत GPUs पर पूर्ण गोपनीयता के साथ ओपन-वेट्स LLMs का fine-tuning कैसे करें। सुरक्षित डेटा ट्रांसफर, QLoRA प्रशिक्षण और पर्यावरण स्वच्छता पर चरण-दर-चरण निर्देश।"
pubDate: 2025-02-23
updatedDate: 2025-02-23
locale: "hi"
category: "tutorials"
featured: true
draft: false
author: "GPUFlow Team"
heroImage: "../_images/secure-server-room-abstract.png"
heroImageAlt: "नीली रोशनी में AI डेटा प्रोसेस करता हुआ एक सुरक्षित विकेन्द्रीकृत सर्वर रूम का अमूर्त चित्रण"
faq:
  - question: "Can I fine-tune large language models on a single RTX 4090?"
    answer: "Yes. Using QLoRA (Quantized Low-Rank Adaptation), models up to 8B parameters fit comfortably within 24GB of VRAM. This tutorial demonstrates exactly how to configure the training script for consumer hardware with specific parameters for batch size, sequence length, and LoRA rank."
  - question: "Is my dataset secure on a decentralized GPU rental?"
    answer: "Your dataset is as secure as your operational practices. This guide covers encrypted transfer via SCP, avoiding cloud storage intermediaries like S3 or Google Drive, and sanitizing the remote machine after training completes. The decentralized model means no single corporation has access to your data or training logs."
  - question: "How much does it cost to fine-tune an 8B model on decentralized GPUs?"
    answer: "A typical fine-tuning run on an 8B parameter model using an RTX 4090 rental costs between three and eight dollars depending on dataset size and training epochs. This compares to approximately 150 to 300 dollars for equivalent compute on AWS or Lambda Labs including setup time and idle charges."
  - question: "Do I need to complete KYC to rent GPU compute for training?"
    answer: "No. Decentralized GPU marketplaces like GPUFlow allow you to connect a crypto wallet and begin renting immediately. There is no identity verification, no credit card required, and no enterprise contract. Payments occur through stablecoins on networks like Polygon."
  - question: "What dataset format does the training script expect?"
    answer: "The script expects a JSONL file where each line contains a JSON object with a text field. The text field should contain your instruction, input, and response formatted as a single string with newline characters. An example with proper formatting is provided in Step 4 of this guide."
  - question: "Does this tutorial work for models other than Llama?"
    answer: "Yes. The workflow applies to any open-weights model including Mistral, Qwen, Falcon, and others. The code example uses Llama-3.1-8B but you only need to change the model identifier to fine-tune a different base model."
  - question: "How long does fine-tuning an 8B parameter model take?"
    answer: "Training time depends on dataset size. A typical run with 1,000 examples completes in 30 to 60 minutes on an RTX 4090. Larger datasets scale approximately linearly. A 10,000 example dataset requires 5 to 10 hours of compute time."
  - question: "What should I do with the remote machine after training completes?"
    answer: "You must sanitize the environment by deleting your dataset, training code, Hugging Face cache, and bash history. This guide provides specific commands for secure deletion including optional use of shred for thorough file destruction before ending your rental contract."
---

यदि आप यह पढ़ रहे हैं, तो संभव है कि आपके पास ऐसा डेटासेट हो जिसे आप OpenAI पर अपलोड नहीं कर सकते — या करना नहीं चाहते।

आप अकेले नहीं हैं। कई संगठनों और स्वतंत्र डेवलपर्स के लिए, ChatGPT की सुविधा डेटा लीक के अस्वीकार्य जोखिम के सामने गौण हो जाती है। चाहे आप HIPAA के अंतर्गत आने वाले मेडिकल रिकॉर्ड संभाल रहे हों, वर्षों की इंजीनियरिंग निवेश का प्रतिनिधित्व करने वाले स्वामित्व कोडबेस, या ऐसे संवेदनशील वित्तीय मॉडल जो बाजारों को प्रभावित कर सकते हैं — क्लाउड AI का उपयोग अक्सर आपकी सबसे मूल्यवान बौद्धिक संपत्ति को किसी तीसरे पक्ष को सौंपने के बराबर होता है।

जब वह तीसरा पक्ष एक तकनीकी समूह हो जिसका ग्राहक डेटा का उपयोग भविष्य के मॉडलों को प्रशिक्षित करने का इतिहास रहा हो, तो “विश्वास” शब्द सहज नहीं लगता।

समाधान AI को त्यागना नहीं है। समाधान है — बुनियादी ढाँचे पर स्वामित्व।

अपने नियंत्रण वाली हार्डवेयर पर ओपन-वेट्स मॉडलों का fine-tuning अब कोई अकादमिक प्रयोग नहीं रहा। गोपनीयता के प्रति सजग संगठनों के लिए यह एक व्यावसायिक आवश्यकता है। Llama, Mistral, Qwen और दर्जनों अन्य मॉडल वाणिज्यिक उपयोग के लिए उपलब्ध हैं, बिना API शुल्क और बिना डेटा साझा करने की बाध्यता के। चुनौती हमेशा कंप्यूट तक पहुँच रही है। NVIDIA H100 क्लस्टर खरीदने के लिए करोड़ों की पूँजी की आवश्यकता होती है। AWS से किराए पर लेने के लिए पहचान सत्यापन, एंटरप्राइज़ समझौते और ऐसे प्रति‑घंटा शुल्क देने पड़ते हैं जो लंबे प्रशिक्षण रन को अत्यधिक महँगा बना देते हैं।

यह मार्गदर्शिका एक तीसरा रास्ता प्रस्तुत करती है। आप सीखेंगे कि विकेन्द्रीकृत GPU रेंटल का उपयोग करते हुए एक ओपन-वेट्स भाषा मॉडल का fine-tuning कैसे करें — ऐसी हार्डवेयर जो दुनिया भर के व्यक्तियों के स्वामित्व में है और peer‑to‑peer मार्केटप्लेस के माध्यम से उपलब्ध है। हम पर्यावरण सेटअप, सार्वजनिक नोड्स पर संचालन के लिए सुरक्षा प्रोटोकॉल और संपूर्ण प्रशिक्षण निष्पादन को कवर करेंगे।

कोड उदाहरण Llama‑3.1‑8B को एक व्यावहारिक संदर्भ के रूप में उपयोग करते हैं, लेकिन यह वर्कफ़्लो किसी भी Hugging Face‑संगत मॉडल पर समान रूप से लागू होता है। मॉडल पहचानकर्ता बदलें और आप Mistral‑7B, Qwen2‑7B या किसी भी उपयुक्त ओपन-वेट्स मॉडल का fine‑tuning कर सकते हैं।

यह सब बिना KYC सत्यापन, बिना दीर्घकालिक अनुबंध और पारंपरिक क्लाउड प्रदाताओं की तुलना में बहुत कम लागत पर संभव है।

![रिमोट GPU सर्वर से सक्रिय SSH कनेक्शन दिखाती हुई टर्मिनल विंडो](../_images/terminal-ssh-connection.png)

## निजी Fine-Tuning की अर्थव्यवस्था

तकनीकी कार्यान्वयन से पहले, वित्तीय परिप्रेक्ष्य समझना आवश्यक है।

AWS पर मॉडल प्रशिक्षण करने का अर्थ है इंस्टेंस की उपलब्धता की समस्या से जूझना। p4d.24xlarge इंस्टेंस (8x A100 GPUs) की कीमत 32.77 डॉलर प्रति घंटा है — वह भी तब जब उपलब्ध हो। Lambda Labs बेहतर मूल्य प्रदान करता है, लेकिन अक्सर हफ्तों की प्रतीक्षा सूची बनाए रखता है। दोनों प्लेटफ़ॉर्म क्रेडिट कार्ड, पहचान सत्यापन और विस्तृत बिलिंग रिकॉर्ड की मांग करते हैं जो आपकी AI गतिविधियों को आपकी कानूनी पहचान से जोड़ते हैं।

एक विकेन्द्रीकृत मार्केटप्लेस में, आप हार्डवेयर मालिकों से सीधे कंप्यूट पावर किराए पर लेते हैं। यह ब्लॉकचेन-आधारित भुगतान रेल पर संचालित peer‑to‑peer इन्फ्रास्ट्रक्चर है। इसके प्रभाव स्पष्ट हैं:

**लागत में कमी:** अधिकांश विकेन्द्रीकृत प्लेटफार्मों पर RTX 4090 की किराया दर 0.40 से 0.60 डॉलर प्रति घंटा के बीच होती है। QLoRA का उपयोग करते हुए 8B पैरामीटर मॉडल के लिए 24GB VRAM वाला एकल 4090 दो से छह घंटे में fine‑tuning रन पूरा कर सकता है। कुल कंप्यूट लागत तीन से आठ डॉलर के बीच रहती है।

**आर्किटेक्चर द्वारा गोपनीयता:** भुगतान [stablecoin ट्रांज़ैक्शन](/hi/stable-coins-are-the-smartest-way-to-pay-for-gpu-rental) के माध्यम से Polygon जैसे नेटवर्क पर होता है। कोई क्रेडिट कार्ड आपकी पहचान को किराये से नहीं जोड़ता। मार्केटप्लेस का स्मार्ट कॉन्ट्रैक्ट एस्क्रो संभालता है, जैसा कि हमारे [smart contract escrow दस्तावेज़](/hi/smart-contract-escrow) में विस्तार से बताया गया है, जिससे दोनों पक्ष सुरक्षित रहते हैं।

**कोई मध्यस्थ नहीं:** आपको किसी एंटरप्राइज़ सेल्स टीम की स्वीकृति की आवश्यकता नहीं है। आप ऐसे उपयोग नीति पर हस्ताक्षर नहीं करते जो प्रदाता को आपके वर्कलोड की जाँच का अधिकार दे। आप अपना वॉलेट कनेक्ट करते हैं और हार्डवेयर किराए पर लेते हैं।

तुलना के लिए: AWS पर एकल A10G इंस्टेंस (पर्याप्त VRAM वाला सबसे सस्ता विकल्प) लगभग 1.50 डॉलर प्रति घंटा पड़ता है। सेटअप समय, निष्क्रिय कंप्यूट और अनाम भुगतान की असमर्थता को शामिल करने पर वास्तविक लागत 150–300 डॉलर तक पहुँच सकती है, जबकि विकेन्द्रीकृत इन्फ्रास्ट्रक्चर पर यही कार्य दस डॉलर से कम में संभव है।

विस्तृत तुलना हमारे [GPU रेंटल प्राइसिंग तुलना 2026](/hi/gpu-rental-pricing-comparison-2026) में उपलब्ध है।

## पूर्वापेक्षाएँ

यह ट्यूटोरियल लिनक्स कमांड लाइन की परिचितता मानता है। मशीन लर्निंग में स्नातकोत्तर डिग्री आवश्यक नहीं है, लेकिन आपको फ़ाइल सिस्टम नेविगेट करना, टेक्स्ट फ़ाइल संपादित करना और त्रुटि संदेश समझना आना चाहिए।

**हार्डवेयर आवश्यकताएँ:**

- **GPU:** न्यूनतम 24GB VRAM। RTX 3090, RTX 4090 और A10G उपयुक्त हैं। 70B पैरामीटर मॉडल के लिए 48GB या अधिक (A6000, डुअल A100 या H100) आवश्यक है।
- **सिस्टम RAM:** 32GB या अधिक। मॉडल लोडिंग प्रक्रिया पहले वेट्स को सिस्टम मेमोरी में स्टेज करती है।
- **स्टोरेज:** 100GB या अधिक NVMe SSD। Llama‑3 8B के बेस वेट्स लगभग 16GB लेते हैं। आपका डेटासेट, चेकपॉइंट और आउटपुट एडाप्टर अतिरिक्त स्थान लेंगे।

**मॉडल चयन पर टिप्पणी:** यह ट्यूटोरियल Meta Llama‑3.1‑8B का उपयोग करता है क्योंकि यह 24GB GPU पर QLoRA के साथ फिट होने वाली सबसे बड़ी मॉडल श्रेणी का प्रतिनिधित्व करता है। Llama परिवार में Llama 4 Scout और Maverick भी शामिल हैं, लेकिन वे 109B और 400B पैरामीटर वाली Mixture of Experts आर्किटेक्चर का उपयोग करते हैं, जिसके लिए multi‑GPU कॉन्फ़िगरेशन की आवश्यकता होती है जो एकल नोड रेंटल के दायरे से बाहर है। यहाँ वर्णित वर्कफ़्लो Mistral‑7B, Qwen2‑7B, Gemma‑2‑9B और अन्य Hugging Face‑संगत मॉडलों पर समान रूप से लागू होता है, बशर्ते वे आपके किराए के हार्डवेयर की VRAM सीमा में फिट हों।

**सॉफ्टवेयर पूर्वापेक्षाएँ:**

- Python 3.10 या उससे नया
- PyTorch का मूलभूत ज्ञान
- एक Hugging Face खाता (Llama जैसे लाइसेंस-गेटेड मॉडल डाउनलोड करने के लिए आवश्यक)
- एक क्रिप्टो वॉलेट (MetaMask या समकक्ष) जिसमें Polygon नेटवर्क पर USDC या MATIC उपलब्ध हो

यदि आपने अभी तक विकेन्द्रीकृत GPU रेंटल के लिए वॉलेट कॉन्फ़िगर नहीं किया है, तो आगे बढ़ने से पहले हमारा [MetaMask और Polygon सेटअप गाइड](/hi/setting-up-metamask-polygon-gpu-rental) पूरा करें। यह प्रक्रिया लगभग पंद्रह मिनट लेती है।

## चरण 1: अपने Compute Node को सुरक्षित करना

पहला चरण है हार्डवेयर प्राप्त करना। केंद्रीकृत क्लाउड प्लेटफ़ॉर्म पर इसका अर्थ है खाता बनाना, पहचान दस्तावेज़ अपलोड करना, अनुमोदन की प्रतीक्षा करना और भुगतान विधि जोड़ना। यहाँ प्रक्रिया अधिक सीधी है।

GPUFlow मार्केटप्लेस पर जाएँ। ऊपरी दाएँ कोने में दिए गए बटन से अपना वॉलेट कनेक्ट करें। इंटरफ़ेस उपलब्ध मशीनों को उनके विनिर्देश, प्रति‑घंटा दर और विश्वसनीयता स्कोर के साथ प्रदर्शित करता है।

निम्नलिखित विशेषताओं के अनुसार फ़िल्टर करें:

- **GPU:** RTX 4090 (24GB VRAM) या RTX 6000 Ada (48GB VRAM)
- **RAM:** न्यूनतम 32GB
- **स्टोरेज:** 100GB या अधिक उपलब्ध
- **विश्वसनीयता:** 95% या अधिक अपटाइम स्कोर

एक नोड चुनें और रेंटल प्रारंभ करें। स्मार्ट कॉन्ट्रैक्ट आपके अनुमानित उपयोग को कवर करने के लिए डिपॉज़िट की मांग करेगा। यह एस्क्रो तंत्र दोनों पक्षों की सुरक्षा कैसे करता है, इसका विवरण हमारे [smart contract escrow स्पष्टीकरण](/hi/smart-contract-escrow) में उपलब्ध है।

**सार्वजनिक नोड्स पर सुरक्षा विचार:**

जब आप किसी रिमोट नेटवर्क पर मशीन किराए पर लेते हैं, तो आप ऐसी हार्डवेयर तक पहुँचते हैं जो भौतिक रूप से किसी अन्य व्यक्ति के नियंत्रण में है। वर्चुअलाइज़ेशन परत पर्याप्त पृथक्करण प्रदान करती है, लेकिन सावधानी आवश्यक है:

1. **रिमोट मशीन पर निजी कुंजियाँ संग्रहीत न करें।** आपका क्रिप्टो वॉलेट, अन्य सिस्टम के SSH कुंजी और प्रोडक्शन API टोकन कभी भी रेंटल नोड पर मौजूद नहीं होने चाहिए।

2. **फ़ाइल सिस्टम को संभावित रूप से असुरक्षित मानें।** सैद्धांतिक रूप से, डिस्क पर लिखी गई कोई भी चीज़ बाद में पुनर्प्राप्त की जा सकती है। हम चरण 6 में सुरक्षित हटाने की प्रक्रिया कवर करेंगे।

3. **संवेदनशील डेटा स्थानांतरित करते समय एन्क्रिप्शन का उपयोग करें।** यह चरण 3 में समझाया गया है।

4. **पासवर्ड दोबारा उपयोग न करें।** यदि डिफ़ॉल्ट क्रेडेंशियल दिए गए हों, तो तुरंत बदलें या नया SSH कुंजी युग्म बनाएँ।

रेंटल की पुष्टि के बाद, डैशबोर्ड आपको कनेक्शन विवरण देगा। आपको निम्न जैसा SSH कमांड मिलेगा:

```bash
ssh -p 22345 user@203.0.113.42
```

अपने स्थानीय टर्मिनल में यह कमांड चलाएँ। होस्ट कुंजी फ़िंगरप्रिंट स्वीकार करें। अब आप अपने किराए के GPU नोड से जुड़े हैं।

सत्यापित करें कि हार्डवेयर आपके ऑर्डर से मेल खाता है:

```bash
nvidia-smi
```

आउटपुट में GPU मॉडल, मेमोरी क्षमता और ड्राइवर संस्करण दिखाई देना चाहिए। यदि यह मेल नहीं खाता, तो तुरंत डिस्कनेक्ट करें और मार्केटप्लेस विवाद प्रणाली के माध्यम से रिपोर्ट करें।

## चरण 2: वातावरण कॉन्फ़िगरेशन

SSH कनेक्शन स्थापित होने के बाद, अगली प्राथमिकता एक स्वच्छ Python वातावरण बनाना है। अधिकांश रेंटल नोड्स में NVIDIA ड्राइवर और CUDA पहले से इंस्टॉल होते हैं, लेकिन सिस्टम-स्तरीय Python पैकेजों पर निर्भरता टकराव पैदा कर सकती है।

हम एक वर्चुअल वातावरण बनाएँगे:

```bash
mkdir ~/llama3-finetune
cd ~/llama3-finetune
python3 -m venv venv
source venv/bin/activate
```

आपका प्रॉम्प्ट अब `(venv)` दिखाना चाहिए।

CUDA उपलब्धता की जाँच करें:

```bash
nvcc --version
```

CUDA संस्करण नोट करें (आमतौर पर 11.8 या 12.1)। यदि `nvcc` उपलब्ध नहीं है:

```bash
source /etc/profile.d/cuda.sh
```

अपनी CUDA संस्करण के अनुसार PyTorch इंस्टॉल करें। उदाहरण के लिए, CUDA 12.1 के लिए:

```bash
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121
```

अब fine‑tuning के लिए आवश्यक लाइब्रेरी इंस्टॉल करें:

```bash
pip install transformers==4.40.0 datasets==2.19.0 peft==0.10.0 bitsandbytes==0.43.1 trl==0.8.6 accelerate==0.29.0
```

**संस्करण निर्धारण महत्वपूर्ण है।** Hugging Face इकोसिस्टम तेज़ी से बदलता है, और बिना पिन की गई इंस्टॉलेशन असंगतियाँ उत्पन्न कर सकती हैं।

इसके बाद, Hugging Face के साथ प्रमाणीकरण करें। Llama‑3 वेट्स लाइसेंस स्वीकृति के बाद ही उपलब्ध होते हैं। [Hugging Face](https://huggingface.co) पर जाएँ, लाइसेंस स्वीकार करें, और एक एक्सेस टोकन जनरेट करें।

```bash
huggingface-cli login
```

टोकन पेस्ट करें। यह `~/.cache/huggingface/token` में संग्रहीत होगा।

![टर्मिनल में प्रदर्शित Python कोड जिसमें Llama-3 मॉडल कॉन्फ़िगरेशन पैरामीटर दिखाए गए हैं](../_images/python-llama3-config.png)

## चरण 3: सुरक्षित डेटा ट्रांसफर

यही वह कारण है कि आप API कॉल करने के बजाय विकेन्द्रीकृत कंप्यूट किराए पर ले रहे हैं: डेटा संप्रभुता।

मानक क्लाउड वर्कफ़्लो में आप अपना डेटासेट S3, Google Drive या Azure Blob पर अपलोड करते हैं और फिर उसे कंप्यूट इंस्टेंस पर डाउनलोड करते हैं। इससे आपके संवेदनशील डेटा की कई प्रतियाँ बनती हैं।

हम SSH के माध्यम से प्रत्यक्ष एन्क्रिप्टेड ट्रांसफर का उपयोग करेंगे।

अपने स्थानीय कंप्यूटर पर एक **नया टर्मिनल विंडो** खोलें (मौजूदा SSH सत्र बंद न करें) और चलाएँ:

```bash
scp -P 22345 /path/to/your/dataset.jsonl user@203.0.113.42:~/llama3-finetune/
```

ध्यान दें कि `-P` (बड़ा P) पोर्ट निर्दिष्ट करता है।

1GB से बड़े डेटासेट के लिए:

```bash
# स्थानीय मशीन पर
gzip -k dataset.jsonl
scp -P 22345 dataset.jsonl.gz user@203.0.113.42:~/llama3-finetune/

# रिमोट नोड पर
cd ~/llama3-finetune
gunzip dataset.jsonl.gz
```

यदि अतिरिक्त सुरक्षा की आवश्यकता हो, तो `age` के माध्यम से एन्क्रिप्ट करें:

```bash
# स्थानीय मशीन पर
age -p dataset.jsonl > dataset.jsonl.age
scp -P 22345 dataset.jsonl.age user@203.0.113.42:~/llama3-finetune/

# रिमोट नोड पर
age -d dataset.jsonl.age > dataset.jsonl
rm dataset.jsonl.age
```

SSH प्रोटोकॉल AES‑256 एन्क्रिप्शन का उपयोग करता है। अधिकांश उपयोगकर्ताओं के लिए यह पर्याप्त सुरक्षा प्रदान करता है।

## चरण 4: Fine‑Tuning स्क्रिप्ट

हम TRL लाइब्रेरी की `SFTTrainer` क्लास का उपयोग करेंगे।

**डेटासेट प्रारूप आवश्यकताएँ:**

स्क्रिप्ट एक JSONL फ़ाइल अपेक्षित करती है जहाँ प्रत्येक पंक्ति में एक JSON ऑब्जेक्ट होता है जिसमें `text` फ़ील्ड हो।

महत्वपूर्ण नियम:

1. प्रत्येक JSON ऑब्जेक्ट एक ही पंक्ति में होना चाहिए।
2. `text` फ़ील्ड में नई पंक्तियाँ `\n` के रूप में एस्केप होनी चाहिए।
3. उद्धरण चिह्न `\"` के रूप में एस्केप होने चाहिए।
4. फ़ाइल UTF‑8 एन्कोडिंग में होनी चाहिए।

यदि आपका डेटा CSV या अन्य प्रारूप में है, तो पहले उसे JSONL में परिवर्तित करें।

रिमोट नोड पर प्रशिक्षण स्क्रिप्ट बनाएँ:

```bash
cd ~/llama3-finetune
nano train.py
```

मूल संस्करण में दिया गया पूरा प्रशिक्षण कोड पेस्ट करें। मॉडल पहचानकर्ता को आवश्यकतानुसार बदल सकते हैं, लेकिन संरचना न बदलें।

सहेजें और बाहर निकलें।

प्रशिक्षण प्रारंभ करने के लिए:

```bash
python train.py
```

पहली बार चलाने पर बेस मॉडल वेट्स (लगभग 16GB) डाउनलोड होंगे। इसके बाद प्रशिक्षण शुरू होगा और प्रत्येक कुछ स्टेप पर loss प्रदर्शित होगा।

## चरण 5: प्रशिक्षण प्रक्रिया की निगरानी

जब प्रशिक्षण स्क्रिप्ट चल रही हो, तब GPU की स्थिति की निगरानी करना आवश्यक है। यदि VRAM पूरी तरह भर जाती है या तापमान सुरक्षित सीमा से ऊपर चला जाता है, तो प्रक्रिया विफल हो सकती है — जिससे आपका किराया समय व्यर्थ हो सकता है और checkpoint भी क्षतिग्रस्त हो सकते हैं।

अपने स्थानीय कंप्यूटर पर एक दूसरा टर्मिनल खोलें और उसी नोड से पुनः कनेक्ट करें:

```bash
ssh -p 22345 user@203.0.113.42
```

अब वास्तविक समय में GPU आँकड़े देखने के लिए चलाएँ:

```bash
watch -n 1 nvidia-smi
```

![nvidia-smi आउटपुट दिखाता हुआ टर्मिनल जिसमें GPU मेमोरी उपयोग और तापमान आँकड़े प्रदर्शित हैं](../_images/nvidia-smi-monitoring.png)

यह कमांड हर सेकंड अपडेट होती है और निम्न जानकारी दिखाती है:

- मेमोरी उपयोग
- GPU उपयोग प्रतिशत
- तापमान

RTX 4090 पर इस गाइड की कॉन्फ़िगरेशन के साथ सामान्यतः आप देखेंगे:

- **मेमोरी उपयोग:** 18GB से 22GB (कुल 24GB में से)
- **GPU उपयोग:** सक्रिय प्रशिक्षण के दौरान 90% से 100%
- **तापमान:** 60°C से 80°C (होस्ट की कूलिंग पर निर्भर)

**सामान्य समस्याएँ और समाधान:**

**मेमोरी 24GB के पास पहुँच रही है:** `BATCH_SIZE` को 2 या 1 पर कम करें। वैकल्पिक रूप से `MAX_SEQ_LENGTH` को 256 तक घटाएँ। परिवर्तन के बाद प्रशिक्षण पुनः प्रारंभ करें।

**GPU उपयोग 0% के आसपास:** यह डेटा लोडिंग बाधा का संकेत हो सकता है। यदि डेटासेट बहुत बड़ा है, तो पहले से अधिक कुशल प्रारूप (जैसे Arrow या Parquet) में प्रोसेस करना सहायक हो सकता है।

**तापमान 85°C से ऊपर:** लंबे समय तक उच्च तापमान थ्रॉटलिंग का कारण बन सकता है। ऐसे में रेंटल समाप्त कर दूसरे नोड का चयन करना उचित हो सकता है।

**Loss मान की व्याख्या:**

Loss यह दर्शाता है कि मॉडल की भविष्यवाणियाँ कितनी त्रुटिपूर्ण हैं — कम मान बेहतर है।

आमतौर पर आप देखेंगे:

- **प्रारंभिक Loss:** 1.5 से 3.0
- **रुझान:** प्रारंभिक चरणों में लगातार गिरावट
- **अंतिम Loss:** 0.5 से 1.5 (सही कॉन्फ़िगरेशन के साथ)

यदि 100 स्टेप के बाद भी Loss नहीं घटता, तो learning rate कम हो सकता है। यदि Loss अचानक बहुत बढ़ जाता है (जैसे 10+), तो learning rate अधिक हो सकता है या डेटासेट में स्वरूपण त्रुटि हो सकती है।

1,000 उदाहरणों वाला प्रशिक्षण RTX 4090 पर लगभग 30–60 मिनट में पूरा हो जाता है। 10,000 उदाहरणों के लिए लगभग 5–10 घंटे का समय अपेक्षित है।

## चरण 6: मॉडल डाउनलोड करना और वातावरण स्वच्छ करना

प्रशिक्षण पूरा होने के बाद, आपका fine‑tuned LoRA adapter `OUTPUT_NAME` द्वारा निर्दिष्ट फ़ोल्डर में उपलब्ध होगा। यह पूर्ण बेस मॉडल (16GB+) की तुलना में काफी छोटा होता है — सामान्यतः 100MB से 500MB के बीच।

फ़ाइलों की पुष्टि करें:

```bash
ls -la ~/llama3-finetune/llama-3-8b-custom/
```

आपको `adapter_config.json`, `adapter_model.safetensors` और tokenizer फ़ाइलें दिखाई देंगी।

**रेंटल नोड पर adapter को मर्ज न करें।** मर्जिंग के लिए पूर्ण मॉडल को उच्च प्रिसिशन में लोड करना पड़ता है, जो 24GB GPU की सीमा से अधिक हो सकता है। मर्जिंग अपने स्थानीय इन्फ्रास्ट्रक्चर पर करें या inference के दौरान adapter को बेस मॉडल के साथ लोड करें।

Adapter डाउनलोड करने के लिए, अपने **स्थानीय टर्मिनल** में चलाएँ:

```bash
scp -r -P 22345 user@203.0.113.42:~/llama3-finetune/llama-3-8b-custom ./
```

डाउनलोड के बाद फ़ाइल आकार की पुष्टि करें।

**अब रिमोट वातावरण को स्वच्छ करें।**

SSH सत्र में चलाएँ:

```bash
rm -rf ~/llama3-finetune
rm -rf ~/.cache/huggingface
rm -rf ~/.cache/pip
history -c
cat /dev/null > ~/.bash_history
sync
```

यदि अतिरिक्त सुरक्षा चाहते हैं और `shred` उपलब्ध है:

```bash
find ~/llama3-finetune -type f -exec shred -u {} \;
rm -rf ~/llama3-finetune
```

इसके बाद SSH सत्र से बाहर निकलें:

```bash
exit
```

GPUFlow डैशबोर्ड पर जाएँ और रेंटल औपचारिक रूप से समाप्त करें। स्मार्ट कॉन्ट्रैक्ट शेष डिपॉज़िट आपकी वॉलेट में वापस कर देगा।

## अपने Fine‑Tuned मॉडल के साथ Inference चलाना

न्यूनतम उदाहरण:

```python
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer, BitsAndBytesConfig
from peft import PeftModel

bnb_config = BitsAndBytesConfig(
    load_in_4bit=True,
    bnb_4bit_quant_type="nf4",
    bnb_4bit_compute_dtype=torch.float16,
)

base_model = AutoModelForCausalLM.from_pretrained(
    "meta-llama/Meta-Llama-3-8B",
    quantization_config=bnb_config,
    device_map="auto",
)

model = PeftModel.from_pretrained(base_model, "./llama-3-8b-custom")
tokenizer = AutoTokenizer.from_pretrained("meta-llama/Llama-3.1-8B")

prompt = "### Instruction: Summarize the contract clause.\n\n### Input: The Licensee shall not reverse engineer, decompile, or disassemble the Software.\n\n### Response:"

inputs = tokenizer(prompt, return_tensors="pt").to("cuda")
outputs = model.generate(**inputs, max_new_tokens=100, temperature=0.7)
response = tokenizer.decode(outputs[0], skip_special_tokens=True)

print(response)
```

प्रोडक्शन वातावरण में, आप इस मॉडल को FastAPI या Flask के माध्यम से API में पैक कर सकते हैं, या vLLM अथवा Text Generation Inference (TGI) जैसे सर्वर का उपयोग कर सकते हैं।

## निष्कर्ष

आपने एक अत्याधुनिक Large Language Model को अपने स्वामित्व वाले डेटा पर fine‑tune किया — बिना उस डेटा को किसी तीसरे पक्ष को सौंपे। बिना एंटरप्राइज़ अनुबंध के। बिना पहचान सत्यापन के। बिना बंद-स्रोत API पर निर्भर हुए।

यदि आपने RTX 4090 को 0.45 डॉलर प्रति घंटा की दर से दो घंटे के लिए किराए पर लिया, तो कुल लागत लगभग एक डॉलर से भी कम रही। वही प्रक्रिया AWS पर 100 से 200 डॉलर तक खर्च कर सकती है।

लेकिन वास्तविक लाभ लागत में कमी नहीं है — बल्कि नियंत्रण है। कोई केंद्रीय प्रदाता आपके प्रशिक्षण रन को आपकी पहचान से नहीं जोड़ता। कोई सेवा शर्तें आपके डेटासेट पर अधिकार का दावा नहीं करतीं।

बंद API पर निर्भरता का युग समाप्ति की ओर है। जो संगठन गोपनीयता को प्राथमिकता देते हैं, जो शोधकर्ता संप्रभुता को महत्व देते हैं और जो डेवलपर निगरानी को स्वीकार नहीं करते — उनके लिए अब एक व्यावहारिक विकल्प उपलब्ध है।

आपका fine‑tuned मॉडल अब उस इन्फ्रास्ट्रक्चर पर मौजूद है जिसे आप नियंत्रित करते हैं। इसका उपयोग कैसे करना है, किसे पहुँच देनी है और किस उद्देश्य के लिए तैनात करना है — यह निर्णय केवल आपका है।

---

## आगे क्या पढ़ें

**लागत और भुगतान:**

- [GPU Rental Pricing Comparison 2026](/hi/gpu-rental-pricing-comparison-2026)
- [Stablecoins Are the Smartest Way to Pay for GPU Rental](/hi/stable-coins-are-the-smartest-way-to-pay-for-gpu-rental)
- [How to Rent a GPU Without KYC](/hi/how-to-rent-gpu-without-kyc)

**प्लेटफ़ॉर्म मैकेनिक्स:**

- [Setting Up MetaMask for Polygon GPU Rental](/hi/setting-up-metamask-polygon-gpu-rental)
- [Smart Contract Escrow Explained](/hi/smart-contract-escrow)
- [Hidden Fees in GPU Rental](/hi/hidden-fees-in-gpu-rental)

**तुलना:**

- [RunPod vs Vast.ai Comparison](/hi/runpod-vs-vastapi-comparison)
