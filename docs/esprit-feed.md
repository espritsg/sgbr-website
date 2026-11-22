---
description: Spec der JSON-Feeds für espritsg.ch: gleiche URLs und exakt gleiches Format wie heute, damit das Plugin ESPRIT – SGBR Connect 1.0.1 unverändert weiterläuft
aktualisiert: 2026-11-22
---

# Feeds für espritsg.ch

Entschieden 2026-11-22: Die neue Seite liefert **dieselben URLs mit exakt demselben JSON** wie heute. Das Plugin „ESPRIT – SGBR Connect“ 1.0.1 auf espritsg.ch bleibt unverändert.

## Wie das Plugin heute arbeitet

- Liest serverseitig zwei Feeds, cacht 15 Minuten, bei Fehlern 90 Sekunden, zeigt bei Störung bis 7 Tage die letzten Daten.
- Kein Abruf aus dem Browser, also kein CORS nötig. Bilder lädt der Browser direkt von SGBR.
- Wählt Events nach dem Feld `status` (upcoming/past), Ausgaben nach `kind` und `year`.
- Prüft Links (Linkvalidierung). Deshalb alle URLs absolut, `https`, auf der SGBR-Domain.

## URLs

| URL | Liefert |
| --- | --- |
| `/category/speaker-events/?sgbr_feed=1` | Events-Feed |
| `/issues/?sgbr_feed=1` | Ausgaben-Feed |

- Ohne `?sgbr_feed=1` leiten dieselben Pfade wie in [urls-und-weiterleitungen.md](urls-und-weiterleitungen.md) auf `/en/events` bzw. `/en/issues` weiter. Mit dem Parameter: **keine Weiterleitung**, sondern direkt JSON (Status 200, `Content-Type: application/json; charset=UTF-8`).
- Mit und ohne Schrägstrich am Ende.

## Format

Beispiele vom 2026-11-22 als Vertrag: [sgbr-feed-events-2026-11-22.json](../tests/fixtures/esprit-feed/sgbr-feed-events-2026-11-22.json) und [sgbr-feed-issues-2026-11-22.json](../tests/fixtures/esprit-feed/sgbr-feed-issues-2026-11-22.json). Gleiche Schlüssel, gleiche Typen, alles Strings ausser `version`, fehlende Werte als `""`.

**Events:** `{ version: 1, generated_at, events: [...] }`, sortiert nach Datum aufsteigend.

| Feld | Quelle in Payload |
| --- | --- |
| `id` | `slug` des Events (alte IDs wie `weimer` übernehmen) |
| `status` | `upcoming` oder `past`, **berechnet aus `startsAt`**, nicht mehr von Hand |
| `logo_url` | Firmenlogo des Speakers, absolute `/files/…`-URL |
| `url` | `https://stgallenbusinessreview.com/en/events/{slug}` |
| `language` | `English` oder `German`, neues Event-Feld `language` |
| `name`, `role`, `company` | Speaker (`people`) |
| `date` | z. B. `15 October 2026`, englisch, Zeitzone Europe/Zurich |
| `time` | `HH:mm`, z. B. `19:00` |
| `location` | Ort des Events |

**Ausgaben:** `{ version: 1, generated_at, digital: [...], archive: [...] }`, jeweils neueste zuerst.

| Feld | Quelle in Payload |
| --- | --- |
| `kind` | `digital` (in `digital`) oder `pdf` (in `archive`), aus `format` |
| `year` | Jahr als String |
| `title`, `description` | `title`, `tagline` in Englisch, sonst Fallback |
| `url` | digital: `https://stgallenbusinessreview.com/en/issues/{slug}`; pdf: absolute `/files/…`-URL des PDFs |
| `cover_url` | Cover als absolute `/files/…`-URL, sonst `""` |

`generated_at`: ISO 8601 mit Offset, z. B. `2026-11-22T17:18:10+00:00`.

## Umsetzung und Tests

- Route-Handler für beide Feeds. Die Weiterleitungen dieser zwei Pfade greifen nur, wenn `sgbr_feed` fehlt.
- Basis-URL aus `NEXT_PUBLIC_SERVER_URL`, damit lokal und in der Vorschau eigene Adressen entstehen.
- Vertragstest: Ausgabe gegen die Struktur der Beispieldateien prüfen (Schlüssel, Typen, Reihenfolge der Felder). Beispiele als Fixtures ins Repo kopieren.
- Alte Event-Links `/category/speaker-events/?e={id}` leiten auf `/en/events/{id}` weiter.
- Dev-Import und finale Migration lesen Events und Ausgaben direkt aus diesen Feeds statt aus dem HTML (siehe [migration.md](migration.md)).

## Später

- Beim Neubau von espritsg.ch auf Payload kann eine neue, saubere Schnittstelle kommen. Diese Feeds bleiben so lange bestehen, wie das alte Plugin läuft.
