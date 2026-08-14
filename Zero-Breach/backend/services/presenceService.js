const axios = require('axios');

// Checks whether a public profile page exists for a username on a
// handful of platforms that expose predictable public profile URLs.
// This only ever requests the public page itself - no login, no
// private data, no scraping behind authentication.
const PLATFORMS = [
  {
    name: 'Reddit',
    url: (u) => `https://www.reddit.com/user/${encodeURIComponent(u)}/about.json`,
    isFound: (status) => status === 200,
    profileUrl: (u) => `https://www.reddit.com/user/${u}`,
  },
  {
    name: 'YouTube',
    url: (u) => `https://www.youtube.com/@${encodeURIComponent(u)}`,
    isFound: (status) => status === 200,
    profileUrl: (u) => `https://www.youtube.com/@${u}`,
  },
  {
    name: 'X (Twitter)',
    url: (u) => `https://x.com/${encodeURIComponent(u)}`,
    isFound: (status) => status === 200,
    profileUrl: (u) => `https://x.com/${u}`,
  },
];

async function checkPlatform(platform, username) {
  try {
    const res = await axios.get(platform.url(username), {
      timeout: 6000,
      validateStatus: () => true,
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; ZeroBreachOSINT/1.0)' },
    });

    return {
      platform: platform.name,
      found: platform.isFound(res.status),
      profileUrl: platform.isFound(res.status) ? platform.profileUrl(username) : null,
    };
  } catch (err) {
    return { platform: platform.name, found: false, error: 'Check unavailable' };
  }
}

async function checkAllPlatforms(username) {
  const results = await Promise.all(
    PLATFORMS.map((platform) => checkPlatform(platform, username))
  );
  return results;
}

module.exports = { checkAllPlatforms };
