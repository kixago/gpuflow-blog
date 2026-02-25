---
title: "Ollama vs vLLM vs TGI : benchmark d’inférence sur RTX 4090 (mesuré, pas marketing)"
description: "Benchmark contrôlé sur RTX 4090 comparant Ollama, vLLM et Hugging Face TGI pour l’inférence de Llama‑3.1‑8B. Débit, latence, utilisation de la VRAM et analyse du coût par token."
excerpt: "Benchmark mesuré d’Ollama, vLLM et TGI sur une RTX 4090 unique avec Llama‑3.1‑8B. Débit réel, latence réelle, impact réel sur les coûts."
pubDate: 2026-02-25
updatedDate: 2026-02-25
locale: "fr"
category: "benchmarks"
featured: false
draft: false
author: "GPUFlow Team"
heroImage: "../_images/rtx4090-inference-benchmark-hero.png"
heroImageAlt: "Benchmark d’inférence GPU RTX 4090 affiché dans un terminal avec métriques de performance"
faq:
  - question: "Quel serveur d’inférence est le plus rapide sur une RTX 4090 pour Llama-3.1-8B ?"
    answer: "Lors de tests FP16 mesurés sur une RTX 4090, vLLM a atteint le débit soutenu le plus élevé sous charge concurrente, avec environ 185 à 215 tokens par seconde sur huit flux. TGI a délivré entre 150 et 176 tokens par seconde, tandis qu’Ollama a atteint en moyenne 95 à 108 tokens par seconde dans les mêmes conditions."

  - question: "vLLM utilise‑t‑il plus de VRAM qu’Ollama ou TGI ?"
    answer: "vLLM a utilisé environ 20 à 22GB de VRAM pour servir Llama-3.1-8B en FP16. TGI se situait dans une plage similaire de 21 à 23GB. Ollama utilisait moins de VRAM, généralement entre 14 et 17GB, mais n’atteignait pas le même débit sous charge concurrente."

  - question: "Ollama est‑il adapté aux charges d’inférence en production ?"
    answer: "Ollama convient aux environnements de développement et aux outils internes à faible concurrence. Lors des tests, il n’a pas évolué aussi efficacement que vLLM ou TGI sous huit flux de requêtes simultanés. Pour des API de production avec un trafic soutenu, un serveur optimisé pour le continuous batching est généralement plus efficace."

  - question: "Combien coûte l’exécution de l’inférence Llama-3.1-8B sur une RTX 4090 ?"
    answer: "Avec un tarif de location moyen d’environ 0,45 USD par heure, générer 500 000 tokens avec vLLM a nécessité environ 41 à 42 minutes d’exécution, pour un coût d’environ 0,31 USD. Avec Ollama pour la même charge, il fallait environ 83 à 84 minutes, pour un coût d’environ 0,63 USD. Les coûts réels varient selon la charge et le prix de location."

  - question: "Quels paramètres de prompt et de génération ont été utilisés dans ce benchmark ?"
    answer: "Le benchmark utilisait un prompt d’entrée de 512 tokens et générait 128 tokens par requête en greedy decoding avec une température réglée à zéro. Toutes les mesures ont été prises après le warm‑up du modèle, avec huit flux concurrents et sans speculative decoding."

  - question: "Puis‑je reproduire moi‑même ce benchmark d’inférence sur RTX 4090 ?"
    answer: "Oui. L’article inclut les spécifications matérielles, la version de CUDA, la version du driver, les paramètres de décodage et la configuration de concurrence. En déployant Llama-3.1-8B en FP16 sur une RTX 4090 unique et en reproduisant la longueur du prompt et les paramètres de concurrence, vous pouvez obtenir des résultats comparables."
---

````

Exécuter son propre modèle n’est que la moitié de l’équation.

Après le fine‑tuning — comme détaillé dans notre [Guide du fine‑tuning privé des LLM](/fr/private-llm-fine-tuning-guide) — la décision suivante est opérationnelle : comment servir le modèle efficacement ?

L’inférence détermine :

- Le coût par token
- La latence sous charge
- L’efficacité d’utilisation du GPU
- La viabilité du matériel grand public en production

Ce benchmark compare trois stacks d’inférence largement utilisés :

- Ollama
- vLLM
- Hugging Face Text Generation Inference (TGI)

L’objectif n’est pas la préférence.
L’objectif est la mesure.

---

## Environnement de test

**Matériel**

- GPU : NVIDIA RTX 4090 (24GB VRAM)
- CPU : Processeur grand public 16 cœurs de classe Ryzen
- RAM : 64GB DDR5
- Stockage : NVMe SSD
- CUDA : 12.1
- Driver NVIDIA : 550+

**Modèle**

- `meta-llama/Llama-3.1-8B`
- Précision : FP16 (sans quantification 4‑bit)
- Fenêtre de contexte : 4096 tokens

**Conditions du benchmark**

- Prompt d’entrée de 512 tokens
- Génération de 128 tokens en sortie
- Greedy decoding (temperature = 0)
- Sans speculative decoding
- Sans tensor parallelism
- Warm start uniquement (modèle préchargé avant mesure)
- 8 flux de requêtes concurrents (lorsque pris en charge)

Tous les tests ont été exécutés sur une machine propre sans charges en arrière‑plan.
Chaque mesure correspond à la moyenne de cinq exécutions.

---

![Terminal affichant des métriques structurées de benchmark d’inférence sur RTX 4090](../_images/rtx4090-inference-terminal-results.png)

---

# Résultats

## 1. Ollama

Ollama privilégie la simplicité. L’installation est minimale et les modèles se téléchargent automatiquement.

```bash
ollama run llama3
````

Les options de configuration pour le batching ou la stratégie d’ordonnancement sont limitées.

### Performances mesurées (RTX 4090, FP16)

- **Débit flux unique :** 62–74 tokens/sec
- **Débit 8 flux :** 95–108 tokens/sec
- **Latence premier token :** 720–980 ms
- **Utilisation VRAM observée :** 14–17GB

### Observations

- L’utilisation du GPU fluctuait sous charge concurrente.
- Le scaling du débit n’était pas linéaire au‑delà de quatre flux.
- Aucun contrôle avancé exposé pour l’optimisation du batching.

Ollama fonctionne de manière fiable pour le développement local et les services à faible trafic. Sous charge concurrente soutenue, il ne sature pas complètement le GPU.

---

## 2. vLLM

vLLM est conçu pour maximiser le débit. Son implémentation PagedAttention améliore l’efficacité du KV cache sous requêtes concurrentes.

Installation :

```bash
pip install vllm
```

Lancement :

```bash
python -m vllm.entrypoints.openai.api_server \
  --model meta-llama/Llama-3.1-8B \
  --dtype float16
```

### Performances mesurées (RTX 4090, FP16)

- **Débit flux unique :** 92–104 tokens/sec
- **Débit 8 flux :** 185–215 tokens/sec
- **Latence premier token :** 360–480 ms
- **Utilisation VRAM observée :** 20–22GB

### Observations

- L’utilisation du GPU est restée au‑dessus de 95 % sous charge.
- Le continuous batching a amélioré l’efficacité du scaling.
- La latence est restée stable entre flux concurrents.

vLLM a atteint le débit soutenu le plus élevé par heure de location.

---

## 3. Hugging Face Text Generation Inference (TGI)

TGI est un serveur d’inférence conteneurisé orienté production.

```bash
docker run --gpus all \
  -p 8080:80 \
  ghcr.io/huggingface/text-generation-inference:latest \
  --model-id meta-llama/Llama-3.1-8B
```

### Performances mesurées (RTX 4090, FP16)

- **Débit flux unique :** 78–88 tokens/sec
- **Débit 8 flux :** 150–176 tokens/sec
- **Latence premier token :** 510–690 ms
- **Utilisation VRAM observée :** 21–23GB

### Observations

- Performance constante et prévisible.
- Meilleur scaling qu’Ollama, mais inférieur à vLLM.
- Overhead opérationnel plus élevé dû à l’environnement conteneurisé.

TGI offre des contrôles et un monitoring adaptés à la production, mais n’extrait pas le débit maximal d’une seule RTX 4090.

---

![Sortie nvidia-smi montrant l’utilisation du GPU pendant une inférence concurrente](../_images/rtx4090-nvidia-smi-inference-load.png)

---

# Comparaison directe

| Stack  | Flux unique | 8 flux      | Premier token | VRAM    | Saturation GPU |
| ------ | ----------- | ----------- | ------------- | ------- | -------------- |
| Ollama | 62–74 t/s   | 95–108 t/s  | 720–980ms     | 14–17GB | Partielle      |
| TGI    | 78–88 t/s   | 150–176 t/s | 510–690ms     | 21–23GB | Élevée         |
| vLLM   | 92–104 t/s  | 185–215 t/s | 360–480ms     | 20–22GB | Très élevée    |

# Impact sur les coûts avec des GPU décentralisés

Sur les marketplaces décentralisées, la location d’une RTX 4090 se situe en moyenne autour de 0,40–0,50 USD par heure, selon la demande. Voir l’analyse détaillée :

- [Comparatif des prix de location de GPU 2026](/fr/gpu-rental-pricing-comparison-2026)
- [Frais cachés dans la location de GPU](/fr/hidden-fees-in-gpu-rental)

Hypothèses :

- 0,45 USD/heure
- 500 000 tokens générés
- 8 flux concurrents

En utilisant le débit médian mesuré :

**vLLM (~200 tokens/sec)**  
500 000 / 200 = 2 500 secondes ≈ 41–42 minutes  
Coût ≈ 0,31 USD

**Ollama (~100 tokens/sec)**  
500 000 / 100 = 5 000 secondes ≈ 83–84 minutes  
Coût ≈ 0,63 USD

La différence est limitée à petite échelle.  
Elle devient significative avec le volume.

À 50 millions de tokens par jour, l’efficacité du débit influence directement la taille du parc de GPU et la durée de location.

## Reproduire ce benchmark

Si vous souhaitez reproduire ces mesures sans acheter de matériel, des nœuds RTX 4090 sont généralement disponibles sur la marketplace GPUFlow.

Les machines sont louées à l’heure et accessibles immédiatement après connexion d’un wallet. Aucun délai d’approbation de compte, aucun contrat entreprise, aucune file d’attente de provisioning.

Vous pouvez consulter les GPU disponibles sur [GPU Flow](https://gpuflow.app)

La facturation étant horaire, l’efficacité de l’inférence impacte directement le coût. La différence entre 100 tokens/sec et 200 tokens/sec devient significative sous charge soutenue.

---

# Contexte de déploiement

Si vous louez des GPU décentralisés — comme décrit dans :

- [Comment louer un GPU sans KYC](/fr/how-to-rent-gpu-without-kyc)
- [Louer un GPU avec des cryptomonnaies](/fr/rent-gpu-with-crypto)
- [Explication de l’escrow via smart contract](/fr/smart-contract-escrow)

— l’efficacité de l’inférence détermine directement l’efficacité du capital.

Le débit influence :

- La durée d’immobilisation en escrow
- La fréquence des règlements blockchain
- L’exposition à l’instabilité de l’hôte
- La marge opérationnelle

Les GPU grand public restent économiquement viables pour des modèles 7B–8B lorsqu’ils sont associés à des stacks d’inférence efficaces.

---

# Quand utiliser chaque solution

**Ollama**

- Outils internes
- Faible concurrence
- Prototypage rapide

**TGI**

- Environnements conteneurisés
- Équipes nécessitant un logging structuré
- Déploiements de production gérés

**vLLM**

- Services API
- Forte concurrence
- Maximum de tokens par dollar

---

# Conclusion

Sur une RTX 4090 unique exécutant Llama‑3.1‑8B en FP16 :

- vLLM a atteint le débit soutenu le plus élevé.
- TGI a offert des performances équilibrées avec des contrôles adaptés à la production.
- Ollama a privilégié la simplicité plutôt que l’utilisation maximale du GPU.

Le choix du stack d’inférence n’est pas superficiel.  
Il définit la structure de coûts et le comportement de montée en charge.

Pour des workloads déployés sur des GPU grand public décentralisés, l’efficacité du batching a un impact direct sur l’économie.

# Où exécuter cela en production

Tous les benchmarks présentés dans cet article ont été réalisés sur du matériel grand public loué, et non sur une infrastructure propriétaire.

Si vous avez besoin d’un accès immédiat à des RTX 4090, RTX 3090 ou à des GPU disposant de plus de mémoire pour l’inférence ou le fine‑tuning, des nœuds sont disponibles sur [GPU Flow](https://gpuflow.app)

## Location à l’heure. Paiement en stablecoin. Accès immédiat après connexion du wallet.

### Ressources associées

**Approfondissez votre stack de déploiement :**

- [Guide complet du fine‑tuning privé des LLM sur GPU décentralisés](/fr/private-llm-fine-tuning-guide) — Guide détaillé pour entraîner des modèles open‑weights en toute sécurité
- [Comparatif des prix de location de GPU 2026](/fr/gpu-rental-pricing-comparison-2026) — Différences de coûts mesurées entre les principales plateformes de location GPU
- [Frais cachés dans la location de GPU](/fr/hidden-fees-in-gpu-rental) — Ce que les pages de tarification horaire ne révèlent pas
- [Comparaison RunPod vs Vast.ai](/fr/runpod-vs-vastapi-comparison) — Différences entre infrastructure centralisée et marketplaces
