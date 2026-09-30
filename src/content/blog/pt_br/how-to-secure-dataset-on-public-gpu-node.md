---
title: "Como proteger seu dataset em um nó de GPU alugado ou público"
description: "O host de uma GPU alugada consegue ler tudo o que o seu trabalho descriptografa. O que criptografia, secure cloud e confidential computing na H100 resolvem, e como limpar tudo depois."
excerpt: "Alugar uma GPU significa que outra pessoa tem root na máquina que guarda os seus dados. Aqui está o modelo de ameaças, o que cada defesa cobre de verdade e uma rotina de limpeza que funciona em discos modernos."
pubDate: 2026-02-26
updatedDate: 2026-09-30
locale: "pt_br"
category: "guides"
featured: false
draft: false
author: "GPUFlow Team"
authorUrl: "https://gpuflow.app"
heroImage: "../_images/secure-server-room-abstract.png"
heroImageAlt: "Ambiente de servidores seguro e abstrato, representando o processamento protegido de dados de IA"
faq:
  - question: "O host de uma GPU alugada consegue ver os meus dados?"
    answer: "Tecnicamente, sim. O host tem root na máquina física, e os seus dados precisam ser descriptografados na memória para treinar ou rodar um modelo. Só o confidential computing, como as VMs confidenciais com H100 no Azure ou no Google Cloud, tira o host dessa equação."
  - question: "O shred apaga arquivos com segurança numa instância de GPU na nuvem?"
    answer: "Não de forma confiável. O manual do GNU shred diz que ele só funciona se o sistema de arquivos e o hardware sobrescreverem os dados no mesmo lugar, o que sistemas de arquivos com journaling e copy-on-write, snapshots e SSDs não garantem. Criptografe os dados antes que cheguem ao disco e destrua a instância."
  - question: "Qual é a diferença entre o Secure Cloud e o Community Cloud do RunPod?"
    answer: "A documentação do RunPod descreve o Secure Cloud como rodando em data centers T3/T4 e adequado para produção e dados sensíveis, e o Community Cloud como provedores peer-to-peer com confiabilidade variável. O RunPod não aceita mais novos hosts no Community Cloud."
  - question: "Quais GPUs na nuvem suportam confidential computing?"
    answer: "Em setembro de 2026, o Azure oferece VMs confidenciais NCCads H100 v5 com uma GPU H100 NVL sobre AMD SEV-SNP, e o Google Cloud oferece a3-highgpu-1g confidencial (uma H100, Intel TDX) e G4 (RTX PRO 6000, AMD SEV). As placas GeForce de consumo não estão nessas listas."
  - question: "É seguro colocar dados pessoais numa GPU alugada sob o GDPR?"
    answer: "Só se o provedor for um operador com um contrato que atenda ao artigo 28 do GDPR e houver um caminho legal de transferência caso a máquina esteja fora da UE. A maioria dos hosts peer-to-peer não tem esse contrato com você, então desidentifique os dados antes ou use um provedor de data center que assine um DPA."
  - question: "Posso treinar ou fazer fine-tuning de um modelo no GPUFlow?"
    answer: "Não. O GPUFlow é só para inferência: você recebe uma chave de API compatível com a OpenAI para um modelo que roda no computador de um provedor, sem SSH, shell nem acesso a arquivos. Os prompts chegam a esse computador em texto puro, então não envie registros confidenciais por ele."
---

Quando você aluga uma GPU, outra pessoa tem root na máquina que guarda os seus dados. A criptografia protege o dataset no caminho até lá e enquanto ele está no disco, mas o seu trabalho de treino precisa descriptografá-lo na memória para usá-lo, e nesse momento um host determinado consegue lê-lo. Então as decisões reais são em quem você confia (um data center verificado ou um servidor doméstico anônimo), quão poucos dados você envia e se você precisa de confidential computing, que é a única opção que tira o operador do host da cadeia de confiança.

Este guia trata de máquinas em que você faz login, como instâncias no Vast.ai ou no RunPod. Ele percorre o modelo de ameaças, o que cada defesa cobre e uma rotina de limpeza que se sustenta em armazenamento moderno. As fontes estão no final; tudo foi conferido em setembro de 2026.

## O modelo de ameaças

Comece dando nome a quem poderia chegar aos dados e como. Numa instância de GPU alugada, existem sete caminhos realistas.

<figure>
<svg viewBox="0 0 720 430" role="img" aria-labelledby="d1-title" xmlns="http://www.w3.org/2000/svg" font-family="system-ui, sans-serif" font-size="15">
<title id="d1-title">Modelo de ameaças para um dataset numa instância de GPU alugada: sete caminhos até os dados e a principal defesa contra cada um</title>
<rect x="0" y="0" width="720" height="430" fill="#ffffff"/>
<line x1="220" y1="75" x2="240" y2="170" stroke="#e2e8f0" stroke-width="2"/>
<line x1="220" y1="220" x2="240" y2="215" stroke="#e2e8f0" stroke-width="2"/>
<line x1="220" y1="365" x2="240" y2="270" stroke="#e2e8f0" stroke-width="2"/>
<line x1="500" y1="75" x2="480" y2="170" stroke="#e2e8f0" stroke-width="2"/>
<line x1="500" y1="220" x2="480" y2="215" stroke="#e2e8f0" stroke-width="2"/>
<line x1="500" y1="365" x2="480" y2="270" stroke="#e2e8f0" stroke-width="2"/>
<line x1="360" y1="330" x2="360" y2="290" stroke="#e2e8f0" stroke-width="2"/>
<rect x="240" y="140" width="240" height="150" rx="12" fill="#eef2ff" stroke="#6366f1" stroke-width="2"/>
<text x="360" y="170" text-anchor="middle" fill="#1e1b4b" font-weight="bold">Sua instância alugada</text>
<text x="360" y="205" text-anchor="middle" fill="#1e1b4b">Dataset</text>
<text x="360" y="235" text-anchor="middle" fill="#1e1b4b">Pesos e checkpoints</text>
<text x="360" y="265" text-anchor="middle" fill="#1e1b4b">Tokens e chaves</text>
<rect x="20" y="40" width="200" height="70" rx="10" fill="#ffffff" stroke="#f97316" stroke-width="2"/>
<text x="120" y="68" text-anchor="middle" fill="#1e1b4b">Operador do host</text>
<text x="120" y="92" text-anchor="middle" fill="#64748b" font-size="12">Defesa: host confiável ou CC</text>
<rect x="20" y="185" width="200" height="70" rx="10" fill="#ffffff" stroke="#f97316" stroke-width="2"/>
<text x="120" y="213" text-anchor="middle" fill="#1e1b4b">Caminho de rede</text>
<text x="120" y="237" text-anchor="middle" fill="#64748b" font-size="12">Defesa: SSH, portas fechadas</text>
<rect x="20" y="330" width="200" height="70" rx="10" fill="#ffffff" stroke="#f97316" stroke-width="2"/>
<text x="120" y="358" text-anchor="middle" fill="#1e1b4b">Restos no disco</text>
<text x="120" y="382" text-anchor="middle" fill="#64748b" font-size="13">Defesa: cifrar e destruir</text>
<rect x="500" y="40" width="200" height="70" rx="10" fill="#ffffff" stroke="#f97316" stroke-width="2"/>
<text x="600" y="68" text-anchor="middle" fill="#1e1b4b" font-size="14">Plataforma do marketplace</text>
<text x="600" y="92" text-anchor="middle" fill="#64748b" font-size="13">Defesa: contrato e DPA</text>
<rect x="500" y="185" width="200" height="70" rx="10" fill="#ffffff" stroke="#f97316" stroke-width="2"/>
<text x="600" y="213" text-anchor="middle" fill="#1e1b4b">Outros locatários</text>
<text x="600" y="237" text-anchor="middle" fill="#64748b" font-size="12">Defesa: VM ou máquina só sua</text>
<rect x="500" y="330" width="200" height="70" rx="10" fill="#ffffff" stroke="#f97316" stroke-width="2"/>
<text x="600" y="358" text-anchor="middle" fill="#1e1b4b">Snapshots, volumes</text>
<text x="600" y="382" text-anchor="middle" fill="#64748b" font-size="13">Defesa: não guardar cópias</text>
<rect x="260" y="330" width="200" height="70" rx="10" fill="#ffffff" stroke="#f97316" stroke-width="2"/>
<text x="360" y="358" text-anchor="middle" fill="#1e1b4b">Suas próprias sobras</text>
<text x="360" y="382" text-anchor="middle" fill="#64748b" font-size="11">Defesa: tokens restritos e curtos</text>
</svg>
<figcaption>Tudo o que está na instância fica exposto ao operador do host enquanto o trabalho roda. Os outros caminhos se fecham com higiene básica; esse exige um host em quem você confia ou confidential computing.</figcaption>
</figure>

**O operador do host.** Quem é dono da máquina física tem root nela. Num marketplace de contêineres como o Vast.ai, os clientes rodam em contêineres Docker sem privilégios, o que isola você de outros locatários, mas não do host: o root do host consegue ler os arquivos e a memória de um contêiner. É assim que contêineres funcionam em qualquer plataforma.

**O caminho de rede.** Os dados viajando do seu notebook ou do seu bucket até o nó. É o caminho mais fácil de fechar.

**A plataforma do marketplace.** A empresa entre você e o host guarda a sua conta, as suas chaves SSH e o que os logs dela registrarem. O que ela pode fazer com isso é definido pelos termos dela, e é por isso que a seção sobre contratos mais abaixo importa.

**Restos no disco.** Arquivos que você apaga podem sobreviver no disco depois do aluguel, onde o próximo locatário ou o host podem encontrá-los.

**Snapshots e volumes persistentes.** Cópias que você pediu (um network volume, uma instância parada) ou que o host fez (backups) sobrevivem ao trabalho.

**Outros locatários.** Outros clientes na mesma máquina. Com isolamento por VM ou uma máquina inteira só para você, esse risco é pequeno, mas as GPUs já tiveram bugs reais aqui. O LeftoverLocals (CVE-2023-4969) permitia que um processo lesse a memória local de GPU de outro em algumas GPUs da Apple, AMD e Qualcomm; a Trail of Bits recuperou cerca de 181 MB por consulta a um LLM numa AMD Radeon RX 7900 XT, o suficiente para reconstruir a resposta do modelo. A Trail of Bits não encontrou sinal dele em GPUs NVIDIA, ARM ou Intel.

**As suas próprias sobras.** Um token do Hugging Face, chaves de nuvem ou uma chave SSH privada esquecidos no nó. Na prática, é assim que começa a maioria dos vazamentos.

## O que a criptografia cobre e o que ela não cobre

A criptografia tem três funções, e uma GPU alugada deixa você cuidar de duas delas por conta própria.

**Em trânsito:** fácil. Use SSH (`scp`, `sftp`, `rsync -e ssh`) ou HTTPS a partir de um bucket. O Vast.ai afirma que as conexões SSH e a API dele são criptografadas. Nunca use links HTTP simples nem serviços de compartilhamento de arquivos sem autenticação.

**Em repouso:** criptografe antes de subir, para que o arquivo no disco do host seja inútil sem a chave. O [age](https://github.com/FiloSottile/age) é a ferramenta mais simples para isso:

```bash
# on your own machine
tar -cf - train/ | age -p > train.tar.age
scp -P 22345 train.tar.age user@203.0.113.42:/workspace/
```

No nó, descriptografe direto para a memória, para que o texto puro nunca toque o disco:

```bash
mkdir -p /dev/shm/train
age -d /workspace/train.tar.age | tar -xf - -C /dev/shm/train
```

O `age -d` pede a senha no terminal, então a chave nunca é gravada no nó. O `/dev/shm` é um sistema de arquivos em RAM; confira o tamanho dele antes com `df -h /dev/shm`, porque configurações de contêiner muitas vezes o deixam pequeno. Se os dados não couberem na RAM, você vai precisar de uma cópia descriptografada no disco, e a seção de limpeza mais abaixo passa a pesar mais.

Criptografia de disco inteiro com LUKS é a resposta de costume nos seus próprios servidores, mas em geral não dá para configurar o dm-crypt dentro de um contêiner sem privilégios, e o host teria a chave em uso de qualquer jeito.

**Em uso:** aqui está a lacuna. Para treinar, a GPU precisa de tensores em texto puro, e a memória da CPU que a alimenta também guarda texto puro. Qualquer pessoa com root no host pode, em princípio, fazer um dump dessa memória. Criptografia em repouso não faz nada contra um host ativo e hostil. Só o confidential computing baseado em hardware resolve isso.

## Secure cloud ou community cloud

Como o host é o único risco que a higiene não elimina, escolher o host é a maior decisão que você toma. Os dois grandes marketplaces dividem a oferta justamente por isso.

| Opção | Quem opera o hardware | O que a plataforma diz |
| --- | --- | --- |
| RunPod Secure Cloud | Data centers T3/T4 | Para "produção, dados sensíveis" |
| RunPod Community Cloud | Provedores peer-to-peer | Para "cargas de trabalho sensíveis a custo"; não aceita novos hosts |
| Vast.ai Secure Cloud | Data centers verificados | ISO 27001, padrões Tier 3/4, segurança física verificada |
| Outros hosts do Vast.ai | De data centers a pessoas físicas | Hosts individuais "podem ter medidas de segurança menos formais" |

O próprio conselho do Vast.ai para dados sensíveis é usar só provedores do Secure Cloud, criptografar os dados em repouso, manter credenciais fora das instâncias e usar gerenciamento de chaves externo. É o que eu diria a qualquer um.

Dois limites valem mesmo num data center certificado. Primeiro, a ISO 27001 certifica os processos do operador; ela não descarta um funcionário desonesto. Segundo, um host que trata dados pessoais para você é um operador sob o GDPR, e o artigo 28 exige um contrato que cubra isso, enquanto o marketplace fica entre você e o host. Leia com qual empresa você de fato tem contrato e o que ela promete sobre os hosts dela.

Para trabalho realmente sensível, o próximo degrau é uma instância com GPU numa conta de hyperscaler com a qual você já tem um DPA e talvez um BAA, o que tira você do território dos marketplaces e custa mais por hora. A nossa [comparação de preços de aluguel de GPU](/pt_br/gpu-rental-pricing-comparison-2026/) mostra as faixas de preço.

## Confidential computing em GPUs H100

O confidential computing (CC) é a única tecnologia aqui projetada para proteger os dados do operador do host enquanto o trabalho roda. Nas GPUs de data center Hopper e Blackwell da NVIDIA, funciona assim:

- A carga de trabalho roda numa VM confidencial (CVM) apoiada em AMD SEV-SNP ou Intel TDX na CPU. O projeto da NVIDIA parte do princípio de que o hypervisor e o sistema operacional do host podem estar comprometidos; um operador com acesso ao hypervisor "ou até ao próprio sistema" não deve conseguir ler a memória da CVM.
- Antes do uso, a VM verifica se a GPU é genuína e está em modo CC, com um certificado de dispositivo assinado, que pode ser conferido no Remote Attestation Service (NRAS) da NVIDIA.
- Dados, command buffers e kernels CUDA que atravessam o PCIe são criptografados e assinados, passando por um bounce buffer criptografado na memória compartilhada.

A NVIDIA liberou o CC com uma única H100 para uso geral com o CUDA 12.4, em abril de 2024. Onde dá para alugar de fato em setembro de 2026:

| Nuvem | Instância | GPU | TEE da CPU |
| --- | --- | --- | --- |
| Azure | NCCads H100 v5 | 1 × H100 NVL, 94 GB | AMD SEV-SNP (EPYC Genoa) |
| Google Cloud | a3-highgpu-1g, Confidential VM | 1 × H100 | Intel TDX |
| Google Cloud | g4-standard-48, Confidential VM | RTX PRO 6000 | AMD SEV |

Conheça os limites antes de construir em cima disso:

- **Uma GPU por VM.** A série do Azure tem uma GPU, e as VMs confidenciais com GPU do Google não suportam clusters com vários nós. Grandes treinos com várias GPUs ficam de fora.
- **Provisionamento.** No Google Cloud, a A3 High confidencial só roda como Spot ou flex-start e não suporta reservas.
- **Velocidade de transferência.** O texto técnico da NVIDIA de 2023 indicava uma banda CPU-GPU de cerca de 4 GB/s em modo CC, limitada pela criptografia na CPU. Carregar um checkpoint de 16 GB leva, portanto, cerca de 16 ÷ 4 = 4 segundos só de transferência, o que é aceitável para inferência, mas um pipeline de dados que transmite muitos gigabytes por passo vai sentir. Versões posteriores do driver citam melhorias de desempenho, então meça o seu próprio trabalho.
- **A memória da GPU não é criptografada.** A NVIDIA deixa a HBM do encapsulamento em texto puro, com o argumento de que as ferramentas comuns de ataque físico não conseguem alcançá-la.
- **Não existe nos marketplaces.** As placas GeForce de consumo, comuns nos hosts comunitários do Vast.ai e do RunPod, não estão em nenhuma dessas listas de suporte.

O CC muda em quem você precisa confiar: no hardware e na atestação da NVIDIA, no fabricante da CPU e na sua própria imagem de VM, em vez de na equipe do host. Para dados regulados em que a resposta "os administradores do provedor de nuvem não conseguem ler" faz diferença, é a única opção em hardware alugado que chega lá.

## Antes e durante o trabalho

### Reduza antes de subir

A proteção mais barata são dados que nunca saem da sua máquina. Antes da transferência:

- Descarte as colunas de que o modelo não precisa, principalmente nomes, e-mails, números de conta e anotações em texto livre.
- Troque identificadores diretos por tokens aleatórios e mantenha a tabela de correspondência em casa.
- Corte o corpus ao que o método precisa. Um fine-tuning com LoRA ou QLoRA ajusta um conjunto pequeno de pesos extras e raramente precisa de um banco de dados de produção inteiro; o nosso [guia de fine-tuning](/pt_br/private-llm-fine-tuning-guide/) mostra uma configuração realista.
- Lembre que os pesos do modelo carregam informação. Um modelo ajustado com texto sensível pode repetir trechos dele, então trate o adaptador também como sensível.

Dados desidentificados também são o que faz a maior parte das questões jurídicas mais abaixo desaparecer.

### Credenciais e rede no nó

Parta do princípio de que tudo o que você coloca no nó pode ser copiado.

- Use um token fine-grained do Hugging Face com acesso de leitura ao único repositório de que você precisa, e revogue-o quando o trabalho terminar.
- Nunca copie a sua chave SSH privada principal, credenciais root de nuvem ou senhas de bancos de dados de produção para uma máquina alugada. Se o trabalho precisa gravar resultados num bucket, crie uma chave que só possa gravar num prefixo e expire em menos de um dia.
- Puxe os resultados por SSH em vez de enviá-los a partir do nó com chaves de longa duração.
- Confira o que está escutando com `ss -tulnp`. Faça o Jupyter, o TensorBoard e os servidores de inferência escutarem em `127.0.0.1` e acesse-os por um túnel SSH (`ssh -L 8888:127.0.0.1:8888 ...`) em vez de expor uma porta pública.

## Uma limpeza que funciona em discos modernos

O conselho de sempre é passar `shred` no dataset quando terminar. Ele não faz o que as pessoas pensam. O manual do GNU coreutils diz que o `shred` depende de o sistema de arquivos e o hardware sobrescreverem os dados no mesmo lugar, e lista os casos em que isso falha: sistemas de arquivos com journaling e estruturados em log, como ext4 no modo `data=journal`, Btrfs, XFS e ZFS, RAID, sistemas de arquivos com snapshots, sistemas de arquivos comprimidos e SSDs, cujo nivelamento de desgaste grava os dados novos em outro lugar. Um nó de GPU alugado muito provavelmente é várias dessas coisas ao mesmo tempo.

O que funciona no lugar:

1. **Torne a cópia em disco inútil.** Se só o arquivo criptografado com age tocou o disco, apagá-lo basta; sem a senha, ele é ruído. O guia de sanitização de mídia do NIST (SP 800-88 Rev. 2, setembro de 2025) trata essa ideia, o apagamento criptográfico, como técnica padrão.
2. **Destrua, não pare.** No Vast.ai, parar uma instância preserva os dados dela (e continua cobrando o armazenamento); destruí-la "apaga permanentemente a instância e todos os dados". No RunPod, o container disk é limpo quando o pod para, o volume `/workspace` sobrevive às paradas e é apagado quando o pod é encerrado, e um network volume sobrevive a tudo até você apagá-lo.
3. **Apague os network volumes que você criou.** Eles foram feitos para sobreviver aos pods.
4. **Revogue o que você usou.** Token do Hugging Face, chaves de bucket, e remova qualquer chave SSH pública avulsa que você tenha adicionado ao marketplace para esse trabalho.

Como o host limpa os discos entre um locatário e outro não é algo que a documentação dos marketplaces que li descreva. Planeje como se isso não acontecesse; o passo 1 protege você de qualquer forma.

## Contratos e regulação

Os controles técnicos pesam menos do que um fato jurídico: colocar dados na máquina de alguém torna essa pessoa parte do tratamento.

- **GDPR.** Um host de GPU que trata dados pessoais para você é um operador. O artigo 28 exige um que ofereça "garantias suficientes" e um contrato vinculante. Um host peer-to-peer com quem você nunca assinou nada não atende a isso, e a máquina pode estar fora da UE. Desidentifique os dados ou use um provedor que assine um DPA.
- **HIPAA.** O HHS diz que um provedor de nuvem que armazena dados eletrônicos de saúde é um business associate mesmo que os dados estejam criptografados e ele não tenha a chave. Criptografar prontuários antes de enviá-los a um host não verificado não elimina a necessidade de um BAA.
- **Os contratos dos seus clientes.** Muitos contratos corporativos restringem suboperadores e a localização dos dados. Confira antes do primeiro upload. A exposição jurídica muitas vezes é maior do que a técnica.

O post complementar sobre [por que as empresas restringem ferramentas públicas de IA](/pt_br/why-corporate-policies-banning-chatgpt/) trata das mesmas regras do lado do chat.

## Inferência no GPUFlow: outra troca

O GPUFlow não é lugar para colocar um dataset. É um marketplace de inferência: você aluga uma GPU por hora e recebe uma chave de API compatível com a OpenAI (URL base `https://gpuflow.app/v1`) para o modelo aberto que um provedor roda (normalmente com o Ollama) no próprio computador. Não há SSH, nem shell, nem acesso a arquivos, e não dá para treinar nem fazer fine-tuning nele. Nada do que você envia fica no disco do provedor, porque você não consegue subir nada.

Isso elimina os problemas de disco e de credenciais deste guia. Não elimina o problema do host. Cada prompt e cada resposta passam pela máquina do provedor em texto puro enquanto o aluguel dura. Os termos do GPUFlow proíbem os provedores de registrá-los, lê-los, guardá-los ou compartilhá-los, e o próprio GPUFlow não guarda o texto, mas o provedor tem root na máquina, então a regra é garantida só por contrato. Se você passar um dataset por ele, um registro por prompt, cada registro chega a esse computador.

Então use-o para dados públicos, sintéticos ou devidamente desidentificados, e para testar um modelo aberto ou um app contra uma API no estilo da OpenAI. Mantenha registros regulados e confidenciais no seu próprio hardware, num provedor com quem você tem contrato ou numa VM confidencial. O [guia rápido da API](https://docs.gpuflow.app/pt-br/renters/api-quickstart/) diz o mesmo numa linha: não envie senhas, números de cartão nem outros segredos que você não compartilharia com um desconhecido. O mesmo arranjo visto do lado do provedor está em [é seguro alugar sua GPU](/pt_br/is-it-safe-to-rent-out-your-gpu/).

## Checklist

Antes:

- Defina a classe dos dados. Dados regulados ou confidenciais de clientes vão para um provedor com contrato ou uma VM confidencial, não para um host comunitário.
- Reduza e desidentifique.
- Criptografe com age; mantenha a senha fora do nó.

Durante:

- Descriptografe em `/dev/shm` quando couber.
- Só tokens restritos e de curta duração.
- Serviços escutando em localhost, acessados por túneis SSH.

Depois:

- Puxe os resultados por SSH; trate os pesos ajustados como sensíveis.
- Destrua a instância e qualquer network volume.
- Revogue tokens e chaves avulsas.

## Fontes

- Isolamento de contêineres e Secure Cloud no Vast.ai: [FAQ de segurança do Vast.ai](https://docs.vast.ai/guides/reference/faq/security); parar ou destruir: [gerenciamento de instâncias](https://docs.vast.ai/guides/instances/manage-instances)
- Secure Cloud e Community Cloud do RunPod: [como escolher um pod](https://docs.runpod.io/pods/choose-a-pod); persistência do armazenamento: [tipos de armazenamento](https://docs.runpod.io/pods/storage/types)
- LeftoverLocals: [Trail of Bits, janeiro de 2024](https://blog.trailofbits.com/2024/01/16/leftoverlocals-listening-to-llm-responses-through-leaked-gpu-local-memory/)
- age: [github.com/FiloSottile/age](https://github.com/FiloSottile/age)
- Limitações do shred: [manual do GNU coreutils, uso do shred](https://www.gnu.org/software/coreutils/manual/html_node/shred-invocation.html)
- NIST SP 800-88 Rev. 2: [anúncio do NIST, setembro de 2025](https://www.nist.gov/news-events/news/2025/09/guidelines-media-sanitization-nist-publishes-sp-800-88r2)
- Projeto do confidential computing na H100: [NVIDIA, Confidential Computing on H100 GPUs for Secure and Trustworthy AI](https://developer.nvidia.com/blog/confidential-computing-on-h100-gpus-for-secure-and-trustworthy-ai/); disponibilidade geral: [NVIDIA, abril de 2024](https://developer.nvidia.com/blog/announcing-confidential-computing-general-access-on-nvidia-h100-tensor-core-gpus/)
- Azure: [série NCCads H100 v5](https://learn.microsoft.com/en-us/azure/virtual-machines/sizes/gpu-accelerated/nccadsh100v5-series)
- Google Cloud: [configurações suportadas de Confidential VM](https://docs.cloud.google.com/confidential-computing/confidential-vm/docs/supported-configurations), [como criar uma instância de Confidential VM com GPU](https://docs.cloud.google.com/confidential-computing/confidential-vm/docs/create-a-confidential-vm-instance-with-gpu)
- Artigo 28 do GDPR: [gdpr-info.eu](https://gdpr-info.eu/art-28-gdpr/)
- HIPAA e provedores de nuvem: [HHS, orientação sobre HIPAA e computação em nuvem](https://www.hhs.gov/hipaa/for-professionals/special-topics/health-information-technology/cloud-computing/index.html)
- GPUFlow: [guia rápido da API](https://docs.gpuflow.app/pt-br/renters/api-quickstart/), [o que os locatários conseguem e não conseguem acessar](https://docs.gpuflow.app/pt-br/providers/security/), [termos](https://gpuflow.app/pt-BR/terms), [política de privacidade](https://gpuflow.app/pt-BR/privacy)

Tudo verificado em setembro de 2026.
