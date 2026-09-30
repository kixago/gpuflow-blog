---
title: "游戏显卡出租能赚多少钱：RTX 3060 到 RTX 5090 扣除手续费和电费后的实际收入"
description: "2026 年出租消费级显卡，算一笔明白账：当前租用价格、平台手续费，美国、加拿大、英国、德国和法国的电费，以及每天出租 4 小时和 12 小时每月能剩下多少。"
excerpt: "出租一小时能收多少、平台抽走多少、电费花掉多少、每月还剩多少。附上计算公式，你可以代入自己的数字。"
pubDate: 2026-09-29
locale: "zh_cn"
category: "guides"
featured: false
draft: false
author: "GPUFlow Team"
heroImage: "../_images/how-much-can-you-earn-renting-out-your-gpu-hero.png"
heroImageAlt: "显卡旁边越堆越高的硬币插图"
faq:
  - question: "RTX 4090 在 GPU 租用平台上每月能赚多少？"
    answer: "按 2026 年 9 月约每小时 $0.38 的常见价格、GPUFlow 12% 的手续费和美国平均电价计算，RTX 4090 每出租一小时净赚约 $0.25。每天出租 4 小时，每月约 $30；每天 12 小时，每月约 $91，这还没扣除电脑其他部件的耗电。"
  - question: "RTX 3060 值得出租吗？"
    answer: "勉强而已。按每小时 $0.05 到 $0.08 计算，扣除手续费和美国电费后，RTX 3060 每出租一小时净赚约 $0.03。每天出租 4 小时，每月约 $3。"
  - question: "出租 GPU 的电费怎么算？"
    answer: "用功耗（千瓦）乘以每千瓦时的电价。RTX 4090 按 450 W 整卡功耗计算，以 2026 年美国平均电价每千瓦时 18.2 美分算，每小时约 $0.08；在德国每小时约 €0.17。"
  - question: "哪些国家和地区可以提现 GPUFlow 的收益？"
    answer: "提现通过 Stripe 进行，目前支持美国、加拿大、英国、瑞士和欧洲经济区。"
---

如果你有一块一天大部分时间都闲着的游戏显卡，可以把它挂到租用平台上，按小时收钱。值不值得，取决于四个数字：

1. **租用者每小时为你的显卡付多少钱。**
2. **平台抽走多少。**
3. **运行时你要付多少电费。**
4. **每天实际能租出去几个小时。**

前三个很容易查到。第四个谁也没法向你保证，所以我们给出一个区间。以下所有价格均于 2026 年 9 月核实，出处附在文末。

## 1. 租用者付多少钱

以下是 2026 年 9 月各 GPU 租用网站（Vast.ai、RunPod、Salad、SimplePod、TensorDock、Hyperstack、Lambda）上常见的按需每小时价格：

| GPU | 常见每小时价格 | 区间中值 |
| --- | --- | --- |
| RTX 3060 12 GB | $0.05 – $0.08 | $0.065 |
| RTX 4070 | $0.07 – $0.15 | $0.11 |
| RTX 3090 | $0.11 – $0.31 | $0.21 |
| RTX 4080 | $0.23 – $0.27 | $0.25 |
| RTX 4090 | $0.30 – $0.46 | $0.38 |
| RTX 5090 | $0.41 – $0.69 | $0.55 |

显存和速度同样重要。3090 或 4090 这样的 24 GB 显卡[能跑比 12 GB 或 16 GB 显卡更大的 AI 模型](/zh_cn/which-ai-models-fit-your-gpu-vram/)，租用者愿意为此多付钱。

## 2. 平台抽走多少

| 平台 | 分成 | 提现 |
| --- | --- | --- |
| GPUFlow | 平台抽 12%，你得 88% | 通过 Stripe 转入你的银行账户。最低 $25，每次提现 $2.50。 |
| Vast.ai | Vast 表示挂牌价通常比主机方收入高约 25% | Wise、PayPal 或 Stripe。最低 $20，每周结算。 |
| Salad | 未公开 | PayPal、礼品卡、游戏等 |

各平台的运行方式也不一样。Vast.ai 的主机方运行 Ubuntu，租用者在主机上获得容器，可以通过 SSH 或 Jupyter 访问。Salad 运行在 Windows 10 或 11 上。在 GPUFlow 上，你只需在一台带 systemd 的 Linux 电脑上运行一条命令；租用者只能通过 API 访问你的 AI 模型，[永远拿不到你机器上的 shell](/zh_cn/is-it-safe-to-rent-out-your-gpu/)。[租用者能访问什么、不能访问什么](https://docs.gpuflow.app/zh-cn/providers/security/)。

## 3. 电费多少

公式：**功耗（kW）× 每千瓦时电价 = 每小时成本。**

功耗我们采用每块卡的官方整卡功耗。这基本就是显卡本身的最大功耗；在 AI 文本生成时往往更低。电脑其他部件还会额外耗电。最靠谱的办法是实测：GPUFlow 会在**我的机器**中显示 GPU 的实时功耗，插座式电量计则可以测出整台电脑的功耗。

| GPU | 整卡功耗 |
| --- | --- |
| RTX 3060 | 170 W |
| RTX 4070 | 200 W |
| RTX 3090 | 350 W |
| RTX 4080 | 320 W |
| RTX 4090 | 450 W |
| RTX 5090 | 575 W |

一块 450 W 的 RTX 4090 运行一小时的电费：

| 地区 | 居民电价 | 450 W 运行一小时 |
| --- | --- | --- |
| 美国（2026 年平均预测值） | 18.2 ¢/kWh | 约 $0.08 |
| 加拿大 | C$0.170/kWh | 约 C$0.08 |
| 英国（2026 年 10–12 月价格上限） | 26.32 p/kWh | 约 11.8 p |
| 德国 | €0.3869/kWh | 约 €0.17 |
| 法国 | €0.2561/kWh | 约 €0.12 |

在美国，电费大约占 4090 每出租一小时收入的四分之一。在德国，同样一小时的电费约为 €0.17，所以定价之前先查一下你自己的电价。

## 4. 综合计算

按区间中值价格、GPUFlow 88% 的分成和美国平均电价（按整卡满功耗）计算，每出租一小时：

| GPU | 你的所得（88%） | 电费 | 每出租一小时净赚 | 每天 4 小时（每月 120 小时） | 每天 12 小时（每月 360 小时） |
| --- | --- | --- | --- | --- | --- |
| RTX 3060 12 GB | $0.057 | $0.031 | **$0.026** | $3.15 | $9.45 |
| RTX 4070 | $0.097 | $0.036 | **$0.060** | $7.25 | $21.74 |
| RTX 3090 | $0.185 | $0.064 | **$0.121** | $14.53 | $43.60 |
| RTX 4080 | $0.220 | $0.058 | **$0.162** | $19.41 | $58.23 |
| RTX 4090 | $0.334 | $0.082 | **$0.253** | $30.30 | $90.90 |
| RTX 5090 | $0.484 | $0.105 | **$0.379** | $45.52 | $136.57 |

这张表没有算进去的有三项：

- **等待时间**。电脑必须开机并保持在线，租用者才能找到它。等待期间照样耗电。测一下电脑的待机功耗，把这部分也扣掉。
- **损耗**。长时间高负载下，风扇和硅脂老化得更快。保持机箱通风良好，注意温度。
- **税费**。租金收入也是收入，怎么纳税取决于你所在的地方。

## 数字说明了什么

- **RTX 3090、4080、4090 和 5090** 能有一笔像样的收入，前提是每天能租出去好几个小时。3090 性价比最高：24 GB 显存，电费又低。
- **RTX 3060 和 4070** 每小时赚得很少。每月 $3 的话，一块 3060 大约要八个月才能达到 GPUFlow $25 的最低提现金额。只有电费便宜或者电脑反正都开着的情况下才值得。
- **利用率决定一切**。同一块 4090，每天出租 4 小时还是 12 小时，每月收入就是 $30 和 $91 的差别。合理的价格加上稳定在线的机器，比降价几美分更能带来订单。

## 如何提高出租时长

1. **起步时把价格定在区间的下半段**。租用者会比价。有人租了之后，再把价格调上去。
2. **保持在线**。离线的 GPU 租不出去。在 GPUFlow 上，租用者可以对离线的 GPU 点击**上线时通知我**；有人在等时，你会收到一封邮件。
3. **提供热门模型**。在上架信息中写明你运行的模型，例如 `qwen2.5:7b` 或 `llama3.1:8b`。租用者会按模型名搜索。
4. **一周后再看看**。大部分时间都有人租？稍微提一点价。没人租？稍微降一点。

在 GPUFlow 上，上架表单会显示你的价格与其他租用网站以及 GPUFlow 上同型号其他上架相比处于什么位置，以及扣除手续费后你每小时能赚多少：

![GPUFlow 上架表单中的价格条，显示 RTX 4090 的常见价格和扣除手续费后的收益](../_images/screens/zh_cn/provider-price-bar.png)

## GPUFlow 支持提现的地区

GPUFlow 通过 Stripe 向**美国、加拿大、英国、瑞士和欧洲经济区**的银行账户付款。如果你在其他地区，仍然可以上架 GPU，并用赚到的钱租用其他 GPU，只是暂时还不能提现到银行。收益需暂扣 7 天（注册不满 30 天的账户暂扣 14 天）后才能提现。[在 GPUFlow 上获得收益](https://docs.gpuflow.app/zh-cn/providers/getting-paid/)。

## 用你自己的数字算一算

**（每小时价格 × 0.88）−（瓦数 ÷ 1,000 × 每千瓦时电价）= 每出租一小时的净收入**

然后乘以你实际预计能租出去的小时数。如果结果是每月几美元，大概不值得为此承担损耗。如果是几十美元，就值得试上一个月，看看真实的数字。

入门请参阅[让你的 GPU 上线](https://docs.gpuflow.app/zh-cn/providers/getting-started/)和[如何为你的 GPU 定价](https://docs.gpuflow.app/zh-cn/providers/pricing/)。

## 相关文章

- [GPUFlow、Vast.ai、RunPod 和 SaladCloud 对比：哪个适合你的任务](/zh_cn/gpuflow-vs-vast-ai-vs-runpod/)
- [GPU 租用的真实成本：小时价之外还要付哪些钱](/zh_cn/hidden-fees-in-gpu-rental/)

## 资料来源

均于 2026 年 9 月核实。

- GPU 租用价格区间：[GPUFlow 文档：如何为你的 GPU 定价](https://docs.gpuflow.app/zh-cn/providers/pricing/)
- GPUFlow 手续费、暂扣和提现：[GPUFlow 文档：获得收益](https://docs.gpuflow.app/zh-cn/providers/getting-paid/)
- Vast.ai 主机方收益：[vast.ai 文章](https://vast.ai/article/how-much-money-can-you-earn-renting-out-your-gpu-on-vast-ai)（2026 年 5 月 18 日）；提现：[docs.vast.ai/host/payment.md](https://docs.vast.ai/host/payment.md)；托管要求：[docs.vast.ai/host/hosting-overview.md](https://docs.vast.ai/host/hosting-overview.md)
- Salad：[salad.com/download](https://salad.com/download/)、[PayPal 兑换](https://support.salad.com/rewards/redeeming-your-rewards/how-to-redeem-paypal/)
- 整卡功耗：NVIDIA 产品页面 [RTX 3060](https://www.nvidia.com/en-us/geforce/graphics-cards/30-series/rtx-3060-3060ti/)、[RTX 4080](https://www.nvidia.com/en-us/geforce/graphics-cards/40-series/rtx-4080-family/)、[RTX 4090](https://www.nvidia.com/en-us/geforce/graphics-cards/40-series/rtx-4090/)、[RTX 5090](https://www.nvidia.com/en-us/geforce/graphics-cards/50-series/rtx-5090/)；RTX 3090：[TechPowerUp](https://www.techpowerup.com/gpu-specs/geforce-rtx-3090.c3622)；RTX 4070：[TechSpot](https://www.techspot.com/review/2663-nvidia-geforce-rtx-4070/)
- 美国电价：[EIA 短期能源展望](https://www.eia.gov/outlooks/steo/report/elec_coal_renew.php)（2026 年 9 月）
- 英国电价：[Ofgem 价格上限](https://www.ofgem.gov.uk/your-energy-supply/your-energy-bill/energy-price-cap-unit-rates-and-standing-charges)
- 德国和法国电价，2025 年下半年：[Eurostat 电价统计](https://ec.europa.eu/eurostat/statistics-explained/index.php?title=Electricity_price_statistics)、[Eurostat nrg_pc_204 法国数据](https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/nrg_pc_204?geo=FR&nrg_cons=KWH2500-4999&unit=KWH&tax=I_TAX&currency=EUR&lastTimePeriod=1)
- 加拿大电价，2025 年 6 月：[GlobalPetrolPrices](https://www.globalpetrolprices.com/Canada/electricity_prices/)
