---
title: "如何在租用或公共 GPU 节点上保护你的数据集"
description: "租用 GPU 的主机能读到你的任务解密后的任何内容。加密、安全云和 H100 机密计算分别能解决什么，以及用完后怎样清理。"
excerpt: "租用 GPU，意味着存放你数据的机器上，root 权限在别人手里。本文讲清威胁模型、每种防护真正覆盖的范围，以及一套在现代磁盘上行之有效的清理流程。"
pubDate: 2026-02-26
updatedDate: 2026-09-30
locale: "zh_cn"
category: "guides"
featured: false
draft: false
author: "GPUFlow Team"
authorUrl: "https://gpuflow.app"
heroImage: "../_images/secure-server-room-abstract.png"
heroImageAlt: "抽象的安全服务器环境，象征受保护的 AI 数据处理"
faq:
  - question: "租用 GPU 的主机能看到我的数据吗？"
    answer: "技术上能。主机拥有物理机器的 root 权限，而训练或运行模型时，你的数据必须在内存中解密。只有机密计算，例如 Azure 或 Google Cloud 上的 H100 机密虚拟机，能把主机排除在外。"
  - question: "在云 GPU 实例上用 shred 能安全删除文件吗？"
    answer: "不可靠。GNU shred 手册说明，它只在文件系统和硬件原地覆写数据时才有效，而日志型和写时复制文件系统、快照以及 SSD 都不保证这一点。应在数据落盘前就加密，用完后销毁实例。"
  - question: "RunPod Secure Cloud 和 Community Cloud 有什么区别？"
    answer: "RunPod 文档说，Secure Cloud 运行在 T3/T4 数据中心，适合生产环境和敏感数据；Community Cloud 由点对点提供商组成，可靠性参差不齐。RunPod 已不再接受新的 Community Cloud 主机。"
  - question: "哪些云 GPU 支持机密计算？"
    answer: "截至 2026 年 9 月，Azure 提供 NCCads H100 v5 机密虚拟机，配一块 H100 NVL GPU，基于 AMD SEV-SNP；Google Cloud 提供机密版 a3-highgpu-1g（一块 H100，Intel TDX）和 G4（RTX PRO 6000，AMD SEV）。消费级 GeForce 显卡不在这些列表中。"
  - question: "在 GDPR 下，把个人数据放到租用的 GPU 上安全吗？"
    answer: "只有当提供商是签有符合 GDPR 第 28 条合同的处理者，并且在机器位于欧盟境外时有合法的传输途径，才可以。大多数点对点主机和你之间没有这样的合同，所以要先对数据去标识化，或者使用签署 DPA 的数据中心提供商。"
  - question: "能在 GPUFlow 上训练或微调模型吗？"
    answer: "不能。GPUFlow 只做推理：你拿到的是一个 OpenAI 兼容 API 密钥，对应运行在提供商电脑上的模型，没有 SSH、shell，也不能访问文件。提示词以明文到达那台电脑，所以不要通过它发送机密记录。"
---

租用 GPU 时，存放你数据的机器上，root 权限在别人手里。加密能保护数据集在传输途中和存放在磁盘上时的安全，但训练任务要用数据，就必须在内存中解密，到了这一步，一个有心的主机就能读到它。所以真正要决定的是：你信任谁（经过审核的数据中心，还是匿名的家用服务器），发出去的数据尽量少到什么程度，以及是否需要机密计算——这是唯一能把主机运营者从信任链中移除的方案。

本文针对的是你能登录的机器，例如 Vast.ai 或 RunPod 上的实例。内容依次是威胁模型、每种防护覆盖的范围，以及一套在现代存储上站得住的清理流程。出处附在文末，所有内容均于 2026 年 9 月核实。

## 威胁模型

先把谁可能接触到数据、通过什么途径列出来。在租用的 GPU 实例上，现实的途径有七条。

<figure>
<svg viewBox="0 0 720 430" role="img" aria-labelledby="d1-title" xmlns="http://www.w3.org/2000/svg" font-family="system-ui, sans-serif" font-size="15">
<title id="d1-title">租用 GPU 实例上数据集的威胁模型：七条接触数据的途径，以及每条的主要防护</title>
<rect x="0" y="0" width="720" height="430" fill="#ffffff"/>
<line x1="220" y1="75" x2="240" y2="170" stroke="#e2e8f0" stroke-width="2"/>
<line x1="220" y1="220" x2="240" y2="215" stroke="#e2e8f0" stroke-width="2"/>
<line x1="220" y1="365" x2="240" y2="270" stroke="#e2e8f0" stroke-width="2"/>
<line x1="500" y1="75" x2="480" y2="170" stroke="#e2e8f0" stroke-width="2"/>
<line x1="500" y1="220" x2="480" y2="215" stroke="#e2e8f0" stroke-width="2"/>
<line x1="500" y1="365" x2="480" y2="270" stroke="#e2e8f0" stroke-width="2"/>
<line x1="360" y1="330" x2="360" y2="290" stroke="#e2e8f0" stroke-width="2"/>
<rect x="240" y="140" width="240" height="150" rx="12" fill="#eef2ff" stroke="#6366f1" stroke-width="2"/>
<text x="360" y="170" text-anchor="middle" fill="#1e1b4b" font-weight="bold">你租用的实例</text>
<text x="360" y="205" text-anchor="middle" fill="#1e1b4b">数据集</text>
<text x="360" y="235" text-anchor="middle" fill="#1e1b4b">权重和检查点</text>
<text x="360" y="265" text-anchor="middle" fill="#1e1b4b">令牌和密钥</text>
<rect x="20" y="40" width="200" height="70" rx="10" fill="#ffffff" stroke="#f97316" stroke-width="2"/>
<text x="120" y="68" text-anchor="middle" fill="#1e1b4b">主机运营者</text>
<text x="120" y="92" text-anchor="middle" fill="#64748b" font-size="13">对策：可信主机或 CC</text>
<rect x="20" y="185" width="200" height="70" rx="10" fill="#ffffff" stroke="#f97316" stroke-width="2"/>
<text x="120" y="213" text-anchor="middle" fill="#1e1b4b">网络路径</text>
<text x="120" y="237" text-anchor="middle" fill="#64748b" font-size="13">对策：SSH，不开放端口</text>
<rect x="20" y="330" width="200" height="70" rx="10" fill="#ffffff" stroke="#f97316" stroke-width="2"/>
<text x="120" y="358" text-anchor="middle" fill="#1e1b4b">磁盘残留</text>
<text x="120" y="382" text-anchor="middle" fill="#64748b" font-size="13">对策：先加密，再销毁</text>
<rect x="500" y="40" width="200" height="70" rx="10" fill="#ffffff" stroke="#f97316" stroke-width="2"/>
<text x="600" y="68" text-anchor="middle" fill="#1e1b4b">市场平台</text>
<text x="600" y="92" text-anchor="middle" fill="#64748b" font-size="13">对策：合同和 DPA</text>
<rect x="500" y="185" width="200" height="70" rx="10" fill="#ffffff" stroke="#f97316" stroke-width="2"/>
<text x="600" y="213" text-anchor="middle" fill="#1e1b4b">其他租户</text>
<text x="600" y="237" text-anchor="middle" fill="#64748b" font-size="13">对策：虚拟机或整台机器</text>
<rect x="500" y="330" width="200" height="70" rx="10" fill="#ffffff" stroke="#f97316" stroke-width="2"/>
<text x="600" y="358" text-anchor="middle" fill="#1e1b4b">快照、卷</text>
<text x="600" y="382" text-anchor="middle" fill="#64748b" font-size="13">对策：不留持久副本</text>
<rect x="260" y="330" width="200" height="70" rx="10" fill="#ffffff" stroke="#f97316" stroke-width="2"/>
<text x="360" y="358" text-anchor="middle" fill="#1e1b4b">你自己留下的东西</text>
<text x="360" y="382" text-anchor="middle" fill="#64748b" font-size="13">对策：限定范围、定期轮换</text>
</svg>
<figcaption>任务运行期间，实例上的一切都暴露在主机运营者面前。其他途径靠日常的安全习惯就能堵上；唯独这一条，要么需要一个你信任的主机，要么需要机密计算。</figcaption>
</figure>

**主机运营者。** 谁拥有物理机器，谁就有 root 权限。在 Vast.ai 这类容器市场上，客户运行在非特权 Docker 容器中，这能把你和其他租户隔离开，但隔离不了主机：主机上的 root 可以读取容器的文件和内存。所有平台上的容器都是这样工作的。

**网络路径。** 数据从你的笔记本或存储桶传到节点的这一段。这是最容易堵上的途径。

**市场平台。** 夹在你和主机之间的公司，掌握着你的账户、你的 SSH 密钥，以及它自己日志里留存的一切。它能拿这些做什么由其条款决定，所以下文关于合同的部分很重要。

**磁盘残留。** 你删除的文件，在租用结束后可能仍留在磁盘上，下一个租用者或主机都可能找到。

**快照和持久卷。** 你主动要求的副本（网络卷、已停止的实例）或主机制作的副本（备份），寿命都比任务长。

**其他租户。** 同一台机器上的其他客户。有虚拟机隔离或者整台机器归你一个人用时，这个风险很小，但 GPU 在这方面出过真实的漏洞。LeftoverLocals（CVE-2023-4969）能让一个进程读取另一个进程在部分 Apple、AMD 和 Qualcomm GPU 上的本地内存；Trail of Bits 在 AMD Radeon RX 7900 XT 上每次 LLM 查询能恢复约 181 MB 数据，足以重建模型的回答。Trail of Bits 在 NVIDIA、ARM 和 Intel GPU 上没有发现这个问题。

**你自己留下的东西。** 留在节点上的 Hugging Face 令牌、云密钥或 SSH 私钥。实际上，大多数泄露都是从这里开始的。

## 加密能管什么，管不了什么

加密有三项任务，租用 GPU 时，其中两项你可以自己完成。

**传输中：** 很简单。用 SSH（`scp`、`sftp`、`rsync -e ssh`），或从存储桶走 HTTPS。Vast.ai 声明 SSH 连接和其 API 都是加密的。千万不要用明文 HTTP 链接或无需认证的文件分享服务。

**静态存储：** 上传前先加密，这样主机磁盘上的文件没有密钥就毫无用处。做这件事最简单的工具是 [age](https://github.com/FiloSottile/age)：

```bash
# on your own machine
tar -cf - train/ | age -p > train.tar.age
scp -P 22345 train.tar.age user@203.0.113.42:/workspace/
```

在节点上，直接解密到内存里，明文就永远不会碰到磁盘：

```bash
mkdir -p /dev/shm/train
age -d /workspace/train.tar.age | tar -xf - -C /dev/shm/train
```

`age -d` 会在终端里要求输入口令，所以密钥从不写入节点。`/dev/shm` 是基于内存的文件系统；先用 `df -h /dev/shm` 查看它的大小，因为容器环境里它往往设得很小。如果数据放不进内存，你就需要在磁盘上保留一份解密后的副本，下面的清理部分就更重要了。

在自己的服务器上，常规做法是用 LUKS 做全盘加密，但在非特权容器里一般没法配置 dm-crypt，而且运行中的密钥反正也在主机手里。

**使用中：** 这就是缺口所在。训练时，GPU 需要明文张量，给它喂数据的 CPU 内存里也是明文。任何在主机上有 root 权限的人，理论上都能把这部分内存转储出来。面对一个在线的恶意主机，静态加密毫无作用。只有基于硬件的机密计算能解决这个问题。

## 安全云还是社区云

主机是安全习惯唯一消除不了的风险，所以选主机是你做的最大决定。两大市场正是因此把算力来源分成了两类。

| 选项 | 谁运营硬件 | 平台的说法 |
| --- | --- | --- |
| RunPod Secure Cloud | T3/T4 数据中心 | 适用于“生产环境、敏感数据” |
| RunPod Community Cloud | 点对点提供商 | 适用于“对成本敏感的工作负载”；不再接受新主机 |
| Vast.ai Secure Cloud | 经过审核的数据中心 | ISO 27001、Tier 3/4 标准、物理安全经过验证 |
| 其他 Vast.ai 主机 | 从数据中心到个人都有 | 个人主机“的安全措施可能不那么正式” |

Vast.ai 自己对敏感数据的建议是：只使用 Secure Cloud 提供商，对静态数据加密，不把凭据放在实例上，使用外部密钥管理。这和我会给任何人的建议一致。

即便是在通过认证的数据中心，也有两个局限。第一，ISO 27001 认证的是运营者的流程，排除不了不诚实的内部人员。第二，替你处理个人数据的主机在 GDPR 下是处理者，第 28 条要求有相应的合同，而市场平台夹在你和主机之间。看清楚你实际上是和哪家公司签的合同，以及它对自己的主机做了什么承诺。

对于真正敏感的任务，再往上一步，是在你已经签有 DPA、可能还有 BAA 的超大规模云账户里开 GPU 实例。这就离开了市场平台的范畴，每小时也更贵。价格区间见我们的 [GPU 租用价格对比](/zh_cn/gpu-rental-pricing-comparison-2026/)。

## H100 GPU 上的机密计算

机密计算（CC）是本文涉及的技术中，唯一在设计上就要在任务运行期间防住主机运营者的。在 NVIDIA Hopper 和 Blackwell 数据中心 GPU 上，它是这样工作的：

- 工作负载运行在机密虚拟机（CVM）中，CPU 端由 AMD SEV-SNP 或 Intel TDX 提供支撑。NVIDIA 的设计假定虚拟机管理程序和主机操作系统可能已被攻破；能访问虚拟机管理程序“乃至整个系统”的运营者，也不应能读取 CVM 的内存。
- 使用前，虚拟机会通过签名的设备证书检查 GPU 是否为真品、是否处于 CC 模式，该证书可以通过 NVIDIA 远程证明服务（NRAS）验证。
- 经过 PCIe 的数据、命令缓冲区和 CUDA 内核都经过加密和签名，并经由共享内存中一个加密的中转缓冲区传递。

NVIDIA 于 2024 年 4 月随 CUDA 12.4 正式推出 H100 单 GPU 机密计算。截至 2026 年 9 月，实际能租到的地方：

| 云 | 实例 | GPU | CPU TEE |
| --- | --- | --- | --- |
| Azure | NCCads H100 v5 | 1 × H100 NVL，94 GB | AMD SEV-SNP（EPYC Genoa） |
| Google Cloud | a3-highgpu-1g，机密虚拟机 | 1 × H100 | Intel TDX |
| Google Cloud | g4-standard-48，机密虚拟机 | RTX PRO 6000 | AMD SEV |

在它上面搭建之前，先了解它的局限：

- **每台虚拟机一块 GPU。** Azure 的这个系列只有一块 GPU，Google 的机密 GPU 虚拟机不支持多节点集群。大型多 GPU 训练就别想了。
- **资源供应。** 在 Google Cloud 上，机密 A3 High 只能以 Spot 或灵活启动（flex-start）方式运行，不支持预留。
- **传输速度。** NVIDIA 2023 年的技术文章给出，CC 模式下 CPU 到 GPU 的带宽约为 4 GB/s，受限于 CPU 加密。因此加载一个 16 GB 的检查点，纯传输就要 16 ÷ 4 = 4 秒，对推理来说没问题，但每一步都要流式传输好几 GB 的数据管线就会感觉到。后续驱动版本列出了性能方面的改进，所以请实测你自己的任务。
- **GPU 显存不加密。** NVIDIA 让封装内的 HBM 保持明文，理由是常见的物理攻击工具够不着它。
- **市场平台上没有。** Vast.ai 和 RunPod 社区主机上常见的消费级 GeForce 显卡，不在任何一份支持列表里。

CC 改变的是你需要信任谁：从主机的员工，变成 NVIDIA 的硬件和证明服务、CPU 厂商，以及你自己的虚拟机镜像。对于必须能说出“云服务商的管理员读不到”的受监管数据，这是在租用硬件上唯一能做到这一点的方案。

## 任务开始前和运行期间

### 上传前尽量精简

最便宜的保护，是让数据根本不离开你的机器。传输之前：

- 删掉模型用不上的列，尤其是姓名、邮箱、账号和自由文本备注。
- 用随机令牌替换直接标识符，对照表留在本地。
- 把语料缩减到方法实际需要的量。LoRA 或 QLoRA 微调只调整一小组额外权重，很少需要整个生产数据库；我们的[微调指南](/zh_cn/private-llm-fine-tuning-guide/)给出了一个实际的配置。
- 记住模型权重也携带信息。在敏感文本上微调的模型可能会复述其中的片段，所以适配器也要当作敏感数据对待。

去标识化的数据，也能让下文的大部分法律问题不复存在。

### 节点上的凭据和网络

假定你放到节点上的任何东西都可能被复制。

- 使用细粒度的 Hugging Face 令牌，只对你需要的那一个仓库有读取权限，任务结束后撤销。
- 永远不要把你的主 SSH 私钥、云账户 root 凭据或生产数据库密码复制到租来的机器上。如果任务必须把结果写入存储桶，就创建一个只能写入某一个前缀、一天内过期的密钥。
- 通过 SSH 把结果拉回来，而不是在节点上用长期有效的密钥往外推。
- 用 `ss -tulnp` 查看有哪些服务在监听。把 Jupyter、TensorBoard 和推理服务器绑定到 `127.0.0.1`，通过 SSH 隧道（`ssh -L 8888:127.0.0.1:8888 ...`）访问，而不是暴露一个公网端口。

## 在现代磁盘上也管用的清理方法

常见的建议是任务结束后用 `shred` 粉碎数据集。它做不到大家以为的那样。GNU coreutils 手册说明，`shred` 依赖文件系统和硬件原地覆写数据，并列出了这一前提不成立的情形：日志型和日志结构文件系统，例如 `data=journal` 模式下的 ext4、Btrfs、XFS 和 ZFS，RAID，带快照的文件系统，压缩文件系统，以及 SSD——它的磨损均衡会把新数据写到别的地方。一台租来的 GPU 节点，很可能同时占了其中好几条。

真正管用的做法：

1. **让磁盘上的副本变得毫无价值。** 如果碰过磁盘的只有 age 加密的归档，删掉它就够了；没有口令，它就是一堆噪声。NIST 的介质净化指南（SP 800-88 Rev. 2，2025 年 9 月）把这种思路，即密码学擦除，列为一项标准技术。
2. **销毁，而不是停止。** 在 Vast.ai 上，停止实例会保留其数据（并继续收取存储费）；销毁则会“永久删除实例及所有数据”。在 RunPod 上，pod 停止时容器磁盘被清空，`/workspace` 卷在停止后保留、在终止时删除，而网络卷不管发生什么都会保留，直到你删除它。
3. **删除你创建的网络卷。** 按设计，它们的寿命比 pod 长。
4. **撤销你用过的东西。** Hugging Face 令牌、存储桶密钥，并移除为这次任务添加到市场平台上的一次性 SSH 公钥。

主机在不同租用者之间怎样擦除磁盘，我读过的市场平台文档里都没有写。就当它不会擦除来做计划，第 1 步无论如何都能兜住。

## 合同和法规

技术控制手段的重要性，比不上一个法律事实：把数据放到别人的机器上，别人就成了当事方。

- **GDPR。** 替你处理个人数据的 GPU 主机是处理者。第 28 条要求处理者提供“充分保证”，并签订有约束力的合同。一个你从未与之签过任何东西的点对点主机达不到这个要求，而且机器可能位于欧盟境外。要么去标识化，要么使用签署 DPA 的提供商。
- **HIPAA。** HHS 表示，存储电子健康数据的云服务商是商业伙伴，即使数据已加密、它没有密钥也一样。把健康记录加密后发给一个未经审核的主机，并不能免除签署 BAA 的需要。
- **你的客户合同。** 很多企业协议限制分包处理者和数据存放地点。第一次上传之前先查清楚。法律上的风险往往比技术上的更大。

姊妹篇[公司为什么限制公共 AI 工具](/zh_cn/why-corporate-policies-banning-chatgpt/)从聊天工具的角度讲了同样的规则。

## 在 GPUFlow 上做推理：另一种取舍

GPUFlow 不是放数据集的地方。它是一个推理市场：你按小时租一块 GPU，拿到一个 OpenAI 兼容 API 密钥（基础 URL `https://gpuflow.app/v1`），对应提供商在自己电脑上运行的开源模型（通常用 Ollama）。没有 SSH，没有 shell，也不能访问文件，不能在上面训练或微调。你上传的东西不会留在提供商的磁盘上，因为你根本没法上传任何东西。

这就消除了本文中的磁盘和凭据问题，但消除不了主机问题。租用期间，每条提示词和回答都以明文经过提供商的机器。GPUFlow 的条款禁止提供商记录、读取、保留或分享这些内容，GPUFlow 自己也不保存文本，但提供商在机器上有 root 权限，所以这条规则只靠合同执行。如果你把一个数据集按每条提示词一条记录的方式跑一遍，每一条记录都会到达那台电脑。

所以它适合用于公开数据、合成数据或经过妥善去标识化的数据，以及用 OpenAI 风格的 API 测试开源模型或应用。受监管和客户机密的记录，请留在你自己的硬件上、你签有合同的提供商那里，或者机密虚拟机里。[API 快速入门](https://docs.gpuflow.app/zh-cn/renters/api-quickstart/)用一句话说了同样的意思：不要发送密码、卡号，或其他你不会告诉陌生人的秘密。从提供商一侧看同样的安排，见[出租 GPU 安全吗](/zh_cn/is-it-safe-to-rent-out-your-gpu/)。

## 检查清单

开始前：

- 确定数据类别。受监管或客户机密的数据，交给签有合同的提供商或机密虚拟机，而不是社区主机。
- 精简数据并去标识化。
- 用 age 加密；口令不要放到节点上。

运行中：

- 放得下的话，解密到 `/dev/shm`。
- 只用限定范围、短期有效的令牌。
- 服务绑定到 localhost，通过 SSH 隧道访问。

结束后：

- 通过 SSH 拉回结果；把微调后的权重当作敏感数据。
- 销毁实例和所有网络卷。
- 撤销令牌和一次性密钥。

## 资料来源

- Vast.ai 上的容器隔离和 Secure Cloud：[Vast.ai 安全 FAQ](https://docs.vast.ai/guides/reference/faq/security)；停止与销毁：[管理实例](https://docs.vast.ai/guides/instances/manage-instances)
- RunPod Secure Cloud 与 Community Cloud：[选择 Pod](https://docs.runpod.io/pods/choose-a-pod)；存储持久性：[存储类型](https://docs.runpod.io/pods/storage/types)
- LeftoverLocals：[Trail of Bits，2024 年 1 月](https://blog.trailofbits.com/2024/01/16/leftoverlocals-listening-to-llm-responses-through-leaked-gpu-local-memory/)
- age：[github.com/FiloSottile/age](https://github.com/FiloSottile/age)
- shred 的局限：[GNU coreutils 手册，shred 用法](https://www.gnu.org/software/coreutils/manual/html_node/shred-invocation.html)
- NIST SP 800-88 Rev. 2：[NIST 公告，2025 年 9 月](https://www.nist.gov/news-events/news/2025/09/guidelines-media-sanitization-nist-publishes-sp-800-88r2)
- H100 机密计算设计：[NVIDIA，H100 GPU 上的机密计算，实现安全可信的 AI](https://developer.nvidia.com/blog/confidential-computing-on-h100-gpus-for-secure-and-trustworthy-ai/)；正式推出：[NVIDIA，2024 年 4 月](https://developer.nvidia.com/blog/announcing-confidential-computing-general-access-on-nvidia-h100-tensor-core-gpus/)
- Azure：[NCCads H100 v5 系列](https://learn.microsoft.com/en-us/azure/virtual-machines/sizes/gpu-accelerated/nccadsh100v5-series)
- Google Cloud：[机密虚拟机支持的配置](https://docs.cloud.google.com/confidential-computing/confidential-vm/docs/supported-configurations)、[创建带 GPU 的机密虚拟机实例](https://docs.cloud.google.com/confidential-computing/confidential-vm/docs/create-a-confidential-vm-instance-with-gpu)
- GDPR 第 28 条：[gdpr-info.eu](https://gdpr-info.eu/art-28-gdpr/)
- HIPAA 与云服务商：[HHS，HIPAA 与云计算指南](https://www.hhs.gov/hipaa/for-professionals/special-topics/health-information-technology/cloud-computing/index.html)
- GPUFlow：[API 快速入门](https://docs.gpuflow.app/zh-cn/renters/api-quickstart/)、[租用者能访问和不能访问的内容](https://docs.gpuflow.app/zh-cn/providers/security/)、[条款](https://gpuflow.app/zh-CN/terms)、[隐私政策](https://gpuflow.app/zh-CN/privacy)

均于 2026 年 9 月核实。
