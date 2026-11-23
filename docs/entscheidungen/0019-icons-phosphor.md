---
description: Alle Icons der Website aus Phosphor; Feld „Bewerbung für“ (Dinner oder Talk) an Events
---

# 0019: Icons aus Phosphor, Bewerbung fürs Dinner oder den Talk

- Datum: 2026-11-23
- Status: angenommen

## Kontext

Nach der Design-Überarbeitung ([ADR 0018](0018-design-ueberarbeitung.md)) waren die Icons uneinheitlich: eigene SVGs mit unterschiedlicher Strichstärke, Pfeile und Kreuze als Textzeichen (→, ✕, ✓). LinkedIn und Instagram standen nur als Wort da. Ausserdem bewirbt man sich bei den meisten Speaker Events nur fürs Dinner danach, der Talk selbst ist offen. Die Eventseite sagte nur „Apply“.

## Entscheidung

- **Phosphor** (`@phosphor-icons/react` 2.1) für alle Icons, Gewicht „regular“. Gewählt, weil es neben Bedien-Icons auch Marken-Icons (LinkedIn, Instagram, X, YouTube, Spotify) enthält: eine Bibliothek für alles. Lucide 1.x hat keine Marken-Icons mehr.
- Import einzeln über `src/components/ui/icons.ts` (Pfade `@phosphor-icons/react/dist/ssr/<Name>`). Die SSR-Variante braucht keinen React-Context und funktioniert in Server- und Client-Komponenten, im Bundle landen nur die genutzten Icons.
- Neues Event-Feld `applicationFor` (`dinner` als Standard, `event`). Es steuert Button und Hinweistext auf der Eventseite und die Markierung „Dinner: Bewerbung offen“ in den Event-Zeilen. Migration `20261123_151139_bewerbung_fuer`.

## Folgen

- Neue Icons nur über `icons.ts` ergänzen, keine eigenen SVGs (Ausnahme: das Logo).
- Bestehende Events haben nach der Migration „Dinner“. Wo man sich für den Talk bewirbt, stellt die Redaktion das Feld um.
