const axios = require('axios');

const API_KEY = process.env.VIRUSTOTAL_API_KEY;
const BASE_URL = 'https://www.virustotal.com/api/v3';

function headers() {
  return { 'x-apikey': API_KEY };
}

// Normalizes the VirusTotal "last_analysis_stats" block into a
// simple, consistent shape used across the rest of the app.
function normalizeStats(stats) {
  if (!stats) return null;
  return {
    malicious: stats.malicious || 0,
    suspicious: stats.suspicious || 0,
    harmless: stats.harmless || 0,
    undetected: stats.undetected || 0,
  };
}

async function checkDomain(domain) {
  if (!API_KEY) {
    return { available: false, reason: 'API key not configured' };
  }
  try {
    const { data } = await axios.get(`${BASE_URL}/domains/${encodeURIComponent(domain)}`, {
      headers: headers(),
      timeout: 10000,
    });
    const attrs = data.data.attributes;
    return {
      available: true,
      reputation: attrs.reputation ?? 0,
      stats: normalizeStats(attrs.last_analysis_stats),
      categories: attrs.categories || {},
    };
  } catch (err) {
    return { available: false, reason: 'VirusTotal request failed or rate limited' };
  }
}

async function checkIP(ip) {
  if (!API_KEY) {
    return { available: false, reason: 'API key not configured' };
  }
  try {
    const { data } = await axios.get(`${BASE_URL}/ip_addresses/${encodeURIComponent(ip)}`, {
      headers: headers(),
      timeout: 10000,
    });
    const attrs = data.data.attributes;
    return {
      available: true,
      reputation: attrs.reputation ?? 0,
      stats: normalizeStats(attrs.last_analysis_stats),
      country: attrs.country || null,
      asOwner: attrs.as_owner || null,
    };
  } catch (err) {
    return { available: false, reason: 'VirusTotal request failed or rate limited' };
  }
}

module.exports = { checkDomain, checkIP };
