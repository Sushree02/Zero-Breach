const axios = require('axios');

const TOKEN = process.env.GITHUB_TOKEN;

function headers() {
  const h = { Accept: 'application/vnd.github+json' };
  if (TOKEN) h.Authorization = `Bearer ${TOKEN}`;
  return h;
}

// Looks up a public GitHub profile. GitHub's user API is public and
// does not require authentication, though a token raises rate limits.
async function checkGithubUsername(username) {
  try {
    const { data } = await axios.get(
      `https://api.github.com/users/${encodeURIComponent(username)}`,
      { headers: headers(), timeout: 8000 }
    );

    return {
      platform: 'GitHub',
      found: true,
      profileUrl: data.html_url,
      displayName: data.name || null,
      bio: data.bio || null,
      website: data.blog || null,
      avatarUrl: data.avatar_url || null,
      publicRepos: data.public_repos ?? null,
      followers: data.followers ?? null,
      following: data.following ?? null,
      accountCreated: data.created_at || null,
    };
  } catch (err) {
    if (err.response && err.response.status === 404) {
      return { platform: 'GitHub', found: false };
    }
    return { platform: 'GitHub', found: false, error: 'GitHub lookup unavailable' };
  }
}

module.exports = { checkGithubUsername };
