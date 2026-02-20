---
title: "Configuración de MetaMask y Polygon para su primer alquiler de GPU"
description: "Guía paso a paso para instalar MetaMask, configurar la red Polygon y financiar su billetera para el alquiler de GPU. Recorrido completo para principiantes: de cero a billetera con fondos en 15 minutos."
excerpt: "¿Nunca ha usado una billetera de criptomonedas? Esta guía le explica la instalación de MetaMask, la configuración de la red Polygon y cómo financiar su billetera para el alquiler de GPU. No se requiere experiencia previa en criptomonedas."
pubDate: 2026-02-19
updatedDate: 2026-02-19
locale: "es"
category: "tutorials"
featured: false
draft: false
author: "GPUFlow Team"
heroImage: "../_images/metamask-polygon-gpu-rental-setup-hero.png"
heroImageAlt: "Logotipo del zorro de MetaMask junto al logotipo púrpura de Polygon con un icono de tarjeta gráfica GPU, mostrando el flujo de conexión de la billetera a la GPU con los pasos de configuración indicados"
faq:
  - question: "¿Por qué necesito MetaMask para el alquiler de GPU?"
    answer: "MetaMask es una billetera de criptomonedas que le permite almacenar fondos e interactuar con plataformas basadas en blockchain como GPUFlow. Las plataformas de alquiler de GPU que utilizan pagos con criptomonedas requieren una billetera para mantener sus fondos y aprobar transacciones. MetaMask es la opción más compatible, funcionando con casi todas las plataformas de GPU que aceptan criptomonedas. Se instala como una extensión del navegador y su configuración toma unos 5 minutos."
  - question: "¿Por qué usar Polygon en lugar de Ethereum para el alquiler de GPU?"
    answer: "Polygon ofrece tarifas de transacción de $0.001-0.05 en comparación con las tarifas de $1-10+ de Ethereum. Para el alquiler de GPU, donde podría realizar múltiples depósitos, alquileres y retiros, Polygon ahorra una cantidad significativa de dinero. Una sesión típica de alquiler de GPU en Ethereum podría costar entre $5 y $15 solo en tarifas de gas. La misma sesión en Polygon cuesta menos de $0.10 en tarifas. Las plataformas como GPUFlow utilizan Polygon específicamente porque las tarifas bajas hacen que las transacciones pequeñas sean económicamente viables."
  - question: "¿Qué es una frase semilla y por qué es importante?"
    answer: "Una frase semilla es una frase de recuperación de 12 o 24 palabras que proporciona acceso completo a su billetera. Cualquiera con estas palabras puede acceder a todos los fondos de la billetera desde cualquier dispositivo. Debe escribirla en papel (nunca digitalmente) y guardarla de forma segura. Si pierde su frase semilla y su dispositivo falla, sus fondos se perderán permanentemente. Ninguna empresa, equipo de soporte o servicio de recuperación puede ayudar: la frase semilla es la única forma de recuperar una billetera."
  - question: "¿Cuánto MATIC necesito para las tarifas de gas?"
    answer: "Aproximadamente $0.50-2.00 en MATIC es suficiente para docenas de transacciones en Polygon. Cada transacción cuesta entre $0.001 y $0.05 en gas, por lo que incluso $1 de MATIC cubre de 20 a más de 100 transacciones dependiendo de las condiciones de la red. Necesita MATIC específicamente para el gas incluso si está pagando el alquiler de la GPU en USDC u otros tokens; las tarifas de gas deben pagarse en la moneda nativa de la red."
  - question: "¿Puedo usar una billetera distinta a MetaMask?"
    answer: "Sí. Las alternativas incluyen Rainbow (enfocada en móviles), Coinbase Wallet (buena para usuarios de Coinbase), Rabby (amigable para desarrolladores) y billeteras de hardware como Ledger con integración en el navegador. Las plataformas de alquiler de GPU generalmente admiten cualquier billetera compatible con WalletConnect o conexión directa de extensión del navegador. Se recomienda MetaMask para principiantes debido a su extensa documentación, amplia compatibilidad y gran comunidad de usuarios para ayuda en la resolución de problemas."
---

La brecha entre "quiero alquilar una GPU con criptomonedas" y hacerlo realmente suele reducirse a una sola cosa: la configuración de la billetera. El alquiler de la GPU en sí toma treinta segundos. Lograr que una billetera de criptomonedas con fondos se conecte a la red correcta lleva más tiempo si nunca lo ha hecho antes, y la mayoría de las guías asumen que usted ya posee criptomonedas y entiende las tarifas de gas.

Este tutorial comienza desde cero. No se requiere experiencia previa en criptomonedas. Al final, tendrá una billetera MetaMask conectada a la red Polygon con fondos suficientes para alquilar su primera GPU. Todo el proceso cuesta menos de $2 en tarifas y toma unos quince minutos, la mayor parte de los cuales es tiempo de espera para las confirmaciones de retiro del exchange.

Para el proceso completo de alquiler de GPU después de la configuración de la billetera —incluyendo comparaciones de plataformas, depósito en garantía mediante contratos inteligentes y gestión del alquiler— consulte nuestra [Guía completa para alquilar GPUs con criptomonedas](/es/rent-gpu-with-crypto/).

---

## Por qué Polygon en lugar de la red principal de Ethereum

Antes de configurar nada, entender por qué Polygon es importante le ahorrará dinero en cada transacción.

### El problema de las tarifas de gas

Cada transacción en blockchain requiere una tarifa pagada a los validadores de la red. En la red principal de Ethereum, estas tarifas (llamadas "gas") fluctúan según la demanda de la red:

**Costos de gas en la red principal de Ethereum:**

- Transferencia simple: $1-5
- Aprobación de token: $2-8
- Transacción compleja (depósito en garantía): $5-15
- Durante alta demanda: $20-50+

**Para el alquiler de GPU, esto crea un problema:**

Imagine alquilar una RTX 4090 por 2 horas a $0.60/hora:

- Costo de la GPU: $1.20
- Gas de Ethereum para depósito: $5.00
- Gas de Ethereum para retiro: $5.00
- **Total: $11.20 por $1.20 de tiempo de GPU**

Cuando las tarifas de gas exceden el costo del alquiler, las transacciones pequeñas se vuelven económicamente irracionales.

### Polygon: Misma seguridad, tarifas 100 veces más bajas

Polygon es una red de "Capa 2" construida sobre Ethereum. Hereda el modelo de seguridad de Ethereum mientras procesa transacciones a un costo dramáticamente menor:

**Costos de gas en Polygon:**

- Transferencia simple: $0.001-0.01
- Aprobación de token: $0.005-0.02
- Transacción compleja (depósito en garantía): $0.01-0.05
- Durante alta demanda: $0.05-0.20

**El mismo escenario de alquiler de GPU en Polygon:**

- Costo de la GPU: $1.20
- Gas de Polygon para depósito: $0.02
- Gas de Polygon para retiro: $0.02
- **Total: $1.24 por $1.20 de tiempo de GPU**

Las tarifas de gas se vuelven insignificantes en lugar de prohibitivas.

### Detalles técnicos (Para los curiosos)

Polygon logra tarifas bajas a través de diferentes mecanismos de consenso y procesamiento de transacciones por lotes. La arquitectura técnica importa menos que el resultado práctico:

| Red              | Tiempo de confirmación | Tarifa de transacción | Seguridad                     |
| ---------------- | ---------------------- | --------------------- | ----------------------------- |
| Ethereum mainnet | 15-60 segundos         | $1-15                 | La más alta                   |
| Polygon          | 2-5 segundos           | $0.001-0.05           | Alta (asegurada por Ethereum) |
| Solana           | <1 segundo             | $0.0001-0.01          | Alta                          |

GPUFlow y otras plataformas de GPU nativas de cripto utilizan Polygon porque:

- Las tarifas no destruyen la economía de los alquileres pequeños
- La confirmación rápida significa acceso rápido
- La seguridad permanece fuerte vía anclaje a Ethereum
- Amplia disponibilidad de monedas estables (USDC, USDT)

### Su billetera funciona en ambas redes

Aquí está el concepto clave: **La dirección de su billetera MetaMask es la misma en Ethereum y en Polygon.**

La dirección `0x7a3B...4f2D` existe en ambas redes. Los fondos enviados a esa dirección en Polygon se quedan en Polygon. Los fondos enviados en Ethereum se quedan en Ethereum. Misma dirección, diferentes redes, saldos separados.

Es por esto que la selección de la red importa al enviar fondos. Enviar USDC en la red principal de Ethereum a su dirección no hace que esos fondos estén disponibles en Polygon; están en redes diferentes a pesar de la dirección idéntica.

![Diagrama de comparación que muestra una dirección de billetera idéntica existiendo tanto en la red principal de Ethereum como en la red Polygon, con saldos de fondos separados en cada red, ilustrando que la misma dirección no significa que los fondos se compartan entre redes](../_images/ethereum-polygon-same-address-different-networks.png)

---

## Instalación de MetaMask y seguridad de la frase semilla

MetaMask es una billetera de extensión del navegador que almacena su criptomoneda y le permite interactuar con aplicaciones blockchain. La instalación toma unos cinco minutos.

### Paso 1: Descargar MetaMask

**Vaya directamente a la fuente oficial:**

1. Abra su navegador (Chrome, Firefox, Brave o Edge)
2. Visite **metamask.io** (verifique la URL cuidadosamente; existen sitios de phishing)
3. Haga clic en "Download" (Descargar)
4. Seleccione su navegador
5. Haga clic en "Add to [Browser]" (Añadir a [Navegador]) en la tienda de extensiones
6. Confirme la instalación cuando se le solicite

**Advertencia:** Solo descargue MetaMask desde metamask.io o tiendas oficiales de extensiones de navegador. Nunca instale desde enlaces en correos electrónicos, mensajes de Discord o anuncios de búsqueda. Las extensiones falsas de MetaMask roban fondos.

### Paso 2: Crear nueva billetera

Después de la instalación:

1. Haga clic en el icono del zorro de MetaMask en la barra de herramientas de su navegador
2. Haga clic en "Get Started" (Comenzar)
3. Seleccione "Create a new wallet" (Crear una nueva billetera)
4. Acepte los términos (léalos si desea, son términos de software estándar)
5. Cree una contraseña

**Esta contraseña:**

- Desbloquea MetaMask en este dispositivo específico
- NO recupera su billetera si pierde el acceso
- Debe ser fuerte pero no necesita memorizarse para siempre
- Es independiente de su frase semilla (explicada a continuación)

### Paso 3: Asegurar su frase semilla

**Este es el paso más crítico. Lea con atención.**

MetaMask mostrará 12 palabras en un orden específico. Estas palabras son su "frase semilla" o "frase de recuperación".

**Lo que hace la frase semilla:**

- Proporciona acceso completo a su billetera desde cualquier dispositivo
- Permite la recuperación si su computadora muere, el navegador falla o MetaMask se corrompe
- No se puede cambiar ni restablecer: estas 12 palabras son permanentes para esta billetera
- Cualquiera con estas palabras puede tomar todos sus fondos al instante

**Qué hacer:**

1. MetaMask muestra 12 palabras en pantalla
2. **Escríbalas en papel en el orden exacto** (palabra 1, palabra 2... palabra 12)
3. No tome fotos, capturas de pantalla ni las escriba en ningún dispositivo digital
4. No las guarde en un gestor de contraseñas, unidad en la nube o aplicación de notas
5. Guarde el papel en una ubicación segura (caja fuerte, caja de seguridad)
6. Considere hacer una segunda copia guardada en una ubicación física diferente

**Qué NO hacer:**

- Nunca introduzca la frase semilla en ningún sitio web (los sitios legítimos nunca la piden)
- Nunca la comparta con nadie que afirme ser "soporte"
- Nunca la almacene digitalmente en ninguna forma
- Nunca la lea en voz alta al alcance del oído de otros o de dispositivos

**Por qué esto importa:**

A diferencia de las cuentas bancarias, las billeteras de criptomonedas no tienen servicio al cliente, departamento de fraude ni reversión de transacciones. Si alguien obtiene su frase semilla:

- Vacían su billetera en segundos
- Ninguna autoridad puede revertir la transacción
- No es posible la recuperación
- Los fondos se pierden permanentemente

La frase semilla _es_ la billetera. Protéjala en consecuencia.

### Paso 4: Confirmar la frase semilla

MetaMask le pedirá que confirme seleccionando las palabras en orden:

1. Haga clic en las palabras en la secuencia correcta
2. Esto verifica que realmente las escribió
3. No omita esto memorizándolas temporalmente; necesita el respaldo escrito

### Paso 5: Billetera lista

Después de la confirmación, su billetera está creada y lista para usar. Verá:

- La dirección de su billetera (comienza con `0x`, seguida de 40 caracteres)
- El saldo mostrando 0 ETH (aún no la ha financiado)
- El indicador de red mostrando "Ethereum Mainnet"

**La dirección de su billetera:**

- Es pública: es seguro compartirla para recibir fondos
- Como una dirección de correo electrónico para criptomonedas
- No cambia y no se puede modificar
- La misma dirección funciona en múltiples redes (Ethereum, Polygon, etc.)

![Interfaz de la billetera MetaMask mostrando una nueva billetera con saldo cero, destacando la ubicación de la dirección de la billetera, el selector de red y elementos clave de la interfaz para nuevos usuarios](../_images/metamask-new-wallet-interface-annotated.png)

---

## Agregar la red Polygon a MetaMask

MetaMask viene por defecto en la red principal de Ethereum. Para usar las tarifas bajas de Polygon, necesita agregar la red.

### Método 1: Adición automática (El más fácil)

1. Visite **chainlist.org**
2. Busque "Polygon"
3. Encuentre "Polygon Mainnet" (Chain ID: 137)
4. Haga clic en "Add to MetaMask" (Agregar a MetaMask)
5. Aparece una ventana emergente de MetaMask: haga clic en "Approve" (Aprobar)
6. Haga clic en "Switch to Network" (Cambiar a la red) para activar Polygon

**Listo.** Polygon ahora está disponible en su menú desplegable de redes.

### Método 2: Adición manual

Si chainlist.org no funciona, agréguela manualmente:

1. Haga clic en el icono de la extensión MetaMask
2. Haga clic en el menú desplegable de redes (muestra "Ethereum Mainnet")
3. Haga clic en "Add network" (Agregar red)
4. Haga clic en "Add a network manually" (Agregar una red manualmente)
5. Ingrese estos detalles exactos:

```

Network Name: Polygon Mainnet
New RPC URL: https://polygon-rpc.com
Chain ID: 137
Currency Symbol: MATIC
Block Explorer URL: https://polygonscan.com

```

6. Haga clic en "Save" (Guardar)
7. Polygon aparece en su lista de redes

### Cambiar entre redes

Después de agregar Polygon:

1. Haga clic en el menú desplegable de redes en MetaMask (parte superior central de la extensión)
2. Seleccione "Polygon Mainnet" o "Ethereum Mainnet"
3. La visualización de su saldo cambia para mostrar los fondos en la red seleccionada

**Recuerde:** Misma dirección, diferentes redes. Los fondos en Ethereum no son visibles cuando ve Polygon, y viceversa. Está mirando el mismo buzón pero en diferentes oficinas postales.

### Verificar la adición de la red

Confirme que Polygon está funcionando:

1. Cambie a Polygon Mainnet
2. El saldo debe mostrar "0 MATIC" (no lo ha financiado)
3. Aparece un pequeño logotipo de Polygon junto al nombre de la red
4. La dirección permanece igual que en Ethereum

Si ve errores sobre conexiones RPC:

- Pruebe una URL RPC alternativa: `https://rpc-mainnet.matic.quiknode.pro`
- O: `https://polygon-bor.publicnode.com`
- La congestión de la red ocasionalmente causa problemas de RPC

![Menú desplegable del selector de red de MetaMask mostrando las opciones de Ethereum Mainnet y Polygon Mainnet, con Polygon seleccionado y resaltado, demostrando cómo cambiar entre redes](../_images/metamask-network-selector-polygon.png)

---

## Financiar su billetera con USDC

Su billetera ya existe pero está vacía. Esta sección cubre cómo obtener USDC (la moneda estable recomendada para el alquiler de GPU) en su billetera MetaMask en la red Polygon.

### Por qué USDC para el alquiler de GPU

**Las monedas estables eliminan la volatilidad de precios:**

- USDC mantiene una paridad 1:1 con el dólar estadounidense
- 100 USDC hoy equivalen a 100 USDC mañana
- No hay riesgo de oscilaciones de precios de criptomonedas que afecten su presupuesto de GPU

**Compare con criptomonedas volátiles:**

- Deposita $100 de ETH para el alquiler de GPU
- ETH cae un 10% durante la noche
- Su saldo restante compra un 10% menos de tiempo de GPU
- El precio se movió en su contra sin ninguna acción de su parte

**USDC evita esto por completo.** Su presupuesto de alquiler de GPU se mantiene estable independientemente de las condiciones del mercado.

### Método de financiación 1: Retirar desde un exchange (Recomendado)

Si ya tiene criptomonedas en un exchange (Coinbase, Binance, Kraken, etc.), retirar directamente a Polygon es la opción más barata.

**Paso a paso para Coinbase:**

1. Inicie sesión en Coinbase
2. Navegue a su saldo de USDC
3. Haga clic en "Send" (Enviar)
4. Ingrese la dirección de su billetera MetaMask (cópiela de MetaMask)
5. **Crítico:** Seleccione "Polygon" como la red
6. Ingrese la cantidad a enviar
7. Revise las tarifas (típicamente $0.10-1.00 para retiros de Polygon)
8. Confirme el retiro
9. Espere la confirmación (generalmente 1-10 minutos)

**Paso a paso para Binance:**

1. Inicie sesión en Binance
2. Navegue a Wallet → Spot Wallet
3. Encuentre USDC, haga clic en "Withdraw" (Retirar)
4. Pegue la dirección de su billetera MetaMask
5. **Crítico:** Seleccione la red "MATIC" o "Polygon"
6. Ingrese la cantidad
7. Complete la verificación de seguridad
8. Espere la confirmación (generalmente 5-15 minutos)

**Exchanges comunes que admiten el retiro de USDC en Polygon:**

| Exchange   | Soporte Polygon | Tarifa típica |
| ---------- | --------------- | ------------- |
| Coinbase   | Sí              | $0.10-0.50    |
| Binance    | Sí              | $0.10-0.30    |
| Kraken     | Sí              | $0.10-0.50    |
| Crypto.com | Sí              | $0.10-0.25    |
| KuCoin     | Sí              | $0.10-0.30    |
| OKX        | Sí              | $0.10-0.20    |

**Si su exchange no admite retiros en Polygon:**

Tiene dos opciones:

1. Retirar en Ethereum, luego usar un "puente" (bridge) a Polygon (cuesta más en gas)
2. Usar un exchange diferente que admita Polygon

Usar el puente desde Ethereum cuesta $5-15 en tarifas de gas. Usar un exchange con soporte nativo de Polygon cuesta $0.10-0.50. La elección es obvia para cantidades pequeñas.

### Método de financiación 2: Compra directa vía Onramp

Si no tiene criptomonedas en ningún lugar, los servicios de "onramp" le permiten comprar directamente con tarjeta de crédito o transferencia bancaria.

**Servicios de onramp populares:**

| Servicio | Métodos de pago | Tarifas | Soporte Polygon |
| -------- | --------------- | ------- | --------------- |
| Transak  | Tarjeta, banco  | 1-3%    | Sí              |
| MoonPay  | Tarjeta, banco  | 2-4%    | Sí              |
| Ramp     | Tarjeta, banco  | 1-3%    | Sí              |
| Banxa    | Tarjeta, banco  | 2-4%    | Sí              |

**Paso a paso usando Transak:**

1. Visite transak.com
2. Seleccione "Buy" (Comprar)
3. Elija USDC como la criptomoneda
4. Seleccione Polygon como la red
5. Ingrese la cantidad en su moneda local
6. Haga clic en "Buy Now" (Comprar ahora)
7. Conecte la billetera MetaMask o pegue la dirección
8. Complete el pago (tarjeta o banco)
9. El USDC llega directamente a su MetaMask en Polygon

**Las tarifas son más altas que el retiro del exchange** (1-4% vs $0.10-0.50 fijo), pero los onramps son convenientes si está comenzando desde cero.

### Método de financiación 3: Compra integrada en MetaMask

MetaMask incluye funcionalidad de compra a través de servicios asociados:

1. Abra MetaMask
2. Asegúrese de que la red Polygon esté seleccionada
3. Haga clic en "Buy" (Comprar)
4. Seleccione el método de pago
5. Elija la cantidad
6. Complete la compra a través del socio (Transak, MoonPay, etc.)

**Mismas tarifas que el onramp directo** ya que MetaMask enruta a través de los mismos servicios, pero con una integración ligeramente más conveniente.

### Método de financiación 4: Puente desde Ethereum

Si tiene USDC en la red principal de Ethereum y no puede retirar directamente a Polygon desde su exchange:

**Usando el Puente oficial de Polygon:**

1. Visite portal.polygon.technology/bridge
2. Conecte MetaMask
3. Seleccione "Deposit" (Depositar) (Ethereum → Polygon)
4. Elija USDC
5. Ingrese la cantidad
6. Apruebe el gasto de USDC (costo de gas: $2-8)
7. Confirme la transacción del puente (costo de gas: $5-15)
8. Espere 15-30 minutos para la finalización
9. El USDC aparece en la billetera en Polygon

**Costo total de gas de Ethereum: $7-23** dependiendo de la congestión de la red.

**Esta es la opción costosa.** Solo use el puente si:

- Su exchange no admite retiros en Polygon
- Ya tiene USDC atrapado en Ethereum
- La cantidad es lo suficientemente grande como para que las tarifas del puente sean proporcionalmente pequeñas

Para cantidades menores a $200, encontrar un exchange con soporte para Polygon es más económico que usar el puente.

### Verificar que los fondos llegaron

Después de cualquier método de financiación:

1. Abra MetaMask
2. **Asegúrese de que la red Polygon esté seleccionada** (error común: verificar la red incorrecta)
3. Haga clic en "Import tokens" (Importar tokens) si USDC no aparece automáticamente
4. Contrato de USDC en Polygon: `0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359`
5. El saldo debe reflejar su depósito

**Si los fondos no aparecen:**

- Confirme que la transacción se completó en el lado del remitente (exchange, onramp)
- Verifique que está viendo la red Polygon en MetaMask
- Verifique la transacción en Polygonscan usando la dirección de su billetera
- Algunos tokens requieren importación manual (añadir token usando la dirección del contrato)

![Diagrama de flujo que muestra tres rutas de financiación hacia MetaMask en Polygon: ruta de retiro de exchange con las tarifas más bajas, ruta de compra onramp para nuevos usuarios y ruta de puente de Ethereum marcada como opción costosa, con estimaciones de tarifas para cada ruta](../_images/funding-metamask-polygon-three-paths.png)

---

## Obtener MATIC para tarifas de gas

Tiene USDC para el alquiler de GPU, pero aún no puede realizar transacciones. Cada transacción de Polygon requiere una pequeña cantidad de MATIC para pagar las tarifas de gas, incluso las transacciones que involucran otros tokens como USDC.

### Por qué necesita MATIC

**Estructura de tarifas de blockchain:**

- Las tarifas de gas deben pagarse en la moneda nativa de la red
- La moneda nativa de Polygon es MATIC
- Incluso si paga el alquiler de la GPU en USDC, la transacción en sí cuesta MATIC
- Sin MATIC = no puede enviar transacciones

**La cantidad necesaria es diminuta:**

| Acción                  | Costo aproximado de MATIC | Equivalente en USD |
| ----------------------- | ------------------------- | ------------------ |
| Enviar USDC             | 0.001-0.01 MATIC          | $0.001-0.01        |
| Aprobar gasto de token  | 0.005-0.02 MATIC          | $0.005-0.02        |
| Depositar en plataforma | 0.01-0.05 MATIC           | $0.01-0.05         |
| Transacción compleja    | 0.02-0.10 MATIC           | $0.02-0.10         |

**$1-2 en MATIC cubre docenas de transacciones.** No necesita mucho, pero necesita algo.

### Método 1: Retirar MATIC desde un exchange

El mismo proceso que el retiro de USDC:

1. En su exchange, encuentre MATIC
2. Haga clic en "Withdraw" (Retirar)
3. Ingrese la dirección de MetaMask
4. **Seleccione la red Polygon** (algunos exchanges la llaman "MATIC")
5. Retire una cantidad pequeña ($2-5 de valor)
6. MATIC llega a la billetera

**La mayoría de los exchanges importantes admiten el retiro de MATIC en Polygon.** Las tarifas son típicamente $0.01-0.10.

### Método 2: Usar un "Faucet" (Grifo)

Los faucets proporcionan pequeñas cantidades de MATIC gratis, destinados a nuevos usuarios que necesitan gas para comenzar.

**Faucets disponibles:**

| Faucet                                               | Cantidad          | Frecuencia |
| ---------------------------------------------------- | ----------------- | ---------- |
| Polygon Faucet (faucet.polygon.technology)           | 0.001-0.002 MATIC | Diaria     |
| Alchemy Faucet (alchemy.com/faucets/polygon-mainnet) | 0.5 MATIC         | Por cuenta |
| QuickNode Faucet                                     | Variable          | Limitada   |

**Usando el faucet de Alchemy (recomendado):**

1. Visite alchemy.com/faucets/polygon-mainnet
2. Cree una cuenta gratuita de Alchemy (o inicie sesión)
3. Pegue la dirección de su billetera MetaMask
4. Haga clic en "Send Me MATIC" (Envíame MATIC)
5. 0.5 MATIC llega en minutos

**0.5 MATIC es suficiente para aproximadamente 50-100 transacciones**, suficiente para meses de uso típico de alquiler de GPU.

### Método 3: Intercambiar USDC por MATIC (Swap)

Si tiene USDC pero no MATIC, use el intercambio integrado de MetaMask:

1. Abra MetaMask en la red Polygon
2. Haga clic en "Swap" (Intercambiar)
3. Seleccione USDC como token "de"
4. Seleccione MATIC como token "a"
5. Ingrese una cantidad pequeña ($1-2 de valor)
6. Revise la tasa y las tarifas
7. Haga clic en "Swap"

**Problema:** Este intercambio en sí mismo requiere MATIC para el gas. Si tiene exactamente cero MATIC, no puede ejecutar el intercambio.

**Solución para la situación de cero MATIC:**

- Use el faucet primero para obtener el mínimo de MATIC
- Algunos agregadores de intercambio ofrecen "intercambios sin gas" donde ellos adelantan el gas
- Pídale a alguien que le envíe 0.01 MATIC (los miembros de la comunidad a menudo ayudan a los recién llegados)

### Método 4: Patrocinio de gas

Algunas plataformas patrocinan las tarifas de gas para nuevos usuarios:

**Enfoque de GPUFlow:**

GPUFlow detecta cuando los usuarios tienen USDC pero insuficiente MATIC y ofrece patrocinar la tarifa de gas de la primera transacción. Esto permite a los usuarios:

1. Depositar USDC en la plataforma
2. La plataforma cubre el costo de gas para el depósito inicial
3. El usuario puede retirar más tarde una pequeña cantidad de MATIC del saldo de la plataforma si es necesario

**Otras opciones de patrocinio:**

- Algunos protocolos DeFi patrocinan gas para usuarios por primera vez
- Faucets de la comunidad en servidores de Discord
- Onramps de Capa 2 que incluyen una pequeña cantidad de MATIC con compras de USDC

### Cuánto MATIC mantener

**Saldo de MATIC recomendado para el alquiler de GPU:**

| Nivel de uso                    | Saldo de MATIC | Valor en USD | Duración   |
| ------------------------------- | -------------- | ------------ | ---------- |
| Ligero (pocos alquileres/mes)   | 0.5 MATIC      | ~$0.50       | 3-6 meses  |
| Moderado (alquileres semanales) | 2 MATIC        | ~$2.00       | 6-12 meses |
| Pesado (transacciones diarias)  | 5 MATIC        | ~$5.00       | 6-12 meses |

**No necesita mucho.** Incluso los usuarios intensivos rara vez necesitan más de $5 en MATIC para gas durante muchos meses de uso. El costo por transacción es tan bajo que el saldo de MATIC se agota muy lentamente.

### Verificar saldo de MATIC

1. Abra MetaMask
2. Seleccione la red Polygon
3. El saldo de MATIC se muestra en la parte superior (es la moneda nativa, siempre visible)
4. Confirme que el saldo es mayor que 0

**Con USDC y MATIC en su billetera, está listo para conectarse a plataformas de GPU.**

![Comparación que muestra métodos de adquisición de MATIC: retiro de exchange para cantidades mayores, faucets para pequeñas cantidades gratuitas e intercambio para convertir tokens existentes, con el enfoque recomendado resaltado para nuevos usuarios de alquiler de GPU](../_images/matic-acquisition-methods-comparison.png)

---

## Conectar su billetera a plataformas de alquiler de GPU

Su billetera tiene fondos. Ahora conéctela a una plataforma de alquiler de GPU. Esta sección explica lo que sucede durante la conexión y qué permisos está otorgando.

### Entendiendo la conexión de la billetera

Cuando un sitio web solicita conexión con la billetera, está otorgando acceso limitado:

**Lo que la conexión SÍ permite:**

- El sitio web puede ver la dirección de su billetera
- El sitio web puede ver sus saldos de tokens
- El sitio web puede solicitar transacciones (que usted debe aprobar individualmente)

**Lo que la conexión NO permite:**

- El sitio web no puede mover fondos sin su aprobación
- El sitio web no puede firmar transacciones automáticamente
- El sitio web no puede acceder a sus claves privadas o frase semilla

**La conexión de la billetera es como mostrar su identificación**, no entregar sus llaves. El sitio web sabe quién es usted (su dirección) pero no puede actuar como usted.

### Conectando a GPUFlow

**Paso a paso:**

1. Visite gpuflow.app
2. Asegúrese de que MetaMask esté configurado en la red Polygon
3. Haga clic en "Connect Wallet" (Conectar billetera) (generalmente arriba a la derecha)
4. Aparece una ventana emergente de MetaMask mostrando la solicitud de conexión
5. Verifique que la URL del sitio web sea correcta (protección contra phishing)
6. Haga clic en "Connect" (Conectar)
7. La dirección de su billetera ahora aparece en el sitio

**Qué sucedió:**

- GPUFlow ahora puede mostrar su saldo de USDC
- GPUFlow puede preparar transacciones para que usted las firme
- GPUFlow no puede acceder a sus fondos sin aprobación explícita

### Entendiendo las aprobaciones de transacciones

Después de conectarse, encontrará dos tipos de transacciones:

**Tipo 1: Aprobación de token (Approval)**

Antes de que una plataforma pueda usar su USDC, debe "aprobar" el token para su contrato inteligente:

```

La ventana emergente de MetaMask muestra:
"Give permission to access your USDC?" (¿Dar permiso para acceder a su USDC?)
Solicitado por: gpuflow.app
Para contrato: 0x7a3B...

```

**Lo que esto significa:**

- Usted está permitiendo que el contrato especificado transfiera USDC desde su billetera
- Solo ese contrato específico puede usar este permiso
- Puede revocar este permiso más tarde
- Es común aprobar una cantidad "ilimitada" por conveniencia (evita aprobaciones repetidas)

**Tipo 2: Confirmación de transacción**

Cuando realmente deposita, alquila o retira:

```

La ventana emergente de MetaMask muestra:
"Confirm transaction" (Confirmar transacción)
Acción: Deposit 50 USDC to escrow (Depositar 50 USDC en garantía)
Tarifa de gas: 0.02 MATIC (~$0.02)

```

**Lo que esto significa:**

- Usted está autorizando una acción específica con cantidades específicas
- La tarifa de gas mostrada se deducirá de su saldo de MATIC
- Hacer clic en "Confirm" ejecuta la transacción en la blockchain
- La transacción es irreversible una vez confirmada

### Mejores prácticas de seguridad

**Antes de conectarse a cualquier sitio:**

1. **Verifique la URL:** Revise la ortografía cuidadosamente (gpuflow.app vs gpufl0w.app)
2. **Revise el certificado:** Busque https:// y un certificado válido
3. **Guarde sitios legítimos en marcadores:** Evite buscar y hacer clic en anuncios

**Al aprobar transacciones:**

1. **Lea lo que está aprobando:** Cantidad de token, contrato destinatario
2. **Verifique que las tarifas de gas sean razonables:** Las transacciones de Polygon deberían ser inferiores a $0.10
3. **Verifique la red:** Confirme que está en la red esperada (Polygon)
4. **No se apresure:** Tómese el tiempo para verificar los detalles

**Mantenimiento periódico:**

1. **Revise aprobaciones:** Visite revoke.cash para ver todas las aprobaciones de tokens
2. **Revoque aprobaciones no utilizadas:** Elimine permisos para plataformas que ya no usa
3. **Use billeteras separadas:** Considere una billetera dedicada para el alquiler de GPU con fondos limitados

### Conectando a otras plataformas

**Vast.ai con criptomoneda:**

1. Cree una cuenta de Vast.ai (se requiere correo electrónico)
2. Navegue a Billing (Facturación)
3. Haga clic en "Add Credit" (Añadir crédito) → "Cryptocurrency"
4. Seleccione el tipo de cripto
5. Complete el pago a través de la pasarela CoinPayments
6. No se necesita conexión directa de billetera (pago vía pasarela)

**RunPod con criptomoneda:**

1. Cree una cuenta de RunPod
2. Navegue a Billing
3. Haga clic en "Add Funds" (Añadir fondos) → "Crypto"
4. Seleccione el tipo de cripto
5. Complete el pago a través de Coinbase Commerce
6. No se necesita conexión directa de billetera

**Nota:** Vast.ai y RunPod usan pasarelas de pago en lugar de conexión directa de billetera. Usted envía criptomonedas a una dirección proporcionada en lugar de conectar su billetera a su sitio. Este es un modelo diferente a la integración directa de billetera de GPUFlow.

Para una comparación completa de cómo diferentes plataformas manejan los pagos con criptomonedas, consulte nuestra [Guía completa para alquilar GPUs con criptomonedas](/es/rent-gpu-with-crypto/).

### Qué significa cada permiso

| Solicitud de permiso | Lo que permite                                            | Nivel de riesgo      |
| -------------------- | --------------------------------------------------------- | -------------------- |
| "Connect wallet"     | Ver su dirección y saldos                                 | Muy bajo             |
| "Approve [token]"    | El contrato puede transferir el token aprobado            | Bajo-Medio           |
| "Unlimited approval" | El contrato puede transferir cualquier cantidad del token | Medio                |
| "Sign message"       | Probar que usted posee la billetera                       | Muy bajo             |
| "Send transaction"   | Ejecutar una acción específica de blockchain              | Depende de la acción |

**Señales de alerta para rechazar:**

- Solicitudes de aprobación para tokens que no tiene intención de usar
- Cantidades de transacción diferentes a lo que esperaba
- Tarifas de gas dramáticamente más altas de lo normal (¿red incorrecta?)
- Solicitudes de frase semilla (NUNCA son legítimas)
- Firmar mensajes para propósitos desconocidos

![Ventana emergente de aprobación de transacción de MetaMask anotada mostrando elementos clave para verificar: URL del sitio web, dirección del contrato, cantidad de token, tarifa de gas y botones de aprobar/rechazar con etiquetas explicativas para cada elemento](../_images/metamask-transaction-approval-annotated.png)

---

## Solución de problemas comunes

Incluso las configuraciones sencillas encuentran problemas. Esta sección aborda los problemas más comunes que enfrentan los nuevos usuarios.

### Errores de "Transacción fallida" (Transaction Failed)

**Síntoma:** La transacción muestra un estado de fallo en MetaMask después del intento de confirmación.

**Causas comunes y soluciones:**

**Insuficiente MATIC para gas:**

- El mensaje de error a menudo menciona "insufficient funds for gas".
- Tiene USDC pero no tiene MATIC.
- Solución: Adquiera MATIC usando un faucet o retirando desde un exchange.

**Saldo de token insuficiente:**

- Intenta enviar más USDC del que tiene.
- Recuerde: Las tarifas de gas reducen el MATIC disponible, no el USDC.
- Solución: Reduzca la cantidad de la transacción o añada más tokens.

**Deslizamiento (Slippage) demasiado bajo (para intercambios):**

- El precio se movió entre la cotización y la ejecución.
- Solución: Aumente la tolerancia al deslizamiento en la configuración del intercambio (1-3% suele ser suficiente).

**Problemas de Nonce:**

- Una transacción anterior está atascada, bloqueando las transacciones posteriores.
- Solución: En la configuración de MetaMask, vaya a Avanzado → Restablecer cuenta (Reset Account) (esto no pierde fondos).

### Los fondos no aparecen

**Síntoma:** Envió fondos pero la billetera muestra saldo cero.

**Verifique esto en orden:**

**1. ¿Se seleccionó la red correcta?**

- Problema más común: Ver Ethereum cuando los fondos están en Polygon (o viceversa).
- Haga clic en el menú desplegable de redes, cambie a la red correcta.
- Misma dirección, diferentes redes = diferentes saldos.

**2. ¿La transacción realmente se completó?**

- Verifique en el lado del remitente (exchange, otra billetera).
- Encuentre el hash de la transacción.
- Busque en el explorador de bloques apropiado:
  - Polygon: polygonscan.com
  - Ethereum: etherscan.io
- Confirme que la transacción muestra el estado "Success" (Éxito).

**3. ¿El token necesita importación?**

- Algunos tokens no aparecen automáticamente.
- Haga clic en "Import tokens" (Importar tokens) en MetaMask.
- Pegue la dirección del contrato del token:
  - USDC en Polygon: `0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359`
- El token debería aparecer después de la importación.

**4. ¿Envió a la red equivocada?**

- ¿Envió en Ethereum pero esperaba en Polygon?
- Los fondos no se han perdido, simplemente están en una red diferente.
- Cambie MetaMask a la red en la que realmente envió.
- Use un puente para mover los fondos a la red deseada si es necesario.

### Problemas de conexión de MetaMask

**Síntoma:** El sitio web no se conecta a MetaMask o la conexión se cae.

**Soluciones:**

**Actualizar y reintentar:**

- Actualice la página web.
- Haga clic en "Connect Wallet" nuevamente.
- Apruebe en la ventana emergente de MetaMask.

**Verifique que MetaMask esté desbloqueado:**

- Haga clic en el icono de MetaMask.
- Ingrese la contraseña si está bloqueado.
- Reintente la conexión.

**Deshabilite extensiones conflictivas:**

- Otras extensiones de billetera pueden interferir.
- Deshabilite temporalmente Phantom, Coinbase Wallet, etc.
- Reintente la conexión con solo MetaMask activo.

**Pruebe un navegador diferente:**

- Existen problemas específicos del navegador.
- Pruebe Chrome, Firefox o Brave.
- Reinstale la extensión MetaMask si persiste.

**Borrar conexión de MetaMask:**

- En MetaMask: Configuración → Conexiones.
- Encuentre el sitio problemático.
- Haga clic en "Disconnect" (Desconectar).
- Reconecte desde cero.

### Errores de red incorrecta

**Síntoma:** El sitio muestra "Wrong network" o "Please switch to Polygon".

**Solución:**

1. Haga clic en el menú desplegable de redes en MetaMask.
2. Seleccione "Polygon Mainnet".
3. Si Polygon no aparece en la lista, agréguelo (ver sección anterior).
4. Actualice la página del sitio web.
5. Reconecte la billetera si es necesario.

**La mayoría de las plataformas de GPU muestran un aviso** para cambiar de red automáticamente. Haga clic en "Switch Network" en la ventana emergente de MetaMask cuando se le solicite.

### Fallo en la estimación de gas (Gas Estimation Failed)

**Síntoma:** MetaMask muestra "Gas estimation failed" al intentar realizar una transacción.

**Causas comunes:**

**El contrato rechaza la transacción:**

- Saldo de token insuficiente para la operación.
- Intentando interactuar con un contrato incompatible.
- Mantenimiento de la plataforma o problemas técnicos.

**Congestión de la red:**

- Raro en Polygon pero posible.
- Espere unos minutos y reintente.

**Enfoque de solución:**

1. Verifique que tiene saldo suficiente para la acción prevista.
2. Verifique que está en la red correcta.
3. Pruebe con una cantidad de transacción menor.
4. Verifique el estado de la plataforma (Discord, Twitter) para ver problemas conocidos.
5. Intente nuevamente más tarde si sospecha congestión de la red.

### Transacción pendiente atascada

**Síntoma:** La transacción muestra "Pending" (Pendiente) por un tiempo prolongado (más de 5 minutos en Polygon).

**Tiempos de espera normales:**

- Polygon: 5-30 segundos.
- Ethereum: 30 segundos - 5 minutos.
- Tiempos más largos indican un problema.

**Soluciones:**

**Acelerar la transacción:**

1. Haga clic en la transacción pendiente en MetaMask.
2. Haga clic en "Speed Up" (Acelerar).
3. Aumente el precio del gas.
4. Confirme la nueva transacción.
5. El gas más alto reemplaza la transacción atascada.

**Cancelar la transacción:**

1. Haga clic en la transacción pendiente.
2. Haga clic en "Cancel" (Cancelar).
3. Confirme la cancelación (cuesta gas).
4. La transacción original se abandona.

**Último recurso - Restablecer cuenta:**

1. Configuración de MetaMask → Avanzado.
2. Haga clic en "Reset Account" (Restablecer cuenta).
3. Borra el historial de transacciones y el nonce.
4. NO afecta los saldos.
5. Reintente la transacción original.

### Escenarios de recuperación

**Contraseña perdida (pero tiene frase semilla):**

1. Desinstale MetaMask.
2. Reinstale MetaMask.
3. Seleccione "Import using Secret Recovery Phrase" (Importar usando frase secreta de recuperación).
4. Ingrese sus 12 palabras.
5. Cree una nueva contraseña.
6. Billetera restaurada con todos los fondos.

**Frase semilla perdida (pero tiene acceso a MetaMask):**

1. Abra MetaMask mientras aún tenga acceso.
2. Configuración → Seguridad y privacidad.
3. Haga clic en "Reveal Secret Recovery Phrase" (Revelar frase secreta de recuperación).
4. Ingrese la contraseña.
5. Escriba la frase semilla correctamente esta vez.
6. Guárdela de forma segura.

**Perdió tanto la contraseña como la frase semilla:**

- Los fondos se han perdido permanentemente.
- No hay recuperación posible.
- Ningún equipo de soporte puede ayudar.
- Es por esto que el respaldo de la frase semilla es crítico.

![Diagrama de flujo de decisión para la solución de problemas de MetaMask mostrando las rutas de ramificación: transacción fallida lleva a verificar gas y luego saldo, fondos faltantes llevan a verificar red y luego transacción, problemas de conexión llevan a actualizar y verificar extensión, con soluciones en cada punto final](../_images/metamask-troubleshooting-decision-flowchart.png)

---

## Conclusión: Listo para alquilar

Ahora tiene todo lo necesario para el alquiler de GPU basado en criptomonedas:

- ✅ Billetera MetaMask instalada y asegurada
- ✅ Red Polygon configurada para tarifas bajas
- ✅ Financiación en USDC para pagos estables de alquiler de GPU
- ✅ MATIC disponible para tarifas de gas de transacción
- ✅ Comprensión de las conexiones de billetera y permisos

### Lista de verificación de referencia rápida

Antes de su primer alquiler de GPU, confirme:

**Configuración de la billetera:**

- [ ] MetaMask instalado desde la fuente oficial (metamask.io)
- [ ] Frase semilla escrita en papel y guardada de forma segura
- [ ] Contraseña creada para acceso local

**Configuración de la red:**

- [ ] Polygon Mainnet agregado a MetaMask
- [ ] Puede cambiar entre las redes Ethereum y Polygon

**Financiación:**

- [ ] Saldo de USDC en Polygon (verificar red correcta)
- [ ] Saldo de MATIC para tarifas de gas (al menos 0.1 MATIC)

**Seguridad:**

- [ ] Frase semilla almacenada fuera de línea, nunca digitalmente
- [ ] Sitios legítimos de plataformas guardados en marcadores
- [ ] Comprende la diferencia entre aprobación y confirmación de transacción

### Qué viene después

Con la billetera lista, el proceso de alquiler de GPU en sí es rápido:

1. **Conectar:** Visite gpuflow.app, conecte MetaMask.
2. **Depositar:** Transfiera USDC a la garantía de la plataforma.
3. **Seleccionar:** Elija la GPU que coincida con sus requisitos.
4. **Alquilar:** Confirme el alquiler, reciba credenciales de acceso.
5. **Trabajar:** Acceda a la GPU vía SSH o terminal web.
6. **Completar:** Finalice el alquiler, los fondos no utilizados regresan automáticamente.

**Tiempo total desde billetera lista hasta acceso a GPU: Menos de 2 minutos**

Para el recorrido completo del alquiler de GPU, incluyendo selección de plataforma, mecánica de garantía y optimización de costos, consulte nuestra [Guía completa para alquilar GPUs con criptomonedas](/es/rent-gpu-with-crypto/).

### Errores comunes de principiantes a evitar

**No:**

- Almacenar la frase semilla digitalmente (capturas de pantalla, nube, app de notas).
- Enviar fondos sin verificar que la red coincida.
- Aprobar transacciones sin leer los detalles.
- Mantener grandes saldos en una sola plataforma.
- Ignorar los requisitos de tarifa de gas (necesita MATIC, no solo USDC).

**Sí:**

- Comenzar con pequeñas transacciones de prueba.
- Verificar las URL del sitio web antes de conectar.
- Mantener un saldo modesto de MATIC para gas.
- Guardar sitios legítimos de plataformas en marcadores.
- Unirse al Discord de la plataforma para soporte comunitario.

### Costos totales estimados de configuración

| Artículo                     | Costo                                        |
| ---------------------------- | -------------------------------------------- |
| Instalación de MetaMask      | Gratis                                       |
| Configuración de red Polygon | Gratis                                       |
| USDC para alquiler de GPU    | Su elección ($20-100 inicio típico)          |
| MATIC para gas               | $0.50-2.00 (o gratis vía faucet)             |
| Tarifa de retiro de exchange | $0.10-0.50                                   |
| **Total para comenzar**      | **~$1-3 en tarifas + su presupuesto de GPU** |

Compare con los costos de configuración de proveedores tradicionales de nube de $0 en tarifas directas pero horas de tiempo de verificación y tarifas de plataforma continuamente más altas.

### Recursos relacionados

**De este sitio:**

- [Guía completa para alquilar GPUs con criptomonedas](/es/rent-gpu-with-crypto/) — Recorrido completo de alquiler desde la selección de plataforma hasta la finalización.
- [Cómo alquilar GPUs sin KYC o verificación de identidad](/es/how-to-rent-gpu-without-kyc/) — Opciones de alquiler de GPU centradas en la privacidad.
- [Tarifas ocultas en el alquiler de GPU: Cómo las criptomonedas ahorran dinero a los usuarios internacionales](/es/hidden-fees-in-gpu-rental/) — Análisis de costos para usuarios internacionales.

**Recursos externos:**

- [Soporte de MetaMask](https://support.metamask.io) — Documentación oficial y solución de problemas.
- [Documentación de Polygon](https://wiki.polygon.technology) — Detalles técnicos de la red.
- [Polygonscan](https://polygonscan.com) — Explorador de bloques para verificación de transacciones.

![Lista de verificación de finalización de configuración mostrando cuatro etapas completadas con marcas de verificación: MetaMask instalado, Polygon configurado, billetera financiada con USDC, MATIC adquirido para gas, seguido de una flecha apuntando a "Listo para alquiler de GPU" con el logotipo de GPUFlow](../_images/metamask-polygon-setup-complete-checklist.png)

---

## Preguntas frecuentes (FAQ)

### ¿Por qué necesito MetaMask para el alquiler de GPU?

MetaMask es una billetera de criptomonedas que almacena sus fondos y le permite interactuar con plataformas basadas en blockchain. Las plataformas de alquiler de GPU que usan pagos con criptomonedas requieren una billetera para mantener sus fondos y aprobar transacciones. Cuando alquila una GPU en plataformas como GPUFlow, su pago va a un depósito en garantía de contrato inteligente; MetaMask es como usted autoriza ese depósito y luego recibe de vuelta los fondos no utilizados. Se recomienda MetaMask porque es la billetera más compatible, funcionando con casi todas las plataformas que aceptan criptomonedas. Se instala como una extensión del navegador, toma unos 5 minutos configurarla y es de uso gratuito.

### ¿Por qué usar Polygon en lugar de Ethereum para el alquiler de GPU?

Polygon ofrece tarifas de transacción dramáticamente más bajas: $0.001-0.05 por transacción en comparación con los $1-10 o más de Ethereum. Para el alquiler de GPU, donde podría depositar fondos, iniciar un alquiler, detener un alquiler y retirar el saldo restante (mínimo cuatro transacciones), las tarifas de gas de Ethereum podrían exceder fácilmente el costo de los alquileres cortos de GPU. Un alquiler de 2 horas que cuesta $1.20 en una RTX 4090 requeriría $10-20 en tarifas de gas de Ethereum, haciéndolo económicamente irracional. El mismo flujo de trabajo en Polygon cuesta menos de $0.10 en tarifas totales. Las plataformas de GPU como GPUFlow usan Polygon específicamente porque las tarifas bajas hacen prácticas las transacciones pequeñas y medianas.

### ¿Qué es una frase semilla y por qué es tan importante?

Una frase semilla (también llamada frase de recuperación o frase secreta de recuperación) es una secuencia de 12 o 24 palabras que proporciona acceso completo a su billetera de criptomonedas. Estas palabras, en su orden exacto, derivan matemáticamente sus claves privadas. Cualquiera que tenga estas palabras puede acceder a todos los fondos en la billetera desde cualquier dispositivo, en cualquier parte del mundo. No hay restablecimiento de contraseña, ni verificación de identidad, ni equipo de soporte que pueda ayudar si pierde su frase semilla: es la única forma de recuperar una billetera si su dispositivo falla. Debe escribirla en papel, nunca almacenarla digitalmente y guardarla en una ubicación física segura. La pérdida de la frase semilla junto con la falla del dispositivo significa la pérdida permanente e irrecuperable de todos los fondos.

### ¿Cuánto MATIC necesito para las tarifas de gas?

Muy poco. Las tarifas de transacción de Polygon son aproximadamente $0.001-0.05 por transacción, por lo que $0.50-2.00 en MATIC (aproximadamente 0.5-2 MATIC a precios actuales) proporciona suficiente gas para 50-200 o más transacciones. Esto cubre meses de uso típico de alquiler de GPU, incluidos depósitos, alquileres y retiros. Necesita MATIC específicamente para el gas incluso cuando paga el alquiler de la GPU en USDC, porque las tarifas de transacción de blockchain deben pagarse en la moneda nativa de la red. Si recién está comenzando, obtener 0.5 MATIC de un faucet (gratis) es suficiente para las transacciones iniciales, y puede adquirir más tarde si es necesario.

### ¿Puedo usar una billetera distinta a MetaMask?

Sí. Las alternativas incluyen Rainbow (excelente experiencia móvil), Coinbase Wallet (conveniente para usuarios de Coinbase), Rabby (características amigables para desarrolladores), Trust Wallet (enfocada en móviles) y billeteras de hardware como Ledger con integración de extensión de navegador. Las plataformas de alquiler de GPU generalmente admiten cualquier billetera compatible con el protocolo WalletConnect o conexión directa de extensión de navegador compatible con Ethereum. Se recomienda MetaMask para principiantes debido a la extensa documentación, la compatibilidad más amplia entre plataformas, la comunidad de usuarios más grande para ayuda en la resolución de problemas y el historial más largo. Una vez que se sienta cómodo con las criptomonedas, puede explorar alternativas que se adapten mejor a sus preferencias.

### ¿Qué pasa si envío fondos a la red equivocada?

Los fondos enviados a la red equivocada no se pierden; simplemente están en una red diferente a la esperada. La dirección de su billetera es la misma en Ethereum y Polygon, por lo que los fondos enviados a su dirección en cualquiera de las redes le pertenecen. Si envió USDC en Ethereum pero lo esperaba en Polygon: cambie MetaMask a Ethereum Mainnet y verá los fondos allí. Para moverlos a Polygon, use un puente (portal.polygon.technology), lo cual cuesta tarifas de gas de Ethereum ($5-15). El error cuesta tarifas y tiempo adicionales pero no resulta en la pérdida de fondos. Siempre verifique la red seleccionada antes de confirmar cualquier transacción de envío.

### ¿Cómo sé si un sitio web es seguro para conectar mi billetera?

Verifique la seguridad a través de múltiples comprobaciones. Primero, confirme que la URL esté escrita correctamente; los sitios de phishing usan dominios de aspecto similar (gpufl0w.app en lugar de gpuflow.app). Segundo, verifique HTTPS y un certificado de seguridad válido. Tercero, guarde los sitios legítimos en marcadores y úselos en lugar de buscar cada vez. Cuarto, investigue la plataforma a través de canales comunitarios (Discord, Reddit, Twitter) antes de conectarse. Cuando aparece la ventana emergente de conexión, MetaMask muestra el sitio web solicitante; verifique que esto coincida con sus expectativas. Recuerde que la conexión de la billetera solo revela su dirección y saldos; las transferencias de fondos reales requieren aprobación por separado. Comience con cantidades pequeñas en plataformas nuevas hasta que haya verificado la legitimidad a través de transacciones exitosas.

### ¿Qué significa "aprobar" (approving) un token?

La aprobación de token otorga a un contrato inteligente específico permiso para transferir un token específico desde su billetera. Esto es independiente de transferir fondos realmente. Cuando deposita USDC en una plataforma de alquiler de GPU, ocurren dos transacciones: primero, aprueba el contrato de garantía de la plataforma para acceder a su USDC; segundo, confirma el depósito real. La aprobación es necesaria debido a cómo funcionan los tokens de blockchain: los contratos no pueden extraer tokens de su billetera sin permiso explícito. Puede aprobar una cantidad limitada (debe volver a aprobar cuando se agote) o una cantidad ilimitada (conveniente pero requiere confianza en el contrato). Las aprobaciones se pueden revisar y revocar en cualquier momento en sitios como revoke.cash.

### ¿Por qué falló mi transacción?

Los fallos de transacción tienen varias causas comunes. MATIC insuficiente para el gas es lo más común: necesita MATIC para pagar tarifas incluso cuando realiza transacciones en USDC. Saldo de token insuficiente (intentar enviar más de lo que tiene) también causa fallos. Interactuar con un contrato incorrectamente (red incorrecta, parámetros incompatibles) desencadena fallos. La congestión de la red ocasionalmente causa problemas, aunque esto es raro en Polygon. El mensaje de error en MetaMask generalmente da una pista sobre la causa. Verifique primero el saldo de MATIC (problema más común para nuevos usuarios), luego verifique que está en la red correcta y luego intente reducir la cantidad de la transacción.

### ¿Puedo recuperar mi billetera si pierdo mi contraseña?

Sí, si tiene su frase semilla. Perder su contraseña de MetaMask significa que no puede acceder a la billetera en ese dispositivo específico, pero la frase semilla proporciona una recuperación completa. Desinstale MetaMask, reinstálelo, seleccione "Import using Secret Recovery Phrase", ingrese sus 12 palabras y cree una nueva contraseña. Su billetera, incluidos todos los saldos, se restaura completamente. Sin embargo, si pierde tanto su contraseña como su frase semilla, la recuperación es imposible. Ninguna empresa, equipo de soporte o proceso técnico puede recuperar una billetera sin la frase semilla. Es por esto que el respaldo seguro de la frase semilla es absolutamente crítico antes de agregar fondos a su billetera.

### ¿Cuánto tardan las transacciones en Polygon?

Las transacciones de Polygon generalmente se confirman en 2-5 segundos en condiciones normales. Verá que la transacción aparece como "pending" brevemente en MetaMask, luego cambia a "confirmed". Ocasionalmente, durante un alto uso de la red, la confirmación puede tardar 15-30 segundos. Si una transacción permanece pendiente por más de 5 minutos, probablemente algo anda mal: precio de gas insuficiente, problemas de red o problemas de nonce. Puede "acelerar" transacciones atascadas en MetaMask haciendo clic en la transacción pendiente y seleccionando "Speed Up", lo que la vuelve a enviar con gas más alto. En comparación con la red principal de Ethereum (30 segundos a varios minutos) y Bitcoin (10-60 minutos), la velocidad de Polygon es esencialmente instantánea para fines prácticos.

---

**¿Listo para configurar su billetera?** Comience descargando MetaMask desde [metamask.io](https://metamask.io), luego siga los pasos de esta guía. En quince minutos, estará listo para alquilar su primera GPU con criptomonedas en [GPUFlow](https://gpuflow.app/) sin necesidad de verificación de identidad, sin una configuración de cuenta larga y sin necesidad de tarjeta de crédito.
