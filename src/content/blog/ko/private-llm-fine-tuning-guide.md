---
title: "대여 GPU로 LLM을 비공개로 파인튜닝하기: 실전 가이드"
description: "파인튜닝이 RAG나 프롬프트보다 나은 경우, 모델 크기별 QLoRA VRAM, TRL·Unsloth·Axolotl 비교, GPU 대여 시 데이터 보호, 비용과 서빙까지 정리했습니다."
excerpt: "8B 오픈 모델의 QLoRA 파인튜닝은 대여한 24 GB GPU 한 장에 들어가고, 한 번에 약 $0.35~$0.83입니다. 돈을 쓰기 전에 파인튜닝이 맞는 도구인지 확인하고, 남의 머신에서 내 데이터를 어떻게 지킬지 계획하세요."
pubDate: 2025-02-23
updatedDate: 2026-09-30
locale: "ko"
category: "tutorials"
featured: false
draft: false
author: "GPUFlow Team"
heroImage: "../_images/private-llm-fine-tuning-guide-hero.png"
heroImageAlt: "대여한 GPU 서버에서 비공개 데이터셋으로 언어 모델을 파인튜닝하는 모습을 그린 일러스트"
faq:
  - question: "7B나 8B 모델을 파인튜닝하려면 VRAM이 얼마나 필요한가요?"
    answer: "Unsloth 요구 사항 표에 따르면 QLoRA로는 7B 모델에 약 5 GB, 8B 모델에 약 6 GB가 필요하고, 일반 16비트 LoRA로는 약 19 GB와 22 GB가 필요합니다. 실제 학습에는 더 긴 시퀀스와 큰 배치를 위한 여유가 필요하므로 RTX 3090이나 4090 같은 24 GB 카드가 무난합니다."
  - question: "파인튜닝과 RAG 중 무엇을 써야 하나요?"
    answer: "모델이 내 문서의 사실, 특히 바뀌는 사실을 알아야 한다면 RAG를 쓰세요. Ovadia 외의 2024년 연구는 지식을 추가하는 데 RAG가 비지도 파인튜닝보다 일관되게 낫다는 결과를 얻었습니다. 프롬프트로는 안정적으로 얻을 수 없는 일정한 형식, 어조, 좁은 작업 동작이 필요할 때 파인튜닝하세요."
  - question: "대여 GPU로 LLM을 파인튜닝하는 데 비용이 얼마나 드나요?"
    answer: "예시 2,000개로 8B 모델을 QLoRA 학습하면 준비를 포함해 1시간 조금 넘게 걸립니다. 시간당 $0.31인 Vast.ai RTX 4090에서 약 $0.35, RunPod 정가 시간당 $0.74로는 $0.83입니다(2026년 9월). 예시 20,000개짜리 학습은 약 4시간, $1.24~$2.97입니다."
  - question: "GPU 호스트가 내 학습 데이터를 볼 수 있나요?"
    answer: "하드웨어의 주인이 호스트이므로 볼 수 있다고 가정하세요. 컨테이너 격리는 다른 대여자로부터 나를 보호할 뿐, 머신 소유자로부터 보호하지는 않습니다. 민감한 데이터에는 검증된 데이터센터 호스트(Vast.ai Secure Cloud, RunPod Secure Cloud)를 쓰고, 업로드 전에 개인정보를 지우고, 끝나면 인스턴스를 삭제하세요."
  - question: "LoRA와 QLoRA는 무엇이 다른가요?"
    answer: "LoRA는 기본 모델을 고정하고 작은 어댑터 행렬을 학습합니다. QLoRA도 같지만 고정된 기본 모델을 4비트 NF4 정밀도로 불러오며, 원 논문에서는 이 덕분에 메모리가 줄어 48 GB GPU 한 장으로 65B 모델을 파인튜닝할 수 있었습니다."
  - question: "GPUFlow에서 파인튜닝하거나 내 모델을 올릴 수 있나요?"
    answer: "없습니다. GPUFlow는 추론 전용입니다. 제공자가 자기 머신에 (보통 Ollama로) 설치한 모델에 대한 OpenAI 호환 채팅 API를 빌리는 것입니다. 셸이나 파일 접근이 없으므로 학습하거나 내 모델을 올릴 수 없습니다."
---

8B 오픈 웨이트 모델은 대여한 24 GB GPU 한 장에서 QLoRA로 내 데이터에 맞게 파인튜닝할 수 있고, 보통 한 번에 1달러도 들지 않습니다. 더 어려운 질문이 먼저입니다. 파인튜닝이 애초에 맞는 해결책인지(사실 지식이라면 대개 검색이 낫습니다), 그리고 남이 소유한 머신에서 내 데이터를 어떻게 비공개로 지킬지입니다.

이 가이드는 둘 다 다룬 뒤, 모델 크기별 필요 VRAM, 현재 쓰이는 도구, 작동하는 학습 스크립트, 비용 계산, 결과물 서빙 방법을 설명합니다. 모든 내용은 2026년 9월에 확인했고, 출처는 글 끝에 있습니다.

## 파인튜닝, RAG, 더 나은 프롬프트

파인튜닝은 모델의 동작 방식을 바꿉니다. 사실을 가르치는 방법으로는 좋지 않습니다. Ovadia 외는 지식 주입 측면에서 둘을 비교해, RAG가 "학습 중 접한 기존 지식과 완전히 새로운 지식 모두에서" 비지도 파인튜닝보다 "일관되게 우수하다"는 결과를 얻었습니다. 이들의 결론은 LLM이 파인튜닝으로 새 사실을 배우는 데 어려움을 겪는다는 것입니다.

그러니 무언가를 빌리기 전에 이 트리를 따라가 보세요.

<figure>
<svg viewBox="0 0 720 420" role="img" aria-labelledby="d1-title" xmlns="http://www.w3.org/2000/svg" font-family="system-ui, sans-serif" font-size="15">
<title id="d1-title">검색, 더 나은 프롬프트, 파인튜닝, 더 큰 모델 중 무엇을 고를지 정하는 결정 트리</title>
<defs><marker id="d1-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#64748b"/></marker></defs>
<rect width="720" height="420" fill="#ffffff"/>
<rect x="60" y="15" width="280" height="40" rx="8" fill="#1e1b4b"/>
<text x="200" y="40" text-anchor="middle" fill="#ffffff">답변이 충분히 좋지 않다</text>
<line x1="200" y1="55" x2="200" y2="83" stroke="#64748b" stroke-width="2" marker-end="url(#d1-arrow)"/>
<rect x="20" y="85" width="360" height="50" rx="8" fill="#ffffff" stroke="#f97316" stroke-width="2"/>
<text x="200" y="115" text-anchor="middle" fill="#1e1b4b">사실이 빠졌거나, 자주 바뀌는 데이터인가?</text>
<rect x="440" y="80" width="260" height="60" rx="10" fill="#f0fdf4" stroke="#16a34a" stroke-width="2"/>
<text x="570" y="105" text-anchor="middle" fill="#1e1b4b" font-weight="600">RAG 사용</text>
<text x="570" y="126" text-anchor="middle" fill="#64748b" font-size="13">요청마다 내 문서를 검색</text>
<line x1="380" y1="110" x2="438" y2="110" stroke="#64748b" stroke-width="2" marker-end="url(#d1-arrow)"/>
<text x="409" y="102" text-anchor="middle" fill="#16a34a" font-size="13">예</text>
<line x1="200" y1="135" x2="200" y2="173" stroke="#64748b" stroke-width="2" marker-end="url(#d1-arrow)"/>
<text x="215" y="160" fill="#64748b" font-size="13">아니요</text>
<rect x="20" y="175" width="360" height="50" rx="8" fill="#ffffff" stroke="#f97316" stroke-width="2"/>
<text x="200" y="205" text-anchor="middle" fill="#1e1b4b">지시문과 예시로 해결되는가?</text>
<rect x="440" y="170" width="260" height="60" rx="10" fill="#f0fdf4" stroke="#16a34a" stroke-width="2"/>
<text x="570" y="195" text-anchor="middle" fill="#1e1b4b" font-weight="600">프롬프트 개선</text>
<text x="570" y="216" text-anchor="middle" fill="#64748b" font-size="13">시스템 프롬프트, few-shot 예시</text>
<line x1="380" y1="200" x2="438" y2="200" stroke="#64748b" stroke-width="2" marker-end="url(#d1-arrow)"/>
<text x="409" y="192" text-anchor="middle" fill="#16a34a" font-size="13">예</text>
<line x1="200" y1="225" x2="200" y2="263" stroke="#64748b" stroke-width="2" marker-end="url(#d1-arrow)"/>
<text x="215" y="250" fill="#64748b" font-size="13">아니요</text>
<rect x="20" y="265" width="360" height="50" rx="8" fill="#ffffff" stroke="#f97316" stroke-width="2"/>
<text x="200" y="295" text-anchor="middle" fill="#1e1b4b">고정된 형식, 어조, 기능이 필요한가?</text>
<rect x="440" y="260" width="260" height="60" rx="10" fill="#eef2ff" stroke="#6366f1" stroke-width="2"/>
<text x="570" y="285" text-anchor="middle" fill="#1e1b4b" font-weight="600">QLoRA로 파인튜닝</text>
<text x="570" y="306" text-anchor="middle" fill="#64748b" font-size="13">좋은 예시 수백 개</text>
<line x1="380" y1="290" x2="438" y2="290" stroke="#64748b" stroke-width="2" marker-end="url(#d1-arrow)"/>
<text x="409" y="282" text-anchor="middle" fill="#16a34a" font-size="13">예</text>
<line x1="200" y1="315" x2="200" y2="353" stroke="#64748b" stroke-width="2" marker-end="url(#d1-arrow)"/>
<text x="215" y="340" fill="#64748b" font-size="13">아니요</text>
<rect x="60" y="355" width="280" height="50" rx="10" fill="#f8fafc" stroke="#64748b" stroke-width="2"/>
<text x="200" y="385" text-anchor="middle" fill="#1e1b4b">더 큰 기본 모델 시도</text>
<text x="570" y="370" text-anchor="middle" fill="#64748b" font-size="13">RAG와 파인튜닝은 함께 쓰기 좋습니다.</text>
<text x="570" y="390" text-anchor="middle" fill="#64748b" font-size="13">동작은 튜닝으로, 사실은 검색으로</text>
</svg>
<figcaption>"모델이 우리 내용을 모른다"는 문제는 대부분 검색 문제입니다. 파인튜닝이 제값을 하는 것은 매번 같은 동작이 필요할 때입니다. JSON 스키마, 사내 문체, 분류 체계 같은 것입니다.</figcaption>
</figure>

파인튜닝할 만한 이유는 이렇습니다.

- **엄격한 출력 형식.** 모든 프롬프트에 한 페이지짜리 지시문을 넣지 않고도, 호출할 때마다 내 스키마대로 필드를 추출합니다.
- **문체와 어조.** 우리 팀처럼 들리는 고객 지원 답변이나, 정해진 구조의 보고서.
- **작은 모델이 하는 좁은 작업.** 튜닝한 8B 모델이 한 가지 작업에서는 큰 범용 모델을 대신할 수 있고, 싼 하드웨어로 서빙할 때 이 점이 중요합니다.
- **짧은 프롬프트.** 가중치에 학습된 동작은 요청마다 반복할 필요가 없습니다.

## LoRA와 QLoRA

전체 파인튜닝은 모든 가중치를 업데이트하므로, GPU는 모델 외에 모든 가중치의 그래디언트와 옵티마이저 상태까지 담아야 합니다. LoRA는 기본 모델을 고정하고 레이어 옆에 작은 저랭크 행렬을 붙여 학습합니다. 원 논문은 GPT-3 175B를 Adam으로 전체 파인튜닝할 때와 비교해 학습 파라미터가 10,000분의 1, GPU 메모리가 3분의 1로 줄었다고 보고했습니다.

QLoRA는 한 걸음 더 나갑니다. 고정된 기본 모델을 4비트 NF4 정밀도로 불러오고, 어댑터만 16비트로 학습합니다. Dettmers 외는 이 방법으로 "16비트 전체 파인튜닝의 작업 성능을 유지하면서" 48 GB GPU 한 장으로 65B 모델을 파인튜닝했습니다. 이 논문은 지금도 도구들이 쓰는 세 가지를 도입했습니다. NF4 데이터 타입, 양자화 상수를 한 번 더 양자화하는 이중 양자화, 그리고 메모리 급증을 흡수하는 페이지드 옵티마이저입니다.

어느 쪽이든 결과물은 어댑터, 즉 텐서 몇 개가 든 폴더이고, 바뀌지 않은 기본 모델 위에 적용합니다. 따로 두어도 되고 가중치에 병합해도 됩니다.

## 필요한 VRAM

Unsloth는 모델 크기별 파인튜닝 최소 VRAM 표를 공개합니다. 아래는 Unsloth의 메모리 최적화를 적용한 그 수치입니다. 일반 Hugging Face 학습은 더 많이 필요하고, 시퀀스가 길거나 배치가 크면 모든 행의 값이 올라갑니다.

| 모델 크기 | QLoRA (4비트) | LoRA (16비트) | QLoRA에 여유 있는 대여 카드 |
| --- | --- | --- | --- |
| 3B | 3.5 GB | 8 GB | 12 GB 이상 아무 카드 |
| 8B | 6 GB | 22 GB | RTX 3090 / 4090 (24 GB) |
| 14B | 8.5 GB | 33 GB | RTX 3090 / 4090 (24 GB) |
| 32B | 26 GB | 76 GB | 48 GB 카드 (RTX A6000, A40, L40S) |
| 70B | 41 GB | 164 GB | 80 GB 카드 (A100, H100) |

<figure>
<svg viewBox="0 0 720 320" role="img" aria-labelledby="d2-title" xmlns="http://www.w3.org/2000/svg" font-family="system-ui, sans-serif" font-size="15">
<title id="d2-title">8B, 14B, 32B, 70B 모델의 QLoRA와 16비트 LoRA 파인튜닝 최소 VRAM을 24, 48, 80 GB 카드와 비교한 막대 그래프</title>
<rect width="720" height="320" fill="#ffffff"/>
<rect x="200" y="12" width="14" height="14" fill="#6366f1"/>
<text x="220" y="24" fill="#1e1b4b" font-size="13">QLoRA 4비트</text>
<rect x="320" y="12" width="14" height="14" fill="#eef2ff" stroke="#6366f1" stroke-width="1.5"/>
<text x="340" y="24" fill="#1e1b4b" font-size="13">LoRA 16비트</text>
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
<text x="420" y="306" text-anchor="middle" fill="#64748b" font-size="13">최소 VRAM, GB 단위 (Unsloth 요구 사항 표)</text>
</svg>
<figcaption>대여한 소비자용 카드가 여기서 쓸모 있는 것은 QLoRA 덕분입니다. 14B까지는 24 GB 카드에 여유 있게 들어가고, 32B는 48 GB 카드, 70B는 80 GB 카드가 필요합니다. 4비트로 불러오지 않으면 8B도 24 GB에 겨우 들어갑니다.</figcaption>
</figure>

제 기본 선택은 RTX 4090에서 8B나 14B 모델입니다. 2,048토큰 시퀀스와 적당한 배치를 담을 여유가 있는 가장 싼 대여 카드이고, 이 범위의 모델은 나중에 서빙하기도 쉽습니다. 서빙할 VRAM을 기준으로 기본 모델을 고르려면 [내 GPU VRAM에 맞는 AI 모델](/ko/which-ai-models-fit-your-gpu-vram/)을 보세요.

## 도구 고르기: TRL, Unsloth, Axolotl

셋 다 오픈 소스이고, 모두 LoRA와 QLoRA를 지원합니다.

| 도구 | 사용 방식 | 장점 | 주의할 점 |
| --- | --- | --- | --- |
| Hugging Face TRL + PEFT | Python (`SFTTrainer`) | 기준 구현. 같은 API로 DPO, GRPO 등도 가능 | 같은 학습에서 Unsloth보다 메모리를 더 씀 |
| Unsloth | Python 또는 Unsloth Studio 웹 UI | 2배 빠르고 VRAM 70% 절감을 주장, GGUF로 바로 내보내기 | Studio UI는 AGPL-3.0 (코어는 Apache 2.0) |
| Axolotl | YAML 파일 하나, `axolotl train config.yml` | 멀티 GPU(FSDP, DeepSpeed), 다양한 레시피 | Python 3.11 이상, PyTorch 2.11 이상 필요 |

2026년 9월 기준 TRL은 1.14, PEFT는 0.21 버전입니다. Unsloth는 Python 3.11~3.13과 CUDA capability 7.0 이상의 NVIDIA GPU(V100, T4, RTX 20 시리즈 이상)가 필요합니다. Axolotl은 Python 3.12와 PyTorch 2.12.1을 권장합니다.

모든 줄을 이해하고 싶다면 TRL, VRAM이 빠듯하거나 호출 한 번으로 GGUF를 내보내고 싶다면 Unsloth, 설정을 바꿔 가며 학습을 반복하거나 여러 GPU로 옮길 계획이라면 Axolotl을 쓰세요. 아래 스크립트는 TRL을 씁니다. 움직이는 부품을 모두 보여 주는 가장 짧은 길이기 때문입니다.

## 데이터 준비

TRL의 `SFTTrainer`는 채팅 API 요청과 같은 형태의 대화를 읽습니다. `train.jsonl`에 한 줄에 JSON 객체 하나씩 적습니다.

```json
{"messages": [{"role": "system", "content": "Extract the invoice fields as JSON."}, {"role": "user", "content": "Invoice 4471 from Norden AB, due 12 March, total 1,250 EUR"}, {"role": "assistant", "content": "{\"invoice_id\": \"4471\", \"supplier\": \"Norden AB\", \"due\": \"2026-03-12\", \"total\": 1250, \"currency\": \"EUR\"}"}]}
```

실전 원칙은 이렇습니다.

- **양보다 질.** 일관되고 정확한 예시 수백~수천 개가 잡음 섞인 수만 개보다 낫습니다. 데이터의 실수 하나하나가 돈을 내고 가르치는 동작입니다.
- **실제 환경에 맞추기.** 애플리케이션이 실제로 보낼 시스템 프롬프트와 입력 형식을 쓰세요.
- **5~10%는 따로 떼어 두기.** 모델이 학습하지 않는 예시를 남겨 두고, 기본 모델과 튜닝한 모델을 나란히 비교하는 데 씁니다.
- **필요 없는 것은 지우기.** 이름, 이메일, 계좌 번호, ID는 모델이 형식을 배우는 데 거의 도움이 되지 않습니다. 데이터가 내 컴퓨터를 떠나기 전에 그럴듯한 자리 표시자로 바꾸세요.

마지막 원칙은 대여 머신만의 문제가 아닙니다. Carlini 외는 GPT-2에서 이름, 전화번호, 이메일 주소를 포함한 학습 시퀀스 수백 개를 원문 그대로 추출했고, 그중 일부는 학습 문서 단 하나에만 나온 것이었습니다. 파인튜닝한 모델은 학습한 내용을 나중에 그 모델을 쓰는 누구에게나 되풀이할 수 있습니다.

## 대여 머신에서 데이터를 비공개로 지키기

GPU 마켓플레이스에서는 컴퓨터의 주인이 따로 있습니다. Vast.ai는 이렇게 분명히 말합니다. "클라이언트는 비특권 Docker 컨테이너에 격리되며 자기 데이터에만 접근할 수 있다", 그리고 "제공자마다 보안 수준이 크게 다르다". 이 격리는 다른 대여자로부터 나를 보호합니다. 호스트에 물리적으로 접근할 수 있고 root 권한을 가진 사람으로부터는 보호하지 못합니다.

비공개 데이터라면 이렇게 하세요.

1. **검증된 데이터센터 호스트를 고르세요.** Vast.ai의 Secure Cloud 제공자는 "ISO 27001 인증과 Tier 3/4 데이터센터 기준을 갖춘 검증된 데이터센터"이고, Vast는 민감한 작업에 이를 권합니다. RunPod의 Secure Cloud는 T3/T4 데이터센터에서 운영되고, Community Cloud는 개인 제공자와 연결합니다. 데이터센터 등급은 시간당 더 비싸지만 이 경우에는 그만한 값을 합니다.
2. **정리한 데이터셋만 올리세요.** SSH(`rsync -avP`나 `scp`)로 올립니다. 중간에 공개 버킷이나 공유 링크에 올려 두지 마세요.
3. **로그는 로컬에 두세요.** TRL 1.14에서 `report_to`의 기본값은 `"none"`이라, 직접 켜지 않는 한 실험 추적 도구로 아무것도 나가지 않습니다. 비공개 데이터로 학습한 어댑터에 `push_to_hub`를 호출하지 마세요.
4. **결과물을 가져온 뒤 인스턴스를 삭제하세요.** 어댑터와 평가 결과를 내려받고, 토큰을 썼다면 Hugging Face에서 로그아웃하고(`hf auth logout`), 인스턴스와 볼륨을 삭제하세요. Vast.ai에서는 인스턴스를 정지만 해서는 안 되고 삭제해야 스토리지 과금과 보관이 끝납니다.

컨테이너 안에서 파일을 지운다고 호스트 디스크가 지워진다는 보장은 없습니다. 그래서 진짜 보호는 1단계와 2단계입니다. 하드웨어를 누가 가지고 있는지 고르고, 그쪽에 최대한 적게 보내는 것입니다. 자세한 내용은 [공용 GPU 노드에서 데이터셋 보호하기](/ko/how-to-secure-dataset-on-public-gpu-node/)에 있습니다. 정책상 외부 하드웨어를 아예 쓸 수 없다면, 같은 스크립트가 내 24 GB 카드에서도 돌아갑니다.

## 학습: TRL로 만든 QLoRA 스크립트

RTX 3090이나 4090이 달린 대여 Linux 머신에서 다음을 실행합니다.

```bash
python -m venv venv && source venv/bin/activate
pip install torch trl peft bitsandbytes datasets
```

그다음 TRL PEFT 문서의 QLoRA 패턴을 따른 `train.py`입니다. Qwen3-8B는 Apache 2.0이고 게이트가 없으므로 Hugging Face 토큰이 필요 없습니다.

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

중요한 선택은 이렇습니다.

- **`learning_rate=2e-4`.** TRL 문서는 QLoRA에 일반 파인튜닝 학습률의 약 10배를 권합니다. 학습 손실은 떨어지는데 평가 손실이 오르면 과적합입니다. 에폭을 줄이세요.
- **`r=16`, `target_modules="all-linear"`.** 모든 선형 레이어에 어댑터를 붙이는 구성으로, Unsloth 벤치마크가 쓰는 설정입니다. 형식과 문체에는 랭크 16이면 충분하고, 더 어려운 작업이라면 올리세요.
- **`max_length=2048`.** 더 긴 예시는 잘립니다. 데이터의 토큰 길이를 확인하세요. 한도를 늘리면 VRAM이 더 필요합니다.
- **유효 배치 16** (4 × 누적 4스텝). 메모리가 부족하면 `per_device_train_batch_size`를 낮추고 누적 스텝을 올려 곱을 유지하세요.

머신을 끄기 전에 떼어 둔 예시를 기본 모델과 튜닝한 모델에 넣어 비교하세요. 돈을 쓴 효과가 있었는지 알려 주는 테스트는 그것뿐입니다.

## 비용

학습 시간은 전체 토큰 수 ÷ 처리량입니다. 호스팅 업체 GigaGPU는 RTX 4090에서 Llama 3.1 8B를 QLoRA로 학습할 때 초당 약 3,500 학습 토큰을 측정해 공개했습니다. Qwen3-8B도 비슷한 속도라고 가정하면 다음과 같습니다.

**작은 학습:** 예시 2,000개 × 600토큰 × 3에폭 = 360만 토큰. 3,600,000 ÷ 3,500 = 1,029초, 약 17분.

| 단계 | 시간 |
| --- | --- |
| 환경 준비 | 10분 |
| Qwen3-8B 다운로드(가중치 16.4 GB), 데이터 업로드 | 10분 |
| 학습 | 17분 |
| 떼어 둔 데이터로 기본 모델과 튜닝 모델 비교 | 15분 |
| 병합, 내보내기, 다운로드, 인스턴스 삭제 | 15분 |
| **합계** | **67분 (1.12시간)** |

- Vast.ai RTX 4090 시간당 $0.31: 1.12 × $0.31 = **$0.35**
- RunPod RTX 4090 시간당 $0.74(가격 페이지 정가): 1.12 × $0.74 = **$0.83**

**큰 학습:** 예시 20,000개 × 1,000토큰 × 2에폭 = 4,000만 토큰 ÷ 3,500 = 11,429초, 약 3.2시간. 같은 부대 작업 50분을 더하면 4.0시간으로, Vast.ai에서 **$1.24**, RunPod에서 **$2.97**입니다.

32B 모델이라면 2026년 9월 기준 RunPod의 48 GB 카드는 시간당 $0.49(A40), $0.53(RTX A6000), $1.09(L40S)입니다. 이 카드들에서 32B QLoRA의 공개된 처리량은 찾지 못했으니, 긴 학습에 들어가기 전에 50스텝을 돌려 로그에서 스텝 시간을 읽고 같은 곱셈을 해 보세요.

가격은 2026년 9월 RunPod 가격 페이지와 Vast.ai에 대한 getdeploying.com 추적기의 수치입니다. Secure/데이터센터 등급은 가장 싼 커뮤니티 오퍼보다 비쌉니다. 전체적인 비교는 [GPU 대여 가격 비교](/ko/gpu-rental-pricing-comparison-2026/)에 있습니다.

## 결과물 서빙

방법은 두 가지입니다. 어댑터를 따로 두거나, 모델에 병합하는 것입니다.

**vLLM으로 따로 두기.** vLLM은 기본 모델 옆에 LoRA 어댑터를 불러오고, OpenAI 호환 서버에서 각 어댑터를 모델 이름 하나로 노출합니다.

```bash
vllm serve Qwen/Qwen3-8B --enable-lora --lora-modules invoices=./out/adapter
```

그러면 클라이언트는 `"model": "invoices"`를 보냅니다. GPU 하나에서 어댑터 여러 개가 기본 모델 하나를 공유할 수 있습니다.

**병합해서 Ollama로 돌리기.** 어댑터를 전체 정밀도 가중치에 병합하고, llama.cpp로 GGUF로 변환하고, 양자화한 뒤 가져옵니다.

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

Unsloth는 병합과 GGUF 내보내기를 호출 한 번으로 처리합니다(`model.save_pretrained_gguf("dir", tokenizer, quantization_method="q4_k_m")`). 문서에 따르면 내보낸 뒤 답변이 이상해지는 가장 흔한 원인은 잘못된 채팅 템플릿이니, 학습할 때 쓴 템플릿으로 서빙하세요. Ollama, vLLM, TGI 간의 장단점은 [RTX 4090 추론 벤치마크](/ko/ollama-vs-vllm-vs-tgi-rtx-4090-benchmark/)에 있습니다.

### GPUFlow는 어디에 맞는가

GPUFlow로는 학습할 수 없습니다. 제공자의 GPU에서 돌아가는 OpenAI 호환 API를 빌려주는 것이고, 셸, SSH, 파일 접근이 없습니다. 파인튜닝한 모델을 서빙할 수도 없습니다. 대여자는 모델을 올릴 수 없고, 제공되는 모델은 각 제공자가 (보통 Ollama로) 설치한 `qwen2.5:7b`나 `llama3.1:8b` 같은 것들입니다.

도움이 되는 곳은 이 모든 것의 앞 단계입니다. 몇 센트로, 기성 오픈 모델에 좋은 프롬프트만 주면 이미 일이 되는지 확인하는 것입니다. 결정 트리에서 가장 싼 결론입니다. 이때는 이 가이드에서 다루는 비공개 데이터가 아니라 테스트 데이터를 쓰세요. 대여가 진행되는 동안 프롬프트와 답변은 제공자의 머신을 평문으로 거칩니다. 사용 방법은 [API 빠른 시작](https://docs.gpuflow.app/ko/renters/api-quickstart/)에, 기존 도구에 연결하는 방법은 [앱에서 키 쓰는 법](/ko/use-openai-compatible-api-key-in-apps/)에 있습니다.

## 출처

모두 2026년 9월에 확인했습니다.

- 논문: [Hu 외, LoRA](https://arxiv.org/abs/2106.09685); [Dettmers 외, QLoRA](https://arxiv.org/abs/2305.14314); [Ovadia 외, Fine-Tuning or Retrieval?](https://arxiv.org/abs/2312.05934); [Carlini 외, Extracting Training Data from Large Language Models](https://arxiv.org/abs/2012.07805)
- Hugging Face TRL: [SFT Trainer](https://huggingface.co/docs/trl/sft_trainer), [PEFT 연동과 QLoRA](https://huggingface.co/docs/trl/peft_integration)
- Unsloth: [요구 사항과 VRAM 표](https://unsloth.ai/docs/get-started/fine-tuning-for-beginners/unsloth-requirements.md), [벤치마크](https://unsloth.ai/docs/basics/unsloth-benchmarks.md), [GGUF로 저장](https://unsloth.ai/docs/basics/inference-and-deployment/saving-to-gguf.md), [GitHub](https://github.com/unslothai/unsloth)
- [GitHub의 Axolotl](https://github.com/axolotl-ai-cloud/axolotl)
- 모델: [Qwen3-8B 모델 카드](https://huggingface.co/Qwen/Qwen3-8B)
- 학습 처리량: [GigaGPU, RTX 4090에서 파인튜닝하기](https://gigagpu.com/rtx-4090-fine-tuning-guide/)
- 호스트와 보안: [Vast.ai 보안 FAQ](https://docs.vast.ai/documentation/reference/faq/security), [Vast.ai 가격](https://docs.vast.ai/guides/instances/pricing.md), [RunPod 포드 개요](https://docs.runpod.io/pods/overview)
- 가격: [RunPod 가격](https://www.runpod.io/pricing), getdeploying.com의 [Vast.ai](https://getdeploying.com/vast-ai), [RTX 4090](https://getdeploying.com/reference/cloud-gpu/nvidia-rtx-4090)
- 서빙: [vLLM LoRA 어댑터](https://docs.vllm.ai/en/latest/features/lora.html), [llama.cpp quantize](https://github.com/ggml-org/llama.cpp/blob/master/tools/quantize/README.md), [Ollama 가져오기](https://docs.ollama.com/import)
- GPUFlow: [API 빠른 시작](https://docs.gpuflow.app/ko/renters/api-quickstart/)
