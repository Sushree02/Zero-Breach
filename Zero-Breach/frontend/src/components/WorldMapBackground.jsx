// Purely decorative background visual: a dot-grid world silhouette with a
// handful of glowing connection nodes/lines. It represents no real data —
// it's an aesthetic nod to "global OSINT infrastructure", not a live feed.

const CONTINENTS = [
  // Rough dot-grid silhouettes (x%, y%) approximating landmasses on a
  // 1000x500 equirectangular canvas. Intentionally stylized, not precise.
  { cx: 190, cy: 150, rx: 90, ry: 55 }, // N. America
  { cx: 250, cy: 300, rx: 55, ry: 90 }, // S. America
  { cx: 480, cy: 140, rx: 70, ry: 50 }, // Europe
  { cx: 500, cy: 260, rx: 80, ry: 100 }, // Africa
  { cx: 650, cy: 160, rx: 130, ry: 70 }, // Asia
  { cx: 800, cy: 340, rx: 60, ry: 40 }, // Australia
];

function generateDots() {
  const dots = [];
  const spacing = 14;
  for (let x = 0; x < 1000; x += spacing) {
    for (let y = 0; y < 500; y += spacing) {
      const inLand = CONTINENTS.some((c) => {
        const dx = (x - c.cx) / c.rx;
        const dy = (y - c.cy) / c.ry;
        return dx * dx + dy * dy <= 1;
      });
      if (inLand && Math.random() > 0.35) {
        dots.push({ x, y });
      }
    }
  }
  return dots;
}

const DOTS = generateDots();

const NODES = [
  { x: 190, y: 150 },
  { x: 480, y: 140 },
  { x: 650, y: 160 },
  { x: 500, y: 260 },
  { x: 250, y: 300 },
  { x: 800, y: 340 },
];

const LINKS = [
  [0, 1],
  [1, 2],
  [2, 5],
  [1, 3],
  [0, 4],
  [3, 5],
];

export default function WorldMapBackground({ className = '' }) {
  return (
    <div className={`pointer-events-none select-none ${className}`}>
      <svg viewBox="0 0 1000 500" className="w-full h-full opacity-80">
        <defs>
          <radialGradient id="nodeGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ff5c72" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#ff5c72" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="fadeMask" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="white" stopOpacity="1" />
            <stop offset="100%" stopColor="white" stopOpacity="0.3" />
          </linearGradient>
        </defs>

        {DOTS.map((d, i) => (
          <circle key={i} cx={d.x} cy={d.y} r="1.1" fill="#2a3244" />
        ))}

        {LINKS.map(([a, b], i) => (
          <line
            key={i}
            x1={NODES[a].x}
            y1={NODES[a].y}
            x2={NODES[b].x}
            y2={NODES[b].y}
            stroke="#e0273f"
            strokeOpacity="0.35"
            strokeWidth="1"
            className="flow-line"
          />
        ))}

        {NODES.map((n, i) => (
          <g key={i}>
            <circle cx={n.x} cy={n.y} r="14" fill="url(#nodeGlow)" />
            <circle cx={n.x} cy={n.y} r="2.5" fill="#ff5c72" className="pulse-node" style={{ transformOrigin: `${n.x}px ${n.y}px` }} />
          </g>
        ))}
      </svg>
    </div>
  );
}
