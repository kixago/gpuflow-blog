---
title: "Ollama vs vLLM vs TGI：RTX 4090 推論效能實測（實際量測，不是行銷數字）"
description: "在 RTX 4090 上以受控條件比較 Ollama、vLLM 與 Hugging Face TGI 執行 Llama‑3.1‑8B 推論的表現，分析吞吐量、延遲、VRAM 用量與每 token 成本。"
excerpt: "在單張 RTX 4090 上以 Llama‑3.1‑8B 實測 Ollama、vLLM 與 TGI。真實的吞吐量、真實的延遲，以及對成本的實際影響。"
pubDate: 2026-02-25
updatedDate: 2026-09-29
locale: "zh_tw"
category: "benchmarks"
featured: false
draft: false
author: "GPUFlow Team"
heroImage: "../_images/rtx4090-inference-benchmark-hero.png"
heroImageAlt: "終端機上顯示的 RTX 4090 GPU 推論效能測試與各項效能指標"
faq:
  - question: "在 RTX 4090 上跑 Llama-3.1-8B，哪個推論伺服器最快？"
    answer: "在 RTX 4090 上以 FP16 實測，vLLM 在並行負載下的持續吞吐量最高，8 個串流合計約每秒 185 到 215 個 token。TGI 為每秒 150 到 176 個 token，Ollama 在相同條件下平均每秒 95 到 108 個 token。"

  - question: "vLLM 用的 VRAM 比 Ollama 或 TGI 多嗎？"
    answer: "以 FP16 服務 Llama-3.1-8B 時，vLLM 約使用 20 到 22GB 的 VRAM，TGI 用量相近，約 21 到 23GB。Ollama 整體用得較少，通常在 14 到 17GB 之間，但在並行負載下達不到相同的吞吐量。"

  - question: "Ollama 適合用在正式環境的推論工作嗎？"
    answer: "Ollama 適合開發環境和低並行量的內部工具。測試中，在 8 個並行請求串流下，它的擴展效率不如 vLLM 或 TGI。流量持續的正式環境 API，通常用針對連續批次處理最佳化的伺服器會比較有效率。"

  - question: "在 RTX 4090 上執行 Llama-3.1-8B 推論要花多少錢？"
    answer: "以平均租金每小時約 0.45 美元計算，用 vLLM 生成 500,000 個 token 大約需要 41 到 42 分鐘，費用約 0.31 美元。同樣的工作用 Ollama 大約需要 83 到 84 分鐘，費用約 0.63 美元。實際費用依工作內容和租用價格而異。"

  - question: "這次效能測試用了哪些提示詞和生成設定？"
    answer: "測試使用 512 個 token 的輸入提示詞，每個請求生成 128 個 token，採用 temperature 設為 0 的貪婪解碼。所有量測都在模型暖機後進行，使用 8 個並行請求串流，未啟用推測解碼。"

  - question: "我可以自己重現這次 RTX 4090 推論效能測試嗎？"
    answer: "可以。文中列出了硬體規格、CUDA 版本、驅動程式版本、解碼參數和並行設定。只要在單張 RTX 4090 上以 FP16 部署 Llama-3.1-8B，並使用相同的提示詞長度和並行設定，就能得到相近的結果。"
---

自己跑模型，只完成了一半。

完成微調之後（詳見我們的 [私有 LLM 微調指南](/zh_tw/private-llm-fine-tuning-guide/)），接下來要做的是營運上的決定：怎麼有效率地提供模型服務？

推論決定了：

- 每個 token 的成本
- 負載下的延遲
- GPU 的使用效率
- 消費級硬體能不能用在正式環境

本次效能測試比較三種常用的推論堆疊：

- Ollama
- vLLM
- Hugging Face Text Generation Inference（TGI）

目的不在個人偏好，而在量測。

---

## 測試環境

**硬體**

- GPU：NVIDIA RTX 4090（24GB VRAM）
- CPU：16 核心 Ryzen 等級消費級處理器
- RAM：64GB DDR5
- 儲存裝置：NVMe SSD
- CUDA：12.1
- NVIDIA 驅動程式：550 以上

**模型**

- `meta-llama/Llama-3.1-8B`
- 精度：FP16（未做 4 位元量化）
- 上下文長度：4096 個 token

**測試條件**

- 512 個 token 的輸入提示詞
- 生成 128 個 token 的輸出
- 貪婪解碼（temperature = 0）
- 未啟用推測解碼
- 未使用張量平行
- 僅測暖啟動（量測前已預先載入模型）
- 8 個並行請求串流（支援時）

所有測試都在沒有其他背景工作的乾淨機器上執行。每項數據為五次執行的平均值。

---

![終端機顯示 RTX 4090 上結構化的推論效能測試指標](../_images/rtx4090-inference-terminal-results.png)

---

## 測試結果

### 1. Ollama

Ollama 以簡單為優先。安裝步驟極少，模型會自動下載。

```bash
ollama run llama3
```

批次處理行為和排程策略能調整的地方很有限。

#### 實測效能（RTX 4090，FP16）

- **單一串流吞吐量：** 每秒 62–74 個 token
- **8 串流吞吐量：** 每秒 95–108 個 token
- **首個 token 延遲：** 720–980 ms
- **實際 VRAM 用量：** 14–17GB

#### 觀察

- 並行時 GPU 使用率起伏不定。
- 超過 4 個串流後，吞吐量的成長不再是線性的。
- 沒有提供進階批次處理最佳化的控制選項。

Ollama 在本機開發和低流量服務上表現穩定。但在持續的並行負載下，無法讓 GPU 滿載。

---

### 2. vLLM

vLLM 是為吞吐量而設計的。它的 PagedAttention 實作能在並行請求下提升 KV 快取的效率。

安裝：

```bash
pip install vllm
```

啟動：

```bash
python -m vllm.entrypoints.openai.api_server \
  --model meta-llama/Llama-3.1-8B \
  --dtype float16
```

#### 實測效能（RTX 4090，FP16）

- **單一串流吞吐量：** 每秒 92–104 個 token
- **8 串流吞吐量：** 每秒 185–215 個 token
- **首個 token 延遲：** 360–480 ms
- **實際 VRAM 用量：** 20–22GB

#### 觀察

- 負載下 GPU 使用率維持在 95% 以上。
- 連續批次處理提升了擴展效率。
- 在多個並行串流下，延遲依然穩定。

以每小時租用時間計算，vLLM 的持續吞吐量最高。

---

### 3. Hugging Face Text Generation Inference（TGI）

TGI 是容器化的正式環境推論伺服器。

```bash
docker run --gpus all \
  -p 8080:80 \
  ghcr.io/huggingface/text-generation-inference:latest \
  --model-id meta-llama/Llama-3.1-8B
```

#### 實測效能（RTX 4090，FP16）

- **單一串流吞吐量：** 每秒 78–88 個 token
- **8 串流吞吐量：** 每秒 150–176 個 token
- **首個 token 延遲：** 510–690 ms
- **實際 VRAM 用量：** 21–23GB

#### 觀察

- 效能穩定，可以預期。
- 吞吐量的擴展比 Ollama 好，但不及 vLLM。
- 因為有容器執行環境，營運負擔比較重。

TGI 提供正式環境需要的控制與監控功能，但沒辦法把單張 4090 的吞吐量發揮到極限。

---

![nvidia-smi 輸出，顯示並行推論時的 GPU 使用率](../_images/rtx4090-nvidia-smi-inference-load.png)

---

## 直接比較

| 堆疊   | 單一串流   | 8 串流      | 首個 token | VRAM    | GPU 飽和度 |
| ------ | ---------- | ----------- | ---------- | ------- | ---------- |
| Ollama | 62–74 t/s  | 95–108 t/s  | 720–980ms  | 14–17GB | 部分       |
| TGI    | 78–88 t/s  | 150–176 t/s | 510–690ms  | 21–23GB | 高         |
| vLLM   | 92–104 t/s | 185–215 t/s | 360–480ms  | 20–22GB | 非常高     |

---

## 對租用 GPU 成本的影響

在 GPU 租用市集上，2026 年 9 月 RTX 4090 的租金大約是每小時 0.30–0.46 美元，依平台和需求而定。詳細的價格分析請見：

- [2026 GPU 租用價格比較](/zh_tw/gpu-rental-pricing-comparison-2026/)
- [租用 GPU 的真實成本](/zh_tw/hidden-fees-in-gpu-rental/)

假設：

- 租金每小時 0.45 美元
- 生成 500,000 個 token
- 8 個並行串流

以實測吞吐量的中位數計算：

**vLLM（約每秒 200 個 token）**  
500,000 / 200 = 2,500 秒 ≈ 41–42 分鐘  
費用 ≈ 0.31 美元

**Ollama（約每秒 100 個 token）**  
500,000 / 100 = 5,000 秒 ≈ 83–84 分鐘  
費用 ≈ 0.63 美元

單看一次，成本差距並不大，但規模一大就會累積。

每天 5,000 萬個 token 時，吞吐效率會直接影響需要的 GPU 數量和租用時間。

### 自己跑這個效能測試

要重現這些數據，你需要一台自己能控制的機器，才能安裝和設定各個伺服器。提供 SSH 存取容器的租用市集，例如 Vast.ai 或 RunPod，都可以。

如果你只是想在 RTX 4090 上試用由 Ollama 提供服務的模型，不想做任何設定，[GPUFlow](https://gpuflow.app/zh-TW/marketplace) 的供應者都用 Ollama 執行模型，你透過相容 OpenAI 的 API 金鑰租用存取權，以秒計費。在那裡無法更換推論伺服器，所以它適合用來使用模型，不適合拿來測試伺服器效能。

因為是按小時租用，推論效率會直接影響成本。每秒 100 個 token 和每秒 200 個 token 的差距，在持續運作的工作中就變得很明顯。

---

## 部署情境

如果你是按小時租用 GPU，推論效率就直接決定成本效率。我們在 [按小時租 GPU 還是按 token 付費的 API](/zh_tw/hourly-gpu-vs-per-token-api/) 一文中算過這筆帳。

吞吐量會影響：

- 一項工作需要租用幾個小時
- 你的流量需要幾張 GPU
- 受主機不穩定影響的程度
- 營運上的利潤空間

只要搭配有效率的推論堆疊，消費級 GPU 在經濟上仍然適合執行 7B–8B 的模型。

---

## 各自的適用時機

**Ollama**

- 內部工具
- 低並行量
- 快速打造原型

**TGI**

- 容器化環境
- 需要結構化日誌的團隊
- 受管理的正式環境部署

**vLLM**

- API 服務
- 高並行量
- 每一塊錢換到最多 token

---

## 結論

在單張 RTX 4090 上以 FP16 執行 Llama‑3.1‑8B：

- vLLM 的持續吞吐量最高。
- TGI 效能均衡，並提供正式環境需要的控制功能。
- Ollama 以簡單為優先，而不是把 GPU 使用率拉到最高。

推論堆疊的選擇不是表面功夫，它決定了成本結構和擴展行為。

對部署在租用消費級 GPU 上的工作來說，批次處理效率會實質影響經濟效益。

## 在哪裡跑正式環境

本文所有的效能測試，都是在租用的消費級硬體上進行，而不是自有的基礎架構。

如果要微調或執行自己的推論伺服器，請租一台可以登入的機器。如果只想透過 API 使用由 Ollama 提供服務的模型、什麼都不用設定，請參考 [GPUFlow](https://gpuflow.app/zh-TW/marketplace)：租用以秒計費，以信用卡購買的額度付款。

#### 相關資源

**深入了解部署堆疊：**

- [在租用 GPU 上進行私有 LLM 微調的完整指南](/zh_tw/private-llm-fine-tuning-guide/)：安全訓練開放權重模型的完整教學
- [2026 GPU 租用價格比較](/zh_tw/gpu-rental-pricing-comparison-2026/)：各大 GPU 租用平台的成本差異
- [租用 GPU 的真實成本](/zh_tw/hidden-fees-in-gpu-rental/)：按小時計價的價目表沒告訴你的事
- [RunPod vs Vast.ai 比較](/zh_tw/runpod-vs-vastapi-comparison/)：集中式與市集式基礎架構的差異
