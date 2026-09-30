---
title: "Приватное дообучение LLM на арендованном GPU: практическое руководство"
description: "Когда дообучение лучше RAG и промптов, сколько VRAM нужно для QLoRA в зависимости от размера модели, TRL, Unsloth и Axolotl, как сохранить данные в тайне на арендованном GPU, стоимость и запуск модели."
excerpt: "Дообучение открытой модели на 8B через QLoRA помещается на один арендованный GPU с 24 ГБ и стоит примерно $0,35–0,83 за запуск. Прежде чем платить, убедитесь, что дообучение вообще нужно, и продумайте, как ваши данные останутся вашими на чужой машине."
pubDate: 2025-02-23
updatedDate: 2026-09-30
locale: "ru"
category: "tutorials"
featured: false
draft: false
author: "GPUFlow Team"
heroImage: "../_images/private-llm-fine-tuning-guide-hero.png"
heroImageAlt: "Иллюстрация: закрытый датасет используется для дообучения языковой модели на арендованном GPU-сервере"
faq:
  - question: "Сколько VRAM нужно для дообучения модели на 7B или 8B?"
    answer: "Для QLoRA таблица требований Unsloth указывает около 5 ГБ для модели на 7B и 6 ГБ для 8B; обычной 16-битной LoRA нужно около 19 и 22 ГБ. Реальным запускам нужен запас под длинные последовательности и большие батчи, поэтому удобный выбор — карта на 24 ГБ, например RTX 3090 или 4090."
  - question: "Что выбрать: дообучение или RAG?"
    answer: "RAG — когда модели нужны факты из ваших документов, особенно меняющиеся. Исследование Ovadia et al. 2024 года показало, что для добавления знаний RAG стабильно выигрывает у дообучения без учителя. Дообучайте, когда нужен постоянный формат, тон или узкое поведение, которого промптами не добиться надёжно."
  - question: "Сколько стоит дообучить LLM на арендованном GPU?"
    answer: "Запуск QLoRA на модели 8B с 2000 примеров занимает чуть больше часа вместе с подготовкой: примерно $0,35 на RTX 4090 с Vast.ai по $0,31/ч или $0,83 по прайсовой цене RunPod $0,74/ч (сентябрь 2026). Запуск на 20 000 примеров длится около четырёх часов и стоит $1,24–2,97."
  - question: "Может ли хост GPU увидеть мои обучающие данные?"
    answer: "Железо принадлежит хосту, так что исходите из того, что может. Изоляция контейнеров защищает от других арендаторов, а не от владельца машины. Для чувствительных данных берите проверенные хосты в дата-центрах (Vast.ai Secure Cloud, RunPod Secure Cloud), удаляйте персональные данные до загрузки и удаляйте инстанс, когда закончили."
  - question: "Чем LoRA отличается от QLoRA?"
    answer: "LoRA замораживает базовую модель и обучает небольшие матрицы-адаптеры. QLoRA делает то же самое, но загружает замороженную базовую модель в 4-битной точности NF4; в исходной статье это позволило дообучить модель на 65B на одном GPU с 48 ГБ."
  - question: "Можно ли дообучить или загрузить свою модель на GPUFlow?"
    answer: "Нет. GPUFlow — только инференс: вы арендуете OpenAI-совместимый чат-API к моделям, которые провайдеры установили на своих машинах, обычно через Ollama. Командной оболочки и доступа к файлам нет, так что обучать там или загружать свою модель нельзя."
---

Дообучить открытую модель на 8B на своих данных через QLoRA можно на одном арендованном GPU с 24 ГБ, и типичный запуск стоит меньше доллара. Сложные вопросы идут раньше: нужно ли дообучение вообще (для фактов обычно выигрывает поиск по документам) и как сохранить данные в тайне на машине, которая принадлежит кому-то другому.

В руководстве разобрано и то и другое, а затем — сколько VRAM нужно в зависимости от размера модели, актуальные инструменты, рабочий скрипт обучения, пример расчёта стоимости и запуск результата. Всё проверено в сентябре 2026 года; источники — в конце.

## Дообучение, RAG или промпты получше

Дообучение меняет поведение модели. Учить её фактам так — плохая идея. Ovadia et al. сравнили оба подхода для добавления знаний и выяснили, что RAG «стабильно превосходит» дообучение без учителя «как для знаний, встречавшихся при обучении, так и для совершенно новых». Их вывод: LLM с трудом усваивают новые факты через дообучение.

Поэтому, прежде чем что-то арендовать, пройдите по этому дереву:

<figure>
<svg viewBox="0 0 720 420" role="img" aria-labelledby="d1-title" xmlns="http://www.w3.org/2000/svg" font-family="system-ui, sans-serif" font-size="15">
<title id="d1-title">Дерево решений: поиск по документам, промпты получше, дообучение или модель крупнее</title>
<defs><marker id="d1-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#64748b"/></marker></defs>
<rect width="720" height="420" fill="#ffffff"/>
<rect x="60" y="15" width="280" height="40" rx="8" fill="#1e1b4b"/>
<text x="200" y="40" text-anchor="middle" fill="#ffffff">Ответы недостаточно хороши</text>
<line x1="200" y1="55" x2="200" y2="83" stroke="#64748b" stroke-width="2" marker-end="url(#d1-arrow)"/>
<rect x="20" y="85" width="360" height="50" rx="8" fill="#ffffff" stroke="#f97316" stroke-width="2"/>
<text x="200" y="115" text-anchor="middle" fill="#1e1b4b">Не хватает фактов или данные меняются?</text>
<rect x="440" y="80" width="260" height="60" rx="10" fill="#f0fdf4" stroke="#16a34a" stroke-width="2"/>
<text x="570" y="105" text-anchor="middle" fill="#1e1b4b" font-weight="600">Используйте RAG</text>
<text x="570" y="126" text-anchor="middle" fill="#64748b" font-size="13">поиск по документам на запрос</text>
<line x1="380" y1="110" x2="438" y2="110" stroke="#64748b" stroke-width="2" marker-end="url(#d1-arrow)"/>
<text x="409" y="102" text-anchor="middle" fill="#16a34a" font-size="13">Да</text>
<line x1="200" y1="135" x2="200" y2="173" stroke="#64748b" stroke-width="2" marker-end="url(#d1-arrow)"/>
<text x="215" y="160" fill="#64748b" font-size="13">Нет</text>
<rect x="20" y="175" width="360" height="50" rx="8" fill="#ffffff" stroke="#f97316" stroke-width="2"/>
<text x="200" y="205" text-anchor="middle" fill="#1e1b4b">Помогают инструкции и примеры?</text>
<rect x="440" y="170" width="260" height="60" rx="10" fill="#f0fdf4" stroke="#16a34a" stroke-width="2"/>
<text x="570" y="195" text-anchor="middle" fill="#1e1b4b" font-weight="600">Улучшите промпт</text>
<text x="570" y="216" text-anchor="middle" fill="#64748b" font-size="13">системный промпт, примеры</text>
<line x1="380" y1="200" x2="438" y2="200" stroke="#64748b" stroke-width="2" marker-end="url(#d1-arrow)"/>
<text x="409" y="192" text-anchor="middle" fill="#16a34a" font-size="13">Да</text>
<line x1="200" y1="225" x2="200" y2="263" stroke="#64748b" stroke-width="2" marker-end="url(#d1-arrow)"/>
<text x="215" y="250" fill="#64748b" font-size="13">Нет</text>
<rect x="20" y="265" width="360" height="50" rx="8" fill="#ffffff" stroke="#f97316" stroke-width="2"/>
<text x="200" y="295" text-anchor="middle" fill="#1e1b4b">Нужен строгий формат, тон или навык?</text>
<rect x="440" y="260" width="260" height="60" rx="10" fill="#eef2ff" stroke="#6366f1" stroke-width="2"/>
<text x="570" y="285" text-anchor="middle" fill="#1e1b4b" font-weight="600">Дообучите через QLoRA</text>
<text x="570" y="306" text-anchor="middle" fill="#64748b" font-size="13">сотни хороших примеров</text>
<line x1="380" y1="290" x2="438" y2="290" stroke="#64748b" stroke-width="2" marker-end="url(#d1-arrow)"/>
<text x="409" y="282" text-anchor="middle" fill="#16a34a" font-size="13">Да</text>
<line x1="200" y1="315" x2="200" y2="353" stroke="#64748b" stroke-width="2" marker-end="url(#d1-arrow)"/>
<text x="215" y="340" fill="#64748b" font-size="13">Нет</text>
<rect x="60" y="355" width="280" height="50" rx="10" fill="#f8fafc" stroke="#64748b" stroke-width="2"/>
<text x="200" y="385" text-anchor="middle" fill="#1e1b4b">Возьмите модель крупнее</text>
<text x="570" y="370" text-anchor="middle" fill="#64748b" font-size="13">RAG и дообучение хорошо сочетаются:</text>
<text x="570" y="390" text-anchor="middle" fill="#64748b" font-size="13">поведение обучаем, факты ищем</text>
</svg>
<figcaption>Большинство проблем вида «модель не знает наших данных» решаются поиском по документам. Дообучение оправдывает затраты, когда нужно одно и то же поведение каждый раз: схема JSON, фирменный стиль, схема классификации.</figcaption>
</figure>

Хорошие причины для дообучения:

- **Строгий формат ответа.** Извлекать поля в вашу схему при каждом вызове без страницы инструкций в каждом промпте.
- **Стиль и тон.** Ответы поддержки, которые звучат как ваша команда, или отчёты фиксированной структуры.
- **Узкая задача для небольшой модели.** Дообученная модель на 8B может заменить большую универсальную модель на одной задаче, а это важно, если запускать её на дешёвом железе.
- **Короткие промпты.** Поведение, выученное в весах, не нужно повторять в каждом запросе.

## LoRA и QLoRA

Полное дообучение обновляет все веса, поэтому GPU должен держать градиенты и состояние оптимизатора для каждого из них в дополнение к самой модели. LoRA замораживает базовую модель и обучает небольшие матрицы низкого ранга рядом с её слоями; в исходной статье число обучаемых параметров сократилось в 10 000 раз, а расход видеопамяти — в 3 раза по сравнению с полным дообучением GPT-3 175B с Adam.

QLoRA идёт дальше: замороженная базовая модель загружается в 4-битной точности NF4, а в 16 битах обучаются только адаптеры. Dettmers et al. дообучили так модель на 65B на одном GPU с 48 ГБ, «сохранив качество полного 16-битного дообучения». Статья добавила три компонента, которые инструменты используют до сих пор: тип данных NF4, двойное квантование констант квантования и страничные оптимизаторы, которые сглаживают пики расхода памяти.

Результат в обоих случаях — адаптер, папка с несколькими тензорами, который накладывается поверх неизменённой базовой модели. Его можно держать отдельно или влить в веса.

## Сколько нужно VRAM

Unsloth публикует таблицу минимального объёма VRAM для дообучения в зависимости от размера модели. Ниже её цифры, с учётом оптимизаций памяти Unsloth; обычному обучению на Hugging Face нужно больше, а длинные последовательности и большие батчи поднимают каждую строку.

| Размер модели | QLoRA (4 бит) | LoRA (16 бит) | Арендная карта, где QLoRA помещается с запасом |
| --- | --- | --- | --- |
| 3B | 3,5 ГБ | 8 ГБ | Любая карта от 12 ГБ |
| 8B | 6 ГБ | 22 ГБ | RTX 3090 / 4090 (24 ГБ) |
| 14B | 8,5 ГБ | 33 ГБ | RTX 3090 / 4090 (24 ГБ) |
| 32B | 26 ГБ | 76 ГБ | Карта на 48 ГБ (RTX A6000, A40, L40S) |
| 70B | 41 ГБ | 164 ГБ | Карта на 80 ГБ (A100, H100) |

<figure>
<svg viewBox="0 0 720 320" role="img" aria-labelledby="d2-title" xmlns="http://www.w3.org/2000/svg" font-family="system-ui, sans-serif" font-size="15">
<title id="d2-title">Столбчатая диаграмма: минимальный объём VRAM для дообучения моделей на 8B, 14B, 32B и 70B через QLoRA и 16-битную LoRA в сравнении с картами на 24, 48 и 80 ГБ</title>
<rect width="720" height="320" fill="#ffffff"/>
<rect x="200" y="12" width="14" height="14" fill="#6366f1"/>
<text x="220" y="24" fill="#1e1b4b" font-size="13">QLoRA 4 бит</text>
<rect x="320" y="12" width="14" height="14" fill="#eef2ff" stroke="#6366f1" stroke-width="1.5"/>
<text x="340" y="24" fill="#1e1b4b" font-size="13">LoRA 16 бит</text>
<line x1="262.1" y1="58" x2="262.1" y2="265" stroke="#f97316" stroke-width="1.5" stroke-dasharray="5 4"/>
<text x="262.1" y="52" text-anchor="middle" fill="#f97316" font-size="12">24 ГБ</text>
<line x1="324.2" y1="58" x2="324.2" y2="265" stroke="#f97316" stroke-width="1.5" stroke-dasharray="5 4"/>
<text x="324.2" y="52" text-anchor="middle" fill="#f97316" font-size="12">48 ГБ</text>
<line x1="407.1" y1="58" x2="407.1" y2="265" stroke="#f97316" stroke-width="1.5" stroke-dasharray="5 4"/>
<text x="407.1" y="52" text-anchor="middle" fill="#f97316" font-size="12">80 ГБ</text>
<text x="190" y="88" text-anchor="end" fill="#1e1b4b">8B</text>
<rect x="200" y="66" width="15.5" height="16" fill="#6366f1"/>
<text x="221" y="79" fill="#1e1b4b" font-size="12">6</text>
<rect x="200" y="84" width="56.9" height="16" fill="#eef2ff" stroke="#6366f1" stroke-width="1.5"/>
<text x="268" y="97" fill="#1e1b4b" font-size="12">22</text>
<text x="190" y="138" text-anchor="end" fill="#1e1b4b">14B</text>
<rect x="200" y="116" width="22" height="16" fill="#6366f1"/>
<text x="228" y="129" fill="#1e1b4b" font-size="12">8.5</text>
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
<text x="420" y="306" text-anchor="middle" fill="#64748b" font-size="13">Минимальный объём VRAM, ГБ (таблица требований Unsloth)</text>
</svg>
<figcaption>Именно QLoRA делает арендованные потребительские карты полезными для этой задачи: модели до 14B помещаются на карту с 24 ГБ с запасом, для 32B нужна карта на 48 ГБ, для 70B — на 80 ГБ. Без 4-битной загрузки даже 8B едва влезает в 24 ГБ.</figcaption>
</figure>

Мой выбор по умолчанию — модель на 8B или 14B на RTX 4090. Это самая дешёвая арендная карта, на которой остаётся место под последовательности в 2048 токенов и разумный батч, а модели такого размера потом легко запускать. Как выбрать базовую модель под VRAM, на котором вы будете её запускать, — в статье [какие модели ИИ помещаются в VRAM вашего GPU](/ru/which-ai-models-fit-your-gpu-vram/).

## Выбираем инструмент: TRL, Unsloth или Axolotl

Все три — с открытым кодом, и все умеют LoRA и QLoRA.

| Инструмент | Как с ним работать | Сильная сторона | На что обратить внимание |
| --- | --- | --- | --- |
| Hugging Face TRL + PEFT | Python (`SFTTrainer`) | Эталонная реализация; DPO, GRPO и другое через тот же API | На том же запуске расходует больше памяти, чем Unsloth |
| Unsloth | Python или веб-интерфейс Unsloth Studio | Заявляет вдвое большую скорость и на 70% меньше VRAM; экспорт сразу в GGUF | Интерфейс Studio под AGPL-3.0 (ядро под Apache 2.0) |
| Axolotl | Один YAML-файл, `axolotl train config.yml` | Несколько GPU (FSDP, DeepSpeed), много готовых рецептов | Нужны Python 3.11+ и PyTorch 2.11+ |

На сентябрь 2026 года TRL — версии 1.14, PEFT — 0.21. Unsloth нужен Python от 3.11 до 3.13 и GPU NVIDIA с CUDA capability 7.0 или новее (V100, T4, серия RTX 20 и старше). Axolotl рекомендует Python 3.12 и PyTorch 2.12.1.

TRL — если хотите понимать каждую строку, Unsloth — если не хватает VRAM или нужен экспорт в GGUF одним вызовом, Axolotl — если будете повторять запуски с разными настройками или переходить на несколько GPU. Скрипт ниже написан на TRL: это самый короткий путь, на котором видны все движущиеся части.

## Готовим данные

`SFTTrainer` из TRL читает диалоги в том же формате, что и запрос к чат-API. По одному JSON-объекту на строку в `train.jsonl`:

```json
{"messages": [{"role": "system", "content": "Extract the invoice fields as JSON."}, {"role": "user", "content": "Invoice 4471 from Norden AB, due 12 March, total 1,250 EUR"}, {"role": "assistant", "content": "{\"invoice_id\": \"4471\", \"supplier\": \"Norden AB\", \"due\": \"2026-03-12\", \"total\": 1250, \"currency\": \"EUR\"}"}]}
```

Практические правила:

- **Качество важнее количества.** Несколько сотен или тысяч согласованных и правильных примеров лучше десятков тысяч зашумлённых. Каждая ошибка в данных — это поведение, за обучение которому вы платите.
- **Как в продакшене.** Используйте тот системный промпт и формат входа, которые ваше приложение будет отправлять на самом деле.
- **Отложите 5–10%.** Оставьте примеры, на которых модель не обучается, чтобы сравнить базовую и дообученную модель бок о бок.
- **Уберите лишнее.** Имена, email, номера счетов и идентификаторы редко помогают модели выучить формат. Замените их правдоподобными заглушками до того, как данные покинут ваш компьютер.

Последнее правило касается не только арендованной машины. Carlini et al. извлекли из GPT-2 сотни дословных обучающих фрагментов, включая имена, телефоны и адреса email, причём некоторые встречались лишь в одном обучающем документе. Дообученная модель может повторить то, на чём её обучали, любому, кто будет ею пользоваться.

## Как сохранить данные в тайне на арендованной машине

На маркетплейсе GPU компьютер принадлежит кому-то другому. Vast.ai говорит об этом прямо: «Клиенты изолированы в непривилегированных Docker-контейнерах и имеют доступ только к своим данным», и «уровень безопасности у провайдеров сильно различается». Изоляция защищает вас от других арендаторов. От человека с физическим доступом и root-правами на хосте она не защищает.

Для закрытых данных:

1. **Выбирайте проверенный хост в дата-центре.** Провайдеры Secure Cloud на Vast.ai — это «проверенные дата-центры с сертификацией ISO 27001 и стандартами Tier 3/4», и Vast рекомендует их для чувствительных задач. Secure Cloud у RunPod работает в дата-центрах T3/T4; Community Cloud связывает вас с отдельными провайдерами. Уровни в дата-центрах стоят дороже в час, и здесь они того стоят.
2. **Загружайте только очищенный датасет,** по SSH (`rsync -avP` или `scp`). Не выкладывайте его по пути в публичный бакет или по общей ссылке.
3. **Логи — только локально.** В TRL 1.14 `report_to` по умолчанию равен `"none"`, так что в трекер экспериментов ничего не уходит, пока вы сами это не включите. Не вызывайте `push_to_hub` для адаптера, обученного на закрытых данных.
4. **Заберите результаты, потом удалите инстанс.** Скачайте адаптер и результаты оценки, выйдите из Hugging Face (`hf auth logout`), если использовали токен, и удалите инстанс и все тома. На Vast.ai хранилище оплачивается и сохраняется, пока инстанс не удалён, а не просто остановлен.

Удаление файлов внутри контейнера не гарантирует, что диск хоста будет очищен, поэтому настоящая защита — шаги 1 и 2: выбрать, у кого будет железо, и отправить ему как можно меньше. Подробнее — в статье [как защитить датасет на публичном GPU-узле](/ru/how-to-secure-dataset-on-public-gpu-node/). Если ваша политика запрещает любое чужое железо, тот же скрипт работает на вашей собственной карте с 24 ГБ.

## Обучение: скрипт QLoRA на TRL

На арендованной Linux-машине с RTX 3090 или 4090:

```bash
python -m venv venv && source venv/bin/activate
pip install torch trl peft bitsandbytes datasets
```

Затем `train.py` по схеме QLoRA из документации TRL по PEFT. Qwen3-8B распространяется под Apache 2.0 и в свободном доступе, так что токен Hugging Face не нужен:

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

Что здесь важно:

- **`learning_rate=2e-4`.** Документация TRL рекомендует для QLoRA скорость примерно в 10 раз выше обычной для дообучения. Если loss на оценке растёт, а на обучении падает, модель переобучается: уменьшите число эпох.
- **`r=16`, `target_modules="all-linear"`.** Адаптеры на каждом линейном слое — такую конфигурацию используют бенчмарки Unsloth. Ранга 16 хватает для формата и стиля; для задач посложнее поднимите его.
- **`max_length=2048`.** Более длинные примеры обрезаются. Проверьте длину своих данных в токенах; более высокий предел требует больше VRAM.
- **Эффективный батч 16** (4 × 4 шага накопления). Если не хватает памяти, уменьшите `per_device_train_batch_size` и увеличьте накопление, чтобы произведение не изменилось.

Прежде чем выключать машину, прогоните отложенные примеры через базовую и дообученную модель и сравните. Только эта проверка скажет, дали ли потраченные деньги хоть что-то.

## Сколько это стоит

Время обучения — это общее число токенов, делённое на пропускную способность. Хостинговая компания GigaGPU опубликовала замер: около 3500 обучающих токенов в секунду для Llama 3.1 8B с QLoRA на RTX 4090. Если считать, что для Qwen3-8B скорость примерно такая же:

**Небольшой запуск:** 2000 примеров × 600 токенов × 3 эпохи = 3,6 млн токенов. 3 600 000 ÷ 3500 = 1029 с, около 17 минут.

| Этап | Время |
| --- | --- |
| Настройка окружения | 10 мин |
| Скачивание Qwen3-8B (16,4 ГБ весов) и загрузка данных | 10 мин |
| Обучение | 17 мин |
| Сравнение базовой и дообученной модели на отложенных данных | 15 мин |
| Слияние, экспорт, скачивание, удаление инстанса | 15 мин |
| **Итого** | **67 мин (1,12 ч)** |

- RTX 4090 на Vast.ai по $0,31/ч: 1,12 × $0,31 = **$0,35**
- RTX 4090 на RunPod по $0,74/ч (цена со страницы цен): 1,12 × $0,74 = **$0,83**

**Запуск побольше:** 20 000 примеров × 1000 токенов × 2 эпохи = 40 млн токенов ÷ 3500 = 11 429 с, около 3,2 часа. С теми же 50 минутами накладных расходов — 4,0 часа: **$1,24** на Vast.ai или **$2,97** на RunPod.

Для модели на 32B карты с 48 ГБ на RunPod в сентябре 2026 года стоят $0,49/ч (A40), $0,53/ч (RTX A6000) и $1,09/ч (L40S). Опубликованной пропускной способности для QLoRA на 32B на этих картах у меня нет, поэтому прогоните 50 шагов, возьмите время шага из лога и сделайте то же умножение, прежде чем запускать долгое обучение.

Цены — на сентябрь 2026 года, со страницы цен RunPod и из трекера getdeploying.com для Vast.ai. Уровни Secure и в дата-центрах стоят дороже самых дешёвых предложений сообщества. Общая картина — в статье [сравнение цен на аренду GPU](/ru/gpu-rental-pricing-comparison-2026/).

## Запуск результата

Вариантов два: держать адаптер отдельно или влить его в модель.

**Отдельно, через vLLM.** vLLM загружает адаптеры LoRA рядом с базовой моделью и отдаёт каждый как отдельное имя модели на своём OpenAI-совместимом сервере:

```bash
vllm serve Qwen/Qwen3-8B --enable-lora --lora-modules invoices=./out/adapter
```

Клиенты затем отправляют `"model": "invoices"`. Несколько адаптеров могут делить одну базовую модель на одном GPU.

**Влить и запустить в Ollama.** Влейте адаптер в веса полной точности, конвертируйте в GGUF через llama.cpp, квантуйте и импортируйте:

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

Unsloth делает слияние и экспорт в GGUF одним вызовом (`model.save_pretrained_gguf("dir", tokenizer, quantization_method="q4_k_m")`). Его документация предупреждает, что самая частая причина плохих ответов после экспорта — не тот шаблон чата: запускайте модель с тем шаблоном, с которым обучали. Плюсы и минусы Ollama, vLLM и TGI — в [нашем бенчмарке инференса на RTX 4090](/ru/ollama-vs-vllm-vs-tgi-rtx-4090-benchmark/).

### При чём здесь GPUFlow

Обучать на GPUFlow нельзя: он сдаёт OpenAI-совместимый API на GPU провайдера, без командной оболочки, SSH и доступа к файлам. Запустить там свою дообученную модель тоже нельзя. Арендаторы не могут загружать модели; доступны те, что каждый провайдер установил сам (обычно через Ollama), например `qwen2.5:7b` или `llama3.1:8b`.

Помочь он может на шаге, который идёт до всего этого: за несколько центов проверить, не справляется ли с задачей уже стандартная открытая модель с хорошим промптом — это самый дешёвый исход в дереве решений. Используйте для этого тестовые данные, а не закрытые, о которых идёт речь в этом руководстве: пока идёт аренда, промпты и ответы проходят через машину провайдера в открытом виде. Как это устроено — в [быстром старте с API](https://docs.gpuflow.app/ru/renters/api-quickstart/), а как подключить ключ к существующим инструментам — в статье [как использовать ключ в приложениях](/ru/use-openai-compatible-api-key-in-apps/).

## Источники

Всё проверено в сентябре 2026 года.

- Статьи: [Hu et al., LoRA](https://arxiv.org/abs/2106.09685); [Dettmers et al., QLoRA](https://arxiv.org/abs/2305.14314); [Ovadia et al., Fine-Tuning or Retrieval?](https://arxiv.org/abs/2312.05934); [Carlini et al., Extracting Training Data from Large Language Models](https://arxiv.org/abs/2012.07805)
- Hugging Face TRL: [SFT Trainer](https://huggingface.co/docs/trl/sft_trainer), [интеграция с PEFT и QLoRA](https://huggingface.co/docs/trl/peft_integration)
- Unsloth: [требования и таблица VRAM](https://unsloth.ai/docs/get-started/fine-tuning-for-beginners/unsloth-requirements.md), [бенчмарки](https://unsloth.ai/docs/basics/unsloth-benchmarks.md), [сохранение в GGUF](https://unsloth.ai/docs/basics/inference-and-deployment/saving-to-gguf.md), [GitHub](https://github.com/unslothai/unsloth)
- [Axolotl на GitHub](https://github.com/axolotl-ai-cloud/axolotl)
- Модель: [карточка модели Qwen3-8B](https://huggingface.co/Qwen/Qwen3-8B)
- Скорость обучения: [GigaGPU, дообучение на RTX 4090](https://gigagpu.com/rtx-4090-fine-tuning-guide/)
- Хосты и безопасность: [FAQ по безопасности Vast.ai](https://docs.vast.ai/documentation/reference/faq/security), [цены Vast.ai](https://docs.vast.ai/guides/instances/pricing.md), [обзор подов RunPod](https://docs.runpod.io/pods/overview)
- Цены: [цены RunPod](https://www.runpod.io/pricing), getdeploying.com для [Vast.ai](https://getdeploying.com/vast-ai) и [RTX 4090](https://getdeploying.com/reference/cloud-gpu/nvidia-rtx-4090)
- Запуск моделей: [адаптеры LoRA в vLLM](https://docs.vllm.ai/en/latest/features/lora.html), [квантование в llama.cpp](https://github.com/ggml-org/llama.cpp/blob/master/tools/quantize/README.md), [импорт в Ollama](https://docs.ollama.com/import)
- GPUFlow: [быстрый старт с API](https://docs.gpuflow.app/ru/renters/api-quickstart/)
