---
title: "在租用 GPU 上私有化微调大模型：完整指南"
description: "手把手教你在租用的 GPU 上用自己的数据集微调开源权重大语言模型。数据不外流，算力成本更低，也不会被单一厂商绑定。"
excerpt: "学习如何在租用的 GPU 上微调开源权重大模型，同时把数据牢牢握在自己手里。分步讲解加密传输数据、QLoRA 训练和训练后的环境清理。"
pubDate: 2025-02-23
updatedDate: 2026-09-29
locale: "zh_cn"
category: "tutorials"
featured: false
draft: false
author: "GPUFlow Team"
heroImage: "../_images/secure-server-room-abstract.png"
heroImageAlt: "蓝色灯光下处理 AI 数据的安全服务器机房抽象图"
faq:
  - question: "单张 RTX 4090 能微调大语言模型吗？"
    answer: "能。借助 QLoRA（量化低秩适配），8B 参数以内的模型可以轻松放进 24GB 显存。本教程会具体说明如何针对消费级硬件配置训练脚本，包括批大小、序列长度和 LoRA 秩等参数。"
  - question: "我的数据集放在租来的 GPU 上安全吗？"
    answer: "数据集安不安全，取决于你的操作习惯。本指南介绍了如何通过 SCP 加密传输、如何绕开 S3 或 Google Drive 这类云存储中转，以及训练结束后如何清理远程机器。别忘了，这台机器属于别人，结束租用前一定要把所有东西删干净。"
  - question: "在租用 GPU 上微调一个 8B 模型要花多少钱？"
    answer: "用租来的 RTX 4090 微调一个 8B 参数模型，一次典型的训练花费在 3 到 8 美元之间，具体取决于数据集大小和训练轮数。"
  - question: "租 GPU 算力做训练需要实名认证吗？"
    answer: "通常不需要。Vast.ai、RunPod 这类平台只要求邮箱地址和预充值，不需要身份证件。RunPod 只有在你第一次用加密货币付款前才要求 KYC。在 AWS 上，新账户的 GPU 配额默认是零，需要单独申请。"
  - question: "训练脚本需要什么格式的数据集？"
    answer: "脚本需要一个 JSONL 文件，每行是一个包含 text 字段的 JSON 对象。text 字段应把指令、输入和回答拼成一个字符串，中间用换行符分隔。本指南第 4 步给出了格式正确的示例。"
  - question: "这个教程适用于 Llama 以外的模型吗？"
    answer: "适用。这套流程适用于任何开源权重模型，包括 Mistral、Qwen、Falcon 等。示例代码用的是 Llama-3.1-8B，要微调其他基础模型，只需更换模型标识符。"
  - question: "微调一个 8B 参数模型需要多长时间？"
    answer: "训练时长取决于数据集大小。在 RTX 4090 上，1,000 条样本的典型训练需要 30 到 60 分钟。数据集更大时，时间大致线性增长：10,000 条样本需要 5 到 10 小时的算力时间。"
  - question: "训练完成后，远程机器该怎么处理？"
    answer: "你必须清理环境：删除数据集、训练代码、Hugging Face 缓存和 bash 历史记录。本指南给出了具体的安全删除命令，还介绍了如何选用 shred 在结束租用合约前彻底销毁文件。"
---

如果你在读这篇文章，手里多半有一份不能、也不愿上传给 OpenAI 的数据集。

有这种顾虑的不止你一个。对很多企业和独立开发者来说，ChatGPT 再方便，也抵不过数据泄露这个无法接受的风险。无论你处理的是受 HIPAA 约束的医疗记录、凝聚多年工程投入的私有代码库，还是足以影响市场的敏感金融模型，使用云端 AI 往往意味着把最有价值的知识产权交给第三方。

如果这个第三方还是一家曾拿客户数据训练后续模型的科技巨头，"信任"二字就很难说出口了。

解决办法不是放弃 AI，而是掌握基础设施。

在自己掌控的硬件上微调开源权重模型，早已不是学术圈的小众玩法。对重视隐私的组织来说，这是一项业务刚需。Llama、Mistral、Qwen 等数十个模型都允许商用，没有 API 费用，也不要求共享数据。难点一直在于算力。买一套 NVIDIA H100 集群需要数百万美元的资本支出。从 AWS 租则要身份验证、签企业协议，按小时计的价格也让长时间训练贵得难以承受。

本指南介绍第三条路。你将学会如何在 GPU 市场上租一块 GPU 来微调开源权重语言模型，这些硬件往往属于世界各地的个人。内容涵盖环境搭建、在公共节点上操作的安全规范，以及完整的训练流程。

代码示例以 Llama-3.1-8B 作为具体参照，但这套流程同样适用于任何兼容 Hugging Face 的模型。换一个模型标识符，就可以微调 Mistral-7B、Qwen2-7B，或任何适合你场景的开源权重模型。

整个过程不需要签长期合约，花费也只是传统云厂商的零头。

![终端窗口显示与远程 GPU 服务器的 SSH 连接](../_images/terminal-ssh-connection.png)

## 私有化微调的成本账

在看技术实现之前，先把钱的事算清楚。

在 AWS 上训练模型意味着要用大实例，还要申请配额。p4d.24xlarge 实例（8 块 A100 GPU）每小时 32.77 美元，而且新 AWS 账户的 GPU 配额默认是零。

在 GPU 市场上，你直接向硬件所有者租用算力。这带来几个显著变化：

**成本更低：** 在各类市场上，RTX 4090 的租金大约每小时 0.30 到 0.46 美元（2026 年 9 月）。用 QLoRA 微调 8B 参数模型时，一张 24GB 显存的 4090 根据数据集大小需要 2 到 6 小时完成一次微调，算力总成本在 3 到 8 美元之间。

**数据只在一台机器上：** 你通过 SSH 把数据集直接复制到租来的机器上，训练，下载结果，然后全部删除。没有存储桶，也没有第三份副本。

**没有门槛：** 你不需要云厂商企业销售团队的审批，也不需要申请提高配额。充值预付额度，直接租硬件。

作为对比：AWS 上的一张 A10G（g5.xlarge，24GB 显存里最便宜的选项）在 us-east-1 区域每小时约 1.01 美元。再算上配额申请、搭建时间以及配置环境期间闲置的算力，第一次训练的真实成本远高于在市场上花的那几美元。

这些成本细节在我们的 [GPU 租用价格对比](/zh_cn/gpu-rental-pricing-comparison-2026/)和[租用 GPU 的真实成本](/zh_cn/hidden-fees-in-gpu-rental/)中有详细记录。

## 准备工作

本教程假定你熟悉 Linux 命令行。你不需要机器学习的研究生学位，但应该能熟练地浏览文件系统、编辑文本文件、看懂错误信息。

**硬件要求：**

- **GPU：** 至少 24GB 显存。RTX 3090、RTX 4090 和 A10G 都符合要求。70B 参数模型需要 48GB 或以上（A6000、双 A100 或 H100）。
- **系统内存：** 32GB 或以上。加载模型时，权重会先暂存在系统内存中，再传到 GPU。
- **存储：** 100GB 或以上的 NVMe SSD 空间。Llama-3 8B 的基础权重约占 16GB，数据集、检查点和输出的适配器还要额外占用空间。

**关于模型选择：** 本教程以 Meta 的 Llama-3.1-8B 为示例，因为它代表了借助 QLoRA 量化能装进单张 24GB GPU 的最大一档模型。Llama 家族现在已有 Llama 4 Scout 和 Maverick，但它们采用混合专家（MoE）架构，总参数量分别为 109B 和 400B，需要多 GPU 配置，超出了单节点租用的范围。这里介绍的流程同样适用于 Mistral-7B、Qwen2-7B、Gemma-2-9B，以及任何显存需求在你所租硬件范围内、兼容 Hugging Face 的模型。

**软件要求：**

- Python 3.10 或更高版本
- 会用 PyTorch 的基本操作
- 一个 Hugging Face 账户（下载 Llama 这类需要接受许可协议的受限模型时必需）
- 一个已充值预付额度的 GPU 市场账户，平台需出租可 SSH 登录的整台机器，例如 Vast.ai、RunPod 或 TensorDock

不知道选哪家？请看[租用 GPU 需要准备什么](/zh_cn/what-you-need-to-rent-a-gpu/)和 [GPUFlow vs Vast.ai vs RunPod vs SaladCloud](/zh_cn/gpuflow-vs-vast-ai-vs-runpod/)。注意，GPUFlow 本身不适合本教程：它通过 API 出租 AI 模型的使用权，而不是一台可以登录的机器。

## 第 1 步：获取安全的算力节点

第一步是拿到硬件。在大型云平台上，这意味着注册账户、申请 GPU 配额、等待审批。在市场平台上，流程要直接得多。

打开你选定的市场平台，充值一些额度。界面会列出可用的机器，以及它们的配置、小时价格和可靠性评分。

按以下条件筛选机器：

- **GPU：** RTX 4090（24GB 显存）或 RTX 6000 Ada（48GB 显存）
- **内存：** 至少 32GB
- **存储：** 可用空间 100GB 以上
- **可靠性：** 在线率评分 95% 或以上

选一台机器并开始租用。选择预装了 CUDA 和 PyTorch 的镜像，可以节省搭建时间，而搭建时间也是计费的。

**公共节点的安全注意事项：**

在任何远程网络上租用机器，你访问的都是陌生人拥有并实际掌控的硬件。虚拟化层能提供一定程度的隔离，但你仍需保持应有的谨慎：

1. **不要在远程机器上存放私钥。** 用于其他系统的 SSH 密钥、云服务凭据和生产环境的 API 令牌，都不应出现在租用节点上。

2. **把文件系统当作不可信环境。** 假设你写入磁盘的任何内容，在你断开连接后理论上都可能被主机方恢复。我们会在第 6 步介绍安全删除的步骤。

3. **传输敏感数据时要加密。** 我们在第 3 步讲这一点。

4. **不要重复使用密码。** 如果租用界面提供了默认凭据，请立即修改，或者生成一对新的 SSH 密钥。

租用确认后，控制台会给出连接信息。你会拿到一条类似下面的 SSH 命令：

```bash
ssh -p 22345 user@203.0.113.42
```

打开本地终端，执行这条命令。出现提示时接受主机密钥指纹。现在你已经连上了租来的 GPU 节点。

确认硬件和你下单的一致：

```bash
nvidia-smi
```

输出中应能看到你租用的 GPU、显存容量和已安装的驱动版本。如果没有显示 GPU，或者配置与订单不符，请立即断开连接，并通过市场平台的客服报告问题。

## 第 2 步：配置环境

SSH 连接确认无误后，下一件事是搭建一个干净的 Python 环境。大多数租用节点都预装了 NVIDIA 驱动和 CUDA 工具包，但如果依赖主机系统级的 Python 包，很容易引发依赖冲突，排查起来要耗上好几个小时。

我们会创建一个隔离的虚拟环境，保证可复现和稳定。

执行以下命令创建工作目录：

```bash
mkdir ~/llama3-finetune
cd ~/llama3-finetune
python3 -m venv venv
source venv/bin/activate
```

终端提示符现在应显示 `(venv)`，说明虚拟环境已激活。之后安装的所有包都会装在这个目录里，不影响主机系统。

安装 Python 包之前，先确认 CUDA 工具包可用：

```bash
nvcc --version
```

记下 CUDA 版本号，后面要用它确保与 PyTorch 兼容。大多数租用节点运行的是 CUDA 11.8 或 12.1。如果找不到 `nvcc`，可能是 CUDA 工具包不在 PATH 中。通常加载对应的环境文件就能解决：

```bash
source /etc/profile.d/cuda.sh
```

如果这个文件不存在，请查阅市场平台针对你所用节点配置的文档。

接下来安装 PyTorch 生态。下面的命令安装支持 CUDA 12.1 的 PyTorch。如果节点的 CUDA 版本不同，请调整版本后缀：

```bash
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121
```

然后安装高效微调所需的库。我们使用 Hugging Face 生态，配合 bitsandbytes 做量化、PEFT 做参数高效训练：

```bash
pip install transformers==4.40.0 datasets==2.19.0 peft==0.10.0 bitsandbytes==0.43.1 trl==0.8.6 accelerate==0.29.0
```

**锁定版本很重要。** 截至本文写作时，上面这些版本经过测试且相互兼容。Hugging Face 生态更新很快，不锁定版本的安装经常引入破坏性变更。如果遇到导入错误或异常行为，版本不匹配是最可能的原因。

最后，登录 Hugging Face。Llama-3 的权重受许可协议限制，需要 Hugging Face 账户才能下载。访问 [Meta Llama-3 仓库](https://huggingface.co)并接受许可条款，然后在 Hugging Face 设置页面生成一个访问令牌。

运行登录命令：

```bash
huggingface-cli login
```

出现提示时粘贴你的访问令牌。令牌保存在 `~/.cache/huggingface/token`。现在你已获得授权，可以把受限模型的权重直接下载到租用节点。

![终端中显示 Llama-3 模型配置参数的 Python 代码](../_images/python-llama3-config.png)

## 第 3 步：安全传输数据

这一节要解决的，正是你租机器而不是调用 API 的首要原因：数据主权。

标准的云端流程是先把数据集上传到存储桶（S3、Google Cloud Storage、Azure Blob），再下载到计算实例。这样一来，你的敏感数据会在多个不受你控制的系统中留下副本。存储服务商能访问，计算服务商也能访问，双方都会记录你的操作日志。

我们用直接加密传输，完全绕开这一环。

SSH 协议自带 `scp`（Secure Copy Protocol），它通过你登录终端所用的同一条加密通道传输文件。数据直接从你的本地机器传到租用节点，不经过任何中间存储。

在你的**本地电脑**上打开一个**新的终端窗口**，不要关闭已有的租用节点 SSH 会话。执行下面的命令，把文件路径和连接信息换成你自己的：

```bash
scp -P 22345 /path/to/your/dataset.jsonl user@203.0.113.42:~/llama3-finetune/
```

`-P` 参数指定端口号（注意是大写 P，和 ssh 的小写 `-p` 不同）。数据集较大时，传输可能需要几分钟，你会看到显示已传输字节数的进度输出。

**数据集超过 1GB 时**，可以考虑先压缩再传输：

```bash
# On your local machine
gzip -k dataset.jsonl
scp -P 22345 dataset.jsonl.gz user@203.0.113.42:~/llama3-finetune/

# Then on the remote node
cd ~/llama3-finetune
gunzip dataset.jsonl.gz
```

**更多安全措施：**

如果你的威胁模型中包括高水平的攻击者，可以在传输前用 GPG 或 age 加密数据集。这样多了一层防护：即使传输过程被截获，内容也无法读取。

```bash
# On your local machine (using age encryption)
age -p dataset.jsonl > dataset.jsonl.age
scp -P 22345 dataset.jsonl.age user@203.0.113.42:~/llama3-finetune/

# On the remote node
age -d dataset.jsonl.age > dataset.jsonl
rm dataset.jsonl.age
```

对大多数用户来说，标准的 SCP 传输已经足够安全。SSH 协议使用 AES-256 加密，主机密钥校验可以防止中间人攻击，你的数据也不会经过任何第三方存储系统。

## 第 4 步：微调脚本

我们使用 TRL（Transformer Reinforcement Learning）库的 `SFTTrainer` 类进行监督微调。这个库封装了大量复杂细节，同时仍可按生产负载的需要灵活配置。

编写训练脚本之前，你需要先了解数据集应采用的格式。

**数据集格式要求：**

脚本需要一个 JSONL（JSON Lines）文件，每行是一个包含 `text` 字段的合法 JSON 对象。`text` 字段应包含一条完整的训练样本，格式化为单个字符串。

下面是三行格式正确的示例：

```json
{"text": "### Instruction: Summarize the following legal clause in plain English.\n\n### Input: Party A shall indemnify, defend, and hold harmless Party B from any claims, damages, or expenses arising from Party A's negligence or willful misconduct.\n\n### Response: Party A agrees to protect Party B from any legal claims or costs that result from Party A's mistakes or intentional wrongdoing."}
{"text": "### Instruction: Extract the key financial metrics from this earnings report.\n\n### Input: Q3 revenue reached $4.2B, up 12% YoY. Operating margin improved to 23.5% from 21.2%. Free cash flow was $890M.\n\n### Response: Revenue: $4.2 billion (12% year-over-year growth). Operating margin: 23.5% (up from 21.2%). Free cash flow: $890 million."}
{"text": "### Instruction: Identify potential HIPAA violations in this process description.\n\n### Input: Patient records are emailed to the billing department as PDF attachments. The billing staff prints these for manual review and shreds them after processing.\n\n### Response: Potential violations include: unencrypted email transmission of PHI, physical documents that may be visible to unauthorized personnel during processing, and lack of documented chain of custody. Recommend encrypted file transfer and on-screen review only."}
```

**格式要点：**

1. 每个 JSON 对象必须恰好占一行，不能有多行 JSON。
2. `text` 字段中的换行必须转义为 `\n`。
3. 文本中的双引号必须转义为 `\"`。
4. 文件必须使用 UTF-8 编码。

如果你的原始数据是其他格式（CSV、Parquet，或指令和回答分列存放），需要在传输前预处理成这种结构。Python 的 `json` 库会自动处理转义：

```python
import json

with open('dataset.jsonl', 'w') as f:
    for example in your_data:
        text = f"### Instruction: {example['instruction']}\n\n### Input: {example['input']}\n\n### Response: {example['output']}"
        f.write(json.dumps({"text": text}) + '\n')
```

数据集就位后，在远程节点上创建训练脚本：

```bash
cd ~/llama3-finetune
nano train.py
```

粘贴以下配置。这个脚本使用 QLoRA，在 24GB GPU 的显存限制内微调 8B 参数模型。示例使用 Llama-3.1-8B，修改 MODEL_NAME 变量即可换成任何兼容的模型：

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

按 `Ctrl+O` 保存文件，再按 `Ctrl+X` 退出。

**关键参数说明：**

- **LORA_RANK（r=16）：** 控制微调适配器的表达能力。值越高，学到的越多，但占用的显存也越多。常用值在 8 到 64 之间。

- **LORA_ALPHA（16）：** LoRA 权重的缩放系数。常见的经验做法是把它设成与秩相同。

- **MAX_SEQ_LENGTH（512）：** 训练样本的最大 token 长度。序列越长，占用显存越多。遇到 OOM（显存不足）错误时，优先降低这个值。

- **BATCH_SIZE（4）：** 同时处理的样本数。显存不够时降到 2 或 1。

- **target_modules：** 注入 LoRA 适配器的具体层。对 Llama-3 来说，注意力投影层（q、k、v、o）效果最好。

开始训练，执行：

```bash
python train.py
```

脚本会先下载基础模型权重（8B 模型约 16GB）。这只需要一次，之后的运行会使用缓存的权重。加载完成后，你会看到训练进度，每 10 步输出一次 loss 值。

## 第 5 步：监控训练过程

训练脚本运行期间，你需要监控 GPU 的状态。一旦显存占满或温度超过安全阈值，进程就会崩溃，可能损坏检查点，白白浪费租用时间。

在本地机器上再打开一个终端窗口，与租用节点建立另一个 SSH 连接：

```bash
ssh -p 22345 user@203.0.113.42
```

执行以下命令，实时查看 GPU 状态：

```bash
watch -n 1 nvidia-smi
```

![终端中显示 GPU 显存占用和温度数据的 nvidia-smi 输出](../_images/nvidia-smi-monitoring.png)

这个工具每秒刷新一次，显示显存占用、GPU 利用率和温度。在 RTX 4090 上运行本指南的配置时，你应该看到：

- **显存占用：** 可用 24GB 中占用 18GB 到 22GB
- **GPU 利用率：** 训练进行中为 90% 到 100%
- **温度：** 60°C 到 80°C，取决于主机的散热方案

**常见问题排查：**

**显存接近 24GB：** 如果显存占用持续顶到上限，把训练脚本中的 `BATCH_SIZE` 参数降到 2 或 1，或者把 `MAX_SEQ_LENGTH` 降到 256。无论改哪项，都需要重新开始训练。

**GPU 利用率接近 0%：** 这通常说明数据加载成了瓶颈，CPU 喂数据的速度跟不上 GPU。在配备 NVMe 的节点上这种情况较少，但数据集非常大时仍可能出现。可以考虑在传输前把数据集预处理成更高效的格式（Arrow/Parquet）。

**温度超过 85°C：** 有些主机把 GPU 放在通风很差的机箱里。长时间高温可能触发降频，拖慢训练。如果温度持续超过 85°C，可以考虑终止租用，换一个节点。硬件损坏是主机方的问题，但浪费的时间和损坏的检查点是你的损失。

**如何解读 loss 曲线：**

训练脚本每 10 步输出一次 loss 值。这个数字表示模型的预测"错"得有多厉害，越低越好。你应该观察到：

- **初始 loss：** 通常在 1.5 到 3.0 之间，视数据集而定
- **趋势：** 在最初几百步内稳步下降
- **最终 loss：** 配置得当的训练通常在 0.5 到 1.5 之间

如果 loss 一开始就停滞不动（100 步后仍未下降），可能是学习率太低。如果 loss 剧烈震荡或不断上升，说明学习率太高。默认值 `2e-4` 对大多数数据集都适用，但有时需要调整。

如果 loss 平稳下降后突然飙升到很高的值（10 以上），数据集里很可能有格式错误的样本。停止训练，检查 JSONL 文件中是否有编码错误或没有正确转义的字符，然后重新开始。

在 RTX 4090 上，1,000 条样本的典型微调需要 30 到 60 分钟。数据集更大时，时间大致线性增长：10,000 条样本需要 5 到 10 小时。

## 第 6 步：取回模型并清理环境

训练完成后，微调得到的权重以 LoRA 适配器的形式保存在 `OUTPUT_NAME` 指定的目录中。与完整的 16GB 基础模型相比，这个适配器很小，通常只有 100MB 到 500MB。

先确认适配器文件已经生成：

```bash
ls -la ~/llama3-finetune/llama-3-8b-custom/
```

你应该能看到 `adapter_config.json`、`adapter_model.safetensors` 以及分词器相关文件。

**不要在租用节点上合并适配器。** 合并是把 LoRA 权重与基础模型结合，生成一个独立的微调模型。这个操作需要把完整的 16 位基础模型加载进内存，可能超出 24GB 显卡的可用显存。请在你自己的基础设施上合并，或者在推理时直接把适配器和基础模型一起加载。PEFT 库可以无缝处理这一点：

```python
from peft import PeftModel
from transformers import AutoModelForCausalLM

base_model = AutoModelForCausalLM.from_pretrained(
    "meta-llama/Llama-3.1-8B",
    device_map="auto",
)
model = PeftModel.from_pretrained(base_model, "./llama-3-8b-custom")
```

要下载适配器，回到你的**本地终端**（不是 SSH 会话），执行：

```bash
scp -r -P 22345 user@203.0.113.42:~/llama3-finetune/llama-3-8b-custom ./
```

`-r` 参数用于递归复制整个目录。核对本地文件大小与远程一致，确认传输成功。

**清理远程环境：**

这一步是专业人士和业余玩家的分水岭。你的租用节点上现在有你的私有数据集、训练代码和缓存的模型权重。把这些东西留在一台不受你控制的机器上，违背了最基本的操作安全原则。

回到租用节点的 SSH 会话，执行以下命令：

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

如果节点上有 `shred`，并且你想进一步确保删除的文件无法恢复：

```bash
# Secure deletion (slower but more thorough)
find ~/llama3-finetune -type f -exec shred -u {} \;
rm -rf ~/llama3-finetune
```

断开 SSH 会话：

```bash
exit
```

回到市场平台的控制台，终止租用，连同所有存储卷一起删除，以免继续计费。

## 用微调后的模型做推理

适配器下载到本地机器后，你就可以在不依赖任何云服务的情况下进行推理。下面是一个最简示例：

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

生产部署时，可以考虑用 FastAPI 或 Flask 把它封装成 API，或者通过 vLLM、Text Generation Inference（TGI）等推理服务器部署。我们在 [RTX 4090 上的 Ollama vs vLLM vs TGI 对比](/zh_cn/ollama-vs-vllm-vs-tgi-rtx-4090-benchmark/)中比较过它们。

## 结语

你已经用私有数据微调了一个大语言模型，同时让这些数据只在一台机器上停留尽可能短的时间。整个过程没有签企业合同，也没有把知识产权交给任何科技公司。

假设在 RTX 4090 上以每小时 0.45 美元训练两小时，这次操作的总成本是 90 美分。AWS 上一张 A10G 每小时约 1.01 美元，所以训练本身在那边也不算贵。差别在于配额申请和环境搭建。

更重要的是，你的数据集从未经过任何存储服务，而且在你完成训练后已从租用的机器上删除。

依赖闭源 API 的时代正在结束。需要隐私的组织、重视数据主权的研究者、想要掌控权的开发者，现在都有了另一种选择。租用 GPU 把基础设施、成本和数据重新交回到他们手中。

你微调好的模型现在就在你掌控的硬件上。如何部署、谁能访问、用于什么目的，全由你一个人决定。

---

## 延伸阅读

本指南介绍了私有化微调大模型的核心流程。以下资源对相关话题有更深入的讨论：

**了解成本：**

- [2026 年 GPU 租用价格对比](/zh_cn/gpu-rental-pricing-comparison-2026/)：各大市场平台与大型云厂商的成本分析
- [租用 GPU 的真实成本](/zh_cn/hidden-fees-in-gpu-rental/)：价格页面不会告诉你的成本因素

**入门：**

- [2026 年租用 GPU 需要准备什么](/zh_cn/what-you-need-to-rent-a-gpu/)：各平台的注册、验证和付款方式
- [如何在公共 GPU 节点上保护你的数据集](/zh_cn/how-to-secure-dataset-on-public-gpu-node/)：训练前、训练中和训练后的安全做法

**方案对比：**

- [RunPod 与 Vast.ai 对比](/zh_cn/runpod-vs-vastapi-comparison/)：两大市场平台有何不同
- [GPUFlow vs Vast.ai vs RunPod vs SaladCloud](/zh_cn/gpuflow-vs-vast-ai-vs-runpod/)：整机、容器与 API 密钥三种方式的对比
