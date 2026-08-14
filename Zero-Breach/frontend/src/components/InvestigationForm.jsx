import { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import TargetSelector, { TYPES } from './TargetSelector.jsx';
import FileUploadPanel from './FileUploadPanel.jsx';

const PATTERNS = {
  domain: /^(?!:\/\/)([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/,
  ip: /^(?:\d{1,3}\.){3}\d{1,3}$|^([a-fA-F0-9:]+:+)+[a-fA-F0-9]+$/,
  username: /^[a-zA-Z0-9_.-]{2,39}$/,
};

const EXAMPLES = {
  domain: 'example.com',
  ip: '8.8.8.8',
  username: 'octocat',
};

export default function InvestigationForm({ onSubmit, initialType = 'domain' }) {
  const [type, setType] = useState(initialType);
  const [target, setTarget] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    setType(initialType);
  }, [initialType]);

  const activeType = TYPES.find((t) => t.id === type);

  function handleSubmit(e) {
    e.preventDefault();
    const trimmed = target.trim();

    if (!trimmed) {
      setError(`Please enter a ${activeType.label.toLowerCase()}.`);
      return;
    }
    if (!PATTERNS[type].test(trimmed)) {
      setError(`That doesn't look like a valid ${activeType.label.toLowerCase()}. Example: ${activeType.placeholder}`);
      return;
    }

    setError('');
    onSubmit(type, trimmed);
  }

  return (
    <div className="w-full bg-surface/90 backdrop-blur border border-border rounded-2xl p-5 sm:p-6 shadow-2xl">
      <TargetSelector
        selected={type}
        onSelect={(id) => {
          setType(id);
          setError('');
        }}
      />

      {type === 'file' ? (
        <div className="mt-4">
          <FileUploadPanel onSubmit={(file) => onSubmit('file', file)} />
        </div>
      ) : (
        <>
          <form onSubmit={handleSubmit} className="mt-4 space-y-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                placeholder={activeType.placeholder}
                className="flex-1 bg-ink border border-border rounded-lg px-4 py-3.5 text-sm text-text placeholder:text-text-muted focus:outline-none focus:border-accent/60 focus:shadow-glow-sm mono"
              />
              <button
                type="submit"
                className="flex items-center justify-center gap-2 mono text-sm tracking-widest bg-accent text-white font-semibold px-6 py-3.5 rounded-lg hover:bg-accent-dim transition-colors shadow-glow-sm whitespace-nowrap"
              >
                INVESTIGATE
                <ArrowRight size={16} />
              </button>
            </div>
            {error && <p className="text-high text-xs">{error}</p>}
          </form>

          <div className="flex flex-wrap items-center gap-2 mt-4">
            <span className="text-[11px] text-text-muted mono">Examples:</span>
            {Object.entries(EXAMPLES).map(([id, example]) => (
              <button
                key={id}
                onClick={() => {
                  setType(id);
                  setTarget(example);
                  setError('');
                }}
                className="text-[11px] mono bg-ink border border-border rounded-md px-2.5 py-1 text-text-muted hover:text-accent hover:border-accent/40 transition-colors"
              >
                {example}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
