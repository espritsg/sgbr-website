---
description: Spec Newsletter der SGBR-Website (Variante A: Abonnenten, Double-Opt-in, Versand und Archiv in Payload, Resend nur als Versanddienst)
aktualisiert: 2026-11-22
---

# Newsletter

Entschieden 2026-11-22: **Variante A.** Payload ist die einzige Datenquelle. Resend verschickt nur.

## Anmeldung

- Formular im Footer, auf `/{l}/newsletter` und optional als Popup (an/aus in `site-settings`, Verzögerung einstellbar, heute 10 s).
- Felder: E-Mail (Pflicht), Vorname (optional), Interessen: `newsletter` (monatlich) und `events` (Einladungen zu Speaker Events), Einwilligung mit Link zur Datenschutzerklärung.
- Schutz: Honeypot-Feld und Begrenzung der Anfragen pro IP.
- Double-Opt-in: Anmeldung legt Abonnent `pending` an und schickt eine Bestätigungsmail. Erst der Link setzt `confirmed`. Unbestätigte nach 7 Tagen löschen.
- Gleiche Adresse erneut: keine Fehlermeldung nach aussen (sonst verrät man, wer angemeldet ist), nur neue Bestätigungsmail, falls noch `pending`.
- Sprache der Mails nach der Sprache der Seite, auf der angemeldet wurde.

## Abmeldung und Einstellungen

- Jede Mail hat einen persönlichen Abmeldelink und die Header `List-Unsubscribe` und `List-Unsubscribe-Post` (Abmeldung mit einem Klick im Mailprogramm).
- Seite `/{l}/newsletter/preferences?token=…`: Interessen ändern oder ganz abmelden, ohne Login.
- Abmelden setzt `unsubscribed` und löscht nichts, damit die Adresse nicht erneut angeschrieben wird.

## Versand

- Newsletter werden im Admin als Dokument der Collection `newsletters` geschrieben (Datenmodell: [datenmodell.md](datenmodell.md)).
- Zielgruppe pro Versand: Interesse `newsletter` oder `events`.
- Buttons im Admin: **Testversand** an die eigene Adresse (alle Rollen mit Schreibrecht) und **Senden** (nur Admin und Editorial Board, mit Bestätigungsdialog, zeigt die Empfängerzahl).
- Versand über die Batch-API von Resend, höchstens 100 Mails pro Aufruf, Rate-Limit von Resend beachten.
- Muss fortsetzbar sein: bricht der Versand ab, bekommt beim nächsten Lauf niemand die Mail doppelt (Fortschritt speichern, Idempotency-Key pro Paket). Startet sofort per Button und setzt sich selbst fort, siehe „Hintergrund-Jobs“ in [architektur.md](architektur.md).
- Status des Newsletters: `draft` → `sending` → `sent` oder `failed`. Gespeichert: Versandzeit, Empfängerzahl, Fehler.
- Mail-Vorlage im SGBR-Design (hell), HTML und Textversion, Inhalt aus dem Lexical-Text.
- Nach dem Versand erscheint der Newsletter verzögert im Archiv auf `/{l}/newsletter/{slug}` (siehe unten).

## Rückmeldungen von Resend

- Webhook für Bounces und Spam-Beschwerden setzt den Abonnenten auf `bounced` bzw. `complained`. Signatur prüfen.

## Technik und Konten

- Eigene Absender-Subdomain, z. B. `news.stgallenbusinessreview.com`, damit Newsletter-Probleme nicht die normalen Mails treffen. DNS-Einträge für Resend bei All-Inkl setzen, MX für Microsoft 365 nicht anfassen.
- Umgebungsvariablen: `RESEND_API_KEY`, `RESEND_WEBHOOK_SECRET`, `NEWSLETTER_FROM`, `NEWSLETTER_REPLY_TO`.
- Preise und Limits von Resend vor dem Livegang prüfen.

## Übergang

- Der erste Newsletter im Dezember 2026 geht noch über MailPoet.
- Bei der finalen Migration nur bestätigte MailPoet-Abonnenten übernehmen, mit Anmeldedatum als `consentAt`.

## Archiv (entschieden 2026-11-22)

- Versendete Newsletter erscheinen **verzögert** im Archiv, Standard 30 Tage nach Versand. Pro Newsletter einstellbar (`archiveDelayDays`, 0 = sofort) oder ganz ausblendbar.
- So haben Abonnenten einen Vorsprung, ohne dass es ein Login für Leser braucht.

## Umsetzung

| Teil | Datei |
| --- | --- |
| Anmeldung, Bestätigen, Einstellungen, Abmelden, Löschen nach 7 Tagen | `src/lib/newsletter/subscriptions.ts` |
| Versand (Schnappschuss, Pakete, Fortsetzen, Testversand, Planung) | `src/lib/newsletter/sending.ts` |
| Öffentliche Endpunkte `/api/newsletter/…` | `src/endpoints/newsletter.ts` |
| Admin-Endpunkte `/api/newsletters/:id/recipients`, `/test`, `/send` | `src/collections/newsletters/endpoints.ts` |
| Buttons im Admin (Seitenleiste des Newsletters) | `src/components/admin/NewsletterActions.tsx` |
| Mail-Vorlagen (HTML und Text, immer hell) | `src/emails/` |
| Resend bzw. lokale Vorschau | `src/lib/email/` |
| Seiten `/newsletter`, `/newsletter/{slug}`, `/confirm`, `/preferences` | `src/app/(frontend)/[locale]/newsletter/` |

### Endpunkte

| Endpunkt | Wofür |
| --- | --- |
| `POST /api/newsletter/subscribe` | Anmeldung. Honeypot `website`, max. 10 Anfragen pro IP in 10 Minuten. Antwortet immer gleich. |
| `POST /api/newsletter/preferences` | Interessen ändern (`token`, `interests`) oder abmelden (`unsubscribe: true`) |
| `POST /api/newsletter/unsubscribe?token=` | Abmelden mit einem Klick aus dem Mailprogramm (Header `List-Unsubscribe`, `List-Unsubscribe-Post`) |
| `POST /api/newsletter/webhook` | Resend: `email.bounced` → `bounced`, `email.complained` → `complained`. Signatur (Svix) mit `RESEND_WEBHOOK_SECRET` geprüft. |
| `POST /api/newsletter/continue` | Setzt einen Versand fort, nur mit `Authorization: Bearer $CRON_SECRET` |

### Ablauf beim Senden

1. **Senden** (Admin, Board) zeigt die Empfängerzahl im Bestätigungsdialog.
2. Beim Start entsteht für jeden Empfänger ein Eintrag in der versteckten Collection `newsletter-deliveries`, nummeriert in Paketen à 100. Wer sich danach abmeldet, wird übersprungen.
3. Pakete gehen einzeln an die Batch-API von Resend, mit Idempotency-Key `newsletter-{id}-batch-{n}`. Erst nach Erfolg wird das Paket als gesendet markiert. Bricht der Lauf ab, schickt der nächste Lauf dasselbe Paket mit demselben Schlüssel, Resend verschickt es nicht doppelt.
4. Läuft die Zeit einer Funktion ab (Budget ~40 s), ruft sich der Versand über `/api/newsletter/continue` selbst wieder auf ([ADR 0017](entscheidungen/0017-newsletter-selbstaufruf.md)). Der tägliche Cron setzt abgebrochene Versände fort.
5. Fehler 429/5xx: Abbruch, später erneut. Nach 3 Versuchen oder bei anderen Fehlern werden die Empfänger des Pakets als fehlgeschlagen markiert. Status am Ende `sent` (oder `failed`, wenn niemand erreicht wurde).
6. Sprache: Jeder Empfänger bekommt den Newsletter in seiner Sprache (`locale`), leere Felder fallen auf die andere Sprache zurück.

Lokal ohne `RESEND_API_KEY` landen alle Mails in `.mail-preview/` und unter `/admin/mail-preview` (nur Admin).
