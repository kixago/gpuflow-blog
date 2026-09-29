---
title: "GPUレンタルの本当のコスト：時間単価に含まれない費用"
description: "停止中のストレージ、データ転送量、最低入金額、課金単位、アイドル時間、カードの手数料。Vast.ai、RunPod、Lambda、AWS、GPUFlow で、GPU の時間単価以外に実際にかかる費用をまとめました。"
excerpt: "時間単価は請求額の一部にすぎません。主要な GPU レンタルサービスで確認できた追加料金を、金額と出典付きですべて紹介します。"
pubDate: 2026-02-15
updatedDate: 2026-09-29
locale: "ja"
category: "pricing"
featured: false
draft: false
author: "GPUFlow Team"
heroImage: "../_images/gpu-server-rack.jpg"
heroImageAlt: "ラックに収まった GPU サーバーのファンのクローズアップ"
faq:
  - question: "GPU レンタルサービスでは、マシンを停止している間もストレージ料金がかかりますか？"
    answer: "多くの場合、かかります。RunPod では、停止中の Pod のボリュームディスクは 1 GB あたり月 $0.20 で、稼働中の 2 倍です。Vast.ai では、インスタンスが存在する限り、停止中も含めて 1 秒ごとにストレージ料金が発生します。GPUFlow のレンタルはマシンではなく API キーなので、ストレージ料金はありません。"
  - question: "データ転送量に料金がかかる GPU レンタルサービスはどれですか？"
    answer: "Vast.ai では、送受信するデータの料金をホストが決め、すべてのバイトに課金されます。RunPod と Lambda は、受信（イングレス）にも送信（エグレス）にも料金はかからないとしています。AWS では、インターネットへの送信が月 100 GB を超えると料金がかかります。"
  - question: "レンタルを始めるのに最低いくら必要ですか？"
    answer: "Vast.ai の最低入金額は $5 です。Lambda はカードに $10 の仮売上（オーソリ）をかけます。RunPod はプリペイドカードの利用者に、1 回あたり $100 以上の入金を求めています。GPUFlow のチャージは $10 からで、手数料はかかりません。"
  - question: "GPU レンタルを米ドルで支払うと、銀行の手数料はかかりますか？"
    answer: "かかることがあります。カードの海外事務手数料は通常 1%〜3% です。価格がドル表示でも、海外の加盟店での購入に手数料をかける銀行もあります。ブラジルでは、海外でのカード利用に 3.5% の IOF 税がかかります。"
---

GPU の出品に表示されている価格は、GPU を 1 時間使う料金です。月末に支払う金額には、それ以外のものが含まれていることがよくあります。ディスク容量、データ転送、セットアップにかかる時間、そして自分の銀行の手数料です。どれも意図的に隠されているわけではありませんが、表示価格だけでサービスを比べていると見落としがちです。

この記事では、主要なサービスで確認できた追加料金をすべて、出典へのリンク付きで紹介します。確認したのはすべて 2026 年 9 月です。価格は変わるので、数字を当てにする前にリンク先を確認してください。

## 要点

| 費用 | Vast.ai | RunPod | Lambda | AWS EC2 | GPUFlow |
| --- | --- | --- | --- | --- | --- |
| 課金単位 | 秒単位 | 秒単位 | 分単位 | 秒単位（最低 60 秒） | 秒単位（最低 1 分） |
| 稼働中のストレージ | ホストが設定 | 月 $0.10/GB | ファイルシステム、GB あたりの月額 | 月 $0.08/GB（gp3） | なし |
| 停止中のストレージ | あり（課金される） | 月 $0.20/GB（ボリュームディスク） | ファイルシステム、GB あたりの月額 | 月 $0.08/GB（gp3） | なし |
| データ転送 | ホストが設定、全バイト課金 | 無料 | 無料 | インターネットへの送信：月 100 GB まで無料、以降は有料 | なし |
| 始めるのに必要な額 | $5 の入金 | 1 時間分のクレジット（プリペイドカードは $100） | カードに $10 の仮売上 | 支払い方法と GPU のクォータ | $10 のチャージ |

GPUFlow にストレージ料金や転送料金がないのは、貸し出すものが違うからです。手に入るのは、ほかの人の GPU で動いている AI モデル用の API キーで、ログインして使うマシンではありません。そのため、自分のコードや学習ジョブを実行することもできません。これについては後で詳しく説明します。

## 1. ストレージ、特に停止中のストレージ

マシンやコンテナを貸し出すサービスでは、ファイルはディスクに保存されます。ディスクには、存在している間ずっと料金がかかります。

- **RunPod** は、Pod の稼働中、コンテナディスクとボリュームディスクに 1 GB あたり月 $0.10 を課金します。Pod を停止するとコンテナディスクは消えて料金もかかりませんが、ボリュームディスクは **1 GB あたり月 $0.20** になります。ネットワークボリュームは、1 TB 未満なら稼働の有無にかかわらず 1 GB あたり月 $0.07 です。
- **Vast.ai** では、ストレージの価格は各ホストが決めます。インスタンスが存在する限り、停止中も含めて 1 秒ごとに課金されます。
- **AWS** は、インスタンスが動いているかどうかに関係なく EBS ボリュームに課金します。us-east-1 の gp3 ボリュームは 1 GB あたり月 $0.08 です。

計算例を挙げます。停止中の RunPod の Pod にある 200 GB のボリュームは、200 × $0.20 = **月 $40** です。その Pod を二度と起動しなくても、この金額がかかります。後半で紹介する一般的なマーケットプレイス価格なら、RTX 3090 を 100 時間以上借りられる金額です。

**対策：** 使っていないボリュームは削除します。セッションの合間にファイルを残しておきたいだけなら、大きな Pod を停止したまま置いておくより、小さなネットワークボリュームのほうが安く済みます。

## 2. データ転送

モデルのダウンロードやデータセットのアップロードでは、数十 GB のデータが動くことがあります。

- **Vast.ai：** アップロードとダウンロードの価格は各ホストが決めます。ドキュメントによると、インスタンスの状態にかかわらず、すべてのバイトに課金されます。借りる前に出品の帯域幅の価格を確認してください。大きなモデルをダウンロードする場合は特に重要です。
- **RunPod** と **Lambda** は、データの受信にも送信にも料金はかからないとしています。
- **AWS：** 受信は無料です。インターネットへの送信は月 100 GB まで無料で、それを超えると GB 単位で課金されます。さらに、パブリック IPv4 アドレスには、使っているかどうかに関係なく 1 つあたり 1 時間 $0.005 がかかります。

## 3. 最低入金額とカードの仮売上

GPU サービスの多くは前払い制です。先にクレジットを購入し、それを使っていきます。

- **Vast.ai：** 最低入金額は $5 です。
- **RunPod：** 選んだマシンの 1 時間分以上のクレジットが必要です。プリペイドカードの場合は、1 回あたり $100 以上の入金が必要です。
- **Lambda：** カードに $10 の仮売上をかけ、数日後に返金されます。
- **SaladCloud：** クレジットは購入から 12 か月で失効します。
- **GPUFlow：** チャージは $10〜$500 で、手数料はかからず、クレジットに有効期限はありません。

失効するクレジットや使わずに残っているクレジットも、コストの一部です。使う見込みの分だけ購入しましょう。

## 4. セットアップの時間にも料金がかかる

マシンを借りると、料金はジョブが始まったときではなく、マシンが起動したときから発生します。ドライバーやライブラリのインストール、コンテナイメージの取得、15 GB のモデルのダウンロードは、すべて課金される時間に行われます。1 時間 $0.35 なら、30 分のセットアップで約 $0.18 です。1 回だけなら小さな額ですが、毎日新しいマシンを起動するなら積み重なります。

対策は 2 つあります。必要なものがすでに入っているテンプレートやコンテナイメージを使うこと、そしてモデルをボリュームに置いてダウンロードを 1 回で済ませることです（その場合は、1 で説明したストレージ料金と比べてください）。

GPUFlow では、借りる前からプロバイダーのマシンにモデルがインストールされています。セットアップは何も必要ありません。料金はレンタルを開始した時点から発生し、キーはすぐに使えます。

## 5. 課金単位と最低料金

今では秒単位の課金が一般的ですが、最低料金はサービスによって異なります。

| サービス | 時間の課金方法 |
| --- | --- |
| Vast.ai | 秒単位、最低料金なし |
| RunPod の Pod | 秒単位 |
| RunPod サーバーレス | 秒単位（切り上げ）。ワーカーの起動時間とアイドルタイムアウト（デフォルトは 5 秒）にも課金 |
| Lambda | 分単位 |
| AWS EC2（Linux） | 秒単位、最低 60 秒 |
| Google Cloud | 秒単位、最低 1 分 |
| GPUFlow | 秒単位、最低 1 分 |

課金単位がいちばん影響するのはサーバーレスです。短いリクエストを間隔をあけて送る場合、起動時間とアイドルタイムアウトの料金が、リクエストそのものの料金を上回ることがあります。

## 6. 稼働中のマシンのアイドル時間

時間単位で借りたマシンは、GPU が処理中でも待機中でも料金は同じです。「朝すぐ使えるように」と Pod を一晩つけっぱなしにするのが、簡単に使いすぎてしまう原因になります。Lambda もはっきり書いているとおり、インスタンスは使われているかどうかに関係なく、稼働中は課金されます。

**対策：** リマインダーを設定するか、アイドル状態のマシンを止める機能があれば使います。GPUFlow では時間数を指定して予約します。早く終わったら **今すぐ終了** をクリックすれば、使わなかった時間分がクレジットに戻ります。[GPUFlow の課金のしくみ](https://docs.gpuflow.app/ja/renters/billing/)。

## 7. 中断されるマシン

中断可能な（スポット）マシンは安く、半額以下になることもよくありますが、より高い金額を払う人が現れると停止されることがあります。Vast.ai はこれを interruptible と呼び、通常 50% 以上安いとしています。TensorDock では、ほかの人に競り負けている間もストレージ料金がかかります。ジョブをチェックポイントから再開できないなら、中断されると同じ作業に 2 回料金を払うことになります。

## 8. 銀行の手数料

ほとんどの GPU サービスは米ドルで請求します。カードの通貨が別の場合、銀行が手数料を上乗せすることがあります。

- 海外事務手数料は通常 **1%〜3%** です。価格がドル表示でも、海外の加盟店での購入に手数料をかける銀行もあります。
- カナダのクレジットカードの多くは、外貨での購入に約 **2.5%** の手数料をかけます。
- ブラジルでは、**海外でのカード利用に 3.5% の IOF 税**がかかります。

$100 をチャージすると、サービスの請求書には表示されない $1〜$3.50 がかかる計算です。海外事務手数料のかからないカードを使えば、その大部分をなくせます。

## 9. プロバイダー向け：出金の手数料と最低額

自分の GPU を貸し出す場合、サービスが一定の割合を受け取り、出金にも独自のルールがあります。

| サービス | プロバイダーの取り分 | 最低出金額 | 出金手数料 |
| --- | --- | --- | --- |
| GPUFlow | レンタル料金の 88% | $25 | 出金 1 回につき $2.50 |
| Vast.ai | Vast によると、表示価格はホストの収益より通常 25% ほど高い | $20 | Vast は明記していない。利用する送金サービスが手数料をかける場合あり |
| TensorDock | ホスティング契約では手数料が 20% または 25%（本文に両方の記載あり） | 引き出しには $250 が必要 | 記載なし |

GPUFlow では、カードの異議申し立てに備えるため、収益は 7 日間（アカウント作成から 30 日未満の場合は 14 日間）保留され、その後出金できるようになります。[GPUFlow の出金のしくみ](https://docs.gpuflow.app/ja/providers/getting-paid/)。

## 一般的な GPU の価格（2026 年 9 月）

参考までに、2026 年 9 月に Vast.ai、RunPod、Salad、SimplePod、TensorDock、Hyperstack、Lambda で確認したオンデマンド価格の範囲を示します。

| GPU | 1 時間あたりの一般的な価格 |
| --- | --- |
| RTX 3060 12 GB | $0.05〜$0.08 |
| RTX 3090 | $0.11〜$0.31 |
| RTX 4090 | $0.30〜$0.46 |
| RTX 5090 | $0.41〜$0.69 |

比較すると、AWS の NVIDIA L4 1 基（us-east-1 の g6.xlarge）は 1 時間約 $0.80、A10G 1 基（g5.xlarge）は約 $1.01 です。

## 借りる前のチェックリスト

1. GPU の利用時間に **加えて**、ファイルを保存しておく期間のストレージ料金を合計します。
2. 帯域幅の料金があるサービスなら、その価格とダウンロードする量を確認します。
3. セットアップの時間も課金される時間として数えます。
4. 支払いを止める方法を把握しておきます。レンタルの終了、マシンの停止、ボリュームの削除です。
5. カードの海外事務手数料を確認します。

必要なのが、自分のソフトウェアを動かすマシンではなく、コードから呼び出せる AI モデルなら、API ベースのレンタルを選べば 1、2、4 の問題はそもそも起きません。学習用にマシン全体が必要なら、上で紹介したサービスが適しています。このチェックリストを使えば、請求額を時間単価に近い水準に抑えられます。

## 関連記事

- [GPU の時間貸しか、トークン課金の API か：7B〜8B モデルの実際のコスト](/ja/hourly-gpu-vs-per-token-api/)
- [GPUFlow・Vast.ai・RunPod・SaladCloud を比較：用途に合う GPU レンタルはどれか](/ja/gpuflow-vs-vast-ai-vs-runpod/)
- [GPU レンタルを始めるのに必要なもの（2026 年版）](/ja/what-you-need-to-rent-a-gpu/)

## 出典

すべて 2026 年 9 月に確認しました。

- RunPod の Pod の料金とストレージ：[docs.runpod.io/pods/pricing](https://docs.runpod.io/pods/pricing)
- RunPod サーバーレスの課金：[docs.runpod.io/serverless/pricing](https://docs.runpod.io/serverless/pricing)
- RunPod の課金と入金：[docs.runpod.io/references/billing-information](https://docs.runpod.io/references/billing-information)
- Vast.ai の料金と課金：[docs.vast.ai/guides/instances/pricing.md](https://docs.vast.ai/guides/instances/pricing.md)、[docs.vast.ai/documentation/reference/billing](https://docs.vast.ai/documentation/reference/billing)
- Vast.ai の入金：[docs.vast.ai クイックスタート](https://docs.vast.ai/guides/get-started/quickstart.md)
- Vast.ai のホストへの支払い：[docs.vast.ai/host/payment.md](https://docs.vast.ai/host/payment.md)、ホストの収益に関する記事：[vast.ai](https://vast.ai/article/how-much-money-can-you-earn-renting-out-your-gpu-on-vast-ai)
- Lambda の課金：[docs.lambda.ai/public-cloud/billing](https://docs.lambda.ai/public-cloud/billing/)、[請求の管理](https://docs.lambda.ai/public-cloud/manage-billing/)、[料金（「No egress fees」）](https://lambda.ai/pricing)
- SaladCloud の課金：[docs.salad.com の課金](https://docs.salad.com/general/explanation/billing.md)
- TensorDock のスポットインスタンス：[docs.tensordock.com](https://docs.tensordock.com/virtual-machines/spot-instances)、サプライヤー契約：[docs.tensordock.com](https://docs.tensordock.com/legal-information/supplier-hosting-agreement.md)
- AWS EC2 の課金：[aws.amazon.com/ec2/pricing/on-demand](https://aws.amazon.com/ec2/pricing/on-demand/)、EBS：[aws.amazon.com/ebs/pricing](https://aws.amazon.com/ebs/pricing/)、パブリック IPv4：[aws.amazon.com/vpc/pricing](https://aws.amazon.com/vpc/pricing/)
- AWS のインスタンス価格：[instances.vantage.sh g6.xlarge](https://instances.vantage.sh/aws/ec2/g6.xlarge?region=us-east-1)、[g5.xlarge](https://instances.vantage.sh/aws/ec2/g5.xlarge?region=us-east-1)
- Google Cloud の VM の課金：[cloud.google.com/compute/vm-instance-pricing](https://cloud.google.com/compute/vm-instance-pricing)
- カードの海外事務手数料：[Experian](https://www.experian.com/blogs/ask-experian/what-is-a-foreign-transaction-fee/)、[NerdWallet Canada](https://www.nerdwallet.com/ca/p/best/credit-cards/best-no-foreign-transaction-fee-credit-cards)
- ブラジルの IOF 3.5%：[Wise Brazil](https://wise.com/br/blog/iof-cartao-internacional)
- GPU の価格帯：[GPUFlow ドキュメント「GPU の価格の決め方」](https://docs.gpuflow.app/ja/providers/pricing/)
