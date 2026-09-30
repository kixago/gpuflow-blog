---
title: "租用 GPU 训练 Stable Diffusion LoRA，花费不到 $10"
description: "在租用的 RTX 4090 上训练 SDXL 或 Flux LoRA，成本远低于 $10：按显存选 GPU、图片标注、sd-scripts 和 ai-toolkit 的参数设置，以及一个完整的成本算例。"
excerpt: "2026 年 9 月，在租用的 RTX 4090 上训练一次 SDXL LoRA 约花 $0.35 到 $0.80。本文讲该选哪块 GPU、怎样准备和标注图片、具体的训练命令，以及钱到底花在了哪里。"
pubDate: 2026-02-11
updatedDate: 2026-09-30
locale: "zh_cn"
category: "tutorials"
featured: false
draft: false
author: "GPUFlow Team"
heroImage: "../_images/stable-diffusion-lora-training-guide.jpg"
heroImageAlt: "插图：几个人围着一块大显示器，屏幕上是 LoRA 网络示意图，旁边是服务器机架和一块对比两个训练轮次样图的面板"
faq:
  - question: "在租用的 GPU 上训练一个 LoRA 要多少钱？"
    answer: "2026 年 9 月，RTX 4090 在 Vast.ai 上的租价约为每小时 $0.31，RunPod 价格页面上为每小时 $0.74。一次 SDXL LoRA 训练连同准备和测试约 65 分钟，所以成本大约在 $0.34 到 $0.80 之间。"
  - question: "训练 SDXL LoRA 需要多少显存？"
    answer: "sd-scripts 文档说明，只训练 U-Net、缓存 latent 和文本编码器输出并启用梯度检查点时，SDXL LoRA 训练 8 GB 显存即可完成，推荐 10 GB。RTX 3090 或 4090 这类 24 GB 显卡可以直接在 1024x1024 下训练，不用跟显存较劲。"
  - question: "RTX 4090 能训练 Flux LoRA 吗？"
    answer: "能。ai-toolkit 自带以 24 GB 显卡命名的 FLUX.1 示例配置，sd-scripts 借助块交换给出了低至 8 GB 的 FLUX.1 设置。Black Forest Labs 自己的指南说，在 RTX 4090 上跑 1,800 步的 FLUX.2 [klein] LoRA 训练不到一小时。"
  - question: "训练一个 LoRA 需要多少张图片？"
    answer: "一个人物、物体或风格，常见的数量是 15 到 40 张好图；Black Forest Labs 建议 FLUX.2 [klein] 使用 15 到 40 张风格统一的图片。清晰、多样、标注到位，比数量多更重要。"
  - question: "LoRA 训练用 kohya_ss、OneTrainer 还是 ai-toolkit 更好？"
    answer: "三个都能用。kohya 的 sd-scripts 是命令行的参考实现，kohya_ss 在它上面加了网页界面；OneTrainer 有桌面界面和内置的自动标注；ai-toolkit 有网页界面、官方 RunPod 模板，并且较早支持 FLUX.2、Qwen-Image 等新模型。"
  - question: "能在 GPUFlow 上训练 LoRA 吗？"
    answer: "不能。GPUFlow 出租的是运行在提供商 GPU 上的 OpenAI 兼容聊天 API，没有 shell、SSH，也不能访问文件，所以没法运行训练脚本。请使用 Vast.ai 或 RunPod 这类出租整台机器的平台。"
---

在租用的 GPU 上训练一个 SDXL 或小型 Flux 模型的 LoRA，花费远低于 $10。2026 年 9 月，RTX 4090 在 Vast.ai 上每小时约 $0.31，在 RunPod 上每小时 $0.74，一次 SDXL LoRA 训练连同准备和测试一个多小时。每次尝试 $0.34 到 $0.80，$10 的预算够试十几次。

难的不是钱，而是图片、标注，以及知道什么时候该停。本文把这些都讲到，命令可以直接复制。价格和工具版本均于 2026 年 9 月核实，出处附在文末。

## 五个步骤

<figure>
<svg viewBox="0 0 720 250" role="img" aria-labelledby="d1-title" xmlns="http://www.w3.org/2000/svg" font-family="system-ui, sans-serif" font-size="15">
<title id="d1-title">LoRA 训练流程：数据集、标注、训练、测试、使用；效果不对时回到数据集</title>
<defs><marker id="d1-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#6366f1"/></marker></defs>
<rect width="720" height="250" fill="#ffffff"/>
<line x1="20" y1="40" x2="280" y2="40" stroke="#16a34a" stroke-width="2"/>
<text x="150" y="30" text-anchor="middle" fill="#16a34a" font-size="13">免费：在你自己的电脑上</text>
<line x1="300" y1="40" x2="560" y2="40" stroke="#f97316" stroke-width="2"/>
<text x="430" y="30" text-anchor="middle" fill="#f97316" font-size="13">计费：在租用的 GPU 上</text>
<rect x="20" y="60" width="120" height="70" rx="10" fill="#eef2ff" stroke="#6366f1" stroke-width="2"/>
<text x="80" y="90" text-anchor="middle" fill="#1e1b4b" font-weight="600">数据集</text>
<text x="80" y="112" text-anchor="middle" fill="#64748b" font-size="13">15–40 张图片</text>
<rect x="160" y="60" width="120" height="70" rx="10" fill="#eef2ff" stroke="#6366f1" stroke-width="2"/>
<text x="220" y="90" text-anchor="middle" fill="#1e1b4b" font-weight="600">标注</text>
<text x="220" y="112" text-anchor="middle" fill="#64748b" font-size="13">每张一个 .txt</text>
<rect x="300" y="60" width="120" height="70" rx="10" fill="#eef2ff" stroke="#6366f1" stroke-width="2"/>
<text x="360" y="90" text-anchor="middle" fill="#1e1b4b" font-weight="600">训练</text>
<text x="360" y="112" text-anchor="middle" fill="#64748b" font-size="13">sd-scripts</text>
<rect x="440" y="60" width="120" height="70" rx="10" fill="#eef2ff" stroke="#6366f1" stroke-width="2"/>
<text x="500" y="90" text-anchor="middle" fill="#1e1b4b" font-weight="600">测试</text>
<text x="500" y="112" text-anchor="middle" fill="#64748b" font-size="13">样图网格</text>
<rect x="580" y="60" width="120" height="70" rx="10" fill="#eef2ff" stroke="#6366f1" stroke-width="2"/>
<text x="640" y="90" text-anchor="middle" fill="#1e1b4b" font-weight="600">使用</text>
<text x="640" y="112" text-anchor="middle" fill="#64748b" font-size="13">ComfyUI、Forge</text>
<line x1="140" y1="95" x2="158" y2="95" stroke="#6366f1" stroke-width="2" marker-end="url(#d1-arrow)"/>
<line x1="280" y1="95" x2="298" y2="95" stroke="#6366f1" stroke-width="2" marker-end="url(#d1-arrow)"/>
<line x1="420" y1="95" x2="438" y2="95" stroke="#6366f1" stroke-width="2" marker-end="url(#d1-arrow)"/>
<line x1="560" y1="95" x2="578" y2="95" stroke="#6366f1" stroke-width="2" marker-end="url(#d1-arrow)"/>
<path d="M500,130 L500,180 L80,180 L80,134" fill="none" stroke="#f97316" stroke-width="2" stroke-dasharray="6 4" marker-end="url(#d1-arrow)"/>
<text x="290" y="205" text-anchor="middle" fill="#1e1b4b" font-size="13">效果不对？改图片或标注，然后重新训练</text>
<text x="360" y="235" text-anchor="middle" fill="#64748b" font-size="13">质量主要取决于前两步，而这两步不花钱</text>
</svg>
<figcaption>数据集和标注在租机器之前做好。GPU 只在训练和测试时计费；效果不好时，要回头改的通常是图片，而不是参数。</figcaption>
</figure>

## LoRA 是什么，为什么便宜

LoRA（Low-Rank Adaptation，低秩适配）冻结基础模型，只在其中部分层旁边训练两个小矩阵。原始论文报告，与对 GPT-3 175B 做全量微调相比，可训练参数减少了 10,000 倍，显存占用减少到三分之一。图像模型也是同样的道理：SDXL 基础检查点是一个 6.9 GB 的文件，而你训练出的 LoRA 是一个单独的小文件，加载到基础模型上，强度随你调。

所以一块消费级 GPU 就够用，一次训练只要几十分钟，而不是几天。

## 按显存选 GPU

显存决定你能训练什么，速度决定一次训练要计费多少分钟。所以每小时贵一些的快卡，算到每次训练上，花费可能差不多。

| 模型系列 | 文档给出的最低要求 | 宽裕配置 | 说明 |
| --- | --- | --- | --- |
| SD 1.5 | 8 GB | 12 GB 以上 | 在 512x512 下训练，最便宜也最快 |
| SDXL | 8 GB（推荐 10 GB） | 24 GB | 只训练 U-Net，缓存 latent 和文本编码器输出 |
| FLUX.1 [dev]（12B） | 8 GB，需大量块交换 | 24 GB | sd-scripts 给出了 24、16、12、10 和 8 GB 的设置 |
| FLUX.2 [klein] 4B/9B | 未说明 | 24 GB | BFL：bf16 权重约 13 GB，LoRA 训练可在 24 GB 以内完成 |

低显存设置能用，但慢。sd-scripts 靠在 GPU 和系统内存之间交换 transformer 块，把 FLUX.1 塞进 8 到 16 GB，而每次交换都要花时间，这些时间都在计费。租机器时，24 GB 显卡是合理的默认选择：RTX 3090 或 4090。RTX 5090（32 GB）也可以，但 sd-scripts 注明它需要 PyTorch 2.8.0 配 CUDA 12.8 或 12.9，所以要确认你的模板里的软件栈够新。

![一块华硕 TUF 三风扇显卡，立在白色架子上](../_images/test-hero.jpg)

数据中心显卡更快，但 RunPod 上 A100 80 GB 标价每小时 $1.59，是 4090 的两倍多。对于 20 或 30 张图片的 LoRA，多出来的速度很少能抵得上这个差价；它们更适合大数据集或全量微调。

## 去哪里租，要花多少钱

你需要一个给你整台机器的平台：有 shell 或 Jupyter notebook，有磁盘，能把文件传进传出。这类任务最常见的两个选择是 [Vast.ai 和 RunPod](/zh_cn/runpod-vs-vastapi-comparison/)。

| GPU | 显存 | Vast.ai（起价） | RunPod 价格页面 | RunPod 最低追踪价 |
| --- | --- | --- | --- | --- |
| RTX 3090 | 24 GB | 约 $0.11–0.13/小时 | $0.50/小时 | $0.22/小时 |
| RTX 4090 | 24 GB | 约 $0.31–0.33/小时 | $0.74/小时 | $0.34/小时 |
| RTX 5090 | 32 GB | 约 $0.41–0.47/小时 | $0.99/小时 | $0.69/小时 |

价格截至 2026 年 9 月。“Vast.ai（起价）”和“RunPod 最低追踪价”来自 getdeploying.com 的价格追踪；中间一列是 RunPod 自己的价格页面。Vast.ai 的价格由各主机自行设定，你看到的报价会因地区和可靠性评分而不同。

两家都按秒计费。附加费用各不相同，对一个一小时的任务来说，它们比小时价显示的更要紧：

- **Vast.ai** 对存储的计费是“只要实例存在，无论是否在运行”，带宽按字节收费，价格由各主机设定。在带宽贵的主机上下载一个 7 GB 的基础模型，费用会累积起来。用完要删除实例，不要只是停止。
- **RunPod** 在运行时对容器磁盘按每 GB 每月 $0.10 收费，停止后不收；已停止的卷磁盘按每 GB 每月 $0.20 收费。数据进出不收费。

两家都有现成的模板。ai-toolkit 的作者维护着一个官方 RunPod 模板，kohya_ss 的 README 也把 RunPod 列为支持的环境。用模板能省下十几分钟在计费时间里装 PyTorch 的功夫。更全面的价格对比见 [GPUFlow、Vast.ai、RunPod 与 SaladCloud 对比](/zh_cn/gpuflow-vs-vast-ai-vs-runpod/)和 [GPU 租用的隐藏成本](/zh_cn/hidden-fees-in-gpu-rental/)。

## 准备数据集和标注

这些都在租机器之前，在你自己的电脑上完成。

### 图片

- **数量。** 一个人物、物体或风格，15 到 40 张。Black Forest Labs 建议 FLUX.2 [klein] 使用“15–40 张风格统一的图片”。多出来的图片如果质量更差，多并不好。
- **一致与多样。** 每张图片都要体现这个概念，其余的都应该变化：角度、光线、背景、构图。如果你产品的每张照片都放在同一张白桌子上，LoRA 学到的就是那张桌子。
- **质量。** 清晰、曝光正常，没有水印或叠加文字。LoRA 学噪点和 JPEG 色块，跟学其他东西一样认真。
- **分辨率。** SDXL 和 Flux 短边至少 1024 像素，SD 1.5 至少 512。不用裁成正方形：启用分桶后，sd-scripts 会按宽高比给图片分组。

### 标注

每张图片配一个同名文本文件（`photo01.jpg`、`photo01.txt`）。标注告诉模型哪些东西已经用文字说明了，这样 LoRA 学的就是文字没说明的部分。开头放一个少见的触发词，然后描述所有你希望保持可变的内容：

```text
zxq_mug, a ceramic coffee mug on a wooden desk, morning light from the left, shallow depth of field
```

有两个工具可以帮你写初稿：

- **WD14 tagger**，sd-scripts 自带，生成逗号分隔的标签。适合动漫风格模型，以及用标签训练的 SDXL 微调模型：

  ```bash
  python finetune/tag_images_by_wd14_tagger.py --onnx \
    --repo_id SmilingWolf/wd-swinv2-tagger-v3 --batch_size 4 /workspace/dataset/img
  ```

- **JoyCaption**，一个开源（Apache 2.0）的图片描述模型，专为训练扩散模型而做，写出的是自然语言句子，比标签更适合 Flux。它的 README 说 bf16 下需要约 17 GB 显存，另有 8 位和 4 位版本供小显存显卡使用。

OneTrainer 也内置了自动标注，支持 BLIP、BLIP2 和 WD-1.4。不管初稿是谁写的，每一条标注都要亲自读一遍、改一遍。这是整个项目里最值的半小时。

## 选择训练工具

四个工具基本能覆盖所有人，全部免费开源。

| 工具 | 界面 | 支持的模型（2026 年 9 月） | 适合 |
| --- | --- | --- | --- |
| kohya-ss/sd-scripts | 命令行 | SD 1.x/2.x、SDXL、SD3/3.5、FLUX.1、Lumina、HunyuanImage-2.1、Anima | 可复现的训练，完全掌控 |
| bmaltais/kohya_ss | 基于 sd-scripts 的网页界面 | 与 sd-scripts 相同 | 用 sd-scripts 又不想背参数 |
| Nerogar/OneTrainer | 桌面界面和 CLI | SD 1.5 到 3.5、SDXL、FLUX.1、FLUX.2、Chroma、Qwen Image 等 | 内置自动标注和蒙版 |
| ostris/ai-toolkit | 网页界面和 YAML 配置 | SD 1.5、SDXL、FLUX.1、FLUX.2、Qwen-Image、Wan 视频等 | Flux 和较新的模型，有 RunPod 模板 |

sd-scripts 当前版本为 0.11.1（2026 年 6 月），在 Python 3.10 下测试，需要 PyTorch 2.6.0 或更高版本。ai-toolkit 推荐 Python 3.12，目前安装的是针对 CUDA 13.0 构建的 PyTorch 2.13.0。OneTrainer 需要 Python 3.10 到 3.13。

我训练 SDXL 用 sd-scripts，因为一条命令行就是全部配置，训练很容易重复和比较；训练 Flux 用 ai-toolkit。

## 用 sd-scripts 训练 SDXL LoRA

在一台装好 NVIDIA 驱动的全新 Linux 实例上，几条命令就能装好：

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

用 `scp`、`rsync` 或平台的文件浏览器，把装有图片和 `.txt` 标注的文件夹复制到 `/workspace/dataset/img`。然后在 `/workspace/dataset.toml` 里描述数据集：

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

开始训练：

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

`prompts.txt` 每行一个测试提示词，用 sd-scripts 的行内选项指定尺寸、种子和步数：

```text
zxq_mug, a ceramic coffee mug on a kitchen counter --w 1024 --h 1024 --d 42 --s 28
zxq_mug, a ceramic coffee mug held by a hiker on a mountain top --w 1024 --h 1024 --d 42 --s 28
```

### 这些参数的作用

- **步数。** 图片数 × 重复次数 × 轮数 ÷ 批大小。25 张图片：25 × 10 × 8 = 2,000 步。
- **`network_dim` 16，`network_alpha` 8。** LoRA 的容量。一个物体或一张脸，16 足够；风格有时需要 32。秩越高，越容易过拟合，文件也越大。
- **`--network_train_unet_only`。** 这里必须加：sd-scripts 不允许在训练文本编码器的同时缓存其输出，而且它的文档本来就把只训练 U-Net 列为 SDXL LoRA 的“强烈推荐”做法。
- **缓存和梯度检查点。** SDXL 能塞进 8 到 10 GB 就靠这两项。缓存还会关闭标注打乱和标注丢弃，所以数据集文件里没有这两项。
- **`learning_rate` 1e-4 配 AdamW8bit。** 这是 sd-scripts 自己的 SDXL LoRA 示例里的值。如果四轮之后样图几乎没变化，试试 2e-4；如果样图变成了训练图片的翻版，就调低学习率或提前停止。
- **每 2 轮保存一次检查点。** 你会得到第 2、4、6、8 轮的文件，从中挑最好的。最好的 LoRA 往往不是最后一个。

### 要多长时间

kohya_ss 一个 issue 帖子里，用户报告在 RTX 4090 上以 1024x1024、批大小 1、开启梯度检查点训练 SDXL LoRA，速度约为每秒 1.1 到 1.4 次迭代。按这个速度，2,000 步要 24 到 30 分钟，再加上几分钟缓存 latent。同一个帖子也显示了显卡显存不够、溢出到共享内存时有多糟：每步 50 秒甚至更久。如果你的速度远低于预期范围，先看 `nvidia-smi`，再去怀疑参数。

## 用 ai-toolkit 训练 Flux 和更新的模型

训练 Flux，ai-toolkit 是最省事的办法。在租来的机器上：

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

也可以用 `cd ui && npm run build_and_start` 启动网页界面，打开 8675 端口。如果服务器别人也能访问，先按 README 的建议把 `AI_TOOLKIT_AUTH` 设为一个密码。

选 Flux 模型之前，关于许可证有两点要知道：

- **FLUX.1 [dev]** 在 Hugging Face 上需要申请访问。你要接受 FLUX.1 [dev] 非商业许可证，并用 Hugging Face 读取令牌下载。它的模型卡说生成的图片可以商用；但权重和你训练的 LoRA 受非商业许可证约束。
- **FLUX.2 [klein] 4B** 采用 Apache 2.0 许可证，无需申请。9B 版本使用 FLUX 非商业许可证。

Black Forest Labs 在 2026 年 6 月发布了一份用 ai-toolkit 训练 FLUX.2 [klein] LoRA 的指南：在 RTX 4090 上跑 1,800 步“不到一小时”，并建议查看第 750 到 1,500 步左右的检查点。FLUX.1 [dev] 的大小是 klein 4B 的三倍，我还没找到同样可靠的公开耗时数据；多留些时间预算，第一次训练时自己测一下。

## 停止付费之前先测试 LoRA

趁机器还在运行，看看每个保存的轮次生成的样图。它们能让你不花额外的钱就知道 LoRA 有没有学会这个概念，以及从什么时候开始过拟合。然后下载你满意的检查点：

```bash
rsync -avP user@your-instance:/workspace/output/*.safetensors ./loras/
```

回到自己的电脑上，把文件放进 ComfyUI 的 `models/loras` 文件夹或 Forge 的 `models/Lora`，用固定种子测试：

- **强度。** 试 0.6、0.8 和 1.0。有些 LoRA 在低于 1.0 时效果最好。
- **泛化。** 把触发词放到训练数据里没有的场景中：山顶上的杯子，油画里的人脸。如果只有在和训练图片相似的场景里才有效，就是过拟合了：换一个更早的轮次，或减少重复次数。
- **泄漏。** 不加触发词生成。如果这个概念还是出现了，说明你的标注对图片描述得不够。

效果不对时，问题通常出在数据集上：删掉几张质量差的图片，或者在标注里写明你希望能变化的东西。调学习率是第二步，不是第一步。

## 成本算例

一个 SDXL LoRA，25 张图片，2,000 步，RTX 4090：

| 步骤 | 时间 |
| --- | --- |
| 从模板启动，安装 sd-scripts | 10 分钟 |
| 下载 SDXL 基础模型，上传数据集，缓存 | 10 分钟 |
| 训练（2,000 步，每秒 1.1 到 1.4 次迭代） | 30 分钟 |
| 查看样图，下载检查点，删除实例 | 15 分钟 |
| **合计** | **65 分钟（1.08 小时）** |

- Vast.ai，每小时 $0.31：1.08 × $0.31 = **$0.34**，另加存储费和主机的带宽费。
- RunPod，每小时 $0.74：1.08 × $0.74 = **$0.80**。一块 50 GB 的容器磁盘用一小时，另加 50 × $0.10 ÷ 730 小时，不到 1 美分。

一个 FLUX.2 [klein] LoRA，训练一小时，准备和测试 30 分钟，在 RunPod 上是 1.5 × $0.74 = **$1.11**，在 Vast.ai 上是 1.5 × $0.31 = **$0.47**。

<figure>
<svg viewBox="0 0 720 300" role="img" aria-labelledby="d2-title" xmlns="http://www.w3.org/2000/svg" font-family="system-ui, sans-serif" font-size="15">
<title id="d2-title">条形图：在租用的 RTX 4090 上训练 LoRA 的成本，与 10 美元预算对比</title>
<rect width="720" height="300" fill="#ffffff"/>
<line x1="230" y1="40" x2="230" y2="250" stroke="#e2e8f0" stroke-width="1"/>
<line x1="322" y1="40" x2="322" y2="250" stroke="#e2e8f0" stroke-width="1"/>
<line x1="414" y1="40" x2="414" y2="250" stroke="#e2e8f0" stroke-width="1"/>
<line x1="506" y1="40" x2="506" y2="250" stroke="#e2e8f0" stroke-width="1"/>
<line x1="598" y1="40" x2="598" y2="250" stroke="#e2e8f0" stroke-width="1"/>
<line x1="690" y1="30" x2="690" y2="250" stroke="#f97316" stroke-width="2" stroke-dasharray="6 4"/>
<text x="698" y="22" text-anchor="end" fill="#f97316" font-size="13">$10 预算</text>
<text x="220" y="75" text-anchor="end" fill="#1e1b4b">SDXL，Vast.ai</text>
<rect x="230" y="58" width="15.6" height="26" fill="#16a34a"/>
<text x="253" y="76" fill="#1e1b4b" font-size="13">$0.34</text>
<text x="220" y="125" text-anchor="end" fill="#1e1b4b">SDXL，RunPod</text>
<rect x="230" y="108" width="36.8" height="26" fill="#6366f1"/>
<text x="275" y="126" fill="#1e1b4b" font-size="13">$0.80</text>
<text x="220" y="175" text-anchor="end" fill="#1e1b4b">FLUX.2 klein，RunPod</text>
<rect x="230" y="158" width="51.1" height="26" fill="#6366f1"/>
<text x="289" y="176" fill="#1e1b4b" font-size="13">$1.11</text>
<text x="220" y="225" text-anchor="end" fill="#1e1b4b">5 次 SDXL，RunPod</text>
<rect x="230" y="208" width="184.5" height="26" fill="#6366f1"/>
<text x="422" y="226" fill="#1e1b4b" font-size="13">$4.01</text>
<line x1="230" y1="250" x2="690" y2="250" stroke="#64748b" stroke-width="1"/>
<text x="230" y="270" text-anchor="middle" fill="#64748b" font-size="13">$0</text>
<text x="322" y="270" text-anchor="middle" fill="#64748b" font-size="13">$2</text>
<text x="414" y="270" text-anchor="middle" fill="#64748b" font-size="13">$4</text>
<text x="506" y="270" text-anchor="middle" fill="#64748b" font-size="13">$6</text>
<text x="598" y="270" text-anchor="middle" fill="#64748b" font-size="13">$8</text>
<text x="690" y="270" text-anchor="middle" fill="#64748b" font-size="13">$10</text>
<text x="460" y="292" text-anchor="middle" fill="#64748b" font-size="13">RTX 4090 每次训练的成本，2026 年 9 月价格</text>
</svg>
<figcaption>即使按 RunPod 的标价单独尝试五次 SDXL，也远低于 $10。按每小时 $0.74，$10 能买 13.5 小时 RTX 4090；按每小时 $0.31，约 32 小时。</figcaption>
</figure>

真正把 $10 预算花光的很少是训练本身，而是忘了关、跑了一整夜的实例（按每小时 $0.74 算，12 小时就是 $8.88），是停止后仍在交存储费的 Vast.ai 实例，或者是在计费时间里花一小时给图片写标注。[按秒计费](/zh_cn/per-second-vs-hourly-gpu-billing/)只有在你用完就删机器时才省钱。

## GPUFlow 在其中的位置

这件事它帮不上。GPUFlow 出租的是提供商在自己 GPU 上（通常用 Ollama）运行的语言模型，通过 OpenAI 兼容 API 密钥访问。没有 shell，没有 SSH，也不能访问文件，所以你没法安装训练工具、上传图片或下载 LoRA。而且它提供的是聊天模型，不是图像模型。请在 Vast.ai、RunPod 或类似的出租整台机器的平台上训练。

如果你处理的是文本而不是图片，同样的“租机器、训练、删除”做法也适用于语言模型：见[在租用的 GPU 上私密微调 LLM](/zh_cn/private-llm-fine-tuning-guide/)。

## 资料来源

均于 2026 年 9 月核实。

- LoRA 论文：[Hu 等，LoRA: Low-Rank Adaptation of Large Language Models](https://arxiv.org/abs/2106.09685)
- sd-scripts：[README 和发布版本](https://github.com/kohya-ss/sd-scripts)、[SDXL LoRA 训练](https://github.com/kohya-ss/sd-scripts/blob/main/docs/sdxl_train_network.md)、[SDXL 说明与显存](https://github.com/kohya-ss/sd-scripts/blob/main/docs/train_SDXL-en.md)、[数据集配置](https://github.com/kohya-ss/sd-scripts/blob/main/docs/config_README-en.md)、[FLUX.1 LoRA 训练](https://github.com/kohya-ss/sd-scripts/blob/main/docs/flux_train_network.md)、[WD14 tagger](https://github.com/kohya-ss/sd-scripts/blob/main/docs/wd14_tagger_README-en.md)
- [bmaltais/kohya_ss](https://github.com/bmaltais/kohya_ss)、[Nerogar/OneTrainer](https://github.com/Nerogar/OneTrainer)、[ostris/ai-toolkit](https://github.com/ostris/ai-toolkit)、[JoyCaption](https://github.com/fpgaminer/joycaption)
- SDXL 在 4090 上的速度：[kohya_ss issue #1288](https://github.com/bmaltais/kohya_ss/issues/1288)
- Black Forest Labs：[60 分钟内用 LoRA 微调 FLUX.2 [klein]](https://huggingface.co/blog/black-forest-labs/flux-2-klein-lora)，模型卡：[FLUX.1 [dev]](https://huggingface.co/black-forest-labs/FLUX.1-dev)、[FLUX.2 [klein] 4B](https://huggingface.co/black-forest-labs/FLUX.2-klein-base-4B)、[FLUX.2 [klein] 9B](https://huggingface.co/black-forest-labs/FLUX.2-klein-base-9B)
- [Stable Diffusion XL base 1.0 模型卡](https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0)
- 价格：[RunPod 价格](https://www.runpod.io/pricing)、[RunPod pod 价格和存储](https://docs.runpod.io/pods/pricing)、[Vast.ai 价格](https://docs.vast.ai/guides/instances/pricing.md)，getdeploying.com 上的 [RTX 3090](https://getdeploying.com/reference/cloud-gpu/nvidia-rtx-3090)、[RTX 4090](https://getdeploying.com/reference/cloud-gpu/nvidia-rtx-4090)、[RTX 5090](https://getdeploying.com/reference/cloud-gpu/nvidia-rtx-5090) 和 [Vast.ai](https://getdeploying.com/vast-ai)
- GPUFlow：[API 快速入门](https://docs.gpuflow.app/zh-cn/renters/api-quickstart/)
