import { Section, DetailRow, Unavailable } from './Section.jsx';

export default function IPDetails({ title = 'IP / Infrastructure', info, ipVersion, reverseDns }) {
  if (!info || info.available === false) {
    return (
      <Section title={title}>
        <Unavailable reason={info?.reason} />
      </Section>
    );
  }

  const location = [info.city, info.region, info.country].filter(Boolean).join(', ');

  return (
    <Section title={title}>
      {info.ip && <DetailRow label="IP Address" value={info.ip} />}
      {ipVersion && <DetailRow label="IP Version" value={ipVersion} />}
      <DetailRow label="Organization / ISP" value={info.organization} />
      <DetailRow label="ASN" value={info.asn} />
      <DetailRow label="Approximate Location" value={location || 'N/A'} />
      {reverseDns !== undefined && (
        <DetailRow label="Reverse DNS" value={reverseDns ? reverseDns.join(', ') : 'None found'} />
      )}
    </Section>
  );
}
