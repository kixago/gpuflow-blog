---
title: "GPUFlow、Vast.ai、RunPod、SaladCloud 比較：哪個 GPU 租用平台適合您的工作"
description: "2026 年四大 GPU 租用平台並列比較：實際租到什麼、如何計費、額外費用、付款方式、RTX 4090 和 3090 的價格，以及各自適合哪些工作。"
excerpt: "這四個平台出租 GPU 的方式截然不同。一整台機器、一個容器，還是一組 API 金鑰：以下說明訓練、推論、批次工作和應用程式開發各適合哪一個。"
pubDate: 2026-09-29
locale: "zh_tw"
category: "comparisons"
featured: true
draft: false
author: "GPUFlow Team"
heroImage: "../_images/gpu-rental-platforms-compared-hero.png"
heroImageAlt: "三根高度不同的柱子，代表不同的 GPU 租用平台"
faq:
  - question: "GPUFlow、Vast.ai 和 RunPod 最主要的差別是什麼？"
    answer: "Vast.ai 和 RunPod 出租的是容器或機器，可以透過 SSH、Jupyter 或類似方式存取，所以您能執行任何軟體。GPUFlow 出租的是一組相容 OpenAI 的 API 金鑰，用來呼叫已經在別人 GPU 上執行的 AI 模型。您無法在上面執行自己的程式碼，但也完全不需要設定。"
  - question: "RTX 4090 在哪裡租最便宜？"
    answer: "2026 年 9 月，我們看到的 RTX 4090 價格為：Vast.ai 每小時約 $0.37 起（getdeploying.com）、RunPod Community Cloud $0.34（當時缺貨）、RunPod Secure Cloud $0.74，以及 SaladCloud $0.33。在 GPUFlow 上由提供者自行定價；各租用網站的常見範圍是 $0.30 到 $0.46。"
  - question: "可以在 GPUFlow 上訓練或微調模型嗎？"
    answer: "不行。GPUFlow 讓您透過 API 以聊天方式使用模型。要訓練或微調，您需要能提供整台機器的平台，例如 Vast.ai、RunPod 或 TensorDock。"
  - question: "哪些平台接受加密貨幣？"
    answer: "Vast.ai 透過 BitPay 和 Crypto.com 接受加密貨幣，RunPod 接受加密貨幣（第一次用加密貨幣付款前需要完成 KYC），SaladCloud 接受 Solana 上的 USDC、USDT 和 RENDER。GPUFlow 透過 Stripe 接受信用卡付款。"
---

「租 GPU」在不同平台上意思各不相同。有些平台給您一個可以登入的完整容器。有些給您一個端點，由平台替您執行容器。在 GPUFlow 上，您拿到的是一組用來呼叫 AI 模型的 API 金鑰。怎麼選，與其說看價格，不如說看您要做什麼。

我們比較了四個出租 RTX 3090 和 4090 等消費級 GPU 的平台。所有內容都在 2026 年 9 月依各平台自己的文件和價格頁面查核過，來源列在文末。

## 實際租到什麼

| | GPUFlow | Vast.ai | RunPod | SaladCloud |
| --- | --- | --- | --- | --- |
| **租到的東西** | 一組 API 金鑰，用來呼叫一張 GPU 上的 AI 模型 | 主機上的一個容器 | 一個 Pod（容器），或 Serverless worker | 在家用電腦上執行的容器群組 |
| **使用方式** | 相容 OpenAI 的 API：`/v1/models`、`/v1/chat/completions` | SSH、Jupyter | SSH、JupyterLab、VS Code、網頁代理 | 您容器自己的 API；可 SSH 進入執行中的執行個體 |
| **執行自己的程式碼** | 不行 | 可以 | 可以 | 可以 |
| **第一次使用前的設定** | 不需要 | 選擇映像檔，下載您的模型 | 選擇範本，下載您的模型 | 建置並部署容器 |
| **GPU 在哪裡** | 提供者自己的電腦 | 從個人到資料中心都有 | Secure Cloud（資料中心）和 Community Cloud | 消費級電腦（「Chefs」） |

## 費用

| | GPUFlow | Vast.ai | RunPod | SaladCloud |
| --- | --- | --- | --- | --- |
| **計費** | 按秒，最低 1 分鐘 | 按秒，無最低計費 | 按秒 | 按秒 |
| **儲存費** | 無 | 由主機設定，停止時也收費 | 每 GB 每月 $0.10；已停止 Pod 的 volume 為 $0.20 | 未說明（GPU 價格已含 vCPU 和 RAM） |
| **資料傳輸** | 無 | 由主機設定，每個位元組都計費 | 免費 | 未說明 |
| **開始使用** | 最低儲值 $10，不收手續費 | 最低儲值 $5 | 至少 1 小時的額度；預付卡 $100 | 儲值從 $5 起 |
| **付款方式** | 信用卡（Stripe） | 信用卡、BitPay、Crypto.com | 信用卡、加密貨幣、$5,000 以上可開發票 | 信用卡、Solana 上的加密貨幣 |
| **額度期限** | 沒有期限；未使用的租用時間會退回 | — | — | 購買後 12 個月 |

破折號表示我們在該平台的文件中沒有找到相關規定。

## 常見顯示卡價格，2026 年 9 月

每張 GPU 每小時，隨選價格：

| GPU | Vast.ai | RunPod Community / Secure | SaladCloud |
| --- | --- | --- | --- |
| RTX 3090 | 約 $0.11 – $0.12 起 | $0.22 / $0.50 | $0.17 |
| RTX 4090 | 約 $0.37 起 | $0.34（缺貨）/ $0.74 | $0.33 |
| RTX 5090 | 約 $0.43 | $0.69（缺貨）/ $0.99 | $0.50 |

Vast.ai 和 SaladCloud 的價格取自 getdeploying.com，因為我們查詢時 Vast 自己的價格表無法載入。SaladCloud 也以較低價格出售優先順序較低、可能被中斷的運算資源。RunPod 在 2026 年 9 月 20 日調漲了 Secure Cloud 的價格；Community Cloud 的價格沒有變動。

在 GPUFlow 上，每位提供者自行定價。各租用網站的常見範圍是 RTX 3090 $0.11 – $0.31、RTX 4090 $0.30 – $0.46，GPUFlow 的上架表單會讓提供者看到自己的價格落在這個範圍的哪裡。

請記得，這些不是同樣的產品。一個要花 20 分鐘設定的 $0.30 容器，和一組立刻就能用的 $0.35 API 金鑰，做一小時的工作花費並不相同。[GPU 租用的真實成本](/zh_tw/hidden-fees-in-gpu-rental/)一文詳細說明了這些額外費用。

## 哪一個適合您的工作

### 訓練或微調模型

**Vast.ai 或 RunPod**。您需要完整的環境：您的程式碼、您的資料、您的函式庫。Vast.ai 通常比較便宜；RunPod 有更多現成範本，還有資料中心等級的方案。我們的[Stable Diffusion LoRA 訓練教學](/zh_tw/stable-diffusion-lora-training-under-10-dollars/)估算了在這兩個平台上跑一次典型訓練的費用。GPUFlow 做不到這件事：它不提供機器。

### 大規模執行自己的容器

**SaladCloud 或 RunPod Serverless**。兩者都能把您的容器分散到許多 GPU 上執行，並自動處理擴充。Salad 在消費級電腦上執行，所以執行個體可能被中斷，本機儲存也不會保留；請依此設計您的工作。RunPod Serverless 除了處理時間，還會另外收取啟動時間和閒置逾時的費用。

### 從應用程式、腳本或聊天工具呼叫開源模型

**GPUFlow**，前提是有提供者執行您要的模型。您會拿到一組相容 OpenAI 的金鑰，所以 OpenAI 函式庫、LangChain、Open WebUI 和大多數聊天應用程式，只要改掉 Base URL 就能使用。不需要維護伺服器，您預訂的時數按秒計費。如果提早結束，剩下的會退回您的額度。[如何在您的工具中使用金鑰](/zh_tw/use-openai-compatible-api-key-in-apps/)。

GPUFlow 不提供的功能：嵌入、圖片生成、Responses API，以及執行您自己的程式碼。另外，模型在提供者自己的電腦上執行，所以您的提示詞會經過那台電腦。不要傳送任何您不願意讓陌生人看到的內容。

### 買 GPU 之前先試用模型

**哪一個都可以**。在 GPUFlow 上只要幾分鐘，不需要任何設定。在 Vast.ai 或 RunPod 上，您還可以測試自己的推論伺服器設定。不管哪一種，一小時的費用都比一杯咖啡便宜。

### 只需要熱門模型的便宜 token

**可能這幾個都不適合**。如果有代管 API 提供您要的模型，按 token 計價可能遠比租 GPU 便宜。我們在[按小時租 GPU，還是按 token 付費的 API](/zh_tw/hourly-gpu-vs-per-token-api/) 一文中做了試算。

## 如果您有 GPU 要出租

| | GPUFlow | Vast.ai | Salad |
| --- | --- | --- | --- |
| **作業系統** | 使用 systemd 的 64 位元 Linux | Ubuntu | Windows 10/11 |
| **租用者能存取的東西** | 透過 GPUFlow 中繼伺服器存取您的 AI 模型。[沒有 shell，不開放連接埠](/zh_tw/is-it-safe-to-rent-out-your-gpu/) | 您機器上的一個容器 | Salad 的工作負載 |
| **您的分潤** | 88% | Vast 表示刊登價格通常比主機實際收入高約 25% | 未公開 |
| **提領** | 透過 Stripe 匯入銀行，最低 $25，每次提領 $2.50 | Wise、PayPal 或 Stripe，最低 $20 | PayPal、禮物卡等 |

每張卡的完整試算，請參閱[您的遊戲顯示卡能賺多少](/zh_tw/how-much-can-you-earn-renting-out-your-gpu/)。

## 總結

- **需要一台機器？** 要便宜選 Vast.ai，要方便或需要資料中心方案選 RunPod。
- **需要可擴充的容器服務？** SaladCloud 或 RunPod Serverless。
- **需要一個透過 OpenAI 風格 API 呼叫、完全不用設定的 AI 模型？** GPUFlow。
- **需要熱門模型最便宜的 token？** 先看看代管的按 token 計價 API。

## 資料來源

皆於 2026 年 9 月查核。

- GPUFlow：[租用](https://docs.gpuflow.app/zh-tw/renters/getting-started/)、[計費](https://docs.gpuflow.app/zh-tw/renters/billing/)、[API](https://docs.gpuflow.app/zh-tw/renters/api-quickstart/)、[提供者](https://docs.gpuflow.app/zh-tw/providers/getting-started/)、[收款](https://docs.gpuflow.app/zh-tw/providers/getting-paid/)、[價格範圍](https://docs.gpuflow.app/zh-tw/providers/pricing/)
- Vast.ai：[快速入門](https://docs.vast.ai/guides/get-started/quickstart.md)、[價格](https://docs.vast.ai/guides/instances/pricing.md)、[計費](https://docs.vast.ai/documentation/reference/billing)、[主機託管](https://docs.vast.ai/host/hosting-overview.md)、[主機提領](https://docs.vast.ai/host/payment.md)、[主機收入](https://vast.ai/article/how-much-money-can-you-earn-renting-out-your-gpu-on-vast-ai)
- RunPod：[價格](https://www.runpod.io/pricing)、[Pod 價格](https://docs.runpod.io/pods/pricing)、[Serverless 價格](https://docs.runpod.io/serverless/pricing)、[計費](https://docs.runpod.io/references/billing-information)、[Pod](https://docs.runpod.io/pods/overview)
- RunPod Secure Cloud 價格調整：[usagepricing.com](https://www.usagepricing.com/blueprint/activity/runpod-2026-09-20-secure-cloud-price-hike)
- SaladCloud：[計費](https://docs.salad.com/general/explanation/billing.md)、[容器計費](https://docs.salad.com/container-engine/explanation/billing-pricing/billing.md)、[優先順序定價](https://docs.salad.com/container-engine/explanation/billing-pricing/priority-pricing.md)、[SSH](https://docs.salad.com/container-engine/explanation/container-groups/ssh-and-terminal.md)、[Salad 主機](https://salad.com/download/)
- 價格：getdeploying.com 的 [RTX 3090](https://getdeploying.com/reference/cloud-gpu/nvidia-rtx-3090)、[RTX 4090](https://getdeploying.com/reference/cloud-gpu/nvidia-rtx-4090)、[RTX 5090](https://getdeploying.com/reference/cloud-gpu/nvidia-rtx-5090)、[Vast.ai](https://getdeploying.com/vast-ai)、[Salad](https://getdeploying.com/salad)
