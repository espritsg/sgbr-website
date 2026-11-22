---
description: Feste Weiterleitungen in next.config.ts, alte Artikel per Regex vor dem Proxy, Feeds als eigene Route-Handler
---

# 0004: Weiterleitungen und Feed-Pfade

- Datum: 2026-11-22
- Status: angenommen

## Kontext

Alte Artikel liegen direkt unter `/{slug}/`. Next.js 16 nennt die Middleware `proxy.ts`. Die Feed-Pfade `/issues/?sgbr_feed=1` und `/category/speaker-events/?sgbr_feed=1` sollen JSON liefern, ohne Parameter aber weiterleiten.

## Entscheidung

- Alle festen Regeln stehen in `src/lib/redirects/legacy.ts` und werden in `next.config.ts` unter `redirects()` eingebunden. Next.js wertet sie vor dem Proxy aus.
- Alte Artikel: eine Regel für einstufige Pfade mit einer Ausschlussliste bekannter Pfade (`en`, `de`, `admin`, `api`, `files`, …).
- Feed-Pfade: Weiterleitung nur mit `missing: sgbr_feed`. Mit Parameter antworten Route-Handler unter `src/app/(feeds)/`.
- `skipTrailingSlashRedirect: true`, damit `/slug/` nur eine Weiterleitung braucht und die Feeds mit und ohne Schrägstrich gehen.

## Folgen

- Unbekannte alte Slugs landen auf `/en/article/{slug}` und bekommen dort 404. Das ist gewollt, weil die Regel keine Datenbank braucht.
