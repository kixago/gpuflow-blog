---
title: "대여 GPU와 공용 GPU 노드에서 데이터셋 보호하기"
description: "대여 GPU의 호스트는 작업이 복호화하는 모든 것을 읽을 수 있습니다. 암호화, Secure Cloud, H100 기밀 컴퓨팅이 각각 무엇을 막는지, 그리고 작업 후 정리 방법을 설명합니다."
excerpt: "GPU를 빌린다는 것은 내 데이터가 든 머신의 root 권한을 남이 가진다는 뜻입니다. 위협 모델, 각 방어 수단이 실제로 막는 범위, 최신 디스크에서도 통하는 정리 절차를 정리했습니다."
pubDate: 2026-02-26
updatedDate: 2026-09-30
locale: "ko"
category: "guides"
featured: false
draft: false
author: "GPUFlow Team"
authorUrl: "https://gpuflow.app"
heroImage: "../_images/secure-server-room-abstract.png"
heroImageAlt: "보호된 AI 데이터 처리를 나타내는 추상적인 보안 서버 환경"
faq:
  - question: "대여 GPU의 호스트가 내 데이터를 볼 수 있나요?"
    answer: "기술적으로는 가능합니다. 호스트는 물리 머신의 root 권한을 가지고 있고, 모델을 학습하거나 실행하려면 데이터가 메모리에서 복호화되어야 합니다. Azure나 Google Cloud의 H100 기밀 VM 같은 기밀 컴퓨팅만이 호스트를 이 구도에서 뺄 수 있습니다."
  - question: "클라우드 GPU 인스턴스에서 shred로 파일을 안전하게 지울 수 있나요?"
    answer: "확실하지 않습니다. GNU shred 매뉴얼에 따르면 shred는 파일 시스템과 하드웨어가 데이터를 제자리에 덮어쓸 때만 작동하는데, 저널링 파일 시스템, copy-on-write 파일 시스템, 스냅샷, SSD는 이를 보장하지 않습니다. 데이터가 디스크에 닿기 전에 암호화하고, 대신 인스턴스를 파기하세요."
  - question: "RunPod Secure Cloud와 Community Cloud는 무엇이 다른가요?"
    answer: "RunPod 문서는 Secure Cloud를 T3/T4 데이터센터에서 운영되며 프로덕션과 민감한 데이터에 적합한 것으로, Community Cloud를 안정성이 들쭉날쭉한 P2P 제공자로 설명합니다. RunPod는 Community Cloud의 신규 호스트를 더 이상 받지 않습니다."
  - question: "어떤 클라우드 GPU가 기밀 컴퓨팅을 지원하나요?"
    answer: "2026년 9월 기준 Azure는 AMD SEV-SNP 기반에 H100 NVL GPU 한 장이 달린 NCCads H100 v5 기밀 VM을, Google Cloud는 기밀 a3-highgpu-1g(H100 한 장, Intel TDX)와 G4(RTX PRO 6000, AMD SEV)를 제공합니다. 소비자용 GeForce 카드는 이 목록에 없습니다."
  - question: "GDPR상 대여 GPU에 개인정보를 올려도 안전한가요?"
    answer: "제공자가 GDPR 제28조를 충족하는 계약을 맺은 수탁자이고, 머신이 EU 밖에 있다면 합법적인 이전 경로가 있을 때만 가능합니다. P2P 호스트 대부분은 나와 그런 계약을 맺고 있지 않으므로, 먼저 데이터를 비식별화하거나 DPA에 서명하는 데이터센터 제공자를 쓰세요."
  - question: "GPUFlow에서 모델을 학습하거나 파인튜닝할 수 있나요?"
    answer: "없습니다. GPUFlow는 추론 전용입니다. 제공자의 컴퓨터에서 돌아가는 모델용 OpenAI 호환 API 키를 받으며, SSH, 셸, 파일 접근은 없습니다. 프롬프트는 그 컴퓨터에 평문으로 도착하므로 기밀 기록을 보내지 마세요."
---

GPU를 빌리면 내 데이터가 든 머신의 root 권한은 다른 사람이 가집니다. 암호화는 데이터셋이 그곳으로 가는 동안과 디스크에 있는 동안을 보호하지만, 학습 작업은 데이터를 쓰려면 메모리에서 복호화해야 하고, 그 시점에는 마음먹은 호스트가 읽을 수 있습니다. 그래서 실제로 정할 것은 누구를 신뢰할지(검증된 데이터센터인가, 익명의 가정용 서버인가), 데이터를 얼마나 적게 보낼지, 그리고 기밀 컴퓨팅이 필요한지입니다. 호스트 운영자를 신뢰 사슬에서 빼는 선택지는 기밀 컴퓨팅뿐입니다.

이 가이드는 Vast.ai나 RunPod 인스턴스처럼 로그인해서 쓰는 머신을 다룹니다. 위협 모델, 각 방어 수단이 막는 범위, 최신 스토리지에서도 통하는 정리 절차를 차례로 설명합니다. 출처는 글 끝에 있고, 모든 내용은 2026년 9월에 확인했습니다.

## 위협 모델

먼저 누가 어떤 경로로 데이터에 닿을 수 있는지 적어 보세요. 대여 GPU 인스턴스에는 현실적인 경로가 일곱 가지 있습니다.

<figure>
<svg viewBox="0 0 720 430" role="img" aria-labelledby="d1-title" xmlns="http://www.w3.org/2000/svg" font-family="system-ui, sans-serif" font-size="15">
<title id="d1-title">대여 GPU 인스턴스에 있는 데이터셋의 위협 모델: 데이터에 닿는 일곱 가지 경로와 각각의 주요 방어 수단</title>
<rect x="0" y="0" width="720" height="430" fill="#ffffff"/>
<line x1="220" y1="75" x2="240" y2="170" stroke="#e2e8f0" stroke-width="2"/>
<line x1="220" y1="220" x2="240" y2="215" stroke="#e2e8f0" stroke-width="2"/>
<line x1="220" y1="365" x2="240" y2="270" stroke="#e2e8f0" stroke-width="2"/>
<line x1="500" y1="75" x2="480" y2="170" stroke="#e2e8f0" stroke-width="2"/>
<line x1="500" y1="220" x2="480" y2="215" stroke="#e2e8f0" stroke-width="2"/>
<line x1="500" y1="365" x2="480" y2="270" stroke="#e2e8f0" stroke-width="2"/>
<line x1="360" y1="330" x2="360" y2="290" stroke="#e2e8f0" stroke-width="2"/>
<rect x="240" y="140" width="240" height="150" rx="12" fill="#eef2ff" stroke="#6366f1" stroke-width="2"/>
<text x="360" y="170" text-anchor="middle" fill="#1e1b4b" font-weight="bold">내가 빌린 인스턴스</text>
<text x="360" y="205" text-anchor="middle" fill="#1e1b4b">데이터셋</text>
<text x="360" y="235" text-anchor="middle" fill="#1e1b4b">가중치와 체크포인트</text>
<text x="360" y="265" text-anchor="middle" fill="#1e1b4b">토큰과 키</text>
<rect x="20" y="40" width="200" height="70" rx="10" fill="#ffffff" stroke="#f97316" stroke-width="2"/>
<text x="120" y="68" text-anchor="middle" fill="#1e1b4b">호스트 운영자</text>
<text x="120" y="92" text-anchor="middle" fill="#64748b" font-size="13">대책: 검증된 호스트 또는 CC</text>
<rect x="20" y="185" width="200" height="70" rx="10" fill="#ffffff" stroke="#f97316" stroke-width="2"/>
<text x="120" y="213" text-anchor="middle" fill="#1e1b4b">네트워크 경로</text>
<text x="120" y="237" text-anchor="middle" fill="#64748b" font-size="13">대책: SSH, 열린 포트 없음</text>
<rect x="20" y="330" width="200" height="70" rx="10" fill="#ffffff" stroke="#f97316" stroke-width="2"/>
<text x="120" y="358" text-anchor="middle" fill="#1e1b4b">디스크 잔여물</text>
<text x="120" y="382" text-anchor="middle" fill="#64748b" font-size="13">대책: 암호화 후 파기</text>
<rect x="500" y="40" width="200" height="70" rx="10" fill="#ffffff" stroke="#f97316" stroke-width="2"/>
<text x="600" y="68" text-anchor="middle" fill="#1e1b4b">마켓플레이스 플랫폼</text>
<text x="600" y="92" text-anchor="middle" fill="#64748b" font-size="13">대책: 계약과 DPA</text>
<rect x="500" y="185" width="200" height="70" rx="10" fill="#ffffff" stroke="#f97316" stroke-width="2"/>
<text x="600" y="213" text-anchor="middle" fill="#1e1b4b">다른 테넌트</text>
<text x="600" y="237" text-anchor="middle" fill="#64748b" font-size="13">대책: VM 또는 머신 전체</text>
<rect x="500" y="330" width="200" height="70" rx="10" fill="#ffffff" stroke="#f97316" stroke-width="2"/>
<text x="600" y="358" text-anchor="middle" fill="#1e1b4b">스냅샷, 볼륨</text>
<text x="600" y="382" text-anchor="middle" fill="#64748b" font-size="13">대책: 영구 사본 남기지 않기</text>
<rect x="260" y="330" width="200" height="70" rx="10" fill="#ffffff" stroke="#f97316" stroke-width="2"/>
<text x="360" y="358" text-anchor="middle" fill="#1e1b4b">내가 남긴 흔적</text>
<text x="360" y="382" text-anchor="middle" fill="#64748b" font-size="13">대책: 범위 한정 단기 토큰</text>
</svg>
<figcaption>작업이 도는 동안 인스턴스의 모든 것은 호스트 운영자에게 노출됩니다. 다른 경로는 기본적인 보안 습관으로 막을 수 있지만, 이 경로에는 신뢰할 수 있는 호스트나 기밀 컴퓨팅이 필요합니다.</figcaption>
</figure>

**호스트 운영자.** 물리 머신의 주인은 그 머신의 root 권한을 가집니다. Vast.ai 같은 컨테이너 마켓플레이스에서 클라이언트는 비특권 Docker 컨테이너에서 실행되는데, 이는 다른 테넌트로부터는 격리해 주지만 호스트로부터는 아닙니다. 호스트의 root는 컨테이너의 파일과 메모리를 읽을 수 있습니다. 어느 플랫폼에서든 컨테이너는 원래 그렇게 작동합니다.

**네트워크 경로.** 노트북이나 버킷에서 노드로 이동하는 데이터입니다. 가장 막기 쉬운 경로입니다.

**마켓플레이스 플랫폼.** 나와 호스트 사이의 회사는 내 계정, SSH 키, 그리고 자체 로그에 남는 모든 것을 가지고 있습니다. 그것으로 무엇을 할 수 있는지는 약관이 정하고, 그래서 아래 계약 부분이 중요합니다.

**디스크 잔여물.** 지운 파일이 대여가 끝난 뒤에도 디스크에 남아, 다음 대여자나 호스트가 찾아낼 수 있습니다.

**스냅샷과 영구 볼륨.** 내가 요청한 사본(네트워크 볼륨, 정지된 인스턴스)이나 호스트가 만든 사본(백업)은 작업보다 오래 남습니다.

**다른 테넌트.** 같은 머신의 다른 고객입니다. VM 격리나 머신 전체를 혼자 쓰는 경우라면 위험은 작지만, GPU에는 실제로 이런 버그가 있었습니다. LeftoverLocals(CVE-2023-4969)는 일부 Apple, AMD, Qualcomm GPU에서 한 프로세스가 다른 프로세스의 GPU 로컬 메모리를 읽을 수 있게 했습니다. Trail of Bits는 AMD Radeon RX 7900 XT에서 LLM 쿼리 하나당 약 181 MB를 복구했고, 이는 모델의 답변을 재구성하기에 충분한 양이었습니다. NVIDIA, ARM, Intel GPU에서는 흔적을 찾지 못했습니다.

**내가 남긴 흔적.** 노드에 남겨 둔 Hugging Face 토큰, 클라우드 키, SSH 개인 키입니다. 실제로 대부분의 유출은 여기서 시작됩니다.

## 암호화가 막는 것과 막지 못하는 것

암호화가 할 일은 세 가지이고, 대여 GPU에서는 그중 두 가지를 직접 할 수 있습니다.

**전송 중:** 쉽습니다. SSH(`scp`, `sftp`, `rsync -e ssh`)나 버킷에서 HTTPS를 쓰세요. Vast.ai는 SSH 연결과 자사 API가 암호화되어 있다고 밝힙니다. 평문 HTTP 링크나 인증 없는 파일 공유 서비스는 절대 쓰지 마세요.

**저장 중:** 업로드 전에 암호화해 두면, 호스트 디스크에 있는 파일은 키 없이는 쓸모가 없습니다. 가장 간단한 도구는 [age](https://github.com/FiloSottile/age)입니다.

```bash
# on your own machine
tar -cf - train/ | age -p > train.tar.age
scp -P 22345 train.tar.age user@203.0.113.42:/workspace/
```

노드에서는 메모리로 바로 복호화해서 평문이 디스크에 닿지 않게 합니다.

```bash
mkdir -p /dev/shm/train
age -d /workspace/train.tar.age | tar -xf - -C /dev/shm/train
```

`age -d`는 터미널에서 암호를 물어보므로 키가 노드에 기록되지 않습니다. `/dev/shm`은 RAM 기반 파일 시스템입니다. 컨테이너 환경에서는 크기가 작게 잡혀 있는 경우가 많으니 먼저 `df -h /dev/shm`으로 확인하세요. 데이터가 RAM에 들어가지 않으면 디스크에 복호화된 사본이 필요하고, 그만큼 아래 정리 절차가 더 중요해집니다.

내 서버라면 LUKS 전체 디스크 암호화가 보통의 답이지만, 비특권 컨테이너 안에서는 대개 dm-crypt를 설정할 수 없고, 설정하더라도 동작 중인 키는 호스트가 쥐게 됩니다.

**사용 중:** 여기가 빈틈입니다. 학습하려면 GPU에 평문 텐서가 필요하고, GPU에 데이터를 공급하는 CPU 메모리에도 평문이 있습니다. 호스트의 root 권한이 있는 사람은 원칙적으로 그 메모리를 덤프할 수 있습니다. 저장 중 암호화는 살아 있는 적대적 호스트 앞에서는 아무 소용이 없습니다. 이를 다루는 것은 하드웨어 기반 기밀 컴퓨팅뿐입니다.

## Secure Cloud와 Community Cloud

호스트는 보안 습관으로 없앨 수 없는 유일한 위험이므로, 호스트 선택이 가장 큰 결정입니다. 두 대형 마켓플레이스가 공급을 나눠 놓은 것도 이 때문입니다.

| 선택지 | 하드웨어 운영 주체 | 플랫폼의 설명 |
| --- | --- | --- |
| RunPod Secure Cloud | T3/T4 데이터센터 | "프로덕션, 민감한 데이터"용 |
| RunPod Community Cloud | P2P 제공자 | "비용에 민감한 워크로드"용, 신규 호스트 받지 않음 |
| Vast.ai Secure Cloud | 검증된 데이터센터 | ISO 27001, Tier 3/4 기준, 검증된 물리 보안 |
| 기타 Vast.ai 호스트 | 데이터센터부터 개인까지 | 개인 호스트는 "공식적인 보안 조치가 부족할 수 있음" |

민감한 데이터에 대한 Vast.ai 자체의 권고는 Secure Cloud 제공자만 쓰고, 저장 데이터를 암호화하고, 인증 정보를 인스턴스에 두지 말고, 외부 키 관리를 쓰라는 것입니다. 제가 누구에게나 할 말과 같습니다.

인증받은 데이터센터라도 한계가 두 가지 있습니다. 첫째, ISO 27001은 운영자의 프로세스를 인증할 뿐, 부정직한 내부자를 배제하지는 못합니다. 둘째, 나를 위해 개인정보를 처리하는 호스트는 GDPR상 수탁자이고, 제28조는 이를 다루는 계약을 요구하는데, 나와 호스트 사이에는 마켓플레이스가 끼어 있습니다. 실제로 어느 회사와 계약하는지, 그 회사가 호스트에 대해 무엇을 약속하는지 읽어 보세요.

정말 민감한 작업이라면 한 단계 위는 이미 DPA, 경우에 따라 BAA까지 맺은 하이퍼스케일러 계정의 GPU 인스턴스입니다. 마켓플레이스를 벗어나게 되고, 시간당 비용은 더 듭니다. 가격대는 [GPU 대여 가격 비교](/ko/gpu-rental-pricing-comparison-2026/)에 있습니다.

## H100 GPU의 기밀 컴퓨팅

기밀 컴퓨팅(CC)은 여기서 다루는 기술 중 작업이 도는 동안 호스트 운영자로부터 데이터를 보호하도록 설계된 유일한 기술입니다. NVIDIA Hopper와 Blackwell 데이터센터 GPU에서는 다음과 같이 작동합니다.

- 워크로드는 CPU의 AMD SEV-SNP나 Intel TDX가 뒷받침하는 기밀 VM(CVM)에서 돌아갑니다. NVIDIA의 설계는 하이퍼바이저와 호스트 OS가 침해되었을 수 있다고 가정합니다. 하이퍼바이저 "또는 시스템 자체"에 접근할 수 있는 운영자라도 CVM 메모리를 읽을 수 없어야 합니다.
- 사용 전에 VM은 서명된 장치 인증서로 GPU가 진품이고 CC 모드인지 확인하며, 이는 NVIDIA Remote Attestation Service(NRAS)로 검증할 수 있습니다.
- PCIe를 건너는 데이터, 커맨드 버퍼, CUDA 커널은 암호화되고 서명되며, 공유 메모리의 암호화된 바운스 버퍼를 거칩니다.

NVIDIA는 2024년 4월 CUDA 12.4와 함께 H100 단일 GPU CC를 정식 출시했습니다. 2026년 9월 기준 실제로 빌릴 수 있는 곳은 다음과 같습니다.

| 클라우드 | 인스턴스 | GPU | CPU TEE |
| --- | --- | --- | --- |
| Azure | NCCads H100 v5 | H100 NVL 1장, 94 GB | AMD SEV-SNP (EPYC Genoa) |
| Google Cloud | a3-highgpu-1g, Confidential VM | H100 1장 | Intel TDX |
| Google Cloud | g4-standard-48, Confidential VM | RTX PRO 6000 | AMD SEV |

이를 기반으로 무언가를 만들기 전에 한계를 알아 두세요.

- **VM당 GPU 한 장.** Azure 시리즈는 GPU가 한 장이고, Google의 기밀 GPU VM은 멀티 노드 클러스터를 지원하지 않습니다. 대규모 멀티 GPU 학습은 불가능합니다.
- **프로비저닝.** Google Cloud에서 기밀 A3 High는 Spot이나 flex-start로만 실행되고 예약을 지원하지 않습니다.
- **전송 속도.** NVIDIA의 2023년 기술 문서에 따르면 CC 모드에서 CPU-GPU 대역폭은 CPU 암호화에 막혀 약 4 GB/s입니다. 16 GB 체크포인트를 불러오는 데 순수 전송만 16 ÷ 4 = 4초가 걸린다는 뜻으로, 추론에는 문제없지만 스텝마다 수 기가바이트를 흘려보내는 데이터 파이프라인은 체감하게 됩니다. 이후 드라이버 릴리스에 성능 개선이 올라와 있으니 자기 작업으로 직접 측정하세요.
- **GPU 메모리는 암호화되지 않습니다.** NVIDIA는 일반적인 물리 공격 도구로는 닿을 수 없다는 판단에 따라 패키지 내 HBM을 평문으로 둡니다.
- **마켓플레이스에는 없습니다.** Vast.ai와 RunPod 커뮤니티 호스트에 흔한 소비자용 GeForce 카드는 이 지원 목록 어디에도 없습니다.

CC는 신뢰해야 할 대상을 바꿉니다. 호스트 직원 대신 NVIDIA 하드웨어와 증명, CPU 제조사, 그리고 내 VM 이미지를 신뢰하게 됩니다. "클라우드 제공자의 관리자도 읽을 수 없다"는 답이 중요한 규제 대상 데이터라면, 대여 하드웨어에서 그 답을 얻는 유일한 선택지입니다.

## 작업 전과 작업 중

### 업로드 전에 최소화하기

가장 싼 보호 수단은 내 머신을 떠나지 않는 데이터입니다. 전송하기 전에 이렇게 하세요.

- 모델에 필요 없는 열, 특히 이름, 이메일, 계좌 번호, 자유 서술 메모를 빼세요.
- 직접 식별자는 무작위 토큰으로 바꾸고, 대조표는 내 쪽에 두세요.
- 코퍼스는 방법에 필요한 만큼만 남기세요. LoRA나 QLoRA 파인튜닝은 소수의 추가 가중치만 조정하므로 운영 데이터베이스 전체가 필요한 경우는 드뭅니다. 현실적인 구성은 [파인튜닝 가이드](/ko/private-llm-fine-tuning-guide/)에서 설명합니다.
- 모델 가중치에도 정보가 담긴다는 것을 기억하세요. 민감한 텍스트로 파인튜닝한 모델은 그 일부를 되풀이할 수 있으니, 어댑터도 민감한 자료로 다루세요.

비식별화된 데이터라면 아래의 법적 문제도 대부분 사라집니다.

### 노드의 인증 정보와 네트워크

노드에 올린 것은 무엇이든 복사될 수 있다고 가정하세요.

- 필요한 저장소 하나에만 읽기 권한이 있는 세분화된 Hugging Face 토큰을 쓰고, 작업이 끝나면 폐기하세요.
- 주 SSH 개인 키, 클라우드 root 인증 정보, 운영 데이터베이스 비밀번호는 절대 대여 머신에 복사하지 마세요. 작업 결과를 버킷에 써야 한다면, 접두사 하나에만 쓸 수 있고 하루 안에 만료되는 키를 만드세요.
- 결과는 수명이 긴 키로 노드에서 밀어 보내지 말고, SSH로 끌어오세요.
- `ss -tulnp`로 무엇이 대기 중인지 확인하세요. Jupyter, TensorBoard, 추론 서버는 `127.0.0.1`에 바인딩하고, 공개 포트를 여는 대신 SSH 터널(`ssh -L 8888:127.0.0.1:8888 ...`)로 접속하세요.

## 최신 디스크에서도 통하는 정리 방법

흔한 조언은 끝나면 데이터셋을 `shred`하라는 것입니다. 사람들이 생각하는 대로 작동하지 않습니다. GNU coreutils 매뉴얼에 따르면 `shred`는 파일 시스템과 하드웨어가 데이터를 제자리에 덮어쓰는 것을 전제로 하고, 그 전제가 깨지는 경우를 나열합니다. `data=journal` 모드의 ext4, Btrfs, XFS, ZFS 같은 저널링·로그 구조 파일 시스템, RAID, 스냅샷이 있는 파일 시스템, 압축 파일 시스템, 그리고 웨어 레벨링 때문에 새 데이터를 다른 곳에 쓰는 SSD입니다. 대여 GPU 노드는 이 중 여러 가지에 동시에 해당할 가능성이 큽니다.

대신 통하는 방법은 이렇습니다.

1. **디스크 사본을 무가치하게 만드세요.** age로 암호화한 아카이브만 디스크에 닿았다면 그것을 지우는 것으로 충분합니다. 암호가 없으면 잡음일 뿐입니다. NIST의 매체 삭제 지침(SP 800-88 Rev. 2, 2025년 9월)은 이 방식, 즉 암호학적 삭제를 표준 기법으로 다룹니다.
2. **정지하지 말고 파기하세요.** Vast.ai에서는 인스턴스를 정지하면 데이터가 보존되고 스토리지 요금도 계속 나갑니다. 파기하면 "인스턴스와 모든 데이터가 영구 삭제"됩니다. RunPod에서는 포드를 정지하면 컨테이너 디스크가 지워지고, `/workspace` 볼륨은 정지 후에도 남았다가 종료 시 삭제되며, 네트워크 볼륨은 직접 지울 때까지 무슨 일이 있어도 남습니다.
3. **직접 만든 네트워크 볼륨을 삭제하세요.** 설계상 포드보다 오래 남습니다.
4. **쓴 것은 폐기하세요.** Hugging Face 토큰, 버킷 키, 그리고 이 작업을 위해 마켓플레이스에 추가한 일회용 SSH 공개 키를 지우세요.

호스트가 대여자 사이에 디스크를 어떻게 지우는지는 제가 읽은 마켓플레이스 문서에 나와 있지 않습니다. 지우지 않는다고 가정하고 계획하세요. 어느 쪽이든 1단계가 지켜 줍니다.

## 계약과 규제

기술적 통제보다 더 중요한 법적 사실이 하나 있습니다. 남의 머신에 데이터를 올리면 그 사람이 데이터의 당사자가 됩니다.

- **GDPR.** 나를 위해 개인정보를 처리하는 GPU 호스트는 수탁자입니다. 제28조는 "충분한 보증"을 제공하는 수탁자와 구속력 있는 계약을 요구합니다. 아무것도 서명한 적 없는 P2P 호스트는 이를 충족하지 못하고, 머신이 EU 밖에 있을 수도 있습니다. 비식별화하거나, DPA에 서명하는 제공자를 쓰세요.
- **HIPAA.** HHS는 전자 건강 데이터를 저장하는 클라우드 제공자는 데이터가 암호화되어 있고 키가 없더라도 사업 제휴자라고 말합니다. 검증되지 않은 호스트에 보내기 전에 건강 기록을 암호화한다고 BAA가 필요 없어지지는 않습니다.
- **고객과의 계약.** 많은 기업 계약이 재수탁자와 데이터 위치를 제한합니다. 첫 업로드 전에 확인하세요. 법적 위험이 기술적 위험보다 큰 경우가 많습니다.

같은 규칙을 채팅 쪽에서 다룬 글은 [기업이 공개 AI 도구를 제한하는 이유](/ko/why-corporate-policies-banning-chatgpt/)입니다.

## GPUFlow의 추론: 다른 종류의 교환

GPUFlow는 데이터셋을 올려 두는 곳이 아닙니다. 추론 마켓플레이스입니다. GPU를 시간 단위로 빌리고, 제공자가 자기 컴퓨터에서 (보통 Ollama로) 돌리는 오픈 모델용 OpenAI 호환 API 키(베이스 URL `https://gpuflow.app/v1`)를 받습니다. SSH도, 셸도, 파일 접근도 없고, 학습이나 파인튜닝도 할 수 없습니다. 업로드 자체가 불가능하므로 제공자의 디스크에 내가 올린 것이 남지 않습니다.

그래서 이 가이드의 디스크 문제와 인증 정보 문제는 사라집니다. 호스트 문제는 사라지지 않습니다. 대여가 진행되는 동안 모든 프롬프트와 답변은 제공자의 머신을 평문으로 거칩니다. GPUFlow 약관은 제공자가 이를 기록, 열람, 보관, 공유하는 것을 금지하고, GPUFlow도 텍스트를 저장하지 않지만, 제공자는 그 머신의 root 권한을 가지고 있으므로 이 규칙은 계약으로만 강제됩니다. 데이터셋을 프롬프트 하나에 레코드 하나씩 흘려보낸다면, 모든 레코드가 그 컴퓨터에 도착합니다.

그러니 공개 데이터, 합성 데이터, 제대로 비식별화된 데이터에, 그리고 오픈 모델이나 앱을 OpenAI 방식 API로 테스트하는 데 쓰세요. 규제 대상 기록과 기밀 기록은 내 하드웨어, 계약을 맺은 제공자, 또는 기밀 VM에 두세요. [API 빠른 시작](https://docs.gpuflow.app/ko/renters/api-quickstart/)도 한 줄로 같은 말을 합니다. 비밀번호, 카드 번호, 낯선 사람과 공유하지 않을 비밀은 보내지 마세요. 같은 구조를 제공자 쪽에서 본 내용은 [내 GPU를 대여해도 안전할까](/ko/is-it-safe-to-rent-out-your-gpu/)에 있습니다.

## 체크리스트

작업 전:

- 데이터 등급을 정하세요. 규제 대상 데이터나 고객 기밀 데이터는 커뮤니티 호스트가 아니라 계약을 맺은 제공자나 기밀 VM으로 보냅니다.
- 최소화하고 비식별화하세요.
- age로 암호화하고, 암호는 노드에 두지 마세요.

작업 중:

- 들어간다면 `/dev/shm`으로 복호화하세요.
- 범위가 한정된 단기 토큰만 쓰세요.
- 서비스는 localhost에 바인딩하고 SSH 터널로 접속하세요.

작업 후:

- 결과는 SSH로 끌어오고, 파인튜닝한 가중치는 민감한 자료로 다루세요.
- 인스턴스와 네트워크 볼륨을 파기하세요.
- 토큰과 일회용 키를 폐기하세요.

## 출처

- Vast.ai의 컨테이너 격리와 Secure Cloud: [Vast.ai 보안 FAQ](https://docs.vast.ai/guides/reference/faq/security); 정지와 파기: [인스턴스 관리](https://docs.vast.ai/guides/instances/manage-instances)
- RunPod Secure Cloud와 Community Cloud: [포드 선택](https://docs.runpod.io/pods/choose-a-pod); 스토리지 지속성: [스토리지 유형](https://docs.runpod.io/pods/storage/types)
- LeftoverLocals: [Trail of Bits, 2024년 1월](https://blog.trailofbits.com/2024/01/16/leftoverlocals-listening-to-llm-responses-through-leaked-gpu-local-memory/)
- age: [github.com/FiloSottile/age](https://github.com/FiloSottile/age)
- shred의 한계: [GNU coreutils 매뉴얼, shred 실행](https://www.gnu.org/software/coreutils/manual/html_node/shred-invocation.html)
- NIST SP 800-88 Rev. 2: [NIST 발표, 2025년 9월](https://www.nist.gov/news-events/news/2025/09/guidelines-media-sanitization-nist-publishes-sp-800-88r2)
- H100 기밀 컴퓨팅 설계: [NVIDIA, 안전하고 신뢰할 수 있는 AI를 위한 H100 GPU 기밀 컴퓨팅](https://developer.nvidia.com/blog/confidential-computing-on-h100-gpus-for-secure-and-trustworthy-ai/); 정식 출시: [NVIDIA, 2024년 4월](https://developer.nvidia.com/blog/announcing-confidential-computing-general-access-on-nvidia-h100-tensor-core-gpus/)
- Azure: [NCCads H100 v5 시리즈](https://learn.microsoft.com/en-us/azure/virtual-machines/sizes/gpu-accelerated/nccadsh100v5-series)
- Google Cloud: [Confidential VM 지원 구성](https://docs.cloud.google.com/confidential-computing/confidential-vm/docs/supported-configurations), [GPU가 있는 Confidential VM 인스턴스 만들기](https://docs.cloud.google.com/confidential-computing/confidential-vm/docs/create-a-confidential-vm-instance-with-gpu)
- GDPR 제28조: [gdpr-info.eu](https://gdpr-info.eu/art-28-gdpr/)
- HIPAA와 클라우드 제공자: [HHS, HIPAA와 클라우드 컴퓨팅 가이드](https://www.hhs.gov/hipaa/for-professionals/special-topics/health-information-technology/cloud-computing/index.html)
- GPUFlow: [API 빠른 시작](https://docs.gpuflow.app/ko/renters/api-quickstart/), [대여자가 접근할 수 있는 것과 없는 것](https://docs.gpuflow.app/ko/providers/security/), [약관](https://gpuflow.app/ko/terms), [개인정보 처리방침](https://gpuflow.app/ko/privacy)

모두 2026년 9월에 확인했습니다.
