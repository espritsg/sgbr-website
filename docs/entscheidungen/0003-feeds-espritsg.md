---
description: Feeds für espritsg.ch behalten Struktur und Typen, die URL-Werte zeigen auf die neuen Seiten
---

# 0003: Feeds für espritsg.ch mit neuen Ziel-URLs

- Datum: 2026-11-22
- Status: angenommen

## Kontext

Die Spec verlangt „exakt dasselbe JSON“ wie heute, damit das Plugin „ESPRIT – SGBR Connect“ 1.0.1 unverändert läuft. Gleichzeitig sollen `url`-Felder auf die neuen Seiten zeigen (`/en/events/{slug}`, `/en/issues/{slug}`, `/files/…`). Heute stehen dort alte WordPress-URLs.

## Entscheidung

- Schlüssel, Reihenfolge der Schlüssel, Typen und Formate (`date`, `time`, `generated_at`) bleiben exakt gleich. Die Werte für URLs zeigen auf die neue Seite.
- Der Vertragstest vergleicht die Struktur mit den Fixtures in `tests/fixtures/esprit-feed/`, nicht die Werte.
- Für `status` zählt `startsAt` (Zeitzone Europe/Zurich): ein Event ist `upcoming`, bis es beginnt.

## Folgen

- Das Plugin prüft Links. Die neuen URLs sind absolut, `https`, auf der SGBR-Domain (Basis `NEXT_PUBLIC_SERVER_URL`).
