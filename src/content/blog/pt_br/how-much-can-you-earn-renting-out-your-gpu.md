---
title: "Quanto sua GPU gamer pode render: da RTX 3060 à RTX 5090, descontadas taxas e energia"
description: "Contas honestas para colocar sua GPU de consumo para alugar em 2026: preços de aluguel atuais, taxas das plataformas, energia elétrica nos EUA, Canadá, Reino Unido, Alemanha e França, e o que sobra por mês com 4 e 12 horas alugadas por dia."
excerpt: "Quanto rende uma hora alugada, com quanto a plataforma fica, quanto a conta de luz leva e o que sobra no fim do mês. Com a fórmula para você usar os seus próprios números."
pubDate: 2026-09-29
locale: "pt_br"
category: "guides"
featured: false
draft: false
author: "GPUFlow Team"
heroImage: "../_images/how-much-can-you-earn-renting-out-your-gpu-hero.png"
heroImageAlt: "Ilustração de uma placa de vídeo ao lado de pilhas de moedas crescentes"
faq:
  - question: "Quanto uma RTX 4090 pode render por mês em um marketplace de aluguel de GPU?"
    answer: "Com um preço típico de setembro de 2026, de cerca de US$ 0,38 por hora, a taxa de 12% do GPUFlow e a energia na média dos EUA, uma RTX 4090 deixa cerca de US$ 0,25 líquidos por hora alugada. Isso dá cerca de US$ 30 por mês se ela for alugada 4 horas por dia e cerca de US$ 91 com 12 horas por dia, sem contar a energia que o resto do PC consome."
  - question: "Vale a pena colocar uma RTX 3060 para alugar?"
    answer: "Mal compensa. A US$ 0,05 a US$ 0,08 por hora, uma RTX 3060 deixa cerca de US$ 0,03 líquidos por hora alugada, descontadas as taxas e a energia nos EUA. Com 4 horas alugadas por dia, isso dá cerca de US$ 3 por mês."
  - question: "Quanto custa a energia de uma GPU colocada para alugar?"
    answer: "Multiplique o consumo em quilowatts pelo seu preço por kWh. Uma RTX 4090 no seu board power de 450 W custa cerca de US$ 0,08 por hora na média dos EUA em 2026, de 18,2 centavos de dólar por kWh, e cerca de € 0,17 por hora na Alemanha."
  - question: "Em quais países dá para sacar os ganhos do GPUFlow?"
    answer: "Os saques passam pela Stripe e hoje funcionam nos Estados Unidos, Canadá, Reino Unido, Suíça e Espaço Econômico Europeu."
---

Se você tem uma GPU gamer que passa a maior parte do dia parada, pode anunciá-la em um marketplace e receber por hora de aluguel. Se vale a pena ou não depende de quatro números:

1. **Quanto os locatários pagam** por hora pela sua placa.
2. **Com quanto a plataforma fica.**
3. **Quanto você gasta de energia** enquanto ela roda.
4. **Quantas horas por dia ela é de fato alugada.**

Os três primeiros são fáceis de consultar. O quarto, ninguém pode prometer, então mostramos uma faixa. Todos os preços abaixo foram verificados em setembro de 2026; as fontes estão no final.

## 1. Quanto os locatários pagam

Estes são os preços típicos sob demanda por hora em sites de aluguel de GPU (Vast.ai, RunPod, Salad, SimplePod, TensorDock, Hyperstack, Lambda) em setembro de 2026:

| GPU | Preço típico por hora | Meio da faixa |
| --- | --- | --- |
| RTX 3060 12 GB | US$ 0,05 – US$ 0,08 | US$ 0,065 |
| RTX 4070 | US$ 0,07 – US$ 0,15 | US$ 0,11 |
| RTX 3090 | US$ 0,11 – US$ 0,31 | US$ 0,21 |
| RTX 4080 | US$ 0,23 – US$ 0,27 | US$ 0,25 |
| RTX 4090 | US$ 0,30 – US$ 0,46 | US$ 0,38 |
| RTX 5090 | US$ 0,41 – US$ 0,69 | US$ 0,55 |

A memória pesa tanto quanto a velocidade. Uma placa de 24 GB, como a 3090 ou a 4090, [roda modelos de IA maiores do que uma de 12 GB ou 16 GB](/pt_br/which-ai-models-fit-your-gpu-vram/), e os locatários pagam por isso.

## 2. Com quanto a plataforma fica

| Plataforma | Parte | Saques |
| --- | --- | --- |
| GPUFlow | Fica com 12%, você recebe 88% | Para a sua conta bancária pela Stripe. Mínimo de US$ 25, US$ 2,50 por saque. |
| Vast.ai | A Vast diz que os preços anunciados costumam ficar cerca de 25% acima do que os hosts recebem | Wise, PayPal ou Stripe. Mínimo de US$ 20, faturado semanalmente. |
| Salad | Não divulgada | PayPal, vale-presentes, jogos e mais |

A configuração também muda. Os hosts da Vast.ai rodam Ubuntu, e os locatários recebem contêineres no host com acesso por SSH ou Jupyter. O Salad roda no Windows 10 ou 11. No GPUFlow você roda um único comando em um computador Linux com systemd; os locatários só acessam seus modelos de IA por meio de uma API, [nunca um shell na sua máquina](/pt_br/is-it-safe-to-rent-out-your-gpu/). [O que os locatários podem e não podem acessar](https://docs.gpuflow.app/pt-br/providers/security/).

## 3. Quanto custa a energia

A fórmula: **consumo em kW × seu preço por kWh = custo por hora.**

Para o consumo, usamos o board power oficial de cada placa. Ele fica perto do máximo que a placa consome sozinha; durante a geração de texto por IA, costuma ser menos. O consumo do resto do PC vem por cima. O jeito honesto é medir: o GPUFlow mostra o consumo da sua GPU em tempo real em **Minhas máquinas**, e um medidor de energia de tomada mostra o do PC inteiro.

| GPU | Board power |
| --- | --- |
| RTX 3060 | 170 W |
| RTX 4070 | 200 W |
| RTX 3090 | 350 W |
| RTX 4080 | 320 W |
| RTX 4090 | 450 W |
| RTX 5090 | 575 W |

Quanto custa em energia uma hora de uma RTX 4090 a 450 W:

| Onde | Tarifa residencial | Uma hora a 450 W |
| --- | --- | --- |
| Estados Unidos (previsão da média de 2026) | 18,2 ¢/kWh | cerca de US$ 0,08 |
| Canadá | C$ 0,170/kWh | cerca de C$ 0,08 |
| Reino Unido (teto de preço de out.–dez. de 2026) | 26,32 p/kWh | cerca de 11,8 p |
| Alemanha | € 0,3869/kWh | cerca de € 0,17 |
| França | € 0,2561/kWh | cerca de € 0,12 |

Nos EUA, a energia leva cerca de um quarto do que uma 4090 rende por hora alugada. Na Alemanha, a mesma hora custa cerca de € 0,17, então confira a sua tarifa antes de definir um preço.

## 4. Juntando tudo

Por hora alugada, no preço do meio da faixa, com a parte de 88% do GPUFlow e a energia na média dos EUA no board power máximo:

| GPU | Você recebe (88%) | Energia | Sobra por hora alugada | 4 h/dia (120 h/mês) | 12 h/dia (360 h/mês) |
| --- | --- | --- | --- | --- | --- |
| RTX 3060 12 GB | US$ 0,057 | US$ 0,031 | **US$ 0,026** | US$ 3,15 | US$ 9,45 |
| RTX 4070 | US$ 0,097 | US$ 0,036 | **US$ 0,060** | US$ 7,25 | US$ 21,74 |
| RTX 3090 | US$ 0,185 | US$ 0,064 | **US$ 0,121** | US$ 14,53 | US$ 43,60 |
| RTX 4080 | US$ 0,220 | US$ 0,058 | **US$ 0,162** | US$ 19,41 | US$ 58,23 |
| RTX 4090 | US$ 0,334 | US$ 0,082 | **US$ 0,253** | US$ 30,30 | US$ 90,90 |
| RTX 5090 | US$ 0,484 | US$ 0,105 | **US$ 0,379** | US$ 45,52 | US$ 136,57 |

Três coisas que esta tabela não inclui:

- **Tempo de espera.** Seu PC precisa estar ligado e online para os locatários o encontrarem. Enquanto espera, ele continua consumindo energia. Meça o consumo do PC em repouso e desconte isso também.
- **Desgaste.** Ventoinhas e pasta térmica envelhecem mais rápido sob cargas longas. Mantenha o gabinete bem ventilado e fique de olho na temperatura.
- **Impostos.** Renda de aluguel é renda. Como ela é tributada depende de onde você mora.

## O que os números dizem

- **RTX 3090, 4080, 4090 e 5090** podem render um valor que faz diferença, se forem alugadas várias horas por dia. A 3090 é a de melhor custo-benefício: 24 GB de memória com baixo custo de energia.
- **RTX 3060 e 4070** rendem muito pouco por hora. A US$ 3 por mês, uma 3060 levaria cerca de oito meses para chegar ao saque mínimo de US$ 25 do GPUFlow. Só compensa se a sua energia for barata ou se o PC já fica ligado de qualquer jeito.
- **A taxa de uso decide tudo.** A mesma 4090 rende US$ 30 ou US$ 91 por mês, dependendo de ser alugada 4 ou 12 horas por dia. Um preço justo e uma máquina que fica online com regularidade conseguem mais aluguéis do que um desconto de alguns centavos.

## Como conseguir mais horas alugadas

1. **Comece com um preço na metade de baixo da faixa.** Os locatários comparam. Você pode subir o preço quando os aluguéis começarem a aparecer.
2. **Fique online.** Uma GPU offline não pode ser alugada. No GPUFlow, os locatários podem clicar em **Notificar Quando Online** em uma GPU offline; você recebe um e-mail quando alguém está esperando.
3. **Ofereça modelos populares.** Informe no anúncio os modelos que você roda, por exemplo `qwen2.5:7b` ou `llama3.1:8b`. Os locatários buscam por eles.
4. **Olhe de novo depois de uma semana.** Alugada a maior parte do tempo? Suba um pouco o preço. Nenhum aluguel? Baixe um pouco.

No GPUFlow, o formulário do anúncio mostra onde o seu preço fica em comparação com outros sites de aluguel e com outros anúncios da mesma placa no GPUFlow, e quanto você ganha por hora depois da taxa:

![A barra de preço no formulário de anúncio do GPUFlow, mostrando um preço típico para uma RTX 4090 e o ganho depois da taxa](../_images/screens/pt_br/provider-price-bar.png)

## Onde os saques do GPUFlow funcionam

O GPUFlow paga pela Stripe para contas bancárias nos **Estados Unidos, Canadá, Reino Unido, Suíça e Espaço Econômico Europeu**. Se você mora em outro lugar, mesmo assim pode anunciar uma GPU e usar o que ganhar para alugar outras GPUs, mas ainda não pode sacar para um banco. Os ganhos ficam retidos por 7 dias (14 dias para contas com menos de 30 dias) antes de você poder sacá-los. [Como receber no GPUFlow](https://docs.gpuflow.app/pt-br/providers/getting-paid/).

## Faça as contas com os seus números

**(preço por hora × 0,88) − (watts ÷ 1.000 × preço por kWh) = o que sobra por hora alugada**

Depois multiplique pelas horas que você espera, sendo realista. Se o resultado for alguns dólares por mês, provavelmente não compensa o desgaste. Se forem dezenas de dólares, vale testar por um mês e olhar os números reais.

Para começar, veja [coloque sua GPU online](https://docs.gpuflow.app/pt-br/providers/getting-started/) e [como definir o preço da sua GPU](https://docs.gpuflow.app/pt-br/providers/pricing/).

## Artigos relacionados

- [GPUFlow vs Vast.ai vs RunPod vs SaladCloud: qual combina com o seu trabalho](/pt_br/gpuflow-vs-vast-ai-vs-runpod/)
- [Quanto custa de verdade alugar uma GPU: o que o preço por hora não mostra](/pt_br/hidden-fees-in-gpu-rental/)

## Fontes

Tudo verificado em setembro de 2026.

- Faixas de preço de aluguel de GPU: [documentação do GPUFlow, Como definir o preço da sua GPU](https://docs.gpuflow.app/pt-br/providers/pricing/)
- Taxa, retenção e saques do GPUFlow: [documentação do GPUFlow, Como receber](https://docs.gpuflow.app/pt-br/providers/getting-paid/)
- Ganhos dos hosts da Vast.ai: [artigo da vast.ai](https://vast.ai/article/how-much-money-can-you-earn-renting-out-your-gpu-on-vast-ai) (18 de maio de 2026); saques: [docs.vast.ai/host/payment.md](https://docs.vast.ai/host/payment.md); requisitos para hospedar: [docs.vast.ai/host/hosting-overview.md](https://docs.vast.ai/host/hosting-overview.md)
- Salad: [salad.com/download](https://salad.com/download/), [resgate via PayPal](https://support.salad.com/rewards/redeeming-your-rewards/how-to-redeem-paypal/)
- Board power: páginas de produto da NVIDIA para [RTX 3060](https://www.nvidia.com/en-us/geforce/graphics-cards/30-series/rtx-3060-3060ti/), [RTX 4080](https://www.nvidia.com/en-us/geforce/graphics-cards/40-series/rtx-4080-family/), [RTX 4090](https://www.nvidia.com/en-us/geforce/graphics-cards/40-series/rtx-4090/), [RTX 5090](https://www.nvidia.com/en-us/geforce/graphics-cards/50-series/rtx-5090/); RTX 3090: [TechPowerUp](https://www.techpowerup.com/gpu-specs/geforce-rtx-3090.c3622); RTX 4070: [TechSpot](https://www.techspot.com/review/2663-nvidia-geforce-rtx-4070/)
- Energia nos EUA: [EIA Short-Term Energy Outlook](https://www.eia.gov/outlooks/steo/report/elec_coal_renew.php) (setembro de 2026)
- Energia no Reino Unido: [teto de preço da Ofgem](https://www.ofgem.gov.uk/your-energy-supply/your-energy-bill/energy-price-cap-unit-rates-and-standing-charges)
- Energia na Alemanha e na França, segundo semestre de 2025: [estatísticas de preços de eletricidade do Eurostat](https://ec.europa.eu/eurostat/statistics-explained/index.php?title=Electricity_price_statistics), [dados nrg_pc_204 do Eurostat para a França](https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/nrg_pc_204?geo=FR&nrg_cons=KWH2500-4999&unit=KWH&tax=I_TAX&currency=EUR&lastTimePeriod=1)
- Energia no Canadá, junho de 2025: [GlobalPetrolPrices](https://www.globalpetrolprices.com/Canada/electricity_prices/)
