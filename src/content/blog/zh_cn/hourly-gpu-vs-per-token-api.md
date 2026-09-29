---
title: "按小时租 GPU 还是按 token 调 API？运行 7B–8B 模型的真实成本"
description: "按小时租用消费级 GPU 与按 token 付费调用 AI API 的直观成本对比，附当前价格、实测速度，以及 1,000 次请求的完整计算示例。"
excerpt: "按 token 计费的 API 和按小时计费的 GPU 用的是不同的计价单位。我们把两者换算到同一个任务上，看看各自在什么情况下更便宜。"
pubDate: 2026-09-29
locale: "zh_cn"
category: "comparisons"
featured: false
draft: false
author: "GPUFlow Team"
heroImage: "../_images/hourly-gpu-vs-per-token-api-hero.png"
heroImageAlt: "图表中一条代表按小时计费的水平线和一条代表按 token 计费的上升线"
faq:
  - question: "按小时租 GPU 比按 token 计费的 API 便宜吗？"
    answer: "要看跟谁比。对于 Llama 3.1 8B 这类热门开源模型，托管的按 token API 更便宜：DeepInfra 每百万输入 token 收 $0.02，每百万输出 token 收 $0.04。如果对比的是 gpt-5-mini（每百万输出 token $2.00）或 Claude Haiku 4.5（$5.00），那么租用 RTX 3060 到 RTX 5090 中的任意一块运行开源 7B–8B 模型，只要让它持续满载，每个 token 的成本都更低。如果对比的是 gpt-4o-mini（$0.60），只有 RTX 3060 这类较便宜的卡明显占优。"
  - question: "RTX 4090 运行 8B 模型每秒能生成多少 token？"
    answer: "Hardware Corner 实测，RTX 4090 运行 4-bit 量化的 Qwen3 8B、16K 上下文、单个请求时，速度为每秒 104 个 token。llama.cpp 的性能排行榜显示，更小的 Llama 2 7B 在 Q4_0 量化、短上下文下可达每秒 186 个 token。"
  - question: "在租来的 RTX 4090 上生成一百万个输出 token 要多少钱？"
    answer: "按每小时 $0.35、每秒约 104 个 token 计算，一小时大约生成 376,000 个 token，所以一百万个输出 token 大约花费 $0.93 的 GPU 时间。读取提示词比生成回答快得多，因此输入 token 几乎不增加成本。"
  - question: "什么情况下按小时租 GPU 比调用 API 更合适？"
    answer: "你需要的模型没有按 token 计费的服务（比如你自己微调的模型、社区模型或特定的量化版本）；你希望按小时固定付费，而不是按 token 计量；或者你对比的是每百万输出 token 收费 $2 或更高的闭源模型。"
---

为 Llama 3.1 8B、Qwen 2.5 7B 这类开源小模型付费，常见的方式有两种：

- **按 token 付费**：由某家公司托管模型，你发送和接收的每个 token 都要计费。
- **按小时付费**：你租一块运行该模型的 GPU，按时长付费，用多少 token 都一样。

两边的价格看起来根本没法比：一边是“每百万 token $0.04”，另一边是“每小时 $0.35”。本文把两者换算到同一个单位，并用一个贴近实际的任务算一遍。所有价格均于 2026 年 9 月核实，出处附在文末。

## 第 1 步：消费级 GPU 生成得有多快？

关键指标是 GPU 处理单个请求时每秒生成多少 token。我们采用 Hardware Corner 的实测数据，他们在 llama.cpp（Ollama 底层用的就是这个引擎）中测试了 4-bit 量化（Q4_K_XL）、16K 上下文的 Qwen3 8B。

| GPU | 每秒 token 数（单个请求） | 每小时 token 数 |
| --- | --- | --- |
| RTX 3060 12 GB | 42 | 约 151,000 |
| RTX 3090 | 87 | 约 315,000 |
| RTX 4090 | 104 | 约 376,000 |
| RTX 5090 | 145 | 约 523,000 |

提示词短的话速度会更快。llama.cpp 项目自己的性能排行榜使用更小的 Llama 2 7B（Q4_0）和短上下文，同样这四块卡的成绩是每秒 76、158、186 和 290 个 token。我们采用更低、也更贴近实际的那组数字。

读取提示词比生成回答快得多。同一个排行榜显示，RTX 3060 处理提示词的速度约为每秒 2,100 个 token，RTX 4090 约为每秒 12,000 个。所以在按小时计费的 GPU 上，长提示词几乎不会多花时间。

## 第 2 步：把小时价换算成每百万 token 的价格

用小时价除以每小时 token 数即可。我们采用 2026 年 9 月 GPU 租用网站上常见的按需价格：

| GPU | 每小时价格 | 每 100 万输出 token 成本（GPU 满载） |
| --- | --- | --- |
| RTX 3060 12 GB | $0.06 | 约 $0.40 |
| RTX 3090 | $0.20 | 约 $0.64 |
| RTX 4090 | $0.35 | 约 $0.93 |
| RTX 5090 | $0.55 | 约 $1.05 |

关键在“满载”二字。这些数字的前提是 GPU 整个小时都在生成。如果有一半时间空闲，每个 token 的成本就翻倍。

## 第 3 步：按 token 计费的 API 收多少钱

每百万 token 的价格，输入 / 输出：

| 模型 | 服务商 | 输入 | 输出 |
| --- | --- | --- | --- |
| Llama 3.1 8B Instruct Turbo | DeepInfra | $0.02 | $0.04 |
| Gemma 3 12B | DeepInfra | $0.05 | $0.15 |
| Qwen3.5 9B | DeepInfra | $0.10 | $0.15 |
| gpt-4o-mini | OpenAI | $0.15 | $0.60 |
| gpt-5-mini | OpenAI | $0.25 | $2.00 |
| Claude Haiku 4.5 | Anthropic | $1.00 | $5.00 |

有两点很明显：一是托管的开源模型非常便宜；二是闭源小模型每个输出 token 的价格，是最便宜的开源 8B 模型的 15 到 125 倍。

## 第 4 步：同一个任务，各种方式的价格

假设你要跑 1,000 次请求。每次发送 1,500 个 token（指令加一份文档），返回 500 个 token。合计输入 150 万 token，输出 50 万 token。

| 方案 | 完成任务的成本 | 备注 |
| --- | --- | --- |
| DeepInfra 上的 Llama 3.1 8B | 约 $0.05 | 最便宜，优势明显 |
| gpt-4o-mini | 约 $0.53 | |
| gpt-5-mini | 约 $1.38 | |
| Claude Haiku 4.5 | 约 $4.00 | |
| 租用 RTX 3060，逐个处理请求 | 约 $0.21 | 约 3.5 小时 |
| 租用 RTX 3090 | 约 $0.33 | 约 1.7 小时 |
| 租用 RTX 4090 | 约 $0.48 | 约 1.4 小时 |
| 租用 RTX 5090 | 约 $0.54 | 约 1 小时 |

GPU 数字的算法：50 万输出 token 除以第 1 步的生成速度，加上 150 万提示词 token 除以 llama.cpp 排行榜中的提示词处理速度，再乘以小时价。

## 结论

**如果有托管 API 提供你想要的开源模型，那它就是最便宜的运行方式**。以 Llama 3.1 8B 为例，按小时租的任何 GPU 都无法接近每百万输出 token $0.04 的价格。

**和大多数闭源小模型相比，按小时租 GPU 更便宜，前提是开源模型能胜任你的任务**。满载的 RTX 3060 每个输出 token 的成本低于 gpt-4o-mini，RTX 3090 则大致持平；如果像上面的任务那样把输入 token 也算进去，两者都更便宜。表中每一块卡都比 gpt-5-mini 和 Claude Haiku 便宜。7B–8B 开源模型的回答质量够不够用，取决于具体任务：分类、字段提取、摘要和短文改写通常没问题，长链推理则相对较弱。

**以下情况适合按小时租 GPU：**

- 你需要的模型没有任何按 token 计费的 API 提供：你自己微调的模型、社区模型或特定的量化版本。
- 你希望按小时固定付费，而不是按用量计费，比如在测试阶段或者通宵跑批处理任务时。
- 你的提示词很长。在按小时租用的 GPU 上，输入 token 只占用读取它们的那几秒钟。
- 你想在自己买卡之前，先在真实硬件上试试某个模型。

**以下情况适合按 token 付费：**

- 你的流量是突发式的，中间间隔很长。等待期间不用付任何费用。
- 你需要同时处理大量请求。单块消费级 GPU 默认一次只处理一个请求：Ollama 的 `OLLAMA_NUM_PARALLEL` 默认值为 1。
- 你想要的模型有托管服务，而且你对价格满意。

## 两种方式都要考虑隐私

使用按 token 计费的 API，你的提示词会发给 API 服务商。使用租来的 GPU，提示词会发到你租的那台机器上。以 GPUFlow 为例，模型运行在提供商自己的电脑上，因此提示词和回答都会经过这台机器。我们的文档写得很清楚：不要发送密码、银行卡号，或任何你不愿告诉陌生人的内容。如果数据确实敏感，这两种方式都替代不了在自己的硬件上运行模型。

## 如何在 GPUFlow 上实测

在 GPUFlow 上，你按小时数租用 GPU，并获得一个用法和 OpenAI 密钥一样的 API 密钥。按秒计费，如果提前结束，未用完的时间会退回你的额度。要测出你自己的每 token 成本：

1. 租用一块运行目标模型的 GPU，时长 1 小时。
2. 用你的密钥把脚本指向 `https://gpuflow.app/v1`（[操作方法](https://docs.gpuflow.app/zh-cn/renters/api-quickstart/)）。
3. 统计返回的 token 数，用你支付的金额除以它。

十分钟的真实流量，比任何表格都更能说明问题。

## 相关文章

- [GPU 租用的真实成本：小时价之外还要付哪些钱](/zh_cn/hidden-fees-in-gpu-rental/)
- [如何在 Open WebUI、Continue、LangChain 等工具中使用 OpenAI 兼容 API 密钥](/zh_cn/use-openai-compatible-api-key-in-apps/)
- [Ollama、vLLM 与 TGI 对比：RTX 4090 推理基准测试](/zh_cn/ollama-vs-vllm-vs-tgi-rtx-4090-benchmark/)

## 资料来源

均于 2026 年 9 月核实。

- GPU 速度，Qwen3 8B Q4_K_XL，16K 上下文：[Hardware Corner GPU 排行](https://www.hardware-corner.net/gpu-ranking-local-llm/)（2025 年 12 月 9 日更新）
- llama.cpp CUDA 性能排行榜，Llama 2 7B Q4_0：[github.com/ggml-org/llama.cpp/discussions/15013](https://github.com/ggml-org/llama.cpp/discussions/15013)
- Ollama 并行请求：[docs.ollama.com/faq](https://docs.ollama.com/faq)
- DeepInfra 价格：[deepinfra.com/pricing](https://deepinfra.com/pricing)
- OpenAI 价格：[gpt-4o-mini](https://developers.openai.com/api/docs/models/gpt-4o-mini)、[gpt-5-mini](https://developers.openai.com/api/docs/models/gpt-5-mini)
- Anthropic 价格：[platform.claude.com 价格](https://platform.claude.com/docs/en/about-claude/pricing)
- GPU 租用价格区间：[GPUFlow 文档：如何为你的 GPU 定价](https://docs.gpuflow.app/zh-cn/providers/pricing/)
