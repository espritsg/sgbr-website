---
description: Spec Formulare und Bewerbungen für Speaker Events auf der SGBR-Website (Form Builder, Lebenslauf-Upload, Sichtbarkeit, Datenschutz)
aktualisiert: 2026-11-22
---

# Formulare und Bewerbungen

## Formulare

- Plugin `@payloadcms/plugin-form-builder`. Admin und Editorial Board bauen Formulare selbst: Text, E-Mail, Textfeld, Auswahl, Checkbox, Zahl, Land, Hinweistext.
- Zusätzlicher eigener Feldtyp **Datei-Upload** (PDF, z. B. Lebenslauf), max. 5 MB. Das Plugin hat ihn nicht, also selbst bauen.
- Pro Formular einstellbar: Bestätigungstext oder Weiterleitung, Bestätigungsmail an den Absender, Benachrichtigung an eine Adresse der Redaktion.
- Verwendet für: Bewerbungen auf Speaker Events, Kontaktformular, später weitere.
- Schutz: Honeypot-Feld und Begrenzung der Anfragen pro IP.

## Bewerbung auf Speaker Events

- Studierende bewerben sich auf ein Speaker Event.
- Event-Felder dafür: `applicationForm` → forms, `applicationOpensAt`, `applicationDeadline`. Formular nur zwischen diesen Zeitpunkten sichtbar, sonst Hinweis „Bewerbung geschlossen“.
- Jede Einsendung speichert den Bezug zum Event.
- Im Admin vorerst nur die Liste der Einsendungen, filterbar nach Event, mit Export als CSV.
- Ein Auswahlprozess (Status, Zusagen, Mails) kommt später. Ablauf ist noch abzusprechen. Datenmodell so anlegen, dass ein Feld `status` leicht ergänzt werden kann.

## Sichtbarkeit und Datenschutz

- Einsendungen und hochgeladene Dateien sehen nur **Admin und Editorial Board**. Editors und Advisory Board nicht (entschieden 2026-11-22).
- Lebensläufe dürfen nicht öffentlich abrufbar sein. Eigene Upload-Collection `application-files` mit Zugriffsschutz. Prüfen, ob Vercel Blob private Dateien kann; sonst ein Speicher mit privaten Objekten (z. B. S3-kompatibel).
- Formular zeigt einen Datenschutzhinweis mit Link.
- Aufbewahrung (entschieden 2026-11-22): Einsendungen und Dateien werden **6 Monate nach dem Event automatisch gelöscht**. Frist pro Formular änderbar (`retentionMonths`). Bei Formularen ohne Event zählt das Einsendedatum.
- Löschlauf täglich als Payload Job (siehe „Hintergrund-Jobs“ in [architektur.md](architektur.md)), mit Protokoll, wie viel gelöscht wurde.
