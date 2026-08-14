const express = require('express');
const router = express.Router();
const PDFDocument = require('pdfkit');

// ---------------------------------------------------------------------------
// Zero Breach PDF Report Generator
//
// Renders the SAME investigation result object the dashboard displays.
// No values are recalculated here - this file is presentation-only.
// ---------------------------------------------------------------------------

const PAGE = { width: 595.28, height: 841.89 }; // A4 in points
const MARGIN = 48;
const CONTENT_WIDTH = PAGE.width - MARGIN * 2;
const HEADER_HEIGHT = 46;
const FOOTER_HEIGHT = 34;
const CONTENT_TOP = MARGIN + HEADER_HEIGHT;
const CONTENT_BOTTOM = PAGE.height - MARGIN - FOOTER_HEIGHT;

const COLORS = {
  bg: '#080b14',
  panel: '#0e1320',
  panelAlt: '#111827',
  border: '#232c40',
  text: '#e9edf5',
  muted: '#8b93a8',
  accent: '#ef3b4a',
  accentDim: '#9c2431',
  safe: '#22c55e',
  suspicious: '#eab308',
  high: '#ef4444',
  unknown: '#6b7280',
};

const SEVERITY_LABEL = {
  safe: 'SAFE',
  suspicious: 'SUSPICIOUS',
  high: 'HIGH RISK',
  unknown: 'UNKNOWN',
};

function severityColor(sev) {
  return COLORS[sev] || COLORS.unknown;
}

function riskColor(level) {
  const l = (level || '').toUpperCase();
  if (l === 'LOW RISK') return COLORS.safe;
  if (l === 'MODERATE') return COLORS.suspicious;
  if (l === 'SUSPICIOUS') return COLORS.suspicious;
  if (l === 'HIGH RISK') return COLORS.high;
  return COLORS.unknown;
}

// Strip anything outside the safe printable ASCII + common punctuation
// range so no unsupported glyphs / mojibake ever reach the PDF font.
function safeText(value) {
  if (value === null || value === undefined) return 'N/A';
  const str = String(value);
  // eslint-disable-next-line no-control-regex
  return str.replace(/[^\x20-\x7E]/g, '').trim() || 'N/A';
}

function formatBytes(bytes) {
  if (typeof bytes !== 'number' || Number.isNaN(bytes)) return 'N/A';
  if (bytes < 1024) return `${bytes} B`;
  const units = ['KB', 'MB', 'GB'];
  let value = bytes / 1024;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex++;
  }
  return `${value.toFixed(2)} ${units[unitIndex]}`;
}

// ---------------------------------------------------------------------------
// Layout primitives
// ---------------------------------------------------------------------------

function paintPageBackground(doc) {
  doc.save();
  doc.rect(0, 0, PAGE.width, PAGE.height).fill(COLORS.bg);
  doc.restore();
}

function drawHeader(doc) {
  doc.save();
  doc
    .fontSize(11)
    .fillColor(COLORS.text)
    .font('Helvetica-Bold')
    .text('ZERO BREACH', MARGIN, MARGIN - 6, { continued: true })
    .font('Helvetica')
    .fillColor(COLORS.muted)
    .fontSize(8)
    .text('   OSINT INVESTIGATION REPORT', { baseline: 'middle' });

  doc
    .moveTo(MARGIN, MARGIN + 14)
    .lineTo(PAGE.width - MARGIN, MARGIN + 14)
    .strokeColor(COLORS.border)
    .lineWidth(1)
    .stroke();
  doc.restore();
}

function drawFooter(doc, pageNum, pageCount) {
  doc.save();
  doc
    .moveTo(MARGIN, PAGE.height - MARGIN - FOOTER_HEIGHT + 10)
    .lineTo(PAGE.width - MARGIN, PAGE.height - MARGIN - FOOTER_HEIGHT + 10)
    .strokeColor(COLORS.border)
    .lineWidth(1)
    .stroke();

  doc
    .fontSize(8)
    .fillColor(COLORS.muted)
    .font('Helvetica')
    .text('ZERO BREACH - Confidential OSINT Report', MARGIN, PAGE.height - MARGIN - FOOTER_HEIGHT + 16, {
      width: CONTENT_WIDTH / 2,
    });

  doc.text(
    `Page ${pageNum} of ${pageCount}`,
    MARGIN + CONTENT_WIDTH / 2,
    PAGE.height - MARGIN - FOOTER_HEIGHT + 16,
    { width: CONTENT_WIDTH / 2, align: 'right' }
  );
  doc.restore();
}

// Ensures there is enough vertical room left on the current page for
// `neededHeight` points of content. If not, starts a fresh page. This
// keeps page breaks predictable instead of letting PDFKit's automatic
// overflow create stray near-empty pages.
function ensureSpace(doc, neededHeight) {
  if (doc.y + neededHeight > CONTENT_BOTTOM) {
    doc.addPage();
  }
}

function sectionHeading(doc, title) {
  ensureSpace(doc, 30);
  doc.moveDown(0.6);
  doc
    .fontSize(11)
    .fillColor(COLORS.accent)
    .font('Helvetica-Bold')
    .text(safeText(title).toUpperCase(), MARGIN, doc.y, { width: CONTENT_WIDTH });
  doc
    .moveTo(MARGIN, doc.y + 3)
    .lineTo(PAGE.width - MARGIN, doc.y + 3)
    .strokeColor(COLORS.border)
    .lineWidth(0.75)
    .stroke();
  doc.moveDown(0.7);
  doc.font('Helvetica').fontSize(9.5).fillColor(COLORS.text);
}

// Renders a clean two-column label/value table. Rows wrap correctly and
// never split awkwardly across a page break.
function table(doc, rows) {
  const labelWidth = 170;
  const valueWidth = CONTENT_WIDTH - labelWidth - 20;
  const padY = 7;
  const padX = 10;

  rows.forEach(([label, value], i) => {
    const valueStr = safeText(value);
    const valueHeight = doc.heightOfString(valueStr, { width: valueWidth, fontSize: 9.5 });
    const rowHeight = Math.max(20, valueHeight + padY * 2 - 6);

    ensureSpace(doc, rowHeight);

    const rowY = doc.y;
    const bgColor = i % 2 === 0 ? COLORS.panel : COLORS.panelAlt;

    doc.rect(MARGIN, rowY, CONTENT_WIDTH, rowHeight).fill(bgColor);
    doc
      .fontSize(9)
      .fillColor(COLORS.muted)
      .font('Helvetica')
      .text(safeText(label), MARGIN + padX, rowY + padY, { width: labelWidth - padX });
    doc
      .fontSize(9.5)
      .fillColor(COLORS.text)
      .font('Helvetica')
      .text(valueStr, MARGIN + labelWidth, rowY + padY, { width: valueWidth });

    doc.y = rowY + rowHeight;
  });

  doc.moveDown(0.4);
}

function emptyNote(doc, text) {
  ensureSpace(doc, 20);
  doc.fontSize(9).fillColor(COLORS.muted).font('Helvetica-Oblique').text(safeText(text), MARGIN, doc.y, {
    width: CONTENT_WIDTH,
  });
  doc.font('Helvetica').fillColor(COLORS.text);
  doc.moveDown(0.4);
}

// Vector pie/donut chart drawn directly with PDFKit primitives - no
// screenshots, no external images.
function drawThreatChart(doc, distribution) {
  const entries = [
    { label: 'Safe', value: distribution?.safe || 0, color: COLORS.safe },
    { label: 'Suspicious', value: distribution?.suspicious || 0, color: COLORS.suspicious },
    { label: 'High Risk', value: distribution?.highRisk || 0, color: COLORS.high },
    { label: 'Unknown', value: distribution?.unknown || 0, color: COLORS.unknown },
  ];
  const total = entries.reduce((sum, e) => sum + e.value, 0);

  const chartHeight = 150;
  ensureSpace(doc, chartHeight);

  const startY = doc.y;
  const centerX = MARGIN + 85;
  const centerY = startY + 65;
  const outerR = 60;
  const innerR = 34;

  if (total === 0) {
    doc
      .fontSize(9.5)
      .fillColor(COLORS.muted)
      .font('Helvetica-Oblique')
      .text('No chart data available', MARGIN, startY + 55, { width: 170, align: 'center' });
  } else {
    let startAngle = -Math.PI / 2;
    entries.forEach((entry) => {
      if (entry.value <= 0) return;
      const sliceAngle = (entry.value / total) * Math.PI * 2;
      const endAngle = startAngle + sliceAngle;

      doc.save();
      doc.moveTo(centerX, centerY);
      const steps = 48;
      for (let i = 0; i <= steps; i++) {
        const angle = startAngle + (sliceAngle * i) / steps;
        doc.lineTo(centerX + outerR * Math.cos(angle), centerY + outerR * Math.sin(angle));
      }
      doc.closePath();
      doc.fillColor(entry.color).fill();
      doc.restore();

      startAngle = endAngle;
    });

    // Donut hole
    doc.save();
    doc.circle(centerX, centerY, innerR).fill(COLORS.bg);
    doc.restore();

    doc
      .fontSize(14)
      .fillColor(COLORS.text)
      .font('Helvetica-Bold')
      .text(String(total), centerX - innerR, centerY - 8, { width: innerR * 2, align: 'center' });
    doc
      .fontSize(6.5)
      .fillColor(COLORS.muted)
      .font('Helvetica')
      .text('INDICATORS', centerX - innerR, centerY + 8, { width: innerR * 2, align: 'center' });
  }

  // Legend, to the right of the chart
  const legendX = MARGIN + 190;
  let legendY = startY + 8;
  entries.forEach((entry) => {
    doc.rect(legendX, legendY, 9, 9).fill(entry.color);
    doc
      .fontSize(9.5)
      .fillColor(COLORS.text)
      .font('Helvetica')
      .text(`${entry.label}`, legendX + 15, legendY - 1, { continued: false });
    doc
      .fontSize(9.5)
      .fillColor(COLORS.muted)
      .text(`${entry.value}`, legendX + 15, legendY - 1, { width: 200, align: 'right' });
    legendY += 22;
  });

  doc.y = startY + chartHeight;
}

function drawRiskAssessment(doc, score, level) {
  const hasScore = typeof score === 'number';
  const color = riskColor(level);
  const boxHeight = 78;
  ensureSpace(doc, boxHeight);

  const boxY = doc.y;
  doc.save();
  doc.rect(MARGIN, boxY, CONTENT_WIDTH, boxHeight).fill(COLORS.panel);
  doc.rect(MARGIN, boxY, 4, boxHeight).fill(color);
  doc.restore();

  doc
    .fontSize(9)
    .fillColor(COLORS.muted)
    .font('Helvetica')
    .text('RISK ASSESSMENT', MARGIN + 24, boxY + 16);

  doc
    .fontSize(26)
    .fillColor(COLORS.text)
    .font('Helvetica-Bold')
    .text(hasScore ? `${score} / 100` : 'INSUFFICIENT DATA', MARGIN + 24, boxY + 30);

  doc
    .fontSize(11)
    .fillColor(color)
    .font('Helvetica-Bold')
    .text(safeText(level || 'Insufficient Data').toUpperCase(), MARGIN + 24, boxY + 60);

  doc.y = boxY + boxHeight;
  doc.font('Helvetica').fillColor(COLORS.text);
}

function drawFindings(doc, findings) {
  if (!findings || findings.length === 0) {
    emptyNote(doc, 'No notable findings were generated for this investigation.');
    return;
  }

  findings.forEach((f) => {
    const message = safeText(f.message);
    const label = SEVERITY_LABEL[f.severity] || 'UNKNOWN';
    const rowHeight = Math.max(16, doc.heightOfString(message, { width: CONTENT_WIDTH - 90 }) + 4);
    ensureSpace(doc, rowHeight);
    const rowY = doc.y;

    doc
      .fontSize(7.5)
      .fillColor(severityColor(f.severity))
      .font('Helvetica-Bold')
      .text(label, MARGIN, rowY, { width: 80 });
    doc
      .fontSize(9.5)
      .fillColor(COLORS.text)
      .font('Helvetica')
      .text(message, MARGIN + 88, rowY, { width: CONTENT_WIDTH - 88 });

    doc.y = rowY + rowHeight + 4;
  });
  doc.moveDown(0.3);
}

// ---------------------------------------------------------------------------
// Route
// ---------------------------------------------------------------------------

router.post('/', (req, res) => {
  const result = req.body;

  if (!result || !result.target || !result.type) {
    return res.status(400).json({ error: 'No investigation data provided for the report.' });
  }

  try {
    const doc = new PDFDocument({
      size: 'A4',
      margin: MARGIN,
      bufferPages: true, // required so the final page count is accurate
      autoFirstPage: true,
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="ZeroBreach-Report-${safeText(result.target).replace(/[^a-z0-9.]/gi, '_')}.pdf"`
    );
    doc.pipe(res);

    // Repaint the dark background + slim header on every page, including
    // ones PDFKit adds automatically when content overflows.
    doc.on('pageAdded', () => {
      paintPageBackground(doc);
      drawHeader(doc);
      doc.x = MARGIN;
      doc.y = CONTENT_TOP;
    });

    paintPageBackground(doc);
    drawHeader(doc);
    doc.x = MARGIN;
    doc.y = CONTENT_TOP;

    // ---- Cover summary ----
    doc.fontSize(22).fillColor(COLORS.text).font('Helvetica-Bold').text('ZERO BREACH', MARGIN, doc.y);
    doc
      .fontSize(10)
      .fillColor(COLORS.muted)
      .font('Helvetica')
      .text('OSINT Investigation Report', MARGIN, doc.y + 2);
    doc.moveDown(1.2);

    table(doc, [
      ['Target', result.target],
      ['Investigation Type', result.type],
      ['Investigation Date', new Date(result.investigatedAt || Date.now()).toLocaleString()],
    ]);

    doc.moveDown(0.4);
    drawRiskAssessment(doc, result.riskScore, result.riskLevel);

    doc.moveDown(0.2);
    doc
      .fontSize(8.5)
      .fillColor(COLORS.muted)
      .font('Helvetica-Oblique')
      .text(
        'This is an indicative assessment based on the publicly available intelligence collected during this investigation. It is not a definitive statement of malicious activity.',
        MARGIN,
        doc.y,
        { width: CONTENT_WIDTH }
      );
    doc.font('Helvetica').fillColor(COLORS.text);

    // ---- Threat distribution ----
    sectionHeading(doc, 'Threat Distribution');
    drawThreatChart(doc, result.indicatorDistribution);

    // ---- Key findings ----
    sectionHeading(doc, 'Key Findings');
    drawFindings(doc, result.keyFindings);

    // ---- Type-specific sections ----
    if (result.type === 'DOMAIN') {
      const info = result.domainInformation;
      sectionHeading(doc, 'Domain Information');
      if (!info || info.available === false) {
        emptyNote(doc, `Data unavailable - ${info?.reason || 'not returned by source'}`);
      } else {
        table(doc, [
          ['Registrar', info.registrar],
          ['Registration Date', info.registrationDate],
          ['Expiration Date', info.expirationDate],
          ['Updated Date', info.updatedDate],
          ['Status', (info.status || []).join(', ') || 'N/A'],
        ]);
      }

      sectionHeading(doc, 'DNS Information');
      const dns = result.dns || {};
      table(
        doc,
        ['A', 'AAAA', 'MX', 'NS', 'TXT', 'CNAME'].map((rec) => [
          rec,
          (dns[rec] || []).length ? dns[rec].join(', ') : 'None found',
        ])
      );

      sectionHeading(doc, 'IP / Infrastructure');
      const infra = result.infrastructure;
      if (!infra || !infra.available) {
        emptyNote(doc, `Data unavailable - ${infra?.reason || 'not returned by source'}`);
      } else {
        table(doc, [
          ['IP Address', infra.ip],
          ['Organization', infra.organization],
          ['ASN', infra.asn],
          ['Approximate Location', [infra.city, infra.region, infra.country].filter(Boolean).join(', ')],
        ]);
      }

      sectionHeading(doc, 'Subdomains');
      if (result.subdomainsAvailable && (result.subdomains || []).length) {
        const listText = result.subdomains.join(', ');
        const listHeight = doc.heightOfString(listText, { width: CONTENT_WIDTH, fontSize: 9.5 });
        ensureSpace(doc, listHeight + 8);
        doc.fontSize(9.5).fillColor(COLORS.text).font('Helvetica').text(listText, MARGIN, doc.y, {
          width: CONTENT_WIDTH,
        });
        doc.moveDown(0.4);
      } else {
        emptyNote(doc, 'No subdomain data available.');
      }

      sectionHeading(doc, 'Threat Intelligence');
      const vt = result.threatIntelligence;
      if (!vt || !vt.available) {
        emptyNote(doc, `Data unavailable - ${vt?.reason || 'not returned by source'}`);
      } else {
        table(doc, [
          ['Reputation Score', vt.reputation],
          ['Malicious Detections', vt.stats?.malicious ?? 0],
          ['Suspicious Detections', vt.stats?.suspicious ?? 0],
          ['Harmless / Undetected', vt.stats?.harmless ?? 'N/A'],
        ]);
      }
    } else if (result.type === 'IP ADDRESS') {
      const info = result.ipInformation;
      sectionHeading(doc, 'IP Information');
      if (!info || !info.available) {
        emptyNote(doc, `Data unavailable - ${info?.reason || 'not returned by source'}`);
      } else {
        table(doc, [
          ['IP Version', result.ipVersion],
          ['Organization / ISP', info.organization],
          ['ASN', info.asn],
          ['Approximate Location', [info.city, info.region, info.country].filter(Boolean).join(', ')],
        ]);
      }

      sectionHeading(doc, 'Network Information');
      table(doc, [['Reverse DNS', result.reverseDns ? result.reverseDns.join(', ') : 'None found']]);

      sectionHeading(doc, 'Threat Intelligence');
      const vt = result.threatIntelligence;
      if (!vt || !vt.available) {
        emptyNote(doc, `Data unavailable - ${vt?.reason || 'not returned by source'}`);
      } else {
        table(doc, [
          ['Reputation Score', vt.reputation],
          ['Malicious Detections', vt.stats?.malicious ?? 0],
          ['Suspicious Detections', vt.stats?.suspicious ?? 0],
          ['Harmless / Undetected', vt.stats?.harmless ?? 'N/A'],
        ]);
      }
    } else if (result.type === 'USERNAME') {
      sectionHeading(doc, 'Public Platform Presence');
      table(
        doc,
        (result.platformResults || []).map((p) => [
          p.platform,
          p.found ? `FOUND - ${p.profileUrl || 'profile URL unavailable'}` : 'NOT FOUND',
        ])
      );

      const github = (result.platformResults || []).find((p) => p.platform === 'GitHub' && p.found);
      if (github) {
        sectionHeading(doc, 'Public Profile Information');
        table(doc, [
          ['Display Name', github.displayName],
          ['Bio', github.bio],
          ['Website', github.website],
          ['Public Repositories', github.publicRepos],
          ['Followers', github.followers],
        ]);
      }

      sectionHeading(doc, 'Notes');
      emptyNote(
        doc,
        'Matches above represent a potential public match and do not confirm the accounts belong to the same individual.'
      );
    } else if (result.type === 'FILE') {
      const info = result.fileInformation;
      sectionHeading(doc, 'File Information');
      if (!info) {
        emptyNote(doc, 'File metadata unavailable.');
      } else {
        table(doc, [
          ['Filename', info.name],
          ['File Size', formatBytes(info.size)],
          ['MIME Type', info.mimeType],
          ['MD5', info.md5],
          ['SHA-1', info.sha1],
          ['SHA-256', info.sha256],
        ]);
      }

      sectionHeading(doc, 'VirusTotal Analysis');
      const vt = result.virusTotal;
      if (!vt || !vt.available) {
        emptyNote(doc, `Data unavailable - ${vt?.reason || 'not returned by source'}`);
      } else {
        table(doc, [
          ['Total Engines', vt.stats?.total ?? 'N/A'],
          ['Malicious', vt.stats?.malicious ?? 0],
          ['Suspicious', vt.stats?.suspicious ?? 0],
          ['Harmless', vt.stats?.harmless ?? 0],
          ['Undetected', vt.stats?.undetected ?? 0],
          ['Timeout', vt.stats?.timeout ?? 0],
        ]);

        if (vt.engines && vt.engines.length > 0) {
          sectionHeading(doc, 'Security Engine Results');
          table(doc, vt.engines.map((e) => [e.engine, e.result]));
        }
      }
    }

    // ---- Sources ----
    sectionHeading(doc, 'Sources');
    doc
      .fontSize(9.5)
      .fillColor(COLORS.text)
      .font('Helvetica')
      .text((result.sources || []).join(', ') || 'None', MARGIN, doc.y, { width: CONTENT_WIDTH });
    doc.moveDown(0.4);

    // ---- Disclaimer ----
    sectionHeading(doc, 'Disclaimer');
    doc
      .fontSize(8.5)
      .fillColor(COLORS.muted)
      .font('Helvetica')
      .text(
        'This report contains information collected from publicly available sources and third-party intelligence services. The information may be incomplete, inaccurate, outdated, or affected by API limitations. The Zero Breach risk score is an indicative assessment and should not be interpreted as definitive proof that a target is malicious or safe. This tool is intended for legitimate security research, education, reconnaissance, and defensive investigation.',
        MARGIN,
        doc.y,
        { width: CONTENT_WIDTH }
      );

    // ---- Footers with correct, final page count ----
    const range = doc.bufferedPageRange();
    const pageCount = range.count;
    for (let i = 0; i < pageCount; i++) {
      doc.switchToPage(range.start + i);
      drawFooter(doc, i + 1, pageCount);
    }

    doc.end();
  } catch (err) {
    console.error('[report generation error]', err.message);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to generate PDF report.' });
    }
  }
});

module.exports = router;
