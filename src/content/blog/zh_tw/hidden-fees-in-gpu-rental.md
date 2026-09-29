---
title: "GPU 租用的真實成本：每小時價格沒告訴您的費用"
description: "停機時的儲存費、頻寬費、最低儲值金額、計費單位、閒置時間和信用卡手續費。在 Vast.ai、RunPod、Lambda、AWS 和 GPUFlow 租用 GPU，除了每小時價格之外實際要付多少。"
excerpt: "每小時價格只是帳單的一部分。以下整理我們在主要 GPU 租用平台上找到的所有額外費用，每一項都附上數字和來源。"
pubDate: 2026-02-15
updatedDate: 2026-09-29
locale: "zh_tw"
category: "pricing"
featured: false
draft: false
author: "GPUFlow Team"
heroImage: "../_images/gpu-server-rack.jpg"
heroImageAlt: "機架中 GPU 伺服器風扇的特寫"
faq:
  - question: "機器停止時，GPU 租用平台還會收儲存費嗎？"
    answer: "通常會。在 RunPod，已停止 Pod 的 volume 磁碟每 GB 每月收 $0.20，是執行中費率的兩倍。在 Vast.ai，只要執行個體存在就按秒收儲存費，停止時也一樣。GPUFlow 沒有儲存費，因為您租到的是一組 API 金鑰，不是一台機器。"
  - question: "哪些 GPU 租用平台會收頻寬費？"
    answer: "Vast.ai 的主機自行設定上傳與下載資料的價格，每個位元組都計費。RunPod 和 Lambda 表示不收傳入或傳出流量的費用。AWS 對傳到網際網路的資料，在每月前 100 GB 之後開始收費。"
  - question: "開始租用前有最低付款金額嗎？"
    answer: "Vast.ai 最低儲值 $5。Lambda 會在您的信用卡上預先授權 $10。RunPod 要求使用預付卡的使用者每筆至少儲值 $100。GPUFlow 儲值從 $10 起，不收手續費。"
  - question: "用美元支付 GPU 租用費用，我的銀行會收手續費嗎？"
    answer: "有可能。信用卡的海外交易手續費通常是 1% 到 3%，有些銀行即使價格以美元標示，只要商家在國外就會收取。在巴西，國際信用卡消費的 IOF 稅是 3.5%。"
---

GPU 刊登頁上的價格是 GPU 每小時的使用費。但月底實際付的錢，往往還包括其他項目：磁碟空間、資料傳輸、設定環境花掉的時間，以及您自己銀行收的手續費。這些費用都不是刻意隱藏的，但如果只看標價來比較平台，很容易漏掉。

本文列出我們在主要平台上能確認的每一項額外費用，每一項都附上來源連結。所有資料都在 2026 年 9 月查核過。價格會變動，採用任何數字之前，請先點連結確認。

## 重點整理

| 費用 | Vast.ai | RunPod | Lambda | AWS EC2 | GPUFlow |
| --- | --- | --- | --- | --- | --- |
| 計費單位 | 按秒 | 按秒 | 按分鐘 | 按秒，最低 60 秒 | 按秒，最低 1 分鐘 |
| 執行時的儲存費 | 由主機設定 | 每 GB 每月 $0.10 | 檔案系統，每 GB 每月計費 | 每 GB 每月 $0.08（gp3） | 無 |
| 停止時的儲存費 | 有，照常計費 | 每 GB 每月 $0.20（volume 磁碟） | 檔案系統，每 GB 每月計費 | 每 GB 每月 $0.08（gp3） | 無 |
| 資料傳輸 | 由主機設定，每個位元組都計費 | 免費 | 免費 | 傳到網際網路：每月前 100 GB 免費，之後付費 | 無 |
| 開始使用的最低金額 | 儲值 $5 | 1 小時的額度；預付卡 $100 | 信用卡預先授權 $10 | 付款方式和 GPU 配額 | 儲值 $10 |

GPUFlow 之所以沒有儲存費和傳輸費，是因為它租的東西不一樣：您拿到的是一組 API 金鑰，用來呼叫在別人 GPU 上執行的 AI 模型，而不是一台可以登入的機器。這也表示您無法在上面執行自己的程式碼或訓練工作。後面會再詳細說明。

## 1. 儲存費，尤其是停機時的儲存費

在出租機器或容器的平台上，您的檔案存放在磁碟上，而磁碟只要存在就要付錢。

- **RunPod** 在 Pod 執行時，容器磁碟和 volume 磁碟都是每 GB 每月 $0.10。Pod 停止後，容器磁碟會被刪除、不再計費，但 volume 磁碟的費用變成**每 GB 每月 $0.20**。網路 volume 在 1 TB 以下是每 GB 每月 $0.07，不論是否執行都要付。
- **Vast.ai** 讓每台主機自行設定儲存價格。只要執行個體存在就按秒計費，停止時也一樣。
- **AWS** 的 EBS volume 不論執行個體是否在執行都要收費。us-east-1 的 gp3 volume 是每 GB 每月 $0.08。

舉個例子：RunPod 上一個已停止 Pod 的 200 GB volume，每月費用是 200 × $0.20 = **$40**，即使您再也不啟動這個 Pod。這筆錢比 RTX 3090 以一般市場價格（後面有列出）租超過 100 小時還多。

**怎麼做**：刪除不再使用的 volume。如果您只需要在兩次使用之間保留檔案，一個小的網路 volume 會比留著一台大的已停止 Pod 便宜。

## 2. 資料傳輸

下載一個模型、上傳一份資料集，動輒就是幾十 GB 的流量。

- **Vast.ai**：每台主機自行設定上傳和下載的價格，官方文件說明無論執行個體處於什麼狀態，每個位元組都會計費。租用前請先看刊登頁上的頻寬價格，尤其是您要下載大型模型的時候。
- **RunPod** 和 **Lambda** 表示不收傳入或傳出資料的費用。
- **AWS**：傳入的資料免費。傳到網際網路的資料，每月前 100 GB 免費，之後按 GB 計費。AWS 另外對每個公用 IPv4 位址收取每小時 $0.005，不論有沒有在使用。

## 3. 最低儲值金額與信用卡預先授權

大多數 GPU 平台都是預付制。先買額度，再花掉。

- **Vast.ai**：最低儲值 $5。
- **RunPod**：您的額度至少要夠付所選機器 1 小時的費用，預付卡每筆至少要儲值 $100。
- **Lambda**：在您的信用卡上預先授權 $10，幾天後退回。
- **SaladCloud**：額度在購買 12 個月後到期。
- **GPUFlow**：每次儲值 $10 到 $500，不收手續費，額度沒有使用期限。

會到期或一直閒置的額度也是一種成本。預計用多少就買多少。

## 4. 設定時間也要計費

租用機器時，計時從機器開機就開始，而不是從您的工作開始。安裝驅動程式和函式庫、拉取容器映像檔、下載 15 GB 的模型，全都在付費時間內進行。以每小時 $0.35 計算，花半小時設定大約是 $0.18。單次來看不多，但如果您每天都開新的機器，累積起來就很可觀。

有兩個方法可以改善：使用已經裝好所需軟體的範本或容器映像檔，以及把模型存在 volume 上，這樣只要下載一次（但要和第 1 點的儲存費一起權衡）。

在 GPUFlow 上，模型在您租用之前就已經安裝在提供者的機器上。完全不需要設定：費用從租用開始的那一刻起算，金鑰也立刻就能使用。

## 5. 計費單位與最低計費

按秒計費現在很常見，但最低計費各家不同：

| 平台 | 計費方式 |
| --- | --- |
| Vast.ai | 按秒，無最低計費 |
| RunPod Pod | 按秒 |
| RunPod Serverless | 按秒，無條件進位；另外還要付 worker 啟動時間和閒置逾時（預設 5 秒）的費用 |
| Lambda | 按分鐘 |
| AWS EC2（Linux） | 按秒，最低 60 秒 |
| Google Cloud | 按秒，最低 1 分鐘 |
| GPUFlow | 按秒，最低 1 分鐘 |

計費單位影響最大的是 Serverless。如果您送出的是短請求、中間有停頓，啟動時間和閒置逾時的費用可能比請求本身還高。

## 6. 執行中機器的閒置時間

按小時租用的機器，不論 GPU 是在忙還是在等您，費用都一樣。為了「早上一來就能用」而讓 Pod 整晚開著，很容易就會超支。Lambda 講得很直接：執行個體在執行期間就會計費，不論有沒有在使用。

**怎麼做**：設個提醒，或使用平台提供的自動停止閒置機器功能。在 GPUFlow 上，您是預訂一定的時數；如果提早完成，點擊 **立即結束**，未使用的時間就會退回您的額度。[GPUFlow 如何計費](https://docs.gpuflow.app/zh-tw/renters/billing/)。

## 7. 可中斷的機器

可中斷（spot）機器比較便宜，常常便宜一半以上，但只要有人出價更高，它就可能被停止。Vast.ai 把它們稱為可中斷執行個體，並表示通常便宜 50% 以上。在 TensorDock 上，被別人出價超過的期間，儲存費仍然照收。如果您的工作無法從檢查點（checkpoint）繼續，一次中斷就等於同一份工作付兩次錢。

## 8. 您的銀行手續費

幾乎所有 GPU 平台都以美元收費。如果您的信用卡是其他幣別，銀行可能會加收手續費：

- 海外交易手續費通常是 **1% 到 3%**。有些銀行即使價格以美元標示，只要商家在國外就會收取。
- 許多加拿大信用卡對外幣消費收取約 **2.5%**。
- 在巴西，**國際信用卡消費的 IOF 稅是 3.5%**。

以儲值 $100 來說，這就是平台帳單上看不到的 $1 到 $3.50。使用免海外交易手續費的信用卡，就能省下大部分。

## 9. 提供者：提領手續費與最低金額

如果您出租自己的 GPU，平台會抽成，而提領也有各自的規則：

| 平台 | 提供者拿到的比例 | 最低提領金額 | 提領手續費 |
| --- | --- | --- | --- |
| GPUFlow | 租金的 88% | $25 | 每次提領 $2.50 |
| Vast.ai | Vast 表示刊登價格通常比主機實際收入高約 25% | $20 | Vast 未說明；您使用的收款服務可能收費 |
| TensorDock | 其主機託管協議寫的是 20% 或 25% 的費用（條文中兩者都有出現） | 累積 $250 才能提領 | 未說明 |

GPUFlow 另外會把收益暫扣 7 天（註冊未滿 30 天的帳戶為 14 天）才能提領，用來因應信用卡付款爭議。[GPUFlow 如何提領](https://docs.gpuflow.app/zh-tw/providers/getting-paid/)。

## 2026 年 9 月的常見 GPU 價格

作為參考，以下是我們在 2026 年 9 月從 Vast.ai、RunPod、Salad、SimplePod、TensorDock、Hyperstack 和 Lambda 查到的隨選價格範圍：

| GPU | 常見每小時價格 |
| --- | --- |
| RTX 3060 12 GB | $0.05 – $0.08 |
| RTX 3090 | $0.11 – $0.31 |
| RTX 4090 | $0.30 – $0.46 |
| RTX 5090 | $0.41 – $0.69 |

相較之下，AWS 上一張 NVIDIA L4（us-east-1 的 g6.xlarge）每小時約 $0.80，一張 A10G（g5.xlarge）約 $1.01。

## 租用前的檢查清單

1. 把 GPU 使用時間**加上**保留檔案期間的儲存費一起算。
2. 如果平台有頻寬費，確認價格，以及您要下載多少資料。
3. 把設定時間算進付費時間。
4. 清楚知道怎麼停止付費：結束租用、停止機器、刪除 volume。
5. 確認您信用卡的海外交易手續費。

如果您需要的是一個能從程式碼呼叫的 AI 模型，而不是一台用來執行自己軟體的機器，以 API 為基礎的租用方式可以完全避開第 1、2、4 點。如果您需要一整台機器來做訓練，上面這些平台才是正確的工具，而這份檢查清單能讓您的帳單盡量貼近每小時價格。

## 相關文章

- [按小時租 GPU，還是按 token 付費的 API？執行 7B–8B 模型的實際成本](/zh_tw/hourly-gpu-vs-per-token-api/)
- [GPUFlow、Vast.ai、RunPod、SaladCloud 比較：哪一個適合您的工作](/zh_tw/gpuflow-vs-vast-ai-vs-runpod/)
- [2026 年租用 GPU 需要準備什麼](/zh_tw/what-you-need-to-rent-a-gpu/)

## 資料來源

皆於 2026 年 9 月查核。

- RunPod Pod 價格與儲存：[docs.runpod.io/pods/pricing](https://docs.runpod.io/pods/pricing)
- RunPod Serverless 計費：[docs.runpod.io/serverless/pricing](https://docs.runpod.io/serverless/pricing)
- RunPod 計費與儲值：[docs.runpod.io/references/billing-information](https://docs.runpod.io/references/billing-information)
- Vast.ai 價格與計費：[docs.vast.ai/guides/instances/pricing.md](https://docs.vast.ai/guides/instances/pricing.md)、[docs.vast.ai/documentation/reference/billing](https://docs.vast.ai/documentation/reference/billing)
- Vast.ai 儲值：[docs.vast.ai 快速入門](https://docs.vast.ai/guides/get-started/quickstart.md)
- Vast.ai 主機提領：[docs.vast.ai/host/payment.md](https://docs.vast.ai/host/payment.md)，主機收入文章：[vast.ai](https://vast.ai/article/how-much-money-can-you-earn-renting-out-your-gpu-on-vast-ai)
- Lambda 計費：[docs.lambda.ai/public-cloud/billing](https://docs.lambda.ai/public-cloud/billing/)、[管理計費](https://docs.lambda.ai/public-cloud/manage-billing/)、[價格頁（「No egress fees」）](https://lambda.ai/pricing)
- SaladCloud 計費：[docs.salad.com 計費](https://docs.salad.com/general/explanation/billing.md)
- TensorDock spot 執行個體：[docs.tensordock.com](https://docs.tensordock.com/virtual-machines/spot-instances)，供應商協議：[docs.tensordock.com](https://docs.tensordock.com/legal-information/supplier-hosting-agreement.md)
- AWS EC2 計費：[aws.amazon.com/ec2/pricing/on-demand](https://aws.amazon.com/ec2/pricing/on-demand/)；EBS：[aws.amazon.com/ebs/pricing](https://aws.amazon.com/ebs/pricing/)；公用 IPv4：[aws.amazon.com/vpc/pricing](https://aws.amazon.com/vpc/pricing/)
- AWS 執行個體價格：[instances.vantage.sh g6.xlarge](https://instances.vantage.sh/aws/ec2/g6.xlarge?region=us-east-1)、[g5.xlarge](https://instances.vantage.sh/aws/ec2/g5.xlarge?region=us-east-1)
- Google Cloud VM 計費：[cloud.google.com/compute/vm-instance-pricing](https://cloud.google.com/compute/vm-instance-pricing)
- 信用卡海外交易手續費：[Experian](https://www.experian.com/blogs/ask-experian/what-is-a-foreign-transaction-fee/)、[NerdWallet Canada](https://www.nerdwallet.com/ca/p/best/credit-cards/best-no-foreign-transaction-fee-credit-cards)
- 巴西 IOF 3.5%：[Wise Brazil](https://wise.com/br/blog/iof-cartao-internacional)
- GPU 價格範圍：[GPUFlow 文件：如何為您的 GPU 定價](https://docs.gpuflow.app/zh-tw/providers/pricing/)
