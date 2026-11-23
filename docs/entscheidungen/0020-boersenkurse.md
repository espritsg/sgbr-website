---
description: Börsenkurse im Kopf der Website über einen eigenen Endpunkt mit Yahoo-Finance-Daten und Zwischenspeicher
---

# 0020: Börsenkurse im Kopf

- Datum: 2026-11-23
- Status: angenommen

## Kontext

Die alte Seite zeigt oben S&P 500, DAX, Nikkei 225, Hang Seng und EUR/USD. Die Kurse kamen über einen WordPress-Proxy (`sgbr/v1/market`) von der öffentlichen Chart-Schnittstelle von Yahoo Finance; der Proxy war zuletzt kaputt. Die Redaktion möchte die Leiste behalten. Kostenlose offizielle Kursdienste brauchen ein Konto und einen API-Key.

## Entscheidung

- Payload-Endpunkt `GET /api/market` (`src/endpoints/market.ts`) holt die fünf Kurse serverseitig von `query1.finance.yahoo.com/v8/finance/chart/…` und hält sie 5 Minuten im Speicher (`src/lib/market`). Antwort mit `Cache-Control` (`s-maxage=300`), damit Vercel sie zusätzlich zwischenspeichert.
- Der Browser fragt nur `/api/market`, nie Yahoo direkt. Keine Cookies, kein Tracking, kein API-Key, keine Umgebungsvariable.
- `MarketBar` (`src/components/layout/MarketBar.tsx`) lädt nach der Seite, aktualisiert alle 5 Minuten und steht nur auf breiten Bildschirmen zwischen Datum und Werkzeugen.
- Fällt ein Kurs aus, fehlt er; fällt alles aus, bleibt die letzte gute Antwort, sonst bleibt die Leiste leer. Die Seite hängt nie an Yahoo.

## Folgen

- Yahoo bietet die Schnittstelle nicht offiziell an. Sie kann sich ändern oder gesperrt werden, dann ist die Leiste leer, aber nichts bricht. Ersatz wäre ein Dienst mit Key (z. B. Finnhub, Twelve Data): nur `fetchQuote` in `src/lib/market` tauschen und den Key als Umgebungsvariable ergänzen.
- Kurse sind bis zu einige Minuten alt, für eine Magazin-Kopfzeile genügt das.
- Symbole und Nachkommastellen stehen in `MARKET_SYMBOLS` und werden im Code geändert, nicht im Admin.
