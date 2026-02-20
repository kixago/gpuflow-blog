---
title: "Einrichtung von MetaMask und Polygon für Ihre erste GPU-Miete"
description: "Schritt-für-Schritt-Anleitung zur Installation von MetaMask, Konfiguration des Polygon-Netzwerks und Aufladung Ihrer Wallet für die GPU-Miete. Kompletter Leitfaden für Anfänger: Von Null zur aufgeladenen Wallet in 15 Minuten."
excerpt: "Noch nie eine Krypto-Wallet benutzt? Dieser Leitfaden führt Sie durch die MetaMask-Installation, die Einrichtung des Polygon-Netzwerks und das Aufladen Ihrer Wallet für die GPU-Miete. Keine Krypto-Vorkenntnisse erforderlich."
pubDate: 2026-02-19
updatedDate: 2026-02-19
locale: "de"
category: "tutorials"
featured: false
draft: false
author: "GPUFlow Team"
heroImage: "../_images/metamask-polygon-gpu-rental-setup-hero.png"
heroImageAlt: "MetaMask-Fuchs-Logo neben dem violetten Polygon-Logo mit einem GPU-Grafikkarten-Symbol, das den Verbindungsfluss von der Wallet zur GPU mit den Einrichtungsschritten zeigt"
faq:
  - question: "Warum benötige ich MetaMask für die GPU-Miete?"
    answer: "MetaMask ist eine Kryptowährungs-Wallet, mit der Sie Gelder speichern und mit Blockchain-basierten Plattformen wie GPUFlow interagieren können. GPU-Mietplattformen, die Zahlungen in Kryptowährung verwenden, erfordern eine Wallet, um Ihr Guthaben zu verwahren und Transaktionen zu genehmigen. MetaMask ist die kompatibelste Option und funktioniert mit fast allen Plattformen. Sie wird als Browser-Erweiterung installiert und die Einrichtung dauert etwa 5 Minuten."
  - question: "Warum Polygon statt Ethereum für die GPU-Miete nutzen?"
    answer: "Polygon bietet Transaktionsgebühren von 0,001–0,05 $ im Vergleich zu den Gebühren von Ethereum, die oft bei 1–10 $+ liegen. Für die GPU-Miete, bei der Sie möglicherweise mehrere Einzahlungen, Mietvorgänge und Auszahlungen tätigen, spart Polygon erheblich Geld. Eine typische GPU-Mietsitzung auf Ethereum könnte allein an Gasgebühren 5–15 $ kosten. Dieselbe Sitzung auf Polygon kostet an Gebühren unter 0,10 $. Plattformen wie GPUFlow nutzen Polygon gezielt, weil niedrige Gebühren kleine Transaktionen wirtschaftlich machen."
  - question: "Was ist eine Seed Phrase und warum ist sie wichtig?"
    answer: "Eine Seed Phrase ist eine Wiederherstellungsphrase aus 12 oder 24 Wörtern, die vollständigen Zugriff auf Ihre Wallet gewährt. Jeder, der diese Wörter besitzt, kann von jedem Gerät aus auf alle Gelder in der Wallet zugreifen. Sie müssen diese Phrase auf Papier notieren (niemals digital speichern) und sicher verwahren. Wenn Sie Ihre Seed Phrase verlieren und Ihr Gerät ausfällt, sind Ihre Gelder unwiederbringlich verloren. Kein Unternehmen und kein Support-Team kann helfen – die Seed Phrase ist der einzige Weg zur Wiederherstellung."
  - question: "Wie viel MATIC benötige ich für Gasgebühren?"
    answer: "Ungefähr 0,50–2,00 $ in MATIC reichen für Dutzende von Transaktionen auf Polygon aus. Jede Transaktion kostet 0,001–0,05 $ an Gas, sodass selbst 1 $ in MATIC je nach Netzwerkbedingungen 20 bis über 100 Transaktionen abdeckt. Sie benötigen MATIC speziell für die Gasgebühren, selbst wenn Sie die GPU-Miete in USDC oder anderen Token bezahlen – Gasgebühren müssen immer in der nativen Währung des Netzwerks beglichen werden."
  - question: "Kann ich eine andere Wallet als MetaMask verwenden?"
    answer: "Ja. Alternativen sind Rainbow (fokussiert auf Mobilgeräte), Coinbase Wallet (gut für Coinbase-Nutzer), Rabby (entwicklerfreundlich) und Hardware-Wallets wie Ledger mit Browser-Integration. GPU-Mietplattformen unterstützen in der Regel jede Wallet, die mit WalletConnect oder direkten Browser-Erweiterungen kompatibel ist. MetaMask wird Anfängern empfohlen aufgrund der umfangreichen Dokumentation, der breiten Kompatibilität und der großen Nutzergemeinschaft für Hilfestellungen."
---

Die Kluft zwischen dem Gedanken "Ich möchte eine GPU mit Krypto mieten" und der tatsächlichen Umsetzung liegt meist an einer Sache: der Einrichtung der Wallet. Die GPU-Miete selbst dauert dreißig Sekunden. Eine finanzierte Kryptowährungs-Wallet mit dem richtigen Netzwerk zu verbinden, dauert länger, wenn man es noch nie zuvor getan hat, und die meisten Anleitungen setzen voraus, dass Sie bereits Krypto besitzen und Gasgebühren verstehen.

Dieses Tutorial beginnt bei Null. Es sind keine Vorkenntnisse im Bereich Kryptowährung erforderlich. Am Ende werden Sie eine MetaMask-Wallet haben, die mit dem Polygon-Netzwerk verbunden ist und über genügend Guthaben verfügt, um Ihre erste GPU zu mieten. Der gesamte Prozess kostet weniger als 2 $ an Gebühren und dauert etwa fünfzehn Minuten, wobei die meiste Zeit auf das Warten auf Bestätigungen der Auszahlung durch die Börse entfällt.

Für den kompletten Prozess der GPU-Miete nach der Wallet-Einrichtung – einschließlich Plattformvergleichen, Smart-Contract-Treuhand (Escrow) und Mietverwaltung – lesen Sie unseren [Vollständigen Leitfaden zur GPU-Miete mit Kryptowährung](/de/rent-gpu-with-crypto/).

---

## Warum Polygon statt Ethereum Mainnet

Bevor wir mit der Einrichtung beginnen, ist es wichtig zu verstehen, warum Polygon relevant ist. Dies wird Ihnen bei jeder Transaktion Geld sparen.

### Das Problem mit den Gasgebühren

Jede Blockchain-Transaktion erfordert eine Gebühr, die an die Validatoren des Netzwerks gezahlt wird. Im Ethereum Mainnet schwanken diese Gebühren (genannt "Gas") je nach Netzauslastung:

**Gas-Kosten im Ethereum Mainnet:**

- Einfache Überweisung: 1–5 $
- Token-Genehmigung: 2–8 $
- Komplexe Transaktion (Treuhand-Einzahlung): 5–15 $
- Bei hoher Nachfrage: 20–50 $+

**Für die GPU-Miete schafft dies ein Problem:**

Stellen Sie sich vor, Sie mieten eine RTX 4090 für 2 Stunden zu 0,60 $/Stunde:

- GPU-Kosten: 1,20 $
- Ethereum Gas für Einzahlung: 5,00 $
- Ethereum Gas für Auszahlung: 5,00 $
- **Gesamt: 11,20 $ für 1,20 $ GPU-Zeit**

Wenn die Gasgebühren die Mietkosten übersteigen, werden kleine Transaktionen wirtschaftlich irrational.

### Polygon: Gleiche Sicherheit, 100x niedrigere Gebühren

Polygon ist ein "Layer 2"-Netzwerk, das auf Ethereum aufbaut. Es übernimmt das Sicherheitsmodell von Ethereum, verarbeitet Transaktionen jedoch zu drastisch niedrigeren Kosten:

**Gas-Kosten auf Polygon:**

- Einfache Überweisung: 0,001–0,01 $
- Token-Genehmigung: 0,005–0,02 $
- Komplexe Transaktion (Treuhand-Einzahlung): 0,01–0,05 $
- Bei hoher Nachfrage: 0,05–0,20 $

**Das gleiche GPU-Mietszenario auf Polygon:**

- GPU-Kosten: 1,20 $
- Polygon Gas für Einzahlung: 0,02 $
- Polygon Gas für Auszahlung: 0,02 $
- **Gesamt: 1,24 $ für 1,20 $ GPU-Zeit**

Die Gasgebühren werden vernachlässigbar, anstatt prohibitiv zu sein.

### Technische Details (Für Neugierige)

Polygon erreicht niedrige Gebühren durch andere Konsensmechanismen und gebündelte Transaktionsverarbeitung. Die technische Architektur ist weniger wichtig als das praktische Ergebnis:

| Netzwerk         | Bestätigungszeit | Transaktionsgebühr | Sicherheit                      |
| ---------------- | ---------------- | ------------------ | ------------------------------- |
| Ethereum Mainnet | 15–60 Sekunden   | 1–15 $             | Höchste                         |
| Polygon          | 2–5 Sekunden     | 0,001–0,05 $       | Hoch (durch Ethereum gesichert) |
| Solana           | <1 Sekunde       | 0,0001–0,01 $      | Hoch                            |

GPUFlow und andere krypto-native GPU-Plattformen nutzen Polygon, weil:

- Gebühren die Wirtschaftlichkeit kleiner Mieten nicht zerstören
- Schnelle Bestätigung einen raschen Zugriff bedeutet
- Sicherheit durch die Ethereum-Verankerung stark bleibt
- Breite Verfügbarkeit von Stablecoins (USDC, USDT)

### Ihre Wallet funktioniert in beiden Netzwerken

Hier ist das Schlüsselkonzept: **Ihre MetaMask-Wallet-Adresse ist auf Ethereum und Polygon identisch.**

Die Adresse `0x7a3B...4f2D` existiert in beiden Netzwerken. Gelder, die an diese Adresse auf Polygon gesendet werden, bleiben auf Polygon. Gelder, die auf Ethereum gesendet werden, bleiben auf Ethereum. Dieselbe Adresse, verschiedene Netzwerke, getrennte Guthaben.

Deshalb ist die Netzwerkauswahl beim Senden von Geldern entscheidend. Wenn Sie USDC im Ethereum Mainnet an Ihre Adresse senden, sind diese Gelder nicht auf Polygon verfügbar – sie befinden sich trotz identischer Adresse in unterschiedlichen Netzwerken.

![Vergleichsdiagramm, das zeigt, dass eine identische Wallet-Adresse sowohl im Ethereum Mainnet als auch im Polygon-Netzwerk existiert, mit getrennten Guthaben in jedem Netzwerk, was illustriert, dass dieselbe Adresse nicht bedeutet, dass Gelder netzwerkübergreifend geteilt werden](../_images/ethereum-polygon-same-address-different-networks.png)

---

## MetaMask-Installation und Sicherheit der Seed Phrase

MetaMask ist eine Browser-Erweiterungs-Wallet, die Ihre Kryptowährung speichert und Ihnen die Interaktion mit Blockchain-Anwendungen ermöglicht. Die Installation dauert etwa fünf Minuten.

### Schritt 1: MetaMask herunterladen

**Gehen Sie direkt zur offiziellen Quelle:**

1. Öffnen Sie Ihren Browser (Chrome, Firefox, Brave oder Edge)
2. Besuchen Sie **metamask.io** (überprüfen Sie die URL sorgfältig – es gibt Phishing-Seiten)
3. Klicken Sie auf "Download"
4. Wählen Sie Ihren Browser aus
5. Klicken Sie im Erweiterungs-Store auf "Zu [Browser] hinzufügen"
6. Bestätigen Sie die Installation, wenn Sie dazu aufgefordert werden

**Warnung:** Laden Sie MetaMask nur von metamask.io oder den offiziellen Browser-Erweiterungs-Stores herunter. Installieren Sie niemals über Links in E-Mails, Discord-Nachrichten oder Suchanzeigen. Gefälschte MetaMask-Erweiterungen stehlen Gelder.

### Schritt 2: Neue Wallet erstellen

Nach der Installation:

1. Klicken Sie auf das MetaMask-Fuchs-Symbol in Ihrer Browser-Symbolleiste
2. Klicken Sie auf "Get Started" (Loslegen)
3. Wählen Sie "Create a new wallet" (Neue Wallet erstellen)
4. Stimmen Sie den Bedingungen zu (lesen Sie diese bei Bedarf, es sind Standard-Softwarebedingungen)
5. Erstellen Sie ein Passwort

**Dieses Passwort:**

- Entsperrt MetaMask auf diesem spezifischen Gerät
- Stellt Ihre Wallet **NICHT** wieder her, wenn Sie den Zugriff verlieren
- Sollte stark sein, muss aber nicht für immer gemerkt werden
- Ist getrennt von Ihrer Seed Phrase (wird als Nächstes erklärt)

### Schritt 3: Sichern Sie Ihre Seed Phrase

**Dies ist der wichtigste Schritt. Lesen Sie sorgfältig.**

MetaMask zeigt 12 Wörter in einer bestimmten Reihenfolge an. Diese Wörter sind Ihre "Seed Phrase" oder "Wiederherstellungsphrase".

**Was die Seed Phrase tut:**

- Gewährt vollständigen Zugriff auf Ihre Wallet von jedem Gerät aus
- Ermöglicht die Wiederherstellung, wenn Ihr Computer kaputtgeht, der Browser abstürzt oder MetaMask beschädigt wird
- Kann nicht geändert oder zurückgesetzt werden – diese 12 Wörter sind permanent für diese Wallet
- Jeder mit diesen Wörtern kann sofort alle Ihre Gelder nehmen

**Was zu tun ist:**

1. MetaMask zeigt 12 Wörter auf dem Bildschirm an
2. **Schreiben Sie sie in exakter Reihenfolge auf Papier** (Wort 1, Wort 2... Wort 12)
3. Nicht fotografieren, keinen Screenshot machen und nicht in ein digitales Gerät tippen
4. Nicht in Passwort-Managern, Cloud-Laufwerken oder Notiz-Apps speichern
5. Bewahren Sie das Papier an einem sicheren Ort auf (Safe, Schließfach)
6. Erwägen Sie eine zweite Kopie an einem anderen physischen Ort

**Was NICHT zu tun ist:**

- Geben Sie die Seed Phrase niemals auf einer Website ein (legitime Seiten fragen nie danach)
- Teilen Sie sie niemals mit jemandem, der behauptet, vom "Support" zu sein
- Speichern Sie sie niemals digital in irgendeiner Form
- Lesen Sie sie niemals laut vor, wenn andere Personen oder Geräte in Hörweite sind

**Warum das wichtig ist:**

Im Gegensatz zu Bankkonten gibt es bei Kryptowährungs-Wallets keinen Kundendienst, keine Betrugsabteilung und keine Transaktionsrückabwicklung. Wenn jemand Ihre Seed Phrase bekommt:

- Leert er Ihre Wallet in Sekunden
- Keine Behörde kann die Transaktion rückgängig machen
- Eine Wiederherstellung ist nicht möglich
- Die Gelder sind unwiederbringlich weg

Die Seed Phrase _ist_ die Wallet. Schützen Sie sie entsprechend.

### Schritt 4: Seed Phrase bestätigen

MetaMask wird Sie bitten, die Phrase zu bestätigen, indem Sie die Wörter in der richtigen Reihenfolge auswählen:

1. Klicken Sie die Wörter in der korrekten Sequenz an
2. Dies verifiziert, dass Sie sie tatsächlich aufgeschrieben haben
3. Überspringen Sie dies nicht durch kurzes Auswendiglernen – Sie benötigen das schriftliche Backup

### Schritt 5: Wallet bereit

Nach der Bestätigung ist Ihre Wallet erstellt und einsatzbereit. Sie sehen:

- Ihre Wallet-Adresse (beginnt mit `0x`, gefolgt von 40 Zeichen)
- Guthabenanzeige mit 0 ETH (Sie haben sie noch nicht aufgeladen)
- Netzwerkanzeige zeigt "Ethereum Mainnet"

**Ihre Wallet-Adresse:**

- Diese ist öffentlich – es ist sicher, sie zu teilen, um Gelder zu empfangen
- Wie eine E-Mail-Adresse für Kryptowährung
- Ändert sich nicht und kann nicht modifiziert werden
- Dieselbe Adresse funktioniert über mehrere Netzwerke hinweg (Ethereum, Polygon usw.)

![MetaMask-Wallet-Oberfläche, die eine neue Wallet mit Null-Guthaben zeigt, mit Hervorhebung der Wallet-Adresse, des Netzwerk-Selektors und wichtiger Oberflächenelemente für neue Benutzer](../_images/metamask-new-wallet-interface-annotated.png)

---

## Hinzufügen des Polygon-Netzwerks zu MetaMask

MetaMask ist standardmäßig auf das Ethereum Mainnet eingestellt. Um die niedrigen Gebühren von Polygon zu nutzen, müssen Sie das Netzwerk hinzufügen.

### Methode 1: Automatische Hinzufügung (Am einfachsten)

1. Besuchen Sie **chainlist.org**
2. Suchen Sie nach "Polygon"
3. Finden Sie "Polygon Mainnet" (Chain ID: 137)
4. Klicken Sie auf "Add to MetaMask"
5. Ein MetaMask-Popup erscheint – klicken Sie auf "Approve" (Genehmigen)
6. Klicken Sie auf "Switch to Network" (Netzwerk wechseln), um Polygon zu aktivieren

**Fertig.** Polygon ist nun in Ihrem Netzwerk-Dropdown verfügbar.

### Methode 2: Manuelle Hinzufügung

Wenn chainlist.org nicht funktioniert, fügen Sie es manuell hinzu:

1. Klicken Sie auf das MetaMask-Erweiterungssymbol
2. Klicken Sie auf das Netzwerk-Dropdown (zeigt "Ethereum Mainnet")
3. Klicken Sie auf "Add network" (Netzwerk hinzufügen)
4. Klicken Sie auf "Add a network manually" (Netzwerk manuell hinzufügen)
5. Geben Sie exakt diese Details ein:

```

Network Name: Polygon Mainnet
New RPC URL: https://polygon-rpc.com
Chain ID: 137
Currency Symbol: MATIC
Block Explorer URL: https://polygonscan.com

```

6. Klicken Sie auf "Save" (Speichern)
7. Polygon erscheint in Ihrer Netzwerkliste

### Wechseln zwischen Netzwerken

Nach dem Hinzufügen von Polygon:

1. Klicken Sie auf das Netzwerk-Dropdown in MetaMask (oben in der Mitte der Erweiterung)
2. Wählen Sie "Polygon Mainnet" oder "Ethereum Mainnet"
3. Ihre Guthabenanzeige ändert sich, um die Gelder im ausgewählten Netzwerk anzuzeigen

**Denken Sie daran:** Gleiche Adresse, verschiedene Netzwerke. Gelder auf Ethereum sind nicht sichtbar, wenn Sie Polygon betrachten, und umgekehrt. Sie schauen in denselben Briefkasten, aber in verschiedenen Postämtern.

### Überprüfung der Netzwerk-Hinzufügung

Bestätigen Sie, dass Polygon funktioniert:

1. Wechseln Sie zum Polygon Mainnet
2. Das Guthaben sollte "0 MATIC" anzeigen (Sie haben es noch nicht aufgeladen)
3. Ein kleines Polygon-Logo erscheint neben dem Netzwerknamen
4. Die Adresse bleibt dieselbe wie auf Ethereum

Wenn Sie Fehler bezüglich RPC-Verbindungen sehen:

- Versuchen Sie eine alternative RPC-URL: `https://rpc-mainnet.matic.quiknode.pro`
- Oder: `https://polygon-bor.publicnode.com`
- Netzwerküberlastung verursacht gelegentlich RPC-Probleme

![MetaMask-Netzwerk-Auswahlmenü, das sowohl Ethereum Mainnet als auch Polygon Mainnet anzeigt, wobei Polygon ausgewählt und hervorgehoben ist, um den Wechsel zwischen Netzwerken zu demonstrieren](../_images/metamask-network-selector-polygon.png)

---

## Aufladen Ihrer Wallet mit USDC

Ihre Wallet existiert nun, ist aber leer. Dieser Abschnitt behandelt, wie Sie USDC (der empfohlene Stablecoin für die GPU-Miete) auf das Polygon-Netzwerk in Ihre MetaMask-Wallet bekommen.

### Warum USDC für die GPU-Miete

**Stablecoins eliminieren Preisvolatilität:**

- USDC hält eine 1:1-Bindung an den US-Dollar.
- 100 USDC heute entsprechen 100 USDC morgen.
- Kein Risiko, dass Preisschwankungen der Kryptowährung Ihr GPU-Budget beeinflussen.

**Im Vergleich zu volatilen Kryptowährungen:**

- Sie zahlen 100 $ in ETH für die GPU-Miete ein.
- ETH fällt über Nacht um 10 %.
- Ihr verbleibendes Guthaben kauft 10 % weniger GPU-Zeit.
- Der Preis hat sich zu Ihren Ungunsten entwickelt, ohne dass Sie etwas getan haben.

**USDC vermeidet dies vollständig.** Ihr Budget für die GPU-Miete bleibt unabhängig von den Marktbedingungen stabil.

### Auflademethode 1: Auszahlung von einer Börse (Empfohlen)

Wenn Sie bereits Kryptowährung auf einer Börse (wie Coinbase, Binance, Kraken usw.) besitzen, ist die direkte Auszahlung auf Polygon die günstigste Option.

**Schritt-für-Schritt für Coinbase:**

1. Melden Sie sich bei Coinbase an.
2. Navigieren Sie zu Ihrem USDC-Guthaben.
3. Klicken Sie auf "Send" (Senden).
4. Geben Sie Ihre MetaMask-Wallet-Adresse ein (kopieren Sie diese aus MetaMask).
5. **Wichtig:** Wählen Sie "Polygon" als Netzwerk.
6. Geben Sie den zu sendenden Betrag ein.
7. Überprüfen Sie die Gebühren (typischerweise 0,10–1,00 $ für Polygon-Auszahlungen).
8. Bestätigen Sie die Auszahlung.
9. Warten Sie auf die Bestätigung (normalerweise 1–10 Minuten).

**Schritt-für-Schritt für Binance:**

1. Melden Sie sich bei Binance an.
2. Navigieren Sie zu Wallet → Spot Wallet.
3. Finden Sie USDC und klicken Sie auf "Withdraw" (Auszahlen).
4. Fügen Sie Ihre MetaMask-Wallet-Adresse ein.
5. **Wichtig:** Wählen Sie das Netzwerk "MATIC" oder "Polygon".
6. Geben Sie den Betrag ein.
7. Schließen Sie die Sicherheitsüberprüfung ab.
8. Warten Sie auf die Bestätigung (normalerweise 5–15 Minuten).

**Gängige Börsen, die Polygon-USDC-Auszahlungen unterstützen:**

| Börse      | Polygon-Support | Typische Gebühr |
| ---------- | --------------- | --------------- |
| Coinbase   | Ja              | 0,10–0,50 $     |
| Binance    | Ja              | 0,10–0,30 $     |
| Kraken     | Ja              | 0,10–0,50 $     |
| Crypto.com | Ja              | 0,10–0,25 $     |
| KuCoin     | Ja              | 0,10–0,30 $     |
| OKX        | Ja              | 0,10–0,20 $     |

**Wenn Ihre Börse keine Polygon-Auszahlungen unterstützt:**

Sie haben zwei Möglichkeiten:

1. Über Ethereum auszahlen und dann zu Polygon "bridgen" (kostet mehr an Gasgebühren).
2. Eine andere Börse nutzen, die Polygon unterstützt.

Das Bridgen von Ethereum kostet 5–15 $ an Gasgebühren. Die Nutzung einer Börse mit nativer Polygon-Unterstützung kostet 0,10–0,50 $. Die Wahl ist bei kleinen Beträgen offensichtlich.

### Auflademethode 2: Direktkauf über Onramp

Wenn Sie nirgendwo Kryptowährung besitzen, ermöglichen Ihnen Onramp-Dienste den Direktkauf per Kreditkarte oder Banküberweisung.

**Beliebte Onramp-Dienste:**

| Dienst  | Zahlungsmethoden | Gebühren | Polygon-Support |
| ------- | ---------------- | -------- | --------------- |
| Transak | Karte, Bank      | 1–3 %    | Ja              |
| MoonPay | Karte, Bank      | 2–4 %    | Ja              |
| Ramp    | Karte, Bank      | 1–3 %    | Ja              |
| Banxa   | Karte, Bank      | 2–4 %    | Ja              |

**Schritt-für-Schritt mit Transak:**

1. Besuchen Sie transak.com.
2. Wählen Sie "Buy" (Kaufen).
3. Wählen Sie USDC als Kryptowährung.
4. Wählen Sie Polygon als Netzwerk.
5. Geben Sie den Betrag in Ihrer lokalen Währung ein.
6. Klicken Sie auf "Buy Now" (Jetzt kaufen).
7. Verbinden Sie Ihre MetaMask-Wallet oder fügen Sie die Adresse ein.
8. Schließen Sie die Zahlung ab (Karte oder Bank).
9. USDC kommt direkt in Ihrer MetaMask auf Polygon an.

**Die Gebühren sind höher als bei einer Börsen-Auszahlung** (1–4 % vs. 0,10–0,50 $ pauschal), aber Onramps sind bequem, wenn Sie bei Null anfangen.

### Auflademethode 3: Integrierter Kauf in MetaMask

MetaMask enthält eine Kauf-Funktionalität über Partnerdienste:

1. Öffnen Sie MetaMask.
2. Stellen Sie sicher, dass das Polygon-Netzwerk ausgewählt ist.
3. Klicken Sie auf "Buy" (Kaufen).
4. Wählen Sie die Zahlungsmethode.
5. Wählen Sie den Betrag.
6. Schließen Sie den Kauf über den Partner (Transak, MoonPay usw.) ab.

**Gleiche Gebühren wie beim direkten Onramp**, da MetaMask über dieselben Dienste leitet, aber die Integration ist etwas bequemer.

### Auflademethode 4: Bridgen von Ethereum

Wenn Sie USDC im Ethereum Mainnet haben und nicht direkt auf Polygon auszahlen können:

**Nutzung der offiziellen Polygon Bridge:**

1. Besuchen Sie portal.polygon.technology/bridge.
2. Verbinden Sie MetaMask.
3. Wählen Sie "Deposit" (Einzahlen) (Ethereum → Polygon).
4. Wählen Sie USDC.
5. Geben Sie den Betrag ein.
6. Genehmigen Sie die USDC-Ausgabe (Gaskosten: 2–8 $).
7. Bestätigen Sie die Bridge-Transaktion (Gaskosten: 5–15 $).
8. Warten Sie 15–30 Minuten auf den Abschluss.
9. USDC erscheint in der Wallet auf Polygon.

**Gesamte Ethereum-Gaskosten: 7–23 $** je nach Netzwerküberlastung.

**Dies ist die teure Option.** Nutzen Sie das Bridgen nur, wenn:

- Ihre Börse keine Polygon-Auszahlung unterstützt.
- Sie bereits USDC auf Ethereum feststecken haben.
- Der Betrag groß genug ist, dass die Bridge-Gebühren proportional gering sind.

Für Beträge unter 200 $ ist es wirtschaftlicher, eine Börse mit Polygon-Unterstützung zu finden, als zu bridgen.

### Überprüfung des Geldeingangs

Nach jeder Auflademethode:

1. Öffnen Sie MetaMask.
2. **Stellen Sie sicher, dass das Polygon-Netzwerk ausgewählt ist** (häufiger Fehler: falsches Netzwerk prüfen).
3. Klicken Sie auf "Import tokens" (Token importieren), falls USDC nicht automatisch erscheint.
4. USDC-Vertragsadresse auf Polygon: `0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359`
5. Das Guthaben sollte Ihre Einzahlung widerspiegeln.

**Wenn keine Gelder erscheinen:**

- Bestätigen Sie, dass die Transaktion auf der Senderseite (Börse, Onramp) abgeschlossen ist.
- Überprüfen Sie, ob Sie das Polygon-Netzwerk in MetaMask betrachten.
- Überprüfen Sie die Transaktion auf Polygonscan mit Ihrer Wallet-Adresse.
- Einige Token erfordern einen manuellen Import (Token über Vertragsadresse hinzufügen).

![Flussdiagramm, das drei Finanzierungswege zu MetaMask auf Polygon zeigt: Börsen-Auszahlungsweg mit den niedrigsten Gebühren, Onramp-Kaufweg für neue Benutzer und Ethereum-Bridge-Weg, der als teure Option gekennzeichnet ist, mit Gebührenschätzungen für jeden Weg](../_images/funding-metamask-polygon-three-paths.png)

---

## Beschaffung von MATIC für Gasgebühren

Sie haben USDC für die GPU-Miete, können aber noch keine Transaktionen durchführen. Jede Polygon-Transaktion erfordert eine kleine Menge MATIC, um die Gasgebühren zu bezahlen – auch Transaktionen, die andere Token wie USDC betreffen.

### Warum Sie MATIC benötigen

**Gebührenstruktur der Blockchain:**

- Gasgebühren müssen in der nativen Währung des Netzwerks bezahlt werden.
- Die native Währung von Polygon ist MATIC.
- Selbst wenn Sie die GPU-Miete in USDC bezahlen, kostet die Transaktion selbst MATIC.
- Kein MATIC = keine Transaktionen möglich.

**Der benötigte Betrag ist winzig:**

| Aktion                   | Ungefähre MATIC-Kosten | USD-Gegenwert |
| ------------------------ | ---------------------- | ------------- |
| USDC senden              | 0,001–0,01 MATIC       | 0,001–0,01 $  |
| Token-Ausgabe genehmigen | 0,005–0,02 MATIC       | 0,005–0,02 $  |
| Einzahlung auf Plattform | 0,01–0,05 MATIC        | 0,01–0,05 $   |
| Komplexe Transaktion     | 0,02–0,10 MATIC        | 0,02–0,10 $   |

**1–2 $ in MATIC decken Dutzende von Transaktionen ab.** Sie brauchen nicht viel, aber Sie brauchen etwas.

### Methode 1: MATIC von einer Börse abheben

Derselbe Prozess wie bei der USDC-Auszahlung:

1. Finden Sie auf Ihrer Börse MATIC.
2. Klicken Sie auf "Withdraw" (Auszahlen).
3. Geben Sie die MetaMask-Adresse ein.
4. **Wählen Sie das Polygon-Netzwerk** (manche Börsen nennen es "MATIC").
5. Heben Sie einen kleinen Betrag ab (im Wert von 2–5 $).
6. MATIC kommt in der Wallet an.

**Die meisten großen Börsen unterstützen MATIC-Auszahlungen auf Polygon.** Die Gebühren betragen typischerweise 0,01–0,10 $.

### Methode 2: Einen Faucet nutzen

Faucets (Wasserhähne) stellen kleine Mengen MATIC kostenlos zur Verfügung, gedacht für neue Benutzer, die Gas benötigen, um loszulegen.

**Verfügbare Faucets:**

| Faucet                                               | Betrag            | Häufigkeit  |
| ---------------------------------------------------- | ----------------- | ----------- |
| Polygon Faucet (faucet.polygon.technology)           | 0,001–0,002 MATIC | Täglich     |
| Alchemy Faucet (alchemy.com/faucets/polygon-mainnet) | 0,5 MATIC         | Pro Account |
| QuickNode Faucet                                     | Variabel          | Begrenzt    |

**Nutzung des Alchemy Faucets (empfohlen):**

1. Besuchen Sie alchemy.com/faucets/polygon-mainnet.
2. Erstellen Sie ein kostenloses Alchemy-Konto (oder melden Sie sich an).
3. Fügen Sie Ihre MetaMask-Wallet-Adresse ein.
4. Klicken Sie auf "Send Me MATIC" (Sende mir MATIC).
5. 0,5 MATIC kommen innerhalb von Minuten an.

**0,5 MATIC reichen für ca. 50–100 Transaktionen** – genug für Monate typischer GPU-Mietnutzung.

### Methode 3: USDC in MATIC tauschen (Swap)

Wenn Sie USDC aber kein MATIC haben, nutzen Sie den integrierten Swap von MetaMask:

1. Öffnen Sie MetaMask im Polygon-Netzwerk.
2. Klicken Sie auf "Swap" (Tauschen).
3. Wählen Sie USDC als "Von"-Token.
4. Wählen Sie MATIC als "Zu"-Token.
5. Geben Sie einen kleinen Betrag ein (im Wert von 1–2 $).
6. Überprüfen Sie Kurs und Gebühren.
7. Klicken Sie auf "Swap".

**Problem:** Dieser Swap selbst erfordert MATIC für Gas. Wenn Sie exakt null MATIC haben, können Sie den Swap nicht ausführen.

**Lösung für die "Null MATIC"-Situation:**

- Nutzen Sie zuerst einen Faucet, um minimales MATIC zu erhalten.
- Einige Swap-Aggregatoren bieten "gaslose" Swaps an, bei denen sie das Gas vorstrecken.
- Bitten Sie jemanden, Ihnen 0,01 MATIC zu senden (Community-Mitglieder helfen oft Neulingen).

### Methode 4: Gas-Sponsoring

Einige Plattformen sponsern die Gasgebühren für neue Benutzer:

**Der Ansatz von GPUFlow:**

GPUFlow erkennt, wenn Benutzer USDC, aber unzureichend MATIC haben, und bietet an, die Gasgebühr der ersten Transaktion zu sponsern. Dies ermöglicht Benutzern:

1. USDC auf die Plattform einzuzahlen.
2. Die Plattform übernimmt die Gaskosten für die Ersteinzahlung.
3. Der Benutzer kann später bei Bedarf eine kleine Menge MATIC vom Plattformguthaben abheben.

**Andere Sponsoring-Optionen:**

- Einige DeFi-Protokolle sponsern Gas für Erstnutzer.
- Community-Faucets in Discord-Servern.
- Layer-2-Onramps, die kleine Mengen MATIC bei USDC-Käufen inkludieren.

### Wie viel MATIC Sie behalten sollten

**Empfohlenes MATIC-Guthaben für die GPU-Miete:**

| Nutzungsgrad                    | MATIC-Guthaben | USD-Wert | Reicht für  |
| ------------------------------- | -------------- | -------- | ----------- |
| Leicht (wenige Mieten/Monat)    | 0,5 MATIC      | ~0,50 $  | 3–6 Monate  |
| Mittel (wöchentliche Mieten)    | 2 MATIC        | ~2,00 $  | 6–12 Monate |
| Schwer (tägliche Transaktionen) | 5 MATIC        | ~5,00 $  | 6–12 Monate |

**Sie brauchen nicht viel.** Selbst intensive Nutzer benötigen selten mehr als 5 $ an MATIC für Gas über viele Monate hinweg. Die Kosten pro Transaktion sind so niedrig, dass sich das MATIC-Guthaben sehr langsam verbraucht.

### Überprüfung des MATIC-Guthabens

1. Öffnen Sie MetaMask.
2. Wählen Sie das Polygon-Netzwerk.
3. Das MATIC-Guthaben wird oben angezeigt (es ist die native Währung, immer sichtbar).
4. Bestätigen Sie, dass das Guthaben größer als 0 ist.

**Mit sowohl USDC als auch MATIC in Ihrer Wallet sind Sie bereit, sich mit GPU-Plattformen zu verbinden.**

![Vergleich der MATIC-Beschaffungsmethoden: Börsen-Auszahlung für größere Beträge, Faucets für kostenlose kleine Beträge und Swap zur Umwandlung vorhandener Token, wobei der empfohlene Ansatz für neue GPU-Mietbenutzer hervorgehoben ist](../_images/matic-acquisition-methods-comparison.png)

---

## Verbinden Ihrer Wallet mit GPU-Mietplattformen

Ihre Wallet ist aufgeladen. Verbinden Sie sie nun mit einer GPU-Mietplattform. Dieser Abschnitt erklärt, was während der Verbindung passiert und welche Berechtigungen Sie gewähren.

### Verständnis der Wallet-Verbindung

Wenn eine Website eine Wallet-Verbindung anfordert, gewähren Sie begrenzten Zugriff:

**Was die Verbindung ERLAUBT:**

- Die Website kann Ihre Wallet-Adresse sehen.
- Die Website kann Ihre Token-Guthaben sehen.
- Die Website kann Transaktionen anfordern (die Sie individuell genehmigen müssen).

**Was die Verbindung NICHT ERLAUBT:**

- Die Website kann keine Gelder ohne Ihre Zustimmung bewegen.
- Die Website kann Transaktionen nicht automatisch signieren.
- Die Website kann nicht auf Ihre privaten Schlüssel oder Seed Phrase zugreifen.

**Die Wallet-Verbindung ist wie das Vorzeigen Ihres Ausweises**, nicht das Aushändigen Ihrer Schlüssel. Die Website erfährt, wer Sie sind (Ihre Adresse), kann aber nicht als Sie handeln.

### Verbinden mit GPUFlow

**Schritt-für-Schritt:**

1. Besuchen Sie gpuflow.app.
2. Stellen Sie sicher, dass MetaMask auf das Polygon-Netzwerk eingestellt ist.
3. Klicken Sie auf "Connect Wallet" (Wallet verbinden) (meist oben rechts).
4. Ein MetaMask-Popup erscheint mit der Verbindungsanfrage.
5. Überprüfen Sie, ob die Website-URL korrekt ist (Phishing-Schutz).
6. Klicken Sie auf "Connect" (Verbinden).
7. Ihre Wallet-Adresse erscheint nun auf der Seite.

**Was passiert ist:**

- GPUFlow kann nun Ihr USDC-Guthaben anzeigen.
- GPUFlow kann Transaktionen vorbereiten, die Sie signieren sollen.
- GPUFlow kann nicht ohne explizite Genehmigung auf Ihre Gelder zugreifen.

### Verständnis von Transaktionsgenehmigungen

Nach dem Verbinden werden Sie zwei Arten von Transaktionen begegnen:

**Typ 1: Token-Genehmigung (Approval)**

Bevor eine Plattform Ihr USDC verwenden kann, müssen Sie den Token für deren Smart Contract "genehmigen" (approve):

```

MetaMask-Popup zeigt:
"Give permission to access your USDC?" (Erlaubnis zum Zugriff auf Ihr USDC geben?)
Angefordert von: gpuflow.app
Für Vertrag: 0x7a3B...

```

**Was das bedeutet:**

- Sie erlauben dem spezifizierten Vertrag, USDC von Ihrer Wallet zu übertragen.
- Nur dieser spezifische Vertrag kann diese Erlaubnis nutzen.
- Sie können diese Erlaubnis später widerrufen.
- Es ist üblich, einen "unbegrenzten" Betrag zu genehmigen, um wiederholte Genehmigungen zu vermeiden.

**Typ 2: Transaktionsbestätigung**

Wenn Sie tatsächlich einzahlen, mieten oder abheben:

```

MetaMask-Popup zeigt:
"Confirm transaction" (Transaktion bestätigen)
Aktion: Deposit 50 USDC to escrow (50 USDC auf Treuhand einzahlen)
Gasgebühr: 0.02 MATIC (~$0.02)

```

**Was das bedeutet:**

- Sie autorisieren eine spezifische Aktion mit spezifischen Beträgen.
- Die angezeigte Gasgebühr wird von Ihrem MATIC-Guthaben abgezogen.
- Ein Klick auf "Confirm" führt die Transaktion auf der Blockchain aus.
- Die Transaktion ist irreversibel, sobald sie bestätigt ist.

### Best Practices für Sicherheit

**Vor dem Verbinden mit einer Seite:**

1. **URL überprüfen:** Achten Sie genau auf die Schreibweise (gpuflow.app vs. gpufl0w.app).
2. **Zertifikat prüfen:** Suchen Sie nach https:// und einem gültigen Zertifikat.
3. **Legitime Seiten als Lesezeichen speichern:** Vermeiden Sie das Suchen und Klicken auf Anzeigen.

**Beim Genehmigen von Transaktionen:**

1. **Lesen Sie, was Sie genehmigen:** Token-Menge, Empfängervertrag.
2. **Überprüfen Sie, ob die Gasgebühren angemessen sind:** Polygon-Transaktionen sollten unter 0,10 $ liegen.
3. **Netzwerk prüfen:** Bestätigen Sie, dass Sie im erwarteten Netzwerk sind (Polygon).
4. **Keine Eile:** Nehmen Sie sich Zeit, die Details zu verifizieren.

**Periodische Wartung:**

1. **Genehmigungen überprüfen:** Besuchen Sie revoke.cash, um alle Token-Genehmigungen zu sehen.
2. **Ungenutzte Genehmigungen widerrufen:** Entfernen Sie Berechtigungen für Plattformen, die Sie nicht mehr nutzen.
3. **Separate Wallets nutzen:** Erwägen Sie eine dedizierte Wallet für die GPU-Miete mit begrenzten Mitteln.

### Verbinden mit anderen Plattformen

**Vast.ai mit Kryptowährung:**

1. Erstellen Sie ein Vast.ai-Konto (E-Mail erforderlich).
2. Navigieren Sie zu Billing (Abrechnung).
3. Klicken Sie auf "Add Credit" (Guthaben hinzufügen) → "Cryptocurrency".
4. Wählen Sie den Krypto-Typ.
5. Schließen Sie die Zahlung über das CoinPayments-Gateway ab.
6. Keine direkte Wallet-Verbindung erforderlich (Zahlung per Gateway).

**RunPod mit Kryptowährung:**

1. Erstellen Sie ein RunPod-Konto.
2. Navigieren Sie zu Billing.
3. Klicken Sie auf "Add Funds" (Guthaben hinzufügen) → "Crypto".
4. Wählen Sie den Krypto-Typ.
5. Schließen Sie die Zahlung über Coinbase Commerce ab.
6. Keine direkte Wallet-Verbindung erforderlich.

**Hinweis:** Vast.ai und RunPod nutzen Zahlungs-Gateways anstelle einer direkten Wallet-Verbindung. Sie senden Krypto an eine bereitgestellte Adresse, anstatt Ihre Wallet mit deren Seite zu verbinden. Dies ist ein anderes Modell als die direkte Wallet-Integration von GPUFlow.

Für einen umfassenden Vergleich, wie verschiedene Plattformen Kryptowährungszahlungen handhaben, lesen Sie unseren [Vollständigen Leitfaden zur GPU-Miete mit Kryptowährung](/de/rent-gpu-with-crypto/).

### Was jede Berechtigung bedeutet

| Berechtigungsanfrage | Was sie erlaubt                                    | Risikostufe             |
| -------------------- | -------------------------------------------------- | ----------------------- |
| "Connect wallet"     | Ihre Adresse und Guthaben sehen                    | Sehr niedrig            |
| "Approve [token]"    | Vertrag kann genehmigten Token übertragen          | Niedrig-Mittel          |
| "Unlimited approval" | Vertrag kann beliebige Menge des Tokens übertragen | Mittel                  |
| "Sign message"       | Beweisen, dass Sie die Wallet besitzen             | Sehr niedrig            |
| "Send transaction"   | Spezifische Blockchain-Aktion ausführen            | Hängt von der Aktion ab |

**Warnsignale zum Ablehnen:**

- Genehmigungsanfragen für Token, die Sie nicht nutzen wollen.
- Transaktionsbeträge, die von Ihren Erwartungen abweichen.
- Gasgebühren, die drastisch höher sind als normal (falsches Netzwerk?).
- Anfragen nach der Seed Phrase (NIEMALS legitim).
- Signieren von Nachrichten für unbekannte Zwecke.

![Annotiertes MetaMask-Transaktionsgenehmigungs-Popup, das die zu überprüfenden Schlüsselelemente zeigt: Website-URL, Vertragsadresse, Token-Betrag, Gasgebühr und Schaltflächen zum Genehmigen/Ablehnen mit erklärenden Beschriftungen für jedes Element](../_images/metamask-transaction-approval-annotated.png)

---

## Fehlerbehebung häufiger Probleme

Selbst bei einfachen Einrichtungen können Probleme auftreten. Dieser Abschnitt behandelt die häufigsten Schwierigkeiten, mit denen neue Benutzer konfrontiert werden.

### Fehler "Transaktion fehlgeschlagen" (Transaction Failed)

**Symptom:** Die Transaktion zeigt in MetaMask nach dem Bestätigungsversuch den Status "Fehlgeschlagen" an.

**Häufige Ursachen und Lösungen:**

**Unzureichendes MATIC für Gas:**

- Die Fehlermeldung erwähnt oft "insufficient funds for gas".
- Sie haben USDC, aber kein MATIC.
- Lösung: Beschaffen Sie MATIC über einen Faucet oder eine Börsen-Auszahlung.

**Unzureichendes Token-Guthaben:**

- Sie versuchen, mehr USDC zu senden, als Sie besitzen.
- Denken Sie daran: Gasgebühren reduzieren das verfügbare MATIC, nicht USDC.
- Lösung: Reduzieren Sie den Transaktionsbetrag oder fügen Sie mehr Token hinzu.

**Slippage zu niedrig (bei Swaps):**

- Der Preis hat sich zwischen Angebot und Ausführung bewegt.
- Lösung: Erhöhen Sie die Slippage-Toleranz in den Swap-Einstellungen (1–3 % sind meist ausreichend).

**Nonce-Probleme:**

- Eine vorherige Transaktion steckt fest und blockiert nachfolgende Transaktionen.
- Lösung: Gehen Sie in den MetaMask-Einstellungen zu Erweitert (Advanced) → Konto zurücksetzen (Reset Account) (dies führt nicht zum Verlust von Geldern).

### Guthaben erscheint nicht

**Symptom:** Sie haben Gelder gesendet, aber die Wallet zeigt einen Saldo von Null an.

**Prüfen Sie dies in dieser Reihenfolge:**

**1. Ist das richtige Netzwerk ausgewählt?**

- Häufigstes Problem: Sie schauen auf Ethereum, während die Gelder auf Polygon liegen (oder umgekehrt).
- Klicken Sie auf das Netzwerk-Dropdown und wechseln Sie zum korrekten Netzwerk.
- Gleiche Adresse, verschiedene Netzwerke = verschiedene Guthaben.

**2. Ist die Transaktion tatsächlich abgeschlossen?**

- Überprüfen Sie die Senderseite (Börse, andere Wallet).
- Finden Sie den Transaktions-Hash.
- Suchen Sie im entsprechenden Block-Explorer:
  - Polygon: polygonscan.com
  - Ethereum: etherscan.io
- Bestätigen Sie, dass die Transaktion den Status "Success" (Erfolg) anzeigt.

**3. Muss der Token importiert werden?**

- Manche Token erscheinen nicht automatisch.
- Klicken Sie in MetaMask auf "Import tokens" (Token importieren).
- Fügen Sie die Token-Vertragsadresse ein:
  - USDC auf Polygon: `0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359`
- Der Token sollte nach dem Import erscheinen.

**4. An das falsche Netzwerk gesendet?**

- Auf Ethereum gesendet, aber auf Polygon erwartet?
- Die Gelder sind nicht verloren – sie befinden sich nur auf einem anderen Netzwerk.
- Wechseln Sie MetaMask zu dem Netzwerk, auf dem Sie tatsächlich gesendet haben.
- Nutzen Sie eine Bridge, um die Gelder bei Bedarf auf das beabsichtigte Netzwerk zu übertragen.

### Verbindungsprobleme mit MetaMask

**Symptom:** Die Website verbindet sich nicht mit MetaMask oder die Verbindung bricht ab.

**Lösungen:**

**Aktualisieren und erneut versuchen:**

- Aktualisieren Sie die Webseite.
- Klicken Sie erneut auf "Connect Wallet".
- Genehmigen Sie die Verbindung im MetaMask-Popup.

**Prüfen, ob MetaMask entsperrt ist:**

- Klicken Sie auf das MetaMask-Symbol.
- Geben Sie das Passwort ein, falls es gesperrt ist.
- Versuchen Sie die Verbindung erneut.

**Deaktivieren kollidierender Erweiterungen:**

- Andere Wallet-Erweiterungen können stören.
- Deaktivieren Sie vorübergehend Phantom, Coinbase Wallet usw.
- Versuchen Sie die Verbindung erneut, wenn nur MetaMask aktiv ist.

**Anderen Browser versuchen:**

- Es gibt browserspezifische Probleme.
- Versuchen Sie Chrome, Firefox oder Brave.
- Installieren Sie die MetaMask-Erweiterung neu, wenn das Problem weiterhin besteht.

**MetaMask-Verbindung löschen:**

- In MetaMask: Einstellungen → Verbindungen (Connections).
- Suchen Sie die problematische Seite.
- Klicken Sie auf "Disconnect" (Trennen).
- Verbinden Sie sich neu.

### Fehler "Falsches Netzwerk" (Wrong Network)

**Symptom:** Die Seite zeigt "Wrong network" oder "Please switch to Polygon".

**Lösung:**

1. Klicken Sie auf das Netzwerk-Dropdown in MetaMask.
2. Wählen Sie "Polygon Mainnet".
3. Falls Polygon nicht gelistet ist, fügen Sie es hinzu (siehe vorheriger Abschnitt).
4. Aktualisieren Sie die Webseite.
5. Verbinden Sie die Wallet bei Bedarf neu.

**Die meisten GPU-Plattformen zeigen eine Aufforderung**, das Netzwerk automatisch zu wechseln. Klicken Sie im MetaMask-Popup auf "Switch Network", wenn Sie dazu aufgefordert werden.

### Gas-Schätzung fehlgeschlagen (Gas Estimation Failed)

**Symptom:** MetaMask zeigt "Gas estimation failed", wenn Sie versuchen, eine Transaktion durchzuführen.

**Häufige Ursachen:**

**Vertrag lehnt Transaktion ab:**

- Unzureichendes Token-Guthaben für die Operation.
- Versuch, mit einem inkompatiblen Vertrag zu interagieren.
- Plattform-Wartung oder Probleme.

**Netzwerküberlastung:**

- Selten auf Polygon, aber möglich.
- Warten Sie einige Minuten und versuchen Sie es erneut.

**Lösungsansatz:**

1. Verifizieren Sie, dass Sie über genügend Guthaben für die beabsichtigte Aktion verfügen.
2. Verifizieren Sie, dass Sie im korrekten Netzwerk sind.
3. Versuchen Sie einen kleineren Transaktionsbetrag.
4. Prüfen Sie den Plattform-Status (Discord, Twitter) auf bekannte Probleme.
5. Versuchen Sie es später erneut, wenn eine Netzwerküberlastung vermutet wird.

### Hängende "Pending"-Transaktion

**Symptom:** Die Transaktion zeigt den Status "Pending" (Ausstehend) für längere Zeit (mehr als 5 Minuten auf Polygon).

**Normale Wartezeiten:**

- Polygon: 5–30 Sekunden.
- Ethereum: 30 Sekunden – 5 Minuten.
- Längere Zeiten deuten auf ein Problem hin.

**Lösungen:**

**Transaktion beschleunigen:**

1. Klicken Sie auf die ausstehende Transaktion in MetaMask.
2. Klicken Sie auf "Speed Up" (Beschleunigen).
3. Erhöhen Sie den Gaspreis.
4. Bestätigen Sie die neue Transaktion.
5. Das höhere Gas ersetzt die hängende Transaktion.

**Transaktion abbrechen:**

1. Klicken Sie auf die ausstehende Transaktion.
2. Klicken Sie auf "Cancel" (Abbrechen).
3. Bestätigen Sie den Abbruch (kostet Gas).
4. Die ursprüngliche Transaktion wird verworfen.

**Letzter Ausweg – Konto zurücksetzen:**

1. MetaMask Einstellungen → Erweitert (Advanced).
2. Klicken Sie auf "Reset Account" (Konto zurücksetzen).
3. Löscht den Transaktionsverlauf und die Nonce.
4. Beeinflusst **NICHT** die Guthaben.
5. Versuchen Sie die ursprüngliche Transaktion erneut.

### Wiederherstellungsszenarien

**Passwort vergessen (aber Seed Phrase vorhanden):**

1. Deinstallieren Sie MetaMask.
2. Installieren Sie MetaMask neu.
3. Wählen Sie "Import using Secret Recovery Phrase" (Mit geheimer Wiederherstellungsphrase importieren).
4. Geben Sie Ihre 12 Wörter ein.
5. Erstellen Sie ein neues Passwort.
6. Wallet ist mit allen Geldern wiederhergestellt.

**Seed Phrase verloren (aber Zugriff auf MetaMask vorhanden):**

1. Öffnen Sie MetaMask, solange Sie noch Zugriff haben.
2. Einstellungen → Sicherheit & Datenschutz.
3. Klicken Sie auf "Reveal Secret Recovery Phrase" (Geheime Wiederherstellungsphrase anzeigen).
4. Geben Sie das Passwort ein.
5. Schreiben Sie die Seed Phrase diesmal ordnungsgemäß auf.
6. Sicher verwahren.

**Sowohl Passwort als auch Seed Phrase verloren:**

- Gelder sind unwiederbringlich verloren.
- Keine Wiederherstellung möglich.
- Kein Support-Team kann helfen.
- Deshalb ist das Backup der Seed Phrase so entscheidend.

![Entscheidungs-Flussdiagramm zur MetaMask-Fehlerbehebung mit verzweigten Pfaden: Fehlgeschlagene Transaktion führt zu Gas-Prüfung dann Guthaben-Prüfung, fehlende Gelder führen zu Netzwerk-Prüfung dann Transaktionsverifizierung, Verbindungsprobleme führen zu Aktualisierung dann Erweiterungs-Prüfung, mit Lösungen an jedem Endpunkt](../_images/metamask-troubleshooting-decision-flowchart.png)

---

## Fazit: Bereit zum Mieten

Sie haben nun alles, was für die kryptowährungsbasierte GPU-Miete erforderlich ist:

- ✅ MetaMask-Wallet installiert und gesichert
- ✅ Polygon-Netzwerk für niedrige Gebühren konfiguriert
- ✅ USDC-Guthaben für stabile GPU-Mietzahlungen
- ✅ MATIC verfügbar für Transaktionsgasgebühren
- ✅ Verständnis von Wallet-Verbindungen und Berechtigungen

### Schnellreferenz-Checkliste

Bevor Sie Ihre erste GPU mieten, bestätigen Sie folgendes:

**Wallet-Einrichtung:**

- [ ] MetaMask von der offiziellen Quelle (metamask.io) installiert
- [ ] Seed Phrase auf Papier notiert und sicher verwahrt
- [ ] Passwort für lokalen Zugriff erstellt

**Netzwerk-Konfiguration:**

- [ ] Polygon Mainnet zu MetaMask hinzugefügt
- [ ] Kann zwischen Ethereum- und Polygon-Netzwerken wechseln

**Finanzierung:**

- [ ] USDC-Guthaben auf Polygon (korrektes Netzwerk prüfen)
- [ ] MATIC-Guthaben für Gasgebühren (mindestens 0,1 MATIC)

**Sicherheit:**

- [ ] Seed Phrase offline gespeichert, niemals digital
- [ ] Lesezeichen für legitime Plattform-URLs gesetzt
- [ ] Unterschied zwischen Genehmigung (Approval) und Transaktionsbestätigung verstanden

### Was als Nächstes kommt

Mit einer bereiten Wallet ist der GPU-Mietprozess selbst schnell:

1. **Verbinden:** Besuchen Sie gpuflow.app, verbinden Sie MetaMask.
2. **Einzahlen:** Überweisen Sie USDC auf das Plattform-Treuhandkonto.
3. **Auswählen:** Wählen Sie die GPU, die Ihren Anforderungen entspricht.
4. **Mieten:** Bestätigen Sie die Miete, erhalten Sie die Zugangsdaten.
5. **Arbeiten:** Greifen Sie via SSH oder Web-Terminal auf die GPU zu.
6. **Abschließen:** Beenden Sie die Miete, ungenutzte Gelder werden automatisch zurückgebucht.

**Gesamtzeit von Wallet-Bereitschaft bis GPU-Zugriff: Unter 2 Minuten**

Für den kompletten Durchgang der GPU-Miete, einschließlich Plattformauswahl, Treuhandmechanik und Kostenoptimierung, lesen Sie unseren [Vollständigen Leitfaden zur GPU-Miete mit Kryptowährung](/de/rent-gpu-with-crypto/).

### Häufige Anfängerfehler, die Sie vermeiden sollten

**Nicht tun:**

- Seed Phrase digital speichern (Screenshots, Cloud, Notiz-App).
- Gelder senden, ohne zu prüfen, ob das Netzwerk übereinstimmt.
- Transaktionen genehmigen, ohne die Details zu lesen.
- Große Guthaben auf einer einzelnen Plattform halten.
- Gasgebühren-Anforderungen ignorieren (Sie brauchen MATIC, nicht nur USDC).

**Tun:**

- Starten Sie mit kleinen Test-Transaktionen.
- Verifizieren Sie Website-URLs vor dem Verbinden.
- Halten Sie ein bescheidenes MATIC-Guthaben für Gas bereit.
- Speichern Sie legitime Plattform-Seiten als Lesezeichen.
- Treten Sie dem Plattform-Discord für Community-Support bei.

### Geschätzte Gesamtkosten der Einrichtung

| Posten                       | Kosten                                  |
| ---------------------------- | --------------------------------------- |
| MetaMask-Installation        | Kostenlos                               |
| Polygon-Netzwerk-Einrichtung | Kostenlos                               |
| USDC für GPU-Miete           | Ihre Wahl (20–100 $ typischer Start)    |
| MATIC für Gas                | 0,50–2,00 $ (oder kostenlos via Faucet) |
| Börsen-Auszahlungsgebühr     | 0,10–0,50 $                             |
| **Summe für den Start**      | **~1–3 $ an Gebühren + Ihr GPU-Budget** |

Vergleichen Sie dies mit den Einrichtungskosten traditioneller Cloud-Anbieter von 0 $ Direktgebühren, aber Stunden an Verifizierungszeit und dauerhaft höheren Plattformgebühren.

### Verwandte Ressourcen

**Von dieser Seite:**

- [Vollständiger Leitfaden zur GPU-Miete mit Kryptowährung](/de/rent-gpu-with-crypto/) — Kompletter Mietdurchgang von der Plattformauswahl bis zum Abschluss.
- [Wie man GPUs ohne KYC oder Identitätsprüfung mietet](/de/how-to-rent-gpu-without-kyc/) — Datenschutzorientierte GPU-Mietoptionen.
- [Versteckte Gebühren bei der GPU-Miete: Wie Krypto internationalen Nutzern Geld spart](/de/hidden-fees-in-gpu-rental/) — Kostenanalyse für internationale Nutzer.

**Externe Ressourcen:**

- [MetaMask Support](https://support.metamask.io) — Offizielle Dokumentation und Fehlerbehebung.
- [Polygon Dokumentation](https://wiki.polygon.technology) — Technische Details des Netzwerks.
- [Polygonscan](https://polygonscan.com) — Block-Explorer zur Transaktionsverifizierung.

![Checkliste zum Abschluss der Einrichtung mit vier abgehakten Phasen: MetaMask installiert, Polygon konfiguriert, Wallet mit USDC gefüllt, MATIC für Gas erworben, gefolgt von einem Pfeil, der auf "Bereit für GPU-Miete" mit dem GPUFlow-Logo zeigt](../_images/metamask-polygon-setup-complete-checklist.png)

---

## Häufig gestellte Fragen (FAQ)

### Warum benötige ich MetaMask für die GPU-Miete?

MetaMask ist eine Kryptowährungs-Wallet, die Ihre Gelder speichert und Ihnen die Interaktion mit Blockchain-basierten Plattformen ermöglicht. GPU-Mietplattformen, die Zahlungen in Kryptowährung nutzen, benötigen eine Wallet, um Ihr Guthaben zu verwahren und Transaktionen zu genehmigen. Wenn Sie auf Plattformen wie GPUFlow eine GPU mieten, geht Ihre Zahlung in ein Smart-Contract-Treuhandkonto (Escrow) – MetaMask ist das Werkzeug, mit dem Sie diese Einzahlung autorisieren und später nicht genutzte Gelder zurückerhalten. MetaMask wird empfohlen, da es die kompatibelste Wallet ist und mit fast allen Plattformen funktioniert. Sie wird als Browser-Erweiterung installiert, die Einrichtung dauert etwa 5 Minuten und die Nutzung ist kostenlos.

### Warum Polygon statt Ethereum für die GPU-Miete nutzen?

Polygon bietet drastisch niedrigere Transaktionsgebühren – 0,001–0,05 $ pro Transaktion im Vergleich zu 1–10 $ oder mehr bei Ethereum. Bei der GPU-Miete, wo Sie Gelder einzahlen, eine Miete starten, eine Miete beenden und das Restguthaben abheben (mindestens vier Transaktionen), könnten die Ethereum-Gasgebühren die Kosten für kurze GPU-Mieten leicht übersteigen. Eine 2-Stunden-Miete für 1,20 $ auf einer RTX 4090 würde 10–20 $ an Ethereum-Gasgebühren erfordern, was wirtschaftlich irrational wäre. Derselbe Workflow auf Polygon kostet insgesamt unter 0,10 $ an Gebühren. GPU-Plattformen wie GPUFlow nutzen Polygon gezielt, weil niedrige Gebühren kleine und mittlere Transaktionen praktikabel machen.

### Was ist eine Seed Phrase und warum ist sie so wichtig?

Eine Seed Phrase (auch Wiederherstellungsphrase oder Secret Recovery Phrase genannt) ist eine Sequenz aus 12 oder 24 Wörtern, die vollständigen Zugriff auf Ihre Kryptowährungs-Wallet gewährt. Diese Wörter leiten in ihrer exakten Reihenfolge Ihre privaten Schlüssel mathematisch ab. Jeder, der diese Wörter besitzt, kann von jedem Gerät überall auf der Welt auf alle Gelder in der Wallet zugreifen. Es gibt kein Zurücksetzen des Passworts, keine Identitätsprüfung und kein Support-Team, das helfen kann, wenn Sie Ihre Seed Phrase verlieren – sie ist der einzige Weg, eine Wallet wiederherzustellen, wenn Ihr Gerät ausfällt. Sie müssen sie auf Papier aufschreiben, niemals digital speichern und an einem sicheren physischen Ort aufbewahren. Der Verlust der Seed Phrase bei gleichzeitigem Geräteausfall bedeutet den permanenten, unwiederbringlichen Verlust aller Gelder.

### Wie viel MATIC benötige ich für Gasgebühren?

Sehr wenig. Polygon-Transaktionsgebühren betragen ca. 0,001–0,05 $ pro Transaktion, sodass 0,50–2,00 $ in MATIC (ungefähr 0,5–2 MATIC zu aktuellen Preisen) genug Gas für 50–200 oder mehr Transaktionen bieten. Dies deckt Monate typischer GPU-Mietnutzung ab, einschließlich Einzahlungen, Mieten und Auszahlungen. Sie benötigen MATIC speziell für Gas, selbst wenn Sie die GPU-Miete in USDC bezahlen, da Blockchain-Transaktionsgebühren in der nativen Währung des Netzwerks beglichen werden müssen. Wenn Sie gerade erst anfangen, reicht es aus, 0,5 MATIC von einem Faucet (kostenlos) für die ersten Transaktionen zu erhalten; Sie können später bei Bedarf mehr erwerben.

### Kann ich eine andere Wallet als MetaMask verwenden?

Ja. Alternativen sind Rainbow (exzellente mobile Erfahrung), Coinbase Wallet (bequem für Coinbase-Nutzer), Rabby (entwicklerfreundliche Funktionen), Trust Wallet (fokussiert auf Mobilgeräte) und Hardware-Wallets wie Ledger mit Browser-Erweiterungs-Integration. GPU-Mietplattformen unterstützen in der Regel jede Wallet, die mit dem WalletConnect-Protokoll oder direkten Ethereum-kompatiblen Browser-Erweiterungen kompatibel ist. MetaMask wird Anfängern empfohlen aufgrund der umfangreichen Dokumentation, der breitesten Kompatibilität über Plattformen hinweg, der größten Nutzergemeinschaft für Fehlerbehebung und der längsten Erfolgsbilanz. Sobald Sie sich mit Kryptowährung wohlfühlen, können Sie Alternativen erkunden, die besser zu Ihren Vorlieben passen.

### Was passiert, wenn ich Gelder an das falsche Netzwerk sende?

Gelder, die an das falsche Netzwerk gesendet wurden, sind nicht verloren – sie befinden sich nur auf einem anderen Netzwerk als erwartet. Ihre Wallet-Adresse ist auf Ethereum und Polygon identisch, sodass Gelder, die an Ihre Adresse auf einem der beiden Netzwerke gesendet werden, Ihnen gehören. Wenn Sie USDC auf Ethereum gesendet haben, es aber auf Polygon erwartet haben: Wechseln Sie MetaMask zum Ethereum Mainnet, und Sie werden die Gelder dort sehen. Um sie auf Polygon zu verschieben, nutzen Sie eine Bridge (portal.polygon.technology), was Ethereum-Gasgebühren kostet (5–15 $). Der Fehler kostet zusätzliche Gebühren und Zeit, führt aber nicht zum Verlust der Gelder. Verifizieren Sie immer das ausgewählte Netzwerk, bevor Sie eine Sende-Transaktion bestätigen.

### Woher weiß ich, ob es sicher ist, meine Wallet mit einer Website zu verbinden?

Verifizieren Sie die Sicherheit durch mehrere Prüfungen. Erstens: Bestätigen Sie, dass die URL korrekt geschrieben ist – Phishing-Seiten nutzen ähnlich aussehende Domains (gpufl0w.app statt gpuflow.app). Zweitens: Prüfen Sie auf HTTPS und ein gültiges Sicherheitszertifikat. Drittens: Speichern Sie legitime Seiten als Lesezeichen und nutzen Sie diese, anstatt jedes Mal zu suchen. Viertens: Recherchieren Sie die Plattform über Community-Kanäle (Discord, Reddit, Twitter) vor dem Verbinden. Wenn das Verbindungs-Popup erscheint, zeigt MetaMask die anfordernde Website an – verifizieren Sie, dass dies Ihren Erwartungen entspricht. Denken Sie daran, dass die Wallet-Verbindung nur Ihre Adresse und Guthaben offenlegt; tatsächliche Geldtransfers erfordern eine separate Genehmigung. Starten Sie mit kleinen Beträgen auf neuen Plattformen, bis Sie die Legitimität durch erfolgreiche Transaktionen verifiziert haben.

### Was bedeutet das "Genehmigen" (Approving) eines Tokens?

Die Token-Genehmigung erteilt einem spezifischen Smart Contract die Erlaubnis, einen spezifischen Token von Ihrer Wallet zu übertragen. Dies ist getrennt vom eigentlichen Geldtransfer. Wenn Sie USDC auf eine GPU-Mietplattform einzahlen, finden zwei Transaktionen statt: Erstens genehmigen Sie dem Treuhandvertrag der Plattform den Zugriff auf Ihr USDC; zweitens bestätigen Sie die eigentliche Einzahlung. Die Genehmigung ist erforderlich aufgrund der Funktionsweise von Blockchain-Token – Verträge können keine Token von Ihrer Wallet ohne explizite Erlaubnis abziehen. Sie können einen begrenzten Betrag (muss nach Aufbrauch erneut genehmigt werden) oder einen unbegrenzten Betrag (bequem, erfordert aber Vertrauen in den Vertrag) genehmigen. Genehmigungen können jederzeit auf Seiten wie revoke.cash überprüft und widerrufen werden.

### Warum ist meine Transaktion fehlgeschlagen?

Transaktionsfehler haben mehrere häufige Ursachen. Unzureichendes MATIC für Gas ist am häufigsten – Sie benötigen MATIC, um Gebühren zu zahlen, auch wenn Sie in USDC handeln. Unzureichendes Token-Guthaben (Versuch, mehr zu senden, als Sie haben) verursacht ebenfalls Fehler. Die inkorrekte Interaktion mit einem Vertrag (falsches Netzwerk, inkompatible Parameter) löst Fehler aus. Netzwerküberlastung verursacht gelegentlich Probleme, obwohl dies auf Polygon selten ist. Die Fehlermeldung in MetaMask gibt meist einen Hinweis auf die Ursache. Prüfen Sie zuerst das MATIC-Guthaben (häufigstes Problem für neue Benutzer), verifizieren Sie dann, dass Sie im richtigen Netzwerk sind, und versuchen Sie dann, den Transaktionsbetrag zu reduzieren.

### Kann ich meine Wallet wiederherstellen, wenn ich mein Passwort verliere?

Ja, wenn Sie Ihre Seed Phrase haben. Der Verlust Ihres MetaMask-Passworts bedeutet, dass Sie auf diesem spezifischen Gerät nicht auf die Wallet zugreifen können, aber die Seed Phrase ermöglicht eine vollständige Wiederherstellung. Deinstallieren Sie MetaMask, installieren Sie es neu, wählen Sie "Import using Secret Recovery Phrase", geben Sie Ihre 12 Wörter ein und erstellen Sie ein neues Passwort. Ihre Wallet – einschließlich aller Guthaben – ist vollständig wiederhergestellt. Wenn Sie jedoch sowohl Ihr Passwort als auch Ihre Seed Phrase verlieren, ist eine Wiederherstellung unmöglich. Kein Unternehmen, Support-Team oder technischer Prozess kann eine Wallet ohne die Seed Phrase wiederherstellen. Deshalb ist das sichere Backup der Seed Phrase absolut kritisch, bevor Sie Gelder zu Ihrer Wallet hinzufügen.

### Wie lange dauern Transaktionen auf Polygon?

Polygon-Transaktionen werden unter normalen Bedingungen typischerweise in 2–5 Sekunden bestätigt. Sie sehen die Transaktion kurz als "pending" in MetaMask, dann wechselt sie zu "confirmed". Gelegentlich kann die Bestätigung bei hoher Netzwerkauslastung 15–30 Sekunden dauern. Wenn eine Transaktion länger als 5 Minuten aussteht, stimmt wahrscheinlich etwas nicht – unzureichender Gaspreis, Netzwerkprobleme oder Nonce-Probleme. Sie können hängende Transaktionen in MetaMask "beschleunigen" (Speed Up), indem Sie auf die ausstehende Transaktion klicken und "Speed Up" wählen, was sie mit höherem Gas erneut einreicht. Im Vergleich zum Ethereum Mainnet (30 Sekunden bis mehrere Minuten) und Bitcoin (10–60 Minuten) ist die Geschwindigkeit von Polygon für praktische Zwecke im Wesentlichen sofort.

---

**Bereit, Ihre Wallet einzurichten?** Beginnen Sie mit dem Download von MetaMask von [metamask.io](https://metamask.io) und folgen Sie dann den Schritten in diesem Leitfaden. In fünfzehn Minuten sind Sie bereit, Ihre erste GPU mit Kryptowährung auf [GPUFlow](https://gpuflow.app/de) zu mieten – ohne Identitätsprüfung, ohne langwierige Kontoeinrichtung und ohne Kreditkarte.
