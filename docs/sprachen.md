---
description: Zweisprachigkeit der SGBR-Website: /en und /de, Payload-Localization mit gekreuztem Fallback, keine Übersetzung, Admin-Sprache
aktualisiert: 2026-11-22
---

# Sprachen

- Sprachen `en` und `de`, `en` ist Standard. Die Oberfläche (Navigation, Buttons, Seiten) gibt es in beiden Sprachen: `src/i18n/messages/{en,de}.json`.
- URLs: beide Sprachen mit Präfix (`/en/…`, `/de/…`), Artikel unter `/article/{slug}`. `next-intl` mit `localePrefix: 'always'`. `/` leitet je nach Browsersprache weiter. Routen: [urls-und-weiterleitungen.md](urls-und-weiterleitungen.md).
- Slugs sind **nicht** lokalisiert: ein Artikel hat in beiden Sprachen denselben Slug.
- **Keine Übersetzung der Artikel** ([ADR 0011](entscheidungen/0011-keine-uebersetzung.md)). Jeder Artikel steht in seiner Originalsprache (`originalLanguage`). In der anderen Sprache liefert Payload das Original, die Seite zeigt einen Hinweis („Dieser Artikel ist nur auf Englisch verfügbar“) und setzt `canonical` auf die Originalsprache.

## Payload-Fallback

Ist ein lokalisiertes Feld in der angefragten Sprache leer, liefert Payload den Wert der `fallbackLocale`. Jede Locale fällt auf die andere zurück (`src/payload.config.ts`):

```ts
localization: {
  defaultLocale: 'en',
  fallback: true,
  locales: [
    { code: 'en', label: 'English', fallbackLocale: 'de' },
    { code: 'de', label: 'Deutsch', fallbackLocale: 'en' },
  ],
}
```

- Der Fallback gilt pro Feld. Füllt jemand später nur den deutschen Titel, kommt der Text weiter aus dem Original.
- Artikel werden nur in ihrer Originalsprache eingetragen. Im Admin oben rechts die Sprache auf die Originalsprache stellen, bevor man schreibt.

## Admin-Sprache

- Payload-Admin auf Deutsch und Englisch, Standard Deutsch (`i18n.fallbackLanguage = 'de'`).
- Weil Payload ohne gespeicherte Wahl der Browsersprache folgt, setzt `src/proxy.ts` beim ersten Besuch von `/admin` das Cookie `payload-lng=de`. Jede Person kann im Konto auf Englisch umstellen ([ADR 0002](entscheidungen/0002-sprachen.md)).

## Datum und Zeit

- Alle Daten werden in der Zeitzone `Europe/Zurich` angezeigt.
