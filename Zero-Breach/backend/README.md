# Zero Breach — Backend

Express.js REST API that powers the Zero Breach OSINT Investigation Dashboard.

## Endpoints

| Method | Path                        | Description                          |
|--------|-----------------------------|---------------------------------------|
| GET    | `/api/health`                | Health check                         |
| POST   | `/api/investigate/domain`    | Investigate a domain                 |
| POST   | `/api/investigate/ip`        | Investigate an IP address            |
| POST   | `/api/investigate/username`  | Investigate a username               |
| POST   | `/api/investigate/file`      | Investigate an uploaded file (multipart, field `file`) |
| POST   | `/api/report`                | Generate a PDF report from a result  |

## Setup

```bash
cd backend
npm install
cp .env.example .env
# add your API keys to .env
node server.js
```

The server runs on `http://localhost:5000` by default.

## Data sources

- **Public DNS** — always available, no key required (A/AAAA/MX/NS/TXT/CNAME).
- **RDAP** (`rdap.org`) — domain registration data, no key required.
- **IPinfo** — IP geolocation, ASN, organization (`IPINFO_TOKEN`).
- **VirusTotal** — domain/IP reputation & detections (`VIRUSTOTAL_API_KEY`).
- **GitHub API** — public profile lookup, works without a token (`GITHUB_TOKEN` raises rate limits).
- **Reddit / YouTube / X** — public profile-page existence checks only.

## File investigation

`POST /api/investigate/file` accepts `multipart/form-data` with a `file` field. It:

1. Hashes the file (MD5/SHA-1/SHA-256) with Node's built-in `crypto`, from a `multer` in-memory buffer — nothing is written to disk.
2. Checks VirusTotal by SHA-256 first (`GET /files/{hash}`); reuses the existing report if found.
3. If unknown, uploads the file (`POST /files`) and polls `GET /analyses/{id}` (bounded attempts, a few seconds apart) until it completes.
4. Returns normalized stats + a sorted per-engine results array (malicious/suspicious first).
5. Rejects files over 32MB (VirusTotal's standard upload endpoint limit) with a clean error, and never retries indefinitely on rate limits.

Files are capped by `multer`'s `limits.fileSize` and never touch the filesystem, so there is no temporary file to clean up and no path-traversal or static-exposure risk.

Any source without a configured key gracefully returns `{ available: false, reason: "API key not configured" }` — the rest of the investigation continues normally.

## Notes

- Stateless: no database, no persisted investigation history.
- The PDF report mirrors exactly what the frontend sends it — no values are recalculated server-side at report time.
- Only public, non-authenticated data sources are used. No exploitation, brute-force, or credential-harvesting functionality exists in this codebase.
- SecurityTrails is intentionally not used (paid API) — subdomain/domain intelligence is not part of this build.

## PDF report engine

`routes/report.js` was rebuilt for a professional, print-ready output:

- `bufferPages: true` + a two-pass footer write means page numbers are always correct (no more "Page 2 of 1").
- A `pageAdded` listener draws the branded header on every page as it's created, so it's never stamped on top of body text.
- Every finding/section uses plain ASCII labels (`SAFE`, `SUSPICIOUS`, `HIGH RISK`, `UNKNOWN`) instead of Unicode icons, avoiding broken-glyph rendering under PDFKit's built-in fonts.
- The threat-distribution chart is a real vector donut drawn with PDFKit paths — not a screenshot — using the exact same `indicatorDistribution` values shown on the dashboard.
- Key/value data is rendered as bordered tables with per-row borders, so a table can safely break across a page without ever splitting a row.
