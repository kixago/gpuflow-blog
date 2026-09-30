---
title: "公司为什么禁止员工用 ChatGPT，又改用什么"
description: "公司限制公共 AI 聊天应用，是因为员工把公司无权共享的数据粘贴了进去。本文梳理真实案例、2026 年的法规，以及真正可行的替代方案。"
excerpt: "大多数企业的 ChatGPT 禁令，关乎的是合同和默认设置。本文讲三星到底出了什么事、如今各家商业版承诺了什么，以及每种方案下你的提示词去了哪里。"
pubDate: 2026-02-26
updatedDate: 2026-09-30
locale: "zh_cn"
category: "case-studies"
featured: false
draft: false
author: "GPUFlow Team"
heroImage: "../_images/corporate-ai-policy-restriction.png"
heroImageAlt: "企业办公室里，电脑屏幕上叠加着数字锁图标，表示 AI 访问受限"
faq:
  - question: "公司为什么禁止员工使用 ChatGPT？"
    answer: "因为员工把公司和客户的数据粘贴进了一个公司与之没有任何合同的个人账户。在 ChatGPT 个人版套餐中，默认设置允许 OpenAI 使用内容来改进模型，而且没有覆盖公司的数据处理协议或 HIPAA 商业伙伴协议。"
  - question: "ChatGPT Enterprise 会用公司数据训练模型吗？"
    answer: "默认不会。OpenAI 的企业隐私页面说明，除非客户主动选择加入，否则不会用 ChatGPT Enterprise、Business、Edu 或 API 的数据进行训练；该页面还列出了 Enterprise 的 SOC 2 Type 2 审计和由管理员控制的数据保留期。"
  - question: "哪些公司限制过 ChatGPT？"
    answer: "2023 年，三星在有报道称源代码和内部数据外泄后，限制在公司设备上使用生成式 AI。据报道，苹果、摩根大通、美国银行、花旗、德意志银行、高盛、富国银行、沃尔玛和 Verizon 同年也做了限制。"
  - question: "在 GDPR 下，把客户数据输入 ChatGPT 合法吗？"
    answer: "只有在具备合法依据、并签有符合 GDPR 第 28 条的处理者合同时才合法。附带数据处理协议的商业版套餐可以满足要求；员工的个人账户不行，因为公司与厂商之间就这个账户没有任何合同。"
  - question: "欧盟《人工智能法》的高风险规则什么时候适用？"
    answer: "AI Omnibus 修正案于 2026 年 7 月 27 日生效。此后，简历筛选这类独立高风险系统的规则自 2027 年 12 月 2 日起适用，受监管产品中的 AI 自 2028 年 8 月 2 日起适用。第 50 条规定的透明度义务自 2026 年 8 月 2 日起已经适用。"
  - question: "能用 GPUFlow 处理公司机密数据吗？"
    answer: "不能。在 GPUFlow 上，模型运行在提供商自己的电脑上，所以提示词和回答以明文经过那台机器。条款禁止提供商记录这些内容，但这是合同约束，不是技术上的阻断，所以只用它处理你可以给陌生人看的数据。"
---

大多数“禁用 ChatGPT”的公司并不反对 AI。它们反对的是员工把公司数据粘贴进一个公司与之没有合同的个人账户，而厂商默认可以用这些数据改进模型。常见的解决办法是提供一个获批的工具：带有不训练和数据保留条款的商业版套餐，部署在公司自有云账户里的模型端点，或者在公司自己运行的硬件上跑开放权重模型。只要合同到位，公共工具能胜任很多工作。

下文依次讲：大家常引用的那些案例实际发生了什么，2026 年适用哪些法规，各厂商的商业条款如今怎么写，以及每种方案下你的文字去了哪里。所有内容均于 2026 年 9 月对照一手资料核实，出处列在文末。

## 三星和银行那边发生了什么

三星是人人都引用的案例。2023 年初，三星半导体业务允许工程师使用 ChatGPT。随后韩国媒体报道了三起独立的事件：员工粘贴源代码来修 bug，用它写会议纪要，还输入了设备测量和良率数据。三星当时没有证实这些细节。2023 年 4 月底，一份备忘录通知其最大部门之一的员工：在公司电脑上暂时限制使用生成式 AI。在此前一个月的内部调查中，65% 的受访者表示担心安全风险。

据《华尔街日报》报道，苹果在 2023 年 5 月限制了 ChatGPT 和 GitHub Copilot，原因是担心机密数据落到用用户数据训练模型的开发者手里。同一批报道还列出了限制 ChatGPT 的摩根大通、美国银行、花旗、德意志银行、高盛、富国银行、沃尔玛和 Verizon。

这些案例中有两点容易被忽略。

第一，没有人被黑客攻击。数据去的正是员工发送的地方。担心的是之后的事：谁保存它，保存多久，会不会用来训练模型，法院能不能要求厂商交出来。

第二，禁令并没有一直以禁令的形式存在。摩根大通搭建了自己的内部平台 LLM Suite，让员工“在安全的环境中”使用大语言模型。它在 2024 年夏天上线，八个月内接入了 20 万用户。这是典型的路径：先封掉个人版应用，再给大家一个获批的工具。

## 风险到底是什么

员工用个人账户时，有四个彼此独立的问题叠加在一起。

**默认用于训练。** 在 ChatGPT Free、Plus 和 Pro 上，除非用户在“数据控制”中关闭“为所有人改进模型”，否则内容可能被用来改进 OpenAI 的模型。如果用户点了赞或踩，即使已经选择退出，整段对话仍可能被使用。Anthropic 的 Claude 个人版套餐在用户允许改进模型时，会用聊天内容做训练。所以你的源代码会不会进入训练集，取决于别人账户里的一个设置。

**你控制不了的保留期。** OpenAI 平台上的商业数据在用户删除后 30 天内删除，“除非法律要求我们保留”。最后这一条并非虚设。在《纽约时报》诉讼中，一项从 2025 年 6 月持续到 2025 年 9 月 26 日的法院命令要求 OpenAI 保留原本会删除的 ChatGPT 个人版和标准 API 内容。ChatGPT Enterprise、Edu 以及启用零数据保留的 API 客户不在此列。

**没有合同。** 从法律上讲，这一点最要紧。根据 GDPR，公司让厂商处理个人数据时，必须选择能提供“充分保证”的处理者，并与之签订有约束力的合同（第 28 条）。医疗机构需要商业伙伴协议（BAA）。员工的个人账户两者都没有，所以违规在粘贴的那一刻就发生了，不管之后有没有泄露。

**没有记录。** 受监管的公司必须监督和存档业务通信。个人账户里的聊天记录，不在合规团队运行的任何存档系统之内。

## 2026 年适用的法规

### GDPR

提示词中包含欧盟客户或员工的个人数据，就构成数据处理。这需要合法依据、符合第 28 条的处理者合同，以及任何向欧盟境外传输数据的合法途径。对于美国厂商，欧美数据隐私框架（DPF）仍然有效：欧盟普通法院于 2025 年 9 月 3 日驳回了 Latombe 的诉讼（案号 T-553/23）。上诉目前在欧洲法院审理中，案号 C-703/25 P，需要持续关注。

监管机构已经直接对聊天服务采取过行动。意大利数据保护局（Garante）在 2023 年 3 月底临时封禁了 ChatGPT，并于 2024 年 12 月对 OpenAI 处以 1,500 万欧元罚款，理由是在没有充分法律依据的情况下处理个人数据训练 ChatGPT、未通报 2023 年 3 月的数据泄露事件、透明度不足以及缺少年龄验证。OpenAI 称罚款不成比例，并表示将上诉。

### HIPAA

任何为受保护实体接收、存储或传输电子受保护健康信息的服务，都是商业伙伴，需要签署 BAA。HHS 明确表示，即使云服务商只保存加密数据、没有密钥，它仍然是商业伙伴。OpenAI 表示可以为其 API 签署 BAA。而医生的个人 ChatGPT 账户完全没有 BAA。

### 金融服务

FINRA 第 24-09 号监管通知（2024 年 6 月 27 日）指出，其规则适用于生成式 AI，“与会员公司使用任何其他技术或工具时一样”。监督、对公众的通信和记录保存要求照样适用。2023 年银行业的大多数限制措施正是由此而来。

### 欧盟《人工智能法》

《人工智能法》于 2024 年 8 月 1 日生效。禁止性做法的禁令和 AI 素养义务自 2025 年 2 月 2 日起适用，通用 AI 模型提供者的义务自 2025 年 8 月 2 日起适用。AI Omnibus 修正案，即第 (EU) 2026/1744 号条例，于 2026 年 7 月 24 日公布，7 月 27 日生效。它推迟了高风险规则的期限：独立高风险系统为 2027 年 12 月 2 日，其中包括简历筛选这类用于招聘的 AI；嵌入受监管产品的 AI 为 2028 年 8 月 2 日。第 50 条的透明度义务按原计划自 2026 年 8 月 2 日起适用，AI 素养义务则放宽为采取措施“支持”AI 素养。

如果公司只是用聊天助手起草邮件，《人工智能法》增加的负担很小。如果同一个助手开始给求职者排序，你就是在部署高风险系统，2027 年 12 月这个日期就和你有关了。

## 商业版套餐承诺了什么

如今每家大厂商都在卖商业版，默认设置与个人版应用不同。下表汇总了截至 2026 年 9 月各厂商自己页面上的说法。

| 产品 | 默认用你的数据训练吗？ | 保留期与控制 | 合规说明 |
| --- | --- | --- | --- |
| ChatGPT Free、Plus、Pro | 可能会，除非用户选择退出 | 按个人账户 | 与公司无合同 |
| ChatGPT Business、Enterprise、Edu | 否 | 工作区管理员设定保留期 | Enterprise 和 Business 有 SOC 2 Type 2 |
| OpenAI API | 否 | 30 天后删除；符合条件的用途可零数据保留 | 可签 BAA |
| Claude Team、Enterprise、API | 否 | 反馈最多可保留 5 年；所有者可关闭反馈 | 商业条款 |
| Microsoft 365 Copilot 和 Copilot Chat | 否，不用于训练基础模型 | 适用你的保留策略、标签和审计 | DPA、欧盟数据边界（不含 Anthropic 模型） |
| Google Workspace 中的 Gemini | 未经许可，不在你的域之外用于训练 | 适用现有 Workspace 控制 | 支持 HIPAA，FedRAMP High |

大型云平台里的模型端点走得更远。微软表示，Microsoft Foundry 中由 Azure 销售的模型，其提示词和生成结果“不会提供给 OpenAI 或其他提供者”，并在你选择的地理区域内处理，除非你选择 Global 或 DataZone 部署。在 Amazon Bedrock 上，模型运行在模型提供者无法访问的部署账户中，所以它们永远看不到你的提示词和生成结果。

商业版改变不了的是：文字仍然存放在厂商的服务器上，时长以保留条款允许的为准，法院命令也仍然能触及。这和你对邮件、文档服务商的信任是同一种。对大多数内部工作来说，这是合理的取舍。但对于商业机密、没有 BAA 的受监管数据，或者客户合同禁止发送给分包处理者的材料，可能就不合适了。

## 每种方案下你的提示词去了哪里

比较各种方案，最实在的办法是跟着一条提示词走，看谁能读到它。

<figure>
<svg viewBox="0 0 720 470" role="img" aria-labelledby="d1-title" xmlns="http://www.w3.org/2000/svg" font-family="system-ui, sans-serif" font-size="15">
<title id="d1-title">员工的提示词在五种 AI 方案中分别去了哪里，以及各自靠什么保护</title>
<rect x="0" y="0" width="720" height="470" fill="#ffffff"/>
<text x="325" y="30" text-anchor="middle" fill="#64748b">文字去了哪里</text>
<text x="475" y="30" fill="#64748b">靠什么保护</text>
<rect x="20" y="200" width="140" height="70" rx="10" fill="#eef2ff" stroke="#6366f1" stroke-width="2"/>
<text x="90" y="231" text-anchor="middle" fill="#1e1b4b">员工的</text>
<text x="90" y="252" text-anchor="middle" fill="#1e1b4b">提示词</text>
<line x1="160" y1="235" x2="200" y2="80" stroke="#6366f1" stroke-width="2"/>
<line x1="160" y1="235" x2="200" y2="160" stroke="#6366f1" stroke-width="2"/>
<line x1="160" y1="235" x2="200" y2="240" stroke="#6366f1" stroke-width="2"/>
<line x1="160" y1="235" x2="200" y2="320" stroke="#6366f1" stroke-width="2"/>
<line x1="160" y1="235" x2="200" y2="400" stroke="#6366f1" stroke-width="2"/>
<rect x="200" y="50" width="250" height="60" rx="10" fill="#ffffff" stroke="#f97316" stroke-width="2"/>
<text x="325" y="76" text-anchor="middle" fill="#1e1b4b">个人版聊天应用</text>
<text x="325" y="97" text-anchor="middle" fill="#64748b" font-size="13">个人的 Free、Plus 或 Pro 账户</text>
<text x="475" y="76" fill="#1e1b4b" font-size="14">默认允许用于训练</text>
<text x="475" y="97" fill="#1e1b4b" font-size="14">与你的公司没有合同</text>
<rect x="200" y="130" width="250" height="60" rx="10" fill="#eef2ff" stroke="#6366f1" stroke-width="2"/>
<text x="325" y="156" text-anchor="middle" fill="#1e1b4b">厂商商业版套餐</text>
<text x="325" y="177" text-anchor="middle" fill="#64748b" font-size="13">厂商的服务器，公司账户</text>
<text x="475" y="156" fill="#1e1b4b" font-size="14">默认不用于训练</text>
<text x="475" y="177" fill="#1e1b4b" font-size="14">DPA，保留期可控</text>
<rect x="200" y="210" width="250" height="60" rx="10" fill="#eef2ff" stroke="#6366f1" stroke-width="2"/>
<text x="325" y="236" text-anchor="middle" fill="#1e1b4b">你自己云里的模型端点</text>
<text x="325" y="257" text-anchor="middle" fill="#64748b" font-size="13">Azure Foundry、Amazon Bedrock</text>
<text x="475" y="236" fill="#1e1b4b" font-size="14">你的租户和区域</text>
<text x="475" y="257" fill="#1e1b4b" font-size="14">模型厂商看不到</text>
<rect x="200" y="290" width="250" height="60" rx="10" fill="#ffffff" stroke="#16a34a" stroke-width="2"/>
<text x="325" y="316" text-anchor="middle" fill="#1e1b4b">你自己的服务器</text>
<text x="325" y="337" text-anchor="middle" fill="#64748b" font-size="13">开放权重模型，你的网络</text>
<text x="475" y="316" fill="#1e1b4b" font-size="14">数据不出你的网络</text>
<text x="475" y="337" fill="#1e1b4b" font-size="14">运维和补丁全靠自己</text>
<rect x="200" y="370" width="250" height="60" rx="10" fill="#ffffff" stroke="#f97316" stroke-width="2"/>
<text x="325" y="396" text-anchor="middle" fill="#1e1b4b">市场上的 GPU（GPUFlow）</text>
<text x="325" y="417" text-anchor="middle" fill="#64748b" font-size="13">提供商自己的电脑</text>
<text x="475" y="396" fill="#1e1b4b" font-size="14">在那台机器上是明文</text>
<text x="475" y="417" fill="#1e1b4b" font-size="14">条款禁止记录</text>
<text x="360" y="458" text-anchor="middle" fill="#64748b" font-size="13">橙色：只适合公开数据。绿色：你自己的 IT 能存的数据都可以。</text>
</svg>
<figcaption>同一条提示词，五个去处。只有自托管方案让它留在你的网络之内；商业版套餐和云端点方案则让它处于你公司签署的合同约束之下。</figcaption>
</figure>

## 自己运行开放权重模型

处理机密数据最稳妥的方案，也是最费事的：下载一个开放权重模型（Llama、Qwen、Mistral、Gemma 等），在你自己网络内的机器上运行。提示词从不外出。记录什么、保存多久由你决定，这让记录保存和 GDPR 保留期规则更容易满足，也不会有别人的保留条款或法院命令碰到这些数据。

但代价是实打实的。你现在要运营一个推理服务：GPU、Ollama 或 vLLM 这样的引擎、身份认证、日志、更新，还要有人值班。而且能装进一块工作站显卡的 8B 或 14B 模型，在长链推理上不如前沿模型。做分类、提取字段、总结内部文档、起草常规文本，它们通常够用。做决定之前，先在你自己的任务上测一测。引擎的选择见我们的 [Ollama、vLLM 与 TGI 基准测试](/zh_cn/ollama-vs-vllm-vs-tgi-rtx-4090-benchmark/)，让模型适配你的文档见[私密微调 LLM 指南](/zh_cn/private-llm-fine-tuning-guide/)。

很多公司走的是一条中间路线：在已有的云账户里，用 GPU 实例运行开源模型。这样云服务商就是一个处理者，适用你早已为其他业务谈好的 DPA，完全不涉及任何模型厂商。

## 租用 GPU 和 GPUFlow 适合做什么

GPU 市场是整个市场里便宜的那一端，放进这个比较里，必须贴上清楚的标签。

GPUFlow 就是其中之一。你按小时租一块 GPU，拿到一个 OpenAI 兼容 API 密钥，用来调用提供商在上面运行的开源模型，通常通过 Ollama。模型运行在提供商自己的电脑上。这意味着租用期间，你的提示词和回答以明文经过那台机器。GPUFlow 的条款禁止提供商记录、读取、保留或分享租用者的请求和回答，GPUFlow 自己也不保存文本。但提供商在机器上有 root 权限，禁止记录这条规则靠合同执行，技术上没有任何东西拦着。

所以对于受监管数据或机密数据，GPUFlow **不是**答案。不要把客户记录、健康数据、你在意的源代码，或客户合同限制的任何内容发给它。我们自己的文档说得更直接：不要发送密码、卡号，或其他你不会告诉陌生人的秘密。

它适合的场景：在买显卡之前，先在真实硬件上试试开源模型；用公开数据或合成数据跑提示词；在把应用指向你自己的服务器之前，先对着 OpenAI 兼容 API 开发和测试。其他市场上的社区云机器，对你上传的任何东西都存在同样的问题；[如何在公共 GPU 节点上保护数据集](/zh_cn/how-to-secure-dataset-on-public-gpu-node/)讲的是这一面。

## 一套大家真会遵守的政策

一刀切地禁止而不提供替代方案，大多只会把使用转移到个人手机上，而那里你更看不见。更有效的做法是简短到让人记得住：

| 数据类别 | 示例 | 允许的工具 |
| --- | --- | --- |
| 公开 | 已发布的文档、营销文案 | 任何获批的工具，包括个人版应用 |
| 内部 | 制度文件、内部 wiki、不敏感的代码 | 签有 DPA 且关闭训练的商业版套餐 |
| 机密 | 客户数据、商业机密、交易条款 | 你租户内的云端点，或自托管 |
| 受监管 | 健康数据、银行卡数据、大量个人数据 | 自托管，或签有相应协议（BAA、DPA）的厂商 |

然后把不起眼的事做好：

1. 买一个商业版套餐或云端点，设为默认工具，并启用单点登录，这样员工离职时账户随之关闭。
2. 把保留期设为满足记录保存义务的最短期限，并在管理控制台确认已关闭训练。
3. 等获批的工具上线之后，再在受管设备上屏蔽个人版 AI 聊天网站。
4. 维护一份 AI 用途清单。凡是涉及招聘、信贷或类似决策的，都要在 2027 年 12 月之前单独审查。
5. 告诉大家应该怎么做，而不只是不许做什么。三星的备忘录发出时，数据早已离开了公司。

自托管与按 token 计费服务的运行成本对比，见[按小时租 GPU 还是按 token 调 API？](/zh_cn/hourly-gpu-vs-per-token-api/)。

## 资料来源

- 三星的限制措施和调查：[CNBC，2023 年 5 月 2 日](https://www.cnbc.com/2023/05/02/samsung-bans-use-of-ai-like-chatgpt-for-staff-after-misuse-of-chatbot.html)；事件细节：[The Register，2023 年 5 月 2 日](https://www.theregister.com/2023/05/02/samsung_generative_ai_ban/)
- 苹果和其他公司：[TechCrunch，2023 年 5 月 19 日](https://techcrunch.com/2023/05/19/apple-reportedly-limits-internal-use-of-ai-powered-tools-like-chatgpt-and-github-copilot/)
- 摩根大通 LLM Suite：[JPMorganChase 技术博客，2025 年 6 月 3 日](https://www.jpmorganchase.com/about/technology/blog/llmsuite-ab-award)
- OpenAI 商业条款：[企业隐私](https://openai.com/enterprise-privacy/)；个人版训练设置：[你的数据如何用于改进模型性能](https://help.openai.com/en/articles/5722486-how-your-data-is-used-to-improve-model-performance)
- 《纽约时报》案保全令：[OpenAI，对《纽约时报》数据要求的回应](https://openai.com/index/response-to-nyt-data-demands/)
- Anthropic：[商业数据与训练](https://privacy.claude.com/en/articles/7996868-is-my-data-used-for-model-training)、[个人版数据与训练](https://privacy.claude.com/en/articles/10023580-is-my-data-used-for-model-training)
- 微软：[Microsoft 365 Copilot 和 Copilot Chat 中的企业数据保护](https://learn.microsoft.com/en-us/copilot/microsoft-365/enterprise-data-protection)、[Azure 销售的 Foundry 模型的数据、隐私与安全](https://learn.microsoft.com/en-us/azure/ai-foundry/responsible-ai/openai/data-privacy)
- Google：[Google Workspace 生成式 AI 隐私中心](https://knowledge.workspace.google.com/admin/generative-ai/generative-ai-in-google-workspace-privacy-hub)
- AWS：[Amazon Bedrock 中的数据保护](https://docs.aws.amazon.com/bedrock/latest/userguide/data-protection.html)
- GDPR 第 28 条：[gdpr-info.eu](https://gdpr-info.eu/art-28-gdpr/)
- 数据隐私框架判决：[Jones Day，2025 年 9 月](https://www.jonesday.com/en/insights/2025/09/eu-general-court-upholds-euus-data-privacy-framework)；上诉：[Digital Policy Alert](https://digitalpolicyalert.org/event/35459-latombe-filed-appeal-against-general-court-dismissal-of-challenge-to-european-unionunited-states-data-protection-framework-adequacy-decision-in-latombe-v-commission)
- Garante 罚款：[The Hacker News，2024 年 12 月](https://thehackernews.com/2024/12/italy-fines-openai-15-million-for.html)
- HIPAA 与云服务商：[HHS，HIPAA 与云计算指南](https://www.hhs.gov/hipaa/for-professionals/special-topics/health-information-technology/cloud-computing/index.html)
- FINRA：[第 24-09 号监管通知](https://www.finra.org/rules-guidance/notices/24-09)
- 欧盟《人工智能法》：[欧盟委员会，AI Act](https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai)；Omnibus：[White & Case，EU AI Omnibus 生效](https://www.whitecase.com/insight-alert/eu-ai-omnibus-enters-force-amending-ai-act)
- GPUFlow：[API 快速入门](https://docs.gpuflow.app/zh-cn/renters/api-quickstart/)、[租用者能访问和不能访问的内容](https://docs.gpuflow.app/zh-cn/providers/security/)、[条款](https://gpuflow.app/zh-CN/terms)、[隐私政策](https://gpuflow.app/zh-CN/privacy)

均于 2026 年 9 月核实。
