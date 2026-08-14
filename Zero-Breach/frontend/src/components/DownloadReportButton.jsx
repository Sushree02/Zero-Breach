import { useState } from 'react';
import { downloadReport } from '../services/api.js';

export default function DownloadReportButton({ result }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleClick() {
    setLoading(true);
    setError('');
    try {
      await downloadReport(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        onClick={handleClick}
        disabled={loading}
        className="mono text-sm tracking-widest bg-accent text-white font-semibold px-8 py-3 rounded-lg hover:bg-accent-dim transition-colors shadow-glow-sm disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? 'GENERATING PDF...' : 'DOWNLOAD PDF REPORT'}
      </button>
      {error && <p className="text-high text-xs">{error}</p>}
    </div>
  );
}
