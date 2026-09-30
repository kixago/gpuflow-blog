---
title: "기업이 업무용 ChatGPT를 금지하는 이유와 대안"
description: "기업이 공개 AI 채팅 앱을 제한하는 것은 직원이 회사가 공유 계약을 맺지 않은 데이터를 붙여 넣기 때문입니다. 실제 사례, 2026년 규제, 실제로 쓸 수 있는 대안을 정리했습니다."
excerpt: "기업의 ChatGPT 금지는 대부분 계약과 기본 설정의 문제입니다. Samsung에서 무엇이 잘못됐는지, 지금 비즈니스 요금제가 무엇을 약속하는지, 선택지마다 프롬프트가 어디로 가는지 설명합니다."
pubDate: 2026-02-26
updatedDate: 2026-09-30
locale: "ko"
category: "case-studies"
featured: false
draft: false
author: "GPUFlow Team"
heroImage: "../_images/corporate-ai-policy-restriction.png"
heroImageAlt: "AI 접근 제한을 나타내는 디지털 자물쇠 기호가 컴퓨터 화면 위에 겹쳐진 사무실 환경"
faq:
  - question: "기업은 왜 직원의 ChatGPT 사용을 금지하나요?"
    answer: "직원이 회사와 고객의 데이터를 회사가 계약을 맺지 않은 개인 계정에 붙여 넣기 때문입니다. 개인용 ChatGPT 요금제는 기본적으로 OpenAI가 콘텐츠를 모델 개선에 쓸 수 있고, 회사를 위한 데이터 처리 계약(DPA)이나 HIPAA 사업 제휴 계약(BAA)도 없습니다."
  - question: "ChatGPT Enterprise는 회사 데이터로 학습하나요?"
    answer: "기본적으로는 하지 않습니다. OpenAI의 엔터프라이즈 개인정보 페이지에 따르면 고객이 동의하지 않는 한 ChatGPT Enterprise, Business, Edu, API의 데이터로 학습하지 않으며, Enterprise에는 SOC 2 Type 2 감사와 관리자가 설정하는 보존 기간이 적용됩니다."
  - question: "어떤 기업이 ChatGPT를 제한했나요?"
    answer: "Samsung은 소스 코드와 내부 데이터 유출 보도가 나온 뒤 2023년에 회사 기기에서 생성형 AI 사용을 제한했습니다. 같은 해 Apple, JPMorgan, Bank of America, Citi, Deutsche Bank, Goldman Sachs, Wells Fargo, Walmart, Verizon도 사용을 제한했다고 보도되었습니다."
  - question: "GDPR상 고객 데이터를 ChatGPT에 넣어도 합법인가요?"
    answer: "적법한 근거와 GDPR 제28조를 충족하는 수탁자 계약이 있을 때만 가능합니다. 데이터 처리 계약이 있는 비즈니스 요금제는 이를 충족할 수 있지만, 직원의 개인 계정은 그 계정에 대해 회사와 업체 사이에 계약이 없으므로 충족할 수 없습니다."
  - question: "EU AI Act의 고위험 규정은 언제부터 적용되나요?"
    answer: "2026년 7월 27일 발효된 AI Omnibus 개정에 따라, 이력서 심사 같은 독립형 시스템의 고위험 규정은 2027년 12월 2일부터, 규제 대상 제품에 내장된 AI는 2028년 8월 2일부터 적용됩니다. 제50조의 투명성 의무는 2026년 8월 2일부터 적용되고 있습니다."
  - question: "GPUFlow를 회사 기밀 데이터에 써도 되나요?"
    answer: "안 됩니다. GPUFlow에서는 모델이 제공자의 개인 컴퓨터에서 돌아가므로 프롬프트와 답변이 그 머신을 평문으로 거칩니다. 약관은 제공자가 이를 기록하는 것을 금지하지만, 이는 기술적 차단이 아니라 계약상 규칙입니다. 낯선 사람과 공유해도 되는 데이터에만 쓰세요."
---

"ChatGPT를 금지"한 기업 대부분은 AI 자체에 반대하지 않습니다. 문제 삼는 것은 직원이 회사가 계약을 맺지 않은 개인 계정에 회사 데이터를 붙여 넣는 것이고, 그런 계정에서는 기본적으로 업체가 그 데이터를 모델 개선에 쓸 수 있습니다. 보통의 해결책은 승인된 도구입니다. 학습 금지와 보존 조건이 붙은 비즈니스 요금제, 회사 자체 클라우드 계정 안의 모델 엔드포인트, 또는 회사가 운영하는 하드웨어의 오픈 웨이트 모델입니다. 알맞은 계약만 있으면 공개 도구로도 많은 일을 해도 됩니다.

아래에서는 모두가 인용하는 사례에서 실제로 무슨 일이 있었는지, 2026년에 어떤 규제가 적용되는지, 각 업체의 비즈니스 약관이 지금 무엇을 말하는지, 선택지마다 텍스트가 어디로 가는지 다룹니다. 모든 내용은 2026년 9월에 1차 출처로 확인했고, 출처는 글 끝에 있습니다.

## Samsung과 은행들에서 무슨 일이 있었나

모두가 인용하는 사례는 Samsung입니다. 2023년 초 Samsung 반도체 부문은 엔지니어에게 ChatGPT 사용을 허용했습니다. 이후 국내 언론은 별개의 사고 세 건을 보도했습니다. 직원이 버그를 고치려고 소스 코드를 붙여 넣었고, 회의록 작성에 이 도구를 썼고, 설비 측정 데이터와 수율 데이터를 입력했다는 것입니다. Samsung은 당시 세부 내용을 확인하지 않았습니다. 2023년 4월 말, 가장 큰 사업부 중 한 곳의 직원들에게 회사 컴퓨터에서 생성형 AI 사용을 일시적으로 제한한다는 공지가 나갔습니다. 그 전달의 사내 설문에서는 응답자의 65%가 보안 위험을 우려한다고 답했습니다.

Wall Street Journal에 따르면 Apple은 모델 학습에 사용자 데이터를 쓰는 개발사에 기밀 데이터가 넘어갈 것을 우려해 2023년 5월 ChatGPT와 GitHub Copilot 사용을 제한했습니다. 같은 보도는 JPMorgan, Bank of America, Citi, Deutsche Bank, Goldman Sachs, Wells Fargo, Walmart, Verizon도 ChatGPT를 제한했다고 전했습니다.

이 사례들에서 놓치기 쉬운 점이 두 가지 있습니다.

첫째, 해킹당한 곳은 없습니다. 데이터는 직원이 보낸 곳으로 정확히 갔습니다. 걱정은 그 뒤의 일이었습니다. 누가 보관하는지, 얼마나 오래 보관하는지, 모델 학습에 쓰이는지, 법원이 업체에 제출을 명령할 수 있는지입니다.

둘째, 금지는 금지로 오래가지 않았습니다. JPMorgan은 자체 내부 플랫폼인 LLM Suite를 만들어 직원들이 "보안 환경에서" 대규모 언어 모델을 쓸 수 있게 했습니다. 2024년 여름에 출시되어 8개월 만에 사용자 200,000명이 등록했습니다. 이것이 전형적인 흐름입니다. 소비자용 앱을 막고, 그다음 승인된 도구를 줍니다.

## 실제 위험은 무엇인가

직원이 개인용 소비자 계정을 쓰면 별개의 문제 네 가지가 겹칩니다.

**기본값이 학습 허용.** ChatGPT Free, Plus, Pro에서는 사용자가 Data controls에서 "Improve the model for everyone"을 끄지 않는 한 콘텐츠가 OpenAI 모델 개선에 쓰일 수 있습니다. 사용자가 좋아요나 싫어요를 누르면, 거부 설정을 한 뒤에도 대화 전체가 쓰일 수 있습니다. Anthropic의 소비자용 Claude 요금제는 사용자가 모델 개선을 허용하면 대화를 학습에 씁니다. 결국 소스 코드가 학습 데이터에 들어가는지는 남의 계정에 있는 설정 하나에 달려 있습니다.

**통제할 수 없는 보존.** OpenAI 플랫폼의 비즈니스 데이터는 사용자가 삭제한 뒤 30일 안에 삭제되지만, "법적으로 보존해야 하는 경우는 제외"입니다. 이 단서는 실제로 작동합니다. New York Times 소송에서는 2025년 6월부터 2025년 9월 26일까지의 법원 명령으로, OpenAI가 원래라면 삭제했을 소비자용 ChatGPT와 표준 API 콘텐츠를 보관해야 했습니다. ChatGPT Enterprise, Edu, 그리고 데이터 무보존(zero data retention)을 적용한 API 고객은 대상이 아니었습니다.

**계약 부재.** 법적으로 가장 중요한 부분입니다. GDPR에 따르면 업체가 개인정보를 처리하게 하는 회사는 "충분한 보증"을 제공하는 수탁자를 써야 하고, 그와 구속력 있는 계약을 맺어야 합니다(제28조). 의료기관에는 사업 제휴 계약(BAA)이 필요합니다. 직원의 개인 계정에는 둘 다 없으므로, 실제로 무언가가 유출되든 아니든 붙여 넣는 순간 위반이 일어납니다.

**기록 부재.** 규제 대상 기업은 업무 커뮤니케이션을 감독하고 보관해야 합니다. 개인 계정의 대화는 컴플라이언스팀이 운영하는 어떤 보관 시스템에도 들어가지 않습니다.

## 2026년에 적용되는 규제

### GDPR

프롬프트에 EU 고객이나 직원의 개인정보가 들어가면 그것은 처리 행위입니다. 적법한 근거, 제28조에 따른 수탁자 계약, 그리고 EU 밖으로 이전한다면 합법적인 이전 경로가 필요합니다. 미국 업체에는 EU-미국 데이터 프라이버시 프레임워크가 여전히 유효합니다. EU 일반법원이 2025년 9월 3일 Latombe의 이의 제기를 기각했습니다(사건 T-553/23). 사법재판소에 C-703/25 P로 항소가 계류 중이니 지켜보세요.

감독기관은 채팅 서비스에 직접 조치를 취해 왔습니다. 이탈리아의 Garante는 2023년 3월 말 ChatGPT를 일시 차단했고, 2024년 12월에는 적절한 법적 근거 없이 ChatGPT 학습에 개인정보를 처리한 것, 2023년 3월의 침해 사고를 신고하지 않은 것, 부족한 투명성, 연령 확인 부재를 이유로 OpenAI에 1,500만 유로의 과징금을 부과했습니다. OpenAI는 과징금이 과도하다며 항소하겠다고 밝혔습니다.

### HIPAA

적용 대상 기관을 위해 전자 보호 건강 정보를 받거나 저장하거나 전송하는 서비스는 모두 사업 제휴자이며, 서명된 BAA가 필요합니다. HHS는 암호화된 데이터만 보관하고 키가 없는 클라우드 제공자도 여전히 사업 제휴자라고 명시합니다. OpenAI는 API에 대해 BAA를 체결할 수 있다고 밝힙니다. 임상의의 개인 ChatGPT 계정에는 BAA가 전혀 없습니다.

### 금융 서비스

FINRA의 Regulatory Notice 24-09(2024년 6월 27일)는 자사 규칙이 생성형 AI에도 "회원사가 다른 어떤 기술이나 도구를 쓸 때와 똑같이 적용된다"고 밝힙니다. 감독, 대중과의 커뮤니케이션, 기록 보관이 모두 그대로 적용됩니다. 2023년 은행들의 제한 조치 대부분이 바로 여기서 나왔습니다.

### EU AI Act

AI Act는 2024년 8월 1일 발효되었습니다. 금지 행위와 AI 리터러시 의무는 2025년 2월 2일부터, 범용 AI 모델 제공자의 의무는 2025년 8월 2일부터 적용되었습니다. AI Omnibus 개정안인 Regulation (EU) 2026/1744는 2026년 7월 24일 공포되어 2026년 7월 27일 발효되었습니다. 이 개정으로 고위험 기한이 바뀌었습니다. 이력서 분류처럼 채용에 쓰이는 AI를 포함한 독립형 고위험 시스템은 2027년 12월 2일, 규제 대상 제품에 내장된 AI는 2028년 8월 2일입니다. 제50조의 투명성 의무는 예정대로 2026년 8월 2일부터 적용되었고, AI 리터러시 의무는 이를 "지원"하는 조치를 취하는 것으로 완화되었습니다.

채팅 어시스턴트로 이메일 초안을 쓰는 회사라면 AI Act가 더하는 부담은 거의 없습니다. 같은 어시스턴트가 지원자 순위를 매기기 시작하면 고위험 시스템을 배포하는 것이 되고, 2027년 12월 기한이 적용됩니다.

## 비즈니스 요금제가 약속하는 것

이제 주요 업체는 모두 소비자용 앱과 기본값이 다른 비즈니스 등급을 판매합니다. 아래 표는 2026년 9월 기준 각 업체 자체 페이지의 내용을 요약한 것입니다.

| 상품 | 기본적으로 내 데이터로 학습하는가? | 보존과 관리 | 컴플라이언스 참고 |
| --- | --- | --- | --- |
| ChatGPT Free, Plus, Pro | 사용자가 거부하지 않으면 학습할 수 있음 | 사용자 계정별 | 회사 계약 없음 |
| ChatGPT Business, Enterprise, Edu | 아니요 | 워크스페이스 관리자가 보존 기간 설정 | Enterprise와 Business는 SOC 2 Type 2 |
| OpenAI API | 아니요 | 30일 후 삭제, 조건을 충족하는 용도는 데이터 무보존 | BAA 가능 |
| Claude Team, Enterprise, API | 아니요 | 피드백은 최대 5년 보관될 수 있음, 소유자가 피드백을 끌 수 있음 | 상업용 약관 |
| Microsoft 365 Copilot과 Copilot Chat | 아니요, 기반 모델 학습에 쓰이지 않음 | 자사 보존 정책, 레이블, 감사가 적용됨 | DPA, EU Data Boundary (Anthropic 모델 제외) |
| Google Workspace의 Gemini | 허가 없이 도메인 밖 학습에 쓰이지 않음 | 기존 Workspace 관리 기능 적용 | HIPAA 지원, FedRAMP High |

대형 클라우드 안의 모델 엔드포인트는 한 걸음 더 나갑니다. Microsoft는 Microsoft Foundry에서 Azure가 판매하는 모델의 프롬프트와 응답은 "OpenAI나 다른 제공자가 접근할 수 없으며", Global이나 DataZone 배포를 고르지 않는 한 선택한 지역 안에서 처리된다고 밝힙니다. Amazon Bedrock에서는 모델이 모델 제공자가 접근할 수 없는 배포 계정에서 돌아가므로, 제공자는 프롬프트나 응답을 볼 수 없습니다.

비즈니스 요금제로도 바뀌지 않는 것이 있습니다. 텍스트는 보존 조건이 허용하는 기간 동안 여전히 업체 서버에 있고, 법원 명령은 여전히 그곳에 닿을 수 있습니다. 이메일과 문서 서비스 업체에 이미 주고 있는 것과 같은 수준의 신뢰입니다. 대부분의 내부 업무에는 합리적인 교환입니다. 영업 비밀, BAA 없는 규제 대상 데이터, 고객 계약이 재수탁자에게 보내는 것을 금지하는 자료라면 그렇지 않을 수 있습니다.

## 선택지마다 프롬프트가 가는 곳

선택지를 정직하게 비교하는 방법은 프롬프트 하나를 따라가며 누가 읽을 수 있는지 묻는 것입니다.

<figure>
<svg viewBox="0 0 720 470" role="img" aria-labelledby="d1-title" xmlns="http://www.w3.org/2000/svg" font-family="system-ui, sans-serif" font-size="15">
<title id="d1-title">다섯 가지 AI 구성에서 직원의 프롬프트가 가는 곳과 각각을 보호하는 장치</title>
<rect x="0" y="0" width="720" height="470" fill="#ffffff"/>
<text x="325" y="30" text-anchor="middle" fill="#64748b">텍스트가 가는 곳</text>
<text x="475" y="30" fill="#64748b">보호 장치</text>
<rect x="20" y="200" width="140" height="70" rx="10" fill="#eef2ff" stroke="#6366f1" stroke-width="2"/>
<text x="90" y="231" text-anchor="middle" fill="#1e1b4b">직원의</text>
<text x="90" y="252" text-anchor="middle" fill="#1e1b4b">프롬프트</text>
<line x1="160" y1="235" x2="200" y2="80" stroke="#6366f1" stroke-width="2"/>
<line x1="160" y1="235" x2="200" y2="160" stroke="#6366f1" stroke-width="2"/>
<line x1="160" y1="235" x2="200" y2="240" stroke="#6366f1" stroke-width="2"/>
<line x1="160" y1="235" x2="200" y2="320" stroke="#6366f1" stroke-width="2"/>
<line x1="160" y1="235" x2="200" y2="400" stroke="#6366f1" stroke-width="2"/>
<rect x="200" y="50" width="250" height="60" rx="10" fill="#ffffff" stroke="#f97316" stroke-width="2"/>
<text x="325" y="76" text-anchor="middle" fill="#1e1b4b">소비자용 채팅 앱</text>
<text x="325" y="97" text-anchor="middle" fill="#64748b" font-size="13">개인 Free, Plus, Pro 계정</text>
<text x="475" y="76" fill="#1e1b4b" font-size="14">기본값이 학습 허용</text>
<text x="475" y="97" fill="#1e1b4b" font-size="14">회사와의 계약 없음</text>
<rect x="200" y="130" width="250" height="60" rx="10" fill="#eef2ff" stroke="#6366f1" stroke-width="2"/>
<text x="325" y="156" text-anchor="middle" fill="#1e1b4b">업체 비즈니스 요금제</text>
<text x="325" y="177" text-anchor="middle" fill="#64748b" font-size="13">업체 서버, 회사 계정</text>
<text x="475" y="156" fill="#1e1b4b" font-size="14">기본적으로 학습 안 함</text>
<text x="475" y="177" fill="#1e1b4b" font-size="14">DPA, 보존 기간 관리</text>
<rect x="200" y="210" width="250" height="60" rx="10" fill="#eef2ff" stroke="#6366f1" stroke-width="2"/>
<text x="325" y="236" text-anchor="middle" fill="#1e1b4b">자사 클라우드 모델 엔드포인트</text>
<text x="325" y="257" text-anchor="middle" fill="#64748b" font-size="13">Azure Foundry, Amazon Bedrock</text>
<text x="475" y="236" fill="#1e1b4b" font-size="14">자사 테넌트와 리전</text>
<text x="475" y="257" fill="#1e1b4b" font-size="14">모델 제작사는 볼 수 없음</text>
<rect x="200" y="290" width="250" height="60" rx="10" fill="#ffffff" stroke="#16a34a" stroke-width="2"/>
<text x="325" y="316" text-anchor="middle" fill="#1e1b4b">자체 서버</text>
<text x="325" y="337" text-anchor="middle" fill="#64748b" font-size="13">오픈 웨이트 모델, 사내 네트워크</text>
<text x="475" y="316" fill="#1e1b4b" font-size="14">네트워크 밖으로 나가지 않음</text>
<text x="475" y="337" fill="#1e1b4b" font-size="14">운영과 패치는 모두 직접</text>
<rect x="200" y="370" width="250" height="60" rx="10" fill="#ffffff" stroke="#f97316" stroke-width="2"/>
<text x="325" y="396" text-anchor="middle" fill="#1e1b4b">마켓플레이스 GPU (GPUFlow)</text>
<text x="325" y="417" text-anchor="middle" fill="#64748b" font-size="13">제공자의 개인 컴퓨터</text>
<text x="475" y="396" fill="#1e1b4b" font-size="14">해당 머신에서는 평문</text>
<text x="475" y="417" fill="#1e1b4b" font-size="14">약관이 기록을 금지</text>
<text x="360" y="458" text-anchor="middle" fill="#64748b" font-size="13">주황: 공개 데이터에만 적합. 초록: 사내 IT가 보관할 수 있는 데이터라면 무엇이든 적합.</text>
</svg>
<figcaption>같은 프롬프트, 다섯 곳의 목적지. 사내 네트워크 안에 두는 것은 자체 호스팅뿐이고, 비즈니스 요금제와 클라우드 엔드포인트는 회사가 서명한 계약의 보호를 받습니다.</figcaption>
</figure>

## 오픈 웨이트 모델을 직접 운영하기

기밀 데이터에 가장 강력한 선택지는 손도 가장 많이 갑니다. 오픈 웨이트 모델(Llama, Qwen, Mistral, Gemma 등)을 내려받아 사내 네트워크의 머신에서 돌리는 것입니다. 프롬프트는 밖으로 나가지 않습니다. 무엇을 얼마나 오래 기록할지 직접 정하므로 기록 보관 의무와 GDPR 보존 규정을 맞추기 쉽고, 다른 회사의 보존 조항이나 법원 명령이 데이터에 닿지 않습니다.

다만 비용은 분명히 있습니다. 이제 추론 서비스를 운영해야 합니다. GPU, Ollama나 vLLM 같은 엔진, 인증, 로깅, 업데이트, 그리고 장애 대응 담당자가 필요합니다. 또 워크스테이션 카드 한 장에 들어가는 8B나 14B 모델은 긴 추론에서 최상위 모델보다 약합니다. 분류, 필드 추출, 내부 문서 요약, 일상적인 문서 초안에는 보통 충분합니다. 결정하기 전에 자사 업무로 테스트하세요. 엔진 선택은 [Ollama vs vLLM vs TGI 벤치마크](/ko/ollama-vs-vllm-vs-tgi-rtx-4090-benchmark/)에서, 모델을 자사 문서에 맞추는 방법은 [비공개 LLM 파인튜닝 가이드](/ko/private-llm-fine-tuning-guide/)에서 다룹니다.

많은 기업이 택하는 중간 경로도 있습니다. 이미 쓰고 있는 클라우드 계정 안의 GPU 인스턴스에서 오픈 모델을 돌리는 것입니다. 그러면 클라우드 제공자는 다른 모든 서비스를 위해 이미 협상해 둔 DPA에 따른 수탁자가 되고, 모델 업체는 전혀 관여하지 않습니다.

## 대여 GPU와 GPUFlow의 자리

GPU 마켓플레이스는 시장의 저가 영역이고, 이 비교에 넣으려면 분명한 설명이 붙어야 합니다.

GPUFlow도 그중 하나입니다. GPU를 몇 시간 단위로 빌리고, 제공자가 그 GPU에서 (보통 Ollama로) 돌리는 오픈 모델용 OpenAI 호환 API 키를 받습니다. 모델은 제공자의 개인 컴퓨터에서 돌아갑니다. 즉 대여가 진행되는 동안 프롬프트와 답변이 그 머신을 평문으로 거칩니다. GPUFlow 약관은 제공자가 대여자의 요청이나 답변을 기록, 열람, 보관, 공유하는 것을 금지하고, GPUFlow 자체도 텍스트를 저장하지 않습니다. 하지만 제공자는 그 머신의 root 권한을 가지고 있고, 기록 금지 규칙은 계약으로 강제될 뿐 기술적으로 막는 장치는 없습니다.

그래서 GPUFlow는 규제 대상 데이터나 기밀 데이터를 위한 답이 **아닙니다**. 고객 기록, 건강 데이터, 중요한 소스 코드, 고객 계약이 제한하는 자료는 보내지 마세요. 저희 문서는 더 단도직입적입니다. 비밀번호, 카드 번호, 낯선 사람과 공유하지 않을 비밀은 보내지 마세요.

잘 맞는 곳은 이렇습니다. 카드를 사기 전에 실제 하드웨어에서 오픈 모델을 시험해 보기, 공개 데이터나 합성 데이터로 프롬프트를 돌려 보기, 자체 서버로 연결하기 전에 OpenAI 호환 API를 대상으로 앱을 만들고 테스트하기. 다른 마켓플레이스의 커뮤니티 클라우드 머신도 업로드하는 모든 것에 대해 같은 문제를 안고 있습니다. 그쪽은 [공용 GPU 노드에서 데이터셋 보호하기](/ko/how-to-secure-dataset-on-public-gpu-node/)에서 다룹니다.

## 직원들이 실제로 지킬 정책

대안 없는 일괄 금지는 대부분 사용을 개인 휴대폰으로 옮길 뿐이고, 그곳은 더 보이지 않습니다. 기억할 수 있을 만큼 짧은 정책이 더 잘 통합니다.

| 데이터 등급 | 예시 | 허용 도구 |
| --- | --- | --- |
| 공개 | 공개 문서, 마케팅 문구 | 소비자용 앱을 포함한 모든 승인 도구 |
| 내부 | 정책, 사내 위키, 민감하지 않은 코드 | DPA가 있고 학습이 꺼진 비즈니스 요금제 |
| 기밀 | 고객 데이터, 영업 비밀, 거래 조건 | 자사 테넌트의 클라우드 엔드포인트 또는 자체 호스팅 |
| 규제 대상 | 건강 데이터, 카드 데이터, 대량의 개인정보 | 자체 호스팅 또는 해당 계약(BAA, DPA)을 맺은 업체 |

그다음 눈에 띄지 않는 일을 하세요.

1. 비즈니스 요금제나 클라우드 엔드포인트 하나를 구매해 기본 도구로 정하고, 퇴사자 계정이 닫히도록 싱글 사인온을 연결하세요.
2. 보존 기간을 기록 보관 의무를 충족하는 가장 짧은 기간으로 설정하고, 관리 콘솔에서 학습이 꺼져 있는지 확인하세요.
3. 승인된 도구가 가동된 뒤에야 관리 기기에서 소비자용 AI 채팅 사이트를 차단하세요.
4. AI 사용 목록을 관리하세요. 채용, 신용 등 그와 비슷한 결정에 관여하는 것은 2027년 12월 전에 별도 검토가 필요합니다.
5. 하지 말아야 할 것만이 아니라 대신 무엇을 해야 하는지 알려 주세요. Samsung의 공지는 데이터가 이미 나간 뒤에 나왔습니다.

자체 호스팅과 토큰당 과금 서비스의 운영 비용 비교는 [시간제 GPU와 토큰당 API 중 무엇이 나을까?](/ko/hourly-gpu-vs-per-token-api/)를 보세요.

## 출처

- Samsung 제한 조치와 설문: [CNBC, 2023년 5월 2일](https://www.cnbc.com/2023/05/02/samsung-bans-use-of-ai-like-chatgpt-for-staff-after-misuse-of-chatbot.html); 사고 세부 내용: [The Register, 2023년 5월 2일](https://www.theregister.com/2023/05/02/samsung_generative_ai_ban/)
- Apple과 다른 기업들: [TechCrunch, 2023년 5월 19일](https://techcrunch.com/2023/05/19/apple-reportedly-limits-internal-use-of-ai-powered-tools-like-chatgpt-and-github-copilot/)
- JPMorgan LLM Suite: [JPMorganChase 기술 블로그, 2025년 6월 3일](https://www.jpmorganchase.com/about/technology/blog/llmsuite-ab-award)
- OpenAI 비즈니스 약관: [엔터프라이즈 개인정보 보호](https://openai.com/enterprise-privacy/); 소비자용 학습 설정: [모델 성능 개선에 데이터가 쓰이는 방식](https://help.openai.com/en/articles/5722486-how-your-data-is-used-to-improve-model-performance)
- NYT 보존 명령: [OpenAI, NYT 데이터 요구에 대한 입장](https://openai.com/index/response-to-nyt-data-demands/)
- Anthropic: [상업용 데이터와 학습](https://privacy.claude.com/en/articles/7996868-is-my-data-used-for-model-training), [소비자 데이터와 학습](https://privacy.claude.com/en/articles/10023580-is-my-data-used-for-model-training)
- Microsoft: [Microsoft 365 Copilot과 Copilot Chat의 엔터프라이즈 데이터 보호](https://learn.microsoft.com/en-us/copilot/microsoft-365/enterprise-data-protection), [Azure가 판매하는 Foundry 모델의 데이터, 개인정보, 보안](https://learn.microsoft.com/en-us/azure/ai-foundry/responsible-ai/openai/data-privacy)
- Google: [Google Workspace 생성형 AI 개인정보 보호 허브](https://knowledge.workspace.google.com/admin/generative-ai/generative-ai-in-google-workspace-privacy-hub)
- AWS: [Amazon Bedrock의 데이터 보호](https://docs.aws.amazon.com/bedrock/latest/userguide/data-protection.html)
- GDPR 제28조: [gdpr-info.eu](https://gdpr-info.eu/art-28-gdpr/)
- 데이터 프라이버시 프레임워크 판결: [Jones Day, 2025년 9월](https://www.jonesday.com/en/insights/2025/09/eu-general-court-upholds-euus-data-privacy-framework); 항소: [Digital Policy Alert](https://digitalpolicyalert.org/event/35459-latombe-filed-appeal-against-general-court-dismissal-of-challenge-to-european-unionunited-states-data-protection-framework-adequacy-decision-in-latombe-v-commission)
- Garante 과징금: [The Hacker News, 2024년 12월](https://thehackernews.com/2024/12/italy-fines-openai-15-million-for.html)
- HIPAA와 클라우드 제공자: [HHS, HIPAA와 클라우드 컴퓨팅 가이드](https://www.hhs.gov/hipaa/for-professionals/special-topics/health-information-technology/cloud-computing/index.html)
- FINRA: [Regulatory Notice 24-09](https://www.finra.org/rules-guidance/notices/24-09)
- EU AI Act: [유럽연합 집행위원회, AI Act](https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai); Omnibus: [White & Case, EU AI Omnibus 발효](https://www.whitecase.com/insight-alert/eu-ai-omnibus-enters-force-amending-ai-act)
- GPUFlow: [API 빠른 시작](https://docs.gpuflow.app/ko/renters/api-quickstart/), [대여자가 접근할 수 있는 것과 없는 것](https://docs.gpuflow.app/ko/providers/security/), [약관](https://gpuflow.app/ko/terms), [개인정보 처리방침](https://gpuflow.app/ko/privacy)

모두 2026년 9월에 확인했습니다.
