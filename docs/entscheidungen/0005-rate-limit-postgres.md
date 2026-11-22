---
description: Begrenzung der Anfragen pro IP über eine versteckte Payload-Collection in Postgres statt eines externen Dienstes
---

# 0005: Rate-Limit in Postgres

- Datum: 2026-11-22
- Status: angenommen

## Kontext

Newsletter-Anmeldung und Formulare brauchen eine Begrenzung pro IP. Auf Vercel laufen mehrere Instanzen, Speicher im Prozess reicht nicht. Zusätzliche Dienste (z. B. Redis) sind nicht gewünscht.

## Entscheidung

- Versteckte Collection `rate-limits` (Schlüssel = Zweck + Hash der IP, Zähler, Fensterbeginn). Festes Zeitfenster, Standard 10 Anfragen pro 10 Minuten.
- IP nur als SHA-256-Hash mit `PAYLOAD_SECRET` gespeichert, nie im Klartext.
- Der tägliche Cron löscht abgelaufene Einträge.

## Folgen

- Eine DB-Abfrage mehr pro Anmeldung, bei dem Aufkommen unkritisch.
