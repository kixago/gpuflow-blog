---
title: "企業為什麼禁止員工使用 ChatGPT，以及改用什麼"
description: "企業限制公開的 AI 聊天應用程式，是因為員工貼進去的資料，公司並沒有簽約可以分享。真實案例、2026 年的法規，以及實際可行的替代方案。"
excerpt: "大多數企業的 ChatGPT 禁令，問題出在合約和預設值。本文說明 Samsung 發生了什麼事、各家商業方案目前的承諾，以及在每種選擇下，您的提示詞會送到哪裡。"
pubDate: 2026-02-26
updatedDate: 2026-09-30
locale: "zh_tw"
category: "case-studies"
featured: false
draft: false
author: "GPUFlow Team"
heroImage: "../_images/corporate-ai-policy-restriction.png"
heroImageAlt: "企業辦公室中，電腦螢幕上疊加著數位鎖頭符號，代表 AI 存取限制"
faq:
  - question: "企業為什麼禁止員工使用 ChatGPT？"
    answer: "因為員工會把公司和客戶的資料貼進公司沒有簽約的個人帳號。在 ChatGPT 的個人方案上，預設允許 OpenAI 用內容改進模型，也沒有涵蓋公司的資料處理協議或 HIPAA 業務夥伴協議。"
  - question: "ChatGPT Enterprise 會用公司資料訓練模型嗎？"
    answer: "預設不會。OpenAI 的企業隱私權頁面表示，除非客戶主動選擇加入，否則不會用 ChatGPT Enterprise、Business、Edu 或 API 的資料訓練模型，並列出 Enterprise 具備 SOC 2 Type 2 稽核，以及由管理員控制的保留期限。"
  - question: "有哪些公司限制過 ChatGPT？"
    answer: "Samsung 在 2023 年傳出原始碼和內部資料外洩後，限制在公司裝置上使用生成式 AI。同一年，據報導 Apple、JPMorgan、Bank of America、Citi、Deutsche Bank、Goldman Sachs、Wells Fargo、Walmart 和 Verizon 也做了限制。"
  - question: "依照 GDPR，把客戶資料放進 ChatGPT 合法嗎？"
    answer: "必須有合法依據，並有一份符合 GDPR 第 28 條的處理者合約。附有資料處理協議的商業方案可以做到；員工的個人帳號則不行，因為公司和廠商之間並沒有針對那個帳號的合約。"
  - question: "歐盟 AI 法案的高風險規定什麼時候適用？"
    answer: "AI Omnibus 修正案已於 2026 年 7 月 27 日生效。修正後，履歷篩選這類獨立系統的高風險規定自 2027 年 12 月 2 日起適用，受規範產品中的 AI 則自 2028 年 8 月 2 日起適用。第 50 條的透明度義務已自 2026 年 8 月 2 日起適用。"
  - question: "可以用 GPUFlow 處理公司的機密資料嗎？"
    answer: "不行。在 GPUFlow 上，模型在提供者自己的電腦上執行，所以提示詞和回答會以明文經過那台機器。條款禁止提供者記錄這些內容，但這是契約上的規定，不是技術上的阻擋，所以只能用在您可以和陌生人分享的資料上。"
---

大多數「禁止使用 ChatGPT」的公司，並不反對 AI。他們反對的是員工把公司資料貼進一個公司沒有簽約的個人帳號，而廠商在預設情況下可能用這些資料改進模型。常見的解法是提供一個核准的工具：一個有不訓練和保留期限條款的商業方案、一個在公司自己雲端帳號內的模型端點，或是在公司自己營運的硬體上跑開放權重模型。只要合約到位，公開的工具在很多工作上都沒問題。

以下內容包括：大家常引用的那些案例實際上發生了什麼、2026 年適用哪些法規、各廠商的商業條款目前怎麼寫，以及在每種選擇下您的文字會送到哪裡。所有內容都在 2026 年 9 月依第一手資料查核，來源列在文末。

## Samsung 和銀行業發生了什麼事

Samsung 是大家都會引用的案例。2023 年初，它的半導體事業部門允許工程師使用 ChatGPT。之後韓國媒體報導了三起獨立事件：員工貼上原始碼來修正錯誤、用這個工具寫會議紀錄，以及輸入設備量測和良率資料。Samsung 當時沒有證實這些細節。2023 年 4 月底，一份備忘錄通知它最大部門之一的員工，公司電腦上暫時限制使用生成式 AI。在前一個月的內部調查中，65% 的受訪者表示擔心安全風險。

據《華爾街日報》報導，Apple 在 2023 年 5 月限制使用 ChatGPT 和 GitHub Copilot，因為擔心機密資料會落入以使用者資料訓練模型的開發者手中。同一批報導還列出 JPMorgan、Bank of America、Citi、Deutsche Bank、Goldman Sachs、Wells Fargo、Walmart 和 Verizon 都限制了 ChatGPT。

這些案例有兩點很容易被忽略。

第一，沒有人被駭。資料去的地方，正是員工送出的地方。擔心的是之後的事：誰保存資料、保存多久、會不會用來訓練模型，以及法院能不能要求廠商交出來。

第二，這些禁令並沒有一直維持禁令的形式。JPMorgan 建立了自己的內部平台 LLM Suite，讓員工「在安全的環境中」使用大型語言模型。它在 2024 年夏天推出，八個月內就有 200,000 名使用者開始使用。這是典型的發展：先封鎖個人版應用程式，再給大家一個核准的工具。

## 真正的風險是什麼

員工使用個人帳號時，會同時疊加四個不同的問題。

**預設用於訓練。** 在 ChatGPT Free、Plus 和 Pro 上，除非使用者在 Data controls 中關閉「Improve the model for everyone」，否則內容可能被用來改進 OpenAI 的模型。如果使用者按了讚或倒讚，即使已經選擇退出，整段對話仍可能被使用。Anthropic 的 Claude 個人方案，在使用者允許改進模型時，會用聊天內容訓練。所以您的原始碼會不會進入訓練資料集，取決於別人帳號裡的一個設定。

**您無法控制的保留期限。** OpenAI 平台上的商業資料，會在使用者刪除後 30 天內刪除，「除非我們依法必須保留」。最後這一句是真的會發生的。在《紐約時報》的訴訟中，一道從 2025 年 6 月到 2025 年 9 月 26 日有效的法院命令，要求 OpenAI 保留原本會刪除的 ChatGPT 個人版和標準 API 內容。ChatGPT Enterprise、Edu，以及採用零資料保留的 API 客戶，不在此限。

**沒有合約。** 在法律上，這一點最重要。依照 GDPR，讓廠商處理個人資料的公司，必須使用能提供「充分保證」的處理者，並與其簽訂有約束力的合約（第 28 條）。醫療服務提供者則需要業務夥伴協議（BAA）。員工的個人帳號兩者都沒有，所以在貼上的那一刻就已經違規，不論之後有沒有任何東西外洩。

**沒有紀錄。** 受監管的公司必須監督並封存業務通訊。個人帳號裡的對話，不在法遵團隊管理的任何封存系統中。

## 2026 年適用的法規

### GDPR

提示詞中含有歐盟客戶或員工的個人資料，就屬於資料處理。這需要合法依據、一份第 28 條規定的處理者合約，以及任何跨境傳輸到歐盟以外時的合法途徑。對美國廠商來說，歐美資料隱私框架（EU-US Data Privacy Framework）仍然有效：歐盟普通法院在 2025 年 9 月 3 日駁回了 Latombe 提出的挑戰（案號 T-553/23）。上訴案目前在歐洲法院審理中，案號 C-703/25 P，值得持續關注。

監管機關已經直接對聊天服務採取行動。義大利的 Garante 在 2023 年 3 月底暫時封鎖了 ChatGPT，並在 2024 年 12 月對 OpenAI 開罰 1,500 萬歐元，理由是在沒有適當法律依據的情況下處理個人資料來訓練 ChatGPT、未通報 2023 年 3 月的資料外洩事件、透明度不足，以及缺乏年齡驗證。OpenAI 認為罰款不成比例，並表示會提出上訴。

### HIPAA

任何為受規範實體接收、儲存或傳輸電子受保護健康資訊的服務，都是業務夥伴，必須簽署 BAA。HHS 明確表示，即使雲端服務供應商只保管加密資料、沒有金鑰，仍然算是業務夥伴。OpenAI 表示可以為它的 API 簽署 BAA。臨床人員的個人 ChatGPT 帳號則完全沒有 BAA。

### 金融服務業

FINRA 的第 24-09 號監管通知（2024 年 6 月 27 日）指出，它的規則適用於生成式 AI，「就如同會員公司使用任何其他技術或工具時一樣」。監督、對公眾的溝通和紀錄保存，全都照樣適用。2023 年大多數銀行的限制措施，正是因此而來。

### 歐盟 AI 法案

AI 法案於 2024 年 8 月 1 日生效。禁止行為的規定和 AI 素養義務自 2025 年 2 月 2 日起適用，通用 AI 模型提供者的義務則自 2025 年 8 月 2 日起適用。AI Omnibus 修正案，即 Regulation (EU) 2026/1744，於 2026 年 7 月 24 日公布，7 月 27 日生效。它延後了高風險規定的期限：獨立的高風險系統為 2027 年 12 月 2 日，包括履歷篩選這類用於招募的 AI；內建於受規範產品中的 AI 則為 2028 年 8 月 2 日。第 50 條的透明度義務依原定時程自 2026 年 8 月 2 日起適用，AI 素養義務則放寬為採取措施「支持」AI 素養。

對一家用聊天助理起草電子郵件的公司來說，AI 法案影響不大。但如果同一個助理開始為求職者排名，您就是在部署高風險系統，2027 年 12 月的期限就適用於您。

## 商業方案承諾了什麼

現在每家主要廠商都在賣商業方案，預設值和個人版應用程式不同。下表整理了截至 2026 年 9 月各廠商自己頁面上的說法。

| 方案 | 預設會用您的資料訓練嗎？ | 保留期限與控制 | 法遵說明 |
| --- | --- | --- | --- |
| ChatGPT Free、Plus、Pro | 可能會，除非使用者選擇退出 | 依個人帳號設定 | 沒有公司合約 |
| ChatGPT Business、Enterprise、Edu | 不會 | 工作區管理員設定保留期限 | Enterprise 和 Business 具 SOC 2 Type 2 |
| OpenAI API | 不會 | 30 天後刪除；符合資格的用途可零資料保留 | 可簽 BAA |
| Claude Team、Enterprise、API | 不會 | 回饋內容可能保留最多 5 年；擁有者可關閉回饋功能 | 商業條款 |
| Microsoft 365 Copilot 和 Copilot Chat | 不會，不用於訓練基礎模型 | 適用您的保留原則、標籤和稽核 | DPA、EU Data Boundary（Anthropic 模型除外） |
| Google Workspace 中的 Gemini | 未經許可，不會用於您網域以外的訓練 | 適用現有的 Workspace 控制 | 支援 HIPAA、FedRAMP High |

大型雲端平台內的模型端點做得更徹底。Microsoft 表示，在 Microsoft Foundry 中由 Azure 銷售的模型，其提示詞和回應「不會提供給 OpenAI 或其他提供者」，並在您選擇的地理區域內處理，除非您選擇 Global 或 DataZone 部署。在 Amazon Bedrock 上，模型在模型提供者無法存取的部署帳號中執行，所以他們永遠看不到您的提示詞或回應。

商業方案改變不了的是：文字仍然在保留條款允許的期間內存放在廠商的伺服器上，法院命令也仍然能觸及。這和您已經給電子郵件、文件服務供應商的信任是一樣的。對大多數內部工作來說，這是合理的取捨。但對營業秘密、沒有 BAA 的受規範資料，或客戶合約禁止傳給次處理者的資料，可能就不是。

## 在每種選擇下，您的提示詞會送到哪裡

比較各種選擇最誠實的方式，是跟著一則提示詞走，問問看誰能讀到它。

<figure>
<svg viewBox="0 0 720 470" role="img" aria-labelledby="d1-title" xmlns="http://www.w3.org/2000/svg" font-family="system-ui, sans-serif" font-size="15">
<title id="d1-title">員工的提示詞在五種不同 AI 架構中會送到哪裡，以及各自由什麼保護</title>
<rect x="0" y="0" width="720" height="470" fill="#ffffff"/>
<text x="325" y="30" text-anchor="middle" fill="#64748b">文字送到哪裡</text>
<text x="475" y="30" fill="#64748b">由什麼保護</text>
<rect x="20" y="200" width="140" height="70" rx="10" fill="#eef2ff" stroke="#6366f1" stroke-width="2"/>
<text x="90" y="231" text-anchor="middle" fill="#1e1b4b">員工的</text>
<text x="90" y="252" text-anchor="middle" fill="#1e1b4b">提示詞</text>
<line x1="160" y1="235" x2="200" y2="80" stroke="#6366f1" stroke-width="2"/>
<line x1="160" y1="235" x2="200" y2="160" stroke="#6366f1" stroke-width="2"/>
<line x1="160" y1="235" x2="200" y2="240" stroke="#6366f1" stroke-width="2"/>
<line x1="160" y1="235" x2="200" y2="320" stroke="#6366f1" stroke-width="2"/>
<line x1="160" y1="235" x2="200" y2="400" stroke="#6366f1" stroke-width="2"/>
<rect x="200" y="50" width="250" height="60" rx="10" fill="#ffffff" stroke="#f97316" stroke-width="2"/>
<text x="325" y="76" text-anchor="middle" fill="#1e1b4b">個人版聊天應用程式</text>
<text x="325" y="97" text-anchor="middle" fill="#64748b" font-size="13">個人的 Free、Plus 或 Pro 帳號</text>
<text x="475" y="76" fill="#1e1b4b" font-size="14">預設允許用於訓練</text>
<text x="475" y="97" fill="#1e1b4b" font-size="14">和您的公司沒有合約</text>
<rect x="200" y="130" width="250" height="60" rx="10" fill="#eef2ff" stroke="#6366f1" stroke-width="2"/>
<text x="325" y="156" text-anchor="middle" fill="#1e1b4b">廠商的商業方案</text>
<text x="325" y="177" text-anchor="middle" fill="#64748b" font-size="13">廠商的伺服器，公司帳號</text>
<text x="475" y="156" fill="#1e1b4b" font-size="14">預設不用於訓練</text>
<text x="475" y="177" fill="#1e1b4b" font-size="14">DPA、保留期限控制</text>
<rect x="200" y="210" width="250" height="60" rx="10" fill="#eef2ff" stroke="#6366f1" stroke-width="2"/>
<text x="325" y="236" text-anchor="middle" fill="#1e1b4b">您雲端中的模型端點</text>
<text x="325" y="257" text-anchor="middle" fill="#64748b" font-size="13">Azure Foundry、Amazon Bedrock</text>
<text x="475" y="236" fill="#1e1b4b" font-size="14">您的租用戶和區域</text>
<text x="475" y="257" fill="#1e1b4b" font-size="14">模型開發商永遠看不到</text>
<rect x="200" y="290" width="250" height="60" rx="10" fill="#ffffff" stroke="#16a34a" stroke-width="2"/>
<text x="325" y="316" text-anchor="middle" fill="#1e1b4b">您自己的伺服器</text>
<text x="325" y="337" text-anchor="middle" fill="#64748b" font-size="13">開放權重模型，您的網路</text>
<text x="475" y="316" fill="#1e1b4b" font-size="14">沒有任何東西離開您的網路</text>
<text x="475" y="337" fill="#1e1b4b" font-size="14">一切都由您營運和更新</text>
<rect x="200" y="370" width="250" height="60" rx="10" fill="#ffffff" stroke="#f97316" stroke-width="2"/>
<text x="325" y="396" text-anchor="middle" fill="#1e1b4b">市集 GPU（GPUFlow）</text>
<text x="325" y="417" text-anchor="middle" fill="#64748b" font-size="13">提供者自己的電腦</text>
<text x="475" y="396" fill="#1e1b4b" font-size="14">在那台機器上是明文</text>
<text x="475" y="417" fill="#1e1b4b" font-size="14">條款禁止記錄</text>
<text x="360" y="458" text-anchor="middle" fill="#64748b" font-size="13">橘色：只適合公開資料。綠色：凡是您自己 IT 能保管的資料都適用。</text>
</svg>
<figcaption>同一則提示詞，五個目的地。只有自行架設的選項能讓它留在您的網路內；商業方案和雲端端點則讓它受到您公司簽署的合約保護。</figcaption>
</figure>

## 自己執行開放權重模型

處理機密資料最有力的選擇，也是最費工的：下載一個開放權重模型（Llama、Qwen、Mistral、Gemma 等），在您自己網路內的機器上執行。提示詞永遠不會離開。記錄什麼、保存多久都由您決定，因此更容易符合紀錄保存和 GDPR 的保留規定，也不會有別人的保留條款或法院命令碰到這些資料。

不過成本是實實在在的。您現在要營運一個推論服務：GPU、Ollama 或 vLLM 這類引擎、身分驗證、日誌、更新，還要有人值班。而一個放得進單張工作站顯示卡的 8B 或 14B 模型，在長篇推理上比不上最先進的模型。它通常足以處理分類、擷取欄位、摘要內部文件和起草例行文字。做決定之前，先用您自己的工作測試看看。引擎的選擇請看我們的 [Ollama、vLLM 與 TGI 基準測試](/zh_tw/ollama-vs-vllm-vs-tgi-rtx-4090-benchmark/)，讓模型適應您的文件則請看[私密微調 LLM 指南](/zh_tw/private-llm-fine-tuning-guide/)。

許多公司走的是中間路線：在您已有的雲端帳號中，用 GPU 執行個體跑開放模型。這樣雲端服務供應商就是處理者，適用您已經為其他所有服務談好的 DPA，而且完全不牽涉任何模型廠商。

## 租用 GPU 和 GPUFlow 的定位

GPU 市集是市場上便宜的那一端，放進這個比較時，必須清楚標示它的定位。

GPUFlow 就是其中之一。您租用一張 GPU 若干小時，拿到一組相容 OpenAI 的 API 金鑰，用來呼叫提供者在上面執行的開放模型，通常透過 Ollama。模型在提供者自己的電腦上執行。這代表在租用期間，您的提示詞和回答會以明文經過那台機器。GPUFlow 的條款禁止提供者記錄、讀取、保存或分享租用者的請求或回答，GPUFlow 自己也不儲存這些文字。但提供者在那台機器上有 root 權限，而禁止記錄的規定是靠契約執行的，技術上沒有任何東西能阻止。

所以 GPUFlow **不是**受規範資料或機密資料的解決方案。不要送出客戶紀錄、健康資料、您在乎的原始碼，或任何客戶合約有限制的內容。我們自己的文件說得更直接：不要送出密碼、信用卡號碼，或其他您不會和陌生人分享的機密。

它適合的是：在買顯示卡之前，先在真實硬體上試用開放模型；用公開或合成資料跑提示詞；以及在把應用程式指向自己的伺服器之前，先對著相容 OpenAI 的 API 開發和測試。其他市集上的社群雲端機器，對您上傳的任何東西也有同樣的問題；這方面請看[如何在公用 GPU 節點上保護資料集](/zh_tw/how-to-secure-dataset-on-public-gpu-node/)。

## 大家真的會遵守的政策

沒有替代方案的全面禁令，多半只是把使用轉移到個人手機上，您能看到的就更少了。比較有效的做法是簡短到記得住：

| 資料等級 | 範例 | 允許的工具 |
| --- | --- | --- |
| 公開 | 已發布的文件、行銷文案 | 任何核准的工具，包括個人版應用程式 |
| 內部 | 政策、內部 wiki、非敏感程式碼 | 簽有 DPA 且關閉訓練的商業方案 |
| 機密 | 客戶資料、營業秘密、交易條件 | 您租用戶內的雲端端點，或自行架設 |
| 受規範 | 健康資料、信用卡資料、大量個人資料 | 自行架設，或簽有特定協議（BAA、DPA）的廠商 |

接著處理那些不起眼的部分：

1. 購買一個商業方案或雲端端點，設為預設工具，並使用單一登入，讓離職員工的帳號自動關閉。
2. 把保留期限設為符合紀錄保存義務的最短期間，並在管理主控台確認已關閉訓練。
3. 等核准的工具上線後，再在受管理的裝置上封鎖個人版 AI 聊天網站。
4. 建立 AI 用途的清單。任何涉及招募、授信或類似決策的用途，都要在 2027 年 12 月之前另行審查。
5. 告訴大家該怎麼做，而不只是不該做什麼。Samsung 的備忘錄是在資料已經送出之後才發的。

自行架設和按 token 計費服務在營運成本上的比較，請看[按小時租 GPU，還是按 token 付費的 API？](/zh_tw/hourly-gpu-vs-per-token-api/)。

## 來源

- Samsung 的限制與調查：[CNBC，2023 年 5 月 2 日](https://www.cnbc.com/2023/05/02/samsung-bans-use-of-ai-like-chatgpt-for-staff-after-misuse-of-chatbot.html)；事件細節：[The Register，2023 年 5 月 2 日](https://www.theregister.com/2023/05/02/samsung_generative_ai_ban/)
- Apple 和其他公司：[TechCrunch，2023 年 5 月 19 日](https://techcrunch.com/2023/05/19/apple-reportedly-limits-internal-use-of-ai-powered-tools-like-chatgpt-and-github-copilot/)
- JPMorgan LLM Suite：[JPMorganChase 技術部落格，2025 年 6 月 3 日](https://www.jpmorganchase.com/about/technology/blog/llmsuite-ab-award)
- OpenAI 商業條款：[企業隱私](https://openai.com/enterprise-privacy/)；個人版訓練設定：[如何使用您的資料改進模型效能](https://help.openai.com/en/articles/5722486-how-your-data-is-used-to-improve-model-performance)
- 《紐約時報》案的保存命令：[OpenAI，回應《紐約時報》的資料要求](https://openai.com/index/response-to-nyt-data-demands/)
- Anthropic：[商業版資料與訓練](https://privacy.claude.com/en/articles/7996868-is-my-data-used-for-model-training)、[個人版資料與訓練](https://privacy.claude.com/en/articles/10023580-is-my-data-used-for-model-training)
- Microsoft：[Microsoft 365 Copilot 和 Copilot Chat 的企業資料保護](https://learn.microsoft.com/en-us/copilot/microsoft-365/enterprise-data-protection)、[由 Azure 銷售之 Foundry 模型的資料、隱私與安全](https://learn.microsoft.com/en-us/azure/ai-foundry/responsible-ai/openai/data-privacy)
- Google：[Google Workspace 生成式 AI 隱私權中心](https://knowledge.workspace.google.com/admin/generative-ai/generative-ai-in-google-workspace-privacy-hub)
- AWS：[Amazon Bedrock 的資料保護](https://docs.aws.amazon.com/bedrock/latest/userguide/data-protection.html)
- GDPR 第 28 條：[gdpr-info.eu](https://gdpr-info.eu/art-28-gdpr/)
- 資料隱私框架判決：[Jones Day，2025 年 9 月](https://www.jonesday.com/en/insights/2025/09/eu-general-court-upholds-euus-data-privacy-framework)；上訴：[Digital Policy Alert](https://digitalpolicyalert.org/event/35459-latombe-filed-appeal-against-general-court-dismissal-of-challenge-to-european-unionunited-states-data-protection-framework-adequacy-decision-in-latombe-v-commission)
- Garante 罰款：[The Hacker News，2024 年 12 月](https://thehackernews.com/2024/12/italy-fines-openai-15-million-for.html)
- HIPAA 與雲端服務供應商：[HHS，HIPAA 與雲端運算指引](https://www.hhs.gov/hipaa/for-professionals/special-topics/health-information-technology/cloud-computing/index.html)
- FINRA：[第 24-09 號監管通知](https://www.finra.org/rules-guidance/notices/24-09)
- 歐盟 AI 法案：[歐盟執委會，AI 法案](https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai)；Omnibus：[White & Case，EU AI Omnibus 生效](https://www.whitecase.com/insight-alert/eu-ai-omnibus-enters-force-amending-ai-act)
- GPUFlow：[API 快速入門](https://docs.gpuflow.app/zh-tw/renters/api-quickstart/)、[租用者能存取和不能存取的範圍](https://docs.gpuflow.app/zh-tw/providers/security/)、[服務條款](https://gpuflow.app/zh-TW/terms)、[隱私權政策](https://gpuflow.app/zh-TW/privacy)

全部於 2026 年 9 月查核。
