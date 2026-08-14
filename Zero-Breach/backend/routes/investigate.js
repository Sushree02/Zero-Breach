const express = require('express');
const router = express.Router();
const dns = require('dns').promises;
const multer = require('multer');

const { isValidDomain, isValidIP, isValidUsername, ipVersion } = require('../utils/validators');
const ipinfoService = require('../services/ipinfoService');
const virusTotalService = require('../services/virusTotalService');
const dnsService = require('../services/dnsService');
const whoisService = require('../services/whoisService');
const githubService = require('../services/githubService');
const presenceService = require('../services/presenceService');
const fileAnalysisService = require('../services/fileAnalysisService');
const riskAnalysis = require('../services/riskAnalysis');

// Files are kept in memory only, for exactly as long as this request takes
// to process. Nothing is ever written to disk, so there is no temporary
// file to clean up and no path-traversal / static-exposure surface at all.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: fileAnalysisService.MAX_FILE_SIZE },
});

// POST /api/investigate/domain
router.post('/domain', async (req, res) => {
  const { target } = req.body;

  if (!isValidDomain(target)) {
    return res.status(400).json({ error: 'Please enter a valid domain name (e.g. example.com).' });
  }

  const domain = target.trim().toLowerCase();
  const sources = [];

  try {
    const dnsRecords = await dnsService.resolveDNS(domain);

    let ipinfoResult = { available: false, reason: 'No IP resolved for this domain' };
    if (dnsRecords.A.length > 0) {
      ipinfoResult = await ipinfoService.lookupDomainInfrastructure(dnsRecords.A[0]);
      if (ipinfoResult.available) sources.push('IPinfo');
    }

    const [vt, registration] = await Promise.all([
      virusTotalService.checkDomain(domain),
      whoisService.getRegistrationInfo(domain),
    ]);

    if (vt.available) sources.push('VirusTotal');
    sources.push('Public DNS');
    if (registration.available) sources.push('RDAP Registration Data');

    const risk = riskAnalysis.analyzeDomain({ vt, dnsRecords, registration });
    const indicatorDistribution = riskAnalysis.buildIndicatorDistribution(risk.findings);

    return res.json({
      target: domain,
      type: 'DOMAIN',
      investigatedAt: new Date().toISOString(),
      riskScore: risk.score,
      riskLevel: risk.level,
      keyFindings: risk.findings,
      indicatorDistribution,
      domainInformation: registration.available
        ? registration
        : { available: false, reason: registration.reason || 'Data unavailable' },
      dns: dnsRecords,
      infrastructure: ipinfoResult,
      // Subdomain enumeration is not part of this build - SecurityTrails
      // is intentionally not used because it requires a paid plan.
      subdomains: [],
      subdomainsAvailable: false,
      threatIntelligence: vt,
      sources: [...new Set(sources)],
    });
  } catch (err) {
    console.error('[domain investigation error]', err.message);
    return res.status(500).json({ error: 'Investigation failed unexpectedly. Please try again.' });
  }
});

// POST /api/investigate/ip
router.post('/ip', async (req, res) => {
  const { target } = req.body;

  if (!isValidIP(target)) {
    return res.status(400).json({ error: 'Please enter a valid IPv4 or IPv6 address.' });
  }

  const ip = target.trim();
  const sources = [];

  try {
    const [ipinfoResult, vt, reverseDns] = await Promise.all([
      ipinfoService.lookupIP(ip),
      virusTotalService.checkIP(ip),
      dns.reverse(ip).catch(() => []),
    ]);

    if (ipinfoResult.available) sources.push('IPinfo');
    if (vt.available) sources.push('VirusTotal');

    const risk = riskAnalysis.analyzeIP({ vt, ipinfo: ipinfoResult });
    const indicatorDistribution = riskAnalysis.buildIndicatorDistribution(risk.findings);

    return res.json({
      target: ip,
      type: 'IP ADDRESS',
      ipVersion: ipVersion(ip),
      investigatedAt: new Date().toISOString(),
      riskScore: risk.score,
      riskLevel: risk.level,
      keyFindings: risk.findings,
      indicatorDistribution,
      ipInformation: ipinfoResult,
      reverseDns: reverseDns.length > 0 ? reverseDns : null,
      threatIntelligence: vt,
      sources: [...new Set(sources)],
    });
  } catch (err) {
    console.error('[ip investigation error]', err.message);
    return res.status(500).json({ error: 'Investigation failed unexpectedly. Please try again.' });
  }
});

// POST /api/investigate/username
router.post('/username', async (req, res) => {
  const { target } = req.body;

  if (!isValidUsername(target)) {
    return res.status(400).json({ error: 'Please enter a valid username (letters, numbers, - _ . only).' });
  }

  const username = target.trim();
  const sources = [];

  try {
    const [githubResult, otherPlatforms] = await Promise.all([
      githubService.checkGithubUsername(username),
      presenceService.checkAllPlatforms(username),
    ]);

    const platformResults = [githubResult, ...otherPlatforms];
    platformResults.forEach((p) => {
      if (p.found) sources.push(p.platform);
    });

    const risk = riskAnalysis.analyzeUsername({ platformResults });
    const indicatorDistribution = riskAnalysis.buildIndicatorDistribution(risk.findings);

    return res.json({
      target: username,
      type: 'USERNAME',
      investigatedAt: new Date().toISOString(),
      riskScore: risk.score,
      riskLevel: risk.level,
      keyFindings: risk.findings,
      indicatorDistribution,
      platformResults,
      sources: [...new Set(sources)],
    });
  } catch (err) {
    console.error('[username investigation error]', err.message);
    return res.status(500).json({ error: 'Investigation failed unexpectedly. Please try again.' });
  }
});

// POST /api/investigate/file  (multipart/form-data, field name: "file")
router.post('/file', (req, res) => {
  upload.single('file')(req, res, async (uploadErr) => {
    if (uploadErr) {
      if (uploadErr.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'File is too large for the current VirusTotal upload method (32MB limit).' });
      }
      return res.status(400).json({ error: 'File upload failed. Please try again.' });
    }

    const file = req.file;
    if (!file || !file.originalname || file.size === 0) {
      return res.status(400).json({ error: 'Please select a file.' });
    }

    // Sanitize the filename used anywhere in the response/report - strip
    // path separators and control characters, keep it short and safe.
    const safeName = file.originalname
      .replace(/[\\/]/g, '_')
      .replace(/[^\x20-\x7E]/g, '')
      .slice(0, 255) || 'unnamed-file';

    try {
      const { hashes, virusTotal } = await fileAnalysisService.analyzeFile(file.buffer, safeName);

      const sources = [];
      if (virusTotal.available) sources.push('VirusTotal');

      const risk = riskAnalysis.analyzeFile({ virusTotal });
      const indicatorDistribution = riskAnalysis.buildIndicatorDistribution(risk.findings);

      return res.json({
        target: safeName,
        type: 'FILE',
        investigatedAt: new Date().toISOString(),
        riskScore: risk.score,
        riskLevel: risk.level,
        keyFindings: risk.findings,
        indicatorDistribution,
        fileInformation: {
          name: safeName,
          size: file.size,
          mimeType: file.mimetype || 'application/octet-stream',
          md5: hashes.md5,
          sha1: hashes.sha1,
          sha256: hashes.sha256,
        },
        virusTotal,
        sources: [...new Set(sources)],
      });
    } catch (err) {
      console.error('[file investigation error]', err.message);
      return res.status(500).json({ error: 'Investigation failed unexpectedly. Please try again.' });
    }
    // `file.buffer` was only ever held in process memory and is released
    // here when the response completes - nothing was written to disk.
  });
});

module.exports = router;
