---
description: Design-Überarbeitung nach Feedback: eckig, Source Serif 4 für Überschriften, SGBR-Logo, ein Komponentensystem nach NYT/FAZ/HBR
---

# 0018: Design-Überarbeitung

- Datum: 2026-11-23
- Status: angenommen (ersetzt die Gestaltung aus Phase 4)

## Kontext

Der erste Entwurf wirkte generisch: runde Ecken, eine zu luftige Überschriften-Schrift (Cormorant Garamond), uneinheitliche Komponenten (Event-Karten mit Emoji und schiefem Logo, weisse Newsletter-Box im Dark Mode), unruhige Abstände auf der About-Seite.

## Entscheidung

- Eckiges Zeitungsdesign mit Linien statt Boxen, angelehnt an NYT (Raster, Spaltenlinien, Masthead, Sticky-Header), FAZ (Dachzeile über dem Titel) und HBR (grosse Titel, nummerierte Liste „Neueste“).
- Überschriften in Source Serif 4, alles andere in Inter (auch der Artikeltext).
- Das echte SGBR-Logo (SVG der alten Seite) im Kopf, Footer, Drawer, Popup und auf Cover-Platzhaltern.
- Ein Komponentensystem (`docs/design-system.md`), keine Übernahme der zusammengewürfelten alten Komponenten.
- Sprache als Dropdown, sanfte Animationen mit Rücksicht auf `prefers-reduced-motion`.
- Formulare: einheitliche Felder, Semester als Auswahl, PDF-Upload mit Drag & Drop.
- Admin: SEO als eigener Reiter bei Artikeln, Seiten, Ausgaben und Events (`src/fields/seoTab.ts`, Schema unverändert). Bildblock auf Seiten mit Option „volle Breite“ (Migration `20261123_091437_design_ueberarbeitung`).
