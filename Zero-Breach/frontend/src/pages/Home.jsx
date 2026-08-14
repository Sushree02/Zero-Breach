import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Globe, MapPin, User, FileSearch, ShieldCheck } from 'lucide-react';
import InvestigationForm from '../components/InvestigationForm.jsx';
import LoadingState from '../components/LoadingState.jsx';
import WorldMapBackground from '../components/WorldMapBackground.jsx';
import { investigateDomain, investigateIP, investigateUsername, investigateFile } from '../services/api.js';

const INVESTIGATORS = {
  domain: investigateDomain,
  ip: investigateIP,
  username: investigateUsername,
  file: investigateFile,
};

const CAPABILITIES = [
  {
    icon: Globe,
    title: 'Domain Intelligence',
    desc: 'DNS records, RDAP registration data, resolved infrastructure, and reputation checks.',
  },
  {
    icon: MapPin,
    title: 'IP Reconnaissance',
    desc: 'Geolocation, ASN and ISP ownership, reverse DNS, and threat reputation via IPinfo & VirusTotal.',
  },
  {
    icon: User,
    title: 'Username Presence',
    desc: 'Public profile discovery across GitHub and other platforms with legitimate public endpoints.',
  },
  {
    icon: FileSearch,
    title: 'File Analysis',
    desc: 'MD5/SHA-1/SHA-256 hashing and multi-engine malware detection via VirusTotal.',
  },
];

export default function Home() {
  const navigate = useNavigate();
  const location = useLocation();
  const presetType = location.state?.presetType || 'domain';

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(type, target) {
    setLoading(true);
    setError('');
    try {
      const result = await INVESTIGATORS[type](target);
      navigate('/dashboard', { state: { result } });
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0">
          <WorldMapBackground className="absolute inset-0 h-full w-full" />
          <div className="absolute inset-0 bg-gradient-to-b from-ink/40 via-ink/70 to-ink" />
        </div>

        <div className="relative max-w-6xl mx-auto px-6 py-16 sm:py-20">
          <span className="inline-flex items-center gap-2 mono text-[11px] tracking-[0.25em] text-accent border border-accent/30 bg-accent/10 rounded-full px-3 py-1 mb-6">
            <ShieldCheck size={12} />
            ZERO BREACH
          </span>

          <h1 className="display text-4xl sm:text-5xl lg:text-6xl font-extrabold text-text leading-tight max-w-2xl">
            DEFENDING FROM THE <span className="text-accent">OUTSIDE</span> IN
          </h1>
          <p className="text-text-muted max-w-xl mt-4 text-sm sm:text-base">
            Open-source intelligence for a safer investigation. Investigate. Analyze. Defend — using only
            publicly available data and legitimate third-party sources.
          </p>

          <div className="mt-8 max-w-2xl">
            {loading ? (
              <div className="bg-surface/90 backdrop-blur border border-border rounded-2xl p-6">
                <LoadingState />
              </div>
            ) : (
              <>
                <InvestigationForm onSubmit={handleSubmit} initialType={presetType} />
                {error && <p className="text-high text-sm mt-3">{error}</p>}
              </>
            )}
          </div>
        </div>
      </section>

      {/* Capabilities */}
      <section className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {CAPABILITIES.map((c) => {
            const Icon = c.icon;
            return (
              <div key={c.title} className="bg-surface-raised border border-border rounded-xl p-5">
                <div className="h-9 w-9 rounded-lg bg-accent/10 border border-accent/30 flex items-center justify-center mb-3">
                  <Icon size={16} className="text-accent" />
                </div>
                <p className="display font-semibold text-text text-sm mb-1">{c.title}</p>
                <p className="text-xs text-text-muted leading-relaxed">{c.desc}</p>
              </div>
            );
          })}
        </div>

        <p className="text-xs text-text-muted text-center max-w-lg mx-auto mt-10 border-t border-border pt-6">
          Zero Breach uses publicly available information and third-party intelligence sources. Results may be
          incomplete or inaccurate.
        </p>
      </section>
    </div>
  );
}
