---
title: "在租用的 GPU 上私密微调 LLM：实用指南"
description: "什么时候微调比 RAG 或改提示词更合适，各尺寸模型的 QLoRA 显存需求，TRL、Unsloth 和 Axolotl，在租用 GPU 上保护数据隐私，以及成本和部署。"
excerpt: "一个 8B 开源模型的 QLoRA 微调，一块租来的 24 GB GPU 就能跑，每次约 $0.35 到 $0.83。花钱之前，先确认微调是不是对的办法，再想清楚数据放在别人的机器上时怎样保证不外泄。"
pubDate: 2025-02-23
updatedDate: 2026-09-30
locale: "zh_cn"
category: "tutorials"
featured: false
draft: false
author: "GPUFlow Team"
heroImage: "../_images/private-llm-fine-tuning-guide-hero.png"
heroImageAlt: "插图：用一份私有数据集在租用的 GPU 服务器上微调语言模型"
faq:
  - question: "微调 7B 或 8B 模型需要多少显存？"
    answer: "用 QLoRA 时，Unsloth 的需求表列出 7B 模型约需 5 GB、8B 模型约需 6 GB；普通的 16 位 LoRA 分别约需 19 GB 和 22 GB。实际训练要为更长的序列和更大的批次留出余量，所以 RTX 3090 或 4090 这类 24 GB 显卡是宽裕的选择。"
  - question: "该用微调还是 RAG？"
    answer: "模型需要你文档里的事实，尤其是会变化的事实时，用 RAG。Ovadia 等人 2024 年的研究发现，在补充知识方面，RAG 一直优于无监督微调。当你需要稳定的格式、语气或窄任务行为，而提示词又做不到稳定时，再微调。"
  - question: "在租用的 GPU 上微调 LLM 要花多少钱？"
    answer: "用 2,000 条样本对 8B 模型做一次 QLoRA 训练，连同准备工作一个多小时：在每小时 $0.31 的 Vast.ai RTX 4090 上约 $0.35，按 RunPod 每小时 $0.74 的标价约 $0.83（2026 年 9 月）。20,000 条样本的训练约需四小时，即 $1.24 到 $2.97。"
  - question: "GPU 主机能看到我的训练数据吗？"
    answer: "硬件归主机所有，所以要假定对方能看到。容器隔离保护你不受其他租用者影响，但防不了机器的主人。敏感数据请使用经过审核的数据中心主机（Vast.ai Secure Cloud、RunPod Secure Cloud），上传前删掉个人数据，用完后删除实例。"
  - question: "LoRA 和 QLoRA 有什么区别？"
    answer: "LoRA 冻结基础模型，只训练小的适配器矩阵。QLoRA 做法相同，但把冻结的基础模型以 4 位 NF4 精度加载；在原始论文中，这让显存省到了能在一块 48 GB GPU 上微调 65B 模型的程度。"
  - question: "能在 GPUFlow 上微调或上传自己的模型吗？"
    answer: "不能。GPUFlow 只做推理：你租用的是 OpenAI 兼容聊天 API，背后是提供商在自己机器上安装的模型，通常用 Ollama 运行。没有 shell，也不能访问文件，所以既不能在上面训练，也不能上传自己的模型。"
---

用 QLoRA 在你自己的数据上微调一个 8B 开放权重模型，一块租来的 24 GB GPU 就够，一次典型的训练花费不到一美元。更难的问题要先回答：微调到底是不是对的办法（要补充事实，通常检索更好），以及数据放在别人的机器上时，怎样保证它不外泄。

本文先讲这两点，再讲各尺寸模型需要的显存、当前的工具、一个能跑的训练脚本、一个成本算例，以及怎样部署训练结果。所有内容均于 2026 年 9 月核实，出处附在文末。

## 微调、RAG 还是改进提示词

微调改变的是模型的行为，拿它来教模型事实效果很差。Ovadia 等人比较了两者在知识注入方面的表现，发现 RAG“一直优于”无监督微调，“无论是训练中见过的已有知识，还是全新的知识”。他们的结论是：LLM 很难通过微调学到新事实。

所以租任何东西之前，先把下面这棵决策树走一遍：

<figure>
<svg viewBox="0 0 720 420" role="img" aria-labelledby="d1-title" xmlns="http://www.w3.org/2000/svg" font-family="system-ui, sans-serif" font-size="15">
<title id="d1-title">决策树：在检索、改进提示词、微调和更大的模型之间做选择</title>
<defs><marker id="d1-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#64748b"/></marker></defs>
<rect width="720" height="420" fill="#ffffff"/>
<rect x="60" y="15" width="280" height="40" rx="8" fill="#1e1b4b"/>
<text x="200" y="40" text-anchor="middle" fill="#ffffff">回答不够好</text>
<line x1="200" y1="55" x2="200" y2="83" stroke="#64748b" stroke-width="2" marker-end="url(#d1-arrow)"/>
<rect x="20" y="85" width="360" height="50" rx="8" fill="#ffffff" stroke="#f97316" stroke-width="2"/>
<text x="200" y="115" text-anchor="middle" fill="#1e1b4b">缺少事实，或者数据经常变化？</text>
<rect x="440" y="80" width="260" height="60" rx="10" fill="#f0fdf4" stroke="#16a34a" stroke-width="2"/>
<text x="570" y="105" text-anchor="middle" fill="#1e1b4b" font-weight="600">用 RAG</text>
<text x="570" y="126" text-anchor="middle" fill="#64748b" font-size="13">每次请求时检索你的文档</text>
<line x1="380" y1="110" x2="438" y2="110" stroke="#64748b" stroke-width="2" marker-end="url(#d1-arrow)"/>
<text x="409" y="102" text-anchor="middle" fill="#16a34a" font-size="13">是</text>
<line x1="200" y1="135" x2="200" y2="173" stroke="#64748b" stroke-width="2" marker-end="url(#d1-arrow)"/>
<text x="215" y="160" fill="#64748b" font-size="13">否</text>
<rect x="20" y="175" width="360" height="50" rx="8" fill="#ffffff" stroke="#f97316" stroke-width="2"/>
<text x="200" y="205" text-anchor="middle" fill="#1e1b4b">指令和示例能解决吗？</text>
<rect x="440" y="170" width="260" height="60" rx="10" fill="#f0fdf4" stroke="#16a34a" stroke-width="2"/>
<text x="570" y="195" text-anchor="middle" fill="#1e1b4b" font-weight="600">改进提示词</text>
<text x="570" y="216" text-anchor="middle" fill="#64748b" font-size="13">系统提示词、少样本示例</text>
<line x1="380" y1="200" x2="438" y2="200" stroke="#64748b" stroke-width="2" marker-end="url(#d1-arrow)"/>
<text x="409" y="192" text-anchor="middle" fill="#16a34a" font-size="13">是</text>
<line x1="200" y1="225" x2="200" y2="263" stroke="#64748b" stroke-width="2" marker-end="url(#d1-arrow)"/>
<text x="215" y="250" fill="#64748b" font-size="13">否</text>
<rect x="20" y="265" width="360" height="50" rx="8" fill="#ffffff" stroke="#f97316" stroke-width="2"/>
<text x="200" y="295" text-anchor="middle" fill="#1e1b4b">需要固定的格式、语气或技能？</text>
<rect x="440" y="260" width="260" height="60" rx="10" fill="#eef2ff" stroke="#6366f1" stroke-width="2"/>
<text x="570" y="285" text-anchor="middle" fill="#1e1b4b" font-weight="600">用 QLoRA 微调</text>
<text x="570" y="306" text-anchor="middle" fill="#64748b" font-size="13">几百条高质量样本</text>
<line x1="380" y1="290" x2="438" y2="290" stroke="#64748b" stroke-width="2" marker-end="url(#d1-arrow)"/>
<text x="409" y="282" text-anchor="middle" fill="#16a34a" font-size="13">是</text>
<line x1="200" y1="315" x2="200" y2="353" stroke="#64748b" stroke-width="2" marker-end="url(#d1-arrow)"/>
<text x="215" y="340" fill="#64748b" font-size="13">否</text>
<rect x="60" y="355" width="280" height="50" rx="10" fill="#f8fafc" stroke="#64748b" stroke-width="2"/>
<text x="200" y="385" text-anchor="middle" fill="#1e1b4b">换一个更大的基础模型</text>
<text x="570" y="370" text-anchor="middle" fill="#64748b" font-size="13">RAG 和微调可以结合使用：</text>
<text x="570" y="390" text-anchor="middle" fill="#64748b" font-size="13">行为靠微调，事实靠检索</text>
</svg>
<figcaption>大多数“模型不了解我们的东西”的问题，其实是检索问题。当你需要每次都一样的行为时，微调才物有所值：固定的 JSON schema、公司的文风、一套分类方案。</figcaption>
</figure>

值得微调的理由：

- **严格的输出格式。** 每次调用都把字段按你的 schema 提取出来，而不用在每条提示词里塞一页说明。
- **风格和语气。** 让客服回复听起来像你的团队写的，或者让报告保持固定结构。
- **用小模型做窄任务。** 一个调过的 8B 模型可以在某一项工作上替代大型通用模型，在廉价硬件上部署时这一点很重要。
- **更短的提示词。** 学进权重里的行为，不用在每次请求中重复。

## LoRA 和 QLoRA

全量微调会更新所有权重，所以 GPU 除了模型本身，还要为每个权重存梯度和优化器状态。LoRA 冻结基础模型，在各层旁边训练小的低秩矩阵；原始论文报告，与用 Adam 全量微调 GPT-3 175B 相比，可训练参数减少了 10,000 倍，显存占用减少到三分之一。

QLoRA 更进一步：冻结的基础模型以 4 位 NF4 精度加载，只有适配器以 16 位训练。Dettmers 等人用它在一块 48 GB GPU 上微调了 65B 模型，“同时保持了 16 位全量微调的任务表现”。论文引入了三样工具至今仍在用的东西：NF4 数据类型、对量化常数的二次量化，以及用来吸收显存峰值的分页优化器。

两者的产物都是一个适配器，一个装着几个张量的文件夹，叠加在未改动的基础模型上使用。你可以让它单独存在，也可以合并进权重。图像模型用的也是同样的方法：一个[Stable Diffusion LoRA](/zh_cn/stable-diffusion-lora-training-under-10-dollars/)在一张租来的 24 GB 显卡上就能训练，花费远低于 $10。

## 需要多少显存

Unsloth 发布了一张按模型尺寸列出微调最低显存的表格。下面是它的数字，已包含它的显存优化；普通的 Hugging Face 训练需要更多，序列更长或批次更大时，每一行都会上升。

| 模型尺寸 | QLoRA（4 位） | LoRA（16 位） | 跑 QLoRA 绰绰有余的租用显卡 |
| --- | --- | --- | --- |
| 3B | 3.5 GB | 8 GB | 任何 12 GB 以上的显卡 |
| 8B | 6 GB | 22 GB | RTX 3090 / 4090（24 GB） |
| 14B | 8.5 GB | 33 GB | RTX 3090 / 4090（24 GB） |
| 32B | 26 GB | 76 GB | 48 GB 显卡（RTX A6000、A40、L40S） |
| 70B | 41 GB | 164 GB | 80 GB 显卡（A100、H100） |

<figure>
<svg viewBox="0 0 720 320" role="img" aria-labelledby="d2-title" xmlns="http://www.w3.org/2000/svg" font-family="system-ui, sans-serif" font-size="15">
<title id="d2-title">条形图：8B、14B、32B 和 70B 模型用 QLoRA 和 16 位 LoRA 微调的最低显存，对照 24、48 和 80 GB 显卡</title>
<rect width="720" height="320" fill="#ffffff"/>
<rect x="200" y="12" width="14" height="14" fill="#6366f1"/>
<text x="220" y="24" fill="#1e1b4b" font-size="13">QLoRA 4 位</text>
<rect x="320" y="12" width="14" height="14" fill="#eef2ff" stroke="#6366f1" stroke-width="1.5"/>
<text x="340" y="24" fill="#1e1b4b" font-size="13">LoRA 16 位</text>
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
<text x="420" y="306" text-anchor="middle" fill="#64748b" font-size="13">最低显存，单位 GB（Unsloth 需求表）</text>
</svg>
<figcaption>正是 QLoRA 让租来的消费级显卡在这里派上用场：14B 以内的模型放进 24 GB 显卡还有富余，32B 需要 48 GB 显卡，70B 需要 80 GB。不用 4 位加载的话，连 8B 在 24 GB 里都很勉强。</figcaption>
</figure>

我的默认选择是在 RTX 4090 上跑 8B 或 14B 模型。这是能为 2,048 token 序列和合理批次留出空间的最便宜的租用显卡，而且这个范围的模型事后也容易部署。按部署用的显存选基础模型，见[哪些 AI 模型适合你的 GPU 显存](/zh_cn/which-ai-models-fit-your-gpu-vram/)。

## 选工具：TRL、Unsloth 还是 Axolotl

三个都是开源的，都支持 LoRA 和 QLoRA。

| 工具 | 用法 | 优势 | 注意 |
| --- | --- | --- | --- |
| Hugging Face TRL + PEFT | Python（`SFTTrainer`） | 参考实现；同一套 API 还支持 DPO、GRPO 等 | 同样的训练，显存占用比 Unsloth 多 |
| Unsloth | Python，或 Unsloth Studio 网页界面 | 号称快 2 倍、显存少 70%；可直接导出 GGUF | Studio 界面采用 AGPL-3.0（核心为 Apache 2.0） |
| Axolotl | 一个 YAML 文件，`axolotl train config.yml` | 多 GPU（FSDP、DeepSpeed），配方丰富 | 需要 Python 3.11+ 和 PyTorch 2.11+ |

截至 2026 年 9 月，TRL 版本为 1.14，PEFT 为 0.21。Unsloth 需要 Python 3.11 到 3.13，以及 CUDA 计算能力 7.0 或更高的 NVIDIA GPU（V100、T4、RTX 20 系列及以上）。Axolotl 推荐 Python 3.12 和 PyTorch 2.12.1。

想弄懂每一行代码，用 TRL；显存紧张或想一次调用就导出 GGUF，用 Unsloth；要用不同设置反复训练或者要上多 GPU，用 Axolotl。下面的脚本用的是 TRL，因为它是把每个环节都摆在明面上的最短路径。

## 准备数据

TRL 的 `SFTTrainer` 读取的对话格式和聊天 API 请求一样。`train.jsonl` 里每行一个 JSON 对象：

```json
{"messages": [{"role": "system", "content": "Extract the invoice fields as JSON."}, {"role": "user", "content": "Invoice 4471 from Norden AB, due 12 March, total 1,250 EUR"}, {"role": "assistant", "content": "{\"invoice_id\": \"4471\", \"supplier\": \"Norden AB\", \"due\": \"2026-03-12\", \"total\": 1250, \"currency\": \"EUR\"}"}]}
```

几条实用原则：

- **质量重于数量。** 几百到几千条一致、正确的样本，胜过几万条噪声数据。数据里的每个错误，都是你花钱教给模型的行为。
- **与生产环境一致。** 使用你的应用实际会发送的系统提示词和输入格式。
- **留出 5% 到 10%。** 保留一部分模型从未训练过的样本，用来并排比较基础模型和调过的模型。
- **删掉用不上的东西。** 姓名、邮箱、账号和各种 ID 很少能帮模型学会格式。数据离开你的电脑之前，把它们换成逼真的占位符。

最后一条不仅仅关乎租来的机器。Carlini 等人从 GPT-2 中逐字提取出了数百条训练序列，包括姓名、电话号码和邮箱地址，其中有些只在一份训练文档中出现过。微调后的模型可能会把训练内容复述给之后使用它的任何人。

## 在租来的机器上保护数据隐私

在 GPU 市场上，电脑归别人所有。Vast.ai 说得很直白：“客户被隔离在非特权 Docker 容器中，只能访问自己的数据”，以及“各提供商的安全水平差别很大”。这种隔离保护你不受其他租用者影响，但防不了能接触到物理机器、在主机上拥有 root 权限的人。

处理私密数据时：

1. **选择经过审核的数据中心主机。** Vast.ai 的 Secure Cloud 提供商是“通过 ISO 27001 认证、符合 Tier 3/4 数据中心标准的经审核数据中心”，Vast 建议敏感任务使用它们。RunPod 的 Secure Cloud 运行在 T3/T4 数据中心；其 Community Cloud 则把你连接到个人提供商。数据中心层级每小时更贵，但在这里值得。
2. **只上传清理过的数据集，** 走 SSH（`rsync -avP` 或 `scp`）。中途不要放到公开存储桶或共享链接里。
3. **日志只留在本地。** 在 TRL 1.14 中，`report_to` 默认为 `"none"`，所以除非你主动开启，否则不会有数据发往实验追踪服务。不要对用私密数据训练出的适配器调用 `push_to_hub`。
4. **把结果拿出来，然后删除实例。** 下载适配器和评估输出；如果用过令牌，退出 Hugging Face 登录（`hf auth logout`）；删除实例和所有卷。在 Vast.ai 上，存储会一直保留并计费，直到实例被删除，仅停止是不够的。

在容器里删除文件，并不能保证主机的磁盘被擦除，所以真正的保护在第 1 步和第 2 步：选好由谁掌管硬件，并且尽量少给对方数据。更多细节见[如何在公共 GPU 节点上保护数据集](/zh_cn/how-to-secure-dataset-on-public-gpu-node/)。如果[你的政策禁止使用任何第三方硬件](/zh_cn/why-corporate-policies-banning-chatgpt/)，同样的脚本也能在你自己的 24 GB 显卡上运行。

## 训练：一个用 TRL 的 QLoRA 脚本

在一台装有 RTX 3090 或 4090 的租用 Linux 机器上：

```bash
python -m venv venv && source venv/bin/activate
pip install torch trl peft bitsandbytes datasets
```

然后是 `train.py`，照着 TRL 的 PEFT 文档中的 QLoRA 写法。Qwen3-8B 采用 Apache 2.0 许可证，无需申请访问，所以不需要 Hugging Face 令牌：

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

要紧的几个选择：

- **`learning_rate=2e-4`。** TRL 文档建议 QLoRA 使用约为常规微调 10 倍的学习率。如果训练损失下降而评估损失上升，就是过拟合了：减少轮数。
- **`r=16`，`target_modules="all-linear"`。** 在每个线性层上加适配器，这也是 Unsloth 基准测试使用的设置。对格式和风格来说，秩 16 就够了；任务更难时再调高。
- **`max_length=2048`。** 更长的样本会被截断。检查一下数据的 token 长度；上限越长，需要的显存越多。
- **有效批大小 16**（4 × 4 个累积步）。如果显存不够，调低 `per_device_train_batch_size`、调高累积步数，保持乘积不变。

关机之前，把留出的样本分别交给基础模型和调过的模型，比较一下结果。只有这个测试能告诉你这笔钱有没有花出效果。

## 要花多少钱

训练时间等于总 token 数除以吞吐量。托管公司 GigaGPU 公布了实测数据：在 RTX 4090 上用 QLoRA 训练 Llama 3.1 8B，约每秒 3,500 个训练 token。假设 Qwen3-8B 的速度相近：

**小规模训练：** 2,000 条样本 × 600 token × 3 轮 = 360 万 token。3,600,000 ÷ 3,500 = 1,029 秒，约 17 分钟。

| 步骤 | 时间 |
| --- | --- |
| 搭建环境 | 10 分钟 |
| 下载 Qwen3-8B（16.4 GB 权重）并上传数据 | 10 分钟 |
| 训练 | 17 分钟 |
| 在留出数据上比较基础模型和调过的模型 | 15 分钟 |
| 合并、导出、下载，删除实例 | 15 分钟 |
| **合计** | **67 分钟（1.12 小时）** |

- Vast.ai RTX 4090，每小时 $0.31：1.12 × $0.31 = **$0.35**
- RunPod RTX 4090，每小时 $0.74（价格页面标价）：1.12 × $0.74 = **$0.83**

**大规模训练：** 20,000 条样本 × 1,000 token × 2 轮 = 4,000 万 token ÷ 3,500 = 11,429 秒，约 3.2 小时。加上同样的 50 分钟额外时间，共 4.0 小时：Vast.ai 上 **$1.24**，RunPod 上 **$2.97**。

对于 32B 模型，截至 2026 年 9 月，RunPod 上 48 GB 显卡的标价为每小时 $0.49（A40）、$0.53（RTX A6000）和 $1.09（L40S）。我没有找到这些显卡上 32B QLoRA 的公开吞吐数据，所以先跑 50 步，从日志里读出每步耗时，做同样的乘法，再决定要不要跑长时间的训练。

价格为 2026 年 9 月的数字，来自 RunPod 价格页面和 getdeploying.com 对 Vast.ai 的价格追踪。Secure/数据中心层级比最便宜的社区报价贵。更全面的情况见 [GPU 租用价格对比](/zh_cn/gpu-rental-pricing-comparison-2026/)。

## 部署训练结果

有两种选择：让适配器单独存在，或者把它合并进模型。

**用 vLLM 单独加载。** vLLM 可以在基础模型旁边加载 LoRA 适配器，并在其 OpenAI 兼容服务器上把每个适配器暴露为一个模型名：

```bash
vllm serve Qwen/Qwen3-8B --enable-lora --lora-modules invoices=./out/adapter
```

客户端发送 `"model": "invoices"` 即可。多个适配器可以在一块 GPU 上共用一个基础模型。

**合并后在 Ollama 中运行。** 把适配器合并进全精度权重，用 llama.cpp 转换为 GGUF，量化，然后导入：

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

Unsloth 一次调用就能完成合并和 GGUF 导出（`model.save_pretrained_gguf("dir", tokenizer, quantization_method="q4_k_m")`）。它的文档提醒，导出后回答质量变差，最常见的原因是聊天模板不对：部署时要用训练时的模板。Ollama、vLLM 和 TGI 之间的取舍见[我们的 RTX 4090 推理基准测试](/zh_cn/ollama-vs-vllm-vs-tgi-rtx-4090-benchmark/)。

### GPUFlow 在其中的位置

GPUFlow 做不了训练：它出租的是运行在提供商 GPU 上的 OpenAI 兼容 API，没有 shell、SSH，也不能访问文件。它也不能部署你微调好的模型。租用者不能上传模型；可用的模型是各提供商自己安装的（通常用 Ollama），例如 `qwen2.5:7b` 或 `llama3.1:8b`。

它能帮上忙的是这一切之前的那一步：花几美分检查一下，一个现成的开源模型配上好的提示词是否已经能胜任，这是决策树里最便宜的结果。这一步请用测试数据，不要用本文讨论的私密数据：租用期间，提示词和回答以明文经过提供商的机器。具体用法见 [API 快速入门](https://docs.gpuflow.app/zh-cn/renters/api-quickstart/)，[在应用中使用 API 密钥](/zh_cn/use-openai-compatible-api-key-in-apps/)介绍了怎样把它接入现有工具。

## 资料来源

均于 2026 年 9 月核实。

- 论文：[Hu 等，LoRA](https://arxiv.org/abs/2106.09685)；[Dettmers 等，QLoRA](https://arxiv.org/abs/2305.14314)；[Ovadia 等，Fine-Tuning or Retrieval?](https://arxiv.org/abs/2312.05934)；[Carlini 等，Extracting Training Data from Large Language Models](https://arxiv.org/abs/2012.07805)
- Hugging Face TRL：[SFT Trainer](https://huggingface.co/docs/trl/sft_trainer)、[PEFT 集成与 QLoRA](https://huggingface.co/docs/trl/peft_integration)
- Unsloth：[需求与显存表](https://unsloth.ai/docs/get-started/fine-tuning-for-beginners/unsloth-requirements.md)、[基准测试](https://unsloth.ai/docs/basics/unsloth-benchmarks.md)、[保存为 GGUF](https://unsloth.ai/docs/basics/inference-and-deployment/saving-to-gguf.md)、[GitHub](https://github.com/unslothai/unsloth)
- [GitHub 上的 Axolotl](https://github.com/axolotl-ai-cloud/axolotl)
- 模型：[Qwen3-8B 模型卡](https://huggingface.co/Qwen/Qwen3-8B)
- 训练吞吐量：[GigaGPU，在 RTX 4090 上微调](https://gigagpu.com/rtx-4090-fine-tuning-guide/)
- 主机与安全：[Vast.ai 安全 FAQ](https://docs.vast.ai/documentation/reference/faq/security)、[Vast.ai 价格](https://docs.vast.ai/guides/instances/pricing.md)、[RunPod Pods 概览](https://docs.runpod.io/pods/overview)
- 价格：[RunPod 价格](https://www.runpod.io/pricing)，getdeploying.com 上的 [Vast.ai](https://getdeploying.com/vast-ai) 和 [RTX 4090](https://getdeploying.com/reference/cloud-gpu/nvidia-rtx-4090)
- 部署：[vLLM LoRA 适配器](https://docs.vllm.ai/en/latest/features/lora.html)、[llama.cpp quantize](https://github.com/ggml-org/llama.cpp/blob/master/tools/quantize/README.md)、[Ollama 导入](https://docs.ollama.com/import)
- GPUFlow：[API 快速入门](https://docs.gpuflow.app/zh-cn/renters/api-quickstart/)
