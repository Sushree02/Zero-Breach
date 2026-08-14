import { Section, DetailRow, Unavailable } from './Section.jsx';

export default function ThreatIntel({ vt }) {
  if (!vt || !vt.available) {
    return (
      <Section title="Threat Intelligence">
        <Unavailable reason={vt?.reason} />
      </Section>
    );
  }

  return (
    <Section title="Threat Intelligence">
      <DetailRow label="Reputation Score" value={vt.reputation ?? 'N/A'} />
      <DetailRow label="Malicious Detections" value={vt.stats?.malicious ?? 0} />
      <DetailRow label="Suspicious Detections" value={vt.stats?.suspicious ?? 0} />
      <DetailRow label="Harmless / Undetected" value={vt.stats?.harmless ?? 'N/A'} />
    </Section>
  );
}
