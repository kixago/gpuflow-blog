---
title: "Fine-tuning privé de LLM sur GPU loué : le guide complet"
description: "Un tutoriel complet pour faire le fine-tuning d’un modèle de langage open-weights avec vos propres données sur un GPU loué. Protégez vos données, réduisez vos coûts de calcul et évitez la dépendance à un fournisseur."
excerpt: "Apprenez à faire le fine-tuning de LLM open-weights sur des GPU loués sans perdre le contrôle de vos données. Un pas-à-pas qui couvre le transfert sécurisé, l’entraînement QLoRA et le nettoyage de l’environnement."
pubDate: 2025-02-23
updatedDate: 2026-09-29
locale: "fr"
category: "tutorials"
featured: false
draft: false
author: "GPUFlow Team"
heroImage: "../_images/secure-server-room-abstract.png"
heroImageAlt: "Représentation abstraite d’une salle de serveurs sécurisée traitant des données d’IA sous un éclairage bleu"
faq:
  - question: "Peut-on faire le fine-tuning d’un grand modèle de langage sur une seule RTX 4090 ?"
    answer: "Oui. Avec QLoRA (Quantized Low-Rank Adaptation), les modèles jusqu’à 8B paramètres tiennent sans difficulté dans 24 Go de VRAM. Ce tutoriel montre précisément comment configurer le script d’entraînement pour du matériel grand public, avec des valeurs concrètes pour la taille de batch, la longueur de séquence et le rang LoRA."
  - question: "Mon jeu de données est-il en sécurité sur un GPU loué ?"
    answer: "Votre jeu de données est aussi sûr que vos pratiques. Ce guide couvre le transfert chiffré par SCP, l’absence d’intermédiaire de stockage cloud comme S3 ou Google Drive, et le nettoyage de la machine distante une fois l’entraînement terminé. N’oubliez pas que la machine appartient à quelqu’un d’autre : supprimez tout avant de mettre fin à la location."
  - question: "Combien coûte le fine-tuning d’un modèle 8B sur un GPU loué ?"
    answer: "Un fine-tuning classique d’un modèle de 8B paramètres sur une RTX 4090 louée coûte entre trois et huit dollars, selon la taille du jeu de données et le nombre d’époques."
  - question: "Faut-il vérifier son identité pour louer de la puissance GPU pour l’entraînement ?"
    answer: "En général, non. Les marketplaces comme Vast.ai et RunPod demandent une adresse e-mail et du crédit prépayé, pas de pièce d’identité. RunPod ne demande un KYC qu’avant un premier paiement en crypto. Sur AWS, les nouveaux comptes démarrent avec un quota GPU de zéro, qu’il faut demander à faire augmenter."
  - question: "Quel format de jeu de données le script d’entraînement attend-il ?"
    answer: "Le script attend un fichier JSONL dont chaque ligne contient un objet JSON avec un champ text. Ce champ contient l’instruction, l’entrée et la réponse sous forme d’une seule chaîne avec des retours à la ligne. Un exemple correctement formaté figure à l’étape 4 de ce guide."
  - question: "Ce tutoriel fonctionne-t-il avec d’autres modèles que Llama ?"
    answer: "Oui. La méthode s’applique à tout modèle open-weights, dont Mistral, Qwen, Falcon et bien d’autres. L’exemple de code utilise Llama-3.1-8B, mais il suffit de changer l’identifiant du modèle pour affiner un autre modèle de base."
  - question: "Combien de temps dure le fine-tuning d’un modèle de 8B paramètres ?"
    answer: "Tout dépend de la taille du jeu de données. Un entraînement classique sur 1 000 exemples se termine en 30 à 60 minutes sur une RTX 4090. Au-delà, la durée augmente de façon à peu près linéaire : 10 000 exemples demandent 5 à 10 heures de calcul."
  - question: "Que faire de la machine distante une fois l’entraînement terminé ?"
    answer: "Vous devez nettoyer l’environnement en supprimant votre jeu de données, le code d’entraînement, le cache Hugging Face et l’historique bash. Ce guide fournit les commandes exactes pour une suppression sécurisée, avec l’option shred pour détruire les fichiers en profondeur avant de mettre fin à la location."
---

Si vous lisez ces lignes, vous avez probablement un jeu de données que vous ne pouvez pas, ou ne voulez pas, envoyer à OpenAI.

Vous n’êtes pas seul. Pour beaucoup d’entreprises et de développeurs indépendants, le confort de ChatGPT ne compense pas un risque de fuite de données inacceptable. Dossiers médicaux soumis à HIPAA, bases de code propriétaires qui représentent des années d’investissement, modèles financiers sensibles capables de faire bouger les marchés : utiliser une IA dans le cloud revient souvent à confier à un tiers votre propriété intellectuelle la plus précieuse.

Quand ce tiers est un géant de la tech qui a déjà utilisé les données de ses clients pour entraîner ses futurs modèles, le mot « confiance » devient inconfortable.

La solution n’est pas de renoncer à l’IA. La solution, c’est de maîtriser l’infrastructure.

Faire le fine-tuning de modèles open-weights sur du matériel que vous contrôlez n’a plus rien d’un exercice universitaire de niche. C’est une exigence métier pour les organisations soucieuses de confidentialité. Llama, Mistral, Qwen et des dizaines d’autres modèles sont utilisables commercialement, sans frais d’API ni obligation de partager vos données. La difficulté a toujours été l’accès à la puissance de calcul. Acheter des clusters NVIDIA H100 exige des millions d’investissement. Louer chez AWS implique une vérification d’identité, des contrats entreprise et des tarifs horaires qui rendent les longs entraînements hors de prix.

Ce guide propose une troisième voie. Vous allez apprendre à faire le fine-tuning d’un modèle de langage open-weights sur un GPU loué via une marketplace, souvent du matériel appartenant à des particuliers partout dans le monde. Nous verrons la préparation de l’environnement, les règles de sécurité à appliquer sur des nœuds publics et l’exécution complète de l’entraînement.

Les exemples de code utilisent Llama-3.1-8B comme référence concrète, mais la méthode est identique pour tout modèle compatible Hugging Face. Changez l’identifiant du modèle et vous pourrez affiner Mistral-7B, Qwen2-7B ou n’importe quel modèle open-weights adapté à votre cas d’usage.

Le tout sans engagement de longue durée, pour une fraction de ce que facturent les fournisseurs cloud traditionnels.

![Fenêtre de terminal affichant une connexion SSH active vers un serveur GPU distant](../_images/terminal-ssh-connection.png)

## Ce que coûte un fine-tuning privé

Avant d’entrer dans la technique, posons le cadre financier.

Entraîner un modèle sur AWS, c’est passer par de grosses instances et des demandes de quota. L’instance p4d.24xlarge (8 GPU A100) coûte 32,77 $ de l’heure, et les nouveaux comptes AWS démarrent avec un quota GPU de zéro.

Sur une marketplace de GPU, vous louez la puissance de calcul directement aux propriétaires du matériel. Les conséquences sont importantes :

**Des coûts réduits :** une RTX 4090 se loue environ 0,30 $ à 0,46 $ de l’heure sur les marketplaces (septembre 2026). Pour un modèle de 8B paramètres avec QLoRA, une seule 4090 avec 24 Go de VRAM termine un fine-tuning en deux à six heures selon la taille du jeu de données. Le coût de calcul total se situe entre trois et huit dollars.

**Vos données restent sur une seule machine :** vous copiez le jeu de données directement sur la machine louée via SSH, vous entraînez, vous récupérez le résultat et vous supprimez tout. Pas de bucket de stockage, pas de troisième copie.

**Aucun intermédiaire à convaincre :** vous n’avez besoin ni de l’accord de l’équipe commerciale entreprise d’un fournisseur cloud, ni d’une augmentation de quota. Vous ajoutez du crédit prépayé et vous louez le matériel.

À titre de comparaison, une seule A10G sur AWS (g5.xlarge, l’option la moins chère avec 24 Go de VRAM) coûte environ 1,01 $ de l’heure dans us-east-1. Ajoutez la demande de quota, le temps d’installation et le calcul inutilisé pendant que vous configurez l’environnement : le coût réel d’un premier entraînement dépasse de loin les quelques dollars qu’il coûte sur une marketplace.

Ces chiffres sont détaillés dans notre [comparatif des prix de location de GPU](/fr/gpu-rental-pricing-comparison-2026/) et dans [le coût réel de la location d’un GPU](/fr/hidden-fees-in-gpu-rental/).

## Prérequis

Ce tutoriel suppose que vous êtes à l’aise avec la ligne de commande Linux. Pas besoin d’un doctorat en machine learning, mais vous devez savoir naviguer dans un système de fichiers, modifier des fichiers texte et interpréter des messages d’erreur.

**Matériel requis :**

- **GPU :** 24 Go de VRAM minimum. La RTX 3090, la RTX 4090 et l’A10G conviennent toutes. Pour le modèle de 70B paramètres, il faut 48 Go ou plus (A6000, deux A100 ou H100).
- **RAM système :** 32 Go ou plus. Au chargement, les poids du modèle transitent par la mémoire système avant d’être transférés sur le GPU.
- **Stockage :** 100 Go ou plus sur SSD NVMe. Les poids de base de Llama-3 8B occupent environ 16 Go. Le jeu de données, les checkpoints et l’adaptateur final s’y ajoutent.

**Un mot sur le choix du modèle :** ce tutoriel prend Llama-3.1-8B de Meta comme exemple,
car c’est la plus grande catégorie de modèle qui tient sur un seul GPU de 24 Go
avec la quantification QLoRA. La famille Llama comprend désormais Llama 4 Scout et Maverick,
mais ces modèles reposent sur une architecture Mixture of Experts avec respectivement 109B et 400B
paramètres au total, ce qui impose des configurations multi-GPU hors de portée d’une location
sur un seul nœud. La méthode décrite ici s’applique aussi bien à Mistral-7B, Qwen2-7B, Gemma-2-9B
et à tout autre modèle compatible Hugging Face qui tient dans la VRAM
du matériel loué.

**Logiciels requis :**

- Python 3.10 ou plus récent
- Des bases en PyTorch
- Un compte Hugging Face (nécessaire pour télécharger les modèles à accès restreint comme Llama, qui exigent l’acceptation d’une licence)
- Un compte approvisionné en crédit prépayé sur une marketplace de GPU qui loue des machines entières avec accès SSH, comme Vast.ai, RunPod ou TensorDock

Vous hésitez ? Consultez [ce qu’il faut pour louer un GPU](/fr/what-you-need-to-rent-a-gpu/) et [GPUFlow vs Vast.ai vs RunPod vs SaladCloud](/fr/gpuflow-vs-vast-ai-vs-runpod/). Notez que GPUFlow ne convient pas à ce tutoriel : il loue l’accès à des modèles d’IA via une API, pas une machine sur laquelle vous pouvez vous connecter.

## Étape 1 : sécuriser votre nœud de calcul

La première étape consiste à obtenir le matériel. Sur les grandes plateformes cloud, il faut créer un compte, demander un quota GPU et attendre la validation. Sur une marketplace, c’est beaucoup plus direct.

Ouvrez la marketplace de votre choix et ajoutez du crédit. L’interface affiche les machines disponibles avec leurs caractéristiques, leur tarif horaire et leur score de fiabilité.

Filtrez les machines selon ces critères :

- **GPU :** RTX 4090 (24 Go de VRAM) ou RTX 6000 Ada (48 Go de VRAM)
- **RAM :** 32 Go minimum
- **Stockage :** 100 Go ou plus disponibles
- **Fiabilité :** score de disponibilité de 95 % ou plus

Choisissez une machine et lancez la location. Prenez une image où CUDA et PyTorch sont déjà installés : vous gagnez du temps d’installation, et ce temps est facturé.

**Sécurité sur les nœuds publics :**

Quand vous louez une machine sur un réseau distant, vous accédez à du matériel qui appartient à un inconnu et qu’il contrôle physiquement. La couche de virtualisation offre une vraie isolation, mais la prudence reste de mise :

1. **Ne stockez aucune clé privée sur la machine distante.** Les clés SSH d’autres systèmes, les identifiants cloud et les jetons d’API de services de production ne doivent jamais se trouver sur un nœud loué.

2. **Considérez le système de fichiers comme hostile.** Partez du principe que tout ce que vous écrivez sur le disque pourrait en théorie être récupéré par l’hôte après votre déconnexion. Nous verrons les procédures de suppression sécurisée à l’étape 6.

3. **Chiffrez les données sensibles pendant le transfert.** Nous y revenons à l’étape 3.

4. **Ne réutilisez pas vos mots de passe.** Si l’interface de location fournit des identifiants par défaut, changez-les immédiatement ou générez une nouvelle paire de clés SSH.

Une fois la location confirmée, le tableau de bord affiche les informations de connexion. Vous obtenez une commande SSH de ce type :

```bash
ssh -p 22345 user@203.0.113.42
```

Ouvrez un terminal en local et exécutez cette commande. Acceptez l’empreinte de la clé d’hôte lorsqu’elle vous est demandée. Vous êtes maintenant connecté à votre nœud GPU loué.

Vérifiez que le matériel correspond à votre commande :

```bash
nvidia-smi
```

La sortie doit afficher le GPU loué, sa capacité mémoire et la version du pilote installé. Si le GPU n’apparaît pas ou si les caractéristiques ne correspondent pas à votre commande, déconnectez-vous immédiatement et signalez l’écart au support de la marketplace.

## Étape 2 : configurer l’environnement

Une fois la connexion SSH vérifiée, la priorité est de construire un environnement Python propre. La plupart des nœuds loués sont livrés avec les pilotes NVIDIA et le toolkit CUDA préinstallés, mais s’appuyer sur les paquets Python du système de l’hôte, c’est s’exposer à des conflits de dépendances qui vous coûteront des heures de débogage.

Nous allons créer un environnement virtuel isolé, pour garantir reproductibilité et stabilité.

Exécutez les commandes suivantes pour créer votre espace de travail :

```bash
mkdir ~/llama3-finetune
cd ~/llama3-finetune
python3 -m venv venv
source venv/bin/activate
```

Votre invite de commande doit maintenant afficher `(venv)`, signe que l’environnement virtuel est actif. Tous les paquets installés ensuite resteront dans ce répertoire, sans toucher au système de l’hôte.

Avant d’installer les paquets Python, vérifiez que le toolkit CUDA est accessible :

```bash
nvcc --version
```

Notez le numéro de version de CUDA : vous en aurez besoin pour garantir la compatibilité avec PyTorch. La plupart des nœuds loués tournent sous CUDA 11.8 ou 12.1. Si `nvcc` est introuvable, le toolkit CUDA n’est peut-être pas dans votre PATH. En général, il suffit de charger le fichier d’environnement approprié :

```bash
source /etc/profile.d/cuda.sh
```

Si ce fichier n’existe pas, consultez la documentation de la marketplace pour la configuration de votre nœud.

Installez maintenant l’écosystème PyTorch. La commande suivante installe PyTorch avec la prise en charge de CUDA 12.1. Adaptez le suffixe de version CUDA si votre nœud utilise une autre version :

```bash
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121
```

Installez ensuite les bibliothèques nécessaires à un fine-tuning efficace. Nous utilisons l’écosystème Hugging Face, avec bitsandbytes pour la quantification et PEFT pour l’entraînement économe en paramètres :

```bash
pip install transformers==4.40.0 datasets==2.19.0 peft==0.10.0 bitsandbytes==0.43.1 trl==0.8.6 accelerate==0.29.0
```

**Figer les versions est important.** Les versions ci-dessus ont été testées et sont compatibles au moment de la rédaction. L’écosystème Hugging Face évolue vite, et une installation sans version figée introduit souvent des changements incompatibles. Si vous rencontrez des erreurs d’import ou un comportement inattendu, un décalage de versions est la cause la plus probable.

Enfin, authentifiez-vous auprès de Hugging Face. Les poids de Llama-3 sont soumis à un accord de licence qui nécessite un compte Hugging Face. Rendez-vous sur le [dépôt Meta Llama-3](https://huggingface.co) et acceptez les conditions de la licence. Générez ensuite un jeton d’accès depuis la page des paramètres de Hugging Face.

Lancez la commande d’authentification :

```bash
huggingface-cli login
```

Collez votre jeton d’accès lorsqu’il vous est demandé. Le jeton est stocké dans `~/.cache/huggingface/token`. Vous pouvez désormais télécharger les poids des modèles à accès restreint directement sur le nœud loué.

![Code Python affiché dans un terminal montrant les paramètres de configuration du modèle Llama-3](../_images/python-llama3-config.png)

## Étape 3 : transférer les données en toute sécurité

Cette section touche à la raison principale pour laquelle vous louez une machine au lieu d’appeler une API : la souveraineté des données.

Dans le workflow cloud classique, vous envoyez votre jeu de données dans un bucket de stockage (S3, Google Cloud Storage, Azure Blob), puis vous le téléchargez sur votre instance de calcul. Cette approche multiplie les copies de vos données sensibles sur des systèmes que vous ne contrôlez pas. Le fournisseur de stockage y a accès. Le fournisseur de calcul aussi. Et tous deux conservent des journaux de votre activité.

Nous allons contourner tout cela avec un transfert chiffré direct.

Le protocole SSH inclut `scp` (Secure Copy Protocol), qui transfère les fichiers par le même canal chiffré que votre accès terminal. Vos données passent directement de votre machine locale au nœud loué, sans aucun stockage intermédiaire.

Ouvrez une **nouvelle fenêtre de terminal** sur votre **ordinateur local**. Ne fermez pas votre session SSH en cours sur le nœud loué. Exécutez la commande suivante en remplaçant le chemin du fichier et les informations de connexion par les vôtres :

```bash
scp -P 22345 /path/to/your/dataset.jsonl user@203.0.113.42:~/llama3-finetune/
```

L’option `-P` indique le numéro de port (notez le P majuscule, contrairement au `-p` minuscule de ssh). Pour un gros jeu de données, le transfert peut prendre plusieurs minutes. Une progression s’affiche avec le nombre d’octets transférés.

**Pour les jeux de données de plus de 1 Go**, pensez à compresser avant le transfert :

```bash
# On your local machine
gzip -k dataset.jsonl
scp -P 22345 dataset.jsonl.gz user@203.0.113.42:~/llama3-finetune/

# Then on the remote node
cd ~/llama3-finetune
gunzip dataset.jsonl.gz
```

**Mesures de sécurité supplémentaires :**

Si votre modèle de menace inclut des adversaires sophistiqués, vous pouvez chiffrer le jeu de données avant le transfert avec GPG ou age. C’est une défense en profondeur : même si le transfert était intercepté d’une manière ou d’une autre, son contenu resterait illisible.

```bash
# On your local machine (using age encryption)
age -p dataset.jsonl > dataset.jsonl.age
scp -P 22345 dataset.jsonl.age user@203.0.113.42:~/llama3-finetune/

# On the remote node
age -d dataset.jsonl.age > dataset.jsonl
rm dataset.jsonl.age
```

Pour la plupart des utilisateurs, un transfert SCP standard offre une protection suffisante. Le protocole SSH utilise le chiffrement AES-256. La vérification de la clé d’hôte empêche les attaques de l’homme du milieu. Vos données ne transitent par aucun système de stockage tiers.

## Étape 4 : le script de fine-tuning

Nous allons utiliser la classe `SFTTrainer` de la bibliothèque TRL (Transformer Reinforcement Learning) pour le fine-tuning supervisé. Cette bibliothèque masque une bonne partie de la complexité tout en restant configurable pour des charges de production.

Avant d’écrire le script d’entraînement, il faut comprendre le format de jeu de données attendu.

**Format du jeu de données :**

Le script attend un fichier JSONL (JSON Lines) dont chaque ligne contient un objet JSON valide avec un champ `text`. Ce champ `text` contient l’exemple d’entraînement complet sous forme d’une seule chaîne.

Voici trois lignes correctement formatées :

```json
{"text": "### Instruction: Summarize the following legal clause in plain English.\n\n### Input: Party A shall indemnify, defend, and hold harmless Party B from any claims, damages, or expenses arising from Party A's negligence or willful misconduct.\n\n### Response: Party A agrees to protect Party B from any legal claims or costs that result from Party A's mistakes or intentional wrongdoing."}
{"text": "### Instruction: Extract the key financial metrics from this earnings report.\n\n### Input: Q3 revenue reached $4.2B, up 12% YoY. Operating margin improved to 23.5% from 21.2%. Free cash flow was $890M.\n\n### Response: Revenue: $4.2 billion (12% year-over-year growth). Operating margin: 23.5% (up from 21.2%). Free cash flow: $890 million."}
{"text": "### Instruction: Identify potential HIPAA violations in this process description.\n\n### Input: Patient records are emailed to the billing department as PDF attachments. The billing staff prints these for manual review and shreds them after processing.\n\n### Response: Potential violations include: unencrypted email transmission of PHI, physical documents that may be visible to unauthorized personnel during processing, and lack of documented chain of custody. Recommend encrypted file transfer and on-screen review only."}
```

**Points de formatage essentiels :**

1. Chaque objet JSON doit tenir sur une seule ligne. Pas de JSON multiligne.
2. Les retours à la ligne dans le champ `text` doivent être échappés sous la forme `\n`.
3. Les guillemets dans le texte doivent être échappés sous la forme `\"`.
4. Le fichier doit être encodé en UTF-8.

Si vos données sources sont dans un autre format (CSV, Parquet, colonnes instruction/réponse séparées), vous devrez les convertir dans cette structure avant le transfert. La bibliothèque `json` de Python gère l’échappement automatiquement :

```python
import json

with open('dataset.jsonl', 'w') as f:
    for example in your_data:
        text = f"### Instruction: {example['instruction']}\n\n### Input: {example['input']}\n\n### Response: {example['output']}"
        f.write(json.dumps({"text": text}) + '\n')
```

Une fois le jeu de données en place, créez le script d’entraînement sur le nœud distant :

```bash
cd ~/llama3-finetune
nano train.py
```

Collez la configuration suivante. Ce script utilise QLoRA pour affiner un modèle de 8B paramètres dans les limites mémoire d’un GPU de 24 Go. L’exemple utilise Llama-3.1-8B, mais vous pouvez le remplacer par n’importe quel modèle compatible en modifiant la variable MODEL_NAME :

```python
import torch
from datasets import load_dataset
from transformers import (
    AutoModelForCausalLM,
    AutoTokenizer,
    BitsAndBytesConfig,
    TrainingArguments,
)
from peft import LoraConfig
from trl import SFTTrainer

# ============================================
# CONFIGURATION - Modify these values as needed
# ============================================

# Base model identifier on Hugging Face
# Change this to fine-tune a different model (e.g., "mistralai/Mistral-7B-v0.1")
MODEL_NAME = "meta-llama/Llama-3.1-8B"

# Name for your fine-tuned adapter
OUTPUT_NAME = "llama-3-8b-custom"

# Path to your dataset
DATASET_PATH = "dataset.jsonl"

# Training hyperparameters
NUM_EPOCHS = 1
BATCH_SIZE = 4
LEARNING_RATE = 2e-4
MAX_SEQ_LENGTH = 512

# LoRA hyperparameters
LORA_RANK = 16
LORA_ALPHA = 16
LORA_DROPOUT = 0.05

# ============================================
# QUANTIZATION CONFIGURATION
# ============================================

bnb_config = BitsAndBytesConfig(
    load_in_4bit=True,
    bnb_4bit_quant_type="nf4",
    bnb_4bit_compute_dtype=torch.float16,
    bnb_4bit_use_double_quant=True,
)

# ============================================
# MODEL LOADING
# ============================================

print("Loading base model...")
model = AutoModelForCausalLM.from_pretrained(
    MODEL_NAME,
    quantization_config=bnb_config,
    device_map="auto",
    trust_remote_code=True,
)
model.config.use_cache = False

print("Loading tokenizer...")
tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME, trust_remote_code=True)
tokenizer.pad_token = tokenizer.eos_token
tokenizer.padding_side = "right"

# ============================================
# DATASET LOADING
# ============================================

print(f"Loading dataset from {DATASET_PATH}...")
dataset = load_dataset("json", data_files=DATASET_PATH, split="train")
print(f"Dataset contains {len(dataset)} examples")

# ============================================
# LORA CONFIGURATION
# ============================================

peft_config = LoraConfig(
    r=LORA_RANK,
    lora_alpha=LORA_ALPHA,
    lora_dropout=LORA_DROPOUT,
    bias="none",
    task_type="CAUSAL_LM",
    target_modules=["q_proj", "k_proj", "v_proj", "o_proj"],
)

# ============================================
# TRAINING ARGUMENTS
# ============================================

training_args = TrainingArguments(
    output_dir="./results",
    num_train_epochs=NUM_EPOCHS,
    per_device_train_batch_size=BATCH_SIZE,
    gradient_accumulation_steps=1,
    learning_rate=LEARNING_RATE,
    weight_decay=0.001,
    fp16=True,
    logging_steps=10,
    save_steps=100,
    save_total_limit=3,
    optim="paged_adamw_32bit",
    lr_scheduler_type="cosine",
    warmup_ratio=0.03,
    report_to="none",
)

# ============================================
# TRAINER INITIALIZATION AND EXECUTION
# ============================================

print("Initializing trainer...")
trainer = SFTTrainer(
    model=model,
    train_dataset=dataset,
    peft_config=peft_config,
    dataset_text_field="text",
    max_seq_length=MAX_SEQ_LENGTH,
    tokenizer=tokenizer,
    args=training_args,
)

print("Starting training...")
trainer.train()

print(f"Saving adapter to {OUTPUT_NAME}...")
trainer.model.save_pretrained(OUTPUT_NAME)
tokenizer.save_pretrained(OUTPUT_NAME)

print("Training complete.")
```

Enregistrez le fichier avec `Ctrl+O`, puis quittez avec `Ctrl+X`.

**Comprendre les principaux paramètres :**

- **LORA_RANK (r=16) :** détermine la capacité d’expression de l’adaptateur affiné. Une valeur plus élevée apprend davantage mais consomme plus de mémoire. Les valeurs habituelles vont de 8 à 64.

- **LORA_ALPHA (16) :** facteur d’échelle appliqué aux poids LoRA. Une règle courante consiste à le fixer à la même valeur que le rang.

- **MAX_SEQ_LENGTH (512) :** longueur maximale en tokens des exemples d’entraînement. Des séquences plus longues demandent plus de mémoire. En cas d’erreur OOM, réduisez d’abord cette valeur.

- **BATCH_SIZE (4) :** nombre d’exemples traités simultanément. Descendez à 2 ou 1 si la mémoire est insuffisante.

- **target_modules :** les couches dans lesquelles les adaptateurs LoRA sont injectés. Pour Llama-3, ce sont les couches de projection de l’attention (q, k, v, o) qui donnent les meilleurs résultats.

Pour lancer l’entraînement, exécutez :

```bash
python train.py
```

Le script commence par télécharger les poids du modèle de base (environ 16 Go pour un modèle 8B). Ce téléchargement n’a lieu qu’une fois : les exécutions suivantes utilisent les poids en cache. Une fois le chargement terminé, la progression de l’entraînement s’affiche, avec la valeur de la loss toutes les 10 étapes.

## Étape 5 : surveiller l’entraînement

Pendant que le script d’entraînement tourne, vous devez surveiller l’état du GPU. Si la VRAM sature ou si la température dépasse les seuils de sécurité, le processus plantera, avec le risque de corrompre votre checkpoint et de gaspiller votre temps de location.

Ouvrez une deuxième fenêtre de terminal sur votre machine locale et établissez une autre connexion SSH vers le nœud loué :

```bash
ssh -p 22345 user@203.0.113.42
```

Exécutez la commande suivante pour afficher les statistiques du GPU en temps réel :

```bash
watch -n 1 nvidia-smi
```

![Terminal affichant la sortie de nvidia-smi avec l’utilisation de la mémoire GPU et la température](../_images/nvidia-smi-monitoring.png)

Cet utilitaire se rafraîchit chaque seconde et affiche l’utilisation de la mémoire, le taux d’utilisation du GPU et la température. Sur une RTX 4090 avec la configuration de ce guide, vous devriez observer :

- **Utilisation de la mémoire :** 18 à 22 Go sur les 24 Go disponibles
- **Utilisation du GPU :** 90 % à 100 % pendant les étapes d’entraînement
- **Température :** 60 °C à 80 °C selon le refroidissement de l’hôte

**Résoudre les problèmes courants :**

**Mémoire proche de 24 Go :** si l’utilisation de la mémoire touche régulièrement le plafond, réduisez le paramètre `BATCH_SIZE` de votre script à 2 ou 1. Vous pouvez aussi réduire `MAX_SEQ_LENGTH` à 256. Dans les deux cas, il faut relancer l’entraînement.

**Utilisation du GPU proche de 0 % :** c’est généralement le signe d’un goulot d’étranglement au chargement des données. Le CPU n’alimente pas le GPU assez vite. C’est plus rare sur les nœuds équipés de NVMe, mais cela peut arriver avec de très gros jeux de données. Envisagez de convertir votre jeu de données dans un format plus efficace (Arrow/Parquet) avant le transfert.

**Température au-delà de 85 °C :** certains hôtes font tourner leurs GPU dans des boîtiers mal ventilés. Une température élevée prolongée peut déclencher un bridage thermique qui ralentit l’entraînement. Si la température dépasse régulièrement 85 °C, envisagez de mettre fin à la location et de choisir un autre nœud. Les dégâts matériels sont le problème de l’hôte, mais le temps perdu et les checkpoints corrompus sont les vôtres.

**Lire la courbe de loss :**

Votre script d’entraînement affiche une valeur de loss toutes les 10 étapes. Ce nombre mesure à quel point les prédictions du modèle sont « fausses » : plus il est bas, mieux c’est. Vous devriez observer :

- **Loss initiale :** généralement entre 1,5 et 3,0 selon votre jeu de données
- **Tendance :** une baisse régulière sur les premières centaines d’étapes
- **Loss finale :** généralement entre 0,5 et 1,5 pour un entraînement bien configuré

Si la loss stagne d’emblée (aucune baisse après 100 étapes), votre learning rate est peut-être trop faible. Si elle oscille fortement ou augmente, il est trop élevé. La valeur par défaut de `2e-4` convient à la plupart des jeux de données, mais un ajustement peut s’avérer nécessaire.

Si la loss baisse régulièrement puis grimpe soudain à des valeurs très élevées (10 ou plus), votre jeu de données contient probablement des exemples mal formés. Arrêtez l’entraînement, cherchez dans votre fichier JSONL des erreurs d’encodage ou des caractères mal échappés, puis relancez.

Un fine-tuning classique sur 1 000 exemples se termine en 30 à 60 minutes sur une RTX 4090. Au-delà, la durée augmente de façon à peu près linéaire : 10 000 exemples demandent 5 à 10 heures.

## Étape 6 : récupérer votre modèle et nettoyer l’environnement

Une fois l’entraînement terminé, vos poids affinés se trouvent sous forme d’adaptateur LoRA dans le répertoire défini par `OUTPUT_NAME`. Cet adaptateur est compact, en général 100 à 500 Mo, contre 16 Go pour le modèle de base complet.

Vérifiez d’abord que les fichiers de l’adaptateur sont bien là :

```bash
ls -la ~/llama3-finetune/llama-3-8b-custom/
```

Vous devriez voir notamment `adapter_config.json`, `adapter_model.safetensors` et les fichiers du tokenizer.

**Ne fusionnez pas l’adaptateur sur le nœud loué.** La fusion combine les poids LoRA avec le modèle de base pour produire un modèle affiné autonome. Cette opération nécessite de charger en mémoire le modèle de base complet en 16 bits, ce qui peut dépasser la VRAM disponible sur une carte de 24 Go. Faites la fusion sur votre propre infrastructure, ou chargez simplement l’adaptateur avec le modèle de base au moment de l’inférence. La bibliothèque PEFT s’en charge sans difficulté :

```python
from peft import PeftModel
from transformers import AutoModelForCausalLM

base_model = AutoModelForCausalLM.from_pretrained(
    "meta-llama/Llama-3.1-8B",
    device_map="auto",
)
model = PeftModel.from_pretrained(base_model, "./llama-3-8b-custom")
```

Pour télécharger votre adaptateur, revenez à votre **terminal local** (pas à la session SSH) et exécutez :

```bash
scp -r -P 22345 user@203.0.113.42:~/llama3-finetune/llama-3-8b-custom ./
```

L’option `-r` copie récursivement tout le répertoire. Vérifiez que le transfert s’est bien déroulé en comparant la taille des fichiers en local et à distance.

**Nettoyer l’environnement distant :**

C’est cette étape qui distingue les professionnels des amateurs. Votre nœud loué contient maintenant votre jeu de données propriétaire, votre code d’entraînement et les poids du modèle en cache. Laisser ces éléments sur une machine que vous ne contrôlez pas va à l’encontre des règles de base de la sécurité opérationnelle.

Revenez à votre session SSH sur le nœud loué et exécutez les commandes suivantes :

```bash
# Remove your working directory and all contents
rm -rf ~/llama3-finetune

# Clear the Hugging Face cache (contains downloaded model weights)
rm -rf ~/.cache/huggingface

# Clear Python package cache
rm -rf ~/.cache/pip

# Clear bash history
history -c
cat /dev/null > ~/.bash_history

# Clear any potential swap residue (may require sudo depending on node config)
sync
```

Si le nœud dispose de `shred` et que vous voulez une garantie supplémentaire que les fichiers supprimés ne pourront pas être récupérés :

```bash
# Secure deletion (slower but more thorough)
find ~/llama3-finetune -type f -exec shred -u {} \;
rm -rf ~/llama3-finetune
```

Déconnectez-vous de la session SSH :

```bash
exit
```

Retournez sur le tableau de bord de la marketplace et mettez fin à la location, y compris à tout volume de stockage, pour ne plus être facturé.

## Faire de l’inférence avec votre modèle affiné

Une fois l’adaptateur téléchargé sur votre machine locale, vous pouvez faire de l’inférence sans aucune dépendance au cloud. Voici un exemple minimal :

```python
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer, BitsAndBytesConfig
from peft import PeftModel

# Quantization config (same as training)
bnb_config = BitsAndBytesConfig(
    load_in_4bit=True,
    bnb_4bit_quant_type="nf4",
    bnb_4bit_compute_dtype=torch.float16,
)

# Load base model
base_model = AutoModelForCausalLM.from_pretrained(
    "meta-llama/Llama-3.1-8B",
    quantization_config=bnb_config,
    device_map="auto",
)

# Load your fine-tuned adapter
model = PeftModel.from_pretrained(base_model, "./llama-3-8b-custom")

# Load tokenizer
tokenizer = AutoTokenizer.from_pretrained("meta-llama/Llama-3.1-8B")

# Generate a response
prompt = "### Instruction: Summarize the contract clause.\n\n### Input: The Licensee shall not reverse engineer, decompile, or disassemble the Software.\n\n### Response:"

inputs = tokenizer(prompt, return_tensors="pt").to("cuda")
outputs = model.generate(**inputs, max_new_tokens=100, temperature=0.7)
response = tokenizer.decode(outputs[0], skip_special_tokens=True)

print(response)
```

Pour un déploiement en production, vous pouvez exposer ce code via une API avec FastAPI ou Flask, ou le déployer avec un serveur d’inférence comme vLLM ou Text Generation Inference (TGI). Nous les comparons dans [Ollama vs vLLM vs TGI sur une RTX 4090](/fr/ollama-vs-vllm-vs-tgi-rtx-4090-benchmark/).

## Conclusion

Vous avez affiné un grand modèle de langage sur des données propriétaires, en gardant ces données sur une seule machine et le moins longtemps possible. Sans signer de contrat entreprise, et sans donner à un géant de la tech l’accès à votre propriété intellectuelle.

Le coût total de l’opération, pour un entraînement de deux heures sur une RTX 4090 à 0,45 $ de l’heure, est de quatre-vingt-dix cents. Une seule A10G sur AWS coûte environ 1,01 $ de l’heure : l’entraînement lui-même n’y est donc pas cher non plus. La différence, ce sont la demande de quota et l’installation.

Surtout, votre jeu de données n’est jamais passé par un service de stockage, et il a été supprimé de la machine louée une fois le travail terminé.

L’ère de la dépendance aux API propriétaires touche à sa fin. Les organisations qui ont besoin de confidentialité, les chercheurs attachés à leur souveraineté et les développeurs qui veulent garder le contrôle disposent d’une alternative. Les GPU loués leur rendent la maîtrise de l’infrastructure, des coûts et des données.

Votre modèle affiné se trouve désormais sur du matériel que vous contrôlez. La façon de le déployer, les personnes qui y ont accès et les usages auxquels il sert ne dépendent que de vous.

---

## À lire ensuite

Ce guide couvre l’essentiel du fine-tuning privé de LLM. Les ressources suivantes approfondissent des sujets connexes :

**Comprendre les coûts :**

- [Comparatif des prix de location de GPU 2026](/fr/gpu-rental-pricing-comparison-2026/) : analyse des coûts sur les marketplaces et les grands clouds
- [Le coût réel de la location d’un GPU](/fr/hidden-fees-in-gpu-rental/) : les postes de coût que les pages de tarifs ne mettent pas en avant

**Bien démarrer :**

- [Ce qu’il faut pour louer un GPU en 2026](/fr/what-you-need-to-rent-a-gpu/) : inscription, vérification et paiement sur chaque plateforme
- [Comment sécuriser votre jeu de données sur un nœud GPU public](/fr/how-to-secure-dataset-on-public-gpu-node/) : bonnes pratiques de sécurité avant, pendant et après l’entraînement

**Comparer les options :**

- [Comparatif RunPod vs Vast.ai](/fr/runpod-vs-vastapi-comparison/) : ce qui distingue les deux plus grandes marketplaces
- [GPUFlow vs Vast.ai vs RunPod vs SaladCloud](/fr/gpuflow-vs-vast-ai-vs-runpod/) : machines, conteneurs et clés API comparés
