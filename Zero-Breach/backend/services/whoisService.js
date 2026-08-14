const axios = require('axios');

// Uses the free, public RDAP protocol (no API key required) to fetch
// domain registration data. RDAP is the modern, structured replacement
// for legacy WHOIS text output and is publicly available for gTLDs.
async function getRegistrationInfo(domain) {
  try {
    const { data } = await axios.get(`https://rdap.org/domain/${encodeURIComponent(domain)}`, {
      timeout: 8000,
    });

    const events = data.events || [];
    const findEvent = (action) =>
      events.find((e) => e.eventAction === action)?.eventDate || null;

    const registrarEntity = (data.entities || []).find((e) =>
      (e.roles || []).includes('registrar')
    );

    return {
      available: true,
      domain: data.ldhName || domain,
      registrar: registrarEntity?.vcardArray
        ? extractVCardField(registrarEntity.vcardArray, 'fn')
        : data.registrar || null,
      registrationDate: findEvent('registration'),
      expirationDate: findEvent('expiration'),
      updatedDate: findEvent('last changed'),
      status: data.status || [],
    };
  } catch (err) {
    return { available: false, reason: 'Registration data unavailable' };
  }
}

function extractVCardField(vcardArray, field) {
  try {
    const entries = vcardArray[1] || [];
    const match = entries.find((e) => e[0] === field);
    return match ? match[3] : null;
  } catch {
    return null;
  }
}

module.exports = { getRegistrationInfo };
