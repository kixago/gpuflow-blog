---
title: "Configuration de MetaMask et Polygon pour votre première location de GPU"
description: "Guide étape par étape pour installer MetaMask, configurer le réseau Polygon et approvisionner votre portefeuille pour la location de GPU. Tutoriel complet pour débutants : de zéro au portefeuille financé en 15 minutes."
excerpt: "Jamais utilisé de portefeuille crypto ? Ce guide vous accompagne dans l'installation de MetaMask, la configuration du réseau Polygon et le financement de votre portefeuille pour la location de GPU. Aucune expérience préalable requise."
pubDate: 2026-02-19
updatedDate: 2026-02-19
locale: "fr"
category: "tutorials"
featured: false
draft: false
author: "GPUFlow Team"
heroImage: "../_images/metamask-polygon-gpu-rental-setup-hero.png"
heroImageAlt: "Logo du renard MetaMask à côté du logo violet Polygon avec une icône de carte graphique GPU, montrant le flux de connexion du portefeuille au GPU avec les étapes de configuration indiquées"
faq:
  - question: "Pourquoi ai-je besoin de MetaMask pour la location de GPU ?"
    answer: "MetaMask est un portefeuille de cryptomonnaies qui vous permet de stocker des fonds et d'interagir avec des plateformes basées sur la blockchain comme GPUFlow. Les plateformes de location de GPU utilisant des paiements en cryptomonnaies nécessitent un portefeuille pour détenir vos fonds et approuver les transactions. MetaMask est l'option la plus compatible, fonctionnant avec presque toutes les plateformes acceptant les cryptos. Il s'installe comme une extension de navigateur et sa configuration prend environ 5 minutes."
  - question: "Pourquoi utiliser Polygon au lieu d'Ethereum pour la location de GPU ?"
    answer: "Polygon offre des frais de transaction de 0,001 à 0,05 $ contre 1 à 10 $ ou plus pour Ethereum. Pour la location de GPU, où vous pourriez effectuer plusieurs dépôts, locations et retraits, Polygon permet d'économiser beaucoup d'argent. Une session typique de location de GPU sur Ethereum pourrait coûter entre 5 et 15 $ rien qu'en frais de gaz. La même session sur Polygon coûte moins de 0,10 $ en frais. Les plateformes comme GPUFlow utilisent Polygon spécifiquement parce que les frais réduits rendent les petites transactions économiquement viables."
  - question: "Qu'est-ce qu'une phrase secrète (seed phrase) et pourquoi est-elle importante ?"
    answer: "Une phrase secrète est une phrase de récupération de 12 ou 24 mots qui donne un accès complet à votre portefeuille. Quiconque possède ces mots peut accéder à tous les fonds du portefeuille depuis n'importe quel appareil. Vous devez l'écrire sur papier (jamais numériquement) et la stocker en lieu sûr. Si vous perdez votre phrase secrète et que votre appareil tombe en panne, vos fonds sont définitivement perdus. Aucune entreprise, équipe d'assistance ou service de récupération ne peut vous aider — la phrase secrète est le seul moyen de récupérer un portefeuille."
  - question: "De combien de MATIC ai-je besoin pour les frais de gaz ?"
    answer: "Environ 0,50 à 2,00 $ de MATIC suffisent pour des dizaines de transactions sur Polygon. Chaque transaction coûte entre 0,001 et 0,05 $ en gaz, donc même 1 $ de MATIC couvre de 20 à plus de 100 transactions selon les conditions du réseau. Vous avez besoin de MATIC spécifiquement pour le gaz même si vous payez la location du GPU en USDC ou autres jetons — les frais de gaz doivent être payés dans la devise native du réseau."
  - question: "Puis-je utiliser un autre portefeuille que MetaMask ?"
    answer: "Oui. Les alternatives incluent Rainbow (axé sur le mobile), Coinbase Wallet (bon pour les utilisateurs de Coinbase), Rabby (conçu pour les développeurs) et les portefeuilles matériels comme Ledger avec intégration navigateur. Les plateformes de location de GPU prennent généralement en charge tout portefeuille compatible avec WalletConnect ou une connexion directe via extension navigateur. MetaMask est recommandé pour les débutants en raison de sa documentation exhaustive, de sa large compatibilité et de sa grande communauté d'utilisateurs pour l'aide au dépannage."
---

Le fossé entre l'idée de "je veux louer un GPU avec de la crypto" et le faire réellement se résume généralement à une chose : la configuration du portefeuille. La location du GPU en elle-même prend trente secondes. Connecter un portefeuille de cryptomonnaies financé au bon réseau prend plus de temps si vous ne l'avez jamais fait auparavant, et la plupart des guides supposent que vous possédez déjà des cryptos et comprenez les frais de gaz.

Ce tutoriel part de zéro. Aucune expérience préalable en cryptomonnaie n'est requise. À la fin, vous aurez un portefeuille MetaMask connecté au réseau Polygon avec suffisamment de fonds pour louer votre premier GPU. L'ensemble du processus coûte moins de 2 $ en frais et prend environ quinze minutes, la majeure partie étant le temps d'attente pour les confirmations de retrait par l'échange.

Pour le processus complet de location de GPU après la configuration du portefeuille — y compris les comparaisons de plateformes, le dépôt fiduciaire via contrat intelligent (escrow) et la gestion de la location — consultez notre [Guide complet de la location de GPU avec des cryptomonnaies](/fr/rent-gpu-with-crypto/).

---

## Pourquoi Polygon au lieu du réseau principal Ethereum

Avant de configurer quoi que ce soit, comprendre pourquoi Polygon est important vous fera économiser de l'argent sur chaque transaction.

### Le problème des frais de gaz

Chaque transaction blockchain nécessite des frais payés aux validateurs du réseau. Sur le réseau principal Ethereum, ces frais (appelés "gaz") fluctuent en fonction de la demande du réseau :

**Coûts du gaz sur le réseau principal Ethereum :**

- Transfert simple : 1-5 $
- Approbation de jeton : 2-8 $
- Transaction complexe (dépôt fiduciaire) : 5-15 $
- En cas de forte demande : 20-50 $+

**Pour la location de GPU, cela crée un problème :**

Imaginez louer une RTX 4090 pour 2 heures à 0,60 $/heure :

- Coût du GPU : 1,20 $
- Gaz Ethereum pour le dépôt : 5,00 $
- Gaz Ethereum pour le retrait : 5,00 $
- **Total : 11,20 $ pour 1,20 $ de temps GPU**

Lorsque les frais de gaz dépassent le coût de la location, les petites transactions deviennent économiquement irrationnelles.

### Polygon : Même sécurité, frais 100 fois inférieurs

Polygon est un réseau de "Couche 2" (Layer 2) construit sur Ethereum. Il hérite du modèle de sécurité d'Ethereum tout en traitant les transactions à un coût considérablement inférieur :

**Coûts du gaz sur Polygon :**

- Transfert simple : 0,001-0,01 $
- Approbation de jeton : 0,005-0,02 $
- Transaction complexe (dépôt fiduciaire) : 0,01-0,05 $
- En cas de forte demande : 0,05-0,20 $

**Le même scénario de location de GPU sur Polygon :**

- Coût du GPU : 1,20 $
- Gaz Polygon pour le dépôt : 0,02 $
- Gaz Polygon pour le retrait : 0,02 $
- **Total : 1,24 $ pour 1,20 $ de temps GPU**

Les frais de gaz deviennent négligeables plutôt que prohibitifs.

### Détails techniques (Pour les curieux)

Polygon parvient à des frais bas grâce à différents mécanismes de consensus et au traitement par lots des transactions. L'architecture technique importe moins que le résultat pratique :

| Réseau           | Temps de confirmation | Frais de transaction | Sécurité                        |
| ---------------- | --------------------- | -------------------- | ------------------------------- |
| Ethereum mainnet | 15-60 secondes        | 1-15 $               | La plus élevée                  |
| Polygon          | 2-5 secondes          | 0,001-0,05 $         | Élevée (sécurisée par Ethereum) |
| Solana           | <1 seconde            | 0,0001-0,01 $        | Élevée                          |

GPUFlow et d'autres plateformes GPU crypto-natives utilisent Polygon car :

- Les frais ne détruisent pas l'économie des petites locations
- La confirmation rapide signifie un accès rapide
- La sécurité reste forte via l'ancrage à Ethereum
- Large disponibilité des stablecoins (USDC, USDT)

### Votre portefeuille fonctionne sur les deux réseaux

Voici le concept clé : **Votre adresse de portefeuille MetaMask est la même sur Ethereum et sur Polygon.**

L'adresse `0x7a3B...4f2D` existe sur les deux réseaux. Les fonds envoyés à cette adresse sur Polygon restent sur Polygon. Les fonds envoyés sur Ethereum restent sur Ethereum. Même adresse, réseaux différents, soldes séparés.

C'est pourquoi la sélection du réseau est importante lors de l'envoi de fonds. Envoyer de l'USDC sur le réseau principal Ethereum à votre adresse ne rend pas ces fonds disponibles sur Polygon — ils sont sur des réseaux différents malgré l'adresse identique.

![Diagramme de comparaison montrant une adresse de portefeuille identique existant à la fois sur le réseau principal Ethereum et sur le réseau Polygon, avec des soldes de fonds séparés sur chaque réseau, illustrant que la même adresse ne signifie pas que les fonds sont partagés entre les réseaux](../_images/ethereum-polygon-same-address-different-networks.png)

---

## Installation de MetaMask et sécurité de la phrase secrète

MetaMask est un portefeuille sous forme d'extension de navigateur qui stocke vos cryptomonnaies et vous permet d'interagir avec des applications blockchain. L'installation prend environ cinq minutes.

### Étape 1 : Télécharger MetaMask

**Allez directement à la source officielle :**

1. Ouvrez votre navigateur (Chrome, Firefox, Brave ou Edge)
2. Visitez **metamask.io** (vérifiez l'URL attentivement — les sites de phishing existent)
3. Cliquez sur "Download" (Télécharger)
4. Sélectionnez votre navigateur
5. Cliquez sur "Add to [Browser]" (Ajouter à [Navigateur]) dans le magasin d'extensions
6. Confirmez l'installation lorsque vous y êtes invité

**Avertissement :** Téléchargez MetaMask uniquement depuis metamask.io ou les magasins d'extensions officiels des navigateurs. N'installez jamais à partir de liens dans des e-mails, des messages Discord ou des publicités de recherche. Les fausses extensions MetaMask volent les fonds.

### Étape 2 : Créer un nouveau portefeuille

Après l'installation :

1. Cliquez sur l'icône du renard MetaMask dans la barre d'outils de votre navigateur
2. Cliquez sur "Get Started" (Commencer)
3. Sélectionnez "Create a new wallet" (Créer un nouveau portefeuille)
4. Acceptez les conditions (lisez-les si vous le souhaitez, ce sont des conditions logicielles standard)
5. Créez un mot de passe

**Ce mot de passe :**

- Déverrouille MetaMask sur cet appareil spécifique
- NE récupère PAS votre portefeuille si vous perdez l'accès
- Doit être fort mais n'a pas besoin d'être mémorisé pour toujours
- Est distinct de votre phrase secrète (expliquée ci-dessous)

### Étape 3 : Sécuriser votre phrase secrète

**C'est l'étape la plus critique. Lisez attentivement.**

MetaMask affichera 12 mots dans un ordre spécifique. Ces mots sont votre "phrase secrète" (seed phrase) ou "phrase de récupération".

**Ce que fait la phrase secrète :**

- Fournit un accès complet à votre portefeuille depuis n'importe quel appareil
- Permet la récupération si votre ordinateur tombe en panne, si le navigateur plante ou si MetaMask est corrompu
- Ne peut être ni modifiée ni réinitialisée — ces 12 mots sont permanents pour ce portefeuille
- Quiconque possède ces mots peut prendre tous vos fonds instantanément

**Ce qu'il faut faire :**

1. MetaMask affiche 12 mots à l'écran
2. **Écrivez-les sur papier dans l'ordre exact** (mot 1, mot 2... mot 12)
3. Ne les photographiez pas, ne faites pas de capture d'écran et ne les saisissez pas sur un appareil numérique
4. Ne les stockez pas dans un gestionnaire de mots de passe, un cloud ou une application de notes
5. Rangez le papier dans un endroit sûr (coffre-fort, boîte de sécurité)
6. Envisagez de faire une deuxième copie stockée dans un emplacement physique différent

**Ce qu'il ne faut PAS faire :**

- Ne saisissez jamais la phrase secrète sur un site web (les sites légitimes ne la demandent jamais)
- Ne la partagez jamais avec quelqu'un prétendant être du "support"
- Ne la stockez jamais numériquement sous quelque forme que ce soit
- Ne la lisez jamais à haute voix à portée d'oreille d'autres personnes ou d'appareils

**Pourquoi cela compte :**

Contrairement aux comptes bancaires, les portefeuilles de cryptomonnaies n'ont pas de service client, pas de service de fraude ni d'annulation de transaction. Si quelqu'un obtient votre phrase secrète :

- Il vide votre portefeuille en quelques secondes
- Aucune autorité ne peut annuler la transaction
- Aucune récupération n'est possible
- Les fonds sont définitivement perdus

La phrase secrète _est_ le portefeuille. Protégez-la en conséquence.

### Étape 4 : Confirmer la phrase secrète

MetaMask vous demandera de confirmer en sélectionnant les mots dans l'ordre :

1. Cliquez sur les mots dans la séquence correcte
2. Cela vérifie que vous les avez réellement notés
3. Ne sautez pas cette étape en les mémorisant temporairement — vous avez besoin de la sauvegarde écrite

### Étape 5 : Portefeuille prêt

Après confirmation, votre portefeuille est créé et prêt à être utilisé. Vous verrez :

- Votre adresse de portefeuille (commence par `0x`, suivie de 40 caractères)
- Le solde affichant 0 ETH (vous ne l'avez pas encore financé)
- L'indicateur de réseau affichant "Ethereum Mainnet"

**Votre adresse de portefeuille :**

- Elle est publique — il est sûr de la partager pour recevoir des fonds
- Comme une adresse e-mail pour la cryptomonnaie
- Ne change pas et ne peut pas être modifiée
- La même adresse fonctionne sur plusieurs réseaux (Ethereum, Polygon, etc.)

![Interface du portefeuille MetaMask montrant un nouveau portefeuille avec un solde nul, mettant en évidence l'emplacement de l'adresse du portefeuille, le sélecteur de réseau et les éléments clés de l'interface pour les nouveaux utilisateurs](../_images/metamask-new-wallet-interface-annotated.png)

---

## Ajouter le réseau Polygon à MetaMask

MetaMask est configuré par défaut sur le réseau principal Ethereum. Pour utiliser les frais réduits de Polygon, vous devez ajouter le réseau.

### Méthode 1 : Ajout automatique (Le plus facile)

1. Visitez **chainlist.org**
2. Recherchez "Polygon"
3. Trouvez "Polygon Mainnet" (Chain ID : 137)
4. Cliquez sur "Add to MetaMask" (Ajouter à MetaMask)
5. Une fenêtre contextuelle MetaMask apparaît — cliquez sur "Approve" (Approuver)
6. Cliquez sur "Switch to Network" (Changer de réseau) pour activer Polygon

**C'est fait.** Polygon est maintenant disponible dans votre menu déroulant de réseaux.

### Méthode 2 : Ajout manuel

Si chainlist.org ne fonctionne pas, ajoutez-le manuellement :

1. Cliquez sur l'icône de l'extension MetaMask
2. Cliquez sur le menu déroulant du réseau (affichant "Ethereum Mainnet")
3. Cliquez sur "Add network" (Ajouter un réseau)
4. Cliquez sur "Add a network manually" (Ajouter un réseau manuellement)
5. Entrez ces détails exacts :

```

Network Name: Polygon Mainnet
New RPC URL: https://polygon-rpc.com
Chain ID: 137
Currency Symbol: MATIC
Block Explorer URL: https://polygonscan.com

```

6. Cliquez sur "Save" (Enregistrer)
7. Polygon apparaît dans votre liste de réseaux

### Changer entre les réseaux

Après avoir ajouté Polygon :

1. Cliquez sur le menu déroulant du réseau dans MetaMask (en haut au centre de l'extension)
2. Sélectionnez "Polygon Mainnet" ou "Ethereum Mainnet"
3. L'affichage de votre solde change pour montrer les fonds sur le réseau sélectionné

**N'oubliez pas :** Même adresse, réseaux différents. Les fonds sur Ethereum ne sont pas visibles lorsque vous consultez Polygon, et viceversa. Vous regardez la même boîte aux lettres mais dans des bureaux de poste différents.

### Vérifier l'ajout du réseau

Confirmez que Polygon fonctionne :

1. Passez sur Polygon Mainnet
2. Le solde devrait afficher "0 MATIC" (vous ne l'avez pas financé)
3. Un petit logo Polygon apparaît à côté du nom du réseau
4. L'adresse reste la même que sur Ethereum

Si vous voyez des erreurs concernant les connexions RPC :

- Essayez une URL RPC alternative : `https://rpc-mainnet.matic.quiknode.pro`
- Ou : `https://polygon-bor.publicnode.com`
- La congestion du réseau cause parfois des problèmes de RPC

![Menu déroulant du sélecteur de réseau MetaMask affichant les options Ethereum Mainnet et Polygon Mainnet, avec Polygon sélectionné et mis en évidence, démontrant comment basculer entre les réseaux](../_images/metamask-network-selector-polygon.png)

---

## Financer votre portefeuille avec de l'USDC

Votre portefeuille existe maintenant mais il est vide. Cette section explique comment obtenir de l'USDC (le stablecoin recommandé pour la location de GPU) dans votre portefeuille MetaMask sur le réseau Polygon.

### Pourquoi l'USDC pour la location de GPU

**Les stablecoins éliminent la volatilité des prix :**

- L'USDC maintient une parité de 1:1 avec le dollar américain.
- 100 USDC aujourd'hui vaudront 100 USDC demain.
- Aucun risque que les fluctuations des prix des cryptomonnaies n'affectent votre budget GPU.

**Comparé aux cryptomonnaies volatiles :**

- Vous déposez 100 $ d'ETH pour la location de GPU.
- L'ETH chute de 10 % pendant la nuit.
- Votre solde restant achète 10 % de temps GPU en moins.
- Le prix a évolué en votre défaveur sans aucune action de votre part.

**L'USDC évite cela complètement.** Votre budget de location de GPU reste stable quelles que soient les conditions du marché.

### Méthode de financement 1 : Retrait depuis un échange (Recommandé)

Si vous possédez déjà des cryptomonnaies sur un échange (comme Coinbase, Binance, Kraken, etc.), le retrait direct vers Polygon est l'option la moins chère.

**Pas à pas pour Coinbase :**

1. Connectez-vous à Coinbase.
2. Accédez à votre solde USDC.
3. Cliquez sur "Send" (Envoyer).
4. Entrez l'adresse de votre portefeuille MetaMask (copiez-la depuis MetaMask).
5. **Critique :** Sélectionnez "Polygon" comme réseau.
6. Entrez le montant à envoyer.
7. Vérifiez les frais (généralement 0,10 à 1,00 $ pour un retrait Polygon).
8. Confirmez le retrait.
9. Attendez la confirmation (généralement 1 à 10 minutes).

**Pas à pas pour Binance :**

1. Connectez-vous à Binance.
2. Accédez à Wallet → Spot Wallet (Portefeuille Spot).
3. Trouvez l'USDC, cliquez sur "Withdraw" (Retirer).
4. Collez l'adresse de votre portefeuille MetaMask.
5. **Critique :** Sélectionnez le réseau "MATIC" ou "Polygon".
6. Entrez le montant.
7. Terminez la vérification de sécurité.
8. Attendez la confirmation (généralement 5 à 15 minutes).

**Échanges courants prenant en charge le retrait USDC sur Polygon :**

| Échange    | Support Polygon | Frais typiques |
| ---------- | --------------- | -------------- |
| Coinbase   | Oui             | 0,10-0,50 $    |
| Binance    | Oui             | 0,10-0,30 $    |
| Kraken     | Oui             | 0,10-0,50 $    |
| Crypto.com | Oui             | 0,10-0,25 $    |
| KuCoin     | Oui             | 0,10-0,30 $    |
| OKX        | Oui             | 0,10-0,20 $    |

**Si votre échange ne prend pas en charge le retrait Polygon :**

Vous avez deux options :

1. Retirer sur Ethereum, puis utiliser un "pont" (bridge) vers Polygon (coûte plus cher en gaz).
2. Utiliser un autre échange qui prend en charge Polygon.

Passer par le pont depuis Ethereum coûte 5 à 15 $ en frais de gaz. Utiliser un échange avec un support natif de Polygon coûte 0,10 à 0,50 $. Le choix est évident pour les petits montants.

### Méthode de financement 2 : Achat direct via Onramp

Si vous ne possédez de cryptomonnaies nulle part, les services "onramp" vous permettent d'acheter directement par carte de crédit ou virement bancaire.

**Services onramp populaires :**

| Service | Méthodes de paiement | Frais | Support Polygon |
| ------- | -------------------- | ----- | --------------- |
| Transak | Carte, virement      | 1-3 % | Oui             |
| MoonPay | Carte, virement      | 2-4 % | Oui             |
| Ramp    | Carte, virement      | 1-3 % | Oui             |
| Banxa   | Carte, virement      | 2-4 % | Oui             |

**Pas à pas avec Transak :**

1. Visitez transak.com.
2. Sélectionnez "Buy" (Acheter).
3. Choisissez l'USDC comme cryptomonnaie.
4. Sélectionnez Polygon comme réseau.
5. Entrez le montant dans votre devise locale.
6. Cliquez sur "Buy Now" (Acheter maintenant).
7. Connectez le portefeuille MetaMask ou collez l'adresse.
8. Effectuez le paiement (carte ou banque).
9. L'USDC arrive directement dans votre MetaMask sur Polygon.

**Les frais sont plus élevés que le retrait depuis un échange** (1-4 % contre 0,10-0,50 $ fixe), mais les onramps sont pratiques si vous partez de zéro.

### Méthode de financement 3 : Achat intégré dans MetaMask

MetaMask inclut une fonctionnalité d'achat via des services partenaires :

1. Ouvrez MetaMask.
2. Assurez-vous que le réseau Polygon est sélectionné.
3. Cliquez sur "Buy" (Acheter).
4. Sélectionnez la méthode de paiement.
5. Choisissez le montant.
6. Finalisez l'achat via le partenaire (Transak, MoonPay, etc.).

**Mêmes frais que l'onramp direct** puisque MetaMask route via les mêmes services, mais l'intégration est légèrement plus pratique.

### Méthode de financement 4 : Pont (Bridge) depuis Ethereum

Si vous avez de l'USDC sur le réseau principal Ethereum et ne pouvez pas retirer directement vers Polygon depuis votre échange :

**Utilisation du pont officiel Polygon :**

1. Visitez portal.polygon.technology/bridge.
2. Connectez MetaMask.
3. Sélectionnez "Deposit" (Dépôt) (Ethereum → Polygon).
4. Choisissez l'USDC.
5. Entrez le montant.
6. Approuvez la dépense de l'USDC (coût du gaz : 2-8 $).
7. Confirmez la transaction de pont (coût du gaz : 5-15 $).
8. Attendez 15-30 minutes pour l'achèvement.
9. L'USDC apparaît dans le portefeuille sur Polygon.

**Coût total du gaz Ethereum : 7-23 $** selon la congestion du réseau.

**C'est l'option coûteuse.** N'utilisez le pont que si :

- Votre échange ne prend pas en charge le retrait Polygon.
- Vous avez déjà de l'USDC bloqué sur Ethereum.
- Le montant est suffisamment important pour que les frais de pont soient proportionnellement faibles.

Pour des montants inférieurs à 200 $, trouver un échange avec support Polygon est plus économique que d'utiliser le pont.

### Vérifier l'arrivée des fonds

Après n'importe quelle méthode de financement :

1. Ouvrez MetaMask.
2. **Assurez-vous que le réseau Polygon est sélectionné** (erreur courante : vérifier le mauvais réseau).
3. Cliquez sur "Import tokens" (Importer des jetons) si l'USDC n'apparaît pas automatiquement.
4. Contrat USDC sur Polygon : `0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359`
5. Le solde devrait refléter votre dépôt.

**Si les fonds n'apparaissent pas :**

- Confirmez que la transaction est terminée du côté de l'expéditeur (échange, onramp).
- Vérifiez que vous consultez le réseau Polygon dans MetaMask.
- Vérifiez la transaction sur Polygonscan en utilisant votre adresse de portefeuille.
- Certains jetons nécessitent une importation manuelle (ajoutez le jeton en utilisant l'adresse du contrat).

![Organigramme montrant trois voies de financement vers MetaMask sur Polygon : voie de retrait d'échange avec les frais les plus bas, voie d'achat onramp pour les nouveaux utilisateurs, et voie de pont Ethereum marquée comme option coûteuse, avec des estimations de frais pour chaque voie](../_images/funding-metamask-polygon-three-paths.png)

---

## Obtenir du MATIC pour les frais de gaz

Vous avez de l'USDC pour la location de GPU, mais vous ne pouvez pas encore effectuer de transactions. Chaque transaction Polygon nécessite une petite quantité de MATIC pour payer les frais de gaz — même les transactions impliquant d'autres jetons comme l'USDC.

### Pourquoi vous avez besoin de MATIC

**Structure des frais de la blockchain :**

- Les frais de gaz doivent être payés dans la devise native du réseau.
- La devise native de Polygon est le MATIC.
- Même si vous payez la location du GPU en USDC, la transaction elle-même coûte du MATIC.
- Pas de MATIC = impossible d'envoyer des transactions.

**Le montant nécessaire est minuscule :**

| Action               | Coût approximatif en MATIC | Équivalent en USD |
| -------------------- | -------------------------- | ----------------- |
| Envoyer de l'USDC    | 0,001-0,01 MATIC           | 0,001-0,01 $      |
| Approuver un jeton   | 0,005-0,02 MATIC           | 0,005-0,02 $      |
| Dépôt sur plateforme | 0,01-0,05 MATIC            | 0,01-0,05 $       |
| Transaction complexe | 0,02-0,10 MATIC            | 0,02-0,10 $       |

**1 à 2 $ de MATIC couvrent des dizaines de transactions.** Vous n'avez pas besoin de beaucoup, mais vous avez besoin d'un peu.

### Méthode 1 : Retirer du MATIC depuis un échange

Même processus que le retrait USDC :

1. Sur votre échange, trouvez le MATIC.
2. Cliquez sur "Withdraw" (Retirer).
3. Entrez l'adresse MetaMask.
4. **Sélectionnez le réseau Polygon** (certains échanges l'appellent "MATIC").
5. Retirez un petit montant (valeur de 2-5 $).
6. Le MATIC arrive dans le portefeuille.

**La plupart des grands échanges prennent en charge le retrait MATIC sur Polygon.** Les frais sont généralement de 0,01 à 0,10 $.

### Méthode 2 : Utiliser un Faucet (Robinet)

Les faucets fournissent de petites quantités de MATIC gratuitement, destinées aux nouveaux utilisateurs qui ont besoin de gaz pour commencer.

**Faucets disponibles :**

| Faucet                                               | Montant           | Fréquence  |
| ---------------------------------------------------- | ----------------- | ---------- |
| Polygon Faucet (faucet.polygon.technology)           | 0,001-0,002 MATIC | Quotidien  |
| Alchemy Faucet (alchemy.com/faucets/polygon-mainnet) | 0,5 MATIC         | Par compte |
| QuickNode Faucet                                     | Variable          | Limitée    |

**Utilisation du faucet Alchemy (recommandé) :**

1. Visitez alchemy.com/faucets/polygon-mainnet.
2. Créez un compte Alchemy gratuit (ou connectez-vous).
3. Collez l'adresse de votre portefeuille MetaMask.
4. Cliquez sur "Send Me MATIC" (Envoyez-moi du MATIC).
5. 0,5 MATIC arrive en quelques minutes.

**0,5 MATIC suffit pour environ 50 à 100 transactions** — suffisant pour des mois d'utilisation typique de location de GPU.

### Méthode 3 : Échanger (Swap) de l'USDC contre du MATIC

Si vous avez de l'USDC mais pas de MATIC, utilisez l'échange intégré de MetaMask :

1. Ouvrez MetaMask sur le réseau Polygon.
2. Cliquez sur "Swap" (Échanger).
3. Sélectionnez l'USDC comme jeton "de" (from).
4. Sélectionnez le MATIC comme jeton "vers" (to).
5. Entrez un petit montant (valeur de 1-2 $).
6. Vérifiez le taux et les frais.
7. Cliquez sur "Swap".

**Problème :** Cet échange lui-même nécessite du MATIC pour le gaz. Si vous avez exactement zéro MATIC, vous ne pouvez pas exécuter l'échange.

**Solution pour la situation "zéro MATIC" :**

- Utilisez d'abord un faucet pour obtenir un minimum de MATIC.
- Certains agrégateurs d'échange offrent des "échanges sans gaz" où ils avancent le gaz.
- Demandez à quelqu'un de vous envoyer 0,01 MATIC (les membres de la communauté aident souvent les nouveaux arrivants).

### Méthode 4 : Parrainage de gaz

Certaines plateformes parrainent les frais de gaz pour les nouveaux utilisateurs :

**Approche de GPUFlow :**

GPUFlow détecte lorsque les utilisateurs ont de l'USDC mais pas assez de MATIC et propose de parrainer les frais de gaz de la première transaction. Cela permet aux utilisateurs de :

1. Déposer de l'USDC sur la plateforme.
2. La plateforme couvre le coût du gaz pour le dépôt initial.
3. L'utilisateur peut retirer plus tard une petite quantité de MATIC du solde de la plateforme si nécessaire.

**Autres options de parrainage :**

- Certains protocoles DeFi parrainent le gaz pour les premiers utilisateurs.
- Faucets communautaires sur les serveurs Discord.
- Onramps de couche 2 qui incluent une petite quantité de MATIC avec les achats d'USDC.

### Combien de MATIC conserver

**Solde MATIC recommandé pour la location de GPU :**

| Niveau d'utilisation                 | Solde MATIC | Valeur USD | Durée     |
| ------------------------------------ | ----------- | ---------- | --------- |
| Léger (peu de locations/mois)        | 0,5 MATIC   | ~0,50 $    | 3-6 mois  |
| Modéré (locations hebdo)             | 2 MATIC     | ~2,00 $    | 6-12 mois |
| Intensif (transactions quotidiennes) | 5 MATIC     | ~5,00 $    | 6-12 mois |

**Vous n'avez pas besoin de beaucoup.** Même les utilisateurs intensifs ont rarement besoin de plus de 5 $ de MATIC pour le gaz sur plusieurs mois d'utilisation. Le coût par transaction est si bas que le solde de MATIC s'épuise très lentement.

### Vérifier le solde MATIC

1. Ouvrez MetaMask.
2. Sélectionnez le réseau Polygon.
3. Le solde MATIC s'affiche en haut (c'est la devise native, toujours visible).
4. Confirmez que le solde est supérieur à 0.

**Avec à la fois de l'USDC et du MATIC dans votre portefeuille, vous êtes prêt à vous connecter aux plateformes GPU.**

![Comparaison montrant les méthodes d'acquisition de MATIC : retrait d'échange pour les montants plus importants, faucets pour les petits montants gratuits, et échange pour convertir les jetons existants, avec l'approche recommandée mise en évidence pour les nouveaux utilisateurs de location de GPU](../_images/matic-acquisition-methods-comparison.png)

---

## Connecter votre portefeuille aux plateformes de location de GPU

Votre portefeuille est financé. Connectez-le maintenant à une plateforme de location de GPU. Cette section explique ce qui se passe lors de la connexion et quelles permissions vous accordez.

### Comprendre la connexion du portefeuille

Lorsqu'un site web demande une connexion au portefeuille, vous accordez un accès limité :

**Ce que la connexion PERMET :**

- Le site web peut voir votre adresse de portefeuille.
- Le site web peut voir vos soldes de jetons.
- Le site web peut demander des transactions (que vous devez approuver individuellement).

**Ce que la connexion NE PERMET PAS :**

- Le site web ne peut pas déplacer de fonds sans votre approbation.
- Le site web ne peut pas signer de transactions automatiquement.
- Le site web ne peut pas accéder à vos clés privées ou à votre phrase secrète.

**La connexion du portefeuille est comme montrer votre carte d'identité**, pas remettre vos clés. Le site web apprend qui vous êtes (votre adresse) mais ne peut pas agir à votre place.

### Connexion à GPUFlow

**Pas à pas :**

1. Visitez gpuflow.app.
2. Assurez-vous que MetaMask est réglé sur le réseau Polygon.
3. Cliquez sur "Connect Wallet" (Connecter le portefeuille) (généralement en haut à droite).
4. Une fenêtre contextuelle MetaMask apparaît montrant la demande de connexion.
5. Vérifiez que l'URL du site web est correcte (protection contre le phishing).
6. Cliquez sur "Connect" (Connecter).
7. Votre adresse de portefeuille apparaît maintenant sur le site.

**Ce qui s'est passé :**

- GPUFlow peut maintenant afficher votre solde USDC.
- GPUFlow peut préparer des transactions que vous devrez signer.
- GPUFlow ne peut pas accéder à vos fonds sans approbation explicite.

### Comprendre les approbations de transactions

Après la connexion, vous rencontrerez deux types de transactions :

**Type 1 : Approbation de jeton (Approval)**

Avant qu'une plateforme puisse utiliser votre USDC, vous devez "approuver" le jeton pour son contrat intelligent :

```

La fenêtre MetaMask affiche :
"Give permission to access your USDC?" (Donner la permission d'accéder à votre USDC ?)
Demandé par : gpuflow.app
Pour le contrat : 0x7a3B...

```

**Ce que cela signifie :**

- Vous autorisez le contrat spécifié à transférer de l'USDC depuis votre portefeuille.
- Seul ce contrat spécifique peut utiliser cette permission.
- Vous pouvez révoquer cette permission plus tard.
- Il est courant d'approuver un montant "illimité" par commodité (évite les approbations répétées).

**Type 2 : Confirmation de transaction**

Lorsque vous déposez, louez ou retirez réellement :

```

La fenêtre MetaMask affiche :
"Confirm transaction" (Confirmer la transaction)
Action : Deposit 50 USDC to escrow (Déposer 50 USDC en dépôt fiduciaire)
Frais de gaz : 0.02 MATIC (~0,02 $)

```

**Ce que cela signifie :**

- Vous autorisez une action spécifique avec des montants spécifiques.
- Les frais de gaz affichés seront déduits de votre solde MATIC.
- Cliquer sur "Confirm" exécute la transaction sur la blockchain.
- La transaction est irréversible une fois confirmée.

### Meilleures pratiques de sécurité

**Avant de vous connecter à un site :**

1. **Vérifiez l'URL :** Vérifiez l'orthographe attentivement (gpuflow.app vs gpufl0w.app).
2. **Vérifiez le certificat :** Recherchez https:// et un certificat valide.
3. **Mettez les sites légitimes en favoris :** Évitez de chercher et de cliquer sur des publicités.

**Lors de l'approbation des transactions :**

1. **Lisez ce que vous approuvez :** Montant du jeton, contrat destinataire.
2. **Vérifiez que les frais de gaz sont raisonnables :** Les transactions Polygon devraient être inférieures à 0,10 $.
3. **Vérifiez le réseau :** Confirmez que vous êtes sur le réseau attendu (Polygon).
4. **Ne vous précipitez pas :** Prenez le temps de vérifier les détails.

**Maintenance périodique :**

1. **Examinez les approbations :** Visitez revoke.cash pour voir toutes les approbations de jetons.
2. **Révoquez les approbations inutilisées :** Supprimez les permissions pour les plateformes que vous n'utilisez plus.
3. **Utilisez des portefeuilles séparés :** Envisagez un portefeuille dédié pour la location de GPU avec des fonds limités.

### Connexion à d'autres plateformes

**Vast.ai avec cryptomonnaie :**

1. Créez un compte Vast.ai (email requis).
2. Accédez à Billing (Facturation).
3. Cliquez sur "Add Credit" (Ajouter du crédit) → "Cryptocurrency".
4. Sélectionnez le type de crypto.
5. Effectuez le paiement via la passerelle CoinPayments.
6. Pas de connexion directe au portefeuille nécessaire (paiement via passerelle).

**RunPod avec cryptomonnaie :**

1. Créez un compte RunPod.
2. Accédez à Billing (Facturation).
3. Cliquez sur "Add Funds" (Ajouter des fonds) → "Crypto".
4. Sélectionnez le type de crypto.
5. Effectuez le paiement via Coinbase Commerce.
6. Pas de connexion directe au portefeuille nécessaire.

**Note :** Vast.ai et RunPod utilisent des passerelles de paiement plutôt qu'une connexion directe au portefeuille. Vous envoyez des cryptos à une adresse fournie plutôt que de connecter votre portefeuille à leur site. C'est un modèle différent de l'intégration directe du portefeuille de GPUFlow.

Pour une comparaison complète de la manière dont différentes plateformes gèrent les paiements en cryptomonnaies, consultez notre [Guide complet de la location de GPU avec des cryptomonnaies](/fr/rent-gpu-with-crypto/).

### Ce que signifie chaque permission

| Demande de permission | Ce qu'elle permet                                          | Niveau de risque   |
| --------------------- | ---------------------------------------------------------- | ------------------ |
| "Connect wallet"      | Voir votre adresse et vos soldes                           | Très faible        |
| "Approve [token]"     | Le contrat peut transférer le jeton approuvé               | Faible-Moyen       |
| "Unlimited approval"  | Le contrat peut transférer n'importe quel montant du jeton | Moyen              |
| "Sign message"        | Prouver que vous possédez le portefeuille                  | Très faible        |
| "Send transaction"    | Exécuter une action blockchain spécifique                  | Dépend de l'action |

**Signaux d'alarme à rejeter :**

- Demandes d'approbation pour des jetons que vous n'avez pas l'intention d'utiliser.
- Montants de transaction différents de ce à quoi vous vous attendiez.
- Frais de gaz considérablement plus élevés que la normale (mauvais réseau ?).
- Demandes de phrase secrète (JAMAIS légitimes).
- Signature de messages à des fins inconnues.

![Fenêtre contextuelle d'approbation de transaction MetaMask annotée montrant les éléments clés à vérifier : URL du site web, adresse du contrat, montant du jeton, frais de gaz, et boutons approuver/rejeter avec des étiquettes explicatives pour chaque élément](../_images/metamask-transaction-approval-annotated.png)

---

## Résolution des problèmes courants

Même les configurations simples peuvent rencontrer des problèmes. Cette section aborde les difficultés les plus courantes auxquelles les nouveaux utilisateurs sont confrontés.

### Erreurs "Transaction Failed" (Transaction échouée)

**Symptôme :** La transaction affiche un statut d'échec dans MetaMask après la tentative de confirmation.

**Causes courantes et solutions :**

**MATIC insuffisant pour le gaz :**

- Le message d'erreur mentionne souvent "insufficient funds for gas".
- Vous avez de l'USDC mais pas de MATIC.
- Solution : Acquérez du MATIC en utilisant un faucet ou par retrait depuis un échange.

**Solde de jetons insuffisant :**

- Vous essayez d'envoyer plus d'USDC que vous n'en possédez.
- Rappel : Les frais de gaz réduisent le MATIC disponible, pas l'USDC.
- Solution : Réduisez le montant de la transaction ou ajoutez plus de jetons.

**Slippage (glissement) trop faible (pour les échanges) :**

- Le prix a bougé entre le devis et l'exécution.
- Solution : Augmentez la tolérance au slippage dans les paramètres de l'échange (1 à 3 % sont généralement suffisants).

**Problèmes de Nonce :**

- Une transaction précédente est bloquée, empêchant les transactions suivantes.
- Solution : Dans les paramètres de MetaMask, allez dans Avancé → Réinitialiser le compte (Reset Account) (cela ne fait pas perdre de fonds).

### Les fonds n'apparaissent pas

**Symptôme :** Vous avez envoyé des fonds mais le portefeuille affiche un solde nul.

**Vérifiez ces points dans l'ordre :**

**1. Le bon réseau est-il sélectionné ?**

- Problème le plus courant : Regarder Ethereum alors que les fonds sont sur Polygon (ou inversement).
- Cliquez sur le menu déroulant du réseau, passez au bon réseau.
- Même adresse, réseaux différents = soldes différents.

**2. La transaction est-elle réellement terminée ?**

- Vérifiez du côté de l'expéditeur (échange, autre portefeuille).
- Trouvez le hash de la transaction.
- Recherchez sur l'explorateur de blocs approprié :
  - Polygon : polygonscan.com
  - Ethereum : etherscan.io
- Confirmez que la transaction affiche le statut "Success" (Succès).

**3. Le jeton doit-il être importé ?**

- Certains jetons n'apparaissent pas automatiquement.
- Cliquez sur "Import tokens" (Importer des jetons) dans MetaMask.
- Collez l'adresse du contrat du jeton :
  - USDC sur Polygon : `0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359`
- Le jeton devrait apparaître après l'importation.

**4. Envoyé sur le mauvais réseau ?**

- Envoyé sur Ethereum mais attendu sur Polygon ?
- Les fonds ne sont pas perdus — ils sont simplement sur un réseau différent.
- Basculez MetaMask sur le réseau sur lequel vous avez réellement envoyé.
- Utilisez un pont pour déplacer les fonds vers le réseau prévu si nécessaire.

### Problèmes de connexion MetaMask

**Symptôme :** Le site web ne se connecte pas à MetaMask ou la connexion s'interrompt.

**Solutions :**

**Actualiser et réessayer :**

- Actualisez la page web.
- Cliquez à nouveau sur "Connect Wallet".
- Approuvez dans la fenêtre contextuelle MetaMask.

**Vérifiez que MetaMask est déverrouillé :**

- Cliquez sur l'icône MetaMask.
- Entrez le mot de passe s'il est verrouillé.
- Réessayez la connexion.

**Désactivez les extensions conflictuelles :**

- D'autres extensions de portefeuille peuvent interférer.
- Désactivez temporairement Phantom, Coinbase Wallet, etc.
- Réessayez la connexion avec seulement MetaMask actif.

**Essayez un autre navigateur :**

- Il existe des problèmes spécifiques aux navigateurs.
- Essayez Chrome, Firefox ou Brave.
- Réinstallez l'extension MetaMask si le problème persiste.

**Effacer la connexion MetaMask :**

- Dans MetaMask : Paramètres → Connexions.
- Trouvez le site problématique.
- Cliquez sur "Disconnect" (Déconnecter).
- Reconnectez-vous à neuf.

### Erreurs de mauvais réseau

**Symptôme :** Le site affiche "Wrong network" ou "Please switch to Polygon".

**Solution :**

1. Cliquez sur le menu déroulant du réseau dans MetaMask.
2. Sélectionnez "Polygon Mainnet".
3. Si Polygon n'est pas listé, ajoutez-le (voir section précédente).
4. Actualisez la page du site web.
5. Reconnectez le portefeuille si nécessaire.

**La plupart des plateformes GPU affichent une invite** pour changer de réseau automatiquement. Cliquez sur "Switch Network" dans la fenêtre MetaMask lorsque vous y êtes invité.

### Échec de l'estimation du gaz (Gas Estimation Failed)

**Symptôme :** MetaMask affiche "Gas estimation failed" lors d'une tentative de transaction.

**Causes courantes :**

**Contrat rejetant la transaction :**

- Solde de jetons insuffisant pour l'opération.
- Tentative d'interaction avec un contrat incompatible.
- Maintenance ou problèmes de la plateforme.

**Congestion du réseau :**

- Rare sur Polygon mais possible.
- Attendez quelques minutes et réessayez.

**Approche de solution :**

1. Vérifiez que vous avez un solde suffisant pour l'action prévue.
2. Vérifiez que vous êtes sur le bon réseau.
3. Essayez un montant de transaction plus petit.
4. Vérifiez le statut de la plateforme (Discord, Twitter) pour les problèmes connus.
5. Réessayez plus tard si une congestion du réseau est suspectée.

### Transaction en attente bloquée

**Symptôme :** La transaction affiche "Pending" (En attente) pendant une période prolongée (plus de 5 minutes sur Polygon).

**Temps d'attente normaux :**

- Polygon : 5-30 secondes.
- Ethereum : 30 secondes - 5 minutes.
- Une durée plus longue indique un problème.

**Solutions :**

**Accélérer la transaction :**

1. Cliquez sur la transaction en attente dans MetaMask.
2. Cliquez sur "Speed Up" (Accélérer).
3. Augmentez le prix du gaz.
4. Confirmez la nouvelle transaction.
5. Le gaz plus élevé remplace la transaction bloquée.

**Annuler la transaction :**

1. Cliquez sur la transaction en attente.
2. Cliquez sur "Cancel" (Annuler).
3. Confirmez l'annulation (coûte du gaz).
4. La transaction originale est abandonnée.

**Dernier recours - Réinitialiser le compte :**

1. Paramètres MetaMask → Avancé.
2. Cliquez sur "Reset Account" (Réinitialiser le compte).
3. Efface l'historique des transactions et le nonce.
4. N'affecte **PAS** les soldes.
5. Réessayez la transaction originale.

### Scénarios de récupération

**Mot de passe perdu (mais vous avez la phrase secrète) :**

1. Désinstallez MetaMask.
2. Réinstallez MetaMask.
3. Sélectionnez "Import using Secret Recovery Phrase" (Importer avec la phrase secrète de récupération).
4. Entrez vos 12 mots.
5. Créez un nouveau mot de passe.
6. Portefeuille restauré avec tous les fonds.

**Phrase secrète perdue (mais vous avez accès à MetaMask) :**

1. Ouvrez MetaMask tant que vous avez encore accès.
2. Paramètres → Sécurité et confidentialité.
3. Cliquez sur "Reveal Secret Recovery Phrase" (Révéler la phrase secrète de récupération).
4. Entrez le mot de passe.
5. Notez correctement la phrase secrète cette fois-ci.
6. Stockez-la en lieu sûr.

**Mot de passe et phrase secrète perdus :**

- Les fonds sont définitivement perdus.
- Aucune récupération possible.
- Aucune équipe de support ne peut aider.
- C'est pourquoi la sauvegarde de la phrase secrète est critique.

![Organigramme de décision pour le dépannage de MetaMask montrant les voies de ramification : échec de transaction mène à la vérification du gaz puis du solde, fonds manquants mènent à la vérification du réseau puis de la transaction, problèmes de connexion mènent à l'actualisation puis à la vérification de l'extension, avec des solutions à chaque point final](../_images/metamask-troubleshooting-decision-flowchart.png)

---

## Conclusion : Prêt à louer

Vous avez maintenant tout le nécessaire pour la location de GPU basée sur les cryptomonnaies :

- ✅ Portefeuille MetaMask installé et sécurisé
- ✅ Réseau Polygon configuré pour des frais réduits
- ✅ Financé en USDC pour des paiements de location de GPU stables
- ✅ MATIC disponible pour les frais de gaz des transactions
- ✅ Compréhension des connexions de portefeuille et des permissions

### Liste de contrôle rapide

Avant votre première location de GPU, confirmez :

**Configuration du portefeuille :**

- [ ] MetaMask installé depuis la source officielle (metamask.io)
- [ ] Phrase secrète écrite sur papier et stockée en lieu sûr
- [ ] Mot de passe créé pour l'accès local

**Configuration du réseau :**

- [ ] Polygon Mainnet ajouté à MetaMask
- [ ] Capacité de basculer entre les réseaux Ethereum et Polygon

**Financement :**

- [ ] Solde USDC sur Polygon (vérifier le bon réseau)
- [ ] Solde MATIC pour les frais de gaz (au moins 0,1 MATIC)

**Sécurité :**

- [ ] Phrase secrète stockée hors ligne, jamais numériquement
- [ ] Sites légitimes des plateformes mis en favoris
- [ ] Compréhension de la différence entre approbation et confirmation de transaction

### Et ensuite ?

Avec le portefeuille prêt, le processus de location de GPU lui-même est rapide :

1. **Connecter :** Visitez gpuflow.app, connectez MetaMask.
2. **Déposer :** Transférez l'USDC vers le dépôt fiduciaire de la plateforme.
3. **Sélectionner :** Choisissez le GPU correspondant à vos besoins.
4. **Louer :** Confirmez la location, recevez les identifiants d'accès.
5. **Travailler :** Accédez au GPU via SSH ou terminal web.
6. **Terminer :** Terminez la location, les fonds non utilisés reviennent automatiquement.

**Temps total de la préparation du portefeuille à l'accès au GPU : Moins de 2 minutes**

Pour le guide complet de la location de GPU, y compris la sélection de la plateforme, la mécanique de dépôt fiduciaire et l'optimisation des coûts, consultez notre [Guide complet de la location de GPU avec des cryptomonnaies](/fr/rent-gpu-with-crypto/).

### Erreurs courantes des débutants à éviter

**À ne pas faire :**

- Stocker la phrase secrète numériquement (captures d'écran, cloud, application de notes).
- Envoyer des fonds sans vérifier que le réseau correspond.
- Approuver des transactions sans lire les détails.
- Garder des soldes importants sur une seule plateforme.
- Ignorer les exigences de frais de gaz (vous avez besoin de MATIC, pas seulement d'USDC).

**À faire :**

- Commencer par de petites transactions de test.
- Vérifier les URL des sites web avant de se connecter.
- Garder un solde MATIC modeste pour le gaz.
- Mettre en favoris les sites légitimes des plateformes.
- Rejoindre le Discord de la plateforme pour le soutien communautaire.

### Estimation des coûts totaux d'installation

| Élément                         | Coût                                   |
| ------------------------------- | -------------------------------------- |
| Installation de MetaMask        | Gratuit                                |
| Configuration du réseau Polygon | Gratuit                                |
| USDC pour la location de GPU    | Votre choix (20-100 $ début typique)   |
| MATIC pour le gaz               | 0,50-2,00 $ (ou gratuit via faucet)    |
| Frais de retrait d'échange      | 0,10-0,50 $                            |
| **Total pour commencer**        | **~1-3 $ en frais + votre budget GPU** |

Comparez cela aux coûts d'installation des fournisseurs de cloud traditionnels de 0 $ en frais directs, mais des heures de temps de vérification et des frais de plateforme continuellement plus élevés.

### Ressources connexes

**Sur ce site :**

- [Guide complet de la location de GPU avec des cryptomonnaies](/fr/rent-gpu-with-crypto/) — Guide complet de la location, de la sélection de la plateforme à l'achèvement.
- [Comment louer des GPU sans KYC ou vérification d'identité](/fr/how-to-rent-gpu-without-kyc/) — Options de location de GPU axées sur la confidentialité.
- [Frais cachés dans la location de GPU : Comment la crypto économise de l'argent aux utilisateurs internationaux](/fr/hidden-fees-in-gpu-rental/) — Analyse des coûts pour les utilisateurs internationaux.

**Ressources externes :**

- [Support MetaMask](https://support.metamask.io) — Documentation officielle et dépannage.
- [Documentation Polygon](https://wiki.polygon.technology) — Détails techniques du réseau.
- [Polygonscan](https://polygonscan.com) — Explorateur de blocs pour la vérification des transactions.

![Liste de contrôle de fin de configuration montrant quatre étapes terminées avec des coches : MetaMask installé, Polygon configuré, portefeuille financé avec USDC, MATIC acquis pour le gaz, suivi d'une flèche pointant vers "Prêt pour la location de GPU" avec le logo GPUFlow](../_images/metamask-polygon-setup-complete-checklist.png)

---

## Foire aux questions

### Pourquoi ai-je besoin de MetaMask pour la location de GPU ?

MetaMask est un portefeuille de cryptomonnaies qui stocke vos fonds et vous permet d'interagir avec des plateformes basées sur la blockchain. Les plateformes de location de GPU utilisant des paiements en cryptomonnaies nécessitent un portefeuille pour détenir vos fonds et approuver les transactions. Lorsque vous louez un GPU sur des plateformes comme GPUFlow, votre paiement va dans un dépôt fiduciaire de contrat intelligent — MetaMask est le moyen par lequel vous autorisez ce dépôt et récupérez plus tard les fonds non utilisés. MetaMask est recommandé car c'est le portefeuille le plus compatible, fonctionnant avec presque toutes les plateformes acceptant les cryptos. Il s'installe comme une extension de navigateur, prend environ 5 minutes à configurer et est gratuit à utiliser.

### Pourquoi utiliser Polygon au lieu d'Ethereum pour la location de GPU ?

Polygon offre des frais de transaction considérablement inférieurs — 0,001 à 0,05 $ par transaction contre 1 à 10 $ ou plus pour Ethereum. Pour la location de GPU, où vous pourriez déposer des fonds, commencer une location, arrêter une location et retirer le solde restant (quatre transactions minimum), les frais de gaz Ethereum pourraient facilement dépasser le coût des locations de GPU courtes. Une location de 2 heures coûtant 1,20 $ sur une RTX 4090 nécessiterait 10 à 20 $ en frais de gaz Ethereum, ce qui la rend économiquement irrationnelle. Le même flux de travail sur Polygon coûte moins de 0,10 $ en frais totaux. Les plateformes GPU comme GPUFlow utilisent Polygon spécifiquement parce que les frais réduits rendent les petites et moyennes transactions pratiques.

### Qu'est-ce qu'une phrase secrète et pourquoi est-elle si importante ?

Une phrase secrète (aussi appelée phrase de récupération ou seed phrase) est une séquence de 12 ou 24 mots qui fournit un accès complet à votre portefeuille de cryptomonnaies. Ces mots, dans leur ordre exact, dérivent mathématiquement vos clés privées. Quiconque possède ces mots peut accéder à tous les fonds du portefeuille depuis n'importe quel appareil, n'importe où dans le monde. Il n'y a pas de réinitialisation de mot de passe, pas de vérification d'identité et aucune équipe de support qui peut aider si vous perdez votre phrase secrète — c'est le seul moyen de récupérer un portefeuille si votre appareil tombe en panne. Vous devez l'écrire sur papier, ne jamais la stocker numériquement et la conserver dans un endroit physique sûr. La perte de la phrase secrète combinée à une panne d'appareil signifie la perte permanente et irrécupérable de tous les fonds.

### De combien de MATIC ai-je besoin pour les frais de gaz ?

Très peu. Les frais de transaction Polygon sont d'environ 0,001 à 0,05 $ par transaction, donc 0,50 à 2,00 $ de MATIC (environ 0,5 à 2 MATIC aux prix actuels) fournit assez de gaz pour 50 à 200 transactions ou plus. Cela couvre des mois d'utilisation typique de location de GPU, y compris les dépôts, locations et retraits. Vous avez besoin de MATIC spécifiquement pour le gaz même lorsque vous payez la location du GPU en USDC, car les frais de transaction blockchain doivent être payés dans la devise native du réseau. Si vous débutez, obtenir 0,5 MATIC d'un faucet (gratuit) est suffisant pour les transactions initiales, et vous pouvez en acquérir plus tard si nécessaire.

### Puis-je utiliser un autre portefeuille que MetaMask ?

Oui. Les alternatives incluent Rainbow (excellente expérience mobile), Coinbase Wallet (pratique pour les utilisateurs de Coinbase), Rabby (fonctionnalités conviviales pour les développeurs), Trust Wallet (axé sur le mobile) et les portefeuilles matériels comme Ledger avec intégration d'extension de navigateur. Les plateformes de location de GPU prennent généralement en charge tout portefeuille compatible avec le protocole WalletConnect ou une connexion directe d'extension de navigateur compatible Ethereum. MetaMask est recommandé pour les débutants en raison de la documentation exhaustive, de la plus large compatibilité entre plateformes, de la plus grande communauté d'utilisateurs pour l'aide au dépannage et de la plus longue expérience. Une fois à l'aise avec la crypto, vous pouvez explorer des alternatives qui correspondent mieux à vos préférences.

### Que se passe-t-il si j'envoie des fonds sur le mauvais réseau ?

Les fonds envoyés sur le mauvais réseau ne sont pas perdus — ils sont simplement sur un réseau différent de celui prévu. Votre adresse de portefeuille est la même sur Ethereum et Polygon, donc les fonds envoyés à votre adresse sur l'un ou l'autre réseau vous appartiennent. Si vous avez envoyé de l'USDC sur Ethereum mais que vous l'attendiez sur Polygon : basculez MetaMask sur Ethereum Mainnet et vous verrez les fonds là-bas. Pour les déplacer vers Polygon, utilisez un pont (portal.polygon.technology), ce qui coûte des frais de gaz Ethereum (5-15 $). L'erreur coûte des frais supplémentaires et du temps mais n'entraîne pas de perte de fonds. Vérifiez toujours le réseau sélectionné avant de confirmer toute transaction d'envoi.

### Comment savoir si un site web est sûr pour y connecter mon portefeuille ?

Vérifiez la sécurité par plusieurs contrôles. Premièrement, confirmez que l'URL est correctement orthographiée — les sites de phishing utilisent des domaines d'apparence similaire (gpufl0w.app au lieu de gpuflow.app). Deuxièmement, vérifiez le HTTPS et un certificat de sécurité valide. Troisièmement, mettez les sites légitimes en favoris et utilisez-les plutôt que de chercher à chaque fois. Quatrièmement, faites des recherches sur la plateforme via les canaux communautaires (Discord, Reddit, Twitter) avant de vous connecter. Lorsque la fenêtre contextuelle de connexion apparaît, MetaMask affiche le site web demandeur — vérifiez que cela correspond à vos attentes. N'oubliez pas que la connexion du portefeuille ne révèle que votre adresse et vos soldes ; les transferts de fonds réels nécessitent une approbation séparée. Commencez par de petits montants sur les nouvelles plateformes jusqu'à ce que vous ayez vérifié la légitimité par des transactions réussies.

### Que signifie "approuver" (approving) un jeton ?

L'approbation d'un jeton accorde à un contrat intelligent spécifique la permission de transférer un jeton spécifique depuis votre portefeuille. C'est distinct du transfert de fonds réel. Lorsque vous déposez de l'USDC sur une plateforme de location de GPU, deux transactions se produisent : premièrement, vous approuvez le contrat de dépôt fiduciaire de la plateforme pour accéder à votre USDC ; deuxièmement, vous confirmez le dépôt réel. L'approbation est requise en raison du fonctionnement des jetons blockchain — les contrats ne peuvent pas retirer de jetons de votre portefeuille sans permission explicite. Vous pouvez approuver un montant limité (doit être réapprouvé une fois épuisé) ou un montant illimité (pratique mais nécessite de faire confiance au contrat). Les approbations peuvent être examinées et révoquées à tout moment sur des sites comme revoke.cash.

### Pourquoi ma transaction a-t-elle échoué ?

Les échecs de transaction ont plusieurs causes courantes. Un MATIC insuffisant pour le gaz est la plus courante — vous avez besoin de MATIC pour payer les frais même lorsque vous traitez en USDC. Un solde de jetons insuffisant (essayer d'envoyer plus que ce que vous avez) cause également des échecs. Interagir avec un contrat de manière incorrecte (mauvais réseau, paramètres incompatibles) déclenche des échecs. La congestion du réseau cause parfois des problèmes bien que ce soit rare sur Polygon. Le message d'erreur dans MetaMask donne généralement un indice sur la cause. Vérifiez d'abord le solde MATIC (problème le plus courant pour les nouveaux utilisateurs), puis vérifiez que vous êtes sur le bon réseau, puis essayez de réduire le montant de la transaction.

### Puis-je récupérer mon portefeuille si je perds mon mot de passe ?

Oui, si vous avez votre phrase secrète. Perdre votre mot de passe MetaMask signifie que vous ne pouvez pas accéder au portefeuille sur cet appareil spécifique, mais la phrase secrète permet une récupération complète. Désinstallez MetaMask, réinstallez-le, sélectionnez "Import using Secret Recovery Phrase", entrez vos 12 mots et créez un nouveau mot de passe. Votre portefeuille — y compris tous les soldes — est entièrement restauré. Cependant, si vous perdez à la fois votre mot de passe et votre phrase secrète, la récupération est impossible. Aucune entreprise, équipe d'assistance ou processus technique ne peut récupérer un portefeuille sans la phrase secrète. C'est pourquoi la sauvegarde sécurisée de la phrase secrète est absolument critique avant d'ajouter des fonds à votre portefeuille.

### Combien de temps prennent les transactions sur Polygon ?

Les transactions Polygon sont généralement confirmées en 2 à 5 secondes dans des conditions normales. Vous verrez la transaction apparaître brièvement comme "pending" dans MetaMask, puis passer à "confirmed". Occasionnellement, lors d'une forte utilisation du réseau, la confirmation peut prendre 15 à 30 secondes. Si une transaction reste en attente pendant plus de 5 minutes, quelque chose ne va probablement pas — prix du gaz insuffisant, problèmes de réseau ou problèmes de nonce. Vous pouvez "accélérer" les transactions bloquées dans MetaMask en cliquant sur la transaction en attente et en sélectionnant "Speed Up", ce qui la soumet à nouveau avec un gaz plus élevé. Comparé au réseau principal Ethereum (30 secondes à plusieurs minutes) et à Bitcoin (10 à 60 minutes), la vitesse de Polygon est essentiellement instantanée à des fins pratiques.

---

**Prêt à configurer votre portefeuille ?** Commencez par télécharger MetaMask depuis [metamask.io](https://metamask.io), puis suivez les étapes de ce guide. Dans quinze minutes, vous serez prêt à louer votre premier GPU avec des cryptomonnaies sur [GPUFlow](https://gpuflow.app/) sans vérification d'identité, sans configuration de compte fastidieuse et sans carte de crédit.
