import { Section } from './Section.jsx';

const CATEGORY_STYLE = {
  malicious: 'text-high border-high/30 bg-high/10',
  suspicious: 'text-suspicious border-suspicious/30 bg-suspicious/10',
  harmless: 'text-safe border-safe/30 bg-safe/10',
  undetected: 'text-text-muted border-border bg-ink',
};

export default function EngineResultsTable({ engines }) {
  if (!engines || engines.length === 0) {
    return (
      <Section title="Security Engine Results">
        <p className="text-sm text-text-muted">No per-engine results were returned.</p>
      </Section>
    );
  }

  return (
    <Section title="Security Engine Results">
      <div className="max-h-72 overflow-y-auto pr-1 -mr-1">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-surface-raised">
            <tr className="text-left text-text-muted mono text-[10px] tracking-widest">
              <th className="pb-2 font-normal">ENGINE</th>
              <th className="pb-2 font-normal text-right">RESULT</th>
            </tr>
          </thead>
          <tbody>
            {engines.map((e) => (
              <tr key={e.engine} className="border-t border-border/60">
                <td className="py-2 text-text">{e.engine}</td>
                <td className="py-2 text-right">
                  <span
                    className={`mono text-[10px] tracking-wide px-2 py-0.5 rounded-full border ${
                      CATEGORY_STYLE[e.category] || CATEGORY_STYLE.undetected
                    }`}
                  >
                    {e.result}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Section>
  );
}
