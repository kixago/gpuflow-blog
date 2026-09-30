---
title: "2026 年 RunPod 与 Vast.ai 对比：价格、可靠性和存储"
description: "RunPod 与 Vast.ai 对比，2026 年 9 月核实：RTX 4090 和 3090 租用价格、按秒计费、可中断 pod、存储费用、serverless，以及各自适合什么人。"
excerpt: "按 GPU 小时算，Vast.ai 通常更便宜；RunPod 更简单，存储还能跟着你在机器之间迁移。本文给出当前价格、计费规则和一个决策流程。"
pubDate: 2026-02-12
updatedDate: 2026-09-30
locale: "zh_cn"
category: "comparisons"
featured: false
draft: false
author: "GPUFlow Team"
heroImage: "../_images/runpod-vs-vastai-comparison.png"
heroImageAlt: "分屏对比图，两侧的 GPU 服务器界面分别代表 RunPod 和 Vast.ai 平台"
faq:
  - question: "租 RTX 4090，RunPod 和 Vast.ai 哪个便宜？"
    answer: "通常是 Vast.ai。2026 年 9 月，getdeploying.com 列出的 Vast.ai RTX 4090 按需价格每小时 $0.31 起，可中断 $0.21 起；RunPod Community Cloud 为 $0.34，RunPod Secure Cloud 为 $0.74。不过 Vast.ai 还收数据传输费，RunPod 不收。"
  - question: "RunPod 和 Vast.ai 按秒计费吗？"
    answer: "是的，两者的 GPU 时间都按秒计量。RunPod 的网络卷按小时计费，并且启动 pod 前账户里至少要有所选配置一小时的额度。Vast.ai 只要实例存在就收存储费，停机期间也照收。"
  - question: "已停止的 pod 或实例还花钱吗？"
    answer: "两家都花。RunPod 对已停止 pod 的卷磁盘按每 GB 每月 $0.20 收费，网络卷继续按每 GB 每月 $0.07 计费。Vast.ai 会一直按主机的存储价格收费，直到你销毁实例。"
  - question: "在 RunPod 或 Vast.ai 上余额用完会怎样？"
    answer: "RunPod 会停止带网络卷的 pod，终止没有网络卷的 pod，其数据无法恢复。Vast.ai 在余额为零时停止实例；如果没有保存银行卡来补上负余额，会销毁实例及其数据。"
  - question: "RunPod 或 Vast.ai 能用加密货币付款吗？"
    answer: "能。RunPod 接受银行卡、完成 KYC 验证后的加密货币，以及 $5,000 以上订单的发票付款。Vast.ai 通过 Stripe 接受银行卡，通过 BitPay 和 Crypto.com 接受加密货币，最低预存 $5。"
  - question: "Vast.ai 的可靠性够用于生产环境吗？"
    answer: "取决于你选的主机。Vast.ai 上每台机器的可靠性评分都从 60% 起步，随历史记录变化；Vast 推荐用于生产环境的是数据中心主机（通过 ISO 27001 认证，带蓝色标签）。RunPod Secure Cloud 运行在 T3/T4 数据中心。"
---

两者之中通常是 Vast.ai 更便宜：2026 年 9 月，那里的 RTX 4090 按需价格每小时 $0.31 起，RunPod Community Cloud 是 $0.34，RunPod Secure Cloud 是 $0.74。RunPod 的产品更简单：固定标价，数据传输免费，还有网络卷，让你的文件不依赖于任何一台机器。价格最重要、任务扛得住主机消失时选 Vast.ai；想少做决定、希望存储不绑在一台机器上时选 RunPod。

下文内容全部来自两家公司的文档和价格页面，Vast.ai 的市场价格取自 getdeploying.com，均于 2026 年 9 月核实。价格每周都在变，请当作一次快照。

## 一览

| | RunPod | Vast.ai |
| --- | --- | --- |
| **模式** | 一家公司：Secure Cloud（数据中心）和 Community Cloud（经过审核的个人主机） | 市场平台：主机从家用机器到经过认证的数据中心都有 |
| **谁定价** | RunPod，固定标价 | 每个主机自己定 |
| **计费** | 按秒；启动需要 1 小时的额度 | 按秒 |
| **RTX 4090，每小时** | Community $0.34，Secure $0.74 | 按需 $0.31 起，可中断 $0.21 起 |
| **更便宜的档位** | 竞价（可中断）pod，3 或 6 个月的节省计划 | 可中断（竞价），预留实例最高 5 折 |
| **停机存储** | 卷磁盘 $0.20/GB/月 | 按主机定价，直到你销毁实例 |
| **可迁移的存储** | 网络卷，$0.07/GB/月 | 卷绑定在一台机器上 |
| **数据传输** | 入站出站均免费 | 按主机定价，按字节计费 |
| **Serverless** | Flex worker 和 active worker | 按实例价格计费的 serverless |
| **付款** | 银行卡、加密货币（需 KYC）、$5,000 以上可开发票 | 银行卡、BitPay、Crypto.com；最低 $5 |

本文其余部分解释这些行的来历，以及它们在什么地方会让你吃亏。

## 两种不同类型的公司

**RunPod** 有两个资源池。按它自己的说法，Secure Cloud“运行在 T3/T4 数据中心”，面向生产环境和敏感数据。Community Cloud“通过经过审核的安全点对点系统，把个人算力提供者和用户连接起来”。今年有一个细节变了：RunPod 的文档现在写着它“不再接受新主机加入 Community Cloud”，不过现有的 Community 算力仍然可用。所以 RunPod 的便宜档位是一个固定的资源池，热门显卡经常售罄。

**Vast.ai** 是一个市场平台。主机上架机器、自己定价，你在其中一台上租一个 Docker 容器（或虚拟机）。机器分三个等级：未验证（新上架）、已验证（通过了 Vast 自己的测试）和数据中心。数据中心主机必须持有 ISO/IEC 27001 认证或 Tier 2/3 评级，签署托管协议，证明企业归属，并上架至少五台 GPU 服务器。这些报价带蓝色标签，构成了 Vast 所说的“Secure Cloud”。

两家公司都用“Secure Cloud”称呼自己的数据中心档位。意思差不多，但审核方式不同，所以在向合规团队做任何承诺之前，先读一下每家公司的定义。

实际使用中，两者都给你一个带 SSH 和 Jupyter 的容器。RunPod 另外支持 VS Code 和 Cursor 连接，并提供用于暴露端口的 Web 代理。日常工作（拉取镜像、挂载存储、运行脚本）在两边是一样的。

## 常见显卡的价格

每卡每小时，除特别说明外为按需价格，2026 年 9 月：

| GPU | Vast.ai | RunPod Community | RunPod Secure |
| --- | --- | --- | --- |
| RTX 3090 | 按需 $0.13，可中断 $0.08 | $0.22 | $0.50 |
| RTX 4090 | 按需 $0.31，可中断 $0.21 | $0.34 | $0.74 |

Vast.ai 的价格是 getdeploying.com 在 2026 年 9 月 30 日列出的最低报价。$0.13 的 RTX 3090 价格来自一台 8 卡机器，$0.21 的 RTX 4090 可中断价格来自加拿大的一台 4 卡机器，都是每卡价格。单卡报价有时会稍高一点。RunPod 的价格取自其价格页面和 getdeploying.com。更大的显卡方面，RunPod Secure Cloud 的价格表显示 RTX 5090 每小时 $0.99，A100 80 GB $1.59，H100 SXM $3.49。

RunPod 在 2026 年 9 月 20 日上调了 11 项 Secure Cloud 价格。RTX 4090 从 $0.69 涨到 $0.74，A100 从 $1.39 涨到 $1.59，H100 SXM 从 $2.99 涨到 $3.49。RTX 3090 和 RTX 5090 没变，Community Cloud 的价格也都没变。

### 算例

在一块 RTX 4090 上微调十小时：

- Vast.ai 按需：10 × $0.31 = $3.10，再加上主机对你传输的字节收取的费用。
- Vast.ai 可中断：10 × $0.21 = $2.10，前提是没人出价超过你。如果有人超过，你会丢掉自上一个检查点以来的时间。
- RunPod Community：10 × $0.34 = $3.40，前提是有空闲的卡。
- RunPod Secure：10 × $0.74 = $7.40。

单个任务差几美元。连续用一个月（730 小时），Vast.ai 按需是 $226，RunPod Secure 是 $540。如果你在为一个长期运行的工作负载找地方，要看的就是这个数字。

### 可中断和竞价实例

两家都出售更便宜、但可能被收回的算力。

在 Vast.ai 上，你要出价。可中断实例“可能因更高的出价而被停止”，一旦发生，“你的实例会被停止（正在运行的进程会被终止）”。Vast 称可中断实例通常比按需便宜 50% 或更多。按需实例正相反：价格由主机固定，“不会被中断”。

RunPod 称之为可中断 pod 或竞价 pod。它的 API 文档将其描述为“可以以更低的价格租用，但可能随时被停止，以便为其他 Pod 腾出资源”的 pod。RunPod 自己的博客举过一个例子：RTX A6000 竞价 $0.232，按需 $0.491。

不管在哪家，规则都一样：只用于经常保存检查点、能在另一台机器上恢复的任务。

### 承诺使用

RunPod 出售节省计划：预付 3 或 6 个月，换取 GPU 计算的折扣。节省计划不可退款，有固定的结束日期，也不覆盖存储。Vast.ai 出售预留实例，根据承诺时长最高可打 5 折。在 Vast 上，预留是针对某个主机的某台机器，所以预付之前先查一下这个主机的可靠性。

## 可靠性：数据中心与主机市场

这是两者差别最大的地方，价差也来源于此。

在 RunPod Secure Cloud 上，你租用的是一家掌控硬件和机房的公司的资源。根据 RunPod 的价格文档，按需 pod 专属于你，“不会被其他用户挤占”。在 RunPod 自己的对比表中，Community Cloud 是个人主机，可靠性“不固定”。

在 Vast.ai 上，你从上架机器的人那里租。Vast 提供了一些评判工具：

- **可靠性评分。**“衡量机器历史在线时间和健康状况的指标。所有机器都从 60% 起步。”评分在 90 多分的高段，说明有一段长期、干净的记录。
- **已验证与未验证。** 未验证的机器是新上架的，还没经过测试。
- **数据中心标签。** 经过认证的机房，Vast 推荐用于生产环境。
- **最长租期。** 每条报价都会显示主机愿意出租多长时间。一条报价“在到达结束日期或被主机下架之前……一直可用”，所以你看中的机器下个月可能就不在了。

这些年从市场平台租机器下来，我的规则是：先按可靠性筛选，再看价格，并且永远不要把任何东西的唯一副本放在主机的磁盘上。一台 $0.25、跑到一半就消失的机器，比一台 $0.35、不会消失的机器更贵。

RunPod 有一个坑值得了解。重新启动已停止的 pod 时，RunPod 会警告你“如果容量发生变化，可能会分配到零块 GPU”。你的文件还在，但那台机器上的 GPU 可能已经租给了别人。网络卷就是为此而存在的。

## 存储和停机的成本

到了存储这一块，小时价就说明不了全部问题了。GPU 不计费时，存储照样计费。

### RunPod

| 存储 | 运行时 | 停止时 |
| --- | --- | --- |
| 容器磁盘 | $0.10/GB/月 | 不收费（且会被清空） |
| 卷磁盘（/workspace） | $0.10/GB/月 | $0.20/GB/月 |
| 网络卷，1 TB 以下 | $0.07/GB/月 | $0.07/GB/月 |
| 网络卷，1 TB 以上 | $0.05/GB/月 | $0.05/GB/月 |

容器磁盘和卷磁盘按秒计费；网络卷按小时计费。容器磁盘是临时空间，pod 停止时会被清空。卷磁盘在停止后保留，但在终止时删除。网络卷独立于任何 pod，可以挂到新的 pod 上，这就解决了“重启时零块 GPU”的问题：停止，在别处启动一个新 pod，挂上同一个卷。

算例：你在会话之间保留 100 GB 的模型和检查点。放在已停止 pod 的卷磁盘上，每月是 100 × $0.20 = $20。放在网络卷上，每月是 100 × $0.07 = $7，而且不绑定在一台机器上。数据传输双向免费。

### Vast.ai

Vast 有随实例一起删除的容器存储，还有本地卷。有两条规则决定了你怎么用它：

- **磁盘大小在创建时固定。** 之后不能调整，所以第一次就选大一点。
- **卷绑定在一台物理机器上。** 它们“不能移动，也不能挂载到其他机器上的实例”。

存储价格因主机而异，显示在每条报价上（鼠标悬停在 Rent 按钮上）。只要实例存在就计费：“即使实例已停止，存储费用也会继续产生。要停止存储计费，你必须彻底销毁实例。”Vast 也说明，机器离线期间绝不会向你收费。

带宽同样由主机定价，按字节计费，双向都收。在大多数主机上，下载一个 16 GB 的模型、上传几个检查点花不了几个钱，但在搬运大型数据集之前先看一下价格。RunPod 这部分完全不收费。

所有平台上小时价之外的费用，详见[GPU 租用的真实成本](/zh_cn/hidden-fees-in-gpu-rental/)。

## 模板和准备工作

两者都使用 Docker 镜像，并把预设配置称为“模板”。

RunPod 的模板是“预先配置好的 Docker 镜像，让你无需手动配置环境即可快速启动 Pod”：PyTorch、ComfyUI、推理服务器，以及很多社区模板。选一个模板，选一块 GPU，几分钟内你就进了 JupyterLab 或 SSH。

Vast.ai 也是同样的思路。它的快速入门会引导你使用 PyTorch、TensorFlow、ComfyUI 等预置模板，或者用你自己的。准备步骤多几步：租用前验证邮箱，上传 SSH 公钥，并在浏览器中安装 Vast 的 Jupyter 证书。

既然两边都能用任意镜像，过了第一周，模板就没那么重要了。更大的实际差别在于：在 RunPod 上，你的环境可以放在网络卷上跟着你走；在 Vast.ai 上，你要么在每台新机器上重新搭建，要么把一切都打包进镜像。

## Serverless

两者都能把你的容器作为自动扩缩容的端点运行，但计费方式不同。

**RunPod Serverless** 有 flex worker，空闲时缩容到零；还有 active worker，一直运行，享受折扣（需通过销售安排）。你要为三个阶段付费：启动时间（加载容器、把模型载入 GPU 显存）、执行时间，以及每个请求之后的空闲超时，默认 5 秒。价格页面上 RTX 4090 档位（24 GB PRO）为每小时 $1.10，明显高于 $0.74 的 Secure Cloud pod。多出的钱买的是流量为零时什么都不用运行。

**Vast.ai Serverless** 的收费“与 Vast.ai 的非 Serverless GPU 实例价格相同”，按秒计费，没有额外费用。处于活跃和加载状态的 worker 要付 GPU、存储和带宽费用。非活跃的 worker 只付存储和带宽费用。正在创建的 worker 不付 GPU 时间费用。

如果你的流量有明显波峰、能接受冷启动，两者都可以。RunPod 更成熟，示例也更多。Vast.ai 按 GPU 秒算更便宜，但运行在同样鱼龙混杂的主机池上。

如果你只需要通过 OpenAI 风格的 API 调用一个开源模型，可能两者都不需要。对热门模型来说，托管的按 token 计费 API 往往最便宜（[计算过程](/zh_cn/hourly-gpu-vs-per-token-api/)）。GPUFlow 是另一个选择：你租用一个 OpenAI 兼容 API 密钥，对应提供商在自己 GPU 上用 Ollama 运行的模型，按秒计费。它只做推理，没有 SSH，不能训练，也不能运行自定义代码，所以在其他用途上替代不了 RunPod 或 Vast.ai。三者的对比见 [GPUFlow、Vast.ai 与 RunPod 对比](/zh_cn/gpuflow-vs-vast-ai-vs-runpod/)。

## 付款、最低金额和额度用完

两者都是预付制，余额归零时都毫不留情。

**RunPod** 接受银行卡（通过 Stripe 支持 Visa、Mastercard、Amex 等）、加密货币（首次用加密货币付款前需完成 KYC），以及 $5,000 以上订单通过 ACH、电汇或银行卡开票付款。部署 pod 时，账户里至少要有所选配置一小时的额度。额度不可退款，也不能提现。额度用完时，带网络卷的 pod 会被停止，卷会保留（并继续计费）。没有网络卷的 pod“会被终止，其数据无法恢复”。

**Vast.ai** 通过 Stripe 接受银行卡，通过 BitPay 和 Crypto.com 接受加密货币。最低预存 $5，需要先验证邮箱。自动充值会在余额低于你设定的阈值时，从已保存的银行卡充值。余额到 $0.00 时，实例会停止。如果保存了银行卡，Vast 会从卡上扣款补足负余额。如果没有，“实例和存储的数据将被销毁”。即使余额为负，存储也继续计费。退款：已消费的额度不退。未消费的银行卡额度要找客服申请，加密货币充值不能退款。

对两家的实用建议是一样的：开启自动充值或留出余量，把不能丢的东西放在网络卷上或平台之外。

## 怎么选

<figure>
<svg viewBox="0 0 720 520" role="img" aria-labelledby="d1-title" xmlns="http://www.w3.org/2000/svg" font-family="system-ui, sans-serif" font-size="15">
<title id="d1-title">在 RunPod 和 Vast.ai 之间做选择的决策流程，从只需要 API 到追求最低价格</title>
<defs><marker id="d1-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="#64748b"/></marker></defs>
<rect x="20" y="20" width="400" height="56" rx="10" fill="#eef2ff" stroke="#6366f1" stroke-width="2"/>
<text x="220" y="53" text-anchor="middle" fill="#1e1b4b">只需要通过 API 调用模型？</text>
<rect x="480" y="20" width="220" height="56" rx="10" fill="#ffffff" stroke="#e2e8f0" stroke-width="2"/>
<text x="590" y="53" text-anchor="middle" fill="#1e1b4b" font-size="13">按 token 计费 API 或 GPUFlow</text>
<rect x="20" y="120" width="400" height="56" rx="10" fill="#eef2ff" stroke="#6366f1" stroke-width="2"/>
<text x="220" y="153" text-anchor="middle" fill="#1e1b4b">有生产环境或合规要求？</text>
<rect x="480" y="120" width="220" height="56" rx="10" fill="#ffffff" stroke="#e2e8f0" stroke-width="2"/>
<text x="590" y="144" text-anchor="middle" fill="#1e1b4b">RunPod Secure Cloud</text>
<text x="590" y="165" text-anchor="middle" fill="#64748b" font-size="13">或 Vast 数据中心主机</text>
<rect x="20" y="220" width="400" height="56" rx="10" fill="#eef2ff" stroke="#6366f1" stroke-width="2"/>
<text x="220" y="253" text-anchor="middle" fill="#1e1b4b">数据要能跟着你换机器？</text>
<rect x="480" y="220" width="220" height="56" rx="10" fill="#ffffff" stroke="#e2e8f0" stroke-width="2"/>
<text x="590" y="253" text-anchor="middle" fill="#1e1b4b">RunPod 网络卷</text>
<rect x="20" y="320" width="400" height="56" rx="10" fill="#eef2ff" stroke="#6366f1" stroke-width="2"/>
<text x="220" y="353" text-anchor="middle" fill="#1e1b4b">需要能缩容到零的端点？</text>
<rect x="480" y="320" width="220" height="56" rx="10" fill="#ffffff" stroke="#e2e8f0" stroke-width="2"/>
<text x="590" y="353" text-anchor="middle" fill="#1e1b4b">两家的 Serverless 均可</text>
<rect x="20" y="420" width="400" height="70" rx="10" fill="#f0fdf4" stroke="#16a34a" stroke-width="2"/>
<text x="220" y="450" text-anchor="middle" fill="#1e1b4b">否则：Vast.ai，价格最低</text>
<text x="220" y="474" text-anchor="middle" fill="#64748b" font-size="13">按可靠性筛选，用可中断实例就要存检查点</text>
<line x1="420" y1="48" x2="476" y2="48" stroke="#64748b" stroke-width="2" marker-end="url(#d1-arrow)"/>
<text x="448" y="40" text-anchor="middle" fill="#16a34a" font-size="13">是</text>
<line x1="420" y1="148" x2="476" y2="148" stroke="#64748b" stroke-width="2" marker-end="url(#d1-arrow)"/>
<text x="448" y="140" text-anchor="middle" fill="#16a34a" font-size="13">是</text>
<line x1="420" y1="248" x2="476" y2="248" stroke="#64748b" stroke-width="2" marker-end="url(#d1-arrow)"/>
<text x="448" y="240" text-anchor="middle" fill="#16a34a" font-size="13">是</text>
<line x1="420" y1="348" x2="476" y2="348" stroke="#64748b" stroke-width="2" marker-end="url(#d1-arrow)"/>
<text x="448" y="340" text-anchor="middle" fill="#16a34a" font-size="13">是</text>
<line x1="220" y1="76" x2="220" y2="116" stroke="#64748b" stroke-width="2" marker-end="url(#d1-arrow)"/>
<text x="234" y="101" fill="#f97316" font-size="13">否</text>
<line x1="220" y1="176" x2="220" y2="216" stroke="#64748b" stroke-width="2" marker-end="url(#d1-arrow)"/>
<text x="234" y="201" fill="#f97316" font-size="13">否</text>
<line x1="220" y1="276" x2="220" y2="316" stroke="#64748b" stroke-width="2" marker-end="url(#d1-arrow)"/>
<text x="234" y="301" fill="#f97316" font-size="13">否</text>
<line x1="220" y1="376" x2="220" y2="416" stroke="#64748b" stroke-width="2" marker-end="url(#d1-arrow)"/>
<text x="234" y="401" fill="#f97316" font-size="13">否</text>
</svg>
<figcaption>从上往下看，在第一个“是”处停下。大多数能存检查点的训练和实验，最后都落在最下面那一格。</figcaption>
</figure>

**以下情况选 Vast.ai：**

- 你要优化的是每 GPU 小时的价格，尤其是长时间运行、每月差价达到几百美元的任务。
- 你的任务会存检查点，能在另一台机器上重启。这样，可中断实例就是你能找到的最便宜的 GPU 时间。
- 你愿意在点 Rent 之前花五分钟看一下主机的可靠性评分、所在地和最长租期。
- 你想用 serverless，又不想在实例价格之外多付溢价。

**以下情况选 RunPod：**

- 你想要一份固定的价格表，不想逐个比较主机。
- 你的数据要比任何一台机器活得更久。每 GB 每月 $0.07 的网络卷，是两个平台里最干净的方案。
- 你要大量传入或传出数据。RunPod 不收这笔钱。
- 你需要数据中心档位、经 KYC 的加密货币付款，或者大订单从同一家供应商开票。

**两者并用**，如果条件允许的话。很多人把 RunPod 网络卷当作大本营，把长时间、会存检查点的训练任务丢到便宜的 Vast.ai 机器上跑。在两者之间迁移 Docker 镜像很容易，要提前规划的是数据的迁移。

如果你还在弄清楚租用需要准备什么（镜像、存储、SSH 密钥），先看[租用 GPU 需要准备什么](/zh_cn/what-you-need-to-rent-a-gpu/)；更大范围的价格对比见 [2026 年 GPU 租用价格对比](/zh_cn/gpu-rental-pricing-comparison-2026/)。

## 资料来源

均于 2026 年 9 月核实。

- RunPod：[价格页面](https://www.runpod.io/pricing)、[Pod 价格和存储](https://docs.runpod.io/pods/pricing)、[Pod 概览](https://docs.runpod.io/pods/overview)、[选择 pod](https://docs.runpod.io/pods/choose-a-pod)、[管理 pod](https://docs.runpod.io/pods/manage-pods)、[创建 pod API（interruptible 字段）](https://docs.runpod.io/api-reference/pods/POST/pods)、[serverless 价格](https://docs.runpod.io/serverless/pricing)、[计费](https://docs.runpod.io/references/billing-information)、[竞价与按需](https://www.runpod.io/blog/spot-vs-on-demand-instances-runpod)
- RunPod Secure Cloud 2026 年 9 月 20 日调价：[usagepricing.com](https://www.usagepricing.com/blueprint/activity/runpod-2026-09-20-secure-cloud-price-hike)
- Vast.ai：[快速入门](https://docs.vast.ai/guides/get-started/quickstart.md)、[价格](https://docs.vast.ai/guides/instances/pricing.md)、[租用类型](https://docs.vast.ai/guides/reference/faq/rental-types)、[查找和租用实例](https://docs.vast.ai/guides/instances/choosing/find-and-rent)、[数据中心认证](https://docs.vast.ai/documentation/host/datacenter-status)、[存储类型](https://docs.vast.ai/documentation/instances/storage/types)、[卷](https://docs.vast.ai/documentation/instances/storage/volumes)、[serverless 价格](https://docs.vast.ai/serverless/pricing)、[计费](https://docs.vast.ai/documentation/reference/billing)
- 市场价格：getdeploying.com 的 [RTX 4090](https://getdeploying.com/reference/cloud-gpu/nvidia-rtx-4090) 和 [RTX 3090](https://getdeploying.com/reference/cloud-gpu/nvidia-rtx-3090)
- GPUFlow：[租用者入门](https://docs.gpuflow.app/zh-cn/renters/getting-started/)、[API 快速入门](https://docs.gpuflow.app/zh-cn/renters/api-quickstart/)
