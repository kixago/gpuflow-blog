---
title: "Por qué las empresas prohíben ChatGPT en el trabajo y qué usan en su lugar"
description: "Las empresas restringen los chats de IA públicos porque la plantilla pega datos que la empresa no tiene ningún contrato para compartir. Los casos reales, las normas de 2026 y alternativas que funcionan."
excerpt: "La mayoría de las prohibiciones de ChatGPT en las empresas tienen que ver con contratos y con la configuración por defecto. Qué salió mal en Samsung, qué prometen hoy los planes de empresa y adónde va tu prompt en cada opción."
pubDate: 2026-02-26
updatedDate: 2026-09-30
locale: "es"
category: "case-studies"
featured: false
draft: false
author: "GPUFlow Team"
heroImage: "../_images/corporate-ai-policy-restriction.png"
heroImageAlt: "Oficina corporativa con símbolos de candados digitales superpuestos a las pantallas de los ordenadores, que representan restricciones de acceso a la IA"
faq:
  - question: "¿Por qué las empresas prohíben ChatGPT a sus empleados?"
    answer: "Porque la plantilla pega datos de la empresa y de sus clientes en una cuenta de consumo con la que la empresa no tiene ningún contrato. En los planes de consumo de ChatGPT, la configuración por defecto permite a OpenAI usar el contenido para mejorar sus modelos, y no hay ningún contrato de encargado del tratamiento ni acuerdo de socio comercial de HIPAA que cubra a la empresa."
  - question: "¿ChatGPT Enterprise entrena con los datos de la empresa?"
    answer: "No, no por defecto. La página de privacidad empresarial de OpenAI dice que no entrena con datos de ChatGPT Enterprise, Business, Edu ni de la API salvo que el cliente lo acepte expresamente, y cita auditorías SOC 2 Type 2 y conservación controlada por el administrador para Enterprise."
  - question: "¿Qué empresas restringieron ChatGPT?"
    answer: "Samsung restringió la IA generativa en los dispositivos de la empresa en 2023, tras las filtraciones de código fuente y datos internos de las que informó la prensa. Según los medios, Apple, JPMorgan, Bank of America, Citi, Deutsche Bank, Goldman Sachs, Wells Fargo, Walmart y Verizon también la restringieron ese año."
  - question: "¿Es legal meter datos de clientes en ChatGPT según el RGPD?"
    answer: "Solo con una base jurídica y un contrato de encargado del tratamiento que cumpla el artículo 28 del RGPD. Un plan de empresa con un acuerdo de tratamiento de datos puede cumplirlo; la cuenta personal de un empleado no, porque la empresa no tiene ningún contrato con el proveedor para esa cuenta."
  - question: "¿Cuándo se aplican las normas de alto riesgo del Reglamento de IA de la UE?"
    answer: "Tras la modificación del AI Omnibus, que entró en vigor el 27 de julio de 2026, las normas de alto riesgo para sistemas independientes, como la criba de currículos, se aplican desde el 2 de diciembre de 2027, y para la IA en productos regulados desde el 2 de agosto de 2028. Las obligaciones de transparencia del artículo 50 se aplican desde el 2 de agosto de 2026."
  - question: "¿Puedo usar GPUFlow para datos confidenciales de la empresa?"
    answer: "No. En GPUFlow el modelo se ejecuta en el ordenador del propio proveedor, así que los prompts y las respuestas pasan sin cifrar por esa máquina. Las condiciones prohíben a los proveedores registrarlos, pero es una norma contractual, no un bloqueo técnico, así que úsalo solo con datos que podrías compartir con un desconocido."
---

La mayoría de las empresas que «prohíben ChatGPT» no tienen nada contra la IA. Lo que no aceptan es que la plantilla pegue datos de la empresa en una cuenta de consumo con la que la empresa no tiene contrato, y donde, por defecto, el proveedor puede usarlos para mejorar sus modelos. La solución habitual es una herramienta aprobada: un plan de empresa con condiciones de no entrenamiento y de conservación, un endpoint de modelo dentro de la cuenta en la nube de la propia empresa o un modelo de pesos abiertos en hardware que gestiona la empresa. Con el contrato adecuado, las herramientas públicas sirven para mucho trabajo.

A continuación: qué pasó de verdad en los casos que todo el mundo cita, qué normas se aplican en 2026, qué dicen hoy las condiciones empresariales de cada proveedor y adónde va tu texto en cada opción. Todo se contrastó con fuentes primarias en septiembre de 2026; están al final.

## Qué pasó en Samsung y en los bancos

Samsung es el caso que cita todo el mundo. A principios de 2023, su negocio de semiconductores permitió a los ingenieros usar ChatGPT. Después, la prensa coreana informó de tres incidentes distintos: empleados que pegaron código fuente para corregir errores, que usaron la herramienta para redactar actas de reuniones y que introdujeron datos de medición de equipos y de rendimiento de producción. Samsung no confirmó los detalles en su momento. A finales de abril de 2023, un comunicado interno informó a la plantilla de una de sus mayores divisiones de que la IA generativa quedaba restringida temporalmente en los ordenadores de la empresa. En una encuesta interna del mes anterior, el 65 % de los participantes había dicho que le preocupaban los riesgos de seguridad.

Apple restringió ChatGPT y GitHub Copilot en mayo de 2023, según el Wall Street Journal, por miedo a que los datos confidenciales acabaran en manos de desarrolladores que entrenan modelos con datos de los usuarios. Las mismas informaciones citaban a JPMorgan, Bank of America, Citi, Deutsche Bank, Goldman Sachs, Wells Fargo, Walmart y Verizon entre las empresas que habían restringido ChatGPT.

Hay dos cosas de estos casos que se pasan por alto con facilidad.

La primera: nadie sufrió un ataque. Los datos fueron exactamente adonde los envió el empleado. La preocupación era lo que pasa después: quién los guarda, durante cuánto tiempo, si entrenan un modelo y si un tribunal puede obligar al proveedor a entregarlos.

La segunda: las prohibiciones no duraron como prohibiciones. JPMorgan creó su propia plataforma interna, LLM Suite, que da a la plantilla acceso a modelos de lenguaje grandes «en un entorno seguro». Se lanzó en el verano de 2024 y llegó a 200.000 usuarios dados de alta en ocho meses. Es la trayectoria típica: bloquear la app de consumo y después dar a la gente algo aprobado.

## Cuál es el riesgo de verdad

Cuando un empleado usa una cuenta personal de consumo, se acumulan cuatro problemas distintos.

**Entrenamiento por defecto.** En ChatGPT Free, Plus y Pro, el contenido se puede usar para mejorar los modelos de OpenAI salvo que el usuario desactive «Improve the model for everyone» en Data controls. Si el usuario pulsa el pulgar arriba o abajo, puede usarse la conversación entera aunque haya desactivado la opción. Los planes de consumo de Claude de Anthropic usan los chats para entrenar si el usuario permite la mejora del modelo. Así que el que tu código fuente acabe en un conjunto de entrenamiento depende de un ajuste en la cuenta de otra persona.

**Una conservación que no controlas.** Los datos empresariales en la plataforma de OpenAI se borran en un plazo de 30 días después de que el usuario los elimine, «salvo que la ley nos obligue a conservarlos». Esa última cláusula no es teórica. En la demanda del New York Times, una orden judicial vigente de junio de 2025 al 26 de septiembre de 2025 obligó a OpenAI a conservar contenido de ChatGPT de consumo y de la API estándar que, de otro modo, habría borrado. Los clientes de ChatGPT Enterprise, Edu y de la API con conservación cero de datos no estaban afectados.

**Sin contrato.** Legalmente, este es el que más pesa. Según el RGPD, una empresa que deja que un proveedor trate datos personales debe recurrir a un encargado del tratamiento que ofrezca «garantías suficientes» y tener con él un contrato vinculante (artículo 28). Un proveedor sanitario necesita un acuerdo de socio comercial (BAA). La cuenta personal de un empleado no tiene ni lo uno ni lo otro, así que el incumplimiento se produce en el momento de pegar el texto, se filtre algo o no.

**Sin registros.** Las empresas reguladas tienen que supervisar y archivar las comunicaciones profesionales. Un chat en una cuenta personal queda fuera de todos los archivos que gestiona el equipo de cumplimiento normativo.

## Las normas que se aplican en 2026

### RGPD

Meter datos personales de clientes o empleados de la UE en un prompt es un tratamiento. Necesita una base jurídica, un contrato de encargado del tratamiento según el artículo 28 y una vía legal para cualquier transferencia fuera de la UE. Para los proveedores de EE. UU., el Marco de Privacidad de Datos UE-EE. UU. sigue siendo válido: el Tribunal General de la UE desestimó el recurso Latombe el 3 de septiembre de 2025 (asunto T-553/23). Hay un recurso de casación pendiente ante el Tribunal de Justicia con el número C-703/25 P, así que conviene seguirlo.

Los reguladores ya han actuado directamente contra los servicios de chat. El Garante italiano bloqueó ChatGPT de forma temporal a finales de marzo de 2023, y en diciembre de 2024 multó a OpenAI con 15 millones de euros por tratar datos personales para entrenar ChatGPT sin una base jurídica adecuada, no notificar una brecha de marzo de 2023, falta de transparencia y ausencia de verificación de edad. OpenAI calificó la multa de desproporcionada y anunció que la recurriría.

### HIPAA

Cualquier servicio que reciba, almacene o transmita información sanitaria protegida en formato electrónico por cuenta de una entidad cubierta es un socio comercial y necesita un BAA firmado. El HHS deja claro que un proveedor en la nube que solo guarda datos cifrados y no tiene la clave sigue siendo un socio comercial. OpenAI dice que puede firmar BAA para su API. La cuenta personal de ChatGPT de un médico no viene con ningún BAA.

### Servicios financieros

El Regulatory Notice 24-09 de FINRA (27 de junio de 2024) dice que sus normas se aplican a la IA generativa «igual que cuando las firmas miembro usan cualquier otra tecnología o herramienta». La supervisión, las comunicaciones con el público y la conservación de registros siguen aplicándose. La mayoría de las restricciones de los bancos en 2023 salieron justo de ahí.

### Reglamento de IA de la UE

El Reglamento de IA entró en vigor el 1 de agosto de 2024. Las prohibiciones de prácticas vetadas y la obligación de alfabetización en IA se aplican desde el 2 de febrero de 2025, y las obligaciones para los proveedores de modelos de IA de uso general, desde el 2 de agosto de 2025. La modificación AI Omnibus, el Reglamento (UE) 2026/1744, se publicó el 24 de julio de 2026 y entró en vigor el 27 de julio de 2026. Movió los plazos de alto riesgo: el 2 de diciembre de 2027 para los sistemas de alto riesgo independientes, entre los que está la IA usada en selección de personal, como la clasificación de currículos, y el 2 de agosto de 2028 para la IA integrada en productos regulados. Las obligaciones de transparencia del artículo 50 se aplicaron según lo previsto desde el 2 de agosto de 2026, y la obligación de alfabetización en IA se suavizó para limitarse a adoptar medidas que la «fomenten».

Para una empresa que usa un asistente de chat para redactar correos, el Reglamento de IA añade poco. Si el mismo asistente empieza a ordenar candidatos a un puesto, estás desplegando un sistema de alto riesgo y la fecha de diciembre de 2027 va contigo.

## Qué prometen los planes de empresa

Todos los grandes proveedores venden ya un nivel para empresas con una configuración por defecto distinta de la de la app de consumo. La tabla resume lo que dice la página de cada proveedor en septiembre de 2026.

| Oferta | ¿Entrena con tus datos por defecto? | Conservación y control | Notas de cumplimiento |
| --- | --- | --- | --- |
| ChatGPT Free, Plus, Pro | Puede, salvo que el usuario lo desactive | Por cuenta de usuario | Sin contrato con la empresa |
| ChatGPT Business, Enterprise, Edu | No | Los administradores del espacio de trabajo fijan la conservación | SOC 2 Type 2 para Enterprise y Business |
| API de OpenAI | No | Se borra a los 30 días; conservación cero de datos para usos que cumplan los requisitos | BAA disponible |
| Claude Team, Enterprise, API | No | Los comentarios pueden conservarse hasta 5 años; los propietarios pueden desactivarlos | Condiciones comerciales |
| Microsoft 365 Copilot y Copilot Chat | No, no se usa para entrenar modelos fundacionales | Se aplican tus políticas de conservación, etiquetas y auditoría | DPA, EU Data Boundary (excluidos los modelos de Anthropic) |
| Gemini en Google Workspace | No se usa para entrenar fuera de tu dominio sin permiso | Se aplican los controles de Workspace que ya tienes | Soporte de HIPAA, FedRAMP High |

Los endpoints de modelos dentro de las grandes nubes van más allá. Microsoft dice que los prompts y las respuestas de los modelos que vende Azure en Microsoft Foundry «NO están disponibles para OpenAI ni para otros proveedores» y se procesan dentro de la geografía que elijas, salvo que optes por un despliegue Global o DataZone. En Amazon Bedrock, los modelos se ejecutan en cuentas de despliegue a las que los proveedores de los modelos no tienen acceso, así que nunca ven tus prompts ni tus respuestas.

Lo que un plan de empresa no cambia: el texto sigue en los servidores del proveedor durante el tiempo que permitan las condiciones de conservación, y una orden judicial puede seguir alcanzándolo. Es la misma confianza que ya depositas en tus proveedores de correo y de documentos. Para la mayoría del trabajo interno, es un intercambio razonable. Para secretos comerciales, datos regulados sin un BAA o material que un contrato con un cliente prohíbe enviar a subencargados, puede que no.

## Adónde va tu prompt en cada opción

La forma honesta de comparar las opciones es seguir un prompt y preguntarse quién puede leerlo.

<figure>
<svg viewBox="0 0 720 470" role="img" aria-labelledby="d1-title" xmlns="http://www.w3.org/2000/svg" font-family="system-ui, sans-serif" font-size="15">
<title id="d1-title">Adónde va el prompt de un empleado en cinco configuraciones de IA distintas y qué lo protege en cada una</title>
<rect x="0" y="0" width="720" height="470" fill="#ffffff"/>
<text x="325" y="30" text-anchor="middle" fill="#64748b">Adónde va el texto</text>
<text x="475" y="30" fill="#64748b">Qué lo protege</text>
<rect x="20" y="200" width="140" height="70" rx="10" fill="#eef2ff" stroke="#6366f1" stroke-width="2"/>
<text x="90" y="231" text-anchor="middle" fill="#1e1b4b">Prompt del</text>
<text x="90" y="252" text-anchor="middle" fill="#1e1b4b">empleado</text>
<line x1="160" y1="235" x2="200" y2="80" stroke="#6366f1" stroke-width="2"/>
<line x1="160" y1="235" x2="200" y2="160" stroke="#6366f1" stroke-width="2"/>
<line x1="160" y1="235" x2="200" y2="240" stroke="#6366f1" stroke-width="2"/>
<line x1="160" y1="235" x2="200" y2="320" stroke="#6366f1" stroke-width="2"/>
<line x1="160" y1="235" x2="200" y2="400" stroke="#6366f1" stroke-width="2"/>
<rect x="200" y="50" width="250" height="60" rx="10" fill="#ffffff" stroke="#f97316" stroke-width="2"/>
<text x="325" y="76" text-anchor="middle" fill="#1e1b4b">App de chat de consumo</text>
<text x="325" y="97" text-anchor="middle" fill="#64748b" font-size="13">cuenta personal Free, Plus o Pro</text>
<text x="475" y="76" fill="#1e1b4b" font-size="14">Entrena con él por defecto</text>
<text x="475" y="97" fill="#1e1b4b" font-size="14">Sin contrato con tu empresa</text>
<rect x="200" y="130" width="250" height="60" rx="10" fill="#eef2ff" stroke="#6366f1" stroke-width="2"/>
<text x="325" y="156" text-anchor="middle" fill="#1e1b4b">Plan de empresa del proveedor</text>
<text x="325" y="177" text-anchor="middle" fill="#64748b" font-size="12">en el proveedor, cuenta de empresa</text>
<text x="475" y="156" fill="#1e1b4b" font-size="14">Sin entrenamiento por defecto</text>
<text x="475" y="177" fill="#1e1b4b" font-size="14">DPA, control de conservación</text>
<rect x="200" y="210" width="250" height="60" rx="10" fill="#eef2ff" stroke="#6366f1" stroke-width="2"/>
<text x="325" y="236" text-anchor="middle" fill="#1e1b4b" font-size="14">Endpoint del modelo en tu nube</text>
<text x="325" y="257" text-anchor="middle" fill="#64748b" font-size="13">Azure Foundry, Amazon Bedrock</text>
<text x="475" y="236" fill="#1e1b4b" font-size="14">Tu tenant y tu región</text>
<text x="475" y="257" fill="#1e1b4b" font-size="14">El creador del modelo no lo ve</text>
<rect x="200" y="290" width="250" height="60" rx="10" fill="#ffffff" stroke="#16a34a" stroke-width="2"/>
<text x="325" y="316" text-anchor="middle" fill="#1e1b4b">Tus propios servidores</text>
<text x="325" y="337" text-anchor="middle" fill="#64748b" font-size="13">modelo de pesos abiertos, tu red</text>
<text x="475" y="316" fill="#1e1b4b" font-size="14">Nada sale de tu red</text>
<text x="475" y="337" fill="#1e1b4b" font-size="14">Tú lo mantienes y parcheas todo</text>
<rect x="200" y="370" width="250" height="60" rx="10" fill="#ffffff" stroke="#f97316" stroke-width="2"/>
<text x="325" y="396" text-anchor="middle" fill="#1e1b4b">GPU de un mercado (GPUFlow)</text>
<text x="325" y="417" text-anchor="middle" fill="#64748b" font-size="13">el ordenador de un proveedor</text>
<text x="475" y="396" fill="#1e1b4b" font-size="14">Sin cifrar en esa máquina</text>
<text x="475" y="417" fill="#1e1b4b" font-size="14">Grabarlo lo prohíbe el contrato</text>
<text x="360" y="458" text-anchor="middle" fill="#64748b" font-size="13">Naranja: solo datos públicos. Verde: lo que pueda guardar tu propio departamento de TI.</text>
</svg>
<figcaption>El mismo prompt, cinco destinos. Solo la opción autoalojada lo mantiene dentro de tu red; el plan de empresa y el endpoint en la nube lo mantienen bajo un contrato que ha firmado tu empresa.</figcaption>
</figure>

## Ejecutar tú mismo modelos de pesos abiertos

La opción más sólida para datos confidenciales es también la que más trabajo da: descargar un modelo de pesos abiertos (Llama, Qwen, Mistral, Gemma y otros) y ejecutarlo en máquinas dentro de tu propia red. Los prompts no salen nunca. Tú decides qué se registra y durante cuánto tiempo, lo que facilita cumplir las obligaciones de conservación de registros y las normas de conservación del RGPD, y ninguna cláusula de conservación ni orden judicial ajena toca los datos.

Pero los costes son reales. Pasas a operar un servicio de inferencia: GPU, un motor como Ollama o vLLM, autenticación, registros, actualizaciones y alguien de guardia. Y un modelo de 8B o 14B que cabe en una sola tarjeta de estación de trabajo razona peor que un modelo de frontera en tareas largas. Para clasificar, extraer campos, resumir documentos internos y redactar textos rutinarios suele bastar. Pruébalo con tus propias tareas antes de decidir. Nuestra [prueba de rendimiento de Ollama, vLLM y TGI](/es/ollama-vs-vllm-vs-tgi-rtx-4090-benchmark/) trata la elección del motor, y la [guía de fine-tuning privado de LLM](/es/private-llm-fine-tuning-guide/) explica cómo adaptar un modelo a tus documentos.

Hay un camino intermedio que siguen muchas empresas: ejecutar el modelo abierto en instancias con GPU dentro de la cuenta en la nube que ya tienen. El proveedor de nube pasa a ser un encargado del tratamiento bajo un DPA que ya has negociado para todo lo demás, y no interviene ningún proveedor de modelos.

## Dónde encajan las GPU alquiladas y GPUFlow

Los mercados de GPU son la parte barata del mercado, y solo caben en esta comparativa con una etiqueta clara.

GPUFlow es uno de ellos. Alquilas una GPU durante un número de horas y obtienes una clave API compatible con OpenAI para el modelo abierto que el proveedor ejecuta en ella, normalmente con Ollama. El modelo se ejecuta en el ordenador del propio proveedor. Eso significa que tus prompts y las respuestas pasan sin cifrar por esa máquina mientras dura el alquiler. Las condiciones de GPUFlow prohíben a los proveedores grabar, leer, conservar o compartir las peticiones o respuestas de los inquilinos, y GPUFlow no guarda el texto. Pero el proveedor tiene root en la máquina, y la prohibición de grabar se hace cumplir por contrato; nada técnico lo impide.

Así que GPUFlow **no** es la respuesta para datos regulados o confidenciales. No le envíes registros de clientes, datos sanitarios, código fuente que te importe ni nada que restrinja un contrato con un cliente. Nuestra propia documentación lo dice más claro todavía: no envíes contraseñas, números de tarjeta ni otros secretos que no compartirías con un desconocido.

Dónde sí encaja: probar un modelo abierto en hardware real antes de comprar una tarjeta, lanzar prompts sobre datos públicos o sintéticos, y desarrollar y probar una aplicación contra una API compatible con OpenAI antes de apuntarla a tu propio servidor. Las máquinas de nube comunitaria de otros mercados plantean la misma pregunta con todo lo que subes; [cómo proteger tu conjunto de datos en un nodo de GPU público](/es/how-to-secure-dataset-on-public-gpu-node/) trata ese lado.

## Una política que la gente vaya a cumplir

Una prohibición a secas, sin alternativa, sobre todo desplaza el uso a los móviles personales, donde ves todavía menos. Funciona mejor algo lo bastante corto para recordarlo:

| Tipo de datos | Ejemplos | Herramientas permitidas |
| --- | --- | --- |
| Públicos | Documentación publicada, textos de marketing | Cualquier herramienta aprobada, incluidas las apps de consumo |
| Internos | Políticas, wikis internas, código no sensible | Planes de empresa con DPA y entrenamiento desactivado |
| Confidenciales | Datos de clientes, secretos comerciales, condiciones de operaciones | Endpoint en la nube dentro de tu tenant, o autoalojado |
| Regulados | Datos sanitarios, datos de tarjetas, datos personales a gran escala | Autoalojado, o un proveedor con el acuerdo específico (BAA, DPA) |

Después, la parte poco vistosa:

1. Contrata un plan de empresa o un endpoint en la nube y conviértelo en la opción por defecto, con inicio de sesión único para que las cuentas se cierren cuando alguien se va.
2. Fija la conservación en el plazo más corto que cumpla tus obligaciones de registro y confirma en la consola de administración que el entrenamiento está desactivado.
3. Bloquea los chats de IA de consumo en los dispositivos gestionados, pero solo cuando la herramienta aprobada ya esté funcionando.
4. Mantén un inventario de los usos de la IA. Todo lo que afecte a contrataciones, créditos o decisiones similares necesita una revisión aparte antes de diciembre de 2027.
5. Di a la gente qué hacer en lugar de decirle solo qué no hacer. El comunicado de Samsung llegó cuando los datos ya habían salido.

Para el coste de funcionamiento del autoalojamiento frente a los servicios por token, consulta [¿GPU por horas o API por token?](/es/hourly-gpu-vs-per-token-api/).

## Fuentes

- Restricción y encuesta de Samsung: [CNBC, 2 de mayo de 2023](https://www.cnbc.com/2023/05/02/samsung-bans-use-of-ai-like-chatgpt-for-staff-after-misuse-of-chatbot.html); detalles de los incidentes: [The Register, 2 de mayo de 2023](https://www.theregister.com/2023/05/02/samsung_generative_ai_ban/)
- Apple y otras empresas: [TechCrunch, 19 de mayo de 2023](https://techcrunch.com/2023/05/19/apple-reportedly-limits-internal-use-of-ai-powered-tools-like-chatgpt-and-github-copilot/)
- LLM Suite de JPMorgan: [blog de tecnología de JPMorganChase, 3 de junio de 2025](https://www.jpmorganchase.com/about/technology/blog/llmsuite-ab-award)
- Condiciones empresariales de OpenAI: [privacidad empresarial](https://openai.com/enterprise-privacy/); ajustes de entrenamiento para consumo: [cómo se usan tus datos para mejorar el rendimiento del modelo](https://help.openai.com/en/articles/5722486-how-your-data-is-used-to-improve-model-performance)
- Orden de conservación del NYT: [OpenAI, respuesta a las exigencias de datos del NYT](https://openai.com/index/response-to-nyt-data-demands/)
- Anthropic: [datos comerciales y entrenamiento](https://privacy.claude.com/en/articles/7996868-is-my-data-used-for-model-training), [datos de consumo y entrenamiento](https://privacy.claude.com/en/articles/10023580-is-my-data-used-for-model-training)
- Microsoft: [protección de datos empresariales en Microsoft 365 Copilot y Copilot Chat](https://learn.microsoft.com/en-us/copilot/microsoft-365/enterprise-data-protection), [datos, privacidad y seguridad de los modelos de Foundry que vende Azure](https://learn.microsoft.com/en-us/azure/ai-foundry/responsible-ai/openai/data-privacy)
- Google: [centro de privacidad de la IA generativa en Google Workspace](https://knowledge.workspace.google.com/admin/generative-ai/generative-ai-in-google-workspace-privacy-hub)
- AWS: [protección de datos en Amazon Bedrock](https://docs.aws.amazon.com/bedrock/latest/userguide/data-protection.html)
- Artículo 28 del RGPD: [gdpr-info.eu](https://gdpr-info.eu/art-28-gdpr/)
- Sentencia sobre el Marco de Privacidad de Datos: [Jones Day, septiembre de 2025](https://www.jonesday.com/en/insights/2025/09/eu-general-court-upholds-euus-data-privacy-framework); recurso: [Digital Policy Alert](https://digitalpolicyalert.org/event/35459-latombe-filed-appeal-against-general-court-dismissal-of-challenge-to-european-unionunited-states-data-protection-framework-adequacy-decision-in-latombe-v-commission)
- Multa del Garante: [The Hacker News, diciembre de 2024](https://thehackernews.com/2024/12/italy-fines-openai-15-million-for.html)
- HIPAA y proveedores en la nube: [HHS, guía sobre HIPAA y computación en la nube](https://www.hhs.gov/hipaa/for-professionals/special-topics/health-information-technology/cloud-computing/index.html)
- FINRA: [Regulatory Notice 24-09](https://www.finra.org/rules-guidance/notices/24-09)
- Reglamento de IA de la UE: [Comisión Europea, Reglamento de IA](https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai); Omnibus: [White & Case, el AI Omnibus de la UE entra en vigor](https://www.whitecase.com/insight-alert/eu-ai-omnibus-enters-force-amending-ai-act)
- GPUFlow: [guía rápida de la API](https://docs.gpuflow.app/es/renters/api-quickstart/), [qué pueden tocar los inquilinos y qué no](https://docs.gpuflow.app/es/providers/security/), [condiciones](https://gpuflow.app/es/terms), [política de privacidad](https://gpuflow.app/es/privacy)

Todas revisadas en septiembre de 2026.
