---
title: "Warum Unternehmen ChatGPT am Arbeitsplatz verbieten und was sie stattdessen nutzen"
description: "Unternehmen schränken öffentliche KI-Chat-Apps ein, weil Mitarbeiter Daten eingeben, für deren Weitergabe es keinen Vertrag gibt. Die echten Fälle, die Regeln 2026 und Alternativen, die funktionieren."
excerpt: "Bei den meisten ChatGPT-Verboten in Unternehmen geht es um Verträge und Voreinstellungen. Was bei Samsung schiefging, was die Business-Tarife heute versprechen und wohin Ihr Prompt bei jeder Option geht."
pubDate: 2026-02-26
updatedDate: 2026-09-30
locale: "de"
category: "case-studies"
featured: false
draft: false
author: "GPUFlow Team"
heroImage: "../_images/corporate-ai-policy-restriction.png"
heroImageAlt: "Büroumgebung mit digitalen Schloss-Symbolen über Computerbildschirmen als Sinnbild für eingeschränkten KI-Zugang"
faq:
  - question: "Warum verbieten Unternehmen ihren Mitarbeitern ChatGPT?"
    answer: "Weil Mitarbeiter Firmen- und Kundendaten in ein privates Konto kopieren, mit dessen Anbieter das Unternehmen keinen Vertrag hat. Bei den Consumer-Tarifen von ChatGPT darf OpenAI Inhalte standardmäßig zur Verbesserung seiner Modelle nutzen, und es gibt weder einen Auftragsverarbeitungsvertrag noch ein HIPAA Business Associate Agreement, das das Unternehmen abdeckt."
  - question: "Trainiert ChatGPT Enterprise mit Unternehmensdaten?"
    answer: "Standardmäßig nicht. Laut der Enterprise-Datenschutzseite von OpenAI trainiert OpenAI nicht mit Daten aus ChatGPT Enterprise, Business, Edu oder der API, sofern der Kunde nicht zustimmt. Für Enterprise nennt die Seite außerdem SOC-2-Type-2-Audits und eine von Admins gesteuerte Aufbewahrung."
  - question: "Welche Unternehmen haben ChatGPT eingeschränkt?"
    answer: "Samsung hat generative KI auf Firmengeräten 2023 eingeschränkt, nachdem Berichte über abgeflossenen Quellcode und interne Daten aufkamen. Auch Apple, JPMorgan, Bank of America, Citi, Deutsche Bank, Goldman Sachs, Wells Fargo, Walmart und Verizon haben es laut Berichten im selben Jahr eingeschränkt."
  - question: "Ist es nach der DSGVO erlaubt, Kundendaten in ChatGPT einzugeben?"
    answer: "Nur mit Rechtsgrundlage und einem Auftragsverarbeitungsvertrag nach Art. 28 DSGVO. Ein Business-Tarif mit Auftragsverarbeitungsvertrag kann das erfüllen, das private Konto eines Mitarbeiters nicht, weil das Unternehmen für dieses Konto keinen Vertrag mit dem Anbieter hat."
  - question: "Ab wann gelten die Hochrisiko-Regeln der KI-Verordnung?"
    answer: "Nach der Änderung durch den AI-Omnibus, der am 27. Juli 2026 in Kraft getreten ist, gelten die Hochrisiko-Regeln für eigenständige Systeme wie das Sichten von Lebensläufen ab dem 2. Dezember 2027 und für KI in regulierten Produkten ab dem 2. August 2028. Die Transparenzpflichten nach Artikel 50 gelten seit dem 2. August 2026."
  - question: "Kann ich GPUFlow für vertrauliche Unternehmensdaten nutzen?"
    answer: "Nein. Bei GPUFlow läuft das Modell auf dem eigenen Computer eines Anbieters, Prompts und Antworten laufen also im Klartext über diesen Rechner. Die Nutzungsbedingungen verbieten Anbietern, sie aufzuzeichnen, aber das ist eine vertragliche Regel, keine technische Sperre. Nutzen Sie es nur für Daten, die Sie auch einem Fremden geben könnten."
---

Die meisten Unternehmen, die „ChatGPT verbieten“, haben nichts gegen KI. Sie haben etwas dagegen, dass Mitarbeiter Firmendaten in ein privates Konto kopieren, mit dessen Anbieter das Unternehmen keinen Vertrag hat und bei dem der Anbieter die Daten standardmäßig zur Verbesserung seiner Modelle nutzen darf. Die übliche Lösung ist ein freigegebenes Tool: ein Business-Tarif mit Regeln gegen Training und zur Aufbewahrung, ein Modell-Endpunkt im eigenen Cloud-Konto des Unternehmens oder ein offenes Modell auf Hardware, die das Unternehmen selbst betreibt. Mit dem richtigen Vertrag sind die öffentlichen Tools für viele Aufgaben in Ordnung.

Im Folgenden: was in den Fällen, die alle zitieren, tatsächlich passiert ist, welche Regeln 2026 gelten, was die Business-Bedingungen der Anbieter heute sagen und wohin Ihr Text bei jeder Option geht. Alles wurde im September 2026 anhand der Primärquellen geprüft; sie stehen am Ende.

## Was bei Samsung und den Banken passiert ist

Samsung ist der Fall, den alle zitieren. Anfang 2023 erlaubte die Halbleitersparte ihren Ingenieuren, ChatGPT zu nutzen. Koreanische Medien berichteten danach von drei getrennten Vorfällen: Mitarbeiter fügten Quellcode ein, um Fehler zu beheben, ließen das Tool Besprechungsprotokolle schreiben und gaben Messdaten von Anlagen und Ausbeutedaten ein. Samsung bestätigte die Details damals nicht. Ende April 2023 teilte ein Memo den Mitarbeitern einer der größten Sparten mit, dass generative KI auf Firmencomputern vorübergehend eingeschränkt sei. In einer internen Umfrage im Vormonat hatten 65 % der Befragten angegeben, sich wegen der Sicherheitsrisiken Sorgen zu machen.

Apple schränkte ChatGPT und GitHub Copilot laut Wall Street Journal im Mai 2023 ein, weil es fürchtete, vertrauliche Daten könnten bei Entwicklern landen, die Modelle mit Nutzerdaten trainieren. Dieselben Berichte nannten JPMorgan, Bank of America, Citi, Deutsche Bank, Goldman Sachs, Wells Fargo, Walmart und Verizon als Unternehmen, die ChatGPT eingeschränkt hatten.

Zwei Dinge an diesen Fällen übersieht man leicht.

Erstens wurde niemand gehackt. Die Daten gingen genau dorthin, wohin der Mitarbeiter sie geschickt hatte. Die Sorge galt dem, was danach passiert: wer sie behält, wie lange, ob damit ein Modell trainiert wird und ob ein Gericht den Anbieter zur Herausgabe zwingen kann.

Zweitens blieben die Verbote keine Verbote. JPMorgan baute eine eigene interne Plattform, LLM Suite, die Mitarbeitern Zugang zu großen Sprachmodellen „in einer sicheren Umgebung“ gibt. Sie wurde im Sommer 2024 eingeführt und hatte innerhalb von acht Monaten 200.000 freigeschaltete Nutzer. Das ist der typische Verlauf: erst die Consumer-App sperren, dann den Leuten etwas Freigegebenes geben.

## Worin das Risiko eigentlich besteht

Wenn ein Mitarbeiter ein privates Consumer-Konto nutzt, kommen vier getrennte Probleme zusammen.

**Training als Voreinstellung.** Bei ChatGPT Free, Plus und Pro dürfen Inhalte zur Verbesserung der Modelle von OpenAI genutzt werden, solange der Nutzer nicht unter Data controls die Option „Improve the model for everyone“ abschaltet. Klickt der Nutzer auf Daumen hoch oder runter, darf die ganze Unterhaltung auch nach dem Opt-out genutzt werden. Die Consumer-Tarife von Claude bei Anthropic nutzen Chats für das Training, wenn der Nutzer die Modellverbesserung erlaubt. Ob Ihr Quellcode in einem Trainingsdatensatz landet, hängt also von einer Einstellung im Konto eines anderen ab.

**Aufbewahrung, die Sie nicht steuern.** Geschäftsdaten auf der Plattform von OpenAI werden innerhalb von 30 Tagen gelöscht, nachdem der Nutzer sie gelöscht hat, „sofern wir nicht gesetzlich zur Aufbewahrung verpflichtet sind“. Dieser letzte Halbsatz ist keine Floskel. Im Rechtsstreit mit der New York Times verpflichtete ein Gerichtsbeschluss OpenAI vom Juni 2025 bis zum 26. September 2025, Inhalte aus Consumer-ChatGPT und der Standard-API aufzubewahren, die sonst gelöscht worden wären. Kunden von ChatGPT Enterprise und Edu sowie API-Kunden mit Zero Data Retention waren nicht betroffen.

**Kein Vertrag.** Rechtlich wiegt das am schwersten. Nach der DSGVO muss ein Unternehmen, das einen Anbieter personenbezogene Daten verarbeiten lässt, einen Auftragsverarbeiter wählen, der „hinreichende Garantien“ bietet, und einen verbindlichen Vertrag mit ihm schließen (Art. 28). Ein Leistungserbringer im US-Gesundheitswesen braucht ein Business Associate Agreement. Das private Konto eines Mitarbeiters hat weder das eine noch das andere. Der Verstoß passiert also im Moment des Einfügens, egal ob danach je etwas abfließt.

**Keine Aufzeichnungen.** Regulierte Unternehmen müssen geschäftliche Kommunikation überwachen und archivieren. Ein Chat in einem privaten Konto liegt außerhalb jedes Archivs, das die Compliance-Abteilung betreibt.

## Die Regeln, die 2026 gelten

### DSGVO

Personenbezogene Daten von Kunden oder Mitarbeitern in der EU in einem Prompt sind eine Verarbeitung. Sie braucht eine Rechtsgrundlage, einen Auftragsverarbeitungsvertrag nach Art. 28 und für jede Übermittlung außerhalb der EU einen rechtlichen Weg. Für US-Anbieter ist das EU-US Data Privacy Framework weiterhin gültig: Das Gericht der EU hat die Klage Latombe am 3. September 2025 abgewiesen (Rechtssache T-553/23). Ein Rechtsmittel ist beim Gerichtshof als C-703/25 P anhängig. Behalten Sie das im Blick.

Aufsichtsbehörden sind direkt gegen Chat-Dienste vorgegangen. Die italienische Datenschutzbehörde Garante sperrte ChatGPT Ende März 2023 vorübergehend und verhängte im Dezember 2024 ein Bußgeld von 15 Millionen € gegen OpenAI: wegen der Verarbeitung personenbezogener Daten zum Training von ChatGPT ohne ausreichende Rechtsgrundlage, einer nicht gemeldeten Datenpanne vom März 2023, mangelnder Transparenz und fehlender Altersprüfung. OpenAI nannte das Bußgeld unverhältnismäßig und kündigte Rechtsmittel an.

### HIPAA

Jeder Dienst, der für eine Covered Entity elektronische geschützte Gesundheitsdaten empfängt, speichert oder überträgt, ist ein Business Associate und braucht ein unterschriebenes BAA. Das US-Gesundheitsministerium HHS stellt klar, dass auch ein Cloud-Anbieter, der nur verschlüsselte Daten hält und keinen Schlüssel hat, ein Business Associate ist. OpenAI gibt an, für seine API BAAs unterzeichnen zu können. Das private ChatGPT-Konto eines Arztes kommt ohne jedes BAA.

### Finanzdienstleistungen

Die Regulatory Notice 24-09 der FINRA (27. Juni 2024) sagt, dass ihre Regeln für generative KI gelten, „genauso wie sie gelten, wenn Mitgliedsfirmen jede andere Technologie oder jedes andere Tool nutzen“. Aufsicht, Kommunikation mit der Öffentlichkeit und Aufbewahrungspflichten gelten weiter. Die meisten Einschränkungen der Banken von 2023 folgten genau daraus.

### KI-Verordnung der EU

Die KI-Verordnung ist am 1. August 2024 in Kraft getreten. Die Verbote untersagter Praktiken und die Pflicht zur KI-Kompetenz gelten seit dem 2. Februar 2025, die Pflichten für Anbieter von KI-Modellen mit allgemeinem Verwendungszweck seit dem 2. August 2025. Die Änderung durch den AI-Omnibus, Verordnung (EU) 2026/1744, wurde am 24. Juli 2026 veröffentlicht und trat am 27. Juli 2026 in Kraft. Sie hat die Hochrisiko-Fristen verschoben: auf den 2. Dezember 2027 für eigenständige Hochrisiko-Systeme, zu denen KI in der Personalauswahl wie das Sortieren von Lebensläufen gehört, und auf den 2. August 2028 für KI in regulierten Produkten. Die Transparenzpflichten nach Artikel 50 gelten planmäßig seit dem 2. August 2026, und die Pflicht zur KI-Kompetenz wurde zu einer Pflicht abgeschwächt, Maßnahmen zu ihrer „Unterstützung“ zu ergreifen.

Für ein Unternehmen, das einen Chat-Assistenten zum Entwerfen von E-Mails nutzt, ändert die KI-Verordnung wenig. Fängt derselbe Assistent an, Bewerber zu bewerten, betreiben Sie ein Hochrisiko-System, und für Sie gilt der Termin im Dezember 2027.

## Was die Business-Tarife versprechen

Jeder große Anbieter verkauft inzwischen einen Business-Tarif mit anderen Voreinstellungen als die Consumer-App. Die Tabelle fasst zusammen, was die Seiten der Anbieter selbst im September 2026 sagen.

| Angebot | Standardmäßig Training mit Ihren Daten? | Aufbewahrung und Kontrolle | Compliance |
| --- | --- | --- | --- |
| ChatGPT Free, Plus, Pro | Möglich, außer der Nutzer widerspricht | Pro Nutzerkonto | Kein Vertrag mit dem Unternehmen |
| ChatGPT Business, Enterprise, Edu | Nein | Workspace-Admins legen die Aufbewahrung fest | SOC 2 Type 2 für Enterprise und Business |
| OpenAI API | Nein | Löschung nach 30 Tagen; Zero Data Retention für geeignete Anwendungen | BAA verfügbar |
| Claude Team, Enterprise, API | Nein | Feedback kann bis zu 5 Jahre aufbewahrt werden; Inhaber können Feedback abschalten | Gewerbliche Bedingungen |
| Microsoft 365 Copilot und Copilot Chat | Nein, kein Training von Foundation Models | Ihre Aufbewahrungsrichtlinien, Labels und Audits gelten | AVV, EU Data Boundary (ohne Modelle von Anthropic) |
| Gemini in Google Workspace | Ohne Erlaubnis kein Training außerhalb Ihrer Domain | Bestehende Workspace-Kontrollen gelten | HIPAA-Unterstützung, FedRAMP High |

Die Modell-Endpunkte in den großen Clouds gehen weiter. Microsoft schreibt, dass Prompts und Antworten für Modelle, die Azure in Microsoft Foundry verkauft, „OpenAI und anderen Anbietern NICHT zugänglich“ sind und in der gewählten Region verarbeitet werden, sofern Sie kein Global- oder DataZone-Deployment wählen. Bei Amazon Bedrock laufen die Modelle in Deployment-Konten, auf die die Modellanbieter keinen Zugriff haben. Sie sehen Ihre Prompts und Antworten also nie.

Was ein Business-Tarif nicht ändert: Der Text liegt weiter auf den Servern des Anbieters, so lange die Aufbewahrungsregeln es zulassen, und ein Gerichtsbeschluss kann ihn weiterhin erreichen. Das ist dasselbe Vertrauen, das Sie schon Ihren E-Mail- und Dokumentenanbietern entgegenbringen. Für die meiste interne Arbeit ist das ein vernünftiger Tausch. Für Geschäftsgeheimnisse, regulierte Daten ohne BAA oder Material, das ein Kundenvertrag nicht an Unterauftragsverarbeiter gehen lässt, vielleicht nicht.

## Wohin Ihr Prompt bei jeder Option geht

Ehrlich vergleichen lassen sich die Optionen, wenn man einem Prompt folgt und fragt, wer ihn lesen kann.

<figure>
<svg viewBox="0 0 720 470" role="img" aria-labelledby="d1-title" xmlns="http://www.w3.org/2000/svg" font-family="system-ui, sans-serif" font-size="15">
<title id="d1-title">Wohin der Prompt eines Mitarbeiters in fünf verschiedenen KI-Setups geht und was ihn jeweils schützt</title>
<rect x="0" y="0" width="720" height="470" fill="#ffffff"/>
<text x="325" y="30" text-anchor="middle" fill="#64748b">Wohin der Text geht</text>
<text x="475" y="30" fill="#64748b">Was ihn schützt</text>
<rect x="20" y="200" width="140" height="70" rx="10" fill="#eef2ff" stroke="#6366f1" stroke-width="2"/>
<text x="90" y="231" text-anchor="middle" fill="#1e1b4b">Prompt des</text>
<text x="90" y="252" text-anchor="middle" fill="#1e1b4b">Mitarbeiters</text>
<line x1="160" y1="235" x2="200" y2="80" stroke="#6366f1" stroke-width="2"/>
<line x1="160" y1="235" x2="200" y2="160" stroke="#6366f1" stroke-width="2"/>
<line x1="160" y1="235" x2="200" y2="240" stroke="#6366f1" stroke-width="2"/>
<line x1="160" y1="235" x2="200" y2="320" stroke="#6366f1" stroke-width="2"/>
<line x1="160" y1="235" x2="200" y2="400" stroke="#6366f1" stroke-width="2"/>
<rect x="200" y="50" width="250" height="60" rx="10" fill="#ffffff" stroke="#f97316" stroke-width="2"/>
<text x="325" y="76" text-anchor="middle" fill="#1e1b4b">Consumer-Chat-App</text>
<text x="325" y="97" text-anchor="middle" fill="#64748b" font-size="13">privates Konto: Free, Plus, Pro</text>
<text x="475" y="76" fill="#1e1b4b" font-size="14">Training standardmäßig erlaubt</text>
<text x="475" y="97" fill="#1e1b4b" font-size="14">Kein Vertrag mit Ihrer Firma</text>
<rect x="200" y="130" width="250" height="60" rx="10" fill="#eef2ff" stroke="#6366f1" stroke-width="2"/>
<text x="325" y="156" text-anchor="middle" fill="#1e1b4b">Business-Tarif des Anbieters</text>
<text x="325" y="177" text-anchor="middle" fill="#64748b" font-size="13">Server des Anbieters, Firmenkonto</text>
<text x="475" y="156" fill="#1e1b4b" font-size="14">Standardmäßig kein Training</text>
<text x="475" y="177" fill="#1e1b4b" font-size="14">AVV, Aufbewahrung steuerbar</text>
<rect x="200" y="210" width="250" height="60" rx="10" fill="#eef2ff" stroke="#6366f1" stroke-width="2"/>
<text x="325" y="236" text-anchor="middle" fill="#1e1b4b">Endpunkt in Ihrer Cloud</text>
<text x="325" y="257" text-anchor="middle" fill="#64748b" font-size="13">Azure Foundry, Amazon Bedrock</text>
<text x="475" y="236" fill="#1e1b4b" font-size="14">Ihr Tenant, Ihre Region</text>
<text x="475" y="257" fill="#1e1b4b" font-size="14">Modellhersteller sieht nichts</text>
<rect x="200" y="290" width="250" height="60" rx="10" fill="#ffffff" stroke="#16a34a" stroke-width="2"/>
<text x="325" y="316" text-anchor="middle" fill="#1e1b4b">Eigene Server</text>
<text x="325" y="337" text-anchor="middle" fill="#64748b" font-size="13">offenes Modell, eigenes Netzwerk</text>
<text x="475" y="316" fill="#1e1b4b" font-size="14">Nichts verlässt Ihr Netzwerk</text>
<text x="475" y="337" fill="#1e1b4b" font-size="14">Betrieb und Patches bei Ihnen</text>
<rect x="200" y="370" width="250" height="60" rx="10" fill="#ffffff" stroke="#f97316" stroke-width="2"/>
<text x="325" y="396" text-anchor="middle" fill="#1e1b4b">Marktplatz-GPU (GPUFlow)</text>
<text x="325" y="417" text-anchor="middle" fill="#64748b" font-size="13">Rechner eines Anbieters</text>
<text x="475" y="396" fill="#1e1b4b" font-size="14">Klartext auf diesem Rechner</text>
<text x="475" y="417" fill="#1e1b4b" font-size="14">AGB verbieten Aufzeichnung</text>
<text x="360" y="458" text-anchor="middle" fill="#64748b" font-size="13">Orange: nur für öffentliche Daten. Grün: für alles, was Ihre eigene IT halten darf.</text>
</svg>
<figcaption>Derselbe Prompt, fünf Ziele. Nur die selbst betriebene Option hält ihn in Ihrem Netzwerk; Business-Tarif und Cloud-Endpunkt halten ihn unter einem Vertrag, den Ihr Unternehmen unterschrieben hat.</figcaption>
</figure>

## Offene Modelle selbst betreiben

Die stärkste Option für vertrauliche Daten ist auch die aufwendigste: ein offenes Modell (Llama, Qwen, Mistral, Gemma und andere) herunterladen und auf Rechnern im eigenen Netzwerk betreiben. Prompts verlassen das Netzwerk nie. Sie entscheiden, was protokolliert wird und wie lange. Das macht es leichter, Aufbewahrungspflichten und die Speicherregeln der DSGVO einzuhalten, und keine fremde Aufbewahrungsklausel und kein Gerichtsbeschluss berührt die Daten.

Die Kosten sind allerdings real. Sie betreiben jetzt einen Inferenzdienst: GPUs, eine Engine wie Ollama oder vLLM, Authentifizierung, Logging, Updates und jemanden in Rufbereitschaft. Und ein 8B- oder 14B-Modell, das auf eine einzelne Workstation-Karte passt, ist bei langen Denkketten schwächer als ein Frontier-Modell. Für Klassifizieren, Extrahieren von Feldern, Zusammenfassen interner Dokumente und das Entwerfen von Routinetexten reicht es meist. Testen Sie es an Ihren eigenen Aufgaben, bevor Sie entscheiden. Unser [Benchmark Ollama vs. vLLM vs. TGI](/de/ollama-vs-vllm-vs-tgi-rtx-4090-benchmark/) behandelt die Wahl der Engine, und die [Anleitung zum privaten LLM-Fine-Tuning](/de/private-llm-fine-tuning-guide/) zeigt, wie Sie ein Modell an Ihre Dokumente anpassen.

Viele Firmen gehen einen Mittelweg: Sie betreiben das offene Modell auf GPU-Instanzen in dem Cloud-Konto, das sie ohnehin haben. Der Cloud-Anbieter ist dann Auftragsverarbeiter unter einem AVV, den Sie für alles andere schon ausgehandelt haben, und ein Modellanbieter ist gar nicht beteiligt.

## Wo gemietete GPUs und GPUFlow hingehören

GPU-Marktplätze sind das günstige Ende des Markts, und in diesen Vergleich gehören sie nur mit einem klaren Etikett.

GPUFlow ist einer davon. Sie mieten eine GPU für eine bestimmte Zahl von Stunden und bekommen einen OpenAI-kompatiblen API-Schlüssel für das offene Modell, das der Anbieter darauf betreibt, meist mit Ollama. Das Modell läuft auf dem eigenen Computer des Anbieters. Ihre Prompts und die Antworten laufen also während der Miete im Klartext über diesen Rechner. Die Nutzungsbedingungen von GPUFlow verbieten Anbietern, Anfragen oder Antworten von Mietern aufzuzeichnen, zu lesen, aufzubewahren oder weiterzugeben, und GPUFlow selbst speichert den Text nicht. Aber der Anbieter hat Root-Rechte auf dem Rechner, und das Aufzeichnungsverbot wird per Vertrag durchgesetzt; technisch hindert ihn nichts.

GPUFlow ist also **nicht** die Lösung für regulierte oder vertrauliche Daten. Schicken Sie keine Kundendatensätze, keine Gesundheitsdaten, keinen Quellcode, der Ihnen wichtig ist, und nichts, was ein Kundenvertrag einschränkt. Unsere eigene Doku sagt es noch deutlicher: Senden Sie keine Passwörter, Kartennummern oder andere Geheimnisse, die Sie keinem Fremden geben würden.

Wo es passt: ein offenes Modell auf echter Hardware ausprobieren, bevor Sie eine Karte kaufen, Prompts über öffentliche oder synthetische Daten laufen lassen und eine App gegen eine OpenAI-kompatible API bauen und testen, bevor Sie sie auf Ihren eigenen Server umstellen. Community-Cloud-Rechner auf anderen Marktplätzen werfen dieselbe Frage für alles auf, was Sie hochladen; [Einen Datensatz auf einem öffentlichen GPU-Knoten absichern](/de/how-to-secure-dataset-on-public-gpu-node/) behandelt diese Seite.

## Eine Richtlinie, an die sich die Leute auch halten

Ein pauschales Verbot ohne Alternative verlagert die Nutzung vor allem auf private Handys, wo Sie noch weniger sehen. Besser funktioniert etwas, das kurz genug ist, um es sich zu merken:

| Datenklasse | Beispiele | Erlaubte Tools |
| --- | --- | --- |
| Öffentlich | Veröffentlichte Dokumente, Marketingtexte | Jedes freigegebene Tool, auch Consumer-Apps |
| Intern | Richtlinien, interne Wikis, unkritischer Code | Business-Tarife mit AVV und abgeschaltetem Training |
| Vertraulich | Kundendaten, Geschäftsgeheimnisse, Vertragskonditionen | Cloud-Endpunkt in Ihrem Tenant oder selbst betrieben |
| Reguliert | Gesundheitsdaten, Kartendaten, personenbezogene Daten in großem Umfang | Selbst betrieben oder ein Anbieter mit der passenden Vereinbarung (BAA, AVV) |

Dann kommen die unspektakulären Teile:

1. Kaufen Sie einen Business-Tarif oder einen Cloud-Endpunkt und machen Sie ihn zum Standard, mit Single Sign-on, damit Konten geschlossen werden, wenn Leute gehen.
2. Stellen Sie die Aufbewahrung auf den kürzesten Zeitraum, der Ihre Aufbewahrungspflichten erfüllt, und prüfen Sie in der Admin-Konsole, dass das Training abgeschaltet ist.
3. Sperren Sie Consumer-KI-Chats auf verwalteten Geräten erst, wenn das freigegebene Tool läuft.
4. Führen Sie ein Verzeichnis der KI-Anwendungen. Alles, was Personalauswahl, Kreditvergabe oder ähnliche Entscheidungen berührt, braucht vor Dezember 2027 eine eigene Prüfung.
5. Sagen Sie den Leuten, was sie stattdessen tun sollen, nicht nur, was sie lassen sollen. Das Memo bei Samsung kam, nachdem die Daten schon weg waren.

Zu den laufenden Kosten von Selbstbetrieb im Vergleich zu Diensten mit Abrechnung pro Token siehe [GPU pro Stunde oder API pro Token?](/de/hourly-gpu-vs-per-token-api/).

## Quellen

- Einschränkung und Umfrage bei Samsung: [CNBC, 2. Mai 2023](https://www.cnbc.com/2023/05/02/samsung-bans-use-of-ai-like-chatgpt-for-staff-after-misuse-of-chatbot.html); Details zu den Vorfällen: [The Register, 2. Mai 2023](https://www.theregister.com/2023/05/02/samsung_generative_ai_ban/)
- Apple und andere Unternehmen: [TechCrunch, 19. Mai 2023](https://techcrunch.com/2023/05/19/apple-reportedly-limits-internal-use-of-ai-powered-tools-like-chatgpt-and-github-copilot/)
- LLM Suite von JPMorgan: [Technologie-Blog von JPMorganChase, 3. Juni 2025](https://www.jpmorganchase.com/about/technology/blog/llmsuite-ab-award)
- Business-Bedingungen von OpenAI: [Enterprise-Datenschutz](https://openai.com/enterprise-privacy/); Trainingseinstellungen für Consumer: [Wie Ihre Daten zur Verbesserung der Modelle genutzt werden](https://help.openai.com/en/articles/5722486-how-your-data-is-used-to-improve-model-performance)
- Aufbewahrungsanordnung im NYT-Verfahren: [OpenAI, Antwort auf die Datenforderungen der NYT](https://openai.com/index/response-to-nyt-data-demands/)
- Anthropic: [Geschäftliche Daten und Training](https://privacy.claude.com/en/articles/7996868-is-my-data-used-for-model-training), [Consumer-Daten und Training](https://privacy.claude.com/en/articles/10023580-is-my-data-used-for-model-training)
- Microsoft: [Enterprise-Datenschutz in Microsoft 365 Copilot und Copilot Chat](https://learn.microsoft.com/en-us/copilot/microsoft-365/enterprise-data-protection), [Daten, Datenschutz und Sicherheit für Foundry-Modelle, die Azure verkauft](https://learn.microsoft.com/en-us/azure/ai-foundry/responsible-ai/openai/data-privacy)
- Google: [Privacy Hub zu generativer KI in Google Workspace](https://knowledge.workspace.google.com/admin/generative-ai/generative-ai-in-google-workspace-privacy-hub)
- AWS: [Datenschutz in Amazon Bedrock](https://docs.aws.amazon.com/bedrock/latest/userguide/data-protection.html)
- Art. 28 DSGVO: [gdpr-info.eu](https://gdpr-info.eu/art-28-gdpr/)
- Urteil zum Data Privacy Framework: [Jones Day, September 2025](https://www.jonesday.com/en/insights/2025/09/eu-general-court-upholds-euus-data-privacy-framework); Rechtsmittel: [Digital Policy Alert](https://digitalpolicyalert.org/event/35459-latombe-filed-appeal-against-general-court-dismissal-of-challenge-to-european-unionunited-states-data-protection-framework-adequacy-decision-in-latombe-v-commission)
- Bußgeld der Garante: [The Hacker News, Dezember 2024](https://thehackernews.com/2024/12/italy-fines-openai-15-million-for.html)
- HIPAA und Cloud-Anbieter: [HHS, Leitfaden zu HIPAA und Cloud Computing](https://www.hhs.gov/hipaa/for-professionals/special-topics/health-information-technology/cloud-computing/index.html)
- FINRA: [Regulatory Notice 24-09](https://www.finra.org/rules-guidance/notices/24-09)
- KI-Verordnung der EU: [Europäische Kommission, KI-Verordnung](https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai); Omnibus: [White & Case, EU-AI-Omnibus tritt in Kraft](https://www.whitecase.com/insight-alert/eu-ai-omnibus-enters-force-amending-ai-act)
- GPUFlow: [API-Schnellstart](https://docs.gpuflow.app/de/renters/api-quickstart/), [Worauf Mieter zugreifen können und worauf nicht](https://docs.gpuflow.app/de/providers/security/), [Nutzungsbedingungen](https://gpuflow.app/de/terms), [Datenschutzerklärung](https://gpuflow.app/de/privacy)

Alle geprüft im September 2026.
