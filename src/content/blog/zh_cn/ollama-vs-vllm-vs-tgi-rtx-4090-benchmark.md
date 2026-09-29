---
title: "Ollama vs vLLM vs TGI：RTX 4090 推理性能实测（实测数据，非宣传口径）"
description: "在 RTX 4090 上对 Ollama、vLLM 和 Hugging Face TGI 进行受控基准测试，对比 Llama‑3.1‑8B 推理的吞吐量、延迟、显存占用和每 token 成本。"
excerpt: "在单张 RTX 4090 上用 Llama‑3.1‑8B 实测 Ollama、vLLM 和 TGI。真实的吞吐量、真实的延迟、真实的成本影响。"
pubDate: 2026-02-25
updatedDate: 2026-09-29
locale: "zh_cn"
category: "benchmarks"
featured: false
draft: false
author: "GPUFlow Team"
heroImage: "../_images/rtx4090-inference-benchmark-hero.png"
heroImageAlt: "终端中显示的 RTX 4090 GPU 推理基准测试及各项性能指标"
faq:
  - question: "在 RTX 4090 上跑 Llama-3.1-8B，哪个推理服务器最快？"
    answer: "在 RTX 4090 上的 FP16 实测中，vLLM 在并发负载下的持续吞吐量最高，8 路并发时约为每秒 185 到 215 个 token。同等条件下，TGI 为每秒 150 到 176 个 token，Ollama 平均为每秒 95 到 108 个 token。"

  - question: "vLLM 比 Ollama 或 TGI 更占显存吗？"
    answer: "以 FP16 部署 Llama-3.1-8B 时，vLLM 占用约 20 到 22GB 显存，TGI 与之相近，为 21 到 23GB。Ollama 总体占用更少，一般在 14 到 17GB 之间，但在并发负载下达不到同样的吞吐量。"

  - question: "Ollama 适合用于生产环境推理吗？"
    answer: "Ollama 适合开发环境和低并发的内部工具。测试中，在 8 路并发请求下，它的扩展效率不如 vLLM 和 TGI。对于流量持续的生产 API，针对连续批处理优化的推理服务器通常效率更高。"

  - question: "在 RTX 4090 上运行 Llama-3.1-8B 推理要花多少钱？"
    answer: "按每小时约 0.45 美元的平均租金计算，用 vLLM 生成 50 万个 token 大约需要 41 到 42 分钟，花费约 0.31 美元。同样的负载用 Ollama 大约需要 83 到 84 分钟，花费约 0.63 美元。实际成本取决于负载和租用价格。"

  - question: "本次基准测试使用了什么提示词和生成参数？"
    answer: "测试使用 512 个 token 的输入提示词，每个请求生成 128 个 token，采用贪心解码，temperature 设为零。所有测量均在模型预热后进行，8 路并发请求，未启用推测解码。"

  - question: "我能自己复现这个 RTX 4090 推理基准测试吗？"
    answer: "可以。文中列出了硬件规格、CUDA 版本、驱动版本、解码参数和并发配置。在单张 RTX 4090 上以 FP16 部署 Llama-3.1-8B，并使用相同的提示词长度和并发设置，就能得到相近的结果。"
---

自己跑模型，只是完成了一半。

完成微调之后（详见我们的 [私有 LLM 微调指南](/zh_cn/private-llm-fine-tuning-guide/)），接下来要做的是运维层面的决定：怎样高效地对外提供模型推理服务？

推理决定了：

- 每 token 成本
- 负载下的延迟
- GPU 利用效率
- 消费级硬件能否用于生产

本次基准测试对比三种常用的推理方案：

- Ollama
- vLLM
- Hugging Face Text Generation Inference（TGI）

目的不是比喜好，而是拿数据说话。

---

## 测试环境

**硬件**

- GPU：NVIDIA RTX 4090（24GB 显存）
- CPU：16 核 Ryzen 级消费级处理器
- 内存：64GB DDR5
- 存储：NVMe SSD
- CUDA：12.1
- NVIDIA 驱动：550+

**模型**

- `meta-llama/Llama-3.1-8B`
- 精度：FP16（未做 4 位量化）
- 上下文窗口：4096 个 token

**测试条件**

- 输入提示词 512 个 token
- 输出生成 128 个 token
- 贪心解码（temperature = 0）
- 不使用推测解码
- 不使用张量并行
- 仅热启动（测量前已预加载模型）
- 8 路并发请求（在支持的情况下）

所有测试都在干净的机器上执行，没有后台负载。每项数据取五次运行的平均值。

---

![终端中显示的 RTX 4090 推理基准测试结构化指标](../_images/rtx4090-inference-terminal-results.png)

---

# 测试结果

## 1. Ollama

Ollama 主打简单。安装步骤极少，模型会自动下载。

```bash
ollama run llama3
```

批处理行为和调度策略几乎没有可配置的地方。

### 实测性能（RTX 4090，FP16）

- **单路吞吐量：** 62–74 token/秒
- **8 路吞吐量：** 95–108 token/秒
- **首 token 延迟：** 720–980 毫秒
- **实测显存占用：** 14–17GB

### 观察

- 并发时 GPU 利用率波动较大。
- 超过 4 路之后，吞吐量不再线性增长。
- 没有提供高级批处理优化的配置项。

Ollama 用于本地开发和低流量服务时表现稳定。但在持续的并发负载下，它无法把 GPU 完全跑满。

---

## 2. vLLM

vLLM 为吞吐量而设计。它的 PagedAttention 实现提高了并发请求下 KV 缓存的效率。

安装：

```bash
pip install vllm
```

启动：

```bash
python -m vllm.entrypoints.openai.api_server \
  --model meta-llama/Llama-3.1-8B \
  --dtype float16
```

### 实测性能（RTX 4090，FP16）

- **单路吞吐量：** 92–104 token/秒
- **8 路吞吐量：** 185–215 token/秒
- **首 token 延迟：** 360–480 毫秒
- **实测显存占用：** 20–22GB

### 观察

- 负载下 GPU 利用率保持在 95% 以上。
- 连续批处理提升了扩展效率。
- 多路并发时延迟保持稳定。

在每小时租用时间内，vLLM 的持续吞吐量最高。

---

## 3. Hugging Face Text Generation Inference（TGI）

TGI 是一个容器化的生产级推理服务器。

```bash
docker run --gpus all \
  -p 8080:80 \
  ghcr.io/huggingface/text-generation-inference:latest \
  --model-id meta-llama/Llama-3.1-8B
```

### 实测性能（RTX 4090，FP16）

- **单路吞吐量：** 78–88 token/秒
- **8 路吞吐量：** 150–176 token/秒
- **首 token 延迟：** 510–690 毫秒
- **实测显存占用：** 21–23GB

### 观察

- 性能稳定，表现可预期。
- 吞吐量扩展优于 Ollama，但不及 vLLM。
- 由于依赖容器运行时，运维开销更大。

TGI 提供了生产所需的控制和监控功能，但没能从单张 4090 上榨出最大吞吐量。

---

![nvidia-smi 输出，显示并发推理期间的 GPU 利用率](../_images/rtx4090-nvidia-smi-inference-load.png)

---

# 直接对比

| 方案   | 单路        | 8 路        | 首 token    | 显存    | GPU 饱和度 |
| ------ | ----------- | ----------- | ----------- | ------- | ---------- |
| Ollama | 62–74 t/s   | 95–108 t/s  | 720–980ms   | 14–17GB | 部分       |
| TGI    | 78–88 t/s   | 150–176 t/s | 510–690ms   | 21–23GB | 高         |
| vLLM   | 92–104 t/s  | 185–215 t/s | 360–480ms   | 20–22GB | 很高       |

---

# 租用 GPU 的成本影响

2026 年 9 月，在各 GPU 算力市场上租一张 RTX 4090 大约每小时 0.30–0.46 美元，具体取决于平台和需求。详细分析请参阅：

- [2026 年 GPU 租用价格对比](/zh_cn/gpu-rental-pricing-comparison-2026/)
- [租用 GPU 的真实成本](/zh_cn/hidden-fees-in-gpu-rental/)

假设：

- 租金每小时 0.45 美元
- 生成 500,000 个 token
- 8 路并发

按实测吞吐量的中位数计算：

**vLLM（约 200 token/秒）**  
500,000 / 200 = 2,500 秒 ≈ 41–42 分钟  
成本 ≈ 0.31 美元

**Ollama（约 100 token/秒）**  
500,000 / 100 = 5,000 秒 ≈ 83–84 分钟  
成本 ≈ 0.63 美元

单看这一次，成本差异并不大，但规模一上去就会成倍放大。

每天 5,000 万 token 的量级下，吞吐效率会直接影响 GPU 集群规模和租用时长。

## 自己跑这个基准测试

要复现这些数据，你需要一台自己能控制的机器，才能安装和配置各个推理服务器。Vast.ai、RunPod 这类出租带 SSH 访问的容器的算力市场都可以。

如果你只是想在 RTX 4090 上试试 Ollama 部署的模型，而不想做任何配置，[GPUFlow](https://gpuflow.app/zh-CN/marketplace) 上的提供方运行着 Ollama，你通过一个 OpenAI 兼容的 API 密钥租用访问权限，按秒计费。在那里无法更换推理服务器，所以它适合使用模型，而不适合对推理服务器做基准测试。

由于按小时计费，推理效率直接影响成本。在持续负载下，每秒 100 个 token 和每秒 200 个 token 的差别就很可观了。

---

# 部署考量

如果你按小时租用 GPU，推理效率直接决定成本效率。具体计算见 [按小时租 GPU 还是按 token 付费调用 API](/zh_cn/hourly-gpu-vs-per-token-api/)。

吞吐量影响：

- 一个任务需要租多少小时
- 你的流量需要多少块 GPU
- 受主机不稳定影响的程度
- 运营利润空间

只要搭配高效的推理方案，消费级 GPU 跑 7B–8B 模型在经济上依然可行。

---

# 各方案的适用场景

**Ollama**

- 内部工具
- 低并发
- 快速原型开发

**TGI**

- 容器化环境
- 需要结构化日志的团队
- 托管式生产部署

**vLLM**

- API 服务
- 高并发
- 每美元产出最多 token

---

# 结论

在单张 RTX 4090 上以 FP16 运行 Llama‑3.1‑8B：

- vLLM 的持续吞吐量最高。
- TGI 性能均衡，并提供生产级控制功能。
- Ollama 更看重简单易用，而不是最大化 GPU 利用率。

推理方案的选择不是表面功夫，它决定了成本结构和扩展能力。

对于部署在租用消费级 GPU 上的负载，批处理效率会实实在在地影响经济性。

# 在生产环境中去哪里跑

本文所有基准测试都是在租用的消费级硬件上完成的，而不是自有基础设施。

如果要微调或运行自己的推理服务器，就租一台能登录的机器。如果想通过 API 使用 Ollama 部署的模型、什么都不用配置，可以看看 [GPUFlow](https://gpuflow.app/zh-CN/marketplace)：租用按秒计费，用银行卡购买的额度支付。

### 相关资源

**深入了解部署技术栈：**

- [在租用 GPU 上进行私有 LLM 微调终极指南](/zh_cn/private-llm-fine-tuning-guide/)：安全训练开源权重模型的完整流程
- [2026 年 GPU 租用价格对比](/zh_cn/gpu-rental-pricing-comparison-2026/)：主流 GPU 租用平台的成本差异
- [租用 GPU 的真实成本](/zh_cn/hidden-fees-in-gpu-rental/)：按小时计价页面没有告诉你的事
- [RunPod 与 Vast.ai 对比](/zh_cn/runpod-vs-vastapi-comparison/)：集中式与市场型基础设施的差异
