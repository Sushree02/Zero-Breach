const TYPES = [
  { id: 'domain', label: 'Domain', placeholder: 'example.com' },
  { id: 'ip', label: 'IP Address', placeholder: '8.8.8.8' },
  { id: 'username', label: 'Username', placeholder: 'cyber_soumy' },
  { id: 'file', label: 'File', placeholder: '' },
];

export default function TargetSelector({ selected, onSelect }) {
  return (
    <div className="flex gap-1 bg-ink/60 border border-border rounded-lg p-1">
      {TYPES.map((t) => (
        <button
          key={t.id}
          onClick={() => onSelect(t.id)}
          className={`flex-1 py-2 rounded-md text-xs sm:text-sm font-semibold transition-all mono tracking-wide
            ${
              selected === t.id
                ? 'bg-accent text-white shadow-glow-sm'
                : 'text-text-muted hover:text-text'
            }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

export { TYPES };
