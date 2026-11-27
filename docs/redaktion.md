---
description: Anleitung für die Redaktion ohne Technik: Artikel, Ausgaben, Events, Newsletter, Formulare im Payload-Admin
aktualisiert: 2026-11-27
---

# Anleitung für die Redaktion

Der Admin liegt unter `/admin`, mit SGBR-Logo auf der Anmeldeseite und im Menü (`src/components/admin/AdminGraphics.tsx`). Zugang legt nur der Admin an.

## Rollen

| Rolle | Darf |
| --- | --- |
| Admin | alles |
| Editorial Board | Inhalte veröffentlichen und löschen, Newsletter senden, Formulare bauen, Einsendungen sehen |
| Editors | Entwürfe schreiben und ändern, Newsletter-Testversand |
| Advisory Board | nur lesen |

Details: [rollen.md](rollen.md).

## Vorschau

- Im Artikel, bei Ausgaben, Events, Personen und Seiten gibt es oben den Reiter **Live-Vorschau**: Die Seite erscheint neben dem Editor und aktualisiert sich beim Speichern. Sprache oben rechts wählen.
- Wer im Admin angemeldet ist, sieht auf der Website oben eine dunkelblaue Leiste mit **Bearbeiten**.

## Sprachen

- Jeden Artikel nur in seiner **Originalsprache** eintragen: oben rechts im Admin die Sprache wählen, dann schreiben, und das Feld „Originalsprache“ setzen.
- In der anderen Sprache zeigt die Website das Original mit dem Hinweis „nur auf Englisch/Deutsch verfügbar“.

## Bilder

- **Artikelbild:** erscheint im Artikel, auf der Startseite und auf allen Karten.
- **Bild für die Ausgabenseite:** optional, freigestelltes Porträt, nur auf der Seite der Ausgabe.
- Immer einen Alternativtext eintragen (kurz beschreiben, was zu sehen ist).

## Ausgaben-PDFs

Druck-PDFs einer Ausgabe haben oft 50–140 MB. Der Speicher (Cloudflare R2, 10 GB gratis) hätte Platz, aber Leserinnen und Leser laden das ganze PDF. Wer die Datei kleiner will, kann sie vor dem Hochladen für den Bildschirm verkleinern (Text bleibt scharf, Fotos 150 dpi, meist 70–85 % kleiner):

```bash
npm run pdf:compress -- Ausgabe-2026.pdf   # schreibt Ausgabe-2026-web.pdf
```

Braucht Ghostscript (macOS: `brew install ghostscript`). Im Admin dann die `-web.pdf` hochladen. Automatisch beim Upload geht das nicht: Der Upload läuft direkt vom Browser in den Speicher, und Vercel hat kein Ghostscript.

## Newsletter

1. **Newsletter → Neu**: Titel, Betreff, Vorschautext, Einleitung, Text und weitere Artikel eintragen. Zielgruppe wählen: monatlicher Newsletter oder Event-Einladungen.
   - **Einleitung:** Leerzeile = neuer Absatz; „Caspar Moebius“ und „Editor-in-Chief“ in zwei Zeilen ohne Leerzeile dazwischen.
   - **Text:** Rubriken („GUEST COMMENTARY“) als Überschrift. Über **+** oder **/** zwei Blöcke: **Abschnitt mit Bild** (Porträt oder Logo links neben dem Text, Gruppenfoto gross darüber; Titel fett, Unterzeile kursiv, Link als Textlink oder Button) und **Artikel** (ein Artikel der Website genau an dieser Stelle, Bild und Text kommen aus dem Artikel, lassen sich aber ersetzen).
   - **Weitere Artikel** erscheinen am Ende unter „In this edition“. Für einen Artikel mitten im Newsletter den Block „Artikel“ nehmen.
   - **Gastkommentar:** als normaler Artikel mit Art „Gastbeitrag“ anlegen und den Autor als Person verknüpfen; im Newsletter dann mit dem Block „Artikel“ oder „Abschnitt mit Bild“ verlinken.
2. Speichern, dann rechts **Testversand an mich**. Die Mail kommt an die eigene Adresse, mit „[TEST]“ im Betreff. Das dürfen auch Editors.
3. **Senden** (nur Admin und Editorial Board): Der Dialog zeigt die höchstmögliche Zahl der Empfänger. Nach dem Bestätigen übergibt die Website den Newsletter an Resend (ein Broadcast pro Sprache), Resend verschickt ihn. Zustellung, Öffnungen und Klicks stehen in Resend unter Broadcasts.
4. Statt sofort zu senden, lässt sich unter „Versand“ ein **geplanter Versand** (Tag) eintragen. Er geht am Morgen dieses Tages raus. Schlägt ein Versand fehl, steht der Grund unter „Versand → Resend“; **Erneut senden** schickt nur, was noch fehlt.
5. Im Archiv auf der Website erscheint der Newsletter standardmässig **30 Tage** nach dem Versand (einstellbar unter „Archiv“, 0 = sofort, oder ganz ausblenden).

Abonnenten melden sich selbst an und bestätigen per Mail. Die Liste liegt in **Resend** (Audience → Contacts), nicht im Admin; Zugang haben Admin und Editorial Board mit eigenem Resend-Login. Abgemeldete bleiben dort als „Unsubscribed“ und bekommen nichts mehr. Export als CSV in Resend.

## Speaker Events: Rückblick

Nach einem Event im Reiter **Nach dem Event**: Titel, Einleitung und **Kapitel** (je Foto, Überschrift, Text). Die Kapitel erscheinen auf der Eventseite als Slideshow mit Pfeilen. „Weitere Fotos“ erscheinen darunter als Raster.

## Personen: Kurzbiografien

Steht auf `/en` keine englische Kurzbiografie, zeigt die Seite die deutsche. Die fehlenden englischen wurden am 2026-11-27 aus dem Deutschen übersetzt und sind mit **Übersetzung der Kurzbiografie prüfen** markiert (Personen → Filter). Nach dem Prüfen abhaken.

## Formulare und Bewerbungen

- **Formulare → Neu** (Admin und Editorial Board): Felder zusammenklicken. Für Lebensläufe den Feldtyp **Upload** wählen, Collection `application-files`, erlaubter Typ `application/pdf`, max. Grösse 4194304 (4 MB).
- Unter **E-Mails** pro Formular eine Bestätigung an den Absender (`{{email}}` als Empfänger) und eine Benachrichtigung an die Redaktion eintragen.
- **Bewerbung auf ein Event:** Im Event unter „Bewerbung“ das Formular wählen und „Bewerbung ab“ und „Bewerbungsschluss“ setzen. Ausserhalb dieser Zeit zeigt die Eventseite „Bewerbung geschlossen“. Unter **„Bewerbung für“** wählen: **Dinner** (Standard: Der Talk ist offen, beworben wird nur fürs Dinner danach) oder **Talk** (ohne Zusage keine Teilnahme). Davon hängen Button („Fürs Dinner bewerben“ / „Für den Talk bewerben“) und Hinweistext ab. Das Formular öffnet sich als Pop-up. Zum Teilen (Instagram, Mail) direkt auf `…/events/{slug}#apply-form` verlinken, dann ist das Formular sofort offen.
- **Einsendungen** sehen nur Admin und Editorial Board. In der Liste nach Event filtern, über **Exportieren** als CSV herunterladen. Lebensläufe öffnen sich nur für eingeloggte Admins und Board-Mitglieder.
- Einsendungen und Lebensläufe werden **6 Monate nach dem Event** automatisch gelöscht (pro Formular unter „Aufbewahrung“ änderbar). Vorher exportieren, wenn etwas länger gebraucht wird.

## SEO

- Artikel, Seiten, Ausgaben und Events haben einen eigenen Reiter **SEO**: Titel und Beschreibung für Google und Social Media, Vorschau des Suchergebnisses. Leer lassen geht: Dann nimmt die Website Titel und Kurzzusammenfassung.
- Slug, Status und Erscheinungsdatum stehen rechts in der Seitenleiste.

## Seiten gestalten

- Seiten (About, Kontakt …) bestehen aus Blöcken. Beim Block **Bild und Text** gibt es die Position „volle Breite, Text darunter“, z. B. für das Teamfoto.

## Mail-Vorschau

- **Mail-Vorschau (nur lokal)** gibt es nur auf dem Entwicklungsrechner und nur für Admins: als Karte „Werkzeuge“ unten im Dashboard und als letzter Punkt im Menü. Dort werden Mails nicht verschickt, sondern hier angezeigt. Auf der echten Website gibt es sie nicht.

## Mail-Vorlage

- Alle Mails der Website haben dieselbe Vorlage im SGBR-Stil (`src/emails/layout.ts`): Logo oben, schwarze Linie, Text, dunkler Fuss mit Adresse aus den Website-Einstellungen. Eckig, Navy, Überschriften in Serif, immer hell.
- **Newsletter:** nur Titel, Einleitung, Text und ausgewählte Artikel ausfüllen, die Gestaltung kommt von der Vorlage. Mit **Testversand** prüfen.
- **Formular-Mails** (Bestätigung an Bewerbende, Benachrichtigung an die Redaktion): Text im Formular unter „E-Mails“ schreiben, er wird automatisch in die Vorlage gesetzt (`src/lib/forms/formEmail.ts`).
- Mails laden keine Web-Schriften (keine Anfragen an Schriftdienste aus dem Postfach); ohne installierte Source Serif 4 und Inter erscheinen Georgia und Helvetica.
