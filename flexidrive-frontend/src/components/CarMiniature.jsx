export default function CarMiniature({ size = 'medium', color = '#9b4dca' }) {
  const sizes = {
    small:  { w: 120, h: 64 },
    medium: { w: 200, h: 106 },
    large:  { w: 320, h: 170 },
  };
  const { w, h } = sizes[size];
  const id = `car-${size}`;

  return (
    <div style={{ width: w, height: h, position: 'relative', flexShrink: 0 }}>
      <svg viewBox="0 0 320 170" xmlns="http://www.w3.org/2000/svg"
        style={{ width: '100%', height: '100%', overflow: 'visible' }}>
        <defs>
          {/* Body gradient */}
          <linearGradient id={`body-${id}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#2a1f42" />
            <stop offset="55%" stopColor="#16102a" />
            <stop offset="100%" stopColor="#0d0918" />
          </linearGradient>
          {/* Roof gradient */}
          <linearGradient id={`roof-${id}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1e1635" />
            <stop offset="100%" stopColor="#130e22" />
          </linearGradient>
          {/* Window gradient */}
          <linearGradient id={`win-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0.25" />
            <stop offset="100%" stopColor="#e040fb" stopOpacity="0.08" />
          </linearGradient>
          {/* Ground glow */}
          <radialGradient id={`glow-${id}`} cx="50%" cy="100%" r="50%">
            <stop offset="0%" stopColor={color} stopOpacity="0.4" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </radialGradient>
          {/* Neon strip */}
          <linearGradient id={`neon-${id}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="35%" stopColor={color} />
            <stop offset="65%" stopColor="#e040fb" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
          {/* Headlight glow */}
          <radialGradient id={`hl-${id}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
            <stop offset="60%" stopColor="#c8a0ff" stopOpacity="0.6" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </radialGradient>
          {/* Tail light */}
          <radialGradient id={`tl-${id}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ff2060" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#ff2060" stopOpacity="0" />
          </radialGradient>
          <filter id={`soft-${id}`}>
            <feGaussianBlur stdDeviation="2.5" />
          </filter>
          <filter id={`hblur-${id}`}>
            <feGaussianBlur stdDeviation="4" />
          </filter>
        </defs>

        {/* ── Ground shadow ── */}
        <ellipse cx="160" cy="162" rx="140" ry="10"
          fill={`url(#glow-${id})`} opacity="0.7" />

        {/* ── Wheels (behind body) ── */}
        {/* Rear wheel */}
        <circle cx="85" cy="148" r="22" fill="#070510" stroke="rgba(155,77,202,0.4)" strokeWidth="2" />
        <circle cx="85" cy="148" r="14" fill="#0f0c1e" stroke="rgba(155,77,202,0.25)" strokeWidth="1.5" />
        {/* Rim spokes */}
        {[0,60,120,180,240,300].map(a => (
          <line key={a}
            x1={85 + 6*Math.cos(a*Math.PI/180)}
            y1={148 + 6*Math.sin(a*Math.PI/180)}
            x2={85 + 13*Math.cos(a*Math.PI/180)}
            y2={148 + 13*Math.sin(a*Math.PI/180)}
            stroke={color} strokeWidth="1.5" strokeOpacity="0.6" strokeLinecap="round" />
        ))}
        <circle cx="85" cy="148" r="4" fill={color} opacity="0.7" />

        {/* Front wheel */}
        <circle cx="240" cy="148" r="22" fill="#070510" stroke="rgba(155,77,202,0.4)" strokeWidth="2" />
        <circle cx="240" cy="148" r="14" fill="#0f0c1e" stroke="rgba(155,77,202,0.25)" strokeWidth="1.5" />
        {[0,60,120,180,240,300].map(a => (
          <line key={a}
            x1={240 + 6*Math.cos(a*Math.PI/180)}
            y1={148 + 6*Math.sin(a*Math.PI/180)}
            x2={240 + 13*Math.cos(a*Math.PI/180)}
            y2={148 + 13*Math.sin(a*Math.PI/180)}
            stroke={color} strokeWidth="1.5" strokeOpacity="0.6" strokeLinecap="round" />
        ))}
        <circle cx="240" cy="148" r="4" fill={color} opacity="0.7" />

        {/* ── Main car body ── */}
        {/*  Low-profile sports sedan silhouette  */}
        <path
          d="M 20 132
             L 20 128
             Q 22 115 35 112
             L 55 112
             Q 62 90 80 78
             L 105 70
             Q 125 62 145 60
             L 195 60
             Q 218 62 232 72
             L 255 85
             Q 265 90 270 98
             L 285 112
             Q 300 115 302 128
             L 302 132
             Q 302 140 295 142
             L 250 144   Q 240 130 240 126
             Q 240 112 248 108
             L 115 108
             Q 122 112 122 126
             Q 122 130 112 144
             L 68 144   Q 58 130 58 126
             Q 58 112 66 108
             L 50 110
             Q 30 112 26 128
             L 26 132
             Q 22 140 20 132 Z"
          fill={`url(#body-${id})`}
          stroke="rgba(155,77,202,0.2)"
          strokeWidth="0.8"
        />

        {/* ── Roof / cabin ── */}
        <path
          d="M 108 108
             L 105 70
             Q 125 62 145 60
             L 195 60
             Q 218 62 232 72
             L 230 108 Z"
          fill={`url(#roof-${id})`}
          stroke="rgba(155,77,202,0.15)"
          strokeWidth="0.5"
        />

        {/* ── Windshield (front) ── */}
        <path
          d="M 195 60 Q 218 62 232 72 L 228 108 L 200 108 L 196 62 Z"
          fill={`url(#win-${id})`}
          stroke="rgba(155,77,202,0.3)"
          strokeWidth="0.6"
        />
        {/* windshield glare */}
        <path d="M 205 64 Q 220 68 226 78" stroke="rgba(255,255,255,0.12)" strokeWidth="2" fill="none" strokeLinecap="round" />

        {/* ── Rear window ── */}
        <path
          d="M 108 108 L 112 62 L 145 60 L 145 108 Z"
          fill={`url(#win-${id})`}
          stroke="rgba(155,77,202,0.25)"
          strokeWidth="0.6"
        />

        {/* ── Side windows (middle) ── */}
        <path
          d="M 145 60 L 196 60 L 200 108 L 145 108 Z"
          fill={`url(#win-${id})`}
          stroke="rgba(155,77,202,0.2)"
          strokeWidth="0.5"
          opacity="0.8"
        />
        {/* window glare */}
        <path d="M 150 63 L 192 63" stroke="rgba(255,255,255,0.07)" strokeWidth="1.5" fill="none" strokeLinecap="round" />

        {/* ── Door panel lines ── */}
        <line x1="145" y1="108" x2="145" y2="142" stroke="rgba(155,77,202,0.12)" strokeWidth="1" />
        <line x1="200" y1="108" x2="200" y2="142" stroke="rgba(155,77,202,0.10)" strokeWidth="1" />

        {/* ── Door handle (front) ── */}
        <rect x="208" y="120" width="18" height="4" rx="2"
          fill="rgba(155,77,202,0.3)" stroke="rgba(155,77,202,0.4)" strokeWidth="0.5" />
        {/* ── Door handle (rear) ── */}
        <rect x="152" y="120" width="18" height="4" rx="2"
          fill="rgba(155,77,202,0.3)" stroke="rgba(155,77,202,0.4)" strokeWidth="0.5" />

        {/* ── Side skirt ── */}
        <path
          d="M 68 142 L 112 142 L 112 148 L 68 148 Z"
          fill="rgba(155,77,202,0.08)"
          stroke="rgba(155,77,202,0.15)"
          strokeWidth="0.5"
        />
        <path
          d="M 248 142 L 290 142 L 290 148 L 248 148 Z"
          fill="rgba(155,77,202,0.08)"
          stroke="rgba(155,77,202,0.15)"
          strokeWidth="0.5"
        />

        {/* ── Front bumper / diffuser ── */}
        <path
          d="M 282 128 Q 302 128 302 132 L 298 140 Q 295 144 288 144 L 268 144"
          fill="rgba(10,7,20,0.9)"
          stroke="rgba(155,77,202,0.2)"
          strokeWidth="0.7"
        />
        {/* Front air intakes */}
        <rect x="290" y="130" width="8" height="3" rx="1" fill="rgba(155,77,202,0.15)" stroke="rgba(155,77,202,0.25)" strokeWidth="0.5" />

        {/* ── Headlight (front right) ── */}
        {/* Glow halo */}
        <ellipse cx="290" cy="122" rx="20" ry="8" fill={`url(#hl-${id})`} filter={`url(#hblur-${id})`} opacity="0.6">
          <animate attributeName="opacity" values="0.4;0.8;0.4" dur="3s" repeatCount="indefinite" />
        </ellipse>
        {/* LED strip */}
        <path d="M 278 118 Q 293 115 300 122" stroke="rgba(255,255,255,0.9)" strokeWidth="2" fill="none" strokeLinecap="round">
          <animate attributeName="opacity" values="0.6;1;0.6" dur="3s" repeatCount="indefinite" />
        </path>
        {/* DRL */}
        <path d="M 282 124 Q 294 122 300 127" stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.8">
          <animate attributeName="opacity" values="0.5;1;0.5" dur="2.5s" repeatCount="indefinite" />
        </path>

        {/* ── Tail light (rear left) ── */}
        <ellipse cx="28" cy="122" rx="14" ry="6" fill={`url(#tl-${id})`} filter={`url(#hblur-${id})`} opacity="0.5">
          <animate attributeName="opacity" values="0.3;0.7;0.3" dur="2.8s" repeatCount="indefinite" />
        </ellipse>
        {/* LED tail strip */}
        <path d="M 22 118 Q 28 115 36 118" stroke="#ff3070" strokeWidth="2" fill="none" strokeLinecap="round">
          <animate attributeName="opacity" values="0.5;1;0.5" dur="2.8s" repeatCount="indefinite" />
        </path>

        {/* ── Neon underglow strip ── */}
        <rect x="68" y="146" width="182" height="2.5" rx="1.2"
          fill={`url(#neon-${id})`}
          filter={`url(#soft-${id})`}
          opacity="0.8">
          <animate attributeName="opacity" values="0.4;1;0.4" dur="2s" repeatCount="indefinite" />
        </rect>

        {/* ── Roof antenna ── */}
        <line x1="170" y1="60" x2="170" y2="52" stroke="rgba(155,77,202,0.4)" strokeWidth="1" strokeLinecap="round" />

        {/* ── Side mirror ── */}
        <path d="M 270 98 L 278 94 L 282 100 L 272 102 Z"
          fill="#1a1230" stroke="rgba(155,77,202,0.25)" strokeWidth="0.6" />
      </svg>
    </div>
  );
}
