---
description: Byline „Interview with …“ für Interviews, „By …“ für Gastbeiträge, beide aus dem Feld interviewees
---

# 0006: Byline bei Gastbeiträgen

- Datum: 2026-11-22
- Status: angenommen

## Kontext

Die Spec regelt nur die Byline für Interviews. Gastbeiträge haben einen Verfasser, aber kein eigenes Feld dafür.

## Entscheidung

- Das Feld `interviewees` heisst im Admin „Personen“ und gilt für beide Typen.
- `type = interview`: „Interview with {Namen}“ bzw. „Interview mit {Namen}“.
- `type = guest-article`: „By {Namen}“ bzw. „Von {Namen}“.

## Folgen

- Kein zusätzliches Feld, Personenseiten zeigen Interviews und Gastbeiträge gemeinsam.
