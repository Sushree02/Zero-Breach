// Transparent, rule-based risk scoring.
// This is NOT machine learning and makes NO claim of certainty.
// Every point added to the score is driven by an actual, named
// signal from the collected OSINT data.

function levelFromScore(score) {
  if (score === null) return 'Insufficient Data';
  if (score >= 75) return 'High Risk';
  if (score >= 50) return 'Suspicious';
  if (score >= 25) return 'Moderate';
  return 'Low Risk';
}

function analyzeDomain({ vt, dnsRecords, registration }) {
  const findings = [];
  let score = 0;
  let signalsFound = 0;

  if (dnsRecords && dnsRecords.A && dnsRecords.A.length > 0) {
    findings.push({ severity: 'safe', message: 'DNS records successfully resolved.' });
    signalsFound++;
  } else {
    findings.push({ severity: 'unknown', message: 'No DNS A records could be resolved.' });
  }

  if (vt && vt.available) {
    signalsFound++;
    const stats = vt.stats || { malicious: 0, suspicious: 0 };
    if (stats.malicious > 0) {
      score += Math.min(50, stats.malicious * 8);
      findings.push({
        severity: 'high',
        message: `Threat intelligence flagged ${stats.malicious} malicious detection(s).`,
      });
    }
    if (stats.suspicious > 0) {
      score += Math.min(25, stats.suspicious * 5);
      findings.push({
        severity: 'suspicious',
        message: `Threat intelligence flagged ${stats.suspicious} suspicious detection(s).`,
      });
    }
    if (stats.malicious === 0 && stats.suspicious === 0) {
      findings.push({ severity: 'safe', message: 'No malicious detections from threat intelligence sources.' });
    }
    if (vt.reputation < 0) {
      score += 10;
      findings.push({ severity: 'suspicious', message: 'Domain has a negative community reputation score.' });
    }
  } else {
    findings.push({ severity: 'unknown', message: 'Threat intelligence data unavailable.' });
  }

  if (registration && registration.available && registration.registrationDate) {
    signalsFound++;
    const ageDays =
      (Date.now() - new Date(registration.registrationDate).getTime()) / 86400000;
    if (ageDays >= 0 && ageDays < 30) {
      score += 15;
      findings.push({ severity: 'suspicious', message: 'Domain was registered very recently (under 30 days ago).' });
    } else if (ageDays >= 0) {
      findings.push({ severity: 'safe', message: 'Domain registration age does not indicate recent creation.' });
    }
  }

  if (signalsFound === 0) {
    return { score: null, level: 'Insufficient Data', findings };
  }

  score = Math.max(0, Math.min(100, Math.round(score)));
  return { score, level: levelFromScore(score), findings };
}

function analyzeIP({ vt, ipinfo }) {
  const findings = [];
  let score = 0;
  let signalsFound = 0;

  if (ipinfo && ipinfo.available) {
    signalsFound++;
    findings.push({ severity: 'safe', message: 'IP infrastructure and ownership information identified.' });
  } else {
    findings.push({ severity: 'unknown', message: 'IP infrastructure data unavailable.' });
  }

  if (vt && vt.available) {
    signalsFound++;
    const stats = vt.stats || { malicious: 0, suspicious: 0 };
    if (stats.malicious > 0) {
      score += Math.min(60, stats.malicious * 10);
      findings.push({
        severity: 'high',
        message: `Threat intelligence flagged ${stats.malicious} malicious detection(s) for this IP.`,
      });
    }
    if (stats.suspicious > 0) {
      score += Math.min(25, stats.suspicious * 5);
      findings.push({
        severity: 'suspicious',
        message: `Threat intelligence flagged ${stats.suspicious} suspicious detection(s) for this IP.`,
      });
    }
    if (stats.malicious === 0 && stats.suspicious === 0) {
      findings.push({ severity: 'safe', message: 'No malicious detections from threat intelligence sources.' });
    }
  } else {
    findings.push({ severity: 'unknown', message: 'Threat intelligence data unavailable.' });
  }

  if (signalsFound === 0) {
    return { score: null, level: 'Insufficient Data', findings };
  }

  score = Math.max(0, Math.min(100, Math.round(score)));
  return { score, level: levelFromScore(score), findings };
}

function analyzeUsername({ platformResults }) {
  const findings = [];
  const foundCount = platformResults.filter((p) => p.found).length;

  if (foundCount === 0) {
    findings.push({ severity: 'unknown', message: 'No public profiles were found on the checked platforms.' });
  } else {
    findings.push({
      severity: 'safe',
      message: `Public presence found on ${foundCount} of ${platformResults.length} checked platform(s).`,
    });
  }

  // Username investigations are informational (presence, not maliciousness),
  // so we intentionally do not assign a risk score here.
  return { score: null, level: 'Insufficient Data', findings };
}

function analyzeFile({ virusTotal }) {
  const findings = [];
  let score = 0;
  let signalsFound = 0;

  findings.push({ severity: 'safe', message: 'File hashes (MD5, SHA-1, SHA-256) calculated successfully.' });
  signalsFound++;

  if (virusTotal && virusTotal.available) {
    signalsFound++;
    const stats = virusTotal.stats || { malicious: 0, suspicious: 0 };
    if (stats.malicious > 0) {
      score += Math.min(70, stats.malicious * 12);
      findings.push({
        severity: 'high',
        message: `${stats.malicious} security engine(s) detected malicious behavior in this file.`,
      });
    }
    if (stats.suspicious > 0) {
      score += Math.min(25, stats.suspicious * 6);
      findings.push({
        severity: 'suspicious',
        message: `${stats.suspicious} security engine(s) classified this file as suspicious.`,
      });
    }
    if (stats.malicious === 0 && stats.suspicious === 0) {
      findings.push({ severity: 'safe', message: 'No malicious or suspicious detections were returned.' });
    }
  } else {
    findings.push({
      severity: 'unknown',
      message: virusTotal?.reason || 'Threat intelligence analysis is currently unavailable.',
    });
  }

  if (signalsFound === 0) {
    return { score: null, level: 'Insufficient Data', findings };
  }

  score = Math.max(0, Math.min(100, Math.round(score)));
  return { score, level: levelFromScore(score), findings };
}

// Builds the pie-chart-ready indicator distribution from findings.
function buildIndicatorDistribution(findings) {
  const distribution = { safe: 0, suspicious: 0, highRisk: 0, unknown: 0 };
  for (const f of findings) {
    if (f.severity === 'safe') distribution.safe++;
    else if (f.severity === 'suspicious') distribution.suspicious++;
    else if (f.severity === 'high') distribution.highRisk++;
    else distribution.unknown++;
  }
  return distribution;
}

module.exports = {
  analyzeDomain,
  analyzeIP,
  analyzeUsername,
  analyzeFile,
  buildIndicatorDistribution,
  levelFromScore,
};
