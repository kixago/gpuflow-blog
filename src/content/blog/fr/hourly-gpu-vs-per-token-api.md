---
title: "GPU à l'heure ou API au token ? Le vrai coût d'un modèle 7B–8B"
description: "Une comparaison de coûts sans détour entre la location d'un GPU grand public à l'heure et une API d'IA facturée au token, avec les prix actuels, des vitesses mesurées et un exemple chiffré sur 1 000 requêtes."
excerpt: "Les API au token et les GPU à l'heure ne se facturent pas dans la même unité. Nous ramenons les deux au même travail et montrons quand chacun revient moins cher."
pubDate: 2026-09-29
locale: "fr"
category: "comparisons"
featured: false
draft: false
author: "GPUFlow Team"
heroImage: "../_images/hourly-gpu-vs-per-token-api-hero.png"
heroImageAlt: "Graphique avec une ligne plate pour la tarification à l'heure et une ligne montante pour la tarification au token"
faq:
  - question: "Louer un GPU à l'heure revient-il moins cher qu'une API facturée au token ?"
    answer: "Tout dépend de la comparaison. Pour les modèles ouverts populaires comme Llama 3.1 8B, les API hébergées au token sont moins chères : DeepInfra facture 0,02 $ par million de tokens en entrée et 0,04 $ par million de tokens en sortie. Face à gpt-5-mini (2,00 $ par million de tokens en sortie) ou Claude Haiku 4.5 (5,00 $), n'importe quelle carte louée, de la RTX 3060 à la RTX 5090, qui fait tourner un modèle ouvert 7B–8B coûte moins cher au token, à condition d'être occupée en permanence. Face à gpt-4o-mini (0,60 $), seules les cartes les moins chères, comme la RTX 3060, l'emportent nettement."
  - question: "Combien de tokens par seconde une RTX 4090 génère-t-elle avec un modèle 8B ?"
    answer: "Hardware Corner a mesuré 104 tokens par seconde sur une RTX 4090 avec Qwen3 8B quantifié en 4 bits et un contexte de 16K, une requête à la fois. Le tableau de résultats de llama.cpp indique 186 tokens par seconde pour le plus petit Llama 2 7B en Q4_0 avec un contexte court."
  - question: "Combien coûte un million de tokens en sortie sur une RTX 4090 louée ?"
    answer: "À 0,35 $ de l'heure et environ 104 tokens par seconde, une heure produit environ 376 000 tokens : un million de tokens en sortie coûte donc environ 0,93 $ de temps GPU. Lire le prompt est bien plus rapide qu'écrire la réponse, si bien que les tokens en entrée ajoutent peu."
  - question: "Quand un GPU à l'heure est-il plus intéressant qu'une API ?"
    answer: "Quand le modèle dont vous avez besoin n'est pas proposé au token (votre propre fine-tune, un modèle de la communauté, une quantification particulière), quand vous voulez un coût horaire fixe plutôt qu'un compteur de tokens, ou quand l'alternative est un modèle fermé qui facture 2 $ ou plus par million de tokens en sortie."
---

Il y a deux façons courantes de payer un petit modèle d'IA ouvert comme Llama 3.1 8B ou Qwen 2.5 7B :

- **Au token :** une entreprise héberge le modèle et facture chaque token que vous envoyez et recevez.
- **À l'heure :** vous louez un GPU qui fait tourner le modèle et vous payez le temps, quel que soit le nombre de tokens consommés.

Les prix semblent impossibles à comparer : « 0,04 $ par million de tokens » d'un côté, « 0,35 $ de l'heure » de l'autre. Cet article ramène les deux à la même unité et déroule un cas concret. Tous les prix ont été vérifiés en septembre 2026 ; les sources sont en fin d'article.

## Étape 1 : à quelle vitesse écrit un GPU grand public ?

La vitesse qui compte, c'est le nombre de tokens par seconde que le GPU génère pour une requête. Nous reprenons les mesures de Hardware Corner, qui a testé Qwen3 8B quantifié en 4 bits (Q4_K_XL) avec un contexte de 16K dans llama.cpp, le moteur sur lequel repose Ollama.

| GPU | Tokens par seconde (une requête) | Tokens par heure |
| --- | --- | --- |
| RTX 3060 12 Go | 42 | environ 151 000 |
| RTX 3090 | 87 | environ 315 000 |
| RTX 4090 | 104 | environ 376 000 |
| RTX 5090 | 145 | environ 523 000 |

Avec des prompts courts, c'est plus rapide. Le tableau de résultats du projet llama.cpp, avec le plus petit Llama 2 7B en Q4_0 et un contexte court, affiche 76, 158, 186 et 290 tokens par seconde pour les quatre mêmes cartes. Nous retenons les chiffres les plus bas, plus réalistes.

Lire votre prompt est bien plus rapide qu'écrire la réponse. Le même tableau indique un traitement du prompt d'environ 2 100 tokens par seconde sur une RTX 3060 et d'environ 12 000 sur une RTX 4090. Sur un GPU à l'heure, les prompts longs ne coûtent donc que peu de temps en plus.

## Étape 2 : convertir le prix horaire en prix par million de tokens

On divise le prix horaire par le nombre de tokens produits en une heure. Nous prenons les prix à la demande courants des sites de location de GPU en septembre 2026 :

| GPU | Prix à l'heure | Coût pour 1 million de tokens en sortie, GPU occupé en permanence |
| --- | --- | --- |
| RTX 3060 12 Go | 0,06 $ | environ 0,40 $ |
| RTX 3090 | 0,20 $ | environ 0,64 $ |
| RTX 4090 | 0,35 $ | environ 0,93 $ |
| RTX 5090 | 0,55 $ | environ 1,05 $ |

« Occupé en permanence » est le point clé. Ces chiffres supposent que le GPU écrit pendant toute l'heure. S'il reste inactif la moitié du temps, le coût par token double.

## Étape 3 : ce que facturent les API au token

Prix par million de tokens, entrée / sortie :

| Modèle | Fournisseur | Entrée | Sortie |
| --- | --- | --- | --- |
| Llama 3.1 8B Instruct Turbo | DeepInfra | 0,02 $ | 0,04 $ |
| Gemma 3 12B | DeepInfra | 0,05 $ | 0,15 $ |
| Qwen3.5 9B | DeepInfra | 0,10 $ | 0,15 $ |
| gpt-4o-mini | OpenAI | 0,15 $ | 0,60 $ |
| gpt-5-mini | OpenAI | 0,25 $ | 2,00 $ |
| Claude Haiku 4.5 | Anthropic | 1,00 $ | 5,00 $ |

Deux choses sautent aux yeux. Les modèles ouverts hébergés sont très bon marché. Et les petits modèles fermés coûtent 15 à 125 fois plus cher par token en sortie que le modèle ouvert 8B le moins cher.

## Étape 4 : un cas concret, chiffré option par option

Prenons 1 000 requêtes. Chacune envoie 1 500 tokens (instructions plus un document) et en reçoit 500. Cela fait 1,5 million de tokens en entrée et 0,5 million en sortie.

| Option | Coût total | Remarques |
| --- | --- | --- |
| Llama 3.1 8B sur DeepInfra | environ 0,05 $ | De loin le moins cher |
| gpt-4o-mini | environ 0,53 $ | |
| gpt-5-mini | environ 1,38 $ | |
| Claude Haiku 4.5 | environ 4,00 $ | |
| RTX 3060 louée, une requête à la fois | environ 0,21 $ | Environ 3,5 heures |
| RTX 3090 louée | environ 0,33 $ | Environ 1,7 heure |
| RTX 4090 louée | environ 0,48 $ | Environ 1,4 heure |
| RTX 5090 louée | environ 0,54 $ | Environ 1 heure |

Comment nous avons calculé les chiffres des GPU : 500 000 tokens en sortie divisés par la vitesse de l'étape 1, plus 1,5 million de tokens de prompt divisés par la vitesse de traitement du prompt du tableau llama.cpp, le tout multiplié par le prix horaire.

## Ce qu'il faut en retenir

**Si une API hébergée propose le modèle ouvert que vous voulez, c'est la façon la moins chère de l'utiliser.** Pour Llama 3.1 8B, rien de ce qui se loue à l'heure n'approche 0,04 $ par million de tokens en sortie.

**Face à la plupart des petits modèles fermés, un GPU à l'heure revient moins cher, si le modèle ouvert suffit pour votre tâche.** Une RTX 3060 bien occupée coûte moins cher par token en sortie que gpt-4o-mini, et une RTX 3090 coûte à peu près autant ; si l'on compte aussi les tokens en entrée, comme dans le traitement ci-dessus, les deux reviennent moins cher. Toutes les cartes du tableau reviennent moins cher que gpt-5-mini ou Claude Haiku. Un modèle ouvert 7B–8B donne-t-il des réponses assez bonnes ? Cela dépend de la tâche : il s'en sort généralement bien pour classer, extraire des champs, résumer et reformuler des textes courts, moins bien pour les raisonnements longs.

**Un GPU à l'heure est pertinent quand :**

- Le modèle dont vous avez besoin n'est proposé par aucune API au token : votre propre fine-tune, un modèle de la communauté ou une quantification particulière.
- Vous voulez un coût horaire fixe plutôt qu'une facture au compteur, par exemple pendant des tests ou pour un traitement par lots la nuit.
- Vos prompts sont longs. Sur un GPU loué à l'heure, les tokens en entrée ne coûtent que les quelques secondes nécessaires pour les lire.
- Vous voulez essayer un modèle sur du vrai matériel avant d'acheter une carte.

**Le paiement au token est pertinent quand :**

- Votre trafic arrive par pics, avec de longues pauses. Vous ne payez rien pendant l'attente.
- Vous avez besoin de nombreuses requêtes simultanées. Un seul GPU grand public traite une requête à la fois par défaut : `OLLAMA_NUM_PARALLEL` vaut 1 par défaut dans Ollama.
- Le modèle que vous voulez est hébergé et son prix vous convient.

## La confidentialité compte des deux côtés

Avec une API au token, vos prompts vont chez l'entreprise qui fournit l'API. Avec un GPU loué, ils vont sur la machine que vous louez. Sur GPUFlow, par exemple, le modèle tourne sur l'ordinateur du fournisseur : les prompts et les réponses passent donc par lui. Notre documentation le dit clairement : n'envoyez ni mots de passe, ni numéros de carte, ni rien que vous ne confieriez pas à un inconnu. Aucune des deux options ne remplace l'exécution du modèle sur votre propre matériel quand les données sont vraiment sensibles.

## Comment tester sur GPUFlow

Sur GPUFlow, vous louez un GPU pour un nombre d'heures et vous obtenez une clé API qui fonctionne comme une clé OpenAI. La facturation se fait à la seconde, et si vous terminez plus tôt, le temps non utilisé revient sur vos crédits. Pour mesurer votre propre coût par token :

1. Louez pendant une heure un GPU qui fait tourner le modèle voulu.
2. Faites pointer votre script vers `https://gpuflow.app/v1` avec votre clé ([comment faire](https://docs.gpuflow.app/fr/renters/api-quickstart/)).
3. Comptez les tokens reçus et divisez ce que vous avez payé par ce nombre.

Dix minutes de trafic réel vous en apprendront plus que n'importe quel tableau.

## Articles liés

- [Louer un GPU : ce que le prix à l'heure ne dit pas](/fr/hidden-fees-in-gpu-rental/)
- [Utiliser une clé API compatible OpenAI dans Open WebUI, Continue, LangChain et d'autres outils](/fr/use-openai-compatible-api-key-in-apps/)
- [Ollama vs vLLM vs TGI : benchmark d'inférence sur RTX 4090](/fr/ollama-vs-vllm-vs-tgi-rtx-4090-benchmark/)

## Sources

Toutes vérifiées en septembre 2026.

- Vitesses des GPU, Qwen3 8B Q4_K_XL avec un contexte de 16K : [classement des GPU de Hardware Corner](https://www.hardware-corner.net/gpu-ranking-local-llm/) (mis à jour le 9 décembre 2025)
- Tableau de résultats CUDA de llama.cpp, Llama 2 7B Q4_0 : [github.com/ggml-org/llama.cpp/discussions/15013](https://github.com/ggml-org/llama.cpp/discussions/15013)
- Requêtes parallèles dans Ollama : [docs.ollama.com/faq](https://docs.ollama.com/faq)
- Prix DeepInfra : [deepinfra.com/pricing](https://deepinfra.com/pricing)
- Prix OpenAI : [gpt-4o-mini](https://developers.openai.com/api/docs/models/gpt-4o-mini), [gpt-5-mini](https://developers.openai.com/api/docs/models/gpt-5-mini)
- Prix Anthropic : [tarifs sur platform.claude.com](https://platform.claude.com/docs/en/about-claude/pricing)
- Fourchettes de prix de location des GPU : [documentation GPUFlow, Fixer le prix de votre GPU](https://docs.gpuflow.app/fr/providers/pricing/)
