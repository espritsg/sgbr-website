---
description: Zuordnung der 38 alten Kategorien, Ausgaben-Kategorien bringen Finance & Economics mit, importierte Artikel ohne Haupt-Thema bleiben veröffentlicht
---

# 0015: Kategorien und Artikel ohne Haupt-Thema

- Datum: 2026-11-22
- Status: angenommen (Zuordnung von der Redaktion zu bestätigen)

## Kontext

Die 38 alten Kategorien sind unaufgeräumt. Viele neue Artikel hängen nur an einer Ausgaben-Kategorie („The Future of Finance“), alte oft nur an „Uncategorized“. Neue Artikel müssen ein Haupt-Thema haben, sonst lassen sie sich nicht veröffentlichen. Alte URLs müssen aber auf eine Seite mit Status 200 führen.

## Entscheidung

- Zuordnung wie in `docs/migration.md`, im Code nur in `src/lib/categoryMap.ts`.
- Ausgaben-Kategorien `the-future-of-finance` und `vc-pe-family-offices` setzen die Ausgabe **und** das Haupt-Thema Finance & Economics.
- Import und Migration umgehen die Pflicht zum Haupt-Thema (`context.import`). Betroffene Artikel stehen im Bericht, die Redaktion ordnet sie zu. Im Admin gilt die Pflicht weiter.
