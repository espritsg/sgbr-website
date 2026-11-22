# Changelog

Alle wichtigen Änderungen an diesem Projekt. Format nach [Keep a Changelog](https://keepachangelog.com/de/1.1.0/), Versionen nach [Semantic Versioning](https://semver.org/lang/de/).

## [Unveröffentlicht]

### Hinzugefügt

- Grundgerüst mit Next.js 16, Payload 3.94, Postgres (Docker), Tailwind CSS 4 und next-intl (`/en`, `/de`).
- Admin-Oberfläche standardmässig auf Deutsch, Inhalte in Englisch und Deutsch mit gegenseitigem Fallback.
- Datenmodell: Artikel, Personen, Themen, Ausgaben, Events, Team, Seiten, Medien, Newsletter, Abonnenten, Bewerbungsdateien, Globals (Startseite, Kopf, Fuss, Einstellungen).
- Plugins: SEO, Weiterleitungen, Suche, Form Builder (mit Datei-Upload und Aufbewahrungsfrist), Import/Export, MCP (standardmässig aus), Vercel Blob (öffentlich und privat).
- Vier Rollen mit zentralen Zugriffsregeln und Tests; Editors sehen keinen Veröffentlichen-Button.
- Doku in `docs/`, Regeln für Agents in `AGENTS.md`, CI mit Lint, Typecheck, Tests und Build.
