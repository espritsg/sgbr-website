---
description: Hosting auf Vercel: Konten, Umgebungsvariablen, DNS, Resend-Domain, Cron und Checkliste für den Livegang
aktualisiert: 2026-11-22
---

# Deployment

Gehostet auf Vercel, Konto von ESPRIT. Postgres bei Neon (Vercel Marketplace), Dateien in Vercel Blob, Mails über Resend.

## Umgebungsvariablen

Alle Variablen stehen mit Kommentar in [`.env.example`](../.env.example). In Vercel unter Project → Settings → Environment Variables setzen (Production und Preview).

| Variable | Pflicht | Wofür |
| --- | --- | --- |
| `DATABASE_URL` | ja | Postgres-Verbindung (Neon setzt sie über die Marketplace-Integration) |
| `PAYLOAD_SECRET` | ja | Schlüssel für Payload (Sessions, Tokens), zufällig, mind. 32 Zeichen |
| `NEXT_PUBLIC_SERVER_URL` | ja | öffentliche Adresse ohne `/` am Ende, z. B. `https://stgallenbusinessreview.com` |
| `RESEND_API_KEY` | für Mails | Resend; ohne Key gehen keine Mails raus |
| `RESEND_WEBHOOK_SECRET` | für Bounces | Webhook in Resend auf `https://…/api/newsletter/webhook`, Ereignisse `email.bounced`, `email.complained` |
| `EMAIL_FROM` | nein | Absender normaler Mails |
| `NEWSLETTER_FROM`, `NEWSLETTER_REPLY_TO` | nein | Absender und Antwortadresse des Newsletters |
| `CRON_SECRET` | ja | schützt Cron und Selbstaufruf des Newsletter-Versands |
| `BLOB_READ_WRITE_TOKEN` | ja | Vercel Blob (setzt Vercel beim Verbinden des Blob-Stores) |
| `MCP_ENABLED` | nein | `true` schaltet `/api/mcp` ein, Standard aus |

## Checkliste vor dem Livegang

Offene Punkte aus den Specs (blockieren den Bau nicht):

- [ ] Wer pflegt die Seite technisch nach der aktuellen Betreuung?
- [ ] Budget für Vercel (Hobby oder Pro), Neon und Resend klären, Preise vorher prüfen. Vercel Hobby ist laut Vercel nur für nicht-kommerzielle Nutzung. Mit Pro kann der Cron häufiger laufen.
- [ ] Deadline festlegen (z. B. nächste Ausgabe).
- [ ] GitHub-Organisation von ESPRIT: vorhanden? Wer ist Owner? Wer hat Zugang zu All-Inkl (Hosting/DNS)?
- [ ] Code des Child-Themes (laut Call von Thierry) beschaffen, falls noch Details fehlen.
- [ ] Rolle von Jannis (ESPRIT) klären.
- [ ] Datenschutzerklärung rechtlich prüfen lassen (Entwurfsabschnitte zu Newsletter, Formularen mit Lebenslauf, Vercel Analytics).
- [ ] Imprint-Text prüfen.
- [ ] Design-Tokens einmal im Browser mit den berechneten Styles der alten Seite abgleichen ([ADR 0010](entscheidungen/0010-design-werte.md)).
- [ ] Kategorien-Zuordnung alt → neu von der Redaktion bestätigen lassen ([migration.md](migration.md)).
- [ ] Nach dem Livegang prüfen, dass das Plugin auf espritsg.ch die neuen Feeds liest (WP-Rocket-Cache leeren).
