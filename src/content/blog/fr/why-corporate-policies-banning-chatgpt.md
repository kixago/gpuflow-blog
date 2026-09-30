---
title: "Pourquoi les entreprises interdisent ChatGPT au travail, et ce qu'elles utilisent à la place"
description: "Les entreprises restreignent les applis de chat IA grand public parce que les salariés y collent des données que l'entreprise n'a aucun contrat pour partager. Les vrais cas, les règles de 2026 et les alternatives qui fonctionnent."
excerpt: "La plupart des interdictions de ChatGPT en entreprise tiennent aux contrats et aux réglages par défaut. Voici ce qui s'est passé chez Samsung, ce que promettent aujourd'hui les offres entreprise, et où va votre prompt dans chaque cas."
pubDate: 2026-02-26
updatedDate: 2026-09-30
locale: "fr"
category: "case-studies"
featured: false
draft: false
author: "GPUFlow Team"
heroImage: "../_images/corporate-ai-policy-restriction.png"
heroImageAlt: "Bureaux d'entreprise avec des symboles de cadenas numériques superposés aux écrans d'ordinateur, illustrant les restrictions d'accès à l'IA"
faq:
  - question: "Pourquoi les entreprises interdisent-elles ChatGPT à leurs salariés ?"
    answer: "Parce que des salariés collent des données de l'entreprise et de ses clients dans un compte grand public avec lequel l'entreprise n'a aucun contrat. Sur les offres grand public de ChatGPT, le réglage par défaut autorise OpenAI à utiliser le contenu pour améliorer ses modèles, et aucun accord de traitement des données ni aucun BAA au sens de HIPAA ne couvre l'entreprise."
  - question: "ChatGPT Enterprise s'entraîne-t-il sur les données de l'entreprise ?"
    answer: "Non, pas par défaut. La page d'OpenAI sur la confidentialité en entreprise indique qu'il n'entraîne pas ses modèles sur les données de ChatGPT Enterprise, Business, Edu ou de l'API, sauf accord explicite du client, et mentionne des audits SOC 2 Type 2 et une durée de conservation réglée par l'administrateur pour Enterprise."
  - question: "Quelles entreprises ont restreint ChatGPT ?"
    answer: "Samsung a restreint l'IA générative sur les appareils de l'entreprise en 2023, après des fuites rapportées de code source et de données internes. Apple, JPMorgan, Bank of America, Citi, Deutsche Bank, Goldman Sachs, Wells Fargo, Walmart et Verizon l'auraient aussi restreinte cette année-là."
  - question: "Le RGPD permet-il de mettre des données clients dans ChatGPT ?"
    answer: "Seulement avec une base légale et un contrat de sous-traitance conforme à l'article 28 du RGPD. Une offre entreprise assortie d'un accord de traitement des données peut remplir ces conditions ; le compte personnel d'un salarié, non, car l'entreprise n'a aucun contrat avec l'éditeur pour ce compte."
  - question: "Quand s'appliquent les règles de l'AI Act européen sur les systèmes à haut risque ?"
    answer: "Depuis l'omnibus IA, entré en vigueur le 27 juillet 2026, les règles sur les systèmes à haut risque autonomes, comme le tri de CV, s'appliquent à partir du 2 décembre 2027, et celles sur l'IA intégrée à des produits réglementés à partir du 2 août 2028. Les obligations de transparence de l'article 50 s'appliquent depuis le 2 août 2026."
  - question: "Peut-on utiliser GPUFlow pour des données confidentielles d'entreprise ?"
    answer: "Non. Sur GPUFlow, le modèle tourne sur l'ordinateur d'un fournisseur : prompts et réponses passent donc en clair par cette machine. Les conditions interdisent aux fournisseurs de les enregistrer, mais c'est une règle contractuelle, pas un blocage technique. N'y envoyez que des données que vous pourriez confier à un inconnu."
---

La plupart des entreprises qui « interdisent ChatGPT » n'ont rien contre l'IA. Ce qu'elles refusent, c'est que des salariés collent des données de l'entreprise dans un compte grand public avec lequel l'entreprise n'a aucun contrat, et où l'éditeur peut par défaut s'en servir pour améliorer ses modèles. La solution habituelle est un outil validé : une offre entreprise avec des clauses de non-entraînement et de conservation, un point d'accès à un modèle dans le compte cloud de l'entreprise, ou un modèle ouvert sur du matériel que l'entreprise exploite elle-même. Avec le bon contrat, les outils publics conviennent à beaucoup de tâches.

Au programme : ce qui s'est réellement passé dans les cas que tout le monde cite, les règles qui s'appliquent en 2026, ce que disent aujourd'hui les conditions entreprise de chaque éditeur, et où va votre texte dans chaque cas. Tout a été vérifié auprès des sources primaires en septembre 2026 ; elles sont listées en fin d'article.

## Ce qui s'est passé chez Samsung et dans les banques

Samsung est le cas que tout le monde cite. Début 2023, sa division semi-conducteurs autorise ses ingénieurs à utiliser ChatGPT. La presse coréenne rapporte ensuite trois incidents distincts : des salariés ont collé du code source pour corriger des bugs, se sont servis de l'outil pour rédiger des comptes rendus de réunion, et ont saisi des mesures d'équipement et des données de rendement. Samsung n'a pas confirmé les détails à l'époque. Fin avril 2023, une note informe le personnel de l'une de ses plus grandes divisions que l'IA générative est temporairement restreinte sur les ordinateurs de l'entreprise. Dans une enquête interne menée le mois précédent, 65 % des répondants se disaient inquiets des risques de sécurité.

Apple a restreint ChatGPT et GitHub Copilot en mai 2023, selon le Wall Street Journal, par crainte que des données confidentielles n'atterrissent chez des développeurs qui entraînent leurs modèles sur les données des utilisateurs. Les mêmes articles citaient JPMorgan, Bank of America, Citi, Deutsche Bank, Goldman Sachs, Wells Fargo, Walmart et Verizon parmi les entreprises ayant restreint ChatGPT.

Deux choses échappent facilement dans ces affaires.

D'abord, personne n'a été piraté. Les données sont allées exactement là où le salarié les a envoyées. L'inquiétude portait sur la suite : qui les garde, combien de temps, si elles servent à entraîner un modèle, et si un tribunal peut obliger l'éditeur à les remettre.

Ensuite, les interdictions ne sont pas restées des interdictions. JPMorgan a construit sa propre plateforme interne, LLM Suite, qui donne au personnel accès à de grands modèles de langage « dans un environnement sécurisé ». Lancée à l'été 2024, elle comptait 200 000 utilisateurs intégrés en huit mois. C'est le schéma habituel : bloquer l'appli grand public, puis fournir un outil validé.

## Quel est le risque réel

Quand un salarié utilise un compte personnel grand public, quatre problèmes distincts s'additionnent.

**L'entraînement par défaut.** Sur ChatGPT Free, Plus et Pro, le contenu peut servir à améliorer les modèles d'OpenAI, sauf si l'utilisateur désactive « Improve the model for everyone » dans Data controls. Si l'utilisateur clique sur le pouce levé ou baissé, toute la conversation peut être utilisée, même après ce refus. Les offres grand public de Claude d'Anthropic utilisent les conversations pour l'entraînement si l'utilisateur autorise l'amélioration des modèles. Que votre code source finisse dans un jeu d'entraînement dépend donc d'un réglage dans le compte de quelqu'un d'autre.

**Une conservation que vous ne maîtrisez pas.** Les données professionnelles sur la plateforme d'OpenAI sont supprimées dans les 30 jours après leur suppression par l'utilisateur, « sauf si la loi nous oblige à les conserver ». Cette dernière clause n'a rien de théorique. Dans le procès intenté par le New York Times, une décision de justice a obligé OpenAI, de juin 2025 au 26 septembre 2025, à conserver des contenus de ChatGPT grand public et de l'API standard qu'il aurait sinon supprimés. Les clients ChatGPT Enterprise, Edu et les clients API en zéro conservation n'étaient pas concernés.

**Aucun contrat.** Juridiquement, c'est le point le plus important. Selon le RGPD, une entreprise qui confie un traitement de données personnelles à un prestataire doit choisir un sous-traitant qui présente des « garanties suffisantes » et être liée à lui par un contrat (article 28). Un établissement de santé américain a besoin d'un BAA (business associate agreement). Le compte personnel d'un salarié n'offre ni l'un ni l'autre : l'infraction a lieu au moment où l'on colle le texte, qu'il y ait fuite ou non.

**Aucune archive.** Les entreprises réglementées doivent superviser et archiver leurs communications professionnelles. Une conversation dans un compte personnel échappe à toutes les archives tenues par le service conformité.

## Les règles applicables en 2026

### RGPD

Des données personnelles de clients ou de salariés européens dans un prompt, c'est un traitement. Il faut une base légale, un contrat de sous-traitance au titre de l'article 28 et une base juridique pour tout transfert hors de l'UE. Pour les éditeurs américains, le Data Privacy Framework UE–États-Unis reste valable : le Tribunal de l'Union européenne a rejeté le recours Latombe le 3 septembre 2025 (affaire T-553/23). Un pourvoi est pendant devant la Cour de justice sous le numéro C-703/25 P : à surveiller.

Les autorités de contrôle ont déjà visé directement les services de chat. La Garante italienne a bloqué temporairement ChatGPT fin mars 2023, puis, en décembre 2024, a infligé à OpenAI une amende de 15 millions d'euros pour avoir traité des données personnelles afin d'entraîner ChatGPT sans base légale adéquate, ne pas avoir notifié une violation de données de mars 2023, manqué de transparence et omis toute vérification de l'âge. OpenAI a jugé l'amende disproportionnée et annoncé faire appel.

### HIPAA

Aux États-Unis, tout service qui reçoit, stocke ou transmet des données de santé protégées sous forme électronique pour le compte d'une entité couverte est un business associate et doit signer un BAA. Le HHS précise qu'un fournisseur cloud qui ne détient que des données chiffrées sans en avoir la clé reste un business associate. OpenAI indique pouvoir signer des BAA pour son API. Le compte ChatGPT personnel d'un médecin n'est couvert par aucun BAA.

### Services financiers

La Regulatory Notice 24-09 de la FINRA (27 juin 2024) indique que ses règles s'appliquent à l'IA générative « exactement comme lorsque les sociétés membres utilisent toute autre technologie ou tout autre outil ». Supervision, communication avec le public et archivage continuent de s'appliquer. La plupart des restrictions bancaires de 2023 en découlaient directement.

### AI Act européen

L'AI Act est entré en vigueur le 1er août 2024. Les interdictions de pratiques prohibées et l'obligation de maîtrise de l'IA s'appliquent depuis le 2 février 2025, et les obligations des fournisseurs de modèles d'IA à usage général depuis le 2 août 2025. L'omnibus IA, règlement (UE) 2026/1744, a été publié le 24 juillet 2026 et est entré en vigueur le 27 juillet 2026. Il a repoussé les échéances pour le haut risque : le 2 décembre 2027 pour les systèmes à haut risque autonomes, dont l'IA utilisée dans le recrutement comme le tri de CV, et le 2 août 2028 pour l'IA intégrée à des produits réglementés. Les obligations de transparence de l'article 50 s'appliquent comme prévu depuis le 2 août 2026, et l'obligation de maîtrise de l'IA a été assouplie en une obligation de prendre des mesures pour la « favoriser ».

Pour une entreprise qui se sert d'un assistant de chat pour rédiger des e-mails, l'AI Act ajoute peu. Si le même assistant se met à classer des candidats, vous déployez un système à haut risque et l'échéance de décembre 2027 vous concerne.

## Ce que promettent les offres entreprise

Chaque grand éditeur vend désormais une offre entreprise dont les réglages par défaut diffèrent de ceux de l'appli grand public. Le tableau résume ce que dit la page de chaque éditeur en septembre 2026.

| Offre | Entraînement sur vos données par défaut ? | Conservation et contrôle | Conformité |
| --- | --- | --- | --- |
| ChatGPT Free, Plus, Pro | Possible, sauf refus de l'utilisateur | Par compte utilisateur | Aucun contrat avec l'entreprise |
| ChatGPT Business, Enterprise, Edu | Non | Durée fixée par les administrateurs de l'espace de travail | SOC 2 Type 2 pour Enterprise et Business |
| API OpenAI | Non | Suppression après 30 jours ; zéro conservation pour les usages éligibles | BAA disponible |
| Claude Team, Enterprise, API | Non | Retours conservés jusqu'à 5 ans ; les propriétaires peuvent désactiver les retours | Conditions commerciales |
| Microsoft 365 Copilot et Copilot Chat | Non, pas utilisées pour entraîner les modèles de fondation | Vos règles de conservation, étiquettes et audits s'appliquent | DPA, EU Data Boundary (modèles Anthropic exclus) |
| Gemini dans Google Workspace | Pas d'entraînement hors de votre domaine sans autorisation | Les contrôles Workspace existants s'appliquent | Prise en charge HIPAA, FedRAMP High |

Les points d'accès aux modèles dans les grands clouds vont plus loin. Microsoft indique que les prompts et les réponses des modèles vendus par Azure dans Microsoft Foundry ne sont « PAS accessibles à OpenAI ni à d'autres fournisseurs » et sont traités dans la zone géographique choisie, sauf si vous optez pour un déploiement Global ou DataZone. Sur Amazon Bedrock, les modèles tournent dans des comptes de déploiement auxquels les fournisseurs de modèles n'ont pas accès : ils ne voient jamais vos prompts ni vos réponses.

Ce qu'une offre entreprise ne change pas : le texte reste sur les serveurs de l'éditeur aussi longtemps que les clauses de conservation le permettent, et une décision de justice peut toujours l'atteindre. C'est la même confiance que vous accordez déjà à vos fournisseurs de messagerie et de documents. Pour la plupart des tâches internes, le compromis est raisonnable. Pour des secrets d'affaires, des données réglementées sans BAA, ou des éléments qu'un contrat client interdit de confier à des sous-traitants, il peut ne pas l'être.

## Où va votre prompt dans chaque cas

La seule façon honnête de comparer les options est de suivre un prompt et de se demander qui peut le lire.

<figure>
<svg viewBox="0 0 720 470" role="img" aria-labelledby="d1-title" xmlns="http://www.w3.org/2000/svg" font-family="system-ui, sans-serif" font-size="15">
<title id="d1-title">Où va le prompt d'un salarié dans cinq configurations d'IA différentes, et ce qui le protège dans chacune</title>
<rect x="0" y="0" width="720" height="470" fill="#ffffff"/>
<text x="325" y="30" text-anchor="middle" fill="#64748b">Où va le texte</text>
<text x="475" y="30" fill="#64748b">Ce qui le protège</text>
<rect x="20" y="200" width="140" height="70" rx="10" fill="#eef2ff" stroke="#6366f1" stroke-width="2"/>
<text x="90" y="231" text-anchor="middle" fill="#1e1b4b">Prompt</text>
<text x="90" y="252" text-anchor="middle" fill="#1e1b4b">du salarié</text>
<line x1="160" y1="235" x2="200" y2="80" stroke="#6366f1" stroke-width="2"/>
<line x1="160" y1="235" x2="200" y2="160" stroke="#6366f1" stroke-width="2"/>
<line x1="160" y1="235" x2="200" y2="240" stroke="#6366f1" stroke-width="2"/>
<line x1="160" y1="235" x2="200" y2="320" stroke="#6366f1" stroke-width="2"/>
<line x1="160" y1="235" x2="200" y2="400" stroke="#6366f1" stroke-width="2"/>
<rect x="200" y="50" width="250" height="60" rx="10" fill="#ffffff" stroke="#f97316" stroke-width="2"/>
<text x="325" y="76" text-anchor="middle" fill="#1e1b4b" font-size="14">Appli de chat grand public</text>
<text x="325" y="97" text-anchor="middle" fill="#64748b" font-size="13">compte perso Free, Plus ou Pro</text>
<text x="475" y="76" fill="#1e1b4b" font-size="13">Entraînement autorisé par défaut</text>
<text x="475" y="97" fill="#1e1b4b" font-size="13">Aucun contrat avec l'entreprise</text>
<rect x="200" y="130" width="250" height="60" rx="10" fill="#eef2ff" stroke="#6366f1" stroke-width="2"/>
<text x="325" y="156" text-anchor="middle" fill="#1e1b4b">Offre entreprise</text>
<text x="325" y="177" text-anchor="middle" fill="#64748b" font-size="13">serveurs de l'éditeur, compte pro</text>
<text x="475" y="156" fill="#1e1b4b" font-size="14">Pas d'entraînement par défaut</text>
<text x="475" y="177" fill="#1e1b4b" font-size="14">DPA, durée de conservation</text>
<rect x="200" y="210" width="250" height="60" rx="10" fill="#eef2ff" stroke="#6366f1" stroke-width="2"/>
<text x="325" y="236" text-anchor="middle" fill="#1e1b4b">Modèle dans votre cloud</text>
<text x="325" y="257" text-anchor="middle" fill="#64748b" font-size="13">Azure Foundry, Amazon Bedrock</text>
<text x="475" y="236" fill="#1e1b4b" font-size="14">Votre tenant, votre région</text>
<text x="475" y="257" fill="#1e1b4b" font-size="13">Invisible pour l'éditeur du modèle</text>
<rect x="200" y="290" width="250" height="60" rx="10" fill="#ffffff" stroke="#16a34a" stroke-width="2"/>
<text x="325" y="316" text-anchor="middle" fill="#1e1b4b">Vos propres serveurs</text>
<text x="325" y="337" text-anchor="middle" fill="#64748b" font-size="13">modèle ouvert, votre réseau</text>
<text x="475" y="316" fill="#1e1b4b" font-size="14">Rien ne sort de votre réseau</text>
<text x="475" y="337" fill="#1e1b4b" font-size="14">Vous gérez et patchez tout</text>
<rect x="200" y="370" width="250" height="60" rx="10" fill="#ffffff" stroke="#f97316" stroke-width="2"/>
<text x="325" y="396" text-anchor="middle" fill="#1e1b4b" font-size="14">Place de marché GPU (GPUFlow)</text>
<text x="325" y="417" text-anchor="middle" fill="#64748b" font-size="13">l'ordinateur d'un fournisseur</text>
<text x="475" y="396" fill="#1e1b4b" font-size="14">En clair sur cette machine</text>
<text x="475" y="417" fill="#1e1b4b" font-size="14">CGU : enregistrement interdit</text>
<text x="360" y="458" text-anchor="middle" fill="#64748b" font-size="13">Orange : données publiques uniquement. Vert : tout ce que votre propre DSI peut héberger.</text>
</svg>
<figcaption>Un même prompt, cinq destinations. Seul l'auto-hébergement le garde dans votre réseau ; l'offre entreprise et le point d'accès cloud le placent sous un contrat signé par votre entreprise.</figcaption>
</figure>

## Faire tourner soi-même des modèles ouverts

L'option la plus solide pour des données confidentielles est aussi la plus exigeante : télécharger un modèle ouvert (Llama, Qwen, Mistral, Gemma et d'autres) et le faire tourner sur des machines de votre propre réseau. Les prompts ne sortent jamais. Vous décidez de ce qui est journalisé et pour combien de temps, ce qui facilite l'archivage et le respect des durées de conservation du RGPD, et aucune clause de conservation ni décision de justice visant un tiers ne touche les données.

Le coût est bien réel, en revanche. Vous exploitez désormais un service d'inférence : GPU, moteur comme Ollama ou vLLM, authentification, journalisation, mises à jour et une astreinte. Et un modèle de 8B ou 14B qui tient sur une seule carte de station de travail raisonne moins bien sur la durée qu'un modèle de pointe. Il suffit en général pour classer, extraire des champs, résumer des documents internes et rédiger des textes courants. Testez-le sur vos propres tâches avant de trancher. Notre [benchmark Ollama, vLLM et TGI](/fr/ollama-vs-vllm-vs-tgi-rtx-4090-benchmark/) aide à choisir le moteur, et le [guide du fine-tuning privé d'un LLM](/fr/private-llm-fine-tuning-guide/) explique comment adapter un modèle à vos documents.

Il existe une voie médiane que beaucoup d'entreprises choisissent : faire tourner le modèle ouvert sur des instances GPU dans le compte cloud dont elles disposent déjà. Le fournisseur cloud est alors un sous-traitant couvert par un DPA déjà négocié pour tout le reste, et aucun éditeur de modèle n'intervient.

## Où se placent les GPU loués et GPUFlow

Les places de marché de GPU forment le bas de gamme du marché, et elles n'ont leur place dans cette comparaison qu'avec une étiquette claire.

GPUFlow en fait partie. Vous louez un GPU pour un certain nombre d'heures et obtenez une clé API compatible OpenAI pour le modèle ouvert que le fournisseur y fait tourner, généralement via Ollama. Le modèle tourne sur l'ordinateur du fournisseur. Vos prompts et les réponses passent donc en clair par cette machine pendant la location. Les conditions de GPUFlow interdisent aux fournisseurs d'enregistrer, de lire, de conserver ou de partager les requêtes et les réponses des locataires, et GPUFlow ne stocke pas le texte lui-même. Mais le fournisseur a les droits root sur la machine, et l'interdiction d'enregistrer repose sur le contrat : rien de technique ne l'empêche.

GPUFlow n'est donc **pas** la solution pour des données réglementées ou confidentielles. N'y envoyez ni fichiers clients, ni données de santé, ni code source auquel vous tenez, ni rien qu'un contrat client encadre. Notre propre documentation le dit plus crûment : n'envoyez pas de mots de passe, de numéros de carte ni d'autres secrets que vous ne confieriez pas à un inconnu.

Là où il a sa place : essayer un modèle ouvert sur du vrai matériel avant d'acheter une carte, passer des prompts sur des données publiques ou synthétiques, et développer et tester une application contre une API compatible OpenAI avant de la brancher sur votre propre serveur. Les machines communautaires des autres places de marché posent la même question pour tout ce que vous y envoyez ; [comment sécuriser votre jeu de données sur un nœud GPU public](/fr/how-to-secure-dataset-on-public-gpu-node/) traite ce volet.

## Une politique que les gens suivront vraiment

Une interdiction pure et simple, sans alternative, déplace surtout l'usage vers les téléphones personnels, où vous voyez encore moins de choses. Ce qui fonctionne mieux tient en quelques lignes faciles à retenir :

| Catégorie de données | Exemples | Outils autorisés |
| --- | --- | --- |
| Publiques | Documentation publiée, textes marketing | Tout outil validé, applis grand public comprises |
| Internes | Politiques internes, wikis internes, code non sensible | Offres entreprise avec DPA et entraînement désactivé |
| Confidentielles | Données clients, secrets d'affaires, conditions de contrats | Point d'accès cloud dans votre tenant, ou auto-hébergement |
| Réglementées | Données de santé, données de carte, données personnelles à grande échelle | Auto-hébergement, ou éditeur ayant signé l'accord requis (BAA, DPA) |

Puis occupez-vous des parties ingrates :

1. Achetez une offre entreprise ou un point d'accès cloud et faites-en l'outil par défaut, avec authentification unique (SSO) pour que les comptes se ferment au départ des salariés.
2. Réglez la conservation sur la durée la plus courte compatible avec vos obligations d'archivage, et vérifiez dans la console d'administration que l'entraînement est désactivé.
3. Ne bloquez les sites de chat IA grand public sur les appareils gérés qu'une fois l'outil validé en service.
4. Tenez un inventaire des usages de l'IA. Tout ce qui touche au recrutement, au crédit ou à des décisions similaires doit faire l'objet d'un examen distinct avant décembre 2027.
5. Dites aux gens quoi faire, pas seulement quoi ne pas faire. La note de Samsung est arrivée après que les données étaient parties.

Pour le coût d'exploitation de l'auto-hébergement comparé aux services facturés au token, voir [GPU à l'heure ou API au token ?](/fr/hourly-gpu-vs-per-token-api/).

## Sources

- Restriction et enquête chez Samsung : [CNBC, 2 mai 2023](https://www.cnbc.com/2023/05/02/samsung-bans-use-of-ai-like-chatgpt-for-staff-after-misuse-of-chatbot.html) ; détail des incidents : [The Register, 2 mai 2023](https://www.theregister.com/2023/05/02/samsung_generative_ai_ban/)
- Apple et autres entreprises : [TechCrunch, 19 mai 2023](https://techcrunch.com/2023/05/19/apple-reportedly-limits-internal-use-of-ai-powered-tools-like-chatgpt-and-github-copilot/)
- LLM Suite de JPMorgan : [blog technologique de JPMorganChase, 3 juin 2025](https://www.jpmorganchase.com/about/technology/blog/llmsuite-ab-award)
- Conditions entreprise d'OpenAI : [confidentialité en entreprise](https://openai.com/enterprise-privacy/) ; réglages d'entraînement grand public : [utilisation de vos données pour améliorer les modèles](https://help.openai.com/en/articles/5722486-how-your-data-is-used-to-improve-model-performance)
- Ordonnance de conservation dans l'affaire NYT : [OpenAI, réponse aux demandes de données du NYT](https://openai.com/index/response-to-nyt-data-demands/)
- Anthropic : [données commerciales et entraînement](https://privacy.claude.com/en/articles/7996868-is-my-data-used-for-model-training), [données grand public et entraînement](https://privacy.claude.com/en/articles/10023580-is-my-data-used-for-model-training)
- Microsoft : [protection des données d'entreprise dans Microsoft 365 Copilot et Copilot Chat](https://learn.microsoft.com/en-us/copilot/microsoft-365/enterprise-data-protection), [données, confidentialité et sécurité des modèles Foundry vendus par Azure](https://learn.microsoft.com/en-us/azure/ai-foundry/responsible-ai/openai/data-privacy)
- Google : [centre de confidentialité de l'IA générative dans Google Workspace](https://knowledge.workspace.google.com/admin/generative-ai/generative-ai-in-google-workspace-privacy-hub)
- AWS : [protection des données dans Amazon Bedrock](https://docs.aws.amazon.com/bedrock/latest/userguide/data-protection.html)
- Article 28 du RGPD : [gdpr-info.eu](https://gdpr-info.eu/art-28-gdpr/)
- Décision sur le Data Privacy Framework : [Jones Day, septembre 2025](https://www.jonesday.com/en/insights/2025/09/eu-general-court-upholds-euus-data-privacy-framework) ; pourvoi : [Digital Policy Alert](https://digitalpolicyalert.org/event/35459-latombe-filed-appeal-against-general-court-dismissal-of-challenge-to-european-unionunited-states-data-protection-framework-adequacy-decision-in-latombe-v-commission)
- Amende de la Garante : [The Hacker News, décembre 2024](https://thehackernews.com/2024/12/italy-fines-openai-15-million-for.html)
- HIPAA et fournisseurs cloud : [HHS, recommandations sur HIPAA et le cloud computing](https://www.hhs.gov/hipaa/for-professionals/special-topics/health-information-technology/cloud-computing/index.html)
- FINRA : [Regulatory Notice 24-09](https://www.finra.org/rules-guidance/notices/24-09)
- AI Act européen : [Commission européenne, AI Act](https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai) ; omnibus : [White & Case, entrée en vigueur de l'omnibus IA](https://www.whitecase.com/insight-alert/eu-ai-omnibus-enters-force-amending-ai-act)
- GPUFlow : [démarrage rapide de l'API](https://docs.gpuflow.app/fr/renters/api-quickstart/), [ce à quoi les locataires ont accès ou non](https://docs.gpuflow.app/fr/providers/security/), [conditions d'utilisation](https://gpuflow.app/fr/terms), [politique de confidentialité](https://gpuflow.app/fr/privacy)

Toutes vérifiées en septembre 2026.
