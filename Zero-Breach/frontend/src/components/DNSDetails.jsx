import { Section, DetailRow } from './Section.jsx';

const RECORD_TYPES = ['A', 'AAAA', 'MX', 'NS', 'TXT', 'CNAME'];

export default function DNSDetails({ dns }) {
  return (
    <Section title="DNS Information">
      {RECORD_TYPES.map((rec) => {
        const values = dns?.[rec] || [];
        return <DetailRow key={rec} label={rec} value={values.length ? values.join(', ') : 'None found'} />;
      })}
    </Section>
  );
}
