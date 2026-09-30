---
title: "RTX 4090 上的 Ollama vs vLLM vs TGI：基準測試怎麼說"
description: "在 RTX 4090 上用 Ollama、vLLM 和 Hugging Face TGI 跑 8B 模型：附出處的負載下吞吐量、VRAM、量化、OpenAI 相容 API，以及 TGI 的維護狀態。"
excerpt: "一次一個請求時，這幾個推論引擎在 RTX 4090 上的速度差不多。同時有很多使用者時，vLLM 遙遙領先。TGI 現在已進入維護模式。已發表的數據、來源，以及該選哪一個。"
pubDate: 2026-02-25
updatedDate: 2026-09-30
locale: "zh_tw"
category: "benchmarks"
featured: false
draft: false
author: "GPUFlow Team"
heroImage: "../_images/rtx4090-inference-benchmark-hero.png"
heroImageAlt: "終端機上顯示的 RTX 4090 GPU 推論基準測試與效能指標"
faq:
  - question: "在 RTX 4090 上，vLLM 比 Ollama 快嗎？"
    answer: "只有在很多請求同時執行時才是。在 ComputingForGeeks 於 2026 年 9 月用 4-bit 的 Qwen2.5-7B 做的測試中，兩者在 RTX 4090 上處理單一請求時都約每秒產生 174 個 token。同時 64 個請求時，vLLM 總計達到每秒 6,623 個 token，Ollama 則是 2,018。"
  - question: "Hugging Face TGI 還有在維護嗎？"
    answer: "只有很少量的維護。TGI 文件表示它已進入維護模式，只接受小型錯誤修正和文件修改，GitHub 儲存庫也在 2026 年 3 月 21 日封存為唯讀。Hugging Face 建議改用 vLLM 或 SGLang，本機使用則可選 llama.cpp 和 MLX。"
  - question: "vLLM 跑 8B 模型要用多少 VRAM？"
    answer: "vLLM 預設會佔用 GPU 記憶體的 90%（gpu-memory-utilization 0.9），在 24 GB 的 RTX 4090 上約 21.6 GB，不論模型大小。權重沒用到的部分會成為給並行請求使用的 KV 快取。"
  - question: "Ollama 能同時服務多個使用者嗎？"
    answer: "可以，但預設每個模型一次只處理一個請求（OLLAMA_NUM_PARALLEL=1）。您可以調高這個值，每個平行槽位都會額外佔用自己的上下文記憶體。已發表的基準測試顯示，在高並行負載下，Ollama 的擴展性不如 vLLM。"
  - question: "Ollama、vLLM 和 TGI 有相容 OpenAI 的 API 嗎？"
    answer: "有。三者都提供 /v1/chat/completions。Ollama 和 vLLM 還提供 completions、embeddings 和 Responses API；TGI 相容 OpenAI 的 Messages API 從 1.4.0 版就有了。"
  - question: "可以在 24 GB 的 GPU 上用 FP16 跑 Llama 3.1 8B 嗎？"
    answer: "可以。80.3 億個參數、每個 2 位元組，權重約 16.1 GB，放得進 24 GB，還能留一些空間給 KV 快取。多數在單張消費級顯示卡上提供服務的人會用 4-bit 或 8-bit 權重，讓上下文和並行使用者有更多空間。"
---

在單張 RTX 4090 上跑 7B 到 8B 的模型，一次一個請求時，Ollama 和 vLLM 的速度差不多。差距出現在很多請求同時湧入的時候：在一份 2026 年 9 月發表、64 個並行請求的測試中，vLLM 的總吞吐量約為 Ollama 的三倍。Hugging Face TGI 還能用，但自從它的儲存庫在 2026 年 3 月封存後，就一直處於維護模式，Hugging Face 自己現在也建議大家改用 vLLM 和 SGLang。

所以選擇取決於同時有多少人在用這個模型。一個使用者、一支腳本，或一個小型內部工具：Ollama，因為最省事。公開 API，或有大量請求同時進行的批次工作：vLLM。在 TGI 上做新的部署：我不會這麼做。

## 數據從哪裡來

這個頁面的舊版本曾列出吞吐量、延遲和 VRAM 數據，並說是我們自己在 RTX 4090 上量測的。我們無法把它們追溯到可重現的測試或已發表的來源，所以已經移除。存疑的理由之一：舊的單一串流 FP16 數據，高於 RTX 4090 的記憶體頻寬所能達到的上限（見下一節）。

以下每個數字現在都註明了發表者，以及他們使用的硬體和模型。沒有人發表過乾淨的 RTX 4090 比較時（例如 TGI），我會直接說明，而不是自己把空白補上。

主要來源：

- **ComputingForGeeks，2026 年 9 月 18 日。** 在 RTX 4090、L40S 和 RTX 5090 上比較 Ollama、vLLM 和 llama.cpp。模型：Qwen2.5-7B-Instruct，vLLM 用 AWQ 4-bit，Ollama 和 llama.cpp 用 GGUF Q4_K_M。固定 512 個 token 的提示詞、temperature 0、最多輸出 256 個 token、每個槽位 4,096 個 token 的上下文、64 個平行槽位。
- **Red Hat Developer，2025 年 8 月 8 日。** 在一張 A100 40 GB 上比較 Ollama 0.9.2 和 vLLM 0.9.1，使用 FP16 的 Llama 3.1 8B Instruct，並行使用者從 1 到 256，以 GuideLLM 量測。
- **BentoML，2024 年 6 月 5 日。** 在 A100 80 GB 上用 Llama 3 8B Instruct 比較 vLLM 0.4.2、TGI 2.0.4 等引擎。
- **llama.cpp CUDA 排行榜。** Llama 2 7B Q4_0 在許多顯示卡上的單一串流速度，包括 RTX 4090。

只有第一份是在 RTX 4090 上測試，涵蓋了本文討論的所有引擎，TGI 除外。其他幾份在資料中心顯示卡上呈現同樣的模式。

## 單一請求：顯示卡決定上限

GPU 為單一請求產生 token 時，每產生一個 token 都得從記憶體讀一遍模型的所有權重。所以決定上限的是記憶體頻寬，不是引擎。

RTX 4090 有 24 GB 的 GDDR6X，頻寬 1,008 GB/s。Llama 3.1 8B 有 80.3 億個參數。

- 用 FP16，權重是 8.03 × 2 位元組 ≈ 16.1 GB。1,008 ÷ 16.1 ≈ 單一請求最多**每秒 63 個 token**。
- Ollama 預設的 `llama3.1:8b` 標籤是 Q4_K_M，下載大小 4.9 GB。1,008 ÷ 4.9 ≈ 最多**每秒 205 個 token**。

實際的引擎會低於這些上限。llama.cpp 排行榜顯示，RTX 4090 用 Q4_0 的 Llama 2 7B 每秒產生 186 個 token（開啟 flash attention 時 189 個）。ComputingForGeeks 用 4-bit 的 Qwen2.5-7B 量到單一請求約每秒 174 個 token，並發現 vLLM、llama.cpp 和 Ollama 在 4090 上「大致」相同。（在 L40S 和 RTX 5090 上，他們的 Ollama 版本解碼速度只有 llama.cpp 的一半左右，所以請確認您自己的顯示卡和版本。）

一次只有一個使用者時，選引擎看方便，選量化看速度。從 FP16 換到 4-bit，上限大約變成三倍。換引擎則幾乎沒有影響。

## 大量請求：批次處理決定勝負

有很多請求同時進行時，GPU 可以讀一次權重，用在一整批請求上。這時重要的是引擎的批次處理做得多好，以及它怎麼管理 KV 快取（每個請求用來記住目前對話內容的記憶體）。

<figure>
<svg viewBox="0 0 720 310" role="img" aria-labelledby="d1-title" xmlns="http://www.w3.org/2000/svg" font-family="system-ui, sans-serif" font-size="15">
<title id="d1-title">RTX 4090 在 64 個並行請求下的總吞吐量長條圖：vLLM 每秒 6,623、llama.cpp 2,391、Ollama 2,018 個 token</title>
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
<text x="410" y="256" text-anchor="middle" fill="#64748b" font-size="13">每秒總輸出 token 數，64 個請求同時進行</text>
<text x="360" y="290" text-anchor="middle" fill="#1e1b4b" font-size="14">一次一個請求：三者都約每秒 174 個 token</text>
</svg>
<figcaption>RTX 4090，4-bit 的 Qwen2.5-7B-Instruct（vLLM 用 AWQ，其他用 GGUF Q4_K_M），64 個並行請求。數據來自 ComputingForGeeks，2026 年 9 月；長條依比例繪製。TGI 不在這次測試之中。</figcaption>
</figure>

在 RTX 4090 上，64 個請求合計，vLLM 每秒輸出 6,623 個 token，llama.cpp 的伺服器 2,391 個，Ollama 2,018 個。這次測試對 Ollama 的設定是公平的：`OLLAMA_NUM_PARALLEL=64`、`num_ctx 4096`，並開啟 flash attention。vLLM 則以 `--quantization awq_marlin --max-model-len 4096 --gpu-memory-utilization 0.90` 執行。作者也回報了首個 token 延遲：llama.cpp 約 8 到 12 ms，vLLM 16 到 25 ms，Ollama 在 L40S 和 RTX 5090 上最高。

Red Hat 在 A100 上用 FP16 權重的測試指向同樣的結論。vLLM 的峰值是每秒 793 個 token；預設設定下的 Ollama 只有 41。把 Ollama 的平行上限調到 32，也就是「最高的穩定值」之後，它在任何並行程度下仍然追不上 vLLM。它的首個 token 延遲「隨使用者增加而急遽上升」，token 間延遲在峰值負載時出現「劇烈的尖峰」。

在您把這些數字拿去跟別人說之前，有兩點要注意。第一，ComputingForGeeks 的比較並非完全對等：vLLM 用的是 AWQ 權重，其他用 GGUF，版本也不同。第二，這些是所有請求的總和。64 個使用者每人在 vLLM 上看到的約是 6,623 ÷ 64 ≈ 每秒 103 個 token，仍然很夠用；在 Ollama 上則約是 2,018 ÷ 64 ≈ 32 個。

## TGI 的現況

Text Generation Inference 曾是 Hugging Face 的正式環境伺服器，具備連續批次處理、Flash Attention 和 Paged Attention、張量平行、Prometheus 指標與 OpenTelemetry 追蹤。技術上它和 vLLM 屬於同一級別。

它的狀態已經變了。TGI 文件現在的開頭寫著：「text-generation-inference 現已進入維護模式。今後我們只接受小型錯誤修正、文件改進和輕量維護工作的 pull request。」並建議「vllm、SGLang，以及具互通性的本機引擎，例如 llama.cpp 或 MLX」。GitHub 儲存庫已在 2026 年 3 月 21 日封存並設為唯讀。

我沒有找到近期發表、在 RTX 4090 上測 TGI 的基準測試。最接近、也可信的比較是 BentoML 在 2024 年 6 月於 A100 80 GB 上做的：用 Llama 3 8B，vLLM 達到「每秒 2300 到 2500 個 token，與 TGI 相近」，而且在他們測試的每個並行程度下，vLLM 的首個 token 延遲都是最好的。那已經是兩年前、兩個引擎都經過許多版本之前的事了，請當作歷史看待。

如果 TGI 已經在處理您的正式環境流量，它會繼續運作。但新的部署等於選了一個不會再支援新模型架構、也不會再有效能改進的伺服器。在單張 RTX 4090 上，TGI 能做的 vLLM 都能做。

## 24 GB 顯示卡上的 VRAM

這幾個引擎使用記憶體的方式差很多，這會影響還有什麼能和它共用這張卡。

**vLLM 一開始就拿走大部分的顯示卡記憶體。** 它的 `--gpu-memory-utilization` 預設是 0.9，所以在 24 GB 的 RTX 4090 上，不論模型大小，啟動時都會佔用約 21.6 GB。權重沒用到的部分全部成為 KV 快取。用 FP16 的 Llama 3.1 8B（約 16.1 GB）時，剩下大約 5.5 GB 給 KV 快取、activation 和 CUDA graph，這會限制上下文長度和能同時容納的請求數。用 4-bit AWQ 權重時（ComputingForGeeks 的版本約 5.6 GB），21.6 GB 大部分都給了 KV 快取，這就是它能同時撐住 64 個請求的原因。除非調低這個比例，否則別指望在旁邊再跑第二個 GPU 程式。

**Ollama 依模型和上下文配置記憶體。** 一個 `llama3.1:8b` Q4_K_M 模型是 4.9 GB，再加上它上下文視窗所需的 KV 快取。Ollama 會依您的 VRAM 決定預設上下文：24 GiB 以下是 4k，24 到 48 GiB 是 32k，48 GiB 以上是 256k。RTX 4090 剛好卡在 24 GiB 這條線上（nvidia-smi 回報的會略少於 24 GiB），所以請用 `ollama ps` 確認您實際拿到的上下文，或自己設定。平行槽位會讓這個數字倍增：文件裡的例子是「2K 的上下文搭配 4 個平行請求，會產生 8K 的上下文和額外的記憶體配置」。如果記憶體吃緊，KV 快取量化會有幫助：`q8_0` 用的記憶體約為預設 `f16` 的一半，`q4_0` 約為四分之一。Ollama 預設也能在每張 GPU 上同時載入最多三個模型（放得下的話），適合要在不同模型之間切換的顯示卡。至於 8、12、16 和 24 GB 的顯示卡一開始能放下哪些模型，請看[哪些 AI 模型放得進您的 GPU VRAM](/zh_tw/which-ai-models-fit-your-gpu-vram/)。

**TGI** 和 vLLM 一樣，也會為連續批次處理預先配置記憶體。我沒有找到目前可引用的 4090 上 8B 模型 VRAM 數據，所以不列數字。

## 量化與模型格式

| | Ollama | vLLM | TGI |
| --- | --- | --- | --- |
| **主要格式** | GGUF（例如 Q4_K_M） | Hugging Face safetensors | Hugging Face safetensors |
| **4-bit 選項** | GGUF Q4 各種變體 | AWQ、GPTQ、bitsandbytes、INT4 W4A16 | AWQ、GPTQ、Marlin、EXL2、bitsandbytes NF4/FP4 |
| **8-bit / FP8** | GGUF Q8_0 | Ada（RTX 4090）和 Hopper 上的 FP8 W8A8；INT8 | bitsandbytes 8-bit、EETQ、fp8 |
| **GGUF** | 原生 | 支援 | 未列出 |
| **KV 快取量化** | q8_0、q4_0 | 有 | 本文未涵蓋 |

RTX 4090 是 Ada 架構的顯示卡（SM 8.9），所以 vLLM 的 FP8 路徑可以在上面使用。FP8 權重佔用的記憶體是 FP16 的一半：8B 模型約 8 GB，在單張 4090 上是 FP16 和 4-bit 之間的折衷。

Ollama 的模型庫提供預先量化好的 GGUF 標籤，所以您很少需要想這件事：`ollama pull llama3.1:8b` 拿到的就是 Q4_K_M。用 vLLM 時，您要從 Hugging Face 選一個預先量化好的 checkpoint，或自己傳入量化參數。

## 相容 OpenAI 的伺服器與安裝

三者都提供 OpenAI 風格的 HTTP API，所以 OpenAI SDK 和大多數聊天工具只要改 base URL 就能用。

| | Ollama | vLLM | TGI |
| --- | --- | --- | --- |
| **預設位址** | `localhost:11434/v1` | `localhost:8000/v1` | 容器連接埠 80（常對應到 8080） |
| **Chat completions** | 有 | 有 | 有（Messages API，1.4.0 起） |
| **其他 OpenAI 端點** | completions、models、embeddings、responses | completions、embeddings、responses、audio | 本文未涵蓋 |
| **安裝** | 一支腳本 | pip 套件 | Docker 映像檔 |

依各專案的文件，讓一個 8B 模型跑起來的方式：

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

Ollama 是最省事的，差距還不小。它會處理下載、量化檔案、載入和卸載，在筆電和租來的伺服器上用起來都一樣。Ollama 的 OpenAI 相容層有缺口：chat completions 不支援 `logprobs` 和 `tool_choice`，圖片必須是 base64，不能用 URL。vLLM 需要可用的 CUDA 和 Python 環境，要調的參數也比較多，但它是 Hugging Face 現在建議用來取代 TGI 的引擎。如果您本來就在用 Docker，TGI 很容易上手，只是有上面提到的維護狀態問題。

## 哪種工作用哪個引擎

**Ollama**：適合單一使用者、腳本、程式設計助理、只有少數使用者的內部工具，或需要在多個模型之間切換的機器。幾分鐘就能裝好，在 4090 上的單一請求速度不輸任何引擎。

**vLLM**：適合很多請求同時湧入的情況：公開 API、多人使用的聊天產品，或能一次跑 32 或 64 個的批次工作。已發表的數據顯示，在 RTX 4090 上 64 個並行請求時，它的總吞吐量約為 Ollama 的三倍，在 A100 上差距更大。它支援的量化方式和 API 也最廣。

**TGI**：只在您已經在用的情況下。新的工作，Hugging Face 自己的建議是 vLLM 或 SGLang。

按小時租用時，成本跟著吞吐量走。以 RTX 4090 每小時 $0.31 產生一百萬個輸出 token 為例（這是 getdeploying.com 在 2026 年 9 月列出的 Vast.ai 最低隨選價格），使用 ComputingForGeeks 的數據：

- 一次一個請求，每秒 174 個 token：1,000,000 ÷ 174 ≈ 5,750 秒 ≈ 1.6 小時 ≈ **$0.50**。
- Ollama 同時 64 個，每秒 2,018 個 token：≈ 496 秒 ≈ **$0.04**。
- vLLM 同時 64 個，每秒 6,623 個 token：≈ 151 秒 ≈ **$0.01**。

以上假設 GPU 全程都在忙。如果您永遠只有一個請求在處理，批次處理幫不上忙，選哪個引擎都不會改變您的帳單。如果您有一整排待處理的工作，差距可達一個數量級。同樣的邏輯拿來和按 token 計費的 API 比較，請看[按小時租 GPU，還是按 token 付費的 API](/zh_tw/hourly-gpu-vs-per-token-api/)。

## GPUFlow 的定位

GPUFlow 的提供者安裝程式預設會裝好 Ollama，GPUFlow 代理程式再把請求轉送給它，所以在 GPUFlow 上適用的通常是上面 Ollama 那一欄。您租用一組相容 OpenAI 的 API 金鑰（`https://gpuflow.app/v1`，提供 `/v1/chat/completions` 和 `/v1/models`，支援串流），呼叫提供者 GPU 上的模型。您付的是時間，按秒計費，最低 1 分鐘，不按 token 收費。

在 GPUFlow 上不能做的事：選擇引擎、修改引擎設定，或執行自己的程式碼。沒有 SSH，也沒有 shell。想重現上面的基準測試或自己跑 vLLM，請在 Vast.ai 或 RunPod 上租一台可以登入的機器（[兩者比較](/zh_tw/runpod-vs-vastapi-comparison/)）。想在應用程式裡使用由 Ollama 提供的模型、什麼都不用安裝，請看 [GPUFlow 市集](https://gpuflow.app/zh-TW/marketplace)和[如何在常用工具中使用這組金鑰](/zh_tw/use-openai-compatible-api-key-in-apps/)。

如果您微調了自己的模型，正在決定要怎麼提供服務，[私有 LLM 微調指南](/zh_tw/private-llm-fine-tuning-guide/)涵蓋了這之前的那一步。

## 資料來源

皆於 2026 年 9 月查核。

- 在 RTX 4090、L40S 和 RTX 5090 上比較 Ollama、vLLM 和 llama.cpp：[ComputingForGeeks](https://computingforgeeks.com/ollama-vs-vllm-vs-llama-cpp/)（2026 年 9 月 18 日）
- 在 A100 40 GB 上比較 Ollama 和 vLLM：[Red Hat Developer](https://developers.redhat.com/articles/2025/08/08/ollama-vs-vllm-deep-dive-performance-benchmarking)（2025 年 8 月 8 日）
- 在 A100 80 GB 上比較 vLLM、TGI 等引擎：[BentoML，Benchmarking LLM Inference Backends](https://www.bentoml.com/blog/benchmarking-llm-inference-backends)（2024 年 6 月 5 日）
- llama.cpp CUDA 排行榜：[github.com/ggml-org/llama.cpp/discussions/15013](https://github.com/ggml-org/llama.cpp/discussions/15013)
- RTX 4090 記憶體與頻寬：[TechPowerUp 評測](https://www.techpowerup.com/review/nvidia-geforce-rtx-4090-founders-edition/)
- Llama 3.1 8B 參數與授權：[Hugging Face 模型卡](https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct)
- Ollama：[常見問題（平行請求、KV 快取）](https://docs.ollama.com/faq)、[上下文長度](https://docs.ollama.com/context-length)、[OpenAI 相容性](https://docs.ollama.com/api/openai-compatibility)、[llama3.1:8b 標籤](https://ollama.com/library/llama3.1:8b)
- vLLM：[相容 OpenAI 的伺服器](https://docs.vllm.ai/en/latest/serving/online_serving/openai_compatible_server/)、[量化](https://docs.vllm.ai/en/latest/features/quantization/index.html)、[引擎參數（gpu-memory-utilization）](https://docs.vllm.ai/en/v0.6.4/models/engine_args.html)
- TGI：[文件與維護公告](https://huggingface.co/docs/text-generation-inference/en/index)、[GitHub 儲存庫（已封存）](https://github.com/huggingface/text-generation-inference)、[Messages API](https://huggingface.co/docs/text-generation-inference/en/messages_api)、[量化](https://huggingface.co/docs/text-generation-inference/en/conceptual/quantization)
- RTX 4090 租用價格：[getdeploying.com](https://getdeploying.com/reference/cloud-gpu/nvidia-rtx-4090)
- GPUFlow：[API 快速入門](https://docs.gpuflow.app/zh-tw/renters/api-quickstart/)、[提供者入門指南](https://docs.gpuflow.app/zh-tw/providers/getting-started/)
