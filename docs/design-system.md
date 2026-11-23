---
description: Design der SGBR-Website: eckiges Zeitungsdesign, Tokens, Typo-Skala, Komponentensystem, Animationen, Dark Mode und Startseite
aktualisiert: 2026-11-23
---

# Design

Ziel: Layout und Look der heutigen Seite übernehmen, sauber in Tailwind CSS 4 umsetzen. Quelle der Werte: CSS des Child-Themes `fox-child-theme/style.css`, abgerufen 2026-11-22.

## Tokens

| Token | Wert | Verwendung heute |
| --- | --- | --- |
| `--color-navy` | `#0B3C6D` | Hauptfarbe, Links, Buttons |
| `--color-navy-dark` | `#082C52` | Hover |
| `--color-petrol` | `#152E3A` | dunkle Flächen, Footer |
| `--color-ink` | `#1A1A1A` | Text |
| `--color-muted` | `#7A7A7A` | Metadaten |
| `--color-line` | `#E3E7ED` | Linien |
| `--color-band` | `#F4F6F9` | helle Bänder (Events) |
| `--font-sans` | Inter 400–700 | Fliesstext, Navigation |
| `--font-serif` | Cormorant Garamond 400–700 | Überschriften |
| `--radius-card` | 16px | Karten, Overlays |
| Breiten | 1440px Seite, 840px Lesebreite | |

- Werte vor dem Bau einmal im Browser mit den berechneten Styles abgleichen. Das Fox-Theme setzt eigene Werte (z. B. Akzent `#DB4A37`), welche davon sichtbar sind, ist aus dem CSS allein nicht sicher.

## Dark Mode

Entschieden 2026-11-22: Dark Mode gibt es, **hell ist Standard**, auch wenn das System dunkel eingestellt ist.

- Umschalter (Sonne/Mond) im Kopf und im Menü-Drawer. Wahl in `localStorage` speichern, beim Laden vor dem ersten Zeichnen setzen (kein Aufblitzen).
- Umsetzung über semantische Tokens (`--color-bg`, `--color-surface`, `--color-text`, `--color-muted`, `--color-line`, `--color-accent`), Komponenten nutzen nur diese. Tailwind-Variante `dark` über eine Klasse am `<html>`.
- Vorschlag Dunkel-Werte, im Entwurf prüfen: Hintergrund `#0E1A21`, Flächen `#152E3A` (Petrol), Text `#E8ECF1`, Metadaten `#9AA4AF`, Linien `rgba(255,255,255,0.12)`, Akzent `#6FA3D8` (helleres Navy, damit Links lesbar sind).
- Bilder bleiben unverändert. Logos von Firmen auf einer hellen Fläche zeigen, sonst verschwinden dunkle Logos.
- Kontrast nach WCAG AA in beiden Modi prüfen.
- Newsletter-Mails immer hell.

## Vorgaben aus dem Call 2026-11-21

Details: call-2026-11-21.md.

- Zeitungsdesign behalten, aufräumen. Vorbild für die Startseite: Harvard Business Review.
- Nur die zwei Schriften oben, keine weiteren.
- Kein seitlicher Rahmen. Lesebreite der Artikel etwas breiter als heute (Startwert etwa 920px statt 840px), nicht ultrabreit. Im Entwurf ausprobieren.
- Einheitliche Bildsprache auf Startseite und Karten: immer `heroImage`. Freigestellte Porträts (`issueImage`) nur auf Ausgabenseiten.
- Byline „Interview with {Person}“ im Kopf, keine doppelte Autorenbox unten.

## Startseite

1. Aktuelle Ausgabe gross (Bild, Titel, Tagline) links, rechts die neuesten Artikel mit Kurzzusammenfassung.
2. Speaker Events: kommende Events als Karten, darunter Fotos vergangener Events.
3. The Magazine: aktuelle Ausgabe plus Cover-Reihe des Archivs.
4. Optional: je Haupt-Topic der neueste Artikel.
5. Newsletter-Anmeldung.

## Komponenten

- Kopf: Logo, Navigation (Issues, Topics, Speaker Events, Newsletter), Suche als Overlay, Sprachumschalter EN/DE, Hell/Dunkel-Umschalter, Menü-Drawer mit About, Contact, Social Links.
- Artikelkarten: gross, mittel, Liste. Immer mit `summary`, nie mit Textanfang.
- Artikelseite: Hero-Bild, Titel, Byline, Text in Lesebreite, Frage/Antwort-Block, Navigation vorher/nachher.
- Topics-Seite: Übersicht und Themenseiten im selben Aufbau: Suche im Text, Filter nach Art, Themen als Chips mit Anzahl, Unterthemen als Textlinks, Artikelraster, Seitenzahlen.
- Ausgaben: Raster mit Cover, Jahr, Tagline, „Read the issue“ oder PDF. Ausgabenseite mit Vorwort und Interview-Karten mit freigestellten Porträts.
- Events: Zeilen mit Datumsblock, Name, Rolle, Firma, Zeit und Ort mit Icons, Firmenlogo; „Past Events“ mit Fotos und Recap-Link. Eventseite mit Logo im Kopf, Infozeile mit Icons und Button „Fürs Dinner bewerben“ bzw. „Für den Talk bewerben“, solange die Bewerbung offen ist.
- Personenseite: Foto, Rolle, alle Interviews und Events.
- Newsletter-Seite: eine Spalte, zentriert: Titel, ein Satz, Formular mit Interessen-Kacheln, darunter frühere Newsletter.
- About: Mission, Teamfoto, Personenraster nach Gruppe.
- Footer: Newsletter-Formular, Seitenlinks, ESPRIT-Hinweis.

## Was wegfällt

- **Marktleiste:** die Zeile ganz oben mit S&P 500, DAX, Nikkei 225, Hang Seng und EUR/USD. Sie holt Kurse über einen eigenen Endpunkt und zeigt heute nur „–“, weil der Endpunkt einen Fehler liefert. Für ein Interview-Magazin ohne Mehrwert, braucht aber einen Kurs-Datendienst.
- **Instagram-Feed:** Plugin „Smash Balloon Instagram Feed“ ist installiert, auf den geprüften Seiten wird aber kein Feed angezeigt. Ein Link aufs Instagram-Profil reicht.

## Umsetzung (Stand 2026-11-23, [ADR 0018](entscheidungen/0018-design-ueberarbeitung.md))

Ein ruhiges, eckiges Zeitungsdesign nach dem Muster von NYT (Raster, Linien), FAZ (Dachzeile, Nüchternheit) und HBR (grosse Titel, klare Listen). Die alte Seite war zusammengewürfelt; die neue nutzt **ein** Komponentensystem.

### Grundregeln

- **Eckig:** keine abgerundeten Ecken (alle Radius-Tokens sind 0). Trennung über Linien statt Boxen: Haarlinie `border-line`, kräftige Linie `rule-top` (2 px, `--color-rule`) über Rubriken.
- **Schriften:** Überschriften in **Source Serif 4** (600, leicht eng gesetzt), alles andere in **Inter**, auch der Artikeltext. Nur diese zwei (`src/lib/fonts.ts`).
- **Logo:** die SGBR-Wortmarke als SVG (`src/components/layout/Logo.tsx`, `currentColor`: Navy hell, Weiss dunkel und im Footer). Dateien für Mails und OG in `public/logo-sgbr.svg` und `public/logo-sgbr-white.svg`, Favicon `src/app/icon.png`.
- **Farben:** Hauptfarbe `#17415B` (Logofarbe). Komponenten nutzen nur semantische Tokens: `bg`, `surface`, `band`, `text`, `muted`, `line`, `rule`, `accent`, `accent-hover`, `on-accent`, `danger`. Dunkle Werte unter `.dark` (auch verschachtelt, z. B. der Footer). Keine fest weissen Flächen, ausser hinter Firmenlogos.
- **Breiten:** `container-page` (1280 px), `container-wide` (1040 px, grosse Bilder), `container-reading` (720 px, Lesetext).

### Typo-Skala (Utilities in `globals.css`)

| Klasse | Verwendung |
| --- | --- |
| `display` | kurze Seitentitel (Übersichten) |
| `headline-xl` | lange Titel: Artikel, Events |
| `headline-lg` / `headline-md` / `headline-sm` | Aufmacher, Rubrikentitel, Listen |
| `kicker` | Dachzeile: Inter, 11 px, Versalien, gesperrt, Akzentfarbe |
| `meta` | Byline, Datum, Hinweise: Inter 13 px, muted |
| `lead` | Vorspann |

### Komponenten

| Komponente | Datei | Hinweise |
| --- | --- | --- |
| Kopf | `src/components/layout/SiteHeader.tsx` | Datum, Werkzeuge (Suche, Sprache als Dropdown, Hell/Dunkel, Menü), Logo zentriert, Rubrikenleiste mit Linien; kompakter Sticky-Header beim Scrollen (`StickyHeader.tsx`) |
| Footer | `SiteFooter.tsx` | dunkel mit weissem Logo, Newsletter-Zeile, drei Linkspalten |
| Artikel-Teaser | `cards/ArticleCard.tsx` | Varianten `lead`, `standard`, `horizontal`, `compact` (mit Rangnummer); immer Dachzeile, Titel, Kurzzusammenfassung, Byline |
| Themen | `topics/TopicsExplorer.tsx` | Übersicht und Themenseite in einem Aufbau, damit nichts springt: Suche, Art, Themen-Chips, Raster |
| Event | `events/EventRow.tsx` | Datumsblock (zentriert), Speaker mit Zeit und Ort (Icons), Logo auf fester Fläche (`LogoPlate`); alle Spalten vertikal mittig; überall gleich |
| Seitenzahlen | `ui/Pagination.tsx` | höchstens 5 Zahlen um die aktuelle Seite, Pfeile für vor/zurück (`src/lib/pagination.ts`) |
| Ausgabe | `cards/IssueCard.tsx` | Cover oder typografischer Platzhalter mit Logo |
| Rubrik | `ui/Section.tsx` | `SectionHeader` (2 px Linie, Titel, „Alle …“), `PageTitle` (ohne eigene Linie und ohne Beschreibung, damit nie zwei Linien übereinander stehen), `ArrowLink`, `BackLink` |
| Buttons | `ui/Button.tsx` | `primary`, `secondary`, `ghost`, eckig, mit Ladezustand; `iconButtonClass` für Icon-Buttons (Hover-Fläche) |
| Icons | `ui/icons.ts` | alle aus **Phosphor** (`@phosphor-icons/react`, Gewicht regular), einzeln importiert; keine eigenen SVGs, keine Pfeil-Zeichen im Text ([ADR 0019](entscheidungen/0019-icons-phosphor.md)) |
| Social Links | `ui/SocialLinks.tsx` | Icon + Name (LinkedIn, Instagram, YouTube, X, Spotify), Footer und Menü |
| Formularfelder | `forms/fields/index.tsx` | Eingabe, Auswahl, Textfeld, Checkbox, Interessen-Kacheln, PDF-Upload mit Drag & Drop |
| Suche | `layout/SearchOverlay.tsx`, `[locale]/search`, `search/SearchResult.tsx` | Overlay mit Schliessen-Icon und Live-Vorschlägen (Pfeiltasten), Suchseite mit Filter nach Art; Treffer überall gleich: Icon der Art, Art, Titel, Auszug, Hervorhebung |

### Regeln für Linien und Raster

- Linien liegen immer **innerhalb** von `container-page` (nie auf dem Container selbst), damit alle Linien gleich breit sind.
- Spalten mit Trennlinien bekommen alle dasselbe Innenpolster (`px-6`, aussen `-mx-6`), damit Bilder gleich gross sind.
- Listen trennen nur zwischen den Einträgen (`divide-y`), direkt unter einem `SectionHeader` steht keine zweite Linie.
- Alles Klickbare zeigt den Hand-Cursor (Basisregel in `globals.css`).

### Bewegung

- Sanft und kurz: Hover (Unterstreichung bei Titeln, leichter Bild-Zoom), Dropdowns und Dialoge blenden ein, der Drawer gleitet von rechts, Abschnitte blenden beim Scrollen ein (`ui/Reveal.tsx`).
- Ohne JavaScript bleibt alles sichtbar (`.js`-Klasse), `prefers-reduced-motion` schaltet alle Animationen ab.

### Dark Mode

- Hell ist Standard. Umschalter im Kopf, Wahl in `localStorage`, gesetzt vor dem ersten Zeichnen (`ThemeScript.tsx`). `?theme=dark` oder `?theme=light` in der URL setzt die Wahl (für Prüfungen und Screenshots).
