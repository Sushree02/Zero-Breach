const axios = require('axios');
const crypto = require('crypto');
const FormData = require('form-data');

const API_KEY = process.env.VIRUSTOTAL_API_KEY;
const BASE_URL = 'https://www.virustotal.com/api/v3';

// The VirusTotal standard /files upload endpoint supports files up to 32MB.
// Larger files require a separate "upload URL" flow that this build does
// not implement, in line with using the existing, already-configured
// integration rather than adding new API surface.
const MAX_FILE_SIZE = 32 * 1024 * 1024; // 32MB

const POLL_ATTEMPTS = 8;
const POLL_DELAY_MS = 3000;

function headers(extra = {}) {
  return { 'x-apikey': API_KEY, ...extra };
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Calculates MD5 / SHA-1 / SHA-256 from the actual uploaded buffer.
function calculateHashes(buffer) {
  return {
    md5: crypto.createHash('md5').update(buffer).digest('hex'),
    sha1: crypto.createHash('sha1').update(buffer).digest('hex'),
    sha256: crypto.createHash('sha256').update(buffer).digest('hex'),
  };
}

function normalizeStats(stats) {
  if (!stats) return null;
  const malicious = stats.malicious || 0;
  const suspicious = stats.suspicious || 0;
  const harmless = stats.harmless || 0;
  const undetected = stats.undetected || 0;
  const timeout = stats.timeout || 0;
  return {
    malicious,
    suspicious,
    harmless,
    undetected,
    timeout,
    total: malicious + suspicious + harmless + undetected + timeout,
  };
}

// Normalizes the VirusTotal per-engine results map into a flat, sorted
// array: malicious/suspicious findings first, so the most relevant rows
// are visible without scrolling.
function normalizeEngineResults(results) {
  if (!results) return [];
  const CATEGORY_RANK = { malicious: 0, suspicious: 1, 'type-unsupported': 4, undetected: 3, harmless: 2, timeout: 4 };
  const engines = Object.entries(results).map(([engineKey, r]) => ({
    engine: r.engine_name || engineKey,
    category: r.category || 'unknown',
    result: r.result || (r.category === 'undetected' ? 'Undetected' : r.category === 'harmless' ? 'Clean' : 'N/A'),
  }));
  engines.sort((a, b) => (CATEGORY_RANK[a.category] ?? 5) - (CATEGORY_RANK[b.category] ?? 5));
  return engines;
}

// Step 1: check if VirusTotal already has a report for this hash, so an
// already-known file is never re-uploaded unnecessarily.
async function getReportByHash(sha256) {
  const { data } = await axios.get(`${BASE_URL}/files/${sha256}`, {
    headers: headers(),
    timeout: 15000,
  });
  const attrs = data.data.attributes;
  return {
    available: true,
    stats: normalizeStats(attrs.last_analysis_stats),
    engines: normalizeEngineResults(attrs.last_analysis_results),
    reputation: attrs.reputation ?? 0,
  };
}

// Step 2 (only if hash unknown): upload the file, then poll the resulting
// analysis until it completes or we give up.
async function uploadAndAnalyze(buffer, filename) {
  const form = new FormData();
  form.append('file', buffer, { filename });

  const { data: uploadData } = await axios.post(`${BASE_URL}/files`, form, {
    headers: headers(form.getHeaders()),
    maxBodyLength: MAX_FILE_SIZE + 1024 * 1024,
    timeout: 30000,
  });

  const analysisId = uploadData.data.id;

  for (let attempt = 0; attempt < POLL_ATTEMPTS; attempt++) {
    const { data: analysis } = await axios.get(`${BASE_URL}/analyses/${analysisId}`, {
      headers: headers(),
      timeout: 15000,
    });
    const status = analysis.data.attributes.status;

    if (status === 'completed') {
      return {
        available: true,
        stats: normalizeStats(analysis.data.attributes.stats),
        engines: normalizeEngineResults(analysis.data.attributes.results),
        reputation: 0,
      };
    }
    await sleep(POLL_DELAY_MS);
  }

  // Analysis never completed within the polling window - do not invent a result.
  return { available: false, reason: 'Threat intelligence analysis is currently unavailable.' };
}

// Full flow: hash the file, check the known-hash report first, fall back
// to uploading only if VirusTotal has never seen this file before.
async function analyzeFile(buffer, filename) {
  const hashes = calculateHashes(buffer);

  if (!API_KEY) {
    return { hashes, virusTotal: { available: false, reason: 'API key not configured' } };
  }

  try {
    const report = await getReportByHash(hashes.sha256);
    return { hashes, virusTotal: report };
  } catch (err) {
    if (err.response && err.response.status === 404) {
      // Hash not known to VirusTotal yet - upload and analyze it.
      try {
        const report = await uploadAndAnalyze(buffer, filename);
        return { hashes, virusTotal: report };
      } catch (uploadErr) {
        if (uploadErr.response && uploadErr.response.status === 429) {
          return { hashes, virusTotal: { available: false, reason: 'VirusTotal rate limit reached. Please try again later.' } };
        }
        return { hashes, virusTotal: { available: false, reason: 'VirusTotal upload failed or is currently unavailable.' } };
      }
    }
    if (err.response && err.response.status === 429) {
      return { hashes, virusTotal: { available: false, reason: 'VirusTotal rate limit reached. Please try again later.' } };
    }
    return { hashes, virusTotal: { available: false, reason: 'VirusTotal request failed or rate limited' } };
  }
}

module.exports = {
  MAX_FILE_SIZE,
  calculateHashes,
  analyzeFile,
};
