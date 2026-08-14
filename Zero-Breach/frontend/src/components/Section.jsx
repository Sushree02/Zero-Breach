export function Section({ title, children }) {
  return (
    <div className="bg-surface-raised border border-border rounded-xl p-6">
      <p className="mono text-xs text-text-muted tracking-widest mb-4">{title.toUpperCase()}</p>
      {children}
    </div>
  );
}

export function DetailRow({ label, value }) {
  return (
    <div className="flex justify-between gap-4 py-1.5 border-b border-border/60 last:border-none text-sm">
      <span className="text-text-muted">{label}</span>
      <span className="text-text text-right break-all">{value ?? 'N/A'}</span>
    </div>
  );
}

export function Unavailable({ reason }) {
  return (
    <p className="text-sm text-text-muted italic">
      Data unavailable{reason ? ` — ${reason}` : ''}
    </p>
  );
}
