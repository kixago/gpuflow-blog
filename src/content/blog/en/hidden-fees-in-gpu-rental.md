---
title: "The Real Cost of Renting a GPU: What the Hourly Price Leaves Out"
description: "Storage while stopped, bandwidth, minimum deposits, billing increments, idle time and card fees. What you actually pay on Vast.ai, RunPod, Lambda, AWS and GPUFlow beyond the hourly GPU price."
excerpt: "The hourly price is only part of the bill. Here is every extra charge we found on the main GPU rental platforms, with the numbers and the source for each."
pubDate: 2026-02-15
updatedDate: 2026-09-29
locale: "en"
category: "pricing"
featured: false
draft: false
author: "GPUFlow Team"
heroImage: "../_images/gpu-server-rack.jpg"
heroImageAlt: "Close-up of GPU server fans in a rack"
faq:
  - question: "Do GPU rental platforms charge for storage when the machine is stopped?"
    answer: "Often, yes. On RunPod a stopped pod's volume disk costs $0.20 per GB per month, twice the running rate. On Vast.ai storage is billed every second the instance exists, including while it is stopped. GPUFlow has no storage charge because a rental is an API key, not a machine."
  - question: "Which GPU rental platforms charge for bandwidth?"
    answer: "Vast.ai hosts set their own price for data sent and received, and every byte is billed. RunPod and Lambda say they do not charge for ingress or egress. AWS charges for data sent out to the internet after the first 100 GB per month."
  - question: "Is there a minimum amount I have to pay to start renting?"
    answer: "Vast.ai's minimum deposit is $5. Lambda places a $10 pre-authorization on your card. RunPod asks prepaid-card users to deposit at least $100 per transaction. GPUFlow top-ups start at $10 with no fee."
  - question: "Will my bank charge a fee when I pay for GPU rental in US dollars?"
    answer: "It can. Card foreign transaction fees are usually 1% to 3%, and some banks charge them on purchases from foreign merchants even when the price is shown in dollars. In Brazil, IOF tax on international card purchases is 3.5%."
---

The price on a GPU listing is per hour of GPU time. What you pay at the end of the month often includes other things: disk space, data transfer, the time it takes to set up, and fees from your own bank. None of them are hidden on purpose, but they are easy to miss when you compare platforms by the headline price alone.

This article lists every extra charge we could confirm on the main platforms, with a link to the source for each. We checked all of them in September 2026. Prices change, so check the links before you rely on a number.

## The short version

| Cost | Vast.ai | RunPod | Lambda | AWS EC2 | GPUFlow |
| --- | --- | --- | --- | --- | --- |
| Billing unit | Per second | Per second | Per minute | Per second, 60 s minimum | Per second, 1 min minimum |
| Storage while running | Set by host | $0.10/GB/month | Filesystems, per GB/month | $0.08/GB/month (gp3) | None |
| Storage while stopped | Yes, billed | $0.20/GB/month (volume disk) | Filesystems, per GB/month | $0.08/GB/month (gp3) | None |
| Data transfer | Set by host, every byte | Free | Free | Out to internet: first 100 GB/month free, then paid | None |
| Minimum to start | $5 deposit | 1 hour of credits; $100 for prepaid cards | $10 card pre-authorization | Payment method and a GPU quota | $10 top-up |

GPUFlow can skip storage and transfer charges because it rents something different: you get an API key for AI models running on someone's GPU, not a machine you log into. That also means you can't run your own code or training jobs on it. More on that below.

## 1. Storage, and especially storage while stopped

On platforms that rent you a machine or a container, your files live on a disk, and the disk costs money for as long as it exists.

- **RunPod** charges $0.10 per GB per month for container and volume disk while the pod runs. When you stop the pod, the container disk is gone and costs nothing, but the volume disk costs **$0.20 per GB per month**. Network volumes cost $0.07 per GB per month under 1 TB, running or not.
- **Vast.ai** lets each host set the storage price. It is billed every second the instance exists, including while it is stopped.
- **AWS** charges for EBS volumes whether the instance runs or not. A gp3 volume in us-east-1 costs $0.08 per GB per month.

A worked example: a 200 GB volume on a stopped RunPod pod costs 200 × $0.20 = **$40 per month**, even if you never start the pod again. That's more than 100 hours of an RTX 3090 at the typical marketplace prices we list further down.

**What to do:** delete volumes you're not using. If you only need your files between sessions, a small network volume is cheaper than keeping a large stopped pod.

## 2. Data transfer

Downloading a model and uploading a dataset can move tens of gigabytes.

- **Vast.ai:** each host sets a price for upload and download, and the docs say every byte is billed, whatever state the instance is in. Look at the bandwidth price on the listing before you rent, especially if you'll download large models.
- **RunPod** and **Lambda** say they don't charge for data in or out.
- **AWS:** data coming in is free. Data going out to the internet is free for the first 100 GB per month, then billed per GB. AWS also charges $0.005 per hour for each public IPv4 address, in use or not.

## 3. Minimum deposits and card holds

Most GPU platforms are prepaid. You buy credit first, then spend it.

- **Vast.ai:** minimum deposit $5.
- **RunPod:** you need at least one hour of credit for the machine you pick, and prepaid cards must deposit at least $100 per transaction.
- **Lambda:** a $10 pre-authorization on your card, refunded after a few days.
- **SaladCloud:** credit expires 12 months after purchase.
- **GPUFlow:** top-ups from $10 to $500, no fee, and credits don't expire.

Credit that expires or sits unused is a cost too. Buy what you expect to use.

## 4. Setup time is billed time

When you rent a machine, the clock starts when it starts, not when your job does. Installing drivers and libraries, pulling a container image and downloading a 15 GB model all happen on paid time. At $0.35 per hour, half an hour of setup is about $0.18. That's small for one session, but it adds up if you start fresh machines every day.

Two things help: use a template or container image that already has what you need, and keep models on a volume so you download them once (then weigh that against the storage cost from point 1).

On GPUFlow, the model is already installed on the provider's machine before you rent it. There is nothing to set up: you pay from the moment the rental starts, and the key works right away.

## 5. Billing increments and minimums

Per-second billing is common now, but minimums differ:

| Platform | How time is billed |
| --- | --- |
| Vast.ai | Per second, no minimum |
| RunPod pods | Per second |
| RunPod serverless | Per second, rounded up; you also pay for worker start time and an idle timeout (5 seconds by default) |
| Lambda | Per minute |
| AWS EC2 (Linux) | Per second, 60-second minimum |
| Google Cloud | Per second, 1-minute minimum |
| GPUFlow | Per second, 1-minute minimum |

Serverless is where increments matter most. If you send short requests with pauses between them, start time and idle timeout can cost more than the requests themselves.

## 6. Idle time on a running machine

A machine you rent by the hour costs the same whether the GPU is busy or waiting for you. Leaving a pod running overnight "so it's ready in the morning" is an easy way to overspend. Lambda says it plainly: instances are billed while running, whether or not they are being used.

**What to do:** set a reminder, or use a platform feature that stops idle machines. On GPUFlow you book a number of hours; if you finish early, click **End now** and the unused time goes back to your credits. [How GPUFlow billing works](https://docs.gpuflow.app/renters/billing/).

## 7. Interruptible machines

Interruptible (spot) machines are cheaper, often by half or more, but they can be stopped when someone pays more. Vast.ai calls them interruptible and says they are usually 50% or more cheaper. On TensorDock, storage is still billed while you're outbid. If your job can't restart from a checkpoint, an interruption means paying twice for the same work.

## 8. Your bank's fees

Almost every GPU platform charges in US dollars. If your card is in another currency, your bank may add a fee:

- Foreign transaction fees are usually **1% to 3%**. Some banks charge them on purchases from foreign merchants even when the price is shown in dollars.
- Many Canadian credit cards charge about **2.5%** on purchases in another currency.
- In Brazil, the **IOF tax on international card purchases is 3.5%**.

On a $100 top-up that's $1 to $3.50 you won't see on the platform's bill. A card with no foreign transaction fee removes most of it.

## 9. For providers: payout fees and minimums

If you rent out your own GPU, the platform takes a share and payouts have their own rules:

| Platform | What the provider keeps | Payout minimum | Payout fee |
| --- | --- | --- | --- |
| GPUFlow | 88% of the rental price | $25 | $2.50 per cash-out |
| Vast.ai | Vast says listed prices are typically about 25% above what hosts earn | $20 | Not stated by Vast; your payout service may charge |
| TensorDock | Its hosting agreement names a 20% or 25% fee (the text says both) | $250 before withdrawal | Not stated |

GPUFlow also holds earnings for 7 days (14 days for accounts younger than 30 days) before they can be cashed out, to cover card disputes. [How GPUFlow payouts work](https://docs.gpuflow.app/providers/getting-paid/).

## Typical GPU prices, September 2026

For context, these are the on-demand ranges we found across Vast.ai, RunPod, Salad, SimplePod, TensorDock, Hyperstack and Lambda in September 2026:

| GPU | Typical price per hour |
| --- | --- |
| RTX 3060 12 GB | $0.05 – $0.08 |
| RTX 3090 | $0.11 – $0.31 |
| RTX 4090 | $0.30 – $0.46 |
| RTX 5090 | $0.41 – $0.69 |

For comparison, one NVIDIA L4 on AWS (g6.xlarge in us-east-1) costs about $0.80 per hour, and one A10G (g5.xlarge) about $1.01.

## A checklist before you rent

1. Add up GPU time **plus** storage for as long as you keep the files.
2. Check the bandwidth price if the platform has one, and how much you'll download.
3. Count setup time as paid time.
4. Know how you'll stop paying: end the rental, stop the machine, delete the volume.
5. Check your card's foreign transaction fee.

If what you need is an AI model you can call from your code, and not a machine to run your own software, an API-based rental avoids points 1, 2 and 4 entirely. If you need a full machine for training, the platforms above are the right tool, and this checklist is how you keep the bill close to the hourly price.

## Related articles

- [Hourly GPU or per-token API? What running a 7B–8B model really costs](/en/hourly-gpu-vs-per-token-api/)
- [GPUFlow vs Vast.ai vs RunPod vs SaladCloud: which one fits your job](/en/gpuflow-vs-vast-ai-vs-runpod/)
- [What you need to rent a GPU in 2026](/en/what-you-need-to-rent-a-gpu/)

## Sources

All checked in September 2026.

- RunPod pod pricing and storage: [docs.runpod.io/pods/pricing](https://docs.runpod.io/pods/pricing)
- RunPod serverless billing: [docs.runpod.io/serverless/pricing](https://docs.runpod.io/serverless/pricing)
- RunPod billing and deposits: [docs.runpod.io/references/billing-information](https://docs.runpod.io/references/billing-information)
- Vast.ai pricing and billing: [docs.vast.ai/guides/instances/pricing.md](https://docs.vast.ai/guides/instances/pricing.md), [docs.vast.ai/documentation/reference/billing](https://docs.vast.ai/documentation/reference/billing)
- Vast.ai deposit: [docs.vast.ai quickstart](https://docs.vast.ai/guides/get-started/quickstart.md)
- Vast.ai host payouts: [docs.vast.ai/host/payment.md](https://docs.vast.ai/host/payment.md), host earnings article: [vast.ai](https://vast.ai/article/how-much-money-can-you-earn-renting-out-your-gpu-on-vast-ai)
- Lambda billing: [docs.lambda.ai/public-cloud/billing](https://docs.lambda.ai/public-cloud/billing/), [manage billing](https://docs.lambda.ai/public-cloud/manage-billing/), [pricing ("No egress fees")](https://lambda.ai/pricing)
- SaladCloud billing: [docs.salad.com billing](https://docs.salad.com/general/explanation/billing.md)
- TensorDock spot instances: [docs.tensordock.com](https://docs.tensordock.com/virtual-machines/spot-instances), supplier agreement: [docs.tensordock.com](https://docs.tensordock.com/legal-information/supplier-hosting-agreement.md)
- AWS EC2 billing: [aws.amazon.com/ec2/pricing/on-demand](https://aws.amazon.com/ec2/pricing/on-demand/); EBS: [aws.amazon.com/ebs/pricing](https://aws.amazon.com/ebs/pricing/); public IPv4: [aws.amazon.com/vpc/pricing](https://aws.amazon.com/vpc/pricing/)
- AWS instance prices: [instances.vantage.sh g6.xlarge](https://instances.vantage.sh/aws/ec2/g6.xlarge?region=us-east-1), [g5.xlarge](https://instances.vantage.sh/aws/ec2/g5.xlarge?region=us-east-1)
- Google Cloud VM billing: [cloud.google.com/compute/vm-instance-pricing](https://cloud.google.com/compute/vm-instance-pricing)
- Card foreign transaction fees: [Experian](https://www.experian.com/blogs/ask-experian/what-is-a-foreign-transaction-fee/), [NerdWallet Canada](https://www.nerdwallet.com/ca/p/best/credit-cards/best-no-foreign-transaction-fee-credit-cards)
- Brazil IOF 3.5%: [Wise Brazil](https://wise.com/br/blog/iof-cartao-internacional)
- GPU price ranges: [GPUFlow docs, How to price your GPU](https://docs.gpuflow.app/providers/pricing/)
