---
title: "Fine-tuner un LLM en privé sur un GPU loué : guide pratique"
description: "Quand le fine-tuning vaut mieux que le RAG ou le prompt, la VRAM nécessaire pour QLoRA selon la taille du modèle, TRL, Unsloth et Axolotl, la confidentialité des données sur un GPU loué, les coûts et le déploiement."
excerpt: "Un fine-tuning QLoRA d'un modèle ouvert de 8B tient sur un seul GPU loué de 24 Go et coûte environ 0,35 $ à 0,83 $ par entraînement. Avant de payer, vérifiez que le fine-tuning est le bon outil, et prévoyez comment vos données restent à vous sur la machine de quelqu'un d'autre."
pubDate: 2025-02-23
updatedDate: 2026-09-30
locale: "fr"
category: "tutorials"
featured: false
draft: false
author: "GPUFlow Team"
heroImage: "../_images/private-llm-fine-tuning-guide-hero.png"
heroImageAlt: "Illustration d'un jeu de données privé utilisé pour fine-tuner un modèle de langage sur un serveur GPU loué"
faq:
  - question: "Combien de VRAM faut-il pour fine-tuner un modèle de 7B ou 8B ?"
    answer: "En QLoRA, le tableau des prérequis d'Unsloth indique environ 5 Go pour un modèle de 7B et 6 Go pour un 8B ; un LoRA classique en 16 bits demande environ 19 Go et 22 Go. Un vrai entraînement a besoin de marge pour des séquences plus longues et des batchs plus gros : une carte de 24 Go comme une RTX 3090 ou 4090 est le choix confortable."
  - question: "Faut-il fine-tuner ou utiliser le RAG ?"
    answer: "Utilisez le RAG quand le modèle a besoin de faits tirés de vos documents, surtout de faits qui changent. Une étude de 2024 d'Ovadia et al. a montré que le RAG battait systématiquement le fine-tuning non supervisé pour ajouter des connaissances. Fine-tunez quand il vous faut un format, un ton ou un comportement précis et constant que le prompt ne produit pas de façon fiable."
  - question: "Combien coûte le fine-tuning d'un LLM sur un GPU loué ?"
    answer: "Un entraînement QLoRA sur un modèle de 8B avec 2 000 exemples prend un peu plus d'une heure, installation comprise, soit environ 0,35 $ sur une RTX 4090 Vast.ai à 0,31 $/h ou 0,83 $ au prix affiché de RunPod de 0,74 $/h (septembre 2026). Un entraînement sur 20 000 exemples prend environ quatre heures, soit 1,24 $ à 2,97 $."
  - question: "L'hôte du GPU peut-il voir mes données d'entraînement ?"
    answer: "L'hôte possède le matériel : partez du principe qu'il le peut. L'isolation par conteneur vous protège des autres locataires, pas du propriétaire de la machine. Pour des données sensibles, choisissez des hôtes en data center contrôlés (Vast.ai Secure Cloud, RunPod Secure Cloud), retirez les données personnelles avant l'envoi et supprimez l'instance quand vous avez fini."
  - question: "Quelle est la différence entre LoRA et QLoRA ?"
    answer: "LoRA gèle le modèle de base et entraîne de petites matrices d'adaptation. QLoRA fait de même mais charge le modèle de base gelé en précision NF4 sur 4 bits, ce qui a suffisamment réduit la mémoire pour fine-tuner un modèle de 65B sur un seul GPU de 48 Go dans l'article d'origine."
  - question: "Peut-on fine-tuner ou envoyer son modèle sur GPUFlow ?"
    answer: "Non. GPUFlow fait uniquement de l'inférence : vous louez une API de chat compatible OpenAI pour des modèles que les fournisseurs ont installés sur leurs propres machines, généralement avec Ollama. Il n'y a ni shell ni accès aux fichiers : impossible d'y entraîner ou d'y envoyer votre propre modèle."
---

Vous pouvez fine-tuner un modèle ouvert de 8B sur vos propres données avec QLoRA, sur un seul GPU loué de 24 Go, et un entraînement typique coûte moins d'un dollar. Les questions difficiles viennent avant : le fine-tuning est-il seulement la bonne solution (pour des faits, la recherche documentaire l'emporte en général), et comment vos données restent-elles privées sur une machine qui appartient à quelqu'un d'autre ?

Ce guide traite ces deux points, puis la VRAM nécessaire selon la taille du modèle, les outils actuels, un script d'entraînement fonctionnel, un calcul de coût et la façon de servir le résultat. Tout a été vérifié en septembre 2026 ; les sources sont en fin d'article.

## Fine-tuning, RAG ou meilleurs prompts

Le fine-tuning change la façon dont un modèle se comporte. C'est un mauvais moyen de lui apprendre des faits. Ovadia et al. ont comparé les deux approches pour l'injection de connaissances et constaté que le RAG « surpasse systématiquement » le fine-tuning non supervisé, « aussi bien pour les connaissances déjà vues à l'entraînement que pour des connaissances entièrement nouvelles ». Leur conclusion : les LLM peinent à apprendre de nouveaux faits par fine-tuning.

Parcourez donc cet arbre avant de louer quoi que ce soit :

<figure>
<svg viewBox="0 0 720 420" role="img" aria-labelledby="d1-title" xmlns="http://www.w3.org/2000/svg" font-family="system-ui, sans-serif" font-size="15">
<title id="d1-title">Arbre de décision pour choisir entre la recherche documentaire, de meilleurs prompts, le fine-tuning ou un modèle plus gros</title>
<defs><marker id="d1-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#64748b"/></marker></defs>
<rect width="720" height="420" fill="#ffffff"/>
<rect x="60" y="15" width="280" height="40" rx="8" fill="#1e1b4b"/>
<text x="200" y="40" text-anchor="middle" fill="#ffffff">Les réponses ne suffisent pas</text>
<line x1="200" y1="55" x2="200" y2="83" stroke="#64748b" stroke-width="2" marker-end="url(#d1-arrow)"/>
<rect x="20" y="85" width="360" height="50" rx="8" fill="#ffffff" stroke="#f97316" stroke-width="2"/>
<text x="200" y="115" text-anchor="middle" fill="#1e1b4b">Faits manquants, ou données qui changent ?</text>
<rect x="440" y="80" width="260" height="60" rx="10" fill="#f0fdf4" stroke="#16a34a" stroke-width="2"/>
<text x="570" y="105" text-anchor="middle" fill="#1e1b4b" font-weight="600">Utiliser le RAG</text>
<text x="570" y="126" text-anchor="middle" fill="#64748b" font-size="13">vos documents, à chaque requête</text>
<line x1="380" y1="110" x2="438" y2="110" stroke="#64748b" stroke-width="2" marker-end="url(#d1-arrow)"/>
<text x="409" y="102" text-anchor="middle" fill="#16a34a" font-size="13">Oui</text>
<line x1="200" y1="135" x2="200" y2="173" stroke="#64748b" stroke-width="2" marker-end="url(#d1-arrow)"/>
<text x="215" y="160" fill="#64748b" font-size="13">Non</text>
<rect x="20" y="175" width="360" height="50" rx="8" fill="#ffffff" stroke="#f97316" stroke-width="2"/>
<text x="200" y="205" text-anchor="middle" fill="#1e1b4b">Des consignes et des exemples suffisent ?</text>
<rect x="440" y="170" width="260" height="60" rx="10" fill="#f0fdf4" stroke="#16a34a" stroke-width="2"/>
<text x="570" y="195" text-anchor="middle" fill="#1e1b4b" font-weight="600">Améliorer le prompt</text>
<text x="570" y="216" text-anchor="middle" fill="#64748b" font-size="13">prompt système, exemples few-shot</text>
<line x1="380" y1="200" x2="438" y2="200" stroke="#64748b" stroke-width="2" marker-end="url(#d1-arrow)"/>
<text x="409" y="192" text-anchor="middle" fill="#16a34a" font-size="13">Oui</text>
<line x1="200" y1="225" x2="200" y2="263" stroke="#64748b" stroke-width="2" marker-end="url(#d1-arrow)"/>
<text x="215" y="250" fill="#64748b" font-size="13">Non</text>
<rect x="20" y="265" width="360" height="50" rx="8" fill="#ffffff" stroke="#f97316" stroke-width="2"/>
<text x="200" y="295" text-anchor="middle" fill="#1e1b4b">Format, ton ou savoir-faire à figer ?</text>
<rect x="440" y="260" width="260" height="60" rx="10" fill="#eef2ff" stroke="#6366f1" stroke-width="2"/>
<text x="570" y="285" text-anchor="middle" fill="#1e1b4b" font-weight="600">Fine-tuner avec QLoRA</text>
<text x="570" y="306" text-anchor="middle" fill="#64748b" font-size="13">des centaines de bons exemples</text>
<line x1="380" y1="290" x2="438" y2="290" stroke="#64748b" stroke-width="2" marker-end="url(#d1-arrow)"/>
<text x="409" y="282" text-anchor="middle" fill="#16a34a" font-size="13">Oui</text>
<line x1="200" y1="315" x2="200" y2="353" stroke="#64748b" stroke-width="2" marker-end="url(#d1-arrow)"/>
<text x="215" y="340" fill="#64748b" font-size="13">Non</text>
<rect x="60" y="355" width="280" height="50" rx="10" fill="#f8fafc" stroke="#64748b" stroke-width="2"/>
<text x="200" y="385" text-anchor="middle" fill="#1e1b4b">Essayer un modèle plus gros</text>
<text x="570" y="370" text-anchor="middle" fill="#64748b" font-size="13">RAG et fine-tuning se combinent bien :</text>
<text x="570" y="390" text-anchor="middle" fill="#64748b" font-size="13">réglez le comportement, cherchez les faits</text>
</svg>
<figcaption>La plupart des problèmes du type « le modèle ne connaît pas nos affaires » sont des problèmes de recherche documentaire. Le fine-tuning vaut son coût quand il vous faut le même comportement à chaque fois : un schéma JSON, un style maison, une grille de classification.</figcaption>
</figure>

Les bonnes raisons de fine-tuner :

- **Un format de sortie strict.** Extraire des champs dans votre schéma à chaque appel, sans une page de consignes dans chaque prompt.
- **Le style et le ton.** Des réponses au support qui sonnent comme votre équipe, ou des rapports à structure fixe.
- **Une tâche étroite confiée à un petit modèle.** Un modèle de 8B ajusté peut remplacer un grand modèle généraliste pour une tâche donnée, ce qui compte quand vous le servez sur du matériel bon marché.
- **Des prompts plus courts.** Un comportement appris dans les poids n'a pas besoin d'être répété à chaque requête.

## LoRA et QLoRA

Un fine-tuning complet met à jour tous les poids : le GPU doit donc garder les gradients et l'état de l'optimiseur pour chacun d'eux, en plus du modèle. LoRA gèle le modèle de base et entraîne de petites matrices de rang faible à côté de ses couches ; l'article d'origine rapportait 10 000 fois moins de paramètres entraînables et 3 fois moins de mémoire GPU qu'un fine-tuning complet de GPT-3 175B avec Adam.

QLoRA va plus loin : le modèle de base gelé est chargé en précision NF4 sur 4 bits, et seuls les adaptateurs sont entraînés en 16 bits. Dettmers et al. l'ont utilisé pour fine-tuner un modèle de 65B sur un seul GPU de 48 Go « tout en conservant les performances d'un fine-tuning complet en 16 bits ». L'article a introduit trois éléments que les outils utilisent encore : le type de données NF4, la double quantification des constantes de quantification, et des optimiseurs paginés qui absorbent les pics de mémoire.

Dans les deux cas, on obtient un adaptateur, un dossier de quelques tenseurs, que l'on applique par-dessus le modèle de base inchangé. Vous pouvez le garder séparé ou le fusionner dans les poids. Les modèles d'image utilisent la même méthode : un [LoRA Stable Diffusion](/fr/stable-diffusion-lora-training-under-10-dollars/) s'entraîne sur une seule carte louée de 24 Go pour bien moins de 10 $.

## La VRAM nécessaire

Unsloth publie un tableau de la VRAM minimale pour le fine-tuning selon la taille du modèle. Ce sont ses chiffres, avec ses optimisations mémoire ; un entraînement Hugging Face classique demande davantage, et des séquences plus longues ou des batchs plus gros font monter chaque ligne.

| Taille du modèle | QLoRA (4 bits) | LoRA (16 bits) | Carte louée où QLoRA tient confortablement |
| --- | --- | --- | --- |
| 3B | 3,5 Go | 8 Go | N'importe quelle carte de 12 Go ou plus |
| 8B | 6 Go | 22 Go | RTX 3090 / 4090 (24 Go) |
| 14B | 8,5 Go | 33 Go | RTX 3090 / 4090 (24 Go) |
| 32B | 26 Go | 76 Go | Carte de 48 Go (RTX A6000, A40, L40S) |
| 70B | 41 Go | 164 Go | Carte de 80 Go (A100, H100) |

<figure>
<svg viewBox="0 0 720 320" role="img" aria-labelledby="d2-title" xmlns="http://www.w3.org/2000/svg" font-family="system-ui, sans-serif" font-size="15">
<title id="d2-title">Diagramme en barres de la VRAM minimale pour fine-tuner des modèles de 8B, 14B, 32B et 70B en QLoRA et en LoRA 16 bits, face à des cartes de 24, 48 et 80 Go</title>
<rect width="720" height="320" fill="#ffffff"/>
<rect x="200" y="12" width="14" height="14" fill="#6366f1"/>
<text x="220" y="24" fill="#1e1b4b" font-size="13">QLoRA 4 bits</text>
<rect x="320" y="12" width="14" height="14" fill="#eef2ff" stroke="#6366f1" stroke-width="1.5"/>
<text x="340" y="24" fill="#1e1b4b" font-size="13">LoRA 16 bits</text>
<line x1="262.1" y1="58" x2="262.1" y2="265" stroke="#f97316" stroke-width="1.5" stroke-dasharray="5 4"/>
<text x="262.1" y="52" text-anchor="middle" fill="#f97316" font-size="12">24 Go</text>
<line x1="324.2" y1="58" x2="324.2" y2="265" stroke="#f97316" stroke-width="1.5" stroke-dasharray="5 4"/>
<text x="324.2" y="52" text-anchor="middle" fill="#f97316" font-size="12">48 Go</text>
<line x1="407.1" y1="58" x2="407.1" y2="265" stroke="#f97316" stroke-width="1.5" stroke-dasharray="5 4"/>
<text x="407.1" y="52" text-anchor="middle" fill="#f97316" font-size="12">80 Go</text>
<text x="190" y="88" text-anchor="end" fill="#1e1b4b">8B</text>
<rect x="200" y="66" width="15.5" height="16" fill="#6366f1"/>
<text x="221" y="79" fill="#1e1b4b" font-size="12">6</text>
<rect x="200" y="84" width="56.9" height="16" fill="#eef2ff" stroke="#6366f1" stroke-width="1.5"/>
<text x="268" y="97" fill="#1e1b4b" font-size="12">22</text>
<text x="190" y="138" text-anchor="end" fill="#1e1b4b">14B</text>
<rect x="200" y="116" width="22" height="16" fill="#6366f1"/>
<text x="228" y="129" fill="#1e1b4b" font-size="12">8,5</text>
<rect x="200" y="134" width="85.4" height="16" fill="#eef2ff" stroke="#6366f1" stroke-width="1.5"/>
<text x="291" y="147" fill="#1e1b4b" font-size="12">33</text>
<text x="190" y="188" text-anchor="end" fill="#1e1b4b">32B</text>
<rect x="200" y="166" width="67.3" height="16" fill="#6366f1"/>
<text x="273" y="179" fill="#1e1b4b" font-size="12">26</text>
<rect x="200" y="184" width="196.7" height="16" fill="#eef2ff" stroke="#6366f1" stroke-width="1.5"/>
<text x="425" y="197" fill="#1e1b4b" font-size="12">76</text>
<text x="190" y="238" text-anchor="end" fill="#1e1b4b">70B</text>
<rect x="200" y="216" width="106.1" height="16" fill="#6366f1"/>
<text x="302" y="229" text-anchor="end" fill="#ffffff" font-size="12">41</text>
<rect x="200" y="234" width="424.5" height="16" fill="#eef2ff" stroke="#6366f1" stroke-width="1.5"/>
<text x="631" y="247" fill="#1e1b4b" font-size="12">164</text>
<line x1="200" y1="265" x2="640" y2="265" stroke="#64748b" stroke-width="1"/>
<text x="200" y="283" text-anchor="middle" fill="#64748b" font-size="12">0</text>
<text x="303.5" y="283" text-anchor="middle" fill="#64748b" font-size="12">40</text>
<text x="407.1" y="283" text-anchor="middle" fill="#64748b" font-size="12">80</text>
<text x="510.6" y="283" text-anchor="middle" fill="#64748b" font-size="12">120</text>
<text x="614.1" y="283" text-anchor="middle" fill="#64748b" font-size="12">160</text>
<text x="420" y="306" text-anchor="middle" fill="#64748b" font-size="13">VRAM minimale en Go (tableau des prérequis d'Unsloth)</text>
</svg>
<figcaption>C'est QLoRA qui rend les cartes grand public louées utiles ici : jusqu'à 14B, tout tient sur une carte de 24 Go avec de la marge, 32B demande une carte de 48 Go et 70B une carte de 80 Go. Sans chargement en 4 bits, même un 8B tient à peine dans 24 Go.</figcaption>
</figure>

Mon choix par défaut : un modèle de 8B ou 14B sur une RTX 4090. C'est la carte louée la moins chère qui laisse de la place pour des séquences de 2 048 tokens et un batch raisonnable, et les modèles de cette taille sont faciles à servir ensuite. Pour choisir un modèle de base selon la VRAM sur laquelle vous le servirez, voir [quels modèles d'IA tiennent dans la VRAM de votre GPU](/fr/which-ai-models-fit-your-gpu-vram/).

## Choisir un outil : TRL, Unsloth ou Axolotl

Les trois sont open source et font tous du LoRA et du QLoRA.

| Outil | Utilisation | Point fort | Point de vigilance |
| --- | --- | --- | --- |
| Hugging Face TRL + PEFT | Python (`SFTTrainer`) | L'implémentation de référence ; DPO, GRPO et d'autres avec la même API | Consomme plus de mémoire qu'Unsloth pour le même entraînement |
| Unsloth | Python, ou l'interface web Unsloth Studio | Annonce 2 fois plus rapide et 70 % de VRAM en moins ; export direct en GGUF | L'interface Studio est sous AGPL-3.0 (le cœur est sous Apache 2.0) |
| Axolotl | Un fichier YAML, `axolotl train config.yml` | Multi-GPU (FSDP, DeepSpeed), nombreuses recettes | Demande Python 3.11+ et PyTorch 2.11+ |

En septembre 2026, TRL en est à la version 1.14 et PEFT à la 0.21. Unsloth demande Python 3.11 à 3.13 et un GPU NVIDIA de capacité CUDA 7.0 ou plus (V100, T4, série RTX 20 et au-delà). Axolotl recommande Python 3.12 et PyTorch 2.12.1.

Prenez TRL si vous voulez comprendre chaque ligne, Unsloth si la VRAM vous manque ou si vous voulez un export GGUF en un appel, et Axolotl si vous allez répéter des entraînements avec des réglages différents ou passer à plusieurs GPU. Le script ci-dessous utilise TRL, parce que c'est le chemin le plus court qui montre chaque rouage.

## Préparer les données

Le `SFTTrainer` de TRL lit des conversations de la même forme qu'une requête d'API de chat. Un objet JSON par ligne dans `train.jsonl` :

```json
{"messages": [{"role": "system", "content": "Extract the invoice fields as JSON."}, {"role": "user", "content": "Invoice 4471 from Norden AB, due 12 March, total 1,250 EUR"}, {"role": "assistant", "content": "{\"invoice_id\": \"4471\", \"supplier\": \"Norden AB\", \"due\": \"2026-03-12\", \"total\": 1250, \"currency\": \"EUR\"}"}]}
```

Règles pratiques :

- **La qualité avant la quantité.** Quelques centaines à quelques milliers d'exemples cohérents et corrects valent mieux que des dizaines de milliers d'exemples bruités. Chaque erreur dans les données est un comportement que vous payez pour enseigner.
- **Coller à la production.** Utilisez le prompt système et le format d'entrée que votre application enverra réellement.
- **Mettre de côté 5 à 10 %.** Gardez des exemples sur lesquels le modèle ne s'entraîne jamais, pour comparer côte à côte le modèle de base et le modèle ajusté.
- **Retirer ce qui ne sert pas.** Noms, e-mails, numéros de compte et identifiants aident rarement le modèle à apprendre un format. Remplacez-les par des valeurs fictives réalistes avant que les données ne quittent votre ordinateur.

Cette dernière règle ne concerne pas seulement la machine louée. Carlini et al. ont extrait de GPT-2 des centaines de séquences d'entraînement mot pour mot, dont des noms, des numéros de téléphone et des adresses e-mail, certaines présentes dans un seul document d'entraînement. Un modèle fine-tuné peut répéter ce qu'il a appris à quiconque l'utilise ensuite.

## Garder les données privées sur une machine louée

Sur une place de marché de GPU, l'ordinateur appartient à quelqu'un d'autre. Vast.ai le dit sans détour : « Les clients sont isolés dans des conteneurs Docker non privilégiés et n'ont accès qu'à leurs propres données », et « la sécurité varie beaucoup d'un fournisseur à l'autre ». Cette isolation vous protège des autres locataires. Elle ne vous protège pas de la personne qui a un accès physique et les droits root sur l'hôte.

Pour des données privées :

1. **Choisissez un hôte en data center contrôlé.** Les fournisseurs Secure Cloud de Vast.ai sont des « data centers contrôlés, certifiés ISO 27001, aux normes Tier 3/4 », et Vast les recommande pour les travaux sensibles. Le Secure Cloud de RunPod tourne dans des data centers T3/T4 ; son Community Cloud vous met en relation avec des fournisseurs individuels. Les offres en data center coûtent plus cher à l'heure, et ici elles le valent.
2. **N'envoyez que le jeu de données nettoyé,** par SSH (`rsync -avP` ou `scp`). Ne le faites pas transiter par un bucket public ou un lien partagé.
3. **Gardez les logs en local.** Dans TRL 1.14, `report_to` vaut `"none"` par défaut : rien ne part vers un outil de suivi d'expériences tant que vous ne l'activez pas. N'appelez pas `push_to_hub` avec un adaptateur entraîné sur des données privées.
4. **Récupérez les résultats, puis supprimez l'instance.** Téléchargez l'adaptateur et les résultats d'évaluation, déconnectez-vous de Hugging Face (`hf auth logout`) si vous avez utilisé un token, et supprimez l'instance et tout volume. Sur Vast.ai, le stockage est facturé et conservé jusqu'à la suppression de l'instance, pas seulement jusqu'à son arrêt.

Supprimer des fichiers dans un conteneur ne garantit pas que le disque de l'hôte soit effacé : la vraie protection, ce sont les étapes 1 et 2. Choisissez qui détient le matériel, et envoyez-lui le moins possible. Plus de détails dans [comment sécuriser un jeu de données sur un nœud GPU public](/fr/how-to-secure-dataset-on-public-gpu-node/). Si [votre politique interdit tout matériel tiers](/fr/why-corporate-policies-banning-chatgpt/), le même script tourne sur votre propre carte de 24 Go.

## Entraîner : un script QLoRA avec TRL

Sur une machine Linux louée avec une RTX 3090 ou 4090 :

```bash
python -m venv venv && source venv/bin/activate
pip install torch trl peft bitsandbytes datasets
```

Puis `train.py`, qui suit le modèle QLoRA de la documentation PEFT de TRL. Qwen3-8B est sous Apache 2.0 et en libre accès : pas besoin de token Hugging Face.

```python
import torch
from datasets import load_dataset
from peft import LoraConfig
from transformers import BitsAndBytesConfig
from trl import SFTConfig, SFTTrainer

dataset = load_dataset("json", data_files="train.jsonl", split="train")

bnb_config = BitsAndBytesConfig(
    load_in_4bit=True,
    bnb_4bit_quant_type="nf4",
    bnb_4bit_compute_dtype=torch.bfloat16,
    bnb_4bit_use_double_quant=True,
)

peft_config = LoraConfig(
    r=16,
    lora_alpha=32,
    lora_dropout=0.05,
    target_modules="all-linear",
    task_type="CAUSAL_LM",
)

args = SFTConfig(
    output_dir="out",
    num_train_epochs=3,
    per_device_train_batch_size=4,
    gradient_accumulation_steps=4,
    learning_rate=2e-4,
    lr_scheduler_type="cosine",
    warmup_steps=20,
    max_length=2048,
    bf16=True,
    logging_steps=10,
    save_strategy="epoch",
    model_init_kwargs={"dtype": torch.bfloat16},
)

trainer = SFTTrainer(
    model="Qwen/Qwen3-8B",
    args=args,
    train_dataset=dataset,
    quantization_config=bnb_config,
    peft_config=peft_config,
)
trainer.train()
trainer.save_model("out/adapter")
```

Les choix qui comptent :

- **`learning_rate=2e-4`.** La documentation de TRL recommande environ 10 fois le taux habituel de fine-tuning pour QLoRA. Si la loss d'évaluation monte pendant que la loss d'entraînement baisse, vous surapprenez : réduisez le nombre d'époques.
- **`r=16`, `target_modules="all-linear"`.** Des adaptateurs sur toutes les couches linéaires, la configuration utilisée par les benchmarks d'Unsloth. Un rang de 16 suffit pour le format et le style ; augmentez-le pour des tâches plus difficiles.
- **`max_length=2048`.** Les exemples plus longs sont tronqués. Vérifiez la longueur en tokens de vos données ; une limite plus haute demande plus de VRAM.
- **Batch effectif de 16** (4 × 4 étapes d'accumulation). En cas de manque de mémoire, baissez `per_device_train_batch_size` et augmentez l'accumulation pour garder le même produit.

Avant d'éteindre la machine, passez vos exemples mis de côté dans le modèle de base et dans le modèle ajusté, et comparez. C'est le seul test qui vous dit si l'argent a servi à quelque chose.

## Ce que ça coûte

Durée d'entraînement = total de tokens ÷ débit. GigaGPU, un hébergeur, a publié une mesure d'environ 3 500 tokens d'entraînement par seconde pour Llama 3.1 8B en QLoRA sur une RTX 4090. En supposant un débit similaire pour Qwen3-8B :

**Petit entraînement :** 2 000 exemples × 600 tokens × 3 époques = 3,6 millions de tokens. 3 600 000 ÷ 3 500 = 1 029 s, environ 17 minutes.

| Étape | Durée |
| --- | --- |
| Préparer l'environnement | 10 min |
| Télécharger Qwen3-8B (16,4 Go de poids) et envoyer les données | 10 min |
| Entraînement | 17 min |
| Comparer modèle de base et modèle ajusté sur les données mises de côté | 15 min |
| Fusionner, exporter, télécharger, supprimer l'instance | 15 min |
| **Total** | **67 min (1,12 h)** |

- RTX 4090 sur Vast.ai à 0,31 $/h : 1,12 × 0,31 $ = **0,35 $**
- RTX 4090 sur RunPod à 0,74 $/h (prix affiché sur la page de tarifs) : 1,12 × 0,74 $ = **0,83 $**

**Entraînement plus gros :** 20 000 exemples × 1 000 tokens × 2 époques = 40 millions de tokens ÷ 3 500 = 11 429 s, environ 3,2 heures. Avec les mêmes 50 minutes de travail annexe, 4,0 heures : **1,24 $** sur Vast.ai ou **2,97 $** sur RunPod.

Pour un modèle de 32B, RunPod affiche en septembre 2026 des cartes de 48 Go à 0,49 $/h (A40), 0,53 $/h (RTX A6000) et 1,09 $/h (L40S). Je n'ai pas de débit publié pour du QLoRA en 32B sur ces cartes : lancez 50 pas, lisez la durée d'un pas dans le log et faites la même multiplication avant de vous engager dans un long entraînement.

Les prix sont ceux de septembre 2026, tirés de la page de tarifs de RunPod et du suivi de getdeploying.com pour Vast.ai. Les offres Secure et en data center coûtent plus cher que les offres communautaires les moins chères. La vue d'ensemble est dans [le comparatif des prix de location de GPU](/fr/gpu-rental-pricing-comparison-2026/).

## Servir le résultat

Deux options : garder l'adaptateur séparé, ou le fusionner dans le modèle.

**Le garder séparé avec vLLM.** vLLM charge les adaptateurs LoRA à côté du modèle de base et expose chacun sous un nom de modèle sur son serveur compatible OpenAI :

```bash
vllm serve Qwen/Qwen3-8B --enable-lora --lora-modules invoices=./out/adapter
```

Les clients envoient alors `"model": "invoices"`. Plusieurs adaptateurs peuvent partager un même modèle de base sur un seul GPU.

**Le fusionner et le faire tourner dans Ollama.** Fusionnez l'adaptateur dans des poids en pleine précision, convertissez en GGUF avec llama.cpp, quantifiez, puis importez :

```python
import torch
from peft import AutoPeftModelForCausalLM
from transformers import AutoTokenizer

model = AutoPeftModelForCausalLM.from_pretrained("out/adapter", dtype=torch.bfloat16)
model.merge_and_unload().save_pretrained("merged")
AutoTokenizer.from_pretrained("Qwen/Qwen3-8B").save_pretrained("merged")
```

```bash
python llama.cpp/convert_hf_to_gguf.py merged --outfile invoices-bf16.gguf --outtype bf16
./llama.cpp/build/bin/llama-quantize invoices-bf16.gguf invoices-Q4_K_M.gguf Q4_K_M
echo "FROM ./invoices-Q4_K_M.gguf" > Modelfile
ollama create invoices -f Modelfile
```

Unsloth fait la fusion et l'export GGUF en un seul appel (`model.save_pretrained_gguf("dir", tokenizer, quantization_method="q4_k_m")`). Sa documentation prévient que la cause la plus fréquente de mauvaises réponses après export est un mauvais modèle de chat (chat template) : servez avec celui utilisé à l'entraînement. Les compromis entre Ollama, vLLM et TGI sont dans [notre benchmark d'inférence sur RTX 4090](/fr/ollama-vs-vllm-vs-tgi-rtx-4090-benchmark/).

### Et GPUFlow dans tout ça

GPUFlow ne peut pas faire l'entraînement : il loue une API compatible OpenAI sur le GPU d'un fournisseur, sans shell, sans SSH et sans accès aux fichiers. Il ne peut pas non plus servir votre modèle fine-tuné. Les locataires ne peuvent pas envoyer de modèles ; les modèles proposés sont ceux que chaque fournisseur a installés (généralement avec Ollama), comme `qwen2.5:7b` ou `llama3.1:8b`.

Là où il peut aider, c'est à l'étape d'avant : vérifier, pour quelques centimes, si un modèle ouvert standard avec un bon prompt fait déjà le travail, ce qui est l'issue la moins chère de l'arbre de décision. Utilisez des données de test pour cela, pas les données privées dont parle ce guide : prompts et réponses passent en clair par la machine du fournisseur pendant la location. Le fonctionnement est décrit dans le [démarrage rapide de l'API](https://docs.gpuflow.app/fr/renters/api-quickstart/), et [utiliser la clé dans vos applications](/fr/use-openai-compatible-api-key-in-apps/) explique comment la brancher sur des outils existants.

## Sources

Toutes vérifiées en septembre 2026.

- Articles : [Hu et al., LoRA](https://arxiv.org/abs/2106.09685) ; [Dettmers et al., QLoRA](https://arxiv.org/abs/2305.14314) ; [Ovadia et al., Fine-Tuning or Retrieval?](https://arxiv.org/abs/2312.05934) ; [Carlini et al., Extracting Training Data from Large Language Models](https://arxiv.org/abs/2012.07805)
- Hugging Face TRL : [SFT Trainer](https://huggingface.co/docs/trl/sft_trainer), [intégration PEFT et QLoRA](https://huggingface.co/docs/trl/peft_integration)
- Unsloth : [prérequis et tableau de VRAM](https://unsloth.ai/docs/get-started/fine-tuning-for-beginners/unsloth-requirements.md), [benchmarks](https://unsloth.ai/docs/basics/unsloth-benchmarks.md), [enregistrer en GGUF](https://unsloth.ai/docs/basics/inference-and-deployment/saving-to-gguf.md), [GitHub](https://github.com/unslothai/unsloth)
- [Axolotl sur GitHub](https://github.com/axolotl-ai-cloud/axolotl)
- Modèle : [fiche de modèle Qwen3-8B](https://huggingface.co/Qwen/Qwen3-8B)
- Débit d'entraînement : [GigaGPU, fine-tuning sur la RTX 4090](https://gigagpu.com/rtx-4090-fine-tuning-guide/)
- Hôtes et sécurité : [FAQ sécurité de Vast.ai](https://docs.vast.ai/documentation/reference/faq/security), [tarifs Vast.ai](https://docs.vast.ai/guides/instances/pricing.md), [présentation des pods RunPod](https://docs.runpod.io/pods/overview)
- Prix : [tarifs RunPod](https://www.runpod.io/pricing), getdeploying.com pour [Vast.ai](https://getdeploying.com/vast-ai) et la [RTX 4090](https://getdeploying.com/reference/cloud-gpu/nvidia-rtx-4090)
- Service : [adaptateurs LoRA dans vLLM](https://docs.vllm.ai/en/latest/features/lora.html), [quantification avec llama.cpp](https://github.com/ggml-org/llama.cpp/blob/master/tools/quantize/README.md), [import dans Ollama](https://docs.ollama.com/import)
- GPUFlow : [démarrage rapide de l'API](https://docs.gpuflow.app/fr/renters/api-quickstart/)
