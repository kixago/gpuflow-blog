---
title: "Cobrança de GPU por segundo ou por hora: quanto custam de verdade os trabalhos curtos"
description: "A US$ 0,40/h, um teste de 90 segundos na GPU custa 1¢ com cobrança por segundo e 40¢ com cobrança por hora. Exemplos com as contas, um gráfico em escala e o incremento e o mínimo de cada plataforma."
excerpt: "O incremento de cobrança decide quanto custam os trabalhos curtos de GPU. Calculamos cinco durações com cobrança por segundo, por minuto e por hora cheia, e listamos o que cada plataforma usa de fato."
pubDate: 2026-09-30
locale: "pt_br"
category: "pricing"
featured: false
draft: false
author: "GPUFlow Team"
heroImage: "../_images/per-second-vs-hourly-gpu-billing-hero.png"
heroImageAlt: "Ilustração de um cronômetro ao lado de uma linha de custo em forma de escada"
faq:
  - question: "Cobrança de GPU por segundo é mais barata que por hora?"
    answer: "Para trabalhos curtos, muito mais. A US$ 0,40 por hora, um teste de 90 segundos custa 1¢ com cobrança por segundo e mínimo de 60 segundos, e 40¢ com cobrança por hora cheia. Em execuções longas, a diferença cai para no máximo uma hora parcial por sessão."
  - question: "Qual é a cobrança mínima de uma instância AWS EC2?"
    answer: "A AWS cobra por segundo as instâncias On-Demand com Linux, Windows, RHEL e Ubuntu Pro, com mínimo de 60 segundos. Instâncias com SUSE Linux Enterprise Server são cobradas por hora cheia."
  - question: "O Azure cobra as máquinas virtuais por segundo ou por minuto?"
    answer: "Por minuto. O FAQ de preços de VMs Linux do Azure diz que ele cobra pelo número de minutos completos em que a VM roda, então uma VM que roda 6 minutos e 45 segundos é cobrada por 6 minutos."
  - question: "O Google Cloud cobra um mínimo pelas instâncias com GPU?"
    answer: "Sim. O Compute Engine cobra vCPUs, GPUs e memória por pelo menos 1 minuto e, depois disso, em incrementos de 1 segundo."
  - question: "Quanto eu pago no GPUFlow se encerrar um aluguel antes?"
    answer: "Os segundos que você usou, com mínimo de 60 segundos, arredondados para cima até o centavo seguinte e nunca mais do que o valor reservado. O valor total reservado é retido quando o aluguel começa, e a parte não usada volta para os seus créditos quando ele termina."
  - question: "O que acontece com meu aluguel no GPUFlow se a máquina do provedor ficar offline?"
    answer: "Se a máquina passar 10 minutos sem enviar heartbeat, o aluguel termina sozinho. Você só paga até o último heartbeat da máquina, e o resto da reserva volta para os seus créditos."
---

A US$ 0,40 por hora, um teste de 90 segundos custa 1¢ (¢ = centavo de dólar) se você for cobrado por segundo com mínimo de 60 segundos, 1,3¢ se for cobrado por minuto e 40¢ se for cobrado por hora cheia. Essa diferença de 40 vezes é tudo o que importa em trabalhos curtos. Quando um trabalho passa de alguns minutos, a cobrança por segundo e a por minuto diferem em menos de um centavo, e quem decide a conta é o tempo ocioso, o tempo de preparação e o armazenamento.

Abaixo: as regras publicadas de cada plataforma, exemplos com as contas, um gráfico em escala e como o modelo do GPUFlow, que reserva primeiro e devolve o resto, vira uma cobrança. Regras e preços são de setembro de 2026; as fontes estão no final.

## Três formas de contar o tempo de GPU

Todo aluguel de GPU tem um preço por hora. A diferença está em como o tempo que você usou vira tempo cobrável antes de ser multiplicado por esse preço.

- **Por segundo, com mínimo.** Contam-se os segundos. Se o total ficar abaixo do mínimo (geralmente 60 segundos), cobra-se o mínimo. Custo = max(60, segundos) × preço por hora / 3.600.
- **Por minuto.** Contam-se os minutos. As plataformas tratam o minuto parcial de formas diferentes: algumas arredondam para cima, o Azure descarta. Nos exemplos abaixo eu arredondo para cima, que é o pior caso para você. Custo = minutos × preço por hora / 60.
- **Hora cheia.** Qualquer hora iniciada conta como hora inteira. Um trabalho de 61 minutos vira duas horas. Custo = ceil(segundos / 3.600) × preço por hora.

O mínimo pesa mais do que se imagina. Cobrança por segundo com mínimo de 60 segundos e cobrança por minuto são idênticas para qualquer coisa abaixo de um minuto. O incremento só muda a fração que sobra no fim de um trabalho, então nunca pode custar mais do que um incremento por sessão: pouco menos de 40¢ por sessão na cobrança por hora a US$ 0,40, e menos de 0,7¢ por sessão na cobrança por minuto com o mesmo preço (59 segundos × 40 / 3.600 = 0,66¢).

## O que cada plataforma usa

Estas são as regras publicadas para instâncias sob demanda, conferidas na documentação de cada fornecedor em setembro de 2026.

| Plataforma | Incremento | Mínimo | O que diz a documentação |
| --- | --- | --- | --- |
| AWS EC2 On-Demand | Por segundo | 60 segundos | Vale para Linux, Windows, RHEL e Ubuntu Pro. SUSE Linux Enterprise Server é cobrado por hora cheia. |
| Google Cloud Compute Engine | Por segundo | 1 minuto | "Todas as vCPUs, GPUs e GB de memória são cobrados por no mínimo 1 minuto." |
| Azure Virtual Machines | Por minuto | Não informado | Cobra "o número de minutos completos"; uma VM que roda 6 min 45 s é cobrada por 6 minutos. |
| Lambda (nuvem sob demanda) | Por minuto | Não informado | Cobra "em incrementos de um minuto" desde que a instância passa nas verificações de saúde até você encerrá-la. |
| RunPod Pods | Por segundo | Não informado | Computação e armazenamento cobrados por segundo. |
| Vast.ai | Por segundo | Não informado | Aluguel ativo cobrado a cada segundo; armazenamento cobrado a cada segundo em que a instância existe, a menos que esteja offline. |
| GPUFlow | Por segundo | 60 segundos | Segundos inteiros, arredondados para cima até o centavo, limitados ao valor reservado. |

Duas observações para ler a tabela. A regra do Azure na verdade arredonda para baixo: o FAQ diz que você "não é cobrado por segundos extras". A documentação da Lambda fala em incrementos de um minuto sem dizer para que lado vai o minuto parcial, então não supus nenhum dos dois. E "não informado" quer dizer exatamente isso: a documentação que li não cita um mínimo, o que é diferente de um zero documentado.

Nenhuma dessas plataformas arredonda a computação de GPU para a hora cheia nos tipos de instância acima. O arredondamento por hora ainda aparece nas letras miúdas, como no caso do SUSE na AWS, então confira a página de cobrança antes de rodar muitos trabalhos curtos num lugar novo.

## Cinco trabalhos a US$ 0,40 por hora

Aqui está um único preço, US$ 0,40 por hora, aplicado a cinco durações. Isso dá 40¢ a cada 3.600 segundos, ou 1/90 de centavo por segundo.

**Um teste de 90 segundos.** Por segundo: 90 × 40 / 3.600 = 1,0¢. Por minuto: 2 minutos × 40 / 60 = 1,33¢. Hora cheia: 40¢. A conta por hora sai 40 vezes a conta por segundo.

**7 minutos e 30 segundos.** Por segundo: 450 × 40 / 3.600 = 5,0¢. Por minuto: 8 minutos × 40 / 60 = 5,33¢. Hora cheia: 40¢, 8 vezes mais.

**38 minutos e 20 segundos.** Por segundo: 2.300 × 40 / 3.600 = 25,56¢. Por minuto: 39 minutos × 40 / 60 = 26,0¢. Hora cheia: 40¢, cerca de 1,57 vez mais.

**61 minutos.** Por segundo: 3.660 × 40 / 3.600 = 40,67¢. Por minuto: 61 × 40 / 60 = 40,67¢ (o trabalho termina num minuto exato, então os dois coincidem). Hora cheia: duas horas, 80¢. Um minuto a mais quase dobra a conta por hora.

| Duração do trabalho | Por segundo (mín. 60 s) | Por minuto (para cima) | Hora cheia | Cobrança no GPUFlow |
| --- | --- | --- | --- | --- |
| 1 min 30 s | 1,00¢ | 1,33¢ | 40¢ | 1¢ |
| 7 min 30 s | 5,00¢ | 5,33¢ | 40¢ | 5¢ |
| 38 min 20 s | 25,56¢ | 26,00¢ | 40¢ | 26¢ |
| 61 min | 40,67¢ | 40,67¢ | 80¢ | 41¢ |
| 20 trabalhos de 2 min 30 s | 33,33¢ | 40,00¢ | US$ 8,00 | 40¢ (20 aluguéis) |

A coluna do GPUFlow é o resultado por segundo arredondado para cima até o centavo inteiro em cada aluguel, que é o que o código de cobrança dele faz. A última linha é explicada duas seções adiante.

## Custo por duração do trabalho, em escala

O primeiro gráfico vai de 0 a 150 minutos. A escada da cobrança por minuto tem degraus de 1 minuto de largura e 0,67¢ de altura, então nesta escala ela fica em cima da linha por segundo. A escada que importa é a da hora cheia: ela salta 40¢ em 0, 60 e 120 minutos.

<figure>
<svg viewBox="0 0 720 400" role="img" aria-labelledby="d1-title" xmlns="http://www.w3.org/2000/svg" font-family="system-ui, sans-serif" font-size="15">
<title id="d1-title">Custo de um trabalho a 0,40 dólar por hora, de 0 a 150 minutos, com cobrança por segundo, por minuto e por hora cheia</title>
<rect x="0" y="0" width="720" height="400" fill="#ffffff"/>
<line x1="90" y1="320.0" x2="690" y2="320.0" stroke="#e2e8f0" stroke-width="1"/>
<text x="82" y="325.0" text-anchor="end" fill="#64748b" font-size="13">$0.00</text>
<line x1="90" y1="275.0" x2="690" y2="275.0" stroke="#e2e8f0" stroke-width="1"/>
<text x="82" y="280.0" text-anchor="end" fill="#64748b" font-size="13">$0.20</text>
<line x1="90" y1="230.0" x2="690" y2="230.0" stroke="#e2e8f0" stroke-width="1"/>
<text x="82" y="235.0" text-anchor="end" fill="#64748b" font-size="13">$0.40</text>
<line x1="90" y1="185.0" x2="690" y2="185.0" stroke="#e2e8f0" stroke-width="1"/>
<text x="82" y="190.0" text-anchor="end" fill="#64748b" font-size="13">$0.60</text>
<line x1="90" y1="140.0" x2="690" y2="140.0" stroke="#e2e8f0" stroke-width="1"/>
<text x="82" y="145.0" text-anchor="end" fill="#64748b" font-size="13">$0.80</text>
<line x1="90" y1="95.0" x2="690" y2="95.0" stroke="#e2e8f0" stroke-width="1"/>
<text x="82" y="100.0" text-anchor="end" fill="#64748b" font-size="13">$1.00</text>
<line x1="90" y1="50.0" x2="690" y2="50.0" stroke="#e2e8f0" stroke-width="1"/>
<text x="82" y="55.0" text-anchor="end" fill="#64748b" font-size="13">$1.20</text>
<line x1="90.0" y1="320" x2="90.0" y2="325" stroke="#64748b" stroke-width="1"/>
<text x="90.0" y="342" text-anchor="middle" fill="#64748b" font-size="13">0</text>
<line x1="210.0" y1="320" x2="210.0" y2="325" stroke="#64748b" stroke-width="1"/>
<text x="210.0" y="342" text-anchor="middle" fill="#64748b" font-size="13">30</text>
<line x1="330.0" y1="320" x2="330.0" y2="325" stroke="#64748b" stroke-width="1"/>
<text x="330.0" y="342" text-anchor="middle" fill="#64748b" font-size="13">60</text>
<line x1="450.0" y1="320" x2="450.0" y2="325" stroke="#64748b" stroke-width="1"/>
<text x="450.0" y="342" text-anchor="middle" fill="#64748b" font-size="13">90</text>
<line x1="570.0" y1="320" x2="570.0" y2="325" stroke="#64748b" stroke-width="1"/>
<text x="570.0" y="342" text-anchor="middle" fill="#64748b" font-size="13">120</text>
<line x1="690.0" y1="320" x2="690.0" y2="325" stroke="#64748b" stroke-width="1"/>
<text x="690.0" y="342" text-anchor="middle" fill="#64748b" font-size="13">150</text>
<line x1="90" y1="320" x2="690" y2="320" stroke="#64748b" stroke-width="1.5"/>
<line x1="90" y1="50" x2="90" y2="320" stroke="#64748b" stroke-width="1.5"/>
<text x="390.0" y="365" text-anchor="middle" fill="#1e1b4b">Duração do trabalho (minutos)</text>
<text x="22" y="185.0" text-anchor="middle" fill="#1e1b4b" transform="rotate(-90 22 185.0)">Custo a $0.40 por hora</text>
<polyline fill="none" stroke="#f97316" stroke-width="3" points="90.0,230.0 330.0,230.0 330.0,140.0 570.0,140.0 570.0,50.0 690.0,50.0"/>
<polyline fill="none" stroke="#16a34a" stroke-width="2.5" stroke-dasharray="6 4" points="90.0,318.5 94.0,318.5 94.0,317.0 98.0,317.0 98.0,315.5 102.0,315.5 102.0,314.0 106.0,314.0 106.0,312.5 110.0,312.5 110.0,311.0 114.0,311.0 114.0,309.5 118.0,309.5 118.0,308.0 122.0,308.0 122.0,306.5 126.0,306.5 126.0,305.0 130.0,305.0 130.0,303.5 134.0,303.5 134.0,302.0 138.0,302.0 138.0,300.5 142.0,300.5 142.0,299.0 146.0,299.0 146.0,297.5 150.0,297.5 150.0,296.0 154.0,296.0 154.0,294.5 158.0,294.5 158.0,293.0 162.0,293.0 162.0,291.5 166.0,291.5 166.0,290.0 170.0,290.0 170.0,288.5 174.0,288.5 174.0,287.0 178.0,287.0 178.0,285.5 182.0,285.5 182.0,284.0 186.0,284.0 186.0,282.5 190.0,282.5 190.0,281.0 194.0,281.0 194.0,279.5 198.0,279.5 198.0,278.0 202.0,278.0 202.0,276.5 206.0,276.5 206.0,275.0 210.0,275.0 210.0,273.5 214.0,273.5 214.0,272.0 218.0,272.0 218.0,270.5 222.0,270.5 222.0,269.0 226.0,269.0 226.0,267.5 230.0,267.5 230.0,266.0 234.0,266.0 234.0,264.5 238.0,264.5 238.0,263.0 242.0,263.0 242.0,261.5 246.0,261.5 246.0,260.0 250.0,260.0 250.0,258.5 254.0,258.5 254.0,257.0 258.0,257.0 258.0,255.5 262.0,255.5 262.0,254.0 266.0,254.0 266.0,252.5 270.0,252.5 270.0,251.0 274.0,251.0 274.0,249.5 278.0,249.5 278.0,248.0 282.0,248.0 282.0,246.5 286.0,246.5 286.0,245.0 290.0,245.0 290.0,243.5 294.0,243.5 294.0,242.0 298.0,242.0 298.0,240.5 302.0,240.5 302.0,239.0 306.0,239.0 306.0,237.5 310.0,237.5 310.0,236.0 314.0,236.0 314.0,234.5 318.0,234.5 318.0,233.0 322.0,233.0 322.0,231.5 326.0,231.5 326.0,230.0 330.0,230.0 330.0,228.5 334.0,228.5 334.0,227.0 338.0,227.0 338.0,225.5 342.0,225.5 342.0,224.0 346.0,224.0 346.0,222.5 350.0,222.5 350.0,221.0 354.0,221.0 354.0,219.5 358.0,219.5 358.0,218.0 362.0,218.0 362.0,216.5 366.0,216.5 366.0,215.0 370.0,215.0 370.0,213.5 374.0,213.5 374.0,212.0 378.0,212.0 378.0,210.5 382.0,210.5 382.0,209.0 386.0,209.0 386.0,207.5 390.0,207.5 390.0,206.0 394.0,206.0 394.0,204.5 398.0,204.5 398.0,203.0 402.0,203.0 402.0,201.5 406.0,201.5 406.0,200.0 410.0,200.0 410.0,198.5 414.0,198.5 414.0,197.0 418.0,197.0 418.0,195.5 422.0,195.5 422.0,194.0 426.0,194.0 426.0,192.5 430.0,192.5 430.0,191.0 434.0,191.0 434.0,189.5 438.0,189.5 438.0,188.0 442.0,188.0 442.0,186.5 446.0,186.5 446.0,185.0 450.0,185.0 450.0,183.5 454.0,183.5 454.0,182.0 458.0,182.0 458.0,180.5 462.0,180.5 462.0,179.0 466.0,179.0 466.0,177.5 470.0,177.5 470.0,176.0 474.0,176.0 474.0,174.5 478.0,174.5 478.0,173.0 482.0,173.0 482.0,171.5 486.0,171.5 486.0,170.0 490.0,170.0 490.0,168.5 494.0,168.5 494.0,167.0 498.0,167.0 498.0,165.5 502.0,165.5 502.0,164.0 506.0,164.0 506.0,162.5 510.0,162.5 510.0,161.0 514.0,161.0 514.0,159.5 518.0,159.5 518.0,158.0 522.0,158.0 522.0,156.5 526.0,156.5 526.0,155.0 530.0,155.0 530.0,153.5 534.0,153.5 534.0,152.0 538.0,152.0 538.0,150.5 542.0,150.5 542.0,149.0 546.0,149.0 546.0,147.5 550.0,147.5 550.0,146.0 554.0,146.0 554.0,144.5 558.0,144.5 558.0,143.0 562.0,143.0 562.0,141.5 566.0,141.5 566.0,140.0 570.0,140.0 570.0,138.5 574.0,138.5 574.0,137.0 578.0,137.0 578.0,135.5 582.0,135.5 582.0,134.0 586.0,134.0 586.0,132.5 590.0,132.5 590.0,131.0 594.0,131.0 594.0,129.5 598.0,129.5 598.0,128.0 602.0,128.0 602.0,126.5 606.0,126.5 606.0,125.0 610.0,125.0 610.0,123.5 614.0,123.5 614.0,122.0 618.0,122.0 618.0,120.5 622.0,120.5 622.0,119.0 626.0,119.0 626.0,117.5 630.0,117.5 630.0,116.0 634.0,116.0 634.0,114.5 638.0,114.5 638.0,113.0 642.0,113.0 642.0,111.5 646.0,111.5 646.0,110.0 650.0,110.0 650.0,108.5 654.0,108.5 654.0,107.0 658.0,107.0 658.0,105.5 662.0,105.5 662.0,104.0 666.0,104.0 666.0,102.5 670.0,102.5 670.0,101.0 674.0,101.0 674.0,99.5 678.0,99.5 678.0,98.0 682.0,98.0 682.0,96.5 686.0,96.5 686.0,95.0 690.0,95.0"/>
<polyline fill="none" stroke="#6366f1" stroke-width="2.5" points="90.0,318.5 94.0,318.5 690.0,95.0"/>
<line x1="110" y1="22" x2="138" y2="22" stroke="#6366f1" stroke-width="3"/><text x="144" y="27" fill="#1e1b4b" font-size="13">Por segundo, mín. 60 s</text>
<line x1="330" y1="22" x2="358" y2="22" stroke="#16a34a" stroke-width="3" stroke-dasharray="6 4"/><text x="364" y="27" fill="#1e1b4b">Por minuto</text>
<line x1="480" y1="22" x2="508" y2="22" stroke="#f97316" stroke-width="3"/><text x="514" y="27" fill="#1e1b4b">Hora cheia</text>
</svg>
<figcaption>Custo de um trabalho a US$ 0,40 por hora. A cobrança por hora (laranja) cobra o degrau inteiro de 40¢ assim que uma nova hora começa; a cobrança por segundo e a por minuto são quase a mesma linha.</figcaption>
</figure>

A distância entre a escada laranja e a linha azul é o que o arredondamento por hora custa por trabalho: máxima logo depois de cada degrau, zero em horas exatas.

Ampliando os primeiros dez minutos, a cobrança por minuto mostra os seus degraus, e o mínimo de 60 segundos aparece como o início plano da linha por segundo. A cobrança por hora cheia seria uma linha reta em 40¢, cinco vezes acima do topo deste gráfico.

<figure>
<svg viewBox="0 0 720 400" role="img" aria-labelledby="d2-title" xmlns="http://www.w3.org/2000/svg" font-family="system-ui, sans-serif" font-size="15">
<title id="d2-title">Ampliação dos primeiros 10 minutos a 0,40 dólar por hora: cobrança por segundo e por minuto, com a cobrança por hora cheia fora da escala</title>
<rect x="0" y="0" width="720" height="400" fill="#ffffff"/>
<line x1="90" y1="320.0" x2="690" y2="320.0" stroke="#e2e8f0" stroke-width="1"/>
<text x="82" y="325.0" text-anchor="end" fill="#64748b" font-size="13">0¢</text>
<line x1="90" y1="252.5" x2="690" y2="252.5" stroke="#e2e8f0" stroke-width="1"/>
<text x="82" y="257.5" text-anchor="end" fill="#64748b" font-size="13">2¢</text>
<line x1="90" y1="185.0" x2="690" y2="185.0" stroke="#e2e8f0" stroke-width="1"/>
<text x="82" y="190.0" text-anchor="end" fill="#64748b" font-size="13">4¢</text>
<line x1="90" y1="117.5" x2="690" y2="117.5" stroke="#e2e8f0" stroke-width="1"/>
<text x="82" y="122.5" text-anchor="end" fill="#64748b" font-size="13">6¢</text>
<line x1="90" y1="50.0" x2="690" y2="50.0" stroke="#e2e8f0" stroke-width="1"/>
<text x="82" y="55.0" text-anchor="end" fill="#64748b" font-size="13">8¢</text>
<line x1="90.0" y1="320" x2="90.0" y2="325" stroke="#64748b" stroke-width="1"/>
<text x="90.0" y="342" text-anchor="middle" fill="#64748b" font-size="13">0</text>
<line x1="150.0" y1="320" x2="150.0" y2="325" stroke="#64748b" stroke-width="1"/>
<text x="150.0" y="342" text-anchor="middle" fill="#64748b" font-size="13">1</text>
<line x1="210.0" y1="320" x2="210.0" y2="325" stroke="#64748b" stroke-width="1"/>
<text x="210.0" y="342" text-anchor="middle" fill="#64748b" font-size="13">2</text>
<line x1="270.0" y1="320" x2="270.0" y2="325" stroke="#64748b" stroke-width="1"/>
<text x="270.0" y="342" text-anchor="middle" fill="#64748b" font-size="13">3</text>
<line x1="330.0" y1="320" x2="330.0" y2="325" stroke="#64748b" stroke-width="1"/>
<text x="330.0" y="342" text-anchor="middle" fill="#64748b" font-size="13">4</text>
<line x1="390.0" y1="320" x2="390.0" y2="325" stroke="#64748b" stroke-width="1"/>
<text x="390.0" y="342" text-anchor="middle" fill="#64748b" font-size="13">5</text>
<line x1="450.0" y1="320" x2="450.0" y2="325" stroke="#64748b" stroke-width="1"/>
<text x="450.0" y="342" text-anchor="middle" fill="#64748b" font-size="13">6</text>
<line x1="510.0" y1="320" x2="510.0" y2="325" stroke="#64748b" stroke-width="1"/>
<text x="510.0" y="342" text-anchor="middle" fill="#64748b" font-size="13">7</text>
<line x1="570.0" y1="320" x2="570.0" y2="325" stroke="#64748b" stroke-width="1"/>
<text x="570.0" y="342" text-anchor="middle" fill="#64748b" font-size="13">8</text>
<line x1="630.0" y1="320" x2="630.0" y2="325" stroke="#64748b" stroke-width="1"/>
<text x="630.0" y="342" text-anchor="middle" fill="#64748b" font-size="13">9</text>
<line x1="690.0" y1="320" x2="690.0" y2="325" stroke="#64748b" stroke-width="1"/>
<text x="690.0" y="342" text-anchor="middle" fill="#64748b" font-size="13">10</text>
<line x1="90" y1="320" x2="690" y2="320" stroke="#64748b" stroke-width="1.5"/>
<line x1="90" y1="50" x2="90" y2="320" stroke="#64748b" stroke-width="1.5"/>
<text x="390.0" y="365" text-anchor="middle" fill="#1e1b4b">Duração do trabalho (minutos)</text>
<text x="22" y="185.0" text-anchor="middle" fill="#1e1b4b" transform="rotate(-90 22 185.0)">Custo a $0.40 por hora</text>
<polyline fill="none" stroke="#16a34a" stroke-width="2.5" stroke-dasharray="6 4" points="90.0,297.5 150.0,297.5 150.0,275.0 210.0,275.0 210.0,252.5 270.0,252.5 270.0,230.0 330.0,230.0 330.0,207.5 390.0,207.5 390.0,185.0 450.0,185.0 450.0,162.5 510.0,162.5 510.0,140.0 570.0,140.0 570.0,117.5 630.0,117.5 630.0,95.0 690.0,95.0"/>
<polyline fill="none" stroke="#6366f1" stroke-width="2.5" points="90.0,297.5 150.0,297.5 690.0,95.0"/>
<text x="104" y="74" text-anchor="start" fill="#f97316">Hora cheia: $0.40 para qualquer um destes (fora do gráfico)</text>
<line x1="110" y1="22" x2="138" y2="22" stroke="#6366f1" stroke-width="3"/><text x="144" y="27" fill="#1e1b4b" font-size="13">Por segundo, mín. 60 s</text>
<line x1="330" y1="22" x2="358" y2="22" stroke="#16a34a" stroke-width="3" stroke-dasharray="6 4"/><text x="364" y="27" fill="#1e1b4b">Por minuto</text>
<line x1="480" y1="22" x2="508" y2="22" stroke="#f97316" stroke-width="3"/><text x="514" y="27" fill="#1e1b4b">Hora cheia</text>
</svg>
<figcaption>Os primeiros 10 minutos a US$ 0,40 por hora. As duas linhas começam em 0,67¢ por causa do mínimo de um minuto. A linha por minuto (verde) nunca fica mais de 0,67¢ acima da linha por segundo (azul).</figcaption>
</figure>

## Um dia de trabalhos curtos

Trabalho curto raramente vem sozinho. Digamos que você rode 20 trabalhos num dia de expediente, cada um de 2 minutos e 30 segundos, e suba uma instância nova para cada um.

- **Por segundo:** 20 × 150 s = 3.000 s, e 3.000 × 40 / 3.600 = 33,33¢.
- **Por minuto, arredondando para cima:** cada trabalho vira 3 minutos, 60 minutos no total: 40¢.
- **Hora cheia:** cada trabalho é uma hora iniciada: 20 × 40¢ = US$ 8,00.

A cobrança por hora custa 24 vezes mais pelos mesmos 50 minutos de trabalho na GPU. A saída óbvia é deixar uma única máquina ligada o dia todo. Oito horas a US$ 0,40 dão US$ 3,20, o que ganha dos US$ 8,00, mas ainda é 9,6 vezes a conta por segundo, porque agora você paga pelos intervalos entre os trabalhos.

Esse exemplo favorece a abordagem de instância nova, porque supõe que o trabalho começa no instante em que a máquina liga. Não é assim. Só para ilustrar, suponha que cada inicialização gaste 3 minutos subindo o sistema, baixando uma imagem e carregando um modelo antes de o trabalho começar (o seu número vai ser outro). A cobrança por segundo passa a ser de 20 × 330 s = 6.600 s, ou 73,33¢, mais que o dobro dos 33,33¢ de trabalho real. O incremento é o mesmo; o desperdício foi para a preparação.

No GPUFlow o mesmo dia fica um pouco diferente, porque o aluguel é reservado em horas inteiras e cobrado por segundo. Iniciar 20 aluguéis separados de 150 s custa ceil(150 × 40 / 3.600) = ceil(1,67) = 2¢ cada, ou seja, 40¢ no total. Arredondar cada aluguel para cima até o centavo inteiro acrescenta 0,33¢ por trabalho aqui, e é daí que vêm os 6,67¢ a mais em relação ao total por segundo. Se os trabalhos vierem concentrados, lembre do limite de 10 novos aluguéis por hora por usuário. Manter um único aluguel aberto o dia todo custa o tempo de relógio inteiro, 8 horas = US$ 3,20, porque o GPUFlow cobra por tempo, não por token.

## O que importa mais do que o incremento

Quando os trabalhos passam de uns dez minutos, a diferença entre por segundo e por minuto é erro de arredondamento. Estas três coisas não são. Elas são tratadas com mais detalhe em [quanto custa de verdade alugar uma GPU](/pt_br/hidden-fees-in-gpu-rental/).

### Tempo ocioso

Toda plataforma com cobrança por segundo cobra uma instância ligada, esteja a GPU trabalhando ou não. A documentação da Lambda diz isso com todas as letras: as instâncias são cobradas "estejam elas sendo usadas ativamente ou não". O dia de trabalhos curtos acima mostra a escala: 50 minutos de trabalho, US$ 3,20 se a máquina ficar ligada por 8 horas. Nenhum incremento de cobrança resolve uma máquina que você esqueceu de desligar.

### Tempo de preparação

Boot, download de imagens e de modelos: tudo acontece com o taxímetro rodando. A Lambda começa a cobrar quando a instância passa nas verificações de saúde, antes de o seu código fazer qualquer coisa. A cobrança por segundo não elimina esse custo; você o paga a cada inicialização.

### Armazenamento com a máquina parada

Parar uma máquina geralmente para a cobrança da GPU. O disco continua sendo cobrado. O RunPod cobra o volume de um pod parado a US$ 0,20 por GB por mês, o dobro do preço com ele rodando, e a documentação avisa que "as cobranças de armazenamento continuam acumulando em Pods parados". O Vast.ai diz claramente que "parar uma instância não evita os custos de armazenamento". Um volume de 100 GB deixado num pod parado no RunPod custa 100 × US$ 0,20 = US$ 20 por mês, o equivalente a 50 horas de GPU a US$ 0,40.

Se a sua carga de trabalho são chamadas a um modelo, e não o seu próprio código rodando numa máquina, compare também com o preço por token: [GPU por hora ou API por token](/pt_br/hourly-gpu-vs-per-token-api/) mostra quando cada um sai mais barato.

## Como o GPUFlow cobra: reserva primeiro, devolve o resto

O GPUFlow aluga inferência: você recebe uma chave de API compatível com a OpenAI para um modelo rodando na GPU de alguém, não uma máquina. Não há shell, disco nem imagem para pagar, então o armazenamento e a preparação da seção anterior não se aplicam. O tempo ocioso, sim: o aluguel é cobrado do início ao fim, com a GPU ocupada ou não.

Os passos são:

1. Você escolhe um anúncio e um número inteiro de horas (de 1 a 168 por padrão). O preço por hora do provedor é convertido em centavos inteiros.
2. No início, o valor total reservado sai dos seus créditos: preço em centavos × horas. É o valor inteiro, retido antecipadamente.
3. Quando o aluguel termina, a cobrança é calculada uma única vez: segundos inteiros usados, no mínimo 60, vezes o preço em centavos, dividido por 3.600, arredondado para cima até o centavo seguinte e nunca acima da reserva.
4. O que sobra da reserva volta para os seus créditos disponíveis no mesmo passo.

![O formulário de aluguel do GPUFlow para uma GPU de US$ 0,35 por hora, com 2 horas preenchidas, US$ 0,70 reservados dos créditos e o botão Iniciar aluguel de 2 h em destaque](../_images/screens/pt_br/renter-rent.png)

O formulário de aluguel mostra a reserva antes de você começar: 2 horas a US$ 0,35 reservam US$ 0,70.

### Um exemplo com as contas

Reserve 3 horas a US$ 0,40. A reserva é de 40¢ × 3 = 120¢ (US$ 1,20). Você clica em **Encerrar agora** depois de 38 minutos e 20 segundos, ou seja, 2.300 segundos.

- Cobrança: ceil(2.300 × 40 / 3.600) = ceil(25,56) = **26¢**.
- Devolvido aos seus créditos: 120 − 26 = **94¢**.
- A taxa da plataforma é de 12% da cobrança, arredondada para o centavo mais próximo em cada aluguel: round(26 × 0,12) = round(3,12) = 3¢. O provedor recebe 26 − 3 = 23¢, que é 88,5% desta cobrança, e não exatamente 88%. Em cobranças maiores o arredondamento pesa menos.

<figure>
<svg viewBox="0 0 720 230" role="img" aria-labelledby="d3-title" xmlns="http://www.w3.org/2000/svg" font-family="system-ui, sans-serif" font-size="15">
<title id="d3-title">Uma reserva de 120 centavos para 3 horas a 0,40 dólar por hora, encerrada depois de 38 minutos e 20 segundos: 26 centavos cobrados, 94 centavos devolvidos, e os 26 centavos divididos em 23 centavos para o provedor e 3 centavos para o GPUFlow</title>
<rect x="0" y="0" width="720" height="230" fill="#ffffff"/>
<text x="60" y="30" fill="#1e1b4b">Reservado no início: 120¢ ($0.40 × 3 horas)</text>
<rect x="60" y="45" width="130" height="50" fill="#6366f1"/>
<rect x="190" y="45" width="470" height="50" fill="#eef2ff" stroke="#6366f1" stroke-width="2"/>
<text x="125" y="76" text-anchor="middle" fill="#ffffff">26¢</text>
<text x="425" y="76" text-anchor="middle" fill="#1e1b4b">94¢ de volta aos seus créditos</text>
<line x1="60" y1="95" x2="60" y2="150" stroke="#64748b" stroke-width="1.5" stroke-dasharray="4 4"/>
<line x1="190" y1="95" x2="190" y2="150" stroke="#64748b" stroke-width="1.5" stroke-dasharray="4 4"/>
<text x="205" y="127" fill="#64748b">Cobrado por 38 min 20 s, depois dividido</text>
<rect x="60" y="150" width="115" height="50" fill="#16a34a"/>
<rect x="175" y="150" width="15" height="50" fill="#f97316"/>
<text x="117" y="181" text-anchor="middle" fill="#ffffff">23¢</text>
<text x="205" y="172" fill="#1e1b4b">Provedor: 23¢</text>
<text x="205" y="195" fill="#1e1b4b">Taxa do GPUFlow: 3¢ (12% de 26¢, arredondado)</text>
</svg>
<figcaption>A reserva de 120¢ do exemplo, em escala: 26¢ cobrados por 38 min 20 s de uso, 94¢ devolvidos aos créditos e os 26¢ divididos entre o provedor e o GPUFlow.</figcaption>
</figure>

### Quando o aluguel termina sem você

Se as horas reservadas acabarem, uma rotina em segundo plano que roda a cada minuto fecha o aluguel. A cobrança é calculada até o horário de término reservado, então você não paga por nenhum atraso antes de a rotina rodar. A chave de API para de funcionar no horário de término. Se quiser mais tempo, **Adicionar horas** reserva mais créditos e mantém a mesma chave.

Se a máquina do provedor silenciar, o aluguel também termina. O agente na máquina do provedor envia um heartbeat a cada 15 segundos. Depois de 10 minutos sem nenhum, o aluguel é encerrado e cobrado só até o último heartbeat. A US$ 0,40 por hora, uma máquina que cai 25 minutos depois do início de uma reserva de 3 horas custa ceil(1.500 × 40 / 3.600) = 17¢, e os outros 103¢ da reserva de 120¢ voltam para você.

Há uma pegadinha entre a reserva em horas inteiras e o trabalho de 61 minutos. Se você reservar 1 hora e esquecer de clicar em **Adicionar horas** antes de ela acabar, a chave para aos 60 minutos e você paga 40¢ por um trabalho inacabado. Reserve 2 horas (80¢ reservados), encerre aos 61 minutos, e você paga 41¢ e recebe 39¢ de volta. Na dúvida, reserve mais e encerre antes; o tempo não usado não custa nada.

## Como escolher o modelo de cobrança pelo formato do trabalho

- **Muitos trabalhos de menos de 10 minutos:** cobrança por segundo ou por minuto, e confira o mínimo. Qualquer coisa que arredonde para a hora é a ferramenta errada aqui.
- **Trabalhos de 30 a 90 minutos:** fuja do arredondamento para a hora cheia (um trabalho de 61 minutos paga duas horas). A diferença entre por segundo e por minuto vale menos de um centavo por trabalho.
- **Execuções longas, de muitas horas:** o incremento mal aparece. Olhe para o tempo ocioso, a preparação e o armazenamento.
- **Chamadas em rajadas a um mesmo modelo ao longo do dia:** uma máquina nova a cada rajada paga a preparação toda vez, e uma máquina sempre ligada paga pelos intervalos. Um aluguel de inferência que mantém o modelo pronto é uma forma de evitar a parte da preparação, mas o relógio continua correndo entre as chamadas, então ajuste a reserva ao horário em que você realmente trabalha.

Se quiser testar, o [marketplace do GPUFlow](https://gpuflow.app/pt-BR/marketplace) lista os preços por hora de cada GPU, e [o que você precisa para alugar uma GPU](/pt_br/what-you-need-to-rent-a-gpu/) cobre a parte de conta e pagamento.

## Fontes

- AWS, preços do Amazon EC2 On-Demand (detalhes de cobrança): [aws.amazon.com/ec2/pricing/on-demand](https://aws.amazon.com/ec2/pricing/on-demand/)
- Google Cloud, preços de instâncias de VM (modelo de cobrança): [cloud.google.com/compute/vm-instance-pricing](https://cloud.google.com/compute/vm-instance-pricing)
- Microsoft Azure, preços de máquinas virtuais Linux (FAQ): [azure.microsoft.com/pricing/details/virtual-machines/linux](https://azure.microsoft.com/en-us/pricing/details/virtual-machines/linux/)
- Lambda, visão geral da cobrança: [docs.lambda.ai/public-cloud/billing](https://docs.lambda.ai/public-cloud/billing/)
- RunPod, preços de Pods: [docs.runpod.io/pods/pricing](https://docs.runpod.io/pods/pricing)
- Vast.ai, referência de cobrança: [docs.vast.ai/documentation/reference/billing](https://docs.vast.ai/documentation/reference/billing)
- Documentação do GPUFlow, créditos, cobrança e reembolsos: [docs.gpuflow.app/pt-br/renters/billing](https://docs.gpuflow.app/pt-br/renters/billing/)

Tudo verificado em setembro de 2026.
