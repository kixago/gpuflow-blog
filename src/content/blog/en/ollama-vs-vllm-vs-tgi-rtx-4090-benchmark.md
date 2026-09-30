---
title: "Ollama vs vLLM vs TGI on an RTX 4090: What Benchmarks Show"
description: "Ollama, vLLM and Hugging Face TGI for an 8B model on an RTX 4090: cited throughput under load, VRAM, quantization, OpenAI APIs and TGI's maintenance status."
excerpt: "One request at a time, the engines run about equally fast on an RTX 4090. With many users at once, vLLM pulls far ahead. TGI is now in maintenance mode. Published numbers, sources and what to pick."
pubDate: 2026-02-25
updatedDate: 2026-09-30
locale: "en"
category: "benchmarks"
featured: false
draft: false
author: "GPUFlow Team"
heroImage: "../_images/rtx4090-inference-benchmark-hero.png"
heroImageAlt: "RTX 4090 GPU inference benchmark displayed on terminal with performance metrics"
faq:
  - question: "Is vLLM faster than Ollama on an RTX 4090?"
    answer: "Only when many requests run at once. In a September 2026 test by ComputingForGeeks with Qwen2.5-7B at 4-bit, both generated about 174 tokens per second for a single request on an RTX 4090. With 64 requests at once, vLLM reached 6,623 tokens per second in total and Ollama 2,018."
  - question: "Is Hugging Face TGI still maintained?"
    answer: "Only lightly. The TGI docs say it is in maintenance mode and accepts only minor bug fixes and documentation changes, and the GitHub repository was archived as read-only on March 21, 2026. Hugging Face recommends vLLM or SGLang instead, or llama.cpp and MLX for local use."
  - question: "How much VRAM does vLLM use for an 8B model?"
    answer: "By default vLLM claims 90% of the GPU's memory (gpu-memory-utilization 0.9), about 21.6 GB on a 24 GB RTX 4090, whatever the model size. What the weights don't use becomes KV cache for concurrent requests."
  - question: "Can Ollama serve several users at once?"
    answer: "Yes, but the default is one request at a time per model (OLLAMA_NUM_PARALLEL=1). You can raise it, and each parallel slot adds its own context memory. Published benchmarks show Ollama scaling less well than vLLM under heavy concurrency."
  - question: "Do Ollama, vLLM and TGI have OpenAI-compatible APIs?"
    answer: "Yes. All three serve /v1/chat/completions. Ollama and vLLM also serve completions, embeddings and the Responses API; TGI's OpenAI-compatible Messages API has existed since version 1.4.0."
  - question: "Can I run Llama 3.1 8B in FP16 on a 24 GB GPU?"
    answer: "Yes. 8.03 billion parameters at 2 bytes each is about 16.1 GB of weights, which fits on 24 GB with room for a modest KV cache. Most people serving on one consumer card use 4-bit or 8-bit weights to leave more room for context and concurrent users."
---

On a single RTX 4090 serving a 7B–8B model, Ollama and vLLM run about equally fast for one request at a time. The gap opens when many requests arrive together: in a published September 2026 test with 64 concurrent requests, vLLM produced about three times Ollama's total throughput. Hugging Face TGI still works, but it has been in maintenance mode since its repository was archived in March 2026, and Hugging Face itself now points people to vLLM and SGLang.

So the choice comes down to how many people hit the model at once. One user, a script, or a small internal tool: Ollama, because it's the least work. A public API or batch jobs with many requests in flight: vLLM. A new deployment on TGI: I wouldn't start one.

## Where the numbers come from

An earlier version of this page showed throughput, latency and VRAM figures presented as our own RTX 4090 measurements. We couldn't trace them to a reproducible run or a published source, so we removed them. One reason for doubt: the old single-stream FP16 figures were above what an RTX 4090's memory bandwidth allows (see the next section).

Every number below is now attributed to whoever published it, with the hardware and model they used. Where no one has published a clean RTX 4090 comparison (TGI, for instance), I say so rather than fill the gap.

The main sources:

- **ComputingForGeeks, September 18, 2026.** Ollama, vLLM and llama.cpp on an RTX 4090, L40S and RTX 5090. Model: Qwen2.5-7B-Instruct, AWQ 4-bit for vLLM and GGUF Q4_K_M for Ollama and llama.cpp. Fixed 512-token prompt, temperature 0, up to 256 output tokens, 4,096-token context per slot, 64 parallel slots.
- **Red Hat Developer, August 8, 2025.** Ollama 0.9.2 vs vLLM 0.9.1 on one A100 40 GB, Llama 3.1 8B Instruct in FP16, 1 to 256 concurrent users, measured with GuideLLM.
- **BentoML, June 5, 2024.** vLLM 0.4.2, TGI 2.0.4 and others on an A100 80 GB with Llama 3 8B Instruct.
- **llama.cpp CUDA scoreboard.** Single-stream speed for Llama 2 7B Q4_0 on many cards, including the RTX 4090.

Only the first one was run on an RTX 4090 with all the engines this post is about except TGI. The others show the same pattern on data-center cards.

## One request: the card sets the ceiling

When a GPU generates tokens for a single request, it has to read every weight of the model from memory for each token. So memory bandwidth, not the engine, sets the upper limit.

The RTX 4090 has 24 GB of GDDR6X at 1,008 GB/s. Llama 3.1 8B has 8.03 billion parameters.

- In FP16, that's 8.03 × 2 bytes ≈ 16.1 GB of weights. 1,008 ÷ 16.1 ≈ **63 tokens per second**, at most, for one request.
- Ollama's default `llama3.1:8b` tag is Q4_K_M, a 4.9 GB download. 1,008 ÷ 4.9 ≈ **205 tokens per second**, at most.

Real engines land below those ceilings. The llama.cpp scoreboard shows an RTX 4090 generating 186 tokens per second with Llama 2 7B at Q4_0 (189 with flash attention). ComputingForGeeks measured about 174 tokens per second for a single request with Qwen2.5-7B at 4-bit, and found vLLM, llama.cpp and Ollama "roughly" identical on the 4090. (On the L40S and RTX 5090, their Ollama build decoded at about half of llama.cpp's speed, so check your card and version.)

For one user at a time, pick the engine for convenience, and pick the quantization for speed. Going from FP16 to 4-bit roughly triples the ceiling. Changing engine barely moves it.

## Many requests: batching decides

With many requests in flight, the GPU can read the weights once and use them for a whole batch of requests. How well an engine batches, and how it manages the KV cache (the per-request memory of the conversation so far), is now what matters.

<figure>
<svg viewBox="0 0 720 310" role="img" aria-labelledby="d1-title" xmlns="http://www.w3.org/2000/svg" font-family="system-ui, sans-serif" font-size="15">
<title id="d1-title">Bar chart of total throughput on an RTX 4090 with 64 concurrent requests: vLLM 6,623, llama.cpp 2,391, Ollama 2,018 tokens per second</title>
<text x="160" y="63" text-anchor="end" fill="#1e1b4b">vLLM (AWQ)</text>
<rect x="170" y="40" width="454" height="36" fill="#6366f1"/>
<text x="632" y="63" fill="#1e1b4b">6,623</text>
<text x="160" y="123" text-anchor="end" fill="#1e1b4b">llama.cpp</text>
<rect x="170" y="100" width="164" height="36" fill="#a5b4fc"/>
<text x="342" y="123" fill="#1e1b4b">2,391</text>
<text x="160" y="183" text-anchor="end" fill="#1e1b4b">Ollama</text>
<rect x="170" y="160" width="138" height="36" fill="#a5b4fc"/>
<text x="316" y="183" fill="#1e1b4b">2,018</text>
<line x1="170" y1="210" x2="650" y2="210" stroke="#64748b" stroke-width="1.5"/>
<line x1="170" y1="30" x2="170" y2="210" stroke="#64748b" stroke-width="1.5"/>
<line x1="307" y1="210" x2="307" y2="216" stroke="#64748b" stroke-width="1.5"/>
<line x1="444" y1="210" x2="444" y2="216" stroke="#64748b" stroke-width="1.5"/>
<line x1="581" y1="210" x2="581" y2="216" stroke="#64748b" stroke-width="1.5"/>
<text x="170" y="232" text-anchor="middle" fill="#64748b" font-size="13">0</text>
<text x="307" y="232" text-anchor="middle" fill="#64748b" font-size="13">2,000</text>
<text x="444" y="232" text-anchor="middle" fill="#64748b" font-size="13">4,000</text>
<text x="581" y="232" text-anchor="middle" fill="#64748b" font-size="13">6,000</text>
<text x="410" y="256" text-anchor="middle" fill="#64748b" font-size="13">Total output tokens per second, 64 requests at once</text>
<text x="360" y="290" text-anchor="middle" fill="#1e1b4b" font-size="14">One request at a time: about 174 tokens per second on all three</text>
</svg>
<figcaption>RTX 4090, Qwen2.5-7B-Instruct at 4-bit (AWQ for vLLM, GGUF Q4_K_M for the others), 64 concurrent requests. Numbers from ComputingForGeeks, September 2026; bars drawn to scale. TGI was not part of this test.</figcaption>
</figure>

On the RTX 4090, vLLM served 6,623 tokens per second in total across 64 requests, llama.cpp's server 2,391 and Ollama 2,018. Ollama was set up fairly for this: `OLLAMA_NUM_PARALLEL=64`, `num_ctx 4096` and flash attention on. vLLM ran with `--quantization awq_marlin --max-model-len 4096 --gpu-memory-utilization 0.90`. The authors also reported time to first token of about 8 to 12 ms for llama.cpp and 16 to 25 ms for vLLM, with Ollama highest on the L40S and RTX 5090.

Red Hat's A100 test points the same way with FP16 weights. vLLM peaked at 793 tokens per second; Ollama at default settings managed 41. After raising Ollama's parallel limit to 32, "the highest stable value", it still didn't match vLLM at any concurrency level. Its time to first token "rose dramatically with more users", and inter-token latency showed "massive spikes" at peak load.

Two cautions before you quote these to anyone. First, the ComputingForGeeks comparison isn't perfectly like for like: vLLM ran AWQ weights, the others GGUF, and the builds differ. Second, these are totals across all requests. Each of the 64 users sees about 6,623 ÷ 64 ≈ 103 tokens per second on vLLM, which is still very usable, and about 2,018 ÷ 64 ≈ 32 on Ollama.

## Where TGI stands

Text Generation Inference was Hugging Face's production server, with continuous batching, Flash Attention and Paged Attention, tensor parallelism, Prometheus metrics and OpenTelemetry tracing. Technically it was in the same class as vLLM.

Its status has changed. The TGI docs now open with: "text-generation-inference is now in maintenance mode. Going forward, we will accept pull requests for minor bug fixes, documentation improvements and lightweight maintenance tasks." They recommend "vllm, SGLang, as well as local engines with inter-compatibility such as llama.cpp or MLX." The GitHub repository was archived and made read-only on March 21, 2026.

I found no recent published benchmark of TGI on an RTX 4090. The closest reputable comparison is BentoML's on an A100 80 GB from June 2024: with Llama 3 8B, vLLM reached "2300-2500 tokens per second similar to TGI", and vLLM had the best time to first token at every concurrency level they tested. That's two years and many releases ago for both engines, so treat it as history.

If TGI already runs your production traffic, it will keep working. For a new deployment you'd be choosing a server that won't get new model architectures or performance work. On one RTX 4090, vLLM covers everything TGI did.

## VRAM on a 24 GB card

The engines treat memory very differently, and that affects what else can share the card.

**vLLM takes most of the card up front.** Its `--gpu-memory-utilization` default is 0.9, so on a 24 GB RTX 4090 it claims about 21.6 GB at startup whatever the model's size. Everything the weights don't use becomes KV cache. With Llama 3.1 8B in FP16 (about 16.1 GB), that leaves roughly 5.5 GB for KV cache, activations and CUDA graphs, which limits context length and how many requests fit at once. With 4-bit AWQ weights (ComputingForGeeks' build was about 5.6 GB), most of the 21.6 GB goes to KV cache, which is how it keeps 64 requests going. Don't expect to run a second GPU program next to it unless you lower that fraction.

**Ollama allocates per model and per context.** A `llama3.1:8b` Q4_K_M model is 4.9 GB, plus KV cache for its context window. Ollama picks the default context from your VRAM: 4k below 24 GiB, 32k from 24 to 48 GiB, 256k at 48 GiB and above. An RTX 4090 sits right on the 24 GiB line (nvidia-smi reports slightly less than 24 GiB), so check `ollama ps` to see which context you actually got, or set it yourself. Parallel slots multiply that: the docs' example is that "a 2K context with 4 parallel requests will result in an 8K context and additional memory allocation". If memory is tight, KV cache quantization helps: `q8_0` uses about half the memory of the default `f16`, and `q4_0` about a quarter. Ollama can also keep up to three models loaded per GPU by default, if they fit, which suits a card that switches between models. For which models fit on 8, 12, 16 and 24 GB cards in the first place, see [which AI models fit your GPU's VRAM](/en/which-ai-models-fit-your-gpu-vram/).

**TGI** also preallocates for continuous batching, like vLLM. I didn't find a current, citable VRAM figure for an 8B model on a 4090, so I won't give one.

## Quantization and model formats

| | Ollama | vLLM | TGI |
| --- | --- | --- | --- |
| **Main format** | GGUF (e.g. Q4_K_M) | Hugging Face safetensors | Hugging Face safetensors |
| **4-bit options** | GGUF Q4 variants | AWQ, GPTQ, bitsandbytes, INT4 W4A16 | AWQ, GPTQ, Marlin, EXL2, bitsandbytes NF4/FP4 |
| **8-bit / FP8** | GGUF Q8_0 | FP8 W8A8 on Ada (RTX 4090) and Hopper; INT8 | bitsandbytes 8-bit, EETQ, fp8 |
| **GGUF** | Native | Supported | Not listed |
| **KV cache quantization** | q8_0, q4_0 | Yes | Not covered here |

The RTX 4090 is an Ada card (SM 8.9), so vLLM's FP8 path works on it. FP8 weights take half the memory of FP16: about 8 GB for an 8B model, a middle ground between FP16 and 4-bit on one 4090.

Ollama's model library ships pre-quantized GGUF tags, so you rarely think about it: `ollama pull llama3.1:8b` gets you Q4_K_M. With vLLM you pick a pre-quantized checkpoint from Hugging Face or pass a quantization flag yourself.

## OpenAI-compatible servers and setup

All three give you an OpenAI-style HTTP API, so the OpenAI SDKs and most chat tools work by changing the base URL.

| | Ollama | vLLM | TGI |
| --- | --- | --- | --- |
| **Default address** | `localhost:11434/v1` | `localhost:8000/v1` | Container port 80 (often mapped to 8080) |
| **Chat completions** | Yes | Yes | Yes (Messages API, since 1.4.0) |
| **Other OpenAI endpoints** | completions, models, embeddings, responses | completions, embeddings, responses, audio | Not covered here |
| **Install** | One script | pip package | Docker image |

Getting an 8B model running, per each project's docs:

```bash
# Ollama
curl -fsSL https://ollama.com/install.sh | sh
ollama pull llama3.1:8b

# vLLM (Llama 3.1 is gated: accept the license on Hugging Face and set HF_TOKEN)
pip install vllm
vllm serve meta-llama/Llama-3.1-8B-Instruct

# TGI
docker run --gpus all --shm-size 1g -p 8080:80 -v $PWD/data:/data \
  ghcr.io/huggingface/text-generation-inference:3.3.5 \
  --model-id meta-llama/Llama-3.1-8B-Instruct
```

Ollama is the least work by a distance. It handles downloads, quantized files, loading and unloading, and works the same on a laptop and a rented server. Ollama's OpenAI layer has gaps: no `logprobs` or `tool_choice` on chat completions, and images must be base64, not URLs. vLLM needs a working CUDA and Python setup and more flags to tune, but it's the engine Hugging Face now recommends in TGI's place. TGI is easy if you already run Docker, with the maintenance caveat above.

## Which engine for which job

**Ollama** for one person, a script, a coding assistant, an internal tool with a handful of users, or a machine that swaps between several models. Setup takes minutes, and single-request speed on a 4090 is as good as anything.

**vLLM** when many requests arrive at the same time: a public API, a multi-user chat product, or batch jobs you can run 32 or 64 at a time. The published numbers show about three times Ollama's total throughput on an RTX 4090 at 64 concurrent requests, and far more on an A100. It also has the widest quantization and API support.

**TGI** only if you already run it. For new work, Hugging Face's own advice is vLLM or SGLang.

Cost follows from throughput when you rent by the hour. Take one million output tokens on an RTX 4090 at $0.31 an hour, the lowest Vast.ai on-demand price getdeploying.com listed in September 2026, using the ComputingForGeeks numbers:

- One request at a time, 174 tokens/s: 1,000,000 ÷ 174 ≈ 5,750 s ≈ 1.6 hours ≈ **$0.50**.
- 64 at once on Ollama, 2,018 tokens/s: ≈ 496 s ≈ **$0.04**.
- 64 at once on vLLM, 6,623 tokens/s: ≈ 151 s ≈ **$0.01**.

These assume the GPU is busy the whole time. If you only ever have one request in flight, batching buys you nothing and the engine choice doesn't change your bill. If you have a queue of work, it changes it by an order of magnitude. The same logic, compared against per-token APIs, is in [hourly GPU or per-token API](/en/hourly-gpu-vs-per-token-api/).

## Where GPUFlow fits

GPUFlow's provider installer sets up Ollama by default and the GPUFlow agent forwards requests to it, so the Ollama column above is usually the one that applies there. You rent an OpenAI-compatible API key (`https://gpuflow.app/v1`, with `/v1/chat/completions` and `/v1/models`, streaming supported) for a model on the provider's GPU. You pay for time, per second with a 1-minute minimum, not per token.

What you can't do on GPUFlow: pick the engine, change its settings, or run your own code. There's no SSH or shell. To reproduce the benchmarks above or run vLLM yourself, rent a machine you can log into on Vast.ai or RunPod ([how they compare](/en/runpod-vs-vastapi-comparison/)). To use an Ollama-served model from an app with nothing to install, see the [GPUFlow marketplace](https://gpuflow.app/en/marketplace) and [how to use the key in common tools](/en/use-openai-compatible-api-key-in-apps/).

If you fine-tuned your own model and are deciding how to serve it, the [private LLM fine-tuning guide](/en/private-llm-fine-tuning-guide/) covers the step before this one.

## Sources

All checked in September 2026.

- Ollama vs vLLM vs llama.cpp on RTX 4090, L40S and RTX 5090: [ComputingForGeeks](https://computingforgeeks.com/ollama-vs-vllm-vs-llama-cpp/) (September 18, 2026)
- Ollama vs vLLM on A100 40 GB: [Red Hat Developer](https://developers.redhat.com/articles/2025/08/08/ollama-vs-vllm-deep-dive-performance-benchmarking) (August 8, 2025)
- vLLM, TGI and others on A100 80 GB: [BentoML, Benchmarking LLM Inference Backends](https://www.bentoml.com/blog/benchmarking-llm-inference-backends) (June 5, 2024)
- llama.cpp CUDA scoreboard: [github.com/ggml-org/llama.cpp/discussions/15013](https://github.com/ggml-org/llama.cpp/discussions/15013)
- RTX 4090 memory and bandwidth: [TechPowerUp review](https://www.techpowerup.com/review/nvidia-geforce-rtx-4090-founders-edition/)
- Llama 3.1 8B parameters and license: [Hugging Face model card](https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct)
- Ollama: [FAQ (parallel requests, KV cache)](https://docs.ollama.com/faq), [context length](https://docs.ollama.com/context-length), [OpenAI compatibility](https://docs.ollama.com/api/openai-compatibility), [llama3.1:8b tag](https://ollama.com/library/llama3.1:8b)
- vLLM: [OpenAI-compatible server](https://docs.vllm.ai/en/latest/serving/online_serving/openai_compatible_server/), [quantization](https://docs.vllm.ai/en/latest/features/quantization/index.html), [engine arguments (gpu-memory-utilization)](https://docs.vllm.ai/en/v0.6.4/models/engine_args.html)
- TGI: [docs and maintenance notice](https://huggingface.co/docs/text-generation-inference/en/index), [GitHub repository (archived)](https://github.com/huggingface/text-generation-inference), [Messages API](https://huggingface.co/docs/text-generation-inference/en/messages_api), [quantization](https://huggingface.co/docs/text-generation-inference/en/conceptual/quantization)
- RTX 4090 rental price: [getdeploying.com](https://getdeploying.com/reference/cloud-gpu/nvidia-rtx-4090)
- GPUFlow: [API quickstart](https://docs.gpuflow.app/renters/api-quickstart/), [providers getting started](https://docs.gpuflow.app/providers/getting-started/)
