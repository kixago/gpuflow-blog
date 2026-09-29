---
title: "Cuánto puedes ganar alquilando tu GPU para gaming: de la RTX 3060 a la RTX 5090, descontando comisiones y electricidad"
description: "Las cuentas claras de poner en alquiler una GPU de consumo en 2026: precios de alquiler actuales, comisiones de las plataformas, electricidad en EE. UU., Canadá, Reino Unido, Alemania y Francia, y lo que queda al mes con 4 y con 12 horas de alquiler al día."
excerpt: "Lo que se paga por una hora de alquiler, lo que se queda la plataforma, lo que se lleva la factura de la luz y lo que te queda cada mes. Con la fórmula para que hagas las cuentas con tus propios números."
pubDate: 2026-09-29
locale: "es"
category: "guides"
featured: false
draft: false
author: "GPUFlow Team"
heroImage: "../_images/test-hero.jpg"
heroImageAlt: "Una tarjeta gráfica para gaming con tres ventiladores sobre una estantería blanca"
faq:
  - question: "¿Cuánto puede ganar al mes una RTX 4090 en un marketplace de alquiler de GPU?"
    answer: "Con un precio habitual en septiembre de 2026 de unos 0,38 $ por hora, la comisión del 12 % de GPUFlow y el precio medio de la electricidad en EE. UU., una RTX 4090 deja unos 0,25 $ netos por hora alquilada. Son unos 30 $ al mes si se alquila 4 horas al día y unos 91 $ con 12 horas al día, sin contar la electricidad que consume el resto del PC."
  - question: "¿Merece la pena poner en alquiler una RTX 3060?"
    answer: "Apenas. A entre 0,05 $ y 0,08 $ por hora, una RTX 3060 deja unos 0,03 $ netos por hora alquilada, descontando comisiones y electricidad a precios de EE. UU. Con 4 horas de alquiler al día son unos 3 $ al mes."
  - question: "¿Cuánto cuesta la electricidad de tener una GPU en alquiler?"
    answer: "Multiplica el consumo en kilovatios por tu precio del kWh. Una RTX 4090 a su potencia de placa de 450 W cuesta unos 0,08 $ por hora con la media prevista en EE. UU. para 2026 (18,2 centavos por kWh), y unos 0,17 € por hora en Alemania."
  - question: "¿Desde qué países se pueden retirar las ganancias de GPUFlow?"
    answer: "Los cobros se hacen a través de Stripe y ahora mismo funcionan en Estados Unidos, Canadá, Reino Unido, Suiza y el Espacio Económico Europeo."
---

Si tienes una GPU para gaming que está parada la mayor parte del día, puedes alquilarla en un marketplace y cobrar por horas. Que merezca la pena depende de cuatro números:

1. **Lo que pagan los inquilinos** por hora por tu tarjeta.
2. **Lo que se queda la plataforma.**
3. **Lo que te cuesta la electricidad** mientras funciona.
4. **Cuántas horas al día se alquila de verdad.**

Los tres primeros son fáciles de consultar. El cuarto es el que nadie te puede garantizar, así que mostramos un rango. Todos los precios se revisaron en septiembre de 2026; las fuentes están al final.

## 1. Lo que pagan los inquilinos

Estos son los precios bajo demanda habituales por hora en webs de alquiler de GPU (Vast.ai, RunPod, Salad, SimplePod, TensorDock, Hyperstack, Lambda) en septiembre de 2026:

| GPU | Precio habitual por hora | Punto medio del rango |
| --- | --- | --- |
| RTX 3060 12 GB | 0,05 – 0,08 $ | 0,065 $ |
| RTX 4070 | 0,07 – 0,15 $ | 0,11 $ |
| RTX 3090 | 0,11 – 0,31 $ | 0,21 $ |
| RTX 4080 | 0,23 – 0,27 $ | 0,25 $ |
| RTX 4090 | 0,30 – 0,46 $ | 0,38 $ |
| RTX 5090 | 0,41 – 0,69 $ | 0,55 $ |

La memoria importa tanto como la velocidad. Una tarjeta de 24 GB como la 3090 o la 4090 puede ejecutar modelos de IA más grandes que una de 12 o 16 GB, y los inquilinos pagan por ello.

## 2. Lo que se queda la plataforma

| Plataforma | Comisión | Cobros |
| --- | --- | --- |
| GPUFlow | Se queda el 12 % y tú recibes el 88 % | A tu banco a través de Stripe. Mínimo de 25 $, 2,50 $ por retiro. |
| Vast.ai | Vast indica que los precios publicados suelen estar un 25 % por encima de lo que ganan los hosts | Wise, PayPal o Stripe. Mínimo de 20 $, facturación semanal. |
| Salad | No se publica | PayPal, tarjetas regalo, juegos y más |

Los requisitos también son distintos. Los hosts de Vast.ai usan Ubuntu, y los inquilinos reciben contenedores en el host con acceso por SSH o Jupyter. Salad funciona en Windows 10 u 11. En GPUFlow ejecutas un solo comando en un ordenador Linux con systemd; los inquilinos solo llegan a tus modelos de IA a través de una API, nunca a una shell en tu máquina. [A qué pueden acceder los inquilinos y a qué no](https://docs.gpuflow.app/es/providers/security/).

## 3. Lo que cuesta la electricidad

La fórmula: **consumo en kW × tu precio del kWh = coste por hora.**

Para el consumo usamos la potencia de placa oficial de cada tarjeta. Se acerca al máximo que consume la propia tarjeta; al generar texto con IA suele ser menos. El resto del PC suma. Lo más fiable es medirlo: GPUFlow muestra el consumo de tu GPU en tiempo real en **Mis máquinas**, y un medidor de consumo enchufado a la toma te da el del PC completo.

| GPU | Potencia de placa |
| --- | --- |
| RTX 3060 | 170 W |
| RTX 4070 | 200 W |
| RTX 3090 | 350 W |
| RTX 4080 | 320 W |
| RTX 4090 | 450 W |
| RTX 5090 | 575 W |

Lo que cuesta en electricidad una hora de una RTX 4090 a 450 W:

| Dónde | Precio doméstico | Una hora a 450 W |
| --- | --- | --- |
| Estados Unidos (previsión de media para 2026) | 18,2 ¢/kWh | unos 0,08 $ |
| Canadá | 0,170 C$/kWh | unos 0,08 C$ |
| Reino Unido (tope de precio oct.–dic. de 2026) | 26,32 p/kWh | unos 11,8 p |
| Alemania | 0,3869 €/kWh | unos 0,17 € |
| Francia | 0,2561 €/kWh | unos 0,12 € |

En EE. UU., la electricidad se lleva alrededor de una cuarta parte de lo que gana una 4090 por hora alquilada. En Alemania esa misma hora cuesta unos 0,17 €, así que consulta tu tarifa antes de fijar un precio.

## 4. Todo junto

Por hora alquilada al precio medio, con el 88 % que recibes en GPUFlow y el precio medio de la electricidad en EE. UU. a plena potencia de placa:

| GPU | Recibes (88 %) | Electricidad | Queda por hora alquilada | 4 h/día (120 h/mes) | 12 h/día (360 h/mes) |
| --- | --- | --- | --- | --- | --- |
| RTX 3060 12 GB | 0,057 $ | 0,031 $ | **0,026 $** | 3,15 $ | 9,45 $ |
| RTX 4070 | 0,097 $ | 0,036 $ | **0,060 $** | 7,25 $ | 21,74 $ |
| RTX 3090 | 0,185 $ | 0,064 $ | **0,121 $** | 14,53 $ | 43,60 $ |
| RTX 4080 | 0,220 $ | 0,058 $ | **0,162 $** | 19,41 $ | 58,23 $ |
| RTX 4090 | 0,334 $ | 0,082 $ | **0,253 $** | 30,30 $ | 90,90 $ |
| RTX 5090 | 0,484 $ | 0,105 $ | **0,379 $** | 45,52 $ | 136,57 $ |

Tres cosas que esta tabla no incluye:

- **El tiempo de espera.** Tu PC tiene que estar encendido y en línea para que los inquilinos lo encuentren. Mientras espera, sigue consumiendo. Mide tu PC en reposo y réstalo también.
- **El desgaste.** Los ventiladores y la pasta térmica envejecen antes con cargas largas. Mantén la caja bien ventilada y vigila la temperatura.
- **Los impuestos.** Los ingresos por alquiler son ingresos. Cómo tributan depende de dónde vivas.

## Lo que dicen los números

- **RTX 3090, 4080, 4090 y 5090** pueden ganar una cantidad interesante, si se alquilan varias horas al día. La 3090 es la opción con mejor relación calidad-precio: 24 GB de memoria con un coste eléctrico bajo.
- **RTX 3060 y 4070** ganan muy poco por hora. A 3 $ al mes, una 3060 tardaría unos ocho meses en llegar al mínimo de retiro de 25 $ de GPUFlow. Solo compensa si tu electricidad es barata o el PC está encendido de todas formas.
- **La ocupación lo decide todo.** La misma 4090 saca 30 $ o 91 $ al mes según se alquile 4 o 12 horas al día. Un precio justo y una máquina que esté siempre en línea consiguen más alquileres que unos céntimos de descuento.

## Cómo conseguir más horas de alquiler

1. **Al principio, pon un precio en la mitad baja del rango.** Los inquilinos comparan. Puedes subirlo cuando empieces a recibir alquileres.
2. **Mantente en línea.** Una GPU desconectada no se puede alquilar. En GPUFlow, los inquilinos pueden hacer clic en **Notificar Cuando Esté en Línea** en una GPU desconectada; tú recibes un email cuando alguien está esperando.
3. **Ofrece modelos populares.** Indica en tu anuncio los modelos que ejecutas, por ejemplo `qwen2.5:7b` o `llama3.1:8b`. Los inquilinos los buscan.
4. **Vuelve a revisarlo al cabo de una semana.** ¿Se alquila casi todo el tiempo? Sube un poco el precio. ¿No hay alquileres? Bájalo un poco.

En GPUFlow, el formulario del anuncio te muestra dónde queda tu precio en comparación con otras webs de alquiler y con otros anuncios de GPUFlow de la misma tarjeta, y cuánto ganas por hora después de la comisión:

![La barra de precios del formulario de anuncio de GPUFlow, con un precio habitual para una RTX 4090 y las ganancias después de la comisión](../_images/screens/es/provider-price-bar.png)

## Dónde funcionan los cobros de GPUFlow

GPUFlow paga a través de Stripe a cuentas bancarias de **Estados Unidos, Canadá, Reino Unido, Suiza y el Espacio Económico Europeo**. Si vives en otro sitio, puedes publicar tu GPU igualmente y gastar lo que ganes en alquilar otras GPU, pero todavía no puedes retirarlo a un banco. Las ganancias quedan retenidas 7 días (14 días en cuentas con menos de 30 días de antigüedad) antes de que puedas retirarlas. [Cobrar en GPUFlow](https://docs.gpuflow.app/es/providers/getting-paid/).

## Haz las cuentas con tus propios números

**(precio por hora × 0,88) − (vatios ÷ 1.000 × precio del kWh) = lo que queda por hora alquilada**

Después multiplícalo por las horas que esperas de forma realista. Si el resultado son unos pocos dólares al mes, probablemente no compense el desgaste. Si son decenas de dólares, merece la pena probarlo un mes y mirar los números reales.

Para empezar, consulta [pon tu GPU en línea](https://docs.gpuflow.app/es/providers/getting-started/) y [cómo poner precio a tu GPU](https://docs.gpuflow.app/es/providers/pricing/).

## Artículos relacionados

- [GPUFlow vs Vast.ai vs RunPod vs SaladCloud: cuál encaja con tu trabajo](/es/gpuflow-vs-vast-ai-vs-runpod/)
- [El coste real de alquilar una GPU: lo que no incluye el precio por hora](/es/hidden-fees-in-gpu-rental/)

## Fuentes

Todas consultadas en septiembre de 2026.

- Rangos de precios de alquiler de GPU: [documentación de GPUFlow, Cómo poner precio a tu GPU](https://docs.gpuflow.app/es/providers/pricing/)
- Comisión, retención y cobros de GPUFlow: [documentación de GPUFlow, Cobrar](https://docs.gpuflow.app/es/providers/getting-paid/)
- Ganancias de los hosts de Vast.ai: [artículo de vast.ai](https://vast.ai/article/how-much-money-can-you-earn-renting-out-your-gpu-on-vast-ai) (18 de mayo de 2026); cobros: [docs.vast.ai/host/payment.md](https://docs.vast.ai/host/payment.md); requisitos para ser host: [docs.vast.ai/host/hosting-overview.md](https://docs.vast.ai/host/hosting-overview.md)
- Salad: [salad.com/download](https://salad.com/download/), [canje por PayPal](https://support.salad.com/rewards/redeeming-your-rewards/how-to-redeem-paypal/)
- Potencia de placa: páginas de producto de NVIDIA de la [RTX 3060](https://www.nvidia.com/en-us/geforce/graphics-cards/30-series/rtx-3060-3060ti/), la [RTX 4080](https://www.nvidia.com/en-us/geforce/graphics-cards/40-series/rtx-4080-family/), la [RTX 4090](https://www.nvidia.com/en-us/geforce/graphics-cards/40-series/rtx-4090/) y la [RTX 5090](https://www.nvidia.com/en-us/geforce/graphics-cards/50-series/rtx-5090/); RTX 3090: [TechPowerUp](https://www.techpowerup.com/gpu-specs/geforce-rtx-3090.c3622); RTX 4070: [TechSpot](https://www.techspot.com/review/2663-nvidia-geforce-rtx-4070/)
- Electricidad en EE. UU.: [EIA Short-Term Energy Outlook](https://www.eia.gov/outlooks/steo/report/elec_coal_renew.php) (septiembre de 2026)
- Electricidad en Reino Unido: [tope de precio de Ofgem](https://www.ofgem.gov.uk/your-energy-supply/your-energy-bill/energy-price-cap-unit-rates-and-standing-charges)
- Electricidad en Alemania y Francia, segundo semestre de 2025: [estadísticas de precios de la electricidad de Eurostat](https://ec.europa.eu/eurostat/statistics-explained/index.php?title=Electricity_price_statistics), [datos nrg_pc_204 de Eurostat para Francia](https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/nrg_pc_204?geo=FR&nrg_cons=KWH2500-4999&unit=KWH&tax=I_TAX&currency=EUR&lastTimePeriod=1)
- Electricidad en Canadá, junio de 2025: [GlobalPetrolPrices](https://www.globalpetrolprices.com/Canada/electricity_prices/)
