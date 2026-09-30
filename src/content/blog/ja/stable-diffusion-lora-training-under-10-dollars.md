---
title: "Stable Diffusion の LoRA をレンタル GPU で $10 以下で学習する"
description: "レンタルした RTX 4090 で SDXL や Flux の LoRA を $10 を大きく下回る費用で学習する方法。VRAM で選ぶ GPU、キャプション、sd-scripts と ai-toolkit の設定、費用の計算例をまとめます。"
excerpt: "2026 年 9 月時点で、レンタルした RTX 4090 での SDXL LoRA の学習は 1 回あたり約 $0.35〜$0.80 です。選ぶべき GPU、画像の準備とキャプション付け、実際の学習コマンド、そしてお金が実際にどこに消えるのかを説明します。"
pubDate: 2026-02-11
updatedDate: 2026-09-30
locale: "ja"
category: "tutorials"
featured: false
draft: false
author: "GPUFlow Team"
heroImage: "../_images/stable-diffusion-lora-training-guide.jpg"
heroImageAlt: "LoRA ネットワークの図を映した大きなモニターを囲む人々のイラスト。横にはサーバーラックと、2 つのエポックのサンプル画像を比べるパネルがある"
faq:
  - question: "レンタル GPU で LoRA を学習するのにいくらかかりますか？"
    answer: "2026 年 9 月時点で、RTX 4090 のレンタル料金は Vast.ai で 1 時間あたり約 $0.31、RunPod の料金ページで 1 時間あたり $0.74 でした。セットアップと確認を含めて約 65 分の SDXL LoRA の作業なら、費用はおよそ $0.34〜$0.80 です。"
  - question: "SDXL の LoRA を学習するには、どれくらいの VRAM が必要ですか？"
    answer: "sd-scripts のドキュメントによると、U-Net だけを学習し、latent とテキストエンコーダーの出力をキャッシュし、gradient checkpointing を使えば、SDXL の LoRA は GPU メモリ 8 GB で学習でき、推奨は 10 GB です。RTX 3090 や 4090 のような 24 GB のカードなら、メモリ不足と格闘せずに 1024x1024 で学習できます。"
  - question: "RTX 4090 で Flux の LoRA を学習できますか？"
    answer: "できます。ai-toolkit には 24 GB カード向けと名付けられた FLUX.1 の設定例が付属しており、sd-scripts はブロックスワップを使って 8 GB までの FLUX.1 の設定を載せています。Black Forest Labs 自身のガイドでは、RTX 4090 での 1,800 ステップの FLUX.2 [klein] LoRA の学習は 1 時間かからないとしています。"
  - question: "LoRA の学習には何枚の画像が必要ですか？"
    answer: "1 人のキャラクター、1 つの物、1 つの画風なら、15〜40 枚の良い画像がよくある範囲です。Black Forest Labs は FLUX.2 [klein] について、見た目が共通する画像を 15〜40 枚用意するよう勧めています。枚数の多さより、鮮明で、変化があり、キャプションがきちんと付いていることのほうが重要です。"
  - question: "LoRA の学習には kohya_ss、OneTrainer、ai-toolkit のどれがよいですか？"
    answer: "どれでも学習できます。kohya の sd-scripts はコマンドラインの定番で、kohya_ss はその上に Web UI を載せたものです。OneTrainer にはデスクトップ UI とキャプション生成機能があり、ai-toolkit には Web UI、公式の RunPod テンプレートがあり、FLUX.2 や Qwen-Image などの新しいモデルへの対応も早いです。"
  - question: "GPUFlow で LoRA を学習できますか？"
    answer: "できません。GPUFlow が貸し出すのはプロバイダーの GPU 上の OpenAI 互換のチャット API で、シェルも SSH もファイルへのアクセスもないため、学習スクリプトは実行できません。Vast.ai や RunPod のように、マシンそのものを貸し出すプラットフォームを使ってください。"
---

SDXL や小さめの Flux モデルの LoRA なら、レンタル GPU での学習費用は $10 を大きく下回ります。2026 年 9 月時点で、RTX 4090 は Vast.ai で 1 時間あたり約 $0.31、RunPod で $0.74 で借りられ、SDXL の LoRA 1 回分の作業は、セットアップと確認を含めても 1 時間を少し超える程度です。1 回の試行は $0.34〜$0.80 なので、$10 の予算で 10 回以上やり直せます。

難しいのはお金ではありません。画像、キャプション、そしてどこで止めるかの判断です。このガイドではそのすべてを、そのまま貼り付けられるコマンド付きで扱います。料金とツールのバージョンは 2026 年 9 月に確認したもので、出典は最後にあります。

## 5 つのステップで見る作業の流れ

<figure>
<svg viewBox="0 0 720 250" role="img" aria-labelledby="d1-title" xmlns="http://www.w3.org/2000/svg" font-family="system-ui, sans-serif" font-size="15">
<title id="d1-title">LoRA 学習の流れ：データセット、キャプション、学習、確認、利用。結果がおかしければデータセットに戻る</title>
<defs><marker id="d1-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#6366f1"/></marker></defs>
<rect width="720" height="250" fill="#ffffff"/>
<line x1="20" y1="40" x2="280" y2="40" stroke="#16a34a" stroke-width="2"/>
<text x="150" y="30" text-anchor="middle" fill="#16a34a" font-size="13">無料：自分の PC で</text>
<line x1="300" y1="40" x2="560" y2="40" stroke="#f97316" stroke-width="2"/>
<text x="430" y="30" text-anchor="middle" fill="#f97316" font-size="13">課金：レンタルした GPU で</text>
<rect x="20" y="60" width="120" height="70" rx="10" fill="#eef2ff" stroke="#6366f1" stroke-width="2"/>
<text x="80" y="90" text-anchor="middle" fill="#1e1b4b" font-weight="600">データセット</text>
<text x="80" y="112" text-anchor="middle" fill="#64748b" font-size="13">画像 15〜40 枚</text>
<rect x="160" y="60" width="120" height="70" rx="10" fill="#eef2ff" stroke="#6366f1" stroke-width="2"/>
<text x="220" y="90" text-anchor="middle" fill="#1e1b4b" font-weight="600">キャプション</text>
<text x="220" y="112" text-anchor="middle" fill="#64748b" font-size="13">画像ごとに .txt</text>
<rect x="300" y="60" width="120" height="70" rx="10" fill="#eef2ff" stroke="#6366f1" stroke-width="2"/>
<text x="360" y="90" text-anchor="middle" fill="#1e1b4b" font-weight="600">学習</text>
<text x="360" y="112" text-anchor="middle" fill="#64748b" font-size="13">sd-scripts</text>
<rect x="440" y="60" width="120" height="70" rx="10" fill="#eef2ff" stroke="#6366f1" stroke-width="2"/>
<text x="500" y="90" text-anchor="middle" fill="#1e1b4b" font-weight="600">確認</text>
<text x="500" y="112" text-anchor="middle" fill="#64748b" font-size="13">サンプル画像</text>
<rect x="580" y="60" width="120" height="70" rx="10" fill="#eef2ff" stroke="#6366f1" stroke-width="2"/>
<text x="640" y="90" text-anchor="middle" fill="#1e1b4b" font-weight="600">利用</text>
<text x="640" y="112" text-anchor="middle" fill="#64748b" font-size="13">ComfyUI, Forge</text>
<line x1="140" y1="95" x2="158" y2="95" stroke="#6366f1" stroke-width="2" marker-end="url(#d1-arrow)"/>
<line x1="280" y1="95" x2="298" y2="95" stroke="#6366f1" stroke-width="2" marker-end="url(#d1-arrow)"/>
<line x1="420" y1="95" x2="438" y2="95" stroke="#6366f1" stroke-width="2" marker-end="url(#d1-arrow)"/>
<line x1="560" y1="95" x2="578" y2="95" stroke="#6366f1" stroke-width="2" marker-end="url(#d1-arrow)"/>
<path d="M500,130 L500,180 L80,180 L80,134" fill="none" stroke="#f97316" stroke-width="2" stroke-dasharray="6 4" marker-end="url(#d1-arrow)"/>
<text x="290" y="205" text-anchor="middle" fill="#1e1b4b" font-size="13">うまくいかなければ、画像かキャプションを直して学習し直す</text>
<text x="360" y="235" text-anchor="middle" fill="#64748b" font-size="13">品質の大半は、費用のかからない最初の 2 つで決まる</text>
</svg>
<figcaption>データセットとキャプションは、GPU を借りる前に済ませておきます。GPU に課金されるのは学習と確認の間だけです。結果が悪いとき、戻るべきはたいてい設定ではなく画像です。</figcaption>
</figure>

## LoRA とは何か、なぜ安く済むのか

LoRA（Low-Rank Adaptation）は、ベースモデルを固定したまま、一部の層の横に置いた 2 つの小さな行列だけを学習します。元の論文では、GPT-3 175B のフルファインチューニングと比べて、学習するパラメーター数が 1 万分の 1、GPU メモリが 3 分の 1 になったと報告されています。画像モデルでも仕組みは同じです。SDXL のベースチェックポイントは 6.9 GB のファイルですが、学習する LoRA は別の小さなファイルで、ベースモデルの上に好きな強さで読み込んで使います。

だからコンシューマー向けの GPU 1 枚で足り、1 回の学習が数日ではなく数十分で終わります。

## VRAM で GPU を選ぶ

何を学習できるかは VRAM で決まります。課金される時間が何分になるかは速度で決まるので、時間単価の高い速いカードが、1 回あたりではほぼ同じ費用になることもあります。

| モデル系統 | ドキュメント上の最小値 | 余裕のある容量 | 備考 |
| --- | --- | --- | --- |
| SD 1.5 | 8 GB | 12 GB 以上 | 512x512 で学習。最も安く速い |
| SDXL | 8 GB（推奨 10 GB） | 24 GB | U-Net のみ、latent とテキストエンコーダー出力をキャッシュ |
| FLUX.1 [dev]（12B） | 8 GB（ブロックスワップを多用） | 24 GB | sd-scripts は 24、16、12、10、8 GB の設定を掲載 |
| FLUX.2 [klein] 4B/9B | 記載なし | 24 GB | BFL：bf16 の重みは約 13 GB、LoRA の学習は 24 GB 未満に収まる |

VRAM の少ない設定でも学習はできますが、遅くなります。sd-scripts が FLUX.1 を 8〜16 GB に収めているのは、Transformer のブロックを GPU とシステム RAM の間で入れ替えているからで、入れ替えのたびに課金対象の時間がかかります。レンタルするなら、24 GB のカード、つまり RTX 3090 か 4090 を基本にするのが妥当です。RTX 5090（32 GB）も使えますが、sd-scripts によると PyTorch 2.8.0 と CUDA 12.8 または 12.9 が必要なので、テンプレートのスタックが十分に新しいか確認してください。

![白い棚に立てた、ファンが 3 つある ASUS TUF のグラフィックカード](../_images/test-hero.jpg)

データセンター向けのカードのほうが速いのですが、RunPod では A100 80 GB が 1 時間 $1.59 で、4090 の 2 倍以上です。画像 20〜30 枚の LoRA では、速さがその差額を埋めることはまずありません。大きなデータセットやフルファインチューニングなら話は別です。

## どこで借りるか、いくらかかるか

必要なのはマシンを貸してくれるプラットフォームです。シェルか Jupyter Notebook、ディスク、そしてファイルを出し入れする手段があることが条件です。この種の作業では Vast.ai と RunPod がよく選ばれます。

| GPU | VRAM | Vast.ai（最安） | RunPod 料金ページ | RunPod 追跡上の最安値 |
| --- | --- | --- | --- | --- |
| RTX 3090 | 24 GB | 約 $0.11〜0.13/時 | $0.50/時 | $0.22/時 |
| RTX 4090 | 24 GB | 約 $0.31〜0.33/時 | $0.74/時 | $0.34/時 |
| RTX 5090 | 32 GB | 約 $0.41〜0.47/時 | $0.99/時 | $0.69/時 |

料金は 2026 年 9 月時点のものです。「Vast.ai（最安）」と「RunPod 追跡上の最安値」は getdeploying.com の価格トラッカーから、中央の列は RunPod 自身の料金ページから取っています。Vast.ai ではホストが料金を決めるので、表示される提示価格は地域や信頼性スコアによって変わります。

どちらも秒単位の課金です。違うのは追加料金で、1 時間程度の作業では、時間単価から想像するより大きく効いてきます。

- **Vast.ai** は「インスタンスが存在する間は、稼働状態にかかわらず」ストレージを課金し、帯域幅もバイト単位で、各ホストが決めた料金で課金します。帯域幅の高いホストで 7 GB のベースモデルをダウンロードすると、それなりの額になります。インスタンスは停止ではなく削除してください。
- **RunPod** は、稼働中のコンテナディスクに 1 GB あたり月 $0.10 を課金し、停止後は課金しません。停止中のボリュームディスクは 1 GB あたり月 $0.20 です。データの受信と送信には課金しません。

どちらにもすぐ使えるテンプレートがあります。ai-toolkit の作者は公式の RunPod テンプレートを管理しており、kohya_ss の README も RunPod を対応環境として挙げています。テンプレートを使えば、課金される時間に PyTorch をインストールする 10 分以上を節約できます。料金をもっと広く比べるなら、[GPUFlow・Vast.ai・RunPod・SaladCloud の比較](/ja/gpuflow-vs-vast-ai-vs-runpod/)と [GPU レンタルの隠れたコスト](/ja/hidden-fees-in-gpu-rental/)をご覧ください。

## データセットとキャプションを準備する

ここまでの作業は、何かを借りる前に自分のコンピューターで済ませます。

### 画像

- **枚数。** 1 人の人物、1 つの物、1 つの画風について 15〜40 枚。Black Forest Labs は FLUX.2 [klein] について「見た目が共通する 15〜40 枚の画像」を勧めています。増やした画像の質が低いなら、多いほど良いわけではありません。
- **一貫性と変化。** どの画像にもその概念が写っている必要があります。それ以外は変化させます。角度、照明、背景、構図です。製品の写真がすべて同じ白いテーブルの上なら、LoRA はテーブルを覚えます。
- **品質。** ピントが合っていて露出が適正で、透かしや文字の重ね書きがないこと。LoRA はノイズや JPEG のブロックも、ほかのものと同じくらい忠実に覚えます。
- **解像度。** SDXL と Flux では短辺 1024 ピクセル以上、SD 1.5 では 512 ピクセル以上です。正方形に切り抜く必要はありません。バケット機能を有効にすれば、sd-scripts が縦横比ごとに画像をまとめます。

### キャプション

画像ごとに、同じ名前のテキストファイルを用意します（`photo01.jpg` と `photo01.txt`）。キャプションは、言葉ですでに説明されている部分をモデルに伝えます。そうすることで、LoRA は言葉で説明されていない部分を覚えます。先頭に珍しいトリガーワードを置き、そのあとに変えられるようにしておきたいものをすべて書きます。

```text
zxq_mug, a ceramic coffee mug on a wooden desk, morning light from the left, shallow depth of field
```

最初の下書きは、2 つのツールが書いてくれます。

- **WD14 tagger** は sd-scripts に含まれており、カンマ区切りのタグを出力します。アニメ調のモデルや、タグで学習された SDXL のファインチューンモデルに向いています。

  ```bash
  python finetune/tag_images_by_wd14_tagger.py --onnx \
    --repo_id SmilingWolf/wd-swinv2-tagger-v3 --batch_size 4 /workspace/dataset/img
  ```

- **JoyCaption** は拡散モデルの学習用に作られたオープン（Apache 2.0）のキャプション生成モデルで、自然な文章を書きます。Flux にはタグより文章のほうが合います。README によると bf16 で約 17 GB の VRAM が必要で、小さいカード向けに 8 ビット版と 4 ビット版もあります。

OneTrainer にも BLIP、BLIP2、WD-1.4 によるキャプション生成機能があります。どれで下書きを作っても、キャプションはすべて読んで直してください。プロジェクト全体で最も価値のある 30 分です。

## 学習ツールを選ぶ

ほとんどの人は 4 つのツールのどれかで足ります。どれも無料のオープンソースです。

| ツール | インターフェース | 対応モデル（2026 年 9 月） | 向いている用途 |
| --- | --- | --- | --- |
| kohya-ss/sd-scripts | コマンドライン | SD 1.x/2.x、SDXL、SD3/3.5、FLUX.1、Lumina、HunyuanImage-2.1、Anima | 再現性のある学習、細かい制御 |
| bmaltais/kohya_ss | sd-scripts の上の Web UI | sd-scripts と同じ | フラグを覚えずに sd-scripts を使う |
| Nerogar/OneTrainer | デスクトップ UI と CLI | SD 1.5〜3.5、SDXL、FLUX.1、FLUX.2、Chroma、Qwen Image など | キャプション生成とマスクを内蔵 |
| ostris/ai-toolkit | Web UI と YAML 設定 | SD 1.5、SDXL、FLUX.1、FLUX.2、Qwen-Image、Wan（動画）など | Flux と新しいモデル、RunPod テンプレート |

sd-scripts はバージョン 0.11.1（2026 年 6 月）で、Python 3.10 でテストされており、PyTorch 2.6.0 以降が必要です。ai-toolkit は Python 3.12 を推奨し、現在は CUDA 13.0 向けにビルドされた PyTorch 2.13.0 をインストールします。OneTrainer には Python 3.10〜3.13 が必要です。

私は SDXL には sd-scripts を使います。コマンドラインがそのまま設定のすべてなので、学習を繰り返したり比べたりするのが簡単だからです。Flux には ai-toolkit を使います。

## sd-scripts で SDXL の LoRA を学習する

NVIDIA ドライバーが入った新しい Linux インスタンスなら、セットアップは数個のコマンドで終わります。

```bash
git clone https://github.com/kohya-ss/sd-scripts.git
cd sd-scripts
python -m venv venv && source venv/bin/activate
pip install torch==2.6.0 torchvision==0.21.0 --index-url https://download.pytorch.org/whl/cu124
pip install --upgrade -r requirements.txt
accelerate config default --mixed_precision bf16

# SDXL base model (not gated, CreativeML Open RAIL++-M license)
hf download stabilityai/stable-diffusion-xl-base-1.0 sd_xl_base_1.0.safetensors \
  --local-dir /workspace/models
```

画像と `.txt` キャプションのフォルダーを、`scp`、`rsync`、またはプラットフォームのファイルブラウザーで `/workspace/dataset/img` にコピーします。次に、`/workspace/dataset.toml` にデータセットを記述します。

```toml
[general]
caption_extension = ".txt"
enable_bucket = true

[[datasets]]
resolution = 1024
batch_size = 1

  [[datasets.subsets]]
  image_dir = "/workspace/dataset/img"
  num_repeats = 10
```

そして学習を始めます。

```bash
accelerate launch --num_cpu_threads_per_process 1 sdxl_train_network.py \
  --pretrained_model_name_or_path=/workspace/models/sd_xl_base_1.0.safetensors \
  --dataset_config=/workspace/dataset.toml \
  --output_dir=/workspace/output --output_name=zxq_mug \
  --save_model_as=safetensors \
  --network_module=networks.lora --network_dim=16 --network_alpha=8 \
  --network_train_unet_only \
  --optimizer_type=AdamW8bit --learning_rate=1e-4 \
  --lr_scheduler=constant_with_warmup --lr_warmup_steps=100 \
  --max_train_epochs=8 --save_every_n_epochs=2 \
  --mixed_precision=bf16 --save_precision=bf16 \
  --cache_latents --cache_latents_to_disk --cache_text_encoder_outputs \
  --gradient_checkpointing --sdpa --seed=42 \
  --sample_prompts=/workspace/prompts.txt --sample_every_n_epochs=2
```

`prompts.txt` には 1 行に 1 つずつテスト用のプロンプトを書き、サイズ、シード、ステップ数を sd-scripts のインラインオプションで指定します。

```text
zxq_mug, a ceramic coffee mug on a kitchen counter --w 1024 --h 1024 --d 42 --s 28
zxq_mug, a ceramic coffee mug held by a hiker on a mountain top --w 1024 --h 1024 --d 42 --s 28
```

### 各設定の意味

- **ステップ数。** 画像数 × 繰り返し数 × エポック数 ÷ バッチサイズです。画像 25 枚なら 25 × 10 × 8 = 2,000 ステップです。
- **`network_dim` 16、`network_alpha` 8。** LoRA の容量です。1 つの物や顔なら 16 で十分で、画風には 32 が必要なこともあります。ランクを上げると過学習が早くなり、ファイルも大きくなります。
- **`--network_train_unet_only`。** ここでは必須です。sd-scripts はテキストエンコーダーを学習しながらその出力をキャッシュすることを受け付けませんし、そもそもドキュメントでも SDXL の LoRA では U-Net のみの学習を「強く推奨」しています。
- **キャッシュと gradient checkpointing。** SDXL を 8〜10 GB に収めているのはこの 2 つです。キャッシュを使うとキャプションのシャッフルとドロップアウトも無効になるので、データセットのファイルにはそれらを書いていません。
- **`learning_rate` 1e-4 と AdamW8bit。** sd-scripts 自身の SDXL LoRA の例と同じ値です。4 エポック後もサンプルがほとんど変わらなければ 2e-4 を試してください。学習画像のコピーのようになってきたら、下げるか早めに止めます。
- **2 エポックごとのチェックポイント。** エポック 2、4、6、8 のファイルができるので、その中から一番良いものを選びます。一番良い LoRA が最後のものとは限りません。

### 所要時間

kohya_ss の issue スレッドでは、RTX 4090 で gradient checkpointing を使い、1024x1024、バッチサイズ 1 で SDXL の LoRA を学習したとき、毎秒約 1.1〜1.4 イテレーションだったと報告されています。この速度なら 2,000 ステップで 24〜30 分、それに latent のキャッシュに数分かかります。同じスレッドには、カードの VRAM が足りずに共有メモリにあふれたときの惨状も載っています。1 ステップに 50 秒以上です。速度が想定の範囲を大きく下回るなら、設定を疑う前に `nvidia-smi` を確認してください。

## ai-toolkit で Flux と新しいモデルを学習する

Flux なら ai-toolkit が一番手軽です。レンタルしたマシンで次のように実行します。

```bash
git clone https://github.com/ostris/ai-toolkit.git
cd ai-toolkit
python3 -m venv venv && source venv/bin/activate
pip3 install --no-cache-dir torch==2.13.0 torchvision==0.28.0 torchaudio==2.11.0 \
  --index-url https://download.pytorch.org/whl/cu130
pip3 install -r requirements.txt
cp config/examples/train_lora_flux_24gb.yaml config/zxq_mug.yml
# edit the dataset path, trigger word and steps, then:
python run.py config/zxq_mug.yml
```

あるいは `cd ui && npm run build_and_start` で Web UI を起動し、ポート 8675 を開きます。ほかの人がアクセスできるサーバーでは、README の推奨どおり、先に `AI_TOOLKIT_AUTH` にパスワードを設定してください。

Flux のモデルを選ぶ前に、ライセンスについて知っておくべきことが 2 つあります。

- **FLUX.1 [dev]** は Hugging Face でアクセス制限がかかっています。FLUX.1 [dev] Non-Commercial License に同意し、Hugging Face の読み取りトークンを使ってダウンロードします。モデルカードによると、生成した画像は商用利用できますが、重みとあなたが学習した LoRA は非商用ライセンスの対象です。
- **FLUX.2 [klein] 4B** は Apache 2.0 で、アクセス制限もありません。9B 版は FLUX Non-Commercial License です。

Black Forest Labs は 2026 年 6 月に、ai-toolkit で FLUX.2 [klein] の LoRA を学習するガイドを公開しました。RTX 4090 での 1,800 ステップの学習は「1 時間かからない」とし、750〜1,500 ステップあたりのチェックポイントを確認するよう勧めています。klein 4B の 3 倍の大きさがある FLUX.1 [dev] については、同じくらい信頼できる公開された所要時間を見つけられませんでした。時間を多めに見込み、最初の学習で実測してください。

## 課金を止める前に LoRA を確認する

マシンがまだ動いている間に、保存した各エポックのサンプル画像を見てください。LoRA が概念を覚えたかどうか、どこから過学習が始まったかが、追加費用なしでわかります。そのうえで、気に入ったチェックポイントをダウンロードします。

```bash
rsync -avP user@your-instance:/workspace/output/*.safetensors ./loras/
```

手元では、ファイルを ComfyUI の `models/loras` フォルダーか Forge の `models/Lora` に置き、シードを固定して確認します。

- **強さ。** 0.6、0.8、1.0 を試します。1.0 未満のほうがきれいに出る LoRA もあります。
- **柔軟性。** 学習データになかった場面にトリガーを入れてみます。山の上のマグカップ、絵画の中の顔などです。学習画像に似た場面でしかうまくいかないなら過学習です。前のエポックを使うか、繰り返し数を減らしてください。
- **漏れ。** トリガーワードなしで生成してみます。それでも概念が出てくるなら、キャプションが画像を十分に説明できていません。

結果がおかしいとき、直すべきはたいていデータセットです。質の低い画像を数枚外すか、変化させたいものをキャプションに書きます。学習率を変えるのはその次で、最初にやることではありません。

## 費用の計算例

SDXL の LoRA 1 つ、画像 25 枚、2,000 ステップ、RTX 4090 の場合です。

| 作業 | 時間 |
| --- | --- |
| テンプレートから起動し、sd-scripts をインストール | 10 分 |
| SDXL ベースのダウンロード、データセットのアップロード、キャッシュ | 10 分 |
| 学習（2,000 ステップ、1.1〜1.4 it/s） | 30 分 |
| サンプルの確認、チェックポイントのダウンロード、インスタンスの削除 | 15 分 |
| **合計** | **65 分（1.08 時間）** |

- Vast.ai（$0.31/時）：1.08 × $0.31 = **$0.34**。これにストレージと、ホストが決めた帯域幅の料金が加わります。
- RunPod（$0.74/時）：1.08 × $0.74 = **$0.80**。その 1 時間分の 50 GB のコンテナディスクは 50 × $0.10 ÷ 730 時間 = 1 セント未満です。

FLUX.2 [klein] の LoRA で、学習 1 時間とセットアップ・確認 30 分なら、RunPod で 1.5 × $0.74 = **$1.11**、Vast.ai で 1.5 × $0.31 = **$0.47** です。

<figure>
<svg viewBox="0 0 720 300" role="img" aria-labelledby="d2-title" xmlns="http://www.w3.org/2000/svg" font-family="system-ui, sans-serif" font-size="15">
<title id="d2-title">レンタルした RTX 4090 での LoRA 学習の費用を、予算 10 ドルと比べた棒グラフ</title>
<rect width="720" height="300" fill="#ffffff"/>
<line x1="230" y1="40" x2="230" y2="250" stroke="#e2e8f0" stroke-width="1"/>
<line x1="322" y1="40" x2="322" y2="250" stroke="#e2e8f0" stroke-width="1"/>
<line x1="414" y1="40" x2="414" y2="250" stroke="#e2e8f0" stroke-width="1"/>
<line x1="506" y1="40" x2="506" y2="250" stroke="#e2e8f0" stroke-width="1"/>
<line x1="598" y1="40" x2="598" y2="250" stroke="#e2e8f0" stroke-width="1"/>
<line x1="690" y1="30" x2="690" y2="250" stroke="#f97316" stroke-width="2" stroke-dasharray="6 4"/>
<text x="698" y="22" text-anchor="end" fill="#f97316" font-size="13">予算 $10</text>
<text x="220" y="75" text-anchor="end" fill="#1e1b4b">SDXL、Vast.ai</text>
<rect x="230" y="58" width="15.6" height="26" fill="#16a34a"/>
<text x="253" y="76" fill="#1e1b4b" font-size="13">$0.34</text>
<text x="220" y="125" text-anchor="end" fill="#1e1b4b">SDXL、RunPod</text>
<rect x="230" y="108" width="36.8" height="26" fill="#6366f1"/>
<text x="275" y="126" fill="#1e1b4b" font-size="13">$0.80</text>
<text x="220" y="175" text-anchor="end" fill="#1e1b4b">FLUX.2 klein、RunPod</text>
<rect x="230" y="158" width="51.1" height="26" fill="#6366f1"/>
<text x="289" y="176" fill="#1e1b4b" font-size="13">$1.11</text>
<text x="220" y="225" text-anchor="end" fill="#1e1b4b">SDXL 5 回、RunPod</text>
<rect x="230" y="208" width="184.5" height="26" fill="#6366f1"/>
<text x="422" y="226" fill="#1e1b4b" font-size="13">$4.01</text>
<line x1="230" y1="250" x2="690" y2="250" stroke="#64748b" stroke-width="1"/>
<text x="230" y="270" text-anchor="middle" fill="#64748b" font-size="13">$0</text>
<text x="322" y="270" text-anchor="middle" fill="#64748b" font-size="13">$2</text>
<text x="414" y="270" text-anchor="middle" fill="#64748b" font-size="13">$4</text>
<text x="506" y="270" text-anchor="middle" fill="#64748b" font-size="13">$6</text>
<text x="598" y="270" text-anchor="middle" fill="#64748b" font-size="13">$8</text>
<text x="690" y="270" text-anchor="middle" fill="#64748b" font-size="13">$10</text>
<text x="460" y="292" text-anchor="middle" fill="#64748b" font-size="13">RTX 4090 での 1 回あたりの費用（2026 年 9 月の料金）</text>
</svg>
<figcaption>RunPod の定価で SDXL を 5 回別々に試しても、$10 を大きく下回ります。$0.74/時なら $10 で RTX 4090 を 13.5 時間、$0.31/時なら約 32 時間使えます。</figcaption>
</figure>

$10 の予算を吹き飛ばすのは、たいてい学習ではありません。一晩つけっぱなしにしたインスタンス（$0.74 で 12 時間なら $8.88）、停止したままストレージ料金を払い続ける Vast.ai のインスタンス、課金中の時間に画像のキャプションを付けて過ごした 1 時間です。秒単位の課金が役に立つのは、終わったらマシンを削除する場合だけです。

## GPUFlow の出番

この作業には向きません。GPUFlow が貸し出すのは、プロバイダーが自分の GPU で（たいていは Ollama で）動かしている言語モデルへのアクセスで、OpenAI 互換の API キーで使います。シェルも SSH もファイルへのアクセスもないので、学習ツールをインストールすることも、画像をアップロードすることも、LoRA をダウンロードすることもできません。提供しているのもチャットモデルで、画像モデルではありません。学習には Vast.ai や RunPod など、マシンそのものを貸し出すプラットフォームを使ってください。

画像ではなくテキストを扱うなら、借りて、学習して、削除するという同じやり方が言語モデルにも使えます。[レンタル GPU で LLM を非公開のままファインチューニングする](/ja/private-llm-fine-tuning-guide/)をご覧ください。

## 出典

すべて 2026 年 9 月に確認しました。

- LoRA の論文：[Hu et al., LoRA: Low-Rank Adaptation of Large Language Models](https://arxiv.org/abs/2106.09685)
- sd-scripts：[README とリリース](https://github.com/kohya-ss/sd-scripts)、[SDXL の LoRA 学習](https://github.com/kohya-ss/sd-scripts/blob/main/docs/sdxl_train_network.md)、[SDXL の注意点と VRAM](https://github.com/kohya-ss/sd-scripts/blob/main/docs/train_SDXL-en.md)、[データセットの設定](https://github.com/kohya-ss/sd-scripts/blob/main/docs/config_README-en.md)、[FLUX.1 の LoRA 学習](https://github.com/kohya-ss/sd-scripts/blob/main/docs/flux_train_network.md)、[WD14 tagger](https://github.com/kohya-ss/sd-scripts/blob/main/docs/wd14_tagger_README-en.md)
- [bmaltais/kohya_ss](https://github.com/bmaltais/kohya_ss)、[Nerogar/OneTrainer](https://github.com/Nerogar/OneTrainer)、[ostris/ai-toolkit](https://github.com/ostris/ai-toolkit)、[JoyCaption](https://github.com/fpgaminer/joycaption)
- RTX 4090 での SDXL の速度：[kohya_ss issue #1288](https://github.com/bmaltais/kohya_ss/issues/1288)
- Black Forest Labs：[FLUX.2 [klein] を LoRA で 60 分以内にファインチューニングする](https://huggingface.co/blog/black-forest-labs/flux-2-klein-lora)、モデルカード（[FLUX.1 [dev]](https://huggingface.co/black-forest-labs/FLUX.1-dev)、[FLUX.2 [klein] 4B](https://huggingface.co/black-forest-labs/FLUX.2-klein-base-4B)、[FLUX.2 [klein] 9B](https://huggingface.co/black-forest-labs/FLUX.2-klein-base-9B)）
- [Stable Diffusion XL base 1.0 のモデルカード](https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0)
- 料金：[RunPod の料金](https://www.runpod.io/pricing)、[RunPod の Pod 料金とストレージ](https://docs.runpod.io/pods/pricing)、[Vast.ai の料金](https://docs.vast.ai/guides/instances/pricing.md)、getdeploying.com（[RTX 3090](https://getdeploying.com/reference/cloud-gpu/nvidia-rtx-3090)、[RTX 4090](https://getdeploying.com/reference/cloud-gpu/nvidia-rtx-4090)、[RTX 5090](https://getdeploying.com/reference/cloud-gpu/nvidia-rtx-5090)、[Vast.ai](https://getdeploying.com/vast-ai)）
- GPUFlow：[API クイックスタート](https://docs.gpuflow.app/ja/renters/api-quickstart/)
