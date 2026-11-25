---
description: Wie die SGBR-Inhalte nach Payload kommen: Dev-Import von der öffentlichen Website während der Entwicklung, finale Migration aus WordPress-Exporten am Ende
aktualisiert: 2026-11-22
---

# Migration WordPress → Payload

Zwei Phasen, entschieden 2026-11-22. Beide nutzen dieselbe Zuordnungslogik (ein gemeinsames Modul im Repo), nur die Quelle ist verschieden.

## Phase 1: Dev-Import während der Entwicklung

```bash
npm run db:up
npm run import:dev            # 40 neueste Artikel
npm run import:dev -- 198     # alle Artikel (oder IMPORT_LIMIT=198)
```

- Skript `src/scripts/import-dev.ts`, läuft mit `payload run`. Liest nur, kein Login nötig:
  - Artikel, Bilder (Beitragsbild und Bilder im Text), Kategorien und Autoren über die öffentliche REST-API (`/wp-json/wp/v2/posts`, `media`, `categories`, eingebettete `author`).
  - Ausgaben und Speaker Events aus den Feeds `/issues/?sgbr_feed=1` und `/category/speaker-events/?sgbr_feed=1` ([esprit-feed.md](esprit-feed.md)), Logos, Cover und PDFs über die URLs darin. Vorwort, Unterzeile und Redaktion aus dem HTML der digitalen Ausgaben (`sgbr-tfof-*`).
  - Team, Mission und Teamfoto aus `/about/` (`sgbr-about-*`). Imprint und Datenschutz aus der Seite `impressum`, Kontakttext aus `contact`.
- Beliebig oft wiederholbar, auch auf leerer Datenbank: Artikel über `wpId`, alles andere über `slug`, Dateien über `legacyPath`.
- Testdaten für neue Teile: Kontaktformular, Bewerbungsformular mit PDF-Upload (am nächsten kommenden Event, Bewerbung ab sofort offen), ein Newsletter-Entwurf, ein versendeter Beispiel-Newsletter im Archiv, drei bestätigte Test-Abonnenten (`@example.com`), Globals, je ein Benutzer pro Rolle (`admin@sgbr.local`, `board@…`, `editor@…`, `advisory@…`, Passwort nur aus `DEV_SEED_PASSWORD`).
- Fehlt öffentlich: Entwürfe, SEO-Felder, Weiterleitungen, Abonnenten. Für die Entwicklung egal. Test-Kontakte landen nur im lokalen Ersatz für Resend (`.mail-preview/audience.json`), nie in einem echten Resend-Konto.
- Quelle änderbar mit `DEV_IMPORT_SOURCE` (Standard `https://stgallenbusinessreview.com`).

### Gemeinsame Zuordnungslogik

| Datei | Inhalt |
| --- | --- |
| `src/scripts/lib/importers.ts` | Themen, Personen, Artikel, Ausgaben, Events, Team nach Payload; Bericht |
| `src/scripts/lib/html.ts` | Shortcodes entfernen, Bilder in Upload-Knoten umwandeln, Absätze lesen |
| `src/scripts/lib/lexical.ts` | HTML → Lexical (`convertHTMLToLexical`) |
| `src/scripts/lib/language.ts` | Sprache erkennen (Häufigkeit von Funktionswörtern) |
| `src/scripts/lib/summary.ts` | Kurzzusammenfassung mit Claude oder aus dem ersten Absatz |
| `src/scripts/lib/media.ts` | Dateien einmal laden, über `legacyPath` wiederverwenden |
| `src/scripts/lib/seed.ts` | Seiten, Formulare, Globals, Testdaten |
| `src/lib/categoryMap.ts` | Zuordnung alte Kategorien → Themen, auch für Weiterleitungen |

- **Art des Artikels:** Interview, wenn der Text mindestens drei fett gesetzte Absätze (die Fragen) hat, sonst Gastbeitrag.
- **Personen:** WordPress-Autor = Interviewpartner. Name, Slug, Biografie, Foto aus dem Avatar (Original statt 150×150).
- **Artikel ohne Haupt-Thema** werden trotzdem veröffentlicht, damit ihre alten URLs funktionieren, und stehen im Bericht ([ADR 0015](entscheidungen/0015-kategorien.md)).

## Zuordnung der Kategorien (Vorschlag, von der Redaktion zu bestätigen)

| Alte Kategorie | Neu |
| --- | --- |
| business, entrepreneurship, finance-economics, politics | Haupt-Thema gleichen Namens |
| leadership, strategy, technology, digitalization, data, performance, network, sustainability, tradition | Unter-Thema von **Business** |
| role-models, change, individualism, harmony, art | Unter-Thema von **Entrepreneurship** |
| capital, regulation | Unter-Thema von **Finance & Economics** |
| security, education, health, science, nature, freedom, philosophy, philanthropy | Unter-Thema von **Politics** |
| the-future-of-finance, vc-pe-family-offices | Ausgabe gleichen Namens, Artikel bekommen zusätzlich **Finance & Economics** |
| speaker-events | Seite `/events` |
| featured, world, uncategorized, unkategorisiert-* (en, it, fr, es) | entfällt, Weiterleitung auf `/topics` |

Ein Unter-Thema bringt sein Haupt-Thema mit: Ein Artikel in „Leadership“ steht auch unter „Business“. Die Tabelle ist in `src/lib/categoryMap.ts` die einzige Quelle; Änderungen dort wirken auf Import, Migration und Weiterleitungen.

## Phase 2: Finale Migration ganz am Ende

Mit Admin-Zugang zu WordPress Exporte nehmen und per Skript übertragen, kurz vor dem Livegang. Danach keine Änderungen mehr in WordPress.

### Quellen

| Was | Woher | Format |
| --- | --- | --- |
| Artikel, Seiten, Personen, Kategorien, Tags, Metadaten | WordPress-Admin → Werkzeuge → Daten exportieren → „Alle Inhalte“ | WXR (XML) |
| SEO-Titel und -Beschreibungen | im WXR-Export als Post-Meta (`rank_math_title`, `rank_math_description`) | XML |
| Bilder und PDFs | Ordner `wp-content/uploads/` per FTP aus All-Inkl, oder per Skript über die Datei-URLs aus dem Export | Dateien |
| Weiterleitungen | Plugin Redirection → Import/Export | JSON oder CSV |
| Newsletter-Abonnenten | MailPoet → Abonnenten → Exportieren, nur bestätigte (landen als Kontakte in Resend) | CSV |
| Speaker Events, Ausgaben | JSON-Feeds mit `?sgbr_feed=1` (wie im Dev-Import) | JSON |
| Team | fest im Child-Theme, Seite `/about/` | HTML |

- Alternative zum WXR-Export: REST-API mit Anwendungspasswort. Liefert JSON und auch Entwürfe, aber die SEO-Felder von Rank Math nicht ohne Weiteres. Daher WXR als Hauptquelle.
- Anwendungspasswort oder FTP-Zugang nur in `.env` oder 1Password, nie in Dateien.
- Exporte enthalten Personendaten (Abonnenten). Nicht ins Repo legen, nur lokal und nach der Migration löschen lassen.

### Ablauf

```bash
# Ordner mit den Exporten (nie ins Repo legen, nach der Migration löschen):
#   export.xml  mailpoet.csv  redirection.json  uploads/  (optional: feeds/issues.json, feeds/events.json, about.html)
# Abonnenten gehen nach Resend: dafür RESEND_API_KEY und die vier RESEND_SEGMENT_*/RESEND_TOPIC_*-IDs
# setzen (ohne sie landen sie nur im lokalen Ersatz .mail-preview/audience.json).
DATABASE_URL=<Produktions-DB> BLOB_READ_WRITE_TOKEN=<Token> ANTHROPIC_API_KEY=<optional> \
  RESEND_API_KEY=<…> RESEND_SEGMENT_EN=<…> RESEND_SEGMENT_DE=<…> RESEND_TOPIC_NEWSLETTER=<…> RESEND_TOPIC_EVENTS=<…> \
  MIGRATION_DIR=/pfad/zu/wp-export npm run migrate:wp
```

Am einfachsten: `vercel env pull .env.production.local` und die Werte daraus übernehmen (Datei ist in `.gitignore`, danach löschen).

- Ohne `feeds/` und `about.html` holt das Skript Feeds und About-Seite von der alten Seite (nur lesend). `MIGRATION_OFFLINE=1` verbietet jeden Netzzugriff.
- Dateien kommen aus `uploads/`, fehlen sie dort, werden sie über die URL aus dem Export geladen.
- Beispiel mit erfundenen Daten: `tests/fixtures/wp-export-sample/`, getestet in `tests/int/migration.test.ts`.

### Skript

- Liegt im Repo unter `src/scripts/migrate.ts`, läuft mit `npm run migrate:wp` (`payload run`). Nutzt die Local API von Payload (`payload.create`, `payload.update`), also mit allen Validierungen und Hooks.
- Wiederholbar: jedes Dokument bekommt `wpId`, bei erneutem Lauf wird aktualisiert statt doppelt angelegt.
- Reihenfolge: Medien → Topics → Personen → Ausgaben → Artikel → Weiterleitungen.
- Artikeltext: HTML aus dem Export mit `convertHTMLToLexical` (`@payloadcms/richtext-lexical`) umwandeln. WPBakery-Shortcodes vorher entfernen, die 8 betroffenen Artikel von Hand prüfen.
- Sprache: pro Artikel erkennen und Titel, Zusammenfassung und Text in die Locale der Originalsprache schreiben (`locale: 'de'` oder `'en'`). Liste der unsicheren Fälle ausgeben.
- Personen: aus den WP-Autoren (`dc:creator`) die Collection `people` füllen. Slug, Biografie und Foto aus der öffentlichen REST-API, wenn erreichbar (der WXR-Export enthält sie nicht).
- Kategorien: Zuordnung alt → neu als Tabelle im Skript, daraus auch die Weiterleitungen.
- Medien: alter Pfad unter `wp-content/uploads/` landet in `legacyPath`.
- Am Ende ein Bericht: Anzahl je Collection, fehlende Bilder, Artikel ohne Haupt-Topic, Artikel ohne Zusammenfassung, unsichere Sprache, entfernte Shortcodes, übersprungene Weiterleitungen (Regex).
- Zuerst alle Dateien (`attachment`), damit alte Links auf `/wp-content/uploads/…` weiter funktionieren. Artikel im Papierkorb und automatische Entwürfe werden ausgelassen, Entwürfe bleiben Entwürfe.
- Rank-Math-Titel mit Variablen (`%title% %sep%`) werden nicht übernommen, dann gilt der Artikeltitel.
- MailPoet: nur Status „subscribed“, Datum als Zürcher Zeit gelesen, Sprache `en`, Interesse `newsletter`, Quelle `mailpoet-import`. Bereits vorhandene Adressen bleiben unverändert.
- Weiterleitungen aus „Redirection“ landen in der Collection `redirects` (ohne Regex-Regeln, die stehen im Bericht).
- Code: `src/scripts/migrate.ts`, `src/scripts/lib/migration.ts`, Parser in `wxr.ts`, `csv.ts`, `redirection.ts`.

## Kurzzusammenfassungen (entschieden 2026-11-22)

- Das Skript lässt Claude pro Artikel 1–2 Sätze in der Originalsprache schreiben (Anthropic-API, `ANTHROPIC_API_KEY`, Modell per `ANTHROPIC_MODEL`, Standard `claude-sonnet-5-5`, Aufwand `low`). Lehnt das Modell ab, springt serverseitig ein anderes Modell ein (`fallbacks: "default"`); scheitert auch das, gilt der erste Absatz.
- Vorgabe an Claude: worum es geht und wer spricht, keine Anrede, kein Werbeton, keine erfundenen Fakten.
- Jeder Artikel bekommt `summaryNeedsReview = true`. Im Admin eine Liste „Zusammenfassung prüfen“ für die Redaktion.
- Schon vorhandene Zusammenfassungen nie überschreiben, damit wiederholte Läufe nichts zerstören.
- Ohne API-Key: erster sinnvoller Absatz, gekürzt, ebenfalls markiert.
- Gilt auch für den Dev-Import, wenn ein Key gesetzt ist.

## Ausgangslage der alten Seite (Analyse 2026-11-22)

| Was | Menge | Bemerkung |
| --- | --- | --- |
| Artikel | 198 | 2013 bis 2026, meist Interviews, etwa halb Deutsch, halb Englisch |
| Seiten | 9 | davon 4 MailPoet-Systemseiten; echt: About, Contact, Imprint, Issues, The Future of Finance |
| Kategorien | 38 | unaufgeräumt: 4× „Unkategorisiert“, 26× „Uncategorized“, mehrere leer |
| Tags | 14 | kaum genutzt |
| Medien | 902 | jeder Artikel hat ein Beitragsbild |
| Ausgaben-PDFs | 30 | Archiv auf „Issues“, 2004 bis 2024 |
| „Autoren“ | ~196 | je Artikel ein WP-Benutzer, das ist der Interviewpartner, nicht der Verfasser |

Stolpersteine:

- 8 alte Artikel enthalten rohe WPBakery-Shortcodes (`[vc_row]` …), der Shortcode `[gtranslate]` steht als Text in Seiten.
- Speaker Events und Team liegen fest im Child-Theme, nicht als Beiträge.
- Einbettungen selten: je 4 Artikel mit YouTube, Spotify, PDF.
- WordPress, Hosting und DNS liegen bei All-Inkl (PHP-Shared-Hosting). E-Mail läuft über Microsoft 365, MX-Einträge beim DNS-Wechsel nicht anfassen.
