---
title: "Por que as empresas proíbem o ChatGPT no trabalho e o que usam no lugar"
description: "Empresas restringem apps públicos de chat com IA porque funcionários colam dados que a empresa não tem contrato para compartilhar. Os casos reais, as regras de 2026 e alternativas que funcionam."
excerpt: "A maioria das proibições do ChatGPT nas empresas tem a ver com contratos e configurações padrão. Veja o que deu errado na Samsung, o que os planos empresariais prometem hoje e para onde vai o seu prompt em cada opção."
pubDate: 2026-02-26
updatedDate: 2026-09-30
locale: "pt_br"
category: "case-studies"
featured: false
draft: false
author: "GPUFlow Team"
heroImage: "../_images/corporate-ai-policy-restriction.png"
heroImageAlt: "Escritório corporativo com símbolos digitais de cadeado sobre as telas dos computadores, representando restrições de acesso à IA"
faq:
  - question: "Por que as empresas proíbem o ChatGPT para os funcionários?"
    answer: "Porque os funcionários colam dados da empresa e de clientes numa conta pessoal com a qual a empresa não tem contrato. Nos planos de consumidor do ChatGPT, o padrão permite que a OpenAI use o conteúdo para melhorar os modelos, e não há acordo de processamento de dados nem BAA da HIPAA cobrindo a empresa."
  - question: "O ChatGPT Enterprise treina com os dados da empresa?"
    answer: "Não, não por padrão. A página de privacidade corporativa da OpenAI diz que ela não treina com dados do ChatGPT Enterprise, Business, Edu ou da API, a menos que o cliente autorize, e cita auditorias SOC 2 Type 2 e retenção controlada pelo administrador no Enterprise."
  - question: "Quais empresas restringiram o ChatGPT?"
    answer: "A Samsung restringiu a IA generativa nos dispositivos da empresa em 2023, depois de vazamentos noticiados de código-fonte e dados internos. Apple, JPMorgan, Bank of America, Citi, Deutsche Bank, Goldman Sachs, Wells Fargo, Walmart e Verizon também teriam restringido o uso naquele ano, segundo a imprensa."
  - question: "É legal colocar dados de clientes no ChatGPT sob o GDPR?"
    answer: "Só com uma base legal e um contrato com o operador que atenda ao artigo 28 do GDPR. Um plano empresarial com acordo de processamento de dados pode atender; a conta pessoal de um funcionário não, porque a empresa não tem contrato com o fornecedor para essa conta."
  - question: "Quando as regras de alto risco do AI Act da UE passam a valer?"
    answer: "Depois da emenda AI Omnibus, que entrou em vigor em 27 de julho de 2026, as regras de alto risco para sistemas independentes, como triagem de currículos, valem a partir de 2 de dezembro de 2027, e para IA em produtos regulados a partir de 2 de agosto de 2028. Os deveres de transparência do artigo 50 valem desde 2 de agosto de 2026."
  - question: "Posso usar o GPUFlow para dados confidenciais da empresa?"
    answer: "Não. No GPUFlow o modelo roda no computador do próprio provedor, então os prompts e as respostas passam por essa máquina em texto puro. Os termos proíbem os provedores de registrá-los, mas essa é uma regra contratual, não um bloqueio técnico, então use-o só para dados que você poderia compartilhar com um desconhecido."
---

A maioria das empresas que "proíbem o ChatGPT" não tem nada contra IA. O problema é o funcionário colar dados da empresa numa conta pessoal com a qual a empresa não tem contrato, e onde, por padrão, o fornecedor pode usá-los para melhorar os modelos. A solução habitual é uma ferramenta aprovada: um plano empresarial com cláusulas de não treinamento e de retenção, um endpoint de modelo dentro da conta de nuvem da própria empresa, ou um modelo de pesos abertos num hardware que a empresa opera. Com o contrato certo, as ferramentas públicas servem para muita coisa.

A seguir: o que aconteceu de fato nos casos que todo mundo cita, quais regras valem em 2026, o que dizem hoje os termos empresariais de cada fornecedor e para onde vai o seu texto em cada opção. Tudo foi conferido em fontes primárias em setembro de 2026; elas estão listadas no final.

## O que aconteceu na Samsung e nos bancos

A Samsung é o caso que todo mundo cita. No começo de 2023, a divisão de semicondutores liberou o ChatGPT para os engenheiros. A imprensa coreana noticiou depois três incidentes separados: funcionários colaram código-fonte para corrigir bugs, usaram a ferramenta para escrever atas de reunião e inseriram dados de medição de equipamentos e de rendimento. Na época, a Samsung não confirmou os detalhes. No fim de abril de 2023, um memorando avisou os funcionários de uma das maiores divisões que a IA generativa estava temporariamente restrita nos computadores da empresa. Numa pesquisa interna feita no mês anterior, 65% dos participantes tinham dito que estavam preocupados com os riscos de segurança.

A Apple restringiu o ChatGPT e o GitHub Copilot em maio de 2023, segundo o Wall Street Journal, por medo de que dados confidenciais acabassem com desenvolvedores que treinam modelos com dados dos usuários. As mesmas reportagens citaram JPMorgan, Bank of America, Citi, Deutsche Bank, Goldman Sachs, Wells Fargo, Walmart e Verizon entre as empresas que restringiram o ChatGPT.

Duas coisas nesses casos passam fácil despercebidas.

Primeiro, ninguém foi hackeado. Os dados foram exatamente para onde o funcionário os mandou. A preocupação era o que acontece depois: quem guarda, por quanto tempo, se aquilo treina um modelo e se um tribunal pode obrigar o fornecedor a entregar.

Segundo, as proibições não duraram como proibições. O JPMorgan construiu uma plataforma interna própria, a LLM Suite, que dá aos funcionários acesso a grandes modelos de linguagem "em um ambiente seguro". Ela foi lançada no meio de 2024 e chegou a 200.000 usuários habilitados em oito meses. Esse é o caminho típico: bloquear o app de consumidor e depois dar às pessoas algo aprovado.

## Qual é o risco de verdade

Quando um funcionário usa uma conta pessoal de consumidor, quatro problemas diferentes se somam.

**Treinamento por padrão.** No ChatGPT Free, Plus e Pro, o conteúdo pode ser usado para melhorar os modelos da OpenAI, a menos que o usuário desligue "Improve the model for everyone" em Data controls. Se o usuário clicar no joinha para cima ou para baixo, a conversa inteira pode ser usada mesmo depois de ele ter desativado a opção. Os planos de consumidor do Claude, da Anthropic, usam as conversas para treinamento se o usuário permitir a melhoria do modelo. Ou seja, se o seu código-fonte vai parar num conjunto de treino depende de uma configuração na conta de outra pessoa.

**Retenção que você não controla.** Os dados empresariais na plataforma da OpenAI são apagados em até 30 dias depois que o usuário os apaga, "a menos que sejamos legalmente obrigados a retê-los". Essa última cláusula não é teórica. No processo do New York Times, uma ordem judicial de junho de 2025 a 26 de setembro de 2025 obrigou a OpenAI a guardar conteúdo do ChatGPT de consumidor e da API padrão que de outra forma teria sido apagado. Clientes do ChatGPT Enterprise, do Edu e da API com retenção zero de dados não foram afetados.

**Nenhum contrato.** Este é o que mais pesa juridicamente. Pelo GDPR, uma empresa que deixa um fornecedor tratar dados pessoais precisa usar um operador que ofereça "garantias suficientes" e precisa ter um contrato vinculante com ele (artigo 28). Um prestador de serviços de saúde precisa de um business associate agreement (BAA). A conta pessoal de um funcionário não tem nenhum dos dois, então a violação acontece no momento em que o texto é colado, vaze alguma coisa depois ou não.

**Nenhum registro.** Empresas reguladas precisam supervisionar e arquivar as comunicações de negócio. Uma conversa numa conta pessoal fica fora de todos os arquivos que a área de compliance mantém.

## As regras que valem em 2026

### GDPR

Dados pessoais de clientes ou funcionários da UE num prompt são tratamento de dados. Isso exige uma base legal, um contrato com o operador nos termos do artigo 28 e um caminho legal para qualquer transferência para fora da UE. Para fornecedores americanos, o EU-US Data Privacy Framework continua válido: o Tribunal Geral da UE rejeitou a contestação Latombe em 3 de setembro de 2025 (processo T-553/23). Há um recurso pendente no Tribunal de Justiça, o C-703/25 P, então vale acompanhar.

Os reguladores já agiram diretamente contra serviços de chat. O Garante italiano bloqueou temporariamente o ChatGPT no fim de março de 2023 e, em dezembro de 2024, multou a OpenAI em 15 milhões de euros por tratar dados pessoais para treinar o ChatGPT sem base legal adequada, não notificar uma violação de março de 2023, ter pouca transparência e não verificar a idade dos usuários. A OpenAI chamou a multa de desproporcional e disse que ia recorrer.

### HIPAA

Qualquer serviço que receba, armazene ou transmita informações de saúde protegidas em formato eletrônico em nome de uma entidade coberta é um business associate e precisa de um BAA assinado. O HHS deixa claro que um provedor de nuvem que só guarda dados criptografados e não tem a chave continua sendo um business associate. A OpenAI diz que pode assinar BAAs para a API dela. A conta pessoal de ChatGPT de um médico não vem com BAA nenhum.

### Serviços financeiros

O Regulatory Notice 24-09 da FINRA (27 de junho de 2024) diz que as regras dela valem para IA generativa "da mesma forma que valem quando as firmas associadas usam qualquer outra tecnologia ou ferramenta". Supervisão, comunicação com o público e guarda de registros continuam valendo. A maior parte das restrições dos bancos em 2023 veio exatamente daí.

### AI Act da UE

O AI Act entrou em vigor em 1º de agosto de 2024. As proibições de práticas vedadas e o dever de letramento em IA passaram a valer em 2 de fevereiro de 2025, e as obrigações para fornecedores de modelos de IA de uso geral em 2 de agosto de 2025. A emenda AI Omnibus, Regulamento (UE) 2026/1744, foi publicada em 24 de julho de 2026 e entrou em vigor em 27 de julho de 2026. Ela mudou os prazos de alto risco: 2 de dezembro de 2027 para sistemas de alto risco independentes, o que inclui IA usada em contratação, como triagem de currículos, e 2 de agosto de 2028 para IA embutida em produtos regulados. Os deveres de transparência do artigo 50 passaram a valer no prazo previsto, em 2 de agosto de 2026, e o dever de letramento em IA foi suavizado para a adoção de medidas que o "apoiem".

Para uma empresa que usa um assistente de chat para rascunhar e-mails, o AI Act acrescenta pouco. Se o mesmo assistente começar a classificar candidatos a vagas, você está implantando um sistema de alto risco, e o prazo de dezembro de 2027 vale para você.

## O que os planos empresariais prometem

Todo grande fornecedor vende hoje uma linha empresarial com padrões diferentes dos do app de consumidor. A tabela resume o que a própria página de cada fornecedor dizia em setembro de 2026.

| Oferta | Treina com seus dados por padrão? | Retenção e controle | Observações de conformidade |
| --- | --- | --- | --- |
| ChatGPT Free, Plus, Pro | Pode, a menos que o usuário desative | Por conta de usuário | Nenhum contrato com a empresa |
| ChatGPT Business, Enterprise, Edu | Não | Os administradores do workspace definem a retenção | SOC 2 Type 2 para Enterprise e Business |
| API da OpenAI | Não | Apagado depois de 30 dias; retenção zero de dados para usos elegíveis | BAA disponível |
| Claude Team, Enterprise, API | Não | Feedback pode ser guardado por até 5 anos; os donos podem desligar o feedback | Termos comerciais |
| Microsoft 365 Copilot e Copilot Chat | Não, não é usado para treinar modelos de base | Suas políticas de retenção, rótulos e auditoria valem | DPA, EU Data Boundary (modelos da Anthropic excluídos) |
| Gemini no Google Workspace | Não é usado para treinamento fora do seu domínio sem permissão | Os controles existentes do Workspace valem | Suporte a HIPAA, FedRAMP High |

Os endpoints de modelo dentro das grandes nuvens vão além. A Microsoft diz que os prompts e as respostas dos modelos vendidos pelo Azure no Microsoft Foundry "NÃO ficam disponíveis para a OpenAI nem para outros provedores" e são processados dentro da geografia que você escolher, a menos que você opte por uma implantação Global ou DataZone. No Amazon Bedrock, os modelos rodam em contas de implantação que os provedores dos modelos não conseguem acessar, então eles nunca veem os seus prompts nem as respostas.

O que um plano empresarial não muda: o texto continua nos servidores do fornecedor pelo tempo que os termos de retenção permitirem, e uma ordem judicial continua podendo alcançá-lo. É a mesma confiança que você já deposita nos seus provedores de e-mail e de documentos. Para a maior parte do trabalho interno, é uma troca razoável. Para segredos comerciais, dados regulados sem BAA ou material que um contrato com cliente proíbe enviar a suboperadores, talvez não seja.

## Para onde vai o seu prompt em cada opção

O jeito honesto de comparar as opções é seguir um prompt e perguntar quem consegue lê-lo.

<figure>
<svg viewBox="0 0 720 470" role="img" aria-labelledby="d1-title" xmlns="http://www.w3.org/2000/svg" font-family="system-ui, sans-serif" font-size="15">
<title id="d1-title">Para onde vai o prompt de um funcionário em cinco configurações diferentes de IA, e o que o protege em cada uma</title>
<rect x="0" y="0" width="720" height="470" fill="#ffffff"/>
<text x="325" y="30" text-anchor="middle" fill="#64748b">Para onde o texto vai</text>
<text x="475" y="30" fill="#64748b">O que o protege</text>
<rect x="20" y="200" width="140" height="70" rx="10" fill="#eef2ff" stroke="#6366f1" stroke-width="2"/>
<text x="90" y="231" text-anchor="middle" fill="#1e1b4b">Prompt do</text>
<text x="90" y="252" text-anchor="middle" fill="#1e1b4b">funcionário</text>
<line x1="160" y1="235" x2="200" y2="80" stroke="#6366f1" stroke-width="2"/>
<line x1="160" y1="235" x2="200" y2="160" stroke="#6366f1" stroke-width="2"/>
<line x1="160" y1="235" x2="200" y2="240" stroke="#6366f1" stroke-width="2"/>
<line x1="160" y1="235" x2="200" y2="320" stroke="#6366f1" stroke-width="2"/>
<line x1="160" y1="235" x2="200" y2="400" stroke="#6366f1" stroke-width="2"/>
<rect x="200" y="50" width="250" height="60" rx="10" fill="#ffffff" stroke="#f97316" stroke-width="2"/>
<text x="325" y="76" text-anchor="middle" fill="#1e1b4b">App de chat de consumidor</text>
<text x="325" y="97" text-anchor="middle" fill="#64748b" font-size="13">conta pessoal Free, Plus ou Pro</text>
<text x="475" y="76" fill="#1e1b4b" font-size="14">Treino permitido por padrão</text>
<text x="475" y="97" fill="#1e1b4b" font-size="14">Sem contrato com a sua empresa</text>
<rect x="200" y="130" width="250" height="60" rx="10" fill="#eef2ff" stroke="#6366f1" stroke-width="2"/>
<text x="325" y="156" text-anchor="middle" fill="#1e1b4b" font-size="14">Plano empresarial do fornecedor</text>
<text x="325" y="177" text-anchor="middle" fill="#64748b" font-size="12">servidor do fornecedor, conta da empresa</text>
<text x="475" y="156" fill="#1e1b4b" font-size="14">Sem treino por padrão</text>
<text x="475" y="177" fill="#1e1b4b" font-size="14">DPA, controles de retenção</text>
<rect x="200" y="210" width="250" height="60" rx="10" fill="#eef2ff" stroke="#6366f1" stroke-width="2"/>
<text x="325" y="236" text-anchor="middle" fill="#1e1b4b">Endpoint na sua nuvem</text>
<text x="325" y="257" text-anchor="middle" fill="#64748b" font-size="13">Azure Foundry, Amazon Bedrock</text>
<text x="475" y="236" fill="#1e1b4b" font-size="14">Seu tenant e sua região</text>
<text x="475" y="257" fill="#1e1b4b" font-size="14">O criador do modelo nunca vê</text>
<rect x="200" y="290" width="250" height="60" rx="10" fill="#ffffff" stroke="#16a34a" stroke-width="2"/>
<text x="325" y="316" text-anchor="middle" fill="#1e1b4b">Seus próprios servidores</text>
<text x="325" y="337" text-anchor="middle" fill="#64748b" font-size="13">modelo aberto, na sua rede</text>
<text x="475" y="316" fill="#1e1b4b" font-size="14">Nada sai da sua rede</text>
<text x="475" y="337" fill="#1e1b4b" font-size="14">Você opera e atualiza tudo</text>
<rect x="200" y="370" width="250" height="60" rx="10" fill="#ffffff" stroke="#f97316" stroke-width="2"/>
<text x="325" y="396" text-anchor="middle" fill="#1e1b4b" font-size="14">GPU de marketplace (GPUFlow)</text>
<text x="325" y="417" text-anchor="middle" fill="#64748b" font-size="13">o computador do próprio provedor</text>
<text x="475" y="396" fill="#1e1b4b" font-size="14">Texto puro nessa máquina</text>
<text x="475" y="417" fill="#1e1b4b" font-size="14">Os termos proíbem registrá-lo</text>
<text x="360" y="458" text-anchor="middle" fill="#64748b" font-size="13">Laranja: só para dados públicos. Verde: serve para tudo que a sua própria TI pode guardar.</text>
</svg>
<figcaption>O mesmo prompt, cinco destinos. Só a opção auto-hospedada o mantém dentro da sua rede; o plano empresarial e o endpoint na nuvem o mantêm sob um contrato que a sua empresa assinou.</figcaption>
</figure>

## Rodar modelos de pesos abertos por conta própria

A opção mais forte para dados confidenciais é também a que dá mais trabalho: baixar um modelo de pesos abertos (Llama, Qwen, Mistral, Gemma e outros) e rodá-lo em máquinas dentro da sua própria rede. Os prompts nunca saem. Você decide o que é registrado e por quanto tempo, o que facilita cumprir as regras de guarda de registros e de retenção do GDPR, e nenhuma cláusula de retenção ou ordem judicial de terceiros alcança os dados.

Os custos são reais, porém. Agora você opera um serviço de inferência: GPUs, um motor como o Ollama ou o vLLM, autenticação, logs, atualizações e alguém de plantão. E um modelo de 8B ou 14B que cabe numa única placa de workstation é mais fraco que um modelo de ponta em raciocínio longo. Para classificar, extrair campos, resumir documentos internos e redigir textos de rotina, normalmente dá conta. Teste nas suas próprias tarefas antes de decidir. O nosso [benchmark Ollama vs vLLM vs TGI](/pt_br/ollama-vs-vllm-vs-tgi-rtx-4090-benchmark/) trata da escolha do motor, e o [guia de fine-tuning de LLM com privacidade](/pt_br/private-llm-fine-tuning-guide/) trata de adaptar um modelo aos seus documentos.

Existe um meio-termo que muitas empresas adotam: rodar o modelo aberto em instâncias com GPU dentro da conta de nuvem que já têm. O provedor de nuvem passa a ser um operador sob um DPA que você já negociou para todo o resto, e nenhum fornecedor de modelo entra na história.

## Onde as GPUs alugadas e o GPUFlow entram

Os marketplaces de GPU são a ponta barata do mercado, e só entram nesta comparação com um rótulo bem claro.

O GPUFlow é um deles. Você aluga uma GPU por um número de horas e recebe uma chave de API compatível com a OpenAI para o modelo aberto que o provedor roda nela, normalmente pelo Ollama. O modelo roda no computador do próprio provedor. Isso significa que os seus prompts e as respostas passam por essa máquina em texto puro enquanto o aluguel dura. Os termos do GPUFlow proíbem os provedores de registrar, ler, guardar ou compartilhar as requisições e respostas dos locatários, e o próprio GPUFlow não guarda o texto. Mas o provedor tem acesso root à máquina, e a regra contra o registro é garantida por contrato; nada técnico impede.

Então o GPUFlow **não** é a resposta para dados regulados ou confidenciais. Não mande cadastros de clientes, dados de saúde, código-fonte que importa nem nada que um contrato com cliente restrinja. A nossa própria documentação diz isso de forma ainda mais direta: não envie senhas, números de cartão nem outros segredos que você não compartilharia com um desconhecido.

Onde ele serve: testar um modelo aberto em hardware de verdade antes de comprar uma placa, rodar prompts sobre dados públicos ou sintéticos, e construir e testar um app contra uma API compatível com a OpenAI antes de apontá-lo para o seu próprio servidor. Máquinas de community cloud em outros marketplaces levantam a mesma questão para tudo o que você sobe; [como proteger um dataset em um nó de GPU público](/pt_br/how-to-secure-dataset-on-public-gpu-node/) trata desse lado.

## Uma política que as pessoas vão seguir de fato

Uma proibição pura, sem alternativa, na maioria das vezes só leva o uso para o celular pessoal, onde você enxerga ainda menos. Funciona melhor algo curto o bastante para ser lembrado:

| Classe de dado | Exemplos | Ferramentas permitidas |
| --- | --- | --- |
| Público | Documentos publicados, textos de marketing | Qualquer ferramenta aprovada, inclusive apps de consumidor |
| Interno | Políticas, wikis internas, código não sensível | Planos empresariais com DPA e treino desligado |
| Confidencial | Dados de clientes, segredos comerciais, termos de negócios | Endpoint de nuvem no seu tenant, ou auto-hospedado |
| Regulado | Dados de saúde, dados de cartão, dados pessoais em escala | Auto-hospedado, ou um fornecedor com o acordo específico (BAA, DPA) |

Depois, faça a parte sem glamour:

1. Contrate um plano empresarial ou um endpoint de nuvem e torne-o o padrão, com single sign-on para que as contas sejam encerradas quando as pessoas saírem.
2. Defina a retenção no menor prazo que atenda às suas obrigações de guarda de registros e confirme no console de administração que o treino está desligado.
3. Bloqueie os sites de chat com IA de consumidor nos dispositivos gerenciados só depois que a ferramenta aprovada estiver no ar.
4. Mantenha um inventário dos usos de IA. Tudo o que tocar em contratação, crédito ou decisões parecidas precisa de uma revisão separada antes de dezembro de 2027.
5. Diga às pessoas o que fazer, e não só o que não fazer. O memorando da Samsung chegou depois que os dados já tinham saído.

Para o custo de operação de hospedar por conta própria em comparação com serviços pagos por token, veja [GPU por hora ou API por token?](/pt_br/hourly-gpu-vs-per-token-api/).

## Fontes

- Restrição e pesquisa da Samsung: [CNBC, 2 de maio de 2023](https://www.cnbc.com/2023/05/02/samsung-bans-use-of-ai-like-chatgpt-for-staff-after-misuse-of-chatbot.html); detalhes dos incidentes: [The Register, 2 de maio de 2023](https://www.theregister.com/2023/05/02/samsung_generative_ai_ban/)
- Apple e outras empresas: [TechCrunch, 19 de maio de 2023](https://techcrunch.com/2023/05/19/apple-reportedly-limits-internal-use-of-ai-powered-tools-like-chatgpt-and-github-copilot/)
- LLM Suite do JPMorgan: [blog de tecnologia do JPMorganChase, 3 de junho de 2025](https://www.jpmorganchase.com/about/technology/blog/llmsuite-ab-award)
- Termos empresariais da OpenAI: [privacidade corporativa](https://openai.com/enterprise-privacy/); configurações de treino para consumidores: [como os seus dados são usados para melhorar o desempenho do modelo](https://help.openai.com/en/articles/5722486-how-your-data-is-used-to-improve-model-performance)
- Ordem de preservação no caso NYT: [OpenAI, resposta às exigências de dados do NYT](https://openai.com/index/response-to-nyt-data-demands/)
- Anthropic: [dados comerciais e treinamento](https://privacy.claude.com/en/articles/7996868-is-my-data-used-for-model-training), [dados de consumidores e treinamento](https://privacy.claude.com/en/articles/10023580-is-my-data-used-for-model-training)
- Microsoft: [proteção de dados corporativos no Microsoft 365 Copilot e no Copilot Chat](https://learn.microsoft.com/en-us/copilot/microsoft-365/enterprise-data-protection), [dados, privacidade e segurança dos Foundry Models vendidos pelo Azure](https://learn.microsoft.com/en-us/azure/ai-foundry/responsible-ai/openai/data-privacy)
- Google: [Central de privacidade da IA generativa no Google Workspace](https://knowledge.workspace.google.com/admin/generative-ai/generative-ai-in-google-workspace-privacy-hub)
- AWS: [proteção de dados no Amazon Bedrock](https://docs.aws.amazon.com/bedrock/latest/userguide/data-protection.html)
- Artigo 28 do GDPR: [gdpr-info.eu](https://gdpr-info.eu/art-28-gdpr/)
- Decisão sobre o Data Privacy Framework: [Jones Day, setembro de 2025](https://www.jonesday.com/en/insights/2025/09/eu-general-court-upholds-euus-data-privacy-framework); recurso: [Digital Policy Alert](https://digitalpolicyalert.org/event/35459-latombe-filed-appeal-against-general-court-dismissal-of-challenge-to-european-unionunited-states-data-protection-framework-adequacy-decision-in-latombe-v-commission)
- Multa do Garante: [The Hacker News, dezembro de 2024](https://thehackernews.com/2024/12/italy-fines-openai-15-million-for.html)
- HIPAA e provedores de nuvem: [HHS, orientação sobre HIPAA e computação em nuvem](https://www.hhs.gov/hipaa/for-professionals/special-topics/health-information-technology/cloud-computing/index.html)
- FINRA: [Regulatory Notice 24-09](https://www.finra.org/rules-guidance/notices/24-09)
- AI Act da UE: [Comissão Europeia, AI Act](https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai); Omnibus: [White & Case, EU AI Omnibus entra em vigor](https://www.whitecase.com/insight-alert/eu-ai-omnibus-enters-force-amending-ai-act)
- GPUFlow: [guia rápido da API](https://docs.gpuflow.app/pt-br/renters/api-quickstart/), [o que os locatários conseguem e não conseguem acessar](https://docs.gpuflow.app/pt-br/providers/security/), [termos](https://gpuflow.app/pt-BR/terms), [política de privacidade](https://gpuflow.app/pt-BR/privacy)

Tudo verificado em setembro de 2026.
