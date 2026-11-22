---
description: Spec Benutzerrollen und Zugriffsrechte im Payload-Admin der SGBR-Website (Admin, Editorial Board, Editors, Advisory Board)
aktualisiert: 2026-11-22
---

# Rollen und Rechte

Entschieden 2026-11-22. Feld `role` in `users`, genau eine Rolle pro Person.

| Rolle | Wer | Kurz |
| --- | --- | --- |
| `admin` | technische Betreuung | darf alles |
| `board` | Editorial Board (Editor-in-Chief, Co-Editors) | Inhalte veröffentlichen, Newsletter senden |
| `editor` | neue Redaktionsmitglieder | Entwürfe schreiben, nicht veröffentlichen |
| `advisory` | Advisory Board, ehemalige | nur lesen |

## Rechte

| Bereich | admin | board | editor | advisory |
| --- | --- | --- | --- | --- |
| Inhalte (Artikel, Personen, Topics, Ausgaben, Events, Team, Seiten, Medien, Newsletter-Texte) | alles | alles inkl. veröffentlichen und löschen | anlegen, ändern, nur als Entwurf | lesen |
| Globals (Header, Footer, Startseite) | alles | ändern | lesen | lesen |
| Newsletter senden | ja | ja | nur Testversand | nein |
| Abonnenten | alles | lesen, exportieren | kein Zugriff | kein Zugriff |
| Formulare bauen | ja | ja | nein | nein |
| Einsendungen und Bewerbungs-Dateien | alles | lesen, exportieren | kein Zugriff | kein Zugriff |
| Weiterleitungen | ja | ja | nein | nein |
| `site-settings` | ja | lesen | nein | nein |
| Benutzer | anlegen, ändern, löschen | nur sich selbst | nur sich selbst | nur sich selbst |

- Benutzer legt nur der Admin an (entschieden 2026-11-22). Niemand ausser dem Admin kann seine eigene Rolle ändern.
- Editors: Der Button „Veröffentlichen“ darf gar nicht erscheinen, nicht nur beim Speichern scheitern. Geplantes Veröffentlichen ebenfalls gesperrt.
- Öffentlich (ohne Login): nur veröffentlichte Inhalte lesen; Abonnenten und Einsendungen nur anlegen (über die Formulare).
- Semesterwechsel: Admin setzt Ausscheidende von `board` oder `editor` auf `advisory`.
- Zugriffsregeln zentral in einer Datei definieren und mit Tests abdecken, damit spätere Änderungen nichts aufreissen.

## Umsetzung

- Alle Regeln stehen in `src/access/permissions.ts` (CRUD) und `src/access/actions.ts` (Newsletter senden, Testversand, Mail-Vorschau). Rollen in `src/access/roles.ts`.
- Tests: `tests/int/access.test.ts` prüft die Tabelle oben für jede Rolle und für Besucher ohne Login.
- **Kein Veröffentlichen für Editors:** Die Update-Regel lehnt `_status: 'published'` für Editors ab. Payload fragt genau diese Regel ab, um den Button „Veröffentlichen“ und „Veröffentlichung planen“ anzuzeigen. Beide erscheinen für Editors daher gar nicht. Der geplante Job läuft mit den Rechten der Person, die geplant hat.
- **Medien** haben keine Entwürfe: Editors laden Dateien hoch und ändern sie, löschen dürfen nur Admin und Board.
- **Newsletter:** Status, Versandzeit und Fortschritt setzt nur das System. `scheduledFor` (geplanter Versand) dürfen nur Admin und Board setzen.
- **Abonnenten** entstehen nur über die Anmeldung (Local API). Über die API kann niemand ausser dem Admin Abonnenten anlegen.
- **Site-Settings:** Die Website liest sie serverseitig über die Local API. Über die API lesen sie nur Admin und Board.
- **Benutzer:** Der allererste Benutzer (`/admin/create-first-user`) wird automatisch Admin. Neue Benutzer starten als `advisory`, bis der Admin eine Rolle setzt.
- **Hintergrund-Jobs** starten dürfen der Admin und der Vercel Cron (Header `Authorization: Bearer $CRON_SECRET`).
