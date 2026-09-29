---
title: "Quanto custa de verdade alugar uma GPU: o que o preço por hora não mostra"
description: "Armazenamento com a máquina parada, tráfego de dados, depósito mínimo, unidade de cobrança, tempo ocioso e tarifas do cartão. O que você realmente paga na Vast.ai, RunPod, Lambda, AWS e GPUFlow além do preço por hora da GPU."
excerpt: "O preço por hora é só uma parte da conta. Reunimos todas as cobranças extras que encontramos nas principais plataformas de aluguel de GPU, com os valores e a fonte de cada uma."
pubDate: 2026-02-15
updatedDate: 2026-09-29
locale: "pt_br"
category: "pricing"
featured: false
draft: false
author: "GPUFlow Team"
heroImage: "../_images/gpu-server-rack.jpg"
heroImageAlt: "Close das ventoinhas de servidores de GPU em um rack"
faq:
  - question: "As plataformas de aluguel de GPU cobram armazenamento quando a máquina está parada?"
    answer: "Muitas vezes, sim. Na RunPod, o volume disk de um pod parado custa US$ 0,20 por GB por mês, o dobro do valor com o pod rodando. Na Vast.ai, o armazenamento é cobrado a cada segundo em que a instância existe, inclusive parada. O GPUFlow não cobra armazenamento, porque um aluguel é uma chave de API, não uma máquina."
  - question: "Quais plataformas de aluguel de GPU cobram pelo tráfego de dados?"
    answer: "Na Vast.ai, cada host define o próprio preço para dados enviados e recebidos, e cada byte é cobrado. A RunPod e a Lambda dizem que não cobram entrada nem saída de dados. A AWS cobra pelos dados enviados para a internet depois dos primeiros 100 GB do mês."
  - question: "Existe um valor mínimo para começar a alugar?"
    answer: "O depósito mínimo da Vast.ai é de US$ 5. A Lambda faz uma pré-autorização de US$ 10 no seu cartão. A RunPod exige que quem usa cartão pré-pago deposite pelo menos US$ 100 por transação. No GPUFlow, as recargas começam em US$ 10, sem taxa."
  - question: "Meu banco cobra alguma tarifa quando pago o aluguel de GPU em dólar?"
    answer: "Pode cobrar. As tarifas de transação internacional do cartão costumam ficar entre 1% e 3%, e alguns bancos as cobram em compras de lojas estrangeiras mesmo quando o preço aparece em dólar. No Brasil, o IOF sobre compras internacionais com cartão é de 3,5%."
---

O preço de um anúncio de GPU é por hora de uso da GPU. O que você paga no fim do mês costuma incluir outras coisas: espaço em disco, transferência de dados, o tempo de configuração e as tarifas do seu próprio banco. Nada disso fica escondido de propósito, mas é fácil deixar passar quando você compara plataformas só pelo preço de vitrine.

Este artigo lista todas as cobranças extras que conseguimos confirmar nas principais plataformas, com o link da fonte de cada uma. Verificamos tudo em setembro de 2026. Preços mudam, então confira os links antes de confiar em um número.

## Resumo

| Custo | Vast.ai | RunPod | Lambda | AWS EC2 | GPUFlow |
| --- | --- | --- | --- | --- | --- |
| Unidade de cobrança | Por segundo | Por segundo | Por minuto | Por segundo, mínimo de 60 s | Por segundo, mínimo de 1 min |
| Armazenamento com a máquina rodando | Definido pelo host | US$ 0,10/GB/mês | Filesystems, por GB/mês | US$ 0,08/GB/mês (gp3) | Nenhum |
| Armazenamento com a máquina parada | Sim, cobrado | US$ 0,20/GB/mês (volume disk) | Filesystems, por GB/mês | US$ 0,08/GB/mês (gp3) | Nenhum |
| Transferência de dados | Definida pelo host, cada byte | Grátis | Grátis | Saída para a internet: primeiros 100 GB/mês grátis, depois pago | Nenhuma |
| Mínimo para começar | Depósito de US$ 5 | 1 hora de crédito; US$ 100 com cartão pré-pago | Pré-autorização de US$ 10 no cartão | Forma de pagamento e cota de GPU | Recarga de US$ 10 |

O GPUFlow consegue dispensar as cobranças de armazenamento e de transferência porque aluga outra coisa: você recebe uma chave de API para modelos de IA que rodam na GPU de outra pessoa, não uma máquina em que você faz login. Isso também significa que você não pode rodar seu próprio código nem treinar modelos nele. Falamos mais sobre isso abaixo.

## 1. Armazenamento, principalmente com a máquina parada

Nas plataformas que alugam uma máquina ou um contêiner, seus arquivos ficam em um disco, e o disco custa dinheiro enquanto existir.

- A **RunPod** cobra US$ 0,10 por GB por mês pelo container disk e pelo volume disk enquanto o pod está rodando. Quando você para o pod, o container disk deixa de existir e não custa nada, mas o volume disk passa a custar **US$ 0,20 por GB por mês**. Network volumes custam US$ 0,07 por GB por mês abaixo de 1 TB, rodando ou não.
- A **Vast.ai** deixa cada host definir o preço do armazenamento. Ele é cobrado a cada segundo em que a instância existe, inclusive parada.
- A **AWS** cobra os volumes EBS com a instância rodando ou não. Um volume gp3 em us-east-1 custa US$ 0,08 por GB por mês.

Um exemplo: um volume de 200 GB em um pod parado da RunPod custa 200 × US$ 0,20 = **US$ 40 por mês**, mesmo que você nunca mais ligue o pod. Isso é mais do que 100 horas de uma RTX 3090 pelos preços típicos de marketplace que listamos mais abaixo.

**O que fazer:** apague os volumes que você não está usando. Se você só precisa guardar os arquivos entre uma sessão e outra, um network volume pequeno sai mais barato do que manter um pod grande parado.

## 2. Transferência de dados

Baixar um modelo e enviar um dataset pode movimentar dezenas de gigabytes.

- **Vast.ai:** cada host define um preço para upload e download, e a documentação diz que cada byte é cobrado, seja qual for o estado da instância. Veja o preço de banda no anúncio antes de alugar, principalmente se você for baixar modelos grandes.
- A **RunPod** e a **Lambda** dizem que não cobram entrada nem saída de dados.
- **AWS:** a entrada de dados é grátis. A saída para a internet é grátis nos primeiros 100 GB do mês e depois é cobrada por GB. A AWS também cobra US$ 0,005 por hora por endereço IPv4 público, em uso ou não.

## 3. Depósitos mínimos e bloqueios no cartão

A maioria das plataformas de GPU é pré-paga. Você compra crédito primeiro e depois gasta.

- **Vast.ai:** depósito mínimo de US$ 5.
- **RunPod:** você precisa de pelo menos uma hora de crédito para a máquina que escolher, e cartões pré-pagos precisam depositar no mínimo US$ 100 por transação.
- **Lambda:** uma pré-autorização de US$ 10 no seu cartão, estornada depois de alguns dias.
- **SaladCloud:** o crédito expira 12 meses após a compra.
- **GPUFlow:** recargas de US$ 10 a US$ 500, sem taxa, e os créditos não expiram.

Crédito que expira ou fica parado também é custo. Compre o que você espera usar.

## 4. Tempo de configuração é tempo cobrado

Quando você aluga uma máquina, o relógio começa a contar quando ela liga, não quando o seu trabalho começa. Instalar drivers e bibliotecas, baixar uma imagem de contêiner e baixar um modelo de 15 GB, tudo isso acontece em tempo pago. A US$ 0,35 por hora, meia hora de configuração dá cerca de US$ 0,18. É pouco em uma sessão, mas soma se você sobe máquinas novas todo dia.

Duas coisas ajudam: usar um template ou uma imagem de contêiner que já tenha o que você precisa, e guardar os modelos em um volume para baixá-los uma vez só (e então pesar isso contra o custo de armazenamento do item 1).

No GPUFlow, o modelo já está instalado na máquina do provedor antes de você alugar. Não há nada para configurar: você paga a partir do momento em que o aluguel começa, e a chave funciona na hora.

## 5. Unidade de cobrança e mínimos

A cobrança por segundo virou padrão, mas os mínimos variam:

| Plataforma | Como o tempo é cobrado |
| --- | --- |
| Vast.ai | Por segundo, sem mínimo |
| Pods da RunPod | Por segundo |
| RunPod serverless | Por segundo, arredondado para cima; você também paga o tempo de inicialização do worker e um tempo ocioso (5 segundos por padrão) |
| Lambda | Por minuto |
| AWS EC2 (Linux) | Por segundo, mínimo de 60 segundos |
| Google Cloud | Por segundo, mínimo de 1 minuto |
| GPUFlow | Por segundo, mínimo de 1 minuto |

É no serverless que a unidade de cobrança mais pesa. Se você manda requisições curtas com pausas entre elas, o tempo de inicialização e o tempo ocioso podem custar mais do que as próprias requisições.

## 6. Tempo ocioso em uma máquina ligada

Uma máquina alugada por hora custa o mesmo com a GPU trabalhando ou esperando por você. Deixar um pod ligado a noite toda "para já estar pronto de manhã" é um jeito fácil de gastar demais. A Lambda diz isso com todas as letras: as instâncias são cobradas enquanto estão rodando, sendo usadas ou não.

**O que fazer:** coloque um lembrete ou use um recurso da plataforma que desliga máquinas ociosas. No GPUFlow você reserva um número de horas; se terminar antes, clique em **Encerrar agora** e o tempo não usado volta para os seus créditos. [Como funciona a cobrança do GPUFlow](https://docs.gpuflow.app/pt-br/renters/billing/).

## 7. Máquinas interruptíveis

Máquinas interruptíveis (spot) são mais baratas, muitas vezes custam metade ou menos, mas podem ser paradas quando alguém paga mais. A Vast.ai as chama de interruptible e diz que costumam custar pelo menos 50% menos. Na TensorDock, o armazenamento continua sendo cobrado enquanto outra pessoa estiver pagando mais que você. Se o seu trabalho não consegue retomar a partir de um checkpoint, uma interrupção significa pagar duas vezes pelo mesmo trabalho.

## 8. As tarifas do seu banco

Quase todas as plataformas de GPU cobram em dólar. Se o seu cartão é de outra moeda, o banco pode acrescentar uma tarifa:

- As tarifas de transação internacional costumam ficar entre **1% e 3%**. Alguns bancos as cobram em compras de lojas estrangeiras mesmo quando o preço aparece em dólar.
- Muitos cartões de crédito canadenses cobram cerca de **2,5%** em compras em outra moeda.
- No Brasil, o **IOF sobre compras internacionais com cartão é de 3,5%**.

Em uma recarga de US$ 100, isso dá de US$ 1 a US$ 3,50 que não aparecem na fatura da plataforma. Um cartão sem tarifa de transação internacional elimina a maior parte disso.

## 9. Para provedores: taxas e mínimos de saque

Se você aluga a sua própria GPU, a plataforma fica com uma parte, e os saques têm regras próprias:

| Plataforma | O que fica com o provedor | Saque mínimo | Taxa de saque |
| --- | --- | --- | --- |
| GPUFlow | 88% do preço do aluguel | US$ 25 | US$ 2,50 por saque |
| Vast.ai | A Vast diz que os preços anunciados costumam ficar cerca de 25% acima do que os hosts recebem | US$ 20 | Não informada pela Vast; o seu serviço de pagamento pode cobrar |
| TensorDock | O contrato de hospedagem cita uma taxa de 20% ou 25% (o texto traz as duas) | US$ 250 antes do saque | Não informada |

O GPUFlow também retém os ganhos por 7 dias (14 dias para contas com menos de 30 dias) antes de liberar o saque, para cobrir contestações de cartão. [Como funcionam os saques no GPUFlow](https://docs.gpuflow.app/pt-br/providers/getting-paid/).

## Preços típicos de GPU, setembro de 2026

Para ter uma referência, estas são as faixas de preço sob demanda que encontramos na Vast.ai, RunPod, Salad, SimplePod, TensorDock, Hyperstack e Lambda em setembro de 2026:

| GPU | Preço típico por hora |
| --- | --- |
| RTX 3060 12 GB | US$ 0,05 – US$ 0,08 |
| RTX 3090 | US$ 0,11 – US$ 0,31 |
| RTX 4090 | US$ 0,30 – US$ 0,46 |
| RTX 5090 | US$ 0,41 – US$ 0,69 |

Para comparar, uma NVIDIA L4 na AWS (g6.xlarge em us-east-1) custa cerca de US$ 0,80 por hora, e uma A10G (g5.xlarge), cerca de US$ 1,01.

## Checklist antes de alugar

1. Some o tempo de GPU **mais** o armazenamento pelo tempo em que você vai manter os arquivos.
2. Veja o preço de banda, se a plataforma cobrar, e quanto você vai baixar.
3. Conte o tempo de configuração como tempo pago.
4. Saiba como vai parar de pagar: encerrar o aluguel, parar a máquina, apagar o volume.
5. Confira a tarifa de transação internacional do seu cartão.

Se o que você precisa é de um modelo de IA para chamar a partir do seu código, e não de uma máquina para rodar o seu próprio software, um aluguel baseado em API elimina os itens 1, 2 e 4 por completo. Se você precisa de uma máquina inteira para treinar modelos, as plataformas acima são a ferramenta certa, e este checklist é o que mantém a conta perto do preço por hora.

## Artigos relacionados

- [GPU por hora ou API por token? Quanto custa de verdade rodar um modelo de 7B–8B](/pt_br/hourly-gpu-vs-per-token-api/)
- [GPUFlow vs Vast.ai vs RunPod vs SaladCloud: qual combina com o seu trabalho](/pt_br/gpuflow-vs-vast-ai-vs-runpod/)
- [O que é preciso para alugar uma GPU em 2026](/pt_br/what-you-need-to-rent-a-gpu/)

## Fontes

Tudo verificado em setembro de 2026.

- Preços e armazenamento de pods da RunPod: [docs.runpod.io/pods/pricing](https://docs.runpod.io/pods/pricing)
- Cobrança do serverless da RunPod: [docs.runpod.io/serverless/pricing](https://docs.runpod.io/serverless/pricing)
- Cobrança e depósitos da RunPod: [docs.runpod.io/references/billing-information](https://docs.runpod.io/references/billing-information)
- Preços e cobrança da Vast.ai: [docs.vast.ai/guides/instances/pricing.md](https://docs.vast.ai/guides/instances/pricing.md), [docs.vast.ai/documentation/reference/billing](https://docs.vast.ai/documentation/reference/billing)
- Depósito da Vast.ai: [quickstart da docs.vast.ai](https://docs.vast.ai/guides/get-started/quickstart.md)
- Pagamentos aos hosts da Vast.ai: [docs.vast.ai/host/payment.md](https://docs.vast.ai/host/payment.md), artigo sobre ganhos dos hosts: [vast.ai](https://vast.ai/article/how-much-money-can-you-earn-renting-out-your-gpu-on-vast-ai)
- Cobrança da Lambda: [docs.lambda.ai/public-cloud/billing](https://docs.lambda.ai/public-cloud/billing/), [gerenciar a cobrança](https://docs.lambda.ai/public-cloud/manage-billing/), [preços ("No egress fees")](https://lambda.ai/pricing)
- Cobrança da SaladCloud: [cobrança na docs.salad.com](https://docs.salad.com/general/explanation/billing.md)
- Instâncias spot da TensorDock: [docs.tensordock.com](https://docs.tensordock.com/virtual-machines/spot-instances), contrato de fornecedor: [docs.tensordock.com](https://docs.tensordock.com/legal-information/supplier-hosting-agreement.md)
- Cobrança do AWS EC2: [aws.amazon.com/ec2/pricing/on-demand](https://aws.amazon.com/ec2/pricing/on-demand/); EBS: [aws.amazon.com/ebs/pricing](https://aws.amazon.com/ebs/pricing/); IPv4 público: [aws.amazon.com/vpc/pricing](https://aws.amazon.com/vpc/pricing/)
- Preços de instâncias da AWS: [instances.vantage.sh g6.xlarge](https://instances.vantage.sh/aws/ec2/g6.xlarge?region=us-east-1), [g5.xlarge](https://instances.vantage.sh/aws/ec2/g5.xlarge?region=us-east-1)
- Cobrança de VMs no Google Cloud: [cloud.google.com/compute/vm-instance-pricing](https://cloud.google.com/compute/vm-instance-pricing)
- Tarifas de transação internacional do cartão: [Experian](https://www.experian.com/blogs/ask-experian/what-is-a-foreign-transaction-fee/), [NerdWallet Canadá](https://www.nerdwallet.com/ca/p/best/credit-cards/best-no-foreign-transaction-fee-credit-cards)
- IOF de 3,5% no Brasil: [Wise Brasil](https://wise.com/br/blog/iof-cartao-internacional)
- Faixas de preço de GPU: [documentação do GPUFlow, Como definir o preço da sua GPU](https://docs.gpuflow.app/pt-br/providers/pricing/)
