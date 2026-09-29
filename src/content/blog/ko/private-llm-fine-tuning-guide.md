---
title: "GPU 대여로 하는 프라이빗 LLM 파인튜닝 완벽 가이드"
description: "대여한 GPU에서 자체 데이터셋으로 오픈 웨이트 언어 모델을 파인튜닝하는 방법을 처음부터 끝까지 설명합니다. 데이터를 안전하게 지키고, 컴퓨팅 비용을 줄이고, 특정 업체에 종속되지 않는 방법입니다."
excerpt: "데이터 통제권을 유지하면서 대여 GPU로 오픈 웨이트 LLM을 파인튜닝하는 방법을 알아봅니다. 안전한 데이터 전송, QLoRA 학습, 작업 환경 정리까지 단계별로 설명합니다."
pubDate: 2025-02-23
updatedDate: 2026-09-29
locale: "ko"
category: "tutorials"
featured: false
draft: false
author: "GPUFlow Team"
heroImage: "../_images/secure-server-room-abstract.png"
heroImageAlt: "파란 조명 아래에서 AI 데이터를 처리하는 보안 서버실을 추상적으로 표현한 이미지"
faq:
  - question: "RTX 4090 한 장으로 대규모 언어 모델을 파인튜닝할 수 있나요?"
    answer: "가능합니다. QLoRA(Quantized Low-Rank Adaptation)를 사용하면 파라미터 8B까지의 모델이 24GB VRAM에 여유 있게 들어갑니다. 이 튜토리얼에서는 배치 크기, 시퀀스 길이, LoRA 랭크 값을 구체적으로 제시하며 소비자용 하드웨어에 맞게 학습 스크립트를 설정하는 방법을 보여 줍니다."
  - question: "대여한 GPU에 올린 데이터셋은 안전한가요?"
    answer: "데이터셋의 안전은 운영 방식에 달려 있습니다. 이 가이드에서는 SCP를 이용한 암호화 전송, S3나 Google Drive 같은 클라우드 스토리지를 거치지 않는 방법, 학습이 끝난 뒤 원격 머신을 정리하는 방법을 다룹니다. 머신은 다른 사람의 소유라는 점을 잊지 말고, 대여를 종료하기 전에 모든 것을 삭제해야 합니다."
  - question: "대여 GPU로 8B 모델을 파인튜닝하는 데 비용이 얼마나 드나요?"
    answer: "RTX 4090을 대여해 8B 파라미터 모델을 파인튜닝하면 데이터셋 크기와 학습 에폭 수에 따라 보통 3~8달러가 듭니다."
  - question: "학습용 GPU를 대여하려면 신원 인증이 필요한가요?"
    answer: "대개 필요하지 않습니다. Vast.ai나 RunPod 같은 마켓플레이스는 신분증이 아니라 이메일 주소와 선불 크레딧을 요구합니다. RunPod는 첫 암호화폐 결제 전에만 KYC를 요구합니다. AWS에서는 신규 계정의 GPU 할당량이 0으로 시작하므로 별도로 요청해야 합니다."
  - question: "학습 스크립트는 어떤 데이터셋 형식을 사용하나요?"
    answer: "각 줄에 text 필드가 있는 JSON 객체가 들어 있는 JSONL 파일을 사용합니다. text 필드에는 지시문, 입력, 응답을 줄바꿈 문자로 구분해 하나의 문자열로 담아야 합니다. 올바른 형식의 예시는 이 가이드의 4단계에 있습니다."
  - question: "Llama 외의 모델에도 이 튜토리얼을 적용할 수 있나요?"
    answer: "적용할 수 있습니다. 이 워크플로는 Mistral, Qwen, Falcon 등 모든 오픈 웨이트 모델에 똑같이 적용됩니다. 예제 코드는 Llama-3.1-8B를 사용하지만, 다른 기본 모델을 파인튜닝하려면 모델 식별자만 바꾸면 됩니다."
  - question: "8B 파라미터 모델 파인튜닝에는 시간이 얼마나 걸리나요?"
    answer: "학습 시간은 데이터셋 크기에 따라 달라집니다. 예제 1,000개로 학습하면 RTX 4090에서 보통 30~60분 안에 끝납니다. 데이터셋이 커지면 시간도 거의 비례해서 늘어나, 예제 10,000개라면 5~10시간이 필요합니다."
  - question: "학습이 끝난 뒤 원격 머신은 어떻게 처리해야 하나요?"
    answer: "데이터셋, 학습 코드, Hugging Face 캐시, bash 기록을 삭제해 환경을 정리해야 합니다. 이 가이드에서는 대여 계약을 종료하기 전에 실행할 삭제 명령어를 구체적으로 제시하며, 파일을 확실히 없애기 위해 shred를 사용하는 방법도 함께 설명합니다."
---

지금 이 글을 읽고 계신다면, OpenAI에 업로드할 수 없거나 업로드하고 싶지 않은 데이터셋을 갖고 계실 가능성이 높습니다.

그런 분은 적지 않습니다. 많은 기업과 개인 개발자에게 데이터 유출 위험은 ChatGPT의 편리함과 맞바꿀 수 없는 문제입니다. HIPAA 규제를 받는 의료 기록이든, 수년간의 엔지니어링 투자가 담긴 사내 코드베이스든, 시장을 움직일 수 있는 민감한 금융 모델이든, 클라우드 AI를 쓴다는 것은 가장 소중한 지식 자산을 제3자에게 맡긴다는 뜻인 경우가 많습니다.

그 제3자가 고객 데이터를 차기 모델 학습에 사용해 온 이력이 있는 거대 기술 기업이라면, '신뢰'라는 말은 편하게 쓰기 어려워집니다.

해결책은 AI를 포기하는 것이 아닙니다. 인프라를 직접 소유하는 것입니다.

직접 통제하는 하드웨어에서 오픈 웨이트 모델을 파인튜닝하는 일은 더 이상 일부 연구자만의 관심사가 아닙니다. 프라이버시를 중시하는 조직에는 업무상 필수 요건입니다. Llama, Mistral, Qwen을 비롯한 수십 개의 모델을 API 요금도, 데이터 공유 의무도 없이 상업적으로 사용할 수 있습니다. 문제는 늘 컴퓨팅 자원을 구하는 일이었습니다. NVIDIA H100 클러스터를 구매하려면 수백만 달러의 설비 투자가 필요합니다. AWS에서 빌리려면 신원 인증과 기업 계약이 필요하고, 시간당 요금 때문에 장시간 학습은 감당하기 어려울 만큼 비싸집니다.

이 가이드는 세 번째 방법을 소개합니다. 마켓플레이스에서 GPU를 대여해 오픈 웨이트 언어 모델을 파인튜닝하는 방법으로, 이런 GPU는 전 세계 개인이 소유한 하드웨어인 경우가 많습니다. 환경 설정, 공용 노드에서 작업할 때의 보안 수칙, 학습 실행 전 과정을 다룹니다.

예제 코드는 구체적인 참고 사례로 Llama-3.1-8B를 사용하지만, 워크플로는 Hugging Face와 호환되는 모든 모델에 똑같이 적용됩니다. 모델 식별자만 바꾸면 Mistral-7B, Qwen2-7B 등 용도에 맞는 어떤 오픈 웨이트 모델이든 파인튜닝할 수 있습니다.

장기 계약 없이, 기존 클라우드 제공업체 요금의 극히 일부만으로 이 모든 작업을 할 수 있습니다.

![원격 GPU 서버에 SSH로 접속한 터미널 창](../_images/terminal-ssh-connection.png)

## 프라이빗 파인튜닝의 경제성

기술적인 구현을 살펴보기 전에 비용 측면부터 정리하겠습니다.

AWS에서 모델을 학습하려면 대형 인스턴스와 할당량 요청이 필요합니다. p4d.24xlarge 인스턴스(A100 GPU 8장)는 시간당 32.77달러이고, 신규 AWS 계정의 GPU 할당량은 0에서 시작합니다.

GPU 마켓플레이스에서는 하드웨어 소유자에게서 컴퓨팅 자원을 직접 빌립니다. 그 차이는 상당합니다.

**비용 절감:** 마켓플레이스에서 RTX 4090의 대여료는 시간당 약 0.30~0.46달러입니다(2026년 9월 기준). QLoRA로 8B 파라미터 모델을 학습하면 24GB VRAM을 갖춘 4090 한 장으로 데이터셋 크기에 따라 2~6시간이면 파인튜닝이 끝납니다. 총 컴퓨팅 비용은 3~8달러입니다.

**데이터는 한 대의 머신에만 머뭅니다:** 데이터셋을 SSH로 대여 머신에 바로 복사하고, 학습하고, 결과물을 내려받은 뒤 모두 삭제합니다. 스토리지 버킷도, 세 번째 사본도 없습니다.

**승인 절차가 없습니다:** 클라우드 제공업체 기업 영업팀의 승인이나 할당량 증설을 기다릴 필요가 없습니다. 선불 크레딧을 충전하고 하드웨어를 대여하면 됩니다.

비교하자면, AWS에서 A10G 한 장(24GB VRAM을 갖춘 가장 저렴한 옵션인 g5.xlarge)은 us-east-1 리전에서 시간당 약 1.01달러입니다. 할당량 요청, 설정 시간, 환경을 구성하는 동안 놀고 있는 컴퓨팅 자원까지 고려하면 첫 학습의 실제 비용은 마켓플레이스에서 드는 몇 달러보다 훨씬 높아집니다.

이러한 비용 구조는 [GPU 대여 가격 비교](/ko/gpu-rental-pricing-comparison-2026/)와 [GPU 대여의 실제 비용](/ko/hidden-fees-in-gpu-rental/)에서 자세히 다룹니다.

## 사전 준비 사항

이 튜토리얼은 Linux 명령줄에 익숙하다는 전제로 진행합니다. 머신러닝 학위가 필요하지는 않지만, 파일 시스템을 탐색하고 텍스트 파일을 편집하고 오류 메시지를 해석할 수 있어야 합니다.

**하드웨어 요구 사항:**

- **GPU:** 최소 24GB VRAM. RTX 3090, RTX 4090, A10G 모두 해당합니다. 70B 파라미터 모델에는 48GB 이상(A6000, A100 2장 또는 H100)이 필요합니다.
- **시스템 RAM:** 32GB 이상. 모델을 불러올 때 가중치를 먼저 시스템 메모리에 올린 뒤 GPU로 옮기기 때문입니다.
- **스토리지:** NVMe SSD 100GB 이상. Llama-3 8B 기본 가중치만 약 16GB를 차지합니다. 데이터셋, 체크포인트, 출력 어댑터가 여기에 더해집니다.

**모델 선택에 관하여:** 이 튜토리얼에서 Meta의 Llama-3.1-8B를 예제로 쓰는 이유는 QLoRA 양자화를 적용했을 때 24GB GPU 한 장에 들어가는 가장 큰 급의 모델이기 때문입니다. Llama 제품군에는 이제 Llama 4 Scout와 Maverick도 있지만, 이들은 전체 파라미터가 각각 109B와 400B인 Mixture of Experts 아키텍처를 사용해 멀티 GPU 구성이 필요하므로 단일 노드 대여의 범위를 벗어납니다. 여기서 설명하는 워크플로는 Mistral-7B, Qwen2-7B, Gemma-2-9B를 비롯해 대여한 하드웨어의 VRAM에 들어가는 모든 Hugging Face 호환 모델에 똑같이 적용됩니다.

**소프트웨어 요구 사항:**

- Python 3.10 이상
- PyTorch 기본 사용 능력
- Hugging Face 계정(라이선스 동의가 필요한 Llama 같은 게이트 모델을 내려받는 데 필요)
- SSH 접속이 가능한 머신 전체를 대여하는 GPU 마켓플레이스(Vast.ai, RunPod, TensorDock 등)의 선불 크레딧이 충전된 계정

어디를 골라야 할지 모르겠다면 [GPU를 대여하려면 무엇이 필요한가](/ko/what-you-need-to-rent-a-gpu/)와 [GPUFlow vs Vast.ai vs RunPod vs SaladCloud](/ko/gpuflow-vs-vast-ai-vs-runpod/)를 참고하세요. GPUFlow 자체는 이 튜토리얼에 적합하지 않습니다. GPUFlow는 로그인할 수 있는 머신이 아니라 API를 통한 AI 모델 이용권을 대여하는 서비스입니다.

## 1단계: 컴퓨팅 노드 확보

첫 단계는 하드웨어를 확보하는 것입니다. 대형 클라우드 플랫폼에서는 계정을 만들고, GPU 할당량을 요청하고, 승인을 기다려야 합니다. 마켓플레이스에서는 훨씬 간단합니다.

원하는 마켓플레이스에 접속해 크레딧을 충전합니다. 화면에 사용 가능한 머신이 사양, 시간당 요금, 신뢰도 점수와 함께 표시됩니다.

다음 조건으로 머신을 필터링합니다.

- **GPU:** RTX 4090(24GB VRAM) 또는 RTX 6000 Ada(48GB VRAM)
- **RAM:** 최소 32GB
- **스토리지:** 100GB 이상 여유 공간
- **신뢰도:** 가동률 점수 95% 이상

머신을 선택하고 대여를 시작합니다. CUDA와 PyTorch가 이미 설치된 이미지를 고르세요. 설정 시간이 줄어들고, 설정 시간도 요금이 청구되기 때문입니다.

**공용 노드 보안 고려 사항:**

원격 네트워크에서 머신을 대여한다는 것은 낯선 사람이 소유하고 물리적으로 관리하는 하드웨어에 접속한다는 뜻입니다. 가상화 계층이 상당한 수준의 격리를 제공하지만, 적절히 주의하며 작업해야 합니다.

1. **원격 머신에 개인 키를 저장하지 마세요.** 다른 시스템용 SSH 키, 클라우드 자격 증명, 프로덕션 서비스의 API 토큰은 대여 노드에 절대 있어서는 안 됩니다.

2. **파일 시스템을 적대적인 환경으로 간주하세요.** 디스크에 쓴 모든 것은 접속을 끊은 뒤 호스트가 이론적으로 복구할 수 있다고 가정해야 합니다. 안전한 삭제 절차는 6단계에서 다룹니다.

3. **전송 중에는 민감한 데이터를 암호화하세요.** 3단계에서 다룹니다.

4. **비밀번호를 재사용하지 마세요.** 대여 화면에서 기본 자격 증명을 제공한다면 즉시 변경하거나 새 SSH 키 쌍을 생성하세요.

대여가 확정되면 대시보드에 접속 정보가 표시됩니다. 다음과 비슷한 SSH 명령어를 받게 됩니다.

```bash
ssh -p 22345 user@203.0.113.42
```

로컬 터미널을 열고 이 명령어를 실행합니다. 호스트 키 지문을 확인하라는 메시지가 나오면 수락합니다. 이제 대여한 GPU 노드에 접속되었습니다.

하드웨어가 주문한 사양과 일치하는지 확인합니다.

```bash
nvidia-smi
```

출력에는 대여한 GPU, 메모리 용량, 설치된 드라이버 버전이 표시되어야 합니다. GPU가 보이지 않거나 사양이 주문과 다르다면 즉시 접속을 끊고 마켓플레이스 고객 지원을 통해 문제를 신고하세요.

## 2단계: 환경 구성

SSH 접속을 확인했다면 다음은 깨끗한 Python 환경을 구성할 차례입니다. 대부분의 대여 노드에는 NVIDIA 드라이버와 CUDA 툴킷이 미리 설치되어 있지만, 호스트의 시스템 Python 패키지에 의존하면 의존성 충돌이 생겨 디버깅에 몇 시간을 허비하게 됩니다.

재현성과 안정성을 위해 격리된 가상 환경을 만듭니다.

다음 명령어로 작업 공간을 만듭니다.

```bash
mkdir ~/llama3-finetune
cd ~/llama3-finetune
python3 -m venv venv
source venv/bin/activate
```

이제 터미널 프롬프트에 가상 환경이 활성화되었음을 뜻하는 `(venv)`가 표시되어야 합니다. 이후 설치하는 패키지는 모두 이 디렉터리 안에만 설치되며 호스트 시스템은 건드리지 않습니다.

Python 패키지를 설치하기 전에 CUDA 툴킷에 접근할 수 있는지 확인합니다.

```bash
nvcc --version
```

CUDA 버전 번호를 기록해 두세요. PyTorch와의 호환성을 맞추는 데 필요합니다. 대부분의 대여 노드는 CUDA 11.8 또는 12.1을 사용합니다. `nvcc`를 찾을 수 없다면 CUDA 툴킷이 PATH에 없는 것일 수 있습니다. 보통 해당 환경 파일을 source로 불러오면 해결됩니다.

```bash
source /etc/profile.d/cuda.sh
```

이 파일이 없다면 해당 노드 구성에 관한 마켓플레이스 문서를 참고하세요.

이제 PyTorch 생태계를 설치합니다. 다음 명령어는 CUDA 12.1을 지원하는 PyTorch를 설치합니다. 노드의 CUDA 버전이 다르다면 버전 접미사를 맞게 바꾸세요.

```bash
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121
```

다음으로 효율적인 파인튜닝에 필요한 라이브러리를 설치합니다. Hugging Face 생태계와 함께 양자화를 위한 bitsandbytes, 파라미터 효율적 학습을 위한 PEFT를 사용합니다.

```bash
pip install transformers==4.40.0 datasets==2.19.0 peft==0.10.0 bitsandbytes==0.43.1 trl==0.8.6 accelerate==0.29.0
```

**버전 고정이 중요합니다.** 위 버전은 이 글을 쓰는 시점에 테스트를 거쳐 서로 호환되는 버전입니다. Hugging Face 생태계는 빠르게 바뀌며, 버전을 고정하지 않고 설치하면 호환성을 깨는 변경이 자주 들어옵니다. import 오류나 예상치 못한 동작이 발생한다면 버전 불일치가 가장 유력한 원인입니다.

마지막으로 Hugging Face 인증을 합니다. Llama-3 가중치는 라이선스 동의를 거쳐야 받을 수 있으며, 이를 위해 Hugging Face 계정이 필요합니다. [Meta Llama-3 저장소](https://huggingface.co)로 이동해 라이선스 조건에 동의합니다. 그런 다음 Hugging Face 설정 페이지에서 액세스 토큰을 생성합니다.

인증 명령어를 실행합니다.

```bash
huggingface-cli login
```

메시지가 나오면 액세스 토큰을 붙여 넣습니다. 토큰은 `~/.cache/huggingface/token`에 저장됩니다. 이제 게이트 모델의 가중치를 대여 노드로 직접 내려받을 권한이 생겼습니다.

![Llama-3 모델 설정 파라미터가 담긴 Python 코드를 표시한 터미널](../_images/python-llama3-config.png)

## 3단계: 안전한 데이터 전송

이 단계는 API를 호출하는 대신 머신을 대여하는 가장 큰 이유, 즉 데이터 주권과 직결됩니다.

일반적인 클라우드 워크플로에서는 데이터셋을 S3, Google Cloud Storage, Azure Blob 같은 스토리지 버킷에 업로드한 다음 컴퓨팅 인스턴스로 내려받습니다. 이렇게 하면 직접 통제할 수 없는 여러 시스템에 민감한 데이터의 사본이 여러 개 생깁니다. 스토리지 제공업체도, 컴퓨팅 제공업체도 데이터에 접근할 수 있습니다. 두 곳 모두 사용 기록을 로그로 남깁니다.

여기서는 암호화된 직접 전송으로 이 과정을 아예 건너뜁니다.

SSH 프로토콜에는 `scp`(Secure Copy Protocol)가 포함되어 있어, 터미널 접속에 쓰는 것과 같은 암호화 채널로 파일을 전송합니다. 데이터는 중간 스토리지를 전혀 거치지 않고 로컬 머신에서 대여 노드로 바로 이동합니다.

**로컬 컴퓨터**에서 **새 터미널 창**을 엽니다. 대여 노드에 연결된 기존 SSH 세션은 닫지 마세요. 파일 경로와 접속 정보를 실제 값으로 바꿔 다음 명령어를 실행합니다.

```bash
scp -P 22345 /path/to/your/dataset.jsonl user@203.0.113.42:~/llama3-finetune/
```

`-P` 플래그는 포트 번호를 지정합니다(ssh의 소문자 `-p`와 달리 대문자 P입니다). 데이터셋이 크면 전송에 몇 분이 걸릴 수 있습니다. 전송된 바이트 수를 보여 주는 진행 상황이 출력됩니다.

**데이터셋이 1GB를 넘는다면** 전송 전에 압축하는 것을 고려하세요.

```bash
# On your local machine
gzip -k dataset.jsonl
scp -P 22345 dataset.jsonl.gz user@203.0.113.42:~/llama3-finetune/

# Then on the remote node
cd ~/llama3-finetune
gunzip dataset.jsonl.gz
```

**추가 보안 조치:**

위협 모델에 고도화된 공격자가 포함된다면 전송 전에 GPG나 age로 데이터셋을 암호화할 수 있습니다. 이렇게 하면 방어가 한 겹 더 생깁니다. 만에 하나 전송이 가로채이더라도 내용은 읽을 수 없습니다.

```bash
# On your local machine (using age encryption)
age -p dataset.jsonl > dataset.jsonl.age
scp -P 22345 dataset.jsonl.age user@203.0.113.42:~/llama3-finetune/

# On the remote node
age -d dataset.jsonl.age > dataset.jsonl
rm dataset.jsonl.age
```

대부분의 사용자에게는 일반 SCP 전송만으로도 충분한 보호가 됩니다. SSH 프로토콜은 AES-256 암호화를 사용합니다. 중간자 공격은 호스트 키 검증으로 막습니다. 데이터는 제3자 스토리지 시스템을 전혀 거치지 않습니다.

## 4단계: 파인튜닝 스크립트

지도 파인튜닝에는 TRL(Transformer Reinforcement Learning) 라이브러리의 `SFTTrainer` 클래스를 사용합니다. 이 라이브러리는 복잡한 부분을 상당 부분 감춰 주면서도 프로덕션 워크로드에 맞게 세부 설정을 할 수 있습니다.

학습 스크립트를 작성하기 전에 스크립트가 기대하는 데이터셋 형식을 알아야 합니다.

**데이터셋 형식 요구 사항:**

스크립트는 각 줄에 `text` 필드가 있는 유효한 JSON 객체가 들어 있는 JSONL(JSON Lines) 파일을 사용합니다. `text` 필드에는 학습 예제 전체를 하나의 문자열로 담아야 합니다.

올바른 형식의 세 줄 예시는 다음과 같습니다.

```json
{"text": "### Instruction: Summarize the following legal clause in plain English.\n\n### Input: Party A shall indemnify, defend, and hold harmless Party B from any claims, damages, or expenses arising from Party A's negligence or willful misconduct.\n\n### Response: Party A agrees to protect Party B from any legal claims or costs that result from Party A's mistakes or intentional wrongdoing."}
{"text": "### Instruction: Extract the key financial metrics from this earnings report.\n\n### Input: Q3 revenue reached $4.2B, up 12% YoY. Operating margin improved to 23.5% from 21.2%. Free cash flow was $890M.\n\n### Response: Revenue: $4.2 billion (12% year-over-year growth). Operating margin: 23.5% (up from 21.2%). Free cash flow: $890 million."}
{"text": "### Instruction: Identify potential HIPAA violations in this process description.\n\n### Input: Patient records are emailed to the billing department as PDF attachments. The billing staff prints these for manual review and shreds them after processing.\n\n### Response: Potential violations include: unencrypted email transmission of PHI, physical documents that may be visible to unauthorized personnel during processing, and lack of documented chain of custody. Recommend encrypted file transfer and on-screen review only."}
```

**형식에 관한 중요 사항:**

1. 각 JSON 객체는 정확히 한 줄을 차지해야 합니다. 여러 줄에 걸친 JSON은 허용되지 않습니다.
2. `text` 필드 안의 줄바꿈은 `\n`으로 이스케이프해야 합니다.
3. 텍스트 안의 큰따옴표는 `\"`로 이스케이프해야 합니다.
4. 파일은 UTF-8 인코딩이어야 합니다.

원본 데이터가 다른 형식(CSV, Parquet, 지시문과 응답이 별도 열로 나뉜 형식 등)이라면 전송 전에 이 구조로 전처리해야 합니다. Python의 `json` 라이브러리가 이스케이프를 자동으로 처리합니다.

```python
import json

with open('dataset.jsonl', 'w') as f:
    for example in your_data:
        text = f"### Instruction: {example['instruction']}\n\n### Input: {example['input']}\n\n### Response: {example['output']}"
        f.write(json.dumps({"text": text}) + '\n')
```

데이터셋이 준비되었다면 원격 노드에서 학습 스크립트를 만듭니다.

```bash
cd ~/llama3-finetune
nano train.py
```

다음 설정을 붙여 넣습니다. 이 스크립트는 QLoRA를 사용해 24GB GPU의 메모리 한도 안에서 8B 파라미터 모델을 파인튜닝합니다. 예제는 Llama-3.1-8B를 사용하지만, MODEL_NAME 변수를 바꾸면 호환되는 다른 모델로 대체할 수 있습니다.

```python
import torch
from datasets import load_dataset
from transformers import (
    AutoModelForCausalLM,
    AutoTokenizer,
    BitsAndBytesConfig,
    TrainingArguments,
)
from peft import LoraConfig
from trl import SFTTrainer

# ============================================
# CONFIGURATION - Modify these values as needed
# ============================================

# Base model identifier on Hugging Face
# Change this to fine-tune a different model (e.g., "mistralai/Mistral-7B-v0.1")
MODEL_NAME = "meta-llama/Llama-3.1-8B"

# Name for your fine-tuned adapter
OUTPUT_NAME = "llama-3-8b-custom"

# Path to your dataset
DATASET_PATH = "dataset.jsonl"

# Training hyperparameters
NUM_EPOCHS = 1
BATCH_SIZE = 4
LEARNING_RATE = 2e-4
MAX_SEQ_LENGTH = 512

# LoRA hyperparameters
LORA_RANK = 16
LORA_ALPHA = 16
LORA_DROPOUT = 0.05

# ============================================
# QUANTIZATION CONFIGURATION
# ============================================

bnb_config = BitsAndBytesConfig(
    load_in_4bit=True,
    bnb_4bit_quant_type="nf4",
    bnb_4bit_compute_dtype=torch.float16,
    bnb_4bit_use_double_quant=True,
)

# ============================================
# MODEL LOADING
# ============================================

print("Loading base model...")
model = AutoModelForCausalLM.from_pretrained(
    MODEL_NAME,
    quantization_config=bnb_config,
    device_map="auto",
    trust_remote_code=True,
)
model.config.use_cache = False

print("Loading tokenizer...")
tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME, trust_remote_code=True)
tokenizer.pad_token = tokenizer.eos_token
tokenizer.padding_side = "right"

# ============================================
# DATASET LOADING
# ============================================

print(f"Loading dataset from {DATASET_PATH}...")
dataset = load_dataset("json", data_files=DATASET_PATH, split="train")
print(f"Dataset contains {len(dataset)} examples")

# ============================================
# LORA CONFIGURATION
# ============================================

peft_config = LoraConfig(
    r=LORA_RANK,
    lora_alpha=LORA_ALPHA,
    lora_dropout=LORA_DROPOUT,
    bias="none",
    task_type="CAUSAL_LM",
    target_modules=["q_proj", "k_proj", "v_proj", "o_proj"],
)

# ============================================
# TRAINING ARGUMENTS
# ============================================

training_args = TrainingArguments(
    output_dir="./results",
    num_train_epochs=NUM_EPOCHS,
    per_device_train_batch_size=BATCH_SIZE,
    gradient_accumulation_steps=1,
    learning_rate=LEARNING_RATE,
    weight_decay=0.001,
    fp16=True,
    logging_steps=10,
    save_steps=100,
    save_total_limit=3,
    optim="paged_adamw_32bit",
    lr_scheduler_type="cosine",
    warmup_ratio=0.03,
    report_to="none",
)

# ============================================
# TRAINER INITIALIZATION AND EXECUTION
# ============================================

print("Initializing trainer...")
trainer = SFTTrainer(
    model=model,
    train_dataset=dataset,
    peft_config=peft_config,
    dataset_text_field="text",
    max_seq_length=MAX_SEQ_LENGTH,
    tokenizer=tokenizer,
    args=training_args,
)

print("Starting training...")
trainer.train()

print(f"Saving adapter to {OUTPUT_NAME}...")
trainer.model.save_pretrained(OUTPUT_NAME)
tokenizer.save_pretrained(OUTPUT_NAME)

print("Training complete.")
```

`Ctrl+O`로 파일을 저장한 뒤 `Ctrl+X`로 편집기를 종료합니다.

**주요 파라미터 이해하기:**

- **LORA_RANK (r=16):** 파인튜닝된 어댑터의 표현력을 결정합니다. 값이 클수록 더 많이 학습하지만 메모리를 더 많이 사용합니다. 보통 8에서 64 사이의 값을 씁니다.

- **LORA_ALPHA (16):** LoRA 가중치의 스케일링 계수입니다. 흔히 랭크와 같은 값으로 설정합니다.

- **MAX_SEQ_LENGTH (512):** 학습 예제의 최대 토큰 길이입니다. 시퀀스가 길수록 메모리를 더 많이 사용합니다. OOM 오류가 발생하면 이 값부터 줄이세요.

- **BATCH_SIZE (4):** 한 번에 처리하는 예제 수입니다. 메모리가 부족하면 2나 1로 줄이세요.

- **target_modules:** LoRA 어댑터를 삽입할 레이어입니다. Llama-3에서는 어텐션 프로젝션 레이어(q, k, v, o)가 가장 좋은 결과를 냅니다.

학습을 시작하려면 다음을 실행합니다.

```bash
python train.py
```

스크립트는 먼저 기본 모델 가중치를 내려받습니다(8B 모델 기준 약 16GB). 다운로드는 처음 한 번만 하며, 이후 실행에서는 캐시된 가중치를 사용합니다. 로딩이 끝나면 10스텝마다 손실 값이 출력되며 학습 진행 상황을 확인할 수 있습니다.

## 5단계: 학습 모니터링

학습 스크립트가 실행되는 동안 GPU 상태를 지켜봐야 합니다. VRAM이 가득 차거나 온도가 안전 범위를 넘으면 프로세스가 중단되어 체크포인트가 손상되고 대여 시간을 낭비할 수 있습니다.

로컬 머신에서 두 번째 터미널 창을 열고 대여 노드에 SSH로 한 번 더 접속합니다.

```bash
ssh -p 22345 user@203.0.113.42
```

다음 명령어로 GPU 통계를 실시간으로 확인합니다.

```bash
watch -n 1 nvidia-smi
```

![GPU 메모리 사용량과 온도 통계가 담긴 nvidia-smi 출력을 표시한 터미널](../_images/nvidia-smi-monitoring.png)

이 도구는 1초마다 화면을 새로 고치며 메모리 사용량, GPU 사용률, 온도를 보여 줍니다. 이 가이드의 설정으로 RTX 4090에서 학습하면 다음과 같은 수치가 나와야 합니다.

- **메모리 사용량:** 전체 24GB 중 18~22GB
- **GPU 사용률:** 학습 스텝 진행 중 90~100%
- **온도:** 호스트의 냉각 방식에 따라 60~80°C

**자주 발생하는 문제 해결:**

**메모리가 24GB에 근접하는 경우:** 메모리 사용량이 계속 한계에 닿는다면 학습 스크립트의 `BATCH_SIZE` 파라미터를 2나 1로 줄이세요. 또는 `MAX_SEQ_LENGTH`를 256으로 줄이는 방법도 있습니다. 어느 쪽이든 학습을 다시 시작해야 합니다.

**GPU 사용률이 0%에 가까운 경우:** 대개 데이터 로딩 병목을 뜻합니다. CPU가 GPU에 예제를 충분히 빠르게 공급하지 못하는 상태입니다. NVMe를 갖춘 노드에서는 드물지만, 데이터셋이 매우 크면 발생할 수 있습니다. 전송 전에 데이터셋을 더 효율적인 형식(Arrow/Parquet)으로 전처리하는 것을 고려하세요.

**온도가 85°C를 넘는 경우:** 일부 호스트는 통풍이 잘 안 되는 케이스에서 GPU를 운영합니다. 고온이 계속되면 서멀 스로틀링이 걸려 학습이 느려질 수 있습니다. 온도가 계속 85°C를 넘는다면 대여를 종료하고 다른 노드를 선택하는 것을 고려하세요. 하드웨어 손상은 호스트의 문제지만, 잃어버린 시간과 손상된 체크포인트는 여러분의 손해입니다.

**손실 곡선 해석하기:**

학습 스크립트는 10스텝마다 손실 값을 출력합니다. 이 숫자는 모델의 예측이 얼마나 '틀렸는지'를 나타내며, 낮을수록 좋습니다. 다음과 같은 흐름이 나타나야 합니다.

- **초기 손실:** 데이터셋에 따라 보통 1.5~3.0
- **추세:** 처음 수백 스텝 동안 꾸준히 감소
- **최종 손실:** 설정이 잘된 학습이라면 보통 0.5~1.5

손실이 처음부터 정체된다면(100스텝이 지나도 줄지 않는다면) 학습률이 너무 낮을 수 있습니다. 손실이 크게 요동치거나 증가한다면 학습률이 너무 높은 것입니다. 기본값 `2e-4`는 대부분의 데이터셋에 잘 맞지만, 조정이 필요할 수도 있습니다.

손실이 순조롭게 줄다가 갑자기 매우 높은 값(10 이상)으로 치솟는다면 데이터셋에 형식이 잘못된 예제가 있을 가능성이 높습니다. 학습을 멈추고 JSONL 파일에서 인코딩 오류나 잘못 이스케이프된 문자가 있는지 확인한 뒤 다시 시작하세요.

예제 1,000개로 파인튜닝하면 RTX 4090에서 보통 30~60분 안에 끝납니다. 데이터셋이 커지면 시간도 거의 비례해서 늘어나, 예제 10,000개라면 5~10시간이 필요합니다.

## 6단계: 모델 회수와 환경 정리

학습이 끝나면 파인튜닝된 가중치가 `OUTPUT_NAME`으로 지정한 디렉터리에 LoRA 어댑터 형태로 저장됩니다. 이 어댑터는 16GB에 달하는 기본 모델 전체와 비교하면 보통 100~500MB로 작습니다.

먼저 어댑터 파일이 있는지 확인합니다.

```bash
ls -la ~/llama3-finetune/llama-3-8b-custom/
```

`adapter_config.json`, `adapter_model.safetensors`와 토크나이저 파일들이 보여야 합니다.

**대여 노드에서 어댑터를 병합하지 마세요.** 병합은 LoRA 가중치를 기본 모델과 합쳐 독립적인 파인튜닝 모델을 만드는 작업입니다. 이 작업은 16비트 기본 모델 전체를 메모리에 올려야 하므로 24GB 카드의 VRAM을 넘을 수 있습니다. 병합은 자체 인프라에서 하거나, 추론할 때 기본 모델과 어댑터를 함께 불러오면 됩니다. PEFT 라이브러리가 이를 매끄럽게 처리합니다.

```python
from peft import PeftModel
from transformers import AutoModelForCausalLM

base_model = AutoModelForCausalLM.from_pretrained(
    "meta-llama/Llama-3.1-8B",
    device_map="auto",
)
model = PeftModel.from_pretrained(base_model, "./llama-3-8b-custom")
```

어댑터를 내려받으려면 SSH 세션이 아닌 **로컬 터미널**로 돌아가 다음을 실행합니다.

```bash
scp -r -P 22345 user@203.0.113.42:~/llama3-finetune/llama-3-8b-custom ./
```

`-r` 플래그는 디렉터리 전체를 재귀적으로 복사합니다. 로컬 파일 크기가 원격 파일 크기와 같은지 확인해 전송이 제대로 끝났는지 점검하세요.

**원격 환경 정리하기:**

이 단계가 전문가와 아마추어를 가릅니다. 지금 대여 노드에는 사내 데이터셋, 학습 코드, 캐시된 모델 가중치가 남아 있습니다. 통제할 수 없는 머신에 이런 자료를 남겨 두는 것은 기본적인 운영 보안 원칙에 어긋납니다.

대여 노드의 SSH 세션으로 돌아가 다음 명령어를 실행합니다.

```bash
# Remove your working directory and all contents
rm -rf ~/llama3-finetune

# Clear the Hugging Face cache (contains downloaded model weights)
rm -rf ~/.cache/huggingface

# Clear Python package cache
rm -rf ~/.cache/pip

# Clear bash history
history -c
cat /dev/null > ~/.bash_history

# Clear any potential swap residue (may require sudo depending on node config)
sync
```

노드에 `shred`가 있고, 삭제한 파일을 복구할 수 없다는 확신을 더 얻고 싶다면 다음을 실행합니다.

```bash
# Secure deletion (slower but more thorough)
find ~/llama3-finetune -type f -exec shred -u {} \;
rm -rf ~/llama3-finetune
```

SSH 세션 접속을 끊습니다.

```bash
exit
```

마켓플레이스 대시보드로 돌아가 스토리지 볼륨을 포함해 대여를 종료해야 더 이상 요금이 청구되지 않습니다.

## 파인튜닝한 모델로 추론 실행하기

어댑터를 로컬 머신에 내려받았다면 클라우드에 전혀 의존하지 않고 추론을 실행할 수 있습니다. 최소한의 예시는 다음과 같습니다.

```python
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer, BitsAndBytesConfig
from peft import PeftModel

# Quantization config (same as training)
bnb_config = BitsAndBytesConfig(
    load_in_4bit=True,
    bnb_4bit_quant_type="nf4",
    bnb_4bit_compute_dtype=torch.float16,
)

# Load base model
base_model = AutoModelForCausalLM.from_pretrained(
    "meta-llama/Llama-3.1-8B",
    quantization_config=bnb_config,
    device_map="auto",
)

# Load your fine-tuned adapter
model = PeftModel.from_pretrained(base_model, "./llama-3-8b-custom")

# Load tokenizer
tokenizer = AutoTokenizer.from_pretrained("meta-llama/Llama-3.1-8B")

# Generate a response
prompt = "### Instruction: Summarize the contract clause.\n\n### Input: The Licensee shall not reverse engineer, decompile, or disassemble the Software.\n\n### Response:"

inputs = tokenizer(prompt, return_tensors="pt").to("cuda")
outputs = model.generate(**inputs, max_new_tokens=100, temperature=0.7)
response = tokenizer.decode(outputs[0], skip_special_tokens=True)

print(response)
```

프로덕션 배포에는 FastAPI나 Flask로 API를 감싸거나, vLLM이나 Text Generation Inference(TGI) 같은 추론 서버로 배포하는 방법을 고려하세요. 이들 서버의 비교는 [RTX 4090에서 Ollama vs vLLM vs TGI](/ko/ollama-vs-vllm-vs-tgi-rtx-4090-benchmark/)에서 다룹니다.

## 마치며

사내 데이터로 대규모 언어 모델을 파인튜닝하면서, 그 데이터가 한 대의 머신에 가능한 한 짧은 시간만 머물도록 했습니다. 기업 계약을 맺지도, 기술 기업에 지식 자산에 대한 접근 권한을 넘기지도 않았습니다.

RTX 4090을 시간당 0.45달러에 2시간 학습했다고 가정하면 이 작업의 총비용은 90센트였습니다. AWS의 A10G 한 장도 시간당 약 1.01달러이므로 학습 자체가 비싼 것은 아닙니다. 차이는 할당량 요청과 설정 과정에 있습니다.

더 중요한 점은 데이터셋이 어떤 스토리지 서비스도 거치지 않았고, 작업을 마친 뒤 대여 머신에서 삭제되었다는 것입니다.

폐쇄형 API에 의존하던 시대는 저물고 있습니다. 프라이버시가 필요한 조직, 데이터 주권을 중시하는 연구자, 통제권을 원하는 개발자에게는 대안이 있습니다. GPU 대여로 인프라와 비용, 데이터를 다시 직접 관리할 수 있습니다.

파인튜닝한 모델은 이제 여러분이 통제하는 하드웨어에 있습니다. 어떻게 배포할지, 누가 접근할지, 어떤 목적으로 쓸지는 전적으로 여러분이 결정합니다.

---

## 더 읽어 보기

이 가이드에서는 프라이빗 LLM 파인튜닝의 핵심 워크플로를 다뤘습니다. 다음 글에서 관련 주제를 더 깊이 다룹니다.

**비용 이해하기:**

- [2026년 GPU 대여 가격 비교](/ko/gpu-rental-pricing-comparison-2026/) — 마켓플레이스와 대형 클라우드의 비용 분석
- [GPU 대여의 실제 비용](/ko/hidden-fees-in-gpu-rental/) — 가격 페이지에는 나오지 않는 비용 요소

**시작하기:**

- [2026년 GPU를 대여하려면 무엇이 필요한가](/ko/what-you-need-to-rent-a-gpu/) — 플랫폼별 가입, 인증, 결제 방법
- [공용 GPU 노드에서 데이터셋을 보호하는 방법](/ko/how-to-secure-dataset-on-public-gpu-node/) — 학습 전, 학습 중, 학습 후의 보안 수칙

**선택지 비교하기:**

- [RunPod vs Vast.ai 비교](/ko/runpod-vs-vastapi-comparison/) — 두 대형 마켓플레이스의 차이
- [GPUFlow vs Vast.ai vs RunPod vs SaladCloud](/ko/gpuflow-vs-vast-ai-vs-runpod/) — 머신, 컨테이너, API 키 방식 비교
