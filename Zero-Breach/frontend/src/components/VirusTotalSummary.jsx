import { Section, DetailRow, Unavailable } from './Section.jsx';

export default function VirusTotalSummary({ vt }) {
  if (!vt || !vt.available) {
    return (
      <Section title="VirusTotal Analysis">
        <Unavailable reason={vt?.reason} />
      </Section>
    );
  }

  const stats = vt.stats || {};

  return (
    <Section title="VirusTotal Analysis">
      <DetailRow label="Total Engines" value={stats.total ?? 'N/A'} />
      <DetailRow label="Malicious" value={stats.malicious ?? 0} />
      <DetailRow label="Suspicious" value={stats.suspicious ?? 0} />
      <DetailRow label="Harmless" value={stats.harmless ?? 0} />
      <DetailRow label="Undetected" value={stats.undetected ?? 0} />
      <DetailRow label="Timeout" value={stats.timeout ?? 0} />
    </Section>
  );
}
