---
title: "GPU 대여의 실제 비용: 시간당 가격에 빠져 있는 것들"
description: "정지 중 스토리지, 대역폭, 최소 입금액, 과금 단위, 유휴 시간, 카드 수수료까지. Vast.ai, RunPod, Lambda, AWS, GPUFlow에서 GPU 시간당 가격 외에 실제로 내는 비용을 정리했습니다."
excerpt: "시간당 가격은 청구서의 일부일 뿐입니다. 주요 GPU 대여 플랫폼에서 확인한 추가 요금을 금액과 출처와 함께 모두 정리했습니다."
pubDate: 2026-02-15
updatedDate: 2026-09-29
locale: "ko"
category: "pricing"
featured: false
draft: false
author: "GPUFlow Team"
heroImage: "../_images/gpu-server-rack.jpg"
heroImageAlt: "랙에 장착된 GPU 서버 팬 클로즈업"
faq:
  - question: "GPU 대여 플랫폼은 머신이 정지된 동안에도 스토리지 요금을 받나요?"
    answer: "받는 경우가 많습니다. RunPod에서는 정지된 팟의 볼륨 디스크가 월 GB당 $0.20로, 실행 중 요금의 두 배입니다. Vast.ai는 인스턴스가 존재하는 동안 정지 상태를 포함해 매초 스토리지 요금을 청구합니다. GPUFlow는 대여 대상이 머신이 아니라 API 키이므로 스토리지 요금이 없습니다."
  - question: "대역폭 요금을 받는 GPU 대여 플랫폼은 어디인가요?"
    answer: "Vast.ai는 호스트가 데이터 송수신 가격을 직접 정하며, 모든 바이트에 요금이 붙습니다. RunPod와 Lambda는 인바운드·아웃바운드 트래픽에 요금을 받지 않는다고 밝히고 있습니다. AWS는 인터넷으로 나가는 데이터에 대해 매월 처음 100GB를 넘는 분부터 요금을 받습니다."
  - question: "대여를 시작하려면 최소 얼마를 내야 하나요?"
    answer: "Vast.ai의 최소 입금액은 $5입니다. Lambda는 카드에 $10를 사전 승인합니다. RunPod는 선불카드 사용자에게 건당 최소 $100 입금을 요구합니다. GPUFlow는 수수료 없이 $10부터 충전할 수 있습니다."
  - question: "GPU 대여 요금을 미국 달러로 결제하면 은행 수수료가 붙나요?"
    answer: "붙을 수 있습니다. 카드 해외 결제 수수료는 보통 1~3%이며, 가격이 달러로 표시되어 있어도 해외 가맹점 결제라는 이유로 수수료를 받는 은행도 있습니다. 브라질에서는 해외 카드 결제에 3.5%의 IOF 세금이 붙습니다."
---

GPU 리스팅에 표시된 가격은 GPU 사용 시간 1시간당 가격입니다. 그런데 월말에 실제로 내는 금액에는 디스크 공간, 데이터 전송, 준비에 걸리는 시간, 내 은행이 받는 수수료 같은 항목이 함께 들어가는 경우가 많습니다. 일부러 숨긴 비용은 아니지만, 표시된 가격만으로 플랫폼을 비교하면 놓치기 쉽습니다.

이 글에서는 주요 플랫폼에서 확인할 수 있었던 추가 요금을 모두 정리하고, 항목마다 출처 링크를 달았습니다. 모든 내용은 2026년 9월에 확인했습니다. 가격은 바뀌므로 숫자를 그대로 믿기 전에 링크를 확인하세요.

## 요약

| 비용 | Vast.ai | RunPod | Lambda | AWS EC2 | GPUFlow |
| --- | --- | --- | --- | --- | --- |
| 과금 단위 | 초 단위 | 초 단위 | 분 단위 | 초 단위, 최소 60초 | 초 단위, 최소 1분 |
| 실행 중 스토리지 | 호스트가 결정 | 월 GB당 $0.10 | 파일 시스템, 월 GB당 | 월 GB당 $0.08 (gp3) | 없음 |
| 정지 중 스토리지 | 있음, 청구됨 | 월 GB당 $0.20 (볼륨 디스크) | 파일 시스템, 월 GB당 | 월 GB당 $0.08 (gp3) | 없음 |
| 데이터 전송 | 호스트가 결정, 모든 바이트 과금 | 무료 | 무료 | 인터넷으로 송신: 매월 처음 100GB 무료, 이후 유료 | 없음 |
| 시작 최소 금액 | $5 입금 | 1시간 분량 크레딧, 선불카드는 $100 | 카드 $10 사전 승인 | 결제 수단과 GPU 할당량 | $10 충전 |

GPUFlow에 스토리지와 전송 요금이 없는 이유는 대여하는 대상이 다르기 때문입니다. 로그인하는 머신이 아니라, 다른 사람의 GPU에서 돌아가는 AI 모델용 API 키를 받습니다. 그 대신 내 코드나 학습 작업은 실행할 수 없습니다. 자세한 내용은 아래에서 다룹니다.

## 1. 스토리지, 특히 정지 중 스토리지

머신이나 컨테이너를 빌려주는 플랫폼에서는 파일이 디스크에 저장되고, 그 디스크가 존재하는 동안 계속 비용이 나갑니다.

- **RunPod**는 팟이 실행되는 동안 컨테이너 디스크와 볼륨 디스크에 월 GB당 $0.10를 받습니다. 팟을 정지하면 컨테이너 디스크는 사라지고 비용도 없지만, 볼륨 디스크는 **월 GB당 $0.20**입니다. 네트워크 볼륨은 1TB 미만이면 실행 여부와 관계없이 월 GB당 $0.07입니다.
- **Vast.ai**는 호스트마다 스토리지 가격을 정합니다. 인스턴스가 존재하는 동안에는 정지 상태를 포함해 매초 요금이 청구됩니다.
- **AWS**는 인스턴스 실행 여부와 관계없이 EBS 볼륨 요금을 받습니다. us-east-1의 gp3 볼륨은 월 GB당 $0.08입니다.

예를 들어 보겠습니다. 정지된 RunPod 팟에 200GB 볼륨이 붙어 있으면, 팟을 다시 켜지 않더라도 200 × $0.20 = **월 $40**가 나갑니다. 아래에서 소개하는 일반적인 마켓플레이스 가격 기준으로 RTX 3090을 100시간 넘게 쓸 수 있는 금액입니다.

**대처법:** 쓰지 않는 볼륨은 삭제하세요. 세션 사이에 파일만 보관하면 된다면, 큰 팟을 정지해 두는 것보다 작은 네트워크 볼륨이 저렴합니다.

## 2. 데이터 전송

모델을 내려받고 데이터셋을 올리다 보면 수십 GB가 오갈 수 있습니다.

- **Vast.ai:** 호스트마다 업로드·다운로드 가격을 정하며, 문서에 따르면 인스턴스 상태와 관계없이 모든 바이트에 요금이 붙습니다. 대여하기 전에 리스팅의 대역폭 가격을 확인하세요. 큰 모델을 내려받을 계획이라면 특히 중요합니다.
- **RunPod**와 **Lambda**는 데이터 송수신에 요금을 받지 않는다고 밝히고 있습니다.
- **AWS:** 들어오는 데이터는 무료입니다. 인터넷으로 나가는 데이터는 매월 처음 100GB까지 무료이고, 그 이후에는 GB 단위로 요금이 붙습니다. 또 공인 IPv4 주소마다 사용 여부와 관계없이 시간당 $0.005를 받습니다.

## 3. 최소 입금액과 카드 승인 보류

대부분의 GPU 플랫폼은 선불제입니다. 먼저 크레딧을 사고 그다음에 씁니다.

- **Vast.ai:** 최소 입금액 $5.
- **RunPod:** 고른 머신 기준으로 최소 1시간 분량의 크레딧이 있어야 하며, 선불카드는 건당 최소 $100를 입금해야 합니다.
- **Lambda:** 카드에 $10 사전 승인이 걸리고, 며칠 뒤 환불됩니다.
- **SaladCloud:** 크레딧은 구매 후 12개월이 지나면 만료됩니다.
- **GPUFlow:** $10부터 $500까지 수수료 없이 충전할 수 있고, 크레딧은 만료되지 않습니다.

만료되거나 쓰지 않고 남아 있는 크레딧도 비용입니다. 쓸 만큼만 충전하세요.

## 4. 준비 시간에도 요금이 나갑니다

머신을 빌리면 작업이 시작될 때가 아니라 머신이 켜질 때부터 요금이 나갑니다. 드라이버와 라이브러리 설치, 컨테이너 이미지 받기, 15GB짜리 모델 다운로드가 모두 유료 시간에 이루어집니다. 시간당 $0.35라면 30분 준비에 약 $0.18가 듭니다. 한 번으로는 적은 금액이지만, 매일 새 머신을 띄운다면 쌓입니다.

두 가지 방법이 도움이 됩니다. 필요한 것이 이미 들어 있는 템플릿이나 컨테이너 이미지를 쓰고, 모델을 볼륨에 보관해 한 번만 내려받는 것입니다. 다만 1번에서 본 스토리지 비용과 비교해 보세요.

GPUFlow에서는 대여하기 전에 모델이 이미 제공자의 머신에 설치되어 있습니다. 따로 준비할 것이 없습니다. 대여가 시작되는 순간부터 요금이 나가고, 키는 바로 작동합니다.

## 5. 과금 단위와 최소 시간

이제 초 단위 과금이 흔하지만, 최소 시간은 플랫폼마다 다릅니다.

| 플랫폼 | 시간 과금 방식 |
| --- | --- |
| Vast.ai | 초 단위, 최소 시간 없음 |
| RunPod 팟 | 초 단위 |
| RunPod 서버리스 | 초 단위, 올림 처리. 워커 시작 시간과 유휴 타임아웃(기본 5초)도 요금에 포함 |
| Lambda | 분 단위 |
| AWS EC2 (Linux) | 초 단위, 최소 60초 |
| Google Cloud | 초 단위, 최소 1분 |
| GPUFlow | 초 단위, 최소 1분 |

과금 단위가 가장 크게 영향을 미치는 곳은 서버리스입니다. 짧은 요청을 간격을 두고 보낸다면, 시작 시간과 유휴 타임아웃 비용이 요청 처리 비용보다 커질 수 있습니다.

## 6. 실행 중인 머신의 유휴 시간

시간 단위로 빌린 머신은 GPU가 일을 하든 대기하든 요금이 같습니다. "아침에 바로 쓰려고" 팟을 밤새 켜 두는 것이 돈을 낭비하기 쉬운 방법입니다. Lambda도 인스턴스는 사용 여부와 관계없이 실행 중이면 요금이 청구된다고 분명히 밝히고 있습니다.

**대처법:** 알림을 설정하거나, 유휴 머신을 멈춰 주는 플랫폼 기능을 쓰세요. GPUFlow에서는 시간을 정해서 대여합니다. 일찍 끝나면 **지금 종료**를 클릭하세요. 쓰지 않은 시간은 크레딧으로 돌아옵니다. [GPUFlow 요금 청구 방식](https://docs.gpuflow.app/ko/renters/billing/).

## 7. 중단 가능 머신

중단 가능(스팟) 머신은 절반 이상 저렴한 경우가 많지만, 더 높은 가격을 내는 사람이 나타나면 멈출 수 있습니다. Vast.ai는 이를 interruptible이라고 부르며 보통 50% 이상 저렴하다고 설명합니다. TensorDock에서는 더 높은 입찰에 밀려난 동안에도 스토리지 요금이 계속 나갑니다. 작업을 체크포인트에서 다시 시작할 수 없다면, 한 번 중단될 때마다 같은 작업에 두 번 돈을 내는 셈입니다.

## 8. 은행 수수료

거의 모든 GPU 플랫폼이 미국 달러로 요금을 받습니다. 카드 통화가 다르면 은행이 수수료를 붙일 수 있습니다.

- 해외 결제 수수료는 보통 **1~3% 수준**입니다. 가격이 달러로 표시되어 있어도 해외 가맹점 결제라는 이유로 수수료를 받는 은행도 있습니다.
- 캐나다의 많은 신용카드는 다른 통화 결제에 약 **2.5%의 수수료**를 받습니다.
- 브라질에서는 **해외 카드 결제에 3.5%의 IOF 세금**이 붙습니다.

$100를 충전하면 플랫폼 청구서에는 보이지 않는 $1~$3.50가 더 나가는 셈입니다. 해외 결제 수수료가 없는 카드를 쓰면 대부분 피할 수 있습니다.

## 9. 제공자라면: 출금 수수료와 최소 금액

내 GPU를 빌려준다면 플랫폼이 일정 몫을 가져가고, 출금에도 따로 규칙이 있습니다.

| 플랫폼 | 제공자가 받는 몫 | 최소 출금액 | 출금 수수료 |
| --- | --- | --- | --- |
| GPUFlow | 대여 가격의 88% | $25 | 출금 1회당 $2.50 |
| Vast.ai | Vast에 따르면 표시 가격은 보통 호스트 수익보다 약 25% 높음 | $20 | Vast는 명시하지 않음. 이용하는 송금 서비스가 수수료를 받을 수 있음 |
| TensorDock | 호스팅 계약서에 수수료 20% 또는 25%로 기재(두 수치가 모두 나옴) | 출금 전 $250 | 명시되지 않음 |

GPUFlow는 카드 결제 분쟁에 대비해 수익을 7일 동안(가입 30일 미만 계정은 14일) 보류한 뒤 출금할 수 있게 합니다. [GPUFlow 출금 방식](https://docs.gpuflow.app/ko/providers/getting-paid/).

## 2026년 9월 기준 일반적인 GPU 가격

참고로, 2026년 9월에 Vast.ai, RunPod, Salad, SimplePod, TensorDock, Hyperstack, Lambda에서 확인한 온디맨드 가격대는 다음과 같습니다.

| GPU | 일반적인 시간당 가격 |
| --- | --- |
| RTX 3060 12 GB | $0.05 – $0.08 |
| RTX 3090 | $0.11 – $0.31 |
| RTX 4090 | $0.30 – $0.46 |
| RTX 5090 | $0.41 – $0.69 |

비교하자면, AWS의 NVIDIA L4 1개(us-east-1의 g6.xlarge)는 시간당 약 $0.80, A10G 1개(g5.xlarge)는 약 $1.01입니다.

## 대여 전 체크리스트

1. GPU 사용 시간에 파일을 보관하는 기간 동안의 스토리지 비용을 **더해서** 계산하세요.
2. 플랫폼에 대역폭 가격이 있다면 확인하고, 얼마나 내려받을지 따져 보세요.
3. 준비 시간도 유료 시간으로 계산하세요.
4. 요금을 멈추는 방법을 알아 두세요. 대여 종료, 머신 정지, 볼륨 삭제 중 무엇이 필요한지 확인하세요.
5. 카드의 해외 결제 수수료를 확인하세요.

내 소프트웨어를 돌릴 머신이 아니라 코드에서 호출할 AI 모델이 필요하다면, API 방식의 대여로 1, 2, 4번 항목을 아예 피할 수 있습니다. 학습용으로 머신 전체가 필요하다면 위 플랫폼들이 맞는 선택이고, 이 체크리스트를 따르면 청구 금액을 시간당 가격에 가깝게 유지할 수 있습니다.

## 관련 글

- [시간당 GPU인가, 토큰당 API인가? 7B–8B 모델 운영의 실제 비용](/ko/hourly-gpu-vs-per-token-api/)
- [GPUFlow vs Vast.ai vs RunPod vs SaladCloud: 내 작업에 맞는 플랫폼은](/ko/gpuflow-vs-vast-ai-vs-runpod/)
- [2026년 GPU 대여에 필요한 것](/ko/what-you-need-to-rent-a-gpu/)

## 출처

모두 2026년 9월에 확인했습니다.

- RunPod 팟 가격과 스토리지: [docs.runpod.io/pods/pricing](https://docs.runpod.io/pods/pricing)
- RunPod 서버리스 과금: [docs.runpod.io/serverless/pricing](https://docs.runpod.io/serverless/pricing)
- RunPod 결제와 입금: [docs.runpod.io/references/billing-information](https://docs.runpod.io/references/billing-information)
- Vast.ai 가격과 과금: [docs.vast.ai/guides/instances/pricing.md](https://docs.vast.ai/guides/instances/pricing.md), [docs.vast.ai/documentation/reference/billing](https://docs.vast.ai/documentation/reference/billing)
- Vast.ai 입금: [docs.vast.ai 빠른 시작](https://docs.vast.ai/guides/get-started/quickstart.md)
- Vast.ai 호스트 지급: [docs.vast.ai/host/payment.md](https://docs.vast.ai/host/payment.md), 호스트 수익 관련 글: [vast.ai](https://vast.ai/article/how-much-money-can-you-earn-renting-out-your-gpu-on-vast-ai)
- Lambda 과금: [docs.lambda.ai/public-cloud/billing](https://docs.lambda.ai/public-cloud/billing/), [결제 관리](https://docs.lambda.ai/public-cloud/manage-billing/), [요금("No egress fees")](https://lambda.ai/pricing)
- SaladCloud 과금: [docs.salad.com 과금](https://docs.salad.com/general/explanation/billing.md)
- TensorDock 스팟 인스턴스: [docs.tensordock.com](https://docs.tensordock.com/virtual-machines/spot-instances), 공급자 계약: [docs.tensordock.com](https://docs.tensordock.com/legal-information/supplier-hosting-agreement.md)
- AWS EC2 과금: [aws.amazon.com/ec2/pricing/on-demand](https://aws.amazon.com/ec2/pricing/on-demand/), EBS: [aws.amazon.com/ebs/pricing](https://aws.amazon.com/ebs/pricing/), 공인 IPv4: [aws.amazon.com/vpc/pricing](https://aws.amazon.com/vpc/pricing/)
- AWS 인스턴스 가격: [instances.vantage.sh g6.xlarge](https://instances.vantage.sh/aws/ec2/g6.xlarge?region=us-east-1), [g5.xlarge](https://instances.vantage.sh/aws/ec2/g5.xlarge?region=us-east-1)
- Google Cloud VM 과금: [cloud.google.com/compute/vm-instance-pricing](https://cloud.google.com/compute/vm-instance-pricing)
- 카드 해외 결제 수수료: [Experian](https://www.experian.com/blogs/ask-experian/what-is-a-foreign-transaction-fee/), [NerdWallet Canada](https://www.nerdwallet.com/ca/p/best/credit-cards/best-no-foreign-transaction-fee-credit-cards)
- 브라질 IOF 3.5%: [Wise Brazil](https://wise.com/br/blog/iof-cartao-internacional)
- GPU 가격대: [GPUFlow 문서, GPU 가격 정하는 법](https://docs.gpuflow.app/ko/providers/pricing/)
