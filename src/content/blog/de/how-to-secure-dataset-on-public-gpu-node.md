---
title: "Datensatz auf einer gemieteten oder öffentlichen GPU absichern"
description: "Der Host einer gemieteten GPU kann alles lesen, was Ihr Job entschlüsselt. Was Verschlüsselung, Secure Cloud und Confidential Computing auf der H100 lösen und wie Sie danach aufräumen."
excerpt: "Wer eine GPU mietet, gibt jemand anderem Root-Rechte auf dem Rechner mit seinen Daten. Hier sind das Bedrohungsmodell, was jede Schutzmaßnahme wirklich abdeckt, und eine Aufräumroutine, die auf modernen Festplatten funktioniert."
pubDate: 2026-02-26
updatedDate: 2026-09-30
locale: "de"
category: "guides"
featured: false
draft: false
author: "GPUFlow Team"
authorUrl: "https://gpuflow.app"
heroImage: "../_images/secure-server-room-abstract.png"
heroImageAlt: "Abstrakte, gesicherte Serverumgebung als Sinnbild für geschützte KI-Datenverarbeitung"
faq:
  - question: "Kann der Host einer gemieteten GPU meine Daten sehen?"
    answer: "Technisch ja. Der Host hat Root-Rechte auf der physischen Maschine, und Ihre Daten müssen im Speicher entschlüsselt werden, damit Sie ein Modell trainieren oder ausführen können. Nur Confidential Computing, etwa vertrauliche VMs mit H100 bei Azure oder Google Cloud, nimmt den Host aus dieser Rechnung heraus."
  - question: "Löscht shred Dateien auf einer Cloud-GPU-Instanz sicher?"
    answer: "Nicht zuverlässig. Laut GNU-Handbuch funktioniert shred nur, wenn Dateisystem und Hardware Daten an Ort und Stelle überschreiben. Journaling- und Copy-on-Write-Dateisysteme, Snapshots und SSDs garantieren das nicht. Verschlüsseln Sie die Daten, bevor sie auf der Festplatte landen, und zerstören Sie stattdessen die Instanz."
  - question: "Was ist der Unterschied zwischen RunPod Secure Cloud und Community Cloud?"
    answer: "Laut Doku von RunPod läuft die Secure Cloud in T3/T4-Rechenzentren und eignet sich für Produktion und sensible Daten; die Community Cloud besteht aus Peer-to-Peer-Anbietern mit schwankender Zuverlässigkeit. RunPod nimmt keine neuen Hosts für die Community Cloud mehr an."
  - question: "Welche Cloud-GPUs unterstützen Confidential Computing?"
    answer: "Stand September 2026 bietet Azure vertrauliche VMs vom Typ NCCads H100 v5 mit einer H100-NVL-GPU auf AMD SEV-SNP an, Google Cloud vertrauliche a3-highgpu-1g (eine H100, Intel TDX) und G4 (RTX PRO 6000, AMD SEV). GeForce-Karten für Endkunden stehen nicht auf diesen Listen."
  - question: "Darf ich nach der DSGVO personenbezogene Daten auf eine gemietete GPU legen?"
    answer: "Nur wenn der Anbieter ein Auftragsverarbeiter mit einem Vertrag nach Art. 28 DSGVO ist und es einen zulässigen Übermittlungsweg gibt, falls die Maschine außerhalb der EU steht. Die meisten Peer-to-Peer-Hosts haben keinen solchen Vertrag mit Ihnen. Anonymisieren Sie die Daten also vorher oder nutzen Sie einen Rechenzentrumsanbieter, der einen Auftragsverarbeitungsvertrag unterschreibt."
  - question: "Kann ich bei GPUFlow ein Modell trainieren oder feintunen?"
    answer: "Nein. GPUFlow ist reine Inferenz: Sie bekommen einen OpenAI-kompatiblen API-Schlüssel für ein Modell, das auf dem Computer eines Anbieters läuft, ohne SSH, Shell oder Dateizugriff. Prompts kommen auf diesem Computer im Klartext an. Schicken Sie also keine vertraulichen Datensätze darüber."
---

Wenn Sie eine GPU mieten, hat jemand anderes Root-Rechte auf dem Rechner, auf dem Ihre Daten liegen. Verschlüsselung schützt den Datensatz auf dem Weg dorthin und solange er auf der Festplatte liegt. Ihr Trainingsjob muss ihn aber im Speicher entschlüsseln, um ihn zu nutzen, und dann kann ein entschlossener Host ihn lesen. Die eigentlichen Entscheidungen sind also: wem Sie vertrauen (einem geprüften Rechenzentrum oder einem anonymen Heimserver), wie wenig Daten Sie schicken und ob Sie Confidential Computing brauchen. Das ist die einzige Option, die den Betreiber des Hosts aus der Vertrauenskette nimmt.

Diese Anleitung behandelt Maschinen, auf denen Sie sich einloggen, etwa Instanzen bei Vast.ai oder RunPod. Sie geht das Bedrohungsmodell durch, was jede Schutzmaßnahme abdeckt, und eine Aufräumroutine, die auf moderner Speicherhardware hält. Die Quellen stehen am Ende; alles wurde im September 2026 geprüft.

## Das Bedrohungsmodell

Benennen Sie zuerst, wer an die Daten kommen könnte und wie. Auf einer gemieteten GPU-Instanz gibt es sieben realistische Wege.

<figure>
<svg viewBox="0 0 720 430" role="img" aria-labelledby="d1-title" xmlns="http://www.w3.org/2000/svg" font-family="system-ui, sans-serif" font-size="15">
<title id="d1-title">Bedrohungsmodell für einen Datensatz auf einer gemieteten GPU-Instanz: sieben Wege zu den Daten und die wichtigste Abhilfe für jeden</title>
<rect x="0" y="0" width="720" height="430" fill="#ffffff"/>
<line x1="220" y1="75" x2="240" y2="170" stroke="#e2e8f0" stroke-width="2"/>
<line x1="220" y1="220" x2="240" y2="215" stroke="#e2e8f0" stroke-width="2"/>
<line x1="220" y1="365" x2="240" y2="270" stroke="#e2e8f0" stroke-width="2"/>
<line x1="500" y1="75" x2="480" y2="170" stroke="#e2e8f0" stroke-width="2"/>
<line x1="500" y1="220" x2="480" y2="215" stroke="#e2e8f0" stroke-width="2"/>
<line x1="500" y1="365" x2="480" y2="270" stroke="#e2e8f0" stroke-width="2"/>
<line x1="360" y1="330" x2="360" y2="290" stroke="#e2e8f0" stroke-width="2"/>
<rect x="240" y="140" width="240" height="150" rx="12" fill="#eef2ff" stroke="#6366f1" stroke-width="2"/>
<text x="360" y="170" text-anchor="middle" fill="#1e1b4b" font-weight="bold">Ihre gemietete Instanz</text>
<text x="360" y="205" text-anchor="middle" fill="#1e1b4b">Datensatz</text>
<text x="360" y="235" text-anchor="middle" fill="#1e1b4b">Gewichte und Checkpoints</text>
<text x="360" y="265" text-anchor="middle" fill="#1e1b4b">Tokens und Schlüssel</text>
<rect x="20" y="40" width="200" height="70" rx="10" fill="#ffffff" stroke="#f97316" stroke-width="2"/>
<text x="120" y="68" text-anchor="middle" fill="#1e1b4b">Host-Betreiber</text>
<text x="120" y="92" text-anchor="middle" fill="#64748b" font-size="13">Geprüfter Host oder CC</text>
<rect x="20" y="185" width="200" height="70" rx="10" fill="#ffffff" stroke="#f97316" stroke-width="2"/>
<text x="120" y="213" text-anchor="middle" fill="#1e1b4b">Netzwerkweg</text>
<text x="120" y="237" text-anchor="middle" fill="#64748b" font-size="13">SSH, keine offenen Ports</text>
<rect x="20" y="330" width="200" height="70" rx="10" fill="#ffffff" stroke="#f97316" stroke-width="2"/>
<text x="120" y="358" text-anchor="middle" fill="#1e1b4b">Festplattenreste</text>
<text x="120" y="382" text-anchor="middle" fill="#64748b" font-size="12">Verschlüsseln, dann zerstören</text>
<rect x="500" y="40" width="200" height="70" rx="10" fill="#ffffff" stroke="#f97316" stroke-width="2"/>
<text x="600" y="68" text-anchor="middle" fill="#1e1b4b">Marktplatz-Plattform</text>
<text x="600" y="92" text-anchor="middle" fill="#64748b" font-size="13">Vertrag und AVV</text>
<rect x="500" y="185" width="200" height="70" rx="10" fill="#ffffff" stroke="#f97316" stroke-width="2"/>
<text x="600" y="213" text-anchor="middle" fill="#1e1b4b">Andere Mieter</text>
<text x="600" y="237" text-anchor="middle" fill="#64748b" font-size="13">VM oder ganze Maschine</text>
<rect x="500" y="330" width="200" height="70" rx="10" fill="#ffffff" stroke="#f97316" stroke-width="2"/>
<text x="600" y="358" text-anchor="middle" fill="#1e1b4b">Snapshots, Volumes</text>
<text x="600" y="382" text-anchor="middle" fill="#64748b" font-size="13">Keine dauerhaften Kopien</text>
<rect x="260" y="330" width="200" height="70" rx="10" fill="#ffffff" stroke="#f97316" stroke-width="2"/>
<text x="360" y="358" text-anchor="middle" fill="#1e1b4b">Eigene Überbleibsel</text>
<text x="360" y="382" text-anchor="middle" fill="#64748b" font-size="13">Begrenzte, rotierte Tokens</text>
</svg>
<figcaption>Alles auf der Instanz ist für den Betreiber des Hosts zugänglich, solange der Job läuft. Die anderen Wege schließt gewöhnliche Sorgfalt (grau: die jeweilige Abhilfe); dieser eine braucht entweder einen Host, dem Sie vertrauen, oder Confidential Computing.</figcaption>
</figure>

**Der Betreiber des Hosts.** Wem die physische Maschine gehört, der hat Root-Rechte darauf. Auf einem Container-Marktplatz wie Vast.ai laufen Kunden in Docker-Containern ohne Root-Rechte. Das isoliert Sie von anderen Mietern, aber nicht vom Host: Root auf dem Host kann die Dateien und den Speicher eines Containers lesen. So funktionieren Container auf jeder Plattform.

**Der Netzwerkweg.** Daten auf dem Weg von Ihrem Laptop oder Bucket zum Knoten. Das ist der am leichtesten zu schließende Weg.

**Die Marktplatz-Plattform.** Das Unternehmen zwischen Ihnen und dem Host verwaltet Ihr Konto, Ihre SSH-Schlüssel und alles, was seine eigenen Logs festhalten. Was es damit tun darf, regeln seine Bedingungen. Deshalb ist der Abschnitt zu Verträgen weiter unten wichtig.

**Reste auf der Festplatte.** Dateien, die Sie löschen, können nach Ihrer Miete auf der Festplatte überleben, wo der nächste Mieter oder der Host sie finden könnte.

**Snapshots und persistente Volumes.** Kopien, die Sie angefordert haben (ein Network Volume, eine gestoppte Instanz) oder die der Host angelegt hat (Backups), überdauern den Job.

**Andere Mieter.** Andere Kunden auf derselben Maschine. Mit VM-Isolation oder einer ganzen Maschine für sich allein ist das Risiko klein, aber GPUs hatten hier schon echte Fehler. LeftoverLocals (CVE-2023-4969) erlaubte auf manchen GPUs von Apple, AMD und Qualcomm einem Prozess, den lokalen GPU-Speicher eines anderen zu lesen; Trail of Bits hat auf einer AMD Radeon RX 7900 XT etwa 181 MB pro LLM-Anfrage wiederhergestellt, genug, um die Antwort des Modells zu rekonstruieren. Auf GPUs von NVIDIA, ARM oder Intel fand Trail of Bits keine Anzeichen dafür.

**Ihre eigenen Überbleibsel.** Ein Hugging-Face-Token, Cloud-Schlüssel oder ein privater SSH-Schlüssel, der auf dem Knoten liegen bleibt. In der Praxis beginnen die meisten Lecks so.

## Was Verschlüsselung abdeckt und was nicht

Verschlüsselung hat drei Aufgaben, und auf einer gemieteten GPU können Sie zwei davon selbst erledigen.

**Bei der Übertragung:** einfach. Nutzen Sie SSH (`scp`, `sftp`, `rsync -e ssh`) oder HTTPS von einem Bucket. Vast.ai gibt an, dass SSH-Verbindungen und die eigene API verschlüsselt sind. Nutzen Sie nie einfache HTTP-Links oder Filesharing-Dienste ohne Authentifizierung.

**Im Ruhezustand:** Verschlüsseln Sie vor dem Hochladen, damit die Datei auf der Festplatte des Hosts ohne Schlüssel nutzlos ist. [age](https://github.com/FiloSottile/age) ist dafür das einfachste Tool:

```bash
# on your own machine
tar -cf - train/ | age -p > train.tar.age
scp -P 22345 train.tar.age user@203.0.113.42:/workspace/
```

Auf dem Knoten entschlüsseln Sie direkt in den Arbeitsspeicher, damit der Klartext nie die Festplatte berührt:

```bash
mkdir -p /dev/shm/train
age -d /workspace/train.tar.age | tar -xf - -C /dev/shm/train
```

`age -d` fragt die Passphrase im Terminal ab, der Schlüssel wird also nie auf den Knoten geschrieben. `/dev/shm` ist ein Dateisystem im RAM; prüfen Sie vorher seine Größe mit `df -h /dev/shm`, denn in Container-Umgebungen ist es oft klein. Passen die Daten nicht in den RAM, brauchen Sie eine entschlüsselte Kopie auf der Festplatte, und der Abschnitt zum Aufräumen unten wird umso wichtiger.

Vollverschlüsselung mit LUKS ist auf eigenen Servern die übliche Antwort. In einem Container ohne Root-Rechte können Sie dm-crypt aber meist nicht einrichten, und der Host hätte den aktiven Schlüssel ohnehin.

**Während der Nutzung:** Hier ist die Lücke. Zum Trainieren braucht die GPU Tensoren im Klartext, und der CPU-Speicher, der sie füttert, enthält ebenfalls Klartext. Wer Root auf dem Host hat, kann diesen Speicher grundsätzlich auslesen. Gegen einen feindseligen Host im laufenden Betrieb hilft Verschlüsselung im Ruhezustand nicht. Nur hardwarebasiertes Confidential Computing setzt hier an.

## Secure Cloud oder Community Cloud

Der Host ist das eine Risiko, das Sorgfalt allein nicht beseitigt. Die Wahl des Hosts ist deshalb Ihre wichtigste Entscheidung. Die beiden großen Marktplätze teilen ihr Angebot genau aus diesem Grund auf.

| Option | Wer die Hardware betreibt | Was die Plattform sagt |
| --- | --- | --- |
| RunPod Secure Cloud | T3/T4-Rechenzentren | Für „Produktion, sensible Daten“ |
| RunPod Community Cloud | Peer-to-Peer-Anbieter | Für „kostensensible Workloads“; keine neuen Hosts |
| Vast.ai Secure Cloud | Geprüfte Rechenzentren | ISO 27001, Tier-3/4-Standard, geprüfte physische Sicherheit |
| Andere Hosts bei Vast.ai | Von Rechenzentren bis zu Privatpersonen | Einzelne Hosts „haben möglicherweise weniger formelle Sicherheitsmaßnahmen“ |

Vast.ai rät selbst, für sensible Daten nur Anbieter der Secure Cloud zu nutzen, Daten im Ruhezustand zu verschlüsseln, Zugangsdaten nicht auf Instanzen abzulegen und ein externes Schlüsselmanagement einzusetzen. Das deckt sich mit dem, was ich jedem raten würde.

Zwei Grenzen gelten auch in einem zertifizierten Rechenzentrum. Erstens zertifiziert ISO 27001 die Prozesse des Betreibers; einen unehrlichen Insider schließt es nicht aus. Zweitens ist ein Host, der für Sie personenbezogene Daten verarbeitet, nach der DSGVO ein Auftragsverarbeiter, und Art. 28 verlangt dafür einen Vertrag, während der Marktplatz zwischen Ihnen und dem Host steht. Lesen Sie nach, mit welchem Unternehmen Sie tatsächlich einen Vertrag haben und was es über seine Hosts zusagt.

Für wirklich sensible Arbeit ist die nächste Stufe eine GPU-Instanz in einem Hyperscaler-Konto, für das Sie bereits einen AVV und eventuell ein BAA haben. Damit verlassen Sie die Marktplätze, und die Stunde kostet mehr. Unser [GPU-Preisvergleich](/de/gpu-rental-pricing-comparison-2026/) zeigt die Preisspannen.

## Confidential Computing auf H100-GPUs

Confidential Computing (CC) ist hier die einzige Technik, die dafür gebaut ist, Daten während des laufenden Jobs vor dem Betreiber des Hosts zu schützen. Auf Rechenzentrums-GPUs der Generationen Hopper und Blackwell von NVIDIA funktioniert das so:

- Der Workload läuft in einer vertraulichen VM (CVM), die auf der CPU durch AMD SEV-SNP oder Intel TDX abgesichert ist. Das Design von NVIDIA geht davon aus, dass Hypervisor und Host-Betriebssystem kompromittiert sein können; ein Betreiber mit Zugriff auf den Hypervisor „oder sogar auf das System selbst“ soll den Speicher der CVM nicht lesen können.
- Vor der Nutzung prüft die VM anhand eines signierten Gerätezertifikats, dass die GPU echt ist und im CC-Modus läuft. Das lässt sich gegen den Remote Attestation Service (NRAS) von NVIDIA prüfen.
- Daten, Command Buffer und CUDA-Kernel, die über PCIe gehen, werden verschlüsselt und signiert und laufen über einen verschlüsselten Bounce Buffer im gemeinsamen Speicher.

NVIDIA hat CC mit einer einzelnen H100 im April 2024 mit CUDA 12.4 allgemein verfügbar gemacht. Wo Sie es Stand September 2026 tatsächlich mieten können:

| Cloud | Instanz | GPU | CPU-TEE |
| --- | --- | --- | --- |
| Azure | NCCads H100 v5 | 1 × H100 NVL, 94 GB | AMD SEV-SNP (EPYC Genoa) |
| Google Cloud | a3-highgpu-1g, Confidential VM | 1 × H100 | Intel TDX |
| Google Cloud | g4-standard-48, Confidential VM | RTX PRO 6000 | AMD SEV |

Kennen Sie die Grenzen, bevor Sie darauf aufbauen:

- **Eine GPU pro VM.** Die Azure-Serie hat eine GPU, und die vertraulichen GPU-VMs von Google unterstützen keine Cluster aus mehreren Knoten. Große Trainingsläufe über mehrere GPUs fallen weg.
- **Bereitstellung.** Bei Google Cloud läuft vertrauliches A3 High nur als Spot oder Flex-Start und unterstützt keine Reservierungen.
- **Übertragungsgeschwindigkeit.** Der technische Artikel von NVIDIA aus dem Jahr 2023 nannte für die Bandbreite von CPU zu GPU im CC-Modus etwa 4 GB/s, begrenzt durch die Verschlüsselung auf der CPU. Einen Checkpoint mit 16 GB zu laden dauert also etwa 16 ÷ 4 = 4 Sekunden reine Übertragung. Für Inferenz ist das in Ordnung, eine Datenpipeline, die pro Schritt viele Gigabyte streamt, wird es aber spüren. Spätere Treiberversionen nennen Leistungsverbesserungen, messen Sie also Ihren eigenen Job.
- **Der GPU-Speicher ist nicht verschlüsselt.** NVIDIA lässt den HBM auf dem Package im Klartext, mit der Begründung, dass gängige Werkzeuge für physische Angriffe ihn nicht erreichen.
- **Nicht auf Marktplätzen.** Die GeForce-Karten für Endkunden, die bei Vast.ai und den Community-Hosts von RunPod üblich sind, stehen auf keiner dieser Listen.

CC ändert, wem Sie vertrauen müssen: der Hardware und Attestierung von NVIDIA, dem CPU-Hersteller und Ihrem eigenen VM-Image statt den Mitarbeitern des Hosts. Für regulierte Daten, bei denen die Antwort „die Admins des Cloud-Anbieters können sie nicht lesen“ zählt, ist es die einzige Option auf gemieteter Hardware, die das leistet.

## Vor und während des Jobs

### Minimieren, bevor Sie hochladen

Der günstigste Schutz sind Daten, die Ihren Rechner nie verlassen. Vor der Übertragung:

- Entfernen Sie Spalten, die das Modell nicht braucht, vor allem Namen, E-Mail-Adressen, Kontonummern und Freitextnotizen.
- Ersetzen Sie direkte Identifikatoren durch zufällige Tokens und behalten Sie die Zuordnungstabelle bei sich.
- Kürzen Sie den Korpus auf das, was die Methode braucht. Ein LoRA- oder QLoRA-Fine-Tuning passt eine kleine Menge zusätzlicher Gewichte an und braucht selten eine ganze Produktionsdatenbank; unsere [Anleitung zum Fine-Tuning](/de/private-llm-fine-tuning-guide/) zeigt ein realistisches Setup.
- Denken Sie daran, dass Modellgewichte Information tragen. Ein Modell, das auf sensiblem Text feingetunt wurde, kann Teile davon wiedergeben. Behandeln Sie also auch den Adapter als sensibel.

Anonymisierte Daten sind auch das, was die meisten rechtlichen Fragen weiter unten erledigt.

### Zugangsdaten und Netzwerk auf dem Knoten

Gehen Sie davon aus, dass alles, was Sie auf den Knoten legen, kopiert werden könnte.

- Nutzen Sie ein fein abgestuftes Hugging-Face-Token mit Lesezugriff auf das eine Repo, das Sie brauchen, und widerrufen Sie es, wenn der Job endet.
- Kopieren Sie nie Ihren wichtigsten privaten SSH-Schlüssel, Root-Zugangsdaten für die Cloud oder Passwörter von Produktionsdatenbanken auf eine gemietete Maschine. Muss der Job Ergebnisse in einen Bucket schreiben, legen Sie einen Schlüssel an, der nur in ein Präfix schreiben darf und innerhalb eines Tages abläuft.
- Holen Sie Ergebnisse per SSH ab, statt sie mit langlebigen Schlüsseln vom Knoten aus zu schieben.
- Prüfen Sie mit `ss -tulnp`, was lauscht. Binden Sie Jupyter, TensorBoard und Inferenzserver an `127.0.0.1` und erreichen Sie sie über einen SSH-Tunnel (`ssh -L 8888:127.0.0.1:8888 ...`), statt einen öffentlichen Port freizugeben.

## Aufräumen, das auf modernen Festplatten hält

Der übliche Rat lautet, den Datensatz am Ende mit `shred` zu löschen. Das tut nicht, was man denkt. Laut Handbuch der GNU coreutils verlässt sich `shred` darauf, dass Dateisystem und Hardware Daten an Ort und Stelle überschreiben, und es listet die Fälle, in denen das nicht klappt: Journaling- und Log-strukturierte Dateisysteme wie ext4 im Modus `data=journal`, Btrfs, XFS und ZFS, RAID, Dateisysteme mit Snapshots, komprimierte Dateisysteme und SSDs, deren Wear Leveling neue Daten an eine andere Stelle schreibt. Ein gemieteter GPU-Knoten ist sehr wahrscheinlich mehreres davon zugleich.

Was stattdessen funktioniert:

1. **Die Kopie auf der Festplatte wertlos machen.** Hat nur das mit age verschlüsselte Archiv die Festplatte berührt, reicht es, dieses zu löschen; ohne Passphrase ist es Rauschen. Der Leitfaden des NIST zur Datenträgerbereinigung (SP 800-88 Rev. 2, September 2025) behandelt diese Idee, Cryptographic Erase, als Standardverfahren.
2. **Zerstören, nicht stoppen.** Bei Vast.ai bleiben die Daten einer gestoppten Instanz erhalten (und der Speicher wird weiter berechnet); Zerstören „löscht die Instanz und alle Daten dauerhaft“. Bei RunPod wird die Container-Disk beim Stoppen eines Pods geleert, das Volume unter `/workspace` übersteht das Stoppen und wird beim Beenden gelöscht, und ein Network Volume übersteht alles, bis Sie es löschen.
3. **Selbst angelegte Network Volumes löschen.** Sie überdauern Pods absichtlich.
4. **Widerrufen, was Sie genutzt haben.** Hugging-Face-Token, Bucket-Schlüssel, und entfernen Sie jeden einmaligen öffentlichen SSH-Schlüssel, den Sie für diesen Job beim Marktplatz hinterlegt haben.

Wie der Host Festplatten zwischen zwei Mietern löscht, beschreibt keine der Marktplatz-Dokus, die ich gelesen habe. Planen Sie so, als würde es nicht passieren. Schritt 1 schützt Sie in jedem Fall.

## Verträge und Vorschriften

Die technischen Kontrollen zählen weniger als eine rechtliche Tatsache: Wer Daten auf den Rechner eines anderen legt, macht ihn zum Beteiligten.

- **DSGVO.** Ein GPU-Host, der für Sie personenbezogene Daten verarbeitet, ist ein Auftragsverarbeiter. Art. 28 verlangt einen, der „hinreichende Garantien“ bietet, und einen verbindlichen Vertrag. Ein Peer-to-Peer-Host, mit dem Sie nie etwas unterschrieben haben, erfüllt das nicht, und die Maschine steht womöglich außerhalb der EU. Anonymisieren Sie oder nutzen Sie einen Anbieter, der einen AVV unterschreibt.
- **HIPAA.** Laut dem US-Gesundheitsministerium HHS ist ein Cloud-Anbieter, der elektronische Gesundheitsdaten speichert, ein Business Associate, auch wenn die Daten verschlüsselt sind und er keinen Schlüssel hat. Gesundheitsdaten vor dem Versand an einen ungeprüften Host zu verschlüsseln, macht ein BAA nicht überflüssig.
- **Die Verträge Ihrer Kunden.** Viele Unternehmensverträge beschränken Unterauftragsverarbeiter und den Speicherort der Daten. Prüfen Sie sie vor dem ersten Upload. Das rechtliche Risiko ist oft größer als das technische.

Der Begleitartikel [warum Unternehmen öffentliche KI-Tools einschränken](/de/why-corporate-policies-banning-chatgpt/) behandelt dieselben Regeln aus Sicht der Chat-Tools.

## Inferenz bei GPUFlow: ein anderer Tausch

GPUFlow ist kein Ort für einen Datensatz. Es ist ein Inferenz-Marktplatz: Sie mieten eine GPU stundenweise und bekommen einen OpenAI-kompatiblen API-Schlüssel (Base-URL `https://gpuflow.app/v1`) für das offene Modell, das ein Anbieter (meist mit Ollama) auf seinem eigenen Computer betreibt. Es gibt kein SSH, keine Shell und keinen Dateizugriff, und Sie können dort weder trainieren noch feintunen. Nichts, was Sie hochladen, liegt auf der Festplatte des Anbieters, weil Sie nichts hochladen können.

Damit fallen die Probleme mit Festplatte und Zugangsdaten aus dieser Anleitung weg. Das Problem mit dem Host bleibt. Jeder Prompt und jede Antwort läuft während der Miete im Klartext über den Rechner des Anbieters. Die Nutzungsbedingungen von GPUFlow verbieten Anbietern, sie aufzuzeichnen, zu lesen, aufzubewahren oder weiterzugeben, und GPUFlow selbst speichert den Text nicht. Aber der Anbieter hat Root-Rechte auf dem Rechner, die Regel wird also nur per Vertrag durchgesetzt. Schicken Sie einen Datensatz Datensatz für Datensatz als Prompts hindurch, landet jeder einzelne auf diesem Computer.

Nutzen Sie es also für öffentliche, synthetische oder sauber anonymisierte Daten und um ein offenes Modell oder eine App gegen eine API im OpenAI-Stil zu testen. Regulierte und vertrauliche Datensätze gehören auf Ihre eigene Hardware, zu einem Anbieter, mit dem Sie einen Vertrag haben, oder in eine vertrauliche VM. Der [API-Schnellstart](https://docs.gpuflow.app/de/renters/api-quickstart/) sagt dasselbe in einem Satz: Senden Sie keine Passwörter, Kartennummern oder andere Geheimnisse, die Sie keinem Fremden geben würden. Dieselbe Konstellation aus Sicht des Anbieters beschreibt [GPU vermieten: Ist das sicher?](/de/is-it-safe-to-rent-out-your-gpu/).

## Checkliste

Vorher:

- Datenklasse festlegen. Regulierte oder vertrauliche Kundendaten gehen zu einem Anbieter mit Vertrag oder in eine vertrauliche VM, nicht zu einem Community-Host.
- Minimieren und anonymisieren.
- Mit age verschlüsseln; die Passphrase bleibt vom Knoten fern.

Währenddessen:

- In `/dev/shm` entschlüsseln, wo es passt.
- Nur begrenzte, kurzlebige Tokens.
- Dienste an localhost gebunden, erreichbar über SSH-Tunnel.

Danach:

- Ergebnisse per SSH abholen; die feingetunten Gewichte als sensibel behandeln.
- Instanz und alle Network Volumes zerstören.
- Tokens und einmalige Schlüssel widerrufen.

## Quellen

- Container-Isolation und Secure Cloud bei Vast.ai: [Sicherheits-FAQ von Vast.ai](https://docs.vast.ai/guides/reference/faq/security); Stoppen oder Zerstören: [Instanzen verwalten](https://docs.vast.ai/guides/instances/manage-instances)
- Secure Cloud und Community Cloud bei RunPod: [Einen Pod wählen](https://docs.runpod.io/pods/choose-a-pod); Persistenz des Speichers: [Speichertypen](https://docs.runpod.io/pods/storage/types)
- LeftoverLocals: [Trail of Bits, Januar 2024](https://blog.trailofbits.com/2024/01/16/leftoverlocals-listening-to-llm-responses-through-leaked-gpu-local-memory/)
- age: [github.com/FiloSottile/age](https://github.com/FiloSottile/age)
- Grenzen von shred: [Handbuch der GNU coreutils, Aufruf von shred](https://www.gnu.org/software/coreutils/manual/html_node/shred-invocation.html)
- NIST SP 800-88 Rev. 2: [Ankündigung des NIST, September 2025](https://www.nist.gov/news-events/news/2025/09/guidelines-media-sanitization-nist-publishes-sp-800-88r2)
- Design von Confidential Computing auf der H100: [NVIDIA, Confidential Computing on H100 GPUs for Secure and Trustworthy AI](https://developer.nvidia.com/blog/confidential-computing-on-h100-gpus-for-secure-and-trustworthy-ai/); allgemeine Verfügbarkeit: [NVIDIA, April 2024](https://developer.nvidia.com/blog/announcing-confidential-computing-general-access-on-nvidia-h100-tensor-core-gpus/)
- Azure: [Serie NCCads H100 v5](https://learn.microsoft.com/en-us/azure/virtual-machines/sizes/gpu-accelerated/nccadsh100v5-series)
- Google Cloud: [Unterstützte Konfigurationen für Confidential VM](https://docs.cloud.google.com/confidential-computing/confidential-vm/docs/supported-configurations), [Eine Confidential-VM-Instanz mit GPU erstellen](https://docs.cloud.google.com/confidential-computing/confidential-vm/docs/create-a-confidential-vm-instance-with-gpu)
- Art. 28 DSGVO: [gdpr-info.eu](https://gdpr-info.eu/art-28-gdpr/)
- HIPAA und Cloud-Anbieter: [HHS, Leitfaden zu HIPAA und Cloud Computing](https://www.hhs.gov/hipaa/for-professionals/special-topics/health-information-technology/cloud-computing/index.html)
- GPUFlow: [API-Schnellstart](https://docs.gpuflow.app/de/renters/api-quickstart/), [Worauf Mieter zugreifen können und worauf nicht](https://docs.gpuflow.app/de/providers/security/), [Nutzungsbedingungen](https://gpuflow.app/de/terms), [Datenschutzerklärung](https://gpuflow.app/de/privacy)

Alle geprüft im September 2026.
