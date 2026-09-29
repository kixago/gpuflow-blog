---
title: "GPU 租用的真实成本：小时价之外还要付哪些钱"
description: "停机存储、带宽、最低充值、计费粒度、空闲时间和银行卡手续费。在 Vast.ai、RunPod、Lambda、AWS 和 GPUFlow 上租用 GPU，除了每小时的 GPU 价格，你实际还要付多少。"
excerpt: "小时价只是账单的一部分。我们把各大 GPU 租用平台上能找到的额外费用逐项列出，每一项都附上金额和出处。"
pubDate: 2026-02-15
updatedDate: 2026-09-29
locale: "zh_cn"
category: "pricing"
featured: false
draft: false
author: "GPUFlow Team"
heroImage: "../_images/gpu-server-rack.jpg"
heroImageAlt: "机架中 GPU 服务器风扇的特写"
faq:
  - question: "机器停机时，GPU 租用平台还收存储费吗？"
    answer: "很多平台会收。在 RunPod 上，已停止 Pod 的卷磁盘每 GB 每月 $0.20，是运行时费率的两倍。在 Vast.ai 上，只要实例存在，存储就按秒计费，停机期间也不例外。GPUFlow 没有存储费，因为你租到的是一个 API 密钥，而不是一台机器。"
  - question: "哪些 GPU 租用平台收带宽费？"
    answer: "Vast.ai 由主机方自行设定上传和下载价格，每个字节都计费。RunPod 和 Lambda 表示不收入站和出站流量费。AWS 对发往互联网的出站数据收费，每月前 100 GB 免费。"
  - question: "开始租用前有最低充值要求吗？"
    answer: "Vast.ai 最低充值 $5。Lambda 会在你的银行卡上预授权 $10。RunPod 要求使用预付卡的用户每笔至少充值 $100。GPUFlow 最低充值 $10，不收手续费。"
  - question: "用美元支付 GPU 租用费，银行会收手续费吗？"
    answer: "有可能。银行卡的境外交易手续费通常为 1% 到 3%，有些银行即使标价是美元，只要商户在境外也会收取。在巴西，国际刷卡消费需缴纳 3.5% 的 IOF 税。"
---

GPU 租用页面上标的，是 GPU 每小时的使用价格。但月底实际要付的钱往往还包括别的：磁盘空间、数据传输、准备环境花掉的时间，以及你自己银行收的手续费。这些费用都不是刻意隐藏的，但如果只看标价来比较平台，很容易漏掉。

本文列出了我们在各大平台上能够确认的所有额外费用，每一项都附有出处链接。所有信息均于 2026 年 9 月核实。价格会变，依据某个数字做决定之前，请先点开链接确认。

## 简要对比

| 费用 | Vast.ai | RunPod | Lambda | AWS EC2 | GPUFlow |
| --- | --- | --- | --- | --- | --- |
| 计费单位 | 按秒 | 按秒 | 按分钟 | 按秒，最低 60 秒 | 按秒，最低 1 分钟 |
| 运行时存储 | 由主机方定价 | $0.10/GB/月 | 文件系统，按 GB/月 | $0.08/GB/月（gp3） | 无 |
| 停机时存储 | 收费 | $0.20/GB/月（卷磁盘） | 文件系统，按 GB/月 | $0.08/GB/月（gp3） | 无 |
| 数据传输 | 由主机方定价，每个字节都计费 | 免费 | 免费 | 发往互联网：每月前 100 GB 免费，超出收费 | 无 |
| 起步门槛 | 充值 $5 | 1 小时的额度；预付卡 $100 | 银行卡预授权 $10 | 支付方式和 GPU 配额 | 充值 $10 |

GPUFlow 之所以没有存储费和流量费，是因为它租的东西不一样：你拿到的是一个 API 密钥，用来调用别人 GPU 上运行的 AI 模型，而不是一台可以登录的机器。这也意味着你不能在上面跑自己的代码或训练任务。下文会详细说明。

## 1. 存储费，尤其是停机时的存储费

在出租机器或容器的平台上，你的文件存放在磁盘里，而磁盘只要存在就要花钱。

- **RunPod** 在 Pod 运行期间，容器磁盘和卷磁盘每 GB 每月收费 $0.10。Pod 停止后，容器磁盘会被清除、不再收费，但卷磁盘的费用变成**每 GB 每月 $0.20**。网络卷在 1 TB 以内每 GB 每月 $0.07，不论是否运行。
- **Vast.ai** 由每个主机方自行设定存储价格。只要实例存在就按秒计费，停机期间也照收。
- **AWS** 的 EBS 卷不论实例是否运行都要收费。us-east-1 区域的 gp3 卷每 GB 每月 $0.08。

举个例子：RunPod 上一个已停止的 Pod 挂着 200 GB 的卷，每月费用是 200 × $0.20 = **$40**，哪怕你再也不启动这个 Pod。按下文列出的市场常见价格，这笔钱足够租 100 多个小时的 RTX 3090。

**怎么办**：删掉不用的卷。如果只是想在两次使用之间保留文件，一个小的网络卷比保留一个大的已停止 Pod 便宜。

## 2. 数据传输

下载一个模型、上传一个数据集，动辄就是几十 GB 的流量。

- **Vast.ai**：每个主机方分别设定上传和下载的价格，文档说明无论实例处于什么状态，每个字节都计费。租用前先看清挂牌信息里的带宽价格，特别是需要下载大模型时。
- **RunPod** 和 **Lambda** 表示不收入站和出站流量费。
- **AWS**：入站数据免费。发往互联网的出站数据每月前 100 GB 免费，超出部分按 GB 计费。AWS 还对每个公网 IPv4 地址收取每小时 $0.005，不论是否在用。

## 3. 最低充值和银行卡预授权

大多数 GPU 平台采用预付费模式：先买额度，再消费。

- **Vast.ai**：最低充值 $5。
- **RunPod**：账户里至少要有所选机器 1 小时的额度，预付卡每笔至少充值 $100。
- **Lambda**：在你的银行卡上预授权 $10，几天后退回。
- **SaladCloud**：额度在购买 12 个月后过期。
- **GPUFlow**：每次充值 $10 到 $500，不收手续费，额度永不过期。

会过期或一直闲置的额度也是一种成本。按预计用量充值即可。

## 4. 准备环境的时间也在计费

租用机器时，计费从机器启动开始，而不是从你的任务开始。安装驱动和库、拉取容器镜像、下载 15 GB 的模型，全都发生在计费时间里。按每小时 $0.35 计算，半小时的准备时间大约是 $0.18。单次看不多，但如果你每天都开新机器，就会积少成多。

有两个办法：使用已经装好所需环境的模板或容器镜像；把模型放在卷上，只下载一次（再和第 1 点的存储费权衡一下）。

在 GPUFlow 上，模型在你租用之前就已经装在提供商的机器上了。无需任何准备：从租用开始那一刻计费，密钥立即可用。

## 5. 计费粒度和最低计费时长

按秒计费现在很普遍，但最低计费时长各不相同：

| 平台 | 计费方式 |
| --- | --- |
| Vast.ai | 按秒，无最低时长 |
| RunPod Pod | 按秒 |
| RunPod Serverless | 按秒，向上取整；还要为 worker 启动时间和空闲超时（默认 5 秒）付费 |
| Lambda | 按分钟 |
| AWS EC2（Linux） | 按秒，最低 60 秒 |
| Google Cloud | 按秒，最低 1 分钟 |
| GPUFlow | 按秒，最低 1 分钟 |

计费粒度影响最大的是 Serverless。如果你发送的是间隔较长的短请求，启动时间和空闲超时的费用可能比请求本身还高。

## 6. 运行中机器的空闲时间

按小时租的机器，GPU 不管是在干活还是在等你，费用都一样。为了“早上能直接用”而让 Pod 通宵运行，很容易造成超支。Lambda 说得很直白：实例只要在运行就计费，不管有没有在用。

**怎么办**：设个提醒，或者使用平台自动停止空闲机器的功能。在 GPUFlow 上，你预订一定的小时数；如果提前完成，点击**立即结束**，未用完的时间会退回你的额度。[GPUFlow 计费说明](https://docs.gpuflow.app/zh-cn/renters/billing/)。

## 7. 可中断机器

可中断（竞价）机器更便宜，通常能省一半甚至更多，但一旦有人出价更高，机器就可能被停掉。Vast.ai 称之为可中断实例，并表示通常便宜 50% 以上。在 TensorDock 上，即使你的出价被别人超过，存储费也照样计算。如果你的任务不能从检查点恢复，一次中断就意味着同样的活要付两次钱。

## 8. 银行手续费

几乎所有 GPU 平台都以美元收费。如果你的银行卡是其他币种，银行可能会额外收费：

- 境外交易手续费通常为 **1% 到 3%**。有些银行即使标价是美元，只要商户在境外也会收取。
- 很多加拿大信用卡对外币消费收取约 **2.5%** 的手续费。
- 在巴西，**国际刷卡消费需缴纳 3.5% 的 IOF 税**。

以充值 $100 为例，会多出 $1 到 $3.50，而这笔钱不会出现在平台账单上。换一张免境外交易手续费的卡，可以省掉大部分。

## 9. 面向提供商：提现手续费和最低提现金额

如果你出租自己的 GPU，平台会抽成，提现也有各自的规则：

| 平台 | 提供商所得 | 最低提现金额 | 提现手续费 |
| --- | --- | --- | --- |
| GPUFlow | 租金的 88% | $25 | 每次提现 $2.50 |
| Vast.ai | Vast 表示挂牌价通常比主机方收入高约 25% | $20 | Vast 未说明；你使用的收款服务可能收费 |
| TensorDock | 其托管协议写明收取 20% 或 25% 的费用（文中两种说法都有） | 满 $250 才能提现 | 未说明 |

GPUFlow 还会将收益暂扣 7 天（注册不满 30 天的账户暂扣 14 天）后才可提现，用于应对银行卡争议。[GPUFlow 提现说明](https://docs.gpuflow.app/zh-cn/providers/getting-paid/)。

## 2026 年 9 月常见 GPU 价格

作为参考，以下是我们 2026 年 9 月在 Vast.ai、RunPod、Salad、SimplePod、TensorDock、Hyperstack 和 Lambda 上查到的按需价格区间：

| GPU | 常见每小时价格 |
| --- | --- |
| RTX 3060 12 GB | $0.05 – $0.08 |
| RTX 3090 | $0.11 – $0.31 |
| RTX 4090 | $0.30 – $0.46 |
| RTX 5090 | $0.41 – $0.69 |

对比一下，AWS 上一块 NVIDIA L4（us-east-1 的 g6.xlarge）约每小时 $0.80，一块 A10G（g5.xlarge）约每小时 $1.01。

## 租用前的检查清单

1. 算上 GPU 时长，**再加上**文件保留期间的存储费。
2. 如果平台收带宽费，查一下单价以及你要下载多少数据。
3. 把准备环境的时间算作计费时间。
4. 想清楚怎么停止计费：结束租用、停止机器、删除卷。
5. 查一下你银行卡的境外交易手续费。

如果你需要的是一个能从代码里调用的 AI 模型，而不是一台运行自己软件的机器，基于 API 的租用方式可以完全避开第 1、2、4 点。如果你需要完整的机器来做训练，上面这些平台才是合适的工具，而这份清单能帮你把账单控制在小时价附近。

## 相关文章

- [按小时租 GPU 还是按 token 调 API？运行 7B–8B 模型的真实成本](/zh_cn/hourly-gpu-vs-per-token-api/)
- [GPUFlow、Vast.ai、RunPod 和 SaladCloud 对比：哪个适合你的任务](/zh_cn/gpuflow-vs-vast-ai-vs-runpod/)
- [2026 年租用 GPU 需要准备什么](/zh_cn/what-you-need-to-rent-a-gpu/)

## 资料来源

均于 2026 年 9 月核实。

- RunPod Pod 价格和存储：[docs.runpod.io/pods/pricing](https://docs.runpod.io/pods/pricing)
- RunPod Serverless 计费：[docs.runpod.io/serverless/pricing](https://docs.runpod.io/serverless/pricing)
- RunPod 计费和充值：[docs.runpod.io/references/billing-information](https://docs.runpod.io/references/billing-information)
- Vast.ai 价格和计费：[docs.vast.ai/guides/instances/pricing.md](https://docs.vast.ai/guides/instances/pricing.md)、[docs.vast.ai/documentation/reference/billing](https://docs.vast.ai/documentation/reference/billing)
- Vast.ai 充值：[docs.vast.ai 快速入门](https://docs.vast.ai/guides/get-started/quickstart.md)
- Vast.ai 主机方提现：[docs.vast.ai/host/payment.md](https://docs.vast.ai/host/payment.md)，主机方收益文章：[vast.ai](https://vast.ai/article/how-much-money-can-you-earn-renting-out-your-gpu-on-vast-ai)
- Lambda 计费：[docs.lambda.ai/public-cloud/billing](https://docs.lambda.ai/public-cloud/billing/)、[管理账单](https://docs.lambda.ai/public-cloud/manage-billing/)、[价格（“No egress fees”）](https://lambda.ai/pricing)
- SaladCloud 计费：[docs.salad.com 计费](https://docs.salad.com/general/explanation/billing.md)
- TensorDock 竞价实例：[docs.tensordock.com](https://docs.tensordock.com/virtual-machines/spot-instances)，供应商协议：[docs.tensordock.com](https://docs.tensordock.com/legal-information/supplier-hosting-agreement.md)
- AWS EC2 计费：[aws.amazon.com/ec2/pricing/on-demand](https://aws.amazon.com/ec2/pricing/on-demand/)；EBS：[aws.amazon.com/ebs/pricing](https://aws.amazon.com/ebs/pricing/)；公网 IPv4：[aws.amazon.com/vpc/pricing](https://aws.amazon.com/vpc/pricing/)
- AWS 实例价格：[instances.vantage.sh g6.xlarge](https://instances.vantage.sh/aws/ec2/g6.xlarge?region=us-east-1)、[g5.xlarge](https://instances.vantage.sh/aws/ec2/g5.xlarge?region=us-east-1)
- Google Cloud 虚拟机计费：[cloud.google.com/compute/vm-instance-pricing](https://cloud.google.com/compute/vm-instance-pricing)
- 银行卡境外交易手续费：[Experian](https://www.experian.com/blogs/ask-experian/what-is-a-foreign-transaction-fee/)、[NerdWallet Canada](https://www.nerdwallet.com/ca/p/best/credit-cards/best-no-foreign-transaction-fee-credit-cards)
- 巴西 IOF 3.5%：[Wise Brazil](https://wise.com/br/blog/iof-cartao-internacional)
- GPU 价格区间：[GPUFlow 文档：如何为你的 GPU 定价](https://docs.gpuflow.app/zh-cn/providers/pricing/)
