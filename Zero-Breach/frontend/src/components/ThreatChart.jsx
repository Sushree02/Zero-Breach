import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = {
  Safe: '#2fbf71',
  Suspicious: '#e0a83e',
  'High Risk': '#e0273f',
  Unknown: '#5b6478',
};

export default function ThreatChart({ distribution }) {
  const data = [
    { name: 'Safe', value: distribution?.safe || 0 },
    { name: 'Suspicious', value: distribution?.suspicious || 0 },
    { name: 'High Risk', value: distribution?.highRisk || 0 },
    { name: 'Unknown', value: distribution?.unknown || 0 },
  ];

  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="bg-surface-raised border border-border rounded-xl p-6">
      <p className="mono text-xs text-text-muted tracking-widest mb-4">THREAT DISTRIBUTION</p>
      {total === 0 ? (
        <div className="h-56 flex items-center justify-center text-sm text-text-muted">
          No chart data available
        </div>
      ) : (
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={2}
              >
                {data.map((entry) => (
                  <Cell key={entry.name} fill={COLORS[entry.name]} stroke="#11141e" />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: '#11141e', border: '1px solid #1e2330', borderRadius: 8, fontSize: 12 }}
                itemStyle={{ color: '#eceef3' }}
              />
              <Legend
                verticalAlign="bottom"
                height={24}
                wrapperStyle={{ fontSize: 11, color: '#7a8296' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
