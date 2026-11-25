---
description: Lebensläufe über den eingebauten Upload-Feldtyp des Form Builders, privat in Vercel Blob mit eigenem Adapter, max. 4 MB
---

# 0012: Bewerbungsdateien

- Datum: 2026-11-22
- Status: angenommen

## Kontext

Die Spec ging davon aus, dass der Form Builder keinen Datei-Upload hat. Version 3.94 hat aber einen eingebauten Feldtyp `upload`: Er legt die Datei in einer angegebenen Upload-Collection an und verknüpft sie mit der Einsendung (`submissionUploads`). Das offizielle Paket `@payloadcms/storage-vercel-blob` kann nur öffentliche Blobs. `@vercel/blob` 2.3 kann inzwischen private Blobs. Vercel Functions nehmen höchstens 4,5 MB pro Anfrage an.

## Entscheidung

- Eingebauten Feldtyp `upload` nutzen, einzige erlaubte Ziel-Collection ist `application-files`. Kein Eigenbau.
- `application-files`: nur PDF (Prüfung der Dateisignatur `%PDF-`, nicht nur des Dateinamens), **max. 4 MB statt 5 MB**, wegen der Grenze von 4,5 MB pro Anfrage auf Vercel.
- Speicher in einem **eigenen privaten Blob-Store** (`BLOB_PRIVATE_READ_WRITE_TOKEN`; Vercel legt öffentlich/privat pro Store fest, seit 2026-11-25), Bilder im öffentlichen Store (`BLOB_READ_WRITE_TOKEN`). Eigener kleiner Adapter `src/lib/storage/privateBlobAdapter.ts` mit `access: 'private'`. Dateien gibt es nur über `/api/application-files/file/{name}`. Diese Route prüft vorher die Leserechte (nur Admin und Board). Ohne Token liegen sie lokal im Ordner `application-files/`, ausserhalb von `public/`.
- Kein zusätzlicher S3-Dienst nötig.

## Folgen

- Sollen später grössere Dateien möglich sein, braucht es einen direkten Upload aus dem Browser zu Vercel Blob (Client-Upload mit Token).
- Wenn das offizielle Paket private Blobs unterstützt, kann der eigene Adapter ersetzt werden.
