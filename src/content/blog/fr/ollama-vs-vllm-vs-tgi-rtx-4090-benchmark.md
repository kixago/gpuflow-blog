---
title: "Ollama, vLLM ou TGI sur une RTX 4090 : ce que montrent les benchmarks"
description: "Ollama, vLLM et Hugging Face TGI pour un modèle 8B sur une RTX 4090 : débits publiés sous charge, VRAM, quantification, API OpenAI et statut de maintenance de TGI."
excerpt: "Avec une requête à la fois, les moteurs vont à peu près aussi vite sur une RTX 4090. Avec beaucoup d'utilisateurs en même temps, vLLM prend une large avance. TGI est désormais en mode maintenance. Chiffres publiés, sources et quel moteur choisir."
pubDate: 2026-02-25
updatedDate: 2026-09-30
locale: "fr"
category: "benchmarks"
featured: false
draft: false
author: "GPUFlow Team"
heroImage: "../_images/rtx4090-inference-benchmark-hero.png"
heroImageAlt: "Benchmark d'inférence sur GPU RTX 4090 affiché dans un terminal avec des mesures de performance"
faq:
  - question: "vLLM est-il plus rapide qu'Ollama sur une RTX 4090 ?"
    answer: "Seulement quand beaucoup de requêtes tournent en même temps. Dans un test publié en septembre 2026 par ComputingForGeeks avec Qwen2.5-7B en 4 bits, les deux généraient environ 174 tokens par seconde pour une requête unique sur une RTX 4090. Avec 64 requêtes simultanées, vLLM atteignait 6 623 tokens par seconde au total, et Ollama 2 018."
  - question: "Hugging Face TGI est-il encore maintenu ?"
    answer: "À peine. La documentation de TGI indique qu'il est en mode maintenance et n'accepte plus que des corrections de bugs mineurs et des modifications de documentation, et le dépôt GitHub a été archivé en lecture seule le 21 mars 2026. Hugging Face recommande vLLM ou SGLang à la place, ou llama.cpp et MLX en local."
  - question: "Combien de VRAM vLLM utilise-t-il pour un modèle 8B ?"
    answer: "Par défaut, vLLM réserve 90 % de la mémoire du GPU (gpu-memory-utilization 0.9), soit environ 21,6 Go sur une RTX 4090 de 24 Go, quelle que soit la taille du modèle. Ce que les poids n'occupent pas devient du cache KV pour les requêtes simultanées."
  - question: "Ollama peut-il servir plusieurs utilisateurs à la fois ?"
    answer: "Oui, mais par défaut il traite une requête à la fois par modèle (OLLAMA_NUM_PARALLEL=1). Vous pouvez augmenter cette valeur, et chaque emplacement parallèle ajoute sa propre mémoire de contexte. Les benchmarks publiés montrent qu'Ollama monte moins bien en charge que vLLM sous forte concurrence."
  - question: "Ollama, vLLM et TGI ont-ils des API compatibles OpenAI ?"
    answer: "Oui. Les trois servent /v1/chat/completions. Ollama et vLLM servent aussi completions, embeddings et la Responses API ; la Messages API compatible OpenAI de TGI existe depuis la version 1.4.0."
  - question: "Peut-on faire tourner Llama 3.1 8B en FP16 sur un GPU de 24 Go ?"
    answer: "Oui. 8,03 milliards de paramètres à 2 octets chacun, cela fait environ 16,1 Go de poids, ce qui tient sur 24 Go avec la place pour un cache KV modeste. La plupart des gens qui servent un modèle sur une seule carte grand public utilisent des poids en 4 ou 8 bits pour laisser plus de place au contexte et aux utilisateurs simultanés."
---

Sur une seule RTX 4090 qui sert un modèle de 7 à 8 milliards de paramètres, Ollama et vLLM vont à peu près aussi vite avec une requête à la fois. L'écart se creuse quand beaucoup de requêtes arrivent ensemble : dans un test publié en septembre 2026 avec 64 requêtes simultanées, vLLM produisait environ trois fois le débit total d'Ollama. Hugging Face TGI fonctionne toujours, mais il est en mode maintenance depuis l'archivage de son dépôt en mars 2026, et Hugging Face oriente désormais lui-même vers vLLM et SGLang.

Le choix dépend donc du nombre de personnes qui sollicitent le modèle en même temps. Un utilisateur, un script ou un petit outil interne : Ollama, parce que c'est le moins de travail. Une API publique ou des traitements par lots avec beaucoup de requêtes en vol : vLLM. Un nouveau déploiement sur TGI : je ne m'y lancerais pas.

## D'où viennent les chiffres

Une version précédente de cette page affichait des chiffres de débit, de latence et de VRAM présentés comme nos propres mesures sur RTX 4090. Nous n'avons pas pu les rattacher à une exécution reproductible ni à une source publiée : nous les avons donc retirés. Une raison d'en douter : les anciens chiffres en FP16 pour un seul flux dépassaient ce que permet la bande passante mémoire d'une RTX 4090 (voir la section suivante).

Chaque chiffre ci-dessous est désormais attribué à celui qui l'a publié, avec le matériel et le modèle utilisés. Là où personne n'a publié de comparaison propre sur RTX 4090 (pour TGI, par exemple), je le dis plutôt que de combler le vide.

Les principales sources :

- **ComputingForGeeks, 18 septembre 2026.** Ollama, vLLM et llama.cpp sur RTX 4090, L40S et RTX 5090. Modèle : Qwen2.5-7B-Instruct, en AWQ 4 bits pour vLLM et en GGUF Q4_K_M pour Ollama et llama.cpp. Prompt fixe de 512 tokens, température 0, jusqu'à 256 tokens en sortie, contexte de 4 096 tokens par emplacement, 64 emplacements parallèles.
- **Red Hat Developer, 8 août 2025.** Ollama 0.9.2 contre vLLM 0.9.1 sur une A100 40 Go, Llama 3.1 8B Instruct en FP16, de 1 à 256 utilisateurs simultanés, mesuré avec GuideLLM.
- **BentoML, 5 juin 2024.** vLLM 0.4.2, TGI 2.0.4 et d'autres sur une A100 80 Go avec Llama 3 8B Instruct.
- **Tableau de scores CUDA de llama.cpp.** Vitesse sur un seul flux pour Llama 2 7B Q4_0 sur de nombreuses cartes, dont la RTX 4090.

Seule la première a été menée sur une RTX 4090 avec tous les moteurs dont parle cet article, sauf TGI. Les autres montrent la même tendance sur des cartes de datacenter.

## Une requête : c'est la carte qui fixe le plafond

Quand un GPU génère des tokens pour une seule requête, il doit relire en mémoire tous les poids du modèle à chaque token. C'est donc la bande passante mémoire, et non le moteur, qui fixe la limite haute.

La RTX 4090 a 24 Go de GDDR6X à 1 008 Go/s. Llama 3.1 8B compte 8,03 milliards de paramètres.

- En FP16, cela fait 8,03 × 2 octets ≈ 16,1 Go de poids. 1 008 ÷ 16,1 ≈ **63 tokens par seconde**, au maximum, pour une requête.
- Le tag par défaut `llama3.1:8b` d'Ollama est en Q4_K_M, un téléchargement de 4,9 Go. 1 008 ÷ 4,9 ≈ **205 tokens par seconde**, au maximum.

Les moteurs réels restent sous ces plafonds. Le tableau de scores de llama.cpp montre une RTX 4090 qui génère 186 tokens par seconde avec Llama 2 7B en Q4_0 (189 avec flash attention). ComputingForGeeks a mesuré environ 174 tokens par seconde pour une requête unique avec Qwen2.5-7B en 4 bits, et a trouvé vLLM, llama.cpp et Ollama « à peu près » identiques sur la 4090. (Sur la L40S et la RTX 5090, leur build d'Ollama décodait à environ la moitié de la vitesse de llama.cpp : vérifiez pour votre carte et votre version.)

Pour un utilisateur à la fois, choisissez le moteur pour le confort, et la quantification pour la vitesse. Passer du FP16 au 4 bits multiplie à peu près le plafond par trois. Changer de moteur le fait à peine bouger.

## Beaucoup de requêtes : le batching fait la différence

Avec beaucoup de requêtes en vol, le GPU peut lire les poids une seule fois et s'en servir pour tout un lot de requêtes. Ce qui compte alors, c'est la qualité du batching du moteur et sa gestion du cache KV (la mémoire propre à chaque requête, qui contient la conversation jusque-là).

<figure>
<svg viewBox="0 0 720 310" role="img" aria-labelledby="d1-title" xmlns="http://www.w3.org/2000/svg" font-family="system-ui, sans-serif" font-size="15">
<title id="d1-title">Diagramme en barres du débit total sur une RTX 4090 avec 64 requêtes simultanées : vLLM 6 623, llama.cpp 2 391, Ollama 2 018 tokens par seconde</title>
<text x="160" y="63" text-anchor="end" fill="#1e1b4b">vLLM (AWQ)</text>
<rect x="170" y="40" width="454" height="36" fill="#6366f1"/>
<text x="632" y="63" fill="#1e1b4b">6 623</text>
<text x="160" y="123" text-anchor="end" fill="#1e1b4b">llama.cpp</text>
<rect x="170" y="100" width="164" height="36" fill="#a5b4fc"/>
<text x="342" y="123" fill="#1e1b4b">2 391</text>
<text x="160" y="183" text-anchor="end" fill="#1e1b4b">Ollama</text>
<rect x="170" y="160" width="138" height="36" fill="#a5b4fc"/>
<text x="316" y="183" fill="#1e1b4b">2 018</text>
<line x1="170" y1="210" x2="650" y2="210" stroke="#64748b" stroke-width="1.5"/>
<line x1="170" y1="30" x2="170" y2="210" stroke="#64748b" stroke-width="1.5"/>
<line x1="307" y1="210" x2="307" y2="216" stroke="#64748b" stroke-width="1.5"/>
<line x1="444" y1="210" x2="444" y2="216" stroke="#64748b" stroke-width="1.5"/>
<line x1="581" y1="210" x2="581" y2="216" stroke="#64748b" stroke-width="1.5"/>
<text x="170" y="232" text-anchor="middle" fill="#64748b" font-size="13">0</text>
<text x="307" y="232" text-anchor="middle" fill="#64748b" font-size="13">2 000</text>
<text x="444" y="232" text-anchor="middle" fill="#64748b" font-size="13">4 000</text>
<text x="581" y="232" text-anchor="middle" fill="#64748b" font-size="13">6 000</text>
<text x="410" y="256" text-anchor="middle" fill="#64748b" font-size="13">Total des tokens générés par seconde, 64 requêtes simultanées</text>
<text x="360" y="290" text-anchor="middle" fill="#1e1b4b" font-size="14">Une requête à la fois : environ 174 tokens par seconde pour les trois</text>
</svg>
<figcaption>RTX 4090, Qwen2.5-7B-Instruct en 4 bits (AWQ pour vLLM, GGUF Q4_K_M pour les autres), 64 requêtes simultanées. Chiffres de ComputingForGeeks, septembre 2026 ; barres à l'échelle. TGI ne faisait pas partie de ce test.</figcaption>
</figure>

Sur la RTX 4090, vLLM a servi 6 623 tokens par seconde au total sur 64 requêtes, le serveur de llama.cpp 2 391 et Ollama 2 018. Ollama était configuré loyalement pour l'occasion : `OLLAMA_NUM_PARALLEL=64`, `num_ctx 4096` et flash attention activé. vLLM tournait avec `--quantization awq_marlin --max-model-len 4096 --gpu-memory-utilization 0.90`. Les auteurs donnent aussi un temps jusqu'au premier token d'environ 8 à 12 ms pour llama.cpp et 16 à 25 ms pour vLLM, Ollama étant le plus lent sur la L40S et la RTX 5090.

Le test de Red Hat sur A100 va dans le même sens avec des poids en FP16. vLLM culminait à 793 tokens par seconde ; Ollama avec ses réglages par défaut en obtenait 41. Après avoir porté la limite de parallélisme d'Ollama à 32, « la valeur stable la plus élevée », il n'égalait toujours vLLM à aucun niveau de concurrence. Son temps jusqu'au premier token « augmentait fortement avec le nombre d'utilisateurs », et la latence entre tokens montrait des « pics massifs » en charge maximale.

Deux mises en garde avant de citer ces chiffres à qui que ce soit. D'abord, la comparaison de ComputingForGeeks n'est pas parfaitement à armes égales : vLLM tournait avec des poids AWQ, les autres en GGUF, et les builds diffèrent. Ensuite, ce sont des totaux sur l'ensemble des requêtes. Chacun des 64 utilisateurs voit environ 6 623 ÷ 64 ≈ 103 tokens par seconde sur vLLM, ce qui reste très confortable, et environ 2 018 ÷ 64 ≈ 32 sur Ollama.

## Où en est TGI

Text Generation Inference était le serveur de production de Hugging Face, avec batching continu, Flash Attention et Paged Attention, parallélisme de tenseurs, métriques Prometheus et traçage OpenTelemetry. Techniquement, il jouait dans la même catégorie que vLLM.

Son statut a changé. La documentation de TGI s'ouvre désormais sur : « text-generation-inference est désormais en mode maintenance. À l'avenir, nous accepterons les pull requests pour des corrections de bugs mineurs, des améliorations de la documentation et des tâches de maintenance légères. » Elle recommande « vllm, SGLang, ainsi que des moteurs locaux interopérables comme llama.cpp ou MLX ». Le dépôt GitHub a été archivé et passé en lecture seule le 21 mars 2026.

Je n'ai trouvé aucun benchmark récent publié de TGI sur une RTX 4090. La comparaison sérieuse la plus proche est celle de BentoML sur une A100 80 Go, en juin 2024 : avec Llama 3 8B, vLLM atteignait « 2300 à 2500 tokens par seconde, comme TGI », et vLLM avait le meilleur temps jusqu'au premier token à tous les niveaux de concurrence testés. Cela remonte à deux ans et à de nombreuses versions pour les deux moteurs : considérez-le comme de l'histoire.

Si TGI sert déjà votre trafic de production, il continuera de fonctionner. Pour un nouveau déploiement, vous choisiriez un serveur qui ne recevra ni nouvelles architectures de modèles ni travail sur les performances. Sur une RTX 4090, vLLM couvre tout ce que faisait TGI.

## La VRAM sur une carte de 24 Go

Les moteurs gèrent la mémoire de façons très différentes, et cela détermine ce qui peut partager la carte avec eux.

**vLLM prend l'essentiel de la carte dès le départ.** Son `--gpu-memory-utilization` vaut 0.9 par défaut : sur une RTX 4090 de 24 Go, il réserve environ 21,6 Go au démarrage, quelle que soit la taille du modèle. Tout ce que les poids n'occupent pas devient du cache KV. Avec Llama 3.1 8B en FP16 (environ 16,1 Go), il reste à peu près 5,5 Go pour le cache KV, les activations et les graphes CUDA, ce qui limite la longueur de contexte et le nombre de requêtes simultanées. Avec des poids AWQ en 4 bits (le build de ComputingForGeeks faisait environ 5,6 Go), l'essentiel des 21,6 Go va au cache KV, et c'est ainsi qu'il tient 64 requêtes. Ne comptez pas faire tourner un second programme GPU à côté, sauf à baisser cette fraction.

**Ollama alloue par modèle et par contexte.** Un modèle `llama3.1:8b` en Q4_K_M pèse 4,9 Go, plus le cache KV de sa fenêtre de contexte. Ollama choisit le contexte par défaut selon votre VRAM : 4k sous 24 Gio, 32k de 24 à 48 Gio, 256k à partir de 48 Gio. Une RTX 4090 se trouve pile sur la limite des 24 Gio (nvidia-smi indique un peu moins de 24 Gio) : vérifiez avec `ollama ps` quel contexte vous avez réellement obtenu, ou fixez-le vous-même. Les emplacements parallèles multiplient ce contexte : l'exemple de la documentation est qu'« un contexte de 2K avec 4 requêtes parallèles donnera un contexte de 8K et une allocation mémoire supplémentaire ». Si la mémoire est juste, la quantification du cache KV aide : `q8_0` utilise environ la moitié de la mémoire du `f16` par défaut, et `q4_0` environ un quart. Ollama peut aussi garder par défaut jusqu'à trois modèles chargés par GPU, s'ils tiennent, ce qui convient à une carte qui passe d'un modèle à l'autre. Pour savoir quels modèles tiennent sur des cartes de 8, 12, 16 et 24 Go, voir [quels modèles d'IA tiennent dans la VRAM de votre GPU](/fr/which-ai-models-fit-your-gpu-vram/).

**TGI** préalloue aussi pour le batching continu, comme vLLM. Je n'ai pas trouvé de chiffre de VRAM actuel et citable pour un modèle 8B sur une 4090 : je n'en donnerai donc pas.

## Quantification et formats de modèle

| | Ollama | vLLM | TGI |
| --- | --- | --- | --- |
| **Format principal** | GGUF (par ex. Q4_K_M) | safetensors Hugging Face | safetensors Hugging Face |
| **Options 4 bits** | Variantes GGUF Q4 | AWQ, GPTQ, bitsandbytes, INT4 W4A16 | AWQ, GPTQ, Marlin, EXL2, bitsandbytes NF4/FP4 |
| **8 bits / FP8** | GGUF Q8_0 | FP8 W8A8 sur Ada (RTX 4090) et Hopper ; INT8 | bitsandbytes 8 bits, EETQ, fp8 |
| **GGUF** | Natif | Pris en charge | Non mentionné |
| **Quantification du cache KV** | q8_0, q4_0 | Oui | Non traité ici |

La RTX 4090 est une carte Ada (SM 8.9) : le chemin FP8 de vLLM y fonctionne. Les poids FP8 prennent deux fois moins de mémoire que le FP16 : environ 8 Go pour un modèle 8B, un compromis entre FP16 et 4 bits sur une seule 4090.

La bibliothèque de modèles d'Ollama fournit des tags GGUF déjà quantifiés, si bien qu'on y pense rarement : `ollama pull llama3.1:8b` vous donne du Q4_K_M. Avec vLLM, vous choisissez un checkpoint déjà quantifié sur Hugging Face ou vous passez vous-même une option de quantification.

## Serveurs compatibles OpenAI et installation

Les trois vous donnent une API HTTP de type OpenAI : les SDK OpenAI et la plupart des outils de chat fonctionnent en changeant simplement l'URL de base.

| | Ollama | vLLM | TGI |
| --- | --- | --- | --- |
| **Adresse par défaut** | `localhost:11434/v1` | `localhost:8000/v1` | Port 80 du conteneur (souvent redirigé vers 8080) |
| **Chat completions** | Oui | Oui | Oui (Messages API, depuis la 1.4.0) |
| **Autres endpoints OpenAI** | completions, models, embeddings, responses | completions, embeddings, responses, audio | Non traité ici |
| **Installation** | Un script | Paquet pip | Image Docker |

Pour faire tourner un modèle 8B, d'après la documentation de chaque projet :

```bash
# Ollama
curl -fsSL https://ollama.com/install.sh | sh
ollama pull llama3.1:8b

# vLLM (Llama 3.1 is gated: accept the license on Hugging Face and set HF_TOKEN)
pip install vllm
vllm serve meta-llama/Llama-3.1-8B-Instruct

# TGI
docker run --gpus all --shm-size 1g -p 8080:80 -v $PWD/data:/data \
  ghcr.io/huggingface/text-generation-inference:3.3.5 \
  --model-id meta-llama/Llama-3.1-8B-Instruct
```

Ollama est de loin le moins de travail. Il gère les téléchargements, les fichiers quantifiés, le chargement et le déchargement, et fonctionne de la même façon sur un portable et sur un serveur loué. Sa couche OpenAI a des lacunes : pas de `logprobs` ni de `tool_choice` sur les chat completions, et les images doivent être en base64, pas en URL. vLLM demande un environnement CUDA et Python fonctionnel et plus d'options à régler, mais c'est le moteur que Hugging Face recommande désormais à la place de TGI. TGI est simple si vous utilisez déjà Docker, avec la réserve sur la maintenance évoquée plus haut.

## Quel moteur pour quelle tâche

**Ollama** pour une personne seule, un script, un assistant de code, un outil interne avec une poignée d'utilisateurs, ou une machine qui alterne entre plusieurs modèles. L'installation prend quelques minutes, et la vitesse sur une requête unique sur une 4090 vaut celle de n'importe quel autre moteur.

**vLLM** quand beaucoup de requêtes arrivent en même temps : une API publique, un produit de chat multi-utilisateurs, ou des traitements par lots que vous pouvez lancer 32 ou 64 à la fois. Les chiffres publiés montrent environ trois fois le débit total d'Ollama sur une RTX 4090 avec 64 requêtes simultanées, et bien plus sur une A100. C'est aussi lui qui a la prise en charge la plus large en quantification et en API.

**TGI** seulement si vous l'utilisez déjà. Pour un nouveau projet, Hugging Face conseille lui-même vLLM ou SGLang.

Quand on loue à l'heure, le coût découle du débit. Prenons un million de tokens générés sur une RTX 4090 à 0,31 $ de l'heure, le prix à la demande Vast.ai le plus bas relevé par getdeploying.com en septembre 2026, avec les chiffres de ComputingForGeeks :

- Une requête à la fois, 174 tokens/s : 1 000 000 ÷ 174 ≈ 5 750 s ≈ 1,6 heure ≈ **0,50 $**.
- 64 à la fois sur Ollama, 2 018 tokens/s : ≈ 496 s ≈ **0,04 $**.
- 64 à la fois sur vLLM, 6 623 tokens/s : ≈ 151 s ≈ **0,01 $**.

Ces calculs supposent que le GPU est occupé en permanence. Si vous n'avez jamais qu'une requête en vol, le batching ne vous apporte rien et le choix du moteur ne change pas votre facture. Si vous avez une file de travail, il la change d'un ordre de grandeur. Le même raisonnement, comparé aux API facturées au token, se trouve dans [GPU à l'heure ou API au token ?](/fr/hourly-gpu-vs-per-token-api/).

## La place de GPUFlow

L'installateur fournisseur de GPUFlow installe Ollama par défaut et l'agent GPUFlow lui transmet les requêtes : c'est donc en général la colonne Ollama ci-dessus qui s'applique. Vous louez une clé API compatible OpenAI (`https://gpuflow.app/v1`, avec `/v1/chat/completions` et `/v1/models`, streaming pris en charge) pour un modèle qui tourne sur le GPU du fournisseur. Vous payez du temps, à la seconde avec un minimum d'une minute, pas des tokens.

Ce que vous ne pouvez pas faire sur GPUFlow : choisir le moteur, modifier ses réglages ou exécuter votre propre code. Il n'y a ni SSH ni shell. Pour reproduire les benchmarks ci-dessus ou faire tourner vLLM vous-même, louez sur Vast.ai ou RunPod une machine sur laquelle vous pouvez vous connecter ([leur comparaison](/fr/runpod-vs-vastapi-comparison/)). Pour utiliser un modèle servi par Ollama depuis une application sans rien installer, voir la [place de marché GPUFlow](https://gpuflow.app/fr/marketplace) et [comment utiliser la clé dans les outils courants](/fr/use-openai-compatible-api-key-in-apps/).

Si vous avez fine-tuné votre propre modèle et cherchez comment le servir, le [guide du fine-tuning privé de LLM](/fr/private-llm-fine-tuning-guide/) couvre l'étape qui précède celle-ci.

## Sources

Toutes vérifiées en septembre 2026.

- Ollama, vLLM et llama.cpp sur RTX 4090, L40S et RTX 5090 : [ComputingForGeeks](https://computingforgeeks.com/ollama-vs-vllm-vs-llama-cpp/) (18 septembre 2026)
- Ollama et vLLM sur A100 40 Go : [Red Hat Developer](https://developers.redhat.com/articles/2025/08/08/ollama-vs-vllm-deep-dive-performance-benchmarking) (8 août 2025)
- vLLM, TGI et d'autres sur A100 80 Go : [BentoML, Benchmarking LLM Inference Backends](https://www.bentoml.com/blog/benchmarking-llm-inference-backends) (5 juin 2024)
- Tableau de scores CUDA de llama.cpp : [github.com/ggml-org/llama.cpp/discussions/15013](https://github.com/ggml-org/llama.cpp/discussions/15013)
- Mémoire et bande passante de la RTX 4090 : [test de TechPowerUp](https://www.techpowerup.com/review/nvidia-geforce-rtx-4090-founders-edition/)
- Paramètres et licence de Llama 3.1 8B : [fiche du modèle sur Hugging Face](https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct)
- Ollama : [FAQ (requêtes parallèles, cache KV)](https://docs.ollama.com/faq), [longueur de contexte](https://docs.ollama.com/context-length), [compatibilité OpenAI](https://docs.ollama.com/api/openai-compatibility), [tag llama3.1:8b](https://ollama.com/library/llama3.1:8b)
- vLLM : [serveur compatible OpenAI](https://docs.vllm.ai/en/latest/serving/online_serving/openai_compatible_server/), [quantification](https://docs.vllm.ai/en/latest/features/quantization/index.html), [arguments du moteur (gpu-memory-utilization)](https://docs.vllm.ai/en/v0.6.4/models/engine_args.html)
- TGI : [documentation et avis de maintenance](https://huggingface.co/docs/text-generation-inference/en/index), [dépôt GitHub (archivé)](https://github.com/huggingface/text-generation-inference), [Messages API](https://huggingface.co/docs/text-generation-inference/en/messages_api), [quantification](https://huggingface.co/docs/text-generation-inference/en/conceptual/quantization)
- Prix de location de la RTX 4090 : [getdeploying.com](https://getdeploying.com/reference/cloud-gpu/nvidia-rtx-4090)
- GPUFlow : [démarrage rapide de l'API](https://docs.gpuflow.app/fr/renters/api-quickstart/), [premiers pas pour les fournisseurs](https://docs.gpuflow.app/fr/providers/getting-started/)
