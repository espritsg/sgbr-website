---
description: Wartung der SGBR-Website: Updates von Payload und Next.js, Backups, Semesterwechsel-Checkliste
aktualisiert: 2026-11-22
---

# Wartung

## Updates

1. Eigenen Branch anlegen: `git switch -c chore/update-payload-3.xx`.
2. Alle `@payloadcms/*`-Pakete und `payload` auf **dieselbe** Version heben, exakt gepinnt: `npm install --save-exact payload@3.xx.y @payloadcms/next@3.xx.y …`. Next.js nur auf eine Version, die Payload unterstützt (siehe `peerDependencies` von `@payloadcms/next`).
3. `npm run generate:types && npm run generate:importmap`.
4. Bei Schemaänderungen durch das Update: `npm run payload migrate:create update-payload-3-xx`.
5. `npm run check` (Lint, Typecheck, Tests, Build). Auf der Vercel-Vorschau des Branches kurz durchklicken (Admin, Artikel, Newsletter-Testversand).
6. Merge, CHANGELOG-Eintrag.

Node.js: Version steht in `.nvmrc` und `package.json` (`engines`). Bei einem Wechsel beide anpassen und in Vercel unter Settings → General → Node.js Version.

## Datenbank-Migrationen

- Lokal synchronisiert Payload das Schema im Dev-Server automatisch (`push`). Für Produktion braucht jede Schemaänderung eine Migration:
  1. Config ändern (z. B. neues Feld), Dev-Server testen.
  2. `npm run migrate:create kurzer-name` erzeugt `src/migrations/<datum>_kurzer-name.ts`.
  3. `npm run generate:types && npm run generate:importmap`, alles committen.
  4. Beim Deploy führt `npm run build:vercel` die offenen Migrationen aus.
- Prüfen gegen eine leere Datenbank: `createdb` (oder Docker), dann `NODE_ENV=production DATABASE_URL=… npm run migrate`.

## Backups

- Neon macht Point-in-Time-Backups (je nach Plan einige Tage). Vor grösseren Änderungen in Neon einen Branch als Sicherung anlegen.
- Export als Backup im Admin: in den Listen (Artikel, Personen, Ausgaben, Events, Themen, Team, Einsendungen) **Exportieren** als CSV oder JSON. Abonnenten: in Resend unter Contacts als CSV exportieren.
- Dateien liegen in Cloudflare R2 (Buckets `sgbr-media`, `sgbr-bewerbungen`). Für eine Kopie: `rclone` oder `aws s3 sync` mit dem R2-Endpunkt und einem API-Token.

## Hintergrund-Jobs

- Unter Einstellungen → **Hintergrund-Jobs** (nur Admin) steht jeder Lauf mit Ergebnis (z. B. wie viele Einsendungen gelöscht wurden). Einträge älter als 90 Tage löscht die tägliche Wartung.
- Von Hand ausführen: lokal `npm run jobs`, in Produktion in Vercel unter Cron Jobs auf **Run**.

## Semesterwechsel

- [ ] Ausscheidende in Payload unter **Benutzer** von `board` bzw. `editor` auf `advisory` setzen (nur Admin).
- [ ] Neue Mitglieder als Benutzer anlegen (nur Admin), Rolle `editor` oder `board`.
- [ ] **Team** aktualisieren: Gruppe, Position, `active` aus für Ehemalige, Reihenfolge.
- [ ] Zugänge prüfen: Vercel, Neon, Resend, GitHub-Organisation, DNS bei All-Inkl. Ausscheidende entfernen.
- [ ] Kontakt-E-Mail und Benachrichtigungsadressen der Formulare prüfen (Site-Settings, Formulare).
