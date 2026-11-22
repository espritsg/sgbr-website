---
description: Keine automatische Übersetzung in Version 1; Bewertung der Übersetzungs-Plugins für später
---

# 0011: Keine automatische Übersetzung

- Datum: 2026-11-22
- Status: angenommen

## Entscheidung

Version 1 übersetzt nichts. Jeder Artikel steht in seiner Originalsprache, die andere Sprache zeigt das Original mit Hinweis.

## Für später

Payload übersetzt nicht selbst. Bewertet wurden (Stand 2026-11-22):

| | `@focus-reactive/payload-plugin-translator` 0.19 | `@jhb.software/payload-content-translator-plugin` 0.6 |
| --- | --- | --- |
| Bedienung | Button pro Dokument und Feld, Massen-Übersetzung | Button pro Dokument |
| Automatisch | ja, beim Veröffentlichen | nein |
| Ablauf | Payload Jobs, abbrechbar | Ergebnis im Formular |
| Anbieter | OpenAI-kompatibel, eigene Funktion möglich | OpenAI, Anthropic, Mistral |

- Empfehlung, falls später gewünscht: focus-reactive mit eigener Provider-Funktion für Claude. Übersetzungen immer als Entwurf, ein Mensch liest gegen. Versionen unter 1.0 fest pinnen.
- Alternative ohne Plugin: Übersetzen über MCP oder ein Skript mit der Local API.
