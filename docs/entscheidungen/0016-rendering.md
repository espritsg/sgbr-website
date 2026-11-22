---
description: Website-Seiten werden bei jedem Aufruf gerendert (kein ISR), weil Sichtbarkeit von Zeit und Vorschau abhängt
---

# 0016: Dynamisches Rendern

- Datum: 2026-11-22
- Status: angenommen

## Kontext

Mehrere Inhalte hängen von der Uhrzeit ab: kommend/vergangen bei Events, das verzögerte Newsletter-Archiv, geöffnete Bewerbungen, morgendliches geplantes Veröffentlichen. Dazu kommen Vorschau (draftMode) und Live Preview.

## Entscheidung

- Alle Seiten unter `/[locale]` haben `export const dynamic = 'force-dynamic'` und lesen über die Local API von Payload.
- Abfragen laufen mit `overrideAccess: false`, so dass Besucher nur Veröffentlichtes sehen. Im Vorschaumodus (nur für eingeloggte Benutzer, `/next/preview`) auch Entwürfe.

## Folgen

- Keine veralteten Seiten und kein Cache-Leeren nötig.
- Jede Seite fragt die Datenbank ab. Bei der Grösse der Seite unkritisch. Wird es später zu langsam, lässt sich ISR mit `revalidatePath` in `afterChange`-Hooks ergänzen.
