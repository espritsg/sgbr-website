---
description: URL-Schema der neuen SGBR-Website (/en, /de, /article/…) und Weiterleitungen von allen alten WordPress-URLs
aktualisiert: 2026-11-22
---

# URLs und Weiterleitungen

Entschieden 2026-11-22: beide Sprachen mit Präfix, Artikel unter `/article/`.

## Neue Routen

`{l}` = `en` oder `de`. `next-intl` mit `localePrefix: 'always'`.

| Route | Inhalt |
| --- | --- |
| `/` | leitet nach `/en` oder `/de` weiter, je nach Browsersprache |
| `/{l}` | Startseite |
| `/{l}/article/{slug}` | Artikel (Interview oder Gastbeitrag) |
| `/{l}/topics`, `/{l}/topics/{slug}` | alle Topics mit Filter nach Unter-Topics, ein Topic |
| `/{l}/issues`, `/{l}/issues/{slug}` | Ausgaben, eine Ausgabe |
| `/{l}/events`, `/{l}/events/{slug}` | Speaker Events, ein Event mit Bewerbungsformular |
| `/{l}/people/{slug}` | Person mit allen Interviews und Events |
| `/{l}/newsletter`, `/{l}/newsletter/{slug}` | Anmeldung und Archiv, eine Ausgabe |
| `/{l}/newsletter/confirm?token=`, `/{l}/newsletter/preferences?token=` | Anmeldung bestätigen, Interessen ändern oder abmelden |
| `/{l}/about`, `/{l}/contact`, `/{l}/imprint`, `/{l}/privacy` | Seiten |
| `/{l}/search?q=` | Suche |
| `/files/{dateiname}` | Download von PDFs und Bildern, ohne Sprachpräfix |
| `/admin`, `/api` | Payload, ohne Sprachpräfix |
| `/category/speaker-events/?sgbr_feed=1`, `/issues/?sgbr_feed=1` | JSON-Feeds für espritsg.ch, gleiches Format wie heute ([esprit-feed.md](esprit-feed.md)) |

- Slugs sind nicht lokalisiert: `/en/article/x` und `/de/article/x` sind derselbe Artikel.
- Gibt es einen Artikel nur in einer Sprache, zeigt die andere Sprache das Original mit Hinweis. `canonical` zeigt dann auf die Originalsprache, damit Google keinen doppelten Inhalt sieht.

## Weiterleitungen alt → neu

Alle mit Status 308 (permanent). Ziel ist immer `/en`, weil die alte Oberfläche englisch war.

| Alt | Neu |
| --- | --- |
| `/{slug}/` (alle 198 Artikel) | `/en/article/{slug}` |
| `/category/{slug}/` und `/category/{slug}/page/{n}/` | `/en/topics/{slug}`, Sonderfälle unten |
| `/category/speaker-events/` (ohne `sgbr_feed`) | `/en/events` |
| `/category/speaker-events/?e={id}` | `/en/events/{id}` |
| `/category/vc-pe-family-offices/`, `/category/the-future-of-finance/` | `/en/issues/{slug}` |
| `/tag/{tag}/` | `/en/topics` |
| `/author/{slug}/` | `/en/people/{slug}` |
| `/issues/` (ohne `sgbr_feed`) | `/en/issues` |
| `/the-future-of-finance/` | `/en/issues/the-future-of-finance` |
| `/about/`, `/contact/` | `/en/about`, `/en/contact` |
| `/impressum/`, `/Impressum/` | `/en/imprint` |
| `/unsubscribe/`, `/manage-your-subscription/` u. a. MailPoet-Seiten | `/en/newsletter` |
| `/feed/` | `/en/feed.xml` (neuer RSS-Feed) |
| `/wp-content/uploads/{pfad}` | `/files/{dateiname}` |

## Umsetzung

- Feste Regeln (Tabelle oben) in `next.config.ts` unter `redirects()`. Kosten nichts, brauchen keine Datenbank.
- Artikel: eine Regel für alle einstufigen Pfade, die keine bekannte Route sind (`/{slug}/` → `/en/article/{slug}`). Muss vor der `next-intl`-Middleware greifen.
- Kategorien, die beim Aufräumen zusammengelegt werden: Zuordnung alt → neu als Liste im Migrationsskript, daraus Redirects erzeugen.
- Dateien neu: Die neue Seite verlinkt nur noch `/files/{dateiname}`, z. B. `/files/rising-2024.pdf`. Die Route leitet intern auf den Speicher (Vercel Blob) weiter. So bleiben Download-Links gleich, auch wenn der Speicher später wechselt.
- Dateien alt: `/wp-content/uploads/…` ist nur für alte Links da, die schon draussen sind (Google, Newsletter, ESPRIT-Seite, geteilte PDF-Links). Feld `legacyPath` in `media` (z. B. `2026/08/Rising-2024.pdf`). Die Route `/wp-content/uploads/[...path]` sucht die Datei und leitet auf `/files/{dateiname}` weiter.
- Plugin `redirects` nur für Einzelfälle, die die Redaktion selbst anlegt.
- Weiterleitungen dauerhaft lassen, nicht nur in der Übergangszeit. Externe Links und Google-Einträge zeigen jahrelang auf die alten URLs.
- Vor dem Livegang testen: Skript ruft alle alten URLs aus der WP-Sitemap auf und prüft, dass jede auf eine Seite mit Status 200 endet.
