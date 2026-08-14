import { useRef, useState } from 'react';
import { UploadCloud, FileText, X, ShieldAlert } from 'lucide-react';

const MAX_FILE_SIZE = 32 * 1024 * 1024; // matches backend's VirusTotal upload limit

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  const units = ['KB', 'MB', 'GB'];
  let value = bytes / 1024;
  let i = 0;
  while (value >= 1024 && i < units.length - 1) {
    value /= 1024;
    i++;
  }
  return `${value.toFixed(2)} ${units[i]}`;
}

export default function FileUploadPanel({ onSubmit }) {
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [acknowledged, setAcknowledged] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState('');

  function handleFile(selected) {
    if (!selected) return;
    if (selected.size === 0) {
      setError('Please select a file.');
      return;
    }
    if (selected.size > MAX_FILE_SIZE) {
      setError('File is too large for the current VirusTotal upload method (32MB limit).');
      return;
    }
    setError('');
    setFile(selected);
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!file) {
      setError('Please select a file.');
      return;
    }
    if (!acknowledged) {
      setError('Please confirm the privacy notice before scanning.');
      return;
    }
    onSubmit(file);
  }

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          handleFile(e.dataTransfer.files?.[0]);
        }}
        className={`rounded-xl border-2 border-dashed p-8 text-center transition-colors ${
          dragging ? 'border-accent bg-accent/5' : 'border-border bg-ink/40'
        }`}
      >
        {!file ? (
          <>
            <UploadCloud className="mx-auto text-text-muted mb-3" size={30} />
            <p className="text-sm text-text mb-1">Drop file here</p>
            <p className="text-xs text-text-muted mb-4">or</p>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="mono text-xs tracking-widest bg-surface-raised border border-border rounded-lg px-4 py-2 text-text hover:border-accent/50 hover:text-accent transition-colors"
            >
              CHOOSE FILE
            </button>
            <input
              ref={inputRef}
              type="file"
              className="hidden"
              onChange={(e) => handleFile(e.target.files?.[0])}
            />
          </>
        ) : (
          <div className="flex items-center justify-between gap-3 bg-surface-raised border border-border rounded-lg px-4 py-3 text-left">
            <div className="flex items-center gap-3 min-w-0">
              <FileText size={18} className="text-accent shrink-0" />
              <div className="min-w-0">
                <p className="text-sm text-text truncate" title={file.name}>
                  {file.name}
                </p>
                <p className="mono text-[11px] text-text-muted">
                  {formatBytes(file.size)} · {file.type || 'unknown type'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setFile(null);
                setError('');
                if (inputRef.current) inputRef.current.value = '';
              }}
              className="text-text-muted hover:text-high p-1"
              aria-label="Remove file"
            >
              <X size={16} />
            </button>
          </div>
        )}
      </div>

      <div className="mt-4 bg-suspicious/5 border border-suspicious/25 rounded-lg p-4">
        <div className="flex gap-2 mb-2">
          <ShieldAlert size={15} className="text-suspicious shrink-0 mt-0.5" />
          <p className="mono text-[11px] text-suspicious tracking-widest">PRIVACY NOTICE</p>
        </div>
        <p className="text-xs text-text-muted leading-relaxed mb-3">
          Files submitted for public analysis may be shared with VirusTotal and its security partners. Do not
          upload confidential, private, personal, proprietary, or sensitive files.
        </p>
        <label className="flex items-start gap-2 text-xs text-text cursor-pointer">
          <input
            type="checkbox"
            checked={acknowledged}
            onChange={(e) => setAcknowledged(e.target.checked)}
            className="mt-0.5 accent-[#ef3b4a]"
          />
          I understand that this file may be submitted to a third-party threat intelligence service.
        </label>
      </div>

      {error && <p className="text-high text-xs mt-3">{error}</p>}

      <button
        onClick={handleSubmit}
        disabled={!file || !acknowledged}
        className="w-full mt-4 flex items-center justify-center gap-2 mono text-sm tracking-widest bg-accent text-white font-semibold px-6 py-3.5 rounded-lg hover:bg-accent-dim transition-colors shadow-glow-sm disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
      >
        START FILE INVESTIGATION
      </button>
    </div>
  );
}
