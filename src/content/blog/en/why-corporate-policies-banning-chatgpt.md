---
title: "Why Companies Ban ChatGPT at Work and What They Use Instead"
description: "Companies restrict public AI chat apps because staff paste in data the firm has no contract to share. The real cases, 2026 rules and alternatives that work."
excerpt: "Most corporate ChatGPT bans are about contracts and defaults. Here is what went wrong at Samsung, what the business plans promise today, and where your prompt goes in each option."
pubDate: 2026-02-26
updatedDate: 2026-09-30
locale: "en"
category: "case-studies"
featured: false
draft: false
author: "GPUFlow Team"
heroImage: "../_images/corporate-ai-policy-restriction.png"
heroImageAlt: "Corporate office environment with digital lock symbols overlaying computer screens representing AI access restrictions"
faq:
  - question: "Why do companies ban ChatGPT for employees?"
    answer: "Because staff paste company and customer data into a consumer account the company has no contract with. On consumer ChatGPT plans the default allows OpenAI to use content to improve its models, and there is no data processing agreement or HIPAA business associate agreement covering the company."
  - question: "Does ChatGPT Enterprise train on company data?"
    answer: "No, not by default. OpenAI's enterprise privacy page says it does not train on data from ChatGPT Enterprise, Business, Edu or the API unless the customer opts in, and it lists SOC 2 Type 2 audits and admin-controlled retention for Enterprise."
  - question: "Which companies restricted ChatGPT?"
    answer: "Samsung restricted generative AI on company devices in 2023 after reported leaks of source code and internal data. Apple, JPMorgan, Bank of America, Citi, Deutsche Bank, Goldman Sachs, Wells Fargo, Walmart and Verizon were also reported to restrict it that year."
  - question: "Is it legal to put customer data into ChatGPT under GDPR?"
    answer: "Only with a lawful basis and a processor contract that meets Article 28 GDPR. A business plan with a data processing agreement can meet that; an employee's personal account cannot, because the company has no contract with the vendor for that account."
  - question: "When do the EU AI Act high-risk rules apply?"
    answer: "After the AI Omnibus amendment, which entered into force on 27 July 2026, high-risk rules for stand-alone systems such as CV screening apply from 2 December 2027 and for AI in regulated products from 2 August 2028. Transparency duties under Article 50 have applied since 2 August 2026."
  - question: "Can I use GPUFlow for confidential company data?"
    answer: "No. On GPUFlow the model runs on a provider's own computer, so prompts and answers pass through that machine in plaintext. The terms forbid providers from recording them, but that is a contract rule, not a technical block, so use it only for data you could share with a stranger."
---

Most companies that "ban ChatGPT" have nothing against AI. They object to employees pasting company data into a consumer account the company has no contract with, where by default the vendor may use it to improve its models. The usual fix is an approved tool: a business plan with no-training and retention terms, a model endpoint inside the company's own cloud account, or an open-weights model on hardware the company runs. With the right contract in place, the public tools are fine for a lot of work.

Below: what actually happened in the cases everyone quotes, which rules apply in 2026, what each vendor's business terms say today, and where your text goes in each option. Everything was checked against primary sources in September 2026; they are listed at the end.

## What happened at Samsung and the banks

Samsung is the case everyone cites. In early 2023 its semiconductor business allowed engineers to use ChatGPT. Korean media then reported three separate incidents: staff pasted source code to fix bugs, used the tool to write meeting minutes, and entered equipment measurement and yield data. Samsung did not confirm the details at the time. At the end of April 2023 a memo told staff in one of its biggest divisions that generative AI was temporarily restricted on company computers. In an internal survey the month before, 65% of respondents had said they were worried about the security risks.

Apple restricted ChatGPT and GitHub Copilot in May 2023, according to the Wall Street Journal, because it feared confidential data would end up with developers who train models on user data. The same reports listed JPMorgan, Bank of America, Citi, Deutsche Bank, Goldman Sachs, Wells Fargo, Walmart and Verizon as having restricted ChatGPT.

Two things about these cases are easy to miss.

First, nobody was hacked. The data went exactly where the employee sent it. The worry was what happens after that: who keeps it, for how long, whether it trains a model, and whether a court can make the vendor hand it over.

Second, the bans did not last as bans. JPMorgan built its own internal platform, LLM Suite, which gives staff access to large language models "in a secure environment". It was released in summer 2024 and reached 200,000 onboarded users within eight months. That is the typical arc: block the consumer app, then give people something approved.

## What the risk actually is

When an employee uses a personal consumer account, four separate problems stack up.

**Training by default.** On ChatGPT Free, Plus and Pro, content may be used to improve OpenAI's models unless the user turns off "Improve the model for everyone" in Data controls. If the user clicks thumbs up or down, the whole conversation may be used even after opting out. Anthropic's consumer Claude plans use chats for training if the user allows model improvement. So whether your source code ends up in a training set depends on one setting in someone else's account.

**Retention you don't control.** Business data on OpenAI's platform is deleted within 30 days of the user deleting it, "unless we are legally required to retain them". That last clause is real. In the New York Times lawsuit, a court order from June 2025 to 26 September 2025 required OpenAI to keep consumer ChatGPT and standard API content it would otherwise have deleted. ChatGPT Enterprise, Edu and API customers with zero data retention were not covered.

**No contract.** This one matters most legally. Under GDPR, a company that lets a vendor process personal data must use a processor that gives "sufficient guarantees" and must have a binding contract with it (Article 28). A healthcare provider needs a business associate agreement. An employee's personal account has neither, so the breach happens at the moment of pasting, whether or not anything ever leaks.

**No records.** Regulated firms must supervise and archive business communications. A chat in a personal account sits outside every archive the compliance team runs.

## The rules that apply in 2026

### GDPR

Personal data of EU customers or staff in a prompt is processing. It needs a lawful basis, a processor contract under Article 28, and a legal route for any transfer outside the EU. For US vendors the EU-US Data Privacy Framework is still valid: the EU General Court dismissed the Latombe challenge on 3 September 2025 (case T-553/23). An appeal is pending at the Court of Justice as C-703/25 P, so keep an eye on it.

Regulators have acted on chat services directly. Italy's Garante temporarily blocked ChatGPT in late March 2023, and in December 2024 it fined OpenAI €15 million for processing personal data to train ChatGPT without an adequate legal basis, not notifying a March 2023 breach, weak transparency and missing age checks. OpenAI called the fine disproportionate and said it would appeal.

### HIPAA

Any service that receives, stores or transmits electronic protected health information for a covered entity is a business associate and needs a signed BAA. HHS is explicit that a cloud provider which only holds encrypted data and has no key is still a business associate. OpenAI says it can sign BAAs for its API. A clinician's personal ChatGPT account comes with no BAA at all.

### Financial services

FINRA's Regulatory Notice 24-09 (27 June 2024) says its rules apply to generative AI "just as they apply when member firms use any other technology or tool". Supervision, communications with the public and recordkeeping all still apply. Most of the 2023 bank restrictions followed from exactly that.

### EU AI Act

The AI Act entered into force on 1 August 2024. The bans on prohibited practices and the AI literacy duty applied from 2 February 2025, and the obligations for general-purpose AI model providers from 2 August 2025. The AI Omnibus amendment, Regulation (EU) 2026/1744, was published on 24 July 2026 and entered into force on 27 July 2026. It moved the high-risk deadlines: 2 December 2027 for stand-alone high-risk systems, which include AI used in hiring such as CV sorting, and 2 August 2028 for AI built into regulated products. Transparency duties under Article 50 applied on schedule from 2 August 2026, and the AI literacy duty was softened to taking measures to "support" it.

For a company that uses a chat assistant to draft emails, the AI Act adds little. If the same assistant starts ranking job applicants, you are deploying a high-risk system and the December 2027 date applies to you.

## What the business plans promise

Every major vendor now sells a business tier with different defaults from the consumer app. The table summarises what each vendor's own page says as of September 2026.

| Offering | Trains on your data by default? | Retention and control | Compliance notes |
| --- | --- | --- | --- |
| ChatGPT Free, Plus, Pro | May, unless the user opts out | Per user account | No company contract |
| ChatGPT Business, Enterprise, Edu | No | Workspace admins set retention | SOC 2 Type 2 for Enterprise and Business |
| OpenAI API | No | Deleted after 30 days; zero data retention for eligible uses | BAA available |
| Claude Team, Enterprise, API | No | Feedback may be kept up to 5 years; owners can turn feedback off | Commercial terms |
| Microsoft 365 Copilot and Copilot Chat | No, not used to train foundation models | Your retention policies, labels and audit apply | DPA, EU Data Boundary (Anthropic models excluded) |
| Gemini in Google Workspace | Not used for training outside your domain without permission | Existing Workspace controls apply | HIPAA support, FedRAMP High |

The model endpoints inside the big clouds go further. Microsoft says prompts and completions for models sold by Azure in Microsoft Foundry are "NOT available to OpenAI or other providers" and are processed within the geography you pick, unless you choose a Global or DataZone deployment. On Amazon Bedrock, models run in deployment accounts that the model providers cannot access, so they never see your prompts or completions.

What a business plan does not change: the text still sits on the vendor's servers for as long as the retention terms allow, and a court order can still reach it. That is the same trust you already place in your email and document providers. For most internal work it is a reasonable trade. For trade secrets, regulated data without a BAA, or material a client contract forbids sending to subprocessors, it may not be.

## Where your prompt goes in each option

The honest way to compare options is to follow one prompt and ask who can read it.

<figure>
<svg viewBox="0 0 720 470" role="img" aria-labelledby="d1-title" xmlns="http://www.w3.org/2000/svg" font-family="system-ui, sans-serif" font-size="15">
<title id="d1-title">Where an employee's prompt goes in five different AI setups, and what protects it in each</title>
<rect x="0" y="0" width="720" height="470" fill="#ffffff"/>
<text x="325" y="30" text-anchor="middle" fill="#64748b">Where the text goes</text>
<text x="475" y="30" fill="#64748b">What protects it</text>
<rect x="20" y="200" width="140" height="70" rx="10" fill="#eef2ff" stroke="#6366f1" stroke-width="2"/>
<text x="90" y="231" text-anchor="middle" fill="#1e1b4b">Employee</text>
<text x="90" y="252" text-anchor="middle" fill="#1e1b4b">prompt</text>
<line x1="160" y1="235" x2="200" y2="80" stroke="#6366f1" stroke-width="2"/>
<line x1="160" y1="235" x2="200" y2="160" stroke="#6366f1" stroke-width="2"/>
<line x1="160" y1="235" x2="200" y2="240" stroke="#6366f1" stroke-width="2"/>
<line x1="160" y1="235" x2="200" y2="320" stroke="#6366f1" stroke-width="2"/>
<line x1="160" y1="235" x2="200" y2="400" stroke="#6366f1" stroke-width="2"/>
<rect x="200" y="50" width="250" height="60" rx="10" fill="#ffffff" stroke="#f97316" stroke-width="2"/>
<text x="325" y="76" text-anchor="middle" fill="#1e1b4b">Consumer chat app</text>
<text x="325" y="97" text-anchor="middle" fill="#64748b" font-size="13">personal Free, Plus or Pro account</text>
<text x="475" y="76" fill="#1e1b4b" font-size="14">Training allowed by default</text>
<text x="475" y="97" fill="#1e1b4b" font-size="14">No contract with your company</text>
<rect x="200" y="130" width="250" height="60" rx="10" fill="#eef2ff" stroke="#6366f1" stroke-width="2"/>
<text x="325" y="156" text-anchor="middle" fill="#1e1b4b">Vendor business plan</text>
<text x="325" y="177" text-anchor="middle" fill="#64748b" font-size="13">vendor's servers, company account</text>
<text x="475" y="156" fill="#1e1b4b" font-size="14">No training by default</text>
<text x="475" y="177" fill="#1e1b4b" font-size="14">DPA, retention controls</text>
<rect x="200" y="210" width="250" height="60" rx="10" fill="#eef2ff" stroke="#6366f1" stroke-width="2"/>
<text x="325" y="236" text-anchor="middle" fill="#1e1b4b">Model endpoint in your cloud</text>
<text x="325" y="257" text-anchor="middle" fill="#64748b" font-size="13">Azure Foundry, Amazon Bedrock</text>
<text x="475" y="236" fill="#1e1b4b" font-size="14">Your tenant and region</text>
<text x="475" y="257" fill="#1e1b4b" font-size="14">Model maker never sees it</text>
<rect x="200" y="290" width="250" height="60" rx="10" fill="#ffffff" stroke="#16a34a" stroke-width="2"/>
<text x="325" y="316" text-anchor="middle" fill="#1e1b4b">Your own servers</text>
<text x="325" y="337" text-anchor="middle" fill="#64748b" font-size="13">open-weights model, your network</text>
<text x="475" y="316" fill="#1e1b4b" font-size="14">Nothing leaves your network</text>
<text x="475" y="337" fill="#1e1b4b" font-size="14">You run and patch everything</text>
<rect x="200" y="370" width="250" height="60" rx="10" fill="#ffffff" stroke="#f97316" stroke-width="2"/>
<text x="325" y="396" text-anchor="middle" fill="#1e1b4b">Marketplace GPU (GPUFlow)</text>
<text x="325" y="417" text-anchor="middle" fill="#64748b" font-size="13">a provider's own computer</text>
<text x="475" y="396" fill="#1e1b4b" font-size="14">Plaintext on that machine</text>
<text x="475" y="417" fill="#1e1b4b" font-size="14">Terms forbid recording it</text>
<text x="360" y="458" text-anchor="middle" fill="#64748b" font-size="13">Orange: fine for public data only. Green: fine for anything your own IT may hold.</text>
</svg>
<figcaption>The same prompt, five destinations. Only the self-hosted option keeps it inside your network; the business plan and cloud endpoint options keep it under a contract your company signed.</figcaption>
</figure>

## Running open-weights models yourself

The strongest option for confidential data is also the most work: download an open-weights model (Llama, Qwen, Mistral, Gemma and others) and run it on machines inside your own network. Prompts never leave. You choose what gets logged and for how long, which makes recordkeeping and GDPR retention rules easier to meet, and nobody else's retention clause or court order touches the data.

The costs are real, though. You now operate an inference service: GPUs, an engine such as Ollama or vLLM, authentication, logging, updates and someone on call. And an 8B or 14B model that fits on a single workstation card is weaker than a frontier model at long reasoning. It is usually good enough for classifying, extracting fields, summarising internal documents and drafting routine text. Test it on your own tasks before you decide. Our [Ollama vs vLLM vs TGI benchmark](/en/ollama-vs-vllm-vs-tgi-rtx-4090-benchmark/) covers engine choice, and the [private LLM fine-tuning guide](/en/private-llm-fine-tuning-guide/) covers adapting a model to your documents.

There is a middle path that many firms take: run the open model on GPU instances inside the cloud account you already have. The cloud provider is then a processor under a DPA you have already negotiated for everything else, and no model vendor is involved at all.

## Where rented GPUs and GPUFlow fit

GPU marketplaces are the cheap end of the market, and they belong in this comparison only with a clear label.

GPUFlow is one of them. You rent a GPU for a number of hours and get an OpenAI-compatible API key for the open model the provider runs on it, usually through Ollama. The model runs on the provider's own computer. That means your prompts and the answers pass through that machine in plaintext while the rental runs. GPUFlow's terms forbid providers from recording, reading, keeping or sharing renters' requests or answers, and GPUFlow itself does not store the text. But the provider has root on the machine, and the rule against recording is enforced by contract; nothing technical stops it.

So GPUFlow is **not** the answer for regulated or confidential data. Don't send it customer records, health data, source code you care about, or anything a client contract restricts. Our own docs say it more bluntly: don't send passwords, card numbers or other secrets you wouldn't share with a stranger.

Where it does fit: trying an open model on real hardware before you buy a card, running prompts over public or synthetic data, and building and testing an app against an OpenAI-compatible API before you point it at your own server. Community-cloud machines on other marketplaces raise the same question for anything you upload; [How to secure your dataset on a public GPU node](/en/how-to-secure-dataset-on-public-gpu-node/) covers that side.

## A policy people will actually follow

A flat ban with no alternative mostly moves usage to personal phones, where you can see even less. What works better is short enough to remember:

| Data class | Examples | Allowed tools |
| --- | --- | --- |
| Public | Published docs, marketing copy | Any approved tool, including consumer apps |
| Internal | Policies, internal wikis, non-sensitive code | Business plans with a DPA and training off |
| Confidential | Client data, trade secrets, deal terms | Cloud endpoint in your tenant, or self-hosted |
| Regulated | Health data, card data, personal data at scale | Self-hosted, or a vendor with the specific agreement (BAA, DPA) |

Then do the unglamorous parts:

1. Buy one business plan or cloud endpoint and make it the default, with single sign-on so accounts close when people leave.
2. Set retention to the shortest period that meets your recordkeeping duties, and confirm training is off in the admin console.
3. Block consumer AI chat sites on managed devices only once the approved tool is live.
4. Keep an inventory of AI uses. Anything touching hiring, credit or similar decisions needs a separate review before December 2027.
5. Tell people what to do instead of only what not to do. The Samsung memo arrived after the data had left.

For the running cost side of self-hosting versus per-token services, see [Hourly GPU or per-token API?](/en/hourly-gpu-vs-per-token-api/).

## Sources

- Samsung restriction and survey: [CNBC, 2 May 2023](https://www.cnbc.com/2023/05/02/samsung-bans-use-of-ai-like-chatgpt-for-staff-after-misuse-of-chatbot.html); incident details: [The Register, 2 May 2023](https://www.theregister.com/2023/05/02/samsung_generative_ai_ban/)
- Apple and other companies: [TechCrunch, 19 May 2023](https://techcrunch.com/2023/05/19/apple-reportedly-limits-internal-use-of-ai-powered-tools-like-chatgpt-and-github-copilot/)
- JPMorgan LLM Suite: [JPMorganChase technology blog, 3 June 2025](https://www.jpmorganchase.com/about/technology/blog/llmsuite-ab-award)
- OpenAI business terms: [Enterprise privacy](https://openai.com/enterprise-privacy/); consumer training settings: [How your data is used to improve model performance](https://help.openai.com/en/articles/5722486-how-your-data-is-used-to-improve-model-performance)
- NYT preservation order: [OpenAI, response to NYT data demands](https://openai.com/index/response-to-nyt-data-demands/)
- Anthropic: [commercial data and training](https://privacy.claude.com/en/articles/7996868-is-my-data-used-for-model-training), [consumer data and training](https://privacy.claude.com/en/articles/10023580-is-my-data-used-for-model-training)
- Microsoft: [Enterprise data protection in Microsoft 365 Copilot and Copilot Chat](https://learn.microsoft.com/en-us/copilot/microsoft-365/enterprise-data-protection), [Data, privacy and security for Foundry Models sold by Azure](https://learn.microsoft.com/en-us/azure/ai-foundry/responsible-ai/openai/data-privacy)
- Google: [Generative AI in Google Workspace Privacy Hub](https://knowledge.workspace.google.com/admin/generative-ai/generative-ai-in-google-workspace-privacy-hub)
- AWS: [Data protection in Amazon Bedrock](https://docs.aws.amazon.com/bedrock/latest/userguide/data-protection.html)
- GDPR Article 28: [gdpr-info.eu](https://gdpr-info.eu/art-28-gdpr/)
- Data Privacy Framework ruling: [Jones Day, September 2025](https://www.jonesday.com/en/insights/2025/09/eu-general-court-upholds-euus-data-privacy-framework); appeal: [Digital Policy Alert](https://digitalpolicyalert.org/event/35459-latombe-filed-appeal-against-general-court-dismissal-of-challenge-to-european-unionunited-states-data-protection-framework-adequacy-decision-in-latombe-v-commission)
- Garante fine: [The Hacker News, December 2024](https://thehackernews.com/2024/12/italy-fines-openai-15-million-for.html)
- HIPAA and cloud providers: [HHS, Guidance on HIPAA and cloud computing](https://www.hhs.gov/hipaa/for-professionals/special-topics/health-information-technology/cloud-computing/index.html)
- FINRA: [Regulatory Notice 24-09](https://www.finra.org/rules-guidance/notices/24-09)
- EU AI Act: [European Commission, AI Act](https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai); Omnibus: [White & Case, EU AI Omnibus enters into force](https://www.whitecase.com/insight-alert/eu-ai-omnibus-enters-force-amending-ai-act)
- GPUFlow: [API quickstart](https://docs.gpuflow.app/renters/api-quickstart/), [What renters can and can't reach](https://docs.gpuflow.app/providers/security/), [Terms](https://gpuflow.app/en/terms), [Privacy policy](https://gpuflow.app/en/privacy)

All checked in September 2026.
