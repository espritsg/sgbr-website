---
description: Design-Tokens aus dem CSS des Child-Themes übernommen, Abgleich im Browser vor dem Livegang; Muted-Farbe für Kontrast angepasst
---

# 0010: Design-Werte

- Datum: 2026-11-22
- Status: angenommen

## Kontext

Die Spec verlangt, die Werte vor dem Bau im Browser mit den berechneten Styles abzugleichen. Das ging im Bau nicht interaktiv.

## Entscheidung

- Werte aus `docs/design-system.md` übernommen, als Tokens in `src/app/(frontend)/globals.css`.
- `--color-muted` hell: `#6B6B6B` statt `#7A7A7A`. `#7A7A7A` auf Weiss hat nur etwa 4,3:1 und verfehlt WCAG AA für kleine Schrift knapp.
- Abgleich im Browser steht in der Checkliste in `docs/deployment.md`.
