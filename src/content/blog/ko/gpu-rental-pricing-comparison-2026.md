---
title: "2026 GPU 대여 가격 비교: AWS, Google Cloud, Azure, RunPod, Vast"
description: "2026년 9월 AWS, Google Cloud, Azure, Lambda, RunPod, Vast.ai, GPUFlow의 시간당 GPU 대여 가격. RTX 3090부터 H100까지 온디맨드와 스팟 가격, 작업별 비용 계산."
excerpt: "H100 한 장은 Google Cloud에서 시간당 $11.06, Vast.ai에서는 $2가 안 됩니다. 주요 GPU의 2026년 9월 가격, 각 가격에 포함된 것, 실제 작업 세 가지의 비용을 정리했습니다."
pubDate: 2026-02-07
updatedDate: 2026-09-30
locale: "ko"
category: "pricing"
featured: false
draft: false
author: "GPUFlow Team"
heroImage: "../_images/gpu-rental-pricing-comparison-2026-hero.png"
heroImageAlt: "클라우드 업체와 마켓플레이스의 시간당 GPU 대여 가격을 길이가 다른 가로 막대로 비교한 그림"
faq:
  - question: "2026년에 H100을 시간당 얼마에 빌릴 수 있나요?"
    answer: "2026년 9월 기준 H100 한 장은 AWS(p5.4xlarge)에서 시간당 $6.88, Azure(94 GB H100 NVL)에서 $6.98, Google Cloud의 8-GPU A3 머신에서 GPU당 약 $11.06, Lambda에서 $3.99, RunPod에서 $2.69~$3.49, Vast.ai에서 약 $1.47부터였습니다."
  - question: "RTX 4090을 가장 싸게 빌리는 방법은 무엇인가요?"
    answer: "마켓플레이스입니다. 2026년 9월 가장 저렴한 온디맨드 RTX 4090은 Vast.ai에서 시간당 약 $0.31~$0.33, RunPod Community Cloud에서 $0.34였습니다. RunPod Secure Cloud는 $0.74였습니다. AWS, Google Cloud, Azure는 소비자용 RTX 카드를 대여하지 않습니다."
  - question: "A100 80GB는 시간당 얼마인가요?"
    answer: "2026년 9월 기준 RunPod Community Cloud $1.39, RunPod Secure Cloud $1.59, Lambda GPU당 $2.79, Azure(NC24ads A100 v4) $3.67, Google Cloud(a2-ultragpu-1g) $5.07입니다. AWS는 GPU당 $3.43이지만 p4de.24xlarge의 GPU 8개를 시간당 $27.45에 통째로 빌려야 합니다."
  - question: "AWS, Google Cloud, Azure의 GPU는 왜 이렇게 비싼가요?"
    answer: "GPU 인스턴스에 CPU, RAM, 로컬 NVMe가 넉넉히 묶여 있고, 일부 GPU는 8-GPU 머신으로만 팝니다. SLA와 GPU가 나머지 클라우드 계정 옆에 있다는 편의에 대한 값도 포함됩니다. 스팟 가격과 1~3년 약정을 쓰면 격차가 상당히 줄어듭니다."
  - question: "GPUFlow 가격은 어떻게 정해지나요?"
    answer: "각 제공자가 자기 GPU의 시간당 가격을 미국 달러로 정합니다. 대여는 시간 단위로 예약하고, 대여를 시작할 때 전체 금액이 크레딧에서 확보되며, 요금은 최소 1분에 초 단위로 청구됩니다. 쓰지 않은 시간은 대여가 끝날 때 크레딧으로 돌아옵니다. 제공자가 88%, GPUFlow가 12%를 가져갑니다."
  - question: "스팟 GPU 인스턴스는 쓸 만한가요?"
    answer: "체크포인트에서 다시 시작할 수 있는 작업이라면 그렇습니다. 2026년 9월 AWS p5.4xlarge H100은 온디맨드 시간당 $6.88, 스팟 $2.62였습니다. 중단되면 안 되는 작업이라면 한 번이라도 작업을 다시 돌리는 순간 절감액이 사라집니다."
---

2026년 9월 기준 H100 한 장은 AWS나 Azure에서 시간당 약 $6.90, Google Cloud에서 GPU당 $11.06, Lambda에서 $3.99, RunPod에서 $2.69~$3.49, Vast.ai에서 약 $1.50부터입니다. 소비자용 카드는 마켓플레이스에만 있습니다. RTX 4090은 싼 쪽이 시간당 $0.31~$0.34, RunPod 데이터센터 등급이 $0.74입니다. 같은 H100이라도 가장 비싼 온디맨드 1시간은 가장 싼 곳의 약 7.5배입니다.

이 글에서는 각 숫자의 출처, 시간당 가격에 포함된 것, 흔한 작업 세 가지의 전체 비용을 다룹니다. 별도 표시가 없으면 모두 온디맨드 가격이며, 미국 리전(AWS us-east-1, Azure East US, Google Cloud us-central1), Linux 기준으로 2026년 9월에 확인했습니다. 가격은 매달 바뀌므로 스냅숏으로 보고, 돈을 쓰기 전에 출처를 다시 확인하세요.

## 가격 한눈에 보기

데이터센터 GPU, GPU 1개당 시간당 달러:

| 업체 | L4 24 GB | A10G / A10 24 GB | A100 80 GB | H100 |
| --- | --- | --- | --- | --- |
| AWS | $0.81 (g6.xlarge) | $1.01 (g5.xlarge, A10G) | $3.43 (8-GPU p4de만 가능) | $6.88 (p5.4xlarge) |
| Google Cloud | $0.71 (g2-standard-4) | 없음 | $5.07 (a2-ultragpu-1g) | $11.06 (8-GPU A3, ÷ 8) |
| Azure | 없음 | $3.20 (NV36ads A10 v5) | $3.67 (NC24ads A100 v4) | $6.98 (NC40ads H100 v5, NVL 94 GB) |
| Lambda | 없음 | 없음 | $2.79 | $3.99 |
| RunPod Community / Secure | 없음 / $0.49 | 없음 | $1.39 / $1.59 | $2.69 / $3.49 |
| Vast.ai | 약 $0.27부터 | 없음 | 약 $0.43부터 | 약 $1.47부터 |

"없음"은 해당 업체의 가격표에서 맞는 단일 GPU 옵션을 찾지 못했다는 뜻입니다. 소비자용 카드, 시간당 달러:

| GPU | Vast.ai(최저 리스팅) | RunPod Community / Secure | 대여 사이트 전반의 일반적인 범위 |
| --- | --- | --- | --- |
| RTX 3090 24 GB | $0.11 – $0.13 | $0.22 / $0.50 | $0.11 – $0.31 |
| RTX 4090 24 GB | $0.31 – $0.33 | $0.34 / $0.74 | $0.30 – $0.46 |
| RTX 5090 32 GB | $0.41 – $0.47 | $0.69 / $0.99 | $0.41 – $0.69 |

AWS, Google Cloud, Azure, Lambda는 소비자용 RTX 카드를 올려 두지 않습니다. Vast.ai 가격이 범위로 적힌 이유는 같은 날 getdeploying.com 스냅숏 두 개의 최저가가 조금씩 달랐기 때문인데, 마켓플레이스 가격이 어떤지 잘 보여 주는 대목입니다. 마지막 열은 [GPUFlow 제공자 가격 가이드](https://docs.gpuflow.app/ko/providers/pricing/)가 2026년 9월에 Vast.ai, RunPod, Salad, SimplePod, TensorDock, Hyperstack, Lambda에서 모은 범위입니다.

## 시간당 가격에 포함된 것

이 숫자들은 엄밀히 같은 상품이 아닙니다. 소수점 둘째 자리보다 이 점이 더 중요합니다.

하이퍼스케일러 인스턴스에는 GPU 말고도 많은 것이 묶여 있습니다. AWS p5.4xlarge에는 vCPU 16개, RAM 256 GiB, 로컬 NVMe 3.84 TB가 딸려 옵니다. Azure NC24ads A100 v4는 vCPU 24개와 RAM 220 GiB입니다. A10 한 장을 통째로 쓰는 Azure NV36ads A10 v5는 vCPU 36개, RAM 440 GiB에 가상 워크스테이션용 GRID 라이선스까지 포함하는데, 비슷한 카드인데도 AWS의 세 배 가격인 이유를 어느 정도 설명해 줍니다. GPU만 필요해도 이 모든 것에 돈을 냅니다.

어떤 GPU는 큰 상자로만 나옵니다. AWS에서 A100 80 GB는 p4de.24xlarge로 팝니다. GPU 8개, 시간당 $27.45이고 더 작은 크기는 없습니다. 표에 있는 Google Cloud의 A3 High H100 머신은 8-GPU a3-highgpu-8g로 시간당 $88.49입니다. Lambda 가격표는 GPU당 가격을 보여 주지만, H100 옆에 적힌 머신 사양(vCPU 208개, RAM 1,800 GiB)은 멀티 GPU 시스템입니다. $3.99를 기준으로 계획을 세우기 전에 실제로 어떤 크기를 빌릴 수 있는지 확인하세요.

마켓플레이스 가격은 머신 주인이 정합니다. Vast.ai에서는 호스트마다 요금을 따로 정하고, 스토리지와 대역폭도 리스팅마다 별도 가격이 붙습니다. RunPod Community Cloud는 독립 제공자를 연결하고, Secure Cloud는 Tier 3·Tier 4 데이터센터에서 운영됩니다. 같은 RTX 4090이 앞쪽에서는 $0.34, 뒤쪽에서는 $0.74입니다.

시간당 가격에 빠진 것(디스크, 데이터 전송, 준비 시간, 유휴 시간)은 [GPU 대여의 실제 비용](/ko/hidden-fees-in-gpu-rental/)에서 다룹니다. 작은 작업에서는 이런 부가 비용이 GPU 시간보다 클 수 있습니다.

## H100 가격 나란히 보기

<figure>
<svg viewBox="0 0 720 380" role="img" aria-labelledby="d1-title" xmlns="http://www.w3.org/2000/svg" font-family="system-ui, sans-serif" font-size="15">
<title id="d1-title">2026년 9월 온디맨드 H100의 GPU 1개당 시간당 가격 막대 차트. Google Cloud 11.06달러부터 Vast.ai 1.47달러까지</title>
<rect x="0" y="0" width="720" height="380" fill="#ffffff"/>
<text x="20" y="28" fill="#1e1b4b" font-weight="600">H100 한 장, 온디맨드, GPU 1시간당 달러</text>
<line x1="190" y1="44" x2="190" y2="316" stroke="#e2e8f0" stroke-width="1"/>
<text x="190" y="336" text-anchor="middle" fill="#64748b" font-size="13">$0</text>
<line x1="270" y1="44" x2="270" y2="316" stroke="#e2e8f0" stroke-width="1"/>
<text x="270" y="336" text-anchor="middle" fill="#64748b" font-size="13">$2</text>
<line x1="350" y1="44" x2="350" y2="316" stroke="#e2e8f0" stroke-width="1"/>
<text x="350" y="336" text-anchor="middle" fill="#64748b" font-size="13">$4</text>
<line x1="430" y1="44" x2="430" y2="316" stroke="#e2e8f0" stroke-width="1"/>
<text x="430" y="336" text-anchor="middle" fill="#64748b" font-size="13">$6</text>
<line x1="510" y1="44" x2="510" y2="316" stroke="#e2e8f0" stroke-width="1"/>
<text x="510" y="336" text-anchor="middle" fill="#64748b" font-size="13">$8</text>
<line x1="590" y1="44" x2="590" y2="316" stroke="#e2e8f0" stroke-width="1"/>
<text x="590" y="336" text-anchor="middle" fill="#64748b" font-size="13">$10</text>
<line x1="670" y1="44" x2="670" y2="316" stroke="#e2e8f0" stroke-width="1"/>
<text x="670" y="336" text-anchor="middle" fill="#64748b" font-size="13">$12</text>
<text x="180" y="69" text-anchor="end" fill="#1e1b4b">Google Cloud</text>
<rect x="190" y="50" width="442.4" height="26" rx="3" fill="#6366f1"/>
<text x="640.4" y="69" fill="#1e1b4b">$11.06</text>
<text x="180" y="107" text-anchor="end" fill="#1e1b4b">Azure (H100 NVL)</text>
<rect x="190" y="88" width="279.2" height="26" rx="3" fill="#6366f1"/>
<text x="477.2" y="107" fill="#1e1b4b">$6.98</text>
<text x="180" y="145" text-anchor="end" fill="#1e1b4b">AWS</text>
<rect x="190" y="126" width="275.2" height="26" rx="3" fill="#6366f1"/>
<text x="473.2" y="145" fill="#1e1b4b">$6.88</text>
<text x="180" y="183" text-anchor="end" fill="#1e1b4b">Lambda</text>
<rect x="190" y="164" width="159.6" height="26" rx="3" fill="#16a34a"/>
<text x="357.6" y="183" fill="#1e1b4b">$3.99</text>
<text x="180" y="221" text-anchor="end" fill="#1e1b4b">RunPod Secure</text>
<rect x="190" y="202" width="139.6" height="26" rx="3" fill="#16a34a"/>
<text x="337.6" y="221" fill="#1e1b4b">$3.49</text>
<text x="180" y="259" text-anchor="end" fill="#1e1b4b">RunPod Community</text>
<rect x="190" y="240" width="107.6" height="26" rx="3" fill="#16a34a"/>
<text x="305.6" y="259" fill="#1e1b4b">$2.69</text>
<text x="180" y="297" text-anchor="end" fill="#1e1b4b">Vast.ai (최저가)</text>
<rect x="190" y="278" width="58.8" height="26" rx="3" fill="#16a34a"/>
<text x="256.8" y="297" fill="#1e1b4b">$1.47</text>
<line x1="190" y1="44" x2="190" y2="316" stroke="#64748b" stroke-width="1.5"/>
<rect x="190" y="352" width="14" height="14" fill="#6366f1"/>
<text x="212" y="364" fill="#64748b" font-size="13">하이퍼스케일 클라우드</text>
<rect x="360" y="352" width="14" height="14" fill="#16a34a"/>
<text x="382" y="364" fill="#64748b" font-size="13">GPU 클라우드와 마켓플레이스</text>
</svg>
<figcaption>2026년 9월 GPU 1개 기준 온디맨드 H100 가격. Google Cloud 가격은 8-GPU A3 머신 가격을 8로 나눈 값입니다. Azure의 단일 GPU 크기는 94 GB H100 NVL입니다. Vast.ai는 그날 getdeploying.com에 나온 최저 리스팅입니다.</figcaption>
</figure>

차트는 축척대로 그렸습니다. 두 가지가 눈에 띕니다. 3대 클라우드는 GPU당 $7 근처에 몰려 있고, Google Cloud는 8-GPU A3 머신 때문에 그보다 훨씬 위에 있습니다. 그리고 똑같은 연산을 하는 카드인데 AWS와 가장 싼 Vast.ai 리스팅의 차이가 네 배가 넘습니다.

더 낸 돈으로 사는 것은 분명히 있습니다. SLA, 컴플라이언스 서류, 바로 옆에 있는 나머지 인프라, 지원 계약입니다. 마켓플레이스에서 포기하는 것도 분명합니다. 호스트가 소규모 운영자일 수 있고, 안정성은 리스팅마다 다르며, SLA가 없습니다. 주말 실험이라면 마켓플레이스가 쉽게 이깁니다. 규제를 받는 프로덕션 시스템이라면 아예 선택지가 아닌 경우가 많습니다.

## 스팟과 중단 가능 인스턴스 가격

이 비교에 나온 업체는 모두 남는 용량을 더 싸게 팝니다. 대신 언제든 회수될 수 있습니다.

| 인스턴스 | 온디맨드 | 스팟 | 절감률 |
| --- | --- | --- | --- |
| AWS g6.xlarge (1× L4) | $0.805 | $0.605 | 25% |
| AWS g5.xlarge (1× A10G) | $1.006 | $0.469 | 53% |
| AWS p5.4xlarge (1× H100) | $6.88 | $2.623 | 62% |
| Google Cloud g2-standard-4 (1× L4) | $0.707 | $0.403 | 43% |
| Google Cloud a3-highgpu-8g (8× H100) | $88.49 | $41.60 | 53% |
| Azure NC24ads A100 v4 (1× A100 80 GB) | $3.673 | $0.679 | 82% |
| Azure NC40ads H100 v5 (1× H100 NVL) | $6.98 | $1.29 | 82% |

Azure 스팟 가격은 소매 가격 API에서 가져왔으며, A100과 H100 스팟 요금은 2026년 7월과 8월부터 적용된 값입니다. H100 스팟 요금은 저희가 마켓플레이스에서 찾은 가장 싼 온디맨드 H100 리스팅보다도 낮았습니다. 스팟 가격은 자주 바뀌고 용량도 보장되지 않으니 스냅숏으로 보세요.

Vast.ai 문서에 따르면 중단 가능(interruptible) 인스턴스는 "온디맨드보다 50% 이상 저렴한 경우가 많습니다". getdeploying.com에는 RTX 3090 중단 가능 인스턴스가 $0.08부터 나와 있었습니다. 스팟은 작업이 체크포인트를 저장하고 멈춘 지점부터 이어서 할 수 있을 때만 돈을 아껴 줍니다. 그렇지 않으면 한 번 중단될 때마다 같은 시간에 두 번 돈을 냅니다.

## GPUFlow의 위치

GPUFlow도 마켓플레이스지만 빌려주는 것의 범위가 더 좁습니다. 제공자가 자기 Linux 머신에서 AI 모델을 돌리고(보통 Ollama로), 이용자는 그 GPU를 시간 단위로 빌려 OpenAI 호환 API 키를 받습니다(기본 URL `https://gpuflow.app/v1`, `/v1/chat/completions`와 `/v1/models` 제공). SSH, 셸, 파일 접근이 없으므로 학습, 파인튜닝, 자체 코드 실행은 할 수 없습니다. 스크립트나 앱에서 오픈 모델을 호출하는 용도라면 준비 과정이 통째로 사라집니다. 모델이 이미 제공자의 머신에 설치되어 있기 때문입니다.

GPUFlow는 가격을 정하지 않으므로 표에 넣을 GPUFlow 가격이 없습니다. 대신 가격이 매겨지는 방식은 다음과 같습니다.

- 각 제공자가 리스팅의 시간당 가격을 미국 달러로 정합니다. 가격을 입력할 때 리스팅 양식이 다른 대여 사이트의 가격 범위에서 어디쯤인지, 수수료를 뺀 수입이 얼마인지 보여 줍니다.
- 대여는 시간 단위로 예약합니다. 기본값은 1~168시간입니다. 예약한 금액 전체가 대여를 시작할 때 크레딧에서 확보됩니다.
- 요금은 초 단위로, 최소 1분, 다음 센트로 올림해 청구됩니다(계산은 [초 단위 vs 시간 단위 과금](/ko/per-second-vs-hourly-gpu-billing/)에 있습니다). 일찍 끝내거나 시간이 다 되면 확보 금액 중 쓰지 않은 부분이 바로 크레딧으로 돌아옵니다.
- 제공자의 머신이 10분 동안 응답하지 않으면 대여가 끝나고, 머신의 마지막 하트비트 시점까지만 냅니다.
- 토큰은 집계만 하고 청구하지 않습니다. 파일을 저장할 머신을 받는 것이 아니므로 청구서에 디스크나 데이터 전송 항목도 없습니다.
- 크레딧은 Stripe를 통해 카드로 사며, 한 번에 $10~$500, 수수료는 없습니다. 1크레딧은 $0.01이고 크레딧은 만료되지 않습니다. 제공자가 청구액의 88%, GPUFlow가 12%를 가져갑니다.

![시간당 요금 $0.35가 입력된 GPUFlow 리스팅 양식. 다른 대여 사이트의 RTX 4090 가격 범위 $0.30~$0.46과 비교하는 막대, 12% 수수료를 뺀 제공자 수입 $0.31이 표시되어 있습니다](../_images/screens/ko/provider-price-bar.png)

API 키를 빌리는 것과 컨테이너를 빌리는 것을 더 자세히 비교한 글은 [GPUFlow vs Vast.ai vs RunPod vs SaladCloud](/ko/gpuflow-vs-vast-ai-vs-runpod/)입니다. 시간당 GPU 가격과 토큰당 API를 비교하고 있다면 [계산은 여기에](/ko/hourly-gpu-vs-per-token-api/) 있습니다.

## 계산 예시 1: 24 GB 카드에서 3시간 배치 작업

7B~8B 오픈 모델로 문서 더미를 3시간쯤 처리한다고 해 봅시다. 24 GB 카드라면 아무것이나 됩니다.

| 선택지 | 계산 | GPU 비용 |
| --- | --- | --- |
| Vast.ai RTX 4090 | 3 × $0.31 | $0.93 |
| RunPod Community RTX 4090 | 3 × $0.34 | $1.02 |
| Google Cloud L4 (g2-standard-4) | 3 × $0.707 | $2.12 |
| RunPod Secure RTX 4090 | 3 × $0.74 | $2.22 |
| AWS L4 (g6.xlarge) | 3 × $0.805 | $2.42 |
| AWS A10G (g5.xlarge) | 3 × $1.006 | $3.02 |

이 모든 선택지에서 준비 시간도 냅니다. 추론 서버를 설치하고 모델을 받는 동안에도 요금이 나갑니다. 그 시간이 20분이면 Vast.ai 카드에서 $0.10, AWS L4에서 $0.27이 더해집니다.

GPUFlow에서 시간당 $0.35짜리 리스팅을 예로 들어 봅시다(스크린숏에 나온 가격일 뿐 견적이 아닙니다). 3시간을 예약하면 $1.05가 확보됩니다. 작업이 2시간 10분(7,800초) 만에 끝나서 대여를 종료합니다. 청구액은 7,800 × 35 ÷ 3,600 = 75.8센트를 올림한 $0.76이고, $0.29는 크레딧으로 돌아옵니다. 단, 원하는 모델을 돌리는 제공자가 있어야 가능한 이야기입니다.

## 계산 예시 2: A100 80 GB에서 8시간 파인튜닝

파인튜닝에는 직접 제어할 수 있는 머신이 필요하므로 여기서 GPUFlow는 빠집니다.

| 선택지 | 계산 | 비용 |
| --- | --- | --- |
| Vast.ai, 최저가 A100 리스팅 | 8 × $0.43 | $3.44 |
| RunPod Community A100 SXM | 8 × $1.39 | $11.12 |
| RunPod Secure A100 SXM | 8 × $1.59 | $12.72 |
| Lambda A100 SXM 80 GB | 8 × $2.79 | $22.32 |
| Azure NC24ads A100 v4 | 8 × $3.673 | $29.38 |
| Google Cloud a2-ultragpu-1g | 8 × $5.069 | $40.55 |
| AWS p4de.24xlarge (GPU 8개) | 8 × $27.45 | $219.60 |

Vast.ai 행은 getdeploying.com에 나온 가장 싼 A100 리스팅입니다(2-GPU 머신의 SXM 카드이며 메모리 크기는 표시되지 않았습니다). 그 가격을 믿고 계획하기 전에 리스팅을 확인하세요. AWS 행은 오타가 아닙니다. AWS에서 A100 80 GB 한 장이 필요하면 여덟 장을 빌려야 합니다. Lambda 행은 실제로 빌릴 수 있는 크기가 있다고 가정한 값입니다. 앞의 설명을 참고하세요.

학습 루프가 15~30분마다 체크포인트를 저장한다면 Azure 스팟 가격 시간당 $0.679로 이 작업을 $5.43에 끝낼 수 있습니다. 용량을 구할 수 있을 때의 이야기입니다.

## 계산 예시 3: 24시간 돌아가는 L4 서빙

720시간짜리 한 달 동안 켜 두는 작은 추론 엔드포인트입니다.

| 선택지 | 계산 | 월 비용 |
| --- | --- | --- |
| Vast.ai L4, 최저가 리스팅 | 720 × $0.27 | $194.40 |
| RunPod Secure L4 | 720 × $0.49 | $352.80 |
| AWS g6.xlarge, 1년 예약 | 720 × $0.524 | $377.28 |
| Google Cloud g2-standard-4 | 720 × $0.707 | $509.04 |
| AWS g6.xlarge, 온디맨드 | 720 × $0.805 | $579.60 |

이 정도 기간이면 약정 할인이 의미를 갖기 시작합니다. 같은 인스턴스의 AWS 1년 예약 요금은 온디맨드보다 35% 낮습니다. 그래도 마켓플레이스가 가장 싸지만, 호스트 하나는 곧 단일 장애 지점입니다. 엔드포인트에 사용자가 있다면 머신이 두 대는 있어야 할 테고, 그러면 마켓플레이스 행이 두 배가 되어 격차는 보이는 것보다 작아집니다.

## 제가 고르는 방법

실험, 이미지 생성, LoRA 학습처럼 다시 시작할 수 있는 작업이라면 마켓플레이스의 RTX 3090이나 4090입니다. 싼 쪽은 시간당 $0.11~$0.34이고, 대형 클라우드에는 근처에 오는 것도 없습니다.

A100이나 H100이 필요한 큰 모델이고 규제 대상이 아니라면 RunPod나 Lambda를 먼저 보고, 호스트마다 안정성 점수를 확인할 의향이 있다면 Vast.ai를 봅니다. 결정하기 전에 Azure와 Google Cloud의 스팟 가격도 확인하세요. 2026년 9월에는 의외로 경쟁력이 있었습니다.

규제 대상 데이터, 이미 AWS·Azure·Google Cloud에서 돌아가는 회사, SLA가 필요한 작업이라면 쓰던 클라우드에 남아서 약정이나 스팟 용량으로 가격을 낮추세요. H100에 시간당 $7을 내는 편이 새 업체의 보안 심사를 받는 것보다 싼 경우가 많습니다.

서버를 운영하지 않고 코드에서 오픈 모델을 호출하려면 API입니다. 원하는 모델을 호스팅하는 토큰당 API가 있다면 그것을, 특정 제공자의 모델을 고정된 시간당 가격으로 쓰고 싶다면 GPUFlow의 시간 단위 대여를 쓰세요. 계정 쪽 준비는 [GPU 대여에 필요한 것](/ko/what-you-need-to-rent-a-gpu/)에서 다룹니다.

## 출처

- AWS: [EC2 온디맨드 가격](https://aws.amazon.com/ec2/pricing/on-demand/), [P5 인스턴스](https://aws.amazon.com/ec2/instance-types/p5/), [P4 인스턴스](https://aws.amazon.com/ec2/instance-types/p4/). 시간당 가격은 Vantage가 옮겨 둔 AWS 가격표에서 확인: [g6.xlarge](https://instances.vantage.sh/aws/ec2/g6.xlarge?region=us-east-1), [g5.xlarge](https://instances.vantage.sh/aws/ec2/g5.xlarge?region=us-east-1), [p5.4xlarge](https://instances.vantage.sh/aws/ec2/p5.4xlarge?region=us-east-1), [p5.48xlarge](https://instances.vantage.sh/aws/ec2/p5.48xlarge?region=us-east-1), [p4de.24xlarge](https://instances.vantage.sh/aws/ec2/p4de.24xlarge?region=us-east-1)
- Google Cloud: [가속기 최적화 VM 가격](https://cloud.google.com/products/compute/pricing/accelerator-optimized), [VM 인스턴스 가격](https://cloud.google.com/compute/vm-instance-pricing)
- Azure: [Linux VM 가격](https://azure.microsoft.com/en-us/pricing/details/virtual-machines/linux/), [Azure 소매 가격 API](https://prices.azure.com/api/retail/prices), 크기: [NC A100 v4](https://learn.microsoft.com/en-us/azure/virtual-machines/sizes/gpu-accelerated/nca100v4-series), [NCads H100 v5](https://learn.microsoft.com/en-us/azure/virtual-machines/sizes/gpu-accelerated/ncadsh100v5-series), [NVads A10 v5](https://learn.microsoft.com/en-us/azure/virtual-machines/sizes/gpu-accelerated/nvadsa10v5-series)
- Lambda: [가격](https://lambda.ai/pricing)
- RunPod: [가격](https://www.runpod.io/pricing), [RTX 3090](https://www.runpod.io/gpu-models/rtx-3090), [RTX 4090](https://www.runpod.io/gpu-models/rtx-4090), [RTX 5090](https://www.runpod.io/gpu-models/rtx-5090), [A100 SXM](https://www.runpod.io/gpu-models/a100-sxm), [H100 SXM](https://www.runpod.io/gpu-models/h100-sxm), [포드 개요](https://docs.runpod.io/pods/overview)
- Vast.ai: [가격 문서](https://docs.vast.ai/guides/instances/pricing.md). getdeploying.com의 마켓플레이스 가격: [Vast.ai](https://getdeploying.com/vast-ai), [RTX 3090](https://getdeploying.com/reference/cloud-gpu/nvidia-rtx-3090), [RTX 4090](https://getdeploying.com/reference/cloud-gpu/nvidia-rtx-4090), [RTX 5090](https://getdeploying.com/reference/cloud-gpu/nvidia-rtx-5090), [A100](https://getdeploying.com/reference/cloud-gpu/nvidia-a100), [H100](https://getdeploying.com/reference/cloud-gpu/nvidia-h100)
- GPUFlow: [GPU 가격 정하기](https://docs.gpuflow.app/ko/providers/pricing/), [결제](https://docs.gpuflow.app/ko/renters/billing/), [API 빠른 시작](https://docs.gpuflow.app/ko/renters/api-quickstart/), [마켓플레이스](https://gpuflow.app/ko/marketplace)

모두 2026년 9월에 확인했습니다.
