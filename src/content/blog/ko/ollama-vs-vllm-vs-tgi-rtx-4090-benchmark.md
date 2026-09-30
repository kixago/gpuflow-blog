---
title: "RTX 4090에서 Ollama vs vLLM vs TGI: 벤치마크가 보여 주는 것"
description: "RTX 4090에서 8B 모델을 돌리는 Ollama, vLLM, Hugging Face TGI 비교: 공개된 부하 시 처리량, VRAM, 양자화, OpenAI 호환 API, TGI 유지 보수 상태."
excerpt: "요청을 하나씩 보내면 RTX 4090에서 세 엔진의 속도는 거의 같습니다. 여러 사용자가 동시에 쓰면 vLLM이 크게 앞섭니다. TGI는 이제 유지 보수 모드입니다. 공개된 수치, 출처, 무엇을 골라야 하는지 정리했습니다."
pubDate: 2026-02-25
updatedDate: 2026-09-30
locale: "ko"
category: "benchmarks"
featured: false
draft: false
author: "GPUFlow Team"
heroImage: "../_images/rtx4090-inference-benchmark-hero.png"
heroImageAlt: "터미널에 성능 지표와 함께 표시된 RTX 4090 GPU 추론 벤치마크"
faq:
  - question: "RTX 4090에서 vLLM이 Ollama보다 빠른가요?"
    answer: "요청이 여러 개 동시에 들어올 때만 그렇습니다. ComputingForGeeks가 2026년 9월 4비트 Qwen2.5-7B로 한 테스트에서, RTX 4090에서 요청 하나일 때는 둘 다 초당 약 174토큰을 생성했습니다. 요청 64개를 동시에 보냈을 때는 합계 기준 vLLM이 초당 6,623토큰, Ollama가 2,018토큰이었습니다."
  - question: "Hugging Face TGI는 아직 유지 보수되나요?"
    answer: "최소한으로만 됩니다. TGI 문서에 따르면 유지 보수 모드이며 사소한 버그 수정과 문서 변경만 받습니다. GitHub 저장소는 2026년 3월 21일에 읽기 전용으로 보관 처리되었습니다. Hugging Face는 대신 vLLM이나 SGLang을, 로컬에서는 llama.cpp와 MLX를 권합니다."
  - question: "vLLM은 8B 모델에 VRAM을 얼마나 쓰나요?"
    answer: "vLLM은 기본적으로 모델 크기와 관계없이 GPU 메모리의 90%(gpu-memory-utilization 0.9)를 잡습니다. 24 GB RTX 4090이라면 약 21.6 GB입니다. 가중치가 쓰지 않는 부분은 동시 요청을 위한 KV 캐시가 됩니다."
  - question: "Ollama로 여러 사용자를 동시에 처리할 수 있나요?"
    answer: "가능하지만 기본값은 모델당 한 번에 요청 하나입니다(OLLAMA_NUM_PARALLEL=1). 값을 올릴 수 있고, 병렬 슬롯마다 컨텍스트 메모리가 따로 듭니다. 공개된 벤치마크에서는 동시 요청이 많을 때 Ollama가 vLLM만큼 잘 확장되지 않습니다."
  - question: "Ollama, vLLM, TGI에는 OpenAI 호환 API가 있나요?"
    answer: "있습니다. 셋 다 /v1/chat/completions를 제공합니다. Ollama와 vLLM은 completions, embeddings, Responses API도 제공하고, TGI의 OpenAI 호환 Messages API는 1.4.0 버전부터 있었습니다."
  - question: "24 GB GPU에서 Llama 3.1 8B를 FP16으로 돌릴 수 있나요?"
    answer: "가능합니다. 매개변수 80.3억 개에 각 2바이트면 가중치가 약 16.1 GB라서, 24 GB에 들어가고 적당한 KV 캐시 공간도 남습니다. 소비자용 카드 한 장으로 서빙하는 사람들은 대부분 컨텍스트와 동시 사용자를 위한 공간을 더 확보하려고 4비트나 8비트 가중치를 씁니다."
---

7B~8B 모델을 서빙하는 RTX 4090 한 장에서 요청을 하나씩 처리하면 Ollama와 vLLM의 속도는 거의 같습니다. 차이는 요청이 한꺼번에 몰릴 때 벌어집니다. 2026년 9월에 공개된 테스트에서 동시 요청 64개일 때 vLLM의 총 처리량은 Ollama의 약 세 배였습니다. Hugging Face TGI는 여전히 작동하지만, 2026년 3월 저장소가 보관 처리된 뒤로 유지 보수 모드이고, Hugging Face 스스로도 이제 vLLM과 SGLang을 권합니다.

결국 선택은 모델에 동시에 몇 명이 붙느냐로 정해집니다. 사용자 한 명, 스크립트, 작은 사내 도구라면 가장 손이 덜 가는 Ollama입니다. 공개 API나 요청이 많이 걸려 있는 배치 작업이라면 vLLM입니다. TGI로 새로 배포하는 일은 저라면 시작하지 않겠습니다.

## 수치의 출처

이 페이지의 이전 버전에는 저희가 직접 RTX 4090에서 측정한 것처럼 제시된 처리량, 지연 시간, VRAM 수치가 있었습니다. 재현 가능한 실행이나 공개된 출처로 추적할 수 없어서 삭제했습니다. 의심한 이유 중 하나는, 이전의 단일 스트림 FP16 수치가 RTX 4090의 메모리 대역폭으로 가능한 값보다 높았다는 점입니다(다음 섹션 참고).

이제 아래의 모든 수치는 발표한 곳과 그들이 쓴 하드웨어와 모델을 밝혀 두었습니다. TGI처럼 깔끔한 RTX 4090 비교가 공개되지 않은 경우에는 빈칸을 채우지 않고 그렇다고 적었습니다.

주요 출처는 다음과 같습니다.

- **ComputingForGeeks, 2026년 9월 18일.** RTX 4090, L40S, RTX 5090에서 Ollama, vLLM, llama.cpp 비교. 모델: Qwen2.5-7B-Instruct, vLLM은 AWQ 4비트, Ollama와 llama.cpp는 GGUF Q4_K_M. 512토큰 고정 프롬프트, temperature 0, 출력 최대 256토큰, 슬롯당 컨텍스트 4,096토큰, 병렬 슬롯 64개.
- **Red Hat Developer, 2025년 8월 8일.** A100 40 GB 한 장에서 Ollama 0.9.2 vs vLLM 0.9.1, FP16 Llama 3.1 8B Instruct, 동시 사용자 1~256명, GuideLLM으로 측정.
- **BentoML, 2024년 6월 5일.** A100 80 GB에서 Llama 3 8B Instruct로 vLLM 0.4.2, TGI 2.0.4 등 비교.
- **llama.cpp CUDA 스코어보드.** RTX 4090을 포함한 여러 카드에서 Llama 2 7B Q4_0의 단일 스트림 속도.

TGI를 뺀 이 글의 엔진을 모두 RTX 4090에서 돌린 것은 첫 번째뿐입니다. 나머지는 데이터센터 카드에서 같은 경향을 보여 줍니다.

## 요청 하나: 상한은 카드가 정한다

GPU가 요청 하나에 대해 토큰을 생성할 때는 토큰마다 모델의 모든 가중치를 메모리에서 읽어야 합니다. 그래서 상한을 정하는 것은 엔진이 아니라 메모리 대역폭입니다.

RTX 4090에는 1,008 GB/s의 GDDR6X 24 GB가 있습니다. Llama 3.1 8B의 매개변수는 80.3억 개입니다.

- FP16이면 가중치가 8.03 × 2바이트 ≈ 16.1 GB입니다. 1,008 ÷ 16.1 ≈ 요청 하나에 최대 **초당 63토큰**입니다.
- Ollama의 기본 `llama3.1:8b` 태그는 Q4_K_M으로 다운로드 크기가 4.9 GB입니다. 1,008 ÷ 4.9 ≈ 최대 **초당 205토큰**입니다.

실제 엔진은 이 상한보다 낮게 나옵니다. llama.cpp 스코어보드에서 RTX 4090은 Q4_0 Llama 2 7B로 초당 186토큰(flash attention 사용 시 189)을 생성합니다. ComputingForGeeks는 4비트 Qwen2.5-7B로 요청 하나일 때 초당 약 174토큰을 측정했고, 4090에서는 vLLM, llama.cpp, Ollama가 "대략" 같다고 봤습니다. (L40S와 RTX 5090에서는 그들의 Ollama 빌드가 llama.cpp의 절반 정도 속도로 디코딩했으니, 자신의 카드와 버전을 확인하세요.)

한 번에 사용자 한 명이라면 엔진은 편의성으로, 양자화는 속도로 고르세요. FP16에서 4비트로 가면 상한이 대략 세 배가 됩니다. 엔진을 바꿔서는 거의 달라지지 않습니다.

## 요청 여러 개: 배칭이 결정한다

요청이 여러 개 걸려 있으면 GPU는 가중치를 한 번 읽어 요청 묶음 전체에 쓸 수 있습니다. 이제 중요한 것은 엔진이 얼마나 잘 배칭하는지, 그리고 KV 캐시(지금까지의 대화를 담는 요청별 메모리)를 어떻게 관리하는지입니다.

<figure>
<svg viewBox="0 0 720 310" role="img" aria-labelledby="d1-title" xmlns="http://www.w3.org/2000/svg" font-family="system-ui, sans-serif" font-size="15">
<title id="d1-title">RTX 4090에서 동시 요청 64개일 때의 총 처리량 막대 차트: vLLM 초당 6,623토큰, llama.cpp 2,391토큰, Ollama 2,018토큰</title>
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
<text x="410" y="256" text-anchor="middle" fill="#64748b" font-size="13">초당 총 출력 토큰, 동시 요청 64개</text>
<text x="360" y="290" text-anchor="middle" fill="#1e1b4b" font-size="14">요청을 하나씩 보내면 세 엔진 모두 초당 약 174토큰</text>
</svg>
<figcaption>RTX 4090, 4비트 Qwen2.5-7B-Instruct(vLLM은 AWQ, 나머지는 GGUF Q4_K_M), 동시 요청 64개. 수치는 ComputingForGeeks, 2026년 9월. 막대는 축척대로 그렸습니다. TGI는 이 테스트에 포함되지 않았습니다.</figcaption>
</figure>

RTX 4090에서 요청 64개에 걸친 총 처리량은 vLLM 초당 6,623토큰, llama.cpp 서버 2,391토큰, Ollama 2,018토큰이었습니다. Ollama도 공정하게 설정했습니다. `OLLAMA_NUM_PARALLEL=64`, `num_ctx 4096`, flash attention 켬. vLLM은 `--quantization awq_marlin --max-model-len 4096 --gpu-memory-utilization 0.90`으로 돌렸습니다. 첫 토큰까지의 시간은 llama.cpp 약 8~12 ms, vLLM 16~25 ms였고, L40S와 RTX 5090에서는 Ollama가 가장 길었다고 합니다.

Red Hat의 A100 테스트도 FP16 가중치로 같은 방향을 가리킵니다. vLLM은 최고 초당 793토큰, 기본 설정의 Ollama는 41토큰이었습니다. Ollama의 병렬 한도를 "안정적으로 쓸 수 있는 최댓값"인 32로 올려도 어느 동시성 수준에서도 vLLM을 따라가지 못했습니다. 첫 토큰까지의 시간은 "사용자가 늘수록 급격히 늘었고", 토큰 간 지연 시간은 최대 부하에서 "큰 스파이크"를 보였습니다.

누군가에게 이 수치를 인용하기 전에 주의할 점이 두 가지 있습니다. 첫째, ComputingForGeeks 비교는 완전히 같은 조건이 아닙니다. vLLM은 AWQ 가중치, 나머지는 GGUF였고 빌드도 다릅니다. 둘째, 이 값은 모든 요청을 합친 총량입니다. 64명 각자가 보는 속도는 vLLM에서 약 6,623 ÷ 64 ≈ 초당 103토큰으로 여전히 충분히 쓸 만하고, Ollama에서는 약 2,018 ÷ 64 ≈ 32토큰입니다.

## TGI의 현재 상황

Text Generation Inference는 Hugging Face의 프로덕션 서버였습니다. 연속 배칭, Flash Attention과 Paged Attention, 텐서 병렬화, Prometheus 지표, OpenTelemetry 추적을 갖췄습니다. 기술적으로는 vLLM과 같은 급이었습니다.

상황이 바뀌었습니다. TGI 문서는 이제 이렇게 시작합니다. "text-generation-inference는 이제 유지 보수 모드입니다. 앞으로는 사소한 버그 수정, 문서 개선, 가벼운 유지 보수 작업에 대한 풀 리퀘스트만 받습니다." 그리고 "vllm, SGLang, 그리고 llama.cpp나 MLX처럼 상호 호환되는 로컬 엔진"을 권합니다. GitHub 저장소는 2026년 3월 21일에 보관 처리되어 읽기 전용이 되었습니다.

RTX 4090에서 TGI를 돌린 최근 공개 벤치마크는 찾지 못했습니다. 가장 가까운 믿을 만한 비교는 2024년 6월 BentoML이 A100 80 GB에서 한 것입니다. Llama 3 8B에서 vLLM은 "TGI와 비슷한 초당 2300-2500토큰"에 도달했고, 테스트한 모든 동시성 수준에서 첫 토큰까지의 시간이 가장 짧았습니다. 두 엔진 모두 2년 전이고 그 사이 릴리스가 많았으니 과거 기록으로 보세요.

이미 TGI로 프로덕션 트래픽을 처리하고 있다면 계속 작동합니다. 새로 배포한다면 새 모델 아키텍처 지원도 성능 개선도 받지 못할 서버를 고르는 셈입니다. RTX 4090 한 장이라면 TGI가 하던 일은 vLLM이 모두 합니다.

## 24 GB 카드의 VRAM

엔진마다 메모리를 다루는 방식이 매우 다르고, 그에 따라 카드를 같이 쓸 수 있는 다른 프로그램이 달라집니다.

**vLLM은 처음부터 카드 대부분을 잡습니다.** `--gpu-memory-utilization` 기본값이 0.9라서 24 GB RTX 4090에서는 모델 크기와 관계없이 시작할 때 약 21.6 GB를 가져갑니다. 가중치가 쓰지 않는 부분은 모두 KV 캐시가 됩니다. FP16 Llama 3.1 8B(약 16.1 GB)라면 KV 캐시, 활성화 값, CUDA 그래프에 약 5.5 GB가 남고, 이것이 컨텍스트 길이와 동시에 처리할 수 있는 요청 수를 제한합니다. 4비트 AWQ 가중치(ComputingForGeeks의 빌드는 약 5.6 GB)라면 21.6 GB 대부분이 KV 캐시로 가고, 그래서 요청 64개를 동시에 유지할 수 있습니다. 이 비율을 낮추지 않는 한 옆에서 다른 GPU 프로그램을 돌릴 생각은 하지 마세요.

**Ollama는 모델과 컨텍스트 단위로 할당합니다.** `llama3.1:8b` Q4_K_M 모델은 4.9 GB이고, 여기에 컨텍스트 창을 위한 KV 캐시가 더해집니다. Ollama는 VRAM에 따라 기본 컨텍스트를 정합니다. 24 GiB 미만은 4k, 24~48 GiB는 32k, 48 GiB 이상은 256k입니다. RTX 4090은 딱 24 GiB 경계에 걸려 있으므로(nvidia-smi는 24 GiB보다 조금 적게 보고합니다) `ollama ps`로 실제로 어떤 컨텍스트가 잡혔는지 확인하거나 직접 설정하세요. 병렬 슬롯은 이를 배로 늘립니다. 문서의 예를 들면 "2K 컨텍스트에 병렬 요청 4개면 8K 컨텍스트와 추가 메모리 할당이 필요합니다". 메모리가 빠듯하면 KV 캐시 양자화가 도움이 됩니다. `q8_0`은 기본 `f16`의 절반 정도, `q4_0`은 4분의 1 정도의 메모리를 씁니다. Ollama는 들어가기만 하면 기본적으로 GPU당 모델을 세 개까지 올려 둘 수 있어서, 여러 모델을 오가는 카드에 잘 맞습니다. 애초에 8, 12, 16, 24 GB 카드에 어떤 모델이 들어가는지는 [GPU VRAM에 맞는 AI 모델](/ko/which-ai-models-fit-your-gpu-vram/)을 보세요.

**TGI**도 vLLM처럼 연속 배칭을 위해 메모리를 미리 할당합니다. 4090에서 8B 모델에 대한 최신 인용 가능한 VRAM 수치는 찾지 못했으므로 적지 않겠습니다.

## 양자화와 모델 형식

| | Ollama | vLLM | TGI |
| --- | --- | --- | --- |
| **주 형식** | GGUF(예: Q4_K_M) | Hugging Face safetensors | Hugging Face safetensors |
| **4비트 옵션** | GGUF Q4 계열 | AWQ, GPTQ, bitsandbytes, INT4 W4A16 | AWQ, GPTQ, Marlin, EXL2, bitsandbytes NF4/FP4 |
| **8비트 / FP8** | GGUF Q8_0 | Ada(RTX 4090)와 Hopper에서 FP8 W8A8, INT8 | bitsandbytes 8비트, EETQ, fp8 |
| **GGUF** | 기본 지원 | 지원 | 목록에 없음 |
| **KV 캐시 양자화** | q8_0, q4_0 | 지원 | 여기서는 다루지 않음 |

RTX 4090은 Ada 카드(SM 8.9)라서 vLLM의 FP8 경로가 작동합니다. FP8 가중치는 FP16의 절반 메모리를 씁니다. 8B 모델이면 약 8 GB로, 4090 한 장에서 FP16과 4비트 사이의 절충안입니다.

Ollama 모델 라이브러리는 미리 양자화된 GGUF 태그를 제공하므로 따로 신경 쓸 일이 거의 없습니다. `ollama pull llama3.1:8b`를 하면 Q4_K_M을 받습니다. vLLM에서는 Hugging Face에서 미리 양자화된 체크포인트를 고르거나 양자화 플래그를 직접 넘깁니다.

## OpenAI 호환 서버와 설치

세 엔진 모두 OpenAI 스타일 HTTP API를 제공하므로, OpenAI SDK와 대부분의 채팅 도구는 기본 URL만 바꾸면 작동합니다.

| | Ollama | vLLM | TGI |
| --- | --- | --- | --- |
| **기본 주소** | `localhost:11434/v1` | `localhost:8000/v1` | 컨테이너 포트 80(보통 8080에 매핑) |
| **Chat completions** | 지원 | 지원 | 지원(Messages API, 1.4.0부터) |
| **그 밖의 OpenAI 엔드포인트** | completions, models, embeddings, responses | completions, embeddings, responses, audio | 여기서는 다루지 않음 |
| **설치** | 스크립트 하나 | pip 패키지 | Docker 이미지 |

각 프로젝트 문서에 따라 8B 모델을 띄우는 방법:

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

손이 가장 덜 가는 것은 단연 Ollama입니다. 다운로드, 양자화 파일, 모델 로드와 언로드를 알아서 처리하고, 노트북에서든 빌린 서버에서든 똑같이 작동합니다. 다만 Ollama의 OpenAI 호환 계층에는 빈 곳이 있습니다. chat completions에서 `logprobs`와 `tool_choice`를 지원하지 않고, 이미지는 URL이 아니라 base64로 보내야 합니다. vLLM은 제대로 된 CUDA와 Python 환경이 필요하고 튜닝할 플래그도 많지만, Hugging Face가 이제 TGI 대신 권하는 엔진입니다. TGI는 이미 Docker를 쓰고 있다면 쉽지만, 앞서 말한 유지 보수 문제가 있습니다.

## 어떤 작업에 어떤 엔진을 쓸까

**Ollama**는 사용자 한 명, 스크립트, 코딩 어시스턴트, 사용자 몇 명짜리 사내 도구, 여러 모델을 바꿔 가며 쓰는 머신에 맞습니다. 설치는 몇 분이면 되고, 4090에서 요청 하나의 속도는 어느 엔진에도 뒤지지 않습니다.

**vLLM**은 요청이 동시에 많이 들어올 때입니다. 공개 API, 다중 사용자 채팅 제품, 32개나 64개씩 한꺼번에 돌릴 수 있는 배치 작업입니다. 공개된 수치로는 RTX 4090에서 동시 요청 64개일 때 총 처리량이 Ollama의 약 세 배이고, A100에서는 차이가 훨씬 큽니다. 양자화와 API 지원 범위도 가장 넓습니다.

**TGI**는 이미 쓰고 있을 때만 쓰세요. 새 작업이라면 Hugging Face 자신의 권고가 vLLM이나 SGLang입니다.

시간 단위로 빌린다면 비용은 처리량에 따라 정해집니다. getdeploying.com이 2026년 9월에 올린 가장 싼 Vast.ai 온디맨드 가격인 시간당 $0.31짜리 RTX 4090에서, ComputingForGeeks 수치로 출력 토큰 100만 개를 만든다고 해 봅시다.

- 요청을 하나씩, 초당 174토큰: 1,000,000 ÷ 174 ≈ 5,750초 ≈ 1.6시간 ≈ **$0.50**.
- Ollama로 64개 동시, 초당 2,018토큰: ≈ 496초 ≈ **$0.04**.
- vLLM으로 64개 동시, 초당 6,623토큰: ≈ 151초 ≈ **$0.01**.

GPU가 내내 쉬지 않고 일한다고 가정한 값입니다. 요청이 늘 하나씩만 들어온다면 배칭으로 얻는 것이 없고 엔진을 바꿔도 청구액은 그대로입니다. 처리할 작업이 줄 서 있다면 청구액이 열 배 단위로 달라집니다. 같은 논리로 토큰당 API와 비교한 내용은 [시간당 GPU인가, 토큰당 API인가](/ko/hourly-gpu-vs-per-token-api/)에 있습니다.

## GPUFlow의 위치

GPUFlow 제공자 설치 프로그램은 기본으로 Ollama를 설치하고 GPUFlow 에이전트가 요청을 Ollama로 전달하므로, GPUFlow에서는 보통 위의 Ollama 열이 해당됩니다. 이용자는 제공자의 GPU에 있는 모델에 대한 OpenAI 호환 API 키(`https://gpuflow.app/v1`, `/v1/chat/completions`와 `/v1/models` 제공, 스트리밍 지원)를 빌립니다. 요금은 토큰이 아니라 시간으로, 최소 1분에 초 단위로 냅니다.

GPUFlow에서 할 수 없는 것도 있습니다. 엔진을 고르거나, 설정을 바꾸거나, 자체 코드를 돌릴 수 없습니다. SSH나 셸도 없습니다. 위의 벤치마크를 재현하거나 vLLM을 직접 돌리려면 Vast.ai나 RunPod에서 로그인할 수 있는 머신을 빌리세요([두 곳 비교](/ko/runpod-vs-vastapi-comparison/)). 아무것도 설치하지 않고 앱에서 Ollama로 서빙되는 모델을 쓰려면 [GPUFlow 마켓플레이스](https://gpuflow.app/ko/marketplace)와 [자주 쓰는 도구에서 키를 쓰는 방법](/ko/use-openai-compatible-api-key-in-apps/)을 보세요.

직접 파인튜닝한 모델을 어떻게 서빙할지 고민 중이라면, 그 전 단계는 [프라이빗 LLM 파인튜닝 가이드](/ko/private-llm-fine-tuning-guide/)에서 다룹니다.

## 출처

모두 2026년 9월에 확인했습니다.

- RTX 4090, L40S, RTX 5090에서 Ollama vs vLLM vs llama.cpp: [ComputingForGeeks](https://computingforgeeks.com/ollama-vs-vllm-vs-llama-cpp/) (2026년 9월 18일)
- A100 40 GB에서 Ollama vs vLLM: [Red Hat Developer](https://developers.redhat.com/articles/2025/08/08/ollama-vs-vllm-deep-dive-performance-benchmarking) (2025년 8월 8일)
- A100 80 GB에서 vLLM, TGI 등: [BentoML, Benchmarking LLM Inference Backends](https://www.bentoml.com/blog/benchmarking-llm-inference-backends) (2024년 6월 5일)
- llama.cpp CUDA 스코어보드: [github.com/ggml-org/llama.cpp/discussions/15013](https://github.com/ggml-org/llama.cpp/discussions/15013)
- RTX 4090 메모리와 대역폭: [TechPowerUp 리뷰](https://www.techpowerup.com/review/nvidia-geforce-rtx-4090-founders-edition/)
- Llama 3.1 8B 매개변수와 라이선스: [Hugging Face 모델 카드](https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct)
- Ollama: [FAQ(병렬 요청, KV 캐시)](https://docs.ollama.com/faq), [컨텍스트 길이](https://docs.ollama.com/context-length), [OpenAI 호환성](https://docs.ollama.com/api/openai-compatibility), [llama3.1:8b 태그](https://ollama.com/library/llama3.1:8b)
- vLLM: [OpenAI 호환 서버](https://docs.vllm.ai/en/latest/serving/online_serving/openai_compatible_server/), [양자화](https://docs.vllm.ai/en/latest/features/quantization/index.html), [엔진 인수(gpu-memory-utilization)](https://docs.vllm.ai/en/v0.6.4/models/engine_args.html)
- TGI: [문서와 유지 보수 공지](https://huggingface.co/docs/text-generation-inference/en/index), [GitHub 저장소(보관 처리됨)](https://github.com/huggingface/text-generation-inference), [Messages API](https://huggingface.co/docs/text-generation-inference/en/messages_api), [양자화](https://huggingface.co/docs/text-generation-inference/en/conceptual/quantization)
- RTX 4090 대여 가격: [getdeploying.com](https://getdeploying.com/reference/cloud-gpu/nvidia-rtx-4090)
- GPUFlow: [API 빠른 시작](https://docs.gpuflow.app/ko/renters/api-quickstart/), [제공자 시작하기](https://docs.gpuflow.app/ko/providers/getting-started/)
