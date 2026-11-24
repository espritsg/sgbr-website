# Changelog

Alle wichtigen Änderungen an diesem Projekt. Format nach [Keep a Changelog](https://keepachangelog.com/de/1.1.0/), Versionen nach [Semantic Versioning](https://semver.org/lang/de/).

## [Unveröffentlicht]

### Geändert (2026-11-24)

- Startseite: Gibt es weniger als drei kommende Speaker Events, füllen die letzten vergangenen die Reihe auf (markiert als „Vergangenes Event“ mit Jahr).

### Geändert (2026-11-23, Admin und Mails)

- Admin: SGBR-Logo auf der Anmeldeseite, SGBR-Zeichen im Menü und als Favicon; Mail-Vorschau zusätzlich als Karte im Dashboard.
- Eine Mail-Vorlage im SGBR-Stil (Logo als PNG, eckig, Navy, dunkler Fuss) für Newsletter, Anmeldebestätigung und jetzt auch Formular-Mails.
- Börsenkurse: auf grossen Bildschirmen über die ganze Breite verteilt, bei wenig Platz langsame Laufschrift, immer weich ausgeblendet an beiden Rändern; Datum mit kurzem Wochentag.
- Admin-Zeichen im Menü ist das Favicon und wird nicht mehr abgeschnitten.

### Geändert (2026-11-23, dritte Runde)

- Börsenkurse im Kopf zwischen Datum und Werkzeugen wie auf der alten Seite (S&P 500, DAX, Nikkei 225, Hang Seng, EUR/USD), neuer Endpunkt `/api/market` ([ADR 0020](docs/entscheidungen/0020-boersenkurse.md)).
- Eventseite: kein Bewerben-Button mehr im Kopf, nur noch unter dem Text.
- Themen: „Nach Unterthema filtern“ in eigener Zeile über den Unterthemen.
- Footer-Newsletter: Einwilligung so breit wie Feld und Button zusammen.
- Themen-Menü vereinfacht: kleines Dropdown mit den vier Haupt-Themen in der Schrift der Navigation.
- Eigene Auswahlfelder statt der Browser-Selects (Themenfilter, Formulare), Zahlenfelder ohne Pfeile.
- Börsenkurse: kräftigeres Grün, bleiben einzeilig und blenden rechts aus, wenn der Platz nicht reicht.
- Eventseite: Bewerbungsfrist unter dem Button.

### Geändert (2026-11-23, zweite Runde)

- Bewerbungen als Pop-up, Button im Kopf und unter dem Text der Eventseite; Link auf `#apply-form` öffnet das Formular direkt.
- Kommende Events als Karten nebeneinander, vergangene als Liste; Karten und Zeilen ganz klickbar.
- Themen und Unterthemen als gleiche Chips; Seitenzahlen ohne „Seite x von y“.
- Linien vereinheitlicht (schwarz nur im Masthead, 2 px nur über Rubriken, sonst grau), Newsletter-Block auf der Startseite entfernt (steht im Footer), Footer-Newsletter zentriert mit Abstand zwischen Feld und Button.
- Suche ohne das Browser-X, stattdessen „Leeren“; Menü-Drawer in derselben Schrift wie die Navigation.

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
