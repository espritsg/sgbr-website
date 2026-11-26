---
description: Dateien (Bilder, Ausgaben-PDFs, Lebensläufe) in Cloudflare R2 statt Vercel Blob, weil Vercel Blob Hobby bei Überschreitung den Speicher sperrt
---

# 0022: Cloudflare R2 statt Vercel Blob

- Datum: 2026-11-25
- Status: angenommen (ersetzt den Dateispeicher aus ADR 0001 und 0012)

## Kontext

Bei der finalen Migration hat Vercel Blob (Hobby) erst die Uploads abgelehnt (1 GB Speicher), dann den ganzen Speicher gesperrt: Hobby erlaubt 2000 „Advanced Operations“ pro Monat (jeder Upload, jedes Auflisten, auch Klicks im Dashboard), und jedes Bild braucht fünf Uploads (Original und vier Grössen). Wird ein Limit überschritten, ist Blob bis zu 30 Tage nicht erreichbar – die Website zeigte dann keine Bilder und PDFs. Die alte Mediathek hat 2,9 GB, verwendet werden ca. 1,1 GB. Vercel Pro (20 $/Monat) war nicht gewünscht.

## Entscheidung

- **Cloudflare R2** (S3-kompatibel), Jurisdiktion EU, über `@payloadcms/storage-s3`. Gratis-Kontingent: 10 GB, 1 Mio. Schreib- und 10 Mio. Lesevorgänge pro Monat, keine Kosten für Datenübertragung.
- Bucket `sgbr-media` (öffentlich): Bilder und Ausgaben-PDFs. Die Website und `/files/{name}` verweisen direkt auf `R2_PUBLIC_URL`. Upload im Admin direkt vom Browser nach R2 (vorsignierte URL, CORS auf dem Bucket), ohne die 4,5-MB-Grenze von Vercel.
- Bucket `sgbr-privat` (privat): alle nicht öffentlichen Dateien, vorerst Lebensläufe, Präfix `application-files/`, nur über `/api/application-files/file/…` mit Zugriffsprüfung (Admin, Board). Der eigene Blob-Adapter entfällt.
- Öffentliche Adresse vorerst die `r2.dev`-Adresse von Cloudflare. Cloudflare drosselt sie und empfiehlt sie nur für Entwicklung; hier ist die Last klein, weil `next/image` jedes Bild einmal pro Grösse holt und Vercel es danach aus dem Cache liefert. Eine eigene Adresse (z. B. `files.stgallenbusinessreview.com`) braucht DNS bei Cloudflare; Umstellen ist nur `R2_PUBLIC_URL`, die Dateien bleiben.
- Ohne R2-Zugang (lokal, Tests) liegen Dateien auf der Platte ([ADR 0007](0007-lokal-ohne-konten.md)).

## Folgen

- Kein Risiko mehr, dass Bilder wegen eines Monatslimits verschwinden; Platz auch für Original-PDFs.
- Ein weiteres Konto (Cloudflare, mit hinterlegter Zahlungsmethode).
- Variablen: `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_PUBLIC_URL` (optional `R2_BUCKET_MEDIA`, `R2_BUCKET_PRIVATE`, `R2_ENDPOINT`). `BLOB_*` entfallen.
