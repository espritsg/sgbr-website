---
description: Entwürfe und geplantes Veröffentlichen für alle Inhalts-Collections ausser Medien und Newslettern
---

# 0014: Entwürfe für Inhalte

- Datum: 2026-11-22
- Status: angenommen

## Kontext

Editors dürfen Inhalte „nur als Entwurf“ anlegen und ändern, auch Personen, Topics und Team. Ohne Entwürfe wären ihre Änderungen sofort öffentlich.

## Entscheidung

- Entwürfe, Versionen und `schedulePublish` für `posts`, `people`, `topics`, `issues`, `events`, `team-members`, `pages`. Autosave nur bei längeren Texten (`posts`, `issues`, `events`, `pages`).
- `media` ohne Entwürfe. Eine Datei ist erst öffentlich sichtbar, wenn ein veröffentlichter Inhalt sie verwendet.
- Die Website fragt mit `overrideAccess: false` ab, so dass Besucher nur Veröffentlichtes sehen, auch bei verknüpften Dokumenten.

## Folgen

- Board und Admin müssen auch neue Personen und Topics veröffentlichen, die ein Editor angelegt hat.
