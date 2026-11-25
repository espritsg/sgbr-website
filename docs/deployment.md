---
description: Hosting auf Vercel: Konten, Umgebungsvariablen, erster Deploy, DNS, Resend-Domain, Cron, finale Migration und Checkliste für den Livegang
aktualisiert: 2026-11-25
---

# Deployment

Gehostet auf Vercel (Konto von ESPRIT). Postgres bei Neon über den Vercel Marketplace, Dateien in Vercel Blob, Mails und Liste der Abonnenten bei Resend ([ADR 0021](entscheidungen/0021-resend-als-quelle.md)). Der Code liegt im GitHub-Repo `espritsg/sgbr-website` (persönliches Konto von ESPRIT, weil Vercel Hobby keine Repos von GitHub-Organisationen importiert).

## Umgebungsvariablen

Alle Variablen stehen mit Kommentar in [`.env.example`](../.env.example). In Vercel unter Project → Settings → Environment Variables setzen, für **Production** und **Preview**.

| Variable | Pflicht | Wofür, woher |
| --- | --- | --- |
| `DATABASE_URL` | ja | Postgres. Setzt die Neon-Integration automatisch (bei Neon heisst sie ggf. `POSTGRES_URL`, dann als `DATABASE_URL` übernehmen). Für Previews eigener Neon-Branch. |
| `PAYLOAD_SECRET` | ja | Schlüssel für Payload, zufällig, mind. 32 Zeichen: `openssl rand -hex 32`. Nie ändern, sonst sind alle angemeldet ab. |
| `NEXT_PUBLIC_SERVER_URL` | ja | öffentliche Adresse ohne `/` am Ende: `https://stgallenbusinessreview.com` (Preview: Vorschau-URL) |
| `CRON_SECRET` | ja | zufällig. Vercel schickt es beim Cron als `Authorization: Bearer …`. |
| `BLOB_READ_WRITE_TOKEN` | ja | öffentlicher Blob-Store (Bilder, Ausgaben-PDFs); setzt Vercel beim Verbinden |
| `BLOB_PRIVATE_READ_WRITE_TOKEN` | ja | privater Blob-Store (Lebensläufe); beim Verbinden Präfix `BLOB_PRIVATE` wählen. Fehlt er auf Vercel, bricht der Build mit Hinweis ab |
| `RESEND_API_KEY` | für Mails | Resend, Berechtigung **Full access**; ohne Key gehen keine Mails raus (nur Log) |
| `RESEND_SEGMENT_EN`, `RESEND_SEGMENT_DE` | für Newsletter | IDs der Sprach-Segmente, aus `npm run resend:setup` |
| `RESEND_TOPIC_NEWSLETTER`, `RESEND_TOPIC_EVENTS` | für Newsletter | IDs der Topics, aus `npm run resend:setup` |
| `EMAIL_FROM` | nein | Absender normaler Mails, Standard `St. Gallen Business Review <editorial@stgallenbusinessreview.com>` |
| `NEWSLETTER_FROM` | nein | Absender Newsletter, Standard `…<newsletter@news.stgallenbusinessreview.com>` |
| `NEWSLETTER_REPLY_TO` | nein | Antwortadresse Newsletter |
| `MCP_ENABLED` | nein | `true` schaltet `/api/mcp` ein, Standard aus |
| `ANTHROPIC_API_KEY`, `ANTHROPIC_MODEL` | nein | nur für Import- und Migrationsskript (lokal), nicht in Vercel nötig |

Nur lokal: `DATABASE_URL_TEST`, `DEV_SEED_PASSWORD`, `UPLOADS_DIR`, `MAIL_PREVIEW_DIR`, `IMPORT_LIMIT`, `DEV_IMPORT_SOURCE`, `MIGRATION_*`, `CHECK_*`.

## Erster Deploy

1. **GitHub:** Repo `espritsg/sgbr-website` (erledigt).
2. **Vercel:** New Project → Repo importieren. Framework Next.js wird erkannt. Build-Befehl kommt aus `vercel.json`: `npm run build:vercel` (`payload migrate`, dann `next build`). Node-Version aus `package.json` (`engines`, 24).
3. **Neon:** Vercel → Storage → Neon verbinden (Region Frankfurt `eu-central-1`). Für Preview-Deployments Neon-Branching einschalten, damit Vorschauen nicht auf die Produktionsdaten schreiben.
4. **Blob, zwei Stores** (Region Frankfurt; Zugriff lässt sich später nicht ändern, [ADR 0012](entscheidungen/0012-bewerbungsdateien.md)):
   - `sgbr-media`, Zugriff **Public**, verbinden mit Standard-Präfix → `BLOB_READ_WRITE_TOKEN`
   - `sgbr-bewerbungen`, Zugriff **Private**, verbinden mit Präfix **`BLOB_PRIVATE`** → `BLOB_PRIVATE_READ_WRITE_TOKEN`
5. **Variablen** aus der Tabelle oben setzen.
6. **Deploy.** Beim ersten Build legt `payload migrate` alle Tabellen an.
7. **Ersten Benutzer anlegen:** `https://…/admin` öffnen, „Ersten Benutzer erstellen“. Er wird automatisch Admin. Weitere Benutzer legt der Admin an.
8. **Cron prüfen:** Vercel → Settings → Cron Jobs zeigt `/api/cron/run-jobs` täglich 05:00 UTC. „Run“ klicken, danach im Admin unter Einstellungen → Hintergrund-Jobs den Eintrag „Tägliche Wartung“ ansehen.
9. **Region:** `vercel.json` setzt die Funktionen auf `fra1` (Frankfurt), neben Neon und Blob. Sonst laufen sie in den USA und jede Datenbankabfrage geht über den Atlantik.
10. **Laufzeit:** `vercel.json` erlaubt der Payload-API bis 300 Sekunden (`maxDuration`), für Newsletter-Versand und Migration. Auf Vercel Hobby prüfen, ob das Limit gilt.

## Resend (Mails, Newsletter, Abonnenten)

1. Konto bei Resend (ESPRIT), zwei Domains anlegen:
   - `stgallenbusinessreview.com` für normale Mails (Absender `editorial@…`)
   - `news.stgallenbusinessreview.com` für die Newsletter-Broadcasts (eigene Subdomain, damit Newsletter-Probleme die normalen Mails nicht treffen)
2. Die DNS-Einträge, die Resend anzeigt, bei **All-Inkl** eintragen: pro Domain TXT `resend._domainkey` (DKIM) und CNAME `rsend` und `send` auf `…forge.rmta.net` (Stand 2026-11-25; bei `news.` mit Zusatz `.news`). **MX (Microsoft 365) und SPF der Hauptdomain nicht anfassen.**
3. API-Key erzeugen, Berechtigung **Full access** (Kontakte, Segmente, Broadcasts) → `RESEND_API_KEY`.
4. Einmalig lokal: `RESEND_API_KEY=re_… npm run resend:setup`. Legt die Segmente „SGBR – English“ und „SGBR – Deutsch“, die Topics „Newsletter“ und „Event invitations“ und die Kontaktfelder an und gibt die vier IDs aus → in Vercel eintragen. Wiederholbar.
5. Kein Webhook nötig: Abmeldungen, Bounces und Spam-Beschwerden verwaltet Resend selbst.
6. Testen: eigene Adresse auf der Website anmelden und bestätigen (Kontakt erscheint in Resend unter Contacts), im Admin **Testversand an mich**, dann einen ersten Newsletter senden und in der empfangenen Mail prüfen, dass der Abmeldelink zur Seite von Resend führt.

## DNS und Livegang

- Hosting und DNS liegen bei All-Inkl. Für den Livegang nur die Einträge für die Website umstellen: `A` für `stgallenbusinessreview.com` und `CNAME` für `www` auf die Werte, die Vercel unter Domains anzeigt. **MX (Microsoft 365) und alle Mail-Einträge bleiben unverändert.**
- In Vercel die Domain hinzufügen, `www` auf die Hauptdomain weiterleiten.
- WordPress noch einige Wochen offline als Backup behalten.

## Finale Migration

Ablauf und Befehle in [migration.md](migration.md), Phase 2. Kurz:

1. In WordPress nichts mehr ändern. Exporte ziehen: WXR („Alle Inhalte“), MailPoet (nur bestätigte), Redirection, `wp-content/uploads` per FTP.
2. Lokal gegen die Produktionsdatenbank und das echte Resend: `DATABASE_URL=<Neon> BLOB_READ_WRITE_TOKEN=<…> RESEND_API_KEY=<…>` plus die vier Resend-IDs, `MIGRATION_DIR=… npm run migrate:wp` (Befehl in [migration.md](migration.md)).
3. Bericht durchgehen, Exporte mit Personendaten danach löschen.
4. `CHECK_TARGET=https://<vorschau> npm run check:redirects` muss 0 Fehler melden.

## Checkliste vor dem Livegang

Offene Punkte aus den Specs (blockieren den Bau nicht):

- [ ] Wer pflegt die Seite technisch nach der aktuellen Betreuung?
- [ ] Budget für Vercel (Hobby oder Pro), Neon und Resend klären (Resend Marketing gratis bis 1000 Kontakte), Preise vorher prüfen. Vercel Hobby ist laut Vercel nur für nicht-kommerzielle Nutzung. Mit Pro kann der Cron häufiger laufen (`vercel.json`, z. B. alle 5 Minuten).
- [ ] Deadline festlegen (z. B. nächste Ausgabe).
- [ ] Wer hat Zugang zum GitHub-Konto `espritsg`, zu Resend und zu All-Inkl (Hosting/DNS)?
- [ ] Code des Child-Themes (laut Call von Thierry) beschaffen, falls noch Details fehlen.
- [ ] Rolle von Jannis (ESPRIT) klären.
- [ ] Datenschutzerklärung rechtlich prüfen lassen. Die Abschnitte mit „[Draft]“ (Hosting, Statistik, Newsletter, Formulare) sind Entwürfe.
- [ ] Imprint-Text prüfen (Vorstand, Adresse).
- [ ] Preise und Limits von Resend prüfen, beide Absender-Domains verifiziert, `npm run resend:setup` gelaufen.
- [ ] Datenschutzerklärung: Liste der Abonnenten bei Resend (USA).
- [ ] Erster Newsletter im Dezember 2026 noch über MailPoet. WordPress erst abschalten, wenn der neue Versand läuft.

Aus dem Bau:

- [ ] Design-Tokens einmal im Browser mit den berechneten Styles der alten Seite abgleichen ([ADR 0010](entscheidungen/0010-design-werte.md)).
- [ ] Kategorien-Zuordnung alt → neu von der Redaktion bestätigen lassen ([migration.md](migration.md)).
- [ ] Artikel ohne Haupt-Thema (Bericht der Migration) zuordnen, Zusammenfassungen prüfen (Liste „Zusammenfassung prüfen“).
- [ ] Bewerbung mit PDF auf der Vorschau testen und prüfen, dass die Blob-URL der Datei ohne Login nicht abrufbar ist.
- [ ] Newsletter-Testversand und echte Anmeldung (Double-Opt-in) auf der Vorschau testen, Abmelden per Link und per Mailprogramm (One-Click).
- [ ] `npm run check:redirects` gegen die Vorschau: 0 Fehler.
- [ ] Feeds prüfen: `https://<vorschau>/issues/?sgbr_feed=1` und `/category/speaker-events/?sgbr_feed=1` liefern JSON.
- [ ] Nach dem Livegang prüfen, dass das Plugin auf espritsg.ch die neuen Feeds liest (WP-Rocket-Cache auf espritsg.ch leeren).
- [ ] Benutzer für die Redaktion anlegen (Rollen nach [rollen.md](rollen.md)), Testbenutzer gibt es in Produktion nicht.
- [ ] Vercel Web Analytics im Projekt aktivieren (Analytics → Enable).
