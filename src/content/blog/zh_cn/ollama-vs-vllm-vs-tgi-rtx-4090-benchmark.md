---
title: "RTX 4090 上的 Ollama、vLLM 与 TGI：基准测试说明了什么"
description: "在 RTX 4090 上用 Ollama、vLLM 和 Hugging Face TGI 运行 8B 模型：有出处的负载吞吐量、显存占用、量化、OpenAI 兼容 API，以及 TGI 的维护状态。"
excerpt: "一次只处理一个请求时，这几个推理引擎在 RTX 4090 上速度差不多。多个用户同时请求时，vLLM 遥遥领先。TGI 现已进入维护模式。本文给出公开发布的数据、出处和选择建议。"
pubDate: 2026-02-25
updatedDate: 2026-09-30
locale: "zh_cn"
category: "benchmarks"
featured: false
draft: false
author: "GPUFlow Team"
heroImage: "../_images/rtx4090-inference-benchmark-hero.png"
heroImageAlt: "终端上显示的 RTX 4090 GPU 推理基准测试及性能指标"
faq:
  - question: "在 RTX 4090 上 vLLM 比 Ollama 快吗？"
    answer: "只有在多个请求同时运行时才快。在 ComputingForGeeks 2026 年 9 月用 4-bit Qwen2.5-7B 做的测试中，单个请求时两者在 RTX 4090 上都是每秒约 174 个 token。64 个请求同时进行时，vLLM 的总吞吐量达到每秒 6,623 个 token，Ollama 为 2,018。"
  - question: "Hugging Face TGI 还在维护吗？"
    answer: "只做少量维护。TGI 文档说明它已进入维护模式，只接受小的 bug 修复和文档改动；GitHub 仓库已于 2026 年 3 月 21 日归档为只读。Hugging Face 推荐改用 vLLM 或 SGLang，本地使用则推荐 llama.cpp 和 MLX。"
  - question: "vLLM 跑 8B 模型要占多少显存？"
    answer: "vLLM 默认占用 GPU 显存的 90%（gpu-memory-utilization 0.9），在 24 GB 的 RTX 4090 上约为 21.6 GB，与模型大小无关。权重用不完的部分都变成 KV 缓存，供并发请求使用。"
  - question: "Ollama 能同时服务多个用户吗？"
    answer: "能，但默认每个模型一次只处理一个请求（OLLAMA_NUM_PARALLEL=1）。你可以调高这个值，每个并行槽位都会额外占用一份上下文内存。公开的基准测试显示，在高并发下 Ollama 的扩展性不如 vLLM。"
  - question: "Ollama、vLLM 和 TGI 都有 OpenAI 兼容 API 吗？"
    answer: "都有。三者都提供 /v1/chat/completions。Ollama 和 vLLM 还提供 completions、embeddings 和 Responses API；TGI 的 OpenAI 兼容 Messages API 从 1.4.0 版起就有了。"
  - question: "24 GB 的 GPU 能用 FP16 跑 Llama 3.1 8B 吗？"
    answer: "能。80.3 亿个参数、每个 2 字节，权重约 16.1 GB，放进 24 GB 显存后还能留出一块不大的 KV 缓存。在单块消费级显卡上部署的人，大多用 4-bit 或 8-bit 权重，为上下文和并发用户留出更多空间。"
---

在单块 RTX 4090 上部署 7B–8B 模型时，如果一次只处理一个请求，Ollama 和 vLLM 的速度差不多。差距出现在大量请求同时到达的时候：在 2026 年 9 月公开的一项 64 个并发请求的测试中，vLLM 的总吞吐量约为 Ollama 的三倍。Hugging Face TGI 仍然能用，但自 2026 年 3 月仓库归档以来一直处于维护模式，Hugging Face 自己现在也建议大家用 vLLM 和 SGLang。

所以选择归结为有多少人同时访问这个模型。一个用户、一个脚本或一个小型内部工具：用 Ollama，因为最省事。公开 API 或同时有大量请求在跑的批处理任务：用 vLLM。在 TGI 上做新部署：我不会这么做。

## 数据从哪里来

本页的早期版本展示过一组吞吐量、延迟和显存数据，说是我们自己在 RTX 4090 上测得的。我们无法把它们追溯到一次可复现的运行或公开来源，所以删掉了。一个可疑之处是：旧版中单流 FP16 的数字超过了 RTX 4090 显存带宽所允许的上限（见下一节）。

下面的每个数字现在都注明了发布者，以及他们用的硬件和模型。凡是没人发布过干净的 RTX 4090 对比的（比如 TGI），我会直说，而不是去填这个空。

主要来源：

- **ComputingForGeeks，2026 年 9 月 18 日。** 在 RTX 4090、L40S 和 RTX 5090 上测试 Ollama、vLLM 和 llama.cpp。模型：Qwen2.5-7B-Instruct，vLLM 用 AWQ 4-bit，Ollama 和 llama.cpp 用 GGUF Q4_K_M。固定 512 token 的提示词，temperature 为 0，最多输出 256 个 token，每个槽位 4,096 token 上下文，64 个并行槽位。
- **Red Hat Developer，2025 年 8 月 8 日。** 在一块 A100 40 GB 上对比 Ollama 0.9.2 和 vLLM 0.9.1，模型为 FP16 的 Llama 3.1 8B Instruct，1 到 256 个并发用户，用 GuideLLM 测量。
- **BentoML，2024 年 6 月 5 日。** 在 A100 80 GB 上用 Llama 3 8B Instruct 测试 vLLM 0.4.2、TGI 2.0.4 等。
- **llama.cpp CUDA 排行榜。** Llama 2 7B Q4_0 在多款显卡（包括 RTX 4090）上的单流速度。

只有第一项是在 RTX 4090 上运行的，并且覆盖了本文讨论的除 TGI 以外的所有引擎。其他几项在数据中心显卡上呈现出同样的规律。

## 单个请求：显卡决定上限

GPU 为单个请求生成 token 时，每生成一个 token 都要从显存中读一遍模型的全部权重。所以决定上限的是显存带宽，而不是推理引擎。

RTX 4090 有 24 GB GDDR6X 显存，带宽 1,008 GB/s。Llama 3.1 8B 有 80.3 亿个参数。

- FP16 下，权重为 8.03 × 2 字节 ≈ 16.1 GB。1,008 ÷ 16.1 ≈ **每秒 63 个 token**，这是单个请求的上限。
- Ollama 默认的 `llama3.1:8b` 标签是 Q4_K_M，下载大小 4.9 GB。1,008 ÷ 4.9 ≈ **每秒 205 个 token**，这是上限。

实际引擎都达不到这些上限。llama.cpp 排行榜显示，RTX 4090 用 Q4_0 的 Llama 2 7B 每秒生成 186 个 token（开启 flash attention 时为 189）。ComputingForGeeks 用 4-bit Qwen2.5-7B 测得单个请求约每秒 174 个 token，并发现 vLLM、llama.cpp 和 Ollama 在 4090 上“大致”相同。（在 L40S 和 RTX 5090 上，他们用的 Ollama 版本解码速度只有 llama.cpp 的一半左右，所以要核对你自己的显卡和版本。）

一次只有一个用户时，按方便程度选引擎，按速度选量化方式。从 FP16 换到 4-bit，上限大约提高到三倍。换引擎几乎没有影响。

## 大量请求：批处理说了算

同时有大量请求时，GPU 可以读一次权重，用于一整批请求。这时要紧的是引擎批处理做得多好，以及它如何管理 KV 缓存（每个请求保存到目前为止对话内容的那部分内存）。

<figure>
<svg viewBox="0 0 720 310" role="img" aria-labelledby="d1-title" xmlns="http://www.w3.org/2000/svg" font-family="system-ui, sans-serif" font-size="15">
<title id="d1-title">RTX 4090 上 64 个并发请求时总吞吐量的条形图：vLLM 每秒 6,623 个 token，llama.cpp 2,391 个，Ollama 2,018 个</title>
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
<text x="410" y="256" text-anchor="middle" fill="#64748b" font-size="13">每秒输出 token 总数，64 个请求同时进行</text>
<text x="360" y="290" text-anchor="middle" fill="#1e1b4b" font-size="14">一次一个请求时：三者都约为每秒 174 个 token</text>
</svg>
<figcaption>RTX 4090，4-bit 的 Qwen2.5-7B-Instruct（vLLM 用 AWQ，其他用 GGUF Q4_K_M），64 个并发请求。数据来自 ComputingForGeeks，2026 年 9 月；条形按比例绘制。TGI 不在这次测试范围内。</figcaption>
</figure>

在 RTX 4090 上，64 个请求合计，vLLM 每秒输出 6,623 个 token，llama.cpp 的服务器 2,391 个，Ollama 2,018 个。这次测试对 Ollama 的配置是公平的：`OLLAMA_NUM_PARALLEL=64`、`num_ctx 4096`，并开启了 flash attention。vLLM 的运行参数为 `--quantization awq_marlin --max-model-len 4096 --gpu-memory-utilization 0.90`。作者还报告了首 token 延迟：llama.cpp 约 8 到 12 ms，vLLM 约 16 到 25 ms，在 L40S 和 RTX 5090 上 Ollama 最高。

Red Hat 在 A100 上用 FP16 权重做的测试结论相同。vLLM 峰值为每秒 793 个 token；默认设置下的 Ollama 只有 41 个。把 Ollama 的并行上限提高到 32（“最高的稳定值”）之后，它在任何并发水平上仍然比不上 vLLM。它的首 token 延迟“随用户增多而急剧上升”，峰值负载下 token 间延迟出现了“巨大的尖峰”。

在把这些数字转述给别人之前，有两点要注意。第一，ComputingForGeeks 的对比并非完全同等条件：vLLM 用的是 AWQ 权重，其他用的是 GGUF，构建版本也不同。第二，这些是所有请求的总和。在 vLLM 上，64 个用户每人看到的速度约为 6,623 ÷ 64 ≈ 每秒 103 个 token，仍然很好用；在 Ollama 上约为 2,018 ÷ 64 ≈ 32 个。

## TGI 的现状

Text Generation Inference 曾是 Hugging Face 的生产级推理服务器，支持连续批处理、Flash Attention 和 Paged Attention、张量并行、Prometheus 指标和 OpenTelemetry 追踪。技术上它和 vLLM 属于同一档次。

它的状态已经变了。TGI 文档现在开头就写着：“text-generation-inference 现已进入维护模式。今后我们只接受针对小的 bug 修复、文档改进和轻量维护任务的 pull request。”文档推荐“vllm、SGLang，以及 llama.cpp 或 MLX 等可互通的本地引擎”。GitHub 仓库已于 2026 年 3 月 21 日归档并设为只读。

我没有找到近期公开发布的 TGI 在 RTX 4090 上的基准测试。最接近的可靠对比是 BentoML 2024 年 6 月在 A100 80 GB 上做的：用 Llama 3 8B 时，vLLM 达到“每秒 2300-2500 个 token，与 TGI 相近”，并且在他们测试的每个并发水平上，vLLM 的首 token 延迟都最低。那是两年前的事了，两个引擎都已发布过很多版本，所以只能当历史看。

如果 TGI 已经在承载你的生产流量，它会继续工作。但做新部署的话，你选的是一个不会再支持新模型架构、也不会再做性能优化的服务器。在单块 RTX 4090 上，TGI 能做的 vLLM 都能做。

## 24 GB 显卡上的显存

几个引擎对显存的处理方式截然不同，这会影响这块卡上还能跑别的什么。

**vLLM 一上来就占掉大部分显存。** 它的 `--gpu-memory-utilization` 默认值为 0.9，所以在 24 GB 的 RTX 4090 上，不管模型多大，启动时都会占用约 21.6 GB。权重用不完的部分全部变成 KV 缓存。FP16 的 Llama 3.1 8B（约 16.1 GB）会给 KV 缓存、激活值和 CUDA graph 留下大约 5.5 GB，这就限制了上下文长度和能同时容纳的请求数。用 4-bit AWQ 权重（ComputingForGeeks 的版本约 5.6 GB），21.6 GB 中的大部分都给了 KV 缓存，它正是靠这个同时维持 64 个请求。除非调低这个比例，否则别指望在旁边再跑一个 GPU 程序。

**Ollama 按模型和上下文分配显存。** 一个 Q4_K_M 的 `llama3.1:8b` 模型是 4.9 GB，再加上其上下文窗口所需的 KV 缓存。Ollama 根据你的显存选择默认上下文：24 GiB 以下为 4k，24 到 48 GiB 为 32k，48 GiB 及以上为 256k。RTX 4090 正好卡在 24 GiB 这条线上（nvidia-smi 报告的数值略低于 24 GiB），所以用 `ollama ps` 看看你实际得到的是哪个上下文，或者自己设定。并行槽位会成倍放大这部分占用：文档中的例子是“4 个并行请求、2K 上下文，会得到 8K 上下文和额外的内存分配”。显存紧张时，KV 缓存量化有帮助：`q8_0` 占用的内存约为默认 `f16` 的一半，`q4_0` 约为四分之一。只要放得下，Ollama 默认每块 GPU 最多还能同时加载三个模型，适合一块需要在多个模型间切换的卡。8、12、16 和 24 GB 显卡各能放下哪些模型，见[哪些 AI 模型适合你的 GPU 显存](/zh_cn/which-ai-models-fit-your-gpu-vram/)。

**TGI** 和 vLLM 一样，也会为连续批处理预先分配显存。我没找到一个当前的、可引用的 8B 模型在 4090 上的显存数据，所以不给数字。

## 量化和模型格式

| | Ollama | vLLM | TGI |
| --- | --- | --- | --- |
| **主要格式** | GGUF（如 Q4_K_M） | Hugging Face safetensors | Hugging Face safetensors |
| **4-bit 选项** | GGUF Q4 系列 | AWQ、GPTQ、bitsandbytes、INT4 W4A16 | AWQ、GPTQ、Marlin、EXL2、bitsandbytes NF4/FP4 |
| **8-bit / FP8** | GGUF Q8_0 | Ada（RTX 4090）和 Hopper 上的 FP8 W8A8；INT8 | bitsandbytes 8-bit、EETQ、fp8 |
| **GGUF** | 原生 | 支持 | 未列出 |
| **KV 缓存量化** | q8_0、q4_0 | 支持 | 本文未涉及 |

RTX 4090 是 Ada 架构显卡（SM 8.9），所以 vLLM 的 FP8 路径可以在上面用。FP8 权重占用的显存是 FP16 的一半：8B 模型约 8 GB，在单块 4090 上是介于 FP16 和 4-bit 之间的折中方案。

Ollama 的模型库提供的是预先量化好的 GGUF 标签，所以你很少需要操心这件事：`ollama pull llama3.1:8b` 拿到的就是 Q4_K_M。用 vLLM 时，你要从 Hugging Face 选一个预量化的 checkpoint，或者自己传量化参数。

## OpenAI 兼容服务器和部署

三者都提供 OpenAI 风格的 HTTP API，所以 OpenAI SDK 和大多数聊天工具只要改一下 base URL 就能用。

| | Ollama | vLLM | TGI |
| --- | --- | --- | --- |
| **默认地址** | `localhost:11434/v1` | `localhost:8000/v1` | 容器端口 80（通常映射到 8080） |
| **Chat completions** | 支持 | 支持 | 支持（Messages API，1.4.0 起） |
| **其他 OpenAI 端点** | completions、models、embeddings、responses | completions、embeddings、responses、audio | 本文未涉及 |
| **安装** | 一个脚本 | pip 包 | Docker 镜像 |

按各项目自己的文档，让一个 8B 模型跑起来：

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

Ollama 是最省事的，远远领先。它负责下载、量化文件、加载和卸载，在笔记本和租来的服务器上用法完全一样。Ollama 的 OpenAI 兼容层有缺口：chat completions 不支持 `logprobs` 和 `tool_choice`，图片必须用 base64，不能用 URL。vLLM 需要一套能用的 CUDA 和 Python 环境，要调的参数也更多，但它是 Hugging Face 现在推荐用来替代 TGI 的引擎。如果你已经在用 Docker，TGI 很容易上手，只是有上面说的维护问题。

## 什么任务用什么引擎

**Ollama** 适合一个人使用、一个脚本、一个编程助手、只有几个用户的内部工具，或者需要在多个模型间切换的机器。几分钟就能部署好，在 4090 上的单请求速度不输任何引擎。

**vLLM** 适合大量请求同时到达的场景：公开 API、多用户聊天产品，或者可以一次跑 32 或 64 个的批处理任务。公开数据显示，在 RTX 4090 上 64 个并发请求时，它的总吞吐量约为 Ollama 的三倍，在 A100 上差距更大。它支持的量化方式和 API 也最全。

**TGI** 只在你已经在用的情况下继续用。新项目的话，Hugging Face 自己的建议是 vLLM 或 SGLang。

按小时租用时，成本取决于吞吐量。以一块每小时 $0.31 的 RTX 4090（getdeploying.com 在 2026 年 9 月列出的 Vast.ai 最低按需价格）生成一百万个输出 token 为例，使用 ComputingForGeeks 的数据：

- 一次一个请求，每秒 174 个 token：1,000,000 ÷ 174 ≈ 5,750 秒 ≈ 1.6 小时 ≈ **$0.50**。
- Ollama 上 64 个请求同时进行，每秒 2,018 个 token：≈ 496 秒 ≈ **$0.04**。
- vLLM 上 64 个请求同时进行，每秒 6,623 个 token：≈ 151 秒 ≈ **$0.01**。

这些都假设 GPU 一直满负荷。如果你任何时候都只有一个请求在跑，批处理对你毫无帮助，选哪个引擎也不会改变账单。如果你有一队任务在排着，账单能差一个数量级。同样的逻辑与按 token 计费 API 的比较，见[按小时租 GPU 还是按 token 调 API](/zh_cn/hourly-gpu-vs-per-token-api/)。

## GPUFlow 的定位

GPUFlow 的提供商安装程序默认装的是 Ollama，GPUFlow 代理把请求转发给它，所以上面 Ollama 那一列通常就是 GPUFlow 上适用的情况。你租用的是一个 OpenAI 兼容 API 密钥（`https://gpuflow.app/v1`，提供 `/v1/chat/completions` 和 `/v1/models`，支持流式输出），对应提供商 GPU 上的一个模型。你按时间付费，按秒计费、最低 1 分钟，不按 token 收费。

在 GPUFlow 上你不能做的事：选择引擎、修改引擎设置，或运行自己的代码。没有 SSH，也没有 shell。要复现上面的基准测试或自己运行 vLLM，请在 Vast.ai 或 RunPod 上租一台能登录的机器（[两者对比](/zh_cn/runpod-vs-vastapi-comparison/)）。要在应用里直接使用 Ollama 提供的模型、什么都不用装，请看 [GPUFlow 市场](https://gpuflow.app/zh-CN/marketplace)和[如何在常用工具中使用 API 密钥](/zh_cn/use-openai-compatible-api-key-in-apps/)。

如果你微调了自己的模型，正在考虑怎么部署，[私有 LLM 微调指南](/zh_cn/private-llm-fine-tuning-guide/)讲的是这之前的一步。

## 资料来源

均于 2026 年 9 月核实。

- RTX 4090、L40S 和 RTX 5090 上的 Ollama、vLLM 与 llama.cpp 对比：[ComputingForGeeks](https://computingforgeeks.com/ollama-vs-vllm-vs-llama-cpp/)（2026 年 9 月 18 日）
- A100 40 GB 上的 Ollama 与 vLLM 对比：[Red Hat Developer](https://developers.redhat.com/articles/2025/08/08/ollama-vs-vllm-deep-dive-performance-benchmarking)（2025 年 8 月 8 日）
- A100 80 GB 上的 vLLM、TGI 等：[BentoML，Benchmarking LLM Inference Backends](https://www.bentoml.com/blog/benchmarking-llm-inference-backends)（2024 年 6 月 5 日）
- llama.cpp CUDA 排行榜：[github.com/ggml-org/llama.cpp/discussions/15013](https://github.com/ggml-org/llama.cpp/discussions/15013)
- RTX 4090 显存和带宽：[TechPowerUp 评测](https://www.techpowerup.com/review/nvidia-geforce-rtx-4090-founders-edition/)
- Llama 3.1 8B 参数量和许可证：[Hugging Face 模型卡](https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct)
- Ollama：[FAQ（并行请求、KV 缓存）](https://docs.ollama.com/faq)、[上下文长度](https://docs.ollama.com/context-length)、[OpenAI 兼容性](https://docs.ollama.com/api/openai-compatibility)、[llama3.1:8b 标签](https://ollama.com/library/llama3.1:8b)
- vLLM：[OpenAI 兼容服务器](https://docs.vllm.ai/en/latest/serving/online_serving/openai_compatible_server/)、[量化](https://docs.vllm.ai/en/latest/features/quantization/index.html)、[引擎参数（gpu-memory-utilization）](https://docs.vllm.ai/en/v0.6.4/models/engine_args.html)
- TGI：[文档和维护公告](https://huggingface.co/docs/text-generation-inference/en/index)、[GitHub 仓库（已归档）](https://github.com/huggingface/text-generation-inference)、[Messages API](https://huggingface.co/docs/text-generation-inference/en/messages_api)、[量化](https://huggingface.co/docs/text-generation-inference/en/conceptual/quantization)
- RTX 4090 租用价格：[getdeploying.com](https://getdeploying.com/reference/cloud-gpu/nvidia-rtx-4090)
- GPUFlow：[API 快速入门](https://docs.gpuflow.app/zh-cn/renters/api-quickstart/)、[提供商入门](https://docs.gpuflow.app/zh-cn/providers/getting-started/)
