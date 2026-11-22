---
description: Überblick über Aufbau, Stack mit Versionen, Datenfluss, Plugins und Hintergrund-Jobs der SGBR-Website
aktualisiert: 2026-11-22
---

# Architektur

Eine Next.js-App enthält Website und Payload CMS. Payload speichert in Postgres, Dateien in Vercel Blob, Mails gehen über Resend. Gehostet auf Vercel ([ADR 0001](entscheidungen/0001-stack.md)).

```
Browser ──> Vercel (Next.js 16)
              ├─ /en, /de ........ Website (Server Components, Payload Local API)
              ├─ /admin, /api .... Payload CMS (Admin, REST, GraphQL)
              ├─ /files/… ........ Dateien (leitet auf Vercel Blob bzw. lokale Platte)
              ├─ /issues/?sgbr_feed=1, /category/speaker-events/?sgbr_feed=1 ... JSON für espritsg.ch
              └─ /api/cron/run-jobs  täglicher Vercel Cron → Payload Jobs
            ├─> Postgres (Neon; lokal Docker)
            ├─> Vercel Blob (Bilder, PDFs; lokal Ordner media/)
            └─> Resend (Mails; lokal Konsole + .mail-preview/)
```

## Stack

| Bereich | Wahl | Version |
| --- | --- | --- |
| Framework | Next.js (App Router), React, TypeScript | 16.4.6, 19.2.9, 5.7 |
| CMS | Payload in derselben App | 3.94.1 |
| Laufzeit | Node.js, Version in `.nvmrc` | 24.22.3 |
| Datenbank | Postgres über `@payloadcms/db-postgres`; Produktion Neon, lokal Docker (Postgres 17) | |
| Rich Text | Lexical (`@payloadcms/richtext-lexical`) | 3.94.1 |
| Dateien | Vercel Blob (`@payloadcms/storage-vercel-blob`), ohne Token lokale Platte | 3.94.1 |
| Styling | Tailwind CSS mit Tokens per `@theme` | 4.3.5 |
| Schriften | `next/font/google`: Inter, Cormorant Garamond (selbst gehostet) | |
| Sprachen | Payload `localization` + `next-intl` | 4.15.3 |
| E-Mail | Resend (`@payloadcms/email-resend`, `resend`) | 3.94.1, 6.39.0 |
| Statistik | Vercel Web Analytics (ohne Cookies) | |
| KI-Zusammenfassungen | Anthropic-API, nur in Import- und Migrationsskript | |

Alle Versionen sind fest gepinnt. Updates: [wartung.md](wartung.md).

## Payload-Plugins und -Funktionen

| Funktion | Paket | Wofür |
| --- | --- | --- |
| SEO-Felder | `plugin-seo` | Meta-Titel, -Beschreibung, Bild pro Dokument und Sprache |
| Weiterleitungen | `plugin-redirects` | Einzelfälle, die die Redaktion selbst anlegt |
| Suche | `plugin-search` | Artikel, Ausgaben, Events, Personen |
| Formulare | `plugin-form-builder` | Kontakt, Event-Bewerbungen, plus eigener Datei-Upload |
| Live Preview | `live-preview-react` | Vorschau beim Tippen, pro Sprache |
| Admin-Leiste | `admin-bar` | „Bearbeiten“ auf der Website für Eingeloggte |
| Import/Export | `plugin-import-export` | CSV/JSON-Export als Backup und für Auswertungen |
| MCP | `plugin-mcp` | Zugriff für KI-Agents, standardmässig aus (`MCP_ENABLED`) |
| Entwürfe, Versionen, Autosave, geplantes Veröffentlichen | Kern | Redaktionsablauf |
| Join-Felder | Kern | Personenseiten, Ausgaben mit ihren Artikeln |

## Hintergrund-Jobs

Alles Zeitgesteuerte läuft über die Payload Jobs Queue, ausgelöst von **einem** täglichen Vercel Cron.

| Job | Auslöser |
| --- | --- |
| Geplantes Veröffentlichen von Artikeln, Events, Newslettern | täglicher Cron |
| Unbestätigte Abonnenten nach 7 Tagen löschen | täglicher Cron |
| Bewerbungen und Lebensläufe nach Frist löschen | täglicher Cron |
| Abgelaufene Rate-Limit-Einträge löschen | täglicher Cron |
| Newsletter-Versand in Paketen, fortsetzbar | Button „Senden“, dann Selbstaufruf bis fertig; Cron fängt Abbrüche auf |

- Cron: einmal täglich um 05:00 UTC (06:00 Winterzeit Zürich, 07:00 Sommerzeit), Takt nur in `vercel.json`. Mit Vercel Pro kann der Takt erhöht werden, sonst ändert sich nichts.
- Geplantes Veröffentlichen geht deshalb am Morgen des geplanten Tages live, nicht auf die Minute.
- Endpunkt `/api/cron/run-jobs`, geschützt mit `CRON_SECRET`.
- Lokal laufen die Jobs im Dev-Server automatisch oder per `npm run jobs`.

## Lokal ohne Konten

Siehe [ADR 0007](entscheidungen/0007-lokal-ohne-konten.md). Pflicht für den Start sind nur `DATABASE_URL`, `PAYLOAD_SECRET` und `NEXT_PUBLIC_SERVER_URL`.
