---
title: "レンタル GPU・公開 GPU ノードでデータセットを守る方法"
description: "レンタル GPU のホストは、ジョブが復号したものをすべて読めます。暗号化、セキュアクラウド、H100 のコンフィデンシャルコンピューティングで何が防げるのか、そして後片付けの方法をまとめます。"
excerpt: "GPU を借りるということは、データを置くマシンの root 権限を他人が持っているということです。脅威モデル、それぞれの防御が実際にカバーする範囲、そして最近のディスクでも通用する後片付けの手順を説明します。"
pubDate: 2026-02-26
updatedDate: 2026-09-30
locale: "ja"
category: "guides"
featured: false
draft: false
author: "GPUFlow Team"
authorUrl: "https://gpuflow.app"
heroImage: "../_images/secure-server-room-abstract.png"
heroImageAlt: "保護された AI データ処理を表す、安全なサーバー環境の抽象的なイメージ"
faq:
  - question: "レンタル GPU のホストに自分のデータを見られることはありますか？"
    answer: "技術的にはあります。ホストは物理マシンの root 権限を持っており、モデルの学習や実行のためには、データをメモリ上で復号しなければならないからです。ホストをこの構図から外せるのは、Azure や Google Cloud の H100 コンフィデンシャル VM のようなコンフィデンシャルコンピューティングだけです。"
  - question: "クラウドの GPU インスタンスで、shred はファイルを確実に消去できますか？"
    answer: "確実ではありません。GNU の shred のマニュアルには、ファイルシステムとハードウェアがデータをその場で上書きする場合にしか機能しないとあり、ジャーナリングやコピーオンライトのファイルシステム、スナップショット、SSD ではそれが保証されません。データはディスクに書く前に暗号化し、代わりにインスタンスを破棄してください。"
  - question: "RunPod の Secure Cloud と Community Cloud の違いは何ですか？"
    answer: "RunPod のドキュメントでは、Secure Cloud は T3/T4 のデータセンターで動き、本番環境や機密データに向いているとされ、Community Cloud は信頼性にばらつきのある個人間（P2P）のプロバイダーとされています。RunPod は Community Cloud の新規ホストの受け付けを終了しています。"
  - question: "コンフィデンシャルコンピューティングに対応したクラウド GPU はどれですか？"
    answer: "2026 年 9 月時点で、Azure は AMD SEV-SNP 上で H100 NVL を 1 基載せた NCCads H100 v5 のコンフィデンシャル VM を、Google Cloud はコンフィデンシャル版の a3-highgpu-1g（H100 1 基、Intel TDX）と G4（RTX PRO 6000、AMD SEV）を提供しています。コンシューマー向けの GeForce カードはこれらの一覧に入っていません。"
  - question: "GDPR のもとで、個人データをレンタル GPU に置いても安全ですか？"
    answer: "プロバイダーが GDPR 第 28 条を満たす契約を結んだ処理者であり、マシンが EU 域外にある場合には合法的な移転手段がある場合に限ります。個人間のホストのほとんどはあなたとそのような契約を結んでいないので、先にデータを匿名化するか、DPA に署名するデータセンターのプロバイダーを使ってください。"
  - question: "GPUFlow でモデルを学習したりファインチューニングしたりできますか？"
    answer: "できません。GPUFlow は推論専用です。受け取るのは、プロバイダーのコンピューターで動くモデル用の OpenAI 互換 API キーで、SSH もシェルもファイルへのアクセスもありません。プロンプトはそのコンピューターに平文で届くので、機密の記録を送らないでください。"
---

GPU を借りると、データを置くマシンの root 権限は他人が持っています。暗号化は、データセットを送る途中とディスクに置いている間は守ってくれますが、学習ジョブがデータを使うにはメモリ上で復号しなければならず、その時点で、その気になったホストには読めてしまいます。ですから本当に決めるべきことは、誰を信頼するか（審査済みのデータセンターか、匿名の自宅サーバーか）、どれだけデータを減らして送るか、そしてコンフィデンシャルコンピューティングが必要かどうかです。ホストの運営者を信頼の連鎖から外せるのは、コンフィデンシャルコンピューティングだけです。

このガイドが対象とするのは、Vast.ai や RunPod のインスタンスのような、ログインして使うマシンです。脅威モデル、それぞれの防御がカバーする範囲、そして最近のストレージでも通用する後片付けの手順を順に見ていきます。出典は最後にあり、内容はすべて 2026 年 9 月に確認しました。

## 脅威モデル

まず、誰がどうやってデータに手を出せるのかを挙げます。レンタルした GPU インスタンスでは、現実的な経路が 7 つあります。

<figure>
<svg viewBox="0 0 720 430" role="img" aria-labelledby="d1-title" xmlns="http://www.w3.org/2000/svg" font-family="system-ui, sans-serif" font-size="15">
<title id="d1-title">レンタル GPU インスタンス上のデータセットの脅威モデル：データに至る 7 つの経路と、それぞれの主な防御</title>
<rect x="0" y="0" width="720" height="430" fill="#ffffff"/>
<line x1="220" y1="75" x2="240" y2="170" stroke="#e2e8f0" stroke-width="2"/>
<line x1="220" y1="220" x2="240" y2="215" stroke="#e2e8f0" stroke-width="2"/>
<line x1="220" y1="365" x2="240" y2="270" stroke="#e2e8f0" stroke-width="2"/>
<line x1="500" y1="75" x2="480" y2="170" stroke="#e2e8f0" stroke-width="2"/>
<line x1="500" y1="220" x2="480" y2="215" stroke="#e2e8f0" stroke-width="2"/>
<line x1="500" y1="365" x2="480" y2="270" stroke="#e2e8f0" stroke-width="2"/>
<line x1="360" y1="330" x2="360" y2="290" stroke="#e2e8f0" stroke-width="2"/>
<rect x="240" y="140" width="240" height="150" rx="12" fill="#eef2ff" stroke="#6366f1" stroke-width="2"/>
<text x="360" y="170" text-anchor="middle" fill="#1e1b4b" font-weight="bold">レンタルしたインスタンス</text>
<text x="360" y="205" text-anchor="middle" fill="#1e1b4b">データセット</text>
<text x="360" y="235" text-anchor="middle" fill="#1e1b4b">重みとチェックポイント</text>
<text x="360" y="265" text-anchor="middle" fill="#1e1b4b">トークンと鍵</text>
<rect x="20" y="40" width="200" height="70" rx="10" fill="#ffffff" stroke="#f97316" stroke-width="2"/>
<text x="120" y="68" text-anchor="middle" fill="#1e1b4b">ホストの運営者</text>
<text x="120" y="92" text-anchor="middle" fill="#64748b" font-size="13">対策：審査済みホストか CC</text>
<rect x="20" y="185" width="200" height="70" rx="10" fill="#ffffff" stroke="#f97316" stroke-width="2"/>
<text x="120" y="213" text-anchor="middle" fill="#1e1b4b">通信経路</text>
<text x="120" y="237" text-anchor="middle" fill="#64748b" font-size="13">対策：SSH、ポートを開けない</text>
<rect x="20" y="330" width="200" height="70" rx="10" fill="#ffffff" stroke="#f97316" stroke-width="2"/>
<text x="120" y="358" text-anchor="middle" fill="#1e1b4b">ディスクの残存データ</text>
<text x="120" y="382" text-anchor="middle" fill="#64748b" font-size="13">対策：暗号化して破棄</text>
<rect x="500" y="40" width="200" height="70" rx="10" fill="#ffffff" stroke="#f97316" stroke-width="2"/>
<text x="600" y="68" text-anchor="middle" fill="#1e1b4b">マーケットプレイス運営</text>
<text x="600" y="92" text-anchor="middle" fill="#64748b" font-size="13">対策：契約と DPA</text>
<rect x="500" y="185" width="200" height="70" rx="10" fill="#ffffff" stroke="#f97316" stroke-width="2"/>
<text x="600" y="213" text-anchor="middle" fill="#1e1b4b">ほかの利用者</text>
<text x="600" y="237" text-anchor="middle" fill="#64748b" font-size="13">対策：VM かマシン丸ごと</text>
<rect x="500" y="330" width="200" height="70" rx="10" fill="#ffffff" stroke="#f97316" stroke-width="2"/>
<text x="600" y="358" text-anchor="middle" fill="#1e1b4b" font-size="13">スナップショット、ボリューム</text>
<text x="600" y="382" text-anchor="middle" fill="#64748b" font-size="13">対策：永続コピーを残さない</text>
<rect x="260" y="330" width="200" height="70" rx="10" fill="#ffffff" stroke="#f97316" stroke-width="2"/>
<text x="360" y="358" text-anchor="middle" fill="#1e1b4b">自分の置き忘れ</text>
<text x="360" y="382" text-anchor="middle" fill="#64748b" font-size="13">対策：トークンを限定・更新</text>
</svg>
<figcaption>ジョブの実行中、インスタンス上のものはすべてホストの運営者にさらされています。ほかの経路はふだんの衛生管理でふさげますが、この経路だけは、信頼できるホストかコンフィデンシャルコンピューティングが必要です。</figcaption>
</figure>

**ホストの運営者。** 物理マシンの所有者は、そのマシンの root 権限を持っています。Vast.ai のようなコンテナ型のマーケットプレイスでは、クライアントは非特権の Docker コンテナで動きます。これでほかの利用者からは隔離されますが、ホストからは隔離されません。ホストの root はコンテナのファイルもメモリも読めます。どのプラットフォームでも、コンテナはそういう仕組みです。

**通信経路。** ノート PC やバケットからノードへ移動するデータです。一番ふさぎやすい経路です。

**マーケットプレイスの運営会社。** あなたとホストの間にいる会社は、あなたのアカウント、SSH 鍵、そして自社のログに残るものを保持しています。それを使って何をしてよいかは規約で決まります。後の契約の節が重要なのはそのためです。

**ディスクの残存データ。** 削除したファイルがレンタル終了後もディスクに残り、次の借り手やホストに見つかることがあります。

**スナップショットと永続ボリューム。** 自分で頼んだコピー（ネットワークボリューム、停止したインスタンス）や、ホストが作ったコピー（バックアップ）は、ジョブが終わった後も残ります。

**ほかの利用者。** 同じマシン上のほかの顧客です。VM で隔離されているか、マシンを丸ごと使っているならこのリスクは小さいものの、GPU にはここで実際のバグがありました。LeftoverLocals（CVE-2023-4969）では、一部の Apple、AMD、Qualcomm の GPU で、あるプロセスが別のプロセスの GPU ローカルメモリを読めました。Trail of Bits は AMD Radeon RX 7900 XT で LLM への問い合わせ 1 回あたり約 181 MB を復元し、モデルの回答を再構成するのに十分でした。NVIDIA、ARM、Intel の GPU では、Trail of Bits はその兆候を見つけていません。

**自分の置き忘れ。** ノードに残した Hugging Face のトークン、クラウドの鍵、SSH の秘密鍵です。実際には、ほとんどの漏えいはここから始まります。

## 暗号化で守れるもの、守れないもの

暗号化には 3 つの役割があり、レンタル GPU ではそのうち 2 つを自分でこなせます。

**転送中：** 簡単です。SSH（`scp`、`sftp`、`rsync -e ssh`）か、バケットからの HTTPS を使います。Vast.ai は SSH 接続と API が暗号化されていると明記しています。平文の HTTP のリンクや、認証のないファイル共有サービスは決して使わないでください。

**保存時：** アップロードの前に暗号化しておけば、ホストのディスク上のファイルは鍵がなければ役に立ちません。これには [age](https://github.com/FiloSottile/age) が一番簡単です。

```bash
# on your own machine
tar -cf - train/ | age -p > train.tar.age
scp -P 22345 train.tar.age user@203.0.113.42:/workspace/
```

ノード上では、平文がディスクに触れないよう、メモリ上に直接復号します。

```bash
mkdir -p /dev/shm/train
age -d /workspace/train.tar.age | tar -xf - -C /dev/shm/train
```

`age -d` はターミナルでパスフレーズを尋ねるので、鍵がノードに書き込まれることはありません。`/dev/shm` は RAM 上のファイルシステムです。コンテナ環境では小さく設定されていることが多いので、先に `df -h /dev/shm` でサイズを確認してください。データが RAM に収まらなければ復号したコピーをディスクに置くしかなく、その場合は後の後片付けの節がより重要になります。

自社のサーバーならディスク全体を LUKS で暗号化するのが定番ですが、非特権のコンテナの中ではたいてい dm-crypt を設定できませんし、いずれにしても動作中の鍵はホストが持つことになります。

**使用中：** ここが穴です。学習するには GPU に平文のテンソルが必要で、GPU にデータを送る CPU のメモリにも平文があります。ホストの root 権限を持つ人なら、原理的にはそのメモリをダンプできます。保存時の暗号化は、稼働中の悪意あるホストには何の役にも立ちません。これに対処できるのは、ハードウェアによるコンフィデンシャルコンピューティングだけです。

## セキュアクラウドか、コミュニティクラウドか

ホストは衛生管理では取り除けない唯一のリスクなので、ホストの選択が最も大きな決断になります。2 大マーケットプレイスが供給を分けているのもこのためです。

| 選択肢 | ハードウェアの運用者 | プラットフォームの説明 |
| --- | --- | --- |
| RunPod Secure Cloud | T3/T4 のデータセンター | 「本番環境、機密データ」向け |
| RunPod Community Cloud | 個人間（P2P）のプロバイダー | 「コスト重視のワークロード」向け。新規ホストは受け付けていない |
| Vast.ai Secure Cloud | 審査済みのデータセンター | ISO 27001、Tier 3/4 の基準、物理セキュリティを確認済み |
| そのほかの Vast.ai のホスト | データセンターから個人まで | 個人のホストは「正式なセキュリティ対策が少ない場合がある」 |

機密データについての Vast.ai 自身の助言は、Secure Cloud のプロバイダーだけを使い、保存時にデータを暗号化し、インスタンスに認証情報を置かず、外部の鍵管理を使うことです。私が誰かに伝える内容とも一致します。

認証済みのデータセンターでも、限界が 2 つあります。1 つ目に、ISO 27001 が認証するのは運営者のプロセスであり、不正を働く内部の人間を排除できるわけではありません。2 つ目に、あなたのために個人データを処理するホストは GDPR 上の処理者であり、第 28 条はそれを対象とする契約を求めていますが、あなたとホストの間にはマーケットプレイスが入っています。実際にどの会社と契約するのか、その会社がホストについて何を約束しているのかを読んでください。

本当に機密性の高い作業なら、次の段階は、すでに DPA や場合によっては BAA を結んでいるハイパースケーラーのアカウント内の GPU インスタンスです。マーケットプレイスの領域からは出ることになり、1 時間あたりの料金も上がります。価格帯は [GPU レンタル料金比較](/ja/gpu-rental-pricing-comparison-2026/)にあります。

## H100 GPU でのコンフィデンシャルコンピューティング

コンフィデンシャルコンピューティング（CC）は、ここで挙げる中で唯一、ジョブの実行中にホストの運営者からデータを守るように設計された技術です。NVIDIA の Hopper と Blackwell のデータセンター向け GPU では、仕組みは次のとおりです。

- ワークロードは、CPU 側の AMD SEV-SNP または Intel TDX に支えられたコンフィデンシャル VM（CVM）で動きます。NVIDIA の設計は、ハイパーバイザーとホスト OS が侵害されている可能性を前提にしており、ハイパーバイザー「あるいはシステムそのもの」にアクセスできる運営者でも CVM のメモリを読めないようにすることを目指しています。
- 使う前に、VM は GPU が本物で CC モードになっていることを署名付きのデバイス証明書で確認します。この証明書は NVIDIA のリモートアテステーションサービス（NRAS）で検証できます。
- PCIe を通るデータ、コマンドバッファー、CUDA カーネルは暗号化・署名され、共有メモリ上の暗号化されたバウンスバッファーを経由します。

NVIDIA は 2024 年 4 月、CUDA 12.4 で H100 のシングル GPU の CC を一般提供しました。2026 年 9 月時点で実際に借りられるのは次の環境です。

| クラウド | インスタンス | GPU | CPU の TEE |
| --- | --- | --- | --- |
| Azure | NCCads H100 v5 | H100 NVL × 1、94 GB | AMD SEV-SNP（EPYC Genoa） |
| Google Cloud | a3-highgpu-1g、コンフィデンシャル VM | H100 × 1 | Intel TDX |
| Google Cloud | g4-standard-48、コンフィデンシャル VM | RTX PRO 6000 | AMD SEV |

これを前提に何かを作る前に、限界を知っておいてください。

- **VM 1 台に GPU 1 基。** Azure のシリーズは GPU 1 基で、Google のコンフィデンシャル GPU VM はマルチノードクラスターに対応していません。複数 GPU を使う大規模な学習はできません。
- **確保の方法。** Google Cloud では、コンフィデンシャル版の A3 High は Spot か Flex-start でしか動かず、予約には対応していません。
- **転送速度。** NVIDIA の 2023 年の技術解説では、CC モードでの CPU から GPU への帯域幅は約 4 GB/s で、CPU での暗号化が律速になっていました。16 GB のチェックポイントを読み込むと、純粋な転送だけで 16 ÷ 4 = 4 秒かかります。推論なら問題ありませんが、1 ステップごとに何 GB もストリーミングするデータパイプラインでは影響が出ます。その後のドライバーのリリースには性能改善が挙げられているので、自分のジョブで測ってください。
- **GPU のメモリは暗号化されない。** NVIDIA は、一般的な物理攻撃ツールでは届かないという理由で、パッケージ上の HBM を平文のままにしています。
- **マーケットプレイスにはない。** Vast.ai や RunPod のコミュニティホストでよく見るコンシューマー向けの GeForce カードは、これらの対応一覧のどれにも入っていません。

CC は、誰を信頼しなければならないかを変えます。ホストのスタッフではなく、NVIDIA のハードウェアとアテステーション、CPU のベンダー、そして自分の VM イメージです。「クラウドプロバイダーの管理者には読めない」と言えることが重要な規制対象のデータなら、レンタルのハードウェアでそこにたどり着ける選択肢はこれしかありません。

## ジョブの前と実行中

### アップロードの前に最小化する

一番安い防御は、自分のマシンから出ていかないデータです。転送の前に、次のことをします。

- モデルに不要な列を削除します。特に名前、メールアドレス、口座番号、自由記述のメモです。
- 直接の識別子はランダムなトークンに置き換え、対応表は手元に残します。
- データを手法に必要な量まで絞ります。LoRA や QLoRA のファインチューニングで調整するのは少数の追加の重みで、本番のデータベースを丸ごと必要とすることはまずありません。現実的な構成は[ファインチューニングガイド](/ja/private-llm-fine-tuning-guide/)で順を追って説明しています。
- モデルの重みも情報を持つことを忘れないでください。機密のテキストでファインチューニングしたモデルは、その一部を繰り返すことがあるので、アダプターも機密として扱います。

匿名化したデータなら、次に挙げる法的な問題のほとんども消えます。

### ノード上の認証情報とネットワーク

ノードに置いたものは、すべてコピーされうると考えてください。

- Hugging Face のトークンは、必要な 1 つのリポジトリへの読み取り権限だけを持つ fine-grained トークンにし、ジョブが終わったら無効にします。
- メインの SSH 秘密鍵、クラウドの root 認証情報、本番データベースのパスワードは、決してレンタルのマシンにコピーしないでください。ジョブが結果をバケットに書き込む必要があるなら、1 つのプレフィックスにだけ書き込めて 1 日以内に失効する鍵を作ります。
- 結果は、長期間有効な鍵を使ってノードから送るのではなく、SSH で手元に取り込みます。
- 待ち受けているものを `ss -tulnp` で確認します。Jupyter、TensorBoard、推論サーバーは `127.0.0.1` にバインドし、公開ポートを開けるのではなく SSH トンネル（`ssh -L 8888:127.0.0.1:8888 ...`）経由でアクセスします。

## 最近のディスクでも通用する後片付け

よくある助言は、終わったらデータセットを `shred` することです。これは思われているような働きをしません。GNU coreutils のマニュアルによると、`shred` はファイルシステムとハードウェアがデータをその場で上書きすることを前提にしており、それが成り立たない場合が列挙されています。ext4 の `data=journal` モード、Btrfs、XFS、ZFS などのジャーナリングやログ構造のファイルシステム、RAID、スナップショットのあるファイルシステム、圧縮ファイルシステム、そしてウェアレベリングで新しいデータを別の場所に書く SSD です。レンタルの GPU ノードは、そのうちのいくつかに同時に当てはまる可能性が高いでしょう。

代わりに効くのは次の方法です。

1. **ディスク上のコピーを無価値にする。** ディスクに触れたのが age で暗号化したアーカイブだけなら、削除するだけで十分です。パスフレーズがなければただのノイズです。NIST の媒体のサニタイズに関するガイド（SP 800-88 Rev. 2、2025 年 9 月）は、この考え方、つまり暗号消去を標準的な手法として扱っています。
2. **停止ではなく破棄する。** Vast.ai では、インスタンスを停止してもデータは保持され（ストレージの課金も続き）、破棄すると「インスタンスとすべてのデータが完全に削除されます」。RunPod では、Pod を停止するとコンテナディスクは消去され、`/workspace` ボリュームは停止後も残って Terminate で削除され、ネットワークボリュームは自分で削除するまで何があっても残ります。
3. **作成したネットワークボリュームを削除する。** 設計上、Pod より長く残ります。
4. **使ったものを無効にする。** Hugging Face のトークン、バケットの鍵、そしてこのジョブのためにマーケットプレイスに追加した使い捨ての SSH 公開鍵を削除します。

ホストが借り手の間でディスクをどう消去しているかは、私が読んだマーケットプレイスのドキュメントには書かれていませんでした。消去されない前提で計画してください。どちらにしても、ステップ 1 があれば大丈夫です。

## 契約と規制

技術的な対策よりも重要な法的事実が 1 つあります。誰かのマシンにデータを置けば、その人はデータの当事者になるということです。

- **GDPR。** あなたのために個人データを処理する GPU ホストは処理者です。第 28 条は、「十分な保証」を提供する処理者と、拘束力のある契約を求めています。何の書面も交わしていない個人間のホストはこれを満たさず、マシンが EU 域外にあることもあります。匿名化するか、DPA に署名するプロバイダーを使ってください。
- **HIPAA。** HHS は、電子的な医療データを保存するクラウドプロバイダーは、データが暗号化されていて鍵を持っていなくても事業提携者だとしています。審査していないホストに送る前に医療記録を暗号化しても、BAA が不要になるわけではありません。
- **顧客との契約。** エンタープライズ向けの契約の多くは、再委託先やデータの所在地を制限しています。最初のアップロードの前に確認してください。法的なリスクのほうが技術的なリスクより大きいことはよくあります。

姉妹記事の[企業が公開 AI ツールを制限する理由](/ja/why-corporate-policies-banning-chatgpt/)では、同じ規制をチャットの側から扱っています。

## GPUFlow での推論：別の取引

GPUFlow はデータセットを置く場所ではありません。推論のマーケットプレイスです。GPU を時間単位で借り、プロバイダーが自分のコンピューターで（たいていは Ollama で）動かしているオープンモデル用の OpenAI 互換 API キー（ベース URL は `https://gpuflow.app/v1`）を受け取ります。SSH もシェルもファイルへのアクセスもなく、学習もファインチューニングもできません。何もアップロードできないので、アップロードしたものがプロバイダーのディスクに残ることもありません。

これで、このガイドで扱ったディスクと認証情報の問題はなくなります。ホストの問題はなくなりません。レンタル中、プロンプトと回答はそれぞれプロバイダーのマシンを平文で通ります。GPUFlow の規約はプロバイダーがそれを記録、閲覧、保持、共有することを禁じており、GPUFlow 自身も本文を保存しませんが、プロバイダーはそのマシンの root 権限を持っているので、このルールは契約でしか担保されていません。データセットを 1 件ずつプロンプトとして流せば、すべての記録がそのコンピューターに届きます。

ですから、公開データ、合成データ、きちんと匿名化したデータに使い、オープンモデルや OpenAI 形式の API に対するアプリのテストに使ってください。規制対象や機密の記録は、自前のハードウェア、契約を結んだプロバイダー、またはコンフィデンシャル VM にとどめてください。[API クイックスタート](https://docs.gpuflow.app/ja/renters/api-quickstart/)にも一行で同じことが書かれています。パスワード、カード番号など、見知らぬ人に教えたくない秘密の情報は送らないでください。同じ仕組みをプロバイダーの側から見た話は [GPU を貸し出しても安全か](/ja/is-it-safe-to-rent-out-your-gpu/)にあります。

## チェックリスト

前：

- データの区分を決めます。規制対象や顧客の機密データは、コミュニティのホストではなく、契約を結んだプロバイダーかコンフィデンシャル VM に送ります。
- 最小化し、匿名化します。
- age で暗号化し、パスフレーズはノードに置きません。

実行中：

- 収まるなら `/dev/shm` に復号します。
- 権限を絞った短命のトークンだけを使います。
- サービスは localhost にバインドし、SSH トンネル経由でアクセスします。

後：

- 結果は SSH で取り込みます。ファインチューニングした重みは機密として扱います。
- インスタンスとネットワークボリュームを破棄します。
- トークンと使い捨ての鍵を無効にします。

## 出典

- Vast.ai のコンテナ隔離と Secure Cloud：[Vast.ai のセキュリティ FAQ](https://docs.vast.ai/guides/reference/faq/security)。停止と破棄の違い：[インスタンスの管理](https://docs.vast.ai/guides/instances/manage-instances)
- RunPod の Secure Cloud と Community Cloud：[Pod の選び方](https://docs.runpod.io/pods/choose-a-pod)。ストレージの永続性：[ストレージの種類](https://docs.runpod.io/pods/storage/types)
- LeftoverLocals：[Trail of Bits、2024 年 1 月](https://blog.trailofbits.com/2024/01/16/leftoverlocals-listening-to-llm-responses-through-leaked-gpu-local-memory/)
- age：[github.com/FiloSottile/age](https://github.com/FiloSottile/age)
- shred の限界：[GNU coreutils マニュアル、shred の実行](https://www.gnu.org/software/coreutils/manual/html_node/shred-invocation.html)
- NIST SP 800-88 Rev. 2：[NIST の発表、2025 年 9 月](https://www.nist.gov/news-events/news/2025/09/guidelines-media-sanitization-nist-publishes-sp-800-88r2)
- H100 のコンフィデンシャルコンピューティングの設計：[NVIDIA、安全で信頼できる AI のための H100 GPU でのコンフィデンシャルコンピューティング](https://developer.nvidia.com/blog/confidential-computing-on-h100-gpus-for-secure-and-trustworthy-ai/)。一般提供：[NVIDIA、2024 年 4 月](https://developer.nvidia.com/blog/announcing-confidential-computing-general-access-on-nvidia-h100-tensor-core-gpus/)
- Azure：[NCCads H100 v5 シリーズ](https://learn.microsoft.com/en-us/azure/virtual-machines/sizes/gpu-accelerated/nccadsh100v5-series)
- Google Cloud：[コンフィデンシャル VM の対応構成](https://docs.cloud.google.com/confidential-computing/confidential-vm/docs/supported-configurations)、[GPU 付きのコンフィデンシャル VM インスタンスの作成](https://docs.cloud.google.com/confidential-computing/confidential-vm/docs/create-a-confidential-vm-instance-with-gpu)
- GDPR 第 28 条：[gdpr-info.eu](https://gdpr-info.eu/art-28-gdpr/)
- HIPAA とクラウドプロバイダー：[HHS、HIPAA とクラウドコンピューティングに関するガイダンス](https://www.hhs.gov/hipaa/for-professionals/special-topics/health-information-technology/cloud-computing/index.html)
- GPUFlow：[API クイックスタート](https://docs.gpuflow.app/ja/renters/api-quickstart/)、[借り手が触れられる範囲](https://docs.gpuflow.app/ja/providers/security/)、[利用規約](https://gpuflow.app/ja/terms)、[プライバシーポリシー](https://gpuflow.app/ja/privacy)

すべて 2026 年 9 月に確認しました。
