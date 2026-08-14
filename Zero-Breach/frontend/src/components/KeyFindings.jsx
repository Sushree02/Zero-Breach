const MARK = { safe: '✓', suspicious: '⚠', high: '!', unknown: '?' };
const COLOR = {
  safe: 'text-safe',
  suspicious: 'text-suspicious',
  high: 'text-high',
  unknown: 'text-unknown',
};

export default function KeyFindings({ findings }) {
  return (
    <div className="bg-surface-raised border border-border rounded-xl p-6">
      <p className="mono text-xs text-text-muted tracking-widest mb-4">KEY FINDINGS</p>
      {!findings || findings.length === 0 ? (
        <p className="text-sm text-text-muted">No notable findings were generated for this investigation.</p>
      ) : (
        <ul className="space-y-2.5">
          {findings.map((f, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm">
              <span className={`mono font-semibold ${COLOR[f.severity] || 'text-unknown'}`}>
                {MARK[f.severity] || '?'}
              </span>
              <span className="text-text">{f.message}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
