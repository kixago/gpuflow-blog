---
title: "在租用 GPU 上私密微調 LLM 的完整指南"
description: "用自己的資料集，在租用 GPU 上微調開放權重語言模型的完整教學。守住資料安全、降低運算成本，也不被單一廠商綁住。"
excerpt: "了解如何在租用 GPU 上微調開放權重 LLM，同時把資料掌握在自己手中。逐步說明安全的資料傳輸、QLoRA 訓練，以及訓練後的環境清理。"
pubDate: 2025-02-23
updatedDate: 2026-09-29
locale: "zh_tw"
category: "tutorials"
featured: false
draft: false
author: "GPUFlow Team"
heroImage: "../_images/secure-server-room-abstract.png"
heroImageAlt: "以藍色燈光呈現安全機房處理 AI 資料的抽象示意圖"
faq:
  - question: "單張 RTX 4090 能微調大型語言模型嗎？"
    answer: "可以。使用 QLoRA（Quantized Low-Rank Adaptation）時，最多 8B 參數的模型都能輕鬆放進 24GB VRAM。本教學會具體說明如何針對消費級硬體設定訓練腳本，包括 batch size、序列長度與 LoRA rank 等參數。"
  - question: "我的資料集放在租用 GPU 上安全嗎？"
    answer: "資料集安不安全，取決於你的操作習慣。本指南說明如何透過 SCP 加密傳輸、避免經過 S3 或 Google Drive 這類雲端儲存中繼，以及在訓練結束後清理遠端機器。請記得這台機器屬於別人，結束租用前務必刪除所有東西。"
  - question: "在租用 GPU 上微調 8B 模型要花多少錢？"
    answer: "用租來的 RTX 4090 微調 8B 參數模型，一次典型的訓練大約花費三到八美元，實際金額取決於資料集大小與訓練 epoch 數。"
  - question: "租用 GPU 算力來訓練，需要驗證身分嗎？"
    answer: "通常不需要。Vast.ai 和 RunPod 這類市集只要求電子郵件地址和預付儲值，不需要身分證件。RunPod 只有在第一次用加密貨幣付款前才會要求 KYC。AWS 的新帳號 GPU 配額預設為零，必須另外申請。"
  - question: "訓練腳本需要什麼格式的資料集？"
    answer: "腳本需要 JSONL 檔案，每一行是一個含有 text 欄位的 JSON 物件。text 欄位應包含指令、輸入與回應，以換行字元組成單一字串。本指南的步驟 4 提供了格式正確的範例。"
  - question: "這份教學適用於 Llama 以外的模型嗎？"
    answer: "適用。這套流程適用於任何開放權重模型，包括 Mistral、Qwen、Falcon 等。範例程式碼使用 Llama-3.1-8B，但只要更換模型識別名稱，就能微調其他基礎模型。"
  - question: "微調 8B 參數模型需要多久？"
    answer: "訓練時間取決於資料集大小。1,000 筆範例的典型訓練在 RTX 4090 上約 30 到 60 分鐘完成。更大的資料集大致呈線性增加，10,000 筆範例需要 5 到 10 小時的運算時間。"
  - question: "訓練完成後，遠端機器該怎麼處理？"
    answer: "你必須清理環境：刪除資料集、訓練程式碼、Hugging Face 快取與 bash 歷史紀錄。本指南提供具體的安全刪除指令，並可選擇在結束租用前用 shred 徹底銷毀檔案。"
---

如果你正在讀這篇文章，你手上很可能有一份不能、或不願意上傳到 OpenAI 的資料集。

有這種顧慮的不只你一個。對許多企業和獨立開發者來說，ChatGPT 再方便，也抵不過資料外洩這個無法接受的風險。無論你處理的是受 HIPAA 規範的醫療紀錄、代表多年工程投入的專有程式碼，還是足以影響市場的敏感財務模型，使用雲端 AI 往往就代表要把最有價值的智慧財產交給第三方。

當這個第三方是一家曾經拿客戶資料訓練新模型的科技巨頭時，「信任」兩個字就顯得很尷尬。

解決之道不是放棄 AI，而是自己掌握基礎設施。

在自己能掌控的硬體上微調開放權重模型，早已不是學術圈的小眾研究，而是重視隱私的組織必須具備的能力。Llama、Mistral、Qwen 以及其他數十種模型都可以商用，不用付 API 費用，也不必分享資料。真正的難題一直是算力。購買 NVIDIA H100 叢集需要數百萬的資本支出；向 AWS 租用則要驗證身分、簽企業合約，而且時薪高到讓長時間的訓練貴得難以負擔。

這份指南提供第三條路。你將學會如何在 GPU 市集上租一張 GPU 來微調開放權重語言模型，這些硬體通常屬於世界各地的個人。內容涵蓋環境建置、在公用節點上作業時的安全規範，以及完整的訓練流程。

範例程式碼以 Llama-3.1-8B 作為具體的參考，但這套流程對任何相容 Hugging Face 的模型都一樣適用。只要換掉模型識別名稱，就能微調 Mistral-7B、Qwen2-7B，或任何符合你需求的開放權重模型。

整個過程不需要簽長期合約，費用也只有傳統雲端服務商的一小部分。

![終端機視窗顯示已連上遠端 GPU 伺服器的 SSH 連線](../_images/terminal-ssh-connection.png)

## 私密微調的成本結構

在進入技術細節之前，先把財務背景講清楚。

在 AWS 上訓練模型，代表要用大型執行個體，還要申請配額。p4d.24xlarge 執行個體（8 張 A100 GPU）每小時 $32.77，而且新的 AWS 帳號 GPU 配額預設為零。

在 GPU 市集上，你直接向硬體擁有者租用算力。這帶來幾個重要的差別：

**成本降低**：在市集上，RTX 4090 每小時的租金大約 $0.30 到 $0.46（2026 年 9 月）。使用 QLoRA 微調 8B 參數模型時，一張 24GB VRAM 的 4090 視資料集大小，兩到六小時就能完成一次微調。總運算成本在三到八美元之間。

**資料只待在一台機器上**：你透過 SSH 把資料集直接複製到租來的機器上，訓練、下載結果，然後刪除所有東西。沒有儲存桶，也沒有第三份副本。

**沒有人把關**：你不需要雲端服務商企業業務團隊的核准，也不用申請提高配額。儲值預付額度，然後租硬體就好。

做個比較：AWS 上單張 A10G（g5.xlarge，有 24GB VRAM 的最便宜選項）在 us-east-1 每小時約 $1.01。再加上申請配額、建置時間，以及設定環境時閒置的算力，第一次訓練的實際成本遠高於在市集上花的那幾美元。

這些成本細節在我們的 [GPU 租用價格比較](/zh_tw/gpu-rental-pricing-comparison-2026/)與[租用 GPU 的真實成本](/zh_tw/hidden-fees-in-gpu-rental/)中有詳細說明。

## 事前準備

本教學假設你熟悉 Linux 命令列。你不需要機器學習的研究所學位，但應該能自在地瀏覽檔案系統、編輯文字檔，並看懂錯誤訊息。

**硬體需求**：

- **GPU**：至少 24GB VRAM。RTX 3090、RTX 4090 和 A10G 都符合。70B 參數模型則需要 48GB 以上（A6000、兩張 A100 或 H100）。
- **系統記憶體**：32GB 以上。載入模型時，權重會先暫存在系統記憶體，再傳到 GPU。
- **儲存空間**：100GB 以上的 NVMe SSD 空間。Llama-3 8B 的基礎權重約占 16GB，資料集、檢查點和輸出的 adapter 還會再占用額外空間。

**關於模型選擇**：本教學以 Meta 的 Llama-3.1-8B 作為範例，
因為在 QLoRA 量化下，這是單張 24GB GPU 能容納的最大一級模型。
Llama 家族現在也包括 Llama 4 Scout 和 Maverick，但它們採用 Mixture of Experts 架構，
總參數分別為 109B 和 400B，需要多 GPU 配置，超出單一節點租用的範圍。
這裡介紹的流程同樣適用於 Mistral-7B、Qwen2-7B、Gemma-2-9B，
以及任何在你租用硬體 VRAM 限制內、相容 Hugging Face 的模型。
**軟體需求**：

- Python 3.10 或更新版本
- 基本的 PyTorch 使用能力
- Hugging Face 帳號（下載 Llama 這類需要同意授權條款的受限模型時必備）
- 一個已儲值預付額度的 GPU 市集帳號，而且該市集要能租用整台機器並提供 SSH 存取，例如 Vast.ai、RunPod 或 TensorDock

不確定該選哪個？請參考[租用 GPU 需要準備什麼](/zh_tw/what-you-need-to-rent-a-gpu/)以及 [GPUFlow vs Vast.ai vs RunPod vs SaladCloud](/zh_tw/gpuflow-vs-vast-ai-vs-runpod/)。請注意，GPUFlow 本身並不適合這份教學：它透過 API 提供 AI 模型的存取，而不是一台你能登入的機器。

## 步驟 1：取得並保護你的運算節點

第一步是取得硬體。在大型雲端平台上，這代表要建立帳號、申請 GPU 配額，然後等待核准。在市集上，流程直接得多。

打開你選擇的市集並儲值一些額度。介面會列出可用的機器，以及它們的規格、時薪和可靠度分數。

篩選符合以下條件的機器：

- **GPU**：RTX 4090（24GB VRAM）或 RTX 6000 Ada（48GB VRAM）
- **記憶體**：至少 32GB
- **儲存空間**：可用空間 100GB 以上
- **可靠度**：運作時間分數 95% 以上

選好機器後開始租用。選擇已經安裝好 CUDA 和 PyTorch 的映像檔，可以省下建置時間，而建置時間也是要計費的。

**在公用節點上的安全考量**：

在任何遠端網路上租用機器，你存取的都是陌生人擁有、實體上由對方掌控的硬體。虛擬化層確實提供了一定程度的隔離，但你仍然必須謹慎行事：

1. **不要把私密金鑰存放在遠端機器上**。其他系統的 SSH 金鑰、雲端憑證，以及正式環境服務的 API 權杖，都不應該出現在租用節點上。

2. **把檔案系統當成有敵意的環境**。假設你寫入磁碟的任何東西，在你中斷連線後理論上都可能被主機擁有者復原。我們會在步驟 6 說明安全刪除的程序。

3. **傳輸敏感資料時要加密**。我們會在步驟 3 處理這件事。

4. **不要重複使用密碼**。如果租用介面提供預設帳密，請立即變更，或產生新的 SSH 金鑰組。

租用確認後，控制台會提供連線資訊。你會拿到一行類似這樣的 SSH 指令：

```bash
ssh -p 22345 user@203.0.113.42
```

在本機終端機執行這個指令。出現提示時，接受主機金鑰指紋。現在你已經連上租來的 GPU 節點了。

確認硬體與你訂購的規格相符：

```bash
nvidia-smi
```

輸出應該會顯示你租用的 GPU、記憶體容量和已安裝的驅動程式版本。如果看不到 GPU，或規格與訂單不符，請立即中斷連線，並透過市集的客服回報問題。

## 步驟 2：環境設定

確認 SSH 連線正常之後，下一件事是建立乾淨的 Python 環境。大多數租用節點都預先裝好了 NVIDIA 驅動程式和 CUDA 工具包，但如果依賴主機系統層級的 Python 套件，很容易引發相依性衝突，讓你花上好幾個小時除錯。

我們會建立一個獨立的虛擬環境，確保結果可重現、執行穩定。

執行以下指令建立工作區：

```bash
mkdir ~/llama3-finetune
cd ~/llama3-finetune
python3 -m venv venv
source venv/bin/activate
```

終端機提示字元現在應該會顯示 `(venv)`，表示虛擬環境已啟用。之後安裝的所有套件都會留在這個目錄裡，不會動到主機系統。

安裝 Python 套件之前，先確認 CUDA 工具包可以使用：

```bash
nvcc --version
```

記下 CUDA 的版本號碼，之後要用它來確認與 PyTorch 相容。大多數租用節點執行的是 CUDA 11.8 或 12.1。如果找不到 `nvcc`，可能是 CUDA 工具包不在 PATH 中。通常載入對應的環境設定檔就能解決：

```bash
source /etc/profile.d/cuda.sh
```

如果這個檔案不存在，請查閱市集針對該節點配置的文件。

接著安裝 PyTorch 生態系。以下指令會安裝支援 CUDA 12.1 的 PyTorch。如果你的節點執行的是其他版本，請調整 CUDA 版本的後綴：

```bash
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121
```

然後安裝高效微調所需的函式庫。我們使用 Hugging Face 生態系，搭配負責量化的 bitsandbytes，以及負責參數高效訓練的 PEFT：

```bash
pip install transformers==4.40.0 datasets==2.19.0 peft==0.10.0 bitsandbytes==0.43.1 trl==0.8.6 accelerate==0.29.0
```

**鎖定版本很重要**。上面這些版本在撰文時都經過測試且彼此相容。Hugging Face 生態系更新得很快，不鎖定版本的安裝常常會帶來不相容的變更。如果遇到匯入錯誤或意料之外的行為，最可能的原因就是版本不符。

最後，登入 Hugging Face。Llama-3 的權重受授權協議限制，需要 Hugging Face 帳號才能下載。前往 [Meta Llama-3 儲存庫](https://huggingface.co)並接受授權條款，然後在 Hugging Face 的設定頁面產生存取權杖。

執行登入指令：

```bash
huggingface-cli login
```

出現提示時貼上你的存取權杖。權杖會儲存在 `~/.cache/huggingface/token`。現在你已經有權限把受限的模型權重直接下載到租用節點上了。

![終端機中顯示 Llama-3 模型設定參數的 Python 程式碼](../_images/python-llama3-config.png)

## 步驟 3：安全傳輸資料

這一節處理的，正是你選擇租機器而不是呼叫 API 的主要原因：資料主權。

標準的雲端流程是先把資料集上傳到儲存桶（S3、Google Cloud Storage、Azure Blob），再下載到運算執行個體。這種做法會在你無法掌控的多個系統中留下敏感資料的副本。儲存服務商能存取，運算服務商也能存取，而且雙方都會保留你的活動紀錄。

我們會用直接的加密傳輸，完全繞過這一步。

SSH 協定內建 `scp`（Secure Copy Protocol），透過你登入終端機時用的同一條加密通道傳輸檔案。資料直接從你的本機電腦送到租用節點，不經過任何中繼儲存空間。

在你的**本機電腦**上開一個**新的終端機視窗**，不要關閉原本連到租用節點的 SSH 工作階段。執行以下指令，並換成你實際的檔案路徑和連線資訊：

```bash
scp -P 22345 /path/to/your/dataset.jsonl user@203.0.113.42:~/llama3-finetune/
```

`-P` 旗標用來指定連接埠號碼（注意是大寫 P，跟 ssh 的小寫 `-p` 不同）。資料集很大的話，傳輸可能要花幾分鐘。畫面上會顯示已傳輸位元組數的進度。

**如果資料集超過 1GB**，可以考慮先壓縮再傳：

```bash
# On your local machine
gzip -k dataset.jsonl
scp -P 22345 dataset.jsonl.gz user@203.0.113.42:~/llama3-finetune/

# Then on the remote node
cd ~/llama3-finetune
gunzip dataset.jsonl.gz
```

**額外的安全措施**：

如果你的威脅模型包含技術高超的攻擊者，可以在傳輸前先用 GPG 或 age 加密資料集。這是縱深防禦：即使傳輸過程真的被攔截，內容也無法被讀取。

```bash
# On your local machine (using age encryption)
age -p dataset.jsonl > dataset.jsonl.age
scp -P 22345 dataset.jsonl.age user@203.0.113.42:~/llama3-finetune/

# On the remote node
age -d dataset.jsonl.age > dataset.jsonl
rm dataset.jsonl.age
```

對大多數使用者來說，標準的 SCP 傳輸已經提供足夠的保護。SSH 協定使用 AES-256 加密，主機金鑰驗證可以防止中間人攻擊，而且你的資料不會經過任何第三方儲存系統。

## 步驟 4：微調腳本

我們會使用 TRL（Transformer Reinforcement Learning）函式庫的 `SFTTrainer` 類別來執行監督式微調。這個函式庫把大量複雜細節包裝起來，同時仍保留足夠的設定彈性，能應付正式環境的工作負載。

撰寫訓練腳本之前，你必須先了解資料集應有的格式。

**資料集格式要求**：

腳本需要一個 JSONL（JSON Lines）檔案，每一行都是含有 `text` 欄位的合法 JSON 物件。`text` 欄位應包含完整的訓練範例，並組成單一字串。

以下是三行格式正確的範例：

```json
{"text": "### Instruction: Summarize the following legal clause in plain English.\n\n### Input: Party A shall indemnify, defend, and hold harmless Party B from any claims, damages, or expenses arising from Party A's negligence or willful misconduct.\n\n### Response: Party A agrees to protect Party B from any legal claims or costs that result from Party A's mistakes or intentional wrongdoing."}
{"text": "### Instruction: Extract the key financial metrics from this earnings report.\n\n### Input: Q3 revenue reached $4.2B, up 12% YoY. Operating margin improved to 23.5% from 21.2%. Free cash flow was $890M.\n\n### Response: Revenue: $4.2 billion (12% year-over-year growth). Operating margin: 23.5% (up from 21.2%). Free cash flow: $890 million."}
{"text": "### Instruction: Identify potential HIPAA violations in this process description.\n\n### Input: Patient records are emailed to the billing department as PDF attachments. The billing staff prints these for manual review and shreds them after processing.\n\n### Response: Potential violations include: unencrypted email transmission of PHI, physical documents that may be visible to unauthorized personnel during processing, and lack of documented chain of custody. Recommend encrypted file transfer and on-screen review only."}
```

**格式上的關鍵注意事項**：

1. 每個 JSON 物件必須剛好占一行，不能有跨行的 JSON。
2. `text` 欄位中的換行必須跳脫為 `\n`。
3. 文字中的引號必須跳脫為 `\"`。
4. 檔案必須使用 UTF-8 編碼。

如果你的原始資料是其他格式（CSV、Parquet、指令與回應分成不同欄位），就必須在傳輸前先預處理成這種結構。Python 的 `json` 函式庫會自動處理跳脫：

```python
import json

with open('dataset.jsonl', 'w') as f:
    for example in your_data:
        text = f"### Instruction: {example['instruction']}\n\n### Input: {example['input']}\n\n### Response: {example['output']}"
        f.write(json.dumps({"text": text}) + '\n')
```

資料集就位後，在遠端節點上建立訓練腳本：

```bash
cd ~/llama3-finetune
nano train.py
```

貼上以下設定。這個腳本使用 QLoRA，在 24GB GPU 的記憶體限制內微調 8B 參數模型。範例使用 Llama-3.1-8B，但你只要修改 MODEL_NAME 變數，就能換成任何相容的模型：

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

按 `Ctrl+O` 儲存檔案，再按 `Ctrl+X` 離開。

**認識幾個關鍵參數**：

- **LORA_RANK（r=16）**：控制微調後 adapter 的表達能力。數值越高學到的越多，但也需要更多記憶體。常見的數值介於 8 到 64 之間。

- **LORA_ALPHA（16）**：LoRA 權重的縮放係數。常見的經驗法則是設成與 rank 相同。

- **MAX_SEQ_LENGTH（512）**：訓練範例的最大 token 長度。序列越長，需要的記憶體越多。如果遇到 OOM 錯誤，先調低這個值。

- **BATCH_SIZE（4）**：同時處理的範例數量。記憶體不夠時，請降到 2 或 1。

- **target_modules**：注入 LoRA adapter 的特定層。對 Llama-3 來說，注意力投影層（q、k、v、o）的效果最好。

執行以下指令開始訓練：

```bash
python train.py
```

腳本會先下載基礎模型權重（8B 模型約 16GB）。這只會發生一次，之後的執行會使用快取的權重。載入完成後，你會看到訓練進度，每 10 步印出一次 loss 值。

## 步驟 5：監控訓練過程

訓練腳本執行時，你必須監控 GPU 的狀態。如果 VRAM 爆滿或溫度超過安全範圍，程序就會當掉，可能損毀你的檢查點，白白浪費租用時間。

在本機電腦上開第二個終端機視窗，再建立一條連到租用節點的 SSH 連線：

```bash
ssh -p 22345 user@203.0.113.42
```

執行以下指令，即時顯示 GPU 的統計資料：

```bash
watch -n 1 nvidia-smi
```

![終端機顯示 nvidia-smi 輸出，包含 GPU 記憶體用量與溫度統計](../_images/nvidia-smi-monitoring.png)

這個工具每秒更新一次，顯示記憶體用量、GPU 使用率和溫度。在 RTX 4090 上執行本指南的設定時，你應該會看到：

- **記憶體用量**：可用的 24GB 中使用 18GB 到 22GB
- **GPU 使用率**：訓練進行中為 90% 到 100%
- **溫度**：60°C 到 80°C，視主機的散熱方案而定

**常見問題排解**：

**記憶體接近 24GB**：如果記憶體用量一直頂到上限，請把訓練腳本中的 `BATCH_SIZE` 參數降到 2 或 1，或是把 `MAX_SEQ_LENGTH` 降到 256。不論改哪一項，都需要重新開始訓練。

**GPU 使用率接近 0%**：這通常代表資料載入出現瓶頸，CPU 餵資料給 GPU 的速度跟不上。在配備 NVMe 的節點上比較少見，但資料集非常大時仍可能發生。可以考慮在傳輸前，先把資料集預處理成更有效率的格式（Arrow/Parquet）。

**溫度超過 85°C**：有些主機把 GPU 放在通風不良的機殼裡。長時間高溫可能觸發降頻，拖慢訓練速度。如果溫度持續超過 85°C，可以考慮終止租用，改選其他節點。硬體損壞是主機擁有者的問題，但浪費的時間和損毀的檢查點是你的損失。

**解讀 loss 曲線**：

訓練腳本每 10 步輸出一次 loss 值。這個數字代表模型的預測有多「錯」，越低越好。你應該會觀察到：

- **初始 loss**：通常介於 1.5 到 3.0，視資料集而定
- **趨勢**：在前幾百步中穩定下降
- **最終 loss**：設定得當的訓練通常介於 0.5 到 1.5

如果 loss 一開始就停滯不動（100 步後仍未下降），學習率可能太低。如果 loss 劇烈震盪或不降反升，學習率就是太高。預設值 `2e-4` 對大多數資料集都很好用，但必要時仍可調整。

如果 loss 平穩下降後突然暴增到很高的數值（10 以上），資料集裡很可能有格式錯誤的範例。請停止訓練，檢查 JSONL 檔案有沒有編碼錯誤或沒有正確跳脫的字元，然後重新開始。

在 RTX 4090 上，1,000 筆範例的典型微調約 30 到 60 分鐘完成。更大的資料集大致呈線性增加，10,000 筆範例需要 5 到 10 小時。

## 步驟 6：取回模型並清理環境

訓練完成後，微調好的權重會以 LoRA adapter 的形式，存放在 `OUTPUT_NAME` 指定的目錄中。這個 adapter 很小，通常只有 100MB 到 500MB，相較之下完整的基礎模型有 16GB。

首先，確認 adapter 檔案存在：

```bash
ls -la ~/llama3-finetune/llama-3-8b-custom/
```

你應該會看到 `adapter_config.json`、`adapter_model.safetensors` 以及 tokenizer 相關檔案。

**不要在租用節點上合併 adapter**。合併是把 LoRA 權重和基礎模型結合，產生一個獨立的微調模型。這項操作需要把完整的 16-bit 基礎模型載入記憶體，可能超出 24GB 顯示卡的 VRAM。請在自己的基礎設施上合併，或者在推論時直接把 adapter 和基礎模型一起載入就好。PEFT 函式庫能順暢處理這件事：

```python
from peft import PeftModel
from transformers import AutoModelForCausalLM

base_model = AutoModelForCausalLM.from_pretrained(
    "meta-llama/Llama-3.1-8B",
    device_map="auto",
)
model = PeftModel.from_pretrained(base_model, "./llama-3-8b-custom")
```

要下載 adapter，請回到你的**本機終端機**（不是 SSH 工作階段）並執行：

```bash
scp -r -P 22345 user@203.0.113.42:~/llama3-finetune/llama-3-8b-custom ./
```

`-r` 旗標會遞迴複製整個目錄。比對本機與遠端的檔案大小是否一致，確認傳輸成功。

**清理遠端環境**：

這一步是專業人士和業餘玩家的分水嶺。你的租用節點上現在有專有的資料集、訓練程式碼和快取的模型權重。把這些東西留在你無法掌控的機器上，違反了最基本的作業安全原則。

回到租用節點的 SSH 工作階段，執行以下指令：

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

如果節點上有 `shred`，而且你想進一步確保刪除的檔案無法復原：

```bash
# Secure deletion (slower but more thorough)
find ~/llama3-finetune -type f -exec shred -u {} \;
rm -rf ~/llama3-finetune
```

中斷 SSH 工作階段：

```bash
exit
```

回到市集的控制台終止租用，包括任何儲存磁碟區，才不會繼續被收費。

## 用微調後的模型執行推論

adapter 下載到本機後，你就能在完全不依賴雲端的情況下執行推論。以下是一個最精簡的範例：

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

若要部署到正式環境，可以考慮用 FastAPI 或 Flask 包裝成 API，或透過 vLLM、Text Generation Inference（TGI）等推論伺服器部署。我們在 [RTX 4090 上的 Ollama vs vLLM vs TGI](/zh_tw/ollama-vs-vllm-vs-tgi-rtx-4090-benchmark/) 中比較了這幾種做法。

## 結論

你已經用專有資料微調了一個大型語言模型，而且資料只在一台機器上停留了盡可能短的時間。整個過程不需要簽企業合約，也沒有讓任何科技公司接觸你的智慧財產。

假設在每小時 $0.45 的 RTX 4090 上訓練兩小時，這次操作的總成本是九十美分。AWS 上單張 A10G 每小時約 $1.01，所以單看訓練本身，在那裡也不算貴。真正的差別在於配額申請和環境建置。

更重要的是，你的資料集從未經過任何儲存服務，而且在你完成後就已從租來的機器上刪除。

依賴閉源 API 的時代正在結束。需要隱私的組織、重視主權的研究人員，以及想要掌控權的開發者，現在都有了替代方案。租用 GPU 讓基礎設施、成本和資料重新回到他們手中。

你微調好的模型現在存放在你能掌控的硬體上。要怎麼部署、誰能存取、用在什麼用途，全都由你一個人決定。

---

## 延伸閱讀

這份指南介紹了私密微調 LLM 的核心流程。以下資源會更深入探討相關主題：

**了解成本**：

- [2026 GPU 租用價格比較](/zh_tw/gpu-rental-pricing-comparison-2026/)：各大市集與大型雲端的成本分析
- [租用 GPU 的真實成本](/zh_tw/hidden-fees-in-gpu-rental/)：價格頁面上不會寫出來的成本因素

**開始上手**：

- [2026 年租用 GPU 需要準備什麼](/zh_tw/what-you-need-to-rent-a-gpu/)：各平台的註冊、驗證與付款方式
- [如何在公用 GPU 節點上保護你的資料集](/zh_tw/how-to-secure-dataset-on-public-gpu-node/)：訓練前、訓練中與訓練後的安全做法

**比較選項**：

- [RunPod vs Vast.ai 比較](/zh_tw/runpod-vs-vastapi-comparison/)：兩大市集有哪些不同
- [GPUFlow vs Vast.ai vs RunPod vs SaladCloud](/zh_tw/gpuflow-vs-vast-ai-vs-runpod/)：整台機器、容器與 API 金鑰的比較
