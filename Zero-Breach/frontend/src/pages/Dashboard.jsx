import { useLocation, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import RiskScore from '../components/RiskScore.jsx';
import MetricCard from '../components/MetricCard.jsx';
import ThreatChart from '../components/ThreatChart.jsx';
import KeyFindings from '../components/KeyFindings.jsx';
import DomainDetails from '../components/DomainDetails.jsx';
import DNSDetails from '../components/DNSDetails.jsx';
import IPDetails from '../components/IPDetails.jsx';
import SubdomainList from '../components/SubdomainList.jsx';
import ThreatIntel from '../components/ThreatIntel.jsx';
import UsernameResults from '../components/UsernameResults.jsx';
import FileDetails from '../components/FileDetails.jsx';
import VirusTotalSummary from '../components/VirusTotalSummary.jsx';
import EngineResultsTable from '../components/EngineResultsTable.jsx';
import Sources from '../components/Sources.jsx';
import DownloadReportButton from '../components/DownloadReportButton.jsx';

export default function Dashboard() {
  const location = useLocation();
  const result = location.state?.result;

  if (!result) {
    return (
      <div className="max-w-lg mx-auto px-6 py-24 text-center">
        <p className="text-text-muted mb-4">No investigation data to display.</p>
        <Link to="/" className="text-accent hover:underline text-sm">
          Start a new investigation
        </Link>
      </div>
    );
  }

  const {
    target,
    type,
    ipVersion,
    investigatedAt,
    riskScore,
    riskLevel,
    keyFindings,
    indicatorDistribution,
    domainInformation,
    dns,
    infrastructure,
    subdomains,
    subdomainsAvailable,
    ipInformation,
    reverseDns,
    threatIntelligence,
    platformResults,
    fileInformation,
    virusTotal,
    sources,
  } = result;

  return (
    <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
      <Link to="/" className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-accent mono">
        <ArrowLeft size={13} />
        NEW INVESTIGATION
      </Link>

      <p className="mono text-[11px] text-accent tracking-[0.25em]">INVESTIGATION RESULT</p>

      {/* Target summary */}
      <div className="bg-surface-raised border border-border rounded-xl p-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="mono text-[10px] text-text-muted tracking-widest mb-1">TARGET</p>
          <p className="display text-xl font-semibold text-text break-all">{target}</p>
        </div>
        <div className="flex gap-6">
          <div>
            <p className="mono text-[10px] text-text-muted tracking-widest mb-1">TYPE</p>
            <p className="mono text-sm text-accent">{type}</p>
          </div>
          <div>
            <p className="mono text-[10px] text-text-muted tracking-widest mb-1">INVESTIGATED</p>
            <p className="mono text-sm text-text">
              {investigatedAt ? new Date(investigatedAt).toLocaleString() : '—'}
            </p>
          </div>
        </div>
      </div>

      {/* Risk + chart */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <RiskScore score={riskScore} level={riskLevel} />
        <ThreatChart distribution={indicatorDistribution} />
      </div>

      {/* Quick metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {type === 'DOMAIN' && (
          <>
            <MetricCard label="IP Address" value={infrastructure?.ip || 'N/A'} />
            <MetricCard label="ASN" value={infrastructure?.asn || 'N/A'} />
            <MetricCard label="Subdomains" value={subdomainsAvailable ? subdomains?.length ?? 0 : 'N/A'} />
            <MetricCard label="Threat Detections" value={threatIntelligence?.stats?.malicious ?? 'N/A'} />
          </>
        )}
        {type === 'IP ADDRESS' && (
          <>
            <MetricCard label="IP Version" value={ipVersion} />
            <MetricCard label="Organization" value={ipInformation?.organization || 'N/A'} />
            <MetricCard label="ASN" value={ipInformation?.asn || 'N/A'} />
            <MetricCard label="Threat Detections" value={threatIntelligence?.stats?.malicious ?? 'N/A'} />
          </>
        )}
        {type === 'USERNAME' && (
          <>
            <MetricCard
              label="Platforms Found"
              value={platformResults?.filter((p) => p.found).length ?? 0}
            />
            <MetricCard label="Platforms Checked" value={platformResults?.length ?? 0} />
          </>
        )}
        {type === 'FILE' && (
          <>
            <MetricCard label="File Size" value={fileInformation ? `${(fileInformation.size / 1024).toFixed(1)} KB` : 'N/A'} />
            <MetricCard label="Total Engines" value={virusTotal?.stats?.total ?? 'N/A'} />
            <MetricCard label="Malicious" value={virusTotal?.stats?.malicious ?? 'N/A'} />
            <MetricCard label="Suspicious" value={virusTotal?.stats?.suspicious ?? 'N/A'} />
          </>
        )}
      </div>

      <KeyFindings findings={keyFindings} />

      {/* Type-specific detail sections */}
      {type === 'DOMAIN' && (
        <div className="space-y-6">
          <DomainDetails info={domainInformation} />
          <DNSDetails dns={dns} />
          <IPDetails info={infrastructure} />
          <SubdomainList subdomains={subdomains} available={subdomainsAvailable} />
          <ThreatIntel vt={threatIntelligence} />
        </div>
      )}

      {type === 'IP ADDRESS' && (
        <div className="space-y-6">
          <IPDetails title="IP Information" info={ipInformation} ipVersion={ipVersion} reverseDns={reverseDns} />
          <ThreatIntel vt={threatIntelligence} />
        </div>
      )}

      {type === 'USERNAME' && <UsernameResults platformResults={platformResults} />}

      {type === 'FILE' && (
        <div className="space-y-6">
          <FileDetails info={fileInformation} />
          <VirusTotalSummary vt={virusTotal} />
          <EngineResultsTable engines={virusTotal?.engines} />
        </div>
      )}

      <Sources sources={sources} />

      <div className="pt-4 pb-10 flex justify-center">
        <DownloadReportButton result={result} />
      </div>
    </div>
  );
}
