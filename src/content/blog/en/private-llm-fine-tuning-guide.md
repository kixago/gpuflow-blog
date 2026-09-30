---
title: "Fine-Tune an LLM Privately on a Rented GPU: A Practical Guide"
description: "When fine-tuning beats RAG or prompting, QLoRA VRAM needs by model size, TRL, Unsloth and Axolotl, keeping data private on rented GPUs, costs and serving."
excerpt: "A QLoRA fine-tune of an 8B open model fits on one rented 24 GB GPU and costs about $0.35 to $0.83 per run. Before you pay for it, check that fine-tuning is the right tool, and plan how your data stays yours on someone else's machine."
pubDate: 2025-02-23
updatedDate: 2026-09-30
locale: "en"
category: "tutorials"
featured: false
draft: false
author: "GPUFlow Team"
heroImage: "../_images/private-llm-fine-tuning-guide-hero.png"
heroImageAlt: "Illustration of a private dataset being used to fine-tune a language model on a rented GPU server"
faq:
  - question: "How much VRAM do I need to fine-tune a 7B or 8B model?"
    answer: "With QLoRA, Unsloth's requirements table lists about 5 GB for a 7B model and 6 GB for an 8B model; plain 16-bit LoRA needs about 19 GB and 22 GB. Real runs need headroom for longer sequences and bigger batches, so a 24 GB card such as an RTX 3090 or 4090 is the comfortable choice."
  - question: "Should I fine-tune or use RAG?"
    answer: "Use RAG when the model needs facts from your documents, especially facts that change. A 2024 study by Ovadia et al. found RAG consistently beat unsupervised fine-tuning for adding knowledge. Fine-tune when you need a consistent format, tone or narrow task behavior that prompting can't produce reliably."
  - question: "How much does it cost to fine-tune an LLM on a rented GPU?"
    answer: "A QLoRA run on an 8B model with 2,000 examples takes a little over an hour including setup, which is about $0.35 on a $0.31/h Vast.ai RTX 4090 or $0.83 at RunPod's $0.74/h list price (September 2026). A 20,000-example run takes about four hours, or $1.24 to $2.97."
  - question: "Can the GPU host see my training data?"
    answer: "The host owns the hardware, so assume they could. Container isolation protects you from other renters, not from the machine's owner. Use vetted datacenter hosts (Vast.ai Secure Cloud, RunPod Secure Cloud) for sensitive data, remove personal data before uploading, and delete the instance when you finish."
  - question: "What's the difference between LoRA and QLoRA?"
    answer: "LoRA freezes the base model and trains small adapter matrices. QLoRA does the same but loads the frozen base model in 4-bit NF4 precision, which cut memory enough to fine-tune a 65B model on one 48 GB GPU in the original paper."
  - question: "Can I fine-tune or upload my model on GPUFlow?"
    answer: "No. GPUFlow is inference only: you rent an OpenAI-compatible chat API for models that providers have installed on their own machines, usually with Ollama. There is no shell or file access, so you can't train there or upload your own model."
---

You can fine-tune an 8B open-weights model on your own data with QLoRA on one rented 24 GB GPU, and a typical run costs under a dollar. The harder questions come first: whether fine-tuning is the right fix at all (for facts, retrieval usually wins), and how your data stays private on a machine someone else owns.

This guide covers both, then the VRAM you need by model size, the current tools, a working training script, a worked cost and how to serve the result. Everything was checked in September 2026; sources are at the end.

## Fine-tune, RAG or better prompts

Fine-tuning changes how a model behaves. It's a poor way to teach it facts. Ovadia et al. compared the two for knowledge injection and found that RAG "consistently outperforms" unsupervised fine-tuning, "both for existing knowledge encountered during training and entirely new knowledge". Their summary: LLMs struggle to learn new facts through fine-tuning.

So walk down this tree before you rent anything:

<figure>
<svg viewBox="0 0 720 420" role="img" aria-labelledby="d1-title" xmlns="http://www.w3.org/2000/svg" font-family="system-ui, sans-serif" font-size="15">
<title id="d1-title">Decision tree for choosing between retrieval, better prompts, fine-tuning or a larger model</title>
<defs><marker id="d1-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#64748b"/></marker></defs>
<rect width="720" height="420" fill="#ffffff"/>
<rect x="60" y="15" width="280" height="40" rx="8" fill="#1e1b4b"/>
<text x="200" y="40" text-anchor="middle" fill="#ffffff">The answers aren't good enough</text>
<line x1="200" y1="55" x2="200" y2="83" stroke="#64748b" stroke-width="2" marker-end="url(#d1-arrow)"/>
<rect x="20" y="85" width="360" height="50" rx="8" fill="#ffffff" stroke="#f97316" stroke-width="2"/>
<text x="200" y="115" text-anchor="middle" fill="#1e1b4b">Missing facts, or data that changes?</text>
<rect x="440" y="80" width="260" height="60" rx="10" fill="#f0fdf4" stroke="#16a34a" stroke-width="2"/>
<text x="570" y="105" text-anchor="middle" fill="#1e1b4b" font-weight="600">Use RAG</text>
<text x="570" y="126" text-anchor="middle" fill="#64748b" font-size="13">look up your documents per request</text>
<line x1="380" y1="110" x2="438" y2="110" stroke="#64748b" stroke-width="2" marker-end="url(#d1-arrow)"/>
<text x="409" y="102" text-anchor="middle" fill="#16a34a" font-size="13">Yes</text>
<line x1="200" y1="135" x2="200" y2="173" stroke="#64748b" stroke-width="2" marker-end="url(#d1-arrow)"/>
<text x="215" y="160" fill="#64748b" font-size="13">No</text>
<rect x="20" y="175" width="360" height="50" rx="8" fill="#ffffff" stroke="#f97316" stroke-width="2"/>
<text x="200" y="205" text-anchor="middle" fill="#1e1b4b">Do instructions and examples fix it?</text>
<rect x="440" y="170" width="260" height="60" rx="10" fill="#f0fdf4" stroke="#16a34a" stroke-width="2"/>
<text x="570" y="195" text-anchor="middle" fill="#1e1b4b" font-weight="600">Improve the prompt</text>
<text x="570" y="216" text-anchor="middle" fill="#64748b" font-size="13">system prompt, few-shot examples</text>
<line x1="380" y1="200" x2="438" y2="200" stroke="#64748b" stroke-width="2" marker-end="url(#d1-arrow)"/>
<text x="409" y="192" text-anchor="middle" fill="#16a34a" font-size="13">Yes</text>
<line x1="200" y1="225" x2="200" y2="263" stroke="#64748b" stroke-width="2" marker-end="url(#d1-arrow)"/>
<text x="215" y="250" fill="#64748b" font-size="13">No</text>
<rect x="20" y="265" width="360" height="50" rx="8" fill="#ffffff" stroke="#f97316" stroke-width="2"/>
<text x="200" y="295" text-anchor="middle" fill="#1e1b4b">Need a fixed format, tone or skill?</text>
<rect x="440" y="260" width="260" height="60" rx="10" fill="#eef2ff" stroke="#6366f1" stroke-width="2"/>
<text x="570" y="285" text-anchor="middle" fill="#1e1b4b" font-weight="600">Fine-tune with QLoRA</text>
<text x="570" y="306" text-anchor="middle" fill="#64748b" font-size="13">hundreds of good examples</text>
<line x1="380" y1="290" x2="438" y2="290" stroke="#64748b" stroke-width="2" marker-end="url(#d1-arrow)"/>
<text x="409" y="282" text-anchor="middle" fill="#16a34a" font-size="13">Yes</text>
<line x1="200" y1="315" x2="200" y2="353" stroke="#64748b" stroke-width="2" marker-end="url(#d1-arrow)"/>
<text x="215" y="340" fill="#64748b" font-size="13">No</text>
<rect x="60" y="355" width="280" height="50" rx="10" fill="#f8fafc" stroke="#64748b" stroke-width="2"/>
<text x="200" y="385" text-anchor="middle" fill="#1e1b4b">Try a larger base model</text>
<text x="570" y="370" text-anchor="middle" fill="#64748b" font-size="13">RAG and fine-tuning combine well:</text>
<text x="570" y="390" text-anchor="middle" fill="#64748b" font-size="13">tune the behavior, retrieve the facts</text>
</svg>
<figcaption>Most "the model doesn't know our stuff" problems are retrieval problems. Fine-tuning earns its cost when you need the same behavior every time: a JSON schema, a house style, a classification scheme.</figcaption>
</figure>

Good reasons to fine-tune:

- **Strict output format.** Extracting fields into your schema on every call, without a page of instructions in every prompt.
- **Style and tone.** Support replies that sound like your team, or reports in a fixed structure.
- **A narrow task done by a small model.** A tuned 8B model can replace a large general model for one job, which matters when you serve it on cheap hardware.
- **Shorter prompts.** Behavior learned in the weights doesn't need to be repeated in every request.

## LoRA and QLoRA

Full fine-tuning updates every weight, so the GPU has to hold gradients and optimizer state for all of them on top of the model. LoRA freezes the base model and trains small low-rank matrices next to its layers; the original paper reported 10,000 times fewer trainable parameters and 3 times less GPU memory than full fine-tuning GPT-3 175B with Adam.

QLoRA goes further: the frozen base model is loaded in 4-bit NF4 precision, and only the adapters are trained in 16-bit. Dettmers et al. used it to fine-tune a 65B model on a single 48 GB GPU "while preserving full 16-bit finetuning task performance". The paper added three pieces that the tools still use: the NF4 data type, double quantization of the quantization constants, and paged optimizers that absorb memory spikes.

The result of either is an adapter, a folder of a few tensors, that you apply on top of the unchanged base model. You can keep it separate or merge it into the weights. Image models use the same method: a [Stable Diffusion LoRA](/en/stable-diffusion-lora-training-under-10-dollars/) trains on one rented 24 GB card for well under $10.

## How much VRAM you need

Unsloth publishes a table of the minimum VRAM for fine-tuning by model size. These are its numbers, with its memory optimizations; plain Hugging Face training needs more, and longer sequences or larger batches push every row up.

| Model size | QLoRA (4-bit) | LoRA (16-bit) | Rented card that fits QLoRA comfortably |
| --- | --- | --- | --- |
| 3B | 3.5 GB | 8 GB | Any 12 GB+ card |
| 8B | 6 GB | 22 GB | RTX 3090 / 4090 (24 GB) |
| 14B | 8.5 GB | 33 GB | RTX 3090 / 4090 (24 GB) |
| 32B | 26 GB | 76 GB | 48 GB card (RTX A6000, A40, L40S) |
| 70B | 41 GB | 164 GB | 80 GB card (A100, H100) |

<figure>
<svg viewBox="0 0 720 320" role="img" aria-labelledby="d2-title" xmlns="http://www.w3.org/2000/svg" font-family="system-ui, sans-serif" font-size="15">
<title id="d2-title">Bar chart of minimum fine-tuning VRAM for 8B, 14B, 32B and 70B models with QLoRA and 16-bit LoRA, against 24, 48 and 80 GB cards</title>
<rect width="720" height="320" fill="#ffffff"/>
<rect x="200" y="12" width="14" height="14" fill="#6366f1"/>
<text x="220" y="24" fill="#1e1b4b" font-size="13">QLoRA 4-bit</text>
<rect x="320" y="12" width="14" height="14" fill="#eef2ff" stroke="#6366f1" stroke-width="1.5"/>
<text x="340" y="24" fill="#1e1b4b" font-size="13">LoRA 16-bit</text>
<line x1="262.1" y1="58" x2="262.1" y2="265" stroke="#f97316" stroke-width="1.5" stroke-dasharray="5 4"/>
<text x="262.1" y="52" text-anchor="middle" fill="#f97316" font-size="12">24 GB</text>
<line x1="324.2" y1="58" x2="324.2" y2="265" stroke="#f97316" stroke-width="1.5" stroke-dasharray="5 4"/>
<text x="324.2" y="52" text-anchor="middle" fill="#f97316" font-size="12">48 GB</text>
<line x1="407.1" y1="58" x2="407.1" y2="265" stroke="#f97316" stroke-width="1.5" stroke-dasharray="5 4"/>
<text x="407.1" y="52" text-anchor="middle" fill="#f97316" font-size="12">80 GB</text>
<text x="190" y="88" text-anchor="end" fill="#1e1b4b">8B</text>
<rect x="200" y="66" width="15.5" height="16" fill="#6366f1"/>
<text x="221" y="79" fill="#1e1b4b" font-size="12">6</text>
<rect x="200" y="84" width="56.9" height="16" fill="#eef2ff" stroke="#6366f1" stroke-width="1.5"/>
<text x="268" y="97" fill="#1e1b4b" font-size="12">22</text>
<text x="190" y="138" text-anchor="end" fill="#1e1b4b">14B</text>
<rect x="200" y="116" width="22" height="16" fill="#6366f1"/>
<text x="228" y="129" fill="#1e1b4b" font-size="12">8.5</text>
<rect x="200" y="134" width="85.4" height="16" fill="#eef2ff" stroke="#6366f1" stroke-width="1.5"/>
<text x="291" y="147" fill="#1e1b4b" font-size="12">33</text>
<text x="190" y="188" text-anchor="end" fill="#1e1b4b">32B</text>
<rect x="200" y="166" width="67.3" height="16" fill="#6366f1"/>
<text x="273" y="179" fill="#1e1b4b" font-size="12">26</text>
<rect x="200" y="184" width="196.7" height="16" fill="#eef2ff" stroke="#6366f1" stroke-width="1.5"/>
<text x="425" y="197" fill="#1e1b4b" font-size="12">76</text>
<text x="190" y="238" text-anchor="end" fill="#1e1b4b">70B</text>
<rect x="200" y="216" width="106.1" height="16" fill="#6366f1"/>
<text x="302" y="229" text-anchor="end" fill="#ffffff" font-size="12">41</text>
<rect x="200" y="234" width="424.5" height="16" fill="#eef2ff" stroke="#6366f1" stroke-width="1.5"/>
<text x="631" y="247" fill="#1e1b4b" font-size="12">164</text>
<line x1="200" y1="265" x2="640" y2="265" stroke="#64748b" stroke-width="1"/>
<text x="200" y="283" text-anchor="middle" fill="#64748b" font-size="12">0</text>
<text x="303.5" y="283" text-anchor="middle" fill="#64748b" font-size="12">40</text>
<text x="407.1" y="283" text-anchor="middle" fill="#64748b" font-size="12">80</text>
<text x="510.6" y="283" text-anchor="middle" fill="#64748b" font-size="12">120</text>
<text x="614.1" y="283" text-anchor="middle" fill="#64748b" font-size="12">160</text>
<text x="420" y="306" text-anchor="middle" fill="#64748b" font-size="13">Minimum VRAM in GB (Unsloth requirements table)</text>
</svg>
<figcaption>QLoRA is what makes rented consumer cards useful here: up to 14B fits a 24 GB card with room to spare, 32B needs a 48 GB card, and 70B an 80 GB one. Without 4-bit loading, even 8B barely fits in 24 GB.</figcaption>
</figure>

My default is an 8B or 14B model on an RTX 4090. It's the cheapest rented card that leaves room for 2,048-token sequences and a reasonable batch, and models in that range are easy to serve afterwards. For picking a base model by the VRAM you'll serve it on, see [which AI models fit your GPU's VRAM](/en/which-ai-models-fit-your-gpu-vram/).

## Pick a tool: TRL, Unsloth or Axolotl

All three are open source and all do LoRA and QLoRA.

| Tool | How you use it | Strength | Watch out for |
| --- | --- | --- | --- |
| Hugging Face TRL + PEFT | Python (`SFTTrainer`) | The reference implementation; DPO, GRPO and more on the same API | Uses more memory than Unsloth on the same run |
| Unsloth | Python, or the Unsloth Studio web UI | Claims 2x faster and 70% less VRAM; exports straight to GGUF | Studio UI is AGPL-3.0 (core is Apache 2.0) |
| Axolotl | One YAML file, `axolotl train config.yml` | Multi-GPU (FSDP, DeepSpeed), many recipes | Needs Python 3.11+ and PyTorch 2.11+ |

TRL is at version 1.14 and PEFT at 0.21 as of September 2026. Unsloth needs Python 3.11 to 3.13 and an NVIDIA GPU with CUDA capability 7.0 or newer (V100, T4, RTX 20 series and up). Axolotl recommends Python 3.12 and PyTorch 2.12.1.

Use TRL if you want to understand every line, Unsloth if you're short on VRAM or want GGUF export with one call, and Axolotl if you'll repeat runs with different settings or move to several GPUs. The script below uses TRL, because it's the shortest path that shows every moving part.

## Prepare the data

TRL's `SFTTrainer` reads conversations in the same shape as a chat API request. One JSON object per line in `train.jsonl`:

```json
{"messages": [{"role": "system", "content": "Extract the invoice fields as JSON."}, {"role": "user", "content": "Invoice 4471 from Norden AB, due 12 March, total 1,250 EUR"}, {"role": "assistant", "content": "{\"invoice_id\": \"4471\", \"supplier\": \"Norden AB\", \"due\": \"2026-03-12\", \"total\": 1250, \"currency\": \"EUR\"}"}]}
```

Practical rules:

- **Quality over count.** A few hundred to a few thousand consistent, correct examples beat tens of thousands of noisy ones. Every mistake in the data is behavior you're paying to teach.
- **Match production.** Use the system prompt and input format your application will actually send.
- **Hold out 5 to 10%.** Keep examples the model never trains on, to compare the base model and the tuned one side by side.
- **Remove what you don't need.** Names, emails, account numbers and IDs rarely help the model learn a format. Replace them with realistic placeholders before the data leaves your computer.

That last rule is about more than the rented machine. Carlini et al. extracted hundreds of verbatim training sequences from GPT-2, including names, phone numbers and email addresses, some of which appeared in only one training document. A fine-tuned model can repeat what it was trained on to whoever uses it later.

## Keep the data private on a rented machine

On a GPU marketplace, someone else owns the computer. Vast.ai puts it plainly: "Clients are isolated in unprivileged Docker containers and only have access to their own data", and "provider security varies significantly". That isolation protects you from other renters. It doesn't protect you from the person with physical access and root on the host.

For private data:

1. **Pick a vetted datacenter host.** Vast.ai's Secure Cloud providers are "vetted datacenters with ISO 27001 certification, Tier 3/4 datacenter standards", and Vast recommends them for sensitive work. RunPod's Secure Cloud runs in T3/T4 data centers; its Community Cloud connects you to individual providers. The datacenter tiers cost more per hour and are worth it here.
2. **Upload only the cleaned dataset,** over SSH (`rsync -avP` or `scp`). Don't stage it in a public bucket or a shared link on the way.
3. **Keep logging local.** In TRL 1.14 `report_to` defaults to `"none"`, so nothing goes to an experiment tracker unless you turn it on. Don't call `push_to_hub` with an adapter trained on private data.
4. **Take the results out, then delete the instance.** Download the adapter and evaluation outputs, log out of Hugging Face (`hf auth logout`) if you used a token, and delete the instance and any volume. On Vast.ai, storage is billed and kept until the instance is deleted, not just stopped.

Deleting files inside a container doesn't guarantee the host's disk is wiped, so the real protection is steps 1 and 2: choose who holds the hardware, and send them as little as possible. More detail in [how to secure a dataset on a public GPU node](/en/how-to-secure-dataset-on-public-gpu-node/). If [your policy forbids any third-party hardware](/en/why-corporate-policies-banning-chatgpt/), the same script runs on your own 24 GB card.

## Train: a QLoRA script with TRL

On a rented Linux machine with an RTX 3090 or 4090:

```bash
python -m venv venv && source venv/bin/activate
pip install torch trl peft bitsandbytes datasets
```

Then `train.py`, following the QLoRA pattern in TRL's PEFT documentation. Qwen3-8B is Apache 2.0 and not gated, so no Hugging Face token is needed:

```python
import torch
from datasets import load_dataset
from peft import LoraConfig
from transformers import BitsAndBytesConfig
from trl import SFTConfig, SFTTrainer

dataset = load_dataset("json", data_files="train.jsonl", split="train")

bnb_config = BitsAndBytesConfig(
    load_in_4bit=True,
    bnb_4bit_quant_type="nf4",
    bnb_4bit_compute_dtype=torch.bfloat16,
    bnb_4bit_use_double_quant=True,
)

peft_config = LoraConfig(
    r=16,
    lora_alpha=32,
    lora_dropout=0.05,
    target_modules="all-linear",
    task_type="CAUSAL_LM",
)

args = SFTConfig(
    output_dir="out",
    num_train_epochs=3,
    per_device_train_batch_size=4,
    gradient_accumulation_steps=4,
    learning_rate=2e-4,
    lr_scheduler_type="cosine",
    warmup_steps=20,
    max_length=2048,
    bf16=True,
    logging_steps=10,
    save_strategy="epoch",
    model_init_kwargs={"dtype": torch.bfloat16},
)

trainer = SFTTrainer(
    model="Qwen/Qwen3-8B",
    args=args,
    train_dataset=dataset,
    quantization_config=bnb_config,
    peft_config=peft_config,
)
trainer.train()
trainer.save_model("out/adapter")
```

The choices that matter:

- **`learning_rate=2e-4`.** TRL's docs recommend about 10 times the normal fine-tuning rate for QLoRA. If the evaluation loss rises while training loss falls, you're overfitting: use fewer epochs.
- **`r=16`, `target_modules="all-linear"`.** Adapters on every linear layer, the setup Unsloth's benchmarks use. Rank 16 is enough for format and style; raise it for harder tasks.
- **`max_length=2048`.** Longer examples are cut. Check your data's token lengths; a longer limit needs more VRAM.
- **Effective batch 16** (4 × 4 accumulation steps). If you run out of memory, lower `per_device_train_batch_size` and raise accumulation to keep the product.

Before you shut the machine down, run your held-out examples through the base model and the tuned one and compare them. That's the only test that tells you whether the money did anything.

## What it costs

Training time is total tokens ÷ throughput. GigaGPU, a hosting company, published a measured ~3,500 training tokens per second for Llama 3.1 8B with QLoRA on an RTX 4090. Assuming a similar rate for Qwen3-8B:

**Small run:** 2,000 examples × 600 tokens × 3 epochs = 3.6 million tokens. 3,600,000 ÷ 3,500 = 1,029 s, about 17 minutes.

| Step | Time |
| --- | --- |
| Set up the environment | 10 min |
| Download Qwen3-8B (16.4 GB of weights) and upload data | 10 min |
| Training | 17 min |
| Compare base and tuned model on held-out data | 15 min |
| Merge, export, download, delete the instance | 15 min |
| **Total** | **67 min (1.12 h)** |

- Vast.ai RTX 4090 at $0.31/h: 1.12 × $0.31 = **$0.35**
- RunPod RTX 4090 at $0.74/h (pricing page list price): 1.12 × $0.74 = **$0.83**

**Larger run:** 20,000 examples × 1,000 tokens × 2 epochs = 40 million tokens ÷ 3,500 = 11,429 s, about 3.2 hours. With 50 minutes of the same overhead, 4.0 hours: **$1.24** on Vast.ai or **$2.97** on RunPod.

For a 32B model, 48 GB cards are listed on RunPod at $0.49/h (A40), $0.53/h (RTX A6000) and $1.09/h (L40S) as of September 2026. I don't have a published throughput for 32B QLoRA on those cards, so run 50 steps, read the step time from the log, and do the same multiplication before you commit to a long run.

Prices are the September 2026 figures from RunPod's pricing page and getdeploying.com's tracker for Vast.ai. Secure/datacenter tiers cost more than the cheapest community offers. The broader picture is in [GPU rental pricing compared](/en/gpu-rental-pricing-comparison-2026/).

## Serve the result

You have two options: keep the adapter separate, or merge it into the model.

**Keep it separate with vLLM.** vLLM loads LoRA adapters next to the base model and exposes each one as a model name on its OpenAI-compatible server:

```bash
vllm serve Qwen/Qwen3-8B --enable-lora --lora-modules invoices=./out/adapter
```

Clients then send `"model": "invoices"`. Several adapters can share one base model on one GPU.

**Merge and run it in Ollama.** Merge the adapter into full-precision weights, convert to GGUF with llama.cpp, quantize, and import:

```python
import torch
from peft import AutoPeftModelForCausalLM
from transformers import AutoTokenizer

model = AutoPeftModelForCausalLM.from_pretrained("out/adapter", dtype=torch.bfloat16)
model.merge_and_unload().save_pretrained("merged")
AutoTokenizer.from_pretrained("Qwen/Qwen3-8B").save_pretrained("merged")
```

```bash
python llama.cpp/convert_hf_to_gguf.py merged --outfile invoices-bf16.gguf --outtype bf16
./llama.cpp/build/bin/llama-quantize invoices-bf16.gguf invoices-Q4_K_M.gguf Q4_K_M
echo "FROM ./invoices-Q4_K_M.gguf" > Modelfile
ollama create invoices -f Modelfile
```

Unsloth does the merge and GGUF export in one call (`model.save_pretrained_gguf("dir", tokenizer, quantization_method="q4_k_m")`). Its docs warn that the most common cause of bad answers after export is the wrong chat template: serve with the template you trained with. The trade-offs between Ollama, vLLM and TGI are in [our RTX 4090 inference benchmark](/en/ollama-vs-vllm-vs-tgi-rtx-4090-benchmark/).

### Where GPUFlow fits

GPUFlow can't do the training: it rents an OpenAI-compatible API on a provider's GPU, with no shell, SSH or file access. It also can't serve your fine-tuned model. Renters can't upload models; the models on offer are the ones each provider has installed (usually with Ollama), such as `qwen2.5:7b` or `llama3.1:8b`.

Where it can help is the step before all this: checking, for a few cents, whether a stock open model with a good prompt already does the job, which is the cheapest outcome in the decision tree. Use test data for that, not the private data this guide is about: prompts and answers pass through the provider's machine in plaintext while the rental runs. How it works is in the [API quickstart](https://docs.gpuflow.app/renters/api-quickstart/), and [using the key in apps](/en/use-openai-compatible-api-key-in-apps/) covers connecting it to existing tools.

## Sources

All checked in September 2026.

- Papers: [Hu et al., LoRA](https://arxiv.org/abs/2106.09685); [Dettmers et al., QLoRA](https://arxiv.org/abs/2305.14314); [Ovadia et al., Fine-Tuning or Retrieval?](https://arxiv.org/abs/2312.05934); [Carlini et al., Extracting Training Data from Large Language Models](https://arxiv.org/abs/2012.07805)
- Hugging Face TRL: [SFT Trainer](https://huggingface.co/docs/trl/sft_trainer), [PEFT integration and QLoRA](https://huggingface.co/docs/trl/peft_integration)
- Unsloth: [requirements and VRAM table](https://unsloth.ai/docs/get-started/fine-tuning-for-beginners/unsloth-requirements.md), [benchmarks](https://unsloth.ai/docs/basics/unsloth-benchmarks.md), [saving to GGUF](https://unsloth.ai/docs/basics/inference-and-deployment/saving-to-gguf.md), [GitHub](https://github.com/unslothai/unsloth)
- [Axolotl on GitHub](https://github.com/axolotl-ai-cloud/axolotl)
- Model: [Qwen3-8B model card](https://huggingface.co/Qwen/Qwen3-8B)
- Training throughput: [GigaGPU, fine-tuning on the RTX 4090](https://gigagpu.com/rtx-4090-fine-tuning-guide/)
- Hosts and security: [Vast.ai security FAQ](https://docs.vast.ai/documentation/reference/faq/security), [Vast.ai pricing](https://docs.vast.ai/guides/instances/pricing.md), [RunPod Pods overview](https://docs.runpod.io/pods/overview)
- Prices: [RunPod pricing](https://www.runpod.io/pricing), getdeploying.com for [Vast.ai](https://getdeploying.com/vast-ai) and [RTX 4090](https://getdeploying.com/reference/cloud-gpu/nvidia-rtx-4090)
- Serving: [vLLM LoRA adapters](https://docs.vllm.ai/en/latest/features/lora.html), [llama.cpp quantize](https://github.com/ggml-org/llama.cpp/blob/master/tools/quantize/README.md), [Ollama import](https://docs.ollama.com/import)
- GPUFlow: [API quickstart](https://docs.gpuflow.app/renters/api-quickstart/)
