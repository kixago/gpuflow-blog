---
title: "レンタル GPU で LLM を非公開のままファインチューニングする実践ガイド"
description: "RAG やプロンプトよりファインチューニングが有効な場面、モデルサイズ別の QLoRA の VRAM、TRL・Unsloth・Axolotl、レンタル GPU でデータを守る方法、費用、学習後のモデルの提供までをまとめます。"
excerpt: "8B のオープンモデルの QLoRA ファインチューニングは、レンタルした 24 GB の GPU 1 枚に収まり、1 回あたり約 $0.35〜$0.83 です。お金を払う前に、ファインチューニングが本当に適切な手段かを確かめ、他人のマシンの上でデータをどう守るかを決めておきましょう。"
pubDate: 2025-02-23
updatedDate: 2026-09-30
locale: "ja"
category: "tutorials"
featured: false
draft: false
author: "GPUFlow Team"
heroImage: "../_images/private-llm-fine-tuning-guide-hero.png"
heroImageAlt: "非公開のデータセットを使い、レンタルした GPU サーバーで言語モデルをファインチューニングする様子のイラスト"
faq:
  - question: "7B や 8B のモデルをファインチューニングするには、どれくらいの VRAM が必要ですか？"
    answer: "Unsloth の要件表では、QLoRA なら 7B モデルで約 5 GB、8B モデルで約 6 GB、通常の 16 ビット LoRA なら約 19 GB と 22 GB です。実際の学習では長いシーケンスや大きなバッチのための余裕が必要なので、RTX 3090 や 4090 のような 24 GB のカードが無難です。"
  - question: "ファインチューニングと RAG のどちらを使うべきですか？"
    answer: "モデルに文書の中の事実、特に変わっていく事実を使わせたいなら RAG です。Ovadia らの 2024 年の研究では、知識の追加において RAG は教師なしファインチューニングを一貫して上回りました。プロンプトでは安定して得られない、一貫した形式、口調、特定のタスクでの振る舞いが必要なときにファインチューニングします。"
  - question: "レンタル GPU で LLM をファインチューニングするといくらかかりますか？"
    answer: "8B モデルを 2,000 件の例で QLoRA 学習すると、セットアップを含めて 1 時間強かかります。$0.31/時の Vast.ai の RTX 4090 なら約 $0.35、RunPod の定価 $0.74/時なら $0.83 です（2026 年 9 月）。20,000 件の学習なら約 4 時間で、$1.24〜$2.97 です。"
  - question: "GPU のホストに学習データを見られることはありますか？"
    answer: "ハードウェアの所有者はホストなので、見られうると考えてください。コンテナの隔離はほかの借り手からあなたを守るもので、マシンの所有者からではありません。機密性の高いデータには審査済みのデータセンターのホスト（Vast.ai Secure Cloud、RunPod Secure Cloud）を使い、アップロード前に個人データを取り除き、終わったらインスタンスを削除してください。"
  - question: "LoRA と QLoRA の違いは何ですか？"
    answer: "LoRA はベースモデルを固定し、小さなアダプター行列を学習します。QLoRA も同じことをしますが、固定したベースモデルを 4 ビットの NF4 精度で読み込みます。元の論文では、これで 65B のモデルを 48 GB の GPU 1 枚でファインチューニングできるほどメモリが減りました。"
  - question: "GPUFlow でファインチューニングしたり、自分のモデルをアップロードしたりできますか？"
    answer: "できません。GPUFlow は推論専用です。借りるのは、プロバイダーが自分のマシンに（たいていは Ollama で）インストールしたモデルの OpenAI 互換のチャット API です。シェルもファイルへのアクセスもないので、学習も自分のモデルのアップロードもできません。"
---

8B のオープンウェイトモデルは、レンタルした 24 GB の GPU 1 枚で、自分のデータを使って QLoRA でファインチューニングできます。よくある 1 回の学習なら費用は $1 未満です。難しい問題はその前にあります。そもそもファインチューニングが正しい解決策なのか（事実を扱うなら、たいていは検索のほうが有利です）、そして他人が所有するマシンの上でデータをどう非公開に保つかです。

このガイドではその両方を扱い、続いてモデルサイズ別に必要な VRAM、現在のツール、動く学習スクリプト、費用の計算例、学習結果の提供方法を説明します。内容はすべて 2026 年 9 月に確認したもので、出典は最後にあります。

## ファインチューニングか、RAG か、プロンプトの改善か

ファインチューニングはモデルの振る舞いを変えます。事実を教える方法としては向いていません。Ovadia らは知識の注入について両者を比べ、RAG は教師なしファインチューニングを「一貫して上回る」こと、しかも「学習中に触れた既存の知識でも、まったく新しい知識でも」そうであることを示しました。彼らのまとめはこうです。LLM はファインチューニングで新しい事実を覚えるのが苦手です。

ですから、何かを借りる前にこの判断の流れをたどってください。

<figure>
<svg viewBox="0 0 720 420" role="img" aria-labelledby="d1-title" xmlns="http://www.w3.org/2000/svg" font-family="system-ui, sans-serif" font-size="15">
<title id="d1-title">検索、プロンプトの改善、ファインチューニング、より大きなモデルのどれを選ぶかの判断フロー</title>
<defs><marker id="d1-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#64748b"/></marker></defs>
<rect width="720" height="420" fill="#ffffff"/>
<rect x="60" y="15" width="280" height="40" rx="8" fill="#1e1b4b"/>
<text x="200" y="40" text-anchor="middle" fill="#ffffff">回答の質が足りない</text>
<line x1="200" y1="55" x2="200" y2="83" stroke="#64748b" stroke-width="2" marker-end="url(#d1-arrow)"/>
<rect x="20" y="85" width="360" height="50" rx="8" fill="#ffffff" stroke="#f97316" stroke-width="2"/>
<text x="200" y="115" text-anchor="middle" fill="#1e1b4b">事実が足りない、またはデータが変わる？</text>
<rect x="440" y="80" width="260" height="60" rx="10" fill="#f0fdf4" stroke="#16a34a" stroke-width="2"/>
<text x="570" y="105" text-anchor="middle" fill="#1e1b4b" font-weight="600">RAG を使う</text>
<text x="570" y="126" text-anchor="middle" fill="#64748b" font-size="13">リクエストごとに文書を検索</text>
<line x1="380" y1="110" x2="438" y2="110" stroke="#64748b" stroke-width="2" marker-end="url(#d1-arrow)"/>
<text x="409" y="102" text-anchor="middle" fill="#16a34a" font-size="13">はい</text>
<line x1="200" y1="135" x2="200" y2="173" stroke="#64748b" stroke-width="2" marker-end="url(#d1-arrow)"/>
<text x="215" y="160" fill="#64748b" font-size="13">いいえ</text>
<rect x="20" y="175" width="360" height="50" rx="8" fill="#ffffff" stroke="#f97316" stroke-width="2"/>
<text x="200" y="205" text-anchor="middle" fill="#1e1b4b">指示と例を与えれば直る？</text>
<rect x="440" y="170" width="260" height="60" rx="10" fill="#f0fdf4" stroke="#16a34a" stroke-width="2"/>
<text x="570" y="195" text-anchor="middle" fill="#1e1b4b" font-weight="600">プロンプトを改善する</text>
<text x="570" y="216" text-anchor="middle" fill="#64748b" font-size="13">システムプロンプト、few-shot の例</text>
<line x1="380" y1="200" x2="438" y2="200" stroke="#64748b" stroke-width="2" marker-end="url(#d1-arrow)"/>
<text x="409" y="192" text-anchor="middle" fill="#16a34a" font-size="13">はい</text>
<line x1="200" y1="225" x2="200" y2="263" stroke="#64748b" stroke-width="2" marker-end="url(#d1-arrow)"/>
<text x="215" y="250" fill="#64748b" font-size="13">いいえ</text>
<rect x="20" y="265" width="360" height="50" rx="8" fill="#ffffff" stroke="#f97316" stroke-width="2"/>
<text x="200" y="295" text-anchor="middle" fill="#1e1b4b">決まった形式、口調、技能が必要？</text>
<rect x="440" y="260" width="260" height="60" rx="10" fill="#eef2ff" stroke="#6366f1" stroke-width="2"/>
<text x="570" y="285" text-anchor="middle" fill="#1e1b4b" font-weight="600">QLoRA でファインチューニング</text>
<text x="570" y="306" text-anchor="middle" fill="#64748b" font-size="13">質の良い例が数百件</text>
<line x1="380" y1="290" x2="438" y2="290" stroke="#64748b" stroke-width="2" marker-end="url(#d1-arrow)"/>
<text x="409" y="282" text-anchor="middle" fill="#16a34a" font-size="13">はい</text>
<line x1="200" y1="315" x2="200" y2="353" stroke="#64748b" stroke-width="2" marker-end="url(#d1-arrow)"/>
<text x="215" y="340" fill="#64748b" font-size="13">いいえ</text>
<rect x="60" y="355" width="280" height="50" rx="10" fill="#f8fafc" stroke="#64748b" stroke-width="2"/>
<text x="200" y="385" text-anchor="middle" fill="#1e1b4b">より大きなベースモデルを試す</text>
<text x="570" y="370" text-anchor="middle" fill="#64748b" font-size="13">RAG とファインチューニングは併用できる：</text>
<text x="570" y="390" text-anchor="middle" fill="#64748b" font-size="13">振る舞いは学習で、事実は検索で</text>
</svg>
<figcaption>「モデルが社内のことを知らない」という問題の多くは、検索の問題です。ファインチューニングが費用に見合うのは、毎回同じ振る舞いが必要なときです。JSON スキーマ、社内の文体、分類ルールなどです。</figcaption>
</figure>

ファインチューニングする正当な理由には、次のようなものがあります。

- **厳密な出力形式。** 毎回のプロンプトに 1 ページ分の指示を書かなくても、呼び出しのたびに自社のスキーマどおりに項目を抽出させる。
- **文体と口調。** 自社のチームらしいサポートの返信や、決まった構成のレポート。
- **小さなモデルに任せる特定のタスク。** 1 つの仕事なら、調整した 8B モデルで大きな汎用モデルを置き換えられます。安いハードウェアで提供するときに効いてきます。
- **プロンプトの短縮。** 重みに学習させた振る舞いは、リクエストのたびに繰り返す必要がありません。

## LoRA と QLoRA

フルファインチューニングはすべての重みを更新するので、GPU はモデルに加えて、すべての重みの勾配とオプティマイザーの状態を保持しなければなりません。LoRA はベースモデルを固定し、層の横に置いた小さな低ランク行列を学習します。元の論文では、GPT-3 175B を Adam でフルファインチューニングする場合と比べて、学習するパラメーターが 1 万分の 1、GPU メモリが 3 分の 1 になったと報告されています。

QLoRA はさらに進めて、固定したベースモデルを 4 ビットの NF4 精度で読み込み、アダプターだけを 16 ビットで学習します。Dettmers らはこれを使って、65B のモデルを 48 GB の GPU 1 枚でファインチューニングし、しかも「16 ビットのフルファインチューニングと同等のタスク性能を保って」いました。この論文で追加された 3 つの仕組みは、今もツールで使われています。NF4 データ型、量子化定数の二重量子化、そしてメモリの急増を吸収するページングオプティマイザーです。

どちらでも、結果はアダプターです。いくつかのテンソルが入ったフォルダーで、変更していないベースモデルの上に適用します。別に持っておくことも、重みに統合することもできます。画像モデルでも同じ手法を使います。[Stable Diffusion の LoRA](/ja/stable-diffusion-lora-training-under-10-dollars/)なら、レンタルした 24 GB のカード 1 枚で、$10 を大きく下回る費用で学習できます。

## 必要な VRAM

Unsloth は、ファインチューニングに必要な最小 VRAM をモデルサイズ別の表で公開しています。以下は同社のメモリ最適化を使った場合の数字です。素の Hugging Face での学習ではもっと必要になり、シーケンスが長くなったりバッチが大きくなったりすれば、どの行も数字が上がります。

| モデルサイズ | QLoRA（4 ビット） | LoRA（16 ビット） | QLoRA が余裕で収まるレンタル GPU |
| --- | --- | --- | --- |
| 3B | 3.5 GB | 8 GB | 12 GB 以上ならどれでも |
| 8B | 6 GB | 22 GB | RTX 3090 / 4090（24 GB） |
| 14B | 8.5 GB | 33 GB | RTX 3090 / 4090（24 GB） |
| 32B | 26 GB | 76 GB | 48 GB のカード（RTX A6000、A40、L40S） |
| 70B | 41 GB | 164 GB | 80 GB のカード（A100、H100） |

<figure>
<svg viewBox="0 0 720 320" role="img" aria-labelledby="d2-title" xmlns="http://www.w3.org/2000/svg" font-family="system-ui, sans-serif" font-size="15">
<title id="d2-title">8B、14B、32B、70B のモデルを QLoRA と 16 ビット LoRA でファインチューニングするのに必要な最小 VRAM を、24 GB、48 GB、80 GB のカードと比べた棒グラフ</title>
<rect width="720" height="320" fill="#ffffff"/>
<rect x="200" y="12" width="14" height="14" fill="#6366f1"/>
<text x="220" y="24" fill="#1e1b4b" font-size="13">QLoRA 4bit</text>
<rect x="320" y="12" width="14" height="14" fill="#eef2ff" stroke="#6366f1" stroke-width="1.5"/>
<text x="340" y="24" fill="#1e1b4b" font-size="13">LoRA 16bit</text>
<line x1="262.1" y1="58" x2="262.1" y2="265" stroke="#f97316" stroke-width="1.5" stroke-dasharray="5 4"/>
<text x="262.1" y="52" text-anchor="middle" fill="#f97316" font-size="12">24 GB</text>
<line x1="324.2" y1="58" x2="324.2" y2="265" stroke="#f97316" stroke-width="1.5" stroke-dasharray="5 4"/>
<text x="324.2" y="52" text-anchor="middle" fill="#f97316" font-size="12">48 GB</text>
<line x1="407.1" y1="58" x2="407.1" y2="265" stroke="#f97316" stroke-width="1.5" stroke-dasharray="5 4"/>
<text x="407.1" y="52" text-anchor="middle" fill="#f97316" font-size="12">80 GB</text>
<text x="190" y="88" text-anchor="end" fill="#1e1b4b">8B</text>
<rect x="200" y="66" width="15.5" height="16" fill="#6366f1"/>
<text x="221" y="79" fill="#1e1b4b" font-size="12">6</text>
<rect x="200" y="84" width="56.9" height="16" fill="#eef2ff" stroke="#6366f1" stroke-width="1.5"/>
<text x="268" y="97" fill="#1e1b4b" font-size="12">22</text>
<text x="190" y="138" text-anchor="end" fill="#1e1b4b">14B</text>
<rect x="200" y="116" width="22" height="16" fill="#6366f1"/>
<text x="228" y="129" fill="#1e1b4b" font-size="12">8.5</text>
<rect x="200" y="134" width="85.4" height="16" fill="#eef2ff" stroke="#6366f1" stroke-width="1.5"/>
<text x="291" y="147" fill="#1e1b4b" font-size="12">33</text>
<text x="190" y="188" text-anchor="end" fill="#1e1b4b">32B</text>
<rect x="200" y="166" width="67.3" height="16" fill="#6366f1"/>
<text x="273" y="179" fill="#1e1b4b" font-size="12">26</text>
<rect x="200" y="184" width="196.7" height="16" fill="#eef2ff" stroke="#6366f1" stroke-width="1.5"/>
<text x="425" y="197" fill="#1e1b4b" font-size="12">76</text>
<text x="190" y="238" text-anchor="end" fill="#1e1b4b">70B</text>
<rect x="200" y="216" width="106.1" height="16" fill="#6366f1"/>
<text x="302" y="229" text-anchor="end" fill="#ffffff" font-size="12">41</text>
<rect x="200" y="234" width="424.5" height="16" fill="#eef2ff" stroke="#6366f1" stroke-width="1.5"/>
<text x="631" y="247" fill="#1e1b4b" font-size="12">164</text>
<line x1="200" y1="265" x2="640" y2="265" stroke="#64748b" stroke-width="1"/>
<text x="200" y="283" text-anchor="middle" fill="#64748b" font-size="12">0</text>
<text x="303.5" y="283" text-anchor="middle" fill="#64748b" font-size="12">40</text>
<text x="407.1" y="283" text-anchor="middle" fill="#64748b" font-size="12">80</text>
<text x="510.6" y="283" text-anchor="middle" fill="#64748b" font-size="12">120</text>
<text x="614.1" y="283" text-anchor="middle" fill="#64748b" font-size="12">160</text>
<text x="420" y="306" text-anchor="middle" fill="#64748b" font-size="13">最小 VRAM（GB、Unsloth の要件表より）</text>
</svg>
<figcaption>レンタルのコンシューマー向けカードが使えるのは QLoRA のおかげです。14B までは 24 GB のカードに余裕をもって収まり、32B には 48 GB、70B には 80 GB のカードが必要です。4 ビットで読み込まなければ、8B でさえ 24 GB にぎりぎりです。</figcaption>
</figure>

私の基本は、RTX 4090 で 8B か 14B のモデルです。2,048 トークンのシーケンスと妥当なバッチサイズの余裕を残せる、最も安いレンタル GPU で、この範囲のモデルなら学習後の提供も簡単です。提供に使う GPU の VRAM からベースモデルを選ぶなら、[GPU の VRAM に収まる AI モデル](/ja/which-ai-models-fit-your-gpu-vram/)をご覧ください。

## ツールを選ぶ：TRL、Unsloth、Axolotl

3 つともオープンソースで、どれも LoRA と QLoRA に対応しています。

| ツール | 使い方 | 強み | 注意点 |
| --- | --- | --- | --- |
| Hugging Face TRL + PEFT | Python（`SFTTrainer`） | 基準となる実装。同じ API で DPO や GRPO なども使える | 同じ学習でも Unsloth よりメモリを多く使う |
| Unsloth | Python、または Unsloth Studio の Web UI | 2 倍速く VRAM を 70% 削減とうたう。GGUF に直接エクスポートできる | Studio UI は AGPL-3.0（コアは Apache 2.0） |
| Axolotl | YAML ファイル 1 つ、`axolotl train config.yml` | マルチ GPU（FSDP、DeepSpeed）、豊富なレシピ | Python 3.11 以上と PyTorch 2.11 以上が必要 |

2026 年 9 月時点で TRL はバージョン 1.14、PEFT は 0.21 です。Unsloth には Python 3.11〜3.13 と、CUDA Compute Capability 7.0 以上の NVIDIA GPU（V100、T4、RTX 20 シリーズ以降）が必要です。Axolotl は Python 3.12 と PyTorch 2.12.1 を推奨しています。

すべての行を理解したいなら TRL、VRAM が足りないか GGUF へのエクスポートを 1 回の呼び出しで済ませたいなら Unsloth、設定を変えて何度も学習したり複数の GPU に移ったりするなら Axolotl です。以下のスクリプトでは TRL を使います。すべての要素が見える最短の方法だからです。

## データを準備する

TRL の `SFTTrainer` は、チャット API のリクエストと同じ形の会話を読み込みます。`train.jsonl` に 1 行 1 つの JSON オブジェクトを書きます。

```json
{"messages": [{"role": "system", "content": "Extract the invoice fields as JSON."}, {"role": "user", "content": "Invoice 4471 from Norden AB, due 12 March, total 1,250 EUR"}, {"role": "assistant", "content": "{\"invoice_id\": \"4471\", \"supplier\": \"Norden AB\", \"due\": \"2026-03-12\", \"total\": 1250, \"currency\": \"EUR\"}"}]}
```

実際的なルールです。

- **量より質。** 一貫していて正しい例が数百〜数千件あれば、ノイズの多い数万件に勝ります。データの間違いは、お金を払って教え込む振る舞いになります。
- **本番に合わせる。** アプリケーションが実際に送るシステムプロンプトと入力形式を使ってください。
- **5〜10% を取り分けておく。** モデルに一度も学習させない例を残し、ベースモデルと調整後のモデルを並べて比べるのに使います。
- **不要なものは取り除く。** 名前、メールアドレス、口座番号、ID が形式の学習に役立つことはまずありません。データが自分のコンピューターを出る前に、それらしいプレースホルダーに置き換えます。

最後のルールは、レンタルするマシンだけの話ではありません。Carlini らは GPT-2 から、名前、電話番号、メールアドレスを含む数百の学習データを原文のまま抽出しました。中には学習データの 1 文書にしか出てこないものもありました。ファインチューニングしたモデルは、学習した内容を後でそれを使う誰にでも繰り返すことがあります。

## レンタルしたマシンでデータを非公開に保つ

GPU マーケットプレイスでは、コンピューターの所有者は他人です。Vast.ai ははっきりこう書いています。「クライアントは非特権の Docker コンテナで隔離され、自分のデータにしかアクセスできません」、そして「プロバイダーのセキュリティには大きなばらつきがあります」。この隔離はほかの借り手からあなたを守ります。物理的にアクセスでき、ホストの root 権限を持つ人からは守りません。

非公開のデータを扱うなら、次のようにします。

1. **審査済みのデータセンターのホストを選ぶ。** Vast.ai の Secure Cloud のプロバイダーは「ISO 27001 認証を持ち、Tier 3/4 のデータセンター基準を満たす、審査済みのデータセンター」で、Vast は機密性の高い作業にはこちらを勧めています。RunPod の Secure Cloud は T3/T4 のデータセンターで動いており、Community Cloud は個人のプロバイダーにつながります。データセンターの区分は 1 時間あたりの料金が高くなりますが、ここでは払う価値があります。
2. **アップロードするのはクリーニング済みのデータセットだけにし、** SSH（`rsync -avP` または `scp`）で送ります。途中で公開バケットや共有リンクに置かないでください。
3. **ログは手元にとどめる。** TRL 1.14 では `report_to` のデフォルトが `"none"` なので、自分で有効にしない限り実験管理ツールには何も送られません。非公開データで学習したアダプターで `push_to_hub` を呼ばないでください。
4. **結果を取り出してから、インスタンスを削除する。** アダプターと評価結果をダウンロードし、トークンを使ったなら Hugging Face からログアウトし（`hf auth logout`）、インスタンスとボリュームを削除します。Vast.ai では、ストレージは停止ではなく削除するまで課金され、保持され続けます。

コンテナ内でファイルを消しても、ホストのディスクが消去される保証はありません。本当の防御はステップ 1 と 2 です。誰がハードウェアを持つかを選び、その相手に送るものを最小限にすることです。詳しくは[公開 GPU ノードでデータセットを守る方法](/ja/how-to-secure-dataset-on-public-gpu-node/)をご覧ください。[社内のポリシーが第三者のハードウェアを一切認めない](/ja/why-corporate-policies-banning-chatgpt/)なら、同じスクリプトを自前の 24 GB のカードで実行できます。

## 学習する：TRL による QLoRA スクリプト

RTX 3090 か 4090 を載せたレンタルの Linux マシンで次を実行します。

```bash
python -m venv venv && source venv/bin/activate
pip install torch trl peft bitsandbytes datasets
```

続いて `train.py` です。TRL の PEFT ドキュメントにある QLoRA のパターンに沿っています。Qwen3-8B は Apache 2.0 でアクセス制限がないので、Hugging Face のトークンは不要です。

```python
import torch
from datasets import load_dataset
from peft import LoraConfig
from transformers import BitsAndBytesConfig
from trl import SFTConfig, SFTTrainer

dataset = load_dataset("json", data_files="train.jsonl", split="train")

bnb_config = BitsAndBytesConfig(
    load_in_4bit=True,
    bnb_4bit_quant_type="nf4",
    bnb_4bit_compute_dtype=torch.bfloat16,
    bnb_4bit_use_double_quant=True,
)

peft_config = LoraConfig(
    r=16,
    lora_alpha=32,
    lora_dropout=0.05,
    target_modules="all-linear",
    task_type="CAUSAL_LM",
)

args = SFTConfig(
    output_dir="out",
    num_train_epochs=3,
    per_device_train_batch_size=4,
    gradient_accumulation_steps=4,
    learning_rate=2e-4,
    lr_scheduler_type="cosine",
    warmup_steps=20,
    max_length=2048,
    bf16=True,
    logging_steps=10,
    save_strategy="epoch",
    model_init_kwargs={"dtype": torch.bfloat16},
)

trainer = SFTTrainer(
    model="Qwen/Qwen3-8B",
    args=args,
    train_dataset=dataset,
    quantization_config=bnb_config,
    peft_config=peft_config,
)
trainer.train()
trainer.save_model("out/adapter")
```

重要な設定は次のとおりです。

- **`learning_rate=2e-4`。** TRL のドキュメントは、QLoRA では通常のファインチューニングの約 10 倍の学習率を勧めています。学習損失が下がるのに評価損失が上がるなら過学習です。エポック数を減らしてください。
- **`r=16`、`target_modules="all-linear"`。** すべての線形層にアダプターを付けます。Unsloth のベンチマークと同じ構成です。形式や文体ならランク 16 で十分で、難しいタスクでは上げます。
- **`max_length=2048`。** これより長い例は切り捨てられます。データのトークン長を確認してください。上限を長くするとそのぶん VRAM が必要です。
- **実効バッチサイズ 16**（4 × 勾配累積 4 ステップ）。メモリが足りなければ、`per_device_train_batch_size` を下げ、その分だけ累積ステップを上げて積を保ちます。

マシンを止める前に、取り分けておいた例をベースモデルと調整後のモデルの両方に通して比べてください。お金をかけた意味があったかどうかがわかるのは、このテストだけです。

## 費用

学習時間は、総トークン数 ÷ スループットです。ホスティング会社の GigaGPU は、RTX 4090 での Llama 3.1 8B の QLoRA 学習で毎秒約 3,500 トークンという実測値を公開しています。Qwen3-8B でも同程度と仮定すると、次のようになります。

**小規模な学習：** 2,000 件 × 600 トークン × 3 エポック = 360 万トークン。3,600,000 ÷ 3,500 = 1,029 秒、約 17 分です。

| 作業 | 時間 |
| --- | --- |
| 環境のセットアップ | 10 分 |
| Qwen3-8B（重み 16.4 GB）のダウンロードとデータのアップロード | 10 分 |
| 学習 | 17 分 |
| 取り分けたデータでベースモデルと調整後モデルを比較 | 15 分 |
| 統合、エクスポート、ダウンロード、インスタンスの削除 | 15 分 |
| **合計** | **67 分（1.12 時間）** |

- Vast.ai の RTX 4090（$0.31/時）：1.12 × $0.31 = **$0.35**
- RunPod の RTX 4090（料金ページの定価 $0.74/時）：1.12 × $0.74 = **$0.83**

**大規模な学習：** 20,000 件 × 1,000 トークン × 2 エポック = 4,000 万トークン ÷ 3,500 = 11,429 秒、約 3.2 時間です。同じような付帯作業に 50 分かかるとして合計 4.0 時間、Vast.ai で **$1.24**、RunPod で **$2.97** です。

32B のモデルなら、2026 年 9 月時点で RunPod の 48 GB のカードは $0.49/時（A40）、$0.53/時（RTX A6000）、$1.09/時（L40S）です。これらのカードでの 32B の QLoRA のスループットは公開された数字が見当たらないので、50 ステップだけ実行してログから 1 ステップの時間を読み取り、長い学習を始める前に同じ掛け算をしてください。

料金は、RunPod の料金ページと、Vast.ai については getdeploying.com のトラッカーから取った 2026 年 9 月の数字です。Secure やデータセンターの区分は、コミュニティの最安の提示価格より高くなります。全体像は [GPU レンタル料金比較](/ja/gpu-rental-pricing-comparison-2026/)にまとめています。

## 学習結果を提供する

方法は 2 つあります。アダプターを別に持つか、モデルに統合するかです。

**vLLM でアダプターを別に持つ。** vLLM はベースモデルと一緒に LoRA アダプターを読み込み、OpenAI 互換サーバー上でそれぞれを 1 つのモデル名として公開します。

```bash
vllm serve Qwen/Qwen3-8B --enable-lora --lora-modules invoices=./out/adapter
```

クライアントは `"model": "invoices"` を送ります。複数のアダプターが、1 枚の GPU 上の 1 つのベースモデルを共有できます。

**統合して Ollama で動かす。** アダプターをフル精度の重みに統合し、llama.cpp で GGUF に変換して量子化し、インポートします。

```python
import torch
from peft import AutoPeftModelForCausalLM
from transformers import AutoTokenizer

model = AutoPeftModelForCausalLM.from_pretrained("out/adapter", dtype=torch.bfloat16)
model.merge_and_unload().save_pretrained("merged")
AutoTokenizer.from_pretrained("Qwen/Qwen3-8B").save_pretrained("merged")
```

```bash
python llama.cpp/convert_hf_to_gguf.py merged --outfile invoices-bf16.gguf --outtype bf16
./llama.cpp/build/bin/llama-quantize invoices-bf16.gguf invoices-Q4_K_M.gguf Q4_K_M
echo "FROM ./invoices-Q4_K_M.gguf" > Modelfile
ollama create invoices -f Modelfile
```

Unsloth なら統合と GGUF へのエクスポートが 1 回の呼び出しで済みます（`model.save_pretrained_gguf("dir", tokenizer, quantization_method="q4_k_m")`）。ドキュメントには、エクスポート後に回答がおかしくなる一番多い原因はチャットテンプレートの間違いだという注意があります。学習に使ったテンプレートで提供してください。Ollama、vLLM、TGI の使い分けは [RTX 4090 での推論ベンチマーク](/ja/ollama-vs-vllm-vs-tgi-rtx-4090-benchmark/)で扱っています。

### GPUFlow の出番

GPUFlow では学習はできません。貸し出すのはプロバイダーの GPU 上の OpenAI 互換 API で、シェルも SSH もファイルへのアクセスもありません。ファインチューニングしたモデルを提供することもできません。借り手はモデルをアップロードできず、使えるのは各プロバイダーが（たいていは Ollama で）インストールしたモデル、たとえば `qwen2.5:7b` や `llama3.1:8b` です。

役に立つのは、これらすべての前の段階です。既存のオープンモデルに良いプロンプトを与えるだけで用が足りるかを、数セントで確かめられます。判断フローの中で一番安い結末です。その確認にはテスト用のデータを使い、このガイドで扱っている非公開のデータは使わないでください。レンタル中、プロンプトと回答はプロバイダーのマシンを平文で通ります。使い方は [API クイックスタート](https://docs.gpuflow.app/ja/renters/api-quickstart/)に、既存のツールとの接続は[アプリでキーを使う方法](/ja/use-openai-compatible-api-key-in-apps/)にあります。

## 出典

すべて 2026 年 9 月に確認しました。

- 論文：[Hu et al., LoRA](https://arxiv.org/abs/2106.09685)、[Dettmers et al., QLoRA](https://arxiv.org/abs/2305.14314)、[Ovadia et al., Fine-Tuning or Retrieval?](https://arxiv.org/abs/2312.05934)、[Carlini et al., Extracting Training Data from Large Language Models](https://arxiv.org/abs/2012.07805)
- Hugging Face TRL：[SFT Trainer](https://huggingface.co/docs/trl/sft_trainer)、[PEFT との統合と QLoRA](https://huggingface.co/docs/trl/peft_integration)
- Unsloth：[要件と VRAM の表](https://unsloth.ai/docs/get-started/fine-tuning-for-beginners/unsloth-requirements.md)、[ベンチマーク](https://unsloth.ai/docs/basics/unsloth-benchmarks.md)、[GGUF への保存](https://unsloth.ai/docs/basics/inference-and-deployment/saving-to-gguf.md)、[GitHub](https://github.com/unslothai/unsloth)
- [GitHub の Axolotl](https://github.com/axolotl-ai-cloud/axolotl)
- モデル：[Qwen3-8B のモデルカード](https://huggingface.co/Qwen/Qwen3-8B)
- 学習スループット：[GigaGPU、RTX 4090 でのファインチューニング](https://gigagpu.com/rtx-4090-fine-tuning-guide/)
- ホストとセキュリティ：[Vast.ai のセキュリティ FAQ](https://docs.vast.ai/documentation/reference/faq/security)、[Vast.ai の料金](https://docs.vast.ai/guides/instances/pricing.md)、[RunPod の Pod の概要](https://docs.runpod.io/pods/overview)
- 料金：[RunPod の料金](https://www.runpod.io/pricing)、getdeploying.com（[Vast.ai](https://getdeploying.com/vast-ai)、[RTX 4090](https://getdeploying.com/reference/cloud-gpu/nvidia-rtx-4090)）
- 提供：[vLLM の LoRA アダプター](https://docs.vllm.ai/en/latest/features/lora.html)、[llama.cpp の quantize](https://github.com/ggml-org/llama.cpp/blob/master/tools/quantize/README.md)、[Ollama へのインポート](https://docs.ollama.com/import)
- GPUFlow：[API クイックスタート](https://docs.gpuflow.app/ja/renters/api-quickstart/)
