---
title: "What Your Gaming GPU Can Earn: RTX 3060 to RTX 5090, After Fees and Electricity"
description: "Honest math for renting out a consumer GPU in 2026: current rental prices, platform fees, electricity in the US, Canada, UK, Germany and France, and what's left per month at 4 and 12 rented hours a day."
excerpt: "What a rented hour pays, what the platform keeps, what your power bill takes, and what's left each month. With the formula so you can use your own numbers."
pubDate: 2026-09-29
locale: "en"
category: "guides"
featured: false
draft: false
author: "GPUFlow Team"
heroImage: "../_images/test-hero.jpg"
heroImageAlt: "A triple-fan gaming graphics card on a white shelf"
faq:
  - question: "How much can an RTX 4090 earn per month on a GPU rental marketplace?"
    answer: "At a typical September 2026 price of about $0.38 per hour, GPUFlow's 12% fee and US average electricity, an RTX 4090 clears about $0.25 per rented hour. That's about $30 a month if it's rented 4 hours a day and about $91 at 12 hours a day, before the power the rest of the PC uses."
  - question: "Is it worth renting out an RTX 3060?"
    answer: "Only barely. At $0.05 to $0.08 per hour, an RTX 3060 clears about $0.03 per rented hour after fees and US electricity. At 4 rented hours a day that's about $3 a month."
  - question: "How much does electricity cost to run a GPU for rent?"
    answer: "Multiply the power draw in kilowatts by your price per kWh. An RTX 4090 at its 450 W board power costs about $0.08 per hour at the 2026 US average of 18.2 cents per kWh, and about €0.17 per hour in Germany."
  - question: "Which countries can cash out GPUFlow earnings?"
    answer: "Payouts go through Stripe and currently work in the United States, Canada, the United Kingdom, Switzerland and the European Economic Area."
---

If you have a gaming GPU that sits idle most of the day, you can rent it out on a marketplace and get paid by the hour. Whether it's worth it comes down to four numbers:

1. **What renters pay** per hour for your card.
2. **What the platform keeps.**
3. **What the electricity costs you** while it runs.
4. **How many hours a day it's actually rented.**

The first three are easy to look up. The fourth is the one nobody can promise you, so we show a range. All prices below were checked in September 2026; sources are at the end.

## 1. What renters pay

These are typical on-demand prices per hour on GPU rental sites (Vast.ai, RunPod, Salad, SimplePod, TensorDock, Hyperstack, Lambda) in September 2026:

| GPU | Typical price per hour | Middle of the range |
| --- | --- | --- |
| RTX 3060 12 GB | $0.05 – $0.08 | $0.065 |
| RTX 4070 | $0.07 – $0.15 | $0.11 |
| RTX 3090 | $0.11 – $0.31 | $0.21 |
| RTX 4080 | $0.23 – $0.27 | $0.25 |
| RTX 4090 | $0.30 – $0.46 | $0.38 |
| RTX 5090 | $0.41 – $0.69 | $0.55 |

Memory matters as much as speed. A 24 GB card like the 3090 or 4090 can run bigger AI models than a 12 GB or 16 GB card, and renters pay for that.

## 2. What the platform keeps

| Platform | Share | Payouts |
| --- | --- | --- |
| GPUFlow | Keeps 12%, you get 88% | To your bank through Stripe. $25 minimum, $2.50 per cash-out. |
| Vast.ai | Vast says listed prices are typically about 25% above what hosts earn | Wise, PayPal or Stripe. $20 minimum, invoiced weekly. |
| Salad | Not published | PayPal, gift cards, games and more |

The setups differ too. Vast.ai hosts run Ubuntu, and renters get containers on the host with SSH or Jupyter access. Salad runs on Windows 10 or 11. On GPUFlow you run one command on a Linux computer with systemd; renters only reach your AI models through an API, never a shell on your machine. [What renters can and can't reach](https://docs.gpuflow.app/providers/security/).

## 3. What the electricity costs

The formula: **power draw in kW × your price per kWh = cost per hour.**

For the power draw, we use each card's official board power. That's close to the most the card itself will draw; during AI text generation it's often less. The rest of your PC adds to it. The honest way is to measure: GPUFlow shows your GPU's live power draw on **My Machines**, and a plug-in power meter shows the whole PC.

| GPU | Board power |
| --- | --- |
| RTX 3060 | 170 W |
| RTX 4070 | 200 W |
| RTX 3090 | 350 W |
| RTX 4080 | 320 W |
| RTX 4090 | 450 W |
| RTX 5090 | 575 W |

What one hour of an RTX 4090 at 450 W costs in power:

| Where | Household price | One hour at 450 W |
| --- | --- | --- |
| United States (2026 average forecast) | 18.2 ¢/kWh | about $0.08 |
| Canada | C$0.170/kWh | about C$0.08 |
| United Kingdom (Oct–Dec 2026 price cap) | 26.32 p/kWh | about 11.8 p |
| Germany | €0.3869/kWh | about €0.17 |
| France | €0.2561/kWh | about €0.12 |

In the US, power takes about a quarter of what a 4090 earns per rented hour. In Germany the same hour costs about €0.17, so check your own rate before you set a price.

## 4. Putting it together

Per rented hour at the middle price, with GPUFlow's 88% share and US average electricity at full board power:

| GPU | You get (88%) | Electricity | Left per rented hour | 4 h/day (120 h/month) | 12 h/day (360 h/month) |
| --- | --- | --- | --- | --- | --- |
| RTX 3060 12 GB | $0.057 | $0.031 | **$0.026** | $3.15 | $9.45 |
| RTX 4070 | $0.097 | $0.036 | **$0.060** | $7.25 | $21.74 |
| RTX 3090 | $0.185 | $0.064 | **$0.121** | $14.53 | $43.60 |
| RTX 4080 | $0.220 | $0.058 | **$0.162** | $19.41 | $58.23 |
| RTX 4090 | $0.334 | $0.082 | **$0.253** | $30.30 | $90.90 |
| RTX 5090 | $0.484 | $0.105 | **$0.379** | $45.52 | $136.57 |

Three things this table doesn't include:

- **Waiting time.** Your PC has to be on and online for renters to find it. While it waits, it still uses power. Measure your PC at idle and subtract that too.
- **Wear.** Fans and thermal paste age faster under long loads. Keep the case well ventilated and watch the temperature.
- **Taxes.** Rental income is income. How it's taxed depends on where you live.

## What the numbers say

- **RTX 3090, 4080, 4090 and 5090** can earn a meaningful amount, if they're rented several hours a day. The 3090 is the value pick: 24 GB of memory at a low power cost.
- **RTX 3060 and 4070** earn very little per hour. At $3 a month, a 3060 would take about eight months to reach GPUFlow's $25 cash-out minimum. It's worth it only if your electricity is cheap or the PC is on anyway.
- **Utilization decides everything.** The same 4090 makes $30 or $91 a month depending on whether it's rented 4 or 12 hours a day. A fair price and a machine that's reliably online get more rentals than a few cents' discount.

## How to get more rented hours

1. **Price in the lower half of the range at first.** Renters compare. You can raise the price once you're getting rentals.
2. **Stay online.** An offline GPU can't be rented. On GPUFlow, renters can click **Notify When Online** on an offline GPU; you get an email when someone is waiting.
3. **Serve popular models.** Name the models you run in your listing, for example `qwen2.5:7b` or `llama3.1:8b`. Renters search for them.
4. **Check again after a week.** Rented most of the time? Raise the price a little. No rentals? Lower it a little.

On GPUFlow, the listing form shows where your price sits compared with other rental sites and other GPUFlow listings of the same card, and what you earn per hour after the fee:

![The price bar on the GPUFlow listing form, showing a typical price for an RTX 4090 and the earnings after the fee](../_images/screens/en/provider-price-bar.png)

## Where GPUFlow payouts work

GPUFlow pays out through Stripe to bank accounts in the **United States, Canada, the United Kingdom, Switzerland and the European Economic Area**. If you live elsewhere, you can still list a GPU and spend what you earn on renting other GPUs, but you can't cash out to a bank yet. Earnings are held for 7 days (14 days for accounts younger than 30 days) before you can cash them out. [Getting paid on GPUFlow](https://docs.gpuflow.app/providers/getting-paid/).

## Try the math with your own numbers

**(price per hour × 0.88) − (watts ÷ 1,000 × price per kWh) = what's left per rented hour**

Then multiply by the hours you realistically expect. If the answer is a few dollars a month, it's probably not worth the wear. If it's tens of dollars, it's worth trying for a month and looking at the real numbers.

To start, see [put your GPU online](https://docs.gpuflow.app/providers/getting-started/) and [how to price your GPU](https://docs.gpuflow.app/providers/pricing/).

## Related articles

- [GPUFlow vs Vast.ai vs RunPod vs SaladCloud: which one fits your job](/en/gpuflow-vs-vast-ai-vs-runpod/)
- [The real cost of renting a GPU: what the hourly price leaves out](/en/hidden-fees-in-gpu-rental/)

## Sources

All checked in September 2026.

- GPU rental price ranges: [GPUFlow docs, How to price your GPU](https://docs.gpuflow.app/providers/pricing/)
- GPUFlow fee, hold and payouts: [GPUFlow docs, Getting paid](https://docs.gpuflow.app/providers/getting-paid/)
- Vast.ai host earnings: [vast.ai article](https://vast.ai/article/how-much-money-can-you-earn-renting-out-your-gpu-on-vast-ai) (May 18, 2026); payouts: [docs.vast.ai/host/payment.md](https://docs.vast.ai/host/payment.md); hosting requirements: [docs.vast.ai/host/hosting-overview.md](https://docs.vast.ai/host/hosting-overview.md)
- Salad: [salad.com/download](https://salad.com/download/), [PayPal redemption](https://support.salad.com/rewards/redeeming-your-rewards/how-to-redeem-paypal/)
- Board power: NVIDIA product pages for [RTX 3060](https://www.nvidia.com/en-us/geforce/graphics-cards/30-series/rtx-3060-3060ti/), [RTX 4080](https://www.nvidia.com/en-us/geforce/graphics-cards/40-series/rtx-4080-family/), [RTX 4090](https://www.nvidia.com/en-us/geforce/graphics-cards/40-series/rtx-4090/), [RTX 5090](https://www.nvidia.com/en-us/geforce/graphics-cards/50-series/rtx-5090/); RTX 3090: [TechPowerUp](https://www.techpowerup.com/gpu-specs/geforce-rtx-3090.c3622); RTX 4070: [TechSpot](https://www.techspot.com/review/2663-nvidia-geforce-rtx-4070/)
- US electricity: [EIA Short-Term Energy Outlook](https://www.eia.gov/outlooks/steo/report/elec_coal_renew.php) (September 2026)
- UK electricity: [Ofgem price cap](https://www.ofgem.gov.uk/your-energy-supply/your-energy-bill/energy-price-cap-unit-rates-and-standing-charges)
- Germany and France electricity, second half of 2025: [Eurostat electricity price statistics](https://ec.europa.eu/eurostat/statistics-explained/index.php?title=Electricity_price_statistics), [Eurostat nrg_pc_204 data for France](https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/nrg_pc_204?geo=FR&nrg_cons=KWH2500-4999&unit=KWH&tax=I_TAX&currency=EUR&lastTimePeriod=1)
- Canada electricity, June 2025: [GlobalPetrolPrices](https://www.globalpetrolprices.com/Canada/electricity_prices/)
