---
title: "Обучение LoRA для Stable Diffusion дешевле $10 на арендованном GPU"
description: "Как обучить LoRA для SDXL или Flux на арендованной RTX 4090 гораздо дешевле $10: выбор GPU по VRAM, подписи, настройки sd-scripts и ai-toolkit и пример расчёта стоимости."
excerpt: "Один запуск обучения LoRA для SDXL на арендованной RTX 4090 в сентябре 2026 года стоит примерно от $0,35 до $0,80. Здесь — какой GPU брать, как подготовить и подписать картинки, точная команда для обучения и на что на самом деле уходят деньги."
pubDate: 2026-02-11
updatedDate: 2026-09-30
locale: "ru"
category: "tutorials"
featured: false
draft: false
author: "GPUFlow Team"
heroImage: "../_images/stable-diffusion-lora-training-guide.jpg"
heroImageAlt: "Иллюстрация: люди у большого монитора со схемой сети LoRA, рядом серверная стойка и панель, где сравниваются примеры картинок после двух эпох обучения"
faq:
  - question: "Сколько стоит обучить LoRA на арендованном GPU?"
    answer: "В сентябре 2026 года RTX 4090 сдавалась примерно за $0,31 в час на Vast.ai и за $0,74 в час по странице цен RunPod. Сессия обучения LoRA для SDXL длится около 65 минут вместе с подготовкой и проверкой, так что обходится примерно в $0,34–0,80."
  - question: "Сколько VRAM нужно для обучения LoRA для SDXL?"
    answer: "Документация sd-scripts говорит, что LoRA для SDXL можно обучить на 8 ГБ видеопамяти (рекомендуется 10 ГБ), если обучать только U-Net, кэшировать латенты и выходы текстовых энкодеров и включить gradient checkpointing. Карта на 24 ГБ, например RTX 3090 или 4090, позволяет обучать в 1024x1024, не упираясь в память."
  - question: "Можно ли обучить LoRA для Flux на RTX 4090?"
    answer: "Да. В ai-toolkit есть примеры конфигураций для FLUX.1, прямо названные под карты на 24 ГБ, а sd-scripts приводит настройки для FLUX.1 вплоть до 8 ГБ за счёт подкачки блоков. По руководству самой Black Forest Labs, обучение LoRA для FLUX.2 [klein] на 1800 шагов на RTX 4090 занимает меньше часа."
  - question: "Сколько картинок нужно для обучения LoRA?"
    answer: "Для одного персонажа, объекта или стиля обычно берут от 15 до 40 хороших картинок; для FLUX.2 [klein] Black Forest Labs советует 15–40 изображений в едином стиле. Резкость, разнообразие и хорошие подписи важнее количества."
  - question: "Что лучше для обучения LoRA: kohya_ss, OneTrainer или ai-toolkit?"
    answer: "Подходят все три. sd-scripts от kohya — эталонный инструмент командной строки, kohya_ss добавляет к нему веб-интерфейс; у OneTrainer настольный интерфейс и встроенное создание подписей; у ai-toolkit веб-интерфейс, официальный шаблон для RunPod и ранняя поддержка новых моделей вроде FLUX.2 и Qwen-Image."
  - question: "Можно ли обучить LoRA на GPUFlow?"
    answer: "Нет. GPUFlow сдаёт в аренду OpenAI-совместимый чат-API на GPU провайдера, без командной оболочки, SSH и доступа к файлам, поэтому запустить там скрипт обучения нельзя. Берите платформу, которая сдаёт саму машину, например Vast.ai или RunPod."
---

LoRA для SDXL или небольшой модели Flux обходится на арендованном GPU гораздо дешевле $10. В сентябре 2026 года RTX 4090 сдаётся примерно за $0,31 в час на Vast.ai и за $0,74 в час на RunPod, а одна сессия обучения LoRA для SDXL вместе с подготовкой и проверкой занимает чуть больше часа. Это $0,34–0,80 за попытку, так что бюджета в $10 хватит на десяток попыток.

Сложность не в деньгах. Сложно подобрать картинки, написать подписи и вовремя остановиться. В этом руководстве есть всё это, с командами, которые можно просто скопировать. Цены и версии инструментов проверены в сентябре 2026 года; источники — в конце.

## Процесс в пяти шагах

<figure>
<svg viewBox="0 0 720 250" role="img" aria-labelledby="d1-title" xmlns="http://www.w3.org/2000/svg" font-family="system-ui, sans-serif" font-size="15">
<title id="d1-title">Процесс обучения LoRA: датасет, подписи, обучение, проверка, применение, с возвратом к датасету, если результат не тот</title>
<defs><marker id="d1-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#6366f1"/></marker></defs>
<rect width="720" height="250" fill="#ffffff"/>
<line x1="20" y1="40" x2="280" y2="40" stroke="#16a34a" stroke-width="2"/>
<text x="150" y="30" text-anchor="middle" fill="#16a34a" font-size="13">Бесплатно: на своём ПК</text>
<line x1="300" y1="40" x2="560" y2="40" stroke="#f97316" stroke-width="2"/>
<text x="430" y="30" text-anchor="middle" fill="#f97316" font-size="13">Платно: на арендованном GPU</text>
<rect x="20" y="60" width="120" height="70" rx="10" fill="#eef2ff" stroke="#6366f1" stroke-width="2"/>
<text x="80" y="90" text-anchor="middle" fill="#1e1b4b" font-weight="600">Датасет</text>
<text x="80" y="112" text-anchor="middle" fill="#64748b" font-size="13">15–40 картинок</text>
<rect x="160" y="60" width="120" height="70" rx="10" fill="#eef2ff" stroke="#6366f1" stroke-width="2"/>
<text x="220" y="90" text-anchor="middle" fill="#1e1b4b" font-weight="600">Подписи</text>
<text x="220" y="112" text-anchor="middle" fill="#64748b" font-size="13">по одному .txt</text>
<rect x="300" y="60" width="120" height="70" rx="10" fill="#eef2ff" stroke="#6366f1" stroke-width="2"/>
<text x="360" y="90" text-anchor="middle" fill="#1e1b4b" font-weight="600">Обучение</text>
<text x="360" y="112" text-anchor="middle" fill="#64748b" font-size="13">sd-scripts</text>
<rect x="440" y="60" width="120" height="70" rx="10" fill="#eef2ff" stroke="#6366f1" stroke-width="2"/>
<text x="500" y="90" text-anchor="middle" fill="#1e1b4b" font-weight="600">Проверка</text>
<text x="500" y="112" text-anchor="middle" fill="#64748b" font-size="13">сетка примеров</text>
<rect x="580" y="60" width="120" height="70" rx="10" fill="#eef2ff" stroke="#6366f1" stroke-width="2"/>
<text x="640" y="90" text-anchor="middle" fill="#1e1b4b" font-weight="600">Применение</text>
<text x="640" y="112" text-anchor="middle" fill="#64748b" font-size="13">ComfyUI, Forge</text>
<line x1="140" y1="95" x2="158" y2="95" stroke="#6366f1" stroke-width="2" marker-end="url(#d1-arrow)"/>
<line x1="280" y1="95" x2="298" y2="95" stroke="#6366f1" stroke-width="2" marker-end="url(#d1-arrow)"/>
<line x1="420" y1="95" x2="438" y2="95" stroke="#6366f1" stroke-width="2" marker-end="url(#d1-arrow)"/>
<line x1="560" y1="95" x2="578" y2="95" stroke="#6366f1" stroke-width="2" marker-end="url(#d1-arrow)"/>
<path d="M500,130 L500,180 L80,180 L80,134" fill="none" stroke="#f97316" stroke-width="2" stroke-dasharray="6 4" marker-end="url(#d1-arrow)"/>
<text x="290" y="205" text-anchor="middle" fill="#1e1b4b" font-size="13">Не то? Поправьте картинки или подписи и обучите заново</text>
<text x="360" y="235" text-anchor="middle" fill="#64748b" font-size="13">Качество в основном зависит от первых двух шагов, а они бесплатны</text>
</svg>
<figcaption>Подготовьте датасет и подписи до аренды. GPU тарифицируется только за обучение и проверку, а плохой результат обычно возвращает вас к картинкам, а не к настройкам.</figcaption>
</figure>

## Что такое LoRA и почему это дёшево

LoRA (Low-Rank Adaptation) замораживает базовую модель и обучает две небольшие матрицы рядом с некоторыми её слоями. В исходной статье сообщалось, что по сравнению с полным дообучением GPT-3 175B число обучаемых параметров сокращается в 10 000 раз, а расход видеопамяти — в 3 раза. С моделями для картинок то же самое: базовый чекпоинт SDXL весит 6,9 ГБ, а обученная LoRA — это небольшой отдельный файл, который подключается поверх базы с любой силой.

Поэтому хватает одного потребительского GPU, а запуск занимает десятки минут, а не дни.

## Выбираем GPU по VRAM

VRAM определяет, что вы вообще сможете обучить. Скорость определяет, сколько оплачиваемых минут займёт запуск, поэтому более быстрая карта с более высокой почасовой ценой может обойтись за запуск примерно так же.

| Семейство моделей | Минимум по документации | С запасом | Примечания |
| --- | --- | --- | --- |
| SD 1.5 | 8 ГБ | 12 ГБ+ | Обучается в 512x512, дешевле и быстрее всего |
| SDXL | 8 ГБ (рекомендуется 10 ГБ) | 24 ГБ | Только U-Net, кэш латентов и выходов текстовых энкодеров |
| FLUX.1 [dev] (12B) | 8 ГБ с активной подкачкой блоков | 24 ГБ | В sd-scripts есть настройки для 24, 16, 12, 10 и 8 ГБ |
| FLUX.2 [klein] 4B/9B | не указан | 24 ГБ | BFL: около 13 ГБ весов в bf16, обучение LoRA укладывается в 24 ГБ |

Настройки для малого объёма VRAM работают, но медленно. Именно подкачкой блоков трансформера между GPU и оперативной памятью sd-scripts втискивает FLUX.1 в 8–16 ГБ, и каждая такая подкачка — время, за которое вы платите. На арендованной машине разумный выбор по умолчанию — карта на 24 ГБ: RTX 3090 или 4090. RTX 5090 (32 ГБ) тоже подойдёт, но sd-scripts отмечает, что ей нужен PyTorch 2.8.0 с CUDA 12.8 или 12.9, так что проверьте, достаточно ли свежий стек в вашем шаблоне.

![Видеокарта ASUS TUF с тремя вентиляторами на белой полке](../_images/test-hero.jpg)

Карты для дата-центров быстрее, но RunPod просит за A100 80 ГБ $1,59 в час — больше чем вдвое дороже 4090. Для LoRA на 20–30 картинках прирост скорости редко это окупает; такие карты имеют смысл для больших датасетов или полного дообучения.

## Где арендовать и сколько это стоит

Нужна платформа, которая даёт машину: командную оболочку или Jupyter-блокнот, диск и способ копировать файлы туда и обратно. Для такой работы чаще всего выбирают Vast.ai и RunPod.

| GPU | VRAM | Vast.ai (от) | Страница цен RunPod | Минимум RunPod по трекеру |
| --- | --- | --- | --- | --- |
| RTX 3090 | 24 ГБ | около $0,11–0,13/ч | $0,50/ч | $0,22/ч |
| RTX 4090 | 24 ГБ | около $0,31–0,33/ч | $0,74/ч | $0,34/ч |
| RTX 5090 | 32 ГБ | около $0,41–0,47/ч | $0,99/ч | $0,69/ч |

Цены на сентябрь 2026 года. «Vast.ai (от)» и «Минимум RunPod по трекеру» взяты из трекера цен getdeploying.com; средний столбец — собственная страница цен RunPod. На Vast.ai цены назначают хосты, поэтому предложения будут различаться в зависимости от расположения и рейтинга надёжности.

Обе платформы тарифицируют посекундно. Различаются дополнительные расходы, и для часовой задачи они значат больше, чем кажется по почасовой цене:

- **Vast.ai** берёт плату за хранилище «всё время существования инстанса, в каком бы состоянии он ни был», а трафик оплачивается за каждый байт по тарифу, который назначает хост. Скачать базовую модель на 7 ГБ на хосте с дорогим трафиком — ощутимая сумма. Удаляйте инстанс, а не просто останавливайте его.
- **RunPod** берёт $0,10 за ГБ в месяц за диск контейнера, пока под работает, ничего — после остановки, и $0,20 за ГБ в месяц за том остановленного пода. За входящий и исходящий трафик плату не берёт.

У обеих есть готовые шаблоны. Автор ai-toolkit поддерживает официальный шаблон для RunPod, а в README kohya_ss RunPod указан как поддерживаемая среда. Шаблон экономит десять с лишним минут установки PyTorch в оплачиваемое время. Более широкое сравнение цен — в статьях [GPUFlow против Vast.ai, RunPod и SaladCloud](/ru/gpuflow-vs-vast-ai-vs-runpod/) и [скрытые расходы при аренде GPU](/ru/hidden-fees-in-gpu-rental/).

## Готовим датасет и подписи

Всё это делается на своём компьютере, ещё до аренды.

### Картинки

- **Количество.** От 15 до 40 картинок на одного человека, объект или стиль. Для FLUX.2 [klein] Black Forest Labs рекомендует «15–40 изображений в едином стиле». Больше — не лучше, если дополнительные картинки слабее.
- **Постоянство и разнообразие.** На каждой картинке должен быть сам концепт. Всё остальное должно меняться: ракурс, свет, фон, кадрирование. Если на всех фото ваш товар стоит на одном и том же белом столе, LoRA выучит стол.
- **Качество.** Резкие, правильно экспонированные, без водяных знаков и надписей поверх. Шум и JPEG-артефакты LoRA выучит так же старательно, как всё остальное.
- **Разрешение.** Не меньше 1024 пикселей по короткой стороне для SDXL и Flux, 512 для SD 1.5. Обрезать до квадрата не нужно: при включённом бакетинге sd-scripts группирует картинки по соотношению сторон.

### Подписи

К каждой картинке идёт текстовый файл с тем же именем (`photo01.jpg`, `photo01.txt`). Подпись сообщает модели то, что уже объяснено словами, и LoRA учит то, что словами не описано. Сначала поставьте редкое слово-триггер, затем опишите всё, что должно оставаться изменяемым:

```text
zxq_mug, a ceramic coffee mug on a wooden desk, morning light from the left, shallow depth of field
```

Черновик за вас напишут два инструмента:

- **WD14 tagger**, который входит в sd-scripts, выдаёт теги через запятую. Хорош для аниме-моделей и дообученных версий SDXL, обученных на тегах:

  ```bash
  python finetune/tag_images_by_wd14_tagger.py --onnx \
    --repo_id SmilingWolf/wd-swinv2-tagger-v3 --batch_size 4 /workspace/dataset/img
  ```

- **JoyCaption** — открытая (Apache 2.0) модель для подписей, созданная специально для обучения диффузионных моделей. Она пишет связные предложения, а они подходят для Flux лучше тегов. По README, в bf16 ей нужно около 17 ГБ VRAM; для карт поменьше есть 8-битная и 4-битная версии.

В OneTrainer тоже есть встроенное создание подписей через BLIP, BLIP2 и WD-1.4. Чем бы ни был написан черновик, прочитайте каждую подпись и поправьте её. Это самые полезные полчаса за весь проект.

## Выбираем тренер

Четыре инструмента покрывают почти все случаи. Все бесплатные, с открытым кодом.

| Инструмент | Интерфейс | Модели (сентябрь 2026) | Для чего подходит |
| --- | --- | --- | --- |
| kohya-ss/sd-scripts | Командная строка | SD 1.x/2.x, SDXL, SD3/3.5, FLUX.1, Lumina, HunyuanImage-2.1, Anima | Воспроизводимые запуски, полный контроль |
| bmaltais/kohya_ss | Веб-интерфейс поверх sd-scripts | Те же, что в sd-scripts | sd-scripts без заучивания флагов |
| Nerogar/OneTrainer | Настольный интерфейс и CLI | От SD 1.5 до 3.5, SDXL, FLUX.1, FLUX.2, Chroma, Qwen Image и другие | Встроенные подписи и маски |
| ostris/ai-toolkit | Веб-интерфейс и конфиги YAML | SD 1.5, SDXL, FLUX.1, FLUX.2, Qwen-Image, видео Wan и другие | Flux и новые модели, шаблон для RunPod |

Текущая версия sd-scripts — 0.11.1 (июнь 2026), она тестируется на Python 3.10 и требует PyTorch 2.6.0 или новее. ai-toolkit рекомендует Python 3.12 и сейчас ставит PyTorch 2.13.0, собранный под CUDA 13.0. OneTrainer нужен Python от 3.10 до 3.13.

Для SDXL я использую sd-scripts: вся конфигурация — это командная строка, поэтому запуски легко повторять и сравнивать. Для Flux — ai-toolkit.

## Обучаем LoRA для SDXL в sd-scripts

На свежем Linux-инстансе с драйвером NVIDIA установка — несколько команд:

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

Скопируйте папку с картинками и подписями `.txt` в `/workspace/dataset/img` через `scp`, `rsync` или файловый менеджер платформы. Затем опишите датасет в `/workspace/dataset.toml`:

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

И запустите обучение:

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

В `prompts.txt` — по одному тестовому промпту на строку, со встроенными параметрами sd-scripts для размера, сида и числа шагов:

```text
zxq_mug, a ceramic coffee mug on a kitchen counter --w 1024 --h 1024 --d 42 --s 28
zxq_mug, a ceramic coffee mug held by a hiker on a mountain top --w 1024 --h 1024 --d 42 --s 28
```

### Что делают настройки

- **Шаги.** Картинки × повторы × эпохи ÷ размер батча. Для 25 картинок: 25 × 10 × 8 = 2000 шагов.
- **`network_dim` 16, `network_alpha` 8.** Ёмкость LoRA. Для одного объекта или лица 16 хватает с запасом; стилям иногда нужно 32. Чем выше ранг, тем быстрее переобучение и тем больше файл.
- **`--network_train_unet_only`.** Здесь обязателен: sd-scripts отказывается кэшировать выходы текстовых энкодеров, если те тоже обучаются, а для LoRA под SDXL документация и так называет обучение только U-Net «настоятельно рекомендуемым».
- **Кэширование и gradient checkpointing.** Именно они позволяют SDXL уложиться в 8–10 ГБ. Кэширование заодно отключает перемешивание подписей и caption dropout, поэтому их и нет в файле датасета.
- **`learning_rate` 1e-4 с AdamW8bit.** Значение из собственного примера sd-scripts для LoRA под SDXL. Если через четыре эпохи примеры почти не меняются, попробуйте 2e-4. Если они превращаются в копии обучающих картинок — снизьте скорость или остановитесь раньше.
- **Чекпоинты каждые 2 эпохи.** Вы получите файлы для эпох 2, 4, 6 и 8 и выберете лучший. Лучшая LoRA часто не последняя.

### Сколько это длится

Пользователи в обсуждении на GitHub у kohya_ss сообщали о скорости около 1,1–1,4 итерации в секунду при обучении LoRA для SDXL в 1024x1024 с батчем 1 на RTX 4090 с gradient checkpointing. При такой скорости 2000 шагов занимают 24–30 минут, плюс несколько минут на кэширование латентов. В том же обсуждении видно, что бывает, когда карте не хватает VRAM и она уходит в общую память: 50 секунд и больше на шаг. Если скорость сильно ниже ожидаемой, загляните в `nvidia-smi`, прежде чем винить настройки.

## Flux и новые модели в ai-toolkit

Для Flux проще всего ai-toolkit. На арендованной машине:

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

Или запустите веб-интерфейс командой `cd ui && npm run build_and_start` и откройте порт 8675. Если к серверу могут подключиться другие люди, сначала задайте пароль в `AI_TOOLKIT_AUTH`, как советует README.

Две вещи о лицензиях, которые стоит знать до выбора модели Flux:

- **FLUX.1 [dev]** на Hugging Face закрыт: нужно принять лицензию FLUX.1 [dev] Non-Commercial License и скачивать модель с токеном чтения Hugging Face. В карточке модели сказано, что сгенерированные изображения можно использовать в коммерческих целях; на сами веса и вашу LoRA распространяется некоммерческая лицензия.
- **FLUX.2 [klein] 4B** — под Apache 2.0 и в свободном доступе. Версия 9B — под FLUX Non-Commercial License.

В июне 2026 года Black Forest Labs опубликовала руководство по обучению LoRA для FLUX.2 [klein] в ai-toolkit: запуск на 1800 шагов на RTX 4090 «занимает меньше часа», а смотреть чекпоинты советуют в районе 750–1500 шагов. Столь же надёжных опубликованных замеров для FLUX.1 [dev], которая втрое больше klein 4B, я не нашёл; закладывайте больше времени и замерьте свой первый запуск.

## Проверьте LoRA, пока ещё платите

Посмотрите примеры картинок для каждой сохранённой эпохи, пока машина ещё работает. Они бесплатно покажут, выучила ли LoRA концепт и когда началось переобучение. Затем скачайте понравившиеся чекпоинты:

```bash
rsync -avP user@your-instance:/workspace/output/*.safetensors ./loras/
```

Дома положите файл в папку `models/loras` в ComfyUI или `models/Lora` в Forge и проверяйте с фиксированными сидами:

- **Сила.** Попробуйте 0,6, 0,8 и 1,0. Некоторые LoRA лучше всего выглядят ниже 1,0.
- **Гибкость.** Поместите триггер в сцены, которых не было в данных: кружка на горе, лицо на картине. Если работает только в сценах, похожих на обучающие, это переобучение: возьмите более раннюю эпоху или меньше повторов.
- **Протечка.** Сгенерируйте без слова-триггера. Если концепт всё равно появляется, подписи описывали картинку недостаточно полно.

Когда результат не тот, исправлять обычно нужно датасет: убрать несколько слабых картинок или назвать в подписях то, что должно меняться. Скорость обучения — вторая вещь, которую стоит трогать, а не первая.

## Пример расчёта

Одна LoRA для SDXL, 25 картинок, 2000 шагов, RTX 4090:

| Этап | Время |
| --- | --- |
| Запуск из шаблона, установка sd-scripts | 10 мин |
| Скачивание SDXL base, загрузка датасета, кэширование | 10 мин |
| Обучение (2000 шагов при 1,1–1,4 it/s) | 30 мин |
| Просмотр примеров, скачивание чекпоинтов, удаление инстанса | 15 мин |
| **Итого** | **65 мин (1,08 ч)** |

- Vast.ai по $0,31/ч: 1,08 × $0,31 = **$0,34**, плюс хранилище и тариф хоста за трафик.
- RunPod по $0,74/ч: 1,08 × $0,74 = **$0,80**. Диск контейнера на 50 ГБ на этот час добавит 50 × $0,10 ÷ 730 часов — меньше цента.

LoRA для FLUX.2 [klein] с часом обучения и 30 минутами подготовки и проверки — это 1,5 × $0,74 = **$1,11** на RunPod или 1,5 × $0,31 = **$0,47** на Vast.ai.

<figure>
<svg viewBox="0 0 720 300" role="img" aria-labelledby="d2-title" xmlns="http://www.w3.org/2000/svg" font-family="system-ui, sans-serif" font-size="15">
<title id="d2-title">Столбчатая диаграмма: стоимость обучения LoRA на арендованной RTX 4090 в сравнении с бюджетом 10 долларов</title>
<rect width="720" height="300" fill="#ffffff"/>
<line x1="230" y1="40" x2="230" y2="250" stroke="#e2e8f0" stroke-width="1"/>
<line x1="322" y1="40" x2="322" y2="250" stroke="#e2e8f0" stroke-width="1"/>
<line x1="414" y1="40" x2="414" y2="250" stroke="#e2e8f0" stroke-width="1"/>
<line x1="506" y1="40" x2="506" y2="250" stroke="#e2e8f0" stroke-width="1"/>
<line x1="598" y1="40" x2="598" y2="250" stroke="#e2e8f0" stroke-width="1"/>
<line x1="690" y1="30" x2="690" y2="250" stroke="#f97316" stroke-width="2" stroke-dasharray="6 4"/>
<text x="698" y="22" text-anchor="end" fill="#f97316" font-size="13">Бюджет $10</text>
<text x="220" y="75" text-anchor="end" fill="#1e1b4b">SDXL, Vast.ai</text>
<rect x="230" y="58" width="15.6" height="26" fill="#16a34a"/>
<text x="253" y="76" fill="#1e1b4b" font-size="13">$0.34</text>
<text x="220" y="125" text-anchor="end" fill="#1e1b4b">SDXL, RunPod</text>
<rect x="230" y="108" width="36.8" height="26" fill="#6366f1"/>
<text x="275" y="126" fill="#1e1b4b" font-size="13">$0.80</text>
<text x="220" y="175" text-anchor="end" fill="#1e1b4b">FLUX.2 klein, RunPod</text>
<rect x="230" y="158" width="51.1" height="26" fill="#6366f1"/>
<text x="289" y="176" fill="#1e1b4b" font-size="13">$1.11</text>
<text x="220" y="225" text-anchor="end" fill="#1e1b4b">5 запусков SDXL, RunPod</text>
<rect x="230" y="208" width="184.5" height="26" fill="#6366f1"/>
<text x="422" y="226" fill="#1e1b4b" font-size="13">$4.01</text>
<line x1="230" y1="250" x2="690" y2="250" stroke="#64748b" stroke-width="1"/>
<text x="230" y="270" text-anchor="middle" fill="#64748b" font-size="13">$0</text>
<text x="322" y="270" text-anchor="middle" fill="#64748b" font-size="13">$2</text>
<text x="414" y="270" text-anchor="middle" fill="#64748b" font-size="13">$4</text>
<text x="506" y="270" text-anchor="middle" fill="#64748b" font-size="13">$6</text>
<text x="598" y="270" text-anchor="middle" fill="#64748b" font-size="13">$8</text>
<text x="690" y="270" text-anchor="middle" fill="#64748b" font-size="13">$10</text>
<text x="460" y="292" text-anchor="middle" fill="#64748b" font-size="13">Стоимость сессии на RTX 4090 по ценам сентября 2026 года</text>
</svg>
<figcaption>Даже пять отдельных попыток с SDXL по прайсовой цене RunPod остаются намного дешевле $10. При $0,74 в час на $10 можно купить 13,5 часа RTX 4090, при $0,31 — около 32 часов.</figcaption>
</figure>

Бюджет в $10 съедает редко само обучение. Его съедает инстанс, забытый на ночь (12 часов по $0,74 — это $8,88), остановленный инстанс Vast.ai, который продолжает платить за хранилище, или час, потраченный на подписи в оплачиваемое время. Посекундная оплата помогает, только если удалять машину, когда закончили.

## При чём здесь GPUFlow

Для этой задачи — ни при чём. GPUFlow сдаёт доступ к языковой модели, которую провайдер запускает (обычно через Ollama) на своём GPU, по OpenAI-совместимому API-ключу. Там нет командной оболочки, SSH и доступа к файлам, поэтому установить тренер, загрузить картинки или скачать LoRA нельзя. К тому же там работают чат-модели, а не модели для картинок. Обучайте на Vast.ai, RunPod или похожей платформе, которая сдаёт саму машину.

Если вы работаете с текстом, а не с картинками, тот же подход «арендовал, обучил, удалил» работает и для языковых моделей: см. [приватное дообучение LLM на арендованном GPU](/ru/private-llm-fine-tuning-guide/).

## Источники

Всё проверено в сентябре 2026 года.

- Статья о LoRA: [Hu et al., LoRA: Low-Rank Adaptation of Large Language Models](https://arxiv.org/abs/2106.09685)
- sd-scripts: [README и релизы](https://github.com/kohya-ss/sd-scripts), [обучение LoRA для SDXL](https://github.com/kohya-ss/sd-scripts/blob/main/docs/sdxl_train_network.md), [заметки о SDXL и VRAM](https://github.com/kohya-ss/sd-scripts/blob/main/docs/train_SDXL-en.md), [конфигурация датасета](https://github.com/kohya-ss/sd-scripts/blob/main/docs/config_README-en.md), [обучение LoRA для FLUX.1](https://github.com/kohya-ss/sd-scripts/blob/main/docs/flux_train_network.md), [WD14 tagger](https://github.com/kohya-ss/sd-scripts/blob/main/docs/wd14_tagger_README-en.md)
- [bmaltais/kohya_ss](https://github.com/bmaltais/kohya_ss), [Nerogar/OneTrainer](https://github.com/Nerogar/OneTrainer), [ostris/ai-toolkit](https://github.com/ostris/ai-toolkit), [JoyCaption](https://github.com/fpgaminer/joycaption)
- Скорость SDXL на 4090: [kohya_ss, issue #1288](https://github.com/bmaltais/kohya_ss/issues/1288)
- Black Forest Labs: [Fine-tune FLUX.2 [klein] with a LoRA under 60 minutes](https://huggingface.co/blog/black-forest-labs/flux-2-klein-lora), карточки моделей [FLUX.1 [dev]](https://huggingface.co/black-forest-labs/FLUX.1-dev), [FLUX.2 [klein] 4B](https://huggingface.co/black-forest-labs/FLUX.2-klein-base-4B), [FLUX.2 [klein] 9B](https://huggingface.co/black-forest-labs/FLUX.2-klein-base-9B)
- [Карточка модели Stable Diffusion XL base 1.0](https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0)
- Цены: [цены RunPod](https://www.runpod.io/pricing), [цены и хранилище подов RunPod](https://docs.runpod.io/pods/pricing), [цены Vast.ai](https://docs.vast.ai/guides/instances/pricing.md), getdeploying.com для [RTX 3090](https://getdeploying.com/reference/cloud-gpu/nvidia-rtx-3090), [RTX 4090](https://getdeploying.com/reference/cloud-gpu/nvidia-rtx-4090), [RTX 5090](https://getdeploying.com/reference/cloud-gpu/nvidia-rtx-5090) и [Vast.ai](https://getdeploying.com/vast-ai)
- GPUFlow: [быстрый старт с API](https://docs.gpuflow.app/ru/renters/api-quickstart/)
