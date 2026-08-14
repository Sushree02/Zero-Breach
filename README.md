# ZERO BREACH

### OSINT Investigation Dashboard

##LIVE DEMO:https://zero-breach-hawrr4ggm-sushree-soumya-priyadarshini-s-projects.vercel.app/

Zero Breach is a lightweight OSINT (Open-Source Intelligence) investigation dashboard. Enter a **domain**, **IP address**, **username**, or upload a **file**, and it collects publicly available information, calculates an indicative risk score, and generates a downloadable PDF report — all from legitimate, public data sources.

![Zero Breach](frontend/public/logo.jpeg)

## Features

- Domain, IP, username, and **file** investigation
- Public DNS resolution, RDAP registration lookup, IPinfo geolocation/ASN, VirusTotal reputation (domains, IPs, and files), GitHub profile lookup
- Transparent, documented risk-scoring system (0–100, Low/Moderate/Suspicious/High Risk)
- Dark, crimson-accented dashboard with a decorative world-map hero, risk gauge, threat-distribution pie chart, and key findings
- Professionally formatted PDF report — real vector pie chart, bordered tables, correct page numbers, branded header/footer, no broken characters — that mirrors the dashboard exactly, for every investigation type including files
- Graceful handling when an API key isn't configured — the rest of the investigation still runs
- No login, no database, no user accounts, no fabricated activity/history — fully stateless

## 📄 File Investigation

Upload a file and Zero Breach will:

1. **Hash it** — MD5, SHA-1, and SHA-256, computed with Node's built-in `crypto` module from the actual uploaded bytes.
2. **Check VirusTotal first by hash.** If VirusTotal already has a report for that SHA-256, it's reused immediately — the file is never re-uploaded unnecessarily.
3. **Upload only if the hash is unknown**, then poll the resulting analysis (a bounded number of attempts, a few seconds apart) until it completes. If analysis never finishes in that window, the dashboard shows "Threat intelligence analysis is currently unavailable" rather than inventing a result.
4. **Score risk transparently** using the same rule-based philosophy as domain/IP investigations — detections increase the score, a clean result keeps it low, and insufficient data is reported as insufficient data, never guessed.
5. **Render a full dashboard**: risk gauge, threat-distribution donut chart, file metadata, a VirusTotal summary (total engines / malicious / suspicious / harmless / undetected), and a scrollable per-engine results table.
6. **Generate a PDF report** through the same report engine used for every other investigation type — file info table, VirusTotal summary, engine-results table, chart, findings, sources, and disclaimer.

**Privacy:** because a file may be uploaded to a third-party service, the upload panel shows a clear privacy notice and requires an explicit checkbox acknowledgment ("I understand this file may be submitted to a third-party threat intelligence service") before the scan button becomes active.

**Security:** uploaded files are held in memory only (`multer` memory storage) for the duration of the request — nothing is ever written to disk, so there's no temporary file to clean up and no path-traversal or static-file-exposure risk. Files are capped at 32MB, matching VirusTotal's standard upload endpoint limit. Filenames are sanitized before use anywhere in the response or report.

This feature reuses the **existing** `VIRUSTOTAL_API_KEY` — no second key, no key exposed to the frontend, no database, no login.

## Architecture

```text
Zero-Breach/
├── frontend/     React + Vite + Tailwind + Recharts
└── backend/      Node.js + Express + PDFKit + Multer
```

The frontend calls the backend over REST; the backend calls out to public OSINT APIs, normalizes the results, scores the risk, and returns JSON. The same JSON is later sent back to `/api/report` to render an identical PDF.

## Technologies

**Frontend:** React, Vite, Tailwind CSS, Recharts, Axios, React Router, lucide-react
**Backend:** Node.js, Express, Axios, Helmet, express-rate-limit, PDFKit, Multer, form-data, dotenv

## APIs used

| Source | Used for | Key required |
|---|---|---|
| Public DNS | A/AAAA/MX/NS/TXT/CNAME records | No |
| RDAP (rdap.org) | Domain registration info | No |
| IPinfo | IP geolocation, ASN, org | Yes — `IPINFO_TOKEN` |
| VirusTotal | Domain/IP/**file** reputation & detections | Yes — `VIRUSTOTAL_API_KEY` |
| GitHub API | Public profile lookup | No (token optional, raises rate limit) |
| Reddit / YouTube / X | Public profile-page existence checks | No |

SecurityTrails is intentionally not used (it requires a paid plan), so subdomain enumeration is not part of this build.

## Environment variables

See `backend/.env.example`:

```env
PORT=5000
IPINFO_TOKEN=
VIRUSTOTAL_API_KEY=
GITHUB_TOKEN=
```

The app works with zero keys configured — every optional source just reports "Data unavailable — API key not configured" instead of crashing. The `VIRUSTOTAL_API_KEY` powers domain, IP, **and file** threat intelligence.

## Installation & running

```bash
# Backend
cd backend
npm install
cp .env.example .env   # then add your API keys
node server.js          # runs on http://localhost:5000

# Frontend (separate terminal)
cd frontend
npm install
npm run dev              # runs on http://localhost:5173
```

Open `http://localhost:5173`, pick a target type — Domain, IP Address, Username, or File — and start the investigation.

## Generating reports

From the results dashboard, click **Download PDF Report**. The frontend sends the currently displayed investigation result to `POST /api/report`, and the backend streams back a PDF containing the same risk score, chart, findings, and details shown on screen — including hashes, VirusTotal stats, and engine results for file investigations.

## Limitations

- Free-tier API keys have rate limits; heavy use may trigger "request failed or rate limited" messages.
- Username checks only cover platforms with a legitimate public API/endpoint (currently GitHub, Reddit, YouTube, X). A "not found" result does not guarantee the username doesn't exist elsewhere.
- File uploads are capped at 32MB (VirusTotal's standard upload endpoint limit); larger files return a clear error instead of failing silently.
- Newly-uploaded files that VirusTotal hasn't analyzed before may take a short while to scan; if analysis doesn't finish within the polling window, the result is reported as unavailable rather than guessed.
- The risk score is a simple, transparent heuristic — not a machine-learning model and not a definitive verdict.
- No investigation data is stored; refreshing the dashboard page loses the current result, and uploaded files are never persisted to disk.

## Ethical & legal disclaimer

Zero Breach only queries **publicly available information** and **legitimate third-party APIs**. It contains no authentication-bypass, brute-force, credential-harvesting, or exploitation functionality of any kind. It is intended for legitimate security research, education, and defensive OSINT investigation. Always ensure you have the right to investigate a given target and that your use complies with applicable laws and the terms of service of any third-party API or platform. Never upload confidential, private, or proprietary files for analysis — file scans may be shared with VirusTotal and its security partners.
