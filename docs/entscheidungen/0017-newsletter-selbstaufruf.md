---
description: Newsletter-Versand läuft sofort im Request, setzt sich per Selbstaufruf fort und wird vom täglichen Cron aufgefangen
---

# 0017: Newsletter-Versand ohne Warteschlangen-Dienst

- Datum: 2026-11-22
- Status: angenommen

## Kontext

Der Cron läuft nur einmal täglich. Ein Newsletter soll aber sofort nach dem Klick auf „Senden“ rausgehen. Eine Vercel Function hat eine begrenzte Laufzeit, weitere Dienste sind nicht gewünscht.

## Entscheidung

- „Senden“ verschickt im selben Request so viele Pakete, wie in ~40 Sekunden gehen. Bei ein paar hundert Abonnenten reicht das meist schon.
- Bleiben Pakete übrig, ruft `next/server` `after()` nach der Antwort `/api/newsletter/continue` auf (mit `CRON_SECRET`). Der Endpunkt arbeitet weiter und ruft sich bei Bedarf erneut auf.
- Der tägliche Cron-Job setzt jeden Newsletter im Status `sending` fort und startet geplante (`scheduledFor`).
- Doppelte Mails verhindern der Schnappschuss (`newsletter-deliveries`) und die Idempotency-Keys pro Paket.

## Folgen

- Ohne `CRON_SECRET` (lokal) gibt es keinen Selbstaufruf. Dort reicht ein Lauf meist, sonst setzt `npm run jobs` fort.
