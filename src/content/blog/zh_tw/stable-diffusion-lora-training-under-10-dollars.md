---
title: "用租來的 GPU 訓練 Stable Diffusion LoRA，花費不到 $10"
description: "在租用的 RTX 4090 上訓練 SDXL 或 Flux LoRA，花費遠低於 $10：依 VRAM 選 GPU、撰寫標註、sd-scripts 與 ai-toolkit 的設定，以及實際成本試算。"
excerpt: "2026 年 9 月，在租用的 RTX 4090 上跑一次 SDXL LoRA 訓練，大約 $0.35 到 $0.80。本文說明該選哪張 GPU、如何準備圖片和寫標註、確切的訓練指令，以及錢實際花在哪裡。"
pubDate: 2026-02-11
updatedDate: 2026-09-30
locale: "zh_tw"
category: "tutorials"
featured: false
draft: false
author: "GPUFlow Team"
heroImage: "../_images/stable-diffusion-lora-training-guide.jpg"
heroImageAlt: "一群人圍著大螢幕的插圖，螢幕上是 LoRA 網路示意圖，旁邊有伺服器機架，以及比較兩個訓練 epoch 範例圖片的面板"
faq:
  - question: "用租來的 GPU 訓練一個 LoRA 要花多少錢？"
    answer: "2026 年 9 月，RTX 4090 在 Vast.ai 上每小時約 $0.31，RunPod 價格頁面上則是每小時 $0.74。一次約 65 分鐘的 SDXL LoRA 訓練（含準備和測試），費用大約是 $0.34 到 $0.80。"
  - question: "訓練 SDXL LoRA 需要多少 VRAM？"
    answer: "sd-scripts 的文件說明，只要只訓練 U-Net、快取 latent 和文字編碼器輸出，並啟用 gradient checkpointing，8 GB 的 GPU 記憶體就能訓練 SDXL LoRA，建議 10 GB。RTX 3090 或 4090 這類 24 GB 的顯示卡，則能以 1024x1024 訓練，不必跟記憶體上限搏鬥。"
  - question: "RTX 4090 能訓練 Flux LoRA 嗎？"
    answer: "可以。ai-toolkit 附有針對 24 GB 顯示卡命名的 FLUX.1 範例設定，sd-scripts 則列出了利用 block swapping、低至 8 GB 的 FLUX.1 設定。Black Forest Labs 自己的指南表示，在 RTX 4090 上跑 1,800 步的 FLUX.2 [klein] LoRA 訓練不到一小時。"
  - question: "訓練一個 LoRA 需要幾張圖片？"
    answer: "針對一個角色、物品或風格，15 到 40 張好圖是常見的範圍；Black Forest Labs 建議 FLUX.2 [klein] 使用 15 到 40 張風格一致的圖片。清晰、多樣、標註完整的圖片，比數量多更重要。"
  - question: "LoRA 訓練用 kohya_ss、OneTrainer 還是 ai-toolkit 比較好？"
    answer: "三個都能用。kohya 的 sd-scripts 是命令列的標準工具，kohya_ss 在它上面加了網頁介面；OneTrainer 有桌面介面和內建的標註功能；ai-toolkit 有網頁介面、官方 RunPod 範本，而且很早就支援 FLUX.2 和 Qwen-Image 等新模型。"
  - question: "可以在 GPUFlow 上訓練 LoRA 嗎？"
    answer: "不行。GPUFlow 出租的是在提供者 GPU 上執行、相容 OpenAI 的聊天 API，沒有 shell、SSH 或檔案存取，所以無法在上面執行訓練腳本。請使用直接出租機器的平台，例如 Vast.ai 或 RunPod。"
---

在租來的 GPU 上訓練一個 SDXL 或小型 Flux 模型的 LoRA，花費遠低於 $10。2026 年 9 月，RTX 4090 在 Vast.ai 上每小時約 $0.31，在 RunPod 上每小時 $0.74，而一次 SDXL LoRA 訓練連同準備和測試，只要一個多小時。每次嘗試 $0.34 到 $0.80，$10 的預算夠您試十幾次。

難的不是錢，而是圖片、標註，以及知道什麼時候該停。本指南全部都會談到，指令可以直接貼上使用。價格和工具版本都在 2026 年 9 月查核過，來源列在文末。

## 五個步驟的工作流程

<figure>
<svg viewBox="0 0 720 250" role="img" aria-labelledby="d1-title" xmlns="http://www.w3.org/2000/svg" font-family="system-ui, sans-serif" font-size="15">
<title id="d1-title">LoRA 訓練工作流程：資料集、標註、訓練、測試、使用；結果不對時回到資料集</title>
<defs><marker id="d1-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#6366f1"/></marker></defs>
<rect width="720" height="250" fill="#ffffff"/>
<line x1="20" y1="40" x2="280" y2="40" stroke="#16a34a" stroke-width="2"/>
<text x="150" y="30" text-anchor="middle" fill="#16a34a" font-size="13">免費：在您自己的電腦上</text>
<line x1="300" y1="40" x2="560" y2="40" stroke="#f97316" stroke-width="2"/>
<text x="430" y="30" text-anchor="middle" fill="#f97316" font-size="13">計費：在租用的 GPU 上</text>
<rect x="20" y="60" width="120" height="70" rx="10" fill="#eef2ff" stroke="#6366f1" stroke-width="2"/>
<text x="80" y="90" text-anchor="middle" fill="#1e1b4b" font-weight="600">資料集</text>
<text x="80" y="112" text-anchor="middle" fill="#64748b" font-size="13">15–40 張圖片</text>
<rect x="160" y="60" width="120" height="70" rx="10" fill="#eef2ff" stroke="#6366f1" stroke-width="2"/>
<text x="220" y="90" text-anchor="middle" fill="#1e1b4b" font-weight="600">標註</text>
<text x="220" y="112" text-anchor="middle" fill="#64748b" font-size="13">每張一個 .txt</text>
<rect x="300" y="60" width="120" height="70" rx="10" fill="#eef2ff" stroke="#6366f1" stroke-width="2"/>
<text x="360" y="90" text-anchor="middle" fill="#1e1b4b" font-weight="600">訓練</text>
<text x="360" y="112" text-anchor="middle" fill="#64748b" font-size="13">sd-scripts</text>
<rect x="440" y="60" width="120" height="70" rx="10" fill="#eef2ff" stroke="#6366f1" stroke-width="2"/>
<text x="500" y="90" text-anchor="middle" fill="#1e1b4b" font-weight="600">測試</text>
<text x="500" y="112" text-anchor="middle" fill="#64748b" font-size="13">範例圖網格</text>
<rect x="580" y="60" width="120" height="70" rx="10" fill="#eef2ff" stroke="#6366f1" stroke-width="2"/>
<text x="640" y="90" text-anchor="middle" fill="#1e1b4b" font-weight="600">使用</text>
<text x="640" y="112" text-anchor="middle" fill="#64748b" font-size="13">ComfyUI、Forge</text>
<line x1="140" y1="95" x2="158" y2="95" stroke="#6366f1" stroke-width="2" marker-end="url(#d1-arrow)"/>
<line x1="280" y1="95" x2="298" y2="95" stroke="#6366f1" stroke-width="2" marker-end="url(#d1-arrow)"/>
<line x1="420" y1="95" x2="438" y2="95" stroke="#6366f1" stroke-width="2" marker-end="url(#d1-arrow)"/>
<line x1="560" y1="95" x2="578" y2="95" stroke="#6366f1" stroke-width="2" marker-end="url(#d1-arrow)"/>
<path d="M500,130 L500,180 L80,180 L80,134" fill="none" stroke="#f97316" stroke-width="2" stroke-dasharray="6 4" marker-end="url(#d1-arrow)"/>
<text x="290" y="205" text-anchor="middle" fill="#1e1b4b" font-size="13">結果不對？修正圖片或標註，再訓練一次</text>
<text x="360" y="235" text-anchor="middle" fill="#64748b" font-size="13">品質大多來自前兩個步驟，而它們不花一毛錢</text>
</svg>
<figcaption>租用之前先把資料集和標註做好。GPU 只在訓練和測試時計費，而結果不好時，通常要回頭改的是圖片，不是設定。</figcaption>
</figure>

## LoRA 是什麼，為什麼便宜

LoRA（Low-Rank Adaptation）會凍結基礎模型，在其中部分層旁邊訓練兩個小矩陣。原始論文指出，和完整微調 GPT-3 175B 相比，可訓練參數減少了 10,000 倍，GPU 記憶體減少了 3 倍。圖像模型也是同樣的道理：SDXL 基礎 checkpoint 是一個 6.9 GB 的檔案，而您訓練出的 LoRA 是一個獨立的小檔案，載入時疊在基礎模型上，強度可以自己調。

所以一張消費級 GPU 就夠用，一次訓練也只要幾十分鐘，而不是好幾天。

## 依 VRAM 選 GPU

VRAM 決定您能訓練什麼。速度決定一次訓練要計費幾分鐘，所以每小時較貴但較快的顯示卡，算到每次訓練的成本可能差不多。

| 模型系列 | 文件列出的最低需求 | 寬裕 | 說明 |
| --- | --- | --- | --- |
| SD 1.5 | 8 GB | 12 GB 以上 | 以 512x512 訓練，最便宜也最快 |
| SDXL | 8 GB（建議 10 GB） | 24 GB | 只訓練 U-Net，快取 latent 和文字編碼器輸出 |
| FLUX.1 [dev]（12B） | 8 GB，需大量 block swapping | 24 GB | sd-scripts 列出 24、16、12、10 和 8 GB 的設定 |
| FLUX.2 [klein] 4B/9B | 未說明 | 24 GB | BFL：bf16 權重約 13 GB，LoRA 訓練可在 24 GB 以內完成 |

低 VRAM 設定能用，但很慢。sd-scripts 是靠在 GPU 和系統記憶體之間搬移 transformer 區塊，才把 FLUX.1 塞進 8 到 16 GB，而每次搬移都要花時間，這些時間都要付錢。在租來的機器上，24 GB 的顯示卡是合理的預設選擇：RTX 3090 或 4090。RTX 5090（32 GB）也可以，但 sd-scripts 註明它需要 PyTorch 2.8.0 搭配 CUDA 12.8 或 12.9，所以請確認您的範本附帶的軟體版本夠新。

![一張 ASUS TUF 三風扇顯示卡，立在白色層架上](../_images/test-hero.jpg)

資料中心等級的顯示卡比較快，但 RunPod 上 A100 80 GB 每小時 $1.59，是 4090 的兩倍多。只用 20 或 30 張圖訓練 LoRA，多出來的速度很少能彌補這個價差；這類顯示卡比較適合大型資料集或完整微調。

## 去哪裡租，要花多少

您需要的是給您一台機器的平台：有 shell 或 Jupyter notebook、有磁碟，也有辦法把檔案傳進傳出。這類工作最常見的兩個選擇是 Vast.ai 和 RunPod。

| GPU | VRAM | Vast.ai（起價） | RunPod 價格頁面 | RunPod 追蹤到的最低價 |
| --- | --- | --- | --- | --- |
| RTX 3090 | 24 GB | 約 $0.11–0.13/小時 | $0.50/小時 | $0.22/小時 |
| RTX 4090 | 24 GB | 約 $0.31–0.33/小時 | $0.74/小時 | $0.34/小時 |
| RTX 5090 | 32 GB | 約 $0.41–0.47/小時 | $0.99/小時 | $0.69/小時 |

價格截至 2026 年 9 月。「Vast.ai（起價）」和「RunPod 追蹤到的最低價」來自 getdeploying.com 的價格追蹤，中間那欄是 RunPod 自己的價格頁面。Vast.ai 的價格由各主機自訂，所以您看到的報價會因地點和可靠度分數而不同。

兩者都按秒計費。額外費用則不同，而對一小時的工作來說，這些費用的影響比每小時價格看起來更大：

- **Vast.ai** 對儲存空間的計費是「只要執行個體存在，不論是否在執行」，頻寬則按位元組計費，費率由各主機自訂。在頻寬費高的主機上下載 7 GB 的基礎模型，費用會累積起來。用完請刪除執行個體，不要只是停止。
- **RunPod** 在執行期間對容器磁碟每 GB 每月收 $0.10，停止後不收；已停止的 volume 磁碟則是每 GB 每月 $0.20。資料傳入和傳出都不收費。

兩個平台都有現成的範本。ai-toolkit 的作者維護一個官方 RunPod 範本，kohya_ss 的 README 也把 RunPod 列為支援的環境。用範本可以省下十分鐘以上在計費時間內安裝 PyTorch 的工夫。更完整的價格比較，請看 [GPUFlow、Vast.ai、RunPod 與 SaladCloud 比較](/zh_tw/gpuflow-vs-vast-ai-vs-runpod/)和 [GPU 租用的隱藏成本](/zh_tw/hidden-fees-in-gpu-rental/)。

## 準備資料集和標註

這些都在您自己的電腦上做完，再去租機器。

### 圖片

- **數量。** 一個人物、物品或風格用 15 到 40 張。Black Forest Labs 建議 FLUX.2 [klein] 使用「15 到 40 張風格一致的圖片」。如果多出來的圖品質較差，多不代表好。
- **一致與多樣。** 每張圖都必須呈現這個概念，其他一切則要有變化：角度、光線、背景、構圖。如果產品的每張照片都放在同一張白桌上，LoRA 學到的會是那張桌子。
- **品質。** 清晰、曝光正確，沒有浮水印或文字疊加。雜訊和 JPEG 色塊，LoRA 也會學得一樣忠實。
- **解析度。** SDXL 和 Flux 的短邊至少 1024 像素，SD 1.5 至少 512。不必裁成正方形：啟用 bucketing 後，sd-scripts 會依長寬比將圖片分組。

### 標註

每張圖片都有一個同名的文字檔（`photo01.jpg`、`photo01.txt`）。標註告訴模型哪些東西已經用文字說明了，讓 LoRA 去學文字沒說明的部分。開頭放一個罕見的觸發詞，接著描述所有您希望之後還能改變的東西：

```text
zxq_mug, a ceramic coffee mug on a wooden desk, morning light from the left, shallow depth of field
```

有兩個工具可以幫您寫初稿：

- **WD14 tagger**，內建於 sd-scripts，會產生以逗號分隔的標籤。適合動漫風格的模型，以及用標籤訓練的 SDXL 微調模型：

  ```bash
  python finetune/tag_images_by_wd14_tagger.py --onnx \
    --repo_id SmilingWolf/wd-swinv2-tagger-v3 --batch_size 4 /workspace/dataset/img
  ```

- **JoyCaption** 是一個開放（Apache 2.0）的標註模型，專為訓練擴散模型打造，寫出來的是自然語言句子，比標籤更適合 Flux。它的 README 說明，以 bf16 執行約需 17 GB VRAM，另有 8-bit 和 4-bit 版本供較小的顯示卡使用。

OneTrainer 也內建 BLIP、BLIP2 和 WD-1.4 的標註功能。不管初稿是誰寫的，每一則標註都要讀過、修正。這是整個專案中最有價值的半小時。

## 選擇訓練工具

幾乎所有人都能在以下四個工具中找到合適的。全部免費且開源。

| 工具 | 介面 | 支援模型（2026 年 9 月） | 適合 |
| --- | --- | --- | --- |
| kohya-ss/sd-scripts | 命令列 | SD 1.x/2.x、SDXL、SD3/3.5、FLUX.1、Lumina、HunyuanImage-2.1、Anima | 可重現的訓練、完全掌控 |
| bmaltais/kohya_ss | 建立在 sd-scripts 上的網頁介面 | 同 sd-scripts | 想用 sd-scripts 又不想背參數 |
| Nerogar/OneTrainer | 桌面介面和 CLI | SD 1.5 到 3.5、SDXL、FLUX.1、FLUX.2、Chroma、Qwen Image 等 | 內建標註和遮罩功能 |
| ostris/ai-toolkit | 網頁介面和 YAML 設定檔 | SD 1.5、SDXL、FLUX.1、FLUX.2、Qwen-Image、Wan 影片等 | Flux 和較新的模型、RunPod 範本 |

sd-scripts 目前是 0.11.1 版（2026 年 6 月），以 Python 3.10 測試，需要 PyTorch 2.6.0 以上。ai-toolkit 建議使用 Python 3.12，目前安裝的是針對 CUDA 13.0 建置的 PyTorch 2.13.0。OneTrainer 需要 Python 3.10 到 3.13。

SDXL 我用 sd-scripts，因為整個設定就是那一行指令，每次訓練都容易重複和比較；Flux 則用 ai-toolkit。

## 用 sd-scripts 訓練 SDXL LoRA

在裝好 NVIDIA 驅動程式的全新 Linux 執行個體上，幾行指令就能設定完成：

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

用 `scp`、`rsync` 或平台的檔案瀏覽器，把圖片和 `.txt` 標註的資料夾複製到 `/workspace/dataset/img`。接著在 `/workspace/dataset.toml` 中描述資料集：

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

然後開始訓練：

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

`prompts.txt` 每行一個測試提示詞，並用 sd-scripts 的行內選項指定尺寸、種子和步數：

```text
zxq_mug, a ceramic coffee mug on a kitchen counter --w 1024 --h 1024 --d 42 --s 28
zxq_mug, a ceramic coffee mug held by a hiker on a mountain top --w 1024 --h 1024 --d 42 --s 28
```

### 各項設定的作用

- **步數。** 圖片數 × 重複次數 × epoch 數 ÷ 批次大小。25 張圖的話：25 × 10 × 8 = 2,000 步。
- **`network_dim` 16、`network_alpha` 8。** LoRA 的容量。一個物品或一張臉，16 就很夠；風格有時需要 32。rank 越高，越快過擬合，檔案也越大。
- **`--network_train_unet_only`。** 這裡是必要的：sd-scripts 不允許在訓練文字編碼器的同時快取文字編碼器輸出，而且它的文件本來就「強烈建議」SDXL LoRA 只訓練 U-Net。
- **快取和 gradient checkpointing。** 這兩項讓 SDXL 能塞進 8 到 10 GB。快取也會停用標註打亂（caption shuffling）和標註丟棄（caption dropout），所以資料集檔案裡沒有這兩項。
- **`learning_rate` 1e-4 搭配 AdamW8bit。** 這是 sd-scripts 自己的 SDXL LoRA 範例所用的值。如果四個 epoch 後範例圖幾乎沒變，試試 2e-4。如果範例圖變成訓練圖片的翻版，就調低，或提早停止。
- **每 2 個 epoch 存一次 checkpoint。** 您會得到第 2、4、6、8 個 epoch 的檔案，從中挑最好的。最好的 LoRA 常常不是最後一個。

### 要花多久

在一個 kohya_ss 的 issue 討論串中，使用者回報在 RTX 4090 上以 1024x1024、批次大小 1、啟用 gradient checkpointing 訓練 SDXL LoRA，速度約每秒 1.1 到 1.4 次迭代。以這個速度，2,000 步需要 24 到 30 分鐘，再加上快取 latent 的幾分鐘。同一個討論串也顯示，當顯示卡 VRAM 不足、溢出到共用記憶體時情況有多糟：每步 50 秒以上。如果您的速度遠低於預期範圍，先查看 `nvidia-smi`，再去懷疑設定。

## 用 ai-toolkit 訓練 Flux 和較新的模型

Flux 用 ai-toolkit 最簡單。在租來的機器上：

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

也可以用 `cd ui && npm run build_and_start` 啟動網頁介面，然後開啟 8675 連接埠。如果伺服器其他人也連得到，請照 README 的建議，先把 `AI_TOOLKIT_AUTH` 設成一組密碼。

挑選 Flux 模型前，授權方面有兩件事要知道：

- **FLUX.1 [dev]** 在 Hugging Face 上需要申請存取。您必須接受 FLUX.1 [dev] Non-Commercial License，並用 Hugging Face 的讀取權杖下載。它的模型卡說明，產生的圖片可以商用；但權重和您訓練的 LoRA 適用非商業授權。
- **FLUX.2 [klein] 4B** 採用 Apache 2.0，不需申請存取。9B 版本則採用 FLUX Non-Commercial License。

Black Forest Labs 在 2026 年 6 月發表了一份用 ai-toolkit 訓練 FLUX.2 [klein] LoRA 的指南：在 RTX 4090 上跑 1,800 步「不到一小時」，並建議查看第 750 到 1,500 步左右的 checkpoint。FLUX.1 [dev] 的大小是 klein 4B 的三倍，我還沒找到同樣可靠的公開時間數據；請預留更多時間，並實測您的第一次訓練。

## 停止付費前先測試 LoRA

趁機器還在執行時，查看每個已儲存 epoch 的範例圖。它們能免費告訴您，LoRA 是否學會了這個概念，以及從哪裡開始過擬合。接著下載您滿意的 checkpoint：

```bash
rsync -avP user@your-instance:/workspace/output/*.safetensors ./loras/
```

回到自己的電腦，把檔案放進 ComfyUI 的 `models/loras` 資料夾或 Forge 的 `models/Lora`，用固定的種子測試：

- **強度。** 試 0.6、0.8 和 1.0。有些 LoRA 在低於 1.0 時效果最好。
- **靈活度。** 把觸發詞放進訓練資料中沒有的場景：山頂上的馬克杯、畫作中的臉。如果只在和訓練圖片相似的場景中有效，就是過擬合了：改用較早的 epoch，或減少重複次數。
- **滲漏。** 不加觸發詞生成圖片。如果這個概念還是出現了，代表您的標註對圖片描述得不夠。

結果不對時，問題通常出在資料集：拿掉幾張較差的圖片，或在標註中寫出您希望能改變的東西。調整學習率是第二步，不是第一步。

## 實際成本試算

一個 SDXL LoRA，25 張圖，2,000 步，使用 RTX 4090：

| 步驟 | 時間 |
| --- | --- |
| 從範本啟動，安裝 sd-scripts | 10 分鐘 |
| 下載 SDXL 基礎模型、上傳資料集、快取 | 10 分鐘 |
| 訓練（2,000 步，每秒 1.1 到 1.4 次迭代） | 30 分鐘 |
| 查看範例圖、下載 checkpoint、刪除執行個體 | 15 分鐘 |
| **合計** | **65 分鐘（1.08 小時）** |

- Vast.ai，每小時 $0.31：1.08 × $0.31 = **$0.34**，另加儲存費和該主機的頻寬費率。
- RunPod，每小時 $0.74：1.08 × $0.74 = **$0.80**。那一小時的 50 GB 容器磁碟再加 50 × $0.10 ÷ 730 小時，不到 1 美分。

一個 FLUX.2 [klein] LoRA，訓練一小時，準備和測試 30 分鐘，在 RunPod 上是 1.5 × $0.74 = **$1.11**，在 Vast.ai 上是 1.5 × $0.31 = **$0.47**。

<figure>
<svg viewBox="0 0 720 300" role="img" aria-labelledby="d2-title" xmlns="http://www.w3.org/2000/svg" font-family="system-ui, sans-serif" font-size="15">
<title id="d2-title">在租用的 RTX 4090 上訓練 LoRA 的成本長條圖，與 10 美元預算比較</title>
<rect width="720" height="300" fill="#ffffff"/>
<line x1="230" y1="40" x2="230" y2="250" stroke="#e2e8f0" stroke-width="1"/>
<line x1="322" y1="40" x2="322" y2="250" stroke="#e2e8f0" stroke-width="1"/>
<line x1="414" y1="40" x2="414" y2="250" stroke="#e2e8f0" stroke-width="1"/>
<line x1="506" y1="40" x2="506" y2="250" stroke="#e2e8f0" stroke-width="1"/>
<line x1="598" y1="40" x2="598" y2="250" stroke="#e2e8f0" stroke-width="1"/>
<line x1="690" y1="30" x2="690" y2="250" stroke="#f97316" stroke-width="2" stroke-dasharray="6 4"/>
<text x="698" y="22" text-anchor="end" fill="#f97316" font-size="13">$10 預算</text>
<text x="220" y="75" text-anchor="end" fill="#1e1b4b">SDXL，Vast.ai</text>
<rect x="230" y="58" width="15.6" height="26" fill="#16a34a"/>
<text x="253" y="76" fill="#1e1b4b" font-size="13">$0.34</text>
<text x="220" y="125" text-anchor="end" fill="#1e1b4b">SDXL，RunPod</text>
<rect x="230" y="108" width="36.8" height="26" fill="#6366f1"/>
<text x="275" y="126" fill="#1e1b4b" font-size="13">$0.80</text>
<text x="220" y="175" text-anchor="end" fill="#1e1b4b">FLUX.2 klein，RunPod</text>
<rect x="230" y="158" width="51.1" height="26" fill="#6366f1"/>
<text x="289" y="176" fill="#1e1b4b" font-size="13">$1.11</text>
<text x="220" y="225" text-anchor="end" fill="#1e1b4b">5 次 SDXL，RunPod</text>
<rect x="230" y="208" width="184.5" height="26" fill="#6366f1"/>
<text x="422" y="226" fill="#1e1b4b" font-size="13">$4.01</text>
<line x1="230" y1="250" x2="690" y2="250" stroke="#64748b" stroke-width="1"/>
<text x="230" y="270" text-anchor="middle" fill="#64748b" font-size="13">$0</text>
<text x="322" y="270" text-anchor="middle" fill="#64748b" font-size="13">$2</text>
<text x="414" y="270" text-anchor="middle" fill="#64748b" font-size="13">$4</text>
<text x="506" y="270" text-anchor="middle" fill="#64748b" font-size="13">$6</text>
<text x="598" y="270" text-anchor="middle" fill="#64748b" font-size="13">$8</text>
<text x="690" y="270" text-anchor="middle" fill="#64748b" font-size="13">$10</text>
<text x="460" y="292" text-anchor="middle" fill="#64748b" font-size="13">RTX 4090 每次訓練的成本，2026 年 9 月價格</text>
</svg>
<figcaption>就算以 RunPod 的牌價分開嘗試五次 SDXL，總額仍遠低於 $10。以每小時 $0.74 計算，$10 可買 13.5 小時的 RTX 4090 時間；以 $0.31 計算，約 32 小時。</figcaption>
</figure>

真正讓 $10 預算破功的，很少是訓練本身。而是整晚忘了關的執行個體（每小時 $0.74，12 小時就是 $8.88）、已停止卻仍在付儲存費的 Vast.ai 執行個體，或是在計費時間內花一小時寫標註。按秒計費只有在您用完就刪除機器時才有幫助。

## GPUFlow 適合這項工作嗎

不適合。GPUFlow 出租的是語言模型的使用權：由提供者在自己的 GPU 上執行（通常用 Ollama），您透過一組相容 OpenAI 的 API 金鑰存取。沒有 shell、沒有 SSH，也不能存取檔案，所以無法安裝訓練工具、上傳圖片或下載 LoRA。而且它提供的是聊天模型，不是圖像模型。請在 Vast.ai、RunPod 或其他直接出租機器的類似平台上訓練。

如果您處理的是文字而不是圖片，同樣的「租用、訓練、刪除」做法也適用於語言模型：請看[在租用的 GPU 上私密微調 LLM](/zh_tw/private-llm-fine-tuning-guide/)。

## 來源

全部於 2026 年 9 月查核。

- LoRA 論文：[Hu 等人，LoRA: Low-Rank Adaptation of Large Language Models](https://arxiv.org/abs/2106.09685)
- sd-scripts：[README 和版本發布](https://github.com/kohya-ss/sd-scripts)、[SDXL LoRA 訓練](https://github.com/kohya-ss/sd-scripts/blob/main/docs/sdxl_train_network.md)、[SDXL 說明與 VRAM](https://github.com/kohya-ss/sd-scripts/blob/main/docs/train_SDXL-en.md)、[資料集設定](https://github.com/kohya-ss/sd-scripts/blob/main/docs/config_README-en.md)、[FLUX.1 LoRA 訓練](https://github.com/kohya-ss/sd-scripts/blob/main/docs/flux_train_network.md)、[WD14 tagger](https://github.com/kohya-ss/sd-scripts/blob/main/docs/wd14_tagger_README-en.md)
- [bmaltais/kohya_ss](https://github.com/bmaltais/kohya_ss)、[Nerogar/OneTrainer](https://github.com/Nerogar/OneTrainer)、[ostris/ai-toolkit](https://github.com/ostris/ai-toolkit)、[JoyCaption](https://github.com/fpgaminer/joycaption)
- SDXL 在 4090 上的速度：[kohya_ss issue #1288](https://github.com/bmaltais/kohya_ss/issues/1288)
- Black Forest Labs：[在 60 分鐘內用 LoRA 微調 FLUX.2 [klein]](https://huggingface.co/blog/black-forest-labs/flux-2-klein-lora)，以及 [FLUX.1 [dev]](https://huggingface.co/black-forest-labs/FLUX.1-dev)、[FLUX.2 [klein] 4B](https://huggingface.co/black-forest-labs/FLUX.2-klein-base-4B)、[FLUX.2 [klein] 9B](https://huggingface.co/black-forest-labs/FLUX.2-klein-base-9B) 的模型卡
- [Stable Diffusion XL base 1.0 模型卡](https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0)
- 價格：[RunPod 價格](https://www.runpod.io/pricing)、[RunPod pod 價格與儲存](https://docs.runpod.io/pods/pricing)、[Vast.ai 價格](https://docs.vast.ai/guides/instances/pricing.md)，以及 getdeploying.com 上的 [RTX 3090](https://getdeploying.com/reference/cloud-gpu/nvidia-rtx-3090)、[RTX 4090](https://getdeploying.com/reference/cloud-gpu/nvidia-rtx-4090)、[RTX 5090](https://getdeploying.com/reference/cloud-gpu/nvidia-rtx-5090) 和 [Vast.ai](https://getdeploying.com/vast-ai)
- GPUFlow：[API 快速入門](https://docs.gpuflow.app/zh-tw/renters/api-quickstart/)
