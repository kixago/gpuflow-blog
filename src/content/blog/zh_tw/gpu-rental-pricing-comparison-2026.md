---
title: "2026 GPU 租用價格比較：AWS、Google Cloud、Azure、RunPod、Vast"
description: "2026 年 9 月 AWS、Google Cloud、Azure、Lambda、RunPod、Vast.ai 和 GPUFlow 的 GPU 每小時租用價格：從 RTX 3090 到 H100，隨選與 Spot 價格，附實際成本試算。"
excerpt: "同一張 H100，在 Google Cloud 每小時 $11.06，在 Vast.ai 不到 $2。以下是 2026 年 9 月常見 GPU 的價格、每個數字包含了什麼，以及三種實際工作的花費。"
pubDate: 2026-02-07
updatedDate: 2026-09-30
locale: "zh_tw"
category: "pricing"
featured: false
draft: false
author: "GPUFlow Team"
heroImage: "../_images/gpu-rental-pricing-comparison-2026-hero.png"
heroImageAlt: "長短不一的橫條，比較各家雲端服務商與市集的 GPU 每小時租用價格"
faq:
  - question: "2026 年租一張 H100 每小時要多少錢？"
    answer: "2026 年 9 月，一張 H100 在 AWS 每小時 $6.88（p5.4xlarge），在 Azure 是 $6.98（94 GB 的 H100 NVL），在 Google Cloud 的 8 GPU A3 機器上每張約 $11.06，Lambda 是 $3.99，RunPod 是 $2.69 到 $3.49，Vast.ai 則約 $1.47 起。"
  - question: "租 RTX 4090 最便宜的方式是什麼？"
    answer: "找市集。2026 年 9 月，最便宜的隨選 RTX 4090 在 Vast.ai 每小時約 $0.31 到 $0.33，在 RunPod Community Cloud 是 $0.34。RunPod Secure Cloud 收 $0.74。AWS、Google Cloud 和 Azure 不出租消費級 RTX 顯示卡。"
  - question: "A100 80GB 每小時多少錢？"
    answer: "以 2026 年 9 月為準：RunPod Community Cloud $1.39，RunPod Secure Cloud $1.59，Lambda 每張 $2.79，Azure $3.67（NC24ads A100 v4），Google Cloud $5.07（a2-ultragpu-1g），AWS 每張 $3.43，但必須以每小時 $27.45 整台租下 p4de.24xlarge 的八張 GPU。"
  - question: "為什麼 AWS、Google Cloud 和 Azure 的 GPU 貴這麼多？"
    answer: "它們的 GPU 執行個體綁了大量 CPU、記憶體和本機 NVMe，有些 GPU 只以 8 GPU 機器的形式出售。您同時也在為 SLA，以及讓 GPU 和雲端帳戶裡其他服務放在一起付費。Spot 價格和 1 到 3 年的承諾用量方案，能拉近大部分差距。"
  - question: "GPUFlow 的價格怎麼算？"
    answer: "每位提供者為自己的 GPU 設定以美元計價的每小時價格。您以整小時預訂，租用開始時整筆金額會從您的額度中預留，實際按秒計費，最低 1 分鐘。租用結束時，沒用到的時間會退回您的額度。提供者拿 88%，GPUFlow 拿 12%。"
  - question: "Spot GPU 執行個體值得用嗎？"
    answer: "如果工作能從檢查點重新開始，值得：2026 年 9 月，AWS 的 p5.4xlarge H100 用 Spot 每小時 $2.62，隨選則是 $6.88。如果工作不能被中斷，只要有一次得重跑，省下的錢就沒了。"
---

2026 年 9 月，一張 H100 在 AWS 或 Azure 每小時約 $6.90，在 Google Cloud 每張 $11.06，Lambda $3.99，RunPod $2.69 到 $3.49，Vast.ai 則約 $1.50 起。消費級顯示卡只有市集在租：RTX 4090 便宜的每小時 $0.31 到 $0.34，RunPod 的資料中心等級則是 $0.74。同一張 H100，最貴的隨選一小時大約是最便宜的七倍半。

本文接下來說明每個數字的來源、每小時價格包含什麼，以及三種典型工作從頭到尾要花多少錢。除非另外註明，所有價格都是隨選價格、美國區域（AWS 為 us-east-1，Azure 為 East US，Google Cloud 為 us-central1）、Linux，於 2026 年 9 月查核。價格每個月都在變，請把它當成一個時間點的快照，花錢之前先到來源確認。

## 價格一覽

資料中心 GPU，每張 GPU 每小時的美元價格：

| 平台 | L4 24 GB | A10G / A10 24 GB | A100 80 GB | H100 |
| --- | --- | --- | --- | --- |
| AWS | $0.81（g6.xlarge） | $1.01（g5.xlarge，A10G） | $3.43（只有 8 GPU 的 p4de） | $6.88（p5.4xlarge） |
| Google Cloud | $0.71（g2-standard-4） | 無 | $5.07（a2-ultragpu-1g） | $11.06（8 GPU A3，÷ 8） |
| Azure | 無 | $3.20（NV36ads A10 v5） | $3.67（NC24ads A100 v4） | $6.98（NC40ads H100 v5，NVL 94 GB） |
| Lambda | 無 | 無 | $2.79 | $3.99 |
| RunPod Community / Secure | 無 / $0.49 | 無 | $1.39 / $1.59 | $2.69 / $3.49 |
| Vast.ai | 約 $0.27 起 | 無 | 約 $0.43 起 | 約 $1.47 起 |

「無」表示我們在該平台的價目表上找不到對應的單 GPU 選項。消費級顯示卡，每小時美元價格：

| GPU | Vast.ai（最低上架價） | RunPod Community / Secure | 各租用網站的常見範圍 |
| --- | --- | --- | --- |
| RTX 3090 24 GB | $0.11 – $0.13 | $0.22 / $0.50 | $0.11 – $0.31 |
| RTX 4090 24 GB | $0.31 – $0.33 | $0.34 / $0.74 | $0.30 – $0.46 |
| RTX 5090 32 GB | $0.41 – $0.47 | $0.69 / $0.99 | $0.41 – $0.69 |

AWS、Google Cloud、Azure 和 Lambda 都沒有列出消費級 RTX 顯示卡。Vast.ai 的數字寫成範圍，是因為 getdeploying.com 同一天的兩份快照給出的最低價略有不同，這本身就說明了市集價格的性質。最後一欄是 [GPUFlow 提供者定價指南](https://docs.gpuflow.app/zh-tw/providers/pricing/)在 2026 年 9 月從 Vast.ai、RunPod、Salad、SimplePod、TensorDock、Hyperstack 和 Lambda 整理出的範圍。

## 每小時價格包含什麼

這些數字買到的並不完全是同一種東西，這一點比小數點後第二位重要得多。

大型雲端的執行個體除了 GPU，還綁了很多東西。AWS 的 p5.4xlarge 附 16 個 vCPU、256 GiB 記憶體和 3.84 TB 本機 NVMe。Azure 的 NC24ads A100 v4 有 24 個 vCPU 和 220 GiB 記憶體。Azure 的整張 A10 規格 NV36ads A10 v5 有 36 個 vCPU、440 GiB 記憶體，外加虛擬工作站用的 GRID 授權，這也部分解釋了為什麼它的價格是 AWS 類似顯示卡的三倍。就算您只需要 GPU，這些還是得一起付。

有些 GPU 只裝在大機器裡賣。AWS 的 A100 80 GB 以 p4de.24xlarge 出售：八張 GPU，每小時 $27.45，沒有更小的規格。表中 Google Cloud 的 A3 High H100 機器是 8 GPU 的 a3-highgpu-8g，每小時 $88.49。Lambda 的價目表列的是每張 GPU 的價格，但它在 H100 旁邊列出的機器規格（208 個 vCPU、1,800 GiB 記憶體）是一台多 GPU 系統，所以在以 $3.99 做規劃之前，請先確認實際租得到哪些規格。

市集價格由機器的擁有者決定。在 Vast.ai 上，每位主機自行定價，儲存和頻寬也在每筆上架資訊裡分開計價。RunPod 的 Community Cloud 串連獨立的提供者；Secure Cloud 則在 Tier 3 和 Tier 4 資料中心運作。同一張 RTX 4090，前者 $0.34，後者 $0.74。

每小時價格沒算進去的部分（磁碟、資料傳輸、準備時間、閒置時間），在[租用 GPU 的真實成本](/zh_tw/hidden-fees-in-gpu-rental/)裡有說明。小型工作的這些額外費用，可能比 GPU 時間本身還多。

## H100 價格並排比較

<figure>
<svg viewBox="0 0 720 380" role="img" aria-labelledby="d1-title" xmlns="http://www.w3.org/2000/svg" font-family="system-ui, sans-serif" font-size="15">
<title id="d1-title">2026 年 9 月隨選 H100 每張 GPU 每小時價格長條圖，從 Google Cloud 的 11.06 美元到 Vast.ai 的 1.47 美元</title>
<rect x="0" y="0" width="720" height="380" fill="#ffffff"/>
<text x="20" y="28" fill="#1e1b4b" font-weight="600">單張 H100 隨選價格，每 GPU 小時（美元）</text>
<line x1="190" y1="44" x2="190" y2="316" stroke="#e2e8f0" stroke-width="1"/>
<text x="190" y="336" text-anchor="middle" fill="#64748b" font-size="13">$0</text>
<line x1="270" y1="44" x2="270" y2="316" stroke="#e2e8f0" stroke-width="1"/>
<text x="270" y="336" text-anchor="middle" fill="#64748b" font-size="13">$2</text>
<line x1="350" y1="44" x2="350" y2="316" stroke="#e2e8f0" stroke-width="1"/>
<text x="350" y="336" text-anchor="middle" fill="#64748b" font-size="13">$4</text>
<line x1="430" y1="44" x2="430" y2="316" stroke="#e2e8f0" stroke-width="1"/>
<text x="430" y="336" text-anchor="middle" fill="#64748b" font-size="13">$6</text>
<line x1="510" y1="44" x2="510" y2="316" stroke="#e2e8f0" stroke-width="1"/>
<text x="510" y="336" text-anchor="middle" fill="#64748b" font-size="13">$8</text>
<line x1="590" y1="44" x2="590" y2="316" stroke="#e2e8f0" stroke-width="1"/>
<text x="590" y="336" text-anchor="middle" fill="#64748b" font-size="13">$10</text>
<line x1="670" y1="44" x2="670" y2="316" stroke="#e2e8f0" stroke-width="1"/>
<text x="670" y="336" text-anchor="middle" fill="#64748b" font-size="13">$12</text>
<text x="180" y="69" text-anchor="end" fill="#1e1b4b">Google Cloud</text>
<rect x="190" y="50" width="442.4" height="26" rx="3" fill="#6366f1"/>
<text x="640.4" y="69" fill="#1e1b4b">$11.06</text>
<text x="180" y="107" text-anchor="end" fill="#1e1b4b">Azure (H100 NVL)</text>
<rect x="190" y="88" width="279.2" height="26" rx="3" fill="#6366f1"/>
<text x="477.2" y="107" fill="#1e1b4b">$6.98</text>
<text x="180" y="145" text-anchor="end" fill="#1e1b4b">AWS</text>
<rect x="190" y="126" width="275.2" height="26" rx="3" fill="#6366f1"/>
<text x="473.2" y="145" fill="#1e1b4b">$6.88</text>
<text x="180" y="183" text-anchor="end" fill="#1e1b4b">Lambda</text>
<rect x="190" y="164" width="159.6" height="26" rx="3" fill="#16a34a"/>
<text x="357.6" y="183" fill="#1e1b4b">$3.99</text>
<text x="180" y="221" text-anchor="end" fill="#1e1b4b">RunPod Secure</text>
<rect x="190" y="202" width="139.6" height="26" rx="3" fill="#16a34a"/>
<text x="337.6" y="221" fill="#1e1b4b">$3.49</text>
<text x="180" y="259" text-anchor="end" fill="#1e1b4b">RunPod Community</text>
<rect x="190" y="240" width="107.6" height="26" rx="3" fill="#16a34a"/>
<text x="305.6" y="259" fill="#1e1b4b">$2.69</text>
<text x="180" y="297" text-anchor="end" fill="#1e1b4b">Vast.ai（最低）</text>
<rect x="190" y="278" width="58.8" height="26" rx="3" fill="#16a34a"/>
<text x="256.8" y="297" fill="#1e1b4b">$1.47</text>
<line x1="190" y1="44" x2="190" y2="316" stroke="#64748b" stroke-width="1.5"/>
<rect x="190" y="352" width="14" height="14" fill="#6366f1"/>
<text x="212" y="364" fill="#64748b" font-size="13">大型雲端</text>
<rect x="360" y="352" width="14" height="14" fill="#16a34a"/>
<text x="382" y="364" fill="#64748b" font-size="13">GPU 雲端與市集</text>
</svg>
<figcaption>2026 年 9 月單張 H100 的隨選價格。Google Cloud 的價格是 8 GPU A3 機器除以 8。Azure 的單 GPU 規格使用 94 GB 的 H100 NVL。Vast.ai 是 getdeploying.com 當天回報的最低上架價。</figcaption>
</figure>

這張圖是依比例繪製的。有兩點很明顯。三大雲端每張 GPU 集中在 $7 左右，Google Cloud 的 8 GPU A3 機器還高出一大截。而 AWS 和最便宜的 Vast.ai 上架價之間差了四倍以上，做的卻是同樣的運算。

多花的錢確實買到了東西：SLA、合規文件、其他基礎設施就在旁邊，還有支援合約。在市集上放棄的東西也是真的：主機可能是小型業者，可靠度因上架資訊而異，而且沒有 SLA。週末做實驗，市集輕鬆勝出。受法規管制的正式環境系統，市集往往根本不在選項內。

## Spot 與可中斷價格

這次比較的每個平台都會把閒置容量便宜賣出，代價是隨時可能被收回。

| 執行個體 | 隨選 | Spot | 節省 |
| --- | --- | --- | --- |
| AWS g6.xlarge（1× L4） | $0.805 | $0.605 | 25% |
| AWS g5.xlarge（1× A10G） | $1.006 | $0.469 | 53% |
| AWS p5.4xlarge（1× H100） | $6.88 | $2.623 | 62% |
| Google Cloud g2-standard-4（1× L4） | $0.707 | $0.403 | 43% |
| Google Cloud a3-highgpu-8g（8× H100） | $88.49 | $41.60 | 53% |
| Azure NC24ads A100 v4（1× A100 80 GB） | $3.673 | $0.679 | 82% |
| Azure NC40ads H100 v5（1× H100 NVL） | $6.98 | $1.29 | 82% |

Azure 的 Spot 價格取自它的零售價格 API，A100 和 H100 的 Spot 費率分別在 2026 年 7 月和 8 月生效。這個 H100 Spot 價格，比我們在市集上找到最便宜的隨選 H100 還低。Spot 價格經常變動，也不保證有容量，所以這只是一個時間點的快照。

在 Vast.ai 上，依它的文件，可中斷執行個體「通常比隨選便宜 50% 以上」；getdeploying.com 上的 RTX 3090 可中斷方案從 $0.08 起。Spot 只有在工作會寫入檢查點、能從中斷處接著做的時候才省錢。否則一次中斷，就代表同樣的時數要付兩次錢。

## GPUFlow 的定位

GPUFlow 也是市集，但租的東西範圍比較窄。提供者在自己的 Linux 機器上執行 AI 模型（通常用 Ollama），您按小時租用其中一張 GPU，取得一組相容 OpenAI 的 API 金鑰（base URL 為 `https://gpuflow.app/v1`，提供 `/v1/chat/completions` 和 `/v1/models`）。沒有 SSH、沒有 shell，也不能存取檔案，所以無法訓練、微調或執行自己的程式碼。如果只是要從腳本或應用程式呼叫開放模型，這樣就完全省掉了準備工作：模型已經裝在提供者的機器上。

GPUFlow 不訂價，所以表格裡沒有 GPUFlow 的價格可以填。價格的運作方式如下：

- 每位提供者為自己的上架資訊設定以美元計價的每小時價格。設定時，上架表單會顯示這個價格落在其他租用網站價格範圍的哪個位置，以及扣掉手續費後能拿到多少。
- 您以整小時預訂，預設 1 到 168 小時。租用開始時，整筆預訂金額會從您的額度中預留。
- 按秒計費，最低 1 分鐘，無條件進位到下一分錢（[GPU 按秒計費 vs 按小時計費](/zh_tw/per-second-vs-hourly-gpu-billing/)有完整試算）。提早結束或時間用完時，預留金額中沒用到的部分會直接退回您的額度。
- 如果提供者的機器 10 分鐘沒有回應，租用就會結束，您只需付到機器最後一次心跳為止的費用。
- Token 會計數，但不收費。帳單上沒有磁碟或資料傳輸的項目，因為您根本沒有一台可以存檔案的機器。
- 額度透過 Stripe 刷卡購買，每次儲值 $10 到 $500，不收手續費。1 額度 = $0.01，額度不會過期。每筆收費由提供者拿 88%，GPUFlow 拿 12%。

![GPUFlow 上架表單，每小時價格 $0.35，旁邊的長條圖將它與其他租用網站 RTX 4090 的 $0.30 到 $0.46 範圍相比，並顯示扣除 12% 手續費後提供者可得 $0.31](../_images/screens/zh_tw/provider-price-bar.png)

想更完整地比較租 API 金鑰和租容器，請看 [GPUFlow vs Vast.ai vs RunPod vs SaladCloud](/zh_tw/gpuflow-vs-vast-ai-vs-runpod/)。如果您要比較按小時的 GPU 價格和按 token 計費的 API，[試算在這裡](/zh_tw/hourly-gpu-vs-per-token-api/)。

## 試算一：在 24 GB 顯示卡上跑 3 小時的批次工作

假設您要用一個 7B 到 8B 的開放模型處理一大批文件，大約三小時。任何 24 GB 的顯示卡都可以。

| 選項 | 算式 | GPU 費用 |
| --- | --- | --- |
| Vast.ai RTX 4090 | 3 × $0.31 | $0.93 |
| RunPod Community RTX 4090 | 3 × $0.34 | $1.02 |
| Google Cloud L4（g2-standard-4） | 3 × $0.707 | $2.12 |
| RunPod Secure RTX 4090 | 3 × $0.74 | $2.22 |
| AWS L4（g6.xlarge） | 3 × $0.805 | $2.42 |
| AWS A10G（g5.xlarge） | 3 × $1.006 | $3.02 |

以上每個選項，您都還要付準備時間的錢：在計費時間內安裝推論伺服器、下載模型。二十分鐘的準備，在 Vast.ai 那張卡上多 $0.10，在 AWS L4 上多 $0.27。

在 GPUFlow 上，以一筆每小時 $0.35 的上架資訊為例（這是截圖裡的價格，不是報價）。您預訂 3 小時，所以預留 $1.05。工作在 2 小時 10 分鐘（7,800 秒）後完成，您結束租用。費用是 7,800 × 35 ÷ 3,600 = 75.8 分，進位為 $0.76，$0.29 退回您的額度。前提是有提供者在跑您要的模型。

## 試算二：在 A100 80 GB 上微調 8 小時

微調需要一台您能控制的機器，所以這裡用不了 GPUFlow。

| 選項 | 算式 | 費用 |
| --- | --- | --- |
| Vast.ai，最低 A100 上架價 | 8 × $0.43 | $3.44 |
| RunPod Community A100 SXM | 8 × $1.39 | $11.12 |
| RunPod Secure A100 SXM | 8 × $1.59 | $12.72 |
| Lambda A100 SXM 80 GB | 8 × $2.79 | $22.32 |
| Azure NC24ads A100 v4 | 8 × $3.673 | $29.38 |
| Google Cloud a2-ultragpu-1g | 8 × $5.069 | $40.55 |
| AWS p4de.24xlarge（8 GPU） | 8 × $27.45 | $219.60 |

Vast.ai 那一列是 getdeploying.com 回報的最便宜 A100 上架價（一台 2 GPU 機器裡的 SXM 卡，沒有標示記憶體大小），要依這個價格做打算之前，請先看清楚上架資訊。AWS 那一列不是打錯：如果您在 AWS 上需要一張 A100 80 GB，就得租八張。Lambda 那一列假設您租得到對應的規格，請見上面的說明。

如果您的訓練迴圈每 15 到 30 分鐘存一次檢查點，Azure 每小時 $0.679 的 Spot 價格能讓這份工作降到 $5.43，前提是您搶得到容量。

## 試算三：一張 L4 全天候提供服務

一個小型推論端點，跑滿一個 720 小時的月份：

| 選項 | 算式 | 每月 |
| --- | --- | --- |
| Vast.ai L4，最低上架價 | 720 × $0.27 | $194.40 |
| RunPod Secure L4 | 720 × $0.49 | $352.80 |
| AWS g6.xlarge，1 年預留 | 720 × $0.524 | $377.28 |
| Google Cloud g2-standard-4 | 720 × $0.707 | $509.04 |
| AWS g6.xlarge，隨選 | 720 × $0.805 | $579.60 |

到了這種時間長度，承諾用量折扣就開始有影響：同一個執行個體，AWS 的 1 年預留價格比隨選低 35%。市集仍然最便宜，但單一主機就是單一故障點。如果這個端點有使用者，您大概會想要兩台機器，市集那一列就要乘以二，差距也就沒看起來那麼大。

## 我會怎麼選

實驗、圖片生成、[LoRA 訓練](/zh_tw/stable-diffusion-lora-training-under-10-dollars/)，以及任何可以重來的工作：市集上的 RTX 3090 或 4090。便宜的每小時 $0.11 到 $0.34，大型雲端沒有一個比得上。

需要 A100 或 H100、又不受法規管制的大模型：先看 RunPod 或 Lambda，[如果願意逐一檢查主機的可靠度分數，再看 Vast.ai](/zh_tw/runpod-vs-vastapi-comparison/)。做決定之前也看一下 Azure 和 Google Cloud 的 Spot 價格；2026 年 9 月時它們出乎意料地有競爭力。

受管制的資料、公司本來就在 AWS、Azure 或 Google Cloud 上，或任何需要 SLA 的東西：留在原本的雲端，用承諾用量或 Spot 容量把價格壓下來。H100 每小時付 $7，往往比對新廠商做一次資安審查還便宜。

從程式碼呼叫開放模型、又不想自己架伺服器：用 API。如果有按 token 計費的 API 提供您要的模型，就用它；如果想以固定的每小時價格使用某位提供者的模型，就在 GPUFlow 上按小時租。帳戶方面的準備，請看[租用 GPU 需要準備什麼](/zh_tw/what-you-need-to-rent-a-gpu/)。

## 資料來源

- AWS：[EC2 隨選價格](https://aws.amazon.com/ec2/pricing/on-demand/)、[P5 執行個體](https://aws.amazon.com/ec2/instance-types/p5/)、[P4 執行個體](https://aws.amazon.com/ec2/instance-types/p4/)。每小時價格取自 Vantage 轉錄的 AWS 價目表：[g6.xlarge](https://instances.vantage.sh/aws/ec2/g6.xlarge?region=us-east-1)、[g5.xlarge](https://instances.vantage.sh/aws/ec2/g5.xlarge?region=us-east-1)、[p5.4xlarge](https://instances.vantage.sh/aws/ec2/p5.4xlarge?region=us-east-1)、[p5.48xlarge](https://instances.vantage.sh/aws/ec2/p5.48xlarge?region=us-east-1)、[p4de.24xlarge](https://instances.vantage.sh/aws/ec2/p4de.24xlarge?region=us-east-1)
- Google Cloud：[加速器最佳化 VM 價格](https://cloud.google.com/products/compute/pricing/accelerator-optimized)、[VM 執行個體價格](https://cloud.google.com/compute/vm-instance-pricing)
- Azure：[Linux 虛擬機器價格](https://azure.microsoft.com/en-us/pricing/details/virtual-machines/linux/)、[Azure 零售價格 API](https://prices.azure.com/api/retail/prices)，規格：[NC A100 v4](https://learn.microsoft.com/en-us/azure/virtual-machines/sizes/gpu-accelerated/nca100v4-series)、[NCads H100 v5](https://learn.microsoft.com/en-us/azure/virtual-machines/sizes/gpu-accelerated/ncadsh100v5-series)、[NVads A10 v5](https://learn.microsoft.com/en-us/azure/virtual-machines/sizes/gpu-accelerated/nvadsa10v5-series)
- Lambda：[價格](https://lambda.ai/pricing)
- RunPod：[價格](https://www.runpod.io/pricing)、[RTX 3090](https://www.runpod.io/gpu-models/rtx-3090)、[RTX 4090](https://www.runpod.io/gpu-models/rtx-4090)、[RTX 5090](https://www.runpod.io/gpu-models/rtx-5090)、[A100 SXM](https://www.runpod.io/gpu-models/a100-sxm)、[H100 SXM](https://www.runpod.io/gpu-models/h100-sxm)、[Pod 概覽](https://docs.runpod.io/pods/overview)
- Vast.ai：[價格文件](https://docs.vast.ai/guides/instances/pricing.md)。市集價格取自 getdeploying.com：[Vast.ai](https://getdeploying.com/vast-ai)、[RTX 3090](https://getdeploying.com/reference/cloud-gpu/nvidia-rtx-3090)、[RTX 4090](https://getdeploying.com/reference/cloud-gpu/nvidia-rtx-4090)、[RTX 5090](https://getdeploying.com/reference/cloud-gpu/nvidia-rtx-5090)、[A100](https://getdeploying.com/reference/cloud-gpu/nvidia-a100)、[H100](https://getdeploying.com/reference/cloud-gpu/nvidia-h100)
- GPUFlow：[如何為您的 GPU 定價](https://docs.gpuflow.app/zh-tw/providers/pricing/)、[計費](https://docs.gpuflow.app/zh-tw/renters/billing/)、[API 快速入門](https://docs.gpuflow.app/zh-tw/renters/api-quickstart/)、[市集](https://gpuflow.app/zh-TW/marketplace)

皆於 2026 年 9 月查核。
