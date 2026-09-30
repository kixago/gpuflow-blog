---
title: "企業が ChatGPT の業務利用を禁止する理由と、代わりに使っているもの"
description: "企業が公開の AI チャットアプリを制限するのは、共有する契約のないデータを社員が貼り付けてしまうからです。実際の事例、2026 年の規制、実際に機能する代替手段をまとめます。"
excerpt: "企業の ChatGPT 禁止のほとんどは、契約とデフォルト設定の問題です。Samsung で何が起きたのか、今のビジネスプランは何を約束しているのか、そしてそれぞれの選択肢でプロンプトがどこへ行くのかを見ていきます。"
pubDate: 2026-02-26
updatedDate: 2026-09-30
locale: "ja"
category: "case-studies"
featured: false
draft: false
author: "GPUFlow Team"
heroImage: "../_images/corporate-ai-policy-restriction.png"
heroImageAlt: "オフィスのパソコン画面に鍵のマークが重なり、AI へのアクセス制限を表しているイメージ"
faq:
  - question: "企業が社員の ChatGPT 利用を禁止するのはなぜですか？"
    answer: "社員が、会社として契約していない個人アカウントに社内や顧客のデータを貼り付けてしまうからです。個人向けの ChatGPT プランでは、デフォルトで OpenAI がコンテンツをモデルの改善に使えるようになっており、会社を対象とするデータ処理契約も HIPAA の事業提携契約（BAA）もありません。"
  - question: "ChatGPT Enterprise は企業のデータを学習に使いますか？"
    answer: "デフォルトでは使いません。OpenAI のエンタープライズ向けプライバシーのページには、顧客がオプトインしない限り ChatGPT Enterprise、Business、Edu、API のデータは学習に使わないとあり、Enterprise については SOC 2 Type 2 の監査と、管理者が設定できる保持期間が挙げられています。"
  - question: "ChatGPT を制限したのはどの企業ですか？"
    answer: "Samsung は、ソースコードや社内データの流出が報じられた後、2023 年に社用端末での生成 AI の利用を制限しました。同じ年には Apple、JPMorgan、Bank of America、Citi、Deutsche Bank、Goldman Sachs、Wells Fargo、Walmart、Verizon も制限したと報じられています。"
  - question: "GDPR のもとで、顧客データを ChatGPT に入力するのは合法ですか？"
    answer: "適法な根拠があり、GDPR 第 28 条を満たす処理者との契約がある場合に限ります。データ処理契約（DPA）付きのビジネスプランならこれを満たせますが、社員の個人アカウントでは満たせません。そのアカウントについて、会社はベンダーと何の契約も結んでいないからです。"
  - question: "EU AI 法の高リスク規制はいつから適用されますか？"
    answer: "2026 年 7 月 27 日に発効した AI オムニバス改正により、履歴書の選別のような単体の高リスクシステムには 2027 年 12 月 2 日から、規制対象の製品に組み込まれた AI には 2028 年 8 月 2 日から適用されます。第 50 条の透明性義務は 2026 年 8 月 2 日から適用されています。"
  - question: "GPUFlow で会社の機密データを扱ってもよいですか？"
    answer: "いいえ。GPUFlow ではモデルがプロバイダー自身のコンピューターで動くので、プロンプトと回答はそのマシンを平文で通ります。規約はプロバイダーによる記録を禁じていますが、これは契約上のルールであって技術的に防いでいるわけではありません。見知らぬ人に見せても構わないデータにだけ使ってください。"
---

「ChatGPT を禁止している」企業のほとんどは、AI そのものに反対しているわけではありません。問題にしているのは、会社として契約していない個人アカウントに社員が社内のデータを貼り付けることです。そうしたアカウントでは、デフォルトでベンダーがそのデータをモデルの改善に使えます。よくある解決策は、承認済みのツールを用意することです。学習に使わない条件と保持期間の条件が付いたビジネスプラン、自社のクラウドアカウント内のモデルエンドポイント、または自社で運用するハードウェア上のオープンウェイトモデルです。適切な契約があれば、公開のツールで十分な仕事はたくさんあります。

以下では、誰もが引き合いに出す事例で実際に何が起きたのか、2026 年にどの規制が適用されるのか、各ベンダーのビジネス向けの条件が今どうなっているのか、そしてそれぞれの選択肢でテキストがどこへ行くのかを見ていきます。内容はすべて 2026 年 9 月に一次情報で確認したもので、出典は最後にあります。

## Samsung と銀行で何が起きたのか

誰もが挙げるのは Samsung の事例です。2023 年の初め、同社の半導体部門はエンジニアに ChatGPT の利用を認めました。その後、韓国メディアが 3 つの別々の出来事を報じました。社員がバグを直すためにソースコードを貼り付けたこと、議事録の作成に使ったこと、そして装置の測定データや歩留まりのデータを入力したことです。Samsung は当時、詳細を認めていません。2023 年 4 月末、最大級の部門の社員に対し、社内のコンピューターでの生成 AI の利用を一時的に制限するという通達が出されました。その前月の社内調査では、回答者の 65% がセキュリティ上のリスクを懸念していると答えていました。

Wall Street Journal によると、Apple は 2023 年 5 月に ChatGPT と GitHub Copilot の利用を制限しました。機密データが、ユーザーのデータでモデルを学習させる開発元の手に渡ることを恐れたためです。同じ報道では、JPMorgan、Bank of America、Citi、Deutsche Bank、Goldman Sachs、Wells Fargo、Walmart、Verizon も ChatGPT を制限したとされています。

これらの事例には、見落とされやすい点が 2 つあります。

1 つ目は、誰もハッキングされていないことです。データは社員が送ったとおりの場所に届きました。懸念はその後に何が起きるかでした。誰がいつまで保持するのか、モデルの学習に使われるのか、裁判所がベンダーに提出を命じることはあるのか、です。

2 つ目は、禁止が禁止のままでは終わらなかったことです。JPMorgan は独自の社内プラットフォーム LLM Suite を作り、社員が「安全な環境で」大規模言語モデルを使えるようにしました。2024 年夏に公開され、8 か月以内に 20 万人が利用を始めました。これが典型的な流れです。個人向けのアプリを止め、その後で承認済みのものを渡します。

## 実際のリスクは何か

社員が個人向けのアカウントを使うと、4 つの別々の問題が重なります。

**デフォルトで学習に使われる。** ChatGPT の Free、Plus、Pro では、ユーザーが Data controls の「Improve the model for everyone」をオフにしない限り、コンテンツが OpenAI のモデルの改善に使われることがあります。ユーザーが高評価や低評価を押すと、オプトアウトしていても会話全体が使われることがあります。Anthropic の個人向け Claude プランでは、ユーザーがモデルの改善を許可していれば、チャットが学習に使われます。つまり、自社のソースコードが学習データに入るかどうかは、他人のアカウントの設定 1 つで決まります。

**自分で管理できない保持期間。** OpenAI のプラットフォーム上のビジネスデータは、ユーザーが削除してから 30 日以内に削除されます。ただし「法的に保持が求められる場合を除き」です。この但し書きは現実のものです。New York Times の訴訟では、2025 年 6 月から 2025 年 9 月 26 日までの裁判所命令により、OpenAI は本来なら削除するはずだった個人向け ChatGPT と通常の API のコンテンツを保持しなければなりませんでした。ChatGPT Enterprise、Edu、およびデータ保持ゼロの API の顧客は対象外でした。

**契約がない。** 法的にはこれが一番重要です。GDPR では、ベンダーに個人データの処理を任せる企業は、「十分な保証」を提供する処理者を使い、その処理者と拘束力のある契約を結ばなければなりません（第 28 条）。医療機関には事業提携契約（BAA）が必要です。社員の個人アカウントにはどちらもないので、何かが漏れるかどうかに関係なく、貼り付けた時点で違反が起きています。

**記録が残らない。** 規制対象の企業は、業務上のやり取りを監督し、保存しなければなりません。個人アカウントのチャットは、コンプライアンス部門が運用するどのアーカイブにも入りません。

## 2026 年に適用される規制

### GDPR

EU の顧客や社員の個人データをプロンプトに入れることは、処理に当たります。適法な根拠、第 28 条に基づく処理者との契約、そして EU 域外への移転には合法的な手段が必要です。米国のベンダーについては、EU-US データプライバシーフレームワークが今も有効です。EU 一般裁判所は 2025 年 9 月 3 日に Latombe の訴えを棄却しました（事件番号 T-553/23）。ただし C-703/25 P として司法裁判所に上訴されているので、動向を追っておいてください。

規制当局はチャットサービスに直接動いています。イタリアの Garante は 2023 年 3 月末に ChatGPT を一時的に停止させ、2024 年 12 月には OpenAI に 1,500 万ユーロの制裁金を科しました。理由は、適切な法的根拠なしに ChatGPT の学習のために個人データを処理したこと、2023 年 3 月の情報漏えいを届け出なかったこと、透明性が不十分だったこと、年齢確認がなかったことです。OpenAI は制裁金が不釣り合いだとし、不服を申し立てるとしました。

### HIPAA

対象事業者のために電子的な保護対象医療情報を受け取り、保存し、送信するサービスは、すべて事業提携者（ビジネスアソシエイト）であり、署名済みの BAA が必要です。HHS は、暗号化されたデータを保持するだけで鍵を持たないクラウドプロバイダーでも事業提携者に当たると明言しています。OpenAI は API について BAA を締結できるとしています。医師の個人の ChatGPT アカウントには、BAA はまったくありません。

### 金融サービス

FINRA の Regulatory Notice 24-09（2024 年 6 月 27 日）は、同機関の規則は生成 AI にも「会員企業がほかのあらゆる技術やツールを使う場合と同じように適用される」としています。監督、一般の人々とのコミュニケーション、記録の保存はすべて引き続き適用されます。2023 年の銀行による制限のほとんどは、まさにここから来ています。

### EU AI 法

AI 法は 2024 年 8 月 1 日に発効しました。禁止される行為の規定と AI リテラシーの義務は 2025 年 2 月 2 日から、汎用 AI モデルの提供者の義務は 2025 年 8 月 2 日から適用されています。AI オムニバス改正、規則（EU）2026/1744 は 2026 年 7 月 24 日に公布され、2026 年 7 月 27 日に発効しました。これにより高リスクの期限が変わりました。履歴書の選別のような採用に使う AI を含む単体の高リスクシステムは 2027 年 12 月 2 日、規制対象の製品に組み込まれた AI は 2028 年 8 月 2 日です。第 50 条の透明性義務は予定どおり 2026 年 8 月 2 日から適用され、AI リテラシーの義務は、それを「支援する」措置をとることへと緩和されました。

メールの下書きにチャットアシスタントを使う企業にとって、AI 法が付け加えるものはほとんどありません。同じアシスタントで応募者を順位付けし始めたら、あなたは高リスクシステムを導入していることになり、2027 年 12 月の期限が適用されます。

## ビジネスプランが約束していること

主要なベンダーはどこも、個人向けアプリとはデフォルトの異なるビジネス向けプランを販売しています。次の表は、2026 年 9 月時点で各ベンダー自身のページに書かれている内容をまとめたものです。

| サービス | デフォルトで学習に使うか | 保持と管理 | コンプライアンス |
| --- | --- | --- | --- |
| ChatGPT Free、Plus、Pro | ユーザーがオプトアウトしない限り使うことがある | ユーザーのアカウント単位 | 会社との契約なし |
| ChatGPT Business、Enterprise、Edu | 使わない | ワークスペースの管理者が保持期間を設定 | Enterprise と Business は SOC 2 Type 2 |
| OpenAI API | 使わない | 30 日後に削除。対象用途ではデータ保持ゼロ | BAA あり |
| Claude Team、Enterprise、API | 使わない | フィードバックは最長 5 年保持されることがある。オーナーはフィードバックをオフにできる | 商用規約 |
| Microsoft 365 Copilot と Copilot Chat | 使わない。基盤モデルの学習には使われない | 自社の保持ポリシー、ラベル、監査が適用される | DPA、EU データ境界（Anthropic のモデルは対象外） |
| Google Workspace の Gemini | 許可なくドメイン外での学習には使われない | 既存の Workspace の管理機能が適用される | HIPAA 対応、FedRAMP High |

大手クラウドの中のモデルエンドポイントは、さらに一歩進んでいます。Microsoft は、Microsoft Foundry で Azure が販売するモデルについて、プロンプトと生成結果は「OpenAI やほかのプロバイダーには提供されない」とし、Global や DataZone のデプロイを選ばない限り、選んだ地域内で処理されるとしています。Amazon Bedrock では、モデルはモデル提供者がアクセスできないデプロイ用アカウントで動くので、提供者がプロンプトや生成結果を目にすることはありません。

ビジネスプランでも変わらないことがあります。テキストは保持条件が許す限りベンダーのサーバーに置かれ、裁判所の命令も届きます。これは、メールや文書のサービスにすでに寄せているのと同じ種類の信頼です。社内のほとんどの業務にとっては妥当な取引です。営業秘密、BAA のない規制対象データ、顧客との契約で再委託先への送信が禁じられている資料については、そうとは限りません。

## それぞれの選択肢でプロンプトはどこへ行くか

選択肢を公平に比べるには、1 つのプロンプトを追いかけ、誰がそれを読めるかを問うのが一番です。

<figure>
<svg viewBox="0 0 720 470" role="img" aria-labelledby="d1-title" xmlns="http://www.w3.org/2000/svg" font-family="system-ui, sans-serif" font-size="15">
<title id="d1-title">5 種類の AI の使い方で、社員のプロンプトがどこへ行き、それぞれ何によって守られるか</title>
<rect x="0" y="0" width="720" height="470" fill="#ffffff"/>
<text x="325" y="30" text-anchor="middle" fill="#64748b">テキストの行き先</text>
<text x="475" y="30" fill="#64748b">守っているもの</text>
<rect x="20" y="200" width="140" height="70" rx="10" fill="#eef2ff" stroke="#6366f1" stroke-width="2"/>
<text x="90" y="231" text-anchor="middle" fill="#1e1b4b">社員の</text>
<text x="90" y="252" text-anchor="middle" fill="#1e1b4b">プロンプト</text>
<line x1="160" y1="235" x2="200" y2="80" stroke="#6366f1" stroke-width="2"/>
<line x1="160" y1="235" x2="200" y2="160" stroke="#6366f1" stroke-width="2"/>
<line x1="160" y1="235" x2="200" y2="240" stroke="#6366f1" stroke-width="2"/>
<line x1="160" y1="235" x2="200" y2="320" stroke="#6366f1" stroke-width="2"/>
<line x1="160" y1="235" x2="200" y2="400" stroke="#6366f1" stroke-width="2"/>
<rect x="200" y="50" width="250" height="60" rx="10" fill="#ffffff" stroke="#f97316" stroke-width="2"/>
<text x="325" y="76" text-anchor="middle" fill="#1e1b4b">個人向けチャットアプリ</text>
<text x="325" y="97" text-anchor="middle" fill="#64748b" font-size="13">個人の Free、Plus、Pro アカウント</text>
<text x="475" y="76" fill="#1e1b4b" font-size="14">デフォルトで学習に使われうる</text>
<text x="475" y="97" fill="#1e1b4b" font-size="14">会社との契約がない</text>
<rect x="200" y="130" width="250" height="60" rx="10" fill="#eef2ff" stroke="#6366f1" stroke-width="2"/>
<text x="325" y="156" text-anchor="middle" fill="#1e1b4b">ベンダーのビジネスプラン</text>
<text x="325" y="177" text-anchor="middle" fill="#64748b" font-size="13">ベンダーのサーバー、会社のアカウント</text>
<text x="475" y="156" fill="#1e1b4b" font-size="14">デフォルトで学習に使われない</text>
<text x="475" y="177" fill="#1e1b4b" font-size="14">DPA、保持期間の管理</text>
<rect x="200" y="210" width="250" height="60" rx="10" fill="#eef2ff" stroke="#6366f1" stroke-width="2"/>
<text x="325" y="236" text-anchor="middle" fill="#1e1b4b">自社クラウドのエンドポイント</text>
<text x="325" y="257" text-anchor="middle" fill="#64748b" font-size="13">Azure Foundry, Amazon Bedrock</text>
<text x="475" y="236" fill="#1e1b4b" font-size="14">自社のテナントとリージョン</text>
<text x="475" y="257" fill="#1e1b4b" font-size="14">モデルの開発元には見えない</text>
<rect x="200" y="290" width="250" height="60" rx="10" fill="#ffffff" stroke="#16a34a" stroke-width="2"/>
<text x="325" y="316" text-anchor="middle" fill="#1e1b4b">自社のサーバー</text>
<text x="325" y="337" text-anchor="middle" fill="#64748b" font-size="13">オープンモデル、自社ネットワーク</text>
<text x="475" y="316" fill="#1e1b4b" font-size="14">ネットワークの外に出ない</text>
<text x="475" y="337" fill="#1e1b4b" font-size="14">運用とパッチ適用はすべて自社</text>
<rect x="200" y="370" width="250" height="60" rx="10" fill="#ffffff" stroke="#f97316" stroke-width="2"/>
<text x="325" y="396" text-anchor="middle" fill="#1e1b4b" font-size="13">GPU マーケットプレイス（GPUFlow）</text>
<text x="325" y="417" text-anchor="middle" fill="#64748b" font-size="13">プロバイダー自身のコンピューター</text>
<text x="475" y="396" fill="#1e1b4b" font-size="14">そのマシン上では平文</text>
<text x="475" y="417" fill="#1e1b4b" font-size="14">規約で記録を禁止</text>
<text x="360" y="458" text-anchor="middle" fill="#64748b" font-size="13">オレンジ：公開データのみ可。緑：自社の IT が扱えるデータなら何でも可。</text>
</svg>
<figcaption>同じプロンプトに 5 つの行き先があります。自社ネットワークの中にとどまるのはセルフホストだけです。ビジネスプランとクラウドのエンドポイントでは、自社が結んだ契約のもとに置かれます。</figcaption>
</figure>

## オープンウェイトモデルを自社で動かす

機密データに最も強い選択肢は、最も手間がかかる選択肢でもあります。オープンウェイトモデル（Llama、Qwen、Mistral、Gemma など）をダウンロードし、自社ネットワーク内のマシンで動かすことです。プロンプトは外に出ません。何をどれだけの期間記録するかを自分で決められるので、記録保存の義務や GDPR の保持期間のルールも満たしやすくなり、他社の保持条項や裁判所の命令がデータに及ぶこともありません。

ただし、コストは現実のものです。推論サービスを運用することになります。GPU、Ollama や vLLM のようなエンジン、認証、ログ、アップデート、そして障害対応の担当者です。また、ワークステーション用のカード 1 枚に収まる 8B や 14B のモデルは、長い推論ではフロンティアモデルに及びません。分類、項目の抽出、社内文書の要約、定型文の下書きならたいてい十分です。決める前に、自社のタスクで試してください。エンジンの選び方は [Ollama・vLLM・TGI のベンチマーク](/ja/ollama-vs-vllm-vs-tgi-rtx-4090-benchmark/)で、自社の文書にモデルを合わせる方法は [LLM の非公開ファインチューニングガイド](/ja/private-llm-fine-tuning-guide/)で扱っています。

多くの企業がとる中間の道もあります。すでに持っているクラウドアカウント内の GPU インスタンスでオープンモデルを動かす方法です。クラウドプロバイダーは、ほかの業務のためにすでに交渉済みの DPA のもとでの処理者となり、モデルのベンダーはまったく関わりません。

## レンタル GPU と GPUFlow の位置づけ

GPU マーケットプレイスは市場の安価な側にあり、この比較に入れるなら、はっきりと但し書きを付ける必要があります。

GPUFlow もその 1 つです。GPU を時間単位で借り、プロバイダーがその GPU で（たいていは Ollama で）動かしているオープンモデル用の OpenAI 互換 API キーを受け取ります。モデルはプロバイダー自身のコンピューターで動きます。つまり、レンタル中、あなたのプロンプトと回答はそのマシンを平文で通ります。GPUFlow の規約は、プロバイダーが借り手のリクエストや回答を記録、閲覧、保持、共有することを禁じており、GPUFlow 自身も本文を保存しません。しかしプロバイダーはそのマシンの root 権限を持っており、記録の禁止は契約で担保されているだけで、技術的に止めるものは何もありません。

ですから、規制対象のデータや機密データには、GPUFlow は答えに**なりません**。顧客の記録、医療データ、大事なソースコード、顧客との契約で制限されているものは送らないでください。私たち自身のドキュメントはもっと率直に書いています。パスワード、カード番号など、見知らぬ人に教えたくない秘密の情報は送らないでください。

向いているのは次のような用途です。カードを買う前に実際のハードウェアでオープンモデルを試すこと、公開データや合成データでプロンプトを回すこと、自社のサーバーに向ける前に OpenAI 互換 API に対してアプリを作ってテストすることです。ほかのマーケットプレイスのコミュニティクラウドのマシンでも、アップロードするものについて同じ問題が生じます。その側面は[公開 GPU ノードでデータセットを守る方法](/ja/how-to-secure-dataset-on-public-gpu-node/)で扱っています。

## 社員が実際に守れるポリシー

代わりを用意しない一律の禁止は、たいてい利用を個人のスマートフォンに移すだけで、そうなると見えるものはさらに減ります。うまくいくのは、覚えられるくらい短いポリシーです。

| データの区分 | 例 | 使ってよいツール |
| --- | --- | --- |
| 公開 | 公開済みの文書、マーケティングの文章 | 承認済みのツールなら何でも（個人向けアプリも可） |
| 社内 | 社内規程、社内 Wiki、機密でないコード | DPA があり学習がオフのビジネスプラン |
| 機密 | 顧客データ、営業秘密、取引条件 | 自社テナント内のクラウドエンドポイント、またはセルフホスト |
| 規制対象 | 医療データ、カード情報、大量の個人データ | セルフホスト、または該当する契約（BAA、DPA）を結んだベンダー |

そのうえで、地味な作業をこなします。

1. ビジネスプランかクラウドエンドポイントを 1 つ購入してデフォルトにし、シングルサインオンで退職時にアカウントが閉じるようにします。
2. 保持期間を記録保存の義務を満たす最短の期間に設定し、管理コンソールで学習がオフになっていることを確認します。
3. 管理対象の端末で個人向け AI チャットサイトをブロックするのは、承認済みのツールが使えるようになってからにします。
4. AI の用途の一覧を作っておきます。採用、与信などの判断に関わるものは、2027 年 12 月までに別途レビューが必要です。
5. やってはいけないことだけでなく、代わりに何をすればよいかを伝えます。Samsung の通達が届いたのは、データが出ていった後でした。

セルフホストと従量課金サービスの運用コストについては、[時間単位の GPU か、トークン単位の API か](/ja/hourly-gpu-vs-per-token-api/)をご覧ください。

## 出典

- Samsung の制限と社内調査：[CNBC、2023 年 5 月 2 日](https://www.cnbc.com/2023/05/02/samsung-bans-use-of-ai-like-chatgpt-for-staff-after-misuse-of-chatbot.html)。出来事の詳細：[The Register、2023 年 5 月 2 日](https://www.theregister.com/2023/05/02/samsung_generative_ai_ban/)
- Apple とほかの企業：[TechCrunch、2023 年 5 月 19 日](https://techcrunch.com/2023/05/19/apple-reportedly-limits-internal-use-of-ai-powered-tools-like-chatgpt-and-github-copilot/)
- JPMorgan の LLM Suite：[JPMorganChase のテクノロジーブログ、2025 年 6 月 3 日](https://www.jpmorganchase.com/about/technology/blog/llmsuite-ab-award)
- OpenAI のビジネス向け条件：[エンタープライズ向けプライバシー](https://openai.com/enterprise-privacy/)。個人向けの学習設定：[モデルの性能向上にデータがどう使われるか](https://help.openai.com/en/articles/5722486-how-your-data-is-used-to-improve-model-performance)
- NYT の保全命令：[OpenAI、NYT のデータ要求への対応](https://openai.com/index/response-to-nyt-data-demands/)
- Anthropic：[商用データと学習](https://privacy.claude.com/en/articles/7996868-is-my-data-used-for-model-training)、[個人向けデータと学習](https://privacy.claude.com/en/articles/10023580-is-my-data-used-for-model-training)
- Microsoft：[Microsoft 365 Copilot と Copilot Chat のエンタープライズデータ保護](https://learn.microsoft.com/en-us/copilot/microsoft-365/enterprise-data-protection)、[Azure が販売する Foundry Models のデータ、プライバシー、セキュリティ](https://learn.microsoft.com/en-us/azure/ai-foundry/responsible-ai/openai/data-privacy)
- Google：[Google Workspace の生成 AI プライバシーハブ](https://knowledge.workspace.google.com/admin/generative-ai/generative-ai-in-google-workspace-privacy-hub)
- AWS：[Amazon Bedrock のデータ保護](https://docs.aws.amazon.com/bedrock/latest/userguide/data-protection.html)
- GDPR 第 28 条：[gdpr-info.eu](https://gdpr-info.eu/art-28-gdpr/)
- データプライバシーフレームワークの判決：[Jones Day、2025 年 9 月](https://www.jonesday.com/en/insights/2025/09/eu-general-court-upholds-euus-data-privacy-framework)。上訴：[Digital Policy Alert](https://digitalpolicyalert.org/event/35459-latombe-filed-appeal-against-general-court-dismissal-of-challenge-to-european-unionunited-states-data-protection-framework-adequacy-decision-in-latombe-v-commission)
- Garante の制裁金：[The Hacker News、2024 年 12 月](https://thehackernews.com/2024/12/italy-fines-openai-15-million-for.html)
- HIPAA とクラウドプロバイダー：[HHS、HIPAA とクラウドコンピューティングに関するガイダンス](https://www.hhs.gov/hipaa/for-professionals/special-topics/health-information-technology/cloud-computing/index.html)
- FINRA：[Regulatory Notice 24-09](https://www.finra.org/rules-guidance/notices/24-09)
- EU AI 法：[欧州委員会、AI 法](https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai)。オムニバス：[White & Case、EU AI オムニバスの発効](https://www.whitecase.com/insight-alert/eu-ai-omnibus-enters-force-amending-ai-act)
- GPUFlow：[API クイックスタート](https://docs.gpuflow.app/ja/renters/api-quickstart/)、[借り手が触れられる範囲](https://docs.gpuflow.app/ja/providers/security/)、[利用規約](https://gpuflow.app/ja/terms)、[プライバシーポリシー](https://gpuflow.app/ja/privacy)

すべて 2026 年 9 月に確認しました。
