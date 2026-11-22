---
description: Design der SGBR-Website als Tailwind-Tokens (Farben, Schriften, Breiten, Dark Mode) plus Startseite, Komponenten und was wegfällt
aktualisiert: 2026-11-22
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
- Topics-Seite: Haupt-Topics als Reiter, Unter-Topics als Filter.
- Ausgaben: Raster mit Cover, Jahr, Tagline, „Read the issue“ oder PDF. Ausgabenseite mit Vorwort und Interview-Karten mit freigestellten Porträts.
- Events: Karten mit Datum, Uhrzeit, Name, Rolle, Firma, Logo, Ort; „Past Events“ mit Fotos und Recap-Link. Eventseite mit Bewerbungsformular, solange die Bewerbung offen ist.
- Personenseite: Foto, Rolle, alle Interviews und Events.
- Newsletter-Seite: Anmeldung, Archiv.
- About: Mission, Teamfoto, Personenraster nach Gruppe.
- Footer: Newsletter-Formular, Seitenlinks, ESPRIT-Hinweis.

## Was wegfällt

- **Marktleiste:** die Zeile ganz oben mit S&P 500, DAX, Nikkei 225, Hang Seng und EUR/USD. Sie holt Kurse über einen eigenen Endpunkt und zeigt heute nur „–“, weil der Endpunkt einen Fehler liefert. Für ein Interview-Magazin ohne Mehrwert, braucht aber einen Kurs-Datendienst.
- **Instagram-Feed:** Plugin „Smash Balloon Instagram Feed“ ist installiert, auf den geprüften Seiten wird aber kein Feed angezeigt. Ein Link aufs Instagram-Profil reicht.

## Umsetzung

- Tokens in `src/app/(frontend)/globals.css` (`@theme`). Markenfarben (`navy`, `petrol`, …) plus semantische Tokens `bg`, `surface`, `band`, `text`, `muted`, `line`, `accent`, `accent-hover`, `on-accent`. Komponenten nutzen nur die semantischen Tokens, die Werte für Dunkel stehen unter `.dark`.
- Breiten als Utilities: `container-page` (1440px) und `container-reading` (920px Lesebreite für Artikel).
- Schriften über `next/font` in `src/lib/fonts.ts` (Inter, Cormorant Garamond).
- Dark Mode: `src/components/layout/ThemeScript.tsx` setzt die Klasse `dark` vor dem ersten Zeichnen, wenn `localStorage['sgbr-theme'] === 'dark'`. Ohne gespeicherte Wahl bleibt es hell, auch bei dunklem System. Umschalter im Kopf und im Menü-Drawer.
- Logos von Firmen und das Newsletter-Formular im Footer liegen auf einer weissen Fläche, damit sie in beiden Modi gleich aussehen.
- Muted hell ist `#6B6B6B` statt `#7A7A7A` (Kontrast AA, [ADR 0010](entscheidungen/0010-design-werte.md)).

## Komponenten im Code

| Komponente | Datei |
| --- | --- |
| Kopf, Sprache, Hell/Dunkel, Suche, Drawer | `src/components/layout/` |
| Artikel-, Ausgaben-, Eventkarten | `src/components/cards/`, `src/components/events/` |
| Byline „Interview with …“ | `src/components/ui/Byline.tsx` |
| Lexical-Text mit Frage/Antwort, Zitat, Embed, PDF | `src/components/richtext/` |
| Seitenblöcke (Text, Team, Formular, Bild+Text, CTA) | `src/components/blocks/RenderBlocks.tsx` |
| Formulare aus dem Form Builder | `src/components/forms/` |
| Newsletter-Anmeldung und Popup | `src/components/newsletter/` |
| Admin-Leiste, Live Preview | `src/components/preview/` |
