---
title: "RTX 4090 で Ollama、vLLM、TGI を比較：ベンチマークからわかること"
description: "RTX 4090 で 8B モデルを動かす Ollama、vLLM、Hugging Face TGI の比較。公開されている負荷時のスループット、VRAM、量子化、OpenAI 互換 API、TGI のメンテナンス状況を出典付きでまとめます。"
excerpt: "リクエストが 1 つずつなら、RTX 4090 ではどのエンジンもほぼ同じ速さです。多数のユーザーが同時にアクセスすると、vLLM が大きく引き離します。TGI は現在メンテナンスモードです。公開された数値、出典、選び方をまとめました。"
pubDate: 2026-02-25
updatedDate: 2026-09-30
locale: "ja"
category: "benchmarks"
featured: false
draft: false
author: "GPUFlow Team"
heroImage: "../_images/rtx4090-inference-benchmark-hero.png"
heroImageAlt: "性能指標とともにターミナルに表示された RTX 4090 の GPU 推論ベンチマーク"
faq:
  - question: "RTX 4090 では vLLM のほうが Ollama より速いですか？"
    answer: "多数のリクエストが同時に来る場合に限ります。2026 年 9 月に ComputingForGeeks が 4 ビットの Qwen2.5-7B で行ったテストでは、RTX 4090 で単一リクエストの場合、どちらも毎秒約 174 トークンを生成しました。同時に 64 リクエストでは、合計で vLLM が毎秒 6,623 トークン、Ollama が 2,018 トークンでした。"
  - question: "Hugging Face TGI はまだメンテナンスされていますか？"
    answer: "最小限です。TGI のドキュメントによると、TGI はメンテナンスモードで、軽微なバグ修正とドキュメントの変更しか受け付けていません。GitHub リポジトリは 2026 年 3 月 21 日に読み取り専用としてアーカイブされました。Hugging Face は代わりに vLLM か SGLang、ローカル用途なら llama.cpp と MLX を勧めています。"
  - question: "vLLM は 8B モデルでどれくらい VRAM を使いますか？"
    answer: "vLLM はデフォルトで、モデルのサイズにかかわらず GPU メモリの 90%（gpu-memory-utilization 0.9）を確保します。24 GB の RTX 4090 なら約 21.6 GB です。重みが使わない分は、同時リクエスト用の KV キャッシュになります。"
  - question: "Ollama で複数のユーザーに同時に応答できますか？"
    answer: "できますが、デフォルトではモデルごとに 1 度に 1 リクエストです（OLLAMA_NUM_PARALLEL=1）。この値は上げられ、並列スロットごとにコンテキスト用のメモリが追加で必要になります。公開されたベンチマークでは、同時実行数が多い状況で Ollama は vLLM ほどスケールしていません。"
  - question: "Ollama、vLLM、TGI には OpenAI 互換 API がありますか？"
    answer: "あります。3 つとも /v1/chat/completions を提供しています。Ollama と vLLM は completions、embeddings、Responses API も提供しており、TGI の OpenAI 互換の Messages API はバージョン 1.4.0 からあります。"
  - question: "24 GB の GPU で Llama 3.1 8B を FP16 で動かせますか？"
    answer: "動かせます。80.3 億パラメータ × 2 バイトで重みは約 16.1 GB になり、24 GB に収まって、KV キャッシュにもある程度の余裕が残ります。コンシューマー向けのカード 1 枚で提供する人の多くは、コンテキストと同時ユーザーに余裕を持たせるため、4 ビットか 8 ビットの重みを使っています。"
---

RTX 4090 1 枚で 7B〜8B のモデルを提供する場合、リクエストが 1 つずつなら Ollama と vLLM はほぼ同じ速さです。差が開くのは多数のリクエストが同時に来たときで、2026 年 9 月に公開された同時 64 リクエストのテストでは、vLLM の合計スループットは Ollama の約 3 倍でした。Hugging Face TGI は今も動きますが、2026 年 3 月にリポジトリがアーカイブされてからメンテナンスモードになっており、Hugging Face 自身も今は vLLM と SGLang を勧めています。

つまり選択は、同時に何人がモデルにアクセスするかで決まります。ユーザーが 1 人、スクリプト、小さな社内ツールなら、いちばん手間のかからない Ollama です。公開 API や、多数のリクエストを並行して流すバッチジョブなら vLLM です。TGI での新規デプロイは、私なら始めません。

## 数値の出どころ

このページの以前の版では、スループット、レイテンシ、VRAM の数値を自分たちの RTX 4090 での測定結果として載せていました。再現できる実行記録にも公開された出典にもたどれなかったため、削除しました。疑わしかった理由の 1 つは、以前の FP16 の単一ストリームの数値が、RTX 4090 のメモリ帯域幅で出せる上限を超えていたことです（次の節を参照）。

以下の数値はすべて、公開した人を明記し、使ったハードウェアとモデルも示しています。RTX 4090 できちんとした比較を公開している人がいない場合（たとえば TGI）は、穴を埋めずにそう書いています。

主な出典は次のとおりです。

- **ComputingForGeeks、2026 年 9 月 18 日。** RTX 4090、L40S、RTX 5090 での Ollama、vLLM、llama.cpp。モデルは Qwen2.5-7B-Instruct で、vLLM は AWQ の 4 ビット、Ollama と llama.cpp は GGUF の Q4_K_M。プロンプトは 512 トークン固定、temperature 0、出力は最大 256 トークン、スロットごとのコンテキストは 4,096 トークン、並列スロットは 64。
- **Red Hat Developer、2025 年 8 月 8 日。** A100 40 GB 1 枚での Ollama 0.9.2 と vLLM 0.9.1。FP16 の Llama 3.1 8B Instruct、同時ユーザー 1〜256、GuideLLM で測定。
- **BentoML、2024 年 6 月 5 日。** A100 80 GB での vLLM 0.4.2、TGI 2.0.4 など。モデルは Llama 3 8B Instruct。
- **llama.cpp の CUDA スコアボード。** RTX 4090 を含む多数のカードでの、Llama 2 7B Q4_0 の単一ストリームの速度。

RTX 4090 で、TGI を除くこの記事のすべてのエンジンを動かしたのは 1 つ目だけです。ほかの出典は、データセンター向けのカードで同じ傾向を示しています。

## リクエスト 1 つ：上限を決めるのはカード

GPU が単一のリクエストのためにトークンを生成するとき、トークンごとにモデルのすべての重みをメモリから読み出す必要があります。そのため、上限を決めるのはエンジンではなくメモリ帯域幅です。

RTX 4090 は 1,008 GB/s の GDDR6X を 24 GB 搭載しています。Llama 3.1 8B のパラメータ数は 80.3 億です。

- FP16 では、重みは 8.03 × 2 バイト ≈ 16.1 GB です。1,008 ÷ 16.1 ≈ 1 リクエストあたり最大で **毎秒 63 トークン** です。
- Ollama のデフォルトの `llama3.1:8b` タグは Q4_K_M で、ダウンロードサイズは 4.9 GB です。1,008 ÷ 4.9 ≈ 最大で **毎秒 205 トークン** です。

実際のエンジンはこの上限を下回ります。llama.cpp のスコアボードでは、RTX 4090 が Q4_0 の Llama 2 7B で毎秒 186 トークン（flash attention 有効で 189）を生成しています。ComputingForGeeks は、4 ビットの Qwen2.5-7B で単一リクエストの場合に毎秒約 174 トークンを測定し、4090 では vLLM、llama.cpp、Ollama が「ほぼ」同じだったとしています。（L40S と RTX 5090 では、彼らの Ollama のビルドのデコード速度は llama.cpp の約半分だったので、自分のカードとバージョンで確認してください。）

ユーザーが 1 度に 1 人なら、エンジンは使いやすさで選び、速度は量子化で選んでください。FP16 から 4 ビットにすると上限はおよそ 3 倍になります。エンジンを変えても、ほとんど動きません。

## 多数のリクエスト：決め手はバッチ処理

多数のリクエストを並行して処理するとき、GPU は重みを 1 回読み出して、まとまったリクエストすべてに使えます。ここで効いてくるのは、エンジンのバッチ処理のうまさと、KV キャッシュ（リクエストごとの、それまでの会話のメモリ）の管理方法です。

<figure>
<svg viewBox="0 0 720 310" role="img" aria-labelledby="d1-title" xmlns="http://www.w3.org/2000/svg" font-family="system-ui, sans-serif" font-size="15">
<title id="d1-title">RTX 4090 で同時 64 リクエストのときの合計スループットの棒グラフ：vLLM 6,623、llama.cpp 2,391、Ollama 2,018 トークン/秒</title>
<text x="160" y="63" text-anchor="end" fill="#1e1b4b">vLLM (AWQ)</text>
<rect x="170" y="40" width="454" height="36" fill="#6366f1"/>
<text x="632" y="63" fill="#1e1b4b">6,623</text>
<text x="160" y="123" text-anchor="end" fill="#1e1b4b">llama.cpp</text>
<rect x="170" y="100" width="164" height="36" fill="#a5b4fc"/>
<text x="342" y="123" fill="#1e1b4b">2,391</text>
<text x="160" y="183" text-anchor="end" fill="#1e1b4b">Ollama</text>
<rect x="170" y="160" width="138" height="36" fill="#a5b4fc"/>
<text x="316" y="183" fill="#1e1b4b">2,018</text>
<line x1="170" y1="210" x2="650" y2="210" stroke="#64748b" stroke-width="1.5"/>
<line x1="170" y1="30" x2="170" y2="210" stroke="#64748b" stroke-width="1.5"/>
<line x1="307" y1="210" x2="307" y2="216" stroke="#64748b" stroke-width="1.5"/>
<line x1="444" y1="210" x2="444" y2="216" stroke="#64748b" stroke-width="1.5"/>
<line x1="581" y1="210" x2="581" y2="216" stroke="#64748b" stroke-width="1.5"/>
<text x="170" y="232" text-anchor="middle" fill="#64748b" font-size="13">0</text>
<text x="307" y="232" text-anchor="middle" fill="#64748b" font-size="13">2,000</text>
<text x="444" y="232" text-anchor="middle" fill="#64748b" font-size="13">4,000</text>
<text x="581" y="232" text-anchor="middle" fill="#64748b" font-size="13">6,000</text>
<text x="410" y="256" text-anchor="middle" fill="#64748b" font-size="13">毎秒の合計出力トークン数（同時 64 リクエスト）</text>
<text x="360" y="290" text-anchor="middle" fill="#1e1b4b" font-size="14">リクエストが 1 つずつなら、3 つとも毎秒約 174 トークン</text>
</svg>
<figcaption>RTX 4090、4 ビットの Qwen2.5-7B-Instruct（vLLM は AWQ、ほかは GGUF Q4_K_M）、同時 64 リクエスト。数値は ComputingForGeeks（2026 年 9 月）によるもので、棒は実寸で描いています。TGI はこのテストの対象外です。</figcaption>
</figure>

RTX 4090 で、64 リクエスト全体の合計は vLLM が毎秒 6,623 トークン、llama.cpp のサーバーが 2,391、Ollama が 2,018 でした。Ollama の設定も公平で、`OLLAMA_NUM_PARALLEL=64`、`num_ctx 4096`、flash attention 有効です。vLLM は `--quantization awq_marlin --max-model-len 4096 --gpu-memory-utilization 0.90` で動かしています。著者らは最初のトークンまでの時間も報告しており、llama.cpp が約 8〜12 ms、vLLM が 16〜25 ms で、L40S と RTX 5090 では Ollama が最も長くなっていました。

Red Hat の A100 でのテストも、FP16 の重みで同じ傾向を示しています。vLLM のピークは毎秒 793 トークン、デフォルト設定の Ollama は 41 でした。Ollama の並列数の上限を「安定して動く最大値」の 32 に上げても、どの同時実行数でも vLLM には届きませんでした。最初のトークンまでの時間は「ユーザーが増えると急激に伸び」、トークン間のレイテンシはピーク負荷で「大きなスパイク」を示しました。

これらの数値を誰かに示す前に、注意点が 2 つあります。1 つ目に、ComputingForGeeks の比較は完全に同条件ではありません。vLLM は AWQ の重み、ほかは GGUF で、ビルドも違います。2 つ目に、これはすべてのリクエストの合計です。64 人のユーザーそれぞれから見ると、vLLM では約 6,623 ÷ 64 ≈ 毎秒 103 トークンで、十分実用的です。Ollama では約 2,018 ÷ 64 ≈ 32 です。

## TGI の現状

Text Generation Inference は Hugging Face の本番用サーバーで、continuous batching、Flash Attention と Paged Attention、テンソル並列、Prometheus のメトリクス、OpenTelemetry のトレースを備えていました。技術的には vLLM と同じ部類でした。

その位置づけは変わりました。TGI のドキュメントは現在、次の一文から始まります。「text-generation-inference は現在メンテナンスモードです。今後は、軽微なバグ修正、ドキュメントの改善、軽いメンテナンス作業のプルリクエストのみを受け付けます」。そして「vllm、SGLang、および llama.cpp や MLX のような相互互換性のあるローカルエンジン」を勧めています。GitHub リポジトリは 2026 年 3 月 21 日にアーカイブされ、読み取り専用になりました。

RTX 4090 での TGI の最近のベンチマークは、公開されたものを見つけられませんでした。信頼できる比較でいちばん近いのは、2024 年 6 月の BentoML による A100 80 GB でのものです。Llama 3 8B で、vLLM は「TGI と同様の毎秒 2300〜2500 トークン」に達し、最初のトークンまでの時間は、テストしたすべての同時実行数で vLLM が最も短くなりました。どちらのエンジンにとっても 2 年前、何リリースも前の話なので、過去の記録として扱ってください。

すでに TGI で本番のトラフィックを処理しているなら、今後も動き続けます。新規デプロイの場合は、新しいモデルアーキテクチャへの対応も性能改善も入らないサーバーを選ぶことになります。RTX 4090 1 枚なら、TGI でできたことはすべて vLLM でカバーできます。

## 24 GB のカードでの VRAM

エンジンによってメモリの扱い方は大きく違い、カードを他の用途と共有できるかどうかに影響します。

**vLLM は最初にカードの大部分を確保します。** `--gpu-memory-utilization` のデフォルトは 0.9 なので、24 GB の RTX 4090 では、モデルのサイズにかかわらず起動時に約 21.6 GB を確保します。重みが使わない分はすべて KV キャッシュになります。FP16 の Llama 3.1 8B（約 16.1 GB）では、KV キャッシュ、アクティベーション、CUDA グラフに残るのはおよそ 5.5 GB で、コンテキスト長と同時に処理できるリクエスト数が制限されます。4 ビットの AWQ の重み（ComputingForGeeks のビルドで約 5.6 GB）なら、21.6 GB の大半が KV キャッシュに回り、それで 64 リクエストを同時に処理できています。この割合を下げない限り、横で別の GPU プログラムを動かせるとは思わないでください。

**Ollama はモデルごと、コンテキストごとにメモリを割り当てます。** Q4_K_M の `llama3.1:8b` モデルは 4.9 GB で、これにコンテキストウィンドウ分の KV キャッシュが加わります。Ollama はデフォルトのコンテキストを VRAM から決めます。24 GiB 未満なら 4k、24〜48 GiB なら 32k、48 GiB 以上なら 256k です。RTX 4090 はちょうど 24 GiB の境目にある（nvidia-smi では 24 GiB をわずかに下回って表示される）ので、`ollama ps` で実際にどのコンテキストになったかを確認するか、自分で設定してください。並列スロットはこれを倍増させます。ドキュメントの例では「2K のコンテキストで 4 つの並列リクエストなら、8K のコンテキストと追加のメモリ割り当てになる」とあります。メモリが厳しい場合は、KV キャッシュの量子化が効きます。`q8_0` はデフォルトの `f16` の約半分、`q4_0` は約 4 分の 1 のメモリで済みます。Ollama はデフォルトで、収まるなら GPU 1 枚あたり最大 3 つのモデルを読み込んだままにできるので、モデルを切り替えて使うカードに向いています。そもそも 8、12、16、24 GB のカードにどのモデルが収まるかは、[GPU の VRAM に収まる AI モデル](/ja/which-ai-models-fit-your-gpu-vram/)をご覧ください。

**TGI** も vLLM と同じく、continuous batching のためにメモリを事前に確保します。4090 での 8B モデルの VRAM について、最新で引用できる数値は見つからなかったので、ここでは示しません。

## 量子化とモデル形式

| | Ollama | vLLM | TGI |
| --- | --- | --- | --- |
| **主な形式** | GGUF（例：Q4_K_M） | Hugging Face の safetensors | Hugging Face の safetensors |
| **4 ビットの選択肢** | GGUF の Q4 系 | AWQ、GPTQ、bitsandbytes、INT4 W4A16 | AWQ、GPTQ、Marlin、EXL2、bitsandbytes NF4/FP4 |
| **8 ビット / FP8** | GGUF Q8_0 | Ada（RTX 4090）と Hopper で FP8 W8A8、INT8 | bitsandbytes 8 ビット、EETQ、fp8 |
| **GGUF** | ネイティブ | 対応 | 記載なし |
| **KV キャッシュの量子化** | q8_0、q4_0 | あり | ここでは扱わない |

RTX 4090 は Ada 世代のカード（SM 8.9）なので、vLLM の FP8 の経路が使えます。FP8 の重みは FP16 の半分のメモリで済み、8B モデルなら約 8 GB です。4090 1 枚では、FP16 と 4 ビットの中間の選択肢になります。

Ollama のモデルライブラリは量子化済みの GGUF タグを配布しているので、量子化を意識することはほとんどありません。`ollama pull llama3.1:8b` で Q4_K_M が手に入ります。vLLM では、Hugging Face から量子化済みのチェックポイントを選ぶか、自分で量子化のフラグを渡します。

## OpenAI 互換サーバーとセットアップ

3 つとも OpenAI 形式の HTTP API を提供しているので、OpenAI の SDK やたいていのチャットツールは、ベース URL を変えるだけで使えます。

| | Ollama | vLLM | TGI |
| --- | --- | --- | --- |
| **デフォルトのアドレス** | `localhost:11434/v1` | `localhost:8000/v1` | コンテナのポート 80（8080 にマッピングすることが多い） |
| **Chat completions** | あり | あり | あり（Messages API、1.4.0 から） |
| **その他の OpenAI エンドポイント** | completions、models、embeddings、responses | completions、embeddings、responses、audio | ここでは扱わない |
| **インストール** | スクリプト 1 つ | pip パッケージ | Docker イメージ |

各プロジェクトのドキュメントに従って 8B モデルを動かす手順です。

```bash
# Ollama
curl -fsSL https://ollama.com/install.sh | sh
ollama pull llama3.1:8b

# vLLM (Llama 3.1 is gated: accept the license on Hugging Face and set HF_TOKEN)
pip install vllm
vllm serve meta-llama/Llama-3.1-8B-Instruct

# TGI
docker run --gpus all --shm-size 1g -p 8080:80 -v $PWD/data:/data \
  ghcr.io/huggingface/text-generation-inference:3.3.5 \
  --model-id meta-llama/Llama-3.1-8B-Instruct
```

手間の少なさでは Ollama が圧倒的です。ダウンロード、量子化済みファイル、モデルの読み込みと解放を面倒見てくれて、ノート PC でも借りたサーバーでも同じように動きます。ただし Ollama の OpenAI 互換レイヤーには欠けている部分があります。chat completions で `logprobs` と `tool_choice` が使えず、画像は URL ではなく base64 で渡す必要があります。vLLM には動作する CUDA と Python の環境が必要で、調整するフラグも多いですが、Hugging Face が今 TGI の代わりに勧めているエンジンです。TGI は、すでに Docker を使っているなら簡単ですが、上で述べたメンテナンスの問題があります。

## どのジョブにどのエンジンか

**Ollama** は、1 人で使う場合、スクリプト、コーディングアシスタント、数人が使う社内ツール、複数のモデルを切り替えて使うマシン向けです。セットアップは数分で済み、4090 での単一リクエストの速度はどのエンジンにも引けを取りません。

**vLLM** は、多数のリクエストが同時に来る場合向けです。公開 API、複数ユーザーのチャット製品、32 件や 64 件を同時に流せるバッチジョブなどです。公開された数値では、RTX 4090 で同時 64 リクエストのとき合計スループットが Ollama の約 3 倍、A100 ではそれよりはるかに大きな差があります。量子化と API の対応範囲もいちばん広いです。

**TGI** は、すでに使っている場合だけです。新しい作業には、Hugging Face 自身が vLLM か SGLang を勧めています。

時間単位で借りる場合、コストはスループットで決まります。getdeploying.com が 2026 年 9 月に掲載していた Vast.ai のオンデマンドの最安値、1 時間 $0.31 の RTX 4090 で 100 万出力トークンを生成する場合を、ComputingForGeeks の数値で計算します。

- リクエストを 1 つずつ、毎秒 174 トークン：1,000,000 ÷ 174 ≈ 5,750 秒 ≈ 1.6 時間 ≈ **$0.50**。
- Ollama で同時 64、毎秒 2,018 トークン：≈ 496 秒 ≈ **$0.04**。
- vLLM で同時 64、毎秒 6,623 トークン：≈ 151 秒 ≈ **$0.01**。

これは GPU がずっと稼働している前提です。処理中のリクエストが常に 1 つだけなら、バッチ処理の恩恵はなく、エンジンを選んでも請求額は変わりません。処理待ちの作業が溜まっているなら、請求額は桁違いに変わります。同じ考え方でトークン課金の API と比べたものは、[GPU の時間貸しか、トークン課金の API か](/ja/hourly-gpu-vs-per-token-api/)にあります。

## GPUFlow の位置づけ

GPUFlow のプロバイダー用インストーラーはデフォルトで Ollama をセットアップし、GPUFlow のエージェントがリクエストを Ollama に転送します。そのため、GPUFlow で当てはまるのはたいてい上の Ollama の列です。借りるのは、プロバイダーの GPU 上のモデル用の OpenAI 互換 API キー（`https://gpuflow.app/v1`、`/v1/chat/completions` と `/v1/models` が使え、ストリーミングにも対応）です。支払いはトークン単位ではなく時間に対してで、最低 1 分の秒単位です。

GPUFlow でできないこと：エンジンの選択、エンジンの設定変更、自分のコードの実行です。SSH もシェルもありません。上のベンチマークを再現したり、自分で vLLM を動かしたりするなら、Vast.ai か RunPod でログインできるマシンを借りてください（[両者の比較](/ja/runpod-vs-vastapi-comparison/)）。何もインストールせずに、Ollama で提供されているモデルをアプリから使うなら、[GPUFlow のマーケットプレイス](https://gpuflow.app/ja/marketplace)と[よく使われるツールでのキーの使い方](/ja/use-openai-compatible-api-key-in-apps/)をご覧ください。

自分でファインチューニングしたモデルの提供方法を検討しているなら、その前の段階は[プライベート LLM のファインチューニングガイド](/ja/private-llm-fine-tuning-guide/)で扱っています。

## 出典

すべて 2026 年 9 月に確認しました。

- RTX 4090、L40S、RTX 5090 での Ollama、vLLM、llama.cpp の比較：[ComputingForGeeks](https://computingforgeeks.com/ollama-vs-vllm-vs-llama-cpp/)（2026 年 9 月 18 日）
- A100 40 GB での Ollama と vLLM の比較：[Red Hat Developer](https://developers.redhat.com/articles/2025/08/08/ollama-vs-vllm-deep-dive-performance-benchmarking)（2025 年 8 月 8 日）
- A100 80 GB での vLLM、TGI などの比較：[BentoML「Benchmarking LLM Inference Backends」](https://www.bentoml.com/blog/benchmarking-llm-inference-backends)（2024 年 6 月 5 日）
- llama.cpp の CUDA スコアボード：[github.com/ggml-org/llama.cpp/discussions/15013](https://github.com/ggml-org/llama.cpp/discussions/15013)
- RTX 4090 のメモリと帯域幅：[TechPowerUp のレビュー](https://www.techpowerup.com/review/nvidia-geforce-rtx-4090-founders-edition/)
- Llama 3.1 8B のパラメータ数とライセンス：[Hugging Face のモデルカード](https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct)
- Ollama：[FAQ（並列リクエスト、KV キャッシュ）](https://docs.ollama.com/faq)、[コンテキスト長](https://docs.ollama.com/context-length)、[OpenAI 互換性](https://docs.ollama.com/api/openai-compatibility)、[llama3.1:8b タグ](https://ollama.com/library/llama3.1:8b)
- vLLM：[OpenAI 互換サーバー](https://docs.vllm.ai/en/latest/serving/online_serving/openai_compatible_server/)、[量子化](https://docs.vllm.ai/en/latest/features/quantization/index.html)、[エンジン引数（gpu-memory-utilization）](https://docs.vllm.ai/en/v0.6.4/models/engine_args.html)
- TGI：[ドキュメントとメンテナンスの告知](https://huggingface.co/docs/text-generation-inference/en/index)、[GitHub リポジトリ（アーカイブ済み）](https://github.com/huggingface/text-generation-inference)、[Messages API](https://huggingface.co/docs/text-generation-inference/en/messages_api)、[量子化](https://huggingface.co/docs/text-generation-inference/en/conceptual/quantization)
- RTX 4090 のレンタル料金：[getdeploying.com](https://getdeploying.com/reference/cloud-gpu/nvidia-rtx-4090)
- GPUFlow：[API クイックスタート](https://docs.gpuflow.app/ja/renters/api-quickstart/)、[プロバイダー向けのはじめに](https://docs.gpuflow.app/ja/providers/getting-started/)
