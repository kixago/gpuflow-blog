---
title: "Ollama vs vLLM vs TGI : benchmark d'inférence sur RTX 4090 (mesuré, pas marketing)"
description: "Un benchmark contrôlé sur RTX 4090 qui compare Ollama, vLLM et Hugging Face TGI pour l'inférence de Llama‑3.1‑8B : débit, latence, consommation de VRAM et coût par token."
excerpt: "Benchmark mesuré d'Ollama, vLLM et TGI sur une seule RTX 4090 avec Llama‑3.1‑8B. Débit réel, latence réelle, conséquences réelles sur les coûts."
pubDate: 2026-02-25
updatedDate: 2026-09-29
locale: "fr"
category: "benchmarks"
featured: false
draft: false
author: "GPUFlow Team"
heroImage: "../_images/rtx4090-inference-benchmark-hero.png"
heroImageAlt: "Benchmark d'inférence sur GPU RTX 4090 affiché dans un terminal avec des indicateurs de performances"
faq:
  - question: "Quel serveur d'inférence est le plus rapide sur une RTX 4090 pour Llama-3.1-8B ?"
    answer: "Lors de nos mesures en FP16 sur une RTX 4090, vLLM a obtenu le meilleur débit soutenu sous charge concurrente, avec environ 185 à 215 tokens par seconde sur huit flux. TGI a atteint 150 à 176 tokens par seconde, et Ollama 95 à 108 tokens par seconde en moyenne dans les mêmes conditions."

  - question: "vLLM consomme-t-il plus de VRAM qu'Ollama ou TGI ?"
    answer: "vLLM a utilisé environ 20 à 22 Go de VRAM pour servir Llama-3.1-8B en FP16. TGI se situait dans une fourchette proche, de 21 à 23 Go. Ollama a consommé moins de VRAM au total, généralement entre 14 et 17 Go, mais n'a pas atteint le même débit sous charge concurrente."

  - question: "Ollama convient-il à l'inférence en production ?"
    answer: "Ollama convient aux environnements de développement et aux outils internes avec peu de requêtes simultanées. Lors de nos tests, il a moins bien tenu la montée en charge que vLLM ou TGI avec huit flux de requêtes simultanés. Pour une API en production avec un trafic soutenu, un serveur optimisé pour le batching continu est généralement plus efficace."

  - question: "Combien coûte l'inférence de Llama-3.1-8B sur une RTX 4090 ?"
    answer: "À un tarif de location moyen d'environ 0,45 USD de l'heure, générer 500 000 tokens avec vLLM a demandé environ 41 à 42 minutes, soit un coût d'environ 0,31 USD. Avec Ollama, la même charge de travail a demandé environ 83 à 84 minutes, soit environ 0,63 USD. Les coûts réels varient selon la charge de travail et le prix de location."

  - question: "Quels réglages de prompt et de génération ont été utilisés pour ce benchmark ?"
    answer: "Le benchmark a utilisé un prompt d'entrée de 512 tokens et généré 128 tokens par requête, en décodage glouton avec une température à zéro. Toutes les mesures ont été prises après la mise en chauffe du modèle, avec huit flux de requêtes simultanés et sans décodage spéculatif."

  - question: "Puis-je reproduire moi-même ce benchmark d'inférence sur RTX 4090 ?"
    answer: "Oui. L'article détaille la configuration matérielle, la version de CUDA, la version du pilote, les paramètres de décodage et la configuration de concurrence. En déployant Llama-3.1-8B en FP16 sur une seule RTX 4090, avec la même longueur de prompt et le même nombre de flux simultanés, vous obtiendrez des résultats comparables."
---

Faire tourner votre propre modèle ne règle que la moitié du problème.

Une fois le fine-tuning terminé, comme décrit dans notre [guide du fine-tuning privé de LLM](/fr/private-llm-fine-tuning-guide/), la décision suivante est opérationnelle : comment servir le modèle efficacement ?

L'inférence détermine :

- Le coût par token
- La latence sous charge
- L'efficacité d'utilisation du GPU
- La viabilité du matériel grand public en production

Ce benchmark compare trois piles d'inférence très utilisées :

- Ollama
- vLLM
- Hugging Face Text Generation Inference (TGI)

Le but n'est pas de donner une préférence. Le but est de mesurer.

---

## Environnement de test

**Matériel**

- GPU : NVIDIA RTX 4090 (24 Go de VRAM)
- CPU : processeur grand public 16 cœurs de classe Ryzen
- RAM : 64 Go DDR5
- Stockage : SSD NVMe
- CUDA : 12.1
- Pilote NVIDIA : 550+

**Modèle**

- `meta-llama/Llama-3.1-8B`
- Précision : FP16 (pas de quantification 4 bits)
- Fenêtre de contexte : 4096 tokens

**Conditions du benchmark**

- Prompt d'entrée de 512 tokens
- Génération de 128 tokens en sortie
- Décodage glouton (température = 0)
- Pas de décodage spéculatif
- Pas de parallélisme de tenseurs
- Démarrage à chaud uniquement (modèle préchargé avant la mesure)
- 8 flux de requêtes simultanés (lorsque c'est pris en charge)

Tous les tests ont été exécutés sur une machine propre, sans aucune charge en arrière-plan. Chaque mesure correspond à la moyenne de cinq exécutions.

---

![Terminal affichant les indicateurs structurés d'un benchmark d'inférence sur RTX 4090](../_images/rtx4090-inference-terminal-results.png)

---

## Résultats

### 1. Ollama

Ollama privilégie la simplicité. L'installation est minimale et les modèles se téléchargent automatiquement.

```bash
ollama run llama3
```

Les options de configuration du batching et de la stratégie d'ordonnancement sont limitées.

#### Performances mesurées (RTX 4090, FP16)

- **Débit sur un seul flux :** 62–74 tokens/s
- **Débit sur 8 flux :** 95–108 tokens/s
- **Latence du premier token :** 720–980 ms
- **VRAM utilisée :** 14–17 Go

#### Observations

- L'utilisation du GPU fluctuait sous charge concurrente.
- Le débit ne progressait plus de façon linéaire au-delà de 4 flux.
- Aucun réglage n'est exposé pour optimiser finement le batching.

Ollama est fiable pour le développement local et les services à faible trafic. Sous une charge concurrente soutenue, il n'exploite pas pleinement le GPU.

---

### 2. vLLM

vLLM est conçu pour le débit. Son implémentation de PagedAttention améliore l'efficacité du cache KV quand les requêtes sont simultanées.

Installation :

```bash
pip install vllm
```

Lancement :

```bash
python -m vllm.entrypoints.openai.api_server \
  --model meta-llama/Llama-3.1-8B \
  --dtype float16
```

#### Performances mesurées (RTX 4090, FP16)

- **Débit sur un seul flux :** 92–104 tokens/s
- **Débit sur 8 flux :** 185–215 tokens/s
- **Latence du premier token :** 360–480 ms
- **VRAM utilisée :** 20–22 Go

#### Observations

- L'utilisation du GPU est restée au-dessus de 95 % sous charge.
- Le batching continu a amélioré la montée en charge.
- La latence est restée stable sur l'ensemble des flux simultanés.

vLLM a obtenu le meilleur débit soutenu par heure de location.

---

### 3. Hugging Face Text Generation Inference (TGI)

TGI est un serveur d'inférence de production conteneurisé.

```bash
docker run --gpus all \
  -p 8080:80 \
  ghcr.io/huggingface/text-generation-inference:latest \
  --model-id meta-llama/Llama-3.1-8B
```

#### Performances mesurées (RTX 4090, FP16)

- **Débit sur un seul flux :** 78–88 tokens/s
- **Débit sur 8 flux :** 150–176 tokens/s
- **Latence du premier token :** 510–690 ms
- **VRAM utilisée :** 21–23 Go

#### Observations

- Les performances étaient régulières et prévisibles.
- Le débit a mieux tenu la montée en charge qu'avec Ollama, mais moins bien qu'avec vLLM.
- La surcharge opérationnelle est plus élevée à cause du runtime de conteneurs.

TGI offre des outils de pilotage et de supervision pour la production, mais n'exploite pas le débit maximal d'une seule 4090.

---

![Sortie de nvidia-smi montrant l'utilisation du GPU pendant une inférence avec requêtes simultanées](../_images/rtx4090-nvidia-smi-inference-load.png)

---

## Comparaison directe

| Pile   | Un seul flux  | 8 flux      | Premier token | VRAM     | Saturation du GPU |
| ------ | ------------- | ----------- | ------------- | -------- | ----------------- |
| Ollama | 62–74 t/s     | 95–108 t/s  | 720–980 ms    | 14–17 Go | Partielle         |
| TGI    | 78–88 t/s     | 150–176 t/s | 510–690 ms    | 21–23 Go | Élevée            |
| vLLM   | 92–104 t/s    | 185–215 t/s | 360–480 ms    | 20–22 Go | Très élevée       |

---

## Ce que cela coûte sur des GPU loués

Sur les places de marché de GPU, une RTX 4090 se louait environ 0,30 à 0,46 $ de l'heure en septembre 2026, selon la plateforme et la demande. Pour le détail, consultez :

- [Comparaison des prix de location de GPU en 2026](/fr/gpu-rental-pricing-comparison-2026/)
- [Le vrai coût de la location d'un GPU](/fr/hidden-fees-in-gpu-rental/)

Hypothèses :

- Location à 0,45 $/heure
- 500 000 tokens générés
- 8 flux simultanés

Avec le débit médian mesuré :

**vLLM (~200 tokens/s)**  
500 000 / 200 = 2 500 secondes ≈ 41–42 minutes  
Coût ≈ 0,31 $

**Ollama (~100 tokens/s)**  
500 000 / 100 = 5 000 secondes ≈ 83–84 minutes  
Coût ≈ 0,63 $

Prise isolément, la différence de coût n'a rien de spectaculaire. Mais elle se cumule à grande échelle.

À 50 millions de tokens par jour, l'efficacité du débit détermine directement la taille du parc de GPU et la durée de location.

### Reproduire ce benchmark vous-même

Pour reproduire ces mesures, il vous faut une machine que vous contrôlez, afin d'installer et de configurer chaque serveur. Les places de marché qui louent des conteneurs avec accès SSH, comme Vast.ai ou RunPod, font l'affaire.

Si vous voulez simplement essayer des modèles servis par Ollama sur une RTX 4090 sans rien installer, les fournisseurs de [GPUFlow](https://gpuflow.app/fr/marketplace) font tourner Ollama et vous louez l'accès via une clé API compatible OpenAI, facturée à la seconde. Vous ne pouvez pas y changer de serveur d'inférence : c'est fait pour utiliser les modèles, pas pour comparer les serveurs.

Comme la location se paie à l'heure, l'efficacité de l'inférence a un impact direct sur le coût. La différence entre 100 et 200 tokens/s devient significative sur des charges de travail soutenues.

---

## Le contexte de déploiement

Si vous louez des GPU à l'heure, l'efficacité de l'inférence détermine directement votre rentabilité. Nous faisons le calcul dans [GPU à l'heure ou API au token](/fr/hourly-gpu-vs-per-token-api/).

Le débit influe sur :

- Le nombre d'heures de location nécessaires pour un job
- Le nombre de GPU nécessaires pour absorber votre trafic
- L'exposition à l'instabilité des hôtes
- La marge opérationnelle

Les GPU grand public restent économiquement viables pour les modèles de 7B à 8B, à condition de les associer à une pile d'inférence efficace.

---

## Quand utiliser chacun

**Ollama**

- Outils internes
- Peu de requêtes simultanées
- Prototypage rapide

**TGI**

- Environnements conteneurisés
- Équipes qui ont besoin de logs structurés
- Déploiements en production gérés

**vLLM**

- Services d'API
- Beaucoup de requêtes simultanées
- Un maximum de tokens par dollar

---

## Conclusion

Sur une seule RTX 4090 qui fait tourner Llama‑3.1‑8B en FP16 :

- vLLM a obtenu le meilleur débit soutenu.
- TGI a offert des performances équilibrées, avec des outils de pilotage pour la production.
- Ollama a privilégié la simplicité plutôt que l'utilisation maximale du GPU.

Le choix de la pile d'inférence n'a rien de cosmétique. Il définit la structure des coûts et le comportement à la montée en charge.

Pour les charges de travail déployées sur des GPU grand public loués, l'efficacité du batching pèse concrètement sur la rentabilité.

## Où faire tourner cela en production

Tous les benchmarks de cet article ont été réalisés sur du matériel grand public loué, et non sur une infrastructure en propre.

Pour faire du fine-tuning ou faire tourner votre propre serveur d'inférence, louez une machine sur laquelle vous pouvez vous connecter. Pour utiliser un modèle servi par Ollama via une API, sans rien installer, découvrez [GPUFlow](https://gpuflow.app/fr/marketplace) : les locations sont facturées à la seconde et se paient avec des crédits achetés par carte.

#### Ressources associées

**Pour approfondir votre pile de déploiement :**

- [Le guide complet du fine-tuning privé de LLM sur des GPU loués](/fr/private-llm-fine-tuning-guide/) : le pas-à-pas complet pour entraîner des modèles open-weights en toute sécurité
- [Comparaison des prix de location de GPU en 2026](/fr/gpu-rental-pricing-comparison-2026/) : les écarts de coût entre les principales plateformes de location de GPU
- [Le vrai coût de la location d'un GPU](/fr/hidden-fees-in-gpu-rental/) : ce que les pages de tarifs horaires ne disent pas
- [Comparatif RunPod vs Vast.ai](/fr/runpod-vs-vastapi-comparison/) : les différences entre une infrastructure centralisée et une place de marché
