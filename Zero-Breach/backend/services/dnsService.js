const dns = require('dns').promises;

// Standard public DNS resolution - always available, no API key required.
async function resolveDNS(domain) {
  const records = { A: [], AAAA: [], MX: [], NS: [], TXT: [], CNAME: [] };

  const attempts = [
    dns.resolve4(domain).then((r) => (records.A = r)).catch(() => {}),
    dns.resolve6(domain).then((r) => (records.AAAA = r)).catch(() => {}),
    dns.resolveMx(domain).then((r) => (records.MX = r.map((m) => `${m.exchange} (priority ${m.priority})`))).catch(() => {}),
    dns.resolveNs(domain).then((r) => (records.NS = r)).catch(() => {}),
    dns.resolveTxt(domain).then((r) => (records.TXT = r.map((t) => t.join(''))))
      .catch(() => {}),
    dns.resolveCname(domain).then((r) => (records.CNAME = r)).catch(() => {}),
  ];

  await Promise.all(attempts);
  return records;
}

module.exports = { resolveDNS };
