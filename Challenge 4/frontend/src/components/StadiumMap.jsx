import React from 'react';

// Maps node text identifiers to map coordinates
const NODE_COORDINATES = {
  // Gates
  "gate-a": { x: 200, y: 40, label: "Gate A", type: "gate" },
  "gate-b": { x: 360, y: 150, label: "Gate B", type: "gate" },
  "gate-c": { x: 200, y: 260, label: "Gate C", type: "gate" },
  "gate-d": { x: 40, y: 150, label: "Gate D", type: "gate" },
  
  // Concessions
  "con-1": { x: 280, y: 90, label: "Sec 108 (Tacos)", type: "food" },
  "con-2": { x: 120, y: 210, label: "Sec 124 (Burgers)", type: "food" },
  "con-3": { x: 300, y: 200, label: "Sec 115 (Brews)", type: "drink" },
  "con-4": { x: 100, y: 100, label: "Sec 132 (Ice Cream)", type: "drink" },
  "con-5": { x: 200, y: 80, label: "Sec 102 (Merch)", type: "merch" },
  "con-6": { x: 200, y: 220, label: "Sec 140 (Merch)", type: "merch" },
};

// Help map flexible names back to standard keys
const resolveNodeKey = (name) => {
  if (!name) return null;
  const lower = name.toLowerCase();
  if (lower.includes("gate a")) return "gate-a";
  if (lower.includes("gate b")) return "gate-b";
  if (lower.includes("gate c")) return "gate-c";
  if (lower.includes("gate d")) return "gate-d";
  if (lower.includes("tacos") || lower.includes("108") || lower.includes("con-1")) return "con-1";
  if (lower.includes("burgers") || lower.includes("124") || lower.includes("con-2")) return "con-2";
  if (lower.includes("brews") || lower.includes("115") || lower.includes("con-3")) return "con-3";
  if (lower.includes("ice cream") || lower.includes("132") || lower.includes("con-4")) return "con-4";
  if (lower.includes("scarf") || lower.includes("jersey") || lower.includes("102") || lower.includes("con-5")) return "con-5";
  if (lower.includes("souvenirs") || lower.includes("140") || lower.includes("con-6")) return "con-6";
  return null;
};

export default function StadiumMap({ gates = [], concessions = [], activePath = [] }) {
  // Convert list of path strings to standard node keys
  const pathKeys = activePath
    .map(step => resolveNodeKey(step))
    .filter(key => key !== null);

  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case 'CLEAR': return '#00F299'; // Emerald
      case 'MODERATE': return '#FBBF24'; // Yellow
      case 'CROWDED': return '#EF4444'; // Red
      default: return '#94A3B8';
    }
  };

  return (
    <div className="glass-card" style={{ padding: '1rem', position: 'relative' }}>
      <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>Interactive Stadium Map</span>
        {pathKeys.length > 0 && (
          <span style={{ fontSize: '0.7rem', color: '#00F299', background: 'rgba(0, 242, 153, 0.1)', padding: '0.15rem 0.5rem', borderRadius: '9999px', border: '1px solid rgba(0, 242, 153, 0.2)' }}>
            Active Route Overlay
          </span>
        )}
      </h3>
      
      <div className="stadium-svg-container">
        <svg viewBox="0 0 400 300" className="stadium-svg">
          {/* Outer field layout */}
          <rect x="140" y="105" width="120" height="90" rx="10" fill="rgba(0, 242, 153, 0.04)" stroke="rgba(0, 242, 153, 0.15)" strokeWidth="2" />
          <ellipse cx="200" cy="150" rx="35" ry="25" fill="none" stroke="rgba(0, 242, 153, 0.1)" strokeWidth="1.5" />
          
          {/* Main Concourse Circular Corridor */}
          <ellipse cx="200" cy="150" rx="110" ry="80" fill="none" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="22" strokeLinecap="round" />
          <ellipse cx="200" cy="150" rx="110" ry="80" fill="none" stroke="rgba(255, 255, 255, 0.1)" strokeWidth="1.5" />

          {/* Active Navigation Route Line */}
          {pathKeys.length > 1 && (
            <path
              d={`M ${pathKeys.map(k => `${NODE_COORDINATES[k].x} ${NODE_COORDINATES[k].y}`).join(' L ')}`}
              fill="none"
              stroke="var(--secondary-violet)"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="map-path"
              style={{ filter: 'drop-shadow(0 0 6px var(--secondary-violet))' }}
            />
          )}

          {/* Draw all nodes */}
          {Object.entries(NODE_COORDINATES).map(([key, coord]) => {
            // Find wait time and status from parent data
            let status = 'CLEAR';
            let label = coord.label;
            
            if (coord.type === 'gate') {
              const g = gates.find(gate => gate.id === key);
              if (g) status = g.status;
            } else {
              const c = concessions.find(con => con.id === key);
              if (c) status = c.status;
            }

            const color = getStatusColor(status);
            const isPathNode = pathKeys.includes(key);

            return (
              <g key={key} className="map-node">
                {/* Node Outer Ring if on navigation path */}
                {isPathNode && (
                  <circle
                    cx={coord.x}
                    cy={coord.y}
                    r="12"
                    fill="none"
                    stroke="var(--secondary-violet)"
                    strokeWidth="2.5"
                    style={{ filter: 'drop-shadow(0 0 8px var(--secondary-violet))' }}
                  >
                    <animate attributeName="r" values="8;14;8" dur="2s" repeatCount="indefinite" />
                  </circle>
                )}

                {/* Node Dot */}
                <circle
                  cx={coord.x}
                  cy={coord.y}
                  r={coord.type === 'gate' ? '7' : '5'}
                  fill={isPathNode ? 'var(--secondary-violet)' : color}
                  stroke="rgba(0,0,0,0.5)"
                  strokeWidth="1.5"
                />

                {/* Label text */}
                <text
                  x={coord.x}
                  y={coord.y - 12}
                  textAnchor="middle"
                  fill="#E2E8F0"
                  fontSize="7.5"
                  fontWeight={isPathNode ? "800" : "500"}
                  style={{
                    backgroundColor: '#0F0F1A',
                    textShadow: '0 1px 3px rgba(0,0,0,0.9), 0 0 2px rgba(0,0,0,0.9)',
                    pointerEvents: 'none'
                  }}
                >
                  {label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '0.5rem' }}>
        <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.65rem', color: 'var(--text-secondary)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#00F299' }}></span> Clear
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#FBBF24' }}></span> Moderate
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#EF4444' }}></span> Crowded
          </span>
        </div>
        <div style={{ fontSize: '0.65rem', color: 'var(--secondary-violet)', fontWeight: 600 }}>
          ● Path Node
        </div>
      </div>
    </div>
  );
}
