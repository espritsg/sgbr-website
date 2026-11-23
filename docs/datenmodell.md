---
description: Payload-Datenmodell der SGBR-Website: Collections, Felder, Lokalisierung, Entwürfe, Globals und Plugin-Collections, mit Pfaden im Code
aktualisiert: 2026-11-22
---

# Datenmodell

**L** = lokalisiert (en/de). Felder ohne L gelten für beide Sprachen. Code: `src/collections/<name>/index.ts`, `src/globals/`, Plugins in `src/plugins/index.ts`. Typen: `src/payload-types.ts` (generiert).

**Entwürfe:** `posts`, `people`, `topics`, `issues`, `events`, `team-members` und `pages` haben Entwürfe, Versionen (max. 50) und geplantes Veröffentlichen ([ADR 0014](entscheidungen/0014-entwuerfe.md)). Autosave bei `posts`, `issues`, `events` und `pages`. Pflichtfelder und Validierungen greifen erst beim Veröffentlichen. Öffentlich sichtbar ist nur, was veröffentlicht ist.

Jede routbare Collection hat ein `slug`-Feld: eindeutig, **nicht** lokalisiert, wird aus dem Titel erzeugt, wenn es leer ist (`src/fields/slug.ts`).

## Inhalte (Gruppe „Magazin“ und „Inhalte“)

**`posts`** (Artikel, URL `/{l}/article/{slug}`)
- Reiter Inhalt: `type` (interview, guest-article) · `title` L · `summary` L (Pflicht, 1–2 Sätze für Karten) · `heroImage` → media · `content` L (Lexical mit Blöcken `qa`, `quote`, `embed`, `pdfDownload`, `src/blocks/content.ts`)
- Reiter Zuordnung: `interviewees` → people (mehrfach, Byline, [ADR 0006](entscheidungen/0006-byline.md)) · `interviewers` → team-members · `topics` → topics (mindestens ein Haupt-Topic, `validateMainTopic.ts`) · `issue` → issues · `issueImage` → media (freigestelltes Porträt, nur Ausgabenseite)
- Seitenleiste: `slug` · `publishedAt` (wird beim ersten Veröffentlichen gesetzt, wenn leer) · `originalLanguage` (en/de, Pflicht) · `summaryNeedsReview` (von der Migration gesetzt) · `wpId` (nur lesen)
- `meta` L (SEO: Titel, Beschreibung, Bild) im eigenen Reiter „SEO“ (`src/fields/seoTab.ts`). Reiter: Inhalt | Zuordnung | SEO. Ausgaben und Events haben ebenfalls einen SEO-Reiter.
- Liste „Zusammenfassung prüfen“: in der Artikelliste nach „Zusammenfassung prüfen = ja“ filtern.

**`people`** (Interviewpartner, Gastautoren, Speaker, URL `/{l}/people/{slug}`)
- `name`, `slug` · `role` L · `organization` · `photo` → media · `organizationLogo` → media · `bio` L · `linkedin` · `wpId`
- Join-Felder `articles` (über `posts.interviewees`) und `events` (über `events.speaker`).

**`topics`** (Themen)
- `title` L, `slug`, `description` L · `parent` → topics (leer = Haupt-Topic, nur zwei Ebenen) · `order` · Join `articles`
- Haupt-Topics: Business, Entrepreneurship, Finance & Economics, Politics. Zuordnung der alten Kategorien: [migration.md](migration.md).

**`issues`** (Ausgaben)
- `title` L · `tagline` L · `description` L · `foreword` L (Rich Text) · `cover` → media · `pdf` → media (nur PDFs) · `editors` → team-members · Join `articles` (über `posts.issue`)
- Seitenleiste: `slug` · `year` · `format` (digital = eigene Seite, pdf = Archiv) · `wpId`

**`events`** (Speaker Events)
- Reiter Event: `speaker` → people (Pflicht) · `title` L (optional, sonst Name des Speakers) · `startsAt` · `language` (en/de: Sprache des Talks, im Feed als `English`/`German`) · `location` · `description` L
- Reiter Bewerbung: `applicationForm` → forms · `applicationFor` (`dinner` = Talk offen, Bewerbung nur fürs Dinner, Standard; `event` = Bewerbung für den Talk) · `applicationOpensAt` · `applicationDeadline` ([formulare.md](formulare.md))
- Reiter Nach dem Event: `gallery` → media (mehrfach) · `recap` → posts
- `slug` übernimmt alte IDs wie `weimer`. Kommend/vergangen wird aus `startsAt` berechnet.

**`team-members`** (Redaktion, About-Seite)
- `name` · `photo` → media · `group` (`editorial-board`, `editors`, `advisory`) · `position` L · `study` L · `university` · `active` · `order`

**`pages`** (About, Contact, Imprint, Privacy, URL `/{l}/{slug}`)
- `title` L · `layout` L aus Blöcken `richText`, `teamGrid`, `contactForm`, `imageText` (Bild links, rechts oder volle Breite), `cta` (`src/blocks/layout.ts`) · `slug` · `meta` L
- Im Admin: Reiter Inhalt | SEO.

**`media`** (Bilder und PDFs, öffentliche URL `/files/{filename}`)
- `alt` L · `caption` L · `credit` · `legacyPath` (alter Pfad unter `wp-content/uploads/`) · `wpId`
- Bildgrössen: `thumbnail` (400×300), `card` (800), `hero` (1600), `og` (1200×630). Fokuspunkt einstellbar.
- Keine Entwürfe: Dateien sind erst sichtbar, wenn ein veröffentlichter Inhalt sie verwendet.

## Newsletter

**`newsletters`** (URL `/{l}/newsletter/{slug}`, Details: [newsletter.md](newsletter.md))
- Reiter Inhalt: `title` L · `subject` L · `previewText` L · `intro` L · `content` L · `featuredPosts` → posts
- Reiter Versand: `audience` (newsletter, events) · `scheduledFor` (optional, nur Admin/Board, [ADR 0013](entscheidungen/0013-newsletter-versand.md)) · `status` (draft, sending, sent, failed; nur vom System gesetzt) · `sentAt` · `recipientCount` · `progress` (Pakete, Fehler; nur lesen)
- Reiter Archiv: `showInArchive` (Standard an) · `archiveDelayDays` (Standard 30, 0 = sofort) · `archiveVisibleFrom` (berechnet aus `sentAt` + Verzögerung)
- Versionen ohne Entwürfe: veröffentlicht wird ein Newsletter durch den Versand.

**`subscribers`** (nicht öffentlich)
- `email` (eindeutig, klein geschrieben) · `firstName` · `locale` · `interests` (newsletter, events) · `status` (pending, confirmed, unsubscribed, bounced, complained)
- `consentAt`, `confirmedAt`, `unsubscribedAt` · `source` (footer, popup, newsletter-page, mailpoet-import, admin)
- `confirmToken`, `preferencesToken`: versteckt, über die API nie lesbar.

## Formulare (Plugin `form-builder`)

- **`forms`**: Felder Text, E-Mail, Textfeld, Auswahl, Checkbox, Zahl, Land, Hinweistext und **Datei-Upload** (eingebauter Feldtyp `upload` des Plugins, Ziel immer `application-files`, [ADR 0012](entscheidungen/0012-bewerbungsdateien.md)). Zusatzfeld `retentionMonths` (Standard 6).
- **`form-submissions`**: `form`, `submissionData`, `submissionUploads` (Dateien) und Zusatzfeld `event` → events. Ein Feld `status` für den späteren Auswahlprozess lässt sich hier ergänzen.
- **`application-files`**: Lebensläufe, nur PDF (Prüfung der Dateisignatur), max. 4 MB, privat ([ADR 0012](entscheidungen/0012-bewerbungsdateien.md)).

## Weitere Plugin-Collections

- `redirects`: Einzelfälle, die die Redaktion anlegt (Ziel: Artikel, Seiten, Ausgaben, Events, Personen, Themen oder URL).
- `search`: Suchindex für Artikel, Ausgaben, Events, Personen, pro Sprache, mit `slug` und `excerpt`.
- `exports`, `imports`: Import/Export-Plugin. Export für Artikel, Personen, Ausgaben, Events, Themen, Team, Abonnenten und Einsendungen. Import ist ausgeschaltet.
- `payload-mcp-api-keys`: API-Keys für MCP, nur Admin. Bleibt im Schema, auch wenn MCP aus ist.
- `payload-jobs`: Hintergrund-Jobs ([architektur.md](architektur.md)).

## Intern

- `rate-limits`: Zähler pro gehashter IP und Zweck ([ADR 0005](entscheidungen/0005-rate-limit-postgres.md)), im Admin versteckt.
- `users`: `name`, `email`, `role` (admin, board, editor, advisory; [rollen.md](rollen.md)), `teamMember` → team-members. Der allererste Benutzer wird automatisch Admin.

## Globals

- `homepage`: `currentIssue` → issues (leer = neueste digitale Ausgabe) · `pinnedPosts` → posts (max. 4) · `showTopicSection`
- `header`: `navItems` (Label L, Link). Standard: Issues, Topics, Speaker Events, Newsletter.
- `footer`: `links` (Label L, Link) · `socialLinks` · `newsletterText` L · `espritNote` L
- `site-settings`: `defaultSeo` (Titel L, Beschreibung L, Bild) · `contactEmail` · `address` · `socialProfiles` · `newsletterPopup` (an/aus, Verzögerung in Sekunden, Standard 10)

## Bewusst nicht im Modell

- Börsenticker, Instagram-Feed, Seitenaufrufe, Übersetzungen, Auswahlprozess für Bewerbungen (kommt später).
