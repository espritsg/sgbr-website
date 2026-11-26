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
| `/{l}/newsletter/confirm?token=` | Anmeldung bestätigen (Einstellungen und Abmelden: Seite von Resend) |
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

- Seiten: `src/app/(frontend)/[locale]/…`. Statische Seiten (About, Contact, Imprint, Privacy) über `[locale]/[page]` aus der Collection `pages`.
- `/files/{dateiname}`: `src/app/(frontend)/files/[filename]/route.ts` sucht die Datei (auch generierte Bildgrössen) und leitet mit 302 auf den Speicher weiter.
- `/wp-content/uploads/{pfad}`: `src/app/(frontend)/wp-content/uploads/[...path]/route.ts` sucht über `legacyPath` (auch verkleinerte Varianten wie `-300x200.jpg`) und leitet mit 308 auf `/files/…` weiter.
- Vorschau: `/next/preview?path=…` schaltet für eingeloggte Benutzer den Entwurfsmodus ein, `/next/exit-preview` aus.

- Feste Regeln (Tabelle oben) in `src/lib/redirects/legacy.ts`, eingebunden in `next.config.ts` unter `redirects()`. Kosten nichts, brauchen keine Datenbank. Reihenfolge zählt: die erste passende Regel gewinnt. Tests: `tests/unit/redirects.test.ts`.
- `skipTrailingSlashRedirect: true`: `/slug/` und `/slug` führen mit einer einzigen Weiterleitung ans Ziel. Query-Parameter der alten URL hängt Next.js an das Ziel an (z. B. `/en/events/weimer?e=weimer`), das schadet nicht.
- Zusätzlich zur Tabelle: `/?s={suche}` → `/en/search?q={suche}`, `/page/{n}` → `/en`, `/capital-markets-between-europe-and-asia` (Gastbeitrag-Seite des alten Newsletters) → `/en/newsletter`, `/imprint`, `/privacy`, `/newsletter` ohne Sprache → `/en/…`.
- Artikel: eine Regel für alle einstufigen Pfade, die keine bekannte Route sind (`/{slug}/` → `/en/article/{slug}`). Muss vor der `next-intl`-Middleware greifen.
- Kategorien, die beim Aufräumen zusammengelegt werden: Zuordnung alt → neu als Liste im Migrationsskript, daraus Redirects erzeugen.
- Dateien neu: Die neue Seite verlinkt nur noch `/files/{dateiname}`, z. B. `/files/rising-2024.pdf`. Die Route leitet auf den Speicher (Cloudflare R2) weiter. So bleiben Download-Links gleich, auch wenn der Speicher später wechselt.
- Dateien alt: `/wp-content/uploads/…` ist nur für alte Links da, die schon draussen sind (Google, Newsletter, ESPRIT-Seite, geteilte PDF-Links). Feld `legacyPath` in `media` (z. B. `2026/08/Rising-2024.pdf`). Die Route `/wp-content/uploads/[...path]` sucht die Datei und leitet auf `/files/{dateiname}` weiter.
- Plugin `redirects` nur für Einzelfälle, die die Redaktion selbst anlegt (Admin → Einstellungen → Weiterleitungen). Die Website schaut dort nur bei unbekannten Pfaden nach (`src/lib/data/cmsRedirects.ts`, aufgerufen von der Artikel-, Seiten- und der Auffang-Route `[locale]/[page]/[...rest]`), normale Seiten kostet das nichts. Typ 302/307 leitet vorübergehend, sonst dauerhaft. Die finale Migration übernimmt die Regeln aus dem Plugin „Redirection“ dorthin.
- Weiterleitungen dauerhaft lassen, nicht nur in der Übergangszeit. Externe Links und Google-Einträge zeigen jahrelang auf die alten URLs.
- Vor dem Livegang testen: `npm run check:redirects` liest alle URLs aus der Sitemap der alten Seite (`sitemap_index.xml` von Rank Math) und prüft, dass jede auf eine Seite mit Status 200 endet. Ziel mit `CHECK_TARGET` (z. B. die Vercel-Vorschau), weitere alte Pfade mit `CHECK_EXTRA=datei.txt` (z. B. aus dem Export des Redirection-Plugins).

## Sitemap, robots, RSS

- `/sitemap.xml` (`src/app/sitemap.ts`): alle öffentlichen Seiten in beiden Sprachen mit hreflang, Artikel nur in ihrer Originalsprache.
- `/robots.txt` (`src/app/robots.ts`): Admin, API, Vorschau, Suche und Newsletter-Links gesperrt. Vercel-Vorschauen (`VERCEL_ENV` ≠ `production`) werden gar nicht indexiert.
- `/{l}/feed.xml`: RSS der 50 neuesten Artikel, ersetzt `/feed/`.
