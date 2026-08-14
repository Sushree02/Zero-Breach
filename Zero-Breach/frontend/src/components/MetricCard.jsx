export default function MetricCard({ label, value, sub }) {
  return (
    <div className="bg-surface-raised border border-border rounded-xl p-4">
      <p className="mono text-[10px] text-text-muted tracking-widest mb-1">{label}</p>
      <p className="display text-lg font-semibold text-text truncate" title={typeof value === 'string' ? value : undefined}>
        {value ?? '—'}
      </p>
      {sub && <p className="text-xs text-text-muted mt-0.5">{sub}</p>}
    </div>
  );
}
