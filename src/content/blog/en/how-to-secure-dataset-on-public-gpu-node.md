---
title: "How to Secure Your Dataset on a Rented or Public GPU Node"
description: "The host of a rented GPU can read anything your job decrypts. What encryption, secure cloud and H100 confidential computing fix, and how to clean up after."
excerpt: "Renting a GPU means someone else has root on the machine that holds your data. Here is the threat model, what each defence really covers, and a cleanup routine that works on modern disks."
pubDate: 2026-02-26
updatedDate: 2026-09-30
locale: "en"
category: "guides"
featured: false
draft: false
author: "GPUFlow Team"
authorUrl: "https://gpuflow.app"
heroImage: "../_images/secure-server-room-abstract.png"
heroImageAlt: "Abstract secure server environment representing protected AI data processing"
faq:
  - question: "Can the host of a rented GPU see my data?"
    answer: "Technically, yes. The host has root on the physical machine, and your data has to be decrypted in memory to train or run a model. Only confidential computing, such as H100 confidential VMs on Azure or Google Cloud, takes the host out of that picture."
  - question: "Does shred securely delete files on a cloud GPU instance?"
    answer: "Not reliably. The GNU shred manual says it only works if the file system and hardware overwrite data in place, which journaled and copy-on-write file systems, snapshots and SSDs do not guarantee. Encrypt the data before it lands on disk and destroy the instance instead."
  - question: "What is the difference between RunPod Secure Cloud and Community Cloud?"
    answer: "RunPod's docs describe Secure Cloud as running in T3/T4 data centers and suited to production and sensitive data, and Community Cloud as peer-to-peer providers with variable reliability. RunPod is no longer accepting new Community Cloud hosts."
  - question: "Which cloud GPUs support confidential computing?"
    answer: "As of September 2026, Azure offers NCCads H100 v5 confidential VMs with one H100 NVL GPU on AMD SEV-SNP, and Google Cloud offers confidential a3-highgpu-1g (one H100, Intel TDX) and G4 (RTX PRO 6000, AMD SEV). Consumer GeForce cards are not in these lists."
  - question: "Is it safe to put personal data on a rented GPU under GDPR?"
    answer: "Only if the provider is a processor with a contract meeting Article 28 GDPR and a lawful transfer route if the machine is outside the EU. Most peer-to-peer hosts have no such contract with you, so de-identify the data first or use a data-center provider that signs a DPA."
  - question: "Can I train or fine-tune a model on GPUFlow?"
    answer: "No. GPUFlow is inference only: you get an OpenAI-compatible API key for a model running on a provider's computer, with no SSH, shell or file access. Prompts reach that computer in plaintext, so do not send confidential records through it."
---

When you rent a GPU, someone else has root on the machine that holds your data. Encryption protects the dataset on the way there and while it sits on disk, but your training job has to decrypt it in memory to use it, and at that point a determined host can read it. So the real decisions are who you trust (a vetted data center or an anonymous home server), how little data you send, and whether you need confidential computing, which is the only option that takes the host operator out of the trust chain.

This guide covers machines you log into, such as instances on Vast.ai or RunPod. It works through the threat model, what each defence covers, and a cleanup routine that holds up on modern storage. Sources are at the end; everything was checked in September 2026.

## The threat model

Start by naming who could get at the data and how. On a rented GPU instance there are seven realistic routes.

<figure>
<svg viewBox="0 0 720 430" role="img" aria-labelledby="d1-title" xmlns="http://www.w3.org/2000/svg" font-family="system-ui, sans-serif" font-size="15">
<title id="d1-title">Threat model for a dataset on a rented GPU instance: seven routes to the data and the main defence for each</title>
<rect x="0" y="0" width="720" height="430" fill="#ffffff"/>
<line x1="220" y1="75" x2="240" y2="170" stroke="#e2e8f0" stroke-width="2"/>
<line x1="220" y1="220" x2="240" y2="215" stroke="#e2e8f0" stroke-width="2"/>
<line x1="220" y1="365" x2="240" y2="270" stroke="#e2e8f0" stroke-width="2"/>
<line x1="500" y1="75" x2="480" y2="170" stroke="#e2e8f0" stroke-width="2"/>
<line x1="500" y1="220" x2="480" y2="215" stroke="#e2e8f0" stroke-width="2"/>
<line x1="500" y1="365" x2="480" y2="270" stroke="#e2e8f0" stroke-width="2"/>
<line x1="360" y1="330" x2="360" y2="290" stroke="#e2e8f0" stroke-width="2"/>
<rect x="240" y="140" width="240" height="150" rx="12" fill="#eef2ff" stroke="#6366f1" stroke-width="2"/>
<text x="360" y="170" text-anchor="middle" fill="#1e1b4b" font-weight="bold">Your rented instance</text>
<text x="360" y="205" text-anchor="middle" fill="#1e1b4b">Dataset</text>
<text x="360" y="235" text-anchor="middle" fill="#1e1b4b">Weights and checkpoints</text>
<text x="360" y="265" text-anchor="middle" fill="#1e1b4b">Tokens and keys</text>
<rect x="20" y="40" width="200" height="70" rx="10" fill="#ffffff" stroke="#f97316" stroke-width="2"/>
<text x="120" y="68" text-anchor="middle" fill="#1e1b4b">Host operator</text>
<text x="120" y="92" text-anchor="middle" fill="#64748b" font-size="13">Fix: vetted host, or CC</text>
<rect x="20" y="185" width="200" height="70" rx="10" fill="#ffffff" stroke="#f97316" stroke-width="2"/>
<text x="120" y="213" text-anchor="middle" fill="#1e1b4b">Network path</text>
<text x="120" y="237" text-anchor="middle" fill="#64748b" font-size="13">Fix: SSH, no open ports</text>
<rect x="20" y="330" width="200" height="70" rx="10" fill="#ffffff" stroke="#f97316" stroke-width="2"/>
<text x="120" y="358" text-anchor="middle" fill="#1e1b4b">Disk remnants</text>
<text x="120" y="382" text-anchor="middle" fill="#64748b" font-size="13">Fix: encrypt, then destroy</text>
<rect x="500" y="40" width="200" height="70" rx="10" fill="#ffffff" stroke="#f97316" stroke-width="2"/>
<text x="600" y="68" text-anchor="middle" fill="#1e1b4b">Marketplace platform</text>
<text x="600" y="92" text-anchor="middle" fill="#64748b" font-size="13">Fix: contract and DPA</text>
<rect x="500" y="185" width="200" height="70" rx="10" fill="#ffffff" stroke="#f97316" stroke-width="2"/>
<text x="600" y="213" text-anchor="middle" fill="#1e1b4b">Other tenants</text>
<text x="600" y="237" text-anchor="middle" fill="#64748b" font-size="13">Fix: VM or whole machine</text>
<rect x="500" y="330" width="200" height="70" rx="10" fill="#ffffff" stroke="#f97316" stroke-width="2"/>
<text x="600" y="358" text-anchor="middle" fill="#1e1b4b">Snapshots, volumes</text>
<text x="600" y="382" text-anchor="middle" fill="#64748b" font-size="13">Fix: no persistent copies</text>
<rect x="260" y="330" width="200" height="70" rx="10" fill="#ffffff" stroke="#f97316" stroke-width="2"/>
<text x="360" y="358" text-anchor="middle" fill="#1e1b4b">Your own leftovers</text>
<text x="360" y="382" text-anchor="middle" fill="#64748b" font-size="13">Fix: scoped, rotated tokens</text>
</svg>
<figcaption>Everything on the instance is exposed to the host operator while the job runs. The other routes are closed by ordinary hygiene; that one needs either a host you trust or confidential computing.</figcaption>
</figure>

**The host operator.** Whoever owns the physical machine has root on it. On a container marketplace such as Vast.ai, clients run in unprivileged Docker containers, which isolates you from other tenants but not from the host: root on the host can read a container's files and memory. That is how containers work on every platform.

**The network path.** Data travelling from your laptop or bucket to the node. This is the easiest route to close.

**The marketplace platform.** The company between you and the host holds your account, your SSH keys and whatever its own logs keep. What it may do with them is set by its terms, which is why the contract section below matters.

**Disk remnants.** Files you delete may survive on the disk after your rental, where the next renter or the host could find them.

**Snapshots and persistent volumes.** Copies you asked for (a network volume, a stopped instance) or the host made (backups) outlive the job.

**Other tenants.** Other customers on the same machine. With VM isolation or a whole machine to yourself this risk is small, but GPUs have had real bugs here. LeftoverLocals (CVE-2023-4969) let one process read another's GPU local memory on some Apple, AMD and Qualcomm GPUs; Trail of Bits recovered about 181 MB per LLM query on an AMD Radeon RX 7900 XT, enough to rebuild the model's answer. Trail of Bits found no sign of it on NVIDIA, ARM or Intel GPUs.

**Your own leftovers.** A Hugging Face token, cloud keys or an SSH private key left on the node. In practice this is how most leaks start.

## What encryption covers, and what it can't

Encryption has three jobs, and a rented GPU lets you do two of them yourself.

**In transit:** easy. Use SSH (`scp`, `sftp`, `rsync -e ssh`) or HTTPS from a bucket. Vast.ai states that SSH connections and its API are encrypted. Never use plain HTTP links or unauthenticated file-sharing services.

**At rest:** encrypt before upload so the file on the host's disk is useless without the key. [age](https://github.com/FiloSottile/age) is the simplest tool for this:

```bash
# on your own machine
tar -cf - train/ | age -p > train.tar.age
scp -P 22345 train.tar.age user@203.0.113.42:/workspace/
```

On the node, decrypt straight into memory so the plaintext never touches the disk:

```bash
mkdir -p /dev/shm/train
age -d /workspace/train.tar.age | tar -xf - -C /dev/shm/train
```

`age -d` asks for the passphrase at the terminal, so the key is never written to the node. `/dev/shm` is a RAM-backed file system; check its size with `df -h /dev/shm` first, because container setups often make it small. If the data doesn't fit in RAM, you will need a decrypted copy on disk, and the cleanup section below matters more.

Full-disk encryption with LUKS is the usual answer on your own servers, but you generally can't set up dm-crypt inside an unprivileged container, and the host would hold the running key anyway.

**In use:** this is the gap. To train, the GPU needs plaintext tensors, and the CPU memory feeding it holds plaintext too. Anyone with root on the host can in principle dump that memory. Encryption at rest does nothing against a live, hostile host. Only hardware-based confidential computing addresses it.

## Secure cloud or community cloud

Because the host is the one risk hygiene can't remove, picking the host is the biggest decision you make. The two big marketplaces split their supply for this reason.

| Option | Who runs the hardware | What the platform says |
| --- | --- | --- |
| RunPod Secure Cloud | T3/T4 data centers | For "production, sensitive data" |
| RunPod Community Cloud | Peer-to-peer providers | For "cost-sensitive workloads"; no new hosts accepted |
| Vast.ai Secure Cloud | Vetted data centers | ISO 27001, Tier 3/4 standards, verified physical security |
| Other Vast.ai hosts | Data centers down to individuals | Individual hosts "may have less formal security measures" |

Vast.ai's own advice for sensitive data is to use Secure Cloud providers only, encrypt data at rest, keep credentials off instances and use external key management. That matches what I'd tell anyone.

Two limits apply even in a certified data center. First, ISO 27001 certifies the operator's processes; it can't rule out a dishonest insider. Second, a host that processes personal data for you is a processor under GDPR, and Article 28 expects a contract covering it, while the marketplace sits between you and the host. Read which company you actually contract with and what it promises about its hosts.

For truly sensitive work, the next step up is a GPU instance in a hyperscaler account you already have a DPA and possibly a BAA with, which moves you out of marketplace territory and costs more per hour. Our [GPU rental pricing comparison](/en/gpu-rental-pricing-comparison-2026/) shows the price ranges.

## Confidential computing on H100 GPUs

Confidential computing (CC) is the only technology here that is designed to protect data from the host operator while the job runs. On NVIDIA Hopper and Blackwell data center GPUs, the setup works like this:

- The workload runs in a confidential VM (CVM) backed by AMD SEV-SNP or Intel TDX on the CPU. NVIDIA's design assumes the hypervisor and host OS may be compromised; an operator with access to the hypervisor "or even the system itself" should not be able to read CVM memory.
- Before use, the VM checks that the GPU is genuine and in CC mode with a signed device certificate, which can be checked against NVIDIA's Remote Attestation Service (NRAS).
- Data, command buffers and CUDA kernels crossing PCIe are encrypted and signed, passing through an encrypted bounce buffer in shared memory.

NVIDIA made single-GPU CC with H100 generally available with CUDA 12.4 in April 2024. Where you can actually rent it as of September 2026:

| Cloud | Instance | GPU | CPU TEE |
| --- | --- | --- | --- |
| Azure | NCCads H100 v5 | 1 × H100 NVL, 94 GB | AMD SEV-SNP (EPYC Genoa) |
| Google Cloud | a3-highgpu-1g, Confidential VM | 1 × H100 | Intel TDX |
| Google Cloud | g4-standard-48, Confidential VM | RTX PRO 6000 | AMD SEV |

Know the limits before you build on it:

- **One GPU per VM.** Azure's series has one GPU, and Google's confidential GPU VMs don't support multi-node clusters. Large multi-GPU training runs are out.
- **Provisioning.** On Google Cloud, confidential A3 High runs only as Spot or flex-start and doesn't support reservations.
- **Transfer speed.** NVIDIA's 2023 technical write-up put CPU-to-GPU bandwidth in CC mode at about 4 GB/s, limited by CPU encryption. Loading a 16 GB checkpoint therefore takes about 16 ÷ 4 = 4 seconds of pure transfer, fine for inference, but a data pipeline that streams many gigabytes per step will feel it. Later driver releases list performance work, so measure your own job.
- **GPU memory is not encrypted.** NVIDIA leaves the on-package HBM in plaintext, on the reasoning that common physical attack tools can't reach it.
- **Not on marketplaces.** The consumer GeForce cards common on Vast.ai and RunPod community hosts are not in any of these supported lists.

CC changes who you have to trust: NVIDIA's hardware and attestation, the CPU vendor, and your own VM image, instead of the host's staff. For regulated data where the answer "the cloud provider's admins can't read it" matters, it is the only option on rented hardware that gets you there.

## Before and during the job

### Minimise before you upload

The cheapest protection is data that never leaves your machine. Before transfer:

- Drop columns the model doesn't need, especially names, emails, account numbers and free-text notes.
- Replace direct identifiers with random tokens and keep the lookup table at home.
- Cut the corpus to what the method needs. A LoRA or QLoRA fine-tune adjusts a small set of extra weights and rarely needs a whole production database; our [fine-tuning guide](/en/private-llm-fine-tuning-guide/) walks through a realistic setup.
- Remember that model weights carry information. A model fine-tuned on sensitive text can repeat pieces of it, so treat the adapter as sensitive too.

De-identified data is also what makes most of the legal questions below go away.

### Credentials and network on the node

Assume anything you put on the node could be copied.

- Use a fine-grained Hugging Face token with read access to the one repo you need, and revoke it when the job ends.
- Never copy your main SSH private key, cloud root credentials or production database passwords to a rented machine. If the job must write results to a bucket, create a key that can only write to one prefix and expires within a day.
- Pull results back over SSH instead of pushing them from the node with long-lived keys.
- Check what is listening with `ss -tulnp`. Bind Jupyter, TensorBoard and inference servers to `127.0.0.1` and reach them through an SSH tunnel (`ssh -L 8888:127.0.0.1:8888 ...`) instead of exposing a public port.

## Cleanup that survives modern disks

The usual advice is to `shred` the dataset when you're done. It doesn't do what people think. The GNU coreutils manual says `shred` relies on the file system and hardware overwriting data in place, and lists the cases where that fails: journaled and log-structured file systems such as ext4 in `data=journal` mode, Btrfs, XFS and ZFS, RAID, file systems with snapshots, compressed file systems, and SSDs, whose wear levelling writes new data somewhere else. A rented GPU node is very likely several of those at once.

What works instead:

1. **Make the disk copy worthless.** If only the age-encrypted archive ever touched the disk, deleting it is enough; without the passphrase it is noise. NIST's media sanitisation guide (SP 800-88 Rev. 2, September 2025) treats this idea, cryptographic erase, as a standard technique.
2. **Destroy, don't stop.** On Vast.ai, stopping an instance preserves its data (and keeps billing for storage); destroying it "permanently deletes instance and all data". On RunPod, the container disk is cleared when a pod stops, the `/workspace` volume survives stops and is deleted on terminate, and a network volume survives everything until you delete it.
3. **Delete network volumes you created.** They outlive pods by design.
4. **Revoke what you used.** Hugging Face token, bucket keys, and remove any one-off SSH public key you added to the marketplace for this job.

How the host wipes disks between renters is not something the marketplace docs I read describe. Plan as if it doesn't happen, and step 1 covers you either way.

## Contracts and regulations

The technical controls matter less than one legal fact: putting data on someone's machine makes them a party to it.

- **GDPR.** A GPU host processing personal data for you is a processor. Article 28 requires one that gives "sufficient guarantees" and a binding contract. A peer-to-peer host you never signed anything with doesn't meet that, and the machine may sit outside the EU. De-identify, or use a provider that signs a DPA.
- **HIPAA.** HHS says a cloud provider that stores electronic health data is a business associate even if the data is encrypted and it has no key. Encrypting health records before sending them to an unvetted host doesn't remove the need for a BAA.
- **Your customers' contracts.** Many enterprise agreements restrict subprocessors and data location. Check them before the first upload. The legal exposure is often larger than the technical one.

The companion post on [why companies restrict public AI tools](/en/why-corporate-policies-banning-chatgpt/) covers the same rules from the chat side.

## Inference on GPUFlow: a different trade

GPUFlow is not a place to put a dataset. It is an inference marketplace: you rent a GPU by the hour and get an OpenAI-compatible API key (base URL `https://gpuflow.app/v1`) for the open model a provider runs (usually with Ollama) on their own computer. There is no SSH, no shell and no file access, and you can't train or fine-tune on it. Nothing you upload sits on the provider's disk, because you can't upload anything.

That removes the disk and credential problems in this guide. It does not remove the host problem. Each prompt and answer passes through the provider's machine in plaintext while the rental runs. GPUFlow's terms forbid providers from recording, reading, keeping or sharing them, and GPUFlow does not store the text itself, but the provider has root on the machine, so the rule is enforced by contract only. If you run a dataset through it one record per prompt, every record reaches that computer.

So use it for public, synthetic or properly de-identified data, and for testing an open model or an app against an OpenAI-style API. Keep regulated and confidential records on your own hardware, a provider you have a contract with, or a confidential VM. The [API quickstart](https://docs.gpuflow.app/renters/api-quickstart/) says the same in one line: don't send passwords, card numbers or other secrets you wouldn't share with a stranger. The same arrangement seen from the provider's side is in [is it safe to rent out your GPU](/en/is-it-safe-to-rent-out-your-gpu/).

## Checklist

Before:

- Decide the data class. Regulated or client-confidential data goes to a contracted provider or a confidential VM, not a community host.
- Minimise and de-identify.
- Encrypt with age; keep the passphrase off the node.

During:

- Decrypt into `/dev/shm` where it fits.
- Scoped, short-lived tokens only.
- Services bound to localhost, reached through SSH tunnels.

After:

- Pull results over SSH; treat the fine-tuned weights as sensitive.
- Destroy the instance and any network volumes.
- Revoke tokens and one-off keys.

## Sources

- Container isolation and Secure Cloud on Vast.ai: [Vast.ai Security FAQ](https://docs.vast.ai/guides/reference/faq/security); stop vs destroy: [Managing instances](https://docs.vast.ai/guides/instances/manage-instances)
- RunPod Secure vs Community Cloud: [Choose a Pod](https://docs.runpod.io/pods/choose-a-pod); storage persistence: [Storage types](https://docs.runpod.io/pods/storage/types)
- LeftoverLocals: [Trail of Bits, January 2024](https://blog.trailofbits.com/2024/01/16/leftoverlocals-listening-to-llm-responses-through-leaked-gpu-local-memory/)
- age: [github.com/FiloSottile/age](https://github.com/FiloSottile/age)
- shred limitations: [GNU coreutils manual, shred invocation](https://www.gnu.org/software/coreutils/manual/html_node/shred-invocation.html)
- NIST SP 800-88 Rev. 2: [NIST announcement, September 2025](https://www.nist.gov/news-events/news/2025/09/guidelines-media-sanitization-nist-publishes-sp-800-88r2)
- H100 confidential computing design: [NVIDIA, Confidential Computing on H100 GPUs for Secure and Trustworthy AI](https://developer.nvidia.com/blog/confidential-computing-on-h100-gpus-for-secure-and-trustworthy-ai/); general access: [NVIDIA, April 2024](https://developer.nvidia.com/blog/announcing-confidential-computing-general-access-on-nvidia-h100-tensor-core-gpus/)
- Azure: [NCCads H100 v5 series](https://learn.microsoft.com/en-us/azure/virtual-machines/sizes/gpu-accelerated/nccadsh100v5-series)
- Google Cloud: [Confidential VM supported configurations](https://docs.cloud.google.com/confidential-computing/confidential-vm/docs/supported-configurations), [Create a Confidential VM instance with GPU](https://docs.cloud.google.com/confidential-computing/confidential-vm/docs/create-a-confidential-vm-instance-with-gpu)
- GDPR Article 28: [gdpr-info.eu](https://gdpr-info.eu/art-28-gdpr/)
- HIPAA and cloud providers: [HHS, Guidance on HIPAA and cloud computing](https://www.hhs.gov/hipaa/for-professionals/special-topics/health-information-technology/cloud-computing/index.html)
- GPUFlow: [API quickstart](https://docs.gpuflow.app/renters/api-quickstart/), [What renters can and can't reach](https://docs.gpuflow.app/providers/security/), [Terms](https://gpuflow.app/en/terms), [Privacy policy](https://gpuflow.app/en/privacy)

All checked in September 2026.
