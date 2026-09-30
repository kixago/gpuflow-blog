---
title: "대여 GPU로 Stable Diffusion LoRA를 $10 이하로 학습하기"
description: "대여한 RTX 4090으로 SDXL이나 Flux LoRA를 $10보다 훨씬 싸게 학습하는 방법. VRAM 기준 GPU 선택, 캡션, sd-scripts와 ai-toolkit 설정, 실제 비용 계산까지 정리했습니다."
excerpt: "2026년 9월 기준, 대여한 RTX 4090에서 SDXL LoRA를 한 번 학습하는 비용은 약 $0.35~$0.80입니다. 고를 GPU, 이미지 준비와 캡션 작성, 그대로 쓸 수 있는 학습 명령어, 그리고 돈이 실제로 어디에 나가는지 설명합니다."
pubDate: 2026-02-11
updatedDate: 2026-09-30
locale: "ko"
category: "tutorials"
featured: false
draft: false
author: "GPUFlow Team"
heroImage: "../_images/stable-diffusion-lora-training-guide.jpg"
heroImageAlt: "LoRA 네트워크 다이어그램이 표시된 큰 모니터 주위에 모인 사람들, 옆에는 서버 랙과 두 학습 에폭의 샘플 이미지를 비교하는 패널이 있는 일러스트"
faq:
  - question: "대여 GPU로 LoRA를 학습하는 데 비용이 얼마나 드나요?"
    answer: "2026년 9월 RTX 4090의 대여료는 Vast.ai에서 시간당 약 $0.31, RunPod 가격 페이지 기준 시간당 $0.74였습니다. 준비와 테스트를 포함해 약 65분이 걸리는 SDXL LoRA 세션 한 번은 대략 $0.34~$0.80입니다."
  - question: "SDXL LoRA를 학습하려면 VRAM이 얼마나 필요한가요?"
    answer: "sd-scripts 문서에 따르면 U-Net만 학습하고, latent와 텍스트 인코더 출력을 캐시하고, gradient checkpointing을 쓰면 GPU 메모리 8 GB로 SDXL LoRA를 학습할 수 있으며 권장은 10 GB입니다. RTX 3090이나 4090 같은 24 GB 카드라면 메모리 한계와 씨름하지 않고 1024x1024로 학습할 수 있습니다."
  - question: "RTX 4090으로 Flux LoRA를 학습할 수 있나요?"
    answer: "가능합니다. ai-toolkit에는 24 GB 카드용으로 이름 붙은 FLUX.1 예제 설정이 들어 있고, sd-scripts는 블록 스와핑을 써서 8 GB까지 내려가는 FLUX.1 설정을 안내합니다. Black Forest Labs의 공식 가이드는 RTX 4090에서 1,800스텝짜리 FLUX.2 [klein] LoRA 학습이 1시간 안에 끝난다고 합니다."
  - question: "LoRA 학습에 이미지가 몇 장 필요한가요?"
    answer: "인물, 사물, 스타일 하나당 좋은 이미지 15~40장이 일반적입니다. Black Forest Labs는 FLUX.2 [klein]에 하나의 모습을 공유하는 이미지 15~40장을 권합니다. 장수보다 선명하고 다양하며 캡션이 잘 달린 이미지가 더 중요합니다."
  - question: "LoRA 학습에는 kohya_ss, OneTrainer, ai-toolkit 중 무엇이 좋나요?"
    answer: "셋 다 쓸 만합니다. kohya의 sd-scripts는 기준이 되는 커맨드라인 도구이고 kohya_ss는 그 위에 웹 UI를 얹은 것입니다. OneTrainer는 데스크톱 UI와 내장 캡션 기능이 있고, ai-toolkit은 웹 UI, 공식 RunPod 템플릿, 그리고 FLUX.2나 Qwen-Image 같은 새 모델을 빨리 지원한다는 장점이 있습니다."
  - question: "GPUFlow에서 LoRA를 학습할 수 있나요?"
    answer: "없습니다. GPUFlow가 빌려주는 것은 제공자의 GPU에서 돌아가는 OpenAI 호환 채팅 API이고, 셸, SSH, 파일 접근이 없으므로 학습 스크립트를 실행할 수 없습니다. Vast.ai나 RunPod처럼 머신 자체를 빌려주는 플랫폼을 쓰세요."
---

SDXL이나 작은 Flux 모델용 LoRA는 대여 GPU에서 $10보다 훨씬 적은 돈으로 학습할 수 있습니다. 2026년 9월 기준 RTX 4090의 대여료는 Vast.ai에서 시간당 약 $0.31, RunPod에서 시간당 $0.74이고, SDXL LoRA 세션 한 번은 준비와 테스트까지 포함해 1시간 조금 넘게 걸립니다. 시도 한 번에 $0.34~$0.80이니, $10 예산이면 열 번 넘게 시도할 수 있습니다.

어려운 것은 돈이 아닙니다. 이미지, 캡션, 그리고 언제 멈출지 아는 것이 어렵습니다. 이 가이드는 그 모두를 붙여 넣어 쓸 수 있는 명령어와 함께 다룹니다. 가격과 도구 버전은 2026년 9월에 확인했고, 출처는 글 끝에 있습니다.

## 다섯 단계로 보는 작업 흐름

<figure>
<svg viewBox="0 0 720 250" role="img" aria-labelledby="d1-title" xmlns="http://www.w3.org/2000/svg" font-family="system-ui, sans-serif" font-size="15">
<title id="d1-title">LoRA 학습 흐름: 데이터셋, 캡션, 학습, 테스트, 사용. 결과가 이상하면 데이터셋으로 돌아갑니다</title>
<defs><marker id="d1-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#6366f1"/></marker></defs>
<rect width="720" height="250" fill="#ffffff"/>
<line x1="20" y1="40" x2="280" y2="40" stroke="#16a34a" stroke-width="2"/>
<text x="150" y="30" text-anchor="middle" fill="#16a34a" font-size="13">무료: 내 PC에서</text>
<line x1="300" y1="40" x2="560" y2="40" stroke="#f97316" stroke-width="2"/>
<text x="430" y="30" text-anchor="middle" fill="#f97316" font-size="13">과금: 대여한 GPU에서</text>
<rect x="20" y="60" width="120" height="70" rx="10" fill="#eef2ff" stroke="#6366f1" stroke-width="2"/>
<text x="80" y="90" text-anchor="middle" fill="#1e1b4b" font-weight="600">데이터셋</text>
<text x="80" y="112" text-anchor="middle" fill="#64748b" font-size="13">이미지 15–40장</text>
<rect x="160" y="60" width="120" height="70" rx="10" fill="#eef2ff" stroke="#6366f1" stroke-width="2"/>
<text x="220" y="90" text-anchor="middle" fill="#1e1b4b" font-weight="600">캡션</text>
<text x="220" y="112" text-anchor="middle" fill="#64748b" font-size="13">장마다 .txt 1개</text>
<rect x="300" y="60" width="120" height="70" rx="10" fill="#eef2ff" stroke="#6366f1" stroke-width="2"/>
<text x="360" y="90" text-anchor="middle" fill="#1e1b4b" font-weight="600">학습</text>
<text x="360" y="112" text-anchor="middle" fill="#64748b" font-size="13">sd-scripts</text>
<rect x="440" y="60" width="120" height="70" rx="10" fill="#eef2ff" stroke="#6366f1" stroke-width="2"/>
<text x="500" y="90" text-anchor="middle" fill="#1e1b4b" font-weight="600">테스트</text>
<text x="500" y="112" text-anchor="middle" fill="#64748b" font-size="13">샘플 그리드</text>
<rect x="580" y="60" width="120" height="70" rx="10" fill="#eef2ff" stroke="#6366f1" stroke-width="2"/>
<text x="640" y="90" text-anchor="middle" fill="#1e1b4b" font-weight="600">사용</text>
<text x="640" y="112" text-anchor="middle" fill="#64748b" font-size="13">ComfyUI, Forge</text>
<line x1="140" y1="95" x2="158" y2="95" stroke="#6366f1" stroke-width="2" marker-end="url(#d1-arrow)"/>
<line x1="280" y1="95" x2="298" y2="95" stroke="#6366f1" stroke-width="2" marker-end="url(#d1-arrow)"/>
<line x1="420" y1="95" x2="438" y2="95" stroke="#6366f1" stroke-width="2" marker-end="url(#d1-arrow)"/>
<line x1="560" y1="95" x2="578" y2="95" stroke="#6366f1" stroke-width="2" marker-end="url(#d1-arrow)"/>
<path d="M500,130 L500,180 L80,180 L80,134" fill="none" stroke="#f97316" stroke-width="2" stroke-dasharray="6 4" marker-end="url(#d1-arrow)"/>
<text x="290" y="205" text-anchor="middle" fill="#1e1b4b" font-size="13">결과가 이상하면 이미지나 캡션을 고치고 다시 학습</text>
<text x="360" y="235" text-anchor="middle" fill="#64748b" font-size="13">품질은 대부분 돈이 들지 않는 앞의 두 단계에서 결정됩니다</text>
</svg>
<figcaption>데이터셋과 캡션은 GPU를 빌리기 전에 끝내세요. 요금이 나가는 것은 학습과 테스트뿐이고, 결과가 나쁘면 대개 설정이 아니라 이미지로 돌아가게 됩니다.</figcaption>
</figure>

## LoRA란 무엇이고 왜 저렴한가

LoRA(Low-Rank Adaptation)는 기본 모델을 고정하고, 일부 레이어 옆에 작은 행렬 두 개를 붙여 학습합니다. 원 논문은 GPT-3 175B 전체 파인튜닝과 비교해 학습 파라미터를 10,000분의 1로, GPU 메모리를 3분의 1로 줄였다고 보고했습니다. 이미지 모델도 같은 원리입니다. SDXL 기본 체크포인트는 6.9 GB 파일이지만, 학습한 LoRA는 작은 별도 파일이고 원하는 강도로 기본 모델 위에 얹어 씁니다.

그래서 소비자용 GPU 한 장으로 충분하고, 학습은 며칠이 아니라 수십 분이면 끝납니다.

## VRAM 기준으로 GPU 고르기

무엇을 학습할 수 있는지는 VRAM이 정합니다. 학습에 과금되는 시간은 속도가 정하므로, 시간당 더 비싸지만 빠른 카드가 한 번 학습하는 비용으로는 비슷해질 수 있습니다.

| 모델 계열 | 문서상 최소 | 여유 있는 용량 | 참고 |
| --- | --- | --- | --- |
| SD 1.5 | 8 GB | 12 GB 이상 | 512x512로 학습, 가장 싸고 빠름 |
| SDXL | 8 GB (권장 10 GB) | 24 GB | U-Net만 학습, latent와 텍스트 인코더 출력 캐시 |
| FLUX.1 [dev] (12B) | 블록 스와핑을 많이 쓰면 8 GB | 24 GB | sd-scripts가 24, 16, 12, 10, 8 GB 설정을 안내 |
| FLUX.2 [klein] 4B/9B | 명시되지 않음 | 24 GB | BFL: bf16 가중치 약 13 GB, LoRA 학습은 24 GB 안에 들어감 |

저 VRAM 설정은 작동하지만 느립니다. sd-scripts가 FLUX.1을 8~16 GB에 넣는 방법은 트랜스포머 블록을 GPU와 시스템 RAM 사이에서 옮기는 것이고, 옮길 때마다 돈을 내는 시간이 흘러갑니다. 대여 머신이라면 24 GB 카드, 즉 RTX 3090이나 4090이 무난한 기본값입니다. RTX 5090(32 GB)도 되지만, sd-scripts에 따르면 CUDA 12.8이나 12.9용 PyTorch 2.8.0이 필요하므로 템플릿에 충분히 최신 스택이 들어 있는지 확인하세요.

![흰 선반 위에 세워 둔 팬 세 개짜리 ASUS TUF 그래픽카드](../_images/test-hero.jpg)

데이터센터 카드는 더 빠르지만, RunPod은 A100 80 GB를 시간당 $1.59로 내놓고 있어 4090의 두 배가 넘습니다. 이미지 20~30장짜리 LoRA라면 늘어난 속도가 그 차이를 메우는 경우가 드뭅니다. 큰 데이터셋이나 전체 파인튜닝에서 의미가 있습니다.

## 어디서 빌리고 얼마가 드는가

셸이나 Jupyter 노트북, 디스크, 파일을 넣고 뺄 방법이 있는 머신을 주는 플랫폼이 필요합니다. 이런 작업에는 Vast.ai와 RunPod이 가장 흔한 선택지입니다.

| GPU | VRAM | Vast.ai (최저) | RunPod 가격 페이지 | RunPod 추적 최저가 |
| --- | --- | --- | --- | --- |
| RTX 3090 | 24 GB | 약 $0.11–0.13/시간 | $0.50/시간 | $0.22/시간 |
| RTX 4090 | 24 GB | 약 $0.31–0.33/시간 | $0.74/시간 | $0.34/시간 |
| RTX 5090 | 32 GB | 약 $0.41–0.47/시간 | $0.99/시간 | $0.69/시간 |

2026년 9월 기준 가격입니다. "Vast.ai (최저)"와 "RunPod 추적 최저가"는 getdeploying.com 가격 추적기에서, 가운데 열은 RunPod 자체 가격 페이지에서 가져왔습니다. Vast.ai는 호스트가 가격을 직접 정하므로, 보이는 오퍼는 위치와 신뢰도 점수에 따라 다릅니다.

둘 다 초 단위로 과금합니다. 부가 비용은 다르고, 1시간짜리 작업에서는 시간당 가격이 암시하는 것보다 더 중요합니다.

- **Vast.ai**는 스토리지를 "실행 상태와 관계없이 인스턴스가 존재하는 동안" 청구하고, 대역폭은 호스트마다 정한 요금으로 바이트 단위로 청구합니다. 대역폭이 비싼 호스트에서 7 GB짜리 기본 모델을 내려받으면 금액이 쌓입니다. 인스턴스는 정지하지 말고 삭제하세요.
- **RunPod**는 실행 중 컨테이너 디스크에 월 GB당 $0.10을 받고, 정지하면 컨테이너 디스크 요금은 없으며, 정지된 볼륨 디스크에는 월 GB당 $0.20을 받습니다. 데이터 송수신 요금은 없습니다.

둘 다 기성 템플릿이 있습니다. ai-toolkit 개발자가 공식 RunPod 템플릿을 관리하고, kohya_ss README도 RunPod을 지원 환경으로 적어 두었습니다. 템플릿을 쓰면 과금되는 시간에 PyTorch를 설치하느라 쓰는 10분 이상을 아낄 수 있습니다. 더 넓은 가격 비교는 [GPUFlow vs Vast.ai vs RunPod vs SaladCloud](/ko/gpuflow-vs-vast-ai-vs-runpod/)와 [GPU 대여의 숨은 비용](/ko/hidden-fees-in-gpu-rental/)을 보세요.

## 데이터셋과 캡션 준비

이 작업은 모두 무언가를 빌리기 전에 내 컴퓨터에서 하세요.

### 이미지

- **장수.** 인물, 사물, 스타일 하나에 15~40장. Black Forest Labs는 FLUX.2 [klein]에 "하나의 모습을 공유하는 이미지 15~40장"을 권합니다. 추가 이미지가 더 약하다면 많을수록 좋은 것이 아닙니다.
- **일관성과 다양성.** 모든 이미지에 학습할 대상이 나와야 합니다. 나머지는 모두 달라야 합니다. 각도, 조명, 배경, 구도. 제품 사진이 전부 같은 흰 테이블 위라면 LoRA는 테이블을 배웁니다.
- **품질.** 선명하고 노출이 맞고, 워터마크나 텍스트 오버레이가 없어야 합니다. LoRA는 노이즈와 JPEG 블록도 다른 것만큼 충실하게 배웁니다.
- **해상도.** SDXL과 Flux는 짧은 변이 최소 1024픽셀, SD 1.5는 512픽셀. 정사각형으로 자를 필요는 없습니다. 버킷팅을 켜면 sd-scripts가 종횡비별로 이미지를 묶습니다.

### 캡션

이미지마다 같은 이름의 텍스트 파일이 하나씩 있어야 합니다(`photo01.jpg`, `photo01.txt`). 캡션은 말로 이미 설명되는 부분을 모델에 알려 주고, 그래서 LoRA는 설명되지 않은 부분을 배웁니다. 드문 트리거 단어를 맨 앞에 두고, 그다음 바뀔 수 있게 남겨 두고 싶은 모든 것을 적으세요.

```text
zxq_mug, a ceramic coffee mug on a wooden desk, morning light from the left, shallow depth of field
```

초안을 대신 써 주는 도구가 두 가지 있습니다.

- **WD14 tagger**는 sd-scripts에 포함되어 있고 쉼표로 구분된 태그를 만듭니다. 애니메이션 스타일 모델이나 태그로 학습된 SDXL 파인튜닝 모델에 적합합니다.

  ```bash
  python finetune/tag_images_by_wd14_tagger.py --onnx \
    --repo_id SmilingWolf/wd-swinv2-tagger-v3 --batch_size 4 /workspace/dataset/img
  ```

- **JoyCaption**은 확산 모델 학습용으로 만든 오픈(Apache 2.0) 캡션 모델로, 자연어 문장을 씁니다. Flux에는 태그보다 문장이 더 잘 맞습니다. README에 따르면 bf16에서 VRAM이 약 17 GB 필요하고, 작은 카드용으로 8비트와 4비트 버전이 있습니다.

OneTrainer에도 BLIP, BLIP2, WD-1.4를 쓰는 캡션 기능이 내장되어 있습니다. 무엇으로 초안을 만들든 캡션은 전부 읽고 고치세요. 프로젝트 전체에서 가장 값어치 있는 30분입니다.

## 트레이너 고르기

거의 모든 사람에게는 네 가지 도구로 충분합니다. 모두 무료 오픈 소스입니다.

| 도구 | 인터페이스 | 모델 (2026년 9월) | 잘 맞는 경우 |
| --- | --- | --- | --- |
| kohya-ss/sd-scripts | 커맨드라인 | SD 1.x/2.x, SDXL, SD3/3.5, FLUX.1, Lumina, HunyuanImage-2.1, Anima | 재현 가능한 학습, 완전한 제어 |
| bmaltais/kohya_ss | sd-scripts 위의 웹 UI | sd-scripts와 같음 | 플래그를 외우지 않고 sd-scripts 쓰기 |
| Nerogar/OneTrainer | 데스크톱 UI와 CLI | SD 1.5~3.5, SDXL, FLUX.1, FLUX.2, Chroma, Qwen Image 등 | 내장 캡션과 마스킹 |
| ostris/ai-toolkit | 웹 UI와 YAML 설정 | SD 1.5, SDXL, FLUX.1, FLUX.2, Qwen-Image, Wan 동영상 등 | Flux와 최신 모델, RunPod 템플릿 |

sd-scripts는 0.11.1 버전(2026년 6월)이고, Python 3.10에서 테스트되었으며 PyTorch 2.6.0 이상이 필요합니다. ai-toolkit은 Python 3.12를 권장하고, 현재 CUDA 13.0용 PyTorch 2.13.0을 설치합니다. OneTrainer는 Python 3.10~3.13이 필요합니다.

저는 SDXL에는 sd-scripts를 씁니다. 명령줄 자체가 설정 전부라서 학습을 반복하고 비교하기 쉽기 때문입니다. Flux에는 ai-toolkit을 씁니다.

## sd-scripts로 SDXL LoRA 학습하기

NVIDIA 드라이버가 있는 새 Linux 인스턴스라면 준비는 명령어 몇 줄이면 됩니다.

```bash
git clone https://github.com/kohya-ss/sd-scripts.git
cd sd-scripts
python -m venv venv && source venv/bin/activate
pip install torch==2.6.0 torchvision==0.21.0 --index-url https://download.pytorch.org/whl/cu124
pip install --upgrade -r requirements.txt
accelerate config default --mixed_precision bf16

# SDXL base model (not gated, CreativeML Open RAIL++-M license)
hf download stabilityai/stable-diffusion-xl-base-1.0 sd_xl_base_1.0.safetensors \
  --local-dir /workspace/models
```

이미지와 `.txt` 캡션이 든 폴더를 `scp`, `rsync` 또는 플랫폼의 파일 브라우저로 `/workspace/dataset/img`에 복사합니다. 그다음 `/workspace/dataset.toml`에 데이터셋을 기술합니다.

```toml
[general]
caption_extension = ".txt"
enable_bucket = true

[[datasets]]
resolution = 1024
batch_size = 1

  [[datasets.subsets]]
  image_dir = "/workspace/dataset/img"
  num_repeats = 10
```

그리고 학습을 시작합니다.

```bash
accelerate launch --num_cpu_threads_per_process 1 sdxl_train_network.py \
  --pretrained_model_name_or_path=/workspace/models/sd_xl_base_1.0.safetensors \
  --dataset_config=/workspace/dataset.toml \
  --output_dir=/workspace/output --output_name=zxq_mug \
  --save_model_as=safetensors \
  --network_module=networks.lora --network_dim=16 --network_alpha=8 \
  --network_train_unet_only \
  --optimizer_type=AdamW8bit --learning_rate=1e-4 \
  --lr_scheduler=constant_with_warmup --lr_warmup_steps=100 \
  --max_train_epochs=8 --save_every_n_epochs=2 \
  --mixed_precision=bf16 --save_precision=bf16 \
  --cache_latents --cache_latents_to_disk --cache_text_encoder_outputs \
  --gradient_checkpointing --sdpa --seed=42 \
  --sample_prompts=/workspace/prompts.txt --sample_every_n_epochs=2
```

`prompts.txt`에는 한 줄에 테스트 프롬프트 하나씩, 크기, 시드, 스텝을 지정하는 sd-scripts 인라인 옵션과 함께 적습니다.

```text
zxq_mug, a ceramic coffee mug on a kitchen counter --w 1024 --h 1024 --d 42 --s 28
zxq_mug, a ceramic coffee mug held by a hiker on a mountain top --w 1024 --h 1024 --d 42 --s 28
```

### 각 설정의 의미

- **스텝 수.** 이미지 수 × 반복 횟수 × 에폭 ÷ 배치 크기. 이미지 25장이면 25 × 10 × 8 = 2,000스텝입니다.
- **`network_dim` 16, `network_alpha` 8.** LoRA의 용량입니다. 사물이나 얼굴 하나에는 16이면 충분하고, 스타일은 32가 필요할 때도 있습니다. 랭크가 높을수록 과적합이 빨리 오고 파일도 커집니다.
- **`--network_train_unet_only`.** 여기서는 필수입니다. sd-scripts는 텍스트 인코더를 학습하면서 동시에 그 출력을 캐시하는 것을 거부하고, 어차피 문서에서도 SDXL LoRA에는 U-Net만 학습하는 것을 "강력히 권장"합니다.
- **캐시와 gradient checkpointing.** SDXL이 8~10 GB에 들어가는 것은 이 덕분입니다. 캐시를 쓰면 캡션 셔플과 캡션 드롭아웃도 꺼지므로 데이터셋 파일에 그 항목이 없습니다.
- **AdamW8bit와 `learning_rate` 1e-4.** sd-scripts 자체 SDXL LoRA 예제의 값입니다. 네 에폭이 지나도 샘플이 거의 변하지 않으면 2e-4를 시도하세요. 학습 이미지를 그대로 베낀 것처럼 나오면 낮추거나 더 일찍 멈추세요.
- **2에폭마다 체크포인트.** 2, 4, 6, 8에폭 파일이 나오고, 그중 가장 좋은 것을 고릅니다. 가장 좋은 LoRA가 마지막 것이 아닌 경우가 많습니다.

### 걸리는 시간

kohya_ss 이슈 스레드에서 사용자들은 RTX 4090에서 gradient checkpointing을 켜고 1024x1024, 배치 크기 1로 SDXL LoRA를 학습할 때 초당 약 1.1~1.4이터레이션이 나온다고 보고했습니다. 그 속도라면 2,000스텝에 24~30분, 여기에 latent 캐시에 몇 분이 더 걸립니다. 같은 스레드는 카드의 VRAM이 부족해 공유 메모리로 넘칠 때 얼마나 나빠지는지도 보여 줍니다. 스텝당 50초 이상입니다. 속도가 예상 범위보다 훨씬 낮다면 설정을 탓하기 전에 `nvidia-smi`부터 확인하세요.

## ai-toolkit으로 Flux와 최신 모델 학습하기

Flux라면 ai-toolkit이 가장 쉽습니다. 대여 머신에서 이렇게 합니다.

```bash
git clone https://github.com/ostris/ai-toolkit.git
cd ai-toolkit
python3 -m venv venv && source venv/bin/activate
pip3 install --no-cache-dir torch==2.13.0 torchvision==0.28.0 torchaudio==2.11.0 \
  --index-url https://download.pytorch.org/whl/cu130
pip3 install -r requirements.txt
cp config/examples/train_lora_flux_24gb.yaml config/zxq_mug.yml
# edit the dataset path, trigger word and steps, then:
python run.py config/zxq_mug.yml
```

또는 `cd ui && npm run build_and_start`로 웹 UI를 띄우고 8675 포트로 접속합니다. 다른 사람이 접근할 수 있는 서버라면 README 권고대로 먼저 `AI_TOOLKIT_AUTH`에 비밀번호를 설정하세요.

Flux 모델을 고르기 전에 알아야 할 라이선스 문제가 두 가지 있습니다.

- **FLUX.1 [dev]**는 Hugging Face에서 접근 승인이 필요한 게이트 모델입니다. FLUX.1 [dev] Non-Commercial License에 동의하고 Hugging Face 읽기 토큰으로 내려받습니다. 모델 카드에 따르면 생성 결과물은 상업적으로 쓸 수 있지만, 가중치와 내가 학습한 LoRA는 비상업 라이선스를 따릅니다.
- **FLUX.2 [klein] 4B**는 Apache 2.0이고 게이트가 없습니다. 9B 버전은 FLUX Non-Commercial License를 따릅니다.

Black Forest Labs는 2026년 6월에 ai-toolkit으로 FLUX.2 [klein] LoRA를 학습하는 가이드를 냈습니다. RTX 4090에서 1,800스텝 학습이 "1시간 안에 끝나며", 750~1,500스텝 부근의 체크포인트를 살펴보라고 권합니다. klein 4B의 세 배 크기인 FLUX.1 [dev]에 대해서는 그만큼 믿을 만한 공개 소요 시간을 찾지 못했습니다. 시간을 넉넉히 잡고 첫 학습에서 직접 재 보세요.

## 돈을 그만 내기 전에 LoRA 테스트하기

머신이 아직 켜져 있을 때 저장된 에폭별 샘플 이미지를 보세요. LoRA가 대상을 배웠는지, 언제부터 과적합이 시작됐는지를 공짜로 알려 줍니다. 그다음 마음에 드는 체크포인트를 내려받습니다.

```bash
rsync -avP user@your-instance:/workspace/output/*.safetensors ./loras/
```

집에서는 파일을 ComfyUI의 `models/loras` 폴더나 Forge의 `models/Lora`에 넣고 고정 시드로 테스트합니다.

- **강도.** 0.6, 0.8, 1.0을 시도해 보세요. 1.0보다 낮을 때 가장 좋아 보이는 LoRA도 있습니다.
- **유연성.** 데이터에 없던 장면에 트리거를 넣어 보세요. 산 위의 머그잔, 그림 속의 얼굴. 학습 이미지와 비슷한 장면에서만 작동한다면 과적합입니다. 더 이른 에폭을 쓰거나 반복 횟수를 줄이세요.
- **누출.** 트리거 단어 없이 생성해 보세요. 그래도 대상이 나온다면 캡션이 이미지를 충분히 설명하지 못한 것입니다.

결과가 틀렸을 때 해결책은 대개 데이터셋에 있습니다. 약한 이미지 몇 장을 빼거나, 바뀌어야 할 요소를 캡션에 적어 주는 것입니다. 학습률 변경은 두 번째로 시도할 일이지, 첫 번째가 아닙니다.

## 실제 비용 계산

RTX 4090에서 이미지 25장, 2,000스텝으로 SDXL LoRA 하나를 학습하는 경우입니다.

| 단계 | 시간 |
| --- | --- |
| 템플릿으로 시작, sd-scripts 설치 | 10분 |
| SDXL 기본 모델 다운로드, 데이터셋 업로드, 캐시 | 10분 |
| 학습 (2,000스텝, 1.1~1.4 it/s) | 30분 |
| 샘플 확인, 체크포인트 다운로드, 인스턴스 삭제 | 15분 |
| **합계** | **65분 (1.08시간)** |

- Vast.ai 시간당 $0.31: 1.08 × $0.31 = **$0.34**, 여기에 스토리지와 호스트의 대역폭 요금이 붙습니다.
- RunPod 시간당 $0.74: 1.08 × $0.74 = **$0.80**. 50 GB 컨테이너 디스크를 1시간 쓰면 50 × $0.10 ÷ 730시간 = 1센트도 안 됩니다.

학습 1시간에 준비와 테스트 30분이 드는 FLUX.2 [klein] LoRA는 RunPod에서 1.5 × $0.74 = **$1.11**, Vast.ai에서 1.5 × $0.31 = **$0.47**입니다.

<figure>
<svg viewBox="0 0 720 300" role="img" aria-labelledby="d2-title" xmlns="http://www.w3.org/2000/svg" font-family="system-ui, sans-serif" font-size="15">
<title id="d2-title">대여한 RTX 4090의 LoRA 학습 비용을 10달러 예산과 비교한 막대 그래프</title>
<rect width="720" height="300" fill="#ffffff"/>
<line x1="230" y1="40" x2="230" y2="250" stroke="#e2e8f0" stroke-width="1"/>
<line x1="322" y1="40" x2="322" y2="250" stroke="#e2e8f0" stroke-width="1"/>
<line x1="414" y1="40" x2="414" y2="250" stroke="#e2e8f0" stroke-width="1"/>
<line x1="506" y1="40" x2="506" y2="250" stroke="#e2e8f0" stroke-width="1"/>
<line x1="598" y1="40" x2="598" y2="250" stroke="#e2e8f0" stroke-width="1"/>
<line x1="690" y1="30" x2="690" y2="250" stroke="#f97316" stroke-width="2" stroke-dasharray="6 4"/>
<text x="698" y="22" text-anchor="end" fill="#f97316" font-size="13">예산 $10</text>
<text x="220" y="75" text-anchor="end" fill="#1e1b4b">SDXL, Vast.ai</text>
<rect x="230" y="58" width="15.6" height="26" fill="#16a34a"/>
<text x="253" y="76" fill="#1e1b4b" font-size="13">$0.34</text>
<text x="220" y="125" text-anchor="end" fill="#1e1b4b">SDXL, RunPod</text>
<rect x="230" y="108" width="36.8" height="26" fill="#6366f1"/>
<text x="275" y="126" fill="#1e1b4b" font-size="13">$0.80</text>
<text x="220" y="175" text-anchor="end" fill="#1e1b4b">FLUX.2 klein, RunPod</text>
<rect x="230" y="158" width="51.1" height="26" fill="#6366f1"/>
<text x="289" y="176" fill="#1e1b4b" font-size="13">$1.11</text>
<text x="220" y="225" text-anchor="end" fill="#1e1b4b">SDXL 5회, RunPod</text>
<rect x="230" y="208" width="184.5" height="26" fill="#6366f1"/>
<text x="422" y="226" fill="#1e1b4b" font-size="13">$4.01</text>
<line x1="230" y1="250" x2="690" y2="250" stroke="#64748b" stroke-width="1"/>
<text x="230" y="270" text-anchor="middle" fill="#64748b" font-size="13">$0</text>
<text x="322" y="270" text-anchor="middle" fill="#64748b" font-size="13">$2</text>
<text x="414" y="270" text-anchor="middle" fill="#64748b" font-size="13">$4</text>
<text x="506" y="270" text-anchor="middle" fill="#64748b" font-size="13">$6</text>
<text x="598" y="270" text-anchor="middle" fill="#64748b" font-size="13">$8</text>
<text x="690" y="270" text-anchor="middle" fill="#64748b" font-size="13">$10</text>
<text x="460" y="292" text-anchor="middle" fill="#64748b" font-size="13">RTX 4090 세션당 비용, 2026년 9월 가격</text>
</svg>
<figcaption>RunPod 정가로 SDXL을 다섯 번 따로 시도해도 $10에 한참 못 미칩니다. 시간당 $0.74면 $10로 RTX 4090을 13.5시간, $0.31이면 약 32시간 쓸 수 있습니다.</figcaption>
</figure>

$10 예산을 실제로 날리는 것은 학습인 경우가 드뭅니다. 밤새 켜 둔 인스턴스(시간당 $0.74로 12시간이면 $8.88), 정지했지만 스토리지 요금이 계속 나가는 Vast.ai 인스턴스, 과금되는 시간에 이미지 캡션을 다느라 쓴 1시간이 원인입니다. 초 단위 과금은 끝나면 머신을 삭제할 때만 도움이 됩니다.

## GPUFlow는 어디에 맞는가

이 작업에는 맞지 않습니다. GPUFlow가 빌려주는 것은 제공자가 자기 GPU에서 (보통 Ollama로) 서비스하는 언어 모델에 대한 접근이고, OpenAI 호환 API 키로 씁니다. 셸도, SSH도, 파일 접근도 없으므로 트레이너를 설치하거나 이미지를 올리거나 LoRA를 내려받을 수 없습니다. 게다가 이미지 모델이 아니라 채팅 모델을 제공합니다. 학습은 Vast.ai, RunPod처럼 머신을 빌려주는 플랫폼에서 하세요.

이미지가 아니라 텍스트를 다룬다면 빌리고, 학습하고, 삭제하는 같은 방식이 언어 모델에도 적용됩니다. [대여 GPU에서 LLM을 비공개로 파인튜닝하기](/ko/private-llm-fine-tuning-guide/)를 보세요.

## 출처

모두 2026년 9월에 확인했습니다.

- LoRA 논문: [Hu 외, LoRA: Low-Rank Adaptation of Large Language Models](https://arxiv.org/abs/2106.09685)
- sd-scripts: [README와 릴리스](https://github.com/kohya-ss/sd-scripts), [SDXL LoRA 학습](https://github.com/kohya-ss/sd-scripts/blob/main/docs/sdxl_train_network.md), [SDXL 참고 사항과 VRAM](https://github.com/kohya-ss/sd-scripts/blob/main/docs/train_SDXL-en.md), [데이터셋 설정](https://github.com/kohya-ss/sd-scripts/blob/main/docs/config_README-en.md), [FLUX.1 LoRA 학습](https://github.com/kohya-ss/sd-scripts/blob/main/docs/flux_train_network.md), [WD14 tagger](https://github.com/kohya-ss/sd-scripts/blob/main/docs/wd14_tagger_README-en.md)
- [bmaltais/kohya_ss](https://github.com/bmaltais/kohya_ss), [Nerogar/OneTrainer](https://github.com/Nerogar/OneTrainer), [ostris/ai-toolkit](https://github.com/ostris/ai-toolkit), [JoyCaption](https://github.com/fpgaminer/joycaption)
- SDXL 4090 속도: [kohya_ss 이슈 #1288](https://github.com/bmaltais/kohya_ss/issues/1288)
- Black Forest Labs: [60분 안에 LoRA로 FLUX.2 [klein] 파인튜닝하기](https://huggingface.co/blog/black-forest-labs/flux-2-klein-lora), 모델 카드 [FLUX.1 [dev]](https://huggingface.co/black-forest-labs/FLUX.1-dev), [FLUX.2 [klein] 4B](https://huggingface.co/black-forest-labs/FLUX.2-klein-base-4B), [FLUX.2 [klein] 9B](https://huggingface.co/black-forest-labs/FLUX.2-klein-base-9B)
- [Stable Diffusion XL base 1.0 모델 카드](https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0)
- 가격: [RunPod 가격](https://www.runpod.io/pricing), [RunPod 포드 가격과 스토리지](https://docs.runpod.io/pods/pricing), [Vast.ai 가격](https://docs.vast.ai/guides/instances/pricing.md), getdeploying.com의 [RTX 3090](https://getdeploying.com/reference/cloud-gpu/nvidia-rtx-3090), [RTX 4090](https://getdeploying.com/reference/cloud-gpu/nvidia-rtx-4090), [RTX 5090](https://getdeploying.com/reference/cloud-gpu/nvidia-rtx-5090), [Vast.ai](https://getdeploying.com/vast-ai)
- GPUFlow: [API 빠른 시작](https://docs.gpuflow.app/ko/renters/api-quickstart/)
