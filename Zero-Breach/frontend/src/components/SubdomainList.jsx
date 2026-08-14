import { Section, Unavailable } from './Section.jsx';

export default function SubdomainList({ subdomains, available }) {
  return (
    <Section title="Subdomains">
      {!available ? (
        <Unavailable reason="no subdomain enumeration source is configured for this build" />
      ) : subdomains && subdomains.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {subdomains.map((sub) => (
            <span
              key={sub}
              className="mono text-xs bg-ink border border-border rounded-md px-2.5 py-1 text-text-muted"
            >
              {sub}
            </span>
          ))}
        </div>
      ) : (
        <p className="text-sm text-text-muted">No subdomains discovered.</p>
      )}
    </Section>
  );
}
