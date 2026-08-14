// Simple, dependency-free input validation helpers

const DOMAIN_REGEX =
  /^(?!-)[A-Za-z0-9-]{1,63}(?<!-)(\.(?!-)[A-Za-z0-9-]{1,63}(?<!-))+$/;

const IPV4_REGEX =
  /^(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)){3}$/;

const IPV6_REGEX =
  /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|::([0-9a-fA-F]{1,4}:){0,6}[0-9a-fA-F]{1,4})$/;

const USERNAME_REGEX = /^[A-Za-z0-9_.-]{1,39}$/;

function isValidDomain(value) {
  if (!value || typeof value !== 'string') return false;
  const trimmed = value.trim().toLowerCase();
  return DOMAIN_REGEX.test(trimmed) && trimmed.length <= 253;
}

function isValidIP(value) {
  if (!value || typeof value !== 'string') return false;
  const trimmed = value.trim();
  return IPV4_REGEX.test(trimmed) || IPV6_REGEX.test(trimmed);
}

function isValidUsername(value) {
  if (!value || typeof value !== 'string') return false;
  return USERNAME_REGEX.test(value.trim());
}

function ipVersion(value) {
  return IPV4_REGEX.test(value.trim()) ? 'IPv4' : 'IPv6';
}

module.exports = {
  isValidDomain,
  isValidIP,
  isValidUsername,
  ipVersion,
};
