# Regeln für KI-Agents (und Menschen)

Dieses Repo ist die Website der St. Gallen Business Review (SGBR): Next.js 16 (App Router) mit Payload CMS 3 in derselben App, Tailwind CSS 4, Postgres. Lies zuerst [README.md](README.md) und [docs/INDEX.md](docs/INDEX.md).

## Grundsätze

- **Das Repo ist die Wahrheit.** Was in `docs/` steht, gilt. Weicht Code von der Doku ab, ist das ein Fehler, der im selben Commit behoben wird.
- **Doku-Pflicht:** Jede Änderung an Verhalten, Datenmodell, Rollen, URLs oder Umgebungsvariablen aktualisiert im selben Commit die passende Datei in `docs/` und `CHANGELOG.md`.
- Neue grundsätzliche Entscheidung (Dienst, Bibliothek, Architektur) als ADR in `docs/entscheidungen/NNNN-titel.md`, Vorlage: [docs/entscheidungen/0000-vorlage.md](docs/entscheidungen/0000-vorlage.md).
- Doku-Dateien kurz halten, eine pro Thema, oben im Frontmatter eine Zeile `description`. Veraltetes ersetzen statt anhängen.
- Sprache: Doku, CHANGELOG und Commit-Nachrichten auf **Deutsch**. Code, Bezeichner und Code-Kommentare auf **Englisch**. UI-Texte der Website in `src/i18n/messages/{en,de}.json`.
- Keine Abkürzungen, die nur eine Person versteht. Lieber einfacher Code als cleverer.

## Datenbank und Payload

- Schema nur über Payload-Migrationen ändern: `npm run payload migrate:create <name>`. In Produktion nie `push`.
- Nach Schemaänderungen `npm run generate:types` und `npm run generate:importmap`, Ergebnis committen.
- Zugriffsregeln stehen **nur** in `src/access/`. Jede Änderung dort braucht einen passenden Test in `tests/int/access*.test.ts`.
- Lokalisierte Felder nur für Inhalte, die wirklich pro Sprache gepflegt werden (siehe [docs/sprachen.md](docs/sprachen.md)). Slugs sind nie lokalisiert.

## Versionen und Abhängigkeiten

- Versionen fest pinnen (`save-exact=true` in `.npmrc`). Alle `@payloadcms/*`-Pakete immer auf derselben Version wie `payload`.
- Updates auf eigenem Branch, Ablauf in [docs/wartung.md](docs/wartung.md).

## Secrets und Umgebung

- Keine Secrets im Repo. `.env` ist lokal und in `.gitignore`.
- Neue Variable immer auch in `.env.example` (mit Kommentar) und in [docs/deployment.md](docs/deployment.md).
- Lokal läuft alles ohne externe Konten: ohne `RESEND_API_KEY` keine echten Mails (Konsole und `.mail-preview/`), ohne `BLOB_READ_WRITE_TOKEN` Dateien auf der Platte, ohne `ANTHROPIC_API_KEY` keine KI-Zusammenfassungen.

## Arbeitsweise

- Commits nach Conventional Commits (`feat:`, `fix:`, `docs:`, `chore:`, `test:`, `refactor:`), Beschreibung auf Deutsch.
- Vor jedem Commit: `npm run lint`, `npm run typecheck`, `npm test` grün. Vor einem Merge zusätzlich `npm run build` (oder alles zusammen: `npm run check`).
- Tests brauchen die lokale Datenbank: `npm run db:up`. Integrationstests nutzen die eigene Datenbank `sgbr_test`.
- Nie Daten der Live-Seite oder von espritsg.ch verändern. Die Feeds für espritsg.ch ([docs/esprit-feed.md](docs/esprit-feed.md)) sind ein Vertrag: der Vertragstest muss grün bleiben.

## Wo was liegt

| Pfad | Inhalt |
| --- | --- |
| `src/app/(frontend)/[locale]/` | öffentliche Seiten unter `/en` und `/de` |
| `src/app/(payload)/` | Payload-Admin und API (generiert, nicht von Hand ändern ausser `custom.scss`) |
| `src/app/(feeds)/` | JSON-Feeds für espritsg.ch |
| `src/collections/<name>/` | eine Collection pro Ordner, `index.ts` ist die Config |
| `src/globals/`, `src/blocks/`, `src/fields/` | Globals, Blöcke, wiederverwendbare Felder |
| `src/access/` | alle Rollen- und Zugriffsregeln |
| `src/jobs/` | Hintergrund-Jobs (Payload Jobs Queue) |
| `src/lib/` | Hilfsfunktionen ohne UI |
| `src/emails/` | Mail-Vorlagen |
| `src/i18n/` | Routing und UI-Texte |
| `src/scripts/` | Dev-Import, finale Migration, Redirect-Prüfung |
| `src/migrations/` | Datenbank-Migrationen |
| `tests/unit`, `tests/int` | Unit-Tests (ohne DB) und Integrationstests (mit Test-DB) |
