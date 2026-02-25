---
title: "Ollama vs vLLM vs TGI：RTX 4090 推理基准测试（实测数据，而非宣传）"
description: "在 RTX 4090 上针对 Llama‑3.1‑8B 进行的受控基准测试，对比 Ollama、vLLM 与 Hugging Face TGI 的吞吐量、延迟、VRAM 使用量与每 token 成本。"
excerpt: "在单张 RTX 4090 上使用 Llama‑3.1‑8B 对 Ollama、vLLM 与 TGI 进行实测对比。真实吞吐量、真实延迟、真实成本影响。"
pubDate: 2026-02-25
updatedDate: 2026-02-25
locale: "zh_cn"
category: "benchmarks"
featured: false
draft: false
author: "GPUFlow Team"
heroImage: "../_images/rtx4090-inference-benchmark-hero.png"
heroImageAlt: "终端中显示 RTX 4090 GPU 推理基准测试与性能指标"
faq:
  - question: "在 RTX 4090 上运行 Llama-3.1-8B 时，哪个推理服务器最快？"
    answer: "在 RTX 4090 上进行的 FP16 实测中，vLLM 在并发负载下实现了最高的持续吞吐量，在 8 个流下达到约 185–215 tokens/秒。TGI 的吞吐量为 150–176 tokens/秒，而 Ollama 在相同条件下平均为 95–108 tokens/秒。"

  - question: "vLLM 是否比 Ollama 或 TGI 占用更多 VRAM？"
    answer: "在以 FP16 部署 Llama-3.1-8B 时，vLLM 使用约 20–22GB 的 VRAM。TGI 的使用范围相近，为 21–23GB。Ollama 整体使用更少的 VRAM，通常在 14–17GB 之间，但在并发负载下未达到相同吞吐水平。"

  - question: "Ollama 适合用于生产环境的推理负载吗？"
    answer: "Ollama 适用于开发环境和低并发的内部工具。在测试中，在 8 个并发请求流下，其扩展效率不如 vLLM 或 TGI。对于具有持续流量的生产 API，通常选择针对 continuous batching 优化的服务器更为高效。"

  - question: "在 RTX 4090 上运行 Llama-3.1-8B 推理的成本是多少？"
    answer: "在平均租用价格约为 0.45 美元/小时的情况下，使用 vLLM 生成 500,000 tokens 需要约 41–42 分钟，成本约为 0.31 美元。使用 Ollama 在相同负载下需要约 83–84 分钟，成本约为 0.63 美元。实际成本会根据负载和租用价格有所变化。"

  - question: "本次基准测试使用了哪些提示与生成参数？"
    answer: "本测试使用 512 token 的输入提示，并为每个请求生成 128 tokens，采用 greedy decoding，temperature 设为 0。所有测量均在模型预热后进行，使用 8 个并发请求流，且未启用 speculative decoding。"

  - question: "我可以自行复现这个 RTX 4090 推理基准测试吗？"
    answer: "可以。本文包含硬件规格、CUDA 版本、驱动版本、解码参数与并发配置。只需在单张 RTX 4090 上以 FP16 部署 Llama-3.1-8B，并匹配提示长度与并发设置，即可获得相近结果。"
---

````

运行自己的模型，只完成了一半。

在完成 fine‑tuning 之后——详见我们的[去中心化 GPU 私有 LLM 微调指南](/zh_cn/private-llm-fine-tuning-guide)——接下来的问题是运维层面：如何高效地提供模型推理服务？

推理决定：

- 每 token 成本
- 负载下的延迟
- GPU 利用效率
- 消费级硬件是否可用于生产环境

本次基准测试比较三种主流推理栈：

- Ollama
- vLLM
- Hugging Face Text Generation Inference（TGI）

目标不是偏好。
目标是测量。

---

## 测试环境

**硬件**

- GPU：NVIDIA RTX 4090（24GB VRAM）
- CPU：16 核 Ryzen 级别消费级处理器
- 内存：64GB DDR5
- 存储：NVMe SSD
- CUDA：12.1
- NVIDIA Driver：550+

**模型**

- `meta-llama/Llama-3.1-8B`
- 精度：FP16（未使用 4‑bit 量化）
- 上下文窗口：4096 tokens

**基准测试条件**

- 512 token 输入提示
- 128 token 输出生成
- Greedy decoding（temperature = 0）
- 未启用 speculative decoding
- 未启用 tensor parallelism
- 仅 warm start（测量前模型已加载）
- 8 个并发请求流（支持时）

所有测试均在无后台负载的干净环境中进行。
每项数据为 5 次运行的平均值。

---

![RTX 4090 上显示结构化推理基准指标的终端截图](../_images/rtx4090-inference-terminal-results.png)

---

# 测试结果

## 1. Ollama

Ollama 强调简洁。安装过程简单，模型自动下载。

```bash
ollama run llama3
````

对批处理行为或调度策略的配置较为有限。

### 实测性能（RTX 4090，FP16）

- **单流吞吐量：** 62–74 tokens/秒
- **8 流吞吐量：** 95–108 tokens/秒
- **首 token 延迟：** 720–980 ms
- **观察到的 VRAM 使用量：** 14–17GB

### 观察

- 并发情况下 GPU 利用率波动明显。
- 超过 4 个流后，吞吐扩展呈非线性。
- 无高级批处理优化控制接口。

Ollama 适合本地开发与低流量服务。在持续并发负载下，无法完全压榨 GPU。

---

## 2. vLLM

vLLM 以高吞吐为设计目标。其 PagedAttention 实现提升了并发请求下的 KV cache 效率。

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

- **单流吞吐量：** 92–104 tokens/秒
- **8 流吞吐量：** 185–215 tokens/秒
- **首 token 延迟：** 360–480 ms
- **观察到的 VRAM 使用量：** 20–22GB

### 观察

- 负载下 GPU 利用率保持在 95% 以上。
- Continuous batching 提升扩展效率。
- 并发流之间延迟保持稳定。

在按小时租用成本下，vLLM 实现了最高的持续吞吐量。

---

## 3. Hugging Face Text Generation Inference（TGI）

TGI 是面向生产环境的容器化推理服务器。

```bash
docker run --gpus all \
  -p 8080:80 \
  ghcr.io/huggingface/text-generation-inference:latest \
  --model-id meta-llama/Llama-3.1-8B
```

### 实测性能（RTX 4090，FP16）

- **单流吞吐量：** 78–88 tokens/秒
- **8 流吞吐量：** 150–176 tokens/秒
- **首 token 延迟：** 510–690 ms
- **观察到的 VRAM 使用量：** 21–23GB

### 观察

- 性能稳定且可预测。
- 扩展优于 Ollama，但低于 vLLM。
- 由于容器运行环境，存在额外运维开销。

TGI 提供生产级控制与监控能力，但未能在单张 4090 上实现最大吞吐。

---

![并发推理期间的 nvidia-smi GPU 利用率输出](../_images/rtx4090-nvidia-smi-inference-load.png)

---

# 直接对比

| 栈     | 单流       | 8 流        | 首 token 延迟 | VRAM    | GPU 饱和度 |
| ------ | ---------- | ----------- | ------------- | ------- | ---------- |
| Ollama | 62–74 t/s  | 95–108 t/s  | 720–980ms     | 14–17GB | 部分       |
| TGI    | 78–88 t/s  | 150–176 t/s | 510–690ms     | 21–23GB | 高         |
| vLLM   | 92–104 t/s | 185–215 t/s | 360–480ms     | 20–22GB | 非常高     |

# 去中心化 GPU 上的成本影响

在去中心化算力市场中，RTX 4090 的租用价格通常在 0.40–0.50 美元/小时之间，具体取决于供需情况。详细拆解可参考：

- [GPU 租用价格对比 2026](/zh_cn/gpu-rental-pricing-comparison-2026)
- [GPU 租用中的隐藏费用](/zh_cn/hidden-fees-in-gpu-rental)

假设：

- 租金 0.45 美元/小时
- 生成 500,000 tokens
- 8 个并发流

按照实测中位吞吐量计算：

**vLLM（约 200 tokens/秒）**  
500,000 / 200 = 2,500 秒 ≈ 41–42 分钟  
成本 ≈ 0.31 美元

**Ollama（约 100 tokens/秒）**  
500,000 / 100 = 5,000 秒 ≈ 83–84 分钟  
成本 ≈ 0.63 美元

单次差异并不显著。  
规模扩大后差异会累积。

当每日处理 5,000 万 tokens 时，吞吐效率将直接影响 GPU 数量与租用时长。

## 自行复现本次基准测试

如果希望在不购买硬件的情况下复现这些结果，通常可以通过 GPUFlow 市场获取 RTX 4090 节点。

机器按小时租用，连接钱包后即可立即使用。无需账户审批、企业合同或长时间排队部署。

可在 [GPU Flow](https://gpuflow.app) 浏览可用 GPU。

由于按小时计费，推理效率会直接影响成本。100 tokens/秒 与 200 tokens/秒 的差异，在持续负载下具有实际经济意义。

---

# 部署背景

如果你正在租用去中心化 GPU —— 如下文所述：

- [如何在无需 KYC 的情况下租用 GPU](/zh_cn/how-to-rent-gpu-without-kyc)
- [使用加密货币租用 GPU](/zh_cn/rent-gpu-with-crypto)
- [智能合约托管机制详解](/zh_cn/smart-contract-escrow)

—— 那么推理效率将直接决定资金使用效率。

吞吐量影响：

- 托管（escrow）持续时间
- 区块链结算频率
- 对主机不稳定性的暴露程度
- 运营利润空间

在配合高效推理栈的前提下，消费级 GPU 在 7B–8B 模型场景下仍具备经济可行性。

---

# 各方案适用场景

**Ollama**

- 内部工具
- 低并发需求
- 快速原型开发

**TGI**

- 容器化环境
- 需要结构化日志的团队
- 受控的生产部署

**vLLM**

- API 服务
- 高并发场景
- 追求单位成本最大 token 产出

---

# 结论

在单张 RTX 4090 上以 FP16 运行 Llama‑3.1‑8B：

- vLLM 实现了最高的持续吞吐量。
- TGI 提供了平衡的性能与生产控制能力。
- Ollama 优先考虑简洁性，而非最大化 GPU 利用率。

推理栈的选择并非表面差异。  
它决定成本结构与扩展能力。

对于部署在去中心化消费级 GPU 上的工作负载，批处理效率会实质性影响整体经济性。

# 在生产环境中的运行位置

本文所有基准测试均在租用的消费级硬件上完成，而非自有基础设施。

如果你需要立即使用 RTX 4090、RTX 3090 或更大显存的 GPU 进行推理或 fine‑tuning，可在 [GPU Flow](https://gpuflow.app) 获取节点。

## 按小时租用。使用稳定币支付。连接钱包后立即访问。

### 相关阅读

**深入了解你的部署架构：**

- [去中心化 GPU 上的私有 LLM 微调终极指南](/zh_cn/private-llm-fine-tuning-guide) — 安全训练开源权重模型的完整流程
- [GPU 租用价格对比 2026](/zh_cn/gpu-rental-pricing-comparison-2026) — 主流 GPU 租用平台的实测成本差异
- [GPU 租用中的隐藏费用](/zh_cn/hidden-fees-in-gpu-rental) — 每小时价格页面未披露的内容
- [RunPod 与 Vast.ai 对比](/zh_cn/runpod-vs-vastapi-comparison) — 中心化基础设施与市场模式的差异
