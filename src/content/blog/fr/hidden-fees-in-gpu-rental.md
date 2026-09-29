---
title: "Louer un GPU : ce que le prix à l'heure ne dit pas"
description: "Stockage facturé à l'arrêt, bande passante, dépôts minimums, granularité de facturation, temps d'inactivité et frais bancaires : ce que vous payez vraiment sur Vast.ai, RunPod, Lambda, AWS et GPUFlow en plus du prix horaire du GPU."
excerpt: "Le prix à l'heure n'est qu'une partie de la facture. Voici tous les frais supplémentaires que nous avons relevés sur les principales plateformes de location de GPU, chiffres et sources à l'appui."
pubDate: 2026-02-15
updatedDate: 2026-09-29
locale: "fr"
category: "pricing"
featured: false
draft: false
author: "GPUFlow Team"
heroImage: "../_images/gpu-server-rack.jpg"
heroImageAlt: "Gros plan sur les ventilateurs de serveurs GPU dans une baie"
faq:
  - question: "Les plateformes de location de GPU facturent-elles le stockage quand la machine est arrêtée ?"
    answer: "Souvent, oui. Sur RunPod, le volume disk d'un pod arrêté coûte 0,20 $ par Go et par mois, soit le double du tarif en fonctionnement. Sur Vast.ai, le stockage est facturé chaque seconde tant que l'instance existe, y compris à l'arrêt. GPUFlow ne facture aucun stockage, car une location est une clé API, pas une machine."
  - question: "Quelles plateformes de location de GPU facturent la bande passante ?"
    answer: "Sur Vast.ai, chaque hôte fixe son propre prix pour les données envoyées et reçues, et chaque octet est facturé. RunPod et Lambda indiquent ne facturer ni le trafic entrant ni le trafic sortant. AWS facture les données sortantes vers Internet au-delà des 100 premiers Go par mois."
  - question: "Faut-il payer un montant minimum pour commencer à louer ?"
    answer: "Le dépôt minimum sur Vast.ai est de 5 $. Lambda bloque une pré-autorisation de 10 $ sur votre carte. RunPod demande aux utilisateurs de cartes prépayées un dépôt d'au moins 100 $ par transaction. Sur GPUFlow, les recharges commencent à 10 $, sans frais."
  - question: "Ma banque va-t-elle prélever des frais si je paie une location de GPU en dollars américains ?"
    answer: "C'est possible. Les frais sur les paiements à l'étranger vont généralement de 1 % à 3 %, et certaines banques les appliquent aux achats auprès de marchands étrangers même quand le prix est affiché en dollars. Au Brésil, la taxe IOF sur les achats internationaux par carte est de 3,5 %."
---

Le prix affiché sur une annonce de GPU correspond à une heure de GPU. Ce que vous payez en fin de mois comprend souvent autre chose : de l'espace disque, du transfert de données, le temps d'installation et les frais de votre propre banque. Rien de tout cela n'est caché volontairement, mais c'est facile à rater quand on compare les plateformes sur le seul prix d'appel.

Cet article recense tous les frais supplémentaires que nous avons pu vérifier sur les principales plateformes, avec un lien vers la source de chacun. Nous les avons tous contrôlés en septembre 2026. Les prix changent : vérifiez les liens avant de vous fier à un chiffre.

## En bref

| Coût | Vast.ai | RunPod | Lambda | AWS EC2 | GPUFlow |
| --- | --- | --- | --- | --- | --- |
| Unité de facturation | À la seconde | À la seconde | À la minute | À la seconde, minimum 60 s | À la seconde, minimum 1 min |
| Stockage en fonctionnement | Fixé par l'hôte | 0,10 $/Go/mois | Systèmes de fichiers, par Go/mois | 0,08 $/Go/mois (gp3) | Aucun |
| Stockage à l'arrêt | Oui, facturé | 0,20 $/Go/mois (volume disk) | Systèmes de fichiers, par Go/mois | 0,08 $/Go/mois (gp3) | Aucun |
| Transfert de données | Fixé par l'hôte, chaque octet | Gratuit | Gratuit | Sortant vers Internet : 100 premiers Go/mois gratuits, puis payant | Aucun |
| Minimum pour commencer | Dépôt de 5 $ | 1 heure de crédit ; 100 $ pour les cartes prépayées | Pré-autorisation de 10 $ sur la carte | Moyen de paiement et quota de GPU | Recharge de 10 $ |

GPUFlow peut se passer des frais de stockage et de transfert parce qu'il ne loue pas la même chose : vous obtenez une clé API pour des modèles d'IA qui tournent sur le GPU de quelqu'un d'autre, pas une machine sur laquelle vous vous connectez. Cela signifie aussi que vous ne pouvez pas y exécuter votre propre code ni vos entraînements. Nous y revenons plus bas.

## 1. Le stockage, surtout à l'arrêt

Sur les plateformes qui vous louent une machine ou un conteneur, vos fichiers sont sur un disque, et ce disque coûte de l'argent tant qu'il existe.

- **RunPod** facture 0,10 $ par Go et par mois le container disk et le volume disk tant que le pod tourne. Quand vous arrêtez le pod, le container disk disparaît et ne coûte plus rien, mais le volume disk passe à **0,20 $ par Go et par mois**. Les network volumes coûtent 0,07 $ par Go et par mois en dessous de 1 To, que le pod tourne ou non.
- **Vast.ai** laisse chaque hôte fixer le prix du stockage. Il est facturé chaque seconde tant que l'instance existe, y compris à l'arrêt.
- **AWS** facture les volumes EBS que l'instance tourne ou non. Un volume gp3 dans us-east-1 coûte 0,08 $ par Go et par mois.

Un exemple chiffré : un volume de 200 Go sur un pod RunPod arrêté coûte 200 × 0,20 $ = **40 $ par mois**, même si vous ne relancez jamais le pod. C'est plus que le prix de 100 heures de RTX 3090 aux prix courants des places de marché que nous indiquons plus bas.

**Que faire :** supprimez les volumes dont vous ne vous servez pas. Si vous avez seulement besoin de conserver vos fichiers entre deux sessions, un petit network volume revient moins cher qu'un gros pod arrêté.

## 2. Le transfert de données

Télécharger un modèle et envoyer un jeu de données peut représenter des dizaines de gigaoctets.

- **Vast.ai :** chaque hôte fixe un prix pour l'envoi et le téléchargement, et la documentation précise que chaque octet est facturé, quel que soit l'état de l'instance. Regardez le prix de la bande passante sur l'annonce avant de louer, surtout si vous allez télécharger de gros modèles.
- **RunPod** et **Lambda** indiquent ne facturer ni les données entrantes ni les données sortantes.
- **AWS :** les données entrantes sont gratuites. Les données sortantes vers Internet sont gratuites pour les 100 premiers Go par mois, puis facturées au Go. AWS facture aussi 0,005 $ de l'heure pour chaque adresse IPv4 publique, qu'elle serve ou non.

## 3. Dépôts minimums et blocages sur la carte

La plupart des plateformes de GPU fonctionnent en prépayé : vous achetez du crédit, puis vous le dépensez.

- **Vast.ai :** dépôt minimum de 5 $.
- **RunPod :** il vous faut au moins une heure de crédit pour la machine choisie, et les cartes prépayées doivent déposer au moins 100 $ par transaction.
- **Lambda :** une pré-autorisation de 10 $ sur votre carte, remboursée au bout de quelques jours.
- **SaladCloud :** le crédit expire 12 mois après l'achat.
- **GPUFlow :** recharges de 10 $ à 500 $, sans frais, et les crédits n'expirent pas.

Un crédit qui expire ou qui dort est aussi un coût. N'achetez que ce que vous comptez utiliser.

## 4. Le temps d'installation est du temps facturé

Quand vous louez une machine, le compteur démarre avec elle, pas avec votre tâche. Installer les pilotes et les bibliothèques, récupérer une image de conteneur, télécharger un modèle de 15 Go : tout cela se fait sur du temps payant. À 0,35 $ de l'heure, une demi-heure d'installation coûte environ 0,18 $. C'est peu pour une session, mais la note grimpe vite si vous démarrez des machines neuves tous les jours.

Deux réflexes limitent ce coût : utiliser un template ou une image de conteneur qui contient déjà ce dont vous avez besoin, et garder les modèles sur un volume pour ne les télécharger qu'une fois (à mettre en balance avec le coût de stockage vu au point 1).

Sur GPUFlow, le modèle est déjà installé sur la machine du fournisseur avant que vous la louiez. Il n'y a rien à installer : vous payez dès le début de la location, et la clé fonctionne immédiatement.

## 5. Granularité de facturation et minimums

La facturation à la seconde est devenue courante, mais les minimums varient :

| Plateforme | Facturation du temps |
| --- | --- |
| Vast.ai | À la seconde, sans minimum |
| Pods RunPod | À la seconde |
| RunPod serverless | À la seconde, arrondi au supérieur ; vous payez aussi le temps de démarrage du worker et un délai d'inactivité (5 secondes par défaut) |
| Lambda | À la minute |
| AWS EC2 (Linux) | À la seconde, minimum 60 secondes |
| Google Cloud | À la seconde, minimum 1 minute |
| GPUFlow | À la seconde, minimum 1 minute |

C'est en serverless que la granularité de facturation pèse le plus. Si vous envoyez des requêtes courtes espacées de pauses, le démarrage et le délai d'inactivité peuvent coûter plus cher que les requêtes elles-mêmes.

## 6. Le temps mort sur une machine allumée

Une machine louée à l'heure coûte la même chose, que le GPU travaille ou qu'il vous attende. Laisser un pod tourner toute la nuit « pour qu'il soit prêt le matin » est un moyen facile de dépenser trop. Lambda le dit clairement : les instances sont facturées tant qu'elles tournent, qu'elles soient utilisées ou non.

**Que faire :** programmez un rappel, ou utilisez une fonction de la plateforme qui arrête les machines inactives. Sur GPUFlow, vous réservez un nombre d'heures ; si vous finissez plus tôt, cliquez sur **Terminer maintenant** et le temps non utilisé revient sur vos crédits. [Comment fonctionne la facturation GPUFlow](https://docs.gpuflow.app/fr/renters/billing/).

## 7. Les machines interruptibles

Les machines interruptibles (spot) sont moins chères, souvent de moitié ou plus, mais elles peuvent être arrêtées si quelqu'un paie davantage. Vast.ai les appelle « interruptible » et indique qu'elles sont en général 50 % moins chères ou plus. Sur TensorDock, le stockage reste facturé pendant que votre offre est dépassée. Si votre tâche ne peut pas reprendre depuis un checkpoint, une interruption signifie payer deux fois le même travail.

## 8. Les frais de votre banque

Presque toutes les plateformes de GPU facturent en dollars américains. Si votre carte est dans une autre devise, votre banque peut ajouter des frais :

- Les frais sur les paiements à l'étranger vont généralement de **1 % à 3 %**. Certaines banques les appliquent aux achats auprès de marchands étrangers même quand le prix est affiché en dollars.
- Beaucoup de cartes de crédit canadiennes prélèvent environ **2,5 %** sur les achats dans une autre devise.
- Au Brésil, la **taxe IOF sur les achats internationaux par carte est de 3,5 %**.

Sur une recharge de 100 $, cela fait de 1 $ à 3,50 $ que vous ne verrez pas sur la facture de la plateforme. Une carte sans frais à l'étranger en supprime l'essentiel.

## 9. Pour les fournisseurs : frais et minimums de versement

Si vous louez votre propre GPU, la plateforme prend une part et les versements ont leurs propres règles :

| Plateforme | Ce que garde le fournisseur | Minimum de versement | Frais de versement |
| --- | --- | --- | --- |
| GPUFlow | 88 % du prix de location | 25 $ | 2,50 $ par retrait |
| Vast.ai | Selon Vast, les prix affichés sont en général environ 25 % au-dessus de ce que gagnent les hôtes | 20 $ | Non précisé par Vast ; votre service de paiement peut en prélever |
| TensorDock | Son contrat d'hébergement mentionne une commission de 20 % ou de 25 % (le texte cite les deux) | 250 $ avant retrait | Non précisé |

GPUFlow retient aussi les gains pendant 7 jours (14 jours pour les comptes de moins de 30 jours) avant qu'ils puissent être retirés, pour couvrir les contestations de paiement par carte. [Comment fonctionnent les versements GPUFlow](https://docs.gpuflow.app/fr/providers/getting-paid/).

## Prix courants des GPU, septembre 2026

Pour situer les choses, voici les fourchettes de prix à la demande relevées sur Vast.ai, RunPod, Salad, SimplePod, TensorDock, Hyperstack et Lambda en septembre 2026 :

| GPU | Prix courant à l'heure |
| --- | --- |
| RTX 3060 12 Go | 0,05 $ – 0,08 $ |
| RTX 3090 | 0,11 $ – 0,31 $ |
| RTX 4090 | 0,30 $ – 0,46 $ |
| RTX 5090 | 0,41 $ – 0,69 $ |

À titre de comparaison, une NVIDIA L4 sur AWS (g6.xlarge dans us-east-1) coûte environ 0,80 $ de l'heure, et une A10G (g5.xlarge) environ 1,01 $.

## Liste de vérification avant de louer

1. Additionnez le temps de GPU **et** le stockage pendant toute la durée où vous gardez les fichiers.
2. Vérifiez le prix de la bande passante si la plateforme en facture une, et le volume que vous allez télécharger.
3. Comptez le temps d'installation comme du temps payé.
4. Sachez comment arrêter de payer : terminer la location, arrêter la machine, supprimer le volume.
5. Vérifiez les frais de votre carte sur les paiements à l'étranger.

Si vous avez besoin d'un modèle d'IA à appeler depuis votre code, et non d'une machine pour faire tourner vos propres logiciels, une location par API évite entièrement les points 1, 2 et 4. Si vous avez besoin d'une machine complète pour l'entraînement, les plateformes ci-dessus sont le bon outil, et cette liste vous aide à garder une facture proche du prix à l'heure.

## Articles liés

- [GPU à l'heure ou API au token ? Le vrai coût d'un modèle 7B–8B](/fr/hourly-gpu-vs-per-token-api/)
- [GPUFlow, Vast.ai, RunPod ou SaladCloud : quelle plateforme choisir selon votre usage](/fr/gpuflow-vs-vast-ai-vs-runpod/)
- [Ce qu'il vous faut pour louer un GPU en 2026](/fr/what-you-need-to-rent-a-gpu/)

## Sources

Toutes vérifiées en septembre 2026.

- Tarifs et stockage des pods RunPod : [docs.runpod.io/pods/pricing](https://docs.runpod.io/pods/pricing)
- Facturation serverless RunPod : [docs.runpod.io/serverless/pricing](https://docs.runpod.io/serverless/pricing)
- Facturation et dépôts RunPod : [docs.runpod.io/references/billing-information](https://docs.runpod.io/references/billing-information)
- Tarifs et facturation Vast.ai : [docs.vast.ai/guides/instances/pricing.md](https://docs.vast.ai/guides/instances/pricing.md), [docs.vast.ai/documentation/reference/billing](https://docs.vast.ai/documentation/reference/billing)
- Dépôt Vast.ai : [guide de démarrage docs.vast.ai](https://docs.vast.ai/guides/get-started/quickstart.md)
- Versements aux hôtes Vast.ai : [docs.vast.ai/host/payment.md](https://docs.vast.ai/host/payment.md), article sur les gains des hôtes : [vast.ai](https://vast.ai/article/how-much-money-can-you-earn-renting-out-your-gpu-on-vast-ai)
- Facturation Lambda : [docs.lambda.ai/public-cloud/billing](https://docs.lambda.ai/public-cloud/billing/), [gestion de la facturation](https://docs.lambda.ai/public-cloud/manage-billing/), [tarifs (« No egress fees »)](https://lambda.ai/pricing)
- Facturation SaladCloud : [facturation docs.salad.com](https://docs.salad.com/general/explanation/billing.md)
- Instances spot TensorDock : [docs.tensordock.com](https://docs.tensordock.com/virtual-machines/spot-instances), contrat fournisseur : [docs.tensordock.com](https://docs.tensordock.com/legal-information/supplier-hosting-agreement.md)
- Facturation AWS EC2 : [aws.amazon.com/ec2/pricing/on-demand](https://aws.amazon.com/ec2/pricing/on-demand/) ; EBS : [aws.amazon.com/ebs/pricing](https://aws.amazon.com/ebs/pricing/) ; IPv4 publique : [aws.amazon.com/vpc/pricing](https://aws.amazon.com/vpc/pricing/)
- Prix des instances AWS : [instances.vantage.sh g6.xlarge](https://instances.vantage.sh/aws/ec2/g6.xlarge?region=us-east-1), [g5.xlarge](https://instances.vantage.sh/aws/ec2/g5.xlarge?region=us-east-1)
- Facturation des VM Google Cloud : [cloud.google.com/compute/vm-instance-pricing](https://cloud.google.com/compute/vm-instance-pricing)
- Frais de carte à l'étranger : [Experian](https://www.experian.com/blogs/ask-experian/what-is-a-foreign-transaction-fee/), [NerdWallet Canada](https://www.nerdwallet.com/ca/p/best/credit-cards/best-no-foreign-transaction-fee-credit-cards)
- IOF de 3,5 % au Brésil : [Wise Brésil](https://wise.com/br/blog/iof-cartao-internacional)
- Fourchettes de prix des GPU : [documentation GPUFlow, Fixer le prix de votre GPU](https://docs.gpuflow.app/fr/providers/pricing/)
