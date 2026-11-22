---
description: Zwei Sprachen mit Präfix, keine Übersetzung, gekreuzter Fallback, Admin standardmässig Deutsch per Cookie
---

# 0002: Sprachen, Fallback und Admin-Sprache

- Datum: 2026-11-22
- Status: angenommen

## Kontext

Artikel stehen in einer Sprache (etwa halb EN, halb DE). Übersetzt wird nicht. Payload fällt standardmässig auf die `defaultLocale` zurück, dann bliebe ein deutscher Artikel unter `/en` leer. Die Admin-Oberfläche soll standardmässig Deutsch sein. Payload richtet sich ohne gespeicherte Wahl aber nach der Browsersprache.

## Entscheidung

- `localization` mit `en` → Fallback `de` und `de` → Fallback `en` (pro Feld).
- Routing mit next-intl, `localePrefix: 'always'`.
- Admin: `i18n.fallbackLanguage = 'de'`. Zusätzlich setzt `src/proxy.ts` beim ersten Aufruf von `/admin` das Cookie `payload-lng=de`, wenn noch keins da ist. Wer im Konto auf Englisch umstellt, überschreibt das Cookie.

## Folgen

- Inhalte werden nur in der Originalsprache gepflegt (Feld `originalLanguage`).
- Die Seite zeigt in der anderen Sprache das Original mit Hinweis, `canonical` zeigt auf die Originalsprache.
