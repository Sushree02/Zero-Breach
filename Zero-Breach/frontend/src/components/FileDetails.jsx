import { Section, DetailRow } from './Section.jsx';

function formatBytes(bytes) {
  if (typeof bytes !== 'number') return 'N/A';
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

export default function FileDetails({ info }) {
  if (!info) return null;

  return (
    <Section title="File Information">
      <DetailRow label="Filename" value={info.name} />
      <DetailRow label="File Size" value={formatBytes(info.size)} />
      <DetailRow label="MIME Type" value={info.mimeType} />
      <DetailRow label="MD5" value={info.md5} />
      <DetailRow label="SHA-1" value={info.sha1} />
      <DetailRow label="SHA-256" value={info.sha256} />
    </Section>
  );
}
