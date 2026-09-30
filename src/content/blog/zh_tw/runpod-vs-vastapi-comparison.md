---
title: "2026 RunPod vs Vast.ai：價格、可靠度與儲存比較"
description: "RunPod 和 Vast.ai 比較，2026 年 9 月查核：RTX 4090 與 3090 租用價格、按秒計費、可中斷 pod、儲存費用、serverless，以及各自適合誰。"
excerpt: "Vast.ai 的每 GPU 小時通常比較便宜；RunPod 比較單純，儲存空間還能跟著您換機器。最新價格、計費規則和選擇流程。"
pubDate: 2026-02-12
updatedDate: 2026-09-30
locale: "zh_tw"
category: "comparisons"
featured: false
draft: false
author: "GPUFlow Team"
heroImage: "../_images/runpod-vs-vastai-comparison.png"
heroImageAlt: "左右分割的畫面，以 GPU 伺服器介面代表 RunPod 和 Vast.ai 兩個平台"
faq:
  - question: "RTX 4090 在 RunPod 和 Vast.ai 哪邊比較便宜？"
    answer: "通常是 Vast.ai。2026 年 9 月，getdeploying.com 列出的 Vast.ai RTX 4090 隨選每小時 $0.31 起，可中斷 $0.21 起；RunPod Community Cloud 是 $0.34，RunPod Secure Cloud 是 $0.74。Vast.ai 另外收資料傳輸費，RunPod 則不收。"
  - question: "RunPod 和 Vast.ai 是按秒計費嗎？"
    answer: "是，兩者的 GPU 時間都按秒計算。RunPod 的網路磁碟區按小時計費，而且 pod 啟動前需要有至少夠您所選配置用一小時的額度。Vast.ai 只要執行個體存在就收儲存費，停止期間也一樣。"
  - question: "已停止的 pod 或執行個體還會花錢嗎？"
    answer: "兩邊都會。RunPod 對已停止 pod 的 volume 磁碟每 GB 每月收 $0.20，網路磁碟區則以每 GB 每月 $0.07 持續計費。Vast.ai 會持續收取主機的儲存費率，直到您銷毀執行個體為止。"
  - question: "在 RunPod 或 Vast.ai 上餘額用完會怎樣？"
    answer: "RunPod 會停止有網路磁碟區的 pod，並終止沒有網路磁碟區的 pod，其資料無法復原。Vast.ai 在餘額歸零時停止執行個體，如果沒有儲存信用卡來補足負餘額，就會銷毀執行個體和其中的資料。"
  - question: "RunPod 或 Vast.ai 可以用加密貨幣付款嗎？"
    answer: "可以。RunPod 接受信用卡、完成 KYC 驗證後的加密貨幣，以及超過 $5,000 訂單的請款單。Vast.ai 透過 Stripe 接受信用卡，透過 BitPay 和 Crypto.com 接受加密貨幣，最低儲值 $5。"
  - question: "Vast.ai 夠可靠，能用在正式環境嗎？"
    answer: "要看您選哪台主機。每台 Vast.ai 機器的可靠度分數都從 60% 開始，並隨紀錄變化；Vast 建議正式環境使用資料中心主機（通過 ISO 27001 認證，以藍色標籤顯示）。RunPod Secure Cloud 則在 T3/T4 資料中心運作。"
---

兩者之中，Vast.ai 通常比較便宜：2026 年 9 月，那裡的 RTX 4090 隨選每小時 $0.31 起，RunPod Community Cloud 是 $0.34，RunPod Secure Cloud 是 $0.74。RunPod 是比較單純的產品：固定的價目表、免費的資料傳輸，還有網路磁碟區，讓您的檔案不必綁在任何一台機器上。價格最重要、而且您的工作撐得過主機消失時，選 Vast.ai；想少做一些決定、希望儲存空間不綁在某一台機器上時，選 RunPod。

以下內容都來自兩家公司的文件和價格頁面，Vast.ai 的市集價格則取自 getdeploying.com，全部於 2026 年 9 月查核。價格每週都在變，請把它當成一個時間點的快照。

## 一覽

| | RunPod | Vast.ai |
| --- | --- | --- |
| **模式** | 單一公司：Secure Cloud（資料中心）和 Community Cloud（經審核的個人主機） | 市集：主機從家用機器到通過認證的資料中心都有 |
| **誰訂價** | RunPod，固定價目表 | 各主機 |
| **計費** | 按秒；需要一小時的額度才能啟動 | 按秒 |
| **RTX 4090 每小時** | Community $0.34，Secure $0.74 | 隨選 $0.31 起，可中斷 $0.21 |
| **較便宜的方案** | Spot（可中斷）pod、3 或 6 個月的節省方案 | 可中斷（出價）、預留最多 5 折 |
| **停止時的儲存** | Volume 磁碟 $0.20/GB/月 | 主機費率，直到您銷毀為止 |
| **可移動的儲存** | 網路磁碟區，$0.07/GB/月 | 磁碟區綁定在單一機器上 |
| **資料傳輸** | 傳入傳出都免費 | 主機費率，按位元組計 |
| **Serverless** | Flex 和 active worker | 以執行個體價格計費的 serverless |
| **付款** | 信用卡、加密貨幣（完成 KYC 後）、超過 $5,000 可開請款單 | 信用卡、BitPay、Crypto.com；最低 $5 |

本文其餘部分說明這些列的來源，以及它們在哪裡會咬您一口。

## 兩種不同的公司

**RunPod** 有兩個資源池。用它自己的話說，Secure Cloud「在 T3/T4 資料中心運作」，目標是正式環境和敏感資料。Community Cloud 則「透過經過審核、安全的點對點系統，將個別運算提供者與使用者連結起來」。今年有一個細節變了：RunPod 的文件現在寫著它「不再接受新主機加入 Community Cloud」，不過既有的 Community 容量仍然可用。所以 RunPod 的便宜方案是一個固定大小的資源池，熱門顯示卡常常售罄。

**Vast.ai** 是市集。主機上架機器、自訂價格，您在其中一台上租用 Docker 容器（或 VM）。機器分成三個等級：未驗證（新機器）、已驗證（通過 Vast 自己的測試）和資料中心。資料中心主機必須持有 ISO/IEC 27001 或 Tier 2/3 評級、簽署託管協議、證明企業所有權，並上架至少五台 GPU 伺服器。這些方案帶有藍色標籤，組成 Vast 所謂的「Secure Cloud」。

兩家公司都用「Secure Cloud」稱呼自己的資料中心方案。意思相近，但審核方式不同，所以在向合規團隊做任何承諾之前，請先讀清楚各家的定義。

實務上，兩邊都給您一個可以用 SSH 和 Jupyter 的容器。RunPod 另外提供 VS Code 和 Cursor 連線，以及用來開放連接埠的網頁代理。日常工作（拉映像檔、掛載儲存空間、執行腳本）在兩邊都一樣。

## 常見顯示卡的價格

每張 GPU 每小時，除非另外註明都是隨選價格，2026 年 9 月：

| GPU | Vast.ai | RunPod Community | RunPod Secure |
| --- | --- | --- | --- |
| RTX 3090 | 隨選 $0.13，可中斷 $0.08 | $0.22 | $0.50 |
| RTX 4090 | 隨選 $0.31，可中斷 $0.21 | $0.34 | $0.74 |

Vast.ai 的價格是 getdeploying.com 在 2026 年 9 月 30 日列出的最低方案。$0.13 的 RTX 3090 價格來自一台 8 GPU 機器，$0.21 的 RTX 4090 可中斷價格來自加拿大的一台 4 GPU 機器，都是每張 GPU 的價格。單 GPU 方案有時會稍微高一點。RunPod 的價格取自它的價格頁面和 getdeploying.com。至於更大的顯示卡，RunPod Secure Cloud 的價目表上 RTX 5090 每小時 $0.99，A100 80 GB $1.59，H100 SXM $3.49。

RunPod 在 2026 年 9 月 20 日調漲了 11 項 Secure Cloud 價格。RTX 4090 從 $0.69 漲到 $0.74，A100 從 $1.39 漲到 $1.59，H100 SXM 從 $2.99 漲到 $3.49。RTX 3090 和 RTX 5090 沒有變，Community Cloud 的價格也都沒有變。

### 實際試算

在一張 RTX 4090 上微調十小時：

- Vast.ai 隨選：10 × $0.31 = $3.10，再加上主機對您搬動的資料所收的費用。
- Vast.ai 可中斷：10 × $0.21 = $2.10，前提是沒人出價比您高。如果有，您會損失從上一個檢查點以來的時間。
- RunPod Community：10 × $0.34 = $3.40，前提是有空著的卡。
- RunPod Secure：10 × $0.74 = $7.40。

單一工作的差距是幾美元。連續使用一個月（730 小時），Vast.ai 隨選是 $226，RunPod Secure 是 $540。如果您要為長時間執行的工作負載找地方落腳，要看的是這個數字。

### 可中斷與 Spot

兩邊都賣可能被收回的較便宜容量。

在 Vast.ai 上您要出價。可中斷執行個體「可能因更高的出價而被停止」，發生時「您的執行個體會被停止（執行中的程序會被終止）」。Vast 表示可中斷通常比隨選便宜 50% 以上。隨選執行個體正好相反：由主機設定固定價格，而且「不會被中斷」。

RunPod 稱之為可中斷或 Spot pod。它的 API 描述這類 pod「能以較低成本租用，但可能隨時被停止，以釋出資源給其他 Pod」。RunPod 自己的部落格舉過一個例子：RTX A6000 Spot 每小時 $0.232，隨選 $0.491。

不論哪一邊，規則都一樣：只用在會頻繁存檢查點、能在另一台機器上接著跑的工作。

### 承諾用量

RunPod 賣節省方案：預付 3 或 6 個月，換取 GPU 運算的折扣。不可退款、有固定的到期日，也不涵蓋儲存。Vast.ai 賣預留執行個體，依承諾時間長短最多打 5 折。在 Vast 上，預留的是某位主機的某台機器，所以預付之前請先確認那位主機的可靠度。

## 可靠度：資料中心 vs 主機市集

這是兩者差異最大的地方，也是價差的來源。

在 RunPod Secure Cloud 上，您是向一家掌控硬體和機房的公司租用。依 RunPod 的價格文件，隨選 pod 專屬於您，「不會被其他使用者擠掉」。在 RunPod 自己的比較表裡，Community Cloud 是可靠度「不一」的個人主機。

在 Vast.ai 上，您是向上架機器的那個人租用。Vast 提供了一些判斷工具：

- **可靠度分數。**「衡量機器歷來的上線時間與健康狀況。所有機器都從 60% 開始。」分數在 90 幾，代表長期、乾淨的紀錄。
- **已驗證 vs 未驗證。** 未驗證的機器是新的、未經測試的。
- **資料中心標籤。** 通過認證的機房，Vast 建議用於正式環境。
- **最長租期。** 每個方案都會顯示主機願意出租多久。方案「在到期日之前，或主機取消上架之前，都會保持可用……」，所以您喜歡的機器下個月不一定還在。

我在市集上租了好幾年之後的規則：先依可靠度篩選，再看價格，而且絕不把任何東西的唯一一份放在主機的磁碟上。一台跑到一半消失的 $0.25 機器，比一台不會消失的 $0.35 機器更花錢。

RunPod 有一個陷阱值得知道。重新啟動已停止的 pod 時，RunPod 會警告您「如果容量有變，可能會被分配到零張 GPU」。您的檔案還在，但那台機器上的 GPU 可能已經租給別人了。網路磁碟區就是為此而存在的。

## 儲存空間與停止的成本

儲存空間是每小時價格開始說不清楚的地方。GPU 停止計費時，它還在計費。

### RunPod

| 儲存 | 執行中 | 停止期間 |
| --- | --- | --- |
| 容器磁碟 | $0.10/GB/月 | 不收費（且會清除） |
| Volume 磁碟（/workspace） | $0.10/GB/月 | $0.20/GB/月 |
| 網路磁碟區，1 TB 以下 | $0.07/GB/月 | $0.07/GB/月 |
| 網路磁碟區，超過 1 TB | $0.05/GB/月 | $0.05/GB/月 |

容器磁碟和 volume 磁碟按秒計費；網路磁碟區按小時計費。容器磁碟是暫存空間，pod 停止時就會清除。Volume 磁碟在停止後仍會保留，但終止時會被刪除。網路磁碟區獨立於任何 pod，可以掛載到新的 pod 上，這就解決了「重新啟動時分到零張 GPU」的問題：停止、在別處啟動一個新的 pod、掛上同一個磁碟區。

實際試算：您在工作階段之間保留 100 GB 的模型和檢查點。放在已停止 pod 的 volume 磁碟上，每月 100 × $0.20 = $20。放在網路磁碟區上，每月 100 × $0.07 = $7，而且不綁在一台機器上。資料傳輸雙向都免費。

### Vast.ai

Vast 有容器儲存（隨執行個體一起刪除）和本機磁碟區。有兩條規則決定了您該怎麼用它：

- **磁碟大小在建立時就固定了。** 之後不能調整，所以第一次就要給得寬裕一點。
- **磁碟區綁定在一台實體機器上。** 它們「無法移動或掛載到其他機器上的執行個體」。

儲存價格因主機而異，會顯示在每個方案上（把游標移到 Rent 按鈕上）。只要執行個體存在就會計費：「執行個體停止後，儲存費用仍會持續。要停止儲存計費，必須完全銷毀執行個體。」Vast 也註明，機器離線期間絕不收費。

頻寬同樣由主機訂價，按位元組、雙向計費。下載一個 16 GB 的模型、上傳幾個檢查點，在多數主機上花不了多少錢，但搬大型資料集之前請先查費率。RunPod 則完全不收這筆錢。

每小時價格在各平台上沒算進去的完整清單，請看[租用 GPU 的真實成本](/zh_tw/hidden-fees-in-gpu-rental/)。

## 範本與準備工作

兩邊都使用 Docker 映像檔，也都把預設組態稱為「範本」（template）。

RunPod 的範本是「預先設定好的 Docker 映像檔組態，讓您不必手動設定環境就能快速啟動 Pod」：PyTorch、ComfyUI、推論伺服器，還有許多社群範本。選一個範本、選一張 GPU，幾分鐘內您就在 JupyterLab 或 SSH 裡了。

Vast.ai 也是同樣的概念。它的快速入門會引導您使用 PyTorch、TensorFlow、ComfyUI 等預建範本，或您自己的範本。準備步驟多幾個：租用前要驗證電子郵件、上傳 SSH 公鑰，還要安裝 Vast 的憑證，才能在瀏覽器裡使用 Jupyter。

因為兩邊都能用任何映像檔，範本在第一週之後就沒那麼重要了。實務上更大的差別是：在 RunPod 上，您的環境可以放在網路磁碟區上跟著您走；在 Vast.ai 上，您要不是每換一台機器就重建一次，就是把所有東西都打包進映像檔。

## Serverless

兩邊都能把您的容器當成自動擴展的端點來執行，但計費方式不同。

**RunPod Serverless** 有 flex worker，閒置時會縮減到零；還有 active worker，全天候執行並享有折扣（透過業務洽談）。您要付三個階段的錢：啟動時間（載入容器並把模型載入 GPU 記憶體）、執行時間，以及每個請求之後的閒置逾時，預設 5 秒。價格頁面上 RTX 4090 等級（24 GB PRO）是每小時 $1.10，明顯高於 $0.74 的 Secure Cloud pod。多付的是流量為零時不必讓任何東西在執行的代價。

**Vast.ai Serverless** 的收費「與 Vast.ai 非 Serverless 的 GPU 執行個體價格相同」，按秒計費，沒有額外費用。作用中和載入中的 worker 支付 GPU、儲存和頻寬費用。非作用中的 worker 只付儲存和頻寬。建立中的 worker 不付 GPU 時間。

如果您的流量忽高忽低、也能接受冷啟動，兩邊都行。RunPod 比較成熟，範例也比較多。Vast.ai 的每 GPU 秒比較便宜，但跑在同樣良莠不齊的主機池上。

如果您只需要透過 OpenAI 風格的 API 呼叫開放模型，可能兩個都不需要。對熱門模型來說，託管的按 token 計費 API 往往最便宜（[試算](/zh_tw/hourly-gpu-vs-per-token-api/)）。GPUFlow 是另一個選擇：您租用一組相容 OpenAI 的 API 金鑰，呼叫提供者在自己 GPU 上用 Ollama 執行的模型，按秒計費。它只做推論，沒有 SSH、不能訓練、也不能執行自訂程式碼，所以在其他用途上無法取代 RunPod 或 Vast.ai。三者的比較請看 [GPUFlow vs Vast.ai vs RunPod](/zh_tw/gpuflow-vs-vast-ai-vs-runpod/)。

## 付款、最低金額與額度用完

兩邊都是預付制，餘額歸零時也都毫不留情。

**RunPod** 接受信用卡（透過 Stripe 的 Visa、Mastercard、Amex 等）、加密貨幣（第一次用加密貨幣付款前要完成 KYC），以及超過 $5,000 的訂單可用 ACH、電匯或信用卡開立請款單。要部署 pod，您需要至少夠所選配置用一小時的額度。額度不可退款，也不能提領。額度用完時，有網路磁碟區的 pod 會被停止，磁碟區保留（而且繼續計費）。沒有網路磁碟區的 pod「會被終止，資料無法復原」。

**Vast.ai** 透過 Stripe 接受信用卡，透過 BitPay 和 Crypto.com 接受加密貨幣。最低儲值 $5，而且要先驗證電子郵件。自動儲值會在餘額低於您設定的門檻時，從儲存的信用卡扣款。餘額到 $0.00 時，您的執行個體會停止。有儲存信用卡的話，Vast 會扣款補足負餘額。沒有的話，「執行個體和儲存的資料將被銷毀」。即使餘額為負，儲存空間也會繼續計費。退款：已花掉的額度不退。沒花掉的信用卡額度要向客服申請，加密貨幣儲值則不能退款。

兩邊的實用建議都一樣：開啟自動儲值或保留一些緩衝，並把不能遺失的東西放在網路磁碟區上或平台以外。

## 該選哪一個

<figure>
<svg viewBox="0 0 720 520" role="img" aria-labelledby="d1-title" xmlns="http://www.w3.org/2000/svg" font-family="system-ui, sans-serif" font-size="15">
<title id="d1-title">在 RunPod 和 Vast.ai 之間做選擇的決策流程，從只需要 API 到追求最低價格</title>
<defs><marker id="d1-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="#64748b"/></marker></defs>
<rect x="20" y="20" width="400" height="56" rx="10" fill="#eef2ff" stroke="#6366f1" stroke-width="2"/>
<text x="220" y="53" text-anchor="middle" fill="#1e1b4b">只需要透過 API 呼叫模型？</text>
<rect x="480" y="20" width="220" height="56" rx="10" fill="#ffffff" stroke="#e2e8f0" stroke-width="2"/>
<text x="590" y="53" text-anchor="middle" fill="#1e1b4b" font-size="13">按 token 計費的 API 或 GPUFlow</text>
<rect x="20" y="120" width="400" height="56" rx="10" fill="#eef2ff" stroke="#6366f1" stroke-width="2"/>
<text x="220" y="153" text-anchor="middle" fill="#1e1b4b">有正式環境或合規需求？</text>
<rect x="480" y="120" width="220" height="56" rx="10" fill="#ffffff" stroke="#e2e8f0" stroke-width="2"/>
<text x="590" y="144" text-anchor="middle" fill="#1e1b4b">RunPod Secure Cloud</text>
<text x="590" y="165" text-anchor="middle" fill="#64748b" font-size="13">或 Vast 資料中心主機</text>
<rect x="20" y="220" width="400" height="56" rx="10" fill="#eef2ff" stroke="#6366f1" stroke-width="2"/>
<text x="220" y="253" text-anchor="middle" fill="#1e1b4b">資料必須跟著您跨機器移動？</text>
<rect x="480" y="220" width="220" height="56" rx="10" fill="#ffffff" stroke="#e2e8f0" stroke-width="2"/>
<text x="590" y="253" text-anchor="middle" fill="#1e1b4b">RunPod 網路磁碟區</text>
<rect x="20" y="320" width="400" height="56" rx="10" fill="#eef2ff" stroke="#6366f1" stroke-width="2"/>
<text x="220" y="353" text-anchor="middle" fill="#1e1b4b">想要能縮減到零的端點？</text>
<rect x="480" y="320" width="220" height="56" rx="10" fill="#ffffff" stroke="#e2e8f0" stroke-width="2"/>
<text x="590" y="353" text-anchor="middle" fill="#1e1b4b">兩者的 Serverless 皆可</text>
<rect x="20" y="420" width="400" height="70" rx="10" fill="#f0fdf4" stroke="#16a34a" stroke-width="2"/>
<text x="220" y="450" text-anchor="middle" fill="#1e1b4b">其他情況：Vast.ai，價格最低</text>
<text x="220" y="474" text-anchor="middle" fill="#64748b" font-size="13">依可靠度篩選，用可中斷方案就要存檢查點</text>
<line x1="420" y1="48" x2="476" y2="48" stroke="#64748b" stroke-width="2" marker-end="url(#d1-arrow)"/>
<text x="448" y="40" text-anchor="middle" fill="#16a34a" font-size="13">是</text>
<line x1="420" y1="148" x2="476" y2="148" stroke="#64748b" stroke-width="2" marker-end="url(#d1-arrow)"/>
<text x="448" y="140" text-anchor="middle" fill="#16a34a" font-size="13">是</text>
<line x1="420" y1="248" x2="476" y2="248" stroke="#64748b" stroke-width="2" marker-end="url(#d1-arrow)"/>
<text x="448" y="240" text-anchor="middle" fill="#16a34a" font-size="13">是</text>
<line x1="420" y1="348" x2="476" y2="348" stroke="#64748b" stroke-width="2" marker-end="url(#d1-arrow)"/>
<text x="448" y="340" text-anchor="middle" fill="#16a34a" font-size="13">是</text>
<line x1="220" y1="76" x2="220" y2="116" stroke="#64748b" stroke-width="2" marker-end="url(#d1-arrow)"/>
<text x="234" y="101" fill="#f97316" font-size="13">否</text>
<line x1="220" y1="176" x2="220" y2="216" stroke="#64748b" stroke-width="2" marker-end="url(#d1-arrow)"/>
<text x="234" y="201" fill="#f97316" font-size="13">否</text>
<line x1="220" y1="276" x2="220" y2="316" stroke="#64748b" stroke-width="2" marker-end="url(#d1-arrow)"/>
<text x="234" y="301" fill="#f97316" font-size="13">否</text>
<line x1="220" y1="376" x2="220" y2="416" stroke="#64748b" stroke-width="2" marker-end="url(#d1-arrow)"/>
<text x="234" y="401" fill="#f97316" font-size="13">否</text>
</svg>
<figcaption>從上往下看，停在第一個「是」。大多數能存檢查點的訓練和實驗，最後都會落在最下面那一格。</figcaption>
</figure>

**以下情況選 Vast.ai：**

- 您要壓低的是每 GPU 小時的價格，尤其是長時間執行、每月差距達到幾百美元的時候。
- 您的工作會存檢查點，能在另一台機器上重新開始。這時可中斷執行個體就是您找得到最便宜的 GPU 時間。
- 您願意在點下 Rent 之前，花五分鐘看一下主機的可靠度分數、所在地和最長租期。
- 您想用 serverless，又不想比執行個體價格多付溢價。

**以下情況選 RunPod：**

- 您想要固定的價目表，不想比較各個主機。
- 您的資料必須比任何一台機器活得更久。每 GB 每月 $0.07 的網路磁碟區，是兩個平台裡最乾淨的解法。
- 您會搬進搬出大量資料。RunPod 不收這筆錢。
- 您需要資料中心等級的方案、完成 KYC 的加密貨幣付款，或向單一廠商下大額訂單時開請款單。

**兩個都用**，如果可以的話。很多人把 RunPod 的網路磁碟區當作大本營，再把長時間、有存檢查點的訓練丟到便宜的 Vast.ai 機器上。在兩邊之間搬 Docker 映像檔很容易，要事先規劃的是搬資料。

如果您還在搞清楚一次租用需要什麼（映像檔、儲存空間、SSH 金鑰），請從[租用 GPU 需要準備什麼](/zh_tw/what-you-need-to-rent-a-gpu/)開始，更完整的價格比較請看 [2026 GPU 租用價格比較](/zh_tw/gpu-rental-pricing-comparison-2026/)。

## 資料來源

皆於 2026 年 9 月查核。

- RunPod：[價格頁面](https://www.runpod.io/pricing)、[pod 價格與儲存](https://docs.runpod.io/pods/pricing)、[Pod 概覽](https://docs.runpod.io/pods/overview)、[選擇 pod](https://docs.runpod.io/pods/choose-a-pod)、[管理 pod](https://docs.runpod.io/pods/manage-pods)、[建立 pod API（interruptible 欄位）](https://docs.runpod.io/api-reference/pods/POST/pods)、[serverless 價格](https://docs.runpod.io/serverless/pricing)、[計費](https://docs.runpod.io/references/billing-information)、[Spot vs 隨選](https://www.runpod.io/blog/spot-vs-on-demand-instances-runpod)
- RunPod Secure Cloud 2026 年 9 月 20 日的價格調整：[usagepricing.com](https://www.usagepricing.com/blueprint/activity/runpod-2026-09-20-secure-cloud-price-hike)
- Vast.ai：[快速入門](https://docs.vast.ai/guides/get-started/quickstart.md)、[價格](https://docs.vast.ai/guides/instances/pricing.md)、[租用類型](https://docs.vast.ai/guides/reference/faq/rental-types)、[尋找與租用執行個體](https://docs.vast.ai/guides/instances/choosing/find-and-rent)、[資料中心狀態](https://docs.vast.ai/documentation/host/datacenter-status)、[儲存類型](https://docs.vast.ai/documentation/instances/storage/types)、[磁碟區](https://docs.vast.ai/documentation/instances/storage/volumes)、[serverless 價格](https://docs.vast.ai/serverless/pricing)、[計費](https://docs.vast.ai/documentation/reference/billing)
- 市集價格：getdeploying.com 的 [RTX 4090](https://getdeploying.com/reference/cloud-gpu/nvidia-rtx-4090) 和 [RTX 3090](https://getdeploying.com/reference/cloud-gpu/nvidia-rtx-3090)
- GPUFlow：[租用者入門指南](https://docs.gpuflow.app/zh-tw/renters/getting-started/)、[API 快速入門](https://docs.gpuflow.app/zh-tw/renters/api-quickstart/)
