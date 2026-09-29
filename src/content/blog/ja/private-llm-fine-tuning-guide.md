---
title: "レンタルGPUで行うプライベートLLMファインチューニング完全ガイド"
description: "レンタルGPUを使い、自社のデータセットでオープンウェイトの言語モデルをファインチューニングする手順を詳しく解説します。データを守り、計算コストを抑え、ベンダーロックインを避けられます。"
excerpt: "データを自分の管理下に置いたまま、レンタルGPUでオープンウェイトLLMをファインチューニングする方法を解説します。安全なデータ転送、QLoRAによるトレーニング、環境のクリーンアップまでを順を追って説明します。"
pubDate: 2025-02-23
updatedDate: 2026-09-29
locale: "ja"
category: "tutorials"
featured: false
draft: false
author: "GPUFlow Team"
heroImage: "../_images/secure-server-room-abstract.png"
heroImageAlt: "青い照明の中でAIデータを処理する安全なサーバールームの抽象イメージ"
faq:
  - question: "RTX 4090 1枚で大規模言語モデルをファインチューニングできますか？"
    answer: "はい。QLoRA（Quantized Low-Rank Adaptation）を使えば、8Bパラメータまでのモデルは24GBのVRAMに十分収まります。本チュートリアルでは、バッチサイズ、シーケンス長、LoRAランクの具体的な値を示しながら、コンシューマー向けハードウェアに合わせたトレーニングスクリプトの設定方法を解説します。"
  - question: "レンタルGPU上のデータセットは安全ですか？"
    answer: "データセットの安全性は、運用の仕方で決まります。本ガイドでは、SCPによる暗号化転送、S3やGoogle Driveなどのクラウドストレージを経由しない方法、トレーニング完了後のリモートマシンのクリーンアップを解説します。マシンは他人の所有物です。レンタルを終了する前に、すべて削除してください。"
  - question: "レンタルGPUで8Bモデルをファインチューニングすると、費用はどのくらいですか？"
    answer: "RTX 4090をレンタルして8Bパラメータのモデルをファインチューニングする場合、データセットのサイズとエポック数によって異なりますが、通常は3〜8ドル程度です。"
  - question: "トレーニング用のGPUをレンタルするのに本人確認は必要ですか？"
    answer: "通常は不要です。Vast.aiやRunPodのようなマーケットプレイスで求められるのはメールアドレスとプリペイドのクレジットで、身分証明書は必要ありません。RunPodでKYCが求められるのは、初めて暗号資産で支払う前だけです。AWSでは、新規アカウントのGPUクォータが0から始まるため、引き上げを申請する必要があります。"
  - question: "トレーニングスクリプトはどのような形式のデータセットを想定していますか？"
    answer: "各行にtextフィールドを持つJSONオブジェクトが1つずつ入ったJSONLファイルを想定しています。textフィールドには、指示・入力・応答を改行文字でつないだ1つの文字列を入れます。正しい形式の例は、本ガイドのステップ4に掲載しています。"
  - question: "このチュートリアルはLlama以外のモデルにも使えますか？"
    answer: "はい。Mistral、Qwen、Falconなど、どのオープンウェイトモデルにも同じ手順が使えます。コード例ではLlama-3.1-8Bを使っていますが、別のベースモデルをファインチューニングする場合は、モデル識別子を変更するだけです。"
  - question: "8Bパラメータのモデルのファインチューニングにはどのくらい時間がかかりますか？"
    answer: "トレーニング時間はデータセットのサイズによって変わります。1,000件のサンプルなら、RTX 4090で通常30〜60分で完了します。データセットが大きくなると、時間はほぼ比例して増えます。10,000件のデータセットでは5〜10時間の計算時間が必要です。"
  - question: "トレーニング完了後、リモートマシンはどう処理すればよいですか？"
    answer: "データセット、トレーニングコード、Hugging Faceのキャッシュ、bashの履歴を削除し、環境をクリーンアップする必要があります。本ガイドでは、レンタル契約を終了する前にファイルを確実に消去するためのコマンドを、shredを使う方法も含めて紹介します。"
---

この記事を読んでいるということは、OpenAIにアップロードできない、あるいはしたくないデータセットをお持ちなのでしょう。

そう考えているのはあなただけではありません。多くの企業や個人開発者にとって、ChatGPTの便利さよりも、データ漏えいという受け入れがたいリスクのほうが重く見えています。HIPAAの対象となる医療記録、何年もの開発投資が詰まった独自のコードベース、市場を動かしかねない機密性の高い金融モデル。こうしたデータを扱う場合、クラウドAIを使うことは、最も価値のある知的財産を第三者に預けることを意味しがちです。

その第三者が、顧客データを将来のモデルのトレーニングに使ってきた過去を持つ巨大テック企業であれば、「信頼」という言葉は居心地の悪いものになります。

解決策はAIを手放すことではありません。インフラを自分で持つことです。

自分で管理するハードウェア上でオープンウェイトモデルをファインチューニングすることは、もはや一部の研究者だけの取り組みではありません。プライバシーを重視する組織にとっては、業務上の必須要件です。Llama、Mistral、Qwenをはじめとする数多くのモデルが、API利用料もデータ共有の義務もなく商用利用できます。課題はずっと、計算資源をどう確保するかでした。NVIDIA H100のクラスターを購入するには数百万ドル規模の設備投資が必要です。AWSでレンタルすれば、本人確認や法人契約が求められ、時間単価も高いため、長時間のトレーニングは現実的な費用に収まりません。

本ガイドでは、第三の選択肢を紹介します。マーケットプレイスでGPUをレンタルし、その上でオープンウェイトの言語モデルをファインチューニングする方法です。レンタルするのは、世界各地の個人が所有するハードウェアであることも少なくありません。環境構築、公開ノードで作業する際のセキュリティ対策、トレーニングの実行までを一通り解説します。

コード例では具体的な動作例としてLlama-3.1-8Bを使いますが、Hugging Face互換のモデルであれば手順はまったく同じです。モデル識別子を差し替えるだけで、Mistral-7BやQwen2-7Bなど、用途に合ったオープンウェイトモデルをファインチューニングできます。

長期契約は不要で、費用は従来のクラウドプロバイダーのごく一部で済みます。

![リモートGPUサーバーへのSSH接続が有効になっているターミナル画面](../_images/terminal-ssh-connection.png)

## プライベートなファインチューニングの経済性

技術的な実装に入る前に、費用面の前提を整理しておきます。

AWSでモデルをトレーニングするには、大型インスタンスとクォータ申請が必要です。p4d.24xlargeインスタンス（A100 GPU×8）は1時間あたり32.77ドルで、AWSの新規アカウントはGPUクォータが0から始まります。

GPUマーケットプレイスでは、ハードウェアの所有者から直接計算資源をレンタルします。これには大きな意味があります。

**コスト削減：** マーケットプレイスでのRTX 4090のレンタル料金は、1時間あたりおよそ0.30〜0.46ドルです（2026年9月時点）。QLoRAを使う8Bパラメータのモデルであれば、24GBのVRAMを持つ4090が1枚あれば、データセットのサイズに応じて2〜6時間でファインチューニングが完了します。計算コストの合計は3〜8ドルです。

**データは1台のマシンにしか置かれない：** データセットはSSHでレンタルしたマシンに直接コピーし、トレーニングを実行し、結果をダウンロードしたら、すべて削除します。ストレージバケットも、3つ目のコピーも生まれません。

**審査は不要：** クラウドプロバイダーの法人営業チームの承認も、クォータの引き上げも必要ありません。プリペイドのクレジットを追加して、ハードウェアをレンタルするだけです。

比較のために挙げると、AWSのA10G 1基（g5.xlarge。24GBのVRAMを持つ最も安い選択肢）は、us-east-1で1時間あたり約1.01ドルです。クォータ申請、セットアップにかかる時間、環境を設定している間のアイドル時間まで含めると、初回の実行にかかる実際のコストは、マーケットプレイスで必要な数ドルをはるかに上回ります。

こうした費用の詳細は、[GPUレンタル料金比較](/ja/gpu-rental-pricing-comparison-2026/)と[GPUレンタルの本当のコスト](/ja/hidden-fees-in-gpu-rental/)で詳しくまとめています。

## 前提条件

本チュートリアルは、Linuxのコマンドラインに慣れていることを前提としています。機械学習の学位は必要ありませんが、ファイルシステムの操作、テキストファイルの編集、エラーメッセージの読み解きには慣れておく必要があります。

**ハードウェア要件：**

- **GPU：** 最低24GBのVRAM。RTX 3090、RTX 4090、A10Gはいずれも条件を満たします。70Bパラメータのモデルには48GB以上（A6000、A100×2、またはH100）が必要です。
- **システムRAM：** 32GB以上。モデルの読み込み時、重みはいったんシステムメモリに置かれてからGPUに転送されます。
- **ストレージ：** 100GB以上のNVMe SSD。Llama-3 8Bのベースの重みだけで約16GBを使います。さらにデータセット、チェックポイント、出力されるアダプターの分が必要です。

**モデルの選び方について：** 本チュートリアルでは、Meta社のLlama-3.1-8Bを例として使います。
QLoRAで量子化した場合に24GBのGPU 1枚に収まる、最も大きなクラスのモデルだからです。
LlamaファミリーにはLlama 4 ScoutやMaverickも加わりましたが、これらはMixture of Experts
アーキテクチャを採用しており、総パラメータ数はそれぞれ109Bと400Bです。マルチGPU構成が必要になるため、
1台のノードをレンタルする本ガイドの範囲を超えます。ここで説明する手順は、Mistral-7B、Qwen2-7B、Gemma-2-9Bをはじめ、
レンタルしたハードウェアのVRAMに収まるHugging Face互換のモデルであれば、
どれにも同じように使えます。
**ソフトウェアの前提条件：**

- Python 3.10以降
- PyTorchの基本的な知識
- Hugging Faceアカウント（Llamaのように、ライセンスへの同意が必要なゲート付きモデルのダウンロードに必要です）
- Vast.ai、RunPod、TensorDockなど、SSHでアクセスできるマシンを丸ごとレンタルできるGPUマーケットプレイスのアカウントと、プリペイドのクレジット

どれを選べばよいか迷う場合は、[GPUのレンタルに必要なもの](/ja/what-you-need-to-rent-a-gpu/)と[GPUFlow vs Vast.ai vs RunPod vs SaladCloud](/ja/gpuflow-vs-vast-ai-vs-runpod/)をご覧ください。なお、GPUFlow自体は本チュートリアルには向いていません。GPUFlowがレンタルするのはAPI経由のAIモデルへのアクセスで、ログインして操作できるマシンではないからです。

## ステップ1：計算ノードを確保する

最初のステップはハードウェアの確保です。大手クラウドでは、アカウントを作成し、GPUクォータを申請して、承認を待つ必要があります。マーケットプレイスなら、手続きははるかにシンプルです。

利用するマーケットプレイスを開き、クレジットを追加します。画面には、利用可能なマシンが仕様、時間単価、信頼性スコアとともに表示されます。

次の条件でマシンを絞り込みます。

- **GPU：** RTX 4090（24GB VRAM）またはRTX 6000 Ada（48GB VRAM）
- **RAM：** 最低32GB
- **ストレージ：** 空き容量100GB以上
- **信頼性：** 稼働率スコア95%以上

マシンを選び、レンタルを開始します。CUDAとPyTorchがインストール済みのイメージを選んでください。セットアップの時間を節約でき、そのセットアップ時間にも料金がかかるからです。

**公開ノードでのセキュリティ上の注意：**

リモートネットワーク上のマシンをレンタルするということは、見知らぬ人が所有し、物理的に管理しているハードウェアにアクセスするということです。仮想化レイヤーによってある程度の分離は確保されていますが、相応の注意を払って作業する必要があります。

1. **リモートマシンに秘密鍵を置かないでください。** 他のシステム用のSSH鍵、クラウドの認証情報、本番サービスのAPIトークンは、レンタルノード上に決して置いてはいけません。

2. **ファイルシステムは信頼できないものとして扱ってください。** ディスクに書き込んだものは、切断後にホストが復元できる可能性があると想定してください。確実な削除手順はステップ6で説明します。

3. **機密データは転送時に暗号化してください。** これについてはステップ3で扱います。

4. **パスワードを使い回さないでください。** レンタル画面にデフォルトの認証情報が表示された場合は、すぐに変更するか、新しいSSH鍵ペアを生成してください。

レンタルが確定すると、ダッシュボードに接続情報が表示されます。次のようなSSHコマンドが提示されます。

```bash
ssh -p 22345 user@203.0.113.42
```

ローカルのターミナルを開き、このコマンドを実行します。ホスト鍵のフィンガープリントを確認するよう求められたら、承認してください。これで、レンタルしたGPUノードに接続できました。

ハードウェアが注文どおりであることを確認します。

```bash
nvidia-smi
```

出力には、レンタルしたGPU、メモリ容量、インストール済みのドライバーのバージョンが表示されるはずです。GPUが表示されない場合や、仕様が注文内容と異なる場合は、すぐに切断し、マーケットプレイスのサポートに報告してください。

## ステップ2：環境を構築する

SSH接続を確認できたら、次はクリーンなPython環境を作ります。多くのレンタルノードにはNVIDIAドライバーとCUDA Toolkitがあらかじめインストールされていますが、ホストのシステムレベルのPythonパッケージに頼ると依存関係の衝突が起き、デバッグに何時間も取られることになります。

再現性と安定性を確保するため、独立した仮想環境を作成します。

次のコマンドを実行して作業ディレクトリを作成します。

```bash
mkdir ~/llama3-finetune
cd ~/llama3-finetune
python3 -m venv venv
source venv/bin/activate
```

ターミナルのプロンプトに`(venv)`と表示されれば、仮想環境が有効になっています。以降にインストールするパッケージはすべてこのディレクトリ内に収まり、ホストのシステムには影響しません。

Pythonパッケージをインストールする前に、CUDA Toolkitが使えることを確認します。

```bash
nvcc --version
```

CUDAのバージョン番号を控えておいてください。PyTorchとの互換性を確認するために必要です。多くのレンタルノードではCUDA 11.8または12.1が動いています。`nvcc`が見つからない場合は、CUDA ToolkitがPATHに含まれていない可能性があります。通常は、該当する環境ファイルを読み込めば解決します。

```bash
source /etc/profile.d/cuda.sh
```

このファイルが存在しない場合は、利用しているノードの構成についてマーケットプレイスのドキュメントを確認してください。

次に、PyTorch関連のパッケージをインストールします。次のコマンドはCUDA 12.1対応のPyTorchをインストールします。ノードのCUDAバージョンが異なる場合は、末尾のCUDAバージョンを変更してください。

```bash
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121
```

続いて、効率的なファインチューニングに必要なライブラリをインストールします。Hugging Faceのエコシステムに加え、量子化のためのbitsandbytesと、パラメータ効率の高いトレーニングのためのPEFTを使います。

```bash
pip install transformers==4.40.0 datasets==2.19.0 peft==0.10.0 bitsandbytes==0.43.1 trl==0.8.6 accelerate==0.29.0
```

**バージョンの固定は重要です。** 上記のバージョンは、執筆時点で動作と互換性を確認済みです。Hugging Faceのエコシステムは変化が速く、バージョンを固定せずにインストールすると、互換性のない変更が入り込むことがよくあります。インポートエラーや予期しない動作が起きた場合、最も疑わしいのはバージョンの不一致です。

最後に、Hugging Faceで認証します。Llama-3の重みはライセンス同意が必要なゲート付きで、Hugging Faceアカウントが必要です。[Meta Llama-3のリポジトリ](https://huggingface.co)を開き、ライセンス条項に同意してください。次に、Hugging Faceの設定ページでアクセストークンを生成します。

認証コマンドを実行します。

```bash
huggingface-cli login
```

求められたらアクセストークンを貼り付けます。トークンは`~/.cache/huggingface/token`に保存されます。これで、ゲート付きモデルの重みをレンタルノードに直接ダウンロードできるようになりました。

![Llama-3モデルの設定パラメータを示すPythonコードが表示されたターミナル](../_images/python-llama3-config.png)

## ステップ3：データを安全に転送する

このセクションでは、APIを呼び出すのではなくマシンをレンタルする最大の理由、つまりデータ主権を扱います。

一般的なクラウドのワークフローでは、データセットをS3、Google Cloud Storage、Azure Blobなどのストレージバケットにアップロードし、そこから計算インスタンスにダウンロードします。この方法では、機密データのコピーが、自分では管理できない複数のシステムに作られます。ストレージプロバイダーもアクセスでき、計算リソースのプロバイダーもアクセスできます。そしてどちらも、あなたの操作ログを保持します。

ここでは、暗号化された直接転送を使い、こうした経路を完全に避けます。

SSHプロトコルには`scp`（Secure Copy Protocol）が含まれており、ターミナル接続と同じ暗号化チャネルでファイルを転送できます。データは中間ストレージを一切経由せず、ローカルマシンからレンタルノードへ直接送られます。

**ローカルのコンピューター**で**新しいターミナルウィンドウ**を開きます。レンタルノードへの既存のSSHセッションは閉じないでください。ファイルパスと接続情報を実際のものに置き換えて、次のコマンドを実行します。

```bash
scp -P 22345 /path/to/your/dataset.jsonl user@203.0.113.42:~/llama3-finetune/
```

`-P`フラグでポート番号を指定します（sshの小文字の`-p`とは異なり、大文字のPである点に注意してください）。データセットが大きい場合、転送に数分かかることがあります。転送済みのバイト数を示す進捗が表示されます。

**1GBを超えるデータセット**は、転送前に圧縮することを検討してください。

```bash
# On your local machine
gzip -k dataset.jsonl
scp -P 22345 dataset.jsonl.gz user@203.0.113.42:~/llama3-finetune/

# Then on the remote node
cd ~/llama3-finetune
gunzip dataset.jsonl.gz
```

**追加のセキュリティ対策：**

高度な攻撃者まで想定する必要がある場合は、転送前にGPGやageでデータセットを暗号化するとよいでしょう。多層防御になり、万一転送が傍受されたとしても、内容を読み取られることはありません。

```bash
# On your local machine (using age encryption)
age -p dataset.jsonl > dataset.jsonl.age
scp -P 22345 dataset.jsonl.age user@203.0.113.42:~/llama3-finetune/

# On the remote node
age -d dataset.jsonl.age > dataset.jsonl
rm dataset.jsonl.age
```

ほとんどの場合、通常のSCP転送で十分な保護が得られます。SSHプロトコルはAES-256で暗号化され、ホスト鍵の検証によって中間者攻撃を防ぎます。データが第三者のストレージシステムを経由することもありません。

## ステップ4：ファインチューニングのスクリプト

教師ありファインチューニングの実行には、TRL（Transformer Reinforcement Learning）ライブラリの`SFTTrainer`クラスを使います。このライブラリは複雑な処理の多くを隠してくれる一方で、本番のワークロードに合わせた細かな設定も可能です。

トレーニングスクリプトを書く前に、想定されるデータセットの形式を理解しておく必要があります。

**データセットの形式要件：**

スクリプトはJSONL（JSON Lines）ファイルを想定しています。各行には、`text`フィールドを持つ有効なJSONオブジェクトが1つずつ入ります。`text`フィールドには、1件分のトレーニングサンプル全体を1つの文字列として入れます。

正しい形式の3行の例を示します。

```json
{"text": "### Instruction: Summarize the following legal clause in plain English.\n\n### Input: Party A shall indemnify, defend, and hold harmless Party B from any claims, damages, or expenses arising from Party A's negligence or willful misconduct.\n\n### Response: Party A agrees to protect Party B from any legal claims or costs that result from Party A's mistakes or intentional wrongdoing."}
{"text": "### Instruction: Extract the key financial metrics from this earnings report.\n\n### Input: Q3 revenue reached $4.2B, up 12% YoY. Operating margin improved to 23.5% from 21.2%. Free cash flow was $890M.\n\n### Response: Revenue: $4.2 billion (12% year-over-year growth). Operating margin: 23.5% (up from 21.2%). Free cash flow: $890 million."}
{"text": "### Instruction: Identify potential HIPAA violations in this process description.\n\n### Input: Patient records are emailed to the billing department as PDF attachments. The billing staff prints these for manual review and shreds them after processing.\n\n### Response: Potential violations include: unencrypted email transmission of PHI, physical documents that may be visible to unauthorized personnel during processing, and lack of documented chain of custody. Recommend encrypted file transfer and on-screen review only."}
```

**形式に関する重要な注意点：**

1. 各JSONオブジェクトは必ず1行に収めてください。複数行にまたがるJSONは使えません。
2. `text`フィールド内の改行は`\n`としてエスケープする必要があります。
3. テキスト内の引用符は`\"`としてエスケープする必要があります。
4. ファイルの文字コードはUTF-8にしてください。

元データが別の形式（CSV、Parquet、指示と応答が別々の列になっている形式など）の場合は、転送前にこの構造に変換しておく必要があります。Pythonの`json`ライブラリを使えば、エスケープは自動で処理されます。

```python
import json

with open('dataset.jsonl', 'w') as f:
    for example in your_data:
        text = f"### Instruction: {example['instruction']}\n\n### Input: {example['input']}\n\n### Response: {example['output']}"
        f.write(json.dumps({"text": text}) + '\n')
```

データセットの準備ができたら、リモートノード上でトレーニングスクリプトを作成します。

```bash
cd ~/llama3-finetune
nano train.py
```

次の内容を貼り付けます。このスクリプトはQLoRAを使い、24GBのGPUのメモリ制約の中で8Bパラメータのモデルをファインチューニングします。例ではLlama-3.1-8Bを使っていますが、MODEL_NAME変数を変更すれば、互換性のある任意のモデルに置き換えられます。

```python
import torch
from datasets import load_dataset
from transformers import (
    AutoModelForCausalLM,
    AutoTokenizer,
    BitsAndBytesConfig,
    TrainingArguments,
)
from peft import LoraConfig
from trl import SFTTrainer

# ============================================
# CONFIGURATION - Modify these values as needed
# ============================================

# Base model identifier on Hugging Face
# Change this to fine-tune a different model (e.g., "mistralai/Mistral-7B-v0.1")
MODEL_NAME = "meta-llama/Llama-3.1-8B"

# Name for your fine-tuned adapter
OUTPUT_NAME = "llama-3-8b-custom"

# Path to your dataset
DATASET_PATH = "dataset.jsonl"

# Training hyperparameters
NUM_EPOCHS = 1
BATCH_SIZE = 4
LEARNING_RATE = 2e-4
MAX_SEQ_LENGTH = 512

# LoRA hyperparameters
LORA_RANK = 16
LORA_ALPHA = 16
LORA_DROPOUT = 0.05

# ============================================
# QUANTIZATION CONFIGURATION
# ============================================

bnb_config = BitsAndBytesConfig(
    load_in_4bit=True,
    bnb_4bit_quant_type="nf4",
    bnb_4bit_compute_dtype=torch.float16,
    bnb_4bit_use_double_quant=True,
)

# ============================================
# MODEL LOADING
# ============================================

print("Loading base model...")
model = AutoModelForCausalLM.from_pretrained(
    MODEL_NAME,
    quantization_config=bnb_config,
    device_map="auto",
    trust_remote_code=True,
)
model.config.use_cache = False

print("Loading tokenizer...")
tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME, trust_remote_code=True)
tokenizer.pad_token = tokenizer.eos_token
tokenizer.padding_side = "right"

# ============================================
# DATASET LOADING
# ============================================

print(f"Loading dataset from {DATASET_PATH}...")
dataset = load_dataset("json", data_files=DATASET_PATH, split="train")
print(f"Dataset contains {len(dataset)} examples")

# ============================================
# LORA CONFIGURATION
# ============================================

peft_config = LoraConfig(
    r=LORA_RANK,
    lora_alpha=LORA_ALPHA,
    lora_dropout=LORA_DROPOUT,
    bias="none",
    task_type="CAUSAL_LM",
    target_modules=["q_proj", "k_proj", "v_proj", "o_proj"],
)

# ============================================
# TRAINING ARGUMENTS
# ============================================

training_args = TrainingArguments(
    output_dir="./results",
    num_train_epochs=NUM_EPOCHS,
    per_device_train_batch_size=BATCH_SIZE,
    gradient_accumulation_steps=1,
    learning_rate=LEARNING_RATE,
    weight_decay=0.001,
    fp16=True,
    logging_steps=10,
    save_steps=100,
    save_total_limit=3,
    optim="paged_adamw_32bit",
    lr_scheduler_type="cosine",
    warmup_ratio=0.03,
    report_to="none",
)

# ============================================
# TRAINER INITIALIZATION AND EXECUTION
# ============================================

print("Initializing trainer...")
trainer = SFTTrainer(
    model=model,
    train_dataset=dataset,
    peft_config=peft_config,
    dataset_text_field="text",
    max_seq_length=MAX_SEQ_LENGTH,
    tokenizer=tokenizer,
    args=training_args,
)

print("Starting training...")
trainer.train()

print(f"Saving adapter to {OUTPUT_NAME}...")
trainer.model.save_pretrained(OUTPUT_NAME)
tokenizer.save_pretrained(OUTPUT_NAME)

print("Training complete.")
```

`Ctrl+O`でファイルを保存し、`Ctrl+X`で終了します。

**主なパラメータの意味：**

- **LORA_RANK（r=16）：** ファインチューニングするアダプターの表現力を決めます。値を大きくすると学習できる内容は増えますが、必要なメモリも増えます。一般的には8〜64の値を使います。

- **LORA_ALPHA（16）：** LoRAの重みのスケーリング係数です。ランクと同じ値に設定するのが一般的な目安です。

- **MAX_SEQ_LENGTH（512）：** トレーニングサンプルの最大トークン長です。シーケンスが長いほど多くのメモリが必要になります。OOMエラーが出た場合は、まずこの値を下げてください。

- **BATCH_SIZE（4）：** 同時に処理するサンプル数です。メモリが足りない場合は2または1に下げてください。

- **target_modules：** LoRAアダプターを挿入する層を指定します。Llama-3では、アテンションの射影層（q、k、v、o）で最も良い結果が得られます。

トレーニングを開始するには、次のコマンドを実行します。

```bash
python train.py
```

スクリプトはまずベースモデルの重みをダウンロードします（8Bモデルで約16GB）。ダウンロードは初回だけで、2回目以降はキャッシュされた重みが使われます。読み込みが終わると、トレーニングの進捗とともに、10ステップごとにloss値が表示されます。

## ステップ5：トレーニングを監視する

トレーニングスクリプトの実行中は、GPUの状態を監視する必要があります。VRAMが上限に達したり、温度が安全な範囲を超えたりすると、プロセスがクラッシュします。チェックポイントが壊れ、レンタル時間を無駄にするおそれがあります。

ローカルマシンで2つ目のターミナルウィンドウを開き、レンタルノードにもう1つSSH接続を張ります。

```bash
ssh -p 22345 user@203.0.113.42
```

次のコマンドを実行すると、GPUの統計情報がリアルタイムで表示されます。

```bash
watch -n 1 nvidia-smi
```

![GPUメモリ使用量と温度の統計を示すnvidia-smiの出力が表示されたターミナル](../_images/nvidia-smi-monitoring.png)

このユーティリティは1秒ごとに表示を更新し、メモリ使用量、GPU使用率、温度を示します。本ガイドの設定をRTX 4090で実行している場合、次のような値になるはずです。

- **メモリ使用量：** 利用可能な24GBのうち18〜22GB
- **GPU使用率：** トレーニングステップの実行中は90〜100%
- **温度：** ホストの冷却環境によって60〜80°C

**よくある問題への対処：**

**メモリ使用量が24GB近くに達する：** メモリ使用量が常に上限に張り付いている場合は、トレーニングスクリプトの`BATCH_SIZE`を2または1に下げてください。あるいは`MAX_SEQ_LENGTH`を256に下げます。どちらの変更も、トレーニングのやり直しが必要です。

**GPU使用率が0%近い：** 通常は、データ読み込みがボトルネックになっていることを示します。CPUがGPUにサンプルを十分な速さで供給できていない状態です。NVMeを搭載したノードではあまり起きませんが、データセットが非常に大きい場合は起こりえます。転送前に、データセットをより効率的な形式（Arrow/Parquet）に変換しておくことを検討してください。

**温度が85°Cを超える：** 換気の悪い筐体でGPUを動かしているホストもあります。高温が続くとサーマルスロットリングが働き、トレーニングが遅くなることがあります。温度が常に85°Cを超えるようであれば、レンタルを終了して別のノードを選ぶことを検討してください。ハードウェアが壊れて困るのはホストですが、失われた時間と壊れたチェックポイントで困るのはあなたです。

**lossの推移の読み方：**

トレーニングスクリプトは10ステップごとにloss値を出力します。この数値は、モデルの予測がどれだけ「外れているか」を表し、低いほど良い状態です。次のような推移になるはずです。

- **初期のloss：** データセットによりますが、通常は1.5〜3.0
- **傾向：** 最初の数百ステップにわたって着実に減少
- **最終的なloss：** 設定が適切なら、通常は0.5〜1.5

lossが最初からまったく下がらない場合（100ステップ経っても減少しない場合）は、学習率が低すぎる可能性があります。lossが大きく上下する、または増加する場合は、学習率が高すぎます。多くのデータセットではデフォルト値の`2e-4`でうまくいきますが、調整が必要になることもあります。

lossが順調に下がっていたのに、突然非常に大きな値（10以上）に跳ね上がった場合は、データセットに不正な形式のサンプルが含まれている可能性が高いです。トレーニングを止め、JSONLファイルに文字コードのエラーや正しくエスケープされていない文字がないか確認してから、やり直してください。

1,000件のサンプルでの一般的なファインチューニングは、RTX 4090で30〜60分で完了します。データセットが大きくなると、時間はほぼ比例して増え、10,000件では5〜10時間かかります。

## ステップ6：モデルを回収し、環境をクリーンアップする

トレーニングが完了すると、ファインチューニングした重みは`OUTPUT_NAME`で指定したディレクトリにLoRAアダプターとして保存されます。16GBあるベースモデル全体と比べて、このアダプターは通常100〜500MBとコンパクトです。

まず、アダプターのファイルがあることを確認します。

```bash
ls -la ~/llama3-finetune/llama-3-8b-custom/
```

`adapter_config.json`、`adapter_model.safetensors`、トークナイザーのファイルなどが表示されるはずです。

**アダプターのマージはレンタルノード上で行わないでください。** マージとは、LoRAの重みをベースモデルと統合し、単体で動くファインチューニング済みモデルを作る処理です。この処理では16ビットのベースモデル全体をメモリに読み込む必要があり、24GBのカードではVRAMが足りなくなる場合があります。マージは自分の環境で行うか、推論時にベースモデルとアダプターを一緒に読み込むだけにしてください。PEFTライブラリを使えば、これはスムーズに行えます。

```python
from peft import PeftModel
from transformers import AutoModelForCausalLM

base_model = AutoModelForCausalLM.from_pretrained(
    "meta-llama/Llama-3.1-8B",
    device_map="auto",
)
model = PeftModel.from_pretrained(base_model, "./llama-3-8b-custom")
```

アダプターをダウンロードするには、SSHセッションではなく**ローカルのターミナル**に戻り、次のコマンドを実行します。

```bash
scp -r -P 22345 user@203.0.113.42:~/llama3-finetune/llama-3-8b-custom ./
```

`-r`フラグを付けると、ディレクトリ全体を再帰的にコピーします。ローカルのファイルサイズがリモートと一致しているかを確認し、転送が正常に完了したことを確かめてください。

**リモート環境のクリーンアップ：**

プロとアマチュアの差が出るのがこのステップです。レンタルノードには今、独自のデータセット、トレーニングコード、キャッシュされたモデルの重みが残っています。自分で管理していないマシンにこれらを残したままにするのは、運用セキュリティの基本に反します。

レンタルノードのSSHセッションに戻り、次のコマンドを実行します。

```bash
# Remove your working directory and all contents
rm -rf ~/llama3-finetune

# Clear the Hugging Face cache (contains downloaded model weights)
rm -rf ~/.cache/huggingface

# Clear Python package cache
rm -rf ~/.cache/pip

# Clear bash history
history -c
cat /dev/null > ~/.bash_history

# Clear any potential swap residue (may require sudo depending on node config)
sync
```

ノードで`shred`が使え、削除したファイルが復元されないことをさらに確実にしたい場合は、次のようにします。

```bash
# Secure deletion (slower but more thorough)
find ~/llama3-finetune -type f -exec shred -u {} \;
rm -rf ~/llama3-finetune
```

SSHセッションを切断します。

```bash
exit
```

マーケットプレイスのダッシュボードに戻り、ストレージボリュームも含めてレンタルを終了してください。そうしないと料金が発生し続けます。

## ファインチューニングしたモデルで推論する

アダプターをローカルマシンにダウンロードすれば、クラウドに一切依存せずに推論を実行できます。最小限の例を示します。

```python
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer, BitsAndBytesConfig
from peft import PeftModel

# Quantization config (same as training)
bnb_config = BitsAndBytesConfig(
    load_in_4bit=True,
    bnb_4bit_quant_type="nf4",
    bnb_4bit_compute_dtype=torch.float16,
)

# Load base model
base_model = AutoModelForCausalLM.from_pretrained(
    "meta-llama/Llama-3.1-8B",
    quantization_config=bnb_config,
    device_map="auto",
)

# Load your fine-tuned adapter
model = PeftModel.from_pretrained(base_model, "./llama-3-8b-custom")

# Load tokenizer
tokenizer = AutoTokenizer.from_pretrained("meta-llama/Llama-3.1-8B")

# Generate a response
prompt = "### Instruction: Summarize the contract clause.\n\n### Input: The Licensee shall not reverse engineer, decompile, or disassemble the Software.\n\n### Response:"

inputs = tokenizer(prompt, return_tensors="pt").to("cuda")
outputs = model.generate(**inputs, max_new_tokens=100, temperature=0.7)
response = tokenizer.decode(outputs[0], skip_special_tokens=True)

print(response)
```

本番環境で運用する場合は、FastAPIやFlaskでAPIとしてラップするか、vLLMやText Generation Inference（TGI）などの推論サーバーでデプロイすることを検討してください。これらの比較は[RTX 4090でのOllama vs vLLM vs TGI](/ja/ollama-vs-vllm-vs-tgi-rtx-4090-benchmark/)で行っています。

## まとめ

独自のデータで大規模言語モデルをファインチューニングし、しかもそのデータを1台のマシンに、できるだけ短い時間しか置かずに済ませました。法人契約を結ぶことも、巨大テック企業に知的財産へのアクセスを許すこともありませんでした。

RTX 4090を1時間0.45ドルで2時間使ってトレーニングしたと仮定すると、今回の作業にかかった費用の合計は90セントです。AWSのA10G 1基は1時間あたり約1.01ドルなので、実行そのものはAWSでもそれほど高くはありません。違いは、クォータ申請とセットアップにあります。

さらに重要なのは、データセットが一度もストレージサービスを経由せず、作業が終わった時点でレンタルマシンから削除されたことです。

クローズドソースのAPIに依存する時代は終わりつつあります。プライバシーを必要とする組織、データ主権を重視する研究者、自分でコントロールしたい開発者には、別の選択肢があります。GPUをレンタルすれば、インフラも、コストも、データも、自分の手に取り戻せます。

ファインチューニングしたモデルは今、あなたが管理するハードウェア上にあります。どうデプロイするか、誰にアクセスを許すか、何に使うか。その判断はすべてあなた自身のものです。

---

## 次に読む記事

本ガイドでは、プライベートなLLMファインチューニングの基本的な流れを解説しました。関連するトピックは、次の記事で詳しく扱っています。

**コストを理解する：**

- [GPUレンタル料金比較2026](/ja/gpu-rental-pricing-comparison-2026/) — マーケットプレイスと大手クラウドのコスト分析
- [GPUレンタルの本当のコスト](/ja/hidden-fees-in-gpu-rental/) — 料金ページには書かれていないコスト要因

**はじめる：**

- [2026年にGPUをレンタルするために必要なもの](/ja/what-you-need-to-rent-a-gpu/) — 各プラットフォームの登録、本人確認、支払い方法
- [公開GPUノードでデータセットを守る方法](/ja/how-to-secure-dataset-on-public-gpu-node/) — トレーニングの前・最中・後のセキュリティ対策

**選択肢を比較する：**

- [RunPodとVast.aiの比較](/ja/runpod-vs-vastapi-comparison/) — 二大マーケットプレイスの違い
- [GPUFlow vs Vast.ai vs RunPod vs SaladCloud](/ja/gpuflow-vs-vast-ai-vs-runpod/) — マシン、コンテナ、APIキーの比較
