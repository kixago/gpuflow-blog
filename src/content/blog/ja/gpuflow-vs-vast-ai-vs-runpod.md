---
title: "GPUFlow・Vast.ai・RunPod・SaladCloud を比較：用途に合う GPU レンタルはどれか"
description: "2026 年の GPU レンタルサービス 4 社を並べて比較します。実際に借りられるもの、課金のしくみ、追加料金、支払い方法、RTX 4090 と 3090 の価格、そしてそれぞれに向いている用途を解説します。"
excerpt: "この 4 社の GPU の貸し方はまったく違います。マシン全体か、コンテナか、API キーか。学習、推論、バッチ処理、アプリ開発のそれぞれに合うサービスを紹介します。"
pubDate: 2026-09-29
locale: "ja"
category: "comparisons"
featured: true
draft: false
author: "GPUFlow Team"
heroImage: "../_images/gpu-rental-platforms-compared-hero.png"
heroImageAlt: "GPU レンタルサービスを表す、高さの異なる 3 本の柱"
faq:
  - question: "GPUFlow、Vast.ai、RunPod の主な違いは何ですか？"
    answer: "Vast.ai と RunPod では、SSH や Jupyter などでアクセスできるコンテナやマシンを借りるので、どんなソフトウェアでも動かせます。GPUFlow で借りるのは、ほかの人の GPU ですでに動いている AI モデル用の OpenAI 互換 API キーです。自分のコードは実行できませんが、セットアップは何も必要ありません。"
  - question: "RTX 4090 がいちばん安いのはどこですか？"
    answer: "2026 年 9 月の時点で確認した RTX 4090 の価格は、Vast.ai が 1 時間約 $0.37 から（getdeploying.com）、RunPod Community Cloud が $0.34（当時は在庫切れ）、RunPod Secure Cloud が $0.74、SaladCloud が $0.33 でした。GPUFlow ではプロバイダーが自分で価格を決めます。レンタルサイト全体での一般的な価格帯は $0.30〜$0.46 です。"
  - question: "GPUFlow でモデルの学習やファインチューニングはできますか？"
    answer: "できません。GPUFlow が提供するのは、API を通じたモデルとのチャットです。学習やファインチューニングには、Vast.ai、RunPod、TensorDock のようにマシンそのものを借りられるサービスが必要です。"
  - question: "暗号資産で支払えるサービスはどれですか？"
    answer: "Vast.ai は BitPay と Crypto.com を通じて暗号資産に対応しています。RunPod も暗号資産に対応しています（最初の暗号資産での支払いの前に本人確認（KYC）が必要）。SaladCloud は Solana 上の USDC、USDT、RENDER に対応しています。GPUFlow は Stripe を通じたカード払いに対応しています。"
---

「GPU を借りる」の意味は、サービスによって違います。ログインして使うコンテナを丸ごと借りられるサービスもあれば、自分のコンテナを代わりに動かしてくれるエンドポイントを提供するサービスもあります。GPUFlow で手に入るのは、AI モデル用の API キーです。どれを選ぶべきかは、価格よりも何をしたいかで決まります。

RTX 3090 や 4090 のようなコンシューマー向け GPU を貸し出している 4 つのサービスを比較しました。内容はすべて 2026 年 9 月に各サービスのドキュメントと料金ページで確認したもので、出典は最後にまとめています。

## 実際に借りられるもの

| | GPUFlow | Vast.ai | RunPod | SaladCloud |
| --- | --- | --- | --- | --- |
| **借りるもの** | 1 台の GPU 上の AI モデル用 API キー | ホストのマシン上のコンテナ | Pod（コンテナ）またはサーバーレスのワーカー | 家庭用 PC 上のコンテナグループ |
| **使い方** | OpenAI 互換 API：`/v1/models`、`/v1/chat/completions` | SSH、Jupyter | SSH、JupyterLab、VS Code、Web プロキシ | 自分のコンテナの API、稼働中のインスタンスへの SSH |
| **自分のコードの実行** | 不可 | 可 | 可 | 可 |
| **使い始める前の準備** | 不要 | イメージを選び、モデルをダウンロード | テンプレートを選び、モデルをダウンロード | コンテナをビルドしてデプロイ |
| **GPU の所在** | プロバイダー自身のコンピューター | 個人からデータセンターまで | Secure Cloud（データセンター）と Community Cloud | 一般消費者の PC（「Chefs」） |

## 料金

| | GPUFlow | Vast.ai | RunPod | SaladCloud |
| --- | --- | --- | --- | --- |
| **課金** | 秒単位、最低 1 分 | 秒単位、最低料金なし | 秒単位 | 秒単位 |
| **ストレージ料金** | なし | ホストが設定、停止中も課金 | 月 $0.10/GB。停止中の Pod のボリュームは $0.20 | 記載なし（GPU の料金に vCPU と RAM が含まれる） |
| **データ転送** | なし | ホストが設定、全バイト課金 | 無料 | 記載なし |
| **始めるのに必要なもの** | チャージは最低 $10、手数料なし | 最低入金額 $5 | 1 時間分以上のクレジット（プリペイドカードは $100） | チャージは $5 から |
| **支払い方法** | カード（Stripe） | カード、BitPay、Crypto.com | カード、暗号資産、$5,000 超は請求書払い | カード、Solana 上の暗号資産 |
| **クレジットの有効期限** | なし。使わなかったレンタル時間は返金 | — | — | 購入から 12 か月 |

「—」は、そのサービスのドキュメントに規定が見つからなかったことを示します。

## 主なカードの価格（2026 年 9 月）

GPU 1 基・1 時間あたりのオンデマンド価格です。

| GPU | Vast.ai | RunPod Community / Secure | SaladCloud |
| --- | --- | --- | --- |
| RTX 3090 | 約 $0.11〜$0.12 から | $0.22 / $0.50 | $0.17 |
| RTX 4090 | 約 $0.37 から | $0.34（在庫切れ）/ $0.74 | $0.33 |
| RTX 5090 | 約 $0.43 | $0.69（在庫切れ）/ $0.99 | $0.50 |

Vast.ai と SaladCloud の価格は getdeploying.com のものです。確認した時点で、Vast 自身の価格表が読み込めなかったためです。SaladCloud は、中断される可能性がある優先度の低い枠をより安く販売しています。RunPod は 2026 年 9 月 20 日に Secure Cloud の価格を値上げしましたが、Community Cloud の価格は変わっていません。

GPUFlow では、各プロバイダーが自分で価格を決めます。レンタルサイト全体での一般的な価格帯は、RTX 3090 が $0.11〜$0.31、RTX 4090 が $0.30〜$0.46 です。GPUFlow の出品フォームでは、自分の価格がその範囲のどこにあるかをプロバイダーが確認できます。

ただし、これらは同じ商品ではない点に注意してください。セットアップに 20 分かかる $0.30 のコンテナと、すぐに使える $0.35 の API キーでは、1 時間の作業にかかる金額が違います。追加費用については [GPUレンタルの本当のコスト](/ja/hidden-fees-in-gpu-rental/) で詳しく説明しています。

## 用途に合うのはどれか

### モデルの学習やファインチューニング

**Vast.ai か RunPod。** 自分のコード、データ、ライブラリなど、環境全体が必要です。たいていは Vast.ai のほうが安く、RunPod はすぐに使えるテンプレートが豊富で、データセンターの選択肢もあります。[Stable Diffusion の LoRA 学習ガイド](/ja/stable-diffusion-lora-training-under-10-dollars/)では、両方で典型的な学習にかかる費用を試算しています。GPUFlow はマシンを貸し出さないので、この用途には使えません。

### 自分のコンテナを大規模に動かす

**SaladCloud か RunPod サーバーレス。** どちらも、自分のコンテナを多数の GPU で動かし、スケーリングも任せられます。Salad は一般消費者の PC で動くため、インスタンスが中断されることがあり、ローカルストレージも保持されません。ジョブはそれを前提に設計してください。RunPod サーバーレスでは、処理時間に加えて起動時間とアイドルタイムアウトにも課金されます。

### アプリ、スクリプト、チャットツールからオープンモデルを呼び出す

使いたいモデルを動かしているプロバイダーがいれば、**GPUFlow** です。OpenAI 互換のキーが手に入るので、OpenAI のライブラリ、LangChain、Open WebUI、たいていのチャットアプリは、ベース URL を変えるだけで使えます。保守するサーバーはなく、予約した時間の分を秒単位で支払います。早めに終了すれば、残りはクレジットに戻ります。[ツールでキーを使う方法](/ja/use-openai-compatible-api-key-in-apps/)。

GPUFlow にできないこともあります。埋め込み、画像生成、Responses API、自分のコードの実行です。また、モデルはプロバイダー自身のコンピューターで動くので、プロンプトはそこを通ります。知らない人に見せたくないものは送らないでください。

### GPU を買う前にモデルを試す

**どれでもかまいません。** GPUFlow なら数分で、セットアップなしで試せます。Vast.ai や RunPod なら、自分の推論サーバーの設定も試せます。どちらにしても、1 時間の料金はコーヒー 1 杯より安く済みます。

### 人気モデルのトークンを安く使いたいだけ

**この中にはないかもしれません。** 使いたいモデルをホスティング型の API が提供しているなら、トークン課金のほうが GPU のレンタルよりはるかに安いことがあります。計算は [GPU の時間貸しか、トークン課金の API か](/ja/hourly-gpu-vs-per-token-api/) で紹介しています。

## GPU を貸し出したい場合

| | GPUFlow | Vast.ai | Salad |
| --- | --- | --- | --- |
| **OS** | systemd を搭載した 64 ビット Linux | Ubuntu | Windows 10/11 |
| **借り手がアクセスできるもの** | GPUFlow の中継を通じた AI モデルのみ。[シェルなし、ポートの開放なし](/ja/is-it-safe-to-rent-out-your-gpu/) | あなたのマシン上のコンテナ | Salad のワークロード |
| **あなたの取り分** | 88% | Vast によると、表示価格はホストの収益より通常 25% ほど高い | 公表されていない |
| **出金** | Stripe を通じて銀行口座へ。最低 $25、出金 1 回につき $2.50 | Wise、PayPal、Stripe。最低 $20 | PayPal、ギフトカードなど |

カードごとの詳しい計算は [ゲーミング GPU の貸し出しでいくら稼げるか](/ja/how-much-can-you-earn-renting-out-your-gpu/) にまとめています。

## まとめ

- **マシンが必要なら：** 価格重視なら Vast.ai、手軽さとデータセンターの選択肢なら RunPod。
- **スケーラブルなコンテナサービスが必要なら：** SaladCloud か RunPod サーバーレス。
- **OpenAI 形式の API で使える AI モデルを、セットアップなしで使いたいなら：** GPUFlow。
- **人気モデルのトークンをできるだけ安く使いたいなら：** まずホスティング型のトークン課金 API を確認しましょう。

## 出典

すべて 2026 年 9 月に確認しました。

- GPUFlow：[レンタル](https://docs.gpuflow.app/ja/renters/getting-started/)、[課金](https://docs.gpuflow.app/ja/renters/billing/)、[API](https://docs.gpuflow.app/ja/renters/api-quickstart/)、[プロバイダー](https://docs.gpuflow.app/ja/providers/getting-started/)、[報酬の受け取り](https://docs.gpuflow.app/ja/providers/getting-paid/)、[価格帯](https://docs.gpuflow.app/ja/providers/pricing/)
- Vast.ai：[クイックスタート](https://docs.vast.ai/guides/get-started/quickstart.md)、[料金](https://docs.vast.ai/guides/instances/pricing.md)、[課金](https://docs.vast.ai/documentation/reference/billing)、[ホスティング](https://docs.vast.ai/host/hosting-overview.md)、[ホストへの支払い](https://docs.vast.ai/host/payment.md)、[ホストの収益](https://vast.ai/article/how-much-money-can-you-earn-renting-out-your-gpu-on-vast-ai)
- RunPod：[料金](https://www.runpod.io/pricing)、[Pod の料金](https://docs.runpod.io/pods/pricing)、[サーバーレスの料金](https://docs.runpod.io/serverless/pricing)、[課金](https://docs.runpod.io/references/billing-information)、[Pod](https://docs.runpod.io/pods/overview)
- RunPod Secure Cloud の価格改定：[usagepricing.com](https://www.usagepricing.com/blueprint/activity/runpod-2026-09-20-secure-cloud-price-hike)
- SaladCloud：[課金](https://docs.salad.com/general/explanation/billing.md)、[コンテナの課金](https://docs.salad.com/container-engine/explanation/billing-pricing/billing.md)、[優先度別の料金](https://docs.salad.com/container-engine/explanation/billing-pricing/priority-pricing.md)、[SSH](https://docs.salad.com/container-engine/explanation/container-groups/ssh-and-terminal.md)、[ホスト向けの Salad](https://salad.com/download/)
- 価格：getdeploying.com の [RTX 3090](https://getdeploying.com/reference/cloud-gpu/nvidia-rtx-3090)、[RTX 4090](https://getdeploying.com/reference/cloud-gpu/nvidia-rtx-4090)、[RTX 5090](https://getdeploying.com/reference/cloud-gpu/nvidia-rtx-5090)、[Vast.ai](https://getdeploying.com/vast-ai)、[Salad](https://getdeploying.com/salad)
