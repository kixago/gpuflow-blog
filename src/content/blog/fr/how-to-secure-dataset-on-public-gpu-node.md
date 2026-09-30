---
title: "Comment sécuriser votre jeu de données sur un nœud GPU loué ou public"
description: "L'hôte d'un GPU loué peut lire tout ce que votre tâche déchiffre. Ce que corrigent le chiffrement, le secure cloud et le confidential computing sur H100, et comment faire le ménage ensuite."
excerpt: "Louer un GPU, c'est laisser quelqu'un d'autre avoir les droits root sur la machine qui contient vos données. Voici le modèle de menace, ce que couvre réellement chaque protection, et une routine de nettoyage qui tient sur les disques modernes."
pubDate: 2026-02-26
updatedDate: 2026-09-30
locale: "fr"
category: "guides"
featured: false
draft: false
author: "GPUFlow Team"
authorUrl: "https://gpuflow.app"
heroImage: "../_images/secure-server-room-abstract.png"
heroImageAlt: "Environnement de serveurs sécurisé et abstrait, symbolisant le traitement protégé des données d'IA"
faq:
  - question: "L'hôte d'un GPU loué peut-il voir mes données ?"
    answer: "Techniquement, oui. L'hôte a les droits root sur la machine physique, et vos données doivent être déchiffrées en mémoire pour entraîner ou faire tourner un modèle. Seul le confidential computing, comme les VM confidentielles H100 sur Azure ou Google Cloud, sort l'hôte de l'équation."
  - question: "shred supprime-t-il vraiment les fichiers sur une instance GPU cloud ?"
    answer: "Pas de façon fiable. Le manuel de GNU shred indique qu'il ne fonctionne que si le système de fichiers et le matériel écrasent les données sur place, ce que ni les systèmes de fichiers journalisés ou en copie sur écriture, ni les snapshots, ni les SSD ne garantissent. Chiffrez les données avant qu'elles n'arrivent sur le disque, puis détruisez l'instance."
  - question: "Quelle est la différence entre RunPod Secure Cloud et Community Cloud ?"
    answer: "Selon la documentation de RunPod, Secure Cloud tourne dans des data centers T3/T4 et convient à la production et aux données sensibles, tandis que Community Cloud repose sur des fournisseurs de pair à pair à la fiabilité variable. RunPod n'accepte plus de nouveaux hôtes Community Cloud."
  - question: "Quels GPU cloud prennent en charge le confidential computing ?"
    answer: "En septembre 2026, Azure propose des VM confidentielles NCCads H100 v5 avec un GPU H100 NVL sur AMD SEV-SNP, et Google Cloud propose des a3-highgpu-1g confidentielles (un H100, Intel TDX) et des G4 (RTX PRO 6000, AMD SEV). Les cartes GeForce grand public ne figurent pas dans ces listes."
  - question: "Peut-on mettre des données personnelles sur un GPU loué au regard du RGPD ?"
    answer: "Seulement si le fournisseur est un sous-traitant lié par un contrat conforme à l'article 28 du RGPD, avec une base juridique de transfert si la machine est hors de l'UE. La plupart des hôtes de pair à pair n'ont aucun contrat de ce type avec vous : désidentifiez d'abord les données, ou passez par un fournisseur en data center qui signe un DPA."
  - question: "Peut-on entraîner ou fine-tuner un modèle sur GPUFlow ?"
    answer: "Non. GPUFlow fait uniquement de l'inférence : vous obtenez une clé API compatible OpenAI pour un modèle qui tourne sur l'ordinateur d'un fournisseur, sans SSH, sans shell et sans accès aux fichiers. Les prompts arrivent en clair sur cet ordinateur : n'y faites pas passer de fichiers confidentiels."
---

Quand vous louez un GPU, quelqu'un d'autre a les droits root sur la machine qui contient vos données. Le chiffrement protège le jeu de données pendant le transfert et sur le disque, mais votre tâche d'entraînement doit le déchiffrer en mémoire pour s'en servir, et à ce moment-là un hôte déterminé peut le lire. Les vraies décisions sont donc : à qui vous faites confiance (un data center contrôlé ou un serveur anonyme chez un particulier), combien de données vous envoyez, et si vous avez besoin du confidential computing, seule option qui sort l'exploitant de l'hôte de la chaîne de confiance.

Ce guide concerne les machines sur lesquelles vous vous connectez, comme les instances Vast.ai ou RunPod. Il passe en revue le modèle de menace, ce que couvre chaque protection, et une routine de nettoyage qui tient sur le stockage moderne. Les sources sont en fin d'article ; tout a été vérifié en septembre 2026.

## Le modèle de menace

Commencez par nommer qui pourrait accéder aux données, et comment. Sur une instance GPU louée, il y a sept voies réalistes.

<figure>
<svg viewBox="0 0 720 430" role="img" aria-labelledby="d1-title" xmlns="http://www.w3.org/2000/svg" font-family="system-ui, sans-serif" font-size="15">
<title id="d1-title">Modèle de menace pour un jeu de données sur une instance GPU louée : sept voies d'accès aux données et la principale parade pour chacune</title>
<rect x="0" y="0" width="720" height="430" fill="#ffffff"/>
<line x1="220" y1="75" x2="240" y2="170" stroke="#e2e8f0" stroke-width="2"/>
<line x1="220" y1="220" x2="240" y2="215" stroke="#e2e8f0" stroke-width="2"/>
<line x1="220" y1="365" x2="240" y2="270" stroke="#e2e8f0" stroke-width="2"/>
<line x1="500" y1="75" x2="480" y2="170" stroke="#e2e8f0" stroke-width="2"/>
<line x1="500" y1="220" x2="480" y2="215" stroke="#e2e8f0" stroke-width="2"/>
<line x1="500" y1="365" x2="480" y2="270" stroke="#e2e8f0" stroke-width="2"/>
<line x1="360" y1="330" x2="360" y2="290" stroke="#e2e8f0" stroke-width="2"/>
<rect x="240" y="140" width="240" height="150" rx="12" fill="#eef2ff" stroke="#6366f1" stroke-width="2"/>
<text x="360" y="170" text-anchor="middle" fill="#1e1b4b" font-weight="bold">Votre instance louée</text>
<text x="360" y="205" text-anchor="middle" fill="#1e1b4b">Jeu de données</text>
<text x="360" y="235" text-anchor="middle" fill="#1e1b4b">Poids et checkpoints</text>
<text x="360" y="265" text-anchor="middle" fill="#1e1b4b">Tokens et clés</text>
<rect x="20" y="40" width="200" height="70" rx="10" fill="#ffffff" stroke="#f97316" stroke-width="2"/>
<text x="120" y="68" text-anchor="middle" fill="#1e1b4b">Exploitant de l'hôte</text>
<text x="120" y="92" text-anchor="middle" fill="#64748b" font-size="13">Parade : hôte fiable, ou CC</text>
<rect x="20" y="185" width="200" height="70" rx="10" fill="#ffffff" stroke="#f97316" stroke-width="2"/>
<text x="120" y="213" text-anchor="middle" fill="#1e1b4b">Trajet réseau</text>
<text x="120" y="237" text-anchor="middle" fill="#64748b" font-size="13">Parade : SSH, ports fermés</text>
<rect x="20" y="330" width="200" height="70" rx="10" fill="#ffffff" stroke="#f97316" stroke-width="2"/>
<text x="120" y="358" text-anchor="middle" fill="#1e1b4b">Restes sur le disque</text>
<text x="120" y="382" text-anchor="middle" fill="#64748b" font-size="13">Parade : chiffrer, détruire</text>
<rect x="500" y="40" width="200" height="70" rx="10" fill="#ffffff" stroke="#f97316" stroke-width="2"/>
<text x="600" y="68" text-anchor="middle" fill="#1e1b4b">Place de marché</text>
<text x="600" y="92" text-anchor="middle" fill="#64748b" font-size="13">Parade : contrat et DPA</text>
<rect x="500" y="185" width="200" height="70" rx="10" fill="#ffffff" stroke="#f97316" stroke-width="2"/>
<text x="600" y="213" text-anchor="middle" fill="#1e1b4b">Autres locataires</text>
<text x="600" y="237" text-anchor="middle" fill="#64748b" font-size="13">Parade : VM ou machine dédiée</text>
<rect x="500" y="330" width="200" height="70" rx="10" fill="#ffffff" stroke="#f97316" stroke-width="2"/>
<text x="600" y="358" text-anchor="middle" fill="#1e1b4b">Snapshots, volumes</text>
<text x="600" y="382" text-anchor="middle" fill="#64748b" font-size="13">Parade : aucune copie durable</text>
<rect x="260" y="330" width="200" height="70" rx="10" fill="#ffffff" stroke="#f97316" stroke-width="2"/>
<text x="360" y="358" text-anchor="middle" fill="#1e1b4b">Vos propres oublis</text>
<text x="360" y="382" text-anchor="middle" fill="#64748b" font-size="13">Parade : tokens éphémères</text>
</svg>
<figcaption>Tout ce qui se trouve sur l'instance est exposé à l'exploitant de l'hôte pendant que la tâche tourne. Les autres voies se ferment avec une hygiène ordinaire ; celle-là exige soit un hôte de confiance, soit le confidential computing.</figcaption>
</figure>

**L'exploitant de l'hôte.** Celui qui possède la machine physique en a les droits root. Sur une place de marché à conteneurs comme Vast.ai, les clients tournent dans des conteneurs Docker non privilégiés, ce qui vous isole des autres locataires, mais pas de l'hôte : root sur l'hôte peut lire les fichiers et la mémoire d'un conteneur. C'est ainsi que fonctionnent les conteneurs sur toutes les plateformes.

**Le trajet réseau.** Les données qui voyagent de votre portable ou de votre bucket jusqu'au nœud. C'est la voie la plus facile à fermer.

**La place de marché.** L'entreprise qui se trouve entre vous et l'hôte détient votre compte, vos clés SSH et ce que conservent ses propres logs. Ce qu'elle a le droit d'en faire est fixé par ses conditions, d'où l'importance de la section sur les contrats plus bas.

**Les restes sur le disque.** Les fichiers que vous supprimez peuvent survivre sur le disque après votre location, où le locataire suivant ou l'hôte pourrait les retrouver.

**Les snapshots et volumes persistants.** Les copies que vous avez demandées (un volume réseau, une instance arrêtée) ou que l'hôte a faites (sauvegardes) survivent à la tâche.

**Les autres locataires.** Les autres clients sur la même machine. Avec une isolation par VM ou une machine entière pour vous, le risque est faible, mais les GPU ont connu de vrais bugs à ce niveau. LeftoverLocals (CVE-2023-4969) permettait à un processus de lire la mémoire locale GPU d'un autre sur certains GPU Apple, AMD et Qualcomm ; Trail of Bits a récupéré environ 181 Mo par requête LLM sur une AMD Radeon RX 7900 XT, de quoi reconstruire la réponse du modèle. Trail of Bits n'en a trouvé aucune trace sur les GPU NVIDIA, ARM ou Intel.

**Vos propres oublis.** Un token Hugging Face, des clés cloud ou une clé privée SSH laissés sur le nœud. En pratique, c'est ainsi que commencent la plupart des fuites.

## Ce que couvre le chiffrement, et ce qu'il ne peut pas couvrir

Le chiffrement a trois rôles, et un GPU loué vous permet d'en assurer deux vous-même.

**En transit :** facile. Utilisez SSH (`scp`, `sftp`, `rsync -e ssh`) ou HTTPS depuis un bucket. Vast.ai indique que les connexions SSH et son API sont chiffrées. N'utilisez jamais de liens HTTP simples ni de services de partage de fichiers sans authentification.

**Au repos :** chiffrez avant l'envoi, pour que le fichier sur le disque de l'hôte soit inutilisable sans la clé. [age](https://github.com/FiloSottile/age) est l'outil le plus simple pour cela :

```bash
# on your own machine
tar -cf - train/ | age -p > train.tar.age
scp -P 22345 train.tar.age user@203.0.113.42:/workspace/
```

Sur le nœud, déchiffrez directement en mémoire pour que le texte en clair ne touche jamais le disque :

```bash
mkdir -p /dev/shm/train
age -d /workspace/train.tar.age | tar -xf - -C /dev/shm/train
```

`age -d` demande la phrase de passe dans le terminal : la clé n'est jamais écrite sur le nœud. `/dev/shm` est un système de fichiers en RAM ; vérifiez d'abord sa taille avec `df -h /dev/shm`, car les configurations de conteneur le rendent souvent petit. Si les données ne tiennent pas en RAM, il vous faudra une copie déchiffrée sur disque, et la section sur le nettoyage prend alors plus d'importance.

Le chiffrement complet du disque avec LUKS est la réponse habituelle sur vos propres serveurs, mais vous ne pouvez généralement pas configurer dm-crypt dans un conteneur non privilégié, et l'hôte détiendrait de toute façon la clé en cours d'utilisation.

**En cours d'utilisation :** c'est là que se trouve le trou. Pour entraîner, le GPU a besoin de tenseurs en clair, et la mémoire CPU qui l'alimente contient elle aussi du clair. Quiconque a les droits root sur l'hôte peut en principe vider cette mémoire. Le chiffrement au repos ne sert à rien face à un hôte hostile et actif. Seul le confidential computing matériel répond à ce problème.

## Secure cloud ou community cloud

Comme l'hôte est le seul risque que l'hygiène ne peut pas supprimer, le choix de l'hôte est la décision la plus importante. Les deux grandes places de marché séparent leur offre pour cette raison.

| Option | Qui exploite le matériel | Ce que dit la plateforme |
| --- | --- | --- |
| RunPod Secure Cloud | Data centers T3/T4 | Pour « la production, les données sensibles » |
| RunPod Community Cloud | Fournisseurs de pair à pair | Pour « les charges de travail sensibles au coût » ; plus de nouveaux hôtes acceptés |
| Vast.ai Secure Cloud | Data centers contrôlés | ISO 27001, normes Tier 3/4, sécurité physique vérifiée |
| Autres hôtes Vast.ai | Du data center au particulier | Les hôtes individuels « peuvent avoir des mesures de sécurité moins formalisées » |

Pour les données sensibles, Vast.ai conseille lui-même de n'utiliser que des fournisseurs Secure Cloud, de chiffrer les données au repos, de ne pas laisser d'identifiants sur les instances et d'utiliser une gestion de clés externe. C'est ce que je dirais à n'importe qui.

Deux limites s'appliquent même dans un data center certifié. D'abord, ISO 27001 certifie les processus de l'exploitant ; elle ne peut pas exclure un employé malhonnête. Ensuite, un hôte qui traite des données personnelles pour vous est un sous-traitant au sens du RGPD, et l'article 28 exige un contrat qui encadre ce traitement, alors que la place de marché se trouve entre vous et l'hôte. Vérifiez avec quelle société vous contractez réellement et ce qu'elle garantit sur ses hôtes.

Pour un travail vraiment sensible, l'étape suivante est une instance GPU dans un compte hyperscaler avec lequel vous avez déjà un DPA, voire un BAA : vous sortez alors du monde des places de marché, et l'heure coûte plus cher. Notre [comparatif des prix de location de GPU](/fr/gpu-rental-pricing-comparison-2026/) donne les fourchettes de prix.

## Le confidential computing sur GPU H100

Le confidential computing (CC) est la seule technologie présentée ici conçue pour protéger les données de l'exploitant de l'hôte pendant que la tâche tourne. Sur les GPU de data center NVIDIA Hopper et Blackwell, cela fonctionne ainsi :

- La charge de travail tourne dans une VM confidentielle (CVM) reposant sur AMD SEV-SNP ou Intel TDX côté CPU. La conception de NVIDIA part du principe que l'hyperviseur et l'OS de l'hôte peuvent être compromis ; un exploitant ayant accès à l'hyperviseur « voire au système lui-même » ne doit pas pouvoir lire la mémoire de la CVM.
- Avant utilisation, la VM vérifie que le GPU est authentique et en mode CC grâce à un certificat d'appareil signé, vérifiable auprès du service d'attestation à distance de NVIDIA (NRAS).
- Les données, les tampons de commandes et les noyaux CUDA qui traversent le PCIe sont chiffrés et signés, et passent par un tampon intermédiaire chiffré en mémoire partagée.

NVIDIA a rendu le CC mono-GPU sur H100 généralement disponible avec CUDA 12.4 en avril 2024. Où le louer concrètement en septembre 2026 :

| Cloud | Instance | GPU | TEE côté CPU |
| --- | --- | --- | --- |
| Azure | NCCads H100 v5 | 1 × H100 NVL, 94 Go | AMD SEV-SNP (EPYC Genoa) |
| Google Cloud | a3-highgpu-1g, Confidential VM | 1 × H100 | Intel TDX |
| Google Cloud | g4-standard-48, Confidential VM | RTX PRO 6000 | AMD SEV |

Connaissez les limites avant de bâtir dessus :

- **Un GPU par VM.** La série Azure a un seul GPU, et les VM GPU confidentielles de Google ne prennent pas en charge les clusters multi-nœuds. Les gros entraînements multi-GPU sont exclus.
- **Le provisionnement.** Sur Google Cloud, l'A3 High confidentielle ne tourne qu'en Spot ou en flex-start et ne prend pas en charge les réservations.
- **La vitesse de transfert.** L'article technique de NVIDIA de 2023 situait la bande passante CPU vers GPU en mode CC autour de 4 Go/s, limitée par le chiffrement côté CPU. Charger un checkpoint de 16 Go prend donc environ 16 ÷ 4 = 4 secondes de transfert pur, ce qui convient à l'inférence, mais un pipeline de données qui fait transiter de nombreux gigaoctets à chaque pas le sentira. Les versions ultérieures du pilote mentionnent des améliorations de performances : mesurez votre propre tâche.
- **La mémoire GPU n'est pas chiffrée.** NVIDIA laisse la HBM intégrée au boîtier en clair, en considérant que les outils d'attaque physique courants ne peuvent pas l'atteindre.
- **Pas sur les places de marché.** Les cartes GeForce grand public, courantes chez les hôtes communautaires de Vast.ai et RunPod, ne figurent dans aucune de ces listes.

Le CC change la personne à qui vous devez faire confiance : le matériel et l'attestation de NVIDIA, le fabricant du CPU et votre propre image de VM, au lieu du personnel de l'hôte. Pour des données réglementées où la réponse « les administrateurs du fournisseur cloud ne peuvent pas les lire » compte, c'est la seule option sur du matériel loué qui y parvient.

## Avant et pendant la tâche

### Réduire avant d'envoyer

La protection la moins chère, ce sont les données qui ne quittent jamais votre machine. Avant le transfert :

- Supprimez les colonnes dont le modèle n'a pas besoin, en particulier les noms, e-mails, numéros de compte et notes en texte libre.
- Remplacez les identifiants directs par des jetons aléatoires et gardez la table de correspondance chez vous.
- Réduisez le corpus à ce dont la méthode a besoin. Un fine-tuning LoRA ou QLoRA ajuste un petit ensemble de poids supplémentaires et a rarement besoin d'une base de production entière ; notre [guide du fine-tuning](/fr/private-llm-fine-tuning-guide/) décrit une configuration réaliste.
- N'oubliez pas que les poids d'un modèle portent de l'information. Un modèle fine-tuné sur des textes sensibles peut en répéter des morceaux : traitez aussi l'adaptateur comme sensible.

Des données désidentifiées, c'est aussi ce qui fait disparaître la plupart des questions juridiques abordées plus bas.

### Identifiants et réseau sur le nœud

Partez du principe que tout ce que vous mettez sur le nœud peut être copié.

- Utilisez un token Hugging Face à permissions fines, en lecture seule sur le seul dépôt dont vous avez besoin, et révoquez-le à la fin de la tâche.
- Ne copiez jamais votre clé privée SSH principale, vos identifiants root cloud ou les mots de passe de vos bases de production sur une machine louée. Si la tâche doit écrire ses résultats dans un bucket, créez une clé qui ne peut écrire que sous un seul préfixe et qui expire dans la journée.
- Rapatriez les résultats par SSH au lieu de les pousser depuis le nœud avec des clés à longue durée de vie.
- Vérifiez ce qui écoute avec `ss -tulnp`. Liez Jupyter, TensorBoard et les serveurs d'inférence à `127.0.0.1` et accédez-y par un tunnel SSH (`ssh -L 8888:127.0.0.1:8888 ...`) plutôt que d'exposer un port public.

## Un nettoyage qui tient sur les disques modernes

Le conseil habituel est de passer le jeu de données à `shred` une fois fini. Il ne fait pas ce que l'on croit. Le manuel de GNU coreutils indique que `shred` compte sur le système de fichiers et le matériel pour écraser les données sur place, et liste les cas où cela échoue : les systèmes de fichiers journalisés ou structurés en log comme ext4 en mode `data=journal`, Btrfs, XFS et ZFS, le RAID, les systèmes de fichiers avec snapshots, les systèmes de fichiers compressés, et les SSD, dont la répartition de l'usure écrit les nouvelles données ailleurs. Un nœud GPU loué cumule très probablement plusieurs de ces cas.

Ce qui fonctionne à la place :

1. **Rendre la copie sur disque sans valeur.** Si seule l'archive chiffrée avec age a touché le disque, la supprimer suffit ; sans la phrase de passe, ce n'est que du bruit. Le guide du NIST sur l'assainissement des supports (SP 800-88 Rev. 2, septembre 2025) traite cette idée, l'effacement cryptographique, comme une technique standard.
2. **Détruire, pas arrêter.** Sur Vast.ai, arrêter une instance conserve ses données (et continue de facturer le stockage) ; la détruire « supprime définitivement l'instance et toutes ses données ». Sur RunPod, le disque de conteneur est effacé à l'arrêt du pod, le volume `/workspace` survit aux arrêts et est supprimé à la résiliation (terminate), et un volume réseau survit à tout jusqu'à ce que vous le supprimiez.
3. **Supprimer les volumes réseau que vous avez créés.** Par conception, ils survivent aux pods.
4. **Révoquer ce que vous avez utilisé.** Token Hugging Face, clés de bucket, et retirez de la place de marché toute clé SSH publique ajoutée pour cette seule tâche.

La façon dont l'hôte efface les disques entre deux locataires n'est décrite dans aucune des documentations de places de marché que j'ai lues. Partez du principe que cela n'a pas lieu : l'étape 1 vous couvre dans tous les cas.

## Contrats et réglementation

Les contrôles techniques comptent moins qu'un fait juridique : mettre des données sur la machine de quelqu'un en fait une partie prenante.

- **RGPD.** Un hôte GPU qui traite des données personnelles pour vous est un sous-traitant. L'article 28 exige un sous-traitant qui présente des « garanties suffisantes » et un contrat qui vous lie. Un hôte de pair à pair avec qui vous n'avez rien signé ne remplit pas ces conditions, et la machine peut se trouver hors de l'UE. Désidentifiez, ou passez par un fournisseur qui signe un DPA.
- **HIPAA.** Le HHS indique qu'un fournisseur cloud qui stocke des données de santé électroniques est un business associate, même si les données sont chiffrées et qu'il n'a pas la clé. Chiffrer des dossiers médicaux avant de les envoyer à un hôte non contrôlé ne dispense pas d'un BAA.
- **Les contrats de vos clients.** Beaucoup de contrats d'entreprise encadrent les sous-traitants et la localisation des données. Vérifiez-les avant le premier envoi. Le risque juridique dépasse souvent le risque technique.

L'article compagnon sur [pourquoi les entreprises restreignent les outils d'IA publics](/fr/why-corporate-policies-banning-chatgpt/) aborde les mêmes règles du côté des chats.

## L'inférence sur GPUFlow : un autre compromis

GPUFlow n'est pas un endroit où déposer un jeu de données. C'est une place de marché d'inférence : vous louez un GPU à l'heure et obtenez une clé API compatible OpenAI (URL de base `https://gpuflow.app/v1`) pour le modèle ouvert qu'un fournisseur fait tourner (généralement avec Ollama) sur son propre ordinateur. Il n'y a ni SSH, ni shell, ni accès aux fichiers, et vous ne pouvez ni entraîner ni fine-tuner. Rien de ce que vous envoyez ne reste sur le disque du fournisseur, puisque vous ne pouvez rien y déposer.

Cela supprime les problèmes de disque et d'identifiants décrits dans ce guide. Pas le problème de l'hôte. Chaque prompt et chaque réponse passent en clair par la machine du fournisseur pendant la location. Les conditions de GPUFlow interdisent aux fournisseurs de les enregistrer, de les lire, de les conserver ou de les partager, et GPUFlow ne stocke pas le texte lui-même, mais le fournisseur a les droits root sur la machine : la règle ne repose que sur le contrat. Si vous faites passer un jeu de données à raison d'un enregistrement par prompt, chaque enregistrement arrive sur cet ordinateur.

Utilisez-le donc pour des données publiques, synthétiques ou correctement désidentifiées, et pour tester un modèle ouvert ou une application contre une API de type OpenAI. Gardez les données réglementées et confidentielles sur votre propre matériel, chez un fournisseur avec qui vous avez un contrat, ou dans une VM confidentielle. Le [démarrage rapide de l'API](https://docs.gpuflow.app/fr/renters/api-quickstart/) le résume en une ligne : n'envoyez pas de mots de passe, de numéros de carte ni d'autres secrets que vous ne confieriez pas à un inconnu. Le même dispositif, vu du côté du fournisseur, est décrit dans [louer son GPU, est-ce sans risque ?](/fr/is-it-safe-to-rent-out-your-gpu/).

## Liste de vérification

Avant :

- Déterminez la catégorie des données. Les données réglementées ou confidentielles d'un client vont chez un fournisseur sous contrat ou dans une VM confidentielle, pas chez un hôte communautaire.
- Réduisez et désidentifiez.
- Chiffrez avec age ; gardez la phrase de passe hors du nœud.

Pendant :

- Déchiffrez dans `/dev/shm` quand ça tient.
- Uniquement des tokens à portée limitée et de courte durée.
- Services liés à localhost, accessibles par tunnel SSH.

Après :

- Rapatriez les résultats par SSH ; traitez les poids fine-tunés comme sensibles.
- Détruisez l'instance et tous les volumes réseau.
- Révoquez les tokens et les clés à usage unique.

## Sources

- Isolation des conteneurs et Secure Cloud sur Vast.ai : [FAQ sécurité de Vast.ai](https://docs.vast.ai/guides/reference/faq/security) ; arrêt ou destruction : [gérer les instances](https://docs.vast.ai/guides/instances/manage-instances)
- RunPod Secure Cloud et Community Cloud : [choisir un pod](https://docs.runpod.io/pods/choose-a-pod) ; persistance du stockage : [types de stockage](https://docs.runpod.io/pods/storage/types)
- LeftoverLocals : [Trail of Bits, janvier 2024](https://blog.trailofbits.com/2024/01/16/leftoverlocals-listening-to-llm-responses-through-leaked-gpu-local-memory/)
- age : [github.com/FiloSottile/age](https://github.com/FiloSottile/age)
- Limites de shred : [manuel de GNU coreutils, invocation de shred](https://www.gnu.org/software/coreutils/manual/html_node/shred-invocation.html)
- NIST SP 800-88 Rev. 2 : [annonce du NIST, septembre 2025](https://www.nist.gov/news-events/news/2025/09/guidelines-media-sanitization-nist-publishes-sp-800-88r2)
- Conception du confidential computing sur H100 : [NVIDIA, Confidential Computing on H100 GPUs for Secure and Trustworthy AI](https://developer.nvidia.com/blog/confidential-computing-on-h100-gpus-for-secure-and-trustworthy-ai/) ; disponibilité générale : [NVIDIA, avril 2024](https://developer.nvidia.com/blog/announcing-confidential-computing-general-access-on-nvidia-h100-tensor-core-gpus/)
- Azure : [série NCCads H100 v5](https://learn.microsoft.com/en-us/azure/virtual-machines/sizes/gpu-accelerated/nccadsh100v5-series)
- Google Cloud : [configurations prises en charge pour Confidential VM](https://docs.cloud.google.com/confidential-computing/confidential-vm/docs/supported-configurations), [créer une instance Confidential VM avec GPU](https://docs.cloud.google.com/confidential-computing/confidential-vm/docs/create-a-confidential-vm-instance-with-gpu)
- Article 28 du RGPD : [gdpr-info.eu](https://gdpr-info.eu/art-28-gdpr/)
- HIPAA et fournisseurs cloud : [HHS, recommandations sur HIPAA et le cloud computing](https://www.hhs.gov/hipaa/for-professionals/special-topics/health-information-technology/cloud-computing/index.html)
- GPUFlow : [démarrage rapide de l'API](https://docs.gpuflow.app/fr/renters/api-quickstart/), [ce à quoi les locataires ont accès ou non](https://docs.gpuflow.app/fr/providers/security/), [conditions d'utilisation](https://gpuflow.app/fr/terms), [politique de confidentialité](https://gpuflow.app/fr/privacy)

Toutes vérifiées en septembre 2026.
