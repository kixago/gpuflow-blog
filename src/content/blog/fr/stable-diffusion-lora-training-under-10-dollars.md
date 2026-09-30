---
title: "Entraîner un LoRA Stable Diffusion pour moins de 10 $ sur un GPU loué"
description: "Entraîner un LoRA SDXL ou Flux sur une RTX 4090 louée pour bien moins de 10 $ : choix du GPU selon la VRAM, légendes, réglages sd-scripts et ai-toolkit, et un calcul de coût détaillé."
excerpt: "Un entraînement de LoRA SDXL sur une RTX 4090 louée coûte environ 0,35 $ à 0,80 $ en septembre 2026. Voici quel GPU choisir, comment préparer et légender les images, la commande d'entraînement exacte, et où part réellement l'argent."
pubDate: 2026-02-11
updatedDate: 2026-09-30
locale: "fr"
category: "tutorials"
featured: false
draft: false
author: "GPUFlow Team"
heroImage: "../_images/stable-diffusion-lora-training-guide.jpg"
heroImageAlt: "Illustration de personnes devant un grand écran affichant un schéma de réseau LoRA, à côté d'une baie de serveurs et d'un panneau comparant des images d'essai issues de deux époques d'entraînement"
faq:
  - question: "Combien coûte l'entraînement d'un LoRA sur un GPU loué ?"
    answer: "En septembre 2026, une RTX 4090 se louait environ 0,31 $ de l'heure sur Vast.ai et 0,74 $ de l'heure sur la page de tarifs de RunPod. Une session LoRA SDXL d'environ 65 minutes, installation et tests compris, coûte donc à peu près de 0,34 $ à 0,80 $."
  - question: "Combien de VRAM faut-il pour entraîner un LoRA SDXL ?"
    answer: "Selon la documentation de sd-scripts, l'entraînement d'un LoRA SDXL tient dans 8 Go de mémoire GPU, 10 Go recommandés, à condition de n'entraîner que le U-Net, de mettre en cache les latents et les sorties des encodeurs de texte, et d'activer le gradient checkpointing. Une carte de 24 Go comme une RTX 3090 ou 4090 permet d'entraîner en 1024x1024 sans se battre avec la mémoire."
  - question: "Peut-on entraîner un LoRA Flux sur une RTX 4090 ?"
    answer: "Oui. ai-toolkit fournit des configurations d'exemple FLUX.1 prévues pour les cartes de 24 Go, et sd-scripts documente des réglages FLUX.1 jusqu'à 8 Go grâce au block swapping. Le guide de Black Forest Labs indique qu'un entraînement LoRA FLUX.2 [klein] de 1 800 pas sur une RTX 4090 prend moins d'une heure."
  - question: "Combien d'images faut-il pour entraîner un LoRA ?"
    answer: "Pour un personnage, un objet ou un style, 15 à 40 bonnes images est une fourchette courante ; Black Forest Labs recommande 15 à 40 images partageant un même rendu pour FLUX.2 [klein]. Des images nettes, variées et bien légendées comptent plus que la quantité."
  - question: "Quel outil choisir pour entraîner un LoRA : kohya_ss, OneTrainer ou ai-toolkit ?"
    answer: "Les trois fonctionnent. sd-scripts de kohya est la référence en ligne de commande et kohya_ss y ajoute une interface web ; OneTrainer a une interface de bureau et un légendage intégré ; ai-toolkit a une interface web, un modèle de déploiement RunPod officiel et prend en charge tôt les nouveaux modèles comme FLUX.2 et Qwen-Image."
  - question: "Peut-on entraîner un LoRA sur GPUFlow ?"
    answer: "Non. GPUFlow loue une API de chat compatible OpenAI sur le GPU d'un fournisseur, sans shell, sans SSH et sans accès aux fichiers : impossible d'y lancer un script d'entraînement. Utilisez une plateforme qui vous loue la machine, comme Vast.ai ou RunPod."
---

Entraîner un LoRA pour SDXL ou pour un petit modèle Flux coûte bien moins de 10 $ sur un GPU loué. En septembre 2026, une RTX 4090 se loue environ 0,31 $ de l'heure sur Vast.ai et 0,74 $ de l'heure sur RunPod, et une session LoRA SDXL, installation et tests compris, prend un peu plus d'une heure. Cela fait 0,34 $ à 0,80 $ par tentative : un budget de 10 $ couvre une douzaine d'essais.

L'argent n'est pas le plus difficile. Les images, les légendes et savoir quand s'arrêter, si. Ce guide couvre tout cela, avec des commandes prêtes à copier. Prix et versions des outils vérifiés en septembre 2026 ; les sources sont en fin d'article.

## Le processus en cinq étapes

<figure>
<svg viewBox="0 0 720 250" role="img" aria-labelledby="d1-title" xmlns="http://www.w3.org/2000/svg" font-family="system-ui, sans-serif" font-size="15">
<title id="d1-title">Processus d'entraînement d'un LoRA : images, légendes, entraînement, test, utilisation, avec un retour aux images quand le résultat ne convient pas</title>
<defs><marker id="d1-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#6366f1"/></marker></defs>
<rect width="720" height="250" fill="#ffffff"/>
<line x1="20" y1="40" x2="280" y2="40" stroke="#16a34a" stroke-width="2"/>
<text x="150" y="30" text-anchor="middle" fill="#16a34a" font-size="13">Gratuit : sur votre PC</text>
<line x1="300" y1="40" x2="560" y2="40" stroke="#f97316" stroke-width="2"/>
<text x="430" y="30" text-anchor="middle" fill="#f97316" font-size="13">Facturé : sur le GPU loué</text>
<rect x="20" y="60" width="120" height="70" rx="10" fill="#eef2ff" stroke="#6366f1" stroke-width="2"/>
<text x="80" y="90" text-anchor="middle" fill="#1e1b4b" font-weight="600">Images</text>
<text x="80" y="112" text-anchor="middle" fill="#64748b" font-size="13">15 à 40 images</text>
<rect x="160" y="60" width="120" height="70" rx="10" fill="#eef2ff" stroke="#6366f1" stroke-width="2"/>
<text x="220" y="90" text-anchor="middle" fill="#1e1b4b" font-weight="600">Légendes</text>
<text x="220" y="112" text-anchor="middle" fill="#64748b" font-size="13">un .txt chacune</text>
<rect x="300" y="60" width="120" height="70" rx="10" fill="#eef2ff" stroke="#6366f1" stroke-width="2"/>
<text x="360" y="90" text-anchor="middle" fill="#1e1b4b" font-weight="600">Entraîner</text>
<text x="360" y="112" text-anchor="middle" fill="#64748b" font-size="13">sd-scripts</text>
<rect x="440" y="60" width="120" height="70" rx="10" fill="#eef2ff" stroke="#6366f1" stroke-width="2"/>
<text x="500" y="90" text-anchor="middle" fill="#1e1b4b" font-weight="600">Tester</text>
<text x="500" y="112" text-anchor="middle" fill="#64748b" font-size="13">grille d'essais</text>
<rect x="580" y="60" width="120" height="70" rx="10" fill="#eef2ff" stroke="#6366f1" stroke-width="2"/>
<text x="640" y="90" text-anchor="middle" fill="#1e1b4b" font-weight="600">Utiliser</text>
<text x="640" y="112" text-anchor="middle" fill="#64748b" font-size="13">ComfyUI, Forge</text>
<line x1="140" y1="95" x2="158" y2="95" stroke="#6366f1" stroke-width="2" marker-end="url(#d1-arrow)"/>
<line x1="280" y1="95" x2="298" y2="95" stroke="#6366f1" stroke-width="2" marker-end="url(#d1-arrow)"/>
<line x1="420" y1="95" x2="438" y2="95" stroke="#6366f1" stroke-width="2" marker-end="url(#d1-arrow)"/>
<line x1="560" y1="95" x2="578" y2="95" stroke="#6366f1" stroke-width="2" marker-end="url(#d1-arrow)"/>
<path d="M500,130 L500,180 L80,180 L80,134" fill="none" stroke="#f97316" stroke-width="2" stroke-dasharray="6 4" marker-end="url(#d1-arrow)"/>
<text x="290" y="205" text-anchor="middle" fill="#1e1b4b" font-size="13">Pas bon ? Corrigez les images ou les légendes, puis relancez</text>
<text x="360" y="235" text-anchor="middle" fill="#64748b" font-size="13">L'essentiel de la qualité vient des deux premières étapes, qui ne coûtent rien</text>
</svg>
<figcaption>Préparez les images et les légendes avant de louer. Le GPU n'est facturé que pour l'entraînement et les tests, et un mauvais résultat vous renvoie en général aux images, pas aux réglages.</figcaption>
</figure>

## Ce qu'est un LoRA et pourquoi c'est bon marché

LoRA (Low-Rank Adaptation) gèle le modèle de base et entraîne deux petites matrices à côté de certaines de ses couches. L'article d'origine rapportait 10 000 fois moins de paramètres entraînables et 3 fois moins de mémoire GPU qu'un fine-tuning complet de GPT-3 175B. Les modèles d'image fonctionnent de la même façon : le checkpoint de base SDXL est un fichier de 6,9 Go, tandis que le LoRA que vous entraînez est un petit fichier séparé, chargé par-dessus avec l'intensité de votre choix.

C'est pour cela qu'un seul GPU grand public suffit, et qu'un entraînement se compte en dizaines de minutes plutôt qu'en jours.

## Choisir un GPU selon sa VRAM

La VRAM décide de ce que vous pouvez entraîner. La vitesse décide du nombre de minutes facturées : une carte plus rapide et plus chère à l'heure peut revenir à peu près au même prix par entraînement.

| Famille de modèles | Minimum documenté | Confortable | Remarques |
| --- | --- | --- | --- |
| SD 1.5 | 8 Go | 12 Go et plus | Entraînement en 512x512, le moins cher et le plus rapide |
| SDXL | 8 Go (10 Go recommandés) | 24 Go | U-Net seul, latents et sorties des encodeurs de texte en cache |
| FLUX.1 [dev] (12B) | 8 Go avec beaucoup de block swapping | 24 Go | sd-scripts documente des réglages pour 24, 16, 12, 10 et 8 Go |
| FLUX.2 [klein] 4B/9B | non précisé | 24 Go | BFL : environ 13 Go de poids bf16, un entraînement LoRA tient sous 24 Go |

Les réglages basse VRAM fonctionnent, mais ils sont lents. C'est en faisant passer des blocs du transformer entre le GPU et la RAM système que sd-scripts fait tenir FLUX.1 dans 8 à 16 Go, et chaque échange coûte du temps que vous payez. Sur une machine louée, une carte de 24 Go est le choix raisonnable par défaut : une RTX 3090 ou 4090. La RTX 5090 (32 Go) convient aussi, mais sd-scripts précise qu'elle demande PyTorch 2.8.0 avec CUDA 12.8 ou 12.9 : vérifiez que votre modèle de déploiement embarque une pile assez récente.

![Une carte graphique ASUS TUF à trois ventilateurs, posée sur une étagère blanche](../_images/test-hero.jpg)

Les cartes de data center sont plus rapides, mais RunPod affiche une A100 80 Go à 1,59 $ de l'heure, plus du double d'une 4090. Pour un LoRA sur 20 ou 30 images, le gain de vitesse compense rarement ; elles ont plus de sens pour de gros jeux de données ou des fine-tunings complets.

## Où louer, et combien ça coûte

Il vous faut une plateforme qui vous donne une machine : un shell ou un notebook Jupyter, un disque et un moyen de copier des fichiers dans les deux sens. Vast.ai et RunPod sont les deux choix les plus courants pour ce genre de travail.

| GPU | VRAM | Vast.ai (à partir de) | Page de tarifs RunPod | RunPod, moins cher relevé |
| --- | --- | --- | --- | --- |
| RTX 3090 | 24 Go | environ 0,11–0,13 $/h | 0,50 $/h | 0,22 $/h |
| RTX 4090 | 24 Go | environ 0,31–0,33 $/h | 0,74 $/h | 0,34 $/h |
| RTX 5090 | 32 Go | environ 0,41–0,47 $/h | 0,99 $/h | 0,69 $/h |

Prix de septembre 2026. Les colonnes « Vast.ai (à partir de) » et « RunPod, moins cher relevé » viennent du suivi de prix de getdeploying.com ; la colonne du milieu vient de la page de tarifs de RunPod. Sur Vast.ai, chaque hôte fixe ses prix : les offres que vous verrez varient selon la localisation et le score de fiabilité.

Les deux facturent à la seconde. Les frais annexes diffèrent, et ils pèsent plus sur une tâche d'une heure que le tarif horaire ne le laisse penser :

- **Vast.ai** facture le stockage « tant que votre instance existe, quel que soit son état », et facture la bande passante à l'octet, au tarif fixé par chaque hôte. Télécharger un modèle de base de 7 Go chez un hôte à bande passante chère finit par compter. Supprimez l'instance, ne vous contentez pas de l'arrêter.
- **RunPod** facture le disque de conteneur 0,10 $ par Go et par mois pendant que le pod tourne, rien une fois arrêté, et 0,20 $ par Go et par mois pour un volume disque arrêté. Le transfert de données, entrant comme sortant, est gratuit.

Les deux proposent des modèles de déploiement prêts à l'emploi. L'auteur d'ai-toolkit maintient un modèle RunPod officiel, et le README de kohya_ss cite RunPod parmi les configurations prises en charge. Un modèle de déploiement vous épargne au moins dix minutes d'installation de PyTorch sur du temps facturé. Pour une comparaison de prix plus large, voir [GPUFlow, Vast.ai, RunPod et SaladCloud comparés](/fr/gpuflow-vs-vast-ai-vs-runpod/) et [le vrai coût de la location d'un GPU](/fr/hidden-fees-in-gpu-rental/).

## Préparer les images et les légendes

Faites tout cela sur votre propre ordinateur, avant de louer quoi que ce soit.

### Les images

- **Le nombre.** 15 à 40 images pour une personne, un objet ou un style. Black Forest Labs recommande « 15 à 40 images qui partagent un même rendu » pour FLUX.2 [klein]. Plus n'est pas mieux si les images en plus sont moins bonnes.
- **Cohérence et variété.** Chaque image doit montrer le concept. Tout le reste doit varier : angle, éclairage, arrière-plan, cadrage. Si toutes les photos de votre produit le montrent sur la même table blanche, le LoRA apprend la table.
- **La qualité.** Nettes, bien exposées, sans filigrane ni texte incrusté. Le LoRA apprend le bruit et les artefacts JPEG aussi fidèlement que le reste.
- **La résolution.** Au moins 1024 pixels sur le petit côté pour SDXL et Flux, 512 pour SD 1.5. Inutile de recadrer en carré : avec le bucketing activé, sd-scripts regroupe les images par format.

### Les légendes

Chaque image a un fichier texte du même nom (`photo01.jpg`, `photo01.txt`). La légende indique au modèle ce que les mots expliquent déjà, pour que le LoRA apprenne ce qu'ils n'expliquent pas. Placez d'abord un mot déclencheur rare, puis décrivez tout ce qui doit rester modifiable :

```text
zxq_mug, a ceramic coffee mug on a wooden desk, morning light from the left, shallow depth of field
```

Deux outils écrivent un premier jet à votre place :

- **WD14 tagger**, fourni avec sd-scripts, produit des tags séparés par des virgules. Bien adapté aux modèles de style anime et aux fine-tunes SDXL entraînés sur des tags :

  ```bash
  python finetune/tag_images_by_wd14_tagger.py --onnx \
    --repo_id SmilingWolf/wd-swinv2-tagger-v3 --batch_size 4 /workspace/dataset/img
  ```

- **JoyCaption**, un modèle de légendage ouvert (Apache 2.0) conçu pour l'entraînement de modèles de diffusion, écrit des phrases en langage naturel, qui conviennent mieux à Flux que des tags. Son README indique qu'il demande environ 17 Go de VRAM en bf16, avec des versions 8 bits et 4 bits pour les cartes plus petites.

OneTrainer intègre aussi le légendage avec BLIP, BLIP2 et WD-1.4. Quel que soit l'outil qui écrit le premier jet, relisez chaque légende et corrigez-la. C'est la demi-heure la plus rentable de tout le projet.

## Choisir un outil d'entraînement

Quatre outils couvrent presque tous les besoins. Tous sont gratuits et open source.

| Outil | Interface | Modèles (septembre 2026) | Bien pour |
| --- | --- | --- | --- |
| kohya-ss/sd-scripts | Ligne de commande | SD 1.x/2.x, SDXL, SD3/3.5, FLUX.1, Lumina, HunyuanImage-2.1, Anima | Entraînements reproductibles, contrôle total |
| bmaltais/kohya_ss | Interface web par-dessus sd-scripts | Les mêmes que sd-scripts | sd-scripts sans retenir les options |
| Nerogar/OneTrainer | Interface de bureau et CLI | SD 1.5 à 3.5, SDXL, FLUX.1, FLUX.2, Chroma, Qwen Image et d'autres | Légendage et masquage intégrés |
| ostris/ai-toolkit | Interface web et configurations YAML | SD 1.5, SDXL, FLUX.1, FLUX.2, Qwen-Image, vidéo Wan et d'autres | Flux et modèles récents, modèle RunPod |

sd-scripts en est à la version 0.11.1 (juin 2026), est testé avec Python 3.10 et demande PyTorch 2.6.0 ou plus récent. ai-toolkit recommande Python 3.12 et installe actuellement PyTorch 2.13.0 compilé pour CUDA 13.0. OneTrainer demande Python 3.10 à 3.13.

J'utilise sd-scripts pour SDXL, parce que la ligne de commande contient toute la configuration, ce qui rend les entraînements faciles à refaire et à comparer, et ai-toolkit pour Flux.

## Entraîner un LoRA SDXL avec sd-scripts

Sur une instance Linux neuve avec un pilote NVIDIA, l'installation tient en quelques commandes :

```bash
git clone https://github.com/kohya-ss/sd-scripts.git
cd sd-scripts
python -m venv venv && source venv/bin/activate
pip install torch==2.6.0 torchvision==0.21.0 --index-url https://download.pytorch.org/whl/cu124
pip install --upgrade -r requirements.txt
accelerate config default --mixed_precision bf16

# SDXL base model (not gated, CreativeML Open RAIL++-M license)
hf download stabilityai/stable-diffusion-xl-base-1.0 sd_xl_base_1.0.safetensors \
  --local-dir /workspace/models
```

Copiez votre dossier d'images et de légendes `.txt` dans `/workspace/dataset/img` avec `scp`, `rsync` ou le navigateur de fichiers de la plateforme. Décrivez ensuite le jeu de données dans `/workspace/dataset.toml` :

```toml
[general]
caption_extension = ".txt"
enable_bucket = true

[[datasets]]
resolution = 1024
batch_size = 1

  [[datasets.subsets]]
  image_dir = "/workspace/dataset/img"
  num_repeats = 10
```

Puis lancez l'entraînement :

```bash
accelerate launch --num_cpu_threads_per_process 1 sdxl_train_network.py \
  --pretrained_model_name_or_path=/workspace/models/sd_xl_base_1.0.safetensors \
  --dataset_config=/workspace/dataset.toml \
  --output_dir=/workspace/output --output_name=zxq_mug \
  --save_model_as=safetensors \
  --network_module=networks.lora --network_dim=16 --network_alpha=8 \
  --network_train_unet_only \
  --optimizer_type=AdamW8bit --learning_rate=1e-4 \
  --lr_scheduler=constant_with_warmup --lr_warmup_steps=100 \
  --max_train_epochs=8 --save_every_n_epochs=2 \
  --mixed_precision=bf16 --save_precision=bf16 \
  --cache_latents --cache_latents_to_disk --cache_text_encoder_outputs \
  --gradient_checkpointing --sdpa --seed=42 \
  --sample_prompts=/workspace/prompts.txt --sample_every_n_epochs=2
```

`prompts.txt` contient un prompt de test par ligne, avec les options en ligne de sd-scripts pour la taille, la seed et le nombre de pas :

```text
zxq_mug, a ceramic coffee mug on a kitchen counter --w 1024 --h 1024 --d 42 --s 28
zxq_mug, a ceramic coffee mug held by a hiker on a mountain top --w 1024 --h 1024 --d 42 --s 28
```

### Ce que font les réglages

- **Les pas.** Images × répétitions × époques ÷ taille de batch. Avec 25 images : 25 × 10 × 8 = 2 000 pas.
- **`network_dim` 16, `network_alpha` 8.** La capacité du LoRA. 16 suffit largement pour un objet ou un visage ; un style demande parfois 32. Un rang plus élevé surapprend plus vite et produit des fichiers plus gros.
- **`--network_train_unet_only`.** Obligatoire ici : sd-scripts refuse de mettre en cache les sorties des encodeurs de texte tout en entraînant ces encodeurs, et sa documentation qualifie de toute façon l'entraînement du U-Net seul de « fortement recommandé » pour les LoRA SDXL.
- **Mise en cache et gradient checkpointing.** C'est ce qui fait tenir SDXL dans 8 à 10 Go. La mise en cache désactive aussi le mélange et l'abandon aléatoire des légendes (caption shuffle et caption dropout), d'où leur absence du fichier de jeu de données.
- **`learning_rate` 1e-4 avec AdamW8bit.** La valeur de l'exemple LoRA SDXL de sd-scripts. Si les images d'essai bougent à peine après quatre époques, essayez 2e-4. Si elles deviennent des copies de vos images d'entraînement, baissez-la ou arrêtez plus tôt.
- **Un checkpoint toutes les 2 époques.** Vous obtenez des fichiers pour les époques 2, 4, 6 et 8, et vous gardez le meilleur. Le meilleur LoRA n'est souvent pas le dernier.

### Combien de temps ça prend

Des utilisateurs, dans un ticket de kohya_ss, ont rapporté environ 1,1 à 1,4 itération par seconde pour un entraînement LoRA SDXL en 1024x1024, batch de 1, sur une RTX 4090 avec gradient checkpointing. À cette vitesse, 2 000 pas prennent 24 à 30 minutes, plus quelques minutes pour mettre les latents en cache. Le même ticket montre à quel point tout se dégrade quand une carte manque de VRAM et déborde sur la mémoire partagée : 50 secondes ou plus par pas. Si votre vitesse est très en dessous de la fourchette attendue, regardez `nvidia-smi` avant d'accuser les réglages.

## Flux et les modèles récents avec ai-toolkit

Pour Flux, ai-toolkit est la voie la plus simple. Sur une machine louée :

```bash
git clone https://github.com/ostris/ai-toolkit.git
cd ai-toolkit
python3 -m venv venv && source venv/bin/activate
pip3 install --no-cache-dir torch==2.13.0 torchvision==0.28.0 torchaudio==2.11.0 \
  --index-url https://download.pytorch.org/whl/cu130
pip3 install -r requirements.txt
cp config/examples/train_lora_flux_24gb.yaml config/zxq_mug.yml
# edit the dataset path, trigger word and steps, then:
python run.py config/zxq_mug.yml
```

Vous pouvez aussi lancer l'interface web avec `cd ui && npm run build_and_start` et ouvrir le port 8675. Sur un serveur accessible par d'autres, définissez d'abord un mot de passe dans `AI_TOOLKIT_AUTH`, comme le recommande le README.

Deux points de licence à connaître avant de choisir un modèle Flux :

- **FLUX.1 [dev]** est en accès restreint sur Hugging Face. Vous acceptez la FLUX.1 [dev] Non-Commercial License et utilisez un token de lecture Hugging Face pour le télécharger. Sa fiche de modèle indique que les images générées peuvent être utilisées commercialement ; les poids et votre LoRA relèvent de la licence non commerciale.
- **FLUX.2 [klein] 4B** est sous Apache 2.0 et en libre accès. La version 9B utilise la FLUX Non-Commercial License.

Black Forest Labs a publié en juin 2026 un guide pour entraîner des LoRA FLUX.2 [klein] avec ai-toolkit : un entraînement de 1 800 pas sur une RTX 4090 « prend moins d'une heure », et ils conseillent de regarder les checkpoints entre les pas 750 et 1 500. Je n'ai pas trouvé de mesure publiée aussi solide pour FLUX.1 [dev], trois fois plus gros que klein 4B ; prévoyez plus de temps et chronométrez votre premier entraînement.

## Tester le LoRA avant d'arrêter de payer

Regardez les images d'essai de chaque époque sauvegardée pendant que la machine tourne encore. Elles vous montrent, sans frais, si le LoRA a appris le concept et à partir de quand il a commencé à surapprendre. Téléchargez ensuite les checkpoints qui vous plaisent :

```bash
rsync -avP user@your-instance:/workspace/output/*.safetensors ./loras/
```

Chez vous, placez le fichier dans le dossier `models/loras` de ComfyUI ou `models/Lora` de Forge, et testez avec des seeds fixes :

- **L'intensité.** Essayez 0,6, 0,8 et 1,0. Certains LoRA rendent mieux sous 1,0.
- **La souplesse.** Placez le déclencheur dans des scènes absentes de vos données. Une tasse au sommet d'une montagne, un visage dans un tableau. S'il ne fonctionne que dans des scènes proches des images d'entraînement, il a surappris : prenez une époque antérieure ou moins de répétitions.
- **Les fuites.** Générez sans le mot déclencheur. Si le concept apparaît quand même, vos légendes ne décrivaient pas assez l'image.

Quand le résultat ne va pas, la correction se trouve en général dans les données : quelques images faibles retirées, ou des légendes qui nomment ce que vous voulez faire varier. Changer le taux d'apprentissage vient en second, pas en premier.

## Le calcul du coût

Un LoRA SDXL, 25 images, 2 000 pas, sur une RTX 4090 :

| Étape | Durée |
| --- | --- |
| Partir d'un modèle de déploiement, installer sd-scripts | 10 min |
| Télécharger SDXL base, envoyer les images, mise en cache | 10 min |
| Entraînement (2 000 pas à 1,1–1,4 it/s) | 30 min |
| Regarder les essais, télécharger les checkpoints, supprimer l'instance | 15 min |
| **Total** | **65 min (1,08 h)** |

- Vast.ai à 0,31 $/h : 1,08 × 0,31 $ = **0,34 $**, plus le stockage et le tarif de bande passante de l'hôte.
- RunPod à 0,74 $/h : 1,08 × 0,74 $ = **0,80 $**. Un disque de conteneur de 50 Go pendant cette heure ajoute 50 × 0,10 $ ÷ 730 heures, soit moins d'un cent.

Un LoRA FLUX.2 [klein] avec une heure d'entraînement et 30 minutes d'installation et de tests revient à 1,5 × 0,74 $ = **1,11 $** sur RunPod, ou 1,5 × 0,31 $ = **0,47 $** sur Vast.ai.

<figure>
<svg viewBox="0 0 720 300" role="img" aria-labelledby="d2-title" xmlns="http://www.w3.org/2000/svg" font-family="system-ui, sans-serif" font-size="15">
<title id="d2-title">Diagramme en barres du coût d'entraînement d'un LoRA sur une RTX 4090 louée, comparé à un budget de 10 dollars</title>
<rect width="720" height="300" fill="#ffffff"/>
<line x1="230" y1="40" x2="230" y2="250" stroke="#e2e8f0" stroke-width="1"/>
<line x1="322" y1="40" x2="322" y2="250" stroke="#e2e8f0" stroke-width="1"/>
<line x1="414" y1="40" x2="414" y2="250" stroke="#e2e8f0" stroke-width="1"/>
<line x1="506" y1="40" x2="506" y2="250" stroke="#e2e8f0" stroke-width="1"/>
<line x1="598" y1="40" x2="598" y2="250" stroke="#e2e8f0" stroke-width="1"/>
<line x1="690" y1="30" x2="690" y2="250" stroke="#f97316" stroke-width="2" stroke-dasharray="6 4"/>
<text x="698" y="22" text-anchor="end" fill="#f97316" font-size="13">Budget de 10 $</text>
<text x="220" y="75" text-anchor="end" fill="#1e1b4b">SDXL, Vast.ai</text>
<rect x="230" y="58" width="15.6" height="26" fill="#16a34a"/>
<text x="253" y="76" fill="#1e1b4b" font-size="13">0,34 $</text>
<text x="220" y="125" text-anchor="end" fill="#1e1b4b">SDXL, RunPod</text>
<rect x="230" y="108" width="36.8" height="26" fill="#6366f1"/>
<text x="275" y="126" fill="#1e1b4b" font-size="13">0,80 $</text>
<text x="220" y="175" text-anchor="end" fill="#1e1b4b">FLUX.2 klein, RunPod</text>
<rect x="230" y="158" width="51.1" height="26" fill="#6366f1"/>
<text x="289" y="176" fill="#1e1b4b" font-size="13">1,11 $</text>
<text x="220" y="225" text-anchor="end" fill="#1e1b4b">5 essais SDXL, RunPod</text>
<rect x="230" y="208" width="184.5" height="26" fill="#6366f1"/>
<text x="422" y="226" fill="#1e1b4b" font-size="13">4,01 $</text>
<line x1="230" y1="250" x2="690" y2="250" stroke="#64748b" stroke-width="1"/>
<text x="230" y="270" text-anchor="middle" fill="#64748b" font-size="13">0 $</text>
<text x="322" y="270" text-anchor="middle" fill="#64748b" font-size="13">2 $</text>
<text x="414" y="270" text-anchor="middle" fill="#64748b" font-size="13">4 $</text>
<text x="506" y="270" text-anchor="middle" fill="#64748b" font-size="13">6 $</text>
<text x="598" y="270" text-anchor="middle" fill="#64748b" font-size="13">8 $</text>
<text x="690" y="270" text-anchor="middle" fill="#64748b" font-size="13">10 $</text>
<text x="460" y="292" text-anchor="middle" fill="#64748b" font-size="13">Coût par session sur une RTX 4090, prix de septembre 2026</text>
</svg>
<figcaption>Même cinq tentatives SDXL séparées au prix affiché de RunPod restent bien en dessous de 10 $. À 0,74 $ de l'heure, 10 $ achètent 13,5 heures de RTX 4090 ; à 0,31 $, environ 32 heures.</figcaption>
</figure>

Ce qui fait vraiment exploser un budget de 10 $, c'est rarement l'entraînement. C'est une instance restée allumée toute la nuit (12 heures à 0,74 $ font 8,88 $), une instance Vast.ai arrêtée qui paie encore son stockage, ou une heure passée à légender des images sur du temps facturé. La facturation à la seconde n'aide que si vous supprimez la machine quand vous avez fini.

## Et GPUFlow dans tout ça

Pour ce travail, GPUFlow ne convient pas. Il loue l'accès à un modèle de langage qu'un fournisseur sert (généralement avec Ollama) sur son propre GPU, via une clé API compatible OpenAI. Il n'y a ni shell, ni SSH, ni accès aux fichiers : impossible d'installer un outil d'entraînement, d'envoyer des images ou de récupérer un LoRA. Et il sert des modèles de chat, pas des modèles d'image. Entraînez sur Vast.ai, RunPod ou une plateforme similaire qui vous loue la machine.

Si vous travaillez sur du texte plutôt que sur des images, la même méthode (louer, entraîner, supprimer) s'applique aux modèles de langage : voir [fine-tuner un LLM en privé sur un GPU loué](/fr/private-llm-fine-tuning-guide/).

## Sources

Toutes vérifiées en septembre 2026.

- Article LoRA : [Hu et al., LoRA: Low-Rank Adaptation of Large Language Models](https://arxiv.org/abs/2106.09685)
- sd-scripts : [README et versions](https://github.com/kohya-ss/sd-scripts), [entraînement LoRA SDXL](https://github.com/kohya-ss/sd-scripts/blob/main/docs/sdxl_train_network.md), [notes SDXL et VRAM](https://github.com/kohya-ss/sd-scripts/blob/main/docs/train_SDXL-en.md), [configuration du jeu de données](https://github.com/kohya-ss/sd-scripts/blob/main/docs/config_README-en.md), [entraînement LoRA FLUX.1](https://github.com/kohya-ss/sd-scripts/blob/main/docs/flux_train_network.md), [WD14 tagger](https://github.com/kohya-ss/sd-scripts/blob/main/docs/wd14_tagger_README-en.md)
- [bmaltais/kohya_ss](https://github.com/bmaltais/kohya_ss), [Nerogar/OneTrainer](https://github.com/Nerogar/OneTrainer), [ostris/ai-toolkit](https://github.com/ostris/ai-toolkit), [JoyCaption](https://github.com/fpgaminer/joycaption)
- Vitesses SDXL sur 4090 : [ticket kohya_ss n° 1288](https://github.com/bmaltais/kohya_ss/issues/1288)
- Black Forest Labs : [fine-tuner FLUX.2 [klein] avec un LoRA en moins de 60 minutes](https://huggingface.co/blog/black-forest-labs/flux-2-klein-lora), fiches de modèle de [FLUX.1 [dev]](https://huggingface.co/black-forest-labs/FLUX.1-dev), [FLUX.2 [klein] 4B](https://huggingface.co/black-forest-labs/FLUX.2-klein-base-4B), [FLUX.2 [klein] 9B](https://huggingface.co/black-forest-labs/FLUX.2-klein-base-9B)
- [Fiche de modèle Stable Diffusion XL base 1.0](https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0)
- Prix : [tarifs RunPod](https://www.runpod.io/pricing), [tarifs des pods et stockage RunPod](https://docs.runpod.io/pods/pricing), [tarifs Vast.ai](https://docs.vast.ai/guides/instances/pricing.md), getdeploying.com pour la [RTX 3090](https://getdeploying.com/reference/cloud-gpu/nvidia-rtx-3090), la [RTX 4090](https://getdeploying.com/reference/cloud-gpu/nvidia-rtx-4090), la [RTX 5090](https://getdeploying.com/reference/cloud-gpu/nvidia-rtx-5090) et [Vast.ai](https://getdeploying.com/vast-ai)
- GPUFlow : [démarrage rapide de l'API](https://docs.gpuflow.app/fr/renters/api-quickstart/)
