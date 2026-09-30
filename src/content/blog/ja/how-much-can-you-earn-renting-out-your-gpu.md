---
title: "ゲーミング GPU の貸し出しでいくら稼げるか：RTX 3060〜RTX 5090、手数料と電気代を引いた手取り"
description: "2026 年にコンシューマー向け GPU を貸し出した場合の収益を正直に計算します。最新のレンタル価格、サービスの手数料、米国・カナダ・英国・ドイツ・フランスの電気代、そして 1 日 4 時間と 12 時間貸し出した場合に毎月残る金額を紹介します。"
excerpt: "1 時間貸すといくらになり、サービスがいくら受け取り、電気代でいくら消え、毎月いくら残るのか。自分の数字で試せるよう、計算式も載せています。"
pubDate: 2026-09-29
locale: "ja"
category: "guides"
featured: false
draft: false
author: "GPUFlow Team"
heroImage: "../_images/how-much-can-you-earn-renting-out-your-gpu-hero.png"
heroImageAlt: "グラフィックカードと、高くなっていくコインの山のイラスト"
faq:
  - question: "GPU レンタルのマーケットプレイスで、RTX 4090 は月にいくら稼げますか？"
    answer: "2026 年 9 月の一般的な価格である 1 時間約 $0.38、GPUFlow の手数料 12%、米国の平均的な電気代で計算すると、RTX 4090 の手取りは貸し出し 1 時間あたり約 $0.25 です。1 日 4 時間貸し出せば月約 $30、1 日 12 時間なら月約 $91 になります。ただし、PC のほかの部品が使う電力は含んでいません。"
  - question: "RTX 3060 を貸し出す価値はありますか？"
    answer: "かろうじて、という程度です。1 時間 $0.05〜$0.08 の RTX 3060 は、手数料と米国の電気代を引くと、貸し出し 1 時間あたりの手取りは約 $0.03 です。1 日 4 時間貸し出しても月約 $3 です。"
  - question: "GPU を貸し出すための電気代はいくらかかりますか？"
    answer: "消費電力（kW）に 1 kWh あたりの電気料金を掛けます。ボード電力 450 W の RTX 4090 なら、2026 年の米国平均である 1 kWh あたり 18.2 セントで 1 時間約 $0.08、ドイツでは 1 時間約 €0.17 です。"
  - question: "GPUFlow の収益を出金できるのはどの国ですか？"
    answer: "出金は Stripe を通じて行われ、現在は米国、カナダ、英国、スイス、欧州経済領域（EEA）で利用できます。"
---

1 日の大半を使わずに置いているゲーミング GPU があるなら、マーケットプレイスで貸し出して時間単位で報酬を得られます。やる価値があるかどうかは、次の 4 つの数字で決まります。

1. **借り手が払う金額**（そのカードの 1 時間あたり）。
2. **サービスが受け取る金額。**
3. **稼働中にかかる電気代。**
4. **1 日に実際に何時間貸し出されるか。**

最初の 3 つは簡単に調べられます。4 つ目は誰にも約束できない数字なので、幅を持たせて示します。以下の価格はすべて 2026 年 9 月に確認したもので、出典は最後にまとめています。

## 1. 借り手が払う金額

2026 年 9 月の GPU レンタルサイト（Vast.ai、RunPod、Salad、SimplePod、TensorDock、Hyperstack、Lambda）における、1 時間あたりの一般的なオンデマンド価格です。

| GPU | 1 時間あたりの一般的な価格 | 価格帯の中間 |
| --- | --- | --- |
| RTX 3060 12 GB | $0.05〜$0.08 | $0.065 |
| RTX 4070 | $0.07〜$0.15 | $0.11 |
| RTX 3090 | $0.11〜$0.31 | $0.21 |
| RTX 4080 | $0.23〜$0.27 | $0.25 |
| RTX 4090 | $0.30〜$0.46 | $0.38 |
| RTX 5090 | $0.41〜$0.69 | $0.55 |

速度と同じくらいメモリも重要です。3090 や 4090 のような 24 GB のカードは、[12 GB や 16 GB のカードより大きな AI モデルを動かせる](/ja/which-ai-models-fit-your-gpu-vram/)ため、借り手はその分を支払います。

## 2. サービスが受け取る金額

| サービス | 取り分 | 出金 |
| --- | --- | --- |
| GPUFlow | 12% を受け取り、あなたの手取りは 88% | Stripe を通じて銀行口座へ。最低 $25、出金 1 回につき $2.50。 |
| Vast.ai | Vast によると、表示価格はホストの収益より通常 25% ほど高い | Wise、PayPal、Stripe。最低 $20、毎週精算。 |
| Salad | 公表されていない | PayPal、ギフトカード、ゲームなど |

しくみも異なります。Vast.ai のホストは Ubuntu を使い、借り手はホスト上のコンテナを受け取って SSH や Jupyter でアクセスします。Salad は Windows 10 または 11 で動きます。GPUFlow では、systemd を搭載した Linux コンピューターでコマンドを 1 つ実行するだけです。借り手がアクセスできるのは API 経由の AI モデルだけで、[あなたのマシンのシェルには決して触れられません](/ja/is-it-safe-to-rent-out-your-gpu/)。[借り手がアクセスできるもの、できないもの](https://docs.gpuflow.app/ja/providers/security/)。

## 3. 電気代

計算式は **消費電力（kW）× 1 kWh あたりの電気料金 = 1 時間あたりのコスト** です。

消費電力には、各カードの公式のボード電力を使います。これはカード自体が消費する最大値に近い数字で、AI のテキスト生成中はこれより少ないことがよくあります。PC のほかの部品の電力も加わります。正確に知るには測るのがいちばんです。GPUFlow では **マイマシン** に GPU のリアルタイムの消費電力が表示され、コンセントに挿すタイプの電力計を使えば PC 全体の消費電力がわかります。

| GPU | ボード電力 |
| --- | --- |
| RTX 3060 | 170 W |
| RTX 4070 | 200 W |
| RTX 3090 | 350 W |
| RTX 4080 | 320 W |
| RTX 4090 | 450 W |
| RTX 5090 | 575 W |

450 W の RTX 4090 を 1 時間動かしたときの電気代です。

| 地域 | 家庭用電気料金 | 450 W で 1 時間 |
| --- | --- | --- |
| 米国（2026 年の平均予測） | 18.2 ¢/kWh | 約 $0.08 |
| カナダ | C$0.170/kWh | 約 C$0.08 |
| 英国（2026 年 10〜12 月の上限価格） | 26.32 p/kWh | 約 11.8 p |
| ドイツ | €0.3869/kWh | 約 €0.17 |
| フランス | €0.2561/kWh | 約 €0.12 |

米国では、4090 を 1 時間貸し出して得られる収益の約 4 分の 1 が電気代に消えます。ドイツでは同じ 1 時間に約 €0.17 かかるので、価格を決める前に自分の電気料金を確認してください。

## 4. まとめて計算する

価格帯の中間の価格、GPUFlow の取り分 88%、米国の平均電気代、ボード電力をフルに使った場合の、貸し出し 1 時間あたりの金額です。

| GPU | 手取り（88%） | 電気代 | 貸し出し 1 時間あたりの残り | 1 日 4 時間（月 120 時間） | 1 日 12 時間（月 360 時間） |
| --- | --- | --- | --- | --- | --- |
| RTX 3060 12 GB | $0.057 | $0.031 | **$0.026** | $3.15 | $9.45 |
| RTX 4070 | $0.097 | $0.036 | **$0.060** | $7.25 | $21.74 |
| RTX 3090 | $0.185 | $0.064 | **$0.121** | $14.53 | $43.60 |
| RTX 4080 | $0.220 | $0.058 | **$0.162** | $19.41 | $58.23 |
| RTX 4090 | $0.334 | $0.082 | **$0.253** | $30.30 | $90.90 |
| RTX 5090 | $0.484 | $0.105 | **$0.379** | $45.52 | $136.57 |

この表に含まれていないものが 3 つあります。

- **待機時間。** 借り手に見つけてもらうには、PC の電源を入れてオンラインにしておく必要があります。待っている間も電力は消費されます。アイドル時の PC の消費電力も測って、その分も差し引いてください。
- **消耗。** 長時間の負荷がかかると、ファンやサーマルペーストの劣化が早まります。ケースの風通しを良くし、温度に気を配ってください。
- **税金。** レンタル収入は所得です。どう課税されるかは、住んでいる地域によって異なります。

## 数字からわかること

- **RTX 3090、4080、4090、5090** は、1 日に数時間貸し出されれば、それなりの金額を稼げます。コストパフォーマンスで選ぶなら 3090 です。24 GB のメモリを持ちながら、電気代が安く済みます。
- **RTX 3060 と 4070** は、1 時間あたりの収益がごくわずかです。月 $3 では、3060 が GPUFlow の最低出金額 $25 に届くまで約 8 か月かかります。電気代が安い場合や、どのみち PC をつけている場合にだけ、やる価値があります。
- **すべては稼働率で決まります。** 同じ 4090 でも、1 日 4 時間貸し出されるか 12 時間貸し出されるかで、月 $30 にも $91 にもなります。数セントの値引きより、適正な価格と安定してオンラインを保っているマシンのほうが、多くのレンタルにつながります。

## 貸し出し時間を増やすには

1. **最初は価格帯の下半分に設定します。** 借り手は比較しています。レンタルが入るようになってから値上げすればかまいません。
2. **オンラインを保ちます。** オフラインの GPU は借りられません。GPUFlow では、借り手がオフラインの GPU で **オンラインになったら通知** をクリックできます。誰かが待っているときは、あなたにメールが届きます。
3. **人気のモデルを提供します。** 出品には、`qwen2.5:7b` や `llama3.1:8b` のように、動かしているモデルの名前を書きます。借り手はモデル名で検索します。
4. **1 週間後にもう一度確認します。** ほとんどの時間貸し出されているなら、少し値上げします。レンタルがなければ、少し値下げします。

GPUFlow の出品フォームには、ほかのレンタルサイトや、同じカードのほかの GPUFlow の出品と比べて自分の価格がどのあたりにあるか、そして手数料を引いた 1 時間あたりの収益が表示されます。

![GPUFlow の出品フォームの価格バー。RTX 4090 の一般的な価格と、手数料を引いた収益が表示されている](../_images/screens/ja/provider-price-bar.png)

## GPUFlow の出金が使える地域

GPUFlow は Stripe を通じて、**米国、カナダ、英国、スイス、欧州経済領域（EEA）** の銀行口座に出金します。それ以外の地域に住んでいる場合も GPU を出品でき、得た収益をほかの GPU のレンタルに使えますが、今のところ銀行口座への出金はできません。収益は 7 日間（アカウント作成から 30 日未満の場合は 14 日間）保留され、その後出金できるようになります。[GPUFlow での報酬の受け取り](https://docs.gpuflow.app/ja/providers/getting-paid/)。

## 自分の数字で計算してみる

**（1 時間あたりの価格 × 0.88）−（ワット数 ÷ 1,000 × 1 kWh あたりの電気料金）= 貸し出し 1 時間あたりの残り**

これに、現実的に見込める時間数を掛けます。答えが月に数ドルなら、消耗を考えるとおそらく割に合いません。数十ドルになるなら、1 か月試してみて実際の数字を確かめる価値があります。

始めるには、[GPU をオンラインにする](https://docs.gpuflow.app/ja/providers/getting-started/)と[GPU の価格の決め方](https://docs.gpuflow.app/ja/providers/pricing/)をご覧ください。

## 関連記事

- [GPUFlow・Vast.ai・RunPod・SaladCloud を比較：用途に合う GPU レンタルはどれか](/ja/gpuflow-vs-vast-ai-vs-runpod/)
- [GPUレンタルの本当のコスト：時間単価に含まれない費用](/ja/hidden-fees-in-gpu-rental/)

## 出典

すべて 2026 年 9 月に確認しました。

- GPU レンタルの価格帯：[GPUFlow ドキュメント「GPU の価格の決め方」](https://docs.gpuflow.app/ja/providers/pricing/)
- GPUFlow の手数料、保留、出金：[GPUFlow ドキュメント「報酬の受け取り」](https://docs.gpuflow.app/ja/providers/getting-paid/)
- Vast.ai のホストの収益：[vast.ai の記事](https://vast.ai/article/how-much-money-can-you-earn-renting-out-your-gpu-on-vast-ai)（2026 年 5 月 18 日）、出金：[docs.vast.ai/host/payment.md](https://docs.vast.ai/host/payment.md)、ホスティングの要件：[docs.vast.ai/host/hosting-overview.md](https://docs.vast.ai/host/hosting-overview.md)
- Salad：[salad.com/download](https://salad.com/download/)、[PayPal での交換](https://support.salad.com/rewards/redeeming-your-rewards/how-to-redeem-paypal/)
- ボード電力：NVIDIA の製品ページ（[RTX 3060](https://www.nvidia.com/en-us/geforce/graphics-cards/30-series/rtx-3060-3060ti/)、[RTX 4080](https://www.nvidia.com/en-us/geforce/graphics-cards/40-series/rtx-4080-family/)、[RTX 4090](https://www.nvidia.com/en-us/geforce/graphics-cards/40-series/rtx-4090/)、[RTX 5090](https://www.nvidia.com/en-us/geforce/graphics-cards/50-series/rtx-5090/)）、RTX 3090：[TechPowerUp](https://www.techpowerup.com/gpu-specs/geforce-rtx-3090.c3622)、RTX 4070：[TechSpot](https://www.techspot.com/review/2663-nvidia-geforce-rtx-4070/)
- 米国の電気料金：[EIA Short-Term Energy Outlook](https://www.eia.gov/outlooks/steo/report/elec_coal_renew.php)（2026 年 9 月）
- 英国の電気料金：[Ofgem の上限価格](https://www.ofgem.gov.uk/your-energy-supply/your-energy-bill/energy-price-cap-unit-rates-and-standing-charges)
- ドイツとフランスの電気料金（2025 年下半期）：[Eurostat 電気料金統計](https://ec.europa.eu/eurostat/statistics-explained/index.php?title=Electricity_price_statistics)、[Eurostat nrg_pc_204 のフランスのデータ](https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/nrg_pc_204?geo=FR&nrg_cons=KWH2500-4999&unit=KWH&tax=I_TAX&currency=EUR&lastTimePeriod=1)
- カナダの電気料金（2025 年 6 月）：[GlobalPetrolPrices](https://www.globalpetrolprices.com/Canada/electricity_prices/)
