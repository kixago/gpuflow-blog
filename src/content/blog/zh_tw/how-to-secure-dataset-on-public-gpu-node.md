---
title: "如何在租用或公用 GPU 節點上保護資料集"
description: "租用 GPU 的主機方，讀得到您的工作解密後的任何資料。加密、Secure Cloud 和 H100 機密運算各能解決什麼，以及事後如何清理。"
excerpt: "租用 GPU，代表存放您資料的那台機器，root 權限在別人手上。本文說明威脅模型、每種防護實際涵蓋的範圍，以及在現代磁碟上真正有效的清理流程。"
pubDate: 2026-02-26
updatedDate: 2026-09-30
locale: "zh_tw"
category: "guides"
featured: false
draft: false
author: "GPUFlow Team"
authorUrl: "https://gpuflow.app"
heroImage: "../_images/secure-server-room-abstract.png"
heroImageAlt: "抽象的安全伺服器環境，代表受保護的 AI 資料處理"
faq:
  - question: "租用 GPU 的主機方看得到我的資料嗎？"
    answer: "技術上看得到。主機方擁有實體機器的 root 權限，而資料必須在記憶體中解密，才能訓練或執行模型。只有機密運算，例如 Azure 或 Google Cloud 上的 H100 機密虛擬機器，能把主機方排除在外。"
  - question: "shred 能在雲端 GPU 執行個體上安全刪除檔案嗎？"
    answer: "不可靠。GNU shred 手冊說明，它只有在檔案系統和硬體會原地覆寫資料時才有效，而日誌式和寫入時複製（copy-on-write）檔案系統、快照和 SSD 都無法保證這一點。請在資料寫入磁碟之前就加密，並改為銷毀執行個體。"
  - question: "RunPod Secure Cloud 和 Community Cloud 有什麼不同？"
    answer: "RunPod 的文件說明，Secure Cloud 在 T3/T4 資料中心執行，適合正式環境和敏感資料；Community Cloud 則由點對點的提供者組成，可靠度不一。RunPod 已不再接受新的 Community Cloud 主機。"
  - question: "哪些雲端 GPU 支援機密運算？"
    answer: "截至 2026 年 9 月，Azure 提供 NCCads H100 v5 機密虛擬機器，搭配一張 H100 NVL GPU，使用 AMD SEV-SNP；Google Cloud 提供機密版 a3-highgpu-1g（一張 H100，Intel TDX）和 G4（RTX PRO 6000，AMD SEV）。消費級 GeForce 顯示卡不在這些清單中。"
  - question: "依照 GDPR，把個人資料放在租用的 GPU 上安全嗎？"
    answer: "只有在提供者是處理者、簽有符合 GDPR 第 28 條的合約，而且機器位於歐盟以外時有合法的傳輸途徑，才可以。大多數點對點主機和您之間沒有這種合約，所以請先將資料去識別化，或使用會簽署 DPA 的資料中心提供者。"
  - question: "可以在 GPUFlow 上訓練或微調模型嗎？"
    answer: "不行。GPUFlow 只做推論：您拿到的是一組相容 OpenAI 的 API 金鑰，用來呼叫在提供者電腦上執行的模型，沒有 SSH、shell 或檔案存取。提示詞會以明文送到那台電腦，所以不要透過它送出機密紀錄。"
---

租用 GPU 時，存放您資料的那台機器，root 權限在別人手上。加密能在傳輸途中和存放在磁碟上時保護資料集，但您的訓練工作必須在記憶體中解密才能使用它，而在那個時候，有心的主機方就讀得到。所以真正要決定的是：您信任誰（經過審核的資料中心，還是匿名的家用伺服器）、送出的資料能少到什麼程度，以及是否需要機密運算，這是唯一能把主機營運者排除在信任鏈之外的選項。

本指南談的是您可以登入的機器，例如 Vast.ai 或 RunPod 上的執行個體。內容依序是威脅模型、每種防護涵蓋的範圍，以及在現代儲存裝置上站得住腳的清理流程。來源列在文末；所有內容都在 2026 年 9 月查核過。

## 威脅模型

先列出誰可能碰到資料、怎麼碰到。在租用的 GPU 執行個體上，有七條實際存在的途徑。

<figure>
<svg viewBox="0 0 720 430" role="img" aria-labelledby="d1-title" xmlns="http://www.w3.org/2000/svg" font-family="system-ui, sans-serif" font-size="15">
<title id="d1-title">租用 GPU 執行個體上資料集的威脅模型：七條接觸資料的途徑，以及各自的主要防護</title>
<rect x="0" y="0" width="720" height="430" fill="#ffffff"/>
<line x1="220" y1="75" x2="240" y2="170" stroke="#e2e8f0" stroke-width="2"/>
<line x1="220" y1="220" x2="240" y2="215" stroke="#e2e8f0" stroke-width="2"/>
<line x1="220" y1="365" x2="240" y2="270" stroke="#e2e8f0" stroke-width="2"/>
<line x1="500" y1="75" x2="480" y2="170" stroke="#e2e8f0" stroke-width="2"/>
<line x1="500" y1="220" x2="480" y2="215" stroke="#e2e8f0" stroke-width="2"/>
<line x1="500" y1="365" x2="480" y2="270" stroke="#e2e8f0" stroke-width="2"/>
<line x1="360" y1="330" x2="360" y2="290" stroke="#e2e8f0" stroke-width="2"/>
<rect x="240" y="140" width="240" height="150" rx="12" fill="#eef2ff" stroke="#6366f1" stroke-width="2"/>
<text x="360" y="170" text-anchor="middle" fill="#1e1b4b" font-weight="bold">您租用的執行個體</text>
<text x="360" y="205" text-anchor="middle" fill="#1e1b4b">資料集</text>
<text x="360" y="235" text-anchor="middle" fill="#1e1b4b">權重和 checkpoint</text>
<text x="360" y="265" text-anchor="middle" fill="#1e1b4b">權杖和金鑰</text>
<rect x="20" y="40" width="200" height="70" rx="10" fill="#ffffff" stroke="#f97316" stroke-width="2"/>
<text x="120" y="68" text-anchor="middle" fill="#1e1b4b">主機營運者</text>
<text x="120" y="92" text-anchor="middle" fill="#64748b" font-size="13">對策：審核過的主機或 CC</text>
<rect x="20" y="185" width="200" height="70" rx="10" fill="#ffffff" stroke="#f97316" stroke-width="2"/>
<text x="120" y="213" text-anchor="middle" fill="#1e1b4b">網路路徑</text>
<text x="120" y="237" text-anchor="middle" fill="#64748b" font-size="13">對策：SSH，不開連接埠</text>
<rect x="20" y="330" width="200" height="70" rx="10" fill="#ffffff" stroke="#f97316" stroke-width="2"/>
<text x="120" y="358" text-anchor="middle" fill="#1e1b4b">磁碟殘留</text>
<text x="120" y="382" text-anchor="middle" fill="#64748b" font-size="13">對策：先加密，再銷毀</text>
<rect x="500" y="40" width="200" height="70" rx="10" fill="#ffffff" stroke="#f97316" stroke-width="2"/>
<text x="600" y="68" text-anchor="middle" fill="#1e1b4b">市集平台</text>
<text x="600" y="92" text-anchor="middle" fill="#64748b" font-size="13">對策：合約和 DPA</text>
<rect x="500" y="185" width="200" height="70" rx="10" fill="#ffffff" stroke="#f97316" stroke-width="2"/>
<text x="600" y="213" text-anchor="middle" fill="#1e1b4b">其他租戶</text>
<text x="600" y="237" text-anchor="middle" fill="#64748b" font-size="13">對策：虛擬機器或整台機器</text>
<rect x="500" y="330" width="200" height="70" rx="10" fill="#ffffff" stroke="#f97316" stroke-width="2"/>
<text x="600" y="358" text-anchor="middle" fill="#1e1b4b">快照、磁碟區</text>
<text x="600" y="382" text-anchor="middle" fill="#64748b" font-size="13">對策：不留持久副本</text>
<rect x="260" y="330" width="200" height="70" rx="10" fill="#ffffff" stroke="#f97316" stroke-width="2"/>
<text x="360" y="358" text-anchor="middle" fill="#1e1b4b">您自己留下的東西</text>
<text x="360" y="382" text-anchor="middle" fill="#64748b" font-size="13">對策：限範圍、定期輪換的權杖</text>
</svg>
<figcaption>工作執行期間，執行個體上的一切都暴露在主機營運者面前。其他途徑靠一般的良好習慣就能封住；這一條則需要一個您信任的主機，或是機密運算。</figcaption>
</figure>

**主機營運者。** 擁有實體機器的人，就有它的 root 權限。在 Vast.ai 這類容器市集上，客戶端在非特權 Docker 容器中執行，這能把您和其他租戶隔開，卻隔不開主機方：主機上的 root 讀得到容器的檔案和記憶體。在任何平台上，容器都是這樣運作的。

**網路路徑。** 資料從您的筆電或儲存桶傳到節點的過程。這是最容易封住的途徑。

**市集平台。** 位在您和主機之間的公司，持有您的帳號、SSH 金鑰，以及它自己日誌中保存的任何內容。它能用這些東西做什麼，由它的條款決定，這也是下面談合約那一節之所以重要的原因。

**磁碟殘留。** 您刪除的檔案，可能在租用結束後仍留在磁碟上，下一個租用者或主機方都可能找到。

**快照和持久磁碟區。** 您要求的副本（網路磁碟區、已停止的執行個體），或主機方自己做的副本（備份），存在的時間比工作本身還長。

**其他租戶。** 同一台機器上的其他客戶。在虛擬機器隔離或獨佔整台機器的情況下，這個風險很小，但 GPU 在這方面確實出過問題。LeftoverLocals（CVE-2023-4969）讓一個行程能讀取另一個行程的 GPU 本機記憶體，影響部分 Apple、AMD 和 Qualcomm GPU；Trail of Bits 在 AMD Radeon RX 7900 XT 上，每次 LLM 查詢可還原約 181 MB 的資料，足以重建模型的回答。Trail of Bits 在 NVIDIA、ARM 或 Intel GPU 上沒有發現這個問題。

**您自己留下的東西。** 留在節點上的 Hugging Face 權杖、雲端金鑰或 SSH 私鑰。實際上，大多數外洩都是這樣開始的。

## 加密能涵蓋什麼，不能涵蓋什麼

加密有三項任務，而在租用的 GPU 上，您自己能做到其中兩項。

**傳輸中：** 很簡單。使用 SSH（`scp`、`sftp`、`rsync -e ssh`），或從儲存桶透過 HTTPS 傳輸。Vast.ai 表示 SSH 連線和它的 API 都有加密。絕對不要使用純 HTTP 連結或不需驗證的檔案分享服務。

**靜態儲存：** 上傳前先加密，讓主機磁碟上的檔案沒有金鑰就毫無用處。[age](https://github.com/FiloSottile/age) 是做這件事最簡單的工具：

```bash
# on your own machine
tar -cf - train/ | age -p > train.tar.age
scp -P 22345 train.tar.age user@203.0.113.42:/workspace/
```

在節點上，直接解密到記憶體中，讓明文永遠不會碰到磁碟：

```bash
mkdir -p /dev/shm/train
age -d /workspace/train.tar.age | tar -xf - -C /dev/shm/train
```

`age -d` 會在終端機上詢問通關密語，所以金鑰永遠不會寫到節點上。`/dev/shm` 是以記憶體為後端的檔案系統；請先用 `df -h /dev/shm` 查看它的大小，因為容器環境常把它設得很小。如果資料放不進記憶體，就需要在磁碟上放一份解密後的副本，這時下面的清理一節就更重要了。

在自己的伺服器上，常見的做法是用 LUKS 做全磁碟加密，但在非特權容器內通常無法設定 dm-crypt，而且運作中的金鑰無論如何都在主機方手上。

**使用中：** 這就是缺口。要訓練，GPU 需要明文的張量，而供應資料給它的 CPU 記憶體裡也是明文。任何擁有主機 root 權限的人，原則上都能傾印那段記憶體。面對一個運作中、懷有惡意的主機，靜態加密毫無作用。只有以硬體為基礎的機密運算能處理這個問題。

## Secure Cloud 還是 Community Cloud

主機方是良好習慣唯一消除不了的風險，所以選擇主機是您最重要的決定。兩大市集也正是因為這個原因，把供應分成兩類。

| 選項 | 誰營運硬體 | 平台的說法 |
| --- | --- | --- |
| RunPod Secure Cloud | T3/T4 資料中心 | 適用於「正式環境、敏感資料」 |
| RunPod Community Cloud | 點對點提供者 | 適用於「對成本敏感的工作負載」；不再接受新主機 |
| Vast.ai Secure Cloud | 經過審核的資料中心 | ISO 27001、Tier 3/4 標準、經驗證的實體安全 |
| 其他 Vast.ai 主機 | 從資料中心到個人都有 | 個人主機「可能採取較不正式的安全措施」 |

Vast.ai 自己對敏感資料的建議是：只使用 Secure Cloud 提供者、對靜態資料加密、不要把憑證放在執行個體上，並使用外部金鑰管理。這和我會給任何人的建議一樣。

即使在經過認證的資料中心，也有兩個限制。第一，ISO 27001 認證的是營運者的流程，無法排除不誠實的內部人員。第二，替您處理個人資料的主機方，在 GDPR 下就是處理者，第 28 條要求有涵蓋這件事的合約，而市集卻位在您和主機之間。請看清楚您實際上是和哪家公司簽約，以及它對旗下主機做了什麼承諾。

對真正敏感的工作，再往上一級是在您已簽有 DPA、可能也簽有 BAA 的大型雲端平台帳號中使用 GPU 執行個體，這就離開了市集的範圍，每小時也更貴。價格範圍請看我們的 [GPU 租用價格比較](/zh_tw/gpu-rental-pricing-comparison-2026/)。

## H100 GPU 上的機密運算

機密運算（confidential computing，CC）是這裡唯一專門設計來在工作執行期間保護資料、不讓主機營運者碰到的技術。在 NVIDIA Hopper 和 Blackwell 資料中心 GPU 上，它的運作方式如下：

- 工作負載在由 CPU 上的 AMD SEV-SNP 或 Intel TDX 支撐的機密虛擬機器（CVM）中執行。NVIDIA 的設計假設 hypervisor 和主機作業系統都可能已遭入侵；能存取 hypervisor「甚至系統本身」的營運者，應該都無法讀取 CVM 的記憶體。
- 使用前，虛擬機器會檢查 GPU 是否為真品、是否處於 CC 模式並具有經簽署的裝置憑證，這可以向 NVIDIA 的遠端驗證服務（NRAS）查核。
- 經過 PCIe 的資料、命令緩衝區和 CUDA 核心都會加密並簽署，並透過共用記憶體中一個加密的中繼緩衝區（bounce buffer）傳遞。

NVIDIA 在 2024 年 4 月隨 CUDA 12.4 全面開放 H100 的單 GPU CC。截至 2026 年 9 月，實際租得到的地方：

| 雲端 | 執行個體 | GPU | CPU TEE |
| --- | --- | --- | --- |
| Azure | NCCads H100 v5 | 1 × H100 NVL，94 GB | AMD SEV-SNP（EPYC Genoa） |
| Google Cloud | a3-highgpu-1g，Confidential VM | 1 × H100 | Intel TDX |
| Google Cloud | g4-standard-48，Confidential VM | RTX PRO 6000 | AMD SEV |

在以它為基礎開發之前，先了解它的限制：

- **每台虛擬機器一張 GPU。** Azure 的這個系列只有一張 GPU，Google 的機密 GPU 虛擬機器也不支援多節點叢集。大型多 GPU 訓練就不用考慮了。
- **佈建。** 在 Google Cloud 上，機密版 A3 High 只能以 Spot 或 flex-start 方式執行，不支援預留。
- **傳輸速度。** NVIDIA 2023 年的技術文章指出，CC 模式下 CPU 到 GPU 的頻寬約 4 GB/s，受限於 CPU 加密。因此載入一個 16 GB 的 checkpoint，純傳輸就要約 16 ÷ 4 = 4 秒；對推論來說沒問題，但每一步都要串流好幾 GB 資料的資料管線就會有感。後續的驅動程式版本列出了效能改進，請實測您自己的工作。
- **GPU 記憶體沒有加密。** NVIDIA 讓封裝上的 HBM 維持明文，理由是常見的實體攻擊工具碰不到它。
- **市集上沒有。** Vast.ai 和 RunPod 社群主機上常見的消費級 GeForce 顯示卡，不在任何一份支援清單中。

CC 改變的是您必須信任的對象：從主機方的員工，換成 NVIDIA 的硬體和驗證機制、CPU 廠商，以及您自己的虛擬機器映像檔。對於需要能說出「雲端服務供應商的管理員讀不到」的受規範資料，這是在租用硬體上唯一能做到的選項。

## 工作開始前與進行中

### 上傳前先精簡

最便宜的保護，是讓資料根本不離開您的機器。傳輸之前：

- 刪除模型不需要的欄位，特別是姓名、電子郵件、帳號和自由填寫的備註。
- 把直接識別碼換成隨機代碼，對照表留在自己手上。
- 把語料縮減到方法實際需要的量。LoRA 或 QLoRA 微調調整的是一小組額外權重，很少需要整個正式環境的資料庫；我們的[微調指南](/zh_tw/private-llm-fine-tuning-guide/)會帶您走過一個實際的設定。
- 記住，模型權重本身也帶有資訊。用敏感文字微調的模型可能會重複其中的片段，所以轉接器也要當成敏感資料看待。

去識別化的資料，也能讓下面大部分的法律問題消失。

### 節點上的憑證和網路

假設您放到節點上的任何東西都可能被複製。

- 使用細粒度的 Hugging Face 權杖，只給您需要的那一個 repo 讀取權限，工作結束時撤銷。
- 絕對不要把您主要的 SSH 私鑰、雲端 root 憑證或正式環境資料庫密碼複製到租用的機器上。如果工作必須把結果寫入儲存桶，建立一把只能寫入單一前綴、一天內就會過期的金鑰。
- 透過 SSH 把結果拉回來，而不是在節點上用長期有效的金鑰推送出去。
- 用 `ss -tulnp` 檢查有哪些服務在監聽。把 Jupyter、TensorBoard 和推論伺服器綁定到 `127.0.0.1`，並透過 SSH 通道（`ssh -L 8888:127.0.0.1:8888 ...`）存取，而不是開放公開的連接埠。

## 在現代磁碟上也有效的清理方式

常見的建議是用完後 `shred` 資料集。它做不到大家以為的事。GNU coreutils 手冊說明，`shred` 依賴檔案系統和硬體原地覆寫資料，並列出這種做法失效的情況：日誌式和日誌結構式檔案系統，例如 `data=journal` 模式下的 ext4、Btrfs、XFS 和 ZFS，還有 RAID、有快照的檔案系統、壓縮檔案系統，以及因為磨損平均而把新資料寫到別處的 SSD。租用的 GPU 節點，很可能同時符合其中好幾項。

有效的做法是：

1. **讓磁碟上的副本失去價值。** 如果碰過磁碟的只有經 age 加密的封存檔，刪除它就夠了；沒有通關密語，它只是一堆雜訊。NIST 的媒體清除指南（SP 800-88 Rev. 2，2025 年 9 月）把這個概念，也就是密碼學抹除（cryptographic erase），視為標準技術。
2. **銷毀，不要只是停止。** 在 Vast.ai 上，停止執行個體會保留資料（也會繼續收儲存費）；銷毀則會「永久刪除執行個體和所有資料」。在 RunPod 上，pod 停止時容器磁碟會被清除，`/workspace` 磁碟區在停止時保留、在終止時刪除，而網路磁碟區則會一直保留，直到您刪除為止。
3. **刪除您建立的網路磁碟區。** 它們本來就設計成比 pod 存在得更久。
4. **撤銷用過的東西。** Hugging Face 權杖、儲存桶金鑰，並移除您為這次工作加到市集上的一次性 SSH 公鑰。

主機方在租用者之間如何清除磁碟，我讀過的市集文件都沒有說明。請假設這件事不會發生，而第 1 步無論如何都能保護您。

## 合約與法規

技術控制措施的重要性，比不上一個法律事實：把資料放到別人的機器上，對方就成了當事人之一。

- **GDPR。** 替您處理個人資料的 GPU 主機方就是處理者。第 28 條要求處理者能提供「充分保證」，並有具約束力的合約。一個您從未簽過任何文件的點對點主機，並不符合這項要求，而且機器可能位於歐盟以外。請先去識別化，或使用會簽署 DPA 的提供者。
- **HIPAA。** HHS 表示，儲存電子健康資料的雲端服務供應商就是業務夥伴，即使資料已加密、它沒有金鑰也一樣。把健康紀錄加密後送到未經審核的主機，並不能免除簽署 BAA 的需要。
- **您客戶的合約。** 許多企業合約會限制次處理者和資料存放地點。第一次上傳之前先檢查。法律上的風險往往比技術上的更大。

姊妹文章[企業為什麼限制公開的 AI 工具](/zh_tw/why-corporate-policies-banning-chatgpt/)從聊天服務的角度談同樣的法規。

## 在 GPUFlow 上做推論：另一種取捨

GPUFlow 不是放資料集的地方。它是一個推論市集：您按小時租用 GPU，拿到一組相容 OpenAI 的 API 金鑰（base URL 為 `https://gpuflow.app/v1`），用來呼叫提供者在自己電腦上執行的開放模型（通常透過 Ollama）。沒有 SSH、沒有 shell，也不能存取檔案，您也無法在上面訓練或微調。提供者的磁碟上不會有任何您上傳的東西，因為您根本無法上傳任何東西。

這消除了本指南中的磁碟和憑證問題，但沒有消除主機方的問題。租用期間，每一則提示詞和回答都會以明文經過提供者的機器。GPUFlow 的條款禁止提供者記錄、讀取、保存或分享這些內容，GPUFlow 自己也不儲存這些文字，但提供者在那台機器上有 root 權限，所以這條規定只靠契約執行。如果您把資料集一筆一則提示詞地送進去，每一筆紀錄都會送到那台電腦。

所以請用它處理公開、合成或已妥善去識別化的資料，以及用來測試開放模型，或對著 OpenAI 風格的 API 測試應用程式。受規範和機密的紀錄，請留在您自己的硬體、簽有合約的提供者，或機密虛擬機器上。[API 快速入門](https://docs.gpuflow.app/zh-tw/renters/api-quickstart/)用一句話說了同樣的事：不要送出密碼、信用卡號碼，或其他您不會和陌生人分享的機密。從提供者角度看同樣的安排，請看[出租 GPU 安全嗎](/zh_tw/is-it-safe-to-rent-out-your-gpu/)。

## 檢查清單

開始前：

- 決定資料等級。受規範或客戶機密資料，送到簽有合約的提供者或機密虛擬機器，不要送到社群主機。
- 精簡並去識別化。
- 用 age 加密；通關密語不要放在節點上。

進行中：

- 放得下的話，解密到 `/dev/shm`。
- 只使用限定範圍、短期有效的權杖。
- 服務綁定到 localhost，透過 SSH 通道存取。

結束後：

- 透過 SSH 拉回結果；把微調後的權重當成敏感資料。
- 銷毀執行個體和所有網路磁碟區。
- 撤銷權杖和一次性金鑰。

## 來源

- Vast.ai 的容器隔離和 Secure Cloud：[Vast.ai 安全性常見問題](https://docs.vast.ai/guides/reference/faq/security)；停止與銷毀：[管理執行個體](https://docs.vast.ai/guides/instances/manage-instances)
- RunPod Secure Cloud 與 Community Cloud：[選擇 Pod](https://docs.runpod.io/pods/choose-a-pod)；儲存的持久性：[儲存類型](https://docs.runpod.io/pods/storage/types)
- LeftoverLocals：[Trail of Bits，2024 年 1 月](https://blog.trailofbits.com/2024/01/16/leftoverlocals-listening-to-llm-responses-through-leaked-gpu-local-memory/)
- age：[github.com/FiloSottile/age](https://github.com/FiloSottile/age)
- shred 的限制：[GNU coreutils 手冊，shred 的使用方式](https://www.gnu.org/software/coreutils/manual/html_node/shred-invocation.html)
- NIST SP 800-88 Rev. 2：[NIST 公告，2025 年 9 月](https://www.nist.gov/news-events/news/2025/09/guidelines-media-sanitization-nist-publishes-sp-800-88r2)
- H100 機密運算設計：[NVIDIA，H100 GPU 上用於安全可信 AI 的機密運算](https://developer.nvidia.com/blog/confidential-computing-on-h100-gpus-for-secure-and-trustworthy-ai/)；全面開放：[NVIDIA，2024 年 4 月](https://developer.nvidia.com/blog/announcing-confidential-computing-general-access-on-nvidia-h100-tensor-core-gpus/)
- Azure：[NCCads H100 v5 系列](https://learn.microsoft.com/en-us/azure/virtual-machines/sizes/gpu-accelerated/nccadsh100v5-series)
- Google Cloud：[Confidential VM 支援的設定](https://docs.cloud.google.com/confidential-computing/confidential-vm/docs/supported-configurations)、[建立搭載 GPU 的 Confidential VM 執行個體](https://docs.cloud.google.com/confidential-computing/confidential-vm/docs/create-a-confidential-vm-instance-with-gpu)
- GDPR 第 28 條：[gdpr-info.eu](https://gdpr-info.eu/art-28-gdpr/)
- HIPAA 與雲端服務供應商：[HHS，HIPAA 與雲端運算指引](https://www.hhs.gov/hipaa/for-professionals/special-topics/health-information-technology/cloud-computing/index.html)
- GPUFlow：[API 快速入門](https://docs.gpuflow.app/zh-tw/renters/api-quickstart/)、[租用者能存取和不能存取的範圍](https://docs.gpuflow.app/zh-tw/providers/security/)、[服務條款](https://gpuflow.app/zh-TW/terms)、[隱私權政策](https://gpuflow.app/zh-TW/privacy)

全部於 2026 年 9 月查核。
