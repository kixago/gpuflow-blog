---
title: "El coste real de alquilar una GPU: lo que no incluye el precio por hora"
description: "Almacenamiento con la máquina parada, ancho de banda, depósitos mínimos, unidades de facturación, tiempo ocioso y comisiones de la tarjeta. Lo que pagas de verdad al alquilar una GPU en Vast.ai, RunPod, Lambda, AWS y GPUFlow, además del precio por hora."
excerpt: "El precio por hora es solo una parte de la factura. Estos son todos los cargos adicionales que hemos encontrado en las principales plataformas de alquiler de GPU, con las cifras y la fuente de cada uno."
pubDate: 2026-02-15
updatedDate: 2026-09-29
locale: "es"
category: "pricing"
featured: false
draft: false
author: "GPUFlow Team"
heroImage: "../_images/gpu-server-rack.jpg"
heroImageAlt: "Primer plano de los ventiladores de servidores GPU en un rack"
faq:
  - question: "¿Cobran las plataformas de alquiler de GPU por el almacenamiento cuando la máquina está parada?"
    answer: "A menudo, sí. En RunPod, el disco de volumen de un pod parado cuesta 0,20 $ por GB al mes, el doble que con el pod en marcha. En Vast.ai el almacenamiento se factura cada segundo que existe la instancia, también mientras está parada. GPUFlow no cobra almacenamiento porque lo que alquilas es una clave API, no una máquina."
  - question: "¿Qué plataformas de alquiler de GPU cobran por el ancho de banda?"
    answer: "En Vast.ai cada host fija su propio precio por los datos enviados y recibidos, y se factura cada byte. RunPod y Lambda afirman que no cobran por la entrada ni por la salida de datos. AWS cobra por los datos que salen a internet a partir de los primeros 100 GB al mes."
  - question: "¿Hay un importe mínimo para empezar a alquilar?"
    answer: "El depósito mínimo de Vast.ai es de 5 $. Lambda hace una preautorización de 10 $ en tu tarjeta. RunPod pide a quien paga con tarjeta prepago un depósito de al menos 100 $ por transacción. En GPUFlow las recargas empiezan en 10 $, sin comisión."
  - question: "¿Me cobrará una comisión el banco si pago el alquiler de la GPU en dólares estadounidenses?"
    answer: "Puede ocurrir. Las comisiones por transacciones en el extranjero suelen ser del 1 % al 3 %, y algunos bancos las cobran en compras a comercios extranjeros aunque el precio aparezca en dólares. En Brasil, el IOF sobre las compras internacionales con tarjeta es del 3,5 %."
---

El precio de un anuncio de GPU es por hora de uso de la GPU. Lo que pagas a final de mes suele incluir otras cosas: espacio en disco, transferencia de datos, el tiempo que tardas en dejarlo todo listo y las comisiones de tu propio banco. Ninguno de estos cargos está oculto a propósito, pero es fácil pasarlos por alto si comparas plataformas solo por el precio que aparece en grande.

En este artículo recogemos todos los cargos adicionales que hemos podido confirmar en las principales plataformas, con un enlace a la fuente de cada uno. Los revisamos todos en septiembre de 2026. Los precios cambian, así que consulta los enlaces antes de fiarte de una cifra.

## En resumen

| Coste | Vast.ai | RunPod | Lambda | AWS EC2 | GPUFlow |
| --- | --- | --- | --- | --- | --- |
| Unidad de facturación | Por segundo | Por segundo | Por minuto | Por segundo, mínimo de 60 s | Por segundo, mínimo de 1 min |
| Almacenamiento con la máquina en marcha | Lo fija el host | 0,10 $/GB/mes | Sistemas de archivos, por GB/mes | 0,08 $/GB/mes (gp3) | Ninguno |
| Almacenamiento con la máquina parada | Sí, se factura | 0,20 $/GB/mes (disco de volumen) | Sistemas de archivos, por GB/mes | 0,08 $/GB/mes (gp3) | Ninguno |
| Transferencia de datos | La fija el host, cada byte | Gratis | Gratis | Salida a internet: los primeros 100 GB/mes gratis, después de pago | Ninguna |
| Mínimo para empezar | Depósito de 5 $ | 1 hora de crédito; 100 $ con tarjetas prepago | Preautorización de 10 $ en la tarjeta | Un método de pago y una cuota de GPU | Recarga de 10 $ |

GPUFlow puede prescindir de los cargos por almacenamiento y transferencia porque alquila algo distinto: recibes una clave API para modelos de IA que se ejecutan en la GPU de otra persona, no una máquina a la que te conectas. Eso también significa que no puedes ejecutar tu propio código ni entrenamientos en ella. Lo explicamos más abajo.

## 1. El almacenamiento, sobre todo con la máquina parada

En las plataformas que te alquilan una máquina o un contenedor, tus archivos están en un disco, y ese disco cuesta dinero mientras exista.

- **RunPod** cobra 0,10 $ por GB al mes por el disco del contenedor y el disco de volumen mientras el pod está en marcha. Cuando paras el pod, el disco del contenedor desaparece y no cuesta nada, pero el disco de volumen pasa a costar **0,20 $ por GB al mes**. Los volúmenes de red cuestan 0,07 $ por GB al mes por debajo de 1 TB, estén en uso o no.
- **Vast.ai** deja que cada host fije el precio del almacenamiento. Se factura cada segundo que existe la instancia, también mientras está parada.
- **AWS** cobra los volúmenes EBS tanto si la instancia está en marcha como si no. Un volumen gp3 en us-east-1 cuesta 0,08 $ por GB al mes.

Un ejemplo con números: un volumen de 200 GB en un pod parado de RunPod cuesta 200 × 0,20 $ = **40 $ al mes**, aunque no vuelvas a arrancar el pod nunca. Es más de lo que cuestan 100 horas de una RTX 3090 a los precios habituales de los marketplaces que recogemos más abajo.

**Qué hacer:** borra los volúmenes que no uses. Si solo necesitas conservar tus archivos entre sesiones, un volumen de red pequeño sale más barato que mantener un pod grande parado.

## 2. La transferencia de datos

Descargar un modelo y subir un conjunto de datos puede suponer mover decenas de gigabytes.

- **Vast.ai:** cada host fija un precio para la subida y la descarga, y la documentación indica que se factura cada byte, sea cual sea el estado de la instancia. Mira el precio del ancho de banda en el anuncio antes de alquilar, sobre todo si vas a descargar modelos grandes.
- **RunPod** y **Lambda** afirman que no cobran por los datos de entrada ni de salida.
- **AWS:** los datos de entrada son gratis. Los datos que salen a internet son gratis los primeros 100 GB al mes y, a partir de ahí, se facturan por GB. AWS también cobra 0,005 $ por hora por cada dirección IPv4 pública, esté en uso o no.

## 3. Depósitos mínimos y retenciones en la tarjeta

La mayoría de las plataformas de GPU son de prepago. Primero compras crédito y después lo gastas.

- **Vast.ai:** depósito mínimo de 5 $.
- **RunPod:** necesitas al menos una hora de crédito para la máquina que elijas, y con tarjetas prepago el depósito mínimo es de 100 $ por transacción.
- **Lambda:** una preautorización de 10 $ en tu tarjeta, que se devuelve a los pocos días.
- **SaladCloud:** el crédito caduca a los 12 meses de la compra.
- **GPUFlow:** recargas de 10 $ a 500 $, sin comisión, y los créditos no caducan.

El crédito que caduca o se queda sin usar también es un coste. Compra lo que prevés gastar.

## 4. El tiempo de preparación también se factura

Cuando alquilas una máquina, el reloj empieza a contar cuando arranca la máquina, no cuando arranca tu trabajo. Instalar controladores y librerías, descargar una imagen de contenedor o bajar un modelo de 15 GB: todo eso ocurre en tiempo facturado. A 0,35 $ la hora, media hora de preparación son unos 0,18 $. Es poco en una sesión, pero se acumula si arrancas máquinas nuevas cada día.

Hay dos cosas que ayudan: usar una plantilla o imagen de contenedor que ya tenga lo que necesitas, y guardar los modelos en un volumen para descargarlos una sola vez (teniendo en cuenta, eso sí, el coste de almacenamiento del punto 1).

En GPUFlow, el modelo ya está instalado en la máquina del proveedor antes de que la alquiles. No hay nada que preparar: pagas desde el momento en que empieza el alquiler y la clave funciona al instante.

## 5. Unidades de facturación y mínimos

La facturación por segundo ya es habitual, pero los mínimos varían:

| Plataforma | Cómo se factura el tiempo |
| --- | --- |
| Vast.ai | Por segundo, sin mínimo |
| Pods de RunPod | Por segundo |
| RunPod serverless | Por segundo, redondeando hacia arriba; también pagas el tiempo de arranque de los workers y un tiempo de espera por inactividad (5 segundos por defecto) |
| Lambda | Por minuto |
| AWS EC2 (Linux) | Por segundo, mínimo de 60 segundos |
| Google Cloud | Por segundo, mínimo de 1 minuto |
| GPUFlow | Por segundo, mínimo de 1 minuto |

Donde más pesan las unidades de facturación es en serverless. Si envías peticiones cortas con pausas entre ellas, el tiempo de arranque y el de espera por inactividad pueden costar más que las propias peticiones.

## 6. El tiempo ocioso de una máquina en marcha

Una máquina alquilada por horas cuesta lo mismo tanto si la GPU está trabajando como si está esperándote. Dejar un pod encendido toda la noche «para tenerlo listo por la mañana» es una forma fácil de gastar de más. Lambda lo dice sin rodeos: las instancias se facturan mientras están en marcha, se usen o no.

**Qué hacer:** ponte un recordatorio o usa alguna función de la plataforma que detenga las máquinas inactivas. En GPUFlow reservas un número de horas; si terminas antes, haz clic en **Terminar ahora** y el tiempo no usado vuelve a tus créditos. [Cómo funciona la facturación de GPUFlow](https://docs.gpuflow.app/es/renters/billing/).

## 7. Máquinas interrumpibles

Las máquinas interrumpibles (spot) son más baratas, a menudo la mitad o menos, pero pueden detenerse cuando alguien paga más. Vast.ai las llama interrumpibles y dice que suelen ser un 50 % o más baratas. En TensorDock, el almacenamiento se sigue facturando mientras otra puja supera la tuya. Si tu trabajo no puede reanudarse desde un checkpoint, una interrupción significa pagar dos veces por el mismo trabajo.

## 8. Las comisiones de tu banco

Casi todas las plataformas de GPU cobran en dólares estadounidenses. Si tu tarjeta está en otra divisa, tu banco puede añadir una comisión:

- Las comisiones por transacciones en el extranjero suelen ser del **1 % al 3 %**. Algunos bancos las cobran en compras a comercios extranjeros aunque el precio aparezca en dólares.
- Muchas tarjetas de crédito canadienses cobran alrededor de un **2,5 %** en compras en otra divisa.
- En Brasil, el **IOF sobre las compras internacionales con tarjeta es del 3,5 %**.

En una recarga de 100 $, eso supone entre 1 $ y 3,50 $ que no verás en la factura de la plataforma. Una tarjeta sin comisión por transacciones en el extranjero elimina la mayor parte.

## 9. Para proveedores: comisiones y mínimos de cobro

Si pones tu propia GPU en alquiler, la plataforma se queda con una parte y los cobros tienen sus propias reglas:

| Plataforma | Lo que se queda el proveedor | Mínimo de cobro | Comisión de cobro |
| --- | --- | --- | --- |
| GPUFlow | El 88 % del precio del alquiler | 25 $ | 2,50 $ por retiro |
| Vast.ai | Vast indica que los precios publicados suelen estar un 25 % por encima de lo que ganan los hosts | 20 $ | Vast no la indica; tu servicio de pagos puede aplicar comisión |
| TensorDock | Su acuerdo de hosting menciona una comisión del 20 % o del 25 % (el texto dice ambas cosas) | 250 $ antes de poder retirar | No se indica |

GPUFlow también retiene las ganancias durante 7 días (14 días en cuentas con menos de 30 días de antigüedad) antes de que puedan retirarse, para cubrir posibles disputas con tarjetas. [Cómo funcionan los cobros en GPUFlow](https://docs.gpuflow.app/es/providers/getting-paid/).

## Precios habituales de GPU, septiembre de 2026

Como referencia, estos son los rangos de precios bajo demanda que encontramos en Vast.ai, RunPod, Salad, SimplePod, TensorDock, Hyperstack y Lambda en septiembre de 2026:

| GPU | Precio habitual por hora |
| --- | --- |
| RTX 3060 12 GB | 0,05 – 0,08 $ |
| RTX 3090 | 0,11 – 0,31 $ |
| RTX 4090 | 0,30 – 0,46 $ |
| RTX 5090 | 0,41 – 0,69 $ |

Para comparar, una NVIDIA L4 en AWS (g6.xlarge en us-east-1) cuesta unos 0,80 $ por hora, y una A10G (g5.xlarge), unos 1,01 $.

## Lista de comprobación antes de alquilar

1. Suma el tiempo de GPU **más** el almacenamiento durante todo el tiempo que conserves los archivos.
2. Comprueba el precio del ancho de banda, si la plataforma lo cobra, y cuánto vas a descargar.
3. Cuenta el tiempo de preparación como tiempo de pago.
4. Ten claro cómo vas a dejar de pagar: terminar el alquiler, parar la máquina, borrar el volumen.
5. Revisa la comisión de tu tarjeta por transacciones en el extranjero.

Si lo que necesitas es un modelo de IA al que llamar desde tu código, y no una máquina para ejecutar tu propio software, un alquiler basado en API te ahorra por completo los puntos 1, 2 y 4. Si necesitas una máquina completa para entrenar, las plataformas anteriores son la herramienta adecuada, y esta lista te ayuda a que la factura se acerque al precio por hora.

## Artículos relacionados

- [¿GPU por horas o API por token? Lo que cuesta de verdad ejecutar un modelo de 7B–8B](/es/hourly-gpu-vs-per-token-api/)
- [GPUFlow vs Vast.ai vs RunPod vs SaladCloud: cuál encaja con tu trabajo](/es/gpuflow-vs-vast-ai-vs-runpod/)
- [Qué necesitas para alquilar una GPU en 2026](/es/what-you-need-to-rent-a-gpu/)

## Fuentes

Todas consultadas en septiembre de 2026.

- Precios de pods y almacenamiento de RunPod: [docs.runpod.io/pods/pricing](https://docs.runpod.io/pods/pricing)
- Facturación de RunPod serverless: [docs.runpod.io/serverless/pricing](https://docs.runpod.io/serverless/pricing)
- Facturación y depósitos de RunPod: [docs.runpod.io/references/billing-information](https://docs.runpod.io/references/billing-information)
- Precios y facturación de Vast.ai: [docs.vast.ai/guides/instances/pricing.md](https://docs.vast.ai/guides/instances/pricing.md), [docs.vast.ai/documentation/reference/billing](https://docs.vast.ai/documentation/reference/billing)
- Depósito de Vast.ai: [guía de inicio rápido de docs.vast.ai](https://docs.vast.ai/guides/get-started/quickstart.md)
- Cobros de los hosts de Vast.ai: [docs.vast.ai/host/payment.md](https://docs.vast.ai/host/payment.md), artículo sobre las ganancias de los hosts: [vast.ai](https://vast.ai/article/how-much-money-can-you-earn-renting-out-your-gpu-on-vast-ai)
- Facturación de Lambda: [docs.lambda.ai/public-cloud/billing](https://docs.lambda.ai/public-cloud/billing/), [gestión de la facturación](https://docs.lambda.ai/public-cloud/manage-billing/), [precios («No egress fees»)](https://lambda.ai/pricing)
- Facturación de SaladCloud: [facturación en docs.salad.com](https://docs.salad.com/general/explanation/billing.md)
- Instancias spot de TensorDock: [docs.tensordock.com](https://docs.tensordock.com/virtual-machines/spot-instances), acuerdo con proveedores: [docs.tensordock.com](https://docs.tensordock.com/legal-information/supplier-hosting-agreement.md)
- Facturación de AWS EC2: [aws.amazon.com/ec2/pricing/on-demand](https://aws.amazon.com/ec2/pricing/on-demand/); EBS: [aws.amazon.com/ebs/pricing](https://aws.amazon.com/ebs/pricing/); IPv4 pública: [aws.amazon.com/vpc/pricing](https://aws.amazon.com/vpc/pricing/)
- Precios de instancias de AWS: [instances.vantage.sh g6.xlarge](https://instances.vantage.sh/aws/ec2/g6.xlarge?region=us-east-1), [g5.xlarge](https://instances.vantage.sh/aws/ec2/g5.xlarge?region=us-east-1)
- Facturación de máquinas virtuales de Google Cloud: [cloud.google.com/compute/vm-instance-pricing](https://cloud.google.com/compute/vm-instance-pricing)
- Comisiones de tarjeta por transacciones en el extranjero: [Experian](https://www.experian.com/blogs/ask-experian/what-is-a-foreign-transaction-fee/), [NerdWallet Canada](https://www.nerdwallet.com/ca/p/best/credit-cards/best-no-foreign-transaction-fee-credit-cards)
- IOF del 3,5 % en Brasil: [Wise Brasil](https://wise.com/br/blog/iof-cartao-internacional)
- Rangos de precios de GPU: [documentación de GPUFlow, Cómo poner precio a tu GPU](https://docs.gpuflow.app/es/providers/pricing/)
