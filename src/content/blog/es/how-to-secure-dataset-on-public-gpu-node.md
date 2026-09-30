---
title: "Cómo proteger tu conjunto de datos en un nodo de GPU alquilado o público"
description: "El anfitrión de una GPU alquilada puede leer todo lo que tu trabajo descifra. Qué resuelven el cifrado, la secure cloud y la computación confidencial en H100, y cómo limpiar después."
excerpt: "Alquilar una GPU significa que otra persona tiene root en la máquina donde están tus datos. Aquí tienes el modelo de amenazas, qué cubre de verdad cada defensa y una rutina de limpieza que funciona en los discos actuales."
pubDate: 2026-02-26
updatedDate: 2026-09-30
locale: "es"
category: "guides"
featured: false
draft: false
author: "GPUFlow Team"
authorUrl: "https://gpuflow.app"
heroImage: "../_images/secure-server-room-abstract.png"
heroImageAlt: "Entorno abstracto de servidores seguros que representa el procesamiento protegido de datos de IA"
faq:
  - question: "¿Puede el anfitrión de una GPU alquilada ver mis datos?"
    answer: "Técnicamente, sí. El anfitrión tiene root en la máquina física, y tus datos tienen que descifrarse en memoria para entrenar o ejecutar un modelo. Solo la computación confidencial, como las VM confidenciales con H100 de Azure o Google Cloud, saca al anfitrión de la ecuación."
  - question: "¿Borra shred los archivos de forma segura en una instancia de GPU en la nube?"
    answer: "No de forma fiable. El manual de GNU shred dice que solo funciona si el sistema de archivos y el hardware sobrescriben los datos en el mismo sitio, y eso no lo garantizan los sistemas de archivos con journaling o copy-on-write, las snapshots ni los SSD. Cifra los datos antes de que lleguen al disco y, en su lugar, destruye la instancia."
  - question: "¿Qué diferencia hay entre la Secure Cloud y la Community Cloud de RunPod?"
    answer: "La documentación de RunPod describe la Secure Cloud como alojada en centros de datos T3/T4 y adecuada para producción y datos sensibles, y la Community Cloud como proveedores entre particulares con una fiabilidad variable. RunPod ya no acepta nuevos anfitriones en la Community Cloud."
  - question: "¿Qué GPU en la nube admiten computación confidencial?"
    answer: "En septiembre de 2026, Azure ofrece VM confidenciales NCCads H100 v5 con una GPU H100 NVL sobre AMD SEV-SNP, y Google Cloud ofrece a3-highgpu-1g confidencial (una H100, Intel TDX) y G4 (RTX PRO 6000, AMD SEV). Las tarjetas GeForce de consumo no están en estas listas."
  - question: "¿Es seguro poner datos personales en una GPU alquilada según el RGPD?"
    answer: "Solo si el proveedor es un encargado del tratamiento con un contrato que cumpla el artículo 28 del RGPD y una vía legal de transferencia si la máquina está fuera de la UE. La mayoría de los anfitriones particulares no tienen ese contrato contigo, así que anonimiza antes los datos o usa un proveedor de centro de datos que firme un DPA."
  - question: "¿Puedo entrenar o hacer fine-tuning de un modelo en GPUFlow?"
    answer: "No. GPUFlow es solo inferencia: obtienes una clave API compatible con OpenAI para un modelo que se ejecuta en el ordenador de un proveedor, sin SSH, sin shell y sin acceso a archivos. Los prompts llegan sin cifrar a ese ordenador, así que no envíes por ahí registros confidenciales."
---

Cuando alquilas una GPU, otra persona tiene root en la máquina donde están tus datos. El cifrado protege el conjunto de datos por el camino y mientras está en el disco, pero tu trabajo de entrenamiento tiene que descifrarlo en memoria para usarlo, y en ese momento un anfitrión decidido puede leerlo. Así que las decisiones de verdad son en quién confías (un centro de datos verificado o un servidor doméstico anónimo), qué poco envías y si necesitas computación confidencial, que es la única opción que saca al operador del anfitrión de la cadena de confianza.

Esta guía trata de máquinas en las que inicias sesión, como las instancias de Vast.ai o RunPod. Recorre el modelo de amenazas, qué cubre cada defensa y una rutina de limpieza que aguanta en el almacenamiento actual. Las fuentes están al final; todo se comprobó en septiembre de 2026.

## El modelo de amenazas

Empieza por poner nombre a quién podría llegar a los datos y cómo. En una instancia de GPU alquilada hay siete vías realistas.

<figure>
<svg viewBox="0 0 720 430" role="img" aria-labelledby="d1-title" xmlns="http://www.w3.org/2000/svg" font-family="system-ui, sans-serif" font-size="15">
<title id="d1-title">Modelo de amenazas para un conjunto de datos en una instancia de GPU alquilada: siete vías de acceso a los datos y la defensa principal para cada una</title>
<rect x="0" y="0" width="720" height="430" fill="#ffffff"/>
<line x1="220" y1="75" x2="240" y2="170" stroke="#e2e8f0" stroke-width="2"/>
<line x1="220" y1="220" x2="240" y2="215" stroke="#e2e8f0" stroke-width="2"/>
<line x1="220" y1="365" x2="240" y2="270" stroke="#e2e8f0" stroke-width="2"/>
<line x1="500" y1="75" x2="480" y2="170" stroke="#e2e8f0" stroke-width="2"/>
<line x1="500" y1="220" x2="480" y2="215" stroke="#e2e8f0" stroke-width="2"/>
<line x1="500" y1="365" x2="480" y2="270" stroke="#e2e8f0" stroke-width="2"/>
<line x1="360" y1="330" x2="360" y2="290" stroke="#e2e8f0" stroke-width="2"/>
<rect x="240" y="140" width="240" height="150" rx="12" fill="#eef2ff" stroke="#6366f1" stroke-width="2"/>
<text x="360" y="170" text-anchor="middle" fill="#1e1b4b" font-weight="bold">Tu instancia alquilada</text>
<text x="360" y="205" text-anchor="middle" fill="#1e1b4b">Conjunto de datos</text>
<text x="360" y="235" text-anchor="middle" fill="#1e1b4b">Pesos y checkpoints</text>
<text x="360" y="265" text-anchor="middle" fill="#1e1b4b">Tokens y claves</text>
<rect x="20" y="40" width="200" height="70" rx="10" fill="#ffffff" stroke="#f97316" stroke-width="2"/>
<text x="120" y="68" text-anchor="middle" fill="#1e1b4b">Operador del anfitrión</text>
<text x="120" y="92" text-anchor="middle" fill="#64748b" font-size="13">Solución: host fiable o CC</text>
<rect x="20" y="185" width="200" height="70" rx="10" fill="#ffffff" stroke="#f97316" stroke-width="2"/>
<text x="120" y="213" text-anchor="middle" fill="#1e1b4b">Ruta de red</text>
<text x="120" y="237" text-anchor="middle" fill="#64748b" font-size="13">Solución: SSH, sin puertos</text>
<rect x="20" y="330" width="200" height="70" rx="10" fill="#ffffff" stroke="#f97316" stroke-width="2"/>
<text x="120" y="358" text-anchor="middle" fill="#1e1b4b">Restos en el disco</text>
<text x="120" y="382" text-anchor="middle" fill="#64748b" font-size="13">Solución: cifrar y destruir</text>
<rect x="500" y="40" width="200" height="70" rx="10" fill="#ffffff" stroke="#f97316" stroke-width="2"/>
<text x="600" y="68" text-anchor="middle" fill="#1e1b4b">Plataforma del mercado</text>
<text x="600" y="92" text-anchor="middle" fill="#64748b" font-size="13">Solución: contrato y DPA</text>
<rect x="500" y="185" width="200" height="70" rx="10" fill="#ffffff" stroke="#f97316" stroke-width="2"/>
<text x="600" y="213" text-anchor="middle" fill="#1e1b4b">Otros inquilinos</text>
<text x="600" y="237" text-anchor="middle" fill="#64748b" font-size="12">Solución: VM o máquina entera</text>
<rect x="500" y="330" width="200" height="70" rx="10" fill="#ffffff" stroke="#f97316" stroke-width="2"/>
<text x="600" y="358" text-anchor="middle" fill="#1e1b4b">Snapshots, volúmenes</text>
<text x="600" y="382" text-anchor="middle" fill="#64748b" font-size="13">Solución: nada persistente</text>
<rect x="260" y="330" width="200" height="70" rx="10" fill="#ffffff" stroke="#f97316" stroke-width="2"/>
<text x="360" y="358" text-anchor="middle" fill="#1e1b4b">Lo que te dejas tú</text>
<text x="360" y="382" text-anchor="middle" fill="#64748b" font-size="13">Solución: tokens acotados</text>
</svg>
<figcaption>Mientras el trabajo se ejecuta, todo lo que hay en la instancia está expuesto al operador del anfitrión. Las demás vías se cierran con higiene básica; esa necesita o un anfitrión de confianza o computación confidencial.</figcaption>
</figure>

**El operador del anfitrión.** Quien es dueño de la máquina física tiene root en ella. En un mercado de contenedores como Vast.ai, los clientes se ejecutan en contenedores Docker sin privilegios, lo que te aísla de otros inquilinos pero no del anfitrión: root en el anfitrión puede leer los archivos y la memoria de un contenedor. Así funcionan los contenedores en cualquier plataforma.

**La ruta de red.** Los datos que viajan desde tu portátil o tu bucket hasta el nodo. Es la vía más fácil de cerrar.

**La plataforma del mercado.** La empresa que está entre tú y el anfitrión guarda tu cuenta, tus claves SSH y lo que conserven sus propios registros. Lo que puede hacer con ello lo fijan sus condiciones, y por eso importa la sección sobre contratos de más abajo.

**Restos en el disco.** Los archivos que borras pueden sobrevivir en el disco después del alquiler, donde el siguiente inquilino o el anfitrión podrían encontrarlos.

**Snapshots y volúmenes persistentes.** Las copias que pediste tú (un volumen de red, una instancia parada) o que hizo el anfitrión (copias de seguridad) duran más que el trabajo.

**Otros inquilinos.** Otros clientes en la misma máquina. Con aislamiento por VM o una máquina entera para ti, el riesgo es pequeño, pero las GPU han tenido fallos reales aquí. LeftoverLocals (CVE-2023-4969) permitía a un proceso leer la memoria local de GPU de otro en algunas GPU de Apple, AMD y Qualcomm; Trail of Bits recuperó unos 181 MB por consulta a un LLM en una AMD Radeon RX 7900 XT, suficiente para reconstruir la respuesta del modelo. Trail of Bits no encontró indicios en GPU de NVIDIA, ARM ni Intel.

**Lo que te dejas tú.** Un token de Hugging Face, claves de la nube o una clave SSH privada olvidados en el nodo. En la práctica, así empiezan la mayoría de las filtraciones.

## Qué cubre el cifrado y qué no puede cubrir

El cifrado tiene tres funciones, y en una GPU alquilada puedes encargarte tú mismo de dos.

**En tránsito:** fácil. Usa SSH (`scp`, `sftp`, `rsync -e ssh`) o HTTPS desde un bucket. Vast.ai afirma que las conexiones SSH y su API van cifradas. No uses nunca enlaces HTTP sin cifrar ni servicios de intercambio de archivos sin autenticación.

**En reposo:** cifra antes de subir, para que el archivo en el disco del anfitrión no sirva de nada sin la clave. [age](https://github.com/FiloSottile/age) es la herramienta más sencilla para esto:

```bash
# on your own machine
tar -cf - train/ | age -p > train.tar.age
scp -P 22345 train.tar.age user@203.0.113.42:/workspace/
```

En el nodo, descifra directamente en memoria para que el texto en claro no toque nunca el disco:

```bash
mkdir -p /dev/shm/train
age -d /workspace/train.tar.age | tar -xf - -C /dev/shm/train
```

`age -d` pide la frase de paso en el terminal, así que la clave nunca se escribe en el nodo. `/dev/shm` es un sistema de archivos en RAM; comprueba antes su tamaño con `df -h /dev/shm`, porque en los contenedores suele ser pequeño. Si los datos no caben en RAM, vas a necesitar una copia descifrada en disco, y la sección de limpieza de más abajo cobra más importancia.

El cifrado de disco completo con LUKS es la respuesta habitual en tus propios servidores, pero normalmente no puedes configurar dm-crypt dentro de un contenedor sin privilegios, y de todos modos el anfitrión tendría la clave en uso.

**En uso:** aquí está el hueco. Para entrenar, la GPU necesita tensores en claro, y la memoria de la CPU que la alimenta también tiene texto en claro. Cualquiera con root en el anfitrión puede, en principio, volcar esa memoria. El cifrado en reposo no hace nada contra un anfitrión hostil con la máquina en marcha. Solo la computación confidencial basada en hardware lo resuelve.

## Secure cloud o community cloud

Como el anfitrión es el único riesgo que la higiene no puede eliminar, elegirlo es la decisión más importante que tomas. Los dos grandes mercados dividen su oferta justo por eso.

| Opción | Quién gestiona el hardware | Qué dice la plataforma |
| --- | --- | --- |
| RunPod Secure Cloud | Centros de datos T3/T4 | Para «producción, datos sensibles» |
| RunPod Community Cloud | Proveedores entre particulares | Para «cargas de trabajo sensibles al coste»; no acepta nuevos anfitriones |
| Vast.ai Secure Cloud | Centros de datos verificados | ISO 27001, estándares Tier 3/4, seguridad física verificada |
| Otros anfitriones de Vast.ai | Desde centros de datos hasta particulares | Los anfitriones particulares «pueden tener medidas de seguridad menos formales» |

El propio consejo de Vast.ai para datos sensibles es usar solo proveedores de Secure Cloud, cifrar los datos en reposo, no dejar credenciales en las instancias y usar una gestión de claves externa. Coincide con lo que yo le diría a cualquiera.

Incluso en un centro de datos certificado hay dos límites. Primero, ISO 27001 certifica los procesos del operador; no puede descartar a un empleado deshonesto. Segundo, un anfitrión que trata datos personales por ti es un encargado del tratamiento según el RGPD, y el artículo 28 exige un contrato que lo cubra, mientras que el mercado está entre tú y el anfitrión. Lee con qué empresa contratas realmente y qué promete sobre sus anfitriones.

Para trabajo de verdad sensible, el siguiente escalón es una instancia con GPU en una cuenta de un gran proveedor de nube con el que ya tengas un DPA y, quizá, un BAA, lo que te saca del terreno de los mercados y cuesta más por hora. Nuestra [comparativa de precios de alquiler de GPU](/es/gpu-rental-pricing-comparison-2026/) muestra los rangos de precios.

## Computación confidencial en GPU H100

La computación confidencial (CC) es la única tecnología de esta lista diseñada para proteger los datos del operador del anfitrión mientras el trabajo se ejecuta. En las GPU de centro de datos NVIDIA Hopper y Blackwell, funciona así:

- La carga de trabajo se ejecuta en una VM confidencial (CVM) respaldada por AMD SEV-SNP o Intel TDX en la CPU. El diseño de NVIDIA da por hecho que el hipervisor y el sistema operativo del anfitrión pueden estar comprometidos; un operador con acceso al hipervisor «o incluso al propio sistema» no debería poder leer la memoria de la CVM.
- Antes de usarla, la VM comprueba que la GPU es auténtica y está en modo CC con un certificado de dispositivo firmado, que se puede verificar con el Remote Attestation Service (NRAS) de NVIDIA.
- Los datos, los búferes de comandos y los kernels de CUDA que cruzan el PCIe van cifrados y firmados, y pasan por un búfer intermedio cifrado en memoria compartida.

NVIDIA hizo disponible para todos la CC con una sola GPU H100 con CUDA 12.4 en abril de 2024. Dónde se puede alquilar realmente en septiembre de 2026:

| Nube | Instancia | GPU | TEE de la CPU |
| --- | --- | --- | --- |
| Azure | NCCads H100 v5 | 1 × H100 NVL, 94 GB | AMD SEV-SNP (EPYC Genoa) |
| Google Cloud | a3-highgpu-1g, Confidential VM | 1 × H100 | Intel TDX |
| Google Cloud | g4-standard-48, Confidential VM | RTX PRO 6000 | AMD SEV |

Conoce los límites antes de construir sobre ella:

- **Una GPU por VM.** La serie de Azure tiene una GPU, y las VM confidenciales con GPU de Google no admiten clústeres de varios nodos. Los entrenamientos grandes con varias GPU quedan descartados.
- **Aprovisionamiento.** En Google Cloud, A3 High confidencial solo funciona como Spot o flex-start y no admite reservas.
- **Velocidad de transferencia.** El artículo técnico de NVIDIA de 2023 situaba el ancho de banda de CPU a GPU en modo CC en unos 4 GB/s, limitado por el cifrado en la CPU. Cargar un checkpoint de 16 GB lleva, por tanto, unos 16 ÷ 4 = 4 segundos de transferencia pura, sin problema para inferencia, pero un flujo de datos que mueve muchos gigabytes por paso lo va a notar. Versiones posteriores del driver mencionan mejoras de rendimiento, así que mide tu propio trabajo.
- **La memoria de la GPU no va cifrada.** NVIDIA deja la HBM del encapsulado sin cifrar, con el argumento de que las herramientas habituales de ataque físico no llegan a ella.
- **No está en los mercados.** Las tarjetas GeForce de consumo habituales en Vast.ai y en los anfitriones comunitarios de RunPod no están en ninguna de estas listas de compatibilidad.

La CC cambia en quién tienes que confiar: en el hardware y la atestación de NVIDIA, en el fabricante de la CPU y en tu propia imagen de VM, en lugar del personal del anfitrión. Para datos regulados en los que importa poder decir «los administradores del proveedor de nube no pueden leerlos», es la única opción en hardware alquilado que te lo permite.

## Antes y durante el trabajo

### Reduce los datos antes de subirlos

La protección más barata son los datos que nunca salen de tu máquina. Antes de transferir nada:

- Quita las columnas que el modelo no necesita, sobre todo nombres, correos, números de cuenta y notas de texto libre.
- Sustituye los identificadores directos por tokens aleatorios y guarda la tabla de correspondencias en casa.
- Recorta el corpus a lo que necesita el método. Un fine-tuning con LoRA o QLoRA ajusta un pequeño conjunto de pesos adicionales y rara vez necesita una base de datos de producción entera; nuestra [guía de fine-tuning](/es/private-llm-fine-tuning-guide/) recorre una configuración realista.
- Recuerda que los pesos del modelo contienen información. Un modelo ajustado con texto sensible puede repetir fragmentos, así que trata también el adaptador como sensible.

Los datos anonimizados son también lo que hace desaparecer la mayoría de las cuestiones legales de más abajo.

### Credenciales y red en el nodo

Da por hecho que todo lo que pongas en el nodo se puede copiar.

- Usa un token de Hugging Face de permisos detallados con acceso de lectura solo al repositorio que necesitas, y revócalo cuando termine el trabajo.
- No copies nunca a una máquina alquilada tu clave SSH privada principal, las credenciales root de tu nube ni las contraseñas de bases de datos de producción. Si el trabajo tiene que escribir resultados en un bucket, crea una clave que solo pueda escribir en un prefijo y que caduque en menos de un día.
- Trae los resultados por SSH en lugar de enviarlos desde el nodo con claves de larga duración.
- Comprueba qué está escuchando con `ss -tulnp`. Enlaza Jupyter, TensorBoard y los servidores de inferencia a `127.0.0.1` y accede a ellos por un túnel SSH (`ssh -L 8888:127.0.0.1:8888 ...`) en lugar de exponer un puerto público.

## Una limpieza que aguante en los discos actuales

El consejo habitual es pasar `shred` al conjunto de datos al terminar. No hace lo que la gente cree. El manual de GNU coreutils dice que `shred` depende de que el sistema de archivos y el hardware sobrescriban los datos en el mismo sitio, y enumera los casos en los que eso falla: sistemas de archivos con journaling o estructurados en registro, como ext4 en modo `data=journal`, Btrfs, XFS y ZFS, RAID, sistemas de archivos con snapshots, sistemas de archivos comprimidos y los SSD, cuya nivelación de desgaste escribe los datos nuevos en otro sitio. Un nodo de GPU alquilado es, con mucha probabilidad, varias de esas cosas a la vez.

Lo que sí funciona:

1. **Haz que la copia en disco no valga nada.** Si solo el archivo cifrado con age llegó a tocar el disco, basta con borrarlo; sin la frase de paso, es ruido. La guía de NIST sobre saneamiento de soportes (SP 800-88 Rev. 2, septiembre de 2025) trata esta idea, el borrado criptográfico, como una técnica estándar.
2. **Destruye, no pares.** En Vast.ai, parar una instancia conserva sus datos (y sigue facturando el almacenamiento); destruirla «borra de forma permanente la instancia y todos los datos». En RunPod, el disco del contenedor se vacía cuando el pod se para, el volumen `/workspace` sobrevive a las paradas y se borra al terminar el pod, y un volumen de red sobrevive a todo hasta que lo borras.
3. **Borra los volúmenes de red que creaste.** Están diseñados para durar más que los pods.
4. **Revoca lo que usaste.** El token de Hugging Face, las claves del bucket, y quita cualquier clave SSH pública de un solo uso que añadieras al mercado para este trabajo.

La documentación de los mercados que he leído no describe cómo borra el anfitrión los discos entre un inquilino y otro. Planifica como si no lo hiciera; el paso 1 te cubre en cualquier caso.

## Contratos y normativa

Los controles técnicos importan menos que un hecho legal: poner datos en la máquina de alguien lo convierte en parte implicada.

- **RGPD.** Un anfitrión de GPU que trata datos personales por ti es un encargado del tratamiento. El artículo 28 exige uno que ofrezca «garantías suficientes» y un contrato vinculante. Un anfitrión particular con el que nunca has firmado nada no cumple eso, y la máquina puede estar fuera de la UE. Anonimiza, o usa un proveedor que firme un DPA.
- **HIPAA.** El HHS dice que un proveedor en la nube que almacena datos sanitarios electrónicos es un socio comercial aunque los datos estén cifrados y no tenga la clave. Cifrar historiales médicos antes de enviarlos a un anfitrión no verificado no elimina la necesidad de un BAA.
- **Los contratos de tus clientes.** Muchos acuerdos empresariales restringen los subencargados y la ubicación de los datos. Revísalos antes de la primera subida. La exposición legal suele ser mayor que la técnica.

El artículo complementario sobre [por qué las empresas restringen las herramientas de IA públicas](/es/why-corporate-policies-banning-chatgpt/) trata las mismas normas desde el lado del chat.

## Inferencia en GPUFlow: otro intercambio

GPUFlow no es un sitio donde poner un conjunto de datos. Es un mercado de inferencia: alquilas una GPU por horas y obtienes una clave API compatible con OpenAI (URL base `https://gpuflow.app/v1`) para el modelo abierto que un proveedor ejecuta (normalmente con Ollama) en su propio ordenador. No hay SSH, ni shell, ni acceso a archivos, y no puedes entrenar ni hacer fine-tuning. Nada de lo que subes queda en el disco del proveedor, porque no puedes subir nada.

Eso elimina los problemas de disco y de credenciales de esta guía. No elimina el problema del anfitrión. Cada prompt y cada respuesta pasan sin cifrar por la máquina del proveedor mientras dura el alquiler. Las condiciones de GPUFlow prohíben a los proveedores grabarlos, leerlos, conservarlos o compartirlos, y GPUFlow tampoco guarda el texto, pero el proveedor tiene root en la máquina, así que la norma solo se hace cumplir por contrato. Si pasas un conjunto de datos por ahí, un registro por prompt, cada registro llega a ese ordenador.

Así que úsalo con datos públicos, sintéticos o bien anonimizados, y para probar un modelo abierto o una aplicación contra una API al estilo de OpenAI. Deja los registros regulados y confidenciales en tu propio hardware, en un proveedor con el que tengas contrato o en una VM confidencial. La [guía rápida de la API](https://docs.gpuflow.app/es/renters/api-quickstart/) lo dice en una línea: no envíes contraseñas, números de tarjeta ni otros secretos que no compartirías con un desconocido. El mismo acuerdo visto desde el lado del proveedor está en [¿es seguro alquilar tu GPU?](/es/is-it-safe-to-rent-out-your-gpu/).

## Lista de comprobación

Antes:

- Decide el tipo de datos. Los datos regulados o confidenciales de clientes van a un proveedor con contrato o a una VM confidencial, no a un anfitrión comunitario.
- Reduce y anonimiza.
- Cifra con age; no dejes la frase de paso en el nodo.

Durante:

- Descifra en `/dev/shm` cuando quepa.
- Solo tokens acotados y de corta duración.
- Servicios enlazados a localhost, accesibles por túneles SSH.

Después:

- Trae los resultados por SSH; trata los pesos ajustados como sensibles.
- Destruye la instancia y cualquier volumen de red.
- Revoca los tokens y las claves de un solo uso.

## Fuentes

- Aislamiento de contenedores y Secure Cloud en Vast.ai: [FAQ de seguridad de Vast.ai](https://docs.vast.ai/guides/reference/faq/security); parar frente a destruir: [gestión de instancias](https://docs.vast.ai/guides/instances/manage-instances)
- Secure Cloud frente a Community Cloud de RunPod: [elegir un pod](https://docs.runpod.io/pods/choose-a-pod); persistencia del almacenamiento: [tipos de almacenamiento](https://docs.runpod.io/pods/storage/types)
- LeftoverLocals: [Trail of Bits, enero de 2024](https://blog.trailofbits.com/2024/01/16/leftoverlocals-listening-to-llm-responses-through-leaked-gpu-local-memory/)
- age: [github.com/FiloSottile/age](https://github.com/FiloSottile/age)
- Limitaciones de shred: [manual de GNU coreutils, uso de shred](https://www.gnu.org/software/coreutils/manual/html_node/shred-invocation.html)
- NIST SP 800-88 Rev. 2: [anuncio de NIST, septiembre de 2025](https://www.nist.gov/news-events/news/2025/09/guidelines-media-sanitization-nist-publishes-sp-800-88r2)
- Diseño de la computación confidencial en H100: [NVIDIA, Confidential Computing on H100 GPUs for Secure and Trustworthy AI](https://developer.nvidia.com/blog/confidential-computing-on-h100-gpus-for-secure-and-trustworthy-ai/); disponibilidad general: [NVIDIA, abril de 2024](https://developer.nvidia.com/blog/announcing-confidential-computing-general-access-on-nvidia-h100-tensor-core-gpus/)
- Azure: [serie NCCads H100 v5](https://learn.microsoft.com/en-us/azure/virtual-machines/sizes/gpu-accelerated/nccadsh100v5-series)
- Google Cloud: [configuraciones compatibles de Confidential VM](https://docs.cloud.google.com/confidential-computing/confidential-vm/docs/supported-configurations), [crear una instancia de Confidential VM con GPU](https://docs.cloud.google.com/confidential-computing/confidential-vm/docs/create-a-confidential-vm-instance-with-gpu)
- Artículo 28 del RGPD: [gdpr-info.eu](https://gdpr-info.eu/art-28-gdpr/)
- HIPAA y proveedores en la nube: [HHS, guía sobre HIPAA y computación en la nube](https://www.hhs.gov/hipaa/for-professionals/special-topics/health-information-technology/cloud-computing/index.html)
- GPUFlow: [guía rápida de la API](https://docs.gpuflow.app/es/renters/api-quickstart/), [qué pueden tocar los inquilinos y qué no](https://docs.gpuflow.app/es/providers/security/), [condiciones](https://gpuflow.app/es/terms), [política de privacidad](https://gpuflow.app/es/privacy)

Todas revisadas en septiembre de 2026.
