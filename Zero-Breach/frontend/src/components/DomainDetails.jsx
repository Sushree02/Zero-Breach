import { Section, DetailRow, Unavailable } from './Section.jsx';

export default function DomainDetails({ info }) {
  if (!info || info.available === false) {
    return (
      <Section title="Domain Information">
        <Unavailable reason={info?.reason} />
      </Section>
    );
  }

  return (
    <Section title="Domain Information">
      <DetailRow label="Registrar" value={info.registrar} />
      <DetailRow label="Registration Date" value={info.registrationDate} />
      <DetailRow label="Expiration Date" value={info.expirationDate} />
      <DetailRow label="Updated Date" value={info.updatedDate} />
      <DetailRow label="Status" value={(info.status || []).join(', ') || 'N/A'} />
    </Section>
  );
}
