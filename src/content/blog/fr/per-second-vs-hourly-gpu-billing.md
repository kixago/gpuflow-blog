---
title: "Facturation GPU à la seconde ou à l'heure : ce que coûtent vraiment les tâches courtes"
description: "À 0,40 $/h, un test GPU de 90 secondes coûte 1 ¢ facturé à la seconde et 40 ¢ facturé à l'heure. Exemples chiffrés, graphique à l'échelle, et l'incrément et le minimum de chaque plateforme."
excerpt: "L'incrément de facturation décide de ce que coûtent les tâches GPU courtes. Nous chiffrons cinq durées de tâche facturées à la seconde, à la minute et à l'heure entamée, et listons ce qu'utilise réellement chaque plateforme."
pubDate: 2026-09-30
locale: "fr"
category: "pricing"
featured: false
draft: false
author: "GPUFlow Team"
heroImage: "../_images/per-second-vs-hourly-gpu-billing-hero.png"
heroImageAlt: "Illustration d'un chronomètre à côté d'une courbe de coût en forme d'escalier"
faq:
  - question: "La facturation GPU à la seconde est-elle moins chère que la facturation à l'heure ?"
    answer: "Pour les tâches courtes, de loin. À 0,40 $ de l'heure, un test de 90 secondes coûte 1 ¢ facturé à la seconde avec un minimum de 60 secondes, et 40 ¢ facturé à l'heure entamée. Sur les longues sessions, l'écart se réduit à au plus une heure partielle par session."
  - question: "Quel est le montant minimum facturé pour une instance AWS EC2 ?"
    answer: "AWS facture à la seconde les instances On-Demand Linux, Windows, RHEL et Ubuntu Pro, avec un minimum de 60 secondes. Les instances SUSE Linux Enterprise Server sont facturées à l'heure entamée."
  - question: "Azure facture-t-il ses machines virtuelles à la seconde ou à la minute ?"
    answer: "À la minute. La FAQ tarifaire des VM Linux d'Azure indique que la facturation porte sur le nombre de minutes complètes d'exécution : une VM qui tourne 6 minutes 45 secondes est facturée 6 minutes."
  - question: "Google Cloud applique-t-il un minimum de facturation aux instances GPU ?"
    answer: "Oui. Compute Engine facture les vCPU, les GPU et la mémoire pour au moins 1 minute, puis par incréments d'une seconde."
  - question: "Que paie-t-on sur GPUFlow en terminant une location plus tôt ?"
    answer: "Les secondes utilisées, avec un minimum de 60 secondes, arrondies au cent supérieur et jamais plus que le montant réservé. Le montant total de la réservation est bloqué au démarrage de la location, et la partie non utilisée revient dans vos crédits à la fin."
  - question: "Que devient ma location GPUFlow si la machine du fournisseur se déconnecte ?"
    answer: "Si la machine n'envoie aucun signal de présence (heartbeat) pendant 10 minutes, la location se termine d'elle-même. Vous n'êtes facturé que jusqu'au dernier signal de la machine, et le reste du montant réservé revient dans vos crédits."
---

À 0,40 $ de l'heure, un test de 90 secondes coûte 1 ¢ si vous êtes facturé à la seconde avec un minimum de 60 secondes, 1,3 ¢ si vous êtes facturé à la minute, et 40 ¢ si vous êtes facturé à l'heure entamée. Cet écart de 1 à 40 résume tout pour les tâches courtes. Dès qu'une tâche dure plus de quelques minutes, facturation à la seconde et à la minute diffèrent de moins d'un cent, et la facture se joue sur le temps d'inactivité, le temps de mise en route et le stockage.

Au programme : les règles publiées par chaque plateforme, des exemples chiffrés avec le calcul, un graphique à l'échelle, et la façon dont le modèle de GPUFlow, réservation puis remboursement, se traduit en montant facturé. Règles et prix à jour en septembre 2026 ; les sources sont en fin d'article.

## Trois façons de compter le temps GPU

Toute location de GPU a un prix à l'heure. La différence tient à la façon dont le temps utilisé est converti en temps facturable avant d'être multiplié par ce prix.

- **À la seconde, avec un minimum.** On compte les secondes. Si le total est inférieur au minimum (généralement 60 secondes), on facture le minimum. Coût = max(60, secondes) × tarif horaire / 3 600.
- **À la minute.** On compte les minutes. Les plateformes ne traitent pas toutes la minute entamée de la même façon : certaines arrondissent au-dessus, Azure l'ignore. Dans les exemples ci-dessous, j'arrondis au-dessus, ce qui est le cas le moins favorable pour vous. Coût = minutes × tarif horaire / 60.
- **À l'heure entamée.** Toute heure commencée est une heure entière. Une tâche de 61 minutes compte pour deux heures. Coût = ceil(secondes / 3 600) × tarif horaire.

Le minimum compte plus qu'on ne le pense. La facturation à la seconde avec un minimum de 60 secondes et la facturation à la minute sont identiques pour tout ce qui dure moins d'une minute. L'incrément ne change que la fraction restante en fin de tâche : il ne peut donc jamais vous coûter plus d'un incrément par session. Soit un peu moins de 40 ¢ par session avec la facturation à l'heure à 0,40 $, et moins de 0,7 ¢ par session avec la facturation à la minute au même tarif (59 secondes × 40 / 3 600 = 0,66 ¢).

## Ce qu'utilise chaque plateforme

Voici les règles publiées pour les instances à la demande, vérifiées dans la documentation de chaque fournisseur en septembre 2026.

| Plateforme | Incrément | Minimum | Ce que dit la documentation |
| --- | --- | --- | --- |
| AWS EC2 On-Demand | À la seconde | 60 secondes | S'applique à Linux, Windows, RHEL et Ubuntu Pro. SUSE Linux Enterprise Server est facturé à l'heure entamée. |
| Google Cloud Compute Engine | À la seconde | 1 minute | « Tous les vCPU, GPU et Go de mémoire sont facturés au minimum 1 minute. » |
| Azure Virtual Machines | À la minute | Non précisé | Facture « le nombre de minutes complètes » ; une VM qui tourne 6 min 45 s est facturée 6 minutes. |
| Lambda (cloud à la demande) | À la minute | Non précisé | Facture « par incréments d'une minute », du moment où l'instance passe les contrôles de santé jusqu'à ce que vous la supprimiez. |
| RunPod Pods | À la seconde | Non précisé | Calcul et stockage facturés tous deux à la seconde. |
| Vast.ai | À la seconde | Non précisé | Location active facturée à chaque seconde ; stockage facturé à chaque seconde d'existence de l'instance, sauf si elle est hors ligne. |
| GPUFlow | À la seconde | 60 secondes | Secondes entières, arrondies au cent, plafonnées au montant réservé. |

Deux remarques pour lire ce tableau. La règle d'Azure arrondit en réalité vers le bas : sa FAQ précise que vous n'êtes « pas facturé pour les secondes supplémentaires ». La documentation de Lambda parle d'incréments d'une minute sans dire dans quel sens est arrondie une minute entamée : je n'ai donc rien supposé. Et « non précisé » veut dire exactement cela : la documentation que j'ai lue ne mentionne aucun minimum, ce qui n'est pas la même chose qu'un minimum nul documenté.

Aucune de ces plateformes n'arrondit le calcul GPU à l'heure entamée pour les types d'instances ci-dessus. L'arrondi à l'heure apparaît pourtant encore dans les petites lignes, comme pour SUSE sur AWS : lisez la page de facturation avant de lancer beaucoup de tâches courtes sur une nouvelle plateforme.

## Cinq tâches à 0,40 $ de l'heure

Prenons un seul tarif, 0,40 $ de l'heure, appliqué à cinq durées de tâche. Cela fait 40 ¢ pour 3 600 secondes, soit 1/90 de cent par seconde.

**Un test de 90 secondes.** À la seconde : 90 × 40 / 3 600 = 1,0 ¢. À la minute : 2 minutes × 40 / 60 = 1,33 ¢. À l'heure entamée : 40 ¢. La facture à l'heure vaut 40 fois la facture à la seconde.

**7 minutes 30 secondes.** À la seconde : 450 × 40 / 3 600 = 5,0 ¢. À la minute : 8 minutes × 40 / 60 = 5,33 ¢. À l'heure entamée : 40 ¢, soit 8 fois plus.

**38 minutes 20 secondes.** À la seconde : 2 300 × 40 / 3 600 = 25,56 ¢. À la minute : 39 minutes × 40 / 60 = 26,0 ¢. À l'heure entamée : 40 ¢, environ 1,57 fois plus.

**61 minutes.** À la seconde : 3 660 × 40 / 3 600 = 40,67 ¢. À la minute : 61 × 40 / 60 = 40,67 ¢ (la tâche se termine sur une minute pile, les deux coïncident donc). À l'heure entamée : deux heures, 80 ¢. Une minute de plus double presque la facture à l'heure.

| Durée de la tâche | À la seconde (min. 60 s) | À la minute (arrondi au-dessus) | Heure entamée | Montant facturé par GPUFlow |
| --- | --- | --- | --- | --- |
| 1 min 30 s | 1,00 ¢ | 1,33 ¢ | 40 ¢ | 1 ¢ |
| 7 min 30 s | 5,00 ¢ | 5,33 ¢ | 40 ¢ | 5 ¢ |
| 38 min 20 s | 25,56 ¢ | 26,00 ¢ | 40 ¢ | 26 ¢ |
| 61 min | 40,67 ¢ | 40,67 ¢ | 80 ¢ | 41 ¢ |
| 20 tâches de 2 min 30 s | 33,33 ¢ | 40,00 ¢ | 8,00 $ | 40 ¢ (20 locations) |

La colonne GPUFlow reprend le résultat à la seconde, arrondi au cent entier supérieur pour chaque location, ce que fait son code de facturation. La dernière ligne est expliquée deux sections plus bas.

## Le coût selon la durée de la tâche, à l'échelle

Le premier graphique va de 0 à 150 minutes. L'escalier de la facturation à la minute a des marches de 1 minute de large et de 0,67 ¢ de haut : à cette échelle, il se confond avec la ligne de la facturation à la seconde. L'escalier qui compte est celui de l'heure entamée : il fait un saut de 40 ¢ à 0, 60 et 120 minutes.

<figure>
<svg viewBox="0 0 720 400" role="img" aria-labelledby="d1-title" xmlns="http://www.w3.org/2000/svg" font-family="system-ui, sans-serif" font-size="15">
<title id="d1-title">Coût d'une tâche à 0,40 dollar de l'heure, de 0 à 150 minutes, facturée à la seconde, à la minute et à l'heure entamée</title>
<rect x="0" y="0" width="720" height="400" fill="#ffffff"/>
<line x1="90" y1="320.0" x2="690" y2="320.0" stroke="#e2e8f0" stroke-width="1"/>
<text x="82" y="325.0" text-anchor="end" fill="#64748b" font-size="13">0,00 $</text>
<line x1="90" y1="275.0" x2="690" y2="275.0" stroke="#e2e8f0" stroke-width="1"/>
<text x="82" y="280.0" text-anchor="end" fill="#64748b" font-size="13">0,20 $</text>
<line x1="90" y1="230.0" x2="690" y2="230.0" stroke="#e2e8f0" stroke-width="1"/>
<text x="82" y="235.0" text-anchor="end" fill="#64748b" font-size="13">0,40 $</text>
<line x1="90" y1="185.0" x2="690" y2="185.0" stroke="#e2e8f0" stroke-width="1"/>
<text x="82" y="190.0" text-anchor="end" fill="#64748b" font-size="13">0,60 $</text>
<line x1="90" y1="140.0" x2="690" y2="140.0" stroke="#e2e8f0" stroke-width="1"/>
<text x="82" y="145.0" text-anchor="end" fill="#64748b" font-size="13">0,80 $</text>
<line x1="90" y1="95.0" x2="690" y2="95.0" stroke="#e2e8f0" stroke-width="1"/>
<text x="82" y="100.0" text-anchor="end" fill="#64748b" font-size="13">1,00 $</text>
<line x1="90" y1="50.0" x2="690" y2="50.0" stroke="#e2e8f0" stroke-width="1"/>
<text x="82" y="55.0" text-anchor="end" fill="#64748b" font-size="13">1,20 $</text>
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
<text x="390.0" y="365" text-anchor="middle" fill="#1e1b4b">Durée de la tâche (minutes)</text>
<text x="22" y="185.0" text-anchor="middle" fill="#1e1b4b" transform="rotate(-90 22 185.0)">Coût à 0,40 $ de l'heure</text>
<polyline fill="none" stroke="#f97316" stroke-width="3" points="90.0,230.0 330.0,230.0 330.0,140.0 570.0,140.0 570.0,50.0 690.0,50.0"/>
<polyline fill="none" stroke="#16a34a" stroke-width="2.5" stroke-dasharray="6 4" points="90.0,318.5 94.0,318.5 94.0,317.0 98.0,317.0 98.0,315.5 102.0,315.5 102.0,314.0 106.0,314.0 106.0,312.5 110.0,312.5 110.0,311.0 114.0,311.0 114.0,309.5 118.0,309.5 118.0,308.0 122.0,308.0 122.0,306.5 126.0,306.5 126.0,305.0 130.0,305.0 130.0,303.5 134.0,303.5 134.0,302.0 138.0,302.0 138.0,300.5 142.0,300.5 142.0,299.0 146.0,299.0 146.0,297.5 150.0,297.5 150.0,296.0 154.0,296.0 154.0,294.5 158.0,294.5 158.0,293.0 162.0,293.0 162.0,291.5 166.0,291.5 166.0,290.0 170.0,290.0 170.0,288.5 174.0,288.5 174.0,287.0 178.0,287.0 178.0,285.5 182.0,285.5 182.0,284.0 186.0,284.0 186.0,282.5 190.0,282.5 190.0,281.0 194.0,281.0 194.0,279.5 198.0,279.5 198.0,278.0 202.0,278.0 202.0,276.5 206.0,276.5 206.0,275.0 210.0,275.0 210.0,273.5 214.0,273.5 214.0,272.0 218.0,272.0 218.0,270.5 222.0,270.5 222.0,269.0 226.0,269.0 226.0,267.5 230.0,267.5 230.0,266.0 234.0,266.0 234.0,264.5 238.0,264.5 238.0,263.0 242.0,263.0 242.0,261.5 246.0,261.5 246.0,260.0 250.0,260.0 250.0,258.5 254.0,258.5 254.0,257.0 258.0,257.0 258.0,255.5 262.0,255.5 262.0,254.0 266.0,254.0 266.0,252.5 270.0,252.5 270.0,251.0 274.0,251.0 274.0,249.5 278.0,249.5 278.0,248.0 282.0,248.0 282.0,246.5 286.0,246.5 286.0,245.0 290.0,245.0 290.0,243.5 294.0,243.5 294.0,242.0 298.0,242.0 298.0,240.5 302.0,240.5 302.0,239.0 306.0,239.0 306.0,237.5 310.0,237.5 310.0,236.0 314.0,236.0 314.0,234.5 318.0,234.5 318.0,233.0 322.0,233.0 322.0,231.5 326.0,231.5 326.0,230.0 330.0,230.0 330.0,228.5 334.0,228.5 334.0,227.0 338.0,227.0 338.0,225.5 342.0,225.5 342.0,224.0 346.0,224.0 346.0,222.5 350.0,222.5 350.0,221.0 354.0,221.0 354.0,219.5 358.0,219.5 358.0,218.0 362.0,218.0 362.0,216.5 366.0,216.5 366.0,215.0 370.0,215.0 370.0,213.5 374.0,213.5 374.0,212.0 378.0,212.0 378.0,210.5 382.0,210.5 382.0,209.0 386.0,209.0 386.0,207.5 390.0,207.5 390.0,206.0 394.0,206.0 394.0,204.5 398.0,204.5 398.0,203.0 402.0,203.0 402.0,201.5 406.0,201.5 406.0,200.0 410.0,200.0 410.0,198.5 414.0,198.5 414.0,197.0 418.0,197.0 418.0,195.5 422.0,195.5 422.0,194.0 426.0,194.0 426.0,192.5 430.0,192.5 430.0,191.0 434.0,191.0 434.0,189.5 438.0,189.5 438.0,188.0 442.0,188.0 442.0,186.5 446.0,186.5 446.0,185.0 450.0,185.0 450.0,183.5 454.0,183.5 454.0,182.0 458.0,182.0 458.0,180.5 462.0,180.5 462.0,179.0 466.0,179.0 466.0,177.5 470.0,177.5 470.0,176.0 474.0,176.0 474.0,174.5 478.0,174.5 478.0,173.0 482.0,173.0 482.0,171.5 486.0,171.5 486.0,170.0 490.0,170.0 490.0,168.5 494.0,168.5 494.0,167.0 498.0,167.0 498.0,165.5 502.0,165.5 502.0,164.0 506.0,164.0 506.0,162.5 510.0,162.5 510.0,161.0 514.0,161.0 514.0,159.5 518.0,159.5 518.0,158.0 522.0,158.0 522.0,156.5 526.0,156.5 526.0,155.0 530.0,155.0 530.0,153.5 534.0,153.5 534.0,152.0 538.0,152.0 538.0,150.5 542.0,150.5 542.0,149.0 546.0,149.0 546.0,147.5 550.0,147.5 550.0,146.0 554.0,146.0 554.0,144.5 558.0,144.5 558.0,143.0 562.0,143.0 562.0,141.5 566.0,141.5 566.0,140.0 570.0,140.0 570.0,138.5 574.0,138.5 574.0,137.0 578.0,137.0 578.0,135.5 582.0,135.5 582.0,134.0 586.0,134.0 586.0,132.5 590.0,132.5 590.0,131.0 594.0,131.0 594.0,129.5 598.0,129.5 598.0,128.0 602.0,128.0 602.0,126.5 606.0,126.5 606.0,125.0 610.0,125.0 610.0,123.5 614.0,123.5 614.0,122.0 618.0,122.0 618.0,120.5 622.0,120.5 622.0,119.0 626.0,119.0 626.0,117.5 630.0,117.5 630.0,116.0 634.0,116.0 634.0,114.5 638.0,114.5 638.0,113.0 642.0,113.0 642.0,111.5 646.0,111.5 646.0,110.0 650.0,110.0 650.0,108.5 654.0,108.5 654.0,107.0 658.0,107.0 658.0,105.5 662.0,105.5 662.0,104.0 666.0,104.0 666.0,102.5 670.0,102.5 670.0,101.0 674.0,101.0 674.0,99.5 678.0,99.5 678.0,98.0 682.0,98.0 682.0,96.5 686.0,96.5 686.0,95.0 690.0,95.0"/>
<polyline fill="none" stroke="#6366f1" stroke-width="2.5" points="90.0,318.5 94.0,318.5 690.0,95.0"/>
<line x1="110" y1="22" x2="138" y2="22" stroke="#6366f1" stroke-width="3"/><text x="144" y="27" fill="#1e1b4b" font-size="13">À la seconde, min. 60 s</text>
<line x1="330" y1="22" x2="358" y2="22" stroke="#16a34a" stroke-width="3" stroke-dasharray="6 4"/><text x="364" y="27" fill="#1e1b4b">À la minute</text>
<line x1="480" y1="22" x2="508" y2="22" stroke="#f97316" stroke-width="3"/><text x="514" y="27" fill="#1e1b4b">Heure entamée</text>
</svg>
<figcaption>Coût d'une tâche à 0,40 $ de l'heure. La facturation à l'heure (en orange) compte la marche entière de 40 ¢ dès qu'une nouvelle heure commence ; les facturations à la seconde et à la minute donnent presque la même ligne.</figcaption>
</figure>

L'écart entre l'escalier orange et la ligne bleue, c'est ce que coûte l'arrondi à l'heure pour chaque tâche : maximal juste après chaque marche, nul sur les heures pile.

En zoomant sur les dix premières minutes, les marches de la facturation à la minute apparaissent, et le minimum de 60 secondes se voit dans le départ à plat de la ligne à la seconde. La facturation à l'heure entamée serait une ligne plate à 40 ¢, cinq fois plus haut que le sommet de ce graphique.

<figure>
<svg viewBox="0 0 720 400" role="img" aria-labelledby="d2-title" xmlns="http://www.w3.org/2000/svg" font-family="system-ui, sans-serif" font-size="15">
<title id="d2-title">Zoom sur les 10 premières minutes à 0,40 dollar de l'heure : facturation à la seconde et à la minute, la facturation à l'heure entamée sortant du graphique</title>
<rect x="0" y="0" width="720" height="400" fill="#ffffff"/>
<line x1="90" y1="320.0" x2="690" y2="320.0" stroke="#e2e8f0" stroke-width="1"/>
<text x="82" y="325.0" text-anchor="end" fill="#64748b" font-size="13">0 ¢</text>
<line x1="90" y1="252.5" x2="690" y2="252.5" stroke="#e2e8f0" stroke-width="1"/>
<text x="82" y="257.5" text-anchor="end" fill="#64748b" font-size="13">2 ¢</text>
<line x1="90" y1="185.0" x2="690" y2="185.0" stroke="#e2e8f0" stroke-width="1"/>
<text x="82" y="190.0" text-anchor="end" fill="#64748b" font-size="13">4 ¢</text>
<line x1="90" y1="117.5" x2="690" y2="117.5" stroke="#e2e8f0" stroke-width="1"/>
<text x="82" y="122.5" text-anchor="end" fill="#64748b" font-size="13">6 ¢</text>
<line x1="90" y1="50.0" x2="690" y2="50.0" stroke="#e2e8f0" stroke-width="1"/>
<text x="82" y="55.0" text-anchor="end" fill="#64748b" font-size="13">8 ¢</text>
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
<text x="390.0" y="365" text-anchor="middle" fill="#1e1b4b">Durée de la tâche (minutes)</text>
<text x="22" y="185.0" text-anchor="middle" fill="#1e1b4b" transform="rotate(-90 22 185.0)">Coût à 0,40 $ de l'heure</text>
<polyline fill="none" stroke="#16a34a" stroke-width="2.5" stroke-dasharray="6 4" points="90.0,297.5 150.0,297.5 150.0,275.0 210.0,275.0 210.0,252.5 270.0,252.5 270.0,230.0 330.0,230.0 330.0,207.5 390.0,207.5 390.0,185.0 450.0,185.0 450.0,162.5 510.0,162.5 510.0,140.0 570.0,140.0 570.0,117.5 630.0,117.5 630.0,95.0 690.0,95.0"/>
<polyline fill="none" stroke="#6366f1" stroke-width="2.5" points="90.0,297.5 150.0,297.5 690.0,95.0"/>
<text x="104" y="74" text-anchor="start" fill="#f97316">Heure entamée : 0,40 $ pour chacune de ces durées (hors graphique)</text>
<line x1="110" y1="22" x2="138" y2="22" stroke="#6366f1" stroke-width="3"/><text x="144" y="27" fill="#1e1b4b" font-size="13">À la seconde, min. 60 s</text>
<line x1="330" y1="22" x2="358" y2="22" stroke="#16a34a" stroke-width="3" stroke-dasharray="6 4"/><text x="364" y="27" fill="#1e1b4b">À la minute</text>
<line x1="480" y1="22" x2="508" y2="22" stroke="#f97316" stroke-width="3"/><text x="514" y="27" fill="#1e1b4b">Heure entamée</text>
</svg>
<figcaption>Les 10 premières minutes à 0,40 $ de l'heure. Les deux lignes partent de 0,67 ¢ à cause du minimum d'une minute. La ligne à la minute (en vert) n'est jamais plus de 0,67 ¢ au-dessus de la ligne à la seconde (en bleu).</figcaption>
</figure>

## Une journée de tâches courtes

Les tâches courtes viennent rarement seules. Disons que vous lancez 20 tâches dans une journée de travail, de 2 minutes 30 secondes chacune, avec une nouvelle instance pour chacune.

- **À la seconde :** 20 × 150 s = 3 000 s, et 3 000 × 40 / 3 600 = 33,33 ¢.
- **À la minute, arrondi au-dessus :** chaque tâche compte 3 minutes, soit 60 minutes au total : 40 ¢.
- **À l'heure entamée :** chaque tâche est une heure commencée : 20 × 40 ¢ = 8,00 $.

La facturation à l'heure coûte 24 fois plus pour les mêmes 50 minutes de travail GPU. Le réflexe évident est de garder une seule machine allumée toute la journée. Huit heures à 0,40 $ font 3,20 $, mieux que 8,00 $ mais encore 9,6 fois la facture à la seconde, parce que vous payez désormais les trous entre les tâches.

Cet exemple flatte pourtant l'approche « une instance neuve par tâche », car il suppose qu'une tâche démarre au moment même où la machine démarre. Ce n'est pas le cas. À titre d'illustration, supposons que chaque lancement passe 3 minutes à démarrer, télécharger une image et charger un modèle avant que le travail commence (votre chiffre sera différent). La facturation à la seconde compte alors 20 × 330 s = 6 600 s, soit 73,33 ¢, plus du double des 33,33 ¢ de travail réel. L'incrément n'a pas changé ; le gaspillage s'est déplacé dans la mise en route.

Sur GPUFlow, la même journée se présente un peu différemment, car une location se réserve en heures entières et se facture à la seconde. Lancer 20 locations séparées de 150 s coûte ceil(150 × 40 / 3 600) = ceil(1,67) = 2 ¢ chacune, soit 40 ¢ au total. L'arrondi de chaque location au cent entier ajoute ici 0,33 ¢ par tâche, d'où les 6,67 ¢ de plus que le total à la seconde. Si les tâches sont rapprochées, notez la limite de 10 nouvelles locations par heure et par utilisateur. Garder une seule location ouverte toute la journée coûte tout le temps écoulé, 8 heures = 3,20 $, parce que GPUFlow facture le temps et ne facture pas au token.

## Ce qui compte plus que l'incrément

Dès que les tâches dépassent une dizaine de minutes, la différence entre facturation à la seconde et à la minute n'est qu'une erreur d'arrondi. Les trois points suivants, eux, pèsent vraiment. Ils sont détaillés dans [ce que le prix à l'heure ne dit pas](/fr/hidden-fees-in-gpu-rental/).

### Le temps d'inactivité

Toutes les plateformes facturées à la seconde facturent une instance allumée, que le GPU travaille ou non. La documentation de Lambda le dit sans détour : les instances sont facturées « qu'elles soient activement utilisées ou non ». La journée de tâches courtes ci-dessus donne l'ordre de grandeur : 50 minutes de travail, 3,20 $ si la machine reste allumée 8 heures. Aucun incrément de facturation ne corrige une machine qu'on a oublié d'arrêter.

### Le temps de mise en route

Démarrage, téléchargement d'image et de modèle : tout cela se fait compteur tournant. Lambda commence à facturer dès que l'instance passe les contrôles de santé, avant que votre code ait fait quoi que ce soit. La facturation à la seconde ne supprime pas ce coût ; vous le payez à chaque lancement.

### Le stockage d'une machine arrêtée

Arrêter une machine arrête généralement la facturation du GPU. Le disque, lui, continue d'être facturé. RunPod facture le volume disque d'un pod arrêté 0,20 $ par Go et par mois, le double du tarif en fonctionnement, et sa documentation prévient que « les frais de stockage continuent de courir sur les pods arrêtés ». Vast.ai dit clairement qu'« arrêter une instance n'évite pas les frais de stockage ». Un volume de 100 Go laissé sur un pod RunPod arrêté coûte 100 × 0,20 $ = 20 $ par mois, soit 50 heures de GPU à 0,40 $.

Si votre usage consiste à appeler un modèle plutôt qu'à faire tourner votre propre code sur une machine, comparez aussi avec la tarification au token : [GPU à l'heure ou API au token ?](/fr/hourly-gpu-vs-per-token-api/) montre quand chacun revient moins cher.

## Comment GPUFlow facture : réservation d'abord, remboursement du reste

GPUFlow loue de l'inférence : vous obtenez une clé API compatible OpenAI pour un modèle qui tourne sur le GPU de quelqu'un d'autre, pas une machine. Il n'y a ni shell, ni disque, ni image à payer : le stockage et la mise en route de la section précédente ne s'appliquent pas. Le temps d'inactivité, si : la location est facturée du début à la fin, que le GPU travaille ou non.

Les étapes :

1. Vous choisissez une annonce et un nombre entier d'heures (de 1 à 168 par défaut). Le prix horaire du fournisseur est converti en cents entiers.
2. Au démarrage, le montant total réservé est bloqué sur vos crédits : tarif en cents × heures. C'est le montant complet, prélevé d'avance.
3. À la fin de la location, le montant facturé est calculé une seule fois : secondes entières utilisées, 60 au minimum, multipliées par le tarif en cents, divisées par 3 600, arrondies au cent supérieur, et jamais plus que le montant réservé.
4. Ce qui reste du montant réservé revient dans vos crédits disponibles au cours de la même étape.

![Le formulaire de location GPUFlow pour un GPU à 0,35 $ de l'heure, avec 2 heures saisies, 0,70 $ réservés sur les crédits et le bouton Démarrer une location de 2 h mis en évidence](../_images/screens/fr/renter-rent.png)

Le formulaire de location affiche le montant réservé avant le démarrage : 2 heures à 0,35 $ réservent 0,70 $.

### Un exemple chiffré

Réservez 3 heures à 0,40 $. Le montant réservé est de 40 ¢ × 3 = 120 ¢ (1,20 $). Vous cliquez sur **Terminer maintenant** au bout de 38 minutes 20 secondes, soit 2 300 secondes.

- Montant facturé : ceil(2 300 × 40 / 3 600) = ceil(25,56) = **26 ¢**.
- Rendu à vos crédits : 120 − 26 = **94 ¢**.
- Les frais de la plateforme représentent 12 % du montant facturé, arrondis au cent le plus proche pour chaque location : round(26 × 0,12) = round(3,12) = 3 ¢. Le fournisseur reçoit 26 − 3 = 23 ¢, soit 88,5 % de ce montant et non exactement 88 %. Sur des montants plus élevés, l'arrondi pèse moins.

<figure>
<svg viewBox="0 0 720 230" role="img" aria-labelledby="d3-title" xmlns="http://www.w3.org/2000/svg" font-family="system-ui, sans-serif" font-size="15">
<title id="d3-title">Une réservation de 120 cents pour 3 heures à 0,40 dollar de l'heure, terminée au bout de 38 minutes 20 secondes : 26 cents facturés, 94 cents rendus, et les 26 cents répartis entre 23 cents pour le fournisseur et 3 cents pour GPUFlow</title>
<rect x="0" y="0" width="720" height="230" fill="#ffffff"/>
<text x="60" y="30" fill="#1e1b4b">Réservé au démarrage : 120 ¢ (0,40 $ × 3 heures)</text>
<rect x="60" y="45" width="130" height="50" fill="#6366f1"/>
<rect x="190" y="45" width="470" height="50" fill="#eef2ff" stroke="#6366f1" stroke-width="2"/>
<text x="125" y="76" text-anchor="middle" fill="#ffffff">26 ¢</text>
<text x="425" y="76" text-anchor="middle" fill="#1e1b4b">94 ¢ rendus à vos crédits</text>
<line x1="60" y1="95" x2="60" y2="150" stroke="#64748b" stroke-width="1.5" stroke-dasharray="4 4"/>
<line x1="190" y1="95" x2="190" y2="150" stroke="#64748b" stroke-width="1.5" stroke-dasharray="4 4"/>
<text x="205" y="127" fill="#64748b">Facturé pour 38 min 20 s, puis réparti</text>
<rect x="60" y="150" width="115" height="50" fill="#16a34a"/>
<rect x="175" y="150" width="15" height="50" fill="#f97316"/>
<text x="117" y="181" text-anchor="middle" fill="#ffffff">23 ¢</text>
<text x="205" y="172" fill="#1e1b4b">Fournisseur : 23 ¢</text>
<text x="205" y="195" fill="#1e1b4b">Frais GPUFlow : 3 ¢ (12 % de 26 ¢, arrondi)</text>
</svg>
<figcaption>La réservation de 120 ¢ de l'exemple, à l'échelle : 26 ¢ facturés pour 38 min 20 s d'utilisation, 94 ¢ rendus aux crédits, et les 26 ¢ répartis entre le fournisseur et GPUFlow.</figcaption>
</figure>

### Quand une location se termine sans vous

Quand les heures réservées sont écoulées, une tâche de fond qui tourne chaque minute clôture la location. Le montant est calculé jusqu'à l'heure de fin réservée : vous ne payez pas le délai avant que la tâche passe. La clé API cesse de fonctionner à l'heure de fin. Si vous voulez plus de temps, **Ajouter des heures** réserve d'autres crédits et conserve la même clé.

Si la machine du fournisseur ne donne plus signe de vie, la location se termine aussi. L'agent installé sur la machine du fournisseur envoie un signal de présence (heartbeat) toutes les 15 secondes. Après 10 minutes sans signal, la location est terminée et facturée seulement jusqu'au dernier signal. À 0,40 $ de l'heure, une machine qui décroche au bout de 25 minutes sur une réservation de 3 heures coûte ceil(1 500 × 40 / 3 600) = 17 ¢, et les 103 ¢ restants des 120 ¢ réservés reviennent dans vos crédits.

La réservation en heures entières a un piège avec la tâche de 61 minutes. Si vous réservez 1 heure et oubliez de cliquer sur **Ajouter des heures** avant la fin, la clé s'arrête à 60 minutes et vous payez 40 ¢ pour une tâche inachevée. Réservez 2 heures (80 ¢ réservés) et terminez à 61 minutes : vous payez 41 ¢ et récupérez 39 ¢. Dans le doute, réservez large et terminez tôt ; le temps non utilisé ne coûte rien.

## Choisir un mode de facturation selon le profil des tâches

- **Beaucoup de tâches de moins de 10 minutes :** facturation à la seconde ou à la minute, en vérifiant le minimum. Tout ce qui arrondit à l'heure est le mauvais outil ici.
- **Tâches de 30 à 90 minutes :** évitez l'arrondi à l'heure entamée (une tâche de 61 minutes paie deux heures). Entre la seconde et la minute, l'écart vaut moins d'un cent par tâche.
- **Longues sessions de plusieurs heures :** l'incrément compte à peine. Regardez plutôt le temps d'inactivité, la mise en route et le stockage.
- **Appels par rafales à un même modèle tout au long de la journée :** une machine neuve par rafale paie la mise en route à chaque fois, et une machine gardée allumée paie les trous. Une location d'inférence qui garde un modèle prêt est une façon d'éviter la mise en route, mais le compteur tourne entre les appels : calez la réservation sur vos vraies heures de travail.

Pour essayer, la [place de marché GPUFlow](https://gpuflow.app/fr/marketplace) affiche les prix à l'heure de chaque GPU, et [ce qu'il vous faut pour louer un GPU](/fr/what-you-need-to-rent-a-gpu/) couvre le compte et le paiement.

## Sources

- AWS, tarification Amazon EC2 On-Demand (détails de facturation) : [aws.amazon.com/ec2/pricing/on-demand](https://aws.amazon.com/ec2/pricing/on-demand/)
- Google Cloud, tarification des instances de VM (modèle de facturation) : [cloud.google.com/compute/vm-instance-pricing](https://cloud.google.com/compute/vm-instance-pricing)
- Microsoft Azure, tarification des machines virtuelles Linux (FAQ) : [azure.microsoft.com/pricing/details/virtual-machines/linux](https://azure.microsoft.com/en-us/pricing/details/virtual-machines/linux/)
- Lambda, présentation de la facturation : [docs.lambda.ai/public-cloud/billing](https://docs.lambda.ai/public-cloud/billing/)
- RunPod, tarification des pods : [docs.runpod.io/pods/pricing](https://docs.runpod.io/pods/pricing)
- Vast.ai, référence sur la facturation : [docs.vast.ai/documentation/reference/billing](https://docs.vast.ai/documentation/reference/billing)
- Documentation GPUFlow, crédits, facturation et remboursements : [docs.gpuflow.app/fr/renters/billing](https://docs.gpuflow.app/fr/renters/billing/)

Toutes vérifiées en septembre 2026.
