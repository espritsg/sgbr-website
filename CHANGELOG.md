# Changelog

Alle wichtigen Änderungen an diesem Projekt. Format nach [Keep a Changelog](https://keepachangelog.com/de/1.1.0/), Versionen nach [Semantic Versioning](https://semver.org/lang/de/).

## [Unveröffentlicht]

### Geändert (2026-11-23, Feinschliff)

- Alle Icons aus Phosphor, Social Links mit Icons (LinkedIn, Instagram …), Hand-Cursor und Hover-Fläche auf allen Buttons, kein Hover-Effekt mehr am Logo.
- Suche: Schliessen nur als Icon, Treffer mit Icon der Art in Overlay und Suchseite gleich.
- Startseite: kleinere Titel, Event-Zeilen vertikal mittig mit Icons und Firmenlogo, gleich grosse Bilder bei den Themen, Newsletter-Band zentriert, Footer mit eigener Newsletter-Zeile.
- Übersichtsseiten ohne Beschreibungstext und ohne doppelte Linien.
- Themen: Übersicht und Themenseiten im selben Aufbau mit Suche, Filter nach Art und Themen-Chips mit Anzahl.
- Seitenzahlen: höchstens fünf, mit Pfeilen.
- Eventseite: Logo im Kopf, Infozeile mit Icons, Bewerben-Button; neues Feld „Bewerbung für“ (Dinner oder Talk, Migration).
- Newsletter-Seite einspaltig und kürzer.
- Artikel: kleinerer Titel, Personenbox mittig ausgerichtet, alle Trennlinien gleich breit.

### Geändert (2026-11-23)

- Design überarbeitet: eckiges Zeitungsdesign, Source Serif 4 für Überschriften, SGBR-Logo, ein Komponentensystem (Artikel-Teaser, Event-Zeilen, Ausgaben), Startseite im Raster mit Spaltenlinien, Sticky-Header, Sprache als Dropdown, sanfte Animationen, Dark Mode ohne weisse Flächen.
- Suche mit Live-Vorschlägen im Overlay und Filtern auf der Suchseite.
- Formulare: einheitliche Felder, Semester als Auswahl, PDF-Upload mit Drag & Drop, Newsletter-Anmeldung mit Interessen-Kacheln.
- About- und Kontaktseite neu aufgebaut, Bildblock mit Option „volle Breite“ (Migration).
- Admin: SEO als eigener Reiter bei Artikeln, Seiten, Ausgaben, Events; Mail-Vorschau als „nur lokal“ benannt und erklärt.

### Hinzugefügt

- Grundgerüst mit Next.js 16, Payload 3.94, Postgres (Docker), Tailwind CSS 4 und next-intl (`/en`, `/de`).
- Admin-Oberfläche standardmässig auf Deutsch, Inhalte in Englisch und Deutsch mit gegenseitigem Fallback.
- Datenmodell: Artikel, Personen, Themen, Ausgaben, Events, Team, Seiten, Medien, Newsletter, Abonnenten, Bewerbungsdateien, Globals (Startseite, Kopf, Fuss, Einstellungen).
- Plugins: SEO, Weiterleitungen, Suche, Form Builder (mit Datei-Upload und Aufbewahrungsfrist), Import/Export, MCP (standardmässig aus), Vercel Blob (öffentlich und privat).
- Vier Rollen mit zentralen Zugriffsregeln und Tests; Editors sehen keinen Veröffentlichen-Button.
- Dev-Import von der öffentlichen Website (`npm run import:dev`) mit Testdaten und je einem Benutzer pro Rolle.
- Gemeinsame Zuordnungslogik für Dev-Import und finale Migration, Kategorien-Zuordnung als Vorschlag.
- Frontend: Startseite nach HBR-Vorbild, Artikel, Themen, Ausgaben, Events, Personen, Seiten, Suche, 404; Hell/Dunkel; EN/DE-Umschalter.
- Live Preview, Admin-Leiste, Vorschau für Entwürfe; Datei-Route `/files/…` und Weiterleitung alter Upload-Links.
- Newsletter: Double-Opt-in, Einstellungen und Abmeldung ohne Login, One-Click-Abmeldung, Resend-Webhook, Versand in Paketen mit Idempotency-Keys und Fortsetzen, Testversand, geplanter Versand, verzögertes Archiv.
- Lokale Mail-Vorschau unter `/admin/mail-preview`.
- Formulare und Event-Bewerbungen: PDF-Upload in privaten Speicher, Honeypot, Rate-Limit, Zeitfenster am Event, automatische Löschung nach Frist.
- Weiterleitungen aller alten WordPress-URLs (308), Prüfskript `npm run check:redirects`.
- JSON-Feeds für espritsg.ch im alten Format mit Vertragstest.
- Sitemap, robots.txt, RSS pro Sprache, hreflang und canonical; Vercel Web Analytics; MCP (standardmässig aus).
- Hintergrund-Jobs: tägliche Wartung und geplantes Veröffentlichen über einen Vercel Cron, Protokoll im Admin, `npm run jobs`.
- Basis-Migration der Datenbank, Build für Vercel mit `payload migrate`, `vercel.json`.
- Finale Migration aus WordPress-Exporten (`npm run migrate:wp`): WXR, MailPoet, Redirection, Uploads; getestet mit synthetischer Beispieldatei.
- Weiterleitungen aus dem Admin (Plugin redirects) greifen für unbekannte Pfade.
- Dev-Import: Links werden bereinigt, fehlerhafte Artikel landen im Bericht statt den Lauf abzubrechen; alle 198 Artikel importierbar, alle 210 alten URLs der Sitemap enden bei 200.
- Doku in `docs/`, Regeln für Agents in `AGENTS.md`, CI mit Lint, Typecheck, Tests und Build.
