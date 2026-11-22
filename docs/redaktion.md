---
description: Anleitung für die Redaktion ohne Technik: Artikel, Ausgaben, Events, Newsletter, Formulare im Payload-Admin
aktualisiert: 2026-11-22
---

# Anleitung für die Redaktion

Der Admin liegt unter `/admin`. Zugang legt nur der Admin an.

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

## Newsletter

1. **Newsletter → Neu**: Titel, Betreff, Vorschautext, Einleitung, Text (z. B. Gastbeitrag) und empfohlene Artikel eintragen. Zielgruppe wählen: monatlicher Newsletter oder Event-Einladungen.
2. Speichern, dann rechts **Testversand an mich**. Die Mail kommt an die eigene Adresse, mit „[TEST]“ im Betreff. Das dürfen auch Editors.
3. **Senden** (nur Admin und Editorial Board): Der Dialog zeigt die Anzahl der Empfänger. Nach dem Bestätigen geht der Versand sofort los und läuft von selbst weiter, auch wenn man die Seite schliesst.
4. Statt sofort zu senden, lässt sich unter „Versand“ ein **geplanter Versand** (Tag) eintragen. Er startet am Morgen dieses Tages.
5. Im Archiv auf der Website erscheint der Newsletter standardmässig **30 Tage** nach dem Versand (einstellbar unter „Archiv“, 0 = sofort, oder ganz ausblenden).

Abonnenten melden sich selbst an und bestätigen per Mail. Abgemeldete bleiben in der Liste (Status „Abgemeldet“), damit sie nicht wieder angeschrieben werden. Die Liste sehen nur Admin und Editorial Board, Export über **Exportieren** in der Liste.

## Formulare und Bewerbungen

- **Formulare → Neu** (Admin und Editorial Board): Felder zusammenklicken. Für Lebensläufe den Feldtyp **Upload** wählen, Collection `application-files`, erlaubter Typ `application/pdf`, max. Grösse 4194304 (4 MB).
- Unter **E-Mails** pro Formular eine Bestätigung an den Absender (`{{email}}` als Empfänger) und eine Benachrichtigung an die Redaktion eintragen.
- **Bewerbung auf ein Event:** Im Event unter „Bewerbung“ das Formular wählen und „Bewerbung ab“ und „Bewerbungsschluss“ setzen. Ausserhalb dieser Zeit zeigt die Eventseite „Bewerbung geschlossen“.
- **Einsendungen** sehen nur Admin und Editorial Board. In der Liste nach Event filtern, über **Exportieren** als CSV herunterladen. Lebensläufe öffnen sich nur für eingeloggte Admins und Board-Mitglieder.
- Einsendungen und Lebensläufe werden **6 Monate nach dem Event** automatisch gelöscht (pro Formular unter „Aufbewahrung“ änderbar). Vorher exportieren, wenn etwas länger gebraucht wird.
