---
title: "按小時租 GPU，還是按 token 付費的 API？執行 7B–8B 模型的實際成本"
description: "按小時租用消費級 GPU 與按 token 付費的 AI API，成本到底差多少？附上最新價格、實測速度，以及 1,000 個請求的試算範例。"
excerpt: "按 token 計價的 API 和按小時計價的 GPU，用的是不同的計價單位。我們把兩者換算成同一份工作，看看什麼情況下哪一個比較便宜。"
pubDate: 2026-09-29
locale: "zh_tw"
category: "comparisons"
featured: false
draft: false
author: "GPUFlow Team"
heroImage: "../_images/hourly-gpu-vs-per-token-api-hero.png"
heroImageAlt: "一張圖表：按小時計價是一條水平線，按 token 計價是一條上升的線"
faq:
  - question: "按小時租 GPU 比按 token 付費的 API 便宜嗎？"
    answer: "要看您拿什麼來比。以 Llama 3.1 8B 這類熱門開源模型來說，代管的按 token 計價 API 比較便宜：DeepInfra 每百萬輸入 token 收 $0.02、每百萬輸出 token 收 $0.04。但如果對手是 gpt-5-mini（每百萬輸出 token $2.00）或 Claude Haiku 4.5（$5.00），租任何一張 RTX 3060 到 RTX 5090 來執行開源 7B–8B 模型，只要讓它保持忙碌，每個 token 的成本都會更低。若對手是 gpt-4o-mini（$0.60），只有 RTX 3060 這類較便宜的卡才明顯勝出。"
  - question: "RTX 4090 執行 8B 模型每秒能產生多少 token？"
    answer: "Hardware Corner 在 RTX 4090 上以 4 位元量化、16K 上下文執行 Qwen3 8B，一次處理一個請求，實測每秒 104 個 token。llama.cpp 的排行榜顯示，較小的 Llama 2 7B 以 Q4_0、短上下文執行時，每秒可達 186 個 token。"
  - question: "在租來的 RTX 4090 上，一百萬個輸出 token 要多少錢？"
    answer: "以每小時 $0.35、每秒約 104 個 token 計算，一小時大約產生 376,000 個 token，所以一百萬個輸出 token 約需 $0.93 的 GPU 時間。讀取提示詞比寫出回答快得多，所以輸入 token 增加的成本很少。"
  - question: "什麼時候按小時租 GPU 比用 API 划算？"
    answer: "當您需要的模型沒有按 token 計價的服務（您自己微調的模型、社群模型、特定的量化版本），當您希望每小時成本固定、而不是按 token 計量，或是當您比較的對象是每百萬輸出 token 收 $2 以上的閉源模型時。"
---

使用 Llama 3.1 8B 或 Qwen 2.5 7B 這類小型開源 AI 模型，常見的付費方式有兩種：

- **按 token 計價**：由某家公司代管模型，您送出和收到的每個 token 都要付費。
- **按小時計價**：您租一張執行模型的 GPU，按時間付費，不論用了多少 token。

兩邊的價格看起來根本無法比較：一邊是「每百萬 token $0.04」，另一邊是「每小時 $0.35」。本文把兩者換算成同一個單位，並用一個貼近實際的工作量完整試算一遍。所有價格都在 2026 年 9 月查核過，來源列在文末。

## 步驟 1：消費級 GPU 產生文字的速度有多快？

關鍵在於 GPU 處理單一請求時，每秒能產生多少 token。我們採用 Hardware Corner 的實測數據，他們在 llama.cpp（Ollama 所使用的推論引擎）中，以 4 位元量化（Q4_K_XL）、16K 上下文測試 Qwen3 8B。

| GPU | 每秒 token 數（單一請求） | 每小時 token 數 |
| --- | --- | --- |
| RTX 3060 12 GB | 42 | 約 151,000 |
| RTX 3090 | 87 | 約 315,000 |
| RTX 4090 | 104 | 約 376,000 |
| RTX 5090 | 145 | 約 523,000 |

提示詞短的話速度會更快。llama.cpp 專案自己的排行榜以較小的 Llama 2 7B、Q4_0、短上下文測試，同樣這四張卡分別是每秒 76、158、186 和 290 個 token。我們採用較低、也較貼近實際的數字。

讀取提示詞比寫出回答快得多。同一份排行榜顯示，RTX 3060 處理提示詞的速度約為每秒 2,100 個 token，RTX 4090 約為每秒 12,000 個。所以在按小時計價的 GPU 上，長提示詞幾乎不會多花時間。

## 步驟 2：把每小時價格換算成每百萬 token 的價格

用每小時價格除以每小時的 token 數。我們採用 2026 年 9 月 GPU 租用網站上常見的隨選價格：

| GPU | 每小時價格 | 每 100 萬個輸出 token 的成本（GPU 保持忙碌） |
| --- | --- | --- |
| RTX 3060 12 GB | $0.06 | 約 $0.40 |
| RTX 3090 | $0.20 | 約 $0.64 |
| RTX 4090 | $0.35 | 約 $0.93 |
| RTX 5090 | $0.55 | 約 $1.05 |

重點在「保持忙碌」。這些數字假設 GPU 整個小時都在產生文字。如果有一半時間閒置，每個 token 的成本就會翻倍。

## 步驟 3：按 token 計價的 API 收多少錢

每百萬 token 的價格，輸入／輸出：

| 模型 | 服務商 | 輸入 | 輸出 |
| --- | --- | --- | --- |
| Llama 3.1 8B Instruct Turbo | DeepInfra | $0.02 | $0.04 |
| Gemma 3 12B | DeepInfra | $0.05 | $0.15 |
| Qwen3.5 9B | DeepInfra | $0.10 | $0.15 |
| gpt-4o-mini | OpenAI | $0.15 | $0.60 |
| gpt-5-mini | OpenAI | $0.25 | $2.00 |
| Claude Haiku 4.5 | Anthropic | $1.00 | $5.00 |

有兩點很明顯。代管的開源模型非常便宜。而閉源小模型每個輸出 token 的價格，是最便宜的開源 8B 模型的 15 到 125 倍。

## 步驟 4：同一份工作，用每種方式算價錢

假設您要執行 1,000 個請求。每個請求送出 1,500 個 token（指示加上一份文件），收回 500 個 token。總共是 150 萬個輸入 token 和 50 萬個輸出 token。

| 方案 | 這份工作的成本 | 備註 |
| --- | --- | --- |
| DeepInfra 上的 Llama 3.1 8B | 約 $0.05 | 最便宜，差距明顯 |
| gpt-4o-mini | 約 $0.53 | |
| gpt-5-mini | 約 $1.38 | |
| Claude Haiku 4.5 | 約 $4.00 | |
| 租用 RTX 3060，一次一個請求 | 約 $0.21 | 約 3.5 小時 |
| 租用 RTX 3090 | 約 $0.33 | 約 1.7 小時 |
| 租用 RTX 4090 | 約 $0.48 | 約 1.4 小時 |
| 租用 RTX 5090 | 約 $0.54 | 約 1 小時 |

GPU 的數字是這樣算出來的：50 萬個輸出 token 除以步驟 1 的速度，加上 150 萬個提示詞 token 除以 llama.cpp 排行榜上的提示詞處理速度，再乘以每小時價格。

## 這代表什麼

**如果有代管 API 提供您要的開源模型，那就是執行它最便宜的方式**。以 Llama 3.1 8B 來說，沒有任何按小時租用的方案能接近每百萬輸出 token $0.04 的價格。

**和大多數閉源小模型相比，按小時租 GPU 比較便宜，前提是開源模型足以勝任您的工作**。一張保持忙碌的 RTX 3060，每個輸出 token 的成本比 gpt-4o-mini 低，RTX 3090 則差不多；若像上面的工作那樣把輸入 token 也算進去，兩張卡都比較便宜。表中的每一張卡都比 gpt-5-mini 或 Claude Haiku 便宜。7B–8B 開源模型的回答品質夠不夠好，取決於工作內容：分類、擷取欄位、摘要和短篇改寫通常沒問題，長篇推理則比較弱。

**以下情況適合按小時租 GPU：**

- 您需要的模型沒有任何按 token 計價的 API：您自己微調的模型、社群模型，或特定的量化版本。
- 您希望每小時成本固定，而不是按用量計費，例如在測試階段，或整晚執行批次工作時。
- 您的提示詞很長。在按小時租用的 GPU 上，輸入 token 只會花掉讀取它們的那幾秒鐘。
- 您想在自己買卡之前，先在真實硬體上試用某個模型。

**以下情況適合按 token 計價：**

- 您的流量是一陣一陣的，中間有很長的空檔。等待期間不用付任何錢。
- 您需要同時處理很多請求。一張消費級 GPU 預設一次只處理一個請求：Ollama 的 `OLLAMA_NUM_PARALLEL` 預設值是 1。
- 您要的模型有代管服務，而且您能接受它的價格。

## 兩邊都要考慮隱私

使用按 token 計價的 API，您的提示詞會送到 API 公司。使用租來的 GPU，提示詞會送到您租用的那台機器。以 GPUFlow 為例，模型在提供者自己的電腦上執行，所以提示詞和回答都會經過那台電腦。我們的文件寫得很清楚：不要傳送密碼、信用卡號碼，或任何您不願意讓陌生人看到的內容。資料真正敏感時，這兩種方式都無法取代在自己的硬體上執行模型。

## 如何在 GPUFlow 上實測

在 GPUFlow 上，您按小時租用一張 GPU，並取得一組用法和 OpenAI 金鑰一樣的 API 金鑰。按秒計費，如果提早結束，未使用的時間會退回您的額度。要算出您自己每個 token 的成本：

1. 租一張執行您所需模型的 GPU，租 1 小時。
2. 把您的腳本指向 `https://gpuflow.app/v1`，並使用您的金鑰（[做法](https://docs.gpuflow.app/zh-tw/renters/api-quickstart/)）。
3. 計算收到的 token 數，再用實際付的金額除以這個數字。

十分鐘的真實流量，比任何表格都更能說明問題。

## 相關文章

- [GPU 租用的真實成本：每小時價格沒告訴您的費用](/zh_tw/hidden-fees-in-gpu-rental/)
- [如何在 Open WebUI、Continue、LangChain 等工具中使用相容 OpenAI 的 API 金鑰](/zh_tw/use-openai-compatible-api-key-in-apps/)
- [Ollama vs vLLM vs TGI：RTX 4090 推論效能測試](/zh_tw/ollama-vs-vllm-vs-tgi-rtx-4090-benchmark/)

## 資料來源

皆於 2026 年 9 月查核。

- GPU 速度，Qwen3 8B Q4_K_XL、16K 上下文：[Hardware Corner GPU 排名](https://www.hardware-corner.net/gpu-ranking-local-llm/)（2025 年 12 月 9 日更新）
- llama.cpp CUDA 排行榜，Llama 2 7B Q4_0：[github.com/ggml-org/llama.cpp/discussions/15013](https://github.com/ggml-org/llama.cpp/discussions/15013)
- Ollama 平行請求：[docs.ollama.com/faq](https://docs.ollama.com/faq)
- DeepInfra 價格：[deepinfra.com/pricing](https://deepinfra.com/pricing)
- OpenAI 價格：[gpt-4o-mini](https://developers.openai.com/api/docs/models/gpt-4o-mini)、[gpt-5-mini](https://developers.openai.com/api/docs/models/gpt-5-mini)
- Anthropic 價格：[platform.claude.com 價格](https://platform.claude.com/docs/en/about-claude/pricing)
- GPU 租用價格範圍：[GPUFlow 文件：如何為您的 GPU 定價](https://docs.gpuflow.app/zh-tw/providers/pricing/)
