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

## Semesterwechsel

- [ ] Ausscheidende in Payload unter **Benutzer** von `board` bzw. `editor` auf `advisory` setzen (nur Admin).
- [ ] Neue Mitglieder als Benutzer anlegen (nur Admin), Rolle `editor` oder `board`.
- [ ] **Team** aktualisieren: Gruppe, Position, `active` aus für Ehemalige, Reihenfolge.
- [ ] Zugänge prüfen: Vercel, Neon, Resend, GitHub-Organisation, DNS bei All-Inkl. Ausscheidende entfernen.
- [ ] Kontakt-E-Mail und Benachrichtigungsadressen der Formulare prüfen (Site-Settings, Formulare).
