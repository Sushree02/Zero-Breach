const axios = require('axios');

const TOKEN = process.env.IPINFO_TOKEN;

// Fetch IP intelligence (location, ASN, ISP/org) from IPinfo.
// Returns a normalized object, or an "unavailable" marker if no token
// is configured or the request fails.
async function lookupIP(ip) {
  if (!TOKEN) {
    return { available: false, reason: 'API key not configured' };
  }

  try {
    const { data } = await axios.get(`https://ipinfo.io/${encodeURIComponent(ip)}`, {
      params: { token: TOKEN },
      timeout: 8000,
    });

    return {
      available: true,
      ip: data.ip,
      hostname: data.hostname || null,
      city: data.city || null,
      region: data.region || null,
      country: data.country || null,
      location: data.loc || null,
      organization: data.org || null,
      asn: (data.org || '').split(' ')[0] || null,
      timezone: data.timezone || null,
    };
  } catch (err) {
    return { available: false, reason: 'IPinfo request failed or rate limited' };
  }
}

// Resolve a domain to its primary IP is done via DNS elsewhere;
// this helper just wraps lookupIP for reuse against a resolved IP.
async function lookupDomainInfrastructure(ip) {
  return lookupIP(ip);
}

module.exports = { lookupIP, lookupDomainInfrastructure };
