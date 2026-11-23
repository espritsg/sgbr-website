# St. Gallen Business Review – Website

Die Website der [St. Gallen Business Review](https://stgallenbusinessreview.com) (SGBR), einem Interview-Magazin von ESPRIT St. Gallen. Sie löst die alte WordPress-Seite ab.

- **Website** in Englisch und Deutsch (`/en`, `/de`): Interviews, Ausgaben, Speaker Events, Newsletter.
- **Redaktion** pflegt alles im Payload-Admin unter `/admin`.
- **Technik:** Next.js 16, Payload CMS 3, Tailwind CSS 4, Postgres. Gehostet auf Vercel.

## Lokal starten

Voraussetzungen: [nvm](https://github.com/nvm-sh/nvm), Docker Desktop. Anmelden im Admin mit `admin@sgbr.local` und dem Passwort aus `DEV_SEED_PASSWORD`.

```bash
nvm install && nvm use          # Node-Version aus .nvmrc
npm install
cp .env.example .env            # dann PAYLOAD_SECRET und DEV_SEED_PASSWORD setzen
npm run db:up                   # Postgres in Docker (Port 5433)
npm run import:dev              # Inhalte von der öffentlichen Seite + Testdaten
npm run dev                     # http://localhost:3000, Admin unter /admin
```

Ohne Konten für Resend, Vercel Blob oder Anthropic läuft alles lokal: Mails landen in der Konsole und in `.mail-preview/`, Dateien auf der Platte.

## Wichtige Befehle

| Befehl | Was |
| --- | --- |
| `npm run dev` | Entwicklungsserver |
| `npm run check` | Lint, Typecheck, Tests und Build, wie in CI |
| `npm test` | alle Tests (braucht `npm run db:up`) |
| `npm run import:dev` | Testdaten von der öffentlichen Website laden ([docs/migration.md](docs/migration.md)) |
| `npm run seed:forms` | Kontakt- und Bewerbungsformular in der Dev-Datenbank neu anlegen |
| `npm run jobs` | tägliche Hintergrund-Jobs einmal ausführen |
| `npm run migrate:create <name>` | Datenbank-Migration nach Schemaänderung |
| `npm run migrate:wp` | finale Migration aus den WordPress-Exporten ([docs/migration.md](docs/migration.md)) |
| `npm run check:redirects` | alle alten URLs prüfen (vor dem Livegang) |
| `npm run generate:types` | Payload-Typen nach Schemaänderungen |

## Deploy

Auf Vercel mit Neon (Postgres), Vercel Blob und Resend. Alle Variablen stehen in `.env.example`, Schritte und Checkliste für den Livegang in [docs/deployment.md](docs/deployment.md). Der Build auf Vercel (`npm run build:vercel`) führt zuerst die Datenbank-Migrationen aus, der tägliche Cron steht in `vercel.json`.

## Wegweiser

- [docs/INDEX.md](docs/INDEX.md): Karte der ganzen Doku.
- [AGENTS.md](AGENTS.md): Regeln für alle, die am Code arbeiten (Menschen und KI-Agents).
- [docs/redaktion.md](docs/redaktion.md): Anleitung für die Redaktion.
- [CHANGELOG.md](CHANGELOG.md): Änderungen.

## Ansprechpartner

- Redaktion: Editor-in-Chief und Co-Editors-in-Chief der SGBR (aktuelle Namen auf der About-Seite).
- Technik: siehe [docs/deployment.md](docs/deployment.md) (offen, wer die Seite technisch betreut).
