const icons = {
  car: (
    <><path d="M5 17a2 2 0 1 0 4 0 2 2 0 0 0-4 0Zm10 0a2 2 0 1 0 4 0 2 2 0 0 0-4 0Z" /><path d="M3 17h-1v-6l2-5h12l2 5v6h-1M7 17h10" strokeLinejoin="round" /><path d="M5 12h14" /><path d="M4 7l1.5-3h13L20 7" strokeLinejoin="round" /></>
  ),
  search: (
    <><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></>
  ),
  calendar: (
    <><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /><path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01" /></>
  ),
  pin: (
    <><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="3" /></>
  ),
  fuel: (
    <><path d="M3 22V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v17" /><path d="M15 11h2a2 2 0 0 1 2 2v3a1.5 1.5 0 0 0 3 0V8l-4-3" /><path d="M3 22h12" /><path d="M7 7h6v4H7z" /></>
  ),
  clock: (
    <><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></>
  ),
  lock: (
    <><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></>
  ),
  check: (
    <><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><path d="M22 4 12 14.01l-3-3" /></>
  ),
  shield: (
    <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" /><path d="m9 12 2 2 4-4" /></>
  ),
  star: (
    <path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2Z" />
  ),
  bolt: (
    <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8Z" />
  ),
  leaf: (
    <><path d="M11 20A7 7 0 0 1 9.8 6.9C15.5 4.9 20 2 20 2s-2.9 4.5-4.9 10.1A7 7 0 0 1 11 20Z" /><path d="M2 21c0-3 1.85-5.36 5.08-6C10.33 14.3 13 13 13 13" /></>
  ),
  suv: (
    <><path d="M5 17a2 2 0 1 0 4 0 2 2 0 0 0-4 0Zm10 0a2 2 0 1 0 4 0 2 2 0 0 0-4 0Z" /><path d="M3 17h2m10 0h2m1 0h1v-4l-2-6H5L3 13v4h1" /><path d="M5 7V5h14v2" /><path d="M3 13h18" /></>
  ),
  premium: (
    <><path d="m2 8 4.29 4.46L12 2l5.71 10.46L22 8l-2 14H4L2 8Z" /></>
  ),
  van: (
    <><path d="M5 18a2 2 0 1 0 4 0 2 2 0 0 0-4 0Zm10 0a2 2 0 1 0 4 0 2 2 0 0 0-4 0Z" /><path d="M2 14V6a2 2 0 0 1 2-2h10v12M2 14h14" /><path d="M14 6h4l4 5v5h-2" /><path d="M2 18h3m10 0h7" /></>
  ),
  camera: (
    <><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3Z" /><circle cx="12" cy="13" r="3" /></>
  ),
  card: (
    <><rect x="1" y="4" width="22" height="16" rx="2" /><path d="M1 10h22" /><path d="M6 16h4" /></>
  ),
  money: (
    <><path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></>
  ),
  chart: (
    <><path d="M18 20V10M12 20V4M6 20v-6" /></>
  ),
  gear: (
    <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" /></>
  ),
  clipboard: (
    <><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /><rect x="8" y="2" width="8" height="4" rx="1" /></>
  ),
  bell: (
    <><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></>
  ),
  globe: (
    <><circle cx="12" cy="12" r="10" /><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10Z" /></>
  ),
  trash: (
    <><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></>
  ),
  user: (
    <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></>
  ),
  home: (
    <><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" /><path d="M9 22V12h6v10" /></>
  ),
  plus: (
    <><path d="M12 5v14M5 12h14" /></>
  ),
  logout: (
    <><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="m16 17 5-5-5-5M21 12H9" /></>
  ),
  login: (
    <><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" /><path d="m10 17 5-5-5-5M15 12H3" /></>
  ),
  heart: (
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78Z" />
  ),
  heartOutline: (
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78Z" />
  ),
  apple: (
    <><path d="M12 20.94c1.5 0 2.75 1.06 4 1.06 3 0 5-4 5-8s-2.24-4-4-4c-1.5 0-2.5 1-3 1h-4c-.5 0-1.5-1-3-1-1.76 0-4 0-4 4s2 8 5 8c1.25 0 2.5-1.06 4-1.06Z" /><path d="M10 2c1 .5 2 2 2 5" /></>
  ),
  play: (
    <polygon points="5,3 19,12 5,21" />
  ),
  filter: (
    <><path d="M4 6h16M6 12h12M8 18h8" /></>
  ),
  arrowLeft: (
    <><path d="m12 19-7-7 7-7M19 12H5" /></>
  ),
  arrowRight: (
    <><path d="m12 5 7 7-7 7M5 12h14" /></>
  ),
  info: (
    <><circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" /></>
  ),
  warning: (
    <><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" /><path d="M12 9v4M12 17h.01" /></>
  ),
  message: (
    <><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2Z" /></>
  ),
  mail: (
    <><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></>
  ),
  phone: (
    <><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92Z" /></>
  ),
  seats: (
    <><path d="M16 3h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h2" /><path d="M12 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" /></>
  ),
  transmission: (
    <><circle cx="6" cy="6" r="3" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="6" r="3" /><path d="M6 9v6M18 9v12M6 6h12" /></>
  ),
  qr: (
    <><rect x="2" y="2" width="8" height="8" rx="1" /><rect x="14" y="2" width="8" height="8" rx="1" /><rect x="2" y="14" width="8" height="8" rx="1" /><path d="M14 14h2v2h-2zM20 14h2v2h-2zM14 20h2v2h-2zM20 20h2v2h-2zM17 17h2v2h-2z" /></>
  ),
  active: (
    <circle cx="12" cy="12" r="6" />
  ),
  x: (
    <><path d="M18 6 6 18M6 6l12 12" /></>
  ),
};

export default function Icon({ name, size = 18, color = 'currentColor', fill = 'none', strokeWidth = 2, className = '', style = {} }) {
  const icon = icons[name];
  if (!icon) return null;

  const isFilled = ['star', 'heart', 'active', 'play'].includes(name);

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={isFilled ? color : fill}
      stroke={isFilled ? 'none' : color}
      strokeWidth={isFilled ? 0 : strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={{ flexShrink: 0, display: 'inline-block', verticalAlign: 'middle', ...style }}
    >
      {icon}
    </svg>
  );
}
