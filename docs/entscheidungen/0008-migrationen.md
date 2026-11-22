---
description: Während des Aufbaus Schema per push, vor dem ersten Deploy eine Basis-Migration; danach nur noch Migrationen
---

# 0008: Datenbank-Migrationen

- Datum: 2026-11-22
- Status: angenommen

## Kontext

Während des Aufbaus ändert sich das Schema oft. Eine Produktionsdatenbank gibt es noch nicht.

## Entscheidung

- Bis zum ersten Deploy synchronisiert Payload das Schema lokal per `push` (Standard im Dev-Modus).
- Vor dem ersten Deploy gibt es eine Basis-Migration in `src/migrations/`. Der Build auf Vercel führt `payload migrate` aus, bevor `next build` läuft.
- Ab dann gilt die Regel aus `AGENTS.md`: jede Schemaänderung als Migration.

## Folgen

- Lokal nach dem Wechsel auf Migrationen: `npm run payload migrate:fresh` setzt die Dev-DB neu auf, danach Dev-Import erneut ausführen.
