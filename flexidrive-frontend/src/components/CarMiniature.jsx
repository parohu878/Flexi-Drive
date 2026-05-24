export default function CarMiniature({ size = 'medium', color = '#9b4dca' }) {
  const sizes = {
    small:  { w: 120, h: 64 },
    medium: { w: 200, h: 106 },
    large:  { w: 320, h: 170 },
  };
  const { w, h } = sizes[size];
  const id = `car-card-${size}`;

  // Scale elements slightly based on size for the inner graphics
  const scale = size === 'small' ? 0.75 : size === 'medium' ? 0.9 : 1.25;
  const badgeRadius = size === 'small' ? 22 : size === 'medium' ? 28 : 36;
  const badgeY = size === 'small' ? 32 : size === 'medium' ? 48 : 72;
  const textY = size === 'small' ? 52 : size === 'medium' ? 88 : 134;

  return (
    <div style={{ width: w, height: h, position: 'relative', flexShrink: 0, borderRadius: size === 'small' ? 8 : 14, overflow: 'hidden' }}>
      <svg viewBox="0 0 320 170" xmlns="http://www.w3.org/2000/svg"
        style={{ width: '100%', height: '100%', display: 'block' }}>
        <defs>
          {/* Deep metallic gloss gradient for card background */}
          <linearGradient id={`cardBg-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1c1635" />
            <stop offset="50%" stopColor="#100b22" />
            <stop offset="100%" stopColor="#06040d" />
          </linearGradient>
          
          {/* Neon glow filter */}
          <filter id={`neonGlow-${id}`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Cyberpunk tech grid pattern */}
          <pattern id={`cardGrid-${id}`} width="14" height="14" patternUnits="userSpaceOnUse">
            <path d="M 14 0 L 0 0 0 14" fill="none" stroke="rgba(196, 125, 255, 0.04)" strokeWidth="0.8" />
          </pattern>

          {/* Badge radial glow */}
          <radialGradient id={`badgeGlow-${id}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Card base background */}
        <rect x="0" y="0" width="320" height="170" fill={`url(#cardBg-${id})`} />
        
        {/* Subtle grid pattern overlay */}
        <rect x="0" y="0" width="320" height="170" fill={`url(#cardGrid-${id})`} />

        {/* Metallic diagonal lines */}
        <path d="M-50 170 L120 -50 M0 220 L220 -20 M100 270 L320 50" stroke="rgba(255,255,255,0.015)" strokeWidth="8" strokeLinecap="round" />

        {/* Bottom neon light glow reflection */}
        <ellipse cx="160" cy="170" rx="110" ry="22" fill={color} opacity="0.2" filter={`url(#neonGlow-${id})`} />

        {/* Premium outer border with neon glow */}
        <rect x="4" y="4" width="312" height="162" rx="12" ry="12" fill="none" stroke={color} strokeWidth="1.5" opacity="0.35" filter={`url(#neonGlow-${id})`} />
        <rect x="4" y="4" width="312" height="162" rx="12" ry="12" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="0.5" />

        {/* Tech circular HUD ring */}
        {size !== 'small' && (
          <circle cx="160" cy={badgeY} r={badgeRadius + 8} fill="none" stroke={color} strokeWidth="0.8" strokeDasharray="3 6" opacity="0.3" />
        )}
        <circle cx="160" cy={badgeY} r={badgeRadius} fill={`url(#badgeGlow-${id})`} />
        <circle cx="160" cy={badgeY} r={badgeRadius - 3} fill="none" stroke={color} strokeWidth="1.2" opacity="0.6" />
        <circle cx="160" cy={badgeY} r={badgeRadius - 7} fill="rgba(12, 10, 20, 0.85)" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />

        {/* Sleek sports car icon inside HUD circle */}
        <g transform={`translate(${160 - 12 * scale}, ${badgeY - 7.5 * scale}) scale(${scale})`} stroke={color} strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" filter={`url(#neonGlow-${id})`}>
          <path d="M2 13h2a2.5 2.5 0 0 1 5 0h6a2.5 2.5 0 0 1 5 0h2" />
          <path d="M2 13v-2.5c0-.8.5-1.5 1.2-1.8l3.3-1.4A3 3 0 0 1 9.8 7H14.2a3 3 0 0 1 2.1.8l3.3 1.4c.7.3 1.2 1 1.2 1.8V13" />
          <path d="M12 7v6" opacity="0.5" strokeWidth="1.2" />
          <circle cx="6.5" cy="13" r="2.5" />
          <circle cx="6.5" cy="13" r="0.8" fill={color} stroke="none" />
          <circle cx="17.5" cy="13" r="2.5" />
          <circle cx="17.5" cy="13" r="0.8" fill={color} stroke="none" />
        </g>

        {/* Text branding "FLEXIDRIVE" at the bottom */}
        {size !== 'small' && (
          <>
            <text x="160" y={textY} fill="#ffffff" fontFamily="Orbitron, sans-serif" fontSize="11" fontWeight="700" letterSpacing="4" textAnchor="middle" opacity="0.9">FLEXIDRIVE</text>
            <text x="160" y={textY + 12} fill={color} fontFamily="Rajdhani, sans-serif" fontSize="8" fontWeight="600" letterSpacing="2.5" textAnchor="middle" opacity="0.75">GARAGE SELECTION</text>
          </>
        )}
      </svg>
    </div>
  );
}
