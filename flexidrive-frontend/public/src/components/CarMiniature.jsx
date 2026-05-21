export default function CarMiniature({ size = 'medium', color = '#9b4dca' }) {
  const sizes = {
    small:  { w: 120, h: 70 },
    medium: { w: 200, h: 120 },
    large:  { w: 320, h: 190 },
  };
  const { w, h } = sizes[size];

  return (
    <div style={{ width: w, height: h, position: 'relative', flexShrink: 0 }}>
      <svg viewBox="0 0 320 190" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
        <defs>
          <radialGradient id={`carGlow-${size}`} cx="50%" cy="100%" r="60%">
            <stop offset="0%" stopColor={color} stopOpacity="0.35" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </radialGradient>
          <linearGradient id={`bodyGrad-${size}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1a1530" />
            <stop offset="100%" stopColor="#0d0a18" />
          </linearGradient>
          <linearGradient id={`neonGrad-${size}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="40%" stopColor={color} />
            <stop offset="60%" stopColor="#e040fb" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
          <filter id={`blur-${size}`}>
            <feGaussianBlur stdDeviation="3" />
          </filter>
          <filter id={`glow-${size}`}>
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Ground glow */}
        <ellipse cx="160" cy="185" rx="130" ry="12" fill={`url(#carGlow-${size})`} />

        {/* Body */}
        <path
          d="M 30 140 Q 30 120 50 115 L 80 75 Q 95 55 130 50 L 190 50 Q 225 55 240 75 L 270 115 Q 290 120 290 140 L 290 155 Q 290 165 280 165 L 40 165 Q 30 165 30 155 Z"
          fill={`url(#bodyGrad-${size})`}
          stroke="rgba(155,77,202,0.2)"
          strokeWidth="0.5"
        />

        {/* Windshield */}
        <path
          d="M 100 115 L 120 68 Q 130 56 145 53 L 175 53 Q 190 56 200 68 L 220 115 Z"
          fill="rgba(155,77,202,0.15)"
          stroke="rgba(155,77,202,0.3)"
          strokeWidth="0.5"
        />
        <path
          d="M 105 112 L 123 70 Q 132 59 146 56 L 174 56 Q 188 59 197 70 L 215 112 Z"
          fill="rgba(100,50,180,0.12)"
        />

        {/* Door lines */}
        <line x1="160" y1="115" x2="160" y2="160" stroke="rgba(155,77,202,0.12)" strokeWidth="1" />
        <line x1="115" y1="115" x2="105" y2="162" stroke="rgba(155,77,202,0.1)" strokeWidth="0.8" />
        <line x1="205" y1="115" x2="215" y2="162" stroke="rgba(155,77,202,0.1)" strokeWidth="0.8" />

        {/* Wheels */}
        <circle cx="82" cy="162" r="20" fill="#050408" stroke="rgba(155,77,202,0.3)" strokeWidth="1.5" />
        <circle cx="82" cy="162" r="12" fill="#0d0918" stroke="rgba(155,77,202,0.2)" strokeWidth="1" />
        <circle cx="82" cy="162" r="5" fill={color} opacity="0.5" />

        <circle cx="238" cy="162" r="20" fill="#050408" stroke="rgba(155,77,202,0.3)" strokeWidth="1.5" />
        <circle cx="238" cy="162" r="12" fill="#0d0918" stroke="rgba(155,77,202,0.2)" strokeWidth="1" />
        <circle cx="238" cy="162" r="5" fill={color} opacity="0.5" />

        {/* Neon underline */}
        <rect x="40" y="158" width="240" height="3" rx="2" fill={`url(#neonGrad-${size})`} filter={`url(#blur-${size})`} opacity="0.85">
          <animate attributeName="opacity" values="0.45;1;0.45" dur="2s" repeatCount="indefinite" />
        </rect>

        {/* Headlights */}
        <ellipse cx="53" cy="138" rx="12" ry="5" fill="rgba(255,255,255,0.85)" filter={`url(#blur-${size})`}>
          <animate attributeName="opacity" values="0.45;1;0.45" dur="2s" repeatCount="indefinite" />
        </ellipse>
        <ellipse cx="267" cy="138" rx="12" ry="5" fill="rgba(255,255,255,0.85)" filter={`url(#blur-${size})`}>
          <animate attributeName="opacity" values="0.45;1;0.45" dur="2s" repeatCount="indefinite" />
        </ellipse>

        {/* Roof shine */}
        <path
          d="M 125 58 Q 160 52 195 58"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
