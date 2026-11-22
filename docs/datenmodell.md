---
description: Payload-CMS-Datenmodell der neuen SGBR-Website: Collections, Felder, Lokalisierung, Globals, Zugriffsrechte und Herkunft der Daten aus WordPress
aktualisiert: 2026-11-22
---

# Datenmodell

**L** = lokalisiert (en/de). Felder ohne L gelten für beide Sprachen. Inhalts-Collections haben Entwürfe, Versionen und geplantes Veröffentlichen. Wünsche aus dem Call sind eingearbeitet.

## Collections

**`posts`** (Artikel, aus 198 WP-Beiträgen, URL `/{l}/article/{slug}`)
- `type` (interview, guest-article) · `title` L · `summary` L (Pflicht, 1–2 Sätze für Karten) · `summaryNeedsReview` (Checkbox, von der Migration gesetzt) · `content` L (Lexical mit Blöcken `QA`, `Quote`, `Embed`, `PdfDownload`)
- `slug` eindeutig, aus WP · `publishedAt` · `originalLanguage` (en/de, Pflicht)
- `heroImage` → media (Artikel und Karten) · `issueImage` → media (optional, freigestellt für die Ausgabenseite)
- `interviewees` → people (mehrfach): Byline „Interview with …“
- `interviewers` → team-members (mehrfach, optional)
- `topics` → topics (mehrfach, mindestens ein Haupt-Topic, per Validierung) · `issue` → issues
- `meta` L (SEO) · `wpId` (nur lesen, für wiederholbare Migration)

**`people`** (Interviewpartner und Speaker, aus ~196 WP-Benutzern)
- `name`, `slug` · `role` L · `organization` · `photo` → media · `organizationLogo` → media · `bio` L · `linkedin`
- Join-Felder: Artikel und Events dieser Person (Personenseite)

**`topics`** (aus 38 WP-Kategorien)
- `title` L, `slug`, `description` L · `parent` → topics (leer = Haupt-Topic) · `order`
- Haupt-Topics: Business, Entrepreneurship, Finance & Economics, Politics. Rest als Unter-Topics oder streichen.
- Zuordnung der 38 alten Kategorien schlägt Claude Code als Tabelle in der Repo-Doku vor (Annahme). Die Redaktion bestätigt sie am Entwurf.

**`issues`** (Ausgaben)
- `title` L, `slug`, `year`, `format` (digital, pdf) · `tagline` L · `description` L · `foreword` L
- `cover` → media · `pdf` → media · `editors` → team-members
- Join-Feld: zugehörige Artikel (zeigt deren `issueImage`)

**`events`** (Speaker Events)
- `slug` (alte IDs wie `weimer` übernehmen) · `speaker` → people · `title` L (optional) · `startsAt` · `location` · `language` (English, German: Sprache des Talks) · `description` L
- Bewerbung: `applicationForm` → forms · `applicationOpensAt` · `applicationDeadline` (Details: [formulare.md](formulare.md))
- `gallery` → media (mehrfach, Fotos nach dem Event) · `recap` → posts
- Kommend/vergangen wird aus `startsAt` berechnet.

**`newsletters`** (Versand und Archiv, URL `/{l}/newsletter/{slug}`, Details: [newsletter.md](newsletter.md))
- `title` L, `slug` · `subject` L · `previewText` L · `intro` L · `content` L (Gastbeiträge, Ankündigungen) · `featuredPosts` → posts
- `audience` (newsletter, events) · `status` (draft, sending, sent, failed) · `sentAt` · `recipientCount` · Versandfortschritt und Fehler (nur lesen)
- `archiveDelayDays` (Standard 30) · `showInArchive` (Standard an)

**`subscribers`** (Abonnenten, nicht öffentlich)
- `email` eindeutig · `firstName` · `locale` · `interests` (newsletter, events) · `status` (pending, confirmed, unsubscribed, bounced, complained)
- `consentAt`, `confirmedAt`, `unsubscribedAt` · `source` (footer, popup, newsletter-page, mailpoet-import) · Tokens für Bestätigung und Einstellungen (versteckt)

**`team-members`** (Redaktion)
- `name`, `photo` → media · `group` (Editorial Board, Editors, Advisory) · `position` L · `study` L · `university` · `active`, `order`

**`pages`** (About, Contact, Imprint, Privacy)
- Contact mit Kontaktformular (Form Builder) und Adresse. Imprint: Text der alten Seite übernehmen.
- Privacy: bestehenden Text übernehmen und Abschnitte zu Newsletter, Formularen mit Lebenslauf und Vercel Analytics als Entwurf ergänzen. Vor dem Livegang rechtlich prüfen lassen.
- `title` L, `slug` · `layout` L aus Blöcken `RichText`, `TeamGrid`, `ContactForm`, `ImageText`, `Cta` · `meta` L

**`media`** (902 Bilder plus PDFs)
- Bilder und PDF · `alt` L, `caption` L, `credit` · `legacyPath` (alter Pfad unter `wp-content/uploads/`, für Weiterleitungen)

**`application-files`** (Lebensläufe aus Bewerbungen, privat)
- PDF bis 5 MB · Bezug zur Einsendung · nie öffentlich abrufbar

**`users`**: `name`, `email`, `role` (admin, board, editor, advisory, Details: [rollen.md](rollen.md)) · optional `teamMember` → team-members

Von Plugins: `redirects`, `forms` (plus Feld `retentionMonths`, Standard 6), `form-submissions` (plus Feld `event` → events), `search` (Artikel, Ausgaben, Events, Personen).

## Globals

- `header`: Navigation (Issues, Topics, Speaker Events, Newsletter), Label L
- `footer`: Links, Social Links, Newsletter-Text L, ESPRIT-Hinweis L
- `homepage`: `currentIssue` → issues, optional angepinnte Artikel. Der Rest füllt sich automatisch (neueste Artikel, kommende Events, Archiv).
- `site-settings`: Standard-SEO L, Kontakt-E-Mail, Adresse, Social-Profile, Newsletter-Popup an/aus

## Zugriff

- Siehe [rollen.md](rollen.md). Öffentlich nur Veröffentlichtes lesen, Abonnenten und Einsendungen nur über die Formulare anlegen.

## Schnittstelle für espritsg.ch

- Gleiche Feed-URLs und exakt gleiches JSON wie heute, das Plugin bleibt unverändert. Spec: [esprit-feed.md](esprit-feed.md).
- Nur veröffentlichte Daten. Die ESPRIT-Website soll später ebenfalls neu gebaut und an Payload angebunden werden.

## Bewusst nicht im Modell

- Börsenticker, Instagram-Feed, Seitenaufrufe, Übersetzungen, Auswahlprozess für Bewerbungen (kommt später).
