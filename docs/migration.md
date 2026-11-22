---
description: Wie die SGBR-Inhalte nach Payload kommen: Dev-Import von der öffentlichen Website während der Entwicklung, finale Migration aus WordPress-Exporten am Ende
aktualisiert: 2026-11-22
---

# Migration WordPress → Payload

Zwei Phasen, entschieden 2026-11-22. Beide nutzen dieselbe Zuordnungslogik (ein gemeinsames Modul im Repo), nur die Quelle ist verschieden.

## Phase 1: Dev-Import während der Entwicklung

- Skript `src/scripts/import-dev.ts`, läuft mit `payload run`. Holt Daten von der öffentlichen Website, kein Login nötig:
  - Artikel, Bilder, Kategorien und Autoren über die öffentliche REST-API (`/wp-json/wp/v2/posts`, `media`, `categories`, `users`).
  - Ausgaben und Speaker Events aus den JSON-Feeds `/issues/?sgbr_feed=1` und `/category/speaker-events/?sgbr_feed=1` ([esprit-feed.md](esprit-feed.md)), Logos, Cover und PDFs über die URLs darin. Vorworte und Interviews der Ausgabenseiten aus dem HTML. Team aus `/about/` (HTML auslesen).
- Einstellbar, wie viele Artikel (z. B. `--limit 40`), damit es schnell geht. Beliebig oft wiederholbar, auch auf leerer Datenbank.
- Testdaten für neue Teile, die es heute nicht gibt: ein Newsletter, ein Bewerbungsformular mit Datei-Upload, je ein Benutzer pro Rolle (Passwörter nur aus `.env`).
- Fehlt öffentlich: Entwürfe, SEO-Felder, Weiterleitungen, Abonnenten. Für die Entwicklung egal.

## Phase 2: Finale Migration ganz am Ende

Mit Admin-Zugang zu WordPress Exporte nehmen und per Skript übertragen, kurz vor dem Livegang. Danach keine Änderungen mehr in WordPress.

### Quellen

| Was | Woher | Format |
| --- | --- | --- |
| Artikel, Seiten, Personen, Kategorien, Tags, Metadaten | WordPress-Admin → Werkzeuge → Daten exportieren → „Alle Inhalte“ | WXR (XML) |
| SEO-Titel und -Beschreibungen | im WXR-Export als Post-Meta (`rank_math_title`, `rank_math_description`) | XML |
| Bilder und PDFs | Ordner `wp-content/uploads/` per FTP aus All-Inkl, oder per Skript über die Datei-URLs aus dem Export | Dateien |
| Weiterleitungen | Plugin Redirection → Import/Export | JSON oder CSV |
| Newsletter-Abonnenten | MailPoet → Abonnenten → Exportieren, nur bestätigte | CSV |
| Speaker Events, Ausgaben | JSON-Feeds mit `?sgbr_feed=1` (wie im Dev-Import) | JSON |
| Team | fest im Child-Theme, Seite `/about/` | HTML |

- Alternative zum WXR-Export: REST-API mit Anwendungspasswort. Liefert JSON und auch Entwürfe, aber die SEO-Felder von Rank Math nicht ohne Weiteres. Daher WXR als Hauptquelle.
- Anwendungspasswort oder FTP-Zugang nur in `.env` oder 1Password, nie in Dateien.
- Exporte enthalten Personendaten (Abonnenten). Nicht ins Repo legen, nur lokal und nach der Migration löschen lassen.

### Skript

- Liegt im Repo unter `src/scripts/migrate.ts`, läuft mit `payload run src/scripts/migrate.ts`. Nutzt die Local API von Payload (`payload.create`, `payload.update`), also mit allen Validierungen und Hooks.
- Wiederholbar: jedes Dokument bekommt `wpId`, bei erneutem Lauf wird aktualisiert statt doppelt angelegt.
- Reihenfolge: Medien → Topics → Personen → Ausgaben → Artikel → Weiterleitungen.
- Artikeltext: HTML aus dem Export mit `convertHTMLToLexical` (`@payloadcms/richtext-lexical`) umwandeln. WPBakery-Shortcodes vorher entfernen, die 8 betroffenen Artikel von Hand prüfen.
- Sprache: pro Artikel erkennen und Titel, Zusammenfassung und Text in die Locale der Originalsprache schreiben (`locale: 'de'` oder `'en'`). Liste der unsicheren Fälle ausgeben.
- Personen: aus den WP-Autoren (`dc:creator`) die Collection `people` füllen.
- Kategorien: Zuordnung alt → neu als Tabelle im Skript, daraus auch die Weiterleitungen.
- Medien: alter Pfad unter `wp-content/uploads/` landet in `legacyPath`.
- Am Ende ein Bericht: Anzahl je Collection, fehlende Bilder, Artikel ohne Haupt-Topic, Artikel ohne Zusammenfassung.

## Kurzzusammenfassungen (entschieden 2026-11-22)

- Das Skript lässt Claude pro Artikel 1–2 Sätze in der Originalsprache schreiben (Anthropic-API, `ANTHROPIC_API_KEY`, Modell per `ANTHROPIC_MODEL`).
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
