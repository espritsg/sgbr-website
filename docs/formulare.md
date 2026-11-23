---
description: Spec Formulare und Bewerbungen für Speaker Events auf der SGBR-Website (Form Builder, Lebenslauf-Upload, Sichtbarkeit, Datenschutz)
aktualisiert: 2026-11-22
---

# Formulare und Bewerbungen

## Formulare

- Plugin `@payloadcms/plugin-form-builder`. Admin und Editorial Board bauen Formulare selbst: Text, E-Mail, Textfeld, Auswahl, Checkbox, Zahl, Land, Hinweistext.
- Feldtyp **Datei-Upload** (PDF, z. B. Lebenslauf), max. **4 MB**. Version 3.94 des Plugins bringt ihn mit, kein Eigenbau nötig. 4 statt 5 MB wegen der Grenze von 4,5 MB pro Anfrage auf Vercel ([ADR 0012](entscheidungen/0012-bewerbungsdateien.md)).
- Pro Formular einstellbar: Bestätigungstext oder Weiterleitung, Bestätigungsmail an den Absender, Benachrichtigung an eine Adresse der Redaktion.
- Verwendet für: Bewerbungen auf Speaker Events, Kontaktformular, später weitere.
- Schutz: Honeypot-Feld und Begrenzung der Anfragen pro IP.

## Bewerbung auf Speaker Events

- Studierende bewerben sich auf ein Speaker Event.
- Das Formular öffnet sich als Pop-up (`src/components/forms/FormDialog.tsx`): Button unter dem Text der Eventseite (nicht im Kopf). Ein Link auf `/{l}/events/{slug}#apply-form` öffnet es direkt.
- Event-Felder dafür: `applicationForm` → forms, `applicationFor` (Dinner oder Talk: steuert Button-Text „Fürs Dinner bewerben“ / „Für den Talk bewerben“ und den Hinweistext), `applicationOpensAt`, `applicationDeadline`. Formular nur zwischen diesen Zeitpunkten sichtbar, sonst Hinweis „Bewerbung geschlossen“.
- Jede Einsendung speichert den Bezug zum Event.
- Im Admin vorerst nur die Liste der Einsendungen, filterbar nach Event, mit Export als CSV.
- Ein Auswahlprozess (Status, Zusagen, Mails) kommt später. Ablauf ist noch abzusprechen. Datenmodell so anlegen, dass ein Feld `status` leicht ergänzt werden kann.

## Sichtbarkeit und Datenschutz

- Einsendungen und hochgeladene Dateien sehen nur **Admin und Editorial Board**. Editors und Advisory Board nicht (entschieden 2026-11-22).
- Lebensläufe dürfen nicht öffentlich abrufbar sein. Eigene Upload-Collection `application-files` mit Zugriffsschutz. Geprüft: `@vercel/blob` 2.3 kann private Blobs, das offizielle Payload-Paket nicht. Deshalb ein eigener kleiner Adapter ([ADR 0012](entscheidungen/0012-bewerbungsdateien.md)).
- Formular zeigt einen Datenschutzhinweis mit Link.
- Aufbewahrung (entschieden 2026-11-22): Einsendungen und Dateien werden **6 Monate nach dem Event automatisch gelöscht**. Frist pro Formular änderbar (`retentionMonths`). Bei Formularen ohne Event zählt das Einsendedatum.
- Löschlauf täglich als Payload Job (siehe „Hintergrund-Jobs“ in [architektur.md](architektur.md)), mit Protokoll, wie viel gelöscht wurde.

## Umsetzung

| Teil | Datei |
| --- | --- |
| Plugin-Konfiguration (Feldtypen, `retentionMonths`, `event`) | `src/plugins/index.ts` |
| Schutz der Einsendungen (Honeypot, Rate-Limit, Event und Zeitfenster) | `src/lib/forms/submissionGuard.ts` |
| Zeitfenster der Bewerbung | `src/lib/events.ts` (`applicationState`) |
| Löschlauf nach Frist | `src/lib/forms/retention.ts` |
| Private Dateien | `src/collections/application-files/`, `src/lib/storage/privateBlobAdapter.ts` |
| Formular auf der Website | `src/components/forms/FormRenderer.tsx`, `FormClient.tsx` |

- Die Website schickt Einsendungen als `multipart/form-data` an `POST /api/form-submissions`: Feld `_payload` (JSON mit `form`, `event`, `submissionData`, `honeypot`) plus die Dateien unter dem Namen des Upload-Felds.
- Vor dem Speichern prüft `guardSubmission`: Honeypot leer, höchstens 10 Einsendungen pro IP in 10 Minuten (sonst 429), bei `event`: Das Event gehört zu diesem Formular und die Bewerbung ist offen (`applicationOpensAt` ≤ jetzt ≤ `applicationDeadline`, ohne Deadline bis zum Event). Interne Aufrufe über die Local API sind ausgenommen.
- PDF-Prüfung: Dateisignatur `%PDF-` und Payloads eigene PDF-Prüfung, max. 4 MB.
- Mails pro Formular (Bestätigung an den Absender, Benachrichtigung an die Redaktion) verschickt das Plugin über den Mail-Adapter, lokal in die Mail-Vorschau.
- Datei-Download: `/api/application-files/file/{name}`, nur Admin und Board (sonst 403), `Cache-Control: private, no-store`.
- Löschlauf: täglicher Job, löscht Einsendungen und ihre Dateien, wenn Eventdatum (oder Einsendedatum) + `retentionMonths` vorbei ist, und schreibt ins Job-Protokoll, wie viele es waren.
