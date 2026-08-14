import { Section } from './Section.jsx';

export default function UsernameResults({ platformResults }) {
  const github = platformResults?.find((p) => p.platform === 'GitHub' && p.found);

  return (
    <>
      <Section title="Public Username Presence">
        <div className="space-y-2">
          {(platformResults || []).map((p) => (
            <div
              key={p.platform}
              className="flex items-center justify-between py-1.5 border-b border-border/60 last:border-none text-sm"
            >
              <span className="text-text">{p.platform}</span>
              <div className="flex items-center gap-3">
                <span
                  className={`mono text-[10px] tracking-widest px-2 py-0.5 rounded-full border ${
                    p.found
                      ? 'text-safe border-safe/30 bg-safe/10'
                      : 'text-text-muted border-border bg-ink'
                  }`}
                >
                  {p.found ? 'FOUND' : 'NOT FOUND'}
                </span>
                {p.found && p.profileUrl && (
                  <a
                    href={p.profileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-accent text-xs hover:underline"
                  >
                    View Profile
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-text-muted italic mt-4">
          Results indicate a potential public match only and do not confirm that accounts belong to the same
          individual.
        </p>
      </Section>

      {github && (
        <Section title="GitHub Public Profile">
          <div className="flex items-start gap-4">
            {github.avatarUrl && (
              <img
                src={github.avatarUrl}
                alt={`${github.displayName || 'GitHub'} avatar`}
                className="h-16 w-16 rounded-lg border border-border"
              />
            )}
            <div className="flex-1 space-y-1 text-sm">
              {github.displayName && <p className="text-text font-medium">{github.displayName}</p>}
              {github.bio && <p className="text-text-muted">{github.bio}</p>}
              {github.website && (
                <p>
                  <a href={github.website} target="_blank" rel="noreferrer" className="text-accent hover:underline">
                    {github.website}
                  </a>
                </p>
              )}
              <p className="text-text-muted mono text-xs">
                {github.publicRepos ?? 0} repos · {github.followers ?? 0} followers · {github.following ?? 0}{' '}
                following
              </p>
            </div>
          </div>
        </Section>
      )}
    </>
  );
}
