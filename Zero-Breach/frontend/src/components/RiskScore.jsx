const LEVEL_COLOR = {
  'LOW RISK': 'text-safe',
  MODERATE: 'text-suspicious',
  SUSPICIOUS: 'text-suspicious',
  'HIGH RISK': 'text-high',
  'INSUFFICIENT DATA': 'text-unknown',
};

const LEVEL_STROKE = {
  'LOW RISK': '#2fbf71',
  MODERATE: '#e0a83e',
  SUSPICIOUS: '#e0a83e',
  'HIGH RISK': '#e0273f',
  'INSUFFICIENT DATA': '#5b6478',
};

export default function RiskScore({ score, level }) {
  const normalizedLevel = (level || 'INSUFFICIENT DATA').toUpperCase();
  const hasScore = typeof score === 'number';
  const pct = hasScore ? Math.max(0, Math.min(100, score)) : 0;
  const radius = 46;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;
  const stroke = LEVEL_STROKE[normalizedLevel] || '#5b6478';

  return (
    <div className="bg-surface-raised border border-border rounded-xl p-6 flex flex-col items-center justify-center">
      <p className="mono text-xs text-text-muted tracking-widest mb-4">RISK SCORE</p>
      <div className="relative h-32 w-32">
        <svg viewBox="0 0 120 120" className="h-32 w-32 -rotate-90">
          <circle cx="60" cy="60" r={radius} stroke="#1e2330" strokeWidth="10" fill="none" />
          {hasScore && (
            <circle
              cx="60"
              cy="60"
              r={radius}
              stroke={stroke}
              strokeWidth="10"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              style={{ transition: 'stroke-dashoffset 0.6s ease' }}
            />
          )}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="display text-3xl font-semibold text-text">{hasScore ? pct : '--'}</span>
          <span className="mono text-[10px] text-text-muted">/100</span>
        </div>
      </div>
      <p className={`mono text-sm font-semibold tracking-widest mt-4 ${LEVEL_COLOR[normalizedLevel] || 'text-unknown'}`}>
        {normalizedLevel}
      </p>
    </div>
  );
}
