---
title: "在租用的 GPU 上私密微調 LLM：實務指南"
description: "什麼時候微調勝過 RAG 或提示詞、各模型大小的 QLoRA VRAM 需求、TRL、Unsloth 與 Axolotl、在租用 GPU 上保護資料隱私、成本與部署。"
excerpt: "用 QLoRA 微調 8B 開放模型，一張租來的 24 GB GPU 就夠，每次約 $0.35 到 $0.83。付錢之前，先確認微調是正確的工具，並規劃好資料放在別人的機器上時如何確保仍屬於您。"
pubDate: 2025-02-23
updatedDate: 2026-09-30
locale: "zh_tw"
category: "tutorials"
featured: false
draft: false
author: "GPUFlow Team"
heroImage: "../_images/private-llm-fine-tuning-guide-hero.png"
heroImageAlt: "示意圖：一份私有資料集在租用的 GPU 伺服器上用來微調語言模型"
faq:
  - question: "微調 7B 或 8B 模型需要多少 VRAM？"
    answer: "使用 QLoRA 時，Unsloth 的需求表列出 7B 模型約 5 GB、8B 模型約 6 GB；一般 16-bit LoRA 則分別約 19 GB 和 22 GB。實際訓練時，較長的序列和較大的批次需要額外空間，所以 RTX 3090 或 4090 這類 24 GB 顯示卡是比較寬裕的選擇。"
  - question: "該微調還是用 RAG？"
    answer: "模型需要您文件中的事實，尤其是會變動的事實時，用 RAG。Ovadia 等人 2024 年的研究發現，在注入知識這件事上，RAG 一貫勝過非監督式微調。需要提示詞無法穩定做到的固定格式、語氣或特定任務行為時，才微調。"
  - question: "在租用的 GPU 上微調 LLM 要花多少錢？"
    answer: "用 2,000 筆範例對 8B 模型跑一次 QLoRA，含準備約一個多小時：在每小時 $0.31 的 Vast.ai RTX 4090 上約 $0.35，以 RunPod 每小時 $0.74 的牌價則是 $0.83（2026 年 9 月）。20,000 筆範例約需四小時，也就是 $1.24 到 $2.97。"
  - question: "GPU 主機方看得到我的訓練資料嗎？"
    answer: "硬體是主機方的，所以請假設他們看得到。容器隔離保護的是您不受其他租用者影響，而不是不受機器擁有者影響。敏感資料請使用經過審核的資料中心主機（Vast.ai Secure Cloud、RunPod Secure Cloud），上傳前移除個人資料，完成後刪除執行個體。"
  - question: "LoRA 和 QLoRA 有什麼不同？"
    answer: "LoRA 凍結基礎模型，只訓練小型的轉接器矩陣。QLoRA 做法相同，但以 4-bit NF4 精度載入凍結的基礎模型；原始論文靠這一點省下足夠的記憶體，在一張 48 GB GPU 上微調了 65B 模型。"
  - question: "可以在 GPUFlow 上微調或上傳我的模型嗎？"
    answer: "不行。GPUFlow 只做推論：您租用的是一個相容 OpenAI 的聊天 API，使用的是提供者安裝在自己機器上的模型，通常透過 Ollama。沒有 shell，也不能存取檔案，所以無法在上面訓練，也無法上傳自己的模型。"
---

您可以用 QLoRA，在一張租來的 24 GB GPU 上用自己的資料微調一個 8B 開放權重模型，一般一次訓練花不到一美元。比較難的問題要先回答：微調到底是不是正確的解法（如果是事實，通常檢索比較好），以及資料放在別人擁有的機器上時，如何保持私密。

本指南兩者都會談，接著是各模型大小需要的 VRAM、目前的工具、一份可用的訓練腳本、成本試算，以及如何部署成果。所有內容都在 2026 年 9 月查核過，來源列在文末。

## 微調、RAG 還是改進提示詞

微調改變的是模型的行為，用來教它事實效果很差。Ovadia 等人比較了兩者注入知識的效果，發現 RAG「一貫勝過」非監督式微調，「無論是訓練中接觸過的既有知識，還是全新的知識」。他們的結論是：LLM 很難透過微調學會新的事實。

所以在租任何東西之前，先走一遍這個決策樹：

<figure>
<svg viewBox="0 0 720 420" role="img" aria-labelledby="d1-title" xmlns="http://www.w3.org/2000/svg" font-family="system-ui, sans-serif" font-size="15">
<title id="d1-title">在檢索、改進提示詞、微調或更大模型之間做選擇的決策樹</title>
<defs><marker id="d1-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#64748b"/></marker></defs>
<rect width="720" height="420" fill="#ffffff"/>
<rect x="60" y="15" width="280" height="40" rx="8" fill="#1e1b4b"/>
<text x="200" y="40" text-anchor="middle" fill="#ffffff">回答的品質不夠好</text>
<line x1="200" y1="55" x2="200" y2="83" stroke="#64748b" stroke-width="2" marker-end="url(#d1-arrow)"/>
<rect x="20" y="85" width="360" height="50" rx="8" fill="#ffffff" stroke="#f97316" stroke-width="2"/>
<text x="200" y="115" text-anchor="middle" fill="#1e1b4b">缺少事實，或資料會變動？</text>
<rect x="440" y="80" width="260" height="60" rx="10" fill="#f0fdf4" stroke="#16a34a" stroke-width="2"/>
<text x="570" y="105" text-anchor="middle" fill="#1e1b4b" font-weight="600">使用 RAG</text>
<text x="570" y="126" text-anchor="middle" fill="#64748b" font-size="13">每次請求時查詢您的文件</text>
<line x1="380" y1="110" x2="438" y2="110" stroke="#64748b" stroke-width="2" marker-end="url(#d1-arrow)"/>
<text x="409" y="102" text-anchor="middle" fill="#16a34a" font-size="13">是</text>
<line x1="200" y1="135" x2="200" y2="173" stroke="#64748b" stroke-width="2" marker-end="url(#d1-arrow)"/>
<text x="215" y="160" fill="#64748b" font-size="13">否</text>
<rect x="20" y="175" width="360" height="50" rx="8" fill="#ffffff" stroke="#f97316" stroke-width="2"/>
<text x="200" y="205" text-anchor="middle" fill="#1e1b4b">指示和範例能解決嗎？</text>
<rect x="440" y="170" width="260" height="60" rx="10" fill="#f0fdf4" stroke="#16a34a" stroke-width="2"/>
<text x="570" y="195" text-anchor="middle" fill="#1e1b4b" font-weight="600">改進提示詞</text>
<text x="570" y="216" text-anchor="middle" fill="#64748b" font-size="13">系統提示詞、few-shot 範例</text>
<line x1="380" y1="200" x2="438" y2="200" stroke="#64748b" stroke-width="2" marker-end="url(#d1-arrow)"/>
<text x="409" y="192" text-anchor="middle" fill="#16a34a" font-size="13">是</text>
<line x1="200" y1="225" x2="200" y2="263" stroke="#64748b" stroke-width="2" marker-end="url(#d1-arrow)"/>
<text x="215" y="250" fill="#64748b" font-size="13">否</text>
<rect x="20" y="265" width="360" height="50" rx="8" fill="#ffffff" stroke="#f97316" stroke-width="2"/>
<text x="200" y="295" text-anchor="middle" fill="#1e1b4b">需要固定的格式、語氣或技能？</text>
<rect x="440" y="260" width="260" height="60" rx="10" fill="#eef2ff" stroke="#6366f1" stroke-width="2"/>
<text x="570" y="285" text-anchor="middle" fill="#1e1b4b" font-weight="600">用 QLoRA 微調</text>
<text x="570" y="306" text-anchor="middle" fill="#64748b" font-size="13">數百筆優質範例</text>
<line x1="380" y1="290" x2="438" y2="290" stroke="#64748b" stroke-width="2" marker-end="url(#d1-arrow)"/>
<text x="409" y="282" text-anchor="middle" fill="#16a34a" font-size="13">是</text>
<line x1="200" y1="315" x2="200" y2="353" stroke="#64748b" stroke-width="2" marker-end="url(#d1-arrow)"/>
<text x="215" y="340" fill="#64748b" font-size="13">否</text>
<rect x="60" y="355" width="280" height="50" rx="10" fill="#f8fafc" stroke="#64748b" stroke-width="2"/>
<text x="200" y="385" text-anchor="middle" fill="#1e1b4b">試試更大的基礎模型</text>
<text x="570" y="370" text-anchor="middle" fill="#64748b" font-size="13">RAG 和微調可以搭配使用：</text>
<text x="570" y="390" text-anchor="middle" fill="#64748b" font-size="13">用微調調行為，用檢索查事實</text>
</svg>
<figcaption>大多數「模型不懂我們的東西」的問題，其實是檢索問題。當您每次都需要同樣的行為時，微調才值得它的成本：一個 JSON schema、一種公司內部的寫作風格、一套分類方式。</figcaption>
</figure>

值得微調的理由：

- **嚴格的輸出格式。** 每次呼叫都把欄位擷取成您的 schema，不必在每個提示詞裡放一整頁指示。
- **風格和語氣。** 聽起來像您團隊寫的客服回覆，或結構固定的報告。
- **讓小模型做一件特定的事。** 一個調校過的 8B 模型，可以在單一工作上取代大型通用模型；如果您要在便宜的硬體上部署，這點很重要。
- **更短的提示詞。** 已經學進權重裡的行為，不需要在每個請求中重複。

## LoRA 和 QLoRA

完整微調會更新每一個權重，所以 GPU 除了模型本身，還要存放所有權重的梯度和最佳化器狀態。LoRA 凍結基礎模型，在各層旁邊訓練小型的低秩矩陣；原始論文指出，和用 Adam 完整微調 GPT-3 175B 相比，可訓練參數少了 10,000 倍，GPU 記憶體少了 3 倍。

QLoRA 更進一步：凍結的基礎模型以 4-bit NF4 精度載入，只有轉接器以 16-bit 訓練。Dettmers 等人用它在單張 48 GB GPU 上微調 65B 模型，「同時保有完整 16-bit 微調的任務表現」。這篇論文加入了三項至今仍被各工具使用的技術：NF4 資料型別、對量化常數再做一次量化（double quantization），以及吸收記憶體尖峰的分頁最佳化器（paged optimizers）。

兩者的產物都是一個轉接器（adapter），也就是一個裝著幾個張量的資料夾，套用在未更動的基礎模型上。您可以讓它保持獨立，也可以合併進權重。

## 需要多少 VRAM

Unsloth 公布了一張依模型大小列出微調最低 VRAM 的表格。以下是它的數字，已包含它的記憶體最佳化；一般的 Hugging Face 訓練需要更多，而較長的序列或較大的批次會讓每一列都往上加。

| 模型大小 | QLoRA（4-bit） | LoRA（16-bit） | 可寬裕跑 QLoRA 的租用顯示卡 |
| --- | --- | --- | --- |
| 3B | 3.5 GB | 8 GB | 任何 12 GB 以上的顯示卡 |
| 8B | 6 GB | 22 GB | RTX 3090 / 4090（24 GB） |
| 14B | 8.5 GB | 33 GB | RTX 3090 / 4090（24 GB） |
| 32B | 26 GB | 76 GB | 48 GB 顯示卡（RTX A6000、A40、L40S） |
| 70B | 41 GB | 164 GB | 80 GB 顯示卡（A100、H100） |

<figure>
<svg viewBox="0 0 720 320" role="img" aria-labelledby="d2-title" xmlns="http://www.w3.org/2000/svg" font-family="system-ui, sans-serif" font-size="15">
<title id="d2-title">8B、14B、32B 和 70B 模型以 QLoRA 和 16-bit LoRA 微調所需最低 VRAM 的長條圖，對照 24、48 和 80 GB 顯示卡</title>
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
<text x="420" y="306" text-anchor="middle" fill="#64748b" font-size="13">最低 VRAM，單位 GB（Unsloth 需求表）</text>
</svg>
<figcaption>正是 QLoRA 讓租來的消費級顯示卡派得上用場：14B 以下放進 24 GB 顯示卡還綽綽有餘，32B 需要 48 GB 顯示卡，70B 需要 80 GB。不用 4-bit 載入的話，連 8B 都只能勉強塞進 24 GB。</figcaption>
</figure>

我的預設選擇是在 RTX 4090 上跑 8B 或 14B 模型。這是最便宜、又還能容納 2,048 token 序列和合理批次大小的租用顯示卡，而這個範圍的模型之後也容易部署。要依部署時的 VRAM 挑選基礎模型，請看[哪些 AI 模型放得進您 GPU 的 VRAM](/zh_tw/which-ai-models-fit-your-gpu-vram/)。

## 選擇工具：TRL、Unsloth 或 Axolotl

三者都是開源的，也都支援 LoRA 和 QLoRA。

| 工具 | 使用方式 | 優點 | 注意事項 |
| --- | --- | --- | --- |
| Hugging Face TRL + PEFT | Python（`SFTTrainer`） | 參考實作；同一套 API 還支援 DPO、GRPO 等 | 同樣的訓練，記憶體用量比 Unsloth 多 |
| Unsloth | Python，或 Unsloth Studio 網頁介面 | 宣稱快 2 倍、VRAM 少 70%；可直接匯出成 GGUF | Studio 介面採用 AGPL-3.0（核心為 Apache 2.0） |
| Axolotl | 一個 YAML 檔，`axolotl train config.yml` | 多 GPU（FSDP、DeepSpeed）、大量現成設定 | 需要 Python 3.11 以上和 PyTorch 2.11 以上 |

截至 2026 年 9 月，TRL 是 1.14 版，PEFT 是 0.21 版。Unsloth 需要 Python 3.11 到 3.13，以及 CUDA 運算能力 7.0 以上的 NVIDIA GPU（V100、T4、RTX 20 系列及更新）。Axolotl 建議使用 Python 3.12 和 PyTorch 2.12.1。

想弄懂每一行，用 TRL；VRAM 不夠，或想一行指令匯出 GGUF，用 Unsloth；要用不同設定反覆訓練，或要擴展到多張 GPU，用 Axolotl。下面的腳本用 TRL，因為這是能看見每個環節的最短路徑。

## 準備資料

TRL 的 `SFTTrainer` 讀取的對話格式，和聊天 API 請求的格式相同。在 `train.jsonl` 中每行一個 JSON 物件：

```json
{"messages": [{"role": "system", "content": "Extract the invoice fields as JSON."}, {"role": "user", "content": "Invoice 4471 from Norden AB, due 12 March, total 1,250 EUR"}, {"role": "assistant", "content": "{\"invoice_id\": \"4471\", \"supplier\": \"Norden AB\", \"due\": \"2026-03-12\", \"total\": 1250, \"currency\": \"EUR\"}"}]}
```

實務上的原則：

- **品質重於數量。** 幾百到幾千筆一致、正確的範例，勝過幾萬筆雜亂的範例。資料裡的每個錯誤，都是您花錢教給模型的行為。
- **與正式環境一致。** 使用您的應用程式實際會送出的系統提示詞和輸入格式。
- **保留 5% 到 10%。** 留下一些模型從未訓練過的範例，用來並排比較基礎模型和調校後的模型。
- **移除用不到的東西。** 姓名、電子郵件、帳號和各種 ID，很少能幫模型學會格式。在資料離開您的電腦之前，就換成擬真的佔位值。

最後一條原則不只和租來的機器有關。Carlini 等人從 GPT-2 中擷取出數百段逐字的訓練序列，包括姓名、電話號碼和電子郵件地址，其中有些只出現在一份訓練文件中。微調後的模型，可能會把訓練內容重複給之後使用它的任何人。

## 在租來的機器上保護資料隱私

在 GPU 市集上，電腦是別人的。Vast.ai 說得很直白：「客戶端被隔離在非特權 Docker 容器中，只能存取自己的資料」，以及「提供者的安全性差異很大」。這種隔離保護的是您不受其他租用者影響，卻擋不住能實際接觸主機、擁有 root 權限的那個人。

處理私密資料時：

1. **選擇經過審核的資料中心主機。** Vast.ai 的 Secure Cloud 提供者是「經過審核、具 ISO 27001 認證、符合 Tier 3/4 資料中心標準的資料中心」，Vast 也建議敏感工作使用它們。RunPod 的 Secure Cloud 在 T3/T4 資料中心執行；它的 Community Cloud 則是把您連到個別提供者。資料中心等級每小時比較貴，但在這裡值得。
2. **只上傳清理過的資料集**，透過 SSH（`rsync -avP` 或 `scp`）。不要途中先放到公開的儲存桶或分享連結上。
3. **日誌留在本機。** 在 TRL 1.14 中，`report_to` 預設為 `"none"`，所以除非您自己開啟，否則不會有任何東西送到實驗追蹤服務。用私密資料訓練的轉接器，不要呼叫 `push_to_hub`。
4. **先把結果取出，再刪除執行個體。** 下載轉接器和評估結果；如果用過權杖，登出 Hugging Face（`hf auth logout`）；然後刪除執行個體和所有磁碟區。在 Vast.ai 上，儲存空間會一直保留並計費，直到執行個體被刪除，只是停止並不夠。

在容器內刪除檔案，不能保證主機的磁碟會被清除，所以真正的保護是第 1 和第 2 步：選擇誰來保管硬體，並且盡可能少送資料給他們。更多細節請看[如何在公用 GPU 節點上保護資料集](/zh_tw/how-to-secure-dataset-on-public-gpu-node/)。如果您的政策禁止使用任何第三方硬體，同一份腳本也能在您自己的 24 GB 顯示卡上執行。

## 訓練：用 TRL 寫的 QLoRA 腳本

在一台裝有 RTX 3090 或 4090 的租用 Linux 機器上：

```bash
python -m venv venv && source venv/bin/activate
pip install torch trl peft bitsandbytes datasets
```

接著是 `train.py`，依照 TRL PEFT 文件中的 QLoRA 寫法。Qwen3-8B 採用 Apache 2.0，不需申請存取，所以不需要 Hugging Face 權杖：

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

重要的設定：

- **`learning_rate=2e-4`。** TRL 的文件建議 QLoRA 使用約一般微調 10 倍的學習率。如果訓練損失下降、評估損失卻上升，就是過擬合了：減少 epoch 數。
- **`r=16`、`target_modules="all-linear"`。** 每個線性層都加上轉接器，這也是 Unsloth 基準測試使用的設定。對格式和風格來說，rank 16 就夠了；較難的任務再調高。
- **`max_length=2048`。** 更長的範例會被截斷。請檢查您資料的 token 長度；上限越長，需要的 VRAM 越多。
- **有效批次大小 16**（4 × 4 個累積步驟）。如果記憶體不足，降低 `per_device_train_batch_size`、提高累積步數，讓乘積維持不變。

關掉機器之前，把保留的範例分別丟給基礎模型和調校後的模型，比較結果。只有這個測試能告訴您，這筆錢到底有沒有效果。

## 成本

訓練時間 = 總 token 數 ÷ 吞吐量。主機代管公司 GigaGPU 公布了在 RTX 4090 上以 QLoRA 訓練 Llama 3.1 8B 的實測數據：每秒約 3,500 個訓練 token。假設 Qwen3-8B 的速度差不多：

**小型訓練：** 2,000 筆範例 × 600 token × 3 個 epoch = 360 萬 token。3,600,000 ÷ 3,500 = 1,029 秒，約 17 分鐘。

| 步驟 | 時間 |
| --- | --- |
| 設定環境 | 10 分鐘 |
| 下載 Qwen3-8B（16.4 GB 權重）並上傳資料 | 10 分鐘 |
| 訓練 | 17 分鐘 |
| 用保留資料比較基礎模型和調校後的模型 | 15 分鐘 |
| 合併、匯出、下載、刪除執行個體 | 15 分鐘 |
| **合計** | **67 分鐘（1.12 小時）** |

- Vast.ai RTX 4090，每小時 $0.31：1.12 × $0.31 = **$0.35**
- RunPod RTX 4090，每小時 $0.74（價格頁面牌價）：1.12 × $0.74 = **$0.83**

**大型訓練：** 20,000 筆範例 × 1,000 token × 2 個 epoch = 4,000 萬 token ÷ 3,500 = 11,429 秒，約 3.2 小時。加上同樣 50 分鐘的額外時間，共 4.0 小時：Vast.ai 上 **$1.24**，RunPod 上 **$2.97**。

如果是 32B 模型，截至 2026 年 9 月，RunPod 上的 48 GB 顯示卡價格為每小時 $0.49（A40）、$0.53（RTX A6000）和 $1.09（L40S）。我手上沒有這些顯示卡跑 32B QLoRA 的公開吞吐量數據，所以請先跑 50 步，從日誌讀出每步時間，做同樣的乘法，再決定要不要跑長時間的訓練。

價格是 2026 年 9 月 RunPod 價格頁面，以及 getdeploying.com 對 Vast.ai 的追蹤數據。Secure／資料中心等級比最便宜的社群報價貴。更完整的比較請看 [GPU 租用價格比較](/zh_tw/gpu-rental-pricing-comparison-2026/)。

## 部署成果

有兩種做法：讓轉接器保持獨立，或把它合併進模型。

**用 vLLM 保持獨立。** vLLM 會在基礎模型旁載入 LoRA 轉接器，並在它相容 OpenAI 的伺服器上，把每個轉接器公開成一個模型名稱：

```bash
vllm serve Qwen/Qwen3-8B --enable-lora --lora-modules invoices=./out/adapter
```

之後用戶端送出 `"model": "invoices"` 即可。多個轉接器可以在同一張 GPU 上共用一個基礎模型。

**合併後在 Ollama 中執行。** 把轉接器合併進全精度權重，用 llama.cpp 轉成 GGUF、量化，再匯入：

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

Unsloth 用一次呼叫就能完成合併和 GGUF 匯出（`model.save_pretrained_gguf("dir", tokenizer, quantization_method="q4_k_m")`）。它的文件提醒，匯出後回答變差，最常見的原因是聊天範本用錯了：部署時請使用訓練時的範本。Ollama、vLLM 和 TGI 之間的取捨，請看[我們的 RTX 4090 推論基準測試](/zh_tw/ollama-vs-vllm-vs-tgi-rtx-4090-benchmark/)。

### GPUFlow 能幫上什麼

GPUFlow 無法進行訓練：它出租的是在提供者 GPU 上執行、相容 OpenAI 的 API，沒有 shell、SSH 或檔案存取。它也無法部署您微調過的模型。租用者不能上傳模型；可用的模型是各提供者自己安裝的（通常透過 Ollama），例如 `qwen2.5:7b` 或 `llama3.1:8b`。

它能幫上忙的，是這一切之前的那一步：花幾美分確認一個現成的開放模型，搭配好的提示詞，是不是已經能完成工作，這也是決策樹中最便宜的結果。這一步請用測試資料，不要用本指南所談的私密資料：租用期間，提示詞和回答會以明文經過提供者的機器。運作方式請看 [API 快速入門](https://docs.gpuflow.app/zh-tw/renters/api-quickstart/)，而[在應用程式中使用金鑰](/zh_tw/use-openai-compatible-api-key-in-apps/)說明了如何把它接到現有的工具。

## 來源

全部於 2026 年 9 月查核。

- 論文：[Hu 等人，LoRA](https://arxiv.org/abs/2106.09685)；[Dettmers 等人，QLoRA](https://arxiv.org/abs/2305.14314)；[Ovadia 等人，Fine-Tuning or Retrieval?](https://arxiv.org/abs/2312.05934)；[Carlini 等人，Extracting Training Data from Large Language Models](https://arxiv.org/abs/2012.07805)
- Hugging Face TRL：[SFT Trainer](https://huggingface.co/docs/trl/sft_trainer)、[PEFT 整合與 QLoRA](https://huggingface.co/docs/trl/peft_integration)
- Unsloth：[需求與 VRAM 表](https://unsloth.ai/docs/get-started/fine-tuning-for-beginners/unsloth-requirements.md)、[基準測試](https://unsloth.ai/docs/basics/unsloth-benchmarks.md)、[儲存為 GGUF](https://unsloth.ai/docs/basics/inference-and-deployment/saving-to-gguf.md)、[GitHub](https://github.com/unslothai/unsloth)
- [GitHub 上的 Axolotl](https://github.com/axolotl-ai-cloud/axolotl)
- 模型：[Qwen3-8B 模型卡](https://huggingface.co/Qwen/Qwen3-8B)
- 訓練吞吐量：[GigaGPU，在 RTX 4090 上微調](https://gigagpu.com/rtx-4090-fine-tuning-guide/)
- 主機與安全：[Vast.ai 安全性常見問題](https://docs.vast.ai/documentation/reference/faq/security)、[Vast.ai 價格](https://docs.vast.ai/guides/instances/pricing.md)、[RunPod Pods 概覽](https://docs.runpod.io/pods/overview)
- 價格：[RunPod 價格](https://www.runpod.io/pricing)，以及 getdeploying.com 上的 [Vast.ai](https://getdeploying.com/vast-ai) 和 [RTX 4090](https://getdeploying.com/reference/cloud-gpu/nvidia-rtx-4090)
- 部署：[vLLM LoRA 轉接器](https://docs.vllm.ai/en/latest/features/lora.html)、[llama.cpp quantize](https://github.com/ggml-org/llama.cpp/blob/master/tools/quantize/README.md)、[Ollama 匯入](https://docs.ollama.com/import)
- GPUFlow：[API 快速入門](https://docs.gpuflow.app/zh-tw/renters/api-quickstart/)
