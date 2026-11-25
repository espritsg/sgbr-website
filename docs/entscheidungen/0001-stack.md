---
description: Warum Next.js + Payload CMS + Postgres (Neon) + Vercel statt WordPress
---

# 0001: Stack Next.js, Payload, Postgres, Vercel

- Datum: 2026-11-22
- Status: angenommen

## Kontext

Die alte Seite läuft auf WordPress (Theme Fox mit Child-Theme) bei All-Inkl. Sie ist schwer zu pflegen: kaputte Plugins, ~70 geladene Schriften, Inhalte fest im Theme. Die Redaktion wechselt jedes Semester.

## Entscheidung

- Next.js 16 (App Router) mit Payload CMS 3.94 in **einer** App, Admin unter `/admin`.
- Postgres über `@payloadcms/db-postgres`, in Produktion bei Neon (Vercel Marketplace), lokal in Docker.
- Dateien in Vercel Blob, Mails über Resend (seit [ADR 0021](0021-resend-als-quelle.md) auch Liste der Abonnenten), Statistik über Vercel Web Analytics.
- Hosting auf Vercel. Payload 3 statt der Beta von Payload 4.

## Folgen

- Ein Repo, ein Deployment, Vorschau pro Branch.
- Wer die Seite betreut, braucht Grundwissen in TypeScript und Node.js. Dafür gibt es `docs/` und `AGENTS.md`.
- Payload 4 kommt später per `@payloadcms/codemod`.
