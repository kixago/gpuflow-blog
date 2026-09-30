---
title: "किराये के या public GPU node पर अपना dataset कैसे सुरक्षित रखें"
description: "किराये के GPU का host वह सब पढ़ सकता है जो आपका job decrypt करता है। encryption, secure cloud और H100 confidential computing क्या ठीक करते हैं, और बाद में सफ़ाई कैसे करें।"
excerpt: "GPU किराये पर लेने का मतलब है कि जिस मशीन पर आपका डेटा है, उस पर root किसी और के पास है। यहाँ threat model है, हर बचाव असल में क्या कवर करता है, और सफ़ाई का ऐसा तरीका जो आज की डिस्क पर काम करता है।"
pubDate: 2026-02-26
updatedDate: 2026-09-30
locale: "hi"
category: "guides"
featured: false
draft: false
author: "GPUFlow Team"
authorUrl: "https://gpuflow.app"
heroImage: "../_images/secure-server-room-abstract.png"
heroImageAlt: "सुरक्षित server environment का abstract चित्र, जो AI डेटा की सुरक्षित processing दिखाता है"
faq:
  - question: "क्या किराये के GPU का host मेरा डेटा देख सकता है?"
    answer: "तकनीकी रूप से हाँ। physical मशीन पर host के पास root है, और मॉडल train करने या चलाने के लिए आपके डेटा को मेमोरी में decrypt होना ही पड़ता है। सिर्फ़ confidential computing, जैसे Azure या Google Cloud पर H100 confidential VMs, host को इस तस्वीर से बाहर करती है।"
  - question: "क्या cloud GPU instance पर shred फ़ाइलों को सुरक्षित ढंग से मिटाता है?"
    answer: "भरोसे से नहीं। GNU shred का manual कहता है कि यह तभी काम करता है जब file system और hardware डेटा को उसी जगह overwrite करें, और journaled व copy-on-write file systems, snapshots और SSDs इसकी गारंटी नहीं देते। डेटा को डिस्क पर पहुँचने से पहले encrypt करें और उसकी जगह instance को destroy करें।"
  - question: "RunPod Secure Cloud और Community Cloud में क्या फ़र्क़ है?"
    answer: "RunPod के docs बताते हैं कि Secure Cloud T3/T4 data centers में चलता है और production व संवेदनशील डेटा के लिए ठीक है, जबकि Community Cloud में peer-to-peer providers हैं जिनकी reliability बदलती रहती है। RunPod अब Community Cloud के लिए नए hosts स्वीकार नहीं कर रहा।"
  - question: "कौन-से cloud GPUs confidential computing support करते हैं?"
    answer: "सितंबर 2026 तक Azure AMD SEV-SNP पर एक H100 NVL GPU वाले NCCads H100 v5 confidential VMs देता है, और Google Cloud confidential a3-highgpu-1g (एक H100, Intel TDX) और G4 (RTX PRO 6000, AMD SEV) देता है। consumer GeForce कार्ड इन सूचियों में नहीं हैं।"
  - question: "क्या GDPR के तहत किराये के GPU पर personal data रखना सुरक्षित है?"
    answer: "सिर्फ़ तब, जब provider एक processor हो जिसके साथ GDPR के Article 28 की शर्तें पूरी करने वाला अनुबंध हो, और मशीन EU से बाहर हो तो transfer का क़ानूनी रास्ता हो। ज़्यादातर peer-to-peer hosts का आपके साथ ऐसा कोई अनुबंध नहीं होता, इसलिए पहले डेटा से पहचान हटाएँ या ऐसा data-center provider लें जो DPA पर दस्तख़त करे।"
  - question: "क्या मैं GPUFlow पर मॉडल train या fine-tune कर सकता हूँ?"
    answer: "नहीं। GPUFlow सिर्फ़ inference के लिए है: आपको provider के कंप्यूटर पर चल रहे मॉडल के लिए OpenAI-compatible API key मिलती है, बिना SSH, shell या फ़ाइल access के। prompts उस कंप्यूटर तक सादे टेक्स्ट में पहुँचते हैं, इसलिए इसके ज़रिए गोपनीय रिकॉर्ड न भेजें।"
---

जब आप GPU किराये पर लेते हैं, तो जिस मशीन पर आपका डेटा है, उस पर root किसी और के पास होता है। encryption dataset को वहाँ पहुँचते समय और डिस्क पर पड़े रहते समय बचाता है, लेकिन इस्तेमाल करने के लिए आपके training job को उसे मेमोरी में decrypt करना ही पड़ता है, और उस वक़्त कोई ठान ले तो host उसे पढ़ सकता है। इसलिए असली फ़ैसले ये हैं: आप किस पर भरोसा करते हैं (जाँचा-परखा data center या कोई गुमनाम घरेलू server), कितना कम डेटा भेजते हैं, और क्या आपको confidential computing चाहिए, जो अकेला विकल्प है जो host संचालक को भरोसे की कड़ी से बाहर करता है।

यह guide उन मशीनों के बारे में है जिनमें आप login करते हैं, जैसे Vast.ai या RunPod के instances। यह threat model, हर बचाव क्या कवर करता है, और सफ़ाई का ऐसा तरीका देखती है जो आज के storage पर टिकता है। स्रोत आख़िर में हैं; सब कुछ सितंबर 2026 में जाँचा गया।

## Threat model

शुरुआत यह तय करने से करें कि डेटा तक कौन और कैसे पहुँच सकता है। किराये के GPU instance पर सात असली रास्ते हैं।

<figure>
<svg viewBox="0 0 720 430" role="img" aria-labelledby="d1-title" xmlns="http://www.w3.org/2000/svg" font-family="system-ui, sans-serif" font-size="15">
<title id="d1-title">किराये के GPU instance पर dataset का threat model: डेटा तक पहुँचने के सात रास्ते और हर एक का मुख्य बचाव</title>
<rect x="0" y="0" width="720" height="430" fill="#ffffff"/>
<line x1="220" y1="75" x2="240" y2="170" stroke="#e2e8f0" stroke-width="2"/>
<line x1="220" y1="220" x2="240" y2="215" stroke="#e2e8f0" stroke-width="2"/>
<line x1="220" y1="365" x2="240" y2="270" stroke="#e2e8f0" stroke-width="2"/>
<line x1="500" y1="75" x2="480" y2="170" stroke="#e2e8f0" stroke-width="2"/>
<line x1="500" y1="220" x2="480" y2="215" stroke="#e2e8f0" stroke-width="2"/>
<line x1="500" y1="365" x2="480" y2="270" stroke="#e2e8f0" stroke-width="2"/>
<line x1="360" y1="330" x2="360" y2="290" stroke="#e2e8f0" stroke-width="2"/>
<rect x="240" y="140" width="240" height="150" rx="12" fill="#eef2ff" stroke="#6366f1" stroke-width="2"/>
<text x="360" y="170" text-anchor="middle" fill="#1e1b4b" font-weight="bold">आपका किराये का instance</text>
<text x="360" y="205" text-anchor="middle" fill="#1e1b4b">Dataset</text>
<text x="360" y="235" text-anchor="middle" fill="#1e1b4b">Weights और checkpoints</text>
<text x="360" y="265" text-anchor="middle" fill="#1e1b4b">Tokens और keys</text>
<rect x="20" y="40" width="200" height="70" rx="10" fill="#ffffff" stroke="#f97316" stroke-width="2"/>
<text x="120" y="68" text-anchor="middle" fill="#1e1b4b">host संचालक</text>
<text x="120" y="92" text-anchor="middle" fill="#64748b" font-size="13">उपाय: भरोसेमंद host या CC</text>
<rect x="20" y="185" width="200" height="70" rx="10" fill="#ffffff" stroke="#f97316" stroke-width="2"/>
<text x="120" y="213" text-anchor="middle" fill="#1e1b4b">नेटवर्क का रास्ता</text>
<text x="120" y="237" text-anchor="middle" fill="#64748b" font-size="13">उपाय: SSH, खुले ports नहीं</text>
<rect x="20" y="330" width="200" height="70" rx="10" fill="#ffffff" stroke="#f97316" stroke-width="2"/>
<text x="120" y="358" text-anchor="middle" fill="#1e1b4b">डिस्क पर बचा डेटा</text>
<text x="120" y="382" text-anchor="middle" fill="#64748b" font-size="13">उपाय: encrypt, फिर destroy</text>
<rect x="500" y="40" width="200" height="70" rx="10" fill="#ffffff" stroke="#f97316" stroke-width="2"/>
<text x="600" y="68" text-anchor="middle" fill="#1e1b4b">मार्केटप्लेस प्लेटफ़ॉर्म</text>
<text x="600" y="92" text-anchor="middle" fill="#64748b" font-size="13">उपाय: अनुबंध और DPA</text>
<rect x="500" y="185" width="200" height="70" rx="10" fill="#ffffff" stroke="#f97316" stroke-width="2"/>
<text x="600" y="213" text-anchor="middle" fill="#1e1b4b">दूसरे किरायेदार</text>
<text x="600" y="237" text-anchor="middle" fill="#64748b" font-size="13">उपाय: VM या पूरी मशीन</text>
<rect x="500" y="330" width="200" height="70" rx="10" fill="#ffffff" stroke="#f97316" stroke-width="2"/>
<text x="600" y="358" text-anchor="middle" fill="#1e1b4b">Snapshots, volumes</text>
<text x="600" y="382" text-anchor="middle" fill="#64748b" font-size="13">उपाय: कोई स्थायी कॉपी नहीं</text>
<rect x="260" y="330" width="200" height="70" rx="10" fill="#ffffff" stroke="#f97316" stroke-width="2"/>
<text x="360" y="358" text-anchor="middle" fill="#1e1b4b">आपकी अपनी छूटी चीज़ें</text>
<text x="360" y="382" text-anchor="middle" fill="#64748b" font-size="13">उपाय: सीमित, बदलते tokens</text>
</svg>
<figcaption>job चलते समय instance पर सब कुछ host संचालक की पहुँच में है। बाक़ी रास्ते सामान्य सावधानी से बंद हो जाते हैं; इस एक के लिए या तो भरोसेमंद host चाहिए या confidential computing।</figcaption>
</figure>

**host संचालक।** physical मशीन जिसकी है, उसके पास उस पर root है। Vast.ai जैसे container मार्केटप्लेस पर clients unprivileged Docker containers में चलते हैं, जो आपको दूसरे किरायेदारों से अलग रखता है, host से नहीं: host पर root container की फ़ाइलें और मेमोरी पढ़ सकता है। हर प्लेटफ़ॉर्म पर containers ऐसे ही काम करते हैं।

**नेटवर्क का रास्ता।** आपके laptop या bucket से node तक जाता डेटा। यह रास्ता बंद करना सबसे आसान है।

**मार्केटप्लेस प्लेटफ़ॉर्म।** आपके और host के बीच की कंपनी के पास आपका खाता, आपकी SSH keys और उसके अपने logs में जो कुछ रहता है, वह है। वह इनके साथ क्या कर सकती है, यह उसकी शर्तें तय करती हैं, इसीलिए आगे का अनुबंध वाला हिस्सा मायने रखता है।

**डिस्क पर बचा डेटा।** आपकी मिटाई फ़ाइलें किराया ख़त्म होने के बाद भी डिस्क पर रह सकती हैं, जहाँ अगला किरायेदार या host उन्हें पा सकता है।

**Snapshots और persistent volumes।** आपकी माँगी कॉपियाँ (network volume, रुका हुआ instance) या host की बनाई कॉपियाँ (backups) job के बाद भी बनी रहती हैं।

**दूसरे किरायेदार।** उसी मशीन पर दूसरे ग्राहक। VM isolation के साथ या पूरी मशीन अपने पास हो तो यह जोखिम छोटा है, लेकिन GPUs में यहाँ असली bugs रहे हैं। LeftoverLocals (CVE-2023-4969) से कुछ Apple, AMD और Qualcomm GPUs पर एक process दूसरे की GPU local memory पढ़ सकता था; Trail of Bits ने AMD Radeon RX 7900 XT पर हर LLM query से लगभग 181 MB निकाल लिए, जो मॉडल का जवाब दोबारा बनाने के लिए काफ़ी था। Trail of Bits को NVIDIA, ARM या Intel GPUs पर इसका कोई निशान नहीं मिला।

**आपकी अपनी छूटी चीज़ें।** node पर छूटा Hugging Face token, cloud keys या SSH private key। असल में ज़्यादातर leaks ऐसे ही शुरू होते हैं।

## encryption क्या कवर करता है, और क्या नहीं कर सकता

encryption के तीन काम हैं, और किराये के GPU पर इनमें से दो आप ख़ुद कर सकते हैं।

**रास्ते में (in transit):** आसान। SSH (`scp`, `sftp`, `rsync -e ssh`) या bucket से HTTPS इस्तेमाल करें। Vast.ai बताता है कि SSH connections और उसका API encrypted हैं। सादे HTTP links या बिना authentication वाली file-sharing सेवाएँ कभी इस्तेमाल न करें।

**डिस्क पर (at rest):** अपलोड से पहले encrypt करें, ताकि host की डिस्क पर पड़ी फ़ाइल key के बिना बेकार हो। इसके लिए [age](https://github.com/FiloSottile/age) सबसे आसान टूल है:

```bash
# on your own machine
tar -cf - train/ | age -p > train.tar.age
scp -P 22345 train.tar.age user@203.0.113.42:/workspace/
```

node पर सीधे मेमोरी में decrypt करें, ताकि सादा टेक्स्ट कभी डिस्क को न छुए:

```bash
mkdir -p /dev/shm/train
age -d /workspace/train.tar.age | tar -xf - -C /dev/shm/train
```

`age -d` terminal पर passphrase माँगता है, इसलिए key कभी node पर लिखी नहीं जाती। `/dev/shm` RAM पर चलने वाला file system है; पहले `df -h /dev/shm` से उसका साइज़ देख लें, क्योंकि container setups में यह अक्सर छोटा होता है। अगर डेटा RAM में नहीं आता, तो डिस्क पर decrypted कॉपी रखनी पड़ेगी, और तब आगे का सफ़ाई वाला हिस्सा और अहम हो जाता है।

अपने servers पर आम जवाब LUKS से full-disk encryption है, लेकिन unprivileged container के अंदर आप आमतौर पर dm-crypt सेट नहीं कर सकते, और चालू key वैसे भी host के पास होती।

**इस्तेमाल के दौरान (in use):** यही कमी है। training के लिए GPU को सादे tensors चाहिए, और उसे डेटा देने वाली CPU मेमोरी में भी सादा टेक्स्ट होता है। host पर root वाला कोई भी, सिद्धांत रूप में, वह मेमोरी dump कर सकता है। चालू और बदनीयत host के सामने at-rest encryption कुछ नहीं करता। इसका इलाज सिर्फ़ hardware पर आधारित confidential computing करती है।

## Secure cloud या community cloud

host ही वह एक जोखिम है जिसे सावधानी से नहीं हटाया जा सकता, इसलिए host चुनना आपका सबसे बड़ा फ़ैसला है। दोनों बड़े मार्केटप्लेस इसी वजह से अपनी supply को बाँटते हैं।

| विकल्प | hardware कौन चलाता है | प्लेटफ़ॉर्म क्या कहता है |
| --- | --- | --- |
| RunPod Secure Cloud | T3/T4 data centers | "production, संवेदनशील डेटा" के लिए |
| RunPod Community Cloud | Peer-to-peer providers | "लागत को लेकर संवेदनशील workloads" के लिए; नए hosts स्वीकार नहीं |
| Vast.ai Secure Cloud | जाँचे-परखे data centers | ISO 27001, Tier 3/4 मानक, जाँची हुई physical सुरक्षा |
| Vast.ai के दूसरे hosts | data centers से लेकर व्यक्तियों तक | व्यक्तिगत hosts के "सुरक्षा उपाय कम औपचारिक हो सकते हैं" |

संवेदनशील डेटा के लिए Vast.ai की अपनी सलाह है: सिर्फ़ Secure Cloud providers इस्तेमाल करें, डेटा को at rest encrypt करें, credentials instances पर न रखें और बाहरी key management इस्तेमाल करें। मैं भी किसी को यही बताऊँगा।

certified data center में भी दो सीमाएँ लागू रहती हैं। पहली, ISO 27001 संचालक की प्रक्रियाओं को certify करता है; वह किसी बेईमान अंदरूनी व्यक्ति की संभावना ख़त्म नहीं कर सकता। दूसरी, जो host आपके लिए personal data process करता है, वह GDPR के तहत processor है, और Article 28 इसके लिए अनुबंध चाहता है, जबकि मार्केटप्लेस आपके और host के बीच बैठा है। पढ़ें कि आपका अनुबंध असल में किस कंपनी से है और वह अपने hosts के बारे में क्या वादा करती है।

सच में संवेदनशील काम के लिए अगला क़दम किसी ऐसे hyperscaler खाते में GPU instance है जिसके साथ आपका पहले से DPA और शायद BAA है। यह आपको मार्केटप्लेस के दायरे से बाहर ले जाता है और प्रति घंटा महँगा है। हमारी [GPU किराये की कीमतों की तुलना](/hi/gpu-rental-pricing-comparison-2026/) कीमतों की range दिखाती है।

## H100 GPUs पर confidential computing

confidential computing (CC) यहाँ अकेली technology है जो job चलते समय डेटा को host संचालक से बचाने के लिए बनी है। NVIDIA Hopper और Blackwell data center GPUs पर यह ऐसे काम करती है:

- workload एक confidential VM (CVM) में चलता है, जिसके पीछे CPU पर AMD SEV-SNP या Intel TDX है। NVIDIA का डिज़ाइन मानकर चलता है कि hypervisor और host OS compromised हो सकते हैं; hypervisor "या ख़ुद सिस्टम" तक पहुँच वाला संचालक भी CVM की मेमोरी न पढ़ पाए।
- इस्तेमाल से पहले VM जाँचता है कि GPU असली है और signed device certificate के साथ CC mode में है, जिसे NVIDIA की Remote Attestation Service (NRAS) से जाँचा जा सकता है।
- PCIe पार करने वाले डेटा, command buffers और CUDA kernels encrypted और signed होते हैं, और shared memory में एक encrypted bounce buffer से होकर जाते हैं।

NVIDIA ने अप्रैल 2024 में CUDA 12.4 के साथ H100 पर single-GPU CC सबके लिए उपलब्ध किया। सितंबर 2026 तक आप इसे असल में कहाँ किराये पर ले सकते हैं:

| Cloud | Instance | GPU | CPU TEE |
| --- | --- | --- | --- |
| Azure | NCCads H100 v5 | 1 × H100 NVL, 94 GB | AMD SEV-SNP (EPYC Genoa) |
| Google Cloud | a3-highgpu-1g, Confidential VM | 1 × H100 | Intel TDX |
| Google Cloud | g4-standard-48, Confidential VM | RTX PRO 6000 | AMD SEV |

इस पर कुछ बनाने से पहले सीमाएँ जान लें:

- **हर VM में एक GPU।** Azure की series में एक GPU है, और Google के confidential GPU VMs multi-node clusters support नहीं करते। बड़े multi-GPU training runs इससे बाहर हैं।
- **उपलब्धता।** Google Cloud पर confidential A3 High सिर्फ़ Spot या flex-start के रूप में चलता है और reservations support नहीं करता।
- **transfer की speed।** NVIDIA के 2023 के technical लेख में CC mode में CPU से GPU तक bandwidth लगभग 4 GB/s बताई गई, जिसे CPU encryption सीमित करता है। यानी 16 GB checkpoint load करने में सिर्फ़ transfer के लगभग 16 ÷ 4 = 4 सेकंड लगते हैं, जो inference के लिए ठीक है, लेकिन जो data pipeline हर step में कई gigabytes stream करती है, उसे यह महसूस होगा। बाद के driver releases में performance पर काम का ज़िक्र है, इसलिए अपना job ख़ुद मापें।
- **GPU मेमोरी encrypted नहीं है।** NVIDIA on-package HBM को सादा रखता है, इस तर्क पर कि आम physical attack टूल उस तक नहीं पहुँच सकते।
- **मार्केटप्लेस पर नहीं।** Vast.ai और RunPod के community hosts पर आम consumer GeForce कार्ड इनमें से किसी supported सूची में नहीं हैं।

CC यह बदलता है कि आपको किस पर भरोसा करना है: host के कर्मचारियों की जगह NVIDIA का hardware और attestation, CPU vendor, और आपकी अपनी VM image। regulated डेटा के लिए, जहाँ "cloud provider के admins इसे नहीं पढ़ सकते" वाला जवाब मायने रखता है, किराये के hardware पर वहाँ तक पहुँचाने वाला यही अकेला विकल्प है।

## job से पहले और उसके दौरान

### अपलोड से पहले घटाएँ

सबसे सस्ती सुरक्षा वह डेटा है जो कभी आपकी मशीन से बाहर न जाए। transfer से पहले:

- जिन columns की मॉडल को ज़रूरत नहीं, उन्हें हटाएँ, ख़ासकर नाम, emails, खाता नंबर और free-text notes।
- सीधी पहचान वाली चीज़ों की जगह random tokens रखें और lookup table घर पर रखें।
- corpus को उतना ही रखें जितना तरीके को चाहिए। LoRA या QLoRA fine-tune अतिरिक्त weights के एक छोटे सेट को बदलता है और उसे शायद ही पूरे production database की ज़रूरत होती है; हमारी [fine-tuning guide](/hi/private-llm-fine-tuning-guide/) एक असली जैसा setup दिखाती है।
- याद रखें कि model weights में जानकारी होती है। संवेदनशील टेक्स्ट पर fine-tune किया मॉडल उसके टुकड़े दोहरा सकता है, इसलिए adapter को भी संवेदनशील मानें।

पहचान हटाया हुआ डेटा ही आगे के ज़्यादातर क़ानूनी सवालों को भी ख़त्म करता है।

### node पर credentials और नेटवर्क

मानकर चलें कि node पर रखी कोई भी चीज़ कॉपी हो सकती है।

- fine-grained Hugging Face token इस्तेमाल करें, जिसकी read access सिर्फ़ उस एक repo तक हो जो आपको चाहिए, और job ख़त्म होते ही उसे revoke करें।
- अपनी मुख्य SSH private key, cloud root credentials या production database के passwords कभी किराये की मशीन पर कॉपी न करें। अगर job को नतीजे किसी bucket में लिखने हैं, तो ऐसी key बनाएँ जो सिर्फ़ एक prefix में लिख सके और एक दिन के अंदर expire हो जाए।
- नतीजों को node से लंबे समय वाली keys के साथ push करने की जगह SSH से वापस खींचें।
- `ss -tulnp` से देखें कि क्या listen कर रहा है। Jupyter, TensorBoard और inference servers को `127.0.0.1` पर bind करें और public port खोलने की जगह SSH tunnel (`ssh -L 8888:127.0.0.1:8888 ...`) से उन तक पहुँचें।

## सफ़ाई जो आज की डिस्क पर टिके

आम सलाह है कि काम ख़त्म होने पर dataset को `shred` कर दें। यह वह नहीं करता जो लोग सोचते हैं। GNU coreutils का manual कहता है कि `shred` इस पर निर्भर है कि file system और hardware डेटा को उसी जगह overwrite करें, और वे मामले गिनाता है जहाँ यह नाकाम होता है: journaled और log-structured file systems जैसे `data=journal` mode में ext4, Btrfs, XFS और ZFS, RAID, snapshots वाले file systems, compressed file systems, और SSDs, जिनका wear levelling नया डेटा कहीं और लिखता है। किराये का GPU node बहुत संभव है कि इनमें से कई एक साथ हो।

इसकी जगह जो काम करता है:

1. **डिस्क की कॉपी को बेकार बनाएँ।** अगर डिस्क को सिर्फ़ age से encrypted archive ने छुआ, तो उसे मिटाना काफ़ी है; passphrase के बिना वह बस noise है। NIST की media sanitisation guide (SP 800-88 Rev. 2, सितंबर 2025) इस तरीके, cryptographic erase, को एक मानक तकनीक मानती है।
2. **रोकें नहीं, destroy करें।** Vast.ai पर instance रोकने से उसका डेटा बना रहता है (और storage का बिल बनता रहता है); destroy करने से वह "instance और सारा डेटा हमेशा के लिए मिट जाता है"। RunPod पर pod रुकते ही container disk साफ़ हो जाती है, `/workspace` volume रुकने पर बचा रहता है और terminate पर मिटता है, और network volume तब तक सब कुछ झेल जाता है जब तक आप उसे delete न करें।
3. **अपने बनाए network volumes delete करें।** वे डिज़ाइन के मुताबिक़ pods के बाद भी रहते हैं।
4. **जो इस्तेमाल किया, उसे revoke करें।** Hugging Face token, bucket keys, और इस job के लिए मार्केटप्लेस में जोड़ी गई कोई भी एक बार वाली SSH public key हटाएँ।

किरायेदारों के बीच host डिस्क कैसे साफ़ करता है, यह मेरे पढ़े किसी मार्केटप्लेस के docs में नहीं बताया गया। ऐसे योजना बनाएँ जैसे यह होता ही नहीं, और क़दम 1 हर हाल में आपको बचाता है।

## अनुबंध और नियम

technical controls एक क़ानूनी तथ्य से कम मायने रखते हैं: किसी की मशीन पर डेटा रखने से वह उसमें एक पक्ष बन जाता है।

- **GDPR।** आपके लिए personal data process करने वाला GPU host एक processor है। Article 28 ऐसा processor माँगता है जो "पर्याप्त गारंटी" दे, और एक बाध्यकारी अनुबंध। जिस peer-to-peer host के साथ आपने कभी किसी चीज़ पर दस्तख़त नहीं किए, वह यह पूरा नहीं करता, और मशीन EU से बाहर भी हो सकती है। पहचान हटाएँ, या ऐसा provider लें जो DPA पर दस्तख़त करे।
- **HIPAA।** HHS कहता है कि electronic health डेटा रखने वाला cloud provider business associate है, भले डेटा encrypted हो और उसके पास key न हो। स्वास्थ्य रिकॉर्ड किसी बिना जाँचे host को भेजने से पहले encrypt कर देने से BAA की ज़रूरत ख़त्म नहीं होती।
- **आपके ग्राहकों के अनुबंध।** कई enterprise agreements subprocessors और डेटा की जगह पर पाबंदी लगाते हैं। पहले अपलोड से पहले इन्हें जाँचें। क़ानूनी जोखिम अक्सर technical जोखिम से बड़ा होता है।

साथ वाला लेख, [कंपनियाँ public AI टूल पर रोक क्यों लगाती हैं](/hi/why-corporate-policies-banning-chatgpt/), यही नियम chat वाले पक्ष से देखता है।

## GPUFlow पर inference: एक अलग सौदा

GPUFlow dataset रखने की जगह नहीं है। यह एक inference मार्केटप्लेस है: आप घंटे के हिसाब से GPU किराये पर लेते हैं और उस open मॉडल के लिए OpenAI-compatible API key (base URL `https://gpuflow.app/v1`) पाते हैं जिसे provider अपने कंप्यूटर पर (आमतौर पर Ollama से) चलाता है। वहाँ न SSH है, न shell, न फ़ाइल access, और आप उस पर train या fine-tune नहीं कर सकते। आपका अपलोड किया कुछ भी provider की डिस्क पर नहीं रहता, क्योंकि आप कुछ अपलोड कर ही नहीं सकते।

इससे इस guide की डिस्क और credentials वाली समस्याएँ हट जाती हैं। host वाली समस्या नहीं हटती। किराये के दौरान हर prompt और जवाब provider की मशीन से सादे टेक्स्ट में होकर गुज़रता है। GPUFlow की शर्तें provider को इन्हें रिकॉर्ड करने, पढ़ने, रखने या साझा करने से मना करती हैं, और GPUFlow ख़ुद टेक्स्ट नहीं सहेजता, लेकिन मशीन पर provider के पास root है, इसलिए यह नियम सिर्फ़ अनुबंध से लागू होता है। अगर आप इससे एक dataset को हर prompt में एक रिकॉर्ड करके चलाते हैं, तो हर रिकॉर्ड उस कंप्यूटर तक पहुँचता है।

इसलिए इसे public, synthetic या ठीक से पहचान हटाए गए डेटा के लिए इस्तेमाल करें, और किसी open मॉडल या ऐप को OpenAI-style API पर टेस्ट करने के लिए। regulated और गोपनीय रिकॉर्ड अपने hardware पर, किसी ऐसे provider के पास जिससे आपका अनुबंध है, या confidential VM में रखें। [API quickstart](https://docs.gpuflow.app/hi/renters/api-quickstart/) यही बात एक लाइन में कहता है: passwords, कार्ड नंबर या ऐसे दूसरे secrets न भेजें जो आप किसी अजनबी को न बताते। यही व्यवस्था provider की तरफ़ से [क्या अपना GPU किराये पर देना सुरक्षित है](/hi/is-it-safe-to-rent-out-your-gpu/) में है।

## Checklist

पहले:

- डेटा की श्रेणी तय करें। regulated या client का गोपनीय डेटा अनुबंध वाले provider या confidential VM पर जाता है, community host पर नहीं।
- डेटा घटाएँ और पहचान हटाएँ।
- age से encrypt करें; passphrase node पर न रखें।

दौरान:

- जहाँ फ़िट हो, `/dev/shm` में decrypt करें।
- सिर्फ़ सीमित दायरे वाले, कम समय के tokens।
- सेवाएँ localhost पर bind हों, SSH tunnels से पहुँचें।

बाद में:

- नतीजे SSH से खींचें; fine-tune किए weights को संवेदनशील मानें।
- instance और हर network volume destroy करें।
- tokens और एक बार वाली keys revoke करें।

## स्रोत

- Vast.ai पर container isolation और Secure Cloud: [Vast.ai Security FAQ](https://docs.vast.ai/guides/reference/faq/security); stop बनाम destroy: [Instances का प्रबंधन](https://docs.vast.ai/guides/instances/manage-instances)
- RunPod Secure बनाम Community Cloud: [Pod चुनना](https://docs.runpod.io/pods/choose-a-pod); storage कितना टिकता है: [Storage के प्रकार](https://docs.runpod.io/pods/storage/types)
- LeftoverLocals: [Trail of Bits, जनवरी 2024](https://blog.trailofbits.com/2024/01/16/leftoverlocals-listening-to-llm-responses-through-leaked-gpu-local-memory/)
- age: [github.com/FiloSottile/age](https://github.com/FiloSottile/age)
- shred की सीमाएँ: [GNU coreutils manual, shred invocation](https://www.gnu.org/software/coreutils/manual/html_node/shred-invocation.html)
- NIST SP 800-88 Rev. 2: [NIST की घोषणा, सितंबर 2025](https://www.nist.gov/news-events/news/2025/09/guidelines-media-sanitization-nist-publishes-sp-800-88r2)
- H100 confidential computing का डिज़ाइन: [NVIDIA, Confidential Computing on H100 GPUs for Secure and Trustworthy AI](https://developer.nvidia.com/blog/confidential-computing-on-h100-gpus-for-secure-and-trustworthy-ai/); सबके लिए उपलब्धता: [NVIDIA, अप्रैल 2024](https://developer.nvidia.com/blog/announcing-confidential-computing-general-access-on-nvidia-h100-tensor-core-gpus/)
- Azure: [NCCads H100 v5 series](https://learn.microsoft.com/en-us/azure/virtual-machines/sizes/gpu-accelerated/nccadsh100v5-series)
- Google Cloud: [Confidential VM के supported configurations](https://docs.cloud.google.com/confidential-computing/confidential-vm/docs/supported-configurations), [GPU के साथ Confidential VM instance बनाना](https://docs.cloud.google.com/confidential-computing/confidential-vm/docs/create-a-confidential-vm-instance-with-gpu)
- GDPR Article 28: [gdpr-info.eu](https://gdpr-info.eu/art-28-gdpr/)
- HIPAA और cloud providers: [HHS, HIPAA और cloud computing पर guidance](https://www.hhs.gov/hipaa/for-professionals/special-topics/health-information-technology/cloud-computing/index.html)
- GPUFlow: [API quickstart](https://docs.gpuflow.app/hi/renters/api-quickstart/), [किरायेदार कहाँ तक पहुँच सकते हैं और कहाँ नहीं](https://docs.gpuflow.app/hi/providers/security/), [शर्तें](https://gpuflow.app/hi/terms), [Privacy policy](https://gpuflow.app/hi/privacy)

सभी की जाँच सितंबर 2026 में की गई।
