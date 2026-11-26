---
description: Lokale Entwicklung ohne Konten: Mail-Vorschau, Dateien auf der Platte, Seed-Passwort aus .env, Postgres auf Port 5433, keine E2E-Tests
---

# 0007: Lokal ohne Konten

- Datum: 2026-11-22
- Status: angenommen

## Entscheidung

- **Mails:** Ohne `RESEND_API_KEY` gibt der Mail-Adapter jede Mail in der Konsole aus und schreibt HTML und Text nach `.mail-preview/` (in `.gitignore`). Admins sehen die letzten Mails unter `/admin/mail-preview`.
- **Dateien:** Ohne R2-Zugang (`R2_*`, [ADR 0022](0022-cloudflare-r2.md)) landen Uploads in `media/` bzw. `application-files/` auf der Platte (in `.gitignore`).
- **Benutzer für die Entwicklung:** Der Dev-Import legt je Rolle einen Benutzer an (`admin@sgbr.local`, `board@…`, `editor@…`, `advisory@…`). Das Passwort kommt nur aus `DEV_SEED_PASSWORD` in `.env`. Fehlt die Variable, legt er keine Benutzer an.
- **Datenbank:** Postgres in Docker auf Port **5433**, damit es nicht mit anderen lokalen Projekten auf 5432 kollidiert. Tests nutzen die eigene Datenbank `sgbr_test`.
- **Tests:** Vitest für Unit- und Integrationstests. Die Playwright-E2E-Tests aus dem Template sind entfernt, weil sie Browser in CI brauchen und hier wenig zusätzlich absichern.
