---
title: "RunPod と Vast.ai の比較 2026：料金、信頼性、ストレージ"
description: "2026 年 9 月に確認した RunPod と Vast.ai の比較。RTX 4090 と 3090 の GPU レンタル料金、秒単位課金、中断可能な Pod、ストレージ料金、Serverless、それぞれに向いている人。"
excerpt: "GPU 1 時間あたりの料金は、たいてい Vast.ai のほうが安く、RunPod はシンプルで、マシンをまたいで使えるストレージがあります。最新の料金、課金ルール、選び方のフローをまとめました。"
pubDate: 2026-02-12
updatedDate: 2026-09-30
locale: "ja"
category: "comparisons"
featured: false
draft: false
author: "GPUFlow Team"
heroImage: "../_images/runpod-vs-vastai-comparison.png"
heroImageAlt: "RunPod と Vast.ai のプラットフォームを表す GPU サーバーの画面を左右に並べた比較"
faq:
  - question: "RTX 4090 なら RunPod と Vast.ai のどちらが安いですか？"
    answer: "たいていは Vast.ai です。2026 年 9 月、getdeploying.com には Vast.ai の RTX 4090 がオンデマンドで 1 時間 $0.31 から、中断可能で $0.21 から掲載されていました。RunPod Community Cloud は $0.34、RunPod Secure Cloud は $0.74 です。ただし Vast.ai はデータ転送にも課金し、RunPod は課金しません。"
  - question: "RunPod と Vast.ai は秒単位で課金しますか？"
    answer: "はい、どちらも GPU の時間を秒単位で計測します。RunPod はネットワークボリュームを 1 時間単位で課金し、Pod を起動する前に、選んだ構成の少なくとも 1 時間分のクレジットが必要です。Vast.ai は、停止中も含めてインスタンスが存在する間はストレージを課金します。"
  - question: "停止した Pod やインスタンスにも費用はかかりますか？"
    answer: "どちらもかかります。RunPod は停止中の Pod のボリュームディスクに 1 GB あたり月 $0.20 を課金し、ネットワークボリュームは 1 GB あたり月 $0.07 で課金が続きます。Vast.ai は、インスタンスを破棄するまでホストのストレージ料金がかかり続けます。"
  - question: "RunPod や Vast.ai で残高がなくなるとどうなりますか？"
    answer: "RunPod は、ネットワークボリュームのある Pod を停止し、ない Pod は削除します。削除された Pod のデータは復元できません。Vast.ai は残高がゼロになるとインスタンスを停止し、マイナス残高を補うカードが登録されていなければ、インスタンスとそのデータを破棄します。"
  - question: "RunPod や Vast.ai は暗号資産で支払えますか？"
    answer: "支払えます。RunPod はカード、KYC 認証後の暗号資産、$5,000 を超える注文の請求書払いに対応しています。Vast.ai は Stripe 経由のカードと、BitPay および Crypto.com 経由の暗号資産に対応しており、最低デポジットは $5 です。"
  - question: "Vast.ai は本番運用に使えるほど信頼できますか？"
    answer: "選ぶホスト次第です。Vast.ai のマシンはどれも信頼性スコア 60% から始まり、実績に応じて変わります。Vast が本番運用に勧めているのはデータセンターのホスト（ISO 27001 認証取得、青いラベルで表示）です。RunPod Secure Cloud は T3/T4 のデータセンターで運用されています。"
---

安いのはたいてい Vast.ai です。2026 年 9 月、RTX 4090 は Vast.ai のオンデマンドで 1 時間 $0.31 からで、RunPod Community Cloud は $0.34、RunPod Secure Cloud は $0.74 でした。製品としてシンプルなのは RunPod です。定価制で、データ転送は無料、ネットワークボリュームを使えばファイルを特定のマシンより長く残せます。何より料金が大事で、ホストがいなくなってもジョブが持ちこたえられるなら Vast.ai、判断することを減らしたく、1 台のマシンに縛られないストレージがほしいなら RunPod です。

以下の内容は、2 社のドキュメントと料金ページ、それに Vast.ai のマーケットプレイス価格については getdeploying.com から取ったもので、すべて 2026 年 9 月に確認しました。価格は週単位で変わるので、スナップショットとして扱ってください。

## 概要

| | RunPod | Vast.ai |
| --- | --- | --- |
| **形態** | 1 社で運営：Secure Cloud（データセンター）と Community Cloud（審査済みのピアホスト） | マーケットプレイス：自宅のマシンから認証済みのデータセンターまでのホスト |
| **価格を決めるのは** | RunPod、定価制 | 各ホスト |
| **課金** | 秒単位、起動には 1 時間分のクレジットが必要 | 秒単位 |
| **RTX 4090、1 時間あたり** | Community $0.34、Secure $0.74 | オンデマンド $0.31 から、中断可能 $0.21 から |
| **安いプラン** | スポット（中断可能）Pod、3 か月または 6 か月の Savings Plan | 中断可能（入札制）、リザーブドで最大 50% 引き |
| **停止中のストレージ** | ボリュームディスク 1 GB あたり月 $0.20 | 破棄するまでホストの料金 |
| **持ち運べるストレージ** | ネットワークボリューム、1 GB あたり月 $0.07 | ボリュームは 1 台のマシンに固定 |
| **データ転送** | 受信・送信とも無料 | ホストの料金、バイト単位 |
| **Serverless** | Flex ワーカーと Active ワーカー | インスタンスと同じ料金の Serverless |
| **支払い** | カード、暗号資産（KYC 後）、$5,000 超は請求書 | カード、BitPay、Crypto.com、最低 $5 |

以下では、これらの行の根拠と、どこで効いてくるかを説明します。

## 性格の違う 2 つの会社

**RunPod** は 2 つのプールを運営しています。Secure Cloud は、同社の言葉では「T3/T4 のデータセンターで運用」されており、本番運用や機密データ向けです。Community Cloud は「審査済みの安全なピアツーピアの仕組みで、個人のコンピューティングプロバイダーと利用者をつなぐ」ものです。今年変わった点が 1 つあります。RunPod のドキュメントには現在「Community Cloud の新規ホストの受け付けを終了した」とあります。既存の Community の容量は引き続き使えます。つまり RunPod の安い階層は固定されたプールで、人気のカードは売り切れていることがよくあります。

**Vast.ai** はマーケットプレイスです。ホストがマシンを出品して価格を自分で決め、あなたはそのどれかの上で Docker コンテナ（または VM）を借ります。マシンには 3 つの等級があります。未検証（新規）、検証済み（Vast 独自のテストに合格）、データセンターです。データセンターのホストになるには、ISO/IEC 27001 か Tier 2/3 の格付けを持ち、ホスティング契約を結び、事業の所有者を証明し、GPU サーバーを 5 台以上出品する必要があります。こうした出品には青いラベルが付き、Vast が「Secure Cloud」と呼ぶものを構成しています。

どちらの会社も、データセンター階層を「Secure Cloud」と呼んでいます。意味は似ていますが、審査の内容は違うので、コンプライアンス担当に何かを約束する前に、各社の定義を読んでください。

実務上は、どちらも SSH と Jupyter の使えるコンテナを提供します。RunPod には VS Code と Cursor からの接続と、ポートを公開するための Web プロキシもあります。日々の作業（イメージの pull、ストレージのマウント、スクリプトの実行）はどちらでも同じです。

## よく使われるカードの料金

GPU 1 基・1 時間あたり、特に断りのない限りオンデマンド、2026 年 9 月時点：

| GPU | Vast.ai | RunPod Community | RunPod Secure |
| --- | --- | --- | --- |
| RTX 3090 | オンデマンド $0.13、中断可能 $0.08 | $0.22 | $0.50 |
| RTX 4090 | オンデマンド $0.31、中断可能 $0.21 | $0.34 | $0.74 |

Vast.ai の価格は、getdeploying.com が 2026 年 9 月 30 日に掲載していた最安の出品です。RTX 3090 の $0.13 は 8 GPU マシン、RTX 4090 の中断可能 $0.21 はカナダの 4 GPU マシンの価格で、どちらも GPU 1 基あたりです。単一 GPU の出品は少し高いこともあります。RunPod の価格は同社の料金ページと getdeploying.com によるものです。大きなカードでは、RunPod の Secure Cloud の料金表で RTX 5090 が 1 時間 $0.99、A100 80 GB が $1.59、H100 SXM が $3.49 です。

RunPod は 2026 年 9 月 20 日に Secure Cloud の 11 の価格を値上げしました。RTX 4090 は $0.69 から $0.74、A100 は $1.39 から $1.59、H100 SXM は $2.99 から $3.49 になりました。RTX 3090 と RTX 5090 は据え置きで、Community Cloud の価格は変わっていません。

### 計算例

RTX 4090 1 基で 10 時間のファインチューニング：

- Vast.ai オンデマンド：10 × $0.31 = $3.10、これに転送したバイト分のホストの料金が加わります。
- Vast.ai 中断可能：10 × $0.21 = $2.10、誰にも高値で入札されなければです。入札されたら、最後のチェックポイント以降の時間を失います。
- RunPod Community：10 × $0.34 = $3.40、空いているカードがあればです。
- RunPod Secure：10 × $0.74 = $7.40。

1 回のジョブなら差は数ドルです。1 か月連続で使う（730 時間）と、Vast.ai のオンデマンドで $226、RunPod Secure で $540 になります。長時間動かすワークロードの置き場所を選ぶなら、見るべきはこの数字です。

### 中断可能とスポット

どちらも、回収される可能性がある代わりに安い容量を売っています。

Vast.ai では入札額を設定します。中断可能インスタンスは「より高い入札によって停止されることがあり」、そのときは「インスタンスが停止されます（実行中のプロセスは強制終了）」。Vast によると、中断可能はオンデマンドより 50% 以上安いことが多いとのことです。オンデマンドのインスタンスはその逆で、ホストが決めた固定価格で「中断されることはありません」。

RunPod はこれを中断可能 Pod、またはスポット Pod と呼んでいます。API の説明では「低いコストで借りられるが、別の Pod にリソースを空けるためにいつでも停止されることがある」Pod です。RunPod 自身のブログでは、RTX A6000 がオンデマンドの $0.491 に対してスポットで $0.232 という例が挙がっています。

どちらでもルールは同じです。頻繁にチェックポイントを保存し、別のマシンで再開できるジョブにだけ使ってください。

### コミットメント

RunPod は Savings Plan を販売しています。3 か月または 6 か月分を前払いすると、GPU のコンピューティングが割引になります。返金不可で終了日が決まっており、ストレージは対象外です。Vast.ai は、契約期間に応じて最大 50% 引きのリザーブドインスタンスを販売しています。Vast での予約は 1 つのホストのマシンに対するものなので、前払いする前にそのホストの信頼性を確認してください。

## 信頼性：データセンターとホストのマーケットプレイス

2 社がいちばん違うのはここで、価格差の理由もここにあります。

RunPod Secure Cloud では、ハードウェアと施設を管理している会社から借ります。RunPod の料金ドキュメントによると、オンデマンドの Pod はあなた専用で「他のユーザーに押しのけられることはありません」。Community Cloud はピアホストで、RunPod 自身の比較表でも信頼性は「ばらつきあり」です。

Vast.ai では、マシンを出品した人から借ります。Vast には相手を見極めるための手段があります。

- **信頼性スコア。** 「マシンの過去の稼働時間と健全性の指標です。すべてのマシンは 60% から始まります」。90% 台後半のスコアは、長く問題のない実績を意味します。
- **検証済みと未検証。** 未検証のマシンは新しく、テストされていません。
- **データセンターのラベル。** 認証を受けた施設で、Vast が本番運用に勧めているものです。
- **最長期間。** どの出品にも、ホストが貸し出す期間が表示されます。出品は「終了日に達するか、ホストが出品を取り下げるまで……利用可能」なので、気に入ったマシンが来月もあるとは限りません。

マーケットプレイスで何年も借りてきた私のルールはこうです。まず信頼性で絞り込み、価格はその次。そして、どんなものでもホストのディスクに唯一のコピーを置かないこと。実行中に消える $0.25 のマシンは、消えない $0.35 のマシンより高くつきます。

RunPod の罠も 1 つ知っておく価値があります。停止した Pod を再起動するとき、RunPod は「容量が変わっていると GPU がゼロ台で割り当てられることがある」と警告しています。ファイルは残っていても、そのマシンの GPU は別の人に貸し出されているかもしれません。ネットワークボリュームがあるのはそのためです。

## ストレージと停止のコスト

時間単価だけでは全体像がわからなくなるのがストレージです。GPU の課金が止まっても、ストレージの課金は続きます。

### RunPod

| ストレージ | 稼働中 | 停止中 |
| --- | --- | --- |
| コンテナディスク | 1 GB あたり月 $0.10 | 課金なし（消去される） |
| ボリュームディスク（/workspace） | 1 GB あたり月 $0.10 | 1 GB あたり月 $0.20 |
| ネットワークボリューム、1 TB 未満 | 1 GB あたり月 $0.07 | 1 GB あたり月 $0.07 |
| ネットワークボリューム、1 TB 超 | 1 GB あたり月 $0.05 | 1 GB あたり月 $0.05 |

コンテナディスクとボリュームディスクは秒単位、ネットワークボリュームは 1 時間単位で課金されます。コンテナディスクは作業用の一時領域で、Pod を停止すると消去されます。ボリュームディスクは停止しても残りますが、Pod を削除（terminate）すると消えます。ネットワークボリュームはどの Pod からも独立していて、新しい Pod に接続できるので、「再起動したら GPU がゼロ台」の問題を解決できます。停止して、別の場所で新しい Pod を起動し、同じボリュームを接続すればよいのです。

計算例：セッション間で 100 GB のモデルとチェックポイントを保持するとします。停止中の Pod のボリュームディスクなら 100 × $0.20 = 月 $20 です。ネットワークボリュームなら 100 × $0.07 = 月 $7 で、1 台のマシンに縛られません。データ転送はどちらの方向も無料です。

### Vast.ai

Vast には、インスタンスと一緒に削除されるコンテナストレージと、ローカルボリュームがあります。使い方を左右するルールが 2 つあります。

- **ディスクサイズは作成時に固定されます。** 後から変更できないので、最初に余裕を持って選んでください。
- **ボリュームは 1 台の物理マシンに固定されます。** 「他のマシンのインスタンスに移動したり接続したりすることはできません」。

ストレージの料金はホストによって違い、各出品に表示されます（Rent ボタンにカーソルを合わせると出ます）。インスタンスが存在する間は課金されます。「インスタンスを停止してもストレージ料金は発生し続けます。ストレージの課金を止めるには、インスタンスを完全に破棄する必要があります」。なお Vast は、マシンがオフラインの間は課金されないと明記しています。

帯域幅もホストが料金を決め、両方向ともバイト単位で課金されます。16 GB のモデルをダウンロードし、チェックポイントをいくつかアップロードする程度なら、たいていのホストでは少額ですが、大きなデータセットを動かす前に料金を確認してください。RunPod はこれにまったく課金しません。

時間単価に含まれないものをプラットフォーム全般について詳しく挙げたものは、[GPU レンタルの本当のコスト](/ja/hidden-fees-in-gpu-rental/)をご覧ください。

## テンプレートとセットアップ

どちらも Docker イメージを使い、プリセットを「テンプレート」と呼んでいます。

RunPod のテンプレートは「手作業で環境を構成せずに Pod をすばやく立ち上げられる、設定済みの Docker イメージ」で、PyTorch、ComfyUI、推論サーバーのほか、コミュニティ製のものも多数あります。テンプレートを選び、GPU を選べば、数分で JupyterLab か SSH に入れます。

Vast.ai も考え方は同じです。クイックスタートでは、PyTorch、TensorFlow、ComfyUI などの既製テンプレートか、自分のテンプレートを使うよう案内しています。セットアップの手順は少し多く、借りる前のメールアドレスの確認、SSH 公開鍵のアップロード、ブラウザで Jupyter を使うための Vast の証明書のインストールが必要です。

どちらにも任意のイメージを持ち込めるので、最初の 1 週間を過ぎればテンプレートはそれほど重要ではありません。実務上のより大きな違いは、RunPod では環境をネットワークボリュームに置いて持ち運べるのに対し、Vast.ai では新しいマシンのたびに作り直すか、すべてをイメージに焼き込むことになる点です。

## Serverless

どちらもコンテナをオートスケールするエンドポイントとして動かせますが、課金方法が違います。

**RunPod Serverless** には、アイドル時にゼロまでスケールする Flex ワーカーと、割引価格で常時稼働する Active ワーカー（営業経由で手配）があります。支払うのは 3 つのフェーズです。起動時間（コンテナとモデルを GPU メモリに読み込む時間）、実行時間、そして各リクエスト後のアイドルタイムアウト（デフォルト 5 秒）です。料金ページでは、RTX 4090 の階層（24 GB PRO）が 1 時間 $1.10 で、$0.74 の Secure Cloud の Pod よりかなり高くなっています。トラフィックがゼロの間は何も動かさずに済むことへの対価です。

**Vast.ai Serverless** は「Vast.ai の Serverless 以外の GPU インスタンスと同じ料金」で、秒単位、追加料金なしで課金します。Active とロード中のワーカーは GPU、ストレージ、帯域幅を支払います。非アクティブなワーカーはストレージと帯域幅だけです。作成中のワーカーは GPU の時間を支払いません。

トラフィックの波が激しく、コールドスタートを許容できるなら、どちらでも使えます。完成度とサンプルの豊富さでは RunPod が上です。Vast.ai は GPU 1 秒あたりでは安いものの、同じ玉石混交のホストのプールで動きます。

OpenAI 形式の API でオープンなモデルを呼び出せればよいだけなら、どちらも不要かもしれません。人気のモデルなら、ホスティングされたトークン課金の API がいちばん安いことがよくあります（[計算はこちら](/ja/hourly-gpu-vs-per-token-api/)）。GPUFlow という選択肢もあります。プロバイダーが自分の GPU で Ollama を使って動かしているモデルの OpenAI 互換 API キーを借りるもので、課金は秒単位です。推論専用で、SSH、学習、独自コードの実行はできないので、それ以外の用途で RunPod や Vast.ai の代わりにはなりません。3 つの比較は[GPUFlow、Vast.ai、RunPod の比較](/ja/gpuflow-vs-vast-ai-vs-runpod/)にあります。

## 支払い、最低額、クレジット切れ

どちらも前払い制で、どちらも残高がゼロになったときは容赦がありません。

**RunPod** は、カード（Stripe 経由の Visa、Mastercard、Amex など）、暗号資産（初回の暗号資産での支払い前に KYC を完了）、$5,000 を超える注文の ACH、電信送金、カードによる請求書払いに対応しています。Pod をデプロイするには、選んだ構成の少なくとも 1 時間分のクレジットが必要です。クレジットは返金も引き出しもできません。残高が尽きると、ネットワークボリュームのある Pod は停止され、ボリュームは保持されます（課金も続きます）。ネットワークボリュームのない Pod は「削除され、そのデータは復元できません」。

**Vast.ai** は、Stripe 経由のカードと、BitPay および Crypto.com 経由の暗号資産に対応しています。最低デポジットは $5 で、先にメールアドレスの確認が必要です。自動チャージを設定すると、残高が指定したしきい値を下回ったときに登録済みのカードからチャージされます。残高が $0.00 になるとインスタンスは停止します。カードが登録されていれば、Vast はマイナス残高をそのカードに請求します。登録されていなければ「インスタンスと保存データは破棄されます」。残高がマイナスの間もストレージの課金は続きます。返金については、使ったクレジットは返金されません。カードで買った未使用のクレジットはサポートに依頼し、暗号資産でのチャージは返金できません。

実務上のアドバイスはどちらも同じです。自動チャージを有効にするか余裕を持たせておき、失えないものはネットワークボリュームかプラットフォームの外に置いてください。

## どちらを選ぶか

<figure>
<svg viewBox="0 0 720 520" role="img" aria-labelledby="d1-title" xmlns="http://www.w3.org/2000/svg" font-family="system-ui, sans-serif" font-size="15">
<title id="d1-title">RunPod と Vast.ai のどちらを選ぶかの判断フロー。API だけで足りる場合から最安値まで</title>
<defs><marker id="d1-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="#64748b"/></marker></defs>
<rect x="20" y="20" width="400" height="56" rx="10" fill="#eef2ff" stroke="#6366f1" stroke-width="2"/>
<text x="220" y="53" text-anchor="middle" fill="#1e1b4b">API でモデルを呼び出せれば十分？</text>
<rect x="480" y="20" width="220" height="56" rx="10" fill="#ffffff" stroke="#e2e8f0" stroke-width="2"/>
<text x="590" y="53" text-anchor="middle" fill="#1e1b4b" font-size="13">トークン課金 API か GPUFlow</text>
<rect x="20" y="120" width="400" height="56" rx="10" fill="#eef2ff" stroke="#6366f1" stroke-width="2"/>
<text x="220" y="153" text-anchor="middle" fill="#1e1b4b">本番運用やコンプライアンスの要件がある？</text>
<rect x="480" y="120" width="220" height="56" rx="10" fill="#ffffff" stroke="#e2e8f0" stroke-width="2"/>
<text x="590" y="144" text-anchor="middle" fill="#1e1b4b">RunPod Secure Cloud</text>
<text x="590" y="165" text-anchor="middle" fill="#64748b" font-size="13">または Vast のデータセンター</text>
<rect x="20" y="220" width="400" height="56" rx="10" fill="#eef2ff" stroke="#6366f1" stroke-width="2"/>
<text x="220" y="253" text-anchor="middle" fill="#1e1b4b">データを複数のマシン間で持ち運びたい？</text>
<rect x="480" y="220" width="220" height="56" rx="10" fill="#ffffff" stroke="#e2e8f0" stroke-width="2"/>
<text x="590" y="253" text-anchor="middle" fill="#1e1b4b" font-size="13">RunPod のネットワークボリューム</text>
<rect x="20" y="320" width="400" height="56" rx="10" fill="#eef2ff" stroke="#6366f1" stroke-width="2"/>
<text x="220" y="353" text-anchor="middle" fill="#1e1b4b">ゼロまでスケールするエンドポイントがほしい？</text>
<rect x="480" y="320" width="220" height="56" rx="10" fill="#ffffff" stroke="#e2e8f0" stroke-width="2"/>
<text x="590" y="353" text-anchor="middle" fill="#1e1b4b">どちらかの Serverless</text>
<rect x="20" y="420" width="400" height="70" rx="10" fill="#f0fdf4" stroke="#16a34a" stroke-width="2"/>
<text x="220" y="450" text-anchor="middle" fill="#1e1b4b">それ以外：Vast.ai、最安値</text>
<text x="220" y="474" text-anchor="middle" fill="#64748b" font-size="13">信頼性で絞り込み、中断可能ならチェックポイントを保存</text>
<line x1="420" y1="48" x2="476" y2="48" stroke="#64748b" stroke-width="2" marker-end="url(#d1-arrow)"/>
<text x="448" y="40" text-anchor="middle" fill="#16a34a" font-size="13">はい</text>
<line x1="420" y1="148" x2="476" y2="148" stroke="#64748b" stroke-width="2" marker-end="url(#d1-arrow)"/>
<text x="448" y="140" text-anchor="middle" fill="#16a34a" font-size="13">はい</text>
<line x1="420" y1="248" x2="476" y2="248" stroke="#64748b" stroke-width="2" marker-end="url(#d1-arrow)"/>
<text x="448" y="240" text-anchor="middle" fill="#16a34a" font-size="13">はい</text>
<line x1="420" y1="348" x2="476" y2="348" stroke="#64748b" stroke-width="2" marker-end="url(#d1-arrow)"/>
<text x="448" y="340" text-anchor="middle" fill="#16a34a" font-size="13">はい</text>
<line x1="220" y1="76" x2="220" y2="116" stroke="#64748b" stroke-width="2" marker-end="url(#d1-arrow)"/>
<text x="234" y="101" fill="#f97316" font-size="13">いいえ</text>
<line x1="220" y1="176" x2="220" y2="216" stroke="#64748b" stroke-width="2" marker-end="url(#d1-arrow)"/>
<text x="234" y="201" fill="#f97316" font-size="13">いいえ</text>
<line x1="220" y1="276" x2="220" y2="316" stroke="#64748b" stroke-width="2" marker-end="url(#d1-arrow)"/>
<text x="234" y="301" fill="#f97316" font-size="13">いいえ</text>
<line x1="220" y1="376" x2="220" y2="416" stroke="#64748b" stroke-width="2" marker-end="url(#d1-arrow)"/>
<text x="234" y="401" fill="#f97316" font-size="13">いいえ</text>
</svg>
<figcaption>上から順にたどり、最初に「はい」になったところで止まります。チェックポイントを保存できる学習や実験の多くは、いちばん下のボックスに行き着きます。</figcaption>
</figure>

**Vast.ai を選ぶのはこんなとき：**

- GPU 1 時間あたりの料金を最優先する場合。特に、月の差額が数百ドルに達する長時間の実行ではそうです。
- ジョブがチェックポイントを保存し、別のマシンで再開できる場合。それなら中断可能インスタンスが、見つかる中で最も安い GPU の時間です。
- Rent をクリックする前に、ホストの信頼性スコア、所在地、最長レンタル期間を 5 分かけて読むのをいとわない場合。
- インスタンス価格に上乗せなしの Serverless がほしい場合。

**RunPod を選ぶのはこんなとき：**

- 固定の料金表がよく、ホストを比べたくない場合。
- データを特定のマシンより長く残す必要がある場合。1 GB あたり月 $0.07 のネットワークボリュームは、両プラットフォームの中で最もすっきりした答えです。
- 大量のデータを出し入れする場合。RunPod はこれに課金しません。
- データセンター階層、KYC 付きの暗号資産払い、1 社からの大口注文の請求書払いが必要な場合。

できれば **両方使う** のもおすすめです。RunPod のネットワークボリュームを拠点にしつつ、チェックポイントを保存する長い学習は安い Vast.ai のマシンに回している人はたくさんいます。Docker イメージの移動は簡単です。計画が必要なのはデータの移動です。

レンタルに何が必要か（イメージ、ストレージ、SSH 鍵）をまだ整理している段階なら、[GPU レンタルを始めるのに必要なもの](/ja/what-you-need-to-rent-a-gpu/)から始めてください。より広い範囲の料金は[2026 年の GPU レンタル料金比較](/ja/gpu-rental-pricing-comparison-2026/)で比べられます。

## 出典

すべて 2026 年 9 月に確認しました。

- RunPod：[料金ページ](https://www.runpod.io/pricing)、[Pod の料金とストレージ](https://docs.runpod.io/pods/pricing)、[Pods の概要](https://docs.runpod.io/pods/overview)、[Pod の選び方](https://docs.runpod.io/pods/choose-a-pod)、[Pod の管理](https://docs.runpod.io/pods/manage-pods)、[Pod 作成 API（interruptible フィールド）](https://docs.runpod.io/api-reference/pods/POST/pods)、[Serverless の料金](https://docs.runpod.io/serverless/pricing)、[請求](https://docs.runpod.io/references/billing-information)、[スポットとオンデマンド](https://www.runpod.io/blog/spot-vs-on-demand-instances-runpod)
- RunPod Secure Cloud の 2026 年 9 月 20 日の価格改定：[usagepricing.com](https://www.usagepricing.com/blueprint/activity/runpod-2026-09-20-secure-cloud-price-hike)
- Vast.ai：[クイックスタート](https://docs.vast.ai/guides/get-started/quickstart.md)、[料金](https://docs.vast.ai/guides/instances/pricing.md)、[レンタルの種類](https://docs.vast.ai/guides/reference/faq/rental-types)、[インスタンスの検索とレンタル](https://docs.vast.ai/guides/instances/choosing/find-and-rent)、[データセンターのステータス](https://docs.vast.ai/documentation/host/datacenter-status)、[ストレージの種類](https://docs.vast.ai/documentation/instances/storage/types)、[ボリューム](https://docs.vast.ai/documentation/instances/storage/volumes)、[Serverless の料金](https://docs.vast.ai/serverless/pricing)、[請求](https://docs.vast.ai/documentation/reference/billing)
- マーケットプレイスの価格：getdeploying.com の [RTX 4090](https://getdeploying.com/reference/cloud-gpu/nvidia-rtx-4090) と [RTX 3090](https://getdeploying.com/reference/cloud-gpu/nvidia-rtx-3090)
- GPUFlow：[借り手向けのはじめに](https://docs.gpuflow.app/ja/renters/getting-started/)、[API クイックスタート](https://docs.gpuflow.app/ja/renters/api-quickstart/)
