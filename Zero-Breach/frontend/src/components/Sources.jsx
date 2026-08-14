import { Section } from './Section.jsx';

export default function Sources({ sources }) {
  return (
    <Section title="Sources Used">
      {!sources || sources.length === 0 ? (
        <p className="text-sm text-text-muted">No external sources were used for this investigation.</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {sources.map((s) => (
            <span
              key={s}
              className="mono text-xs bg-ink border border-border rounded-md px-2.5 py-1 text-accent"
            >
              {s}
            </span>
          ))}
        </div>
      )}
    </Section>
  );
}
