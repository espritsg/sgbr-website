---
description: Spec Newsletter der SGBR-Website: Resend als Liste der Abonnenten (Kontakte, Segmente, Topics), Double-Opt-in, Texte und Archiv in Payload, Versand als Broadcasts
aktualisiert: 2026-11-27
---

# Newsletter

Entschieden 2026-11-25 ([ADR 0021](entscheidungen/0021-resend-als-quelle.md)): **Resend ist die einzige Liste der Abonnenten** und verschickt die Newsletter als Broadcasts. Payload enthält die Newsletter-Texte und das Archiv, aber keine Abonnenten.

## In Resend

| Was | Wofür |
| --- | --- |
| Kontakt | E-Mail, `first_name`, Felder `locale`, `source` (footer, popup, newsletter-page, mailpoet-import, admin), `consent_at`, `confirmed_at` |
| Segment „SGBR – English“ / „SGBR – Deutsch“ | Sprache des Abonnenten, jeder Kontakt in genau einem |
| Topic „Newsletter“ / „Event invitations“ | Interessen; Standard opt-out, bei der Anmeldung opt-in |
| Abmeldeseite von Resend | Interessen ändern, ganz abmelden (Link in jeder Mail) |
| Unterdrückungsliste von Resend | Bounces und Spam-Beschwerden, automatisch |

Einrichten mit `npm run resend:setup`, die ausgegebenen IDs kommen als `RESEND_SEGMENT_EN`, `RESEND_SEGMENT_DE`, `RESEND_TOPIC_NEWSLETTER`, `RESEND_TOPIC_EVENTS` in Vercel ([deployment.md](deployment.md)).

## Anmeldung

- Formular im Footer, auf `/{l}/newsletter` und optional als Popup (an/aus in `site-settings`, Verzögerung einstellbar, heute 10 s).
- Felder: E-Mail (Pflicht), Vorname (optional), Interessen: `newsletter` (monatlich) und `events` (Einladungen zu Speaker Events), Einwilligung mit Link zur Datenschutzerklärung.
- Schutz: Honeypot-Feld und Begrenzung der Anfragen pro IP.
- **Double-Opt-in:** Die Anmeldung speichert nichts, sie schickt nur die Bestätigungsmail. Die Angaben stecken verschlüsselt im Link (7 Tage gültig, Schlüssel aus `PAYLOAD_SECRET`). Erst der Klick legt den Kontakt in Resend an, mit Zeitpunkt von Einwilligung und Bestätigung.
- Gleiche Adresse erneut: gleiche Antwort nach aussen, neue Bestätigungsmail. Bestätigt sie, wird der Kontakt wieder angemeldet, die Sprache übernommen und die gewählten Interessen hinzugefügt (frühere bleiben).
- Sprache der Mails nach der Sprache der Seite, auf der angemeldet wurde.

## Abmeldung und Einstellungen

- Jede Mail hat den persönlichen Link von Resend (`{{{RESEND_UNSUBSCRIBE_URL}}}`, im Footer der Mail als „Einstellungen“ und „Abmelden“). Dort lassen sich die Topics einzeln abbestellen oder alles. Eigene Header lassen sich bei Broadcasts nicht setzen; ob Resend `List-Unsubscribe` (Abmelden mit einem Klick im Mailprogramm) selbst setzt, beim ersten echten Broadcast in den Mail-Headern prüfen.
- Abgemeldete bleiben in Resend als „unsubscribed“ und bekommen nichts mehr.

## Versand

- Newsletter werden im Admin als Dokument der Collection `newsletters` geschrieben (Datenmodell: [datenmodell.md](datenmodell.md)).
- Zielgruppe pro Versand: Interesse `newsletter` oder `events` (= Topic).
- Buttons im Admin: **Testversand** an die eigene Adresse (alle Rollen mit Schreibrecht) und **Senden** (nur Admin und Editorial Board, mit Bestätigungsdialog). Die Zahl im Dialog ist eine Obergrenze: alle angemeldeten Kontakte beider Sprachen; welche davon das Topic haben, filtert Resend.
- **Senden** legt pro Sprache mit Kontakten einen Broadcast an: Segment der Sprache, Topic der Zielgruppe, Inhalt in dieser Sprache (leere Felder fallen auf die andere Sprache zurück).
- **Nie doppelt:** Broadcast zuerst als Entwurf anlegen, ID im Newsletter speichern (`resend.broadcastEn`/`broadcastDe`), dann senden. Ein Neuversuch sendet einen gespeicherten Entwurf, lässt einen schon gesendeten in Ruhe.
- Status: `draft` → `sent` oder `failed` (Fehler unter `resend.lastError`, „Erneut senden“ schickt nur, was fehlt). Gespeichert: Versandzeit, Empfänger-Obergrenze, Broadcast-IDs.
- Geplanter Versand (`scheduledFor`, Tag): der tägliche Cron sendet am Morgen ([ADR 0013](entscheidungen/0013-newsletter-versand.md)).
- Mail-Vorlage im SGBR-Design (Logo, eckig, Navy, immer hell; `src/emails/layout.ts`), HTML und Textversion, Inhalt aus dem Lexical-Text.
- Aufbau der Mail: Titel, Einleitung (Leerzeile = neuer Absatz, einfacher Zeilenumbruch bleibt, z. B. Name und Funktion), Text, dann „Weitere Artikel“ (`featuredPosts`) mit je einem Link. Im Text zwei Blöcke (`src/blocks/newsletter.ts`): **Abschnitt mit Bild** (Bild links für Porträts und Logos oder gross oben, Titel, Unterzeile, Text, Link als Textlink oder Button) und **Artikel** (Artikel der Website an dieser Stelle, mit Titelbild oder eigenem Bild, Zusammenfassung oder eigenem Text). Bilder in der Mail in der Grösse `card` mit absoluter URL. Im Fuss die Social Links aus der Fusszeile (Global `footer`).
- Bilder laden die Mailprogramme vom Server. Outlook blockiert externe Bilder, bis der Leser „Bilder herunterladen“ wählt oder den Absender als sicher markiert; dann erscheint ein leerer Rahmen mit Fragezeichen (auch beim Logo). Dieselbe Vorlage für Bestätigungs- und Formular-Mails ([redaktion.md](redaktion.md#mail-vorlage)).
- Zustellung, Öffnungen und Klicks: in Resend unter Broadcasts.

## Technik und Konten

- Eigene Absender-Subdomain `news.stgallenbusinessreview.com` für Broadcasts, damit Newsletter-Probleme nicht die normalen Mails treffen. DNS-Einträge für Resend bei All-Inkl setzen, MX für Microsoft 365 nicht anfassen.
- Umgebungsvariablen: `RESEND_API_KEY` (Full access, weil Kontakte und Broadcasts), die vier IDs oben, `NEWSLETTER_FROM`, `NEWSLETTER_REPLY_TO`.
- Tarif (Stand 2026-11-25): Marketing gratis bis 1000 Kontakte und 3 Segmente, Broadcasts zählen nicht zum Tageslimit der Einzelmails. Vor dem Livegang prüfen.

## Übergang

- Der erste Newsletter im Dezember 2026 war ursprünglich für MailPoet geplant; die Redaktion hat ihn parallel in Payload aufgebaut (Stand 2026-11-27).
- Bei der finalen Migration nur bestätigte MailPoet-Abonnenten übernehmen: Kontakt in Resend, Sprache `en`, Topic Newsletter, Anmeldedatum als `consent_at`. Bestehende Kontakte bleiben unverändert.

## Archiv (entschieden 2026-11-22)

- Versendete Newsletter erscheinen **verzögert** im Archiv, Standard 30 Tage nach Versand. Pro Newsletter einstellbar (`archiveDelayDays`, 0 = sofort) oder ganz ausblendbar.
- So haben Abonnenten einen Vorsprung, ohne dass es ein Login für Leser braucht.

## Umsetzung

| Teil | Datei |
| --- | --- |
| Resend (Kontakte, Segmente, Topics, Broadcasts) und lokaler Ersatz | `src/lib/newsletter/audience.ts` |
| Verschlüsselter Bestätigungslink | `src/lib/newsletter/signupToken.ts` |
| Anmeldung und Bestätigung | `src/lib/newsletter/subscriptions.ts` |
| Versand als Broadcasts, Testversand, Planung | `src/lib/newsletter/sending.ts` |
| Öffentlicher Endpunkt `/api/newsletter/subscribe` | `src/endpoints/newsletter.ts` |
| Admin-Endpunkte `/api/newsletters/:id/recipients`, `/test`, `/send` | `src/collections/newsletters/endpoints.ts` |
| Buttons im Admin (Seitenleiste des Newsletters) | `src/components/admin/NewsletterActions.tsx` |
| Mail-Vorlagen (HTML und Text, immer hell) | `src/emails/` |
| Einzelmails über Resend bzw. lokale Vorschau | `src/lib/email/` |
| Seiten `/newsletter`, `/newsletter/{slug}`, `/confirm` | `src/app/(frontend)/[locale]/newsletter/` |
| Einrichtung in Resend | `src/scripts/resend-setup.ts` (`npm run resend:setup`) |

### Endpunkte

| Endpunkt | Wofür |
| --- | --- |
| `POST /api/newsletter/subscribe` | Anmeldung. Honeypot `website`, max. 10 Anfragen pro IP in 10 Minuten. Antwortet immer gleich. |
| `GET /api/newsletters/:id/recipients` | Obergrenze der Empfänger (Admin-Seitenleiste) |
| `POST /api/newsletters/:id/test?locale=` | Testversand an die eigene Adresse |
| `POST /api/newsletters/:id/send` | Senden (Admin, Board) |

Lokal ohne `RESEND_API_KEY`: Kontakte landen in `.mail-preview/audience.json`, jeder Broadcast als eine Mail in `.mail-preview/` und unter `/admin/mail-preview` (nur Admin). Der Dev-Import legt drei Test-Kontakte nur dort an.
