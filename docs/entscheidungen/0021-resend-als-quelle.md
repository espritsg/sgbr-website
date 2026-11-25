---
description: Resend ist die einzige Liste der Abonnenten (Kontakte, Segmente pro Sprache, Topics pro Interesse); Newsletter gehen als Broadcasts raus, Double-Opt-in ohne gespeicherte Anmeldungen
---

# 0021: Resend als Quelle der Abonnenten

- Datum: 2026-11-25
- Status: angenommen (ersetzt Variante A aus [newsletter.md](../newsletter.md) und [ADR 0017](0017-newsletter-selbstaufruf.md))

## Kontext

Bisher lagen die Abonnenten in Payload, Resend verschickte nur (Variante A). Im Transaktions-Tarif von Resend gilt ein Tageslimit von 100 Mails im Gratis-Tarif, ein Newsletter an alle wäre ab etwa 90 Abonnenten nicht mehr gratis. Broadcasts zählen laut Resend nicht zu diesem Limit. Der Marketing-Tarif ist bis 1000 Kontakte gratis (3 Segmente, Stand 2026-11-25). Dazu übernimmt Resend Abmeldung, Einstellungen, Bounces und Spam-Beschwerden selbst. Geprüft wurde auch Scaleway TEM (günstig, EU), verworfen, weil dort Versand, Fortsetzen und Bounces weiter selbst gebaut werden müssten.

## Entscheidung

- **Resend ist die einzige Liste der Abonnenten.** Kontakt mit `first_name` und den Feldern `locale`, `source`, `consent_at`, `confirmed_at`. Ein Segment pro Sprache, ein Topic pro Interesse (`Newsletter`, `Event invitations`, beide Standard opt-out, bei der Anmeldung opt-in).
- **Double-Opt-in ohne Speichern:** Die Anmeldung schickt nur die Bestätigungsmail. Die Daten stecken verschlüsselt (AES-256-GCM, Schlüssel aus `PAYLOAD_SECRET`) im Link, 7 Tage gültig. Erst der Klick legt den Kontakt in Resend an. Keine Collection `subscribers`, kein Löschjob.
- **Erneute Anmeldung** setzt den Kontakt wieder auf angemeldet und fügt Interessen hinzu, entfernt aber keine.
- **Newsletter** werden weiter in Payload geschrieben (Inhalt, Archiv). „Senden“ legt pro Sprache einen Broadcast an Segment + Topic an. Erst als Entwurf, ID speichern, dann senden: Ein Neuversuch schickt nie doppelt.
- **Abmelden und Einstellungen** über die Seite von Resend (Platzhalter `{{{RESEND_UNSUBSCRIBE_URL}}}` in jeder Mail). Eigene Einstellungsseite, Abmelde-Endpunkte und Webhook entfallen.
- Einzelmails (Bestätigung, Formulare, Passwort, Testversand) gehen wie bisher über die Transaktions-API.
- Ohne `RESEND_API_KEY` ersetzt eine JSON-Datei neben der Mail-Vorschau Resend ([ADR 0007](0007-lokal-ohne-konten.md)). Tests und Dev-Import schreiben nie in ein echtes Resend-Konto.
- Einrichtung einmalig mit `npm run resend:setup` (legt Segmente, Topics, Kontaktfelder an und gibt die IDs aus).

## Folgen

- Viel weniger eigener Code (keine Pakete, kein Fortsetzen, kein Webhook), Statistik zu Öffnungen und Klicks in Resend.
- Die Liste liegt bei einem US-Dienst: Datenschutzerklärung entsprechend.
- Die Redaktion sieht Abonnenten nicht im Admin, sondern in Resend (eigenes Login für Admin/Board).
- Die Empfängerzahl im Admin ist eine Obergrenze (Kontakte pro Sprache); welche davon das Topic haben, weiss erst Resend.
- Die Abmeldeseite gestaltet Resend, sie ist nicht zweisprachig wie die Website.
- Ab 1000 Kontakten kostet der Marketing-Tarif (Stand 2026-11-25: 40 $/Monat bis 5000).
