---
description: Newsletter ohne Payload-Entwürfe; geplanter Versand über das Feld scheduledFor und den täglichen Cron
---

# 0013: Newsletter-Versand und Planung

- Datum: 2026-11-22
- Status: angenommen

## Kontext

„Geplantes Veröffentlichen“ soll auch für Newsletter gelten. Ein Newsletter wird aber nicht veröffentlicht, sondern versendet. Den Status `draft → sending → sent/failed` gibt die Spec vor.

## Entscheidung

- `newsletters` hat Versionen, aber keine Payload-Entwürfe. Den Status setzt nur das System.
- Planen: Feld `scheduledFor` (Tag). Der tägliche Cron startet am Morgen dieses Tages den Versand für Newsletter mit Status `draft`. Setzen dürfen das nur Admin und Board, wie den Button „Senden“.

## Folgen

- Editors schreiben Newsletter-Texte und machen Testversände, senden und planen können sie nicht.
